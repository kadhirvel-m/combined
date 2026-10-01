// Converted from ui/hod_applications.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/hod_applications/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Paper X — HOD Applications",
};

export default function HodApplicationsPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen font-sans antialiased text-neutral-900 dark:text-white"}}
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
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,600,0,0"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="assets/css/tailwind.css" />
      <link rel="stylesheet" href="/_legacy/hod_applications/style-01.css" />
      <script src="/_legacy/hod_applications/script-01.js" />
      {/* ── original <body> ── */}
      <header className="sticky top-0 z-30 backdrop-blur bg-white/70 dark:bg-brand-900/70 border-b border-black/5 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <a href="index.html" className="flex items-center gap-2 font-bold tracking-tight text-lg">
            {" "}
            <img src="assets/img/logo-light.svg" className="h-8 w-auto dark:hidden" />
            {" "}
            <img src="assets/img/logo-dark.svg" className="h-8 w-auto hidden dark:block" />
            {" "}
            <span className="gradient-text hidden sm:inline">
              Admin • HOD Apps
            </span>
            {" "}
          </a>
          {" "}
          <div className="flex items-center gap-2">
            <a
              href="teacher_applications.html"
              className="hidden sm:inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium bg-white/70 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 hover:bg-white dark:hover:bg-white/20 transition"
            >
              Teacher Applications
            </a>
            {" "}
            <a
              href="staff_approval.html"
              className="hidden sm:inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium bg-white/70 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 hover:bg-white dark:hover:bg-white/20 transition"
            >
              Staff Approval
            </a>
            {" "}
            <a
              href="admin.html"
              className="hidden sm:inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium bg-white/70 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 hover:bg-white dark:hover:bg-white/20 transition"
            >
              Admin Users
            </a>
            {" "}
            <button
              id="themeToggle"
              className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/70 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 hover:bg-white dark:hover:bg-white/20 transition material-symbols-rounded"
              title="Toggle theme"
            >
              dark_mode
            </button>
            {" "}
            <a
              href="profile.html"
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium bg-brand-500 text-white hover:shadow-neon"
            >
              Profile
            </a>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-10 space-y-8" id="pageRoot">
        <section className="space-y-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight gradient-text">
                HOD Applications
              </h1>
              <p className="text-sm md:text-base text-neutral-600 dark:text-white/50 max-w-2xl">
                {"Review HOD-only signups. Approving will assign "}
                <code className="px-1 py-0.5 rounded bg-black/5 dark:bg-white/10 text-xs">
                  hod
                </code>
                {" role and map the user to the selected department."}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <select
                id="appStatusFilter"
                className="rounded-xl bg-white/80 dark:bg-white/10 border border-black/10 dark:border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              >
                <option value="pending">
                  Pending
                </option>
                <option value="approved">
                  Approved
                </option>
                <option value="rejected">
                  Rejected
                </option>
                <option value="">
                  All
                </option>
              </select>
              {" "}
              <button
                id="refreshApps"
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium bg-brand-500 text-white hover:shadow-neon transition"
              >
                <span className="material-symbols-rounded text-[18px]">
                  refresh
                </span>
                Refresh
              </button>
            </div>
          </div>
          <div
            id="appsLoading"
            className="flex items-center gap-3 text-sm text-brand-500 dark:text-magenta hidden"
          >
            <div className="loader-dots">
              <span />
              <span />
              <span />
            </div>
            <span>
              Loading applications…
            </span>
          </div>
          <div id="appsError" className="hidden text-sm text-red-600 dark:text-red-400 font-medium" />
          <div id="appsEmpty" className="hidden text-sm text-neutral-500 dark:text-white/40">
            No applications for this filter.
          </div>
          <div id="appsTableWrapper" className="overflow-x-auto">
            <table className="w-full text-sm table-grid" id="appsTable">
              <thead className="text-left text-[11px] uppercase tracking-wide text-neutral-500 dark:text-white/40">
                <tr className="border-b border-black/5 dark:border-white/10">
                  <th className="py-2 pr-3 font-semibold">
                    Applicant
                  </th>
                  <th className="py-2 pr-3 font-semibold">
                    Academic
                  </th>
                  <th className="py-2 pr-3 font-semibold">
                    Motivation
                  </th>
                  <th className="py-2 pr-3 font-semibold">
                    ID Cards
                  </th>
                  <th className="py-2 pr-3 font-semibold">
                    Submitted
                  </th>
                  <th className="py-2 pr-3 font-semibold">
                    Status
                  </th>
                  <th className="py-2 pr-3 font-semibold">
                    Notes
                  </th>
                  <th className="py-2 pr-3 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody id="appsTbody" className="align-top divide-y divide-black/5 dark:divide-white/10" />
            </table>
          </div>
        </section>
      </main>
      <script src="/config.js" />
      <script src="/auth.js" />
      <script src="/_legacy/hod_applications/script-02.js" />
    </LegacyPage>
  );
}
