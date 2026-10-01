// Converted from ui/teachers/teacher_feedback_analytics.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/teachers/teacher_feedback_analytics/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Feedback Analytics — Paper X",
};

export default function TeachersTeacherFeedbackAnalyticsPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen font-sans antialiased text-neutral-900 dark:text-white bg-hero-light dark:bg-hero-dark"}}
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
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0..1,0&display=swap"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="../assets/css/tailwind.css" />
      <script src="/config.js" />
      <link rel="stylesheet" href="/_legacy/teachers/teacher_feedback_analytics/style-01.css" />
      <script src="/_legacy/teachers/teacher_feedback_analytics/script-01.js" />
      {/* ── original <body> ── */}
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-brand-900/60 backdrop-blur border-b border-black/5 dark:border-white/10">
        <div className="container flex items-center justify-between py-3.5">
          <a href="../teacher_profile.html" className="flex items-center gap-3 shrink-0">
            {" "}
            <img src="../assets/img/logo-light.svg" className="h-9 w-auto dark:hidden" alt="Paper X" />
            {" "}
            <img src="../assets/img/logo-dark.svg" className="h-9 w-auto hidden dark:block" alt="Paper X" />
            {" "}
          </a>
          {" "}
          <div className="flex items-center gap-2">
            <button
              data-theme-toggle=""
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5"
            >
              <span className="material-symbols-rounded">
                dark_mode
              </span>
            </button>
            {" "}
            <a
              id="responsesLink"
              href="#"
              className="inline-flex items-center gap-2 rounded-full ring-1 ring-black/10 dark:ring-white/15 text-sm font-medium px-4 py-2.5 hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              {" "}
              <span className="material-symbols-rounded text-base">
                visibility
              </span>
              {" View Responses "}
            </a>
          </div>
        </div>
      </header>
      <main className="container py-8">
        {/* Loading */}
        <div id="loadingState">
          <div className="skeleton h-20 rounded-2xl mb-4" />
          <div className="grid md:grid-cols-2 gap-4">
            <div className="skeleton h-48 rounded-2xl" />
            <div className="skeleton h-48 rounded-2xl" />
          </div>
        </div>
        {/* Content */}
        <div id="content" className="hidden">
          {/* Header */}
          <div className="glass-panel rounded-2xl p-6 mb-6">
            <h1 className="text-2xl font-bold mb-2">
              <span className="material-symbols-rounded text-2xl mr-2 text-brand-500">
                bar_chart
              </span>
              {" Analytics "}
            </h1>
            <p id="formTitle" className="text-neutral-600 dark:text-white/60">
              Loading...
            </p>
            <p className="text-sm mt-2">
              <span id="totalResponses" className="font-bold text-brand-600 dark:text-brand-400">
                0
              </span>
              {" total responses "}
            </p>
          </div>
          {/* Analytics Grid */}
          <div id="analyticsContainer" className="grid md:grid-cols-2 gap-4" />
          {/* Empty State */}
          <div id="emptyState" className="hidden glass-panel rounded-2xl p-10 text-center">
            <span className="material-symbols-rounded text-4xl text-neutral-400 mb-4 block">
              analytics
            </span>
            {" "}
            <h2 className="text-lg font-semibold mb-2">
              No Data Yet
            </h2>
            <p className="text-neutral-600 dark:text-white/60">
              Analytics will appear once you receive responses.
            </p>
          </div>
        </div>
      </main>
      <script src="/_legacy/teachers/teacher_feedback_analytics/script-02.js" />
    </LegacyPage>
  );
}
