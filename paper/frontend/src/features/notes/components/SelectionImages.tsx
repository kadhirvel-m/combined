"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { notesApi, sleep } from "../api";
import styles from "../notes.module.css";
import { useNotes } from "./NotesProvider";
import { RippleButton } from "./primitives";
import type { SelectionFabAction } from "./SelectionAssistant";

const outline = { borderColor: "var(--outline)" };
const EMPTY_TEXT = "No selected-text image requests yet.";

export interface SelectionImageJob {
  id: string;
  status: "pending" | "done" | "failed";
  /** Selected text (shown truncated). */
  text: string;
  /** Status line under the preview ("Request … started", error message…). */
  meta: string;
  imageUrl?: string;
}

interface SelectionImagesValue {
  jobs: SelectionImageJob[];
  /** The card loses its `hidden` (mobile) class once anything was loaded or requested, as in the original. */
  revealed: boolean;
  generate: (selectedText: string) => Promise<void>;
}

const SelectionImagesContext = createContext<SelectionImagesValue | null>(null);

function isValidImageUrl(url: string): boolean {
  const v = String(url || "").trim();
  if (!v) return false;
  try {
    const u = new URL(v, window.location.origin);
    return /^https?:$/i.test(u.protocol) && !!u.hostname;
  } catch {
    return false;
  }
}

function cleanErrorMessage(input: unknown, fallback = "Image generation failed"): string {
  const raw = String(input || "").trim();
  if (!raw || /^<!doctype html/i.test(raw) || /^<html[\s>]/i.test(raw)) return fallback;
  return raw.slice(0, 220);
}

let reqSeq = 0;

/**
 * Selected-text illustrations (img_gen): generate an image from a text
 * selection (`POST /api/blink/generate-selected`) and list the images saved
 * for the current topic (`GET/POST /api/blink/selected-images`).
 */
export function SelectionImagesProvider({ children }: { children: ReactNode }) {
  const { snack, topicSignal, titleRef, topic: inputTopic } = useNotes();
  const [jobs, setJobs] = useState<SelectionImageJob[]>([]);
  const [revealed, setRevealed] = useState(false);
  const active = useRef(0);
  const topicRef = useRef(inputTopic);
  useEffect(() => {
    topicRef.current = inputTopic;
  }, [inputTopic]);

  const patchJob = useCallback((id: string, patch: Partial<SelectionImageJob>) => setJobs((all) => all.map((j) => (j.id === id ? { ...j, ...patch } : j))), []);

  // Saved images for the topic whenever a generation starts, a note loads or a generation finishes.
  useEffect(() => {
    if (!topicSignal.nonce) return;
    const topic = topicSignal.topic.trim();
    let live = true;
    void (async () => {
      await Promise.resolve();
      if (!topic) {
        if (live) {
          setJobs([]);
          setRevealed(true);
        }
        return;
      }
      try {
        const res = await notesApi.selectedImages(topic);
        const items = Array.isArray(res.data?.items) ? res.data.items : [];
        if (!live) return;
        const loaded: SelectionImageJob[] = [];
        for (const item of items) {
          const imageUrl = String(item?.image_url || "").trim();
          if (!imageUrl || !isValidImageUrl(imageUrl)) continue;
          // Each saved item was prepended in turn, so the list ends up newest-last reversed.
          loaded.unshift({ id: `saved-${loaded.length}-${imageUrl}`, status: "done", text: String(item?.selected_text || topic || "Generated image"), meta: "", imageUrl });
        }
        setJobs(loaded);
        setRevealed(true);
      } catch (err) {
        console.warn("Failed to load selected images by topic", err);
      }
    })();
    return () => {
      live = false;
    };
  }, [topicSignal]);

  const generate = useCallback(
    async (selectedText: string) => {
      active.current += 1;
      const id = `selimg-${Date.now()}-${++reqSeq}`;
      const startedAt = performance.now();
      console.log("[SelImg][UI] queued", { reqId: id, active: active.current });
      setJobs((all) => [{ id, status: "pending", text: selectedText, meta: `Request ${id} started` }, ...all]);
      setRevealed(true);
      try {
        const topic = (topicRef.current || titleRef.current || "").trim();
        const payload = { selected_text: selectedText, topic };
        console.log("[SelImg][UI] request_start", { reqId: id, topic, selectionChars: selectedText.length });
        let res = await notesApi.generateSelectedImage(payload);
        if (res.status === 504) {
          console.log("[SelImg][UI] retry_same_selection", { reqId: id, chars: selectedText.length });
          res = await notesApi.generateSelectedImage(payload);
        }
        if (res.status === 429) {
          const busyRaw = await res.text().catch(() => "");
          let busy: { retry_after_seconds?: number; detail?: { retry_after_seconds?: number } } = {};
          try {
            busy = busyRaw ? JSON.parse(busyRaw) : {};
          } catch {
            busy = {};
          }
          const retryAfter = Number(busy?.retry_after_seconds || busy?.detail?.retry_after_seconds || 4);
          const waitMs = Math.max(1000, Math.min(10000, Math.round(retryAfter * 1000)));
          console.log("[SelImg][UI] retry_busy_backoff", { reqId: id, waitMs });
          await sleep(waitMs);
          res = await notesApi.generateSelectedImage(payload);
        }
        const rawBody = await res.text().catch(() => "");
        let data: { url?: string; public_url?: string; saved_in_db?: boolean; detail?: unknown; message?: string; error?: string } = {};
        try {
          data = rawBody ? JSON.parse(rawBody) : {};
        } catch {
          data = {};
        }
        let imageUrl = String((data && (data.url || data.public_url)) || "").trim();
        if (imageUrl && !isValidImageUrl(imageUrl)) imageUrl = "";
        if (!res.ok || !imageUrl) {
          const detail = data && data.detail;
          let detailText = "";
          if (typeof detail === "string") detailText = detail;
          else if (detail && typeof detail === "object") {
            const d = detail as { message?: string; error?: string; attempt_errors?: unknown };
            const attempts = Array.isArray(d.attempt_errors) ? d.attempt_errors.join(" | ") : "";
            detailText = [d.message || d.error || "", attempts].filter(Boolean).join(" :: ");
          } else if (detail) detailText = String(detail);
          const message = detailText || data?.message || data?.error || cleanErrorMessage(rawBody, "") || `Image generation failed (${res.status || "unknown"})`;
          throw new Error(cleanErrorMessage(message, `Image generation failed (${res.status || "unknown"})`));
        }
        if (!data?.saved_in_db && topic && isValidImageUrl(imageUrl)) {
          console.log("[SelImg][UI] backend_not_saved_db_fallback", { reqId: id });
          await notesApi.saveSelectedImage({ topic, image_url: imageUrl, selected_text: selectedText || "" }).catch((err) => console.warn("Failed to save selected image URL", err));
        }
        patchJob(id, { status: "done", meta: "", imageUrl });
        console.log("[SelImg][UI] request_success", { reqId: id, elapsedMs: Math.round(performance.now() - startedAt) });
        snack("Image generated");
      } catch (err) {
        console.error("[SelImg][UI] request_failed", { reqId: id, elapsedMs: Math.round(performance.now() - startedAt), error: err });
        patchJob(id, { status: "failed", meta: cleanErrorMessage(err instanceof Error ? err.message : "", "Image generation failed") });
        snack("Image generation failed");
      } finally {
        active.current = Math.max(0, active.current - 1);
        console.log("[SelImg][UI] request_end", { reqId: id, active: active.current });
      }
    },
    [patchJob, snack, titleRef],
  );

  const value = useMemo(() => ({ jobs, revealed, generate }), [jobs, revealed, generate]);
  return <SelectionImagesContext.Provider value={value}>{children}</SelectionImagesContext.Provider>;
}

