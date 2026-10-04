"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { NotesController } from "@/features/notes";
import { fetchJsonWithRetry, notesApi } from "@/features/notes/api";
import { normalizeCourseType } from "@/features/notes/lib/markdown";
import { readSse } from "@/features/notes/lib/sse";
import { rememberNoteId } from "@/features/notes/lib/storage";
import type { NoteRecord } from "@/features/notes/types";
import { medicalApi } from "../api";
import { appendRagCitations, compactRagCitations, ensureStreamAccessToken, RAG_MARKDOWN_SYSTEM_PROMPT } from "../lib/rag";
import type { GeneratedNote, RagContext } from "../types";

/** Note the ClinQ (MCQ) button opens: the original kept it on the button's dataset. */
export interface McqTarget {
  noteId: string;
  topic: string;
}

type ControllerMcq = NotesController["mcq"];

const RAG_CACHE_MS = 30000;

/**
 * notes_chat's `startGeneration`: DB first, then RAG context
 * (`/api/medix/rag/chat`) → SSE generation grounded in the citation chunks →
 * "RAG CITATIONS" section, HTTP fallback when the stream fails, and a snapshot
 * of the final markdown. It drives the shared notes workspace through its
 * public controller (`renderMarkdown`, `noteIdRef`, `videos`, `snack`).
 */
