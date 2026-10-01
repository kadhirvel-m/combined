// Converted from ui/leaderboard.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/leaderboard/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Leaderboard - Paper X",
};

export default function LeaderboardPage() {
  return (
    <LegacyPage
      html={{"lang":"en"}}
      body={{"class":"min-h-screen font-sans antialiased text-neutral-900 dark:text-white bg-hero-light dark:bg-hero-dark overflow-x-hidden transition-colors"}}
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <script src="https://cdn.tailwindcss.com" />
      <script src="/_legacy/leaderboard/script-01.js" />
      <link
        href={"https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap"}
        rel="stylesheet"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
      />
      <link rel="stylesheet" href="/_legacy/leaderboard/style-01.css" />
      <script src="/_legacy/leaderboard/script-02.js" />
      <script src="/config.js" />
      <script src="/auth.js" defer />
      {/* ── original <body> ── */}
      {/* Loading Overlay */}
      <div id="pageLoader">
        <dotlottie-wc
          src="https://lottie.host/848055f4-11c7-4032-80e0-d51319c33bca/lF6845uqpU.lottie"
          style={{ width: "200px", height: "200px" }}
          autoplay=""
          loop=""
        />
      </div>
      <script
        src="https://unpkg.com/@dotlottie/player-component@1.0.0/dist/dotlottie-player.mjs"
        type="module"
      />
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-[#1a1a24]/80 backdrop-blur-md saturate-150 border-b border-black/5 dark:border-white/5">
        <div className="container mx-auto flex items-center justify-between py-3 px-4">
          <a href="index.html" className="flex items-center gap-3 shrink-0" aria-label="Paper X Home">
            {" "}
            <img src="assets/img/logo-light.svg" className="h-8 w-auto dark:hidden" alt="Paper X" />
            {" "}
            <img src="assets/img/logo-dark.svg" className="h-8 w-auto hidden dark:block" alt="Paper X" />
            {" "}
          </a>
          {" "}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-700 dark:text-neutral-400">
            <a href="index.html" className="hover:text-neutral-900 dark:hover:text-white transition">
              Home
            </a>
            {" "}
            <a href="wishlist.html" className="hover:text-neutral-900 dark:hover:text-white transition">
              Wishlist
            </a>
            {" "}
            <a href="leaderboard.html" className="text-brand-500 font-bold">
              Leaderboard
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <button
              data-theme-toggle=""
              className="inline-flex items-center justify-center size-9 rounded-full bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-white/10 transition"
            >
              <span className="material-symbols-rounded text-lg">
                dark_mode
              </span>
            </button>
            {" "}
            <a
              id="navProfile"
              href="profile.html"
              className="hidden items-center justify-center size-9 rounded-full overflow-hidden border border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-white/5"
            >
              {" "}
              <img id="navProfileImg" alt="Profile" className="w-full h-full object-cover hidden" />
              {" "}
              <span
                id="navProfileInitial"
                className="text-xs font-bold text-neutral-600 dark:text-neutral-300"
              >
                ME
              </span>
              {" "}
            </a>
            {" "}
            <a
              href="login.html"
              className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-white hover:bg-neutral-100 dark:hover:bg-white/5 rounded-full transition"
            >
              Log in
            </a>
          </div>
        </div>
      </header>
      <main className="container mx-auto py-8 md:py-12 relative px-4">
        {/* Ambient Background Mesh */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-500/10 dark:bg-brand-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-orange-500/10 dark:bg-orange-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-3">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500">
              Hall of Flame
            </span>
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-lg max-w-xl mx-auto mb-6">
            {" Celebrating the most consistent learners burning bright. "}
          </p>
          {/* Mode Toggle */}
          <div className="flex items-center justify-center gap-2">
            <button
              id="btnStudents"
              data-px-onclick="switchMode('students')"
              className="mode-btn px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25"
              data-px=""
            >
              Students
            </button>
            {" "}
            <button
              id="btnOverall"
              data-px-onclick="switchMode('overall')"
              className="mode-btn px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 bg-neutral-100 dark:bg-white/5 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-white/10"
              data-px=""
            >
              Overall
            </button>
          </div>
        </div>
        {/* Content Wrapper */}
        <div className="max-w-4xl mx-auto">
          {/* Podium Section (Top 3) */}
          <div
            id="podiumContainer"
            className="flex flex-col-reverse md:flex-row items-end justify-center gap-4 md:gap-8 mb-12 min-h-[300px]"
          >
            {/* Skeleton for Podium */}
            <div className="w-full h-64 bg-neutral-100 dark:bg-white/5 rounded-3xl animate-pulse" />
          </div>
          {/* List Section (4-10) */}
          <div className="glass-panel rounded-3xl overflow-hidden p-2 md:p-6 min-h-[200px]">
            <div className="flex items-center justify-between px-4 py-2 mb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-500">
                {" Honorable Mentions"}
              </h3>
              <div className="text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-1 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                {" Live "}
              </div>
            </div>
            <div id="listContainer" className="space-y-1">
              {/* Skeleton for List */}
              <div className="space-y-2">
                <div className="h-16 rounded-xl bg-neutral-100 dark:bg-white/5 animate-pulse" />
                <div className="h-16 rounded-xl bg-neutral-100 dark:bg-white/5 animate-pulse" />
                <div className="h-16 rounded-xl bg-neutral-100 dark:bg-white/5 animate-pulse" />
              </div>
            </div>
            <div id="emptyState" className="hidden py-12 text-center">
              <div className="w-16 h-16 bg-neutral-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-rounded text-neutral-400 text-3xl">
                  sentiment_content
                </span>
              </div>
              <p className="text-neutral-500 dark:text-neutral-400">
                No streaks data found yet.
              </p>
            </div>
          </div>
        </div>
      </main>
      <script src="/_legacy/leaderboard/script-03.js" />
    </LegacyPage>
  );
}
