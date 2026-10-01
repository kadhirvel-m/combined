// Converted from ui/hod/hod_applications.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/hod/hod_applications/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Paper X — HOD • Applications",
};

export default function HodHodApplicationsPage() {
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
      <script src="/_legacy/hod/hod_applications/script-01.js" />
      <script src="/config.js" />
      <script src="/auth.js" defer />
      <script src="./hod.js" defer />
      <link rel="stylesheet" href="/_legacy/hod/hod_applications/style-01.css" />
      {/* ── original <body> ── */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/70 dark:bg-brand-900/70 border-b border-black/5 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <a href="./hod_dashboard.html" className="flex items-center gap-2 font-bold tracking-tight text-lg">
            {" "}
            <img src="../assets/img/logo-light.svg" className="h-8 w-auto dark:hidden" alt="Paper X" />
            {" "}
            <img src="../assets/img/logo-dark.svg" className="h-8 w-auto hidden dark:block" alt="Paper X" />
            {" "}
            <span className="hidden sm:inline text-neutral-600 dark:text-white/70 font-semibold">
              HOD • Applications
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
            <h1 className="text-3xl font-extrabold tracking-tight">
              Teacher applications
            </h1>
            <p className="text-sm text-neutral-600 dark:text-white/60">
              Review pending applications and add your recommendation note.
            </p>
          </div>
          <div id="hodNav" className="flex flex-wrap gap-2" />
        </section>
        <section className="glass rounded-3xl p-6 ring-1 ring-black/10 dark:ring-white/10">
          <div className="flex flex-col lg:flex-row gap-3 lg:items-end lg:justify-between">
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wide mb-1 text-neutral-500 dark:text-white/50">
                  Status
                </label>
                {" "}
                <select
                  id="statusSelect"
                  className="rounded-xl bg-white/70 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 px-3 py-2 text-sm focus:outline-none focus:ring-brand-500"
                >
                  <option value="">
                    All
                  </option>
                  <option value="pending">
                    Pending
                  </option>
                  <option value="approved">
                    Approved
                  </option>
                  <option value="rejected">
                    Rejected
                  </option>
                </select>
              </div>
              <div className="min-w-[260px] flex-1">
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
          <div id="list" className="mt-6 space-y-4" />
          <div id="empty" className="hidden mt-6 text-sm opacity-60">
            No applications found.
          </div>
        </section>
      </main>
      <script src="/_legacy/hod/hod_applications/script-02.js" />
    </LegacyPage>
  );
}
