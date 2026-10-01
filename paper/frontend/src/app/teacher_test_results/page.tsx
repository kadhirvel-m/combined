// Converted from ui/teacher_test_results.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/teacher_test_results/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Teacher Report - Paper X",
};

export default function TeacherTestResultsPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen text-neutral-900 dark:text-white"}}
      head={
        <>
          <link rel="icon" type="image/x-icon" href="assets/img/favicon.svg" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        </>
      }
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <link rel="stylesheet" href="assets/css/tailwind.css" />
      <script src="/config.js" />
      <script src="/auth.js" defer />
      <link
        href={"https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,500,0,0"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="/_legacy/teacher_test_results/style-01.css" />
      {/* ── original <body> ── */}
      <main className="container mx-auto px-4 py-8 space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold" id="reportTitle">
              Teacher Performance Report
            </h1>
            <p id="meta" className="text-sm text-neutral-600 dark:text-white/70 mt-1" />
          </div>
          <div className="flex flex-wrap gap-2">
            <a id="viewTest" className="btn-core">
              Open Test
            </a>
            {" "}
            <a href="./teacher_tests.html" className="btn-core">
              Back
            </a>
          </div>
        </header>
        <div
          id="alert"
          className="hidden text-sm text-red-700 dark:text-red-200 bg-red-100 dark:bg-red-900/40 px-4 py-3 rounded-xl ring-1 ring-red-200 dark:ring-red-800"
        />
        <section className="glass p-5 md:p-6 space-y-4">
          <h2 className="text-lg font-semibold section-title">
            Top Summary
          </h2>
          <div className="hero-grid">
            <aside className="orbit-wrap">
              <div className="w-full text-left text-[10px] font-semibold tracking-[0.2em] uppercase opacity-70">
                Top Summary
              </div>
              <div id="completionOrbit" className="orbit">
                <div className="text-center">
                  <div id="completionOrbitValue" className="orbit-value">
                    0%
                  </div>
                  <div className="text-[11px] opacity-60 mt-1">
                    Completed
                  </div>
                </div>
              </div>
              <div className="text-sm font-semibold" id="completionMeta">
                0/0 completed
              </div>
              <div className="mt-1 orbit-pills">
                <span className="micro-pill" id="completedPill">
                  Done 0
                </span>
                {" "}
                <span className="micro-pill" id="pendingPill">
                  Pending 0
                </span>
              </div>
            </aside>
            <div className="space-y-3">
              <div id="summaryGrid" className="summary-metrics" />
              <div className="dist-surface">
                <div className="dist-head">
                  Performance Distribution
                </div>
                <div id="distribution" className="dist-lanes" />
              </div>
            </div>
          </div>
          <div id="statusInsight" className="mini-callout px-4 py-3 text-sm font-semibold" />
          <div id="proMove" className="mini-callout px-4 py-3 text-sm" />
        </section>
        <section className="glass p-5 md:p-6 space-y-4">
          <h2 className="text-lg font-semibold section-title">
            Topic-wise Performance
          </h2>
          <div className="table-surface overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-black/[0.03] dark:bg-white/[0.04]">
                <tr className="text-left">
                  <th className="py-2.5 px-3">
                    Topic
                  </th>
                  <th className="py-2.5 px-3">
                    Avg Score
                  </th>
                  <th className="py-2.5 px-3">
                    Students Weak
                  </th>
                  <th className="py-2.5 px-3">
                    Difficulty
                  </th>
                  <th className="py-2.5 px-3">
                    Priority
                  </th>
                  <th className="py-2.5 px-3">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody id="topicRows" />
            </table>
          </div>
        </section>
        <section className="grid lg:grid-cols-2 gap-4">
          <article className="glass p-5 md:p-6 space-y-4">
            <h2 className="text-lg font-semibold section-title">
              CO-wise Performance
            </h2>
            <div className="table-surface overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-black/[0.03] dark:bg-white/[0.04]">
                  <tr className="text-left">
                    <th className="py-2.5 px-3">
                      CO
                    </th>
                    <th className="py-2.5 px-3">
                      Avg %
                    </th>
                    <th className="py-2.5 px-3">
                      Below Threshold
                    </th>
                    <th className="py-2.5 px-3">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody id="coRows" />
              </table>
            </div>
          </article>
          <article className="glass p-5 md:p-6 space-y-4" id="kLevelBlock">
            <h2 className="text-lg font-semibold section-title">
              K-Level Analysis
            </h2>
            <div className="table-surface overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-black/[0.03] dark:bg-white/[0.04]">
                  <tr className="text-left">
                    <th className="py-2.5 px-3">
                      K-Level
                    </th>
                    <th className="py-2.5 px-3">
                      Skill
                    </th>
                    <th className="py-2.5 px-3">
                      Avg %
                    </th>
                    <th className="py-2.5 px-3">
                      Insight
                    </th>
                  </tr>
                </thead>
                <tbody id="kRows" />
              </table>
            </div>
          </article>
        </section>
        <section className="glass p-5 md:p-6 space-y-4">
          <h2 className="text-lg font-semibold section-title">
            Student Segmentation
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="kpi-card">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  Weak Students
                </h3>
                {" "}
                <span className="chip chip-high">
                  At-risk
                </span>
              </div>
              <p id="weakCount" className="text-sm mt-1 opacity-75" />
              <div id="weakStudents" className="mt-2 text-sm space-y-1" />
            </div>
            <div className="kpi-card">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  Average Students
                </h3>
                {" "}
                <span className="chip chip-mid">
                  Monitor
                </span>
              </div>
              <p id="avgCount" className="text-sm mt-1 opacity-75" />
              <div id="avgStudents" className="mt-2 text-sm space-y-1" />
            </div>
            <div className="kpi-card">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  Top Performers
                </h3>
                {" "}
                <span className="chip chip-low">
                  Strong
                </span>
              </div>
              <p id="topCount" className="text-sm mt-1 opacity-75" />
              <div id="topStudents" className="mt-2 text-sm space-y-1" />
            </div>
          </div>
        </section>
        <section className="glass p-5 md:p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold section-title">
              Critical Questions (Low Accuracy)
            </h2>
            {" "}
            <button id="toggleAllQuestions" className="btn-core">
              View All Questions
            </button>
          </div>
          <div id="questionInsights" className="space-y-2 text-sm" />
        </section>
        <section className="grid lg:grid-cols-2 gap-4">
          <article className="glass p-5 md:p-6 space-y-3">
            <h2 className="text-lg font-semibold section-title">
              Key Insights
            </h2>
            <div id="keyInsights" className="space-y-2 text-sm" />
          </article>
          <article className="glass p-5 md:p-6 space-y-3">
            <h2 className="text-lg font-semibold section-title">
              Recommended Actions
            </h2>
            <div id="recommendedActions" className="space-y-2 text-sm" />
          </article>
        </section>
        <section className="glass p-5 md:p-6 space-y-4">
          <h2 className="text-lg font-semibold section-title">
            {"Export & Sharing"}
          </h2>
          <div className="flex flex-wrap gap-2">
            <button id="exportPdf" className="btn-main">
              Export PDF
            </button>
            {" "}
            <button id="exportExcel" className="btn-core">
              Export Excel (CSV)
            </button>
            {" "}
            <button id="shareReport" className="btn-core">
              Share Report
            </button>
          </div>
        </section>
      </main>
      <script src="/_legacy/teacher_test_results/script-01.js" />
    </LegacyPage>
  );
}
