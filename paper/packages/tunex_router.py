
from fastapi import APIRouter, HTTPException, Depends
from supabase import Client
import logging
from functools import lru_cache
import os
from dotenv import load_dotenv
from typing import Optional
import json
import re

from starlette.concurrency import run_in_threadpool

# Setup similar logging/client retrieval as main.py or just re-implement simple one
# For a package, it's better to accept the client or get it from env.

router = APIRouter(prefix="/api/tunex", tags=["tunex"])

# Load env for standalone usage if needed, but typically main.py handles it.
_env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(_env_path)
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") # Use service role for reading if we want full access, or Anon.


logger = logging.getLogger("tunex")


ALLOWED_CHAPTER_TYPES = {
    "concept",
    "syntax",
    "range",
    "sequences",
    "nested",
    "keywords",
    "mistakes",
    "walkthrough",
    "interview",
    "quiz",
    "dynamic",
}


def _get_gemini_api_key() -> str:
    api_key = (os.getenv("GEMINI_API_KEY", "") or os.getenv("GOOGLE_API_KEY", "")).strip()
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="Missing GEMINI_API_KEY (or GOOGLE_API_KEY) in environment.",
        )
    return api_key


def _extract_json_object(text: str) -> str:
    """Extract the first JSON object from a string.

    Gemini sometimes wraps JSON in ```json fences or adds prose.
    """
    if not text:
        raise ValueError("Empty model response")

    # Prefer fenced ```json blocks
    fence = re.search(r"```(?:json)?\s*(\{[\s\S]*?\})\s*```", text, flags=re.IGNORECASE)
    if fence:
        return fence.group(1)

    # Fallback: first '{' to last '}'
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise ValueError("No JSON object found in response")
    return text[start : end + 1]


def _repair_json_loose(raw: str) -> str:
    """Best-effort repair for common LLM JSON issues.

    - Escapes raw newlines/tabs inside strings
    - Removes trailing commas
    """
    if not raw:
        return raw
    s = raw.replace("\r\n", "\n")
    out = []
    in_string = False
    escape = False
    for ch in s:
        if in_string:
            if escape:
                escape = False
                out.append(ch)
                continue
            if ch == "\\":
                escape = True
                out.append(ch)
                continue
            if ch == "\n":
                out.append("\\n")
                continue
            if ch == "\t":
                out.append("\\t")
                continue
            if ch == '"':
                in_string = False
            out.append(ch)
        else:
            if ch == '"':
                in_string = True
            out.append(ch)
    fixed = "".join(out)
    fixed = re.sub(r",\s*([}\]])", r"\1", fixed)
    return fixed


def _slugify(value: str) -> str:
    s = (value or "").strip().lower()
    s = re.sub(r"[^a-z0-9]+", "_", s)
    s = re.sub(r"_+", "_", s).strip("_")
    return s or "topic"


