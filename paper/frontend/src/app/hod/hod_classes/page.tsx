// Converted from ui/hod/hod_classes.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/hod/hod_classes/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Paper X — HOD • Classes",
};

export default function HodHodClassesPage() {
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
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,600,0,0"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="../assets/css/tailwind.css" />
      <script src="/_legacy/hod/hod_classes/script-01.js" />
      <script src="/config.js" />
      <script src="/auth.js" defer />
      <script src="./hod.js" defer />
      <script src="https://unpkg.com/@lottiefiles/dotlottie-wc@0.8.11/dist/dotlottie-wc.js" type="module" />
      <link rel="stylesheet" href="/_legacy/hod/hod_classes/style-01.css" />
      {/* ── original <body> ── */}
      {/* Loading Overlay (same as Academics) */}
      <div id="pageLoader">
        <dotlottie-wc
          src="https://lottie.host/848055f4-11c7-4032-80e0-d51319c33bca/lF6845uqpU.lottie"
          style={{ width: "300px", height: "300px" }}
          autoplay=""
          loop=""
        />
      </div>
      <header className="sticky top-0 z-40 backdrop-blur bg-white/70 dark:bg-brand-900/70 border-b border-black/5 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <a href="../index.html" className="flex items-center gap-2 font-bold tracking-tight text-lg">
            {" "}
            <img src="../assets/img/logo-light.svg" className="h-8 w-auto dark:hidden" alt="Paper X" />
            {" "}
            <img src="../assets/img/logo-dark.svg" className="h-8 w-auto hidden dark:block" alt="Paper X" />
            {" "}
            <span className="hidden sm:inline text-neutral-600 dark:text-white/70 font-semibold">
              HOD • Classes
            </span>
            {" "}
          </a>
          {" "}
          <div className="flex items-center gap-2">
            <a
              id="hodProfileBtn"
              href="../teacher_profile.html?user=me"
              className="inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white/70 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 hover:bg-white dark:hover:bg-white/20 transition"
              title="Teacher Profile"
              aria-label="Teacher Profile"
            >
              {" "}
              <img
                id="hodProfileImg"
                data-px-src=""
                alt="HOD Profile"
                className="hidden h-full w-full object-cover"
                data-px=""
              />
              {" "}
              <span id="hodProfileFallback" className="material-symbols-rounded text-[20px]">
                person
              </span>
              {" "}
            </a>
            {" "}
            <button
              id="hodSignOutBtn"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium bg-brand-500 text-white hover:bg-brand-600 transition"
              title="Sign out"
              aria-label="Sign out"
            >
              <span className="material-symbols-rounded text-[18px]">
                logout
              </span>
              {" "}
              <span className="hidden sm:inline">
                Sign out
              </span>
            </button>
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
      <main className="max-w-7xl mx-auto px-4 py-10">
        <section className="flex flex-col lg:flex-row lg:items-end gap-6">
          <div className="flex-1 space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold bg-brand-500/10 text-brand-700 dark:text-fuchsia-100 ring-1 ring-brand-500/20">
              <span className="material-symbols-rounded text-[16px]">
                radar
              </span>
              {" CURRENT CLASSES ONLY "}
            </div>
            {" "}
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              {" HOD "}
              <span className="bg-gradient-to-r from-brand-500 via-brand-700 to-brand-900 bg-clip-text text-transparent">
                Class Command Center
              </span>
            </h1>
            <p className="text-sm text-neutral-600 dark:text-white/60">
              Section-first view of your department’s active classes with instant reassign.
            </p>
          </div>
          <div id="hodNav" className="flex flex-wrap gap-2" />
        </section>
        <section className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Command Deck */}
          <aside className="lg:col-span-4 space-y-4">
            <div className="glass rounded-3xl ring-1 ring-black/10 dark:ring-white/10 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-neutral-500 dark:text-white/50">
                    Scope
                  </div>
                  <div id="scopeLine" className="mt-1 font-bold tracking-tight">
                    —
                  </div>
                  <div id="scopeSub" className="mt-1 text-[11px] text-neutral-500 dark:text-white/45">
                    —
                  </div>
                </div>
                {" "}
                <a
                  href="./batch_management.html"
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold bg-white/70 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 hover:bg-white dark:hover:bg-white/15"
                >
                  {" "}
                  <span className="material-symbols-rounded text-[16px]">
                    tune
                  </span>
                  {"Batch Mgmt "}
                </a>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-white/70 dark:bg-white/5 ring-1 ring-black/10 dark:ring-white/10 p-3">
                  <div className="text-[10px] uppercase tracking-wide text-neutral-500 dark:text-white/45">
                    Students
                  </div>
                  <div id="statStudents" className="mt-1 text-lg font-bold">
                    0
                  </div>
                </div>
                <div className="rounded-2xl bg-white/70 dark:bg-white/5 ring-1 ring-black/10 dark:ring-white/10 p-3">
                  <div className="text-[10px] uppercase tracking-wide text-neutral-500 dark:text-white/45">
                    Sections
                  </div>
                  <div id="statSections" className="mt-1 text-lg font-bold">
                    0
                  </div>
                </div>
                <div className="rounded-2xl bg-white/70 dark:bg-white/5 ring-1 ring-black/10 dark:ring-white/10 p-3">
                  <div className="text-[10px] uppercase tracking-wide text-neutral-500 dark:text-white/45">
                    Subjects
                  </div>
                  <div id="statSubjects" className="mt-1 text-lg font-bold">
                    0
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  id="refreshBtn"
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold bg-brand-500 text-white hover:bg-brand-600"
                >
                  <span className="material-symbols-rounded text-[18px]">
                    refresh
                  </span>
                  {"Refresh "}
                </button>
                {" "}
                <button
                  id="expandAllBtn"
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold bg-white/70 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 hover:bg-white dark:hover:bg-white/15"
                >
                  <span className="material-symbols-rounded text-[18px]">
                    unfold_more
                  </span>
                  {"Expand "}
                </button>
                {" "}
                <button
                  id="collapseAllBtn"
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold bg-white/70 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 hover:bg-white dark:hover:bg-white/15"
                >
                  <span className="material-symbols-rounded text-[18px]">
                    unfold_less
                  </span>
                  {"Collapse "}
                </button>
              </div>
            </div>
            <div className="glass rounded-3xl ring-1 ring-black/10 dark:ring-white/10 p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold">
                  Jump to year
                </div>
                <div className="text-[11px] text-neutral-500 dark:text-white/45">
                  Fast navigation
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  className="yearJump rounded-2xl px-4 py-3 text-left bg-white/70 dark:bg-white/5 ring-1 ring-black/10 dark:ring-white/10 hover:bg-white dark:hover:bg-white/10"
                  data-year="1"
                >
                  <div className="text-xs text-neutral-500 dark:text-white/45">
                    Year 1
                  </div>
                  <div className="font-semibold">
                    First
                  </div>
                </button>
                {" "}
                <button
                  className="yearJump rounded-2xl px-4 py-3 text-left bg-white/70 dark:bg-white/5 ring-1 ring-black/10 dark:ring-white/10 hover:bg-white dark:hover:bg-white/10"
                  data-year="2"
                >
                  <div className="text-xs text-neutral-500 dark:text-white/45">
                    Year 2
                  </div>
                  <div className="font-semibold">
                    Second
                  </div>
                </button>
                {" "}
                <button
                  className="yearJump rounded-2xl px-4 py-3 text-left bg-white/70 dark:bg-white/5 ring-1 ring-black/10 dark:ring-white/10 hover:bg-white dark:hover:bg-white/10"
                  data-year="3"
                >
                  <div className="text-xs text-neutral-500 dark:text-white/45">
                    Year 3
                  </div>
                  <div className="font-semibold">
                    Third
                  </div>
                </button>
                {" "}
                <button
                  className="yearJump rounded-2xl px-4 py-3 text-left bg-white/70 dark:bg-white/5 ring-1 ring-black/10 dark:ring-white/10 hover:bg-white dark:hover:bg-white/10"
                  data-year="4"
                >
                  <div className="text-xs text-neutral-500 dark:text-white/45">
                    Year 4
                  </div>
                  <div className="font-semibold">
                    Final
                  </div>
                </button>
              </div>
            </div>
          </aside>
          {/* Mission View */}
          <section className="lg:col-span-8">
            <div className="glass rounded-3xl ring-1 ring-black/10 dark:ring-white/10 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-bold">
                    Active sections
                  </div>
                  <div className="text-[11px] text-neutral-500 dark:text-white/45">
                    Click a section to reveal subjects + assigned staff
                  </div>
                </div>
                <div className="text-xs text-neutral-500 dark:text-white/45">
                  {"Shown: "}
                  <strong id="shownCount">
                    0
                  </strong>
                </div>
              </div>
              <div id="errBox" className="hidden mt-4 text-sm text-red-600 dark:text-red-300" />
              <div id="skel" className="hidden mt-6 space-y-3">
                <div className="h-14 rounded-2xl skeleton" />
                <div className="h-14 rounded-2xl skeleton" />
                <div className="h-24 rounded-2xl skeleton" />
              </div>
              <div id="groups" className="mt-6 space-y-8" />
              <div id="empty" className="hidden mt-6 text-sm opacity-70">
                No classes found.
              </div>
            </div>
          </section>
        </section>
      </main>
      {/* Reassign modal */}
      <div id="modal" className="fixed inset-0 z-50 hidden">
        <div className="absolute inset-0 bg-black/40" data-close="" />
        <div className="absolute inset-x-0 top-14 mx-auto max-w-lg px-4">
          <div className="glass rounded-3xl ring-1 ring-black/10 dark:ring-white/10 p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div id="modalTitle" className="text-lg font-bold tracking-tight">
                  Reassign class
                </div>
                <div className="text-xs text-neutral-500 dark:text-white/45" id="modalSub">
                  –
                </div>
              </div>
              {" "}
              <button
                className="rounded-xl px-3 py-2 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15"
                data-close=""
              >
                <span className="material-symbols-rounded">
                  close
                </span>
              </button>
            </div>
            <div className="mt-4">
              <label className="block text-[11px] font-semibold uppercase tracking-wide mb-1 text-neutral-500 dark:text-white/50">
                New teacher
              </label>
              {" "}
              <select
                id="teacherSelect"
                className="w-full rounded-xl bg-white/70 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 px-3 py-2 text-sm focus:outline-none focus:ring-brand-500"
              />
            </div>
            <div id="modalErr" className="hidden mt-3 text-xs text-red-600 dark:text-red-300" />
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                className="rounded-full px-4 py-2 text-sm font-semibold bg-white/70 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 hover:bg-white dark:hover:bg-white/20"
                data-close=""
              >
                Cancel
              </button>
              {" "}
              <button
                id="saveReassign"
                className="rounded-full px-4 py-2 text-sm font-semibold bg-brand-500 text-white hover:bg-brand-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
      <script src="/_legacy/hod/hod_classes/script-02.js" />
    </LegacyPage>
  );
}
