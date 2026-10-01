// Converted from ui/tunex/java_notebook.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/tunex/java_notebook/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Java Notebook | Tunex",
};

export default function TunexJavaNotebookPage() {
  return (
    <LegacyPage
      html={{"lang":"en"}}
      body={{"class":"font-sans antialiased min-h-screen"}}
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <script src="/config.js" />
      <link
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"}
        rel="stylesheet"
      />
      <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet" />
      <link rel="stylesheet" href="../assets/css/tailwind.css" />
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
      <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/clike/clike.min.js" />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/edit/closebrackets.min.js" />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/edit/matchbrackets.min.js" />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/comment/comment.min.js" />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/hint/show-hint.min.js" />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/hint/anyword-hint.min.js" />
      <script src="/_legacy/tunex/java_notebook/script-01.js" />
      <link rel="stylesheet" href="/_legacy/tunex/java_notebook/style-01.css" />
      {/* ── original <body> ── */}
      {/* Header */}
      <header className="header-bar sticky top-0 z-50">
        <div className="max-w-4xl mx-auto h-14 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="index.html" className="btn-icon p-2 rounded-lg">
              {" "}
              <i className="ri-arrow-left-s-line text-xl" />
              {" "}
            </a>
            {" "}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg fab flex items-center justify-center">
                <i className="ri-terminal-box-fill text-white text-sm" />
              </div>
              <div>
                <h1 className="text-sm font-semibold">
                  Java Notebook
                </h1>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Tunex IDE
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              id="runAllBtn"
              className="btn-ghost px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5"
            >
              <i className="ri-play-list-2-fill" />
              <span className="hidden sm:inline">
                Run All
              </span>
            </button>
            {" "}
            <button
              id="clearBtn"
              className="btn-ghost px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5"
            >
              <i className="ri-eraser-fill" />
              <span className="hidden sm:inline">
                Clear
              </span>
            </button>
            {" "}
            <div className="w-px h-5 mx-1" style={{ background: "var(--border-color)" }} />
            {" "}
            <button id="themeBtn" className="btn-icon p-2 rounded-lg">
              <i className="ri-sun-line dark:hidden text-lg" />
              {" "}
              <i className="ri-moon-fill hidden dark:inline text-lg" />
            </button>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div
          className="mb-5 px-4 py-3 rounded-xl"
          style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}
        >
          <p className="text-sm font-medium">
            How this works
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            {" Each cell runs as its own "}
            <span className="font-mono">
              Main.java
            </span>
            {" program. Use "}
            <span className="font-mono">
              Ctrl+Enter
            </span>
            {" to run a cell. "}
          </p>
        </div>
        <div id="cells-container" className="space-y-4" />
        {/* Add Cell Button */}
        <div className="flex justify-center mt-8">
          <button
            id="addCellBtn"
            className="btn-primary px-6 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2"
          >
            <i className="ri-add-line" />
            {" Add Cell "}
          </button>
        </div>
        {/* Keyboard Hints */}
        <div
          className="mt-10 flex flex-wrap justify-center gap-4 text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded font-mono" style={{ background: "var(--bg-tertiary)" }}>
              Ctrl+Enter
            </kbd>
            {" "}
            <span>
              Run cell
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded font-mono" style={{ background: "var(--bg-tertiary)" }}>
              Shift+Enter
            </kbd>
            {" "}
            <span>
              Run + Add below
            </span>
          </div>
        </div>
      </main>
      <script src="/_legacy/tunex/java_notebook/script-02.js" />
    </LegacyPage>
  );
}
