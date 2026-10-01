// Converted from ui/indexII.html by scripts/convert-ui. Inline scripts/styles live in public/_legacy/indexII/.
// The markup is rendered once on the server and then driven by the original scripts (see LegacyPage),
// so plain <script>/<link>/<img> tags are intentional here.
/* eslint-disable @next/next/no-sync-scripts, @next/next/no-css-tags, @next/next/no-img-element, @next/next/no-page-custom-font, @next/next/google-font-display, jsx-a11y/alt-text */
import type { Metadata } from "next";
import { LegacyPage } from "@/components/legacy/LegacyPage";

export const metadata: Metadata = {
  title: "Paper X — Cloud Landing",
};

export default function IndexIIPage() {
  return (
    <LegacyPage
      html={{"lang":"en","class":"scroll-smooth"}}
      body={{"class":"min-h-screen font-sans antialiased text-neutral-900 dark:text-white bg-hero-light transition-colors"}}
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
      <link rel="stylesheet" href="assets/css/tailwind.css" />
      <link rel="stylesheet" href="/_legacy/indexII/style-01.css" />
      <script src="/_legacy/indexII/script-01.js" />
      <script src="/config.js" />
      {/* ── original <body> ── */}
      {/* Top announcement */}
      <div className="w-full text-xs text-neutral-700 dark:text-white/80 bg-brandlt-100/70 dark:bg-brand-700/20 backdrop-blur border-b border-black/5 dark:border-white/10">
        <div className="container flex items-center gap-2 py-2">
          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-brandlt-200 dark:bg-brand-500/20 ring-1 ring-brandlt-300 dark:ring-brand-500/40">
            New
          </span>
          {" "}
          <p className="truncate">
            Gateway API on Kubernetes is here, enabling next-gen traffic management.
          </p>
          {" "}
          <span className="ml-auto">
            →
          </span>
        </div>
      </div>
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-brand-900/60 backdrop-blur supports-[backdrop-filter]:saturate-150 border-b border-black/5 dark:border-white/10 relative">
        <div className="container flex items-center justify-between py-4">
          <a href="index.html" className="flex items-center gap-3" aria-label="Paper X Home">
            {" "}
            <img src="../assets/img/logo-light.svg" alt="Paper X" className="h-10 w-auto dark:hidden" />
            {" "}
            <img src="../assets/img/logo-dark.svg" alt="Paper X" className="h-10 w-auto hidden dark:block" />
            {" "}
          </a>
          {" "}
          <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-700 dark:text-white/85">
            <a className="hover:text-brandlt-900 dark:hover:text-white" href="index.html">
              Home
            </a>
            {" "}
            <a className="hover:text-brandlt-900 dark:hover:text-white" href="about.html">
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
            {/* Project Portal dropdown (replaces Solutions) */}
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
                    {" Manage"}
                  </p>
                </div>
                <ul className="py-1" data-menu-list="">
                  <li role="none">
                    <a
                      role="menuitem"
                      href="projects/postings.html"
                      data-menu-item=""
                      className="flex items-start gap-3 px-4 py-2.5 text-sm hover:bg-black/5 dark:hover:bg-white/10 focus:bg-black/5 dark:focus:bg-white/10 outline-none rounded-xl group"
                    >
                      {" "}
                      <span className="material-symbols-rounded text-[20px] text-brand-500 dark:text-white/80 group-hover:scale-110 transition-transform">
                        folder_open
                      </span>
                      {" "}
                      <span className="flex flex-col">
                        {" "}
                        <span className="font-medium">
                          Project Postings
                        </span>
                        {" "}
                        <span className="text-[11px] text-neutral-500 dark:text-white/40">
                          Browse active listings
                        </span>
                        {" "}
                      </span>
                      {" "}
                    </a>
                  </li>
                  <li role="none">
                    <a
                      role="menuitem"
                      href="projects/project_post.html"
                      data-menu-item=""
                      className="flex items-start gap-3 px-4 py-2.5 text-sm hover:bg-black/5 dark:hover:bg-white/10 focus:bg-black/5 dark:focus:bg-white/10 outline-none rounded-xl group"
                    >
                      {" "}
                      <span className="material-symbols-rounded text-[20px] text-brand-500 dark:text-white/80 group-hover:scale-110 transition-transform">
                        add_circle
                      </span>
                      {" "}
                      <span className="flex flex-col">
                        {" "}
                        <span className="font-medium">
                          Create Project
                        </span>
                        {" "}
                        <span className="text-[11px] text-neutral-500 dark:text-white/40">
                          Publish a new opportunity
                        </span>
                        {" "}
                      </span>
                      {" "}
                    </a>
                  </li>
                  <li role="none">
                    <a
                      role="menuitem"
                      href="projects/incoming_requests.html"
                      data-menu-item=""
                      className="flex items-start gap-3 px-4 py-2.5 text-sm hover:bg-black/5 dark:hover:bg-white/10 focus:bg-black/5 dark:focus:bg-white/10 outline-none rounded-xl group"
                    >
                      {" "}
                      <span className="material-symbols-rounded text-[20px] text-brand-500 dark:text-white/80 group-hover:scale-110 transition-transform">
                        inbox
                      </span>
                      {" "}
                      <span className="flex flex-col">
                        {" "}
                        <span className="font-medium">
                          Incoming Requests
                        </span>
                        {" "}
                        <span className="text-[11px] text-neutral-500 dark:text-white/40">
                          Review collaborator joins
                        </span>
                        {" "}
                      </span>
                      {" "}
                    </a>
                  </li>
                  <li role="none">
                    <a
                      role="menuitem"
                      href="projects/my_applications.html"
                      data-menu-item=""
                      className="flex items-start gap-3 px-4 py-2.5 text-sm hover:bg-black/5 dark:hover:bg-white/10 focus:bg-black/5 dark:focus:bg-white/10 outline-none rounded-xl group"
                    >
                      {" "}
                      <span className="material-symbols-rounded text-[20px] text-brand-500 dark:text-white/80 group-hover:scale-110 transition-transform">
                        assignment_ind
                      </span>
                      {" "}
                      <span className="flex flex-col">
                        {" "}
                        <span className="font-medium">
                          My Applications
                        </span>
                        {" "}
                        <span className="text-[11px] text-neutral-500 dark:text-white/40">
                          Track application status
                        </span>
                        {" "}
                      </span>
                      {" "}
                    </a>
                  </li>
                  <li role="none">
                    <a
                      role="menuitem"
                      href="projects/skill-test.html"
                      data-menu-item=""
                      className="flex items-start gap-3 px-4 py-2.5 text-sm hover:bg-black/5 dark:hover:bg-white/10 focus:bg-black/5 dark:focus:bg-white/10 outline-none rounded-xl group"
                    >
                      {" "}
                      <span className="material-symbols-rounded text-[20px] text-brand-500 dark:text-white/80 group-hover:scale-110 transition-transform">
                        verified
                      </span>
                      {" "}
                      <span className="flex flex-col">
                        {" "}
                        <span className="font-medium">
                          Skill Test Portal
                        </span>
                        {" "}
                        <span className="text-[11px] text-neutral-500 dark:text-white/40">
                          {"Assess & verify skills"}
                        </span>
                        {" "}
                      </span>
                      {" "}
                    </a>
                  </li>
                </ul>
                <div className="px-4 py-3 border-t border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/5 rounded-b-2xl flex items-center gap-3 text-xs text-neutral-500 dark:text-white/40">
                  <span className="material-symbols-rounded text-base">
                    tips_and_updates
                  </span>
                  {" "}
                  <span>
                    Boost collaboration with verified contributors.
                  </span>
                </div>
              </div>
            </div>
            {" "}
            <a className="hover:text-brandlt-900 dark:hover:text-white" href="contact.html">
              Contact
            </a>
            {" "}
            <a className="hover:text-brandlt-900 dark:hover:text-white" href="help.html">
              Help
            </a>
            {" "}
            <a className="hover:text-brandlt-900 dark:hover:text-white" href="collage/clg_info.html">
              Collages
            </a>
          </nav>
          <div className="hidden md:flex items-center gap-2">
            <button
              id="themeToggle"
              data-theme-toggle=""
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg:white/5"
              aria-label="Toggle theme"
            >
              <span className="material-symbols-rounded">
                dark_mode
              </span>
              {" "}
              <span className="hidden sm:block">
                Theme
              </span>
            </button>
            {" "}
            {/* Updated links to actual auth pages */}
            <a
              href="login.html"
              className="text-sm text-neutral-700 dark:text-white/85 hover:text-brandlt-900 dark:hover:text-white px-3 py-2 rounded-full"
            >
              Log in
            </a>
            {" "}
            <a
              href="signup.html"
              className="inline-flex items-center justify-center rounded-full bg-brand-500 text-white text-sm font-semibold px-4 py-2.5 hover:shadow-glow transition"
            >
              Sign up
            </a>
            {" "}
            <a
              id="navProfile"
              href="profile.html"
              title="Profile"
              className="hidden items-center justify-center w-10 h-10 rounded-full overflow-hidden border border-black/10 dark:border-white/10 bg-white/90 dark:bg-brand-900/60"
            >
              {" "}
              <img id="navProfileImg" alt="Profile" className="w-full h-full object-cover hidden" />
              {" "}
              <span id="navProfileInitial" className="text-xs font-semibold">
                ME
              </span>
              {" "}
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
              {" "}
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
              className="inline-flex items-center justify-center size-10 rounded-full ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg:white/5 transition"
            >
              <span className="sr-only">
                Toggle navigation
              </span>
              {" "}
              <span className="material-symbols-rounded" data-icon="">
                menu
              </span>
            </button>
          </div>
        </div>
      </header>
      <script src="/_legacy/indexII/script-02.js" />
      {/* Mobile navigation (drawer) */}
      <div
        id="mobileNavBackdrop"
        aria-hidden="true"
        className="md:hidden fixed inset-0 z-40 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
      />
      <nav
        id="mobileNavPanel"
        aria-hidden="true"
        className="md:hidden fixed inset-x-4 top-24 z-50 flex flex-col gap-5 max-h-[calc(100vh-6.5rem)] overflow-y-auto rounded-3xl border border-black/10 dark:border-white/10 bg-white/95 dark:bg-brand-900/95 shadow-card backdrop-blur supports-[backdrop-filter]:backdrop-blur-xl p-6"
      >
        <div className="flex flex-col gap-2 text-sm text-neutral-700 dark:text-white/80">
          <a
            href="#"
            data-close-mobile-nav=""
            className="flex items-center justify-between rounded-xl px-3 py-2 bg-white/70 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10"
          >
            {" "}
            <span>
              Products
            </span>
            {" "}
            <span className="material-symbols-rounded text-base opacity-70">
              expand_more
            </span>
            {" "}
          </a>
          {" "}
          <a
            href="about.html"
            data-close-mobile-nav=""
            className="rounded-xl px-3 py-2 hover:bg-brandlt-100/70 hover:dark:bg-brand-700/20 transition"
          >
            {" About "}
          </a>
          {" "}
          <a
            href="#"
            data-close-mobile-nav=""
            className="flex items-center justify-between rounded-xl px-3 py-2 bg-white/70 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10"
          >
            {" "}
            <span>
              Developers
            </span>
            {" "}
            <span className="material-symbols-rounded text-base opacity-70">
              expand_more
            </span>
            {" "}
          </a>
          {" "}
          <a
            href="#"
            data-close-mobile-nav=""
            className="flex items-center justify-between rounded-xl px-3 py-2 bg-white/70 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10"
          >
            {" "}
            <span>
              Partners
            </span>
            {" "}
            <span className="material-symbols-rounded text-base opacity-70">
              expand_more
            </span>
            {" "}
          </a>
          {" "}
          <a
            href="contact.html"
            data-close-mobile-nav=""
            className="rounded-xl px-3 py-2 hover:bg-brandlt-100/70 hover:dark:bg-brand-700/20 transition"
          >
            {" Contact "}
          </a>
          {" "}
          <a
            href="help.html"
            data-close-mobile-nav=""
            className="rounded-xl px-3 py-2 hover:bg-brandlt-100/70 hover:dark:bg-brand-700/20 transition"
          >
            {" Help "}
          </a>
          {" "}
          <a
            href="#pricing"
            data-close-mobile-nav=""
            className="rounded-xl px-3 py-2 hover:bg-brandlt-100/70 hover:dark:bg-brand-700/20 transition"
          >
            {" Pricing "}
          </a>
        </div>
        <div className="flex flex-col gap-3 border-t border-black/5 dark:border-white/10 pt-4">
          <a
            href="login.html"
            data-close-mobile-nav=""
            className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium ring-1 ring-black/10 dark:ring-white/15 text-neutral-700 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10 transition"
          >
            {" Log in "}
          </a>
          {" "}
          <a
            href="signup.html"
            data-close-mobile-nav=""
            className="inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#9E4B8A] via-[#B06AB3] to-[#FF7FD1] shadow-[0_4px_18px_-6px_rgba(158,75,138,0.6)] hover:shadow-[0_6px_24px_-8px_rgba(158,75,138,0.7)] transition"
          >
            {" Sign up "}
          </a>
          {" "}
          <a
            id="navProfileMobile"
            href="profile.html"
            data-close-mobile-nav=""
            className="hidden inline-flex items-center gap-2 rounded-xl border border-black/10 dark:border-white/15 px-4 py-2 text-sm text-neutral-700 dark:text-white/80 bg-white/70 dark:bg-brand-900/60"
          >
            {" "}
            <span className="material-symbols-rounded text-base">
              account_circle
            </span>
            {" "}
            <span data-profile-name="">
              My profile
            </span>
            {" "}
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
            {" "}
            <span>
              Sign out
            </span>
          </button>
        </div>
      </nav>
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* decorative orbs */}
        <div className="pointer-events-none absolute -top-24 -right-24 size-[420px] rounded-full bg-brand-500/20 blur-3xl dark:blur-[90px]" />
        <div className="pointer-events-none absolute top-24 -left-24 size-[360px] rounded-full bg-brand-700/20 blur-3xl dark:blur-[90px]" />
        <div className="container max-w-6xl text-center py-16 md:py-24">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mx-auto max-w-5xl leading-[1.08] gradient-hero-text">
            {" One platform to simplify your academic journey. "}
          </h1>
          <p className="mt-5 text-lg md:text-xl text-neutral-600 dark:text-white/75 max-w-3xl mx-auto">
            {" Learn, revise, and master concepts with an elegant experience. "}
          </p>
          {/* CTA row */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Email */}
            <a
              href="#"
              className="inline-flex items-center gap-3 rounded-full bg-[#25D366] text-white px-6 py-3 text-sm font-semibold hover:shadow-glow ring-1 ring-black/10 dark:ring-white/15 transition dark:bg-[#1F9E58] dark:text-[#E9FFE9] dark:hover:bg-[#26C96C]"
            >
              {" "}
              <svg aria-hidden="true" className="size-5" viewBox="0 0 32 32" fill="currentColor">
                <path d="M16.027 2.003c-7.802 0-14.139 6.336-14.139 14.139 0 2.493.65 4.918 1.887 7.051l-1.994 7.296 7.478-1.961c2.066 1.13 4.395 1.729 6.768 1.729h.001c7.802 0 14.139-6.336 14.139-14.139 0-3.779-1.472-7.332-4.144-10.004a14.094 14.094 0 0 0-10.996-4.111zm0 25.865c-2.135 0-4.217-.572-6.03-1.656l-.433-.256-4.44 1.165 1.184-4.338-.282-.445a11.877 11.877 0 0 1-1.838-6.378c0-6.566 5.345-11.911 11.911-11.911 3.182 0 6.169 1.24 8.414 3.486a11.84 11.84 0 0 1 3.497 8.426c0 6.566-5.345 11.911-11.911 11.911zm6.44-8.905c-.352-.176-2.085-1.029-2.408-1.147-.323-.118-.559-.176-.794.176-.235.352-.911 1.147-1.117 1.382-.206.235-.411.264-.764.088-.352-.176-1.486-.547-2.832-1.743-1.046-.934-1.751-2.088-1.957-2.44-.206-.352-.022-.542.154-.718.158-.157.352-.411.529-.617.176-.206.235-.352.352-.587.117-.235.059-.441-.03-.617-.088-.176-.794-1.912-1.088-2.617-.286-.688-.578-.594-.794-.605-.206-.01-.441-.012-.676-.012s-.617.088-.941.441c-.323.352-1.235 1.205-1.235 2.941s1.265 3.422 1.441 3.656c.176.235 2.493 3.809 6.04 5.338.844.363 1.502.58 2.016.743.846.27 1.614.232 2.223.141.679-.101 2.085-.853 2.378-1.676.293-.823.293-1.528.205-1.676-.088-.147-.323-.235-.676-.411z" />
              </svg>
              {" Sign up with WhatsApp "}
            </a>
            {" "}
            {/* Google (exact multi-color SVG) */}
            <a
              href="#"
              className="inline-flex items-center gap-3 rounded-full bg-white text-brand-900 px-6 py-3 text-sm font-semibold hover:shadow-glow ring-1 ring-black/10 transition dark:bg-white/10 dark:text-white dark:ring-white/15 dark:hover:bg-white/20"
            >
              {" "}
              <svg aria-hidden="true" className="size-5" viewBox="0 0 48 48">
                <path
                  fill="#FFC107"
                  d="M43.611 20.083h-1.611V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.153 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"
                />
                {" "}
                <path
                  fill="#FF3D00"
                  d="M6.306 14.691l6.571 4.817C14.41 16.379 18.839 12 24 12c3.059 0 5.842 1.153 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 15.317 4 8.068 9.337 6.306 14.691z"
                />
                {" "}
                <path
                  fill="#4CAF50"
                  d="M24 44c5.159 0 9.86-1.97 13.4-5.185l-6.19-5.239C29.142 35.664 26.708 36.5 24 36.5c-5.203 0-9.622-3.321-11.282-7.957l-6.503 5.01C8.047 39.297 15.48 44 24 44z"
                />
                {" "}
                <path
                  fill="#1976D2"
                  d="M43.611 20.083H42V20H24v8h11.303c-.79 2.231-2.255 4.133-4.093 5.565.001-.001 6.19 5.239 6.19 5.239l.431.316C40.278 35.938 44 30.5 44 24c0-1.341-.138-2.651-.389-3.917z"
                />
              </svg>
              {" Sign up with Google "}
            </a>
            {" "}
            {/* LinkedIn (official mark) */}
            <a
              href="#"
              className="inline-flex items-center gap-3 rounded-full bg-[#0A66C2] text-white px-6 py-3 text-sm font-semibold hover:shadow-glow ring-1 ring-black/10 dark:ring-white/15 transition dark:bg-[#084B94] dark:text-[#E6F1FF] dark:hover:bg-[#0B5FB5]"
            >
              {" "}
              <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.137 1.445-2.137 2.939v5.667H9.351V9h3.414v1.561h.049c.476-.9 1.637-1.852 3.37-1.852 3.601 0 4.267 2.37 4.267 5.456v6.287zM5.337 7.433c-1.144 0-2.069-.927-2.069-2.071 0-1.144.925-2.07 2.069-2.07 1.145 0 2.071.926 2.071 2.07 0 1.144-.926 2.071-2.071 2.071zM7.119 20.452H3.554V9h3.565v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.226.792 24 1.771 24h20.451C23.2 24 24 23.226 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
              </svg>
              {" Sign up with LinkedIn "}
            </a>
          </div>
          {/* Card visual */}
          <div className="mt-14 md:mt-20">
            {/* Hero Inline Video (added) */}
            <div className="mx-auto max-w-5xl rounded-3xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-brand-900/40 backdrop-blur overflow-hidden shadow-soft dark:shadow-glow">
              <div className="relative group">
                <video
                  className="w-full h-full aspect-[16/9] object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  poster="../assets/img/img1.png"
                >
                  <source src="../assets/video/hero.mp4" type="video/mp4" />
                  {" Your browser does not support the video tag. "}
                </video>
                {" "}
                {/* Optional overlay gradient for readability */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-black/0 to-black/10 dark:from-black/50" />
                {/* Optional caption */}
                <div className="absolute bottom-3 right-4 text-[10px] tracking-wide uppercase font-medium text-white/70 backdrop-blur-sm bg-black/30 px-2 py-1 rounded-full ring-1 ring-white/20">
                  {" Product Preview"}
                </div>
              </div>
            </div>
            {/* End Hero Inline Video */}
          </div>
        </div>
      </section>
      {/* Scrolling Logos */}
      <section className="py-12 border-y border-black/5 dark:border-white/10">
        <div className="container">
          <p className="text-xs uppercase tracking-wider text-neutral-500 dark:text-white/50 mb-6 text-center">
            Learning resources integration
          </p>
          <div
            className="logo-ticker-viewport relative logo-ticker-mask group"
            id="logoTicker"
            aria-label="Scrolling list of resource logos"
          >
            <div className="logo-track" id="logoTrack" role="list">
              {/* Single logical set of logos (will be looped in JS) */}
              <div role="listitem" className="flex items-center gap-3 shrink-0">
                <div className="size-12 rounded-xl bg-white dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10 grid place-content-center p-1">
                  <img
                    src="https://media.geeksforgeeks.org/wp-content/uploads/gfg_200X200.png"
                    alt="GeeksforGeeks"
                    className="h-8 w-auto object-contain"
                    loading="lazy"
                  />
                </div>
                {" "}
                <span className="text-sm font-medium text-neutral-600 dark:text-white/70">
                  GeeksforGeeks
                </span>
              </div>
              <div role="listitem" className="flex items-center gap-3 shrink-0">
                <div className="size-12 rounded-xl bg-white dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10 grid place-content-center p-1">
                  <img
                    src="https://play-lh.googleusercontent.com/F10OOHNkeNbOf5x9DYpoihAIkLRlSMxCsPHyCErXgm0oM2gZtJwVymJIZoN59v4JJWBZ"
                    alt="Tutorialspoint"
                    className="h-8 w-auto object-contain"
                    loading="lazy"
                  />
                </div>
                {" "}
                <span className="text-sm font-medium text-neutral-600 dark:text-white/70">
                  Tutorialspoint
                </span>
              </div>
              <div role="listitem" className="flex items-center gap-3 shrink-0">
                <div className="size-12 rounded-xl bg-white dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10 grid place-content-center p-1">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/8/80/Wikipedia-logo-v2.svg"
                    alt="Wikipedia"
                    className="h-8 w-auto object-contain"
                    loading="lazy"
                  />
                </div>
                {" "}
                <span className="text-sm font-medium text-neutral-600 dark:text-white/70">
                  Wikipedia
                </span>
              </div>
              <div role="listitem" className="flex items-center gap-3 shrink-0">
                <div className="size-12 rounded-xl bg-white dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10 grid place-content-center p-1">
                  <img
                    src="https://i.pinimg.com/736x/ee/4f/82/ee4f8235abca76a1da9b6045ba4226e4.jpg"
                    alt="Byjus"
                    className="h-8 w-auto object-contain rounded"
                    loading="lazy"
                  />
                </div>
                {" "}
                <span className="text-sm font-medium text-neutral-600 dark:text-white/70">
                  Byjus
                </span>
              </div>
            </div>
          </div>
          <p className="mt-6 text-[10px] text-neutral-500 dark:text-white/40 text-center">
            {"Logos hot‑linked for demo. Download & serve locally (optimized SVG/PNG) for production."}
          </p>
        </div>
      </section>
      {/* ================= Paper X • CTA Section ================= */}
      <section className="py-20 bg-neutral-50 dark:bg-gradient-to-b dark:from-[#1E1E2F] dark:via-[#221B38] dark:to-[#141321]">
        <div className="container max-w-6xl">
          <div className="grid md:grid-cols-2 items-center gap-10 rounded-3xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10 bg-white dark:bg-[#1E1E2F]/70 backdrop-blur-sm shadow-soft dark:shadow-glow relative">
            {/* Dark mode subtle radial highlight */}
            <div aria-hidden="true" className="hidden dark:block absolute inset-0">
              <div className="absolute -inset-px opacity-60 bg-[radial-gradient(circle_at_30%_40%,rgba(158,75,138,0.35),transparent_65%)]" />
            </div>
            {/* Left text */}
            <div className="p-10 md:p-14">
              <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                {" Join the Revolution "}
              </h3>
              <p className="mt-4 text-neutral-600 dark:text-white/70">
                {" Experience AI-powered notes, smart project collaboration, and verified skill testing — all in one platform. "}
              </p>
              <p className="mt-4 text-neutral-600 dark:text-white/70">
                {" Be part of the future of learning and innovation. Start today and shape your academic journey with PaperX. "}
              </p>
              {" "}
              <a
                href="#signup"
                className="inline-flex items-center gap-2 mt-6 font-semibold text-magenta-600 dark:text-magenta-400 hover:underline"
              >
                {" Get Started with PaperX "}
                <span className="material-symbols-rounded text-lg">
                  arrow_forward
                </span>
                {" "}
              </a>
            </div>
            {/* Right image */}
            <div className="w-full h-full py-6 relative">
              {/*
              <img src="../assets/img/img4.png" alt="Bubu the unicorn piggy leading the PaperX revolution"
                                      class="w-full h-full object-cover brightness-100 dark:brightness-105 contrast-105 dark:contrast-110 transition"
                                      loading="lazy" decoding="async">
              */}
              <video className="w-full h-full object-cover" autoPlay muted loop playsInline>
                <source src="../assets/video/read.mp4" type="video/mp4" />
                {" Your browser does not support the video tag. "}
              </video>
            </div>
          </div>
        </div>
      </section>
      {/* =================================================================== */}
      {/* Feature grid */}
      <section id="features" className="py-20">
        <div className="container max-w-7xl">
          <header className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Exam-ready features
            </h2>
            <p className="mt-3 text-neutral-600 dark:text-white/70">
              {"Everything aligned to Indian college syllabi & past papers."}
            </p>
          </header>
          <div className="feature-carousel gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-3">
            {/* 6 features */}
            <article className="rounded-2xl p-6 ring-1 ring-black/5 dark:ring-white/10 bg-white/70 dark:bg-white/5 hover:shadow-glow transition">
              <div className="size-10 grid place-content-center rounded-xl bg-brand-500/15 text-brand-500 mb-4">
                <span className="material-symbols-rounded">
                  menu_book
                </span>
              </div>
              <h3 className="font-semibold">
                Syllabus → Smart Notes
              </h3>
              <p className="mt-1 text-sm text-neutral-600 dark:text-white/70">
                {"Auto-structured notes per Unit → Topic → Sub-topic with examples & diagrams."}
              </p>
            </article>
            <article className="rounded-2xl p-6 ring-1 ring-black/5 dark:ring-white/10 bg-white/70 dark:bg-white/5 hover:shadow-glow transition">
              <div className="size-10 grid place-content-center rounded-xl bg-brand-700/15 text-brand-700 mb-4">
                <span className="material-symbols-rounded">
                  style
                </span>
              </div>
              <h3 className="font-semibold">
                {"Flashcards & SRS"}
              </h3>
              <p className="mt-1 text-sm text-neutral-600 dark:text-white/70">
                Spaced-repetition decks with images, formulas, and quick tests.
              </p>
            </article>
            <article className="rounded-2xl p-6 ring-1 ring-black/5 dark:ring-white/10 bg-white/70 dark:bg-white/5 hover:shadow-glow transition">
              <div className="size-10 grid place-content-center rounded-xl bg-brand-500/15 text-brand-500 mb-4">
                <span className="material-symbols-rounded">
                  quiz
                </span>
              </div>
              <h3 className="font-semibold">
                {"Question Banks & Past Papers"}
              </h3>
              <p className="mt-1 text-sm text-neutral-600 dark:text-white/70">
                {"Chapter-wise previous questions with solutions & weightage analytics."}
              </p>
            </article>
            <article className="rounded-2xl p-6 ring-1 ring-black/5 dark:ring-white/10 bg-white/70 dark:bg-white/5 hover:shadow-glow transition">
              <div className="size-10 grid place-content-center rounded-xl bg-brand-700/15 text-brand-700 mb-4">
                <span className="material-symbols-rounded">
                  auto_awesome
                </span>
              </div>
              <h3 className="font-semibold">
                {"AI Diagrams & Summaries"}
              </h3>
              <p className="mt-1 text-sm text-neutral-600 dark:text-white/70">
                Topic diagrams, tables, and one-page summaries auto-generated.
              </p>
            </article>
            <article className="rounded-2xl p-6 ring-1 ring-black/5 dark:ring-white/10 bg-white/70 dark:bg-white/5 hover:shadow-glow transition">
              <div className="size-10 grid place-content-center rounded-xl bg-brand-500/15 text-brand-500 mb-4">
                <span className="material-symbols-rounded">
                  task_alt
                </span>
              </div>
              <h3 className="font-semibold">
                Exam-oriented Study Plans
              </h3>
              <p className="mt-1 text-sm text-neutral-600 dark:text-white/70">
                Week-by-week goals, PYQ focus, and high-yield checkpoints.
              </p>
            </article>
            <article className="rounded-2xl p-6 ring-1 ring-black/5 dark:ring-white/10 bg-white/70 dark:bg-white/5 hover:shadow-glow transition">
              <div className="size-10 grid place-content-center rounded-xl bg-brand-700/15 text-brand-700 mb-4">
                <span className="material-symbols-rounded">
                  translate
                </span>
              </div>
              <h3 className="font-semibold">
                {"Multilingual & Offline"}
              </h3>
              <p className="mt-1 text-sm text-neutral-600 dark:text-white/70">
                English + Indian languages. Sync once, study anywhere.
              </p>
            </article>
          </div>
        </div>
      </section>
      {/* How it works */}
      <section id="how-it-works" className="py-20 border-y border-black/5 dark:border-white/10">
        <div className="container max-w-6xl">
          <header className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              How Paper X works
            </h2>
            <p className="mt-3 text-neutral-600 dark:text-white/70">
              Four simple steps from PDF to perfect prep.
            </p>
          </header>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <li className="rounded-2xl p-6 bg-white/70 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10">
              <div className="flex items-center gap-3">
                <span className="size-8 grid place-content-center rounded-full bg-brand-500 text-white text-sm font-bold">
                  1
                </span>
                {" "}
                <h3 className="font-semibold">
                  Upload Syllabus
                </h3>
              </div>
              <p className="mt-2 text-sm text-neutral-600 dark:text-white/70">
                {"PDF / image supported. We parse units & topics."}
              </p>
            </li>
            <li className="rounded-2xl p-6 bg-white/70 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10">
              <div className="flex items-center gap-3">
                <span className="size-8 grid place-content-center rounded-full bg-brand-700 text-white text-sm font-bold">
                  2
                </span>
                {" "}
                <h3 className="font-semibold">
                  Generate Content
                </h3>
              </div>
              <p className="mt-2 text-sm text-neutral-600 dark:text-white/70">
                Notes, diagrams, flashcards, and question maps.
              </p>
            </li>
            <li className="rounded-2xl p-6 bg-white/70 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10">
              <div className="flex items-center gap-3">
                <span className="size-8 grid place-content-center rounded-full bg-brand-500 text-white text-sm font-bold">
                  3
                </span>
                {" "}
                <h3 className="font-semibold">
                  Practice
                </h3>
              </div>
              <p className="mt-2 text-sm text-neutral-600 dark:text-white/70">
                {"PYQs, chapter tests, and spaced review. "}
              </p>
            </li>
            <li className="rounded-2xl p-6 bg-white/70 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10">
              <div className="flex items-center gap-3">
                <span className="size-8 grid place-content-center rounded-full bg-plum text-white text-sm font-bold">
                  4
                </span>
                {" "}
                <h3 className="font-semibold">
                  {"Track & Improve"}
                </h3>
              </div>
              <p className="mt-2 text-sm text-neutral-600 dark:text-white/70">
                Weak-area detection and smart remediation.
              </p>
            </li>
          </ol>
        </div>
      </section>
      {/* Customers Carousel (auto-scrolling) */}
      <section
        className="py-20 border-y border-black/5 dark:border-white/10"
        aria-label="Customer success stories"
      >
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-center">
            Customers growing with us
          </h2>
          <p className="mt-3 text-sm text-neutral-600 dark:text-white/60 text-center max-w-2xl mx-auto">
            Continuous carousel of real-world impact. (Demo content)
          </p>
          <div id="custMarquee" className="mt-10 marquee-wrapper group relative">
            <div id="custTrack" className="marquee-track" role="list">
              {/* Single logical set of slides; JS will clone for seamless loop */}
              <div role="listitem" className="w-[260px] sm:w-[300px] md:w-[340px] p-3">
                {/* Modified card: background image with gradient overlay, bottom quote on hover */}
                <article className="cursor-target card-fx group relative overflow-hidden rounded-2xl ring-1 ring-black/5 dark:ring-white/10 p-5 h-[320px] flex flex-col justify-between text-white">
                  <img
                    src={"https://media.istockphoto.com/id/1636023306/photo/portrait-of-young-hispanic-businessman-inside-office-boss-in-business-suit-smiling-and.jpg?s=612x612&w=0&k=20&c=3aC2P0heBBWlaVdFq6P711W3TMw7Lqgb5Wru6xwH8_w="}
                    alt="Customer background"
                    className="absolute inset-0 w-full h-full object-cover object-center opacity-60"
                    loading="lazy"
                    aria-hidden="true"
                  />
                  {" "}
                  <div
                    className="absolute inset-0 bg-[linear-gradient(135deg,#4C2A59_0%,#9E4B8A_100%)] dark:bg-[linear-gradient(135deg,#1E1E2F_0%,#4C2A59_100%)] opacity-80 transition-opacity duration-300 group-hover:opacity-55 mix-blend-multiply"
                    aria-hidden="true"
                  />
                  <div className="relative z-10 group-hover:opacity-95 transition-opacity">
                    <div className="text-sm font-semibold">
                      Yury Kamyshenko
                    </div>
                    <div className="text-[11px] opacity-70">
                      {"Head of R&D, Tango"}
                    </div>
                  </div>
                  <div className="relative z-10 text-[11px] font-medium opacity-80 group-hover:opacity-95 transition-all group-hover:text-sm md:group-hover:text-base leading-snug">
                    <span className="inline group-hover:hidden">
                      Growing on Paper X
                    </span>
                    {" "}
                    <span className="hidden group-hover:inline">
                      Growing on Paper X with confidence
                    </span>
                  </div>
                </article>
              </div>
              <div role="listitem" className="w-[260px] sm:w-[300px] md:w-[340px] p-3">
                {/* Image background applied (Indian businessman) with bottom quote */}
                <article className="cursor-target card-fx group relative overflow-hidden rounded-2xl ring-1 ring-black/5 dark:ring-white/10 p-5 h-[320px] flex flex-col justify-between text-white">
                  <img
                    src={"https://media.istockphoto.com/id/1562983249/photo/portrait-of-happy-and-successful-businessman-indian-man-smiling-and-looking-at-camera.jpg?s=612x612&w=0&k=20&c=tfBv6taG9nTidFwENcrvEEvRHABN5gDAmg-K1G1Etnc="}
                    alt="Customer background"
                    className="absolute inset-0 w-full h-full object-cover object-center opacity-60"
                    loading="lazy"
                    aria-hidden="true"
                  />
                  {" "}
                  <div
                    className="absolute inset-0 bg-[linear-gradient(135deg,#1E1E2F_0%,#4C2A59_100%)] dark:bg-[linear-gradient(135deg,#4C2A59_0%,#9E4B8A_100%)] opacity-80 transition-opacity duration-300 group-hover:opacity-55 mix-blend-multiply"
                    aria-hidden="true"
                  />
                  <div className="relative z-10 group-hover:opacity-95 transition-opacity">
                    <div className="text-sm font-semibold">
                      Richard Li
                    </div>
                    <div className="text-[11px] opacity-70">
                      {"Founder & CEO, Amorphous Data"}
                    </div>
                  </div>
                  <div className="relative z-10 text-[11px] font-medium opacity-80 group-hover:opacity-95 transition-all group-hover:text-sm md:group-hover:text-base leading-snug">
                    <span className="inline group-hover:hidden">
                      Kubernetes + GPUs
                    </span>
                    {" "}
                    <span className="hidden group-hover:inline">
                      Kubernetes + GPUs, predictable and fast
                    </span>
                  </div>
                </article>
              </div>
              <div role="listitem" className="w-[260px] sm:w-[300px] md:w-[340px] p-3">
                {/* Image background applied (Businesswoman city) with bottom quote */}
                <article className="cursor-target card-fx group relative overflow-hidden rounded-2xl ring-1 ring-black/5 dark:ring-white/10 p-5 h-[320px] flex flex-col justify-between text-white">
                  <img
                    src="https://img.freepik.com/free-photo/smiley-businesswoman-posing-city-with-arms-crossed_23-2148767033.jpg"
                    alt="Customer background"
                    className="absolute inset-0 w-full h-full object-cover object-center opacity-60"
                    loading="lazy"
                    aria-hidden="true"
                  />
                  {" "}
                  <div
                    className="absolute inset-0 bg-[linear-gradient(135deg,#9E4B8A_0%,#4C2A59_100%)] dark:bg-[linear-gradient(135deg,#1E1E2F_0%,#4C2A59_100%)] opacity-80 transition-opacity duration-300 group-hover:opacity-55 mix-blend-multiply"
                    aria-hidden="true"
                  />
                  <div className="relative z-10 group-hover:opacity-95 transition-opacity">
                    <div className="text-sm font-semibold">
                      Andres Murcia
                    </div>
                    <div className="text-[11px] opacity-70">
                      CTO, Picap
                    </div>
                  </div>
                  <div className="relative z-10 text-[11px] font-medium opacity-80 group-hover:opacity-95 transition-all group-hover:text-sm md:group-hover:text-base leading-snug">
                    <span className="inline group-hover:hidden">
                      Cost wins
                    </span>
                    {" "}
                    <span className="hidden group-hover:inline">
                      Cost wins without performance compromise
                    </span>
                  </div>
                </article>
              </div>
              <div role="listitem" className="w-[260px] sm:w-[300px] md:w-[340px] p-3">
                {/* Image background applied (Businesswoman restaurant) with bottom quote */}
                <article className="cursor-target card-fx group relative overflow-hidden rounded-2xl ring-1 ring-black/5 dark:ring-white/10 p-5 h-[320px] flex flex-col justify-between text-white">
                  <img
                    src={"https://img.freepik.com/free-photo/portrait-smiling-successful-businesswoman-looking-into-camera-sitting-restaurant-business-lady-with-stylish-hairstyle-wears-elegant-suit-business-meeting-attractive-appearance_8353-12611.jpg?semt=ais_hybrid&w=740&q=80"}
                    alt="Customer background"
                    className="absolute inset-0 w-full h-full object-cover object-center opacity-60"
                    loading="lazy"
                    aria-hidden="true"
                  />
                  {" "}
                  <div
                    className="absolute inset-0 bg-[linear-gradient(135deg,#4C2A59_0%,#9E4B8A_100%)] dark:bg-[linear-gradient(135deg,#1E1E2F_0%,#4C2A59_100%)] opacity-80 transition-opacity duration-300 group-hover:opacity-55 mix-blend-multiply"
                    aria-hidden="true"
                  />
                  <div className="relative z-10 group-hover:opacity-95 transition-opacity">
                    <div className="text-sm font-semibold">
                      Matt Gray
                    </div>
                    <div className="text-[11px] opacity-70">
                      CEO, Servd Hosting
                    </div>
                  </div>
                  <div className="relative z-10 text-[11px] font-medium opacity-80 group-hover:opacity-95 transition-all group-hover:text-sm md:group-hover:text-base leading-snug">
                    <span className="inline group-hover:hidden">
                      Scale without stress
                    </span>
                    {" "}
                    <span className="hidden group-hover:inline">
                      Scale without stress or surprise spend
                    </span>
                  </div>
                </article>
              </div>
              <div role="listitem" className="w-[260px] sm:w-[300px] md:w-[340px] p-3">
                {/* Image background reused (first image) final card with bottom quote */}
                <article className="cursor-target card-fx group relative overflow-hidden rounded-2xl ring-1 ring-black/5 dark:ring-white/10 p-5 h-[320px] flex flex-col justify-between text-white">
                  <img
                    src={"https://media.istockphoto.com/id/1636023306/photo/portrait-of-young-hispanic-businessman-inside-office-boss-in-business-suit-smiling-and.jpg?s=612x612&w=0&k=20&c=3aC2P0heBBWlaVdFq6P711W3TMw7Lqgb5Wru6xwH8_w="}
                    alt="Customer background"
                    className="absolute inset-0 w-full h-full object-cover object-center opacity-60"
                    loading="lazy"
                    aria-hidden="true"
                  />
                  {" "}
                  <div
                    className="absolute inset-0 bg-[linear-gradient(135deg,#1E1E2F_0%,#4C2A59_100%)] dark:bg-[linear-gradient(135deg,#4C2A59_0%,#9E4B8A_100%)] opacity-80 transition-opacity duration-300 group-hover:opacity-55 mix-blend-multiply"
                    aria-hidden="true"
                  />
                  <div className="relative z-10 group-hover:opacity-95 transition-opacity">
                    <div className="text-sm font-semibold">
                      Travis Banks
                    </div>
                    <div className="text-[11px] opacity-70">
                      CTO, Consultech
                    </div>
                  </div>
                  <div className="relative z-10 text-[11px] font-medium opacity-80 group-hover:opacity-95 transition-all group-hover:text-sm md:group-hover:text-base leading-snug">
                    <span className="inline group-hover:hidden">
                      Happy engineers
                    </span>
                    {" "}
                    <span className="hidden group-hover:inline">
                      Happy engineers, faster shipping cycles
                    </span>
                  </div>
                </article>
              </div>
            </div>
            {/* gradient mask edges */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-hero-light dark:from-brand-900 to-transparent"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-hero-light dark:from-brand-900 to-transparent"
            />
          </div>
        </div>
      </section>
      {/* Paper X Pricing Card Section */}
      <section id="pricing" className="relative py-28 md:py-36 overflow-hidden">
        {/* Decorative ambient gradients */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -left-24 w-[620px] h-[620px] rounded-full bg-[radial-gradient(circle_at_center,rgba(158,75,138,0.35),transparent_70%)] blur-3xl" />
          <div className="absolute -bottom-48 -right-10 w-[520px] h-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgba(76,42,89,0.55),transparent_70%)] blur-3xl" />
        </div>
        <div className="container relative max-w-[88rem] xl:max-w-[92rem]">
          <header className="text-center mb-14 md:mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight gradient-hero-text drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)]">
              {" All‑in‑One Learning Platform "}
            </h2>
            <p className="mt-5 text-lg md:text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
              {" Try Paper X free • Cancel anytime • Unlock your full potential "}
            </p>
          </header>
          <div className="relative mx-auto max-w-none px-4 sm:px-6">
            <div className="grid gap-8 items-stretch justify-items-center">
              {/* Pricing Card Wrapper (now first / left) */}
              <div className="relative flex">
                {/* Gradient Border Wrapper */}
                <div className="relative rounded-3xl p-[1px] bg-gradient-to-tr from-[#4C2A59] via-[#9E4B8A] to-[#FF8FD9] shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_12px_45px_-10px_rgba(158,75,138,0.55)]">
                  <div className="relative rounded-[inherit] overflow-hidden backdrop-blur-xl bg-[#1E1E2F]/80 ring-1 ring-white/10">
                    {/* Subtle noise / texture overlay */}
                    <div
                      aria-hidden="true"
                      className={"absolute inset-0 opacity-[0.15] mix-blend-overlay bg-[url('data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'160\\' height=\\'160\\' fill=\\'none\\'><path stroke=\\'%23ffffff0d\\' d=\\'M0 0h160v160H0z\\'/><circle cx=\\'80\\' cy=\\'80\\' r=\\'78\\' stroke=\\'%23ffffff14\\' stroke-width=\\'0.5\\' stroke-dasharray=\\'2 6\\'/></svg>')] bg-[length:300px_300px]"}
                    />
                    <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
                      {/* Features */}
                      <ul className="lg:col-span-2 grid sm:grid-cols-2 gap-y-6 gap-x-10 p-8 md:p-12 text-white/90 dark:text-white/85">
                        <li className="flex items-start gap-4 group">
                          <span className="material-symbols-rounded text-2xl shrink-0 bg-gradient-to-br from-[#FFDEE9] to-[#B5FFFC] text-transparent bg-clip-text">
                            menu_book
                          </span>
                          {" "}
                          <span className="text-[17px] sm:text-lg leading-relaxed group-hover:text-white transition-colors">
                            Syllabus → Smart Notes
                          </span>
                        </li>
                        <li className="flex items-start gap-4 group">
                          <span className="material-symbols-rounded text-2xl shrink-0 bg-gradient-to-br from-[#D8B4FE] to-[#FBC2EB] text-transparent bg-clip-text">
                            style
                          </span>
                          {" "}
                          <span className="text-[17px] sm:text-lg leading-relaxed group-hover:text-white transition-colors">
                            {"Flashcards & Spaced Repetition"}
                          </span>
                        </li>
                        <li className="flex items-start gap-4 group">
                          <span className="material-symbols-rounded text-2xl shrink-0 bg-gradient-to-br from-[#FEE140] to-[#FA709A] text-transparent bg-clip-text">
                            quiz
                          </span>
                          {" "}
                          <span className="text-[17px] sm:text-lg leading-relaxed group-hover:text-white transition-colors">
                            {"Question Banks & Past Papers"}
                          </span>
                        </li>
                        <li className="flex items-start gap-4 group">
                          <span className="material-symbols-rounded text-2xl shrink-0 bg-gradient-to-br from-[#A1C4FD] to-[#C2E9FB] text-transparent bg-clip-text">
                            auto_awesome
                          </span>
                          {" "}
                          <span className="text-[17px] sm:text-lg leading-relaxed group-hover:text-white transition-colors">
                            {"AI‑Generated Diagrams & Summaries"}
                          </span>
                        </li>
                        <li className="flex items-start gap-4 group">
                          <span className="material-symbols-rounded text-2xl shrink-0 bg-gradient-to-br from-[#FF9A9E] to-[#FAD0C4] text-transparent bg-clip-text">
                            task_alt
                          </span>
                          {" "}
                          <span className="text-[17px] sm:text-lg leading-relaxed group-hover:text-white transition-colors">
                            Exam‑oriented Study Plans
                          </span>
                        </li>
                        <li className="flex items-start gap-4 group">
                          <span className="material-symbols-rounded text-2xl shrink-0 bg-gradient-to-br from-[#84FAB0] to-[#8FD3F4] text-transparent bg-clip-text">
                            translate
                          </span>
                          {" "}
                          <span className="text-[17px] sm:text-lg leading-relaxed group-hover:text-white transition-colors">
                            {"Multilingual & Offline Access"}
                          </span>
                        </li>
                      </ul>
                      {/* Price / CTA */}
                      <div className="relative flex w-full max-w-md lg:max-w-none mx-auto lg:mx-0 flex-col items-stretch md:items-center justify-center gap-7 p-8 md:p-12 bg-gradient-to-br from-[#26263A]/60 via-[#1E1E2F]/60 to-[#181827]/60 border-t lg:border-l lg:border-t-0 border-white/10 text-left md:text-center">
                        {/* Accent ring / glow */}
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 group-hover:opacity-100 transition duration-500"
                        />
                        <div className="space-y-2">
                          <div className="text-sm uppercase tracking-wider text-white/50 font-medium">
                            {" Starter Access"}
                          </div>
                          <div className="flex items-end justify-start md:justify-center gap-2">
                            <span className="text-5xl md:text-6xl font-extrabold leading-none bg-gradient-to-br from-[#FFB2EC] via-white to-[#C9A2FF] text-transparent bg-clip-text drop-shadow-[0_4px_25px_rgba(255,163,230,0.25)]">
                              ₹199
                            </span>
                            {" "}
                            <span className="text-white/50 mb-1">
                              /mo
                            </span>
                          </div>
                          <p className="text-sm text-white/55">
                            First 7 days free, then billed monthly.
                          </p>
                        </div>
                        {" "}
                        <button
                          data-ripple=""
                          className="relative inline-flex w-full md:w-auto items-center justify-center gap-2 rounded-full px-9 py-4 text-sm font-semibold text-white bg-gradient-to-r from-[#9E4B8A] via-[#B06AB3] to-[#FF7FD1] shadow-[0_4px_18px_-4px_rgba(158,75,138,0.6)] hover:shadow-[0_6px_28px_-6px_rgba(158,75,138,0.8)] transition active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                        >
                          <span className="material-symbols-rounded text-base">
                            bolt
                          </span>
                          {" Start Learning Now "}
                          <span
                            aria-hidden="true"
                            className="absolute inset-0 rounded-full opacity-0 ring-1 ring-white/40 group-hover:opacity-40"
                          />
                        </button>
                        {" "}
                        <div className="flex items-center gap-4 pt-2 justify-start md:justify-center">
                          <div className="flex -space-x-3">
                            <img
                              src="https://i.pravatar.cc/40?img=11"
                              alt="User"
                              className="size-8 rounded-full ring-2 ring-[#1E1E2F] object-cover"
                              loading="lazy"
                            />
                            {" "}
                            <img
                              src="https://i.pravatar.cc/40?img=15"
                              alt="User"
                              className="size-8 rounded-full ring-2 ring-[#1E1E2F] object-cover"
                              loading="lazy"
                            />
                            {" "}
                            <img
                              src="https://i.pravatar.cc/40?img=32"
                              alt="User"
                              className="size-8 rounded-full ring-2 ring-[#1E1E2F] object-cover"
                              loading="lazy"
                            />
                          </div>
                          <p className="text-xs text-white/60 max-w-[150px] leading-tight md:text-center">
                            {" Thousands already accelerating with Paper X"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Former right-side illustrative video removed → single column layout */}
            </div>
          </div>
        </div>
      </section>
      {/* End Pricing Section */}
      {/* ====== Footer Section Start */}
      <footer className="app-footer">
        <div className="app-footer__content">
          <div className="container py-16 md:py-20">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,0.9fr)] items-start">
              <div className="app-footer__brand space-y-5">
                <a href="#" className="inline-flex items-center gap-3">
                  {" "}
                  <img src="../assets/img/logo-light.svg" alt="Paper X" className="h-12 w-auto dark:hidden" />
                  {" "}
                  <img
                    src="../assets/img/logo-dark.svg"
                    alt="Paper X"
                    className="h-12 w-auto hidden dark:block"
                  />
                  {" "}
                </a>
                {" "}
                <p className="text-sm leading-relaxed max-w-sm opacity-80">
                  {" Exam-ready intelligence for Indian colleges. Capture syllabi, generate smart notes, practice past papers, and stay ahead with AI-crafted learning paths. "}
                </p>
                <div className="app-footer__social flex items-center gap-3">
                  <a href="#" aria-label="Follow Paper X on X">
                    {" "}
                    <span className="material-symbols-rounded text-base">
                      alternate_email
                    </span>
                    {" "}
                  </a>
                  {" "}
                  <a href="#" aria-label="Connect on LinkedIn">
                    {" "}
                    <span className="material-symbols-rounded text-base">
                      work
                    </span>
                    {" "}
                  </a>
                  {" "}
                  <a href="#" aria-label="Watch our launches on YouTube">
                    {" "}
                    <span className="material-symbols-rounded text-base">
                      play_arrow
                    </span>
                    {" "}
                  </a>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold tracking-[0.32em] uppercase opacity-70">
                  Product
                </h4>
                <ul className="app-footer__list mt-5 text-sm">
                  <li>
                    <a href="#features">
                      Feature overview
                    </a>
                  </li>
                  <li>
                    <a href="#how-it-works">
                      Workflow
                    </a>
                  </li>
                  <li>
                    <a href="#pricing">
                      {"Pricing & plans"}
                    </a>
                  </li>
                  <li>
                    <a href="#" role="button">
                      Developer API
                    </a>
                  </li>
                  <li>
                    <a href="#" role="button">
                      Status
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-semibold tracking-[0.32em] uppercase opacity-70">
                  Stay in the loop
                </h4>
                <p className="mt-5 text-sm opacity-80 max-w-xs">
                  {" Join 10k+ students receiving power tips, question banks, and exam strategies every Friday. "}
                </p>
                <form
                  className="app-footer__newsletter flex flex-col sm:flex-row gap-3 mt-6"
                  action="#"
                  method="post"
                  noValidate
                >
                  <div className="relative flex-1 min-w-0">
                    <span className="material-symbols-rounded app-footer__newsletter-icon">
                      mail
                    </span>
                    {" "}
                    <input type="email" name="email" placeholder="you@example.com" aria-label="Email address" />
                  </div>
                  {" "}
                  <button type="submit" className="app-footer__cta-btn">
                    <span className="material-symbols-rounded text-base">
                      bolt
                    </span>
                    {" Notify me "}
                  </button>
                </form>
                <p className="mt-3 text-xs opacity-70">
                  No spam. Opt out anytime.
                </p>
              </div>
            </div>
            <div className="app-footer__divider flex flex-col gap-4 md:flex-row md:items-center md:justify-between text-xs md:text-sm">
              <p>
                {"© "}
                <span id="y" />
                {" Paper X. Crafted with care across India."}
              </p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <a href="#">
                  Privacy
                </a>
                {" "}
                <a href="#">
                  Terms
                </a>
                {" "}
                <a href="#">
                  Responsible AI
                </a>
                {" "}
                <a href="#">
                  Contact
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
      {/* ====== Footer Section End */}
      {/* Theme + year scripts */}
      <script src="/_legacy/indexII/script-03.js" />
      <script src="/_legacy/indexII/script-04.js" />
      <script src="/_legacy/indexII/script-05.js" />
      <script src="/_legacy/indexII/script-06.js" />
      <script src="/_legacy/indexII/script-07.js" />
      {/* Auth dynamic navbar script */}
      <script src="/auth.js" />
    </LegacyPage>
  );
}
