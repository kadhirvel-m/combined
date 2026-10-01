// Converted from ui/teacher_test_builder.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/teacher_test_builder/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Paper X — Select Audience",
};

export default function TeacherTestBuilderPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen font-sans antialiased text-neutral-900 dark:text-white"}}
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
      <script src="/_legacy/teacher_test_builder/script-01.js" />
      <script src="/config.js" />
      <script src="/auth.js" defer />
      <link rel="stylesheet" href="/_legacy/teacher_test_builder/style-01.css" />
      {/* ── original <body> ── */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-brand-900/70 backdrop-blur border-b border-black/5 dark:border-white/10">
        <div className="container mx-auto flex items-center justify-between py-3 px-4">
          <a href="./index.html" className="flex items-center gap-3" aria-label="Paper X Home">
            {" "}
            <img src="assets/img/logo-light.svg" className="h-9 w-auto dark:hidden" alt="Paper X" />
            {" "}
            <img src="assets/img/logo-dark.svg" className="h-9 w-auto hidden dark:block" alt="Paper X" />
            {" "}
          </a>
          {" "}
          <div className="flex items-center gap-3">
            <a
              href="./teacher_profile.html"
              className="text-sm px-3 py-1.5 rounded-full ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/10"
            >
              Back to profile
            </a>
            {" "}
            <button
              id="themeToggle"
              className="inline-flex items-center justify-center size-10 rounded-full ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5"
              aria-label="Toggle theme"
            >
              <span className="material-symbols-rounded">
                dark_mode
              </span>
            </button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto space-y-6">
          <section className="glass rounded-3xl p-6 md:p-8 ring-1 ring-black/5 dark:ring-white/10 shadowCard">
            <div className="flex items-start gap-3">
              <div className="size-12 rounded-2xl bg-gradient-to-br from-brand-500/25 to-brand-700/20 grid place-items-center text-brand-700 dark:text-fuchsia-100">
                <span className="material-symbols-rounded text-2xl">
                  hub
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  Select audience
                </h1>
                <p className="text-sm text-neutral-600 dark:text-white/70">
                  {"Choose a class, or set this test "}
                  <span className="font-semibold">
                    Open to all
                  </span>
                  . You’ll create questions on the next page.
                </p>
              </div>
            </div>
            <div
              id="alert"
              className="hidden mt-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-4 py-3 rounded-xl ring-1 ring-red-100 dark:ring-red-800"
            />
          </section>
          <section className="glass rounded-3xl p-5 md:p-6 ring-1 ring-black/5 dark:ring-white/10 shadowCard">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">
                Pick a class
              </h2>
              {" "}
              <button
                id="refreshClasses"
                type="button"
                className="text-xs px-2 py-1 rounded-md ring-1 ring-black/5 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/10"
              >
                Refresh
              </button>
            </div>
            <div id="classesList" className="space-y-3 text-sm" />
            <div className="mt-5 flex items-center justify-between gap-3">
              <div className="text-xs text-neutral-500 dark:text-white/60" id="selectedLabel">
                Selected: Open to all
              </div>
              {" "}
              <button
                id="continueBtn"
                type="button"
                className="px-4 py-2 rounded-xl bg-brand-600 text-white text-sm hover:bg-brand-700"
              >
                Continue
              </button>
            </div>
          </section>
        </div>
      </main>
      <script src="/_legacy/teacher_test_builder/script-02.js" />
    </LegacyPage>
  );
}
