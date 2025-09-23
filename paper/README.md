# PaperX Notes Generator

Quick notes on running the API + UI and the new persistence/editing features.

## Run

- Install deps from `requirements.txt`.
- Create an `.env` with required keys (see Environment below).
- Start the API server:

```powershell
# From repo root
uvicorn paper.main:app --host 0.0.0.0 --port 8000 --reload
# Or, from the paper/ directory
# uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Open the UI at `http://localhost:8000/ui/notes_generator.html`.

## Environment

Set these variables (e.g., in a `.env` read by your process manager or shell):

- SUPABASE_URL: Your Supabase project URL
- SUPABASE_ANON_KEY: Supabase anon key (used by browser + server for auth)
- SUPABASE_SERVICE_ROLE_KEY: Supabase service role key (server-only operations)
- SUPABASE_BUCKET: Supabase Storage bucket name to store profile images/resumes
- Optional/other features: SERPAPI_API_KEY, OpenAI keys, etc.

The UI initializes Supabase via `GET /api/public/supabase`.

## Google OAuth (Supabase)

This app supports “Continue with Google” sign up/sign in. After OAuth, the app stores the same `access_token` as a regular login, ensures there is a `user_profiles` row, and redirects users to complete profile details.

1. In Supabase

- Auth → URL Configuration:
  - Site URL: http://localhost:8000
  - Additional Redirect URLs:
    - http://localhost:8000/ui/login.html
    - http://localhost:8000/ui/signup.html
- Auth → Providers → Google:
  - Enable Google
  - Provide Google OAuth Client ID/Secret from Google Cloud
  - In Google Cloud OAuth, set the authorized redirect URI shown by Supabase (the GoTrue callback URL in the provider config)

2. In this app

- Login page: `ui/login.html` has a “Continue with Google” button.
  - On redirect back (URL hash contains `access_token`), the UI saves the token, calls `/api/profile/me` (which auto-creates a minimal profile if missing), then redirects to `ui/profile_edit.html`.
- Signup page: `ui/signup.html` has the same Google button.
  - On redirect back, the UI saves the token, calls `/api/profile/me`, then auto-advances the UI to Step 2 to capture academic details.

3. Backend behavior

- `/api/profile/me` and related endpoints ensure a profile exists for OAuth users by creating a minimal `user_profiles` row using auth metadata (email/name) if missing.
- Uploads to Supabase Storage: `/api/profile/upload` handles profile image/resume.

## End-to-end testing

- Signup with Google from `ui/signup.html`:
  - Browser returns with `#access_token=...` in URL
  - Token stored as `px_token`
  - `/api/profile/me` succeeds (profile ensured)
  - UI prompts for academic details; `PUT /api/profile/me` persists fields
- Sign-in with Google from `ui/login.html`:
  - Token stored, profile ensured, redirected to `ui/profile_edit.html`
- Email/password flows remain unchanged:
  - `POST /login` and `POST /signup` still work; `access_token` is returned on success
- Optional: After saving on `profile_edit.html`, you can navigate to `profile.html` to view a profile summary.

If `/api/profile/me` fails on first OAuth sign-in due to transient auth issues, refresh and retry; ensure the Supabase environment variables are set and the Google provider is enabled.

## Persistence

- Generated notes are saved under `notes/` as Markdown with an ID.
- SSE stream now includes `id` in the `final` event.
- REST:
  - `GET /notes` → list
  - `POST /notes { topic, markdown }` → create
  - `GET /notes/{id}` → fetch
  - `PUT /notes/{id} { markdown }` → update
  - `GET /notes/{id}/download` → download MD

## UI Editing

- Click `Edit` to switch to raw Markdown editor.
- Click `Save` to create/update the note. The last note ID persists across refresh.
- `Copy MD` and `Download MD` are available from the toolbar.

## Notes

- Images shown in the UI are external URLs; the Markdown file stores only text.
- If FastAPI imports are reported missing in the editor, ensure the Python env has `fastapi` installed.

## Cache-first generation

To avoid regenerating identical topics, the API first performs a fuzzy lookup in existing notes (titles, headings, filename slug, and a snippet of body) using RapidFuzz. If a close match is found (score ≥ 82), that note is returned instead of invoking the model.

- Response includes `cached: true|false`. When cached, `match_score` and `title` are included.
- Force regeneration with a `force` flag.

Examples (PowerShell):

```powershell
curl -X POST http://localhost:8000/api/notes/generate `
  -H "Content-Type: application/json" `
  -d '{"topic": "Support Vector Machine"}'

curl -X POST http://localhost:8000/api/notes/generate `
  -H "Content-Type: application/json" `
  -d '{"topic": "SVM", "force": true}'

curl "http://localhost:8000/api/notes/generate/stream?topic=SVM&force=true"
```

## Topic Progress Tracking

Mark topics as completed per user and see progress bars on the profile page.

- Schema: A new table `user_topic_progress` stores `(user_profile_id, topic_id)` and `completed_at`. Re-run `db.sql` on your database.
- APIs:
  - `GET /api/progress/topics` → returns `{ completed_topic_ids: string[] }` for the current user.
  - `POST /api/progress/toggle` with `{ topic_id: UUID, completed: true|false }` → saves status.
  - `GET /api/progress/summary` → per-course and per-unit counts.
- UI: In `ui/profile.html`, each topic has a checkbox. Toggling it updates the server and the unit/course progress bars in real time.
