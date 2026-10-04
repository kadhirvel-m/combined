"use client";

import { useEffect, type ReactNode, type Ref } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export interface SyllabusDialogProps {
  /** id of the title element. */
  labelledBy: string;
  /** Backdrop click. */
  onDismiss: () => void;
  /** Close on Escape (unit and LabX dialogs). */
  closeOnEscape?: boolean;
  /** Add `overflow-hidden` to <body> while open (unit and LabX dialogs). */
  lockScroll?: boolean;
  /** Backdrop colours (default: brand ink / black at 70%). */
  backdropClassName?: string;
  /** Panel width, height and background. */
  panelClassName?: string;
  panelRef?: Ref<HTMLDivElement>;
  children: ReactNode;
}

/**
 * Frame of the syllabus page's dialogs: a centred panel over a blurred
 * backdrop that closes on click. Unlike the shared Modal it keeps the
 * original markup (padding, z-index, no bottom sheet on phones).
 */
export function SyllabusDialog({
  labelledBy,
  onDismiss,
  closeOnEscape,
  lockScroll,
  backdropClassName,
  panelClassName,
  panelRef,
  children,
}: SyllabusDialogProps) {
  useEffect(() => {
    if (!closeOnEscape) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeOnEscape, onDismiss]);

  useEffect(() => {
    if (!lockScroll) return;
    document.body.classList.add("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, [lockScroll]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
    >
      <div
        className={cn("fixed inset-0 backdrop-blur-sm", backdropClassName ?? "bg-brand-900/70 dark:bg-black/70")}
        onClick={onDismiss}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        className={cn("relative w-full rounded-3xl border border-black/10 dark:border-white/10", panelClassName)}
      >
        {children}
      </div>
    </div>
  );
}

export interface DialogHeaderProps {
  titleId: string;
  title: ReactNode;
  subtitle: ReactNode;
  onClose: () => void;
  /** Buttons before the close button (LabX code toggle). */
  actions?: ReactNode;
  className?: string;
}

/** Title, subtitle and × of a syllabus dialog. */
export function DialogHeader({ titleId, title, subtitle, onClose, actions, className }: DialogHeaderProps) {
  const close = (
    <button
      type="button"
      onClick={onClose}
      aria-label="Close"
      className="rounded-full border border-transparent p-2 text-neutral-500 hover:text-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60"
    >
      <Icon name="close" className="text-lg" />
    </button>
  );
  return (
    <div className={cn("flex items-start justify-between gap-4 border-b border-black/5 dark:border-white/10 px-6 py-5", className)}>
      <div>
        <h2 id={titleId} className="text-xl font-semibold text-neutral-900 dark:text-white">
          {title}
        </h2>
        <p className="mt-1 text-sm text-neutral-600 dark:text-white/70">{subtitle}</p>
      </div>
      {actions ? (
        <div className="flex items-center gap-2">
          {actions}
          {close}
        </div>
      ) : (
        close
      )}
    </div>
  );
}

/** Spinner icon used in busy buttons. */
export function BusyIcon({ className = "text-base" }: { className?: string }) {
  return <Icon name="progress_activity" className={cn("animate-spin", className)} />;
}

/** Shared button looks of the dialogs. */
export const dialogButton = {
  gradient:
    "inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-500 via-[#B06AB3] to-[#FF7FD1] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(158,75,138,0.35)] hover:shadow-[0_14px_34px_rgba(158,75,138,0.45)] transition",
  outline:
    "inline-flex items-center justify-center rounded-full border border-black/10 dark:border-white/15 px-4 py-2 text-sm font-medium text-neutral-600 dark:text-white/70 hover:border-brand-500/50 transition",
  danger:
    "inline-flex items-center gap-2 rounded-full border border-red-300/60 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-200 px-4 py-2 text-sm font-medium hover:border-red-400/80 hover:bg-red-100 dark:hover:bg-red-500/20 transition",
  /** `dark:bg-brand-500/10`, `hover:bg-brand-100` and `dark:hover:bg-brand-500/20` were missing from the original stylesheet. */
  brandSoft:
    "inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-50 text-brand-700 dark:text-brand-200 transition",
} as const;
