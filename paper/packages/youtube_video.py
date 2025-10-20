import html
import re
import socket
from concurrent.futures import ThreadPoolExecutor
from threading import Lock
from typing import Dict, List, Optional
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from yt_dlp import YoutubeDL


def _parse_video_id(url: str) -> Optional[str]:
    """Extract video ID from YouTube URL."""
    if not url:
        return None
    # Already just an ID
    if re.match(r'^[A-Za-z0-9_-]{11}$', url):
        return url
    # Extract from various URL formats
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})',
        r'youtube\.com\/shorts\/([A-Za-z0-9_-]{11})',
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None


def _format_duration(seconds: Optional[int]) -> str:
    """Format duration in seconds to MM:SS or HH:MM:SS."""
    if seconds is None:
        return ""
    try:
        total_seconds = int(round(float(seconds)))
    except (TypeError, ValueError):
        return ""
    if total_seconds <= 0:
        return ""
    hours, remainder = divmod(total_seconds, 3600)
    minutes, secs = divmod(remainder, 60)
    if hours > 0:
        return f"{hours}:{minutes:02d}:{secs:02d}"
    return f"{minutes}:{secs:02d}"


def _format_views(views: Optional[int]) -> str:
    """Format view count with commas."""
    if views is None:
        return ""
    if views >= 1_000_000:
        return f"{views / 1_000_000:.1f}M views"
    elif views >= 1_000:
        return f"{views / 1_000:.1f}K views"
    return f"{views:,} views"


_channel_logo_cache: Dict[str, str] = {}
_channel_logo_lock = Lock()
_DEFAULT_CHANNEL_LOGO = "https://www.youtube.com/s/desktop/94838207/img/favicon_144x144.png"


def _normalize_channel_logo(logo_url: str) -> str:
    """Downscale large channel logo URLs to a smaller size."""
    if not logo_url or not isinstance(logo_url, str):
        return ""
    return re.sub(r"=s\d+-c", "=s88-c", logo_url, count=1)


def _fetch_channel_logo(channel_page_url: Optional[str]) -> str:
    """
    Fetch the channel avatar URL by scraping the channel page's open graph metadata.
    Results are cached per-channel to avoid repeated network requests.
    """
    if not channel_page_url:
        return ""

    channel_page_url = channel_page_url.strip()
    if not channel_page_url:
        return ""

    with _channel_logo_lock:
        cached = _channel_logo_cache.get(channel_page_url)
    if cached is not None:
        return cached

    try:
        req = Request(
            channel_page_url,
            headers={
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/116.0 Safari/537.36"
                )
            },
        )
        with urlopen(req, timeout=4) as response:
            charset = response.headers.get_content_charset() or "utf-8"
            html_text = response.read().decode(charset, errors="ignore")
    except (ValueError, HTTPError, URLError, TimeoutError, socket.timeout):
        with _channel_logo_lock:
            _channel_logo_cache[channel_page_url] = ""
        return ""

    logo_match = re.search(
        r'<meta[^>]+property=["\']og:image["\'][^>]*content=["\']([^"\']+)["\']',
        html_text,
        flags=re.IGNORECASE,
    )
    if not logo_match:
        with _channel_logo_lock:
            _channel_logo_cache[channel_page_url] = ""
        return ""

    logo_url = html.unescape(logo_match.group(1))
    with _channel_logo_lock:
        _channel_logo_cache[channel_page_url] = logo_url
    return logo_url


def get_channel_logo(channel_page_url: Optional[str]) -> str:
    """Public helper to resolve and normalize a channel logo."""
    return _normalize_channel_logo(_fetch_channel_logo(channel_page_url)) or ""


def get_default_channel_logo() -> str:
    return _DEFAULT_CHANNEL_LOGO


def search_youtube_videos(query: str, num: int = 8, *, prefetch_logos: bool = False) -> List[Dict[str, str]]:
    """
    Search YouTube videos using yt-dlp.
    
    Args:
        query: Search query string
        num: Number of results to return (default 8, max 20)
    
    Returns:
        List of video dictionaries with title, link, channel, views, duration, thumbnail
    """
    if not YoutubeDL:
        raise ImportError("yt-dlp is not installed. Install it with: pip install yt-dlp")
    
    if not query or not query.strip():
        return []
    
    # Limit results
    num = max(1, min(num, 20))
    
    # yt-dlp options for searching
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'extract_flat': True,  # Don't download, just extract metadata
        'force_generic_extractor': False,
        'default_search': 'ytsearch',  # Use YouTube search
        'format': 'best',
        'noplaylist': True,
        'playlistend': num,
        'cachedir': False,
    }
    
    videos: List[Dict[str, str]] = []
    
    try:
        with YoutubeDL(ydl_opts) as ydl:
            # Search for videos (ytsearch{num}:{query})
            search_query = f"ytsearch{num}:{query}"
            result = ydl.extract_info(search_query, download=False)
            
            if not result or 'entries' not in result:
                return []
            
            entries = result.get('entries', [])
            limited_entries = entries[:num]

            if prefetch_logos:
                unique_pages: List[str] = []
                for entry in limited_entries:
                    channel_page = (entry.get('channel_url') or entry.get('uploader_url') or "").strip()
                    if channel_page and channel_page not in unique_pages:
                        unique_pages.append(channel_page)

                with _channel_logo_lock:
                    cached_pages = set(_channel_logo_cache.keys())
                missing_pages = [
                    page for page in unique_pages
                    if page and page not in cached_pages
                ]
                if missing_pages:
                    max_workers = min(6, len(missing_pages))
                    try:
                        with ThreadPoolExecutor(max_workers=max_workers) as executor:
                            list(executor.map(_fetch_channel_logo, missing_pages))
                    except RuntimeError:
                        for page in missing_pages:
                            _fetch_channel_logo(page)

            for entry in limited_entries:
                if not entry:
                    continue
                
                # Extract video information
                video_id = entry.get('id', '')
                title = entry.get('title', '').strip()
                channel = entry.get('channel') or entry.get('uploader') or 'YouTube'
                
                # Duration
                duration_sec = entry.get('duration')
                duration = _format_duration(duration_sec)
                
                # Views
                view_count = entry.get('view_count')
                views = _format_views(view_count)
                
                # Thumbnail - prefer maxresdefault, then hq720
                thumbnail = entry.get('thumbnail', '')
                if not thumbnail and video_id:
                    # Fallback to standard YouTube thumbnail URLs
                    thumbnail = f"https://i.ytimg.com/vi/{video_id}/maxresdefault.jpg"
                
                # Video URL
                video_url = entry.get('url', '')
                if not video_url and video_id:
                    video_url = f"https://www.youtube.com/watch?v={video_id}"
                
                # Channel thumbnail/logo (scraped from channel page metadata)
                channel_page = (entry.get('channel_url') or entry.get('uploader_url') or "").strip()
                channel_logo = get_channel_logo(channel_page) if prefetch_logos else ""
                final_logo = channel_logo or _DEFAULT_CHANNEL_LOGO
                
                # Only add if we have essential data
                if title and video_url and thumbnail:
                    videos.append({
                        "title": title,
                        "link": video_url,
                        "channel": channel.strip() if channel else "YouTube",
                        "views": views,
                        "duration": duration,
                        "thumbnail": thumbnail,
                        "channel_logo": final_logo,
                        "channel_logo_is_default": final_logo == _DEFAULT_CHANNEL_LOGO,
                        "channel_page": channel_page,
                    })
    
    except Exception as e:
        # Log error but return empty list instead of raising
        print(f"Error searching YouTube videos: {e}")
        return []
    
    return videos
