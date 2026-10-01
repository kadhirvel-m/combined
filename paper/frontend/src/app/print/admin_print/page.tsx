// Converted from ui/print/admin_print.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/print/admin_print/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Admin • Print Shops — Paper X",
};

export default function PrintAdminPrintPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen font-sans antialiased text-neutral-900 dark:text-white"}}
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
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,600,0,0"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="../assets/css/tailwind.css" />
      <link rel="stylesheet" href="/_legacy/print/admin_print/style-01.css" />
      <script src="/_legacy/print/admin_print/script-01.js" />
      {/* ── original <body> ── */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-brand-900/60 backdrop-blur border-b border-black/5 dark:border-white/10">
        <div className="container flex items-center justify-between py-3">
          <a href="index.html" className="flex items-center gap-3" aria-label="Paper X Admin Home">
            {" "}
            <img src="../assets/img/logo-light.svg" alt="Paper X" className="h-8 w-auto dark:hidden" />
            {" "}
            <img src="../assets/img/logo-dark.svg" alt="Paper X" className="h-8 w-auto hidden dark:block" />
            {" "}
          </a>
          {" "}
          <nav className="hidden md:flex items-center gap-2 text-sm">
            <span className="rounded-full px-3 py-2 bg-brand-500/10 text-brand-700 dark:text-brand-200 ring-1 ring-brand-500/30">
              <span className="material-symbols-rounded text-base">
                admin_panel_settings
              </span>
              {" Admin"}
            </span>
            {" "}
            <a
              href="../print/dashboard.html"
              className="rounded-full px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10"
            >
              <span className="material-symbols-rounded text-base">
                dashboard
              </span>
              {" Shop Dashboard"}
            </a>
          </nav>
          <div className="md:hidden flex items-center gap-2">
            <span
              className="inline-flex items-center justify-center size-10 rounded-full ring-soft bg-brand-500/10 text-brand-600 dark:text-brand-200"
              title="Admin"
            >
              <span className="material-symbols-rounded">
                admin_panel_settings
              </span>
            </span>
            {" "}
            <a
              href="../print/dashboard.html"
              className="inline-flex items-center justify-center size-10 rounded-full ring-soft hover:bg-black/5 dark:hover:bg-white/5"
              title="Shop Dashboard"
            >
              <span className="material-symbols-rounded">
                dashboard
              </span>
            </a>
          </div>
        </div>
      </header>
      <main className="container py-6 space-y-6">
        <section className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-[12px] opacity-75">
            Admins can view all print shops.
          </div>
          <div id="err" className="hidden text-[12px] text-rose-600">
            Access denied. Admins only.
          </div>
        </section>
        {/* Controls */}
        <section className="glass rounded-2xl ring-1 ring-black/5 dark:ring-white/10 p-4 md:p-5">
          <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
              <label className="block text-xs font-semibold opacity-70">
                {"Search "}
                <input
                  id="q"
                  placeholder="Name, email, phone, address"
                  className="mt-1 w-full rounded-xl px-3 py-2 ring-1 ring-black/10 dark:ring-white/15 bg-white/80 dark:bg-white/10"
                />
                {" "}
              </label>
              {" "}
              <label className="block text-xs font-semibold opacity-70">
                {"Status "}
                <select
                  id="fltOpen"
                  className="mt-1 w-full rounded-xl px-3 py-2 ring-1 ring-black/10 dark:ring-white/15 bg-white/80 dark:bg-white/10"
                >
                  <option value="all">
                    All
                  </option>
                  <option value="open">
                    Open
                  </option>
                  <option value="closed">
                    Closed
                  </option>
                  <option value="paused">
                    Paused
                  </option>
                </select>
                {" "}
              </label>
            </div>
            <div className="flex items-center gap-2">
              <button
                id="btnReload"
                className="rounded-xl px-3 py-2 ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/10 text-sm"
              >
                <span className="material-symbols-rounded text-base">
                  refresh
                </span>
                {" Reload"}
              </button>
            </div>
          </div>
        </section>
        {/* Row list */}
        <section className="rounded-2xl glass ring-1 ring-black/5 dark:ring-white/10">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-[12px] uppercase tracking-wide opacity-70">
                <tr>
                  <th className="px-3 py-2">
                    Shop
                  </th>
                  <th className="px-3 py-2">
                    Contact
                  </th>
                  <th className="px-3 py-2">
                    Status
                  </th>
                  <th className="px-3 py-2">
                    Rating
                  </th>
                  <th className="px-3 py-2">
                    Updated
                  </th>
                </tr>
              </thead>
              <tbody id="tbody" className="divide-y divide-black/5 dark:divide-white/10" />
            </table>
          </div>
        </section>
      </main>
      <footer className="border-t border-black/5 dark:border-white/10">
        <div className="container py-8 text-[13px] flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="opacity-80">
            {"© "}
            <span id="y" />
            {" Paper X • Admin"}
          </div>
          <div className="flex items-center gap-3">
            <a href="../print/dashboard.html" className="hover:underline">
              Shop Dashboard
            </a>
          </div>
        </div>
      </footer>
      <script src="/config.js" />
      <script src="/_legacy/print/admin_print/script-02.js" />
    </LegacyPage>
  );
}
