# Code Review Report: PaperX

## 1. High-Level Report

### Overview
PaperX appears to be a comprehensive educational platform designed to assist students and teachers. It functions as a monolithic application built primarily with **FastAPI** (Python) for the backend and likely serves a static frontend located in the `ui/` directory. The application integrates with **Supabase** (PostgreSQL) for data persistence and utilizes various AI models (OpenAI, Google Gemini) for content generation.

### Key Features
-   **AI Note Generation:** Generates detailed study notes, cheat sheets, and summaries from topics using SerpAPI for research and LLMs for synthesis.
-   **YouTube Intelligence:** Fetches transcripts and generates structured notes from YouTube videos.
-   **Academic Management:** Manages colleges, degrees, departments, batches, and syllabus structures.
-   **Coding Platform ("Tunex"):** Provides a coding environment with problem sets and a compiler (Python/Java) for executing user code.
-   **Marketplace:** Allows users to buy and sell study notes.
-   **Explorable Explanations ("LabX"):** Generates interactive HTML explanations for complex topics.
-   **Real-time Collaboration:** Includes a WebRTC-based group chat and signaling server for video/audio calls.
-   **User Engagement:** Tracks user streaks and activity.

### Architecture
-   **Monolithic Backend:** The core logic resides in a single, massive file `paper/main.py` (>12k lines), which handles everything from API routing to business logic and database interactions.
-   **Modules:** Some logic is offloaded to `paper/packages/` (e.g., compilers, problem APIs), but significant logic remains in `main.py` or is duplicated (e.g., `youtube_video.py`).
-   **Database:** Heavily reliant on Supabase, with a rich schema (`paper/db.sql`) covering users, content, and commerce.
-   **Frontend:** The `paper/ui/` folder suggests a Multi-Page Application (MPA) structure serving static HTML/JS assets.

---

## 2. Detailed Security Report

### 🚨 Critical Vulnerabilities

1.  **Remote Code Execution (RCE) in Compiler:**
    -   **File:** `paper/packages/python_compiler.py` (and likely `java_compiler.py`).
    -   **Issue:** The function `execute_python_code` writes user-submitted code to a temporary file and executes it using `subprocess.run([sys.executable, temp_file_path], ...)`.
    -   **Risk:** **Critical**. There is **no sandboxing**. A malicious user can execute arbitrary code on the server hosting the application. They can access the file system, read environment variables (containing API keys), delete files, or install backdoors.
    -   **Proof of Concept:** A user submitting `import os; print(os.environ)` would reveal all server secrets.

2.  **Bypass of Row Level Security (RLS):**
    -   **File:** `paper/main.py`
    -   **Issue:** The application primarily uses `get_service_client()` which initializes the Supabase client with the `SUPABASE_SERVICE_ROLE_KEY`.
    -   **Risk:** **High**. The Service Role Key bypasses all Row Level Security policies defined in the database. While the backend implements some logic to filter data (e.g., `_require_teacher`), relying solely on application-level logic for data protection is error-prone. If a developer forgets a check in a new endpoint, data leakage or unauthorized modification is guaranteed.

### High & Medium Risks

3.  **Authentication & Authorization:**
    -   **Issue:** Custom authorization logic (`_require_teacher`, manual header parsing) is mixed with business logic.
    -   **Risk:** Medium. Inconsistent application of auth checks can lead to privilege escalation.

4.  **Code Duplication:**
    -   **Issue:** `youtube_video.py` and `yt_transcript.py` exist in both `paper/packages/` and are inlined/copied within `paper/main.py`.
    -   **Risk:** Medium. Security patches applied to one version might be missed in the other. Maintenance becomes difficult and error-prone.

5.  **Secrets Management:**
    -   **Issue:** The application loads secrets from a `.env` file using `python-dotenv`.
    -   **Risk:** Low/Medium. While standard practice for dev, ensure `.env` is strictly git-ignored. The RCE vulnerability mentioned above makes this particularly dangerous as the `.env` file or environment variables are easily readable by an attacker.

6.  **Input Validation:**
    -   **Issue:** While `Pydantic` is used for many endpoints, the sheer size of `main.py` and manual handling in some places makes it hard to audit all input vectors.
    -   **Risk:** Medium. Potential for injection attacks if raw SQL or shell commands are constructed elsewhere (though Supabase client mostly mitigates SQLi).

---

## 3. Suggestions Report

### Immediate Actions (Must Fix)
1.  **Sandbox the Compiler:**
    -   **Action:** **Stop using `subprocess` directly.** Move the code execution to an isolated environment.
    -   **Solution:** Use a dedicated sandboxing service like **Piston**, **Judge0**, or run user code inside ephemeral **Docker containers** (with strict resource limits and no network access) or **Firecracker microVMs**.
2.  **Restrict Database Access:**
    -   **Action:** Stop using the `service_role_key` for user-facing API operations.
    -   **Solution:** Use the `anon_key` and forward the user's JWT (access token) to Supabase. This allows the database's **Row Level Security (RLS)** policies to enforce permissions automatically and robustly. Use the service role key *only* for administrative tasks that absolutely require bypassing RLS.

### Short-Term Improvements
3.  **Refactor the Monolith:**
    -   **Action:** Break `paper/main.py` into multiple API routers based on domain (e.g., `routers/notes.py`, `routers/auth.py`, `routers/youtube.py`).
    -   **Solution:** Use FastAPI's `APIRouter` to organize endpoints. This improves readability and testability.
4.  **Remove Code Duplication:**
    -   **Action:** Delete the inlined versions of `youtube_video.py` and `yt_transcript.py` in `main.py` and import them strictly from `paper/packages/`.
5.  **Implement Automated Testing:**
    -   **Action:** There is currently no visible test suite.
    -   **Solution:** Add unit tests (pytest) for critical business logic and integration tests for API endpoints.

### Long-Term Strategy
6.  **Dependency Management:**
    -   **Action:** Pin dependencies in `requirements.txt` to specific versions to prevent breakage from updates.
7.  **Frontend/Backend Separation:**
    -   **Action:** Consider fully decoupling the frontend (serving it via Nginx/Vercel/Netlify) and keeping the FastAPI app strictly as a JSON API. This simplifies deployment and scaling.
