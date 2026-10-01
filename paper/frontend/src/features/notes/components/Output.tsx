"use client";

import { useState, type ReactNode } from "react";
import { Lottie } from "@/components/content/Lottie";
import { Markdown } from "@/components/content/Markdown";
import { cn } from "@/lib/cn";
import type { LimitInfo } from "../hooks/useAccess";
import styles from "../notes.module.css";
import { useNotes } from "./NotesProvider";
import { RippleButton, Sym } from "./primitives";

const outline = { borderColor: "var(--outline)" };
const PROSE = "prose prose-slate dark:prose-invert max-w-none";
const LOADER_SRC = "https://lottie.host/848055f4-11c7-4032-80e0-d51319c33bca/lF6845uqpU.lottie";

/** Detailed / Cheat Sheet (/ Simple) segmented switch. */
export function VariantSwitcher() {
  const notes = useNotes();
  return (
    <div className="inline-flex items-center mr-2 rounded-xl border p-0.5 bg-[var(--surface)]" role="tablist" aria-label="Variant" style={outline}>
      {notes.config.variants.map((v) => {
        const on = v.key === notes.variant;
        return (
          <RippleButton
            key={v.key}
            data-variant={v.key}
            aria-selected={on ? "true" : "false"}
            className={cn("px-3 py-1.5 rounded-lg text-xs hover:bg-[var(--brand-soft)] transition", on ? "bg-brand-600 text-white shadow-neon" : "bg-transparent text-inherit")}
            onClick={() => notes.selectVariant(v.key)}
          >
            {v.label}
          </RippleButton>
        );
      })}
    </div>
  );
}

const ACTION_LABELS: Record<string, string> = {
  topic_open: "Topic access",
  subject_open: "Subject access",
  ai_prompt: "AI generation",
  mcq_attempt: "MCQ access",
  blink_view: "Blink access",
  search: "Search access",
};

/** "Daily limit reached" panel shown in the output when a plan quota denies the action. */
export function LimitPanel({ limit }: { limit: LimitInfo }) {
  const remaining = limit.remaining === null || limit.remaining === undefined ? "Remaining today: —" : `Remaining today: ${limit.remaining}`;
  return (
    <section
      className="rounded-3xl border p-6 sm:p-8 shadow-glow"
      style={{
        ...outline,
        background:
          "radial-gradient(1200px 400px at 0% 0%, color-mix(in oklab, var(--brand) 22%, transparent), transparent 45%), radial-gradient(900px 300px at 100% 100%, color-mix(in oklab, var(--brand-strong) 20%, transparent), transparent 48%), color-mix(in oklab, var(--surface) 88%, transparent)",
      }}
    >
      <div className="flex flex-col gap-4">
        <div className="inline-flex items-center gap-3 text-[12px] font-semibold tracking-wide uppercase text-[var(--muted)]">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border" style={outline}>
            🛸
          </span>
          <span>Policy Shield Active</span>
        </div>
        <div className="text-4xl sm:text-5xl leading-none">🛰️🚫✨💫</div>
        <h2 className="text-xl font-extrabold tracking-tight">Daily limit reached for {ACTION_LABELS[limit.action] || "Access"}</h2>
        <p className="text-sm sm:text-base text-[var(--muted)]">{limit.reason}</p>
        <div
          className="mt-1 inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm"
          style={{ ...outline, background: "color-mix(in oklab, var(--brand-soft) 70%, transparent)" }}
        >
          <Sym name="schedule" />
          <span>{remaining}</span>
        </div>
        <p className="text-xs sm:text-sm text-[var(--muted)]">Try again after your daily quota resets or upgrade your plan for higher limits.</p>
      </div>
    </section>
  );
}

/** The rendered notes (`#output`): markdown + math + code, or the limit panel. Replaceable via `<NotesLayout output>`. */
export function NotesOutput() {
  const { outputRef, editing, view, limit, displayMarkdown, onOutputRendered } = useNotes();
  return (
    <article id="output" ref={outputRef} className={cn(styles.output, editing && "hidden")}>
      {view === "limit" && limit ? (
        <div className={PROSE}>
          <LimitPanel limit={limit} />
        </div>
      ) : (
        <Markdown content={displayMarkdown} prose={false} className={PROSE} onRendered={onOutputRendered} />
      )}
    </article>
  );
}

export interface OutputCardProps {
  /** Replaces the variant switcher. */
  variantSwitcher?: ReactNode;
  /** Extra toolbar controls (after Fullscreen). */
  toolbarExtra?: ReactNode;
  /** Replaces the rendered output (`<NotesOutput />`). */
  output?: ReactNode;
}

