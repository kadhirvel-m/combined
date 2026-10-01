"use client";

import { useState, type FormEvent } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { AppLink } from "./AppLink";
import { SOCIAL_LINKS, type NavLink } from "./nav-data";
import styles from "./SiteFooter.module.css";

const SOCIAL_PATHS: Record<(typeof SOCIAL_LINKS)[number]["icon"], string> = {
  facebook:
    "M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95C18.05 21.45 22 17.16 22 12z",
  instagram:
    "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z",
  linkedin:
    "M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-1.41 0-2.43.91-2.92 1.83v-1.57h-3.13v8.3h3.13v-4.9a1.53 1.53 0 0 1 1.53-1.53 1.53 1.53 0 0 1 1.53 1.53v4.9h3.12M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.56 9.94v-8.3H5.32v8.3h3.12z",
  youtube:
    "M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z",
};

const DEFAULT_PRODUCT_LINKS: NavLink[] = [
  { label: "Feature overview", href: "/index.html#features" },
  { label: "Workflow", href: "/index.html#how-it-works" },
  { label: "Pricing & plans", href: "/index.html#pricing" },
  { label: "Developer API", href: "#" },
  { label: "Status", href: "#" },
];

export interface SiteFooterProps {
  /** Links in the "Product" column. */
  productLinks?: NavLink[];
  className?: string;
}

/** The gradient Paper X footer (brand, product links, newsletter, legal). */
export function SiteFooter({ productLinks = DEFAULT_PRODUCT_LINKS, className }: SiteFooterProps) {
  const [subscribed, setSubscribed] = useState(false);
  const onSubscribe = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubscribed(true);
  };

  return (
    <footer className={cn(styles.footer, className)}>
      <div className={styles.content}>
        <div className="container py-16 md:py-20">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,0.9fr)] items-start">
            <div className="space-y-5">
              <AppLink href="/index.html" className="inline-flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element -- SVG logo */}
                <img src="/assets/img/logo-light.svg" alt="Paper X" className="h-12 w-auto dark:hidden" />
                {/* eslint-disable-next-line @next/next/no-img-element -- SVG logo */}
                <img src="/assets/img/logo-dark.svg" alt="Paper X" className="h-12 w-auto hidden dark:block" />
              </AppLink>
              <p className="text-sm leading-relaxed max-w-sm opacity-80">
                Exam-ready intelligence for Indian colleges. Capture syllabi, generate smart notes, practice past papers,
                and stay ahead with AI-crafted learning paths.
              </p>
              <div className={cn(styles.social, "flex items-center gap-3")}>
                {SOCIAL_LINKS.map((s) => (
                  <a key={s.icon} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path d={SOCIAL_PATHS[s.icon]} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold tracking-[0.32em] uppercase opacity-70">Product</h4>
              <ul className={cn(styles.list, "mt-5 text-sm")}>
                {productLinks.map((l) => (
                  <li key={l.label}>
                    <AppLink href={l.href}>{l.label}</AppLink>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold tracking-[0.32em] uppercase opacity-70">Stay in the loop</h4>
              <p className="mt-5 text-sm opacity-80 max-w-xs">
                Join 10k+ students receiving power tips, question banks, and exam strategies every Friday.
              </p>
              <form className={cn(styles.newsletter, "flex flex-col sm:flex-row gap-3 mt-6")} onSubmit={onSubscribe} noValidate>
                <div className="relative flex-1 min-w-0">
                  <Icon name="mail" className={styles.newsletterIcon} />
                  <input type="email" name="email" placeholder="you@example.com" aria-label="Email address" />
                </div>
                <button type="submit" className={styles.cta}>
                  <Icon name={subscribed ? "check" : "bolt"} className="text-base" />
                  {subscribed ? "Subscribed" : "Notify me"}
                </button>
              </form>
              <p className="mt-3 text-xs opacity-70">No spam. Opt out anytime.</p>
            </div>
          </div>

          <div className={cn(styles.divider, "flex flex-col gap-4 md:flex-row md:items-center md:justify-between text-xs md:text-sm")}>
            <p>© {new Date().getFullYear()} Paper X. Crafted with care across India.</p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Responsible AI</a>
              <AppLink href="/contact.html">Contact</AppLink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
