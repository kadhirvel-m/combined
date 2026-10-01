// Converted from ui/teachers/teacher_assignment_create.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/teachers/teacher_assignment_create/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Create Assignment — Paper X",
};

export default function TeachersTeacherAssignmentCreatePage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen font-sans antialiased text-neutral-900 dark:text-white bg-hero-light dark:bg-hero-dark"}}
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
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,500,0..1,0"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="../assets/css/tailwind.css" />
      <script src="/config.js" />
      <link rel="stylesheet" href="/_legacy/teachers/teacher_assignment_create/style-01.css" />
      <script src="/_legacy/teachers/teacher_assignment_create/script-01.js" />
      {/* ── original <body> ── */}
      {/* Floating Background Shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-brand-500/10 to-transparent rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-40 right-20 w-96 h-96 bg-gradient-to-br from-purple-500/8 to-transparent rounded-full blur-3xl animate-float"
          style={{ animationDelay: "-2s" }}
        />
      </div>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-brand-900/70 backdrop-blur-xl border-b border-black/5 dark:border-white/10">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <a
              href="teacher_assignments.html"
              className="group flex items-center justify-center w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-brand-500/10 dark:hover:bg-brand-500/20 transition"
            >
              {" "}
              <span className="material-symbols-rounded text-neutral-500 group-hover:text-brand-500 transition">
                arrow_back
              </span>
              {" "}
            </a>
            {" "}
            <div>
              <h1 className="text-xl font-bold" id="pageTitle">
                Create Assignment
              </h1>
              <p className="text-xs text-neutral-500 dark:text-white/50">
                Define task details for your students
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              id="saveDraftBtn"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              <span className="material-symbols-rounded text-lg">
                bookmark
              </span>
              {" Save Draft "}
            </button>
            {" "}
            <button
              id="publishBtn"
              className="btn-gradient inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-xl shadow-lg hover:shadow-glow hover:-translate-y-0.5 transition-all duration-300"
            >
              <span className="material-symbols-rounded text-lg filled">
                rocket_launch
              </span>
              {" Publish "}
            </button>
          </div>
        </div>
      </header>
      <main className="container relative py-8 pb-24">
        <div className="grid lg:grid-cols-[1fr,320px] gap-8 max-w-6xl mx-auto">
          {/* Main Form Column */}
          <div className="space-y-6">
            {/* Hero Card */}
            <section className="glass-panel rounded-3xl p-8 ring-1 ring-black/5 dark:ring-white/10 relative overflow-hidden">
              {/* Decorative */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-brand-500/10 to-transparent rounded-bl-full pointer-events-none" />
              <div className="relative space-y-6">
                {/* Title Input */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold mb-3">
                    {" "}
                    <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-brand-500/10 text-brand-500">
                      {" "}
                      <span className="material-symbols-rounded text-sm">
                        title
                      </span>
                      {" "}
                    </span>
                    {" Assignment Title "}
                  </label>
                  {" "}
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    placeholder="e.g., Data Structures Lab Exercise 5"
                    className="input-field w-full px-5 py-4 rounded-2xl text-base font-medium outline-none"
                  />
                </div>
                {/* Class + Due Date */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold mb-3">
                      {" "}
                      <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600">
                        {" "}
                        <span className="material-symbols-rounded text-sm">
                          school
                        </span>
                        {" "}
                      </span>
                      {" Class "}
                    </label>
                    {" "}
                    <select
                      id="classId"
                      className="input-field w-full px-4 py-3.5 rounded-xl text-sm outline-none cursor-pointer"
                    >
                      <option value="">
                        All Classes
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold mb-3">
                      {" "}
                      <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600">
                        {" "}
                        <span className="material-symbols-rounded text-sm">
                          event
                        </span>
                        {" "}
                      </span>
                      {" Due Date "}
                    </label>
                    {" "}
                    <input
                      type="date"
                      id="dueDate"
                      required
                      className="input-field w-full px-4 py-3.5 rounded-xl text-sm outline-none"
                    />
                  </div>
                </div>
                {/* Instructions */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold mb-3">
                    {" "}
                    <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600">
                      {" "}
                      <span className="material-symbols-rounded text-sm">
                        description
                      </span>
                      {" "}
                    </span>
                    {" Instructions "}
                  </label>
                  {" "}
                  <textarea
                    id="description"
                    rows={4}
                    placeholder="Describe the task, requirements, and submission guidelines..."
                    className="input-field w-full px-5 py-4 rounded-2xl text-sm outline-none resize-y leading-relaxed"
                  />
                </div>
              </div>
            </section>
            {/* Assignment Type & Marks */}
            <section className="glass-panel rounded-3xl p-6 ring-1 ring-black/5 dark:ring-white/10">
              <div className="grid sm:grid-cols-2 gap-6">
                {/* Type Selection */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold mb-4">
                    {" "}
                    <span className="material-symbols-rounded text-lg text-brand-500">
                      group
                    </span>
                    {" Submission Type "}
                  </label>
                  {" "}
                  <div className="grid grid-cols-2 gap-3">
                    <label className="type-card cursor-pointer p-4 rounded-2xl border border-black/10 dark:border-white/10 hover:border-brand-500/50 transition">
                      {" "}
                      <input
                        type="radio"
                        name="assignment_type"
                        value="individual"
                        defaultChecked
                        className="hidden"
                      />
                      {" "}
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center">
                          <span className="material-symbols-rounded text-blue-600 text-2xl">
                            person
                          </span>
                        </div>
                        <p className="font-semibold text-sm">
                          Individual
                        </p>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          Solo work
                        </p>
                      </div>
                      {" "}
                    </label>
                    {" "}
                    <label className="type-card cursor-pointer p-4 rounded-2xl border border-black/10 dark:border-white/10 hover:border-brand-500/50 transition">
                      {" "}
                      <input type="radio" name="assignment_type" value="team" className="hidden" />
                      {" "}
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center">
                          <span className="material-symbols-rounded text-purple-600 text-2xl">
                            groups
                          </span>
                        </div>
                        <p className="font-semibold text-sm">
                          Team
                        </p>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          Group project
                        </p>
                      </div>
                      {" "}
                    </label>
                  </div>
                </div>
                {/* Marks */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold mb-4">
                    {" "}
                    <span className="material-symbols-rounded text-lg text-amber-500">
                      grade
                    </span>
                    {" Maximum Marks "}
                  </label>
                  {" "}
                  <div className="relative">
                    <input
                      type="number"
                      id="maxMarks"
                      min="1"
                      defaultValue="100"
                      className="input-field w-full px-5 py-4 rounded-2xl text-2xl font-bold text-center outline-none"
                    />
                    {" "}
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                      <span className="text-sm text-neutral-400">
                        points
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-400 text-center mt-2">
                    Staff grades overall marks during review
                  </p>
                </div>
              </div>
            </section>
            {/* File Settings */}
            <section className="glass-panel rounded-3xl p-6 ring-1 ring-black/5 dark:ring-white/10">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500/20 to-brand-500/5 flex items-center justify-center">
                  <span className="material-symbols-rounded text-brand-500">
                    folder
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold">
                    File Submissions
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Configure upload limits
                  </p>
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4 mb-5">
                <div className="p-4 rounded-2xl bg-black/[.02] dark:bg-white/[.03]">
                  <label className="text-xs font-medium text-neutral-500 mb-2 block">
                    Max Files
                  </label>
                  {" "}
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      id="maxFiles"
                      min="1"
                      max="20"
                      defaultValue="5"
                      className="input-field w-full px-3 py-2 rounded-lg text-lg font-semibold text-center outline-none"
                    />
                    {" "}
                    <span className="material-symbols-rounded text-neutral-300">
                      upload_file
                    </span>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-black/[.02] dark:bg-white/[.03]">
                  <label className="text-xs font-medium text-neutral-500 mb-2 block">
                    Size Limit
                  </label>
                  {" "}
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      id="maxFileSize"
                      min="1"
                      max="100"
                      defaultValue="10"
                      className="input-field w-full px-3 py-2 rounded-lg text-lg font-semibold text-center outline-none"
                    />
                    {" "}
                    <span className="text-sm text-neutral-400">
                      MB
                    </span>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-black/[.02] dark:bg-white/[.03]">
                  <label className="text-xs font-medium text-neutral-500 mb-2 block">
                    Allowed Types
                  </label>
                  {" "}
                  <div className="flex flex-wrap gap-1.5">
                    <label className="file-chip cursor-pointer px-2.5 py-1 rounded-lg text-xs font-medium border border-black/10 dark:border-white/15">
                      <input type="checkbox" name="file_types" value="pdf" defaultChecked className="hidden" />
                      PDF
                    </label>
                    {" "}
                    <label className="file-chip cursor-pointer px-2.5 py-1 rounded-lg text-xs font-medium border border-black/10 dark:border-white/15">
                      <input type="checkbox" name="file_types" value="doc" defaultChecked className="hidden" />
                      DOC
                    </label>
                    {" "}
                    <label className="file-chip cursor-pointer px-2.5 py-1 rounded-lg text-xs font-medium border border-black/10 dark:border-white/15">
                      <input type="checkbox" name="file_types" value="zip" className="hidden" />
                      ZIP
                    </label>
                    {" "}
                    <label className="file-chip cursor-pointer px-2.5 py-1 rounded-lg text-xs font-medium border border-black/10 dark:border-white/15">
                      <input type="checkbox" name="file_types" value="img" className="hidden" />
                      IMG
                    </label>
                  </div>
                </div>
              </div>
            </section>
            {/* Advanced Options */}
            <section className="glass-panel rounded-3xl ring-1 ring-black/5 dark:ring-white/10 overflow-hidden">
              <button
                type="button"
                id="advToggle"
                className="w-full flex items-center justify-between p-5 hover:bg-black/[.02] dark:hover:bg-white/[.02] transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-white/5 flex items-center justify-center">
                    <span className="material-symbols-rounded text-neutral-400">
                      tune
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-sm">
                      Advanced Options
                    </p>
                    <p className="text-xs text-neutral-400">
                      Team size, late submissions, resources
                    </p>
                  </div>
                </div>
                {" "}
                <span
                  className="material-symbols-rounded text-neutral-400 transition-transform duration-300"
                  id="advIcon"
                >
                  expand_more
                </span>
              </button>
              {" "}
              <div className="collapse-content" id="advContent">
                <div className="collapse-inner">
                  <div className="px-6 pb-6 space-y-5 border-t border-black/5 dark:border-white/5 pt-5">
                    {/* Team Size */}
                    <div
                      id="teamSizeRow"
                      className="hidden p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-rounded text-purple-500">
                            groups
                          </span>
                          {" "}
                          <div>
                            <p className="font-medium text-sm">
                              Team Size
                            </p>
                            <p className="text-xs text-neutral-400">
                              Max members per team
                            </p>
                          </div>
                        </div>
                        {" "}
                        <input
                          type="number"
                          id="maxTeamSize"
                          min="2"
                          max="10"
                          defaultValue="4"
                          className="input-field w-20 px-3 py-2 rounded-lg text-center font-semibold outline-none"
                        />
                      </div>
                    </div>
                    {/* Late Submission */}
                    <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-rounded text-amber-500">
                            schedule
                          </span>
                          {" "}
                          <div>
                            <p className="font-medium text-sm">
                              Late Submissions
                            </p>
                            <p className="text-xs text-neutral-400">
                              Allow with penalty
                            </p>
                          </div>
                        </div>
                        {" "}
                        <label className="relative inline-flex items-center cursor-pointer">
                          {" "}
                          <input type="checkbox" id="allowLate" className="sr-only peer" />
                          {" "}
                          <div className="w-12 h-7 bg-neutral-200 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all after:shadow peer-checked:bg-amber-500" />
                          {" "}
                        </label>
                      </div>
                      <div
                        id="latePenaltyRow"
                        className="hidden grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-amber-500/10"
                      >
                        <div>
                          <label className="text-xs font-medium text-neutral-500">
                            Penalty %
                          </label>
                          {" "}
                          <input
                            type="number"
                            id="latePenalty"
                            min="0"
                            max="100"
                            defaultValue="10"
                            className="input-field w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-neutral-500">
                            Grace Hours
                          </label>
                          {" "}
                          <input
                            type="number"
                            id="gracePeriod"
                            min="0"
                            defaultValue="24"
                            className="input-field w-full mt-1 px-3 py-2 rounded-lg text-sm outline-none"
                          />
                        </div>
                      </div>
                    </div>
                    {/* Resources */}
                    <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="material-symbols-rounded text-blue-500">
                          link
                        </span>
                        {" "}
                        <p className="font-medium text-sm">
                          Resource Links
                        </p>
                      </div>
                      {" "}
                      <textarea
                        id="resourceLinks"
                        rows={2}
                        placeholder="Paste URLs here (one per line)"
                        className="input-field w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
          {/* Sidebar */}
          <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            {/* Preview Card */}
            <div className="glass-panel rounded-2xl p-5 ring-1 ring-black/5 dark:ring-white/10">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-rounded text-brand-500">
                  visibility
                </span>
                {" "}
                <h3 className="font-semibold text-sm">
                  Preview
                </h3>
              </div>
              <div className="preview-box rounded-xl p-4 border border-dashed border-black/10 dark:border-white/10">
                <p className="font-semibold text-sm mb-1" id="previewTitle">
                  Assignment Title
                </p>
                <div className="flex items-center gap-3 text-xs text-neutral-500">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-rounded text-sm">
                      event
                    </span>
                    {" "}
                    <span id="previewDate">
                      Due date
                    </span>
                  </span>
                  {" "}
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-rounded text-sm">
                      grade
                    </span>
                    {" "}
                    <span id="previewMarks">
                      100
                    </span>
                    {" pts"}
                  </span>
                </div>
              </div>
            </div>
            {/* Tips */}
            <div className="feature-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-rounded text-amber-500 filled">
                  lightbulb
                </span>
                {" "}
                <h3 className="font-semibold text-sm">
                  Tips
                </h3>
              </div>
              <ul className="space-y-3 text-xs text-neutral-600 dark:text-white/60">
                <li className="flex gap-2">
                  <span className="material-symbols-rounded text-sm text-emerald-500 flex-shrink-0">
                    check_circle
                  </span>
                  {" "}
                  <span>
                    Clear titles help students find assignments quickly
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="material-symbols-rounded text-sm text-emerald-500 flex-shrink-0">
                    check_circle
                  </span>
                  {" "}
                  <span>
                    Set realistic deadlines with buffer time
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="material-symbols-rounded text-sm text-emerald-500 flex-shrink-0">
                    check_circle
                  </span>
                  {" "}
                  <span>
                    Include submission format in instructions
                  </span>
                </li>
              </ul>
            </div>
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-panel rounded-2xl p-4 text-center ring-1 ring-black/5 dark:ring-white/10">
                <p className="text-2xl font-bold text-brand-500" id="classCount">
                  0
                </p>
                <p className="text-xs text-neutral-400">
                  Classes
                </p>
              </div>
              <div className="glass-panel rounded-2xl p-4 text-center ring-1 ring-black/5 dark:ring-white/10">
                <p className="text-2xl font-bold text-emerald-500">
                  ∞
                </p>
                <p className="text-xs text-neutral-400">
                  Students
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Toast */}
      <div id="toast" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 hidden">
        <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xl">
          <span className="material-symbols-rounded text-xl" id="toastIcon">
            check_circle
          </span>
          {" "}
          <span className="text-sm font-medium" id="toastMsg">
            Saved!
          </span>
        </div>
      </div>
      <script src="/_legacy/teachers/teacher_assignment_create/script-02.js" />
    </LegacyPage>
  );
}
