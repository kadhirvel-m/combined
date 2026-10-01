// Converted from ui/feedback_submit.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/feedback_submit/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Submit Feedback — Paper X",
};

export default function FeedbackSubmitPage() {
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
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0..1,0&display=swap"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="assets/css/tailwind.css" />
      <script src="/config.js" />
      <link rel="stylesheet" href="/_legacy/feedback_submit/style-01.css" />
      <script src="/_legacy/feedback_submit/script-01.js" />
      {/* ── original <body> ── */}
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-brand-900/60 backdrop-blur border-b border-black/5 dark:border-white/10">
        <div className="container flex items-center justify-between py-3.5">
          <a href="index.html" className="flex items-center gap-3 shrink-0">
            {" "}
            <img src="assets/img/logo-light.svg" className="h-9 w-auto dark:hidden" alt="Paper X" />
            {" "}
            <img src="assets/img/logo-dark.svg" className="h-9 w-auto hidden dark:block" alt="Paper X" />
            {" "}
          </a>
          {" "}
          <button
            data-theme-toggle=""
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5"
          >
            <span className="material-symbols-rounded">
              dark_mode
            </span>
          </button>
        </div>
      </header>
      <main className="container py-10">
        {/* Loading */}
        <div id="loadingState">
          <div className="skeleton h-32 rounded-2xl mb-4" />
          <div className="skeleton h-48 rounded-2xl" />
        </div>
        {/* Error */}
        <div id="errorState" className="hidden glass-panel rounded-2xl p-10 text-center">
          <span className="material-symbols-rounded text-5xl text-red-500 mb-4 block">
            error
          </span>
          {" "}
          <h2 className="text-xl font-bold mb-2">
            Form Not Found
          </h2>
          <p className="text-neutral-600 dark:text-white/60">
            {"The feedback form you're looking for doesn't exist or has been closed."}
          </p>
        </div>
        {/* Already Submitted */}
        <div id="submittedState" className="hidden glass-panel rounded-2xl p-10 text-center">
          <span className="material-symbols-rounded text-5xl text-emerald-500 mb-4 block filled">
            check_circle
          </span>
          {" "}
          <h2 className="text-xl font-bold mb-2">
            Already Submitted
          </h2>
          <p className="text-neutral-600 dark:text-white/60">
            You have already submitted feedback for this form.
          </p>
        </div>
        {/* Success */}
        <div id="successState" className="hidden glass-panel rounded-2xl p-10 text-center">
          <span className="material-symbols-rounded text-5xl text-emerald-500 mb-4 block filled">
            celebration
          </span>
          {" "}
          <h2 className="text-xl font-bold mb-2">
            Thank You!
          </h2>
          <p className="text-neutral-600 dark:text-white/60">
            Your feedback has been submitted successfully.
          </p>
        </div>
        {/* Form */}
        <div id="formContainer" className="hidden">
          {/* Header */}
          <div className="glass-panel rounded-2xl p-6 mb-6">
            <h1 id="formTitle" className="text-2xl font-bold mb-2">
              Loading...
            </h1>
            <p id="formDesc" className="text-neutral-600 dark:text-white/60 mb-4" />
            <p id="teacherName" className="text-sm text-neutral-500 dark:text-white/50">
              <span className="material-symbols-rounded text-base mr-1">
                person
              </span>
              {" From: "}
              <span id="teacherNameText">
                Teacher
              </span>
            </p>
            {" "}
            <div
              id="anonBadge"
              className="hidden mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium"
            >
              <span className="material-symbols-rounded text-base">
                shield
              </span>
              {" Your response is anonymous "}
            </div>
          </div>
          {/* Questions */}
          <form id="feedbackForm" className="space-y-4">
            {/* Questions will be inserted here */}
          </form>
          {/* Submit Button */}
          <div className="mt-6">
            <button
              id="submitBtn"
              type="button"
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-brand-500 text-white text-sm font-semibold px-6 py-4 hover:shadow-glow transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-rounded text-lg">
                send
              </span>
              {" Submit Feedback "}
            </button>
          </div>
        </div>
      </main>
      <footer className="py-6 text-center text-xs text-neutral-500 dark:text-white/50">
        {" Powered by Paper X "}
      </footer>
      <script src="/_legacy/feedback_submit/script-02.js" />
    </LegacyPage>
  );
}