export function useRagGeneration(notes: NotesController) {
  const { renderMarkdown, noteIdRef, snack, videos, degree } = notes;
  const loadVideos = videos.load;
  const videosTopicRef = videos.topicRef;
  const getSelectedDegree = degree.getSelectedDegree;
  const [loading, setLoading] = useState(false);
  // MCQ target set by this engine; it applies until the controller sets its own (`base` changes).
  const [mcqRecord, setMcqRecord] = useState<{ base: ControllerMcq; target: McqTarget | null } | null>(null);
  const variantRef = useRef(notes.variant);
  const mcqRef = useRef<ControllerMcq>(notes.mcq);
  useEffect(() => {
    variantRef.current = notes.variant;
    mcqRef.current = notes.mcq;
  }, [notes.variant, notes.mcq]);

  const inFlight = useRef<string | null>(null);
  const runToken = useRef(0);
  const streamRef = useRef<AbortController | null>(null);
  const ragCache = useRef<{ key: string; ts: number; value: RagContext | null }>({ key: "", ts: 0, value: null });
  const imagesRef = useRef<string[]>([]);

  useEffect(
    () => () => {
      streamRef.current?.abort();
      streamRef.current = null;
    },
    [],
  );

  const setTarget = useCallback((target: McqTarget | null) => setMcqRecord({ base: mcqRef.current, target }), []);

  const clearUI = useCallback(() => {
    renderMarkdown("");
    noteIdRef.current = "";
    imagesRef.current = [];
    setTarget(null);
  }, [renderMarkdown, noteIdRef, setTarget]);

  const fetchRagContext = useCallback(async (topic: string, variant: string): Promise<RagContext | null> => {
    const message = (topic || "").trim();
    if (!message) return null;
    const key = `${variant}::${message.toLowerCase()}`;
    const now = Date.now();
    if (ragCache.current.key === key && now - ragCache.current.ts < RAG_CACHE_MS) return ragCache.current.value;
    try {
      const res = await medicalApi.ragChat(message);
      if (!res.ok) throw new Error(res.data?.detail || `HTTP ${res.status}`);
      const answer = String(res.data?.answer || "").trim();
      const citations = Array.isArray(res.data?.citations) ? res.data.citations : [];
      if (!answer) return null;
      const value = { answer, citations };
      ragCache.current = { key, ts: now, value };
      return value;
    } catch (err) {
      console.warn("[NotesChat] RAG priority retrieval failed", err);
      return null;
    }
  }, []);

  const persistSnapshot = useCallback(
    async (topic: string, markdown: string, imageUrls: string[], variant: string) => {
      try {
        const id = noteIdRef.current;
        if (id) {
          await notesApi.updateNote(id, variant, { markdown, image_urls: imageUrls });
          return;
        }
        const res = await notesApi.createNote(variant, { topic: (topic || "Untitled").trim(), markdown, image_urls: imageUrls });
        const newId = res.ok && res.data?.id ? String(res.data.id).trim() : "";
        if (!newId) return;
        noteIdRef.current = newId;
        rememberNoteId(variant, newId);
      } catch (err) {
        console.warn("[NotesChat] Snapshot persistence failed", err);
      }
    },
    [noteIdRef],
  );

  /** Shared tail of the stream `final` event and the HTTP fallback. */
  const applyGenerated = useCallback(
    (data: GeneratedNote, topic: string, rag: RagContext | null, variant: string) => {
      const urls = data.image_urls || data.urls || imagesRef.current;
      imagesRef.current = Array.isArray(urls) ? urls : [];
      const workingTopic = data.title || data.topic || topic;
      const markdown = appendRagCitations(data.markdown || "", rag);
      renderMarkdown(markdown);
      if (data.id) {
        noteIdRef.current = data.id;
        rememberNoteId(variant, data.id);
      }
      const detected = (data.title || data.topic || "").trim() || videosTopicRef.current || "";
      if (noteIdRef.current) setTarget({ noteId: noteIdRef.current, topic: detected });
      void persistSnapshot(workingTopic, markdown, imagesRef.current, variant);
    },
    [renderMarkdown, noteIdRef, videosTopicRef, setTarget, persistSnapshot],
  );

  const start = useCallback(
    async (rawTopic: string, force = false) => {
      const t = (rawTopic || "").trim();
      if (!t) {
        window.alert("Enter a topic");
        return;
      }
      const variant = variantRef.current;
      const runKey = `${variant}|${force ? "force" : "normal"}|${t.toLowerCase()}`;
      if (inFlight.current) {
        if (inFlight.current === runKey) {
          console.warn("[Generate] Duplicate start ignored:", runKey);
          return;
        }
        snack("A generation is already running. Please wait.");
        return;
      }
      inFlight.current = runKey;
      const token = ++runToken.current;
      const finishRun = () => {
        if (runToken.current === token) inFlight.current = null;
      };

      void loadVideos(t, { force: true });
      streamRef.current?.abort();
      streamRef.current = null;
      try {
        if (!force) {
          setLoading(true);
          const check = await fetchJsonWithRetry<NoteRecord>(notesApi.resolvePath(t, variant), { timeoutMs: 8000, attempts: 3 });
          if (check.status === 200 && check.data && check.data.markdown) {
            const data = check.data;
            clearUI();
            renderMarkdown(data.markdown || "");
            imagesRef.current = data.image_urls || [];
            noteIdRef.current = data.id || "";
            rememberNoteId(variant, noteIdRef.current);
            if (noteIdRef.current) setTarget({ noteId: noteIdRef.current, topic: (data.title || t).trim() });
            setLoading(false);
            finishRun();
            return;
          }
          if (check.status !== 404) {
            console.warn("[Generate] DB check not definitive; refusing to generate", check);
            setLoading(false);
            snack("Unable to confirm in DB. Try again.");
            finishRun();
            return;
          }
        }

        // RAG runs for every generation path (force included).
        const rag = await fetchRagContext(t, variant);
        clearUI();
        setLoading(true);
        let courseType = "";
        try {
          const res = await notesApi.topicsByTitle(t);
          if (res.ok && Array.isArray(res.data) && res.data.length) {
            const match = res.data.find((row) => row && row.course_type) || res.data[0];
            courseType = normalizeCourseType(match && match.course_type);
          }
        } catch (err) {
          console.warn("Course type lookup failed", err);
        }
        const deg = getSelectedDegree();
        let allowedDomains: string[] = [];
        if (deg) {
          try {
            const res = await notesApi.allowedDomains(deg);
            if (res.ok) allowedDomains = Array.isArray(res.data?.domains) ? res.data.domains : [];
          } catch (err) {
            console.warn("[MedicalNotes] Allowed domains fetch failed:", err);
          }
        }

        const query: Record<string, string> = { topic: t };
        if (force) query.force = "true";
        query.variant = variant;
        if (deg) query.degree = deg;
        if (courseType) query.course_type = courseType;
        if (allowedDomains.length) query.allowed_urls = allowedDomains.join(",");
        // Only compact citation chunks are sent (never the raw RAG answer).
        if (rag?.citations?.length) query.rag_citations = compactRagCitations(rag.citations);
        query.rag_system_prompt = RAG_MARKDOWN_SYSTEM_PROMPT;
        const streamToken = await ensureStreamAccessToken();
        if (streamToken) query.access_token = streamToken;

        const controller = new AbortController();
        streamRef.current = controller;
        let done = false;
        const stop = () => {
          done = true;
          if (streamRef.current === controller) streamRef.current = null;
          controller.abort();
        };
        const fallback = async () => {
          try {
            const bearerToken = await ensureStreamAccessToken();
            const res = await medicalApi.generateHttp(
              { topic: t, force: !!force, variant, degree: deg || undefined },
              bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {},
            );
            if (!res.ok) throw new Error((res.data && (res.data.detail || res.data.error)) || `HTTP ${res.status}`);
            applyGenerated(res.data || {}, t, rag, variant);
          } catch (err) {
            console.error("[Generate] fallback failed:", err);
            snack("Generation failed – try again");
          } finally {
            setLoading(false);
            finishRun();
          }
        };
        // The original EventSource "error" listener (connection failures and server `error` events) fell back to HTTP.
        const streamFailed = () => {
          if (done) return;
          stop();
          void fallback();
        };

        try {
          const res = await medicalApi.stream(query, controller.signal);
          if (!res.ok) {
            streamFailed();
            return;
          }
          await readSse(res, ({ event, data }) => {
            if (done) return;
            if (event === "close") {
              setLoading(false);
              finishRun();
              stop();
              return;
            }
            let payload: Record<string, unknown>;
            try {
              payload = JSON.parse(data) as Record<string, unknown>;
            } catch {
              if (event === "error") streamFailed();
              return;
            }
            if (event === "images") {
              const urls = (payload.image_urls || payload.urls || []) as string[];
              imagesRef.current = Array.isArray(urls) ? urls : [];
            } else if (event === "error") {
              streamFailed();
              setLoading(false);
              snack(String(payload.message || "") || "Generation failed");
            } else if (event === "final") {
              applyGenerated(payload as GeneratedNote, t, rag, variant);
              setLoading(false);
              finishRun();
              stop();
            }
          });
          streamFailed();
        } catch {
          if (controller.signal.aborted && (done || streamRef.current !== controller)) return;
          streamFailed();
        }
      } catch (err) {
        console.error("[Generate] startGeneration failed:", err);
        setLoading(false);
        finishRun();
        snack("Generation failed – try again");
      }
    },
    [snack, loadVideos, clearUI, renderMarkdown, noteIdRef, setTarget, fetchRagContext, getSelectedDegree, applyGenerated],
  );

  /** The note ClinQ opens: this engine's last result unless the controller loaded a note since. */
  const mcq: McqTarget | null = mcqRecord && mcqRecord.base === notes.mcq ? mcqRecord.target : notes.mcq;

  return { start, loading, mcq };
}
