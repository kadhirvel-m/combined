# TuNe X Platform

TuNe X is a Supabase-backed FastAPI platform where students and technologists publish rich profiles, post projects, recruit collaborators, and validate skills via AI-driven assessments. The repository pairs a single FastAPI backend (`main.py`) with a collection of static Tailwind pages (`ui/`) that call the API directly from the browser.

## Key Features

- **Auth & Profiles**: Email/password sign-up/sign-in, profile CRUD, image/resume uploads to Supabase Storage, and public profile sharing with minimal exposure.
- **Projects Hub**: Project creation, listing, detail views, and media gallery uploads restricted to owners.
- **Applications Flow**: "I'm Interested" requests with duplicate-prevention, owner Incoming Requests and per-project applicants, Accept/Reject actions, and applicant-facing Accepted banner with confetti. Quick Actions reflects Accepted state.
- **Skill Verification Lab**: AI-generated conceptual + coding questions, automated scoring, verification badges on the profile, and profile-level verification_score aggregation.
- **TuNe AI Chatbot**: Floating Material-style chat widget on every page posting to `/api/tune-ai/chat` with accessible semantics, typing indicator, per-page open-state persistence, and dark-mode aware styling.
- **Public Discovery**: Landing page, project listings, and public profile cards optimized with Tailwind and responsive components.
- **Environment Flexibility**: Works with a Supabase anon key by default; switches to service-role key if available for server-side operations.

## Tech Stack

### Backend

- Python 3, FastAPI, Pydantic
- Supabase Py Client, HTTPBearer security
- Optional OpenAI Responses API for question generation/grading and chat replies
- python-dotenv, python-multipart

### Database (Supabase Postgres)

- Tables: `profiles`, `projects`, `skill_tests`, `skill_verifications`, `project_applications`
- Shared `set_updated_at` trigger function
- Public storage bucket `storage`

### Frontend

- Vanilla HTML/JS served from `/ui`
- Tailwind CSS via CDN (forms / typography / line-clamp plugins)
- Material Symbols icons
- Fetch API for direct calls to the FastAPI backend
- Global TuNe AI widget injected via `ui/config.js`

## Backend Structure (`main.py`)

