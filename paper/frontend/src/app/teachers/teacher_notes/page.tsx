// Converted from ui/teachers/teacher_notes.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/teachers/teacher_notes/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Teacher Notes — Paper X",
};

export default function TeachersTeacherNotesPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"font-sans antialiased text-neutral-900 dark:text-white bg-hero-light dark:bg-hero-dark min-h-screen flex flex-col overflow-x-hidden"}}
      head={
        <>
          <link rel="icon" type="image/x-icon" href="../assets/img/favicon.svg" />
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
      <link rel="stylesheet" href="../assets/css/tailwind.css" />
      <script src="/config.js" />
      <script src="https://unpkg.com/@supabase/supabase-js@2" />
      <script src="/_legacy/teachers/teacher_notes/script-01.js" />
      <link rel="stylesheet" href="/_legacy/teachers/teacher_notes/style-01.css" />
      <script src="/_legacy/teachers/teacher_notes/script-02.js" />
      {/* ── original <body> ── */}
      <header className="bg-white/70 dark:bg-brand-900/60 backdrop-blur border-b border-black/5 dark:border-white/10">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <a href="../index.html" className="flex items-center gap-2">
              {" "}
              <img src="../assets/img/logo-light.svg" className="h-8 dark:hidden" alt="Paper X" />
              {" "}
              <img src="../assets/img/logo-dark.svg" className="h-8 hidden dark:block" alt="Paper X" />
              {" "}
            </a>
            {" "}
            <h1 className="text-lg font-semibold tracking-tight hidden sm:block">
              Teacher Notes
            </h1>
          </div>
          <nav className="hidden md:flex items-center gap-5 text-sm text-neutral-700 dark:text-white/80">
            <a href="teacher_connect.html" className="hover:text-brandlt-900 dark:hover:text-white">
              Connect
            </a>
            {" "}
            <a href="teacher_signup.html" className="hover:text-brandlt-900 dark:hover:text-white">
              Signup
            </a>
            {" "}
            <a href="teacher_login.html" className="hover:text-brandlt-900 dark:hover:text-white">
              Login
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
          <div className="max-w-5xl mx-auto grid lg:grid-cols-5 gap-10">
            <div className="lg:col-span-3 space-y-8">
              <div>
                <h2 className="text-2xl font-bold gradient-hero-text">
                  Upload Notes
                </h2>
                <p className="mt-2 text-sm text-neutral-600 dark:text-white/60">
                  Associate academic metadata for discoverability. Files stored via marketplace.
                </p>
              </div>
              <form
                id="uploadForm"
                className="space-y-6 rounded-2xl bg-white/80 dark:bg-brand-900/50 backdrop-blur ring-1 ring-black/10 dark:ring-white/10 p-6 shadow-soft"
              >
                <div className="space-y-2" id="classPickerWrap">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase tracking-wide">
                      Select Class (Handled)
                    </label>
                    {" "}
                    <button
                      type="button"
                      id="toggleManualBtn"
                      className="text-[10px] font-medium px-2 py-1 rounded bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15"
                    >
                      Manual Mode
                    </button>
                  </div>
                  <div id="classesList" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3" />
                  <div id="selectedClassInfo" className="text-[11px] mt-1 text-neutral-600 dark:text-white/60" />
                  <div id="noClassesMsg" className="hidden text-[11px] text-neutral-500 dark:text-white/50">
                    No classes found. Use manual mode.
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                    Title
                  </label>
                  {" "}
                  <input
                    type="text"
                    name="title"
                    required
                    className="w-full rounded-lg border-neutral-300 dark:border-white/15 bg-white/90 dark:bg-brand-900/40 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                    Description (optional)
                  </label>
                  {" "}
                  <textarea
                    name="description"
                    className="w-full min-h-[90px] resize-y rounded-lg border-neutral-300 dark:border-white/15 bg-white/90 dark:bg-brand-900/40 focus:ring-brand-500 focus:border-brand-500"
                    placeholder="Short description (optional)"
                  />
                </div>
                <div id="manualFields" className="hidden">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                        College
                      </label>
                      {" "}
                      <select
                        name="college_id"
                        id="collegeSelect"
                        className="w-full rounded-lg border-neutral-300 dark:border-white/15 bg-white/90 dark:bg-brand-900/40 focus:ring-brand-500 focus:border-brand-500"
                      >
                        <option value="">
                          --
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                        Degree
                      </label>
                      {" "}
                      <select
                        name="degree_id"
                        id="degreeSelect"
                        className="w-full rounded-lg border-neutral-300 dark:border-white/15 bg-white/90 dark:bg-brand-900/40 focus:ring-brand-500 focus:border-brand-500"
                      >
                        <option value="">
                          --
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                        Department
                      </label>
                      {" "}
                      <select
                        name="department_id"
                        id="departmentSelect"
                        className="w-full rounded-lg border-neutral-300 dark:border-white/15 bg-white/90 dark:bg-brand-900/40 focus:ring-brand-500 focus:border-brand-500"
                      >
                        <option value="">
                          --
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                        Batch
                      </label>
                      {" "}
                      <select
                        name="batch_id"
                        id="batchSelect"
                        className="w-full rounded-lg border-neutral-300 dark:border-white/15 bg-white/90 dark:bg-brand-900/40 focus:ring-brand-500 focus:border-brand-500"
                      >
                        <option value="">
                          --
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                        Semester
                      </label>
                      {" "}
                      <select
                        name="semester"
                        id="semesterSelect"
                        className="w-full rounded-lg border-neutral-300 dark:border-white/15 bg-white/90 dark:bg-brand-900/40 focus:ring-brand-500 focus:border-brand-500"
                      >
                        <option value="">
                          --
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                        Subject
                      </label>
                      {" "}
                      <select
                        name="subject"
                        id="subjectSelect"
                        className="w-full rounded-lg border-neutral-300 dark:border-white/15 bg-white/90 dark:bg-brand-900/40 focus:ring-brand-500 focus:border-brand-500"
                      >
                        <option value="">
                          --
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
                {" "}
                <input type="hidden" name="college_id" id="hCollege" />
                {" "}
                <input type="hidden" name="degree_id" id="hDegree" />
                {" "}
                <input type="hidden" name="department_id" id="hDepartment" />
                {" "}
                <input type="hidden" name="batch_id" id="hBatch" />
                {" "}
                <input type="hidden" name="semester" id="hSemester" />
                {" "}
                <input type="hidden" name="subject" id="hSubject" />
                {" "}
                <input type="hidden" name="subject_id" id="hSubjectId" />
                {" "}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
                    Attach Files (PDF / DOC / PPT / ZIP)
                  </label>
                  {" "}
                  <input
                    type="file"
                    name="files"
                    multiple
                    required
                    className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-brand-500 file:text-white hover:file:bg-brand-700"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-full bg-brand-500 text-white font-semibold px-6 py-3 text-sm hover:shadow-glow transition"
                  >
                    Upload
                    <span className="material-symbols-rounded text-base">
                      cloud_upload
                    </span>
                  </button>
                </div>
                <div id="uploadStatus" className="text-xs font-medium" />
              </form>
            </div>
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-white/50">
                  {" My Notes"}
                </h3>
                {" "}
                <a
                  href="notes/manage_notes.html"
                  className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-brand-500/10 text-brand-500 hover:bg-brand-500/20 transition"
                >
                  {" View All "}
                  <span className="material-symbols-rounded text-base">
                    open_in_new
                  </span>
                  {" "}
                </a>
              </div>
              <div className="rounded-2xl bg-white/80 dark:bg-brand-900/50 backdrop-blur ring-1 ring-black/10 dark:ring-white/10 p-4 max-h-[70vh] overflow-y-auto">
                <table className="w-full text-sm" id="notesTable">
                  <thead className="text-[10px] uppercase tracking-wider text-neutral-500 dark:text-white/50">
                    <tr>
                      <th className="text-left py-2 pr-3 font-semibold">
                        Title
                      </th>
                      <th className="text-left py-2 pr-3 font-semibold">
                        Subject
                      </th>
                      <th className="text-left py-2 pr-3 font-semibold">
                        Sem
                      </th>
                      <th className="text-left py-2 font-semibold">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody className="align-top" />
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
      <script src="/_legacy/teachers/teacher_notes/script-03.js" />
    </LegacyPage>
  );
}
