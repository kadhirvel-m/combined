// Converted from ui/teachers/teacher_class.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/teachers/teacher_class/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Teachers Notes — Paper X",
};

export default function TeachersTeacherClassPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"font-sans antialiased text-neutral-900 dark:text-white bg-hero-light dark:bg-hero-dark min-h-screen flex flex-col overflow-x-hidden"}}
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
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,600,0,0"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="../assets/css/tailwind.css" />
      <script src="/_legacy/teachers/teacher_class/script-01.js" />
      <script src="/config.js" />
      <link rel="stylesheet" href="/_legacy/teachers/teacher_class/style-01.css" />
      <script src="/_legacy/teachers/teacher_class/script-02.js" />
      {/* ── original <body> ── */}
      <header className="bg-white/70 dark:bg-brand-900/60 backdrop-blur border-b border-black/5 dark:border-white/10">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <a href="../index.html" className="flex items-center gap-2">
              {" "}
              <img src="../assets/img/logo-light.svg" className="h-8 dark:hidden" alt="Paper X" />
              {" "}
              <img src="../assets/img/logo-dark.svg" className="h-8 hidden dark:block" alt="Paper X" />
              {" "}
            </a>
            {" "}
            <h1 className="text-lg font-semibold tracking-tight hidden sm:block">
              Teachers Notes
            </h1>
          </div>
          <nav className="hidden md:flex items-center gap-5 text-sm text-neutral-700 dark:text-white/80">
            <a href="../teachers/teacher_notes.html" className="hover:text-brandlt-900 dark:hover:text-white">
              Upload
            </a>
            {" "}
            <a
              href="../teachers/teacher_connect.html"
              className="hover:text-brandlt-900 dark:hover:text-white"
            >
              Connect
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <input
              id="searchInput"
              type="text"
              placeholder="Search..."
              className="hidden md:block text-sm rounded-full px-3 py-2 bg-white/80 dark:bg-brand-900/40 ring-1 ring-black/10 dark:ring-white/15 focus:ring-brand-500 focus:outline-none"
            />
            {" "}
            <button
              data-theme-toggle=""
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5"
              aria-label="Toggle theme"
            >
              <span className="material-symbols-rounded text-base">
                dark_mode
              </span>
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-8 grid lg:grid-cols-12 gap-8">
          {/* Filters */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="rounded-2xl bg-white/80 dark:bg-brand-900/50 backdrop-blur ring-1 ring-black/10 dark:ring-white/10 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-white/50">
                  Filters
                </h2>
                {" "}
                <button id="resetFilters" className="text-xs text-brand-500 hover:underline">
                  Reset
                </button>
              </div>
              <div className="space-y-4 text-sm max-h-[70vh] overflow-y-auto pr-1" id="filtersContainer">
                <div>
                  <label className="block text-[10px] uppercase font-semibold mb-1">
                    Subject
                  </label>
                  {" "}
                  <select
                    id="filterSubject"
                    className="w-full rounded-lg bg-white/90 dark:bg-brand-900/40 ring-1 ring-black/10 dark:ring-white/10"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-semibold mb-1">
                    Exam Type
                  </label>
                  {" "}
                  <select
                    id="filterExamType"
                    className="w-full rounded-lg bg-white/90 dark:bg-brand-900/40 ring-1 ring-black/10 dark:ring-white/10"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-semibold mb-1">
                    Semester
                  </label>
                  {" "}
                  <select
                    id="filterSemester"
                    className="w-full rounded-lg bg-white/90 dark:bg-brand-900/40 ring-1 ring-black/10 dark:ring-white/10"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-semibold mb-1">
                    College
                  </label>
                  {" "}
                  <select
                    id="filterCollege"
                    className="w-full rounded-lg bg-white/90 dark:bg-brand-900/40 ring-1 ring-black/10 dark:ring-white/10"
                  />
                </div>
              </div>
            </div>
          </aside>
          {/* Results */}
          <section className="lg:col-span-9 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {"Results "}
                <span id="resultsCount" className="text-sm font-medium text-neutral-500 dark:text-white/50" />
              </h2>
              <div className="flex items-center gap-3 md:hidden w-full">
                <input
                  id="searchInputMobile"
                  type="text"
                  placeholder="Search..."
                  className="flex-1 text-sm rounded-full px-3 py-2 bg-white/80 dark:bg-brand-900/40 ring-1 ring-black/10 dark:ring-white/15 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>
            <div id="loadingState" className="text-sm text-neutral-500 dark:text-white/50 py-10 hidden">
              Loading…
            </div>
            <div id="emptyState" className="text-sm text-neutral-500 dark:text-white/50 py-10 hidden">
              No notes match your filters.
            </div>
            <div id="errorState" className="text-sm text-red-600 dark:text-red-400 py-6 hidden" />
            <div id="notesGrid" className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6" />
          </section>
        </div>
      </main>
      <footer className="py-8 text-center text-xs text-neutral-500 dark:text-white/40">
        © Paper X
      </footer>
      <script src="/_legacy/teachers/teacher_class/script-03.js" />
    </LegacyPage>
  );
}
