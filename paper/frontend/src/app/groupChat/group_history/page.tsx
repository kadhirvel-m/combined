// Converted from ui/groupChat/group_history.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/groupChat/group_history/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Call History — PaperX",
};

export default function GroupChatGroupHistoryPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"bg-gradient-to-br from-slate-50 to-blue-50 dark:from-[#0a0d12] dark:to-[#0f1419] text-[#0d1117] dark:text-zinc-100 min-h-screen"}}
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <link rel="stylesheet" href="../assets/css/tailwind.css" />
      <script src="/config.js" />
      <link
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"}
        rel="stylesheet"
      />
      <link
        href={"https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@300;400;600&display=swap"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="/_legacy/groupChat/group_history/style-01.css" />
      {/* ── original <body> ── */}
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-0 border-b rounded-none mb-8">
        <nav className="container mx-auto px-4 flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <a
              href="../../index.html"
              className="flex items-center gap-2 font-semibold hover:opacity-80 transition"
            >
              {" "}
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-lg">
                {" "}
                <span className="icon text-lg">
                  groups
                </span>
                {" "}
              </span>
              {" "}
              <span className="hidden sm:inline">
                PaperX Call History
              </span>
              {" "}
            </a>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="create_meet.html"
              className="btn-primary px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
            >
              {" "}
              <span className="icon text-lg">
                add_call
              </span>
              {" New Call "}
            </a>
            {" "}
            <button
              data-px-onclick="Theme.toggle()"
              className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition"
              data-px=""
            >
              <span className="icon">
                dark_mode
              </span>
            </button>
          </div>
        </nav>
      </header>
      <main className="container mx-auto px-4 max-w-5xl pb-12">
        {/* Active Calls Section */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="icon text-green-500">
              sensors
            </span>
            {" Active Calls "}
          </h2>
          <p className="text-black/60 dark:text-white/60 mb-6">
            Calls you created that are currently running.
          </p>
          <div id="activeCallsList" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Loading State */}
            <div className="col-span-full py-8 text-center opacity-50">
              {" Loading active calls... "}
            </div>
          </div>
        </section>
        <hr className="border-black/10 dark:border-white/10 mb-10" />
        {/* History Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="icon text-brand-500">
              history
            </span>
            {" Recent History "}
          </h2>
          <p className="text-black/60 dark:text-white/60 mb-6">
            Past calls you hosted or attended.
          </p>
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                    <th className="p-4 font-semibold text-sm">
                      Room Name
                    </th>
                    <th className="p-4 font-semibold text-sm">
                      Date
                    </th>
                    <th className="p-4 font-semibold text-sm">
                      Host
                    </th>
                    <th className="p-4 font-semibold text-sm">
                      Status
                    </th>
                    <th className="p-4 font-semibold text-sm text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody id="historyTableBody">
                  <tr>
                    <td colSpan={5} className="p-8 text-center opacity-50">
                      Loading history...
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
      {/* Toasts */}
      <div id="toast" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 hidden">
        <div className="glass-card px-6 py-3 flex items-center gap-3 shadow-xl">
          <span id="toastIcon" className="icon text-brand-500">
            check_circle
          </span>
          {" "}
          <span id="toastText" />
        </div>
      </div>
      <script src="/_legacy/groupChat/group_history/script-01.js" />
      {/* Marker overlay (browser-only) */}
      <script src="../assets/js/marker_overlay.js" />
    </LegacyPage>
  );
}
