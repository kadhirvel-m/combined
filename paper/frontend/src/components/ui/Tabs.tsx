"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

export interface TabItem<K extends string = string> {
  key: K;
  label: ReactNode;
  icon?: string;
  badge?: ReactNode;
  disabled?: boolean;
}

export interface TabsProps<K extends string> {
  items: TabItem<K>[];
  value?: K;
  defaultValue?: K;
  onChange?: (key: K) => void;
  /** `pill` (segmented, default) or `underline`. */
  variant?: "pill" | "underline";
  className?: string;
  size?: "sm" | "md";
}

/** Segmented / underline tab bar. Render the active panel yourself. */
export function Tabs<K extends string>({
  items,
  value,
  defaultValue,
  onChange,
  variant = "pill",
  className,
  size = "md",
}: TabsProps<K>) {
  const [inner, setInner] = useState<K | undefined>(defaultValue ?? items[0]?.key);
  const active = value ?? inner;
  const select = (key: K) => {
    setInner(key);
    onChange?.(key);
  };
  return (
    <div
      role="tablist"
      className={cn(
        variant === "pill"
          ? "inline-flex items-center gap-1 rounded-full bg-black/5 dark:bg-white/10 p-1"
          : "flex items-center gap-4 border-b border-black/10 dark:border-white/10",
        className,
      )}
    >
      {items.map((item) => {
        const selected = item.key === active;
        return (
          <button
            key={item.key}
            role="tab"
            type="button"
            aria-selected={selected}
            disabled={item.disabled}
            onClick={() => select(item.key)}
            className={cn(
              "inline-flex items-center gap-1.5 font-medium transition disabled:opacity-50",
              size === "sm" ? "text-xs" : "text-sm",
              variant === "pill"
                ? cn(
                    "rounded-full",
                    size === "sm" ? "px-3 py-1" : "px-4 py-1.5",
                    selected
                      ? "bg-white text-neutral-900 shadow-sm dark:bg-brand-500 dark:text-white"
                      : "text-neutral-600 hover:text-neutral-900 dark:text-white/70 dark:hover:text-white",
                  )
                : cn(
                    "-mb-px border-b-2 pb-2",
                    selected
                      ? "border-brand-500 text-brand-700 dark:text-white"
                      : "border-transparent text-neutral-500 hover:text-neutral-800 dark:text-white/60 dark:hover:text-white",
                  ),
            )}
          >
            {item.icon ? <Icon name={item.icon} className="text-[1.15em]" /> : null}
            {item.label}
            {item.badge}
          </button>
        );
      })}
    </div>
  );
}
