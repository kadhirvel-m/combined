"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface DropdownProps {
  /** Renders the trigger; receives open state and a toggle. */
  trigger: (state: { open: boolean; toggle: () => void }) => ReactNode;
  children: ReactNode | ((close: () => void) => ReactNode);
  /** Open on hover (with a short close delay), like the navbar mega menus. */
  hover?: boolean;
  align?: "left" | "right" | "center";
  className?: string;
  panelClassName?: string;
}

/** Popover menu that closes on outside click, Escape and window blur. */
export function Dropdown({ trigger, children, hover, align = "left", className, panelClassName }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((v) => !v), []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("blur", close);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("blur", close);
    };
  }, [open, close]);

  const hoverProps = hover
    ? {
        onMouseEnter: () => {
          if (timer.current) clearTimeout(timer.current);
          setOpen(true);
        },
        onMouseLeave: () => {
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => setOpen(false), 120);
        },
      }
    : {};

  const alignment = align === "right" ? "right-0" : align === "center" ? "left-1/2 -translate-x-1/2" : "left-0";

  return (
    <div ref={root} className={cn("relative", className)} {...hoverProps}>
      {trigger({ open, toggle })}
      {open ? (
        <div className={cn("absolute top-full z-50 pt-2 animate-[px-drop_.15s_ease-out]", alignment, panelClassName)}>
          {typeof children === "function" ? children(close) : children}
        </div>
      ) : null}
    </div>
  );
}
