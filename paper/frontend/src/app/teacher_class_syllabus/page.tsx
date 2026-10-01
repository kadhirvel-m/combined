// Converted from ui/teacher_class_syllabus.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/teacher_class_syllabus/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Class Syllabus • Paper X",
};

export default function TeacherClassSyllabusPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen font-sans antialiased text-neutral-900 dark:text-white bg-hero-light dark:bg-hero-dark"}}
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
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,600,0..1,0"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="assets/css/tailwind.css" />
      <script src="/_legacy/teacher_class_syllabus/script-01.js" />
      <link rel="stylesheet" href="/_legacy/teacher_class_syllabus/style-01.css" />
      <script src="/_legacy/teacher_class_syllabus/script-02.js" />
      <script src="/config.js" />
      <script src="/auth.js" defer />
      <script src="/_legacy/teacher_class_syllabus/script-03.js" />
      {/* ── original <body> ── */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-brand-900/60 backdrop-blur border-b border-black/5 dark:border-white/10">
        <div className="container flex items-center justify-between py-3">
          <a href="./index.html" className="flex items-center gap-3" aria-label="Paper X Home">
            {" "}
            <img src="assets/img/logo-light.svg" className="h-9 w-auto dark:hidden" alt="Paper X" />
            {" "}
            <img src="assets/img/logo-dark.svg" className="h-9 w-auto hidden dark:block" alt="Paper X" />
            {" "}
          </a>
          {" "}
          <div className="flex items-center gap-2">
            <button
              id="backBtn"
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5"
            >
              <span className="material-symbols-rounded text-base">
                arrow_back
              </span>
              {" Back "}
            </button>
            {" "}
            <button
              data-theme-toggle=""
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5"
            >
              <span className="material-symbols-rounded text-base">
                dark_mode
              </span>
            </button>
          </div>
        </div>
      </header>
      <main className="container py-8 space-y-6">
        <section className="glass rounded-3xl p-6 md:p-8 ring-1 ring-black/5 dark:ring-white/10 shadow-card space-y-4">
          <div className="flex items-start gap-4 flex-wrap">
            <div
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500/30 to-brand-700/20 grid place-items-center text-lg font-bold text-brand-700 dark:text-fuchsia-200"
              id="subjectInitial"
            >
              -
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-xs uppercase tracking-[0.1em] text-neutral-500 dark:text-white/60">
                Class syllabus
              </p>
              <h1 id="subjectTitle" className="text-2xl md:text-3xl font-extrabold leading-tight">
                Loading…
              </h1>
              <div className="flex flex-wrap gap-2 text-[11px] font-medium" id="subjectMeta" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 items-center" id="classActions" />
          <div id="status" className="text-sm text-neutral-600 dark:text-white/70">
            Fetching syllabus…
          </div>
        </section>
        <section className="space-y-4">
          <div id="unitsWrap" className="grid gap-4" />
          <div id="emptyState" className="hidden text-sm text-neutral-600 dark:text-white/65">
            No units found for this subject.
          </div>
        </section>
      </main>
      <div className="fixed bottom-3 right-3 z-40">
        <button
          id="scrollTop"
          className="hidden size-10 rounded-full bg-brand-500 hover:bg-brand-600 text-white shadow-glow flex items-center justify-center"
        >
          <span className="material-symbols-rounded">
            north
          </span>
        </button>
      </div>
      {/* Unit + topics modal */}
      <div
        id="unitModal"
        className="fixed inset-0 z-50 hidden flex items-start justify-center p-4 overflow-y-auto overscroll-contain"
      >
        <div id="unitModalBackdrop" className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        <div
          id="unitModalPanel"
          className="relative mx-auto my-8 max-h-[90vh] overflow-y-auto overscroll-contain rounded-3xl bg-white dark:bg-brand-900 shadow-2xl ring-1 ring-black/5 dark:ring-white/10"
          style={{ width: "min(760px, calc(100% - 1.5rem))" }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-black/5 dark:border-white/10">
            <div>
              <p className="text-xs uppercase tracking-[0.08em] text-neutral-500 dark:text-white/60">
                Syllabus unit
              </p>
              <h2 id="unitModalTitle" className="text-lg font-semibold">
                Add unit
              </h2>
            </div>
            {" "}
            <button
              type="button"
              id="unitModalClose"
              className="rounded-full p-2 text-neutral-500 hover:text-brand-500 hover:bg-black/5 dark:hover:bg-white/10"
            >
              <span className="material-symbols-rounded text-xl">
                close
              </span>
            </button>
          </div>
          <form id="unitForm" className="space-y-4 px-5 py-4">
            <div className="space-y-2">
              <label htmlFor="unitTitle" className="text-sm font-medium">
                Unit title
              </label>
              {" "}
              <input
                id="unitTitle"
                name="unitTitle"
                type="text"
                maxLength={180}
                placeholder="e.g., Unit 1: Introduction"
                className="w-full rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-white/5 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Topics
                </label>
                {" "}
                <button
                  type="button"
                  id="addTopicRow"
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold bg-brand-500 text-white hover:bg-brand-600"
                >
                  <span className="material-symbols-rounded text-sm">
                    add
                  </span>
                  {" Add topic "}
                </button>
              </div>
              <div id="topicsContainer" className="space-y-2" />
              <div className="pt-2">
                <button
                  type="button"
                  id="addTopicRowBottom"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 dark:text-brandlt-200"
                >
                  <span className="material-symbols-rounded text-sm">
                    add
                  </span>
                  {" Add another "}
                </button>
              </div>
            </div>
            <p id="unitModalMessage" className="hidden text-sm text-red-600 dark:text-red-400" />
            <div className="flex items-center justify-between gap-3 border-t border-black/5 dark:border-white/10 pt-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="unitDeleteBtn"
                  className="hidden inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold text-red-600 dark:text-red-300 ring-1 ring-red-200 dark:ring-red-500/40 hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <span className="material-symbols-rounded text-sm">
                    delete
                  </span>
                  {" Delete "}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="unitModalCancel"
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/10"
                >
                  Cancel
                </button>
                {" "}
                <button
                  type="submit"
                  id="unitSubmitBtn"
                  className="inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold bg-brand-500 text-white hover:bg-brand-600 shadow-glow"
                >
                  <span className="material-symbols-rounded text-base">
                    save
                  </span>
                  {" Save unit "}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <script src="/_legacy/teacher_class_syllabus/script-04.js" />
    </LegacyPage>
  );
}
