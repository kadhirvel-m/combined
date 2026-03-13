# PaperX — Security Assessment Report

**Date:** 2026-03-13  
**Scope:** `paper/` directory (FastAPI back-end + UI + helper packages)  
**Classification:** Internal — Handle with Care

---

## Executive Summary

A comprehensive security review of the PaperX application identified **5 critical or high-severity issues** that have been **remediated in this PR**, plus several medium/lower-priority findings that are documented below with recommended remediation steps.

---

## 🔴 Critical / High — FIXED

### C-1 · Hardcoded fallback secret for HMAC signing
| | |
|---|---|
| **File** | `main.py` line 172 |
| **Severity** | Critical |
| **Status** | ✅ Fixed |

**Before:**
```python
PRINT_OTP_HASH_SECRET = (os.getenv("PRINT_OTP_HASH_SECRET") or AUTH_REFRESH_HASH_SECRET or "paperx-print-otp").strip()
```
The fallback literal `"paperx-print-otp"` is publicly known, allowing an attacker
to forge any print-OTP HMAC token.

**After:**  
The fallback is removed. If neither env var is set at startup the application
emits a `RuntimeWarning` and generates a random ephemeral secret for that process
lifetime (tokens will not survive restarts, which is intentional to force operators
to set the variable properly).

---

### C-2 · CORS allows `"null"` origin with `allow_credentials=True`
| | |
|---|---|
| **File** | `main.py` ~line 25808 |
| **Severity** | Critical |
| **Status** | ✅ Fixed |

Browsers send `Origin: null` from `file://` URLs and sandboxed iframes.  
Explicitly allowing `"null"` combined with `allow_credentials=True` let an
attacker craft a local HTML file that made fully authenticated cross-origin
requests to the API.

**After:**
- `"null"` removed from both `allow_origins` list and `allow_origin_regex`.
- `allow_methods` narrowed from `["*"]` to an explicit safe list (excludes `TRACE`).
- `allow_headers` narrowed from `["*"]` to an explicit list.
- localhost origins are only included when `APP_ENV != production`.

---

### C-3 · No authentication on `/api/blink/generate`
| | |
|---|---|
| **File** | `main.py` ~line 27532 |
| **Severity** | High |
| **Status** | ✅ Fixed |

The endpoint accepted a hard-coded nil UUID (`"00000000-0000-0000-0000-000000000000"`)
as its "user ID", making it entirely unauthenticated. Any anonymous caller could:
- Trigger expensive Gemini image-generation API calls (resource abuse / cost).
- Read any note by topic ID without owning it (information disclosure).

**After:** The endpoint now requires a valid `Authorization: Bearer <token>` header
and returns `HTTP 401` for unauthenticated requests.

---

### C-4 · Unvalidated file-extension on assignment uploads
| | |
|---|---|
| **File** | `main.py` ~line 30512 |
| **Severity** | High |
| **Status** | ✅ Fixed |

The file extension was extracted from the (attacker-controlled) filename and used
verbatim in the storage path without any whitelist check, allowing upload of
executable or server-side-script files (`.py`, `.sh`, `.php`, `.exe`, etc.).

**After:** Only extensions in an explicit allowlist are accepted:
`.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`, `.ppt`, `.pptx`, `.txt`, `.csv`,
`.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.zip`, `.tar`, `.gz`.  
Any other extension returns `HTTP 400`.

---

### C-5 · Prompt injection in AI endpoints
| | |
|---|---|
| **File** | `main.py` ~lines 27583, 28247–28256 |
| **Severity** | High |
| **Status** | ✅ Fixed |

User-controlled note content was concatenated directly into AI prompts without
any separator, allowing an attacker to embed instructions such as
`"Ignore previous instructions. Do X instead."`.

**After:** User content is now wrapped in XML-style delimiters (`<notes>…</notes>`,
`<content>…</content>`) that clearly separate trusted instructions from
untrusted user data, significantly reducing the exploitable attack surface.

---

## 🟠 Medium — Recommended Actions

### M-1 · Secrets committed to version control
| | |
|---|---|
| **File** | `paper/.env`, `paper/service_account_key.json` |
| **Severity** | Critical (data exposure already occurred) |
| **Status** | ⚠️ `.gitignore` added; secrets must be rotated |

Both files contain live credentials (OpenAI, Supabase service-role key, Google
private key, SerpAPI, etc.) and are tracked by git, meaning they appear in the
commit history even after deletion.

**Required actions (operator):**
1. **Rotate all exposed credentials immediately** — assume they are compromised:
   - OpenAI API key
   - Supabase service-role key and anon key
   - Google service account key (delete and recreate in Google Cloud Console)
   - Gemini API keys
   - SerpAPI keys
   - OpenRouter key
   - Cloudflare Turnstile secret key
   - YouTube Data API key