def _build_topic_template(*, topic_title: str, language_name: Optional[str]) -> dict:
    """Return a strict, UI-compatible template that Gemini must fill.

    This keeps the structure stable (like the seed scripts) and prevents
    missing keys like walkthrough.problem.title, etc.
    """
    slug = _slugify(topic_title)
    lang = (language_name or "Python").strip() or "Python"

    # Keep IDs stable and predictable so the UI editors are created reliably.
    def cid(suffix: str) -> str:
        return f"{slug}_{suffix}"

    return {
        "description": "",
        "chapters": [
            {
                "chapter_number": 1,
                "title": f"What is {topic_title}?",
                "chapter_type": "concept",
                "content": {
                    "blocks": [
                        {"type": "text", "title": "", "content": ""},
                        {"type": "static_code", "title": "Example", "code": "", "output": ""},
                        {"type": "callout", "variant": "info", "title": "Think of it like this", "text": ""},
                    ]
                },
            },
            {
                "chapter_number": 2,
                "title": "Key Ideas",
                "chapter_type": "concept",
                "content": {
                    "blocks": [
                        {"type": "text", "title": "Core idea", "content": ""},
                        {"type": "static_code", "title": "Quick example", "code": "", "output": ""},
                        {"type": "callout", "variant": "info", "title": "Why it matters", "text": ""},
                    ]
                },
            },
            {
                "chapter_number": 3,
                "title": "How It Works",
                "chapter_type": "concept",
                "content": {
                    "blocks": [
                        {"type": "text", "title": "Under the hood", "content": ""},
                        {"type": "static_code", "title": "Demonstration", "code": "", "output": ""},
                        {"type": "code", "id": cid("try_1"), "title": "Try it yourself", "default_code": ""},
                    ]
                },
            },
            {
                "chapter_number": 4,
                "title": "Patterns & Variations",
                "chapter_type": "concept",
                "content": {
                    "blocks": [
                        {"type": "section", "icon": "ri-lightbulb-flash-line", "title": "Pattern 1", "text": ""},
                        {"type": "code", "id": cid("pattern_1"), "title": "Practice", "default_code": ""},
                        {
                            "type": "carousel",
                            "items": [
                                {"title": "Easy", "desc": "", "code_id": cid("easy_1"), "default_code": ""},
                                {"title": "Medium", "desc": "", "code_id": cid("medium_1"), "default_code": ""},
                                {"title": "Hard", "desc": "", "code_id": cid("hard_1"), "default_code": ""},
                            ],
                        },
                        {"type": "pro_tip", "title": "Pro Tip", "text": "", "code": ""},
                        {"type": "use_cases", "title": "Common use cases", "items": ["", "", ""]},
                    ]
                },
            },
            {
                "chapter_number": 5,
                "title": "Edge Cases",
                "chapter_type": "concept",
                "content": {
                    "blocks": [
                        {"type": "text", "title": "Watch out for", "content": ""},
                        {"type": "static_code", "title": "Edge case example", "code": "", "output": ""},
                        {"type": "callout", "variant": "warning", "title": "Rule of thumb", "text": ""},
                    ]
                },
            },
            {
                "chapter_number": 6,
                "title": "Core Keywords & Conventions",
                "chapter_type": "concept",
                "content": {
                    "blocks": [
                        {"type": "text", "title": "Key ideas", "content": ""},
                        {
                            "type": "keyword_cards",
                            "keywords": [
                                {"name": "return", "tag": "KEYWORD", "tag_color": "#3B82F6", "desc": "", "code": ""},
                                {"name": "_", "tag": "CONVENTION", "tag_color": "#6B7280", "desc": "", "code": ""},
                            ],
                        },
                        {"type": "code", "id": cid("try_2"), "title": "Try it", "default_code": ""},
                    ]
                },
            },
            {
                "chapter_number": 7,
                "title": "Common Mistakes",
                "chapter_type": "mistakes",
                "content": {
                    "mistakes": [
                        {"name": "", "icon": "ri-close-circle-fill", "desc": "", "fix": ""},
                        {"name": "", "icon": "ri-close-circle-fill", "desc": "", "fix": ""},
                        {"name": "", "icon": "ri-close-circle-fill", "desc": "", "fix": ""},
                    ]
                },
            },
            {
                "chapter_number": 8,
                "title": "Solved Problem Walkthrough",
                "chapter_type": "walkthrough",
                "content": {
                    "problem": {"title": "", "desc": "", "example": ""},
                    "steps": [
                        {"title": "Step 1: Understand", "text": ""},
                        {"title": "Step 2: Code", "code_id": cid("walkthrough"), "default_code": ""},
                        {"title": "Step 3: Complexity", "items": ["", ""]},
                    ],
                    "takeaway": "",
                },
            },
            {
                "chapter_number": 9,
                "title": "Interview Questions",
                "chapter_type": "interview",
                "content": {
                    "layout": "company_cards",
                    "questions": [
                        {"company": "Google", "role": "Software Engineer", "icon": "ri-google-fill", "color": "#4285F4", "tag": "", "question": ""},
                        {"company": "Amazon", "role": "SDE", "icon": "ri-amazon-fill", "color": "#FF9900", "tag": "", "question": ""},
                        {"company": "Microsoft", "role": "Engineer", "icon": "ri-microsoft-fill", "color": "#00A4EF", "tag": "", "question": ""},
                        {"company": "Spotify", "role": "Backend", "icon": "ri-spotify-fill", "color": "#1DB954", "tag": "", "question": ""},
                    ],
                    "tips": ["", "", ""],
                },
            },
            {
                "chapter_number": 10,
                "title": "Quick Quiz",
                "chapter_type": "quiz",
                "content": {
                    "questions": [
                        {"q": "", "opts": ["", "", ""], "correct": 0, "why": ""},
                        {"q": "", "opts": ["", "", ""], "correct": 0, "why": ""},
                        {"q": "", "opts": ["", "", ""], "correct": 0, "why": ""},
                        {"q": "", "opts": ["", "", ""], "correct": 0, "why": ""},
                        {"q": "", "opts": ["", "", ""], "correct": 0, "why": ""},
                    ]
                },
            },
        ],
        "_meta": {
            "language": lang,
            "template_version": "v1",
        },
    }


