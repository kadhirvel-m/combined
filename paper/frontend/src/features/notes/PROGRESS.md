# features/notes — PROGRESS (remove when all four pages are complete + verified)

Pages: `notes_generator.html` (NG), `physics_notes.html` (PH), `maths_notes.html` (MA), `img_gen.html` (IG).
Routes: `src/app/(site)/{notes_generator,physics_notes,maths_notes,img_gen}/page.tsx`.
Order: NG complete + verified → PH → MA → IG.

Status legend: [ ] todo, [~] half-done (see note), [x] done, [v] verified with compare-page.

## Ground rules discovered while reading the originals

- Originals load the PREBUILT `assets/css/tailwind.css`; the inline `tailwind.config` is a no-op
  (`window.tailwind` is undefined). So `shadow-glow` is the BLUE glow, `shadow-neon` the blue neon,
  and these classes have NO effect in the originals (absent from the prebuilt CSS) and must NOT be
  written in React (Tailwind JIT would generate them): `animate-in`, `animate-pulsebar`,
  `bg-[var(--chip)]/60`, `bg-[var(--surface)]/90`, `bg-black/85`, `bg-white/96`, `border-white/25`,
  `dark:bg-black/15`, `dark:bg-brand-900/96`, `max-w-[min(720px,90vw)]`, `p-2.5`,
  `shadow-[0_10px_26px_rgba(15,23,42,0.45)]`, `shadow-[0_36px_96px_rgba(0,0,0,0.52)]`, `sm:text-2xl`,
  `text-ellipsis`, `w-[min(420px,90vw)]`; added from JS and also dead: `md:px-48`,
  `shadow-[0_0_0_1px_rgba(158,75,138,0.4)]`. No `@keyframes shimmer` exists → `.skeleton` is a static gradient.
- CSS order traps: page `<style>` `.ripple{position:relative}` beats `.fixed` (the maths AI FAB is NOT fixed);
  `.relative` beats `.fixed` in the prebuilt CSS (JS "fullscreen" classes on `#outputWrap` do not make it fixed;
  only native `requestFullscreen` does); `sm:p-6` beats `px-8 pt-16 pb-8`; `.hidden` beats `flex/inline-flex/grid/block`.
- Icons: originals load Material Symbols Rounded at wght 400 with baseline alignment, plus Material Symbols
  Outlined (refresh, auto_awesome, translate, edit, robot_2, close, compress, unfold_more, lightbulb, undo).
- Page CSS variables (`--surface`, `--surface-dim`, `--surface-contrast`, `--outline`, `--muted`,
  `--brand`, `--brand-strong`, `--brand-soft`, `--chip`, `--kbd`) switch on `[data-theme="dark"]`
  → CSS module root class + `:global(.dark)`.
- `.glass` comes from the page `<style>` (rgba(255,255,255,.65) / dark rgba(15,18,38,.55)), not the
  global `.glass` in globals.css → module class.
- There is no `#flashcardBtn`, `#copyBtn`, `.chip` element on any of the 4 pages: that code is inert.
- Streaming is SSE (`EventSource`) on `GET …/generate/stream`; React uses `apiRaw` + reader + SSE parser.

## Differences between the four pages (→ config / slots)

