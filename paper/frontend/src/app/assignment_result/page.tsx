// Converted from ui/assignment_result.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/assignment_result/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Assignment Result — Paper X",
};

export default function AssignmentResultPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"font-sans antialiased text-neutral-900 dark:text-white dark:bg-[#1E1E2F] min-h-screen"}}
      head={
        <>
          <link rel="icon" type="image/x-icon" href="assets/img/favicon.svg" />
        </>
      }
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <link
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,600,0,0"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="assets/css/tailwind.css" />
      <script src="/config.js" />
      <link rel="stylesheet" href="/_legacy/assignment_result/style-01.css" />
      <script src="/_legacy/assignment_result/script-01.js" />
      {/* ── original <body> ── */}
      <header className="bg-white/70 dark:bg-neutral-900/60 backdrop-blur border-b border-black/5 dark:border-white/10 sticky top-0 z-40">
        <div className="container mx-auto px-4 flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <a
              href="assignments.html"
              className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            >
              <span className="material-symbols-rounded">
                arrow_back
              </span>
            </a>
            {" "}
            <h1 className="text-lg font-semibold" id="assignmentTitle">
              Result
            </h1>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white dark:bg-neutral-800/50 rounded-2xl p-8 ring-1 ring-black/10 dark:ring-white/10 text-center mb-6">
          <div id="gradeCircle" className="grade-ring mx-auto mb-4 ring-8 ring-emerald-500/20">
            <div>
              <span className="text-4xl font-bold" id="gradeScore">
                -
              </span>
              {" "}
              <span className="text-lg text-neutral-500" id="gradeMax">
                /100
              </span>
            </div>
          </div>
          <p className="text-lg font-semibold" id="gradeLabel">
            Loading...
          </p>
          <p className="text-sm text-neutral-500 dark:text-white/50" id="submittedAt">
            -
          </p>
        </div>
        <div
          className="bg-white dark:bg-neutral-800/50 rounded-2xl p-6 ring-1 ring-black/10 dark:ring-white/10 mb-6"
          id="feedbackSection"
        >
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="material-symbols-rounded text-[#9E4B8A]">
              rate_review
            </span>
            {" Feedback "}
          </h2>
          <div id="feedbackContent" className="prose prose-sm dark:prose-invert" />
        </div>
        <div
          className="bg-white dark:bg-neutral-800/50 rounded-2xl p-6 ring-1 ring-black/10 dark:ring-white/10 mb-6"
          id="rubricSection"
        >
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="material-symbols-rounded text-[#9E4B8A]">
              rule
            </span>
            {" Rubric Breakdown "}
          </h2>
          <div id="rubricBreakdown" className="space-y-3" />
        </div>
        <div
          className="bg-white dark:bg-neutral-800/50 rounded-2xl p-6 ring-1 ring-black/10 dark:ring-white/10"
          id="filesSection"
        >
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span className="material-symbols-rounded text-[#9E4B8A]">
              attach_file
            </span>
            {" Your Submission "}
          </h2>
          <div id="filesList" className="space-y-2" />
        </div>
      </main>
      <script src="/_legacy/assignment_result/script-02.js" />
    </LegacyPage>
  );
}
