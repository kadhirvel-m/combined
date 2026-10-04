"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNotes, type OutputView } from "@/features/notes";
import { getAuthToken } from "@/features/notes/lib/authToken";
import { readLocal, STORAGE_KEYS, writeLocal } from "@/features/notes/lib/storage";
import { medicalApi } from "../api";
import type { MedicalPageConfig } from "../config";
import { useRagGeneration, type McqTarget } from "../hooks/useRagGeneration";
import { extractRagMeta } from "../lib/rag";
import { normalizeTopicKey, pickBlinkUrl } from "../lib/tools";
import type { MatchPair, MindMapNode, RagChunk, RagLookup } from "../types";

export type ToolKey = "matchfoll" | "clinq" | "caseflow" | "viva" | "decision-tree" | "echo" | "medmap" | "blink";

/** A study tool shown in place of the notes (the originals swapped `#output`'s content). */
export type OpenTool =
  | { kind: "clinq"; noteId: string; topic: string; run: number }
  | { kind: "matchfoll"; topic: string; pairs: MatchPair[] }
  | { kind: "caseflow"; topic: string; scenario: string; cached: boolean }
  | { kind: "viva"; topic: string }
  | { kind: "decision-tree"; topic: string; map: MindMapNode }
  | { kind: "medmap"; topic: string; link: string }
  | { kind: "blink"; topic: string; url: string };

export interface MedicalController {
  page: MedicalPageConfig;
  /** Generation in progress in the notes_chat RAG engine (the controller has its own `loading`). */
  generating: boolean;
  /** Admin "Regenerate": URL topic or the rendered H1, forced. */
  regenerate: () => void;
  /** Open study tool (null = the notes are shown). */
  tool: OpenTool | null;
  /** Tool buttons waiting for their API call. */
  pending: Partial<Record<ToolKey, true>>;
  runTool: (key: ToolKey) => void;
  /** "Back to Notes" (with the "Returned to notes" snack unless `quiet`). */
  closeTool: (quiet?: boolean) => void;
  /** Note ClinQ quizzes on. */
  mcq: McqTarget | null;
  /** notes_chat: citation chunks of the current notes and the open chunk. */
  ragLookup: RagLookup;
  ragChunk: { label: string; data: RagChunk } | null;
  openRagChunk: (label: string) => void;
  closeRagChunk: () => void;
  /** Called by the output after every render of the notes (video refresh after a variant load). */
  onNotesRendered: (root: HTMLElement) => void;
}

const MedicalContext = createContext<MedicalController | null>(null);

export function useMedical(): MedicalController {
  const ctx = useContext(MedicalContext);
  if (!ctx) throw new Error("useMedical must be used inside <MedicalProvider>");
  return ctx;
}

function urlTopic(): string {
  try {
    return new URLSearchParams(window.location.search).get("topic")?.trim() || "";
  } catch {
    return "";
  }
}

/**
 * The workspace restores the last note on mount; the medical pages skipped
 * that when `?topic=` was present. This effect runs before the provider's
 * (children first), hides the stored ids for that synchronous mount pass and
 * puts them back right after it.
 */
function useSkipStoredNoteRestore() {
  useEffect(() => {
    if (!urlTopic()) return;
    const keys = [STORAGE_KEYS.lastNoteIdFor("detailed"), STORAGE_KEYS.lastNoteId];
    const saved = keys.map((key) => [key, readLocal(key)] as const).filter(([, value]) => value !== null);
    saved.forEach(([key]) => writeLocal(key, null));
    queueMicrotask(() => saved.forEach(([key, value]) => writeLocal(key, value)));
  }, []);
}

