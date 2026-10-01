# Rebuilding a legacy page as React

Pages listed in `scripts/convert-ui/migrated.json` are rebuilt as idiomatic
React in `src/app/(site)/`. Every other page is still served by the faithful
legacy port (`src/app/<route>/page.tsx` + `public/_legacy/`). This guide is the
contract for a rebuilt page.

## The bar

- **Looks the same.** Same layout, spacing, typography, colours, light and dark
  mode, desktop and mobile, as the original `ui/<page>.html`.
- **Does the same.** Every feature, button, modal, menu, keyboard shortcut,
  empty/loading/error state, API call (same endpoints, methods, payloads, query
  params), `localStorage`/`sessionStorage` key, URL query param and redirect
  that the original has. Read the original page's scripts completely before
  writing code; nothing may be dropped.
- **Is real React.** Components, props, state, hooks, effects with cleanup,
  typed data. No `<script>` tags, no HTML strings injected with
  `dangerouslySetInnerHTML` (the `Markdown` component is the one exception),
  no `document.getElementById`/`querySelector` DOM manipulation, no `window.*`
  functions for inline handlers. Refs are fine for canvas, media, scroll and
  third-party widgets.

## Where things go

```
src/app/(site)/<route>/page.tsx     server component: `metadata` (same <title>) + renders the feature
src/features/<feature>/             everything specific to the page family
  components/*.tsx                  "use client" only where there is state/effects/handlers
  hooks/*.ts                        data loading, polling, streaming, local persistence
  api.ts                            typed wrappers around `api`/`apiFetch` for the endpoints used
  types.ts                          response/request shapes
  *.module.css                      page-specific CSS that Tailwind can't express
```

The route folder must match the original path: `ui/collage/syllabus.html` →
`src/app/(site)/collage/syllabus/page.tsx`; `ui/index.html` →
`src/app/(site)/page.tsx`. The `.html` URL keeps working through the rewrite in
`next.config.ts`. Do not add routes that the original didn't have.

## Shared building blocks (use them; don't re-create them)

- `@/components/ui`: `Button`, `ButtonLink`, `Icon` (Material Symbols Rounded),
  `Card`/`CardHeader`, `Badge`, `Field`/`Input`/`Textarea`/`Select`/`Checkbox`/
  `Switch`, `Modal`, `useToast` (snackbar), `Tabs`, `Dropdown`, `Avatar`,
  `Skeleton`, `EmptyState`, `ProgressBar`, `LoadingOverlay`, `Container`,
  `SectionHeading`, `Spinner`, `cn` (from `@/lib/cn`).
- `@/components/site`: `SiteHeader` (sticky navbar, Projects mega menu, theme
  toggle, auth avatar/sign-out, mobile drawer; props for custom links/actions),
  `SiteFooter`, `AnnouncementBar`, `ThemeToggle`, `AppLink`.
- `@/components/content`: `Markdown` (marked + DOMPurify + KaTeX + highlight.js),
  `Lottie` (replaces `<dotlottie-wc>`), `Turnstile` (Cloudflare widget with the
  backend-provided site key, same flow as the original login/signup).
- `@/components/content/MarkerOverlay`: the draw-on-page marker (port of
  `assets/js/marker_overlay.js`). Render `<MarkerOverlay />` on pages that
  loaded that script.
- `@/lib/analytics`: `useAnalytics()` (call once in the page's top client
  component on pages that loaded `assets/js/analytics-tracker.js`) and
  `getAnalytics().track(event, data)` / `.feedback(...)` (was `window.Analytics`).
- `@/lib/api`: `api.get/post/put/patch/delete/upload`, `apiFetch`, `apiRaw`
  (raw Response, for streaming), `apiUrl`, `apiBase`, `ApiError`. Cookies,
  CSRF and token refresh are handled for you (same runtime as legacy pages).
- `@/lib/session`: `useSession()` → `{ status, kind, profile, displayName,
  initials, avatarUrl, profileHref, updateProfile, reload, signOut }`, plus
  `detectSession()`/`clearAuthMarkers()` for auth flows.
- `@/lib/theme`: `useTheme()` → `{ theme, setTheme, toggleTheme }` (shares
  `localStorage.px_theme` with legacy pages).
- Redirects (`location.href = "login.html"` in the original): `hardNavigate("/login.html")`
  from `@/lib/routes` (full page load, works for React and legacy targets).
- Links: always `AppLink`/`ButtonLink` with absolute `.html` paths
  (`/profile.html`, `/tunex/index.html`). It uses client-side navigation only
  when the target is a React page.

If a page family needs a reusable piece that doesn't exist, build it inside
`src/features/<feature>/components/`. Do not edit files outside your assigned
folders; describe shared-component changes you'd want in your report instead.

