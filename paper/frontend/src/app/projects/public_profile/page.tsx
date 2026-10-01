// Converted from ui/projects/public_profile.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/projects/public_profile/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "TuNe X — Public Profile",
  description: "View a member's public profile and their projects on TuNe X.",
};

export default function ProjectsPublicProfilePage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"bg-ink-50 dark:bg-[#0a0d12] text-[#0d1117] dark:text-zinc-100"}}
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <link rel="stylesheet" href="../assets/css/tailwind.css" />
      <link
        href={"https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@300;400;600&display=swap"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="/_legacy/projects/public_profile/style-01.css" />
      <script src="/_legacy/projects/public_profile/script-01.js" />
      <script src="/config.js" />
      {/* ── original <body> ── */}
      {/* NAV */}
      <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-black/30 border-b border-black/5 dark:border-white/10">
        <nav className="container flex items-center gap-3 py-3">
          <a href="index.html" className="flex items-center gap-2 font-semibold tracking-tight">
            {" "}
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600 text-white shadow-brand-lg">
              CX
            </span>
            {" "}
            <span className="hidden sm:inline">
              TuNe X
            </span>
            {" "}
          </a>
          {" "}
          <div className="ml-auto hidden md:flex items-center gap-6 text-sm">
            <a href="index.html#features" className="hover:text-brand-600 dark:hover:text-brand-300">
              Features
            </a>
            {" "}
            <a href="index.html#workflows" className="hover:text-brand-600 dark:hover:text-brand-300">
              Agentic Tools
            </a>
            {" "}
            <a href="postings.html" className="hover:text-brand-600 dark:hover:text-brand-300">
              Postings
            </a>
            {" "}
            {/* Profile avatar (shown when logged in) */}
            <a
              id="navProfile"
              href="profile.html"
              title="Profile"
              className="hidden inline-flex items-center justify-center w-9 h-9 rounded-full overflow-hidden border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60"
            >
              {" "}
              <img id="navProfileImg" alt="Profile" className="w-full h-full object-cover hidden" />
              {" "}
              <span id="navProfileInitial" className="text-xs font-semibold">
                Me
              </span>
              {" "}
            </a>
            {" "}
            <div className="relative" id="navProjectsWrap">
              <button
                type="button"
                id="navProjectsBtn"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition"
              >
                <span className="icon text-base leading-none">
                  hub
                </span>
                {" "}
                <span>
                  Project Portal
                </span>
                {" "}
                <span className="icon text-base leading-none">
                  expand_more
                </span>
              </button>
              {" "}
              <div
                id="navProjectsMenu"
                className="absolute right-0 mt-2 w-60 rounded-xl border border-black/10 dark:border-white/10 bg-white/95 dark:bg-zinc-900/95 shadow-lg backdrop-blur hidden"
              >
                <a
                  href="postings.html"
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10 rounded-t-xl"
                >
                  <span className="icon text-base leading-none">
                    folder_open
                  </span>
                  Project Postings
                </a>
                {" "}
                <a
                  href="project_post.html"
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <span className="icon text-base leading-none">
                    add_circle
                  </span>
                  Create Project
                </a>
                {" "}
                <a
                  href="incoming_requests.html"
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <span className="icon text-base leading-none">
                    inbox
                  </span>
                  Incoming Requests
                </a>
                {" "}
                <a
                  href="my_applications.html"
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
                >
                  <span className="icon text-base leading-none">
                    assignment_ind
                  </span>
                  My Applications
                </a>
                {" "}
                <a
                  href="skill-test.html"
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10 rounded-b-xl"
                >
                  <span className="icon text-base leading-none">
                    verified
                  </span>
                  Skill Test Portal
                </a>
              </div>
            </div>
            {" "}
            <a href="login.html" className="hover:text-brand-600 dark:hover:text-brand-300">
              Sign in
            </a>
            {" "}
            <a
              href="signup.html"
              className="inline-flex items-center gap-2 rounded-xl border border-black/10 dark:border-white/10 px-4 py-2 hover:bg-black/5 dark:hover:bg-white/10"
            >
              <span className="icon">
                person_add
              </span>
              {" Sign up"}
            </a>
            {" "}
            <button
              data-px-onclick="toggleTheme()"
              className="rounded-lg px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10"
              title="Toggle theme"
              data-px=""
            >
              <span className="icon align-[-4px]">
                dark_mode
              </span>
            </button>
          </div>
          <div className="md:hidden flex items-center gap-2">
            <button
              data-px-onclick="toggleTheme()"
              className="rounded-lg px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10"
              data-px=""
            >
              <span className="icon">
                dark_mode
              </span>
            </button>
            {" "}
            {/* Mobile profile avatar (shown when logged in) */}
            <a
              id="navProfileMobile"
              href="profile.html"
              title="Profile"
              className="hidden inline-flex items-center justify-center w-8 h-8 rounded-full overflow-hidden border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60"
            >
              {" "}
              <img id="navProfileMobileImg" alt="Profile" className="w-full h-full object-cover hidden" />
              {" "}
              <span id="navProfileMobileInitial" className="text-[10px] font-semibold">
                Me
              </span>
              {" "}
            </a>
            {" "}
            <button id="menuBtn" className="rounded-lg px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10">
              <span className="icon">
                menu
              </span>
            </button>
          </div>
        </nav>
        <div id="mobileMenu" className="md:hidden hidden border-t border-black/5 dark:border-white/10">
          <div className="container py-2 grid gap-1">
            <a
              href="index.html#features"
              className="px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
            >
              Features
            </a>
            {" "}
            <a
              href="index.html#workflows"
              className="px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
            >
              Agentic Tools
            </a>
            {" "}
            <a href="postings.html" className="px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10">
              Postings
            </a>
            {" "}
            <div className="relative" id="navProjectsMobileWrap">
              <button
                type="button"
                id="navProjectsBtnMobile"
                className="flex w-full items-center justify-between px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
              >
                <span>
                  Project Portal
                </span>
                {" "}
                <span className="icon text-base leading-none">
                  expand_more
                </span>
              </button>
              {" "}
              <div id="navProjectsMenuMobile" className="mt-1 hidden flex-col gap-1 pl-3">
                <a
                  href="postings.html"
                  className="px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-sm"
                >
                  Project Postings
                </a>
                {" "}
                <a
                  href="project_post.html"
                  className="px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-sm"
                >
                  Create Project
                </a>
                {" "}
                <a
                  href="incoming_requests.html"
                  className="px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-sm"
                >
                  Incoming Requests
                </a>
                {" "}
                <a
                  href="my_applications.html"
                  className="px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-sm"
                >
                  My Applications
                </a>
                {" "}
                <a
                  href="skill-test.html"
                  className="px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-sm"
                >
                  Skill Test Portal
                </a>
              </div>
            </div>
            {" "}
            <a href="login.html" className="px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10">
              Sign in
            </a>
            {" "}
            <a
              href="signup.html"
              className="px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10"
            >
              Sign up
            </a>
          </div>
        </div>
      </header>
      {/* COVER + PROFILE (mirrors profile.html look) */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-radial opacity-70 dark:opacity-60 pointer-events-none" />
        <div className="container relative">
          <div className="rounded-b-3xl h-36 md:h-44 bg-gradient-to-r from-slate-800 to-brand-700" />
        </div>
      </section>
      <main className="container -mt-16 md:-mt-20 pb-16">
        {/* Owner actions for incoming request (conditional) */}
        <div
          id="ownerActions"
          className="hidden rounded-3xl border border-emerald-600/30 bg-emerald-100/50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-200 p-4 mb-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm">
              <span className="font-semibold">
                Request actions
              </span>
              {" · "}
              <span id="ownerActionsStatus">
                Status: pending
              </span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="incoming_requests.html"
                className="rounded-lg px-3 py-1.5 border border-emerald-700/30 hover:bg-emerald-700/10"
              >
                Back to Requests
              </a>
              {" "}
              <button id="ownerAccept" className="rounded-lg px-3 py-1.5 bg-emerald-600 text-white">
                Accept
              </button>
              {" "}
              <button
                id="ownerReject"
                className="rounded-lg px-3 py-1.5 border border-black/10 dark:border-white/10"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
        {/* Profile Card */}
        <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 shadow-soft p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-end gap-6">
            {/* Avatar */}
            <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white/90 dark:border-black/40 overflow-hidden bg-slate-200">
              <img id="profileImage" alt="Avatar" className="w-full h-full object-cover hidden" />
              {" "}
              <div
                id="profileImageFallback"
                className="absolute inset-0 flex items-center justify-center text-3xl text-slate-600"
              >
                <span id="profileInitials">
                  ?
                </span>
              </div>
              <div
                id="verifyBadge"
                className="absolute -bottom-2 -right-2 flex items-center gap-1 rounded-full bg-emerald-600 text-white text-xs px-2 py-1 shadow-brand-lg"
              >
                <span className="icon text-sm">
                  verified
                </span>
                <span id="verifyScore">
                  --
                </span>
              </div>
            </div>
            {/* Heading */}
            <div className="flex-1 min-w-0">
              <h1 id="profileName" className="pt-12 font-extrabold text-3xl md:text-4xl tracking-tight">
                Member
              </h1>
              <p id="profileHeadline" className="mt-1 text-sm md:text-base text-black/70 dark:text-white/70">
                Public profile
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-black/60 dark:text-white/60">
                <span className="icon">
                  location_on
                </span>
                <span id="profileLocation">
                  —
                </span>
                {" "}
                <span className="icon ml-3">
                  calendar_month
                </span>
                <span id="info-batch-inline">
                  —
                </span>
              </div>
            </div>
            {/* Actions (public) */}
            <div className="flex items-center gap-2">
              <button
                id="shareBtn"
                className="inline-flex items-center gap-2 rounded-xl border border-black/10 dark:border-white/10 px-4 py-2"
              >
                <span className="icon">
                  share
                </span>
                {" Share "}
              </button>
            </div>
          </div>
          {/* Progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs opacity-70 mb-1">
              <span>
                Profile completeness
              </span>
              <span id="completePct">
                —
              </span>
            </div>
            <div className="h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
              <div id="completeBar" className="h-2 bg-brand-600 w-0 transition-all duration-700" />
            </div>
          </div>
        </div>
        {/* TABS (Overview/About/Activity) */}
        <section className="mt-8">
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 p-3">
            <div className="flex flex-wrap gap-2">
              <button data-tab="overview" className="tabBtn rounded-xl px-4 py-2 bg-brand-600 text-white">
                Overview
              </button>
              {" "}
              <button data-tab="about" className="tabBtn rounded-xl px-4 py-2">
                About
              </button>
              {" "}
              <button data-tab="activity" className="tabBtn rounded-xl px-4 py-2">
                Activity
              </button>
            </div>
          </div>
          <div className="mt-4 grid gap-4">
            {/* OVERVIEW */}
            <div data-panel="overview" className="tabPanel grid lg:grid-cols-[1.2fr,.8fr] gap-4">
              <section className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 p-5 lift">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <span className="icon">
                    badge
                  </span>
                  {" Basic Info"}
                </h3>
                <dl className="grid grid-cols-[auto,1fr] gap-x-6 gap-y-2 text-sm">
                  <dt className="font-medium text-black/80 dark:text-white/80">
                    Name
                  </dt>
                  <dd id="info-name" className="opacity-80">
                    —
                  </dd>
                  <dt className="font-medium text-black/80 dark:text-white/80">
                    College
                  </dt>
                  <dd id="info-college" className="opacity-80">
                    —
                  </dd>
                  <dt className="font-medium text-black/80 dark:text-white/80">
                    Batch
                  </dt>
                  <dd id="info-batch" className="opacity-80">
                    —
                  </dd>
                  <dt className="font-medium text-black/80 dark:text-white/80">
                    Date of Birth
                  </dt>
                  <dd id="info-dob" className="opacity-80">
                    —
                  </dd>
                  <dt className="font-medium text-black/80 dark:text-white/80">
                    Phone
                  </dt>
                  <dd id="info-phone" className="opacity-80">
                    —
                  </dd>
                  <dt className="font-medium text-black/80 dark:text-white/80">
                    Email
                  </dt>
                  <dd id="info-email" className="opacity-80">
                    —
                  </dd>
                </dl>
              </section>
              <section className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 p-5 lift">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <span className="icon">
                    link
                  </span>
                  {" Links"}
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <li>
                    <a
                      id="link-linkedin"
                      target="_blank"
                      className="flex items-center gap-2 rounded-lg px-3 py-2 border border-black/10 dark:border-white/10"
                    >
                      <span className="icon">
                        work
                      </span>
                      {" LinkedIn"}
                    </a>
                  </li>
                  <li>
                    <a
                      id="link-github"
                      target="_blank"
                      className="flex items-center gap-2 rounded-lg px-3 py-2 border border-black/10 dark:border-white/10"
                    >
                      <span className="icon">
                        code
                      </span>
                      {" GitHub"}
                    </a>
                  </li>
                  <li>
                    <a
                      id="link-leetcode"
                      target="_blank"
                      className="flex items-center gap-2 rounded-lg px-3 py-2 border border-black/10 dark:border-white/10"
                    >
                      <span className="icon">
                        extension
                      </span>
                      {" LeetCode"}
                    </a>
                  </li>
                  <li>
                    <a
                      id="link-portfolio"
                      target="_blank"
                      className="flex items-center gap-2 rounded-lg px-3 py-2 border border-black/10 dark:border-white/10"
                    >
                      <span className="icon">
                        web
                      </span>
                      {" Portfolio"}
                    </a>
                  </li>
                  <li>
                    <a
                      id="link-website"
                      target="_blank"
                      className="flex items-center gap-2 rounded-lg px-3 py-2 border border-black/10 dark:border-white/10"
                    >
                      <span className="icon">
                        public
                      </span>
                      {" Website"}
                    </a>
                  </li>
                  <li>
                    <a
                      id="link-twitter"
                      target="_blank"
                      className="flex items-center gap-2 rounded-lg px-3 py-2 border border-black/10 dark:border-white/10"
                    >
                      <span className="icon">
                        alternate_email
                      </span>
                      {" Twitter"}
                    </a>
                  </li>
                  <li>
                    <a
                      id="link-instagram"
                      target="_blank"
                      className="flex items-center gap-2 rounded-lg px-3 py-2 border border-black/10 dark:border-white/10"
                    >
                      <span className="icon">
                        camera_alt
                      </span>
                      {" Instagram"}
                    </a>
                  </li>
                  <li>
                    <a
                      id="link-medium"
                      target="_blank"
                      className="flex items-center gap-2 rounded-lg px-3 py-2 border border-black/10 dark:border-white/10"
                    >
                      <span className="icon">
                        menu_book
                      </span>
                      {" Medium"}
                    </a>
                  </li>
                  <li className="sm:col-span-2">
                    <a
                      id="link-resume"
                      target="_blank"
                      className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 text-white px-4 py-2 shadow-brand-lg"
                    >
                      <span className="icon">
                        download
                      </span>
                      {" Download Resume"}
                    </a>
                  </li>
                </ul>
              </section>
            </div>
            {/* ABOUT */}
            <div data-panel="about" className="tabPanel hidden grid md:grid-cols-2 gap-4">
              <section className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 p-5 lift">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <span className="icon">
                    subject
                  </span>
                  {" Summary"}
                </h3>
                <p id="info-bio" className="text-sm opacity-80 bg-black/5 dark:bg-white/10 rounded-lg p-3">
                  —
                </p>
              </section>
              <section className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 p-5 lift">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <span className="icon">
                    school
                  </span>
                  {" Specializations"}
                </h3>
                <p
                  id="info-specializations"
                  className="text-sm opacity-80 bg-black/5 dark:bg-white/10 rounded-lg p-3"
                >
                  —
                </p>
              </section>
              <section className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 p-5 lift">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <span className="icon">
                    construction
                  </span>
                  {" Technologies "}
                </h3>
                <p
                  id="info-technologies"
                  className="text-sm opacity-80 bg-black/5 dark:bg-white/10 rounded-lg p-3"
                >
                  —
                </p>
                <div id="tech-chips" className="mt-3 flex flex-wrap gap-2" />
              </section>
              <section className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 p-5 lift">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <span className="icon">
                    workspace_premium
                  </span>
                  {" Skills "}
                </h3>
                <p id="info-skills" className="text-sm opacity-80 bg-black/5 dark:bg:white/10 rounded-lg p-3">
                  —
                </p>
                <div id="skills-chips" className="mt-3 flex flex-wrap gap-2" />
              </section>
              <section className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 p-5 lift">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <span className="icon">
                    military_tech
                  </span>
                  {" Achievements "}
                </h3>
                <p
                  id="info-achievements"
                  className="text-sm opacity-80 bg-black/5 dark:bg:white/10 rounded-lg p-3"
                >
                  —
                </p>
              </section>
              <section className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 p-5 lift">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <span className="icon">
                    workspace_premium
                  </span>
                  {" Certifications"}
                </h3>
                <p
                  id="info-certifications"
                  className="text-sm opacity-80 bg-black/5 dark:bg:white/10 rounded-lg p-3"
                >
                  —
                </p>
              </section>
              <section className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 p-5 lift">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <span className="icon">
                    translate
                  </span>
                  {" Languages"}
                </h3>
                <p
                  id="info-languages"
                  className="text-sm opacity-80 bg-black/5 dark:bg:white/10 rounded-lg p-3"
                >
                  —
                </p>
              </section>
              <section className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 p-5 lift">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <span className="icon">
                    interests
                  </span>
                  {" Interests"}
                </h3>
                <p
                  id="info-interests"
                  className="text-sm opacity-80 bg-black/5 dark:bg:white/10 rounded-lg p-3"
                >
                  —
                </p>
              </section>
            </div>
            {/* ACTIVITY (text fields) */}
            <div data-panel="activity" className="tabPanel hidden grid md:grid-cols-2 gap-4">
              <section className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 p-5 lift">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <span className="icon">
                    science
                  </span>
                  {" Project Info"}
                </h3>
                <p
                  id="info-projects"
                  className="text-sm opacity-80 bg-black/5 dark:bg:white/10 rounded-lg p-3"
                >
                  —
                </p>
              </section>
              <section className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 p-5 lift">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <span className="icon">
                    menu_book
                  </span>
                  {" Publications"}
                </h3>
                <p
                  id="info-publications"
                  className="text-sm opacity-80 bg-black/5 dark:bg:white/10 rounded-lg p-3"
                >
                  —
                </p>
              </section>
              <section className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 p-5 lift">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <span className="icon">
                    badge
                  </span>
                  {" Experience"}
                </h3>
                <p
                  id="info-experience"
                  className="text-sm opacity-80 bg-black/5 dark:bg:white/10 rounded-lg p-3"
                >
                  —
                </p>
              </section>
            </div>
          </div>
        </section>
        {/* Projects Grid (kept for public view) */}
        <section className="mt-10">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 id="sectionTitle" className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Projects
              </h2>
              <p id="sectionSub" className="text-sm text-black/70 dark:text-white/70">
                Published by this member
              </p>
            </div>
          </div>
          <div id="grid" className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4" />
        </section>
        <p id="status" className="mt-6 text-sm text-black/60 dark:text-white/60" />
      </main>
      <footer className="border-t border-black/10 dark:border-white/10">
        <div className="container py-8 text-xs opacity-60">
          {"© "}
          <span id="year" />
          {" TuNe X"}
        </div>
      </footer>
      <script src="/_legacy/projects/public_profile/script-02.js" />
    </LegacyPage>
  );
}
