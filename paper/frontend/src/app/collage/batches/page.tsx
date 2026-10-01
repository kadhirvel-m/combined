// Converted from ui/collage/batches.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/collage/batches/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Paper X — Batches",
};

export default function CollageBatchesPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen font-sans antialiased text-neutral-900 dark:text-white bg-hero-light dark:bg-hero-dark transition-colors"}}
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
      <link rel="stylesheet" href="/_legacy/collage/batches/style-01.css" />
      <script src="/_legacy/collage/batches/script-01.js" />
      <script src="/config.js" />
      <script src="helpers.js" />
      {/* ── original <body> ── */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-brand-900/60 backdrop-blur supports-[backdrop-filter]:saturate-150 border-b border-black/5 dark:border-white/10">
        <div className="container flex items-center justify-between py-4">
          <a href="../index.html" className="flex items-center gap-3" aria-label="Paper X Home">
            {" "}
            <img src="../assets/img/logo-light.svg" alt="Paper X" className="h-10 w-auto dark:hidden" />
            {" "}
            <img src="../assets/img/logo-dark.svg" alt="Paper X" className="h-10 w-auto hidden dark:block" />
            {" "}
          </a>
          {" "}
          <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-700 dark:text-white/85">
            <a className="hover:text-brandlt-900 dark:hover:text-white transition" href="../index.html">
              Home
            </a>
            {" "}
            <a className="hover:text-brandlt-900 dark:hover:text-white transition" href="../about.html">
              About
            </a>
            {" "}
            <a className="hover:text-brandlt-900 dark:hover:text-white transition" href="../contact.html">
              Contact
            </a>
            {" "}
            <a className="hover:text-brandlt-900 dark:hover:text-white transition" href="../help.html">
              Help
            </a>
            {" "}
            <a
              className="inline-flex items-center gap-1 rounded-full bg-brandlt-200/70 px-3 py-1.5 text-brand-700 dark:bg-white/10 dark:text-white"
              href="clg_info.html"
            >
              {" "}
              <span>
                Collages
              </span>
              {" "}
              <span className="material-symbols-rounded text-base">
                hub
              </span>
              {" "}
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
              {" "}
              <span className="hidden sm:block">
                Theme
              </span>
            </button>
            {" "}
            <a
              href="../login.html"
              className="text-sm text-neutral-700 dark:text-white/85 hover:text-brandlt-900 dark:hover:text-white px-3 py-2 rounded-full transition"
            >
              Log in
            </a>
            {" "}
            <a
              href="../signup.html"
              className="inline-flex items-center justify-center rounded-full bg-brand-500 text-white text-sm font-semibold px-4 py-2.5 hover:shadow-glow transition"
            >
              Sign up
            </a>
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
            {" "}
            <button
              id="mobileNavToggle"
              type="button"
              aria-expanded="false"
              aria-controls="mobileNavPanel"
              className="inline-flex items-center justify-center size-10 rounded-full ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              <span className="sr-only">
                Toggle navigation
              </span>
              {" "}
              <span className="material-symbols-rounded" data-icon="">
                menu
              </span>
            </button>
          </div>
        </div>
      </header>
      <div
        id="mobileNavBackdrop"
        aria-hidden="true"
        className="md:hidden fixed inset-0 z-40 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
      />
      <nav
        id="mobileNavPanel"
        aria-hidden="true"
        className="md:hidden fixed inset-x-4 top-24 z-50 flex flex-col gap-5 max-h-[calc(100vh-6.5rem)] overflow-y-auto rounded-3xl border border-black/10 dark:border-white/10 bg-white/95 dark:bg-brand-900/95 shadow-[0_1.5rem_4rem_-1.5rem_rgba(30,30,47,0.75)] backdrop-blur supports-[backdrop-filter]:backdrop-blur-xl p-6"
      >
        <div className="flex flex-col gap-2 text-sm text-neutral-700 dark:text-white/80">
          <a
            href="../index.html"
            data-close-mobile-nav=""
            className="rounded-xl px-3 py-2 hover:bg-brandlt-100/70 hover:dark:bg-brand-700/20 transition"
          >
            Home
          </a>
          {" "}
          <a
            href="../about.html"
            data-close-mobile-nav=""
            className="rounded-xl px-3 py-2 hover:bg-brandlt-100/70 hover:dark:bg-brand-700/20 transition"
          >
            About
          </a>
          {" "}
          <a
            href="../contact.html"
            data-close-mobile-nav=""
            className="rounded-xl px-3 py-2 hover:bg-brandlt-100/70 hover:dark:bg-brand-700/20 transition"
          >
            Contact
          </a>
          {" "}
          <a
            href="../help.html"
            data-close-mobile-nav=""
            className="rounded-xl px-3 py-2 hover:bg-brandlt-100/70 hover:dark:bg-brand-700/20 transition"
          >
            Help
          </a>
          {" "}
          <a
            href="clg_info.html"
            data-close-mobile-nav=""
            className="rounded-xl px-3 py-2 bg-brandlt-200/70 dark:bg-white/10 text-brand-700 dark:text-white transition"
          >
            Collages
          </a>
        </div>
        <div className="flex flex-col gap-3 border-t border-black/5 dark:border-white/10 pt-4">
          <a
            href="../login.html"
            data-close-mobile-nav=""
            className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium ring-1 ring-black/10 dark:ring-white/15 text-neutral-700 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10 transition"
          >
            Log in
          </a>
          {" "}
          <a
            href="../signup.html"
            data-close-mobile-nav=""
            className="inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#9E4B8A] via-[#B06AB3] to-[#FF7FD1] shadow-[0_4px_18px_-6px_rgba(158,75,138,0.6)] hover:shadow-[0_6px_24px_-8px_rgba(158,75,138,0.7)] transition"
          >
            Sign up
          </a>
        </div>
      </nav>
      <main>
        <section className="relative overflow-hidden border-b border-black/5 dark:border-white/10 hero-aurora">
          <div aria-hidden="true" className="absolute inset-0">
            <div className="absolute -top-36 right-10 h-80 w-80 rounded-full bg-brand-500/20 blur-3xl" />
            <div className="absolute bottom-[-8rem] left-10 h-72 w-72 rounded-full bg-brand-700/25 blur-3xl" />
          </div>
          <div className="relative container max-w-6xl py-8">
            <div className="flex flex-col gap-6">
              <nav
                id="breadcrumbs"
                className="flex flex-wrap items-center gap-2 text-xs md:text-sm font-medium text-neutral-500 dark:text-white/70"
                aria-label="Breadcrumb"
              />
              <div className="space-y-3">
                <h1 id="pageTitle" className="text-2xl md:text-4xl font-bold gradient-hero-text">
                  Batches
                </h1>
                <p id="pageSubtitle" className="text-neutral-600 dark:text-white/65">
                  Loading batches…
                </p>
                <div>
                  <a
                    id="backLink"
                    href="departments.html"
                    className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/15 bg-white/80 dark:bg-white/5 px-3 py-1.5 text-xs md:text-sm text-neutral-700 dark:text-white/70 hover:border-brand-500/50 transition"
                    title="Back to departments"
                  >
                    {" "}
                    <span className="material-symbols-rounded text-base">
                      arrow_back
                    </span>
                    {" Back "}
                  </a>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm md:text-base text-neutral-600 dark:text-white/65">
                  Create cohorts for this department before assigning subjects.
                </p>
                {" "}
                <button
                  id="addBatchBtn"
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-500 via-[#B06AB3] to-[#FF7FD1] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(158,75,138,0.35)] hover:shadow-[0_14px_34px_rgba(158,75,138,0.45)] transition"
                >
                  <span className="material-symbols-rounded text-base">
                    add
                  </span>
                  {" Add batch "}
                </button>
              </div>
            </div>
          </div>
        </section>
        <section className="py-14">
          <div className="container max-w-6xl">
            <div id="results" className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" />
          </div>
        </section>
      </main>
      <div
        id="batchModal"
        className="fixed inset-0 z-50 hidden flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="batchModalTitle"
      >
        <div
          id="batchModalBackdrop"
          className="fixed inset-0 bg-brand-900/70 dark:bg-black/70 backdrop-blur-sm"
        />
        <div className="relative w-full max-w-xl rounded-3xl border border-black/10 dark:border-white/10 bg-white/95 dark:bg-brand-900/95 shadow-[0_24px_60px_rgba(30,30,47,0.45)]">
          <div className="flex items-start justify-between gap-4 border-b border-black/5 dark:border-white/10 px-6 py-5">
            <div>
              <h2 id="batchModalTitle" className="text-xl font-semibold text-neutral-900 dark:text-white">
                Add a new batch
              </h2>
              <p className="mt-1 text-sm text-neutral-600 dark:text-white/70">
                Set the academic year range for this cohort.
              </p>
            </div>
            {" "}
            <button
              id="batchModalClose"
              type="button"
              className="rounded-full border border-transparent p-2 text-neutral-500 hover:text-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60"
            >
              <span className="material-symbols-rounded text-lg">
                close
              </span>
            </button>
          </div>
          <form id="batchForm" className="space-y-5 px-6 py-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-neutral-700 dark:text-white/85">
                {"From year "}
                <input
                  id="batchFromYear"
                  name="from"
                  type="number"
                  min="1950"
                  max="2100"
                  required
                  className="mt-2 w-full rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-white/5 px-3.5 py-2.5 text-sm text-neutral-900 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                  placeholder="e.g. 2021"
                />
                {" "}
              </label>
              {" "}
              <label className="block text-sm font-medium text-neutral-700 dark:text-white/85">
                {"To year "}
                <input
                  id="batchToYear"
                  name="to"
                  type="number"
                  min="1950"
                  max="2100"
                  required
                  className="mt-2 w-full rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-white/5 px-3.5 py-2.5 text-sm text-neutral-900 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                  placeholder="e.g. 2025"
                />
                {" "}
              </label>
            </div>
            <p id="batchModalMessage" className="hidden text-sm text-red-500" />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                id="batchDeleteBtn"
                type="button"
                className="hidden inline-flex items-center justify-center gap-2 rounded-full border border-red-300/60 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-200 px-4 py-2 text-sm font-medium hover:border-red-400/80 transition"
              >
                <span className="material-symbols-rounded text-base">
                  delete
                </span>
                {" Delete "}
              </button>
              {" "}
              <div className="flex items-center gap-3 ml-auto">
                <button
                  id="batchModalCancel"
                  type="button"
                  className="inline-flex items-center justify-center rounded-full border border-black/10 dark:border-white/15 px-4 py-2 text-sm font-medium text-neutral-600 dark:text-white/70 hover:border-brand-500/50 transition"
                >
                  Cancel
                </button>
                {" "}
                <button
                  id="batchSubmitBtn"
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-500 via-[#B06AB3] to-[#FF7FD1] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(158,75,138,0.35)] hover:shadow-[0_16px_36px_rgba(158,75,138,0.45)] transition"
                >
                  Save batch
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      {/* Existing logic script (adapted only for theme + mobile nav) */}
      <script src="/_legacy/collage/batches/script-02.js" />
      <script src="/_legacy/collage/batches/script-03.js" />
      <script src="/_legacy/collage/batches/script-04.js" />
    </LegacyPage>
  );
}
