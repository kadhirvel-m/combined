// Converted from ui/teacher_profile_edit.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/teacher_profile_edit/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Edit Teacher Profile — Paper X",
};

export default function TeacherProfileEditPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen font-sans antialiased bg-white dark:bg-[#12121a] text-neutral-900 dark:text-white"}}
      head={
        <>
          <link rel="icon" type="image/x-icon" href="assets/img/favicon.svg" />
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
      <link rel="stylesheet" href="assets/css/tailwind.css" />
      <script src="/_legacy/teacher_profile_edit/script-01.js" />
      <script src="/config.js" />
      <link rel="stylesheet" href="/_legacy/teacher_profile_edit/style-01.css" />
      {/* ── original <body> ── */}
      {/* Background gradients */}
      <div aria-hidden="true" className="fixed inset-0 -z-10">
        <div className="absolute -top-32 -left-24 w-[420px] h-[420px] rounded-full bg-brand-500/10 blur-[110px] dark:bg-brand-500/20" />
        <div className="absolute top-[40%] -right-24 w-[380px] h-[380px] rounded-full bg-brand-700/10 blur-[120px] dark:bg-brand-700/25" />
      </div>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-[#1E1E2F]/50 border-b border-black/5 dark:border-white/5">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <a href="./teacher_profile.html?user=me" className="flex items-center gap-2">
              {" "}
              <img src="assets/img/logo-light.svg" className="h-9 dark:hidden" alt="Paper X" />
              {" "}
              <img src="assets/img/logo-dark.svg" className="h-9 hidden dark:block" alt="Paper X" />
              {" "}
            </a>
            {" "}
            <div className="flex items-center gap-3">
              <a
                href="./teacher_profile.html?user=me"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200/60 dark:border-white/10 px-4 py-2 text-sm hover:border-brand-400/60 transition"
              >
                {" "}
                <span className="material-symbols-rounded text-base">
                  arrow_back
                </span>
                {" "}
                <span className="hidden sm:inline">
                  Back to Profile
                </span>
                {" "}
              </a>
              {" "}
              <button
                type="button"
                id="saveBtn"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#9E4B8A] via-[#B06AB3] to-[#FF7FD1] px-5 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(158,75,138,0.25)] hover:shadow-[0_12px_28px_rgba(158,75,138,0.32)] transition"
              >
                <span className="material-symbols-rounded text-base">
                  save
                </span>
                {" "}
                <span>
                  Save
                </span>
              </button>
              {" "}
              <button
                data-theme-toggle=""
                className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200/60 dark:border-white/10 hover:border-brand-400/60 transition"
              >
                <span className="material-symbols-rounded text-base">
                  dark_mode
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-8">
          <span className="gradient-text">
            Edit Teacher Profile
          </span>
        </h1>
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left: Photo & Quick Info */}
          <div className="lg:col-span-4">
            <div className="glass-card rounded-2xl p-6 space-y-6">
              {/* Avatar Section */}
              <div className="text-center">
                <div className="relative inline-block">
                  <div
                    id="avatarPreview"
                    className="w-32 h-32 mx-auto rounded-lg overflow-hidden ring-4 ring-brand-500/20 bg-gradient-to-br from-brand-400 via-brand-500 to-pink-500 flex items-center justify-center"
                  >
                    <span id="avatarInitials" className="text-3xl font-bold text-white">
                      T
                    </span>
                    {" "}
                    <img
                      id="avatarImg"
                      className="hidden absolute inset-0 w-full h-full object-cover rounded-lg"
                      alt="Avatar"
                    />
                  </div>
                  {" "}
                  <button
                    type="button"
                    id="changeAvatarBtn"
                    className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-gradient-to-r from-[#9E4B8A] to-[#FF7FD1] text-white shadow-lg flex items-center justify-center hover:scale-110 transition"
                  >
                    <span className="material-symbols-rounded text-lg">
                      photo_camera
                    </span>
                  </button>
                  {" "}
                  <input type="file" id="avatarFile" accept="image/*" className="hidden" />
                </div>
                {" "}
                <p className="mt-4 text-xs text-neutral-500 dark:text-white/50">
                  Click the camera to change photo
                </p>
              </div>
              {/* Read-only Info */}
              <div className="space-y-4 pt-4 border-t border-black/5 dark:border-white/10">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-white/40 mb-1">
                    Name
                  </label>
                  {" "}
                  <p id="displayName" className="text-sm font-medium text-neutral-800 dark:text-white">
                    —
                  </p>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-white/40 mb-1">
                    Email
                  </label>
                  {" "}
                  <p id="displayEmail" className="text-sm text-neutral-600 dark:text-white/70">
                    —
                  </p>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-white/40 mb-1">
                    College
                  </label>
                  {" "}
                  <p id="displayCollege" className="text-sm text-neutral-600 dark:text-white/70">
                    —
                  </p>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-white/40 mb-1">
                    Department
                  </label>
                  {" "}
                  <p id="displayDepartment" className="text-sm text-neutral-600 dark:text-white/70">
                    —
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-black/5 dark:border-white/10">
                <p className="text-[11px] text-neutral-400 dark:text-white/40 leading-relaxed">
                  <span className="material-symbols-rounded text-sm align-middle mr-1">
                    info
                  </span>
                  {" Name, email, college and department are set during signup and cannot be changed here. "}
                </p>
              </div>
            </div>
          </div>
          {/* Right: Editable Fields */}
          <div className="lg:col-span-8">
            <form id="profileForm" className="space-y-6">
              {/* Professional Info Section */}
              <section className="glass-card rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <span className="material-symbols-rounded text-brand-500">
                    badge
                  </span>
                  {" Professional Information "}
                </h2>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 dark:text-white/70 mb-2">
                      Headline
                    </label>
                    {" "}
                    <input
                      name="headline"
                      type="text"
                      className="w-full rounded-xl border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-white/5 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition"
                      placeholder="e.g., Associate Professor | AI Researcher"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 dark:text-white/70 mb-2">
                      Qualification
                    </label>
                    {" "}
                    <input
                      name="qualification"
                      type="text"
                      className="w-full rounded-xl border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-white/5 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition"
                      placeholder="e.g., Ph.D. Computer Science, M.Tech"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 dark:text-white/70 mb-2">
                      Years of Experience
                    </label>
                    {" "}
                    <input
                      name="years_experience"
                      type="number"
                      min="0"
                      max="80"
                      className="w-full rounded-xl border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-white/5 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition"
                      placeholder="e.g., 10"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 dark:text-white/70 mb-2">
                      Specialization
                    </label>
                    {" "}
                    <input
                      name="specialization"
                      type="text"
                      className="w-full rounded-xl border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-white/5 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition"
                      placeholder="e.g., Machine Learning, Data Structures"
                    />
                    {" "}
                    <p className="mt-1 text-[10px] text-neutral-400 dark:text-white/40">
                      Separate multiple with commas
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 dark:text-white/70 mb-2">
                      Phone Number
                    </label>
                    {" "}
                    <input
                      name="phone"
                      type="tel"
                      maxLength={15}
                      className="w-full rounded-xl border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-white/5 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition"
                      placeholder="e.g., 9876543210"
                    />
                    {" "}
                    <p className="mt-1 text-[10px] text-neutral-400 dark:text-white/40">
                      10-digit mobile number (used for WhatsApp messaging)
                    </p>
                  </div>
                </div>
              </section>
              {/* Bio Section */}
              <section className="glass-card rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <span className="material-symbols-rounded text-brand-500">
                    person
                  </span>
                  {" About You "}
                </h2>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-white/70 mb-2">
                    Bio
                  </label>
                  {" "}
                  <textarea
                    name="bio"
                    rows={5}
                    className="w-full rounded-xl border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-white/5 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition resize-none"
                    placeholder="Tell students about your teaching philosophy, research interests, and what makes your classes unique..."
                  />
                  {" "}
                  <p className="mt-2 text-[10px] text-neutral-400 dark:text-white/40">
                    This will be visible on your public profile
                  </p>
                </div>
              </section>
              {/* Status Message */}
              <div id="status" className="hidden rounded-xl px-4 py-3 text-sm font-medium" />
              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  id="resetBtn"
                  className="inline-flex items-center gap-2 text-sm px-5 py-2.5 rounded-xl border border-slate-200/60 dark:border-white/10 hover:border-brand-400/60 hover:bg-brand-50 dark:hover:bg-white/5 transition"
                >
                  <span className="material-symbols-rounded text-base">
                    refresh
                  </span>
                  {" Reset "}
                </button>
                {" "}
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#9E4B8A] via-[#B06AB3] to-[#FF7FD1] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(158,75,138,0.25)] hover:shadow-[0_12px_28px_rgba(158,75,138,0.32)] transition"
                >
                  <span className="material-symbols-rounded text-base">
                    save
                  </span>
                  {" Save Changes "}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <script src="/_legacy/teacher_profile_edit/script-02.js" />
    </LegacyPage>
  );
}
