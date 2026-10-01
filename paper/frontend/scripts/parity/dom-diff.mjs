#!/usr/bin/env node
// Structural parity check: compares the DOM the browser builds from each
// original ui/*.html page with the DOM it builds from the page Next.js
// prerendered (.next/server/app/**.html). Run `next build` first.
//
//   node scripts/parity/dom-diff.mjs [--only collage/clg_info.html] [--max 5]
//
// Compared: element tree (tags, attributes, text), <head> stylesheets/scripts
// (by content, following extracted /_legacy files), title and head metadata.
// Ignored: whitespace-only text, comments, Next.js runtime artifacts.

import fs from "node:fs";
import path from "node:path";
import { parse, serialize } from "parse5";
import * as acorn from "acorn";
import { parseStyleAttr } from "../convert-ui/jsx.mjs";

const FRONTEND = path.resolve(import.meta.dirname, "../..");
const UI = path.resolve(FRONTEND, "../ui");
const PUBLIC = path.join(FRONTEND, "public");
const SERVER_APP = path.join(FRONTEND, ".next/server/app");
const args = process.argv.slice(2);
const argValue = (f) => (args.includes(f) ? args[args.indexOf(f) + 1] : undefined);
const ONLY = argValue("--only");
const MAX = Number(argValue("--max") ?? 8);

const { legacyRoutes } = await import(path.join(FRONTEND, "src/generated/legacy-routes.ts")).catch(async () => {
  // Node can't import .ts directly on older versions; fall back to a tiny parse.
  const src = fs.readFileSync(path.join(FRONTEND, "src/generated/legacy-routes.ts"), "utf8");
  const rows = [...src.matchAll(/file: "([^"]+)", legacyPath: "([^"]+)", route: "([^"]+)"/g)];
  return { legacyRoutes: rows.map(([, file, legacyPath, route]) => ({ file, legacyPath, route })) };
});

const attrName = (a) => (a.prefix ? `${a.prefix}:${a.name}` : a.name);
const getAttr = (el, n) => el.attrs?.find((a) => attrName(a) === n)?.value;
const collapse = (s) => s.replace(/[ \t\n\r\f]+/g, " ");

function isOnlyTailwindConfig(code) {
  try {
    const ast = acorn.parse(code, { ecmaVersion: "latest", sourceType: "script" });
    const body = ast.body.filter((s) => s.type !== "EmptyStatement");
    const e = body.length === 1 && body[0].type === "ExpressionStatement" ? body[0].expression : null;
    return !!e && e.type === "AssignmentExpression" && /tailwind\s*\.\s*config/.test(code.slice(e.left.start, e.left.end));
  } catch {
    return false;
  }
}

