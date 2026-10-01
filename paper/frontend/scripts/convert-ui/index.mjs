#!/usr/bin/env node
// Converts every page of the legacy static UI (../ui) into a Next.js App Router
// route, preserving markup, styles, scripts and URLs.
//
//   node scripts/convert-ui/index.mjs [--ui ../ui] [--only path/to/page.html]
//
// Output (all regenerated on every run; files listed in the previous manifest
// are removed first):
//   src/app/<route>/page.tsx          page markup as JSX + metadata
//   public/_legacy/<page>/*.js|*.css   the page's inline <script>/<style> blocks
//   public/**                         every static file of ../ui (assets, shared js)
//   src/generated/legacy-routes.ts    URL map used by next.config.ts
//   src/types/legacy-elements.d.ts    JSX typings for custom elements
//
// After the migration the generated files are the source of truth; re-running
// the converter overwrites manual edits to generated pages.

import fs from "node:fs";
import path from "node:path";
import { parse } from "parse5";
import * as acorn from "acorn";
import { JsxEmitter, getAttr, hasAttr, attrName } from "./jsx.mjs";

const FRONTEND = path.resolve(import.meta.dirname, "../..");
const args = process.argv.slice(2);
const argValue = (flag) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
};
const UI = path.resolve(FRONTEND, argValue("--ui") ?? "../ui");
const ONLY = argValue("--only");
const APP = path.join(FRONTEND, "src/app");
const PUBLIC = path.join(FRONTEND, "public");
const LEGACY_URL = "/_legacy";
const LEGACY_DIR = path.join(PUBLIC, "_legacy");
const GENERATED = path.join(FRONTEND, "src/generated");
const MANIFEST = path.join(GENERATED, "legacy-manifest.json");

/** Scripts replaced by the TypeScript runtime in src/runtime (compiled to public/). */
const BUILTIN_SCRIPTS = new Map([
  ["config.js", "/config.js"],
  ["auth.js", "/auth.js"],
]);

/** ../ui paths that are build tooling, docs or dependencies rather than site files. */
const STATIC_EXCLUDES = [
  /^node_modules\//,
  /^scripts\//,
  /^src\//,
  /^package(-lock)?\.json$/,
  /^(tailwind|postcss)\.config\.js$/,
  /^build-tailwind\.js$/,
  /^README[^/]*\.md$/,
  /^dfd\.md$/,
  /^mediX\/README\.md$/,
  /(^|\/)\.DS_Store$/,
  /^config\.js$/,
  /^auth\.js$/,
];

const DEFAULT_VIEWPORT = "width=device-width, initial-scale=1";

/** Pages rebuilt as React components in src/app/(site); never regenerated. */
const MIGRATED = new Set(JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "migrated.json"), "utf8")).pages);

// ---------------------------------------------------------------------------
// helpers

function walk(dir, base = dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, base));
    else if (entry.isFile()) out.push(path.relative(base, full).split(path.sep).join("/"));
  }
  return out;
}

function isPage(rel) {
  return rel.endsWith(".html") && !rel.startsWith("node_modules/") && !rel.startsWith("assets/");
}

function routeFor(rel) {
  const noExt = rel.replace(/\.html$/, "");
  if (noExt === "index") return "/";
  if (noExt.endsWith("/index")) return "/" + noExt.slice(0, -"/index".length);
  return "/" + noExt;
}

function componentName(id) {
  const name = id
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join("");
  return (/^[A-Za-z]/.test(name) ? name : "P" + name) + "Page";
}

/** Resolve a URL reference relative to a page; null for non-local URLs. */
function resolveLocal(ref, pageRel) {
  const u = String(ref).trim();
  if (!u || /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(u)) return null;
  const abs = new URL(u, "http://ui.local/" + pageRel);
  return { pathname: decodeURIComponent(abs.pathname), url: abs.pathname + abs.search + abs.hash };
}

