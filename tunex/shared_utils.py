"""
Shared utility functions for TuneX application.

This module consolidates commonly used helper functions to eliminate duplication
across the codebase.
"""

from __future__ import annotations

import re
from typing import Any, Dict, Iterable, List, Optional, Set
from urllib.parse import urlparse


# ---------------------------------------------------------------------
# Text normalization and matching
# ---------------------------------------------------------------------

def normalize_text(s: str) -> str:
    """Normalize text by collapsing whitespace and converting to lowercase."""
    return re.sub(r"\s+", " ", (s or "").strip().lower())


def skill_in_text(text: str, skill: str) -> bool:
    """
    Check if skill appears in text.
    Word-boundary match for single-token skills; substring for multi-word skills.
    """
    t = normalize_text(text)
    s = normalize_text(skill)
    if not s:
        return False
    if " " in s:
        return s in t
    return re.search(rf"\b{re.escape(s)}\b", t) is not None


# ---------------------------------------------------------------------
# URL and domain helpers
# ---------------------------------------------------------------------

def domain_as_channel(url: Optional[str]) -> Optional[str]:
    """Extract domain name from URL to use as channel name."""
    if not url:
        return None
    try:
        host = urlparse(url).netloc or ""
        return host.replace("www.", "") if host else None
    except Exception:
        return None


# ---------------------------------------------------------------------
# Collection utilities
# ---------------------------------------------------------------------

def chunks(lst: List[Any], n: int) -> Iterable[List[Any]]:
    """Split list into chunks of size n."""
    for i in range(0, len(lst), n):
        yield lst[i : i + n]


def safe_int(x: Optional[str]) -> Optional[int]:
    """Safely convert string to int, returning None on failure."""
    try:
        return int(x)  # may raise ValueError/TypeError
    except Exception:
        return None


# ---------------------------------------------------------------------
# Greedy set cover algorithm
# ---------------------------------------------------------------------

def rank_tiebreak_key(cand: Dict[str, Any]) -> int:
    """Lower is better; falls back to a large number if undefined."""
    try:
        return int(cand.get("_rank", 10_000))
    except Exception:
        return 10_000


def greedy_cover_from_candidates(
    candidates: List[Dict[str, Any]],
    norm_to_orig: Dict[str, str],
    item_key: str = "item",
    tie_key_func=rank_tiebreak_key,
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
            "title": cand.get("title"),
            "url": cand.get("url"),
            "channel_title": cand.get("channel_title"),
            "views": cand.get("views"),  # None for blogs/news
            "published_at": cand.get("published_at"),
            "thumbnail": cand.get("thumbnail"),
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
                "title": best.get("title"),
                "url": best.get("url"),
                "channel_title": best.get("channel_title"),
                "views": best.get("views"),
                "published_at": best.get("published_at"),
                "thumbnail": best.get("thumbnail"),
            }
            selected.append({"group_skills": [norm_to_orig[nsk]], item_key: payload})
            uncovered.discard(nsk)

    return selected