function resolveLocal(ref, pageRel) {
  const u = String(ref).trim();
  if (!u || /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(u)) return null;
  const abs = new URL(u, "http://ui.local/" + pageRel);
  return { pathname: decodeURIComponent(abs.pathname), url: abs.pathname + abs.search + abs.hash };
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

const normCode = (s) => s.replace(/\s+/g, " ").trim();

/** Canonical attribute map. */
function canonAttrs(el, side) {
  const out = {};
  for (const a of el.attrs ?? []) {
    let name = attrName(a).toLowerCase();
    let value = a.value;
    if (side === "next") {
      if (name === "data-px") continue;
      if (name.startsWith("data-px-")) name = name.slice("data-px-".length);
    }
    if (name.startsWith("@")) name = "x-on:" + name.slice(1);
    if (name === "style") {
      const decls = parseStyleAttr(value).map(([k, v]) => `${k}:${collapse(v)}`);
      if (!decls.length) continue;
      value = decls.join(";");
    } else if (name === "class") {
      value = collapse(value).trim();
    }
    out[name] = value;
  }
  return out;
}

function isNextArtifact(node) {
  if (node.nodeName === "next-route-announcer") return true;
  if (node.tagName === "script") {
    const src = getAttr(node, "src") ?? "";
    if (src.startsWith("/_next/")) return true;
    const code = node.childNodes.map((n) => n.value ?? "").join("");
    if (/self\.__next_f|\$RC=|\$RB=|\$RT=|__pxBoot\(/.test(code)) return true;
  }
  if (node.tagName === "div" && node.attrs.length === 1 && getAttr(node, "hidden") !== undefined) {
    const inner = serialize(node).replace(/<!--\/?\$[?!]?-->/g, "").trim();
    if (!inner) return true;
  }
  if (node.tagName === "template" && /^B:/.test(getAttr(node, "id") ?? "")) return true;
  return false;
}

/**
 * Canonical tree for a list of nodes.
 * ctx: { side, pageRel, pre, tailwindCdnSeen }
 */
function canonNodes(nodes, ctx) {
  const out = [];
  let text = null;
  const flushText = () => {
    if (text !== null) {
      const t = ctx.pre ? text : collapse(text).trim();
      if (t) out.push({ t });
      text = null;
    }
  };
  for (const node of nodes) {
    if (node.nodeName === "#comment") continue;
    if (node.nodeName === "#text") {
      text = (text ?? "") + node.value;
      continue;
    }
    if (!node.tagName) continue;
    if (ctx.side === "next" && isNextArtifact(node)) continue;
    const c = canonElement(node, ctx);
    if (c === null) continue;
    flushText();
    out.push(c);
  }
  flushText();
  return out;
}

function readPublic(url) {
  const p = path.join(PUBLIC, url.replace(/^\//, ""));
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null;
}

function canonElement(el, ctx) {
  const tag = el.tagName;
  const attrs = canonAttrs(el, ctx.side);

  if (tag === "script") {
    const code = el.childNodes.map((n) => n.value ?? "").join("");
    const type = (attrs.type ?? "").toLowerCase();
    if (attrs.src !== undefined) {
      let src = attrs.src;
      if (/cdn\.tailwindcss\.com/.test(src)) ctx.tailwindCdnSeen = true;
      if (ctx.side === "next" && src.startsWith("/_legacy/")) {
        const file = readPublic(src);
        const body = file === null ? `<missing ${src}>` : file.replace(/^\/\/ Extracted from [^\n]*\n/, "");
        const rest = { ...attrs };
        delete rest.src;
        return { tag: "script", attrs: rest, code: normCode(body) };
      }
      const local = resolveLocal(src, ctx.pageRel);
      if (ctx.side === "orig" && local) {
        const base = path.posix.basename(local.pathname);
        const exists = fs.existsSync(path.join(UI, local.pathname));
        if ((base === "config.js" || base === "auth.js") && (local.pathname === "/" + base || !exists)) src = "/" + base;
        else if (!exists) return null;
      }
      return { tag: "script", attrs: { ...attrs, src } };
    }
    if (!code.trim()) return null;
    if (type && !/^(text|application)\/(java|ecma)script$/.test(type)) {
      return { tag: "script", attrs, code: normCode(code) };
    }
    if (ctx.side === "orig" && !ctx.tailwindCdnSeen && isOnlyTailwindConfig(code)) return null;
    const rest = { ...attrs };
    delete rest.defer;
    delete rest.async;
    if (type === "text/javascript" || type === "application/javascript") delete rest.type;
    return { tag: "script", attrs: rest, code: normCode(code) };
  }

  if (tag === "style") {
    const css = el.childNodes.map((n) => n.value ?? "").join("");
    if (!css.trim()) return null;
    return { tag: "style", css: normCode(rewriteCssUrls(css, ctx.pageRel)) };
  }
  if (tag === "link" && ctx.side === "next" && (attrs.href ?? "").startsWith("/_legacy/") && attrs.rel === "stylesheet") {
    const css = readPublic(attrs.href);
    return { tag: "style", css: css === null ? `<missing ${attrs.href}>` : normCode(css) };
  }

  if (tag === "template") {
    return { tag, attrs, html: normCode(serialize(el.content)) };
  }
  if (tag === "textarea") {
    return { tag, attrs, text: el.childNodes.map((n) => n.value ?? "").join("") };
  }
  if (tag === "noscript" || tag === "iframe") {
    return { tag, attrs, html: normCode(el.childNodes.map((n) => n.value ?? serialize(n)).join("")) };
  }
  const pre =
    ctx.pre ||
    ["pre", "listing", "xmp", "plaintext"].includes(tag) ||
    /(^|\s)(?:[\w-]+:)*whitespace-(?:pre|pre-line|pre-wrap|break-spaces)(\s|$)/.test(attrs.class ?? "") ||
    /white-space\s*:\s*(?:pre|pre-line|pre-wrap|break-spaces)/i.test(attrs.style ?? "");
  const children = canonNodes(el.childNodes ?? [], { ...ctx, pre });
  // Whitespace-only text is compared nowhere (the converter may drop insignificant runs).
  const filtered = pre ? children.filter((c) => !(c.t !== undefined && !c.t.trim())) : children;
  return { tag, attrs, children: filtered.map((c) => (c.t !== undefined && pre ? { t: c.t.trim() } : c)) };
}

function headResources(head, ctx) {
  const list = [];
  const meta = {};
  let title = "";
  for (const node of head?.childNodes ?? []) {
    if (!node.tagName) continue;
    if (ctx.side === "next" && isNextArtifact(node)) continue;
    const tag = node.tagName;
    if (tag === "title") {
      title = node.childNodes.map((n) => n.value ?? "").join("").trim();
      continue;
    }
    if (tag === "meta") {
      const key = getAttr(node, "name") ?? getAttr(node, "property") ?? getAttr(node, "http-equiv");
      if (key && !["viewport"].includes(key.toLowerCase())) meta[key.toLowerCase()] = getAttr(node, "content") ?? "";
      continue;
    }
    if (tag === "link") {
      const rel = (getAttr(node, "rel") ?? "").toLowerCase();
      if (rel === "stylesheet") {
        if (ctx.side === "orig") list.push(node);
        continue;
      }
      if (rel === "preload" && ctx.side === "next") continue; // React resource hints
      meta[`link:${rel}:${getAttr(node, "href")}`] = "";
      continue;
    }
    if (tag === "script" || tag === "style") {
      if (ctx.side === "orig") list.push(node);
    }
  }
  return { list, meta, title };
}

function diff(a, b, where, out) {
  if (out.length >= MAX) return;
  const ja = JSON.stringify(a);
  const jb = JSON.stringify(b);
  if (ja === jb) return;
  if (Array.isArray(a) && Array.isArray(b)) {
    const n = Math.max(a.length, b.length);
    for (let i = 0; i < n && out.length < MAX; i++) {
      if (JSON.stringify(a[i]) === JSON.stringify(b[i])) continue;
      const label = a[i]?.tag ?? b[i]?.tag ?? "#text";
      if (a[i] === undefined || b[i] === undefined || a[i].tag !== b[i].tag || a[i].t !== undefined || b[i].t !== undefined) {
        out.push(`${where}[${i}] ${short(a[i])}  ≠  ${short(b[i])}`);
        return; // later siblings are shifted; stop at the first structural break
      }
      diff(a[i], b[i], `${where}/${label}[${i}]`, out);
    }
    return;
  }
  if (a && b && typeof a === "object" && typeof b === "object") {
    for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
      if (JSON.stringify(a[key]) === JSON.stringify(b[key])) continue;
      if (key === "children") diff(a[key] ?? [], b[key] ?? [], where, out);
      else if (key === "attrs") {
        for (const k of new Set([...Object.keys(a.attrs ?? {}), ...Object.keys(b.attrs ?? {})])) {
          if ((a.attrs ?? {})[k] !== (b.attrs ?? {})[k]) {
            out.push(`${where} @${k}: ${JSON.stringify((a.attrs ?? {})[k])?.slice(0, 120)}  ≠  ${JSON.stringify((b.attrs ?? {})[k])?.slice(0, 120)}`);
          }
        }
      } else out.push(`${where} .${key}: ${JSON.stringify(a[key])?.slice(0, 160)}  ≠  ${JSON.stringify(b[key])?.slice(0, 160)}`);
      if (out.length >= MAX) return;
    }
    return;
  }
  out.push(`${where}: ${ja?.slice(0, 160)}  ≠  ${jb?.slice(0, 160)}`);
}

function short(n) {
  if (n === undefined) return "(nothing)";
  if (n.t !== undefined) return `text ${JSON.stringify(n.t.slice(0, 80))}`;
  return `<${n.tag}${n.attrs?.id ? "#" + n.attrs.id : ""}${n.attrs?.class ? "." + n.attrs.class.split(" ").slice(0, 3).join(".") : ""}>`;
}

function prerenderedFile(route) {
  const name = route === "/" ? "index" : route.slice(1);
  return path.join(SERVER_APP, `${name}.html`);
}

let failed = 0;
let checked = 0;
for (const page of legacyRoutes) {
  if (ONLY && page.file !== ONLY) continue;
  checked++;
  const origDoc = parse(fs.readFileSync(path.join(UI, page.file), "utf8").replace(/^\uFEFF/, ""));
  const nextFile = prerenderedFile(page.route);
  if (!fs.existsSync(nextFile)) {
    console.log(`✗ ${page.file}: no prerendered HTML at ${path.relative(FRONTEND, nextFile)}`);
    failed++;
    continue;
  }
  const nextDoc = parse(fs.readFileSync(nextFile, "utf8"));
  const html = (d) => d.childNodes.find((n) => n.tagName === "html");
  const part = (d, t) => html(d).childNodes.find((n) => n.tagName === t);

  const origCtx = { side: "orig", pageRel: page.file, pre: false, tailwindCdnSeen: false };
  const nextCtx = { side: "next", pageRel: page.file, pre: false, tailwindCdnSeen: false };
  const oh = headResources(part(origDoc, "head"), origCtx);
  const nh = headResources(part(nextDoc, "head"), nextCtx);

  const origTree = [...canonNodes(oh.list, origCtx), ...canonNodes(part(origDoc, "body").childNodes, origCtx)];
  const nextTree = canonNodes(part(nextDoc, "body").childNodes, nextCtx);

  const problems = [];
  if (oh.title !== nh.title) problems.push(`title: ${JSON.stringify(oh.title)} ≠ ${JSON.stringify(nh.title)}`);
  for (const [k, v] of Object.entries(oh.meta)) {
    if (k === "theme-color") continue;
    if (nh.meta[k] !== v) problems.push(`head ${k}: ${JSON.stringify(v)} ≠ ${JSON.stringify(nh.meta[k])}`);
  }
  diff(origTree, nextTree, "body", problems);
  if (problems.length) {
    failed++;
    console.log(`✗ ${page.file}`);
    for (const p of problems) console.log(`    ${p}`);
  } else if (ONLY) {
    console.log(`✓ ${page.file}`);
  }
}
console.log(`\n${checked - failed}/${checked} pages structurally identical`);
process.exitCode = failed ? 1 : 0;
