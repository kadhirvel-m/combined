// Converted from ui/assignments.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/assignments/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "My Assignments — Paper X",
};

export default function AssignmentsPage() {
  return (
    <LegacyPage
      html={{"lang":"en"}}
      body={{"class":"text-neutral-900 dark:text-white"}}
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
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"}
        rel="stylesheet"
      />
      <link
        href={"https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,500,0,0&display=swap"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="assets/css/tailwind.css" />
      <script src="/config.js" />
      <link rel="stylesheet" href="/_legacy/assignments/style-01.css" />
      <script src="/_legacy/assignments/script-01.js" />
      {/* ── original <body> ── */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#1E1E2F]/80 backdrop-blur border-b border-black/5 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <a href="index.html">
              <img src="assets/img/logo-light.svg" className="h-8 dark:hidden" alt="" />
              <img src="assets/img/logo-dark.svg" className="h-8 hidden dark:block" alt="" />
            </a>
            {" "}
            <h1 className="text-lg font-semibold hidden sm:block">
              My Assignments
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="profile.html"
              className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1"
            >
              <span className="material-symbols-rounded text-lg">
                person
              </span>
              <span className="hidden sm:inline">
                Profile
              </span>
            </a>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6" id="stats">
          <div className="card flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <span className="material-symbols-rounded text-blue-500">
                assignment
              </span>
            </div>
            <div>
              <p className="text-xl font-bold" id="sTotal">
                -
              </p>
              <p className="text-xs text-neutral-500">
                Total
              </p>
            </div>
          </div>
          <div className="card flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
              <span className="material-symbols-rounded text-amber-500">
                pending
              </span>
            </div>
            <div>
              <p className="text-xl font-bold" id="sPending">
                -
              </p>
              <p className="text-xs text-neutral-500">
                Pending
              </p>
            </div>
          </div>
          <div className="card flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <span className="material-symbols-rounded text-emerald-500">
                check_circle
              </span>
            </div>
            <div>
              <p className="text-xl font-bold" id="sSubmitted">
                -
              </p>
              <p className="text-xs text-neutral-500">
                Submitted
              </p>
            </div>
          </div>
          <div className="card flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
              <span className="material-symbols-rounded text-purple-500">
                grade
              </span>
            </div>
            <div>
              <p className="text-xl font-bold" id="sGraded">
                -
              </p>
              <p className="text-xs text-neutral-500">
                Graded
              </p>
            </div>
          </div>
        </div>
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-5" id="filters">
          <button className="filter-btn active" data-f="all">
            All
          </button>
          {" "}
          <button className="filter-btn" data-f="pending">
            Pending
          </button>
          {" "}
          <button className="filter-btn" data-f="submitted">
            Submitted
          </button>
          {" "}
          <button className="filter-btn" data-f="graded">
            Graded
          </button>
          {" "}
          <button className="filter-btn" data-f="overdue">
            Overdue
          </button>
        </div>
        {/* List */}
        <div id="list" className="space-y-3">
          {/* Skeleton loaders */}
          <div className="card">
            <div className="skeleton h-5 w-3/4 mb-3" />
            <div className="skeleton h-4 w-1/2 mb-2" />
            <div className="skeleton h-4 w-1/3" />
          </div>
          <div className="card">
            <div className="skeleton h-5 w-2/3 mb-3" />
            <div className="skeleton h-4 w-1/2 mb-2" />
            <div className="skeleton h-4 w-1/4" />
          </div>
        </div>
        {/* Empty */}
        <div id="empty" className="hidden text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/10 flex items-center justify-center">
            <span className="material-symbols-rounded text-3xl text-purple-500">
              assignment
            </span>
          </div>
          <h3 className="text-lg font-semibold mb-1">
            No assignments
          </h3>
          <p className="text-sm text-neutral-500">
            {"You don't have any assignments yet"}
          </p>
        </div>
      </main>
      <script src="/_legacy/assignments/script-02.js" />
    </LegacyPage>
  );
}
