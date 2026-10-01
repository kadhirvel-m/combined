// Converted from ui/teacher_class_students.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/teacher_class_students/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Class Students • Paper X",
};

export default function TeacherClassStudentsPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen font-sans antialiased text-neutral-900 dark:text-white bg-hero-light dark:bg-hero-dark"}}
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
      <script src="/_legacy/teacher_class_students/script-01.js" />
      <link rel="stylesheet" href="/_legacy/teacher_class_students/style-01.css" />
      <script src="/_legacy/teacher_class_students/script-02.js" />
      <script src="/config.js" />
      <script src="/auth.js" defer />
      <script src="/_legacy/teacher_class_students/script-03.js" />
      {/* ── original <body> ── */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-brand-900/60 backdrop-blur border-b border-black/5 dark:border-white/10">
        <div className="container flex items-center justify-between py-3">
          <a href="./index.html" className="flex items-center gap-3" aria-label="Paper X Home">
            {" "}
            <img src="assets/img/logo-light.svg" className="h-9 w-auto dark:hidden" alt="Paper X" />
            {" "}
            <img src="assets/img/logo-dark.svg" className="h-9 w-auto hidden dark:block" alt="Paper X" />
            {" "}
          </a>
          {" "}
          <div className="flex items-center gap-2">
            <button
              id="backBtn"
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5"
            >
              <span className="material-symbols-rounded text-base">
                arrow_back
              </span>
              {" Back "}
            </button>
            {" "}
            <button
              data-theme-toggle=""
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5"
            >
              <span className="material-symbols-rounded text-base">
                dark_mode
              </span>
            </button>
          </div>
        </div>
      </header>
      <main className="container py-8 space-y-6">
        <section className="glass rounded-3xl p-6 md:p-8 ring-1 ring-black/5 dark:ring-white/10 shadow-card space-y-4">
          <div className="flex items-start gap-4 flex-wrap">
            <div
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500/30 to-brand-700/20 grid place-items-center text-lg font-bold text-brand-700 dark:text-fuchsia-200"
              id="subjectInitial"
            >
              -
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-xs uppercase tracking-[0.1em] text-neutral-500 dark:text-white/60">
                Class roster
              </p>
              <h1 id="subjectTitle" className="text-2xl md:text-3xl font-extrabold leading-tight">
                Loading…
              </h1>
              <div className="flex flex-wrap gap-2 text-[11px] font-medium" id="subjectMeta" />
            </div>
          </div>
          <div id="actionRow" className="flex flex-wrap gap-2 hidden" />
          <div id="status" className="text-sm text-neutral-600 dark:text-white/70">
            Fetching students…
          </div>
        </section>
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
              <span id="studentCount">
                0 students
              </span>
              {" "}
              <div id="filtersWrap" className="flex flex-wrap gap-2 text-[11px] font-medium" />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <input
                id="studentSearch"
                type="search"
                placeholder="Search name, reg no, email"
                className="px-3 py-2 rounded-full bg-white/70 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 text-sm focus:outline-none focus:ring-brand-500"
                autoComplete="off"
              />
            </div>
          </div>
          <div id="studentsWrap" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 justify-items-center" />
          <div id="emptyState" className="hidden text-sm text-neutral-600 dark:text-white/70">
            No students match the current filters.
          </div>
        </section>
      </main>
      <div className="fixed bottom-3 right-3 z-40">
        <button
          id="scrollTop"
          className="hidden size-10 rounded-full bg-brand-500 hover:bg-brand-600 text-white shadow-glow flex items-center justify-center"
        >
          <span className="material-symbols-rounded">
            north
          </span>
        </button>
      </div>
      <script src="/_legacy/teacher_class_students/script-04.js" />
    </LegacyPage>
  );
}
