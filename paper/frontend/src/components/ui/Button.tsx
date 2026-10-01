import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { AppLink } from "@/components/site/AppLink";
import { Icon } from "./Icon";
import { Spinner } from "./Spinner";

export type ButtonVariant =
  | "primary" // solid brand magenta
  | "gradient" // magenta → pink gradient CTA
  | "secondary" // subtle ring, transparent
  | "ghost" // text only, hover tint
  | "soft" // tinted brand background
  | "dark" // ink / white inverted
  | "danger"
  | "link";
export type ButtonSize = "xs" | "sm" | "md" | "lg" | "icon" | "icon-sm";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap transition select-none " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60 focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-white dark:focus-visible:ring-offset-brand-900 disabled:opacity-60 disabled:cursor-not-allowed " +
  "aria-disabled:opacity-60 aria-disabled:pointer-events-none";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand-500 text-white hover:shadow-glow-magenta hover:bg-brand-600",
  gradient:
    "text-white bg-gradient-to-r from-[#9E4B8A] via-[#B06AB3] to-[#FF7FD1] shadow-[0_4px_18px_-6px_rgba(158,75,138,0.6)] hover:shadow-[0_6px_24px_-8px_rgba(158,75,138,0.75)]",
  secondary:
    "ring-1 ring-black/10 dark:ring-white/15 text-neutral-700 dark:text-white/85 hover:bg-black/5 dark:hover:bg-white/10",
  ghost: "text-neutral-700 dark:text-white/85 hover:bg-black/5 dark:hover:bg-white/10",
  soft: "bg-brandlt-100 text-brand-700 hover:bg-brandlt-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/15",
  dark: "bg-ink text-white hover:bg-brand-700 dark:bg-white dark:text-ink dark:hover:bg-white/90",
  danger: "bg-rose-600 text-white hover:bg-rose-700",
  link: "text-brand-500 hover:text-brand-700 dark:text-brand-300 dark:hover:text-white underline-offset-4 hover:underline",
};

const sizes: Record<ButtonSize, string> = {
  xs: "text-xs px-2.5 py-1",
  sm: "text-sm px-3 py-1.5",
  md: "text-sm px-4 py-2.5",
  lg: "text-base px-6 py-3",
  icon: "size-10 p-0",
  "icon-sm": "size-8 p-0",
};

export interface ButtonStyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** `full` (pill, default), `xl` or `lg` corner radius. */
  shape?: "full" | "xl" | "lg";
  /** Material Symbols name shown before the label. */
  icon?: string;
  /** Material Symbols name shown after the label. */
  iconRight?: string;
  block?: boolean;
}

export function buttonClasses({
  variant = "primary",
  size = "md",
  shape = "full",
  block,
  className,
}: ButtonStyleProps & { className?: string }): string {
  const radius = shape === "full" ? "rounded-full" : shape === "xl" ? "rounded-xl" : "rounded-lg";
  return cn(base, variants[variant], variant === "link" ? "p-0" : sizes[size], radius, block && "w-full", className);
}

function Content({ icon, iconRight, loading, children }: { icon?: string; iconRight?: string; loading?: boolean; children?: ReactNode }) {
  return (
    <>
      {loading ? <Spinner className="size-4" /> : icon ? <Icon name={icon} className="text-[1.15em] leading-none" /> : null}
      {children}
      {iconRight ? <Icon name={iconRight} className="text-[1.15em] leading-none" /> : null}
    </>
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonStyleProps {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, shape, icon, iconRight, block, loading, className, children, type = "button", disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={buttonClasses({ variant, size, shape, block, className })}
      {...rest}
    >
      <Content icon={icon} iconRight={iconRight} loading={loading}>
        {children}
      </Content>
    </button>
  );
});

export interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement>, ButtonStyleProps {
  href: string;
}

/** A link styled as a button; routes through {@link AppLink}. */
export function ButtonLink({ variant, size, shape, icon, iconRight, block, className, children, href, ...rest }: ButtonLinkProps) {
  return (
    <AppLink href={href} className={buttonClasses({ variant, size, shape, block, className })} {...rest}>
      <Content icon={icon} iconRight={iconRight}>
        {children}
      </Content>
    </AppLink>
  );
}
