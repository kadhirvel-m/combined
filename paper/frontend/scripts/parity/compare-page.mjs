#!/usr/bin/env node
// Side-by-side visual check of one original ui/ page against its React rebuild.
//
//   node scripts/parity/compare-page.mjs --orig about.html --next /about.html \
//        [--mock fixtures.json] [--dark] [--mobile] [--full] [--wait 2500] \
//        [--storage '{"px_theme":"dark"}'] [--actions actions.mjs] [--out dir]
//
// --mock    JSON file: { "<METHOD> <url-substring or /regex/>": { "status": 200, "json": {...} } | {...body} }
//           Applied to BOTH pages, so data-driven UI can be compared without a
//           real login. Unmatched backend calls (API origin :8000/:10000) get 401.
// --storage localStorage entries to seed before load (both pages).
// --cookies cookies to set on both origins, e.g. '{"paperx_auth":"1"}' (the
//           non-HttpOnly marker that makes the auth runtime treat the visitor
//           as signed in, so signed-in pages render with --mock data).
// --actions ESM module exporting `default async (page) => {}` run on both pages
//           before the screenshot (open a menu, fill a form, switch a tab…).
// Output: <out>/original.png, next.png, diff.png, side-by-side.png + a JSON
// summary on stdout (pixel diff %, heights, console errors per side).

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

const args = process.argv.slice(2);
const arg = (f, d) => (args.includes(f) ? args[args.indexOf(f) + 1] : d);
const flag = (f) => args.includes(f);

const ORIG_BASE = arg("--orig-base", "http://127.0.0.1:5500");
const NEXT_BASE = arg("--next-base", "http://localhost:3000");
const origPath = arg("--orig");
const nextPath = arg("--next", origPath ? "/" + origPath : undefined);
if (!origPath) {
  console.error("usage: compare-page.mjs --orig <ui file> --next <url path> [options]");
  process.exit(2);
}
const out = path.resolve(arg("--out", path.join(".parity-pages", origPath.replace(/\.html$/, "") + (flag("--dark") ? "-dark" : "") + (flag("--mobile") ? "-mobile" : ""))));
const mocks = arg("--mock") ? JSON.parse(fs.readFileSync(arg("--mock"), "utf8")) : {};
const storage = arg("--storage") ? JSON.parse(arg("--storage")) : {};
const cookies = arg("--cookies") ? JSON.parse(arg("--cookies")) : {};
const actionsMod = arg("--actions") ? (await import(pathToFileURL(path.resolve(arg("--actions"))).href)).default : null;
const viewport = flag("--mobile") ? { width: 390, height: 844 } : { width: 1366, height: 900 };
const waitMs = Number(arg("--wait", 2500));

function matchMock(method, url) {
  for (const [key, value] of Object.entries(mocks)) {
    const [m, ...rest] = key.split(" ");
    const pattern = rest.join(" ");
    if (m !== "*" && m.toUpperCase() !== method) continue;
    const hit = pattern.startsWith("/") && pattern.endsWith("/") && pattern.length > 2 ? new RegExp(pattern.slice(1, -1)).test(url) : url.includes(pattern);
    if (hit) return value && typeof value === "object" && "status" in value && ("json" in value || "body" in value) ? value : { status: 200, json: value };
  }
  return null;
}

