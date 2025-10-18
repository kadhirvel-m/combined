import os, re
from dotenv import load_dotenv
from typing import List, Optional, Literal, Tuple, Dict, Any
from serpapi import GoogleSearch
from urllib.parse import urlparse, parse_qs

load_dotenv()

_IMG_EXT = re.compile(r"\.(png|jpg|jpeg|webp|gif)(\?|$)", re.I)

def _parse_video_id(link: str) -> Optional[str]:
    try:
        u = urlparse(link)
        if u.netloc.endswith("youtu.be"):
            vid = u.path.lstrip("/")
            return vid or None
        if u.path.startswith("/shorts/"):
            parts = [p for p in u.path.split("/") if p]
            return parts[1] if len(parts) > 1 else None
        qs = parse_qs(u.query)
        if "v" in qs and qs["v"]:
            return qs["v"][0]
    except Exception:
        return None
    return None

def _to_str(v) -> str:
    if v is None:
        return ""
    if isinstance(v, (int, float)):
        # format ints like 157,517
        return f"{int(v):,}" if float(v).is_integer() else str(v)
    return str(v)

def search_youtube_videos(query: str, num: int = 8) -> List[Dict[str, str]]:
    key = os.getenv("SERPAPI_API_KEY")
    if not key:
        return []
    params = {"engine": "youtube", "search_query": query, "num": num, "api_key": key}
    results = GoogleSearch(params).get_dict()
    items = results.get("video_results", []) or []

    videos: List[Dict[str, str]] = []
    for v in items[:num]:
        title = _to_str(v.get("title")).strip()
        link = _to_str(v.get("link")).strip()

        ch = v.get("channel")
        if isinstance(ch, dict):
            channel = _to_str(ch.get("name")).strip()
        else:
            channel = _to_str(ch).strip() or "YouTube"

        duration = _to_str(v.get("length") or v.get("duration")).strip()
        views_raw = v.get("views")
        views = _to_str(views_raw).strip()
        if views and views.isdigit():
            views = f"{int(views):,}"

        thumb = v.get("thumbnail") or v.get("thumbnail_link") or ""
        if isinstance(thumb, dict):
            thumb = thumb.get("static") or thumb.get("url") or ""
        thumb = _to_str(thumb).split("?")[0]
        if not thumb:
            vid = v.get("video_id") or _parse_video_id(link)
            if vid:
                thumb = f"https://i.ytimg.com/vi/{vid}/hq720.jpg"
        if not _IMG_EXT.search(thumb):
            # ytimg sometimes returns .jpg without query, keep it; otherwise skip
            if "i.ytimg.com/vi/" not in thumb:
                continue

        if title and link and thumb:
            videos.append({
                "title": title,
                "link": link,
                "channel": channel or "YouTube",
                "views": views,
                "duration": duration,
                "thumbnail": thumb,
            })
    return videos