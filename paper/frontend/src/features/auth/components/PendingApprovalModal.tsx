"use client";

import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui";
import styles from "../auth.module.css";

/** teacher_login.html: shown when the teacher application is still pending. */
export function PendingApprovalModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div
      className={cn("fixed inset-0 z-50 items-center justify-center bg-black/70 backdrop-blur-sm", open ? "flex" : "hidden")}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pendingModalTitle"
        className={cn(styles.glassCard, styles.fadeIn, "rounded-3xl p-6 sm:p-8 shadow-glow ring-1 ring-black/5 dark:ring-white/10 max-w-md")}
      >
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
            <Icon name="hourglass_top" className="text-3xl text-amber-600" />
          </div>
          <h3 id="pendingModalTitle" className="text-xl font-semibold !text-neutral-800 dark:!text-white">
            Application Pending
          </h3>
          <div className="space-y-3 text-sm text-neutral-600 dark:text-white/70">
            <p className="font-medium">Your application is awaiting approval.</p>
            <div className="rounded-xl bg-brand-500/10 dark:bg-brand-500/20 px-4 py-3 space-y-2">
              <p className="flex items-center justify-center gap-2">
                <Icon name="call" className="text-base text-brand-500" />
                <span className="font-semibold text-brand-700 dark:text-brand-300">Contact: 9360637060</span>
              </p>
              <p className="text-xs text-neutral-500 dark:text-white/50">
                New sign ups can take upto 3h for approval, from the time of signup
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#9E4B8A] via-[#B06AB3] to-[#FF7FD1] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(158,75,138,0.25)] hover:shadow-[0_12px_28px_rgba(158,75,138,0.32)] transition"
          >
            <span>Got it</span>
          </button>
        </div>
      </div>
    </div>
  );
}
