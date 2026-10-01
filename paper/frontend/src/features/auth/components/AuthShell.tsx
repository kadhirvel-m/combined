import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import styles from "../auth.module.css";

export interface AuthOrbs {
  /** Position + dark-mode tint of the top-left orb. */
  first: string;
  /** Position + dark-mode tint of the right orb. */
  second: string;
}

/** Orb placement of login.html and teacher_signup.html. */
export const ORBS_LOGIN: AuthOrbs = {
  first: "-top-32 -left-24 dark:bg-brand-500/30",
  second: "top-[40%] -right-24 dark:bg-brand-700/35",
};

/** Orb placement of signup.html. */
export const ORBS_SIGNUP: AuthOrbs = {
  first: "-top-28 -left-24 dark:bg-brand-500/25",
  second: "top-[55%] -right-24 dark:bg-brand-700/30",
};

export interface AuthShellProps {
  /** Navbar (and anything else that sits above <main>). */
  header: ReactNode;
  /** Left column: headline, video, selling points. */
  hero: ReactNode;
  /** Right column: the form card. */
  children: ReactNode;
  /** Blurred ambient gradients behind the page (omit for none). */
  orbs?: AuthOrbs;
  /** Full-screen overlays: loader, modals. */
  overlays?: ReactNode;
  /** Section padding, e.g. `pt-6 pb-16 lg:pt-8 lg:pb-16`. */
  sectionClassName?: string;
  /** Vertical alignment of the two columns. */
  align?: "center" | "start";
  /** Extra classes on the page wrapper (the original `<body>` classes). */
  className?: string;
}

/**
 * Page frame shared by the four auth pages: hero background, ambient orbs,
 * header, and the two-column "pitch + form card" section.
 */
export function AuthShell({
  header,
  hero,
  children,
  orbs,
  overlays,
  sectionClassName = "pt-8 pb-16",
  align = "center",
  className,
}: AuthShellProps) {
  return (
    <div className={cn(styles.page, className)}>
      {overlays}
      {orbs ? (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
          <div className={cn("absolute w-[420px] h-[420px] rounded-full bg-brand-500/15 blur-[110px]", orbs.first)} />
          <div className={cn("absolute w-[380px] h-[380px] rounded-full bg-brand-700/15 blur-[120px]", orbs.second)} />
        </div>
      ) : null}
      {header}
      <main>
        <section className={cn("relative overflow-hidden", sectionClassName)}>
          <div className="pointer-events-none absolute inset-0 opacity-[0.35] bg-[radial-gradient(circle_at_20%_10%,rgba(158,75,138,0.25),transparent_60%),radial-gradient(circle_at_80%_85%,rgba(76,42,89,0.28),transparent_60%)]" />
          <div
            className={cn(
              "container relative z-10 grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]",
              align === "center" ? "items-center" : "items-start",
            )}
          >
            {hero}
            <div className="relative">{children}</div>
          </div>
        </section>
      </main>
    </div>
  );
}
