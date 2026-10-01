// Converted from ui/inovateX/claimed_ideas.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/inovateX/claimed_ideas/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "My Claimed Ideas — InnovateX",
  description: "View all your claimed project ideas.",
};

export default function InovateXClaimedIdeasPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen font-sans antialiased text-neutral-900 dark:text-white transition-colors"}}
      head={
        <>
          <link rel="icon" type="image/x-icon" href="../assets/img/favicon.svg" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        </>
      }
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <link
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="../assets/css/tailwind.css" />
      <script src="https://cdn.tailwindcss.com" />
      <script src="/config.js" />
      <script src="/_legacy/inovateX/claimed_ideas/script-01.js" />
      <script src="/_legacy/inovateX/claimed_ideas/script-02.js" />
      <script src="/_legacy/inovateX/claimed_ideas/script-03.js" />
      <link rel="stylesheet" href="/_legacy/inovateX/claimed_ideas/style-01.css" />
      {/* ── original <body> ── */}
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-[#1E1E2F]/70 backdrop-blur border-b border-black/5 dark:border-white/10">
        <div className="flex items-center justify-between py-3 max-w-7xl mx-auto px-4">
          <a href="../index.html" className="flex items-center gap-3">
            {" "}
            <img src="../assets/img/logo-light.svg" alt="PaperX" className="h-8 w-auto dark:hidden" />
            {" "}
            <img src="../assets/img/logo-dark.svg" alt="PaperX" className="h-8 w-auto hidden dark:block" />
            {" "}
            <span className="hidden sm:inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-brand-500 to-brand-700 text-white">
              InnovateX
            </span>
            {" "}
          </a>
          {" "}
          <div className="flex items-center gap-2">
            <a
              href="./idea_setup.html"
              className="text-sm font-semibold px-3 py-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              New Idea
            </a>
            {" "}
            <button
              data-theme-toggle=""
              className="rounded-full px-3 py-2 ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              <span className="material-symbols-rounded text-[20px]" id="themeIcon">
                dark_mode
              </span>
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black mb-1">
              My Claimed Ideas
            </h1>
            <p className="text-neutral-500 dark:text-white/50">
              Manage and refine your project portfolio.
            </p>
          </div>
          {" "}
          <a
            href="./idea_setup.html"
            className="px-5 py-2.5 rounded-xl bg-brand-500 text-white font-bold text-sm hover:bg-brand-600 transition shadow-lg shadow-brand-500/20 flex items-center gap-2"
          >
            {" "}
            <span className="material-symbols-rounded">
              add
            </span>
            {"Generate New "}
          </a>
        </div>
        <div id="loading" className="text-center py-20">
          <div className="inline-block w-8 h-8 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mb-3" />
          {" "}
          <p className="font-semibold text-neutral-400">
            Loading projects...
          </p>
        </div>
        <div
          id="grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          style={{ display: "none" }}
        />
        <div id="empty" className="text-center py-20 hidden">
          <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-rounded text-3xl text-neutral-400">
              lightbulb
            </span>
          </div>
          <h3 className="text-lg font-bold mb-2">
            No claimed ideas yet
          </h3>
          <p className="text-neutral-500 mb-6 max-w-sm mx-auto">
            Start by generating some project ideas based on your interests.
          </p>
          {" "}
          <a href="./idea_setup.html" className="text-brand-500 font-bold hover:underline">
            Go to Idea Generator →
          </a>
        </div>
      </main>
      <footer className="py-8 text-center text-xs text-neutral-400 dark:text-white/30 border-t border-black/5 dark:border-white/5 mt-12">
        {" PaperX × InnovateX • Project Portfolio "}
      </footer>
      <script src="/_legacy/inovateX/claimed_ideas/script-04.js" />
    </LegacyPage>
  );
}
