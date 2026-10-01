"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Markdown } from "@/components/content/Markdown";
import { getAnalytics } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { notesApi } from "../api";
import { findClosestHeading, isWithinCode, mapSelectionToMarkdown } from "../lib/selectionMapping";
import styles from "../notes.module.css";
import { useNotes } from "./NotesProvider";
import { RippleButton, Sym } from "./primitives";

const PREVIEW_MAX = 420;
const outline = { borderColor: "var(--outline)" };

interface Rect {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
}

/** The current text selection inside the rendered notes. */
export interface OutputSelection {
  text: string;
  rect: Rect;
  anchorNode: Node | null;
  focusNode: Node | null;
}

export interface SelectionFabAction {
  /** Accessible label / tooltip of the floating button. */
  label: string;
  title?: string;
  /** Called with the selection; `close` hides the button and panel. */
  run: (selection: OutputSelection, close: () => void) => void;
}

function captureRect(range: Range | null): Rect | null {
  if (!range) return null;
  const r = range.getBoundingClientRect();
  if (!r || (!r.width && !r.height)) return null;
  return { top: r.top + window.scrollY, left: r.left + window.scrollX, right: r.right + window.scrollX, bottom: r.bottom + window.scrollY, width: r.width || 0 };
}

/**
 * Inline "TuneAI" helper: selecting text in the output shows a floating
 * button; it opens a panel to ask about the selection, get a short meaning or
 * (staff) rewrite that part of the notes. `fabAction` replaces what the
 * floating button does (img_gen generates an image instead).
 */
