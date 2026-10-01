"use client";

import { useCallback, useRef, useState } from "react";
import { fetchJsonWithTimeout, notesApi, sleep, youtubeOembed } from "../api";
import { readLocal, removeLocal, STORAGE_KEYS, writeLocal } from "../lib/storage";
import type { NotesWorkspaceConfig } from "../config";
import type { RelatedVideo, SyllabusTopic } from "../types";

export const VIDEO_LANGUAGES = ["English", "Tamil", "Hindi", "Telugu", "Malayalam"];
const DEFAULT_SUMMARY = "Enter a topic to discover supporting videos.";
const DEFAULT_EMPTY = "Videos will appear once a topic is generated.";

export interface RelatedVideosState {
  videos: RelatedVideo[];
  showSkeleton: boolean;
  showList: boolean;
  showEmpty: boolean;
  summary: string;
  emptyText: string;
  language: string;
}

export interface RelatedVideosApi extends RelatedVideosState {
  enabled: boolean;
  /** Topic the current videos were loaded for. */
  topicRef: { current: string };
  load: (topic: string, options?: { force?: boolean; language?: string }) => Promise<void>;
  changeLanguage: (language: string, currentTopic: string) => void;
  /** `cached` mode: restores the last videos; returns the stored topic for the input. */
  restore: () => string;
}

const normalizeLanguage = (language: string | undefined) => (language || "").trim();

export function buildVideosQuery(baseTopic: string, language: string): string {
  const topic = (baseTopic || "").trim();
  if (!topic) return "";
  const lang = normalizeLanguage(language);
  if (!lang || lang.toLowerCase() === "english") return topic;
  const suffix = ` in ${lang}`;
  return topic.toLowerCase().endsWith(suffix.toLowerCase()) ? topic : `${topic}${suffix}`;
}

