// Converted from ui/hod/hod_change_password.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/hod/hod_change_password/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Paper X — HOD Change Password",
};

export default function HodHodChangePasswordPage() {
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
        href={"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,600,0,0"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="../assets/css/tailwind.css" />
      <script src="/_legacy/hod/hod_change_password/script-01.js" />
      <script src="/config.js" />
      <script src="/auth.js" defer />
      <script src="./hod.js" defer />
      <link rel="stylesheet" href="/_legacy/hod/hod_change_password/style-01.css" />
      {/* ── original <body> ── */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/70 dark:bg-brand-900/70 border-b border-black/5 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <a href="./hod_dashboard.html" className="flex items-center gap-2 font-bold tracking-tight text-lg">
            {" "}
            <img src="../assets/img/logo-light.svg" className="h-8 w-auto dark:hidden" alt="Paper X" />
            {" "}
            <img src="../assets/img/logo-dark.svg" className="h-8 w-auto hidden dark:block" alt="Paper X" />
            {" "}
            <span className="hidden sm:inline text-neutral-600 dark:text-white/70 font-semibold">
              HOD Portal
            </span>
            {" "}
          </a>
          {" "}
          <div className="flex items-center gap-2">
            <a
              href="./hod_dashboard.html"
              className="hidden sm:inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium bg-white/70 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 hover:bg-white dark:hover:bg-white/20 transition"
            >
              {" "}
              <span className="material-symbols-rounded text-[18px]">
                arrow_back
              </span>
              {"Back to Dashboard "}
            </a>
            {" "}
            <button
              data-theme-toggle=""
              className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/70 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 hover:bg-white dark:hover:bg-white/20 transition material-symbols-rounded"
              title="Toggle theme"
            >
              dark_mode
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        <section className="flex flex-col lg:flex-row lg:items-end gap-6">
          <div className="flex-1 space-y-2">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Change Password
            </h1>
            <p className="text-sm md:text-base text-neutral-600 dark:text-white/60 max-w-2xl">
              Update your HOD account password securely.
            </p>
          </div>
          <div id="hodNav" className="flex flex-wrap gap-2" />
        </section>
        <section className="max-w-2xl glass rounded-3xl p-6 ring-1 ring-black/10 dark:ring-white/10">
          <form id="changePasswordForm" className="space-y-5">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-semibold mb-2">
                Current Password
              </label>
              {" "}
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                required
                className="w-full rounded-2xl bg-white/80 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 px-4 py-3 text-sm focus:outline-none focus:ring-brand-500"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="block text-sm font-semibold mb-2">
                New Password
              </label>
              {" "}
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                className="w-full rounded-2xl bg-white/80 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 px-4 py-3 text-sm focus:outline-none focus:ring-brand-500"
                placeholder="Enter new password"
              />
              {" "}
              <p className="mt-2 text-xs text-neutral-500 dark:text-white/50">
                Use at least 8 characters.
              </p>
            </div>
            <div>
              <label htmlFor="confirmNewPassword" className="block text-sm font-semibold mb-2">
                Confirm New Password
              </label>
              {" "}
              <input
                id="confirmNewPassword"
                name="confirmNewPassword"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                className="w-full rounded-2xl bg-white/80 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 px-4 py-3 text-sm focus:outline-none focus:ring-brand-500"
                placeholder="Re-enter new password"
              />
            </div>
            <div id="formMsg" className="hidden rounded-xl px-3 py-2 text-sm" />
            {" "}
            <button
              id="submitBtn"
              type="submit"
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-rounded text-[18px]">
                save
              </span>
              {" "}
              <span id="submitLabel">
                Update Password
              </span>
            </button>
          </form>
        </section>
      </main>
      <script src="/_legacy/hod/hod_change_password/script-02.js" />
    </LegacyPage>
  );
}
