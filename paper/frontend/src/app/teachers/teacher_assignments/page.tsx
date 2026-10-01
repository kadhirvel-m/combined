// Converted from ui/teachers/teacher_assignments.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/teachers/teacher_assignments/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Assignments — Paper X",
};

export default function TeachersTeacherAssignmentsPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen font-sans antialiased text-neutral-900 dark:text-white bg-hero-light dark:bg-hero-dark"}}
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
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0..1,0&display=swap"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="../assets/css/tailwind.css" />
      <script src="/config.js" />
      <link rel="stylesheet" href="/_legacy/teachers/teacher_assignments/style-01.css" />
      <script src="/_legacy/teachers/teacher_assignments/script-01.js" />
      {/* ── original <body> ── */}
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-brand-900/60 backdrop-blur supports-[backdrop-filter]:saturate-150 border-b border-black/5 dark:border-white/10">
        <div className="container flex items-center justify-between py-3.5">
          <a
            href="../teacher_profile.html"
            className="flex items-center gap-3 shrink-0"
            aria-label="Dashboard"
          >
            {" "}
            <img src="../assets/img/logo-light.svg" className="h-9 w-auto dark:hidden" alt="Paper X" />
            {" "}
            <img src="../assets/img/logo-dark.svg" className="h-9 w-auto hidden dark:block" alt="Paper X" />
            {" "}
          </a>
          {" "}
          <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-700 dark:text-white/85">
            <a href="../teacher_profile.html" className="hover:text-brandlt-900 dark:hover:text-white">
              Dashboard
            </a>
            {" "}
            <a href="teacher_class.html" className="hover:text-brandlt-900 dark:hover:text-white">
              Classes
            </a>
            {" "}
            <a href="teacher_notes.html" className="hover:text-brandlt-900 dark:hover:text-white">
              Notes
            </a>
            {" "}
            <a
              href="teacher_assignments.html"
              className="inline-flex items-center gap-1 rounded-full bg-brandlt-200/70 px-3 py-1.5 text-brand-700 dark:bg-white/10 dark:text-white"
              aria-current="page"
            >
              {" "}
              <span className="material-symbols-rounded text-base filled">
                assignment
              </span>
              {" Assignments "}
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <button
              data-theme-toggle=""
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5"
              aria-label="Toggle theme"
            >
              <span className="material-symbols-rounded">
                dark_mode
              </span>
            </button>
            {" "}
            <a
              href="teacher_assignment_create.html"
              className="inline-flex items-center gap-2 rounded-full bg-brand-500 text-white text-sm font-semibold px-4 py-2.5 hover:shadow-glow transition"
            >
              {" "}
              <span className="material-symbols-rounded text-base">
                add
              </span>
              {" Create "}
            </a>
          </div>
        </div>
      </header>
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-black/5 dark:border-white/10">
          <div
            className="pointer-events-none absolute inset-0 opacity-[.06] dark:opacity-[.12]"
            style={{ background: "radial-gradient(40% 50% at 20% 0%, rgba(158,75,138,0.18), transparent 60%), radial-gradient(40% 60% at 100% 0%, rgba(76,42,89,0.35), transparent 60%)" }}
          />
          <div className="container pt-10 pb-8 lg:pt-14 lg:pb-10">
            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-start">
              {/* Left: Headline */}
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-4">
                  {" Assignments "}
                  <span className="bg-gradient-to-r from-brand-500 via-brand-700 to-brand-900 bg-clip-text text-transparent">
                    Dashboard
                  </span>
                </h1>
                <p className="text-neutral-600 dark:text-white/70 max-w-xl">
                  Manage all your class assignments, track submission progress, and grade student work in one place.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href="teacher_assignment_create.html"
                    className="inline-flex items-center gap-2 rounded-full bg-brand-500 text-white px-6 py-3 text-sm font-semibold shadow-glow hover:shadow-[0_12px_36px_rgba(158,75,138,0.4)] transition"
                  >
                    {" "}
                    <span className="material-symbols-rounded text-base">
                      add
                    </span>
                    {" Create New Assignment "}
                  </a>
                  {" "}
                  <button
                    id="expandAllBtn"
                    className="inline-flex items-center gap-2 rounded-full ring-1 ring-black/10 dark:ring-white/15 px-5 py-3 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition"
                  >
                    <span className="material-symbols-rounded text-base">
                      unfold_more
                    </span>
                    {" Expand All "}
                  </button>
                </div>
              </div>
              {/* Right: Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div
                  className="glass-panel rounded-2xl p-4 flex flex-col gap-2 animate-fadeUp"
                  style={{ animationDelay: ".05s" }}
                >
                  <p className="text-[11px] uppercase tracking-wide text-neutral-600 dark:text-white/60">
                    Total
                  </p>
                  <div className="flex items-end gap-2">
                    <span id="statTotal" className="text-2xl font-extrabold">
                      0
                    </span>
                  </div>
                </div>
                <div
                  className="glass-panel rounded-2xl p-4 flex flex-col gap-2 animate-fadeUp"
                  style={{ animationDelay: ".1s" }}
                >
                  <p className="text-[11px] uppercase tracking-wide text-neutral-600 dark:text-white/60">
                    {"Published "}
                  </p>
                  <div className="flex items-end gap-2">
                    <span id="statPublished" className="text-2xl font-extrabold text-emerald-600">
                      0
                    </span>
                  </div>
                </div>
                <div
                  className="glass-panel rounded-2xl p-4 flex flex-col gap-2 animate-fadeUp"
                  style={{ animationDelay: ".15s" }}
                >
                  <p className="text-[11px] uppercase tracking-wide text-neutral-600 dark:text-white/60">
                    {"Drafts "}
                  </p>
                  <div className="flex items-end gap-2">
                    <span id="statDraft" className="text-2xl font-extrabold text-amber-600">
                      0
                    </span>
                  </div>
                </div>
                <div
                  className="glass-panel rounded-2xl p-4 flex flex-col gap-2 animate-fadeUp"
                  style={{ animationDelay: ".2s" }}
                >
                  <p className="text-[11px] uppercase tracking-wide text-neutral-600 dark:text-white/60">
                    Need Grading
                  </p>
                  <div className="flex items-end gap-2">
                    <span id="statNeedGrading" className="text-2xl font-extrabold text-red-500">
                      0
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Assignments Section */}
        <section className="py-10">
          <div className="container">
            {/* Search & Filter */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-base">
                  search
                </span>
                {" "}
                <input
                  id="searchInput"
                  type="text"
                  placeholder="Search assignments…"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-full ring-1 ring-black/10 dark:ring-white/15 bg-white/70 dark:bg-brand-900/40 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <button
                  className="filter-btn active px-4 py-2 rounded-full ring-1 ring-brand-500 bg-brand-500/10 text-brand-700 dark:text-brandlt-200 font-medium transition"
                  data-filter="all"
                >
                  All
                </button>
                {" "}
                <button
                  className="filter-btn px-4 py-2 rounded-full ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5 transition"
                  data-filter="published"
                >
                  Published
                </button>
                {" "}
                <button
                  className="filter-btn px-4 py-2 rounded-full ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5 transition"
                  data-filter="draft"
                >
                  Drafts
                </button>
              </div>
            </div>
            {/* Loading State */}
            <div id="loadingState" className="space-y-4">
              <div className="glass-panel rounded-2xl overflow-hidden">
                <div className="p-4 flex items-center gap-4 border-b border-black/5 dark:border-white/10">
                  <div className="skeleton w-40 h-5 rounded" />
                  <div className="skeleton w-24 h-4 rounded ml-auto" />
                </div>
                <div className="p-4 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="skeleton h-32 rounded-xl" />
                  <div className="skeleton h-32 rounded-xl" />
                  <div className="skeleton h-32 rounded-xl hidden lg:block" />
                </div>
              </div>
              <div className="glass-panel rounded-2xl overflow-hidden">
                <div className="p-4 flex items-center gap-4 border-b border-black/5 dark:border-white/10">
                  <div className="skeleton w-40 h-5 rounded" />
                  <div className="skeleton w-24 h-4 rounded ml-auto" />
                </div>
                <div className="p-4 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="skeleton h-32 rounded-xl" />
                  <div className="skeleton h-32 rounded-xl" />
                </div>
              </div>
            </div>
            {/* Content Container */}
            <div id="contentArea" className="hidden space-y-6" />
            {/* Empty State */}
            <div id="emptyState" className="hidden glass-panel rounded-3xl p-10 text-center">
              <div className="mx-auto w-20 h-20 rounded-3xl bg-brand-500/10 flex items-center justify-center mb-6">
                <span className="material-symbols-rounded text-4xl text-brand-500">
                  assignment_add
                </span>
              </div>
              <h2 className="text-xl font-bold mb-2">
                No Assignments Yet
              </h2>
              <p className="text-neutral-600 dark:text-white/60 max-w-md mx-auto mb-6">
                Create your first assignment to get started. Students will be able to submit their work once you publish it.
              </p>
              {" "}
              <a
                href="teacher_assignment_create.html"
                className="inline-flex items-center gap-2 rounded-full bg-brand-500 text-white px-6 py-3 text-sm font-semibold hover:shadow-glow transition"
              >
                {" "}
                <span className="material-symbols-rounded text-base">
                  add
                </span>
                {" Create First Assignment "}
              </a>
            </div>
            {/* No Results State */}
            <div id="noResults" className="hidden glass-panel rounded-2xl p-10 text-center">
              <span className="material-symbols-rounded text-4xl text-neutral-400 mb-3 block">
                search_off
              </span>
              {" "}
              <p className="text-neutral-600 dark:text-white/60">
                No assignments match your search
              </p>
            </div>
          </div>
        </section>
      </main>
      <footer className="py-8 border-t border-black/5 dark:border-white/10 text-center text-xs text-neutral-600 dark:text-white/60">
        {" © "}
        <span id="year" />
        {" Paper X • Teacher Dashboard "}
      </footer>
      <script src="/_legacy/teachers/teacher_assignments/script-02.js" />
    </LegacyPage>
  );
}
