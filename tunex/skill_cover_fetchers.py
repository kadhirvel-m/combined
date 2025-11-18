from __future__ import annotations

import os
from typing import List, Dict, Any, Optional
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests

from shared_utils import (
    normalize_text,
    skill_in_text,
    domain_as_channel,
    chunks,
    safe_int,
    rank_tiebreak_key,
    greedy_cover_from_candidates,
)

# ---------------------------------------------------------------------
# ENV & CONSTANTS
# ---------------------------------------------------------------------

SERPAPI_API_KEY = os.getenv("SERPAPI_API_KEY")
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

SERPAPI_ENDPOINT = "https://serpapi.com/search.json"
YOUTUBE_SEARCH   = "https://www.googleapis.com/youtube/v3/search"
YOUTUBE_VIDEOS   = "https://www.googleapis.com/youtube/v3/videos"

# Performance: Configure connection pooling and timeouts
REQUEST_TIMEOUT = 20
MAX_WORKERS = 5  # For concurrent API requests


# ---------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------

def _require_serpapi():
    if not SERPAPI_API_KEY:
        raise RuntimeError("Missing SERPAPI_API_KEY environment variable.")

def _require_youtube():
    if not YOUTUBE_API_KEY:
        raise RuntimeError("Missing YOUTUBE_API_KEY environment variable.")


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
    Optimized with concurrent requests for better performance.

    Returns: list of selections with key "item".
    """
    _require_serpapi()

    skills = [s for s in (skills or []) if s and s.strip()]
    if not skills:
        return []

    norm_to_orig = {normalize_text(s): s for s in skills}
    norm_skills = list(norm_to_orig.keys())

    candidates: List[Dict[str, Any]] = []

    # Performance optimization: Use ThreadPoolExecutor for concurrent API requests
    def fetch_skill_blogs(skill: str) -> List[Dict[str, Any]]:
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
                timeout=REQUEST_TIMEOUT,
            )

            if resp.status_code != 200:
                return []

            skill_candidates = []
            organic = resp.json().get("organic_results", [])[:search_per_skill]
            for rank, o in enumerate(organic, start=1):
                title = (o.get("title") or "").strip()
                url   = o.get("link")
                if not url:
                    continue
                snippet = (o.get("snippet") or "") if include_snippet else ""
                text = f"{title}\n{snippet}"
                matched_norm = [nsk for nsk in norm_skills if skill_in_text(text, nsk)]
                if not matched_norm:
                    continue

                skill_candidates.append({
                    "_rank": rank,  # tie-breaker
                    "title": title,
                    "url": url,
                    "channel_title": domain_as_channel(url) or (o.get("source") or o.get("displayed_link")),
                    "published_at": o.get("date"),   # may be relative like "2 days ago"
                    "thumbnail": None,               # blogs rarely have reliable thumbs from SerpAPI
                    "views": None,                   # schema parity
                    "matched_norm": matched_norm,
                })
            return skill_candidates
        except Exception:
            return []

    # Fetch all skills concurrently
    with ThreadPoolExecutor(max_workers=min(MAX_WORKERS, len(skills))) as executor:
        future_to_skill = {executor.submit(fetch_skill_blogs, skill): skill for skill in skills}
        for future in as_completed(future_to_skill):
            try:
                skill_results = future.result()
                candidates.extend(skill_results)
            except Exception:
                pass  # Skip failed requests

    return greedy_cover_from_candidates(
        candidates=candidates,
        norm_to_orig=norm_to_orig,
        item_key="item",
        tie_key_func=rank_tiebreak_key
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
    Optimized with concurrent requests for better performance.

    Returns: list of selections with key "item".
    """
    _require_serpapi()

    skills = [s for s in (skills or []) if s and s.strip()]
    if not skills:
        return []

    norm_to_orig = {normalize_text(s): s for s in skills}
    norm_skills = list(norm_to_orig.keys())

    candidates: List[Dict[str, Any]] = []

    # Performance optimization: Use ThreadPoolExecutor for concurrent API requests
    def fetch_skill_news(skill: str) -> List[Dict[str, Any]]:
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
                timeout=REQUEST_TIMEOUT,
            )

            if resp.status_code != 200:
                return []

            skill_candidates = []
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
                matched_norm = [nsk for nsk in norm_skills if skill_in_text(text, nsk)]
                if not matched_norm:
                    continue

                skill_candidates.append({
                    "_rank": rank,  # tie-breaker
                    "title": title,
                    "url": url,
                    "channel_title": (n.get("source") or {}).get("name") or domain_as_channel(url),
                    "published_at": n.get("date"),  # may be relative
                    "thumbnail": thumb,
                    "views": None,                  # schema parity
                    "matched_norm": matched_norm,
                })
            return skill_candidates
        except Exception:
            return []

    # Fetch all skills concurrently
    with ThreadPoolExecutor(max_workers=min(MAX_WORKERS, len(skills))) as executor:
        future_to_skill = {executor.submit(fetch_skill_news, skill): skill for skill in skills}
        for future in as_completed(future_to_skill):
            try:
                skill_results = future.result()
                candidates.extend(skill_results)
            except Exception:
                pass  # Skip failed requests

    return greedy_cover_from_candidates(
        candidates=candidates,
        norm_to_orig=norm_to_orig,
        item_key="item",
        tie_key_func=rank_tiebreak_key
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

    norm_to_orig = {normalize_text(s): s for s in skills}
    norm_skills = list(norm_to_orig.keys())

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
    seen: set[str] = set()
    dedup_ids: List[str] = []
    for vid in candidate_ids:
        if vid not in seen:
            seen.add(vid)
            dedup_ids.append(vid)
    if not dedup_ids:
        return []

    # 2) fetch details/stats
    candidates: List[Dict[str, Any]] = []
    for batch in chunks(dedup_ids, 50):
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
            view_count = safe_int(st.get("viewCount")) or 0
            if view_count < min_views:
                continue

            matched_norm = [nsk for nsk in norm_skills if skill_in_text(text, nsk)]
            if not matched_norm:
                continue

            thumb = (sn.get("thumbnails", {}) or {}).get("medium", {}) or {}
            candidates.append({
                # We invert views for tie-breaker (lower is better in rank_tiebreak_key),
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
    selections = greedy_cover_from_candidates(
        candidates=sorted(candidates, key=_yt_tie_key),  # pre-sort for stable ties
        norm_to_orig=norm_to_orig,
        item_key="video",
        tie_key_func=_yt_tie_key
    )
    return selections


# ---------------------------------------------------------------------
# Demo / Manual test
# ---------------------------------------------------------------------


