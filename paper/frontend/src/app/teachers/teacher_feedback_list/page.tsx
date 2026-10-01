// Converted from ui/teachers/teacher_feedback_list.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/teachers/teacher_feedback_list/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Feedback Forms — Paper X",
};

export default function TeachersTeacherFeedbackListPage() {
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
      <link rel="stylesheet" href="/_legacy/teachers/teacher_feedback_list/style-01.css" />
      <script src="/_legacy/teachers/teacher_feedback_list/script-01.js" />
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
            <a href="teacher_assignments.html" className="hover:text-brandlt-900 dark:hover:text-white">
              Assignments
            </a>
            {" "}
            <a
              href="teacher_feedback_list.html"
              className="inline-flex items-center gap-1 rounded-full bg-brandlt-200/70 px-3 py-1.5 text-brand-700 dark:bg-white/10 dark:text-white"
              aria-current="page"
            >
              {" "}
              <span className="material-symbols-rounded text-base filled">
                rate_review
              </span>
              {" Feedback "}
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
              href="teacher_feedback_create.html"
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
                  {" Feedback "}
                  <span className="bg-gradient-to-r from-brand-500 via-brand-700 to-brand-900 bg-clip-text text-transparent">
                    Forms
                  </span>
                </h1>
                <p className="text-neutral-600 dark:text-white/70 max-w-xl">
                  Create surveys to collect student feedback. Supports ratings, MCQs, text, and scales. Students see anonymous forms, but you see their names.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href="teacher_feedback_create.html"
                    className="inline-flex items-center gap-2 rounded-full bg-brand-500 text-white px-6 py-3 text-sm font-semibold shadow-glow hover:shadow-[0_12px_36px_rgba(158,75,138,0.4)] transition"
                  >
                    {" "}
                    <span className="material-symbols-rounded text-base">
                      add
                    </span>
                    {" Create New Form "}
                  </a>
                </div>
              </div>
              {/* Right: Stats Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div
                  className="glass-panel rounded-2xl p-4 flex flex-col gap-2 animate-fadeUp"
                  style={{ animationDelay: ".05s" }}
                >
                  <p className="text-[11px] uppercase tracking-wide text-neutral-600 dark:text-white/60">
                    Total Forms
                  </p>
                  {" "}
                  <span id="statTotal" className="text-2xl font-extrabold">
                    0
                  </span>
                </div>
                <div
                  className="glass-panel rounded-2xl p-4 flex flex-col gap-2 animate-fadeUp"
                  style={{ animationDelay: ".1s" }}
                >
                  <p className="text-[11px] uppercase tracking-wide text-neutral-600 dark:text-white/60">
                    {"Published "}
                  </p>
                  {" "}
                  <span id="statPublished" className="text-2xl font-extrabold text-emerald-600">
                    0
                  </span>
                </div>
                <div
                  className="glass-panel rounded-2xl p-4 flex flex-col gap-2 animate-fadeUp"
                  style={{ animationDelay: ".15s" }}
                >
                  <p className="text-[11px] uppercase tracking-wide text-neutral-600 dark:text-white/60">
                    Total Responses
                  </p>
                  {" "}
                  <span id="statResponses" className="text-2xl font-extrabold text-brand-500">
                    0
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Forms List */}
        <section className="py-10">
          <div className="container">
            {/* Loading State */}
            <div id="loadingState" className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="skeleton h-48 rounded-2xl" />
              <div className="skeleton h-48 rounded-2xl" />
              <div className="skeleton h-48 rounded-2xl hidden lg:block" />
            </div>
            {/* Content */}
            <div id="contentArea" className="hidden grid md:grid-cols-2 lg:grid-cols-3 gap-4" />
            {/* Empty State */}
            <div id="emptyState" className="hidden glass-panel rounded-3xl p-10 text-center">
              <div className="mx-auto w-20 h-20 rounded-3xl bg-brand-500/10 flex items-center justify-center mb-6">
                <span className="material-symbols-rounded text-4xl text-brand-500">
                  rate_review
                </span>
              </div>
              <h2 className="text-xl font-bold mb-2">
                No Feedback Forms Yet
              </h2>
              <p className="text-neutral-600 dark:text-white/60 max-w-md mx-auto mb-6">
                Create your first feedback form to start collecting student responses.
              </p>
              {" "}
              <a
                href="teacher_feedback_create.html"
                className="inline-flex items-center gap-2 rounded-full bg-brand-500 text-white px-6 py-3 text-sm font-semibold hover:shadow-glow transition"
              >
                {" "}
                <span className="material-symbols-rounded text-base">
                  add
                </span>
                {" Create First Form "}
              </a>
            </div>
          </div>
        </section>
      </main>
      {/* Copy Toast */}
      <div
        id="copyToast"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-brand-900 text-white px-4 py-3 rounded-full text-sm font-medium shadow-xl opacity-0 pointer-events-none transition-opacity"
      >
        <span className="material-symbols-rounded text-base mr-2 align-middle">
          check
        </span>
        {" Link copied to clipboard! "}
      </div>
      <footer className="py-8 border-t border-black/5 dark:border-white/10 text-center text-xs text-neutral-600 dark:text-white/60">
        {" © "}
        <span id="year" />
        {" Paper X • Teacher Dashboard "}
      </footer>
      <script src="/_legacy/teachers/teacher_feedback_list/script-02.js" />
    </LegacyPage>
  );
}
