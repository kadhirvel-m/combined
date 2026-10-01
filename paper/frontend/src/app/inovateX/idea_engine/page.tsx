// Converted from ui/inovateX/idea_engine.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/inovateX/idea_engine/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Your Project Ideas — Smart Idea Engine | InnovateX",
  description: "AI-generated project ideas tailored to your skills and interests.",
};

export default function InovateXIdeaEnginePage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen font-sans antialiased text-neutral-900 dark:text-white bg-hero-light dark:bg-hero-dark transition-colors"}}
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
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,600,0,0"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="../assets/css/tailwind.css" />
      <script src="https://cdn.tailwindcss.com" />
      <script src="/config.js" />
      <script src="/_legacy/inovateX/idea_engine/script-01.js" />
      <script src="/_legacy/inovateX/idea_engine/script-02.js" />
      <script src="/_legacy/inovateX/idea_engine/script-03.js" />
      <link rel="stylesheet" href="/_legacy/inovateX/idea_engine/style-01.css" />
      {/* ── original <body> ── */}
      {/* ═══════════════ NAVBAR ═══════════════ */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-brand-900/60 backdrop-blur supports-[backdrop-filter]:saturate-150 border-b border-black/5 dark:border-white/10">
        <div className="container flex items-center justify-between py-4 max-w-6xl mx-auto px-4">
          <a href="../index.html" className="flex items-center gap-3">
            {" "}
            <img src="../assets/img/logo-light.svg" alt="PaperX" className="h-9 w-auto dark:hidden" />
            {" "}
            <img src="../assets/img/logo-dark.svg" alt="PaperX" className="h-9 w-auto hidden dark:block" />
            {" "}
            <span className="hidden sm:inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold bg-gradient-to-r from-brand-500 to-brand-700 text-white">
              InnovateX
            </span>
            {" "}
          </a>
          {" "}
          <nav className="hidden md:flex items-center gap-1 text-sm text-neutral-700 dark:text-white/85">
            <a
              className="rounded-full px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10 transition"
              href="./index.html"
            >
              Home
            </a>
            {" "}
            <a
              className="rounded-full px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10 transition"
              href="./idea_setup.html"
            >
              Setup
            </a>
            {" "}
            <a
              className="rounded-full px-3 py-2 bg-brand-500/10 text-brand-700 dark:text-brandlt-200 font-semibold"
              href="#"
            >
              Results
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <button
              data-px-onclick="window.location.href='./idea_setup.html'"
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold bg-brand-500/10 text-brand-700 dark:text-brandlt-200 hover:bg-brand-500/20 transition"
              data-px=""
            >
              <span className="material-symbols-rounded text-base">
                refresh
              </span>
              {" New Setup "}
            </button>
            {" "}
            <button
              data-theme-toggle=""
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5 transition"
              aria-label="Toggle theme"
            >
              <span className="material-symbols-rounded text-[20px]" id="themeIcon">
                dark_mode
              </span>
            </button>
          </div>
        </div>
      </header>
      {/* ═══════════════ HERO ═══════════════ */}
      <section className="hero-aurora border-b border-black/5 dark:border-white/10">
        <div className="orb w-72 h-72 bg-brand-500/30 -top-20 right-10" />
        <div className="orb w-56 h-56 bg-brandlt-400/20 bottom-10 left-1/4" style={{ animationDelay: "5s" }} />
        <div className="relative container max-w-6xl mx-auto px-4 py-10 md:py-14">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 pill-tag mb-4">
              <span className="material-symbols-rounded text-sm">
                auto_awesome
              </span>
              {" AI-Generated Results "}
            </div>
            {" "}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-3">
              <span className="gradient-hero-text">
                Your Project Ideas
              </span>
            </h1>
            <p className="text-neutral-500 dark:text-white/60 text-base max-w-xl mx-auto" id="heroSubtext">
              {" Generating personalized ideas based on your profile… "}
            </p>
          </div>
          {/* Summary of what user chose */}
          <div
            className="flex flex-wrap items-center justify-center gap-2 mt-4"
            id="summaryBar"
            style={{ display: "none" }}
          />
        </div>
      </section>
      {/* ═══════════════ MAIN CONTENT ═══════════════ */}
      <main className="max-w-6xl mx-auto px-4 py-10 relative min-h-[60vh]">
        <div className="orb w-80 h-80 bg-brand-500/15 top-20 -right-20" style={{ animationDelay: "2s" }} />
        <div className="orb w-64 h-64 bg-brand-700/15 bottom-32 -left-20" style={{ animationDelay: "6s" }} />
        {/* Loading state */}
        <div id="loadingState" className="gen-loading">
          <div className="gen-spinner" />
          <p className="text-lg font-bold mb-2 gen-pulse" id="loadingText">
            Analyzing your profile…
          </p>
          <p className="text-sm text-neutral-400 dark:text-white/40">
            This typically takes 10-20 seconds
          </p>
          <div className="flex gap-2 mt-6">
            <div className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: "0s" }} />
            <div
              className="w-2 h-2 rounded-full bg-brand-500 animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
            <div
              className="w-2 h-2 rounded-full bg-brand-500 animate-bounce"
              style={{ animationDelay: "0.4s" }}
            />
          </div>
        </div>
        {/* Error state */}
        <div id="errorState" style={{ display: "none" }} className="text-center py-16">
          <span className="material-symbols-rounded text-5xl text-red-400 mb-4 block">
            error
          </span>
          {" "}
          <h2 className="text-xl font-bold mb-2">
            Something Went Wrong
          </h2>
          <p className="text-neutral-500 dark:text-white/50 text-sm mb-6" id="errorMsg">
            Failed to generate ideas.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              data-px-onclick="retryGeneration()"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500/10 text-brand-700 dark:text-brandlt-200 font-semibold hover:bg-brand-500/20 transition"
              data-px=""
            >
              <span className="material-symbols-rounded text-base">
                refresh
              </span>
              {" Try Again "}
            </button>
            {" "}
            <a
              href="./idea_setup.html"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl ring-1 ring-black/10 dark:ring-white/15 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              {" "}
              <span className="material-symbols-rounded text-base">
                arrow_back
              </span>
              {" Edit Setup "}
            </a>
          </div>
        </div>
        {/* No setup data state */}
        <div id="noDataState" style={{ display: "none" }} className="text-center py-16">
          <span className="material-symbols-rounded text-5xl text-neutral-300 dark:text-white/20 mb-4 block">
            lightbulb
          </span>
          {" "}
          <h2 className="text-xl font-bold mb-2">
            No Setup Data Found
          </h2>
          <p className="text-neutral-500 dark:text-white/50 text-sm mb-6">
            {"Please configure your project preferences first. "}
          </p>
          {" "}
          <a
            href="./idea_setup.html"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-500 via-[#B06AB3] to-[#FF7FD1] text-white font-semibold shadow-[0_12px_30px_rgba(158,75,138,0.35)] hover:-translate-y-0.5 transition-all"
          >
            {" "}
            <span className="material-symbols-rounded text-lg">
              rocket_launch
            </span>
            {" Go to Setup "}
          </a>
        </div>
        {/* Results grid */}
        <div id="resultsArea" style={{ display: "none" }}>
          {/* Top bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl font-bold">
                <span id="ideaCount">
                  5
                </span>
                {" Ideas Generated"}
              </h2>
              <p className="text-sm text-neutral-500 dark:text-white/50 mt-1">
                {"Click any card for full details • "}
                <span id="aiModel">
                  gemini-3-pro-preview
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                data-px-onclick="retryGeneration()"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500/10 text-brand-700 dark:text-brandlt-200 font-semibold text-sm hover:bg-brand-500/20 transition"
                data-px=""
              >
                <span className="material-symbols-rounded text-base">
                  refresh
                </span>
                {" Regenerate "}
              </button>
              {" "}
              <a
                href="./idea_setup.html"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl ring-1 ring-black/10 dark:ring-white/15 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition"
              >
                {" "}
                <span className="material-symbols-rounded text-base">
                  edit
                </span>
                {" Edit Setup "}
              </a>
            </div>
          </div>
          {/* Ideas grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="ideasGrid" />
        </div>
      </main>
      {/* ═══════════════ DETAIL MODAL ═══════════════ */}
      <div
        className="modal-overlay"
        id="detailModal"
        data-px-onclick="if(event.target===this)closeModal()"
        data-px=""
      >
        <div className="modal-body relative" id="modalContent">
          <button
            data-px-onclick="closeModal()"
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/20 transition z-10"
            data-px=""
          >
            <span className="material-symbols-rounded text-lg">
              close
            </span>
          </button>
          {" "}
          <div id="modalInner" />
        </div>
      </div>
      {/* ═══════════════ CLAIM CONFIRMATION MODAL ═══════════════ */}
      <div
        className="modal-overlay"
        id="claimModal"
        data-px-onclick="if(event.target===this)closeClaimModal()"
        data-px=""
      >
        <div className="modal-body relative" style={{ maxWidth: "520px" }}>
          <button
            data-px-onclick="closeClaimModal()"
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/20 transition z-10"
            data-px=""
          >
            <span className="material-symbols-rounded text-lg">
              close
            </span>
          </button>
          {" "}
          {/* Default state */}
          <div id="claimDefault">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-[#FF7FD1] mx-auto mb-4 flex items-center justify-center">
                <span className="material-symbols-rounded text-3xl text-white">
                  rocket_launch
                </span>
              </div>
              <h2 className="text-xl font-black mb-1">
                Claim This Project?
              </h2>
              <p className="text-sm text-neutral-500 dark:text-white/50">
                {"This will save it to your profile and become "}
                <strong>
                  your project
                </strong>
                .
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/8 mb-6">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-white/30 mb-2">
                {" Selected Idea"}
              </p>
              <h3 className="font-bold text-lg" id="claimTitle" />
              <p className="text-sm text-neutral-500 dark:text-white/50 mt-1" id="claimCategory" />
            </div>
            <div className="flex gap-3">
              <button
                data-px-onclick="closeClaimModal()"
                className="flex-1 py-3 rounded-xl font-semibold ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5 transition text-sm"
                data-px=""
              >
                Cancel
              </button>
              {" "}
              <button
                data-px-onclick="confirmClaim()"
                id="claimConfirmBtn"
                className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-[#10B981] to-[#059669] text-white shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-sm"
                data-px=""
              >
                <span className="material-symbols-rounded text-lg">
                  check_circle
                </span>
                {" Yes, Claim It! "}
              </button>
            </div>
          </div>
          {/* Saving state */}
          <div id="claimSaving" style={{ display: "none" }} className="text-center py-8">
            <div
              className="gen-spinner mb-4"
              style={{ width: "48px", height: "48px", borderWidth: "4px", margin: "0 auto" }}
            />
            <p className="font-bold text-lg mb-1">
              Claiming your project…
            </p>
            <p className="text-sm text-neutral-400 dark:text-white/40">
              Saving to your profile
            </p>
          </div>
        </div>
      </div>
      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="app-footer py-8 text-center text-sm relative">
        <p className="font-semibold relative z-10">
          PaperX × InnovateX
        </p>
        <p className="opacity-60 mt-1 relative z-10">
          © 2025 PaperX. Smart Idea Engine powered by Gemini AI.
        </p>
      </footer>
      <script src="/_legacy/inovateX/idea_engine/script-04.js" />
    </LegacyPage>
  );
}
