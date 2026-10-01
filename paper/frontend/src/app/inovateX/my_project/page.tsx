// Converted from ui/inovateX/my_project.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/inovateX/my_project/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "My Project — InnovateX",
  description: "Your claimed project idea with AI Refinement Mentor.",
};

export default function InovateXMyProjectPage() {
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
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,600,0,0"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="../assets/css/tailwind.css" />
      <script src="https://cdn.tailwindcss.com" />
      <script src="/config.js" />
      <script src="/_legacy/inovateX/my_project/script-01.js" />
      <script src="/_legacy/inovateX/my_project/script-02.js" />
      <script src="/_legacy/inovateX/my_project/script-03.js" />
      <link rel="stylesheet" href="/_legacy/inovateX/my_project/style-01.css" />
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
              New Ideas
            </a>
            {" "}
            <button
              data-theme-toggle=""
              className="rounded-full px-3 py-2 ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5 transition"
              aria-label="Toggle theme"
            >
              <span className="material-symbols-rounded text-[20px]" id="themeIcon">
                dark_mode
              </span>
            </button>
          </div>
        </div>
      </header>
      {/* LOADING */}
      <div id="loadingState" className="flex flex-col items-center justify-center py-32">
        <div className="spin mb-4" />
        <p className="font-bold text-lg">
          Loading your project…
        </p>
      </div>
      {/* ERROR */}
      <div id="errorState" style={{ display: "none" }} className="text-center py-32">
        <span className="material-symbols-rounded text-5xl text-red-400 mb-4 block">
          error
        </span>
        {" "}
        <h2 className="text-xl font-bold mb-2">
          Project Not Found
        </h2>
        <p className="text-neutral-500 dark:text-white/50 text-sm mb-6" id="errorMsg" />
        {" "}
        <a
          href="./idea_setup.html"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500/10 text-brand-700 dark:text-[#EFA3DC] font-semibold hover:bg-brand-500/20 transition"
        >
          {" "}
          <span className="material-symbols-rounded text-base">
            arrow_back
          </span>
          {" Generate New Ideas "}
        </a>
      </div>
      {/* MAIN CONTENT (split panel) */}
      <div id="mainContent" style={{ display: "none" }} className="max-w-7xl mx-auto px-4 py-6">
        {/* Project title bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/15">
            {" "}
            <span className="material-symbols-rounded text-sm">
              check_circle
            </span>
            {" "}
            <span id="statusBadge">
              Claimed
            </span>
            {" "}
          </span>
          {" "}
          <span
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-700 dark:text-[#EFA3DC]"
            id="catBadge"
          />
          {" "}
          <span className="text-xs text-neutral-400 font-mono" id="projIdText" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black mb-6">
          <span className="gradient-text" id="projTitle" />
        </h1>
        {/* SPLIT LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* LEFT: Project Overview (2/5) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Problem */}
            <div className="glass rounded-2xl p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 mb-2 flex items-center gap-1">
                <span className="material-symbols-rounded text-sm">
                  report_problem
                </span>
                {"Problem "}
              </h3>
              <p className="text-sm leading-relaxed text-neutral-600 dark:text-white/65" id="detProblem" />
            </div>
            {/* Solution */}
            <div className="glass rounded-2xl p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-green-500 mb-2 flex items-center gap-1">
                <span className="material-symbols-rounded text-sm">
                  lightbulb
                </span>
                {"Solution "}
              </h3>
              <p className="text-sm leading-relaxed text-neutral-600 dark:text-white/65" id="detSolution" />
            </div>
            {/* Metrics */}
            <div className="glass rounded-2xl p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-white/30 mb-3">
                {" Metrics"}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <p className="text-[10px] font-bold uppercase text-neutral-400 mb-1">
                    Difficulty
                  </p>
                  <div className="diff-bar mb-1">
                    <div className="diff-fill" id="metDiffBar" />
                  </div>
                  <p className="text-xs font-bold" id="metDiffLabel" />
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold uppercase text-neutral-400 mb-1">
                    Innovation
                  </p>
                  <div id="metStars" />
                  <p className="text-xs font-bold text-amber-500" id="metInnovLabel" />
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold uppercase text-neutral-400 mb-1">
                    Timeline
                  </p>
                  <p className="text-xl font-black" id="metTimeline" />
                  <p className="text-[10px] text-neutral-400">
                    weeks
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold uppercase text-neutral-400 mb-1">
                    Team
                  </p>
                  <p className="text-xl font-black" id="metTeam" />
                  <p className="text-[10px] text-neutral-400" id="metTeamLabel">
                    members
                  </p>
                </div>
              </div>
            </div>
            {/* Tech Stack */}
            <div className="glass rounded-2xl p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-white/30 mb-3 flex items-center gap-1">
                <span className="material-symbols-rounded text-sm">
                  code
                </span>
                {"Tech Stack "}
              </h3>
              <div className="flex flex-wrap gap-1.5" id="detTech" />
            </div>
            {/* Milestones */}
            <div className="glass rounded-2xl p-5" id="milestonesCard" style={{ display: "none" }}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-white/30 mb-3 flex items-center gap-1">
                <span className="material-symbols-rounded text-sm">
                  flag
                </span>
                {"Milestones "}
              </h3>
              <div className="space-y-2" id="detMilestones" />
            </div>
            {/* Learning Outcomes */}
            <div className="glass rounded-2xl p-5" id="outcomesCard" style={{ display: "none" }}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-white/30 mb-3 flex items-center gap-1">
                <span className="material-symbols-rounded text-sm">
                  school
                </span>
                {"Learning Outcomes "}
              </h3>
              <div className="flex flex-wrap gap-1.5" id="detOutcomes" />
            </div>
            {/* ADDED FEATURES */}
            <div className="glass rounded-2xl p-5" id="addedFeaturesCard" style={{ display: "none" }}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-500 mb-3 flex items-center gap-1">
                <span className="material-symbols-rounded text-sm">
                  stars
                </span>
                {"Added Features "}
              </h3>
              <div className="space-y-2" id="addedFeaturesList" />
            </div>
            {/* TOOL BUTTONS */}
            <div className="space-y-2 pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-white/30 mb-1">
                AI Tools
              </p>
              {" "}
              <button className="tool-btn" data-px-onclick="runTool('unique')" data-px="">
                <span className="material-symbols-rounded text-brand-500 text-lg">
                  auto_fix_high
                </span>
                Make It Unique
              </button>
              {" "}
              <button className="tool-btn" data-px-onclick="runTool('eval')" data-px="">
                <span className="material-symbols-rounded text-blue-500 text-lg">
                  analytics
                </span>
                Evaluation Metrics
              </button>
              {" "}
              <button className="tool-btn" data-px-onclick="runTool('viva')" data-px="">
                <span className="material-symbols-rounded text-amber-500 text-lg">
                  mic
                </span>
                Viva Simulation
              </button>
            </div>
          </div>
          {/* RIGHT: AI Refinement Mentor (3/5) */}
          <div className="lg:col-span-3">
            <div className="glass rounded-2xl p-6 sticky top-20">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-[#FF7FD1] flex items-center justify-center">
                  <span className="material-symbols-rounded text-xl text-white">
                    psychology
                  </span>
                </div>
                <div>
                  <h2 className="font-extrabold text-base">
                    AI Refinement Mentor
                  </h2>
                  <p className="text-xs text-neutral-500 dark:text-white/40">
                    {"Let's refine your project before you proceed."}
                  </p>
                </div>
              </div>
              {/* Phase steps */}
              <div className="flex flex-wrap gap-2 mb-6" id="phaseNav">
                <div className="phase-step active" data-phase="stack_selection">
                  <span className="step-num">
                    1
                  </span>
                  {"Stack "}
                </div>
                <div className="phase-step" data-phase="features">
                  <span className="step-num">
                    2
                  </span>
                  Features
                </div>
                <div className="phase-step" data-phase="feasibility">
                  <span className="step-num">
                    3
                  </span>
                  {"Feasibility "}
                </div>
                <div className="phase-step" data-phase="customization">
                  <span className="step-num">
                    4
                  </span>
                  {"Customize "}
                </div>
                <div className="phase-step" data-phase="architecture">
                  <span className="step-num">
                    5
                  </span>
                  {"Architecture "}
                </div>
                <div className="phase-step" data-phase="blueprint">
                  <span className="step-num">
                    6
                  </span>
                  Blueprint
                </div>
                <div className="phase-step" data-phase="chatbot">
                  <span className="step-num">
                    7
                  </span>
                  Chatbot
                </div>
              </div>
              {/* Phase content area */}
              <div id="phaseContent" />
            </div>
          </div>
        </div>
      </div>
      {/* TOOL MODAL (for unique/eval/viva results) */}
      <div
        className="tool-modal-overlay"
        id="toolModal"
        data-px-onclick="if(event.target===this)closeToolModal()"
        data-px=""
      >
        <div className="tool-modal">
          <button
            data-px-onclick="closeToolModal()"
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/20 transition"
            data-px=""
          >
            <span className="material-symbols-rounded text-lg">
              close
            </span>
          </button>
          {" "}
          <div id="toolModalContent" />
        </div>
      </div>
      <footer className="py-6 text-center text-xs text-neutral-400 dark:text-white/30 mt-8">
        PaperX × InnovateX • AI Refinement Mentor
      </footer>
      {" "}
      {/* CHAT FAB & MODAL */}
      <button className="chat-fab" id="chatFab" data-px-onclick="toggleChatModal()" data-px="">
        <span className="material-symbols-rounded text-3xl">
          smart_toy
        </span>
      </button>
      {" "}
      <div
        className="chat-modal-overlay"
        id="chatModal"
        data-px-onclick="if(event.target===this)toggleChatModal()"
        data-px=""
      >
        <div className="chat-window">
          <div className="bg-brand-500 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <span className="material-symbols-rounded text-lg">
                  smart_toy
                </span>
              </div>
              <div>
                <h3 className="font-bold text-sm">
                  InnovateX Mentor
                </h3>
                <p className="text-[10px] opacity-80">
                  AI Project Assistant
                </p>
              </div>
            </div>
            {" "}
            <button
              data-px-onclick="toggleChatModal()"
              className="hover:bg-white/10 rounded-full p-1 transition"
              data-px=""
            >
              <span className="material-symbols-rounded">
                close
              </span>
            </button>
          </div>
          <div
            id="chatMessages"
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50 dark:bg-[#151520]"
          />
          <div className="p-3 bg-white dark:bg-[#1E1E2F] border-t border-neutral-100 dark:border-white/5">
            <form data-px-onsubmit="sendChat(event)" className="flex gap-2" data-px="">
              <input
                type="text"
                id="chatInput"
                className="form-input flex-1 text-sm bg-neutral-100 dark:bg-white/5 border-none"
                placeholder="Type a message..."
                autoComplete="off"
              />
              {" "}
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-brand-500 text-white hover:bg-brand-600 transition flex items-center justify-center aspect-square shadow-lg shadow-brand-500/20"
              >
                <span className="material-symbols-rounded">
                  send
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
      <script src="./my_project_app.js" />
      <script src="/_legacy/inovateX/my_project/script-04.js" />
    </LegacyPage>
  );
}
