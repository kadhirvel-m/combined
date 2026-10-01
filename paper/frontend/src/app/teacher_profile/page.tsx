// Converted from ui/teacher_profile.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/teacher_profile/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Paper X — Teacher Profile",
};

export default function TeacherProfilePage() {
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
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,600,0,0"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="assets/css/tailwind.css" />
      <link rel="stylesheet" href="/_legacy/teacher_profile/style-01.css" />
      <script src="/_legacy/teacher_profile/script-01.js" />
      <script src="/config.js" />
      <script src="/auth.js" defer />
      <script src="/_legacy/teacher_profile/script-02.js" />
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
              id="signOutBtn"
              className="hidden items-center gap-1.5 text-sm px-3 py-2 rounded-full bg-red-500 text-white font-medium hover:bg-red-600 shadow-sm transition"
            >
              <span className="material-symbols-rounded text-base">
                logout
              </span>
              {" Sign out "}
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
          <div className="md:hidden flex items-center gap-2">
            <button
              id="signOutBtnMobile"
              className="hidden inline-flex items-center justify-center size-10 rounded-full bg-red-500 text-white hover:bg-red-600 transition"
              title="Sign out"
              aria-label="Sign out"
            >
              <span className="material-symbols-rounded">
                logout
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
      <main className="container py-8 space-y-8">
        {/* HERO / HEADER CARD */}
        <section
          id="heroCard"
          className="glass rounded-3xl p-6 md:p-8 ring-1 ring-black/5 dark:ring-white/10 shadow-card relative overflow-hidden"
        >
          <div
            className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20"
            aria-hidden="true"
            style={{ background: "radial-gradient(circle at 25% 15%,rgba(158,75,138,.35),transparent 60%)" }}
          />
          <div className="relative flex flex-col md:flex-row gap-6 md:gap-10">
            <div
              id="avatarWrap"
              className="w-32 h-32 rounded-2xl overflow-hidden ring-2 ring-white/60 dark:ring-black/40 bg-gradient-to-br from-brand-500/30 to-brand-500/0 grid place-items-center text-3xl font-bold text-brand-700 dark:text-fuchsia-200 skeleton shimmer"
            />
            <div className="flex-1 min-w-0 space-y-4">
              <div>
                <div className="flex flex-wrap items-center gap-4">
                  <h1
                    id="tName"
                    className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 flex items-center gap-3"
                  >
                    {" Loading… "}
                    <span
                      id="tBadge"
                      className="hidden text-xs inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30"
                    >
                      <span className="material-symbols-rounded text-sm">
                        verified
                      </span>
                      <span className="hidden sm:inline">
                        Verified Teacher
                      </span>
                      <span className="sm:hidden">
                        Teacher
                      </span>
                    </span>
                  </h1>
                  <div id="selfActions" className="hidden items-center gap-2 mb-2">
                    <a
                      href="./teacher_classes_manage.html"
                      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-white/70 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 hover:bg-white/90 dark:hover:bg-white/20"
                    >
                      <span className="material-symbols-rounded text-base">
                        class
                      </span>
                      Classes
                    </a>
                    {" "}
                    <a
                      id="hodPortalBtn"
                      href="./hod/hod_dashboard.html"
                      className="hidden items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-brand-500/10 text-brand-700 dark:text-fuchsia-100 ring-1 ring-brand-500/30 hover:bg-brand-500/20"
                    >
                      {" "}
                      <span className="material-symbols-rounded text-base">
                        space_dashboard
                      </span>
                      HOD Portal
                    </a>
                    {" "}
                    <a
                      href="./teachers/teacher_assignments.html"
                      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-brand-500/10 text-brand-700 dark:text-fuchsia-100 ring-1 ring-brand-500/30 hover:bg-brand-500/20"
                    >
                      {" "}
                      <span className="material-symbols-rounded text-base">
                        assignment_ind
                      </span>
                      Assignments
                    </a>
                    {" "}
                    <a
                      href="./teacher_test_builder.html"
                      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-brand-500/10 text-brand-700 dark:text-fuchsia-100 ring-1 ring-brand-500/30 hover:bg-brand-500/20"
                    >
                      {" "}
                      <span className="material-symbols-rounded text-base">
                        quiz
                      </span>
                      Create Test
                    </a>
                    {" "}
                    <a
                      href="./teacher_tests.html"
                      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-brand-500 text-white hover:bg-brand-600 shadow"
                    >
                      {" "}
                      <span className="material-symbols-rounded text-base">
                        assignment
                      </span>
                      Tests
                    </a>
                  </div>
                </div>
                <p
                  id="tHeadline"
                  className="text-sm text-neutral-600 dark:text-white/70 max-w-prose leading-relaxed"
                >
                   
                </p>
              </div>
              <div id="tMeta" className="flex flex-wrap gap-2 text-[11px] font-medium" />
              <div className="flex flex-wrap gap-2" id="statChips">
                {/* dynamic stats chips */}
              </div>
            </div>
          </div>
        </section>
        {/* CLASSES SECTION */}
        <section className="space-y-5">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold tracking-tight">
              Handled Classes
            </h2>
            {" "}
            <span id="classesCount" className="text-xs text-neutral-500 dark:text-white/50">
               
            </span>
            {" "}
            <div className="ml-auto flex items-center gap-2 text-xs">
              <input
                id="filterSubject"
                type="text"
                placeholder="Filter by subject"
                className="px-2 py-1 rounded-md bg-white/70 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 focus:outline-none focus:ring-brand-500"
              />
            </div>
          </div>
          <div id="classesGroups" className="space-y-6" />
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
      <script src="/_legacy/teacher_profile/script-03.js" />
    </LegacyPage>
  );
}