| Aspect | NG | PH | MA | IG |
|---|---|---|---|---|
| `<title>` | PaperX — Notes Generator (Material Style) | same as NG | PaperX — Maths Notes Generator (Material Style) | PaperX — Notes Generator (Material Style) |
| Stream endpoint | `/generate/stream` | `/api/physics-notes/generate/stream` | `/api/maths-notes/generate/stream` | `/generate/stream` |
| Login gate (redirect `login.html?next=`) | px_token / px_refresh_token / paperx_session_state / paperx_bearer_fallback / cookie | same | px_token / px_refresh_token only | same as MA |
| Header nav links | – | – | Marketplace, Upload Note (sm+) | – |
| Header Share button + Share modal | yes | yes | no | no |
| Header Density button | no | no | yes (sm+) | yes (sm+) |
| Header Verified-by chip + Approve (verify) button | yes (teacher/HOD) | yes | no | no |
| Generate button | icon `auto_awesome` (aria/title "Generate notes") | same | text "Generate" | text "Generate" |
| Variants | detailed, cheatsheet | same | detailed, cheatsheet, simple | detailed, cheatsheet |
| Edit toggle classes | `px-privilege-hidden inline-flex` | same | `hidden sm:inline-flex` | `px-privilege-hidden inline-flex` |
| Role gating | staff (admin/employee/teacher/moderator/hod/perms); edit+emphasis hidden for teacher/HOD, verify shown for teacher/HOD; bearer→cookie retry | same | admin/employee only; gated: regen, regenMobile, edit, download, gemini Edit, inbox link; emphasis NOT gated; needs token | staff set like NG but single group (regen, regenMobile, edit, download, gemini Edit, inbox); emphasis NOT gated; bearer→cookie retry |
| Access control (`/api/access/check-and-consume`, `/api/access/summary`, topic toast, limit-reached panel, daily `paperx:consumedTopicOpen:v3:<date>`) | yes | yes | no | no |
| DB check non-definitive (not 200/404) | snack "DB check skipped. Generating notes..." and generate | same | snack "Unable to confirm in DB. Try again." and stop | same as MA |
| Auth headers on degrees / allowed-domains / by-title / youtube search / fetchJsonWithTimeout | yes (Bearer + credentials) | yes | no | no |
| `getAuthToken` | normalized + fallback + cookie sentinel | same | same | raw localStorage keys only (no fallback / sentinel) |
| Related videos | fresh each load (cache keys removed on load), thumb fallback chain, logo fallback chain, parallel recommended lookup w/ 1.5s race | same | localStorage cache (`paperx:lastVideos`, `paperx:lastTopic`, `paperx:lastVideoLanguage`), restores topic + videos on load, sequential recommended lookup, "Showing saved videos" fallback | disabled (section always hidden, cache keys removed) |
| Left column extra card | – | – | – | "Images Generating" card (`/api/blink/selected-images` GET/POST) |
| TOC ("Contents") card | sticky, sm+ | same | same | hidden |
| Markdown pre-processing | plain | plain | math block normalisation, matrix row fix, `\\` preservation, blockquote-with-math unwrap + blockquote re-render | plain |
| Practice problems | – | – | items under "Practice Problem…" H2 open `maths_notes.html?solve=<q>` in new tab | – |
| URL params | `topic`, `q` (auto-start w/ retries, replaceState) | same | `topic` (auto-start once), `solve` (POST `/api/maths-notes/solve`) | `topic` |
| Download | server PDF: `GET /notes/{id}/pdf` or `POST /pdf {title, markdown}` | same | client `html2pdf.js` of #output with citations stripped | server PDF like NG |
| Fullscreen | overlay classes `px-8 md:px-48 pt-16 pb-8` + native `requestFullscreen`, `fullscreenchange` sync, fs Theme + Exit buttons | same | overlay `p-6` only, Exit + Home (→ index.html) buttons, no native fullscreen | like NG |
| Selection FAB action | opens "TuneAI Inline" panel | same | same | generates an image (`POST /api/blink/generate-selected`, 504 retry, 429 backoff retry, DB fallback save), label "Generate image" |
| Gemini selection payload max | 2800 | 2800 | 2800 | 800 |
| Floating AI assistant FAB + "Tune AI" panel (`/api/notes/transform` summarize/expand/simplify/custom, revert) | no | no | yes | no |
| Lottie loader `ensureLottie()` on show | yes | yes | yes | not called (element still present) |
| GARLIC V3 session auto-close (`/api/garlic/v3/session/auto-close`, sendBeacon) | yes | no | no | no |
| `unhandledrejection` guard for `createElementNS` | no | no | no | yes |
| `storedTopic` in loadLastNote topic derivation | (undefined ref, swallowed) | same | yes (`paperx:lastTopic`) | no |

## Feature inventory (all pages unless tagged)

### Shell
- [ ] Body: `bg-[var(--surface-dim)] text-[var(--surface-contrast)] min-h-screen font-sans overflow-x-hidden`, fixed bg layer.
- [ ] Login gate → `location.replace('login.html?next=' + encodeURIComponent(pathname + search))`.
- [ ] `useAnalytics()` (analytics-tracker.js), `<MarkerOverlay />` (marker_overlay.js).
- [ ] Ripple effect on `.ripple` buttons (document click capture).
- [ ] Snackbar (`#snack`, bottom centre, 1500 ms, page-specific look).

