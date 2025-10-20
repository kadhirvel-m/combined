import os, re
from typing import List, Optional, Dict, Any
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
    if seconds is None or seconds <= 0:
        return ""
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    secs = seconds % 60
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


def search_youtube_videos(query: str, num: int = 8) -> List[Dict[str, str]]:
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
            
            for entry in entries[:num]:
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
                
                # Channel thumbnail/logo (use video thumbnail as fallback)
                channel_logo = entry.get('channel_url', '')
                if channel_logo:
                    # Extract channel ID from URL if possible
                    channel_id_match = re.search(r'channel/([^/]+)', channel_logo)
                    if channel_id_match:
                        channel_id = channel_id_match.group(1)
                        channel_logo = f"https://www.youtube.com/channel/{channel_id}"
                
                # Only add if we have essential data
                if title and video_url and thumbnail:
                    videos.append({
                        "title": title,
                        "link": video_url,
                        "channel": channel.strip() if channel else "YouTube",
                        "views": views,
                        "duration": duration,
                        "thumbnail": thumbnail,
                        "channel_logo": channel_logo if isinstance(channel_logo, str) else "",
                    })
    
    except Exception as e:
        # Log error but return empty list instead of raising
        print(f"Error searching YouTube videos: {e}")
        return []
    
    return videos