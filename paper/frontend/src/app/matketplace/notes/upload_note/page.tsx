// Converted from ui/matketplace/notes/upload_note.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/matketplace/notes/upload_note/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Paper X — Upload Note",
};

export default function MatketplaceNotesUploadNotePage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen font-sans antialiased text-neutral-900 dark:text-white bg-hero-light dark:bg-hero-dark"}}
      head={
        <>
          <link rel="icon" type="image/x-icon" href="../../assets/img/favicon.svg" />
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
      <script src="/_legacy/matketplace/notes/upload_note/script-01.js" />
      <link rel="stylesheet" href="/_legacy/matketplace/notes/upload_note/style-01.css" />
      <script src="/_legacy/matketplace/notes/upload_note/script-02.js" />
      <script src="/config.js" />
      <script src="/auth.js" defer />
      {/* ── original <body> ── */}
      {/* GLOBAL HEADER */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-brand-900/60 backdrop-blur border-b border-black/5 dark:border-white/10">
        <div className="container flex items-center justify-between py-3">
          <a href="../../index.html" className="flex items-center gap-3" aria-label="Paper X Home">
            {" "}
            <img src="../../assets/img/logo-light.svg" alt="Paper X" className="h-9 w-auto dark:hidden" />
            {" "}
            <img src="../../assets/img/logo-dark.svg" alt="Paper X" className="h-9 w-auto hidden dark:block" />
            {" "}
          </a>
          {" "}
          <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-700 dark:text-white/85">
            <a className="hover:text-brandlt-900 dark:hover:text-white" href="./notes_marketplace.html">
              Marketplace
            </a>
            {" "}
            <a className="hover:text-brandlt-900 dark:hover:text-white font-medium" href="./upload_note.html">
              Upload
            </a>
            {" "}
            <a className="hover:text-brandlt-900 dark:hover:text-white" href="../../collage/clg_info.html">
              Colleges
            </a>
            {" "}
            <a className="hover:text-brandlt-900 dark:hover:text-white" href="../../help.html">
              Help
            </a>
            {" "}
            <a className="hover:text-brandlt-900 dark:hover:text-white" href="../../staff_profile.html">
              Profile
            </a>
          </nav>
          <div className="hidden md:flex items-center gap-2">
            <button
              data-theme-toggle=""
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5"
            >
              <span className="material-symbols-rounded text-base">
                dark_mode
              </span>
            </button>
          </div>
          <div className="md:hidden flex items-center gap-2">
            <button
              data-theme-toggle=""
              className="inline-flex items-center justify-center size-10 rounded-full ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5"
            >
              <span className="material-symbols-rounded">
                dark_mode
              </span>
            </button>
          </div>
        </div>
      </header>
      {/* HERO */}
      <section className="border-b border-black/5 dark:border-white/10 bg-white/70 dark:bg-brand-900/50 backdrop-blur">
        <div className="container py-6 md:py-8 flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Upload Note
          </h1>
          <p className="text-sm text-neutral-600 dark:text-white/60">
            Share high‑quality material with the community. Clean, modern, and fast.
          </p>
          {/* Stepper */}
          <div className="mt-3 flex items-center gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full ring-1 ring-black/10 dark:ring-white/15 bg-white/70 dark:bg-white/10">
              <span className="material-symbols-rounded text-sm">
                edit
              </span>
              Details
            </span>
            {" "}
            <span className="material-symbols-rounded opacity-40">
              chevron_right
            </span>
            {" "}
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full ring-1 ring-black/10 dark:ring-white/15 bg-white/70 dark:bg-white/10">
              <span className="material-symbols-rounded text-sm">
                school
              </span>
              Academic
            </span>
            {" "}
            <span className="material-symbols-rounded opacity-40">
              chevron_right
            </span>
            {" "}
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full ring-1 ring-black/10 dark:ring-white/15 bg-white/70 dark:bg-white/10">
              <span className="material-symbols-rounded text-sm">
                upload_file
              </span>
              File
            </span>
            {" "}
            <span className="material-symbols-rounded opacity-40">
              chevron_right
            </span>
            {" "}
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full ring-1 ring-black/10 dark:ring-white/15 bg-white/70 dark:bg-white/10">
              <span className="material-symbols-rounded text-sm">
                check_circle
              </span>
              Publish
            </span>
          </div>
        </div>
      </section>
      {/* CONTENT */}
      <main className="container py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* MAIN FORM COLUMN */}
        <form id="uploadForm" className="lg:col-span-8 space-y-6" noValidate>
          {/* Card: Details */}
          <section className="glass rounded-2xl p-6 ring-1 ring-black/10 dark:ring-white/15 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold">
                Note details
              </h2>
              {" "}
              <button
                type="button"
                id="clearDraft"
                className="text-xs inline-flex items-center gap-1 px-3 py-1 rounded-full ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5"
              >
                <span className="material-symbols-rounded text-sm">
                  auto_delete
                </span>
                Clear draft
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Title *
                </label>
                {" "}
                <input
                  name="title"
                  required
                  placeholder="e.g. Data Structures Unit 1"
                  className="w-full rounded-lg border px-3 py-2 text-sm bg-white/90 dark:bg-white/10"
                />
                {" "}
                <p data-err="title" className="hidden text-[11px] text-rose-500">
                  Title is required
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Price (₹) — 0 for free
                </label>
                {" "}
                <div className="flex items-center gap-2">
                  <input
                    name="price_cents"
                    type="number"
                    min="0"
                    defaultValue="0"
                    className="w-full rounded-lg border px-3 py-2 text-sm bg-white/90 dark:bg-white/10"
                  />
                  {" "}
                  <button
                    type="button"
                    id="makeFree"
                    className="text-xs px-3 py-1 rounded-full ring-1 ring-black/10 dark:ring-white/15"
                  >
                    Make Free
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Subject
                </label>
                {" "}
                <input
                  name="subject"
                  className="w-full rounded-lg border px-3 py-2 text-sm bg-white/90 dark:bg-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Unit
                </label>
                {" "}
                <input
                  name="unit"
                  className="w-full rounded-lg border px-3 py-2 text-sm bg-white/90 dark:bg-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Exam Type
                </label>
                {" "}
                <input
                  name="exam_type"
                  placeholder="Midterm / Finals / GATE"
                  className="w-full rounded-lg border px-3 py-2 text-sm bg-white/90 dark:bg-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Tags
                </label>
                {" "}
                <div
                  className="rounded-lg border bg-white/90 dark:bg-white/10 px-2 py-1 flex flex-wrap gap-1"
                  id="tagHost"
                >
                  <input
                    id="tagInput"
                    className="flex-1 min-w-[8rem] bg-transparent outline-none text-sm px-2 py-1"
                    placeholder="Type and press Enter"
                  />
                </div>
                {" "}
                <input type="hidden" name="categories" id="tagsHidden" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  {"Cover Image "}
                  <span className="text-[10px] font-normal text-neutral-500 dark:text-white/50">
                    (Optional)
                  </span>
                </label>
                {" "}
                <div className="flex items-start gap-4">
                  <div
                    id="coverPreview"
                    className="w-28 h-20 rounded-lg ring-1 ring-black/10 dark:ring-white/15 bg-white/70 dark:bg-white/10 flex items-center justify-center text-neutral-400 text-xs overflow-hidden"
                  >
                    <span className="material-symbols-rounded text-base opacity-60">
                      image
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <input
                      id="coverInput"
                      name="cover"
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="text-xs"
                    />
                    {" "}
                    <p className="text-[11px] text-neutral-500 dark:text-white/50">
                      PNG / JPG / WEBP / GIF up to 5MB. Recommended 16:10.
                    </p>
                    {" "}
                    <button
                      type="button"
                      id="removeCover"
                      className="self-start text-[11px] px-2 py-1 rounded ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5 hidden"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <label className="text-sm font-medium">
                Description
              </label>
              {" "}
              <textarea
                name="description"
                rows={4}
                className="w-full rounded-lg border px-3 py-2 text-sm bg-white/90 dark:bg-white/10"
                placeholder="Brief overview, key topics covered, and how this helps."
              />
            </div>
          </section>
          {/* Card: Academic links */}
          <section className="glass rounded-2xl p-6 ring-1 ring-black/10 dark:ring-white/15 shadow-card">
            <h2 className="text-sm font-semibold mb-4">
              Academic linkage
            </h2>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  College
                </label>
                <select
                  name="college_id"
                  id="collegeSel"
                  className="w-full rounded-lg border px-3 py-2 text-sm bg-white/90 dark:bg-white/10"
                >
                  <option value="">
                    -- Select College --
                  </option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Degree
                </label>
                <select
                  name="degree_id"
                  id="degreeSel"
                  className="w-full rounded-lg border px-3 py-2 text-sm bg-white/90 dark:bg-white/10"
                  disabled
                >
                  <option value="">
                    -- Select Degree --
                  </option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Department
                </label>
                <select
                  name="department_id"
                  id="deptSel"
                  className="w-full rounded-lg border px-3 py-2 text-sm bg-white/90 dark:bg-white/10"
                  disabled
                >
                  <option value="">
                    -- Select Department --
                  </option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Batch
                </label>
                <select
                  name="batch_id"
                  id="batchSel"
                  className="w-full rounded-lg border px-3 py-2 text-sm bg-white/90 dark:bg-white/10"
                  disabled
                >
                  <option value="">
                    -- Select Batch --
                  </option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Semester
                </label>
                <select
                  name="semester"
                  id="semSel"
                  className="w-full rounded-lg border px-3 py-2 text-sm bg-white/90 dark:bg-white/10"
                  disabled
                >
                  <option value="">
                    -- Semester --
                  </option>
                </select>
              </div>
            </div>
          </section>
          {/* Card: File */}
          <section className="glass rounded-2xl p-6 ring-1 ring-black/10 dark:ring-white/15 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold">
                File
              </h2>
              {" "}
              <span id="fileInfo" className="text-xs text-neutral-600 dark:text-white/70">
                PDF / MD / Image
              </span>
            </div>
            <div
              id="dropzone"
              className="rounded-2xl ring-1 ring-black/10 dark:ring-white/15 bg-white/70 dark:bg-white/5 p-6 grid place-items-center text-center cursor-pointer"
            >
              <div>
                <div className="mx-auto w-14 h-14 rounded-2xl bg-white/70 dark:bg-white/10 grid place-items-center ring-1 ring-black/10 dark:ring-white/15 mb-3">
                  <span className="material-symbols-rounded">
                    cloud_upload
                  </span>
                </div>
                <p className="text-sm font-medium">
                  {"Drag & drop or click to choose a file"}
                </p>
                <p className="text-xs text-neutral-600 dark:text-white/70 mt-1">
                  .pdf, .md, .png, .jpg up to ~25MB
                </p>
              </div>
              {" "}
              <input id="fileInput" name="file" type="file" className="hidden" required />
            </div>
            <div id="filePreview" className="mt-4 hidden">
              <div className="flex items-center gap-3">
                <div
                  className="w-16 h-16 rounded-lg overflow-hidden ring-1 ring-black/10 dark:ring-white/15 bg-white/60 dark:bg-white/10 grid place-items-center"
                  id="thumbBox"
                >
                  <span className="material-symbols-rounded">
                    description
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div id="fileName" className="text-sm font-medium truncate">
                    —
                  </div>
                  <div id="fileMeta" className="text-xs text-neutral-600 dark:text-white/70">
                    —
                  </div>
                </div>
                {" "}
                <button
                  type="button"
                  id="removeFile"
                  className="size-10 grid place-items-center rounded-full ring-1 ring-black/10 dark:ring-white/15"
                >
                  <span className="material-symbols-rounded">
                    close
                  </span>
                </button>
              </div>
              <div className="mt-4 w-full h-2 rounded bg-black/5 dark:bg-white/10 overflow-hidden">
                <div id="progBar" className="h-full w-0 bg-brand-500" />
              </div>
            </div>
          </section>
          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              className="bg-brand-500 hover:bg-brand-600 text-white font-medium px-5 py-2 rounded-lg text-sm inline-flex items-center gap-2"
              type="submit"
            >
              <span className="material-symbols-rounded">
                publish
              </span>
              Publish
            </button>
            {" "}
            <button
              type="button"
              id="saveDraft"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg ring-1 ring-black/10 dark:ring-white/15"
            >
              <span className="material-symbols-rounded">
                save
              </span>
              Save draft
            </button>
            {" "}
            <p id="status" className="text-sm text-neutral-600 dark:text-white/70" />
          </div>
        </form>
        {/* ASIDE PREVIEW COLUMN */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="sticky top-24 space-y-4">
            <div className="glass rounded-2xl p-5 ring-1 ring-black/10 dark:ring-white/15 shadow-card">
              <h3 className="text-sm font-semibold mb-3">
                Listing preview
              </h3>
              <article className="rounded-xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 p-4">
                <div className="flex items-start gap-2">
                  <h4 id="pTitle" className="font-semibold text-sm line-clamp-2">
                    Untitled note
                  </h4>
                  {" "}
                  <span
                    id="pPrice"
                    className="ml-auto text-xs px-2 py-0.5 rounded bg-brand-500/10 text-brand-700 dark:text-fuchsia-200 font-medium"
                  >
                    Free
                  </span>
                </div>
                <p id="pDesc" className="text-xs text-neutral-600 dark:text-white/70 line-clamp-3 mt-1">
                  Description will appear here as you type.
                </p>
                <div
                  id="pMeta"
                  className="mt-2 flex items-center gap-2 text-[11px] text-neutral-600 flex-wrap"
                />
              </article>
            </div>
            <div className="glass rounded-2xl p-5 ring-1 ring-black/10 dark:ring-white/15 shadow-card">
              <h3 className="text-sm font-semibold mb-3">
                Tips
              </h3>
              <ul className="text-xs list-disc pl-4 space-y-1 text-neutral-700 dark:text-white/80">
                <li>
                  Clear, descriptive title improves discovery.
                </li>
                <li>
                  Add subject, unit and exam type—buyers filter by these.
                </li>
                <li>
                  Upload clean scans or export to PDF for best quality.
                </li>
                <li>
                  Free items often gain more ratings and traction.
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </main>
      {/* TOASTS */}
      <div id="toastHost" className="fixed inset-0 pointer-events-none flex flex-col items-end gap-2 p-4 z-50" />
      <script src="/_legacy/matketplace/notes/upload_note/script-03.js" />
    </LegacyPage>
  );
}
