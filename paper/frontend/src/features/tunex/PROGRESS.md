# tunex/topic rebuild — progress

Original: `ui/tunex/topic.html` (Alpine `topicApp()`, + `../config.js`, `../assets/js/theme.js`).
Preview route: `src/app/(site)/react-preview/tunex/topic/page.tsx` → `/react-preview/tunex/topic?id=<topic id>`.
Scratch (fixtures, actions): `$SCRATCH/tunex/`.

## Inventory

### Page shell
- [ ] `<title>Topic | Tunex</title>`; `<html class="dark">` default; theme from `px_theme` (theme.js `Theme.init/toggle`, also sets `light` class)
- [ ] Fonts: no Inter loaded → system sans; JetBrains Mono for `.code-output`, `code`, CodeMirror; remixicon 3.5.0 (`ri-*`, also used by data: `q.icon`, `mistake.icon`, `card.icon`, `block.icon`); Material Symbols Rounded (video overlay buttons)
- [ ] body bg `#1E1E2F` / light `#f8fafc`, color `#fff` / `#1e293b`; page `<style>` light overrides for `.text-white`, `.text-gray-*`, `.border-white/*`, `.opacity-50/80`, `bg-[#...]` arbitrary colours, `.bg-[#4C2A59]` header always white text, `code` inline styles, `.chapter-num`, `.quiz-opt*`, `.bg-grid`, `.custom-scrollbar`, `.yt-*`, `.skeleton`
- [ ] Dead classes (drop): `aspect-square`, `bg-[#4C2A59]/15`, `dark:bg-[#171722]/70`, `group-hover:rotate-y-12`, `hover:bg-[#9E4B8A]/90`, `perspective-1000`, `block-container`

### Header (fixed, h-16)
- [ ] Back button `goBack()`: `history.back()` if `history.length > 1` else `section.html` (→ `/tunex/section.html`)
- [ ] Tunex logo dark/light (`/assets/img/tunex/tunex-logo-{dark,light}.svg`, `.logo-dark` hidden in light, `.logo-light` hidden in `html.dark`)
- [ ] Topic title chip: `topicTitle || 'Loading...'`
- [ ] Theme toggle (`ri-moon-line` light / `ri-sun-line` dark)
- [ ] Regenerate button: `regenerating` → disabled, `opacity-60 cursor-not-allowed pointer-events-none`, spinner `ri-loader-4-line animate-spin`, text "Regenerating..." / "Regenerate"
- [ ] Playground link → `notebook.html` (`/tunex/notebook.html`)

### State (Alpine fields)
loading(true), regenerating, topicId, trackTitle, trackLanguage, topicTitle, topicDesc, chapters[], relatedVideosLanguage('English'),
currentChapter('ch1'), completedChapters(0), progressPercent(0), currentQuizIndex(0), selectedOption(null), quizAnswered,
score(0), quizCompleted, editors{}, outputs{}, errors{}, running{}

