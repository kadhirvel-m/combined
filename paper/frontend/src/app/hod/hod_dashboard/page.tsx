// Converted from ui/hod/hod_dashboard.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/hod/hod_dashboard/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Paper X — HOD Portal",
};

export default function HodHodDashboardPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen font-sans antialiased text-neutral-900 dark:text-white"}}
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
      <script src="/_legacy/hod/hod_dashboard/script-01.js" />
      <script src="/config.js" />
      <script src="/auth.js" defer />
      <script src="./hod.js" defer />
      <link rel="stylesheet" href="/_legacy/hod/hod_dashboard/style-01.css" />
      {/* ── original <body> ── */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/70 dark:bg-brand-900/70 border-b border-black/5 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <a href="../index.html" className="flex items-center gap-2 font-bold tracking-tight text-lg">
            {" "}
            <img src="../assets/img/logo-light.svg" className="h-8 w-auto dark:hidden" alt="Paper X" />
            {" "}
            <img src="../assets/img/logo-dark.svg" className="h-8 w-auto hidden dark:block" alt="Paper X" />
            {" "}
            <span className="hidden sm:inline text-neutral-600 dark:text-white/70 font-semibold">
              HOD Portal
            </span>
            {" "}
          </a>
          {" "}
          <div className="flex items-center gap-2">
            <a
              href="../teacher_profile.html?user=me"
              className="hidden sm:inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium bg-white/70 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 hover:bg-white dark:hover:bg-white/20 transition"
            >
              Teacher Profile
            </a>
            {" "}
            <a
              href="./hod_change_password.html"
              className="hidden sm:inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium bg-white/70 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 hover:bg-white dark:hover:bg-white/20 transition"
            >
              {" "}
              <span className="material-symbols-rounded text-[18px]">
                lock_reset
              </span>
              {"Change Password "}
            </a>
            {" "}
            <button
              data-theme-toggle=""
              className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/70 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 hover:bg-white dark:hover:bg-white/20 transition material-symbols-rounded"
              title="Toggle theme"
            >
              dark_mode
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        <section className="flex flex-col lg:flex-row lg:items-end gap-6">
          <div className="flex-1 space-y-2">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Department Overview
            </h1>
            <p className="text-sm md:text-base text-neutral-600 dark:text-white/60 max-w-2xl">
              All classes, staff, and teacher applications across your department scope.
            </p>
            <div id="scopeLine" className="text-xs text-neutral-500 dark:text-white/45" />
          </div>
          <div id="hodNav" className="flex flex-wrap gap-2" />
        </section>
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="glass rounded-2xl p-5 ring-1 ring-black/10 dark:ring-white/10">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-white/50">
              Departments
            </div>
            <div className="mt-2 text-3xl font-extrabold" id="kpiDepartments">
              –
            </div>
          </div>
          <div className="glass rounded-2xl p-5 ring-1 ring-black/10 dark:ring-white/10">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-white/50">
              Classes
            </div>
            <div className="mt-2 text-3xl font-extrabold" id="kpiClasses">
              –
            </div>
          </div>
          <div className="glass rounded-2xl p-5 ring-1 ring-black/10 dark:ring-white/10">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-white/50">
              Staff
            </div>
            <div className="mt-2 text-3xl font-extrabold" id="kpiStaff">
              –
            </div>
          </div>
          <div className="glass rounded-2xl p-5 ring-1 ring-black/10 dark:ring-white/10">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-white/50">
              Pending Applications
            </div>
            <div className="mt-2 text-3xl font-extrabold" id="kpiPending">
              –
            </div>
          </div>
        </section>
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass rounded-3xl p-6 ring-1 ring-black/10 dark:ring-white/10">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="text-sm font-semibold tracking-tight">
                  Departments in Scope
                </div>
                <div className="text-[11px] text-neutral-500 dark:text-white/45">
                  Configured via HOD mapping (or your teacher profile department).
                </div>
              </div>
              {" "}
              <a
                href="./hod_classes.html"
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold bg-brand-500 text-white hover:bg-brand-600"
              >
                {" "}
                <span className="material-symbols-rounded text-[18px]">
                  class
                </span>
                {"View classes "}
              </a>
            </div>
            <div id="deptGrid" className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4" />
            <div id="deptErr" className="hidden mt-4 text-sm text-red-600 dark:text-red-300" />
          </div>
          <div className="glass rounded-3xl p-6 ring-1 ring-black/10 dark:ring-white/10">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold tracking-tight">
                  Quick AI
                </div>
                <div className="text-[11px] text-neutral-500 dark:text-white/45">
                  Generate a quick meeting agenda.
                </div>
              </div>
              {" "}
              <button
                id="btnAgenda"
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold bg-brand-500 text-white hover:bg-brand-600"
              >
                <span className="material-symbols-rounded text-[18px]">
                  auto_awesome
                </span>
                {"Generate "}
              </button>
            </div>
            <div className="mt-4">
              <textarea
                id="agendaFocus"
                rows={3}
                placeholder="Optional focus: e.g., syllabus coverage, test performance, staff allocation"
                className="w-full rounded-2xl bg-white/70 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 px-4 py-3 text-sm focus:outline-none focus:ring-brand-500"
              />
            </div>
            <pre
              id="agendaOut"
              className="mt-4 text-xs whitespace-pre-wrap rounded-2xl bg-black/5 dark:bg-white/5 ring-1 ring-black/10 dark:ring-white/10 p-4 max-h-72 overflow-auto"
            />
            <div id="aiErr" className="hidden mt-3 text-xs text-red-600 dark:text-red-300" />
          </div>
        </section>
      </main>
      <script src="/_legacy/hod/hod_dashboard/script-02.js" />
    </LegacyPage>
  );
}
