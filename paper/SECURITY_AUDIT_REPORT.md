# 🔒 PaperX Security Audit Report

**Date:** 2026-03-14  
**Scope:** `paper/` folder — Backend (FastAPI), Frontend (HTML/JS), Infrastructure (Docker, CI), Database  
**Methodology:** Manual code review + static analysis against OWASP Top 10 (2021), CWE/SANS Top 25, and industry best practices

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Critical Findings](#2-critical-findings)
3. [High Severity Findings](#3-high-severity-findings)
4. [Medium Severity Findings](#4-medium-severity-findings)
5. [Low Severity / Best Practice Findings](#5-low-severity--best-practice-findings)
6. [Architecture & Code Quality Review](#6-architecture--code-quality-review)
7. [What the App Does Well](#7-what-the-app-does-well)
8. [Remediation Priority Matrix](#8-remediation-priority-matrix)
9. [Recommended Security Hardening Roadmap](#9-recommended-security-hardening-roadmap)

---

## 1. Executive Summary

PaperX is a large-scale educational platform (FastAPI backend, ~37,000 lines in `main.py`, 389 API routes, 971 functions) with features including AI-generated notes, teacher/student portals, assignments, group chat (WebSockets), code compilers, print shop, marketplace, and more.

The application demonstrates **significant security awareness** — it already includes rate limiting, RBAC, abuse scoring, security telemetry, CSP headers, Cloudflare Turnstile, refresh token rotation, and LLM guardrails. However, several **critical and high-severity** issues exist that require immediate attention.

### Risk Summary

| Severity | Count | Status |
|----------|-------|--------|
| 🔴 **Critical** | 4 | Requires immediate action |
| 🟠 **High** | 7 | Fix within 1–2 weeks |
| 🟡 **Medium** | 9 | Fix within 1 month |
| 🔵 **Low / Info** | 8 | Address as improvements |

---

## 2. Critical Findings

### CRIT-01: Hardcoded Secrets Committed to Git Repository
**CWE-798: Use of Hard-coded Credentials | OWASP A07:2021 – Identification and Authentication Failures**

**Location:** `paper/.env` (tracked in Git), `paper/service_account_key.json` (tracked in Git)

**Finding:** The `.env` file contains **real production API keys and secrets** committed directly to the Git repository:

| Secret | Type |
|--------|------|
| `OPENAI_API_KEY=sk-proj-NXvCZr42...` | OpenAI production API key |
| `SERPAPI_API_KEY=bd862a34...` (×6 keys) | SerpAPI keys |
| `GEMINI_API_KEY=AIzaSyC74...` (×4 keys) | Google Gemini API keys |
| `OPENROUTER_API_KEY=sk-or-v1-35c2...` | OpenRouter API key |
| `SUPABASE_SERVICE_ROLE_KEY=eyJhbG...` | Supabase **service role** key (full DB admin) |
| `SUPABASE_ANON_KEY=eyJhbG...` | Supabase anonymous key |
| `CLOUDFLARE_SECRET_KEY=0x4AAAA...` | Cloudflare Turnstile secret |
| `YT_API_KEY=AIzaSyA_9s...` | YouTube API key |

Additionally, `service_account_key.json` contains a **full Google Cloud Platform service account private key** with project ID `gen-lang-client-0948404692`.

**Impact:** Anyone with read access to this repository can:
- Make API calls at your expense (financial abuse)
- Access/modify your entire Supabase database using the service role key
- Access your GCP resources using the service account
- Impersonate your application

**Note:** Although `.gitignore` correctly lists these files, they were committed before `.gitignore` was added or were force-added. Once committed, `.gitignore` does **not** retroactively remove them.

**Remediation:**
1. **Immediately rotate ALL compromised secrets** — every key listed above must be regenerated
2. Run `git rm --cached .env service_account_key.json` to remove them from tracking
3. Use a secrets manager (e.g., HashiCorp Vault, Doppler, or cloud-native KMS) for production
4. Add a pre-commit hook to prevent future secret commits (e.g., `gitleaks`, `trufflehog`)
5. Consider the entire Git history compromised — secrets in old commits are still accessible

---

### CRIT-02: Remote Code Execution via Unsandboxed Code Compiler
**CWE-94: Improper Control of Generation of Code | OWASP A03:2021 – Injection**

**Location:** `paper/packages/python_compiler.py`, `paper/packages/java_compiler.py`

**Finding:** The Python and Java compilers execute **arbitrary user-supplied code** with no sandboxing:

```python
# python_compiler.py
result = subprocess.run(
    [sys.executable, temp_file_path],  # Runs user code as full Python process
    capture_output=True, text=True, timeout=timeout
)
```

```python
# java_compiler.py
compile_res = subprocess.run(
    [javac_path, "-encoding", "UTF-8", java_file],  # Compiles arbitrary Java
    ...
)
run_res = subprocess.run(
    [java_path, "-Dfile.encoding=UTF-8", "-cp", temp_dir, class_name],  # Runs arbitrary Java
    ...
)
```

There is **no sandboxing whatsoever** — no seccomp, no cgroups, no network restrictions, no filesystem restrictions, no resource limits beyond a simple timeout.

**Impact:** A user can:
- Read any file on the server (`/etc/passwd`, `.env`, source code)
- Execute system commands (`os.system('rm -rf /')`)
- Open network connections (reverse shells, data exfiltration)
- Access environment variables containing secrets
- Pivot to other services on the same network
- Mine cryptocurrency using server resources

**Note:** The backend has `COMPILER_ISOLATION_MODE` and `COMPILER_WORKER_BASE_URL` configuration suggesting isolation was planned, but the inline execution path has no actual isolation.

**Remediation:**
1. **Never run user code on the main server** — use isolated sandboxes
2. Deploy a dedicated code execution worker with container-level isolation (e.g., gVisor, Firecracker, nsjail)
3. Apply: seccomp profiles, read-only filesystem, network namespace isolation, memory/CPU limits, non-root user
4. Until sandbox is ready, **disable** `COMPILER_INLINE_EXECUTION_ENABLED`
5. Consider using existing sandboxed services like Judge0, Piston, or CodeSandbox API

---

### CRIT-03: JWT Token Validation Without Signature Verification
**CWE-347: Improper Verification of Cryptographic Signature | OWASP A02:2021 – Cryptographic Failures**

**Location:** `paper/main.py`, lines 278–330

**Finding:** The `_validate_token_claims` function decodes JWT tokens **without verifying the cryptographic signature**:

```python
def _decode_jwt_claims_unverified(token: str) -> Dict[str, Any]:
    parts = (token or "").split(".")
    # ... base64 decodes the payload directly ...
    payload_raw = base64.urlsafe_b64decode(payload_b64 + padding)
    claims = json.loads(payload_raw.decode("utf-8"))
    return claims
```

While expiry, issuer, and audience claims are checked, the **signature is never verified**. This means an attacker can:
1. Craft a JWT with any `sub` (user ID), `email`, or `role` claim
2. Set the expiry to a future date
3. Set the correct issuer/audience values
4. Use the token to authenticate as **any user, including admins**

**Impact:** Complete authentication bypass. Any user can impersonate any other user, including administrators, by crafting a custom JWT.

**Remediation:**
1. Use `PyJWT` or `python-jose` to verify the JWT signature against Supabase's JWT secret (`SUPABASE_JWT_SECRET`)
2. **Never trust unverified JWT claims for authorization decisions**
3. Example: `jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"], audience="authenticated")`

---

### CRIT-04: Supabase Service Role Key Used for Client Operations
**CWE-250: Execution with Unnecessary Privileges | OWASP A01:2021 – Broken Access Control**

**Location:** `paper/main.py`, line ~1693 (`get_service_client()`)

**Finding:** Many operations use `get_service_client()` which uses the `SUPABASE_SERVICE_ROLE_KEY` (full admin access bypassing Row Level Security). This key is used extensively throughout the codebase for:
- Reading/writing user data
- Managing profiles
- Handling marketplace notes
- General CRUD operations

The service role key **bypasses all Supabase Row Level Security (RLS) policies**, meaning the backend has implicit trust — any logic error in authorization checks means full database access.

**Impact:** If any endpoint has an authorization bypass (which is possible given 389 routes), an attacker gains unrestricted database access.

**Remediation:**
1. Use the `anon_key` with user-scoped JWTs for user-facing operations so RLS is enforced
2. Reserve the service role key only for admin and system operations
3. Implement proper RLS policies in Supabase as a defense-in-depth layer

---

## 3. High Severity Findings

### HIGH-01: CORS Allows "null" Origin
**CWE-346: Origin Validation Error | OWASP A05:2021 – Security Misconfiguration**

**Location:** `paper/main.py`, lines 25990–26003

**Finding:**
```python
allow_origins=[
    ...
    "null",  # Dangerous: allows sandboxed iframes, data: URIs, file:// protocol
],
allow_origin_regex=r"^(...|null)$",
allow_credentials=True,
```

The CORS policy allows the `"null"` origin **with credentials**. The `null` origin is sent by:
- Pages loaded from `file://` protocol
- Sandboxed iframes
- Cross-origin redirects
- `data:` URIs

Combined with `allow_credentials=True`, this allows an attacker to perform authenticated cross-origin requests from contexts that send `Origin: null`.

**Remediation:**
1. Remove `"null"` from `allow_origins`
2. Remove `"null"` from the `allow_origin_regex`
3. Be explicit about allowed origins — only production domains

---

### HIGH-02: Cross-Site Scripting (XSS) via Extensive innerHTML Usage
**CWE-79: Improper Neutralization of Input During Web Page Generation | OWASP A03:2021 – Injection**

**Location:** 351+ instances of `innerHTML` across HTML files in `paper/ui/`

**Finding:** The frontend extensively uses `innerHTML` to render dynamic content. While `config.js` includes an `innerHTML` sanitizer override (using DOMPurify-like logic), the coverage and effectiveness depend on:
1. Whether the sanitizer is loaded on every page before any innerHTML assignment
2. Whether all dynamic content goes through this path
3. Whether the sanitizer is bypassed by direct DOM manipulation

Key risk areas include:
- User profile data (names, bios) rendered in templates
- Note content/markdown rendered in pages
- Chat messages in group chat
- Search results and dynamic lists

**Remediation:**
1. Use `textContent` instead of `innerHTML` wherever possible
2. Ensure DOMPurify (or the existing sanitizer) is loaded and active on **every page**
3. Implement server-side output encoding for all user-generated content
4. Use a templating library with auto-escaping (e.g., React, Vue, or at minimum Handlebars)

---

### HIGH-03: No File Type Validation on Most Upload Endpoints
**CWE-434: Unrestricted Upload of File with Dangerous Type | OWASP A04:2021 – Insecure Design**

**Location:** Multiple upload endpoints in `paper/main.py` (teacher avatar, college logo, marketplace notes, etc.)

**Finding:** While the syllabus upload (`/api/syllabus/upload`) checks for PDF, many other upload endpoints lack rigorous file type validation:
- Teacher ID card uploads accept any file
- Avatar uploads have minimal checks
- College logo uploads use `UploadFile` without content validation
- The RAG pipeline has good validation (`_rag_trust_validate_payload`), but other endpoints do not

**Impact:** Attackers could upload malicious files (web shells, polyglot files, malware) to the server.

**Remediation:**
1. Validate file magic bytes (not just extension or content-type header) for all uploads
2. Restrict allowed MIME types per endpoint
3. Store uploads outside the web root or in cloud storage (GCS bucket is partially used)
4. Scan uploads with an antivirus service (the RAG pipeline has `RAG_AV_SCAN_ENABLED` but it's disabled by default)
5. Re-encode images on upload to strip metadata and prevent polyglot attacks

---

### HIGH-04: Insufficient Input Validation on User-Controlled Queries
**CWE-20: Improper Input Validation | OWASP A03:2021 – Injection**

**Location:** Various search endpoints throughout `main.py`

**Finding:** While the application uses Supabase's client library (which parameterizes queries), several areas pass user input directly to external services:
- SerpAPI search queries (`serpapi_search()` passes user topic directly)
- YouTube search (`search_youtube_videos()` passes user query to yt-dlp)
- URL fetching (`fetch()` function) — though SSRF protections exist via `_validate_fetch_url()`

The `fetch()` function has good SSRF protection checking for private IPs, but the validation could be bypassed via DNS rebinding attacks.

**Remediation:**
1. Add allowlisting for external API query parameters
2. Implement DNS rebinding protection in the URL fetch function
3. Sanitize all user inputs before passing to external services
4. Add request-level timeouts and size limits consistently

---

### HIGH-05: Content Security Policy Allows 'unsafe-inline' for Scripts
**CWE-1021: Improper Restriction of Rendered UI Layers | OWASP A05:2021 – Security Misconfiguration**

**Location:** `paper/main.py`, CSP header definition (~line 25795)

**Finding:**
```python
"script-src 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://challenges.cloudflare.com",
```

The CSP allows `'unsafe-inline'` for scripts, which **completely negates XSS protection** from the Content Security Policy. An attacker who achieves XSS can execute arbitrary inline scripts.

**Remediation:**
1. Replace `'unsafe-inline'` with nonce-based CSP: `'nonce-{random}'`
2. Move all inline scripts to external files
3. Generate a unique nonce per request and inject it into both the CSP header and `<script>` tags

---

### HIGH-06: Password Handling Delegated to Supabase Without Additional Controls
**CWE-521: Weak Password Requirements**

**Location:** `paper/main.py`, `SignupFullIn` model, `signup_user()`, `login_user()`

**Finding:** The application delegates password handling entirely to Supabase Auth but does not enforce:
- Minimum password length beyond what Supabase defaults to (6 characters)
- Password complexity requirements (uppercase, lowercase, numbers, special chars)
- Breached password checking (Have I Been Pwned API)
- Account lockout after failed attempts (only rate limiting at the API level)

The `UserAuth` model has no password validators:
```python
class UserAuth(BaseModel):
    email: str
    password: str  # No length, complexity, or format validation
```

**Remediation:**
1. Add server-side password validation: minimum 8 characters, mixed case, numbers
2. Integrate Have I Been Pwned (HIBP) API to reject breached passwords
3. Configure Supabase Auth to enforce stronger password policies
4. Consider implementing progressive delays on failed login attempts per-account

---

### HIGH-07: Missing CSRF Protection for State-Changing Operations
**CWE-352: Cross-Site Request Forgery | OWASP A01:2021 – Broken Access Control**

**Location:** All `POST/PUT/PATCH/DELETE` endpoints

**Finding:** The application uses cookie-based authentication (`SameSite=strict` cookies) which provides some CSRF protection. However:
1. The `SameSite` attribute is configurable via environment variables and could be weakened
2. Some browsers have inconsistent `SameSite` enforcement
3. There is no CSRF token mechanism as an additional defense layer
4. The Turnstile verification only applies to login/signup, not all state-changing endpoints

**Remediation:**
1. Implement a CSRF token (double-submit cookie pattern) for all state-changing endpoints
2. Ensure `SameSite=strict` is hardcoded for production, not configurable
3. Verify the `Origin` header against allowed origins for POST requests

---

## 4. Medium Severity Findings

### MED-01: Monolithic 37,000-Line Single File (Maintainability Risk)
**CWE-1120: Excessive Code Complexity**

**Location:** `paper/main.py` — 37,011 lines, 971 functions, 389 routes

**Finding:** The entire backend is a single Python file. This is a significant maintainability and security risk because:
- Code review is extremely difficult
- Authorization logic is scattered across hundreds of endpoints
- Testing individual components is impractical
- A single vulnerability is harder to locate and fix
- Merge conflicts are frequent in team development

**Remediation:**
1. Split into modules: `auth/`, `routes/`, `services/`, `models/`, `middleware/`
2. Use FastAPI's `APIRouter` more extensively (some routers already exist)
3. Implement a service layer to separate business logic from route handlers

---

### MED-02: Debug Print Statements in Production Code
**CWE-532: Insertion of Sensitive Information into Log File**

**Location:** Multiple locations in `main.py`

**Finding:** Production code contains numerous `print()` statements that log sensitive information:
```python
print(f"[UPLOAD] {request.method} {request.url.path} origin={request.headers.get('origin')} content-type={request.headers.get('content-type')}")
print(f"[TPROF_DEBUG] Existing application status={row.get('status')} auth_user_id={row.get('auth_user_id')}")
```

These print statements may leak sensitive data to stdout/logs including user IDs, auth states, and request metadata.

**Remediation:**
1. Replace all `print()` statements with structured logging using the existing `logging` module
2. Set appropriate log levels (`debug`, `info`, `warning`, `error`)
3. Ensure debug-level logs are disabled in production via `UVICORN_LOG_LEVEL`
4. Remove or guard `TEACHER_PROFILE_DEBUG`-gated debug blocks

---

### MED-03: API Documentation Potentially Exposed in Production
**CWE-200: Exposure of Sensitive Information | OWASP A05:2021 – Security Misconfiguration**

**Location:** `paper/main.py`, `_should_expose_api_docs()` function

**Finding:** The Swagger/ReDoc API documentation is controlled by environment variables. If `API_DOCS_ENABLED` is misconfigured or `APP_ENV` is not set to `production`, all 389 API endpoints with their schemas are publicly visible.

The health check in the Dockerfile also uses `/docs`: 
```dockerfile
HEALTHCHECK ... CMD curl -fsS http://localhost:${PORT}/docs >/dev/null || exit 1
```

**Remediation:**
1. Use the `/health` endpoint for healthchecks instead of `/docs`
2. Default to docs disabled in production
3. Require authentication for docs access in production

---

### MED-04: Unrestricted Access to Supabase Configuration
**CWE-200: Exposure of Sensitive Information**

**Location:** `paper/main.py`, `/api/public/supabase` endpoint

**Finding:**
```python
@academics_router.get("/api/public/supabase")
def public_supabase_config():
    return {"url": base_url, "anonKey": anon}
```

This endpoint publicly exposes the Supabase URL and anonymous key. While the anonymous key is designed to be public, exposing it via API makes it easier for automated scanners to discover and abuse.

**Remediation:**
1. Only expose the anon key through frontend configuration files (already loaded in HTML)
2. If this endpoint is needed, add rate limiting specific to it
3. Monitor for abuse of the exposed configuration

---

### MED-05: WebSocket Authentication Accepts Tokens via Query Parameters
**CWE-598: Use of GET Request Method with Sensitive Query Strings**

**Location:** `paper/main.py`, `_get_ws_auth_user()` function (line 9459)

**Finding:**
```python
token = (
    websocket.query_params.get("token")
    or websocket.query_params.get("access_token")
    or websocket.query_params.get("auth_token")
)
```

WebSocket authentication accepts tokens via query parameters, which are:
- Logged in server access logs
- Stored in browser history
- Visible in network monitoring tools
- Cached by proxies/CDNs

**Remediation:**
1. Prefer passing tokens via WebSocket subprotocol or initial message
2. If query params must be used, generate short-lived single-use tokens specifically for WebSocket connections
3. Log-scrub any query parameters containing tokens

---

### MED-06: Inconsistent Authorization Checks Across 389 Routes
**CWE-862: Missing Authorization | OWASP A01:2021 – Broken Access Control**

**Location:** Throughout `paper/main.py`

**Finding:** The middleware-level auth enforcement (`enforce_authenticated_api_access`) provides a baseline, but many endpoints perform **additional authorization checks** (e.g., "is this user the owner of this resource?"). These checks are scattered and inconsistent:
- Some endpoints check `user_id` matches the resource owner
- Some endpoints only check if a valid token exists
- Some endpoints trust the `authorization` header without additional ownership verification
- The `_is_admin_user` function has multiple fallback paths (env vars, email domain matching, DB lookup)

With 389 routes, it's likely some endpoints have missing or incorrect authorization logic.

**Remediation:**
1. Implement a centralized authorization decorator/dependency
2. Define clear ownership rules per resource type
3. Add automated authorization tests for every endpoint
4. Use the existing `route_audit.tsv` to systematically verify each route's authorization requirements

---

### MED-07: Token Storage in localStorage (Frontend)
**CWE-922: Insecure Storage of Sensitive Information**

**Location:** `paper/ui/auth.js`, `paper/ui/login.html`, `paper/ui/signup.html`

**Finding:** While the backend correctly uses HttpOnly cookies for auth, the frontend also stores tokens in `localStorage`:
```javascript
const USER_TOKEN_KEY = 'px_token';
const REFRESH_TOKEN_KEY = 'px_refresh_token';
```

`localStorage` is accessible to any JavaScript running on the page, making tokens vulnerable to XSS attacks.

**Remediation:**
1. Complete the migration to HttpOnly cookie-only authentication
2. Remove all `localStorage` token storage
3. Use the `__COOKIE_AUTH__` sentinel pattern consistently

---

### MED-08: Missing Rate Limiting on Several Sensitive Endpoints
**CWE-307: Improper Restriction of Excessive Authentication Attempts**

**Location:** `paper/main.py`

**Finding:** While the application has rate limiting for login, signup, auth, and AI routes, several sensitive operations are not specifically rate-limited:
- File uploads (only global rate limit applies)
- Password reset
- Admin operations
- Teacher signup/applications
- Code compilation endpoints

**Remediation:**
1. Add specific rate limits for upload endpoints
2. Add per-user rate limits for compilation endpoints
3. Add stricter rate limits for administrative operations

---

### MED-09: No Dependency Pinning in requirements.txt
**CWE-1104: Use of Unmaintained Third-Party Components**

**Location:** `paper/requirements.txt`

**Finding:** Dependencies are not pinned to specific versions:
```
fastapi
uvicorn
requests
beautifulsoup4
openai>=1.0.0
...
```

This means `pip install` will install the latest version, which could:
- Introduce breaking changes
- Introduce new vulnerabilities
- Make builds non-reproducible

**Remediation:**
1. Pin all dependencies to specific versions: `fastapi==0.109.0`
2. Use `pip-compile` (pip-tools) to generate a lockfile
3. Run `pip-audit` regularly (a `pip_audit.json` exists but appears stale)
4. Set up Dependabot or Renovate for automated dependency updates

---

## 5. Low Severity / Best Practice Findings

### LOW-01: Dockerfile Uses apt-get Without Version Pinning
**Location:** `paper/Dockerfile`

OS packages are not pinned to specific versions, which could introduce vulnerabilities or break builds.

---

### LOW-02: Missing Security Headers for Some Responses
**Location:** `paper/main.py`

While many security headers are set, consider adding:
- `Cross-Origin-Embedder-Policy: require-corp`
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-origin`

---

### LOW-03: Email Validation Could Be Stronger
**Location:** `paper/main.py`, `UserAuth` model

The `email` field is a plain `str` without email format validation. Use `pydantic[email]` (which is in requirements) with `EmailStr`.

---

### LOW-04: Error Messages May Reveal Implementation Details
**Location:** Various exception handlers

Some error responses include internal details:
```python
raise HTTPException(status_code=500, detail=f"DB update failed: {e}")
raise HTTPException(status_code=500, detail=f"Supabase error (list users) exec: {str(e)}")
```

Return generic error messages to clients; log details server-side.

---

### LOW-05: No Content-Length Limits for Non-Upload Endpoints
**Location:** `paper/main.py`

JSON body endpoints don't have explicit size limits. Large payloads could consume memory.

---

### LOW-06: Logging Configuration
**Location:** `paper/main.py`

The security logger logs to stdout. In production, ensure logs are:
- Shipped to a centralized logging service
- Retained for at least 90 days
- Protected from tampering

---

### LOW-07: No Automated Security Testing in CI/CD
**Location:** `paper/.github/workflows/security-gates.yml`

While a security gates workflow exists, verify it includes:
- SAST (Static Application Security Testing)
- Dependency vulnerability scanning
- Secret scanning
- Container image scanning

---

### LOW-08: Consider Implementing API Versioning
**Location:** `paper/main.py`

With 389 routes, breaking changes could affect many clients. Implement versioning (e.g., `/api/v1/...`) to enable safe evolution.

---

## 6. Architecture & Code Quality Review

### 6.1 Backend Architecture
| Aspect | Assessment |
|--------|------------|
| **Framework** | FastAPI — excellent choice, modern, async-capable |
| **Code Organization** | ❌ Single 37K-line file is a major concern |
| **Error Handling** | ✅ Generally good with try/except patterns |
| **Type Hints** | ✅ Extensive use of typing annotations |
| **Pydantic Models** | ✅ Input validation via Pydantic models |
| **Database** | ✅ Supabase (PostgreSQL) with ORM-like client |
| **API Design** | ✅ RESTful, well-structured route naming |
| **Testing** | ❌ No test files found in the paper/ directory |

### 6.2 Frontend Architecture
| Aspect | Assessment |
|--------|------------|
| **Framework** | Vanilla HTML/JS with Tailwind CSS |
| **Sanitization** | ⚠️ Custom innerHTML sanitizer in config.js |
| **Auth Handling** | ⚠️ Dual localStorage + cookie approach |
| **XSS Protection** | ⚠️ Relies on custom sanitizer, 351+ innerHTML uses |
| **CSP** | ⚠️ Present but weakened by 'unsafe-inline' |

### 6.3 Infrastructure
| Aspect | Assessment |
|--------|------------|
| **Containerization** | ✅ Multi-stage Dockerfile, non-root user |
| **Health Checks** | ⚠️ Uses /docs endpoint instead of /health |
| **Secrets Management** | ❌ Secrets in Git |
| **CI/CD** | ✅ GitHub Actions workflow exists |
| **Monitoring** | ✅ Comprehensive security telemetry |

---

## 7. What the App Does Well

The application demonstrates strong security awareness in several areas:

1. **Security Telemetry & Monitoring** — Comprehensive event logging with `_security_emit()`, abuse scoring, status pattern detection, upload spike detection, and anomaly alerts
2. **Rate Limiting** — Multi-tier rate limiting (global, auth, login, AI) with sliding window implementation
3. **Refresh Token Rotation** — Proper refresh token rotation with family tracking and reuse detection
4. **RBAC System** — Role-based access control with admin, HOD, teacher, employee, and student roles
5. **Security Headers** — X-Content-Type-Options, X-Frame-Options, HSTS, Referrer-Policy, Permissions-Policy, CSP
6. **SSRF Protection** — The `fetch()` function validates URLs against private IP ranges
7. **LLM Guardrails** — Prompt injection detection and tool policy enforcement
8. **Cloudflare Turnstile** — Bot protection on login/signup
9. **Cookie Security** — HttpOnly, Secure, SameSite cookies for auth tokens
10. **Abuse Scoring** — IP-based abuse scoring with automatic blocking

---

## 8. Remediation Priority Matrix

| Priority | ID | Finding | Effort | Impact |
|----------|-------|---------|--------|--------|
| 🔴 P0 | CRIT-01 | Rotate all compromised secrets | Low | Critical |
| 🔴 P0 | CRIT-03 | Implement JWT signature verification | Medium | Critical |
| 🔴 P0 | CRIT-02 | Sandbox code compilers | High | Critical |
| 🔴 P0 | CRIT-04 | Minimize service role key usage | Medium | Critical |
| 🟠 P1 | HIGH-01 | Remove "null" from CORS origins | Low | High |
| 🟠 P1 | HIGH-05 | Replace 'unsafe-inline' in CSP | Medium | High |
| 🟠 P1 | HIGH-06 | Enforce password policies | Low | High |
| 🟠 P1 | HIGH-03 | Add file upload validation | Medium | High |
| 🟠 P1 | HIGH-07 | Add CSRF protection | Medium | High |
| 🟡 P2 | HIGH-02 | Audit and fix innerHTML usage | High | High |
| 🟡 P2 | HIGH-04 | Strengthen input validation | Medium | Medium |
| 🟡 P2 | MED-01 | Split monolithic file | High | Medium |
| 🟡 P2 | MED-06 | Centralize authorization | High | Medium |
| 🟡 P2 | MED-07 | Remove localStorage tokens | Low | Medium |
| 🟡 P3 | MED-02 | Replace print with logging | Low | Low |
| 🟡 P3 | MED-03 | Secure API docs | Low | Medium |
| 🟡 P3 | MED-09 | Pin dependencies | Low | Medium |
| 🔵 P4 | MED-04 | Rate limit public config | Low | Low |
| 🔵 P4 | MED-05 | Fix WS token passing | Medium | Low |
| 🔵 P4 | LOW-* | Various improvements | Low | Low |

---

## 9. Recommended Security Hardening Roadmap

### Phase 1: Emergency (This Week)
- [ ] Rotate ALL compromised API keys and secrets (CRIT-01)
- [ ] Remove `.env` and `service_account_key.json` from Git tracking
- [ ] Install `gitleaks` pre-commit hook
- [ ] Implement JWT signature verification (CRIT-03)
- [ ] Remove `"null"` from CORS allowed origins (HIGH-01)

### Phase 2: Critical (Next 2 Weeks)
- [ ] Sandbox code compilation (CRIT-02) — disable inline execution, use worker
- [ ] Add file type validation (magic bytes) for all upload endpoints (HIGH-03)
- [ ] Enforce password complexity requirements (HIGH-06)
- [ ] Replace `'unsafe-inline'` in CSP with nonces (HIGH-05)
- [ ] Complete migration from localStorage to cookie-only auth (MED-07)

### Phase 3: Hardening (Next Month)
- [ ] Add CSRF tokens for state-changing operations (HIGH-07)
- [ ] Audit all 389 routes for authorization gaps (MED-06)
- [ ] Pin all dependency versions (MED-09)
- [ ] Replace print() with structured logging (MED-02)
- [ ] Minimize Supabase service role key usage (CRIT-04)
- [ ] Write automated security tests for auth, RBAC, and file uploads

### Phase 4: Architecture (Next Quarter)
- [ ] Split `main.py` into modular components (MED-01)
- [ ] Implement centralized authorization decorators (MED-06)
- [ ] Add SAST/DAST to CI/CD pipeline (LOW-07)
- [ ] Implement API versioning (LOW-08)
- [ ] Add comprehensive integration test suite

---

*This report was generated through manual source code review of the `paper/` directory. For a complete security assessment, consider complementing this with dynamic application security testing (DAST), penetration testing, and infrastructure security review.*
