// Converted from ui/active_users.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/active_users/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Active Users — Paper X",
  description: "Active users in last 24 hours with today first/last activity and interactions.",
};

export default function ActiveUsersPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen font-sans antialiased text-neutral-900 dark:text-white bg-hero-light dark:bg-hero-dark"}}
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
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,500,0..1,0&display=swap"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="assets/css/tailwind.css" />
      <script src="/config.js" />
      <link rel="stylesheet" href="/_legacy/active_users/style-01.css" />
      {/* ── original <body> ── */}
      <div className="pointer-events-none fixed inset-0 opacity-[.06] dark:opacity-[.12] bg-mesh-dark" />
      <main className="relative container mx-auto py-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="animate-fadeUp">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide glass-panel">
              <span className="material-symbols-rounded text-brand-500">
                bolt
              </span>
              {" Live activity snapshot "}
            </div>
            {" "}
            <h1 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight">
              {" Active Users "}
              <span className="text-brand-500">
                (last 24h)
              </span>
            </h1>
            <p className="mt-2 text-sm md:text-base text-neutral-700/80 dark:text-white/70 max-w-2xl">
              {" Sorted by most recent activity. Shows today’s first/last activity and today’s interaction count. "}
            </p>
          </div>
          <div className="flex items-center gap-2 animate-fadeUp">
            <button
              id="refreshBtn"
              className="glass-panel rounded-xl px-4 py-2 text-sm font-semibold hover:shadow-glow transition"
            >
              <span className="material-symbols-rounded">
                refresh
              </span>
              {" Refresh "}
            </button>
            {" "}
            <button
              id="themeBtn"
              className="glass-panel rounded-xl px-4 py-2 text-sm font-semibold hover:shadow-glow transition"
            >
              <span className="material-symbols-rounded">
                dark_mode
              </span>
              {" Theme "}
            </button>
          </div>
        </header>
        {/* Summary panels removed as requested */}
        <section className="mt-6 glass-panel rounded-3xl px-5 py-4 animate-fadeUp">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-rounded text-brand-500">
                  tune
                </span>
                {" "}
                <div className="text-sm font-extrabold tracking-tight">
                  Filters
                </div>
              </div>
              <div className="mt-1 text-xs text-neutral-600 dark:text-white/60">
                {" Apply filters to narrow the list. The count updates instantly. "}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-full px-3 py-1 text-xs font-semibold bg-white/45 dark:bg-white/10">
                {" Showing "}
                <span id="filteredCount" className="tabular-nums">
                  —
                </span>
                {" / "}
                <span id="totalCount" className="tabular-nums">
                  —
                </span>
              </div>
              {" "}
              <button
                id="clearFiltersBtn"
                className="glass-panel rounded-xl px-4 py-2 text-sm font-semibold hover:shadow-glow transition"
              >
                <span className="material-symbols-rounded">
                  filter_alt_off
                </span>
                {" Clear "}
              </button>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <label className="block">
              {" "}
              <div className="text-xs font-bold tracking-widest text-neutral-600 dark:text-white/70">
                COLLEGE
              </div>
              {" "}
              <select
                id="filterCollege"
                className="mt-1 w-full glass-panel rounded-2xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-500/40"
              >
                <option value="">
                  All
                </option>
              </select>
              {" "}
            </label>
            {" "}
            <label className="block">
              {" "}
              <div className="text-xs font-bold tracking-widest text-neutral-600 dark:text-white/70">
                DEPARTMENT
              </div>
              {" "}
              <select
                id="filterDept"
                className="mt-1 w-full glass-panel rounded-2xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-500/40"
              >
                <option value="">
                  All
                </option>
              </select>
              {" "}
            </label>
            {" "}
            <label className="block">
              {" "}
              <div className="text-xs font-bold tracking-widest text-neutral-600 dark:text-white/70">
                SEMESTER
              </div>
              {" "}
              <select
                id="filterSem"
                className="mt-1 w-full glass-panel rounded-2xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-500/40"
              >
                <option value="">
                  All
                </option>
              </select>
              {" "}
            </label>
            {" "}
            <label className="block">
              {" "}
              <div className="text-xs font-bold tracking-widest text-neutral-600 dark:text-white/70">
                SECTION
              </div>
              {" "}
              <select
                id="filterSection"
                className="mt-1 w-full glass-panel rounded-2xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-500/40"
              >
                <option value="">
                  All
                </option>
              </select>
              {" "}
            </label>
          </div>
        </section>
        <section className="mt-6 glass-panel rounded-3xl overflow-hidden animate-fadeUp">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-black/5 dark:border-white/10">
            <div className="flex items-center gap-2">
              <span className="material-symbols-rounded text-brand-500">
                group
              </span>
              {" "}
              <div>
                <div className="text-sm font-extrabold tracking-tight">
                  Users
                </div>
                <div className="text-xs text-neutral-600 dark:text-white/60">
                  Most recent activity first
                </div>
              </div>
            </div>
            <div className="text-xs text-neutral-600 dark:text-white/60">
              Auto-updates on refresh
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-white/40 dark:bg-black/10 text-neutral-700 dark:text-white/70 sticky top-0">
                <tr>
                  <th className="text-left px-5 py-3 font-bold">
                    Student
                  </th>
                  <th className="text-left px-5 py-3 font-bold">
                    College
                  </th>
                  <th className="text-left px-5 py-3 font-bold">
                    Dept
                  </th>
                  <th className="text-left px-5 py-3 font-bold">
                    Sem
                  </th>
                  <th className="text-left px-5 py-3 font-bold">
                    Section
                  </th>
                  <th className="text-left px-5 py-3 font-bold">
                    Last active (24h)
                  </th>
                  <th className="text-left px-5 py-3 font-bold">
                    First active (today)
                  </th>
                  <th className="text-left px-5 py-3 font-bold">
                    Last active (today)
                  </th>
                  <th className="text-right px-5 py-3 font-bold">
                    Interactions (today)
                  </th>
                </tr>
              </thead>
              <tbody id="tbody" className="divide-y divide-black/5 dark:divide-white/10" />
            </table>
          </div>
          <div
            id="empty"
            className="hidden px-6 py-12 text-center text-sm text-neutral-700 dark:text-white/70"
          >
            {" No active users found in the last 24 hours. "}
          </div>
          <div
            id="error"
            className="hidden px-6 py-4 text-sm text-red-700 bg-red-50/80 border-t border-red-200/70 dark:text-red-200 dark:bg-red-950/30 dark:border-red-900/50"
          />
        </section>
      </main>
      <script src="/_legacy/active_users/script-01.js" />
    </LegacyPage>
  );
}
