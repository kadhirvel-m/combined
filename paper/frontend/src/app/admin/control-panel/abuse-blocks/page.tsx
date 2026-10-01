// Converted from ui/admin/control-panel/abuse-blocks.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/admin/control-panel/abuse-blocks/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Admin Control Panel - Abuse Blocks",
};

export default function AdminControlPanelAbuseBlocksPage() {
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
      <script src="/_legacy/admin/control-panel/abuse-blocks/script-01.js" />
      {/* ── original <body> ── */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-brand-900/60 backdrop-blur border-b border-black/5 dark:border-white/10">
        <div className="container mx-auto px-4 flex items-center justify-between py-3.5">
          <a href="../../index.html" className="flex items-center gap-3" aria-label="Paper X Home">
            {" "}
            <img src="../../assets/img/logo-light.svg" className="h-9 w-auto dark:hidden" alt="Paper X" />
            {" "}
            <img src="../../assets/img/logo-dark.svg" className="h-9 w-auto hidden dark:block" alt="Paper X" />
            {" "}
          </a>
          {" "}
          <div className="hidden md:flex items-center gap-2">
            <button
              data-theme-toggle=""
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm ring-1 ring-black/10 dark:ring-white/15"
            >
              <span className="material-symbols-rounded">
                dark_mode
              </span>
              {" "}
              <span>
                Theme
              </span>
            </button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 space-y-6">
        <section className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 p-6">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Blocked People / IPs
          </h1>
          <p className="text-sm text-slate-600 dark:text-white/70 mt-2">
            Review abuse-score blocks, see reason, then allow or unblock trusted employees.
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
        <section className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 p-5">
          <p id="status" className="hidden text-xs mb-3" />
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            <label className="text-xs md:col-span-1">
              {"Lookback (hours) "}
              <input
                id="hours"
                type="number"
                min="1"
                max="168"
                defaultValue="24"
                className="mt-1 w-full rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-brand-900/40 px-3 py-2 text-sm"
              />
              {" "}
            </label>
            {" "}
            <label className="text-xs md:col-span-2 flex items-center gap-2 pt-5 md:pt-0">
              {" "}
              <input id="includeAllowlisted" type="checkbox" className="size-4" />
              {" "}
              <span>
                Include allowlisted
              </span>
              {" "}
            </label>
            {" "}
            <button
              id="reloadBtn"
              className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white"
            >
              Reload
            </button>
          </div>
          <div className="mt-4 overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-slate-500 dark:text-white/60 border-b border-black/10 dark:border-white/10">
                <tr>
                  <th className="text-left py-2">
                    IP
                  </th>
                  <th className="text-left">
                    Accounts
                  </th>
                  <th className="text-left">
                    Status
                  </th>
                  <th className="text-left">
                    Score
                  </th>
                  <th className="text-left">
                    Reason
                  </th>
                  <th className="text-left">
                    Last Seen
                  </th>
                  <th className="text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody id="rows" />
            </table>
          </div>
        </section>
      </main>
      <script src="/_legacy/admin/control-panel/abuse-blocks/script-02.js" />
    </LegacyPage>
  );
}
