// Converted from ui/teacher_timetable.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/teacher_timetable/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Teacher Weekly Time Table - Paper X",
};

export default function TeacherTimetablePage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen text-neutral-900 dark:text-white"}}
      head={
        <>
          <link rel="icon" type="image/x-icon" href="assets/img/favicon.svg" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        </>
      }
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <link rel="stylesheet" href="assets/css/tailwind.css" />
      <script src="/config.js" />
      <script src="/auth.js" defer />
      <link
        href={"https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,600,0,0"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="/_legacy/teacher_timetable/style-01.css" />
      <script src="/_legacy/teacher_timetable/script-01.js" />
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
          <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-700 dark:text-white/85">
            <a className="hover:text-brandlt-900 dark:hover:text-white" href="./index.html">
              Home
            </a>
            {" "}
            <a className="hover:text-brandlt-900 dark:hover:text-white" href="./teachers/teacher_notes.html">
              Upload
            </a>
            {" "}
            <a className="hover:text-brandlt-900 dark:hover:text-white" href="./help.html">
              Help
            </a>
          </nav>
          <div className="hidden md:flex items-center gap-2">
            <a
              href="./teacher_profile.html?user=me"
              className="btn-core inline-flex items-center gap-2 !py-2 !px-3 !text-sm"
            >
              {" "}
              <span className="material-symbols-rounded text-base">
                arrow_back
              </span>
              {"Back "}
            </a>
            {" "}
            <button id="clearWeekBtn" className="btn-core inline-flex items-center gap-2 !py-2 !px-3 !text-sm">
              <span className="material-symbols-rounded text-base">
                ink_eraser
              </span>
              {"Clear Week "}
            </button>
            {" "}
            <a
              id="navEditProfile"
              href="./teacher_profile_edit.html"
              className="hidden items-center gap-1.5 text-sm px-4 py-2 rounded-full bg-brand-500 text-white font-medium hover:bg-brand-600 shadow-sm transition"
            >
              {" "}
              <span className="material-symbols-rounded text-base">
                edit
              </span>
              {" Edit Profile "}
            </a>
            {" "}
            <a
              id="navFeedback"
              href="./teachers/teacher_feedback_list.html"
              className="hidden items-center gap-1.5 text-sm px-3 py-2 rounded-full ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              {" "}
              <span className="material-symbols-rounded text-base">
                rate_review
              </span>
              {" Feedback "}
            </a>
            {" "}
            <a
              id="navTimeTable"
              href="./teacher_timetable.html"
              target="_blank"
              rel="noopener"
              className="hidden items-center gap-1.5 text-sm px-3 py-2 rounded-full ring-1 ring-brand-500/35 text-brand-700 dark:text-fuchsia-100 bg-brand-500/10 hover:bg-brand-500/20 transition"
            >
              {" "}
              <span className="material-symbols-rounded text-base">
                calendar_month
              </span>
              {" Time Table "}
            </a>
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
          <div className="md:hidden flex items-center gap-2">
            <a
              href="./teacher_profile.html?user=me"
              className="inline-flex items-center justify-center size-10 rounded-full ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5"
              title="Back"
            >
              {" "}
              <span className="material-symbols-rounded">
                arrow_back
              </span>
              {" "}
            </a>
            {" "}
            <button
              id="clearWeekBtnMobile"
              className="inline-flex items-center justify-center size-10 rounded-full ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5"
              title="Clear Week"
            >
              <span className="material-symbols-rounded">
                ink_eraser
              </span>
            </button>
            {" "}
            <button
              data-theme-toggle=""
              className="inline-flex items-center justify-center size-10 rounded-full ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5"
            >
              <span className="material-symbols-rounded">
                dark_mode
              </span>
            </button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 space-y-4">
        <section className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-bold tracking-tight">
                Class Mapping Grid
              </h1>
              {" "}
              <span id="classCountBadge" className="header-chip">
                {" "}
                <span className="material-symbols-rounded text-base">
                  menu_book
                </span>
                {" 0 Classes Available to Map "}
              </span>
            </div>
          </div>
          <div />
        </section>
        <section className="board">
          <div className="table-wrap">
            <table className="tt-grid" id="ttGrid" />
          </div>
        </section>
      </main>
      <div id="toast" />
      <script src="/_legacy/teacher_timetable/script-02.js" />
    </LegacyPage>
  );
}
