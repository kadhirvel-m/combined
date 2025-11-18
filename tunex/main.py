import logging
import os
import time
from datetime import datetime, timedelta
from typing import Optional, List
from urllib.parse import quote

from fastapi import APIRouter, Depends, FastAPI, File, Form, HTTPException, Request, Response, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, Field
from supabase import Client, create_client
from dotenv import load_dotenv
import json
import uuid
import random
from typing import Any, Dict

import re
import requests
import jwt
from serpapi import GoogleSearch
from typing import Iterable, Set

load_dotenv()

# Optional OpenAI client (AI question generation and grading)
openai_client = None
try:
    from openai import OpenAI  # type: ignore

    api_key = os.getenv("OPENAI_API_KEY")
    if api_key:
        openai_client = OpenAI(api_key=api_key)
except Exception:
    openai_client = None

"""
Inline TuNe AI chat router (moved from chat_ai.py)
This ensures the chatbot starts with main.py without needing a separate import.
"""

class ChatMessage(BaseModel):
    role: str  # "system" | "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(default_factory=list)
    context: Optional[dict] = None


class ChatResponse(BaseModel):
    message: ChatMessage


SYSTEM_PROMPT = (
    "You are TuNe AI, the resident assistant for TuNe X — a student startup and project matchmaking platform. "
    "Guide users through discovering projects, applying to teams, managing requests, and improving profile credibility with skill verification labs. "
    "Respond in a warm, concise, actionable tone. Prefer concrete steps or links to in-product actions (e.g., Postings, Profile, Incoming Requests). "
    "Never invent private data; if the user asks for account-specific details, direct them to check the TuNe X UI. "
    "Use any provided page context to tailor the reply."
)


def _chat_ai_extract_text(resp: Any) -> Optional[str]:
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


def _chat_ai_context_prompt(context: Optional[dict]) -> Optional[str]:
    if not isinstance(context, dict):
        return None
    parts: List[str] = []
    page = context.get("page")
    if isinstance(page, str) and page.strip():
        parts.append(f"The user is interacting on the `{page.strip()}` page.")
    url = context.get("url")
    if isinstance(url, str) and url.strip():
        parts.append(f"Current URL: {url.strip()}.")
    if not parts:
        return None
    return "Context: " + " ".join(parts)


def _chat_ai_with_openai(user_messages: List[ChatMessage], context: Optional[dict] = None) -> str:
    if not openai_client:
        raise RuntimeError("OpenAI client not available")

    context_prompt = _chat_ai_context_prompt(context)
    chat_payload = [{"role": m.role, "content": m.content} for m in user_messages]
    system_messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    if context_prompt:
        system_messages.append({"role": "system", "content": context_prompt})

    # Prefer Responses API (corrected: use 'input' instead of 'messages')
    try:
        input_messages = [
            {"role": msg["role"], "content": msg["content"]}
            for msg in (system_messages + chat_payload)
        ]
        resp = openai_client.responses.create(  # type: ignore[attr-defined]
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            input=input_messages,
            max_output_tokens=400,
        )
        text = _chat_ai_extract_text(resp)
        if text:
            return text.strip()
    except Exception:
        logger.exception("OpenAI Responses call failed")

    # Fallback to chat.completions
    try:
        chat = openai_client.chat.completions.create(  # type: ignore[attr-defined]
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=system_messages + chat_payload,
            temperature=0.3,
        )
        text = _chat_ai_extract_text(chat)
        if text:
            return text.strip()
    except Exception:
        logger.exception("OpenAI chat.completions call failed")
        raise HTTPException(500, "AI provider error")

    return "I'm having trouble responding right now. Please try again later."


def _chat_ai_fallback_reply(user_messages: List[ChatMessage], context: Optional[dict]) -> str:
    last = ""
    for m in reversed(user_messages):
        if m.role == "user" and m.content:
            last = m.content.strip()
            break
    page = context.get("page") if isinstance(context, dict) else None
    if not last:
        return "Hi! I’m TuNe AI. Ask me about projects, requests, or your profile."
    low = last.lower()

    # Greetings / identity
    if any(g in low for g in ("hi", "hello", "hey")) or "who are you" in low or "what are you" in low:
        return "I’m TuNe AI — I can help with projects, requests, and profiles. Ask me anything."

    # Generic help / how it works
    if "help" in low or "how" in low or "what can you" in low:
        return "Browse projects, click ‘I’m Interested’ to apply, track Requests, and improve your profile with skill tests."

    # Applying / status
    if "apply" in low or "interested" in low:
        return "Open a project and hit ‘I’m Interested’. It creates a Pending request. Owners can Accept or Reject."
    if "status" in low or "applied" in low:
        return "Your apply button shows your state. Pending until the owner decides; Accepted shows a banner + confetti."

    # Owner actions / requests
    if "accept" in low or "accepted" in low:
        return "Owners accept from Incoming Requests or the Applicants list. Accepted shows a banner + confetti."
    if "reject" in low or "rejected" in low:
        return "Owners can Reject pending requests. Applicants see a Rejected status and the action buttons are hidden."
    if "request" in low or "incoming" in low or "applicant" in low:
        return "Go to Incoming Requests to review applicants per project; actions hide after a decision."

    # Profile / verification
    if "profile" in low or "verification" in low or "badge" in low:
        return "Use Profile in the navbar to edit details. Tech chips aren’t clickable; badges reflect verified skills."

    # Auth / sign in
    if "sign in" in low or "login" in low or "sign up" in low:
        return "Use the top-right avatar. When signed in, Sign in/Sign up hide and your avatar appears across pages."

    hint = f" (page: {page})" if page else ""
    return f"Here’s a quick tip{hint}: keep your profile headline and technologies clear to improve matches."


tune_ai_router = APIRouter()


@tune_ai_router.post("/chat", response_model=ChatResponse)
def tune_ai_chat(body: ChatRequest):
    msgs = body.messages or []
    trimmed = msgs[-12:]  # limit context
    if not trimmed:
        trimmed = [ChatMessage(role="user", content="Hello")]  # type: ignore

    if openai_client:
        try:
            text = _chat_ai_with_openai(trimmed, body.context)
        except Exception:
            text = _chat_ai_fallback_reply(trimmed, body.context)
    else:
        text = _chat_ai_fallback_reply(trimmed, body.context)

    return ChatResponse(message=ChatMessage(role="assistant", content=text))

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY", "")
if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("Missing SUPABASE_URL or SUPABASE_ANON_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
service_client: Optional[Client] = None
if SUPABASE_SERVICE_KEY and SUPABASE_SERVICE_KEY != SUPABASE_KEY:
    try:
        service_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    except Exception:
        service_client = None

logger = logging.getLogger("innovatex")
if not logger.handlers:
    logging.basicConfig(level=logging.INFO)

APP_DEBUG = os.getenv("APP_DEBUG", "false").lower() in ("1", "true", "yes")
if APP_DEBUG:
    logger.setLevel(logging.DEBUG)
    logger.debug("APP_DEBUG enabled")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount TuNe AI endpoints
app.include_router(tune_ai_router, prefix="/api/tune-ai", tags=["tune-ai"])

@app.middleware("http")
async def log_requests(request, call_next):
    start = time.time()
    response = await call_next(request)
    duration_ms = (time.time() - start) * 1000
    logger.info("REQ %s %s %.1fms", request.method, request.url.path, duration_ms)
    return response


STORAGE_BUCKET = (
    os.getenv("STORAGE_BUCKET")
    or os.getenv("SUPABASE_BUCKET")
    or "storage"
)
PROFILE_TABLE = os.getenv("PROFILE_TABLE") or os.getenv("SUPABASE_PROFILE_TABLE") or "profiles"
PROJECTS_TABLE = os.getenv("PROJECTS_TABLE") or os.getenv("SUPABASE_PROJECTS_TABLE") or "projects"

PROFILE_ASSET_FIELDS = {
    "profile_image": "profile_image_url",
    "resume": "resume_url",
}
ALLOWED_EXTENSIONS = {
    "profile_image": {".png", ".jpg", ".jpeg", ".webp", ".gif"},
    "resume": {".pdf", ".doc", ".docx"},
}
PROJECT_MEDIA_EXTENSIONS = {
    "cover": {".png", ".jpg", ".jpeg", ".webp", ".gif"},
    "gallery": {".png", ".jpg", ".jpeg", ".webp", ".gif", ".mp4", ".mov", ".webm"},
}


def _get_profile(uid: str):
    try:
        response = supabase.table(PROFILE_TABLE).select("*").eq("user_id", uid).single().execute()
        if APP_DEBUG:
            logger.debug("_get_profile uid=%s data=%s", uid, getattr(response, "data", None))
        return getattr(response, "data", None)
    except Exception:
        return None


def _save_profile_row(row: dict):
    uid = row["user_id"]
    existing = _get_profile(uid)
    try:
        if existing:
            supabase.table(PROFILE_TABLE).update(row).eq("user_id", uid).execute()
            if APP_DEBUG:
                logger.debug("profile updated uid=%s", uid)
        else:
            supabase.table(PROFILE_TABLE).insert(row).execute()
            if APP_DEBUG:
                logger.debug("profile inserted uid=%s", uid)
    except Exception as exc:
        logger.exception("Profile upsert failed")
        raise HTTPException(400, f"Profile save failed: {exc}")

    final = _get_profile(uid)
    if not final:
        raise HTTPException(500, "Profile row not persisted")
    return final


class SigninIn(BaseModel):
    email: EmailStr
    password: str


class SignupIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class ProfileIn(BaseModel):
    name: Optional[str] = None
    college: Optional[str] = None
    batch_start: Optional[int] = Field(None, ge=1900, le=2100)
    batch_end: Optional[int] = Field(None, ge=1900, le=2100)
    dob: Optional[str] = None  # ISO date string
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    github: Optional[str] = None
    linkedin: Optional[str] = None
    leetcode: Optional[str] = None
    profile_image_url: Optional[str] = None
    resume_url: Optional[str] = None
    project_info: Optional[str] = None
    publications: Optional[str] = None
    achievements: Optional[str] = None
    experience: Optional[str] = None
    specializations: Optional[str] = None
    technologies: Optional[str] = None
    headline: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    skills: Optional[str] = None
    certifications: Optional[str] = None
    languages: Optional[str] = None
    interests: Optional[str] = None
    portfolio_url: Optional[str] = None
    website: Optional[str] = None
    twitter: Optional[str] = None
    instagram: Optional[str] = None
    medium: Optional[str] = None
    verification_score: Optional[int] = Field(None, ge=0, le=100)


class ProfileOut(ProfileIn):
    user_id: str


class PublicProfileOut(BaseModel):
    user_id: str
    name: Optional[str] = None
    profile_image_url: Optional[str] = None


# ----------------- Projects models -----------------

class ProjectBasics(BaseModel):
    title: str
    tagline: str
    domains: List[str] = []
    description: str
    tech_stack: List[str] = []

class ProjectStatus(BaseModel):
    status: str
    start_date: Optional[str] = None  # ISO date
    end_date: Optional[str] = None
    milestones: List[str] = []

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
    members: List[str] = []
    roles_hiring: List[str] = []
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
    gallery_urls: List[str] = []
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


security = HTTPBearer(auto_error=False)

JWT_SECRET = (
    os.getenv("JWT_SECRET")
    or os.getenv("JWT_SECRET_KEY")
    or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    or os.getenv("SUPABASE_JWT_SECRET")
    or os.getenv("SUPABASE_ANON_KEY")
)
if not JWT_SECRET:
    raise RuntimeError("Missing JWT secret for token signing")

JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "30"))
REFRESH_TOKEN_COOKIE_NAME = os.getenv("REFRESH_TOKEN_COOKIE_NAME", "tunex_refresh_token")
REFRESH_COOKIE_SECURE = os.getenv("REFRESH_COOKIE_SECURE", "true").lower() in ("1", "true", "yes")
REFRESH_COOKIE_SAMESITE = os.getenv("REFRESH_COOKIE_SAMESITE", "lax")
_ACCESS_EXPIRE_DELTA = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
_REFRESH_EXPIRE_DELTA = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)