def _merge_template(template: dict, candidate: dict) -> dict:
    """Merge model output into the template, preserving template structure.

    Candidate can override strings/content values, but not the chapter/block types or IDs.
    """
    out = json.loads(json.dumps(template))

    def _sanitize_strings(obj):
        if isinstance(obj, str):
            # Avoid leaking JS-ish placeholders into UI.
            return re.sub(r"\bundefined\b", "", obj, flags=re.IGNORECASE).strip()
        if isinstance(obj, list):
            return [_sanitize_strings(x) for x in obj]
        if isinstance(obj, dict):
            return {k: _sanitize_strings(v) for k, v in obj.items()}
        return obj

    if isinstance(candidate, dict):
        desc = candidate.get("description")
        if isinstance(desc, str) and desc.strip():
            out["description"] = desc.strip()

        cand_chapters = candidate.get("chapters")
        if isinstance(cand_chapters, list):
            by_num: dict[int, dict] = {}
            for ch in cand_chapters:
                if isinstance(ch, dict) and isinstance(ch.get("chapter_number"), int):
                    by_num[ch["chapter_number"]] = ch

            for ch in out.get("chapters", []):
                num = ch.get("chapter_number")
                cand = by_num.get(num)
                if not isinstance(cand, dict):
                    continue

                # Title: allow override
                title = cand.get("title")
                if isinstance(title, str) and title.strip():
                    ch["title"] = title.strip()

                # Content merge per chapter type
                cand_content = cand.get("content")
                if not isinstance(cand_content, dict):
                    continue

                if ch.get("chapter_type") in {"concept", "syntax", "range", "sequences", "nested", "keywords", "dynamic"}:
                    # Blocks: merge by index (template dictates block order/types)
                    tpl_blocks = ((ch.get("content") or {}).get("blocks") or [])
                    cand_blocks = cand_content.get("blocks")
                    if isinstance(tpl_blocks, list) and isinstance(cand_blocks, list):
                        for i in range(min(len(tpl_blocks), len(cand_blocks))):
                            tb = tpl_blocks[i]
                            cb = cand_blocks[i]
                            if isinstance(tb, dict) and isinstance(cb, dict):
                                # Special-case carousel items so code_id stays intact.
                                if tb.get("type") == "carousel":
                                    tpl_items = tb.get("items")
                                    cand_items = cb.get("items")
                                    if isinstance(tpl_items, list) and isinstance(cand_items, list):
                                        for j in range(min(len(tpl_items), len(cand_items))):
                                            ti = tpl_items[j]
                                            ci = cand_items[j]
                                            if isinstance(ti, dict) and isinstance(ci, dict):
                                                for ik, iv in ci.items():
                                                    if ik in {"code_id"}:
                                                        continue
                                                    if isinstance(iv, (str, int, float, bool)) or iv is None:
                                                        ti[ik] = iv
                                                    elif isinstance(iv, (list, dict)):
                                                        ti[ik] = iv
                                        tb["items"] = tpl_items
                                    for k, v in cb.items():
                                        if k in {"type", "id", "code_id", "items"}:
                                            continue
                                        if isinstance(v, (str, int, float, bool)) or v is None:
                                            tb[k] = v
                                        elif isinstance(v, (list, dict)):
                                            tb[k] = v
                                    continue
                                # Keep template type and IDs, but copy over simple scalar fields
                                for k, v in cb.items():
                                    if k in {"type", "id", "code_id"}:
                                        continue
                                    if isinstance(v, (str, int, float, bool)) or v is None:
                                        tb[k] = v
                                    elif isinstance(v, (list, dict)):
                                        tb[k] = v
                    ch["content"] = {"blocks": tpl_blocks}

                elif ch.get("chapter_type") == "mistakes":
                    mistakes = cand_content.get("mistakes")
                    if isinstance(mistakes, list) and mistakes:
                        cleaned = []
                        for m in mistakes[:6]:
                            if not isinstance(m, dict):
                                continue
                            name = m.get("name")
                            desc = m.get("desc")
                            fix = m.get("fix")
                            if isinstance(name, str) and isinstance(desc, str) and isinstance(fix, str):
                                cleaned.append(
                                    {
                                        "name": name.strip(),
                                        "icon": (m.get("icon") or "ri-close-circle-fill"),
                                        "desc": desc.strip(),
                                        "fix": fix.strip(),
                                    }
                                )
                        if cleaned:
                            ch["content"] = {"mistakes": cleaned}

                elif ch.get("chapter_type") == "walkthrough":
                    tpl_content = ch.get("content") if isinstance(ch.get("content"), dict) else {}
                    tpl_problem = tpl_content.get("problem") if isinstance(tpl_content.get("problem"), dict) else {"title": "", "desc": "", "example": ""}
                    tpl_steps = tpl_content.get("steps") if isinstance(tpl_content.get("steps"), list) else []

                    problem = cand_content.get("problem") if isinstance(cand_content.get("problem"), dict) else {}
                    steps = cand_content.get("steps") if isinstance(cand_content.get("steps"), list) else []
                    takeaway = cand_content.get("takeaway") if isinstance(cand_content.get("takeaway"), str) else ""

                    p_title = problem.get("title") if isinstance(problem.get("title"), str) else ""
                    p_desc = problem.get("desc") if isinstance(problem.get("desc"), str) else ""
                    p_ex = problem.get("example") if isinstance(problem.get("example"), str) else ""

                    merged_problem = {
                        "title": (p_title.strip() or tpl_problem.get("title") or "Practice Problem"),
                        "desc": (p_desc.strip() or tpl_problem.get("desc") or "Solve the problem step by step."),
                        "example": (p_ex.strip() or tpl_problem.get("example") or ""),
                    }

                    # Merge steps by template index; preserve code_id.
                    merged_steps = []
                    for i in range(len(tpl_steps)):
                        ts = tpl_steps[i] if isinstance(tpl_steps[i], dict) else {}
                        cs = steps[i] if i < len(steps) and isinstance(steps[i], dict) else {}
                        ms = json.loads(json.dumps(ts))
                        for k, v in cs.items():
                            if k == "code_id":
                                continue
                            ms[k] = v
                        merged_steps.append(ms)

                    # Ensure there is at least one code step with default_code.
                    for s in merged_steps:
                        if isinstance(s, dict) and isinstance(s.get("code_id"), str):
                            if not isinstance(s.get("default_code"), str):
                                s["default_code"] = ""
                            break

                    ch["content"] = {"problem": merged_problem, "steps": merged_steps, "takeaway": takeaway.strip()}

                elif ch.get("chapter_type") == "interview":
                    layout = cand_content.get("layout")
                    questions = cand_content.get("questions")
                    tips = cand_content.get("tips")
                    if layout not in {"company_cards", "company_grid", "practice_list"}:
                        layout = "company_cards"
                    if not isinstance(questions, list):
                        questions = []
                    if not isinstance(tips, list):
                        tips = []
                    # Keep only expected fields per question
                    cleaned_q = []
                    for q in questions[:8]:
                        if not isinstance(q, dict):
                            continue
                        if isinstance(q.get("question"), str) and q.get("question").strip():
                            cleaned_q.append(q)
                    if cleaned_q:
                        ch["content"] = {"layout": layout, "questions": cleaned_q, "tips": tips[:6]}

                elif ch.get("chapter_type") == "quiz":
                    questions = cand_content.get("questions")
                    if isinstance(questions, list) and questions:
                        cleaned = []
                        for q in questions[:8]:
                            if not isinstance(q, dict):
                                continue
                            qq = q.get("q")
                            opts = q.get("opts")
                            correct = q.get("correct")
                            why = q.get("why")
                            if not (isinstance(qq, str) and isinstance(opts, list) and len(opts) >= 2 and isinstance(correct, int)):
                                continue
                            cleaned.append({"q": qq.strip(), "opts": opts[:4], "correct": int(correct), "why": (why or "").strip() if isinstance(why, str) else ""})
                        if cleaned:
                            ch["content"] = {"questions": cleaned}

    return _sanitize_strings(out)


