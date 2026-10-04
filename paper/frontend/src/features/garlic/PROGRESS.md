# GARLIC cockpit (`ui/garlic_academics.html` → preview `/react-preview/garlic_academics`) — progress

Legend: [ ] todo · [x] done · [~] partial

## Files (planned)
- `src/app/(site)/react-preview/garlic_academics/page.tsx` — metadata title "GARLIC Autonomous System - Paper X" + description
- `src/features/garlic/` — `types.ts`, `api.ts`, `lib/plan.ts` (pure helpers), `hooks/useGarlicPlan.ts`,
  `hooks/useExamCommandCenter.ts`, `components/*`, `garlic.module.css`

## Original facts that shape the port
- Prebuilt `assets/css/tailwind.css` only (inline `tailwind.config` is set but NO Play CDN script) → dead classes matter.
  `dead-classes.mjs` + a scratch checker for JS-built classes. Notable dead: `md:top-6 md:py-2.5 md:px-5 shadow-[…]` (navbar),
  `md:my-20 md:p-3 md:mt-10 h-[132px] md:p-4 md:p-5 md:text-lg md:text-xs md:text-2xl md:text-[11px] leading-[1.15]`,
  `animate-fadeUp animate-pulseDot`, `2xl:grid-cols-[…]`, `dark:from-brand-300/via/to` (h1 gradient), toggle knob
  `left-1 top-1 translate-x-0 dark:translate-x-6 dark:bg-brand-500`, `w-2.5 h-2.5` (pulse dot → invisible), `bg-green-500`,
  `text-green-500`, `rotate-90` (subject caret never rotates), `w-1.5` (unit dot invisible), `h-0.5`, `h-2.5` (daily bar 0 high),
  `z-[100] z-[90] top-20 w-[92%] w-[95%]`, `text-orange-600`, `bg-orange-50`, most green/yellow/blue ring/bg/text tints.
- Header markup bug: the mobile controls div sits inside the `hidden md:flex` desktop wrapper → mobile shows logo only (verify).
- `data-theme-toggle` buttons have no handler on this page (theme.js not loaded; config.js only applies the stored theme).
- The Graph/List switch is inside `hidden inline-flex` → hidden; list view unreachable (port it anyway, hidden).
- `--tw-ring-color` default (blue-500/50) shows on `ring-1` boxes whose colour class is dead (IF YOU STOP NOW card, info alerts).
- Light-mode heading colour: globals.css forces h1–h6 to #1e1e2f with high specificity; original headings use body
  neutral-900 or their own colour → use `!` colour utilities on headings.

## Inventory

### Shell
- [ ] PixelBlast WebGL background (fixed inset-0, pointer-events-none, opacity 60% in both themes, z 0): square variant,
      pixelSize 4, color #9E4B8A, patternScale 2, density 1, ripples (window pointerdown, speed .4, thickness .12,
      intensity 1.5), speed .5, edgeFade .25, transparent, random time offset; ResizeObserver; cleanup. Raw WebGL2 (no three.js dep)
- [ ] Content wrapper `relative z-10`; page bg `bg-hero-light dark:bg-hero-dark`, `min-h-screen`
- [ ] Custom GARLIC SVG cursor (40×40, hotspot 7 3) on page elements; pointer on links/buttons/toggles/topic links; text on inputs
- [ ] `.glass-panel`, `.agent-grid::before`, `.status-chip/.metric-chip`, `.pri-*`, `.st-*`, `.kpi-card::before`, `.metric-ring` → CSS module

### Navbar (floating pill, sticky top-4, z-50)
- [ ] Logo → /index.html (light/dark)
- [ ] md+: Home, Wishlist (favorite), History (history) links
- [ ] md+: theme switch (pill; knob never moves — dead classes) — functional in React (deliberate difference)
- [ ] md+: Regenerate button (autorenew) → regenerate flow
- [ ] md+: signed-out Log in / Sign up; signed-in avatar link (initials/img, title = name) + sign-out icon button (POST /logout → /login.html)
- [ ] Mobile controls (search, edit [hidden], theme, regenerate, dev [hidden]) — never visible in the original (nested in desktop-only div)

### Hero
- [ ] Kicker (bug_report 14px) "GARLIC AUTONOMOUS COMMAND MODE"; garlic-logo.png h-16 md:h-24; h1 "Your Garlic " gradient + "Operation<br>Center"; desc
- [ ] KPI: TOPICS DONE done/total + bar; COMPLETION conic ring + %; ACTIVE SUBJECTS; AVG CONFIDENCE toFixed(1) + bar
      (live /api/me syllabus + /api/progress/topics when ready, else plan summary; avg confidence from plan topics)
