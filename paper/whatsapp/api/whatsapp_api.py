"""
WhatsApp REST API — FastAPI proxy to Baileys Express server.

Usage:
    1. Start the Baileys server:  npm run example  (runs on port 3000)
    2. Start this API:            uvicorn api.whatsapp_api:app --reload --port 8000

All endpoints proxy to the Express backend at BAILEYS_BASE_URL.
"""

import os
from typing import Optional

import httpx
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
BAILEYS_BASE_URL = os.getenv("BAILEYS_BASE_URL", "http://localhost:3000")

# ---------------------------------------------------------------------------
# FastAPI App
# ---------------------------------------------------------------------------
app = FastAPI(
    title="WhatsApp REST API",
    description="REST API for sending WhatsApp messages via Baileys",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Shared HTTP client
# ---------------------------------------------------------------------------
http_client = httpx.AsyncClient(base_url=BAILEYS_BASE_URL, timeout=30.0)


# ---------------------------------------------------------------------------
# Pydantic Models
# ---------------------------------------------------------------------------

class TextMessage(BaseModel):
    jid: str = Field(..., description="Recipient JID, e.g. 919876543210@s.whatsapp.net")
    text: str = Field(..., description="Message text content")


class PollMessage(BaseModel):
    jid: str
    name: str = Field(..., description="Poll question")
    options: list[str] = Field(..., description="Poll options (min 2)")


class ListMessage(BaseModel):
    jid: str
    title: str = Field(..., description="List title")
    description: Optional[str] = Field(None, description="List description")
    buttonText: str = Field(..., description="Button text shown to user")
    options: list[str] = Field(..., description="List options")


class LocationMessage(BaseModel):
    jid: str
    latitude: float
    longitude: float
    name: Optional[str] = None
    address: Optional[str] = None


class ContactMessage(BaseModel):
    jid: str
    contactName: str = Field(..., description="Display name of the contact")
    contactNumber: str = Field(..., description="Phone number with country code, e.g. 919876543210")


class ReactionMessage(BaseModel):
    jid: str
    messageId: str = Field(..., description="ID of the message to react to")
    emoji: str = Field(..., description="Reaction emoji, e.g. 👍")


class ButtonReplyMessage(BaseModel):
    jid: str
    displayText: str
    id: str
    index: int = 0
    type: str = "plain"


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

async def _proxy_json(endpoint: str, payload: dict) -> dict:
    """POST JSON to the Express backend and return the parsed response."""
    try:
        resp = await http_client.post(endpoint, json=payload)
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="Baileys server is not reachable. Is it running on port 3000?")
    if resp.status_code != 200:
        detail = resp.json().get("error", resp.text) if resp.headers.get("content-type", "").startswith("application/json") else resp.text
        raise HTTPException(status_code=resp.status_code, detail=detail)
    return resp.json()


async def _proxy_file(endpoint: str, field_name: str, file: UploadFile, extra_fields: dict) -> dict:
    """POST a multipart file upload to the Express backend."""
    try:
        files = {field_name: (file.filename, await file.read(), file.content_type)}
        data = {k: v for k, v in extra_fields.items() if v is not None}
        resp = await http_client.post(endpoint, files=files, data=data)
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="Baileys server is not reachable. Is it running on port 3000?")
    if resp.status_code != 200:
        detail = resp.json().get("error", resp.text) if resp.headers.get("content-type", "").startswith("application/json") else resp.text
        raise HTTPException(status_code=resp.status_code, detail=detail)
    return resp.json()


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/", tags=["Health"])
async def health_check():
    """Health check — confirms the FastAPI server is running."""
    return {"status": "ok", "service": "WhatsApp REST API"}


@app.get("/status", tags=["Health"])
async def connection_status():
    """Check if the Baileys WhatsApp socket is connected."""
    try:
        resp = await http_client.get("/api/status")
        return resp.json()
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="Baileys server is not reachable")


# ── Text ──────────────────────────────────────────────────────────────────