### Top app bar
- [ ] Logo → index.html (h-8, light/dark).
- [ ] [MA] nav links Marketplace (`./notes_marketplace.html`), Upload Note (`./upload_note.html`).
- [ ] Feedback button → Feedback modal.
- [ ] [NG,PH] Share button → Share modal.
- [ ] MCQ button (hidden until a note id exists; `paperx:lastMCQSeed` sessionStorage; → `./mcq.html?noteId&topic` after 120 ms, label "Opening…"); [NG,PH] plan gate `mcq_access` + access check `mcq_attempt` (consume false).
- [ ] [MA,IG] Density button (toggles body `!text-[0.95rem]` and `!py-2`/`!py-3` on inputs/buttons/textareas).
- [ ] Theme button: icon shows the action (`light_mode` in dark), text "Light"/"Dark" after init ("Theme" only in markup), sm+.
- [ ] [NG,PH] Verified-by chip, Approve button (`POST /api/notes/verify {note_id}|{title}`; labels Approve/Verifying.../Verified; meta "Verified • name • variant").

### Related videos (NG, PH, MA; IG disabled)
- [ ] Section visible on load with 3 skeletons; summary text states; language select (English/Tamil/Hindi/Telugu/Malayalam); Refresh.
- [ ] `GET /api/youtube/search?query=&num=8` (abortable), query = topic [+ " in <lang>"].
- [ ] Recommended video: `GET /api/syllabus/topics/by-title?topic=` → first with `video_url`; `POST /api/transcripts/meta {url}`; YouTube oEmbed fallback; badge "★ Recommended", glow.
- [ ] Card: thumb (+fallback chain NG/PH), duration badge, title (2 lines), channel logo (`GET /api/youtube/channel-logo?channel_url=` when default; cache), channel name (10-char truncation ≤640px), views, hover overlay Play (window.open link) / Notes (`./youtube-notes.html?video=`).
- [ ] Topic input debounce 600 ms → load videos; empty → empty state.
- [ ] [MA] localStorage cache + restore.

### Left column
- [ ] Input card (sm+): Topic label/input (disabled when busy), Generate, Regenerate (mobile, privileged), degree row (always hidden; select + custom input still wired: `GET /api/notes/degrees`, `paperx:degree`), Regenerate (privileged), Cancel, domains hint (`GET /api/notes/allowed-domains?degree=`, debounce 250 ms; SSE `start` event updates).
- [ ] Degree auto-resolve: `GET /api/me` (Bearer) → `profile.department.id` → `GET /api/public/academic-meta` → degree name → `paperx:degree`.
- [ ] Stepper (Start/Search/Parse/Generate/Done) + progress bar with stage map.
- [ ] Related images card (section is `hidden` in all four; gallery state still maintained: skeletons, ≤9 unique images).
- [ ] [IG] Images Generating card.
- [ ] Contents (TOC) card: sticky top-24, sm+; built from h1–h3 with slug ids; meta line (hidden element) states.

### Right column
- [ ] Toolbar: "Final Output", variant switcher (active: bg-brand-600 text-white shadow-neon; aria-selected), Save (edit mode), My note, Edit/Preview (privileged), Download (privileged, sm+), Emphasis (sm+; NG/PH privileged & not teacher; label "Emphasis On"; `paperx:emphasis`), Fullscreen/Exit (sm+). Mobile (≤640px): emphasis/fullscreen/fs controls forced hidden.
- [ ] Variant switch: store `paperx:lastVariant`; if topic present → Generate; else load `paperx:lastNoteId:<variant>` via `GET /notes/{id}?variant=` (retry ×3, 8 s timeout); 404 → `GET /api/notes/resolve?title=&variant=`; definitive missing → auto generate; snacks for non-definitive.
- [ ] Output: Markdown (marked gfm+breaks, DOMPurify), mermaid code blocks, highlight.js, KaTeX ($$, $, \(\), \[\]; ignore pre/code), citation pills (favicons) + CITATIONS one-line list, links target=_blank, selection colour, prose tweaks, `loading` min-height 360 px, centred Lottie loader.
- [ ] Editor textarea (edit mode), Save: `POST /notes?variant= {topic, markdown, image_urls}` or `PUT /notes/{id}?variant= {markdown, image_urls}`.
- [ ] My note: `GET /api/notes/edited/check?title=&variant=` (visibility), `GET /api/notes/edited?title=&variant=` (load), `POST /api/notes/edited?variant= {title, markdown}` (inline edit persist).
- [ ] Download (see table).
- [ ] Fullscreen (see table) + Esc.
- [ ] [NG,PH] limit-reached panel in output.