def _normalize_and_validate_ai_payload(payload: dict, *, topic_id: str, template: dict) -> tuple[str, list[dict]]:
    if not isinstance(payload, dict):
        raise ValueError("AI payload must be an object")

    merged = _merge_template(template, payload)
    description = merged.get("description")
    if not isinstance(description, str):
        description = ""

    chapters = merged.get("chapters")
    if not isinstance(chapters, list) or not chapters:
        raise ValueError("Merged AI payload missing chapters")

    cleaned: list[dict] = []
    for ch in chapters:
        if not isinstance(ch, dict):
            continue
        num = ch.get("chapter_number")
        title = ch.get("title")
        chapter_type = ch.get("chapter_type")
        content = ch.get("content")
        if not isinstance(num, int) or num <= 0:
            continue
        if not isinstance(title, str) or not title.strip():
            continue
        if not isinstance(chapter_type, str) or chapter_type not in ALLOWED_CHAPTER_TYPES:
            chapter_type = "concept"
        if not isinstance(content, dict):
            content = {}

        cleaned.append(
            {
                "topic_id": topic_id,
                "chapter_number": num,
                "title": title.strip(),
                "chapter_type": chapter_type,
                "content": content,
            }
        )

    cleaned.sort(key=lambda d: d["chapter_number"])
    return description.strip(), cleaned