function youtubeId(url: string): string {
  const m = url.match(/[?&]v=([^&#]+)/) || url.match(/youtu\.be\/([^?#]+)/);
  return m && m[1] ? m[1] : "";
}

/** The syllabus-linked video for a topic, shown first with a "Recommended" badge. */
async function findRecommended(topic: string, mode: "fresh" | "cached", headers?: Record<string, string>): Promise<RelatedVideo | null> {
  try {
    const lookup =
      mode === "fresh"
        ? await fetchJsonWithTimeout<SyllabusTopic[]>(notesApi.topicsByTitlePath(topic), { timeoutMs: 6000, headers })
        : await notesApi.topicsByTitle(topic);
    const rows = lookup.ok || mode === "fresh" ? lookup.data : null;
    if (!Array.isArray(rows) || !rows.length) return null;
    const first = rows.find((t) => typeof t.video_url === "string" && t.video_url.trim());
    if (!first || !first.video_url) return null;
    const url = first.video_url.trim();
    const recommended: RelatedVideo = {
      id: youtubeId(url),
      link: url,
      title: String(first.topic || topic || ""),
      channel: "Syllabus recommended",
      channel_page: "",
      thumbnail: "",
      views: "",
      channel_logo: "",
      channel_logo_is_default: true,
      duration: "",
      recommended: true,
    };
    try {
      const meta = await notesApi.transcriptMeta(url, mode === "fresh" ? 7000 : undefined);
      if (meta.ok && meta.data && typeof meta.data === "object") {
        if (meta.data.channel_name) recommended.channel = meta.data.channel_name;
        if (meta.data.channel_logo) {
          recommended.channel_logo = meta.data.channel_logo;
          recommended.channel_logo_is_default = false;
        }
        if (meta.data.channel_url) recommended.channel_page = meta.data.channel_url;
      }
    } catch (err) {
      console.warn("Recommended video metadata lookup failed:", err);
    }
    if (!recommended.channel_page || recommended.channel === "Syllabus recommended") {
      const oembed = await youtubeOembed(url, mode === "fresh" ? 4000 : 15000);
      if (oembed?.author_name) recommended.channel = oembed.author_name;
      if (oembed?.author_url) recommended.channel_page = oembed.author_url;
    }
    return recommended;
  } catch (err) {
    console.warn("Recommended topic video lookup failed:", err);
    return null;
  }
}

/**
 * "Related Video" carousel: YouTube search for the topic (optionally in a
 * language), plus the syllabus-recommended video. `cached` mode keeps the last
 * result in localStorage and restores it on the next visit.
 */
export function useRelatedVideos(config: NotesWorkspaceConfig, getLookupHeaders: () => Record<string, string> | undefined): RelatedVideosApi {
  const mode = config.videos;
  const enabled = mode !== "disabled";
  const cached = mode === "cached";
  const [state, setState] = useState<RelatedVideosState>({
    videos: [],
    showSkeleton: true,
    showList: false,
    showEmpty: false,
    summary: DEFAULT_SUMMARY,
    emptyText: DEFAULT_EMPTY,
    language: "English",
  });
  const topicRef = useRef("");
  const fullQueryRef = useRef("");
  const languageRef = useRef("English");
  const videosRef = useRef<RelatedVideo[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const patch = useCallback((next: Partial<RelatedVideosState>) => {
    if (next.videos) videosRef.current = next.videos;
    setState((s) => ({ ...s, ...next }));
  }, []);

  const show = useCallback(
    (videos: RelatedVideo[], displayTopic: string, baseTopic: string, language: string) => {
      patch({ videos, showSkeleton: false, showEmpty: false, showList: true, summary: `Showing for "${displayTopic}"` });
      if (cached) {
        writeLocal(STORAGE_KEYS.lastVideos, JSON.stringify(videos));
        writeLocal(STORAGE_KEYS.lastTopic, baseTopic || null);
        writeLocal(STORAGE_KEYS.lastVideoLanguage, language || null);
      }
    },
    [patch, cached],
  );

  const load = useCallback(
    async (topic: string, options: { force?: boolean; language?: string } = {}) => {
      if (!enabled) return;
      const baseQuery = (topic || "").trim();
      const requestedLanguage = normalizeLanguage(options.language ?? languageRef.current);
      const searchQuery = buildVideosQuery(baseQuery, requestedLanguage);
      const previousQuery = (fullQueryRef.current || "").trim();

      if (!baseQuery) {
        topicRef.current = "";
        fullQueryRef.current = "";
        abortRef.current?.abort();
        abortRef.current = null;
        if (cached) removeLocal(STORAGE_KEYS.lastTopic, STORAGE_KEYS.lastVideos, STORAGE_KEYS.lastVideoLanguage);
        patch({ videos: [], showSkeleton: false, showEmpty: true, emptyText: DEFAULT_EMPTY, summary: DEFAULT_SUMMARY });
        return;
      }
      if (!options.force && fullQueryRef.current && fullQueryRef.current.toLowerCase() === searchQuery.toLowerCase()) return;

      topicRef.current = baseQuery;
      languageRef.current = requestedLanguage || "English";
      fullQueryRef.current = searchQuery;
      if (cached) {
        writeLocal(STORAGE_KEYS.lastTopic, baseQuery);
        if (languageRef.current) writeLocal(STORAGE_KEYS.lastVideoLanguage, languageRef.current);
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const sameQuery = !!previousQuery && previousQuery.toLowerCase() === searchQuery.toLowerCase();
      const keep = cached ? videosRef.current : sameQuery ? videosRef.current : [];
      const hasExisting = keep.length > 0;
      patch({
        videos: keep,
        summary: `Finding videos for "${searchQuery}"...`,
        showSkeleton: !hasExisting,
        showList: hasExisting,
        showEmpty: false,
      });

      const headers = getLookupHeaders();
      const fallbackToSaved = () => {
        if (cached && videosRef.current.length > 0) {
          patch({ showSkeleton: false, showList: true, showEmpty: false, summary: `Showing saved videos for "${searchQuery}".` });
          return true;
        }
        return false;
      };

      try {
        // The originals ran the recommendation lookup in parallel (fresh) or before the search (cached).
        const recommendedPromise = findRecommended(baseQuery, cached ? "cached" : "fresh", headers);
        if (cached) await recommendedPromise;
        const res = await notesApi.youtubeSearch(searchQuery, controller.signal, cached ? undefined : headers);
        if (!res.ok) throw new Error(`Search failed with status ${res.status}`);
        const videos = res.data;
        const recommended = cached ? await recommendedPromise : await Promise.race([recommendedPromise, sleep(1500).then(() => null)]);
        if (controller.signal.aborted) return;
        if (!Array.isArray(videos) || videos.length === 0) {
          if (!cached && recommended) {
            show([recommended], searchQuery, baseQuery, languageRef.current);
            return;
          }
          if (fallbackToSaved()) return;
          patch({
            videos: [],
            showSkeleton: false,
            showList: false,
            showEmpty: true,
            emptyText: "No related videos found. Try a more specific topic.",
            summary: `No videos found for "${searchQuery}".`,
          });
          return;
        }
        const limited = videos.slice(0, 8);
        show(recommended ? [recommended, ...limited] : limited, searchQuery, baseQuery, languageRef.current);
      } catch (error) {
        if ((error as Error)?.name === "AbortError" || controller.signal.aborted) return;
        console.error("Related videos error:", error);
        if (fallbackToSaved()) return;
        patch({
          videos: [],
          showSkeleton: false,
          showList: false,
          showEmpty: true,
          emptyText: "Unable to load videos right now.",
          summary: `Unable to load videos for "${searchQuery}".`,
        });
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
      }
    },
    [enabled, cached, patch, show, getLookupHeaders],
  );

  const changeLanguage = useCallback(
    (language: string, currentTopic: string) => {
      const selected = normalizeLanguage(language) || "English";
      setState((s) => ({ ...s, language: selected }));
      if (selected.toLowerCase() === (languageRef.current || "").toLowerCase()) return;
      languageRef.current = selected;
      if (cached) writeLocal(STORAGE_KEYS.lastVideoLanguage, selected);
      const current = (currentTopic || topicRef.current || "").trim();
      if (current) void load(current, { force: true, language: selected });
    },
    [cached, load],
  );

  const restore = useCallback(() => {
    if (!cached) {
      // The fresh/disabled pages clear what older pages cached.
      removeLocal(STORAGE_KEYS.lastVideos, STORAGE_KEYS.lastTopic, STORAGE_KEYS.lastVideoLanguage);
      return "";
    }
    const storedTopic = readLocal(STORAGE_KEYS.lastTopic) || "";
    let storedVideos: RelatedVideo[] | null = null;
    try {
      const parsed: unknown = JSON.parse(readLocal(STORAGE_KEYS.lastVideos) || "null");
      storedVideos = Array.isArray(parsed) ? (parsed as RelatedVideo[]) : null;
    } catch {
      storedVideos = null;
    }
    const storedLanguage = readLocal(STORAGE_KEYS.lastVideoLanguage) || "";
    if (storedLanguage && VIDEO_LANGUAGES.includes(storedLanguage)) {
      languageRef.current = storedLanguage;
      setState((s) => ({ ...s, language: storedLanguage }));
    } else if (storedLanguage) {
      languageRef.current = storedLanguage;
    }
    if (storedTopic && storedVideos && storedVideos.length) {
      const language = storedLanguage || languageRef.current;
      const displayTopic = buildVideosQuery(storedTopic, language);
      show(storedVideos, displayTopic, storedTopic, language);
      languageRef.current = normalizeLanguage(language) || "English";
      topicRef.current = storedTopic;
      fullQueryRef.current = displayTopic;
      return storedTopic;
    }
    if (storedTopic) void load(storedTopic, { force: true, language: languageRef.current });
    return storedTopic;
  }, [cached, show, load]);

  return { ...state, enabled, topicRef, load, changeLanguage, restore };
}