@app.post("/send/text", tags=["Messages"])
async def send_text(msg: TextMessage):
    """Send a plain text message."""
    return await _proxy_json("/api/send-message", msg.model_dump())


# ── Image ─────────────────────────────────────────────────────────────────

@app.post("/send/image", tags=["Messages"])
async def send_image(
    jid: str = Form(...),
    caption: Optional[str] = Form(None),
    image: UploadFile = File(...),
):
    """Send an image with an optional caption."""
    return await _proxy_file("/api/send-image", "image", image, {"jid": jid, "caption": caption or ""})


# ── Video ─────────────────────────────────────────────────────────────────

@app.post("/send/video", tags=["Messages"])
async def send_video(
    jid: str = Form(...),
    caption: Optional[str] = Form(None),
    video: UploadFile = File(...),
):
    """Send a video with an optional caption."""
    return await _proxy_file("/api/send-video", "video", video, {"jid": jid, "caption": caption or ""})


# ── Audio ─────────────────────────────────────────────────────────────────

@app.post("/send/audio", tags=["Messages"])
async def send_audio(
    jid: str = Form(...),
    ptt: Optional[str] = Form("false", description="Set to 'true' for voice note"),
    audio: UploadFile = File(...),
):
    """Send an audio file or voice note."""
    return await _proxy_file("/api/send-audio", "audio", audio, {"jid": jid, "ptt": ptt or "false"})


# ── Document ──────────────────────────────────────────────────────────────

@app.post("/send/document", tags=["Messages"])
async def send_document(
    jid: str = Form(...),
    caption: Optional[str] = Form(None),
    fileName: Optional[str] = Form(None),
    mimetype: Optional[str] = Form(None),
    document: UploadFile = File(...),
):
    """Send a document (PDF, DOCX, etc.)."""
    return await _proxy_file("/api/send-document", "document", document, {
        "jid": jid,
        "caption": caption or "",
        "fileName": fileName,
        "mimetype": mimetype,
    })


# ── Sticker ───────────────────────────────────────────────────────────────

@app.post("/send/sticker", tags=["Messages"])
async def send_sticker(
    jid: str = Form(...),
    sticker: UploadFile = File(...),
):
    """Send a sticker (WebP image)."""
    return await _proxy_file("/api/send-sticker", "sticker", sticker, {"jid": jid})


# ── Poll ──────────────────────────────────────────────────────────────────

@app.post("/send/poll", tags=["Messages"])
async def send_poll(msg: PollMessage):
    """Send a poll with multiple options."""
    return await _proxy_json("/api/send-poll", msg.model_dump())


# ── List ──────────────────────────────────────────────────────────────────

@app.post("/send/list", tags=["Messages"])
async def send_list(msg: ListMessage):
    """Send an interactive list message."""
    return await _proxy_json("/api/send-list", msg.model_dump())


# ── Location ──────────────────────────────────────────────────────────────

@app.post("/send/location", tags=["Messages"])
async def send_location(msg: LocationMessage):
    """Send a GPS location pin."""
    return await _proxy_json("/api/send-location", msg.model_dump())


# ── Contact ───────────────────────────────────────────────────────────────

@app.post("/send/contact", tags=["Messages"])
async def send_contact(msg: ContactMessage):
    """Send a contact card (vCard)."""
    return await _proxy_json("/api/send-contact", msg.model_dump())


# ── Reaction ──────────────────────────────────────────────────────────────

@app.post("/send/reaction", tags=["Messages"])
async def send_reaction(msg: ReactionMessage):
    """React to a message with an emoji."""
    return await _proxy_json("/api/send-reaction", msg.model_dump())


# ── Button Reply ──────────────────────────────────────────────────────────

@app.post("/send/button-reply", tags=["Messages"])
async def send_button_reply(msg: ButtonReplyMessage):
    """Send a button reply."""
    return await _proxy_json("/api/send-button-reply", msg.model_dump())


# ---------------------------------------------------------------------------
# Startup / Shutdown
# ---------------------------------------------------------------------------

@app.on_event("shutdown")
async def shutdown():
    await http_client.aclose()