def _gemini_generate_topic_content_sync(*, topic_title: str, language_name: Optional[str], level_title: Optional[str], section_title: Optional[str]) -> dict:
    """Synchronous Gemini call. Wrap this in run_in_threadpool from async endpoints."""
    import google.generativeai as genai  # installed via google-generativeai

    genai.configure(api_key=_get_gemini_api_key())
    model_name = (os.getenv("GEMINI_TUNEX_MODEL", "") or os.getenv("GEMINI_MODEL", "") or "gemini-2.5-pro").strip()
    # Guard against common typo in the user message.
    if model_name.lower() == "gemini-2.5-pro":
        model_name = "gemini-2.5-pro"

    model = genai.GenerativeModel(model_name=model_name)

    template = _build_topic_template(topic_title=topic_title, language_name=language_name)
    template_json = json.dumps(template, ensure_ascii=False)

    prompt = f"""
You generate structured Tunex topic content.

Context:
- Topic title: {topic_title}
- Language: {language_name or ''}
- Level: {level_title or ''}
- Section: {section_title or ''}

Return ONLY valid JSON (no markdown fences, no explanation).

CRITICAL:
- You MUST return the exact same JSON structure as the TEMPLATE below.
- Do NOT add or remove chapters.
- Do NOT change any `type`, `id`, or `code_id` fields.
- Fill in ALL empty strings with meaningful content.
- Do NOT output the word "undefined" anywhere.
- All code examples must be in {language_name or 'Python'} and runnable.
- For the carousel in "Patterns & Variations": include Easy/Medium/Hard slides with increasing difficulty, each with a 1-2 sentence description and runnable code.
- Ensure all multi-line strings are valid JSON strings (use \n for newlines).
- Use only double quotes for JSON strings and property names.
- Never include placeholder tasks like "Your code here", "TODO", or assignments to None for required outputs.
- Every code block must be immediately executable and demonstrate the concept without asking the user to fill anything in.
- Keep Common Mistakes extremely short: each mistake name under 6 words, each desc 1 sentence, each fix 1 sentence.
- Keep the Walkthrough simple: 3 steps only (Understand, Code, Complexity), no trace tables, no undefined placeholders.

TEMPLATE:
{template_json}
""".strip()

    generation_config = None
    try:
        from google.generativeai.types import GenerationConfig
        generation_config = GenerationConfig(
            response_mime_type="application/json",
            temperature=0.4,
        )
    except Exception:
        generation_config = {"response_mime_type": "application/json", "temperature": 0.4}

    resp = model.generate_content(prompt, generation_config=generation_config)
    text = getattr(resp, "text", None) or ""
    raw_json = _extract_json_object(text)
    try:
        return json.loads(raw_json)
    except json.JSONDecodeError:
        # Retry with relaxed parsing and common JSON fixes (trailing commas, control chars)
        try:
            return json.loads(raw_json, strict=False)
        except json.JSONDecodeError:
            cleaned = re.sub(r",\s*([}\]])", r"\1", raw_json)
            cleaned = _repair_json_loose(cleaned)
            try:
                return json.loads(cleaned, strict=False)
            except json.JSONDecodeError:
                # Last resort: repair JSON using json-repair if available.
                try:
                    from json_repair import repair_json
                    repaired = repair_json(raw_json)
                    return json.loads(repaired, strict=False)
                except Exception:
                    repaired = repair_json(cleaned) if 'repair_json' in locals() else cleaned
                    return json.loads(repaired, strict=False)

def get_supabase() -> Client:
    from supabase import create_client
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise HTTPException(status_code=500, detail="Database configuration missing")
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

