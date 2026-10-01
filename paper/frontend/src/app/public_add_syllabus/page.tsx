// Converted from ui/public_add_syllabus.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/public_add_syllabus/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Add Syllabus (Public) — Pa[p]er X",
  description: "Public page to add a syllabus course with units and topics by selecting college, department, batch, and semester.",
};

export default function PublicAddSyllabusPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"font-display bg-white text-slate-900 dark:bg-night-900 dark:text-slate-200 selection:bg-brand-200 selection:text-slate-900"}}
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <script src="/_legacy/public_add_syllabus/script-01.js" />
      <link rel="stylesheet" href="assets/css/tailwind.css" />
      <script src="/config.js" />
      <link rel="stylesheet" href="/_legacy/public_add_syllabus/style-01.css" />
      {/* ── original <body> ── */}
      <div aria-hidden="true" className="fixed inset-0 -z-10 bg-grid-radial opacity-70 dark:opacity-50" />
      <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-night-900/50 border-b border-black/5 dark:border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <a href="index.html" className="flex items-center gap-3 group">
              {" "}
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-400 via-brand-500 to-indigo-500 shadow-neon grid place-items-center text-white font-bold tracking-tight">
                {" PX"}
              </div>
              <div>
                <p className="text-lg font-semibold leading-tight group-hover:text-brand-600">
                  Pa[p]er X
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 -mt-1">
                  Agentic AI for Indian syllabi
                </p>
              </div>
              {" "}
            </a>
            {" "}
            <div className="flex items-center gap-3">
              <a
                id="navProfile"
                href="profile.html"
                title="Profile"
                className="hidden items-center justify-center w-9 h-9 rounded-full overflow-hidden border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-800/60"
              >
                {" "}
                <img id="navProfileImg" alt="Profile" className="w-full h-full object-cover hidden" />
                {" "}
                <span id="navProfileInitial" className="text-xs font-semibold">
                  Me
                </span>
                {" "}
              </a>
              {" "}
              <button
                id="navSignOut"
                title="Sign out"
                aria-label="Sign out"
                className="hidden inline-flex items-center gap-2 rounded-lg border border-slate-200/60 dark:border-white/10 px-3 py-1.5 hover:border-brand-400/60 text-sm"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 12H3" />
                  {" "}
                  <path d="M15 12l-4-4" />
                  {" "}
                  <path d="M15 12l-4 4" />
                  {" "}
                  <path d="M21 7v10a2 2 0 0 1-2 2h-6" />
                </svg>
                {" "}
                <span>
                  Sign Out
                </span>
              </button>
              {" "}
              <a
                href="login.html"
                className="rounded-lg border border-slate-200/60 dark:border-white/10 px-3 py-1.5 hover:border-brand-400/60 text-sm"
              >
                Sign in
              </a>
              {" "}
              <a
                href="signup.html"
                className="rounded-lg border border-slate-200/60 dark:border-white/10 px-3 py-1.5 hover:border-brand-400/60 text-sm"
              >
                Sign up
              </a>
            </div>
          </div>
        </div>
      </header>
      <main className="relative">
        <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-10 pb-20">
          <div className="rounded-2xl glass glass-dark p-6 md:p-8 shadow-neon border border-white/10 bg-white/80 dark:bg-night-800/70">
            <div className="flex items-center justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/60 dark:bg-night-800/60 px-3 py-1 text-xs text-slate-700 dark:text-slate-300 backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-brand-400" />
                  {" Public syllabus entry "}
                </div>
                {" "}
                <h1 className="mt-3 text-2xl font-bold">
                  {"Create Course • Units & Topics"}
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  No login required. Select college → department → batch → semester, then add units and topics.
                </p>
              </div>
              {" "}
              <a
                href="index.html"
                className="rounded-lg border border-slate-200/60 dark:border-white/10 px-3 py-1.5 text-sm hover:border-brand-400/60"
              >
                Back to Home
              </a>
            </div>
            {/* Selectors */}
            <form id="courseForm" className="mt-6 grid gap-6" noValidate>
              <div className="grid md:grid-cols-2 gap-4">
                <label className="grid gap-1">
                  {" "}
                  <span className="text-sm">
                    College
                  </span>
                  {" "}
                  <select
                    id="college"
                    required
                    className="rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-800/70 px-3 py-2"
                  />
                  {" "}
                </label>
                {" "}
                <label className="grid gap-1">
                  {" "}
                  <span className="text-sm">
                    Department
                  </span>
                  {" "}
                  <select
                    id="department"
                    required
                    className="rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-800/70 px-3 py-2"
                    disabled
                  />
                  {" "}
                </label>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <label className="grid gap-1">
                  {" "}
                  <span className="text-sm">
                    Use existing batch (optional)
                  </span>
                  {" "}
                  <select
                    id="existingBatch"
                    className="rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-800/70 px-3 py-2"
                    disabled
                  >
                    <option value="">
                      — Select after department —
                    </option>
                  </select>
                  {" "}
                </label>
                {" "}
                <label className="grid gap-1">
                  {" "}
                  <span className="text-sm">
                    From year
                  </span>
                  {" "}
                  <input
                    id="fromYear"
                    type="number"
                    min="1950"
                    max="2100"
                    placeholder="e.g., 2021"
                    className="rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-800/70 px-3 py-2"
                  />
                  {" "}
                </label>
                {" "}
                <label className="grid gap-1">
                  {" "}
                  <span className="text-sm">
                    To year
                  </span>
                  {" "}
                  <input
                    id="toYear"
                    type="number"
                    min="1950"
                    max="2100"
                    placeholder="e.g., 2025"
                    className="rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-800/70 px-3 py-2"
                  />
                  {" "}
                </label>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <label className="grid gap-1">
                  {" "}
                  <span className="text-sm">
                    Semester
                  </span>
                  {" "}
                  <select
                    id="semester"
                    required
                    className="rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-800/70 px-3 py-2"
                  >
                    <option value="">
                      — select —
                    </option>
                    <option>
                      1
                    </option>
                    <option>
                      2
                    </option>
                    <option>
                      3
                    </option>
                    <option>
                      4
                    </option>
                    <option>
                      5
                    </option>
                    <option>
                      6
                    </option>
                    <option>
                      7
                    </option>
                    <option>
                      8
                    </option>
                    <option>
                      9
                    </option>
                    <option>
                      10
                    </option>
                    <option>
                      11
                    </option>
                    <option>
                      12
                    </option>
                  </select>
                  {" "}
                </label>
                {" "}
                <label className="grid gap-1">
                  {" "}
                  <span className="text-sm">
                    Course code
                  </span>
                  {" "}
                  <input
                    id="courseCode"
                    required
                    placeholder="e.g., CS201"
                    className="rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-800/70 px-3 py-2"
                  />
                  {" "}
                </label>
                {" "}
                <label className="grid gap-1 md:col-span-1">
                  {" "}
                  <span className="text-sm">
                    Course title
                  </span>
                  {" "}
                  <input
                    id="courseTitle"
                    required
                    placeholder="e.g., Data Structures"
                    className="rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-800/70 px-3 py-2"
                  />
                  {" "}
                </label>
              </div>
              {/* Units Builder */}
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">
                    Units
                  </h2>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      id="addUnitBtn"
                      className="rounded-lg border border-slate-200/60 dark:border-white/10 px-3 py-1.5 text-sm hover:border-brand-400/60"
                    >
                      Add Unit
                    </button>
                    {" "}
                    <button
                      type="button"
                      id="expandAllBtn"
                      className="rounded-lg border border-slate-200/60 dark:border-white/10 px-3 py-1.5 text-sm hover:border-brand-400/60"
                    >
                      Expand all
                    </button>
                  </div>
                </div>
                <div id="unitsWrap" className="grid gap-4" />
              </div>
              <div className="flex items-center justify-between">
                <div
                  id="status"
                  className="hidden rounded-lg bg-white/70 dark:bg-night-800/70 border border-slate-200/60 dark:border-white/10 p-3 font-mono text-[12px] text-slate-700 dark:text-slate-300"
                />
                <div className="flex gap-2">
                  <a
                    href="index.html"
                    className="rounded-lg border border-slate-200/60 dark:border-white/10 px-4 py-2 text-sm hover:border-brand-400/60"
                  >
                    Cancel
                  </a>
                  {" "}
                  <button
                    type="submit"
                    id="submitBtn"
                    className="rounded-xl bg-gradient-to-r from-brand-500 to-indigo-500 px-5 py-2.5 text-white shadow-neon"
                  >
                    Save Course
                  </button>
                </div>
              </div>
            </form>
          </div>
        </section>
      </main>
      <template
        id="unitTpl"
        dangerouslySetInnerHTML={{ __html: "\n    <div class=\"rounded-xl border border-slate-200/60 dark:border-white/10 bg-white/80 dark:bg-night-800/70\">\n      <div class=\"px-4 py-3 border-b border-slate-200/60 dark:border-white/10 flex items-center justify-between\">\n        <div class=\"flex items-center gap-3\">\n          <span class=\"inline-flex h-6 w-6 items-center justify-center rounded-md bg-brand-500/10 text-brand-600 text-xs font-semibold\" data-unit-index=\"\">1</span>\n          <input placeholder=\"Unit title (e.g., Arrays &amp; Linked Lists)\" class=\"unit-title w-full rounded-md border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-800/70 px-3 py-1.5 text-sm\">\n        </div>\n        <div class=\"flex items-center gap-2\">\n          <button type=\"button\" class=\"toggle-btn rounded-md border border-slate-200/60 dark:border-white/10 px-2 py-1 text-xs\">Collapse</button>\n          <button type=\"button\" class=\"remove-unit rounded-md border border-rose-200/60 dark:border-rose-900/40 px-2 py-1 text-xs hover:border-rose-400/60\">Remove</button>\n        </div>\n      </div>\n      <div class=\"p-4 grid gap-3\" data-body=\"\">\n        <div class=\"grid gap-2\" data-topics=\"\"></div>\n        <button type=\"button\" class=\"add-topic rounded-md border border-slate-200/60 dark:border-white/10 px-2 py-1 text-xs hover:border-brand-400/60 w-max\">Add\n          Topic</button>\n      </div>\n    </div>\n  " }}
      />
      <template
        id="topicTpl"
        dangerouslySetInnerHTML={{ __html: "\n    <div class=\"flex items-center gap-2\">\n      <input placeholder=\"Topic (e.g., Singly Linked List)\" class=\"topic-input w-full rounded-md border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-800/70 px-3 py-1.5 text-sm\">\n      <button type=\"button\" class=\"remove-topic rounded-md border border-rose-200/60 dark:border-rose-900/40 px-2 py-1 text-xs hover:border-rose-400/60\">Remove</button>\n    </div>\n  " }}
      />
      <script src="/_legacy/public_add_syllabus/script-02.js" />
    </LegacyPage>
  );
}
