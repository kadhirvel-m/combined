# Paper X — Next.js frontend

This is the Next.js (App Router) version of the Paper X web UI. It is a
**faithful port** of the static site in `../ui/`: every one of the 158 pages is a
Next.js route that renders the same markup, loads the same styles and runs the
same page logic, at the same URL.

```
npm install
npm run dev            # http://localhost:3000  (runs build:runtime first)
npm run build && npm run start
```

The FastAPI backend is unchanged. Pages talk to it exactly as before; the API
base URL is resolved at runtime by `/config.js` (see
[Configuration](#configuration)).

## How a page is put together

```
src/app/collage/clg_info/page.tsx      markup (JSX) + <title>/metadata
public/_legacy/collage/clg_info/       the page's inline <style>/<script> blocks
  style-01.css  script-01.js …
public/assets/**, public/collage/helpers.js …   static files, same paths as ui/
public/config.js, public/auth.js       shared runtime, compiled from src/runtime/
```

Each page renders `<LegacyPage>` (`src/components/legacy/LegacyPage.tsx`):

- **Markup** is real JSX, generated from the original HTML. It is rendered on
  the server (all pages are statically prerendered) and is never hydrated: it
  sits in a `StaticIsland` that suspends forever on the client, so React keeps
  the server HTML exactly as the browser parsed it.
- **Scripts** are real `<script>` tags inside that markup, in their original
  positions. The browser executes them natively while parsing, so the original
  order, `defer`/`async`/`type="module"` behaviour and `DOMContentLoaded`
  timing are all unchanged. Alpine.js, CodeMirror, Chart.js, KaTeX, Three.js
  and the rest work exactly as before.
- **Styles**: the original `<head>` stylesheets and `<style>` blocks are kept in
  their original order (inline blocks became files under `public/_legacy/`, with
  relative `url(...)`s rewritten), so the cascade is identical. Pages that used
  the Tailwind Play CDN still do; the others use the same prebuilt
  `public/assets/css/tailwind.css`.
- **`<html>`/`<body>` attributes** of the original page are applied before first
  paint by `__pxBoot` (`src/components/legacy/boot.ts`), which also restores
  things React cannot server-render: inline `onclick="…"`-style handlers,
  `javascript:` URLs and empty `src=""` attributes (encoded as `data-px-*`).

### URLs

Every page keeps its original URL (`/profile.html`, `/collage/clg_info.html`,
`/tunex/index.html`), so all links, `location.href = "x.html"` calls and
backend-generated links keep working. `next.config.ts` rewrites each `.html` URL
to its route (from `src/generated/legacy-routes.ts`), redirects folder URLs like
`/tunex` to `/tunex/index.html` (so relative links inside the folder resolve),
and redirects the backend's old `/ui/...` prefix to `/...`.

### Shared runtime (`src/runtime/`)

`config.js` and `auth.js`, which every page loads, are now TypeScript:

- `src/runtime/config/*`: API base resolution, console hygiene, `innerHTML`
  sanitizer, cookie/CSRF/refresh auth shim for `fetch`, theme manager, navbar
  dropdowns, TuNe AI widget (disabled by its flag, as before).
- `src/runtime/auth/*`: navbar login/profile/sign-out state.

`scripts/build-runtime.mjs` bundles them with esbuild into classic scripts at
`public/config.js` and `public/auth.js` (run automatically before `dev` and
`build`; `npm run build:runtime -- --watch` while editing them).

## Configuration

| Variable | Default | Used by |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE` | `http://0.0.0.0:10000` | Production API base baked into `/config.js`/`/auth.js` (the value `ui/config.js` hard-coded). Local pages still use `http://<host>:8000`, and a `localStorage.API_BASE` override still wins, exactly as before. |

Put it in `.env.local` (or the hosting provider's env settings) and rebuild.

## Checking parity with the original UI

Two checks compare this app against `../ui/`:

```
npm run build
npm run parity:dom                      # every page: same elements, attributes, text, styles, scripts

python3 -m http.server 5500 --bind 127.0.0.1 --directory ../ui &
npm run start -- -p 3100 &
npm run parity:browser                  # every page in Chromium: pixels, rendered text, errors
```

Browser results go to `.parity/report.json` (with diff images).

## Migrating a page to idiomatic React

Pages can be moved off the legacy runtime one at a time:

1. Rewrite `src/app/<route>/page.tsx` as normal React (Server Components plus
   Client Components for interactivity), porting the logic from
   `public/_legacy/<route>/script-*.js` and styles from `style-*.css`.
2. Stop rendering `<LegacyPage>`, then delete the page's `public/_legacy/<route>/`
   folder and remove the eslint-disable header.
3. Keep the URL: the rewrite in `next.config.ts` still maps `/<route>.html` to
   it. Use `next/link` only between migrated pages; links into legacy pages
   should stay plain `<a>` so they do a full page load.

## Regenerating from `../ui`

`npm run convert:ui` re-runs the converter (`scripts/convert-ui/`). It
**overwrites** every generated page and `public/_legacy/`, so only use it
while `ui/` is still the source of truth. `scripts/convert-ui/report.json`
lists what it adjusted:

- 45 inline `tailwind.config = …` scripts on pages that don't load the Tailwind
  CDN were dropped. They threw `tailwind is not defined` and did nothing.
- 6 `projects/*` pages referenced `config.js` with a broken relative path (a
  404 in the old site); they now load `/config.js` as intended.
- `dashboard.html` and `tunex/dashboard.html` referenced a non-existent
  `scripts/cloud.js`; that tag was removed.