1. **Bootstrap**

   - Loads environment variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, optional `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `OPENAI_MODEL`, `STORAGE_BUCKET`, `PROFILE_TABLE`, `PROJECTS_TABLE`, `APP_DEBUG`.
   - Creates Supabase anon/service clients and configures global logging.

2. **Middleware**

   - Enables permissive CORS and logs request timings.

3. **Models**

   - Pydantic schemas for auth payloads, profile data, nested project structures, skill test flows, and project applications.

4. **Helpers**

   - Profiles: `_get_profile`, `_save_profile_row`, `_recompute_profile_verification_score`.
   - Projects: `_project_row_to_out` converts Supabase rows to API responses.
   - Skill Assessments: `_generate_skill_questions` (OpenAI or deterministic fallback), `_grade_skill_answers`, `_ensure_storage_client`.

5. **Auth Dependency**

   - `get_current_user` validates Bearer tokens via Supabase Auth.

6. **Endpoints**
   - **Auth**: `POST /api/signup`, `POST /api/signin`.
   - **Profiles**: `GET /api/profile`, `POST /api/profile`, `POST /api/profile/upload`.
   - **Projects**: `POST /api/projects`, `GET /api/projects`, `GET /api/projects/{id}`, `POST /api/projects/{id}/upload`.
   - **Applications**:
     - `POST /api/projects/{id}/apply`
     - `GET /api/projects/{id}/applications` (owner-only)
     - `GET /api/applications/incoming` (owner aggregate)
     - `GET /api/projects/{id}/applications/me` (applicant pre-check)
     - `GET /api/projects/{id}/applications/{app_id}` (owner view)
     - `PATCH /api/projects/{id}/applications/{app_id}` (owner Accept/Reject)
   - **Skills**: `POST /api/skills/tests/start`, `POST /api/skills/tests/{session_id}/submit`, `GET /api/skills/verifications`, `GET /api/public/skills/verifications/{user_id}`.
   - **Public**: `GET /api/public/profiles/{user_id}`.
   - **Chatbot**: `POST /api/tune-ai/chat`.
   - **Tools & Learning**:
     - `POST /api/tools/search` — inputs `{ title?, description?, n=5 }`, returns `{ results: [{ title, link, snippet }] }`.
     - `POST /api/tools/cover/all` — inputs `{ skills[], search_per_skill?, language?, country?, include_snippet?, region_code?, relevance_language?, min_views?, site_bias? }`, returns grouped greedy covers for blogs, news, and YouTube.
   - **Debug**: `GET /api/debug/profile` (only when `APP_DEBUG` is true).

## Skill Assessment Workflow

1. Client requests `POST /api/skills/tests/start` with a skill name.
2. Backend generates five questions (3 CEQ + 2 coding) using OpenAI if configured, else a deterministic fallback.
3. Session is stored in `skill_tests` with status `active`.
4. Client submits answers via `POST /api/skills/tests/{session_id}/submit`.
5. Responses are graded (OpenAI rubric or keyword heuristic) and persisted; `skill_verifications` is upserted.
6. The user’s `verification_score` in `profiles` is recomputed from top scores.

## Applications Workflow

- Applicant clicks “I’m Interested” on a project (idempotent; prevents duplicates).
- Project owner reviews `Incoming Requests` or per-project applicants.
- Owner Accepts/Rejects pending requests; actions hide post-decision.
- Applicant sees an Accepted banner and confetti on the project page; Quick Actions reflects the state.

## Database Schema Summary (`db.sql` + policies)

- **profiles**: Linked to `auth.users(id)`; stores personal, academic, social details and `verification_score`.
- **projects**: UUID primary key, references `auth.users(id)`.
- **skill_tests**: Stores generated questions, score, and result per session.
- **skill_verifications**: Best score and attempts per skill with `updated_at` trigger.
- **project_applications**: Tracks per-project application requests with unique `(project_id, applicant_user_id)` and `updated_at` trigger.

RLS policies (recommended) are provided in `db_rls_policies.sql` for `project_applications` (insert by applicant, select by applicant or project owner, update/delete by owner).

## Frontend Pages (`/ui`)

| File                          | Purpose                                                                                                                |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `index.html`                  | Landing page; auth-aware navbar with avatar/initials.                                                                  |
| `signin.html` / `signup.html` | Email/password auth; hides when signed in.                                                                             |
| `profile.html`                | Dashboard with verification badges and skill chips.                                                                    |
| `profile-edit.html`           | Full editor with file uploads.                                                                                         |
| `postings.html`               | Project discovery grid.                                                                                                |
| `project_post.html`           | Project submission with drafts.                                                                                        |
| `project.html`                | Detail page; “I’m Interested” CTA with status banners and confetti on acceptance.                                      |
| `project_applicants.html`     | Per-project applicants list with statuses.                                                                             |
| `incoming_requests.html`      | Aggregate incoming applications for owners; inline Accept/Reject.                                                      |
| `public_profile.html`         | Owner-aware actions when visited via project/app links; technologies are non-clickable spans with verification badges. |
| `config.js`                   | Sets `window.__API_BASE`, injects global TuNe AI widget and `window.__CHAT_API_BASE`.                                  |

### Tools & Learning Discovery (project page)

- Full-width section below the main grid titled “Tools & Learning”.
- Inputs: Title and Description (prefilled from the project). Uses the project Tech Stack as skills.
- On click “Find Tools & Learning”, runs both endpoints in parallel:
  - Related Tools and Projects: `/api/tools/search` using title+description.
  - Learning Picks: `/api/tools/cover/all` using the tech stack to fetch Blogs/News/YouTube and compute greedy coverage per skill.
- Gracefully handles missing API keys (renders “No results yet.” when empty).

## Chatbot

- Backend router mounted at `/api/tune-ai` with `POST /chat`.
- Uses OpenAI Responses API if `OPENAI_API_KEY` is set; otherwise concise fallback replies for common intents (greetings, help, apply/accept/status/profile/auth).
- Frontend floating widget persists open-state per page and conversation to `sessionStorage`.

## Environment Variables

Set these in `.env` (loaded via `python-dotenv`):

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (optional)
- `OPENAI_API_KEY` (optional)
- `OPENAI_MODEL` (defaults to `gpt-4o-mini` if OpenAI key present)
- `STORAGE_BUCKET` (defaults to `storage`)
- `PROFILE_TABLE` (defaults to `profiles`)
- `PROJECTS_TABLE` (defaults to `projects`)
- `APP_DEBUG` (`true`/`false`)
- `SERPAPI_API_KEY` (required for Tools & Learning search; without it, results will be empty)
- `YOUTUBE_API_KEY` (optional; enables YouTube Learning Picks)

## Setup

1. **Supabase Bootstrap**

   - Run `db.sql` in the Supabase SQL editor to create tables, triggers, and storage bucket.
   - Then run `db_rls_policies.sql` to enable RLS and policies for `project_applications`.

2. **Install Dependencies**

   - `pip install -r requirements.txt`

3. **Environment**

   - Create `.env` with the variables listed above.

4. **Run Backend**

   - `uvicorn main:app --reload`

5. **Serve Frontend**

   - Use a static server (e.g., `python -m http.server` inside `ui/`) or your deployment stack.

6. **Chatbot**
   - The widget is auto-injected by `ui/config.js`. Ensure `window.__API_BASE` resolves to your backend origin (override via `localStorage.setItem('API_BASE', 'https://api.example.com')`).

## Runtime Verification Checklist

- Tools & Learning
  - Set `SERPAPI_API_KEY` (and `YOUTUBE_API_KEY` for YouTube).
  - Open a project page with a tech stack; click “Find Tools & Learning”.
  - Expect related tools on the left and Blogs/News/YouTube picks on the right.
- Apply flow
  - Sign in with two accounts: owner and applicant.
  - Applicant clicks “I’m Interested” → button disables, banner shows Pending on refresh.
  - Owner visits `project_applicants.html?id=...` or `incoming_requests.html` and Accepts.
  - Applicant refreshes project page → Accepted banner + confetti, Quick Actions shows “Open Collaboration”.
  - Open `collab.html?application_id=...` and exchange messages.
- RLS
  - Apply `db_rls_policies.sql` so applicants/owners can select/insert as intended for `project_applications` and `project_collab_messages`.

## Development Tips

- `APP_DEBUG=true` enables verbose logging and `/api/debug/profile` endpoint.
- CORS is permissive by default; restrict `allow_origins` for production.
- File uploads use Supabase Storage with `cache-control` headers set to 3600 seconds.

## Testing Ideas

- E2E application flow: apply → pre-check → owner Accept/Reject → applicant banner + confetti → Quick Actions reflects → actions hidden post-decision.
- Chatbot across pages: open/close panel; send/receive; fallback behavior without OpenAI; persistence of panel open-state and per-page conversation.

---

This README summarizes the current TuNe X platform and its APIs. Update it as new endpoints, features, and integrations are added.
