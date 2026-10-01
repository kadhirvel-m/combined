"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";

interface TurnstileApi {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let scriptPromise: Promise<TurnstileApi> | null = null;

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = SCRIPT_SRC;
      s.async = true;
      s.onerror = () => reject(new Error("Turnstile script failed to load"));
      document.head.appendChild(s);
      const started = Date.now();
      const poll = () => {
        if (window.turnstile) resolve(window.turnstile);
        else if (Date.now() - started > 8000) reject(new Error("Turnstile script did not load in time"));
        else setTimeout(poll, 50);
      };
      poll();
    });
  }
  return scriptPromise;
}

export interface TurnstileHandle {
  reset: () => void;
}

export interface TurnstileProps {
  /** Turnstile action name sent to Cloudflare (`login`, `signup`, …). */
  action: string;
  /** Receives the token, or "" when it expires / errors / resets. */
  onToken: (token: string) => void;
  /** Human-readable problem (config missing, expired, domain misconfigured…). */
  onError?: (message: string) => void;
  theme?: "light" | "dark";
  className?: string;
}

/**
 * Cloudflare Turnstile widget. The site key comes from the backend
 * (`GET /api/public/turnstile`), exactly like the original login/signup pages.
 */
export const Turnstile = forwardRef<TurnstileHandle, TurnstileProps>(function Turnstile(
  { action, onToken, onError, theme = "light", className },
  ref,
) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [, setReady] = useState(false);
  const callbacks = useRef({ onToken, onError });
  useEffect(() => {
    callbacks.current = { onToken, onError };
  }, [onToken, onError]);

  const reset = useCallback(() => {
    callbacks.current.onToken("");
    if (window.turnstile && widgetId.current) {
      try {
        window.turnstile.reset(widgetId.current);
      } catch {}
    }
  }, []);
  useImperativeHandle(ref, () => ({ reset }), [reset]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cfg = await apiFetch<{ siteKey?: string; detail?: string }>("/api/public/turnstile");
        if (!cfg?.siteKey) throw new Error(cfg?.detail || "Turnstile config unavailable");
        const ts = await loadTurnstile();
        if (cancelled || !container.current) return;
        widgetId.current = ts.render(container.current, {
          sitekey: cfg.siteKey,
          action,
          theme,
          callback: (token: string) => callbacks.current.onToken(token || ""),
          "expired-callback": () => {
            callbacks.current.onToken("");
            callbacks.current.onError?.("⚠️ Verification expired. Please complete Turnstile again.");
          },
          "error-callback": (code: string | number) => {
            callbacks.current.onToken("");
            const n = Number(code || 0);
            callbacks.current.onError?.(
              n === 110200 || Math.floor(n / 1000) === 110
                ? "❌ Turnstile domain config issue (110200). Use localhost test keys or add this hostname in Cloudflare Turnstile Hostname Management."
                : "❌ Verification failed to load. Refresh and try again.",
            );
          },
        });
        setReady(true);
      } catch (err) {
        callbacks.current.onError?.(`❌ ${err instanceof Error ? err.message : "Verification unavailable"}`);
      }
    })();
    return () => {
      cancelled = true;
      if (window.turnstile && widgetId.current) {
        try {
          window.turnstile.remove(widgetId.current);
        } catch {}
      }
    };
  }, [action, theme]);

  return <div ref={container} className={className ?? "min-h-[65px] flex justify-center"} />;
});
