import os
import re
import html
import unicodedata
import tempfile
from typing import List, Optional, Tuple

# FastAPI types are used for optional Router and consistent errors.
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel, HttpUrl

import regex as rx  # supports \p{L}

from youtube_transcript_api import (
    YouTubeTranscriptApi,
    TranscriptsDisabled,
    NoTranscriptFound,
    VideoUnavailable,
)
from yt_dlp import YoutubeDL

# ---------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------
def fetch_transcript_paragraph(
    url_or_id: str,
    lang: str = "en",
    *,
    fallback_ytdlp: bool = True,
    use_whisper: bool = False,
    clean: bool = True,
) -> str:
    """
    Returns the entire transcript as a single cleaned paragraph (UTF-8 string).
    No timestamps. No SRT/VTT. Raises HTTPException on failure (FastAPI-friendly).
    """
    video_id = extract_video_id(url_or_id)
    preferred = [lang] if lang else ["en"]

    # 1) Official transcript
    transcript, _lang_code = try_youtube_transcript_api(video_id, preferred)

    # 2) yt-dlp auto captions
    if transcript is None and fallback_ytdlp:
        vtt_path, _ytdlp_lang = try_yt_dlp_captions(video_id, preferred)
        if vtt_path:
            transcript = load_vtt_to_segments(vtt_path)

    # 3) Whisper fallback (optional)
    if transcript is None and use_whisper:
        text = transcribe_with_whisper(video_id, lang_hint=lang)
        if not text:
            raise HTTPException(404, "Transcription failed (Whisper returned empty text).")
        transcript = [{"start": 0.0, "duration": 0.0, "text": text}]

    if transcript is None:
        raise HTTPException(404, "No transcript/captions available (or disabled) for this video.")

    if clean:
        # strip tags, compact word-level repeats, de-dup near-duplicates
        cleaned = []
        for seg in transcript:
            t = strip_inline_tags(seg.get("text", ""))
            if not t:
                continue
            t = compact_repetitions(t)
            cleaned.append({"start": float(seg.get("start", 0.0)),
                            "duration": float(seg.get("duration", 0.0)),
                            "text": t})
        transcript = dedupe_and_merge_segments(cleaned)
    else:
        # just normalize structure
        transcript = [
            {"start": float(seg.get("start", 0.0)),
             "duration": float(seg.get("duration", 0.0)),
             "text": seg.get("text", "")}
            for seg in (transcript or [])
        ]

    # Render a single paragraph
    return render_paragraph(transcript)


# ---------------------------------------------------------------------
# Optional FastAPI Router (plug-and-play)
#   from transcript_paragraph import router
#   app.include_router(router, prefix="/api")
# GET /api/transcript.txt?url=...&lang=en&fallback_ytdlp=true&use_whisper=false&clean=true
# ---------------------------------------------------------------------
router = APIRouter()

class _Params(BaseModel):
    url: HttpUrl
    lang: Optional[str] = "en"
    fallback_ytdlp: Optional[bool] = True
    use_whisper: Optional[bool] = False
    clean: Optional[bool] = True

@router.get("/transcript.txt")
def get_transcript_txt(
    url: str = Query(..., description="YouTube video URL (or ID)"),
    lang: str = Query("en"),
    fallback_ytdlp: bool = Query(True),
    use_whisper: bool = Query(False),
    clean: bool = Query(True),
):
    text = fetch_transcript_paragraph(
        url_or_id=url,
        lang=lang,
        fallback_ytdlp=fallback_ytdlp,
        use_whisper=use_whisper,
        clean=clean,
    )
    return PlainTextResponse(text, media_type="text/plain; charset=utf-8")


# ---------------------------------------------------------------------
# Helpers: ID parsing
# ---------------------------------------------------------------------
YOUTUBE_ID_PATTERNS = [
    r"(?:v=|/v/|/embed/|/shorts/|youtu\.be/)([A-Za-z0-9_-]{11})",
    r"^([A-Za-z0-9_-]{11})$",
]

def extract_video_id(url_or_id: str) -> str:
    for pat in YOUTUBE_ID_PATTERNS:
        m = re.search(pat, url_or_id)
        if m:
            return m.group(1)
    token = (url_or_id or "").strip()
    if re.fullmatch(r"[A-Za-z0-9_-]{11}", token):
        return token
    raise HTTPException(400, "Could not parse YouTube video ID from the provided URL or ID.")


