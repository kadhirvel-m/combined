# Security Audit Report

**Date:** 2026-03-13  
**Scope:** Full codebase — `paper/` (PaperX backend) and `tunex/` (TuNeX backend)  
**Auditor:** GitHub Copilot Automated Security Review

---

## Executive Summary

A comprehensive security review of the PaperX and TuNeX applications identified **two critical**, **four high**, and **several medium/low** severity vulnerabilities. The most severe finding is the **direct commitment of production API keys, database service-role credentials, and a Google Cloud private key** to the public Git repository. **These credentials must be rotated immediately.**

---

## Findings

### 🔴 CRITICAL — Secrets Committed to Git Repository

| ID | File | Issue |
|----|------|-------|
| C-01 | `paper/.env` | OpenAI, Gemini, SerpAPI, Supabase service-role key, Cloudflare, OpenRouter, and YouTube API keys committed in plaintext |
| C-02 | `tunex/.env` | Supabase service-role key, OpenAI, Gemini, SerpAPI, OpenRouter, YouTube API keys committed in plaintext |
| C-03 | `paper/service_account_key.json` | Google Cloud service account **private key** (`paperx-pro@gen-lang-client-0948404692`) committed in plaintext |

**Impact:**  
Any person with read access to this repository (or any clone/fork) has full access to:
- All AI provider accounts (OpenAI, Gemini, OpenRouter) — billed usage can be abused
- The Supabase project with **service-role key**, which **bypasses Row-Level Security** and grants unrestricted read/write/delete on all database tables
- Google Cloud project `gen-lang-client-0948404692` via the committed service account private key

**Remediation (IMMEDIATE ACTION REQUIRED):**
1. **Rotate ALL committed credentials immediately.** Assume they are compromised.
   - Revoke and reissue: OpenAI key, Gemini keys, SerpAPI keys, Cloudflare keys, OpenRouter keys, YouTube API key
   - Regenerate Supabase service-role key and anon key for both projects
   - Delete and re-create the Google Cloud service account (`paperx-pro@…`) and download a new key
2. **Remove the files from Git history** using `git filter-repo` or BFG Repo-Cleaner — deleting the files alone does not remove them from history.
3. **Add exclusion patterns to `.gitignore`** (already done in this PR).
4. **Use `.env.example`** files (added in this PR) as the only committed reference.

---

### 🔴 CRITICAL — JWT Secret Falls Back to Supabase Service-Role Key

| ID | File | Line |
|----|------|------|
| C-04 | `tunex/main.py` | ~430 |

**Before this fix:** `JWT_SECRET` could silently resolve to `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_ANON_KEY` if a dedicated `JWT_SECRET` was not set. This created a dangerous coupling: knowing one credential was enough to abuse both the database and forge JWT tokens.

**Fix applied:** The fallback to Supabase keys has been removed. The application now requires `JWT_SECRET`, `JWT_SECRET_KEY`, or `SUPABASE_JWT_SECRET` to be explicitly set, and raises a `RuntimeError` if none is found.

**Additional action required:** Set a unique, high-entropy value for `JWT_SECRET` in your `.env` (e.g., `openssl rand -hex 32`).

---

### 🟠 HIGH — `"null"` Origin Allowed in CORS (CSRF via Sandboxed Iframes)

| ID | File | Line |
|----|------|------|
| H-01 | `paper/main.py` | ~25819 |

**Before this fix:** The string `"null"` was listed as an allowed CORS origin and the `allow_origin_regex` also matched the literal `null`. Browsers send `Origin: null` for requests from sandboxed iframes, `data:` URIs, and some redirected cross-origin flows. This would allow an attacker to embed a malicious page and make credentialed cross-origin requests as the victim.

**Fix applied:** `"null"` has been removed from the allowed origins list and from the regex.

---

### 🟠 HIGH — Wildcard CORS + Credentials in `tunex/main.py`

| ID | File | Line |
|----|------|------|
| H-02 | `tunex/main.py` | ~248-254 |

**Before this fix:** `allow_origins=["*"]` was combined with `allow_credentials=True`. While modern browsers block such responses per the CORS spec, this configuration is still wrong and will break with future browser updates or non-browser HTTP clients. It also signals that no thought was given to legitimate origin restriction.

**Fix applied:** CORS is now restricted to a configurable list of explicit origins (defaulting to `https://tunex.tech` and localhost variants). The list can be overridden via the `CORS_ALLOWED_ORIGINS` environment variable (comma-separated).

---

### 🟠 HIGH — Hardcoded Fallback for `PRINT_OTP_HASH_SECRET`

| ID | File | Line |
|----|------|------|
| H-03 | `paper/main.py` | ~172 |

**Before this fix:** `PRINT_OTP_HASH_SECRET` fell back to the literal string `"paperx-print-otp"` when neither `PRINT_OTP_HASH_SECRET` nor `AUTH_REFRESH_HASH_SECRET` were set. A predictable HMAC secret allows attackers to forge print OTPs offline.

**Fix applied:** The hardcoded fallback has been replaced with a `secrets.token_hex(32)` value generated at runtime, with a `RuntimeWarning` to alert operators that the variable is unset. **Set `PRINT_OTP_HASH_SECRET` explicitly in production.**