async function shoot(browser, url) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, colorScheme: flag("--dark") ? "dark" : "light", reducedMotion: "reduce" });
  const origin = new URL(url).origin;
  if (Object.keys(cookies).length) {
    await context.addCookies(Object.entries(cookies).map(([name, value]) => ({ name, value: String(value), url: origin })));
  }
  await context.addInitScript(
    ([entries, dark]) => {
      try {
        for (const [k, v] of Object.entries(entries)) localStorage.setItem(k, String(v));
        if (dark && !("px_theme" in entries)) localStorage.setItem("px_theme", "dark");
      } catch {}
      let seed = 42;
      Math.random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0), seed / 4294967296);
    },
    [storage, flag("--dark")],
  );
  const page = await context.newPage();
  await page.clock.setFixedTime(new Date("2026-09-30T10:00:00Z"));
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + String(e.message).split("\n")[0]));
  page.on("console", (m) => m.type() === "error" && errors.push("console: " + m.text().split("\n")[0].slice(0, 300)));
  await page.route("**/*", async (route) => {
    const req = route.request();
    const u = req.url();
    const origin = (() => {
      try {
        return new URL(req.frame()?.url() || u).origin;
      } catch {
        return "*";
      }
    })();
    if (req.method() === "OPTIONS" && /:(8000|10000)\//.test(u)) {
      return route.fulfill({
        status: 204,
        headers: {
          "access-control-allow-origin": origin,
          "access-control-allow-credentials": "true",
          "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
          "access-control-allow-headers": req.headers()["access-control-request-headers"] || "*",
        },
      });
    }
    const mock = matchMock(req.method(), u);
    if (mock) {
      return route.fulfill({
        status: mock.status ?? 200,
        contentType: mock.contentType ?? "application/json",
        body: mock.body ?? JSON.stringify(mock.json ?? {}),
        headers: { "access-control-allow-origin": origin, "access-control-allow-credentials": "true" },
      });
    }
    if (/:(8000|10000)\//.test(u)) {
      return route.fulfill({ status: 401, contentType: "application/json", body: '{"detail":"Unauthorized"}', headers: { "access-control-allow-origin": origin, "access-control-allow-credentials": "true" } });
    }
    return route.continue();
  });
  await page.goto(url, { waitUntil: "load", timeout: 60000 }).catch((e) => errors.push("goto: " + e.message.split("\n")[0]));
  await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
  if (actionsMod) await actionsMod(page).catch((e) => errors.push("actions: " + e.message));
  await page.waitForTimeout(waitMs);
  await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}" }).catch(() => {});
  const shot = await page.screenshot({ fullPage: flag("--full"), animations: "disabled", timeout: 60000 }).catch(() => null);
  await context.close();
  return { shot, errors };
}

const browser = await chromium.launch();
const [a, b] = await Promise.all([shoot(browser, ORIG_BASE + "/" + origPath), shoot(browser, NEXT_BASE + nextPath)]);
await browser.close();
fs.mkdirSync(out, { recursive: true });
const result = { out, origErrors: a.errors, nextErrors: b.errors };
if (a.shot && b.shot) {
  fs.writeFileSync(path.join(out, "original.png"), a.shot);
  fs.writeFileSync(path.join(out, "next.png"), b.shot);
  const A = PNG.sync.read(a.shot);
  const B = PNG.sync.read(b.shot);
  const w = Math.min(A.width, B.width);
  const h = Math.min(A.height, B.height);
  const crop = (img) => {
    if (img.width === w && img.height === h) return img;
    const o = new PNG({ width: w, height: h });
    PNG.bitblt(img, o, 0, 0, w, h, 0, 0);
    return o;
  };
  const diff = new PNG({ width: w, height: h });
  const changed = pixelmatch(crop(A).data, crop(B).data, diff.data, w, h, { threshold: 0.12 });
  fs.writeFileSync(path.join(out, "diff.png"), PNG.sync.write(diff));
  const side = new PNG({ width: A.width + B.width + 8, height: Math.max(A.height, B.height) });
  side.data.fill(255);
  PNG.bitblt(A, side, 0, 0, A.width, A.height, 0, 0);
  PNG.bitblt(B, side, 0, 0, B.width, B.height, A.width + 8, 0);
  fs.writeFileSync(path.join(out, "side-by-side.png"), PNG.sync.write(side));
  Object.assign(result, { pixelDiffPercent: Number(((changed / (w * h)) * 100).toFixed(2)), heights: { original: A.height, next: B.height } });
}
console.log(JSON.stringify(result, null, 2));
