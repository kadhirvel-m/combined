#!/usr/bin/env node
// Diffs the visible text (innerText, line by line) of an original page and its React rebuild.
//   node scripts/parity/text-diff.mjs contact.html /contact.html [--mobile]
import { chromium } from "playwright";
const [orig, next] = process.argv.slice(2);
const mobile = process.argv.includes("--mobile");
const browser = await chromium.launch();
const texts = [];
for (const url of [`http://127.0.0.1:5500/${orig}`, `http://localhost:3000${next}`]) {
  const page = await (await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1366, height: 900 } })).newPage();
  await page.goto(url, { waitUntil: "load" });
  await page.waitForTimeout(2000);
  texts.push((await page.evaluate(() => document.body.innerText)).split("\n").map((l) => l.replace(/\s+/g, " ").trim()).filter(Boolean));
}
await browser.close();
const [a, b] = texts;
const count = (arr) => arr.reduce((m, l) => m.set(l, (m.get(l) ?? 0) + 1), new Map());
const ca = count(a), cb = count(b);
for (const [l, n] of ca) for (let i = 0; i < n - (cb.get(l) ?? 0); i++) console.log("- " + l);
for (const [l, n] of cb) for (let i = 0; i < n - (ca.get(l) ?? 0); i++) console.log("+ " + l);
