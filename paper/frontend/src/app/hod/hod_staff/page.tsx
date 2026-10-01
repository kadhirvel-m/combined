// Converted from ui/hod/hod_staff.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/hod/hod_staff/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Paper X — HOD • Staff",
};

export default function HodHodStaffPage() {
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
      <script src="/_legacy/hod/hod_staff/script-01.js" />
      <script src="/config.js" />
      <script src="/auth.js" defer />
      <script src="./hod.js" defer />
      <script src="https://unpkg.com/@lottiefiles/dotlottie-wc@0.8.11/dist/dotlottie-wc.js" type="module" />
      <link rel="stylesheet" href="/_legacy/hod/hod_staff/style-01.css" />
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
          <a href="./hod_dashboard.html" className="flex items-center gap-2 font-bold tracking-tight text-lg">
            {" "}
            <img src="../assets/img/logo-light.svg" className="h-8 w-auto dark:hidden" alt="Paper X" />
            {" "}
            <img src="../assets/img/logo-dark.svg" className="h-8 w-auto hidden dark:block" alt="Paper X" />
            {" "}
            <span className="hidden sm:inline text-neutral-600 dark:text-white/70 font-semibold">
              HOD • Staff
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
      <main className="max-w-7xl mx-auto px-4 py-10 space-y-6">
        <section className="flex flex-col lg:flex-row lg:items-end gap-6">
          <div className="flex-1 space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold bg-brand-500/10 text-brand-700 dark:text-fuchsia-100 ring-1 ring-brand-500/20">
              <span className="material-symbols-rounded text-[16px]">
                groups
              </span>
              {" DEPARTMENT STAFF DIRECTORY "}
            </div>
            {" "}
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              {" HOD "}
              <span className="bg-gradient-to-r from-brand-500 via-brand-700 to-brand-900 bg-clip-text text-transparent">
                Staff Control
              </span>
            </h1>
            <p className="text-sm text-neutral-600 dark:text-white/60">
              Click a staff card to view details or remove from department (typed confirmation required).
            </p>
          </div>
          <div id="hodNav" className="flex flex-wrap gap-2" />
        </section>
        <section className="glass rounded-3xl p-6 ring-1 ring-black/10 dark:ring-white/10">
          <div className="flex flex-col lg:flex-row gap-3 lg:items-end lg:justify-between">
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wide mb-1 text-neutral-500 dark:text-white/50">
                  Department
                </label>
                {" "}
                <select
                  id="deptSelect"
                  className="rounded-xl bg-white/70 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 px-3 py-2 text-sm focus:outline-none focus:ring-brand-500"
                />
              </div>
              <div className="min-w-[240px]">
                <label className="block text-[11px] font-semibold uppercase tracking-wide mb-1 text-neutral-500 dark:text-white/50">
                  Search
                </label>
                {" "}
                <input
                  id="qInput"
                  placeholder="Name / email"
                  className="w-full rounded-xl bg-white/70 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 px-3 py-2 text-sm focus:outline-none focus:ring-brand-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
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
              <span className="text-xs text-neutral-500 dark:text-white/45">
                {"Shown: "}
                <strong id="shownCount">
                  0
                </strong>
              </span>
            </div>
          </div>
          <div id="errBox" className="hidden mt-4 text-sm text-red-600 dark:text-red-300" />
          <div id="skel" className="hidden mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <div className="h-32 rounded-2xl skeleton" />
            <div className="h-32 rounded-2xl skeleton" />
            <div className="h-32 rounded-2xl skeleton" />
            <div className="h-32 rounded-2xl skeleton" />
            <div className="h-32 rounded-2xl skeleton" />
            <div className="h-32 rounded-2xl skeleton" />
          </div>
          <div id="grid" className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4" />
          <div id="empty" className="hidden mt-6 text-sm opacity-60">
            No staff found.
          </div>
        </section>
      </main>
      {/* Staff details modal */}
      <div id="staffModal" className="hidden fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black/25 dark:bg-black/50 backdrop-blur-sm" data-close-modal="" />
        <div className="relative min-h-full flex items-center justify-center p-4">
          <div className="w-full max-w-5xl rounded-3xl glass ring-1 ring-black/10 dark:ring-white/10 overflow-hidden text-neutral-900 dark:text-white">
            <div className="px-5 py-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-rounded text-[20px]">
                  badge
                </span>
                {" "}
                <div className="font-semibold tracking-tight">
                  Staff details
                </div>
              </div>
              {" "}
              <button
                id="modalClose"
                className="h-10 w-10 rounded-full bg-white/70 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 hover:bg-white dark:hover:bg-white/20 grid place-items-center"
                title="Close"
              >
                <span className="material-symbols-rounded">
                  close
                </span>
              </button>
            </div>
            <div className="p-5 max-h-[88vh] overflow-y-auto">
              <div id="modalBody" />
              <div
                id="removePane"
                className="hidden mt-5 rounded-2xl bg-red-500/10 ring-1 ring-red-500/20 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-red-700 dark:text-red-200">
                      Confirm removal
                    </div>
                    <div className="mt-1 text-sm text-red-700/80 dark:text-red-200/80">
                      {"Type "}
                      <strong>
                        remove
                      </strong>
                      {" to confirm. This will remove the staff from the department and unassign their classes."}
                    </div>
                  </div>
                  {" "}
                  <button
                    id="removeCancel"
                    className="h-9 w-9 rounded-full bg-white/70 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 hover:bg-white dark:hover:bg-white/20 grid place-items-center"
                    title="Cancel"
                  >
                    <span className="material-symbols-rounded text-[18px]">
                      close
                    </span>
                  </button>
                </div>
                <div className="mt-3 flex flex-col sm:flex-row gap-3 sm:items-end">
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold uppercase tracking-wide mb-1 text-red-700/70 dark:text-red-200/70">
                      Type remove
                    </label>
                    {" "}
                    <input
                      id="removeInput"
                      placeholder="remove"
                      className="w-full rounded-xl bg-white/70 dark:bg-white/10 ring-1 ring-red-500/30 px-3 py-2 text-sm focus:outline-none focus:ring-red-500"
                    />
                  </div>
                  {" "}
                  <button
                    id="removeConfirm"
                    disabled
                    className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold bg-red-600/85 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-600"
                  >
                    <span className="material-symbols-rounded text-[18px]">
                      delete_forever
                    </span>
                    {"Remove "}
                  </button>
                </div>
                <div id="removeErr" className="hidden mt-3 text-sm text-red-700 dark:text-red-200" />
              </div>
            </div>
            <div className="px-5 py-4 border-t border-black/5 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur flex items-center justify-end gap-2">
              <a
                id="modalProfile"
                href="#"
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15"
              >
                {" "}
                <span className="material-symbols-rounded text-[16px]">
                  open_in_new
                </span>
                {"Open profile "}
              </a>
              {" "}
              <button
                id="removeBtn"
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold bg-red-600/85 text-white hover:bg-red-600 shadow-sm ring-1 ring-red-500/30"
              >
                <span className="material-symbols-rounded text-[18px]">
                  person_remove
                </span>
                {"Remove from dept "}
              </button>
            </div>
          </div>
        </div>
      </div>
      <script src="/_legacy/hod/hod_staff/script-02.js" />
    </LegacyPage>
  );
}
