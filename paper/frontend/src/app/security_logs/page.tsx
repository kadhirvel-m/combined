// Converted from ui/security_logs.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/security_logs/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Security Logs - Paper X Admin",
  description: "Admin security telemetry explorer for auth, alerts, uploads, RAG, and model tool calls.",
};

export default function SecurityLogsPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      head={
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        </>
      }
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <link
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,500,0,0&display=swap"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="assets/css/tailwind.css" />
      <script src="/config.js" />
      <link rel="stylesheet" href="/_legacy/security_logs/style-01.css" />
      {/* ── original <body> ── */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-5 md:py-7">
        <section className="glass rounded-2xl md:rounded-3xl p-4 md:p-6 mb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="pill">
                <span className="material-symbols-rounded text-[15px]">
                  security
                </span>
                Security Telemetry
              </span>
              {" "}
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-2">
                Security Logs Console
              </h1>
              <p className="text-sm md:text-[15px] opacity-85 mt-1">
                {"Auth, uploads, RAG, tool-chain, outbound API, admin actions, and alert events from "}
                <code className="mono">
                  security_events
                </code>
                .
              </p>
            </div>
            <div className="text-xs md:text-sm opacity-80" id="status">
              Ready
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-3 mt-5">
            <label className="text-xs font-semibold tracking-wide opacity-80 xl:col-span-2">
              {"Search "}
              <input id="search" className="field mt-1 text-sm" placeholder="event, email, user id, path, ip" />
              {" "}
            </label>
            {" "}
            <label className="text-xs font-semibold tracking-wide opacity-80">
              {"Severity "}
              <select id="severity" className="field mt-1 text-sm">
                <option value="">
                  All
                </option>
                <option value="info">
                  info
                </option>
                <option value="warning">
                  warning
                </option>
                <option value="error">
                  error
                </option>
              </select>
              {" "}
            </label>
            {" "}
            <label className="text-xs font-semibold tracking-wide opacity-80 xl:col-span-2">
              {"Event Type "}
              <input id="eventType" className="field mt-1 text-sm" placeholder="e.g. alert.status_pattern" />
              {" "}
            </label>
            {" "}
            <label className="text-xs font-semibold tracking-wide opacity-80 flex items-end pb-2">
              {" "}
              <span className="inline-flex items-center gap-2">
                {" "}
                <input id="onlyAlerts" type="checkbox" className="accent-fuchsia-600" />
                {" "}
                <span>
                  Only alerts
                </span>
                {" "}
              </span>
              {" "}
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <button id="applyBtn" className="btn btn-primary">
              Apply Filters
            </button>
            {" "}
            <button id="refreshBtn" className="btn btn-ghost">
              Refresh
            </button>
          </div>
        </section>
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4" id="kpiWrap">
          <article className="kpi">
            <p className="text-[11px] uppercase tracking-wider opacity-70">
              Visible Events
            </p>
            <p className="text-xl font-extrabold mt-1" id="kpiVisible">
              0
            </p>
          </article>
          <article className="kpi">
            <p className="text-[11px] uppercase tracking-wider opacity-70">
              Total Events
            </p>
            <p className="text-xl font-extrabold mt-1" id="kpiTotal">
              -
            </p>
          </article>
          <article className="kpi">
            <p className="text-[11px] uppercase tracking-wider opacity-70">
              Warnings
            </p>
            <p className="text-xl font-extrabold mt-1" id="kpiWarn">
              0
            </p>
          </article>
          <article className="kpi">
            <p className="text-[11px] uppercase tracking-wider opacity-70">
              Errors
            </p>
            <p className="text-xl font-extrabold mt-1" id="kpiErr">
              0
            </p>
          </article>
        </section>
        <section className="glass rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
            <h2 className="font-bold">
              Event Stream
            </h2>
            <div className="flex items-center gap-2 text-sm">
              <button id="prevBtn" className="btn btn-ghost !py-1.5 !px-3 disabled:opacity-45">
                Prev
              </button>
              {" "}
              <span id="pageInfo" className="text-xs md:text-sm font-semibold opacity-80">
                Page 1
              </span>
              {" "}
              <button id="nextBtn" className="btn btn-ghost !py-1.5 !px-3 disabled:opacity-45">
                Next
              </button>
            </div>
          </div>
          <div className="desktop-table overflow-auto">
            <table className="w-full text-sm">
              <thead className="table-head">
                <tr>
                  <th className="text-left px-3 py-2">
                    Time
                  </th>
                  <th className="text-left px-3 py-2">
                    Event
                  </th>
                  <th className="text-left px-3 py-2">
                    Severity
                  </th>
                  <th className="text-left px-3 py-2">
                    Path
                  </th>
                  <th className="text-left px-3 py-2">
                    User
                  </th>
                  <th className="text-left px-3 py-2">
                    IP
                  </th>
                  <th className="text-left px-3 py-2">
                    Payload
                  </th>
                </tr>
              </thead>
              <tbody id="rows" />
            </table>
          </div>
          <div className="mobile-cards p-3" id="mobileRows" />
        </section>
      </main>
      <script src="/_legacy/security_logs/script-01.js" />
    </LegacyPage>
  );
}
