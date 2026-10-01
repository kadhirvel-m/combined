// Converted from ui/admin/control-panel/plans-manager.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/admin/control-panel/plans-manager/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Admin Control Panel — Plans Manager",
};

export default function AdminControlPanelPlansManagerPage() {
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
      <script src="/config.js" />
      <script src="./cp-common.js" />
      <script src="/_legacy/admin/control-panel/plans-manager/script-01.js" />
      <link rel="stylesheet" href="/_legacy/admin/control-panel/plans-manager/style-01.css" />
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
        <section className="rounded-3xl border border-black/10 dark:border-white/10 bg-gradient-to-br from-white/90 via-white/80 to-fuchsia-50 dark:from-white/10 dark:via-white/5 dark:to-transparent backdrop-blur p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Plans Manager
              </h1>
              <p className="text-sm text-slate-600 dark:text-white/70 mt-2">
                Modern plan orchestration for pricing, entitlement, and academic scope.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
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
          </div>
        </section>
        <section className="grid lg:grid-cols-[0.66fr_1.34fr] gap-6 items-start">
          <article className="order-1 rounded-3xl border border-black/10 dark:border-white/10 bg-white/95 dark:bg-white/5 shadow-soft p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h2 className="font-semibold text-lg">
                All Plans
              </h2>
              <div className="flex items-center gap-2">
                <input id="searchPlan" placeholder="Search by name / code" className="px-field w-56" />
                {" "}
                <button
                  id="reloadBtn"
                  className="rounded-xl bg-white dark:bg-white/10 border border-black/10 dark:border-white/10 px-3 py-2 text-xs"
                >
                  Reload
                </button>
              </div>
            </div>
            <div className="overflow-auto max-h-[74vh] rounded-2xl border border-black/10 dark:border-white/10">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-50/95 dark:bg-brand-900/80 text-xs text-slate-500 dark:text-white/60 border-b border-black/10 dark:border-white/10">
                  <tr>
                    <th className="text-left py-3 px-3">
                      Plan
                    </th>
                    <th className="text-left px-3">
                      Price
                    </th>
                    <th className="text-left px-3">
                      Status
                    </th>
                    <th className="text-right px-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody id="plansTbody" />
              </table>
            </div>
          </article>
          <article className="order-2 rounded-3xl border border-black/10 dark:border-white/10 bg-white/95 dark:bg-white/5 shadow-soft p-5">
            <div className="mb-4">
              <h2 className="font-semibold text-lg">
                Create / Edit Plan
              </h2>
              <p id="status" className="hidden text-xs mt-2" />
            </div>
            <form id="planForm" className="space-y-4">
              <input type="hidden" id="planId" />
              {" "}
              <section className="rounded-2xl border border-black/10 dark:border-white/10 p-3">
                <div className="grid grid-cols-1 gap-3">
                  <label className="text-xs">
                    Plan Name
                    <input id="name" className="px-field mt-1" required />
                  </label>
                </div>
                {" "}
                <label className="text-xs block mt-3">
                  Description
                  <textarea id="description" rows={2} className="px-field mt-1" />
                </label>
              </section>
              <section className="rounded-2xl border border-black/10 dark:border-white/10 p-3">
                <h3 className="text-xs uppercase tracking-wide text-slate-500 dark:text-white/60 mb-3">
                  {"Billing & Entitlements"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label className="text-xs">
                    Price (₹)
                    <input
                      type="number"
                      id="price_inr"
                      min="0"
                      step="0.01"
                      className="px-field mt-1"
                      defaultValue="0"
                    />
                  </label>
                  {" "}
                  <label className="text-xs">
                    Duration Days
                    <input
                      type="number"
                      id="duration_days"
                      min="1"
                      className="px-field mt-1"
                      defaultValue="30"
                    />
                  </label>
                  {" "}
                  <label className="text-xs">
                    Print Discount %
                    <input
                      type="number"
                      id="print_discount_percent"
                      min="0"
                      max="100"
                      step="0.01"
                      className="px-field mt-1"
                      defaultValue="0"
                    />
                  </label>
                </div>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-black/10 dark:border-white/10 px-3 py-2 bg-black/[0.02] dark:bg-white/[0.03]">
                    <div className="text-[11px] text-slate-500 dark:text-white/60">
                      Discount Amount
                    </div>
                    <div id="discount_amount_preview" className="text-sm font-semibold mt-1">
                      ₹0.00
                    </div>
                  </div>
                  <div className="rounded-xl border border-black/10 dark:border-white/10 px-3 py-2 bg-brand-500/10">
                    <div className="text-[11px] text-slate-500 dark:text-white/60">
                      Effective Price (Live)
                    </div>
                    <div id="effective_price_preview" className="text-sm font-semibold mt-1">
                      ₹0.00
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  <label className="px-check">
                    <input className="sr-only peer" type="checkbox" id="active_status" defaultChecked />
                    <span className="px-check-box peer-checked:bg-brand-500 peer-checked:border-brand-500 peer-checked:text-white">
                      <span className="material-symbols-rounded text-[0.72rem] opacity-0 peer-checked:opacity-100">
                        check
                      </span>
                    </span>
                    <span className="px-check-label">
                      Active
                    </span>
                  </label>
                  {" "}
                  <label className="px-check">
                    <input className="sr-only peer" type="checkbox" id="unlimited_topics" />
                    <span className="px-check-box peer-checked:bg-brand-500 peer-checked:border-brand-500 peer-checked:text-white">
                      <span className="material-symbols-rounded text-[0.72rem] opacity-0 peer-checked:opacity-100">
                        check
                      </span>
                    </span>
                    <span className="px-check-label">
                      Unlimited Topics
                    </span>
                  </label>
                  {" "}
                  <label className="px-check">
                    <input className="sr-only peer" type="checkbox" id="mcq_access" defaultChecked />
                    <span className="px-check-box peer-checked:bg-brand-500 peer-checked:border-brand-500 peer-checked:text-white">
                      <span className="material-symbols-rounded text-[0.72rem] opacity-0 peer-checked:opacity-100">
                        check
                      </span>
                    </span>
                    <span className="px-check-label">
                      MCQ
                    </span>
                  </label>
                  {" "}
                  <label className="px-check">
                    <input className="sr-only peer" type="checkbox" id="blink_access" defaultChecked />
                    <span className="px-check-box peer-checked:bg-brand-500 peer-checked:border-brand-500 peer-checked:text-white">
                      <span className="material-symbols-rounded text-[0.72rem] opacity-0 peer-checked:opacity-100">
                        check
                      </span>
                    </span>
                    <span className="px-check-label">
                      Blink
                    </span>
                  </label>
                  {" "}
                  <label className="px-check">
                    <input className="sr-only peer" type="checkbox" id="ai_chat_access" defaultChecked />
                    <span className="px-check-box peer-checked:bg-brand-500 peer-checked:border-brand-500 peer-checked:text-white">
                      <span className="material-symbols-rounded text-[0.72rem] opacity-0 peer-checked:opacity-100">
                        check
                      </span>
                    </span>
                    <span className="px-check-label">
                      AI Chat
                    </span>
                  </label>
                  {" "}
                  <label className="px-check">
                    <input className="sr-only peer" type="checkbox" id="pdf_download" defaultChecked />
                    <span className="px-check-box peer-checked:bg-brand-500 peer-checked:border-brand-500 peer-checked:text-white">
                      <span className="material-symbols-rounded text-[0.72rem] opacity-0 peer-checked:opacity-100">
                        check
                      </span>
                    </span>
                    <span className="px-check-label">
                      PDF Download
                    </span>
                  </label>
                  {" "}
                  <label className="px-check">
                    <input className="sr-only peer" type="checkbox" id="leaderboard_access" defaultChecked />
                    <span className="px-check-box peer-checked:bg-brand-500 peer-checked:border-brand-500 peer-checked:text-white">
                      <span className="material-symbols-rounded text-[0.72rem] opacity-0 peer-checked:opacity-100">
                        check
                      </span>
                    </span>
                    <span className="px-check-label">
                      Leaderboard
                    </span>
                  </label>
                  {" "}
                  <label className="px-check">
                    <input className="sr-only peer" type="checkbox" id="coupon_enabled" />
                    <span className="px-check-box peer-checked:bg-brand-500 peer-checked:border-brand-500 peer-checked:text-white">
                      <span className="material-symbols-rounded text-[0.72rem] opacity-0 peer-checked:opacity-100">
                        check
                      </span>
                    </span>
                    <span className="px-check-label">
                      Coupon Enabled
                    </span>
                  </label>
                  {" "}
                  <label className="px-check">
                    <input className="sr-only peer" type="checkbox" id="early_bird_tag" />
                    <span className="px-check-box peer-checked:bg-brand-500 peer-checked:border-brand-500 peer-checked:text-white">
                      <span className="material-symbols-rounded text-[0.72rem] opacity-0 peer-checked:opacity-100">
                        check
                      </span>
                    </span>
                    <span className="px-check-label">
                      Early Bird
                    </span>
                  </label>
                </div>
              </section>
              <section className="rounded-2xl border border-black/10 dark:border-white/10 p-3">
                <h3 className="text-xs uppercase tracking-wide text-slate-500 dark:text-white/60 mb-3">
                  {"Limits & Academic Scope"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="text-xs">
                    Max Topics / Day
                    <input
                      type="number"
                      id="max_topics_per_day"
                      min="0"
                      className="px-field mt-1"
                      placeholder="empty = unlimited"
                    />
                  </label>
                  {" "}
                  <label className="text-xs">
                    Max Subjects / Day
                    <input
                      type="number"
                      id="max_subjects_per_day"
                      min="0"
                      className="px-field mt-1"
                      placeholder="empty = unlimited"
                    />
                  </label>
                  {" "}
                  <label className="text-xs">
                    {"Applicable College "}
                    <span className="px-select-wrap">
                      <select id="applicable_college" className="px-field px-select">
                        <option value="">
                          All
                        </option>
                      </select>
                      <span className="material-symbols-rounded px-select-icon">
                        expand_more
                      </span>
                    </span>
                    {" "}
                  </label>
                  {" "}
                  <label className="text-xs">
                    {"Applicable Degree "}
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        id="allDegreeBtn"
                        className="text-[11px] px-2 py-1 rounded-lg border border-black/10 dark:border-white/20 bg-black/[0.03] dark:bg-white/[0.06]"
                      >
                        Select All
                      </button>
                    </div>
                    {" "}
                    <span className="px-select-wrap">
                      <select id="applicable_degree" className="px-field px-select" disabled>
                        <option value="">
                          All
                        </option>
                      </select>
                      <span className="material-symbols-rounded px-select-icon">
                        expand_more
                      </span>
                    </span>
                    {" "}
                  </label>
                  {" "}
                  <label className="text-xs">
                    {"Applicable Department "}
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        id="allDepartmentBtn"
                        className="text-[11px] px-2 py-1 rounded-lg border border-black/10 dark:border-white/20 bg-black/[0.03] dark:bg-white/[0.06]"
                      >
                        Select All
                      </button>
                    </div>
                    {" "}
                    <span className="px-select-wrap">
                      <select id="applicable_department" className="px-field px-select" disabled>
                        <option value="">
                          All
                        </option>
                      </select>
                      <span className="material-symbols-rounded px-select-icon">
                        expand_more
                      </span>
                    </span>
                    {" "}
                  </label>
                  {" "}
                  <label className="text-xs">
                    {"Applicable Batch "}
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        id="allBatchBtn"
                        className="text-[11px] px-2 py-1 rounded-lg border border-black/10 dark:border-white/20 bg-black/[0.03] dark:bg-white/[0.06]"
                      >
                        Select All
                      </button>
                    </div>
                    {" "}
                    <span className="px-select-wrap">
                      <select id="applicable_batch" className="px-field px-select" disabled>
                        <option value="">
                          All
                        </option>
                      </select>
                      <span className="material-symbols-rounded px-select-icon">
                        expand_more
                      </span>
                    </span>
                    {" "}
                  </label>
                  {" "}
                  <label className="text-xs">
                    Applicable Semester
                    <input
                      type="number"
                      id="applicable_semester"
                      min="1"
                      max="12"
                      className="px-field mt-1"
                      placeholder="All"
                    />
                  </label>
                  {" "}
                  <label className="text-xs">
                    {"Availability Expiry "}
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <label className="px-check">
                        <input className="sr-only peer" type="checkbox" id="availability_never" defaultChecked />
                        <span className="px-check-box peer-checked:bg-brand-500 peer-checked:border-brand-500 peer-checked:text-white">
                          <span className="material-symbols-rounded text-[0.72rem] opacity-0 peer-checked:opacity-100">
                            check
                          </span>
                        </span>
                        <span className="px-check-label">
                          Never
                        </span>
                      </label>
                    </div>
                    {" "}
                    <input
                      type="datetime-local"
                      id="availability_expires_at"
                      className="px-field mt-2"
                      disabled
                    />
                    {" "}
                  </label>
                </div>
              </section>
              <div className="flex gap-2">
                <button
                  className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white"
                  type="submit"
                >
                  Save Plan
                </button>
                {" "}
                <button
                  className="rounded-xl bg-white dark:bg-white/10 border border-black/10 dark:border-white/10 px-4 py-2 text-sm"
                  type="button"
                  id="resetBtn"
                >
                  Reset
                </button>
              </div>
            </form>
          </article>
        </section>
      </main>
      <script src="/_legacy/admin/control-panel/plans-manager/script-02.js" />
    </LegacyPage>
  );
}
