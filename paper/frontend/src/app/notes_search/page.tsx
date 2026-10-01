// Converted from ui/notes_search.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/notes_search/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "PaperX — Notes Search",
};

export default function NotesSearchPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth","data-theme":"light"}}
      body={{"class":"min-h-screen page-bg font-sans antialiased text-neutral-900 dark:text-white"}}
      head={
        <>
          <link rel="icon" type="image/svg+xml" href="assets/img/favicon.svg" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        </>
      }
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <script src="/_legacy/notes_search/script-01.js" />
      <link rel="stylesheet" href="assets/css/tailwind.css" />
      <script src="assets/js/analytics-tracker.js" defer />
      <script src="/config.js" />
      <script src="/auth.js" defer />
      <link
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"}
        rel="stylesheet"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0"
      />
      <link rel="stylesheet" href="/_legacy/notes_search/style-01.css" />
      {/* ── original <body> ── */}
      {/* NAVBAR (academicas-style) */}
      <header className="sticky top-0 z-50 nav-glass">
        <div className="mx-auto max-w-6xl px-4 py-3.5 flex items-center justify-between gap-3">
          <a href="index.html" className="flex items-center gap-3 shrink-0" aria-label="Paper X Home">
            {" "}
            <img src="assets/img/logo-light.svg" className="h-9 w-auto dark:hidden" alt="Paper X" />
            {" "}
            <img src="assets/img/logo-dark.svg" className="h-9 w-auto hidden dark:block" alt="Paper X" />
            {" "}
          </a>
          {" "}
          <div className="flex items-center gap-2">
            <a
              href="notes_generator.html"
              className="hidden sm:inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              {" "}
              <span className="material-symbols-rounded text-[18px]">
                auto_stories
              </span>
              {" Notes Generator "}
            </a>
            {" "}
            <button
              type="button"
              data-theme-toggle=""
              aria-label="Toggle theme"
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              <span id="themeIcon" className="material-symbols-rounded text-[18px]">
                dark_mode
              </span>
              {" "}
              <span className="hidden sm:block">
                Theme
              </span>
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10">
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 opacity-[.06] dark:opacity-[.12]"
            style={{ backgroundImage: "radial-gradient(40% 50% at 20% 0%, rgba(158,75,138,0.18), transparent 60%), radial-gradient(40% 60% at 100% 0%, rgba(76,42,89,0.35), transparent 60%)" }}
          />
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-start">
            <div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
                {" Find your "}
                <span className="gradient-hero-text">
                  next topic
                </span>
              </h1>
              <p className="mt-3 text-sm md:text-base text-neutral-600 dark:text-white/70 max-w-xl">
                {" Start typing — suggestions come from your AI notes library. Click a suggestion to open it in Notes Generator in a new tab. "}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs ring-1 ring-black/10 dark:ring-white/15 bg-white/60 dark:bg-white/5 text-neutral-700 dark:text-white/80">
                  {" "}
                  <span className="material-symbols-rounded text-[16px]">
                    keyboard
                  </span>
                  {" "}
                  <span>
                    ↑/↓ to navigate
                  </span>
                  {" "}
                </span>
                {" "}
                <span className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs ring-1 ring-black/10 dark:ring-white/15 bg-white/60 dark:bg-white/5 text-neutral-700 dark:text-white/80">
                  {" "}
                  <span className="material-symbols-rounded text-[16px]">
                    subdirectory_arrow_right
                  </span>
                  {" "}
                  <span>
                    Enter to select
                  </span>
                  {" "}
                </span>
                {" "}
                <span className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs ring-1 ring-black/10 dark:ring-white/15 bg-white/60 dark:bg-white/5 text-neutral-700 dark:text-white/80">
                  {" "}
                  <span className="material-symbols-rounded text-[16px]">
                    open_in_new
                  </span>
                  {" "}
                  <span>
                    Click to open
                  </span>
                  {" "}
                </span>
              </div>
            </div>
            {/* SEARCH CARD */}
            <div className="glass-panel rounded-3xl p-5 md:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-base md:text-lg font-semibold">
                    Search topics
                  </h2>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-white/70">
                    Autocomplete powered by your stored notes
                  </p>
                </div>
                {" "}
                <a
                  href="notes_generator.html"
                  className="btn-brand inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition"
                >
                  {" "}
                  <span className="material-symbols-rounded text-[18px]">
                    auto_awesome
                  </span>
                  {" Generate "}
                </a>
              </div>
              <form id="searchForm" className="mt-5" autoComplete="off">
                <label
                  htmlFor="topicSearch"
                  className="block text-xs font-semibold tracking-wide text-neutral-600 dark:text-white/70"
                >
                  TOPIC
                </label>
                {" "}
                <div className="relative mt-2">
                  <span className="material-symbols-rounded pointer-events-none select-none absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-neutral-500 dark:text-white/55">
                    search
                  </span>
                  {" "}
                  <input
                    id="topicSearch"
                    type="text"
                    placeholder="e.g., Support Vector Machine"
                    className="w-full rounded-2xl pl-16 pr-12 py-3.5 outline-none bg-white/80 dark:bg-white/5 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-white/40 transition"
                  />
                  {" "}
                  <button
                    id="clearBtn"
                    type="button"
                    aria-label="Clear"
                    className="hidden absolute right-3 top-1/2 -translate-y-1/2 size-9 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition flex items-center justify-center"
                  >
                    <span className="material-symbols-rounded text-[20px] text-neutral-500 dark:text-white/55">
                      close
                    </span>
                  </button>
                  {" "}
                  {/* Suggestions dropdown */}
                  <div
                    id="suggestionsWrap"
                    className="hidden absolute left-0 right-0 mt-2 rounded-2xl overflow-hidden ring-1 ring-black/10 dark:ring-white/15 bg-white/90 dark:bg-[#1E1E2F]/90 backdrop-blur-xl shadow-[0_22px_60px_-24px_rgba(30,30,47,0.35)] dark:shadow-[0_24px_80px_-24px_rgba(0,0,0,0.6)]"
                  >
                    <ul id="suggestions" className="max-h-72 overflow-auto" />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
                  <div id="status" className="text-sm text-neutral-600 dark:text-white/70" />
                </div>
                <div className="mt-5 rounded-2xl ring-1 ring-black/10 dark:ring-white/15 bg-white/60 dark:bg-white/5 p-4">
                  <h3 className="text-sm font-semibold">
                    Tip
                  </h3>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-white/70">
                    {" Click any suggestion to open it in a new tab. Or use ↑/↓ then "}
                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-black/5 dark:bg-white/10">
                      Enter
                    </span>
                    {" to select, and press "}
                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-black/5 dark:bg-white/10">
                      Enter
                    </span>
                    {" again to open. "}
                  </p>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>
      <script src="/_legacy/notes_search/script-02.js" />
    </LegacyPage>
  );
}