- [ ] Daily Execution Panel: "Estimated Time: --" / "Xh Ym"; empty "No focus actions yet."; rows: full-row link (new tab,
      notes page by course_type [item or matched subject], `?topic=`), status circle (done: check; else empty ring), title
      (line-through when done), timer `Nm`, `P{priority.toFixed(1)}`, status label; play button (group-hover); NO tracking on click
- [ ] Status line: hidden when empty; neutral vs error styles

### Exam Command Center (hidden unless exam mode active) / Activator banner (shown otherwise)
- [ ] Boot check at +1.5s: GET /api/garlic/v3/exam-mode/status → active && profile → show, status, refresh all, start loop
- [ ] Activate: date required (alert 'Please select your exam date.'); POST /v3/exam-mode/activate {exam_date};
      error alert 'Failed to activate exam mode: …'
- [ ] Exit: confirm('Exit Exam Mode? Your prediction data will be preserved.') → POST /v3/exam-mode/deactivate → hide + stop loop
- [ ] Header: dot, title, intensity badge (normal/exam/critical classes), countdown `N DAYS LEFT`
- [ ] Outcomes (GET /v3/outcomes/{sid}): predicted marks, completion ring/%, readiness + level label, risk level + colour, reasons (2, ' • ')
- [ ] If you stop now: marks `X/100 (−D)`, `→ NEXTRISK`, `+N days behind`
- [ ] Daily target (GET /v3/daily-target/{sid}): done / target, bar (0 high), message colour by on_track
- [ ] Recommendation text + AI reasoning (line-clamp-3)
- [ ] Mode card: name, description, time-impact sentence by days
- [ ] Next best action: snapshot of top-priority incomplete topic (`→ name` / 'All topics completed!'), button → alert when none,
      else trackTopicOpen + 20% micro-diagnostic (if active) + window.open(notes, '_blank')
- [ ] Velocity (GET /v3/velocity/{sid}): overall, last 7, pace message colour
- [ ] Insights (GET /v3/exam-insights/{sid}): max 6, severity styles/icons, `(~N marks)`, 'No active alerts.'
- [ ] Control loop every 180s: outcomes; %3 POST /v3/confidence-decay; %2 POST /v3/replan → topics_reranked>0 → intervention +
      reload plan; daily target; next action; risk high/critical intervention; %5 velocity + insights
- [ ] Micro-diagnostic modal: POST /v3/diagnostic/micro → topic/question/options (A, B, …); answer → disable all, mark selected,
      POST /v3/diagnostic/answer {session_id, question_id, answer} → result (score ≥ 60 ✓ Correct / ✗ Needs Review, score, explanation);
      close button / backdrop click
- [ ] Intervention alert: message, dismiss, auto-hide 12s, 3-min cooldown (same DOM position/classes → same placement quirk)

### Priority Surface / aside
- [ ] Priority Surface card (agent-grid) + hidden Graph/List switch
- [ ] Graph: empty "No topics available in this plan."; subject accordion (library_books, title, `N Units Built-in`, caret
      aria-expanded, no rotation); unit accordion (dot, title w/ completion strike, `N topics`, caret rotate-180); topics sorted by
      priority desc; topic row link (new tab) + trackTopicOpen; status icon; priority badge; status chip; 'No topics'
- [ ] List view (top 70, `#n • subject / unit`, reason, P/C/status chips) — unreachable, hidden switch
- [ ] AI Reasoning: insights bullets / 'No insights available yet.'
- [ ] Execution Status Board: Not Started / In Progress / Completed, count chip, top 4 by priority, 'No topics'

### Data / API (all `credentials: include` + original authHeaders())
- [ ] Bootstrap: status 'Loading GARLIC autonomous plan...'; ensureAuthReady; GET /api/me (throws detail / `HTTP n`) →
      ctx {student_id=auth_user_id, batch_id, semester, college}; missing id → 'Unable to resolve your account id. Please re-login.'
- [ ] Live metrics: GET /api/me then GET /api/progress/topics (401 → ensureAuthReady → retry once; 2 attempts; progress failure → [])
- [ ] GET /api/garlic/plan/{sid}; 404 → 'No saved plan found. Generating plan...' + POST /api/garlic/generate {student_id, batch_id, semester, college}
- [ ] Regenerate (no-op until ctx): 'Regenerating GARLIC plan...' → live metrics → POST /api/garlic/regenerate → 'Plan regenerated and stored.' / error
- [ ] trackTopicOpen: POST /api/garlic/study-plan/interaction {item_id|null, topic_id|null, event_type:'topic_click'} then
      PATCH /api/garlic/study-plan/items/{item_id} {status:'in_progress', last_accessed} (errors swallowed)
- No storage keys written; no URL params read; no redirects (except sign-out).

## Verification (state → diff %)
(fill in)

## Next step
- Fixtures + original screenshots, then types/api → lib → hooks → components → page.
