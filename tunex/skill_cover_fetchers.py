

from __future__ import annotations

import os
import re
import math
import time
import json
import functools
from concurrent.futures import ThreadPoolExecutor, as_completed
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

@functools.lru_cache(maxsize=512)
def _compile_word_boundary_pattern(s: str) -> re.Pattern:
    """Return a cached compiled regex for word-boundary skill matching."""
    return re.compile(rf"\b{re.escape(s)}\b")

def _skill_in_text(text: str, skill: str) -> bool:
    """Word-boundary match for single-token skills; substring for multi-word skills."""
    t = _norm(text)
    s = _norm(skill)
    if not s:
        return False
    if " " in s:
        return s in t
    return _compile_word_boundary_pattern(s).search(t) is not None

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

    # Build a reverse index: skill → sorted list of candidate indices (already in tie-break order)
    skill_to_indices: Dict[str, List[int]] = {}
    for i, cand in enumerate(items_sorted):
        for skill in (cand.get("matched_norm") or []):
            skill_to_indices.setdefault(skill, []).append(i)

    uncovered: Set[str] = set(norm_to_orig.keys())
    selected: List[Dict[str, Any]] = []
    used_indices: Set[int] = set()

    while uncovered:
        best_idx = None
        best = None
        best_new = 0
        best_tie = 10_000

        for i, cand in enumerate(items_sorted):
            if i in used_indices:
                continue
            matched_norm = cand.get("matched_norm") or []
            new_cover = uncovered.intersection(matched_norm)
            c = len(new_cover)
            if c > best_new or (c == best_new and tie_key_func(cand) < best_tie):
                if c > 0:
                    best_idx = i
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

        # mark covered; O(1) set add instead of O(n) list.remove
        uncovered.difference_update(new_cover_norm)
        used_indices.add(best_idx)

    # fallback for any remaining skills: use reverse index for O(1) lookup (was O(n×m))
    if uncovered:
        for nsk in list(uncovered):
            best = None
            for i in skill_to_indices.get(nsk, []):
                if i not in used_indices:
                    best = items_sorted[i]
                    break  # already in tie-break order
            if not best:
                continue
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

    def _fetch_blog_skill(skill: str) -> List[Dict[str, Any]]:
        q_core = f'{skill} tutorial OR "how to"'
        q = f"{q_core} {site_bias}" if site_bias else q_core
        try:
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
        except Exception:
            return []
        if resp.status_code != 200:
            return []
        results: List[Dict[str, Any]] = []
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
            results.append({
                "_rank": rank,
                "title": title,
                "url": url,
                "channel_title": _domain_as_channel(url) or (o.get("source") or o.get("displayed_link")),
                "published_at": o.get("date"),
                "thumbnail": None,
                "views": None,
                "matched_norm": matched_norm,
            })
        return results

    with ThreadPoolExecutor(max_workers=max(1, min(5, len(skills)))) as executor:
        futures = {executor.submit(_fetch_blog_skill, skill): skill for skill in skills}
        for future in as_completed(futures):
            candidates.extend(future.result())

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

    def _fetch_news_skill(skill: str) -> List[Dict[str, Any]]:
        try:
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
        except Exception:
            return []
        if resp.status_code != 200:
            return []
        results: List[Dict[str, Any]] = []
        news_results = resp.json().get("news_results", [])[:search_per_skill]
        for rank, n in enumerate(news_results, start=1):
            title = (n.get("title") or "").strip()
            url   = n.get("link")
            if not url:
                continue
            snippet = ""
            if include_snippet:
                snippet = n.get("snippet") or n.get("content") or ""
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
            results.append({
                "_rank": rank,
                "title": title,
                "url": url,
                "channel_title": (n.get("source") or {}).get("name") or _domain_as_channel(url),
                "published_at": n.get("date"),
                "thumbnail": thumb,
                "views": None,
                "matched_norm": matched_norm,
            })
        return results

    with ThreadPoolExecutor(max_workers=max(1, min(5, len(skills)))) as executor:
        futures = {executor.submit(_fetch_news_skill, skill): skill for skill in skills}
        for future in as_completed(futures):
            candidates.extend(future.result())

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

    # 1) search per skill -> candidate ids (parallel)
    candidate_ids: List[str] = []

    def _search_yt_skill(orig: str) -> List[str]:
        q = f'"{orig}" tutorial OR course'
        try:
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
        except Exception:
            return []
        if s.status_code != 200:
            return []
        return [it.get("id", {}).get("videoId") for it in s.json().get("items", [])]

    with ThreadPoolExecutor(max_workers=max(1, min(5, len(skills)))) as executor:
        futures = {executor.submit(_search_yt_skill, orig): orig for orig in skills}
        for future in as_completed(futures):
            for vid in filter(None, future.result()):
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


