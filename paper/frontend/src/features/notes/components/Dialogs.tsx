"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { truncateText } from "../lib/markdown";
import { notesApi } from "../api";
import { getAuthToken } from "../lib/authToken";
import { readLocal, STORAGE_KEYS } from "../lib/storage";
import { useNotes } from "./NotesProvider";
import { RippleButton, Sym } from "./primitives";
import { AppLink } from "@/components/site/AppLink";

/**
 * Overlay shell of the notes modals: centered panel, closes on Escape and on
 * clicks outside the panel, locks page scroll while open. (The shared `Modal`
 * has a fixed backdrop/header design that differs from these originals.)
 */
export function NotesDialog({
  open,
  onClose,
  zIndex,
  backdropClassName,
  panelClassName,
  panelStyle,
  label,
  children,
}: {
  open: boolean;
  onClose: () => void;
  zIndex: number;
  backdropClassName: string;
  panelClassName: string;
  panelStyle?: CSSProperties;
  label: string;
  children: ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow === "hidden" ? "" : overflow;
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      className="fixed inset-0"
      style={{ zIndex }}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onClick={(e) => {
        if (panel.current && panel.current.contains(e.target as Node)) return;
        onClose();
      }}
    >
      <div className={cn("absolute inset-0", backdropClassName)} />
      <div className="relative h-full w-full flex items-center justify-center p-4">
        <div ref={panel} className={panelClassName} style={panelStyle}>
          {children}
        </div>
      </div>
    </div>
  );
}

