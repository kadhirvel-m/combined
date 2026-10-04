"use client";

import { useCallback, useEffect, useId, useRef, useState, type DragEvent, type FormEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { createUnit, deleteUnit, updateUnit } from "../api";
import type { UnitTopicInput } from "../types";
import styles from "../syllabus.module.css";
import { BusyIcon, DialogHeader, SyllabusDialog, dialogButton } from "./SyllabusDialog";
import { TopicInput } from "./TopicInput";

/** Topics handed to the edit dialog: `id` keeps the topic row (and its URLs) on save. */
export interface EditableTopic {
  id?: string | null;
  topic: string;
}

export type UnitModalTarget =
  | { mode: "add" }
  | { mode: "edit"; unitId: string; unitTitle: string; topics: EditableTopic[] };

interface TopicRowState {
  key: string;
  id: string | null;
  value: string;
}

/** Transparent 1×1 drag image, so only the live reorder is visible while dragging. */
const EMPTY_DRAG_IMAGE = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
const AUTOSCROLL_EDGE = 48; // px from the panel edge where auto-scroll starts
const AUTOSCROLL_MAX = 12; // px per frame

/** Message shown for a failed save/delete (`[object Object]` became "Unexpected response."). */
function failureMessage(error: unknown, fallback: string): string {
  let m: unknown = (error as { message?: unknown } | null)?.message ?? fallback;
  if (typeof m !== "string") {
    try {
      m = JSON.stringify(m);
    } catch {
      m = fallback;
    }
  }
  return m === "[object Object]" ? "Unexpected response." : String(m);
}

export interface UnitModalProps {
  courseId: string;
  target: UnitModalTarget;
  onClose: () => void;
  /** Called after a successful save or delete (the dialog is already closing). */
  onChanged: () => Promise<void> | void;
}

/**
 * "Add a new unit" / "Edit unit" dialog: unit title, ordered topic rows
 * (drag handle, autocomplete, add-below, remove), delete in edit mode.
 * POST /api/syllabus/courses/{courseId}/units, PUT|DELETE /api/syllabus/units/{id}.
 */
export function UnitModal({ courseId, target, onClose, onChanged }: UnitModalProps) {
  const titleId = useId();
  const keySeq = useRef(0);
  const newKey = () => `t${++keySeq.current}`;
  const editing = target.mode === "edit";

  const [unitTitle, setUnitTitle] = useState(editing ? target.unitTitle || "" : "");
  // A unit without topics opens with no rows in edit mode, as before.
  const [rows, setRows] = useState<TopicRowState[]>(() =>
    editing
      ? target.topics.map((t) => ({ key: newKey(), id: t.id ? String(t.id) : null, value: t.topic_title_or_topic ?? "" }))
      : [{ key: newKey(), id: null, value: "" }],
  );
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState<"saving" | "deleting" | null>(null);

  const titleInput = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const rowEls = useRef(new Map<string, HTMLDivElement>());

  useEffect(() => {
    const t = setTimeout(() => titleInput.current?.focus(), 60);
    return () => clearTimeout(t);
  }, []);

  // ── Topic rows ───────────────────────────────────────────────────────────

  const addRow = (afterKey?: string) => {
    setRows((prev) => {
      const row = { key: newKey(), id: null, value: "" };
      const at = afterKey ? prev.findIndex((r) => r.key === afterKey) : -1;
      if (at < 0) return [...prev, row];
      return [...prev.slice(0, at + 1), row, ...prev.slice(at + 1)];
    });
  };

  const removeRow = (key: string) => {
    setRows((prev) => {
      const next = prev.filter((r) => r.key !== key);
      return next.length ? next : [{ key: newKey(), id: null, value: "" }];
    });
  };

  const setRowValue = (key: string, value: string) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, value } : r)));
  };

  // ── Drag and drop reordering, with auto-scroll inside the panel ──────────

  const [dragKey, setDragKey] = useState<string | null>(null);
  const dragKeyRef = useRef<string | null>(null);
  const scrollSpeed = useRef(0);
  const scrollFrame = useRef<number | null>(null);
  const dragImage = useRef<HTMLImageElement | null>(null);

  const stopAutoScroll = useCallback(() => {
    if (scrollFrame.current) cancelAnimationFrame(scrollFrame.current);
    scrollFrame.current = null;
    scrollSpeed.current = 0;
  }, []);

  useEffect(() => stopAutoScroll, [stopAutoScroll]);

  const startAutoScroll = () => {
    stopAutoScroll();
    const step = () => {
      const panel = panelRef.current;
      if (panel && scrollSpeed.current !== 0) panel.scrollTop += scrollSpeed.current;
      scrollFrame.current = requestAnimationFrame(step);
    };
    scrollFrame.current = requestAnimationFrame(step);
  };

  const updateAutoScroll = (clientY: number) => {
    const panel = panelRef.current;
    if (!panel) return;
    const rect = panel.getBoundingClientRect();
    if (clientY < rect.top + AUTOSCROLL_EDGE) {
      scrollSpeed.current = -Math.ceil(AUTOSCROLL_MAX * ((rect.top + AUTOSCROLL_EDGE - clientY) / AUTOSCROLL_EDGE));
    } else if (clientY > rect.bottom - AUTOSCROLL_EDGE) {
      scrollSpeed.current = Math.ceil(AUTOSCROLL_MAX * ((clientY - (rect.bottom - AUTOSCROLL_EDGE)) / AUTOSCROLL_EDGE));
    } else {
      scrollSpeed.current = 0;
    }
  };

  const onHandleDragStart = (key: string, e: DragEvent<HTMLButtonElement>) => {
    dragKeyRef.current = key;
    setDragKey(key);
    try {
      e.dataTransfer.setData("text/plain", "");
    } catch {}
    e.dataTransfer.effectAllowed = "move";
    if (typeof e.dataTransfer.setDragImage === "function") {
      if (!dragImage.current) {
        dragImage.current = new Image();
        dragImage.current.src = EMPTY_DRAG_IMAGE;
      }
      e.dataTransfer.setDragImage(dragImage.current, 0, 0);
    }
    startAutoScroll();
  };

  const onListDragStart = (e: DragEvent<HTMLDivElement>) => {
    // Only the handles start a drag (not e.g. selected text in an input).
    if (!dragKeyRef.current) e.preventDefault();
  };

  const onListDragOver = (e: DragEvent<HTMLDivElement>) => {
    const dragging = dragKeyRef.current;
    if (!dragging) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const y = e.clientY;
    // The row whose middle is the closest one below the pointer; none → move to the end.
    let before: string | null = null;
    let closest = Number.NEGATIVE_INFINITY;
    for (const row of rows) {
      if (row.key === dragging) continue;
      const el = rowEls.current.get(row.key);
      if (!el) continue;
      const box = el.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest) {
        closest = offset;
        before = row.key;
      }
    }
    const from = rows.findIndex((r) => r.key === dragging);
    const without = rows.filter((r) => r.key !== dragging);
    const to = before === null ? without.length : without.findIndex((r) => r.key === before);
    if (from >= 0 && to !== from) {
      setRows([...without.slice(0, to), rows[from], ...without.slice(to)]);
    }
    updateAutoScroll(y);
  };

  const onListDrop = (e: DragEvent<HTMLDivElement>) => {
    if (dragKeyRef.current) e.preventDefault();
  };

  const onListDragEnd = () => {
    dragKeyRef.current = null;
    setDragKey(null);
    stopAutoScroll();
  };

  // ── Save / delete ────────────────────────────────────────────────────────

  const showMessage = (text: string) => setMessage(text);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!courseId) {
      showMessage("Missing course context.");
      return;
    }
    const unit_title = unitTitle.trim();
    if (!unit_title) {
      showMessage("Enter the unit title.");
      titleInput.current?.focus();
      return;
    }
    const topics: UnitTopicInput[] = [];
    for (const row of rows) {
      const topic = row.value.trim();
      if (!topic) continue;
      topics.push(row.id ? { id: row.id, topic } : { topic });
    }
    const payload = { unit_title, topics };
    setBusy("saving");
    setMessage(null);
    try {
      if (target.mode === "edit") await updateUnit(target.unitId, payload);
      else await createUnit(courseId, payload);
      onClose();
      await onChanged();
    } catch (error) {
      showMessage(failureMessage(error, "Unable to save unit."));
      console.error(error);
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = async () => {
    if (target.mode !== "edit") return;
    if (!window.confirm("Delete this unit and all its topics? This action cannot be undone.")) return;
    setBusy("deleting");
    setMessage(null);
    try {
      await deleteUnit(target.unitId);
      onClose();
      await onChanged();
    } catch (error) {
      showMessage(failureMessage(error, "Unable to delete unit."));
      console.error(error);
    } finally {
      setBusy(null);
    }
  };

  const smallRound =
    "inline-flex items-center justify-center rounded-full border border-black/10 dark:border-white/15 p-2 text-neutral-500 transition";
  const addTopicButton =
    "inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/15 bg-white/80 dark:bg-white/5 text-xs font-medium text-neutral-700 dark:text-white/80 hover:border-brand-500/50 transition";

  return (
    <SyllabusDialog
      labelledBy={titleId}
      onDismiss={onClose}
      closeOnEscape
      lockScroll
      backdropClassName={styles.unitBackdrop}
      panelClassName={cn(styles.unitPanel, "max-w-2xl")}
      panelRef={panelRef}
    >
      <DialogHeader
        titleId={titleId}
        title={editing ? "Edit unit" : "Add a new unit"}
        subtitle="Provide the unit title and list of topics."
        onClose={onClose}
      />
      <form className="space-y-5 px-6 py-6" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-neutral-700 dark:text-white/85">
          Unit title
          <input
            ref={titleInput}
            name="unit_title"
            type="text"
            required
            maxLength={256}
            placeholder="e.g. Introduction to Algorithms"
            value={unitTitle}
            onChange={(e) => setUnitTitle(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-white/5 px-3.5 py-2.5 text-sm text-neutral-900 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
          />
        </label>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-700 dark:text-white/85">Topics</span>
            <button type="button" onClick={() => addRow()} className={cn(addTopicButton, "px-3 py-1.5")}>
              <Icon name="add" className="text-base" />
              Add topic
            </button>
          </div>
          <div
            className="space-y-3"
            onDragStart={onListDragStart}
            onDragOver={onListDragOver}
            onDrop={onListDrop}
            onDragEnd={onListDragEnd}
          >
            {rows.map((row) => (
              <div
                key={row.key}
                ref={(el) => {
                  if (el) rowEls.current.set(row.key, el);
                  else rowEls.current.delete(row.key);
                }}
                className={cn("flex items-center gap-2", dragKey === row.key && "opacity-50")}
              >
                <button
                  type="button"
                  draggable
                  onDragStart={(e) => onHandleDragStart(row.key, e)}
                  aria-label="Drag to reorder"
                  className={cn(smallRound, "hover:text-brand-500 hover:border-brand-500/50 cursor-grab active:cursor-grabbing")}
                >
                  <Icon name="drag_indicator" className="text-base" />
                </button>
                <TopicInput id={`topic-${row.key}`} value={row.value} onChange={(value) => setRowValue(row.key, value)} />
                <button
                  type="button"
                  aria-label="Add topic below"
                  onClick={() => addRow(row.key)}
                  className={cn(smallRound, "hover:text-brand-500 hover:border-brand-500/50")}
                >
                  <Icon name="add" className="text-base" />
                </button>
                <button
                  type="button"
                  aria-label="Remove topic"
                  onClick={() => removeRow(row.key)}
                  className={cn(smallRound, "hover:text-red-500 hover:border-red-500/50")}
                >
                  <Icon name="close" className="text-base" />
                </button>
              </div>
            ))}
          </div>
        </div>
        {message ? <p className="text-sm text-red-500">{message}</p> : null}
        <div className="flex justify-end">
          <button type="button" onClick={() => addRow()} className={cn(addTopicButton, "px-4 py-2")}>
            <Icon name="add" className="text-base" />
            Add topic
          </button>
        </div>
        <div className="flex items-center justify-between gap-3">
          {editing ? (
            <button
              type="button"
              onClick={() => void handleDelete()}
              disabled={busy === "deleting"}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-red-300/60 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-200 px-4 py-2 text-sm font-medium hover:border-red-400/80 transition"
            >
              {busy === "deleting" ? (
                <>
                  <BusyIcon /> Deleting…
                </>
              ) : (
                <>
                  <Icon name="delete" className="text-base" />
                  Delete
                </>
              )}
            </button>
          ) : null}
          <button type="button" onClick={onClose} disabled={busy === "deleting"} className={dialogButton.outline}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy !== null}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-500 via-[#B06AB3] to-[#FF7FD1] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(158,75,138,0.35)] hover:shadow-[0_16px_36px_rgba(158,75,138,0.45)] transition"
          >
            {busy === "saving" ? (
              <>
                <BusyIcon /> Saving…
              </>
            ) : (
              <>
                <Icon name="save" className="text-base" />
                {editing ? "Save changes" : "Save unit"}
              </>
            )}
          </button>
        </div>
      </form>
    </SyllabusDialog>
  );
}
