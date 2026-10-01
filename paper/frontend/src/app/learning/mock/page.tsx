// Converted from ui/learning/mock.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/learning/mock/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "PaperX Learning Tracks — Mock Arena",
};

export default function LearningMockPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen bg-gradient-to-br from-surface via-brand-900 to-brand-700 text-white"}}
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
      <script src="/_legacy/learning/mock/script-01.js" />
      <link rel="stylesheet" href="../assets/css/tailwind.css" />
      <script src="/config.js" defer />
      <script src="tracks.js" defer />
      {/* ── original <body> ── */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div>
            <a
              href="dashboard.html"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-white"
            >
              {" "}
              <span className="material-symbols-rounded text-base">
                arrow_back
              </span>
              {" Back to dashboard "}
            </a>
            {" "}
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
              {"Mock & Interview Arena"}
            </h1>
            <p className="text-sm text-white/70">
              Company-aware drill sets powered by Gemini 2.5 Flash.
            </p>
          </div>
          <div
            className="hidden flex-col items-end text-xs uppercase tracking-wider text-white/60 md:flex"
            id="planMeta"
          />
        </div>
      </header>
      <main className="mx-auto grid max-w-5xl gap-6 px-6 py-10 md:grid-cols-[minmax(0,1.4fr)_minmax(0,2fr)]">
        <section className="space-y-6">
          <article className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-black/40">
            <h2 className="text-lg font-semibold text-white">
              Session setup
            </h2>
            <form id="mockForm" className="mt-4 space-y-5 text-sm text-white/80">
              <div>
                <label className="text-xs uppercase tracking-wider text-white/50" htmlFor="focusRound">
                  Focus round
                </label>
                {" "}
                <select
                  id="focusRound"
                  className="mt-2 w-full rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-white outline-none focus:border-white/50"
                >
                  <option value="coding_round">
                    Coding round
                  </option>
                  <option value="system_design">
                    System design
                  </option>
                  <option value="behavioral">
                    Behavioural
                  </option>
                  <option value="mixed">
                    Mixed interview
                  </option>
                </select>
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-white/50">
                  Recently covered topics
                </span>
                {" "}
                <div
                  id="topicChecklist"
                  className="mt-3 grid max-h-48 gap-2 overflow-y-auto rounded-2xl border border-white/10 bg-white/5 p-3 text-xs"
                />
              </div>
              <div className="flex items-center justify-between">
                <span id="mockStatus" className="text-xs text-brand-300" />
                {" "}
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-brand-900"
                >
                  <span className="material-symbols-rounded text-base">
                    stadia_controller
                  </span>
                  {" Generate session "}
                </button>
              </div>
            </form>
          </article>
          <article className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
            <h2 className="text-lg font-semibold text-white">
              Arena tips
            </h2>
            <ul className="mt-3 space-y-2">
              <li>
                • Coding rounds reference LeetCode and GfG practice archives filtered by company.
              </li>
              <li>
                • System design prompts follow company interview blueprints.
              </li>
              <li>
                • Behavioural questions map to STAR narratives relevant to the selected stack.
              </li>
            </ul>
          </article>
        </section>
        <section className="rounded-3xl border border-white/10 bg-black/30 p-6 shadow-2xl shadow-black/60">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-white">
              Session plan
            </h2>
            {" "}
            <button
              id="exportSession"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-wider text-white/70 hover:border-white/40"
            >
              <span className="material-symbols-rounded text-base">
                download
              </span>
              {" Export JSON "}
            </button>
          </div>
          <div id="mockOutput" className="mt-5 space-y-6 text-sm text-white/80" />
        </section>
      </main>
      <template
        id="checkTemplate"
        dangerouslySetInnerHTML={{ __html: "\n        <label class=\"flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2\">\n            <input type=\"checkbox\" class=\"h-4 w-4 rounded border-white/30 bg-transparent text-brand-300 focus:ring-brand-300\">\n            <span class=\"flex-1\">Topic</span>\n        </label>\n    " }}
      />
      <template
        id="sectionTemplate"
        dangerouslySetInnerHTML={{ __html: "\n        <div class=\"rounded-2xl border border-white/10 bg-white/5 p-4\">\n            <h3 class=\"text-sm font-semibold text-white\">Section title</h3>\n            <div class=\"mt-3 space-y-3\"></div>\n        </div>\n    " }}
      />
      <template
        id="questionTemplate"
        dangerouslySetInnerHTML={{ __html: "\n        <div class=\"rounded-xl bg-black/40 px-3 py-3 text-sm text-white/80\">\n            <p class=\"font-semibold\">Question</p>\n            <p class=\"mt-1 text-xs text-white/60\">Rubric</p>\n            <div class=\"mt-2 flex flex-wrap items-center gap-3 text-xs text-brand-300\"></div>\n        </div>\n    " }}
      />
      <script src="/_legacy/learning/mock/script-02.js" />
    </LegacyPage>
  );
}