# ---------------------------------------------------------------------
# Cleaning utilities
# ---------------------------------------------------------------------
TAG_TS_RE        = rx.compile(r"<\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?>", flags=rx.I)
TAG_C_OPEN_RE    = rx.compile(r"<c(?:\.[^>]*)?>", flags=rx.I)
TAG_C_CLOSE_RE   = rx.compile(r"</c>", flags=rx.I)
BRACKET_NOISE_RE = rx.compile(r"\[(?:music|applause|__|noise|silence)\]", flags=rx.I)
WS_RE            = rx.compile(r"[ \t\u00A0]+")

def strip_inline_tags(text: str) -> str:
    t = TAG_TS_RE.sub("", text)
    t = TAG_C_OPEN_RE.sub("", t)
    t = TAG_C_CLOSE_RE.sub("", t)
    t = html.unescape(t)
    t = BRACKET_NOISE_RE.sub("", t)
    t = t.replace("_", " ")
    t = WS_RE.sub(" ", t).strip()
    return t

def normalize_for_compare(text: str) -> str:
    t = strip_inline_tags(text)
    t = unicodedata.normalize("NFKC", t)
    t = rx.sub(r"[^\p{L}\p{N}\s.,!?;:']", "", t)
    t = WS_RE.sub(" ", t).strip().lower()
    return t

def smart_sentence_join(chunks: List[str]) -> str:
    raw = " ".join(chunks)
    raw = WS_RE.sub(" ", raw).strip()
    raw = re.sub(r"\s+([.,!?;:])", r"\1", raw)
    return raw

# Tokenize/untokenize for repetition compaction
TOKEN_RE = rx.compile(r"\p{L}+\p{M}*|\d+|[^\s\p{L}\p{N}]", rx.UNICODE)

def _tokens(s: str) -> List[str]:
    return TOKEN_RE.findall(s)

def _untokenize(tokens: List[str]) -> str:
    out = []
    for i, tok in enumerate(tokens):
        if i > 0 and rx.match(r"[\p{L}\p{N}]", tok) and rx.match(r"[\p{L}\p{N}]", tokens[i-1]):
            out.append(" ")
        out.append(tok)
    return "".join(out)

