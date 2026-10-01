// Converted from ui/projects/skill-test.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/projects/skill-test/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "TuNe X — Skill Verification Lab",
  description: "Run an AI-powered assessment to verify the skills listed on your TuNe X profile.",
};

export default function ProjectsSkillTestPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"bg-ink-50 dark:bg-[#0a0d12] text-[#0d1117] dark:text-zinc-100 min-h-screen no-select"}}
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <link rel="stylesheet" href="../assets/css/tailwind.css" />
      <script src="/_legacy/projects/skill-test/script-01.js" />
      <script src="/config.js" />
      <script src="https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/face_mesh.min.js" />
      <link
        href={"https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@300;400;600&display=swap"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="/_legacy/projects/skill-test/style-01.css" />
      {/* ── original <body> ── */}
      <div id="proctorAlert" className="hidden">
        <div className="max-w-2xl space-y-3">
          <span className="icon block">
            warning
          </span>
          {" "}
          <p id="proctorAlertText" className="text-lg font-semibold">
            Integrity warning detected.
          </p>
          <p className="text-sm opacity-80">
            Please resolve the issue to continue. The alert clears automatically once the environment is stable.
          </p>
        </div>
      </div>
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-black/30 border-b border-black/5 dark:border-white/10">
        <nav className="container flex items-center gap-3 py-3">
          <a href="index.html" className="flex items-center gap-2 font-semibold tracking-tight">
            {" "}
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600 text-white shadow-brand-lg">
              CX
            </span>
            {" "}
            <span className="hidden sm:inline">
              TuNe X
            </span>
            {" "}
          </a>
          {" "}
          <div className="ml-auto hidden md:flex items-center gap-6 text-sm">
            <a href="profile.html" className="hover:text-brand-600 dark:hover:text-brand-300">
              Profile
            </a>
            {" "}
            <a href="project_post.html" className="hover:text-brand-600 dark:hover:text-brand-300">
              Create Project
            </a>
            {" "}
            <button
              data-px-onclick="toggleTheme()"
              className="rounded-xl border border-black/10 dark:border-white/10 px-3 py-2"
              data-px=""
            >
              <span className="icon">
                dark_mode
              </span>
            </button>
            {" "}
            <div className="relative" id="navProjectsWrap">
              <button
                type="button"
                id="navProjectsBtn"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition"
              >
                <span className="icon text-base leading-none">
                  hub
                </span>
                {" "}
                <span>
                  Project Portal
                </span>
                {" "}
                <span className="icon text-base leading-none">
                  expand_more
                </span>
              </button>
              {" "}
              <div
                id="navProjectsMenu"
                className="absolute right-0 mt-2 w-60 rounded-xl border border-black/10 dark:border-white/10 bg-white/95 dark:bg-zinc-900/95 shadow-lg backdrop-blur hidden"
              >
                <a
                  href="postings.html"
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10 rounded-t-xl"
                >
                  <span className="icon text-base leading-none">
                    folder_open
                  </span>
                  Project Postings
                </a>
                {" "}
                <a
                  href="project_post.html"
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <span className="icon text-base leading-none">
                    add_circle
                  </span>
                  Create Project
                </a>
                {" "}
                <a
                  href="incoming_requests.html"
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <span className="icon text-base leading-none">
                    inbox
                  </span>
                  Incoming Requests
                </a>
                {" "}
                <a
                  href="my_applications.html"
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <span className="icon text-base leading-none">
                    assignment_ind
                  </span>
                  My Applications
                </a>
                {" "}
                <a
                  href="skill-test.html"
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10 rounded-b-xl"
                >
                  <span className="icon text-base leading-none">
                    verified
                  </span>
                  Skill Test Portal
                </a>
              </div>
            </div>
            {" "}
            <a href="login.html" className="hover:text-brand-600 dark:hover:text-brand-300">
              Sign out
            </a>
          </div>
          {" "}
          <button
            id="mobileToggle"
            className="ml-auto md:hidden rounded-xl border border-black/10 dark:border-white/10 p-2"
          >
            <span className="icon">
              menu
            </span>
          </button>
        </nav>
        <div id="mobileNav" className="md:hidden hidden border-t border-black/5 dark:border-white/10">
          <div className="container py-2 grid gap-1 text-sm">
            <a href="profile.html" className="px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10">
              Profile
            </a>
            {" "}
            <a
              href="project_post.html"
              className="px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
            >
              Create Project
            </a>
            {" "}
            <a href="login.html" className="px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10">
              Sign out
            </a>
          </div>
        </div>
      </header>
      <main className="container py-10 md:py-14 space-y-8">
        <section className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-900/70 shadow-soft p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wide text-brand-600">
                Skill Verification Lab
              </p>
              <h1 id="skillHeading" className="mt-2 text-3xl md:text-4xl font-bold tracking-tight">
                Pick a skill to verify
              </h1>
              <p className="mt-2 text-sm md:text-base text-black/70 dark:text-white/70">
                We generate 3 conceptual checks (CEQs) and 2 practical coding prompts using AI. Submit your answers to earn a trusted badge on your profile.
              </p>
            </div>
            <div className="md:w-64">
              <div className="rounded-2xl border border-dashed border-brand-500/50 bg-brand-500/10 text-brand-700 dark:text-brand-200 px-4 py-3 text-sm">
                <p className="font-semibold">
                  How scoring works
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>
                    Each answer is rated 0–100.
                  </li>
                  <li>
                    Average ≥ 70% → skill marked verified.
                  </li>
                  <li>
                    Copy/paste disabled; switching tabs raises flags.
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <form id="skillChooser" className="mt-6 grid md:grid-cols-[1fr_auto] gap-3">
            <input
              id="skillInput"
              className="rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60"
              placeholder="e.g. Python"
              required
            />
            {" "}
            <button className="rounded-xl bg-brand-600 text-white px-4 py-2 shadow-brand-lg hover:brightness-110">
              Start Assessment
            </button>
          </form>
          <div id="statusMsg" className="mt-4 text-sm" />
          <div className="mt-4 flex items-center gap-3">
            <button
              id="regenerateBtn"
              type="button"
              className="hidden rounded-xl border border-black/10 dark:border-white/10 px-4 py-2 hover:bg-black/5 dark:hover:bg-white/10"
            >
              <span className="icon">
                autorenew
              </span>
              {" Regenerate questions "}
            </button>
            {" "}
            <a
              href="profile.html"
              className="inline-flex items-center gap-2 text-sm text-brand-600 hover:underline"
            >
              <span className="icon">
                arrow_back
              </span>
              Back to profile
            </a>
          </div>
        </section>
        {/* Proctoring panel */}
        <section className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-900/70 shadow-soft p-6 md:p-8">
          <div className="grid gap-6 md:grid-cols-[minmax(0,340px)_1fr] items-start">
            <div className="space-y-3">
              <div className="relative overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-black/70">
                <video id="proctorVideo" autoPlay playsInline muted className="w-full" />
                {" "}
                <div className="absolute top-2 left-2 text-xs px-3 py-1 rounded-full bg-black/60 text-white/80">
                  {"Camera preview "}
                </div>
              </div>
              {" "}
              <button
                id="enableProctorBtn"
                type="button"
                className="w-full rounded-xl border border-brand-600 text-brand-600 dark:text-brand-200 px-4 py-2 hover:bg-brand-50 dark:hover:bg-brand-900/40"
              >
                <span className="icon mr-2">
                  videocam
                </span>
                {"Enable camera & mic "}
              </button>
            </div>
            <div className="space-y-3">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <span className="icon text-lg">
                  shield
                </span>
                Integrity monitor
              </h2>
              <p className="text-sm text-black/70 dark:text-white/70">
                Maintain eye contact, keep a single face in frame, and reduce background audio. Active warnings will cover the page until resolved.
              </p>
              <ul id="proctorStatusList" className="space-y-2 text-sm">
                <li>
                  <span className="icon text-lg">
                    videocam
                  </span>
                  <span id="statusFace" className="status-info">
                    Camera idle…
                  </span>
                </li>
                <li>
                  <span className="icon text-lg">
                    visibility
                  </span>
                  <span id="statusGaze" className="status-info">
                    Awaiting calibration…
                  </span>
                </li>
                <li>
                  <span className="icon text-lg">
                    group
                  </span>
                  <span id="statusMulti" className="status-info">
                    Only you should be visible.
                  </span>
                </li>
                <li>
                  <span className="icon text-lg">
                    hearing
                  </span>
                  <span id="statusNoise" className="status-info">
                    Listening for background audio…
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>
        <section id="questionsSection" className="space-y-4" />
        <section className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-900/70 shadow-soft p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <h2 className="text-xl font-semibold">
                Submit your answers
              </h2>
              <p className="text-sm text-black/70 dark:text-white/60">
                Ensure you respond to every prompt. Coding answers support Markdown formatting.
              </p>
            </div>
            {" "}
            <button
              id="submitBtn"
              className="rounded-xl bg-brand-600 text-white px-6 py-2.5 shadow-brand-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit for verification
            </button>
          </div>
          <div
            id="resultCard"
            className="mt-6 hidden rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/80 p-5"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="md:w-32 text-center">
                <p className="text-xs uppercase tracking-wide opacity-70">
                  Score
                </p>
                <p id="resultScore" className="text-3xl font-bold">
                  0%
                </p>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    id="resultStatusBadge"
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-black/10 dark:bg-white/10"
                  >
                    {" "}
                    <span className="icon text-sm">
                      pending
                    </span>
                    <span id="resultStatus">
                      Needs review
                    </span>
                    {" "}
                  </span>
                  {" "}
                  <span id="resultMessage" className="text-sm opacity-70" />
                </div>
                <div className="h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                  <div id="resultBar" className="h-2 bg-brand-600 w-0 transition-all" />
                </div>
                <div id="resultDetails" className="text-xs opacity-80 space-y-1" />
              </div>
            </div>
          </div>
        </section>
      </main>
      <script src="/_legacy/projects/skill-test/script-02.js" />
    </LegacyPage>
  );
}
