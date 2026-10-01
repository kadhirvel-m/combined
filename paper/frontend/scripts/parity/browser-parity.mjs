#!/usr/bin/env node
// Behavioural parity check: loads every page from the original static ui/ site
// and from the Next.js app in real Chromium, then compares
//   - rendered pixels (full-page screenshot, pixelmatch)
//   - rendered text (document.body.innerText, layout-aware)
//   - uncaught page errors and console errors
//
// Start both servers first:
//   python3 -m http.server 5500 --bind 127.0.0.1 --directory ../ui
//   npm run build && npm run start -- -p 3100
// then:
//   node scripts/parity/browser-parity.mjs [--only about.html] [--workers 6] [--dark]
//
// Results: .parity/report.json and .parity/<page>/{original,next,diff}.png

import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

const FRONTEND = path.resolve(import.meta.dirname, "../..");
const args = process.argv.slice(2);
const argValue = (f) => (args.includes(f) ? args[args.indexOf(f) + 1] : undefined);
const ORIG = (argValue("--orig") ?? "http://127.0.0.1:5500").replace(/\/$/, "");
const NEXT = (argValue("--next") ?? "http://127.0.0.1:3100").replace(/\/$/, "");
const ONLY = argValue("--only")?.split(",");
const WORKERS = Number(argValue("--workers") ?? 6);
const DARK = args.includes("--dark");
const OUT = path.join(FRONTEND, argValue("--out") ?? ".parity");
const SETTLE_MS = Number(argValue("--settle") ?? 2500);
const FIXED_TIME = new Date("2026-09-30T10:00:00Z");

const routesSrc = fs.readFileSync(path.join(FRONTEND, "src/generated/legacy-routes.ts"), "utf8");
const pages = [...routesSrc.matchAll(/file: "([^"]+)", legacyPath: "([^"]+)"/g)]
  .map(([, file, legacyPath]) => ({ file, legacyPath }))
  .filter((p) => !ONLY || ONLY.includes(p.file));

// Deterministic randomness on both sides so random widgets render identically.
const INIT_SCRIPT = `(() => {
  let seed = 1234567;
  Math.random = function () {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
})();`;

async function capture(browser, url) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
    colorScheme: DARK ? "dark" : "light",
    reducedMotion: "reduce",
    serviceWorkers: "block",
  });
  await context.addInitScript(INIT_SCRIPT);
  const page = await context.newPage();
  await page.clock.setFixedTime(FIXED_TIME);
  const errors = [];
  const consoleErrors = [];
  page.on("pageerror", (e) => errors.push(String(e.message || e).split("\n")[0]));
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text().split("\n")[0]);
  });
  let loadError = null;
  try {
    await page.goto(url, { waitUntil: "load", timeout: 45000 });
  } catch (e) {
    loadError = String(e.message).split("\n")[0];
  }
  await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(SETTLE_MS);
  // Stop CSS animations/transitions/videos so screenshots are stable.
  await page
    .addStyleTag({
      content:
        "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}",
    })
    .catch(() => {});
  await page.evaluate(() => document.querySelectorAll("video").forEach((v) => { try { v.pause(); v.currentTime = 0; } catch {} })).catch(() => {});
  const info = await page
    .evaluate(() => ({
      text: document.body ? document.body.innerText : "",
      title: document.title,
      height: Math.min(document.documentElement.scrollHeight, 8000),
      htmlClass: document.documentElement.className,
      bodyClass: document.body ? document.body.className : "",
    }))
    .catch(() => ({ text: "", title: "", height: 800, htmlClass: "", bodyClass: "" }));
  let shotError = null;
  const shot = await page
    .screenshot({ fullPage: true, clip: { x: 0, y: 0, width: 1280, height: Math.max(800, info.height) }, timeout: 60000, animations: "disabled" })
    .catch((e) => {
      shotError = String(e.message).split("\n")[0];
      return null;
    });
  await context.close();
  return { ...info, errors, consoleErrors, loadError, shot, shotError };
}

function normalizeText(t) {
  return t
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function normalizeMessage(m) {
  return m
    .replaceAll(ORIG, "<origin>")
    .replaceAll(NEXT, "<origin>")
    .replace(/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/g, "<origin>")
    // The reason phrase comes from the server (Python says "File not found").
    .replace(/status of (\d{3}) \([^)]*\)/, "status of $1")
    .replace(/\s+/g, " ")
    .trim();
}

