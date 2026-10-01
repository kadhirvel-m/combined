// Converted from ui/projects/project_post.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/projects/project_post/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "TuNe X — Create Project",
  description: "Create and publish your project/startup post with a modern, material-inspired UI.",
};

export default function ProjectsProjectPostPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"bg-ink-50 dark:bg-[#0a0d12] text-[#0d1117] dark:text-zinc-100 selection:bg-brand-200 selection:text-ink-900 min-h-screen"}}
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <link rel="stylesheet" href="../assets/css/tailwind.css" />
      <link
        href={"https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@300;400;600&display=swap"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="/_legacy/projects/project_post/style-01.css" />
      <script src="/_legacy/projects/project_post/script-01.js" />
      <script src="/config.js" />
      {/* ── original <body> ── */}
      {/* ===== NAV (like index) ===== */}
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
            <a href="index.html#discover" className="hover:text-brand-600 dark:hover:text-brand-300">
              Discover
            </a>
            {" "}
            <a href="index.html#faq" className="hover:text-brand-600 dark:hover:text-brand-300">
              FAQ
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
            <a href="../login.html" className="hover:text-brand-600 dark:hover:text-brand-300">
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
            {" "}
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 text-white px-4 py-2 shadow-brand-lg hover:brightness-110"
            >
              <span className="icon">
                bolt
              </span>
              {" Create Project"}
            </a>
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
            <a
              href="index.html#discover"
              className="px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
            >
              Discover
            </a>
            {" "}
            <a href="index.html#faq" className="px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10">
              FAQ
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
            <a href="../login.html" className="px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10">
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
      {/* BG Accent */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-radial opacity-80 dark:opacity-60 pointer-events-none" />
        <div className="container relative pt-8 pb-6">
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-glass dark:bg-glass-dark p-5 md:p-6 shadow-soft">
            <div className="flex items-center gap-2 text-sm opacity-70 mb-1">
              <span className="icon">
                rocket_launch
              </span>
              {" Create Project"}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Publish your project or startup
            </h1>
            <p className="text-sm md:text-base text-black/70 dark:text-white/70 mt-1">
              Describe the idea, tech stack, timeline and open roles. Use the gallery to add visuals.
            </p>
          </div>
        </div>
      </section>
      {/* Main form */}
      <main className="container pb-24">
        <form id="projectForm" className="grid gap-4 md:gap-5">
          {/* BASICS */}
          <section className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 p-5">
            <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
              <span className="icon">
                badge
              </span>
              {" Basics"}
            </h2>
            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm">
                  Project title *
                </label>
                {" "}
                <input
                  name="title"
                  required
                  placeholder="Title"
                  className="mt-1 w-full rounded-xl border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-900/60"
                />
                {" "}
                <p className="text-xs text-black/60 dark:text-white/60 mt-1">
                  Clear, searchable name
                </p>
              </div>
              <div>
                <label className="text-sm">
                  One‑line tagline *
                </label>
                {" "}
                <input
                  name="tagline"
                  required
                  maxLength={120}
                  placeholder="Tagline"
                  className="mt-1 w-full rounded-xl border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-900/60"
                />
                {" "}
                <p className="text-xs text-black/60 dark:text-white/60 mt-1">
                  Max 120 characters
                </p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm">
                Domain *
              </p>
              <div id="domainChips" className="mt-2 flex flex-wrap gap-2">
                <button type="button" data-val="AI/ML" className="chip text-sm">
                  AI/ML
                </button>
                {" "}
                <button type="button" data-val="Healthcare" className="chip text-sm">
                  Healthcare
                </button>
                {" "}
                <button type="button" data-val="Agriculture" className="chip text-sm">
                  Agriculture
                </button>
                {" "}
                <button type="button" data-val="FinTech" className="chip text-sm">
                  FinTech
                </button>
                {" "}
                <button type="button" data-val="EdTech" className="chip text-sm">
                  EdTech
                </button>
                {" "}
                <button type="button" data-val="Robotics" className="chip text-sm">
                  Robotics
                </button>
              </div>
              {" "}
              <input type="hidden" name="domains" id="domainsField" />
            </div>
            <div className="mt-4">
              <label className="text-sm">
                Description *
              </label>
              {" "}
              <textarea
                name="description"
                rows={6}
                required
                placeholder="Describe what you’re building, why, and how."
                className="mt-1 w-full rounded-xl border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-900/60"
              />
            </div>
            <div className="mt-4">
              <label className="text-sm">
                Tech stack (comma separated)
              </label>
              {" "}
              <input
                name="tech_stack"
                placeholder="Python, FastAPI, PyTorch, Next.js, Supabase"
                className="mt-1 w-full rounded-xl border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-900/60"
              />
            </div>
          </section>
          {/* STATUS & TIMELINE */}
          <section className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 p-5">
            <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
              <span className="icon">
                schedule
              </span>
              {" Status & Timeline"}
            </h2>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="seg" id="statusSeg">
                <button type="button" data-val="Idea" className="on">
                  Idea
                </button>
                {" "}
                <button type="button" data-val="Prototype">
                  Prototype
                </button>
                {" "}
                <button type="button" data-val="In Development">
                  In Dev
                </button>
                {" "}
                <button type="button" data-val="Beta">
                  Beta
                </button>
                {" "}
                <button type="button" data-val="Launched">
                  Launched
                </button>
              </div>
              {" "}
              <input type="hidden" name="status" id="statusField" value="Idea" />
            </div>
            <div className="mt-4 grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm">
                  Start date
                </label>
                {" "}
                <input
                  type="date"
                  name="start_date"
                  placeholder="yyyy-mm-dd"
                  className="mt-1 w-full rounded-xl border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-900/60"
                />
              </div>
              <div>
                <label className="text-sm">
                  Expected end
                </label>
                {" "}
                <input
                  type="date"
                  name="end_date"
                  placeholder="yyyy-mm-dd"
                  className="mt-1 w-full rounded-xl border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-900/60"
                />
              </div>
              <div>
                <label className="text-sm">
                  Milestone
                </label>
                {" "}
                <input
                  id="milestoneInput"
                  placeholder="Key milestone (enter + Add)"
                  className="mt-1 w-full rounded-xl border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-900/60"
                />
              </div>
            </div>
            <div className="mt-3">
              <button
                type="button"
                id="addMilestone"
                className="rounded-xl border border-black/10 dark:border-white/10 px-4 py-2 hover:bg-black/5 dark:hover:bg-white/10"
              >
                Add milestone
              </button>
              {" "}
              <div id="milestoneList" className="mt-3 grid gap-2" />
            </div>
          </section>
          {/* LINKS & MEDIA */}
          <section className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 p-5">
            <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
              <span className="icon">
                link
              </span>
              {" Links & Media"}
            </h2>
            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm">
                  GitHub repo
                </label>
                {" "}
                <input
                  name="github"
                  placeholder="https://github.com/user/repo"
                  className="mt-1 w-full rounded-xl border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-900/60"
                />
              </div>
              <div>
                <label className="text-sm">
                  Live demo URL
                </label>
                {" "}
                <input
                  name="demo"
                  placeholder="https://demo.example.com"
                  className="mt-1 w-full rounded-xl border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-900/60"
                />
              </div>
              <div>
                <label className="text-sm">
                  Video URL
                </label>
                {" "}
                <input
                  name="video"
                  placeholder="https://youtu.be/..."
                  className="mt-1 w-full rounded-xl border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-900/60"
                />
              </div>
              <div>
                <label className="text-sm">
                  Docs / Notion
                </label>
                {" "}
                <input
                  name="docs"
                  placeholder="https://notion.so/..."
                  className="mt-1 w-full rounded-xl border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-900/60"
                />
              </div>
            </div>
            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm">
                  Cover image
                </p>
                <div id="coverDrop" className="dropzone">
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
                    <path d="M12 16V8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  {" "}
                  <p className="text-sm">
                    {"Drag & drop or click to upload"}
                  </p>
                  {" "}
                  <input type="file" name="cover" accept="image/*" className="hidden" />
                </div>
                <div id="coverPreviewBox" className="mt-3 hidden">
                  <img
                    id="coverPreview"
                    alt="Cover preview"
                    className="w-full max-h-48 rounded-xl object-cover"
                  />
                </div>
                <p className="text-xs text-black/60 dark:text-white/60 mt-1">
                  PNG/JPG up to 5MB
                </p>
              </div>
              <div>
                <p className="text-sm">
                  Gallery
                </p>
                <div id="galleryDrop" className="dropzone">
                  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
                    <path
                      d="M4 7h16M4 12h16M4 17h10"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  {" "}
                  <p className="text-sm">
                    Upload multiple images/videos
                  </p>
                  {" "}
                  <input type="file" name="gallery" multiple className="hidden" />
                </div>
                <p className="text-xs text-black/60 dark:text-white/60 mt-1">
                  Images/MP4 up to 50MB each
                </p>
              </div>
            </div>
          </section>
          {/* REQUEST FUNDING */}
          <section className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 p-5">
            <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
              <span className="icon">
                paid
              </span>
              {" Request Funding"}
            </h2>
            <div className="mt-4 grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm mb-2">
                  Stage
                </p>
                <div className="seg" id="fundSeg">
                  <button type="button" data-val="Bootstrapped" className="on">
                    Bootstrapped
                  </button>
                  {" "}
                  <button type="button" data-val="Grant">
                    Grant
                  </button>
                  {" "}
                  <button type="button" data-val="Pre‑seed">
                    Pre‑seed
                  </button>
                  {" "}
                  <button type="button" data-val="Seed">
                    Seed
                  </button>
                </div>
                {" "}
                <input type="hidden" name="fund_stage" id="fundField" value="Bootstrapped" />
              </div>
              <div>
                <label className="text-sm">
                  Budget / Ask (₹)
                </label>
                {" "}
                <input
                  name="fund_budget"
                  type="number"
                  min="0"
                  placeholder="₹"
                  className="mt-1 w-full rounded-xl border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-900/60"
                />
              </div>
              <div>
                <label className="text-sm">
                  Use of funds
                </label>
                {" "}
                <input
                  name="fund_use"
                  placeholder="Data, compute, hiring…"
                  className="mt-1 w-full rounded-xl border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-900/60"
                />
              </div>
            </div>
          </section>
          {/* TEAM & OPEN ROLES */}
          <section className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 p-5">
            <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
              <span className="icon">
                group
              </span>
              {" Team & Open Roles"}
            </h2>
            <div className="mt-4">
              <label className="text-sm">
                Current team (emails or names)
              </label>
              {" "}
              <input
                name="team"
                placeholder="alice@x.com, bob@x.com"
                className="mt-1 w-full rounded-xl border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-900/60"
              />
            </div>
            <div className="mt-4 grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm">
                  Roles needed
                </p>
                <div id="roleChips" className="mt-2 flex flex-wrap gap-2">
                  <button type="button" data-val="Frontend Engineer" className="chip text-sm">
                    Frontend
                  </button>
                  {" "}
                  <button type="button" data-val="Backend Engineer" className="chip text-sm">
                    Backend
                  </button>
                  {" "}
                  <button type="button" data-val="ML Engineer" className="chip text-sm">
                    ML Engineer
                  </button>
                  {" "}
                  <button type="button" data-val="Data Scientist" className="chip text-sm">
                    Data Scientist
                  </button>
                  {" "}
                  <button type="button" data-val="Designer" className="chip text-sm">
                    Designer
                  </button>
                  {" "}
                  <button type="button" data-val="PM" className="chip text-sm">
                    PM
                  </button>
                  {" "}
                  <button type="button" data-val="Researcher" className="chip text-sm">
                    Researcher
                  </button>
                  {" "}
                  <button type="button" data-val="DevOps" className="chip text-sm">
                    DevOps
                  </button>
                </div>
                {" "}
                <input type="hidden" name="roles" id="rolesField" />
              </div>
              <div>
                <p className="text-sm mb-2">
                  Compensation
                </p>
                <div className="seg" id="compSeg">
                  <button type="button" data-val="Volunteer" className="on">
                    Volunteer
                  </button>
                  {" "}
                  <button type="button" data-val="Stipend">
                    Stipend
                  </button>
                  {" "}
                  <button type="button" data-val="Paid">
                    Paid
                  </button>
                  {" "}
                  <button type="button" data-val="Paid + Equity">
                    Paid + Equity
                  </button>
                </div>
                {" "}
                <input type="hidden" name="compensation" id="compField" value="Volunteer" />
              </div>
              <div>
                <label className="text-sm">
                  Weekly hours
                </label>
                {" "}
                <input
                  name="hours"
                  placeholder="8‑12 hrs/week"
                  className="mt-1 w-full rounded-xl border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-900/60"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="text-sm">
                Role description / vacancy post
              </label>
              {" "}
              <textarea
                name="role_desc"
                rows={4}
                placeholder="Responsibilities, stack, outcomes…"
                className="mt-1 w-full rounded-xl border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-900/60"
              />
            </div>
          </section>
          {/* Spacer for sticky footer */}
          <div className="h-16" />
        </form>
      </main>
      {/* Sticky Submit Bar (glass) */}
      <footer className="fixed inset-x-0 bottom-0 z-40">
        <div className="container py-3">
          <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 p-3 flex flex-col md:flex-row gap-3 md:items-center md:justify-between shadow-soft">
            <div className="text-sm text-black/70 dark:text-white/70">
              Review your details before submitting.
            </div>
            <div className="flex gap-2">
              <button
                id="saveDraft"
                className="rounded-xl border border-black/10 dark:border-white/10 px-4 py-2 hover:bg-black/5 dark:hover:bg-white/10"
              >
                Save Draft
              </button>
              {" "}
              <button
                id="resetForm"
                className="rounded-xl border border-black/10 dark:border-white/10 px-4 py-2 hover:bg-black/5 dark:hover:bg-white/10"
              >
                Reset
              </button>
              {" "}
              <button
                id="submitBtn"
                className="rounded-xl bg-brand-600 text-white px-5 py-2 shadow-brand-lg hover:brightness-110"
              >
                Submit Project
              </button>
            </div>
          </div>
        </div>
      </footer>
      <script src="/_legacy/projects/project_post/script-02.js" />
    </LegacyPage>
  );
}
