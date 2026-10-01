#!/usr/bin/env node
// Lists Tailwind-looking classes that an original ui/ page uses but that had
// NO effect there, because the prebuilt assets/css/tailwind.css doesn't define
// them (it was built long ago from a subset of pages, with an older config).
//
//   node scripts/parity/dead-classes.mjs about.html [more.html …]
//
// A React rebuild compiles the full Tailwind, so copying such a class over
// would START applying it and change the look. Drop those classes (or verify
// against the original screenshot) when porting.
//
// Pages that load the Tailwind Play CDN generate every class at runtime with
// their own inline config, so nothing is "dead" there; the tool says so.

import fs from "node:fs";
import path from "node:path";
import { parse } from "parse5";

const FRONTEND = path.resolve(import.meta.dirname, "../..");
const UI = path.resolve(FRONTEND, "../ui");
const css = fs.readFileSync(path.join(UI, "assets/css/tailwind.css"), "utf8");

/**
 * CSS identifier unescape: `\2c ` (hex code point + optional space) and `\:`
 * (backslash + literal char). Tailwind writes commas in arbitrary values as
 * `\2c ` and slashes/colons/brackets as `\/`, `\:`, `\[`.
 */
function unescapeIdent(raw) {
  return raw.replace(/\\([0-9a-fA-F]{1,6})\s?|\\(.)/g, (_, hex, ch) => (hex ? String.fromCodePoint(parseInt(hex, 16)) : ch));
}

// A class selector token: escapes (hex or single char) or identifier chars.
const CLASS_TOKEN = /\.((?:\\[0-9a-fA-F]{1,6}\s?|\\.|[A-Za-z0-9_-])+)/g;

// Every class selector the prebuilt stylesheet defines (unescaped).
const defined = new Set();
for (const m of css.matchAll(CLASS_TOKEN)) defined.add(unescapeIdent(m[1]));

function collect(node, out, inlineCss) {
  if (node.tagName === "style") inlineCss.push(node.childNodes.map((n) => n.value ?? "").join(""));
  for (const a of node.attrs ?? []) {
    if (a.name === "class") for (const c of a.value.split(/\s+/)) if (c) out.add(c);
  }
  for (const c of node.childNodes ?? []) collect(c, out, inlineCss);
  if (node.content) collect(node.content, out, inlineCss);
}

for (const file of process.argv.slice(2)) {
  const src = fs.readFileSync(path.join(UI, file), "utf8").replace(/^﻿/, "");
  const usesCdn = /cdn\.tailwindcss\.com/.test(src);
  const usesPrebuilt = /assets\/css\/tailwind\.css/.test(src);
  const classes = new Set();
  const inlineCss = [];
  collect(parse(src), classes, inlineCss);
  // Classes written inside scripts/templates (rendered later by JS).
  for (const m of src.matchAll(/class(?:Name)?\s*=\s*["'`]([^"'`]+)["'`]/g)) for (const c of m[1].split(/\s+/)) if (c && !c.includes("$")) classes.add(c);
  const pageCss = inlineCss.join("\n");
  const pageDefined = new Set([...pageCss.matchAll(CLASS_TOKEN)].map((m) => unescapeIdent(m[1])));

  console.log(`\n${file}`);
  console.log(`  stylesheet: ${usesPrebuilt ? "prebuilt tailwind.css" : ""}${usesPrebuilt && usesCdn ? " + " : ""}${usesCdn ? "Tailwind Play CDN (runtime, inline config wins)" : ""}${!usesPrebuilt && !usesCdn ? "none (page CSS only)" : ""}`);
  if (usesCdn) {
    console.log("  → every Tailwind class is live here; check the page's inline tailwind.config for custom values.");
    continue;
  }
  // Heuristic for "looks like a Tailwind utility": has a variant prefix, a
  // bracket value, a slash opacity, or a known utility stem.
  const looksTailwind = (c) =>
    /[:\[\]/]/.test(c) ||
    /^-?(m|p|w|h|size|min|max|gap|space|inset|top|left|right|bottom|z|bg|text|font|border|ring|rounded|shadow|flex|grid|col|row|order|items|justify|self|place|content|overflow|opacity|transition|duration|ease|animate|translate|scale|rotate|blur|backdrop|aspect|object|leading|tracking|line|truncate|whitespace|break|sr|pointer|cursor|select|snap|scroll|divide|outline|fill|stroke|from|via|to|inline|block|hidden|absolute|relative|fixed|sticky|static|container|antialiased|uppercase|lowercase|capitalize|italic|underline|list|table|float|clear|isolate|mix|will|appearance|resize|decoration|accent|caret|origin|basis|grow|shrink|columns|invisible|visible)(-|$)/.test(c);
  const dead = [...classes].filter((c) => looksTailwind(c) && !defined.has(c) && !pageDefined.has(c)).sort();
  console.log(`  ${dead.length} dead utility classes (no rule in tailwind.css or the page's own <style>):`);
  console.log("  " + dead.join("  "));
}
