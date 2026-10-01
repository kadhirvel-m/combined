// Converted from ui/learning/goals.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/learning/goals/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "PaperX Learning Tracks — Goals & Companies",
};

export default function LearningGoalsPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"bg-surface text-brand-900"}}
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
      <script src="/_legacy/learning/goals/script-01.js" />
      <link rel="stylesheet" href="../assets/css/tailwind.css" />
      <script src="/config.js" defer />
      <script src="tracks.js" defer />
      <link rel="stylesheet" href="/_legacy/learning/goals/style-01.css" />
      {/* ── original <body> ── */}
      <header className="border-b border-brand-900/5 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <a
              href="../index.html"
              className="rounded-full bg-brand-900 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white"
            >
              PaperX
            </a>
            {" "}
            <span className="text-lg font-semibold text-brand-900">
              Learning Tracks
            </span>
            {" "}
            <span
              id="languageBadge"
              className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-700"
            />
          </div>
          <nav className="hidden gap-6 text-sm font-medium md:flex">
            <a href="onboarding.html" className="text-brand-500 hover:text-brand-900">
              Onboarding
            </a>
            {" "}
            <a href="goals.html" className="text-brand-900">
              Goals
            </a>
            {" "}
            <a href="dashboard.html" className="text-brand-500 hover:text-brand-900">
              Dashboard
            </a>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-12">
        <section className="rounded-3xl bg-white p-10 shadow-xl shadow-brand-900/10">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-brand-900">
              Tell us your focus
            </h1>
            <p className="text-base text-brand-900/70">
              {" Select the stack you want to master, the outcome you're targeting, and the companies PaperX should tailor your preparation for. We will adapt every module, topic, and assessment accordingly. "}
            </p>
          </div>
          <form id="goalForm" className="mt-10 space-y-12">
            <div>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-900/60">
                  Stacks
                </h2>
                {" "}
                <span className="text-xs text-brand-900/50">
                  Powered by Gemini planner model
                </span>
              </div>
              <div id="stackOptions" className="mt-4 grid gap-4 md:grid-cols-3" />
              <p id="stackError" className="mt-2 hidden text-sm text-rose-600" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-900/60">
                  Goals
                </h2>
                {" "}
                <span className="text-xs text-brand-900/50">
                  Pick one
                </span>
              </div>
              <div id="goalOptions" className="mt-4 grid gap-3 md:grid-cols-3" />
              <p id="goalError" className="mt-2 hidden text-sm text-rose-600" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-900/60">
                  {"Target companies "}
                </h2>
                {" "}
                <span className="text-xs text-brand-900/50">
                  Choose up to 4
                </span>
              </div>
              <div id="companyOptions" className="mt-4 flex flex-wrap gap-3" />
            </div>
            <div className="rounded-2xl border border-brand-900/10 bg-brand-900/3 px-5 py-4 text-sm text-brand-900/70">
              <p>
                PaperX will reuse your configured allowed domains (
                <span id="domainList" className="font-medium text-brand-700" />
                ) for SerpAPI fetching. Nothing is hardcoded — update env values to control this list.
              </p>
            </div>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <a
                href="onboarding.html"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-900"
              >
                {" "}
                <span className="material-symbols-rounded text-base align-middle">
                  arrow_back
                </span>
                {" Back to language selection "}
              </a>
              {" "}
              <div className="flex items-center gap-3">
                <span id="planStatus" className="hidden text-sm text-brand-700" />
                {" "}
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-700/30 transition hover:bg-brand-500"
                >
                  {" Generate personalised path "}
                  <span className="material-symbols-rounded text-base align-middle">
                    auto_fix_high
                  </span>
                </button>
              </div>
            </div>
          </form>
        </section>
      </main>
      <div
        id="loadingOverlay"
        className="pointer-events-none fixed inset-0 hidden items-center justify-center bg-brand-900/70 backdrop-blur"
      >
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-white/5 px-10 py-8 text-white shadow-2xl shadow-black/40">
          <span className="material-symbols-rounded animate-spin text-4xl text-brand-300">
            progress_activity
          </span>
          {" "}
          <p className="text-center text-sm font-medium">
            Crafting your learning map with Gemini 2.5 Flash…
          </p>
        </div>
      </div>
      <template
        id="stackTemplate"
        dangerouslySetInnerHTML={{ __html: "\n        <button type=\"button\" class=\"stack-card group flex w-full flex-col rounded-2xl border border-brand-900/10 bg-brand-900/5 p-4 text-left transition hover:border-brand-700/40 hover:bg-brand-500/10\">\n            <div class=\"flex items-center justify-between gap-3\">\n                <span class=\"text-base font-semibold text-brand-900\">Python</span>\n                <span class=\"material-symbols-rounded text-xl text-brand-500 group-[.active]:text-brand-700\">check_circle</span>\n            </div>\n            <p class=\"mt-2 text-sm text-brand-900/60\">AI-powered sprints, interview prep, and lab tasks curated for the\n                selected stack.</p>\n        </button>\n    " }}
      />
      <template
        id="goalTemplate"
        dangerouslySetInnerHTML={{ __html: "\n        <button type=\"button\" class=\"goal-card rounded-full border border-brand-900/15 bg-white px-4 py-2 text-sm font-semibold text-brand-700 transition hover:border-brand-500/50 hover:text-brand-900\">Goal</button>\n    " }}
      />
      <template
        id="companyTemplate"
        dangerouslySetInnerHTML={{ __html: "\n        <button type=\"button\" class=\"company-chip rounded-full border border-brand-900/20 bg-brand-500/10 px-4 py-2 text-xs font-medium uppercase tracking-wide text-brand-700 hover:border-brand-500/40\">Company</button>\n    " }}
      />
      <script src="/_legacy/learning/goals/script-02.js" />
    </LegacyPage>
  );
}
