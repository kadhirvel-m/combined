// Converted from ui/projects/project.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/projects/project/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Paper X — Project Details",
  description: "Explore project vision, team, milestones, funding, and collaboration opportunities on Paper X.",
};

export default function ProjectsProjectPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen font-sans antialiased text-neutral-900 dark:text-white bg-hero-light dark:bg-hero-dark transition-colors"}}
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
      <link rel="stylesheet" href="/_legacy/projects/project/style-01.css" />
      <script src="/_legacy/projects/project/script-01.js" />
      <script src="/config.js" />
      {/* ── original <body> ── */}
      {/* Announcement */}
      <div className="w-full text-xs text-neutral-700 dark:text-white/80 bg-brandlt-100/70 dark:bg-brand-700/20 backdrop-blur border-b border-black/5 dark:border-white/10">
        <div className="container flex items-center gap-2 py-2">
          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-brandlt-200 dark:bg-brand-500/20 ring-1 ring-brandlt-300 dark:ring-brand-500/40">
            Update
          </span>
          {" "}
          <p className="truncate">
            Project details layout refreshed for clarity and speed.
          </p>
          {" "}
          <span className="ml-auto">
            →
          </span>
        </div>
      </div>
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-brand-900/60 backdrop-blur supports-[backdrop-filter]:saturate-150 border-b border-black/5 dark:border-white/10 relative">
        <div className="container flex items-center justify-between py-4">
          <a href="../index.html" className="flex items-center gap-3" aria-label="Paper X Home">
            {" "}
            <img src="../assets/img/logo-light.svg" alt="Paper X" className="h-10 w-auto dark:hidden" />
            {" "}
            <img src="../assets/img/logo-dark.svg" alt="Paper X" className="h-10 w-auto hidden dark:block" />
            {" "}
          </a>
          {" "}
          <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-700 dark:text-white/85">
            <a className="hover:text-brandlt-900 dark:hover:text-white" href="../index.html">
              Home
            </a>
            {" "}
            <a className="hover:text-brandlt-900 dark:hover:text-white" href="../about.html">
              About
            </a>
            {" "}
            <button className="group inline-flex items-center gap-1 hover:text-brandlt-900 dark:hover:text-white transition">
              {"Products "}
              <span className="material-symbols-rounded text-base opacity-70 group-hover:opacity-100">
                expand_more
              </span>
            </button>
            {" "}
            <div className="relative" id="navProjectsWrap">
              <button
                type="button"
                id="navProjectsBtn"
                aria-haspopup="true"
                aria-expanded="false"
                className="group inline-flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              >
                <span className="material-symbols-rounded text-[18px] leading-none group-hover:scale-110 transition-transform">
                  hub
                </span>
                {" "}
                <span className="font-medium">
                  Project Portal
                </span>
                {" "}
                <span
                  className="material-symbols-rounded text-base leading-none transition-transform duration-200 group-data-[open=true]:rotate-180"
                  data-projects-caret=""
                >
                  expand_more
                </span>
              </button>
              {" "}
              <div
                id="navProjectsMenu"
                role="menu"
                aria-label="Project Portal"
                tabIndex={-1}
                className="invisible opacity-0 translate-y-1 absolute left-1/2 -translate-x-1/2 mt-2 w-72 rounded-2xl border border-black/10 dark:border-white/10 bg-white/95 dark:bg-brand-900/95 shadow-[0_8px_28px_-4px_rgba(30,30,47,0.35)] backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10 transition duration-150 ease-out data-[open=true]:visible data-[open=true]:opacity-100 data-[open=true]:translate-y-0"
              >
                <div className="p-3 pb-2 border-b border-black/5 dark:border-white/10">
                  <p className="text-[11px] uppercase tracking-wide font-semibold text-neutral-500 dark:text-white/40">
                    {"Manage "}
                  </p>
                </div>
                <ul className="py-1" data-menu-list="">
                  <li role="none">
                    <a
                      role="menuitem"
                      href="postings.html"
                      data-menu-item=""
                      className="flex items-start gap-3 px-4 py-2.5 text-sm hover:bg-black/5 dark:hover:bg-white/10 focus:bg-black/5 dark:focus:bg-white/10 outline-none rounded-xl group"
                    >
                      <span className="material-symbols-rounded text-[20px] text-brand-500 dark:text-white/80 group-hover:scale-110 transition-transform">
                        folder_open
                      </span>
                      <span className="flex flex-col">
                        <span className="font-medium">
                          Project Postings
                        </span>
                        <span className="text-[11px] text-neutral-500 dark:text-white/40">
                          Browse active listings
                        </span>
                      </span>
                    </a>
                  </li>
                  <li role="none">
                    <a
                      role="menuitem"
                      href="project_post.html"
                      data-menu-item=""
                      className="flex items-start gap-3 px-4 py-2.5 text-sm hover:bg-black/5 dark:hover:bg-white/10 focus:bg-black/5 dark:focus:bg-white/10 outline-none rounded-xl group"
                    >
                      <span className="material-symbols-rounded text-[20px] text-brand-500 dark:text-white/80 group-hover:scale-110 transition-transform">
                        add_circle
                      </span>
                      <span className="flex flex-col">
                        <span className="font-medium">
                          Create Project
                        </span>
                        <span className="text-[11px] text-neutral-500 dark:text-white/40">
                          Publish a new opportunity
                        </span>
                      </span>
                    </a>
                  </li>
                  <li role="none">
                    <a
                      role="menuitem"
                      href="incoming_requests.html"
                      data-menu-item=""
                      className="flex items-start gap-3 px-4 py-2.5 text-sm hover:bg-black/5 dark:hover:bg-white/10 focus:bg-black/5 dark:focus:bg-white/10 outline-none rounded-xl group"
                    >
                      <span className="material-symbols-rounded text-[20px] text-brand-500 dark:text-white/80 group-hover:scale-110 transition-transform">
                        inbox
                      </span>
                      <span className="flex flex-col">
                        <span className="font-medium">
                          Incoming Requests
                        </span>
                        <span className="text-[11px] text-neutral-500 dark:text-white/40">
                          Review collaborator joins
                        </span>
                      </span>
                    </a>
                  </li>
                  <li role="none">
                    <a
                      role="menuitem"
                      href="my_applications.html"
                      data-menu-item=""
                      className="flex items-start gap-3 px-4 py-2.5 text-sm hover:bg-black/5 dark:hover:bg-white/10 focus:bg-black/5 dark:focus:bg-white/10 outline-none rounded-xl group"
                    >
                      <span className="material-symbols-rounded text-[20px] text-brand-500 dark:text-white/80 group-hover:scale-110 transition-transform">
                        assignment_ind
                      </span>
                      <span className="flex flex-col">
                        <span className="font-medium">
                          My Applications
                        </span>
                        <span className="text-[11px] text-neutral-500 dark:text-white/40">
                          Track application status
                        </span>
                      </span>
                    </a>
                  </li>
                  <li role="none">
                    <a
                      role="menuitem"
                      href="skill-test.html"
                      data-menu-item=""
                      className="flex items-start gap-3 px-4 py-2.5 text-sm hover:bg-black/5 dark:hover:bg-white/10 focus:bg-black/5 dark:focus:bg-white/10 outline-none rounded-xl group"
                    >
                      <span className="material-symbols-rounded text-[20px] text-brand-500 dark:text-white/80 group-hover:scale-110 transition-transform">
                        verified
                      </span>
                      <span className="flex flex-col">
                        <span className="font-medium">
                          Skill Test Portal
                        </span>
                        <span className="text-[11px] text-neutral-500 dark:text-white/40">
                          {"Assess & verify skills"}
                        </span>
                      </span>
                    </a>
                  </li>
                </ul>
                <div className="px-4 py-3 border-t border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 rounded-b-2xl flex items-center gap-3 text-xs text-neutral-500 dark:text-white/40">
                  <span className="material-symbols-rounded text-base">
                    tips_and_updates
                  </span>
                  <span>
                    Boost collaboration with verified contributors.
                  </span>
                </div>
              </div>
            </div>
            {" "}
            <a className="hover:text-brandlt-900 dark:hover:text-white" href="../contact.html">
              Contact
            </a>
            {" "}
            <a className="hover:text-brandlt-900 dark:hover:text-white" href="../help.html">
              Help
            </a>
            {" "}
            <a className="hover:text-brandlt-900 dark:hover:text-white" href="../collage/clg_info.html">
              Collages
            </a>
          </nav>
          <div className="hidden md:flex items-center gap-2">
            <button
              id="themeToggle"
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
            {" "}
            <a
              href="../login.html"
              className="text-sm text-neutral-700 dark:text-white/85 hover:text-brandlt-900 dark:hover:text-white px-3 py-2 rounded-full"
            >
              Log in
            </a>
            {" "}
            <a
              href="../signup.html"
              className="inline-flex items-center justify-center rounded-full bg-brand-500 text-white text-sm font-semibold px-4 py-2.5 hover:shadow-glow transition"
            >
              Sign up
            </a>
            {" "}
            <a
              id="navProfile"
              href="../profile.html"
              title="Profile"
              className="hidden items-center justify-center w-10 h-10 rounded-full overflow-hidden border border-black/10 dark:border-white/10 bg-white/90 dark:bg-brand-900/60"
            >
              <img id="navProfileImg" alt="Profile" className="w-full h-full object-cover hidden" />
              <span id="navProfileInitial" className="text-xs font-semibold">
                ME
              </span>
            </a>
            {" "}
            <button
              id="signOutBtn"
              type="button"
              title="Sign out"
              aria-label="Sign out"
              className="hidden items-center gap-2 rounded-full border border-black/10 dark:border-white/15 px-3 py-1.5 text-sm text-neutral-700 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              <span className="material-symbols-rounded text-base">
                logout
              </span>
              <span>
                Sign out
              </span>
            </button>
          </div>
          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              data-theme-toggle=""
              aria-label="Toggle theme"
              className="inline-flex items-center justify-center size-10 rounded-full ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              <span className="material-symbols-rounded">
                dark_mode
              </span>
            </button>
            {" "}
            <button
              id="mobileNavToggle"
              type="button"
              aria-expanded="false"
              aria-controls="mobileNavPanel"
              className="inline-flex items-center justify-center size-10 rounded-full ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              <span className="sr-only">
                Toggle navigation
              </span>
              <span className="material-symbols-rounded" data-icon="">
                menu
              </span>
            </button>
          </div>
        </div>
      </header>
      <div
        id="mobileNavBackdrop"
        aria-hidden="true"
        className="md:hidden fixed inset-0 z-40 bg-black/60 dark:bg-black/80 backdrop-blur-sm hidden"
      />
      <nav
        id="mobileNavPanel"
        aria-hidden="true"
        className="md:hidden fixed inset-x-4 top-24 z-50 hidden flex flex-col gap-5 max-h-[calc(100vh-6.5rem)] overflow-y-auto rounded-3xl border border-black/10 dark:border-white/10 bg-white/95 dark:bg-brand-900/95 shadow-card backdrop-blur supports-[backdrop-filter]:backdrop-blur-xl p-6"
      >
        <div className="flex flex-col gap-2 text-sm text-neutral-700 dark:text-white/80">
          <a
            href="#"
            data-close-mobile-nav=""
            className="flex items-center justify-between rounded-xl px-3 py-2 bg-white/70 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10"
          >
            <span>
              Products
            </span>
            <span className="material-symbols-rounded text-base opacity-70">
              expand_more
            </span>
          </a>
          {" "}
          <a
            href="../about.html"
            data-close-mobile-nav=""
            className="rounded-xl px-3 py-2 hover:bg-brandlt-100/70 hover:dark:bg-brand-700/20 transition"
          >
            About
          </a>
          {" "}
          <a
            href="#"
            data-close-mobile-nav=""
            className="flex items-center justify-between rounded-xl px-3 py-2 bg-white/70 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10"
          >
            <span>
              Developers
            </span>
            <span className="material-symbols-rounded text-base opacity-70">
              expand_more
            </span>
          </a>
          {" "}
          <a
            href="#"
            data-close-mobile-nav=""
            className="flex items-center justify-between rounded-xl px-3 py-2 bg-white/70 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10"
          >
            <span>
              Partners
            </span>
            <span className="material-symbols-rounded text-base opacity-70">
              expand_more
            </span>
          </a>
          {" "}
          <a
            href="../contact.html"
            data-close-mobile-nav=""
            className="rounded-xl px-3 py-2 hover:bg-brandlt-100/70 hover:dark:bg-brand-700/20 transition"
          >
            Contact
          </a>
          {" "}
          <a
            href="../help.html"
            data-close-mobile-nav=""
            className="rounded-xl px-3 py-2 hover:bg-brandlt-100/70 hover:dark:bg-brand-700/20 transition"
          >
            Help
          </a>
          {" "}
          <a
            href="../index.html#pricing"
            data-close-mobile-nav=""
            className="rounded-xl px-3 py-2 hover:bg-brandlt-100/70 hover:dark:bg-brand-700/20 transition"
          >
            Pricing
          </a>
        </div>
        <div className="flex flex-col gap-3 border-t border-black/5 dark:border-white/10 pt-4">
          <a
            href="../login.html"
            data-close-mobile-nav=""
            className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium ring-1 ring-black/10 dark:ring-white/15 text-neutral-700 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10 transition"
          >
            Log in
          </a>
          {" "}
          <a
            href="../signup.html"
            data-close-mobile-nav=""
            className="inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#9E4B8A] via-[#B06AB3] to-[#FF7FD1] shadow-[0_4px_18px_-6px_rgba(158,75,138,0.6)] hover:shadow-[0_6px_24px_-8px_rgba(158,75,138,0.7)] transition"
          >
            Sign up
          </a>
          {" "}
          <a
            id="navProfileMobile"
            href="../profile.html"
            data-close-mobile-nav=""
            className="hidden inline-flex items-center gap-2 rounded-xl border border-black/10 dark:border-white/15 px-4 py-2 text-sm text-neutral-700 dark:text-white/80 bg-white/70 dark:bg-brand-900/60"
          >
            <span className="material-symbols-rounded text-base">
              account_circle
            </span>
            <span data-profile-name="">
              My profile
            </span>
          </a>
          {" "}
          <button
            id="signOutBtnMobile"
            type="button"
            className="hidden inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/15 px-4 py-2 text-sm text-neutral-700 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10 transition"
          >
            <span className="material-symbols-rounded text-base">
              logout
            </span>
            <span>
              Sign out
            </span>
          </button>
        </div>
      </nav>
      <main className="relative pb-24">
        <div id="appStatusBanner" className="hidden" />
        <section className="relative">
          <div className="container max-w-6xl py-10 md:py-14">
            <nav
              className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-white/50"
              id="breadcrumb"
            >
              <a
                href="../index.html#discover"
                className="inline-flex items-center gap-1 hover:text-brand-500 dark:hover:text-white"
              >
                <span className="material-symbols-rounded text-base">
                  arrow_back
                </span>
                {" Back"}
              </a>
              {" "}
              <span className="select-none">
                /
              </span>
              {" "}
              <span id="crumbTitle" className="truncate max-w-[60%]" />
            </nav>
            <div id="projectDetails" className="mt-6 space-y-8">
              {/* skeleton */}
              <div className="rounded-3xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur overflow-hidden animate-pulse h-60" />
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse">
                <div className="lg:col-span-8 space-y-6">
                  <div className="h-40 rounded-2xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5" />
                  <div className="h-40 rounded-2xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5" />
                </div>
                <div className="lg:col-span-4 space-y-6">
                  <div className="h-44 rounded-2xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-black/5 dark:border-white/10 py-10">
        <div className="container flex flex-col gap-3 text-sm text-neutral-500 dark:text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {"© "}
            <span id="year" />
            {" Paper X · Project Portal."}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <a href="../about.html" className="hover:text-brand-500 dark:hover:text-white transition">
              About
            </a>
            {" "}
            <a href="../help.html" className="hover:text-brand-500 dark:hover:text-white transition">
              Help centre
            </a>
            {" "}
            <a href="../contact.html" className="hover:text-brand-500 dark:hover:text-white transition">
              Contact
            </a>
          </div>
        </div>
      </footer>
      <script src="/_legacy/projects/project/script-02.js" />
      <script src="/_legacy/projects/project/script-03.js" />
    </LegacyPage>
  );
}
