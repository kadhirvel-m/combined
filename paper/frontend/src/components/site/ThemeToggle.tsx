"use client";

import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

/** Light/dark switch. `compact` renders the round icon-only mobile variant. */
export function ThemeToggle({ compact, className, labelClassName }: { compact?: boolean; className?: string; labelClassName?: string }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "inline-flex items-center rounded-full ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5 transition",
        compact ? "justify-center size-10" : "gap-2 px-3 py-2 text-sm",
        className,
      )}
    >
      <Icon name={theme === "dark" ? "light_mode" : "dark_mode"} />
      {compact ? null : <span className={labelClassName ?? "hidden sm:block"}>Theme</span>}
    </button>
  );
}
