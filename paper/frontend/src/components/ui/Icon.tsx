import type { CSSProperties, HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface IconProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Material Symbols ligature, e.g. `dark_mode`, `arrow_forward`. */
  name: string;
  /** Font family: Rounded (default, used site-wide) or Outlined. */
  variant?: "rounded" | "outlined";
  /** Filled variant (FILL axis = 1). */
  filled?: boolean;
  /** Font weight axis (100–700). Paper X uses 600 by default. */
  weight?: number;
}

/**
 * Material Symbols icon (the icon font every Paper X page uses).
 * Size it with `text-*` classes; colour with `text-*` colours. Defaults:
 * 24px, line-height 1, `vertical-align: -6px`, weight 600 (see `.px-icon` in
 * globals.css); utilities and CSS modules override them.
 */
export function Icon({ name, variant = "rounded", filled, weight, className, style, ...rest }: IconProps) {
  const variation: CSSProperties | undefined =
    filled || weight
      ? { fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight ?? 600}, 'GRAD' 0, 'opsz' 24` }
      : undefined;
  return (
    <span
      aria-hidden="true"
      translate="no"
      className={cn(variant === "outlined" ? "px-icon-outlined" : "px-icon", "select-none", className)}
      style={{ ...variation, ...style }}
      {...rest}
    >
      {name}
    </span>
  );
}
