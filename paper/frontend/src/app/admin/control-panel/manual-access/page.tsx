// Converted from ui/admin/control-panel/manual-access.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/admin/control-panel/manual-access/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Admin Control Panel — Manual Access",
};

export default function AdminControlPanelManualAccessPage() {
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
      <script src="/_legacy/admin/control-panel/manual-access/script-01.js" />
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
            Manual Access Override
          </h1>
          <p className="text-sm text-slate-600 dark:text-white/70 mt-2">
            Apply emergency user-level access actions and corrections.
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
        <section className="grid lg:grid-cols-2 gap-6">
          <article className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 p-5">
            <h2 className="font-semibold mb-3">
              Search User
            </h2>
            <p id="status" className="hidden text-xs mb-3" />
            <form id="searchForm" className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <label className="text-xs md:col-span-2">
                Name / Email / Phone / RegNo
                <input
                  id="q"
                  className="mt-1 w-full rounded-xl bg-white dark:bg-brand-900/40 border border-black/10 dark:border-white/10 px-3 py-2 text-sm"
                />
              </label>
              {" "}
              <label className="text-xs">
                Department
                <select
                  id="department_id"
                  className="mt-1 w-full rounded-xl bg-white dark:bg-brand-900/40 border border-black/10 dark:border-white/10 px-3 py-2 text-sm"
                >
                  <option value="">
                    All
                  </option>
                </select>
              </label>
              {" "}
              <label className="text-xs">
                Batch
                <select
                  id="batch_id"
                  className="mt-1 w-full rounded-xl bg-white dark:bg-brand-900/40 border border-black/10 dark:border-white/10 px-3 py-2 text-sm"
                >
                  <option value="">
                    All
                  </option>
                </select>
              </label>
              {" "}
              <button
                className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white md:col-span-2"
                type="submit"
              >
                Search
              </button>
            </form>
            <div className="max-h-[62vh] overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-slate-500 dark:text-white/60 border-b border-black/10 dark:border-white/10">
                  <tr>
                    <th className="text-left py-2">
                      User
                    </th>
                    <th className="text-left">
                      Dept
                    </th>
                    <th className="text-right">
                      Select
                    </th>
                  </tr>
                </thead>
                <tbody id="usersTbody" />
              </table>
            </div>
          </article>
          <article
            className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 p-5"
            id="actionPanel"
          >
            <h2 className="font-semibold mb-2">
              Selected User Actions
            </h2>
            <p id="selectedUser" className="text-xs text-slate-500 dark:text-white/60 mb-4">
              No user selected.
            </p>
            <div className="space-y-3 text-sm">
              <div className="rounded-xl border border-black/10 dark:border-white/10 p-3">
                <div className="font-medium mb-2">
                  Plan Actions
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    id="plan_id"
                    className="rounded-lg bg-white dark:bg-brand-900/40 border border-black/10 dark:border-white/10 px-2 py-2 text-xs"
                  >
                    <option value="">
                      Select plan
                    </option>
                  </select>
                  {" "}
                  <input
                    type="number"
                    id="days"
                    min="1"
                    defaultValue="30"
                    className="rounded-lg bg-white dark:bg-brand-900/40 border border-black/10 dark:border-white/10 px-2 py-2 text-xs"
                    placeholder="Days"
                  />
                  {" "}
                  <button
                    id="grantPremiumBtn"
                    className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"
                  >
                    Grant Premium
                  </button>
                  {" "}
                  <button
                    id="changePlanBtn"
                    className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white"
                  >
                    Change Plan
                  </button>
                  {" "}
                  <button
                    id="extendBtn"
                    className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white col-span-2"
                  >
                    Extend Subscription
                  </button>
                </div>
              </div>
              <div className="rounded-xl border border-black/10 dark:border-white/10 p-3">
                <div className="font-medium mb-2">
                  Operational Actions
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="resetUsageBtn"
                    className="rounded-lg bg-white dark:bg-white/10 border border-black/10 dark:border-white/10 px-3 py-2 text-xs"
                  >
                    Reset Daily Usage
                  </button>
                  {" "}
                  <button
                    id="blockBtn"
                    className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white"
                  >
                    Block / Unblock
                  </button>
                  {" "}
                  <button
                    id="refundBtn"
                    className="rounded-lg bg-white dark:bg-white/10 border border-black/10 dark:border-white/10 px-3 py-2 text-xs"
                  >
                    Toggle Refund Mark
                  </button>
                  {" "}
                  <button
                    id="ambassadorBtn"
                    className="rounded-lg bg-white dark:bg-white/10 border border-black/10 dark:border-white/10 px-3 py-2 text-xs"
                  >
                    Toggle Ambassador
                  </button>
                </div>
              </div>
              <div className="rounded-xl border border-black/10 dark:border-white/10 p-3">
                <div className="font-medium mb-2">
                  Department Override
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    id="new_department_id"
                    className="rounded-lg bg-white dark:bg-brand-900/40 border border-black/10 dark:border-white/10 px-2 py-2 text-xs"
                  >
                    <option value="">
                      Select department
                    </option>
                  </select>
                  {" "}
                  <button
                    id="changeDeptBtn"
                    className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white"
                  >
                    Change Department
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-black/10 dark:border-white/10 p-3 text-xs">
              <div className="font-medium mb-2">
                Effective Access Snapshot
              </div>
              <pre id="snapshot" className="whitespace-pre-wrap text-slate-700 dark:text-white/75">
                {"{}"}
              </pre>
            </div>
          </article>
        </section>
      </main>
      <script src="/_legacy/admin/control-panel/manual-access/script-02.js" />
    </LegacyPage>
  );
}
