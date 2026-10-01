// Converted from ui/teacher_classes_manage.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/teacher_classes_manage/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Manage Classes — Paper X",
};

export default function TeacherClassesManagePage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen font-sans antialiased bg-white dark:bg-[#12121a] text-neutral-900 dark:text-white"}}
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
      <link rel="stylesheet" href="assets/css/tailwind.css" />
      <script src="/_legacy/teacher_classes_manage/script-01.js" />
      <script src="/config.js" />
      <script src="/_legacy/teacher_classes_manage/script-02.js" />
      <link rel="stylesheet" href="/_legacy/teacher_classes_manage/style-01.css" />
      {/* ── original <body> ── */}
      <header className="bg-white/70 dark:bg-[#1E1E2F]/70 backdrop-blur border-b border-black/5 dark:border-white/10">
        <div className="container flex items-center justify-between py-3">
          <a href="./teacher_profile.html?user=me" className="flex items-center gap-2">
            {" "}
            <img src="../assets/img/logo-light.svg" className="h-9 dark:hidden" alt="Paper X" />
            {" "}
            <img src="../assets/img/logo-dark.svg" className="h-9 hidden dark:block" alt="Paper X" />
            {" "}
          </a>
          {" "}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="./teacher_profile_edit.html" className="hover:text-brand-500">
              Edit Profile
            </a>
          </nav>
          {" "}
          <button
            data-theme-toggle=""
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5"
          >
            <span className="material-symbols-rounded text-base">
              dark_mode
            </span>
          </button>
        </div>
      </header>
      <main className="container py-8 max-w-6xl space-y-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">
            Manage Classes
          </h1>
          {" "}
          <a href="./teacher_profile.html?user=me" className="text-sm text-brand-500 hover:underline">
            Back to Profile
          </a>
        </div>
        <section className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 space-y-6">
            <form
              id="classForm"
              className="space-y-5 rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur ring-1 ring-black/10 dark:ring-white/10 p-6"
            >
              <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-white/50">
                Add / Edit Class
              </h2>
              {" "}
              <input type="hidden" name="class_id" />
              {" "}
              {/* Ensure college_id is captured and sent with create/update */}
              <input type="hidden" name="college_id" />
              {" "}
              {/* Department & Batch first */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wide mb-1">
                    Department
                  </label>
                  {" "}
                  <select
                    name="department_id"
                    id="departmentSelect"
                    className="w-full rounded-lg bg-white/90 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 focus:ring-brand-500 focus:outline-none px-2 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wide mb-1">
                    Batch
                  </label>
                  {" "}
                  <select
                    name="batch_id"
                    id="batchSelect"
                    className="w-full rounded-lg bg-white/90 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 focus:ring-brand-500 focus:outline-none px-2 py-2 text-sm"
                  />
                </div>
              </div>
              {/* Semester (dropdown 1-10) and Section */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wide mb-1">
                    Semester
                  </label>
                  {" "}
                  <select
                    name="semester"
                    id="semesterSelect"
                    className="w-full rounded-lg bg-white/90 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 focus:ring-brand-500 focus:outline-none px-2 py-2 text-sm"
                  >
                    <option value="">
                      Select
                    </option>
                    <option value="1">
                      1
                    </option>
                    <option value="2">
                      2
                    </option>
                    <option value="3">
                      3
                    </option>
                    <option value="4">
                      4
                    </option>
                    <option value="5">
                      5
                    </option>
                    <option value="6">
                      6
                    </option>
                    <option value="7">
                      7
                    </option>
                    <option value="8">
                      8
                    </option>
                    <option value="9">
                      9
                    </option>
                    <option value="10">
                      10
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wide mb-1">
                    Section
                  </label>
                  {" "}
                  <input
                    name="section"
                    className="w-full rounded-lg bg-white/90 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 focus:ring-brand-500 focus:outline-none px-3 py-2"
                    placeholder="A"
                  />
                </div>
              </div>
              {/* Subject selection (after batch & semester) */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wide mb-1">
                  Subject
                </label>
                {" "}
                <input type="hidden" name="subject_id" id="subjectId" />
                {" "}
                <input type="hidden" name="subject" id="subjectName" />
                {" "}
                <select
                  id="subjectSelect"
                  className="w-full rounded-lg bg-white/90 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 focus:ring-brand-500 focus:outline-none px-2 py-2 text-sm"
                >
                  <option value="">
                    {"Select batch & semester first"}
                  </option>
                </select>
              </div>
              {/* Removed weekly_hours, starts_on, ends_on fields */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wide mb-1">
                  Notes
                </label>
                {" "}
                <textarea
                  name="notes"
                  rows={3}
                  className="w-full rounded-lg bg-white/90 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 focus:ring-brand-500 focus:outline-none px-3 py-2"
                  placeholder="Optional details"
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  id="resetBtn"
                  className="px-4 py-2 rounded-lg bg-black/5 dark:bg-white/10 text-sm hover:bg-black/10 dark:hover:bg-white/15"
                >
                  Clear
                </button>
                {" "}
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600"
                >
                  <span className="material-symbols-rounded text-base">
                    save
                  </span>
                  <span id="submitLabel">
                    Add Class
                  </span>
                </button>
              </div>
              <div id="formStatus" className="text-xs font-medium" />
            </form>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-white/50">
                My Classes
              </h2>
              {" "}
              <input
                id="filterInput"
                placeholder="Filter subject"
                className="text-sm px-3 py-2 rounded-full bg-white/80 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 focus:outline-none focus:ring-brand-500"
              />
            </div>
            <div id="classesEmpty" className="hidden text-sm opacity-60 py-6">
              No classes added yet.
            </div>
            <div id="classesError" className="hidden text-sm text-red-600 dark:text-red-400 py-6" />
            <div id="classesGrid" className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5" />
          </div>
        </section>
      </main>
      <script src="/_legacy/teacher_classes_manage/script-03.js" />
    </LegacyPage>
  );
}
