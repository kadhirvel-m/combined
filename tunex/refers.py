# main.py
import os
import json
from typing import List, Dict

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from serpapi import GoogleSearch

from autogen_ext.models.openai import OpenAIChatCompletionClient
from autogen_agentchat.agents import AssistantAgent
from autogen_core.tools import FunctionTool

load_dotenv()

app = FastAPI(title="Tool Offers API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_tool_offers(query: str, n: int = 5) -> List[Dict[str, str]]:
    key = os.getenv("SERPAPI_API_KEY")
    if not key:
        raise RuntimeError("Set SERPAPI_API_KEY")
    q = f"{query} student offers OR education discount OR free plan OR professional pricing tools"
    params = {"engine": "google", "q": q, "num": max(n, 10), "hl": "en", "api_key": key}
    res = GoogleSearch(params).get_dict() or {}
    items = (res.get("organic_results") or [])[:n]
    out: List[Dict[str, str]] = []
    for o in items:
        out.append(
            {
                "title": (o.get("title") or "").strip(),
                "link": (o.get("link") or "").strip(),
                "snippet": (o.get("snippet") or "").strip(),
            }
        )
    return out

search_tool = FunctionTool(
    get_tool_offers,
    description="Extract the useful tools related to the user's project (free plans, student offers, or professional discounts).",
)

model_client = OpenAIChatCompletionClient(
    model=os.environ.get("LLM_MODEL", "gpt-4o-mini"),
    api_key=os.environ.get("OPENAI_API_KEY", ""),
)

search_agent = AssistantAgent(
    name="search_agent",
    model_client=model_client,
    description="Finds tools for both students and working professionals for their projects.",
    tools=[search_tool],
    system_message=(
        "You are an assistant that helps users discover tools with free plans, student offers, or professional discounts.\n"
        "When a user provides a project description, call the function get_tool_offers with the description as the query.\n"
        "Return only the top 5 results in JSON format as a LIST of objects with fields: title, link, snippet.\n"
        "Do not add any text outside the JSON."
    ),
)

class QueryIn(BaseModel):
    query: str

class ResultsOut(BaseModel):
    results: List[Dict[str, str]]

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/search", response_model=ResultsOut)
async def search_tools(body: QueryIn):
    query = (body.query or "").strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query is required")

    results: List[Dict[str, str]] = []
    try:
        convo = await search_agent.run(task=query)
        content = getattr(convo.messages[-1], "content", "") if getattr(convo, "messages", None) else ""
        try:
            data = json.loads(content)
            if isinstance(data, list):
                results = data
            elif isinstance(data, dict) and isinstance(data.get("results"), list):
                results = data["results"]
        except Exception:
            results = get_tool_offers(query, n=5)
    except Exception:
        results = get_tool_offers(query, n=5)

    results = [
        {
            "title": (item.get("title") or "").strip(),
            "link": (item.get("link") or "").strip(),
            "snippet": (item.get("snippet") or "").strip(),
        }
        for item in (results or [])[:5]
        if (item.get("title") and item.get("link"))
    ]

    if not results:
        results = get_tool_offers(query, n=5)

    return {"results": results}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")), reload=True)




from __future__ import annotations

import os
import re
import math
import time
import json
from typing import List, Dict, Any, Optional, Set, Iterable
from urllib.parse import urlparse

import requests

# ---------------------------------------------------------------------
# ENV & CONSTANTS
# ---------------------------------------------------------------------

SERPAPI_API_KEY = os.getenv("SERPAPI_API_KEY")
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

SERPAPI_ENDPOINT = "https://serpapi.com/search.json"
YOUTUBE_SEARCH   = "https://www.googleapis.com/youtube/v3/search"
YOUTUBE_VIDEOS   = "https://www.googleapis.com/youtube/v3/videos"


# ---------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------

def _require_serpapi():
    if not SERPAPI_API_KEY:
        raise RuntimeError("Missing SERPAPI_API_KEY environment variable.")

def _require_youtube():
    if not YOUTUBE_API_KEY:
        raise RuntimeError("Missing YOUTUBE_API_KEY environment variable.")

def _safe_int(x: Optional[str]) -> Optional[int]:
    try:
        return int(x)  # may raise ValueError/TypeError
    except Exception:
        return None

def _norm(s: str) -> str:
    return re.sub(r"\s+", " ", (s or "").strip().lower())

def _skill_in_text(text: str, skill: str) -> bool:
    """Word-boundary match for single-token skills; substring for multi-word skills."""
    t = _norm(text)
    s = _norm(skill)
    if not s:
        return False
    if " " in s:
        return s in t
    return re.search(rf"\b{re.escape(s)}\b", t) is not None

def _chunks(lst: List[Any], n: int) -> Iterable[List[Any]]:
    for i in range(0, len(lst), n):
        yield lst[i:i+n]

def _domain_as_channel(url: Optional[str]) -> Optional[str]:
    if not url:
        return None
    try:
        host = urlparse(url).netloc or ""
        return host.replace("www.", "") if host else None
    except Exception:
        return None

def _rank_tiebreak_key(cand: Dict[str, Any]) -> int:
    """Lower is better; falls back to a large number if undefined."""
    try:
        return int(cand.get("_rank", 10_000))
    except Exception:
        return 10_000

def _greedy_cover_from_candidates(
    candidates: List[Dict[str, Any]],
    norm_to_orig: Dict[str, str],
    item_key: str = "item",
    tie_key_func=_rank_tiebreak_key,
) -> List[Dict[str, Any]]:
    """
    Generic greedy set cover over 'candidates', each carrying:
      {
        "_rank": int (lower = better),
        "matched_norm": [normalized skills it covers],
        # plus display fields (title/url/channel_title/published_at/thumbnail/views)
      }

    Returns selection list with shape:
      [{ "group_skills": [...], item_key: {...} }, ...]
    """
    if not candidates:
        return []

    # sort once for stable tiebreaks
    items_sorted = sorted(candidates, key=tie_key_func)

    uncovered: Set[str] = set(norm_to_orig.keys())
    selected: List[Dict[str, Any]] = []

    while uncovered:
        best = None
        best_new = 0
        best_tie = 10_000

        for cand in items_sorted:
            matched_norm = cand.get("matched_norm") or []
            new_cover = uncovered.intersection(matched_norm)
            c = len(new_cover)
            if c > best_new or (c == best_new and tie_key_func(cand) < best_tie):
                if c > 0:
                    best = (cand, list(new_cover))
                    best_new = c
                    best_tie = tie_key_func(cand)

        if not best:
            break

        cand, new_cover_norm = best
        group_skills = [norm_to_orig[n] for n in sorted(new_cover_norm, key=str.lower)]
        payload = {
            "title":         cand.get("title"),
            "url":           cand.get("url"),
            "channel_title": cand.get("channel_title"),
            "views":         cand.get("views"),         # None for blogs/news
            "published_at":  cand.get("published_at"),
            "thumbnail":     cand.get("thumbnail"),
        }
        selected.append({"group_skills": group_skills, item_key: payload})

        # mark covered and remove candidate
        uncovered.difference_update(new_cover_norm)
        items_sorted.remove(cand)

    # fallback for any remaining skills: pick top-ranked candidate containing it
    if uncovered:
        for nsk in list(uncovered):
            cands = [c for c in items_sorted if nsk in (c.get("matched_norm") or [])]
            if not cands:
                continue
            cands.sort(key=tie_key_func)
            best = cands[0]
            payload = {
                "title":         best.get("title"),
                "url":           best.get("url"),
                "channel_title": best.get("channel_title"),
                "views":         best.get("views"),
                "published_at":  best.get("published_at"),
                "thumbnail":     best.get("thumbnail"),
            }
            selected.append({"group_skills": [norm_to_orig[nsk]], item_key: payload})
            uncovered.discard(nsk)

    return selected


# ---------------------------------------------------------------------
# BLOGS (SerpAPI Google) - Greedy cover
# ---------------------------------------------------------------------

def fetch_blogs_grouped_cover(
    skills: List[str],
    search_per_skill: int = 20,
    language: str = "en",   # hl
    country: str = "in",    # gl
    site_bias: Optional[str] = (
        'site:freecodecamp.org OR site:dev.to OR site:hashnode.com OR '
        'site:medium.com OR site:towardsdatascience.com'
    ),
    include_snippet: bool = True,
) -> List[Dict[str, Any]]:
    """
    Greedy grouping of BLOG POSTS to cover given skills with minimal items using SerpAPI Google.
    Tie-break rule uses SerpAPI rank (_rank).

    Returns: list of selections with key "item".
    """
    _require_serpapi()

    skills = [s for s in (skills or []) if s and s.strip()]
    if not skills:
        return []

    norm_to_orig = { _norm(s): s for s in skills }
    norm_skills  = list(norm_to_orig.keys())

    candidates: List[Dict[str, Any]] = []

    for skill in skills:
        # Build query
        q_core = f'{skill} tutorial OR "how to"'
        q = f"{q_core} {site_bias}" if site_bias else q_core

        resp = requests.get(
            SERPAPI_ENDPOINT,
            params={
                "engine": "google",
                "q": q,
                "num": max(10, min(50, search_per_skill)),
                "api_key": SERPAPI_API_KEY,
                "hl": language,
                "gl": country,
            },
            timeout=20,
        )

        if resp.status_code != 200:
            continue

        organic = resp.json().get("organic_results", [])[:search_per_skill]
        for rank, o in enumerate(organic, start=1):
            title = (o.get("title") or "").strip()
            url   = o.get("link")
            if not url:
                continue
            snippet = (o.get("snippet") or "") if include_snippet else ""
            text = f"{title}\n{snippet}"
            matched_norm = [nsk for nsk in norm_skills if _skill_in_text(text, nsk)]
            if not matched_norm:
                continue

            candidates.append({
                "_rank": rank,  # tie-breaker
                "title": title,
                "url": url,
                "channel_title": _domain_as_channel(url) or (o.get("source") or o.get("displayed_link")),
                "published_at": o.get("date"),   # may be relative like "2 days ago"
                "thumbnail": None,               # blogs rarely have reliable thumbs from SerpAPI
                "views": None,                   # schema parity
                "matched_norm": matched_norm,
            })

    return _greedy_cover_from_candidates(
        candidates=candidates,
        norm_to_orig=norm_to_orig,
        item_key="item",
        tie_key_func=_rank_tiebreak_key
    )


# ---------------------------------------------------------------------
# NEWS (SerpAPI Google News) - Greedy cover
# ---------------------------------------------------------------------

def fetch_news_grouped_cover(
    skills: List[str],
    search_per_skill: int = 20,
    language: str = "en",  # hl
    country: str = "in",   # gl
    include_snippet: bool = True,
) -> List[Dict[str, Any]]:
    """
    Greedy grouping of NEWS items to cover given skills with minimal items using SerpAPI Google News.
    Tie-break rule uses SerpAPI rank (_rank).

    Returns: list of selections with key "item".
    """
    _require_serpapi()

    skills = [s for s in (skills or []) if s and s.strip()]
    if not skills:
        return []

    norm_to_orig = { _norm(s): s for s in skills }
    norm_skills  = list(norm_to_orig.keys())

    candidates: List[Dict[str, Any]] = []

    for skill in skills:
        resp = requests.get(
            SERPAPI_ENDPOINT,
            params={
                "engine": "google_news",
                "q": f"{skill} tutorial OR course OR learning",
                "api_key": SERPAPI_API_KEY,
                "hl": language,
                "gl": country,
            },
            timeout=20,
        )

        if resp.status_code != 200:
            continue

        news_results = resp.json().get("news_results", [])[:search_per_skill]
        for rank, n in enumerate(news_results, start=1):
            title = (n.get("title") or "").strip()
            url   = n.get("link")
            if not url:
                continue

            snippet = ""
            if include_snippet:
                snippet = n.get("snippet") or n.get("content") or ""

            # Thumbnail may be dict or str
            tn = n.get("thumbnail")
            if isinstance(tn, dict):
                thumb = tn.get("static") or tn.get("original")
            elif isinstance(tn, str):
                thumb = tn
            else:
                thumb = None

            text = f"{title}\n{snippet}"
            matched_norm = [nsk for nsk in norm_skills if _skill_in_text(text, nsk)]
            if not matched_norm:
                continue

            candidates.append({
                "_rank": rank,  # tie-breaker
                "title": title,
                "url": url,
                "channel_title": (n.get("source") or {}).get("name") or _domain_as_channel(url),
                "published_at": n.get("date"),  # may be relative
                "thumbnail": thumb,
                "views": None,                  # schema parity
                "matched_norm": matched_norm,
            })

    return _greedy_cover_from_candidates(
        candidates=candidates,
        norm_to_orig=norm_to_orig,
        item_key="item",
        tie_key_func=_rank_tiebreak_key
    )


# ---------------------------------------------------------------------
# YOUTUBE (YouTube Data API v3) - Greedy cover [optional]
# ---------------------------------------------------------------------

def fetch_youtube_grouped_cover(
    skills: List[str],
    search_per_skill: int = 15,
    region_code: str = "IN",
    relevance_language: str = "en",
    min_views: int = 0,               # filter low-view videos if desired
) -> List[Dict[str, Any]]:

    """
    Greedy grouping of YouTube videos to cover given skills with minimal videos.
    Tie-break rule uses views (desc). Returns selections with key "video".
    """
    _require_youtube()

    skills = [s for s in (skills or []) if s and s.strip()]
    if not skills:
        return []

    norm_to_orig = { _norm(s): s for s in skills }
    norm_skills  = list(norm_to_orig.keys())

    # 1) search per skill -> candidate ids
    candidate_ids: List[str] = []
    for orig in skills:
        q = f'"{orig}" tutorial OR course'
        s = requests.get(
            YOUTUBE_SEARCH,
            params={
                "key": YOUTUBE_API_KEY,
                "part": "snippet",
                "q": q,
                "type": "video",
                "order": "viewCount",
                "maxResults": max(5, min(50, search_per_skill)),
                "regionCode": region_code,
                "relevanceLanguage": relevance_language,
                "safeSearch": "moderate",
            },
            timeout=20,
        )
        if s.status_code != 200:
            continue
        ids = [it.get("id", {}).get("videoId") for it in s.json().get("items", [])]
        for vid in filter(None, ids):
            candidate_ids.append(vid)

    # dedup while preserving order
    seen: Set[str] = set()
    dedup_ids: List[str] = []
    for vid in candidate_ids:
        if vid not in seen:
            seen.add(vid)
            dedup_ids.append(vid)
    if not dedup_ids:
        return []

    # 2) fetch details/stats
    candidates: List[Dict[str, Any]] = []
    for batch in _chunks(dedup_ids, 50):
        v = requests.get(
            YOUTUBE_VIDEOS,
            params={"key": YOUTUBE_API_KEY, "part": "snippet,statistics", "id": ",".join(batch)},
            timeout=20,
        )
        if v.status_code != 200:
            continue

        for it in v.json().get("items", []):
            sn = it.get("snippet", {}) or {}
            st = it.get("statistics", {}) or {}

            title = sn.get("title", "") or ""
            desc  = sn.get("description", "") or ""
            text  = f"{title}\n{desc}"
            view_count = _safe_int(st.get("viewCount")) or 0
            if view_count < min_views:
                continue

            matched_norm = [nsk for nsk in norm_skills if _skill_in_text(text, nsk)]
            if not matched_norm:
                continue

            thumb = (sn.get("thumbnails", {}) or {}).get("medium", {}) or {}
            candidates.append({
                # We invert views for tie-breaker (lower is better in _rank_tiebreak_key),
                # but instead of hijacking _rank, we'll sort separately later.
                "title": title,
                "url": f"https://www.youtube.com/watch?v={it.get('id')}",
                "channel_title": sn.get("channelTitle"),
                "views": view_count,
                "published_at": sn.get("publishedAt"),
                "thumbnail": thumb.get("url"),
                "matched_norm": matched_norm,
            })

    if not candidates:
        return []

    # For YouTube, tie-break by views DESC and then recency by published_at if needed.
    # We'll supply a custom tie-break function that uses -views to fit "lower is better".
    def _yt_tie_key(c: Dict[str, Any]) -> int:
        v = c.get("views")
        try:
            return -int(v) if v is not None else 0
        except Exception:
            return 0

    # Reuse greedy engine but rename item_key to "video"
    selections = _greedy_cover_from_candidates(
        candidates=sorted(candidates, key=_yt_tie_key),  # pre-sort for stable ties
        norm_to_orig=norm_to_orig,
        item_key="video",
        tie_key_func=_yt_tie_key
    )
    return selections


# ---------------------------------------------------------------------
# Demo / Manual test
# ---------------------------------------------------------------------


# ---- Models ----
class CoverRequest(BaseModel):
    skills: List[str] = Field(..., example=["Python", "Machine Learning", "Deep Learning", "Pandas"])
    search_per_skill: int = Field(20, ge=5, le=50)
    language: str = "en"
    country: str = "in"
    include_snippet: bool = True
    region_code: Optional[str] = "IN"         # for YouTube
    relevance_language: Optional[str] = "en"  # for YouTube
    min_views: int = 0                        # for YouTube
    # optional blog site bias override
    site_bias: Optional[str] = (
        'site:freecodecamp.org OR site:dev.to OR site:hashnode.com OR '
        'site:medium.com OR site:towardsdatascience.com'
    )

class AllCoverResponse(BaseModel):
    blogs: List[Dict[str, Any]]
    news: List[Dict[str, Any]]
    youtube: List[Dict[str, Any]]

# ---- Endpoints ----
@app.post("/cover/blogs")
def cover_blogs(req: CoverRequest):
    try:
        return fetch_blogs_grouped_cover(
            skills=req.skills,
            search_per_skill=req.search_per_skill,
            language=req.language,
            country=req.country,
            site_bias=req.site_bias,
            include_snippet=req.include_snippet,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/cover/news")
def cover_news(req: CoverRequest):
    try:
        return fetch_news_grouped_cover(
            skills=req.skills,
            search_per_skill=req.search_per_skill,
            language=req.language,
            country=req.country,
            include_snippet=req.include_snippet,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/cover/youtube")
def cover_youtube(req: CoverRequest):
    try:
        return fetch_youtube_grouped_cover(
            skills=req.skills,
            search_per_skill=req.search_per_skill,
            region_code=req.region_code or "IN",
            relevance_language=req.relevance_language or "en",
            min_views=req.min_views,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/cover/all", response_model=AllCoverResponse)
def cover_all(req: CoverRequest):
    try:
        blogs = fetch_blogs_grouped_cover(
            skills=req.skills,
            search_per_skill=req.search_per_skill,
            language=req.language,
            country=req.country,
            site_bias=req.site_bias,
            include_snippet=req.include_snippet,
        )
        news = fetch_news_grouped_cover(
            skills=req.skills,
            search_per_skill=req.search_per_skill,
            language=req.language,
            country=req.country,
            include_snippet=req.include_snippet,
        )
        try:
            youtube = fetch_youtube_grouped_cover(
                skills=req.skills,
                search_per_skill=req.search_per_skill,
                region_code=req.region_code or "IN",
                relevance_language=req.relevance_language or "en",
                min_views=req.min_views,
            )
        except Exception as yt_err:
            # YouTube key missing or quota; return empty list but keep blogs/news
            print(f"[YouTube warn] {yt_err}")
            youtube = []
        return {"blogs": blogs, "news": news, "youtube": youtube}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))