---

### 🟠 HIGH — No `.gitignore` Exclusions for Sensitive Files

| ID | File |
|----|------|
| H-04 | `.gitignore` (root) |

**Before this fix:** The `.gitignore` only excluded `__pycache__/` and `*.pyc`. There were no rules excluding `.env`, `service_account_key.json`, `*.pem`, `*.key`, or `*.json` credential files.

**Fix applied:** `.gitignore` has been updated with comprehensive patterns for secrets, credentials, virtual environments, IDE files, and build artifacts.

---

### 🟡 MEDIUM — Profile Image Upload Lacks Magic-Byte Validation

| ID | File | Function |
|----|------|----------|
| M-01 | `paper/main.py` | `_upload_profile_asset()` |

**Before this fix:** Upload validation for profile images only checked the file extension. The `Content-Type` header is trivially spoofable, and an attacker could upload an executable disguised as a `.png`.

**Fix applied:** Magic-byte signatures are now checked for each accepted image format (PNG: `\x89PNG`, JPEG: `\xFF\xD8\xFF`, WebP: `RIFF`). PDF uploads also validate the `%PDF-` magic header (consistent with the existing RAG upload validator).

---

### 🟡 MEDIUM — Sensitive Error Details Printed to stdout in Production

| ID | File | Line |
|----|------|------|
| M-02 | `paper/main.py` | ~29896 |

**Before this fix:** `print(f"[Auth] Error validating token: {e}")` could expose raw exception messages (including token fragments or upstream error payloads) to anyone with access to application logs.

**Fix applied:** Replaced with `supabase_logger.warning("Error validating auth token: %s", type(e).__name__)` — logs only the exception class name, never the message or token content.

---

### 🟡 MEDIUM — Missing Security Headers on `tunex` Service

| ID | File |
|----|------|
| M-03 | `tunex/main.py` |

**Before this fix:** No security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, etc.) were set on responses from the TuNeX API.

**Fix applied:** Security headers are now injected by the HTTP middleware (matching the pattern already used by the PaperX service).

---

### 🔵 LOW — Token Included in JSON Response Body

| ID | File | Function |
|----|------|----------|
| L-01 | `paper/main.py` | `login_user()` |

Access and refresh tokens are returned both as HTTP-only cookies and in the JSON response body. Including tokens in the body makes them accessible to JavaScript (via `fetch` response parsing), negating the protection offered by HTTP-only cookies.

**Recommendation:** In a future iteration, consider returning only a success status in the JSON body and relying solely on HTTP-only cookies for token transport.

---

### 🔵 LOW — `vscode-webview://` Allowed in CORS `allow_origin_regex`

| ID | File | Line |
|----|------|------|
| L-02 | `paper/main.py` | ~25821 (before fix) |

**Fix applied (side-effect of H-01 fix):** The `vscode-webview://.*` wildcard has been removed from the CORS regex. VS Code extension webviews should be served differently and do not need CORS exceptions in production.

---

### 🔵 LOW — `APP_DEBUG` Can Enable Verbose Logging in Production

| ID | File | Line |
|----|------|------|
| L-03 | `tunex/main.py` | ~242 |

If `APP_DEBUG=true` is accidentally set in production, full debug logs (including Supabase row data) are emitted. Ensure `APP_DEBUG=false` in all production environments.

---

## Recommendations Summary

| Priority | Action |
|----------|--------|
| **Immediate** | Rotate ALL leaked credentials (see C-01, C-02, C-03) |
| **Immediate** | Run `git filter-repo`/BFG to purge secrets from Git history |
| **Immediate** | Set `JWT_SECRET` to a random 256-bit value in all environments |
| **Immediate** | Set `PRINT_OTP_HASH_SECRET` to a random 256-bit value |
| Short-term | Enable GitHub secret scanning / Dependabot alerts on the repo |
| Short-term | Consider moving to a secrets manager (HashiCorp Vault, AWS Secrets Manager, GCP Secret Manager) |
| Short-term | Add Supabase RLS policies and verify they are enforced for all tables |
| Medium-term | Replace `requests.post` with `httpx.AsyncClient` throughout to enable async I/O and stricter timeouts |
| Medium-term | Add integration tests that verify CORS, auth, and upload validation logic |
| Long-term | Move tokens out of the JSON response body (return only via HTTP-only cookies) |

---

## Fixes Applied in This PR

| ID | Fix |
|----|-----|
| C-04 | Removed `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_ANON_KEY` fallback for JWT secret |
| H-01 | Removed `"null"` and `vscode-webview://` from CORS allowed origins |
| H-02 | Replaced wildcard CORS with explicit origin list in `tunex/main.py` |
| H-03 | Replaced hardcoded `"paperx-print-otp"` fallback with runtime-generated secret + warning |
| H-04 | Rewrote `.gitignore` with comprehensive exclusion patterns |
| M-01 | Added magic-byte validation for profile image and PDF uploads |
| M-02 | Replaced `print()` with structured logger, masking token content |
| M-03 | Added security headers middleware to `tunex/main.py` |
| — | Added `paper/.env.example` and `tunex/.env.example` templates |
