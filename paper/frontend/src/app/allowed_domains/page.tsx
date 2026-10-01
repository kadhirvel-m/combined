// Converted from ui/allowed_domains.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/allowed_domains/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Paper X — Allowed Domains",
};

export default function AllowedDomainsPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen font-sans antialiased text-neutral-900 dark:text-white bg-hero-light dark:bg-hero-dark transition-colors"}}
      head={
        <>
          <link rel="icon" type="image/x-icon" href="./assets/img/favicon.svg" />
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
      <link rel="stylesheet" href="./assets/css/tailwind.css" />
      <script src="/_legacy/allowed_domains/script-01.js" />
      <link rel="stylesheet" href="/_legacy/allowed_domains/style-01.css" />
      <script src="/config.js" />
      {/* ── original <body> ── */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-brand-900/60 backdrop-blur supports-[backdrop-filter]:saturate-150 border-b border-black/5 dark:border-white/10">
        <div className="container mx-auto px-4 flex items-center justify-between py-4">
          <a href="./index.html" className="flex items-center gap-3" aria-label="Paper X Home">
            {" "}
            <img src="./assets/img/logo-light.svg" className="h-10 w-auto dark:hidden" alt="Paper X" />
            {" "}
            <img src="./assets/img/logo-dark.svg" className="h-10 w-auto hidden dark:block" alt="Paper X" />
            {" "}
          </a>
          {" "}
          <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-700 dark:text-white/85">
            <a className="hover:text-brandlt-900 dark:hover:text-white transition" href="./index.html">
              Home
            </a>
            {" "}
            <a className="hover:text-brandlt-900 dark:hover:text-white transition" href="./about.html">
              About
            </a>
            {" "}
            <a className="hover:text-brandlt-900 dark:hover:text-white transition" href="./contact.html">
              Contact
            </a>
            {" "}
            <a
              className="inline-flex items-center gap-1 rounded-full bg-brandlt-200/70 px-3 py-1.5 text-brand-700 dark:bg-white/10 dark:text-white"
              href="#"
            >
              <span>
                Admin
              </span>
              <span className="material-symbols-rounded text-base">
                admin_panel_settings
              </span>
            </a>
          </nav>
          <div className="hidden md:flex items-center gap-2">
            <button
              data-theme-toggle=""
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5 transition"
              aria-label="Toggle theme"
            >
              <span className="material-symbols-rounded">
                dark_mode
              </span>
              <span className="hidden sm:block">
                Theme
              </span>
            </button>
          </div>
          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              data-theme-toggle=""
              aria-label="Toggle theme"
              className="inline-flex items-center justify-center size-10 rounded-full ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              <span className="material-symbols-rounded">
                dark_mode
              </span>
            </button>
          </div>
        </div>
      </header>
      <main>
        <section className="relative overflow-hidden border-b border-black/5 dark:border-white/10">
          <div aria-hidden="true" className="absolute inset-0">
            <div className="absolute -top-36 right-10 h-80 w-80 rounded-full bg-brand-500/20 blur-3xl" />
            <div className="absolute bottom-[-8rem] left-10 h-72 w-72 rounded-full bg-brand-700/25 blur-3xl" />
          </div>
          <div className="relative container mx-auto max-w-6xl px-4 py-10">
            <div className="flex flex-col gap-3">
              <h1 className="text-2xl md:text-4xl font-bold gradient-hero-text">
                Allowed Domains
              </h1>
              <p className="text-neutral-600 dark:text-white/65">
                Manage degree-specific source domains for the Notes generator. Searches prefer these sites with automatic fallback to the web.
              </p>
            </div>
          </div>
        </section>
        <section className="relative">
          <div className="container mx-auto max-w-6xl px-4 py-8">
            <div id="apiBanner" className="hidden mb-4">
              <div className="flex items-start gap-3 rounded-2xl border border-amber-300/60 bg-amber-50 text-amber-900 dark:bg-amber-500/10 dark:text-amber-200 px-4 py-3 text-sm">
                <span className="material-symbols-rounded">
                  warning
                </span>
                {" "}
                <div>
                  <div className="font-semibold">
                    API not reachable
                  </div>
                  <div>
                    {"We couldn't reach "}
                    <span id="apiBaseTxt" />
                    . Ensure your backend is running and API_BASE is set correctly in localStorage.
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Editor Card */}
              <div className="lg:col-span-2 rounded-3xl border border-black/5 dark:border-white/10 bg-white/75 dark:bg-white/5 backdrop-blur p-6 shadow-soft">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">
                      Edit degree
                    </h2>
                    <p id="status" className="text-sm text-neutral-600 dark:text-white/65">
                      Load or create a degree, then add allowed domains.
                    </p>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label className="md:col-span-1 text-sm font-medium text-neutral-700 dark:text-white/85">
                    Select existing
                  </label>
                  {" "}
                  <div className="md:col-span-2">
                    <select
                      id="degreeSelect"
                      className="w-full rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-white/5 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                    />
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label className="md:col-span-1 text-sm font-medium text-neutral-700 dark:text-white/85">
                    Degree label
                  </label>
                  {" "}
                  <div className="md:col-span-2">
                    <input
                      id="degreeInput"
                      type="text"
                      placeholder="e.g., B.Tech, M.Tech, MBBS"
                      className="w-full rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-white/5 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                    />
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label className="md:col-span-1 text-sm font-medium text-neutral-700 dark:text-white/85">
                    Add domain
                  </label>
                  {" "}
                  <div className="md:col-span-2 flex gap-2">
                    <input
                      id="domainInput"
                      type="text"
                      placeholder="e.g., geeksforgeeks.org or https://geeksforgeeks.org"
                      className="flex-1 rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-white/5 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                    />
                    {" "}
                    <button
                      id="addBtn"
                      type="button"
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-500 via-[#B06AB3] to-[#FF7FD1] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(158,75,138,0.35)] hover:shadow-[0_14px_34px_rgba(158,75,138,0.45)] transition"
                    >
                      <span className="material-symbols-rounded text-base">
                        add
                      </span>
                      Add
                    </button>
                  </div>
                </div>
                <div className="mt-4">
                  <div id="domainsList" className="flex flex-wrap gap-2" />
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    id="exportBtn"
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/15 bg-white/80 dark:bg-white/10 px-4 py-2 text-sm font-medium hover:border-brand-500/50 transition"
                  >
                    <span className="material-symbols-rounded text-base">
                      ios_share
                    </span>
                    Export JSON
                  </button>
                  {" "}
                  <input id="importFile" type="file" accept="application/json" className="hidden" />
                  {" "}
                  <button
                    id="importBtn"
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/15 bg-white/80 dark:bg-white/10 px-4 py-2 text-sm font-medium hover:border-brand-500/50 transition"
                  >
                    <span className="material-symbols-rounded text-base">
                      file_upload
                    </span>
                    Import JSON
                  </button>
                  {" "}
                  <button
                    id="saveBtn"
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-500 via-[#B06AB3] to-[#FF7FD1] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(158,75,138,0.35)] hover:shadow-[0_16px_36px_rgba(158,75,138,0.45)] transition"
                  >
                    <span className="material-symbols-rounded text-base">
                      save
                    </span>
                    Save
                  </button>
                </div>
              </div>
              {/* Table Card */}
              <div className="rounded-3xl border border-black/5 dark:border-white/10 bg-white/75 dark:bg-white/5 backdrop-blur p-6 shadow-soft">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">
                    Configured degrees
                  </h2>
                </div>
                <div className="mt-4 rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden">
                  <div className="max-h-[360px] overflow-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-black/5 dark:bg-white/5 text-neutral-700 dark:text-white/80">
                        <tr>
                          <th className="px-4 py-2 text-left">
                            Degree
                          </th>
                          <th className="px-4 py-2 text-left">
                            Domains
                          </th>
                          <th className="px-4 py-2 text-right">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody id="degTable" className="divide-y divide-black/5 dark:divide-white/10" />
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      {/* Toast */}
      <div id="toast" className="fixed right-4 bottom-4 z-50 hidden">
        <div className="flex items-center gap-2 rounded-2xl border border-black/10 dark:border-white/10 bg-white/90 dark:bg-brand-900/90 px-4 py-2 text-sm shadow-soft">
          <span className="material-symbols-rounded text-base" id="toastIcon">
            info
          </span>
          {" "}
          <span id="toastMsg">
            Saved
          </span>
        </div>
      </div>
      <script src="/_legacy/allowed_domains/script-02.js" />
      <script src="/_legacy/allowed_domains/script-03.js" />
    </LegacyPage>
  );
}
