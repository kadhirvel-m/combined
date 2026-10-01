// Converted from ui/learning/dashboard.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/learning/dashboard/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "PaperX Learning Tracks — Dashboard",
};

export default function LearningDashboardPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 text-white"}}
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
      <script src="/_legacy/learning/dashboard/script-01.js" />
      <link rel="stylesheet" href="../assets/css/tailwind.css" />
      <script src="/config.js" defer />
      <script src="../assets/js/analytics-tracker.js" defer />
      <script src="tracks.js" defer />
      {/* ── original <body> ── */}
      <header className="border-b border-white/10 bg-brand-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                PaperX
              </span>
              {" "}
              <span className="text-lg font-semibold text-white/90">
                Learning Tracks Dashboard
              </span>
            </div>
            <h1 id="planTitle" className="mt-2 text-3xl font-bold tracking-tight" />
            <p id="planSubtitle" className="text-sm text-white/70" />
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-wider text-white/70">
            <span id="planLanguage" className="rounded-full bg-white/10 px-3 py-1" />
            {" "}
            <span id="planStack" className="rounded-full bg-white/10 px-3 py-1" />
            {" "}
            <span id="planGoal" className="rounded-full bg-white/10 px-3 py-1" />
            {" "}
            <span id="planCompanies" className="rounded-full bg-white/10 px-3 py-1" />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl space-y-10 px-6 py-10">
        <section className="grid gap-4 md:grid-cols-4">
          <article className="rounded-3xl bg-white/10 p-6 shadow-lg shadow-black/30">
            <p className="text-sm text-white/70">
              Overall progress
            </p>
            <p id="progressRate" className="mt-3 text-4xl font-bold">
              0%
            </p>
            <p className="mt-2 text-xs text-white/60">
              Completion across all modules
            </p>
          </article>
          <article className="rounded-3xl bg-white/10 p-6 shadow-lg shadow-black/30">
            <p className="text-sm text-white/70">
              Topics completed
            </p>
            <p id="completedCount" className="mt-3 text-3xl font-semibold">
              0
            </p>
            <p className="mt-2 text-xs text-white/60">
              {"Out of "}
              <span id="totalCount">
                0
              </span>
            </p>
          </article>
          <article className="rounded-3xl bg-white/10 p-6 shadow-lg shadow-black/30">
            <p className="text-sm text-white/70">
              In progress
            </p>
            <p id="inProgressCount" className="mt-3 text-3xl font-semibold">
              0
            </p>
            <p className="mt-2 text-xs text-white/60">
              Actively being mastered
            </p>
          </article>
          <article className="rounded-3xl bg-gradient-to-br from-brand-500 to-brand-300 p-6 shadow-lg shadow-black/30">
            <p className="text-sm text-white/80">
              Next actions
            </p>
            <div className="mt-3 flex flex-col gap-2 text-sm font-semibold text-brand-900">
              <a href="topic.html" className="inline-flex items-center gap-2">
                {"Resume last topic "}
                <span className="material-symbols-rounded text-base">
                  play_arrow
                </span>
              </a>
              {" "}
              <a href="mock.html" className="inline-flex items-center gap-2">
                {"Mock arena "}
                <span className="material-symbols-rounded text-base">
                  stadia_controller
                </span>
              </a>
              {" "}
              <a href="analytics.html" className="inline-flex items-center gap-2">
                {"Analytics "}
                <span className="material-symbols-rounded text-base">
                  stacked_line_chart
                </span>
              </a>
            </div>
          </article>
        </section>
        <section className="rounded-3xl bg-white/5 p-8 shadow-card">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-white">
              Modules
            </h2>
            {" "}
            <span className="text-xs uppercase tracking-wider text-white/60">
              {"Automatically generated & refreshed with SerpAPI sources"}
            </span>
          </div>
          <div id="moduleContainer" className="mt-6 space-y-6" />
        </section>
      </main>
      <template
        id="moduleTemplate"
        dangerouslySetInnerHTML={{ __html: "\n        <article class=\"rounded-2xl border border-white/10 bg-brand-900/40 p-6\">\n            <div class=\"flex flex-col gap-3 md:flex-row md:items-center md:justify-between\">\n                <div>\n                    <h3 class=\"text-lg font-semibold text-white\">Module title</h3>\n                    <p class=\"text-sm text-white/60\">Description</p>\n                </div>\n                <span class=\"text-xs text-white/50\">Estimated hours: <span class=\"module-duration\">~4</span></span>\n            </div>\n            <div class=\"mt-5 grid gap-4 md:grid-cols-2\" data-topics=\"\"></div>\n        </article>\n    " }}
      />
      <template
        id="topicTemplate"
        dangerouslySetInnerHTML={{ __html: "\n        <div class=\"topic-card rounded-2xl border border-white/10 bg-brand-900/60 p-4 transition hover:border-white/30\">\n            <div class=\"flex items-start justify-between gap-3\">\n                <div>\n                    <h4 class=\"text-base font-semibold text-white\">Topic</h4>\n                    <p class=\"mt-1 text-xs text-white/60\">Summary</p>\n                </div>\n                <span class=\"status-indicator rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/70\">Not\n                    started</span>\n            </div>\n            <div class=\"mt-4 flex flex-wrap items-center gap-3 text-xs text-white/60\">\n                <button type=\"button\" class=\"mark-progress rounded-full bg-white/10 px-3 py-1\">Mark in progress</button>\n                <button type=\"button\" class=\"mark-complete rounded-full bg-white/10 px-3 py-1\">Mark complete</button>\n                <a class=\"view-topic inline-flex items-center gap-1 rounded-full bg-brand-500 px-3 py-1 font-semibold text-brand-900\" href=\"topic.html\">Open topic<span class=\"material-symbols-rounded text-base\">open_in_new</span></a>\n            </div>\n        </div>\n    " }}
      />
      <script src="/_legacy/learning/dashboard/script-02.js" />
    </LegacyPage>
  );
}
