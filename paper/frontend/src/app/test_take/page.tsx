// Converted from ui/test_take.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/test_take/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Paper X — Take Test",
};

export default function TestTakePage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen font-sans antialiased text-neutral-900 dark:text-white"}}
      head={
        <>
          <link rel="icon" type="image/x-icon" href="assets/img/favicon.svg" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        </>
      }
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <link
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,600,0,0"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="assets/css/tailwind.css" />
      <script src="/config.js" />
      <script src="/auth.js" defer />
      <script src="/_legacy/test_take/script-01.js" />
      <link rel="stylesheet" href="/_legacy/test_take/style-01.css" />
      {/* ── original <body> ── */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-brand-900/70 backdrop-blur border-b border-black/5 dark:border-white/10">
        <div className="container mx-auto flex items-center justify-between py-3 px-4">
          <a href="./index.html" className="flex items-center gap-3" aria-label="Paper X Home">
            {" "}
            <img src="assets/img/logo-light.svg" className="h-9 w-auto dark:hidden" alt="Paper X" />
            {" "}
            <img src="assets/img/logo-dark.svg" className="h-9 w-auto hidden dark:block" alt="Paper X" />
            {" "}
          </a>
          {" "}
          <div className="flex items-center gap-2">
            <div
              id="navTimer"
              className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold bg-brand-500/15 text-brand-700 dark:text-fuchsia-100 ring-1 ring-brand-500/30"
            >
              <span className="material-symbols-rounded text-base">
                timer
              </span>
              {" "}
              <span id="navTimerText">
                00:00
              </span>
            </div>
            {" "}
            <button
              id="themeToggle"
              className="inline-flex items-center justify-center size-10 rounded-full ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5"
            >
              <span className="material-symbols-rounded">
                dark_mode
              </span>
            </button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 space-y-6">
        <section
          id="hero"
          className="rounded-3xl p-6 md:p-8 ring-1 ring-black/5 dark:ring-white/10 bg-white/80 dark:bg-white/5 shadow-card"
        >
          <div className="flex items-start gap-3">
            <div className="size-12 rounded-2xl bg-gradient-to-br from-brand-500/25 to-brand-700/20 grid place-items-center text-brand-700 dark:text-fuchsia-100">
              <span className="material-symbols-rounded text-2xl">
                quiz
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 id="testTitle" className="text-2xl md:text-3xl font-bold tracking-tight">
                Loading test…
              </h1>
              <p id="testMeta" className="text-sm text-neutral-600 dark:text-white/70" />
            </div>
          </div>
          <p id="testDesc" className="mt-3 text-sm text-neutral-700 dark:text-white/75" />
          <div id="notice" className="mt-3 text-sm text-red-600 dark:text-red-400 hidden" />
        </section>
        <section
          id="testSection"
          className="rounded-3xl p-6 md:p-8 ring-1 ring-black/5 dark:ring-white/10 bg-white/80 dark:bg-white/5 shadow-card"
        >
          <form id="testForm" className="space-y-6" />
          <div className="mt-4 flex items-center gap-3">
            <button
              id="submitBtn"
              className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm hover:bg-brand-700"
            >
              Submit
            </button>
            {" "}
            <button
              id="resetBtn"
              className="px-4 py-2 rounded-lg ring-1 ring-black/5 dark:ring-white/15 text-sm hover:bg-black/5 dark:hover:bg-white/10"
              type="button"
            >
              Clear selections
            </button>
          </div>
          <div id="result" className="mt-4 text-sm font-semibold text-brand-700 dark:text-fuchsia-100" />
        </section>
        <section
          id="alreadyTakenSection"
          className="hidden rounded-3xl p-6 md:p-8 ring-1 ring-black/5 dark:ring-white/10 bg-white/80 dark:bg-white/5 shadow-card"
        >
          <div className="flex items-start gap-3">
            <div className="size-12 rounded-2xl bg-gradient-to-br from-emerald-500/25 to-emerald-700/20 grid place-items-center text-emerald-700 dark:text-emerald-200">
              <span className="material-symbols-rounded text-2xl">
                verified
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold">
                Test already taken
              </h2>
              <p id="alreadyTakenText" className="mt-1 text-sm text-neutral-600 dark:text-white/70" />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div
              id="alreadyTakenScore"
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 bg-brand-500/15 text-brand-700 dark:text-fuchsia-100 ring-1 ring-brand-500/30 text-sm font-semibold"
            />
            {" "}
            <a
              id="viewResultBtn"
              href="#"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm hover:bg-brand-700"
            >
              {" "}
              <span className="material-symbols-rounded">
                insights
              </span>
              {" View detailed result "}
            </a>
          </div>
        </section>
      </main>
      <script src="/_legacy/test_take/script-02.js" />
    </LegacyPage>
  );
}
