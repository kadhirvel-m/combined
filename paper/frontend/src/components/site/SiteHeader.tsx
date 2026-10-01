"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useSession } from "@/lib/session";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/misc";
import { AppLink } from "./AppLink";
import { ProjectsMegaMenu } from "./ProjectsMegaMenu";
import { ThemeToggle } from "./ThemeToggle";
import { MOBILE_NAV, PRIMARY_NAV, type NavLink } from "./nav-data";

export interface SiteHeaderProps {
  /**
   * `marketing` (default): pill links, Projects mega menu, auth controls and a
   * mobile drawer, as on the landing page. `app`: the compact bar of the app
   * pages (smaller logo, plain text links with icons, active-link highlight).
   */
  variant?: "marketing" | "app";
  /** Replace the default primary links (Home/About/Projects/Teacher/Contact). */
  links?: NavLink[];
  /** Highlights the link with this href (app variant). */
  activeHref?: string;
  /** Render the mobile menu button + drawer (default true). */
  mobileMenu?: boolean;
  /** Show the Projects mega menu after the second link (default true). */
  projectsMenu?: boolean;
  /** Links for the mobile drawer (defaults to the site-wide list). */
  mobileLinks?: NavLink[];
  /** Extra controls rendered before the theme toggle (page-specific actions). */
  actions?: ReactNode;
  /** `sticky` (default) stays in flow; `fixed` overlays the top of the page. */
  position?: "sticky" | "fixed";
  /** Hide login/signup/profile controls (e.g. on the login page itself). */
  hideAuth?: boolean;
  /** z-index / stacking overrides, extra classes. */
  className?: string;
  /** Container width class (default Tailwind `container`). */
  containerClassName?: string;
}

const pill = "inline-flex items-center rounded-full px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10 transition";

