// Converted from ui/mediX/upload.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/mediX/upload/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Medix Upload — Paper X",
};

export default function MediXUploadPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth overflow-x-hidden"}}
      body={{"class":"min-h-screen font-sans antialiased text-neutral-900 dark:text-white bg-gradient-to-b from-white via-fuchsia-50/30 to-violet-100/40 dark:from-[#161525] dark:via-[#1d1930] dark:to-[#171124] transition-colors overflow-x-hidden"}}
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
      <script src="/config.js" />
      <link rel="stylesheet" href="/_legacy/mediX/upload/style-01.css" />
      <script src="/_legacy/mediX/upload/script-01.js" />
      {/* ── original <body> ── */}
      <header className="fixed top-0 left-0 right-0 z-40 w-full bg-white/70 dark:bg-brand-900/60 backdrop-blur supports-[backdrop-filter]:saturate-150 border-b border-black/5 dark:border-white/10">
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
            <a className="hover:text-brandlt-900 dark:hover:text-white" href="../index.html">
              Home
            </a>
            {" "}
            <a className="hover:text-brandlt-900 dark:hover:text-white" href="../about.html">
              About
            </a>
            {" "}
            <button className="group inline-flex items-center gap-1 hover:text-brandlt-900 dark:hover:text-white transition">
              {"Products "}
              <span className="material-symbols-rounded text-base opacity-70 group-hover:opacity-100">
                expand_more
              </span>
            </button>
            {" "}
            <button className="group inline-flex items-center gap-1 hover:text-brandlt-900 dark:hover:text-white transition">
              {"Solutions "}
              <span className="material-symbols-rounded text-base opacity-70 group-hover:opacity-100">
                expand_more
              </span>
            </button>
            {" "}
            <a className="hover:text-brandlt-900 dark:hover:text-white" href="../contact.html">
              Contact
            </a>
            {" "}
            <a className="hover:text-brandlt-900 dark:hover:text-white" href="../help.html">
              Help
            </a>
            {" "}
            <a className="hover:text-brandlt-900 dark:hover:text-white" href="../index.html#pricing">
              Pricing
            </a>
          </nav>
          <div className="hidden md:flex items-center gap-2">
            <button
              id="themeToggle"
              data-theme-toggle=""
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5"
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
              className="text-sm text-neutral-700 dark:text-white/85 hover:text-brandlt-900 dark:hover:text-white px-3 py-2 rounded-full"
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
            {" "}
            <a
              id="navProfile"
              href="../profile.html"
              title="Profile"
              className="hidden items-center justify-center w-10 h-10 rounded-full overflow-hidden border border-black/10 dark:border-white/10 bg-white/90 dark:bg-brand-900/60"
            >
              {" "}
              <img id="navProfileImg" alt="Profile" className="w-full h-full object-cover hidden" />
              {" "}
              <span id="navProfileInitial" className="text-xs font-semibold">
                ME
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
        className="hidden md:hidden fixed inset-0 z-40 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
      />
      <nav
        id="mobileNavPanel"
        aria-hidden="true"
        className="hidden md:hidden fixed inset-x-4 top-24 z-50 flex flex-col gap-5 max-h-[calc(100vh-6.5rem)] overflow-y-auto rounded-3xl border border-black/10 dark:border-white/10 bg-white/95 dark:bg-brand-900/95 shadow-card backdrop-blur supports-[backdrop-filter]:backdrop-blur-xl p-6"
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
            href="../about.html#values"
            data-close-mobile-nav=""
            className="rounded-xl px-3 py-2 hover:bg-brandlt-100/70 hover:dark:bg-brand-700/20 transition"
          >
            Values
          </a>
          {" "}
          <a
            href="../about.html#journey"
            data-close-mobile-nav=""
            className="rounded-xl px-3 py-2 hover:bg-brandlt-100/70 hover:dark:bg-brand-700/20 transition"
          >
            Journey
          </a>
          {" "}
          <a
            href="../about.html#team"
            data-close-mobile-nav=""
            className="rounded-xl px-3 py-2 hover:bg-brandlt-100/70 hover:dark:bg-brand-700/20 transition"
          >
            Team
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
            href="../index.html#pricing"
            data-close-mobile-nav=""
            className="rounded-xl px-3 py-2 hover:bg-brandlt-100/70 hover:dark:bg-brand-700/20 transition"
          >
            Pricing
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
          {" "}
          <a
            id="navProfileMobile"
            href="../profile.html"
            data-close-mobile-nav=""
            className="hidden inline-flex items-center gap-2 rounded-xl border border-black/10 dark:border-white/15 px-4 py-2 text-sm text-neutral-700 dark:text-white/80 bg-white/70 dark:bg-brand-900/60"
          >
            {" "}
            <span className="material-symbols-rounded text-base">
              account_circle
            </span>
            {" "}
            <span data-profile-name="">
              My profile
            </span>
            {" "}
          </a>
          {" "}
          <button
            id="signOutBtnMobile"
            type="button"
            className="hidden inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/15 px-4 py-2 text-sm text-neutral-700 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10 transition"
          >
            <span className="material-symbols-rounded text-base">
              logout
            </span>
            {" "}
            <span>
              Sign out
            </span>
          </button>
        </div>
      </nav>
      <main className="container pt-28 pb-12 md:pt-32">
        <section className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/85 dark:bg-brand-900/55 backdrop-blur p-6 md:p-8 shadow-soft mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Medix Upload Studio
              </h1>
              <p className="mt-2 text-sm md:text-base text-neutral-700 dark:text-white/75 max-w-2xl">
                Bulk ingest textbooks with section-aware semantic chunking, overlap windows, and parallel indexing into Supabase pgvector.
              </p>
            </div>
            {" "}
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold ring-1 ring-black/10 dark:ring-white/15 bg-white/70 dark:bg-white/5">
              <span className="material-symbols-rounded text-base">
                auto_awesome
              </span>
              {" Optimized for large PDFs "}
            </div>
          </div>
        </section>
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-4 rounded-3xl border border-black/10 dark:border-white/10 bg-white/85 dark:bg-brand-900/55 backdrop-blur p-6 shadow-soft">
            <h2 className="text-lg font-bold">
              How tags work
            </h2>
            <p className="mt-2 text-sm text-neutral-700 dark:text-white/75">
              Use tags as short labels to organize later retrieval and filtering.
            </p>
            <ul className="mt-4 space-y-3 text-sm text-neutral-700 dark:text-white/80">
              <li className="flex gap-2">
                <span className="material-symbols-rounded text-base">
                  label
                </span>
                Use subject tags like anatomy, physiology, pathology
              </li>
              <li className="flex gap-2">
                <span className="material-symbols-rounded text-base">
                  school
                </span>
                Add cohort tags like semester-2, mbbs-2026
              </li>
              <li className="flex gap-2">
                <span className="material-symbols-rounded text-base">
                  schedule
                </span>
                Add purpose tags like revision, exam-prep
              </li>
            </ul>
            <div className="mt-6 rounded-2xl border border-black/10 dark:border-white/10 p-4 bg-fuchsia-50/50 dark:bg-white/5">
              <p className="text-xs text-neutral-600 dark:text-white/65">
                Uploads automatically use your logged-in identity in background.
              </p>
            </div>
          </aside>
          <div className="lg:col-span-8 rounded-3xl border border-black/10 dark:border-white/10 bg-white/88 dark:bg-brand-900/60 backdrop-blur p-6 md:p-7 shadow-soft">
            <form id="uploadForm" className="space-y-5">
              <div>
                <label htmlFor="pdf" className="block text-sm font-semibold mb-2">
                  PDF file(s)
                </label>
                {" "}
                <input
                  id="pdf"
                  type="file"
                  accept="application/pdf"
                  multiple
                  required
                  className="w-full rounded-xl border border-black/10 dark:border-white/15 px-4 py-3 bg-white/75 dark:bg-white/5"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="sourceName" className="block text-sm font-semibold mb-2">
                    Source name / prefix (optional)
                  </label>
                  {" "}
                  <input
                    id="sourceName"
                    type="text"
                    placeholder="e.g. MBBS Year-2 Books"
                    className="w-full rounded-xl border border-black/10 dark:border-white/15 px-4 py-3 bg-white/75 dark:bg-white/5"
                  />
                </div>
                <div>
                  <label htmlFor="tags" className="block text-sm font-semibold mb-2">
                    Tags (optional)
                  </label>
                  {" "}
                  <input
                    id="tags"
                    type="text"
                    placeholder="anatomy, semester-2, revision"
                    className="w-full rounded-xl border border-black/10 dark:border-white/15 px-4 py-3 bg-white/75 dark:bg-white/5"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className="chip rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/10 transition"
                  type="button"
                  data-tag="anatomy"
                >
                  anatomy
                </button>
                {" "}
                <button
                  className="chip rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/10 transition"
                  type="button"
                  data-tag="semester-1"
                >
                  semester-1
                </button>
                {" "}
                <button
                  className="chip rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/10 transition"
                  type="button"
                  data-tag="semester-2"
                >
                  semester-2
                </button>
                {" "}
                <button
                  className="chip rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/10 transition"
                  type="button"
                  data-tag="revision"
                >
                  revision
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  id="submitBtn"
                  type="submit"
                  className="inline-flex items-center justify-center rounded-xl bg-brand-500 text-white text-sm font-semibold px-5 py-3 hover:shadow-glow transition"
                >
                  <span className="material-symbols-rounded text-base mr-1">
                    upload_file
                  </span>
                  {" Upload & Index "}
                </button>
                {" "}
                <span id="status" className="text-sm text-neutral-600 dark:text-white/70" />
              </div>
            </form>
            <div
              id="result"
              hidden
              className="mt-5 rounded-2xl border border-dashed border-black/20 dark:border-white/20 p-4 bg-fuchsia-50/70 dark:bg-white/5 text-xs md:text-sm whitespace-pre-wrap max-h-[340px] overflow-auto"
            />
          </div>
        </section>
      </main>
      <script src="/_legacy/mediX/upload/script-02.js" />
      <script src="/_legacy/mediX/upload/script-03.js" />
      <script src="/_legacy/mediX/upload/script-04.js" />
      <script src="/auth.js" />
    </LegacyPage>
  );
}
