// Converted from ui/teacher_test_creator.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/teacher_test_creator/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Paper X — Test Creator",
};

export default function TeacherTestCreatorPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen font-sans antialiased text-neutral-900 dark:text-white loaded"}}
      head={
        <>
          <link rel="icon" type="image/x-icon" href="assets/img/favicon.svg" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        </>
      }
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <link
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,600,0,0"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="assets/css/tailwind.css" />
      <script src="/_legacy/teacher_test_creator/script-01.js" />
      <script src="https://unpkg.com/@lottiefiles/dotlottie-wc@0.8.11/dist/dotlottie-wc.js" type="module" />
      <script src="/config.js" />
      <script src="/auth.js" defer />
      <link rel="stylesheet" href="/_legacy/teacher_test_creator/style-01.css" />
      {/* ── original <body> ── */}
      <div id="pageLoader" aria-hidden="true">
        <dotlottie-wc
          src="https://lottie.host/848055f4-11c7-4032-80e0-d51319c33bca/lF6845uqpU.lottie"
          style={{ width: "300px", height: "300px" }}
          autoplay=""
          loop=""
        />
      </div>
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-brand-900/70 backdrop-blur border-b border-black/5 dark:border-white/10">
        <div className="container mx-auto flex items-center justify-between py-3 px-4">
          <div className="flex items-center gap-3">
            <a href="./index.html" className="flex items-center gap-3" aria-label="Paper X Home">
              {" "}
              <img src="assets/img/logo-light.svg" className="h-9 w-auto dark:hidden" alt="Paper X" />
              {" "}
              <img src="assets/img/logo-dark.svg" className="h-9 w-auto hidden dark:block" alt="Paper X" />
              {" "}
            </a>
            {" "}
            <span className="hidden md:inline text-xs text-neutral-500 dark:text-white/60">
              Test Creator
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="shareTop"
              type="button"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-600 text-white text-sm hover:bg-brand-700"
            >
              <span className="material-symbols-rounded">
                share
              </span>
              {" "}
              <span className="hidden sm:inline">
                Share
              </span>
            </button>
            {" "}
            <button
              id="changeAudience"
              type="button"
              className="text-sm px-3 py-1.5 rounded-full ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/10"
            >
              Change audience
            </button>
            {" "}
            <button
              id="themeToggle"
              className="inline-flex items-center justify-center size-10 rounded-full ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5"
            >
              <span className="material-symbols-rounded">
                dark_mode
              </span>
            </button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-10">
        <div className="max-w-7xl mx-auto space-y-8">
          <section className="neoBorder glass rounded-3xl p-4 md:p-5 ring-1 ring-black/5 dark:ring-white/10 shadowCard">
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-xl bg-gradient-to-br from-brand-500/25 to-brand-700/20 grid place-items-center text-brand-700 dark:text-fuchsia-100">
                  <span className="material-symbols-rounded text-2xl">
                    quiz
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                    Build your test
                  </h1>
                  <div className="mt-2">
                    <span
                      id="audienceChip"
                      className="chip inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 dark:bg-white/5 text-xs text-neutral-700 dark:text-white/80"
                    >
                      {" "}
                      <span className="material-symbols-rounded text-base">
                        group
                      </span>
                      {" "}
                      <span id="audienceLabel">
                        Audience
                      </span>
                      {" "}
                    </span>
                  </div>
                </div>
              </div>
              <div
                id="alert"
                className="hidden text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-4 py-3 rounded-xl ring-1 ring-red-100 dark:ring-red-800"
              />
            </div>
          </section>
          <section>
            <div className="neoBorder glass rounded-3xl p-5 md:p-6 ring-1 ring-black/5 dark:ring-white/10 shadowCard">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div className="grid gap-3 md:flex-1 md:grid-cols-2">
                  <label className="text-sm space-y-1">
                    {" "}
                    <span className="text-xs uppercase tracking-wide text-neutral-500 dark:text-white/60">
                      Title
                    </span>
                    {" "}
                    <input
                      id="testTitle"
                      type="text"
                      className="w-full px-3 py-2 rounded-2xl bg-white/85 dark:bg-white/10 ring-1 ring-black/5 dark:ring-white/15 focus:outline-none focus:ring-brand-500"
                      placeholder="(optional)"
                    />
                    {" "}
                  </label>
                  {" "}
                  <label className="text-sm space-y-1">
                    {" "}
                    <span className="text-xs uppercase tracking-wide text-neutral-500 dark:text-white/60">
                      Timer (minutes, optional)
                    </span>
                    {" "}
                    <input
                      id="durationMin"
                      type="number"
                      min="0"
                      max="180"
                      inputMode="numeric"
                      className="w-full px-3 py-2 rounded-2xl bg-white/85 dark:bg-white/10 ring-1 ring-black/5 dark:ring-white/15 focus:outline-none focus:ring-brand-500"
                      placeholder="30"
                    />
                    {" "}
                  </label>
                </div>
                <div className="flex flex-wrap gap-2 md:justify-end">
                  <button
                    id="aiOpen"
                    type="button"
                    className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl ring-1 ring-brand-500/40 text-brand-700 dark:text-fuchsia-100 bg-brand-500/10 hover:bg-brand-500/20"
                  >
                    <span className="material-symbols-rounded">
                      auto_awesome
                    </span>
                    {" Generate with AI "}
                  </button>
                  {" "}
                  <button
                    id="clearAll"
                    type="button"
                    className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    <span className="material-symbols-rounded">
                      delete
                    </span>
                    {" Clear all "}
                  </button>
                  {" "}
                  <button
                    id="shareBottom"
                    type="button"
                    className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl bg-brand-600 text-white text-sm hover:bg-brand-700"
                  >
                    <span className="material-symbols-rounded">
                      share
                    </span>
                    {" Share link "}
                  </button>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold">
                    Questions
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-neutral-500 dark:text-white/60" id="qCount">
                    0 questions
                  </div>
                  {" "}
                  <button
                    id="addEmpty"
                    type="button"
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-2xl bg-black/80 text-white text-sm hover:bg-black"
                  >
                    <span className="material-symbols-rounded">
                      add
                    </span>
                    {" Add question "}
                  </button>
                </div>
              </div>
              <div id="questionsWrap" className="mt-3 space-y-4" />
            </div>
          </section>
        </div>
      </main>
      {/* AI Build Modal */}
      <div
        id="aiBuildModal"
        className="hidden fixed inset-0 z-40 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Build test with AI"
        style={{ background: "rgba(0,0,0,0.35)" }}
      >
        <div
          id="aiBuildCard"
          className="w-full max-w-lg glass rounded-3xl ring-1 ring-black/5 dark:ring-white/10 shadowCard p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">
                Generate questions with AI
              </h3>
            </div>
            {" "}
            <button
              id="aiCancel"
              type="button"
              className="text-xs px-2 py-1 rounded-md ring-1 ring-black/5 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/10"
            >
              Close
            </button>
          </div>
          <div className="mt-4 grid gap-3">
            <div className="flex items-center gap-2">
              <button
                id="aiModeTopic"
                type="button"
                className="flex-1 px-3 py-2 rounded-xl text-sm font-semibold bg-brand-500/10 text-brand-700 dark:text-fuchsia-100 ring-1 ring-brand-500/30 hover:bg-brand-500/20"
              >
                {" Quick topic "}
              </button>
              {" "}
              <button
                id="aiModeAcademic"
                type="button"
                className="flex-1 px-3 py-2 rounded-xl text-sm font-semibold bg-white/70 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 hover:bg-white/90 dark:hover:bg-white/20"
              >
                {" Academic test "}
              </button>
            </div>
            <div id="aiTopicWrap">
              <label className="text-sm space-y-1">
                {" "}
                <span className="text-xs uppercase tracking-wide text-neutral-500 dark:text-white/60">
                  Topic
                </span>
                {" "}
                <input
                  id="aiTopic"
                  type="text"
                  className="w-full px-3 py-2 rounded-xl bg-white/80 dark:bg-white/10 ring-1 ring-black/5 dark:ring-white/15 focus:outline-none focus:ring-brand-500"
                  placeholder="e.g., DBMS — Normalization"
                />
                {" "}
              </label>
            </div>
            <div id="aiAcademicWrap" className="hidden">
              <div className="rounded-2xl ring-1 ring-black/5 dark:ring-white/10 bg-white/70 dark:bg-white/5 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">
                      Select syllabus
                    </div>
                    <div id="aiAcademicMeta" className="text-xs text-neutral-500 dark:text-white/60 mt-1">
                      —
                    </div>
                  </div>
                  {" "}
                  <button
                    id="aiAcademicReload"
                    type="button"
                    className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    <span className="material-symbols-rounded text-sm">
                      refresh
                    </span>
                    {" Reload "}
                  </button>
                </div>
                <div id="aiAcademicStatus" className="text-xs text-neutral-500 dark:text-white/60 mt-2">
                  —
                </div>
              </div>
              <div id="aiAcademicList" className="mt-3 space-y-3 max-h-[44vh] overflow-auto pr-1" />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <button
                  id="aiAcademicClear"
                  type="button"
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <span className="material-symbols-rounded text-sm">
                    clear_all
                  </span>
                  {" Clear selection "}
                </button>
                {" "}
                <div className="text-[11px] text-neutral-500 dark:text-white/60" id="aiAcademicCount">
                  0 selected
                </div>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm space-y-1">
                {" "}
                <span className="text-xs uppercase tracking-wide text-neutral-500 dark:text-white/60">
                  No. of questions
                </span>
                {" "}
                <input
                  id="aiCount"
                  type="number"
                  min="1"
                  max="30"
                  defaultValue="10"
                  className="w-full px-3 py-2 rounded-xl bg-white/80 dark:bg-white/10 ring-1 ring-black/5 dark:ring-white/15 focus:outline-none focus:ring-brand-500"
                />
                {" "}
              </label>
              {" "}
              <label className="text-sm space-y-1">
                {" "}
                <span className="text-xs uppercase tracking-wide text-neutral-500 dark:text-white/60">
                  Difficulty
                </span>
                {" "}
                <select
                  id="aiDifficulty"
                  className="w-full px-3 py-2 rounded-xl bg-white/80 dark:bg-white/10 ring-1 ring-black/5 dark:ring-white/15 focus:outline-none focus:ring-brand-500"
                  defaultValue={"balanced"}
                >
                  <option value="balanced">
                    Balanced (Easy + Medium + Hard)
                  </option>
                  <option value="easy">
                    Easy
                  </option>
                  <option value="medium">
                    Medium
                  </option>
                  <option value="hard">
                    Hard
                  </option>
                </select>
                {" "}
              </label>
            </div>
            {" "}
            <label className="flex items-center gap-2 text-sm">
              {" "}
              <input id="aiReplace" type="checkbox" className="size-4" defaultChecked />
              {" "}
              <span>
                Replace existing questions
              </span>
              {" "}
            </label>
            {" "}
            <div id="aiErr" className="text-xs text-red-600 dark:text-red-400" />
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                id="aiGenerate"
                type="button"
                className="px-3 py-2 rounded-xl bg-brand-600 text-white text-sm hover:bg-brand-700"
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Share Modal */}
      <div
        id="shareModal"
        className="hidden fixed inset-0 z-40 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Share link"
        style={{ background: "rgba(0,0,0,0.35)" }}
      >
        <div className="w-full max-w-lg glass rounded-3xl ring-1 ring-black/5 dark:ring-white/10 shadowCard p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">
                Share test link
              </h3>
              <p className="text-xs text-neutral-500 dark:text-white/60">
                Students must sign in to take the test.
              </p>
            </div>
            {" "}
            <button
              id="shareClose"
              type="button"
              className="text-xs px-2 py-1 rounded-md ring-1 ring-black/5 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/10"
            >
              Close
            </button>
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex gap-2">
              <input
                id="shareLink"
                type="text"
                className="flex-1 px-3 py-2 rounded-xl bg-white/80 dark:bg-white/10 ring-1 ring-black/5 dark:ring-white/15 focus:outline-none focus:ring-brand-500"
                placeholder="Generating…"
                readOnly
              />
              {" "}
              <button
                id="copyLink"
                type="button"
                className="px-3 py-2 rounded-xl bg-black/80 text-white text-sm hover:bg-black"
                disabled
              >
                Copy
              </button>
            </div>
            <div id="shareStatus" className="text-xs text-neutral-500 dark:text-white/60" />
          </div>
        </div>
      </div>
      <script src="/_legacy/teacher_test_creator/script-02.js" />
    </LegacyPage>
  );
}
