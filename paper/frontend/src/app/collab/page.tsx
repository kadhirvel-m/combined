// Converted from ui/collab.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/collab/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "TuNe X — Collaboration",
  description: "Collaborate on an accepted project: chat, quick links, and coordination.",
};

export default function CollabPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"bg-ink-50 dark:bg-[#0a0d12] text-[#0d1117] dark:text-zinc-100"}}
    >
      {/* ── original <head> stylesheets & scripts, in order ── */}
      <link rel="stylesheet" href="assets/css/tailwind.css" />
      <script src="/_legacy/collab/script-01.js" />
      <script src="/config.js" />
      <link
        href={"https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@300;400;600&display=swap"}
        rel="stylesheet"
      />
      <link rel="stylesheet" href="/_legacy/collab/style-01.css" />
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
            <a href="login.html" className="hover:text-brand-600 dark:hover:text-brand-300" id="signInLink">
              Sign in
            </a>
          </div>
        </nav>
      </header>
      <main className="container py-8 md:py-12">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Collaboration
            </h1>
            <p className="text-sm opacity-70">
              Chat with your teammate after acceptance.
            </p>
          </div>
          <div className="text-sm">
            <a id="projectLink" className="text-brand-600 hover:underline" href="#">
              Open Project
            </a>
          </div>
        </div>
        <div id="status" className="text-sm mb-3" />
        <section className="grid lg:grid-cols-[1fr,320px] gap-4">
          <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 p-4 flex flex-col min-h-[60vh]">
            <div id="msgs" className="msglist flex-1 overflow-auto space-y-3 pr-2" />
            <form id="sendForm" className="mt-3 flex items-end gap-2">
              <textarea
                id="msgInput"
                className="flex-1 rounded-xl border border-black/10 dark:border-white/10 bg-white/90 dark:bg-zinc-900/60 p-3"
                rows={2}
                placeholder="Write a message…"
              />
              {" "}
              <button
                id="sendBtn"
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 text-white px-4 py-2 shadow-brand-lg"
              >
                <span className="icon">
                  send
                </span>
                Send
              </button>
            </form>
          </div>
          <aside className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 p-4 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <span className="icon">
                info
              </span>
              {" Details"}
            </h3>
            <div id="appMeta" className="text-sm opacity-80">
              —
            </div>
            <div className="h-px bg-black/10 dark:bg-white/10" />
            <div className="space-y-2">
              <a
                id="profileApplicant"
                href="#"
                className="inline-flex items-center gap-2 text-sm text-brand-600"
              >
                <span className="icon">
                  person
                </span>
                Applicant Profile
              </a>
              <br />
              {" "}
              <a id="profileOwner" href="#" className="inline-flex items-center gap-2 text-sm text-brand-600">
                <span className="icon">
                  workspace_premium
                </span>
                Owner Profile
              </a>
            </div>
          </aside>
        </section>
      </main>
      <script src="/_legacy/collab/script-02.js" />
    </LegacyPage>
  );
}