@router.get("/topics/{topic_id}/full")
async def get_topic_full(topic_id: str):
    """
    Get topic metadata and all chapters with full content.
    """
    supabase = get_supabase()
    
    # Mock Data Injection for Demo
    if topic_id == "1668cfdf-e56c-4c78-9107-e739bcbd6766":
        return {
            "id": topic_id,
            "title": "What is Python & Why Companies Use It",
            "description": "Discover the origins, philosophy, and massive industry adoption that makes Python the #1 language in the world.",
            "track_title": "Python Fundamentals",
            "language_name": "Python",
            "level_title": "Fundamentals",
            "section_title": "Python",
            "chapters": [
                {
                    "id": "c1",
                    "chapter_number": 1,
                    "title": "The Genesis of Python",
                    "chapter_type": "concept",
                    "content": {
                        "blocks": [
                            {
                                "type": "text",
                                "title": "A Hobby Project That Conquered the World",
                                "content": "Python was conceived in the late 1980s by **Guido van Rossum** at CWI in the Netherlands as a successor to the ABC programming language. Its implementation began in December 1989. Guido wanted a language that was distinct for its readability and simplicity."
                            },
                            {
                                "type": "callout",
                                "variant": "info",
                                "title": "Why 'Python'?",
                                "text": "It wasn't named after the snake! Guido was a big fan of 'Monty Python's Flying Circus'. He wanted a name that was short, unique, and slightly mysterious."
                            },
                            {
                                "type": "split",
                                "left": {
                                    "title": "The Philosophy: Zen of Python",
                                    "content": "Python follows a core philosophy called 'The Zen of Python' (PEP 20). Key principles include:\n\n1. **Beautiful is better than ugly.**\n2. **Explicit is better than implicit.**\n3. **Simple is better than complex.**\n4. **Readability counts.**\n\nThis focus on readability is why Python code often looks like executable pseudocode."
                                },
                                "right": {
                                    "type": "code_static",
                                    "content": "import this\n\n# Try running this in your terminal!\n# It prints the 19 guiding principles of Python."
                                }
                            }
                        ]
                    }
                },
                {
                    "id": "c2",
                    "chapter_number": 2,
                    "title": "The Interview Superpower",
                    "chapter_type": "concept",
                    "content": {
                        "blocks": [
                            {
                                "type": "text",
                                "title": "Why Use Python in Coding Interviews?",
                                "content": "In a 45-minute technical interview, **speed is everything**. You are judged on your problem-solving logic, not your ability to write boilerplate code. Python is the gold standard for interviews because it lets you write logic straight away."
                            },
                            {
                                "type": "split",
                                "left": {
                                    "title": "Less Typing, More Thinking",
                                    "content": "Compare reading a file in Java versus Python. In Python, it's a one-liner. In Java, you need imports, class definitions, try-catch blocks, and buffered readers. \n\n**Advantage:** You spend less time fighting syntax and more time solving the algorithm."
                                },
                                "right": {
                                    "type": "code_static",
                                    "content": "# Java\npublic class Main {\n  public static void main(String[] args) {\n    System.out.println(\"Hello\");\n  }\n}\n\n# Python\nprint(\"Hello\")"
                                }
                            },
                            {
                                "type": "callout",
                                "variant": "success",
                                "title": "Built-in Superpowers",
                                "text": "Python's standard library ('Batteries Included') is insanely powerful. Need a heap? `heapq`. Need a hash map? `dict`. Need permutations? `itertools`. You don't have to implement these from scratch."
                            }
                        ]
                    }
                },
                {
                    "id": "c3",
                    "chapter_number": 3,
                    "title": "Key Features & Advantages",
                    "chapter_type": "concept",
                    "content": {
                        "blocks": [
                            {
                                "type": "carousel",
                                "items": [
                                    {
                                        "title": "Interpreted & Dynamic",
                                        "desc": "No compilation step. Variables don't need explicit type declarations. Rapid prototyping is effortless.",
                                        "code_id": "feat_dyn",
                                        "default_code": "x = 10      # It's an integer\nprint(type(x))\n\nx = \"Hello\" # Now it's a string\nprint(type(x))"
                                    },
                                    {
                                        "title": "Memory Management",
                                        "desc": "Python uses automatic garbage collection. You don't need to manually allocate and free memory like in C/C++.",
                                        "code_id": "feat_mem",
                                        "default_code": "import sys\n\na = []\nb = a\n# Python tracks references automatically\nprint(sys.getrefcount(a))"
                                    },
                                    {
                                        "title": "Huge Ecosystem",
                                        "desc": "PyPI (Python Package Index) has over 400,000 packages. If you want to do it, there's a library for it.",
                                        "code_id": "feat_lib",
                                        "default_code": "# No installation here, but imagine:\n# import pandas as pd\n# import numpy as np\n# import torch\nprint(\"Libraries for everything!\")"
                                    }
                                ]
                            }
                        ]
                    }
                },
                {
                    "id": "c4",
                    "chapter_number": 4,
                    "title": "Careers & Salaries",
                    "chapter_type": "concept",
                    "content": {
                        "blocks": [
                            {
                                "type": "text",
                                "title": "Where Can Python Take You?",
                                "content": "Python is a general-purpose language, meaning it's used everywhere. Here are the top domains and average US salaries (2024 data)."
                            },
                            {
                                "type": "cards",
                                "title": "High-Paying Fields",
                                "items": [
                                    {
                                        "title": "Data Scientist",
                                        "value": "$120k - $180k+",
                                        "icon": "ri-brain-line",
                                        "tags": ["TensorFlow", "PyTorch", "Pandas"]
                                    },
                                    {
                                        "title": "Backend Engineer",
                                        "value": "$115k - $160k",
                                        "icon": "ri-server-line",
                                        "tags": ["Django", "FastAPI", "Flask"]
                                    },
                                    {
                                        "title": "DevOps / SRE",
                                        "value": "$130k+",
                                        "icon": "ri-cloud-windy-line",
                                        "tags": ["Ansible", "Docker", "Scripting"]
                                    }
                                ]
                            }
                        ]
                    }
                },
                {
                    "id": "c5",
                    "chapter_number": 5,
                    "title": "Who Uses Python?",
                    "chapter_type": "interview",
                    "content": {
                        "layout": "company_grid",
                        "questions": [
                            {
                                "company": "Google",
                                "icon": "ri-google-fill",
                                "color": "#4285F4",
                                "tag_short": "Search & AI",
                                "use_case": "Python is used for system building, code review tools, and extensive AI/ML research.",
                                "problem_id": "p_google"
                            },
                            {
                                "company": "Netflix",
                                "icon": "ri-netflix-fill",
                                "color": "#E50914",
                                "tag_short": "Streaming",
                                "use_case": "Uses Python for its recommendation engine and content distribution network.",
                                "problem_id": "p_netflix"
                            },
                            {
                                "company": "Instagram",
                                "icon": "ri-instagram-line",
                                "color": "#E1306C",
                                "tag_short": "Social",
                                "use_case": "Runs the world's largest deployment of the Django web framework.",
                                "problem_id": "p_insta"
                            },
                            {
                                "company": "NASA",
                                "icon": "ri-rocket-line",
                                "color": "#0B3D91",
                                "tag_short": "Science",
                                "use_case": "Analyzes observational data from the James Webb Space Telescope.",
                                "problem_id": "p_nasa"
                            },
                            {
                                "company": "Spotify",
                                "icon": "ri-spotify-fill",
                                "color": "#1DB954",
                                "tag_short": "Music",
                                "use_case": "Used for backend services and data analysis to personalize music.",
                                "problem_id": "p_spotify"
                            }
                        ]
                    }
                },
                {
                    "id": "c6",
                    "chapter_number": 6,
                    "title": "Mastery Check",
                    "chapter_type": "quiz",
                    "content": {
                        "questions": [
                            {
                                "q": "Who created Python?",
                                "opts": ["Elon Musk", "Guido van Rossum", "Dennis Ritchie"],
                                "correct": 1,
                                "why": "Guido started Python as a hobby project in 1989."
                            },
                            {
                                "q": "Why is Python preferred in interviews?",
                                "opts": ["It runs faster", "It has less boilerplate & high readability", "It is statically typed"],
                                "correct": 1,
                                "why": "Less syntax means you can focus on the algorithm, not the code."
                            },
                            {
                                "q": "Which of these is NOT a Python web framework?",
                                "opts": ["Django", "React", "FastAPI"],
                                "correct": 1,
                                "why": "React is a JavaScript library. Django and FastAPI are Python frameworks."
                            }
                        ]
                    }
                }
            ]
        }

    # 1. Get Topic Metadata
    # Note: lcoding_topics in Supabase does not currently have a `description` column.
    topic_res = supabase.table("lcoding_topics").select("id, title, order_index, section_id").eq("id", topic_id).execute()
    if not topic_res.data:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    topic = topic_res.data[0]

    # 1b. Backtrack Topic -> Section -> Level -> Language (for UI + smarter YouTube searches)
    section_title: Optional[str] = None
    level_title: Optional[str] = None
    language_name: Optional[str] = None
    track_title: Optional[str] = None

    section_id = topic.get("section_id")
    if section_id:
        section_res = supabase.table("lcoding_sections").select("id, title, level_id").eq("id", section_id).execute()
        if section_res.data:
            section = section_res.data[0]
            section_title = section.get("title")
            level_id = section.get("level_id")
            if level_id:
                level_res = supabase.table("lcoding_levels").select("id, title, language_id").eq("id", level_id).execute()
                if level_res.data:
                    level = level_res.data[0]
                    level_title = level.get("title")
                    language_id = level.get("language_id")
                    if language_id:
                        language_res = supabase.table("lcoding_languages").select("id, name").eq("id", language_id).execute()
                        if language_res.data:
                            language = language_res.data[0]
                            language_name = language.get("name")

    if language_name and level_title:
        if language_name.lower() in level_title.lower():
            track_title = level_title
        else:
            track_title = f"{language_name} {level_title}".strip()
    else:
        track_title = language_name or level_title or section_title
    
    # 2. Get Chapters (Sorted)
    chapters_res = supabase.table("lcoding_topic_chapters")\
        .select("id, chapter_number, chapter_type, title, content")\
        .eq("topic_id", topic_id)\
        .order("chapter_number")\
        .execute()

    # If the topic has no chapters, auto-generate them via Gemini and persist.
    if not chapters_res.data:
        try:
            ensure_res = await ensure_topic_content(topic_id=topic_id)
            chapters_res = supabase.table("lcoding_topic_chapters")\
                .select("id, chapter_number, chapter_type, title, content")\
                .eq("topic_id", topic_id)\
                .order("chapter_number")\
                .execute()
            # If we generated a hero description, attach it to the response (not persisted).
            generated_description = (ensure_res or {}).get("description") if isinstance(ensure_res, dict) else None
        except HTTPException:
            raise
        except Exception as e:
            logger.exception("AI auto-populate failed for topic_id=%s: %s", topic_id, e)
        
    return {
        "id": topic["id"],
        "title": topic["title"],
        # `lcoding_topics` doesn't have description yet; use generated one when available.
        "description": (locals().get("generated_description") or ""),
        "chapters": chapters_res.data,
        "track_title": track_title,
        "language_name": language_name,
        "level_title": level_title,
        "section_title": section_title,
    }


