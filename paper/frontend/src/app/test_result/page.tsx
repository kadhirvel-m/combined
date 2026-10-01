// Converted from ui/test_result.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/test_result/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Paper X - Test Result",
};

export default function TestResultPage() {
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
      <script src="/_legacy/test_result/script-01.js" />
      <link rel="stylesheet" href="/_legacy/test_result/style-01.css" />
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
            <a
              id="backToTest"
              href="./tests.html"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5"
            >
              {" "}
              <span className="material-symbols-rounded text-base">
                arrow_back
              </span>
              {" Back "}
            </a>
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
        <section className="glass-card p-6 md:p-7">
          <div className="flex items-start gap-3">
            <div className="size-12 rounded-2xl bg-gradient-to-br from-brand-500/25 to-brand-700/20 grid place-items-center text-brand-700 dark:text-fuchsia-100">
              <span className="material-symbols-rounded text-2xl">
                emoji_events
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h1 id="title" className="text-2xl md:text-3xl font-bold tracking-tight">
                Your Test Result
              </h1>
              <p id="subtitle" className="text-sm text-neutral-600 dark:text-white/70 mt-1" />
            </div>
          </div>
          <p id="error" className="hidden mt-3 text-sm text-red-600 dark:text-red-400" />
        </section>
        <section id="studentView" className="hidden space-y-6">
          <section className="glass-card p-5 md:p-6">
            <div className="grid gap-5 md:grid-cols-[auto_1fr] items-center">
              <div id="donut" className="donut" />
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="pill">
                    {"Score: "}
                    <span id="scoreText" className="font-bold" />
                  </span>
                  {" "}
                  <span className="pill">
                    {"Accuracy: "}
                    <span id="accText" className="font-bold" />
                  </span>
                  {" "}
                  <span id="rankPill" className="pill hidden">
                    {"Rank: "}
                    <span id="rankText" className="font-bold" />
                  </span>
                  {" "}
                  <span id="timePill" className="pill">
                    {"Time spent: "}
                    <span id="timeText" className="font-bold" />
                  </span>
                </div>
                <h2 id="statusMessage" className="text-xl font-bold" />
                <p className="text-sm text-neutral-600 dark:text-white/70">
                  Focus on weak areas first, then retake for improvement.
                </p>
              </div>
            </div>
          </section>
          <section className="grid gap-6 lg:grid-cols-2">
            <article className="glass-card p-5 md:p-6">
              <h3 className="text-sm uppercase tracking-wide text-neutral-500 dark:text-white/60">
                Strong Areas
              </h3>
              <div id="strongSimple" className="mt-3 space-y-2.5" />
            </article>
            <article className="glass-card p-5 md:p-6">
              <h3 className="text-sm uppercase tracking-wide text-neutral-500 dark:text-white/60">
                Weak Areas
              </h3>
              <div id="weakSimple" className="mt-3 space-y-2.5" />
            </article>
          </section>
          <section className="glass-card p-5 md:p-6">
            <h3 className="text-sm uppercase tracking-wide text-neutral-500 dark:text-white/60">
              Next Steps
            </h3>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <a
                id="btnRevise"
                href="./notes_generator.html"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-sm hover:bg-brand-700"
              >
                {" "}
                <span className="material-symbols-rounded">
                  menu_book
                </span>
                {" Revise Weak Topics "}
              </a>
              {" "}
              <a
                id="btnRetake"
                href="./test_take.html"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl ring-1 ring-black/10 dark:ring-white/15 text-sm hover:bg-black/5 dark:hover:bg-white/10"
              >
                {" "}
                <span className="material-symbols-rounded">
                  restart_alt
                </span>
                {" Retake Test "}
              </a>
              {" "}
              <a
                id="btnBlink"
                href="./syllabus_blink.html"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl ring-1 ring-black/10 dark:ring-white/15 text-sm hover:bg-black/5 dark:hover:bg-white/10"
              >
                {" "}
                <span className="material-symbols-rounded">
                  bolt
                </span>
                {" View Blink Diagram "}
              </a>
              {" "}
              <a
                id="btnDetailed"
                href="#"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl ring-1 ring-black/10 dark:ring-white/15 text-sm hover:bg-black/5 dark:hover:bg-white/10"
              >
                {" "}
                <span className="material-symbols-rounded">
                  insights
                </span>
                {" View Detailed Analysis "}
              </a>
            </div>
          </section>
          <section className="glass-card p-5 md:p-6">
            <h3 className="text-sm uppercase tracking-wide text-neutral-500 dark:text-white/60">
              Question Review
            </h3>
            <div id="questionsSimple" className="mt-4 space-y-3" />
          </section>
        </section>
        <section id="detailedView" className="hidden space-y-6">
          <section className="glass-card p-5 md:p-6">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm uppercase tracking-wide text-neutral-500 dark:text-white/60">
                Detailed Analysis
              </h3>
              {" "}
              <a
                id="btnBackSimple"
                href="#"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ring-1 ring-black/10 dark:ring-white/15 text-xs hover:bg-black/5 dark:hover:bg-white/10"
              >
                {" "}
                <span className="material-symbols-rounded text-base">
                  arrow_back
                </span>
                {" Back to Simple View "}
              </a>
            </div>
            <p id="evidencePolicy" className="mt-2 text-xs text-neutral-500 dark:text-white/55" />
          </section>
          <section className="grid gap-6 xl:grid-cols-2">
            <article className="glass-card p-5 md:p-6">
              <h4 className="text-sm uppercase tracking-wide text-neutral-500 dark:text-white/60">
                CO Analytics
              </h4>
              <div id="coBars" className="mt-4 space-y-3" />
            </article>
            <article className="glass-card p-5 md:p-6">
              <h4 className="text-sm uppercase tracking-wide text-neutral-500 dark:text-white/60">
                K-Level Analytics
              </h4>
              <div id="kBars" className="mt-4 space-y-3" />
            </article>
          </section>
          <section className="grid gap-6 xl:grid-cols-2">
            <article className="glass-card p-5 md:p-6">
              <h4 className="text-sm uppercase tracking-wide text-neutral-500 dark:text-white/60">
                Strong Areas (Detailed)
              </h4>
              <div id="strongDetailed" className="mt-4 space-y-2.5" />
            </article>
            <article className="glass-card p-5 md:p-6">
              <h4 className="text-sm uppercase tracking-wide text-neutral-500 dark:text-white/60">
                Weak Areas (Detailed)
              </h4>
              <div id="weakDetailed" className="mt-4 space-y-2.5" />
            </article>
          </section>
          <section className="glass-card p-5 md:p-6">
            <h4 className="text-sm uppercase tracking-wide text-neutral-500 dark:text-white/60">
              Learning Plan
            </h4>
            <div id="suggestionsDetailed" className="mt-4 space-y-3" />
          </section>
        </section>
      </main>
      <script src="/_legacy/test_result/script-02.js" />
    </LegacyPage>
  );
}
