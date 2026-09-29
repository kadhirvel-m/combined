# PaperX MCP (Model Context Protocol) — Complete Reference

## Table of Contents

1. [What is MCP?](#what-is-mcp)
2. [Architecture Overview](#architecture-overview)
3. [Configuration](#configuration)
4. [Authentication](#authentication)
5. [MCP Mounts & Tool Catalog](#mcp-mounts--tool-catalog)
6. [Client Setup (Claude Desktop, Cursor, etc.)](#client-setup)
7. [How It Works Internally](#how-it-works-internally)
8. [Security Model](#security-model)
9. [Codebase Locations](#codebase-locations)
10. [Troubleshooting](#troubleshooting)
11. [Adding / Removing Tools](#adding--removing-tools)
12. [Performance Guidelines](#performance-guidelines)
13. [Endpoints NOT Exposed](#endpoints-not-exposed)

---

## What is MCP?

**Model Context Protocol (MCP)** is an open standard that lets AI agents (like Claude, Cursor, Windsurf, etc.) discover and call your API endpoints as "tools." Instead of manually describing each API to an AI, MCP automatically exposes your FastAPI routes as structured tool definitions that AI clients can browse and invoke.

PaperX uses the **`fastapi-mcp`** library (v0.4.0) to bridge FastAPI endpoints into MCP-compatible tool servers. It tunnels through FastAPI's ASGI layer, meaning all middleware (auth, rate limiting, CSRF, RBAC) stays active.

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                    PaperX FastAPI App                     │
│                                                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ /mcp/   │ │ /mcp/   │ │ /mcp/   │ │ /mcp/   │       │
│  │ student │ │ teacher │ │  hod    │ │  admin  │       │
│  │ 42 tools│ │ 38 tools│ │ 13 tools│ │ 40 tools│       │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘       │
│       │           │           │           │              │
│       └───────────┴───────────┴───────────┘              │
│                       │                                  │
│              FastApiMCP (SSE transport)                   │
│                       │                                  │
│  ┌────────────────────┼────────────────────────────────┐ │
│  │            ASGI Middleware Stack                     │ │
│  │  • Auth enforcement (JWT via Supabase)               │ │
│  │  • RBAC role checks (admin/teacher/hod)              │ │
│  │  • Rate limiting (global + scoped)                   │ │
│  │  • CSRF protection                                   │ │
│  │  • Abuse scoring                                     │ │
│  │  • Security headers                                  │ │
│  └─────────────────────────────────────────────────────┘ │
│                       │                                  │
│              FastAPI Route Handlers                       │
│              (389 total endpoints)                        │
└──────────────────────────────────────────────────────────┘
```

**Key insight**: MCP tool calls are just HTTP requests that go through the exact same middleware as browser/mobile requests. There's no bypass.

---

## Configuration

### Environment Variables

| Variable      | Default | Description                                                                               |
| ------------- | ------- | ----------------------------------------------------------------------------------------- |
| `MCP_ENABLED` | `false` | Set to `true`, `1`, `yes`, or `on` to activate MCP mounts. **Off by default** for safety. |

### Where it's defined

```python
# main.py, line ~253
MCP_ENABLED = (os.getenv("MCP_ENABLED", "false").strip().lower() in {"1", "true", "yes", "on"})
```

### How to enable

**Local development** — add to your `.env`:

```bash
MCP_ENABLED=true
```

**Production (DigitalOcean/Render/Docker)** — add as an environment variable:

```bash
MCP_ENABLED=true
```

**One-off testing** — prefix the command:

```bash
MCP_ENABLED=true uvicorn main:app --host 0.0.0.0 --port 8000
```

### Package Dependency

```
# requirements.txt
fastapi-mcp
```

The import is **conditional** — if `fastapi-mcp` is missing, the app still starts normally:

```python
try:
    from fastapi_mcp import FastApiMCP
except Exception:
    FastApiMCP = None
```

---

## Authentication

### How Auth Works with MCP

PaperX uses **Supabase JWT authentication**. MCP clients must provide a valid JWT token in the `Authorization` header. The flow:

```
MCP Client (Claude/Cursor)
    │
    │  Authorization: Bearer <supabase_jwt_token>
    │
    ▼
PaperX Server
    │
    ├─ auth middleware extracts Bearer token (or cookie fallback)
    ├─ _validate_token_claims() verifies JWT:
    │   ├─ Primary: local PyJWT signature verification (HS256)
    │   └─ Fallback: Supabase Auth API server-side validation
    ├─ RBAC check (admin/teacher/hod roles on protected routes)
    │
    ▼
  Route Handler executes (or 401/403 returned)
```

### Getting a JWT Token

**Option 1: Login via API**

```bash
curl -X POST https://your-server.com/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "your-password"}'
```

Response:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "v1.xxxxx...",
  "expires_in": 3600
}
```

Use the `access_token` value as your Bearer token.

**Option 2: From Supabase Dashboard**

1. Go to your Supabase project → Authentication → Users
2. Click a user → Copy their JWT from an active session
3. Or use the Supabase JS client to sign in and capture `session.access_token`

**Option 3: From the browser (if logged into PaperX)**

1. Open DevTools → Application → Cookies
2. Find the `sb-access-token` cookie value
3. Use that as your Bearer token

### Token Expiry

- Access tokens expire after **3600 seconds (1 hour)** by default
- Use the `/refresh` endpoint with your `refresh_token` to get a new access token
- MCP clients will need to handle token refresh if sessions are long

### What Happens Without Auth

```bash
curl http://localhost:8000/mcp/student
# → {"detail": "Authentication required"}  (HTTP 401)
```

Every MCP endpoint returns **401 Unauthorized** without a valid JWT.

### RBAC (Role-Based Access Control)

Some MCP mounts expose endpoints that require specific roles:

| Mount          | Required Role                            | Enforced By     |
| -------------- | ---------------------------------------- | --------------- |
| `/mcp/student` | Any authenticated user                   | JWT middleware  |
| `/mcp/teacher` | `teacher`, `employee`, `hod`, or `admin` | RBAC middleware |
| `/mcp/hod`     | `hod` or `admin`                         | RBAC middleware |
| `/mcp/admin`   | `admin`                                  | RBAC middleware |

If a student's JWT is used to call a teacher-only tool, the response is:

```json
{ "detail": "Forbidden" } // HTTP 403
```

---

## MCP Mounts & Tool Catalog

### 🎓 Student MCP — `/mcp/student` (42 tools)

**Purpose**: Core student learning experience — profile, progress, syllabus, notes, AI chat, assignments, tests.

#### Profile & Identity (4 tools)

| Operation ID         | Method | Endpoint                         | Description                         |
| -------------------- | ------ | -------------------------------- | ----------------------------------- |
| `get_me`             | GET    | `/api/me`                        | Get full user profile with syllabus |
| `get_profile_me`     | GET    | `/api/profile/me`                | Get profile data                    |
| `update_profile_me`  | PUT    | `/api/profile/me`                | Update profile fields               |
| `get_public_profile` | GET    | `/api/public/profiles/{user_id}` | View public profile                 |

#### Progress & Streaks (6 tools)

| Operation ID           | Method | Endpoint                | Description                |
| ---------------------- | ------ | ----------------------- | -------------------------- |
| `progress_summary`     | GET    | `/api/progress/summary` | Overall progress stats     |
| `get_completed_topics` | GET    | `/api/progress/topics`  | List completed topics      |
| `toggle_topic`         | POST   | `/api/progress/toggle`  | Mark/unmark topic complete |
| `get_user_streak`      | GET    | `/api/streak`           | Get streak info            |
| `ping_streak`          | POST   | `/api/streak/ping`      | Update streak activity     |
| `get_leaderboard`      | GET    | `/api/leaderboard`      | View leaderboard           |

#### Syllabus (7 tools)

| Operation ID               | Method | Endpoint                                    | Description             |
| -------------------------- | ------ | ------------------------------------------- | ----------------------- |
| `api_get_syllabus_course`  | GET    | `/api/syllabus/courses/{course_id}`         | Get course details      |
| `api_list_topics_for_unit` | GET    | `/api/syllabus/units/{unit_id}/topics`      | List topics in a unit   |
| `api_find_topics_by_title` | GET    | `/api/syllabus/topics/by-title`             | Search topics by title  |
| `get_course_topic_ratings` | GET    | `/api/syllabus/courses/{course_id}/ratings` | Get all topic ratings   |
| `get_topic_rating`         | GET    | `/api/syllabus/topics/{topic_id}/rating`    | Get single topic rating |
| `set_topic_rating`         | PUT    | `/api/syllabus/topics/{topic_id}/rating`    | Rate a topic            |
| `get_topic_ratings_batch`  | POST   | `/api/syllabus/topics/ratings/batch`        | Batch get ratings       |

#### Notes & Study (9 tools)

| Operation ID              | Method | Endpoint                          | Description            |
| ------------------------- | ------ | --------------------------------- | ---------------------- |
| `api_list_notes`          | GET    | `/api/notes`                      | List all notes         |
| `api_read_note`           | GET    | `/api/notes/{note_id}`            | Read a note            |
| `api_download_note`       | GET    | `/api/notes/{note_id}/download`   | Download note          |
| `api_note_pdf`            | GET    | `/api/notes/{note_id}/pdf`        | Get note as PDF        |
| `generate`                | POST   | `/api/notes/generate`             | Generate AI notes      |
| `api_generate_flashcards` | POST   | `/api/notes/{note_id}/flashcards` | Generate flashcards    |
| `api_generate_mcq`        | POST   | `/api/notes/{note_id}/mcq`        | Generate MCQ questions |
| `api_resolve_note`        | GET    | `/api/notes/resolve`              | Resolve note by query  |
| `api_search_topics`       | GET    | `/api/notes/topics/search`        | Search topics          |

#### StudyAI Chat (8 tools)

| Operation ID                   | Method | Endpoint                                    | Description            |
| ------------------------------ | ------ | ------------------------------------------- | ---------------------- |
| `list_conversations`           | GET    | `/api/studyai/conversations`                | List AI conversations  |
| `create_conversation`          | POST   | `/api/studyai/conversations`                | Start new conversation |
| `get_conversation`             | GET    | `/api/studyai/conversations/{id}`           | Get conversation       |
| `update_conversation`          | PATCH  | `/api/studyai/conversations/{id}`           | Update conversation    |
| `delete_conversation`          | DELETE | `/api/studyai/conversations/{id}`           | Delete conversation    |
| `send_message`                 | POST   | `/api/studyai/conversations/{id}/messages`  | Send message           |
| `toggle_message_bookmark`      | PATCH  | `/api/studyai/messages/{id}/bookmark`       | Bookmark message       |
| `export_conversation_markdown` | GET    | `/api/studyai/conversations/{id}/export/md` | Export as markdown     |

#### Assignments — Student Side (4 tools)

| Operation ID              | Method | Endpoint                                          | Description           |
| ------------------------- | ------ | ------------------------------------------------- | --------------------- |
| `get_student_assignments` | GET    | `/api/student/assignments`                        | List my assignments   |
| `get_student_assignment`  | GET    | `/api/student/assignments/{id}`                   | Get assignment detail |
| `submit_assignment`       | POST   | `/api/student/assignments/{id}/submit`            | Submit assignment     |
| `request_extension`       | POST   | `/api/student/assignments/{id}/request-extension` | Request extension     |

#### Tests — Student Side (3 tools)

| Operation ID         | Method | Endpoint                      | Description         |
| -------------------- | ------ | ----------------------------- | ------------------- |
| `api_get_test`       | GET    | `/api/tests/{test_id}`        | Get test details    |
| `api_start_attempt`  | POST   | `/api/tests/{test_id}/start`  | Start test attempt  |
| `api_submit_attempt` | POST   | `/api/tests/{test_id}/submit` | Submit test answers |

#### Skills (3 tools)

| Operation ID                  | Method | Endpoint                                | Description            |
| ----------------------------- | ------ | --------------------------------------- | ---------------------- |
| `start_skill_test`            | POST   | `/api/skills/tests/start`               | Start skill assessment |
| `submit_skill_test`           | POST   | `/api/skills/tests/{session_id}/submit` | Submit skill test      |
| `list_my_skill_verifications` | GET    | `/api/skills/verifications`             | List skill badges      |

#### Wishlist (3 tools)

| Operation ID      | Method | Endpoint                         | Description               |
| ----------------- | ------ | -------------------------------- | ------------------------- |
| `get_wishlist`    | GET    | `/api/wishlist`                  | Get wishlist              |
| `check_wishlist`  | GET    | `/api/wishlist/check/{topic_id}` | Check if topic wishlisted |
| `toggle_wishlist` | POST   | `/api/wishlist/toggle`           | Toggle wishlist item      |

---

### 👩‍🏫 Teacher MCP — `/mcp/teacher` (38 tools)

**Purpose**: Teacher-facing tools — class management, grading, test creation, feedback.

**Required role**: `teacher`, `employee`, `hod`, or `admin`

#### Teacher Profile (3 tools)

| Operation ID             | Method | Endpoint                         |
| ------------------------ | ------ | -------------------------------- |
| `teacher_me_status`      | GET    | `/api/teacher/me/status`         |
| `upsert_teacher_profile` | PUT    | `/api/teacher/profile/me`        |
| `get_teacher_profile`    | GET    | `/api/teacher/profile/{user_id}` |

#### Classes (6 tools)

| Operation ID                  | Method | Endpoint                                   |
| ----------------------------- | ------ | ------------------------------------------ |
| `list_my_teacher_classes`     | GET    | `/api/teacher/classes/mine`                |
| `create_teacher_class`        | POST   | `/api/teacher/classes`                     |
| `get_teacher_class`           | GET    | `/api/teacher/classes/{class_id}`          |
| `update_teacher_class`        | PUT    | `/api/teacher/classes/{class_id}`          |
| `delete_teacher_class`        | DELETE | `/api/teacher/classes/{class_id}`          |
| `list_teacher_class_students` | GET    | `/api/teacher/classes/{class_id}/students` |

#### Assignments — Teacher Side (15 tools)

| Operation ID                | Method | Endpoint                                           |
| --------------------------- | ------ | -------------------------------------------------- |
| `list_assignments`          | GET    | `/api/assignments`                                 |
| `create_assignment`         | POST   | `/api/assignments`                                 |
| `get_assignment`            | GET    | `/api/assignments/{id}`                            |
| `update_assignment`         | PUT    | `/api/assignments/{id}`                            |
| `delete_assignment`         | DELETE | `/api/assignments/{id}`                            |
| `publish_assignment`        | POST   | `/api/assignments/{id}/publish`                    |
| `close_assignment`          | POST   | `/api/assignments/{id}/close`                      |
| `get_submissions`           | GET    | `/api/assignments/{id}/submissions`                |
| `grade_submission`          | PUT    | `/api/assignments/{id}/submissions/{sub_id}/grade` |
| `get_assignment_analytics`  | GET    | `/api/assignments/{id}/analytics`                  |
| `get_duplicate_submissions` | GET    | `/api/assignments/{id}/duplicates`                 |
| `get_comments`              | GET    | `/api/assignments/{id}/comments`                   |
| `add_comment`               | POST   | `/api/assignments/{id}/comments`                   |
| `get_extensions`            | GET    | `/api/assignments/{id}/extensions`                 |
| `respond_to_extension`      | PUT    | `/api/assignments/extensions/{ext_id}`             |

#### Tests — Teacher Side (8 tools)

| Operation ID                   | Method | Endpoint                                 |
| ------------------------------ | ------ | ---------------------------------------- |
| `api_list_tests`               | GET    | `/api/teacher/tests`                     |
| `api_create_test`              | POST   | `/api/teacher/tests`                     |
| `api_update_test`              | PUT    | `/api/teacher/tests/{test_id}`           |
| `api_delete_test`              | DELETE | `/api/teacher/tests/{test_id}`           |
| `api_toggle_accepting`         | PATCH  | `/api/teacher/tests/{test_id}/accepting` |
| `api_list_attempts`            | GET    | `/api/teacher/tests/{test_id}/attempts`  |
| `api_test_results`             | GET    | `/api/teacher/tests/{test_id}/results`   |
| `api_teacher_generate_test_ai` | POST   | `/api/teacher/tests/ai`                  |

#### Notes, Applications, Connections, Feedback (6 tools)

| Operation ID                 | Method | Endpoint                                  |
| ---------------------------- | ------ | ----------------------------------------- |
| `teacher_my_notes`           | GET    | `/api/teacher/notes/mine`                 |
| `teacher_notes_meta`         | GET    | `/api/teacher/notes/upload-meta`          |
| `list_teacher_applications`  | GET    | `/api/teacher/applications`               |
| `review_teacher_application` | POST   | `/api/teacher/applications/{id}/review`   |
| `list_my_connections`        | GET    | `/api/teacher/connections`                |
| `teacher_connect`            | POST   | `/api/teacher/connect/{other_user_id}`    |
| `list_feedback_forms`        | GET    | `/api/feedback/forms`                     |
| `create_feedback_form`       | POST   | `/api/feedback/forms`                     |
| `get_feedback_form`          | GET    | `/api/feedback/forms/{form_id}`           |
| `get_feedback_responses`     | GET    | `/api/feedback/forms/{form_id}/responses` |
| `get_feedback_analytics`     | GET    | `/api/feedback/forms/{form_id}/analytics` |

---

### 🏛️ HOD MCP — `/mcp/hod` (13 tools)

**Purpose**: Head of Department management — staff oversight, class assignment, batch management.

**Required role**: `hod` or `admin`

| Operation ID                    | Method | Endpoint                               | Description                 |
| ------------------------------- | ------ | -------------------------------------- | --------------------------- |
| `hod_me`                        | GET    | `/api/hod/me`                          | HOD dashboard info          |
| `hod_list_staff`                | GET    | `/api/hod/staff`                       | List department staff       |
| `hod_remove_staff`              | POST   | `/api/hod/staff/remove`                | Remove staff member         |
| `hod_list_classes`              | GET    | `/api/hod/classes`                     | List all classes            |
| `hod_assign_class`              | POST   | `/api/hod/classes/assign`              | Assign class to teacher     |
| `hod_reassign_class`            | POST   | `/api/hod/classes/{class_id}/reassign` | Reassign class              |
| `hod_list_batches`              | GET    | `/api/hod/batches`                     | List batches                |
| `hod_get_batch_management`      | GET    | `/api/hod/batch-management`            | Get batch config            |
| `hod_update_batch_management`   | POST   | `/api/hod/batch-management`            | Update batch config         |
| `hod_list_teacher_applications` | GET    | `/api/hod/applications`                | List teacher applications   |
| `hod_review_application`        | POST   | `/api/hod/applications/{id}/review`    | Review application          |
| `hod_ai_meeting_agenda`         | POST   | `/api/hod/ai/meeting-agenda`           | AI: generate meeting agenda |
| `hod_ai_risk_flags`             | POST   | `/api/hod/ai/risk-flags`               | AI: flag at-risk students   |

---

### 🔑 Admin MCP — `/mcp/admin` (40 tools)

**Purpose**: Full platform administration — users, plans, security, analytics.

**Required role**: `admin`

#### Users & Roles (6 tools)

| Operation ID                 | Method | Endpoint                                   |
| ---------------------------- | ------ | ------------------------------------------ |
| `list_admin_users`           | GET    | `/api/admin/users`                         |
| `delete_user`                | DELETE | `/api/admin/users/{auth_user_id}`          |
| `admin_update_user_academic` | POST   | `/api/admin/users/{auth_user_id}/academic` |
| `update_user_role`           | POST   | `/api/admin/users/{auth_user_id}/role`     |
| `admin_role_me`              | GET    | `/api/admin/roles/me`                      |
| `admin_self_check`           | GET    | `/api/admin/self-check`                    |

#### Plans (7 tools)

| Operation ID             | Method | Endpoint                               |
| ------------------------ | ------ | -------------------------------------- |
| `admin_list_plans`       | GET    | `/api/admin/plans`                     |
| `admin_create_plan`      | POST   | `/api/admin/plans`                     |
| `admin_update_plan`      | PUT    | `/api/admin/plans/{plan_id}`           |
| `admin_delete_plan`      | DELETE | `/api/admin/plans/{plan_id}`           |
| `admin_disable_plan`     | POST   | `/api/admin/plans/{plan_id}/disable`   |
| `admin_duplicate_plan`   | POST   | `/api/admin/plans/{plan_id}/duplicate` |
| `admin_rest_plan_limits` | POST   | `/api/admin/plans/{plan_id}/rest`      |

#### Usage Limits (4 tools)

| Operation ID               | Method | Endpoint                            |
| -------------------------- | ------ | ----------------------------------- |
| `admin_list_usage_limits`  | GET    | `/api/admin/usage-limits`           |
| `admin_create_usage_limit` | POST   | `/api/admin/usage-limits`           |
| `admin_update_usage_limit` | PUT    | `/api/admin/usage-limits/{rule_id}` |
| `admin_delete_usage_limit` | DELETE | `/api/admin/usage-limits/{rule_id}` |

#### Security (4 tools)

| Operation ID                     | Method | Endpoint                             |
| -------------------------------- | ------ | ------------------------------------ |
| `admin_list_security_events`     | GET    | `/api/admin/security/events`         |
| `admin_list_security_incidents`  | GET    | `/api/admin/security/incidents`      |
| `admin_update_security_incident` | PATCH  | `/api/admin/security/incidents/{id}` |
| `admin_security_metrics`         | GET    | `/api/admin/security/metrics`        |

#### Teacher Profiles (4 tools)

| Operation ID                         | Method | Endpoint                                      |
| ------------------------------------ | ------ | --------------------------------------------- |
| `admin_backfill_teacher_profiles`    | POST   | `/api/admin/teacher-profiles/backfill`        |
| `admin_teacher_profiles_diagnostics` | GET    | `/api/admin/teacher-profiles/diagnostics`     |
| `admin_get_teacher_profile_row`      | GET    | `/api/admin/teacher-profiles/{user_id}`       |
| `admin_resync_teacher_profile`       | POST   | `/api/admin/teacher/profile/resync/{user_id}` |

#### HOD Applications, Notes Feedback, Print Admin, Manual Access (10 tools)

| Operation ID                  | Method | Endpoint                                               |
| ----------------------------- | ------ | ------------------------------------------------------ |
| `list_hod_role_applications`  | GET    | `/api/admin/hod-applications`                          |
| `review_hod_role_application` | POST   | `/api/admin/hod-applications/{id}/review`              |
| `admin_list_notes_feedback`   | GET    | `/api/admin/notes-feedback`                            |
| `admin_get_notes_feedback`    | GET    | `/api/admin/notes-feedback/{feedback_id}`              |
| `admin_update_notes_feedback` | PATCH  | `/api/admin/notes-feedback/{feedback_id}`              |
| `admin_list_shops`            | GET    | `/api/admin/print/shops`                               |
| `admin_shop_jobs`             | GET    | `/api/admin/print/shops/{shop_id}/jobs`                |
| `admin_close_job`             | POST   | `/api/admin/print/shops/{shop_id}/jobs/{job_id}/close` |
| `admin_settle_shop`           | POST   | `/api/admin/print/shops/{shop_id}/settle`              |
| `admin_manual_access_search`  | GET    | `/api/admin/manual-access/search`                      |
| `admin_manual_access_get`     | GET    | `/api/admin/manual-access/{auth_user_id}`              |
| `admin_manual_access_action`  | POST   | `/api/admin/manual-access/{auth_user_id}/action`       |

#### Analytics (5 tools)

| Operation ID                 | Method | Endpoint                      |
| ---------------------------- | ------ | ----------------------------- |
| `start_session`              | POST   | `/analytics/session/start`    |
| `analytics_event`            | POST   | `/analytics/event`            |
| `analytics_dashboard`        | GET    | `/analytics/dashboard`        |
| `analytics_active_users`     | GET    | `/analytics/active-users`     |
| `analytics_engineer_profile` | GET    | `/analytics/engineer-profile` |

---

## Client Setup

### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

```json
{
  "mcpServers": {
    "paperx-student": {
      "url": "https://your-server.com/mcp/student",
      "headers": {
        "Authorization": "Bearer YOUR_JWT_TOKEN"
      }
    },
    "paperx-admin": {
      "url": "https://your-server.com/mcp/admin",
      "headers": {
        "Authorization": "Bearer YOUR_JWT_TOKEN"
      }
    }
  }
}
```

### Cursor IDE

In Cursor Settings → MCP Servers, add:

```json
{
  "paperx-student": {
    "url": "https://your-server.com/mcp/student",
    "headers": {
      "Authorization": "Bearer YOUR_JWT_TOKEN"
    }
  }
}
```

### Via `mcp-remote` (for clients that don't support headers natively)

```bash
npx mcp-remote https://your-server.com/mcp/student \
  --header "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Local Development

```bash
# Start server with MCP enabled
MCP_ENABLED=true uvicorn main:app --host 127.0.0.1 --port 8000

# Point client to local
# URL: http://0.0.0.0:10000/mcp/student
```

---

## How It Works Internally

### Boot Sequence

1. `main.py` loads → `MCP_ENABLED` env var checked
2. If `MCP_ENABLED=true` and `fastapi-mcp` is installed:
   - 4 `FastApiMCP` instances are created with `include_operations` lists
   - Each is mounted at its path via `.mount(mount_path="...")`
   - Log: `"MCP mounts ready: /mcp/student, /mcp/teacher, /mcp/hod, /mcp/admin"`
3. If disabled, log: `"MCP_ENABLED is not set — MCP mounts disabled"`

### Request Flow

```
1. MCP Client sends SSE request to /mcp/student
2. FastAPI ASGI middleware chain executes:
   a. rate_limit_middleware → checks rate limits
   b. auth_request_context_and_cookie_bridge → extracts JWT, checks CSRF, abuse score
   c. enforce_authenticated_api_access → validates JWT, checks RBAC roles
3. If auth passes → FastApiMCP handles MCP protocol
4. MCP Client calls a tool (e.g., "get_me")
5. FastApiMCP routes the tool call to the actual endpoint handler
6. Response flows back through the same middleware stack
```

### Operation IDs

FastAPI auto-generates `operation_id` from function names. For example:

- Function `def get_me(...)` → operation_id = `"get_me"`
- Function `def api_list_notes(...)` → operation_id = `"api_list_notes"`

These are the same IDs used in `include_operations` lists.

---

## Security Model

### Layers of Protection

| Layer                | What It Does                                     | MCP Impact                          |
| -------------------- | ------------------------------------------------ | ----------------------------------- |
| **JWT Auth**         | Validates Supabase access token                  | MCP calls need valid Bearer token   |
| **RBAC**             | Enforces role requirements (admin, teacher, hod) | Wrong role → 403 Forbidden          |
| **Rate Limiting**    | Global + scoped limits per IP                    | MCP calls count toward limits       |
| **CSRF**             | Token validation for mutations                   | Applied on state-changing ops       |
| **Abuse Scoring**    | Tracks suspicious patterns, auto-blocks          | Excessive MCP failures → block      |
| **Cookie Bridge**    | Falls back to cookie auth if no header           | Works for browser-based MCP clients |
| **Security Headers** | X-Frame-Options, CSP, HSTS, etc.                 | Applied to MCP responses            |

### What Unauthenticated Calls Get

```
HTTP 401: {"detail": "Authentication required"}
```

### What Wrong-Role Calls Get

```
HTTP 403: {"detail": "Forbidden"}
```

### What Rate-Limited Calls Get

```
HTTP 429: {"detail": "Rate limit exceeded", "scope": "global", "retry_after_seconds": 60}
```

---

## Codebase Locations

| What                  | File                   | Line(s)            |
| --------------------- | ---------------------- | ------------------ |
| FastApiMCP import     | `main.py`              | ~120-123           |
| `MCP_ENABLED` env var | `main.py`              | ~253               |
| Student MCP mount     | `main.py`              | ~45479-45543       |
| Teacher MCP mount     | `main.py`              | ~45545-45604       |
| HOD MCP mount         | `main.py`              | ~45606-45627       |
| Admin MCP mount       | `main.py`              | ~45629-45690       |
| Log messages          | `main.py`              | ~45692-45699       |
| Auth middleware       | `main.py`              | ~33802-33853       |
| JWT validation        | `main.py`              | ~424-530           |
| RBAC enforcement      | `main.py`              | ~33846-33851       |
| Endpoint surface map  | `endpoint_surface.tsv` | Full file          |
| Package dependency    | `requirements.txt`     | `fastapi-mcp` line |

---

## Troubleshooting

### "MCP_ENABLED is not set — MCP mounts disabled"

→ Set `MCP_ENABLED=true` in environment

### "fastapi-mcp package not installed — MCP mounts disabled"

→ Run: `pip install fastapi-mcp`

### "Authentication required" on every MCP call

→ Your MCP client isn't sending the Bearer token. Check the `Authorization` header.

### "Forbidden" (403) on teacher/admin tools

→ Your JWT belongs to a user without the required role. Check the user's role in the `admin_roles` table.

### "Skipping non-HTTP method: options" in logs

→ Normal. `fastapi-mcp` skips CORS preflight handlers (OPTIONS). Not an error.

### MCP client shows 0 tools

→ Check that `include_operations` IDs match actual function names in `main.py`. If a function was renamed, the operation_id changed too.

### Token expired during MCP session

→ Access tokens expire after ~1 hour. Use `/refresh` endpoint to get a new one, then reconfigure your MCP client.

### Performance is slow with too many tools

→ Keep each mount under 50 tools. Current counts: Student=42, Teacher=38, HOD=13, Admin=40.

---

## Adding / Removing Tools

### To add a tool to an existing mount

1. Find the function name of the endpoint in `main.py` (this is the `operation_id`)
2. Add it to the `include_operations` list of the target mount
3. Restart the server

Example — adding `get_history` to Student MCP:

```python
# In the student_mcp include_operations list, add:
"get_history",
```

### To remove a tool

Delete the operation_id string from the `include_operations` list and restart.

### To create a new mount

```python
new_mcp = FastApiMCP(
    app,
    name="PaperX - New Module",
    description="Description of what this mount exposes",
    include_operations=[
        "operation_id_1",
        "operation_id_2",
    ],
)
new_mcp.mount(mount_path="/mcp/new-module")
```

### Finding operation IDs

The operation_id is the **Python function name** of the endpoint handler. You can find all of them in `endpoint_surface.tsv` (the `handler` column).

---

## Performance Guidelines

| Guideline               | Value      | Why                                      |
| ----------------------- | ---------- | ---------------------------------------- |
| Max tools per mount     | **50**     | Performance degrades sharply beyond 60   |
| Current largest mount   | Admin (40) | Safe margin                              |
| Tool discovery overhead | ~100-200ms | SSE connection + tool list serialization |
| Rate limit awareness    | Yes        | MCP calls count toward rate limits       |

### Current tool counts

| Mount     | Tools   | Headroom            |
| --------- | ------- | ------------------- |
| Student   | 42      | 8 more before limit |
| Teacher   | 38      | 12 more             |
| HOD       | 13      | 37 more             |
| Admin     | 40      | 10 more             |
| **Total** | **133** | —                   |

---

## Endpoints NOT Exposed via MCP

The following are intentionally excluded:

| Category                                                                  | Reason                                                     |
| ------------------------------------------------------------------------- | ---------------------------------------------------------- |
| **Auth** (`/login`, `/signup`, `/logout`, `/refresh`)                     | Auth should happen before MCP, not through it              |
| **File uploads** (`upload_assignment_file`, `upload_profile_asset`, etc.) | Binary payloads don't work as MCP tools                    |
| **SSE/Streaming** (`generate_stream`, `generate_labx_stream`, etc.)       | Long-lived streams incompatible with MCP tool model        |
| **Debug routes** (`/api/debug/*`)                                         | Internal diagnostics only                                  |
| **WebSockets** (`/ws/group-chat/*`)                                       | MCP doesn't support WebSocket transport                    |
| **Garlic study planner** (~25 endpoints)                                  | Excluded by design — could be a future `/mcp/garlic` mount |
| **InnovateX, LabX, Learning Tracks, Marketplace, YouTube, Projects**      | Excluded per user preference                               |
| **Print shop** (`/api/shop/*`, `/api/print/*`)                            | End-user shop ops, not suited for AI tools                 |
| **College/Dept/Batch CRUD**                                               | Infrastructure management, rarely needed via AI            |
| **Health check** (`/health`)                                              | System probe, not a user tool                              |
