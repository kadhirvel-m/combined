#!/usr/bin/env node
// Prints the vertical position/size of matching elements on the original and
// the React page, to find where a layout starts to drift.
//   node scripts/parity/layout-probe.mjs about.html /about.html "section, header, footer, h1, h2, h3"
import { chromium } from "playwright";

const [orig, next, selector = "section, header, footer, main > *"] = process.argv.slice(2);
const mobile = process.argv.includes("--mobile");
const dark = process.argv.includes("--dark");
const browser = await chromium.launch();
const out = [];
for (const url of [`http://127.0.0.1:5500/${orig}`, `http://localhost:3000${next}`]) {
  const ctx = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1366, height: 900 }, colorScheme: dark ? "dark" : "light" });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "load" });
  await page.waitForTimeout(2000);
  out.push(
    await page.evaluate((sel) => {
      return [...document.querySelectorAll(sel)]
        .filter((e) => !e.closest("next-route-announcer, nextjs-portal"))
        .map((e) => {
          const r = e.getBoundingClientRect();
          const label = (e.id ? "#" + e.id : "") + " " + (e.textContent || "").trim().replace(/\s+/g, " ").slice(0, 28);
          return { tag: e.tagName.toLowerCase(), label, top: Math.round(r.top + scrollY), h: Math.round(r.height), w: Math.round(r.width) };
        })
        .filter((e) => e.h > 0);
    }, selector),
  );
  await ctx.close();
}
await browser.close();
const [a, b] = out;
const n = Math.max(a.length, b.length);
for (let i = 0; i < n; i++) {
  const x = a[i], y = b[i];
  const flag = !x || !y || x.top !== y.top || x.h !== y.h ? "≠" : " ";
  const fmt = (e) => (e ? `${e.tag.padEnd(8)} top=${String(e.top).padStart(5)} h=${String(e.h).padStart(5)} w=${String(e.w).padStart(4)} ${e.label}` : "(missing)").padEnd(64);
  console.log(flag, fmt(x), "|", fmt(y));
}
