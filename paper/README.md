# PaperX Notes Generator

Quick notes on running the API + UI and the new persistence/editing features.

## Run

- Install deps from `requirements.txt`.
- Create an `.env` with `SERPAPI_API_KEY` and relevant model keys.
- Start the API server:

```powershell
$env:PYTHONPATH = (Get-Location).Path
uvicorn notes_api:app --host 0.0.0.0 --port 8000 --reload
```

Open the UI at `http://localhost:8000/ui/notes_generator.html`.

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