// Converted from ui/teachers/hod_signup.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/teachers/hod_signup/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "HOD Signup — Paper X",
};

export default function TeachersHodSignupPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen font-sans antialiased text-neutral-900 dark:text-white bg-hero-light dark:bg-hero-dark overflow-x-hidden"}}
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
      <script src="/config.js" />
      <script src="/_legacy/teachers/hod_signup/script-01.js" />
      <link rel="stylesheet" href="/_legacy/teachers/hod_signup/style-01.css" />
      <script src="/_legacy/teachers/hod_signup/script-02.js" />
      {/* ── original <body> ── */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full bg-brand-500/15 blur-[110px] dark:bg-brand-500/30" />
        <div className="absolute top-[40%] -right-24 w-[380px] h-[380px] rounded-full bg-brand-700/15 blur-[120px] dark:bg-brand-700/35" />
      </div>
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-brand-900/60 backdrop-blur border-b border-black/5 dark:border-white/10">
        <div className="container flex items-center justify-between py-4">
          <a href="../index.html" className="flex items-center gap-3">
            {" "}
            <img src="../assets/img/logo-light.svg" className="h-9 w-auto dark:hidden" alt="Paper X" />
            {" "}
            <img src="../assets/img/logo-dark.svg" className="h-9 w-auto hidden dark:block" alt="Paper X" />
            {" "}
          </a>
          {" "}
          <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-700 dark:text-white/85">
            <a href="../index.html" className="hover:text-brandlt-900 dark:hover:text-white">
              Home
            </a>
            {" "}
            <a href="../about.html" className="hover:text-brandlt-900 dark:hover:text-white">
              About
            </a>
            {" "}
            <a href="../contact.html" className="hover:text-brandlt-900 dark:hover:text-white">
              Contact
            </a>
            {" "}
            <a href="teacher_login.html" className="hover:text-brandlt-900 dark:hover:text-white">
              Teacher Login
            </a>
            {" "}
            <a href="teacher_signup.html" className="hover:text-brandlt-900 dark:hover:text-white">
              Teacher Signup
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
              <span className="hidden sm:block">
                Theme
              </span>
            </button>
          </div>
        </div>
      </header>
      <main>
        <section className="relative overflow-hidden pt-8 pb-16">
          <div className="pointer-events-none absolute inset-0 opacity-[0.35] bg-[radial-gradient(circle_at_20%_10%,rgba(158,75,138,0.25),transparent_60%),radial-gradient(circle_at_80%_85%,rgba(76,42,89,0.28),transparent_60%)]" />
          <div className="container relative z-10 grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] items-start">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#1E1E2F] via-[#4C2A59] to-[#9E4B8A] shadow-[0_8px_20px_rgba(158,75,138,0.25)]">
                  Apply as HOD
                </span>
                {" "}
                <a
                  href="teacher_signup.html"
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold bg-white/70 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 hover:bg-white dark:hover:bg-white/20"
                >
                  Apply as Teacher instead
                </a>
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight gradient-hero-text">
                  Head of Department Application
                </h1>
                <p className="text-sm text-neutral-600 dark:text-white/65 max-w-xl">
                  {"Submit your HOD request with ID verification. Admin will review and assign the "}
                  <span className="font-semibold">
                    HOD
                  </span>
                  {" role after approval."}
                </p>
              </div>
              <ul className="space-y-3 text-sm text-neutral-600 dark:text-white/65">
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex size-6 items-center justify-center rounded-full bg-brand-500/15 text-brand-500">
                    <span className="material-symbols-rounded text-base">
                      verified_user
                    </span>
                  </span>
                  {" Admin approval ensures trusted HOD access."}
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex size-6 items-center justify-center rounded-full bg-brand-700/25 text-brand-700 dark:bg-brand-700/30 dark:text-brand-400">
                    <span className="material-symbols-rounded text-base">
                      badge
                    </span>
                  </span>
                  {" Role is assigned only after review."}
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="glass-card rounded-3xl p-5 sm:p-6 shadow-soft dark:shadow-glow ring-1 ring-black/5 dark:ring-white/10">
                <form id="hodSignupForm" className="space-y-8" encType="multipart/form-data">
                  <section className="rounded-2xl p-6 bg-white/70 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-white/60 mb-4">
                      Account
                    </h2>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-semibold tracking-wide uppercase mb-1">
                          Full Name
                        </label>
                        {" "}
                        <input
                          type="text"
                          name="name"
                          required
                          className="w-full rounded-lg border-neutral-300 dark:border-white/15 bg-white/70 dark:bg-brand-900/40 focus:ring-brand-500 focus:border-brand-500"
                        />
                      </div>
                      <div className="grid md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-xs font-semibold tracking-wide uppercase mb-1">
                            Email
                          </label>
                          {" "}
                          <input
                            type="email"
                            name="email"
                            required
                            className="w-full rounded-lg border-neutral-300 dark:border-white/15 bg-white/70 dark:bg-brand-900/40 focus:ring-brand-500 focus:border-brand-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold tracking-wide uppercase mb-1">
                            Password
                          </label>
                          {" "}
                          <input
                            type="password"
                            name="password"
                            required
                            minLength={6}
                            className="w-full rounded-lg border-neutral-300 dark:border-white/15 bg-white/70 dark:bg-brand-900/40 focus:ring-brand-500 focus:border-brand-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold tracking-wide uppercase mb-1">
                            Confirm Password
                          </label>
                          {" "}
                          <input
                            type="password"
                            name="confirm_password"
                            required
                            minLength={6}
                            className="w-full rounded-lg border-neutral-300 dark:border-white/15 bg-white/70 dark:bg-brand-900/40 focus:ring-brand-500 focus:border-brand-500"
                          />
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-semibold tracking-wide uppercase mb-2">
                            ID Card Front (Image)
                          </label>
                          {" "}
                          <label
                            htmlFor="id_card_front"
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer border-neutral-300 dark:border-white/20 bg-white/50 dark:bg-white/5 hover:border-brand-500 dark:hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all overflow-hidden"
                          >
                            {" "}
                            <div
                              id="uploadPromptFront"
                              className="flex flex-col items-center justify-center pt-3 pb-3"
                            >
                              <span className="material-symbols-rounded text-3xl text-brand-500 dark:text-brand-400 mb-1">
                                upload_file
                              </span>
                              {" "}
                              <p className="text-xs text-neutral-600 dark:text-white/70 font-medium">
                                Click to upload
                              </p>
                              <p className="text-[10px] text-neutral-500 dark:text-white/50">
                                PNG, JPG (MAX. 5MB)
                              </p>
                            </div>
                            {" "}
                            <img
                              id="previewFront"
                              alt="Front Preview"
                              className="hidden w-full h-full object-cover"
                            />
                            {" "}
                            <input
                              id="id_card_front"
                              type="file"
                              name="id_card_front"
                              accept="image/*"
                              required
                              className="hidden"
                            />
                            {" "}
                          </label>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold tracking-wide uppercase mb-2">
                            ID Card Back (Image)
                          </label>
                          {" "}
                          <label
                            htmlFor="id_card_back"
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer border-neutral-300 dark:border-white/20 bg-white/50 dark:bg-white/5 hover:border-brand-500 dark:hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all overflow-hidden"
                          >
                            {" "}
                            <div
                              id="uploadPromptBack"
                              className="flex flex-col items-center justify-center pt-3 pb-3"
                            >
                              <span className="material-symbols-rounded text-3xl text-brand-500 dark:text-brand-400 mb-1">
                                upload_file
                              </span>
                              {" "}
                              <p className="text-xs text-neutral-600 dark:text-white/70 font-medium">
                                Click to upload
                              </p>
                              <p className="text-[10px] text-neutral-500 dark:text-white/50">
                                PNG, JPG (MAX. 5MB)
                              </p>
                            </div>
                            {" "}
                            <img
                              id="previewBack"
                              alt="Back Preview"
                              className="hidden w-full h-full object-cover"
                            />
                            {" "}
                            <input
                              id="id_card_back"
                              type="file"
                              name="id_card_back"
                              accept="image/*"
                              required
                              className="hidden"
                            />
                            {" "}
                          </label>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-xs font-semibold tracking-wide uppercase mb-1">
                            College
                          </label>
                          {" "}
                          <select
                            id="collegeSelect"
                            name="college"
                            className="w-full rounded-lg border-neutral-300 dark:border-white/15 bg-white/70 dark:bg-brand-900/40 focus:ring-brand-500 focus:border-brand-500"
                          >
                            <option value="">
                              -- Select College --
                            </option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold tracking-wide uppercase mb-1">
                            Degree
                          </label>
                          {" "}
                          <select
                            id="degreeSelect"
                            name="degree"
                            className="w-full rounded-lg border-neutral-300 dark:border-white/15 bg-white/70 dark:bg-brand-900/40 focus:ring-brand-500 focus:border-brand-500"
                          >
                            <option value="">
                              -- Select Degree --
                            </option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold tracking-wide uppercase mb-1">
                            Department
                          </label>
                          {" "}
                          <select
                            id="departmentSelect"
                            name="department"
                            className="w-full rounded-lg border-neutral-300 dark:border-white/15 bg-white/70 dark:bg-brand-900/40 focus:ring-brand-500 focus:border-brand-500"
                          >
                            <option value="">
                              -- Select Department --
                            </option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold tracking-wide uppercase mb-1">
                          Why do you want to be HOD? (optional)
                        </label>
                        {" "}
                        <textarea
                          name="motivation"
                          rows={4}
                          className="w-full rounded-lg border-neutral-300 dark:border-white/15 bg-white/70 dark:bg-brand-900/40 focus:ring-brand-500 focus:border-brand-500"
                          placeholder="Briefly explain your motivation / responsibilities"
                        />
                      </div>
                      <div className="text-center text-xs text-neutral-500 dark:text-white/60">
                        After submitting, you’ll be redirected to Teacher Login. Admin will review your HOD request.
                      </div>
                    </div>
                  </section>
                  <div className="flex justify-end">
                    <button
                      id="submitBtn"
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#1E1E2F] via-[#4C2A59] to-[#9E4B8A] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(158,75,138,0.28)] hover:shadow-[0_16px_36px_rgba(158,75,138,0.35)] transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <span id="submitText">
                        Submit HOD Application
                      </span>
                      {" "}
                      <svg
                        id="submitSpinner"
                        className="hidden animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        {" "}
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    </button>
                  </div>
                </form>
                <div id="appStatus" className="mt-6 hidden text-sm rounded-xl px-4 py-3 font-medium" />
              </div>
            </div>
          </div>
        </section>
      </main>
      <script src="/_legacy/teachers/hod_signup/script-03.js" />
    </LegacyPage>
  );
}
