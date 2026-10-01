"use client";

import type { MouseEvent } from "react";
import { cn } from "@/lib/cn";
import styles from "../notes.module.css";
import { useNotes } from "./NotesProvider";
import { RippleButton, Sym } from "./primitives";

const outline = { borderColor: "var(--outline)" };

const STEPS = [
  { key: "start", label: "Start" },
  { key: "search_results", label: "Search" },
  { key: "fetch_done", label: "Parse" },
  { key: "llm_done", label: "Generate" },
  { key: "final", label: "Done" },
];

/** Topic input, Generate / Regenerate / Cancel, sources hint and the stepper. */
export function InputCard() {
  const notes = useNotes();
  const { degree } = notes;
  const privileged = notes.roles.privileged;
  return (
    <section
      className={cn("hidden sm:block rounded-2xl p-4 sm:p-5 shadow-glow", styles.glass)}
      style={{ ...outline, background: "color-mix(in oklab, var(--surface) 75%, transparent)" }}
    >
      <div>
        <label htmlFor="topic" className="hidden sm:block text-sm font-medium mb-2">
          Topic
        </label>
        <div className="flex gap-2 items-center">
          <input
            id="topic"
            type="text"
            placeholder="e.g., Support Vector Machine"
            className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand-500/60 focus:border-brand-500"
            style={{ ...outline, background: "var(--surface)", color: "var(--surface-contrast)" }}
            value={notes.topic}
            disabled={notes.busy}
            onChange={(e) => notes.onTopicInput(e.target.value)}
          />
          <RippleButton
            className="px-3 py-2 sm:px-4 sm:py-3 rounded-xl hover:opacity-95 text-white font-medium text-sm sm:text-base shadow-neon transition disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundImage: "linear-gradient(135deg, var(--brand) 0%, var(--brand-strong) 100%)", boxShadow: "0 12px 32px rgba(158,75,138,0.35)" }}
            aria-label={notes.config.generateButton === "icon" ? "Generate notes" : undefined}
            title={notes.config.generateButton === "icon" ? "Generate notes" : undefined}
            disabled={notes.busy}
            onClick={notes.generate}
          >
            {notes.config.generateButton === "icon" ? <Sym name="auto_awesome" /> : "Generate"}
          </RippleButton>
          {privileged ? (
            <RippleButton
              className="sm:hidden px-3 py-2 rounded-xl border text-sm hover:bg-[var(--brand-soft)] transition disabled:opacity-50 disabled:cursor-not-allowed"
              style={outline}
              disabled={notes.busy}
              onClick={(e: MouseEvent) => {
                e.preventDefault();
                notes.regenerate();
              }}
            >
              Regenerate
            </RippleButton>
          ) : null}
        </div>

        {/* Degree selector: kept but always hidden (the degree is resolved from the profile). */}
        <div className="hidden mt-3 grid-cols-1 sm:grid-cols-2 gap-2 items-center">
          <div className="flex items-center gap-2">
            <label htmlFor="degreeSelect" className="text-xs font-medium shrink-0">
              Degree
            </label>
            <select
              id="degreeSelect"
              className="w-full px-3 py-2 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              style={outline}
              value={degree.select}
              onChange={(e) => degree.onSelectChange(e.target.value)}
            >
              <option value="">Select degree…</option>
              {degree.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
              <option value="custom">Other…</option>
            </select>
          </div>
          <div className={cn(degree.customVisible ? "" : "hidden", "sm:col-span-1")}>
            <input
              type="text"
              placeholder="Type your degree (e.g., B.Tech)"
              className="w-full px-3 py-2 rounded-xl border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              style={{ ...outline, background: "var(--surface)", color: "var(--surface-contrast)" }}
              value={degree.custom}
              onChange={(e) => degree.onCustomInput(e.target.value)}
            />
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 mt-3">
          {privileged ? (
            <RippleButton
              className="px-3 py-2 rounded-xl border hover:bg-[var(--brand-soft)] transition disabled:opacity-50 disabled:cursor-not-allowed"
              style={outline}
              disabled={notes.busy}
              onClick={notes.regenerate}
            >
              Regenerate
            </RippleButton>
          ) : null}
          <RippleButton
            className="px-3 py-2 rounded-xl border hover:bg-[var(--brand-soft)] transition disabled:opacity-50 disabled:cursor-not-allowed"
            style={outline}
            disabled={!notes.busy}
            onClick={notes.cancel}
          >
            Cancel
          </RippleButton>
          <div className="text-xs text-[var(--muted)] ml-auto">
            <span>{degree.domainsHint}</span>
          </div>
        </div>
      </div>

      <div className="pt-4 hidden sm:block">
        <ol className="grid grid-cols-5 gap-2 text-[11px] text-center text-[var(--muted)]">
          {STEPS.map((step) => (
            <li key={step.key} className={cn(notes.activeStage === step.key && "text-brand-700")}>
              {step.label}
            </li>
          ))}
        </ol>
        <div className="h-1.5 mt-2 bg-[var(--brand-soft)] rounded-full overflow-hidden">
          <div className="h-full bg-brand-500 transition-all" style={{ width: `${notes.progress}%` }} />
        </div>
      </div>
    </section>
  );
}

/** "Related Images" gallery (hidden on every notes page, but kept up to date). */
export function ImagesCard({ visible = false }: { visible?: boolean }) {
  const { images } = useNotes();
  return (
    <section className={visible ? undefined : "hidden"} style={outline}>
      <div className="p-4 sm:p-5">
        <h3 className="text-sm font-semibold mb-3">Related Images</h3>
        <div className="grid grid-cols-3 gap-2">
          {images === null
            ? [0, 1, 2].map((i) => <div key={i} className={cn("h-24 rounded-lg", styles.skeleton)} />)
            : images.slice(0, 9).map((url) => (
                <a key={url} href={url} target="_blank" rel="noopener">
                  {/* eslint-disable-next-line @next/next/no-img-element -- remote reference images */}
                  <img src={url} alt="reference image" className="w-full h-24 object-cover rounded-lg border" style={outline} />
                </a>
              ))}
        </div>
      </div>
    </section>
  );
}

/** Sticky "Contents" card built from the rendered headings. */
export function TocCard({ visible }: { visible?: boolean }) {
  const notes = useNotes();
  const show = visible ?? notes.config.toc;
  return (
    <section className={show ? cn("rounded-2xl shadow-glow sticky top-24 hidden sm:block", styles.glass) : "hidden"} style={outline}>
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">Contents</h3>
          <div className="text-xs text-[var(--muted)] hidden">{notes.meta}</div>
        </div>
        <nav className={cn("text-sm space-y-1 max-h-72 overflow-auto pr-1", styles.thinScroll)}>
          {notes.toc.map((item, i) => (
            <a
              key={`${item.id}-${i}`}
              href={`#${item.id}`}
              className={cn(item.level > 1 && "ml-3", "block px-2 py-1 rounded hover:bg-[var(--brand-soft)]")}
              onClick={(e) => {
                const target = notes.outputRef.current?.querySelector<HTMLElement>(`[id="${CSS.escape(item.id)}"]`);
                if (!target) return;
                e.preventDefault();
                window.history.pushState(null, "", `#${item.id}`);
                target.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              {item.text}
            </a>
          ))}
        </nav>
      </div>
    </section>
  );
}
