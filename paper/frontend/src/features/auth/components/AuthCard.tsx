import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import styles from "../auth.module.css";

export interface AuthCardProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  /** Padding of the card (`p-6 sm:p-8` by default). */
  className?: string;
  /** Extra classes for the title (teacher pages keep the body text colour). */
  titleClassName?: string;
  children: ReactNode;
}

/** Frosted card that holds an auth form, with an optional centred heading. */
export function AuthCard({ title, subtitle, className, titleClassName, children }: AuthCardProps) {
  return (
    <div className={cn(styles.glassCard, "rounded-3xl p-6 sm:p-8 shadow-soft ring-1 ring-black/5 dark:ring-white/10", className)}>
      <div className="mb-6 space-y-2 text-center">
        {title ? <h2 className={cn("text-2xl font-semibold", titleClassName)}>{title}</h2> : null}
        {subtitle ? <p className="text-sm text-neutral-500 dark:text-white/60">{subtitle}</p> : null}
      </div>
      {children}
    </div>
  );
}

/** "By continuing you agree to our Terms and Privacy Policy." */
export function LegalNote({ verb = "continuing", className }: { verb?: string; className?: string }) {
  return (
    <p className={cn("text-[11px] text-center text-neutral-500 dark:text-white/45", className)}>
      By {verb} you agree to our{" "}
      <a href="#" className="underline">
        Terms
      </a>{" "}
      and{" "}
      <a href="#" className="underline">
        Privacy Policy
      </a>
      .
    </p>
  );
}

/** Inline message box under the form (errors, progress, success). */
export function StatusMessage({ visible, children }: { visible: boolean; children: ReactNode }) {
  return (
    <div
      role="status"
      className={cn(
        "rounded-2xl border border-brand-500/25 bg-brand-500/10 px-4 py-3 text-xs text-brand-900 dark:text-white/80",
        !visible && "hidden",
      )}
    >
      {children}
    </div>
  );
}
