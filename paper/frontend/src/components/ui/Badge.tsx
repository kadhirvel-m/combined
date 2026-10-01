import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

export type BadgeTone = "brand" | "neutral" | "success" | "warning" | "danger" | "info" | "outline";

const tones: Record<BadgeTone, string> = {
  brand: "bg-brandlt-200 text-brand-700 ring-1 ring-brandlt-300 dark:bg-brand-500/20 dark:text-white dark:ring-brand-500/40",
  neutral: "bg-black/5 text-neutral-700 dark:bg-white/10 dark:text-white/80",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  danger: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  info: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  outline: "ring-1 ring-black/10 text-neutral-700 dark:ring-white/15 dark:text-white/80",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  icon?: string;
  size?: "xs" | "sm";
}

/** Small pill label ("New", status chips, tags). */
export function Badge({ tone = "brand", icon, size = "sm", className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold",
        size === "xs" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        tones[tone],
        className,
      )}
      {...rest}
    >
      {icon ? <Icon name={icon} className="text-[1.1em]" /> : null}
      {children}
    </span>
  );
}
