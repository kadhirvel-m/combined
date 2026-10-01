// Converted from ui/collage/upload_syllabus.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/collage/upload_syllabus/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Paper X â€” Upload Syllabus",
};

export default function CollageUploadSyllabusPage() {
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
      <script src="/_legacy/collage/upload_syllabus/script-01.js" />
      <link rel="stylesheet" href="/_legacy/collage/upload_syllabus/style-01.css" />
      <script src="/_legacy/collage/upload_syllabus/script-02.js" />
      <script src="/config.js" />
      <script src="helpers.js" />
      {/* ── original <body> ── */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-brand-900/60 backdrop-blur supports-[backdrop-filter]:saturate-150 border-b border-black/5 dark:border-white/10">
        <div className="container flex items-center justify-between py-4">
          <a href="../index.html" className="flex items-center gap-3" aria-label="Paper X Home">
            {" "}
            <img src="../assets/img/logo-light.svg" className="h-10 w-auto dark:hidden" alt="Paper X" />
            {" "}
            <img src="../assets/img/logo-dark.svg" className="h-10 w-auto hidden dark:block" alt="Paper X" />
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
              id="navCollages"
              className="inline-flex items-center gap-1 rounded-full bg-brandlt-200/70 px-3 py-1.5 text-brand-700 dark:bg-white/10 dark:text-white"
              href="clg_info.html"
            >
              <span>
                Collages
              </span>
              <span className="material-symbols-rounded text-base">
                hub
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
        </div>
      </header>
      <main>
        <section className="relative overflow-hidden border-b border-black/5 dark:border-white/10">
          <div className="relative container max-w-5xl py-8">
            <nav
              id="breadcrumbs"
              className="flex flex-wrap items-center gap-2 text-xs md:text-sm font-medium text-neutral-500 dark:text-white/70"
              aria-label="Breadcrumb"
            />
            <div className="mt-4 space-y-2">
              <h1 className="text-2xl md:text-4xl font-bold gradient-hero-text">
                Upload Syllabus
              </h1>
              <p id="subtitle" className="text-neutral-600 dark:text-white/65">
                {"Upload a PDF syllabus to parse and save units & topics."}
              </p>
              <p id="batchMeta" className="text-sm text-neutral-600 dark:text-white/65" />
            </div>
          </div>
        </section>
        <section className="py-12">
          <div className="container max-w-3xl">
            <form
              id="uploadForm"
              className="grid gap-5 rounded-3xl border border-black/5 dark:border-white/10 bg-white/85 dark:bg-white/5 backdrop-blur p-6"
            >
              <div className="grid gap-1">
                <label className="text-sm font-medium">
                  {"Syllabus PDF "}
                  <span className="text-red-500">
                    *
                  </span>
                </label>
                {" "}
                <input
                  id="file"
                  type="file"
                  accept="application/pdf"
                  required
                  className="block w-full rounded-2xl border border-black/10 dark:border-white/15 bg-white/90 dark:bg-white/10 px-3.5 py-2.5 text-sm"
                />
                {" "}
                <p className="text-xs text-neutral-500 dark:text-white/50">
                  Only PDF is supported.
                </p>
              </div>
              {/* Bulk upload: course code/title will be detected per subject */}
              <div className="grid gap-1 sm:grid-cols-2 sm:gap-4">
                <label className="grid gap-1">
                  {" "}
                  <span className="text-sm font-medium">
                    Semester
                  </span>
                  {" "}
                  <input
                    id="semester"
                    type="number"
                    min="1"
                    max="12"
                    placeholder="1-12"
                    required
                    className="mt-1 rounded-2xl border border-black/10 dark:border-white/15 bg-white/90 dark:bg-white/10 px-3.5 py-2.5 text-sm"
                  />
                  {" "}
                </label>
                {" "}
                <div className="grid items-end">
                  <p className="text-xs text-neutral-500 dark:text-white/50">
                    Upload full semester PDF containing multiple subjects. We will detect and save them all.
                  </p>
                </div>
              </div>
              <div id="status" className="hidden text-sm" />
              <div className="flex items-center gap-3">
                <a
                  id="backBtn"
                  href="subjects.html"
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/15 bg-white/80 dark:bg-white/5 px-4 py-2 text-sm text-neutral-700 dark:text-white/80"
                >
                  Cancel
                </a>
                {" "}
                <button
                  id="submitBtn"
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-500 via-[#B06AB3] to-[#FF7FD1] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(158,75,138,0.35)] hover:shadow-[0_14px_34px_rgba(158,75,138,0.45)] transition"
                >
                  <span className="material-symbols-rounded text-base">
                    cloud_upload
                  </span>
                  {" Upload & Parse "}
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
      <script src="/_legacy/collage/upload_syllabus/script-03.js" />
      <script src="/_legacy/collage/upload_syllabus/script-04.js" />
    </LegacyPage>
  );
}
