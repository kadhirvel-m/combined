# 🔐 PaperX Security Audit Report

**Date:** March 14, 2026  
**Scope:** `/paper` directory — Full-stack security review  
**Application:** PaperX — AI-powered educational platform  
**Stack:** FastAPI (Python 3.12) + Supabase (PostgreSQL) + Vanilla JS Frontend  

---

## 📊 Overall Security Rating: **72 / 100**

| Category | Score | Weight | Weighted |
|---|---|---|---|
| Authentication & Session Management | 88/100 | 20% | 17.6 |
| Authorization & Access Control | 82/100 | 15% | 12.3 |
| Input Validation & Injection Prevention | 85/100 | 15% | 12.8 |
| CSRF & CORS Protection | 80/100 | 10% | 8.0 |
| Secrets & Credential Management | 35/100 | 15% | 5.3 |
| Frontend Security (XSS, Token Handling) | 82/100 | 10% | 8.2 |
| Infrastructure & Deployment Security | 70/100 | 10% | 7.0 |
| Security Monitoring & Incident Response | 90/100 | 5% | 4.5 |
| **TOTAL** | | **100%** | **75.7** |

> **Adjusted Score: 72/100** — A 3.7-point deduction is applied for the critical credential leak (CRIT-01: `service_account_key.json` committed to repo), which has outsized impact on overall security posture beyond its category weight.

### Rating Breakdown

| Tier | Range | Meaning |
|---|---|---|
| 🟢 Excellent | 90–100 | Production-hardened, industry-leading |
| 🟡 Good | 75–89 | Solid foundation, minor improvements needed |
| 🟠 Moderate | 60–74 | **← PaperX is here (72)** — Needs targeted fixes |
| 🔴 Poor | 0–59 | Significant rework required |

---

## 🔴 CRITICAL Findings (Must Fix Immediately)

### CRIT-01: Google Cloud Service Account Key Committed to Repository

**File:** `service_account_key.json`  
**Severity:** 🔴 CRITICAL  
**CVSS Estimate:** 9.1 (Critical)

**Description:**  
A fully functional Google Cloud service account private key (`paperx-pro@gen-lang-client-0948404692.iam.gserviceaccount.com`) is committed to the repository. Even though `.gitignore` lists this file (line 18), the file was committed before the gitignore rule was added, so it remains tracked.

**Impact:**
- Attacker with repository access can authenticate to Google Cloud as this service account
- Can access all GCP resources the service account has permissions for (Gemini AI, Cloud Storage, etc.)
- Key is visible in full git history even if the file is deleted from HEAD

**Evidence:**
```
File: service_account_key.json (13 lines)
Contains: private_key_id, private_key (RSA), client_email, client_id
Project: gen-lang-client-0948404692
```

**Remediation:**
1. **IMMEDIATELY** revoke the key in GCP Console → IAM → Service Accounts → Keys → Delete
2. Generate a new key and store it ONLY in environment variables or a secret manager (e.g., GCP Secret Manager, HashiCorp Vault)
3. Remove the file from git history:
   ```bash
   git filter-branch --force --index-filter \
     'git rm --cached --ignore-unmatch service_account_key.json' \
     --prune-empty --tag-name-filter cat -- --all
   ```
   Or use [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/) for faster processing
4. Force-push all branches and notify collaborators to re-clone

---

### CRIT-02: Database Backup with Production Data in Repository

**File:** `back.sql` (~1.2 MB)  
**Severity:** 🔴 HIGH  
**CVSS Estimate:** 7.5 (High)

**Description:**  
A full PostgreSQL database dump is committed to the repository containing real INSERT statements with production data including UUIDs, timestamps, and content. If any user PII, email addresses, or authentication data is present deeper in the file, this constitutes a data breach.

**Evidence:**
```sql
-- Line 1: INSERT INTO "public"."ai_notes" (id, user_id, topic, ...) VALUES (...)
-- Contains actual UUIDs and content
```

