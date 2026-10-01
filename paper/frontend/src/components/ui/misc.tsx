import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";
import { Spinner } from "./Spinner";

/** Circular avatar: image when available, otherwise initials. */
export function Avatar({
  src,
  name,
  initials,
  size = 40,
  className,
}: {
  src?: string | null;
  name?: string | null;
  initials?: string;
  size?: number;
  className?: string;
}) {
  const letters =
    initials ??
    (name || "")
      .split(/\s+/)
      .filter(Boolean)
      .map((p) => p[0]?.toUpperCase())
      .slice(0, 2)
      .join("") ??
    "";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-black/10 dark:border-white/10",
        "bg-white/90 dark:bg-brand-900/60 font-semibold text-neutral-800 dark:text-white",
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.32) }}
      title={name ?? undefined}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote user avatars from arbitrary hosts
        <img src={src} alt={name ?? "Avatar"} className="h-full w-full object-cover" />
      ) : (
        letters || "ME"
      )}
    </span>
  );
}

/** Pulsing placeholder block. */
export function Skeleton({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-xl bg-black/5 dark:bg-white/10", className)} {...rest} />;
}

/** Friendly empty / error state with optional action. */
export function EmptyState({
  icon = "inbox",
  title,
  description,
  action,
  className,
}: {
  icon?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 px-6 py-12 text-center", className)}>
      <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-brandlt-100 text-brand-500 dark:bg-white/10 dark:text-white/70">
        <Icon name={icon} className="text-3xl" />
      </span>
      <div>
        <p className="font-semibold text-neutral-900 dark:text-white">{title}</p>
        {description ? <p className="mt-1 text-sm text-neutral-600 dark:text-white/60">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

/** Horizontal progress bar (0–100). */
export function ProgressBar({ value, className, barClassName }: { value: number; className?: string; barClassName?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10", className)}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn("h-full rounded-full bg-gradient-to-r from-[#9E4B8A] via-[#B06AB3] to-[#FF7FD1] transition-[width] duration-500", barClassName)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/** Full-screen blocking loader (the "Loading Overlay" several pages had). */
export function LoadingOverlay({ show, label = "Loading…" }: { show: boolean; label?: ReactNode }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[90] flex flex-col items-center justify-center gap-3 bg-white/80 dark:bg-brand-900/85 backdrop-blur-sm">
      <Spinner className="size-8 text-brand-500" />
      <p className="text-sm font-medium text-neutral-700 dark:text-white/80">{label}</p>
    </div>
  );
}

/** Centered page container (Tailwind `container`, 1rem gutters). */
export function Container({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("container", className)} {...rest} />;
}

/** Eyebrow + heading + description block used at the top of sections. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <header className={cn(align === "center" ? "text-center mx-auto" : "text-left", "max-w-3xl", className)}>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500 dark:text-brand-300">{eyebrow}</p>
      ) : null}
      <h2 className="mt-2 text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">{title}</h2>
      {description ? <p className="mt-4 text-base md:text-lg text-neutral-600 dark:text-white/70">{description}</p> : null}
    </header>
  );
}