export function useSelectionImages(): SelectionImagesValue {
  const ctx = useContext(SelectionImagesContext);
  if (!ctx) throw new Error("useSelectionImages must be used inside <SelectionImagesProvider>");
  return ctx;
}

/** Floating-button action for `<SelectionAssistant fabAction>`: generate an image from the selection. */
export function useSelectionImageFab(): SelectionFabAction {
  const { generate } = useSelectionImages();
  return useMemo(
    () => ({
      label: "Generate image from selection",
      title: "Generate image",
      run: (selection, close) => {
        close();
        void generate(selection.text);
      },
    }),
    [generate],
  );
}

function JobCard({ job }: { job: SelectionImageJob }) {
  const { snack } = useNotes();
  const title = job.status === "pending" ? "Generating image..." : job.status === "done" ? "Image generated" : "Image generation failed";
  return (
    <div className="rounded-xl border" style={{ ...outline, background: "var(--surface)" }}>
      <div className="font-medium text-[var(--surface-contrast)]">{title}</div>
      <div className="mt-1 text-[11px] text-[var(--muted)] whitespace-nowrap overflow-hidden">{job.text.length > 90 ? `${job.text.slice(0, 90)}...` : job.text}</div>
      {job.status === "pending" ? (
        <div className="mt-2 h-1.5 rounded-full overflow-hidden bg-[var(--brand-soft)]">
          <div className="h-full bg-brand-500" />
        </div>
      ) : null}
      <div className="mt-2 text-[11px] text-[var(--muted)]" style={job.status === "failed" ? { color: "#ef4444" } : undefined}>
        {job.meta}
      </div>
      {job.status === "done" && job.imageUrl ? (
        <>
          <div className="mt-2 flex items-center gap-2">
            <RippleButton
              className="px-2.5 py-1.5 rounded-lg border text-[11px] font-medium hover:bg-[var(--brand-soft)] transition"
              style={outline}
              onClick={async () => {
                const snippet = `<p align="center">\n  <img src="${job.imageUrl}" width="80%">\n</p>`;
                try {
                  await navigator.clipboard.writeText(snippet);
                  snack("Copied image snippet");
                } catch {
                  snack("Copy failed");
                }
              }}
            >
              Copy
            </RippleButton>
          </div>
          <a href={job.imageUrl} target="_blank" rel="noopener" className="block mt-2 w-24">
            {/* eslint-disable-next-line @next/next/no-img-element -- generated remote image */}
            <img src={job.imageUrl} alt="Generated illustration" className="w-24 h-24 object-cover rounded-lg border" style={outline} />
          </a>
        </>
      ) : null}
    </div>
  );
}

/** "Images Generating" card listing the selected-text image jobs. */
export function SelectionImagesCard() {
  const { jobs, revealed } = useSelectionImages();
  return (
    <section className={cn("rounded-2xl shadow-glow", !revealed && "hidden sm:block", styles.glass)} style={{ ...outline, background: "color-mix(in oklab, var(--surface) 75%, transparent)" }}>
      <div className="p-4 sm:p-5">
        <h3 className="text-sm font-semibold mb-3">Images Generating</h3>
        <div className="space-y-2 text-xs text-[var(--muted)]">{jobs.length ? jobs.map((job) => <JobCard key={job.id} job={job} />) : <p>{EMPTY_TEXT}</p>}</div>
      </div>
    </section>
  );
}
