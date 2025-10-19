import os
import re
import html
import unicodedata
import tempfile
from typing import List, Optional, Tuple

from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import FileResponse, JSONResponse, PlainTextResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl

import regex as rx  # supports \p{L}
from youtube_transcript_api import (
    YouTubeTranscriptApi,
    TranscriptsDisabled,
    NoTranscriptFound,
    VideoUnavailable,
)
from yt_dlp import YoutubeDL

# ------------------------------------------------------------------------------
# App
# ------------------------------------------------------------------------------
app = FastAPI(title="YouTube Transcript Cleaner API", version="1.2.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

# ------------------------------------------------------------------------------
# Helpers: ID / timestamps
# ------------------------------------------------------------------------------
YOUTUBE_ID_PATTERNS = [
    r"(?:v=|/v/|/embed/|/shorts/|youtu\.be/)([A-Za-z0-9_-]{11})",
    r"^([A-Za-z0-9_-]{11})$",
]

def extract_video_id(url_or_id: str) -> str:
    for pat in YOUTUBE_ID_PATTERNS:
        m = re.search(pat, url_or_id)
        if m: return m.group(1)
    token = url_or_id.strip()
    if re.fullmatch(r"[A-Za-z0-9_-]{11}", token):
        return token
    raise HTTPException(400, "Could not parse YouTube video ID from the provided URL.")

def sec_to_timestamp_srt(t: float) -> str:
    h = int(t // 3600); m = int((t % 3600) // 60); s = int(t % 60)
    ms = int(round((t - int(t)) * 1000))
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

def sec_to_timestamp_vtt(t: float) -> str:
    h = int(t // 3600); m = int((t % 3600) // 60); s = int(t % 60)
    ms = int(round((t - int(t)) * 1000))
    return f"{h:02d}:{m:02d}:{s:02d}.{ms:03d}"

# ------------------------------------------------------------------------------
# Cleaning regexes & utilities
# ------------------------------------------------------------------------------
TAG_TS_RE      = rx.compile(r"<\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?>", flags=rx.I)
TAG_C_OPEN_RE  = rx.compile(r"<c(?:\.[^>]*)?>", flags=rx.I)
TAG_C_CLOSE_RE = rx.compile(r"</c>", flags=rx.I)
BRACKET_NOISE_RE = rx.compile(r"\[(?:music|applause|__|noise|silence)\]", flags=rx.I)
WS_RE          = rx.compile(r"[ \t\u00A0]+")

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

# ------------------ NEW: robust de-echo / repeat compactor --------------------
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

def compact_repetitions(text: str,
                        max_ngram: int = 12,
                        min_chars_per_span: int = 4) -> str:
    """
    Removes consecutive duplicated spans like:
    'hello everyone welcome ... hello everyone welcome ...'
    Works token-wise, preferring longest repeated spans up to max_ngram.
    """
    if not text or len(text) < 2:
        return text

    # quick word-level stutter fix: 'the the', 'and and'
    text = rx.sub(r"\b(\p{L}+)\s+\1\b", r"\1", text, flags=rx.IGNORECASE)

    toks = _tokens(text)
    i = 0
    out: List[str] = []

    while i < len(toks):
        # try largest n first
        matched = False
        max_n = min(max_ngram, (len(toks) - i) // 2)
        for n in range(max_n, 0, -1):
            a = toks[i:i+n]
            b = toks[i+n:i+2*n]
            if not a or not b: 
                continue
            if a == b:
                # ensure span has enough "real" characters (avoid removing tiny repeats like ", ,")
                span_txt = _untokenize(a)
                if len(rx.sub(r"\s+", "", span_txt)) >= min_chars_per_span:
                    # skip the second occurrence (and any further consecutive duplicates)
                    j = i + n
                    while j + n <= len(toks) and toks[j:j+n] == a:
                        j += n
                    # keep one copy
                    out.extend(a)
                    i = j
                    matched = True
                    break
        if not matched:
            out.append(toks[i])
            i += 1

    # fix double punctuation/spacing like '..', ' ,', etc.
    s = _untokenize(out)
    s = rx.sub(r"\s+([.,!?;:])", r" \1", s)
    s = rx.sub(r"([(\[{])\s+", r"\1", s)
    s = rx.sub(r"\s+([)\]}])", r"\1", s)
    s = rx.sub(r"\s{2,}", " ", s).strip()
    return s

def prefer_language_candidates(preferred_langs: List[str]) -> List[str]:
    expanded: List[str] = []
    for lang in preferred_langs:
        expanded.append(lang)
        if "-" in lang:
            base = lang.split("-")[0]
            if base not in expanded:
                expanded.append(base)
    for fb in ["en", "en-US", "en-GB", "en-IN"]:
        if fb not in expanded:
            expanded.append(fb)
    return expanded

# ------------------------------------------------------------------------------
# Sources: official API, yt-dlp
# ------------------------------------------------------------------------------
def try_youtube_transcript_api(video_id: str, langs: List[str]) -> Tuple[Optional[List[dict]], Optional[str]]:
    try:
        listing = YouTubeTranscriptApi.list_transcripts(video_id)
    except (TranscriptsDisabled, NoTranscriptFound, VideoUnavailable):
        return None, None
    except Exception:
        return None, None

    for lang in prefer_language_candidates(langs):
        try:
            tr = listing.find_manually_created_transcript([lang])
            return tr.fetch(), tr.language_code
        except Exception:
            pass
        try:
            tr = listing.find_generated_transcript([lang])
            return tr.fetch(), tr.language_code
        except Exception:
            pass

    for tr in listing:
        try:
            if tr.is_translatable:
                for lang in prefer_language_candidates(langs):
                    try:
                        return tr.translate(lang).fetch(), lang
                    except Exception:
                        continue
        except Exception:
            continue

    try:
        first = next(iter(listing))
        return first.fetch(), first.language_code
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
        if chosen: break
    if not chosen:
        chosen = vtts[0]
        m = re.search(r"\.([a-zA-Z-]{2,})\.vtt$", os.path.basename(chosen))
        chosen_lang = m.group(1) if m else None
    return chosen, chosen_lang

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
    return int(h)*3600 + int(m)*60 + int(sec) + ms/1000.0

def load_vtt_to_segments(vtt_path: str) -> List[dict]:
    with open(vtt_path, "r", encoding="utf-8", errors="ignore") as f:
        lines = [ln.rstrip("\n") for ln in f]

    segs: List[dict] = []
    i = 0; n = len(lines)
    while i < n:
        line = lines[i].strip(); i += 1
        if not line or line.upper() == "WEBVTT": continue
        if re.match(r"^\d+\s*$", line):
            if i < n: line = lines[i].strip(); i += 1
        if "-->" in line:
            times = line.split("-->")
            if len(times) != 2:
                while i < n and lines[i].strip(): i += 1
                continue
            start_s = parse_vtt_timestamp(times[0].strip())
            end_s   = parse_vtt_timestamp(times[1].strip())
            cue = []
            while i < n and lines[i].strip() != "":
                cue.append(lines[i]); i += 1
            while i < n and lines[i].strip() == "": i += 1
            text_raw = " ".join(cue)
            text_clean = strip_inline_tags(text_raw)
            if text_clean:
                segs.append({"start": start_s, "duration": max(0.0, end_s-start_s), "text": text_clean})
    return segs

def dedupe_and_merge_segments(segments: List[dict]) -> List[dict]:
    out: List[dict] = []
    for seg in segments:
        t = (seg.get("text") or "").strip()
        if not t: continue
        norm = normalize_for_compare(t)
        if not norm: continue

        if out:
            last = out[-1]
            last_norm = last.get("_norm")
            if norm == last_norm:
                last_end = last["start"] + last["duration"]
                new_end  = seg["start"] + seg["duration"]
                if seg["start"] <= last_end + 0.2:
                    last["duration"] = max(last["duration"], new_end - last["start"])
                continue
            if t.lower() == last["text"].lower() and seg["start"] <= (last["start"] + last["duration"] + 0.5):
                last_end = last["start"] + last["duration"]
                new_end  = seg["start"] + seg["duration"]
                last["duration"] = max(last["duration"], new_end - last["start"])
                continue

        seg = dict(seg)
        seg["_norm"] = norm
        out.append(seg)

    for s in out: s.pop("_norm", None)
    return out

def merge_lines(transcript: List[dict]) -> List[dict]:
    return transcript

def render_txt(transcript: List[dict]) -> str:
    chunks = [seg["text"].strip() for seg in transcript if seg.get("text")]
    text = smart_sentence_join(chunks)
    # EXTRA safety pass for long TXT to remove any remaining rolling echoes
    return compact_repetitions(text) + "\n"

def render_srt(transcript: List[dict]) -> str:
    lines = []; idx = 1
    for seg in transcript:
        text = (seg.get("text") or "").strip()
        if not text: continue
        # compact inside each cue as well
        text = compact_repetitions(text)
        start = float(seg.get("start", 0.0))
        dur   = float(seg.get("duration", 0.0))
        end   = start + dur
        lines.append(str(idx)); idx += 1
        lines.append(f"{sec_to_timestamp_srt(start)} --> {sec_to_timestamp_srt(end)}")
        lines.append(text); lines.append("")
    return "\n".join(lines).strip() + "\n"

def render_vtt(transcript: List[dict]) -> str:
    out = ["WEBVTT", ""]
    for seg in transcript:
        text = (seg.get("text") or "").strip()
        if not text: continue
        text = compact_repetitions(text)
        start = float(seg.get("start", 0.0))
        dur   = float(seg.get("duration", 0.0))
        end   = start + dur
        out.append(f"{sec_to_timestamp_vtt(start)} --> {sec_to_timestamp_vtt(end)}")
        out.append(text); out.append("")
    return "\n".join(out).strip() + "\n"

def fetch_title(video_id: str) -> Optional[str]:
    ydl_opts = {"quiet": True, "skip_download": True}
    url = f"https://www.youtube.com/watch?v={video_id}"
    try:
        with YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
        return info.get("title")
    except Exception:
        return None

def safe_filename(s: str) -> str:
    s = re.sub(r"[^\w\-. ]", "_", s).strip().strip("._")
    return s or "transcript"

# ------------------------------------------------------------------------------
# Optional Whisper fallback
# ------------------------------------------------------------------------------
def transcribe_with_whisper(video_id: str, lang_hint: Optional[str] = None) -> str:
    try:
        import whisper
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
    if lang_hint: kw["language"] = lang_hint.split("-")[0]
    result = model.transcribe(audio_path, **kw)
    text = (result.get("text") or "").strip()
    # **Remove rolling repeats from Whisper output**
    return compact_repetitions(text)

# ------------------------------------------------------------------------------
# API models & routes
# ------------------------------------------------------------------------------
class TranscriptParams(BaseModel):
    url: HttpUrl
    lang: Optional[str] = "en"
    format: Optional[str] = "txt"         # txt | srt | vtt | json
    fallback_ytdlp: Optional[bool] = True
    clean: Optional[bool] = True
    use_whisper: Optional[bool] = False

@app.get("/health")
def health(): return {"status": "ok"}

@app.post("/transcript")
def post_transcript(params: TranscriptParams):
    return _handle_transcript(
        url=str(params.url),
        lang=params.lang or "en",
        fmt=params.format or "txt",
        fallback_ytdlp=bool(params.fallback_ytdlp),
        clean=bool(params.clean),
        use_whisper=bool(params.use_whisper),
    )

@app.get("/transcript")
def get_transcript(
    url: str = Query(..., description="YouTube video URL"),
    lang: str = Query("en"),
    format: str = Query("txt", alias="format"),
    fallback_ytdlp: bool = Query(True),
    clean: bool = Query(True),
    use_whisper: bool = Query(False),
):
    return _handle_transcript(url, lang, format, fallback_ytdlp, clean, use_whisper)

def _handle_transcript(
    url: str, lang: str, fmt: str,
    fallback_ytdlp: bool, clean: bool, use_whisper: bool,
):
    video_id = extract_video_id(url)
    preferred = [lang] if lang else ["en"]

    transcript: Optional[List[dict]] = None
    lang_code: Optional[str] = None
    temp_vtt_file: Optional[str] = None

    # 1) Official transcript
    transcript, lang_code = try_youtube_transcript_api(video_id, preferred)

    # 2) yt-dlp auto-captions
    if transcript is None and fallback_ytdlp:
        vtt_path, ytdlp_lang = try_yt_dlp_captions(video_id, preferred)
        if vtt_path:
            temp_vtt_file = vtt_path
            transcript = load_vtt_to_segments(vtt_path)
            lang_code = ytdlp_lang

    # 3) Whisper fallback
    if transcript is None and use_whisper:
        text = transcribe_with_whisper(video_id, lang_hint=lang)
        if not text:
            raise HTTPException(404, "Transcription failed (Whisper returned empty text).")
        transcript = [{"start": 0.0, "duration": 0.0, "text": text}]
        lang_code = lang

    if transcript is None:
        raise HTTPException(404, "No transcript/captions available for this video (or they are disabled).")

    # Clean & de-dup
    if clean:
        cleaned = []
        for seg in transcript:
            text = strip_inline_tags(seg.get("text", ""))
            if not text: continue
            # **also compact inside each cue to kill word-level repeats**
            text = compact_repetitions(text)
            cleaned.append({
                "start": float(seg.get("start", 0.0)),
                "duration": float(seg.get("duration", 0.0)),
                "text": text
            })
        transcript = dedupe_and_merge_segments(cleaned)
    else:
        transcript = [
            {"start": float(seg.get("start", 0.0)),
             "duration": float(seg.get("duration", 0.0)),
             "text": seg.get("text", "")}
            for seg in (transcript or [])
        ]

    transcript = merge_lines(transcript)
    title = fetch_title(video_id) or f"youtube_{video_id}"
    base  = safe_filename(title)
    fmt   = (fmt or "txt").lower()

    if fmt == "json":
        return JSONResponse({"video_id": video_id, "language": lang_code, "title": title, "segments": transcript})

    if fmt == "txt":
        content = render_txt(transcript)
        return PlainTextResponse(content, media_type="text/plain; charset=utf-8",
                                 headers={"Content-Disposition": f'attachment; filename="{base}.txt"'})

    if fmt == "srt":
        content = render_srt(transcript)
        return PlainTextResponse(content, media_type="application/x-subrip; charset=utf-8",
                                 headers={"Content-Disposition": f'attachment; filename="{base}.srt"'})

    if fmt == "vtt":
        # If you wanted truly raw VTT from yt-dlp, call with clean=false
        content = render_vtt(transcript)
        return PlainTextResponse(content, media_type="text/vtt; charset=utf-8",
                                 headers={"Content-Disposition": f'attachment; filename="{base}.vtt"'})

    raise HTTPException(400, "Unsupported format. Use one of: txt | srt | vtt | json")
