"""Single-file consolidated FastAPI app for PaperX."""

from __future__ import annotations

import asyncio
import enum
import io
import json
import logging
import os
import random
import re
import requests
import sys
import textwrap
import time
import uuid
import math
from dataclasses import dataclass, field
from datetime import datetime, date
from decimal import Decimal
from functools import lru_cache
from pathlib import Path
from typing import Any, AsyncGenerator, Dict, Iterator, List, Optional, Set, Tuple
from urllib.parse import quote, urlparse
import threading

from autogen_agentchat.agents import AssistantAgent
from autogen_core.models import ModelInfo
from autogen_ext.models.openai import OpenAIChatCompletionClient
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from fastapi import APIRouter, Body, FastAPI, File, Form, Header, HTTPException, Query, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, Response, StreamingResponse
from fastapi.staticfiles import StaticFiles
try:
    import httpx  # Optional: used for catching RemoteProtocolError from underlying HTTP calls
    from httpx import RemoteProtocolError as HTTPXRemoteProtocolError  # type: ignore
except Exception:  # pragma: no cover
    httpx = None
    class HTTPXRemoteProtocolError(Exception):
        pass

try:
    import fitz  # type: ignore
except Exception:  # pragma: no cover
    fitz = None  # type: ignore

try:
    import docx  # type: ignore
except Exception:  # pragma: no cover
    docx = None  # type: ignore

try:
    from pptx import Presentation  # type: ignore
except Exception:  # pragma: no cover
    Presentation = None  # type: ignore

try:
    import textract  # type: ignore
except Exception:  # pragma: no cover
    textract = None  # type: ignore
from markdownify import markdownify as md
from pydantic import BaseModel, Field, HttpUrl, validator, root_validator
from rapidfuzz import fuzz
from serpapi import GoogleSearch
from supabase import Client, create_client
from postgrest.exceptions import APIError
from packages.yt_transcript import (
    router as yt_transcript_router,
    fetch_transcript_paragraph,
    extract_video_id,
)
from packages.youtube_video import (
    get_channel_logo,
    get_default_channel_logo,
    search_youtube_videos,
)
try:
    # Used for fetching YouTube video metadata (channel, views, etc.)
    from yt_dlp import YoutubeDL  # type: ignore
except Exception:  # pragma: no cover
    YoutubeDL = None  # type: ignore

load_dotenv()

# --- Supabase helpers ---


supabase_logger = logging.getLogger("paperx.supabase")
supabase_logger.setLevel(logging.INFO)

SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "").strip()

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.")


@lru_cache()
def get_service_client() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


@lru_cache()
def get_anon_client() -> Optional[Client]:
    if not SUPABASE_ANON_KEY:
        supabase_logger.warning("Missing SUPABASE_ANON_KEY; auth-dependent routes will be disabled.")
        return None
    return create_client(SUPABASE_URL, SUPABASE_ANON_KEY)


def _to_supabase_json(value: Any) -> Any:
    """Recursively coerce common Python types (UUID, datetime, set, etc.) into JSON-serializable forms."""
    if value is None:
        return None
    if isinstance(value, uuid.UUID):
        return str(value)
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, enum.Enum):
        return value.value
    if isinstance(value, BaseModel):
        return _to_supabase_json(value.dict(exclude_none=True))
    if isinstance(value, set):
        return [_to_supabase_json(v) for v in value]
    if isinstance(value, (list, tuple)):
        return [_to_supabase_json(v) for v in value]
    if isinstance(value, dict):
        return {k: _to_supabase_json(v) for k, v in value.items() if v is not None}
    return value


def _supabase_payload(raw: Dict[str, Any]) -> Dict[str, Any]:
    """Return a JSON-serializable dict suitable for Supabase from a Pydantic .dict() payload."""
    return {k: _to_supabase_json(v) for k, v in raw.items() if v is not None}

# --- Resiliency helpers for Supabase/httpx transient protocol errors ---
# Some users have observed intermittent httpcore.RemoteProtocolError("Server disconnected") coming
# from underlying HTTP/2 (or connection reuse) when performing rapid successive metadata lookups.
# These are typically transient (connection closed between frames). We add a lightweight retry
# wrapper so endpoint handlers can reattempt idempotent read queries without failing the whole request.
RETRYABLE_EXCEPTIONS: tuple = ()
try:  # HTTPXRemoteProtocolError already imported conditionally at top
    if httpx is not None:
        RETRYABLE_EXCEPTIONS = (HTTPXRemoteProtocolError, httpx.RemoteProtocolError)  # type: ignore
    else:
        RETRYABLE_EXCEPTIONS = (HTTPXRemoteProtocolError,)  # type: ignore
except Exception:  # pragma: no cover
    pass

def _supabase_retry(fn, *, retries: int = 3, base_delay: float = 0.35):
    """Execute a zero-arg callable returning a Supabase response with simple exponential backoff.

    Only catches protocol-level disconnection errors that are safe to retry for idempotent SELECT/IN queries.
    """
    for attempt in range(retries):
        try:
            return fn()
        except RETRYABLE_EXCEPTIONS as e:  # pragma: no cover - network timing dependent
            if attempt == retries - 1:
                raise
            time.sleep(base_delay * (2 ** attempt))



PROJECTS_TABLE = os.getenv("PROJECTS_TABLE") or os.getenv("SUPABASE_PROJECTS_TABLE") or "projects"
PROJECT_APPLICATIONS_TABLE = os.getenv("PROJECT_APPLICATIONS_TABLE") or "project_applications"
PROJECT_COLLAB_TABLE = os.getenv("PROJECT_COLLAB_TABLE") or "project_collab_messages"
SKILL_TESTS_TABLE = os.getenv("SKILL_TESTS_TABLE") or "skill_tests"
SKILL_VERIFICATIONS_TABLE = os.getenv("SKILL_VERIFICATIONS_TABLE") or "skill_verifications"
PROJECTS_BUCKET = (os.getenv("SUPABASE_PROJECTS_BUCKET") or os.getenv("SUPABASE_BUCKET") or "").strip()
PROJECT_MEDIA_EXTENSIONS = {
    "cover": {".png", ".jpg", ".jpeg", ".webp", ".gif"},
    "gallery": {".png", ".jpg", ".jpeg", ".webp", ".gif", ".mp4", ".mov", ".webm"},
}

# --- Print/Orders table names ---
PRINT_SHOPS_TABLE = os.getenv("PRINT_SHOPS_TABLE") or "print_shops"
PRINT_PRICING_TABLE = os.getenv("PRINT_PRICING_TABLE") or "print_pricing"
PRINT_PRINTERS_TABLE = os.getenv("PRINT_PRINTERS_TABLE") or "print_printers"
PRINT_JOBS_TABLE = os.getenv("PRINT_JOBS_TABLE") or "print_jobs"
PRINT_JOB_EVENTS_TABLE = os.getenv("PRINT_JOB_EVENTS_TABLE") or "print_job_events"

# --- AI model clients ---

openai_model_client = OpenAIChatCompletionClient(
    model="gpt-4o-mini",
    api_key=os.environ.get("OPENAI_API_KEY")
)

deepseek_model_client =  OpenAIChatCompletionClient(
    base_url="https://openrouter.ai/api/v1",
    model="deepseek/deepseek-r1-0528:free",
    api_key = os.environ.get("OPENROUTER_API_KEY"),
    model_info=ModelInfo(
        vision=True,
        function_calling=True,
        json_output=True,
        family="unknown",
        structured_output=True
    )
)

gemini_model_client = OpenAIChatCompletionClient(
    model="gemini-2.5-flash",
    api_key=os.getenv("GEMINI_API_KEY"),
    model_info=ModelInfo(
        vision=True,
        function_calling=True,
        json_output=True,
        family="unknown",
        structured_output=True
    )
)

# --- Notes storage ---

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
NOTES_DIR = os.path.join(BASE_DIR, "notes")
os.makedirs(NOTES_DIR, exist_ok=True)
os.makedirs(NOTES_DIR, exist_ok=True)


def _slugify_topic(topic: str) -> str:
    s = re.sub(r"[^a-zA-Z0-9_.-]+", "-", (topic or "").strip()).strip("-")
    if not s:
        s = "note"
    return s[:60]


def _note_id(topic: str) -> str:
    slug = _slugify_topic(topic)
    ts = int(time.time() * 1000)
    short = uuid.uuid4().hex[:6]
    return f"{slug}-{ts}-{short}"


def _note_path(note_id: str) -> str:
    return os.path.join(NOTES_DIR, f"{note_id}.md")


def save_note(topic: str, markdown: str) -> Dict[str, str]:
    nid = _note_id(topic)
    path = _note_path(nid)
    with open(path, "w", encoding="utf-8") as f:
        f.write(markdown or "")
    st = os.stat(path)
    return {
        "id": nid,
        "topic": topic,
        "path": path,
        "created_at": datetime.fromtimestamp(st.st_mtime).isoformat(),
        "size": st.st_size,
    }


def read_note(note_id: str) -> Dict[str, str]:
    path = _note_path(note_id)
    if not os.path.isfile(path):
        raise FileNotFoundError("Note not found")
    with open(path, "r", encoding="utf-8") as f:
        md = f.read()
    st = os.stat(path)
    return {
        "id": note_id,
        "markdown": md,
        "updated_at": datetime.fromtimestamp(st.st_mtime).isoformat(),
        "size": st.st_size,
    }


def update_note(note_id: str, markdown: str) -> Dict[str, str]:
    path = _note_path(note_id)
    if not os.path.isfile(path):
        raise FileNotFoundError("Note not found")
    with open(path, "w", encoding="utf-8") as f:
        f.write(markdown or "")
    st = os.stat(path)
    return {
        "id": note_id,
        "updated_at": datetime.fromtimestamp(st.st_mtime).isoformat(),
        "size": st.st_size,
    }


def list_notes() -> List[Dict[str, str]]:
    items: List[Dict[str, str]] = []
    if not os.path.isdir(NOTES_DIR):
        return items
    for name in os.listdir(NOTES_DIR):
        if not name.endswith(".md"):
            continue
        nid = name[:-3]
        p = os.path.join(NOTES_DIR, name)
        st = os.stat(p)
        topic = None
        try:
            with open(p, "r", encoding="utf-8") as f:
                for line in f:
                    if line.startswith("# "):
                        topic = line[2:].strip()
                        break
        except Exception:
            pass
        items.append({
            "id": nid,
            "topic": topic,
            "updated_at": datetime.fromtimestamp(st.st_mtime).isoformat(),
            "size": st.st_size,
        })
    items.sort(key=lambda x: x["updated_at"], reverse=True)
    return items


def note_path(note_id: str) -> str:
    """Expose file path for download endpoints."""
    return _note_path(note_id)


# -------------------- Fuzzy/Semantic search helpers --------------------

def _normalize_text(s: str) -> str:
    s = (s or "").lower()
    s = re.sub(r"[^a-z0-9\s]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def _extract_title_and_headings(md: str) -> Tuple[Optional[str], List[str]]:
    title: Optional[str] = None
    headings: List[str] = []
    for raw in (md or "").splitlines():
        line = raw.strip()
        if line.startswith("# "):
            h = line[2:].strip()
            if not title:
                title = h
            headings.append(h)
        elif line.startswith("## "):
            headings.append(line[3:].strip())
        elif line.startswith("### "):
            headings.append(line[4:].strip())
    return title, headings


def _score_query_against_note(query: str, note_id: str) -> Tuple[int, Dict[str, str]]:
    path = _note_path(note_id)
    try:
        with open(path, "r", encoding="utf-8") as f:
            md = f.read()
    except Exception:
        return 0, {"id": note_id}

    title, headings = _extract_title_and_headings(md)

    # Derive slug part from note_id like: slug-<ts>-<short>
    slug_part = note_id
    parts = note_id.rsplit("-", 2)
    if len(parts) == 3:
        slug_part = parts[0]

    q = _normalize_text(query)
    scores: List[int] = []

    if title:
        scores.append(fuzz.token_set_ratio(q, _normalize_text(title)))
    if headings:
        best_heading = max((fuzz.token_set_ratio(q, _normalize_text(h)) for h in headings), default=0)
        scores.append(best_heading)
    if slug_part:
        scores.append(fuzz.token_set_ratio(q, _normalize_text(slug_part)))

    # Also compare with first 300 chars of body (after dropping headings)
    body = []
    for raw in md.splitlines():
        if raw.strip().startswith("#"):
            continue
        body.append(raw)
        if len(body) > 60:
            break
    body_text = _normalize_text(" ".join(body))[:300]
    if body_text:
        scores.append(fuzz.token_set_ratio(q, body_text))

    score = max(scores) if scores else 0
    return score, {
        "id": note_id,
        "title": title or None,
        "slug": slug_part,
        "path": path,
    }


def search_notes(query: str, limit: int = 5) -> List[Dict[str, object]]:
    """Return best-matching notes for a textual query using fuzzy scoring.

    Each result includes: id, score, title, path, slug.
    """
    results: List[Tuple[int, Dict[str, str]]] = []
    for name in os.listdir(NOTES_DIR):
        if not name.endswith(".md"):
            continue
        nid = name[:-3]
        score, meta = _score_query_against_note(query, nid)
        results.append((score, meta))

    results.sort(key=lambda x: x[0], reverse=True)
    out: List[Dict[str, object]] = []
    for s, meta in results[:limit]:
        m = dict(meta)
        m["score"] = int(s)
        out.append(m)
    return out


def find_existing_note_for_topic(topic: str, threshold: int = 82) -> Optional[Dict[str, object]]:
    """Find a cached note for a topic if similarity exceeds threshold.

    Returns dict with: id, score, title, path; or None if no match.
    """
    candidates = search_notes(topic, limit=3)
    if not candidates:
        return None
    best = candidates[0]
    if best.get("score", 0) >= threshold:
        return best
    return None

# --- PDF rendering ---

try:
    from markdown import markdown as md_to_html
except Exception:  # pragma: no cover - optional if headless is used
    md_to_html = None
try:
    from xhtml2pdf import pisa
except Exception:  # pragma: no cover - optional if headless is used
    pisa = None
try:
    from playwright.sync_api import sync_playwright
except Exception:  # pragma: no cover - optional
    sync_playwright = None


BASE_CSS = """
<style>
  @page { size: A4; margin: 1.2cm; }
  body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 11pt; color: #111827; }
  h1, h2, h3 { color: #0f172a; }
  h1 { font-size: 22pt; margin: 0 0 10px 0; }
  h2 { font-size: 16pt; margin: 14px 0 8px 0; }
  h3 { font-size: 13pt; margin: 10px 0 6px 0; }
  p, li { line-height: 1.4; }
  pre, code { font-family: DejaVu Sans Mono, Consolas, monospace; font-size: 9pt; }
  pre { background: #0b1020; color: #e5e7eb; padding: 10px; border-radius: 6px; }
  code { background: #eef1ff; padding: 1px 3px; border-radius: 4px; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0; }
  th, td { border: 1px solid #e5e7eb; padding: 6px; }
  blockquote { border-left: 3px solid #93c5fd; padding-left: 8px; color: #374151; }
  .small { color: #6b7280; font-size: 9pt; }
</style>
"""


def markdown_to_html(markdown_text: str) -> str:
    if md_to_html is None:
        raise RuntimeError("markdown library not installed")
    html_body = md_to_html(markdown_text or "", extensions=[
        'extra', 'admonition', 'codehilite', 'tables', 'toc'
    ])
    return f"<html><head>{BASE_CSS}</head><body>{html_body}</body></html>"


def render_pdf_from_markdown(markdown_text: str) -> bytes:
    """Render a PDF byte stream from a Markdown string.

    Uses markdown→HTML and xhtml2pdf. Returns PDF bytes or raises RuntimeError on failure.
    """
    if pisa is None:
        raise RuntimeError("xhtml2pdf not installed")
    html = markdown_to_html(markdown_text)
    pdf_io = io.BytesIO()
    result = pisa.CreatePDF(io.StringIO(html), dest=pdf_io, encoding='utf-8')
    if result.err:
        raise RuntimeError("Failed to generate PDF")
    return pdf_io.getvalue()


# ---------------- WYSIWYG via headless Chromium (best for KaTeX/Mermaid) ----------------

def render_pdf_via_headless(url: str, wait_selector: str = "#output", timeout_ms: int = 20000) -> bytes:
    """Open a URL in headless Chromium and print to PDF. Requires playwright + browsers installed.

    Install: pip install playwright; playwright install
    """
    if sync_playwright is None:
        raise RuntimeError("playwright not installed")
    with sync_playwright() as p:
        browser = p.chromium.launch()
        try:
            page = browser.new_page()
            page.goto(url, wait_until="networkidle")
            # wait for primary content to appear
            try:
                page.wait_for_selector(wait_selector, timeout=timeout_ms)
            except Exception:
                pass
            # give KaTeX/mermaid a brief window to render
            try:
                page.wait_for_selector('.katex', timeout=3000)
            except Exception:
                time.sleep(0.5)
            pdf_bytes = page.pdf(format="A4", print_background=True, margin={
                'top': '0.6in', 'bottom': '0.6in', 'left': '0.6in', 'right': '0.6in'
            })
            return pdf_bytes
        finally:
            browser.close()


def render_pdf_from_markdown_via_headless(markdown_text: str, title: str = "Notes") -> bytes:
    """Render a PDF by loading a minimal HTML page that renders MD + KaTeX client-side.

    Uses Playwright to set page content with CDN assets for Marked, DOMPurify, KaTeX.
    """
    if sync_playwright is None:
        raise RuntimeError("playwright not installed")
    md_json = json.dumps(markdown_text or "")
    title_esc = json.dumps(title or "Notes")
    html = f"""
<!doctype html>
<html>
  <head>
    <meta charset=\"utf-8\" />
    <title>{title_esc}</title>
    {BASE_CSS}
    <style>
      body {{ background: #ffffff; }}
      main {{ max-width: 800px; margin: 0 auto; }}
    </style>
    <link rel=\"stylesheet\" href=\"https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css\" />
    <script src=\"https://cdn.jsdelivr.net/npm/marked/marked.min.js\"></script>
    <script src=\"https://cdn.jsdelivr.net/npm/dompurify@3.1.6/dist/purify.min.js\"></script>
    <script defer src=\"https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js\"></script>
    <script defer src=\"https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js\"></script>
  </head>
  <body>
    <main>
      <article id=\"output\"></article>
    </main>
    <script>
      const md = {md_json};
      const html = DOMPurify.sanitize(marked.parse(md));
      const out = document.getElementById('output');
      out.innerHTML = html;
      function doRenderMath() {{
        if (typeof renderMathInElement === 'function') {{
          renderMathInElement(out, {{
            delimiters: [
              {{ left: '$$', right: '$$', display: true }},
              {{ left: '$', right: '$', display: false }},
              {{ left: '\\(', right: '\\)', display: false }},
              {{ left: '\\[', right: '\\]', display: true }}
            ],
            throwOnError: false,
            ignoredTags: ['script','noscript','style','textarea','pre','code']
          }});
        }} else {{ setTimeout(doRenderMath, 50); }}
      }}
      doRenderMath();
    </script>
  </body>
</html>
"""
    with sync_playwright() as p:
        browser = p.chromium.launch()
        try:
            page = browser.new_page()
            page.set_content(html, wait_until="load")
            try:
                page.wait_for_selector('.katex', timeout=5000)
            except Exception:
                time.sleep(0.5)
            pdf_bytes = page.pdf(format="A4", print_background=True, margin={
                'top': '0.6in', 'bottom': '0.6in', 'left': '0.6in', 'right': '0.6in'
            })
            return pdf_bytes
        finally:
            browser.close()

# --- Notes generation ---



notes_logger = logging.getLogger("paperx.notes")
if not notes_logger.handlers:
    handler = logging.StreamHandler(sys.stdout)
    fmt = logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s")
    handler.setFormatter(fmt)
    notes_logger.addHandler(handler)
notes_logger.setLevel(logging.INFO)

OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SERPAPI_API_KEY = os.getenv("SERPAPI_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_NOTES_MODEL = os.getenv("GEMINI_NOTES_MODEL", "gemini-2.5-flash")
MAX_TRANSCRIPT_CHARS_FOR_NOTES = int(os.getenv("TRANSCRIPT_NOTES_MAX_CHARS", "20000"))

ALLOWED_DOMAINS = [
    "geeksforgeeks.org",
    "tutorialspoint.com",
    "scaler.com",
    "byjus.com",
    "wikipedia.org",
    "tpointtech.com", 
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (PaperX; +https://example.com) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
}

REQ_TIMEOUT = 25


@dataclass
class SectionChunk:
    title: str
    text: str
    url: str
    quote: str = ""


@dataclass
class PageExtract:
    url: str
    title: str
    sections: List[SectionChunk] = field(default_factory=list)


def is_allowed(url: str) -> bool:
    try:
        host = urlparse(url).netloc.lower()
        return any(host.endswith(d) for d in ALLOWED_DOMAINS)
    except Exception:
        return False


def serpapi_search(topic: str, num: int = 10) -> List[str]:
    """Search constrained to allowed domains."""
    site_filter = " OR ".join([f"site:{d}" for d in ALLOWED_DOMAINS])
    q = f'{topic} ({site_filter})'
    params = {
        "engine": "google",
        "q": q,
        "num": min(20, max(5, num)),
        "hl": "en",
        "safe": "active",
        "api_key": SERPAPI_API_KEY,
    }
    notes_logger.info("SerpAPI search start", extra={
        "topic": topic,
        "query": q,
        "allowed_domains": ALLOWED_DOMAINS,
        "api_key_present": bool(SERPAPI_API_KEY),
    })
    search = GoogleSearch(params)
    try:
        results = search.get_dict()
    except Exception as exc:
        notes_logger.error("SerpAPI search failed", exc_info=exc)
        raise

    if not results:
        notes_logger.warning("SerpAPI returned empty response", extra={"topic": topic})
        return []

    err = results.get("error")
    if err:
        notes_logger.error("SerpAPI error for topic '%s': %s", topic, err)
    else:
        notes_logger.debug(
            "SerpAPI search metadata",
            extra={
                "topic": topic,
                "organic_count": len(results.get("organic_results") or []),
                "related_questions": len(results.get("related_questions") or []),
            },
        )

    urls = []
    for item in (results.get("organic_results") or []):
        link = item.get("link")
        if link and is_allowed(link):
            urls.append(link)
    # fallback: also parse "related" if available
    for item in (results.get("related_questions") or []):
        for src in (item.get("sources") or []):
            link = src.get("link")
            if link and is_allowed(link):
                urls.append(link)
    # dedup preserve order
    seen = set()
    out = []
    for u in urls:
        if u not in seen:
            seen.add(u)
            out.append(u)
    if not out:
        notes_logger.warning(
            "SerpAPI returned no URLs after filtering",
            extra={"topic": topic, "raw_count": len(urls)},
        )
    else:
        notes_logger.info(
            "SerpAPI search success",
            extra={"topic": topic, "selected_urls": out[: min(3, len(out))], "total": len(out)},
        )
    return out[:num]


def fetch(url: str) -> str:
    r = requests.get(url, headers=HEADERS, timeout=REQ_TIMEOUT)
    r.raise_for_status()
    return r.text


# -------------------- Image helpers --------------------
LOGO_HINTS = [
    "logo", "favicon", "icon", "sprite", "brandmark", "watermark",
    "placeholder", "default", "avatar", "badge", "mark"
]

def looks_like_logo(url: str) -> bool:
    u = url.lower()
    if any(h in u for h in LOGO_HINTS):
        return True
    # very small images by filename hints
    if re.search(r"[=_-](?:16|24|32|48|64)(?:x(?:16|24|32|48|64))?\.(?:png|jpg|jpeg|gif|webp)$", u):
        return True
    return False

def is_reasonable_image_url(url: str) -> bool:
    if not url:
        return False
    if looks_like_logo(url):
        return False
    return any(url.lower().endswith(ext) for ext in [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"])

def serpapi_image_urls(topic: str, num: int = 10) -> List[str]:
    params = {
        "engine": "google",
        "q": topic,
        "tbm": "isch",
        "num": min(20, max(5, num)),
        "safe": "active",
        "api_key": SERPAPI_API_KEY,
        "hl": "en",
    }
    try:
        search = GoogleSearch(params)
        results = search.get_dict()
    except Exception:
        return []
    urls: List[str] = []
    for item in (results.get("images_results") or []):
        link = item.get("original") or item.get("thumbnail") or item.get("link")
        if link and is_reasonable_image_url(link):
            urls.append(link)
    # dedup
    seen = set()
    out: List[str] = []
    for u in urls:
        if u not in seen:
            seen.add(u)
            out.append(u)
    return out[:num]


def normalize_text(txt: str) -> str:
    txt = re.sub(r"\s+", " ", txt).strip()
    return txt


def extract_sections_from_html(url: str, html: str) -> PageExtract:
    """Extract title and sectioned text by H1/H2/H3."""
    soup = BeautifulSoup(html, "html.parser")
    title = soup.title.get_text(strip=True) if soup.title else url
    # remove nav/aside/footer/scripts
    for tag in soup(["script", "style", "noscript", "header", "footer", "nav", "form", "aside"]):
        tag.decompose()

    # identify content area heuristically
    main = soup.find(["article", "main"]) or soup.body or soup

    # Gather headings and their content
    sections: List[SectionChunk] = []
    headings = main.find_all(["h1", "h2", "h3"])
    if not headings:
        # fallback: big paragraphs
        text = normalize_text(main.get_text(" "))
        if text:
            sections.append(SectionChunk(title="Content", text=text, url=url))
        return PageExtract(url=url, title=title, sections=sections)

    for i, h in enumerate(headings):
        h_title = normalize_text(h.get_text(" "))
        content_parts = []
        for sib in h.next_siblings:
            if getattr(sib, "name", None) in ["h1", "h2", "h3"]:
                break
            if getattr(sib, "name", None) in ["p", "ul", "ol", "pre", "code", "table", "div"]:
                content_parts.append(sib.get_text(" ", strip=True))
            elif isinstance(sib, str):
                content_parts.append(str(sib).strip())
        content = normalize_text(" ".join([c for c in content_parts if c]))
        if h_title and content:
            # extract a short quote (first 200 chars) to attach as citation span
            quote = content[:200]
            sections.append(SectionChunk(title=h_title, text=content, url=url, quote=quote))
    return PageExtract(url=url, title=title, sections=sections)


def extract_image_urls_from_html(url: str, html: str, max_images: int = 10) -> List[str]:
    soup = BeautifulSoup(html, "html.parser")
    # remove non-content containers to reduce boilerplate images
    for tag in soup(["script", "style", "noscript", "header", "footer", "nav", "form", "aside"]):
        tag.decompose()
    images: List[str] = []
    for img in soup.find_all("img"):
        src = img.get("src") or img.get("data-src") or img.get("data-original")
        if not src:
            continue
        # resolve relative URLs
        if src.startswith("//"):
            src = f"https:{src}"
        elif src.startswith("/"):
            parsed = urlparse(url)
            src = f"{parsed.scheme}://{parsed.netloc}{src}"
        alt_text = (img.get("alt") or "").lower()
        if any(k in alt_text for k in ["logo", "icon", "favicon"]):
            continue
        if is_reasonable_image_url(src):
            images.append(src)
        if len(images) >= max_images:
            break
    # dedup preserve order
    seen = set()
    out: List[str] = []
    for u in images:
        if u not in seen:
            seen.add(u)
            out.append(u)
    return out[:max_images]


def unify_section_titles(pages: List[PageExtract]) -> List[str]:
    """
    Build a merged set of section titles observed across pages.
    Use fuzzy grouping to avoid duplicates (e.g., 'Advantages' vs 'Pros').
    """
    titles = []
    for p in pages:
        for s in p.sections:
            titles.append(s.title)

    # fuzzy dedup
    merged: List[str] = []
    for t in titles:
        if not t:
            continue
        if not merged:
            merged.append(t)
            continue
        scores = [fuzz.token_set_ratio(t.lower(), m.lower()) for m in merged]
        if max(scores) >= 85:
            # treat as same; skip adding
            continue
        merged.append(t)

    # Always ensure compulsory blocks exist as "virtual" targets
    compulsory = ["Introduction", "TL;DR", "Examples", "Conclusion", "Memory Aids", "Common Mistakes"]
    for c in compulsory:
        if all(fuzz.token_set_ratio(c.lower(), m.lower()) < 85 for m in merged):
            merged.append(c)
    return merged


def assemble_context_for_llm(pages: List[PageExtract], merged_titles: List[str], topic: str) -> str:
    """
    Build a compact, source-quoted context the model can use.
    """
    lines = [f"Topic: {topic}", "", "SOURCE EXCERPTS (keep factual grounding):"]
    for p in pages:
        lines.append(f"\n### {p.title}\nURL: {p.url}")
        for s in p.sections[:8]:  # keep compact
            lines.append(f"- [{s.title}] {s.quote}…")
    lines.append("\nMERGED SECTION TITLES CANDIDATE ORDER:")
    for t in merged_titles:
        lines.append(f"- {t}")
    return "\n".join(lines)


SYSTEM_INSTRUCTIONS = """You are a senior educational writer building accurate, well-structured notes for college students in India.

CRITICAL RULES:
- Use ONLY the source excerpts provided; do not invent facts. If a fact is not supported, mark it as [needs review].
- Respect section headings actually observed on the referenced pages. You may merge similar headings (e.g., Advantages/Pros).
- You MUST also include these blocks even if not present: Introduction, TL;DR in short simple points, Examples, Conclusion, Memory Aids, Common Mistakes.
- Keep explanations concise but complete; use bullet points where helpful.
- Include at least one Mermaid diagram when process/relationships are relevant.
- Every non-obvious claim MUST carry an inline citation like [GFG], [TP], [Scaler], [Wiki], or [TPT] mapped in the CITATIONS section.
- Prefer plain text + Mermaid diagrams; do not embed external images.
 - Bold important keywords, symbols, and technical terms using Markdown **double asterisks**. Examples: **epsilon-greedy (ε-greedy)**, **Markov Decision Process (MDP)**, parameters like **θ**, **γ**, **α**, algorithm names like **Q-learning**.

OUTPUT FORMAT (STRICT):
Return a single Markdown document with:
1) A title line: '# <Topic>'
2) For each merged section title (after light normalization), a '## <Section>' block
3) Use bullet points, short paragraphs, tables when appropriate (GitHub MD)
4) Mermaid diagram(s) in fenced code blocks: ```mermaid ... ```
5) A final '## CITATIONS' list mapping labels to URLs with short quoted spans

If sources contradict, mark the line with [conflict] and keep both with citations.

Keep it under ~1200–1500 words unless the topic is inherently longer.
"""


def build_agent() -> AssistantAgent:
    model_client = gemini_model_client
    assistant = AssistantAgent(
        "paperx_notes_agent",
        model_client=model_client,
        system_message=SYSTEM_INSTRUCTIONS,
    )
    return assistant


# --- Helper: safely run async assistant from sync code (works inside running event loop) ---

def _run_assistant_blocking(assistant: AssistantAgent, user_prompt: str):
    async def _coro():
        return await assistant.run(task=user_prompt)
    try:
        # If we're in a running loop (e.g., FastAPI), offload to a thread
        asyncio.get_running_loop()
        import concurrent.futures
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as ex:
            return ex.submit(lambda: asyncio.run(_coro())).result()
    except RuntimeError:
        # No running loop (CLI), safe to use asyncio.run directly
        return asyncio.run(_coro())


def generate_notes_markdown(topic: str) -> str:
    # 1) Search
    notes_logger.info("generate_notes_markdown:start", extra={"topic": topic})
    urls = serpapi_search(topic, num=10)
    if not urls:
        notes_logger.error("generate_notes_markdown:no_urls", extra={"topic": topic})
        raise RuntimeError("No results from allowed domains.")

    # 2) Fetch & extract
    pages: List[PageExtract] = []
    for u in urls[:6]:  # keep it tight
        try:
            html = fetch(u)
            pages.append(extract_sections_from_html(u, html))
            notes_logger.debug("Fetched page", extra={"topic": topic, "url": u})
        except Exception as e:
            # ignore broken pages
            notes_logger.warning(
                "Fetch failed", extra={"topic": topic, "url": u, "error": str(e)}
            )
            continue

    if not pages:
        notes_logger.error("generate_notes_markdown:no_pages", extra={"topic": topic})
        raise RuntimeError("Failed to extract any pages.")

    # 3) Merge section titles from sources
    merged_titles = unify_section_titles(pages)
    notes_logger.debug(
        "Merged titles",
        extra={"topic": topic, "titles": merged_titles[: min(5, len(merged_titles))]},
    )

    # 4) Build context for LLM
    context = assemble_context_for_llm(pages, merged_titles, topic)

    # 5) Call AutoGen Assistant
    assistant = build_agent()
    user_prompt = f"""
You will compose the final Markdown notes now.

Context:
{context}

Instructions:
- Normalize section titles only lightly (e.g., "Applications" vs. "Use Cases" → pick one).
- Include the compulsory sections even if they were not present in sources.
- Generate at least one mermaid diagram if suitable (e.g., flow of algorithm, hierarchy, pipeline).
- Build a final '## CITATIONS' mapping labels [GFG], [TPT], [Scaler], [Wiki], [TP] to URLs you used.
- Inline-cite like: "... property ... [GFG]" or "... step ... [Wiki]" after the sentence.
 - Bold important keywords/terms and symbols (e.g., θ, γ, α, ε-greedy, key definitions) with **...** consistently; avoid over-bolding.

Start with '# {topic}' and then the sections in a logical order.
"""
    # Use safe runner to support both CLI and FastAPI contexts
    result = _run_assistant_blocking(assistant, user_prompt)
    content = result.messages[-1].content
    notes_logger.info("generate_notes_markdown:success", extra={"topic": topic, "length": len(content)})
    return content


# ---------------- New: Streaming events generator for UI/API ----------------

def generate_notes_events(topic: str, *, stop_event: Optional[threading.Event] = None) -> Iterator[Tuple[str, Dict[str, Any]]]:
    """Yield (event_name, payload) tuples describing real-time progress and final output.

    Events emitted in order (names):
      - start
      - search_results
      - fetch_start / fetch_done / fetch_error
      - merged_titles
      - context_ready
      - llm_start / llm_done
      - images
      - final (includes markdown + image_urls)
      - error (early termination on fatal error)
    """
    try:
        if stop_event and stop_event.is_set():
            return
        yield ("start", {"topic": topic, "allowed_domains": ALLOWED_DOMAINS})
        if stop_event and stop_event.is_set():
            return
        urls = serpapi_search(topic, num=10)
        if stop_event and stop_event.is_set():
            return
        if not urls:
            yield ("error", {"message": "No results from allowed domains."})
            return
        yield ("search_results", {"urls": urls})

        # Fetch & extract
        pages: List[PageExtract] = []
        for u in urls[:6]:
            if stop_event and stop_event.is_set():
                return
            yield ("fetch_start", {"url": u})
            try:
                html = fetch(u)
                page = extract_sections_from_html(u, html)
                pages.append(page)
                yield ("fetch_done", {"url": u, "title": page.title, "sections": len(page.sections)})
            except Exception as e:
                yield ("fetch_error", {"url": u, "error": str(e)})

        if not pages:
            yield ("error", {"message": "Failed to extract any pages."})
            return

        if stop_event and stop_event.is_set():
            return
        merged_titles = unify_section_titles(pages)
        yield ("merged_titles", {"titles": merged_titles})

        if stop_event and stop_event.is_set():
            return
        context = assemble_context_for_llm(pages, merged_titles, topic)
        yield ("context_ready", {"chars": len(context)})

        assistant = build_agent()
        user_prompt = f"""
You will compose the final Markdown notes now.

Context:
{context}

Instructions:
- Normalize section titles only lightly (e.g., "Applications" vs. "Use Cases" → pick one).
- Include the compulsory sections even if they were not present in sources.
- Generate at least one mermaid diagram if suitable (e.g., flow of algorithm, hierarchy, pipeline).
- Build a final '## CITATIONS' mapping labels [GFG], [TPT], [Scaler], [Wiki], [TP] to URLs you used.
- Inline-cite like: "... property ... [GFG]" or "... step ... [Wiki]" after the sentence.
 - Bold important keywords/terms and symbols (e.g., θ, γ, α, ε-greedy, key definitions) with **...** consistently; avoid over-bolding.

Start with '# {topic}' and then the sections in a logical order.
        """
        yield ("llm_start", {})
        try:
            # Use safe runner in case we're under FastAPI's loop
            result = _run_assistant_blocking(assistant, user_prompt)
            content = result.messages[-1].content
        except Exception as e:
            yield ("error", {"message": f"LLM error: {e}"})
            return
        yield ("llm_done", {"md_chars": len(content)})

        if stop_event and stop_event.is_set():
            return
        # Images from SERP + pages
        related_pages = urls[:8]
        image_urls = collect_image_urls(topic, related_pages, stop_event=stop_event)
        if stop_event and stop_event.is_set():
            return
        yield ("images", {"count": len(image_urls)})

        yield ("final", {"markdown": content, "image_urls": image_urls})
    except Exception as e:
        # last-resort catch to keep stream alive with an error
        yield ("error", {"message": str(e)})


def collect_image_urls(topic: str, page_urls: List[str], stop_event: Optional[threading.Event] = None) -> List[str]:
    if stop_event and stop_event.is_set():
        return []
    urls: List[str] = []
    # 1) From SerpAPI image search
    urls.extend(serpapi_image_urls(topic, num=12))
    if stop_event and stop_event.is_set():
        return urls
    # 2) From parsed webpages
    for u in page_urls[:6]:
        if stop_event and stop_event.is_set():
            break
        try:
            html = fetch(u)
        except Exception:
            continue
        urls.extend(extract_image_urls_from_html(u, html, max_images=6))
    # deduplicate while preserving order
    seen = set()
    out: List[str] = []
    for link in urls:
        if link not in seen:
            seen.add(link)
            out.append(link)
    return out[:20]


def save_md(topic: str, md_text: str) -> str:
    safe = re.sub(r"[^a-zA-Z0-9_.-]+", "_", topic.strip())[:80]
    fname = f"{safe}.md"
    with open(fname, "w", encoding="utf-8") as f:
        f.write(md_text)
    return os.path.abspath(fname)


def main():
    if len(sys.argv) < 2:
        print("Usage: python paperx_notes.py \"<topic>\"")
        sys.exit(1)

    topic = sys.argv[1].strip()
    
    print(f"[Paper X] Generating notes for topic: {topic}\n"
          f"Allowed domains: {', '.join(ALLOWED_DOMAINS)}\n")

    md_text = generate_notes_markdown(topic)
    path = save_md(topic, md_text)
    print(md_text)
    # Collect related images without downloading (URLs only)
    related_pages = serpapi_search(topic, num=8)
    image_urls = collect_image_urls(topic, related_pages)
    if image_urls:
        print("\n---\nRelated image URLs (filtered, no logos):")
        for i, u in enumerate(image_urls, 1):
            print(f"{i}. {u}")
    print("\n---\nSaved:", path)


if __name__ == "__main__":
    main()

# --- Academics schemas ---



class BatchIn(BaseModel):
    from_year: int = Field(..., ge=1950, le=2100, alias="from")
    to_year: int = Field(..., ge=1950, le=2100, alias="to")

    @validator("to_year")
    def check_range(cls, v, values):
        f = values.get("from_year")
        if f is not None and v < f:
            raise ValueError("to_year must be >= from_year")
        return v


class DepartmentCreateIn(BaseModel):
    name: str
    batches: List[BatchIn]

    @validator("name")
    def normalize_name(cls, v: str):
        value = (v or "").strip()
        if not value:
            raise ValueError("Department name required.")
        return value.upper()

    @validator("batches")
    def ensure_batches(cls, v: List[BatchIn]):
        if not v:
            raise ValueError("Add at least one batch range.")
        seen: set[Tuple[int, int]] = set()
        unique: List[BatchIn] = []
        for batch in v:
            pair = (batch.from_year, batch.to_year)
            if pair in seen:
                continue
            seen.add(pair)
            unique.append(batch)
        return unique


class DegreeCreateIn(BaseModel):
    name: str = Field(..., min_length=2, max_length=256)
    level: Optional[str] = Field(None, max_length=64)
    duration_years: Optional[int] = Field(None, ge=1, le=10)
    departments: List[DepartmentCreateIn]

    @validator("name")
    def trim_degree_name(cls, v: str):
        value = (v or "").strip()
        if not value:
            raise ValueError("Degree name required.")
        return value

    @validator("departments")
    def ensure_departments(cls, v: List[DepartmentCreateIn]):
        if not v:
            raise ValueError("Add at least one department to the degree.")
        seen: set[str] = set()
        for dept in v:
            key = dept.name.upper()
            if key in seen:
                raise ValueError(f"Duplicate department '{dept.name}' in the same degree.")
            seen.add(key)
        return v


class CollegeCreateIn(BaseModel):
    college_name: str = Field(..., min_length=2, max_length=256)
    degrees: Optional[List[DegreeCreateIn]] = None
    departments: Optional[List[str]] = None  # legacy payload support
    batches: Optional[List[BatchIn]] = None  # legacy payload support

    @validator("college_name")
    def trim_college(cls, v: str):
        value = (v or "").strip()
        if not value:
            raise ValueError("College name required.")
        return value

    @root_validator(pre=True)
    def coerce_legacy_payload(cls, values):
        if not values:
            return values
        data = dict(values)
        if data.get("degrees"):
            return data
        legacy_departments = [
            (d or "").strip() for d in (data.get("departments") or []) if (d or "").strip()
        ]
        if legacy_departments:
            legacy_batches_raw = data.get("batches") or []
            if not legacy_batches_raw:
                raise ValueError("Provide batch ranges when using legacy departments payload.")
            coerced_batches = []
            for item in legacy_batches_raw:
                if isinstance(item, BatchIn):
                    coerced_batches.append(item.dict(by_alias=True))
                elif isinstance(item, dict):
                    if "from" in item and "to" in item:
                        coerced_batches.append({"from": item["from"], "to": item["to"]})
                    elif "from_year" in item and "to_year" in item:
                        coerced_batches.append({"from": item["from_year"], "to": item["to_year"]})
                    else:
                        raise ValueError("Invalid batch entry in legacy payload.")
                else:
                    raise ValueError("Invalid batch entry in legacy payload.")
            data["degrees"] = [
                {
                    "name": "B.Tech",
                    "level": None,
                    "duration_years": None,
                    "departments": [
                        {"name": dept, "batches": coerced_batches}
                        for dept in legacy_departments
                    ],
                }
            ]
            return data
        raise ValueError("Provide at least one degree with departments and batch ranges.")

    @validator("degrees")
    def ensure_degrees(cls, v: Optional[List[DegreeCreateIn]]):
        if not v:
            raise ValueError("At least one degree is required.")
        seen: set[str] = set()
        for degree in v:
            key = degree.name.strip().lower()
            if key in seen:
                raise ValueError(f"Duplicate degree '{degree.name}'.")
            seen.add(key)
        return v


class College(BaseModel):
    id: uuid.UUID
    name: str
    logo_url: Optional[str] = None


class CollegeNameOnlyIn(BaseModel):
    name: str = Field(..., min_length=2, max_length=256)

    @validator("name")
    def trim_name(cls, v: str):
        value = (v or "").strip()
        if not value:
            raise ValueError("College name required.")
        return value


class DepartmentWithBatchesOut(BaseModel):
    id: uuid.UUID
    name: str
    batches: List[BatchIn]


class DepartmentSimpleBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=256)
    batches: Optional[List[BatchIn]] = None

    @validator("name")
    def normalize_name(cls, v: str):
        value = (v or "").strip()
        if not value:
            raise ValueError("Department name required.")
        return value.upper()

    @validator("batches")
    def dedupe_batches(cls, v: Optional[List[BatchIn]]):
        if v is None:
            return None
        seen: set[Tuple[int, int]] = set()
        unique: List[BatchIn] = []
        for batch in v:
            pair = (batch.from_year, batch.to_year)
            if pair in seen:
                continue
            seen.add(pair)
            unique.append(batch)
        return unique


class DepartmentSimpleCreateIn(DepartmentSimpleBase):
    pass


class DepartmentSimpleUpdateIn(DepartmentSimpleBase):
    pass


class DegreeOut(BaseModel):
    id: uuid.UUID
    name: str
    level: Optional[str] = None
    duration_years: Optional[int] = None
    departments: List[DepartmentWithBatchesOut]


class DegreeSimpleCreateIn(BaseModel):
    name: str = Field(..., min_length=2, max_length=256)
    level: Optional[str] = Field(None, max_length=64)
    duration_years: Optional[int] = Field(None, ge=1, le=10)

    @validator("name")
    def trim_name(cls, v: str):
        value = (v or "").strip()
        if not value:
            raise ValueError("Degree name required.")
        return value

    @validator("level")
    def normalize_level(cls, v: Optional[str]):
        if v is None:
            return None
        value = v.strip()
        return value or None


class CollegeFullOut(BaseModel):
    id: uuid.UUID
    name: str
    logo_url: Optional[str] = None
    degrees: List[DegreeOut]
    departments: List[str]
    batches: List[BatchIn]


class DepartmentOut(BaseModel):

    id: uuid.UUID
    name: str


class BatchWithIdOut(BaseModel):
    id: uuid.UUID
    from_year: int
    to_year: int


class UserAuth(BaseModel):
    email: str
    password: str


class SignupFullIn(BaseModel):
    name: str
    gender: Optional[str] = Field(None, pattern=r"^(female|male|other)$")
    phone: Optional[str] = Field(None, min_length=10, max_length=15)
    email: str
    password: str
    college: str
    department: str
    batch_from: int = Field(..., ge=1950, le=2100)
    batch_to: int = Field(..., ge=1950, le=2100)
    semester: int = Field(..., ge=1, le=12)
    regno: str

    @validator("department")
    def uppercase_dept(cls, v):
        return (v or "").upper()

    @validator("regno")
    def uppercase_regno(cls, v):
        return (v or "").upper()

    @validator("batch_to")
    def batch_years_valid(cls, v, values):
        f = values.get("batch_from")
        if f and v < f:
            raise ValueError("batch_to must be >= batch_from")
        return v


class TopicIn(BaseModel):
    topic: str = Field(..., min_length=1)

    @validator("topic", pre=True)
    def _strip_topic(cls, value: Any):  # noqa: N805
        if value is None:
            raise ValueError("Topic cannot be empty")
        if isinstance(value, str):
            trimmed = value.strip()
            if not trimmed:
                raise ValueError("Topic cannot be empty")
            return trimmed
        trimmed = str(value).strip()
        if not trimmed:
            raise ValueError("Topic cannot be empty")
        return trimmed


class UnitIn(BaseModel):
    unit_title: str = Field(..., min_length=1)
    topics: List[TopicIn]

    @validator("topics")
    def non_empty_topics(cls, v):
        return v or []


class SyllabusCourseIn(BaseModel):
    batch_id: uuid.UUID
    semester: int = Field(..., ge=1, le=12)
    course_code: str = Field(..., min_length=1, max_length=64)
    title: str = Field(..., min_length=1, max_length=256)
    units: List[UnitIn]


class TopicOut(BaseModel):
    id: uuid.UUID
    topic: str
    order_in_unit: int


class UnitOut(BaseModel):
    id: uuid.UUID
    unit_title: str
    order_in_course: int
    topics: List[TopicOut]


class SyllabusCourseOut(BaseModel):
    id: uuid.UUID
    batch_id: uuid.UUID
    semester: int
    course_code: str
    title: str
    units: List[UnitOut]


class SyllabusCourseSummaryOut(BaseModel):
    id: uuid.UUID
    batch_id: uuid.UUID
    semester: int
    course_code: str
    title: str


class SyllabusCourseSimpleBase(BaseModel):
    semester: int = Field(..., ge=1, le=12)
    course_code: str = Field(..., min_length=1, max_length=64)
    title: str = Field(..., min_length=1, max_length=256)

    @validator("course_code", "title", pre=True)
    def _strip_text(cls, value: Any):  # noqa: N805
        if value is None:
            raise ValueError("Value is required")
        if isinstance(value, str):
            trimmed = value.strip()
            if not trimmed:
                raise ValueError("Value is required")
            return trimmed
        return str(value)

    @validator("course_code")
    def _uppercase_code(cls, value: str):  # noqa: N805
        return value.upper()


class SyllabusCourseSimpleCreateIn(SyllabusCourseSimpleBase):
    pass


class SyllabusCourseSimpleUpdateIn(SyllabusCourseSimpleBase):
    pass


class UnitTopicsIn(BaseModel):
    unit_title: str = Field(..., min_length=1, max_length=256)
    topics: List[TopicIn] = Field(default_factory=list)

    @validator("unit_title", pre=True)
    def _normalize_unit_title(cls, value: Any):  # noqa: N805
        if value is None:
            raise ValueError("Unit title cannot be empty")
        if isinstance(value, str):
            trimmed = value.strip()
            if not trimmed:
                raise ValueError("Unit title cannot be empty")
            return trimmed
        trimmed = str(value).strip()
        if not trimmed:
            raise ValueError("Unit title cannot be empty")
        return trimmed

    @validator("topics", pre=True)
    def _ensure_topics_list(cls, value: Any):  # noqa: N805
        if value is None:
            return []
        return value


class BatchResolveIn(BaseModel):
    college_id: uuid.UUID
    dept_name: str
    from_year: int = Field(..., ge=1950, le=2100)
    to_year: int = Field(..., ge=1950, le=2100)

    @validator("dept_name")
    def uppercase_dept_public(cls, v):
        return (v or "").upper()

    @validator("to_year")
    def check_years_public(cls, v, values):
        f = values.get("from_year")
        if f and v < f:
            raise ValueError("to_year must be >= from_year")
        return v


class ParseSyllabusIn(BaseModel):
    text: str = Field(..., min_length=10)
    course_code: Optional[str] = None
    title: Optional[str] = None


class ParsedSyllabusOut(BaseModel):
    course_code: str
    title: str
    units: List[UnitIn]

# --- Academics service ---


try:
    from supabase_auth.errors import AuthRetryableError, AuthApiError  # type: ignore
except Exception:  # pragma: no cover
    class AuthRetryableError(Exception):
        pass

    class AuthApiError(Exception):
        pass


def upsert_college(name: str) -> uuid.UUID:
    supabase = get_service_client()
    res = supabase.table("colleges").select("id").eq("name", name).limit(1).execute()
    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (find college): {res.error}")
    if res.data:
        return uuid.UUID(res.data[0]["id"])

    ins = supabase.table("colleges").insert({"name": name}).execute()
    if getattr(ins, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (insert college): {ins.error}")

    res2 = supabase.table("colleges").select("id").eq("name", name).limit(1).execute()
    if getattr(res2, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (refetch college): {res2.error}")
    if not res2.data:
        raise HTTPException(status_code=500, detail="Failed to fetch inserted college.")
    return uuid.UUID(res2.data[0]["id"])


def sync_degree_hierarchy(college_id: uuid.UUID, degrees: List[DegreeCreateIn]) -> None:
    if not degrees:
        return
    supabase = get_service_client()

    degree_res = (
        supabase.table("degrees")
        .select("id,name,level,duration_years")
        .eq("college_id", str(college_id))
        .execute()
    )
    if getattr(degree_res, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (list degrees): {degree_res.error}")

    degree_map: Dict[str, Dict[str, Any]] = {}
    for row in degree_res.data or []:
        key = (row.get("name") or "").strip().lower()
        if key:
            degree_map[key] = row

    dept_res = (
        supabase.table("departments")
        .select("id,name,degree_id")
        .eq("college_id", str(college_id))
        .execute()
    )
    if getattr(dept_res, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (list departments): {dept_res.error}")
    dept_map: Dict[str, Dict[str, Any]] = {}
    for row in dept_res.data or []:
        name = (row.get("name") or "").upper()
        if name:
            dept_map[name] = row

    batch_res = (
        supabase.table("batches")
        .select("department_id,from_year,to_year")
        .eq("college_id", str(college_id))
        .execute()
    )
    if getattr(batch_res, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (list batches): {batch_res.error}")
    batches_by_department: Dict[str, set[Tuple[int, int]]] = {}
    for row in batch_res.data or []:
        dept_id = row.get("department_id")
        if not dept_id:
            continue
        from_year = row.get("from_year")
        to_year = row.get("to_year")
        if from_year is None or to_year is None:
            continue
        batches_by_department.setdefault(dept_id, set()).add((int(from_year), int(to_year)))

    for degree in degrees:
        degree_key = degree.name.strip().lower()
        degree_row = degree_map.get(degree_key)
        if degree_row:
            degree_id = uuid.UUID(degree_row["id"])
            updates: Dict[str, Any] = {}
            if degree_row.get("level") != degree.level:
                updates["level"] = degree.level
            if degree_row.get("duration_years") != degree.duration_years:
                updates["duration_years"] = degree.duration_years
            if updates:
                upd = supabase.table("degrees").update(updates).eq("id", str(degree_id)).execute()
                if getattr(upd, "error", None):
                    raise HTTPException(status_code=500, detail=f"Supabase error (update degree): {upd.error}")
                degree_row.update(updates)
        else:
            payload = {
                "college_id": str(college_id),
                "name": degree.name,
                "level": degree.level,
                "duration_years": degree.duration_years,
            }
            ins = supabase.table("degrees").insert(payload).execute()
            if getattr(ins, "error", None):
                raise HTTPException(status_code=500, detail=f"Supabase error (insert degree): {ins.error}")
            if ins.data:
                degree_row = ins.data[0]
            else:
                refetch = (
                    supabase.table("degrees")
                    .select("id,name,level,duration_years")
                    .eq("college_id", str(college_id))
                    .eq("name", degree.name)
                    .limit(1)
                    .execute()
                )
                if getattr(refetch, "error", None) or not refetch.data:
                    raise HTTPException(status_code=500, detail="Failed to insert degree.")
                degree_row = refetch.data[0]
            degree_id = uuid.UUID(degree_row["id"])
            degree_map[degree_key] = degree_row

        degree_id_str = str(degree_id)

        for department in degree.departments:
            dept_key = department.name  # already upper-case from validation
            dept_row = dept_map.get(dept_key)
            if dept_row:
                dept_id = uuid.UUID(dept_row["id"])
                if dept_row.get("degree_id") != degree_id_str:
                    upd = (
                        supabase.table("departments")
                        .update({"degree_id": degree_id_str})
                        .eq("id", str(dept_id))
                        .execute()
                    )
                    if getattr(upd, "error", None):
                        raise HTTPException(status_code=500, detail=f"Supabase error (update department): {upd.error}")
                    dept_row["degree_id"] = degree_id_str
            else:
                payload = {
                    "college_id": str(college_id),
                    "degree_id": degree_id_str,
                    "name": dept_key,
                }
                ins = supabase.table("departments").insert(payload).execute()
                if getattr(ins, "error", None):
                    raise HTTPException(status_code=500, detail=f"Supabase error (insert department): {ins.error}")
                if ins.data:
                    dept_row = ins.data[0]
                else:
                    refetch = (
                        supabase.table("departments")
                        .select("id,name,degree_id")
                        .eq("college_id", str(college_id))
                        .eq("name", dept_key)
                        .limit(1)
                        .execute()
                    )
                    if getattr(refetch, "error", None) or not refetch.data:
                        raise HTTPException(status_code=500, detail="Failed to insert department.")
                    dept_row = refetch.data[0]
                dept_map[dept_key] = dept_row
                dept_id = uuid.UUID(dept_row["id"])
                batches_by_department[str(dept_id)] = set()
            dept_id = uuid.UUID(dept_row["id"])
            dept_id_str = str(dept_id)
            existing_pairs = batches_by_department.setdefault(dept_id_str, set())
            to_insert = []
            for batch in department.batches:
                pair = (batch.from_year, batch.to_year)
                if pair in existing_pairs:
                    continue
                to_insert.append(
                    {
                        "college_id": str(college_id),
                        "department_id": dept_id_str,
                        "from_year": batch.from_year,
                        "to_year": batch.to_year,
                    }
                )
                existing_pairs.add(pair)
            if to_insert:
                ins_batches = supabase.table("batches").insert(to_insert).execute()
                if getattr(ins_batches, "error", None):
                    raise HTTPException(status_code=500, detail=f"Supabase error (insert batches): {ins_batches.error}")


def get_college_full(college_id: uuid.UUID):
    supabase = get_service_client()
    college = (
        supabase.table("colleges")
        .select("id,name,logo_url")
        .eq("id", str(college_id))
        .single()
        .execute()
    )
    if getattr(college, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (get college): {college.error}")
    if not college.data:
        raise HTTPException(status_code=404, detail="College not found.")

    degree_rows = (
        supabase.table("degrees")
        .select("id,name,level,duration_years")
        .eq("college_id", str(college_id))
        .order("name")
        .execute()
    )
    if getattr(degree_rows, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (get degrees): {degree_rows.error}")

    dept_rows = (
        supabase.table("departments")
        .select("id,name,degree_id")
        .eq("college_id", str(college_id))
        .order("name")
        .execute()
    )
    if getattr(dept_rows, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (get departments): {dept_rows.error}")

    dept_lookup: Dict[str, Dict[str, Any]] = {}
    dept_by_degree: Dict[str, List[Dict[str, Any]]] = {}
    for row in dept_rows.data or []:
        dept_id_str = row["id"]
        dept_info = {
            "id": uuid.UUID(dept_id_str),
            "name": row.get("name"),
            "batches": [],
        }
        dept_lookup[dept_id_str] = dept_info
        degree_id_str = row.get("degree_id")
        if degree_id_str:
            dept_by_degree.setdefault(degree_id_str, []).append(dept_info)

    for bucket in dept_by_degree.values():
        bucket.sort(key=lambda item: (item["name"] or "").upper())

    batch_rows = (
        supabase.table("batches")
        .select("department_id,from_year,to_year")
        .eq("college_id", str(college_id))
        .order("from_year")
        .execute()
    )
    if getattr(batch_rows, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (get batches): {batch_rows.error}")

    flat_seen: set[Tuple[int, int]] = set()
    dept_seen: Dict[str, set[Tuple[int, int]]] = {}
    flat_batches: List[BatchIn] = []
    for row in batch_rows.data or []:
        dept_id_str = row.get("department_id")
        from_year = row.get("from_year")
        to_year = row.get("to_year")
        if from_year is None or to_year is None:
            continue
        pair = (int(from_year), int(to_year))
        if pair not in flat_seen:
            flat_seen.add(pair)
            flat_batches.append(BatchIn(**{"from": pair[0], "to": pair[1]}))
        if not dept_id_str or dept_id_str not in dept_lookup:
            continue
        dept_pairs = dept_seen.setdefault(dept_id_str, set())
        if pair in dept_pairs:
            continue
        dept_pairs.add(pair)
        dept_lookup[dept_id_str]["batches"].append(BatchIn(**{"from": pair[0], "to": pair[1]}))

    for dept_info in dept_lookup.values():
        dept_info["batches"].sort(key=lambda b: (b.from_year, b.to_year))

    degree_data = sorted(degree_rows.data or [], key=lambda row: (row.get("name") or "").lower())
    degrees_out: List[DegreeOut] = []
    for row in degree_data:
        degree_id_str = row["id"]
        departments_out = [
            DepartmentWithBatchesOut(
                id=dept["id"],
                name=dept["name"],
                batches=dept["batches"],
            )
            for dept in dept_by_degree.get(degree_id_str, [])
        ]
        degrees_out.append(
            DegreeOut(
                id=uuid.UUID(degree_id_str),
                name=row.get("name"),
                level=row.get("level"),
                duration_years=row.get("duration_years"),
                departments=departments_out,
            )
        )

    department_names = sorted({(row.get("name") or "").upper() for row in (dept_rows.data or []) if row.get("name")})

    return {
        "id": uuid.UUID(college.data["id"]),
        "name": college.data["name"],
        "logo_url": college.data.get("logo_url"),
        "degrees": degrees_out,
        "departments": department_names,
        "batches": flat_batches,
    }


def _locate_department_from_snapshot(
    college_snapshot: Dict[str, Any],
    degree_id: uuid.UUID,
    department_id: uuid.UUID,
) -> DepartmentWithBatchesOut:
    degrees = college_snapshot.get("degrees") if isinstance(college_snapshot, dict) else []
    if degrees is None:
        degrees = []
    target_degree_id = uuid.UUID(str(degree_id))
    target_department_id = uuid.UUID(str(department_id))

    for degree in degrees:
        deg_id = getattr(degree, "id", None)
        if deg_id is None and isinstance(degree, dict):
            deg_id = degree.get("id")
        if deg_id is None:
            continue
        if str(deg_id) != str(target_degree_id):
            continue

        departments = getattr(degree, "departments", None)
        if departments is None and isinstance(degree, dict):
            departments = degree.get("departments")
        if not departments:
            break

        for dept in departments:
            dept_id = getattr(dept, "id", None)
            if dept_id is None and isinstance(dept, dict):
                dept_id = dept.get("id")
            if dept_id is None or str(dept_id) != str(target_department_id):
                continue

            name = getattr(dept, "name", None)
            if name is None and isinstance(dept, dict):
                name = dept.get("name")

            batches = getattr(dept, "batches", None)
            if batches is None and isinstance(dept, dict):
                batches = dept.get("batches")
            batch_models: List[BatchIn] = []
            for batch in batches or []:
                if isinstance(batch, BatchIn):
                    batch_models.append(batch)
                elif isinstance(batch, dict):
                    frm = batch.get("from") or batch.get("from_year")
                    to = batch.get("to") or batch.get("to_year")
                    if frm is not None and to is not None:
                        batch_models.append(BatchIn(**{"from": frm, "to": to}))
            return DepartmentWithBatchesOut(
                id=target_department_id,
                name=name,
                batches=batch_models,
            )

    raise HTTPException(status_code=404, detail="Department not found in college snapshot.")


def _extract_access_token(res) -> Optional[str]:
    try:
        session = getattr(res, "session", None) or (res.get("session") if isinstance(res, dict) else None)
        if session:
            token = getattr(session, "access_token", None) or (session.get("access_token") if isinstance(session, dict) else None)
            if token:
                return token
    except Exception:
        pass
    return None


def _get_user_id_from_auth_response(res) -> Optional[str]:
    try:
        user = getattr(res, "user", None) or (res.get("user") if isinstance(res, dict) else None)
        if user:
            uid = getattr(user, "id", None) or (user.get("id") if isinstance(user, dict) else None)
            return uid
    except Exception:
        pass
    return None


def _resolve_college_id_by_name(college_name: str) -> uuid.UUID:
    supabase = get_service_client()
    q = (
        supabase.table("colleges")
        .select("id")
        .eq("name", college_name)
        .limit(1)
        .execute()
    )
    if getattr(q, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (find college): {q.error}")
    if not q.data:
        return upsert_college(college_name)
    return uuid.UUID(q.data[0]["id"])


def _resolve_department_id(college_id: uuid.UUID, dept_name: str) -> uuid.UUID:
    supabase = get_service_client()
    dep_q = (
        supabase.table("departments")
        .select("id")
        .eq("college_id", str(college_id))
        .eq("name", dept_name.upper())
        .limit(1)
        .execute()
    )
    if getattr(dep_q, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (find department): {dep_q.error}")
    if not dep_q.data:
        raise HTTPException(status_code=404, detail="Department not found for college")
    return uuid.UUID(dep_q.data[0]["id"])


def _get_or_create_batch_id(
    college_id: uuid.UUID, department_id: uuid.UUID, from_year: int, to_year: int
) -> uuid.UUID:
    supabase = get_service_client()
    sel = (
        supabase.table("batches")
        .select("id")
        .eq("college_id", str(college_id))
        .eq("department_id", str(department_id))
        .eq("from_year", from_year)
        .eq("to_year", to_year)
        .limit(1)
        .execute()
    )
    if getattr(sel, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (find batch): {sel.error}")
    if sel.data:
        return uuid.UUID(sel.data[0]["id"])

    ins = (
        supabase.table("batches")
        .insert(
            {
                "college_id": str(college_id),
                "department_id": str(department_id),
                "from_year": from_year,
                "to_year": to_year,
            }
        )
        .execute()
    )
    if getattr(ins, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (insert batch): {ins.error}")

    ref = (
        supabase.table("batches")
        .select("id")
        .eq("college_id", str(college_id))
        .eq("department_id", str(department_id))
        .eq("from_year", from_year)
        .eq("to_year", to_year)
        .limit(1)
        .execute()
    )
    if getattr(ref, "error", None) or not ref.data:
        raise HTTPException(status_code=500, detail=f"Supabase error (refetch batch): {getattr(ref, 'error', None)}")
    return uuid.UUID(ref.data[0]["id"])


def _ensure_department_batches(
    college_id: uuid.UUID, department_id: uuid.UUID, batches: Optional[List[BatchIn]]
) -> None:
    if not batches:
        return

    supabase = get_service_client()
    existing = (
        supabase.table("batches")
        .select("from_year,to_year")
        .eq("college_id", str(college_id))
        .eq("department_id", str(department_id))
        .execute()
    )
    if getattr(existing, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (list department batches): {existing.error}")

    existing_pairs: set[Tuple[int, int]] = set()
    for row in getattr(existing, "data", []) or []:
        from_year = row.get("from_year")
        to_year = row.get("to_year")
        if from_year is None or to_year is None:
            continue
        existing_pairs.add((int(from_year), int(to_year)))

    to_insert: List[Dict[str, Any]] = []
    for batch in batches:
        pair = (batch.from_year, batch.to_year)
        if pair in existing_pairs:
            continue
        to_insert.append(
            {
                "college_id": str(college_id),
                "department_id": str(department_id),
                "from_year": batch.from_year,
                "to_year": batch.to_year,
            }
        )
        existing_pairs.add(pair)

    if to_insert:
        ins = supabase.table("batches").insert(to_insert).execute()
        if getattr(ins, "error", None):
            raise HTTPException(status_code=500, detail=f"Supabase error (insert department batches): {ins.error}")


def _clean_lines(text: str) -> List[str]:
    lines = [ln.strip() for ln in (text or "").splitlines()]
    return [ln for ln in lines if ln]


def _naive_extract(text: str) -> dict:
    lines = _clean_lines(text)
    units: List[dict] = []
    current_unit: Optional[dict] = None

    unit_pat = re.compile(r"^(?:unit|module|chapter)\b[\s.:\-]*([ivx]+|\d+)?", re.IGNORECASE)

    for ln in lines:
        if unit_pat.match(ln):
            title = ln
            current_unit = {"unit_title": title, "topics": []}
            units.append(current_unit)
            continue
        if not current_unit:
            current_unit = {"unit_title": "Unit 1", "topics": []}
            units.append(current_unit)
        topic = re.sub(r"^([\-*•]+|\d+[.)])\s*", "", ln).strip()
        if topic:
            current_unit["topics"].append({"topic": topic})

    return {"course_code": None, "title": None, "units": units}


def _normalize_parsed_struct(parsed: dict, hints: dict) -> ParsedSyllabusOut:
    text_cc = hints.get("course_code") if hints else None
    text_title = hints.get("title") if hints else None

    units_in: List[UnitIn] = []
    for u in (parsed.get("units") or []):
        title = u.get("unit_title") or u.get("title") or "Unit"
        topics_src = u.get("topics") or []
        topics_in = []
        for t in topics_src:
            if isinstance(t, dict):
                tp = t.get("topic") or t.get("title") or t.get("text")
            else:
                tp = str(t)
            if tp:
                topics_in.append(TopicIn(topic=tp))
        units_in.append(UnitIn(unit_title=title, topics=topics_in))

    cc = text_cc or (parsed.get("course_code") or "") or "UNKNOWN"
    ttl = text_title or (parsed.get("title") or "") or "Untitled Course"
    return ParsedSyllabusOut(course_code=cc, title=ttl, units=units_in)


def _gemini_parse(text: str, hints: dict) -> Optional[dict]:
    if not GEMINI_API_KEY:
        return None
    try:
        import google.generativeai as genai
    except Exception:
        return None

    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-1.5-pro")
        prompt = (
            "You are a strict JSON parser. Given a raw syllabus text, extract a JSON with keys: "
            "course_code (string, optional), title (string, optional), units (array of {unit_title, topics: array of {topic}}). "
            "Keep structure concise and preserve topic order."
        )
        content = f"Hints: {json.dumps(hints or {})}\n\nSyllabus Text:\n{text}"
        resp = model.generate_content([
            {"text": prompt},
            {"text": content},
        ])
        raw = getattr(resp, "text", None)
        if not raw:
            try:
                raw = resp.candidates[0].content.parts[0].text
            except Exception:
                raw = None
        if not raw:
            return None

        m = re.search(r"```(?:json)?\s*([\s\S]*?)```", raw)
        jtxt = m.group(1) if m else raw
        return json.loads(jtxt)
    except Exception:
        return None


def parse_syllabus(payload: ParseSyllabusIn) -> ParsedSyllabusOut:
    text = (payload.text or "").strip()
    if len(text) < 10:
        raise HTTPException(status_code=400, detail="Text too short")
    hints = {"course_code": payload.course_code, "title": payload.title}

    parsed = _gemini_parse(text, hints)
    if not parsed:
        parsed = _naive_extract(text)

    norm = _normalize_parsed_struct(parsed, hints)
    if not norm.units:
        raise HTTPException(status_code=422, detail="Could not extract any units or topics")
    return norm


def signup_user(user):
    anon_client = get_anon_client()
    if not anon_client:
        raise HTTPException(status_code=500, detail="Server missing SUPABASE_ANON_KEY")
    try:
        res = anon_client.auth.sign_up({"email": user.email, "password": user.password})
        token = _extract_access_token(res)
        return {"message": "Signup initiated", "access_token": token, "raw": getattr(res, "__dict__", res)}
    except Exception as e:
        supabase_logger.exception("Signup error")
        raise HTTPException(status_code=400, detail=str(e))


def login_user(user):
    anon_client = get_anon_client()
    if not anon_client:
        raise HTTPException(status_code=500, detail="Server missing SUPABASE_ANON_KEY")
    try:
        res = anon_client.auth.sign_in_with_password({"email": user.email, "password": user.password})
        token = _extract_access_token(res)
        return {"message": "Login successful", "access_token": token, "raw": getattr(res, "__dict__", res)}
    except Exception:
        supabase_logger.exception("Login failed")
        raise HTTPException(status_code=401, detail="Invalid credentials or login failed")


def signup_full_user(payload):
    anon_client = get_anon_client()
    if not anon_client:
        raise HTTPException(status_code=500, detail="Server missing SUPABASE_ANON_KEY")
    try:
        auth_res = anon_client.auth.sign_up({"email": payload.email, "password": payload.password})
        user_id = _get_user_id_from_auth_response(auth_res)
        if not user_id:
            raise HTTPException(status_code=400, detail="Failed to create auth user")
        access_token = _extract_access_token(auth_res)

        college_id = _resolve_college_id_by_name(payload.college)
        department_id = _resolve_department_id(college_id, payload.department)
        batch_id = _get_or_create_batch_id(college_id, department_id, payload.batch_from, payload.batch_to)

        supabase = get_service_client()
        ins = (
            supabase.table("user_profiles")
            .insert(
                {
                    "auth_user_id": user_id,
                    "name": payload.name,
                    "gender": payload.gender,
                    "phone": payload.phone,
                    "email": payload.email,
                    "college_id": str(college_id),
                    "department_id": str(department_id),
                    "batch_id": str(batch_id),
                    "batch_from": payload.batch_from,
                    "batch_to": payload.batch_to,
                    "semester": payload.semester,
                    "regno": payload.regno,
                }
            )
            .execute()
        )
        if getattr(ins, "error", None):
            raise HTTPException(status_code=500, detail=f"Supabase error (insert profile): {ins.error}")

        prof_q = (
            supabase.table("user_profiles")
            .select("id")
            .eq("auth_user_id", user_id)
            .limit(1)
            .execute()
        )
        profile_id = prof_q.data[0]["id"] if prof_q.data else None
        return {
            "message": "Signup complete",
            "access_token": access_token,
            "user_id": user_id,
            "profile_id": profile_id,
        }
    except HTTPException:
        raise
    except Exception as e:
        supabase_logger.exception("Signup full error")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}")


def get_current_user_profile(token: Optional[str]):
    anon_client = get_anon_client()
    if not anon_client:
        raise HTTPException(status_code=500, detail="Server missing SUPABASE_ANON_KEY")
    if not token:
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    try:
        user_id = _get_user_id_with_retry(token)

        supabase = get_service_client()
        # Primary profile fetch with retry; if transient protocol error persists, surface a 503 so clients can retry
        try:
            prof_q = _supabase_retry(
                lambda: (
                    supabase.table("user_profiles")
                    .select("*")
                    .eq("auth_user_id", user_id)
                    .limit(1)
                    .execute()
                )
            )
        except HTTPXRemoteProtocolError as exc:  # pragma: no cover - network dependent
            supabase_logger.warning("/api/me profile fetch transient protocol error: %s", exc)
            raise HTTPException(status_code=503, detail="Upstream temporarily unavailable. Please retry.")
        if getattr(prof_q, "error", None):
            raise HTTPException(status_code=500, detail=f"Supabase error (get profile): {prof_q.error}")
        if not prof_q.data:
            raise HTTPException(status_code=404, detail="Profile not found")
        prof = prof_q.data[0]

        college = None
        department = None
        batch = None
        # FK-first resolution: rely on IDs; ignore legacy text copies (school/department/batch_range) here.
        if prof.get("college_id"):
            try:
                cq = _supabase_retry(
                    lambda: (
                        supabase.table("colleges")
                        .select("id,name")
                        .eq("id", prof["college_id"])
                        .limit(1)
                        .execute()
                    )
                )
                if getattr(cq, "error", None):
                    raise HTTPException(status_code=500, detail=f"Supabase error (college): {cq.error}")
                if cq.data:
                    college = {"id": cq.data[0]["id"], "name": cq.data[0]["name"]}
            except HTTPXRemoteProtocolError as exc:  # pragma: no cover
                supabase_logger.warning("/api/me college lookup transient protocol error: %s", exc)
        if prof.get("department_id"):
            try:
                dq = _supabase_retry(
                    lambda: (
                        supabase.table("departments")
                        .select("id,name")
                        .eq("id", prof["department_id"])
                        .limit(1)
                        .execute()
                    )
                )
                if getattr(dq, "error", None):
                    raise HTTPException(status_code=500, detail=f"Supabase error (department): {dq.error}")
                if dq.data:
                    department = {"id": dq.data[0]["id"], "name": dq.data[0]["name"]}
            except HTTPXRemoteProtocolError as exc:  # pragma: no cover
                supabase_logger.warning("/api/me department lookup transient protocol error: %s", exc)
        if prof.get("batch_id"):
            try:
                bq = _supabase_retry(
                    lambda: (
                        supabase.table("batches")
                        .select("id,from_year,to_year")
                        .eq("id", prof["batch_id"])
                        .limit(1)
                        .execute()
                    )
                )
                if getattr(bq, "error", None):
                    raise HTTPException(status_code=500, detail=f"Supabase error (batch): {bq.error}")
                if bq.data:
                    batch = {"id": bq.data[0]["id"], "from": bq.data[0]["from_year"], "to": bq.data[0]["to_year"]}
            except HTTPXRemoteProtocolError as exc:  # pragma: no cover
                supabase_logger.warning("/api/me batch lookup transient protocol error: %s", exc)

        # Placeholder; will be recomputed after education override
        syllabus = []

        related_experiences: List[Dict[str, Any]] = []
        related_education: List[Dict[str, Any]] = []
        related_certifications: List[Dict[str, Any]] = []
        related_projects: List[Dict[str, Any]] = []
        related_publications: List[Dict[str, Any]] = []
        profile_id = prof.get("id")
        if profile_id:
            related_experiences = _fetch_profile_related(
                profile_id,
                "user_experiences",
                [("order_index", False), ("start_date", True), ("created_at", False)],
            )
            related_education = _fetch_profile_related(
                profile_id,
                "user_education",
                [("order_index", False), ("created_at", False)],
            )
            related_certifications = _fetch_profile_related(
                profile_id,
                "user_certifications",
                [("order_index", False), ("issue_date", True), ("created_at", False)],
            )
            related_projects = _fetch_profile_related(
                profile_id,
                "user_portfolio_projects",
                [("order_index", False), ("start_date", True), ("created_at", False)],
            )
            related_publications = _fetch_profile_related(
                profile_id,
                "user_publications",
                [("order_index", False), ("publication_date", True), ("created_at", False)],
            )

    # Override displayed academic info from user_education if available
        final_semester = prof.get("semester")
        final_regno = prof.get("regno")
        derived_batch_years: tuple[int,int] | None = None
        if related_education:
            # Choose entry with highest current_semester else first
            sem_sorted = [e for e in related_education if isinstance(e, dict)]
            if sem_sorted:
                sem_sorted.sort(key=lambda r: (r.get("current_semester") or 0, r.get("order_index") or 0), reverse=True)
                primary_edu = sem_sorted[0]
                # Semester & Reg No
                if primary_edu.get("current_semester"):
                    final_semester = primary_edu.get("current_semester")
                if primary_edu.get("regno"):
                    final_regno = primary_edu.get("regno")
                # College/Department/Batch textual data
                edu_school = primary_edu.get("school")
                edu_department = primary_edu.get("department")
                edu_batch_range = primary_edu.get("batch_range")
                # Replace only if present to avoid wiping existing structured IDs
                if edu_school:
                    # Try resolve existing college id; do not create new here
                    try:
                        supabase = get_service_client()
                        cq2 = supabase.table("colleges").select("id,name").eq("name", edu_school).limit(1).execute()
                        if not getattr(cq2, "error", None) and cq2.data:
                            college = {"id": cq2.data[0]["id"], "name": cq2.data[0]["name"]}
                        else:
                            college = {"id": None, "name": edu_school}
                    except Exception:
                        college = {"id": None, "name": edu_school}
                if edu_department:
                    # Attempt department id resolution only if we have college id
                    try:
                        if college and college.get("id"):
                            supabase = get_service_client()
                            dq2 = (
                                supabase.table("departments").select("id,name")
                                .eq("college_id", college["id"])\
                                .eq("name", (edu_department or "").upper())
                                .limit(1)
                                .execute()
                            )
                            if not getattr(dq2, "error", None) and dq2.data:
                                department = {"id": dq2.data[0]["id"], "name": dq2.data[0]["name"]}
                            else:
                                department = {"id": None, "name": (edu_department or "").upper()}
                        else:
                            department = {"id": None, "name": (edu_department or "").upper()}
                    except Exception:
                        department = {"id": None, "name": (edu_department or "").upper()}
                if edu_batch_range and isinstance(edu_batch_range, str):
                    import re as _re
                    years_full = _re.findall(r"\b(\d{4})\b", edu_batch_range)
                    if len(years_full) >= 2:
                        try:
                            from_year = int(years_full[0])
                            to_year = int(years_full[1])
                            batch = {"id": None, "from": from_year, "to": to_year}
                            derived_batch_years = (from_year, to_year)
                        except Exception:
                            pass
        # Recompute syllabus using derived academic info
        effective_batch_id = None
        # Attempt to resolve batch id from derived years (do not create new) if we have college & department ids
        try:
            if batch and batch.get("id"):
                effective_batch_id = batch["id"]
            elif derived_batch_years and college and college.get("id") and department and department.get("id"):
                fy, ty = derived_batch_years
                bq2 = (
                    supabase.table("batches")
                    .select("id")
                    .eq("college_id", college["id"])
                    .eq("department_id", department["id"])
                    .eq("from_year", fy)
                    .eq("to_year", ty)
                    .limit(1)
                    .execute()
                )
                if not getattr(bq2, "error", None) and bq2.data:
                    effective_batch_id = bq2.data[0]["id"]
            if not effective_batch_id and prof.get("batch_id"):
                effective_batch_id = prof.get("batch_id")
            # Use final_semester (possibly overridden)
            if effective_batch_id and final_semester:
                courses_q = (
                    supabase.table("syllabus_courses")
                    .select("id,course_code,title,semester")
                    .eq("batch_id", effective_batch_id)
                    .eq("semester", final_semester)
                    .order("course_code")
                    .execute()
                )
                if getattr(courses_q, "error", None):
                    raise HTTPException(status_code=500, detail=f"Supabase error (courses): {courses_q.error}")

                course_rows = courses_q.data or []
                course_ids = [row.get("id") for row in course_rows if row.get("id")]
                units_by_course: Dict[str, List[Dict[str, Any]]] = {}
                unit_lookup: Dict[str, Dict[str, Any]] = {}

                if course_ids:
                    units_q = (
                        supabase.table("syllabus_units")
                        .select("id,course_id,unit_title,order_in_course")
                        .in_("course_id", [str(cid) for cid in course_ids])
                        .order("course_id")
                        .order("order_in_course")
                        .execute()
                    )
                    if getattr(units_q, "error", None):
                        raise HTTPException(status_code=500, detail=f"Supabase error (units): {units_q.error}")
                    for raw_unit in units_q.data or []:
                        unit_id = raw_unit.get("id")
                        course_id = raw_unit.get("course_id")
                        if not unit_id or not course_id:
                            continue
                        unit_obj = {
                            "id": unit_id,
                            "unit_title": raw_unit.get("unit_title"),
                            "order_in_course": raw_unit.get("order_in_course"),
                            "topics": [],
                        }
                        units_by_course.setdefault(course_id, []).append(unit_obj)
                        unit_lookup[unit_id] = unit_obj

                    unit_ids = list(unit_lookup.keys())
                    if unit_ids:
                        topics_q = (
                            supabase.table("syllabus_topics")
                            .select("id,unit_id,topic,order_in_unit")
                            .in_("unit_id", [str(uid) for uid in unit_ids])
                            .order("unit_id")
                            .order("order_in_unit")
                            .execute()
                        )
                        if getattr(topics_q, "error", None):
                            raise HTTPException(status_code=500, detail=f"Supabase error (topics): {topics_q.error}")
                        for raw_topic in topics_q.data or []:
                            unit_id = raw_topic.get("unit_id")
                            unit_obj = unit_lookup.get(unit_id)
                            if not unit_obj:
                                continue
                            unit_obj["topics"].append(
                                {
                                    "id": raw_topic.get("id"),
                                    "topic": raw_topic.get("topic"),
                                    "order_in_unit": raw_topic.get("order_in_unit"),
                                }
                            )

                new_syllabus: List[Dict[str, Any]] = []
                for course in course_rows:
                    cid = course.get("id")
                    course_units = units_by_course.get(cid, [])
                    for unit in course_units:
                        unit["topics"].sort(key=lambda t: (t.get("order_in_unit") or 0))
                    new_syllabus.append(
                        {
                            "id": cid,
                            "course_code": course.get("course_code"),
                            "title": course.get("title"),
                            "semester": course.get("semester"),
                            "units": course_units,
                        }
                    )
                syllabus = new_syllabus
        except HTTPException:
            raise
        except Exception:
            # keep existing syllabus (possibly empty) on failure
            pass

        return {
            "profile": {
                "id": prof["id"],
                "auth_user_id": prof["auth_user_id"],
                "email": prof.get("email"),
                "name": prof.get("name"),
                "gender": prof.get("gender"),
                "phone": prof.get("phone"),
                "semester": final_semester,
                "regno": final_regno,
                "profile_image_url": prof.get("profile_image_url"),
                "resume_url": prof.get("resume_url"),
                "headline": prof.get("headline"),
                "location": prof.get("location"),
                "dob": prof.get("dob"),
                "linkedin": prof.get("linkedin"),
                "github": prof.get("github"),
                "leetcode": prof.get("leetcode"),
                "portfolio_url": prof.get("portfolio_url"),
                "website": prof.get("website"),
                "twitter": prof.get("twitter"),
                "instagram": prof.get("instagram"),
                "medium": prof.get("medium"),
                "verification_score": prof.get("verification_score"),
                "bio": prof.get("bio"),
                "technologies": prof.get("technologies"),
                "skills": prof.get("skills"),
                "certifications": prof.get("certifications"),
                "languages": prof.get("languages"),
                "interests": prof.get("interests"),
                "project_info": prof.get("project_info"),
                "publications": prof.get("publications"),
                "achievements": prof.get("achievements"),
                "experience": prof.get("experience"),
                "experiences": related_experiences,
                "education_entries": related_education,
                "certification_entries": related_certifications,
                "portfolio_projects": related_projects,
                "publication_entries": related_publications,
                "college": college,
                "department": department,
                "batch": batch,
            },
            "syllabus": syllabus,
        }
    except HTTPException:
        raise
    except Exception as e:
        # Convert malformed/invalid token errors to 401 rather than 500
        msg = f"{e}".lower()
        if "invalid jwt" in msg or "token is malformed" in msg or "unable to parse" in msg:
            raise HTTPException(status_code=401, detail="Invalid or malformed token")
        supabase_logger.exception("/api/me error")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}")


def upsert_syllabus_course(payload: SyllabusCourseIn) -> SyllabusCourseOut:
    supabase = get_service_client()
    existing = (
        supabase.table("syllabus_courses")
        .select("id,title")
        .eq("batch_id", str(payload.batch_id))
        .eq("semester", payload.semester)
        .eq("course_code", payload.course_code)
        .limit(1)
        .execute()
    )
    if getattr(existing, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (find course): {existing.error}")
    if existing.data:
        course_id = uuid.UUID(existing.data[0]["id"])
        if existing.data[0].get("title") != payload.title:
            upd = (
                supabase.table("syllabus_courses")
                .update({"title": payload.title})
                .eq("id", str(course_id))
                .execute()
            )
            if getattr(upd, "error", None):
                raise HTTPException(status_code=500, detail=f"Supabase error (update course): {upd.error}")
    else:
        ins = (
            supabase.table("syllabus_courses")
            .insert(
                {
                    "batch_id": str(payload.batch_id),
                    "semester": payload.semester,
                    "course_code": payload.course_code,
                    "title": payload.title,
                }
            )
            .execute()
        )
        if getattr(ins, "error", None):
            raise HTTPException(status_code=500, detail=f"Supabase error (insert course): {ins.error}")
        course_id = uuid.UUID(ins.data[0]["id"]) if ins.data else None

    # Fetch units/topics after ensuring course exists
    units = []  # placeholder; actual unit sync handled elsewhere
    return SyllabusCourseOut(
        id=course_id,
        batch_id=payload.batch_id,
        semester=payload.semester,
        course_code=payload.course_code,
        title=payload.title,
        units=units,
    )


def sync_units_and_topics(course_id: uuid.UUID, units: List[UnitIn]) -> List[UnitOut]:
    supabase = get_service_client()
    ures = (
        supabase.table("syllabus_units")
        .select("id,unit_title")
        .eq("course_id", str(course_id))
        .execute()
    )
    if getattr(ures, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (list units): {ures.error}")
    unit_map: Dict[str, uuid.UUID] = {row["unit_title"]: uuid.UUID(row["id"]) for row in (ures.data or [])}

    for order_idx, u in enumerate(units):
        uid = unit_map.get(u.unit_title)
        if uid is None:
            ins = (
                supabase.table("syllabus_units")
                .insert(
                    {
                        "course_id": str(course_id),
                        "unit_title": u.unit_title,
                        "order_in_course": order_idx,
                    }
                )
                .execute()
            )
            if getattr(ins, "error", None):
                raise HTTPException(status_code=500, detail=f"Supabase error (insert unit): {ins.error}")
            ref = (
                supabase.table("syllabus_units")
                .select("id")
                .eq("course_id", str(course_id))
                .eq("unit_title", u.unit_title)
                .limit(1)
                .execute()
            )
            if getattr(ref, "error", None) or not ref.data:
                raise HTTPException(status_code=500, detail=f"Supabase error (refetch unit): {getattr(ref, 'error', None)}")
            uid = uuid.UUID(ref.data[0]["id"])
            unit_map[u.unit_title] = uid
        else:
            upd = (
                supabase.table("syllabus_units")
                .update({"order_in_course": order_idx})
                .eq("id", str(uid))
                .execute()
            )
            if getattr(upd, "error", None):
                raise HTTPException(status_code=500, detail=f"Supabase error (update unit order): {upd.error}")

        tres = (
            supabase.table("syllabus_topics")
            .select("id,topic")
            .eq("unit_id", str(uid))
            .execute()
        )
        if getattr(tres, "error", None):
            raise HTTPException(status_code=500, detail=f"Supabase error (list topics): {tres.error}")
        topic_map: Dict[str, uuid.UUID] = {row["topic"]: uuid.UUID(row["id"]) for row in (tres.data or [])}
        for t_order, t in enumerate(u.topics or []):
            tid = topic_map.get(t.topic)
            if tid is None:
                tins = (
                    supabase.table("syllabus_topics")
                    .insert(
                        {
                            "unit_id": str(uid),
                            "topic": t.topic,
                            "order_in_unit": t_order,
                        }
                    )
                    .execute()
                )
                if getattr(tins, "error", None):
                    raise HTTPException(status_code=500, detail=f"Supabase error (insert topic): {tins.error}")
                tref = (
                    supabase.table("syllabus_topics")
                    .select("id")
                    .eq("unit_id", str(uid))
                    .eq("topic", t.topic)
                    .limit(1)
                    .execute()
                )
                if getattr(tref, "error", None) or not tref.data:
                    raise HTTPException(status_code=500, detail=f"Supabase error (refetch topic): {getattr(tref, 'error', None)}")
                tid = uuid.UUID(tref.data[0]["id"])
                topic_map[t.topic] = tid
            else:
                tupd = (
                    supabase.table("syllabus_topics")
                    .update({"order_in_unit": t_order})
                    .eq("id", str(tid))
                    .execute()
                )
                if getattr(tupd, "error", None):
                    raise HTTPException(status_code=500, detail=f"Supabase error (update topic order): {tupd.error}")

    units_rows = (
        supabase.table("syllabus_units")
        .select("id,unit_title,order_in_course")
        .eq("course_id", str(course_id))
        .order("order_in_course")
        .execute()
    )
    if getattr(units_rows, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (get units): {units_rows.error}")
    out_units: List[UnitOut] = []
    for ur in (units_rows.data or []):
        uid = uuid.UUID(ur["id"])
        tops = (
            supabase.table("syllabus_topics")
            .select("id,topic,order_in_unit")
            .eq("unit_id", str(uid))
            .order("order_in_unit")
            .execute()
        )
        if getattr(tops, "error", None):
            raise HTTPException(status_code=500, detail=f"Supabase error (get topics): {tops.error}")
        out_units.append(
            UnitOut(
                id=uid,
                unit_title=ur["unit_title"],
                order_in_course=ur["order_in_course"],
                topics=[
                    TopicOut(
                        id=uuid.UUID(tr["id"]),
                        topic=tr["topic"],
                        order_in_unit=tr["order_in_unit"],
                    )
                    for tr in (tops.data or [])
                ],
            )
        )
    return out_units


def load_course_with_units(course_id: uuid.UUID) -> SyllabusCourseOut:
    supabase = get_service_client()
    course_q = (
        supabase.table("syllabus_courses")
        .select("id,batch_id,semester,course_code,title")
        .eq("id", str(course_id))
        .single()
        .execute()
    )
    if getattr(course_q, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (get course): {course_q.error}")
    if not course_q.data:
        raise HTTPException(status_code=404, detail="Course not found")

    units_rows = (
        supabase.table("syllabus_units")
        .select("id,unit_title,order_in_course")
        .eq("course_id", str(course_id))
        .order("order_in_course")
        .execute()
    )
    if getattr(units_rows, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (get units): {units_rows.error}")

    units_out: List[UnitOut] = []
    for unit_row in units_rows.data or []:
        unit_id = uuid.UUID(unit_row["id"])
        topics_rows = (
            supabase.table("syllabus_topics")
            .select("id,topic,order_in_unit")
            .eq("unit_id", str(unit_id))
            .order("order_in_unit")
            .execute()
        )
        if getattr(topics_rows, "error", None):
            raise HTTPException(status_code=500, detail=f"Supabase error (get topics): {topics_rows.error}")
        units_out.append(
            UnitOut(
                id=unit_id,
                unit_title=unit_row["unit_title"],
                order_in_course=unit_row["order_in_course"],
                topics=[
                    TopicOut(
                        id=uuid.UUID(topic_row["id"]),
                        topic=topic_row["topic"],
                        order_in_unit=topic_row["order_in_unit"],
                    )
                    for topic_row in (topics_rows.data or [])
                ],
            )
        )

    data = course_q.data
    return SyllabusCourseOut(
        id=uuid.UUID(data["id"]),
        batch_id=uuid.UUID(data["batch_id"]),
        semester=int(data["semester"]),
        course_code=data.get("course_code"),
        title=data.get("title"),
        units=units_out,
    )


def load_unit_with_topics(unit_id: uuid.UUID) -> UnitOut:
    supabase = get_service_client()
    unit_res = (
        supabase.table("syllabus_units")
        .select("id,unit_title,order_in_course")
        .eq("id", str(unit_id))
        .limit(1)
        .execute()
    )
    if getattr(unit_res, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (get unit): {unit_res.error}")
    if not unit_res.data:
        raise HTTPException(status_code=404, detail="Unit not found")

    unit_row = unit_res.data[0]
    topics_res = (
        supabase.table("syllabus_topics")
        .select("id,topic,order_in_unit")
        .eq("unit_id", str(unit_id))
        .order("order_in_unit")
        .execute()
    )
    if getattr(topics_res, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (get unit topics): {topics_res.error}")

    return UnitOut(
        id=unit_id,
        unit_title=unit_row.get("unit_title"),
        order_in_course=int(unit_row.get("order_in_course", 0)),
        topics=[
            TopicOut(
                id=uuid.UUID(topic_row["id"]),
                topic=topic_row.get("topic"),
                order_in_unit=int(topic_row.get("order_in_unit", 0)),
            )
            for topic_row in (topics_res.data or [])
        ],
    )


def resolve_or_create_batch(
    college_id: uuid.UUID, dept_name: str, from_year: int, to_year: int
) -> BatchWithIdOut:
    department_id = _resolve_department_id(college_id, dept_name)
    batch_id = _get_or_create_batch_id(college_id, department_id, from_year, to_year)
    return BatchWithIdOut(id=batch_id, from_year=from_year, to_year=to_year)


# --------------------- Progress tracking services ---------------------------

def _get_user_id_with_retry(token: str, retries: int = 3, base_delay: float = 0.25) -> str:
    anon_client = get_anon_client()
    if not anon_client:
        raise HTTPException(status_code=500, detail="Server missing SUPABASE_ANON_KEY")
    last_exc: Optional[Exception] = None
    retryable_auth_errors: tuple[Any, ...] = (AuthRetryableError,)
    if httpx is not None:
        retryable_auth_errors = retryable_auth_errors + (httpx.RemoteProtocolError,)  # type: ignore
        if HTTPXRemoteProtocolError not in retryable_auth_errors:
            retryable_auth_errors = retryable_auth_errors + (HTTPXRemoteProtocolError,)  # type: ignore
    else:
        retryable_auth_errors = retryable_auth_errors + (HTTPXRemoteProtocolError,)

    for attempt in range(retries):
        try:
            auth_user = anon_client.auth.get_user(token)
            user = getattr(auth_user, "user", None) or (auth_user.get("user") if isinstance(auth_user, dict) else None)
            user_id = getattr(user, "id", None) or (user.get("id") if isinstance(user, dict) else None)
            if not user_id:
                raise HTTPException(status_code=401, detail="Invalid token or user not found")
            return user_id
        except AuthApiError as e:
            msg = getattr(e, "message", None) or str(e) or "Invalid or expired session"
            raise HTTPException(status_code=401, detail=msg)
        except retryable_auth_errors as e:  # type: ignore
            last_exc = e
            time.sleep(base_delay * (attempt + 1))
            continue
        except Exception:
            raise
    supabase_logger.warning("Auth get_user retry exhausted: %s", last_exc)
    raise HTTPException(status_code=503, detail="Authentication service temporarily unavailable; please retry")


def _require_user_and_profile(token: Optional[str]) -> tuple[str, str]:
    anon_client = get_anon_client()
    if not anon_client:
        raise HTTPException(status_code=500, detail="Server missing SUPABASE_ANON_KEY")
    if not token:
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    user_id = _get_user_id_with_retry(token)
    supabase = get_service_client()
    prof_q = (
        supabase.table("user_profiles").select("id").eq("auth_user_id", user_id).limit(1).execute()
    )
    if getattr(prof_q, "error", None) or not prof_q.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    profile_id = prof_q.data[0]["id"]
    return user_id, profile_id


def _ensure_user_and_profile(token: Optional[str]) -> tuple[str, str]:
    """Ensure there is a user_profiles row for the authenticated user.

    Returns (auth_user_id, profile_id). Creates a minimal row if missing.
    """
    anon_client = get_anon_client()
    if not anon_client:
        raise HTTPException(status_code=500, detail="Server missing SUPABASE_ANON_KEY")
    if not token:
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    user_id = _get_user_id_with_retry(token)
    supabase = get_service_client()

    # Try existing profile first
    prof_q = (
        supabase.table("user_profiles").select("id").eq("auth_user_id", user_id).limit(1).execute()
    )
    if getattr(prof_q, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (get profile): {prof_q.error}")
    if prof_q.data:
        return user_id, prof_q.data[0]["id"]

    # Create a minimal profile using email/name from auth metadata when available
    email = None
    name = None
    try:
        auth_user = anon_client.auth.get_user(token)
        user_obj = getattr(auth_user, "user", None) or (auth_user.get("user") if isinstance(auth_user, dict) else None)
        email = (getattr(user_obj, "email", None) or (user_obj.get("email") if isinstance(user_obj, dict) else None))
        meta = (getattr(user_obj, "user_metadata", None) or (user_obj.get("user_metadata") if isinstance(user_obj, dict) else None)) or {}
        try:
            name = meta.get("full_name") or meta.get("name") or meta.get("preferred_username")
        except Exception:
            name = None
    except Exception:
        pass

    ins = (
        supabase.table("user_profiles")
        .insert({
            "auth_user_id": user_id,
            "email": email,
            "name": name,
        })
        .execute()
    )
    if getattr(ins, "error", None):
        # If a race created it already, proceed to refetch; otherwise fail
        err_txt = str(ins.error)
        if "duplicate" not in err_txt.lower():
            raise HTTPException(status_code=500, detail=f"Supabase error (create profile): {ins.error}")

    prof_q2 = (
        supabase.table("user_profiles").select("id").eq("auth_user_id", user_id).limit(1).execute()
    )
    if getattr(prof_q2, "error", None) or not prof_q2.data:
        raise HTTPException(status_code=500, detail=f"Supabase error (refetch profile): {getattr(prof_q2, 'error', None)}")
    return user_id, prof_q2.data[0]["id"]


def _get_profile_me(token: Optional[str]):
    # Ensure a profile exists (creates a minimal one for OAuth users)
    _, profile_id = _ensure_user_and_profile(token)
    supabase = get_service_client()
    prof_q = (
        supabase.table("user_profiles")
        .select(
            "id,auth_user_id,email,name,gender,phone,semester,regno,profile_image_url,resume_url,bio,linkedin,github,leetcode,specializations,projects,"\
            "headline,location,dob,portfolio_url,website,twitter,instagram,medium,verification_score,"
            "technologies,skills,certifications,languages,interests,project_info,publications,achievements,experience"
        )
        .eq("id", profile_id)
        .single()
        .execute()
    )
    if getattr(prof_q, "error", None) or not prof_q.data:
        raise HTTPException(status_code=404, detail="Profile not found")

    profile = dict(prof_q.data)
    profile_id_str = profile.get("id")
    if profile_id_str:
        profile["experiences"] = _fetch_profile_related(
            profile_id_str,
            "user_experiences",
            [("order_index", False), ("start_date", True), ("created_at", False)],
        )
        profile["education_entries"] = _fetch_profile_related(
            profile_id_str,
            "user_education",
            [("order_index", False), ("created_at", False)],
        )
        profile["certification_entries"] = _fetch_profile_related(
            profile_id_str,
            "user_certifications",
            [("order_index", False), ("issue_date", True), ("created_at", False)],
        )
        profile["portfolio_projects"] = _fetch_profile_related(
            profile_id_str,
            "user_portfolio_projects",
            [("order_index", False), ("start_date", True), ("created_at", False)],
        )
        profile["publication_entries"] = _fetch_profile_related(
            profile_id_str,
            "user_publications",
            [("order_index", False), ("publication_date", True), ("created_at", False)],
        )

    # Derive academic info strictly from education entries (FK columns if present)
    college = None
    department = None
    batch = None
    derived_semester = profile.get("semester")
    derived_regno = profile.get("regno")
    primary_edu = None
    edu_entries = profile.get("education_entries") or []
    if edu_entries:
        # choose highest current_semester, else first
        typed = [e for e in edu_entries if isinstance(e, dict)]
        if typed:
            typed.sort(key=lambda r: (r.get("current_semester") or 0, -(r.get("order_index") or 0)), reverse=True)
            primary_edu = typed[0]
    if primary_edu:
        if primary_edu.get("current_semester"):
            derived_semester = primary_edu.get("current_semester")
        if primary_edu.get("regno"):
            derived_regno = primary_edu.get("regno")
        supabase = get_service_client()
        # Prefer FK ids on education row (added by normalization) if present
        college_id = primary_edu.get("college_id")
        department_id = primary_edu.get("department_id")
        batch_id = primary_edu.get("batch_id")
        if college_id:
            cq = supabase.table("colleges").select("id,name").eq("id", college_id).limit(1).execute()
            if not getattr(cq, "error", None) and cq.data:
                college = {"id": cq.data[0]["id"], "name": cq.data[0]["name"]}
        if department_id:
            dq = supabase.table("departments").select("id,name").eq("id", department_id).limit(1).execute()
            if not getattr(dq, "error", None) and dq.data:
                department = {"id": dq.data[0]["id"], "name": dq.data[0]["name"]}
        if batch_id:
            bq = supabase.table("batches").select("id,from_year,to_year").eq("id", batch_id).limit(1).execute()
            if not getattr(bq, "error", None) and bq.data:
                batch = {"id": bq.data[0]["id"], "from": bq.data[0]["from_year"], "to": bq.data[0]["to_year"]}
        # Fallback on legacy text if FK not available
        if not college and primary_edu.get("school"):
            college = {"id": None, "name": primary_edu.get("school")}
        if not department and primary_edu.get("department"):
            department = {"id": None, "name": (primary_edu.get("department") or "").upper()}
        if not batch and primary_edu.get("batch_range"):
            import re as _re
            years = _re.findall(r"\b(\d{4})\b", primary_edu.get("batch_range") or "")
            if len(years) >= 2:
                try:
                    batch = {"id": None, "from": int(years[0]), "to": int(years[1])}
                except Exception:
                    pass
    profile["college"] = college
    profile["department"] = department
    profile["batch"] = batch
    profile["semester"] = derived_semester
    profile["regno"] = derived_regno
    return profile


def _clean_media_items(media_items: Optional[List[Dict[str, Any]]]) -> Optional[List[Dict[str, Any]]]:
    cleaned: List[Dict[str, Any]] = []
    for raw in media_items or []:
        if not isinstance(raw, dict):
            continue
        url = _strip_or_none(raw.get("url"))
        if not url:
            continue
        cleaned.append(
            {
                "kind": _strip_or_none(raw.get("kind")),
                "url": url,
                "title": _strip_or_none(raw.get("title")),
            }
        )
    return cleaned or None


def _prepare_experience_rows(rows: Optional[List[Dict[str, Any]]]) -> List[Dict[str, Any]]:
    prepared: List[Dict[str, Any]] = []
    now_iso = datetime.utcnow().isoformat()
    for idx, row in enumerate(rows or []):
        if not isinstance(row, dict):
            continue
        title = _strip_or_none(row.get("title"))
        start_date = _date_or_none(row.get("start_date"))
        if not title or not start_date:
            continue
        prepared_row: Dict[str, Any] = {
            "title": title,
            "employment_type": _strip_or_none(row.get("employment_type")),
            "company": _strip_or_none(row.get("company")),
            "company_logo_url": _strip_or_none(row.get("company_logo_url")),
            "location": _strip_or_none(row.get("location")),
            "location_type": _strip_or_none(row.get("location_type")),
            "start_date": start_date,
            "end_date": _date_or_none(row.get("end_date")),
            "is_current": bool(row.get("is_current")),
            "description": _strip_or_none(row.get("description")),
            "order_index": idx,
            "updated_at": now_iso,
        }
        media_items = row.get("media")
        cleaned_media = _clean_media_items(media_items if isinstance(media_items, list) else None)
        if cleaned_media is not None:
            prepared_row["media"] = cleaned_media
        row_id = _strip_or_none(row.get("id"))
        if not row_id:
            row_id = str(uuid.uuid4())
        prepared_row["id"] = row_id
        prepared.append(prepared_row)
    return prepared


def _prepare_education_rows(rows: Optional[List[Dict[str, Any]]]) -> List[Dict[str, Any]]:
    """Prepare revised education rows.

    Legacy keys (field_of_study, start_date, end_date) ignored after schema change.
    """
    prepared: List[Dict[str, Any]] = []
    now_iso = datetime.utcnow().isoformat()
    for idx, row in enumerate(rows or []):
        if not isinstance(row, dict):
            continue
        school = _strip_or_none(row.get("school"))
        if not school:
            continue
        # Attempt FK resolution when ids missing but names present.
        college_id_val = _strip_or_none(row.get("college_id"))
        degree_id_val = _strip_or_none(row.get("degree_id"))
        department_id_val = _strip_or_none(row.get("department_id"))
        batch_id_val = _strip_or_none(row.get("batch_id"))
        try:
            if not college_id_val and school:
                # Upsert college by name
                college_uuid = upsert_college(school)
                college_id_val = str(college_uuid)
            # Resolve or create degree if name provided and degree_id missing
            degree_name_candidate = _strip_or_none(row.get("degree"))
            if college_id_val and not degree_id_val and degree_name_candidate:
                supabase = get_service_client()
                deg_q = supabase.table("degrees").select("id").eq("college_id", college_id_val).eq("name", degree_name_candidate).limit(1).execute()
                if not getattr(deg_q, "error", None) and deg_q.data:
                    degree_id_val = deg_q.data[0]["id"]
                else:
                    ins_deg = supabase.table("degrees").insert({
                        "college_id": college_id_val,
                        "name": degree_name_candidate,
                    }).execute()
                    if not getattr(ins_deg, "error", None):
                        ref_deg = supabase.table("degrees").select("id").eq("college_id", college_id_val).eq("name", degree_name_candidate).limit(1).execute()
                        if not getattr(ref_deg, "error", None) and ref_deg.data:
                            degree_id_val = ref_deg.data[0]["id"]
            if college_id_val and not department_id_val:
                dept_name_candidate = _strip_or_none(row.get("department"))
                if dept_name_candidate:
                    try:
                        department_uuid = _resolve_department_id(uuid.UUID(college_id_val), dept_name_candidate)
                        department_id_val = str(department_uuid)
                    except HTTPException:
                        # Department not found; create minimal department without degree context
                        supabase = get_service_client()
                        dep_payload = {"college_id": college_id_val, "name": dept_name_candidate.upper()}
                        if degree_id_val:
                            dep_payload["degree_id"] = degree_id_val
                        ins_dep = supabase.table("departments").insert(dep_payload).execute()
                        if not getattr(ins_dep, "error", None):
                            ref_dep = supabase.table("departments").select("id").eq("college_id", college_id_val).eq("name", dept_name_candidate.upper()).limit(1).execute()
                            if not getattr(ref_dep, "error", None) and ref_dep.data:
                                department_id_val = ref_dep.data[0]["id"]
            if college_id_val and department_id_val and not batch_id_val:
                batch_range_raw = _strip_or_none(row.get("batch_range"))
                if batch_range_raw and "-" in batch_range_raw:
                    try:
                        yr_from = int(batch_range_raw.split("-",1)[0])
                        yr_to = int(batch_range_raw.split("-",1)[1])
                        batch_uuid = _get_or_create_batch_id(uuid.UUID(college_id_val), uuid.UUID(department_id_val), yr_from, yr_to)
                        batch_id_val = str(batch_uuid)
                    except Exception:
                        pass
        except Exception:
            # Fail soft; continue without FK resolution if anything goes wrong
            pass
        prepared_row: Dict[str, Any] = {
            "school": school,
            "degree": _strip_or_none(row.get("degree")),
            "department": _strip_or_none(row.get("department")),
            "batch_range": _strip_or_none(row.get("batch_range")),
            "regno": _strip_or_none(row.get("regno")),
            "current_semester": row.get("current_semester") if isinstance(row.get("current_semester"), int) else None,
            "grade": _strip_or_none(row.get("grade")),
            "activities": _strip_or_none(row.get("activities")),
            "description": _strip_or_none(row.get("description")),
            "order_index": idx,
            "updated_at": now_iso,
        }
        # Optional new FK id fields propagated from frontend (already resolved or chosen)
        for fk_key in ("college_id", "degree_id", "department_id", "batch_id"):
            val = _strip_or_none(row.get(fk_key))
            if val:
                prepared_row[fk_key] = val
        # Include resolved ones if not provided originally
        if college_id_val and "college_id" not in prepared_row:
            prepared_row["college_id"] = college_id_val
        if degree_id_val and "degree_id" not in prepared_row:
            prepared_row["degree_id"] = degree_id_val
        if department_id_val and "department_id" not in prepared_row:
            prepared_row["department_id"] = department_id_val
        if batch_id_val and "batch_id" not in prepared_row:
            prepared_row["batch_id"] = batch_id_val
        row_id = _strip_or_none(row.get("id"))
        if not row_id:
            row_id = str(uuid.uuid4())
        prepared_row["id"] = row_id
        prepared.append(prepared_row)
    return prepared


def _prepare_certification_rows(rows: Optional[List[Dict[str, Any]]]) -> List[Dict[str, Any]]:
    prepared: List[Dict[str, Any]] = []
    now_iso = datetime.utcnow().isoformat()
    for idx, row in enumerate(rows or []):
        if not isinstance(row, dict):
            continue
        name = _strip_or_none(row.get("name"))
        if not name:
            continue
        prepared_row: Dict[str, Any] = {
            "name": name,
            "issuing_org": _strip_or_none(row.get("issuing_org")),
            "issue_date": _date_or_none(row.get("issue_date")),
            "expiration_date": _date_or_none(row.get("expiration_date")),
            "does_not_expire": bool(row.get("does_not_expire")),
            "credential_id": _strip_or_none(row.get("credential_id")),
            "credential_url": _strip_or_none(row.get("credential_url")),
            "description": _strip_or_none(row.get("description")),
            "order_index": idx,
            "updated_at": now_iso,
        }
        row_id = _strip_or_none(row.get("id"))
        if not row_id:
            row_id = str(uuid.uuid4())
        prepared_row["id"] = row_id
        prepared.append(prepared_row)
    return prepared


def _prepare_project_rows(rows: Optional[List[Dict[str, Any]]]) -> List[Dict[str, Any]]:
    prepared: List[Dict[str, Any]] = []
    now_iso = datetime.utcnow().isoformat()
    for idx, row in enumerate(rows or []):
        if not isinstance(row, dict):
            continue
        name = _strip_or_none(row.get("name"))
        if not name:
            continue
        tech_stack_raw = row.get("tech_stack")
        tech_stack_list: Optional[List[str]] = None
        if isinstance(tech_stack_raw, list):
            tech_stack_list = [s for s in (_strip_or_none(item) for item in tech_stack_raw) if s]
        elif isinstance(tech_stack_raw, str):
            tech_stack_list = [s for s in (_strip_or_none(part) for part in tech_stack_raw.split(",")) if s]
        team_raw = row.get("team")
        team_list: Optional[List[Dict[str, Any]]] = None
        if isinstance(team_raw, list):
            normalized: List[Dict[str, Any]] = []
            for entry in team_raw:
                if isinstance(entry, dict):
                    name_val = _strip_or_none(entry.get("name"))
                    if name_val:
                        normalized.append(
                            {
                                "name": name_val,
                                "role": _strip_or_none(entry.get("role")),
                                "profile_url": _strip_or_none(entry.get("profile_url")),
                                "user_id": _strip_or_none(entry.get("user_id")),
                            }
                        )
                else:
                    item_name = _strip_or_none(entry)
                    if item_name:
                        normalized.append({"name": item_name})
            team_list = normalized or None
        elif isinstance(team_raw, str):
            members = [s for s in (_strip_or_none(part) for part in team_raw.split(",")) if s]
            if members:
                team_list = [{"name": member} for member in members]
        prepared_row: Dict[str, Any] = {
            "name": name,
            "associated_experience_id": _strip_or_none(row.get("associated_experience_id")),
            "associated_education_id": _strip_or_none(row.get("associated_education_id")),
            "start_date": _date_or_none(row.get("start_date")),
            "end_date": _date_or_none(row.get("end_date")),
            "url": _strip_or_none(row.get("url")),
            "description": _strip_or_none(row.get("description")),
            "order_index": idx,
            "updated_at": now_iso,
        }
        if tech_stack_list is not None:
            prepared_row["tech_stack"] = tech_stack_list
        if team_list is not None:
            prepared_row["team"] = team_list
        row_id = _strip_or_none(row.get("id"))
        if not row_id:
            row_id = str(uuid.uuid4())
        prepared_row["id"] = row_id
        prepared.append(prepared_row)
    return prepared


def _prepare_publication_rows(rows: Optional[List[Dict[str, Any]]]) -> List[Dict[str, Any]]:
    prepared: List[Dict[str, Any]] = []
    now_iso = datetime.utcnow().isoformat()
    for idx, row in enumerate(rows or []):
        if not isinstance(row, dict):
            continue
        title = _strip_or_none(row.get("title"))
        if not title:
            continue
        authors_raw = row.get("authors")
        authors_list: Optional[List[str]] = None
        if isinstance(authors_raw, list):
            authors_list = [s for s in (_strip_or_none(part) for part in authors_raw) if s]
        elif isinstance(authors_raw, str):
            authors_list = [s for s in (_strip_or_none(part) for part in authors_raw.split(",")) if s]
        prepared_row: Dict[str, Any] = {
            "title": title,
            "publisher": _strip_or_none(row.get("publisher")),
            "publication_date": _date_or_none(row.get("publication_date")),
            "url": _strip_or_none(row.get("url")),
            "abstract": _strip_or_none(row.get("abstract")),
            "order_index": idx,
            "updated_at": now_iso,
        }
        if authors_list is not None:
            prepared_row["authors"] = authors_list
        row_id = _strip_or_none(row.get("id"))
        if not row_id:
            row_id = str(uuid.uuid4())
        prepared_row["id"] = row_id
        prepared.append(prepared_row)
    return prepared


def _sync_profile_collection(profile_id: str, table: str, rows: List[Dict[str, Any]]):
    supabase = get_service_client()
    existing_q = (
        supabase.table(table)
        .select("id")
        .eq("user_profile_id", profile_id)
        .execute()
    )
    if getattr(existing_q, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (fetch {table}): {existing_q.error}")
    existing_ids = {row["id"] for row in (existing_q.data or []) if row.get("id")}
    incoming_ids = {row["id"] for row in rows if row.get("id")}
    to_delete = list(existing_ids - incoming_ids)

    delete_res = None
    existing_rows = [row for row in rows if row.get("id")]
    new_rows = [row for row in rows if not row.get("id")]

    if existing_rows:
        payload = [{**row, "user_profile_id": profile_id} for row in existing_rows]
        upsert = (
            supabase.table(table)
            .upsert(payload, on_conflict="id")
            .execute()
        )
        if getattr(upsert, "error", None):
            raise HTTPException(status_code=500, detail=f"Supabase error (upsert {table}): {upsert.error}")

    if new_rows:
        insert_payload = [{**row, "user_profile_id": profile_id} for row in new_rows]
        insert_res = supabase.table(table).insert(insert_payload).execute()
        if getattr(insert_res, "error", None):
            raise HTTPException(status_code=500, detail=f"Supabase error (insert {table}): {insert_res.error}")

    if to_delete:
        delete_res = (
            supabase.table(table)
            .delete()
            .in_("id", to_delete)
            .execute()
        )
        if getattr(delete_res, "error", None):
            raise HTTPException(status_code=500, detail=f"Supabase error (cleanup {table}): {delete_res.error}")

    if not rows and existing_ids and not to_delete:
        delete_res = (
            supabase.table(table)
            .delete()
            .eq("user_profile_id", profile_id)
            .execute()
        )
        if getattr(delete_res, "error", None):
            raise HTTPException(status_code=500, detail=f"Supabase error (clear {table}): {delete_res.error}")

    if delete_res is not None and getattr(delete_res, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (delete {table}): {delete_res.error}")


def _fetch_profile_related(profile_id: str, table: str, order_by: Optional[List[Tuple[str, bool]]] = None) -> List[Dict[str, Any]]:
    supabase = get_service_client()
    def _build_query():
        q = supabase.table(table).select("*").eq("user_profile_id", profile_id)
        if order_by:
            for column, desc in order_by:
                q = q.order(column, desc=bool(desc))
        return q
    try:
        res = _supabase_retry(lambda: _build_query().execute())
    except HTTPXRemoteProtocolError as exc:  # pragma: no cover - network dependent
        # Treat as empty on transient disconnects so /api/me still works
        supabase_logger.warning("profile related fetch '%s' transient protocol error: %s", table, exc)
        res = type("_R", (), {"data": [], "error": None})()
    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (fetch {table}): {res.error}")
    items: List[Dict[str, Any]] = []
    for raw in res.data or []:
        if not isinstance(raw, dict):
            continue
        item = dict(raw)
        item.pop("user_profile_id", None)
        for key in ("created_at", "updated_at", "start_date", "end_date", "issue_date", "expiration_date", "publication_date"):
            if key in item and isinstance(item[key], (datetime, date)):
                item[key] = item[key].isoformat()
        if table == "user_experiences":
            item["media"] = item.get("media") or []
        if table == "user_portfolio_projects":
            item["tech_stack"] = item.get("tech_stack") or []
            item["team"] = item.get("team") or []
        if table == "user_publications":
            item["authors"] = item.get("authors") or []
        items.append(item)
    return items


def _update_profile_me(token: Optional[str], fields: dict):
    # Ensure a profile exists (creates a minimal one for OAuth users)
    _, profile_id = _ensure_user_and_profile(token)
    supabase = get_service_client()
    # allow base fields first
    allowed = {
        "name", "phone", "bio", "linkedin", "github", "leetcode", "specializations", "projects", "semester", "regno",
        # Tunex-like extra fields:
        "headline", "location", "dob", "portfolio_url", "website", "twitter", "instagram", "medium",
        "verification_score", "technologies", "skills", "certifications", "languages", "interests",
        "project_info", "publications", "achievements", "experience",
    }
    fields = fields or {}
    experiences_payload = fields.pop("experiences", None)
    education_payload = fields.pop("education_entries", None)
    certifications_payload = fields.pop("certification_entries", None)
    projects_payload = fields.pop("portfolio_projects", None)
    publications_payload = fields.pop("publication_entries", None)

    payload = {k: v for k, v in fields.items() if k in allowed}

    # Resolve academic relations if provided
    college_name = fields.get("college_name")
    department_name = fields.get("department_name")
    batch_from = fields.get("batch_from")
    batch_to = fields.get("batch_to")

    if college_name:
        college_id = _resolve_college_id_by_name(college_name)
        payload["college_id"] = str(college_id)
        if department_name:
            department_id = _resolve_department_id(college_id, department_name)
            payload["department_id"] = str(department_id)
            if batch_from is not None and batch_to is not None:
                batch_id = _get_or_create_batch_id(college_id, department_id, int(batch_from), int(batch_to))
                payload["batch_id"] = str(batch_id)
                payload["batch_from"] = int(batch_from)
                payload["batch_to"] = int(batch_to)

    update_payload = _supabase_payload(payload)
    if update_payload:
        retry_payload = dict(update_payload)
        fallback_keys = {"college_id", "department_id", "batch_id", "batch_from", "batch_to"}
        for attempt in range(3):
            if not retry_payload:
                break
            try:
                upd = supabase.table("user_profiles").update(retry_payload).eq("id", profile_id).execute()
            except APIError as exc:
                err_code = getattr(exc, "code", None)
                err_message = getattr(exc, "message", None) or getattr(exc, "details", None) or str(exc)
                lower_msg = (err_message or "").lower()
                # If undefined column error, remove potential FK fields and retry.
                if err_code == "42703":
                    removed = False
                    for key in list(retry_payload.keys()):
                        if key in fallback_keys:
                            retry_payload.pop(key, None)
                            removed = True
                    if removed:
                        continue
                # If a DB trigger references a non-existent NEW.department_id (stale trigger), skip base update gracefully.
                if ("record \"new\" has no field" in lower_msg) or ("record new has no field" in lower_msg):
                    supabase_logger.warning("Skipping user_profiles update due to trigger missing field: %s", err_message)
                    retry_payload.clear()
                    break
                raise HTTPException(status_code=500, detail=f"Supabase error (update profile): {err_message}")

            err_msg = getattr(upd, "error", None)
            if err_msg:
                msg = str(err_msg)
                lowered = msg.lower()
                if ("42703" in lowered) or any(field in lowered for field in ("college_id", "department_id", "batch_id")):
                    removed = False
                    for key in list(retry_payload.keys()):
                        if key in fallback_keys:
                            retry_payload.pop(key, None)
                            removed = True
                    if removed:
                        continue
                # Handle stale trigger error pattern on successful call that returned an error payload
                if ("record \"new\" has no field" in lowered) or ("record new has no field" in lowered):
                    supabase_logger.warning("Skipping user_profiles update due to trigger missing field: %s", msg)
                    break
                raise HTTPException(status_code=500, detail=f"Supabase error (update profile): {msg}")
            break
    if experiences_payload is not None:
        prepared = _prepare_experience_rows(experiences_payload if isinstance(experiences_payload, list) else None)
        _sync_profile_collection(profile_id, "user_experiences", prepared)
    if education_payload is not None:
        prepared = _prepare_education_rows(education_payload if isinstance(education_payload, list) else None)
        _sync_profile_collection(profile_id, "user_education", prepared)
    if certifications_payload is not None:
        prepared = _prepare_certification_rows(certifications_payload if isinstance(certifications_payload, list) else None)
        _sync_profile_collection(profile_id, "user_certifications", prepared)
    if projects_payload is not None:
        prepared = _prepare_project_rows(projects_payload if isinstance(projects_payload, list) else None)
        _sync_profile_collection(profile_id, "user_portfolio_projects", prepared)
    if publications_payload is not None:
        prepared = _prepare_publication_rows(publications_payload if isinstance(publications_payload, list) else None)
        _sync_profile_collection(profile_id, "user_publications", prepared)
    return {"updated": True}


def _storage_get_client(svc_client):
    storage = getattr(svc_client, "storage", None)
    if callable(storage):
        storage = storage()
    if storage is None:
        raise HTTPException(status_code=500, detail="Storage client unavailable")
    return storage


def _storage_upload_bytes(svc_client, bucket: str, dest: str, content: bytes, content_type: Optional[str] = None) -> str:
    storage = _storage_get_client(svc_client)
    last_err = None
    result = None
    attempts = []
    # Attempt 1: modern signature
    try:
        attempts.append("upload(dest, bytes, opts dict upsert)")
        result = storage.from_(bucket).upload(
            dest,
            content,
            {
                "content-type": content_type or "application/octet-stream",
                "upsert": "true",
                "cache-control": "86400",
            },
        )
    except Exception as exc:
        last_err = exc
        result = None
    # Attempt 2: keyword args path/file
    if result is None:
        try:
            attempts.append("upload(path=dest, file=bytes)")
            result = storage.from_(bucket).upload(path=dest, file=content)
        except Exception as exc:
            last_err = exc
            result = None
    # Attempt 3: wrap bytes in BytesIO
    if result is None:
        import io as _io
        try:
            attempts.append("upload(path=dest, file=BytesIO)")
            result = storage.from_(bucket).upload(path=dest, file=_io.BytesIO(content))
        except Exception as exc:
            last_err = exc
            result = None
    # Attempt 4: raw simple call (legacy)
    if result is None:
        try:
            attempts.append("upload(dest, bytes)")
            result = storage.from_(bucket).upload(dest, content)
        except Exception as exc:
            last_err = exc
            result = None
    if result is None:
        # Fallback: attempt a remove then a plain upload (handles 409 duplicate when upsert unsupported)
        try:
            attempts.append("remove+reupload fallback")
            try:
                storage.from_(bucket).remove([dest])
            except Exception:
                pass
            result = storage.from_(bucket).upload(dest, content, {"content-type": content_type or "application/octet-stream"})
        except Exception as exc:
            last_err = exc
            supabase_logger.error("All upload attempts failed", extra={"bucket": bucket, "dest": dest, "attempts": attempts, "error": str(last_err)})
            raise HTTPException(status_code=500, detail=f"Upload failed: {last_err}")
    if result is None:
        supabase_logger.exception("Upload failed: %s", last_err)
        raise HTTPException(status_code=500, detail=f"Upload failed: {last_err}")
    if isinstance(result, dict) and result.get("error"):
        raise HTTPException(status_code=500, detail=f"Upload error: {result.get('error')}")
    if getattr(result, "error", None):
        raise HTTPException(status_code=500, detail=f"Upload error: {result.error}")
    return dest


def _storage_public_url(svc_client, bucket: str, path: str) -> str:
    base_url = os.getenv("SUPABASE_URL", "").rstrip("/")
    storage = _storage_get_client(svc_client)
    try:
        res = storage.from_(bucket).get_public_url(path)
        if isinstance(res, dict):
            cand = res.get("publicUrl") or res.get("publicURL") or (res.get("data") or {}).get("publicUrl")
            if cand:
                return cand
        elif isinstance(res, str):
            return res
        else:
            for attr in ("public_url", "publicUrl", "publicURL"):
                if hasattr(res, attr):
                    val = getattr(res, attr)
                    if isinstance(val, str):
                        return val
    except Exception:
        pass
    encoded = quote(path, safe="")
    return f"{base_url}/storage/v1/object/public/{bucket}/{encoded}"


def _read_upload_bytes(file_obj) -> bytes:
    try:
        file_obj.file.seek(0)
        return file_obj.file.read()
    except Exception:
        try:
            return file_obj.read()
        except Exception:
            return b""



def _upload_profile_asset(token: Optional[str], kind: str, file):
    from uuid import uuid4

    # Ensure a profile exists (creates a minimal one for OAuth users)
    _, profile_id = _ensure_user_and_profile(token)
    supabase = get_service_client()
    bucket = os.getenv("SUPABASE_BUCKET", "").strip()
    if not bucket:
        raise HTTPException(status_code=500, detail="Missing SUPABASE_BUCKET in environment")

    filename = file.filename or ("upload-" + uuid4().hex)
    ext = os.path.splitext(filename)[1].lower()
    media_kind = (kind or "").strip().lower()
    if media_kind == "image" and ext not in {".png", ".jpg", ".jpeg", ".webp"}:
        raise HTTPException(status_code=400, detail="Invalid image type")
    if media_kind == "resume" and ext not in {".pdf", ".doc", ".docx"}:
        raise HTTPException(status_code=400, detail="Invalid resume type")

    blob = _read_upload_bytes(file)
    if not blob:
        raise HTTPException(status_code=400, detail="Empty upload")

    safe_ext = ext if ext else (".png" if media_kind == "image" else ".pdf")
    dest_folder = f"profiles/{profile_id}"
    dest = f"{dest_folder}/{uuid4().hex}{safe_ext}"
    _storage_upload_bytes(supabase, bucket, dest, blob, file.content_type)
    public_url = _storage_public_url(supabase, bucket, dest)

    column = "profile_image_url" if media_kind == "image" else "resume_url"
    upd = supabase.table("user_profiles").update({column: public_url}).eq("id", profile_id).execute()
    if getattr(upd, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (update profile asset): {upd.error}")

    return {"kind": media_kind, "url": public_url, "path": dest}




def get_completed_topic_ids(token: Optional[str]):
    # Ensure a profile exists to scope progress correctly for new OAuth users
    _, profile_id = _ensure_user_and_profile(token)
    supabase = get_service_client()
    try:
        q = _supabase_retry(
            lambda: (
                supabase.table("user_topic_progress")
                .select("topic_id")
                .eq("user_profile_id", profile_id)
                .execute()
            )
        )
    except HTTPXRemoteProtocolError as exc:  # pragma: no cover - network dependent
        supabase_logger.warning("Progress lookup transient protocol error: %s", exc)
        raise HTTPException(status_code=503, detail="Upstream temporarily unavailable. Please retry.")
    if getattr(q, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (get progress): {q.error}")
    return {"completed_topic_ids": [row["topic_id"] for row in (q.data or [])]}


def toggle_topic_completion(token: Optional[str], topic_id: uuid.UUID, completed: bool):
    # Ensure a profile exists for new OAuth users
    _, profile_id = _ensure_user_and_profile(token)
    supabase = get_service_client()
    if completed:
        # Use upsert (idempotent) or gracefully ignore duplicate key errors.
        try:
            # Prefer upsert if available for idempotency
            upsert_method = getattr(supabase.table("user_topic_progress"), "upsert", None)
            if callable(upsert_method):
                resp = upsert_method({"user_profile_id": profile_id, "topic_id": str(topic_id)}).execute()
                if getattr(resp, "error", None):
                    raise HTTPException(status_code=500, detail=f"Supabase error (mark done): {resp.error}")
            else:
                resp = (
                    supabase.table("user_topic_progress")
                    .insert({"user_profile_id": profile_id, "topic_id": str(topic_id)})
                    .execute()
                )
                if getattr(resp, "error", None):
                    txt = str(resp.error).lower()
                    if "duplicate" not in txt and "unique" not in txt:
                        raise HTTPException(status_code=500, detail=f"Supabase error (mark done): {resp.error}")
        except Exception as exc:
            # Allow duplicate insert races silently
            msg = str(getattr(exc, "detail", exc))
            if not ("duplicate" in msg.lower() or "unique" in msg.lower()):
                raise
        return {"completed": True}
    else:
        resp = (
            supabase.table("user_topic_progress")
            .delete()
            .eq("user_profile_id", profile_id)
            .eq("topic_id", str(topic_id))
            .execute()
        )
        if getattr(resp, "error", None):
            raise HTTPException(status_code=500, detail=f"Supabase error (unmark done): {resp.error}")
        return {"completed": False}


def get_progress_summary(token: Optional[str]):
    _, profile_id = _require_user_and_profile(token)
    supabase = get_service_client()

    # Fetch per-course -> per-unit totals and completed counts
    # Get current user's batch/semester first to scope courses
    prof_q = (
        supabase.table("user_profiles").select("batch_id,semester").eq("id", profile_id).limit(1).execute()
    )
    if getattr(prof_q, "error", None) or not prof_q.data:
        raise HTTPException(status_code=500, detail=f"Supabase error (profile scope): {getattr(prof_q, 'error', None)}")
    batch_id = prof_q.data[0].get("batch_id")
    semester = prof_q.data[0].get("semester")

    courses_q = (
        supabase.table("syllabus_courses")
        .select("id,course_code,title,semester")
        .eq("batch_id", batch_id)
        .eq("semester", semester)
        .execute()
    )
    if getattr(courses_q, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (courses for progress): {courses_q.error}")

    # Completed set for quick lookup
    comp_q = (
        supabase.table("user_topic_progress")
        .select("topic_id")
        .eq("user_profile_id", profile_id)
        .execute()
    )
    if getattr(comp_q, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (completed topics): {comp_q.error}")
    completed_set = {row["topic_id"] for row in (comp_q.data or [])}

    summary = []
    for c in (courses_q.data or []):
        course_id = c["id"]
        units_q = (
            supabase.table("syllabus_units")
            .select("id,unit_title,order_in_course")
            .eq("course_id", course_id)
            .order("order_in_course")
            .execute()
        )
        if getattr(units_q, "error", None):
            raise HTTPException(status_code=500, detail=f"Supabase error (units for progress): {units_q.error}")
        unit_summaries = []
        course_total = 0
        course_done = 0
        for u in (units_q.data or []):
            topics_q = (
                supabase.table("syllabus_topics")
                .select("id")
                .eq("unit_id", u["id"])
                .order("order_in_unit")
                .execute()
            )
            if getattr(topics_q, "error", None):
                raise HTTPException(status_code=500, detail=f"Supabase error (topics for progress): {topics_q.error}")
            topic_ids = [t["id"] for t in (topics_q.data or [])]
            done = sum(1 for tid in topic_ids if tid in completed_set)
            total = len(topic_ids)
            unit_summaries.append({
                "unit_id": u["id"],
                "unit_title": u["unit_title"],
                "done": done,
                "total": total,
            })
            course_done += done
            course_total += total
        summary.append({
            "course_id": course_id,
            "course_code": c["course_code"],
            "title": c["title"],
            "done": course_done,
            "total": course_total,
            "units": unit_summaries,
        })

    return {"courses": summary}


# --- Projects & collaboration API ------------------------------------------


def _listify(value: Any) -> List[Any]:
    if isinstance(value, list):
        return value
    if value in (None, ""):
        return []
    return [value]


class ProjectBasics(BaseModel):
    title: str
    tagline: str
    domains: List[str] = Field(default_factory=list)
    description: str
    tech_stack: List[str] = Field(default_factory=list)


class ProjectStatus(BaseModel):
    status: str = ""
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    milestones: List[str] = Field(default_factory=list)


class ProjectLinks(BaseModel):
    github: Optional[str] = None
    demo: Optional[str] = None
    video: Optional[str] = None
    docs: Optional[str] = None


class ProjectFunding(BaseModel):
    stage: Optional[str] = None
    budget_inr: Optional[int] = None
    use: Optional[str] = None


class ProjectTeam(BaseModel):
    members: List[str] = Field(default_factory=list)
    roles_hiring: List[str] = Field(default_factory=list)
    compensation: Optional[str] = None
    hours: Optional[str] = None
    role_desc: Optional[str] = None


class ProjectIn(BaseModel):
    basics: ProjectBasics
    status: ProjectStatus
    links: ProjectLinks
    funding: ProjectFunding
    team: ProjectTeam


class ProjectOut(ProjectIn):
    id: str
    user_id: str
    cover_url: Optional[str] = None
    gallery_urls: List[str] = Field(default_factory=list)
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class ProjectApplicationIn(BaseModel):
    message: Optional[str] = None


class ProjectApplicationOut(BaseModel):
    id: str
    project_id: str
    applicant_user_id: str
    message: Optional[str] = None
    status: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class ProjectApplicationUpdateIn(BaseModel):
    status: str = Field(..., pattern=r"^(pending|accepted|rejected)$")

class CollabMessageIn(BaseModel):
    content: str


class CollabMessageOut(BaseModel):
    id: str
    application_id: str
    sender_user_id: str
    content: str
    created_at: Optional[str] = None


class SkillTestStartIn(BaseModel):
    skill: str


class SkillTestStartOut(BaseModel):
    session_id: str
    skill: str
    questions: List[Dict[str, Any]]


class SkillAnswer(BaseModel):
    question_id: str
    response: str


class SkillTestSubmitIn(BaseModel):
    answers: List[SkillAnswer]


class SkillVerificationOut(BaseModel):
    skill: str
    best_score: Optional[float] = None
    attempts: int = 0
    status: Optional[str] = None
    updated_at: Optional[str] = None



def _project_payload_from_body(body: ProjectIn, user_id: str) -> dict:
    basics = body.basics
    status = body.status
    links = body.links
    funding = body.funding
    team = body.team

    def clean_list(items: Optional[List[str]]) -> List[str]:
        return [item.strip() for item in (items or []) if isinstance(item, str) and item.strip()]

    payload = {
        "user_id": user_id,
        "title": (basics.title or "").strip(),
        "tagline": (basics.tagline or "").strip(),
        "domains": clean_list(basics.domains),
        "description": (basics.description or "").strip(),
        "tech_stack": clean_list(basics.tech_stack),
        "proj_status": (status.status or "").strip(),
        "start_date": status.start_date or None,
        "end_date": status.end_date or None,
        "milestones": clean_list(status.milestones),
        "github": (links.github or None),
        "demo": (links.demo or None),
        "video": (links.video or None),
        "docs": (links.docs or None),
        "fund_stage": (funding.stage or None),
        "fund_budget_inr": int(funding.budget_inr) if funding.budget_inr is not None else None,
        "fund_use": (funding.use or None),
        "team_members": clean_list(team.members),
        "roles_hiring": clean_list(team.roles_hiring),
        "compensation": (team.compensation or None),
        "hours": (team.hours or None),
        "role_desc": (team.role_desc or None),
    }
    return payload


def _project_row_to_out(row: dict) -> dict:
    if not row:
        raise HTTPException(status_code=500, detail="Project payload missing")
    basics = ProjectBasics(
        title=row.get("title") or "",
        tagline=row.get("tagline") or "",
        domains=_listify(row.get("domains")),
        description=row.get("description") or "",
        tech_stack=_listify(row.get("tech_stack")),
    )
    status = ProjectStatus(
        status=row.get("proj_status") or "",
        start_date=row.get("start_date"),
        end_date=row.get("end_date"),
        milestones=_listify(row.get("milestones")),
    )
    links = ProjectLinks(
        github=row.get("github"),
        demo=row.get("demo"),
        video=row.get("video"),
        docs=row.get("docs"),
    )
    funding = ProjectFunding(
        stage=row.get("fund_stage"),
        budget_inr=row.get("fund_budget_inr"),
        use=row.get("fund_use"),
    )
    team = ProjectTeam(
        members=_listify(row.get("team_members")),
        roles_hiring=_listify(row.get("roles_hiring")),
        compensation=row.get("compensation"),
        hours=row.get("hours"),
        role_desc=row.get("role_desc"),
    )
    project = ProjectOut(
        basics=basics,
        status=status,
        links=links,
        funding=funding,
        team=team,
        id=str(row.get("id")),
        user_id=str(row.get("user_id")),
        cover_url=row.get("cover_url"),
        gallery_urls=_listify(row.get("gallery_urls")),
        created_at=row.get("created_at"),
        updated_at=row.get("updated_at"),
    )
    return project.dict()


def _application_row_to_out(row: dict) -> dict:
    app = ProjectApplicationOut(
        id=str(row.get("id")),
        project_id=str(row.get("project_id")),
        applicant_user_id=str(row.get("applicant_user_id")),
        message=row.get("message"),
        status=str(row.get("status") or "pending"),
        created_at=row.get("created_at"),
        updated_at=row.get("updated_at"),
    )
    return app.dict()


def _ensure_project_exists(project_id: str) -> dict:
    supabase = get_service_client()
    res = supabase.table(PROJECTS_TABLE).select("*").eq("id", project_id).single().execute()
    if getattr(res, "error", None):
        raise HTTPException(status_code=400, detail=f"Supabase error: {res.error}")
    data = getattr(res, "data", None)
    if not data:
        raise HTTPException(status_code=404, detail="Project not found")
    return data


def _ensure_owner(project_id: str, user_id: str) -> dict:
    project = _ensure_project_exists(project_id)
    if str(project.get("user_id")) != str(user_id):
        raise HTTPException(status_code=403, detail="Not your project")
    return project


def _normalize_skill(skill: str) -> str:
    return (skill or "").strip()


def _fallback_language_for_skill(skill: str) -> str:
    low = (skill or "").lower()
    if any(key in low for key in ("python", "pandas", "django")):
        return "python"
    if any(key in low for key in ("javascript", "react", "node")):
        return "javascript"
    if "java" in low:
        return "java"
    if "c++" in low or "cpp" in low:
        return "cpp"
    if "sql" in low:
        return "sql"
    return "python"


def _fallback_questions(skill: str) -> List[Dict[str, Any]]:
    language = _fallback_language_for_skill(skill)
    base = skill or "the skill"
    skill_lower = (skill or "skill").lower()
    keywords_map = {
        "python": ["def", "list", "dict"],
        "javascript": ["function", "const", "array"],
        "java": ["class", "public", "method"],
        "cpp": ["vector", "std", "loop"],
        "sql": ["select", "where", "join"],
    }
    keywords = keywords_map.get(language, [skill_lower, "project", "team"])
    qid_prefix = uuid.uuid4().hex
    return [
        {
            "id": f"{qid_prefix}-mc",
            "kind": "ceq",
            "prompt": f"Which option best captures a practical use-case of {base}?",
            "options": [
                "A. Documenting theory without implementation",
                "B. Building or iterating on a real project with measurable outcomes",
                "C. Collecting inspirational quotes",
                "D. Focusing only on certifications",
            ],
            "answer_key": {"correct_option": "b"},
        },
        {
            "id": f"{qid_prefix}-code",
            "kind": "coding",
            "language": language,
            "prompt": f"Write a short {language} snippet that demonstrates how you would track progress while learning {base}. Include a test or printed output.",
            "answer_key": {"keywords": keywords, "min_hits": max(2, len(keywords) - 1)},
        },
        {
            "id": f"{qid_prefix}-reflect",
            "kind": "coding",
            "language": language,
            "prompt": f"Describe in {language} (code or structured comments) how you would onboard a collaborator to your {base} project, mentioning tools, communication, and deliverables.",
            "answer_key": {"keywords": ["plan", "deliverable", "feedback", base.lower()], "min_hits": 2},
        },
    ]


def _public_questions(questions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    for q in questions:
        out.append({k: v for k, v in q.items() if k != "answer_key"})
    return out


def _grade_skill_answers(questions: List[Dict[str, Any]], answers: Dict[str, str]) -> Dict[str, Any]:
    details: List[Dict[str, Any]] = []
    total = 0.0
    counted = 0
    for question in questions:
        qid = question.get("id")
        if not qid:
            continue
        kind = question.get("kind") or ""
        response = (answers.get(qid) or "").strip()
        info: Dict[str, Any] = {"question_id": qid, "kind": kind, "score": 0.0}
        if not response:
            info["feedback"] = "No answer provided."
            details.append(info)
            continue
        score = 0.0
        if kind == "ceq":
            expected = (question.get("answer_key") or {}).get("correct_option", "").strip().lower()
            if expected and response.lower().startswith(expected):
                score = 100.0
                info["feedback"] = "Correct option."
            else:
                info["feedback"] = f"Expected option {expected.upper() or '?'}"
        else:
            key = (question.get("answer_key") or {})
            keywords = key.get("keywords") if isinstance(key, dict) else None
            if keywords:
                text_lower = response.lower()
                hits = sum(1 for kw in keywords if isinstance(kw, str) and kw.lower() in text_lower)
                min_hits = key.get("min_hits") or len(keywords)
                score = min(100.0, (hits / max(1, min_hits)) * 100.0)
                info["matched_keywords"] = hits
                info["keywords"] = keywords
                info["feedback"] = f"Matched {hits} of {len(keywords)} keywords."
            else:
                score = 50.0
                info["feedback"] = "Heuristic score (no rubric)."
        score = max(0.0, min(100.0, score))
        info["score"] = round(score, 2)
        details.append(info)
        total += score
        counted += 1
    final_score = round(total / counted, 2) if counted else 0.0
    status = "verified" if final_score >= 70 else "needs_review"
    return {"score": final_score, "status": status, "details": details}


def _insert_skill_test_session(user_id: str, skill: str, questions: List[Dict[str, Any]]) -> str:
    supabase = get_service_client()
    res = supabase.table(SKILL_TESTS_TABLE).insert({
        "user_id": user_id,
        "skill": skill,
        "questions": questions,
        "status": "active",
    }).execute()
    data = getattr(res, "data", None)
    if isinstance(data, list) and data:
        return data[0].get("id")
    if isinstance(data, dict) and data.get("id"):
        return data.get("id")
    raise HTTPException(status_code=500, detail="Unable to create test session")


def _get_skill_test_session(session_id: str) -> Optional[dict]:
    supabase = get_service_client()
    res = supabase.table(SKILL_TESTS_TABLE).select("*").eq("id", session_id).single().execute()
    if getattr(res, "error", None):
        return None
    return getattr(res, "data", None)


def _update_skill_test_submission(session_id: str, result: Dict[str, Any]):
    supabase = get_service_client()
    supabase.table(SKILL_TESTS_TABLE).update({
        "status": "completed",
        "score": result.get("score"),
        "result": result,
        "submitted_at": datetime.utcnow().isoformat() + "Z",
    }).eq("id", session_id).execute()


def _upsert_skill_verification(user_id: str, skill: str, score: float):
    supabase = get_service_client()
    payload = {
        "user_id": user_id,
        "skill": skill,
        "best_score": score,
        "attempts": 1,
        "status": "verified" if score >= 70 else "needs_review",
    }
    try:
        supabase.table(SKILL_VERIFICATIONS_TABLE).upsert(payload, on_conflict="user_id,skill").execute()
    except Exception:
        existing = supabase.table(SKILL_VERIFICATIONS_TABLE).select("best_score,attempts").eq("user_id", user_id).eq("skill", skill).single().execute()
        row = getattr(existing, "data", None)
        if row:
            best = max(float(row.get("best_score") or 0.0), score)
            attempts = int(row.get("attempts") or 0) + 1
            supabase.table(SKILL_VERIFICATIONS_TABLE).update({
                "best_score": best,
                "attempts": attempts,
                "status": "verified" if best >= 70 else "needs_review",
            }).eq("user_id", user_id).eq("skill", skill).execute()
        else:
            supabase.table(SKILL_VERIFICATIONS_TABLE).insert(payload).execute()


def _recompute_profile_verification_score(user_id: str):
    supabase = get_service_client()
    res = supabase.table(SKILL_VERIFICATIONS_TABLE).select("best_score").eq("user_id", user_id).execute()
    if getattr(res, "error", None):
        return
    scores = [float(row.get("best_score") or 0.0) for row in (res.data or []) if row]
    if not scores:
        agg = 0
    else:
        top = sorted(scores, reverse=True)[:3]
        agg = round(sum(top) / len(top))
    try:
        supabase.table("user_profiles").update({"verification_score": agg}).eq("auth_user_id", user_id).execute()
    except Exception:
        pass



projects_router = APIRouter()


@projects_router.post("/api/projects", response_model=ProjectOut)
def create_project(body: ProjectIn, authorization: Optional[str] = Header(default=None)):
    token = _parse_bearer_token(authorization)
    user_id, _ = _require_user_and_profile(token)
    supabase = get_service_client()
    payload = _project_payload_from_body(body, user_id)
    res = supabase.table(PROJECTS_TABLE).insert(payload).execute()
    if getattr(res, "error", None):
        raise HTTPException(status_code=400, detail=f"Supabase error: {res.error}")
    data = getattr(res, "data", None)
    if isinstance(data, list) and data:
        return _project_row_to_out(data[0])
    if isinstance(data, dict):
        return _project_row_to_out(data)
    raise HTTPException(status_code=500, detail="Unexpected insert response")


@projects_router.get("/api/projects", response_model=List[ProjectOut])
def list_projects(limit: int = 50):
    supabase = get_service_client()
    res = (
        supabase.table(PROJECTS_TABLE)
        .select("*")
        .order("created_at", desc=True)
        .limit(max(1, min(200, limit)))
        .execute()
    )
    if getattr(res, "error", None):
        raise HTTPException(status_code=400, detail=f"Supabase error: {res.error}")
    rows = getattr(res, "data", []) or []
    return [_project_row_to_out(row) for row in rows]


@projects_router.get("/api/projects/{project_id}", response_model=ProjectOut)
def get_project(project_id: str):
    row = _ensure_project_exists(project_id)
    return _project_row_to_out(row)


@projects_router.post("/api/projects/{project_id}/upload")
async def upload_project_media(
    project_id: str,
    kind: str = Form(...),
    file: UploadFile = File(...),
    authorization: Optional[str] = Header(default=None),
):
    token = _parse_bearer_token(authorization)
    user_id, _ = _require_user_and_profile(token)
    if not PROJECTS_BUCKET:
        raise HTTPException(status_code=500, detail="Missing SUPABASE_PROJECTS_BUCKET or SUPABASE_BUCKET")

    project = _ensure_owner(project_id, user_id)
    media_kind = (kind or "").strip().lower()
    if media_kind not in PROJECT_MEDIA_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Unsupported media kind")

    extension = os.path.splitext(file.filename or "")[1].lower()
    allowed = PROJECT_MEDIA_EXTENSIONS[media_kind]
    if extension and allowed and extension not in allowed:
        raise HTTPException(status_code=400, detail="File type not allowed")

    blob = await file.read()
    if not blob:
        raise HTTPException(status_code=400, detail="Empty upload")

    safe_ext = extension or (".png" if media_kind == "cover" else ".bin")
    storage_path = f"project_assets/{user_id}/{project_id}/{media_kind}_{int(time.time())}{safe_ext}"
    supabase = get_service_client()
    _storage_upload_bytes(supabase, PROJECTS_BUCKET, storage_path, blob, file.content_type)
    public_url = _storage_public_url(supabase, PROJECTS_BUCKET, storage_path)

    update: Dict[str, Any]
    if (media_kind == "cover"):
        update = {"cover_url": public_url}
    else:
        gallery = _listify(project.get("gallery_urls"))
        gallery.append(public_url)
        update = {"gallery_urls": gallery}

    supabase.table(PROJECTS_TABLE).update(update).eq("id", project_id).execute()
    refreshed = _ensure_project_exists(project_id)
    return {
        "project": _project_row_to_out(refreshed),
        "uploaded": {"kind": media_kind, "url": public_url, "path": storage_path},
    }


@projects_router.post("/api/projects/{project_id}/apply")
def apply_to_project(project_id: str, body: ProjectApplicationIn = None, authorization: Optional[str] = Header(default=None)):
    token = _parse_bearer_token(authorization)
    user_id, _ = _require_user_and_profile(token)
    project = _ensure_project_exists(project_id)
    if str(project.get("user_id")) == str(user_id):
        raise HTTPException(status_code=400, detail="You cannot apply to your own project")

    supabase = get_service_client()
    existing = (
        supabase.table(PROJECT_APPLICATIONS_TABLE)
        .select("*")
        .eq("project_id", project_id)
        .eq("applicant_user_id", user_id)
        .limit(1)
        .execute()
    )
    rows = getattr(existing, "data", []) or []
    if rows:
        return {"ok": True, "status": rows[0].get("status") or "pending"}

    payload = {
        "project_id": project_id,
        "applicant_user_id": user_id,
        "message": ((body.message if body else None) or None),
        "status": "pending",
    }
    res = supabase.table(PROJECT_APPLICATIONS_TABLE).insert(payload).execute()
    if getattr(res, "error", None):
        msg = str(res.error).lower()
        if "duplicate" in msg or "unique" in msg:
            return {"ok": True}
        raise HTTPException(status_code=400, detail=f"Supabase error: {res.error}")
    data = getattr(res, "data", None)
    if isinstance(data, list) and data:
        return {"ok": True, "status": data[0].get("status") or "pending"}
    return {"ok": True}


@projects_router.get("/api/projects/{project_id}/applications", response_model=List[ProjectApplicationOut])
def list_project_applications(project_id: str, authorization: Optional[str] = Header(default=None)):
    token = _parse_bearer_token(authorization)
    user_id, _ = _require_user_and_profile(token)
    _ensure_owner(project_id, user_id)
    supabase = get_service_client()
    res = (
        supabase.table(PROJECT_APPLICATIONS_TABLE)
        .select("*")
        .eq("project_id", project_id)
        .order("created_at", desc=True)
        .limit(1000)
        .execute()
    )
    if getattr(res, "error", None):
        raise HTTPException(status_code=400, detail=f"Supabase error: {res.error}")
    rows = getattr(res, "data", []) or []
    return [_application_row_to_out(row) for row in rows]


@projects_router.get("/api/projects/{project_id}/applications/me")
def get_my_project_application(project_id: str, authorization: Optional[str] = Header(default=None)):
    token = _parse_bearer_token(authorization)
    user_id, _ = _require_user_and_profile(token)
    supabase = get_service_client()
    res = (
        supabase.table(PROJECT_APPLICATIONS_TABLE)
        .select("*")
        .eq("project_id", project_id)
        .eq("applicant_user_id", user_id)
        .limit(1)
        .execute()
    )
    rows = getattr(res, "data", []) or []
    if not rows:
        return {"applied": False}
    return {"applied": True, "application": _application_row_to_out(rows[0])}


@projects_router.get("/api/projects/{project_id}/applications/{application_id}", response_model=ProjectApplicationOut)
def get_project_application(project_id: str, application_id: str, authorization: Optional[str] = Header(default=None)):
    token = _parse_bearer_token(authorization)
    user_id, _ = _require_user_and_profile(token)
    _ensure_owner(project_id, user_id)
    supabase = get_service_client()
    res = (
        supabase.table(PROJECT_APPLICATIONS_TABLE)
        .select("*")
        .eq("id", application_id)
        .eq("project_id", project_id)
        .single()
        .execute()
    )
    if getattr(res, "error", None):
        raise HTTPException(status_code=400, detail=f"Supabase error: {res.error}")
    data = getattr(res, "data", None)
    if not data:
        raise HTTPException(status_code=404, detail="Application not found")
    return _application_row_to_out(data)


@projects_router.patch("/api/projects/{project_id}/applications/{application_id}")
def update_project_application(project_id: str, application_id: str, body: ProjectApplicationUpdateIn, authorization: Optional[str] = Header(default=None)):
    token = _parse_bearer_token(authorization)
    user_id, _ = _require_user_and_profile(token)
    _ensure_owner(project_id, user_id)
    supabase = get_service_client()
    supabase.table(PROJECT_APPLICATIONS_TABLE).update({"status": body.status}).eq("id", application_id).eq("project_id", project_id).execute()
    res = (
        supabase.table(PROJECT_APPLICATIONS_TABLE)
        .select("*")
        .eq("id", application_id)
        .eq("project_id", project_id)
        .single()
        .execute()
    )
    if getattr(res, "error", None):
        raise HTTPException(status_code=400, detail=f"Supabase error: {res.error}")
    row = getattr(res, "data", None)
    if not row:
        raise HTTPException(status_code=404, detail="Application not found")
    return _application_row_to_out(row)


@projects_router.get("/api/applications/incoming")
def list_incoming_applications(authorization: Optional[str] = Header(default=None)):
    token = _parse_bearer_token(authorization)
    user_id, _ = _require_user_and_profile(token)
    supabase = get_service_client()
    projects_res = supabase.table(PROJECTS_TABLE).select("id,title,cover_url").eq("user_id", user_id).limit(1000).execute()
    if getattr(projects_res, "error", None):
        raise HTTPException(status_code=400, detail=f"Supabase error: {projects_res.error}")
    projects = getattr(projects_res, "data", []) or []
    project_ids = [p.get("id") for p in projects if p and p.get("id")]
    if not project_ids:
        return {"applications": [], "projects": []}
    apps_res = (
        supabase.table(PROJECT_APPLICATIONS_TABLE)
        .select("*")
        .in_("project_id", project_ids)
        .order("created_at", desc=True)
        .limit(2000)
        .execute()
    )
    if getattr(apps_res, "error", None):
        raise HTTPException(status_code=400, detail=f"Supabase error: {apps_res.error}")
    apps = getattr(apps_res, "data", []) or []
    return {
        "applications": [_application_row_to_out(row) for row in apps],
        "projects": [{"id": p.get("id"), "title": p.get("title"), "cover_url": p.get("cover_url")} for p in projects if p],
    }


@projects_router.get("/api/applications/mine")
def list_my_applications(authorization: Optional[str] = Header(default=None)):
    token = _parse_bearer_token(authorization)
    user_id, _ = _require_user_and_profile(token)
    supabase = get_service_client()
    apps_res = (
        supabase.table(PROJECT_APPLICATIONS_TABLE)
        .select("*")
        .eq("applicant_user_id", user_id)
        .order("created_at", desc=True)
        .limit(2000)
        .execute()
    )
    if getattr(apps_res, "error", None):
        raise HTTPException(status_code=400, detail=f"Supabase error: {apps_res.error}")
    apps = getattr(apps_res, "data", []) or []
    if not apps:
        return {"applications": [], "projects": []}
    project_ids = list({row.get("project_id") for row in apps if row and row.get("project_id")})
    projects = []
    if project_ids:
        proj_res = (
            supabase.table(PROJECTS_TABLE)
            .select("id,title,cover_url")
            .in_("id", project_ids)
            .limit(2000)
            .execute()
        )
        if getattr(proj_res, "data", None):
            projects = [{"id": r.get("id"), "title": r.get("title"), "cover_url": r.get("cover_url")} for r in proj_res.data if r]
    return {
        "applications": [_application_row_to_out(row) for row in apps],
        "projects": projects,
    }


@projects_router.get("/api/applications/{application_id}")
def get_application_by_id(application_id: str, authorization: Optional[str] = Header(default=None)):
    token = _parse_bearer_token(authorization)
    user_id, _ = _require_user_and_profile(token)
    supabase = get_service_client()
    res = supabase.table(PROJECT_APPLICATIONS_TABLE).select("*").eq("id", application_id).single().execute()
    if getattr(res, "error", None):
        raise HTTPException(status_code=400, detail=f"Supabase error: {res.error}")
    row = getattr(res, "data", None)
    if not row:
        raise HTTPException(status_code=404, detail="Application not found")
    project = _ensure_project_exists(str(row.get("project_id")))
    if str(row.get("applicant_user_id")) != str(user_id) and str(project.get("user_id")) != str(user_id):
        raise HTTPException(status_code=403, detail="Not permitted")
    return _application_row_to_out(row)


@projects_router.get("/api/collab/{application_id}/messages")
def list_collab_messages(application_id: str, authorization: Optional[str] = Header(default=None)):
    token = _parse_bearer_token(authorization)
    user_id, _ = _require_user_and_profile(token)
    supabase = get_service_client()
    app_res = supabase.table(PROJECT_APPLICATIONS_TABLE).select("*").eq("id", application_id).single().execute()
    if getattr(app_res, "error", None):
        raise HTTPException(status_code=400, detail=f"Supabase error: {app_res.error}")
    app_row = getattr(app_res, "data", None)
    if not app_row:
        raise HTTPException(status_code=404, detail="Application not found")
    project = _ensure_project_exists(str(app_row.get("project_id")))
    if str(app_row.get("status", "")).lower() != "accepted":
        raise HTTPException(status_code=400, detail="Collaboration opens after acceptance")
    if str(app_row.get("applicant_user_id")) != str(user_id) and str(project.get("user_id")) != str(user_id):
        raise HTTPException(status_code=403, detail="Not permitted")
    msgs_res = (
        supabase.table(PROJECT_COLLAB_TABLE)
        .select("*")
        .eq("application_id", application_id)
        .order("created_at")
        .limit(500)
        .execute()
    )
    if getattr(msgs_res, "error", None):
        raise HTTPException(status_code=400, detail=f"Supabase error: {msgs_res.error}")
    msgs = getattr(msgs_res, "data", []) or []
    return {"messages": msgs}


@projects_router.post("/api/collab/{application_id}/messages")
def send_collab_message(application_id: str, body: CollabMessageIn, authorization: Optional[str] = Header(default=None)):
    token = _parse_bearer_token(authorization)
    user_id, _ = _require_user_and_profile(token)
    content = (body.content or "").strip()
    if not content:
        raise HTTPException(status_code=400, detail="Message content required")
    supabase = get_service_client()
    app_res = supabase.table(PROJECT_APPLICATIONS_TABLE).select("*").eq("id", application_id).single().execute()
    if getattr(app_res, "error", None):
        raise HTTPException(status_code=400, detail=f"Supabase error: {app_res.error}")
    app_row = getattr(app_res, "data", None)
    if not app_row:
        raise HTTPException(status_code=404, detail="Application not found")
    project = _ensure_project_exists(str(app_row.get("project_id")))
    if str(app_row.get("status", "")).lower() != "accepted":
        raise HTTPException(status_code=400, detail="Collaboration opens after acceptance")
    if str(app_row.get("applicant_user_id")) != str(user_id) and str(project.get("user_id")) != str(user_id):
        raise HTTPException(status_code=403, detail="Not permitted")
    res = supabase.table(PROJECT_COLLAB_TABLE).insert({
        "application_id": application_id,
        "sender_user_id": user_id,
        "content": content,
    }).execute()
    if getattr(res, "error", None):
        raise HTTPException(status_code=400, detail=f"Supabase error: {res.error}")
    data = getattr(res, "data", None)
    row = data[0] if isinstance(data, list) and data else data
    return {"ok": True, "message": row}


@projects_router.get("/api/public/profiles/{user_id}")
def get_public_profile(user_id: str):
    supabase = get_service_client()
    res = (
        supabase.table("user_profiles")
        .select(
            "auth_user_id,name,profile_image_url,bio,headline,location,linkedin,github,leetcode,technologies,skills,certifications,languages,interests,project_info,publications,achievements,experience,verification_score"
        )
        .eq("auth_user_id", user_id)
        .limit(1)
        .execute()
    )
    if getattr(res, "error", None):
        raise HTTPException(status_code=400, detail=f"Supabase error: {res.error}")
    if not res.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    row = dict(res.data[0])
    profile_id = row.get("id")
    if profile_id:
        row["experiences"] = _fetch_profile_related(
            profile_id,
            "user_experiences",
            [("order_index", False), ("start_date", True), ("created_at", False)],
        )
        row["education_entries"] = _fetch_profile_related(
            profile_id,
            "user_education",
            [("order_index", False), ("created_at", False)],
        )
        row["certification_entries"] = _fetch_profile_related(
            profile_id,
            "user_certifications",
            [("order_index", False), ("issue_date", True), ("created_at", False)],
        )
        row["portfolio_projects"] = _fetch_profile_related(
            profile_id,
            "user_portfolio_projects",
            [("order_index", False), ("start_date", True), ("created_at", False)],
        )
        row["publication_entries"] = _fetch_profile_related(
            profile_id,
            "user_publications",
            [("order_index", False), ("publication_date", True), ("created_at", False)],
        )
    row["user_id"] = row.pop("auth_user_id")
    return row


@projects_router.get("/api/public/skills/verifications/{user_id}", response_model=List[SkillVerificationOut])
def list_public_skill_verifications(user_id: str):
    supabase = get_service_client()
    res = (
        supabase.table(SKILL_VERIFICATIONS_TABLE)
        .select("skill,best_score,attempts,status,updated_at")
        .eq("user_id", user_id)
        .order("best_score", desc=True)
        .order("updated_at", desc=True)
        .execute()
    )
    if getattr(res, "error", None):
        raise HTTPException(status_code=400, detail=f"Supabase error: {res.error}")
    rows = getattr(res, "data", []) or []
    return [SkillVerificationOut(**{**row, "best_score": float(row.get("best_score") or 0.0)}).dict() for row in rows]


@projects_router.get("/api/skills/verifications", response_model=List[SkillVerificationOut])
def list_my_skill_verifications(authorization: Optional[str] = Header(default=None)):
    token = _parse_bearer_token(authorization)
    user_id, _ = _require_user_and_profile(token)
    supabase = get_service_client()
    res = (
        supabase.table(SKILL_VERIFICATIONS_TABLE)
        .select("skill,best_score,attempts,status,updated_at")
        .eq("user_id", user_id)
        .order("best_score", desc=True)
        .order("updated_at", desc=True)
        .execute()
    )
    if getattr(res, "error", None):
        raise HTTPException(status_code=400, detail=f"Supabase error: {res.error}")
    rows = getattr(res, "data", []) or []
    return [SkillVerificationOut(**{**row, "best_score": float(row.get("best_score") or 0.0)}).dict() for row in rows]


@projects_router.post("/api/skills/tests/start", response_model=SkillTestStartOut)
def start_skill_test(body: SkillTestStartIn, authorization: Optional[str] = Header(default=None)):
    token = _parse_bearer_token(authorization)
    user_id, _ = _require_user_and_profile(token)
    skill = _normalize_skill(body.skill)
    if not skill:
        raise HTTPException(status_code=400, detail="Skill is required")
    questions = _fallback_questions(skill)
    session_id = _insert_skill_test_session(user_id, skill, questions)
    public = _public_questions(questions)
    return {"session_id": session_id, "skill": skill, "questions": public}


@projects_router.post("/api/skills/tests/{session_id}/submit")
def submit_skill_test(session_id: str, body: SkillTestSubmitIn, authorization: Optional[str] = Header(default=None)):
    token = _parse_bearer_token(authorization)
    user_id, _ = _require_user_and_profile(token)
    session = _get_skill_test_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if str(session.get("user_id")) != str(user_id):
        raise HTTPException(status_code=403, detail="Not your session")
    if (session.get("status") or "").lower() == "completed" and session.get("result"):
        return session.get("result")
    questions = session.get("questions") or []
    answers = {ans.question_id: (ans.response or "").strip() for ans in (body.answers or []) if ans.question_id}
    result = _grade_skill_answers(questions, answers)
    _update_skill_test_submission(session_id, result)
    score = float(result.get("score") or 0.0)
    skill_name = session.get("skill") or ""
    if skill_name:
        _upsert_skill_verification(user_id, skill_name, score)
        _recompute_profile_verification_score(user_id)
    return result


@projects_router.get("/api/profile")
def get_profile_compat(authorization: Optional[str] = Header(default=None)):
    token = _parse_bearer_token(authorization)
    return _get_profile_me(token)


@projects_router.post("/api/profile")
def update_profile_compat(payload: dict, authorization: Optional[str] = Header(default=None)):
    token = _parse_bearer_token(authorization)
    _update_profile_me(token, payload or {})
    return _get_profile_me(token)

# --- Academics API ---



academics_router = APIRouter()


@academics_router.post("/api/parse/syllabus-text", response_model=ParsedSyllabusOut, summary="Parse raw syllabus text into structured units/topics")
def parse_syllabus_text(payload: ParseSyllabusIn):
    return parse_syllabus(payload)


# ---------------- Admin: List Users -----------------

def _is_admin_user(user_id: Optional[str], email: Optional[str]) -> bool:
    """Basic admin gating: match against comma-separated ADMIN_USER_IDS or ADMIN_EMAILS env vars.

    Falls back to allowing emails ending with domains in ADMIN_EMAIL_DOMAINS (comma-separated) if provided.
    """
    if not user_id and not email:
        return False
    ids = {s.strip() for s in os.getenv("ADMIN_USER_IDS", "").split(",") if s.strip()}
    if user_id and user_id in ids:
        return True
    emails = {s.strip().lower() for s in os.getenv("ADMIN_EMAILS", "").split(",") if s.strip()}
    if email and email.lower() in emails:
        return True
    domains = {s.strip().lower() for s in os.getenv("ADMIN_EMAIL_DOMAINS", "").split(",") if s.strip()}
    if email and domains:
        try:
            domain = email.split("@",1)[1].lower()
            if domain in domains:
                return True
        except Exception:
            pass
    # Database role check (admin_roles table) if we have a service client and user id
    try:
        if user_id:
            supabase = get_service_client()
            if supabase:
                resp = supabase.table("admin_roles").select("role").eq("auth_user_id", user_id).limit(1).execute()
                data = getattr(resp, "data", []) or []
                if data and (data[0].get("role") == "admin"):
                    return True
    except Exception:
        # Silent fail: do not block auth if table missing or permission issue
        pass
    return False


@academics_router.get("/api/admin/users", summary="Admin: list user profiles")
def list_admin_users(authorization: Optional[str] = Header(default=None), limit: int = Query(default=500, ge=1, le=2000)):
    token = _parse_bearer_token(authorization)
    if not token:
        raise HTTPException(status_code=401, detail="Missing bearer token")
    anon_client = get_anon_client()
    if not anon_client:
        raise HTTPException(status_code=500, detail="Auth disabled (no anon client)")
    try:
        auth_user = anon_client.auth.get_user(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    user_obj = getattr(auth_user, "user", None) or (auth_user.get("user") if isinstance(auth_user, dict) else None)
    user_id = None
    email = None
    if user_obj:
        user_id = getattr(user_obj, "id", None) or (user_obj.get("id") if isinstance(user_obj, dict) else None)
        email = getattr(user_obj, "email", None) or (user_obj.get("email") if isinstance(user_obj, dict) else None)
    if not _is_admin_user(user_id, email):
        raise HTTPException(status_code=403, detail="Not an admin user")

    supabase = get_service_client()
    # Core fields; attempt extended (with department_id/batch_id). Fallback if columns absent (42703).
    base_cols = [
        "id","auth_user_id","email","name","gender","phone","semester","regno",
        "profile_image_url","verification_score","updated_at","created_at","linkedin","github",
        "leetcode","skills","technologies","specializations"
    ]
    extended_cols = base_cols + ["department_id","batch_id"]
    use_extended = True
    rows: List[dict] = []
    for attempt in (1,2):
        select_cols = ",".join(extended_cols if use_extended else base_cols)
        try:
            res = (
                supabase.table("user_profiles")
                .select(select_cols)
                .order("updated_at", desc=True)
                .limit(limit)
                .execute()
            )
        except Exception as e:  # Catch APIError directly (column missing)
            msg = str(e)
            if use_extended and ("department_id" in msg or "batch_id" in msg):
                use_extended = False
                continue
            raise HTTPException(status_code=500, detail=f"Supabase error (list users) exec: {msg}")

        err = getattr(res, "error", None)
        if err:
            # Some errors might still surface here (non-column related)
            raise HTTPException(status_code=500, detail=f"Supabase error (list users): {err}")
        rows = getattr(res, "data", []) or []
        break

    have_dept_batch = use_extended  # only true if extended columns succeeded

    # Preload department + batch info to enrich output
    dept_ids = {r.get("department_id") for r in rows if have_dept_batch and r.get("department_id")}
    batch_ids = {r.get("batch_id") for r in rows if have_dept_batch and r.get("batch_id")}
    dept_map: Dict[str, dict] = {}
    batch_map: Dict[str, dict] = {}
    role_map: Dict[str, str] = {}
    if dept_ids:
        dres = supabase.table("departments").select("id,name").in_("id", list(dept_ids)).execute()
        if not getattr(dres, "error", None):
            for d in dres.data or []:
                dept_map[d.get("id")] = d
    if batch_ids:
        bres = supabase.table("batches").select("id,from_year,to_year").in_("id", list(batch_ids)).execute()
        if not getattr(bres, "error", None):
            for b in bres.data or []:
                batch_map[b.get("id")] = b
    # Load roles for all involved auth_user_ids in one query
    try:
        auth_ids = [r.get("auth_user_id") for r in rows if r.get("auth_user_id")]
        uniq_ids = list({i for i in auth_ids if i})
        if uniq_ids:
            rres = supabase.table("admin_roles").select("auth_user_id,role").in_("auth_user_id", uniq_ids).execute()
            if not getattr(rres, "error", None):
                for rr in (rres.data or []):
                    rid = rr.get("auth_user_id")
                    if rid:
                        role_map[rid] = rr.get("role") or "student"
    except Exception:
        pass

    out: List[dict] = []
    for r in rows:
        dept = dept_map.get(r.get("department_id")) if have_dept_batch else {}
        batch = batch_map.get(r.get("batch_id")) if have_dept_batch else {}
        out.append({
            "profile_id": r.get("id"),
            "user_id": r.get("auth_user_id"),
            "name": r.get("name"),
            "email": r.get("email"),
            "role": role_map.get(r.get("auth_user_id"), "student"),
            "semester": r.get("semester"),
            "regno": r.get("regno"),
            "department": dept.get("name") if dept else None,
            "batch_from": batch.get("from_year") if batch else None,
            "batch_to": batch.get("to_year") if batch else None,
            "batch_range": (f"{batch.get('from_year')}-{batch.get('to_year')}" if batch and batch.get('from_year') and batch.get('to_year') else None),
            "profile_image_url": r.get("profile_image_url"),
            "verification_score": r.get("verification_score"),
            "linkedin": r.get("linkedin"),
            "github": r.get("github"),
            "leetcode": r.get("leetcode"),
            "skills": r.get("skills") or [],
            "technologies": r.get("technologies") or [],
            "specializations": r.get("specializations") or [],
            "updated_at": r.get("updated_at"),
            "created_at": r.get("created_at"),
        })
    return {"users": out, "count": len(out)}


@academics_router.get("/api/admin/self-check", summary="Admin: verify current token admin status")
def admin_self_check(authorization: Optional[str] = Header(default=None)):
    token = _parse_bearer_token(authorization)
    if not token:
        raise HTTPException(status_code=401, detail="Missing bearer token")
    anon_client = get_anon_client()
    if not anon_client:
        raise HTTPException(status_code=500, detail="Auth disabled (no anon client)")
    try:
        auth_user = anon_client.auth.get_user(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    user_obj = getattr(auth_user, "user", None) or (auth_user.get("user") if isinstance(auth_user, dict) else None)
    user_id = getattr(user_obj, "id", None) if user_obj else None
    email = getattr(user_obj, "email", None) if user_obj else None
    is_admin = _is_admin_user(user_id, email)
    if not is_admin:
        raise HTTPException(status_code=403, detail="Not an admin user")
    return {"ok": True, "user_id": user_id, "email": email, "admin": True}


class RoleUpdateIn(BaseModel):
    role: str


def _get_auth_user(authorization: Optional[str]) -> Tuple[Optional[str], Optional[str]]:
    token = _parse_bearer_token(authorization)
    if not token:
        raise HTTPException(status_code=401, detail="Missing bearer token")
    anon_client = get_anon_client()
    if not anon_client:
        raise HTTPException(status_code=500, detail="Auth disabled (no anon client)")
    try:
        auth_user = anon_client.auth.get_user(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    user_obj = getattr(auth_user, "user", None) or (auth_user.get("user") if isinstance(auth_user, dict) else None)
    if not user_obj:
        raise HTTPException(status_code=401, detail="Invalid auth context")
    user_id = getattr(user_obj, "id", None) or (user_obj.get("id") if isinstance(user_obj, dict) else None)
    email = getattr(user_obj, "email", None) or (user_obj.get("email") if isinstance(user_obj, dict) else None)
    return user_id, email


def _require_admin(authorization: Optional[str]):
    uid, em = _get_auth_user(authorization)
    if not _is_admin_user(uid, em):
        raise HTTPException(status_code=403, detail="Not an admin user")
    return uid, em


def _count_admins(supabase) -> int:
    try:
        resp = supabase.table("admin_roles").select("role", count='exact').eq("role", "admin").execute()
        # Some supabase libs embed count differently; attempt both
        if hasattr(resp, 'count') and resp.count is not None:
            return resp.count
        data = getattr(resp, 'data', []) or []
        return len([r for r in data if r.get('role') == 'admin'])
    except Exception:
        return 0


VALID_ROLES = {"admin","teacher","student","moderator"}


@academics_router.post("/api/admin/users/{auth_user_id}/role", summary="Admin: update a user's role")
def update_user_role(auth_user_id: str, payload: RoleUpdateIn, authorization: Optional[str] = Header(default=None)):
    _require_admin(authorization)
    desired = payload.role.lower().strip()
    if desired not in VALID_ROLES:
        raise HTTPException(status_code=400, detail=f"Invalid role '{desired}'")
    supabase = get_service_client()
    if desired == 'admin':
        # Upsert row
        res = supabase.table('admin_roles').upsert({"auth_user_id": auth_user_id, "role": "admin"}).execute()
        if getattr(res, 'error', None):
            raise HTTPException(status_code=500, detail=f"Role upsert failed: {res.error}")
    else:
        # If demoting from admin ensure not last admin
        # Check if currently admin
        existing = supabase.table('admin_roles').select('role').eq('auth_user_id', auth_user_id).limit(1).execute()
        is_admin_now = False
        if not getattr(existing, 'error', None):
            rows = getattr(existing, 'data', []) or []
            is_admin_now = bool(rows and rows[0].get('role') == 'admin')
        if is_admin_now:
            admin_count = _count_admins(supabase)
            if admin_count <= 1:
                raise HTTPException(status_code=400, detail="Cannot demote the last admin")
            del_res = supabase.table('admin_roles').delete().eq('auth_user_id', auth_user_id).execute()
            if getattr(del_res, 'error', None):
                raise HTTPException(status_code=500, detail=f"Role demote failed: {del_res.error}")
        # For non-admin roles we can store or remove row (choose store for teacher/moderator custom permissions)
        if desired in {"teacher","moderator"}:
            up_res = supabase.table('admin_roles').upsert({"auth_user_id": auth_user_id, "role": desired}).execute()
            if getattr(up_res, 'error', None):
                raise HTTPException(status_code=500, detail=f"Role update failed: {up_res.error}")
        elif desired == 'student':
            # Remove row if not needed
            supabase.table('admin_roles').delete().eq('auth_user_id', auth_user_id).execute()
    return {"ok": True, "auth_user_id": auth_user_id, "role": desired}


@academics_router.delete("/api/admin/users/{auth_user_id}", summary="Admin: delete a user (profile + role)")
def delete_user(auth_user_id: str, authorization: Optional[str] = Header(default=None)):
    _require_admin(authorization)
    supabase = get_service_client()
    # Prevent deleting last admin if target is sole admin
    existing_role = supabase.table('admin_roles').select('role').eq('auth_user_id', auth_user_id).limit(1).execute()
    target_is_admin = False
    if not getattr(existing_role, 'error', None):
        rows = getattr(existing_role, 'data', []) or []
        target_is_admin = bool(rows and rows[0].get('role') == 'admin')
    if target_is_admin:
        admin_count = _count_admins(supabase)
        if admin_count <= 1:
            raise HTTPException(status_code=400, detail="Cannot delete the last admin")
    # Delete profile first (soft cascade pattern) then role row
    prof_del = supabase.table('user_profiles').delete().eq('auth_user_id', auth_user_id).execute()
    if getattr(prof_del, 'error', None):
        raise HTTPException(status_code=500, detail=f"Profile delete failed: {prof_del.error}")
    supabase.table('admin_roles').delete().eq('auth_user_id', auth_user_id).execute()
    # NOTE: We are NOT deleting from auth.users here (would require service role elevated call). Document manual removal if needed.
    return {"ok": True, "deleted_auth_user_id": auth_user_id}

# ================= Teacher Feature Backend =====================

teacher_router = APIRouter()


class TeacherSignupIn(BaseModel):
    name: str
    email: str
    password: str
    college: Optional[str] = None
    department: Optional[str] = None
    subjects: Optional[List[str]] = None

    @validator("subjects", pre=True, always=True)
    def _clean_subjects(cls, v):
        if not v:
            return []
        out = []
        for s in v:
            if not s:
                continue
            s2 = str(s).strip()
            if s2 and s2 not in out:
                out.append(s2[:64])
        return out


class TeacherApproveIn(BaseModel):
    status: str = Field(..., pattern=r"^(approved|rejected)$")
    notes: Optional[str] = None


class TeacherMessageIn(BaseModel):
    content: str = Field(..., min_length=1, max_length=4000)


# ---------------- WebSocket Chat Manager (Teacher) -----------------
class TeacherChatManager:
    """In-memory tracking of active teacher chat WebSocket connections.

    Structure: {connection_id: {user_id: websocket}}
    For multi-process / multi-instance deployments, replace with shared pub/sub.
    """
    def __init__(self):
        self.active: dict[str, dict[str, WebSocket]] = {}

    async def connect(self, connection_id: str, user_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active.setdefault(connection_id, {})[user_id] = websocket

    def disconnect(self, connection_id: str, user_id: str):
        try:
            if connection_id in self.active and user_id in self.active[connection_id]:
                del self.active[connection_id][user_id]
                if not self.active[connection_id]:
                    del self.active[connection_id]
        except Exception:
            pass

    async def broadcast(self, connection_id: str, payload: dict):
        conns = self.active.get(connection_id, {})
        stale = []
        for uid, ws in conns.items():
            try:
                await ws.send_json(payload)
            except Exception:
                stale.append(uid)
        for uid in stale:
            self.disconnect(connection_id, uid)


chat_manager = TeacherChatManager()


def _ensure_teacher_role(auth_user_id: str):
    supabase = get_service_client()
    # Upsert teacher role if not exists
    row = supabase.table("admin_roles").select("role").eq("auth_user_id", auth_user_id).limit(1).execute()
    if getattr(row, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (get role): {row.error}")
    data = row.data or []
    if data:
        role = data[0].get("role")
        if role != "teacher":
            # do not override admin; if admin keep dual capability
            if role in {"admin","moderator"}:
                return
            upd = supabase.table("admin_roles").update({"role": "teacher"}).eq("auth_user_id", auth_user_id).execute()
            if getattr(upd, "error", None):
                raise HTTPException(status_code=500, detail=f"Supabase error (promote teacher): {upd.error}")
    else:
        ins = supabase.table("admin_roles").insert({"auth_user_id": auth_user_id, "role": "teacher"}).execute()
        if getattr(ins, "error", None):
            raise HTTPException(status_code=500, detail=f"Supabase error (insert teacher role): {ins.error}")


def _require_teacher(authorization: Optional[str]):
    uid, _ = _get_auth_user(authorization)
    supabase = get_service_client()
    role_q = supabase.table("admin_roles").select("role").eq("auth_user_id", uid).limit(1).execute()
    if getattr(role_q, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (role check): {role_q.error}")
    data = role_q.data or []
    role = data[0].get("role") if data else "student"
    if role not in {"teacher","admin"}:  # admins also allowed
        raise HTTPException(status_code=403, detail="Teacher role required")
    return uid


@teacher_router.post("/api/teacher/signup", summary="Teacher signup with ID card images (multipart)")
async def teacher_signup(
    email: str = Form(...),
    password: str = Form(...),
    confirm_password: str = Form(...),
    name: str = Form(...),
    college: Optional[str] = Form(None),
    department: Optional[str] = Form(None),
    subjects: Optional[str] = Form(None),  # JSON array or comma list
    id_card_front: UploadFile = File(...),
    id_card_back: UploadFile = File(...),
):
    if password != confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    # basic file validation
    allowed = {"image/png","image/jpeg","image/jpg","image/webp"}
    if id_card_front.content_type not in allowed or id_card_back.content_type not in allowed:
        raise HTTPException(status_code=400, detail="ID card images must be png/jpg/webp")
    anon_client = get_anon_client()
    if not anon_client:
        raise HTTPException(status_code=500, detail="Auth disabled")
    try:
        auth_res = anon_client.auth.sign_up({"email": email, "password": password})
        auth_user_id = _get_user_id_from_auth_response(auth_res)
        if not auth_user_id:
            raise HTTPException(status_code=400, detail="Failed to create auth user")
        access_token = _extract_access_token(auth_res)
        supabase = get_service_client()
        college_id = None
        department_id = None
        if college:
            try:
                college_id = str(_resolve_college_id_by_name(college))
            except Exception:
                college_id = None
        if department and college_id:
            try:
                department_id = str(_resolve_department_id(uuid.UUID(college_id), department.upper()))
            except Exception:
                department_id = None
        # subjects parse
        subj_list: List[str] = []
        if subjects:
            try:
                if subjects.strip().startswith("["):
                    subj_list = [s[:64] for s in json.loads(subjects) if isinstance(s, str)]
                else:
                    subj_list = [s.strip()[:64] for s in subjects.split(',') if s.strip()]
            except Exception:
                subj_list = []
        # store images locally (assets/teacher_ids/)
        base_dir = Path(__file__).parent / "assets" / "teacher_ids"
        base_dir.mkdir(parents=True, exist_ok=True)
        front_ext = Path(id_card_front.filename or "front").suffix.lower() or ".jpg"
        back_ext = Path(id_card_back.filename or "back").suffix.lower() or ".jpg"
        front_name = f"{auth_user_id}_front{front_ext}"
        back_name = f"{auth_user_id}_back{back_ext}"
        front_path = base_dir / front_name
        back_path = base_dir / back_name
        # write files
        front_bytes = await id_card_front.read()
        back_bytes = await id_card_back.read()
        if len(front_bytes) > 5*1024*1024 or len(back_bytes) > 5*1024*1024:
            raise HTTPException(status_code=400, detail="Image too large (max 5MB)")
        front_path.write_bytes(front_bytes)
        back_path.write_bytes(back_bytes)
        rel_front = f"assets/teacher_ids/{front_name}"
        rel_back = f"assets/teacher_ids/{back_name}"
        ins = supabase.table("teacher_applications").insert({
            "auth_user_id": auth_user_id,
            "email": email,
            "name": name,
            "college_id": college_id,
            "department_id": department_id,
            "subjects": subj_list,
            "id_card_front_path": rel_front,
            "id_card_back_path": rel_back,
            "status": "pending"
        }).execute()
        if getattr(ins, "error", None):
            raise HTTPException(status_code=500, detail=f"Supabase error (teacher application insert): {ins.error}")
        return {"message": "Teacher application submitted", "access_token": access_token, "user_id": auth_user_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected signup error: {e}")


@teacher_router.get("/api/teacher/applications", summary="Admin: list teacher applications")
def list_teacher_applications(status: Optional[str] = Query(default=None), authorization: Optional[str] = Header(default=None)):
    _require_admin(authorization)
    supabase = get_service_client()
    query = supabase.table("teacher_applications").select("*").order("created_at", desc=True)
    if status:
        query = query.eq("status", status)
    res = query.execute()
    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (list teacher apps): {res.error}")
    return {"applications": res.data or []}


@teacher_router.post("/api/teacher/applications/{application_id}/review", summary="Admin: approve or reject a teacher application")
def review_teacher_application(application_id: str, payload: TeacherApproveIn, authorization: Optional[str] = Header(default=None)):
    admin_uid, _ = _require_admin(authorization)
    supabase = get_service_client()
    debug = bool(os.getenv("TEACHER_PROFILE_DEBUG"))
    if debug:
        try:
            print(f"[TPROF_DEBUG] Review start application_id={application_id} target_status={payload.status} admin={admin_uid}")
        except Exception:
            pass
    app_q = supabase.table("teacher_applications").select("auth_user_id,status").eq("id", application_id).limit(1).execute()
    if getattr(app_q, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (fetch app): {app_q.error}")
    if not app_q.data:
        raise HTTPException(status_code=404, detail="Application not found")
    row = app_q.data[0]
    if debug:
        try:
            print(f"[TPROF_DEBUG] Existing application status={row.get('status')} auth_user_id={row.get('auth_user_id')}")
        except Exception:
            pass
    if row.get("status") != "pending":
        # allow re-review? Only if moving from rejected to approved maybe
        pass
    upd = supabase.table("teacher_applications").update({
        "status": payload.status,
        "notes": payload.notes,
        "reviewed_by": admin_uid,
        "reviewed_at": datetime.utcnow().isoformat()
    }).eq("id", application_id).execute()
    if getattr(upd, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (update app): {upd.error}")
    sync_result: Dict[str, Any] = {"profile_sync": "skipped"}
    if payload.status == "approved":
        _ensure_teacher_role(row.get("auth_user_id"))
        try:
            sync_result = _sync_teacher_profile_from_application(supabase, row.get("auth_user_id")) or {"profile_sync": "no-op"}
            if debug:
                try:
                    print(f"[TPROF_DEBUG] Sync result: {sync_result}")
                except Exception:
                    pass
        except Exception as e:
            # Non-fatal: surface minimal info
            sync_result = {"profile_sync": "error", "error": str(e)}
            try:
                supabase_logger.exception(f"Teacher profile sync failed on approval: {e}")
            except Exception:
                pass
    return {"ok": True, "application_id": application_id, "status": payload.status, **sync_result}


@teacher_router.get("/api/teacher/me/status", summary="Teacher applicant status (self)")
def teacher_me_status(authorization: Optional[str] = Header(default=None)):
    uid, _ = _get_auth_user(authorization)
    supabase = get_service_client()
    app_q = supabase.table("teacher_applications").select("status").eq("auth_user_id", uid).limit(1).execute()
    if getattr(app_q, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (get teacher status): {app_q.error}")
    status = app_q.data[0]["status"] if app_q.data else None
    role_q = supabase.table("admin_roles").select("role").eq("auth_user_id", uid).limit(1).execute()
    current_role = None
    if not getattr(role_q, "error", None) and role_q.data:
        current_role = role_q.data[0].get("role")
    return {"status": status, "role": current_role}


@teacher_router.get("/api/teachers", summary="List approved teachers")
def list_teachers(limit: int = Query(default=100, ge=1, le=500)):
    supabase = get_service_client()
    # join applications + roles + profile (if exists)
    apps = supabase.table("teacher_applications").select("auth_user_id,name,email,college_id,department_id").eq("status", "approved").order("created_at", desc=True).limit(limit).execute()
    if getattr(apps, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (list teachers): {apps.error}")
    rows = apps.data or []
    # Attach role sanity & optional college/department names
    college_ids = {r.get("college_id") for r in rows if r.get("college_id")}
    dept_ids = {r.get("department_id") for r in rows if r.get("department_id")}
    college_map = {}
    dept_map = {}
    if college_ids:
        def _fetch_colleges():
            return supabase.table("colleges").select("id,name").in_("id", list(college_ids)).execute()
        try:
            csel = _supabase_retry(_fetch_colleges)
            if not getattr(csel, "error", None):
                for c in csel.data or []:
                    college_map[c.get("id")] = c
        except Exception as e:  # fallback: proceed without college names
            supabase_logger.warning("College lookup failed after retries: %s", e)
    if dept_ids:
        def _fetch_departments():
            return supabase.table("departments").select("id,name").in_("id", list(dept_ids)).execute()
        try:
            dsel = _supabase_retry(_fetch_departments)
            if not getattr(dsel, "error", None):
                for d in dsel.data or []:
                    dept_map[d.get("id")] = d
        except Exception as e:  # fallback: proceed without department names
            supabase_logger.warning("Department lookup failed after retries: %s", e)
    out = []
    for r in rows:
        out.append({
            "auth_user_id": r.get("auth_user_id"),
            "name": r.get("name"),
            "email": r.get("email"),
            "college": college_map.get(r.get("college_id"), {}).get("name"),
            "department": dept_map.get(r.get("department_id"), {}).get("name"),
        })
    return {"teachers": out, "count": len(out)}


def _canonical_pair(a: str, b: str) -> Tuple[str, str]:
    return (a, b) if a < b else (b, a)


@teacher_router.post("/api/teacher/connect/{other_user_id}", summary="Create or fetch teacher connection")
def teacher_connect(other_user_id: str, authorization: Optional[str] = Header(default=None)):
    uid = _require_teacher(authorization)
    if other_user_id == uid:
        raise HTTPException(status_code=400, detail="Cannot connect to self")
    supabase = get_service_client()
    a, b = _canonical_pair(uid, other_user_id)
    q = supabase.table("teacher_connections").select("id").eq("teacher_a", a).eq("teacher_b", b).limit(1).execute()
    if getattr(q, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (fetch connection): {q.error}")
    if q.data:
        return {"connection_id": q.data[0]["id"], "existing": True}
    ins = supabase.table("teacher_connections").insert({"teacher_a": a, "teacher_b": b}).execute()
    if getattr(ins, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (create connection): {ins.error}")
    cid = ins.data[0]["id"] if ins.data else None
    return {"connection_id": cid, "existing": False}


@teacher_router.get("/api/teacher/connections", summary="List my teacher connections")
def list_my_connections(authorization: Optional[str] = Header(default=None)):
    uid = _require_teacher(authorization)
    supabase = get_service_client()
    # union pattern via OR filter not supported; fetch both sides
    # Apply lightweight retry for transient httpx/httpcore protocol disconnects
    rows_a: List[Dict[str, Any]] = []
    rows_b: List[Dict[str, Any]] = []
    try:
        a_res = _supabase_retry(
            lambda: (
                supabase
                .table("teacher_connections")
                .select("id,teacher_a,teacher_b,created_at")
                .eq("teacher_a", uid)
                .execute()
            )
        )
        if getattr(a_res, "error", None):
            raise HTTPException(status_code=500, detail=f"Supabase error (conn A): {a_res.error}")
        rows_a = a_res.data or []
    except HTTPXRemoteProtocolError as exc:  # pragma: no cover - network timing dependent
        logging.getLogger("teachers").warning(
            "list_my_connections transient protocol error on A-side: %s", exc
        )
        rows_a = []
    try:
        b_res = _supabase_retry(
            lambda: (
                supabase
                .table("teacher_connections")
                .select("id,teacher_a,teacher_b,created_at")
                .eq("teacher_b", uid)
                .execute()
            )
        )
        if getattr(b_res, "error", None):
            raise HTTPException(status_code=500, detail=f"Supabase error (conn B): {b_res.error}")
        rows_b = b_res.data or []
    except HTTPXRemoteProtocolError as exc:  # pragma: no cover - network timing dependent
        logging.getLogger("teachers").warning(
            "list_my_connections transient protocol error on B-side: %s", exc
        )
        rows_b = []
    rows = rows_a + rows_b
    partner_ids = []
    for r in rows:
        partner_ids.append(r.get("teacher_b") if r.get("teacher_a") == uid else r.get("teacher_a"))
    # enrich partner basic info from teacher_applications (fallback to user_profiles)
    partner_ids = [p for p in partner_ids if p]
    uniq = list({p for p in partner_ids})
    partner_map = {}
    if uniq:
        try:
            tapp = _supabase_retry(
                lambda: (
                    supabase
                    .table("teacher_applications")
                    .select("auth_user_id,name")
                    .in_("auth_user_id", uniq)
                    .execute()
                )
            )
            if not getattr(tapp, "error", None):
                for t in tapp.data or []:
                    partner_map[t.get("auth_user_id")] = t
        except HTTPXRemoteProtocolError as exc:  # pragma: no cover - network timing dependent
            logging.getLogger("teachers").warning(
                "list_my_connections transient protocol error on partner lookup: %s", exc
            )
    out = []
    for r in rows:
        partner = r.get("teacher_b") if r.get("teacher_a") == uid else r.get("teacher_a")
        out.append({
            "connection_id": r.get("id"),
            "partner_user_id": partner,
            "partner_name": partner_map.get(partner, {}).get("name"),
            "created_at": r.get("created_at"),
        })
    return {"connections": out, "count": len(out)}


@teacher_router.post("/api/teacher/connections/{connection_id}/messages", summary="Send message on a connection")
def send_message(connection_id: str, payload: TeacherMessageIn, authorization: Optional[str] = Header(default=None)):
    uid = _require_teacher(authorization)
    supabase = get_service_client()
    # verify membership
    c = supabase.table("teacher_connections").select("teacher_a,teacher_b").eq("id", connection_id).limit(1).execute()
    if getattr(c, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (get conn): {c.error}")
    if not c.data:
        raise HTTPException(status_code=404, detail="Connection not found")
    row = c.data[0]
    if uid not in {row.get("teacher_a"), row.get("teacher_b")}:
        raise HTTPException(status_code=403, detail="Not a participant")
    ins = supabase.table("teacher_messages").insert({
        "connection_id": connection_id,
        "sender_user_id": uid,
        "content": payload.content
    }).execute()
    if getattr(ins, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (insert msg): {ins.error}")
    return {"ok": True, "message_id": ins.data[0]["id"] if ins.data else None}


@teacher_router.get("/api/teacher/connections/{connection_id}/messages", summary="List messages in a connection")
def list_messages(connection_id: str, since: Optional[str] = Query(default=None), limit: int = Query(default=200, ge=1, le=500), authorization: Optional[str] = Header(default=None)):
    uid = _require_teacher(authorization)
    supabase = get_service_client()
    c = supabase.table("teacher_connections").select("teacher_a,teacher_b").eq("id", connection_id).limit(1).execute()
    if getattr(c, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (get conn): {c.error}")
    if not c.data:
        raise HTTPException(status_code=404, detail="Connection not found")
    row = c.data[0]
    if uid not in {row.get("teacher_a"), row.get("teacher_b")}:
        raise HTTPException(status_code=403, detail="Not a participant")
    q = supabase.table("teacher_messages").select("id,sender_user_id,content,created_at").eq("connection_id", connection_id).order("created_at")
    if since:
        q = q.gt("created_at", since)
    res = q.limit(limit).execute()
    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (list msgs): {res.error}")
    return {"messages": res.data or [], "count": len(res.data or [])}


@teacher_router.get("/api/teacher/notes/upload-meta", summary="Dynamic academic dropdown metadata for teacher notes upload")
def teacher_notes_meta(authorization: Optional[str] = Header(default=None)):
    _require_teacher(authorization)  # role gating only
    supabase = get_service_client()

    def _safe_select(table: str, columns: str, order: Optional[str] = None):
        try:
            q = supabase.table(table).select(columns)
            if order:
                q = q.order(order)
            res = q.execute()
            if getattr(res, "error", None):
                # Best-effort: return empty list on transient failures
                try:
                    supabase_logger.warning(f"Teacher meta query error: {table}: {res.error}")
                except Exception:
                    pass
                return []
            return res.data or []
        except Exception as e:  # network/protocol errors
            try:
                supabase_logger.exception(f"Teacher meta exception on {table}")
            except Exception:
                pass
            return []

    colleges = _safe_select("colleges", "id,name", order="name")
    degrees = _safe_select("degrees", "id,name,college_id")
    departments = _safe_select("departments", "id,name,college_id,degree_id")
    batches = _safe_select("batches", "id,department_id,from_year,to_year")

    if not (colleges or degrees or departments or batches):
        raise HTTPException(status_code=500, detail="Supabase unavailable for teacher meta")

    return {
        "colleges": colleges,
        "degrees": degrees,
        "departments": departments,
        "batches": batches,
    }


# Integrate simple reuse of existing marketplace notes for teacher uploads: teacher uses existing /api/marketplace/notes routes.
# Extra filtering endpoint for teacher's own notes.
@teacher_router.get("/api/teacher/notes/mine", summary="List notes uploaded by the current teacher (marketplace integration)")
def teacher_my_notes(authorization: Optional[str] = Header(default=None)):
    uid = _require_teacher(authorization)
    supabase = get_service_client()
    res = (
        supabase.table("marketplace_notes")
        .select("id,title,description,subject,subject_id,semester,created_at,updated_at,price_cents,unit,exam_type,categories,original_filename")
        .eq("owner_user_id", uid)
        .order("created_at", desc=True)
        .limit(200)
        .execute()
    )
    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (my teacher notes): {res.error}")
    return {"notes": res.data or []}

# ---------------- Teacher Profile & Classes Aggregation ----------------

def _fetch_teacher_core(supabase: Client, teacher_user_id: str) -> Dict[str, Any]:
    """Fetch teacher core info from teacher_applications + admin_roles + user_profiles + teacher_profiles."""
    core: Dict[str, Any] = {"auth_user_id": teacher_user_id}
    # Extended teacher profile (now primary source for identity & academic linkage)
    tprof = supabase.table("teacher_profiles").select("name,email,college_id,department_id,headline,bio,specialization,years_experience,qualification,availability,social,profile_image_url").eq("auth_user_id", teacher_user_id).limit(1).execute()
    if not getattr(tprof, "error", None) and tprof.data:
        rowp = tprof.data[0]
        # Identity / academic fields preferred from teacher_profiles first
        for k in ["name","email","college_id","department_id"]:
            if rowp.get(k):
                core[k] = rowp.get(k)
        core.update({k: rowp.get(k) for k in ["headline","bio","specialization","years_experience","qualification","availability","social"] if k in rowp})
        if rowp.get("profile_image_url"):
            core["avatar_url"] = rowp.get("profile_image_url")
    # Application (fallback / supplemental for subjects & status & missing identity)
    app = supabase.table("teacher_applications").select("name,email,college_id,department_id,subjects,status").eq("auth_user_id", teacher_user_id).limit(1).execute()
    if getattr(app, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (teacher application): {app.error}")
    if app.data:
        arow = app.data[0]
        # subjects and status always sourced from application
        for k in ["subjects","status"]:
            if arow.get(k) is not None:
                core[k] = arow.get(k)
        # Only fill identity if still missing
        for k in ["name","email","college_id","department_id"]:
            if not core.get(k) and arow.get(k):
                core[k] = arow.get(k)
    # Role
    role_res = supabase.table("admin_roles").select("role").eq("auth_user_id", teacher_user_id).limit(1).execute()
    if not getattr(role_res, "error", None) and role_res.data:
        core["role"] = role_res.data[0].get("role")
    # User profile (legacy avatar/headline/bio fallback)
    prof = supabase.table("user_profiles").select("name,profile_image_url,headline,bio,semester,batch_from,batch_to").eq("auth_user_id", teacher_user_id).limit(1).execute()
    if not getattr(prof, "error", None) and prof.data:
        row = prof.data[0]
        if not core.get("name") and row.get("name"):
            core["name"] = row.get("name")
        if not core.get("avatar_url") and row.get("profile_image_url"):
            core["avatar_url"] = row.get("profile_image_url")
        if not core.get("headline") and row.get("headline"):
            core["headline"] = row.get("headline")
        if not core.get("bio") and row.get("bio"):
            core["bio"] = row.get("bio")
    return core

def _sync_teacher_profile_from_application(supabase: Client, auth_user_id: Optional[str]) -> Optional[Dict[str, Any]]:
    """Idempotently upsert identity & academic linkage fields from approved teacher_application into teacher_profiles.

    Returns a dict with keys: profile_sync (insert|update|no-op|error), and maybe details.
    Silent no-op if application missing or not approved.
    """
    debug = bool(os.getenv("TEACHER_PROFILE_DEBUG"))
    if not auth_user_id:
        if debug:
            try: print("[TPROF_DEBUG] No auth_user_id passed to sync")
            except Exception: pass
        return {"profile_sync": "no-op", "reason": "missing auth_user_id"}
    app = supabase.table("teacher_applications").select("name,email,college_id,department_id,status").eq("auth_user_id", auth_user_id).limit(1).execute()
    if getattr(app, "error", None) or not app.data:
        if debug:
            try: print(f"[TPROF_DEBUG] Application missing or error error={getattr(app,'error',None)}")
            except Exception: pass
        return {"profile_sync": "no-op", "reason": "application missing"}
    row = app.data[0]
    if row.get("status") != "approved":
        if debug:
            try: print(f"[TPROF_DEBUG] Application not approved status={row.get('status')}")
            except Exception: pass
        return {"profile_sync": "no-op", "reason": "not approved"}
    payload = _supabase_payload({
        "auth_user_id": str(auth_user_id) if auth_user_id else None,
        "name": row.get("name"),
        "email": row.get("email"),
        "college_id": row.get("college_id"),
        "department_id": row.get("department_id"),
    })
    existing = supabase.table("teacher_profiles").select("auth_user_id").eq("auth_user_id", auth_user_id).limit(1).execute()
    if getattr(existing, "error", None):
        if debug:
            try: print(f"[TPROF_DEBUG] Existing profile lookup error={existing.error}")
            except Exception: pass
        return {"profile_sync": "error", "error": str(existing.error)}
    if existing.data:
        upd_payload = {k: v for k, v in payload.items() if k != "auth_user_id"}
        upd = supabase.table("teacher_profiles").update(upd_payload).eq("auth_user_id", auth_user_id).execute()
        if getattr(upd, "error", None):
            err_txt = str(upd.error)
            if debug:
                try: print(f"[TPROF_DEBUG] Update error err={err_txt}")
                except Exception: pass
            return {"profile_sync": "error", "error": err_txt}
        if debug:
            try: print("[TPROF_DEBUG] Profile updated")
            except Exception: pass
        return {"profile_sync": "update"}
    ins = supabase.table("teacher_profiles").insert(payload).execute()
    if getattr(ins, "error", None):
        err_txt = str(ins.error)
        if debug:
            try: print(f"[TPROF_DEBUG] Insert error err={err_txt}")
            except Exception: pass
        # Common cause: migration not applied (new columns absent)
        return {"profile_sync": "error", "error": err_txt, "hint": "Run ALTER TABLE statements from db.sql migration note"}
    if debug:
        try: print("[TPROF_DEBUG] Profile inserted")
        except Exception: pass
    return {"profile_sync": "insert"}

@teacher_router.post("/api/admin/teacher/profile/resync/{user_id}", summary="Admin: force resync teacher profile from application")
def admin_resync_teacher_profile(user_id: str, authorization: Optional[str] = Header(default=None)):
    _require_admin(authorization)
    supabase = get_service_client()
    result = _sync_teacher_profile_from_application(supabase, user_id)
    return {"ok": True, **(result or {"profile_sync": "no-op"})}

@teacher_router.get("/api/admin/teacher-profiles/{user_id}", summary="Admin: fetch raw teacher_profiles row")
def admin_get_teacher_profile_row(user_id: str, authorization: Optional[str] = Header(default=None)):
    _require_admin(authorization)
    supabase = get_service_client()
    res = supabase.table("teacher_profiles").select("*").eq("auth_user_id", user_id).limit(1).execute()
    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (get teacher profile raw): {res.error}")
    return {"row": (res.data or [None])[0]}

@teacher_router.post("/api/admin/teacher-profiles/backfill", summary="Admin: backfill all approved teacher applications into teacher_profiles")
def admin_backfill_teacher_profiles(authorization: Optional[str] = Header(default=None)):
    _require_admin(authorization)
    supabase = get_service_client()
    # Fetch all approved applications
    apps = supabase.table("teacher_applications").select("auth_user_id,name,email,college_id,department_id,status").eq("status","approved").execute()
    if getattr(apps, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (fetch approved apps): {apps.error}")
    rows = apps.data or []
    inserted = 0; updated = 0; errors = []
    for r in rows:
        uid = r.get("auth_user_id")
        if not uid:
            continue
        payload = _supabase_payload({
            "auth_user_id": str(uid) if uid else None,
            "name": r.get("name"),
            "email": r.get("email"),
            "college_id": r.get("college_id"),
            "department_id": r.get("department_id"),
        })
        existing = supabase.table("teacher_profiles").select("auth_user_id").eq("auth_user_id", uid).limit(1).execute()
        if getattr(existing, "error", None):
            errors.append({"user": uid, "error": str(existing.error)})
            continue
        if existing.data:
            upd_payload = {k: v for k, v in payload.items() if k != "auth_user_id"}
            upd = supabase.table("teacher_profiles").update(upd_payload).eq("auth_user_id", uid).execute()
            if getattr(upd, "error", None):
                errors.append({"user": uid, "error": str(upd.error)})
            else:
                updated += 1
        else:
            ins = supabase.table("teacher_profiles").insert(payload).execute()
            if getattr(ins, "error", None):
                errors.append({"user": uid, "error": str(ins.error)})
            else:
                inserted += 1
    return {"ok": True, "inserted": inserted, "updated": updated, "errors": errors, "total_approved": len(rows)}

@teacher_router.get("/api/admin/teacher-profiles/diagnostics", summary="Admin: diagnostics counts for teacher profiles vs applications")
def admin_teacher_profiles_diagnostics(authorization: Optional[str] = Header(default=None)):
    _require_admin(authorization)
    supabase = get_service_client()
    apps = supabase.table("teacher_applications").select("auth_user_id,status").execute()
    if getattr(apps, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (apps diag): {apps.error}")
    profs = supabase.table("teacher_profiles").select("auth_user_id").execute()
    if getattr(profs, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (profiles diag): {profs.error}")
    app_rows = apps.data or []
    prof_rows = profs.data or []
    approved_set = {r.get("auth_user_id") for r in app_rows if r.get("status") == "approved" and r.get("auth_user_id")}
    profile_set = {r.get("auth_user_id") for r in prof_rows if r.get("auth_user_id")}
    missing = sorted(list(approved_set - profile_set))
    extra = sorted(list(profile_set - approved_set))
    return {"approved_count": len(approved_set), "profile_count": len(profile_set), "missing_profiles_for_approved": missing, "profiles_without_approved_app": extra}

def _enrich_academics(supabase: Client, core: Dict[str, Any]):
    college_id = core.get("college_id")
    dept_id = core.get("department_id")
    if college_id:
        c = supabase.table("colleges").select("name").eq("id", college_id).limit(1).execute()
        if not getattr(c, "error", None) and c.data:
            core["college_name"] = c.data[0].get("name")
    if dept_id:
        d = supabase.table("departments").select("name,degree_id").eq("id", dept_id).limit(1).execute()
        degree_id = None
        if not getattr(d, "error", None) and d.data:
            core["department_name"] = d.data[0].get("name")
            degree_id = d.data[0].get("degree_id")
        if degree_id:
            deg = supabase.table("degrees").select("name").eq("id", degree_id).limit(1).execute()
            if not getattr(deg, "error", None) and deg.data:
                core["degree_name"] = deg.data[0].get("name")

def _fetch_teacher_classes(supabase: Client, teacher_user_id: str) -> List[Dict[str, Any]]:
    cls = supabase.table("teacher_classes").select("id,batch_id,semester,subject,subject_id,section,degree_id,department_id,college_id,created_at").eq("teacher_user_id", teacher_user_id).order("created_at", desc=True).limit(500).execute()
    if getattr(cls, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (teacher classes): {cls.error}")
    classes = cls.data or []
    # Collect IDs for enrichment
    batch_ids = {c.get("batch_id") for c in classes if c.get("batch_id")}
    degree_ids = {c.get("degree_id") for c in classes if c.get("degree_id")}
    dept_ids = {c.get("department_id") for c in classes if c.get("department_id")}
    college_ids = {c.get("college_id") for c in classes if c.get("college_id")}
    batch_map: Dict[str, Any] = {}
    def _sel(table, ids, cols):
        if not ids:
            return {}
        res = supabase.table(table).select(cols).in_("id", list(ids)).execute()
        out = {}
        if not getattr(res, "error", None):
            for r in res.data or []:
                out[r.get("id")] = r
        return out
    batch_map = _sel("batches", batch_ids, "id,from_year,to_year")
    degree_map = _sel("degrees", degree_ids, "id,name")
    dept_map = _sel("departments", dept_ids, "id,name")
    college_map = _sel("colleges", college_ids, "id,name")
    for c in classes:
        bid = c.get("batch_id"); b = batch_map.get(bid)
        if b:
            c["batch_range"] = f"{b.get('from_year')}-{b.get('to_year')}" if b.get('from_year') and b.get('to_year') else None
        if c.get("degree_id"):
            c["degree_name"] = degree_map.get(c.get("degree_id"), {}).get("name")
        if c.get("department_id"):
            c["department_name"] = dept_map.get(c.get("department_id"), {}).get("name")
        if c.get("college_id"):
            c["college_name"] = college_map.get(c.get("college_id"), {}).get("name")
        # Label for UI
        sem = c.get("semester")
        subj = c.get("subject")
        c["label"] = f"Sem {sem}: {subj}" if sem and subj else (subj or "Class")
    return classes

def _group_classes(classes: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
    groups: Dict[str, List[Dict[str, Any]]] = {}
    for c in classes:
        sem = c.get("semester") or 0
        key = f"Semester {sem}" if sem else "Unassigned"
        groups.setdefault(key, []).append(c)
    # Sort within groups by subject
    for g in groups.values():
        g.sort(key=lambda x: (x.get("subject") or "").lower())
    # Order groups numerically
    ordered = dict(sorted(groups.items(), key=lambda kv: int(re.sub(r"[^0-9]", "", kv[0]) or 0)))
    return ordered

@teacher_router.get("/api/teacher/profile/{user_id}", summary="Get teacher profile (public)")
async def get_teacher_profile(
    user_id: str,
    authorization: Optional[str] = Header(default=None),
    strict_q: Optional[str] = Query(default=None, alias="strict"),
    x_strict: Optional[str] = Header(default=None, alias="X-TeacherProfile-Strict"),
):
    """Optimized variant that:
    - Resolves 'me' and then performs concurrent Supabase reads
    - Honors `strict` flag (query or header) to avoid legacy fallbacks for faster response
    - Uses estimated count for notes to reduce DB cost
    """
    supabase = get_service_client()

    # Resolve 'me'
    if user_id == "me":
        try:
            uid, _ = _get_auth_user(authorization)
            user_id = uid
        except HTTPException:
            raise HTTPException(status_code=401, detail="Authentication required for 'me'")

    def _is_truthy(val: Optional[str]) -> bool:
        if val is None:
            return False
        v = str(val).strip().lower()
        return v in {"1", "true", "yes", "on"}

    strict = _is_truthy(strict_q) or _is_truthy(x_strict)

    # --- Concurrent fetches: core, classes, and notes count ---
    def _retry_blocking(fn, *a, retries=3, base_delay=0.15, **kw):
        last_exc = None
        for attempt in range(retries):
            try:
                return fn(*a, **kw)
            except RETRYABLE_EXCEPTIONS as e:  # type: ignore
                last_exc = e
                time.sleep(base_delay * (attempt + 1))
                continue
        if last_exc:
            supabase_logger.warning("teacher_profile core fetch retry exhausted: %s", last_exc)
        return fn(*a, **kw)  # final attempt, let exception propagate

    async def fetch_core():
        # Parallelize core sources: teacher_profiles, teacher_applications, admin_roles, user_profiles (if not strict)
        loop = asyncio.get_running_loop()
        tprof_fut = loop.run_in_executor(None, lambda: _retry_blocking(lambda: supabase.table("teacher_profiles").select(
            "name,email,college_id,department_id,headline,bio,specialization,years_experience,qualification,availability,social,profile_image_url"
        ).eq("auth_user_id", user_id).limit(1).execute()))
        tapp_fut = loop.run_in_executor(None, lambda: _retry_blocking(lambda: supabase.table("teacher_applications").select(
            "name,email,college_id,department_id,subjects,status"
        ).eq("auth_user_id", user_id).limit(1).execute()))
        role_fut = loop.run_in_executor(None, lambda: _retry_blocking(lambda: supabase.table("admin_roles").select("role").eq("auth_user_id", user_id).limit(1).execute()))
        prof_fut = None
        if not strict:
            prof_fut = loop.run_in_executor(None, lambda: _retry_blocking(lambda: supabase.table("user_profiles").select(
                "name,profile_image_url,headline,bio,semester,batch_from,batch_to"
            ).eq("auth_user_id", user_id).limit(1).execute()))

        tprof, tapp, role_res, prof = await asyncio.gather(
            tprof_fut, tapp_fut, role_fut, prof_fut if prof_fut is not None else asyncio.sleep(0, result=None)
        )

        if getattr(tapp, "error", None):
            raise HTTPException(status_code=500, detail=f"Supabase error (teacher application): {tapp.error}")

        core: Dict[str, Any] = {"auth_user_id": user_id}
        if not getattr(tprof, "error", None) and getattr(tprof, "data", None):
            rowp = tprof.data[0]
            for k in ["name", "email", "college_id", "department_id"]:
                if rowp.get(k):
                    core[k] = rowp.get(k)
            core.update({k: rowp.get(k) for k in ["headline", "bio", "specialization", "years_experience", "qualification", "availability", "social"] if k in rowp})
            if rowp.get("profile_image_url"):
                core["avatar_url"] = rowp.get("profile_image_url")

        if getattr(tapp, "data", None):
            arow = tapp.data[0]
            for k in ["subjects", "status"]:
                if arow.get(k) is not None:
                    core[k] = arow.get(k)
            for k in ["name", "email", "college_id", "department_id"]:
                if not core.get(k) and arow.get(k):
                    core[k] = arow.get(k)

        if not getattr(role_res, "error", None) and getattr(role_res, "data", None):
            core["role"] = role_res.data[0].get("role")

        if (not strict) and prof is not None and (not getattr(prof, "error", None)) and getattr(prof, "data", None):
            row = prof.data[0]
            if not core.get("name") and row.get("name"):
                core["name"] = row.get("name")
            if not core.get("avatar_url") and row.get("profile_image_url"):
                core["avatar_url"] = row.get("profile_image_url")
            if not core.get("headline") and row.get("headline"):
                core["headline"] = row.get("headline")
            if not core.get("bio") and row.get("bio"):
                core["bio"] = row.get("bio")

        return core

    async def fetch_classes():
        # Fetch classes, then enrich lookups concurrently
        loop = asyncio.get_running_loop()
        cls = await loop.run_in_executor(None, lambda: _retry_blocking(lambda: supabase.table("teacher_classes").select(
            "id,batch_id,semester,subject,subject_id,section,degree_id,department_id,college_id,created_at"
        ).eq("teacher_user_id", user_id).order("created_at", desc=True).limit(500).execute()))
        if getattr(cls, "error", None):
            raise HTTPException(status_code=500, detail=f"Supabase error (teacher classes): {cls.error}")
        classes = cls.data or []
        batch_ids = {c.get("batch_id") for c in classes if c.get("batch_id")}
        degree_ids = {c.get("degree_id") for c in classes if c.get("degree_id")}
        dept_ids = {c.get("department_id") for c in classes if c.get("department_id")}
        college_ids = {c.get("college_id") for c in classes if c.get("college_id")}

        def _sel(table, ids, cols):
            if not ids:
                return {}
            def _do():
                return supabase.table(table).select(cols).in_("id", list(ids)).execute()
            res = _retry_blocking(_do)
            out = {}
            if not getattr(res, "error", None):
                for r in res.data or []:
                    out[r.get("id")] = r
            return out

        # Run the 4 lookups concurrently
        batch_fut = asyncio.to_thread(_sel, "batches", batch_ids, "id,from_year,to_year")
        degree_fut = asyncio.to_thread(_sel, "degrees", degree_ids, "id,name")
        dept_fut = asyncio.to_thread(_sel, "departments", dept_ids, "id,name")
        college_fut = asyncio.to_thread(_sel, "colleges", college_ids, "id,name")
        batch_map, degree_map, dept_map, college_map = await asyncio.gather(batch_fut, degree_fut, dept_fut, college_fut)

        for c in classes:
            bid = c.get("batch_id"); b = batch_map.get(bid)
            if b:
                c["batch_range"] = f"{b.get('from_year')}-{b.get('to_year')}" if b.get('from_year') and b.get('to_year') else None
            if c.get("degree_id"):
                c["degree_name"] = degree_map.get(c.get("degree_id"), {}).get("name")
            if c.get("department_id"):
                c["department_name"] = dept_map.get(c.get("department_id"), {}).get("name")
            if c.get("college_id"):
                c["college_name"] = college_map.get(c.get("college_id"), {}).get("name")
            sem = c.get("semester"); subj = c.get("subject")
            c["label"] = f"Sem {sem}: {subj}" if sem and subj else (subj or "Class")
        return classes

    async def enrich_academics(core: Dict[str, Any]):
        # Resolve college/department names; do department & college in parallel, then maybe degree
        loop = asyncio.get_running_loop()
        college_id = core.get("college_id")
        dept_id = core.get("department_id")
        if not college_id and not dept_id:
            return
        college_fut = loop.run_in_executor(None, lambda: _retry_blocking(lambda: supabase.table("colleges").select("name").eq("id", college_id).limit(1).execute())) if college_id else asyncio.sleep(0, result=None)
        dept_fut = loop.run_in_executor(None, lambda: _retry_blocking(lambda: supabase.table("departments").select("name,degree_id").eq("id", dept_id).limit(1).execute())) if dept_id else asyncio.sleep(0, result=None)
        college_res, dept_res = await asyncio.gather(college_fut, dept_fut)
        degree_id = None
        if college_res and not getattr(college_res, "error", None) and getattr(college_res, "data", None):
            core["college_name"] = college_res.data[0].get("name")
        if dept_res and not getattr(dept_res, "error", None) and getattr(dept_res, "data", None):
            core["department_name"] = dept_res.data[0].get("name")
            degree_id = dept_res.data[0].get("degree_id")
        if degree_id:
            deg = await loop.run_in_executor(None, lambda: _retry_blocking(lambda: supabase.table("degrees").select("name").eq("id", degree_id).limit(1).execute()))
            if not getattr(deg, "error", None) and getattr(deg, "data", None):
                core["degree_name"] = deg.data[0].get("name")

    async def fetch_notes_count():
        loop = asyncio.get_running_loop()
        try:
            # estimated is much cheaper than exact for counts
            nres = await loop.run_in_executor(None, lambda: supabase.table("marketplace_notes").select("id", count="estimated").eq("owner_user_id", user_id).execute())
            if not getattr(nres, "error", None):
                return getattr(nres, "count", 0) or 0
        except Exception:
            return 0
        return 0

    core, classes, notes_count = await asyncio.gather(fetch_core(), fetch_classes(), fetch_notes_count())

    if core.get("role") not in {"teacher", "admin"} and core.get("status") != "approved":
        raise HTTPException(status_code=404, detail="Teacher not found")

    # Enrich academics after core is fetched
    await enrich_academics(core)

    subjects = sorted({c.get("subject") for c in classes if c.get("subject")})
    grouped = _group_classes(classes)
    stats = {
        "notes_count": notes_count,
        "classes_count": len(classes),
        "subjects_count": len(subjects),
    }
    return {"teacher": core, "classes": classes, "grouped_classes": grouped, "subjects": subjects, "stats": stats}

class TeacherProfileUpsertIn(BaseModel):
    headline: Optional[str] = None
    bio: Optional[str] = None
    specialization: Optional[List[str]] = None
    years_experience: Optional[int] = Field(None, ge=0, le=80)
    qualification: Optional[str] = None
    availability: Optional[Dict[str, Any]] = None
    social: Optional[Dict[str, Any]] = None
    # Allow editing identity/academic linkage if needed (optional; admin may validate externally)
    name: Optional[str] = None
    email: Optional[str] = None
    college_id: Optional[uuid.UUID] = None
    department_id: Optional[uuid.UUID] = None
    profile_image_url: Optional[str] = None  # normally set via upload endpoint

# ================= Teacher Classes CRUD Models ==================
class TeacherClassIn(BaseModel):
    subject: str = Field(..., min_length=1, max_length=255)
    semester: Optional[int] = Field(None, ge=1, le=12)
    batch_id: Optional[uuid.UUID] = None
    section: Optional[str] = Field(None, max_length=32)
    college_id: Optional[uuid.UUID] = None
    degree_id: Optional[uuid.UUID] = None
    department_id: Optional[uuid.UUID] = None
    subject_id: Optional[uuid.UUID] = None  # link to syllabus_courses.id
    notes: Optional[str] = None

class TeacherClassUpdate(BaseModel):
    subject: Optional[str] = Field(None, min_length=1, max_length=255)
    semester: Optional[int] = Field(None, ge=1, le=12)
    batch_id: Optional[uuid.UUID] = None
    section: Optional[str] = Field(None, max_length=32)
    college_id: Optional[uuid.UUID] = None
    degree_id: Optional[uuid.UUID] = None
    department_id: Optional[uuid.UUID] = None
    subject_id: Optional[uuid.UUID] = None
    notes: Optional[str] = None

class TeacherClassOut(BaseModel):
    id: uuid.UUID
    teacher_user_id: uuid.UUID
    subject: str
    semester: Optional[int] = None
    batch_id: Optional[uuid.UUID] = None
    section: Optional[str] = None
    college_id: Optional[uuid.UUID] = None
    degree_id: Optional[uuid.UUID] = None
    department_id: Optional[uuid.UUID] = None
    subject_id: Optional[uuid.UUID] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

def _map_teacher_class_row(row: Dict[str, Any]) -> TeacherClassOut:
    return TeacherClassOut(
        id=uuid.UUID(row["id"]),
        teacher_user_id=uuid.UUID(row["teacher_user_id"]),
        subject=row.get("subject") or "",
        semester=row.get("semester"),
        batch_id=uuid.UUID(row["batch_id"]) if row.get("batch_id") else None,
        section=row.get("section"),
        college_id=uuid.UUID(row["college_id"]) if row.get("college_id") else None,
        degree_id=uuid.UUID(row["degree_id"]) if row.get("degree_id") else None,
        department_id=uuid.UUID(row["department_id"]) if row.get("department_id") else None,
        subject_id=uuid.UUID(row["subject_id"]) if row.get("subject_id") else None,
        notes=row.get("notes"),
        created_at=row.get("created_at"),
        updated_at=row.get("updated_at"),
    )

@teacher_router.put("/api/teacher/profile/me", summary="Upsert my extended teacher profile")
def upsert_teacher_profile(payload: TeacherProfileUpsertIn, authorization: Optional[str] = Header(default=None)):
    uid = _require_teacher(authorization)
    supabase = get_service_client()
    row = _supabase_payload(payload.dict(exclude_unset=True))
    if not row:
        return {"ok": True, "updated": False}
    row["auth_user_id"] = str(uid)
    row = _supabase_payload(row)
    # Try update first
    existing = supabase.table("teacher_profiles").select("auth_user_id").eq("auth_user_id", uid).limit(1).execute()
    if getattr(existing, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (get teacher profile): {existing.error}")
    if existing.data:
        upd = supabase.table("teacher_profiles").update(row).eq("auth_user_id", uid).execute()
        if getattr(upd, "error", None):
            raise HTTPException(status_code=500, detail=f"Supabase error (update teacher profile): {upd.error}")
    else:
        ins = supabase.table("teacher_profiles").insert(row).execute()
        if getattr(ins, "error", None):
            raise HTTPException(status_code=500, detail=f"Supabase error (insert teacher profile): {ins.error}")
    return {"ok": True, "updated": True}

@teacher_router.post("/api/teacher/profile/avatar", summary="Upload/replace teacher profile avatar (stores public URL in teacher_profiles)")
async def upload_teacher_avatar(file: UploadFile = File(...), authorization: Optional[str] = Header(default=None)):
    """Store teacher avatar in a Supabase Storage bucket and persist the public URL.

    Env vars consulted (first found wins):
      SUPABASE_TEACHER_AVATARS_BUCKET | SUPABASE_AVATARS_BUCKET | SUPABASE_PUBLIC_BUCKET | (fallback) 'teacher-avatars'
    Object key pattern: teacher_avatars/<auth_user_id><ext>
    """
    uid = _require_teacher(authorization)
    supabase = get_service_client()
    debug = bool(os.getenv("TEACHER_PROFILE_DEBUG"))
    filename = file.filename or "avatar.jpg"
    ext = (Path(filename).suffix or ".jpg").lower()
    allowed = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
    if ext not in allowed:
        raise HTTPException(status_code=400, detail="Unsupported image type")
    data = await file.read()
    if len(data) > 3 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image too large (max 3MB)")
    mime_map = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif"}
    content_type = mime_map.get(ext, "application/octet-stream")
    bucket = (
        os.getenv("SUPABASE_TEACHER_AVATARS_BUCKET")
        or os.getenv("SUPABASE_AVATARS_BUCKET")
        or os.getenv("SUPABASE_BUCKET")  # generic project bucket key you provided
        or os.getenv("SUPABASE_PUBLIC_BUCKET")
        or "teacher-avatars"
    )
    object_path = f"teacher_avatars/{uid}{ext}"
    try:
        # Ensure bucket exists (service role key has permission)
        try:
            buckets = supabase.storage.list_buckets()
            names = {b.get('name') for b in (buckets or []) if isinstance(b, dict)}
            if bucket not in names:
                if debug:
                    try: print(f"[TPROF_DEBUG] Creating missing bucket {bucket}")
                    except Exception: pass
                supabase.storage.create_bucket(bucket, public=True)
        except Exception as be:
            if debug:
                try: print(f"[TPROF_DEBUG] Bucket check/create error={be}")
                except Exception: pass
            # Continue; upload may still work if race condition
        storage = supabase.storage.from_(bucket)
        # Supabase python client expects header values as str; use 'true' not True
        file_opts = {
            "content-type": content_type,
            "upsert": "true",  # critical: must be string
            "cache-control": "86400",
        }
        upload_res = storage.upload(object_path, data, file_opts)
        if debug:
            try: print(f"[TPROF_DEBUG] Avatar upload result bucket={bucket} path={object_path} res={upload_res}")
            except Exception: pass
    except Exception as e:
        msg = str(e)
        if debug:
            try: print(f"[TPROF_DEBUG] Avatar upload exception msg={msg}")
            except Exception: pass
        if "Header value" in msg and "bool" in msg:
            msg += " (probable cause: boolean value in file options; fixed to string but please retry)"
        raise HTTPException(status_code=500, detail=f"Failed to upload avatar: {msg}")
    # Obtain public URL
    try:
        pub = storage.get_public_url(object_path)
        # supabase-py returns dict with publicUrl key
        if isinstance(pub, dict):
            public_url = pub.get("publicUrl") or pub.get("public_url") or pub.get("data") or ""
        else:
            public_url = str(pub)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get public URL: {e}")
    if not public_url:
        raise HTTPException(status_code=500, detail="Public URL empty after upload")
    # Update / upsert teacher_profiles
    existing = supabase.table("teacher_profiles").select("auth_user_id").eq("auth_user_id", uid).limit(1).execute()
    if getattr(existing, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (get teacher profile for avatar): {existing.error}")
    payload = {"profile_image_url": public_url}
    if existing.data:
        upd = supabase.table("teacher_profiles").update(payload).eq("auth_user_id", uid).execute()
        if getattr(upd, "error", None):
            raise HTTPException(status_code=500, detail=f"Supabase error (update avatar): {upd.error}")
    else:
        payload["auth_user_id"] = uid
        ins = supabase.table("teacher_profiles").insert(payload).execute()
        if getattr(ins, "error", None):
            raise HTTPException(status_code=500, detail=f"Supabase error (insert avatar profile): {ins.error}")
    return {"ok": True, "profile_image_url": public_url, "avatar_url": public_url, "bucket": bucket, "path": object_path}

@teacher_router.post("/api/teacher/profile/me/avatar", summary="Upload/replace my teacher profile avatar (alt path)")
async def upload_teacher_avatar_alt(file: UploadFile = File(...), authorization: Optional[str] = Header(default=None)):
    # Reuse logic by calling original function
    return await upload_teacher_avatar(file=file, authorization=authorization)

# ================= Teacher Academics Options (college/departments/batches) ==================
@teacher_router.get("/api/teacher/academics/mine", summary="Return teacher's academic linkage and available departments + batches")
def get_teacher_academics_mine(authorization: Optional[str] = Header(default=None)):
    uid = _require_teacher(authorization)
    supabase = get_service_client()
    # Resolve college / department primarily from teacher_profiles then fallback application
    prof = supabase.table("teacher_profiles").select("college_id,department_id").eq("auth_user_id", uid).limit(1).execute()
    college_id = department_id = None
    if not getattr(prof, "error", None) and prof.data:
        row = prof.data[0]
        college_id = row.get("college_id") or None
        department_id = row.get("department_id") or None
    if not college_id or not department_id:
        app = supabase.table("teacher_applications").select("college_id,department_id").eq("auth_user_id", uid).limit(1).execute()
        if not getattr(app, "error", None) and app.data:
            arow = app.data[0]
            college_id = college_id or arow.get("college_id") or None
            department_id = department_id or arow.get("department_id") or None
    departments: List[Dict[str, Any]] = []
    batches: List[Dict[str, Any]] = []
    degrees: List[Dict[str, Any]] = []
    degree_id: Optional[str] = None
    if college_id:
        # Departments for college
        dres = supabase.table("departments").select("id,name,degree_id").eq("college_id", str(college_id)).order("name").execute()
        if getattr(dres, "error", None):
            raise HTTPException(status_code=500, detail=f"Supabase error (departments): {dres.error}")
        departments = dres.data or []
        # Degrees for college (only those referenced by departments for efficiency)
        deg_ids = sorted({d.get("degree_id") for d in departments if d.get("degree_id")})
        if deg_ids:
            deg_res = supabase.table("degrees").select("id,name").in_("id", deg_ids).execute()
            if not getattr(deg_res, "error", None):
                degrees = deg_res.data or []
        # Determine teacher's degree id via their department row
        if department_id:
            for d in departments:
                if d.get("id") == department_id:
                    degree_id = d.get("degree_id")
                    break
        # Batches (filtered later by department client-side)
        bres = supabase.table("batches").select("id,department_id,from_year,to_year").eq("college_id", str(college_id)).order("from_year").execute()
        if getattr(bres, "error", None):
            raise HTTPException(status_code=500, detail=f"Supabase error (batches): {bres.error}")
        raw_batches = bres.data or []
        for b in raw_batches:
            fy = b.get("from_year"); ty = b.get("to_year")
            b["label"] = f"{fy}-{ty}" if fy and ty else "Batch"
            batches.append(b)
    return {
        "college_id": college_id,
        "department_id": department_id,
        "degree_id": degree_id,
        "departments": departments,
        "batches": batches,
        "degrees": degrees,
    }
# ================= Debug Helpers (can be removed in production) ==================
@teacher_router.get("/api/debug/teacher-routes", summary="Debug: list registered teacher routes")
def debug_list_teacher_routes():
    from fastapi.routing import APIRoute
    routes = []
    for r in teacher_router.routes:  # only teacher_router scope
        if isinstance(r, APIRoute):
            routes.append({
                "path": r.path,
                "methods": sorted(list(r.methods - {"HEAD"})),
                "name": r.name,
            })
    return {"routes": routes}

@teacher_router.get("/api/debug/teacher-avatar-route", summary="Debug: confirm avatar route present")
def debug_avatar_route_presence():
    from fastapi.routing import APIRoute
    present = False
    methods: List[str] = []
    for r in teacher_router.routes:
        if isinstance(r, APIRoute) and r.path == "/api/teacher/profile/avatar":
            present = True
            methods = sorted(list(r.methods - {"HEAD"}))
            break
    return {"avatar_route_present": present, "methods": methods}

# ================= Teacher Classes CRUD Endpoints ==================
@teacher_router.get("/api/teacher/classes/mine", response_model=List[TeacherClassOut], summary="List my teacher classes")
def list_my_teacher_classes(authorization: Optional[str] = Header(default=None)):
    uid = _require_teacher(authorization)
    supabase = get_service_client()
    # Apply lightweight retry for transient protocol disconnections from httpx/httpcore
    try:
        res = _supabase_retry(
            lambda: (
                supabase
                .table("teacher_classes")
                .select("*")
                .eq("teacher_user_id", uid)
                .order("updated_at", desc=True)
                .execute()
            )
        )
    except HTTPXRemoteProtocolError as exc:  # pragma: no cover - network timing dependent
        logging.getLogger("teachers").warning(
            "list_my_teacher_classes transient protocol error, returning empty list: %s", exc
        )
        return []
    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (list classes): {res.error}")
    rows = res.data or []
    return [_map_teacher_class_row(r) for r in rows]

@teacher_router.post("/api/teacher/classes", response_model=TeacherClassOut, summary="Create a teacher class")
def create_teacher_class(payload: TeacherClassIn, authorization: Optional[str] = Header(default=None)):
    uid = _require_teacher(authorization)
    supabase = get_service_client()
    row = _supabase_payload(payload.dict(exclude_unset=True))
    row["teacher_user_id"] = str(uid)
    row = _supabase_payload(row)
    ins = supabase.table("teacher_classes").insert(row).execute()
    if getattr(ins, "error", None):
        err_txt = str(ins.error)
        if "duplicate key value" in err_txt or "unique" in err_txt.lower():
            raise HTTPException(status_code=409, detail="Class already exists for subject + batch + semester + section")
        raise HTTPException(status_code=500, detail=f"Supabase error (insert class): {ins.error}")
    created = (ins.data or [])[0]
    return _map_teacher_class_row(created)

@teacher_router.put("/api/teacher/classes/{class_id}", response_model=TeacherClassOut, summary="Update a teacher class")
def update_teacher_class(class_id: uuid.UUID, payload: TeacherClassUpdate, authorization: Optional[str] = Header(default=None)):
    uid = _require_teacher(authorization)
    supabase = get_service_client()
    # Ensure ownership
    existing = supabase.table("teacher_classes").select("id,teacher_user_id").eq("id", str(class_id)).limit(1).execute()
    if getattr(existing, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (get class): {existing.error}")
    if not existing.data:
        raise HTTPException(status_code=404, detail="Class not found")
    if existing.data[0].get("teacher_user_id") != uid:
        raise HTTPException(status_code=403, detail="Cannot modify another teacher's class")
    updates = _supabase_payload(payload.dict(exclude_unset=True))
    if not updates:
        row_res = supabase.table("teacher_classes").select("*").eq("id", str(class_id)).limit(1).execute()
        if getattr(row_res, "error", None):
            raise HTTPException(status_code=500, detail=f"Supabase error (reload class): {row_res.error}")
        return _map_teacher_class_row(row_res.data[0])
    upd = supabase.table("teacher_classes").update(updates).eq("id", str(class_id)).execute()
    if getattr(upd, "error", None):
        err_txt = str(upd.error)
        if "duplicate key value" in err_txt or "unique" in err_txt.lower():
            raise HTTPException(status_code=409, detail="Another class with same keys exists")
        raise HTTPException(status_code=500, detail=f"Supabase error (update class): {upd.error}")
    row_res = supabase.table("teacher_classes").select("*").eq("id", str(class_id)).limit(1).execute()
    if getattr(row_res, "error", None) or not row_res.data:
        raise HTTPException(status_code=500, detail="Failed to reload updated class")
    return _map_teacher_class_row(row_res.data[0])

@teacher_router.delete("/api/teacher/classes/{class_id}", summary="Delete a teacher class")
def delete_teacher_class(class_id: uuid.UUID, authorization: Optional[str] = Header(default=None)):
    uid = _require_teacher(authorization)
    supabase = get_service_client()
    existing = supabase.table("teacher_classes").select("id,teacher_user_id").eq("id", str(class_id)).limit(1).execute()
    if getattr(existing, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (get class): {existing.error}")
    if not existing.data:
        raise HTTPException(status_code=404, detail="Class not found")
    if existing.data[0].get("teacher_user_id") != uid:
        raise HTTPException(status_code=403, detail="Cannot delete another teacher's class")
    del_res = supabase.table("teacher_classes").delete().eq("id", str(class_id)).execute()
    if getattr(del_res, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (delete class): {del_res.error}")
    return {"ok": True, "deleted": True, "id": str(class_id)}


def _asset_debug(msg: str, **extra):  # lightweight conditional debug
    if os.getenv("ASSET_DEBUG"):
        try:
            print(f"[ASSET_DEBUG] {msg} " + (" ".join(f"{k}={v}" for k,v in extra.items())))
        except Exception:
            pass


def _upload_college_logo(college_id: uuid.UUID, file: UploadFile):
    supabase = get_service_client()
    # Resolve primary bucket with fallbacks
    bucket = (
        os.getenv("SUPABASE_BUCKET", "").strip()
        or os.getenv("SUPABASE_ASSETS_BUCKET", "").strip()
        or os.getenv("SUPABASE_PROJECTS_BUCKET", "").strip()
    )
    if not bucket:
        raise HTTPException(status_code=500, detail="Missing SUPABASE_BUCKET (and fallbacks) in environment")
    filename = file.filename or "logo.png"
    ext = os.path.splitext(filename)[1].lower()
    if ext not in {".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"}:
        raise HTTPException(status_code=400, detail="Unsupported logo image type")
    blob = _read_upload_bytes(file)
    if not blob:
        raise HTTPException(status_code=400, detail="Empty upload")
    # Path pattern: colleges/{college_id}/logo{rand}.ext (keep history by random hash)
    from uuid import uuid4
    dest = f"colleges/{college_id}/logo-{uuid4().hex}{ext}"
    try:
        supabase_logger.info(
            "Uploading college logo", extra={
                "college_id": str(college_id),
                "bucket": bucket,
                "dest": dest,
                "size": len(blob),
                "content_type": file.content_type,
            }
        )
        _asset_debug("start_logo_upload", college_id=college_id, bucket=bucket, dest=dest, size=len(blob), ct=file.content_type)
        _storage_upload_bytes(supabase, bucket, dest, blob, file.content_type or "image/png")
    except HTTPException:
        _asset_debug("logo_upload_http_exception", college_id=college_id)
        raise
    except Exception as exc:
        supabase_logger.exception("College logo upload unexpected failure")
        _asset_debug("logo_upload_unexpected_failure", college_id=college_id, error=exc)
        raise HTTPException(status_code=500, detail=f"Unexpected upload failure: {exc}")
    public_url = _storage_public_url(supabase, bucket, dest)
    _asset_debug("logo_public_url", college_id=college_id, url=public_url)
    upd = supabase.table("colleges").update({"logo_url": public_url}).eq("id", str(college_id)).execute()
    if getattr(upd, "error", None):
        _asset_debug("logo_db_update_failed", college_id=college_id, error=upd.error)
        raise HTTPException(status_code=500, detail=f"Supabase error (update college logo): {upd.error}")
    _asset_debug("logo_db_update_success", college_id=college_id)
    return {"college_id": str(college_id), "logo_url": public_url, "path": dest}


@academics_router.post("/api/colleges/{college_id}/logo", summary="Upload/replace college logo")
def upload_college_logo(college_id: uuid.UUID, file: UploadFile = File(...)):
    # Existence check (fast fail)
    supabase = get_service_client()
    _asset_debug("endpoint_invoked", college_id=college_id, filename=file.filename, ct=file.content_type)
    exists = supabase.table("colleges").select("id").eq("id", str(college_id)).limit(1).execute()
    if getattr(exists, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (find college): {exists.error}")
    if not exists.data:
        raise HTTPException(status_code=404, detail="College not found")
    return _upload_college_logo(college_id, file)


@academics_router.get("/api/colleges/{college_id}/logo/debug", summary="Debug: list stored logo objects for a college")
def debug_list_college_logos(college_id: uuid.UUID):  # pragma: no cover - debug utility
    supabase = get_service_client()
    bucket = (
        os.getenv("SUPABASE_BUCKET", "").strip()
        or os.getenv("SUPABASE_ASSETS_BUCKET", "").strip()
        or os.getenv("SUPABASE_PROJECTS_BUCKET", "").strip()
    )
    if not bucket:
        raise HTTPException(status_code=500, detail="Missing SUPABASE_BUCKET (and fallbacks) in environment")
    storage = _storage_get_client(supabase)
    prefix = f"colleges/{college_id}".rstrip("/")
    try:
        # Some SDK versions: list(path=prefix, ...) ; others: from_(bucket).list(path=prefix)
        try:
            objs = storage.from_(bucket).list(prefix)
        except TypeError:
            objs = storage.from_(bucket).list(path=prefix)
    except Exception as exc:
        supabase_logger.exception("List objects failed")
        raise HTTPException(status_code=500, detail=f"List failed: {exc}")
    out = []
    if isinstance(objs, list):
        for o in objs:
            if not isinstance(o, dict):
                continue
            name = o.get("name") or o.get("Key")
            if not name:
                continue
            full_path = f"{prefix}/{name}" if not name.startswith(prefix) else name
            out.append({
                "name": name,
                "path": full_path,
                "size": o.get("metadata", {}).get("size") if isinstance(o.get("metadata"), dict) else o.get("size"),
                "last_modified": o.get("updated_at") or o.get("LastModified") or o.get("last_modified"),
                "public_url": _storage_public_url(supabase, bucket, full_path),
            })
    return {"bucket": bucket, "prefix": prefix, "objects": out}


@academics_router.post("/api/colleges", response_model=CollegeFullOut, summary="Create or update a college with departments & batches")
def create_college(payload: CollegeCreateIn):
    college_id = upsert_college(payload.college_name)
    sync_degree_hierarchy(college_id, payload.degrees or [])
    data = get_college_full(college_id)
    return CollegeFullOut(**data)


@academics_router.post(
    "/api/colleges/simple",
    response_model=CollegeFullOut,
    summary="Create a college by name with no academic structure",
)
def create_college_simple(payload: CollegeNameOnlyIn):
    college_id = upsert_college(payload.name)
    data = get_college_full(college_id)
    return CollegeFullOut(**data)


@academics_router.get("/api/colleges", response_model=List[College], summary="List all colleges (id & name)")
def list_colleges():
    supabase = get_service_client()
    # Apply lightweight retry for transient RemoteProtocolError or connection resets
    import time, logging
    from httpx import RemoteProtocolError
    attempts = 0
    last_exc = None
    backoffs = [0.0, 0.15, 0.35, 0.75]
    while attempts < len(backoffs):
        try:
            res = supabase.table("colleges").select("id,name,logo_url").order("name").execute()
            # Some SDK versions expose .error
            if getattr(res, "error", None):
                raise RuntimeError(f"Supabase error: {res.error}")
            return [
                {"id": row["id"], "name": row["name"], "logo_url": row.get("logo_url")}
                for row in (res.data or [])
                if isinstance(row, dict) and row.get("id") and row.get("name")
            ]
        except (RemoteProtocolError, ConnectionError) as exc:  # transient network layer
            last_exc = exc
            wait = backoffs[attempts]
            logging.getLogger("academics").warning(
                "list_colleges transient error attempt %s/%s: %s (backing off %.2fs)",
                attempts + 1,
                len(backoffs),
                exc,
                wait,
            )
            time.sleep(wait)
            attempts += 1
            continue
        except Exception as exc:  # non-transient
            logging.getLogger("academics").exception("list_colleges failed unrecoverably")
            raise HTTPException(status_code=500, detail=f"Failed to list colleges: {exc}")
    # Fallback after retries exhausted
    logging.getLogger("academics").error("list_colleges exhausted retries: %s", last_exc)
    # Graceful empty list so UI can still render (client can retry separately)
    return []

@academics_router.get(
    "/api/colleges/{college_id}/degrees",
    response_model=List[DegreeOut],
    summary="List degrees for a college (with departments & batches)",
)
def list_degrees_for_college(college_id: uuid.UUID):
    """Return the degrees for a college.

    Reuses the existing get_college_full aggregation logic so each DegreeOut
    includes its departments (with batches) consistent with other responses.
    This complements the existing POST /api/colleges/{college_id}/degrees which creates a degree.
    """
    data = get_college_full(college_id)
    degrees: List[DegreeOut] = data["degrees"]
    return degrees


@academics_router.post(
    "/api/colleges/{college_id}/degrees",
    response_model=DegreeOut,
    summary="Create a degree for a college",
)
def create_degree_simple(college_id: uuid.UUID, payload: DegreeSimpleCreateIn):
    supabase = get_service_client()

    existing = (
        supabase.table("degrees")
        .select("id,name,level,duration_years")
        .eq("college_id", str(college_id))
        .eq("name", payload.name)
        .limit(1)
        .execute()
    )
    if getattr(existing, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (find degree): {existing.error}")

    if existing.data:
        degree_row = existing.data[0]
    else:
        insert_payload: Dict[str, Any] = {
            "college_id": str(college_id),
            "name": payload.name,
        }
        if payload.level is not None:
            insert_payload["level"] = payload.level
        if payload.duration_years is not None:
            insert_payload["duration_years"] = payload.duration_years

        ins = supabase.table("degrees").insert(insert_payload).execute()
        if getattr(ins, "error", None):
            raise HTTPException(status_code=500, detail=f"Supabase error (insert degree): {ins.error}")
        if ins.data:
            degree_row = ins.data[0]
        else:
            refetch = (
                supabase.table("degrees")
                .select("id,name,level,duration_years")
                .eq("college_id", str(college_id))
                .eq("name", payload.name)
                .limit(1)
                .execute()
            )
            if getattr(refetch, "error", None) or not refetch.data:
                raise HTTPException(status_code=500, detail="Failed to retrieve created degree.")
            degree_row = refetch.data[0]

    college_snapshot = get_college_full(college_id)
    degree_id = uuid.UUID(degree_row["id"])
    for item in college_snapshot["degrees"]:
        if item.id == degree_id:
            return item

    raise HTTPException(status_code=404, detail="Created degree not found in college snapshot.")


@academics_router.put(
    "/api/degrees/{degree_id}",
    response_model=DegreeOut,
    summary="Update degree metadata",
)
def update_degree(degree_id: uuid.UUID, payload: DegreeSimpleCreateIn):
    supabase = get_service_client()

    existing = (
        supabase.table("degrees")
        .select("id,college_id")
        .eq("id", str(degree_id))
        .limit(1)
        .execute()
    )
    if getattr(existing, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (find degree): {existing.error}")
    if not existing.data:
        raise HTTPException(status_code=404, detail="Degree not found")

    degree_row = existing.data[0]
    college_id_str = degree_row.get("college_id")
    if not college_id_str:
        raise HTTPException(status_code=400, detail="Degree missing college reference")

    updates: Dict[str, Any] = {
        "name": payload.name,
        "level": payload.level,
        "duration_years": payload.duration_years,
    }

    upd = (
        supabase.table("degrees")
        .update(updates)
        .eq("id", str(degree_id))
        .execute()
    )
    if getattr(upd, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (update degree): {upd.error}")

    college_snapshot = get_college_full(uuid.UUID(college_id_str))
    for item in college_snapshot["degrees"]:
        if item.id == degree_id:
            return item

    raise HTTPException(status_code=404, detail="Updated degree not found in college snapshot.")


@academics_router.post(
    "/api/degrees/{degree_id}/departments",
    response_model=DepartmentWithBatchesOut,
    summary="Create a department for a degree",
)
def create_department_simple(degree_id: uuid.UUID, payload: DepartmentSimpleCreateIn):
    supabase = get_service_client()

    degree_res = (
        supabase.table("degrees")
        .select("id,college_id")
        .eq("id", str(degree_id))
        .limit(1)
        .execute()
    )
    if getattr(degree_res, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (find degree): {degree_res.error}")
    if not degree_res.data:
        raise HTTPException(status_code=404, detail="Degree not found")

    degree_row = degree_res.data[0]
    college_id_str = degree_row.get("college_id")
    if not college_id_str:
        raise HTTPException(status_code=400, detail="Degree missing college reference")
    college_id = uuid.UUID(college_id_str)

    department_id: Optional[uuid.UUID] = None
    existing = (
        supabase.table("departments")
        .select("id")
        .eq("degree_id", str(degree_id))
        .eq("name", payload.name)
        .limit(1)
        .execute()
    )
    if getattr(existing, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (find department): {existing.error}")

    if existing.data:
        department_id = uuid.UUID(existing.data[0]["id"])
    else:
        insert_payload: Dict[str, Any] = {
            "college_id": str(college_id),
            "degree_id": str(degree_id),
            "name": payload.name,
        }
        ins = supabase.table("departments").insert(insert_payload).execute()
        if getattr(ins, "error", None):
            error_text = str(ins.error)
            if "duplicate key value" in error_text:
                raise HTTPException(
                    status_code=409,
                    detail="A department with this name already exists for this degree.",
                )
            raise HTTPException(status_code=500, detail=f"Supabase error (insert department): {ins.error}")
        if ins.data:
            department_id = uuid.UUID(ins.data[0]["id"])
        else:
            refetch = (
                supabase.table("departments")
                .select("id")
                .eq("degree_id", str(degree_id))
                .eq("name", payload.name)
                .limit(1)
                .execute()
            )
            if getattr(refetch, "error", None) or not refetch.data:
                raise HTTPException(status_code=500, detail="Failed to retrieve created department.")
            department_id = uuid.UUID(refetch.data[0]["id"])

    if department_id is None:
        raise HTTPException(status_code=500, detail="Unable to determine department identifier after upsert.")

    _ensure_department_batches(college_id, department_id, payload.batches)

    college_snapshot = get_college_full(college_id)
    return _locate_department_from_snapshot(college_snapshot, degree_id, department_id)


@academics_router.put(
    "/api/departments/{department_id}",
    response_model=DepartmentWithBatchesOut,
    summary="Update department metadata",
)
def update_department_simple(department_id: uuid.UUID, payload: DepartmentSimpleUpdateIn):
    supabase = get_service_client()

    dept_res = (
        supabase.table("departments")
        .select("id,degree_id,college_id")
        .eq("id", str(department_id))
        .limit(1)
        .execute()
    )
    if getattr(dept_res, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (find department): {dept_res.error}")
    if not dept_res.data:
        raise HTTPException(status_code=404, detail="Department not found")

    dept_row = dept_res.data[0]
    college_id_str = dept_row.get("college_id")
    degree_id_str = dept_row.get("degree_id")
    if not college_id_str or not degree_id_str:
        raise HTTPException(status_code=400, detail="Department missing degree or college reference")

    dup_res = (
        supabase.table("departments")
        .select("id")
        .eq("degree_id", degree_id_str)
        .eq("name", payload.name)
        .neq("id", str(department_id))
        .limit(1)
        .execute()
    )
    if getattr(dup_res, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (check duplicate department): {dup_res.error}")
    if dup_res.data:
        raise HTTPException(status_code=409, detail="Another department with this name already exists for the degree.")

    upd = (
        supabase.table("departments")
        .update({"name": payload.name})
        .eq("id", str(department_id))
        .execute()
    )
    if getattr(upd, "error", None):
        error_text = str(upd.error)
        if "duplicate key value" in error_text:
            raise HTTPException(
                status_code=409,
                detail="A department with this name already exists for the college. Please choose a different name.",
            )
        raise HTTPException(status_code=500, detail=f"Supabase error (update department): {upd.error}")

    college_id = uuid.UUID(college_id_str)
    degree_uuid = uuid.UUID(degree_id_str)
    _ensure_department_batches(college_id, department_id, payload.batches)

    college_snapshot = get_college_full(college_id)
    return _locate_department_from_snapshot(college_snapshot, degree_uuid, department_id)


@academics_router.put(
    "/api/colleges/{college_id}",
    response_model=College,
    summary="Rename a college",
)
def rename_college(college_id: uuid.UUID, payload: CollegeNameOnlyIn):
    supabase = get_service_client()
    upd = (
        supabase.table("colleges")
        .update({"name": payload.name})
        .eq("id", str(college_id))
        .execute()
    )
    if getattr(upd, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (rename college): {upd.error}")

    ref = (
        supabase.table("colleges")
        .select("id,name")
        .eq("id", str(college_id))
        .limit(1)
        .execute()
    )
    if getattr(ref, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (fetch college): {ref.error}")
    if not ref.data:
        raise HTTPException(status_code=404, detail="College not found")
    row = ref.data[0]
    return College(id=uuid.UUID(row["id"]), name=row["name"])


@academics_router.get("/api/colleges/{college_id}", response_model=CollegeFullOut, summary="Get a college with departments & batches")
def get_college(college_id: uuid.UUID):
    data = get_college_full(college_id)
    return CollegeFullOut(**data)


@academics_router.get("/api/colleges/{college_id}/departments", response_model=List[str], summary="List departments for a college")
def list_departments_for_college(college_id: uuid.UUID):
    supabase = get_service_client()
    res = (
        supabase.table("departments").select("name").eq("college_id", str(college_id)).order("name").execute()
    )
    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (list departments): {res.error}")
    return [row["name"] for row in (res.data or [])]


@academics_router.get(
    "/api/colleges/{college_id}/departments/full",
    response_model=List[DepartmentOut],
    summary="List departments (id & name) for a college",
)
def list_departments_full(college_id: uuid.UUID):
    supabase = get_service_client()
    res = (
        supabase.table("departments").select("id,name").eq("college_id", str(college_id)).order("name").execute()
    )
    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (list departments full): {res.error}")
    return [{"id": row["id"], "name": row["name"]} for row in (res.data or [])]


@academics_router.get(
    "/api/colleges/{college_id}/departments/{dept_name}/batches",
    response_model=List[BatchIn],
    summary="List batches for a department within a college",
)
def list_batches_for_department(college_id: uuid.UUID, dept_name: str):
    supabase = get_service_client()
    dept_q = (
        supabase.table("departments")
        .select("id")
        .eq("college_id", str(college_id))
        .eq("name", dept_name.upper())
        .limit(1)
        .execute()
    )
    if getattr(dept_q, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (find department): {dept_q.error}")
    if not dept_q.data:
        raise HTTPException(status_code=404, detail="Department not found for college")
    dept_id = dept_q.data[0]["id"]

    b = (
        supabase.table("batches")
        .select("from_year,to_year")
        .eq("college_id", str(college_id))
        .eq("department_id", dept_id)
        .order("from_year")
        .execute()
    )
    if getattr(b, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (get dept batches): {b.error}")
    return [BatchIn(**{"from": row["from_year"], "to": row["to_year"]}) for row in (b.data or [])]


@academics_router.get(
    "/api/colleges/{college_id}/departments/{dept_name}/batches/full",
    response_model=List[BatchWithIdOut],
    summary="List batches (with id) for a department within a college",
)
def list_batches_for_department_with_ids(college_id: uuid.UUID, dept_name: str):
    supabase = get_service_client()
    dept_q = (
        supabase.table("departments")
        .select("id")
        .eq("college_id", str(college_id))
        .eq("name", dept_name.upper())
        .limit(1)
        .execute()
    )
    if getattr(dept_q, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (find department): {dept_q.error}")
    if not dept_q.data:
        raise HTTPException(status_code=404, detail="Department not found for college")
    dept_id = dept_q.data[0]["id"]

    b = (
        supabase.table("batches")
        .select("id,from_year,to_year")
        .eq("college_id", str(college_id))
        .eq("department_id", dept_id)
        .order("from_year")
        .execute()
    )
    if getattr(b, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (get dept batches full): {b.error}")
    return [
        {"id": row["id"], "from_year": row["from_year"], "to_year": row["to_year"]}
        for row in (b.data or [])
    ]


@academics_router.post(
    "/api/departments/{department_id}/batches",
    response_model=BatchWithIdOut,
    summary="Create a batch for a department",
)
def create_batch_for_department(department_id: uuid.UUID, payload: BatchIn):
    supabase = get_service_client()

    dept_res = (
        supabase.table("departments")
        .select("id,college_id")
        .eq("id", str(department_id))
        .limit(1)
        .execute()
    )
    if getattr(dept_res, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (find department): {dept_res.error}")
    if not dept_res.data:
        raise HTTPException(status_code=404, detail="Department not found")

    dept_row = dept_res.data[0]
    college_id_str = dept_row.get("college_id")
    if not college_id_str:
        raise HTTPException(status_code=400, detail="Department missing college reference")

    dup_res = (
        supabase.table("batches")
        .select("id")
        .eq("department_id", str(department_id))
        .eq("from_year", payload.from_year)
        .eq("to_year", payload.to_year)
        .limit(1)
        .execute()
    )
    if getattr(dup_res, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (check duplicate batch): {dup_res.error}")
    if dup_res.data:
        raise HTTPException(status_code=409, detail="This batch already exists for the department.")

    insert_payload = {
        "college_id": college_id_str,
        "department_id": str(department_id),
        "from_year": payload.from_year,
        "to_year": payload.to_year,
    }
    ins = supabase.table("batches").insert(insert_payload).execute()
    if getattr(ins, "error", None):
        error_text = str(ins.error)
        if "duplicate key value" in error_text:
            raise HTTPException(status_code=409, detail="This batch already exists for the department.")
        raise HTTPException(status_code=500, detail=f"Supabase error (insert batch): {ins.error}")

    if not ins.data:
        refetch = (
            supabase.table("batches")
            .select("id,from_year,to_year")
            .eq("department_id", str(department_id))
            .eq("from_year", payload.from_year)
            .eq("to_year", payload.to_year)
            .limit(1)
            .execute()
        )
        if getattr(refetch, "error", None) or not refetch.data:
            raise HTTPException(status_code=500, detail="Failed to retrieve created batch.")
        batch_row = refetch.data[0]
    else:
        batch_row = ins.data[0]

    return BatchWithIdOut(
        id=uuid.UUID(batch_row["id"]),
        from_year=int(batch_row.get("from_year", payload.from_year)),
        to_year=int(batch_row.get("to_year", payload.to_year)),
    )


@academics_router.put(
    "/api/batches/{batch_id}",
    response_model=BatchWithIdOut,
    summary="Update batch years",
)
def update_batch(batch_id: uuid.UUID, payload: BatchIn):
    supabase = get_service_client()

    batch_res = (
        supabase.table("batches")
        .select("id,college_id,department_id")
        .eq("id", str(batch_id))
        .limit(1)
        .execute()
    )
    if getattr(batch_res, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (find batch): {batch_res.error}")
    if not batch_res.data:
        raise HTTPException(status_code=404, detail="Batch not found")

    batch_row = batch_res.data[0]
    department_id_str = batch_row.get("department_id")
    if not department_id_str:
        raise HTTPException(status_code=400, detail="Batch missing department reference")

    dup_res = (
        supabase.table("batches")
        .select("id")
        .eq("department_id", department_id_str)
        .eq("from_year", payload.from_year)
        .eq("to_year", payload.to_year)
        .neq("id", str(batch_id))
        .limit(1)
        .execute()
    )
    if getattr(dup_res, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (check duplicate batch): {dup_res.error}")
    if dup_res.data:
        raise HTTPException(status_code=409, detail="Another batch with this year range already exists for the department.")

    upd = (
        supabase.table("batches")
        .update({"from_year": payload.from_year, "to_year": payload.to_year})
        .eq("id", str(batch_id))
        .execute()
    )
    if getattr(upd, "error", None):
        error_text = str(upd.error)
        if "duplicate key value" in error_text:
            raise HTTPException(status_code=409, detail="Another batch with this year range already exists for the department.")
        raise HTTPException(status_code=500, detail=f"Supabase error (update batch): {upd.error}")

    return BatchWithIdOut(id=batch_id, from_year=payload.from_year, to_year=payload.to_year)


@academics_router.post(
    "/api/batches/{batch_id}/courses",
    response_model=SyllabusCourseSummaryOut,
    summary="Create a subject for a batch",
)
def create_course_for_batch(batch_id: uuid.UUID, payload: SyllabusCourseSimpleCreateIn):
    supabase = get_service_client()

    batch_res = (
        supabase.table("batches")
        .select("id")
        .eq("id", str(batch_id))
        .limit(1)
        .execute()
    )
    if getattr(batch_res, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (find batch): {batch_res.error}")
    if not batch_res.data:
        raise HTTPException(status_code=404, detail="Batch not found")

    dup_res = (
        supabase.table("syllabus_courses")
        .select("id")
        .eq("batch_id", str(batch_id))
        .eq("semester", payload.semester)
        .eq("course_code", payload.course_code)
        .limit(1)
        .execute()
    )
    if getattr(dup_res, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (check duplicate course): {dup_res.error}")
    if dup_res.data:
        raise HTTPException(
            status_code=409,
            detail="A subject with this course code already exists for the semester in this batch.",
        )

    insert_payload = {
        "batch_id": str(batch_id),
        "semester": payload.semester,
        "course_code": payload.course_code,
        "title": payload.title,
    }
    ins = supabase.table("syllabus_courses").insert(insert_payload).execute()
    if getattr(ins, "error", None):
        error_text = str(ins.error)
        if "duplicate key value" in error_text:
            raise HTTPException(
                status_code=409,
                detail="A subject with this course code already exists for the semester in this batch.",
            )
        raise HTTPException(status_code=500, detail=f"Supabase error (insert course): {ins.error}")

    if ins.data:
        row = ins.data[0]
    else:
        refetch = (
            supabase.table("syllabus_courses")
            .select("id,semester,course_code,title")
            .eq("batch_id", str(batch_id))
            .eq("semester", payload.semester)
            .eq("course_code", payload.course_code)
            .limit(1)
            .execute()
        )
        if getattr(refetch, "error", None) or not refetch.data:
            raise HTTPException(status_code=500, detail="Failed to retrieve created subject.")
        row = refetch.data[0]

    return SyllabusCourseSummaryOut(
        id=uuid.UUID(row["id"]),
        batch_id=batch_id,
        semester=int(row.get("semester", payload.semester)),
        course_code=row.get("course_code", payload.course_code),
        title=row.get("title", payload.title),
    )


@academics_router.post("/api/batches/resolve", response_model=BatchWithIdOut, summary="Resolve or create a batch id for a college + dept + year range")
def resolve_or_create_batch(payload: BatchResolveIn):
    return resolve_or_create_batch(payload.college_id, payload.dept_name, payload.from_year, payload.to_year)


@academics_router.post("/signup")
def signup(user: UserAuth):
    return signup_user(user)


@academics_router.post("/login")
def login(user: UserAuth):
    return login_user(user)


@academics_router.get("/api/public/supabase", summary="Public Supabase client config")
def public_supabase_config():
    base_url = os.getenv("SUPABASE_URL", "").rstrip("/")
    anon = os.getenv("SUPABASE_ANON_KEY", "")
    if not base_url or not anon:
        raise HTTPException(status_code=500, detail="Missing SUPABASE_URL or SUPABASE_ANON_KEY")
    return {"url": base_url, "anonKey": anon}


@academics_router.get("/api/public/academic-meta", summary="Public academic hierarchy for signup")
def public_academic_meta():
    """Return colleges, degrees, departments (minimal fields) without requiring auth.

    Used by teacher signup (pre-auth). Batches omitted for brevity.
    """
    supabase = get_service_client()
    colleges = supabase.table("colleges").select("id,name").order("name").execute()
    if getattr(colleges, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (colleges): {colleges.error}")
    degrees = supabase.table("degrees").select("id,name,college_id").execute()
    departments = supabase.table("departments").select("id,name,college_id,degree_id").execute()
    return {
        "colleges": getattr(colleges, "data", []) or [],
        "degrees": getattr(degrees, "data", []) or [],
        "departments": getattr(departments, "data", []) or [],
    }


@academics_router.post("/api/signup/full")
def signup_full(payload: SignupFullIn):
    return signup_full_user(payload)


def _parse_bearer_token(authorization: Optional[str]) -> Optional[str]:
    if not authorization:
        return None
    parts = authorization.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1]
    return None


@academics_router.get("/api/me")
def get_me(authorization: Optional[str] = Header(default=None)):
    token = _parse_bearer_token(authorization)
    return get_current_user_profile(token)


@academics_router.post("/api/syllabus/courses", response_model=SyllabusCourseOut, summary="Upsert syllabus course with units & topics")
def api_upsert_syllabus_course(payload: SyllabusCourseIn):
    return upsert_syllabus_course(payload)


@academics_router.put(
    "/api/syllabus/courses/{course_id}",
    response_model=SyllabusCourseSummaryOut,
    summary="Update subject metadata",
)
def update_course_metadata(course_id: uuid.UUID, payload: SyllabusCourseSimpleUpdateIn):
    supabase = get_service_client()

    existing = (
        supabase.table("syllabus_courses")
        .select("id,batch_id")
        .eq("id", str(course_id))
        .limit(1)
        .execute()
    )
    if getattr(existing, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (find course): {existing.error}")
    if not existing.data:
        raise HTTPException(status_code=404, detail="Subject not found")

    row = existing.data[0]
    batch_id_str = row.get("batch_id")
    if not batch_id_str:
        raise HTTPException(status_code=400, detail="Subject missing batch reference")

    dup_res = (
        supabase.table("syllabus_courses")
        .select("id")
        .eq("batch_id", batch_id_str)
        .eq("semester", payload.semester)
        .eq("course_code", payload.course_code)
        .neq("id", str(course_id))
        .limit(1)
        .execute()
    )
    if getattr(dup_res, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (check duplicate course): {dup_res.error}")
    if dup_res.data:
        raise HTTPException(
            status_code=409,
            detail="Another subject with this course code already exists for the semester in this batch.",
        )

    updates = {
        "semester": payload.semester,
        "course_code": payload.course_code,
        "title": payload.title,
    }
    upd = (
        supabase.table("syllabus_courses")
        .update(updates)
        .eq("id", str(course_id))
        .execute()
    )
    if getattr(upd, "error", None):
        error_text = str(upd.error)
        if "duplicate key value" in error_text:
            raise HTTPException(
                status_code=409,
                detail="Another subject with this course code already exists for the semester in this batch.",
            )
        raise HTTPException(status_code=500, detail=f"Supabase error (update course): {upd.error}")

    return SyllabusCourseSummaryOut(
        id=course_id,
        batch_id=uuid.UUID(batch_id_str),
        semester=payload.semester,
        course_code=payload.course_code,
        title=payload.title,
    )


@academics_router.get(
    "/api/batches/{batch_id}/courses",
    response_model=List[SyllabusCourseSummaryOut],
    summary="List syllabus courses (subjects) for a batch",
)
def api_list_courses_for_batch(
    batch_id: uuid.UUID,
    semester: Optional[int] = Query(default=None, ge=1, le=12),
):
    supabase = get_service_client()
    query = (
        supabase.table("syllabus_courses")
        .select("id,batch_id,semester,course_code,title")
        .eq("batch_id", str(batch_id))
    )
    if semester is not None:
        query = query.eq("semester", semester)
    res = query.order("course_code").execute()
    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (list courses): {res.error}")
    return [
        SyllabusCourseSummaryOut(
            id=uuid.UUID(row["id"]),
            batch_id=uuid.UUID(row["batch_id"]),
            semester=int(row["semester"]),
            course_code=row.get("course_code"),
            title=row.get("title"),
        )
        for row in (res.data or [])
    ]


@academics_router.get(
    "/api/syllabus/courses/{course_id}",
    response_model=SyllabusCourseOut,
    summary="Get syllabus course with units & topics",
)
def api_get_syllabus_course(course_id: uuid.UUID):
    return load_course_with_units(course_id)


@academics_router.post(
    "/api/syllabus/courses/{course_id}/units",
    response_model=UnitOut,
    summary="Create a unit (with topics) for a syllabus course",
)
def create_unit_for_course(course_id: uuid.UUID, payload: UnitTopicsIn):
    supabase = get_service_client()

    course_res = (
        supabase.table("syllabus_courses")
        .select("id")
        .eq("id", str(course_id))
        .limit(1)
        .execute()
    )
    if getattr(course_res, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (find course): {course_res.error}")
    if not course_res.data:
        raise HTTPException(status_code=404, detail="Course not found")

    dup_res = (
        supabase.table("syllabus_units")
        .select("id")
        .eq("course_id", str(course_id))
        .eq("unit_title", payload.unit_title)
        .limit(1)
        .execute()
    )
    if getattr(dup_res, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (check duplicate unit): {dup_res.error}")
    if dup_res.data:
        raise HTTPException(status_code=409, detail="A unit with this title already exists for this course.")

    units_res = (
        supabase.table("syllabus_units")
        .select("id")
        .eq("course_id", str(course_id))
        .execute()
    )
    if getattr(units_res, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (list units): {units_res.error}")
    next_order = len(units_res.data or [])

    ins = (
        supabase.table("syllabus_units")
        .insert(
            {
                "course_id": str(course_id),
                "unit_title": payload.unit_title,
                "order_in_course": next_order,
            }
        )
        .execute()
    )
    if getattr(ins, "error", None):
        error_text = str(ins.error)
        if "duplicate key value" in error_text:
            raise HTTPException(status_code=409, detail="A unit with this title already exists for this course.")
        raise HTTPException(status_code=500, detail=f"Supabase error (insert unit): {ins.error}")

    if ins.data:
        unit_id_str = ins.data[0].get("id")
    else:
        refetch = (
            supabase.table("syllabus_units")
            .select("id")
            .eq("course_id", str(course_id))
            .eq("unit_title", payload.unit_title)
            .limit(1)
            .execute()
        )
        if getattr(refetch, "error", None) or not refetch.data:
            raise HTTPException(status_code=500, detail="Failed to retrieve created unit.")
        unit_id_str = refetch.data[0].get("id")

    if not unit_id_str:
        raise HTTPException(status_code=500, detail="Unit identifier missing after creation.")
    unit_id = uuid.UUID(unit_id_str)

    topic_rows = [
        {
            "unit_id": str(unit_id),
            "topic": topic.topic,
            "order_in_unit": index,
        }
        for index, topic in enumerate(payload.topics or [])
    ]
    if topic_rows:
        tins = supabase.table("syllabus_topics").insert(topic_rows).execute()
        if getattr(tins, "error", None):
            raise HTTPException(status_code=500, detail=f"Supabase error (insert topics): {tins.error}")

    return load_unit_with_topics(unit_id)


@academics_router.put(
    "/api/syllabus/units/{unit_id}",
    response_model=UnitOut,
    summary="Update a syllabus unit title and topics",
)
def update_unit_topics(unit_id: uuid.UUID, payload: UnitTopicsIn):
    supabase = get_service_client()

    unit_res = (
        supabase.table("syllabus_units")
        .select("id,course_id")
        .eq("id", str(unit_id))
        .limit(1)
        .execute()
    )
    if getattr(unit_res, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (find unit): {unit_res.error}")
    if not unit_res.data:
        raise HTTPException(status_code=404, detail="Unit not found")

    course_id_str = unit_res.data[0].get("course_id")
    if not course_id_str:
        raise HTTPException(status_code=400, detail="Unit missing course reference")

    dup_res = (
        supabase.table("syllabus_units")
        .select("id")
        .eq("course_id", course_id_str)
        .eq("unit_title", payload.unit_title)
        .neq("id", str(unit_id))
        .limit(1)
        .execute()
    )
    if getattr(dup_res, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (check duplicate unit): {dup_res.error}")
    if dup_res.data:
        raise HTTPException(status_code=409, detail="Another unit with this title already exists for this course.")

    upd = (
        supabase.table("syllabus_units")
        .update({"unit_title": payload.unit_title})
        .eq("id", str(unit_id))
        .execute()
    )
    if getattr(upd, "error", None):
        error_text = str(upd.error)
        if "duplicate key value" in error_text:
            raise HTTPException(status_code=409, detail="Another unit with this title already exists for this course.")
        raise HTTPException(status_code=500, detail=f"Supabase error (update unit): {upd.error}")

    del_res = supabase.table("syllabus_topics").delete().eq("unit_id", str(unit_id)).execute()
    if getattr(del_res, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (delete topics): {del_res.error}")

    topic_rows = [
        {
            "unit_id": str(unit_id),
            "topic": topic.topic,
            "order_in_unit": index,
        }
        for index, topic in enumerate(payload.topics or [])
    ]
    if topic_rows:
        tins = supabase.table("syllabus_topics").insert(topic_rows).execute()
        if getattr(tins, "error", None):
            raise HTTPException(status_code=500, detail=f"Supabase error (insert topics): {tins.error}")

    return load_unit_with_topics(unit_id)


# ---------- Progress tracking ----------

class TopicToggleIn(BaseModel):
    topic_id: uuid.UUID
    completed: bool


@academics_router.get("/api/progress/topics", summary="Get completed topic ids for current user")
def get_completed_topics(authorization: Optional[str] = Header(default=None)):
    token = _parse_bearer_token(authorization)
    return get_completed_topic_ids(token)


@academics_router.post("/api/progress/toggle", summary="Mark/unmark a topic as completed for current user")
def toggle_topic(payload: TopicToggleIn, authorization: Optional[str] = Header(default=None)):
    token = _parse_bearer_token(authorization)
    return toggle_topic_completion(token, payload.topic_id, payload.completed)


@academics_router.get("/api/progress/summary", summary="Progress summary per course and unit for current user")
def progress_summary(authorization: Optional[str] = Header(default=None)):
    token = _parse_bearer_token(authorization)
    return get_progress_summary(token)


# ---------- Profile update & uploads ----------


def _strip_or_none(value: Any) -> Optional[str]:
    if value is None:
        return None
    if isinstance(value, str):
        trimmed = value.strip()
        return trimmed or None
    return str(value)


def _date_or_none(value: Any) -> Optional[str]:
    if value is None or value == "":
        return None
    if isinstance(value, datetime):
        return value.date().isoformat()
    if isinstance(value, date):
        return value.isoformat()
    if isinstance(value, str):
        try:
            return date.fromisoformat(value.strip()).isoformat()
        except ValueError:
            return None
    return None


class ProfileMediaItemIn(BaseModel):
    kind: Optional[str] = None
    url: Optional[str] = None
    title: Optional[str] = None

    @validator("kind", "url", "title", pre=True)
    def _normalize(cls, v: Any):  # noqa: N805
        return _strip_or_none(v)


class ExperienceIn(BaseModel):
    id: Optional[str] = None
    title: str
    employment_type: Optional[str] = None
    company: Optional[str] = None
    company_logo_url: Optional[str] = None
    location: Optional[str] = None
    location_type: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None
    is_current: Optional[bool] = False
    description: Optional[str] = None
    media: Optional[List[ProfileMediaItemIn]] = None

    @validator("title", "employment_type", "company", "company_logo_url", "location", "location_type", "description", pre=True)
    def _trim_str(cls, v: Any):  # noqa: N805
        return _strip_or_none(v)


class EducationIn(BaseModel):
    """Revised education model: replaces field_of_study + start/end dates with department, batch_range, regno, current_semester."""

    id: Optional[str] = None
    school: str
    degree: Optional[str] = None
    department: Optional[str] = None
    batch_range: Optional[str] = None  # e.g. "2022-2026"
    regno: Optional[str] = None
    current_semester: Optional[int] = None
    grade: Optional[str] = None
    activities: Optional[str] = None
    description: Optional[str] = None

    @validator(
        "school",
        "degree",
        "department",
        "batch_range",
        "regno",
        "grade",
        "activities",
        "description",
        pre=True,
    )
    def _trim(cls, v: Any):  # noqa: N805
        return _strip_or_none(v)


class CertificationIn(BaseModel):
    id: Optional[str] = None
    name: str
    issuing_org: Optional[str] = None
    issue_date: Optional[date] = None
    expiration_date: Optional[date] = None
    does_not_expire: Optional[bool] = False
    credential_id: Optional[str] = None
    credential_url: Optional[str] = None
    description: Optional[str] = None

    @validator("name", "issuing_org", "credential_id", "credential_url", "description", pre=True)
    def _trim(cls, v: Any):  # noqa: N805
        return _strip_or_none(v)


class PortfolioProjectIn(BaseModel):
    id: Optional[str] = None
    name: str
    associated_experience_id: Optional[str] = None
    associated_education_id: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    url: Optional[str] = None
    description: Optional[str] = None
    tech_stack: Optional[List[str]] = None
    team: Optional[List[Dict[str, Any]]] = None

    @validator("name", "associated_experience_id", "associated_education_id", "url", "description", pre=True)
    def _trim(cls, v: Any):  # noqa: N805
        return _strip_or_none(v)


class PublicationIn(BaseModel):
    id: Optional[str] = None
    title: str
    publisher: Optional[str] = None
    publication_date: Optional[date] = None
    authors: Optional[List[str]] = None
    url: Optional[str] = None
    abstract: Optional[str] = None

    @validator("title", "publisher", "url", "abstract", pre=True)
    def _trim(cls, v: Any):  # noqa: N805
        return _strip_or_none(v)

    @validator("authors", pre=True)
    def _normalize_authors(cls, v: Any):  # noqa: N805
        if v is None:
            return None
        if isinstance(v, str):
            return [part.strip() for part in v.split(",") if part.strip()]
        if isinstance(v, list):
            cleaned = []
            for item in v:
                cleaned_item = _strip_or_none(item)
                if cleaned_item:
                    cleaned.append(cleaned_item)
            return cleaned
        return None


class ProfileUpdateIn(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    leetcode: Optional[str] = None
    specializations: Optional[list[str]] = None
    projects: Optional[list[dict]] = None
    experiences: Optional[List[ExperienceIn]] = None
    education_entries: Optional[List[EducationIn]] = None
    certification_entries: Optional[List[CertificationIn]] = None
    portfolio_projects: Optional[List[PortfolioProjectIn]] = None
    publication_entries: Optional[List[PublicationIn]] = None
    # Extended profile fields (UI sends these too)
    headline: Optional[str] = None
    location: Optional[str] = None
    dob: Optional[str] = None  # YYYY-MM-DD
    portfolio_url: Optional[str] = None
    website: Optional[str] = None
    twitter: Optional[str] = None
    instagram: Optional[str] = None
    medium: Optional[str] = None
    technologies: Optional[str] = None
    skills: Optional[str] = None
    certifications: Optional[str] = None
    languages: Optional[str] = None
    interests: Optional[str] = None
    achievements: Optional[str] = None
    experience: Optional[str] = None
    publications: Optional[str] = None
    project_info: Optional[str] = None
    # Academic/identity fields
    semester: Optional[int] = None
    regno: Optional[str] = None
    college_name: Optional[str] = None
    department_name: Optional[str] = None
    batch_from: Optional[int] = None
    batch_to: Optional[int] = None


@academics_router.get("/api/profile/me", summary="Get current user's extended profile")
def get_profile_me(authorization: Optional[str] = Header(default=None)):
    token = _parse_bearer_token(authorization)
    return _get_profile_me(token)


@academics_router.put("/api/profile/me", summary="Update current user's profile fields")
def update_profile_me(payload: ProfileUpdateIn, authorization: Optional[str] = Header(default=None)):
    token = _parse_bearer_token(authorization)
    return _update_profile_me(token, payload.dict(exclude_unset=True))


@academics_router.post("/api/profile/upload", summary="Upload profile image or resume and save URL")
def upload_profile_asset(
    kind: str = Form(..., pattern=r"^(image|resume)$"),  # use pattern instead of regex
    file: UploadFile = File(...),
    authorization: Optional[str] = Header(default=None),
):
    token = _parse_bearer_token(authorization)
    return _upload_profile_asset(token, kind, file)

# --- Notes API ---




notes_router = APIRouter()

# --- Print API ---
print_router = APIRouter()

# --------- Print/Orders domain models ---------

class ShopCapabilities(BaseModel):
    color: bool = True
    duplex: bool = True
    sizes: List[str] = Field(default_factory=lambda: ["A4"])  # e.g., ["A4","A3","Letter"]
    bindings: List[str] = Field(default_factory=lambda: ["none", "staple", "spiral"])
    gsm: List[int] = Field(default_factory=lambda: [70, 80, 100])


class PrintShopIn(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    hours: Optional[dict] = None
    capabilities: Optional[ShopCapabilities] = None


class PriceTier(BaseModel):
    min: Optional[int] = Field(default=None, ge=0)
    upto: Optional[int] = Field(default=None, ge=1)
    per_page: float = Field(description="Price per page for this tier")


class ShopPricing(BaseModel):
    bw_single: List[PriceTier] = Field(default_factory=list)
    bw_duplex: List[PriceTier] = Field(default_factory=list)
    color_single: List[PriceTier] = Field(default_factory=list)
    color_duplex: List[PriceTier] = Field(default_factory=list)


class UpdateShopIn(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    hours: Optional[dict] = None
    capabilities: Optional[ShopCapabilities] = None
    is_open: Optional[bool] = None
    paused: Optional[bool] = None
    price_hint: Optional[str] = None
    pricing: Optional[ShopPricing] = None


@print_router.post("/api/shop/logo", summary="Upload or replace shop logo (public URL stored in print_shops.logo_url)")
async def upload_shop_logo(file: UploadFile = File(...), authorization: Optional[str] = Header(default=None)):
    uid, _ = _get_auth_user(authorization)
    supabase = get_service_client()
    # Resolve shop owned by user
    shop_q = supabase.table(PRINT_SHOPS_TABLE).select("id").eq("owner_user_id", uid).limit(1).execute()
    shop = (getattr(shop_q, 'data', []) or [{}])[0]
    if not shop:
        raise HTTPException(status_code=404, detail="No shop found for user")
    shop_id = shop.get("id")

    # Validate file
    filename = file.filename or "logo.png"
    ext = (Path(filename).suffix or ".png").lower()
    allowed = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"}
    if ext not in allowed:
        raise HTTPException(status_code=400, detail="Unsupported image type")
    blob = await file.read()
    if len(blob) > 4 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image too large (max 4MB)")
    mime_map = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif", ".svg": "image/svg+xml"}
    content_type = mime_map.get(ext, "application/octet-stream")

    # Resolve bucket
    bucket = (
        os.getenv("SUPABASE_SHOP_ASSETS_BUCKET", "").strip()
        or os.getenv("SUPABASE_ASSETS_BUCKET", "").strip()
        or os.getenv("SUPABASE_BUCKET", "").strip()
        or os.getenv("SUPABASE_PUBLIC_BUCKET", "").strip()
        or "paperx-assets"
    )
    # Key path (use upsert to replace same path for caching simplicity)
    dest = f"shops/{shop_id}/logo{ext}"
    try:
        _storage_upload_bytes(supabase, bucket, dest, blob, content_type)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {e}")
    public_url = _storage_public_url(supabase, bucket, dest)
    if not public_url:
        raise HTTPException(status_code=500, detail="Failed to resolve public URL")
    # Persist to shop row (logo_url text column expected)
    try:
        upd = supabase.table(PRINT_SHOPS_TABLE).update({"logo_url": public_url, "updated_at": _now_iso()}).eq("id", shop_id).execute()
        if getattr(upd, 'error', None):
            # If column missing, expose clear message
            msg = str(upd.error)
            raise HTTPException(status_code=500, detail=f"DB update failed (did you add logo_url column?): {msg}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB update error: {e}")
    return {"ok": True, "url": public_url, "bucket": bucket, "path": dest}


class PrintSettings(BaseModel):
    copies: int = Field(default=1, ge=1, le=50)
    color_mode: str = Field(default="auto", description="auto|bw|color")
    duplex: str = Field(default="off", description="off|long|short")
    n_up: int = Field(default=1, description="1|2|4|6|9")
    paper_size: str = Field(default="A4")
    paper_gsm: Optional[int] = Field(default=None)
    finishing: str = Field(default="none")
    page_range: str = Field(default="all")
    scale: str = Field(default="fit")
    collate: bool = Field(default=True)
    notes_to_shop: Optional[str] = None


class CreateJobIn(BaseModel):
    shop_id: str
    settings: PrintSettings
    marketplace_note_id: Optional[str] = None
    estimated_pages: Optional[int] = None
    file_size: Optional[int] = None
    contact_name: Optional[str] = None
    contact_phone: Optional[str] = None
    pickup_window: Optional[str] = None


def _random_otp() -> str:
    return f"{random.randint(0, 999999):06d}"


def _now_iso() -> str:
    return datetime.utcnow().isoformat()


# --------- Print/Orders endpoints ---------

@print_router.get("/api/print/shops", summary="List print shops with simple filters")
def list_print_shops(
    q: Optional[str] = Query(default=None),
    open_now: Optional[bool] = Query(default=None),
    color: Optional[bool] = Query(default=None),
    size: Optional[str] = Query(default=None, description="A4|A3|Letter"),
    binding: Optional[str] = Query(default=None),
    sort: Optional[str] = Query(default="nearest"),
    limit: int = Query(default=50, ge=1, le=200),
):
    supabase = get_service_client()
    query = supabase.table(PRINT_SHOPS_TABLE).select("*")
    try:
        res = query.execute()
        data = getattr(res, 'data', []) or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch shops: {e}")

    def match_filters(shop: dict) -> bool:
        caps = (shop.get("capabilities") or {})
        if isinstance(caps, str):
            try:
                caps = json.loads(caps)
            except Exception:
                caps = {}
        if q:
            s = (shop.get("name") or '') + ' ' + (shop.get("address") or '')
            if q.lower() not in s.lower():
                return False
        if open_now is True and not shop.get("is_open", False):
            return False
        if color is True and not caps.get("color", False):
            return False
        if size and size not in (caps.get("sizes") or []):
            return False
        if binding and binding not in (caps.get("bindings") or []):
            return False
        return True

    filtered = [s for s in data if match_filters(s)]
    # very rough sort: rating desc for "fastest" else by name
    if sort == "fastest":
        filtered.sort(key=lambda s: (-(s.get("rating") or 0), s.get("name") or ""))
    else:
        filtered.sort(key=lambda s: s.get("name") or "")
    return {"shops": filtered[:limit]}


@print_router.post("/api/print/jobs", summary="Create a print job (no payment)")
def create_print_job(payload: CreateJobIn, authorization: Optional[str] = Header(default=None)):
    try:
        user_id, _ = _get_auth_user(authorization)
    except HTTPException:
        # allow unauth for demo; attribute to null user
        user_id = None
    supabase = get_service_client()
    job_id = str(uuid.uuid4())
    otp = _random_otp()
    now = _now_iso()
    row = {
        "id": job_id,
        "user_id": user_id,
        "shop_id": payload.shop_id,
        "status": "submitted",
        "otp": otp,
        "settings": _supabase_payload(payload.settings.dict()),
        "estimated_pages": payload.estimated_pages,
        "file_size": payload.file_size,
        "marketplace_note_id": payload.marketplace_note_id,
        "pickup_window": payload.pickup_window,
        "contact_name": payload.contact_name,
        "contact_phone": payload.contact_phone,
        "created_at": now,
        "updated_at": now,
    }
    try:
        ins = supabase.table(PRINT_JOBS_TABLE).insert(row).execute()
        if getattr(ins, 'error', None):
            raise Exception(ins.error)
        supabase.table(PRINT_JOB_EVENTS_TABLE).insert({
            "job_id": job_id, "status": "submitted", "note": "Job submitted",
            "created_at": now
        }).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create job: {e}")
    return {"ok": True, "job_id": job_id, "otp": otp}


@print_router.get("/api/orders", summary="List my print jobs")
def list_my_orders(status: Optional[str] = Query(default=None), authorization: Optional[str] = Header(default=None)):
    try:
        user_id, _ = _get_auth_user(authorization)
    except HTTPException:
        user_id = None
    supabase = get_service_client()
    try:
        q = supabase.table(PRINT_JOBS_TABLE).select("*")
        if user_id:
            q = q.eq("user_id", user_id)
        if status:
            q = q.eq("status", status)
        res = q.order("created_at", desc=True).execute()
        data = getattr(res, 'data', []) or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list orders: {e}")
    return {"jobs": data}


@print_router.get("/api/orders/{job_id}", summary="Get job details")
def get_order(job_id: str, authorization: Optional[str] = Header(default=None)):
    supabase = get_service_client()
    try:
        job = supabase.table(PRINT_JOBS_TABLE).select("*").eq("id", job_id).limit(1).execute()
        job_row = (getattr(job, 'data', []) or [{}])[0]
        ev = supabase.table(PRINT_JOB_EVENTS_TABLE).select("*").eq("job_id", job_id).order("created_at").execute()
        events = getattr(ev, 'data', []) or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed: {e}")
    if not job_row:
        raise HTTPException(status_code=404, detail="Not found")
    return {"job": job_row, "events": events}


@print_router.post("/api/orders/{job_id}/cancel", summary="Cancel a job if not accepted")
def cancel_order(job_id: str, authorization: Optional[str] = Header(default=None)):
    user_id, _ = _get_auth_user(authorization)
    supabase = get_service_client()
    try:
        job = supabase.table(PRINT_JOBS_TABLE).select("id,user_id,status").eq("id", job_id).limit(1).execute()
        row = (getattr(job, 'data', []) or [{}])[0]
    except Exception:
        row = {}
    if not row:
        raise HTTPException(status_code=404, detail="Not found")
    if row.get("user_id") and user_id and row.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    if row.get("status") not in {"submitted"}:
        raise HTTPException(status_code=400, detail="Cannot cancel now")
    now = _now_iso()
    supabase.table(PRINT_JOBS_TABLE).update({"status": "cancelled", "updated_at": now}).eq("id", job_id).execute()
    supabase.table(PRINT_JOB_EVENTS_TABLE).insert({"job_id": job_id, "status": "cancelled", "note": "Cancelled by student", "created_at": now}).execute()
    return {"ok": True}


@print_router.post("/api/orders/{job_id}/resend-otp", summary="Regenerate OTP")
def resend_otp(job_id: str, authorization: Optional[str] = Header(default=None)):
    user_id, _ = _get_auth_user(authorization)
    supabase = get_service_client()
    otp = _random_otp()
    now = _now_iso()
    supabase.table(PRINT_JOBS_TABLE).update({"otp": otp, "updated_at": now}).eq("id", job_id).execute()
    supabase.table(PRINT_JOB_EVENTS_TABLE).insert({"job_id": job_id, "status": "otp", "note": "OTP regenerated", "created_at": now}).execute()
    return {"ok": True, "otp": otp}


# ---- Shop owner endpoints (require token matching owner_user_id) ----

def _require_shop_owner(shop_id: str, authorization: Optional[str]) -> str:
    uid, _ = _get_auth_user(authorization)
    supabase = get_service_client()
    res = supabase.table(PRINT_SHOPS_TABLE).select("id,owner_user_id").eq("id", shop_id).limit(1).execute()
    row = (getattr(res, 'data', []) or [{}])[0]
    if not row:
        raise HTTPException(status_code=404, detail="Shop not found")
    if row.get("owner_user_id") != uid:
        raise HTTPException(status_code=403, detail="Not your shop")
    return uid


@print_router.post("/api/shop/signup", summary="Create a shop owned by current user")
def shop_signup(payload: PrintShopIn, authorization: Optional[str] = Header(default=None)):
    uid, _ = _get_auth_user(authorization)
    supabase = get_service_client()
    shop_id = str(uuid.uuid4())
    row = _supabase_payload({
        "id": shop_id,
        "owner_user_id": uid,
        "name": payload.name,
        "phone": payload.phone,
        "email": payload.email,
        "address": payload.address,
        "lat": payload.lat,
        "lng": payload.lng,
        "hours": payload.hours or {},
        "capabilities": payload.capabilities.dict() if payload.capabilities else {},
        "is_open": True,
        "paused": False,
        "rating": 0,
        "created_at": _now_iso(),
        "updated_at": _now_iso(),
    })
    ins = supabase.table(PRINT_SHOPS_TABLE).insert(row).execute()
    if getattr(ins, 'error', None):
        raise HTTPException(status_code=500, detail=f"Failed: {ins.error}")
    return {"ok": True, "shop_id": shop_id}


@print_router.get("/api/shop/me", summary="Get my shop profile")
def shop_me(authorization: Optional[str] = Header(default=None)):
    uid, _ = _get_auth_user(authorization)
    supabase = get_service_client()
    res = supabase.table(PRINT_SHOPS_TABLE).select("*").eq("owner_user_id", uid).limit(1).execute()
    row = (getattr(res, 'data', []) or [{}])[0]
    if not row:
        raise HTTPException(status_code=404, detail="No shop found for user")
    return row


@print_router.patch("/api/shop/me", summary="Update my shop profile")
def shop_me_update(payload: UpdateShopIn, authorization: Optional[str] = Header(default=None)):
    uid, _ = _get_auth_user(authorization)
    supabase = get_service_client()
    # Resolve my shop id
    res = supabase.table(PRINT_SHOPS_TABLE).select("id").eq("owner_user_id", uid).limit(1).execute()
    row = (getattr(res, 'data', []) or [{}])[0]
    if not row:
        raise HTTPException(status_code=404, detail="No shop found for user")
    shop_id = row.get("id")
    # Build update dict
    to_update: Dict[str, Any] = {}
    if payload.name is not None:
        to_update["name"] = payload.name
    if payload.phone is not None:
        to_update["phone"] = payload.phone
    if payload.email is not None:
        to_update["email"] = payload.email
    if payload.address is not None:
        to_update["address"] = payload.address
    if payload.lat is not None:
        to_update["lat"] = payload.lat
    if payload.lng is not None:
        to_update["lng"] = payload.lng
    if payload.hours is not None:
        to_update["hours"] = payload.hours
    if payload.capabilities is not None:
        to_update["capabilities"] = payload.capabilities.dict()
    if payload.is_open is not None:
        to_update["is_open"] = payload.is_open
    if payload.paused is not None:
        to_update["paused"] = payload.paused
    if payload.price_hint is not None:
        to_update["price_hint"] = payload.price_hint
    if payload.pricing is not None:
        to_update["pricing"] = payload.pricing.dict()
    to_update["updated_at"] = _now_iso()
    if not to_update:
        return {"ok": True, "updated": 0}
    upd = supabase.table(PRINT_SHOPS_TABLE).update(_supabase_payload(to_update)).eq("id", shop_id).execute()
    if getattr(upd, 'error', None):
        raise HTTPException(status_code=500, detail=f"Failed to update: {upd.error}")
    return {"ok": True}


@print_router.get("/api/shop/jobs", summary="List jobs for my shop")
def shop_jobs(status: Optional[str] = Query(default=None), authorization: Optional[str] = Header(default=None)):
    uid, _ = _get_auth_user(authorization)
    supabase = get_service_client()
    shop_res = supabase.table(PRINT_SHOPS_TABLE).select("id").eq("owner_user_id", uid).limit(1).execute()
    shop = (getattr(shop_res, 'data', []) or [{}])[0]
    if not shop:
        raise HTTPException(status_code=404, detail="No shop found")
    q = supabase.table(PRINT_JOBS_TABLE).select("*").eq("shop_id", shop.get("id"))
    if status:
        q = q.eq("status", status)
    res = q.order("created_at").execute()
    return {"jobs": getattr(res, 'data', []) or []}


def _set_status(job_id: str, new_status: str, note: str, authorization: Optional[str]):
    supabase = get_service_client()
    # Fetch job + verify ownership
    job_q = supabase.table(PRINT_JOBS_TABLE).select("id,shop_id,status,otp").eq("id", job_id).limit(1).execute()
    job = (getattr(job_q, 'data', []) or [{}])[0]
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    _require_shop_owner(job.get("shop_id"), authorization)
    now = _now_iso()
    supabase.table(PRINT_JOBS_TABLE).update({"status": new_status, "updated_at": now}).eq("id", job_id).execute()
    supabase.table(PRINT_JOB_EVENTS_TABLE).insert({"job_id": job_id, "status": new_status, "note": note, "created_at": now}).execute()
    return {"ok": True}


@print_router.post("/api/shop/jobs/{job_id}/accept")
def shop_accept(job_id: str, authorization: Optional[str] = Header(default=None)):
    return _set_status(job_id, "accepted", "Accepted", authorization)


@print_router.post("/api/shop/jobs/{job_id}/reject")
def shop_reject(job_id: str, reason: Optional[str] = Form(default=None), authorization: Optional[str] = Header(default=None)):
    return _set_status(job_id, "cancelled", f"Rejected: {reason or ''}", authorization)


@print_router.post("/api/shop/jobs/{job_id}/printing")
def shop_printing(job_id: str, authorization: Optional[str] = Header(default=None)):
    return _set_status(job_id, "printing", "Printing", authorization)


@print_router.post("/api/shop/jobs/{job_id}/ready")
def shop_ready(job_id: str, authorization: Optional[str] = Header(default=None)):
    return _set_status(job_id, "ready", "Ready for pickup", authorization)


class ReleaseIn(BaseModel):
    otp: str


@print_router.post("/api/shop/jobs/{job_id}/release")
def shop_release(job_id: str, body: ReleaseIn, authorization: Optional[str] = Header(default=None)):
    supabase = get_service_client()
    job_q = supabase.table(PRINT_JOBS_TABLE).select("id,shop_id,status,otp").eq("id", job_id).limit(1).execute()
    job = (getattr(job_q, 'data', []) or [{}])[0]
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    _require_shop_owner(job.get("shop_id"), authorization)
    if (job.get("otp") or "").strip() != (body.otp or "").strip():
        raise HTTPException(status_code=400, detail="Invalid OTP")
    return _set_status(job_id, "completed", "Released with OTP", authorization)

# --- Notes Marketplace API ---
marketplace_router = APIRouter()

# Storage directory for uploaded marketplace note files (PDF, images, etc.)
MARKETPLACE_STORAGE = Path(__file__).resolve().parent / "assets" / "notes_marketplace"
MARKETPLACE_STORAGE.mkdir(parents=True, exist_ok=True)

# Allow common document/image/presentation/archive types used for notes
ALLOWED_NOTE_EXTENSIONS = {
    ".pdf",
    ".md",
    ".txt",
    ".png",
    ".jpg",
    ".jpeg",
    ".doc",
    ".docx",
    ".ppt",
    ".pptx",
    ".zip",
}
MAX_NOTE_FILE_SIZE = 25 * 1024 * 1024  # 25 MB


def _require_auth_user_id(token: Optional[str]) -> str:
    """Resolve auth user id from bearer token using Supabase anon client."""
    if not token:
        raise HTTPException(status_code=401, detail="Missing or invalid auth token")
    anon = get_anon_client()
    if not anon:
        raise HTTPException(status_code=500, detail="Anon client not configured")
    try:
        user = anon.auth.get_user(token)  # type: ignore[attr-defined]
        uid = _get_user_id_from_auth_response(user)
        if not uid:
            raise HTTPException(status_code=401, detail="Invalid auth user")
        return uid
    except Exception:
        raise HTTPException(status_code=401, detail="Auth validation failed")


def _sanitize_filename(name: str) -> str:
    base = re.sub(r"[^a-zA-Z0-9_.-]+", "_", name.strip())[:120]
    return base or "note"


def _execute_supabase(builder, retries: int = 2, base_delay: float = 0.2):
    """Execute a Supabase query builder with simple retry on transport drops."""
    last_exc: Optional[Exception] = None
    for attempt in range(retries + 1):
        try:
            return builder.execute()
        except HTTPXRemoteProtocolError as exc:  # pragma: no cover - network dependent
            last_exc = exc
            time.sleep(base_delay * (attempt + 1))
            continue
    raise HTTPException(status_code=503, detail="Temporary Supabase connection issue. Please retry.") from last_exc


def _approximate_pages_from_words(words: int) -> Optional[int]:
    if words <= 0:
        return None
    # assume ~500 words per page, round up
    return max(1, math.ceil(words / 500))


def _compute_page_count(file_path: Path, original_name: Optional[str], mime_type: Optional[str]) -> Optional[int]:
    """Best-effort page/slide estimate using available libraries; returns None on failure."""
    if not file_path or not file_path.exists():
        return None
    ext = (Path(original_name or file_path.name).suffix or "").lower()
    if not ext and mime_type:
        mt = (mime_type or "").lower()
        if "pdf" in mt:
            ext = ".pdf"
        elif "word" in mt or "msword" in mt:
            ext = ".docx"
        elif "ppt" in mt:
            ext = ".pptx"
    try:
        if ext == ".pdf" and fitz:
            with fitz.open(file_path) as pdf:  # type: ignore[attr-defined]
                return int(pdf.page_count)
        if ext in {".docx"} and docx:
            document = docx.Document(str(file_path))
            words = sum(len((para.text or "").split()) for para in document.paragraphs)
            return _approximate_pages_from_words(words)
        if ext in {".pptx"} and Presentation:
            prs = Presentation(str(file_path))
            return len(prs.slides)
        if ext == ".doc" and textract:
            text = textract.process(str(file_path)).decode("utf-8", errors="ignore")
            words = len(text.split())
            return _approximate_pages_from_words(words)
        if ext == ".ppt" and textract:
            text = textract.process(str(file_path)).decode("utf-8", errors="ignore")
            slides = text.count("\f") or text.count("\x0c") or 0
            return slides or None
    except Exception:
        return None
    return None


def _store_marketplace_file(upload: UploadFile) -> tuple[str, int, str]:
    suffix = Path(upload.filename or "").suffix.lower()
    if suffix not in ALLOWED_NOTE_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Unsupported file type")
    # Read into memory (size limit) then write
    content = upload.file.read()
    size = len(content)
    if size > MAX_NOTE_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (>25MB)")
    rand = uuid.uuid4().hex
    safe_name = _sanitize_filename(Path(upload.filename or "uploaded").name)
    stored_name = f"{rand}-{safe_name}"
    stored_path = MARKETPLACE_STORAGE / stored_name
    with open(stored_path, "wb") as f:
        f.write(content)
    return stored_name, size, (upload.content_type or "application/octet-stream")


@marketplace_router.post("/api/marketplace/notes", summary="Upload a note to marketplace")
def mp_upload_note(
    title: str = Form(..., min_length=1, max_length=256),
    description: str = Form(""),
    subject: str = Form(""),
    subject_id: Optional[str] = Form(None),
    unit: str = Form(""),
    exam_type: str = Form(""),
    categories: str = Form(""),  # comma separated
    price_cents: int = Form(0, ge=0),
    college_id: Optional[str] = Form(None),
    degree_id: Optional[str] = Form(None),
    department_id: Optional[str] = Form(None),
    batch_id: Optional[str] = Form(None),
    semester: Optional[int] = Form(None),
    file: Optional[UploadFile] = File(None),
    files: Optional[List[UploadFile]] = File(None),
    cover: Optional[UploadFile] = File(None),
    authorization: Optional[str] = Header(default=None),
):
    token = _parse_bearer_token(authorization)
    user_id = _require_auth_user_id(token)
    uploads: List[UploadFile] = []
    if files:
        uploads.extend([f for f in files if f is not None and getattr(f, 'filename', None)])
    if file is not None and getattr(file, 'filename', None):
        uploads.append(file)
    if not uploads:
        raise HTTPException(status_code=400, detail="No file(s) provided")
    cover_name: Optional[str] = None
    if cover and cover.filename:
        try:
            # Reuse storage but restrict to image types
            ext = Path(cover.filename).suffix.lower()
            if ext not in {'.png', '.jpg', '.jpeg', '.webp', '.gif'}:
                raise HTTPException(status_code=400, detail="Unsupported cover image type")
            content = cover.file.read()
            if len(content) > 5 * 1024 * 1024:
                raise HTTPException(status_code=400, detail="Cover image too large (>5MB)")
            cover_name = f"cover-{uuid.uuid4().hex}{ext}"
            (MARKETPLACE_STORAGE / cover_name).write_bytes(content)
        except HTTPException:
            raise
        except Exception as e:  # pragma: no cover
            raise HTTPException(status_code=500, detail=f"Failed to store cover: {e}")
    cats = [c.strip() for c in (categories or "").split(",") if c.strip()]
    supabase = get_service_client()
    def build_row(upload: UploadFile, stored_name: str, size: int, mime: str) -> Dict[str, Any]:
        r: Dict[str, Any] = {
            "owner_user_id": user_id,
            "title": title.strip(),
            "description": description.strip() or None,
            "subject": subject.strip() or None,
            "unit": unit.strip() or None,
            "exam_type": exam_type.strip() or None,
            "categories": cats,
            "price_cents": price_cents,
            "original_filename": upload.filename,
            "stored_path": stored_name,
            "mime_type": mime,
            "file_size": size,
        }
        # Attach academic linkage if provided (light validation)
        if college_id:
            r["college_id"] = college_id
        if degree_id:
            r["degree_id"] = degree_id
        if department_id:
            r["department_id"] = department_id
        if batch_id:
            r["batch_id"] = batch_id
        if semester is not None:
            if semester < 1 or semester > 12:
                raise HTTPException(status_code=400, detail="semester must be between 1 and 12")
            r["semester"] = semester
        if cover_name:
            r["cover_path"] = cover_name
        if subject_id:
            try:
                uuid.UUID(str(subject_id))
                r["subject_id"] = str(subject_id)
                r["subject_href"] = f"/api/syllabus/courses/{subject_id}"
            except Exception:
                pass
        return r

    rows: List[Dict[str, Any]] = []
    for up in uploads:
        stored_name, size, mime = _store_marketplace_file(up)
        rows.append(build_row(up, stored_name, size, mime))
    res = supabase.table("marketplace_notes").insert(rows if len(rows) > 1 else rows[0]).execute()
    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (insert note): {res.error}")
    data_rows = res.data if isinstance(res.data, list) else ([res.data] if res.data else rows)
    return {"notes": data_rows}


@marketplace_router.get("/api/marketplace/notes", summary="List marketplace notes")
def mp_list_notes(
    q: Optional[str] = Query(None),
    subject: Optional[str] = Query(None),
    exam_type: Optional[str] = Query(None),
    min_price: Optional[int] = Query(None, ge=0),
    max_price: Optional[int] = Query(None, ge=0),
    college_id: Optional[str] = Query(None),
    degree_id: Optional[str] = Query(None),
    department_id: Optional[str] = Query(None),
    batch_id: Optional[str] = Query(None),
    semester: Optional[int] = Query(None, ge=1, le=12),
    teachers_only: Optional[bool] = Query(False, description="If true, restrict to notes whose owners have role=teacher"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    supabase = get_service_client()
    query = supabase.table("marketplace_notes").select("*").order("created_at", desc=True)
    # Basic filters happen client-side after fetch because supabase python client has limited chaining w/ dynamic filters.
    res = query.execute()
    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (list notes): {res.error}")
    items = res.data or []
    # Collect unique owner_user_id values to enrich with profile display fields (user_profiles + teacher_profiles + roles).
    owner_ids = sorted({r.get("owner_user_id") for r in items if r.get("owner_user_id")})
    user_profiles_map: dict[str, dict] = {}
    teacher_profiles_map: dict[str, dict] = {}
    teacher_ids_role: set[str] = set()
    if owner_ids:
        CHUNK = 40
        for i in range(0, len(owner_ids), CHUNK):
            chunk = owner_ids[i:i+CHUNK]
            # Standard user profile enrichment
            try:
                prof_res = (
                    supabase.table("user_profiles")
                    .select("auth_user_id,name,profile_image_url")
                    .in_("auth_user_id", chunk)
                    .execute()
                )
                if not getattr(prof_res, "error", None):
                    for pr in prof_res.data or []:
                        pid = pr.get("auth_user_id")
                        if pid:
                            user_profiles_map[pid] = pr
            except Exception:  # pragma: no cover
                pass
            # Teacher profile enrichment (prefer these over user_profiles when present)
            try:
                tprof_res = (
                    supabase.table("teacher_profiles")
                    .select("auth_user_id,name,profile_image_url,college_id,department_id")
                    .in_("auth_user_id", chunk)
                    .execute()
                )
                if not getattr(tprof_res, "error", None):
                    for tr in tprof_res.data or []:
                        tid = tr.get("auth_user_id")
                        if tid:
                            teacher_profiles_map[tid] = tr
            except Exception:  # pragma: no cover
                pass
        # Roles lookup (single query if possible)
        try:
            role_res = (
                supabase.table("admin_roles")
                .select("auth_user_id,role")
                .in_("auth_user_id", owner_ids)
                .eq("role", "teacher")
                .execute()
            )
            if not getattr(role_res, "error", None):
                for rr in role_res.data or []:
                    rid = rr.get("auth_user_id")
                    if rid:
                        teacher_ids_role.add(rid)
        except Exception:  # pragma: no cover
            pass
    # Optionally restrict to teacher owners (role table lookup)
    if teachers_only:
        teacher_ids: set[str] = set()
        try:
            role_res = (
                supabase.table("admin_roles")
                .select("auth_user_id,role")
                .eq("role", "teacher")
                .execute()
            )
            if not getattr(role_res, "error", None):
                for r in role_res.data or []:
                    uid = r.get("auth_user_id")
                    if uid:
                        teacher_ids.add(uid)
        except Exception:
            teacher_ids = set()
        if teacher_ids:
            items = [r for r in items if r.get("owner_user_id") in teacher_ids]

    # Enrich each note with seller fields (short form) for UI consumption. Teacher profile takes precedence.
    for r in items:
        oid = r.get("owner_user_id")
        if not oid:
            continue
        tprof = teacher_profiles_map.get(oid)
        uprof = user_profiles_map.get(oid)
        is_teacher = oid in teacher_ids_role or bool(tprof)
        seller: dict[str, Any] = {"id": oid}
        if tprof:
            seller["name"] = tprof.get("name") or (uprof.get("name") if uprof else oid[:6] + "…")
            if tprof.get("profile_image_url"):
                seller["avatar_url"] = tprof.get("profile_image_url")
        elif uprof:
            seller["name"] = uprof.get("name") or oid[:6] + "…"
            if uprof.get("profile_image_url"):
                seller["avatar_url"] = uprof.get("profile_image_url")
        else:
            seller["name"] = oid[:6] + "…"
        if is_teacher:
            seller["verified"] = True
            seller["is_teacher"] = True
            seller["profile_href"] = f"/ui/teacher_profile.html?user={oid}"
        r["seller"] = seller
    
    def _match(row: dict) -> bool:
        if q:
            txt = " ".join(str(row.get(k, "")) for k in ["title", "description", "subject", "unit"]).lower()
            if q.lower() not in txt:
                return False
        if subject and (row.get("subject") or "") != subject:
            return False
        if exam_type and (row.get("exam_type") or "") != exam_type:
            return False
        if college_id and (row.get("college_id") or "") != college_id:
            return False
        if degree_id and (row.get("degree_id") or "") != degree_id:
            return False
        if department_id and (row.get("department_id") or "") != department_id:
            return False
        if batch_id and (row.get("batch_id") or "") != batch_id:
            return False
        if semester is not None and row.get("semester") != semester:
            return False
        price = int(row.get("price_cents") or 0)
        if min_price is not None and price < min_price:
            return False
        if max_price is not None and price > max_price:
            return False
        return True
    filtered = [r for r in items if _match(r)]
    total = len(filtered)
    paged = filtered[offset: offset + limit]
    return {"items": paged, "total": total, "limit": limit, "offset": offset}


@marketplace_router.get("/api/marketplace/subjects/{subject_id}/teacher-notes", summary="List teacher marketplace notes for a subject")
def mp_teacher_notes_by_subject(
    subject_id: str,
    limit: int = Query(20, ge=1, le=60),
    offset: int = Query(0, ge=0),
):
    subject_key = (subject_id or "").strip()
    if not subject_key or subject_key.lower() in {"null", "undefined"}:
        raise HTTPException(status_code=400, detail="A valid subject_id is required")

    supabase = get_service_client()
    notes_res = (
        supabase.table("marketplace_notes")
        .select("id,title,subject,subject_id,price_cents,owner_user_id,updated_at,created_at,semester,unit,exam_type")
        .eq("subject_id", subject_key)
        .order("updated_at", desc=True)
        .offset(offset)
        .limit(limit)
        .execute()
    )
    if getattr(notes_res, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (notes by subject): {notes_res.error}")

    notes: List[Dict[str, Any]] = notes_res.data or []
    if not notes:
        return {"notes": []}

    owner_ids = {n.get("owner_user_id") for n in notes if n.get("owner_user_id")}
    if not owner_ids:
        return {"notes": []}

    teacher_ids: Set[str] = set()
    try:
        role_res = (
            supabase.table("admin_roles")
            .select("auth_user_id,role")
            .in_("auth_user_id", list(owner_ids))
            .eq("role", "teacher")
            .execute()
        )
        if getattr(role_res, "error", None):
            teacher_ids = set(owner_ids)  # fall back to include all owners if role lookup fails
        else:
            teacher_ids = {row.get("auth_user_id") for row in (role_res.data or []) if row.get("auth_user_id")}
    except Exception:
        teacher_ids = set(owner_ids)

    filtered_notes = [row for row in notes if row.get("owner_user_id") in teacher_ids]
    if not filtered_notes:
        return {"notes": []}

    seller_ids = {row.get("owner_user_id") for row in filtered_notes if row.get("owner_user_id")}
    user_profiles_map: Dict[str, Dict[str, Any]] = {}
    teacher_profiles_map: Dict[str, Dict[str, Any]] = {}

    if seller_ids:
        try:
            prof_res = (
                supabase.table("user_profiles")
                .select("auth_user_id,name,profile_image_url")
                .in_("auth_user_id", list(seller_ids))
                .execute()
            )
            if not getattr(prof_res, "error", None):
                for row in prof_res.data or []:
                    uid = row.get("auth_user_id")
                    if uid:
                        user_profiles_map[uid] = row
        except Exception:
            pass
        try:
            tprof_res = (
                supabase.table("teacher_profiles")
                .select("auth_user_id,name,profile_image_url")
                .in_("auth_user_id", list(seller_ids))
                .execute()
            )
            if not getattr(tprof_res, "error", None):
                for row in tprof_res.data or []:
                    uid = row.get("auth_user_id")
                    if uid:
                        teacher_profiles_map[uid] = row
        except Exception:
            pass

    enriched: List[Dict[str, Any]] = []
    for row in filtered_notes:
        owner_id = row.get("owner_user_id")
        teacher_profile = teacher_profiles_map.get(owner_id)
        user_profile = user_profiles_map.get(owner_id)
        seller_name = None
        seller_avatar = None
        if teacher_profile and teacher_profile.get("name"):
            seller_name = teacher_profile.get("name")
        elif user_profile and user_profile.get("name"):
            seller_name = user_profile.get("name")
        elif owner_id:
            seller_name = owner_id[:6] + "..."
        if teacher_profile and teacher_profile.get("profile_image_url"):
            seller_avatar = teacher_profile.get("profile_image_url")
        elif user_profile and user_profile.get("profile_image_url"):
            seller_avatar = user_profile.get("profile_image_url")

        seller = {"id": owner_id, "is_teacher": True, "verified": True}
        if seller_name:
            seller["name"] = seller_name
        if seller_avatar:
            seller["avatar_url"] = seller_avatar
        if owner_id:
            seller["profile_href"] = f"/ui/teacher_profile.html?user={owner_id}"

        enriched.append(
            {
                "id": row.get("id"),
                "title": row.get("title"),
                "subject": row.get("subject"),
                "subject_id": row.get("subject_id"),
                "price_cents": int(row.get("price_cents") or 0),
                "owner_user_id": owner_id,
                "updated_at": row.get("updated_at") or row.get("created_at"),
                "created_at": row.get("created_at"),
                "semester": row.get("semester"),
                "unit": row.get("unit"),
                "exam_type": row.get("exam_type"),
                "seller": seller,
            }
        )

    return {"notes": enriched, "count": len(enriched), "limit": limit, "offset": offset}


@marketplace_router.get("/api/marketplace/notes/meta", summary="Distinct filter metadata for marketplace notes")
def mp_notes_meta(teachers_only: Optional[bool] = Query(False, description="If true, restrict to notes whose owners have role=teacher")):
    """Return distinct values useful for building client-side filters.

    This performs a single select * (bounded) and derives sets in app code because
    the Supabase python client lacks a simple DISTINCT helper across many columns.
    If the table grows large, replace with server-side RPC or dedicated materialized view.
    """
    supabase = get_service_client()
    # Fetch a reasonable window (latest 1000) – adjust as needed or paginate later.
    res = supabase.table("marketplace_notes").select("*").order("created_at", desc=True).limit(1000).execute()
    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (notes meta): {res.error}")
    rows: List[dict] = res.data or []
    if teachers_only:
        # build teacher id set
        try:
            role_res = supabase.table("admin_roles").select("auth_user_id,role").eq("role", "teacher").execute()
            if not getattr(role_res, "error", None):
                teacher_ids = {r.get("auth_user_id") for r in (role_res.data or []) if r.get("auth_user_id")}
                if teacher_ids:
                    rows = [r for r in rows if r.get("owner_user_id") in teacher_ids]
        except Exception:
            pass
    subjects: set[str] = set()
    exam_types: set[str] = set()
    semesters: set[int] = set()
    categories: set[str] = set()
    college_ids: set[str] = set()
    degree_ids: set[str] = set()
    department_ids: set[str] = set()
    batch_ids: set[str] = set()
    seller_ids: set[str] = set()
    prices: List[int] = []
    for r in rows:
        if r.get("subject"): subjects.add(str(r.get("subject")))
        if r.get("exam_type"): exam_types.add(str(r.get("exam_type")))
        if r.get("semester") is not None:
            try:
                semesters.add(int(r.get("semester")))
            except Exception:
                pass
        if isinstance(r.get("categories"), list):
            for c in r.get("categories"):
                if c: categories.add(str(c))
        if r.get("college_id"): college_ids.add(str(r.get("college_id")))
        if r.get("degree_id"): degree_ids.add(str(r.get("degree_id")))
        if r.get("department_id"): department_ids.add(str(r.get("department_id")))
        if r.get("batch_id"): batch_ids.add(str(r.get("batch_id")))
        if r.get("owner_user_id"): seller_ids.add(str(r.get("owner_user_id")))
        try:
            prices.append(int(r.get("price_cents") or 0))
        except Exception:
            pass
    # Enrich seller short names (best-effort)
    seller_map: Dict[str, Dict[str, Optional[str]]] = {}
    if seller_ids:
        try:
            prof = (
                supabase.table("user_profiles")
                .select("auth_user_id,name,profile_image_url")
                .in_("auth_user_id", list(seller_ids))
                .execute()
            )
            if not getattr(prof, "error", None):
                for row in prof.data or []:
                    uid = row.get("auth_user_id")
                    if uid:
                        seller_map[uid] = {
                            "id": uid,
                            "name": row.get("name") or uid[:6] + "…",
                            "avatar_url": row.get("profile_image_url"),
                        }
        except Exception:
            pass
    price_min = min(prices) if prices else 0
    price_max = max(prices) if prices else 0
    return {
        "subjects": sorted(subjects),
        "exam_types": sorted(exam_types),
        "semesters": sorted(semesters),
        "categories": sorted(categories),
        "college_ids": sorted(college_ids),
        "degree_ids": sorted(degree_ids),
        "department_ids": sorted(department_ids),
        "batch_ids": sorted(batch_ids),
        "sellers": list(seller_map.values()),
        "price_range": {"min": price_min, "max": price_max},
        "count": len(rows),
    }


@marketplace_router.get("/api/marketplace/notes/{note_id}", summary="Get marketplace note detail")
def mp_get_note(note_id: uuid.UUID, authorization: Optional[str] = Header(default=None), token: Optional[str] = Query(None)):
    header_token = _parse_bearer_token(authorization)
    token = token or header_token
    supabase = get_service_client()
    note_query = supabase.table("marketplace_notes").select("*").eq("id", str(note_id)).limit(1)
    res = _execute_supabase(note_query)
    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (get note): {res.error}")
    if not res.data:
        raise HTTPException(status_code=404, detail="Note not found")
    note = res.data[0]
    if not note.get("page_count"):
        stored_name = note.get("stored_path")
        if stored_name:
            file_path = MARKETPLACE_STORAGE / stored_name
            computed_pages = _compute_page_count(file_path, note.get("original_filename"), note.get("mime_type"))
            if computed_pages:
                note["page_count"] = computed_pages
                note["pages"] = computed_pages
    # Determine if user has access (owner or purchased or free)
    user_id = None
    if token:
        try:
            user_id = _require_auth_user_id(token)
        except HTTPException:
            user_id = None
    has_access = False
    if note.get("price_cents", 0) == 0:
        has_access = True
    elif user_id and user_id == note.get("owner_user_id"):
        has_access = True
    elif user_id:
        purchase_query = (
            supabase.table("marketplace_purchases")
            .select("id")
            .eq("note_id", str(note_id))
            .eq("buyer_user_id", user_id)
            .limit(1)
        )
        pur = _execute_supabase(purchase_query)
        if getattr(pur, "error", None):
            raise HTTPException(status_code=500, detail=f"Supabase error (check purchase): {pur.error}")
        if pur.data:
            has_access = True
    # Reviews
    reviews_query = (
        supabase.table("marketplace_reviews")
        .select("id,reviewer_user_id,rating,comment,created_at")
        .eq("note_id", str(note_id))
        .order("created_at", desc=True)
    )
    rev = _execute_supabase(reviews_query)
    reviews = rev.data or []
    # Collect user ids for enrichment (owner + reviewers)
    user_ids: set[str] = set()
    owner_id = note.get("owner_user_id")
    if owner_id:
        user_ids.add(owner_id)
    for r in reviews:
        rid = r.get("reviewer_user_id")
        if rid:
            user_ids.add(rid)
    profiles_map: dict[str, dict] = {}
    if user_ids:
        # Fetch profiles from user_profiles (auth_user_id mapping)
        try:
            prof_query = (
                supabase.table("user_profiles")
                .select("auth_user_id,name,profile_image_url")
                .in_("auth_user_id", list(user_ids))
            )
            prof_res = _execute_supabase(prof_query)
            if not getattr(prof_res, "error", None):
                for row in prof_res.data or []:
                    uid = row.get("auth_user_id")
                    if uid:
                        profiles_map[uid] = row
        except Exception:
            pass
    # Attach seller (prefer teacher_profiles for teachers)
    seller_obj: Dict[str, Any] = {"id": owner_id} if owner_id else {}
    teacher_profile_row = None
    if owner_id:
        try:
            tprof_query = supabase.table("teacher_profiles").select("auth_user_id,name,profile_image_url,college_id,department_id").eq("auth_user_id", owner_id).limit(1)
            tprof = _execute_supabase(tprof_query)
            if not getattr(tprof, "error", None) and tprof.data:
                teacher_profile_row = tprof.data[0]
        except Exception:
            teacher_profile_row = None
    if teacher_profile_row:
        seller_obj["name"] = teacher_profile_row.get("name") or (profiles_map.get(owner_id, {}).get("name") if owner_id in profiles_map else owner_id[:6] + "…")
        if teacher_profile_row.get("profile_image_url"):
            seller_obj["avatar_url"] = teacher_profile_row.get("profile_image_url")
    if owner_id and not teacher_profile_row and owner_id in profiles_map:
        prow = profiles_map[owner_id]
        seller_obj.setdefault("name", prow.get("name") or owner_id[:6] + "…")
        if prow.get("profile_image_url"):
            seller_obj["avatar_url"] = prow.get("profile_image_url")
    if owner_id and "name" not in seller_obj:
        seller_obj["name"] = owner_id[:6] + "…"
    if owner_id:
        note["seller"] = seller_obj

    # Determine if owner has teacher role (verification badge)
    is_teacher_owner = False
    try:
        if owner_id:
            role_query = (
                supabase.table("admin_roles")
                .select("role")
                .eq("auth_user_id", owner_id)
                .eq("role", "teacher")
                .limit(1)
            )
            role_res = _execute_supabase(role_query)
            if not getattr(role_res, "error", None) and role_res.data:
                is_teacher_owner = True
    except Exception:
        # Non-fatal; silently ignore role lookup issues
        pass
    if note.get("seller"):
        note["seller"]["verified"] = is_teacher_owner
        note["seller"]["is_teacher"] = is_teacher_owner
        if is_teacher_owner:
            note["seller"]["profile_href"] = f"/ui/teacher_profile.html?user={owner_id}" if owner_id else None
    note["is_teacher_owner"] = is_teacher_owner
    # Enrich each review
    for r in reviews:
        rid = r.get("reviewer_user_id")
        prow = profiles_map.get(rid)
        if prow:
            r["reviewer"] = {
                "id": rid,
                "name": prow.get("name") or (rid[:6] + "…" if rid else None),
                "avatar_url": prow.get("profile_image_url"),
            }
    # --- Academic metadata enrichment (names) ---
    # If the note row has academic foreign keys, attempt to resolve human-readable names.
    # This keeps the base schema flexible while giving the UI friendly labels.
    academic_name_map: dict[str, Optional[str]] = {
        "college_name": None,
        "degree_name": None,
        "department_name": None,
        "batch_range": None,
    }
    try:
        # We collect the needed ids first to minimize queries.
        college_id = note.get("college_id")
        degree_id = note.get("degree_id")
        department_id = note.get("department_id")
        batch_id = note.get("batch_id")
        # For each present id we fetch its table (single row).
        if college_id:
            rcol = supabase.table("colleges").select("id,name").eq("id", college_id).limit(1).execute()
            if not getattr(rcol, "error", None) and rcol.data:
                academic_name_map["college_name"] = rcol.data[0].get("name")
        if degree_id:
            rdeg = supabase.table("degrees").select("id,name").eq("id", degree_id).limit(1).execute()
            if not getattr(rdeg, "error", None) and rdeg.data:
                academic_name_map["degree_name"] = rdeg.data[0].get("name")
        if department_id:
            rdep = supabase.table("departments").select("id,name").eq("id", department_id).limit(1).execute()
            if not getattr(rdep, "error", None) and rdep.data:
                academic_name_map["department_name"] = rdep.data[0].get("name")
        if batch_id:
            rbat = supabase.table("batches").select("id,from_year,to_year").eq("id", batch_id).limit(1).execute()
            if not getattr(rbat, "error", None) and rbat.data:
                b = rbat.data[0]
                fy = b.get("from_year")
                ty = b.get("to_year")
                if fy and ty:
                    academic_name_map["batch_range"] = f"{fy}-{ty}"
                elif fy:
                    academic_name_map["batch_range"] = str(fy)
    except Exception:
        # Silently ignore enrichment errors; we don't want to block detail retrieval.
        pass
    # Attach only non-null values to the note object so the front-end can conditionally render.
    for k, v in academic_name_map.items():
        if v:
            note[k] = v
    return {"note": note, "has_access": has_access, "reviews": reviews}


@marketplace_router.get("/api/marketplace/notes/{note_id}/download", summary="Download note file (public)")
def mp_download_note(note_id: uuid.UUID):
    """Serve the note file publicly (purchase no longer required)."""
    supabase = get_service_client()
    res = supabase.table("marketplace_notes").select("stored_path").eq("id", str(note_id)).limit(1).execute()
    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (get note): {res.error}")
    if not res.data:
        raise HTTPException(status_code=404, detail="Note not found")
    stored = res.data[0].get("stored_path")
    if not stored:
        raise HTTPException(status_code=500, detail="File missing")
    file_path = MARKETPLACE_STORAGE / stored
    if not file_path.is_file():
        raise HTTPException(status_code=404, detail="File not found on server")
    return FileResponse(str(file_path), filename=stored)

@marketplace_router.get("/api/marketplace/notes/{note_id}/preview", summary="Inline preview for PDF or image")
def mp_preview_note(note_id: uuid.UUID):
    """Serve the note file with Content-Disposition inline for browser preview.

    Falls back to normal download if type unsupported.
    """
    supabase = get_service_client()
    res = supabase.table("marketplace_notes").select("stored_path,mime_type,original_filename").eq("id", str(note_id)).limit(1).execute()
    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (get note): {res.error}")
    if not res.data:
        raise HTTPException(status_code=404, detail="Note not found")
    row = res.data[0]
    stored = row.get("stored_path")
    if not stored:
        raise HTTPException(status_code=500, detail="File missing")
    file_path = MARKETPLACE_STORAGE / stored
    if not file_path.is_file():
        raise HTTPException(status_code=404, detail="File not found on server")
    mime = (row.get("mime_type") or "application/octet-stream").lower()
    # Allow inline only for pdf / images
    allow_inline = mime.startswith("image/") or mime == "application/pdf"
    headers = {}
    if allow_inline:
        # Force inline
        headers["Content-Disposition"] = f"inline; filename={stored}"
    return FileResponse(str(file_path), filename=stored, media_type=mime, headers=headers)

@marketplace_router.get("/api/marketplace/notes/{note_id}/cover", summary="Get cover image for a note")
def mp_cover_image(note_id: uuid.UUID):
    supabase = get_service_client()
    res = supabase.table("marketplace_notes").select("cover_path").eq("id", str(note_id)).limit(1).execute()
    if getattr(res, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (get cover): {res.error}")
    if not res.data:
        raise HTTPException(status_code=404, detail="Note not found")
    cover = res.data[0].get("cover_path")
    if not cover:
        raise HTTPException(status_code=404, detail="No cover set")
    file_path = MARKETPLACE_STORAGE / cover
    if not file_path.is_file():
        raise HTTPException(status_code=404, detail="Cover not found")
    # Guess mime
    ext = file_path.suffix.lower()
    mime = "image/jpeg"
    if ext == ".png":
        mime = "image/png"
    elif ext == ".webp":
        mime = "image/webp"
    elif ext == ".gif":
        mime = "image/gif"
    return FileResponse(str(file_path), filename=cover, media_type=mime, headers={"Content-Disposition": f"inline; filename={cover}"})


@marketplace_router.post("/api/marketplace/notes/{note_id}/purchase", summary="Purchase a paid note (mock payment)")
def mp_purchase_note(note_id: uuid.UUID, authorization: Optional[str] = Header(default=None), token: Optional[str] = Query(None)):
    header_token = _parse_bearer_token(authorization)
    token = token or header_token
    user_id = _require_auth_user_id(token)
    supabase = get_service_client()
    note_res = supabase.table("marketplace_notes").select("price_cents,owner_user_id").eq("id", str(note_id)).limit(1).execute()
    if getattr(note_res, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (get note): {note_res.error}")
    if not note_res.data:
        raise HTTPException(status_code=404, detail="Note not found")
    note = note_res.data[0]
    if note.get("owner_user_id") == user_id:
        raise HTTPException(status_code=400, detail="Cannot purchase your own note")
    price = int(note.get("price_cents") or 0)
    if price == 0:
        return {"status": "free", "message": "Note is free"}
    # Mock payment success: just record purchase if not exists
    existing = (
        supabase.table("marketplace_purchases")
        .select("id")
        .eq("note_id", str(note_id))
        .eq("buyer_user_id", user_id)
        .limit(1)
        .execute()
    )
    if getattr(existing, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (find purchase): {existing.error}")
    if existing.data:
        return {"status": "ok", "message": "Already purchased"}
    ins = supabase.table("marketplace_purchases").insert({
        "note_id": str(note_id),
        "buyer_user_id": user_id,
        "amount_cents": price,
    }).execute()
    if getattr(ins, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (insert purchase): {ins.error}")
    return {"status": "ok", "purchase": ins.data[0] if ins.data else None}


@marketplace_router.post("/api/marketplace/notes/{note_id}/review", summary="Add or update a review")
def mp_review_note(
    note_id: uuid.UUID,
    rating: int = Form(..., ge=1, le=5),
    comment: str = Form(""),
    authorization: Optional[str] = Header(default=None),
    token: Optional[str] = Query(None),
):
    header_token = _parse_bearer_token(authorization)
    token = token or header_token
    user_id = _require_auth_user_id(token)
    supabase = get_service_client()
    # Ensure note exists (access no longer required for reviews; any authenticated user may review)
    note_res = supabase.table("marketplace_notes").select("price_cents,owner_user_id").eq("id", str(note_id)).limit(1).execute()
    if getattr(note_res, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (get note): {note_res.error}")
    if not note_res.data:
        raise HTTPException(status_code=404, detail="Note not found")
    note = note_res.data[0]
    # Access rule relaxed: we no longer gate by purchase/free. Still only one review per user.
    # Upsert (one per user per note)
    existing = (
        supabase.table("marketplace_reviews")
        .select("id")
        .eq("note_id", str(note_id))
        .eq("reviewer_user_id", user_id)
        .limit(1)
        .execute()
    )
    if getattr(existing, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (find review): {existing.error}")
    now = datetime.utcnow().isoformat()
    if existing.data:
        rid = existing.data[0]["id"]
        upd = (
            supabase.table("marketplace_reviews")
            .update({"rating": rating, "comment": comment.strip() or None, "updated_at": now})
            .eq("id", rid)
            .execute()
        )
        if getattr(upd, "error", None):
            raise HTTPException(status_code=500, detail=f"Supabase error (update review): {upd.error}")
    else:
        ins = supabase.table("marketplace_reviews").insert({
            "note_id": str(note_id),
            "reviewer_user_id": user_id,
            "rating": rating,
            "comment": comment.strip() or None,
        }).execute()
        if getattr(ins, "error", None):
            raise HTTPException(status_code=500, detail=f"Supabase error (insert review): {ins.error}")
    # Recompute aggregates
    agg = supabase.rpc("exec", params={}).execute() if False else None  # placeholder for future RPC
    # manual aggregate
    revs = (
        supabase.table("marketplace_reviews").select("rating").eq("note_id", str(note_id)).execute()
    )
    if not getattr(revs, "error", None):
        ratings = [int(r.get("rating") or 0) for r in (revs.data or [])]
        if ratings:
            avg_rating = round(sum(ratings) / len(ratings), 2)
            supabase.table("marketplace_notes").update({
                "avg_rating": avg_rating,
                "rating_count": len(ratings),
                "updated_at": datetime.utcnow().isoformat(),
            }).eq("id", str(note_id)).execute()
    return {"status": "ok"}


@marketplace_router.put("/api/marketplace/notes/{note_id}", summary="Update own note metadata")
def mp_update_note(note_id: uuid.UUID, payload: dict = Body(...), authorization: Optional[str] = Header(default=None)):
    token = _parse_bearer_token(authorization)
    user_id = _require_auth_user_id(token)
    supabase = get_service_client()
    note_res = supabase.table("marketplace_notes").select("owner_user_id").eq("id", str(note_id)).limit(1).execute()
    if getattr(note_res, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (get note for update): {note_res.error}")
    if not note_res.data:
        raise HTTPException(status_code=404, detail="Note not found")
    owner_id = note_res.data[0].get("owner_user_id")
    if owner_id != user_id:
        raise HTTPException(status_code=403, detail="Not permitted to update this note")
    allowed_fields = {"title", "description", "subject", "subject_id", "semester", "price_cents", "unit", "exam_type", "categories"}
    updates: Dict[str, Any] = {}
    payload = payload or {}
    for field in allowed_fields:
        if field in payload:
            value = payload[field]
            if field == "categories" and isinstance(value, str):
                value = [c.strip() for c in value.split(",") if c.strip()]
            if field == "semester" and value not in (None, ""):
                try:
                    ivalue = int(value)
                    if ivalue < 1 or ivalue > 12:
                        raise ValueError
                    value = ivalue
                except ValueError:
                    raise HTTPException(status_code=400, detail="semester must be between 1 and 12")
            if field == "price_cents" and value not in (None, ""):
                try:
                    value = int(value)
                    if value < 0:
                        raise ValueError
                except ValueError:
                    raise HTTPException(status_code=400, detail="price_cents must be a non-negative integer")
            if field == "subject_id" and value:
                try:
                    uuid.UUID(str(value))
                    value = str(value)
                except Exception:
                    raise HTTPException(status_code=400, detail="subject_id must be a valid UUID")
            updates[field] = value if value != "" else None
    if not updates:
        return {"updated": False}
    updates["updated_at"] = datetime.utcnow().isoformat()
    upd = (
        supabase.table("marketplace_notes")
        .update(updates)
        .eq("id", str(note_id))
        .eq("owner_user_id", user_id)
        .execute()
    )
    if getattr(upd, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (update note): {upd.error}")
    data = None
    if isinstance(upd.data, list) and upd.data:
        data = upd.data[0]
    return {"updated": True, "note": data or updates}


@marketplace_router.post("/api/marketplace/notes/{note_id}/replace-file", summary="Replace stored file for own note")
def mp_replace_note_file(
    note_id: uuid.UUID,
    file: UploadFile = File(...),
    authorization: Optional[str] = Header(default=None),
):
    token = _parse_bearer_token(authorization)
    user_id = _require_auth_user_id(token)
    supabase = get_service_client()
    note_res = (
        supabase.table("marketplace_notes")
        .select("owner_user_id,stored_path")
        .eq("id", str(note_id))
        .limit(1)
        .execute()
    )
    if getattr(note_res, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (get note for replace): {note_res.error}")
    if not note_res.data:
        raise HTTPException(status_code=404, detail="Note not found")
    note_row = note_res.data[0]
    owner_id = note_row.get("owner_user_id")
    if owner_id != user_id:
        raise HTTPException(status_code=403, detail="Not permitted to replace this note")
    old_stored = note_row.get("stored_path")
    stored_name, size, mime = _store_marketplace_file(file)
    update_fields = {
        "stored_path": stored_name,
        "original_filename": file.filename or "upload",
        "file_size": size,
        "mime_type": mime,
        "updated_at": datetime.utcnow().isoformat(),
    }
    upd = (
        supabase.table("marketplace_notes")
        .update(update_fields)
        .eq("id", str(note_id))
        .eq("owner_user_id", user_id)
        .execute()
    )
    if getattr(upd, "error", None):
        try:
            new_path = MARKETPLACE_STORAGE / stored_name
            if new_path.is_file():
                new_path.unlink()
        except Exception:
            pass
        raise HTTPException(status_code=500, detail=f"Supabase error (replace file): {upd.error}")
    if old_stored and old_stored != stored_name:
        try:
            old_path = MARKETPLACE_STORAGE / old_stored
            if old_path.is_file():
                old_path.unlink()
        except Exception:
            pass
    return {"updated": True, "stored_path": stored_name}


@marketplace_router.delete("/api/marketplace/notes/{note_id}", summary="Delete own note")
def mp_delete_note(note_id: uuid.UUID, authorization: Optional[str] = Header(default=None), token: Optional[str] = Query(None)):
    header_token = _parse_bearer_token(authorization)
    token = token or header_token
    user_id = _require_auth_user_id(token)
    supabase = get_service_client()
    note_res = supabase.table("marketplace_notes").select("owner_user_id,stored_path").eq("id", str(note_id)).limit(1).execute()
    if getattr(note_res, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (get note): {note_res.error}")
    if not note_res.data:
        raise HTTPException(status_code=404, detail="Not found")
    note = note_res.data[0]
    if note.get("owner_user_id") != user_id:
        raise HTTPException(status_code=403, detail="Not owner")
    del_res = supabase.table("marketplace_notes").delete().eq("id", str(note_id)).execute()
    if getattr(del_res, "error", None):
        raise HTTPException(status_code=500, detail=f"Supabase error (delete note): {del_res.error}")
    # remove file silently
    try:
        fp = MARKETPLACE_STORAGE / (note.get("stored_path") or "")
        if fp.is_file():
            fp.unlink()
    except Exception:
        pass
    return {"status": "deleted"}


def _openai_client():
    """Return OpenAI client (1.x) or raise. Supports legacy 0.x fallback."""
    try:
        import openai  # type: ignore
    except Exception as e:  # pragma: no cover
        raise HTTPException(status_code=500, detail=f"OpenAI library missing: {e}")
    api_key = os.getenv("OPENAI_API_KEY") or os.getenv("OPENAI_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Missing OPENAI_API_KEY in environment")
    # New 1.x style client
    try:  # prefer 1.x Client
        from openai import OpenAI  # type: ignore

        return OpenAI(api_key=api_key)
    except Exception:
        # Fallback: configure legacy global (<=0.28)
        openai.api_key = api_key
        return openai


def _build_transform_prompt(mode: str, content: str, custom: str | None) -> str:
    base_instruction = {
        "summarize": "Summarize the markdown below into a concise, well-structured overview. Preserve headings hierarchy where helpful; keep math/mermaid/code blocks intact.",
        "expand": "Expand and elaborate the markdown below. Add helpful clarifying sentences, short intuitive examples, and brief context. Do NOT invent inaccurate facts. Preserve code/math/mermaid blocks.",
        "simplify": "Rewrite the markdown in simpler language suitable for a beginner, keeping key technical terms but adding plain-language explanation.",
    }.get(mode, "")
    if mode == "custom" and custom:
        base_instruction = f"Apply this custom transformation to the markdown: {custom}. Preserve code/math/mermaid blocks and headings."
    if not base_instruction:
        base_instruction = "Return the markdown unchanged."  # fallback
    return (
        base_instruction
        + "\n\nReturn ONLY valid markdown. Do not add commentary outside the transformed content.\n\n---\nMARKDOWN INPUT BELOW\n---\n"
        + content
    )


@notes_router.post("/api/notes/transform")
def api_transform_note(payload: dict):
    """Ephemeral transform of markdown (summarize / expand / custom)."""
    mode = (payload or {}).get("mode", "summarize").strip().lower()
    markdown = (payload or {}).get("markdown", "")
    custom = (payload or {}).get("prompt")
    if not markdown:
        raise HTTPException(status_code=400, detail="Missing markdown")
    if mode not in {"summarize", "expand", "custom", "simplify"}:
        raise HTTPException(status_code=400, detail="Invalid mode")
    prompt = _build_transform_prompt(mode, markdown, custom)
    try:
        client = _openai_client()
        model = os.getenv("LLM_MODEL", "gpt-4o-mini")
        messages = [
            {"role": "system", "content": "You are an assistant that edits markdown content precisely as instructed."},
            {"role": "user", "content": prompt},
        ]
        out_text = ""
        # Detect 1.x client (has .chat.completions.create)
        create_fn = None
        try:
            create_fn = client.chat.completions.create  # type: ignore[attr-defined]
        except AttributeError:
            create_fn = None
        if create_fn:
            resp = create_fn(
                model=model,
                messages=messages,
                temperature=0.4,
                max_tokens=4096,
            )
            out_text = resp.choices[0].message.content if resp.choices else ""
        else:
            # Legacy 0.x fallback
            resp = client.ChatCompletion.create(  # type: ignore[attr-defined]
                model=model,
                messages=messages,
                temperature=0.4,
                max_tokens=4096,
            )
            out_text = resp.choices[0].message["content"] if resp.choices else ""
        if not out_text:
            raise HTTPException(status_code=500, detail="Empty transform output")
        return {"markdown": out_text, "mode": mode, "custom": custom or None}
    except HTTPException:
        raise
    except Exception as e:  # pragma: no cover
        raise HTTPException(status_code=500, detail=f"Transform failed: {e}")


@notes_router.post("/generate")
@notes_router.post("/api/notes/generate")
async def generate(payload: dict):
    topic = (payload or {}).get("topic", "").strip()
    force = bool((payload or {}).get("force", False))
    if not topic:
        return JSONResponse({"error": "Missing 'topic'"}, status_code=400)
    try:
        if not force:
            match = find_existing_note_for_topic(topic)
            if match:
                try:
                    data = read_note(match["id"])  # type: ignore[index]
                    return {
                        "id": match["id"],
                        "markdown": data.get("markdown", ""),
                        "cached": True,
                        "match_score": match.get("score", 0),
                        "title": match.get("title"),
                    }
                except Exception:
                    pass
        md = generate_notes_markdown(topic)
        meta = save_note(topic, md)
        return {"id": meta["id"], "markdown": md, "cached": False}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@notes_router.get("/generate/stream")
@notes_router.get("/api/notes/generate/stream")
async def generate_stream(topic: str, force: bool = False):
    async def event_source() -> AsyncGenerator[bytes, None]:
        yield b"event: open\n\n"
        # Early cache hit: emit and close
        if not force:
            match = find_existing_note_for_topic(topic)
            if match:
                try:
                    data = read_note(match["id"])  # type: ignore[index]
                    payload = {
                        "id": match["id"],
                        "markdown": data.get("markdown", ""),
                        "cached": True,
                        "match_score": match.get("score", 0),
                        "title": match.get("title"),
                    }
                    line = f"event: final\n".encode("utf-8")
                    data_json = json.dumps(payload, ensure_ascii=False)
                    data_b = ("data: " + data_json + "\n\n").encode("utf-8")
                    yield line
                    yield data_b
                    yield b"event: close\n\n"
                    return
                except Exception:
                    pass
        loop = asyncio.get_running_loop()
        queue: asyncio.Queue[Tuple[str, Optional[str], Optional[Dict[str, Any]]]] = asyncio.Queue()
        stop_event = threading.Event()

        def dispatch(item: Tuple[str, Optional[str], Optional[Dict[str, Any]]]) -> None:
            loop.call_soon_threadsafe(queue.put_nowait, item)

        def worker() -> None:
            try:
                for name, payload in generate_notes_events(topic, stop_event=stop_event):
                    if stop_event.is_set():
                        break
                    dispatch(("event", name, payload))
                dispatch(("done", None, None))
            except Exception as exc:
                dispatch(("error", None, {"message": str(exc)}))
                dispatch(("done", None, None))

        worker_future = loop.run_in_executor(None, worker)

        try:
            while True:
                kind, name, payload = await queue.get()
                if kind == "event" and name is not None and payload is not None:
                    try:
                        if name == "final" and isinstance(payload, dict) and payload.get("markdown"):
                            try:
                                meta = save_note(topic, payload.get("markdown", ""))
                                payload["id"] = meta.get("id")
                                payload["cached"] = False
                            except Exception:
                                pass
                            finally:
                                stop_event.set()
                        line = f"event: {name}\n".encode("utf-8")
                        data_json = json.dumps(payload, ensure_ascii=False)
                        data = ("data: " + data_json + "\n\n").encode("utf-8")
                        yield line
                        yield data
                    except Exception as exc:
                        err = json.dumps({"message": str(exc)}, ensure_ascii=False)
                        yield b"event: error\n"
                        yield ("data: " + err + "\n\n").encode("utf-8")
                elif kind == "error" and payload is not None:
                    err_json = json.dumps(payload, ensure_ascii=False)
                    yield b"event: error\n"
                    yield ("data: " + err_json + "\n\n").encode("utf-8")
                elif kind == "done":
                    break
        except asyncio.CancelledError:
            stop_event.set()
            raise
        finally:
            stop_event.set()
            try:
                await asyncio.wait_for(asyncio.wrap_future(worker_future), timeout=1.0)
            except Exception:
                pass

        yield b"event: close\n\n"

    headers = {
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
    }
    return StreamingResponse(event_source(), media_type="text/event-stream", headers=headers)


@notes_router.get("/notes")
@notes_router.get("/api/notes")
def api_list_notes():
    return {"items": list_notes()}


@notes_router.post("/notes")
@notes_router.post("/api/notes")
def api_create_note(payload: dict):
    topic = (payload or {}).get("topic", "").strip() or "Untitled"
    markdown = (payload or {}).get("markdown", "")
    meta = save_note(topic, markdown)
    return meta


@notes_router.get("/notes/{note_id}")
@notes_router.get("/api/notes/{note_id}")
def api_read_note(note_id: str):
    try:
        return read_note(note_id)
    except FileNotFoundError:
        return JSONResponse({"error": "Not found"}, status_code=404)


@notes_router.put("/notes/{note_id}")
@notes_router.put("/api/notes/{note_id}")
def api_update_note(note_id: str, payload: dict):
    markdown = (payload or {}).get("markdown", "")
    try:
        return update_note(note_id, markdown)
    except FileNotFoundError:
        return JSONResponse({"error": "Not found"}, status_code=404)


@notes_router.get("/notes/{note_id}/download")
@notes_router.get("/api/notes/{note_id}/download")
def api_download_note(note_id: str):
    path = note_path(note_id)
    if not path or not os.path.isfile(path):
        return JSONResponse({"error": "Not found"}, status_code=404)
    return FileResponse(path, media_type="text/markdown", filename=f"{note_id}.md")


@notes_router.get("/notes/{note_id}/pdf")
@notes_router.get("/api/notes/{note_id}/pdf")
def api_note_pdf(note_id: str):
    try:
        data = read_note(note_id)
    except FileNotFoundError:
        return JSONResponse({"error": "Not found"}, status_code=404)
    md = data.get("markdown", "")
    try:
        pdf_bytes = render_pdf_from_markdown_via_headless(md, title=note_id)
    except Exception:
        try:
            pdf_bytes = render_pdf_from_markdown(md)
        except Exception as e:
            return JSONResponse({"error": f"PDF error: {e}"}, status_code=500)
    filename = f"{note_id}.pdf"
    headers = {"Content-Disposition": f"attachment; filename={filename}"}
    return Response(content=pdf_bytes, media_type="application/pdf", headers=headers)


@notes_router.post("/pdf")
@notes_router.post("/api/pdf")
def api_pdf_from_markdown(payload: dict):
    markdown = (payload or {}).get("markdown", "")
    title = (payload or {}).get("title", "notes").strip() or "notes"
    try:
        pdf_bytes = render_pdf_from_markdown_via_headless(markdown, title=title)
    except Exception:
        try:
            pdf_bytes = render_pdf_from_markdown(markdown)
        except Exception as e:
            return JSONResponse({"error": f"PDF error: {e}"}, status_code=500)
    safe = re.sub(r"[^a-zA-Z0-9_.-]+", "_", title)[:80]
    headers = {"Content-Disposition": f"attachment; filename={safe}.pdf"}
    return Response(content=pdf_bytes, media_type="application/pdf", headers=headers)

# --- YouTube transcript endpoints ---

youtube_transcript_router = APIRouter(prefix="/api/transcripts", tags=["youtube transcripts"])


def _structured_notes_from_transcript(transcript: str, *, title: str, lang: Optional[str]) -> Tuple[str, bool]:
    clean_text = (transcript or "").strip()
    if not clean_text:
        raise HTTPException(status_code=400, detail="Transcript text is empty.")

    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=501,
            detail="Gemini API key not configured. Set GEMINI_API_KEY to enable structured notes.",
        )

    try:
        import google.generativeai as genai  # type: ignore
    except Exception as exc:  # pragma: no cover - optional dependency
        raise HTTPException(
            status_code=501,
            detail=f"Gemini client library missing: {exc}. Install google-generativeai to enable this feature.",
        ) from exc

    max_chars = max(4000, MAX_TRANSCRIPT_CHARS_FOR_NOTES)
    truncated = False
    if len(clean_text) > max_chars:
        clean_text = clean_text[:max_chars]
        truncated = True

    notes_prompt = textwrap.dedent(
        """
        You are PaperX's academic note composer. Transform the provided YouTube transcript into polished,
        exam-ready study notes written in Markdown.

        Output requirements:
        - Start with a single H1 title using the video name.
        - Include these H2 sections, even if you must acknowledge limited information:
          1. TL;DR (3-6 terse bullet points)
          2. Key Takeaways (bullets)
          3. Detailed Notes (use subsections or numbered steps when flow suggests)
          4. Examples & Analogies (bullets; add [not mentioned] if absent)
          5. Frameworks / Processes (tables or lists; include Mermaid diagrams when explaining flows)
          6. Glossary (term – short definition table or list)
          7. Reflection Questions
          8. Action Items or Next Steps
          9. Further Reading / References (recommend logical follow ups; mark [none] if unavailable)
        - Bold critical vocabulary and formulas.
        - Prefer Markdown tables where comparing items.
        - If the transcript seems partial, state that in TL;DR and continue with available context.
        - Keep the tone clear, modern, and supportive for self-study.
        """
    ).strip()

    context_notice = ""
    if truncated:
        context_notice = (
            f"NOTE: Only the first {max_chars} characters of the transcript were available. "
            "Flag the notes as partial if key sections appear missing."
        )

    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel(GEMINI_NOTES_MODEL)
    payload = [
        {"text": notes_prompt},
        {
            "text": textwrap.dedent(
                f"""
                Video title: {title or 'Unknown YouTube Video'}
                Preferred output language: {lang or 'en'}
                {context_notice}

                Transcript:
                {clean_text}
                """
            ).strip()
        },
    ]

    try:
        response = model.generate_content(payload)
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Gemini notes request failed: {exc}",
        ) from exc

    generated = getattr(response, "text", "") or ""
    if not generated:
        try:
            generated = response.candidates[0].content.parts[0].text  # type: ignore[index]
        except Exception:
            generated = ""

    generated = (generated or "").strip()
    if not generated:
        raise HTTPException(status_code=502, detail="Gemini did not return any content.")

    return generated, truncated


class YouTubeTranscriptRequest(BaseModel):
    url: HttpUrl
    lang: Optional[str] = "en"
    fallback_ytdlp: Optional[bool] = True
    use_whisper: Optional[bool] = False
    clean: Optional[bool] = True


class YouTubeTranscriptResponse(BaseModel):
    paragraph: str
    source: str


class YouTubeTranscriptNotesRequest(BaseModel):
    url: HttpUrl
    lang: Optional[str] = "en"
    fallback_ytdlp: Optional[bool] = True
    clean: Optional[bool] = True


class YouTubeTranscriptNotesResponse(BaseModel):
    notes_markdown: str
    model: str
    truncated: bool
    transcript_chars: int


class YouTubeMetaRequest(BaseModel):
    url: HttpUrl


class YouTubeMetaResponse(BaseModel):
    video_id: str
    embed_url: str
    channel_name: Optional[str] = None
    upload_date: Optional[str] = None  # ISO date string (YYYY-MM-DD) when available
    views: Optional[int] = None


def _normalize_video_key(url: str) -> str:
    try:
        vid = extract_video_id(str(url))
        if vid:
            return vid
    except HTTPException:
        pass
    return str(url).strip()


@lru_cache(maxsize=512)
def _cached_youtube_meta(video_key: str) -> Dict[str, Any]:
    if YoutubeDL is None:  # pragma: no cover - optional dependency missing
        raise HTTPException(status_code=501, detail="yt-dlp is not available on the server.")

    ydl_opts = {
        "skip_download": True,
        "quiet": True,
        "no_warnings": True,
        "extract_flat": False,  # get full metadata for a single video
    }

    target_url = video_key
    if re.fullmatch(r"[A-Za-z0-9_-]{11}", video_key):
        target_url = f"https://www.youtube.com/watch?v={video_key}"

    with YoutubeDL(ydl_opts) as ydl:
        try:
            info = ydl.extract_info(str(target_url), download=False)
        except Exception as exc:
            raise HTTPException(status_code=400, detail=f"Could not fetch metadata: {exc}") from exc

    vid = str(info.get("id") or "").strip()
    if not vid:
        # Fallback to parser if present
        try:
            vid = extract_video_id(str(url))
        except HTTPException:
            pass
    if not vid:
        raise HTTPException(status_code=400, detail="Could not determine YouTube video ID from URL.")

    # Prefer channel name field, fallback to uploader
    channel_name = info.get("channel") or info.get("uploader") or None

    # upload_date comes as YYYYMMDD; convert to YYYY-MM-DD if present
    up_raw = info.get("upload_date") or ""
    upload_date = None
    if isinstance(up_raw, str) and len(up_raw) == 8 and up_raw.isdigit():
        upload_date = f"{up_raw[0:4]}-{up_raw[4:6]}-{up_raw[6:8]}"

    views = info.get("view_count")
    try:
        views = int(views) if views is not None else None
    except Exception:
        views = None

    return {
        "video_id": vid,
        "embed_url": f"https://www.youtube.com/embed/{vid}",
        "channel_name": channel_name,
        "upload_date": upload_date,
        "views": views,
    }


def _extract_youtube_meta(url: str) -> YouTubeMetaResponse:
    """Extract basic metadata for a YouTube video using yt-dlp without downloading.

    Returns video_id, embed_url, channel_name, upload_date (YYYY-MM-DD), and views.
    """
    video_key = _normalize_video_key(url)
    meta = _cached_youtube_meta(video_key)
    return YouTubeMetaResponse(**meta)


@youtube_transcript_router.post("/paragraph", response_model=YouTubeTranscriptResponse)
def api_transcript_paragraph(payload: YouTubeTranscriptRequest) -> YouTubeTranscriptResponse:
    text = fetch_transcript_paragraph(
        url_or_id=str(payload.url),
        lang=payload.lang or "en",
        fallback_ytdlp=bool(payload.fallback_ytdlp),
        use_whisper=bool(payload.use_whisper),
        clean=bool(payload.clean),
    ).strip()
    if not text:
        raise HTTPException(status_code=404, detail="Transcript is empty.")
    return YouTubeTranscriptResponse(paragraph=text, source=str(payload.url))


@youtube_transcript_router.post("/meta", response_model=YouTubeMetaResponse)
def api_youtube_meta(payload: YouTubeMetaRequest) -> YouTubeMetaResponse:
    """Return basic metadata (id, channel, upload date, views) for the given YouTube URL."""
    return _extract_youtube_meta(str(payload.url))


@youtube_transcript_router.post("/notes", response_model=YouTubeTranscriptNotesResponse)
def api_transcript_notes(payload: YouTubeTranscriptNotesRequest) -> YouTubeTranscriptNotesResponse:
    transcript_text = fetch_transcript_paragraph(
        url_or_id=str(payload.url),
        lang=payload.lang or "en",
        fallback_ytdlp=bool(payload.fallback_ytdlp),
        use_whisper=False,
        clean=bool(payload.clean),
    ).strip()
    if not transcript_text:
        raise HTTPException(status_code=404, detail="Transcript is empty.")

    try:
        video_id = extract_video_id(str(payload.url))
    except HTTPException:
        video_id = None
    video_title = f"YouTube Video {video_id}" if video_id else "YouTube Video"

    notes_markdown, truncated = _structured_notes_from_transcript(
        transcript_text,
        title=video_title,
        lang=payload.lang,
    )
    result = YouTubeTranscriptNotesResponse(
        notes_markdown=notes_markdown,
        model=GEMINI_NOTES_MODEL,
        truncated=truncated,
        transcript_chars=len(transcript_text),
    )

    # Best-effort: save generated notes for this video to Supabase for caching.
    try:
        if video_id:
            supabase = get_service_client()
            record = _supabase_payload({
                "video_id": video_id,
                "video_url": str(payload.url),
                "notes_markdown": result.notes_markdown,
                "model": result.model,
                "truncated": result.truncated,
                "transcript_chars": result.transcript_chars,
            })
            # Ignore failure; we don't want to block the response on storage errors.
            _ = supabase.table("youtube_ai_notes").insert(record).execute()
    except Exception:
        pass

    return result


@youtube_transcript_router.get("/saved/{video_id}")
def api_youtube_saved(video_id: str):
    """Return the latest saved notes for a given YouTube video ID if present; else 404."""
    if not video_id or not re.fullmatch(r"[A-Za-z0-9_-]{6,32}", video_id):
        raise HTTPException(status_code=400, detail="Invalid video ID.")
    supabase = get_service_client()
    try:
        def _run():
            return (
                supabase
                .table("youtube_ai_notes")
                .select("video_id,video_url,notes_markdown,model,truncated,transcript_chars,created_at")
                .eq("video_id", video_id)
                .order("created_at", desc=True)
                .limit(1)
                .execute()
            )
        res = _supabase_retry(_run)
        rows = getattr(res, "data", None) or []
        if not rows:
            raise HTTPException(status_code=404, detail="No saved notes found for this video.")
        # Return the row as-is; front-end expects at least notes_markdown and optionally model
        return rows[0]
    except APIError as exc:
        raise HTTPException(status_code=502, detail=f"Storage error: {exc}") from exc


# --- YouTube Video Search endpoints ---

youtube_search_router = APIRouter(prefix="/api/youtube", tags=["youtube search"])


@youtube_search_router.get("/search")
def api_youtube_search(
    query: str = Query(..., description="Search query for YouTube videos"),
    num: int = Query(8, ge=1, le=20, description="Number of videos to return")
):
    """Search YouTube videos using SerpAPI and return metadata including thumbnails, views, channel info."""
    if not query or not query.strip():
        raise HTTPException(status_code=400, detail="Query parameter is required")
    
    try:
        videos = search_youtube_videos(query.strip(), num=num)
        return videos
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"YouTube search failed: {str(e)}")


@youtube_search_router.get("/channel-logo")
def api_youtube_channel_logo(
    channel_url: str = Query(..., description="Full YouTube channel URL")
):
    if not channel_url or not channel_url.strip():
        raise HTTPException(status_code=400, detail="channel_url is required")

    try:
        logo = get_channel_logo(channel_url.strip()) or get_default_channel_logo()
        return {"logo": logo}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Channel logo lookup failed: {str(e)}")


# --- FastAPI app ---

def create_app() -> FastAPI:
    app = FastAPI(title="PaperX Unified API", version="1.0.0")

    # CORS: allow dev origins and support Authorization header
    # Note: Using allow_origin_regex to correctly echo Origin when credentials are enabled.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[],
        allow_origin_regex=r".*",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(projects_router)
    app.include_router(notes_router)
    app.include_router(print_router)
    app.include_router(academics_router)
    app.include_router(marketplace_router)
    app.include_router(teacher_router)
    app.include_router(youtube_transcript_router)
    app.include_router(youtube_search_router)
    app.include_router(yt_transcript_router, prefix="/api/youtube", tags=["youtube transcripts (raw)"])

    @app.get("/")
    def root():
        return {
            "message": "PaperX API running",
            "notes_ui": "/ui/notes_generator.html",
            "transcripts_ui": "/ui/youtube-transcript.html",
            "youtube_videos_ui": "/ui/youtube_videos.html",
        }

    ui_dir = Path(__file__).resolve().parent / "ui"
    if ui_dir.is_dir():
        app.mount("/ui", StaticFiles(directory=ui_dir), name="ui")
    # Static assets (images, uploaded teacher ID cards, etc.)
    assets_dir = Path(__file__).resolve().parent / "assets"
    if assets_dir.is_dir():
        # Serve at /assets so front-end references like ../assets/... resolve
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    return app


app = create_app()

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "8000")))