/** Share modal: topic, a short preview and "Copy Link" (`?topic=` on the current URL). */
export function ShareModal() {
  const notes = useNotes();
  const [status, setStatus] = useState<{ text: string; error: boolean }>({ text: "", error: false });
  const [preview, setPreview] = useState({ topic: "-", content: "Generate notes to preview share content." });
  const { shareOpen, setShareOpen } = notes;

  const resolveTopic = () => (notes.titleRef.current || "").trim() || notes.topic.trim() || "Untitled topic";
  useEffect(() => {
    if (!shareOpen) return;
    const text = (notes.outputRef.current?.textContent || "").trim();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- snapshot of the page when the modal opens
    setPreview({ topic: resolveTopic(), content: text ? truncateText(text, 240) : "Generate notes to preview share content." });
    setStatus({ text: "", error: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only on open
  }, [shareOpen]);

  const copy = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set("topic", resolveTopic());
    const payload = url.toString();
    try {
      await navigator.clipboard.writeText(payload);
      setStatus({ text: "Link copied to clipboard.", error: false });
      notes.snack("Link copied");
    } catch {
      // Clipboard API blocked: the legacy copy command still works in most browsers.
      const ta = document.createElement("textarea");
      ta.value = payload;
      ta.setAttribute("readonly", "true");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      if (ok) {
        setStatus({ text: "Link copied to clipboard.", error: false });
        notes.snack("Link copied");
      } else {
        setStatus({ text: "Unable to copy link. Try again.", error: true });
      }
    }
  };

  const card = "rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 px-3 py-2.5";
  return (
    <NotesDialog
      open={shareOpen}
      onClose={() => setShareOpen(false)}
      zIndex={2147483646}
      label="Share Notes"
      backdropClassName="backdrop-blur-xl"
      panelClassName="w-full max-w-md rounded-3xl border dark:border-white/20 text-neutral-900 dark:text-white ring-1 ring-brand-500/20 backdrop-blur-xl supports-[backdrop-filter]:backdrop-blur-xl p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand-700 dark:text-brandlt-200 bg-brandlt-100/85 dark:bg-brand-700/35">
            <Sym name="share" />
            Share Notes
          </div>
          <h3 className="mt-2 text-base font-semibold">Share this topic quickly</h3>
          <p className="mt-1 text-xs text-black/60 dark:text-white/60">Topic and a short notes preview are ready. Use Copy Link to share instantly.</p>
        </div>
        <button
          type="button"
          aria-label="Close share modal"
          className="inline-flex items-center justify-center size-9 rounded-full ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5 transition"
          onClick={() => setShareOpen(false)}
        >
          <Sym name="close" />
        </button>
      </div>
      <div className="mt-4 space-y-3">
        <div className={card}>
          <div className="text-[11px] uppercase tracking-wide font-semibold text-black/55 dark:text-white/55">Topic</div>
          <div className="mt-1 text-sm font-medium break-words">{preview.topic}</div>
        </div>
        <div className={card}>
          <div className="text-[11px] uppercase tracking-wide font-semibold text-black/55 dark:text-white/55">Preview</div>
          <p className="mt-1 text-sm leading-relaxed text-black/80 dark:text-white/80">{preview.content}</p>
        </div>
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="text-xs text-black/60 dark:text-white/60" style={status.error ? { color: "#ef4444" } : undefined}>
            {status.text}
          </div>
          <RippleButton
            className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-brand-500 via-[#B06AB3] to-[#FF7FD1] shadow-glow hover:opacity-95 transition"
            onClick={() => void copy()}
          >
            <Sym name="link" />
            Copy Link
          </RippleButton>
        </div>
      </div>
    </NotesDialog>
  );
}

const CATEGORIES = ["Wrong information", "Missing details", "Needs examples", "Spelling / grammar", "Formatting issue", "Outdated", "Other"];
const TAGS = ["Wrong", "Unclear", "Too long", "Too short", "Example needed", "Equation"];
const TEMPLATES = [
  { label: "Wrong section", text: "This section seems wrong: " },
  { label: "Need example", text: "Please add an example for: " },
  { label: "Too complex", text: "Please simplify this part: " },
  { label: "Grammar", text: "Spelling/grammar issue here: " },
];
const chip = "px-4 py-2 rounded-full ring-1 ring-black/10 dark:ring-white/15 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition";
const fieldLabel = "block text-[11px] tracking-wide uppercase font-semibold text-black/60 dark:text-white/60 mb-1";

/** Feedback modal: category, rating, quick tags/templates, message and selected text → `POST /api/notes/feedback`. */
export function FeedbackModal() {
  const notes = useNotes();
  const { feedbackOpen, setFeedbackOpen, setHeaderHidden } = notes;
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [rating, setRating] = useState<number | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState("");
  const [status, setStatus] = useState<{ text: string; error: boolean }>({ text: "", error: false });
  const [authHint, setAuthHint] = useState(false);
  const [sending, setSending] = useState(false);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!feedbackOpen) return;
    setHeaderHidden(true);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset the status line on open
    setStatus({ text: "", error: false });
    const t = setTimeout(() => messageRef.current?.focus(), 50);
    return () => {
      clearTimeout(t);
      setHeaderHidden(false);
    };
  }, [feedbackOpen, setHeaderHidden]);

  const useSelection = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return setStatus({ text: "Select some text in the output first.", error: true });
    const root = notes.outputRef.current;
    const inside = (node: Node | null) => {
      const el = node && node.nodeType === Node.TEXT_NODE ? node.parentNode : node;
      return !!(root && el && root.contains(el));
    };
    if (!inside(sel.anchorNode) || !inside(sel.focusNode)) return setStatus({ text: "Selection must be inside the Final Output.", error: true });
    const txt = (sel.toString() || "").trim();
    if (!txt) return setStatus({ text: "Selection is empty.", error: true });
    setSelected(txt.slice(0, 1200));
    setStatus({ text: "Added selection to feedback.", error: false });
  };

  const submit = async () => {
    const token = getAuthToken(notes.config.authToken);
    const msg = message.trim();
    if (!token) {
      setAuthHint(true);
      setStatus({ text: "Sign in required to send feedback.", error: true });
      return;
    }
    setAuthHint(false);
    if (!msg) {
      setStatus({ text: "Please write a short message.", error: true });
      messageRef.current?.focus();
      return;
    }
    const variant = notes.variant || readLocal(STORAGE_KEYS.notesVariant) || null;
    const noteId = (variant && readLocal(STORAGE_KEYS.lastNoteIdFor(variant))) || readLocal(STORAGE_KEYS.lastNoteId) || "";
    const h1 = notes.titleRef.current || "";
    const topic = notes.topic.trim();
    setSending(true);
    setStatus({ text: "Sending…", error: false });
    try {
      const res = await notesApi.feedback(
        {
          category: (category || "Other").trim(),
          message: msg,
          quick_tags: tags,
          rating,
          note_id: noteId || null,
          note_variant: variant || null,
          note_title: (h1 || topic || "").trim() || null,
          topic: (topic || h1 || "").trim() || null,
          page_path: window.location.pathname || null,
          page_url: window.location.href || null,
          selected_text: selected || null,
          meta: {
            tz: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
            lang: navigator.language || null,
            screen: { w: window.screen?.width || null, h: window.screen?.height || null },
          },
        },
        token,
      );
      if (!res.ok) throw new Error(res.data?.detail || `HTTP ${res.status}`);
      setStatus({ text: "Thanks! Feedback sent.", error: false });
      notes.snack("Feedback sent");
      setMessage("");
      setSelected("");
      setTags([]);
      setRating(null);
      setFeedbackOpen(false);
    } catch (err) {
      console.error(err);
      setStatus({ text: err instanceof Error && err.message ? err.message : "Failed to send", error: true });
    } finally {
      setSending(false);
    }
  };

  const statusStyle = { color: status.error ? "#ef4444" : "var(--muted)" };
  return (
    <NotesDialog
      open={feedbackOpen}
      onClose={() => setFeedbackOpen(false)}
      zIndex={2147483647}
      label="Feedback"
      backdropClassName="bg-black/70"
      panelClassName="w-full max-w-2xl rounded-3xl border border-black/10 dark:border-white/10 bg-white/95 dark:bg-brand-900/95 text-neutral-900 dark:text-white shadow-card backdrop-blur supports-[backdrop-filter]:backdrop-blur-xl p-6 overflow-y-auto overflow-x-hidden"
      panelStyle={{ maxHeight: "calc(100dvh - 2rem)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Sym name="feedback" className="text-brand-500" />
            <h3 className="text-lg font-semibold">Feedback</h3>
          </div>
          <p className="text-xs text-black/60 dark:text-white/60 mt-1">Report anything wrong/unclear/missing in the notes.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {notes.roles.privileged ? (
            <AppLink
              href="/admin/notes_feedback.html"
              className="px-4 py-2 rounded-2xl text-xs font-semibold ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5 transition"
            >
              Open Inbox
            </AppLink>
          ) : null}
          <button
            type="button"
            aria-label="Close"
            className="inline-flex items-center justify-center size-10 rounded-full ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5 transition"
            onClick={() => setFeedbackOpen(false)}
          >
            <Sym name="close" />
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="fbCategory" className={fieldLabel}>
            Category
          </label>
          <select
            id="fbCategory"
            className="w-full px-3 py-2.5 rounded-2xl border border-black/10 dark:border-white/10 bg-white/90 dark:bg-brand-900/70 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <span className={fieldLabel}>
            Rating <span className="font-normal">(optional)</span>
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <RippleButton
                key={n}
                className={cn("px-3 py-2 rounded-2xl ring-1 ring-black/10 dark:ring-white/15 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition", rating === n && "bg-[var(--brand-soft)]")}
                onClick={() => setRating(n)}
              >
                {n}
              </RippleButton>
            ))}
          </div>
        </div>
        <div className="md:col-span-2">
          <span className={fieldLabel}>Quick tags</span>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => {
              const on = tags.includes(tag);
              return (
                <RippleButton
                  key={tag}
                  aria-pressed={on}
                  className={cn(chip, on && "bg-[var(--brand-soft)]")}
                  onClick={() => setTags((all) => (all.includes(tag) ? all.filter((t) => t !== tag) : [...all, tag]))}
                >
                  {tag}
                </RippleButton>
              );
            })}
          </div>
        </div>
        <div className="md:col-span-2">
          <span className={fieldLabel}>Quick templates</span>
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map((tpl) => (
              <RippleButton
                key={tpl.label}
                className={chip}
                onClick={() => {
                  setMessage((cur) => (cur.trim() ? `${cur.trim()}\n${tpl.text}` : tpl.text));
                  messageRef.current?.focus();
                }}
              >
                {tpl.label}
              </RippleButton>
            ))}
          </div>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="fbMessage" className={fieldLabel}>
            Your feedback
          </label>
          <textarea
            id="fbMessage"
            ref={messageRef}
            rows={5}
            placeholder="Write what’s wrong / what to improve…"
            className="w-full px-4 py-3 rounded-3xl border border-black/10 dark:border-white/10 bg-white/90 dark:bg-brand-900/70 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <RippleButton
              className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-xs font-semibold ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5 transition"
              onMouseDown={(e) => e.preventDefault()}
              onClick={useSelection}
            >
              <Sym name="content_copy" />
              Use selected text
            </RippleButton>
            <div className="text-xs text-black/60 dark:text-white/60 truncate">
              {selected ? `Selected: ${selected.length > 120 ? `${selected.slice(0, 120)}…` : selected}` : ""}
            </div>
          </div>
        </div>
        <div className="md:col-span-2 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs text-black/60 dark:text-white/60" style={status.text ? statusStyle : undefined}>
              {status.text}
            </div>
            {authHint ? <div className="text-xs text-black/60 dark:text-white/60">Sign in required to send feedback.</div> : null}
          </div>
          <RippleButton
            className={cn("inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700", sending && "opacity-70")}
            disabled={sending}
            onClick={() => void submit()}
          >
            <Sym name="send" />
            Send feedback
          </RippleButton>
        </div>
      </div>
    </NotesDialog>
  );
}