### Generation
- [ ] `startGeneration(topic, force)`: alert "Enter a topic"; load videos; [NG,PH] `topic_open` access (once per topic per day); DB-first `GET /api/notes/resolve` (retry); [NG,PH] `ai_prompt` access; course type (`GET /api/syllabus/topics/by-title`), SSE stream with params `topic, force, variant, degree, course_type, access_token`; events `start, search_results, fetch_start, fetch_done, fetch_error, merged_titles, context_ready, llm_start, llm_done, images, error, final`; practical "## Working" section injection; store note ids (`paperx:lastNoteId:<variant>`, `paperx:lastNoteId`); meta text; Cancel.
- [ ] Load last note on open (`GET /notes/{id}?variant=`) when no `?topic`.
- [ ] Auto-start from `?topic` / `?q` (NG,PH retries at 0/250 ms/load) + `history.replaceState` + scroll to output.
- [ ] [MA] `?solve=`.
- [ ] `note_viewed` analytics on render (>50 chars: `{variant, word_count}`) and after inline Gemini answer (`{variant:'generated', prompt}`).

### Inline selection helper
- [ ] Selection FAB positioned at selection end; hides on scroll/resize.
- [ ] Panel "TuneAI Inline": context preview (420 chars), prompt (default "Explain it simply", ⌘/Ctrl+Enter), Ask Tune (`POST /api/notes/snippet-assist {selection, instruction}`), Meaning, Edit (privileged; section slice + selection mapping → `POST /api/notes/transform {mode:'custom', markdown, prompt}` → merge → persist My note), status, markdown output; Esc / outside click closes.
- [ ] [IG] image generation flow + job cards.

### Modals
- [ ] [NG,PH] Share modal: topic + 240-char preview, Copy Link (`?topic=` on current URL; clipboard w/ execCommand fallback), status, Esc/backdrop close, body scroll lock.
- [ ] Feedback modal: category, rating 1–5, quick tags (toggle), templates (append), message, Use selected text (≤1200 chars, preview 120), auth hint, `POST /api/notes/feedback` payload (category, message, quick_tags, rating, note_id, note_variant, note_title, topic, page_path, page_url, selected_text, meta{tz, lang, screen}), hides sticky header while open, Open Inbox link (privileged → `./admin/notes_feedback.html`), Esc/backdrop close, closes on success + snack.

### Other
- [ ] [MA] AI assistant FAB + panel.
- [ ] [NG] GARLIC session auto-close.
- [ ] [IG] unhandledrejection guard.
- [ ] README.md documenting the public API.

## Files (planned)
- `types.ts`, `config.ts` (config type + defaults), `api.ts`, `lib/*` (auth token, sse, citations, markdown prep, slug, selection mapping)
- `hooks/*` (useNotesController, useRelatedVideos, useDegree, useRoles, useAccess, useSelection, useGarlicSession…)
- `components/*` (NotesWorkspace, TopBar, RelatedVideos, InputCard, TocCard, OutputCard, NotesOutput, SelectionAssistant, ShareModal, FeedbackModal, AiAssistant, SelectionImagesCard, Snackbar, Ripple…)
- `presets/*` (one client component per page) + `notes.module.css`

## Log
- (run 2) Inventory + diff done, PROGRESS.md written. Next: page.tsx stubs → types/config/api → shell.
- (run 3) Written: types.ts, config.ts (defineNotesConfig), lib/authToken.ts, lib/sse.ts, lib/markdown.ts
  (hard breaks, working section, maths prep), lib/outputDom.ts (citations, links, TOC ids, mermaid via CDN ESM,
  maths decorators). Next: lib/selectionMapping.ts, lib/storage.ts, api.ts, notes.module.css, primitives,
  controller hook, components, presets, page.tsx.
- (run 3) All core files written: api.ts, lib/*, hooks/* (controller, roles, access, degree, videos, garlic),
  components/* (NotesWorkspace/Layout, TopBar, RelatedVideos, Sidebar, Output, Dialogs, SelectionAssistant),
  presets/notesGenerator.tsx + physicsNotes.tsx, app/(site)/notes_generator/page.tsx. tsc + eslint clean.
  NG empty state verified (0.07% diff = dev indicator). Icons are 24px in originals (Google CSS beats text-*).
  Next: NG finished-notes state with mocks (ng-mocks.json in scratchpad), modals, dark/mobile; then PH/MA/IG.
- (run 3) NG verified (light/dark/mobile/mobile-dark; empty, notes via ?topic + resolve, notes via lastNoteId,
  SSE stream generation, Share, Feedback, inline panel + answer, emphasis, edit, fullscreen) ≈0–0.3% diff
  (dev indicator / scroll-timing only). PH page added + verified. MA preset/page + AiAssistant written; MA notes
  state verified 0.06%. Dev server went down mid-run (not ours) → MA AI panel / fullscreen / density / ?solve
  compares pending. Next: IG preset (SelectionImagesCard + image FAB action), README.md.
