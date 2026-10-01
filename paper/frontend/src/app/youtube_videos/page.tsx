// Converted from ui/youtube_videos.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/youtube_videos/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "PaperX — YouTube Video Search",
};

export default function YoutubeVideosPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth","data-theme":"light"}}
      body={{"class":"bg-[var(--surface-dim)] text-[var(--surface-contrast)] min-h-screen font-sans"}}
      head={
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        </>
      }
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <script src="/_legacy/youtube_videos/script-01.js" />
      <script src="https://cdn.tailwindcss.com" />
      <link rel="stylesheet" href="assets/css/tailwind.css" />
      <script src="/_legacy/youtube_videos/script-02.js" />
      <script src="/config.js" />
      <link
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"}
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
        rel="stylesheet"
      />
      <link rel="stylesheet" href="/_legacy/youtube_videos/style-01.css" />
      {/* ── original <body> ── */}
      {/* Background decorations */}
      <div aria-hidden="true" className="fixed inset-0 -z-10 bg-grid-radial opacity-70" />
      {/* Top App Bar */}
      <header
        className="sticky top-0 z-40 border-b backdrop-blur supports-[backdrop-filter]:bg-[color:var(--surface)]/70"
        style={{ borderColor: "var(--outline)" }}
      >
        <div className="glass">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-400 via-brand-500 to-indigo-500 shadow-neon grid place-items-center text-white font-bold tracking-tight">
              {" PX"}
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-semibold tracking-tight leading-tight">
                <a
                  href="index.html"
                  className="hover:underline focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-sm cursor-pointer"
                >
                  {" PaperX — YouTube Videos "}
                </a>
              </h1>
              <p className="text-xs text-[var(--muted)]">
                Search educational videos • Watch • Learn
              </p>
            </div>
            {/* Quick actions */}
            <div className="ml-auto flex items-center gap-2">
              <button
                id="themeBtn"
                className="ripple px-3 py-2 rounded-lg border text-sm hover:bg-[var(--brand-soft)] transition"
                style={{ borderColor: "var(--outline)" }}
                title="Toggle theme"
              >
                Dark
              </button>
            </div>
          </div>
        </div>
      </header>
      {/* Main layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Search Section */}
        <section className="mb-8">
          <div
            className="rounded-2xl glass p-6 border shadow-glow animate-in"
            style={{ borderColor: "var(--outline)", background: "color-mix(in oklab, var(--surface) 75%, transparent)" }}
          >
            <div className="max-w-3xl mx-auto">
              <label className="block text-sm font-medium mb-3">
                Search Topic
              </label>
              {" "}
              <div className="flex gap-3">
                <input
                  id="searchInput"
                  type="text"
                  placeholder="e.g., Machine Learning Tutorial, Python Programming"
                  className="flex-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-500/60 focus:border-brand-500"
                  style={{ borderColor: "var(--outline)", background: "var(--surface)", color: "var(--surface-contrast)" }}
                />
                {" "}
                <button
                  id="searchBtn"
                  className="ripple px-6 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-indigo-500 hover:opacity-95 text-white font-medium shadow-neon transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined align-middle">
                    search
                  </span>
                  {" Search "}
                </button>
              </div>
              {/* Quick suggestions */}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs text-[var(--muted)] mr-2">
                  Popular:
                </span>
                {" "}
                <button className="suggestion-chip" data-query="Data Structures Tutorial">
                  Data Structures
                </button>
                {" "}
                <button className="suggestion-chip" data-query="Web Development Course">
                  Web Dev
                </button>
                {" "}
                <button className="suggestion-chip" data-query="Machine Learning Basics">
                  ML Basics
                </button>
                {" "}
                <button className="suggestion-chip" data-query="Python Programming">
                  Python
                </button>
              </div>
            </div>
          </div>
        </section>
        {/* Results Section */}
        <section id="resultsSection" className="hidden">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {"Results for \""}
              <span id="searchQuery" />
              {"\""}
            </h2>
            <div className="text-sm text-[var(--muted)]">
              <span id="resultsCount">
                0
              </span>
              {" videos found "}
            </div>
          </div>
          {/* Video Carousel */}
          <div className="rounded-2xl glass border shadow-glow p-6" style={{ borderColor: "var(--outline)" }}>
            <div id="videoCarousel" className="carousel">
              {/* Video cards will be inserted here */}
            </div>
          </div>
        </section>
        {/* Loading State */}
        <section id="loadingSection" className="hidden">
          <div className="rounded-2xl glass border shadow-glow p-6" style={{ borderColor: "var(--outline)" }}>
            <div className="flex items-center justify-center gap-3 text-[var(--muted)]">
              <span className="material-symbols-outlined animate-spin">
                progress_activity
              </span>
              {" "}
              <span>
                Searching videos...
              </span>
            </div>
          </div>
        </section>
        {/* Empty State */}
        <section id="emptySection" className="hidden">
          <div
            className="rounded-2xl glass border shadow-glow p-12 text-center"
            style={{ borderColor: "var(--outline)" }}
          >
            <span className="material-symbols-outlined text-6xl text-[var(--muted)] mb-4">
              video_library
            </span>
            {" "}
            <h3 className="text-xl font-semibold mb-2">
              No videos found
            </h3>
            <p className="text-[var(--muted)]">
              Try a different search term
            </p>
          </div>
        </section>
      </main>
      {/* Snackbar */}
      <div
        id="snack"
        className="fixed left-1/2 -translate-x-1/2 bottom-4 px-4 py-2 rounded-xl shadow-glow bg-[var(--surface)] border text-sm hidden"
        style={{ borderColor: "var(--outline)" }}
      />
      <script src="/_legacy/youtube_videos/script-03.js" />
    </LegacyPage>
  );
}
