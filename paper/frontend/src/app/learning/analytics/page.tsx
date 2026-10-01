// Converted from ui/learning/analytics.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/learning/analytics/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "PaperX Learning Tracks — Analytics",
};

export default function LearningAnalyticsPage() {
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
      <script src="/_legacy/learning/analytics/script-01.js" />
      <link rel="stylesheet" href="../assets/css/tailwind.css" />
      <script src="/config.js" defer />
      <script src="tracks.js" defer />
      {/* ── original <body> ── */}
      <header className="border-b border-brand-900/5 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <a
              href="dashboard.html"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-900"
            >
              {" "}
              <span className="material-symbols-rounded text-base">
                arrow_back
              </span>
              {" Back to dashboard "}
            </a>
            {" "}
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-brand-900">
              {"Analytics & Insights"}
            </h1>
            <p className="text-sm text-brand-900/60">
              Powered by Gemini insights and your live SerpAPI content.
            </p>
          </div>
          <div
            id="planMeta"
            className="flex flex-col items-end text-xs uppercase tracking-wider text-brand-900/50"
          />
        </div>
      </header>
      <main className="mx-auto grid max-w-6xl gap-6 px-6 py-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
        <section className="space-y-6">
          <article className="rounded-3xl bg-white p-6 shadow-lg shadow-brand-900/10">
            <h2 className="text-lg font-semibold text-brand-900">
              Progress summary
            </h2>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              <div className="rounded-2xl border border-brand-900/10 bg-brand-500/5 p-4">
                <p className="text-sm text-brand-900/70">
                  Completion rate
                </p>
                <p id="statCompletion" className="mt-2 text-3xl font-semibold text-brand-900">
                  0%
                </p>
                <div className="mt-3 h-2 rounded-full bg-brand-900/10">
                  <div id="completionBar" className="h-2 rounded-full bg-brand-500" style={{ width: "0%" }} />
                </div>
              </div>
              <div className="rounded-2xl border border-brand-900/10 bg-brand-500/5 p-4">
                <p className="text-sm text-brand-900/70">
                  Modules
                </p>
                <p id="statModules" className="mt-2 text-3xl font-semibold text-brand-900">
                  0
                </p>
                <p className="text-xs text-brand-900/50">
                  Company-aware study blocks
                </p>
              </div>
              <div className="rounded-2xl border border-brand-900/10 bg-brand-500/5 p-4">
                <p className="text-sm text-brand-900/70">
                  Active streak
                </p>
                <p id="statStreak" className="mt-2 text-3xl font-semibold text-brand-900">
                  0 days
                </p>
                <p className="text-xs text-brand-900/50">
                  Calculated from topic updates
                </p>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-900/60">
                Topic breakdown
              </h3>
              <div id="topicBreakdown" className="mt-3 grid gap-3 md:grid-cols-2" />
            </div>
          </article>
          <article className="rounded-3xl bg-white p-6 shadow-lg shadow-brand-900/10">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-brand-900">
                AI insights
              </h2>
              {" "}
              <button
                id="refreshInsights"
                className="inline-flex items-center gap-2 rounded-full border border-brand-900/20 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-brand-700"
              >
                <span className="material-symbols-rounded text-base">
                  refresh
                </span>
                {" Refresh "}
              </button>
            </div>
            <div id="insightSummary" className="mt-4 space-y-4 text-sm text-brand-900/70">
              <p className="text-brand-900/60">
                Fetching insights…
              </p>
            </div>
          </article>
        </section>
        <aside className="space-y-6">
          <article className="rounded-3xl border border-brand-900/10 bg-white p-6 shadow-lg shadow-brand-900/10">
            <h2 className="text-lg font-semibold text-brand-900">
              Recommendations
            </h2>
            <ul id="recommendationList" className="mt-4 space-y-3 text-sm text-brand-900/70" />
          </article>
          <article className="rounded-3xl border border-brand-900/10 bg-white p-6 shadow-lg shadow-brand-900/10">
            <h2 className="text-lg font-semibold text-brand-900">
              Risk watch
            </h2>
            <ul id="riskList" className="mt-4 space-y-3 text-sm text-rose-600" />
          </article>
        </aside>
      </main>
      <template
        id="topicCardTemplate"
        dangerouslySetInnerHTML={{ __html: "\n        <div class=\"rounded-2xl border border-brand-900/10 bg-brand-500/5 p-4\">\n            <p class=\"text-sm font-semibold text-brand-900\">Topic</p>\n            <p class=\"text-xs text-brand-900/60\">Status</p>\n            <div class=\"mt-2 h-1.5 rounded-full bg-brand-900/10\">\n                <div class=\"progress h-1.5 rounded-full bg-brand-500\" style=\"width:0%\"></div>\n            </div>\n        </div>\n    " }}
      />
      <script src="/_legacy/learning/analytics/script-02.js" />
    </LegacyPage>
  );
}
