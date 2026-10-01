// Converted from ui/assignment_submit.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/assignment_submit/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Submit Assignment — Paper X",
};

export default function AssignmentSubmitPage() {
  return (
    <LegacyPage
      html={{"lang":"en"}}
      body={{"class":"text-neutral-900 dark:text-white bg-gradient-light dark:bg-gradient-dark"}}
      head={
        <>
          <link rel="icon" type="image/x-icon" href="assets/img/favicon.svg" />
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
        href={"https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,500,0..1,0&display=swap"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="assets/css/tailwind.css" />
      <script src="/config.js" />
      <link rel="stylesheet" href="/_legacy/assignment_submit/style-01.css" />
      <script src="/_legacy/assignment_submit/script-01.js" />
      {/* ── original <body> ── */}
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-black/5 dark:border-white/10">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <a
              href="assignments.html"
              className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-brand/10 flex items-center justify-center transition"
            >
              {" "}
              <span className="material-symbols-rounded text-neutral-500 hover:text-brand-500">
                arrow_back
              </span>
              {" "}
            </a>
            {" "}
            <div>
              <h1 className="font-bold text-lg" id="title">
                Submit Assignment
              </h1>
              <p className="text-xs text-neutral-500 dark:text-white/50" id="dueLabel">
                Loading...
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              id="statusBadge"
              className="hidden px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
            >
              <span className="material-symbols-rounded text-xs mr-1">
                schedule
              </span>
              {"Draft "}
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Instructions Card */}
            <section className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center">
                  <span className="material-symbols-rounded text-blue-600 dark:text-blue-400">
                    description
                  </span>
                </div>
                <div>
                  <h2 className="font-semibold">
                    Instructions
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Read carefully before submitting
                  </p>
                </div>
              </div>
              <div
                id="instructions"
                className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap"
              >
                {"\n                        "}
                <div className="skeleton h-4 w-full mb-2" />
                {"\n                        "}
                <div className="skeleton h-4 w-4/5 mb-2" />
                {"\n                        "}
                <div className="skeleton h-4 w-3/5" />
                {"\n                    "}
              </div>
            </section>
            {/* Upload Section */}
            <section className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center">
                  <span className="material-symbols-rounded text-purple-600 dark:text-purple-400">
                    cloud_upload
                  </span>
                </div>
                <div>
                  <h2 className="font-semibold">
                    Upload Files
                  </h2>
                  <p className="text-xs text-neutral-400" id="uploadHint">
                    {"Drag & drop or click to browse"}
                  </p>
                </div>
              </div>
              {/* Dropzone */}
              <div id="dropzone" className="dropzone mb-5">
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 flex items-center justify-center">
                  <span className="material-symbols-rounded text-3xl text-purple-500">
                    upload_file
                  </span>
                </div>
                <p className="font-semibold mb-1">
                  Drop files here
                </p>
                <p className="text-sm text-neutral-400">
                  {"or "}
                  <span className="text-purple-500 font-medium">
                    browse
                  </span>
                  {" to choose"}
                </p>
                <p className="text-xs text-neutral-400 mt-3" id="fileTypesHint">
                  PDF, DOC, DOCX • Max 10MB each
                </p>
                {" "}
                <input
                  type="file"
                  id="fileInput"
                  multiple
                  className="hidden"
                  accept=".pdf,.doc,.docx,.zip,.jpg,.jpeg,.png"
                />
              </div>
              {/* Uploaded Files List */}
              <div id="filesList" className="space-y-3" />
              {/* Empty state for files */}
              <div id="noFiles" className="text-center py-6 text-neutral-400 hidden">
                <span className="material-symbols-rounded text-4xl mb-2 block">
                  folder_open
                </span>
                {" "}
                <p className="text-sm">
                  No files uploaded yet
                </p>
              </div>
            </section>
            {/* Notes Section */}
            <section className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center">
                  <span className="material-symbols-rounded text-amber-600 dark:text-amber-400">
                    edit_note
                  </span>
                </div>
                <div>
                  <h2 className="font-semibold">
                    Notes
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Optional comments for your instructor
                  </p>
                </div>
              </div>
              {" "}
              <textarea
                id="notes"
                rows={4}
                placeholder="Add any notes, explanations, or comments about your submission..."
                className="w-full rounded-xl border-2 border-transparent bg-black/[.03] dark:bg-white/[.05] p-4 text-sm resize-none focus:border-purple-500/50 focus:bg-white dark:focus:bg-white/[.08] outline-none transition"
              />
            </section>
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
              <button id="draftBtn" className="btn btn-secondary w-full sm:w-auto order-2 sm:order-1">
                <span className="material-symbols-rounded text-lg">
                  bookmark
                </span>
                {" Save as Draft "}
              </button>
              {" "}
              <button id="submitBtn" className="btn btn-primary w-full sm:w-auto order-1 sm:order-2">
                <span className="material-symbols-rounded text-lg filled">
                  send
                </span>
                {" Submit Assignment "}
              </button>
            </div>
            <p id="statusMsg" className="text-sm text-center font-medium" />
          </div>
          {/* Sidebar */}
          <div className="space-y-5">
            {/* Assignment Details */}
            <div className="detail-card rounded-2xl p-5">
              <h3 className="text-xs font-bold uppercase tracking-wide text-purple-600 dark:text-purple-400 mb-4">
                {" Assignment Details"}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-neutral-500 dark:text-white/60">
                    <span className="material-symbols-rounded text-lg">
                      event
                    </span>
                    {" "}
                    <span className="text-sm">
                      Due Date
                    </span>
                  </div>
                  {" "}
                  <span className="font-semibold text-sm" id="detailDue">
                    -
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-neutral-500 dark:text-white/60">
                    <span className="material-symbols-rounded text-lg">
                      grade
                    </span>
                    {" "}
                    <span className="text-sm">
                      Max Points
                    </span>
                  </div>
                  {" "}
                  <span className="font-semibold text-sm" id="detailPts">
                    -
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-neutral-500 dark:text-white/60">
                    <span className="material-symbols-rounded text-lg">
                      attach_file
                    </span>
                    {" "}
                    <span className="text-sm">
                      Max Files
                    </span>
                  </div>
                  {" "}
                  <span className="font-semibold text-sm" id="detailFiles">
                    -
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-neutral-500 dark:text-white/60">
                    <span className="material-symbols-rounded text-lg">
                      storage
                    </span>
                    {" "}
                    <span className="text-sm">
                      Size Limit
                    </span>
                  </div>
                  {" "}
                  <span className="font-semibold text-sm" id="detailSize">
                    -
                  </span>
                </div>
              </div>
            </div>
            {/* Upload Progress */}
            <div id="progressCard" className="hidden detail-card rounded-2xl p-5">
              <h3 className="text-xs font-bold uppercase tracking-wide text-purple-600 dark:text-purple-400 mb-4">
                {" Upload Progress"}
              </h3>
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 -rotate-90">
                    <circle cx="32" cy="32" r="28" stroke="rgba(158,75,138,.2)" strokeWidth="6" fill="none" />
                    {" "}
                    <circle
                      id="progressRing"
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="#9E4B8A"
                      strokeWidth="6"
                      fill="none"
                      strokeLinecap="round"
                      className="progress-ring"
                      strokeDasharray="176"
                      strokeDashoffset="176"
                    />
                  </svg>
                  {" "}
                  <span
                    className="absolute inset-0 flex items-center justify-center text-sm font-bold"
                    id="progressPct"
                  >
                    0%
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-sm" id="progressFile">
                    Uploading...
                  </p>
                  <p className="text-xs text-neutral-400" id="progressSize">
                    0 / 0 MB
                  </p>
                </div>
              </div>
            </div>
            {/* Tips */}
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-rounded text-amber-500 filled">
                  lightbulb
                </span>
                {" "}
                <h3 className="font-semibold text-sm">
                  Tips
                </h3>
              </div>
              <ul className="space-y-2 text-xs text-neutral-500 dark:text-white/60">
                <li className="flex gap-2">
                  <span className="material-symbols-rounded text-xs text-emerald-500">
                    check_circle
                  </span>
                  Double-check your files before submitting
                </li>
                <li className="flex gap-2">
                  <span className="material-symbols-rounded text-xs text-emerald-500">
                    check_circle
                  </span>
                  Include your name in the document
                </li>
                <li className="flex gap-2">
                  <span className="material-symbols-rounded text-xs text-emerald-500">
                    check_circle
                  </span>
                  Save as draft if you need more time
                </li>
              </ul>
            </div>
            {" "}
            {/* Extension Request */}
            <button id="extBtn" className="w-full btn btn-secondary text-sm justify-center">
              <span className="material-symbols-rounded text-lg">
                schedule
              </span>
              {" Request Extension "}
            </button>
          </div>
        </div>
      </main>
      {/* Extension Modal */}
      <div
        id="extModal"
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4"
      >
        <div className="glass rounded-2xl p-6 max-w-md w-full space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">
              Request Extension
            </h3>
            {" "}
            <button
              data-px-onclick="document.getElementById('extModal').classList.add('hidden')"
              className="w-8 h-8 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center"
              data-px=""
            >
              <span className="material-symbols-rounded">
                close
              </span>
            </button>
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">
              New Due Date
            </label>
            {" "}
            <input
              type="datetime-local"
              id="extDate"
              className="w-full rounded-xl border-2 border-neutral-200 dark:border-white/15 dark:bg-white/5 p-3 text-sm focus:border-purple-500 outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-2">
              Reason
            </label>
            {" "}
            <textarea
              id="extReason"
              rows={3}
              placeholder="Explain why you need an extension..."
              className="w-full rounded-xl border-2 border-neutral-200 dark:border-white/15 dark:bg-white/5 p-3 text-sm resize-none focus:border-purple-500 outline-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              data-px-onclick="document.getElementById('extModal').classList.add('hidden')"
              className="btn btn-secondary flex-1 justify-center"
              data-px=""
            >
              Cancel
            </button>
            {" "}
            <button data-px-onclick="submitExt()" className="btn btn-primary flex-1 justify-center" data-px="">
              Submit Request
            </button>
          </div>
        </div>
      </div>
      <script src="/_legacy/assignment_submit/script-02.js" />
    </LegacyPage>
  );
}
