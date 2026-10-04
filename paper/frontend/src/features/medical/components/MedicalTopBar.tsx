"use client";

import { AppLink } from "@/components/site/AppLink";
import { RippleButton, Sym, useNotes } from "@/features/notes";
import { useMedical } from "./MedicalProvider";

const outline = { borderColor: "var(--outline)" };

/** App bar of the medical pages: Feedback, admin-only Regenerate, Theme. */
export function MedicalTopBar() {
  const notes = useNotes();
  const medical = useMedical();
  const dark = notes.theme === "dark";
  return (
    <header
      className="sticky top-0 z-40 bg-white/70 dark:bg-brand-900/60 backdrop-blur supports-[backdrop-filter]:saturate-150 border-b border-black/5 dark:border-white/10"
      style={notes.headerHidden ? { visibility: "hidden" } : undefined}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-16 flex items-center gap-4">
          <AppLink href="/index.html" className="flex items-center gap-2 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element -- SVG logo */}
            <img src="/assets/img/logo-light.svg" alt="Paper X" className="h-8 w-auto dark:hidden" />
            {/* eslint-disable-next-line @next/next/no-img-element -- SVG logo */}
            <img src="/assets/img/logo-dark.svg" alt="Paper X" className="h-8 w-auto hidden dark:block" />
            <span className="sr-only">Paper X</span>
          </AppLink>
          <div className="ml-auto flex items-center gap-2">
            <RippleButton
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-brand-500 text-white text-sm font-semibold shadow-glow transition hover:opacity-95"
              onClick={() => notes.setFeedbackOpen(true)}
            >
              <Sym name="feedback" className="leading-none" />
              Feedback
            </RippleButton>
            {notes.roles.privileged ? (
              <RippleButton
                className="inline-flex items-center gap-1 px-3 py-2 rounded-full bg-brand-500 text-white text-sm font-semibold shadow-glow transition"
                title="Force Regenerate Note (Admin Only)"
                onClick={medical.regenerate}
              >
                <Sym name="refresh" className="leading-none" /> Regenerate
              </RippleButton>
            ) : null}
            <RippleButton
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full border text-sm hover:bg-brandlt-100 dark:hover:bg-white/10 transition"
              style={outline}
              title="Toggle theme"
              onClick={notes.toggleTheme}
            >
              <Sym name={dark ? "light_mode" : "dark_mode"} />
              <span className="hidden sm:inline">{dark ? "Light" : "Dark"}</span>
            </RippleButton>
          </div>
        </div>
      </div>
    </header>
  );
}
