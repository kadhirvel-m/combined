"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { hardNavigate } from "@/lib/routes";
import {
  fetchLabxStatus,
  fetchTeacherNotes,
  fetchTopicRatings,
  fetchWishlistIds,
  getMe,
  getProgress,
  isSuccess,
  isUnauthorized,
  type FetchOut,
} from "../api";
import {
  computeAggregateStats,
  fetchUnitBlinkAvailability,
  hasSyllabusContext,
  hydrateSyllabusCourses,
  recoverSyllabusFromProfile,
} from "../lib/syllabus";
import { courseKeyOf, normalizeTopicKey, wait } from "../lib/topics";
import type { AcademicProfile, AggregateStats, MeResponse, SyllabusBundle } from "../types";

export interface AcademicsDataOptions {
  setStatus: (message: string) => void;
  /** Loader done (`ok`) or given up. */
  onSettled: (ok: boolean) => void;
  /** Each time a profile arrives (education/phone prompts, dev-mode role check). */
  onProfile: (profile: AcademicProfile) => void;
  /** After the syllabus rendered (streak load). */
  onLoaded: () => void;
}

const ensureAuthReady = async (): Promise<boolean> => {
  if (typeof window.__PX_ENSURE_AUTH_READY !== "function") return false;
  try {
    return !!(await window.__PX_ENSURE_AUTH_READY());
  } catch {
    return false;
  }
};

type Attempt = { ok: true } | { ok: false } | { unauthorized: true };

/**
 * loadProfileAndProgress() of the original: /api/me + /api/progress/topics
 * (3 attempts, one refresh on 401, login redirect when still unauthorized),
 * syllabus hydration/recovery, then teacher notes, Blink availability, LabX,
 * staff ratings and the wishlist in parallel.
 */
export function useAcademicsData({ setStatus, onSettled, onProfile, onLoaded }: AcademicsDataOptions) {
  const [profile, setProfile] = useState<AcademicProfile | null>(null);
  const [bundle, setBundle] = useState<SyllabusBundle | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(() => new Set());
  const [wishlisted, setWishlisted] = useState<Set<string>>(() => new Set());
  const [stats, setStats] = useState<AggregateStats | null>(null);
  const [progressError, setProgressError] = useState("");
  const [empty, setEmpty] = useState(false);
  const callbacks = useRef({ setStatus, onSettled, onProfile, onLoaded });
  /** Bumped on unmount and on every new load; stale runs stop updating state. */
  const generation = useRef(0);

  useEffect(() => {
    callbacks.current = { setStatus, onSettled, onProfile, onLoaded };
  });

  const attempt = useCallback(async (allowRefresh: boolean, live: () => boolean): Promise<Attempt> => {
    const cb = callbacks.current;
    try {
      cb.setStatus("Loading profile and progress...");
      let [meOut, progOut]: [FetchOut<MeResponse>, FetchOut<{ completed_topic_ids?: string[] }>] = await Promise.all([getMe(), getProgress()]);
      if ((isUnauthorized(meOut) || isUnauthorized(progOut)) && allowRefresh) {
        if (await ensureAuthReady()) [meOut, progOut] = await Promise.all([getMe(), getProgress()]);
      }
      if (isUnauthorized(meOut) || isUnauthorized(progOut)) return { unauthorized: true };
      if (!isSuccess(meOut) || !meOut.data?.profile) return { ok: false };
      // Progress is optional for first paint.
      let completedIds: string[] = [];
      if (isSuccess(progOut)) {
        completedIds = Array.isArray(progOut.data?.completed_topic_ids) ? progOut.data.completed_topic_ids : [];
      } else {
        console.warn("[Academics] Progress endpoint unavailable; continuing with empty completion set");
      }
      if (!live()) return { ok: false };

      const me = meOut.data;
      const prof = me.profile!;
      const expectsSyllabus = hasSyllabusContext(prof);
      setProfile(prof);
      cb.onProfile(prof);
      const completedSet = new Set(completedIds);
      setCompleted(completedSet);

      let syllabus = await hydrateSyllabusCourses(Array.isArray(me.syllabus) ? me.syllabus : []);
      if (!syllabus.length) {
        const recovered = await recoverSyllabusFromProfile(prof);
        if (recovered.length) syllabus = recovered;
      }
      if (!syllabus.length && expectsSyllabus) {
        console.warn("[Academics] Empty syllabus despite batch/semester context; retrying load");
        return { ok: false };
      }
      if (!live()) return { ok: false };
      setEmpty(!syllabus.length);
      cb.setStatus("Loading syllabus...");

      const subjectIds = new Set<string>();
      for (const course of syllabus) {
        const key = courseKeyOf(course);
        if (key) subjectIds.add(key);
      }
      const teacherNotesPromise = fetchTeacherNotes(Array.from(subjectIds));

      const topicNames: string[] = [];
      const topicIds: string[] = [];
      for (const c of syllabus)
        for (const u of c.units || [])
          for (const t of u.topics || []) {
            if (t.topic) topicNames.push(normalizeTopicKey(t.topic));
            if (t.id) topicIds.push(t.id);
          }
      cb.setStatus("Loading Blink availability and LabX...");

      const [teacherNotes, unitBlink, labx, ratings, wishlist] = await Promise.all([
        teacherNotesPromise,
        fetchUnitBlinkAvailability(syllabus),
        fetchLabxStatus(Array.from(new Set(topicNames))),
        fetchTopicRatings(topicIds),
        fetchWishlistIds(),
      ]);
      if (!live()) return { ok: false };
      if (wishlist) setWishlisted(wishlist);
      setBundle({ courses: syllabus, teacherNotes, unitBlink, ratings, labx });
      setStats(computeAggregateStats(syllabus, completedSet));
      cb.setStatus("Finalizing dashboard...");
      cb.onLoaded();
      return { ok: true };
    } catch (err) {
      console.warn("[Academics] attempt load failed", err);
      return { ok: false };
    }
  }, []);

  const load = useCallback(async () => {
    const run = ++generation.current;
    const live = () => generation.current === run;
    const cb = callbacks.current;
    cb.setStatus("Verifying session...");
    await ensureAuthReady();
    setProgressError("");
    for (let i = 0; i < 3; i++) {
      callbacks.current.setStatus("Loading profile and progress...");
      const result = await attempt(i === 0, live);
      if (!live()) return;
      if ("unauthorized" in result) {
        hardNavigate("/login.html");
        return;
      }
      if (result.ok) {
        setProgressError("");
        callbacks.current.setStatus("Ready");
        callbacks.current.onSettled(true);
        return;
      }
      setProgressError("Still syncing your progress, retrying...");
      callbacks.current.setStatus("Retrying data sync...");
      await wait(Math.min(1200, 400 * (i + 1)));
      if (!live()) return;
    }
    setProgressError("We could not load your progress right now. Please refresh or try again in a moment.");
    callbacks.current.setStatus("Unable to finish loading");
    callbacks.current.onSettled(false);
  }, [attempt]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load (loader status updates)
    void load();
    const gen = generation;
    return () => {
      gen.current++;
    };
  }, [load]);

  return { profile, bundle, completed, setCompleted, wishlisted, setWishlisted, stats, progressError, empty, reload: load };
}
