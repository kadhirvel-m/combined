// Converted from ui/learning/onboarding.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/learning/onboarding/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "PaperX Learning Tracks — Onboarding",
};

export default function LearningOnboardingPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen bg-surface text-brand-900 transition-colors duration-300 dark:bg-gradient-to-br dark:from-brand-900 dark:via-brand-700 dark:to-brand-500 dark:text-white"}}
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
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"}
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,600,0,0"
        rel="stylesheet"
      />
      <script src="/_legacy/learning/onboarding/script-01.js" />
      <link rel="stylesheet" href="../assets/css/tailwind.css" />
      <script src="/config.js" defer />
      <script src="tracks.js" defer />
      <link rel="stylesheet" href="/_legacy/learning/onboarding/style-01.css" />
      {/* ── original <body> ── */}
      <header className="border-b border-brand-900/10 bg-white/80 backdrop-blur transition-colors dark:border-white/10 dark:bg-white/5">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3 text-brand-900 dark:text-white">
            <span className="rounded-full bg-brand-900/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide dark:bg-white/10">
              PaperX
            </span>
            {" "}
            <span className="text-lg font-semibold">
              Learning Tracks
            </span>
          </div>
          <nav className="hidden gap-6 text-sm font-medium md:flex">
            <a
              href="onboarding.html"
              className="text-brand-700 hover:text-brand-900 dark:text-white/80 dark:hover:text-white"
            >
              Onboarding
            </a>
            {" "}
            <a
              href="goals.html"
              className="text-brand-500 hover:text-brand-900 dark:text-white/60 dark:hover:text-white"
            >
              Goals
            </a>
            {" "}
            <a
              href="dashboard.html"
              className="text-brand-500 hover:text-brand-900 dark:text-white/60 dark:hover:text-white"
            >
              Dashboard
            </a>
          </nav>
        </div>
      </header>
      <main className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-16">
        <section className="rounded-3xl bg-white p-10 shadow-lg shadow-brand-900/10 transition-colors dark:bg-white/5 dark:shadow-brand-900/30">
          <h1 className="text-3xl font-bold tracking-tight text-brand-900 dark:text-white">
            Welcome to PaperX Learning Tracks
          </h1>
          <p className="mt-3 text-base text-brand-900/70 dark:text-white/80">
            {" Choose your preferred interface language. We will personalise every module, note, and assessment in that language while keeping the PaperX brand experience consistent. "}
          </p>
          <form id="languageForm" className="mt-10 space-y-10">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-900/60 dark:text-white/60">
                {" Available languages"}
              </h2>
              <div id="languageOptions" className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" />
              <p id="languageError" className="mt-3 hidden text-sm text-rose-600 dark:text-red-200" />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-brand-900/60 dark:text-white/70">
                Languages come from your configured environment and can be updated anytime.
              </p>
              {" "}
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-900 shadow-lg shadow-brand-900/20 transition hover:shadow-brand-900/40 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
              >
                {" Continue to goals "}
                <span className="material-symbols-rounded text-base align-middle">
                  arrow_forward
                </span>
              </button>
            </div>
          </form>
        </section>
        <section className="rounded-3xl border border-brand-900/10 bg-white p-8 text-sm text-brand-900/70 shadow-lg shadow-brand-900/10 transition-colors dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:shadow-brand-900/20">
          <h2 className="text-base font-semibold text-brand-900 dark:text-white">
            What happens next?
          </h2>
          <ul className="mt-4 space-y-2">
            <li>
              • Select language → choose your stack, goal, and target companies.
            </li>
            <li>
              • PaperX will generate a company-aware learning path with modules, notes, and practice sets.
            </li>
            <li>
              {"• All content is fetched live from trusted sources such as GeeksforGeeks, Tutorialspoint, Scaler, Byju's, and Wikipedia."}
            </li>
          </ul>
        </section>
      </main>
      <template
        id="languageTemplate"
        dangerouslySetInnerHTML={{ __html: "\n        <button type=\"button\" class=\"language-card group flex w-full items-center justify-between rounded-2xl border border-brand-900/15 bg-white px-5 py-4 text-left text-brand-900 transition hover:border-brand-700 hover:bg-brand-500/10 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:border-white/40\">\n            <span>\n                <span class=\"block text-sm font-semibold\">English</span>\n                <span class=\"block text-xs text-brand-900/60 dark:text-white/60\">en</span>\n            </span>\n            <span class=\"material-symbols-rounded text-xl text-brand-500 transition group-[.active]:text-brand-700 dark:text-white/30 dark:group-[.active]:text-white\">check_circle</span>\n        </button>\n    " }}
      />
      <script src="/_legacy/learning/onboarding/script-02.js" />
    </LegacyPage>
  );
}
