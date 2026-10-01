// Converted from ui/tunex/notebook.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/tunex/notebook/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Python Notebook | Tunex",
};

export default function TunexNotebookPage() {
  return (
    <LegacyPage
      html={{"lang":"en"}}
      body={{"class":"min-h-screen font-sans antialiased"}}
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <script src="/config.js" />
      <link
        href={"https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"}
        rel="stylesheet"
      />
      <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet" />
      <script src="/_legacy/tunex/notebook/script-01.js" />
      <script src="../assets/js/theme.js" />
      <link rel="stylesheet" href="../assets/css/tailwind.css" />
      <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js" />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/codemirror.min.css"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/theme/material-darker.min.css"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/theme/eclipse.min.css"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/hint/show-hint.min.css"
      />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/codemirror.min.js" />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/python/python.min.js" />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/edit/closebrackets.min.js" />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/edit/matchbrackets.min.js" />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/comment/comment.min.js" />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/hint/show-hint.min.js" />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/hint/anyword-hint.min.js" />
      <script src="/_legacy/tunex/notebook/script-02.js" />
      <link rel="stylesheet" href="/_legacy/tunex/notebook/style-01.css" />
      {/* ── original <body> ── */}
      {/* Header (topic.html style) */}
      <header className="appbar fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <a
            href="index.html"
            className="w-8 h-8 rounded-full appbar-btn flex items-center justify-center"
            title="Back"
          >
            {" "}
            <i className="ri-arrow-left-line" />
            {" "}
          </a>
          {" "}
          <div className="flex items-center gap-3">
            <img src="../assets/img/tunex/tunex-logo-dark.svg" alt="Tunex" className="h-8 logo-dark" />
            {" "}
            <img src="../assets/img/tunex/tunex-logo-light.svg" alt="Tunex" className="h-8 logo-light" />
            {" "}
            <span className="font-bold tracking-tight opacity-60 text-sm border-l border-white/20 pl-3">
              {" Python Notebook "}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            id="runAllBtn"
            className="px-4 py-2 rounded-lg appbar-btn text-sm font-bold flex items-center gap-2"
            title="Run all"
          >
            <i className="ri-play-list-2-fill" />
            <span className="hidden sm:inline">
              Run All
            </span>
          </button>
          {" "}
          <button
            id="clearBtn"
            className="px-4 py-2 rounded-lg appbar-btn text-sm font-bold flex items-center gap-2"
            title="Clear outputs"
          >
            <i className="ri-eraser-fill" />
            <span className="hidden sm:inline">
              Clear
            </span>
          </button>
          {" "}
          <button
            id="themeBtn"
            className="w-9 h-9 rounded-lg appbar-btn flex items-center justify-center"
            title="Toggle theme"
          >
            <i className="ri-moon-line dark:hidden text-lg" />
            {" "}
            <i className="ri-sun-line hidden dark:block text-lg" />
          </button>
        </div>
      </header>
      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 pt-24 pb-10">
        {/* Intro header removed as requested */}
        <div id="cells-container" className="space-y-4" />
        {/* Add Cell Button */}
        <div className="flex justify-center mt-8 gap-3 flex-wrap">
          <button
            id="addCellBtn"
            className="btn-primary px-6 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2"
          >
            <i className="ri-add-line" />
            {" Add Cell "}
          </button>
          {" "}
          <button
            id="addMarkdownBtn"
            className="btn-ghost px-6 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2"
          >
            <i className="ri-markdown-line" />
            {" Add Markdown "}
          </button>
        </div>
        {/* Keyboard Hints */}
        <div className="mt-10 flex flex-wrap justify-center gap-4 text-xs" style={{ color: "var(--muted)" }}>
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded font-mono" style={{ background: "var(--surface-2)" }}>
              Ctrl+Enter
            </kbd>
            {" "}
            <span>
              Run cell
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded font-mono" style={{ background: "var(--surface-2)" }}>
              Shift+Enter
            </kbd>
            {" "}
            <span>
              Run + Add below
            </span>
          </div>
        </div>
      </main>
      <script src="/_legacy/tunex/notebook/script-03.js" />
    </LegacyPage>
  );
}