function localFileExists(pathname) {
  const p = path.join(UI, pathname.replace(/^\//, ""));
  return fs.existsSync(p) && fs.statSync(p).isFile();
}

function rewriteCssUrls(css, pageRel) {
  const fix = (u) => {
    const r = resolveLocal(u, pageRel);
    return r && !u.trim().startsWith("/") ? r.url : u;
  };
  return css
    .replace(/url\(\s*(['"]?)([^'")]*?)\1\s*\)/g, (m, q, u) => (u.startsWith("data:") ? m : `url(${q}${fix(u)}${q})`))
    .replace(/@import\s+(['"])([^'"]+)\1/g, (m, q, u) => `@import ${q}${fix(u)}${q}`);
}

function isOnlyTailwindConfig(code) {
  try {
    const ast = acorn.parse(code, { ecmaVersion: "latest", sourceType: "script" });
    const body = ast.body.filter((s) => s.type !== "EmptyStatement");
    if (body.length !== 1 || body[0].type !== "ExpressionStatement") return false;
    const e = body[0].expression;
    if (e.type !== "AssignmentExpression" || e.left.type !== "MemberExpression") return false;
    const obj = e.left.object;
    const prop = e.left.property;
    const objName = obj.type === "Identifier" ? obj.name : obj.type === "MemberExpression" ? obj.property.name : "";
    return objName === "tailwind" && (prop.name === "config" || prop.value === "config");
  } catch {
    return false;
  }
}

function writeFile(file, content, manifest) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  manifest.push(path.relative(FRONTEND, file).split(path.sep).join("/"));
}

function tsString(value) {
  return JSON.stringify(value);
}

// ---------------------------------------------------------------------------
// page conversion

function convertPage(rel, manifest, customElements, report) {
  // Browsers strip a UTF-8 byte order mark before parsing; parse5 would treat it as text.
  const source = fs.readFileSync(path.join(UI, rel), "utf8").replace(/^\uFEFF/, "");
  const doc = parse(source);
  const htmlEl = doc.childNodes.find((n) => n.tagName === "html");
  const head = htmlEl.childNodes.find((n) => n.tagName === "head");
  const body = htmlEl.childNodes.find((n) => n.tagName === "body");
  const id = rel.replace(/\.html$/, "");
  const route = routeFor(rel);
  const warnings = [];
  const counters = { style: 0, script: 0 };
  let tailwindCdnSeen = false;

  const metadata = {};
  const viewport = {};
  const headHoist = [];

  const legacyFile = (kind, ext) => {
    counters[kind] += 1;
    const name = `${kind}-${String(counters[kind]).padStart(2, "0")}.${ext}`;
    return { url: `${LEGACY_URL}/${id}/${name}`, file: path.join(LEGACY_DIR, id, name) };
  };

  const scriptAttrProps = (el, { dropExecutionAttrs }) => {
    const props = [];
    for (const attr of el.attrs) {
      const name = attrName(attr);
      if (name === "src") continue;
      if (dropExecutionAttrs && (name === "defer" || name === "async")) continue;
      if (name === "type" && /^(text|application)\/(java|ecma)script$/i.test(attr.value)) continue;
      if (name === "charset" || name === "language") continue;
      props.push(attr);
    }
    return props;
  };

  const emitter = new JsxEmitter({ customElements, warnings });

  /** Renders a synthetic element through the emitter (so attribute rules apply). */
  const emitSynthetic = (tagName, attrs, depth, extraProps = []) => {
    const el = { nodeName: tagName, tagName, namespaceURI: "http://www.w3.org/1999/xhtml", attrs, childNodes: [] };
    const saved = emitter.page.elementHook;
    emitter.page.elementHook = null;
    const lines = emitter.element(el, { svg: false, pre: false }, depth);
    emitter.page.elementHook = saved;
    if (extraProps.length) {
      const last = lines.length - 1;
      lines[last] = lines[last].replace(/ \/>$/, ` ${extraProps.join(" ")} />`);
    }
    return lines;
  };

  const pad = (depth) => "  ".repeat(depth);

  emitter.page.elementHook = (el, _ctx, depth) => {
    if (el.tagName === "script" && el.namespaceURI === "http://www.w3.org/1999/xhtml") {
      return convertScript(el, depth);
    }
    if (el.tagName === "style" && el.namespaceURI === "http://www.w3.org/1999/xhtml") {
      return convertStyle(el, depth);
    }
    return null;
  };

  function convertStyle(el, depth) {
    const css = el.childNodes.map((n) => n.value ?? "").join("");
    if (!css.trim()) return [];
    const out = legacyFile("style", "css");
    writeFile(out.file, rewriteCssUrls(css, rel).replace(/^\n+/, "").replace(/\s*$/, "\n"), manifest);
    const attrs = [{ name: "rel", value: "stylesheet" }, { name: "href", value: out.url }];
    for (const a of el.attrs) if (attrName(a) === "media") attrs.push(a);
    return emitSynthetic("link", attrs, depth);
  }

  function convertScript(el, depth) {
    const src = getAttr(el, "src");
    const type = (getAttr(el, "type") ?? "").trim().toLowerCase();
    const code = el.childNodes.map((n) => n.value ?? "").join("");

    if (src !== undefined) {
      if (/cdn\.tailwindcss\.com/i.test(src)) tailwindCdnSeen = true;
      const local = resolveLocal(src, rel);
      let finalSrc = src;
      if (local) {
        const base = path.posix.basename(local.pathname);
        const builtin = BUILTIN_SCRIPTS.get(base);
        if (builtin && (local.pathname === builtin || !localFileExists(local.pathname))) {
          if (local.pathname !== builtin) warnings.push(`fixed broken script path ${src} -> ${builtin}`);
          finalSrc = builtin;
        } else if (!localFileExists(local.pathname)) {
          warnings.push(`dropped script with missing file: ${src}`);
          return [`${pad(depth)}{/* removed: <script src="${src}"> (file does not exist in ui/) */}`];
        }
      }
      const attrs = [{ name: "src", value: finalSrc }, ...scriptAttrProps(el, { dropExecutionAttrs: false })];
      return emitSynthetic("script", attrs, depth);
    }

    if (!code.trim()) return [];

    if (type === "module" || type === "importmap") {
      const attrs = el.attrs.filter((a) => attrName(a) !== "charset");
      return emitSynthetic("script", attrs, depth, [`dangerouslySetInnerHTML={{ __html: ${tsString(code)} }}`]);
    }

    if (type && !/^(text|application)\/(java|ecma)script$/.test(type)) {
      // Data blocks (templates, JSON): keep inline and untouched.
      return emitSynthetic("script", el.attrs, depth, [`dangerouslySetInnerHTML={{ __html: ${tsString(code)} }}`]);
    }

    if (!tailwindCdnSeen && isOnlyTailwindConfig(code)) {
      warnings.push("dropped inactive tailwind.config script (no Tailwind CDN loaded before it)");
      return [];
    }

    const out = legacyFile("script", "js");
    writeFile(
      out.file,
      `// Extracted from ui/${rel} (inline <script> #${counters.script}).\n${code.replace(/^\n+/, "").replace(/\s*$/, "\n")}`,
      manifest,
    );
    const attrs = [{ name: "src", value: out.url }, ...scriptAttrProps(el, { dropExecutionAttrs: true })];
    return emitSynthetic("script", attrs, depth);
  }

  // --- <head> ---------------------------------------------------------------
  const islandHead = [];
  for (const node of head?.childNodes ?? []) {
    if (node.nodeName === "#text" || node.nodeName === "#comment") continue;
    const tag = node.tagName;
    if (tag === "title") {
      metadata.title = node.childNodes.map((n) => n.value ?? "").join("").trim();
      continue;
    }
    if (tag === "meta") {
      const name = (getAttr(node, "name") ?? "").toLowerCase();
      const content = getAttr(node, "content") ?? "";
      if (hasAttr(node, "charset")) continue;
      if (name === "viewport") {
        const normalized = content.replace(/\s+/g, "").replace(/initial-scale=1\.0\b/, "initial-scale=1");
        if (normalized !== DEFAULT_VIEWPORT.replace(/\s+/g, "")) viewport.raw = content;
        continue;
      }
      if (name === "description") {
        metadata.description = content;
        continue;
      }
      if (name === "keywords") {
        metadata.keywords = content;
        continue;
      }
      if (name === "theme-color" && !hasAttr(node, "media")) {
        viewport.themeColor = content;
        continue;
      }
      headHoist.push(...emitSynthetic("meta", node.attrs, 5));
      continue;
    }
    if (tag === "link") {
      const relAttr = (getAttr(node, "rel") ?? "").toLowerCase();
      if (relAttr.split(/\s+/).includes("stylesheet")) {
        islandHead.push(...emitter.element(node, { svg: false, pre: false }, 3));
      } else {
        headHoist.push(...emitSynthetic("link", node.attrs, 5));
      }
      continue;
    }
    if (tag === "script" || tag === "style") {
      islandHead.push(...emitter.element(node, { svg: false, pre: false }, 3));
      continue;
    }
    // Anything else in <head> (noscript, base, template…) is kept in place.
    islandHead.push(...emitter.element(node, { svg: false, pre: false }, 3));
  }

  // --- <body> ---------------------------------------------------------------
  const bodyLines = emitter.children(body, body.childNodes, { svg: false, pre: false }, 3).filter(
    (line, i, arr) => !(line.trim() === '{" "}' && (i === 0 || i === arr.length - 1)),
  );

  const rawAttrs = (el) => {
    const o = {};
    for (const a of el?.attrs ?? []) o[attrName(a)] = a.value;
    return o;
  };
  const htmlAttrs = rawAttrs(htmlEl);
  const bodyAttrs = rawAttrs(body);

  // --- page.tsx -------------------------------------------------------------
  const lines = [];
  lines.push(`// Converted from ui/${rel} by scripts/convert-ui. Inline scripts/styles live in public${LEGACY_URL}/${id}/.`);
  lines.push(
    "// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),",
    "// so plain <script>/<link>/<img> tags are intentional here.",
    "/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */",
  );
  const needsViewport = Object.keys(viewport).length > 0;
  lines.push(`import type { Metadata${needsViewport ? ", Viewport" : ""} } from "next";`);
  lines.push(`import { LegacyPage } from "@/components/legacy/LegacyPage";`);
  lines.push("");
  lines.push("export const metadata: Metadata = {");
  if (metadata.title !== undefined) lines.push(`  title: ${tsString(metadata.title)},`);
  if (metadata.description !== undefined) lines.push(`  description: ${tsString(metadata.description)},`);
  if (metadata.keywords !== undefined) lines.push(`  keywords: ${tsString(metadata.keywords)},`);
  lines.push("};");
  if (needsViewport) {
    lines.push("");
    lines.push("export const viewport: Viewport = {");
    if (viewport.raw !== undefined) {
      for (const part of viewport.raw.split(",")) {
        const [k, v] = part.split("=").map((s) => s.trim());
        const key = {
          width: "width",
          height: "height",
          "initial-scale": "initialScale",
          "minimum-scale": "minimumScale",
          "maximum-scale": "maximumScale",
          "user-scalable": "userScalable",
          "viewport-fit": "viewportFit",
          "interactive-widget": "interactiveWidget",
        }[k];
        if (!key || v === undefined) continue;
        let value;
        if (key === "userScalable") value = /^(yes|1)$/i.test(v) ? "true" : "false";
        else if (/Scale$/.test(key) && !Number.isNaN(Number(v))) value = String(Number(v));
        else value = tsString(v);
        lines.push(`  ${key}: ${value},`);
      }
    } else {
      lines.push(`  width: "device-width",`, `  initialScale: 1,`);
    }
    if (viewport.themeColor !== undefined) lines.push(`  themeColor: ${tsString(viewport.themeColor)},`);
    lines.push("};");
  }
  lines.push("");
  lines.push(`export default function ${componentName(id)}() {`);
  lines.push("  return (");
  lines.push("    <LegacyPage");
  lines.push(`      html={${tsString(htmlAttrs)}}`);
  if (Object.keys(bodyAttrs).length) lines.push(`      body={${tsString(bodyAttrs)}}`);
  if (headHoist.length) {
    lines.push("      head={");
    lines.push("        <>");
    lines.push(...headHoist);
    lines.push("        </>");
    lines.push("      }");
  }
  lines.push("    >");
  if (islandHead.length) {
    lines.push("      {/* ── original <head> stylesheets & scripts, in order ── */}");
    lines.push(...islandHead);
    lines.push("      {/* ── original <body> ── */}");
  }
  lines.push(...bodyLines);
  lines.push("    </LegacyPage>");
  lines.push("  );");
  lines.push("}");
  lines.push("");

  const pageFile = path.join(APP, route === "/" ? "" : route.slice(1), "page.tsx");
  writeFile(pageFile, lines.join("\n"), manifest);
  report.push({ page: rel, route, warnings });
  return { file: rel, legacyPath: "/" + rel, route, directoryIndex: /(^|\/)index\.html$/.test(rel), react: false };
}

// ---------------------------------------------------------------------------
// main

function main() {
  if (!fs.existsSync(UI)) throw new Error(`ui folder not found: ${UI}`);
  const previous = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, "utf8")) : { files: [] };
  if (!ONLY) {
    for (const f of previous.files) {
      fs.rmSync(path.join(FRONTEND, f), { force: true });
      // Drop directories left empty (e.g. a page that moved to src/app/(site)).
      let dir = path.dirname(path.join(FRONTEND, f));
      while (dir.startsWith(APP + path.sep) && fs.existsSync(dir) && fs.readdirSync(dir).length === 0) {
        fs.rmdirSync(dir);
        dir = path.dirname(dir);
      }
    }
    fs.rmSync(LEGACY_DIR, { recursive: true, force: true });
  }

  const all = walk(UI);
  const pages = all.filter(isPage).filter((p) => !ONLY || p === ONLY).sort();
  const manifest = ONLY ? previous.files.slice() : [];
  const customElements = new Set();
  const report = [];
  const routes = [];

  for (const rel of pages) {
    if (MIGRATED.has(rel)) {
      routes.push({ file: rel, legacyPath: "/" + rel, route: routeFor(rel), directoryIndex: /(^|\/)index\.html$/.test(rel), react: true });
      continue;
    }
    try {
      routes.push(convertPage(rel, manifest, customElements, report));
    } catch (err) {
      console.error(`✗ ${rel}: ${err.stack}`);
      process.exitCode = 1;
    }
  }

  if (!ONLY) {
    // Static files: mirror ../ui into public/ at the same paths.
    let copied = 0;
    for (const rel of all) {
      if (isPage(rel) || STATIC_EXCLUDES.some((re) => re.test(rel))) continue;
      const from = path.join(UI, rel);
      const to = path.join(PUBLIC, rel);
      const st = fs.statSync(from);
      if (fs.existsSync(to)) {
        const dt = fs.statSync(to);
        if (dt.size === st.size && Math.floor(dt.mtimeMs / 1000) >= Math.floor(st.mtimeMs / 1000)) continue;
      }
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.copyFileSync(from, to);
      fs.utimesSync(to, st.atime, st.mtime);
      copied++;
    }

    fs.mkdirSync(GENERATED, { recursive: true });
    const routeLines = routes
      .sort((a, b) => a.legacyPath.localeCompare(b.legacyPath))
      .map(
        (r) =>
          `  { file: ${tsString(r.file)}, legacyPath: ${tsString(r.legacyPath)}, route: ${tsString(r.route)}, directoryIndex: ${r.directoryIndex}, react: ${r.react} },`,
      );
    writeFile(
      path.join(GENERATED, "legacy-routes.ts"),
      [
        "// Generated by scripts/convert-ui — the page map of the original ui/ folder.",
        "",
        "export interface LegacyRoute {",
        "  /** Source file inside the original ui/ folder. */",
        "  file: string;",
        "  /** Public URL the page had (and still has), e.g. /collage/clg_info.html. */",
        "  legacyPath: string;",
        "  /** App Router route that renders it, e.g. /collage/clg_info. */",
        "  route: string;",
        "  /** True for folder index pages (tunex/index.html…), which must keep their .html URL. */",
        "  directoryIndex: boolean;",
        "  /** True when the page is a React page in src/app/(site) (see scripts/convert-ui/migrated.json). */",
        "  react: boolean;",
        "}",
        "",
        "export const legacyRoutes: readonly LegacyRoute[] = [",
        ...routeLines,
        "];",
        "",
      ].join("\n"),
      manifest,
    );

    const tags = [...customElements].sort();
    writeFile(
      path.join(FRONTEND, "src/types/legacy-elements.d.ts"),
      [
        "// Generated by scripts/convert-ui — custom elements used by the converted pages.",
        'import type { HTMLAttributes } from "react";',
        "",
        "type LegacyCustomElementProps = HTMLAttributes<HTMLElement> & { [attribute: string]: unknown };",
        "",
        'declare module "react" {',
        "  // Inline styles in the legacy markup set CSS custom properties (--pct, --tw-ring-color…).",
        "  interface CSSProperties {",
        "    [customProperty: `--${string}`]: string | number | undefined;",
        "  }",
        "",
        "  namespace JSX {",
        "    interface IntrinsicElements {",
        ...tags.map((t) => `      ${tsString(t)}: LegacyCustomElementProps;`),
        "    }",
        "  }",
        "}",
        "",
      ].join("\n"),
      manifest,
    );
    console.log(`static files copied/updated: ${copied}`);
  }

  fs.mkdirSync(GENERATED, { recursive: true });
  fs.writeFileSync(MANIFEST, JSON.stringify({ files: [...new Set(manifest)].sort() }, null, 2) + "\n");
  fs.writeFileSync(path.join(FRONTEND, "scripts/convert-ui/report.json"), JSON.stringify(report, null, 2) + "\n");
  const warned = report.filter((r) => r.warnings.length);
  console.log(`converted ${routes.length} pages (${warned.length} with notes, see scripts/convert-ui/report.json)`);
}

main();