**Remediation:**
1. Audit the full `back.sql` for any PII, email addresses, or sensitive user data
2. Remove from repository and git history (same method as CRIT-01)
3. Add `*.sql` backup patterns to `.gitignore`: `back.sql`, `*-dump.sql`, `*-backup.sql`
4. Store database backups in a secure, encrypted backup system (e.g., S3 with encryption, GCP Cloud SQL backups)

---

## 🟡 HIGH Findings (Fix This Week)

### HIGH-01: CORS Allows "null" Origin

**File:** `main.py` (CORS middleware configuration)  
**Severity:** 🟡 HIGH  

**Description:**  
The CORS configuration includes `"null"` as an allowed origin, which permits requests from:
- Sandboxed iframes
- `data:` URLs
- `file://` protocol pages
- Redirected cross-origin requests

**Evidence:**
```python
# main.py CORS middleware
allow_origins = [
    ...,
    "null",  # ← Allows sandboxed/file requests
]
allow_origin_regex = r"^(...|null)$"
```

**Impact:** An attacker could craft a sandboxed iframe that sends credentialed requests to the API.

**Remediation:**
- Remove `"null"` from production CORS origins
- Make it conditional: only include in development mode
```python
cors_origins = ["https://paperx.tech", "https://www.paperx.tech", ...]
if os.getenv("APP_ENV") != "production":
    cors_origins.append("null")
```

---

### HIGH-02: Weak Password Policy (Minimum 6 Characters Only)

**File:** `ui/signup.html` (line ~333)  
**Severity:** 🟡 HIGH  

**Description:**  
The signup form only enforces `minlength="6"` for passwords with no complexity requirements. Modern standards (NIST SP 800-63B) recommend minimum 8 characters with breach-database checking.

**Evidence:**
```html
<input type="password" id="pwd" name="password" minlength="6" required>
```

**Impact:** Users can set weak, easily-guessable passwords like `123456` or `abcdef`.

**Remediation:**
1. **Frontend:** Increase `minlength` to 8 and add client-side strength indicator
2. **Backend:** Enforce password policy server-side:
   - Minimum 8 characters (NIST recommends up to 64 max)
   - Check against common password lists (top 10,000 breached passwords)
   - No complexity mandates needed per NIST (length > complexity)