## Styling

- Tailwind v3 with the Paper X tokens in `tailwind.config.ts` (brand/brandlt
  palettes, `ink`, `plum`, `orchid`, `magenta`, `edge`, `stoneTint`, `night`,
  `bg-hero-light`/`bg-hero-dark`). The original classes mostly carry over as-is.
- Watch the per-page differences. Pages that loaded the Tailwind Play CDN had
  their own inline `tailwind.config`; those values win over the prebuilt CSS.
  Examples: `shadow-glow` is blue in the prebuilt CSS but magenta
  (`shadow-glow-magenta`) on CDN pages, and `shadow-soft`/`shadow-card` have
  `-lg` variants. Use arbitrary values (`bg-[#0f0f13]`) or a CSS module for
  anything page-specific.
- **Dead classes.** Pages that use only the prebuilt `assets/css/tailwind.css`
  (no Play CDN) get styles only for classes that stylesheet happens to contain.
  It was built long ago from a subset of pages, so many classes in the markup
  do nothing in the original: arbitrary values like `shadow-[…]`,
  `bg-[radial-gradient(…)]`, `lg:grid-cols-[…]`, newer utilities, and typos
  like `dark:text:white/70`. Our Tailwind build would start applying them and
  change the look. Run `node scripts/parity/dead-classes.mjs <page.html>` first
  and leave those classes out: match what the original actually renders, not
  what its class list suggests. The shared `SiteHeader`/`SiteFooter` are the one
  exception; they follow the landing page's (fully styled) rendering on every
  page.
- `bg-hero-light` is the prebuilt stylesheet's pinker gradient; the landing
  page's whiter CDN variant is `bg-hero-light-soft`.
- Page `<style>` blocks become CSS Modules or Tailwind classes. Global selectors
  are not allowed, except `:global(.dark)` inside a module.
- `cn()` uses tailwind-merge: a later font-size class (`text-4xl`) removes an
  earlier `leading-*`, so don't re-pass a size the base class already has.
- Material Symbols: `<Icon name="…" />` (renders `.px-icon`/`.px-icon-outlined`;
  never use raw `material-symbols-*` classes, whose Google CSS would override
  your utilities). The icon font loads at weights 300–700
  with FILL 0–1; use the `filled`/`weight` props or a class.

## Verifying

- The dev server is already running at `http://localhost:3200`. Don't start
  another one or run `next build`. The original UI is at
  `http://127.0.0.1:5500/<file>`.
- `node scripts/parity/compare-page.mjs --orig <file> --next <path>` screenshots
  both. Flags: `--dark`, `--mobile`, `--full`, `--mock fixtures.json`,
  `--storage '{…}'`, `--cookies '{"paperx_auth":"1"}'` (signed-in state), `--actions script.mjs`. Look at `side-by-side.png` and
  `diff.png` with the Read tool and iterate until they match. Mock the backend
  with the same fixtures on both sides to compare signed-in and data states.
  Build fixtures from the response shapes the original code reads, or from
  `../main.py`.
- Never sign in, create accounts or enter credentials on real services. Use
  mocks for authenticated states.
- Type-check: `npx tsc --noEmit --incremental false 2>&1 | grep -E "src/(features/<feature>|app/\(site\)/<route>)"`.
  Other agents' in-progress files may have errors; only yours must be clean.
- Lint: `npx eslint src/features/<feature> "src/app/(site)/<route>"`. It must be clean.
- The browser console must be free of errors and hydration warnings (compare
  with the original's own errors).

## Working resumably

Sessions can be cut off at any time, so work must survive an interruption:

- Keep `src/features/<feature>/PROGRESS.md` up to date. Write it as soon as the
  inventory is done: the full feature checklist for each page (every section,
  interaction, API call, storage key, URL param), then tick items as they land.
  Note anything half-done and the next step. It is removed once the page is
  complete and verified.
- If `PROGRESS.md` already exists when you start, a previous run was
  interrupted: read it and the existing files, then continue from there instead
  of starting over.
- Build in vertical slices and save files as you go (types/api → shell and
  layout → section by section), not as one big write at the end. Each slice
  should type-check.
- Create the route's `page.tsx` early so the page renders while you build,
  but only import modules that already exist (stub first).
- **Keep the tree compiling.** The dev server is shared: one missing import or
  syntax error in any route makes it return 500 for every page and blocks
  everyone. Create a module before the file that imports it, and finish a file
  in one write. A 500 that names someone else's file is another author
  mid-write: wait a minute and retry, don't edit their files.
- `node scripts/parity/console.mjs <url>` prints a page's console errors,
  uncaught errors, title and first text.