/** "Final Output" card: toolbar, output, loader, editor and fullscreen controls. */
export function OutputCard({ variantSwitcher, toolbarExtra, output }: OutputCardProps) {
  const { wrapRef, editorRef, ...notes } = useNotes();
  const { roles, config } = notes;
  // Like the original <dotlottie-wc>, the loader stays mounted (hidden) after its first use.
  const [loaderUsed, setLoaderUsed] = useState(false);
  if (notes.loading && !loaderUsed) setLoaderUsed(true);
  const tool = "px-3 py-2 rounded-lg border text-sm hover:bg-[var(--brand-soft)]";
  return (
    <div className={cn("rounded-2xl shadow-glow", styles.glass)} style={outline}>
      <div className="px-4 sm:px-5 py-3 border-b flex items-center gap-2" style={outline}>
        <h3 className="text-sm font-semibold mr-auto">Final Output</h3>
        {variantSwitcher ?? <VariantSwitcher />}
        {notes.editing ? (
          <RippleButton className="px-3 py-2 rounded-lg bg-emerald-500/90 hover:bg-emerald-600 text-white text-sm" onClick={() => void notes.save()}>
            Save
          </RippleButton>
        ) : null}
        {notes.myNoteVisible ? (
          <RippleButton
            className={tool}
            style={outline}
            onClick={(e) => {
              e.preventDefault();
              void notes.loadMyNote();
            }}
          >
            My note
          </RippleButton>
        ) : null}
        {roles.edit ? (
          <RippleButton className={cn(config.editDesktopOnly ? "hidden sm:inline-flex" : "inline-flex", tool)} style={outline} onClick={notes.toggleEdit}>
            {notes.editing ? "Preview" : "Edit"}
          </RippleButton>
        ) : null}
        {roles.privileged ? (
          <RippleButton className={cn("hidden sm:inline-flex", tool)} style={outline} onClick={() => void notes.download()}>
            Download
          </RippleButton>
        ) : null}
        {roles.emphasis ? (
          <RippleButton className={cn("hidden sm:inline-flex", tool, styles.hideOnPhone, notes.emphasis && "bg-[var(--brand-soft)]")} style={outline} onClick={notes.toggleEmphasis}>
            {notes.emphasis ? "Emphasis On" : "Emphasis"}
          </RippleButton>
        ) : null}
        <RippleButton className={cn("hidden sm:inline-flex", tool, styles.hideOnPhone)} style={outline} onClick={() => notes.setFullscreen(!notes.fullscreen)}>
          {notes.fullscreen ? "Exit" : "Fullscreen"}
        </RippleButton>
        {toolbarExtra}
      </div>

      <div
        ref={wrapRef}
        id="outputWrap"
        className={cn(
          styles.wrap,
          "relative p-4 sm:p-6 overflow-x-auto",
          styles.thinScroll,
          notes.loading && styles.loading,
          notes.emphasis && styles.emph,
          notes.fullscreen && "inset-0 z-50 bg-[var(--surface)] overflow-auto",
          notes.fullscreen && !config.fullscreen.native && "p-6",
        )}
      >
        {loaderUsed ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none" style={notes.loading ? undefined : { display: "none" }}>
            <div className={styles.loaderBox}>{config.loader === "lottie" ? <Lottie src={LOADER_SRC} className="w-full h-full" /> : null}</div>
          </div>
        ) : null}
        {output ?? <NotesOutput />}
        {notes.editing ? (
          <textarea
            ref={editorRef}
            className="w-full h-[60vh] mt-2 p-3 rounded-lg border font-mono text-[13px] font-semibold"
            style={{ ...outline, background: "var(--surface)", color: "var(--surface-contrast)" }}
            spellCheck={false}
            value={notes.editorValue}
            onChange={(e) => notes.setEditorValue(e.target.value)}
          />
        ) : null}
        {notes.fullscreen ? (
          <div className={cn("fixed top-4 right-4 z-[60] flex items-center gap-2", styles.hideOnPhone)}>
            {config.fullscreen.controls === "theme" ? (
              <>
                <RippleButton
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-full border text-sm bg-[var(--surface)] hover:bg-brandlt-100 dark:hover:bg-white/10 transition shadow-lg"
                  style={outline}
                  title="Toggle theme"
                  onClick={notes.toggleTheme}
                >
                  <Sym name="dark_mode" />
                  <span className="hidden sm:inline">Theme</span>
                </RippleButton>
                <RippleButton className="px-3 py-2 rounded-lg border text-sm bg-[var(--surface)] hover:bg-[var(--brand-soft)] shadow-lg" style={outline} onClick={() => notes.setFullscreen(false)}>
                  Exit Fullscreen
                </RippleButton>
              </>
            ) : (
              <>
                <RippleButton className="px-3 py-1.5 rounded-lg border text-sm hover:bg-[var(--brand-soft)]" style={outline} onClick={() => notes.setFullscreen(false)}>
                  Exit Fullscreen
                </RippleButton>
                <RippleButton
                  className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm"
                  onClick={() => window.location.assign(new URL("/index.html", window.location.href).toString())}
                >
                  Home
                </RippleButton>
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
