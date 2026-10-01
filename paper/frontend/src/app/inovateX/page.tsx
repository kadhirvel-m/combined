// Converted from ui/inovateX/index.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/inovateX/index/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "InnovateX — Academic Project OS | PaperX",
  description: "InnovateX is the complete end-to-end academic project operating system inside PaperX. From idea to final submission — structured, intelligent, university-aligned.",
};

export default function InovateXIndexPage() {
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
      <script src="/_legacy/inovateX/index/script-01.js" />
      <script src="/_legacy/inovateX/index/script-02.js" />
      <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" defer />
      <link rel="stylesheet" href="/_legacy/inovateX/index/style-01.css" />
      {/* ── original <body> ── */}
      {/* ═════════════════════════ NAVBAR ═════════════════════════ */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-brand-900/60 backdrop-blur supports-[backdrop-filter]:saturate-150 border-b border-black/5 dark:border-white/10">
        <div className="container flex items-center justify-between py-4">
          <a href="../index.html" className="flex items-center gap-3" aria-label="PaperX Home">
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
              href="#hero"
            >
              Home
            </a>
            {" "}
            <a
              className="rounded-full px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10 transition"
              href="#features"
            >
              Features
            </a>
            {" "}
            <a
              className="rounded-full px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10 transition"
              href="#how-it-works"
            >
              How It Works
            </a>
            {" "}
            <a
              className="rounded-full px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10 transition"
              href="#cta"
            >
              Get Started
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <button
              data-theme-toggle=""
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5 transition"
              aria-label="Toggle theme"
            >
              <span className="material-symbols-rounded text-[20px]">
                dark_mode
              </span>
              {" "}
              <span className="hidden sm:block text-xs font-medium">
                Theme
              </span>
            </button>
            {" "}
            <button
              id="mobileNavToggle"
              type="button"
              aria-expanded="false"
              className="md:hidden inline-flex items-center justify-center size-10 rounded-full ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              <span className="material-symbols-rounded" data-icon="">
                menu
              </span>
            </button>
          </div>
        </div>
      </header>
      {/* Mobile nav drawer */}
      <div
        id="mobileNavBackdrop"
        aria-hidden="true"
        className="md:hidden fixed inset-0 z-40 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
      />
      <nav
        id="mobileNavPanel"
        aria-hidden="true"
        className="md:hidden fixed inset-x-4 top-24 z-50 flex flex-col gap-2 max-h-[calc(100vh-6.5rem)] overflow-y-auto rounded-3xl border border-black/10 dark:border-white/10 bg-white/95 dark:bg-brand-900/95 shadow-[0_1.5rem_4rem_-1.5rem_rgba(30,30,47,0.75)] backdrop-blur p-6"
      >
        <a
          href="#hero"
          data-close-mobile-nav=""
          className="rounded-xl px-3 py-2.5 hover:bg-brandlt-100/70 dark:hover:bg-brand-700/20 transition text-sm"
        >
          Home
        </a>
        {" "}
        <a
          href="#features"
          data-close-mobile-nav=""
          className="rounded-xl px-3 py-2.5 hover:bg-brandlt-100/70 dark:hover:bg-brand-700/20 transition text-sm"
        >
          Features
        </a>
        {" "}
        <a
          href="#how-it-works"
          data-close-mobile-nav=""
          className="rounded-xl px-3 py-2.5 hover:bg-brandlt-100/70 dark:hover:bg-brand-700/20 transition text-sm"
        >
          How It Works
        </a>
        {" "}
        <a
          href="#cta"
          data-close-mobile-nav=""
          className="rounded-xl px-3 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-700 rounded-xl text-center"
        >
          Get Started
        </a>
      </nav>
      <main>
        {/* ═════════════════════════ HERO ═════════════════════════ */}
        <section id="hero" className="hero-aurora border-b border-black/5 dark:border-white/10">
          {/* Decorative orbs */}
          <div className="orb w-72 h-72 bg-brand-500/30 -top-20 right-10" />
          <div className="orb w-96 h-96 bg-brand-700/25 top-40 -left-32" style={{ animationDelay: "4s" }} />
          <div
            className="orb w-56 h-56 bg-brandlt-400/20 bottom-10 right-1/3"
            style={{ animationDelay: "8s" }}
          />
          <div className="relative container max-w-6xl py-20 md:py-32 lg:py-40">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center gap-2 pill-tag">
                <span className="material-symbols-rounded text-sm">
                  rocket_launch
                </span>
                {" Part of the PaperX Ecosystem "}
              </div>
              {" "}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.08] tracking-tight">
                <span className="gradient-hero-text">
                  From Zero to
                </span>
                <br />
                {" "}
                <span className="gradient-hero-text">
                  Final Submission
                </span>
              </h1>
              <p className="text-lg md:text-xl text-neutral-600 dark:text-white/65 max-w-2xl mx-auto leading-relaxed">
                {" InnovateX is the complete end-to-end academic project operating system — guiding students from ideation to viva-ready, publication-grade outcomes. "}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <a
                  href="#cta"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-500 via-[#B06AB3] to-[#FF7FD1] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(158,75,138,0.35)] hover:shadow-[0_20px_40px_rgba(158,75,138,0.5)] hover:-translate-y-0.5 transition-all"
                >
                  {" "}
                  <span className="material-symbols-rounded text-lg">
                    bolt
                  </span>
                  {" Get Started Free "}
                </a>
                {" "}
                <a
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-neutral-700 dark:text-white/80 ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/10 transition"
                >
                  {" "}
                  <span className="material-symbols-rounded text-lg">
                    explore
                  </span>
                  {" Explore Features "}
                </a>
              </div>
            </div>
          </div>
        </section>
        {/* ═════════════════════════ STATS BAR ═════════════════════════ */}
        <section className="relative -mt-12 z-10 reveal">
          <div className="container max-w-4xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <div className="stat-pill">
                <span className="text-2xl md:text-3xl font-extrabold gradient-hero-text">
                  10K+
                </span>
                {" "}
                <span className="text-xs text-neutral-500 dark:text-white/50 font-medium">
                  Projects Created
                </span>
              </div>
              <div className="stat-pill">
                <span className="text-2xl md:text-3xl font-extrabold gradient-hero-text">
                  500+
                </span>
                {" "}
                <span className="text-xs text-neutral-500 dark:text-white/50 font-medium">
                  Colleges
                </span>
              </div>
              <div className="stat-pill">
                <span className="text-2xl md:text-3xl font-extrabold gradient-hero-text">
                  95%
                </span>
                {" "}
                <span className="text-xs text-neutral-500 dark:text-white/50 font-medium">
                  Success Rate
                </span>
              </div>
              <div className="stat-pill">
                <span className="text-2xl md:text-3xl font-extrabold gradient-hero-text">
                  4.9★
                </span>
                {" "}
                <span className="text-xs text-neutral-500 dark:text-white/50 font-medium">
                  Student Rating
                </span>
              </div>
            </div>
          </div>
        </section>
        {/* ═════════════════════════ FEATURES ═════════════════════════ */}
        <section id="features" className="py-24 md:py-32 relative">
          <div className="orb w-80 h-80 bg-brand-500/15 top-20 -right-20" style={{ animationDelay: "2s" }} />
          <div className="orb w-64 h-64 bg-brand-700/15 bottom-32 -left-20" style={{ animationDelay: "6s" }} />
          <div className="container max-w-6xl relative">
            <div className="text-center max-w-2xl mx-auto mb-16 reveal">
              <div className="pill-tag mx-auto mb-4">
                <span className="material-symbols-rounded text-sm">
                  auto_awesome
                </span>
                {" Powerful Features "}
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
                <span className="gradient-hero-text">
                  Everything You Need
                </span>
              </h2>
              <p className="mt-4 text-neutral-600 dark:text-white/60 text-base md:text-lg">
                {" A structured academic project lifecycle engine that transforms mandatory college projects into meaningful, career-enhancing outcomes. "}
              </p>
            </div>
            <div className="feature-bento">
              {/* 1. Smart Idea Engine */}
              <article className="glass-card rounded-3xl p-8 span-2 reveal">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="icon-box">
                    <span className="material-symbols-rounded text-[28px]">
                      lightbulb
                    </span>
                  </div>
                  <div className="flex-1 space-y-3">
                    <h3 className="text-xl font-bold">
                      Smart Idea Engine
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-white/60 leading-relaxed">
                      {" Input your department, year, skills, interests, budget, and team size. Receive personalized, feasible, real-world project ideas with clear problem statements, recommended tech stacks, difficulty levels, and future scope — no more copied topics. "}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="pill-tag text-[11px]">
                        AI-Powered
                      </span>
                      {" "}
                      <span className="pill-tag text-[11px]">
                        Personalized
                      </span>
                      {" "}
                      <span className="pill-tag text-[11px]">
                        Feasibility Score
                      </span>
                    </div>
                  </div>
                </div>
              </article>
              {/* 2. Project Workspace */}
              <article className="glass-card rounded-3xl p-8 reveal">
                <div className="space-y-4">
                  <div className="icon-box">
                    <span className="material-symbols-rounded text-[28px]">
                      dashboard_customize
                    </span>
                  </div>
                  <h3 className="text-xl font-bold">
                    Project Workspace
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-white/60 leading-relaxed">
                    {" Dedicated workspace with milestone tracking, Kanban task boards, resource recommendations, and structured weekly implementation roadmaps — know exactly what to build each week. "}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="pill-tag text-[11px]">
                      Milestones
                    </span>
                    {" "}
                    <span className="pill-tag text-[11px]">
                      Task Boards
                    </span>
                  </div>
                </div>
              </article>
              {/* 3. Academic Documentation Suite */}
              <article className="glass-card rounded-3xl p-8 reveal">
                <div className="space-y-4">
                  <div className="icon-box">
                    <span className="material-symbols-rounded text-[28px]">
                      description
                    </span>
                  </div>
                  <h3 className="text-xl font-bold">
                    Documentation Suite
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-white/60 leading-relaxed">
                    {" Auto-generate university-formatted approval PPTs, complete project reports with bonafide certificates & acknowledgements, IEEE/Springer papers, abstracts, and literature surveys. "}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="pill-tag text-[11px]">
                      Auto-Format
                    </span>
                    {" "}
                    <span className="pill-tag text-[11px]">
                      IEEE Ready
                    </span>
                  </div>
                </div>
              </article>
              {/* 4. Research Assistant */}
              <article className="glass-card rounded-3xl p-8 reveal">
                <div className="space-y-4">
                  <div className="icon-box">
                    <span className="material-symbols-rounded text-[28px]">
                      biotech
                    </span>
                  </div>
                  <h3 className="text-xl font-bold">
                    Research Assistant
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-white/60 leading-relaxed">
                    {" Analyze related papers, extract methodologies and research gaps, auto-generate citations, and get innovation angle suggestions to create original contributions — not copied systems. "}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="pill-tag text-[11px]">
                      Gap Analysis
                    </span>
                    {" "}
                    <span className="pill-tag text-[11px]">
                      Citations
                    </span>
                  </div>
                </div>
              </article>
              {/* 5. Viva Simulation */}
              <article className="glass-card rounded-3xl p-8 span-2 reveal">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="icon-box">
                    <span className="material-symbols-rounded text-[28px]">
                      record_voice_over
                    </span>
                  </div>
                  <div className="flex-1 space-y-3">
                    <h3 className="text-xl font-bold">
                      Viva Simulation Mode
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-white/60 leading-relaxed">
                      {" AI-generated questioning based on your project, defense practice sessions, weakness detection, and confidence scoring — ensuring you're fully prepared for internal and external reviews. No more last-minute panicking. "}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="pill-tag text-[11px]">
                        AI Questioning
                      </span>
                      {" "}
                      <span className="pill-tag text-[11px]">
                        Defense Practice
                      </span>
                      {" "}
                      <span className="pill-tag text-[11px]">
                        Confidence Score
                      </span>
                    </div>
                  </div>
                </div>
              </article>
              {/* 6. Faculty Dashboard */}
              <article className="glass-card rounded-3xl p-8 reveal">
                <div className="space-y-4">
                  <div className="icon-box">
                    <span className="material-symbols-rounded text-[28px]">
                      supervisor_account
                    </span>
                  </div>
                  <h3 className="text-xl font-bold">
                    Faculty Dashboard
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-white/60 leading-relaxed">
                    {" Faculty can optionally review, comment, approve milestones, and track student progress — reducing mentoring workload while improving academic quality across batches. "}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="pill-tag text-[11px]">
                      {"Review & Approve"}
                    </span>
                    {" "}
                    <span className="pill-tag text-[11px]">
                      Progress Tracking
                    </span>
                  </div>
                </div>
              </article>
              {/* 7. Portfolio & Beyond */}
              <article className="glass-card rounded-3xl p-8 reveal">
                <div className="space-y-4">
                  <div className="icon-box">
                    <span className="material-symbols-rounded text-[28px]">
                      web
                    </span>
                  </div>
                  <h3 className="text-xl font-bold">
                    {"Portfolio & Beyond"}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-white/60 leading-relaxed">
                    {" Convert completed projects into shareable portfolio pages to boost employability. Adapt submissions for hackathons or academic publications seamlessly. "}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="pill-tag text-[11px]">
                      Portfolio Builder
                    </span>
                    {" "}
                    <span className="pill-tag text-[11px]">
                      Hackathon Ready
                    </span>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>
        {/* ═════════════════════════ HOW IT WORKS ═════════════════════════ */}
        <section
          id="how-it-works"
          className="py-24 md:py-32 border-t border-black/5 dark:border-white/10 relative"
        >
          <div className="orb w-72 h-72 bg-brandlt-400/20 top-10 right-0" style={{ animationDelay: "3s" }} />
          <div className="container max-w-5xl relative">
            <div className="text-center max-w-2xl mx-auto mb-16 reveal">
              <div className="pill-tag mx-auto mb-4">
                <span className="material-symbols-rounded text-sm">
                  route
                </span>
                {" Simple Process "}
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
                <span className="gradient-hero-text">
                  How InnovateX Works
                </span>
              </h2>
              <p className="mt-4 text-neutral-600 dark:text-white/60 text-base md:text-lg">
                {" Four structured phases take you from idea to industry-ready output. "}
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-x-16 gap-y-12">
              {/* Step 1 */}
              <div className="timeline-step flex gap-5 reveal">
                <div className="step-num">
                  1
                </div>
                <div className="space-y-2 pt-1">
                  <h3 className="text-lg font-bold">
                    Choose Your Idea
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-white/60 leading-relaxed">
                    {" Tell us about your department, skills, interest, and budget. Our Smart Idea Engine generates real-world, feasible project ideas with full tech stacks and difficulty ratings. "}
                  </p>
                </div>
              </div>
              {/* Step 2 */}
              <div className="timeline-step flex gap-5 reveal">
                <div className="step-num">
                  2
                </div>
                <div className="space-y-2 pt-1">
                  <h3 className="text-lg font-bold">
                    {"Build & Track"}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-white/60 leading-relaxed">
                    {" Get a dedicated workspace with weekly milestones, task boards, and resource links. Know exactly what to build each week — no confusion, no last-minute rush. "}
                  </p>
                </div>
              </div>
              {/* Step 3 */}
              <div className="timeline-step flex gap-5 reveal">
                <div className="step-num">
                  3
                </div>
                <div className="space-y-2 pt-1">
                  <h3 className="text-lg font-bold">
                    {"Document & Research"}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-white/60 leading-relaxed">
                    {" Auto-generate university-formatted reports, IEEE papers, approval PPTs, literature surveys, and citations. Our Research Assistant finds gaps and suggests innovation angles. "}
                  </p>
                </div>
              </div>
              {/* Step 4 */}
              <div className="timeline-step flex gap-5 reveal">
                <div className="step-num">
                  4
                </div>
                <div className="space-y-2 pt-1">
                  <h3 className="text-lg font-bold">
                    {"Present & Publish"}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-white/60 leading-relaxed">
                    {" Practice with AI Viva Simulation, ace your defense, then convert your project into a portfolio page or submit to hackathons and conferences — all from one platform. "}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* ═════════════════════════ PROBLEMS → SOLUTIONS ═════════════════════════ */}
        <section className="py-24 md:py-32 border-t border-black/5 dark:border-white/10 relative overflow-hidden">
          <div className="orb w-96 h-96 bg-brand-500/10 bottom-0 left-1/4" style={{ animationDelay: "5s" }} />
          <div className="container max-w-6xl relative">
            <div className="text-center max-w-2xl mx-auto mb-16 reveal">
              <div className="pill-tag mx-auto mb-4">
                <span className="material-symbols-rounded text-sm">
                  compare_arrows
                </span>
                {" Before vs After "}
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
                <span className="gradient-hero-text">
                  The InnovateX Difference
                </span>
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
              {/* Without */}
              <div className="glass-card rounded-3xl p-8 reveal border-red-200/50 dark:border-red-500/20">
                <div className="flex items-center gap-3 mb-6">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 text-red-500">
                    {" "}
                    <span className="material-symbols-rounded text-xl">
                      close
                    </span>
                    {" "}
                  </span>
                  {" "}
                  <h3 className="text-lg font-bold text-red-600 dark:text-red-400">
                    Without InnovateX
                  </h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-sm text-neutral-600 dark:text-white/60">
                    <span className="material-symbols-rounded text-red-400 text-lg mt-0.5">
                      sentiment_dissatisfied
                    </span>
                    {" Randomly choosing copied project topics "}
                  </li>
                  <li className="flex items-start gap-3 text-sm text-neutral-600 dark:text-white/60">
                    <span className="material-symbols-rounded text-red-400 text-lg mt-0.5">
                      sentiment_dissatisfied
                    </span>
                    {" Struggling to write reports and format documents "}
                  </li>
                  <li className="flex items-start gap-3 text-sm text-neutral-600 dark:text-white/60">
                    <span className="material-symbols-rounded text-red-400 text-lg mt-0.5">
                      sentiment_dissatisfied
                    </span>
                    {" Panicking before viva with no preparation "}
                  </li>
                  <li className="flex items-start gap-3 text-sm text-neutral-600 dark:text-white/60">
                    <span className="material-symbols-rounded text-red-400 text-lg mt-0.5">
                      sentiment_dissatisfied
                    </span>
                    {" Submitting low-quality, generic work "}
                  </li>
                  <li className="flex items-start gap-3 text-sm text-neutral-600 dark:text-white/60">
                    <span className="material-symbols-rounded text-red-400 text-lg mt-0.5">
                      sentiment_dissatisfied
                    </span>
                    {" Projects that add nothing to your resume "}
                  </li>
                </ul>
              </div>
              {/* With */}
              <div
                className="glass-card rounded-3xl p-8 reveal"
                style={{ borderColor: "rgba(158,75,138,0.2)" }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-500/20 text-green-500">
                    {" "}
                    <span className="material-symbols-rounded text-xl">
                      check
                    </span>
                    {" "}
                  </span>
                  {" "}
                  <h3 className="text-lg font-bold text-green-600 dark:text-green-400">
                    With InnovateX
                  </h3>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-sm text-neutral-600 dark:text-white/60">
                    <span className="material-symbols-rounded text-green-400 text-lg mt-0.5">
                      verified
                    </span>
                    {" AI-curated, unique, feasible project ideas "}
                  </li>
                  <li className="flex items-start gap-3 text-sm text-neutral-600 dark:text-white/60">
                    <span className="material-symbols-rounded text-green-400 text-lg mt-0.5">
                      verified
                    </span>
                    {" Auto-generated, university-formatted documentation "}
                  </li>
                  <li className="flex items-start gap-3 text-sm text-neutral-600 dark:text-white/60">
                    <span className="material-symbols-rounded text-green-400 text-lg mt-0.5">
                      verified
                    </span>
                    {" AI Viva simulation for exam-ready confidence "}
                  </li>
                  <li className="flex items-start gap-3 text-sm text-neutral-600 dark:text-white/60">
                    <span className="material-symbols-rounded text-green-400 text-lg mt-0.5">
                      verified
                    </span>
                    {" Original, research-backed, publication-grade output "}
                  </li>
                  <li className="flex items-start gap-3 text-sm text-neutral-600 dark:text-white/60">
                    <span className="material-symbols-rounded text-green-400 text-lg mt-0.5">
                      verified
                    </span>
                    {" Portfolio-ready projects that boost employability "}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        {/* ═════════════════════════ FEATURE HIGHLIGHTS GRID ═════════════════════════ */}
        <section className="py-24 md:py-32 border-t border-black/5 dark:border-white/10 relative overflow-hidden">
          <div className="container max-w-6xl relative">
            <div className="text-center max-w-2xl mx-auto mb-16 reveal">
              <div className="pill-tag mx-auto mb-4">
                <span className="material-symbols-rounded text-sm">
                  grid_view
                </span>
                {" Built For Students "}
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
                <span className="gradient-hero-text">
                  Not Just a Tool — An OS
                </span>
              </h2>
              <p className="mt-4 text-neutral-600 dark:text-white/60 text-base md:text-lg">
                {" InnovateX covers the entire academic project lifecycle. "}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Mini Feature Cards */}
              <div className="glass-card rounded-2xl p-5 text-center space-y-3 reveal">
                <div className="icon-box mx-auto !w-12 !h-12 !rounded-xl">
                  <span className="material-symbols-rounded text-xl">
                    psychology
                  </span>
                </div>
                <h4 className="font-semibold text-sm">
                  Idea Generation
                </h4>
                <p className="text-xs text-neutral-500 dark:text-white/50">
                  {"Personalized, trend-aware project topics "}
                </p>
              </div>
              <div className="glass-card rounded-2xl p-5 text-center space-y-3 reveal">
                <div className="icon-box mx-auto !w-12 !h-12 !rounded-xl">
                  <span className="material-symbols-rounded text-xl">
                    view_kanban
                  </span>
                </div>
                <h4 className="font-semibold text-sm">
                  Task Boards
                </h4>
                <p className="text-xs text-neutral-500 dark:text-white/50">
                  {"Kanban & milestone tracking"}
                </p>
              </div>
              <div className="glass-card rounded-2xl p-5 text-center space-y-3 reveal">
                <div className="icon-box mx-auto !w-12 !h-12 !rounded-xl">
                  <span className="material-symbols-rounded text-xl">
                    edit_document
                  </span>
                </div>
                <h4 className="font-semibold text-sm">
                  Report Builder
                </h4>
                <p className="text-xs text-neutral-500 dark:text-white/50">
                  Auto-formatted university reports
                </p>
              </div>
              <div className="glass-card rounded-2xl p-5 text-center space-y-3 reveal">
                <div className="icon-box mx-auto !w-12 !h-12 !rounded-xl">
                  <span className="material-symbols-rounded text-xl">
                    slideshow
                  </span>
                </div>
                <h4 className="font-semibold text-sm">
                  PPT Generator
                </h4>
                <p className="text-xs text-neutral-500 dark:text-white/50">
                  {"Approval & review presentations"}
                </p>
              </div>
              <div className="glass-card rounded-2xl p-5 text-center space-y-3 reveal">
                <div className="icon-box mx-auto !w-12 !h-12 !rounded-xl">
                  <span className="material-symbols-rounded text-xl">
                    article
                  </span>
                </div>
                <h4 className="font-semibold text-sm">
                  IEEE Papers
                </h4>
                <p className="text-xs text-neutral-500 dark:text-white/50">
                  Conference-ready research papers
                </p>
              </div>
              <div className="glass-card rounded-2xl p-5 text-center space-y-3 reveal">
                <div className="icon-box mx-auto !w-12 !h-12 !rounded-xl">
                  <span className="material-symbols-rounded text-xl">
                    format_quote
                  </span>
                </div>
                <h4 className="font-semibold text-sm">
                  Smart Citations
                </h4>
                <p className="text-xs text-neutral-500 dark:text-white/50">
                  Auto-referenced bibliography
                </p>
              </div>
              <div className="glass-card rounded-2xl p-5 text-center space-y-3 reveal">
                <div className="icon-box mx-auto !w-12 !h-12 !rounded-xl">
                  <span className="material-symbols-rounded text-xl">
                    mic
                  </span>
                </div>
                <h4 className="font-semibold text-sm">
                  Viva Practice
                </h4>
                <p className="text-xs text-neutral-500 dark:text-white/50">
                  {"AI mock exam & feedback"}
                </p>
              </div>
              <div className="glass-card rounded-2xl p-5 text-center space-y-3 reveal">
                <div className="icon-box mx-auto !w-12 !h-12 !rounded-xl">
                  <span className="material-symbols-rounded text-xl">
                    share
                  </span>
                </div>
                <h4 className="font-semibold text-sm">
                  Portfolio Export
                </h4>
                <p className="text-xs text-neutral-500 dark:text-white/50">
                  Shareable project showcase
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* ═════════════════════════ CTA ═════════════════════════ */}
        <section id="cta" className="py-24 md:py-32 relative overflow-hidden">
          <div className="container max-w-4xl relative">
            <div className="cta-glow rounded-[2rem] p-10 md:p-16 text-center text-white reveal">
              {/* Decorative stripe */}
              <div
                className="absolute inset-0 rounded-[2rem] opacity-20"
                style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.1) 0 2px, transparent 2px 8px)" }}
              />
              <div className="relative space-y-6">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/20 text-sm font-semibold">
                  {" "}
                  <span className="material-symbols-rounded text-base">
                    school
                  </span>
                  {" Free for All PaperX Students "}
                </span>
                {" "}
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight">
                  {" Transform Your Projects"}
                  <br />
                  {"Into Career Assets "}
                </h2>
                <p className="text-white/80 max-w-lg mx-auto text-base md:text-lg leading-relaxed">
                  {" Stop submitting forgettable projects. Start building portfolio-worthy, publication-grade work that gets you noticed. "}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  <a
                    href="../login.html"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-brand-700 shadow-[0_12px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all"
                  >
                    {" "}
                    <span className="material-symbols-rounded text-lg">
                      login
                    </span>
                    {" Start Building Now "}
                  </a>
                  {" "}
                  <a
                    href="../about.html"
                    className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold text-white/90 ring-1 ring-white/25 hover:bg-white/10 transition"
                  >
                    {" "}
                    <span className="material-symbols-rounded text-lg">
                      info
                    </span>
                    {" Learn More "}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      {/* ═════════════════════════ FOOTER ═════════════════════════ */}
      <footer className="app-footer">
        <div className="relative z-10 container max-w-6xl py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src="../assets/img/logo-light.svg" alt="PaperX" className="h-8 w-auto dark:hidden" />
              {" "}
              <img src="../assets/img/logo-dark.svg" alt="PaperX" className="h-8 w-auto hidden dark:block" />
              {" "}
              <span className="text-sm font-semibold opacity-70">
                InnovateX
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a href="../index.html" className="hover:underline">
                PaperX Home
              </a>
              {" "}
              <a href="../about.html" className="hover:underline">
                About
              </a>
              {" "}
              <a href="../contact.html" className="hover:underline">
                Contact
              </a>
              {" "}
              <a href="../dashboard.html" className="hover:underline">
                Dashboard
              </a>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-black/10 dark:border-white/10 text-center">
            <p className="text-xs opacity-60">
              © 2026 PaperX. All rights reserved. InnovateX is part of the PaperX ecosystem.
            </p>
          </div>
        </div>
      </footer>
      {/* ═════════════════════════ SCRIPTS ═════════════════════════ */}
      <script src="/_legacy/inovateX/index/script-03.js" />
    </LegacyPage>
  );
}
