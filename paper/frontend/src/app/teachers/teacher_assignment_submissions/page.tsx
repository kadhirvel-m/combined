// Converted from ui/teachers/teacher_assignment_submissions.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/teachers/teacher_assignment_submissions/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Submissions — Paper X",
};

export default function TeachersTeacherAssignmentSubmissionsPage() {
  return (
    <LegacyPage
      html={{"lang":"en"}}
      body={{"class":"text-neutral-900 dark:text-white bg-mesh-light dark:bg-mesh-dark"}}
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
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"}
        rel="stylesheet"
      />
      <link
        href={"https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,500,0..1,0&display=swap"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="../assets/css/tailwind.css" />
      <script src="/config.js" />
      <link rel="stylesheet" href="/_legacy/teachers/teacher_assignment_submissions/style-01.css" />
      <script src="/_legacy/teachers/teacher_assignment_submissions/script-01.js" />
      {/* ── original <body> ── */}
      {/* Header */}
      <header
        className="sticky top-0 z-50 glass border-b border-black/5 dark:border-white/10"
        style={{ borderRadius: "0" }}
      >
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <a
              href="teacher_assignments.html"
              className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-purple-500/10 flex items-center justify-center transition"
            >
              {" "}
              <span className="material-symbols-rounded text-neutral-500">
                arrow_back
              </span>
              {" "}
            </a>
            {" "}
            <div>
              <h1 className="font-bold text-lg" id="assignmentTitle">
                Submissions
              </h1>
              <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-white/50">
                <span
                  id="classLabel"
                  className="hidden font-semibold text-[#9E4B8A] bg-[#9E4B8A]/10 px-2 py-0.5 rounded"
                />
                {" "}
                <span id="dueDate">
                  Due: -
                </span>
                {" "}
                <span>
                  •
                </span>
                {" "}
                <span id="maxMarksLabel">
                  100 pts
                </span>
                {" "}
                <span>
                  •
                </span>
                {" "}
                <span id="studentCount">
                  0 Students
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a data-px-href="" id="editLink" className="btn btn-ghost btn-sm" data-px="">
              <span className="material-symbols-rounded text-sm">
                edit
              </span>
              Edit
            </a>
            {" "}
            <button
              data-px-onclick="document.documentElement.classList.toggle('dark');localStorage.setItem('px_theme',document.documentElement.classList.contains('dark')?'dark':'light')"
              className="w-10 h-10 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center"
              data-px=""
            >
              <span className="material-symbols-rounded text-lg">
                dark_mode
              </span>
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats Row */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="stat-pill">
            <div className="icon bg-blue-500/15">
              <span className="material-symbols-rounded text-sm text-blue-500 filled">
                upload_file
              </span>
            </div>
            {" "}
            <span id="statSubmitted">
              0
            </span>
            {" "}
            <span className="text-neutral-400 font-normal">
              Submitted
            </span>
          </div>
          <div className="stat-pill">
            <div className="icon bg-emerald-500/15">
              <span className="material-symbols-rounded text-sm text-emerald-500 filled">
                check_circle
              </span>
            </div>
            {" "}
            <span id="statGraded">
              0
            </span>
            {" "}
            <span className="text-neutral-400 font-normal">
              Graded
            </span>
          </div>
          <div className="stat-pill">
            <div className="icon bg-amber-500/15">
              <span className="material-symbols-rounded text-sm text-amber-500 filled">
                schedule
              </span>
            </div>
            {" "}
            <span id="statPending">
              0
            </span>
            {" "}
            <span className="text-neutral-400 font-normal">
              Pending
            </span>
          </div>
          <div className="stat-pill">
            <div className="icon bg-orange-500/15">
              <span className="material-symbols-rounded text-sm text-orange-500 filled">
                group_off
              </span>
            </div>
            {" "}
            <span id="statNotSubmitted">
              0
            </span>
            {" "}
            <span className="text-neutral-400 font-normal">
              Not Submitted
            </span>
          </div>
          <div className="stat-pill cursor-pointer hover:border-red-300" id="duplicatesCard">
            <div className="icon bg-red-500/15">
              <span className="material-symbols-rounded text-sm text-red-500 filled">
                content_copy
              </span>
            </div>
            {" "}
            <span className="text-red-500" id="statDuplicates">
              0
            </span>
            {" "}
            <span className="text-red-400 font-normal">
              Duplicates
            </span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="progress-circle">
              <svg width="64" height="64" viewBox="0 0 64 64">
                <circle className="bg" cx="32" cy="32" r="26" fill="none" strokeWidth="5" />
                {" "}
                <circle
                  className="fg"
                  cx="32"
                  cy="32"
                  r="26"
                  fill="none"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray="163.36"
                  strokeDashoffset="163.36"
                  id="progressRing"
                />
              </svg>
              {" "}
              <span className="text" id="progressPct">
                0%
              </span>
            </div>
            <div className="text-xs">
              <p className="font-semibold">
                Grading Progress
              </p>
              <p className="text-neutral-400" id="progressText">
                0 of 0 graded
              </p>
            </div>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-5 bg-black/[.03] dark:bg-white/[.05] rounded-xl p-1.5 w-fit">
          <button className="tab-btn active" data-tab="submissions">
            All Submissions
          </button>
          {" "}
          <button className="tab-btn" data-tab="students">
            All Students
          </button>
          {" "}
          <button className="tab-btn" data-tab="duplicates">
            Duplicates
          </button>
          {" "}
          <button className="tab-btn" data-tab="analytics">
            Analytics
          </button>
        </div>
        {/* Submissions Tab */}
        <div id="tab-submissions">
          <div className="glass overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>
                    Student
                  </th>
                  <th>
                    Status
                  </th>
                  <th>
                    Submitted
                  </th>
                  <th>
                    Files
                  </th>
                  <th>
                    Grade
                  </th>
                </tr>
              </thead>
              <tbody id="submissionsTable" />
            </table>
            <div id="noSubmissions" className="hidden text-center py-16">
              <span className="material-symbols-rounded text-5xl text-neutral-300 dark:text-white/20 mb-3 block">
                inbox
              </span>
              {" "}
              <p className="text-neutral-500 dark:text-white/50 font-medium">
                No submissions yet
              </p>
              <p className="text-sm text-neutral-400 mt-1">
                Submissions will appear here when students submit their work
              </p>
            </div>
          </div>
        </div>
        {/* All Students Tab */}
        <div id="tab-students" className="hidden">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Completed Column */}
            <div className="glass p-5">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-black/5 dark:border-white/5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                  <span className="material-symbols-rounded text-emerald-500 filled">
                    check_circle
                  </span>
                </div>
                <div>
                  <h3 className="font-bold">
                    Completed
                  </h3>
                  <p className="text-xs text-neutral-500" id="completedCount">
                    0 students
                  </p>
                </div>
              </div>
              <div id="completedStudentsList" className="space-y-2 max-h-[500px] overflow-y-auto">
                <div className="skeleton h-14 rounded-lg" />
                <div className="skeleton h-14 rounded-lg" />
              </div>
              <div id="noCompletedStudents" className="hidden text-center py-10">
                <span className="material-symbols-rounded text-3xl text-neutral-300 mb-2 block">
                  hourglass_empty
                </span>
                {" "}
                <p className="text-neutral-400 text-sm">
                  No submissions yet
                </p>
              </div>
            </div>
            {/* Not Completed Column */}
            <div className="glass p-5">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-black/5 dark:border-white/5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                  <span className="material-symbols-rounded text-amber-500 filled">
                    pending
                  </span>
                </div>
                <div>
                  <h3 className="font-bold">
                    Not Submitted
                  </h3>
                  <p className="text-xs text-neutral-500" id="notCompletedCount">
                    0 students
                  </p>
                </div>
              </div>
              <div id="notCompletedStudentsList" className="space-y-2 max-h-[500px] overflow-y-auto">
                <div className="skeleton h-14 rounded-lg" />
                <div className="skeleton h-14 rounded-lg" />
              </div>
              <div id="noNotCompletedStudents" className="hidden text-center py-10">
                <span className="material-symbols-rounded text-3xl text-emerald-400 filled mb-2 block">
                  celebration
                </span>
                {" "}
                <p className="text-neutral-400 text-sm">
                  All students have submitted!
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Duplicates Tab */}
        <div id="tab-duplicates" className="hidden">
          <div className="glass p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center">
                <span className="material-symbols-rounded text-red-500">
                  warning
                </span>
              </div>
              <div>
                <h3 className="font-semibold">
                  Duplicate Submissions
                </h3>
                <p className="text-xs text-neutral-500">
                  Files with identical content
                </p>
              </div>
            </div>
            <div id="duplicatesList" className="space-y-3" />
            <div id="noDuplicates" className="hidden text-center py-10">
              <span className="material-symbols-rounded text-4xl text-emerald-400 filled mb-2 block">
                verified
              </span>
              {" "}
              <p className="text-neutral-500">
                No duplicates detected
              </p>
            </div>
          </div>
        </div>
        {/* Analytics Tab */}
        <div id="tab-analytics" className="hidden">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="glass p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span className="material-symbols-rounded text-purple-500">
                  bar_chart
                </span>
                Grade Distribution
              </h3>
              <div id="gradeChart" className="space-y-2" />
            </div>
            <div className="glass p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span className="material-symbols-rounded text-purple-500">
                  analytics
                </span>
                Statistics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
                  <p className="text-2xl font-bold" id="avgGrade">
                    -
                  </p>
                  <p className="text-xs text-neutral-500">
                    Average
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                  <p className="text-2xl font-bold" id="maxGrade">
                    -
                  </p>
                  <p className="text-xs text-neutral-500">
                    Highest
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                  <p className="text-2xl font-bold" id="minGrade">
                    -
                  </p>
                  <p className="text-xs text-neutral-500">
                    Lowest
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                  <p className="text-2xl font-bold" id="lateCount">
                    -
                  </p>
                  <p className="text-xs text-neutral-500">
                    Late
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Submission Detail Modal */}
      <div
        id="detailModal"
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4"
      >
        <div
          className="glass max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          style={{ borderRadius: "1.25rem" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-black/5 dark:border-white/10">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-full bg-purple-500/15 flex items-center justify-center font-bold text-purple-600 text-lg"
                id="modalAvatar"
              >
                K
              </div>
              <div>
                <h3 className="font-bold text-lg" id="modalStudentName">
                  Student Name
                </h3>
                <div className="flex items-center gap-3 text-xs text-neutral-500">
                  <span id="modalStatus" />
                  {" "}
                  <span>
                    •
                  </span>
                  {" "}
                  <span id="modalSubmittedAt">
                    -
                  </span>
                </div>
              </div>
            </div>
            {" "}
            <button
              data-px-onclick="closeDetailModal()"
              className="w-9 h-9 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center"
              data-px=""
            >
              <span className="material-symbols-rounded">
                close
              </span>
            </button>
          </div>
          {/* Content */}
          <div className="flex-1 overflow-auto p-5">
            <div className="flex gap-5">
              {/* Left: Preview */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                    Files
                  </h4>
                  <div id="modalFiles" className="flex flex-wrap gap-1" />
                </div>
                <div id="previewArea">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium" id="previewFileName">
                      Select a file
                    </span>
                    {" "}
                    <a
                      id="previewOpenBtn"
                      data-px-href=""
                      target="_blank"
                      className="btn btn-ghost btn-sm"
                      data-px=""
                    >
                      <span className="material-symbols-rounded text-sm">
                        open_in_new
                      </span>
                      Open in new tab
                    </a>
                  </div>
                  {" "}
                  <iframe id="previewFrame" className="preview-frame" />
                </div>
                <div id="modalNotesSection" className="mt-5 hidden">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-2">
                    Student Notes
                  </h4>
                  <p id="modalNotes" className="text-sm bg-black/[.02] dark:bg-white/[.03] rounded-lg p-3" />
                </div>
              </div>
              {/* Right: Grading */}
              <div className="w-56 flex-shrink-0">
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-4 border border-purple-200/30 dark:border-purple-500/20">
                  <p className="text-xs font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400 text-center mb-3">
                    {" Score"}
                  </p>
                  <div className="flex justify-center mb-3">
                    <div className="relative">
                      <svg width="90" height="90" viewBox="0 0 100 100" className="transform -rotate-90">
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          fill="none"
                          stroke="rgba(158,75,138,0.15)"
                          strokeWidth="8"
                        />
                        {" "}
                        <circle
                          id="scoreRing"
                          cx="50"
                          cy="50"
                          r="42"
                          fill="none"
                          stroke="url(#scoreGrad)"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray="264"
                          strokeDashoffset="264"
                        />
                        {" "}
                        <defs>
                          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#9E4B8A" />
                            {" "}
                            <stop offset="100%" stopColor="#E879F9" />
                          </linearGradient>
                        </defs>
                      </svg>
                      {" "}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span id="scorePct" className="text-lg font-bold text-purple-600 dark:text-purple-400">
                          0%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <input
                      type="number"
                      id="modalMarks"
                      className="w-16 text-center text-xl font-bold bg-white dark:bg-white/10 border border-purple-200 dark:border-purple-500/30 rounded-lg py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-400"
                      placeholder="0"
                      data-px-oninput="updateScoreRing()"
                      data-px=""
                    />
                    {" "}
                    <span className="text-neutral-400">
                      /
                    </span>
                    {" "}
                    <span id="modalMaxMarks" className="text-lg font-semibold">
                      100
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    <button
                      data-px-onclick="setQuickScore(100)"
                      className="py-1 text-xs font-medium rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 hover:scale-105 transition"
                      data-px=""
                    >
                      100
                    </button>
                    {" "}
                    <button
                      data-px-onclick="setQuickScore(75)"
                      className="py-1 text-xs font-medium rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 hover:scale-105 transition"
                      data-px=""
                    >
                      75
                    </button>
                    {" "}
                    <button
                      data-px-onclick="setQuickScore(50)"
                      className="py-1 text-xs font-medium rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 hover:scale-105 transition"
                      data-px=""
                    >
                      50
                    </button>
                    {" "}
                    <button
                      data-px-onclick="setQuickScore(0)"
                      className="py-1 text-xs font-medium rounded-lg bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300 hover:scale-105 transition"
                      data-px=""
                    >
                      0
                    </button>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="flex items-center gap-2 text-xs text-neutral-400 mb-1.5">
                    {" "}
                    <span className="material-symbols-rounded text-sm">
                      chat
                    </span>
                    {" Feedback "}
                    <span className="text-neutral-300 dark:text-neutral-600">
                      (optional)
                    </span>
                    {" "}
                  </label>
                  {" "}
                  <textarea
                    id="modalFeedback"
                    rows={3}
                    className="form-input resize-none text-xs"
                    style={{ padding: ".5rem .75rem" }}
                    placeholder="Add a note..."
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Footer */}
          <div className="flex justify-end gap-3 p-5 border-t border-black/5 dark:border-white/10">
            <button data-px-onclick="closeDetailModal()" className="btn btn-ghost" data-px="">
              Cancel
            </button>
            {" "}
            <button data-px-onclick="saveGrade()" className="btn btn-primary" data-px="">
              <span className="material-symbols-rounded text-sm filled">
                check
              </span>
              Save Grade
            </button>
          </div>
        </div>
      </div>
      <script src="/_legacy/teachers/teacher_assignment_submissions/script-02.js" />
    </LegacyPage>
  );
}
