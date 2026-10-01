// Converted from ui/tunex/solver.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/tunex/solver/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Problem Solver | Tunex",
};

export default function TunexSolverPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"dark"}}
      body={{"x-data":"solverApp","class":"h-screen flex flex-col"}}
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <link rel="stylesheet" href="../assets/css/tailwind.css" />
      <script src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js" defer />
      <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet" />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.css"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/theme/material-darker.min.css"
      />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.js" />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/python/python.min.js" />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/edit/closebrackets.min.js" />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/edit/matchbrackets.min.js" />
      <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js" />
      <script src="../assets/js/theme.js" />
      <script src="/config.js" />
      <link rel="stylesheet" href="/_legacy/tunex/solver/style-01.css" />
      {/* ── original <body> ── */}
      {/* Header */}
      <header className="h-16 border-b border-white/5 bg-[#12121a]/80 backdrop-blur flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-4">
          <button
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            {...{ "x-on:click": "goBack()" }}
          >
            <i className="ri-arrow-left-line" />
          </button>
          {" "}
          <h1 className="font-bold text-lg flex items-center gap-3">
            <i className="ri-code-box-line text-[#9E4B8A]" />
            {" Problem Solver "}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="px-5 py-2 rounded-lg bg-[#9E4B8A] hover:bg-[#863e75] text-white font-bold transition-all flex items-center gap-2"
            {...{ "x-on:click": "runCode()" }}
          >
            <i className="ri-play-fill" x-show="!running" />
            {" "}
            <i className="ri-loader-4-line animate-spin" x-show="running" />
            {" Run Code "}
          </button>
          {" "}
          <button
            className="px-5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition-all opacity-50 cursor-not-allowed"
            title="Not implemented"
          >
            {" Submit "}
          </button>
        </div>
      </header>
      {/* Main Content */}
      <div className="flex-grow flex overflow-hidden">
        {/* Left Pane: Problem Description */}
        <div className="w-1/2 flex flex-col border-r border-white/5 bg-[#12121a]">
          {/* Tabs */}
          <div className="flex border-b border-white/5 px-4 pt-2 gap-4">
            <button className="px-4 py-2 text-[#9E4B8A] border-b-2 border-[#9E4B8A] font-bold text-sm">
              Description
            </button>
            {" "}
            <button className="px-4 py-2 text-gray-500 hover:text-white transition-colors text-sm">
              Editorial
            </button>
            {" "}
            <button className="px-4 py-2 text-gray-500 hover:text-white transition-colors text-sm">
              Solutions
            </button>
          </div>
          {/* Content */}
          <div className="flex-grow overflow-y-auto p-6 scrollbar-custom" x-show="!loading" x-transition="">
            {/* Title & Difficulty */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold" x-text="problem.title" />
              {" "}
              <span
                className="px-3 py-1 rounded text-xs font-bold uppercase"
                x-text="problem.difficulty"
                {...{ ":class": "{\n                            'bg-green-500/10 text-green-400': problem.difficulty === 'Easy',\n                            'bg-amber-500/10 text-amber-400': problem.difficulty === 'Medium',\n                            'bg-red-500/10 text-red-400': problem.difficulty === 'Hard'\n                        }" }}
              />
            </div>
            {/* Topics */}
            <div className="flex flex-wrap gap-2 mb-4" x-show={"problem.topics && problem.topics.length"}>
              <template
                x-for="topic in problem.topics"
                dangerouslySetInnerHTML={{ __html: "\n                        <span class=\"px-2 py-1 rounded bg-[#9E4B8A]/20 text-[#9E4B8A] text-xs font-medium border border-[#9E4B8A]/30\" x-text=\"topic\"></span>\n                    " }}
                {...{ ":key": "topic" }}
              />
            </div>
            {/* Companies */}
            <div
              className="flex flex-wrap gap-2 mb-6"
              x-show={"problem.companies && problem.companies.length"}
            >
              <template
                x-for="comp in problem.companies"
                dangerouslySetInnerHTML={{ __html: "\n                        <span class=\"px-2 py-1 rounded bg-[#2a2a35] text-xs text-gray-400 border border-white/5\" x-text=\"comp\"></span>\n                    " }}
                {...{ ":key": "comp" }}
              />
            </div>
            {/* Description */}
            <div
              className="prose prose-invert max-w-none prose-sm mb-8"
              x-html="renderMarkdown(problem.description)"
            />
            {/* Examples Section */}
            <div x-show={"problem.examples && problem.examples.length"} className="mb-8">
              <template
                x-for="(example, idx) in problem.examples"
                dangerouslySetInnerHTML={{ __html: "\n                        <div class=\"mb-6\">\n                            <h4 class=\"text-sm font-bold text-gray-300 mb-3\">Example <span x-text=\"idx + 1\"></span>:\n                            </h4>\n                            <div class=\"bg-[#1E1E2F] rounded-lg border border-white/5 p-4 space-y-2\">\n                                <div class=\"font-mono text-sm\">\n                                    <span class=\"text-gray-500\">Input:</span>\n                                    <span class=\"text-gray-200 ml-2\" x-text=\"example.input\"></span>\n                                </div>\n                                <div class=\"font-mono text-sm\">\n                                    <span class=\"text-gray-500\">Output:</span>\n                                    <span class=\"text-green-400 ml-2\" x-text=\"example.output\"></span>\n                                </div>\n                                <div x-show=\"example.explanation\" class=\"text-sm text-gray-400 pt-2 border-t border-white/5\">\n                                    <span class=\"text-gray-500\">Explanation:</span>\n                                    <span x-text=\"example.explanation\"></span>\n                                </div>\n                            </div>\n                        </div>\n                    " }}
                {...{ ":key": "idx" }}
              />
            </div>
            {/* Constraints Section */}
            <div x-show={"problem.constraints && problem.constraints.length"} className="mb-8">
              <h4 className="text-sm font-bold text-gray-300 mb-3">
                Constraints:
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
                <template
                  x-for="constraint in problem.constraints"
                  dangerouslySetInnerHTML={{ __html: "\n                            <li class=\"font-mono\" x-html=\"formatConstraint(constraint)\"></li>\n                        " }}
                  {...{ ":key": "constraint" }}
                />
              </ul>
            </div>
            {/* Follow-up Section */}
            <div x-show="problem.follow_up" className="mb-8">
              <h4 className="text-sm font-bold text-gray-300 mb-3">
                Follow-up:
              </h4>
              <p className="text-sm text-gray-400 italic" x-text="problem.follow_up" />
            </div>
            {/* Hints Section (Collapsible) */}
            <div x-show={"problem.hints && problem.hints.length"} x-data={"{ showHints: false }"}>
              <button
                className="flex items-center gap-2 text-sm font-bold text-[#9E4B8A] hover:text-[#c76fb3] transition-colors mb-3"
                {...{ "x-on:click": "showHints = !showHints" }}
              >
                <i className="ri-lightbulb-line" />
                {" "}
                <span x-text="showHints ? 'Hide Hints' : 'Show Hints (' + problem.hints.length + ')'" />
                {" "}
                <i {...({ ":class": "showHints ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'" } as Record<string, string>)} />
              </button>
              {" "}
              <div x-show="showHints" x-transition="" className="space-y-3">
                <template
                  x-for="(hint, idx) in problem.hints"
                  dangerouslySetInnerHTML={{ __html: "\n                            <div x-data=\"{ open: false }\" class=\"bg-[#1E1E2F] rounded-lg border border-white/5\">\n                                <button @click=\"open = !open\" class=\"w-full flex items-center justify-between p-3 text-sm text-left hover:bg-white/5 transition-colors\">\n                                    <span class=\"text-gray-400\">\n                                        <i class=\"ri-lock-2-line mr-2\" x-show=\"!open\"></i>\n                                        <i class=\"ri-lock-unlock-line mr-2\" x-show=\"open\"></i>\n                                        Hint <span x-text=\"idx + 1\"></span>\n                                    </span>\n                                    <i :class=\"open ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'\" class=\"text-gray-500\"></i>\n                                </button>\n                                <div x-show=\"open\" x-transition=\"\" class=\"px-3 pb-3 text-sm text-gray-300\" x-text=\"hint\">\n                                </div>\n                            </div>\n                        " }}
                  {...{ ":key": "idx" }}
                />
              </div>
            </div>
          </div>
          <div x-show="loading" className="flex-grow flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-[#9E4B8A] border-t-transparent rounded-full" />
          </div>
        </div>
        {/* Right Pane: Editor & Console */}
        <div className="w-1/2 flex flex-col bg-[#1E1E2F]">
          {/* Editor Header */}
          <div className="h-10 border-b border-white/5 bg-[#1E1E2F] flex items-center px-4 justify-between">
            <span className="text-xs font-mono text-gray-400">
              Python 3
            </span>
            {" "}
            <span className="text-xs text-gray-500 hover:text-white cursor-pointer">
              <i className="ri-settings-3-line" />
              {" Settings"}
            </span>
          </div>
          {/* Editor */}
          <div className="flex-grow relative">
            <div id="code-editor" className="absolute inset-0" />
          </div>
          {/* Console / Test Results */}
          <div
            className="h-1/3 flex flex-col border-t border-white/5 bg-[#12121a]"
            {...{ ":class": "{'h-1/2': results}" }}
          >
            <div className="h-10 border-b border-white/5 flex items-center px-4 gap-4 bg-[#181824]">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Test Results
              </span>
              {" "}
              <span
                x-show="results"
                className="text-xs px-2 py-0.5 rounded"
                {...{ ":class": "results && results.status === 'success' && results.passed_tests === results.total_tests ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'" }}
              >
                {" "}
                <span x-text="results ? (results.passed_tests === results.total_tests ? 'Accepted' : 'Wrong Answer') : ''" />
                {" "}
              </span>
            </div>
            <div className="flex-grow overflow-y-auto p-4 font-mono text-sm relative">
              <p x-show={"!results && !running"} className="text-gray-500 italic mt-4 text-center">
                Run code to see results
              </p>
              <div
                x-show="running"
                className="absolute inset-0 flex items-center justify-center bg-[#12121a]/50 z-10"
              >
                <span className="animate-pulse text-[#9E4B8A]">
                  Running Tests...
                </span>
              </div>
              <template
                x-if="results"
                dangerouslySetInnerHTML={{ __html: "\n                        <div class=\"space-y-4\">\n                            <!-- Compile Error -->\n                            <div x-show=\"results.status === 'compile_error' || results.status === 'runtime_error'\" class=\"p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 whitespace-pre-wrap\" x-text=\"results.compile_error\"></div>\n\n                            <!-- Test Cases -->\n                            <div class=\"flex gap-2 mb-4 overflow-x-auto pb-2\" x-show=\"results.status === 'success'\">\n                                <template x-for=\"(res, idx) in results.results\" :key=\"idx\">\n                                    <button @click=\"selectedTest = idx\" class=\"px-3 py-1 rounded border min-w-[80px] text-xs font-bold transition-all\" :class=\"{\n                                            'bg-[#9E4B8A] border-[#9E4B8A] text-white': selectedTest === idx,\n                                            'bg-green-500/10 border-green-500/30 text-green-400': selectedTest !== idx &amp;&amp; res.passed,\n                                            'bg-red-500/10 border-red-500/30 text-red-400': selectedTest !== idx &amp;&amp; !res.passed\n                                        }\">\n                                        Case <span x-text=\"idx + 1\"></span>\n                                        <i x-show=\"res.passed\" class=\"ri-check-line ml-1\"></i>\n                                        <i x-show=\"!res.passed\" class=\"ri-close-line ml-1\"></i>\n                                    </button>\n                                </template>\n                            </div>\n\n                            <!-- Selected Test Detail -->\n                            <template x-if=\"results.status === 'success' &amp;&amp; results.results[selectedTest]\">\n                                <div class=\"space-y-3 p-4 bg-[#1E1E2F] rounded-xl border border-white/5\">\n                                    <template x-if=\"results.results[selectedTest].is_hidden\">\n                                        <div class=\"text-gray-400 italic\">Hidden Test Case</div>\n                                    </template>\n\n                                    <template x-if=\"!results.results[selectedTest].is_hidden\">\n                                        <div class=\"w-full\">\n                                            <div class=\"mb-2\">\n                                                <span class=\"text-xs text-gray-500 uppercase\">Input</span>\n                                                <div class=\"mt-1 p-2 rounded bg-[#12121a] text-gray-300 font-mono text-xs\" x-text=\"JSON.stringify(results.results[selectedTest].input)\"></div>\n                                            </div>\n                                            <div class=\"mb-2\">\n                                                <span class=\"text-xs text-gray-500 uppercase\">Output</span>\n                                                <div class=\"mt-1 p-2 rounded bg-[#12121a] font-mono text-xs border\" :class=\"results.results[selectedTest].passed ? 'border-green-500/30 text-green-400' : 'border-red-500/30 text-red-400'\" x-text=\"JSON.stringify(results.results[selectedTest].output || results.results[selectedTest].error)\">\n                                                </div>\n                                            </div>\n                                            <div>\n                                                <span class=\"text-xs text-gray-500 uppercase\">Expected</span>\n                                                <div class=\"mt-1 p-2 rounded bg-[#12121a] text-gray-300 font-mono text-xs\" x-text=\"JSON.stringify(results.results[selectedTest].expected)\">\n                                                </div>\n                                            </div>\n                                        </div>\n                                    </template>\n                                </div>\n                            </template>\n                        </div>\n                    " }}
              />
            </div>
          </div>
        </div>
      </div>
      <script src="/_legacy/tunex/solver/script-01.js" />
    </LegacyPage>
  );
}
