"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  /** Footer area (actions). */
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /** Hide the × button and ignore Escape/backdrop clicks (forced flows). */
  dismissible?: boolean;
  className?: string;
  children?: ReactNode;
}

const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl", full: "max-w-[min(96vw,1400px)]" };

/** Accessible dialog rendered in a portal with a blurred backdrop. */
export function Modal({ open, onClose, title, description, footer, size = "md", dismissible = true, className, children }: ModalProps) {
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dismissible) onClose();
    };
    document.addEventListener("keydown", onKey);
    panel.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [open, dismissible, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm animate-[px-fade_.15s_ease-out]"
        onClick={dismissible ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={cn(
          "relative w-full max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-black/10 dark:border-white/10",
          "bg-white dark:bg-brand-900 text-neutral-900 dark:text-white shadow-card outline-none animate-[px-pop_.18s_ease-out]",
          widths[size],
          className,
        )}
      >
        {title || dismissible ? (
          <div className="flex items-start justify-between gap-4 px-6 pt-5">
            <div>
              {title ? (
                <h2 id={titleId} className="text-lg font-semibold">
                  {title}
                </h2>
              ) : null}
              {description ? <p className="mt-1 text-sm text-neutral-600 dark:text-white/60">{description}</p> : null}
            </div>
            {dismissible ? (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="inline-flex size-9 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
              >
                <Icon name="close" />
              </button>
            ) : null}
          </div>
        ) : null}
        <div className="px-6 py-5">{children}</div>
        {footer ? (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-black/5 dark:border-white/10 px-6 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
