"use client";

import { useEffect, useId, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

export interface DialogProps {
  open: boolean;
  title: ReactNode;
  description?: ReactNode;
  /** Escape-key close (the devices list). Omit for forced dialogs. */
  onClose?: () => void;
  /** Backdrop colour class (`bg-black/70`); empty for a transparent backdrop. */
  backdropClassName?: string;
  /** Panel width/extra classes, e.g. `max-w-2xl`. */
  panelClassName?: string;
  panelStyle?: CSSProperties;
  /** Rendered next to the title (e.g. a close button). */
  headerAction?: ReactNode;
  children: ReactNode;
}

/**
 * The profile page's centred dialogs (devices list, "Complete your profile").
 * Unlike the shared Modal they have the page's own frosted panel, solid
 * backdrop and no bottom-sheet layout on phones. Body scrolling is locked
 * while open (`overflow-hidden` on <body>, as before).
 */
export function Dialog({ open, title, description, onClose, backdropClassName, panelClassName, panelStyle, headerAction, children }: DialogProps) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  // The portal target only exists in the browser.
  // eslint-disable-next-line react-hooks/set-state-in-effect -- mount flag
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    document.body.classList.add("overflow-hidden");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("overflow-hidden");
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      {/* The panel wrapper covers the backdrop, so (as on the original) clicking outside does not close. */}
      <div className={cn("absolute inset-0", backdropClassName)} aria-hidden="true" />
      <div className="relative h-full w-full flex items-center justify-center p-4">
        <div
          className={cn(
            "w-full rounded-3xl border border-black/10 dark:border-white/10 bg-white/95 dark:bg-brand-900/95 text-neutral-900 dark:text-white shadow-card backdrop-blur supports-[backdrop-filter]:backdrop-blur-xl p-6",
            panelClassName,
          )}
          style={panelStyle}
        >
          <div className={cn("flex items-start justify-between", headerAction ? "gap-4" : "gap-3")}>
            <div>
              <h3 id={titleId} className="text-lg font-semibold">
                {title}
              </h3>
              {description ? <p className="text-xs text-black/60 dark:text-white/60 mt-1">{description}</p> : null}
            </div>
            {headerAction}
          </div>
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
