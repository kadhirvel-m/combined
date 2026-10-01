"use client";

/**
 * Paper X analytics (port of ui/assets/js/analytics-tracker.js): session
 * start + 60s heartbeat, page views, scroll depth, custom events and topic
 * feedback, posted to `${API_BASE}/analytics/*`.
 */

import { useEffect } from "react";
import { apiBase } from "./api";

const SESSION_KEY = "paperx_session_id";

function normalizeToken(value: unknown): string {
  const raw = String(value || "").trim();
  const lower = raw.toLowerCase();
  if (!raw || raw === "__COOKIE_AUTH__" || raw === "__cookie__" || ["cookie", "null", "undefined", "none"].includes(lower)) return "";
  return raw;
}

function authToken(): string {
  for (const key of ["teacherToken", "px_token", "userToken", "sb-access-token", "supabase.auth.token"]) {
    try {
      const v = normalizeToken(localStorage.getItem(key));
      if (v) return v;
    } catch {}
  }
  try {
    return normalizeToken(sessionStorage.getItem("paperx_bearer_fallback"));
  } catch {
    return "";
  }
}

function jwtSubject(token: string): string | null {
  try {
    const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(part)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    const payload = JSON.parse(json) as Record<string, unknown>;
    return (payload.sub || payload.user_id || payload.id || null) as string | null;
  } catch {
    return null;
  }
}

export class PaperXAnalytics {
  private sessionId: string | null = null;
  private userId: string | null = null;
  private heartbeat: ReturnType<typeof setInterval> | null = null;
  private initialized = false;
  private scrollCleanup: (() => void) | null = null;

  private get base(): string {
    const b = apiBase();
    return b ? `${b}/analytics` : "/analytics";
  }

  private headers(): Record<string, string> {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    const token = authToken();
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }

  private post(path: string, body: unknown): Promise<Response> {
    return fetch(`${this.base}${path}`, { method: "POST", headers: this.headers(), credentials: "include", body: JSON.stringify(body) });
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
    try {
      this.sessionId = localStorage.getItem(SESSION_KEY);
    } catch {}
    const token = authToken();
    if (token) this.userId = jwtSubject(token);
    await this.startSession();
    this.startHeartbeat();
    void this.track("page_view", { path: location.pathname, title: document.title });
    this.trackScrollDepth();
  }

  private async startSession(): Promise<void> {
    try {
      const res = await this.post("/session/start", this.userId ? { user_id: this.userId } : {});
      const data = (await res.json()) as { session_id?: string };
      if (data.session_id) {
        this.sessionId = data.session_id;
        try {
          localStorage.setItem(SESSION_KEY, this.sessionId);
        } catch {}
      }
    } catch {
      this.sessionId = null;
      try {
        localStorage.removeItem(SESSION_KEY);
      } catch {}
    }
  }

  private startHeartbeat(): void {
    if (this.heartbeat) clearInterval(this.heartbeat);
    this.heartbeat = setInterval(() => {
      if (this.sessionId) this.post("/session/heartbeat", { session_id: this.sessionId }).catch(() => {});
    }, 60000);
  }

  /** Record an event (no-op until a session exists). */
  async track(eventType: string, eventData: Record<string, unknown> = {}): Promise<void> {
    if (!this.sessionId) return;
    const payload: Record<string, unknown> = { session_id: this.sessionId, event_type: eventType, event_data: eventData };
    if (this.userId) payload.user_id = this.userId;
    await this.post("/event", payload).catch(() => {});
  }

  /** Topic helpfulness feedback (signed-in users only). */
  async feedback(topicId: string, isHelpful: boolean, comment: string | null = null): Promise<void> {
    if (!this.userId) return;
    await this.post("/feedback/topic", { user_id: this.userId, topic_id: topicId, is_helpful: isHelpful, comment }).catch(() => {});
  }

  private trackScrollDepth(): void {
    let maxDepth = 0;
    const sent = new Set<number>();
    const onScroll = () => {
      if (!this.sessionId) return;
      const h = document.documentElement;
      const pct = Math.round(((h.scrollTop || document.body.scrollTop) / ((h.scrollHeight || document.body.scrollHeight) - h.clientHeight)) * 100);
      maxDepth = Math.max(maxDepth, pct);
      for (const d of [25, 50, 75, 90, 100]) {
        if (maxDepth >= d && !sent.has(d)) {
          sent.add(d);
          void this.track("scroll_depth", { depth: d, page: location.pathname });
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    this.scrollCleanup = () => window.removeEventListener("scroll", onScroll);
  }

  /** Stop timers/listeners (called when leaving a tracked page). */
  dispose(): void {
    if (this.heartbeat) clearInterval(this.heartbeat);
    this.scrollCleanup?.();
    this.heartbeat = null;
    this.initialized = false;
  }
}

let instance: PaperXAnalytics | null = null;

/** The page's analytics instance (created on first use). */
export function getAnalytics(): PaperXAnalytics {
  if (!instance) instance = new PaperXAnalytics();
  return instance;
}

/** Enable analytics on a page (what including analytics-tracker.js used to do). */
export function useAnalytics(): PaperXAnalytics | null {
  useEffect(() => {
    const a = getAnalytics();
    void a.init();
    return () => a.dispose();
  }, []);
  return typeof window === "undefined" ? null : getAnalytics();
}
