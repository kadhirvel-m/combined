# Tailwind CSS Local Build Setup

This project was migrated from using the Tailwind CDN to a local build (Tailwind CLI v3) on 2025-10-07.

## Files & Folders
- `tailwind.config.js` – Content paths & plugin configuration.
- `postcss.config.js` – PostCSS pipeline (autoprefixer included).
- `src/input.css` – Source file with `@tailwind` directives.
- `assets/css/tailwind.css` – Generated, minified output file (checked in for now).

## Scripts
Run a one‑time build:
```
npm run build:css
```
Run in watch mode (rebuild on changes):
```
npm run watch:css
```

## Adding Utilities / Custom Styles
Place extra CSS (e.g. component classes, `@layer` rules) inside `src/input.css` below the existing directives.

Example:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn-brand { @apply px-4 py-2 rounded font-medium bg-indigo-600 text-white hover:bg-indigo-700; }
}
```

## Content Paths
If you add new folders with HTML or JS templates, update `content` in `tailwind.config.js` so purge includes them.

## Upgrading Tailwind
Version pinned: `^3.4.14` for stable CLI. If you want Tailwind v4, re-run initialization (v4 introduces a different `@import` based flow and experimental compile API). Until the CLI binary issues are resolved here, stay on v3.

## Regenerating After Pull
If classes look missing, run `npm install` then `npm run build:css`.

## Removing CDN References
All `<script src="https://cdn.tailwindcss.com">` tags were replaced with:
```html
<link rel="stylesheet" href="assets/css/tailwind.css" />
```
(or the correct relative path using `../` or `../../` in nested folders.)

## Troubleshooting
- Empty CSS or missing classes: ensure the file paths in `content` cover your new HTML/JS files.
- Slow first build: run once; subsequent builds are quicker.
- Need to customize theme: edit `theme.extend` in `tailwind.config.js`.

---
Maintainer note: consider adding a proper build pipeline (e.g. bundler + hashing) before production deployment.
