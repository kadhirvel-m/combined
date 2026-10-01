// Converted from ui/learning/topic.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/learning/topic/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "PaperX Learning Tracks — Topic Workspace",
};

export default function LearningTopicPage() {
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
      <script src="/_legacy/learning/topic/script-01.js" />
      <link rel="stylesheet" href="../assets/css/tailwind.css" />
      <script src="/config.js" defer />
      <script src="tracks.js" defer />
      {/* ── original <body> ── */}
      <header className="border-b border-brand-900/5 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between">
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
            <h1 id="topicTitle" className="mt-2 text-3xl font-bold tracking-tight text-brand-900" />
            <p id="topicSubtitle" className="text-sm text-brand-900/70" />
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-wider text-brand-900/60">
            <span id="topicStatus" className="rounded-full bg-brand-500/10 px-3 py-1 font-semibold">
              NOT STARTED
            </span>
            {" "}
            <button id="markInProgress" className="rounded-full bg-brand-700 px-3 py-1 text-white">
              Mark in progress
            </button>
            {" "}
            <button id="markComplete" className="rounded-full bg-brand-500 px-3 py-1 text-white">
              Mark complete
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)]">
        <section className="space-y-6">
          <article className="rounded-3xl bg-white p-6 shadow-lg shadow-brand-900/10">
            <h2 className="text-lg font-semibold text-brand-900">
              Learning objectives
            </h2>
            <ul id="objectiveList" className="mt-4 space-y-2 text-sm text-brand-900/70" />
          </article>
          <article className="rounded-3xl bg-white p-6 shadow-lg shadow-brand-900/10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-brand-900">
                {"Activities & practice"}
              </h2>
              {" "}
              <button
                id="generatePractice"
                className="inline-flex items-center gap-2 rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white"
              >
                <span className="material-symbols-rounded text-base">
                  quiz
                </span>
                {" Generate MCQs & flashcards "}
              </button>
            </div>
            <div id="activityList" className="mt-4 space-y-3 text-sm text-brand-900/70" />
            <div id="practiceList" className="mt-4 space-y-3 text-sm text-brand-900/70" />
            <div id="practiceOutput" className="mt-6 space-y-6" />
          </article>
          <article className="rounded-3xl bg-white p-6 shadow-lg shadow-brand-900/10">
            <h2 className="text-lg font-semibold text-brand-900">
              Curated notes
            </h2>
            <p className="mt-2 text-xs text-brand-900/60">
              Sourced live from trusted domains via SerpAPI
            </p>
            <div id="notesList" className="mt-6 space-y-6" />
          </article>
        </section>
        <aside className="space-y-6">
          <section className="rounded-3xl bg-brand-900 p-6 text-white shadow-2xl shadow-brand-900/40">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Live compiler
              </h2>
              {" "}
              <span className="text-xs uppercase tracking-wider text-white/60">
                Powered by Piston API
              </span>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              <label className="text-xs text-white/60" htmlFor="compilerLanguage">
                Language
              </label>
              {" "}
              <select
                id="compilerLanguage"
                className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white outline-none focus:border-white/50"
              />
            </div>
            <div className="mt-4">
              <label className="text-xs text-white/60" htmlFor="codeEditor">
                Code
              </label>
              {" "}
              <textarea
                id="codeEditor"
                rows={12}
                className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 font-mono text-sm text-white outline-none focus:border-brand-300"
                spellCheck="false"
              />
            </div>
            <div className="mt-4">
              <label className="text-xs text-white/60" htmlFor="codeInput">
                Input (optional)
              </label>
              {" "}
              <textarea
                id="codeInput"
                rows={3}
                className="w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 font-mono text-xs text-white outline-none focus:border-brand-300"
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                id="runCode"
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-900"
              >
                <span className="material-symbols-rounded text-base">
                  play_arrow
                </span>
                {" Run "}
              </button>
              {" "}
              <button
                id="explainCode"
                className="inline-flex items-center gap-2 rounded-full bg-brand-300 px-4 py-2 text-sm font-semibold text-brand-900"
              >
                <span className="material-symbols-rounded text-base">
                  psychology
                </span>
                {" Explain with Gemini "}
              </button>
            </div>
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-white/80">
                Output
              </h3>
              <pre
                id="codeOutput"
                className="mt-2 max-h-60 overflow-y-auto rounded-xl bg-black/60 px-3 py-3 text-xs text-green-200"
              />
              <pre
                id="codeError"
                className="mt-2 max-h-40 overflow-y-auto rounded-xl bg-black/40 px-3 py-3 text-xs text-red-200"
              />
            </div>
          </section>
          <section className="rounded-3xl bg-white p-6 shadow-lg shadow-brand-900/10">
            <h2 className="text-lg font-semibold text-brand-900">
              AI explanation
            </h2>
            <div id="explainOutput" className="mt-4 space-y-3 text-sm text-brand-900/70" />
          </section>
        </aside>
      </main>
      <template
        id="noteTemplate"
        dangerouslySetInnerHTML={{ __html: "\n        <div class=\"rounded-2xl border border-brand-900/10 bg-brand-500/5 p-5\">\n            <div class=\"flex flex-wrap items-center justify-between gap-3\">\n                <a class=\"note-link text-base font-semibold text-brand-700 hover:text-brand-900\" target=\"_blank\" rel=\"noopener\">Resource title</a>\n                <span class=\"text-xs text-brand-900/50\">trusted domain</span>\n            </div>\n            <div class=\"mt-4 space-y-3 text-sm text-brand-900/70\" data-sections=\"\"></div>\n        </div>\n    " }}
      />
      <template
        id="sectionTemplate"
        dangerouslySetInnerHTML={{ __html: "\n        <div>\n            <h4 class=\"text-sm font-semibold text-brand-900\">Section</h4>\n            <p class=\"mt-1 text-sm text-brand-900/70\">Summary text</p>\n        </div>\n    " }}
      />
      <template
        id="activityTemplate"
        dangerouslySetInnerHTML={{ __html: "\n        <div class=\"rounded-xl border border-brand-900/10 bg-brand-500/5 px-4 py-3\">\n            <p class=\"text-sm font-semibold text-brand-900\">Title</p>\n            <p class=\"text-xs text-brand-900/60\">Description</p>\n            <div class=\"mt-2 flex flex-wrap items-center gap-3 text-xs text-brand-900/50\"></div>\n        </div>\n    " }}
      />
      <template
        id="practiceBlockTemplate"
        dangerouslySetInnerHTML={{ __html: "\n        <div class=\"rounded-2xl border border-brand-900/10 bg-brand-500/5 p-4\">\n            <h3 class=\"text-sm font-semibold text-brand-900\">Heading</h3>\n            <div class=\"mt-3 space-y-3 text-sm text-brand-900/70\"></div>\n        </div>\n    " }}
      />
      <script src="/_legacy/learning/topic/script-02.js" />
    </LegacyPage>
  );
}
