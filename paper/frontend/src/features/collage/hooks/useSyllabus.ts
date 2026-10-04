"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { fetchBlinkLinks, fetchLabxStatus, fetchSyllabusCourse } from "../api";
import { isAccessError, requireAdminOrEmployee } from "../lib/access";
import type { CollageContext } from "../lib/context";
import { normalizeTopicKey } from "../lib/topics";
import type { BlinkMap, LabxMap, SyllabusCourse, SyllabusUnit } from "../types";

export const ACCESS_DENIED_MESSAGE = "You need an admin or employee account to access the college console.";

/** What the results area shows. */
export type SyllabusResults =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "denied"; message: string }
  | { kind: "empty" }
  | { kind: "units"; units: SyllabusUnit[] };

function errorMessage(err: unknown, fallback: string): string {
  const message = (err as { message?: unknown } | null)?.message;
  return typeof message === "string" && message ? message : fallback;
}

/** Scrolls back to `y` (clamped) once the new content is laid out (double rAF, as before). */
function restoreScrollY(y: number) {
  const max = Math.max(0, (document.documentElement.scrollHeight || 0) - (window.innerHeight || 0));
  const top = Math.min(Math.max(0, y), max);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      try {
        window.scrollTo({ top, left: 0, behavior: "auto" });
      } catch {
        window.scrollTo(0, top);
      }
    });
  });
}

/**
 * Data flow of the syllabus page: the admin/employee gate, then
 * `GET /api/syllabus/courses/{courseId}`, then the blink and LabX status of
 * every topic. `reload()` re-runs the course load (after a unit is saved or
 * deleted), keeping the results area's height while it loads so the page
 * doesn't jump, and restoring the scroll position afterwards.
 */
export function useSyllabus(ctx: CollageContext | null, courseId: string, resultsRef: RefObject<HTMLDivElement | null>) {
  const [results, setResults] = useState<SyllabusResults>({ kind: "idle" });
  const [minHeight, setMinHeight] = useState(0);
  /** The last course that loaded; it stays after a failed reload, as on the original page. */
  const [course, setCourse] = useState<SyllabusCourse | null>(null);
  const courseRef = useRef<SyllabusCourse | null>(null);
  const [blinkLinks, setBlinkLinks] = useState<BlinkMap>({});
  const [labx, setLabx] = useState<LabxMap>({});
  const loadSeq = useRef(0);

  const renderUnits = useCallback(async (units: SyllabusUnit[], seq: number) => {
    if (!units.length) {
      setMinHeight(0);
      setResults({ kind: "empty" });
      return;
    }
    const [blink, labxStatus] = await Promise.all([fetchBlinkLinks(units), fetchLabxStatus(units)]);
    if (seq !== loadSeq.current) return;
    setBlinkLinks(blink);
    setLabx(labxStatus);
    setMinHeight(0);
    setResults({ kind: "units", units });
  }, []);

  const reload = useCallback(async () => {
    const seq = ++loadSeq.current;
    const scrollBefore = window.scrollY || document.documentElement.scrollTop || 0;
    if (!courseId) {
      setMinHeight(0);
      setResults({ kind: "error", message: "Missing courseId." });
      return;
    }
    // Keep the current height while the spinner shows, so the page doesn't scroll up.
    setMinHeight(resultsRef.current?.getBoundingClientRect().height ?? 0);
    setResults({ kind: "loading" });
    try {
      const data = await fetchSyllabusCourse(courseId);
      if (seq !== loadSeq.current) return;
      if (!data || data.detail === "Course not found") {
        setMinHeight(0);
        setResults({ kind: "error", message: "Syllabus course not found." });
        return;
      }
      const loaded: SyllabusCourse = {
        id: data.id,
        course_code: data.course_code,
        title: data.title,
        semester: data.semester,
        units: Array.isArray(data.units) ? data.units : [],
      };
      courseRef.current = loaded;
      setCourse(loaded);
    } catch (err) {
      if (seq !== loadSeq.current) return;
      console.error(err);
      setMinHeight(0);
      // Replaced right away by the previous units (or "No units yet"), as on the original page.
      setResults({ kind: "error", message: errorMessage(err, "Unexpected error") });
    }
    await renderUnits(courseRef.current?.units || [], seq);
    if (seq === loadSeq.current) restoreScrollY(scrollBefore);
  }, [courseId, renderUnits, resultsRef]);

  // Initial load, once the collage context has been read from the URL/storage.
  const started = useRef(false);
  useEffect(() => {
    if (!ctx || started.current) return;
    started.current = true;
    (async () => {
      try {
        await requireAdminOrEmployee();
        void reload();
      } catch (err) {
        console.error(err);
        if (isAccessError(err)) setResults({ kind: "denied", message: ACCESS_DENIED_MESSAGE });
        else setResults({ kind: "error", message: errorMessage(err, "Unexpected error") });
      }
    })();
  }, [ctx, reload]);

  /**
   * Records a topic's blink image; `null` removes it. A topic present in the
   * map shows "View Blink" (even with an empty URL, as after a generation that
   * returned no URL on the original page).
   */
  const setTopicBlink = useCallback((topicName: string, url: string | null) => {
    const key = normalizeTopicKey(topicName);
    setBlinkLinks((prev) => {
      const next = { ...prev };
      if (url === null) delete next[key];
      else next[key] = url;
      return next;
    });
  }, []);

  /**
   * Marks a topic's LabX explanation as generated. The original cached it
   * under the lower-cased name and flipped the clicked button directly; the
   * normalized key makes the row (which looks up normalized names) flip too.
   */
  const markTopicLabx = useCallback((topicName: string) => {
    setLabx((prev) => ({ ...prev, [topicName.toLowerCase()]: true, [normalizeTopicKey(topicName)]: true }));
  }, []);

  return { results, minHeight, course, blinkLinks, labx, reload, setTopicBlink, markTopicLabx };
}