/** Medical study tools + page flows on top of the notes workspace. Must be inside `<NotesProvider>`. */
export function MedicalProvider({ page, children }: { page: MedicalPageConfig; children: ReactNode }) {
  useSkipStoredNoteRestore();
  const notes = useNotes();
  const { snack, titleRef, markdownRef, setTopicValue, selectVariant, startGeneration, topicSignal } = notes;
  const loadVideos = notes.videos.load;
  const rag = useRagGeneration(notes);
  const startRag = rag.start;

  const variantRef = useRef(notes.variant);
  const viewRef = useRef<OutputView>(notes.view);
  const topicRef = useRef(notes.topic);
  useEffect(() => {
    variantRef.current = notes.variant;
    viewRef.current = notes.view;
    topicRef.current = notes.topic;
  }, [notes.variant, notes.view, notes.topic]);

  /** `currentTopicOrHeading()`: the URL topic wins over the rendered H1. */
  const currentTopic = useCallback(() => urlTopic() || (titleRef.current || "").trim(), [titleRef]);

  const generate = useCallback(
    (topic: string, force: boolean) => {
      if (page.rag) void startRag(topic, force);
      else void startGeneration(topic, force);
    },
    [page.rag, startRag, startGeneration],
  );

  const regenerate = useCallback(() => {
    const t = currentTopic();
    if (!t) {
      snack("No topic to regenerate");
      return;
    }
    generate(t, true);
  }, [currentTopic, snack, generate]);

  /* ---------------- page load ---------------- */
  // After a variant is loaded from the DB (no URL topic) the originals refreshed the videos for its heading.
  const videosAfterRender = useRef(false);
  // medical_notes refreshed the videos once the restored note was loaded.
  const videosAfterRestore = useRef(false);
  // Controller actions are re-created on every render: the load effect reads the latest ones.
  const actions = useRef({ setTopicValue, selectVariant, generate });
  useEffect(() => {
    actions.current = { setTopicValue, selectVariant, generate };
  });
  useEffect(() => {
    const topic = urlTopic();
    // The variant switch (and Regenerate) read the URL topic first: keep it as the workspace topic.
    if (topic) actions.current.setTopicValue(topic);
    if (page.load === "variantClick") {
      if (!topic && readLocal(STORAGE_KEYS.lastNoteIdFor("detailed"))) videosAfterRestore.current = true;
      const timer = setTimeout(() => {
        if (!topicRef.current.trim()) videosAfterRender.current = true;
        actions.current.selectVariant("detailed");
      }, 100);
      return () => clearTimeout(timer);
    }
    if (!topic) return;
    const timer = setTimeout(() => actions.current.generate(topic, false), 120);
    return () => clearTimeout(timer);
  }, [page.load]);

  useEffect(() => {
    if (!videosAfterRestore.current || !topicSignal.nonce) return;
    videosAfterRestore.current = false;
    if (topicSignal.topic) void loadVideos(topicSignal.topic, { force: true });
  }, [topicSignal, loadVideos]);

  const onNotesRendered = useCallback(
    (root: HTMLElement) => {
      if (!videosAfterRender.current) return;
      const heading = (root.querySelector("h1")?.textContent || "").trim();
      if (!heading) return;
      videosAfterRender.current = false;
      void loadVideos(heading, { force: true });
    },
    [loadVideos],
  );

  /* ---------------- study tools ---------------- */
  const [opened, setOpened] = useState<{ tool: OpenTool; markdown: string; view: OutputView } | null>(null);
  // A new note (or a generation clearing the output) replaces the tool, as `$output.innerHTML` did.
  if (opened && (opened.markdown !== notes.markdown || opened.view !== notes.view)) setOpened(null);
  const tool = opened?.tool ?? null;
  const toolRef = useRef<OpenTool | null>(null);
  useEffect(() => {
    toolRef.current = tool;
  }, [tool]);

  const [pending, setPending] = useState<Partial<Record<ToolKey, true>>>({});
  const setBusy = useCallback((key: ToolKey, on: boolean) => {
    setPending((p) => {
      const next = { ...p };
      if (on) next[key] = true;
      else delete next[key];
      return next;
    });
  }, []);
  const open = useCallback((next: OpenTool) => setOpened({ tool: next, markdown: markdownRef.current, view: viewRef.current }), [markdownRef]);
  const closeTool = useCallback(
    (quiet = false) => {
      setOpened(null);
      if (!quiet) snack("Returned to notes");
    },
    [snack],
  );

  const errorText = (err: unknown) => (err instanceof Error ? err.message : "");
  const mcqRef = useRef<McqTarget | null>(rag.mcq);
  useEffect(() => {
    mcqRef.current = rag.mcq;
  }, [rag.mcq]);
  const clinqRun = useRef(0);

  const runTool = useCallback(
    async (key: ToolKey) => {
      if (key === "echo") return;
      const active = toolRef.current;
      const variant = variantRef.current;

      if (key === "clinq") {
        const target = mcqRef.current;
        const noteId = (target?.noteId || "").trim();
        if (!noteId) {
          snack("Generate notes first");
          return;
        }
        const topic = (target?.topic || titleRef.current || "").trim();
        open({ kind: "clinq", noteId, topic, run: ++clinqRun.current });
        return;
      }

      if (key === "blink") {
        if (active?.kind === "blink") {
          setOpened(null);
          return;
        }
        const headingTopic = (titleRef.current || "").trim();
        const topic = headingTopic;
        if (!topic) {
          snack("Generate notes first to view Blink");
          return;
        }
        setBusy("blink", true);
        try {
          const candidates = Array.from(new Set([normalizeTopicKey(topic), normalizeTopicKey(headingTopic)].filter(Boolean)));
          const token = getAuthToken("storage");
          const res = await medicalApi.blinkLinks(candidates, token ? { Authorization: `Bearer ${token}` } : {});
          if (!res.ok) throw new Error("Failed to fetch blink");
          const data = res.data || {};
          const url = pickBlinkUrl((data.links || data) as Record<string, unknown>, topic, candidates);
          if (!url) {
            snack("No Blink image available for this topic");
            return;
          }
          open({ kind: "blink", topic, url });
        } catch (err) {
          console.error("[Blink]", err);
          snack("Could not load Blink image");
        } finally {
          setBusy("blink", false);
        }
        return;
      }

      if (active?.kind === key) {
        closeTool();
        return;
      }
      const topic = currentTopic();
      if (!topic) {
        snack("No topic loaded — generate notes first");
        return;
      }

      if (key === "viva") {
        open({ kind: "viva", topic });
        return;
      }

      setBusy(key, true);
      try {
        if (key === "matchfoll") {
          const res = await medicalApi.matchFollowing(topic);
          if (!res.ok) throw new Error(res.data?.detail || `Request failed (${res.status})`);
          const pairs = res.data?.pairs;
          if (!Array.isArray(pairs) || pairs.length < 3) throw new Error("Not enough pairs returned");
          open({ kind: "matchfoll", topic, pairs });
          if (res.data?.cached) snack("Loaded cached quiz");
        } else if (key === "caseflow") {
          const res = await medicalApi.caseflow(topic, variant);
          if (!res.ok) throw new Error((res.data && (res.data.detail || res.data.error)) || `Request failed (${res.status})`);
          const scenario = String(res.data?.scenario_question || "").trim();
          if (!scenario) throw new Error("No scenario question returned");
          open({ kind: "caseflow", topic, scenario, cached: !!res.data?.cached });
          if (res.data?.cached) snack("Loaded cached CaseFlow scenario");
        } else if (key === "decision-tree") {
          const res = await medicalApi.decisionTree(topic, variant);
          if (!res.ok) throw new Error((res.data && (res.data.detail || res.data.error)) || `Request failed (${res.status})`);
          const map = res.data?.mind_map || res.data?.decision_tree?.mind_map || null;
          if (!map || !map.label) throw new Error("Invalid mind map data received");
          open({ kind: "decision-tree", topic, map });
        } else if (key === "medmap") {
          const res = await medicalApi.pptLink(topic);
          const link = typeof res.data?.ppt_link === "string" ? res.data.ppt_link.trim() : "";
          if (!link) {
            snack("No PPT available for this topic");
            return;
          }
          open({ kind: "medmap", topic, link });
        }
      } catch (err) {
        const fallbacks: Partial<Record<ToolKey, [string, string]>> = {
          matchfoll: ["[MatchFoll] Error:", "Failed to generate match quiz"],
          caseflow: ["[CaseFlow] load error:", "Failed to open CaseFlow"],
          "decision-tree": ["[MindMap] error:", "Failed to generate mind map"],
          medmap: ["[MedMap] Error:", "Failed to load PPT preview"],
        };
        const [label, message] = fallbacks[key] || ["[Tool]", "Request failed"];
        console.error(label, err);
        snack(key === "medmap" ? message : errorText(err) || message);
      } finally {
        setBusy(key, false);
      }
    },
    [snack, titleRef, open, setBusy, closeTool, currentTopic],
  );

  /* ---------------- notes_chat RAG citations ---------------- */
  const ragLookup = useMemo(() => (page.rag ? extractRagMeta(notes.markdown).lookup : {}), [page.rag, notes.markdown]);
  const [ragChunk, setRagChunk] = useState<{ label: string; data: RagChunk } | null>(null);
  const ragLookupRef = useRef(ragLookup);
  useEffect(() => {
    ragLookupRef.current = ragLookup;
  }, [ragLookup]);
  const openRagChunk = useCallback((label: string) => {
    const data = ragLookupRef.current[label];
    if (data) setRagChunk({ label, data });
  }, []);
  const closeRagChunk = useCallback(() => setRagChunk(null), []);

  const value: MedicalController = {
    page,
    generating: rag.loading,
    regenerate,
    tool,
    pending,
    runTool: (key) => void runTool(key),
    closeTool,
    mcq: rag.mcq,
    ragLookup,
    ragChunk,
    openRagChunk,
    closeRagChunk,
    onNotesRendered,
  };
  return <MedicalContext.Provider value={value}>{children}</MedicalContext.Provider>;
}
