"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useToast } from "@/components/ui";
import { apiRaw } from "@/lib/api";
import { getAnalytics } from "@/lib/analytics";
import { useTheme } from "@/lib/theme";
import { fetchJsonWithRetry, notesApi, saveBlob } from "../api";
import { bearer, COOKIE_AUTH_SENTINEL, getAuthToken, hasLoginMarker } from "../lib/authToken";
import { ensureWorkingSection, normalizeCourseType, safeFileName, withHardBreaks } from "../lib/markdown";
import { decorateNotesOutput } from "../lib/outputDom";
import { readSse } from "../lib/sse";
import { readLocal, rememberNoteId, STORAGE_KEYS, storedNoteId, writeLocal, writeSession } from "../lib/storage";
import type { NotesWorkspaceConfig } from "../config";
import type { NoteRecord, StreamFinalEvent, StreamImagesEvent, StreamStartEvent, TocItem } from "../types";
import { useAccess, type LimitInfo, type NotesAccess } from "./useAccess";
import { useDegree, type NotesDegree } from "./useDegree";
import { useGarlicSession } from "./useGarlicSession";
import { useRelatedVideos, type RelatedVideosApi } from "./useRelatedVideos";
import { useRoles, type NotesRoleFlags } from "./useRoles";
import styles from "../notes.module.css";

/** Progress bar value per stream stage (unknown stages reset it to 0). */
const STAGE_PROGRESS: Record<string, number> = {
  start: 5,
  search_results: 20,
  fetch_start: 28,
  fetch_done: 46,
  merged_titles: 58,
  context_ready: 66,
  llm_start: 72,
  llm_done: 88,
  images: 94,
  final: 100,
};

export type OutputView = "markdown" | "cleared" | "limit";

/** Everything the workspace components (and page-specific extensions) read and do. */
export interface NotesController {
  config: NotesWorkspaceConfig;
  snack: (message: string) => void;
  roles: NotesRoleFlags;
  access: NotesAccess;
  degree: NotesDegree;
  videos: RelatedVideosApi;
  theme: "light" | "dark";
  toggleTheme: () => void;

  /* topic input */
  topic: string;
  /** User typing (debounced related-videos lookup). */
  onTopicInput: (value: string) => void;
  /** Programmatic update (no lookup). */
  setTopicValue: (value: string) => void;
  busy: boolean;
  generate: () => void;
  regenerate: () => void;
  cancel: () => void;
  /** Starts a generation (DB first unless `force`). */
  startGeneration: (topic: string, force?: boolean) => Promise<void>;

  /* progress / meta */
  progress: number;
  activeStage: string | null;
  meta: string;
  images: string[] | null;

  /* output */
  variant: string;
  selectVariant: (key: string) => void;
  /** Current markdown source (the original `lastMarkdown`). */
  markdown: string;
  markdownRef: RefObject<string>;
  /** Markdown as handed to `<Markdown>` (page preparation + hard line breaks). */
  displayMarkdown: string;
  view: OutputView;
  limit: LimitInfo | null;
  loading: boolean;
  toc: TocItem[];
  /** Text of the rendered `<h1>` ("" when none). */
  title: string;
  titleRef: RefObject<string>;
  /** Decorates the rendered notes (TOC, citations…). Stable; pass to `<Markdown onRendered>`. */
  onOutputRendered: (root: HTMLDivElement) => void;
  /** Container of the rendered notes (selection checks, PDF export, share preview). */
  outputRef: RefObject<HTMLDivElement | null>;
  wrapRef: RefObject<HTMLDivElement | null>;
  editorRef: RefObject<HTMLTextAreaElement | null>;
  renderMarkdown: (markdown: string) => void;
  noteIdRef: RefObject<string>;

  /* toolbar */
  editing: boolean;
  editorValue: string;
  setEditorValue: (value: string) => void;
  toggleEdit: () => void;
  save: () => Promise<void>;
  myNoteVisible: boolean;
  loadMyNote: () => Promise<void>;
  persistMyNote: (markdown: string) => Promise<boolean>;
  checkMyNoteVisibility: () => Promise<void>;
  download: () => Promise<void>;
  emphasis: boolean;
  toggleEmphasis: () => void;
  fullscreen: boolean;
  setFullscreen: (on: boolean) => void;
  density: boolean | null;
  toggleDensity: () => void;

  /* header */
  mcq: { noteId: string; topic: string } | null;
  mcqOpening: boolean;
  openMcq: () => Promise<void>;
  verifiedBy: string;
  verifyLabel: string;
  verifyDisabled: boolean;
  approve: () => Promise<void>;
  headerHidden: boolean;
  setHeaderHidden: (hidden: boolean) => void;
  shareOpen: boolean;
  setShareOpen: (open: boolean) => void;
  feedbackOpen: boolean;
  setFeedbackOpen: (open: boolean) => void;