### Methods
- [ ] `init`: `?id=` param; none → `alert("No Topic ID provided. Please return to the section page.")`, loading=false (empty page, title "Loading...")
- [ ] `loadTopic(id)`: GET `/api/tunex/topics/{id}/full`; !ok → `err.detail || "Topic not found"` → `alert("Failed to load topic: …")`, loading=false. ok → trackTitle = track_title||level_title||section_title (trim), trackLanguage = inferCodingTrackKeyword(language_name || trackTitle), topicTitle=title, topicDesc=description||'', chapters; videos load (force) after 0ms; editors after 100ms; currentChapter = first chapter, updateProgress(first)
- [ ] `regenerateTopic`: no id → alert('No Topic ID found.'); confirm('Regenerate this topic content? This will overwrite existing chapters for this topic.'); POST `/api/tunex/topics/{id}/ai/ensure?force=true` (Content-Type json, no body); !ok → `detail || "Regeneration failed (status)"` → alert, loading=false; ok → reset loading=true, chapters/editors/outputs/errors/running/quiz state, then loadTopic
- [ ] `refreshRelatedVideos(force)` (select change + Refresh button)
- [ ] `initCodeMirrors` / `createEditor(id, code)`: CodeMirror 5 (python, material-darker, lineNumbers, autoCloseBrackets, matchBrackets, viewportMargin Infinity, cursorBlinkRate 530) for `code` blocks (`b.id !== undefined`), carousel items (`item.code_id`), legacy `content.editor_id` + `content.default_code` (only if an `editor-<id>` element exists)
- [ ] `runCode(id)`: POST `/api/tunex/compiler/run` `{code}`; running spinner; `status==='success'` → outputs[id]=output else errors[id]=error; throw → "Network Error"; output panel shown if output || error
- [ ] `numberToWord(n)` Zero..Ten else n
- [ ] `openProblem(id)` → `solver.html?id=` (`/tunex/solver.html?id=`), no-op without id
- [ ] Quiz: `selectQuizOption(idx, q)` (once), `nextQuiz` → next / completed; "Restart Topic" → `location.reload()`; quiz state is shared by all quiz chapters
- [ ] `refreshEditor(id)` 200ms after carousel slide change
- [ ] `scrollTo('ch'+n)` smooth + `setCurrent(n)`; `updateProgress(n)`: percent = round(n / chapters.length * 100), completed = n
- [ ] `x-intersect="setCurrent(ch.chapter_number)"` on every chapter section (threshold 0, viewport root, fires on enter)
- [ ] `parseMarkdown` = marked.parse (no highlight/math)
- [ ] `highlightPython(code)` regex chain → tokenizer returning React elements (quirks: `&quot;` char-class string regex, comment/number passes run on already-wrapped HTML)

### Layout
- [ ] Loading: content wrapper `x-show="!loading"` hides everything (the spinner div is nested inside it due to broken markup → never visible): header only
- [ ] Sidebar (`hidden xl:flex`, w-72): Completion %, `n/N Chapters`, progress bar; Table of Contents buttons (active styling, left marker)
- [ ] Main (`overflow-y-auto`, `bg-grid`): hero (`trackTitle || 'Learning Track'`, h1 title, desc)
- [ ] Related videos section (hidden until first load call): header, language select (English/Tamil/Hindi/Telugu/Malayalam), Refresh, skeleton ×3, carousel (cards: thumb, duration, hover overlay play/notes buttons → `link` / `video-notes.html?video=`), empty/error texts, summaries
  - GET `/api/youtube/search?query=<q>&num=8` (window.API_BASE), query = topic + ` in <track lang>` + ` <spoken>` if not English
  - GET `/api/youtube/channel-logo?channel_url=` when logo is default
- [ ] Chapters: header (chapter-num, "Chapter <Word>", title)
  - [ ] concept legacy (no blocks): markdown description, code card (title/snippet/output), mental model card
  - [ ] syntax: syntax_block, components grid, tips
  - [ ] mistakes: cards (icon, name, desc, Fix code)
  - [ ] interview (no layout): question cards (color icon, company, tag, q)
  - [ ] interview practice_list: numbered rows → openProblem; difficulty badge classes keyed on `q.company` (quirk)
  - [ ] interview company_grid: tiles + hover overlay (use_case, View Problem) → openProblem
  - [ ] interview company_cards: cards (`"question "` quote quirk) + tips (markdown `• tip`)
  - [ ] walkthrough: problem, steps (text, items, code editor, trace grid), takeaway
  - [ ] quiz: Mastery Check, progress, options A/B/C, explanation, Next/See Results, score, Restart Topic
  - [ ] sections (no blocks): Try Code editors
  - [ ] variations grid
  - [ ] blocks: text, code, split (image / code_static), callout (info/warning/success), carousel (slides, prev/next, dots, editor per slide), cards, static_code (highlight), syntax_breakdown, mental_model, warning_box, keyword_cards, range_forms, range_examples, section, pro_tip, use_cases, company_cards, interview_tips

### Storage / URL / keyboard
- `px_theme` (theme), `API_BASE` (config.js); URL `?id=`; no keyboard shortcuts besides CodeMirror's own editing keys.

## Status
- [ ] types/api
- [ ] shell + header + sidebar
- [ ] chapters/blocks
- [ ] CodeMirror editor + run
- [ ] related videos
- [ ] parity verification