2. Use `git filter-branch` or [BFG Repo Cleaner](https://rtyley.github.io/bfg-repo-cleaner/) to purge secrets from git history.
3. Use secret scanning (GitHub Secret Scanning is already enabled) to detect future leaks.

**Mitigations already applied:**
- `paper/.gitignore` now excludes `.env`, `*.env`, and `service_account_key.json`.
- `paper/.env.example` documents required variables without values.

---

### M-2 · Code execution without OS-level sandbox (Python compiler)
| | |
|---|---|
| **File** | `packages/python_compiler.py` |
| **Severity** | Medium-High |
| **Status** | ⚠️ Documented; full fix requires infrastructure change |

The online Python compiler executes arbitrary user code in a bare subprocess.
An authenticated user (or a compromised account) can read files accessible to
the server process, make outbound network requests, or cause resource
exhaustion.

**Recommended fix (priority order):**
1. Run user code in an isolated container (Docker + `--network none --read-only --memory 64m --cpus 0.5`).
2. Use [Judge0](https://github.com/judge0/judge0) or [Piston](https://github.com/engineer-man/piston) as a purpose-built sandbox.
3. Apply `seccomp`, AppArmor, or `gVisor` to restrict syscalls.

The module-level docstring in `python_compiler.py` now documents the risk and
recommended hardening steps.

---

### M-3 · Localhost origins in production CORS
| | |
|---|---|
| **File** | `main.py` (CORS config) |
| **Severity** | Medium |
| **Status** | ✅ Fixed (localhost origins only included in non-production) |

Previously localhost was always included; this is now gated on `APP_ENV`.

---

### M-4 · ILIKE queries using f-strings (anti-pattern)
| | |
|---|---|
| **File** | `main.py` lines ~5604, ~22898, ~22908, ~27496, ~36077 |
| **Severity** | Low (Supabase SDK parameterises values) |
| **Status** | ⚠️ Not changed — no injection risk, but should be refactored |

The Supabase PostgREST SDK already parameterises the value passed to `.ilike()`,
so there is no actual SQL injection. However, using f-strings for query
construction is a bad pattern that makes code reviews harder. Future work
should replace these with explicit variable references.

---

### M-5 · Missing ownership checks on some resource endpoints
| | |
|---|---|
| **File** | `main.py` (feedback, assignments GET) |
| **Severity** | Medium |
| **Status** | ⚠️ Partially mitigated by Supabase RLS; verify RLS policies |

Some GET endpoints authenticate the caller but do not explicitly filter results
to resources owned by that user. If Supabase Row-Level Security (RLS) is not
enabled on those tables the caller could enumerate other users' resources (IDOR).

**Action:** Audit all tables to ensure RLS policies are enabled and correct, or
add explicit `.eq("owner_id", user_id)` filters in every query.

---

### M-6 · File upload MIME-type validation (extension-only)
| | |
|---|---|
| **File** | `main.py` (marketplace upload), `main.py` (assignment upload — now fixed) |
| **Severity** | Medium |
| **Status** | ⚠️ Assignment upload fixed (extension whitelist); marketplace upload uses extension only |

Extension-only checks can be bypassed by renaming a file. Adding magic-byte
(MIME-sniffing) validation using `python-magic` provides defence-in-depth.

```python
# Example (requires `pip install python-magic`)
import magic
mime = magic.from_buffer(file_bytes[:2048], mime=True)
ALLOWED_MIMES = {"application/pdf", "image/jpeg", "image/png", ...}
if mime not in ALLOWED_MIMES:
    raise HTTPException(400, "File content does not match declared type")
```

---

## 🟢 Security Strengths (Good Practices Already in Place)

| Feature | Location |
|---|---|
| Rate limiting (global, auth, login, AI) | `main.py` rate-limit middleware |
| Security response headers (HSTS, X-Frame-Options, X-Content-Type-Options, CSP) | `main.py` security headers middleware |
| HMAC-signed refresh tokens with rotation | `main.py` auth module |
| Abuse scoring and automatic IP blocking | `main.py` abuse middleware |
| Audit logging for sensitive mutations | `main.py` audit-log functions |
| Turnstile CAPTCHA on login/signup | `main.py` Turnstile verify |
| Input validation via Pydantic models | Throughout `main.py` |
| Parameterised DB queries (Supabase SDK) | Throughout `main.py` |

---

## Remediation Priority Matrix

| Priority | Finding | Effort |
|---|---|---|
| 🔴 Immediate | Rotate all exposed credentials (M-1) | 1–2 hours |
| 🔴 Immediate | Purge secrets from git history (M-1) | 2–4 hours |
| 🟠 This sprint | Add OS-level sandbox for Python compiler (M-2) | 1–2 days |
| 🟠 This sprint | Audit and enable Supabase RLS policies (M-5) | 1–2 days |
| 🟡 Next sprint | Add MIME-type magic-byte validation for uploads (M-6) | 4 hours |
| 🟡 Next sprint | Refactor f-string ilike patterns (M-4) | 2 hours |

---

*Generated by automated security review — 2026-03-13*
