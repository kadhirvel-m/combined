"""
Shared utility functions for TuneX application.

This module consolidates commonly used helper functions to eliminate duplication
across the codebase.
"""

from __future__ import annotations

import functools
import re
from typing import Any, Callable, Dict, Iterable, List, Optional, Set, Union
from urllib.parse import urlparse


# ---------------------------------------------------------------------
# Text normalization and matching
# ---------------------------------------------------------------------

@functools.lru_cache(maxsize=256)
def normalize_text(s: str) -> str:
    """
    Normalize text by collapsing whitespace and converting to lowercase.
    
    This function is cached for performance as it's frequently called with
    the same inputs during skill matching operations.
    
    Args:
        s: Input string to normalize
        
    Returns:
        Normalized lowercase string with collapsed whitespace
        
    Examples:
        >>> normalize_text("Hello   World")
        'hello world'
        >>> normalize_text("  Python  ")
        'python'
    """
    return re.sub(r"\s+", " ", (s or "").strip().lower())


def skill_in_text(text: str, skill: str) -> bool:
    """
    Check if skill appears in text.
    
    Uses word-boundary matching for single-token skills and substring
    matching for multi-word skills. Matching is case-insensitive.
    
    Args:
        text: Text to search in
        skill: Skill name to search for
        
    Returns:
        True if skill is found in text, False otherwise
        
    Examples:
        >>> skill_in_text("Python programming", "python")
        True
        >>> skill_in_text("Machine Learning course", "machine learning")
        True
        >>> skill_in_text("Pythonic code", "python")
        False  # Word boundary not matched
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
    """
    Extract domain name from URL to use as channel name.
    
    Removes 'www.' prefix if present.
    
    Args:
        url: URL string to extract domain from
        
    Returns:
        Domain name without 'www.' prefix, or None if URL is invalid
        
    Examples:
        >>> domain_as_channel("https://www.example.com/path")
        'example.com'
        >>> domain_as_channel("https://blog.example.com")
        'blog.example.com'
        >>> domain_as_channel(None)
        None
    """
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
    """
    Split list into chunks of size n.
    
    Args:
        lst: List to split into chunks
        n: Size of each chunk
        
    Yields:
        Sublists of size n (last chunk may be smaller)
        
    Examples:
        >>> list(chunks([1, 2, 3, 4, 5], 2))
        [[1, 2], [3, 4], [5]]
    """
    for i in range(0, len(lst), n):
        yield lst[i : i + n]


def safe_int(x: Optional[Union[str, int]]) -> Optional[int]:
    """
    Safely convert value to int, returning None on failure.
    
    Args:
        x: Value to convert (string or int)
        
    Returns:
        Integer value or None if conversion fails
        
    Examples:
        >>> safe_int("123")
        123
        >>> safe_int("not a number")
        None
        >>> safe_int(None)
        None
    """
    try:
        return int(x)  # type: ignore
    except (ValueError, TypeError):
        return None


# ---------------------------------------------------------------------
# Greedy set cover algorithm
# ---------------------------------------------------------------------

def rank_tiebreak_key(cand: Dict[str, Any]) -> int:
    """
    Extract rank for tiebreaking in sorting.
    
    Lower ranks are better. Falls back to 10,000 if rank is missing or invalid.
    
    Args:
        cand: Candidate dictionary that may contain '_rank' key
        
    Returns:
        Rank value (lower is better), or 10,000 as default
        
    Examples:
        >>> rank_tiebreak_key({"_rank": 5})
        5
        >>> rank_tiebreak_key({})
        10000
    """
    try:
        return int(cand.get("_rank", 10_000))
    except (ValueError, TypeError):
        return 10_000


def greedy_cover_from_candidates(
    candidates: List[Dict[str, Any]],
    norm_to_orig: Dict[str, str],
    item_key: str = "item",
    tie_key_func: Optional[Callable[[Dict[str, Any]], int]] = None,
) -> List[Dict[str, Any]]:
    """
    Perform greedy set cover algorithm on candidates.
    
    Selects minimal set of candidates that cover all skills in norm_to_orig.
    Each candidate specifies which normalized skills it matches via 'matched_norm' key.
    
    Args:
        candidates: List of candidate items, each with:
            - '_rank': int (lower is better, for tiebreaking)
            - 'matched_norm': List[str] (normalized skills this item covers)
            - Display fields: title, url, channel_title, views, published_at, thumbnail
        norm_to_orig: Mapping from normalized skill names to original names
        item_key: Key name for the item payload in output (default: "item")
        tie_key_func: Custom tiebreaker function (default: rank_tiebreak_key)
        
    Returns:
        List of selections, each with:
            - 'group_skills': List[str] (original skill names covered by this item)
            - {item_key}: Dict (item payload with display fields)
            
    Examples:
        >>> candidates = [{
        ...     "_rank": 1,
        ...     "title": "Python Tutorial",
        ...     "url": "https://example.com",
        ...     "channel_title": "Example",
        ...     "views": 1000,
        ...     "published_at": "2023-01-01",
        ...     "thumbnail": None,
        ...     "matched_norm": ["python"]
        ... }]
        >>> norm_to_orig = {"python": "Python"}
        >>> result = greedy_cover_from_candidates(candidates, norm_to_orig)
        >>> len(result)
        1
        >>> result[0]["group_skills"]
        ['Python']
    """
    if not candidates:
        return []
    
    if tie_key_func is None:
        tie_key_func = rank_tiebreak_key

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
