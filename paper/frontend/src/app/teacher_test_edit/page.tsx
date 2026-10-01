// Converted from ui/teacher_test_edit.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/teacher_test_edit/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Paper X — Edit Test",
};

export default function TeacherTestEditPage() {
  return (
    <LegacyPage
      html={{"lang":"en"}}
      body={{"class":"min-h-screen font-sans antialiased text-neutral-900 dark:text-white bg-slate-50 dark:bg-brand-900/90"}}
      head={
        <>
          <link rel="icon" type="image/x-icon" href="assets/img/favicon.svg" />
        </>
      }
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <link rel="stylesheet" href="assets/css/tailwind.css" />
      <script src="/config.js" />
      <script src="/auth.js" defer />
      {/* ── original <body> ── */}
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Edit Test
            </h1>
            <p className="text-sm text-neutral-600 dark:text-white/70">
              Update questions and settings.
            </p>
          </div>
          {" "}
          <a
            href="./teacher_tests.html"
            className="px-4 py-2 rounded-lg ring-1 ring-black/5 dark:ring-white/15 text-sm hover:bg-black/5 dark:hover:bg-white/10"
          >
            Back
          </a>
        </div>
        <div
          id="alert"
          className="hidden text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-4 py-3 rounded-xl ring-1 ring-red-100 dark:ring-red-800"
        />
        <section className="p-4 rounded-xl bg-white dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10 space-y-4">
          <div className="grid md:grid-cols-2 gap-3">
            <label className="text-sm space-y-1">
              <span className="text-xs uppercase tracking-wide text-neutral-500 dark:text-white/60">
                Title
              </span>
              {" "}
              <input
                id="title"
                className="w-full px-3 py-2 rounded-lg bg-white/80 dark:bg-white/10 ring-1 ring-black/5 dark:ring-white/15"
              />
              {" "}
            </label>
            {" "}
            <label className="text-sm space-y-1">
              <span className="text-xs uppercase tracking-wide text-neutral-500 dark:text-white/60">
                Description
              </span>
              {" "}
              <input
                id="desc"
                className="w-full px-3 py-2 rounded-lg bg-white/80 dark:bg-white/10 ring-1 ring-black/5 dark:ring-white/15"
              />
              {" "}
            </label>
            {" "}
            <label className="text-sm space-y-1">
              <span className="text-xs uppercase tracking-wide text-neutral-500 dark:text-white/60">
                Duration (minutes)
              </span>
              {" "}
              <input
                id="duration"
                type="number"
                min="0"
                max="120"
                className="w-full px-3 py-2 rounded-lg bg-white/80 dark:bg-white/10 ring-1 ring-black/5 dark:ring-white/15"
              />
              {" "}
            </label>
            {" "}
            <label className="text-sm space-y-1 flex items-center gap-2">
              <input id="accepting" type="checkbox" className="size-4" defaultChecked />
              {" "}
              <span className="text-xs uppercase tracking-wide text-neutral-500 dark:text-white/60">
                Accepting submissions
              </span>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">
              Questions
            </h2>
            {" "}
            <button
              id="add"
              className="px-3 py-1.5 rounded-lg bg-brand-500 text-white text-sm hover:bg-brand-600"
            >
              Add Question
            </button>
          </div>
          <div id="questions" className="space-y-3" />
          <div className="flex gap-3">
            <button
              id="save"
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700"
            >
              Save
            </button>
            {" "}
            <button
              id="reset"
              className="px-4 py-2 rounded-lg ring-1 ring-black/5 dark:ring-white/15 text-sm hover:bg-black/5 dark:hover:bg-white/10"
            >
              Reset
            </button>
          </div>
        </section>
      </main>
      <script src="/_legacy/teacher_test_edit/script-01.js" />
    </LegacyPage>
  );
}