export function SelectionAssistant({ fabAction }: { fabAction?: SelectionFabAction }) {
  const notes = useNotes();
  const { outputRef, snack, config } = notes;
  const selection = useRef<OutputSelection | null>(null);
  const pinned = useRef(false);
  const busyRef = useRef(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const [fab, setFabState] = useState<{ left: number; top: number; visible: boolean } | null>(null);
  const setFab = useCallback((pos: { left: number; top: number } | null) => setFabState((cur) => (pos ? { ...pos, visible: true } : cur ? { ...cur, visible: false } : cur)), []);
  const [panelPos, setPanelPos] = useState<{ left: number; top: number } | null>(null);
  const [context, setContext] = useState("Select text in the Final Output to get inline Gemini help.");
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [status, setStatusState] = useState<{ text: string; error: boolean } | null>(null);
  const [busy, setBusyState] = useState(false);
  const [focusRequest, setFocusRequest] = useState(0);

  const within = useCallback(
    (node: Node | null) => {
      const el = node && node.nodeType === Node.TEXT_NODE ? node.parentNode : node;
      return !!(el && outputRef.current?.contains(el));
    },
    [outputRef],
  );

  const setStatus = (text: string, error = false) => setStatusState(text ? { text, error } : null);
  const setBusy = (b: boolean) => {
    busyRef.current = b;
    setBusyState(b);
    if (b) setStatusState({ text: "Asking TuneAI…", error: false });
    else setStatusState((s) => (s?.error ? s : null));
  };

  const updatePreview = (text: string) =>
    setContext(text ? text.slice(0, PREVIEW_MAX) + (text.length > PREVIEW_MAX ? "…" : "") : "Select text in the Final Output to get inline Gemini help.");

  const positionPanel = useCallback(() => {
    const panel = panelRef.current;
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    const width = panel?.offsetWidth || Math.min(420, vw - 32);
    const rect = selection.current?.rect;
    let left = rect ? rect.left : window.scrollX + (vw - width) / 2;
    let top = rect ? rect.bottom + 12 : window.scrollY + 80;
    left = Math.min(Math.max(window.scrollX + 16, left), window.scrollX + vw - width - 16);
    const maxTop = window.scrollY + vh - (panel?.offsetHeight || 0) - 16;
    top = Math.min(Math.max(window.scrollY + 16, top), Number.isFinite(maxTop) ? maxTop : top);
    setPanelPos((open) => (open ? { left, top } : open));
  }, []);

  const hidePanel = useCallback(() => {
    pinned.current = false;
    setPanelPos(null);
    setStatusState(null);
  }, []);

  const closeAll = useCallback(() => {
    setFab(null);
    hidePanel();
  }, [hidePanel, setFab]);

  useEffect(() => {
    const clear = () => {
      selection.current = null;
      setFab(null);
    };
    const onSelectionChange = () => {
      if (pinned.current) return;
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !within(sel.anchorNode) || !within(sel.focusNode)) return clear();
      const text = sel.toString().trim();
      if (!text) return clear();
      const range = sel.getRangeAt(sel.rangeCount - 1);
      const rect = captureRect(range);
      const end = range.cloneRange();
      end.collapse(false);
      const endRect = captureRect(end) || rect;
      if (!rect || !endRect) {
        selection.current = null;
        setFab(null);
        return;
      }
      const clean = text.replace(/\s+/g, " ").trim();
      selection.current = { text: clean, rect, anchorNode: sel.anchorNode, focusNode: sel.focusNode };
      setContext(clean.slice(0, PREVIEW_MAX) + (clean.length > PREVIEW_MAX ? "…" : ""));
      const vw = document.documentElement.clientWidth;
      const anchorX = endRect.right || endRect.left + (endRect.width || 0);
      const anchorY = endRect.bottom || endRect.top;
      setFab({
        left: Math.min(Math.max(anchorX - 16, window.scrollX + 12), window.scrollX + vw - 32 - 12),
        top: Math.min(Math.max(anchorY + 6, window.scrollY + 12), window.scrollY + window.innerHeight - 48),
      });
    };
    const onScroll = () => {
      if (!pinned.current) setFab(null);
    };
    const onResize = () => {
      if (pinned.current) requestAnimationFrame(positionPanel);
      else setFab(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && panelRef.current) hidePanel();
    };
    const onClick = (e: MouseEvent) => {
      const panel = panelRef.current;
      if (!panel) return;
      const target = e.target as Node;
      if (panel.contains(target) || fabRef.current?.contains(target) || within(target)) return;
      hidePanel();
    };
    document.addEventListener("selectionchange", onSelectionChange);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("selectionchange", onSelectionChange);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [within, positionPanel, hidePanel, setFab]);

  const openPanel = () => {
    const sel = selection.current;
    if (!sel?.text) {
      snack("Select some text in the Final Output first");
      pinned.current = false;
      return;
    }
    pinned.current = true;
    setFab(null);
    updatePreview(sel.text);
    setStatusState(null);
    setAnswer("");
    setPrompt((p) => (p.trim() ? p : "Explain it simply"));
    setPanelPos({ left: sel.rect.left, top: sel.rect.bottom + 12 });
    setFocusRequest((n) => n + 1);
  };

  // Once the opened panel is in the DOM: measure it, then focus the prompt.
  useEffect(() => {
    if (!focusRequest) return;
    const frame = requestAnimationFrame(() => {
      positionPanel();
      promptRef.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [focusRequest, positionPanel]);

  const ask = async (instruction: string, kind: "ask" | "meaning") => {
    const sel = selection.current;
    if (!sel?.text) {
      snack(kind === "ask" ? "Select some text in the Final Output first" : "Select a term or phrase");
      return;
    }
    if (busyRef.current) return;
    setBusy(true);
    setAnswer("");
    try {
      const res = await notesApi.snippetAssist(sel.text.slice(0, config.selection.payloadMax), instruction);
      const data = res.data || {};
      if (!res.ok) throw new Error(data.detail || data.error || `HTTP ${res.status}`);
      const text = data.text ? String(data.text) : "";
      if (!text) {
        setStatus(kind === "ask" ? "Gemini returned an empty reply" : "No meaning available", true);
        return;
      }
      setAnswer(text);
      if (kind === "ask") {
        void getAnalytics().track("note_viewed", { variant: "generated", prompt: instruction.slice(0, 50) });
      } else {
        pinned.current = true;
        updatePreview(sel.text);
        if (!panelPos) setPanelPos({ left: sel.rect.left, top: sel.rect.bottom + 12 });
        requestAnimationFrame(positionPanel);
      }
      setStatusState(null);
    } catch (err) {
      console.warn(kind === "ask" ? "Gemini inline assist error" : "Meaning error", err);
      setStatus(err instanceof Error && err.message ? err.message : kind === "ask" ? "Gemini request failed" : "Meaning failed", true);
    } finally {
      setBusy(false);
    }
  };

  const runAsk = () => void ask(prompt.trim() || "Explain the highlighted text simply.", "ask");
  const runMeaning = () => {
    const sel = selection.current;
    void ask(`Give a very short dictionary-like meaning for: "${sel?.text || ""}" (1–2 lines). No examples.`, "meaning");
  };

  const runEdit = async () => {
    const sel = selection.current;
    const root = outputRef.current;
    if (!sel?.text || !root || (!sel.anchorNode && !sel.focusNode)) return snack("Select text to edit");
    if (isWithinCode(sel.anchorNode) || isWithinCode(sel.focusNode)) return snack("Inline edit works on regular text (not code blocks)");
    const heading = findClosestHeading(root, sel.anchorNode) || findClosestHeading(root, sel.focusNode);
    if (!heading || heading.level === 1) return snack("Place cursor inside a section (H2/H3)");
    const mapped = mapSelectionToMarkdown(notes.markdownRef.current || "", heading, sel.text);
    if ("error" in mapped) return snack(mapped.error);
    const instruction = prompt.trim() || (mapped.partial ? "edit this part for clarity" : "simplify the selected text with clearer language");
    try {
      setStatus("Processing…");
      setBusy(true);
      const res = await notesApi.transform("custom", mapped.selected, instruction);
      const data = (await res.json().catch(() => ({}))) as { markdown?: string; detail?: string; error?: string };
      if (!res.ok) throw new Error(data.detail || data.error || "Transform failed");
      const replacement = data.markdown ? String(data.markdown) : "";
      if (!replacement) return snack("No change");
      const merged = mapped.merge(replacement);
      notes.renderMarkdown(merged);
      const ok = await notes.persistMyNote(merged);
      if (ok) {
        snack("Edited and saved to My note");
        void notes.checkMyNoteVisibility();
      } else {
        snack("Edited (not saved — sign in to save)");
      }
    } catch (err) {
      console.warn("Edit selection error", err);
      snack("Edit failed");
    } finally {
      setBusy(false);
      setStatusState(null);
    }
  };

  const onFab = () => {
    const sel = selection.current;
    if (!fabAction) return openPanel();
    if (!sel?.text) return snack("Select some text in the Final Output first");
    fabAction.run(sel, closeAll);
  };

  const panelBtn = "px-3 py-2 rounded-lg border text-xs hover:bg-[var(--brand-soft)]";
  let statusNode: ReactNode = null;
  if (status) {
    statusNode = (
      <div className="text-[11px]" style={{ color: status.error ? "#ef4444" : "var(--muted)" }}>
        {status.text}
      </div>
    );
  }

  return (
    <>
      {fab ? (
        <button
          ref={fabRef}
          type="button"
          aria-label={fabAction?.label || "Ask TuneAI about selection"}
          title={fabAction?.title}
          className={cn("select-none text-brand-600", styles.selectionFab)}
          style={{ left: fab.left, top: fab.top, display: fab.visible ? undefined : "none" }}
          onMouseDown={(e) => e.preventDefault()}
          onClick={onFab}
        >
          <Sym name="auto_awesome" outlined className="leading-none" />
        </button>
      ) : null}
      {panelPos ? (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          className={cn("rounded-2xl shadow-glow", styles.glass, styles.customScroll, styles.selectionPanel)}
          style={{ ...outline, left: panelPos.left, top: panelPos.top }}
        >
          <div className="p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[12px] font-semibold text-brand-600">
                <Sym name="auto_awesome" outlined />
                TuneAI Inline
              </div>
              <button type="button" className="text-[10px] uppercase tracking-wide text-[var(--muted)] hover:text-[var(--surface-contrast)]" onClick={hidePanel}>
                Close
              </button>
            </div>
            <div className={cn("text-[11px] text-[var(--muted)] rounded-lg px-2 py-1 max-h-20 overflow-auto", styles.customScroll, styles.selectionContext)}>{context}</div>
            <label htmlFor="geminiSelectionInput" className="text-[11px] font-medium text-[var(--muted)] tracking-wide uppercase">
              Ask anything
            </label>
            <textarea
              id="geminiSelectionInput"
              ref={promptRef}
              rows={2}
              spellCheck={false}
              className="w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              placeholder="Explain it simply, expand it, translate it..."
              style={{ ...outline, background: "var(--surface)", color: "var(--surface-contrast)" }}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  e.preventDefault();
                  runAsk();
                }
              }}
            />
            <div className="flex items-center gap-2">
              <RippleButton
                className={cn("px-3 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold uppercase tracking-wide", busy && "opacity-60")}
                disabled={busy}
                onClick={runAsk}
              >
                Ask Tune
              </RippleButton>
              <RippleButton className={panelBtn} style={outline} onClick={runMeaning}>
                <Sym name="translate" outlined className="align-middle mr-1" />
                Meaning
              </RippleButton>
              {notes.roles.edit ? (
                <RippleButton className={panelBtn} style={outline} onClick={() => void runEdit()}>
                  <Sym name="edit" outlined className="align-middle mr-1" />
                  Edit
                </RippleButton>
              ) : null}
              {statusNode}
            </div>
            <div className={cn("text-sm leading-relaxed max-h-56 overflow-auto", styles.customScroll, styles.selectionOutput)}>
              {answer ? <Markdown content={answer} prose={false} highlight={false} className="prose prose-sm dark:prose-invert" /> : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
