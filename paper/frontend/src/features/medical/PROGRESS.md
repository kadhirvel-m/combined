# features/medical — progress

Pages: `ui/medical_notes.html` → `/medical_notes.html`, `ui/mediX/notes_chat.html` → `/mediX/notes_chat.html`.
Built on `features/notes` (`NotesProvider` + controller, `VariantSwitcher`, `NotesOutput` pieces, `SelectionAssistant`,
`FeedbackModal`, `RippleButton`/`Sym`, notes.module.css). One preset (`preset.tsx`) + `MedicalPageConfig` per page.

## Diff: medical_notes vs notes_generator
- Header: Feedback, admin-only **Regenerate** (adminRegenBtn), Theme. No Share/MCQ/Density/verify chip/approve.
- No sidebar input card / degree select / progress / TOC / images card (a permanently `hidden` "Related Images" section).
- Grid: output section first in DOM (`order-first lg:order-last`), aside `order-last lg:order-first`.
- Sidebar = sticky "Study Tools" panel (8 tool buttons; mobile = horizontal scroll row).
- Related videos inside a closed `<details>` (chevron, summary text + language select only when open, no Refresh);
  fresh results, recommended lookup serial; card mobile width 85vw; no thumb/logo fallback chains.
- Output toolbar: variant switch, Save, My note, Edit (hidden sm:inline-flex, admin/employee), Download (admin), Fullscreen. No Emphasis button (emphasis class still read from storage).
- Roles: admin/employee only, token required (`px-privilege-hidden`).
- Login gate: `px_token` / `px_refresh_token` only; auth token = raw localStorage keys.
- No access/plan limits, no topics-left toast, DB check non-definitive → stop.
- Load: `loadLastNote` (when no `?topic`) + 100 ms later click "Detailed": URL topic → resolve → 404 → generate(force);
  else last id → GET; else resolve by h1. URL is not cleaned. Variant switch uses the same handler.
- Generation: same SSE as notes_generator + `/api/notes/allowed-domains` → `allowed_urls`.
- Every study tool replaces `#output` content with its own UI and "Back to Notes" restores the notes.

## Diff: notes_chat vs medical_notes
- Paths `../` (logo, config, login redirect `../login.html?next=`, feedback inbox, flashcards, youtube-notes).
- MCQ question/answers built with textContent (not HTML).
- Mermaid disabled.
- RAG pipeline in `startGeneration`: in-flight guard (duplicate key ignored / "A generation is already running. Please wait."),
  `POST /api/medix/rag/chat` (30 s cache per variant+topic) before every generation, `rag_citations` (≤12 compact chunks) +
  `rag_system_prompt` stream params, `access_token` via `ensureStreamAccessToken` (token → `paperx_bearer_fallback` → `POST /refresh`),
  `## RAG CITATIONS` section (≤8) + `<!-- PAPERX_RAG_META … -->` appended to the final markdown, citation buttons open a
  "Citation chunk" modal, stream error → `POST /api/notes/generate` HTTP fallback, snapshot persisted after final
  (`PUT /notes/{id}` or `POST /notes`), working section never added.
- Load: only `?topic=` auto-starts (`startGeneration(topic, false)` after 120 ms); no variant click on load.

## Checklist (both pages unless noted)
- [ ] routes + titles ("PaperX — Notes Generator (Material Style)")
- [ ] login gate (token), analytics, marker overlay
- [ ] header (Feedback, admin Regenerate → `startGeneration(urlTopic||h1, true)`, Theme)
- [ ] related videos `<details>` (language select, skeleton/list/empty, summary text)
- [ ] output card (variant switch, Save/My note/Edit/Download/Fullscreen, loader, editor, fs controls)
- [ ] study tools panel (8 buttons, loading states, active toggle = back)
- [ ] ClinQ inline MCQ (`POST /notes/{id}/mcq` count 10; loading, error+back, quiz, prev/next, explanation, results, retake, shuffle)
- [ ] Match the Following (`POST /api/notes/match-following`; terms/defs, submit, show answers, reset, score)
- [ ] CaseFlow (`POST /api/notes/caseflow`, `POST /api/notes/caseflow/evaluate`; chat, Ctrl+Enter)
- [ ] Viva (`POST /api/notes/viva/respond`; first turn on open; chat)
- [ ] Decision tree mind map (`POST /api/notes/clinical-decision-tree` [+force]; pan/zoom/wheel, expand/collapse, regenerate)
- [ ] Echo (no-op button, like the original)
- [ ] MedMap (`GET /api/notes/ppt-link`; embed url builder; iframe + Open link)
- [ ] Blink (`GET /api/blink/links?topics_json=`; image, label Loading…/Back)
- [ ] selection assistant, feedback modal (inbox link admin only)
- [ ] page-load flows (medical: restore + variant click; chat: `?topic` only)
- [ ] notes_chat RAG generation engine + citation modal + HTTP fallback + snapshot
- [ ] storage keys: paperx:lastVariant, paperx:lastNoteId[:variant], paperx:emphasis, paperx:degree, removes paperx:lastVideos/lastTopic/lastVideoLanguage
- [ ] verification (light/dark, desktop/mobile, tools, errors), tsc, eslint

## Notes / next step
- Start: types/api → config/preset → layout shell → tools.
