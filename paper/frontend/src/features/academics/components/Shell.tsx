"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";
import { Lottie } from "@/components/content/Lottie";
import type { PageLoader } from "../hooks/usePageLoader";
import styles from "../academics.module.css";
import { Glyph as GlyphInline } from "./Glyph";

const LOADER_LOTTIE = "https://lottie.host/848055f4-11c7-4032-80e0-d51319c33bca/lF6845uqpU.lottie";

/** Developer-mode "fire aurora" behind the page. */
export function DevAurora({ active }: { active: boolean }) {
  return (
    <div className={cn(styles.aurora, active && styles.auroraActive)} aria-hidden="true">
      <div className={cn(styles.blob, styles.blob1)} />
      <div className={cn(styles.blob, styles.blob2)} />
      <div className={cn(styles.blob, styles.blob3)} />
      <div className={cn(styles.blob, styles.blob4)} />
      <div className={cn(styles.blob, styles.blob5)} />
    </div>
  );
}

/** Full-screen loader: Lottie, status line and progress bar. */
export function PageLoaderOverlay({ loader }: { loader: PageLoader }) {
  // Kept mounted once done (display: none), as in the original.
  return (
    <div
      className={cn(styles.pageLoader, loader.phase !== "loading" && styles.pageLoaderDone)}
      style={loader.phase === "gone" ? { display: "none" } : undefined}
    >
      <div className={styles.loaderShell}>
        <Lottie src={LOADER_LOTTIE} className="h-[300px] w-[300px]" />
        <div className={styles.loaderStatus}>{loader.status}</div>
        <div className={styles.loaderTrack}>
          <div className={styles.loaderBar} style={{ width: `${loader.width}%`, transition: loader.transition }} />
        </div>
      </div>
    </div>
  );
}

/** "DEV" switch (label only on desktop). */
export function DevModeToggle({ checked, onChange, label }: { checked: boolean; onChange: (on: boolean) => void; label?: boolean }) {
  return (
    <div className={styles.devWrap}>
      {label ? <span className={cn(styles.devLabel, checked && styles.devLabelActive)}>DEV</span> : null}
      <label className={styles.devToggle} title="Developer Mode">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className={styles.slider} />
      </label>
    </div>
  );
}

/** The "Access Policy Guard" dialog (no z-index/tint: those classes were dead in the original). */
export function AccessModal({ open, title, message, onClose }: { open: boolean; title: string; message: string; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  if (!open) return null;
  return (
    <div
      className="fixed inset-0"
      onClick={(e) => {
        if (!panel.current?.contains(e.target as Node)) onClose();
      }}
    >
      <div className="absolute inset-0 backdrop-blur-md" />
      <div className="relative h-full w-full flex items-center justify-center p-4">
        <div
          ref={panel}
          role="dialog"
          aria-modal="true"
          className="w-full max-w-lg overflow-hidden rounded-3xl border border-brand-500/25 bg-white/95"
        >
          <div className="h-1.5 bg-gradient-to-r from-brand-500" />
          <div className="p-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-700 dark:text-brand-300">
              <GlyphInline name="shield_lock" className="text-[14px]" />
              <span>Access Policy Guard</span>
            </div>
            <div className="mt-4 flex items-start gap-4">
              <div className="shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br border flex items-center justify-center">
                <GlyphInline name="error" className="text-rose-500" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">{title}</h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-white/60">Your current plan policy blocked this action for today.</p>
              </div>
            </div>
            <div className="mt-5 rounded-2xl border border-black/10 dark:border-white/10 dark:bg-white/5 p-4">
              <p className="text-sm text-slate-700 dark:text-white/85">{message}</p>
              <p className="mt-3 text-xs sm:text-sm text-slate-500 dark:text-white/60 inline-flex items-center gap-2">
                <GlyphInline name="schedule" className="text-[16px]" />
                <span>Try again after quota reset or switch to a higher plan.</span>
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
              >
                <GlyphInline name="check_circle" className="text-[18px]" />
                <span>Understood</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

