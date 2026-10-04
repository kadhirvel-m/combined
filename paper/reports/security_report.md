# Security & Quality Report

## Vulnerability Findings
Based on the security audit using `bandit` and `pip-audit`, here are the findings:

### 1. Dependency Vulnerabilities
`pip` has known CVEs (CVE-2026-3219, CVE-2026-6357) in the current version. Needs an upgrade to `>=26.1`.

### 2. Code Vulnerabilities (Medium Severity)
- **SSRF / URL Open (Medium)**
  `urllib.request.urlopen` is used at line 1508 in `main.py` without proper scheme validation, which can allow an attacker to read local files via `file://` or internal networks via SSRF.
- **Missing Timeout in Requests (Medium)**
  Line 1227 in `main.py` uses `requests.post` without an explicit timeout for the compiler worker call, risking denial of service if the worker hangs. Wait, looking at the code `timeout=max(1, int(timeout_seconds))` is present, but Bandit missed it because the variable is dynamic.
- **Binding to All Interfaces (Medium)**
  Uvicorn runs on `0.0.0.0:8000`. This is typical for Docker/production but might expose internal APIs if not properly proxy-protected.

### 3. Code Quality & Security Practices (Low Severity)
- **Hardcoded Passwords/Secrets**
  Found instances of possible hardcoded credentials ('cookie', 'none', '1x000...'). These should be moved to environment variables.
- **Cryptographically Weak Randomness**
  Standard pseudo-random generators (`random` module) are used. For security purposes like tokens, `secrets` module should be used instead.
- **Silent Failures (Try, Except, Pass)**
  198 instances of `try: ... except: pass` in `main.py`. This masks errors and makes debugging and monitoring extremely difficult.

## Architecture and Engineering Findings
1. **Monolithic File**: `main.py` is an incredibly massive file (36k+ lines). It's a huge anti-pattern and nightmare for maintenance.
2. **Global Imports**: The app imports heavy dependencies (Playwright, OpenAI) synchronously.
3. **Database Client**: Using `supabase.Client` with service role bypasses all RLS policies. It's essentially a root user doing all operations, which makes the app vulnerable to IDOR or missing authorization checks if the API logic isn't perfect.
