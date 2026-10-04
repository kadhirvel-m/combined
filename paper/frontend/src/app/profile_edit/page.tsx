// Converted from ui/profile_edit.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/profile_edit/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Edit Profile — Paper",
  description: "Edit your profile details, photo, and resume.",
};

export default function ProfileEditPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"font-display bg-white text-slate-900 dark:bg-night-900 dark:text-slate-200 min-h-screen"}}
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <script src="/_legacy/profile_edit/script-01.js" />
      <link rel="stylesheet" href="assets/css/tailwind.css" />
      <script src="/config.js" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,400..700,0..1,-50..200"
      />
      <script src="https://unpkg.com/@lottiefiles/dotlottie-wc@0.8.11/dist/dotlottie-wc.js" type="module" />
      <link rel="stylesheet" href="/_legacy/profile_edit/style-01.css" />
      {/* ── original <body> ── */}
      {/* Loading Overlay */}
      <div id="pageLoader">
        <dotlottie-wc
          src="https://lottie.host/848055f4-11c7-4032-80e0-d51319c33bca/lF6845uqpU.lottie"
          style={{ width: "300px", height: "300px" }}
          autoplay=""
          loop=""
        />
      </div>
      <div
        aria-hidden="true"
        className="fixed inset-0 -z-10 bg-gradient-to-b from-transparent to-brand-50/40 dark:to-night-700/20"
      />
      <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-night-900/50 border-b border-black/5 dark:border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <a
              href="profile.html"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200/60 dark:border-white/10 px-3 py-1.5 hover:border-brand-400/60 text-sm"
            >
              {" "}
              <span className="material-symbols-rounded">
                arrow_back
              </span>
              {" Back "}
            </a>
            {" "}
            <div className="flex items-center gap-3">
              <button
                id="saveChangesBtn"
                type="button"
                className="rounded-xl bg-gradient-to-r from-brand-500 to-indigo-500 px-4 py-2 text-white shadow-neon"
              >
                Save Changes
              </button>
              {" "}
              <button
                id="signOutBtn"
                title="Sign out"
                aria-label="Sign out"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200/60 dark:border-white/10 px-3 py-1.5 hover:border-brand-400/60 text-sm"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 12H3" />
                  {" "}
                  <path d="M15 12l-4-4" />
                  {" "}
                  <path d="M15 12l-4 4" />
                  {" "}
                  <path d="M21 7v10a2 2 0 0 1-2 2h-6" />
                </svg>
                {" "}
                <span>
                  Sign Out
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="relative">
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-20 grid gap-6">
          <h1 className="text-2xl font-semibold">
            Edit Profile
          </h1>
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Left: photo & resume */}
            <div className="lg:col-span-4">
              <div className="rounded-2xl p-6 border border-slate-200/60 dark:border-white/10 bg-white dark:bg-night-800/70 grid gap-5">
                <div className="grid gap-3">
                  <div className="flex items-center gap-4">
                    <div
                      id="avatar"
                      className="relative overflow-hidden h-16 w-16 rounded-xl bg-gradient-to-br from-brand-400 via-brand-500 to-indigo-500 text-white grid place-items-center font-bold text-xl shadow-neon"
                    >
                      <img
                        id="avatarImg"
                        alt="Profile photo"
                        className="hidden absolute inset-0 h-full w-full object-cover"
                      />
                      {" "}
                      <span id="avatarInitials" className="relative z-10">
                        U
                      </span>
                    </div>
                    <div className="text-sm min-w-0">
                      <div id="email" className="text-slate-600 dark:text-slate-300 break-words">
                        —
                      </div>
                      <div id="name" className="font-medium">
                        —
                      </div>
                    </div>
                  </div>
                  <form id="imageForm" className="grid gap-2">
                    <label className="text-xs text-slate-500">
                      Profile image
                    </label>
                    {" "}
                    <input
                      id="imageInput"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="text-xs w-full"
                    />
                    {" "}
                    <div className="text-[11px] text-slate-500">
                      {"Select an image, then click "}
                      <span className="font-medium">
                        Save Changes
                      </span>
                      .
                    </div>
                    {" "}
                    <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1}>
                      Upload image
                    </button>
                    {" "}
                    <a id="currentImage" href="#" target="_blank" className="text-xs text-brand-600 hidden">
                      View current
                    </a>
                  </form>
                </div>
                <div className="grid gap-2">
                  <form id="resumeForm" className="grid gap-2">
                    <label className="text-xs text-slate-500">
                      Resume (PDF/DOC)
                    </label>
                    {" "}
                    <input
                      id="resumeInput"
                      type="file"
                      accept="application/pdf,.doc,.docx"
                      className="text-xs w-full"
                    />
                    {" "}
                    <div className="text-[11px] text-slate-500">
                      {"Select a resume, then click "}
                      <span className="font-medium">
                        Save Changes
                      </span>
                      .
                    </div>
                    {" "}
                    <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1}>
                      Upload resume
                    </button>
                    {" "}
                    <a id="currentResume" href="#" target="_blank" className="text-xs text-brand-600 hidden">
                      View current
                    </a>
                  </form>
                  <div className="text-xs text-slate-500">
                    Your email is used for account and contact; it may be visible on your profile.
                  </div>
                </div>
              </div>
            </div>
            {/* Right: details form */}
            <div className="lg:col-span-8">
              <form
                id="detailsForm"
                className="rounded-2xl p-6 border border-slate-200/60 dark:border-white/10 bg-white dark:bg-night-800/70 grid gap-6"
              >
                <h2 className="text-lg font-semibold">
                  Basic Info
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <label className="grid gap-1">
                    {" "}
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Full name
                    </span>
                    {" "}
                    <input
                      id="f_name"
                      type="text"
                      className="rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-800/70 px-3 py-2"
                    />
                    {" "}
                  </label>
                  {" "}
                  <label className="grid gap-1">
                    {" "}
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Phone
                    </span>
                    {" "}
                    <input
                      id="f_phone"
                      type="tel"
                      placeholder="9876543210"
                      maxLength={10}
                      pattern={"[0-9]{10}"}
                      className="rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-800/70 px-3 py-2"
                    />
                    {" "}
                  </label>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <label className="grid gap-1">
                    {" "}
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Headline
                    </span>
                    {" "}
                    <input
                      id="f_headline"
                      type="text"
                      placeholder="e.g., ML Student • Full‑stack dev"
                      className="rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-800/70 px-3 py-2"
                    />
                    {" "}
                  </label>
                  {" "}
                  <label className="grid gap-1">
                    {" "}
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Location
                    </span>
                    {" "}
                    <input
                      id="f_location"
                      type="text"
                      placeholder="City, Country"
                      className="rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-800/70 px-3 py-2"
                    />
                    {" "}
                  </label>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <label className="grid gap-1">
                    {" "}
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Date of Birth
                    </span>
                    {" "}
                    <input
                      id="f_dob"
                      type="date"
                      className="rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-800/70 px-3 py-2"
                    />
                    {" "}
                  </label>
                  {" "}
                  <label className="grid gap-1">
                    {" "}
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Email
                    </span>
                    {" "}
                    <input
                      id="f_email_ro"
                      type="email"
                      disabled
                      className="rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/50 dark:bg-night-800/50 px-3 py-2"
                    />
                    {" "}
                  </label>
                </div>
                <h2 className="text-lg font-semibold">
                  Links
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <label className="grid gap-1">
                    {" "}
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      LinkedIn
                    </span>
                    {" "}
                    <input
                      id="f_linkedin"
                      type="url"
                      placeholder="https://linkedin.com/in/…"
                      className="rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-800/70 px-3 py-2"
                    />
                    {" "}
                  </label>
                  {" "}
                  <label className="grid gap-1">
                    {" "}
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      GitHub
                    </span>
                    {" "}
                    <input
                      id="f_github"
                      type="url"
                      placeholder="https://github.com/…"
                      className="rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-800/70 px-3 py-2"
                    />
                    {" "}
                  </label>
                  {" "}
                  <label className="grid gap-1">
                    {" "}
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      LeetCode
                    </span>
                    {" "}
                    <input
                      id="f_leetcode"
                      type="url"
                      placeholder="https://leetcode.com/u/…"
                      className="rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-800/70 px-3 py-2"
                    />
                    {" "}
                  </label>
                  {" "}
                  <label className="grid gap-1">
                    {" "}
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Portfolio
                    </span>
                    {" "}
                    <input
                      id="f_portfolio"
                      type="url"
                      placeholder="https://your-portfolio.dev"
                      className="rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-800/70 px-3 py-2"
                    />
                    {" "}
                  </label>
                  {" "}
                  <label className="grid gap-1">
                    {" "}
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Website
                    </span>
                    {" "}
                    <input
                      id="f_website"
                      type="url"
                      placeholder="https://yoursite.com"
                      className="rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-800/70 px-3 py-2"
                    />
                    {" "}
                  </label>
                  {" "}
                  <label className="grid gap-1">
                    {" "}
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Twitter
                    </span>
                    {" "}
                    <input
                      id="f_twitter"
                      type="url"
                      placeholder="https://x.com/username"
                      className="rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-800/70 px-3 py-2"
                    />
                    {" "}
                  </label>
                  {" "}
                  <label className="grid gap-1">
                    {" "}
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Instagram
                    </span>
                    {" "}
                    <input
                      id="f_instagram"
                      type="url"
                      placeholder="https://instagram.com/username"
                      className="rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-800/70 px-3 py-2"
                    />
                    {" "}
                  </label>
                  {" "}
                  <label className="grid gap-1">
                    {" "}
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Medium
                    </span>
                    {" "}
                    <input
                      id="f_medium"
                      type="url"
                      placeholder="https://medium.com/@username"
                      className="rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-800/70 px-3 py-2"
                    />
                    {" "}
                  </label>
                </div>
                <h2 className="text-lg font-semibold">
                  About
                </h2>
                {" "}
                <label className="grid gap-1">
                  {" "}
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    Bio
                  </span>
                  {" "}
                  <textarea
                    id="f_bio"
                    rows={3}
                    className="rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-800/70 px-3 py-2"
                  />
                  {" "}
                </label>
                {" "}
                <label className="grid gap-1">
                  {" "}
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    Specializations (comma separated)
                  </span>
                  {" "}
                  <input
                    id="f_specs"
                    type="text"
                    placeholder="AI, Full‑stack, Data viz"
                    className="rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-800/70 px-3 py-2"
                  />
                  {" "}
                </label>
                {" "}
                <div className="grid md:grid-cols-2 gap-4">
                  <label className="grid gap-1">
                    {" "}
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Technologies (comma/space separated)
                    </span>
                    {" "}
                    <input
                      id="f_technologies"
                      type="text"
                      placeholder="React, Django, PostgreSQL"
                      className="rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-800/70 px-3 py-2"
                    />
                    {" "}
                  </label>
                  {" "}
                  <label className="grid gap-1">
                    {" "}
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Skills (comma separated)
                    </span>
                    {" "}
                    <input
                      id="f_skills"
                      type="text"
                      placeholder="Python, Public speaking, Leadership"
                      className="rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-800/70 px-3 py-2"
                    />
                    {" "}
                  </label>
                  {" "}
                  <label className="grid gap-1">
                    {" "}
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Certifications
                    </span>
                    {" "}
                    <input
                      id="f_certifications"
                      type="text"
                      placeholder="AWS CCP; Google Data Analytics"
                      className="rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-800/70 px-3 py-2"
                    />
                    {" "}
                  </label>
                  {" "}
                  <label className="grid gap-1">
                    {" "}
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Languages
                    </span>
                    {" "}
                    <input
                      id="f_languages"
                      type="text"
                      placeholder="English, Tamil"
                      className="rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-800/70 px-3 py-2"
                    />
                    {" "}
                  </label>
                  {" "}
                  <label className="grid gap-1 md:col-span-2">
                    {" "}
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Interests
                    </span>
                    {" "}
                    <input
                      id="f_interests"
                      type="text"
                      placeholder="Open source, Robotics, Design"
                      className="rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-800/70 px-3 py-2"
                    />
                    {" "}
                  </label>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <label className="grid gap-1">
                    {" "}
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Achievements
                    </span>
                    {" "}
                    <textarea
                      id="f_achievements"
                      rows={3}
                      placeholder="Hackathon wins, awards, etc."
                      className="rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-800/70 px-3 py-2"
                    />
                    {" "}
                  </label>
                  {" "}
                  <label className="grid gap-1">
                    {" "}
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Experience
                    </span>
                    {" "}
                    <textarea
                      id="f_experience"
                      rows={3}
                      placeholder="Internships, roles, responsibilities"
                      className="rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-800/70 px-3 py-2"
                    />
                    {" "}
                  </label>
                  {" "}
                  <label className="grid gap-1">
                    {" "}
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Publications
                    </span>
                    {" "}
                    <textarea
                      id="f_publications"
                      rows={3}
                      placeholder="Papers, articles"
                      className="rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-800/70 px-3 py-2"
                    />
                    {" "}
                  </label>
                  {" "}
                  <label className="grid gap-1">
                    {" "}
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Project Info
                    </span>
                    {" "}
                    <textarea
                      id="f_project_info"
                      rows={3}
                      placeholder="Highlights of projects"
                      className="rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-800/70 px-3 py-2"
                    />
                    {" "}
                  </label>
                </div>
                <h2 className="text-lg font-semibold mt-8">
                  Experience
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Chronicle roles, internships, research or teaching engagements.
                </p>
                <div id="experienceList" className="grid gap-3 mt-3" />
                {" "}
                <button
                  id="addExperienceBtn"
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200/60 dark:border-white/10 px-3 py-1.5 text-xs hover:border-brand-400/60 text-brand-600 dark:text-brand-300"
                >
                  <span className="material-symbols-rounded text-[18px]">
                    add_circle
                  </span>
                  {" Add experience "}
                </button>
                {" "}
                <template
                  id="experienceTemplate"
                  dangerouslySetInnerHTML={{ __html: "\n                            <div class=\"rounded-xl border border-slate-200/60 dark:border-white/10 bg-white dark:bg-night-800/70 p-4 grid gap-3\" data-entry=\"experience\">\n                                <input type=\"hidden\" name=\"exp_id\">\n                                <div class=\"grid md:grid-cols-2 gap-3\">\n                                    <label class=\"grid gap-1\">\n                                        <span class=\"text-xs text-slate-600 dark:text-slate-300\">Title *</span>\n                                        <input name=\"exp_title\" type=\"text\" required=\"\" placeholder=\"Software Engineer\" class=\"rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-900/50 px-3 py-2\">\n                                    </label>\n                                    <label class=\"grid gap-1\">\n                                        <span class=\"text-xs text-slate-600 dark:text-slate-300\">Employment type</span>\n                                        <select name=\"exp_employment_type\" class=\"rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-900/50 px-3 py-2\">\n                                            <option value=\"\"></option>\n                                            <option>Full-time</option>\n                                            <option>Part-time</option>\n                                            <option>Internship</option>\n                                            <option>Freelance</option>\n                                            <option>Contract</option>\n                                            <option>Self-employed</option>\n                                            <option>Apprenticeship</option>\n                                        </select>\n                                    </label>\n                                </div>\n                                <div class=\"grid md:grid-cols-2 gap-3\">\n                                    <label class=\"grid gap-1\">\n                                        <span class=\"text-xs text-slate-600 dark:text-slate-300\">Company /\n                                            Organization</span>\n                                        <input name=\"exp_company\" type=\"text\" placeholder=\"Company name\" class=\"rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-900/50 px-3 py-2\">\n                                    </label>\n                                    <label class=\"grid gap-1\">\n                                        <span class=\"text-xs text-slate-600 dark:text-slate-300\">Company logo URL</span>\n                                        <input name=\"exp_company_logo\" type=\"url\" placeholder=\"https://logo.png\" class=\"rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-900/50 px-3 py-2\">\n                                    </label>\n                                </div>\n                                <div class=\"grid md:grid-cols-2 gap-3\">\n                                    <label class=\"grid gap-1\">\n                                        <span class=\"text-xs text-slate-600 dark:text-slate-300\">Location</span>\n                                        <input name=\"exp_location\" type=\"text\" placeholder=\"City, Country\" class=\"rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-900/50 px-3 py-2\">\n                                    </label>\n                                    <label class=\"grid gap-1\">\n                                        <span class=\"text-xs text-slate-600 dark:text-slate-300\">Location type</span>\n                                        <select name=\"exp_location_type\" class=\"rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-900/50 px-3 py-2\">\n                                            <option value=\"\"></option>\n                                            <option>Onsite</option>\n                                            <option>Remote</option>\n                                            <option>Hybrid</option>\n                                        </select>\n                                    </label>\n                                </div>\n                                <div class=\"grid md:grid-cols-3 gap-3 items-end\">\n                                    <label class=\"grid gap-1\">\n                                        <span class=\"text-xs text-slate-600 dark:text-slate-300\">Start date *</span>\n                                        <input name=\"exp_start_date\" type=\"date\" required=\"\" class=\"rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-900/50 px-3 py-2\">\n                                    </label>\n                                    <label class=\"grid gap-1\">\n                                        <span class=\"text-xs text-slate-600 dark:text-slate-300\">End date</span>\n                                        <input name=\"exp_end_date\" type=\"date\" class=\"rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-900/50 px-3 py-2\">\n                                    </label>\n                                    <label class=\"inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300\">\n                                        <input name=\"exp_current\" type=\"checkbox\" class=\"rounded border-slate-300 text-brand-500\">\n                                        <span>Currently here</span>\n                                    </label>\n                                </div>\n                                <label class=\"grid gap-1\">\n                                    <span class=\"text-xs text-slate-600 dark:text-slate-300\">Description</span>\n                                    <textarea name=\"exp_description\" rows=\"3\" placeholder=\"Impact, responsibilities, wins…\" class=\"rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-900/50 px-3 py-2\"></textarea>\n                                </label>\n                                <div class=\"grid gap-2\" data-media-list=\"\"></div>\n                                <div class=\"flex flex-wrap items-center justify-between gap-2\">\n                                    <button type=\"button\" class=\"addExperienceMedia inline-flex items-center gap-1 rounded-lg border border-slate-200/60 dark:border-white/15 px-2 py-1 text-xs hover:border-brand-400/60\">\n                                        <span class=\"material-symbols-rounded text-[18px]\">attach_file_add</span>\n                                        Attachment\n                                    </button>\n                                    <button type=\"button\" class=\"removeEntry inline-flex items-center gap-1 rounded-lg border border-rose-300/40 text-rose-500 px-2 py-1 text-xs hover:border-rose-400/60\">\n                                        <span class=\"material-symbols-rounded text-[18px]\">delete</span> Remove\n                                        experience\n                                    </button>\n                                </div>\n                            </div>\n                        " }}
                />
                {" "}
                <template
                  id="experienceMediaTemplate"
                  dangerouslySetInnerHTML={{ __html: "\n                            <div class=\"rounded-lg border border-slate-200/50 dark:border-white/15 bg-white dark:bg-night-900/50 p-3 grid md:grid-cols-2 gap-2\" data-media-item=\"\">\n                                <label class=\"grid gap-1\">\n                                    <span class=\"text-xs text-slate-600 dark:text-slate-300\">Title</span>\n                                    <input name=\"media_title\" type=\"text\" placeholder=\"Slide deck\" class=\"rounded-lg border border-slate-200/60 dark:border-white/10 bg-white px-2 py-1.5\">\n                                </label>\n                                <label class=\"grid gap-1\">\n                                    <span class=\"text-xs text-slate-600 dark:text-slate-300\">URL</span>\n                                    <input name=\"media_url\" type=\"url\" placeholder=\"https://\" class=\"rounded-lg border border-slate-200/60 dark:border-white/10 bg-white px-2 py-1.5\">\n                                </label>\n                                <label class=\"grid gap-1\">\n                                    <span class=\"text-xs text-slate-600 dark:text-slate-300\">Type</span>\n                                    <select name=\"media_kind\" class=\"rounded-lg border border-slate-200/60 dark:border-white/10 bg-white px-2 py-1.5\">\n                                        <option value=\"link\">Link</option>\n                                        <option value=\"document\">Document</option>\n                                        <option value=\"video\">Video</option>\n                                        <option value=\"image\">Image</option>\n                                        <option value=\"presentation\">Presentation</option>\n                                    </select>\n                                </label>\n                                <div class=\"flex items-end justify-end\">\n                                    <button type=\"button\" class=\"removeMedia inline-flex items-center gap-1 rounded-lg border border-rose-300/40 text-rose-500 px-2 py-1 text-xs hover:border-rose-400/60\">Remove</button>\n                                </div>\n                            </div>\n                        " }}
                />
                {" "}
                <h2 className="text-lg font-semibold mt-8">
                  Education
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Capture formal education, bootcamps or certifications earned through institutions.
                </p>
                <div id="educationList" className="grid gap-3 mt-3" />
                {" "}
                <button
                  id="addEducationBtn"
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200/60 dark:border-white/10 px-3 py-1.5 text-xs hover:border-brand-400/60 text-brand-600 dark:text-brand-300"
                >
                  <span className="material-symbols-rounded text-[18px]">
                    add_circle
                  </span>
                  {" Add education "}
                </button>
                {" "}
                <template
                  id="educationTemplate"
                  dangerouslySetInnerHTML={{ __html: "\n                            <div class=\"rounded-xl border border-slate-200/60 dark:border-white/10 bg-white dark:bg-night-800/70 p-4 grid gap-3\" data-entry=\"education\">\n                                <input type=\"hidden\" name=\"edu_id\">\n                                <input type=\"hidden\" name=\"edu_school\">\n                                <input type=\"hidden\" name=\"edu_degree\">\n                                <input type=\"hidden\" name=\"edu_department\">\n                                <input type=\"hidden\" name=\"edu_batch_range\">\n                                <!-- Newly added hidden FK id fields -->\n                                <input type=\"hidden\" name=\"edu_college_id\">\n                                <input type=\"hidden\" name=\"edu_degree_id\">\n                                <input type=\"hidden\" name=\"edu_department_id\">\n                                <input type=\"hidden\" name=\"edu_batch_id\">\n                                <label class=\"grid gap-1\">\n                                    <span class=\"text-xs text-slate-600 dark:text-slate-300\">Institution *</span>\n                                    <select data-role=\"edu-college\" required=\"\" class=\"rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-900/50 px-3 py-2\">\n                                        <option value=\"\">Select college</option>\n                                    </select>\n                                    <input data-role=\"edu-college-custom\" type=\"text\" placeholder=\"Enter institution manually\" class=\"hidden rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-900/50 px-3 py-2 mt-2\">\n                                </label>\n                                <div class=\"grid md:grid-cols-2 gap-3\">\n                                    <label class=\"grid gap-1\">\n                                        <span class=\"text-xs text-slate-600 dark:text-slate-300\">Degree</span>\n                                        <select data-role=\"edu-degree\" disabled=\"\" class=\"rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-900/50 px-3 py-2\">\n                                            <option value=\"\">Select degree</option>\n                                        </select>\n                                        <input data-role=\"edu-degree-custom\" type=\"text\" placeholder=\"Enter degree\" class=\"hidden rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-900/50 px-3 py-2 mt-2\">\n                                    </label>\n                                    <label class=\"grid gap-1\">\n                                        <span class=\"text-xs text-slate-600 dark:text-slate-300\">Department</span>\n                                        <select data-role=\"edu-department\" disabled=\"\" class=\"rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-900/50 px-3 py-2\">\n                                            <option value=\"\">Select department</option>\n                                        </select>\n                                        <input data-role=\"edu-department-custom\" type=\"text\" placeholder=\"Enter department\" class=\"hidden rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-900/50 px-3 py-2 mt-2\">\n                                    </label>\n                                </div>\n                                <div class=\"grid md:grid-cols-3 gap-3\">\n                                    <label class=\"grid gap-1\">\n                                        <span class=\"text-xs text-slate-600 dark:text-slate-300\">Batch</span>\n                                        <select data-role=\"edu-batch\" disabled=\"\" class=\"rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-900/50 px-3 py-2\">\n                                            <option value=\"\">Select batch</option>\n                                        </select>\n                                        <input data-role=\"edu-batch-custom\" type=\"text\" placeholder=\"e.g., 2022-2026\" class=\"hidden rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-900/50 px-3 py-2 mt-2\">\n                                    </label>\n                                    <label class=\"grid gap-1\">\n                                        <span class=\"text-xs text-slate-600 dark:text-slate-300\">Section</span>\n                                        <select name=\"edu_section\" class=\"rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-900/50 px-3 py-2\">\n                                            <option value=\"\">Select section</option>\n                                            <option value=\"A\">A</option>\n                                            <option value=\"B\">B</option>\n                                            <option value=\"C\">C</option>\n                                            <option value=\"D\">D</option>\n                                            <option value=\"E\">E</option>\n                                            <option value=\"F\">F</option>\n                                            <option value=\"G\">G</option>\n                                            <option value=\"H\">H</option>\n                                            <option value=\"I\">I</option>\n                                            <option value=\"J\">J</option>\n                                            <option value=\"K\">K</option>\n                                            <option value=\"L\">L</option>\n                                            <option value=\"M\">M</option>\n                                            <option value=\"N\">N</option>\n                                            <option value=\"O\">O</option>\n                                            <option value=\"P\">P</option>\n                                            <option value=\"Q\">Q</option>\n                                            <option value=\"R\">R</option>\n                                            <option value=\"S\">S</option>\n                                            <option value=\"T\">T</option>\n                                            <option value=\"U\">U</option>\n                                            <option value=\"V\">V</option>\n                                            <option value=\"W\">W</option>\n                                            <option value=\"X\">X</option>\n                                            <option value=\"Y\">Y</option>\n                                            <option value=\"Z\">Z</option>\n                                        </select>\n                                    </label>\n                                    <label class=\"grid gap-1\">\n                                        <span class=\"text-xs text-slate-600 dark:text-slate-300\">Current Semester</span>\n                                        <input name=\"edu_current_semester\" type=\"number\" min=\"1\" max=\"12\" placeholder=\"5\" class=\"rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-900/50 px-3 py-2\">\n                                    </label>\n                                </div>\n                                <div class=\"grid md:grid-cols-2 gap-3\">\n                                    <label class=\"grid gap-1\">\n                                        <span class=\"text-xs text-slate-600 dark:text-slate-300\">Registration No.</span>\n                                        <input name=\"edu_regno\" type=\"text\" placeholder=\"22TN0049\" class=\"rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-900/50 px-3 py-2\">\n                                    </label>\n                                    <label class=\"grid gap-1\">\n                                        <span class=\"text-xs text-slate-600 dark:text-slate-300\">Grade / GPA</span>\n                                        <input name=\"edu_grade\" type=\"text\" placeholder=\"9.1 CGPA\" class=\"rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-900/50 px-3 py-2\">\n                                    </label>\n                                </div>\n                                <label class=\"grid gap-1\">\n                                    <span class=\"text-xs text-slate-600 dark:text-slate-300\">Activities &amp;\n                                        societies</span>\n                                    <input name=\"edu_activities\" type=\"text\" placeholder=\"Clubs, committees…\" class=\"rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-900/50 px-3 py-2\">\n                                </label>\n                                <label class=\"grid gap-1\">\n                                    <span class=\"text-xs text-slate-600 dark:text-slate-300\">Highlights</span>\n                                    <textarea name=\"edu_description\" rows=\"3\" placeholder=\"Leadership, projects, honours…\" class=\"rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-900/50 px-3 py-2\"></textarea>\n                                </label>\n                                <div class=\"flex justify-end\">\n                                    <button type=\"button\" class=\"removeEntry inline-flex items-center gap-1 rounded-lg border border-rose-300/40 text-rose-500 px-2 py-1 text-xs hover:border-rose-400/60\">Remove\n                                        education</button>\n                                </div>\n                            </div>\n                        " }}
                />
                {" "}
                <h2 className="text-lg font-semibold mt-8">
                  {"Licenses & Certifications"}
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Add credentials so recruiters can verify your expertise.
                </p>
                <div id="certificationList" className="grid gap-3 mt-3" />
                {" "}
                <button
                  id="addCertificationBtn"
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200/60 dark:border-white/10 px-3 py-1.5 text-xs hover:border-brand-400/60 text-brand-600 dark:text-brand-300"
                >
                  <span className="material-symbols-rounded text-[18px]">
                    add_circle
                  </span>
                  {" Add certification "}
                </button>
                {" "}
                <template
                  id="certificationTemplate"
                  dangerouslySetInnerHTML={{ __html: "\n                            <div class=\"rounded-xl border border-slate-200/60 dark:border-white/10 bg-white dark:bg-night-800/70 p-4 grid gap-3\" data-entry=\"certification\">\n                                <input type=\"hidden\" name=\"cert_id\">\n                                <div class=\"grid md:grid-cols-2 gap-3\">\n                                    <label class=\"grid gap-1\">\n                                        <span class=\"text-xs text-slate-600 dark:text-slate-300\">Certification *</span>\n                                        <input name=\"cert_name\" type=\"text\" required=\"\" placeholder=\"AWS Certified Developer\" class=\"rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-900/50 px-3 py-2\">\n                                    </label>\n                                    <label class=\"grid gap-1\">\n                                        <span class=\"text-xs text-slate-600 dark:text-slate-300\">Issuing\n                                            organization</span>\n                                        <input name=\"cert_org\" type=\"text\" placeholder=\"AWS\" class=\"rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-900/50 px-3 py-2\">\n                                    </label>\n                                </div>\n                                <div class=\"grid md:grid-cols-3 gap-3 items-end\">\n                                    <label class=\"grid gap-1\">\n                                        <span class=\"text-xs text-slate-600 dark:text-slate-300\">Issue date</span>\n                                        <input name=\"cert_issue\" type=\"date\" class=\"rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-900/50 px-3 py-2\">\n                                    </label>\n                                    <label class=\"grid gap-1\">\n                                        <span class=\"text-xs text-slate-600 dark:text-slate-300\">Expiration date</span>\n                                        <input name=\"cert_expiry\" type=\"date\" class=\"rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-900/50 px-3 py-2\">\n                                    </label>\n                                    <label class=\"inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300\">\n                                        <input name=\"cert_no_expiry\" type=\"checkbox\" class=\"rounded border-slate-300 text-brand-500\"> Does not expire\n                                    </label>\n                                </div>\n                                <div class=\"grid md:grid-cols-2 gap-3\">\n                                    <label class=\"grid gap-1\">\n                                        <span class=\"text-xs text-slate-600 dark:text-slate-300\">Credential ID</span>\n                                        <input name=\"cert_credential_id\" type=\"text\" class=\"rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-900/50 px-3 py-2\">\n                                    </label>\n                                    <label class=\"grid gap-1\">\n                                        <span class=\"text-xs text-slate-600 dark:text-slate-300\">Credential URL</span>\n                                        <input name=\"cert_credential_url\" type=\"url\" placeholder=\"https://verify\" class=\"rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-900/50 px-3 py-2\">\n                                    </label>\n                                </div>\n                                <label class=\"grid gap-1\">\n                                    <span class=\"text-xs text-slate-600 dark:text-slate-300\">Notes</span>\n                                    <textarea name=\"cert_description\" rows=\"2\" placeholder=\"Score, scope or coverage details\" class=\"rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-900/50 px-3 py-2\"></textarea>\n                                </label>\n                                <div class=\"flex justify-end\">\n                                    <button type=\"button\" class=\"removeEntry inline-flex items-center gap-1 rounded-lg border border-rose-300/40 text-rose-500 px-2 py-1 text-xs hover:border-rose-400/60\">Remove\n                                        certification</button>\n                                </div>\n                            </div>\n                        " }}
                />
                {" "}
                <h2 className="text-lg font-semibold mt-8">
                  Portfolio Projects
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Showcase academic, professional or personal projects with outcomes.
                </p>
                <div id="portfolioList" className="grid gap-3 mt-3" />
                {" "}
                <button
                  id="addPortfolioBtn"
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200/60 dark:border-white/10 px-3 py-1.5 text-xs hover:border-brand-400/60 text-brand-600 dark:text-brand-300"
                >
                  <span className="material-symbols-rounded text-[18px]">
                    add_circle
                  </span>
                  {" Add project "}
                </button>
                {" "}
                <template
                  id="portfolioTemplate"
                  dangerouslySetInnerHTML={{ __html: "\n                            <div class=\"rounded-xl border border-slate-200/60 dark:border-white/10 bg-white dark:bg-night-800/70 p-4 grid gap-3\" data-entry=\"portfolio\">\n                                <input type=\"hidden\" name=\"proj_id\">\n                                <label class=\"grid gap-1\">\n                                    <span class=\"text-xs text-slate-600 dark:text-slate-300\">Project name *</span>\n                                    <input name=\"proj_name\" type=\"text\" required=\"\" placeholder=\"Build Week Platform\" class=\"rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-900/50 px-3 py-2\">\n                                </label>\n                                <div class=\"grid md:grid-cols-2 gap-3\">\n                                    <label class=\"grid gap-1\">\n                                        <span class=\"text-xs text-slate-600 dark:text-slate-300\">Linked\n                                            experience</span>\n                                        <select name=\"proj_experience\" data-associate=\"experience\" class=\"rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-900/50 px-3 py-2\">\n                                            <option value=\"\"></option>\n                                        </select>\n                                    </label>\n                                    <label class=\"grid gap-1\">\n                                        <span class=\"text-xs text-slate-600 dark:text-slate-300\">Linked education</span>\n                                        <select name=\"proj_education\" data-associate=\"education\" class=\"rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-900/50 px-3 py-2\">\n                                            <option value=\"\"></option>\n                                        </select>\n                                    </label>\n                                </div>\n                                <div class=\"grid md:grid-cols-2 gap-3\">\n                                    <label class=\"grid gap-1\">\n                                        <span class=\"text-xs text-slate-600 dark:text-slate-300\">Start date</span>\n                                        <input name=\"proj_start\" type=\"date\" class=\"rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-900/50 px-3 py-2\">\n                                    </label>\n                                    <label class=\"grid gap-1\">\n                                        <span class=\"text-xs text-slate-600 dark:text-slate-300\">End date</span>\n                                        <input name=\"proj_end\" type=\"date\" class=\"rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-900/50 px-3 py-2\">\n                                    </label>\n                                </div>\n                                <label class=\"grid gap-1\">\n                                    <span class=\"text-xs text-slate-600 dark:text-slate-300\">Project URL</span>\n                                    <input name=\"proj_url\" type=\"url\" placeholder=\"https://demo\" class=\"rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-900/50 px-3 py-2\">\n                                </label>\n                                <label class=\"grid gap-1\">\n                                    <span class=\"text-xs text-slate-600 dark:text-slate-300\">Description</span>\n                                    <textarea name=\"proj_description\" rows=\"3\" placeholder=\"Goals, tech and impact…\" class=\"rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-900/50 px-3 py-2\"></textarea>\n                                </label>\n                                <div class=\"grid md:grid-cols-2 gap-3\">\n                                    <label class=\"grid gap-1\">\n                                        <span class=\"text-xs text-slate-600 dark:text-slate-300\">Tech stack (comma\n                                            separated)</span>\n                                        <input name=\"proj_stack\" type=\"text\" placeholder=\"React, FastAPI, Supabase\" class=\"rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-900/50 px-3 py-2\">\n                                    </label>\n                                    <label class=\"grid gap-1\">\n                                        <span class=\"text-xs text-slate-600 dark:text-slate-300\">Team (comma\n                                            separated)</span>\n                                        <input name=\"proj_team\" type=\"text\" placeholder=\"Alice, Bob\" class=\"rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-900/50 px-3 py-2\">\n                                    </label>\n                                </div>\n                                <div class=\"flex justify-end\">\n                                    <button type=\"button\" class=\"removeEntry inline-flex items-center gap-1 rounded-lg border border-rose-300/40 text-rose-500 px-2 py-1 text-xs hover:border-rose-400/60\">Remove\n                                        project</button>\n                                </div>\n                            </div>\n                        " }}
                />
                {" "}
                <h2 className="text-lg font-semibold mt-8">
                  Publications
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Include papers, talks or articles to highlight thought leadership.
                </p>
                <div id="publicationList" className="grid gap-3 mt-3" />
                {" "}
                <button
                  id="addPublicationBtn"
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200/60 dark:border-white/10 px-3 py-1.5 text-xs hover:border-brand-400/60 text-brand-600 dark:text-brand-300"
                >
                  <span className="material-symbols-rounded text-[18px]">
                    add_circle
                  </span>
                  {" Add publication "}
                </button>
                {" "}
                <template
                  id="publicationTemplate"
                  dangerouslySetInnerHTML={{ __html: "\n                            <div class=\"rounded-xl border border-slate-200/60 dark:border-white/10 bg-white dark:bg-night-800/70 p-4 grid gap-3\" data-entry=\"publication\">\n                                <input type=\"hidden\" name=\"pub_id\">\n                                <label class=\"grid gap-1\">\n                                    <span class=\"text-xs text-slate-600 dark:text-slate-300\">Title *</span>\n                                    <input name=\"pub_title\" type=\"text\" required=\"\" placeholder=\"Paper title\" class=\"rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-900/50 px-3 py-2\">\n                                </label>\n                                <div class=\"grid md:grid-cols-2 gap-3\">\n                                    <label class=\"grid gap-1\">\n                                        <span class=\"text-xs text-slate-600 dark:text-slate-300\">Publisher /\n                                            Journal</span>\n                                        <input name=\"pub_publisher\" type=\"text\" placeholder=\"ACM, Medium…\" class=\"rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-900/50 px-3 py-2\">\n                                    </label>\n                                    <label class=\"grid gap-1\">\n                                        <span class=\"text-xs text-slate-600 dark:text-slate-300\">Publication date</span>\n                                        <input name=\"pub_date\" type=\"date\" class=\"rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-900/50 px-3 py-2\">\n                                    </label>\n                                </div>\n                                <label class=\"grid gap-1\">\n                                    <span class=\"text-xs text-slate-600 dark:text-slate-300\">Authors (comma\n                                        separated)</span>\n                                    <input name=\"pub_authors\" type=\"text\" placeholder=\"You, Collaborator\" class=\"rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-900/50 px-3 py-2\">\n                                </label>\n                                <label class=\"grid gap-1\">\n                                    <span class=\"text-xs text-slate-600 dark:text-slate-300\">Publication URL</span>\n                                    <input name=\"pub_url\" type=\"url\" placeholder=\"https://doi.org/...\" class=\"rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-900/50 px-3 py-2\">\n                                </label>\n                                <label class=\"grid gap-1\">\n                                    <span class=\"text-xs text-slate-600 dark:text-slate-300\">Abstract / Summary</span>\n                                    <textarea name=\"pub_abstract\" rows=\"3\" placeholder=\"Key findings, impact, context\" class=\"rounded-lg border border-slate-200/60 dark:border-white/10 bg-white/70 dark:bg-night-900/50 px-3 py-2\"></textarea>\n                                </label>\n                                <div class=\"flex justify-end\">\n                                    <button type=\"button\" class=\"removeEntry inline-flex items-center gap-1 rounded-lg border border-rose-300/40 text-rose-500 px-2 py-1 text-xs hover:border-rose-400/60\">Remove\n                                        publication</button>\n                                </div>\n                            </div>\n                        " }}
                />
                {" "}
                <div className="flex items-center justify-between">
                  <a
                    href="profile.html"
                    className="rounded-lg border border-slate-200/60 dark:border-white/10 px-3 py-2 hover:border-brand-400/60"
                  >
                    Cancel
                  </a>
                </div>
                <div
                  id="status"
                  className="hidden text-xs rounded border border-slate-200/60 dark:border-white/10 p-2"
                />
              </form>
            </div>
          </div>
        </section>
      </main>
      <script src="/_legacy/profile_edit/script-02.js" />
    </LegacyPage>
  );
}
