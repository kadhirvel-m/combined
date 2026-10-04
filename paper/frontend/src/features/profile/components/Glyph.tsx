import { Icon, type IconProps } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

/**
 * The profile page loaded the symbol font at weight 400 only, so every icon
 * renders at 400 (not the site default 600).
 */
export function PIcon({ className, ...rest }: Omit<IconProps, "weight">) {
  return <Icon weight={400} className={className} {...rest} />;
}

/**
 * The page's `.icon` spans: same font, but sized and aligned like the
 * surrounding text (no 24px size, no -6px offset). A `text-*` size class
 * replaces the inherited size, as on the original.
 */
export function Glyph({ className, ...rest }: Omit<IconProps, "weight">) {
  return <Icon weight={400} className={cn("inline align-baseline text-[length:inherit] leading-[inherit]", className)} {...rest} />;
}