  /** Bumped (with the topic) when generation starts, a saved note loads or generation finishes. */
  topicSignal: { topic: string; nonce: number };
  /** GARLIC study session registration. */
  setGarlicSession: (sessionId: string) => void;
}

function useStateRef<T>(initial: T) {
  const [value, setValue] = useState(initial);
  const ref = useRef(initial);
  const set = useCallback((next: T) => {
    ref.current = next;
    setValue(next);
  }, []);
  return [value, set, ref] as const;
}

export function useNotesController(config: NotesWorkspaceConfig): NotesController {
  const configRef = useRef(config);
  const { toast } = useToast();
  const snack = useCallback((message: string) => void toast(message, { duration: 1500 }), [toast]);
  const { theme, toggleTheme } = useTheme();
  const token = useCallback(() => getAuthToken(config.authToken), [config.authToken]);
  const lookupHeaders = useCallback(() => (config.authLookups ? bearer(getAuthToken(config.authToken)) : undefined), [config.authLookups, config.authToken]);

  /* ---------------- state ---------------- */
  const [topic, setTopicState, topicRef] = useStateRef("");
  const [variant, setVariantState, variantRef] = useStateRef(config.variants[0]?.key || "detailed");
  const [markdown, setMarkdownState, markdownRef] = useStateRef("");
  const [view, setViewState, viewRef] = useStateRef<OutputView>("markdown");
  const [limit, setLimit] = useState<LimitInfo | null>(null);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [title, setTitleState, titleRef] = useStateRef("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusyState, busyRef] = useStateRef(false);
  const [meta, setMeta] = useState("");
  const [progress, setProgressValue] = useState(0);
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [images, setImages] = useState<string[] | null>(null);
  const imageUrlsRef = useRef<string[]>([]);
  const noteIdRef = useRef("");
  const [mcq, setMcq] = useState<{ noteId: string; topic: string } | null>(null);
  const [mcqOpening, setMcqOpening] = useState(false);
  const [verifiedBy, setVerifiedBy] = useState("");
  const [verifyLabel, setVerifyLabel] = useState("Approve");
  const [verifyDisabled, setVerifyDisabled] = useState(false);
  const [myNoteVisible, setMyNoteVisible] = useState(false);
  const [editing, setEditingState, editingRef] = useStateRef(false);
  const [editorValue, setEditorValueState, editorValueRef] = useStateRef("");
  const [emphasis, setEmphasisState, emphasisRef] = useStateRef(false);
  const [fullscreen, setFullscreenState, fullscreenRef] = useStateRef(false);
  const [density, setDensity] = useState<boolean | null>(null);
  const [headerHidden, setHeaderHidden] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [topicSignal, setTopicSignal] = useState({ topic: "", nonce: 0 });
  const outputRef = useRef<HTMLDivElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const streamRef = useRef<AbortController | null>(null);
  const videoDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const roles = useRoles(config);
  const degree = useDegree(config);
  const videos = useRelatedVideos(config, lookupHeaders);
  const setGarlicSession = useGarlicSession(config.garlic);

  /* ---------------- small helpers ---------------- */
  const setBusy = useCallback((b: boolean) => setBusyState(b), [setBusyState]);
  const showLoader = useCallback(() => setLoading(true), []);
  const hideLoader = useCallback(() => setLoading(false), []);
  const setStage = useCallback((stage: string) => {
    setProgressValue(STAGE_PROGRESS[stage] ?? 0);
    setActiveStage(stage);
  }, []);
  const signalTopic = useCallback((t: string) => setTopicSignal((s) => ({ topic: t, nonce: s.nonce + 1 })), []);
  const setTopicValue = useCallback((value: string) => setTopicState(value), [setTopicState]);
  const persistEmphasis = useCallback(() => writeLocal(STORAGE_KEYS.emphasis, emphasisRef.current ? "1" : "0"), [emphasisRef]);

  const resetMcq = useCallback(() => {
    setMcq(null);
    setMcqOpening(false);
  }, []);

  const onLimit = useCallback((info: LimitInfo) => {
    // clearUI() + the limit panel (the markdown source is kept, as before).
    setImages(null);
    setViewState("limit");
    setLimit(info);
    setToc([]);
    setTitleState("");
    setProgressValue(0);
    resetMcq();
    noteIdRef.current = "";
    imageUrlsRef.current = [];
    setMeta(`Access limited • ${variantRef.current}`);
  }, [resetMcq, setViewState, setTitleState, variantRef]);

  const access = useAccess(config, { snack, onLimit });

  const enableMcq = useCallback(
    (noteId: string, t: string) => {
      if (!access.isFeatureAllowed("mcq_access", true)) {
        resetMcq();
        return;
      }
      setMcq({ noteId: noteId || "", topic: t || "" });
      setMcqOpening(false);
    },
    [access, resetMcq],
  );

  // Plan-gated buttons disappear as soon as the plan summary says the plan lacks them.
  const visibleMcq = mcq && access.isFeatureAllowed("mcq_access", true) ? mcq : null;

  const applyVerification = useCallback(
    (data: NoteRecord | null) => {
      if (!configRef.current.header.verify) return;
      const name = String(data?.verified_by_name || "").trim();
      setVerifiedBy(name);
      setVerifyLabel(name ? "Verified" : "Approve");
      setVerifyDisabled(!!name);
    },
    [],
  );

  const checkMyNoteVisibility = useCallback(async () => {
    const t = token();
    if (!t) return setMyNoteVisible(false);
    const heading = (titleRef.current || topicRef.current || "").trim();
    if (!heading) return setMyNoteVisible(false);
    try {
      const res = await notesApi.editedCheck(heading, variantRef.current, t);
      setMyNoteVisible(!!(res.ok && res.data?.exists));
    } catch {
      setMyNoteVisible(false);
    }
  }, [token, titleRef, topicRef, variantRef]);

  const clearUI = useCallback(() => {
    setImages(null);
    setViewState("cleared");
    setLimit(null);
    setToc([]);
    setTitleState("");
    setProgressValue(0);
    setMeta("");
    resetMcq();
    noteIdRef.current = "";
    imageUrlsRef.current = [];
  }, [resetMcq, setViewState, setTitleState]);

  const renderMarkdown = useCallback(
    (md: string) => {
      const next = md ?? "";
      const unchanged = viewRef.current === "markdown" && next === markdownRef.current;
      setMarkdownState(next);
      setViewState("markdown");
      setLimit(null);
      setEditorValueState(next);
      if (next.length > 50) {
        void getAnalytics().track("note_viewed", { variant: variantRef.current || "detailed", word_count: next.split(/\s+/).length });
      }
      if (!next.trim()) {
        setToc([]);
        setTitleState("");
      }
      // Same content: <Markdown> will not re-render, so refresh what a render would have.
      if (unchanged || !next.trim()) void checkMyNoteVisibility();
    },
    [viewRef, markdownRef, setMarkdownState, setViewState, setEditorValueState, variantRef, setTitleState, checkMyNoteVisibility],
  );

  const renderImageGallery = useCallback((urls: unknown) => {
    const list = Array.isArray(urls) ? Array.from(new Set(urls.map((u) => String(u || "").trim()).filter(Boolean))) : [];
    imageUrlsRef.current = list;
    setImages(list);
  }, []);

  const onOutputRendered = useCallback(
    (root: HTMLDivElement) => {
      const cfg = configRef.current;
      const result = decorateNotesOutput(root, {
        markdown: markdownRef.current,
        classNames: { citationPill: styles.citationPill, citationsList: styles.citationsList, citationItem: styles.citationItem },
        context: { pageFile: cfg.pageFile },
        extra: cfg.decorateOutput,
      });
      setToc(result.toc);
      setTitleState(result.title);
      void checkMyNoteVisibility();
    },
    [markdownRef, setTitleState, checkMyNoteVisibility],
  );

  const displayMarkdown = useMemo(() => {
    if (view !== "markdown" || !markdown) return "";
    const prepared = config.prepareMarkdown ? config.prepareMarkdown(markdown) : markdown;
    return withHardBreaks(prepared);
  }, [view, markdown, config]);

  /* ---------------- generation ---------------- */
  const stopStream = useCallback(() => {
    streamRef.current?.abort();
    streamRef.current = null;
  }, []);

  const startGeneration = useCallback(
    async (rawTopic: string, force = false) => {
      const cfg = configRef.current;
      const t = (rawTopic || "").trim();
      if (!t) {
        window.alert("Enter a topic");
        return;
      }
      void videos.load(t, { force: true });
      signalTopic(t);
      stopStream();
      const v = variantRef.current;

      if (!force) {
        if (cfg.access && !access.hasConsumedTopicOpen(t)) {
          const canOpen = await access.ensure("topic_open", { consume: true, allowOnTransientFailure: false, renderInOutput: true });
          if (!canOpen) return;
          access.markTopicOpenConsumed(t);
        }
        setBusy(true);
        showLoader();
        setMeta(`Checking DB • ${v}`);
        const check = await fetchJsonWithRetry<NoteRecord>(notesApi.resolvePath(t, v), { timeoutMs: 8000, attempts: 3, headers: lookupHeaders() });
        if (check.status === 200 && check.data && check.data.markdown) {
          const data = check.data;
          clearUI();
          renderMarkdown(data.markdown || "");
          renderImageGallery(data.image_urls || []);
          applyVerification(data);
          persistEmphasis();
          noteIdRef.current = data.id || "";
          rememberNoteId(v, noteIdRef.current);
          setMeta(`Loaded • ${noteIdRef.current || "-"} • ${v}`);
          if (noteIdRef.current) enableMcq(noteIdRef.current, (data.title || t).trim());
          signalTopic((data.title || t).trim());
          hideLoader();
          setBusy(false);
          return;
        }
        if (check.status !== 404) {
          if (cfg.dbCheckFallback === "stop") {
            console.warn("[Generate] DB check not definitive; refusing to generate", check);
            hideLoader();
            setBusy(false);
            snack("Unable to confirm in DB. Try again.");
            return;
          }
          console.warn("[Generate] DB check not definitive; continuing with generation fallback", check);
          snack("DB check skipped. Generating notes...");
        }
      }

      if (cfg.access) {
        const canGenerate = await access.ensure("ai_prompt", { consume: true, allowOnTransientFailure: false, renderInOutput: true });
        if (!canGenerate) {
          hideLoader();
          setBusy(false);
          return;
        }
      }

      applyVerification(null);
      clearUI();
      setBusy(true);
      showLoader();
      let courseType = "";
      try {
        const res = await notesApi.topicsByTitle(t, lookupHeaders());
        if (res.ok && Array.isArray(res.data) && res.data.length) {
          const match = res.data.find((row) => row && row.course_type) || res.data[0];
          courseType = normalizeCourseType(match && match.course_type);
        }
      } catch (err) {
        console.warn("Course type lookup failed", err);
      }

      const query: Record<string, string> = { topic: t };
      if (force) query.force = "true";
      query.variant = v;
      const deg = degree.getSelectedDegree();
      if (deg) query.degree = deg;
      if (courseType) query.course_type = courseType;
      const streamToken = getAuthToken(cfg.authToken);
      if (streamToken && streamToken !== COOKIE_AUTH_SENTINEL) query.access_token = streamToken;

      const controller = new AbortController();
      streamRef.current = controller;
      let finished = false;
      const finish = () => {
        finished = true;
        if (streamRef.current === controller) streamRef.current = null;
        controller.abort();
      };
      const fail = () => {
        hideLoader();
        setBusy(false);
        finish();
      };

      const handlers: Record<string, (d: Record<string, unknown>) => void> = {
        start: (d) => {
          const allowed = Array.isArray((d as StreamStartEvent).allowed_domains) ? ((d as StreamStartEvent).allowed_domains as string[]) : [];
          const dg = String((d as StreamStartEvent).degree || "").trim();
          const preview = allowed.slice(0, 4).join(", ") + (allowed.length > 4 ? "…" : "");
          if (dg && allowed.length) degree.setDomainsHint(`Degree: ${dg} • ${preview}`);
          else if (dg) degree.setDomainsHint(`Degree: ${dg} • web (fallback)`);
          else if (allowed.length) degree.setDomainsHint(`Sources: ${preview}`);
          else degree.setDomainsHint("Sources: auto");
        },
        search_results: (d) => void (d.urls as unknown[]).length,
        fetch_start: () => {},
        fetch_done: () => {},
        fetch_error: () => {},
        merged_titles: (d) => void (d.titles as unknown[]).length,
        context_ready: () => {},
        llm_start: () => {},
        llm_done: () => {},
        images: (d) => renderImageGallery((d as StreamImagesEvent).image_urls || (d as StreamImagesEvent).urls || []),
        error: () => fail(),
        final: (raw) => {
          const d = raw as StreamFinalEvent;
          renderImageGallery(d.image_urls || d.urls || imageUrlsRef.current);
          renderMarkdown(ensureWorkingSection(d.markdown, d.title || d.topic || t, courseType));
          persistEmphasis();
          hideLoader();
          if (d.id) {
            noteIdRef.current = d.id;
            rememberNoteId(v, d.id);
            setMeta(`Saved • ${d.id} • ${v}`);
          }
          const detected = (d.title || d.topic || "").trim() || topicRef.current.trim() || videos.topicRef.current || "";
          if (noteIdRef.current) enableMcq(noteIdRef.current, detected);
          signalTopic(detected);
          setBusy(false);
          finish();
        },
      };

      try {
        const res = await apiRaw(cfg.streamPath, { query, signal: controller.signal, headers: { Accept: "text/event-stream" } });
        if (!res.ok) {
          fail();
          return;
        }
        setStage("start");
        await readSse(res, ({ event, data }) => {
          if (finished) return;
          if (event === "close") {
            fail();
            return;
          }
          const handler = handlers[event];
          if (!handler) return;
          try {
            handler(JSON.parse(data) as Record<string, unknown>);
            setStage(event);
          } catch {
            /* malformed event: ignored like the original */
          }
        });
        if (!finished) fail();
      } catch {
        if (controller.signal.aborted && (finished || streamRef.current !== controller)) return;
        fail();
      }
    },
    [
      videos,
      signalTopic,
      stopStream,
      variantRef,
      access,
      setBusy,
      showLoader,
      hideLoader,
      lookupHeaders,
      clearUI,
      renderMarkdown,
      renderImageGallery,
      applyVerification,
      persistEmphasis,
      enableMcq,
      snack,
      degree,
      setStage,
      topicRef,
    ],
  );

  const generate = useCallback(() => {
    if (busyRef.current) return;
    void startGeneration(topicRef.current, false);
  }, [busyRef, startGeneration, topicRef]);

  const regenerate = useCallback(() => {
    const t = (topicRef.current || titleRef.current).trim();
    if (!t) {
      window.alert("Enter a topic");
      return;
    }
    setTopicValue(t);
    void startGeneration(t, true);
  }, [topicRef, titleRef, setTopicValue, startGeneration]);

  const cancel = useCallback(() => {
    stopStream();
    hideLoader();
    setBusy(false);
  }, [stopStream, hideLoader, setBusy]);

  const onTopicInput = useCallback(
    (value: string) => {
      setTopicState(value);
      const query = value.trim();
      if (videoDebounce.current) clearTimeout(videoDebounce.current);
      videoDebounce.current = setTimeout(() => {
        if (!query) void videos.load("", { force: true });
        else void videos.load(query);
      }, 600);
    },
    [setTopicState, videos],
  );

  /* ---------------- variants ---------------- */
  const loadNoteInto = useCallback(
    (data: NoteRecord, id: string, v: string, fromTitle: boolean) => {
      renderMarkdown(data.markdown || "");
      renderImageGallery(data.image_urls || []);
      applyVerification(data);
      noteIdRef.current = (fromTitle ? data.id || "" : data.id || id) || "";
      if (fromTitle && noteIdRef.current) writeLocal(STORAGE_KEYS.lastNoteIdFor(v), noteIdRef.current);
      setMeta(`Loaded • ${(fromTitle ? noteIdRef.current : data.id || id) || "-"} • ${v}`);
      const loadedTopic = ((fromTitle ? data.title : "") || titleRef.current || topicRef.current || "").trim();
      if (noteIdRef.current) enableMcq(noteIdRef.current, loadedTopic);
    },
    [renderMarkdown, renderImageGallery, applyVerification, enableMcq, titleRef, topicRef],
  );

  const selectVariant = useCallback(
    async (key: string) => {
      if (!configRef.current.variants.some((o) => o.key === key)) return;
      setVariantState(key);
      writeLocal(STORAGE_KEYS.lastVariant, key);
      applyVerification(null);
      void checkMyNoteVisibility();
      const typed = topicRef.current.trim();
      if (typed) {
        // The original clicked Generate, which does nothing while busy.
        if (!busyRef.current) void startGeneration(typed, false);
        return;
      }
      const lastId = readLocal(STORAGE_KEYS.lastNoteIdFor(key)) || "";
      const t = (topicRef.current || titleRef.current || "").trim();

      const tryResolveByTitle = async (): Promise<{ loaded: boolean; definitiveMissing: boolean }> => {
        if (!t) return { loaded: false, definitiveMissing: false };
        setMeta(`Checking DB • ${key}`);
        const res = await fetchJsonWithRetry<NoteRecord>(notesApi.resolvePath(t, key), { timeoutMs: 8000, attempts: 3, headers: lookupHeaders() });
        if (res.status === 200 && res.data && res.data.markdown) {
          loadNoteInto(res.data, "", key, true);
          return { loaded: true, definitiveMissing: false };
        }
        return { loaded: false, definitiveMissing: res.status === 404 };
      };
      const autoGenerate = () => {
        if (!t) {
          snack("Enter a topic");
          return;
        }
        void startGeneration(t, false);
      };

      if (lastId) {
        setMeta(`Loading • ${lastId} • ${key}`);
        const res = await fetchJsonWithRetry<NoteRecord>(notesApi.noteByIdPath(lastId, key), { timeoutMs: 8000, attempts: 3, headers: lookupHeaders() });
        if (res.status === 200 && res.data && res.data.markdown) {
          loadNoteInto(res.data, lastId, key, false);
          return;
        }
        if (res.status === 404) {
          const resolved = await tryResolveByTitle();
          if (resolved.loaded) return;
          if (resolved.definitiveMissing) return autoGenerate();
          snack("Unable to confirm saved note right now");
          return;
        }
        console.warn("[Variant] Fetch by id not definitive; skipping auto-generate", res);
        snack("Unable to load saved note right now");
        return;
      }
      const resolved = await tryResolveByTitle();
      if (resolved.loaded) return;
      if (resolved.definitiveMissing) return autoGenerate();
      snack("Unable to confirm note in DB right now");
    },
    [setVariantState, applyVerification, checkMyNoteVisibility, topicRef, busyRef, startGeneration, titleRef, lookupHeaders, loadNoteInto, snack],
  );

  /* ---------------- toolbar actions ---------------- */
  const setEditMode = useCallback(
    (on: boolean) => {
      setEditingState(on);
      if (on) {
        setEditorValueState(markdownRef.current);
        requestAnimationFrame(() => {
          try {
            editorRef.current?.focus({ preventScroll: true });
          } catch {
            editorRef.current?.focus();
          }
        });
      } else {
        renderMarkdown(editorValueRef.current);
      }
    },
    [setEditingState, setEditorValueState, markdownRef, renderMarkdown, editorValueRef],
  );

  const toggleEdit = useCallback(() => {
    if (!(markdownRef.current && markdownRef.current.trim())) {
      snack("Generate notes first");
      return;
    }
    setEditMode(!editingRef.current);
  }, [markdownRef, snack, setEditMode, editingRef]);

  const save = useCallback(async () => {
    const md = editorValueRef.current || "";
    const v = variantRef.current;
    try {
      if (!noteIdRef.current) {
        const heading = (titleRef.current || topicRef.current || "Untitled").trim();
        const res = await notesApi.createNote(v, { topic: heading, markdown: md, image_urls: imageUrlsRef.current });
        if (!res.ok) return snack("Save failed");
        noteIdRef.current = String(res.data?.id || "");
        rememberNoteId(v, noteIdRef.current);
        setMeta(`Saved • ${noteIdRef.current} • ${v}`);
        renderImageGallery(res.data?.image_urls || imageUrlsRef.current);
      } else {
        const res = await notesApi.updateNote(noteIdRef.current, v, { markdown: md, image_urls: imageUrlsRef.current });
        if (!res.ok) return snack("Save failed");
        renderImageGallery((res.data && res.data.image_urls) || imageUrlsRef.current);
        setMeta(`Saved • ${noteIdRef.current} • ${v}`);
      }
      renderMarkdown(md);
      setEditMode(false);
      snack("Saved");
    } catch (err) {
      console.error(err);
      snack("Save failed");
    }
  }, [editorValueRef, variantRef, titleRef, topicRef, snack, renderImageGallery, renderMarkdown, setEditMode]);

  const persistMyNote = useCallback(
    async (md: string) => {
      const t = token();
      if (!t) return false;
      const heading = (titleRef.current || topicRef.current || "Untitled").trim();
      if (!heading) return false;
      try {
        const res = await notesApi.saveEdited(heading, md, variantRef.current, t);
        return res.ok;
      } catch {
        return false;
      }
    },
    [token, titleRef, topicRef, variantRef],
  );

  const loadMyNote = useCallback(async () => {
    const t = token();
    if (!t) return snack("Sign in to use My note");
    const heading = (titleRef.current || topicRef.current || "").trim();
    if (!heading) return snack("No note loaded");
    try {
      const res = await notesApi.getEdited(heading, variantRef.current, t);
      if (!res.ok) throw new Error((res.data && (res.data.detail || res.data.error)) || "Load failed");
      if (res.data && res.data.markdown) {
        renderMarkdown(res.data.markdown);
        applyVerification(res.data);
        setMeta(`My note • ${variantRef.current}`);
        snack("Loaded My note");
      }
    } catch (err) {
      console.warn("My note error:", err);
      snack("Unable to load My note");
    }
  }, [token, snack, titleRef, topicRef, variantRef, renderMarkdown, applyVerification]);

  const download = useCallback(async () => {
    const cfg = configRef.current;
    if (cfg.download === "html2pdf") {
      const el = outputRef.current;
      if (!el || !el.innerHTML.trim()) return snack("Generate notes first");
      snack("Preparing PDF…");
      const heading = (el.querySelector("h1")?.textContent || "notes").trim();
      try {
        const { default: html2pdf } = await import("html2pdf.js");
        const stripCitations = (doc: Document) => {
          const out = doc.getElementById("output");
          if (!out) return;
          for (const h of Array.from(out.querySelectorAll("h2"))) {
            if ((h.textContent || "").trim().toUpperCase() !== "CITATIONS") continue;
            let cur = h.nextSibling;
            while (cur) {
              const next = cur.nextSibling;
              if (cur.nodeType === 1 && /^(H1|H2)$/i.test(cur.nodeName)) break;
              cur.parentNode?.removeChild(cur);
              cur = next;
            }
            h.remove();
            break;
          }
          out.querySelectorAll(`[data-citations-section], .${styles.citationPill}, .${styles.citationsList}`).forEach((n) => n.remove());
        };
        // `pagebreak` is a valid html2pdf option missing from its type definitions.
        const options = {
          margin: [10, 10, 10, 10] as [number, number, number, number],
          filename: `${safeFileName(noteIdRef.current || heading || "notes")}.pdf`,
          image: { type: "jpeg" as const, quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, letterRendering: true, onclone: stripCitations },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
          pagebreak: { mode: ["avoid-all", "css", "legacy"] },
        };
        await html2pdf().set(options).from(el).save();
        snack("PDF downloaded");
      } catch (err) {
        console.error(err);
        snack("PDF download failed");
      }
      return;
    }
    try {
      if (noteIdRef.current) {
        const res = await notesApi.notePdf(noteIdRef.current);
        if (!res.ok) throw new Error("PDF request failed");
        saveBlob(await res.blob(), `${noteIdRef.current}.pdf`);
        return;
      }
      const heading = (titleRef.current || "notes").trim();
      const res = await notesApi.adhocPdf(heading, markdownRef.current || "");
      if (!res.ok) throw new Error("PDF request failed");
      saveBlob(await res.blob(), `${safeFileName(heading)}.pdf`);
    } catch (err) {
      console.error(err);
      snack("PDF download failed");
    }
  }, [snack, titleRef, markdownRef]);

  const toggleEmphasis = useCallback(() => {
    setEmphasisState(!emphasisRef.current);
    persistEmphasis();
  }, [setEmphasisState, emphasisRef, persistEmphasis]);

  const setFullscreen = useCallback(
    (on: boolean) => {
      setFullscreenState(on);
      if (!configRef.current.fullscreen.native) return;
      try {
        if (on && !document.fullscreenElement) {
          wrapRef.current?.requestFullscreen().catch((err: Error) => console.warn(`Error attempting to enable fullscreen: ${err.message}`));
        } else if (!on && document.fullscreenElement) {
          document.exitFullscreen().catch((err: Error) => console.warn(`Error attempting to exit fullscreen: ${err.message}`));
        }
      } catch (err) {
        console.error(err);
      }
    },
    [setFullscreenState],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && fullscreenRef.current) setFullscreen(false);
    };
    const onChange = () => {
      if (configRef.current.fullscreen.native && !document.fullscreenElement && fullscreenRef.current) setFullscreenState(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", onChange);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onChange);
    };
  }, [fullscreenRef, setFullscreen, setFullscreenState]);

  const toggleDensity = useCallback(() => setDensity((d) => !d), []);

  /* ---------------- header actions ---------------- */
  const openMcq = useCallback(async () => {
    if (!mcq) return;
    if (!access.isFeatureAllowed("mcq_access", true)) return snack("MCQ access disabled for your current plan");
    const allowed = await access.ensure("mcq_attempt", { consume: false, allowOnTransientFailure: false });
    if (!allowed) return;
    const noteId = mcq.noteId.trim();
    if (!noteId) return snack("Generate notes first");
    const inferred = (mcq.topic || titleRef.current || topicRef.current || "").trim();
    writeSession(STORAGE_KEYS.lastMcqSeed, JSON.stringify({ noteId, topic: inferred, ts: Date.now() }));
    const search = new URLSearchParams({ noteId });
    if (inferred) search.set("topic", inferred);
    setMcqOpening(true);
    setTimeout(() => {
      window.location.assign(new URL(`/mcq.html?${search.toString()}`, window.location.href).toString());
    }, 120);
  }, [mcq, access, snack, titleRef, topicRef]);

  const approve = useCallback(async () => {
    const t = token();
    if (!t) return snack("Sign in required");
    const heading = (titleRef.current || topicRef.current || "").trim();
    if (!noteIdRef.current && !heading) return snack("Generate notes first");
    const prev = verifyLabel;
    setVerifyDisabled(true);
    setVerifyLabel("Verifying...");
    try {
      const res = await notesApi.verify(noteIdRef.current ? { note_id: noteIdRef.current } : { title: heading }, t);
      const data = res.data || {};
      if (!res.ok) throw new Error(data.detail || data.error ? String(data.detail || data.error) : "Verify failed");
      if (data.note_id) {
        noteIdRef.current = String(data.note_id);
        rememberNoteId(variantRef.current, noteIdRef.current);
      }
      setMeta(`Verified • ${data.verified_by_name || "Teacher/HOD"} • ${variantRef.current}`);
      setVerifiedBy(data.verified_by_name || "Teacher/HOD");
      setVerifyLabel("Verified");
      snack("Note verified");
    } catch (err) {
      console.warn("Verify failed", err);
      snack(err instanceof Error && err.message ? err.message : "Verify failed");
      setVerifyLabel(prev || "Approve");
    } finally {
      setVerifyDisabled(false);
    }
  }, [token, snack, titleRef, topicRef, verifyLabel, variantRef]);

  /* ---------------- page load ---------------- */
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const cfg = configRef.current;
    // Login gate (the originals checked this once, before rendering).
    if (!hasLoginMarker(cfg.loginGate)) {
      window.location.replace(`/login.html?next=${encodeURIComponent(window.location.pathname + (window.location.search || ""))}`);
      return;
    }

    const firstVariant = cfg.variants[0]?.key || "detailed";
    writeLocal(STORAGE_KEYS.lastVariant, firstVariant);
    noteIdRef.current = storedNoteId(firstVariant);
    setEmphasisState(readLocal(STORAGE_KEYS.emphasis) === "1");
    persistEmphasis();

    const storedTopic = videos.restore();
    if (storedTopic && !topicRef.current) setTopicValue(storedTopic);
    void degree.init(access.loadSummary);

    const params = new URLSearchParams(window.location.search);
    const queryTopic = cfg.autoStart.params.map((p) => (params.get(p) || "").trim()).find(Boolean) || "";
    const solveQuestion = cfg.solve ? (params.get(cfg.solve.param) || "").trim() : "";
    const scrollToOutput = (delay: number) => setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth" }), delay);
    const cleanUrl = () => {
      try {
        window.history.replaceState(null, "", window.location.pathname + window.location.hash);
      } catch {
        /* ignore */
      }
    };

    if (solveQuestion && cfg.solve) {
      const solve = cfg.solve;
      void (async () => {
        showLoader();
        setBusy(true);
        setMeta("Solving…");
        setTopicValue(solveQuestion);
        cleanUrl();
        try {
          const res = await notesApi.solve(solve.path, solveQuestion);
          if (res.ok && res.data?.markdown) {
            renderMarkdown(res.data.markdown);
            setMeta("Solution loaded");
            snack("Solution ready");
          } else {
            snack(res.data?.error || "Failed to generate solution");
          }
        } catch (err) {
          console.error("Solve error:", err);
          snack("Failed to fetch solution");
        } finally {
          hideLoader();
          setBusy(false);
          scrollToOutput(100);
        }
      })();
    }

    if (!queryTopic && !solveQuestion) {
      const id = storedNoteId(firstVariant);
      if (id) {
        void (async () => {
          try {
            const res = await notesApi.getNote(id, firstVariant);
            if (!res.ok || !res.data?.markdown) return;
            const data = res.data;
            renderMarkdown(data.markdown || "");
            renderImageGallery(data.image_urls || []);
            applyVerification(data);
            setMeta(`Loaded • ${id} • ${firstVariant}`);
            noteIdRef.current = data.id || id;
            const fallbackTopic = cfg.storedTopicFallback ? storedTopic : "";
            const derived = (data.title || fallbackTopic || topicRef.current || "").trim();
            if (noteIdRef.current) enableMcq(noteIdRef.current, derived);
            signalTopic(derived);
          } catch {
            /* nothing to restore */
          }
        })();
      }
    }

    if (queryTopic) {
      setTopicValue(queryTopic);
      void startGeneration(queryTopic, false);
      scrollToOutput(cfg.autoStart.retry ? 80 : 50);
      cleanUrl();
    }
  }, [
    persistEmphasis,
    setEmphasisState,
    videos,
    topicRef,
    setTopicValue,
    degree,
    access.loadSummary,
    showLoader,
    setBusy,
    renderMarkdown,
    snack,
    hideLoader,
    renderImageGallery,
    applyVerification,
    enableMcq,
    signalTopic,
    startGeneration,
  ]);

  // Some third-party SVG code rejects with a createElementNS error; the img_gen page silenced it.
  useEffect(() => {
    if (!config.guardSvgRejections) return;
    const onRejection = (ev: PromiseRejectionEvent) => {
      const reason = ev?.reason as { message?: string } | string | undefined;
      const msg = String((typeof reason === "object" && reason?.message) || reason || "");
      if (msg.includes("createElementNS")) {
        ev.preventDefault();
        console.warn("[UI] Ignored known SVG init rejection:", msg);
      }
    };
    window.addEventListener("unhandledrejection", onRejection);
    return () => window.removeEventListener("unhandledrejection", onRejection);
  }, [config.guardSvgRejections]);

  useEffect(() => () => {
    if (videoDebounce.current) clearTimeout(videoDebounce.current);
  }, []);

  return {
    config,
    snack,
    roles,
    access,
    degree,
    videos,
    theme,
    toggleTheme,
    topic,
    onTopicInput,
    setTopicValue,
    busy,
    generate,
    regenerate,
    cancel,
    startGeneration,
    progress,
    activeStage,
    meta,
    images,
    variant,
    selectVariant: (key: string) => void selectVariant(key),
    markdown,
    markdownRef,
    displayMarkdown,
    view,
    limit,
    loading,
    toc,
    title,
    titleRef,
    onOutputRendered,
    outputRef,
    wrapRef,
    editorRef,
    renderMarkdown,
    noteIdRef,
    editing,
    editorValue,
    setEditorValue: setEditorValueState,
    toggleEdit,
    save,
    myNoteVisible,
    loadMyNote,
    persistMyNote,
    checkMyNoteVisibility,
    download,
    emphasis,
    toggleEmphasis,
    fullscreen,
    setFullscreen,
    density,
    toggleDensity,
    mcq: visibleMcq,
    mcqOpening,
    openMcq,
    verifiedBy,
    verifyLabel,
    verifyDisabled,
    approve,
    headerHidden,
    setHeaderHidden,
    shareOpen,
    setShareOpen,
    feedbackOpen,
    setFeedbackOpen,
    topicSignal,
    setGarlicSession,
  };
}