/** The sticky Paper X navbar shared by every page. */
export function SiteHeader({
  variant = "marketing",
  links = PRIMARY_NAV,
  activeHref,
  mobileMenu = true,
  projectsMenu = variant === "marketing",
  mobileLinks = MOBILE_NAV,
  actions,
  position = "sticky",
  hideAuth,
  className,
  containerClassName,
}: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const session = useSession();
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", mobileOpen);
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("overflow-hidden");
    };
  }, [mobileOpen]);

  const closeMobile = () => {
    setMobileOpen(false);
    toggleRef.current?.focus();
  };

  const signedIn = session.status === "authenticated";
  const app = variant === "app";
  const [first, second, ...rest] = links;
  const linkClass = (href: string) =>
    app
      ? cn(
          "inline-flex items-center gap-1",
          href === activeHref ? "text-brand-500 font-semibold" : "hover:text-brandlt-900 dark:hover:text-white",
        )
      : pill;
  const renderLink = (l: NavLink) => (
    <AppLink key={l.href} className={linkClass(l.href)} href={l.href} aria-current={l.href === activeHref ? "page" : undefined}>
      {l.icon ? <Icon name={l.icon} className="text-base" /> : null}
      {l.label}
    </AppLink>
  );

  return (
    <>
      <header
        className={cn(
          position === "fixed" ? "fixed top-0 left-0 right-0 w-full" : "sticky top-0",
          app ? "z-50" : "z-40",
          "bg-white/70 dark:bg-brand-900/60 backdrop-blur supports-[backdrop-filter]:saturate-150 border-b border-black/5 dark:border-white/10",
          className,
        )}
      >
        <div className={cn("container flex items-center justify-between", app ? "py-3.5" : "py-4", containerClassName)}>
          <AppLink href="/index.html" className={cn("flex items-center gap-3", app && "shrink-0")} aria-label="Paper X Home">
            {/* eslint-disable-next-line @next/next/no-img-element -- SVG logo */}
            <img src="/assets/img/logo-light.svg" alt="Paper X" className={cn(app ? "h-9" : "h-10", "w-auto dark:hidden")} />
            {/* eslint-disable-next-line @next/next/no-img-element -- SVG logo */}
            <img src="/assets/img/logo-dark.svg" alt="Paper X" className={cn(app ? "h-9" : "h-10", "w-auto hidden dark:block")} />
          </AppLink>

          <nav
            className={cn("hidden md:flex items-center text-sm text-neutral-700 dark:text-white/85", app ? "gap-6" : "gap-2")}
            aria-label="Primary"
          >
            {[first, second].filter(Boolean).map(renderLink)}
            {projectsMenu ? <ProjectsMegaMenu /> : null}
            {rest.map(renderLink)}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {actions}
            <ThemeToggle labelClassName={app ? "hidden lg:block" : undefined} />
            {hideAuth ? null : signedIn ? (
              <>
                <AppLink
                  href={session.profileHref}
                  title={session.displayName}
                  className="inline-flex items-center justify-center rounded-full"
                  aria-label="Profile"
                >
                  <Avatar src={session.avatarUrl} name={session.displayName} initials={session.initials} size={40} />
                </AppLink>
                <button
                  type="button"
                  onClick={() => void session.signOut()}
                  title="Sign out"
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/15 px-3 py-1.5 text-sm text-neutral-700 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/5 transition"
                >
                  <Icon name="logout" className="text-base" />
                  <span>Sign out</span>
                </button>
              </>
            ) : session.status === "unauthenticated" ? (
              <>
                <AppLink
                  href="/login.html"
                  className="text-sm text-neutral-700 dark:text-white/85 hover:text-brandlt-900 dark:hover:text-white px-3 py-2 rounded-full"
                >
                  Log in
                </AppLink>
                <AppLink
                  href="/signup.html"
                  className="inline-flex items-center justify-center rounded-full bg-brand-500 text-white text-sm font-semibold px-4 py-2.5 hover:shadow-glow-magenta transition"
                >
                  Sign up
                </AppLink>
              </>
            ) : null}
          </div>

          {mobileMenu ? (
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle compact />
              <button
                ref={toggleRef}
                type="button"
                aria-expanded={mobileOpen}
                aria-controls="mobileNavPanel"
                onClick={() => setMobileOpen((v) => !v)}
                className="inline-flex items-center justify-center size-10 rounded-full ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5 transition"
              >
                <span className="sr-only">Toggle navigation</span>
                <Icon name={mobileOpen ? "close" : "menu"} />
              </button>
            </div>
          ) : null}
        </div>
      </header>

      {/* Mobile navigation drawer */}
      {mobileMenu ? (
        <>
          <div
            aria-hidden="true"
            onClick={closeMobile}
            className={cn(
              "md:hidden fixed inset-0 z-40 bg-black/60 dark:bg-black/80 backdrop-blur-sm transition-opacity duration-300",
              mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          />
          <nav
            id="mobileNavPanel"
            aria-hidden={!mobileOpen}
            aria-label="Mobile"
            className={cn(
              "md:hidden fixed inset-x-4 top-24 z-50 flex flex-col gap-5 max-h-[calc(100vh-6.5rem)] overflow-y-auto rounded-3xl border border-black/10 dark:border-white/10 bg-white/95 dark:bg-brand-900/95 shadow-card backdrop-blur p-6",
              "transition duration-300",
              mobileOpen ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 -translate-y-3",
            )}
          >
            <div className="flex flex-col gap-2 text-sm text-neutral-700 dark:text-white/80">
              {mobileLinks.map((l) => (
                <AppLink
                  key={l.href}
                  href={l.href}
                  onClick={closeMobile}
                  tabIndex={mobileOpen ? 0 : -1}
                  className="rounded-xl px-3 py-2 hover:bg-brandlt-100/70 hover:dark:bg-brand-700/20 transition"
                >
                  {l.label}
                </AppLink>
              ))}
            </div>
            {hideAuth ? null : (
              <div className="flex flex-col gap-3 border-t border-black/5 dark:border-white/10 pt-4">
                {signedIn ? (
                  <>
                    <AppLink
                      href={session.profileHref}
                      onClick={closeMobile}
                      tabIndex={mobileOpen ? 0 : -1}
                      className="inline-flex items-center gap-2 rounded-xl border border-black/10 dark:border-white/15 px-4 py-2 text-sm text-neutral-700 dark:text-white/80 bg-white/70 dark:bg-brand-900/60"
                    >
                      <Icon name="account_circle" className="text-base" />
                      <span>
                        {session.displayName !== "Profile" ? `Hi, ${session.displayName.split(/\s+/)[0]}` : "My profile"}
                      </span>
                    </AppLink>
                    <button
                      type="button"
                      tabIndex={mobileOpen ? 0 : -1}
                      onClick={() => void session.signOut()}
                      className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/15 px-4 py-2 text-sm text-neutral-700 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10 transition"
                    >
                      <Icon name="logout" className="text-base" />
                      <span>Sign out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <AppLink
                      href="/login.html"
                      onClick={closeMobile}
                      tabIndex={mobileOpen ? 0 : -1}
                      className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium ring-1 ring-black/10 dark:ring-white/15 text-neutral-700 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10 transition"
                    >
                      Log in
                    </AppLink>
                    <AppLink
                      href="/signup.html"
                      onClick={closeMobile}
                      tabIndex={mobileOpen ? 0 : -1}
                      className="inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#9E4B8A] via-[#B06AB3] to-[#FF7FD1] shadow-[0_4px_18px_-6px_rgba(158,75,138,0.6)] transition"
                    >
                      Sign up
                    </AppLink>
                  </>
                )}
              </div>
            )}
          </nav>
        </>
      ) : null}
    </>
  );
}
