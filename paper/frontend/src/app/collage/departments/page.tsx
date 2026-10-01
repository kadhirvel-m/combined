// Converted from ui/collage/departments.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/collage/departments/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Paper X — Departments",
};

export default function CollageDepartmentsPage() {
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
      <link rel="stylesheet" href="/_legacy/collage/departments/style-01.css" />
      <script src="/_legacy/collage/departments/script-01.js" />
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
          <div className="relative container max-w-6xl py-5 md:py-7">
            <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-start">
              {/* Left content */}
              <div className="flex flex-col gap-6">
                <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-neutral-500 dark:text-white/70">
                  <nav
                    id="breadcrumbs"
                    aria-label="Breadcrumb"
                    className="inline-flex flex-wrap items-center gap-2 text-xs md:text-sm"
                  />
                  {" "}
                  <span className="hidden md:block h-4 w-px bg-black/10 dark:bg-white/15" />
                  {" "}
                  <a
                    id="backLink"
                    href="degrees.html"
                    className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/15 bg-white/80 dark:bg-white/5 px-3 py-1.5 text-xs md:text-sm font-medium text-neutral-700 dark:text-white/70 hover:border-brand-500/50 transition"
                  >
                    {" "}
                    <span className="material-symbols-rounded text-base">
                      arrow_back
                    </span>
                    {" Back to degrees "}
                  </a>
                </div>
                <div className="space-y-3">
                  <h1 id="pageTitle" className="text-2xl md:text-4xl font-bold gradient-hero-text">
                    {"Departments "}
                  </h1>
                  <p id="pageSubtitle" className="hidden" />
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    id="addDepartmentBtn"
                    type="button"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-500 via-[#B06AB3] to-[#FF7FD1] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(158,75,138,0.35)] hover:shadow-[0_16px_36px_rgba(158,75,138,0.45)] transition"
                  >
                    <span className="material-symbols-rounded text-base">
                      add
                    </span>
                    {" Add department "}
                  </button>
                  {" "}
                  <p className="text-sm md:text-base text-neutral-600 dark:text-white/65">
                    Define the department catalogue before mapping batches and subjects.
                  </p>
                </div>
              </div>
              {/* Right media */}
              <div className="mt-12 lg:mt-0 relative">
                <div className="relative group rounded-3xl overflow-hidden ring-1 ring-black/10 dark:ring-white/10 shadow-soft bg-black/5 dark:bg-white/5 h-56 sm:h-60 md:h-64 xl:h-45">
                  <video
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    poster="../assets/img/placeholder-video.jpg"
                  >
                    <source src="../assets/video/collage/dept.mp4" type="video/mp4" />
                    {" Your browser does not support the video tag. "}
                  </video>
                  {" "}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-brand-500/10 via-transparent to-brand-700/10 mix-blend-overlay" />
                </div>
                <p className="mt-3 text-xs text-neutral-500 dark:text-white/50">
                  A dynamic view of departments forming the academic structure.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="py-16">
          <div className="container max-w-6xl">
            <div id="results" className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" />
          </div>
        </section>
      </main>
      <div
        id="departmentModal"
        className="fixed inset-0 z-50 hidden items-center justify-center px-4 py-12 sm:px-6 lg:px-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="departmentModalTitle"
      >
        <div
          id="departmentModalBackdrop"
          className="absolute inset-0 bg-brand-900/70 dark:bg-black/70 backdrop-blur-sm"
        />
        <div className="relative w-full max-w-xl rounded-3xl border border-black/10 dark:border-white/10 bg-white/95 dark:bg-brand-900/95 shadow-[0_24px_60px_rgba(30,30,47,0.45)]">
          <div className="flex items-start justify-between gap-4 border-b border-black/5 dark:border-white/10 px-6 py-5">
            <div>
              <h2 id="departmentModalTitle" className="text-xl font-semibold text-neutral-900 dark:text-white">
                Add a new department
              </h2>
              <p className="mt-1 text-sm text-neutral-600 dark:text-white/70">
                Provide the department / specialization name.
              </p>
            </div>
            {" "}
            <button
              id="departmentModalClose"
              type="button"
              className="rounded-full border border-transparent p-2 text-neutral-500 hover:text-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60"
            >
              <span className="material-symbols-rounded text-lg">
                close
              </span>
            </button>
          </div>
          <form id="departmentForm" className="space-y-5 px-6 py-6">
            <label className="block text-sm font-medium text-neutral-700 dark:text-white/85">
              {" Department name "}
              <input
                id="departmentName"
                name="name"
                type="text"
                required
                className="mt-2 w-full rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-white/5 px-3.5 py-2.5 text-sm text-neutral-900 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                placeholder="e.g. Computer Science Engineering"
              />
              {" "}
            </label>
            {" "}
            <p id="departmentModalMessage" className="hidden text-sm text-red-500" />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                id="departmentDeleteBtn"
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
                  id="departmentModalCancel"
                  type="button"
                  className="inline-flex items-center justify-center rounded-full border border-black/10 dark:border-white/15 px-4 py-2 text-sm font-medium text-neutral-600 dark:text-white/70 hover:border-brand-500/50 transition"
                >
                  Cancel
                </button>
                {" "}
                <button
                  id="departmentSubmitBtn"
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-500 via-[#B06AB3] to-[#FF7FD1] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(158,75,138,0.35)] hover:shadow-[0_16px_36px_rgba(158,75,138,0.45)] transition"
                >
                  <span className="material-symbols-rounded text-base">
                    save
                  </span>
                  {" Save department "}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <footer className="border-t border-black/5 dark:border-white/10 py-10">
        <div className="container flex flex-col gap-3 text-sm text-neutral-500 dark:text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {"© "}
            <span id="y" />
            {" Paper X · College Console."}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <a href="../about.html" className="hover:text-brand-500 dark:hover:text-white transition">
              About
            </a>
            {" "}
            <a href="../help.html" className="hover:text-brand-500 dark:hover:text-white transition">
              Help centre
            </a>
            {" "}
            <a href="../contact.html" className="hover:text-brand-500 dark:hover:text-white transition">
              Contact
            </a>
          </div>
        </div>
      </footer>
      <script src="/_legacy/collage/departments/script-02.js" />
      <script src="/_legacy/collage/departments/script-03.js" />
      <script src="/_legacy/collage/departments/script-04.js" />
    </LegacyPage>
  );
}