def _create_token(data: Dict[str, Any], expires_delta: timedelta, token_type: str) -> str:
    payload = data.copy()
    now = datetime.utcnow()
    payload.update({"exp": now + expires_delta, "iat": now, "type": token_type})
    encoded = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded.decode("utf-8") if isinstance(encoded, bytes) else encoded


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Generate a short-lived JWT access token."""
    return _create_token(data, expires_delta or _ACCESS_EXPIRE_DELTA, "access")


def create_refresh_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Generate a long-lived JWT refresh token."""
    return _create_token(data, expires_delta or _REFRESH_EXPIRE_DELTA, "refresh")


def _decode_token(token: str, expected_type: str, expired_msg: str, invalid_msg: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError as exc:
        raise HTTPException(401, expired_msg) from exc
    except jwt.InvalidTokenError as exc:
        raise HTTPException(401, invalid_msg) from exc
    if payload.get("type") != expected_type:
        raise HTTPException(401, invalid_msg)
    return payload


def decode_refresh_token(token: str) -> Dict[str, Any]:
    """Decode and validate a refresh token."""
    return _decode_token(token, "refresh", "Refresh token expired", "Invalid refresh token")


def decode_access_token(token: str) -> Dict[str, Any]:
    """Decode and validate an access token."""
    return _decode_token(token, "access", "Access token expired", "Invalid access token")


def _set_refresh_cookie(response: Response, token: str) -> None:
    max_age = int(_REFRESH_EXPIRE_DELTA.total_seconds())
    response.set_cookie(
        key=REFRESH_TOKEN_COOKIE_NAME,
        value=token,
        max_age=max_age,
        httponly=True,
        secure=REFRESH_COOKIE_SECURE,
        samesite=REFRESH_COOKIE_SAMESITE,
        path="/",
    )


def _clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(
        key=REFRESH_TOKEN_COOKIE_NAME,
        path="/",
        httponly=True,
        secure=REFRESH_COOKIE_SECURE,
        samesite=REFRESH_COOKIE_SAMESITE,
    )


# Skill Test models
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


# New: Skill verification summary model
class SkillVerificationOut(BaseModel):
    skill: str
    best_score: float
    attempts: int
    status: str
    updated_at: Optional[str] = None

# New: Project applications models
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
    status: str


def _project_row_to_out(row: dict) -> dict:
    if not row:
        raise HTTPException(500, "Project payload missing")

    def as_list(value):
        if isinstance(value, list):
            return value
        if value in (None, ""):
            return []
        return [value]

    basics = ProjectBasics(
        title=row.get("title") or "",
        tagline=row.get("tagline") or "",
        domains=as_list(row.get("domains")),
        description=row.get("description") or "",
        tech_stack=as_list(row.get("tech_stack")),
    )
    status = ProjectStatus(
        status=row.get("proj_status") or "",
        start_date=row.get("start_date"),
        end_date=row.get("end_date"),
        milestones=as_list(row.get("milestones")),
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
        members=as_list(row.get("team_members")),
        roles_hiring=as_list(row.get("roles_hiring")),
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
        id=row.get("id", ""),
        user_id=row.get("user_id", ""),
        cover_url=row.get("cover_url"),
        gallery_urls=as_list(row.get("gallery_urls")),
        created_at=row.get("created_at"),
        updated_at=row.get("updated_at"),
    )
    return project.dict()


def get_db_client() -> Client:
    return service_client or supabase


def _extract_openai_output_text(response: Any) -> Optional[str]:
    if not response:
        return None
    text = getattr(response, "output_text", None)
    if text:
        return text
    try:
        outputs = getattr(response, "output", None) or []
        for item in outputs:
            content = getattr(item, "content", None) or []
            for block in content:
                if block.get("type") == "output_text":
                    return block.get("text")
                value = block.get("text") if isinstance(block, dict) else None
                if value:
                    return value
    except Exception:
        pass
    return None


def _normalize_skill(skill: str) -> str:
    return (skill or "").strip()


def _fallback_language_for_skill(skill: str) -> str:
    skill_lower = skill.lower()
    if any(key in skill_lower for key in ("js", "javascript", "react", "node")):
        return "javascript"
    if any(key in skill_lower for key in ("java",)):
        return "java"
    if any(key in skill_lower for key in ("cpp", "c++")):
        return "cpp"
    if any(key in skill_lower for key in ("sql",)):
        return "sql"
    if any(key in skill_lower for key in ("go", "golang")):
        return "go"
    if any(key in skill_lower for key in ("rust",)):
        return "rust"
    return "python"


def _fallback_questions(skill: str) -> List[Dict[str, Any]]:
    language = _fallback_language_for_skill(skill)
    topic_snippet = skill or "this skill"
    skill_tokens = skill.split()
    skill_hint = (skill_tokens[0].lower() if skill_tokens else (skill or "skill").lower())

    # Generate 3 CEQs
    ceq_items: List[Dict[str, Any]] = []
    ceq_prompts = [
        f"Which statement best reflects a trustworthy approach when showcasing expertise in {topic_snippet}?",
        f"What is a good practice when learning and demonstrating {topic_snippet}?",
        f"Which of the following aligns with professional conduct in {topic_snippet}?",
    ]
    ceq_options_templates = [
        [
            f"{topic_snippet} encourages writing small, testable units of logic.",
            f"{topic_snippet} is only about memorizing syntax without practice.",
            f"{topic_snippet} means avoiding any collaboration with others.",
            f"{topic_snippet} requires ignoring documentation and community patterns.",
        ],
        [
            "Practice with projects and iterate using feedback.",
            "Focus on cramming definitions the night before.",
            "Avoid reading docs to save time.",
            "Copy solutions without attribution.",
        ],
        [
            "Cite sources and test your work with examples.",
            "Hide failures and avoid unit tests.",
            "Discourage peer reviews.",
            "Ship code without reading error messages.",
        ],
    ]
    ceq_list: List[Dict[str, Any]] = []
    for i in range(3):
        ceq_id = str(uuid.uuid4())
        opts = ceq_options_templates[i][:]
        random.shuffle(opts)
        correct = ceq_options_templates[i][0]
        correct_letter = "ABCD"[opts.index(correct)] if opts else "A"
        ceq_list.append(
            {
                "id": ceq_id,
                "kind": "ceq",
                "prompt": ceq_prompts[i],
                "options": [f"{letter}. {text}" for letter, text in zip("ABCD", opts)],
                "answer_key": {"type": "ceq", "correct_option": correct_letter},
            }
        )

    # Generate 2 coding tasks
    coding_id_1 = str(uuid.uuid4())
    coding_id_2 = str(uuid.uuid4())

    coding_prompt_1 = (
        f"Using {language}, write a function `validate_{skill.lower().replace(' ', '_')}` that takes a list of practice "
        "sessions (each session represented as a dictionary with keys `skill` and `minutes`) and returns the total "
        "minutes dedicated to the requested skill, ignoring case differences. Include at least one unit test or usage example in your answer."
    )
    coding_prompt_2 = (
        f"In {language}, implement a small utility `summarize_{skill.lower().replace(' ', '_')}_progress` that accepts a "
        "list of strings like 'Python: 30m' and returns a dictionary mapping skill -> total minutes (integers). "
        "Handle malformed entries gracefully and show a brief example of usage."
    )

    keywords_base = ["def" if language == "python" else "function", "return", skill_hint[:4]]
    keywords_1 = keywords_base + (["test"] if language == "python" else ["example"])  # nudge for validation context
    keywords_2 = keywords_base + ["parse", "minutes"]

    coding_list: List[Dict[str, Any]] = [
        {
            "id": coding_id_1,
            "kind": "coding",
            "prompt": coding_prompt_1,
            "language": language,
            "answer_key": {
                "type": "keywords",
                "keywords": [kw for kw in keywords_1 if kw],
                "min_hits": max(2, len([kw for kw in keywords_1 if kw])),
            },
        },
        {
            "id": coding_id_2,
            "kind": "coding",
            "prompt": coding_prompt_2,
            "language": language,
            "answer_key": {
                "type": "keywords",
                "keywords": [kw for kw in keywords_2 if kw],
                "min_hits": max(2, len([kw for kw in keywords_2 if kw])),
            },
        },
    ]

    return [*ceq_list, *coding_list]


def _try_openai_questions(skill: str) -> Optional[List[Dict[str, Any]]]:
    if not openai_client:
        return None
    skill_clean = _normalize_skill(skill)
    try:
        response = openai_client.responses.create(  # type: ignore[attr-defined]
            model=os.getenv("OPENAI_MODEL", "gpt-4.1-mini"),
            temperature=0.7,
            input=[
                {
                    "role": "system",
                    "content": "You design concise technical assessments. Output pure JSON with no markdown.",
                },
                {
                    "role": "user",
                    "content": (
                        "Create five questions to validate a candidate's skill. "
                        f"Skill: {skill_clean}. Respond with JSON object {{\"questions\": [{{...}}]}} where each question has: \n"
                        "id (uuid), kind (\"ceq\" for conceptual, \"coding\" for programming), prompt, options (array) for ceq, "
                        "language for coding, and answer_key. For ceq, answer_key should include correct_option letter (A-D). "
                        "For coding, answer_key must include rubric.text (short description) and keywords (array of must-have phrases). "
                        "Exactly 5 questions total: 3 with kind=ceq and 2 with kind=coding."
                    ),
                },
            ],
        )
        raw = _extract_openai_output_text(response)
        if not raw:
            return None
        payload = json.loads(raw)
        questions = payload.get("questions") if isinstance(payload, dict) else None
        if not isinstance(questions, list):
            return None
        validated: List[Dict[str, Any]] = []
        for q in questions:
            if not isinstance(q, dict):
                continue
            kind = q.get("kind")
            if kind not in {"ceq", "coding"}:
                continue
            q.setdefault("id", str(uuid.uuid4()))
            if kind == "ceq":
                options = q.get("options")
                answer_key = q.get("answer_key", {})
                if not isinstance(options, list) or not options:
                    continue
                correct_option = answer_key.get("correct_option") if isinstance(answer_key, dict) else None
                if not correct_option:
                    continue
                validated.append(
                    {
                        "id": q["id"],
                        "kind": "ceq",
                        "prompt": q.get("prompt") or "",
                        "options": options,
                        "answer_key": {"type": "ceq", "correct_option": correct_option},
                    }
                )
            else:
                language = q.get("language") or _fallback_language_for_skill(skill_clean)
                answer_key = q.get("answer_key", {})
                keywords = answer_key.get("keywords") if isinstance(answer_key, dict) else None
                if not keywords or not isinstance(keywords, list):
                    continue
                validated.append(
                    {
                        "id": q["id"],
                        "kind": "coding",
                        "prompt": q.get("prompt") or "",
                        "language": language,
                        "answer_key": {
                            "type": "keywords",
                            "keywords": [kw for kw in keywords if isinstance(kw, str)],
                            "min_hits": max(2, len([kw for kw in keywords if isinstance(kw, str)])),
                            "rubric": answer_key.get("rubric", {}).get("text") if isinstance(answer_key.get("rubric"), dict) else None,
                        },
                    }
                )
        return validated or None
    except Exception as exc:
        logger.warning("OpenAI generation failed: %s", exc)
        return None


def _generate_skill_questions(skill: str) -> List[Dict[str, Any]]:
    ai_questions = _try_openai_questions(skill)
    if ai_questions:
        return ai_questions
    return _fallback_questions(skill)


def _public_questions(questions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    public_list: List[Dict[str, Any]] = []
    for question in questions:
        cleaned = {k: v for k, v in question.items() if k != "answer_key"}
        public_list.append(cleaned)
    return public_list


def _grade_skill_answers(questions: List[Dict[str, Any]], answers: Dict[str, str]) -> Dict[str, Any]:
    results = []
    total_score = 0.0
    counted = 0
    for question in questions:
        qid = question.get("id")
        if not qid:
            continue
        expected = question.get("answer_key") or {}
        response = (answers.get(qid) or "").strip()
        question_score = 0.0
        detail: Dict[str, Any] = {
            "question_id": qid,
            "kind": question.get("kind"),
            "score": 0,
        }
        if not response:
            detail["feedback"] = "No answer provided."
            results.append(detail)
            continue
        kind = question.get("kind")
        if kind == "ceq":
            correct_option = (expected or {}).get("correct_option", "").strip().lower()
            if correct_option and response.lower().startswith(correct_option.lower()):
                question_score = 100.0
                detail["feedback"] = "Correct option."
            else:
                detail["feedback"] = f"Expected option {correct_option.upper() or '?'}"
        elif kind == "coding":
            if openai_client and isinstance(expected, dict) and expected.get("type") == "openai_rubric":
                question_score = _grade_coding_with_openai(response, expected)
                detail["feedback"] = "AI evaluated response."
            else:
                keywords = expected.get("keywords") if isinstance(expected, dict) else None
                if keywords:
                    text_lower = response.lower()
                    hits = sum(1 for kw in keywords if isinstance(kw, str) and kw.lower() in text_lower)
                    min_hits = expected.get("min_hits") or len(keywords)
                    question_score = (hits / max(1, min_hits)) * 100
                    detail["feedback"] = f"Matched {hits} of {len(keywords)} keywords."
                    detail["matched_keywords"] = hits
                    detail["keywords"] = keywords
                else:
                    question_score = 50.0
                    detail["feedback"] = "Heuristic score (no keywords available)."
        else:
            detail["feedback"] = "Unknown question type."
        detail["score"] = round(max(0.0, min(100.0, question_score)), 2)
        results.append(detail)
        total_score += detail["score"]
        counted += 1
    final_score = round(total_score / counted, 2) if counted else 0.0
    status = "verified" if final_score >= 70 else "needs_review"
    return {"score": final_score, "status": status, "details": results}


def _grade_coding_with_openai(response: str, answer_key: Dict[str, Any]) -> float:
    if not openai_client:
        return 0.0
    rubric_text = answer_key.get("rubric") or "Evaluate the solution on correctness and clarity."
    try:
        evaluation = openai_client.responses.create(  # type: ignore[attr-defined]
            model=os.getenv("OPENAI_MODEL", "gpt-4.1-mini"),
            temperature=0.2,
            input=[
                {
                    "role": "system",
                    "content": "You assign numeric grades between 0 and 100. Respond with JSON {\"score\": number} only.",
                },
                {
                    "role": "user",
                    "content": (
                        f"Rubric: {rubric_text}\nCandidate answer:\n{response}\nReturn only JSON."
                    ),
                },
            ],
        )
        text = _extract_openai_output_text(evaluation)
        if not text:
            return 0.0
        data = json.loads(text)
        score = data.get("score")
        if isinstance(score, (int, float)):
            return float(score)
    except Exception as exc:
        logger.warning("OpenAI grading failed: %s", exc)
    return 0.0


def get_current_user(cred: HTTPAuthorizationCredentials = Depends(security)):
    if not cred:
        raise HTTPException(401, "Missing credentials")
    token = cred.credentials
    if not token:
        raise HTTPException(401, "Missing credentials")
    payload = decode_access_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(401, "Invalid access token payload")
    if APP_DEBUG:
        logger.debug("auth user id=%s", user_id)
    return {"id": user_id, "email": payload.get("email")}


@app.post("/api/signup")
def signup(body: SignupIn):
    try:
        res = supabase.auth.sign_up({"email": body.email, "password": body.password})
        if not getattr(res, "user", None):
            raise HTTPException(400, "Sign up failed")
        return {"ok": True, "message": "Account created"}
    except Exception as exc:
        msg = str(exc)
        if "already" in msg.lower():
            raise HTTPException(409, "Email already registered")
        raise HTTPException(400, msg)


@app.post("/api/signin")
def signin(body: SigninIn):
    try:
        res = supabase.auth.sign_in_with_password({"email": body.email, "password": body.password})
        session = getattr(res, "session", None)
        user = getattr(res, "user", None)
        if not session or not user:
            raise HTTPException(401, "Invalid credentials")
        claims = {"sub": user.id, "email": user.email}
        access_token = create_access_token(claims)
        refresh_token = create_refresh_token(claims)
        response = JSONResponse(
            {
                "ok": True,
                "access_token": access_token,
                "expires_in": int(_ACCESS_EXPIRE_DELTA.total_seconds()),
            }
        )
        _set_refresh_cookie(response, refresh_token)
        return response
    except Exception as exc:
        raise HTTPException(401, str(exc))


@app.post("/api/refresh")
def refresh_session(request: Request):
    token = request.cookies.get(REFRESH_TOKEN_COOKIE_NAME)
    if not token:
        raise HTTPException(401, "Missing refresh token")
    payload = decode_refresh_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(401, "Invalid refresh token payload")
    claims = {"sub": user_id, "email": payload.get("email")}
    access_token = create_access_token(claims)
    refresh_token = create_refresh_token(claims)
    response = JSONResponse(
        {
            "ok": True,
            "access_token": access_token,
            "expires_in": int(_ACCESS_EXPIRE_DELTA.total_seconds()),
        }
    )
    _set_refresh_cookie(response, refresh_token)
    return response


@app.post("/api/logout")
def logout():
    response = JSONResponse({"ok": True})
    _clear_refresh_cookie(response)
    return response


@app.get("/api/profile", response_model=ProfileOut)
def get_profile(user=Depends(get_current_user)):
    db = get_db_client()
    response = db.table(PROFILE_TABLE).select("*").eq("user_id", user["id"]).single().execute()
    data = getattr(response, "data", None)
    if not data:
        return {"user_id": user["id"]}
    return data


@app.post("/api/profile", response_model=ProfileOut)
def upsert_profile(body: ProfileIn, user=Depends(get_current_user)):
    db = get_db_client()
    payload = body.dict()
    payload["user_id"] = user["id"]
    if not payload.get("email"):
        payload["email"] = user["email"]

    response = db.table(PROFILE_TABLE).upsert(payload, on_conflict="user_id").execute()
    data = getattr(response, "data", None)
    if not data:
        raise HTTPException(400, "Failed to save profile")
    if isinstance(data, list) and data:
        return data[0]
    return data


@app.get("/api/public/profiles/{user_id}", response_model=ProfileOut)
def get_public_profile(user_id: str):
    """Public endpoint to fetch full profile fields for display purposes.
    Returns the full profile row for the requested user, or a minimal payload if not found.
    """
    db = get_db_client()
    try:
        res = db.table(PROFILE_TABLE).select("*").eq("user_id", user_id).single().execute()
        data = getattr(res, "data", None)
        if not data:
            return {"user_id": user_id}
        return data
    except Exception:
        # If not found or any error, still return a minimal payload with the user_id
        return {"user_id": user_id }


# New: Skill verification listing endpoints
@app.get("/api/skills/verifications", response_model=List[SkillVerificationOut])
def list_my_skill_verifications(user=Depends(get_current_user)):
    db = get_db_client()
    try:
        res = db.table("skill_verifications").select("skill,best_score,attempts,status,updated_at").eq("user_id", user["id"]).order("best_score", desc=True).order("updated_at", desc=True).execute()
        rows = getattr(res, "data", []) or []
        out: List[SkillVerificationOut] = []
        for r in rows:
            try:
                out.append(SkillVerificationOut(
                    skill=str(r.get("skill") or ""),
                    best_score=float(r.get("best_score") or 0.0),
                    attempts=int(r.get("attempts") or 0),
                    status=str(r.get("status") or "needs_review"),
                    updated_at=r.get("updated_at"),
                ))
            except Exception:
                continue
        return [o.dict() for o in out]
    except Exception as exc:
        raise HTTPException(400, f"Failed to load verifications: {exc}")


@app.get("/api/public/skills/verifications/{user_id}", response_model=List[SkillVerificationOut])
def list_public_skill_verifications(user_id: str):
    db = get_db_client()
    try:
        res = db.table("skill_verifications").select("skill,best_score,attempts,status,updated_at").eq("user_id", user_id).order("best_score", desc=True).order("updated_at", desc=True).execute()
        rows = getattr(res, "data", []) or []
        out: List[SkillVerificationOut] = []
        for r in rows:
            try:
                out.append(SkillVerificationOut(
                    skill=str(r.get("skill") or ""),
                    best_score=float(r.get("best_score") or 0.0),
                    attempts=int(r.get("attempts") or 0),
                    status=str(r.get("status") or "needs_review"),
                    updated_at=r.get("updated_at"),
                ))
            except Exception:
                continue
        return [o.dict() for o in out]
    except Exception as exc:
        raise HTTPException(400, f"Failed to load public verifications: {exc}")


def _ensure_storage_client():
    client = service_client or supabase
    storage = getattr(client, "storage", None)
    if not storage:
        raise HTTPException(500, "Supabase storage client unavailable")
    return storage


def _extract_public_url(response, path=None):
    if response is None:
        return None
    if isinstance(response, dict):
        data = response.get("data")
        if isinstance(data, dict):
            url = data.get("publicUrl") or data.get("public_url")
            if url:
                return url
        elif isinstance(data, str):
            return data
        url = response.get("publicUrl") or response.get("public_url")
        if url:
            return url
    data = getattr(response, "data", None)
    if isinstance(data, dict):
        url = data.get("publicUrl") or data.get("public_url")
        if url:
            return url
    if isinstance(data, str):
        return data
    url = getattr(response, "publicUrl", None) or getattr(response, "public_url", None)
    if url:
        return url
    if path:
        base = SUPABASE_URL.rstrip("/")
        encoded = quote(path.lstrip("/"), safe="/")
        return f"{base}/storage/v1/object/public/{STORAGE_BUCKET}/{encoded}"
    return None


@app.post("/api/profile/upload")
async def upload_profile_asset(
    kind: str = Form(...),
    file: UploadFile = File(...),
    user=Depends(get_current_user),
):
    if not STORAGE_BUCKET:
        raise HTTPException(500, "Storage bucket not configured")

    asset_kind = (kind or "").strip().lower()
    if asset_kind not in PROFILE_ASSET_FIELDS:
        raise HTTPException(400, "Unsupported asset type")

    extension = os.path.splitext(file.filename or "")[1].lower()
    allowed = ALLOWED_EXTENSIONS.get(asset_kind, set())
    if extension and allowed and extension not in allowed:
        allowed_str = ", ".join(sorted(allowed))
        raise HTTPException(400, f"File type not allowed. Expected one of: {allowed_str}")

    blob = await file.read()
    if not blob:
        raise HTTPException(400, "Uploaded file is empty")

    filename_extension = extension or (".pdf" if asset_kind == "resume" else ".bin")
    storage_path = f"profile_assets/{user['id']}/{asset_kind}_{int(time.time())}{filename_extension}"

    storage_client = _ensure_storage_client()
    try:
        upload_options = {
            "cache-control": "3600",
            "upsert": "true",
            "content-type": file.content_type or "application/octet-stream",
        }
        upload_response = storage_client.from_(STORAGE_BUCKET).upload(
            storage_path,
            blob,
            upload_options,
        )
    except Exception as exc:
        logger.exception("Storage upload failed")
        raise HTTPException(500, f"Storage upload failed: {exc}")

    if getattr(upload_response, "error", None):
        detail = getattr(upload_response.error, "message", None) or str(upload_response.error)
        raise HTTPException(500, f"Storage upload error: {detail}")

    public_url_response = storage_client.from_(STORAGE_BUCKET).get_public_url(storage_path)
    public_url = _extract_public_url(public_url_response, storage_path)
    if not public_url:
        raise HTTPException(500, "Could not determine public URL for uploaded file")

    field_name = PROFILE_ASSET_FIELDS[asset_kind]
    profile = _save_profile_row({"user_id": user["id"], field_name: public_url})

    return {
        "ok": True,
        "kind": asset_kind,
        "field": field_name,
        "url": public_url,
        "path": storage_path,
        "profile": profile,
    }


# ----------------- Projects endpoints -----------------

@app.post("/api/projects", response_model=ProjectOut)
def create_project(body: ProjectIn, user=Depends(get_current_user)):
    db = get_db_client()
    b = body.basics
    s = body.status
    l = body.links
    f = body.funding
    t = body.team

    row = {
        "user_id": user["id"],
        "title": b.title,
        "tagline": b.tagline,
        "domains": b.domains,
        "description": b.description,
        "tech_stack": b.tech_stack,
        "proj_status": s.status,
        "start_date": s.start_date,
        "end_date": s.end_date,
        "milestones": s.milestones,
        "github": l.github,
        "demo": l.demo,
        "video": l.video,
        "docs": l.docs,
        "fund_stage": f.stage,
        "fund_budget_inr": f.budget_inr,
        "fund_use": f.use,
        "team_members": t.members,
        "roles_hiring": t.roles_hiring,
        "compensation": t.compensation,
        "hours": t.hours,
        "role_desc": t.role_desc,
        "cover_url": None,
        "gallery_urls": [],
    }

    try:
        res = db.table(PROJECTS_TABLE).insert(row).execute()
    except Exception as exc:
        logger.exception("Project insert failed")
        raise HTTPException(400, f"Project create failed: {exc}")

    data = getattr(res, "data", None)
    if isinstance(data, list) and data:
        return _project_row_to_out(data[0])
    if isinstance(data, dict):
        return _project_row_to_out(data)
    raise HTTPException(500, "No data returned after insert")


@app.get("/api/projects", response_model=list[ProjectOut])
def list_projects(limit: int = 50):
    db = get_db_client()
    try:
        res = db.table(PROJECTS_TABLE).select("*").order("created_at", desc=True).limit(min(200, max(1, limit))).execute()
    except Exception as exc:
        raise HTTPException(400, f"List failed: {exc}")
    rows = getattr(res, "data", []) or []
    return [_project_row_to_out(row) for row in rows]


@app.get("/api/projects/{project_id}", response_model=ProjectOut)
def get_project(project_id: str):
    db = get_db_client()
    try:
        res = db.table(PROJECTS_TABLE).select("*").eq("id", project_id).single().execute()
    except Exception as exc:
        raise HTTPException(400, f"Fetch failed: {exc}")
    data = getattr(res, "data", None)
    if not data:
        raise HTTPException(404, "Project not found")
    return _project_row_to_out(data)


@app.post("/api/projects/{project_id}/upload")
async def upload_project_media(
    project_id: str,
    kind: str = Form(...),  # 'cover' or 'gallery'
    file: UploadFile = File(...),
    user=Depends(get_current_user),
):
    if not STORAGE_BUCKET:
        raise HTTPException(500, "Storage bucket not configured")

    media_kind = (kind or "").strip().lower()
    if media_kind not in ("cover", "gallery"):
        raise HTTPException(400, "Unsupported media kind")

    # Verify ownership
    db = get_db_client()
    try:
        res = db.table(PROJECTS_TABLE).select("user_id, cover_url, gallery_urls").eq("id", project_id).single().execute()
    except Exception as exc:
        raise HTTPException(400, f"Lookup failed: {exc}")
    proj = getattr(res, "data", None)
    if not proj:
        raise HTTPException(404, "Project not found")
    if proj.get("user_id") != user["id"]:
        raise HTTPException(403, "Not your project")

    extension = os.path.splitext(file.filename or "")[1].lower()
    allowed = PROJECT_MEDIA_EXTENSIONS[media_kind]
    if extension and allowed and extension not in allowed:
        raise HTTPException(400, f"File type not allowed for {media_kind}")

    blob = await file.read()
    if not blob:
        raise HTTPException(400, "File empty")

    filename_extension = extension or ".bin"
    storage_path = f"project_assets/{user['id']}/{project_id}/{media_kind}_{int(time.time())}{filename_extension}"

    storage_client = _ensure_storage_client()
    try:
        upload_response = storage_client.from_(STORAGE_BUCKET).upload(
            storage_path,
            blob,
            {"cache-control": "3600", "upsert": "true", "content-type": file.content_type or "application/octet-stream"},
        )
    except Exception as exc:
        logger.exception("Storage upload failed")
        raise HTTPException(500, f"Storage upload failed: {exc}")

    if getattr(upload_response, "error", None):
        detail = getattr(upload_response.error, "message", None) or str(upload_response.error)
        raise HTTPException(500, f"Storage upload error: {detail}")

    public_url_response = storage_client.from_(STORAGE_BUCKET).get_public_url(storage_path)
    public_url = _extract_public_url(public_url_response, storage_path)
    if not public_url:
        raise HTTPException(500, "Could not determine public URL")

    # Update project record
    if media_kind == "cover":
        update = {"cover_url": public_url}
    else:
        gallery = proj.get("gallery_urls") or []
        if not isinstance(gallery, list):
            gallery = []
        gallery.append(public_url)
        update = {"gallery_urls": gallery}

    try:
        db.table(PROJECTS_TABLE).update(update).eq("id", project_id).execute()
    except Exception as exc:
        raise HTTPException(400, f"Failed to update project media: {exc}")

    try:
        refreshed = db.table(PROJECTS_TABLE).select("*").eq("id", project_id).single().execute()
    except Exception as exc:
        raise HTTPException(400, f"Failed to load project after media update: {exc}")

    row = getattr(refreshed, "data", None)
    if not row:
        raise HTTPException(404, "Project not found after media update")

    return {
        "ok": True,
        "kind": media_kind,
        "url": public_url,
        "path": storage_path,
        "project_id": project_id,
        "project": _project_row_to_out(row),
    }


# ===== Tool & Learning Discovery (from refers.py) =====
# Env keys
SERPAPI_API_KEY = os.getenv("SERPAPI_API_KEY")
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
SERPAPI_ENDPOINT = "https://serpapi.com/search.json"
YOUTUBE_SEARCH = "https://www.googleapis.com/youtube/v3/search"
YOUTUBE_VIDEOS = "https://www.googleapis.com/youtube/v3/videos"

# Import shared utilities to avoid duplication
try:
    from shared_utils import (
        normalize_text as _norm_text,
        skill_in_text as _skill_in_text_block,
        domain_as_channel as _domain_as_channel,
        chunks as _chunks,
        greedy_cover_from_candidates as _greedy_cover_from_candidates,
        rank_tiebreak_key,
    )
except ImportError:
    # Fallback if module not found in path
    import sys
    import os
    sys.path.insert(0, os.path.dirname(__file__))
    from shared_utils import (
        normalize_text as _norm_text,
        skill_in_text as _skill_in_text_block,
        domain_as_channel as _domain_as_channel,
        chunks as _chunks,
        greedy_cover_from_candidates as _greedy_cover_from_candidates,
        rank_tiebreak_key,
    )

# Tool offers (SerpAPI Google)
class ToolSearchIn(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    n: int = Field(5, ge=1, le=10)

class ToolResultsOut(BaseModel):
    results: List[Dict[str, str]]

def _get_tool_offers(query: str, n: int = 5) -> List[Dict[str, str]]:
    if not SERPAPI_API_KEY:
        return []
    q = f"{query} student offers OR education discount OR free plan OR professional pricing tools"
    params = {"engine": "google", "q": q, "num": max(n, 10), "hl": "en", "api_key": SERPAPI_API_KEY}
    try:
        res = GoogleSearch(params).get_dict() or {}
    except Exception:
        # Fallback to HTTP endpoint
        try:
            r = requests.get(SERPAPI_ENDPOINT, params={**params, "engine": "google"}, timeout=20)
            res = r.json() if r.status_code == 200 else {}
        except Exception:
            res = {}
    items = (res.get("organic_results") or [])[:n]
    out: List[Dict[str, str]] = []
    for o in items:
        out.append({
            "title": (o.get("title") or "").strip(),
            "link": (o.get("link") or "").strip(),
            "snippet": (o.get("snippet") or "").strip(),
        })
    return [it for it in out if it.get("title") and it.get("link")]

@app.post("/api/tools/search", response_model=ToolResultsOut)
def api_tool_offers(body: ToolSearchIn):
    q_parts = []
    if body.title:
        q_parts.append(body.title)
    if body.description:
        q_parts.append(body.description)
    query = " ".join([p for p in q_parts if p and p.strip()]).strip()
    if not query:
        raise HTTPException(400, "title or description required")
    try:
        results = _get_tool_offers(query, n=body.n)
    except Exception as exc:
        logger.warning("tool offers search failed: %s", exc)
        results = []
    return {"results": results}

# Greedy cover for Blogs/News/YouTube
class CoverRequest(BaseModel):
    skills: List[str] = Field(default_factory=list)
    search_per_skill: int = Field(20, ge=5, le=50)
    language: str = "en"
    country: str = "in"
    include_snippet: bool = True
    region_code: Optional[str] = "IN"
    relevance_language: Optional[str] = "en"
    min_views: int = 0
    site_bias: Optional[str] = (
        'site:freecodecamp.org OR site:dev.to OR site:hashnode.com OR '
        'site:medium.com OR site:towardsdatascience.com'
    )

class AllCoverResponse(BaseModel):
    blogs: List[Dict[str, Any]]
    news: List[Dict[str, Any]]
    youtube: List[Dict[str, Any]]


def _fetch_blogs_grouped_cover(skills: List[str], search_per_skill: int = 20, language: str = "en", country: str = "in", site_bias: Optional[str] = (
    'site:freecodecamp.org OR site:dev.to OR site:hashnode.com OR site:medium.com OR site:towardsdatascience.com'
), include_snippet: bool = True) -> List[Dict[str, Any]]:
    if not SERPAPI_API_KEY:
        return []
    skills = [s for s in (skills or []) if s and s.strip()]
    if not skills:
        return []
    norm_to_orig = { _norm_text(s): s for s in skills }
    norm_skills = list(norm_to_orig.keys())
    candidates: List[Dict[str, Any]] = []
    for skill in skills:
        q_core = f'{skill} tutorial OR "how to"'
        q = f"{q_core} {site_bias}" if site_bias else q_core
        try:
            resp = requests.get(
                SERPAPI_ENDPOINT,
                params={
                    "engine": "google",
                    "q": q,
                    "num": max(10, min(50, search_per_skill)),
                    "api_key": SERPAPI_API_KEY,
                    "hl": language,
                    "gl": country,
                },
                timeout=20,
            )
        except Exception:
            continue
        if resp.status_code != 200:
            continue
        organic = resp.json().get("organic_results", [])[:search_per_skill]
        for rank, o in enumerate(organic, start=1):
            title = (o.get("title") or "").strip()
            url = o.get("link")
            if not url:
                continue
            snippet = (o.get("snippet") or "") if include_snippet else ""
            text = f"{title}\n{snippet}"
            matched_norm = [nsk for nsk in norm_skills if _skill_in_text_block(text, nsk)]
            if not matched_norm:
                continue
            candidates.append({
                "_rank": rank,
                "title": title,
                "url": url,
                "channel_title": _domain_as_channel(url) or (o.get("source") or o.get("displayed_link")),
                "published_at": o.get("date"),
                "thumbnail": None,
                "views": None,
                "matched_norm": matched_norm,
            })
    return _greedy_cover_from_candidates(candidates, norm_to_orig, item_key="item")


def _fetch_news_grouped_cover(skills: List[str], search_per_skill: int = 20, language: str = "en", country: str = "in", include_snippet: bool = True) -> List[Dict[str, Any]]:
    if not SERPAPI_API_KEY:
        return []
    skills = [s for s in (skills or []) if s and s.strip()]
    if not skills:
        return []
    norm_to_orig = { _norm_text(s): s for s in skills }
    norm_skills = list(norm_to_orig.keys())
    candidates: List[Dict[str, Any]] = []
    for skill in skills:
        try:
            resp = requests.get(
                SERPAPI_ENDPOINT,
                params={
                    "engine": "google_news",
                    "q": f"{skill} tutorial OR course OR learning",
                    "api_key": SERPAPI_API_KEY,
                    "hl": language,
                    "gl": country,
                },
                timeout=20,
            )
        except Exception:
            continue
        if resp.status_code != 200:
            continue
        news_results = resp.json().get("news_results", [])[:search_per_skill]
        for rank, n in enumerate(news_results, start=1):
            title = (n.get("title") or "").strip()
            url = n.get("link")
            if not url:
                continue
            snippet = ""
            if include_snippet:
                snippet = n.get("snippet") or n.get("content") or ""
            tn = n.get("thumbnail")
            if isinstance(tn, dict):
                thumb = tn.get("static") or tn.get("original")
            elif isinstance(tn, str):
                thumb = tn
            else:
                thumb = None
            text = f"{title}\n{snippet}"
            matched_norm = [nsk for nsk in norm_skills if _skill_in_text_block(text, nsk)]
            if not matched_norm:
                continue
            candidates.append({
                "_rank": rank,
                "title": title,
                "url": url,
                "channel_title": (n.get("source") or {}).get("name") or _domain_as_channel(url),
                "published_at": n.get("date"),
                "thumbnail": thumb,
                "views": None,
                "matched_norm": matched_norm,
            })
    return _greedy_cover_from_candidates(candidates, norm_to_orig, item_key="item")


def _fetch_youtube_grouped_cover(skills: List[str], search_per_skill: int = 15, region_code: str = "IN", relevance_language: str = "en", min_views: int = 0) -> List[Dict[str, Any]]:
    if not YOUTUBE_API_KEY:
        return []
    skills = [s for s in (skills or []) if s and s.strip()]
    if not skills:
        return []
    norm_to_orig = { _norm_text(s): s for s in skills }
    norm_skills = list(norm_to_orig.keys())
    candidate_ids: List[str] = []
    for orig in skills:
        q = f'"{orig}" tutorial OR course'
        try:
            s = requests.get(
                YOUTUBE_SEARCH,
                params={
                    "key": YOUTUBE_API_KEY,
                    "part": "snippet",
                    "q": q,
                    "type": "video",
                    "order": "viewCount",
                    "maxResults": max(5, min(50, search_per_skill)),
                    "regionCode": region_code,
                    "relevanceLanguage": relevance_language,
                    "safeSearch": "moderate",
                },
                timeout=20,
            )
        except Exception:
            continue
        if s.status_code != 200:
            continue
        ids = [it.get("id", {}).get("videoId") for it in s.json().get("items", [])]
        for vid in filter(None, ids):
            candidate_ids.append(vid)
    seen: Set[str] = set()
    dedup_ids: List[str] = []
    for vid in candidate_ids:
        if vid not in seen:
            seen.add(vid)
            dedup_ids.append(vid)
    if not dedup_ids:
        return []
    candidates: List[Dict[str, Any]] = []
    for batch in _chunks(dedup_ids, 50):
        try:
            v = requests.get(
                YOUTUBE_VIDEOS,
                params={"key": YOUTUBE_API_KEY, "part": "snippet,statistics", "id": ",".join(batch)},
                timeout=20,
            )
        except Exception:
            continue
        if v.status_code != 200:
            continue
        for it in v.json().get("items", []):
            sn = it.get("snippet", {}) or {}
            st = it.get("statistics", {}) or {}
            title = sn.get("title", "") or ""
            desc = sn.get("description", "") or ""
            text = f"{title}\n{desc}"
            try:
                view_count = int(st.get("viewCount") or 0)
            except Exception:
                view_count = 0
            if view_count < min_views:
                continue
            matched_norm = [nsk for nsk in norm_skills if _skill_in_text_block(text, nsk)]
            if not matched_norm:
                continue
            thumb = (sn.get("thumbnails", {}) or {}).get("medium", {}) or {}
            candidates.append({
                "title": title,
                "url": f"https://www.youtube.com/watch?v={it.get('id')}",
                "channel_title": sn.get("channelTitle"),
                "views": view_count,
                "published_at": sn.get("publishedAt"),
                "thumbnail": thumb.get("url"),
                "matched_norm": matched_norm,
            })
    if not candidates:
        return []
    def _yt_tie_key(c: Dict[str, Any]) -> int:
        try:
            return -int(c.get("views") or 0)
        except Exception:
            return 0
    return _greedy_cover_from_candidates(sorted(candidates, key=_yt_tie_key), norm_to_orig, item_key="video", tie_key_func=_yt_tie_key)


@app.post("/api/tools/cover/all", response_model=AllCoverResponse)
def api_cover_all(req: CoverRequest):
    skills = [s for s in (req.skills or []) if isinstance(s, str) and s.strip()]
    try:
        blogs = _fetch_blogs_grouped_cover(skills, req.search_per_skill, req.language, req.country, req.site_bias, req.include_snippet)
    except Exception as e:
        logger.warning("blogs cover failed: %s", e)
        blogs = []
    try:
        news = _fetch_news_grouped_cover(skills, req.search_per_skill, req.language, req.country, req.include_snippet)
    except Exception as e:
        logger.warning("news cover failed: %s", e)
        news = []
    try:
        youtube = _fetch_youtube_grouped_cover(skills, req.search_per_skill, req.region_code or "IN", req.relevance_language or "en", req.min_views)
    except Exception as e:
        logger.warning("youtube cover failed: %s", e)
        youtube = []
    return {"blogs": blogs, "news": news, "youtube": youtube}


# ----------------- Skill Assessment endpoints -----------------

def _insert_skill_test_session(user_id: str, skill: str, questions: List[Dict[str, Any]]) -> str:
    db = get_db_client()
    try:
        res = db.table("skill_tests").insert({
            "user_id": user_id,
            "skill": skill,
            "questions": questions,  # store with answer_key for grading
            "status": "active",
        }).execute()
    except Exception as exc:
        raise HTTPException(400, f"Failed to start test: {exc}")
    data = getattr(res, "data", None)
    if isinstance(data, list) and data:
        return data[0].get("id")
    if isinstance(data, dict):
        return data.get("id")
    raise HTTPException(500, "No session id returned")


def _get_skill_test_session(session_id: str) -> Optional[dict]:
    db = get_db_client()
    try:
        res = db.table("skill_tests").select("*").eq("id", session_id).single().execute()
        return getattr(res, "data", None)
    except Exception:
        return None


def _update_skill_test_submission(session_id: str, result: Dict[str, Any]) -> None:
    db = get_db_client()
    score = float(result.get("score") or 0.0)
    status = result.get("status") or ("verified" if score >= 70 else "needs_review")
    try:
        db.table("skill_tests").update({
            "status": "completed",
            "result": result,
            "score": score,
            "submitted_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }).eq("id", session_id).execute()
    except Exception as exc:
        logger.warning("Failed to finalize skill test: %s", exc)


def _upsert_skill_verification(user_id: str, raw_skill: str, score: float) -> Dict[str, Any]:
    db = get_db_client()
    skill = _normalize_skill(raw_skill)
    status = "verified" if score >= 70 else "needs_review"
    # First, find existing
    existing = None
    try:
        res = db.table("skill_verifications").select("*").eq("user_id", user_id).eq("skill", skill).single().execute()
        existing = getattr(res, "data", None)
    except Exception:
        existing = None
    # Safely derive previous values
    existing_best = 0.0
    existing_attempts = 0
    existing_status = "needs_review"
    if isinstance(existing, dict) and existing:
        try:
            existing_best = float(existing.get("best_score") or 0.0)
        except Exception:
            existing_best = 0.0
        try:
            existing_attempts = int(existing.get("attempts") or 0)
        except Exception:
            existing_attempts = 0
        if existing.get("status"):
            existing_status = str(existing.get("status"))

    new_best = max(existing_best, float(score or 0.0))
    new_attempts = existing_attempts + 1
    # If this attempt meets/exceeds previous best, use current attempt's status; otherwise retain existing status
    new_status = status if score >= existing_best else existing_status

    payload = {
        "user_id": user_id,
        "skill": skill,
        "best_score": new_best,
        "attempts": new_attempts,
        "status": new_status,
    }
    try:
        res = db.table("skill_verifications").upsert(payload, on_conflict="user_id,skill").execute()
        data = getattr(res, "data", None)
        if isinstance(data, list) and data:
            return data[0]
        if isinstance(data, dict):
            return data
    except Exception as exc:
        logger.warning("Skill verification upsert failed: %s", exc)
    return payload


def _recompute_profile_verification_score(user_id: str) -> float:
    db = get_db_client()
    try:
        res = db.table("skill_verifications").select("best_score").eq("user_id", user_id).order("best_score", desc=True).limit(10).execute()
        rows = getattr(res, "data", []) or []
        scores = [float(r.get("best_score") or 0) for r in rows if r and r.get("best_score") is not None]
        if not scores:
            agg = 0.0
        else:
            top = sorted(scores, reverse=True)[:3]
            agg = sum(top) / len(top)
        agg_rounded = round(agg)
        # Update profile
        try:
            db.table(PROFILE_TABLE).upsert({"user_id": user_id, "verification_score": agg_rounded}, on_conflict="user_id").execute()
        except Exception as exc:
            logger.warning("Failed updating profile verification_score: %s", exc)
        return float(agg_rounded)
    except Exception as exc:
        logger.warning("Failed to recompute verification score: %s", exc)
        return 0.0


@app.post("/api/skills/tests/start", response_model=SkillTestStartOut)
def start_skill_test(body: SkillTestStartIn, user=Depends(get_current_user)):
    skill = _normalize_skill(body.skill)
    if not skill:
        raise HTTPException(400, "Skill is required")
    # Generate questions (AI or fallback)
    questions = _generate_skill_questions(skill)
    # Persist full questions (with answer_key)
    session_id = _insert_skill_test_session(user["id"], skill, questions)
    # Return public questions (without answer_key)
    public_questions = _public_questions(questions)
    return {"session_id": session_id, "skill": skill, "questions": public_questions}


@app.post("/api/skills/tests/{session_id}/submit")
def submit_skill_test(session_id: str, body: SkillTestSubmitIn, user=Depends(get_current_user)):
    session = _get_skill_test_session(session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    if session.get("user_id") != user["id"]:
        raise HTTPException(403, "Not your session")
    if session.get("status") == "completed":
        # Return existing result if already graded
        result = session.get("result")
        if result:
            return result
    questions = session.get("questions") or []
    if not isinstance(questions, list) or not questions:
        raise HTTPException(400, "Session has no questions")
    answers_map: Dict[str, str] = {}
    for ans in body.answers:
        if ans.question_id:
            answers_map[ans.question_id] = (ans.response or "").strip()
    result = _grade_skill_answers(questions, answers_map)
    # Persist results
    _update_skill_test_submission(session_id, result)
    # Update verification aggregates
    score = float(result.get("score") or 0.0)
    _upsert_skill_verification(user["id"], session.get("skill") or "", score)
    _recompute_profile_verification_score(user["id"])
    return result


@app.get("/api/debug/profile")
def debug_profile(user=Depends(get_current_user)):
    if not APP_DEBUG:
        raise HTTPException(403, "Debug disabled")
    row = _get_profile(user["id"]) or {}
    present_keys = list(row.keys()) if row else []
    return {
        "ok": True,
        "profile_raw": row,
        "keys": present_keys,
    }


# New: Project applications endpoints
@app.post("/api/projects/{project_id}/apply")
def apply_to_project(project_id: str, body: ProjectApplicationIn = None, user=Depends(get_current_user)):
    db = get_db_client()
    # Ensure project exists and is not owned by applicant
    try:
        res = db.table(PROJECTS_TABLE).select("user_id").eq("id", project_id).single().execute()
    except Exception as exc:
        raise HTTPException(400, f"Lookup failed: {exc}")
    proj = getattr(res, "data", None)
    if not proj:
        raise HTTPException(404, "Project not found")
    if proj.get("user_id") == user["id"]:
        raise HTTPException(400, "You cannot apply to your own project")

    # If an application already exists, treat it as success (idempotent behavior)
    try:
        existing = db.table("project_applications").select("id,status").eq("project_id", project_id).eq("applicant_user_id", user["id"]).limit(1).execute()
        rows = getattr(existing, "data", []) or []
        if rows:
            return {"ok": True, "status": rows[0].get("status") or "pending"}
    except Exception:
        # proceed to insert if lookup fails
        pass

    payload = {
        "project_id": project_id,
        "applicant_user_id": user["id"],
        "message": (body.message if body else None) or None,
        "status": "pending",
    }
    try:
        ins = db.table("project_applications").insert(payload).execute()
        data = getattr(ins, "data", None)
        if isinstance(data, list) and data:
            return {"ok": True, "status": data[0].get("status") or "pending"}
        return {"ok": True}
    except Exception as exc:
        # If insert fails due to unique violation, treat as success
        msg = str(exc).lower()
        if "duplicate" in msg or "unique" in msg or "already exists" in msg or "on conflict" in msg:
            return {"ok": True}
        raise HTTPException(400, f"Apply failed: {exc}")


@app.get("/api/projects/{project_id}/applications", response_model=List[ProjectApplicationOut])
def list_project_applications(project_id: str, user=Depends(get_current_user)):
    db = get_db_client()
    # Ownership check
    try:
        res = db.table(PROJECTS_TABLE).select("user_id").eq("id", project_id).single().execute()
    except Exception as exc:
        raise HTTPException(400, f"Lookup failed: {exc}")
    proj = getattr(res, "data", None)
    if not proj:
        raise HTTPException(404, "Project not found")
    if proj.get("user_id") != user["id"]:
        raise HTTPException(403, "Not your project")

    try:
        res = db.table("project_applications").select("*").eq("project_id", project_id).order("created_at", desc=True).execute()
        rows = getattr(res, "data", []) or []
        out: List[ProjectApplicationOut] = []
        for r in rows:
            try:
                out.append(ProjectApplicationOut(
                    id=str(r.get("id")),
                    project_id=str(r.get("project_id")),
                    applicant_user_id=str(r.get("applicant_user_id")),
                    message=r.get("message"),
                    status=str(r.get("status") or "pending"),
                    created_at=r.get("created_at"),
                    updated_at=r.get("updated_at"),
                ))
            except Exception:
                continue
        return [o.dict() for o in out]
    except Exception as exc:
        raise HTTPException(400, f"Failed to load applications: {exc}")

@app.get("/api/applications/incoming")
def list_incoming_applications(user=Depends(get_current_user)):
    db = get_db_client()
    # Load my projects
    try:
        pres = db.table(PROJECTS_TABLE).select("id,title").eq("user_id", user["id"]).limit(1000).execute()
        my_projects = getattr(pres, "data", []) or []
        proj_ids = [p.get("id") for p in my_projects if p and p.get("id")]
    except Exception as exc:
        raise HTTPException(400, f"Failed to load projects: {exc}")
    if not proj_ids:
        return {"applications": [], "projects": []}

    try:
        ares = db.table("project_applications").select("*").in_("project_id", proj_ids).order("created_at", desc=True).limit(2000).execute()
        apps = getattr(ares, "data", []) or []
    except Exception as exc:
        raise HTTPException(400, f"Failed to load applications: {exc}")

    proj_map = {p["id"]: {"id": p["id"], "title": p.get("title")} for p in my_projects if p.get("id")}
    # Return a simple object with applications and minimal project info
    return {
        "applications": apps,
        "projects": list(proj_map.values()),
    }

@app.get("/api/applications/mine")
def list_my_applications(user=Depends(get_current_user)):
    db = get_db_client()
    try:
        ares = db.table("project_applications").select("*") \
            .eq("applicant_user_id", user["id"]) \
            .order("created_at", desc=True) \
            .limit(2000).execute()
        apps = getattr(ares, "data", []) or []
    except Exception as exc:
        raise HTTPException(400, f"Failed to load applications: {exc}")

    if not apps:
        return {"applications": [], "projects": []}

    proj_ids = list({a.get("project_id") for a in apps if a and a.get("project_id")})
    projects = []
    if proj_ids:
        try:
            pres = db.table(PROJECTS_TABLE).select("id,title,cover_url").in_("id", proj_ids).limit(2000).execute()
            prows = getattr(pres, "data", []) or []
            projects = [{"id": r.get("id"), "title": r.get("title"), "cover_url": r.get("cover_url")} for r in prows if r and r.get("id")]
        except Exception:
            projects = []

    return {"applications": apps, "projects": projects}

@app.get("/api/projects/{project_id}/applications/me")
def get_my_project_application(project_id: str, user=Depends(get_current_user)):
    db = get_db_client()
    try:
        res = db.table("project_applications").select("*") \
            .eq("project_id", project_id) \
            .eq("applicant_user_id", user["id"]) \
            .limit(1).execute()
        rows = getattr(res, "data", []) or []
        if not rows:
            return {"applied": False}
        r = rows[0] or {}
        app = {
            "id": str(r.get("id")),
            "project_id": str(r.get("project_id")),
            "applicant_user_id": str(r.get("applicant_user_id")),
            "message": r.get("message"),
            "status": str(r.get("status") or "pending"),
            "created_at": r.get("created_at"),
            "updated_at": r.get("updated_at"),
        }
        return {"applied": True, "application": app}
    except Exception as exc:
        raise HTTPException(400, f"Failed to check application: {exc}")

@app.get("/api/projects/{project_id}/applications/{application_id}", response_model=ProjectApplicationOut)
def get_project_application(project_id: str, application_id: str, user=Depends(get_current_user)):
    db = get_db_client()
    # Verify ownership of the project
    try:
        pres = db.table(PROJECTS_TABLE).select("user_id").eq("id", project_id).single().execute()
    except Exception as exc:
        raise HTTPException(400, f"Lookup failed: {exc}")
    proj = getattr(pres, "data", None)
    if not proj:
        raise HTTPException(404, "Project not found")
    if proj.get("user_id") != user["id"]:
        raise HTTPException(403, "Not your project")

    try:
        ares = db.table("project_applications").select("*").eq("id", application_id).eq("project_id", project_id).single().execute()
        row = getattr(ares, "data", None)
        if not row:
            raise HTTPException(404, "Application not found")
        return ProjectApplicationOut(
            id=str(row.get("id")),
            project_id=str(row.get("project_id")),
            applicant_user_id=str(row.get("applicant_user_id")),
            message=row.get("message"),
            status=str(row.get("status") or "pending"),
            created_at=row.get("created_at"),
            updated_at=row.get("updated_at"),
        ).dict()
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(400, f"Failed to load application: {exc}")


@app.patch("/api/projects/{project_id}/applications/{application_id}")
def update_project_application(project_id: str, application_id: str, body: ProjectApplicationUpdateIn, user=Depends(get_current_user)):
    db = get_db_client()
    # Validate status
    allowed = {"pending", "accepted", "rejected"}
    new_status = (body.status or "").strip().lower()
    if new_status not in allowed:
        raise HTTPException(400, "Invalid status")

    # Verify ownership of the project
    try:
        pres = db.table(PROJECTS_TABLE).select("user_id").eq("id", project_id).single().execute()
    except Exception as exc:
        raise HTTPException(400, f"Lookup failed: {exc}")
    proj = getattr(pres, "data", None)
    if not proj:
        raise HTTPException(404, "Project not found")
    if proj.get("user_id") != user["id"]:
        raise HTTPException(403, "Not your project")

    # Update and return
    try:
        db.table("project_applications").update({"status": new_status}).eq("id", application_id).eq("project_id", project_id).execute()
        ares = db.table("project_applications").select("*").eq("id", application_id).eq("project_id", project_id).single().execute()
        row = getattr(ares, "data", None)
        if not row:
            raise HTTPException(404, "Application not found")
        return {
            "ok": True,
            "application": {
                "id": str(row.get("id")),
                "project_id": str(row.get("project_id")),
                "applicant_user_id": str(row.get("applicant_user_id")),
                "message": row.get("message"),
                "status": str(row.get("status") or "pending"),
                "created_at": row.get("created_at"),
                "updated_at": row.get("updated_at"),
            }
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(400, f"Failed to update: {exc}")


@app.get("/api/applications/{application_id}")
def get_application_by_id(application_id: str, user=Depends(get_current_user)):
    db = get_db_client()
    try:
        ares = db.table("project_applications").select("*").eq("id", application_id).single().execute()
    except Exception as exc:
        raise HTTPException(400, f"Lookup failed: {exc}")
    app_row = getattr(ares, "data", None)
    if not app_row:
        raise HTTPException(404, "Application not found")
    # Check membership (applicant or owner) and accepted status for collab
    try:
        pres = db.table(PROJECTS_TABLE).select("user_id").eq("id", app_row.get("project_id")).single().execute()
        proj = getattr(pres, "data", None) or {}
    except Exception:
        proj = {}
    is_owner = proj.get("user_id") == user["id"]
    is_applicant = app_row.get("applicant_user_id") == user["id"]
    if not (is_owner or is_applicant):
        raise HTTPException(403, "Not a participant in this application")
    return app_row

@app.get("/api/collab/{application_id}/messages")
def list_collab_messages(application_id: str, user=Depends(get_current_user)):
    db = get_db_client()
    # Ensure membership and accepted
    try:
        ares = db.table("project_applications").select("*").eq("id", application_id).single().execute()
        app_row = getattr(ares, "data", None)
    except Exception as exc:
        raise HTTPException(400, f"Lookup failed: {exc}")
    if not app_row:
        raise HTTPException(404, "Application not found")
    try:
        pres = db.table(PROJECTS_TABLE).select("user_id").eq("id", app_row.get("project_id")).single().execute()
        proj = getattr(pres, "data", None) or {}
    except Exception:
        proj = {}
    is_owner = proj.get("user_id") == user["id"]
    is_applicant = app_row.get("applicant_user_id") == user["id"]
    if not (is_owner or is_applicant):
        raise HTTPException(403, "Not a participant")
    if (app_row.get("status") or "").lower() != "accepted":
        raise HTTPException(400, "Collaboration opens only for accepted applications")

    try:
        mres = db.table("project_collab_messages").select("*").eq("application_id", application_id).order("created_at").limit(5000).execute()
        msgs = getattr(mres, "data", []) or []
        return {"messages": msgs}
    except Exception as exc:
        raise HTTPException(400, f"Failed to load messages: {exc}")

class CollabMessageIn(BaseModel):
    content: str

@app.post("/api/collab/{application_id}/messages")
def send_collab_message(application_id: str, body: CollabMessageIn, user=Depends(get_current_user)):
    db = get_db_client()
    text = (body.content or "").strip()
    if not text:
        raise HTTPException(400, "Message content required")
    # Ensure membership and accepted
    try:
        ares = db.table("project_applications").select("*").eq("id", application_id).single().execute()
        app_row = getattr(ares, "data", None)
    except Exception as exc:
        raise HTTPException(400, f"Lookup failed: {exc}")
    if not app_row:
        raise HTTPException(404, "Application not found")
    try:
        pres = db.table(PROJECTS_TABLE).select("user_id").eq("id", app_row.get("project_id")).single().execute()
        proj = getattr(pres, "data", None) or {}
    except Exception:
        proj = {}
    is_owner = proj.get("user_id") == user["id"]
    is_applicant = app_row.get("applicant_user_id") == user["id"]
    if not (is_owner or is_applicant):
        raise HTTPException(403, "Not a participant")
    if (app_row.get("status") or "").lower() != "accepted":
        raise HTTPException(400, "Collaboration opens only for accepted applications")

    try:
        ins = db.table("project_collab_messages").insert({
            "application_id": application_id,
            "sender_user_id": user["id"],
            "content": text,
        }).execute()
        data = getattr(ins, "data", None)
        row = data[0] if isinstance(data, list) and data else data
        return {"ok": True, "message": row}
    except Exception as exc:
        raise HTTPException(400, f"Failed to send message: {exc}")
