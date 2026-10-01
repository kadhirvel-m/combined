// Converted from ui/admin.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/admin/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Paper X — Admin Users",
};

export default function AdminPage() {
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
      <link rel="stylesheet" href="/_legacy/admin/style-01.css" />
      <script src="/_legacy/admin/script-01.js" />
      {/* ── original <body> ── */}
      <header className="sticky top-0 z-30 backdrop-blur bg-white/70 dark:bg-brand-900/70 border-b border-black/5 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <a href="index.html" className="flex items-center gap-2 font-bold tracking-tight text-lg">
            <img src="assets/img/logo-light.svg" className="h-8 w-auto dark:hidden" />
            <img src="assets/img/logo-dark.svg" className="h-8 w-auto hidden dark:block" />
            <span className="gradient-text hidden sm:inline">
              Admin • Users
            </span>
          </a>
          {" "}
          <div className="flex items-center gap-2">
            <a
              href="hod_applications.html"
              className="hidden sm:inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium bg-white/70 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 hover:bg-white dark:hover:bg-white/20 transition"
            >
              HOD Applications
            </a>
            {" "}
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
      <main className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        <section className="flex flex-col lg:flex-row lg:items-end gap-6">
          <div className="flex-1 space-y-3">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight gradient-text">
              User Directory
            </h1>
            <p className="text-sm md:text-base text-neutral-600 dark:text-white/60 max-w-2xl">
              Search, filter and inspect every registered profile. This dashboard surfaces core academic + social indicators to help moderation, curation and growth analytics.
            </p>
            <div id="stats" className="flex flex-wrap items-center gap-3 text-xs" />
          </div>
          <div className="w-full max-w-md glass-panel rounded-2xl p-5 ring-1 ring-black/10 dark:ring-white/10 shadow-glass">
            <form id="filterForm" className="space-y-4" autoComplete="off">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-white/40 text-[20px]">
                    search
                  </span>
                  {" "}
                  <input
                    id="searchInput"
                    type="text"
                    placeholder="Search name, email, regno, skill…"
                    className="w-full rounded-xl pl-10 pr-3 py-2.5 bg-white/80 dark:bg-white/10 border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/60"
                  />
                </div>
                <div className="flex items-center gap-1 layout-toggle">
                  <button
                    type="button"
                    data-view="table"
                    className="h-10 w-10 rounded-xl flex items-center justify-center bg-white/70 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 text-neutral-600 dark:text-white/70 hover:bg-white dark:hover:bg-white/20 material-symbols-rounded"
                    title="Table view"
                  >
                    table
                  </button>
                  {" "}
                  <button
                    type="button"
                    data-view="grid"
                    className="h-10 w-10 rounded-xl flex items-center justify-center bg-white/70 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 text-neutral-600 dark:text-white/70 hover:bg-white dark:hover:bg-white/20 material-symbols-rounded"
                    title="Grid view"
                  >
                    grid_view
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
                <select
                  id="semesterFilter"
                  className="rounded-xl bg-white/80 dark:bg-white/10 border border-black/10 dark:border-white/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                >
                  <option value="">
                    Semester
                  </option>
                </select>
                {" "}
                <select
                  id="batchFilter"
                  className="rounded-xl bg-white/80 dark:bg-white/10 border border-black/10 dark:border-white/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                >
                  <option value="">
                    Batch
                  </option>
                </select>
                {" "}
                <select
                  id="deptFilter"
                  className="rounded-xl bg-white/80 dark:bg-white/10 border border-black/10 dark:border-white/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                >
                  <option value="">
                    Department
                  </option>
                </select>
                {" "}
                <select
                  id="sortSelect"
                  className="rounded-xl bg-white/80 dark:bg-white/10 border border-black/10 dark:border-white/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                >
                  <option value="">
                    Sort: Default
                  </option>
                  <option value="name">
                    Name A→Z
                  </option>
                  <option value="semester">
                    Semester ↓
                  </option>
                  <option value="created_desc">
                    Newest
                  </option>
                  <option value="verification">
                    Verification Score ↓
                  </option>
                </select>
              </div>
            </form>
          </div>
        </section>
        <section id="resultsWrapper" className="space-y-4">
          <div id="loadingState" className="flex items-center gap-3 text-sm text-brand-500 dark:text-magenta">
            <div className="loader-dots">
              <span />
              <span />
              <span />
            </div>
            <span>
              Loading users…
            </span>
          </div>
          <div id="errorState" className="hidden text-sm text-red-600 dark:text-red-400 font-medium" />
          <div id="tableView" className="overflow-x-auto hidden">
            <table className="w-full text-sm table-grid">
              <thead className="text-left text-[11px] uppercase tracking-wide text-neutral-500 dark:text-white/40">
                <tr className="border-b border-black/5 dark:border-white/10">
                  <th className="py-2 pr-3 font-semibold">
                    User
                  </th>
                  <th className="py-2 pr-3 font-semibold">
                    Academic
                  </th>
                  <th className="py-2 pr-3 font-semibold">
                    Department
                  </th>
                  <th className="py-2 pr-3 font-semibold">
                    Verification
                  </th>
                  <th className="py-2 pr-3 font-semibold">
                    Role
                  </th>
                  <th className="py-2 pr-3 font-semibold">
                    Updated
                  </th>
                  <th className="py-2 pr-3 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody id="userRows" className="align-top divide-y divide-black/5 dark:divide-white/10" />
            </table>
          </div>
          <div id="gridView" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 hidden" />
          <div
            id="emptyState"
            className="hidden text-center py-12 text-sm text-neutral-500 dark:text-white/40"
          >
            No users match current filters.
          </div>
        </section>
        {/* Teacher Applications Review */}
        <section id="teacherApplicationsSection" className="space-y-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight gradient-text">
                Teacher Applications
              </h2>
              <p className="text-sm text-neutral-600 dark:text-white/50 max-w-2xl">
                {"Review pending teacher signups, inspect submitted ID cards (front & back) and approve or reject with notes. Only approved users gain the "}
                <code className="px-1 py-0.5 rounded bg-black/5 dark:bg-white/10 text-xs">
                  teacher
                </code>
                {" role."}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <select
                id="teacherAppStatusFilter"
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
                id="refreshTeacherApps"
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
            id="teacherAppsLoading"
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
          <div id="teacherAppsError" className="hidden text-sm text-red-600 dark:text-red-400 font-medium" />
          <div id="teacherAppsEmpty" className="hidden text-sm text-neutral-500 dark:text-white/40">
            No applications for this filter.
          </div>
          <div id="teacherAppsTableWrapper" className="overflow-x-auto">
            <table className="w-full text-sm table-grid" id="teacherAppsTable">
              <thead className="text-left text-[11px] uppercase tracking-wide text-neutral-500 dark:text-white/40">
                <tr className="border-b border-black/5 dark:border-white/10">
                  <th className="py-2 pr-3 font-semibold">
                    Applicant
                  </th>
                  <th className="py-2 pr-3 font-semibold">
                    Academic
                  </th>
                  <th className="py-2 pr-3 font-semibold">
                    Subjects
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
              <tbody id="teacherAppsTbody" className="align-top divide-y divide-black/5 dark:divide-white/10" />
            </table>
          </div>
        </section>
      </main>
      <template
        id="rowTemplate"
        dangerouslySetInnerHTML={{ __html: "\n    <tr>\n      <td class=\"py-3 pr-3\">\n        <div class=\"flex items-center gap-3\">\n          <div class=\"relative\">\n            <img data-avatar=\"\" class=\"h-12 w-12 rounded-xl object-cover avatar-ring bg-neutral-200 dark:bg-white/10\" alt=\"avatar\">\n            <span data-initial=\"\" class=\"absolute inset-0 flex items-center justify-center text-xs font-semibold tracking-wide text-neutral-700 dark:text-white/70\"></span>\n          </div>\n          <div>\n            <div class=\"font-semibold leading-tight\" data-name=\"\"></div>\n            <div class=\"text-[11px] opacity-70\" data-email=\"\"></div>\n            <div class=\"mt-1 flex flex-wrap gap-1\" data-status=\"\"></div>\n          </div>\n        </div>\n      </td>\n      <td class=\"py-3 pr-3 text-[12px]\">\n        <div data-academic=\"\" class=\"space-y-1\"></div>\n      </td>\n      <td class=\"py-3 pr-3 text-[12px]\" data-department=\"\"></td>\n      <td class=\"py-3 pr-3\" data-verify=\"\"></td>\n      <td class=\"py-3 pr-3 text-[11px]\" data-role=\"\"></td>\n      <td class=\"py-3 pr-3 text-[11px] opacity-60\" data-updated=\"\"></td>\n      <td class=\"py-3 pr-3 text-[11px]\" data-actions=\"\"></td>\n    </tr>\n  " }}
      />
      <template
        id="cardTemplate"
        dangerouslySetInnerHTML={{ __html: "\n    <article class=\"grid-card rounded-2xl ring-1 ring-black/10 dark:ring-white/10 p-4 hover:shadow-neon transition relative overflow-hidden\">\n      <div class=\"flex items-start gap-3\">\n        <div class=\"relative\">\n          <img data-avatar=\"\" class=\"h-14 w-14 rounded-xl object-cover avatar-ring bg-neutral-200 dark:bg-white/10\" alt=\"avatar\">\n          <span data-initial=\"\" class=\"absolute inset-0 flex items-center justify-center text-sm font-semibold tracking-wide text-neutral-700 dark:text-white/70\"></span>\n        </div>\n        <div class=\"flex-1 min-w-0\">\n          <h3 class=\"font-semibold leading-snug truncate\" data-name=\"\"></h3>\n          <p class=\"text-[11px] opacity-70 truncate\" data-email=\"\"></p>\n          <div class=\"mt-1 flex flex-wrap gap-1\" data-status=\"\"></div>\n        </div>\n        <div class=\"text-[11px] opacity-60\" data-verify=\"\"></div>\n      </div>\n      <div class=\"mt-3 space-y-2 text-[11px]\">\n        <div data-academic=\"\" class=\"flex flex-wrap gap-2\"></div>\n      </div>\n      <div class=\"mt-3 flex items-center justify-between gap-2 text-[10px] opacity-50\"><span data-updated=\"\"></span>\n        <div class=\"flex gap-1\" data-actions-card=\"\">\n          <button class=\"inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/60 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 transition\" data-view-profile=\"\" title=\"View profile\"><span class=\"material-symbols-rounded text-xs\">open_in_new</span></button>\n          <button class=\"inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/80 text-white hover:bg-red-600 transition\" data-delete-user=\"\" title=\"Delete user\"><span class=\"material-symbols-rounded text-xs\">delete</span></button>\n        </div>\n      </div>\n    </article>\n  " }}
      />
      <script src="/config.js" />
      <script src="/auth.js" />
      <script src="/_legacy/admin/script-02.js" />
    </LegacyPage>
  );
}
