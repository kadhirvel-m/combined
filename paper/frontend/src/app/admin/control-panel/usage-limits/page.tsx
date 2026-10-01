// Converted from ui/admin/control-panel/usage-limits.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/admin/control-panel/usage-limits/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Admin Control Panel — Usage Limits",
};

export default function AdminControlPanelUsageLimitsPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"dark"}}
      body={{"class":"min-h-screen bg-slate-100 text-slate-900 dark:bg-brand-900 dark:text-white font-sans"}}
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
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"}
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0"
        rel="stylesheet"
      />
      <script src="https://cdn.tailwindcss.com" />
      <script src="/config.js" defer />
      <script src="./cp-common.js" defer />
      <script src="/_legacy/admin/control-panel/usage-limits/script-01.js" />
      {/* ── original <body> ── */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-brand-900/60 backdrop-blur supports-[backdrop-filter]:saturate-150 border-b border-black/5 dark:border-white/10">
        <div className="container mx-auto px-4 flex items-center justify-between py-3.5">
          <a href="../../index.html" className="flex items-center gap-3 shrink-0" aria-label="Paper X Home">
            {" "}
            <img src="../../assets/img/logo-light.svg" className="h-9 w-auto dark:hidden" alt="Paper X" />
            {" "}
            <img src="../../assets/img/logo-dark.svg" className="h-9 w-auto hidden dark:block" alt="Paper X" />
            {" "}
          </a>
          {" "}
          <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-700 dark:text-white/85">
            <a href="../../index.html" className="hover:text-brandlt-900 dark:hover:text-white">
              Home
            </a>
            {" "}
            <a
              href="../../wishlist.html"
              className="hover:text-brandlt-900 dark:hover:text-white inline-flex items-center gap-1"
            >
              <span className="material-symbols-rounded text-base">
                favorite
              </span>
              Wishlist
            </a>
            {" "}
            <a
              href="../../history.html"
              className="hover:text-brandlt-900 dark:hover:text-white inline-flex items-center gap-1"
            >
              <span className="material-symbols-rounded text-base">
                history
              </span>
              History
            </a>
            {" "}
            <a href="../../contact.html" className="hover:text-brandlt-900 dark:hover:text-white">
              Contact
            </a>
          </nav>
          <div className="hidden md:flex items-center gap-2">
            <button
              data-theme-toggle=""
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5"
              aria-label="Toggle theme"
            >
              <span className="material-symbols-rounded">
                dark_mode
              </span>
              {" "}
              <span className="hidden lg:block">
                Theme
              </span>
            </button>
            {" "}
            <a
              href="../../login.html"
              className="px-3 py-2 text-sm text-neutral-700 dark:text-white/80 hover:text-brandlt-900 dark:hover:text-white rounded-full"
            >
              Log in
            </a>
            {" "}
            <a
              href="../../signup.html"
              className="inline-flex items-center justify-center rounded-full bg-brand-500 text-white text-sm font-semibold px-4 py-2.5 hover:shadow-glow transition"
            >
              Sign up
            </a>
            {" "}
            <a
              id="navProfile"
              href="../../profile.html"
              title="Profile"
              className="hidden items-center justify-center w-10 h-10 rounded-full overflow-hidden border border-black/10 dark:border-white/10 bg-white/90 dark:bg-brand-900/60"
            >
              {" "}
              <img id="navProfileImg" alt="Profile" className="w-full h-full object-cover hidden" />
              {" "}
              <span id="navProfileInitial" className="text-xs font-semibold">
                ME
              </span>
              {" "}
            </a>
            {" "}
            <button
              id="signOutBtn"
              type="button"
              title="Sign out"
              aria-label="Sign out"
              className="hidden items-center gap-2 rounded-full border border-black/10 dark:border-white/15 px-3 py-1.5 text-sm text-neutral-700 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              <span className="material-symbols-rounded text-base">
                logout
              </span>
              {" "}
              <span>
                Sign out
              </span>
            </button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 space-y-6">
        <section className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur p-6">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Usage Limits Engine
          </h1>
          <p className="text-sm text-slate-600 dark:text-white/70 mt-2">
            Define granular caps by scope and user segment.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <a
              data-cp-tab="plans"
              href="./plans-manager.html"
              className="rounded-full px-4 py-2 border border-black/10 dark:border-white/15 transition"
            >
              Plans
            </a>
            {" "}
            <a
              data-cp-tab="limits"
              href="./usage-limits.html"
              className="rounded-full px-4 py-2 border border-black/10 dark:border-white/15 transition"
            >
              Usage Limits
            </a>
            {" "}
            <a
              data-cp-tab="manual"
              href="./manual-access.html"
              className="rounded-full px-4 py-2 border border-black/10 dark:border-white/15 transition"
            >
              Manual Access
            </a>
            {" "}
            <a
              data-cp-tab="abuse"
              href="./abuse-blocks.html"
              className="rounded-full px-4 py-2 border border-black/10 dark:border-white/15 transition"
            >
              Abuse Blocks
            </a>
          </div>
        </section>
        <section className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-6">
          <article className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 p-5">
            <h2 className="font-semibold mb-3">
              Create / Edit Rule
            </h2>
            <p id="status" className="hidden text-xs mb-3" />
            <form id="ruleForm" className="space-y-3">
              <input type="hidden" id="ruleId" />
              {" "}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="text-xs">
                  Rule Name
                  <input
                    id="rule_name"
                    className="mt-1 w-full rounded-xl bg-white dark:bg-brand-900/40 border border-black/10 dark:border-white/10 px-3 py-2 text-sm"
                    required
                  />
                </label>
                {" "}
                <label className="text-xs">
                  Scope
                  <select
                    id="scope_type"
                    className="mt-1 w-full rounded-xl bg-white dark:bg-brand-900/40 border border-black/10 dark:border-white/10 px-3 py-2 text-sm"
                  >
                    <option value="global">
                      Global
                    </option>
                    <option value="college">
                      College
                    </option>
                    <option value="degree">
                      Degree
                    </option>
                    <option value="department">
                      Department
                    </option>
                    <option value="batch">
                      Batch
                    </option>
                    <option value="semester">
                      Semester
                    </option>
                  </select>
                </label>
              </div>
              <div id="scopeFields" className="grid md:grid-cols-2 gap-3">
                <label className="text-xs">
                  College
                  <select
                    id="scope_college_id"
                    className="mt-1 w-full rounded-xl bg-white dark:bg-brand-900/40 border border-black/10 dark:border-white/10 px-3 py-2 text-sm"
                  >
                    <option value="">
                      --
                    </option>
                  </select>
                </label>
                {" "}
                <label className="text-xs">
                  Degree
                  <select
                    id="scope_degree_id"
                    className="mt-1 w-full rounded-xl bg-white dark:bg-brand-900/40 border border-black/10 dark:border-white/10 px-3 py-2 text-sm"
                  >
                    <option value="">
                      --
                    </option>
                  </select>
                </label>
                {" "}
                <label className="text-xs">
                  Department
                  <select
                    id="scope_department_id"
                    className="mt-1 w-full rounded-xl bg-white dark:bg-brand-900/40 border border-black/10 dark:border-white/10 px-3 py-2 text-sm"
                  >
                    <option value="">
                      --
                    </option>
                  </select>
                </label>
                {" "}
                <label className="text-xs">
                  Batch
                  <select
                    id="scope_batch_id"
                    className="mt-1 w-full rounded-xl bg-white dark:bg-brand-900/40 border border-black/10 dark:border-white/10 px-3 py-2 text-sm"
                  >
                    <option value="">
                      --
                    </option>
                  </select>
                </label>
                {" "}
                <label className="text-xs">
                  Semester
                  <input
                    type="number"
                    id="scope_semester"
                    min="1"
                    max="12"
                    className="mt-1 w-full rounded-xl bg-white dark:bg-brand-900/40 border border-black/10 dark:border-white/10 px-3 py-2 text-sm"
                  />
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="text-xs">
                  Max Topics/Day
                  <input
                    type="number"
                    id="max_topics_per_day"
                    min="0"
                    className="mt-1 w-full rounded-xl bg-white dark:bg-brand-900/40 border border-black/10 dark:border-white/10 px-3 py-2 text-sm"
                  />
                </label>
                {" "}
                <label className="text-xs">
                  Max Subjects/Day
                  <input
                    type="number"
                    id="max_subjects_per_day"
                    min="0"
                    className="mt-1 w-full rounded-xl bg-white dark:bg-brand-900/40 border border-black/10 dark:border-white/10 px-3 py-2 text-sm"
                  />
                </label>
                {" "}
                <label className="text-xs">
                  Max MCQ/Day
                  <input
                    type="number"
                    id="max_mcq_attempts_per_day"
                    min="0"
                    className="mt-1 w-full rounded-xl bg-white dark:bg-brand-900/40 border border-black/10 dark:border-white/10 px-3 py-2 text-sm"
                  />
                </label>
                {" "}
                <label className="text-xs">
                  Max Blink/Day
                  <input
                    type="number"
                    id="max_blink_views_per_day"
                    min="0"
                    className="mt-1 w-full rounded-xl bg-white dark:bg-brand-900/40 border border-black/10 dark:border-white/10 px-3 py-2 text-sm"
                  />
                </label>
                {" "}
                <label className="text-xs">
                  Max Searches/Day
                  <input
                    type="number"
                    id="max_searches_per_day"
                    min="0"
                    className="mt-1 w-full rounded-xl bg-white dark:bg-brand-900/40 border border-black/10 dark:border-white/10 px-3 py-2 text-sm"
                  />
                </label>
                {" "}
                <label className="text-xs">
                  Max AI Prompts/Day
                  <input
                    type="number"
                    id="max_ai_prompts_per_day"
                    min="0"
                    className="mt-1 w-full rounded-xl bg-white dark:bg-brand-900/40 border border-black/10 dark:border-white/10 px-3 py-2 text-sm"
                  />
                </label>
                {" "}
                <label className="text-xs">
                  Session Minutes/Day
                  <input
                    type="number"
                    id="max_session_minutes_per_day"
                    min="0"
                    className="mt-1 w-full rounded-xl bg-white dark:bg-brand-900/40 border border-black/10 dark:border-white/10 px-3 py-2 text-sm"
                  />
                </label>
                {" "}
                <label className="text-xs">
                  Trial Duration Days
                  <input
                    type="number"
                    id="trial_duration_days"
                    min="0"
                    className="mt-1 w-full rounded-xl bg-white dark:bg-brand-900/40 border border-black/10 dark:border-white/10 px-3 py-2 text-sm"
                  />
                </label>
              </div>
              <div className="flex flex-wrap gap-4 text-xs">
                <label>
                  <input type="checkbox" id="apply_to_free_users" defaultChecked />
                  {" Apply limits to all free users"}
                </label>
                {" "}
                <label>
                  <input type="checkbox" id="active_status" defaultChecked />
                  {" Active"}
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white"
                >
                  Save Rule
                </button>
                {" "}
                <button
                  type="button"
                  id="resetBtn"
                  className="rounded-xl bg-white dark:bg-white/10 border border-black/10 dark:border-white/10 px-4 py-2 text-sm"
                >
                  Reset
                </button>
              </div>
            </form>
          </article>
          <article className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">
                Current Rules
              </h2>
              {" "}
              <button
                id="reloadBtn"
                className="rounded-xl bg-white dark:bg-white/10 border border-black/10 dark:border-white/10 px-3 py-2 text-xs"
              >
                Reload
              </button>
            </div>
            <div className="overflow-auto max-h-[72vh]">
              <table className="w-full text-sm">
                <thead className="text-xs text-slate-500 dark:text-white/60 border-b border-black/10 dark:border-white/10">
                  <tr>
                    <th className="text-left py-2">
                      Rule
                    </th>
                    <th className="text-left">
                      Scope
                    </th>
                    <th className="text-left">
                      Topics/Day
                    </th>
                    <th className="text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody id="rulesTbody" />
              </table>
            </div>
          </article>
        </section>
      </main>
      <script src="/_legacy/admin/control-panel/usage-limits/script-02.js" />
    </LegacyPage>
  );
}
