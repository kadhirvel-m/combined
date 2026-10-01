import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

export type CardVariant = "glass" | "solid" | "outline" | "tinted" | "plain";

const variants: Record<CardVariant, string> = {
  glass: "border border-black/5 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur",
  solid: "border border-black/5 dark:border-white/10 bg-white dark:bg-brand-900",
  outline: "border border-black/10 dark:border-white/15",
  tinted: "border border-brandlt-200/70 dark:border-white/10 bg-brandlt-50/80 dark:bg-white/5",
  plain: "",
};

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  /** Padding preset. */
  padding?: "none" | "sm" | "md" | "lg";
  as?: "div" | "section" | "article" | "aside";
}

/** Rounded Paper X surface used for sections, panels and tiles. */
export function Card({ variant = "glass", padding = "md", as: Tag = "div", className, ...rest }: CardProps) {
  const pad = { none: "", sm: "p-4", md: "p-5 sm:p-6", lg: "p-6 sm:p-8" }[padding];
  return <Tag className={cn("rounded-2xl", variants[variant], pad, className)} {...rest} />;
}

export interface CardHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  icon?: string;
  actions?: ReactNode;
  className?: string;
}

/** Title row for a {@link Card}: optional icon, title, description and actions. */
export function CardHeader({ title, description, icon, actions, className }: CardHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="flex items-start gap-3 min-w-0">
        {icon ? (
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-brandlt-100 text-brand-500 dark:bg-white/10 dark:text-white/80">
            <Icon name={icon} className="text-xl" />
          </span>
        ) : null}
        <div className="min-w-0">
          <h3 className="text-base font-semibold leading-tight text-neutral-900 dark:text-white">{title}</h3>
          {description ? <p className="mt-1 text-sm text-neutral-600 dark:text-white/60">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}
