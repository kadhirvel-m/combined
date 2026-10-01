// Converted from ui/branch_college.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/branch_college/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "PaperX Admin - College Hierarchy",
};

export default function BranchCollegePage() {
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
      <link rel="stylesheet" href="/_legacy/branch_college/style-01.css" />
      {/* ── original <body> ── */}
      <header className="sticky top-0 z-30 border-b border-black/5 dark:border-white/10 bg-white/70 dark:bg-black/25 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img src="assets/img/logo-light.svg" alt="PaperX" className="h-8 w-auto dark:hidden" />
            {" "}
            <img src="assets/img/logo-dark.svg" alt="PaperX" className="h-8 w-auto hidden dark:block" />
            {" "}
            <div className="min-w-0">
              <h1 id="pageTitle" className="text-lg sm:text-xl font-extrabold tracking-tight truncate">
                College Hierarchy
              </h1>
              <p className="text-[12px] muted truncate">
                {"Degree -> Department -> Batch -> Section"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="branch.html"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ring-1 ring-black/10 dark:ring-white/15 bg-white/75 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 transition"
            >
              {" "}
              <span className="material-symbols-rounded text-[18px]">
                arrow_back
              </span>
              {" Back "}
            </a>
            {" "}
            <button
              id="themeToggle"
              className="h-10 w-10 rounded-full ring-1 ring-black/10 dark:ring-white/15 bg-white/75 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 transition"
              title="Toggle theme"
            >
              <span className="material-symbols-rounded text-[20px]">
                dark_mode
              </span>
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <section className="glass rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-4">
            <div
              id="logoWrap"
              className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#9E4B8A] to-[#4C2A59] text-white grid place-items-center text-[11px] font-semibold ring-2 ring-white/40 dark:ring-white/10 shadow-md"
            >
              LOGO
            </div>
            <div>
              <p id="collegeName" className="text-xl font-bold">
                Loading...
              </p>
              <p id="collegeCount" className="text-sm muted" />
            </div>
          </div>
          <p id="statusText" className="mt-3 text-sm muted">
            Loading hierarchy...
          </p>
          <p id="errorText" className="hidden mt-2 text-sm text-red-600 dark:text-red-300" />
        </section>
        <section className="glass rounded-2xl p-4 sm:p-5">
          <div id="hierarchyRoot" className="space-y-3" />
          <p id="emptyText" className="hidden text-sm muted">
            No hierarchy rows found for this college.
          </p>
        </section>
      </main>
      <script src="/_legacy/branch_college/script-01.js" />
    </LegacyPage>
  );
}
