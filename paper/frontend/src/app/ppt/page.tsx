// Converted from ui/ppt/index.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/ppt/index/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "AI Slide Generator — PaperX",
  description: "Generate stunning presentation slides with AI.",
};

export default function PptIndexPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"h-screen font-sans antialiased text-neutral-900 dark:text-white bg-surface-light dark:bg-surface-dark flex flex-col"}}
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
      <script src="/_legacy/ppt/index/script-01.js" />
      <script src="/_legacy/ppt/index/script-02.js" />
      <link rel="stylesheet" href="/_legacy/ppt/index/style-01.css" />
      {/* ── original <body> ── */}
      {/* Animated background */}
      <div className="hero-bg" />
      <div className="grid-pattern" />
      {/* Floating accent shapes */}
      <div
        className="accent-shape w-32 h-32 bg-brand-500"
        style={{ top: "15%", right: "12%", filter: "blur(60px)" }}
      />
      <div
        className="accent-shape w-48 h-48 bg-brand-700"
        style={{ bottom: "20%", left: "8%", filter: "blur(80px)" }}
      />
      <div
        className="accent-shape w-24 h-24 bg-brand-400"
        style={{ top: "60%", right: "30%", filter: "blur(50px)" }}
      />
      {/* ═══ NAVBAR ═══ */}
      <header className="flex-shrink-0 relative z-20 bg-white/40 dark:bg-surface-dark/40 backdrop-blur-2xl border-b border-black/[0.03] dark:border-white/[0.04]">
        <div className="flex items-center justify-between px-4 md:px-6 py-2.5">
          <a href="../index.html" className="flex items-center gap-2.5 group">
            {" "}
            <img
              src="../assets/img/logo-light.svg"
              alt="PaperX"
              className="h-7 w-auto dark:hidden transition-transform group-hover:scale-105"
            />
            {" "}
            <img
              src="../assets/img/logo-dark.svg"
              alt="PaperX"
              className="h-7 w-auto hidden dark:block transition-transform group-hover:scale-105"
            />
            {" "}
            <span className="hidden sm:inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold bg-gradient-to-r from-brand-500 to-brand-600 text-white tracking-widest">
              SLIDES
            </span>
            {" "}
          </a>
          {" "}
          <div className="flex items-center gap-1.5" id="stepDots">
            <span className="step-dot active" data-step="1" />
            {" "}
            <span className="step-dot" data-step="2" />
          </div>
          {" "}
          <button
            data-theme-toggle=""
            className="inline-flex items-center rounded-full p-2 ring-1 ring-black/[0.04] dark:ring-white/[0.06] hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition"
          >
            <span id="themeIcon" className="material-symbols-rounded text-[18px]">
              dark_mode
            </span>
          </button>
        </div>
      </header>
      {/* ═══ MAIN ═══ */}
      <main className="flex-1 flex items-center justify-center overflow-hidden p-4 md:p-6 relative z-10">
        {/* ── STEP 1: INPUT ── */}
        <div id="inputSection" className="w-full max-w-lg anim-fade-scale">
          <div className="glass-card p-6 md:p-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-500 via-brand-400 to-brand-300 flex items-center justify-center shadow-lg">
                  <span className="material-symbols-rounded text-white text-lg">
                    auto_awesome
                  </span>
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white dark:border-surface-dark" />
              </div>
              <div>
                <h1 className="text-lg font-black leading-tight bg-gradient-to-r from-brand-700 via-brand-500 to-brand-400 dark:from-brand-300 dark:via-brand-400 dark:to-brand-500 bg-clip-text text-transparent">
                  {" AI Slide Generator"}
                </h1>
                <p className="text-[10px] text-neutral-400 dark:text-white/30 mt-0.5">
                  Powered by Gemini • Visual-first slides
                </p>
              </div>
            </div>
            {/* Feature pills */}
            <div className="flex flex-wrap gap-1.5 mb-5">
              <span className="feature-pill inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-semibold bg-brand-500/5 dark:bg-brand-500/10 text-brand-500 dark:text-brand-400 ring-1 ring-brand-500/10 dark:ring-brand-500/15">
                {" "}
                <span className="material-symbols-rounded text-[10px]">
                  bolt
                </span>
                {" Parallel Gen "}
              </span>
              {" "}
              <span className="feature-pill inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-semibold bg-brand-500/5 dark:bg-brand-500/10 text-brand-500 dark:text-brand-400 ring-1 ring-brand-500/10 dark:ring-brand-500/15">
                {" "}
                <span className="material-symbols-rounded text-[10px]">
                  edit_note
                </span>
                {" Editable "}
              </span>
              {" "}
              <span className="feature-pill inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-semibold bg-brand-500/5 dark:bg-brand-500/10 text-brand-500 dark:text-brand-400 ring-1 ring-brand-500/10 dark:ring-brand-500/15">
                {" "}
                <span className="material-symbols-rounded text-[10px]">
                  download
                </span>
                {" PDF / PPTX "}
              </span>
              {" "}
              <span className="feature-pill inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-semibold bg-brand-500/5 dark:bg-brand-500/10 text-brand-500 dark:text-brand-400 ring-1 ring-brand-500/10 dark:ring-brand-500/15">
                {" "}
                <span className="material-symbols-rounded text-[10px]">
                  image
                </span>
                {" Visual Slides "}
              </span>
            </div>
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="text-[11px] font-bold mb-1.5 block text-neutral-500 dark:text-white/40 flex items-center gap-1">
                  {" "}
                  <span className="material-symbols-rounded text-[12px] text-brand-500">
                    title
                  </span>
                  {" Presentation Title "}
                  <span className="text-red-400">
                    *
                  </span>
                  {" "}
                </label>
                {" "}
                <input
                  type="text"
                  id="pptTitle"
                  className="px-input"
                  placeholder="e.g. Introduction to Machine Learning"
                  maxLength={200}
                  autoFocus
                />
              </div>
              {/* Description */}
              <div>
                <label className="text-[11px] font-bold mb-1.5 block text-neutral-500 dark:text-white/40 flex items-center gap-1">
                  {" "}
                  <span className="material-symbols-rounded text-[12px] text-brand-400">
                    notes
                  </span>
                  {" Description "}
                  <span className="text-neutral-300 dark:text-white/15 font-normal text-[9px] ml-0.5">
                    optional
                  </span>
                  {" "}
                </label>
                {" "}
                <div
                  id="pptDesc"
                  className="desc-box"
                  contentEditable="true"
                  data-placeholder="Add notes, context, topics to cover, audience..."
                  role="textbox"
                  aria-multiline="true"
                />
              </div>
              {/* Complexity */}
              <div>
                <label className="text-[11px] font-bold mb-2 block text-neutral-500 dark:text-white/40 flex items-center gap-1">
                  {" "}
                  <span className="material-symbols-rounded text-[12px] text-brand-500">
                    tune
                  </span>
                  {" Complexity Level "}
                </label>
                {" "}
                <div className="grid grid-cols-3 gap-2" id="complexityGroup">
                  <button
                    type="button"
                    data-px-onclick="setComplexity('simple', this)"
                    className="complexity-btn active"
                    data-value="simple"
                    data-px=""
                  >
                    <span className="check-dot">
                      <span className="material-symbols-rounded" style={{ fontSize: "9px" }}>
                        check
                      </span>
                    </span>
                    {" "}
                    <span className="material-symbols-rounded text-lg mb-1">
                      school
                    </span>
                    {" "}
                    <span className="text-[11px] font-bold">
                      Simple
                    </span>
                    {" "}
                    <span className="text-[8px] opacity-40 mt-0.5 leading-tight">
                      Beginner friendly
                    </span>
                  </button>
                  {" "}
                  <button
                    type="button"
                    data-px-onclick="setComplexity('medium', this)"
                    className="complexity-btn"
                    data-value="medium"
                    data-px=""
                  >
                    <span className="check-dot">
                      <span className="material-symbols-rounded" style={{ fontSize: "9px" }}>
                        check
                      </span>
                    </span>
                    {" "}
                    <span className="material-symbols-rounded text-lg mb-1">
                      psychology
                    </span>
                    {" "}
                    <span className="text-[11px] font-bold">
                      Medium
                    </span>
                    {" "}
                    <span className="text-[8px] opacity-40 mt-0.5 leading-tight">
                      Balanced depth
                    </span>
                  </button>
                  {" "}
                  <button
                    type="button"
                    data-px-onclick="setComplexity('advanced', this)"
                    className="complexity-btn"
                    data-value="advanced"
                    data-px=""
                  >
                    <span className="check-dot">
                      <span className="material-symbols-rounded" style={{ fontSize: "9px" }}>
                        check
                      </span>
                    </span>
                    {" "}
                    <span className="material-symbols-rounded text-lg mb-1">
                      science
                    </span>
                    {" "}
                    <span className="text-[11px] font-bold">
                      Advanced
                    </span>
                    {" "}
                    <span className="text-[8px] opacity-40 mt-0.5 leading-tight">
                      Expert level
                    </span>
                  </button>
                </div>
              </div>
              {/* Slide count */}
              <div>
                <label className="text-[11px] font-bold mb-2 block text-neutral-500 dark:text-white/40 flex items-center gap-1">
                  {" "}
                  <span className="material-symbols-rounded text-[12px] text-brand-500">
                    view_carousel
                  </span>
                  {" Number of Slides "}
                </label>
                {" "}
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    id="pptCount"
                    min="1"
                    max="12"
                    defaultValue="6"
                    data-px-oninput="updateSlideCount(this.value)"
                    className="flex-1"
                    data-px=""
                  />
                  {" "}
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500/8 to-brand-400/8 dark:from-brand-500/15 dark:to-brand-400/15 flex items-center justify-center flex-shrink-0 ring-1 ring-brand-500/10 dark:ring-brand-500/15">
                    <span
                      id="countLabel"
                      className="font-black text-xl text-brand-500 dark:text-brand-400 tabular-nums"
                    >
                      6
                    </span>
                  </div>
                </div>
              </div>
              {" "}
              {/* Generate */}
              <button
                id="generateBtn"
                data-px-onclick="startGeneration()"
                className="btn-primary w-full flex items-center justify-center gap-2 mt-1"
                data-px=""
              >
                <span className="material-symbols-rounded text-base">
                  auto_awesome
                </span>
                {" Generate Outline "}
              </button>
            </div>
          </div>
        </div>
        {/* ── PROGRESS OVERLAY ── */}
        <div
          id="progressOverlay"
          className="section-hidden absolute inset-0 flex items-center justify-center bg-white/30 dark:bg-surface-dark/40 backdrop-blur-md z-20"
        >
          <div className="glass-card p-7 text-center max-w-xs w-full mx-4">
            <div className="w-12 h-12 rounded-full spinner-brand spinner mx-auto mb-4" />
            <p id="progressText" className="text-sm font-bold mb-3">
              Generating outline...
            </p>
            <div className="h-1.5 rounded-full bg-brand-500/8 dark:bg-white/[0.05] overflow-hidden">
              <div id="progressBar" className="progress-fill" style={{ width: "0%" }} />
            </div>
          </div>
        </div>
        {/* ── STEP 2: OUTLINE ── */}
        <div
          id="outlineSection"
          className="section-hidden w-full max-w-2xl h-full flex flex-col anim-fade-scale"
        >
          <div className="flex items-center justify-between mb-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <button
                data-px-onclick="goBackToInput()"
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-brand-500/8 dark:hover:bg-brand-500/12 transition-colors flex-shrink-0"
                title="Back to input"
                data-px=""
              >
                <span className="material-symbols-rounded text-lg text-neutral-500 dark:text-white/40">
                  arrow_back
                </span>
              </button>
              {" "}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 via-brand-400 to-brand-300 flex items-center justify-center shadow-md flex-shrink-0">
                <span className="material-symbols-rounded text-white text-sm">
                  list_alt
                </span>
              </div>
              <div>
                <h2 className="text-sm font-bold">
                  Content Outline
                </h2>
                <p className="text-[10px] text-neutral-400 dark:text-white/30">
                  Click to edit • Approve to generate slides
                </p>
              </div>
            </div>
            {" "}
            <span
              id="outlineStatus"
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:bg-amber-500/12 dark:text-amber-400"
            >
              {" "}
              <span className="material-symbols-rounded text-[11px]">
                pending
              </span>
              {" Review "}
            </span>
          </div>
          <div id="outlineList" className="outline-scroll flex-1 space-y-2 pr-1 mb-2" />
          {/* Copilot Chat Bar */}
          <div className="copilot-bar" id="copilotBar">
            <div id="copilotMessages" className="copilot-messages" />
            <div className="copilot-input-wrap">
              <span
                className="material-symbols-rounded text-brand-500 text-sm flex-shrink-0"
                style={{ opacity: "0.5" }}
              >
                auto_awesome
              </span>
              {" "}
              <input
                type="text"
                id="copilotInput"
                className="copilot-input"
                placeholder="Ask AI to change the outline... e.g. 'Add a slide about benefits'"
                data-px-onkeydown={"if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendCopilotInstruction()}"}
                data-px=""
              />
              {" "}
              <button
                id="copilotSendBtn"
                className="copilot-send"
                data-px-onclick="sendCopilotInstruction()"
                title="Send"
                data-px=""
              >
                <span className="material-symbols-rounded text-sm">
                  send
                </span>
              </button>
            </div>
          </div>
          <div id="outlineActions" className="flex gap-2.5 flex-shrink-0 mt-2">
            <button
              data-px-onclick="approveOutline()"
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              data-px=""
            >
              <span className="material-symbols-rounded text-base">
                check_circle
              </span>
              {" Approve & Generate "}
            </button>
            {" "}
            <button
              data-px-onclick="regenerateOutline()"
              className="btn-secondary flex-1 flex items-center justify-center gap-2"
              data-px=""
            >
              <span className="material-symbols-rounded text-base">
                refresh
              </span>
              {" Regenerate "}
            </button>
          </div>
        </div>
      </main>
      <script src="/_legacy/ppt/index/script-03.js" />
    </LegacyPage>
  );
}
