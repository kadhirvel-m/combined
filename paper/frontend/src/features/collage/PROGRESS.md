# collage/syllabus rebuild — progress

Original: `ui/collage/syllabus.html` (+ `ui/config.js`, `ui/collage/helpers.js`).
Preview route: `src/app/(site)/react-preview/collage/syllabus/page.tsx`
→ http://localhost:3000/react-preview/collage/syllabus?courseId=…
Scratch: `/private/tmp/claude-501/-Users-kadhirvel-m-Documents-combined-paper/3180b12b-93d6-4df4-bf8b-d39ef5979ffc/scratchpad/collage/`

## Page inventory

### Head / globals
- [ ] `<title>Paper X — Syllabus</title>`
- [ ] Only prebuilt `assets/css/tailwind.css` (the inline `tailwind.config = …` throws
      `ReferenceError: tailwind is not defined` — no Play CDN). Run dead-classes.
- [ ] Material Symbols Rounded weight 600 FILL 0; `.material-symbols-rounded { vertical-align:-6px }`
- [ ] Page `<style>`: `.gradient-hero-text` (animated gradient text, dark variant),
      `.hero-aurora::before/::after` blurred blobs, `#unitModalPanel` gradient bg + shadow +
      `::before/::after` glows, `#unitModalBackdrop` gradient bg, `.topic-suggestion-item[aria-selected]`
      bg, `.topic-suggest` scrollbar.
- [ ] Theme: `px_theme` localStorage, `.dark` on <html>; theme toggle buttons (icon dark_mode/light_mode)
- [ ] body: `min-h-screen font-sans antialiased text-neutral-900 dark:text-white bg-hero-light dark:bg-hero-dark`

### Header (page-specific, NOT the landing header)
- [ ] Logo light/dark → `../index.html`; desktop nav Home/About/Contact/Help + "Collages" pill (hub icon) → `clg_info.html`
- [ ] Desktop: Theme button, "Log in" (`../login.html`), "Sign up" (`../signup.html`) — always shown (no auth awareness)
- [ ] Mobile: theme icon button + menu toggle (menu/close icon), aria-expanded
- [ ] Mobile panel + backdrop (opacity/translate transition), close on backdrop, link click, Escape,
      viewport ≥768px; body `overflow-hidden` while open; focus first link on open
  → decision: SiteHeader vs local header (guide: shared SiteHeader is the exception that follows landing look)

### Hero section (`hero-aurora`)
- [ ] Two blurred decorative circles
- [ ] Breadcrumbs nav (empty until syllabus loads): Colleges / {collegeName||College} / {degreeName||Degree} /
      {departmentName||Department} / Subjects / {courseCode||Syllabus} — links carry query params
      (degrees.html?collegeId&collegeName, departments.html?…&degreeId&degreeName,
      batches.html?…&departmentName, subjects.html?…&batchRange); separator "/"
- [ ] Title `Subject syllabus` → after load `Subject syllabus <span opacity-70>· {courseCode}</span>`
- [ ] Subtitle `Loading syllabus…` → `{n} unit(s) defined.` (stays "Loading syllabus…" on error / missing ctx)
- [ ] Back link (arrow_back, "Back") → `subjects.html`; after load
      `subjects.html?collegeId&collegeName&degreeId&degreeName&departmentName&batchId&batchRange`
- [ ] Context panel (empty card until load) → chips: **courseCode**, courseTitle, `Semester N`, `Batch X`
      or "Subject context unavailable."
- [ ] "Add unit" button: disabled until syllabus loaded
- [ ] Results area:
  - loading: spinner (h-12 w-12 border-2 border-brand-500/30 border-t-transparent), min-height kept to
    previous height to avoid scroll jump; scroll position restored after reload (double rAF)
  - error card "Unable to load syllabus" + message (default "Please verify the course context and try again.")
  - empty card "No units yet" / "Add units for this subject to build its syllabus structure."
  - access denied (helpers.renderAccessDenied): block icon, "Access denied", message; hides Add unit + context panel
  - unit articles: title (`unit_title || 'Unit'`), edit button; topics list with check_small icon,
    per-topic buttons: Gen LabX / View LabX, blink_link, Gen Blink / View Blink; `No topics recorded.`

### Unit modal (add / edit)
- [ ] Title "Add a new unit" / "Edit unit"; close X, backdrop click, Cancel, Escape → close + reset
- [ ] Unit title input (required, maxlength 256), focus after 60ms
- [ ] Topic rows: drag handle (HTML5 DnD reorder with auto-scroll of modal panel near edges, row opacity-50
      while dragging, invisible drag image), input (maxlength 256, autocomplete off), "add below", "remove"
      (removing last row adds an empty one)
- [ ] "Add topic" buttons (top + bottom) append a row
- [ ] Topic autocomplete: debounce 150ms, GET `/api/notes/topics/search?q=…&limit=12` (abort previous),
      dropdown items (topic + "AI notes" + subdirectory_arrow_right), mousedown picks, ArrowUp/Down,
      Enter picks active (prevents submit), Escape hides, blur hides after 120ms, outside click hides;
      errors → console.error + hide