function textDiff(a, b) {
  const out = [];
  const setB = new Map();
  for (const l of b) setB.set(l, (setB.get(l) ?? 0) + 1);
  for (const l of a) {
    if (setB.get(l)) setB.set(l, setB.get(l) - 1);
    else out.push(`- ${l}`);
  }
  for (const [l, n] of setB) for (let i = 0; i < n; i++) out.push(`+ ${l}`);
  return out;
}

function comparePng(a, b) {
  const A = PNG.sync.read(a);
  const B = PNG.sync.read(b);
  const width = Math.min(A.width, B.width);
  const height = Math.min(A.height, B.height);
  const crop = (img) => {
    if (img.width === width && img.height === height) return img;
    const out = new PNG({ width, height });
    PNG.bitblt(img, out, 0, 0, width, height, 0, 0);
    return out;
  };
  const ca = crop(A);
  const cb = crop(B);
  const diff = new PNG({ width, height });
  const changed = pixelmatch(ca.data, cb.data, diff.data, width, height, { threshold: 0.1 });
  return { ratio: changed / (width * height), diff, heightA: A.height, heightB: B.height };
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const results = [];
  let next = 0;
  async function worker() {
    while (next < pages.length) {
      const p = pages[next++];
      const [orig, port] = await Promise.all([capture(browser, ORIG + "/" + p.file), capture(browser, NEXT + p.legacyPath)]);
      const r = { page: p.file };
      r.title = orig.title === port.title ? "same" : { orig: orig.title, next: port.title };
      r.classes =
        orig.htmlClass === port.htmlClass && orig.bodyClass === port.bodyClass
          ? "same"
          : { orig: [orig.htmlClass, orig.bodyClass], next: [port.htmlClass, port.bodyClass] };
      const ta = normalizeText(orig.text);
      const tb = normalizeText(port.text);
      r.textDiff = textDiff(ta, tb).slice(0, 30);
      const ea = new Set([...orig.errors].map(normalizeMessage));
      const eb = new Set([...port.errors].map(normalizeMessage));
      r.pageErrorsOnlyInNext = [...eb].filter((e) => !ea.has(e));
      r.pageErrorsOnlyInOriginal = [...ea].filter((e) => !eb.has(e));
      const ca = new Set(orig.consoleErrors.map(normalizeMessage));
      const cb = new Set(port.consoleErrors.map(normalizeMessage));
      r.consoleOnlyInNext = [...cb].filter((e) => !ca.has(e)).slice(0, 15);
      r.consoleOnlyInOriginal = [...ca].filter((e) => !cb.has(e)).slice(0, 15);
      r.loadError = orig.loadError || port.loadError ? { orig: orig.loadError, next: port.loadError } : null;
      if (orig.shot && port.shot) {
        const cmp = comparePng(orig.shot, port.shot);
        r.pixelDiff = Number((cmp.ratio * 100).toFixed(3));
        r.heights = cmp.heightA === cmp.heightB ? cmp.heightA : { orig: cmp.heightA, next: cmp.heightB };
        if (cmp.ratio > 0.001 || cmp.heightA !== cmp.heightB) {
          const dir = path.join(OUT, p.file.replace(/\.html$/, ""));
          fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(path.join(dir, "original.png"), orig.shot);
          fs.writeFileSync(path.join(dir, "next.png"), port.shot);
          fs.writeFileSync(path.join(dir, "diff.png"), PNG.sync.write(cmp.diff));
        }
      } else {
        r.pixelDiff = null;
        r.shotError = { orig: orig.shotError, next: port.shotError };
      }
      r.ok =
        r.title === "same" &&
        r.classes === "same" &&
        r.textDiff.length === 0 &&
        r.pageErrorsOnlyInNext.length === 0 &&
        r.consoleOnlyInNext.length === 0 &&
        r.pixelDiff !== null &&
        r.pixelDiff < 0.5 &&
        typeof r.heights === "number";
      results.push(r);
      const flag = r.ok ? "✓" : "✗";
      console.log(
        `${flag} ${p.file.padEnd(46)} px=${r.pixelDiff ?? "?"}% text=${r.textDiff.length} errNext=${r.pageErrorsOnlyInNext.length} consNext=${r.consoleOnlyInNext.length}${typeof r.heights === "object" && r.heights ? ` h=${r.heights.orig}/${r.heights.next}` : ""}`,
      );
    }
  }
  await Promise.all(Array.from({ length: Math.min(WORKERS, pages.length) }, worker));
  await browser.close();
  results.sort((a, b) => a.page.localeCompare(b.page));
  fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(results, null, 2));
  const ok = results.filter((r) => r.ok).length;
  console.log(`\n${ok}/${results.length} pages match (details: ${path.relative(FRONTEND, OUT)}/report.json)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