def compact_repetitions(text: str, max_ngram: int = 12, min_chars_per_span: int = 4) -> str:
    """
    Removes consecutive duplicated spans like:
    'hello everyone welcome ... hello everyone welcome ...'
    Works token-wise, preferring longest repeated spans up to max_ngram.
    """
    if not text or len(text) < 2:
        return text

    # quick stutter fix: 'the the', 'and and'
    text = rx.sub(r"\b(\p{L}+)\s+\1\b", r"\1", text, flags=rx.IGNORECASE)

    toks = _tokens(text)
    i = 0
    out: List[str] = []

    while i < len(toks):
        matched = False
        max_n = min(max_ngram, (len(toks) - i) // 2)
        for n in range(max_n, 0, -1):
            a = toks[i:i+n]
            b = toks[i+n:i+2*n]
            if not a or not b:
                continue
            if a == b:
                span_txt = _untokenize(a)
                if len(rx.sub(r"\s+", "", span_txt)) >= min_chars_per_span:
                    j = i + n
                    while j + n <= len(toks) and toks[j:j+n] == a:
                        j += n
                    out.extend(a)  # keep one copy
                    i = j
                    matched = True
                    break
        if not matched:
            out.append(toks[i])
            i += 1

    s = _untokenize(out)
    s = rx.sub(r"\s+([.,!?;:])", r" \1", s)
    s = rx.sub(r"([(\[{])\s+", r"\1", s)
    s = rx.sub(r"\s+([)\]}])", r"\1", s)
    s = rx.sub(r"\s{2,}", " ", s).strip()
    return s


# ---------------------------------------------------------------------
# Source fetchers: official API, yt-dlp
# ---------------------------------------------------------------------
def prefer_language_candidates(preferred_langs: List[str]) -> List[str]:
    expanded: List[str] = []
    for lang in preferred_langs:
        expanded.append(lang)
        if "-" in lang:
            base = lang.split("-")[0]
            if base not in expanded:
                expanded.append(base)
    # common fallbacks
    for fb in ["en", "en-US", "en-GB", "en-IN"]:
        if fb not in expanded:
            expanded.append(fb)
    return expanded

def _convert_transcript_to_dicts(transcript_list) -> List[dict]:
    """Convert FetchedTranscriptSnippet objects to dicts for backwards compatibility."""
    result = []
    for item in transcript_list:
        # Handle both new FetchedTranscriptSnippet objects and old dicts
        if hasattr(item, 'text'):
            result.append({
                "text": item.text,
                "start": item.start,
                "duration": item.duration,
            })
        elif isinstance(item, dict):
            result.append(item)
        else:
            # Fallback: try to convert to dict
            result.append(dict(item))
    return result


def try_youtube_transcript_api(video_id: str, langs: List[str]) -> Tuple[Optional[List[dict]], Optional[str]]:
    try:
        # youtube-transcript-api v1.2+ requires instantiation
        ytt = YouTubeTranscriptApi()
        listing = ytt.list(video_id)
    except (TranscriptsDisabled, NoTranscriptFound, VideoUnavailable):
        return None, None
    except Exception:
        return None, None

    for lang in prefer_language_candidates(langs):
        try:
            tr = listing.find_manually_created_transcript([lang])
            return _convert_transcript_to_dicts(tr.fetch()), tr.language_code
        except Exception:
            pass
        try:
            tr = listing.find_generated_transcript([lang])
            return _convert_transcript_to_dicts(tr.fetch()), tr.language_code
        except Exception:
            pass

    # as a last resort, try translatable
    for tr in listing:
        try:
            if tr.is_translatable:
                for lang in prefer_language_candidates(langs):
                    try:
                        return _convert_transcript_to_dicts(tr.translate(lang).fetch()), lang
                    except Exception:
                        continue
        except Exception:
            continue

    try:
        first = next(iter(listing))
        return _convert_transcript_to_dicts(first.fetch()), first.language_code
    except Exception:
        return None, None

def try_yt_dlp_captions(video_id: str, langs: List[str]) -> Tuple[Optional[str], Optional[str]]:
    tempdir = tempfile.mkdtemp(prefix="ytcapt_")
    outtmpl = os.path.join(tempdir, "%(id)s.%(ext)s")
    ydl_opts = {
        "skip_download": True,
        "writesubtitles": True,
        "writeautomaticsub": True,
        "subtitleslangs": prefer_language_candidates(langs),
        "subtitlesformat": "vtt",
        "outtmpl": outtmpl,
        "quiet": True,
        "no_warnings": True,
    }
    url = f"https://www.youtube.com/watch?v={video_id}"
    with YoutubeDL(ydl_opts) as ydl:
        try:
            ydl.extract_info(url, download=True)
        except Exception:
            return None, None

    vtts = [os.path.join(tempdir, f) for f in os.listdir(tempdir) if f.endswith(".vtt")]
    if not vtts:
        return None, None

    prefs = prefer_language_candidates(langs)
    chosen = None; chosen_lang = None
    for lang in prefs:
        for p in vtts:
            if re.search(rf"\.{re.escape(lang)}\.vtt$", os.path.basename(p)):
                chosen, chosen_lang = p, lang
                break
        if chosen:
            break
    if not chosen:
        chosen = vtts[0]
        m = re.search(r"\.([a-zA-Z-]{2,})\.vtt$", os.path.basename(chosen))
        chosen_lang = m.group(1) if m else None
    return chosen, chosen_lang


# ---------------------------------------------------------------------
# VTT parsing and merging (for yt-dlp captions)
# ---------------------------------------------------------------------
def parse_vtt_timestamp(ts: str) -> float:
    parts = ts.split(":")
    if len(parts) == 3:
        h, m, s = parts
    elif len(parts) == 2:
        h = "0"; m, s = parts
    else:
        return 0.0
    if "." in s:
        sec, ms = s.split("."); ms = int(ms.ljust(3, "0")[:3])
    else:
        sec, ms = s, 0
    return int(h) * 3600 + int(m) * 60 + int(sec) + ms / 1000.0

def load_vtt_to_segments(vtt_path: str) -> List[dict]:
    with open(vtt_path, "r", encoding="utf-8", errors="ignore") as f:
        lines = [ln.rstrip("\n") for ln in f]

    segs: List[dict] = []
    i = 0; n = len(lines)
    while i < n:
        line = lines[i].strip(); i += 1
        if not line or line.upper() == "WEBVTT":
            continue
        # optional cue index
        if re.match(r"^\d+\s*$", line):
            if i < n:
                line = lines[i].strip(); i += 1
        if "-->" in line:
            times = line.split("-->")
            if len(times) != 2:
                while i < n and lines[i].strip():
                    i += 1
                continue
            start_s = parse_vtt_timestamp(times[0].strip())
            end_s   = parse_vtt_timestamp(times[1].strip())
            cue = []
            while i < n and lines[i].strip() != "":
                cue.append(lines[i]); i += 1
            while i < n and lines[i].strip() == "":
                i += 1
            text_raw = " ".join(cue)
            text_clean = strip_inline_tags(text_raw)
            if text_clean:
                segs.append({"start": start_s, "duration": max(0.0, end_s - start_s), "text": text_clean})
    return segs

def dedupe_and_merge_segments(segments: List[dict]) -> List[dict]:
    out: List[dict] = []
    for seg in segments:
        t = (seg.get("text") or "").strip()
        if not t:
            continue
        norm = normalize_for_compare(t)
        if not norm:
            continue

        if out:
            last = out[-1]
            last_norm = last.get("_norm")
            if norm == last_norm:
                # merge consecutive identicals
                last_end = last["start"] + last["duration"]
                new_end  = seg["start"] + seg["duration"]
                if seg["start"] <= last_end + 0.2:
                    last["duration"] = max(last["duration"], new_end - last["start"])
                continue
            if t.lower() == last["text"].lower() and seg["start"] <= (last["start"] + last["duration"] + 0.5):
                # near-dupe contiguous lowercased text
                last_end = last["start"] + last["duration"]
                new_end  = seg["start"] + seg["duration"]
                last["duration"] = max(last["duration"], new_end - last["start"])
                continue

        seg = dict(seg)
        seg["_norm"] = norm
        out.append(seg)

    for s in out:
        s.pop("_norm", None)
    return out


# ---------------------------------------------------------------------
# Final paragraph render
# ---------------------------------------------------------------------
def render_paragraph(transcript: List[dict]) -> str:
    chunks = [seg["text"].strip() for seg in transcript if seg.get("text")]
    text = smart_sentence_join(chunks)
    # final pass to squash rolling echoes across cue boundaries
    return compact_repetitions(text) + "\n"


# ---------------------------------------------------------------------
# Optional Whisper fallback
# ---------------------------------------------------------------------
def transcribe_with_whisper(video_id: str, lang_hint: Optional[str] = None) -> str:
    try:
        import whisper  # pip install openai-whisper; requires ffmpeg
    except Exception as e:
        raise HTTPException(
            501,
            f"Whisper not available ({e}). Install with `pip install openai-whisper` and ensure ffmpeg is installed."
        )

    tmp = tempfile.mkdtemp(prefix="whisp_")
    url = f"https://www.youtube.com/watch?v={video_id}"
    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": os.path.join(tmp, "%(id)s.%(ext)s"),
        "quiet": True, "no_warnings": True,
        "postprocessors": [
            {"key": "FFmpegExtractAudio", "preferredcodec": "mp3", "preferredquality": "192"}
        ],
    }
    with YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        base = ydl.prepare_filename(info)
        audio_path = os.path.splitext(base)[0] + ".mp3"
        if not os.path.exists(audio_path):
            audio_path = base

    model = whisper.load_model("small")
    kw = {}
    if lang_hint:
        kw["language"] = lang_hint.split("-")[0]
    result = model.transcribe(audio_path, **kw)
    text = (result.get("text") or "").strip()
    return compact_repetitions(text)

#how to use use this
# from yt_transcript import router, fetch_transcript_paragraph
# app = FastAPI()
# app.include_router(router, prefix="/api")
# Or call from your own endpoints:
# text = fetch_transcript_paragraph("https://www.youtube.com/watch?v=dQw4w9WgXcQ", lang="en")