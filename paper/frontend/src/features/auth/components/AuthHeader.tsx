"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui";
import { AppLink } from "@/components/site/AppLink";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import type { AuthNavLink } from "../types";
import styles from "../auth.module.css";

export interface AuthMobileMenu {
  links: AuthNavLink[];
  /** Buttons under the links (login page: "Customer care", "Create account"). */
  footer?: AuthNavLink[];
  /** Fade/slide the drawer (signup) instead of toggling `hidden` (login). */
  animated?: boolean;
  /** Move focus to the first link when the drawer opens (login). */
  focusFirstLink?: boolean;
}

export interface AuthHeaderProps {
  /** Primary navigation (desktop). */
  links: AuthNavLink[];
  /** Controls on the right of the desktop bar (theme toggle, call to action). */
  actions: ReactNode;
  /** Mobile toggle + drawer. The teacher pages have none. */
  mobileMenu?: AuthMobileMenu;
  /** `aria-label` of the logo link. */
  logoLabel?: string;
  /** Logo height (`h-10` on student pages, `h-9` on teacher pages). */
  logoClassName?: string;
  /** Vertical padding of the bar. */
  barClassName?: string;
  className?: string;
}

const drawerLink = "rounded-xl px-3 py-2 hover:bg-brandlt-100/70 hover:dark:bg-brand-700/20 transition";
const drawerFooterLinks = [
  "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium ring-1 ring-black/10 dark:ring-white/15 text-neutral-700 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10 transition",
  "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#9E4B8A] via-[#B06AB3] to-[#FF7FD1] shadow-[0_4px_18px_-6px_rgba(158,75,138,0.6)] hover:shadow-[0_6px_24px_-8px_rgba(158,75,138,0.7)] transition",
];

/** Call-to-action pill on the right of the student auth headers. */
export function AuthHeaderCta({ href, children }: { href: string; children: ReactNode }) {
  return (
    <AppLink
      href={href}
      className="inline-flex items-center justify-center rounded-full bg-brand-500 text-white text-sm font-semibold px-4 py-2.5 hover:shadow-glow transition"
    >
      {children}
    </AppLink>
  );
}

/**
 * The slim navbar of the sign-in / sign-up pages: logo, a few plain links, a
 * theme toggle and (student pages) a mobile drawer.
 */
export function AuthHeader({
  links,
  actions,
  mobileMenu,
  logoLabel,
  logoClassName = "h-10",
  barClassName = "py-4",
  className,
}: AuthHeaderProps) {
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLElement>(null);
  const hasMenu = Boolean(mobileMenu);
  const focusFirstLink = mobileMenu?.focusFirstLink;

  useEffect(() => {
    if (!hasMenu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 768px)");
    const onDesktop = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onDesktop);
    return () => {
      window.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onDesktop);
    };
  }, [hasMenu]);

  useEffect(() => {
    if (!open) return;
    document.body.classList.add("overflow-hidden");
    if (focusFirstLink) panel.current?.querySelector<HTMLElement>("a[href], button:not([disabled])")?.focus();
    return () => document.body.classList.remove("overflow-hidden");
  }, [open, focusFirstLink]);

  const close = () => setOpen(false);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 bg-white/70 dark:bg-brand-900/60 backdrop-blur border-b border-black/5 dark:border-white/10",
          className,
        )}
      >
        <div className={cn("container flex items-center justify-between", barClassName)}>
          <AppLink href="/index.html" className="flex items-center gap-3" aria-label={logoLabel}>
            {/* eslint-disable-next-line @next/next/no-img-element -- SVG logo */}
            <img src="/assets/img/logo-light.svg" alt="Paper X" className={cn("w-auto dark:hidden", logoClassName)} />
            {/* eslint-disable-next-line @next/next/no-img-element -- SVG logo */}
            <img src="/assets/img/logo-dark.svg" alt="Paper X" className={cn("w-auto hidden dark:block", logoClassName)} />
          </AppLink>
          <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-700 dark:text-white/85">
            {links.map((l) => (
              <AppLink key={l.label} href={l.href} className={cn("hover:text-brandlt-900 dark:hover:text-white", l.className)}>
                {l.label}
              </AppLink>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-2">{actions}</div>
          {mobileMenu ? (
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle compact />
              <button
                type="button"
                aria-expanded={open}
                aria-controls="mobileNavPanel"
                onClick={() => setOpen((v) => !v)}
                className="inline-flex items-center justify-center size-10 rounded-full ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5 transition"
              >
                <span className="sr-only">Toggle navigation</span>
                <Icon name={open ? "close" : "menu"} />
              </button>
            </div>
          ) : null}
        </div>
      </header>

      {mobileMenu ? (
        <>
          <div
            aria-hidden={!open}
            onClick={close}
            className={cn(
              "md:hidden fixed inset-0 z-40 bg-black/60 dark:bg-black/80 backdrop-blur-sm",
              mobileMenu.animated ? cn(styles.drawerBackdrop, open && styles.drawerOpen) : !open && "hidden",
            )}
          />
          <nav
            id="mobileNavPanel"
            ref={panel}
            aria-hidden={!open}
            className={cn(
              "md:hidden fixed inset-x-4 top-24 z-50 flex flex-col gap-5 max-h-[calc(100vh-6.5rem)] overflow-y-auto rounded-3xl border border-black/10 dark:border-white/10 bg-white/95 dark:bg-brand-900/95 shadow-card backdrop-blur supports-[backdrop-filter]:backdrop-blur-xl p-6",
              mobileMenu.animated ? cn(styles.drawerPanel, open && styles.drawerOpen) : !open && "hidden",
            )}
          >
            <div className="flex flex-col gap-2 text-sm text-neutral-700 dark:text-white/80">
              {mobileMenu.links.map((l) => (
                <AppLink key={l.label} href={l.href} onClick={close} className={drawerLink}>
                  {l.label}
                </AppLink>
              ))}
            </div>
            {mobileMenu.footer?.length ? (
              <div className="flex flex-col gap-3 border-t border-black/5 dark:border-white/10 pt-4">
                {mobileMenu.footer.map((l, i) => (
                  <AppLink key={l.label} href={l.href} onClick={close} className={drawerFooterLinks[Math.min(i, 1)]}>
                    {l.label}
                  </AppLink>
                ))}
              </div>
            ) : null}
          </nav>
        </>
      ) : null}
    </>
  );
}
