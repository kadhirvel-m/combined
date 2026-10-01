// Converted from ui/inovateX/idea_setup.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/inovateX/idea_setup/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Project Setup — Smart Idea Engine | InnovateX",
  description: "Tell us what excites you and we'll generate tailored project ideas for you.",
};

export default function InovateXIdeaSetupPage() {
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
      <script src="/_legacy/inovateX/idea_setup/script-01.js" />
      <script src="/_legacy/inovateX/idea_setup/script-02.js" />
      <script src="/_legacy/inovateX/idea_setup/script-03.js" />
      <link rel="stylesheet" href="/_legacy/inovateX/idea_setup/style-01.css" />
      {/* ── original <body> ── */}
      {/* ═══════════════ NAVBAR ═══════════════ */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-brand-900/60 backdrop-blur supports-[backdrop-filter]:saturate-150 border-b border-black/5 dark:border-white/10">
        <div className="container flex items-center justify-between py-4 max-w-5xl mx-auto px-4">
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
              className="rounded-full px-3 py-2 bg-brand-500/10 text-brand-700 dark:text-brandlt-200 font-semibold"
              href="#"
            >
              Idea Engine
            </a>
          </nav>
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
      </header>
      {/* ═══════════════ HERO ═══════════════ */}
      <section className="hero-aurora border-b border-black/5 dark:border-white/10">
        <div className="orb w-72 h-72 bg-brand-500/30 -top-20 right-10" />
        <div className="orb w-56 h-56 bg-brandlt-400/20 bottom-10 left-1/4" style={{ animationDelay: "5s" }} />
        <div className="relative container max-w-5xl mx-auto px-4 py-12 md:py-16 text-center">
          <div className="inline-flex items-center gap-2 pill-tag mb-5">
            <span className="material-symbols-rounded text-sm">
              auto_awesome
            </span>
            {" Smart Idea Engine "}
          </div>
          {" "}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-3">
            <span className="gradient-hero-text">
              What do you want to build?
            </span>
          </h1>
          <p className="text-neutral-500 dark:text-white/55 text-base md:text-lg max-w-lg mx-auto">
            {" Just tell us what kind of project excites you."}
            <br className="hidden sm:block" />
            {" We'll handle the rest. "}
            <span className="opacity-60">
              No stress, no pressure.
            </span>
          </p>
        </div>
      </section>
      {/* ═══════════════ MAIN FORM ═══════════════ */}
      <main className="max-w-4xl mx-auto px-4 py-10 relative">
        <div className="orb w-80 h-80 bg-brand-500/15 top-20 -right-20" style={{ animationDelay: "2s" }} />
        <div className="orb w-64 h-64 bg-brand-700/15 bottom-32 -left-20" style={{ animationDelay: "6s" }} />
        <div className="relative space-y-8">
          {/* ═══ STEP 1: PROJECT TYPE ═══ */}
          <section className="glass-card rounded-3xl p-6 md:p-8 reveal">
            <div className="flex items-center gap-3 mb-2">
              <span className="step-num">
                1
              </span>
              {" "}
              <h2 className="text-lg font-extrabold">
                What type of project?
              </h2>
            </div>
            <p className="text-sm text-neutral-500 dark:text-white/45 mb-6 ml-10">
              Pick what suits you best.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 ml-0 sm:ml-10" id="typeGrid" />
          </section>
          {/* ═══ STEP 2: DOMAINS / INTERESTS ═══ */}
          <section className="glass-card rounded-3xl p-6 md:p-8 reveal">
            <div className="flex items-center gap-3 mb-2">
              <span className="step-num">
                2
              </span>
              {" "}
              <h2 className="text-lg font-extrabold">
                What domains interest you?
              </h2>
              {" "}
              <span className="sec-badge ml-auto" id="domainBadge">
                0 picked
              </span>
            </div>
            <p className="text-sm text-neutral-500 dark:text-white/45 mb-6 ml-10">
              Select all that excite you — the more you pick, the better your ideas.
            </p>
            <div className="ml-0 sm:ml-10 space-y-5">
              {/* Technology */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-white/25 mb-3">
                  {" 🚀 Technology & Innovation"}
                </p>
                <div className="flex flex-wrap gap-2" id="dom-tech" />
              </div>
              {/* Industry */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-white/25 mb-3">
                  {" 🏭 Industry & Real World"}
                </p>
                <div className="flex flex-wrap gap-2" id="dom-industry" />
              </div>
              {/* Impact */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-white/25 mb-3">
                  {" 🌍 Social Impact"}
                </p>
                <div className="flex flex-wrap gap-2" id="dom-impact" />
              </div>
            </div>
          </section>
          {/* ═══ STEP 3: TEAM SIZE ═══ */}
          <section className="glass-card rounded-3xl p-6 md:p-8 reveal">
            <div className="flex items-center gap-3 mb-2">
              <span className="step-num">
                3
              </span>
              {" "}
              <h2 className="text-lg font-extrabold">
                How big is your team?
              </h2>
            </div>
            <p className="text-sm text-neutral-500 dark:text-white/45 mb-6 ml-10">
              This helps us suggest the right scope and complexity.
            </p>
            <div className="flex gap-3 flex-wrap ml-0 sm:ml-10" id="teamRow" />
          </section>
          {/* ═══ STEP 4: DIFFICULTY ═══ */}
          <section className="glass-card rounded-3xl p-6 md:p-8 reveal">
            <div className="flex items-center gap-3 mb-2">
              <span className="step-num">
                4
              </span>
              {" "}
              <h2 className="text-lg font-extrabold">
                How challenging do you want it?
              </h2>
            </div>
            <p className="text-sm text-neutral-500 dark:text-white/45 mb-6 ml-10">
              No wrong answer — pick what feels right for your level.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 ml-0 sm:ml-10" id="diffGrid" />
          </section>
          {/* ═══ STEP 5: TELL US MORE (optional) ═══ */}
          <section className="glass-card rounded-3xl p-6 md:p-8 reveal">
            <div className="flex items-center gap-3 mb-2">
              <span className="step-num">
                5
              </span>
              {" "}
              <h2 className="text-lg font-extrabold">
                Anything else?
              </h2>
              {" "}
              <span className="sec-badge ml-auto">
                OPTIONAL
              </span>
            </div>
            <p className="text-sm text-neutral-500 dark:text-white/45 mb-5 ml-10">
              {"Specific problems, ideas you've seen, or constraints — this helps the AI tailor ideas for you."}
            </p>
            <div className="ml-0 sm:ml-10">
              <textarea
                id="extraContext"
                maxLength={800}
                rows={4}
                className="w-full px-5 py-4 rounded-2xl border border-black/8 dark:border-white/10 bg-white/40 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-brand-500/30 resize-none text-sm leading-relaxed transition"
                placeholder={"e.g. I want to build something related to campus food delivery\ne.g. My department is ECE and I'd love an IoT project\ne.g. Looking for a unique idea I can publish as a paper"}
              />
              {" "}
              <p className="text-right text-[11px] text-neutral-400 dark:text-white/25 mt-1">
                <span id="charCount">
                  0
                </span>
                /800
              </p>
            </div>
          </section>
          {/* ═══ GENERATE ═══ */}
          <div className="text-center py-6 reveal">
            <button
              id="generateBtn"
              className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-brand-500 via-[#B06AB3] to-[#FF7FD1] text-white font-bold text-lg shadow-[0_12px_30px_rgba(158,75,138,0.35)] hover:shadow-[0_20px_40px_rgba(158,75,138,0.5)] hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              <span className="material-symbols-rounded text-2xl">
                rocket_launch
              </span>
              {" Generate My Ideas "}
            </button>
            {" "}
            <p className="text-xs text-neutral-400 dark:text-white/35 mt-4 flex items-center justify-center gap-2">
              <span className="material-symbols-rounded text-sm">
                auto_awesome
              </span>
              {" Powered by Gemini AI • 9 tailored ideas in ~20 seconds "}
            </p>
          </div>
        </div>
      </main>
      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="app-footer py-8 text-center text-sm relative">
        <p className="font-semibold relative z-10">
          PaperX × InnovateX
        </p>
        <p className="opacity-60 mt-1 relative z-10">
          © 2025 PaperX. Smart Idea Engine powered by Gemini AI.
        </p>
      </footer>
      <script src="/_legacy/inovateX/idea_setup/script-04.js" />
    </LegacyPage>
  );
}
