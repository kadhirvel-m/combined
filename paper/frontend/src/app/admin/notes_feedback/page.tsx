// Converted from ui/admin/notes_feedback.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/admin/notes_feedback/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "PaperX Admin — Notes Feedback",
};

export default function AdminNotesFeedbackPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"dark"}}
      body={{"class":"bg-gray-900 text-white min-h-screen font-sans"}}
      head={
        <>
          <link rel="icon" type="image/x-icon" href="../assets/img/favicon.svg" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        </>
      }
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <script src="/config.js" defer />
      <script src="/auth.js" defer />
      <link
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"}
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0"
        rel="stylesheet"
      />
      <script src="https://cdn.tailwindcss.com" />
      <script src="/_legacy/admin/notes_feedback/script-01.js" />
      {/* ── original <body> ── */}
      <nav className="border-b border-white/10 bg-brand-900/80 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-brand-500/20 p-2 text-brand-300">
                {" "}
                <span className="material-symbols-rounded">
                  feedback
                </span>
                {" "}
              </span>
              {" "}
              <div>
                <h1 className="text-lg font-bold tracking-tight">
                  Notes Feedback
                </h1>
                <p className="text-xs text-gray-400">
                  Reports from Notes Generator
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="./dashboard.html"
                className="text-sm text-gray-300 hover:text-white underline underline-offset-4"
              >
                Analytics
              </a>
              {" "}
              <a
                href="../notes_generator.html"
                className="text-sm text-gray-300 hover:text-white underline underline-offset-4"
              >
                Notes Generator
              </a>
            </div>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <section className="rounded-3xl bg-white/5 p-6 border border-white/10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="text-xs text-gray-400">
                  Status
                </label>
                {" "}
                <select
                  id="filterStatus"
                  className="mt-1 w-48 rounded-xl bg-gray-900/60 border border-white/10 px-3 py-2 text-sm"
                >
                  <option value="">
                    All
                  </option>
                  <option value="new">
                    New
                  </option>
                  <option value="reviewing">
                    Reviewing
                  </option>
                  <option value="resolved">
                    Resolved
                  </option>
                  <option value="ignored">
                    Ignored
                  </option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400">
                  Search
                </label>
                {" "}
                <input
                  id="filterQ"
                  placeholder="topic / title / email / message"
                  className="mt-1 w-[min(520px,70vw)] rounded-xl bg-gray-900/60 border border-white/10 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                id="refreshBtn"
                className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold hover:bg-brand-700"
              >
                Refresh
              </button>
              {" "}
              <button
                id="exportBtn"
                className="rounded-xl bg-white/10 border border-white/10 px-4 py-2 text-sm hover:bg-white/15"
              >
                Export CSV
              </button>
            </div>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-white/10 uppercase tracking-wider">
                  <th className="py-3 px-4">
                    When
                  </th>
                  <th className="py-3 px-4">
                    User
                  </th>
                  <th className="py-3 px-4">
                    Topic / Title
                  </th>
                  <th className="py-3 px-4">
                    Category
                  </th>
                  <th className="py-3 px-4">
                    Status
                  </th>
                  <th className="py-3 px-4">
                    Message
                  </th>
                  <th className="py-3 px-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody id="rows" className="text-sm">
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-500">
                    Loading…
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p id="hint" className="mt-4 text-xs text-gray-400" />
        </section>
      </main>
      {/* Modal */}
      <div id="modal" className="fixed inset-0 z-[70] hidden">
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative mx-auto mt-10 w-[min(920px,94vw)] rounded-3xl bg-gray-950 border border-white/10 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div>
              <h2 className="text-base font-semibold">
                Feedback Details
              </h2>
              <p id="modalSub" className="text-xs text-gray-400" />
            </div>
            {" "}
            <button
              id="closeModal"
              className="rounded-xl px-3 py-2 bg-white/10 border border-white/10 hover:bg-white/15"
            >
              <span className="material-symbols-rounded">
                close
              </span>
            </button>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-3">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                <div className="text-xs text-gray-400">
                  Message
                </div>
                <pre id="modalMsg" className="mt-2 whitespace-pre-wrap text-sm" />
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                <div className="text-xs text-gray-400">
                  Selected Text
                </div>
                <pre id="modalSel" className="mt-2 whitespace-pre-wrap text-sm" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                <div className="text-xs text-gray-400">
                  Meta
                </div>
                <div id="modalMeta" className="mt-2 text-xs text-gray-200 space-y-1" />
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                <label className="text-xs text-gray-400">
                  Admin Notes
                </label>
                {" "}
                <textarea
                  id="modalAdminNotes"
                  rows={4}
                  className="mt-2 w-full rounded-xl bg-gray-900/60 border border-white/10 px-3 py-2 text-sm"
                />
                {" "}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    data-set-status="reviewing"
                    className="rounded-xl bg-white/10 border border-white/10 px-3 py-2 text-xs hover:bg-white/15"
                  >
                    Mark Reviewing
                  </button>
                  {" "}
                  <button
                    data-set-status="resolved"
                    className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold hover:bg-emerald-700"
                  >
                    Resolve
                  </button>
                  {" "}
                  <button
                    data-set-status="ignored"
                    className="rounded-xl bg-gray-700 px-3 py-2 text-xs font-semibold hover:bg-gray-800"
                  >
                    Ignore
                  </button>
                </div>
                {" "}
                <button
                  id="saveModal"
                  className="mt-3 w-full rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold hover:bg-brand-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <script src="/_legacy/admin/notes_feedback/script-02.js" />
    </LegacyPage>
  );
}