@router.post("/topics/{topic_id}/ai/ensure")
async def ensure_topic_content(topic_id: str, force: bool = False):
    """Ensure a topic has chapters in `lcoding_topic_chapters`.

    If empty (or `force=true`), generate chapters using Gemini and insert them.
    Returns a small status payload.
    """
    supabase = get_supabase()

    # Fetch topic + context
    # Note: lcoding_topics in Supabase does not currently have a `description` column.
    topic_res = supabase.table("lcoding_topics").select("id, title, section_id").eq("id", topic_id).execute()
    if not topic_res.data:
        raise HTTPException(status_code=404, detail="Topic not found")
    topic = topic_res.data[0]

    # Existing chapters?
    existing = supabase.table("lcoding_topic_chapters").select("id").eq("topic_id", topic_id).limit(1).execute()
    if existing.data and not force:
        return {"status": "ok", "generated": False, "reason": "already_has_content"}

    # Resolve context titles
    section_title: Optional[str] = None
    level_title: Optional[str] = None
    language_name: Optional[str] = None

    section_id = topic.get("section_id")
    if section_id:
        section_res = supabase.table("lcoding_sections").select("id, title, level_id").eq("id", section_id).execute()
        if section_res.data:
            section = section_res.data[0]
            section_title = section.get("title")
            level_id = section.get("level_id")
            if level_id:
                level_res = supabase.table("lcoding_levels").select("id, title, language_id").eq("id", level_id).execute()
                if level_res.data:
                    level = level_res.data[0]
                    level_title = level.get("title")
                    language_id = level.get("language_id")
                    if language_id:
                        language_res = supabase.table("lcoding_languages").select("id, name").eq("id", language_id).execute()
                        if language_res.data:
                            language = language_res.data[0]
                            language_name = language.get("name")

    # Generate via Gemini in a thread pool (avoid blocking the event loop)
    try:
        topic_title = str(topic.get("title") or "").strip()
        payload = await run_in_threadpool(
            _gemini_generate_topic_content_sync,
            topic_title=topic_title,
            language_name=language_name,
            level_title=level_title,
            section_title=section_title,
        )
        template = _build_topic_template(topic_title=topic_title, language_name=language_name)
        description, chapter_rows = _normalize_and_validate_ai_payload(payload, topic_id=topic_id, template=template)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Gemini generation failed: %s", e)
        raise HTTPException(status_code=500, detail=f"Gemini generation failed: {e}")

    # If force, clear existing chapters first
    if force:
        try:
            supabase.table("lcoding_topic_chapters").delete().eq("topic_id", topic_id).execute()
        except Exception as e:
            logger.warning("Could not clear existing chapters for force=true: %s", e)

    # Insert chapters
    try:
        supabase.table("lcoding_topic_chapters").insert(chapter_rows).execute()
    except Exception as e:
        logger.exception("Failed inserting generated chapters: %s", e)
        raise HTTPException(status_code=500, detail=f"Failed to insert generated chapters: {e}")

    return {"status": "ok", "generated": True, "chapters_inserted": len(chapter_rows), "description": description}
