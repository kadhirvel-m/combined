"use client";

import type { ReactNode } from "react";
import { AppLink } from "@/components/site/AppLink";
import { cn } from "@/lib/cn";
import { useNotes } from "./NotesProvider";
import { RippleButton, Sym } from "./primitives";

const outline = { borderColor: "var(--outline)" };

/** The notes app bar: logo, optional links, Feedback / Share / MCQ / Density / Theme and the teacher review controls. */
export function NotesTopBar({ actions }: { actions?: ReactNode }) {
  const notes = useNotes();
  const { header } = notes.config;
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
          {header.navLinks.length ? (
            <div className="hidden sm:flex items-center gap-4 text-sm text-neutral-700 dark:text-white/85">
              {header.navLinks.map((link) => (
                <AppLink key={link.href} href={link.href} className="px-3 py-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
                  {link.label}
                </AppLink>
              ))}
            </div>
          ) : null}
          <div className="ml-auto flex items-center gap-2">
            <RippleButton
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-brand-500 text-white text-sm font-semibold shadow-glow transition hover:opacity-95"
              onClick={() => notes.setFeedbackOpen(true)}
            >
              <Sym name="feedback" />
              Feedback
            </RippleButton>
            {header.share ? (
              <RippleButton
                className="inline-flex items-center gap-2 px-3 py-2 rounded-full border text-sm font-semibold hover:bg-brandlt-100 dark:hover:bg-white/10 transition"
                style={outline}
                onClick={() => notes.setShareOpen(true)}
              >
                <Sym name="share" />
                Share
              </RippleButton>
            ) : null}
            {notes.mcq ? (
              <RippleButton
                className={cn(
                  "px-3 py-2 rounded-full bg-brand-500 text-white text-sm font-semibold shadow-glow transition disabled:opacity-60 disabled:cursor-not-allowed",
                  notes.mcqOpening && "pointer-events-none opacity-70",
                )}
                onClick={(e) => {
                  e.preventDefault();
                  void notes.openMcq();
                }}
              >
                {notes.mcqOpening ? "Opening…" : "MCQ"}
              </RippleButton>
            ) : null}
            {header.density ? (
              <RippleButton
                className="hidden sm:inline-flex px-3 py-2 rounded-full border text-sm hover:bg-brandlt-100 dark:hover:bg-white/10 transition"
                style={outline}
                title="Toggle density"
                onClick={notes.toggleDensity}
              >
                Density
              </RippleButton>
            ) : null}
            {actions}
            <RippleButton
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full border text-sm hover:bg-brandlt-100 dark:hover:bg-white/10 transition"
              style={outline}
              title="Toggle theme"
              onClick={notes.toggleTheme}
            >
              <Sym name={notes.theme === "dark" ? "light_mode" : "dark_mode"} />
              <span className="hidden sm:inline">{notes.theme === "dark" ? "Light" : "Dark"}</span>
            </RippleButton>
            {header.verify && notes.verifiedBy ? (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs sm:text-sm font-medium bg-[var(--brand-soft)] text-[var(--surface-contrast)]"
                style={outline}
              >
                <Sym name="verified_user" />
                <span>Verified by {notes.verifiedBy}</span>
              </span>
            ) : null}
            {header.verify && notes.roles.verify ? (
              <RippleButton
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600 transition shadow-glow"
                disabled={notes.verifyDisabled}
                onClick={() => void notes.approve()}
              >
                <Sym name="verified" />
                <span>{notes.verifyLabel}</span>
              </RippleButton>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
