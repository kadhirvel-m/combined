// Converted from ui/tunex/java_compiler.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/tunex/java_compiler/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Java Compiler | Tunex",
};

export default function TunexJavaCompilerPage() {
  return (
    <LegacyPage
      html={{"lang":"en"}}
      body={{"class":"bg-gatex-bg text-gray-100 font-sans antialiased flex flex-col h-screen","x-data":"compilerApp()"}}
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <script src="/config.js" />
      <link rel="stylesheet" href="../assets/css/tailwind.css" />
      <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" defer />
      <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet" />
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
      <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/codemirror.min.js" />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/clike/clike.min.js" />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/edit/closebrackets.min.js" />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/edit/matchbrackets.min.js" />
      <script src="/_legacy/tunex/java_compiler/script-01.js" />
      <script src="/_legacy/tunex/java_compiler/script-02.js" />
      <link rel="stylesheet" href="/_legacy/tunex/java_compiler/style-01.css" />
      {/* ── original <body> ── */}
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 sticky top-0 z-30 glass-header flex-shrink-0">
        <div className="flex items-center gap-4">
          <a href="index.html" className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10">
            {" "}
            <i className="ri-arrow-left-line text-xl" />
            {" "}
          </a>
          {" "}
          <div className="flex items-center gap-2">
            <i className="ri-terminal-box-line text-gatex-success text-xl" />
            {" "}
            <h1 className="text-lg font-bold">
              Java Compiler
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="bg-gatex-success hover:bg-green-600 text-black font-bold px-6 py-2 rounded-lg flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            {...{ "x-on:click": "runCode()", ":disabled": "isRunning" }}
          >
            <i className="ri-play-fill" x-show="!isRunning" />
            {" "}
            <i className="ri-loader-4-line animate-spin" x-show="isRunning" />
            {" "}
            <span x-text="isRunning ? 'Running...' : 'Run Code'" />
          </button>
          {" "}
          <button
            className="p-2 text-gray-400 hover:text-white transition"
            {...{ "x-on:click": "Theme.toggle()" }}
          >
            <i className="ri-moon-line dark:hidden" />
            {" "}
            <i className="ri-sun-line hidden dark:block" />
          </button>
        </div>
      </header>
      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row h-[calc(100vh-4rem)] p-4 gap-4 overflow-hidden">
        {/* Code Editor */}
        <div className="flex-1 flex flex-col bg-gatex-card rounded-xl border border-white/5 overflow-hidden">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/5">
            <span className="text-xs font-mono text-gray-400">
              Main.java
            </span>
            {" "}
            <button
              className="text-xs text-gray-500 hover:text-white transition"
              {...{ "x-on:click": "clearCode()" }}
            >
              Clear
            </button>
          </div>
          <div className="flex-1 cm-wrap" id="java-editor" />
        </div>
        {/* Output Console */}
        <div className="flex-1 flex flex-col bg-gatex-console rounded-xl border border-white/5 overflow-hidden font-mono shadow-inner shadow-black/50">
          <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/5">
            <span className="text-xs text-gray-400">
              Output
            </span>
            {" "}
            <span className="text-xs text-gray-500" x-show="executionTime">
              {"Time: "}
              <span x-text="executionTime" />
              s
            </span>
          </div>
          <div className="flex-1 overflow-auto p-4 font-mono text-sm">
            <template
              x-if={"!output && !error && !isRunning"}
              dangerouslySetInnerHTML={{ __html: "\n                    <div class=\"text-gray-600 italic\">Run code to see output...</div>\n                " }}
            />
            {/* Stdout */}
            <pre x-show="output" className="text-gray-300 whitespace-pre-wrap" x-text="output" />
            {/* Stderr/Error */}
            <pre
              x-show="error"
              className="text-red-400 whitespace-pre-wrap mt-2 pt-2 border-t border-red-900/30"
              x-text="error"
            />
          </div>
        </div>
      </main>
      <script src="/_legacy/tunex/java_compiler/script-03.js" />
    </LegacyPage>
  );
}
