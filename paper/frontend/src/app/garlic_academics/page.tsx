// Converted from ui/garlic_academics.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/garlic_academics/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "GARLIC Autonomous System - Paper X",
  description: "GARLIC autonomous AI study cockpit with ranked execution and explainable insights.",
};

export default function GarlicAcademicsPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen font-sans antialiased text-neutral-900 dark:text-white relative bg-hero-light dark:bg-hero-dark"}}
      head={
        <>
          <link rel="icon" type="image/svg+xml" href="assets/img/favicon.svg" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        </>
      }
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <link
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0..1,0&display=swap"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="assets/css/tailwind.css" />
      <script src="/config.js" />
      <script src="/auth.js" defer />
      <script src="/_legacy/garlic_academics/script-01.js" />
      <link rel="stylesheet" href="/_legacy/garlic_academics/style-01.css" />
      <script type="importmap" dangerouslySetInnerHTML={{ __html: "\n      {\n        \"imports\": {\n          \"three\": \"https://esm.sh/three@0.160.0\",\n          \"postprocessing\": \"https://esm.sh/postprocessing@6.34.3\"\n        }\n      }\n    " }} />
      {/* ── original <body> ── */}
      <div
        id="pixel-blast-bg"
        className="fixed inset-0 pointer-events-none opacity-60 dark:opacity-75"
        style={{ zIndex: "0" }}
      />
      {/* Layer main content on top */}
      <div className="relative z-10">
        {/* ================= NAVBAR (Exact Academics) ================= */}
        <header className="sticky top-4 md:top-6 z-50 px-4">
          <div className="max-w-5xl mx-auto w-full flex items-center justify-between py-2 md:py-2.5 px-4 md:px-5 bg-black/10 dark:bg-black/50 backdrop-blur-md supports-[backdrop-filter]:saturate-150 border border-black/5 dark:border-white/10 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
            <a href="index.html" className="flex items-center gap-3 shrink-0" aria-label="Paper X Home">
              {" "}
              <img src="assets/img/logo-light.svg" className="h-9 w-auto dark:hidden" alt="Paper X" />
              {" "}
              <img src="assets/img/logo-dark.svg" className="h-9 w-auto hidden dark:block" alt="Paper X" />
              {" "}
            </a>
            {" "}
            <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-700 dark:text-white/85">
              <a href="index.html" className="hover:text-brandlt-900 dark:hover:text-white">
                Home
              </a>
              {" "}
              <a
                href="wishlist.html"
                className="hover:text-brandlt-900 dark:hover:text-white inline-flex items-center gap-1"
              >
                <span className="material-symbols-rounded text-base">
                  favorite
                </span>
                Wishlist
              </a>
              {" "}
              <a
                href="history.html"
                className="hover:text-brandlt-900 dark:hover:text-white inline-flex items-center gap-1"
              >
                <span className="material-symbols-rounded text-base">
                  history
                </span>
                History
              </a>
            </nav>
            <div className="hidden md:flex items-center gap-3">
              <div className="hidden md:flex items-center gap-3">
                <button
                  data-theme-toggle=""
                  className="relative flex items-center w-14 h-8 rounded-full bg-black/10 dark:bg-black/40 ring-1 ring-black/10 dark:ring-white/20 transition-colors shrink-0"
                  aria-label="Toggle theme"
                >
                  <span className="absolute left-1 top-1 w-6 h-6 rounded-full bg-white dark:bg-brand-500 shadow-sm transition-transform duration-300 translate-x-0 dark:translate-x-6" />
                  {" "}
                  <div className="relative z-10 w-full flex justify-between px-1.5 pointer-events-none">
                    <span className="material-symbols-rounded text-[15px] font-medium text-brand-700 dark:text-white/40">
                      light_mode
                    </span>
                    {" "}
                    <span className="material-symbols-rounded text-[15px] font-medium text-neutral-400 dark:text-white">
                      dark_mode
                    </span>
                  </div>
                </button>
                {" "}
                <button
                  id="regenBtnNav"
                  type="button"
                  className="inline-flex items-center justify-center size-8 rounded-full ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/10 transition text-neutral-700 dark:text-white/80 hover:text-brand-600 dark:hover:text-brand-400"
                  aria-label="Regenerate GARLIC plan"
                >
                  <span className="material-symbols-rounded text-[18px]">
                    autorenew
                  </span>
                </button>
                {" "}
                <div id="devModeToggleDesktop" className="dev-toggle-wrap hidden">
                  <span className="dev-toggle-label" id="devLabelDesktop">
                    DEV
                  </span>
                  {" "}
                  <label className="dev-toggle" title="Developer Mode">
                    {" "}
                    <input type="checkbox" id="devToggleDesktop" />
                    {" "}
                    <span className="slider" />
                    {" "}
                  </label>
                </div>
                {" "}
                <a
                  href="login.html"
                  className="px-3 py-2 text-sm text-neutral-700 dark:text-white/80 hover:text-brandlt-900 dark:hover:text-white rounded-full"
                >
                  Log in
                </a>
                {" "}
                <a
                  href="signup.html"
                  className="inline-flex items-center justify-center rounded-full bg-brand-500 text-white text-sm font-semibold px-4 py-2.5 hover:shadow-glow transition"
                >
                  Sign up
                </a>
                {" "}
                <a
                  id="navProfile"
                  href="profile.html"
                  title="Profile"
                  className="hidden items-center justify-center w-10 h-10 rounded-full overflow-hidden border border-black/10 dark:border-white/10 bg-white/90 dark:bg-brand-900/60"
                >
                  {" "}
                  <img id="navProfileImg" alt="Profile" className="w-full h-full object-cover hidden" />
                  {" "}
                  <span id="navProfileInitial" className="text-xs font-semibold">
                    ME
                  </span>
                  {" "}
                </a>
                {" "}
                <button
                  id="signOutBtn"
                  type="button"
                  title="Sign out"
                  aria-label="Sign out"
                  className="hidden items-center justify-center size-8 rounded-full border border-black/10 dark:border-white/15 text-neutral-700 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/5 transition"
                >
                  <span className="material-symbols-rounded text-[18px]">
                    logout
                  </span>
                </button>
              </div>
              <div className="md:hidden flex items-center gap-2">
                <button
                  id="mobileSearchBtn"
                  type="button"
                  aria-label="Search"
                  className="inline-flex items-center justify-center size-10 rounded-full ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5 transition"
                >
                  <span className="material-symbols-rounded">
                    search
                  </span>
                </button>
                {" "}
                <button
                  id="navEduEditBtn"
                  type="button"
                  aria-label="Edit education"
                  className="hidden inline-flex items-center justify-center size-10 rounded-full ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5 transition"
                >
                  <span className="material-symbols-rounded">
                    edit
                  </span>
                </button>
                {" "}
                <button
                  type="button"
                  data-theme-toggle=""
                  aria-label="Toggle theme"
                  className="inline-flex items-center justify-center size-10 rounded-full ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5 transition"
                >
                  <span className="material-symbols-rounded">
                    dark_mode
                  </span>
                </button>
                {" "}
                <button
                  id="regenBtnNavMobile"
                  type="button"
                  aria-label="Regenerate GARLIC plan"
                  className="inline-flex items-center justify-center size-10 rounded-full bg-gradient-to-r from-brand-500 to-brand-700 text-white hover:brightness-110 transition"
                >
                  <span className="material-symbols-rounded text-[18px]">
                    autorenew
                  </span>
                </button>
                {" "}
                <div id="devModeToggleMobile" className="dev-toggle-wrap hidden">
                  <label className="dev-toggle" title="Developer Mode">
                    {" "}
                    <input type="checkbox" id="devToggleMobile" />
                    {" "}
                    <span className="slider" />
                    {" "}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="container relative pt-6 md:pt-8 pb-10 space-y-5 md:space-y-6">
          {/* ================= HERO / OVERVIEW (GARLIC) ================= */}
          <section className="relative overflow-hidden p-2 md:p-3 my-12 md:my-20 animate-fadeUp">
            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-3 md:gap-10 items-start relative z-10">
              {/* Left: GARLIC headline + KPIs */}
              <div>
                <div className="inline-flex items-center gap-2 text-brand-700 dark:text-brandlt-200 text-[11px] font-semibold">
                  <span className="material-symbols-rounded text-[14px]">
                    bug_report
                  </span>
                  {" GARLIC AUTONOMOUS COMMAND MODE "}
                </div>
                {" "}
                <div className="mt-3 mb-4 flex items-start gap-4 md:gap-5">
                  <img
                    src="assets/img/garlic-logo.png"
                    alt="GARLIC"
                    className="h-16 md:h-24 w-auto object-contain shrink-0"
                  />
                  {" "}
                  <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.15]">
                    <span className="command-center-gradient bg-gradient-to-r from-brand-500 via-brand-700 to-brand-900 dark:from-brand-300 dark:via-brand-500 dark:to-brand-700 bg-clip-text text-transparent">
                      {"Your Garlic "}
                    </span>
                    {"Operation "}
                    <br />
                    {"Center "}
                  </h1>
                </div>
                <p className="text-sm text-neutral-600 dark:text-white/70 max-w-xl">
                  AI cockpit for high-impact revision with priority-driven daily execution.
                </p>
                {/* KPI cards (4) */}
                <div className="mt-5 md:mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl md:max-w-5xl">
                  <article className="glass-panel kpi-card rounded-2xl p-3 md:p-4 flex flex-col gap-2 ring-1 ring-black/10 dark:ring-white/15 w-full h-[132px]">
                    <p className="text-[10px] md:text-[11px] uppercase tracking-wide text-neutral-600 dark:text-white/60">
                      TOPICS DONE
                    </p>
                    <div className="flex items-end gap-2">
                      <span id="kpiTopicsDone" className="text-xl md:text-2xl font-extrabold">
                        0
                      </span>
                      {" "}
                      <span className="text-[11px] text-neutral-500 dark:text-white/50">
                        {"/ "}
                        <span id="kpiTopicsTotal">
                          0
                        </span>
                      </span>
                    </div>
                    <div className="h-1 rounded-full bg-brand-500/20 overflow-hidden">
                      <div id="kpiTopicsBar" className="h-full w-0 bg-brand-500" />
                    </div>
                  </article>
                  <article className="glass-panel kpi-card rounded-2xl p-3 md:p-4 flex flex-col gap-2 ring-1 ring-black/10 dark:ring-white/15 w-full h-[132px]">
                    <p className="text-[10px] md:text-[11px] uppercase tracking-wide text-neutral-600 dark:text-white/60">
                      COMPLETION
                    </p>
                    <div className="relative h-16 w-16">
                      <div
                        id="kpiCompletionRing"
                        className="absolute inset-0 rounded-full metric-ring"
                        style={{ "--pct": "0", "--ring-color": "#9E4B8A" }}
                      />
                      <div
                        id="kpiCompletion"
                        className="absolute inset-0 flex items-center justify-center text-[13px] font-bold"
                      >
                        0%
                      </div>
                    </div>
                  </article>
                  <article className="glass-panel kpi-card rounded-2xl p-3 md:p-4 flex flex-col gap-2 ring-1 ring-black/10 dark:ring-white/15 w-full h-[132px]">
                    <p className="text-[10px] md:text-[11px] uppercase tracking-wide text-neutral-600 dark:text-white/60">
                      ACTIVE SUBJECTS
                    </p>
                    <p id="kpiActiveSubjects" className="text-3xl md:text-4xl font-bold leading-none">
                      0
                    </p>
                  </article>
                  <article className="glass-panel kpi-card rounded-2xl p-3 md:p-4 flex flex-col gap-2 ring-1 ring-black/10 dark:ring-white/15 w-full h-[132px]">
                    <p className="text-[10px] md:text-[11px] uppercase tracking-wide text-neutral-600 dark:text-white/60">
                      AVG CONFIDENCE
                    </p>
                    <p id="kpiConfidence" className="text-xl font-extrabold">
                      0
                    </p>
                    <div className="h-1 rounded-full bg-brand-500/20 overflow-hidden">
                      <div id="kpiConfidenceBar" className="h-full w-0 bg-brand-500" />
                    </div>
                  </article>
                </div>
              </div>
              {/* Right: Daily execution panel */}
              <div className="relative">
                <div
                  className="glass-panel rounded-3xl p-4 md:p-5 ring-1 ring-black/10 dark:ring-white/15 animate-fadeUp"
                  style={{ animationDelay: ".2s" }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-base md:text-lg font-bold tracking-tight">
                        Daily Execution Panel
                      </h2>
                      <p className="text-[11px] mt-1 text-neutral-600 dark:text-white/70">
                        Top autonomous actions with reasoned ordering.
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        id="estimatedLine"
                        className="text-[11px] md:text-xs font-semibold rounded-full px-2.5 py-1 bg-brand-500/10 text-brand-700 dark:text-brandlt-200"
                      >
                        Estimated Time: --
                      </p>
                    </div>
                  </div>
                  <div id="dailyFocus" className="mt-4 flex flex-col pt-1" />
                </div>
              </div>
            </div>
            <p
              id="statusMsg"
              className="hidden mt-4 text-xs rounded-xl px-3 py-2 ring-1 ring-black/10 dark:ring-white/15 relative z-10"
            />
          </section>
          {/* ================= GARLIC EXAM COMMAND CENTER ================= */}
          <section id="examCommandCenter" className="hidden animate-fadeUp space-y-4 md:space-y-5">
            {/* Header bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulseDot" />
                <h2 className="text-lg md:text-xl font-extrabold tracking-tight">
                  EXAM COMMAND CENTER
                </h2>
                {" "}
                <span
                  id="eccIntensityBadge"
                  className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand-500/15 text-brand-700 dark:text-brandlt-200 ring-1 ring-brand-500/25"
                >
                  EXAM MODE
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  id="eccCountdown"
                  className="text-[11px] font-mono font-bold text-red-600 dark:text-red-400"
                />
                {" "}
                <button
                  id="eccDeactivateBtn"
                  type="button"
                  className="text-[10px] px-2.5 py-1 rounded-full ring-1 ring-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 transition font-semibold"
                >
                  EXIT EXAM MODE
                </button>
              </div>
            </div>
            {/* Row 1: Outcome Panel (4 cards) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {/* Predicted Marks */}
              <article className="glass-panel kpi-card rounded-2xl p-4 ring-1 ring-black/10 dark:ring-white/15 flex flex-col gap-2 relative overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-rounded text-brand-500 text-[16px]">
                    analytics
                  </span>
                  {" "}
                  <p className="text-[10px] uppercase tracking-wider text-neutral-500 dark:text-white/50 font-semibold">
                    PREDICTED MARKS
                  </p>
                </div>
                <div className="flex items-end gap-1">
                  <span
                    id="eccPredictedMarks"
                    className="text-3xl md:text-4xl font-black tabular-nums leading-none"
                  >
                    --
                  </span>
                  {" "}
                  <span className="text-[12px] text-neutral-400 dark:text-white/40 font-semibold mb-0.5">
                    /100
                  </span>
                </div>
                <div id="eccMarksTrend" className="text-[10px] font-bold text-green-600 dark:text-green-400" />
              </article>
              {/* Completion Probability */}
              <article className="glass-panel kpi-card rounded-2xl p-4 ring-1 ring-black/10 dark:ring-white/15 flex flex-col gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-rounded text-brand-500 text-[16px]">
                    pie_chart
                  </span>
                  {" "}
                  <p className="text-[10px] uppercase tracking-wider text-neutral-500 dark:text-white/50 font-semibold">
                    COMPLETION PROB.
                  </p>
                </div>
                <div className="relative h-16 w-16">
                  <div
                    id="eccCompletionRing"
                    className="absolute inset-0 rounded-full metric-ring"
                    style={{ "--pct": "0", "--ring-color": "#9E4B8A" }}
                  />
                  <div
                    id="eccCompletionPct"
                    className="absolute inset-0 flex items-center justify-center text-[14px] font-black"
                  >
                    0%
                  </div>
                </div>
              </article>
              {/* Readiness Score */}
              <article className="glass-panel kpi-card rounded-2xl p-4 ring-1 ring-black/10 dark:ring-white/15 flex flex-col gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-rounded text-brand-500 text-[16px]">
                    psychology
                  </span>
                  {" "}
                  <p className="text-[10px] uppercase tracking-wider text-neutral-500 dark:text-white/50 font-semibold">
                    READINESS
                  </p>
                </div>
                {" "}
                <span
                  id="eccReadinessScore"
                  className="text-3xl md:text-4xl font-black tabular-nums leading-none"
                >
                  --
                </span>
                {" "}
                <span
                  id="eccReadinessLevel"
                  className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400"
                />
              </article>
              {/* Risk Level */}
              <article
                id="eccRiskCard"
                className="glass-panel kpi-card rounded-2xl p-4 ring-1 ring-black/10 dark:ring-white/15 flex flex-col gap-2"
              >
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-rounded text-brand-500 text-[16px]">
                    warning
                  </span>
                  {" "}
                  <p className="text-[10px] uppercase tracking-wider text-neutral-500 dark:text-white/50 font-semibold">
                    RISK LEVEL
                  </p>
                </div>
                {" "}
                <span id="eccRiskLevel" className="text-2xl md:text-3xl font-black uppercase leading-none">
                  LOW
                </span>
                {" "}
                <div
                  id="eccRiskReasons"
                  className="text-[10px] text-neutral-500 dark:text-white/50 leading-tight"
                />
              </article>
            </div>
            {/* Row 2: What-If-You-Stop + Daily Target + Recommendation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              {/* "WHAT IF YOU STOP NOW" */}
              <div className="glass-panel rounded-2xl p-4 ring-1 ring-red-500/20 dark:ring-red-500/30 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 opacity-60" />
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center gap-1.5">
                  <span className="material-symbols-rounded text-[14px]">
                    dangerous
                  </span>
                  {" IF YOU STOP NOW "}
                </h3>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-600 dark:text-white/60">
                      Expected Marks
                    </span>
                    {" "}
                    <span
                      id="eccStopMarks"
                      className="text-sm font-black text-red-600 dark:text-red-400 tabular-nums"
                    >
                      --
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-600 dark:text-white/60">
                      Risk Increase
                    </span>
                    {" "}
                    <span id="eccStopRisk" className="text-sm font-black text-orange-600 dark:text-orange-400">
                      --
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-600 dark:text-white/60">
                      Completion Delay
                    </span>
                    {" "}
                    <span
                      id="eccStopDelay"
                      className="text-sm font-black text-orange-500 dark:text-orange-300"
                    >
                      --
                    </span>
                  </div>
                </div>
              </div>
              {/* Daily Execution Target */}
              <div className="glass-panel rounded-2xl p-4 ring-1 ring-black/10 dark:ring-white/15">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-white/60 flex items-center gap-1.5">
                  <span className="material-symbols-rounded text-[14px] text-brand-500">
                    task_alt
                  </span>
                  {" TODAY'S TARGET "}
                </h3>
                <div className="mt-3 flex items-end gap-2">
                  <span id="eccDailyDone" className="text-3xl font-black tabular-nums leading-none">
                    0
                  </span>
                  {" "}
                  <span className="text-neutral-400 dark:text-white/40 font-bold">
                    /
                  </span>
                  {" "}
                  <span
                    id="eccDailyTarget"
                    className="text-3xl font-black tabular-nums leading-none text-brand-600 dark:text-brand-400"
                  >
                    3
                  </span>
                  {" "}
                  <span className="text-[11px] text-neutral-500 dark:text-white/50 mb-0.5">
                    topics
                  </span>
                </div>
                <div className="mt-3 h-2.5 rounded-full bg-brand-500/15 overflow-hidden">
                  <div
                    id="eccDailyBar"
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700 transition-all duration-700"
                    style={{ width: "0%" }}
                  />
                </div>
                <p
                  id="eccDailyMsg"
                  className="mt-2 text-[11px] font-semibold text-neutral-600 dark:text-white/60"
                />
              </div>
              {/* GARLIC Recommendation */}
              <div className="glass-panel rounded-2xl p-4 ring-1 ring-brand-500/20 dark:ring-brand-500/30 flex flex-col justify-between">
                <div>
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
                    <span className="material-symbols-rounded text-[14px]">
                      auto_awesome
                    </span>
                    {" GARLIC RECOMMENDS "}
                  </h3>
                  <p
                    id="eccRecommendation"
                    className="mt-3 text-[13px] font-semibold leading-snug text-neutral-800 dark:text-white/90"
                  >
                    {"\"Loading intelligence...\""}
                  </p>
                </div>
                <div
                  id="eccAiReasoning"
                  className="mt-3 text-[10px] italic text-neutral-500 dark:text-white/40 leading-relaxed line-clamp-3"
                />
              </div>
            </div>
            {/* Row 3: Exam Mode Status + Next Best Action + Velocity */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              {/* Exam Mode Status Card */}
              <div
                id="eccStatusCard"
                className="glass-panel rounded-2xl p-4 ring-1 ring-black/10 dark:ring-white/15"
              >
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-white/60 flex items-center gap-1.5">
                  <span className="material-symbols-rounded text-[14px] text-brand-500">
                    shield
                  </span>
                  {" EXAM MODE "}
                </h3>
                <div className="mt-3 flex items-center gap-3">
                  <div
                    id="eccModeIcon"
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-brand-500/15"
                  >
                    <span className="material-symbols-rounded text-brand-500 text-[22px]">
                      speed
                    </span>
                  </div>
                  <div>
                    <p id="eccModeName" className="text-lg font-black uppercase">
                      EXAM
                    </p>
                    <p id="eccModeDesc" className="text-[10px] text-neutral-500 dark:text-white/50">
                      Aggressive topic prioritization active
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-[10px]">
                  <span className="material-symbols-rounded text-[12px]">
                    schedule
                  </span>
                  {" "}
                  <span id="eccTimeImpact" className="font-semibold text-neutral-600 dark:text-white/60">
                    --
                  </span>
                </div>
              </div>
              {/* NEXT BEST ACTION BUTTON */}
              <div className="glass-panel rounded-2xl p-4 ring-1 ring-brand-500/30 dark:ring-brand-500/40 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-brand-700/10 dark:from-brand-500/10 dark:to-brand-700/20 pointer-events-none" />
                {" "}
                <span className="material-symbols-rounded text-brand-500 text-[32px] mb-2 relative z-10">
                  rocket_launch
                </span>
                {" "}
                <p className="text-[10px] uppercase tracking-wider font-bold text-neutral-500 dark:text-white/50 mb-2 relative z-10">
                  NEXT BEST ACTION
                </p>
                {" "}
                <button
                  id="eccNextActionBtn"
                  type="button"
                  className="relative z-10 w-full max-w-[220px] py-3 px-5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 text-white font-bold text-sm shadow-glow hover:shadow-ringed hover:scale-[1.02] transition-all duration-300 active:scale-95"
                >
                  {" Continue Optimal Path "}
                </button>
                {" "}
                <p
                  id="eccNextTopic"
                  className="mt-2 text-[11px] font-semibold text-neutral-600 dark:text-white/60 relative z-10 truncate max-w-full"
                />
              </div>
              {/* Learning Velocity */}
              <div className="glass-panel rounded-2xl p-4 ring-1 ring-black/10 dark:ring-white/15">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-white/60 flex items-center gap-1.5">
                  <span className="material-symbols-rounded text-[14px] text-brand-500">
                    trending_up
                  </span>
                  {" LEARNING VELOCITY "}
                </h3>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-neutral-500 dark:text-white/40">
                      Overall
                    </p>
                    <p id="eccVelocityOverall" className="text-xl font-black tabular-nums">
                      0
                    </p>
                    <p className="text-[9px] text-neutral-400 dark:text-white/30">
                      topics/day
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-500 dark:text-white/40">
                      Last 7 days
                    </p>
                    <p id="eccVelocityRecent" className="text-xl font-black tabular-nums">
                      0
                    </p>
                    <p className="text-[9px] text-neutral-400 dark:text-white/30">
                      topics/day
                    </p>
                  </div>
                </div>
                <p id="eccVelocityMsg" className="mt-2 text-[10px] font-semibold leading-snug" />
              </div>
            </div>
            {/* Row 4: Active Insights */}
            <div className="glass-panel rounded-2xl p-4 ring-1 ring-black/10 dark:ring-white/15">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-white/60 flex items-center gap-1.5 mb-3">
                <span className="material-symbols-rounded text-[14px] text-red-500">
                  notification_important
                </span>
                {" ACTIVE INTELLIGENCE ALERTS "}
              </h3>
              <div id="eccInsightsContainer" className="space-y-2" />
            </div>
          </section>
          {/* ================= EXAM MODE ACTIVATION BANNER ================= */}
          <section id="examModeActivator" className="animate-fadeUp">
            <div className="glass-panel rounded-2xl p-5 md:p-6 ring-1 ring-brand-500/20 dark:ring-brand-500/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-500/5 via-transparent to-brand-700/5 pointer-events-none" />
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-brand-500/15 flex items-center justify-center shrink-0">
                    <span className="material-symbols-rounded text-brand-500 text-[24px]">
                      target
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-bold">
                      Activate Exam Intelligence
                    </h3>
                    <p className="text-xs text-neutral-600 dark:text-white/60 mt-0.5">
                      Enter exam date to unlock predictive outcome tracking, risk-based prioritization, and daily target enforcement.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <input
                    id="examDateInput"
                    type="date"
                    className="text-sm px-3 py-2 rounded-lg ring-1 ring-black/10 dark:ring-white/15 bg-white dark:bg-brand-900/60 text-neutral-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {" "}
                  <button
                    id="activateExamBtn"
                    type="button"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 text-white font-bold text-sm shadow-glow hover:shadow-ringed hover:scale-[1.02] transition-all duration-300 active:scale-95"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-rounded text-[16px]">
                        bolt
                      </span>
                      {" Activate"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </section>
          {/* ================= MICRO-DIAGNOSTIC MODAL ================= */}
          <div
            id="microDiagModal"
            className="fixed inset-0 z-[100] hidden flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <div className="glass-panel rounded-3xl p-6 md:p-8 max-w-lg w-[95%] ring-1 ring-black/10 dark:ring-white/15 shadow-card animate-fadeUp">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <span className="material-symbols-rounded text-brand-500">
                    quiz
                  </span>
                  {" Quick Check "}
                </h3>
                {" "}
                <button
                  id="microDiagClose"
                  className="w-8 h-8 rounded-full ring-1 ring-black/10 dark:ring-white/15 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition"
                >
                  <span className="material-symbols-rounded text-[18px]">
                    close
                  </span>
                </button>
              </div>
              <p
                id="microDiagTopic"
                className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 mb-3"
              />
              <p id="microDiagQuestion" className="text-sm font-medium leading-relaxed mb-4" />
              <div id="microDiagOptions" className="space-y-2" />
              <div
                id="microDiagResult"
                className="hidden mt-4 p-3 rounded-xl ring-1 ring-black/10 dark:ring-white/15 text-sm"
              />
            </div>
          </div>
          {/* ================= INTERVENTION ALERT ================= */}
          <div
            id="interventionAlert"
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[90] hidden max-w-md w-[92%]"
          >
            <div className="glass-panel rounded-2xl p-4 ring-2 ring-red-500/40 shadow-card animate-fadeUp">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500/15 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-rounded text-red-500 text-[18px]">
                    emergency
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                    GARLIC INTERVENTION
                  </p>
                  <p id="interventionMsg" className="text-sm font-medium mt-1 leading-relaxed" />
                </div>
                {" "}
                <button
                  id="interventionDismiss"
                  className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition"
                >
                  <span className="material-symbols-rounded text-[16px]">
                    close
                  </span>
                </button>
              </div>
            </div>
          </div>
          <section className="grid grid-cols-1 2xl:grid-cols-[1.3fr_0.7fr] gap-4 md:gap-5">
            <div className="space-y-4">
              {/* Ranked Priority Surface */}
              <div className="glass-panel rounded-3xl ring-1 ring-black/10 dark:ring-white/15 p-4 md:p-5 agent-grid animate-fadeUp">
                <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg md:text-xl font-bold tracking-tight">
                      Priority Surface
                    </h2>
                    <p className="text-xs mt-1 text-neutral-500 dark:text-white/60">
                      Subject → Unit → Topic graph with confidence and status.
                    </p>
                  </div>
                  {" "}
                  <div className="hidden inline-flex items-center rounded-full p-1 ring-1 ring-black/10 dark:ring-white/15 bg-white/70 dark:bg-white/5">
                    <button
                      id="viewGraphBtn"
                      type="button"
                      className="view-mode-btn rounded-full px-3 py-1.5 text-xs font-semibold bg-brand-500 text-white"
                    >
                      Graph
                    </button>
                    {" "}
                    <button
                      id="viewListBtn"
                      type="button"
                      className="view-mode-btn rounded-full px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-white/80"
                    >
                      List
                    </button>
                  </div>
                </div>
                <div id="hierarchyWrap" className="relative z-10 mt-4 space-y-3" />
              </div>
            </div>
            <aside className="space-y-4">
              {/* Insights */}
              <div className="glass-panel rounded-3xl ring-1 ring-black/10 dark:ring-white/15 p-4 md:p-5 animate-fadeUp">
                <h2 className="text-lg md:text-xl font-bold tracking-tight">
                  AI Reasoning
                </h2>
                <p className="mt-1 text-xs uppercase tracking-wide text-neutral-500 dark:text-white/60">
                  GARLIC Insights
                </p>
                <ul id="insightsList" className="mt-3 space-y-2 text-sm list-disc pl-5" />
              </div>
              {/* Status Board */}
              <div className="glass-panel rounded-3xl ring-1 ring-black/10 dark:ring-white/15 p-4 md:p-5 animate-fadeUp">
                <h2 className="text-lg md:text-xl font-bold tracking-tight">
                  Execution Status Board
                </h2>
                <p className="mt-1 text-xs text-neutral-500 dark:text-white/60">
                  Autonomous queue by lifecycle stage.
                </p>
                <div id="statusBoard" className="mt-3 space-y-2" />
              </div>
            </aside>
          </section>
        </main>
        <script src="/_legacy/garlic_academics/script-02.js" />
        <script type="module" dangerouslySetInnerHTML={{ __html: "\n        import { PixelBlast } from './assets/js/pixelBlast.js';\n        \n        document.addEventListener('DOMContentLoaded', () => {\n            const container = document.getElementById('pixel-blast-bg');\n            if (container) {\n                new PixelBlast(container, {\n                    variant: 'square',\n                    pixelSize: 4,\n                    color: '#9E4B8A', // GARLIC Theme brand-500\n                    patternScale: 2,\n                    patternDensity: 1,\n                    pixelSizeJitter: 0,\n                    enableRipples: true,\n                    rippleSpeed: 0.4,\n                    rippleThickness: 0.12,\n                    rippleIntensityScale: 1.5,\n                    liquid: false,\n                    liquidStrength: 0.12,\n                    liquidRadius: 1.2,\n                    liquidWobbleSpeed: 5,\n                    speed: 0.5,\n                    edgeFade: 0.25,\n                    transparent: true\n                });\n            }\n        });\n    " }} />
      </div>
      {/* /relative z-10 wrap */}
    </LegacyPage>
  );
}