- [ ] Message line (red) for validation/API errors
- [ ] Delete button (edit mode only) — confirm "Delete this unit and all its topics? This action cannot be undone."
      → DELETE `/api/syllabus/units/{id}`; "Deleting…" spinner state disables cancel/submit
- [ ] Submit: "Missing course context." if no courseId; "Enter the unit title." (focus) if blank;
      topics = non-empty trimmed rows `{id?, topic}`; payload `{unit_title, topics}`
      edit → PUT `/api/syllabus/units/{id}`; add → POST `/api/syllabus/courses/{courseId}/units`
      "Saving…" spinner; success → close + reload syllabus; error → message (`[object Object]` → "Unexpected response.")
- [ ] body `overflow-hidden` while open (note: Escape handler only for unit modal + labx modal)

### Blink preview modal
- [ ] topic name, `<img>` of blink url, "Open in Tab" (target _blank), "Remove Blink"
      (confirm "Remove the blink image for this topic?") → POST `/api/blink/remove` `{topic}` → button back to Gen Blink,
      blink_link button url cleared, close; error alert
- [ ] close X / backdrop (no Escape, no body scroll lock)

### blink_link modal
- [ ] Title "blink_link", topic name, URL input (type=url, required), hint text variants:
      "Paste an image link to store in blink_link." / "Blink link exists. You can remove it and enter a new link." /
      "Blink removed. Enter a new image link."
- [ ] Save: empty → alert "Blink link cannot be empty."; POST `/api/blink/link` `{topic_id, topic, blink_link}`
      → row becomes View Blink with the url, close; "Saving..." spinner; error alert
- [ ] Remove (visible when url exists): confirm "Remove current blink link for this topic?" → POST `/api/blink/link`
      with `blink_link: ''` → row Gen Blink, input cleared, hint "Blink removed…", remove hidden; "Removing..." state
- [ ] close X / Cancel / backdrop; focus input on open

### LabX preview modal
- [ ] topic name, iframe (sandbox allow-scripts allow-same-origin) with html, Code/Preview toggle (textarea editor),
      "Apply Changes" (code mode only) → status "✅ Changes applied to preview" 3s
- [ ] Download → `{topic lower, spaces→-}-explorable.html` blob; status "✅ Downloaded!" 3s
- [ ] Open in Tab → blob URL window.open
- [ ] Regenerate → POST `/api/labx/generate` `{topic, force_regenerate:true}`; status "🔄 Regenerating..." →
      "✅ Regenerated successfully!" / "❌ {msg}", cleared after 5s; spinner state
- [ ] close X / backdrop / Escape; body `overflow-hidden`

### Topic actions (per row)
- [ ] Gen LabX → POST `/api/labx/generate` `{topic, force_regenerate:false}`; "Generating..." spinner; success
      (success && html) → View LabX (emerald); error → alert + restore
- [ ] View LabX → GET `/api/labx/get/{encodeURIComponent(topic)}`; "Loading..." spinner; opens LabX modal;
      error → alert (`error || detail || HTTP n`)
- [ ] Gen Blink → POST `/api/blink/generate` `{topic, topic_id}`; "Generating..."; success → View Blink with `url`;
      error → alert + restore
- [ ] View Blink → opens blink preview
- [ ] blink_link → opens blink_link modal (alert "Topic details are missing." if no id/name)

### Data loading
- [ ] On load: `requireAdminOrEmployee()` → no token sentinel (no `paperx_auth` cookie / `paperx_session_state`)
      → 401 → Access denied; GET `/api/admin/roles/me` → role not admin/employee → 403 → Access denied;
      other errors → error card with message
- [ ] GET `/api/syllabus/courses/{courseId}` (missing courseId → error "Missing courseId.");
      `data.detail === 'Course not found'` / null → "Syllabus course not found."
- [ ] Then (also after errors!) `renderUnits(units)`: empty → "No units yet" (overwrites the error card — quirk);
      else parallel GET `/api/blink/links?topics_json=[normalized unique]` (`{links}`) and
      GET `/api/labx/check-batch?topics_json=…` (`{cached}`); keys normalized (trim/lower/collapse spaces)
- [ ] Error message format = helpers.fetchJson: `detail || message || JSON.stringify(body)` stringified
      (array detail → "[object Object]")

### Context / URL (helpers.js)
- [ ] `parseQuery()`: merge all query params into sessionStorage `collage_ctx_v1` (JSON object), then
      `history.replaceState` to pathname+hash (whole query removed)
- [ ] Params read: courseId, courseCode, courseTitle, semester, batchRange, batchId, collegeName, degreeName,
      departmentName, collegeId, degreeId (decodeURIComponent applied again)
- [ ] Anchor sanitizer only acts on URLs containing `/ui/collage/` (never true under Next/5500 → links keep queries)
- [ ] Port to `src/features/collage/lib/` (context read/write/merge, parseQuery+scrub, navigate, fetchJson
      error semantics, formatYearRange, requireRoles/getAnyToken equivalents)

## Status
- [ ] lib/context.ts, lib/http.ts, lib/access.ts
- [ ] types.ts, api.ts
- [ ] preview route page.tsx
- [ ] components
- [ ] parity runs (light/dark, desktop/mobile, missing ctx, loading, empty, error, denied, loaded, modals)
- [ ] tsc / eslint / console

## Next step
Study shared components/lib, then build lib + types + api.
