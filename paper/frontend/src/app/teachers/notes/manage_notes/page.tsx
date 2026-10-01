// Converted from ui/teachers/notes/manage_notes.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/teachers/notes/manage_notes/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Manage Notes — Paper X",
};

export default function TeachersNotesManageNotesPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"font-sans antialiased text-neutral-900 dark:text-white bg-hero-light dark:bg-hero-dark min-h-screen flex flex-col overflow-x-hidden"}}
      head={
        <>
          <link rel="icon" type="image/x-icon" href="../../../assets/img/favicon.svg" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        </>
      }
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <link
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,600,0,0"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="../../assets/css/tailwind.css" />
      <script src="/config.js" />
      <script src="/_legacy/teachers/notes/manage_notes/script-01.js" />
      <link rel="stylesheet" href="/_legacy/teachers/notes/manage_notes/style-01.css" />
      <script src="/_legacy/teachers/notes/manage_notes/script-02.js" />
      {/* ── original <body> ── */}
      <header className="bg-white/70 dark:bg-brand-900/60 backdrop-blur border-b border-black/5 dark:border-white/10">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <a href="../../index.html" className="flex items-center gap-2">
              {" "}
              <img src="../../../assets/img/logo-light.svg" className="h-8 dark:hidden" alt="Paper X" />
              {" "}
              <img src="../../../assets/img/logo-dark.svg" className="h-8 hidden dark:block" alt="Paper X" />
              {" "}
            </a>
            {" "}
            <h1 className="text-lg font-semibold tracking-tight hidden sm:block">
              Manage Notes
            </h1>
          </div>
          <nav className="hidden md:flex items-center gap-5 text-sm text-neutral-700 dark:text-white/80">
            <a href="../teacher_notes.html" className="hover:text-brandlt-900 dark:hover:text-white">
              Upload
            </a>
            {" "}
            <a href="../teacher_connect.html" className="hover:text-brandlt-900 dark:hover:text-white">
              Connect
            </a>
          </nav>
          {" "}
          <button
            data-theme-toggle=""
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5"
            aria-label="Toggle theme"
          >
            <span className="material-symbols-rounded text-base">
              dark_mode
            </span>
            <span className="hidden sm:block">
              Theme
            </span>
          </button>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-10">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-neutral-500 dark:text-white/40">
                Teacher Workspace
              </p>
              <h2 className="text-2xl font-bold gradient-hero-text">
                All Uploaded Notes
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="../teacher_notes.html"
                className="inline-flex items-center gap-2 rounded-full bg-brand-500 text-white font-semibold px-5 py-2 text-sm hover:shadow-glow transition"
              >
                {" Upload New "}
                <span className="material-symbols-rounded text-base">
                  add
                </span>
                {" "}
              </a>
            </div>
          </div>
          <div className="rounded-2xl bg-white/80 dark:bg-brand-900/50 backdrop-blur ring-1 ring-black/10 dark:ring-white/10 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-white/50">
                My notes catalogue
              </h3>
              {" "}
              <span id="notesStatus" className="text-xs font-medium text-neutral-500 dark:text-white/50" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" id="notesTable">
                <thead className="text-[11px] uppercase tracking-wider text-neutral-500 dark:text-white/50">
                  <tr>
                    <th className="text-left py-2 px-3">
                      Title
                    </th>
                    <th className="text-left py-2 px-3">
                      Subject
                    </th>
                    <th className="text-left py-2 px-3">
                      Semester
                    </th>
                    <th className="text-left py-2 px-3">
                      Updated
                    </th>
                    <th className="text-left py-2 px-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody id="notesTbody" className="divide-y divide-black/5 dark:divide-white/10">
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-sm text-neutral-500 dark:text-white/50">
                      Loading …
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
      <div
        id="editModal"
        className="fixed inset-0 hidden items-center justify-center bg-black/40 dark:bg-black/60 px-4"
      >
        <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-brand-900 ring-1 ring-black/10 dark:ring-white/15 p-6 space-y-5 relative">
          <button
            id="closeModalBtn"
            className="absolute top-3 right-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
            aria-label="Close edit dialog"
          >
            <span className="material-symbols-rounded">
              close
            </span>
          </button>
          {" "}
          <div>
            <h3 className="text-lg font-semibold">
              Edit Note
            </h3>
            <p className="text-xs text-neutral-500 dark:text-white/50">
              Update metadata to keep your catalogue accurate.
            </p>
          </div>
          <form id="editForm" className="space-y-4">
            <input type="hidden" name="note_id" id="editNoteId" />
            {" "}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                Title
              </label>
              {" "}
              <input
                type="text"
                id="editTitle"
                required
                className="w-full rounded-lg border-neutral-300 dark:border-white/15 bg-white/90 dark:bg-brand-900/40 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                Description
              </label>
              {" "}
              <textarea
                id="editDescription"
                className="w-full min-h-[80px] rounded-lg border-neutral-300 dark:border-white/15 bg-white/90 dark:bg-brand-900/40 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-wide text-neutral-500 dark:text-white/50">
                Current File
              </p>
              <p id="currentFileName" className="text-xs font-medium text-neutral-700 dark:text-white/70" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                Replace File (optional)
              </label>
              {" "}
              <input
                type="file"
                id="editFile"
                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-brand-500 file:text-white hover:file:bg-brand-700"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
              />
              {" "}
              <p className="text-[11px] text-neutral-500 dark:text-white/50 mt-1">
                Leave empty to keep the existing upload. Max size 25MB.
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                id="cancelEditBtn"
                className="px-4 py-2 text-sm font-semibold rounded-full ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/10"
              >
                Cancel
              </button>
              {" "}
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-brand-500 text-white font-semibold px-5 py-2 text-sm hover:shadow-glow transition"
              >
                {" Save Changes "}
                <span className="material-symbols-rounded text-base">
                  save
                </span>
              </button>
            </div>
            <div id="editFeedback" className="text-xs font-medium text-brand-500" />
          </form>
        </div>
      </div>
      <script src="/_legacy/teachers/notes/manage_notes/script-03.js" />
    </LegacyPage>
  );
}
