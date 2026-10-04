"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { notesApi } from "../api";
import styles from "../notes.module.css";
import { useNotes } from "./NotesProvider";
import { RippleButton, Sym } from "./primitives";

const outline = { borderColor: "var(--outline)" };
const chip = "px-3 py-2 rounded-lg border text-xs hover:bg-[var(--brand-soft)]";

/**
 * Floating "Tune AI" assistant (maths notes): summarize / expand / simplify or
 * a custom instruction over the whole note via `POST /api/notes/transform`,
 * with a Revert to the markdown from before the first transform. Results are
 * not saved until the user saves in the editor.
 */
export function AiAssistant() {
  const notes = useNotes();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [canRevert, setCanRevert] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) promptRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      const panel = panelRef.current;
      if (!open || !panel) return;
      const target = e.target as Node;
      if (panel.contains(target) || target === fabRef.current) return;
      const rect = panel.getBoundingClientRect();
      if (e.clientX < rect.left - 20 || e.clientY < rect.top - 20) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [open]);

  const current = () => (notes.editing ? notes.editorValue || "" : notes.markdownRef.current || "");

  const run = async (mode: "summarize" | "expand" | "simplify" | "custom", custom?: string) => {
    const md = current().trim();
    if (!md) return notes.snack("Nothing to transform");
    if (snapshot === null) setSnapshot(md);
    setBusy(true);
    try {
      const res = await notesApi.transform(mode, md, custom);
      if (!res.ok) throw new Error((await res.text()) || "Transform failed");
      const data = (await res.json()) as { markdown?: string };
      if (data.markdown) {
        notes.renderMarkdown(data.markdown);
        setCanRevert(true);
        notes.snack(`${mode[0].toUpperCase() + mode.slice(1)} done`);
      }
    } catch (err) {
      console.error(err);
      notes.snack("AI error");
    } finally {
      setBusy(false);
    }
  };

  const revert = () => {
    if (snapshot === null) return;
    notes.renderMarkdown(snapshot);
    setSnapshot(null);
    setCanRevert(false);
    notes.snack("Reverted");
  };

  return (
    <>
      {/* `.ripple` made the original FAB position: relative (not fixed), so it sits below the output card. */}
      <RippleButton
        ref={fabRef}
        title="AI Assistant"
        className="bottom-6 right-10 w-14 h-14 rounded-full shadow-neon bg-gradient-to-tr from-fuchsia-500 via-brand-500 to-indigo-500 text-white flex items-center justify-center text-2xl font-semibold hover:scale-105 active:scale-95 transition-transform"
        onClick={() => setOpen((v) => !v)}
      >
        <Sym name="robot_2" outlined />
      </RippleButton>
      <div
        ref={panelRef}
        className={cn(
          "fixed bottom-28 right-6 w-[min(420px,90vw)] max-h-[70vh] flex flex-col rounded-2xl shadow-neon overflow-hidden opacity-0 translate-y-4 transition-all duration-300",
          styles.glass,
          styles.aiPanel,
          open ? styles.open : "pointer-events-none",
        )}
        style={{ ...outline, backdropFilter: "blur(14px)" }}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b" style={outline}>
          <Sym name="robot_2" outlined className="text-brand-500" />
          <h2 className="text-sm font-semibold">Tune AI</h2>
          <span className={cn("ml-auto text-[11px] text-[var(--muted)]", !busy && "hidden")}>Processing...</span>
          <RippleButton className="ml-2 px-2 py-1 rounded-md border text-xs hover:bg-[var(--brand-soft)]" style={outline} onClick={() => setOpen(false)}>
            <Sym name="close" outlined />
          </RippleButton>
        </div>
        <div className={cn("p-4 space-y-3 text-sm overflow-auto", styles.customScroll)}>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["summarize", "compress", "Summarize"],
                ["expand", "unfold_more", "Expand"],
                ["simplify", "lightbulb", "Simplify"],
              ] as const
            ).map(([mode, icon, label]) => (
              <RippleButton key={mode} className={chip} style={outline} disabled={busy} onClick={() => void run(mode)}>
                <Sym name={icon} outlined className="align-middle mr-1" />
                {label}
              </RippleButton>
            ))}
            {canRevert ? (
              <RippleButton className="px-3 py-2 rounded-lg border text-xs bg-[var(--chip)]" style={outline} disabled={busy} onClick={revert}>
                <Sym name="undo" outlined className="align-middle mr-1" />
                Revert
              </RippleButton>
            ) : null}
          </div>
          <div>
            <label htmlFor="aiCustomPrompt" className="block text-[11px] tracking-wide uppercase font-medium mb-1 text-[var(--muted)]">
              Custom Instruction
            </label>
            <textarea
              id="aiCustomPrompt"
              ref={promptRef}
              rows={3}
              placeholder="e.g. Add intuitive analogies without altering equations"
              className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              style={{ ...outline, background: "var(--surface)", color: "var(--surface-contrast)" }}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <RippleButton
              className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium tracking-wide"
              disabled={busy}
              onClick={() => {
                const instruction = prompt.trim();
                if (!instruction) {
                  notes.snack("Enter instruction");
                  promptRef.current?.focus();
                  return;
                }
                void run("custom", instruction);
              }}
            >
              Run
            </RippleButton>
            <RippleButton
              className={chip}
              style={outline}
              disabled={busy}
              onClick={() => {
                setPrompt("");
                promptRef.current?.focus();
              }}
            >
              Clear
            </RippleButton>
            <div className="ml-auto text-[10px] text-[var(--muted)]">Transforms are temporary until saved.</div>
          </div>
          <div className="rounded-lg border p-3 text-[11px] leading-relaxed" style={outline}>
            <p className="mb-1 font-semibold text-[12px]">Hints</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Chain prompts (e.g. &quot;shorten section 2 then add table&quot;).</li>
              <li>Use Revert to restore original when first transform began.</li>
              <li>Edits here do not auto-save — click Save in editor.</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
