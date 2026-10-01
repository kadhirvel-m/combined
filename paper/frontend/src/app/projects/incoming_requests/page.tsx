// Converted from ui/projects/incoming_requests.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/projects/incoming_requests/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "TuNe X — Incoming Requests",
  description: "Review incoming requests from applicants across your projects.",
};

export default function ProjectsIncomingRequestsPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"bg-ink-50 dark:bg-[#0a0d12] text-[#0d1117] dark:text-zinc-100"}}
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <link rel="stylesheet" href="../assets/css/tailwind.css" />
      <script src="/_legacy/projects/incoming_requests/script-01.js" />
      <script src="/config.js" />
      <link
        href={"https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@300;400;600&display=swap"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="/_legacy/projects/incoming_requests/style-01.css" />
      {/* ── original <body> ── */}
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
            <a href="profile.html" className="hover:text-brand-600 dark:hover:text-brand-300">
              Profile
            </a>
            {" "}
            <a href="project_post.html" className="hover:text-brand-600 dark:hover:text-brand-300">
              Create Project
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
              className="rounded-xl border border-black/10 dark:border-white/10 px-3 py-2"
              data-px=""
            >
              <span className="icon">
                dark_mode
              </span>
            </button>
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
            <a href="../login.html" className="hover:text-brand-600 dark:hover:text-brand-300" id="signInLink">
              Sign in
            </a>
          </div>
        </nav>
      </header>
      <main className="container py-10 md:py-14 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Incoming Requests
          </h1>
          {" "}
          <a className="text-sm text-brand-600 hover:underline" href="profile.html">
            Back to Profile
          </a>
        </div>
        <div id="status" className="text-sm" />
        <section id="cards" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" />
      </main>
      <script src="/_legacy/projects/incoming_requests/script-02.js" />
    </LegacyPage>
  );
}
