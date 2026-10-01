// Converted from ui/branch.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/branch/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "PaperX Admin - Branch Hierarchy",
};

export default function BranchPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen antialiased text-neutral-900 dark:text-white"}}
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
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"}
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,500,0,0"
        rel="stylesheet"
      />
      <link rel="stylesheet" href="assets/css/tailwind.css" />
      <script src="/config.js" />
      <link rel="stylesheet" href="/_legacy/branch/style-01.css" />
      {/* ── original <body> ── */}
      <header className="sticky top-0 z-30 border-b border-black/5 dark:border-white/10 bg-white/70 dark:bg-black/25 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img src="assets/img/logo-light.svg" alt="PaperX" className="h-8 w-auto dark:hidden" />
            {" "}
            <img src="assets/img/logo-dark.svg" alt="PaperX" className="h-8 w-auto hidden dark:block" />
            {" "}
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight truncate">
                Branch Hierarchy
              </h1>
              <p className="text-[12px] muted truncate">
                {"College -> Degree -> Department -> Batch -> Section (Student Counts)"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="themeToggle"
              className="h-10 w-10 rounded-full ring-1 ring-black/10 dark:ring-white/15 bg-white/75 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 transition"
              title="Toggle theme"
            >
              <span className="material-symbols-rounded text-[20px]">
                dark_mode
              </span>
            </button>
            {" "}
            <button
              id="refreshBtn"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold bg-[#9E4B8A] text-white hover:opacity-95 transition"
            >
              <span className="material-symbols-rounded text-[18px]">
                refresh
              </span>
              {" Reload "}
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <section className="glass rounded-2xl p-4 sm:p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="rounded-xl bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 px-4 py-3">
              <p className="text-[11px] uppercase tracking-wide muted">
                Students
              </p>
              <p id="statStudents" className="text-2xl font-extrabold">
                0
              </p>
            </div>
            <div className="rounded-xl bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 px-4 py-3">
              <p className="text-[11px] uppercase tracking-wide muted">
                Colleges
              </p>
              <p id="statColleges" className="text-2xl font-extrabold">
                0
              </p>
            </div>
            <div className="rounded-xl bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 px-4 py-3">
              <p className="text-[11px] uppercase tracking-wide muted">
                Degrees
              </p>
              <p id="statDegrees" className="text-2xl font-extrabold">
                0
              </p>
            </div>
            <div className="rounded-xl bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 px-4 py-3">
              <p className="text-[11px] uppercase tracking-wide muted">
                Departments
              </p>
              <p id="statDepartments" className="text-2xl font-extrabold">
                0
              </p>
            </div>
            <div className="rounded-xl bg-white/70 dark:bg-white/5 border border-black/10 dark:border-white/10 px-4 py-3">
              <p className="text-[11px] uppercase tracking-wide muted">
                Batches
              </p>
              <p id="statBatches" className="text-2xl font-extrabold">
                0
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <input
              id="searchInput"
              type="text"
              placeholder="Search college / degree / dept / batch / section"
              className="w-full sm:w-[420px] rounded-xl px-3 py-2.5 text-sm border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#9E4B8A]/60"
            />
            {" "}
            <span id="statusBadge" className="badge">
              {" "}
              <span className="material-symbols-rounded text-[14px]">
                hourglass_empty
              </span>
              {" Loading... "}
            </span>
          </div>
          <p id="errorText" className="hidden mt-3 text-sm text-red-600 dark:text-red-300" />
        </section>
        <section className="glass rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-lg font-bold">
              Hierarchy View
            </h2>
          </div>
          <div id="hierarchyRoot" className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" />
          <p id="emptyText" className="hidden text-sm muted">
            No student records found for current filters.
          </p>
        </section>
      </main>
      <script src="/_legacy/branch/script-01.js" />
    </LegacyPage>
  );
}
