"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { SiteHeader } from "@/components/site/SiteHeader";
import type { NavLink } from "@/components/site/nav-data";
import styles from "./account.module.css";

export const ACCOUNT_NAV: NavLink[] = [
  { label: "Academics", href: "/academicas.html" },
  { label: "Wishlist", href: "/wishlist.html", icon: "favorite" },
  { label: "History", href: "/history.html", icon: "history" },
];

export interface AccountShellProps {
  /** Highlighted nav link (`/history.html` or `/wishlist.html`). */
  active: string;
  /** Page heading row: title, subtitle and right-hand actions. */
  icon: ReactNode;
  title: ReactNode;
  subtitle: ReactNode;
  actions?: ReactNode;
  /** Footer caption after "© YEAR Paper X • ". */
  footer: string;
  /** Keeps the full-screen loader up until the data has loaded. */
  loading: boolean;
  children: ReactNode;
}

/** Layout of the signed-in topic lists (View History, My Wishlist). */
export function AccountShell({ active, icon, title, subtitle, actions, footer, loading, children }: AccountShellProps) {
  return (
    <div className="min-h-screen bg-hero-light dark:bg-hero-dark">
      <div className={cn(styles.loader, !loading && styles.loaderDone)} aria-hidden={!loading}>
        <div className="animate-spin">
          <Icon name="sync" className="text-4xl text-brand-500" />
        </div>
      </div>

      <SiteHeader variant="app" links={ACCOUNT_NAV} activeHref={active} hideAuth mobileMenu={false} />

      <main className="container py-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-3">
                {icon}
                {title}
              </h1>
              <p className="mt-2 text-neutral-600 dark:text-white/70">{subtitle}</p>
            </div>
            {actions}
          </div>
          {children}
        </div>
      </main>

      <footer className="py-10 border-t border-black/5 dark:border-white/10 text-center text-xs text-neutral-600 dark:text-white/60">
        © {new Date().getFullYear()} Paper X • {footer}
      </footer>
    </div>
  );
}

/** "Nothing here yet" panel with a link back to the Academics page. */
export function AccountEmptyState({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className={cn(styles.glassPanel, "rounded-3xl p-12 text-center")}>
      {icon}
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-neutral-600 dark:text-white/60 mb-6">{body}</p>
      <a
        href="/academicas.html"
        className="inline-flex items-center gap-2 rounded-full bg-brand-500 text-white px-6 py-3 text-sm font-semibold shadow-glow transition"
      >
        <Icon name="school" className="text-base" />
        Browse Topics
      </a>
    </div>
  );
}

export { styles as accountStyles };
