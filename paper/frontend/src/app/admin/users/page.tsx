// Converted from ui/admin/users.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/admin/users/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "PaperX Admin — Users",
};

export default function AdminUsersPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen font-sans antialiased text-neutral-900 dark:text-white"}}
      head={
        <>
          <link rel="icon" type="image/svg+xml" href="../assets/img/favicon.svg" />
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
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0"
        rel="stylesheet"
      />
      <link rel="stylesheet" href="../assets/css/tailwind.css" />
      <link rel="stylesheet" href="/_legacy/admin/users/style-01.css" />
      <script src="/_legacy/admin/users/script-01.js" />
      <script src="/config.js" />
      {/* ── original <body> ── */}
      <header className="sticky top-0 z-30 backdrop-blur bg-white/70 dark:bg-brand-900/70 border-b border-black/5 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <a href="../index.html" className="flex items-center gap-2 font-bold tracking-tight text-lg">
            {" "}
            <img src="../assets/img/logo-light.svg" className="h-8 w-auto dark:hidden" />
            {" "}
            <img src="../assets/img/logo-dark.svg" className="h-8 w-auto hidden dark:block" />
            {" "}
            <span className="gradient-text hidden sm:inline">
              Admin • Users
            </span>
            {" "}
          </a>
          {" "}
          <div className="flex items-center gap-2">
            <a
              href="../teacher_applications.html"
              className="hidden sm:inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium bg-white/70 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 hover:bg-white dark:hover:bg-white/20 transition"
            >
              Teacher Applications
            </a>
            {" "}
            <a
              href="../staff_approval.html"
              className="hidden sm:inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium bg-white/70 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 hover:bg-white dark:hover:bg-white/20 transition"
            >
              Staff Approval
            </a>
            {" "}
            <a
              href="../admin.html"
              className="hidden sm:inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium bg-white/70 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 hover:bg-white dark:hover:bg-white/20 transition"
            >
              Admin (New)
            </a>
            {" "}
            <span
              id="statusPill"
              className="hidden md:inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12px] font-medium bg-white/70 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15"
            >
              {" "}
              <span className="relative flex h-2 w-2">
                {" "}
                <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-500" id="statusDot" />
                {" "}
              </span>
              {" "}
              <span id="statusText">
                Idle
              </span>
              {" "}
            </span>
            {" "}
            <button
              id="themeToggle"
              className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/70 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 hover:bg-white dark:hover:bg-white/20 transition material-symbols-rounded"
              title="Toggle theme"
            >
              dark_mode
            </button>
            {" "}
            <a
              href="../profile.html"
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium bg-brand-500 text-white hover:shadow-neon"
            >
              Profile
            </a>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        <section className="flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex-1 space-y-3">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight gradient-text">
              User Directory
            </h1>
            <p className="text-sm md:text-base text-neutral-600 dark:text-white/60 max-w-2xl">
              Search, filter, and manage academic details. Click any row to edit a user’s college/degree/department/batch/semester/section.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 items-center max-w-lg">
              <span className="chip">
                {"Shown: "}
                <strong id="resultCount">
                  0
                </strong>
              </span>
              {" "}
              <span className="chip hidden md:inline-flex">
                Tip: type to server-search
              </span>
            </div>
          </div>
          <section className="w-full max-w-2xl glass-panel rounded-2xl p-5 ring-1 ring-black/10 dark:ring-white/10 shadow-glass">
            <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
              <div className="space-y-0.5">
                <div className="text-sm font-semibold tracking-tight">
                  Filters
                </div>
                <div className="text-[11px] text-neutral-500 dark:text-white/45">
                  Server-side search runs as you type
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  id="usersBtn"
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium bg-white/70 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 hover:bg-white dark:hover:bg-white/20 transition"
                  title="Show users sorted by total active usage days"
                >
                  <span className="material-symbols-rounded text-[18px]">
                    groups
                  </span>
                  {" Users "}
                </button>
                {" "}
                <button
                  id="refreshBtn"
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium bg-brand-500 text-white hover:shadow-neon transition"
                >
                  <span className="material-symbols-rounded text-[18px]">
                    refresh
                  </span>
                  {" Refresh "}
                </button>
                {" "}
                <button
                  id="clearBtn"
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium bg-white/70 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 hover:bg-white dark:hover:bg-white/20 transition"
                >
                  <span className="material-symbols-rounded text-[18px]">
                    clear_all
                  </span>
                  {" Clear "}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-6">
              <div className="md:col-span-3 lg:col-span-2">
                <label className="text-[11px] font-medium text-neutral-600 dark:text-white/60">
                  Search
                </label>
                {" "}
                <div className="relative mt-1">
                  <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-white/40 text-[20px]">
                    search
                  </span>
                  {" "}
                  <input
                    id="searchInput"
                    type="text"
                    placeholder="Name / Email / Reg No"
                    className="w-full rounded-xl pl-10 pr-3 py-2.5 bg-white/80 dark:bg-white/10 border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/60"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-medium text-neutral-600 dark:text-white/60">
                  Role
                </label>
                {" "}
                <select
                  id="roleFilter"
                  className="mt-1 w-full rounded-xl bg-white/80 dark:bg-white/10 border border-black/10 dark:border-white/10 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/60"
                >
                  <option value="">
                    All
                  </option>
                  <option value="admin">
                    Admin
                  </option>
                  <option value="employee">
                    Employee
                  </option>
                  <option value="teacher">
                    Teacher
                  </option>
                  <option value="moderator">
                    Moderator
                  </option>
                  <option value="student">
                    Student
                  </option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-medium text-neutral-600 dark:text-white/60">
                  College
                </label>
                {" "}
                <select
                  id="collegeFilter"
                  className="mt-1 w-full rounded-xl bg-white/80 dark:bg-white/10 border border-black/10 dark:border-white/10 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/60"
                >
                  <option value="">
                    All
                  </option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-medium text-neutral-600 dark:text-white/60">
                  Department
                </label>
                {" "}
                <select
                  id="deptFilter"
                  className="mt-1 w-full rounded-xl bg-white/80 dark:bg-white/10 border border-black/10 dark:border-white/10 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/60"
                >
                  <option value="">
                    All
                  </option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-medium text-neutral-600 dark:text-white/60">
                  Batch
                </label>
                {" "}
                <select
                  id="batchFilter"
                  className="mt-1 w-full rounded-xl bg-white/80 dark:bg-white/10 border border-black/10 dark:border-white/10 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/60"
                >
                  <option value="">
                    All
                  </option>
                </select>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-5">
              <div>
                <label className="text-[11px] font-medium text-neutral-600 dark:text-white/60">
                  Semester
                </label>
                {" "}
                <select
                  id="semFilter"
                  className="mt-1 w-full rounded-xl bg-white/80 dark:bg-white/10 border border-black/10 dark:border-white/10 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/60"
                >
                  <option value="">
                    All
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
                  <option value="11">
                    11
                  </option>
                  <option value="12">
                    12
                  </option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-medium text-neutral-600 dark:text-white/60">
                  Min streak
                </label>
                {" "}
                <input
                  id="streakMin"
                  type="number"
                  min="0"
                  placeholder="0"
                  className="mt-1 w-full rounded-xl bg-white/80 dark:bg-white/10 border border-black/10 dark:border-white/10 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/60"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-neutral-600 dark:text-white/60">
                  Min streak overall
                </label>
                {" "}
                <input
                  id="streakOverallMin"
                  type="number"
                  min="0"
                  placeholder="0"
                  className="mt-1 w-full rounded-xl bg-white/80 dark:bg-white/10 border border-black/10 dark:border-white/10 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/60"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-neutral-600 dark:text-white/60">
                  Last login
                </label>
                {" "}
                <select
                  id="lastLoginFilter"
                  className="mt-1 w-full rounded-xl bg-white/80 dark:bg-white/10 border border-black/10 dark:border-white/10 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/60"
                >
                  <option value="">
                    Any
                  </option>
                  <option value="1">
                    Last 24h
                  </option>
                  <option value="7">
                    Last 7d
                  </option>
                  <option value="30">
                    Last 30d
                  </option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-medium text-neutral-600 dark:text-white/60">
                  Section
                </label>
                {" "}
                <select
                  id="sectionFilter"
                  className="mt-1 w-full rounded-xl bg-white/80 dark:bg-white/10 border border-black/10 dark:border-white/10 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/60"
                >
                  <option value="">
                    All
                  </option>
                </select>
              </div>
            </div>
          </section>
        </section>
        <section
          id="errorPanel"
          className="hidden glass-panel rounded-2xl p-6 ring-1 ring-red-500/30 shadow-glass"
        >
          <div className="flex items-start gap-3">
            <span className="rounded-xl bg-red-500/10 p-2 text-red-600 dark:text-red-400 ring-1 ring-red-500/20">
              {" "}
              <span className="material-symbols-rounded">
                error
              </span>
              {" "}
            </span>
            {" "}
            <div>
              <h3 className="font-semibold">
                Access denied / error
              </h3>
              <p className="text-sm text-red-700 dark:text-red-200" id="errorText">
                —
              </p>
            </div>
          </div>
        </section>
        <section className="glass-panel rounded-2xl ring-1 ring-black/10 dark:ring-white/10 shadow-glass overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm table-grid">
              <thead className="text-left text-[11px] uppercase tracking-wide text-neutral-500 dark:text-white/40">
                <tr className="border-b border-black/5 dark:border-white/10">
                  <th className="px-4 py-3 font-semibold">
                    User
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    Academic
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    Role
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    Usage Days
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    Last Login
                  </th>
                </tr>
              </thead>
              <tbody id="usersTbody" className="divide-y divide-black/5 dark:divide-white/10" />
            </table>
          </div>
          <div className="px-4 py-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between gap-3">
            <span id="pageInfo" className="text-xs text-neutral-600 dark:text-white/60">
              Showing 0
            </span>
            {" "}
            <button
              id="nextPageBtn"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium bg-white/70 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 hover:bg-white dark:hover:bg-white/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled
            >
              {" Next 50 "}
              <span className="material-symbols-rounded text-[18px]">
                chevron_right
              </span>
            </button>
          </div>
        </section>
      </main>
      {/* User education modal (pattern similar to academicas.html) */}
      <div id="userEduModal" className="hidden fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" data-edu-close="" />
        <div className="relative h-full w-full flex items-center justify-center p-4">
          <div
            className="w-full max-w-2xl rounded-3xl ring-1 ring-black/10 dark:ring-white/10 glass-panel shadow-glass p-6 overflow-y-auto"
            style={{ maxHeight: "calc(100dvh - 2rem)" }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">
                  User academic details
                </h3>
                <p className="text-xs text-neutral-600 dark:text-white/50 mt-1" id="userEduSubtitle">
                  —
                </p>
              </div>
              {" "}
              <button
                type="button"
                className="rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 p-2"
                data-edu-close=""
                aria-label="Close"
              >
                <span className="material-symbols-rounded">
                  close
                </span>
              </button>
            </div>
            <div
              id="userEduStatus"
              className="hidden mt-4 text-xs rounded-lg border border-white/10 px-3 py-2"
            />
            <div className="mt-4 grid grid-cols-1 gap-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="grid gap-1 min-w-0">
                  {" "}
                  <span className="text-xs text-gray-400">
                    College
                  </span>
                  {" "}
                  <select
                    id="eduCollegeSelect"
                    className="w-full min-w-0 rounded-2xl bg-white/80 dark:bg-white/10 border border-black/10 dark:border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/50"
                  >
                    <option value="">
                      Select college
                    </option>
                  </select>
                  {" "}
                  <input
                    id="eduCollegeCustom"
                    type="text"
                    placeholder="Enter college manually"
                    className="hidden mt-2 w-full min-w-0 rounded-2xl bg-white/80 dark:bg-white/10 border border-black/10 dark:border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/50"
                  />
                  {" "}
                </label>
                {" "}
                <label className="grid gap-1 min-w-0">
                  {" "}
                  <span className="text-xs text-gray-400">
                    Degree
                  </span>
                  {" "}
                  <select
                    id="eduDegreeSelect"
                    disabled
                    className="w-full min-w-0 rounded-2xl bg-white/80 dark:bg-white/10 border border-black/10 dark:border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/50 disabled:opacity-60"
                  >
                    <option value="">
                      Select degree
                    </option>
                  </select>
                  {" "}
                  <input
                    id="eduDegreeCustom"
                    type="text"
                    placeholder="Enter degree"
                    className="hidden mt-2 w-full min-w-0 rounded-2xl bg-white/80 dark:bg-white/10 border border-black/10 dark:border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/50"
                  />
                  {" "}
                </label>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="grid gap-1 min-w-0">
                  {" "}
                  <span className="text-xs text-gray-400">
                    Department
                  </span>
                  {" "}
                  <select
                    id="eduDeptSelect"
                    disabled
                    className="w-full min-w-0 rounded-2xl bg-white/80 dark:bg-white/10 border border-black/10 dark:border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/50 disabled:opacity-60"
                  >
                    <option value="">
                      Select department
                    </option>
                  </select>
                  {" "}
                  <input
                    id="eduDeptCustom"
                    type="text"
                    placeholder="Enter department"
                    className="hidden mt-2 w-full min-w-0 rounded-2xl bg-white/80 dark:bg-white/10 border border-black/10 dark:border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/50"
                  />
                  {" "}
                </label>
                {" "}
                <label className="grid gap-1 min-w-0">
                  {" "}
                  <span className="text-xs text-gray-400">
                    Batch
                  </span>
                  {" "}
                  <select
                    id="eduBatchSelect"
                    disabled
                    className="w-full min-w-0 rounded-2xl bg-white/80 dark:bg-white/10 border border-black/10 dark:border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/50 disabled:opacity-60"
                  >
                    <option value="">
                      Select batch
                    </option>
                  </select>
                  {" "}
                  <input
                    id="eduBatchCustom"
                    type="text"
                    placeholder="e.g., 2022-2026"
                    className="hidden mt-2 w-full min-w-0 rounded-2xl bg-white/80 dark:bg-white/10 border border-black/10 dark:border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/50"
                  />
                  {" "}
                </label>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <label className="grid gap-1">
                  {" "}
                  <span className="text-xs text-gray-400">
                    Section
                  </span>
                  {" "}
                  <select
                    id="eduSectionSelect"
                    className="w-full rounded-2xl bg-white/80 dark:bg-white/10 border border-black/10 dark:border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/50"
                  >
                    <option value="">
                      Select section
                    </option>
                  </select>
                  {" "}
                </label>
                {" "}
                <label className="grid gap-1">
                  {" "}
                  <span className="text-xs text-gray-400">
                    Semester
                  </span>
                  {" "}
                  <input
                    id="eduSemester"
                    type="number"
                    min="1"
                    max="12"
                    placeholder="5"
                    className="w-full rounded-2xl bg-white/80 dark:bg-white/10 border border-black/10 dark:border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/50"
                  />
                  {" "}
                </label>
                {" "}
                <label className="grid gap-1">
                  {" "}
                  <span className="text-xs text-gray-400">
                    Reg No
                  </span>
                  {" "}
                  <input
                    id="eduRegno"
                    type="text"
                    placeholder="22TN0049"
                    className="w-full rounded-2xl bg-white/80 dark:bg-white/10 border border-black/10 dark:border-white/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/50"
                  />
                  {" "}
                </label>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                id="userEduCancelBtn"
                type="button"
                data-edu-close=""
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold bg-white/70 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 hover:bg-white dark:hover:bg-white/20 transition"
              >
                {" Cancel "}
              </button>
              {" "}
              <button
                id="userEduSaveBtn"
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold bg-brand-500 text-white hover:shadow-neon transition"
              >
                <span className="material-symbols-rounded text-[18px]">
                  save
                </span>
                {" Save "}
              </button>
            </div>
          </div>
        </div>
      </div>
      <script src="/_legacy/admin/users/script-02.js" />
    </LegacyPage>
  );
}
