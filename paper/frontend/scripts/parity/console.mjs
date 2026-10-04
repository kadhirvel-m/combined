#!/usr/bin/env node
// Prints a page's console errors/warnings, uncaught errors, title and first text.
//   node scripts/parity/console.mjs http://localhost:3000/about.html [waitMs]
import { chromium } from "playwright";

const url = process.argv[2];
const waitMs = Number(process.argv[3] || 4000);
if (!url) {
  console.error("usage: console.mjs <url> [waitMs]");
  process.exit(2);
}
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1366, height: 900 } })).newPage();
page.on("console", (m) => {
  if (["error", "warning"].includes(m.type())) console.log(`[${m.type()}]`, m.text().slice(0, 3000));
});
page.on("pageerror", (e) => console.log("[pageerror]", String(e.stack || e).slice(0, 1500)));
page.on("requestfailed", (r) => {
  if (!/:(8000|10000)\//.test(r.url())) console.log("[requestfailed]", r.url(), r.failure()?.errorText);
});
await page.goto(url, { waitUntil: "load", timeout: 60000 }).catch((e) => console.log("[goto]", e.message.split("\n")[0]));
await page.waitForTimeout(waitMs);
console.log("TITLE:", await page.title());
console.log("TEXT:", (await page.evaluate(() => document.body.innerText)).slice(0, 400).replace(/\n+/g, " | "));
await browser.close();
