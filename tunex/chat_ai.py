"""
TuNe AI Chat Router - Standalone Module

This module provides a reusable FastAPI router for the TuNe AI chatbot functionality.
It can be used independently or mounted into any FastAPI application.

Features:
- OpenAI-powered conversational AI
- Context-aware responses (page, URL)
- Fallback responses when AI is unavailable
- Platform-specific guidance for TuNe X

Usage:
    # Option 1: Mount into existing FastAPI app
    from fastapi import FastAPI
    from chat_ai import router
    
    app = FastAPI()
    app.include_router(router, prefix="/api/chat", tags=["chat"])
    
    # Option 2: Run as standalone service
    # uvicorn chat_ai:router --reload

Environment Variables:
    OPENAI_API_KEY - OpenAI API key (optional, falls back to hardcoded responses)
    OPENAI_MODEL - Model name (default: "gpt-4o-mini")

Endpoints:
    POST /chat - Send chat message and receive AI response
        Request: {"messages": [...], "context": {"page": "...", "url": "..."}}
        Response: {"message": {"role": "assistant", "content": "..."}}
"""

from typing import List, Optional, Dict, Any
import os
import json

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field

# Optional OpenAI client
_openai_client = None
try:
    from openai import OpenAI  # type: ignore
    if os.getenv("OPENAI_API_KEY"):
        _openai_client = OpenAI()
except Exception:
    _openai_client = None

router = APIRouter()


class ChatMessage(BaseModel):
    role: str  # "system" | "user" | "assistant"
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(default_factory=list)
    context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    message: ChatMessage


SYSTEM_PROMPT = (
    "You are TuNe AI, a concise, friendly assistant for the TuNe X platform. "
    "Help users discover projects, improve profiles, and understand application flows. "
    "Keep responses short and actionable. If asked about account-specific data, remind them to check the app UI."
)


def _extract_text(resp: Any) -> Optional[str]:
    if not resp:
        return None
    # Try Responses API shape
    try:
        out = getattr(resp, "output", None) or []
        for item in out:
            content = item.get("content") if isinstance(item, dict) else None
            if isinstance(content, list):
                for block in content:
                    if isinstance(block, dict) and block.get("type") in ("output_text", "text"):
                        t = block.get("text")
                        if t:
                            return t
    except Exception:
        pass
    # Try choices[].message.content (chat.completions)
    try:
        choices = getattr(resp, "choices", None) or []
        if choices:
            msg = choices[0].get("message") if isinstance(choices[0], dict) else None
            if msg:
                c = msg.get("content")
                if isinstance(c, str):
                    return c
    except Exception:
        pass
    # Fallback
    txt = getattr(resp, "output_text", None)
    return txt if isinstance(txt, str) else None


def _chat_with_openai(user_messages: List[ChatMessage]) -> str:
    if not _openai_client:
        raise RuntimeError("OpenAI client not available")

    # Prefer Responses API if available
    try:
        resp = _openai_client.responses.create(  # type: ignore[attr-defined]
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            input=[
                {"role": "system", "content": SYSTEM_PROMPT},
                *[m.dict() for m in user_messages],
            ],
        )
        text = _extract_text(resp)
        if text:
            return text.strip()
    except Exception:
        pass

    # Fallback to chat.completions
    try:
        chat = _openai_client.chat.completions.create(  # type: ignore[attr-defined]
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=[{"role": "system", "content": SYSTEM_PROMPT}] + [m.dict() for m in user_messages],
            temperature=0.3,
        )
        text = _extract_text(chat)
        if text:
            return text.strip()
    except Exception as exc:
        raise HTTPException(500, f"AI provider error: {exc}")

    return "I'm having trouble responding right now. Please try again later."


def _fallback_reply(user_messages: List[ChatMessage], context: Optional[Dict[str, Any]]) -> str:
    last = ""
    for m in reversed(user_messages):
        if m.role == "user" and m.content:
            last = m.content.strip()
            break
    page = context.get("page") if isinstance(context, dict) else None
    if not last:
        return "Hi! I’m TuNe AI. Ask me about projects, requests, or your profile."
    if "apply" in last.lower():
        return "To apply: open a project with open roles and hit ‘I’m Interested’. Your request becomes Pending. The owner can Accept or Reject."
    if "accept" in last.lower() or "accepted" in last.lower():
        return "When accepted, you’ll see an ‘Accepted — congratulations!’ banner and confetti on the project page."
    hint = f" (page: {page})" if page else ""
    return f"Here’s a quick tip{hint}: keep your profile headline and technologies clear to improve matches."


@router.post("/chat", response_model=ChatResponse)
def chat(body: ChatRequest):
    msgs = body.messages or []
    trimmed = msgs[-12:]  # limit context

    # Ensure at least a user message
    if not trimmed:
        trimmed = [ChatMessage(role="user", content="Hello")]  # type: ignore

    # Try OpenAI, else fallback
    text: str
    if _openai_client:
        try:
            text = _chat_with_openai(trimmed)
        except Exception:
            text = _fallback_reply(trimmed, body.context)
    else:
        text = _fallback_reply(trimmed, body.context)

    return ChatResponse(message=ChatMessage(role="assistant", content=text))
