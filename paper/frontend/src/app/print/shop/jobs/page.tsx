// Converted from ui/print/shop/jobs.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/print/shop/jobs/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Shop Jobs — PaperX",
};

export default function PrintShopJobsPage() {
  return (
    <LegacyPage
      html={{"lang":"en"}}
      body={{"class":"min-h-screen font-sans antialiased text-neutral-900 dark:text-white bg-glow dark:bg-[radial-gradient(1200px_600px_at_10%_-10%,rgba(158,75,138,.22),transparent),radial-gradient(900px_500px_at_110%_10%,rgba(30,30,47,.7),transparent)]"}}
      head={
        <>
          <link rel="icon" type="image/x-icon" href="../../assets/img/favicon.svg" />
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
      <link rel="stylesheet" href="../../assets/css/tailwind.css" />
      <script src="/config.js" />
      <script src="/auth.js" defer />
      <script src="/_legacy/print/shop/jobs/script-01.js" />
      <link rel="stylesheet" href="/_legacy/print/shop/jobs/style-01.css" />
      {/* ── original <body> ── */}
      {/* App Bar */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-brand-900/60 backdrop-blur border-b border-black/5 dark:border-white/10">
        <div className="container flex items-center justify-between h-16">
          <a href="../index.html" className="flex items-center gap-2" aria-label="Paper X Home">
            {" "}
            <img src="../../assets/img/logo-light.svg" alt="Paper X" className="h-8 w-auto dark:hidden" />
            {" "}
            <img src="../../assets/img/logo-dark.svg" alt="Paper X" className="h-8 w-auto hidden dark:block" />
            {" "}
          </a>
          {" "}
          <nav className="hidden md:flex items-center gap-2 text-sm">
            <a href="./jobs.html" className="rounded-full px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10">
              <span className="material-symbols-rounded text-base">
                assignment
              </span>
              {" Jobs"}
            </a>
            {" "}
            <a
              href="./payments.html"
              className="rounded-full px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10"
            >
              <span className="material-symbols-rounded text-base">
                payments
              </span>
              {" Payments"}
            </a>
            {" "}
            <a
              href="./profile.html"
              className="rounded-full px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10"
            >
              <span className="material-symbols-rounded text-base">
                storefront
              </span>
              {" Shop Profile"}
            </a>
            {" "}
            <button
              data-theme-toggle=""
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5"
              aria-label="Toggle theme"
            >
              <span className="material-symbols-rounded text-base">
                dark_mode
              </span>
              {" "}
              <span className="hidden sm:block">
                Theme
              </span>
            </button>
            {" "}
            {/* Shop avatar (logo) linking to shop profile */}
            <a
              id="shopProfile"
              href="./profile.html"
              title="My Shop"
              className="items-center justify-center w-10 h-10 rounded-full overflow-hidden border border-black/10 dark:border-white/10 bg-white/90 dark:bg-brand-900/60 hidden"
            >
              {" "}
              <img id="shopProfileImg" alt="Shop" className="w-full h-full object-cover hidden" />
              {" "}
              <span id="shopProfileInitial" className="text-xs font-semibold">
                SH
              </span>
              {" "}
            </a>
            {" "}
            <button
              id="signOutBtn"
              type="button"
              title="Sign out"
              aria-label="Sign out"
              className="hidden items-center gap-2 rounded-full border border-black/10 dark:border-white/15 px-3 py-1.5 text-sm text-neutral-700 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              <span className="material-symbols-rounded text-base">
                logout
              </span>
              {" "}
              <span>
                Sign out
              </span>
            </button>
          </nav>
        </div>
      </header>
      {/* Filters (moved into main so hero appears above status filters) */}
      <main className="container py-6">
        {/* Hero / header — modern, non-boxy presentation */}
        <section className="mb-6">
          <div className="relative rounded-3xl overflow-hidden p-6 md:p-8">
            <div className="absolute inset-0 -z-10 hero-overlay bg-gradient-to-tr from-white/40 via-transparent to-white/10 dark:from-black/20 dark:via-transparent dark:to-black/10" />
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold gradient-hero-text">
                  Jobs Board
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <div
                  id="summaryTop"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-full glass text-[13px]"
                >
                  Showing latest jobs
                </div>
                {" "}
                <div className="hidden sm:flex items-center gap-2">
                  <div className="kpi ring-soft bg-white/95 dark:bg-brand-900/70 text-neutral-800 dark:text-white/90 shadow-neon">
                    <span className="text-[12px] opacity-70">
                      Submitted
                    </span>
                    {" "}
                    <span id="k_submitted" className="num">
                      0
                    </span>
                  </div>
                  <div className="kpi ring-soft bg-white/95 dark:bg-brand-900/70 text-neutral-800 dark:text-white/90 shadow-neon">
                    <span className="text-[12px] opacity-70">
                      Printing
                    </span>
                    {" "}
                    <span id="k_printing" className="num">
                      0
                    </span>
                  </div>
                  <div className="kpi ring-soft bg-white/95 dark:bg-brand-900/70 text-neutral-800 dark:text-white/90 shadow-neon">
                    <span className="text-[12px] opacity-70">
                      Ready
                    </span>
                    {" "}
                    <span id="k_ready" className="num">
                      0
                    </span>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <a href="#" className="hero-newjob">
                    New Job
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Status filters (moved here so hero appears above them) */}
        <div className="mb-4">
          <div className="glass rounded-2xl ring-1 ring-black/5 dark:ring-white/10 p-3">
            <div id="filters" className="flex flex-wrap items-center gap-2 text-[12px]" />
          </div>
        </div>
        {/* Date Filters moved below Jobs Board section */}
        <div id="dateFiltersWrap" className="mb-3 flex justify-end">
          <div className="glass rounded-2xl ring-1 ring-black/5 dark:ring-white/10 p-3">
            <div id="dateFilters" className="flex flex-wrap items-center gap-2 text-[12px]" />
          </div>
        </div>
        <div id="summary" className="text-[12px] opacity-80 mb-3" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" id="list" />
        <div id="empty" className="hidden text-sm opacity-70">
          No jobs.
        </div>
      </main>
      {/* Modal */}
      <div id="jobModal" className="fixed inset-0 z-50 hidden">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm md:backdrop-blur" data-close-modal="" />
        {/* Centered content */}
        <div className="relative z-10 flex items-center justify-center min-h-full p-4">
          <div className="w-full max-w-xl rounded-2xl ring-1 ring-black/5 dark:ring-white/10 shadow-2xl p-4 bg-white/95 dark:bg-brand-900/95">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">
                Job Details
              </div>
              {" "}
              <button
                className="px-2 py-1 rounded-md text-[12px] ring-1 ring-black/10 dark:ring-white/15"
                data-close-modal=""
              >
                Close
              </button>
            </div>
            <div id="jobDetail" className="text-[13px] space-y-3" />
            <div className="mt-3 flex items-center justify-between">
              <div id="jobMeta" className="text-[11px] opacity-70" />
              <div id="jobActions" className="flex items-center gap-2" />
            </div>
          </div>
        </div>
      </div>
      <script src="/_legacy/print/shop/jobs/script-02.js" />
    </LegacyPage>
  );
}
