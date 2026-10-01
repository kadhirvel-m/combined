"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { notesApi } from "../api";
import { getAuthToken } from "../lib/authToken";
import { readLocal, STORAGE_KEYS, writeLocal } from "../lib/storage";
import type { AccessCheckResponse, AccessSummary } from "../types";
import type { NotesWorkspaceConfig } from "../config";

export interface LimitInfo {
  action: string;
  reason: string;
  remaining: number | null | undefined;
}

export interface AccessOptions {
  consume?: boolean;
  increment?: number;
  allowOnTransientFailure?: boolean;
  /** Show the "daily limit reached" panel in the output when denied. */
  renderInOutput?: boolean;
}

export interface NotesAccess {
  /** `POST /api/access/check-and-consume`; true when the action may proceed. */
  ensure: (action: string, options?: AccessOptions) => Promise<boolean>;
  /** Plan feature flag (`mcq_access`, `flashcard_access`); unpaid tiers are always allowed. */
  isFeatureAllowed: (key: string, fallback?: boolean) => boolean;
  loadSummary: () => Promise<void>;
  /** The topic was already opened today (the daily topic quota is only consumed once per topic). */
  hasConsumedTopicOpen: (topic: string) => boolean;
  markTopicOpenConsumed: (topic: string) => void;
  /** Value of the "Topics left today" toast (null when hidden). */
  topicsLeft: number | null;
  /** Bumped every time a summary loads, so plan-gated UI can re-check. */
  summaryVersion: number;
}

const normalizeKey = (value: string) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

/** An explicit plan/quota denial (vs. an inconclusive "access check unavailable"). */
function isDefinitiveDeny(data: AccessCheckResponse | null): boolean {
  const d = data && typeof data === "object" ? data : {};
  if (d.allowed) return false;
  const reason = String(d.reason || d.detail || "")
    .trim()
    .toLowerCase();
  if (!reason || reason.includes("unavailable") || reason.includes("temporar")) return false;
  if (reason.includes("daily limit") || reason.includes("limit reached") || reason.includes("quota")) return true;
  return d.limit !== null && d.limit !== undefined;
}

/**
 * Plan limits of the notes pages. With `config.access` off every check passes
 * (the maths and img_gen pages never had them).
 */
export function useAccess(
  config: NotesWorkspaceConfig,
  { snack, onLimit }: { snack: (message: string) => void; onLimit: (info: LimitInfo) => void },
): NotesAccess {
  const enabled = config.access;
  const [summary, setSummary] = useState<AccessSummary | null>(null);
  const [summaryVersion, setSummaryVersion] = useState(0);
  const consumed = useRef<Set<string> | null>(null);
  const [topicsLeft, setTopicsLeft] = useState<number | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const consumedSet = useCallback(() => {
    if (!consumed.current) {
      const raw = readLocal(STORAGE_KEYS.consumedTopicOpen(new Date().toISOString().slice(0, 10)));
      let set = new Set<string>();
      try {
        const parsed: unknown = raw ? JSON.parse(raw) : [];
        if (Array.isArray(parsed)) set = new Set(parsed.map((item) => String(item || "").trim()).filter(Boolean));
      } catch {
        /* corrupt entry: start empty */
      }
      consumed.current = set;
    }
    return consumed.current;
  }, []);

  const hasConsumedTopicOpen = useCallback((topic: string) => {
    const key = normalizeKey(topic);
    return !!key && consumedSet().has(key);
  }, [consumedSet]);

  const markTopicOpenConsumed = useCallback((topic: string) => {
    const key = normalizeKey(topic);
    if (!key) return;
    const set = consumedSet();
    set.add(key);
    writeLocal(STORAGE_KEYS.consumedTopicOpen(new Date().toISOString().slice(0, 10)), JSON.stringify(Array.from(set)));
  }, [consumedSet]);

  const showTopicsLeft = useCallback((remaining: unknown) => {
    const value = Number(remaining);
    if (!Number.isFinite(value)) return;
    setTopicsLeft(Math.max(0, Math.floor(value)));
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setTopicsLeft(null), 3200);
  }, []);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const ensure = useCallback(
    async (action: string, { consume = true, increment = 1, allowOnTransientFailure = true, renderInOutput = false }: AccessOptions = {}) => {
      if (!enabled) return true;
      const token = getAuthToken(config.authToken);
      if (!token) return true;
      try {
        const res = await notesApi.accessCheck(action, !!consume, Math.max(1, Number(increment) || 1), token);
        const data = res.data || {};
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            snack(data.detail ? data.detail : "Sign in required");
            return false;
          }
          console.warn("Access check failed", res.status, data);
          return !!allowOnTransientFailure;
        }
        if (!data.allowed) {
          if (!isDefinitiveDeny(data)) {
            console.warn("Access check non-definitive deny; allowing fallback", data);
            return true;
          }
          const reason = data.reason || "Plan limit reached";
          const remaining = data.remaining === null || data.remaining === undefined ? "" : ` (Remaining today: ${data.remaining})`;
          snack(`${reason}${remaining}`);
          if (renderInOutput) onLimit({ action, reason, remaining: data.remaining });
          return false;
        }
        if (action === "topic_open" && consume) showTopicsLeft(data.remaining);
        return true;
      } catch (err) {
        console.warn("Access check failed", err);
        return !!allowOnTransientFailure;
      }
    },
    [enabled, config.authToken, snack, onLimit, showTopicsLeft],
  );

  const loadSummary = useCallback(async () => {
    if (!enabled) return;
    const token = getAuthToken(config.authToken);
    if (!token) {
      setSummary(null);
    } else {
      try {
        const res = await notesApi.accessSummary(token);
        setSummary(res.ok ? res.data : null);
      } catch (err) {
        console.warn("Access summary load failed", err);
        setSummary(null);
      }
    }
    setSummaryVersion((v) => v + 1);
  }, [enabled, config.authToken]);

  const isFeatureAllowed = useCallback(
    (key: string, fallback = true) => {
      if (!enabled) return true;
      const current = summary;
      if (String(current?.tier || "").toLowerCase() !== "paid") return true;
      const plan = current?.plan || {};
      if (!Object.prototype.hasOwnProperty.call(plan, key)) return !!fallback;
      return !!plan[key];
    },
    [enabled, summary],
  );

  return { ensure, isFeatureAllowed, loadSummary, hasConsumedTopicOpen, markTopicOpenConsumed, topicsLeft, summaryVersion };
}