3. Consider integrating [HaveIBeenPwned Passwords API](https://haveibeenpwned.com/API/v3#PwnedPasswords) for breach checking

---

### HIGH-03: External CDN Scripts Without Subresource Integrity (SRI)

**File:** `ui/login.html` (lines ~582, 674), multiple UI files  
**Severity:** 🟡 HIGH  

**Description:**  
Critical JavaScript libraries are loaded from external CDNs (unpkg.com) without Subresource Integrity (SRI) hashes. If the CDN is compromised, malicious code could be injected.

**Evidence:**
```javascript
// login.html - Loading Supabase client
await loadScriptOnce('https://unpkg.com/@supabase/supabase-js@2');

// login.html - Loading Lottie animations
await loadScriptOnce('https://unpkg.com/@lottiefiles/...');
```

**Impact:** A CDN compromise would allow attackers to inject JavaScript into all PaperX pages, stealing tokens and user data.

**Remediation:**
1. Add SRI hashes to all external script tags:
```html
<script src="https://unpkg.com/@supabase/supabase-js@2"
        integrity="sha384-<HASH>"
        crossorigin="anonymous"></script>
```
2. Better: vendor these libraries locally and serve from your own domain
3. Ensure CSP `script-src` restricts to known sources (already partially done server-side)

---

### HIGH-04: `.gitignore` Incomplete — Sensitive Files Not Excluded

**File:** `.gitignore`  
**Severity:** 🟡 HIGH  

**Description:**  
While `.gitignore` excludes `.env` files and key formats, it does not exclude database dumps and SQL backup files that are already committed.

**Currently Missing:**
```
back.sql           # Production database dump (already committed)
db.sql             # Full schema file
*.dump             # PostgreSQL dumps
*-backup.sql       # Backup files
```

**Currently Covered (Good):**
```
.env, .env.*       ✅
*.pem, *.key       ✅
*.p12, *.pfx       ✅
service_account_key.json  ✅ (but already committed)
```

**Remediation:**
1. Add comprehensive patterns to `.gitignore`:
```
# Database
back.sql
*.dump
*-backup.sql
*-seed.sql

# Secrets (additional)
*.credentials
*.secret
```
2. Remove already-committed files from tracking:
```bash
git rm --cached back.sql
git rm --cached service_account_key.json
```

---

## 🟠 MEDIUM Findings (Fix This Sprint)

### MED-01: Default Fallback for Print OTP Hash Secret

**File:** `main.py` (line ~186)  
**Severity:** 🟠 MEDIUM  

**Description:**  
The `PRINT_OTP_HASH_SECRET` has a hardcoded default value of `"paperx-print-otp"`. If the environment variable is not set in production, OTP hashes become predictable.

**Evidence:**
```python
PRINT_OTP_HASH_SECRET = os.getenv("PRINT_OTP_HASH_SECRET", "paperx-print-otp")
```

**Remediation:**
- Require the secret in production or fail startup:
```python
PRINT_OTP_HASH_SECRET = os.getenv("PRINT_OTP_HASH_SECRET", "")
if not PRINT_OTP_HASH_SECRET and os.getenv("APP_ENV") == "production":
    raise RuntimeError("PRINT_OTP_HASH_SECRET must be set in production")
```

---

### MED-02: Inconsistent Redirect Validation Between Login and Signup

**File:** `ui/login.html` vs `ui/signup.html`  
**Severity:** 🟠 MEDIUM  

**Description:**  
Login uses a comprehensive `getSafeNextPath()` function with full URL origin validation, while Signup uses a simpler regex check. This inconsistency could lead to open redirect vulnerabilities if one path is weaker.

**Evidence:**
```javascript
// login.html — STRONG validation
function getSafeNextPath() {
    if (/^https?:\/\//i.test(raw) || raw.startsWith('//')) return null;
    const url = new URL(raw, baseDir);
    if (url.origin !== location.origin) return null;
    return url.pathname + url.search + url.hash;
}

// signup.html — SIMPLER validation
const safeNext = next && /^[a-zA-Z0-9_\-/]+\.html$/.test(next) ? next : null;
```

**Remediation:**
- Extract `getSafeNextPath()` into a shared utility (e.g., `auth.js`) and use it in both login and signup pages

---

### MED-03: No Client-Side Admin Role Pre-Check

**File:** `ui/admin.html`  
**Severity:** 🟠 MEDIUM  

**Description:**  
The admin panel renders fully and then checks authorization server-side. A non-admin user sees the admin UI briefly before being redirected.

**Remediation:**
- Check user role before rendering admin content:
```javascript
const profile = await fetchProfile();
if (profile?.role !== 'admin') {
    window.location.href = 'dashboard.html';
    return;
}
// Now render admin panel
```

---

### MED-04: API Base URL Modifiable via localStorage

**File:** `ui/config.js` (line ~28)  
**Severity:** 🟠 MEDIUM  

**Description:**  
The API base URL can be overridden by setting a value in localStorage. If an attacker injects JavaScript via XSS (bypassing sanitization), they could redirect all API calls to a malicious server.

**Evidence:**
```javascript
// config.js
var stored = localStorage.getItem('paperx_api_base');
if (stored) API_BASE = stored;
```

**Mitigation Already Present:**
- XSS sanitization in config.js intercepts innerHTML and blocks scripts
- HttpOnly cookies won't be sent to cross-origin attacker API

**Remediation:**
- Validate API_BASE against a whitelist of known domains
- Or remove localStorage override in production builds

---

### MED-05: Antivirus Scanning Disabled by Default for File Uploads

**File:** `main.py` (line ~592)  
**Severity:** 🟠 MEDIUM  

**Description:**  
File upload antivirus scanning (`RAG_AV_SCAN_ENABLED`) defaults to `false`. While file type and magic number validation is present, uploaded PDFs could contain embedded malware.

**Evidence:**
```python
RAG_AV_SCAN_ENABLED = os.getenv("RAG_AV_SCAN_ENABLED", "false").lower() == "true"
```

**Remediation:**
- Enable AV scanning in production
- At minimum, integrate with ClamAV or a cloud-based scanning service
- Consider sandboxed PDF rendering (already using Playwright for some operations)

---

## 🟢 LOW Findings (Improve When Possible)

### LOW-01: `db.sql` Schema Visible in Repository

**File:** `db.sql`  
**Severity:** 🟢 LOW  

**Description:** Full database schema is committed. While marked as "context only," it exposes table structures, column names, and constraint patterns that aid reconnaissance.

**Remediation:** Consider moving to a private documentation system or encrypted vault.

---

### LOW-02: Error Details in Some 500 Responses

**File:** `main.py` (various lines)  
**Severity:** 🟢 LOW  

**Description:** Some error responses include exception details:
```python
raise HTTPException(status_code=500, detail=f"DB save failed: {e}")
```

**Remediation:** In production, return generic error messages and log details server-side only:
```python
if os.getenv("APP_ENV") == "production":
    raise HTTPException(status_code=500, detail="Internal server error")
else:
    raise HTTPException(status_code=500, detail=f"DB save failed: {e}")
```

---

### LOW-03: Monolithic main.py (37,343 Lines)

**File:** `main.py`  
**Severity:** 🟢 LOW (security-adjacent)  

**Description:** A single 37,000+ line file makes security auditing extremely difficult. Code review, grep-based analysis, and automated SAST tools are less effective on monolithic files.

**Remediation:** Refactor into modular FastAPI routers:
```
routes/
  auth.py
  admin.py
  notes.py
  teacher.py
  marketplace.py
  ...
```

---

### LOW-04: Silent Logout Error Handling

**File:** `ui/auth.js` (line ~220)  
**Severity:** 🟢 LOW  

**Description:** The logout function silently swallows fetch errors (`.catch(() => null)`), which could mask network issues or failed server-side session invalidation.

**Remediation:** Log errors for debugging while still proceeding with client-side cleanup.

---

## ✅ Security Strengths (What's Done Well)

### AUTH-01: JWT Authentication (Score: 88/100)

| Feature | Status | Details |
|---|---|---|
| JWT Signature Verification | ✅ Implemented | HS256 with configurable secret |
| Token Expiration | ✅ Enforced | Access: 15min, Refresh: 30 days |
| Issuer Validation | ✅ Configurable | Via `AUTH_VALIDATE_ISSUER` |
| Audience Validation | ✅ Configurable | Via `AUTH_VALIDATE_AUDIENCE` |
| Token Rotation | ✅ Implemented | Family tracking, replay detection |
| HttpOnly Cookies | ✅ Enforced | Tokens never in localStorage |
| Secure Cookie Flags | ✅ Configured | HttpOnly, Secure, SameSite |

---

### AUTH-02: CSRF Protection (Score: 85/100)

| Feature | Status | Details |
|---|---|---|
| Token Generation | ✅ Secure | `secrets.token_urlsafe(32)` — 256-bit |
| Constant-Time Comparison | ✅ Implemented | `secrets.compare_digest()` |
| Automatic Header Injection | ✅ Frontend | config.js auto-injects X-CSRF-Token |
| Origin Validation | ✅ Backend | Trusted origin allowlist |
| Unsafe Method Enforcement | ✅ Backend | POST/PUT/PATCH/DELETE protected |
| CSRF Tests | ✅ Written | `tests/test_csrf_middleware.py` (3 test cases) |

---

### AUTH-03: XSS Prevention (Score: 82/100)

| Feature | Status | Details |
|---|---|---|
| Global innerHTML Sanitization | ✅ Implemented | config.js intercepts all innerHTML |
| Script Tag Blocking | ✅ Active | Removes `<script>`, `<iframe>`, `<object>`, `<embed>` |
| Event Handler Removal | ✅ Active | Strips all `on*` attributes |
| JavaScript URL Blocking | ✅ Active | Removes `javascript:` protocol |
| Explicit Escape Function | ✅ Available | `window.escapeHtml()` exposed |
| Content Security Policy | ✅ Server-side | Comprehensive CSP headers set |

---

### AUTH-04: Rate Limiting (Score: 90/100)

| Feature | Status | Details |
|---|---|---|
| Global Rate Limit | ✅ 240 req/60s | Sliding window per IP |
| Login Rate Limit | ✅ 5 req/60s | Anti-brute-force |
| Auth Endpoint Limit | ✅ 40 req/60s | Signup/refresh protection |
| AI Endpoint Limit | ✅ 20 req/60s | Cost protection |
| 429 Response | ✅ Proper | Includes Retry-After header |
| Bucket Eviction | ✅ Implemented | Memory-safe with max 20,000 buckets |

---

### AUTH-05: Security Monitoring & Abuse Prevention (Score: 90/100)

| Feature | Status | Details |
|---|---|---|
| Abuse Scoring System | ✅ Implemented | Points per violation type, auto-block at 100 |
| Security Event Logging | ✅ Database-backed | Events and incidents tracked |
| Upload Spike Detection | ✅ Configured | Threshold: 40 uploads |
| LLM Guardrails | ✅ Implemented | Prompt injection detection, tool policy enforcement |
| Incident Runbook | ✅ Documented | SLAs: Critical ack ≤5min, mitigate ≤30min |
| Chaos Testing Plan | ✅ Documented | Auth abuse, prompt injection, compiler isolation drills |

---

### AUTH-06: Security Headers (Score: 88/100)

| Header | Status | Value |
|---|---|---|
| X-Content-Type-Options | ✅ Set | `nosniff` |
| X-Frame-Options | ✅ Set | `DENY` |
| Referrer-Policy | ✅ Set | `strict-origin-when-cross-origin` |
| Permissions-Policy | ✅ Set | `camera=(), microphone=(), geolocation=()` |
| Strict-Transport-Security | ✅ Set | `max-age=31536000; includeSubDomains; preload` |
| Content-Security-Policy | ✅ Set | Comprehensive policy (see details below) |

**CSP Policy Details:**
```
default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none';
img-src 'self' data: blob: https:;
font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
script-src 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://challenges.cloudflare.com;
connect-src 'self' https://*.paperx.tech https://*.ondigitalocean.app https://*.supabase.co;
frame-src 'self' https://challenges.cloudflare.com https://www.google.com;
upgrade-insecure-requests;
```

---

### AUTH-07: Input Validation (Score: 85/100)

| Feature | Status | Details |
|---|---|---|
| SQL Injection Prevention | ✅ All parameterized | Supabase ORM + SQLite `?` placeholders |
| Pydantic Validation | ✅ Comprehensive | BaseModel for all request bodies |
| URL Validation | ✅ Implemented | HTTPS scheme check, credential stripping |
| Query Normalization | ✅ Implemented | Length limits, special character filtering |
| File Type Validation | ✅ Implemented | Extension whitelist + magic number check |
| File Size Limits | ✅ Enforced | 20MB default (configurable) |
| No eval/exec | ✅ Confirmed | No dangerous code execution functions |

---

### AUTH-08: Cloudflare Turnstile CAPTCHA (Score: 85/100)

| Feature | Status | Details |
|---|---|---|
| Login Protection | ✅ Required | Turnstile token mandatory for login |
| Signup Protection | ✅ Required | Turnstile token mandatory for signup |
| Server-side Verification | ✅ Implemented | Backend validates Turnstile token with Cloudflare API |
| Test Mode | ✅ Configurable | `TURNSTILE_USE_TEST_KEYS` for development |

---

### AUTH-09: Role-Based Access Control (Score: 82/100)

| Feature | Status | Details |
|---|---|---|
| Role Hierarchy | ✅ Defined | student, teacher, hod, employee, moderator, admin |
| Path-Based RBAC | ✅ Middleware | `/api/admin/*`, `/api/hod/*`, `/api/teacher/*` |
| Database Role Store | ✅ Implemented | `admin_roles` table with foreign key to `auth.users` |
| Multi-Source Admin Check | ✅ Implemented | Env vars + email domains + database |
| Enforcement Middleware | ✅ Active | Checked on every protected request |

---

### AUTH-10: Docker & Deployment Security (Score: 75/100)

| Feature | Status | Details |
|---|---|---|
| Non-Root User | ✅ Enforced | Runs as `pwuser` (line 68 of Dockerfile) |
| Multi-Stage Build | ✅ Used | Reduces attack surface in final image |
| Health Check | ✅ Configured | `curl http://localhost:10000/docs` |
| No Secrets in Image | ✅ Confirmed | All secrets via environment variables |
| Shell Safety | ✅ `set -euo pipefail` | start.sh fails fast on errors |
| apt Cleanup | ✅ Done | Removes apt lists to reduce image size |

---

### AUTH-11: CI/CD Security Pipeline (Score: 75/100)

| Feature | Status | Details |
|---|---|---|
| Dependency Scanning | ✅ pip-audit | `--strict` mode, fails on any vulnerability |
| SBOM Generation | ✅ CycloneDX | Software Bill of Materials for compliance |
| Code Compilation Check | ✅ compileall | Validates Python syntax |
| Artifact Retention | ✅ Uploads | sbom.json and pip_audit.json preserved |
| Triggers | ✅ Configured | Runs on PR and push to main/master |

**Missing from CI/CD:**
- ❌ No SAST tool (e.g., Bandit for Python)
- ❌ No secrets scanning (e.g., TruffleHog, git-secrets)
- ❌ No DAST (Dynamic Application Security Testing)
- ❌ No container image scanning (e.g., Trivy, Snyk)

---

## 📋 Remediation Priority Matrix

| Priority | ID | Finding | Effort | Impact |
|---|---|---|---|---|
| 🔴 P0 | CRIT-01 | Revoke & rotate GCP service account key | 1 hour | Critical — stops active credential exposure |
| 🔴 P0 | CRIT-02 | Remove back.sql from git history | 2 hours | High — prevents potential PII leak |
| 🟡 P1 | HIGH-01 | Remove `"null"` from CORS in production | 30 min | High — closes CORS bypass vector |
| 🟡 P1 | HIGH-02 | Enforce 8+ char password policy | 2 hours | High — prevents weak passwords |
| 🟡 P1 | HIGH-03 | Add SRI hashes to external CDN scripts | 1 hour | High — prevents CDN compromise |
| 🟡 P1 | HIGH-04 | Update .gitignore and clean tracked secrets | 1 hour | High — prevents future leaks |
| 🟠 P2 | MED-01 | Remove default OTP hash secret | 30 min | Medium — hardens OTP system |
| 🟠 P2 | MED-02 | Unify redirect validation logic | 1 hour | Medium — consistent security |
| 🟠 P2 | MED-03 | Add client-side admin role pre-check | 30 min | Medium — UI security |
| 🟠 P2 | MED-04 | Validate API base URL whitelist | 1 hour | Medium — prevents redirect attacks |
| 🟠 P2 | MED-05 | Enable AV scanning for production uploads | 2 hours | Medium — prevents malware uploads |
| 🟢 P3 | LOW-01 | Move db.sql to private docs | 30 min | Low — reduces reconnaissance surface |
| 🟢 P3 | LOW-02 | Sanitize 500 error details in production | 1 hour | Low — prevents info leakage |
| 🟢 P3 | LOW-03 | Modularize main.py | 1-2 weeks | Low — improves auditability |
| 🟢 P3 | LOW-04 | Log logout errors | 15 min | Low — improves debugging |

---

## 🔧 Recommended CI/CD Security Additions

Add these tools to `.github/workflows/security-gates.yml`:

```yaml
# 1. Python SAST (Static Application Security Testing)
- name: Run Bandit Security Scanner
  run: |
    pip install bandit
    bandit -r main.py packages/ -f json -o bandit-report.json || true

# 2. Secret Detection
- name: Scan for Leaked Secrets
  run: |
    pip install trufflehog
    trufflehog filesystem --directory . --json > secrets-report.json || true

# 3. Container Image Scanning
- name: Scan Docker Image
  run: |
    docker build -t paperx:latest .
    docker run --rm aquasec/trivy image paperx:latest

# 4. Dependency License Compliance
- name: License Check
  run: |
    pip install pip-licenses
    pip-licenses --format=json --output-file=licenses.json
```

---

## 📊 Dependency Security Status

Based on `pip_audit.json`:

| Metric | Value |
|---|---|
| Total Dependencies Scanned | 177 |
| Vulnerabilities Found | **0** ✅ |
| Last Scan Date | Current |

**Key Security Dependencies (All Current):**

| Package | Version | Purpose |
|---|---|---|
| cryptography | 46.0.5 | Cryptographic operations |
| PyJWT | 2.12.0 | JWT token handling |
| fastapi | 0.135.1 | Web framework |
| pydantic | 2.12.5 | Input validation |
| supabase | latest | Database client with RLS |
| playwright | 1.58.0 | Sandboxed browser rendering |

---

## 🏗️ Architecture Security Assessment

### Positive Architectural Decisions
1. **Supabase with Row-Level Security (RLS)** — Database-level access control independent of application logic
2. **Cookie-based authentication** — HttpOnly cookies prevent XSS token theft
3. **Token rotation with family tracking** — Detects token replay attacks
4. **Separated frontend/backend** — Backend validates everything; frontend is defense-in-depth
5. **Environment-based configuration** — No hardcoded secrets in application code (except noted fallbacks)
6. **Abuse scoring system** — Automated behavioral threat detection
7. **LLM guardrails** — Prompt injection detection for AI features

### Architectural Concerns
1. **Monolithic backend** — 37,343-line single file hinders security review
2. **Multiple authentication patterns** — User tokens, teacher tokens, and cookie auth create complexity
3. **Many external API integrations** — OpenAI, Gemini, SerpAPI, Cloudflare each add attack surface
4. **SQLite for game state** — Separate database engine adds maintenance burden

---

## 🔐 OWASP Top 10 Compliance

| # | OWASP 2021 Category | Status | Notes |
|---|---|---|---|
| A01 | Broken Access Control | 🟡 Mostly Covered | RBAC middleware, RLS, but admin UI shows before auth check |
| A02 | Cryptographic Failures | 🟡 Mostly Covered | JWT HS256, HMAC hashing, but default OTP secret is weak |
| A03 | Injection | ✅ Covered | All queries parameterized, no eval/exec |
| A04 | Insecure Design | 🟡 Partially | Good auth design, but monolithic structure hinders review |
| A05 | Security Misconfiguration | 🟠 Gaps | Credential in repo, "null" CORS, incomplete .gitignore |
| A06 | Vulnerable Components | ✅ Covered | pip-audit in CI, 0 vulnerabilities found |
| A07 | Authentication Failures | ✅ Well Covered | JWT, CAPTCHA, rate limiting, cookie security |
| A08 | Data Integrity Failures | ✅ Covered | CSRF protection, SameSite cookies, token rotation |
| A09 | Security Logging | ✅ Covered | Security events logged, incident runbook exists |
| A10 | SSRF | 🟡 Partial | URL validation exists but web scraping features expand surface |

---

## 📝 Executive Summary

**PaperX demonstrates a strong security foundation** with enterprise-grade features including JWT authentication with token rotation, comprehensive CSRF protection, XSS sanitization, rate limiting, abuse scoring, and security monitoring. The development team has clearly invested in security.

**However, two critical findings require immediate attention:**
1. A Google Cloud service account private key is committed to the repository
2. A production database dump is committed to the repository

**After addressing the P0 and P1 items (estimated ~8 hours of work), the application's security rating would improve to approximately 85/100**, placing it in the "Good" tier suitable for production deployment.

**The security monitoring and incident response documentation is notably mature**, with defined SLOs, chaos testing plans, and a structured incident runbook — indicating a security-conscious team.

---

*Report generated by automated security review. Manual penetration testing is recommended for complete coverage.*
