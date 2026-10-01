"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TurnstileHandle } from "@/components/content/Turnstile";

/** Status texts a page shows for Turnstile problems. */
export interface TurnstileMessages {
  expired: string;
  /** Error codes 110xxx (hostname not allowed for the site key). */
  domain: string;
  failed: string;
  /** Config endpoint or script failed. */
  init: string;
}

/** login.html / signup.html wording. */
export const TURNSTILE_MESSAGES: TurnstileMessages = {
  expired: "⚠️ Verification expired. Please complete Turnstile again.",
  domain:
    "❌ Turnstile domain config issue (110200). Use localhost test keys or add this hostname in Cloudflare Turnstile Hostname Management.",
  failed: "❌ Verification failed to load. Refresh and try again.",
  init: "❌ Unable to initialize verification. Please refresh the page.",
};

/** teacher_login.html wording (no emoji, no special domain message). */
export const TEACHER_TURNSTILE_MESSAGES: TurnstileMessages = {
  expired: "Verification expired. Please complete Turnstile again.",
  domain: "Verification failed to load. Refresh and try again.",
  failed: "Verification failed to load. Refresh and try again.",
  init: "Unable to initialize verification. Please refresh the page.",
};

/** Maps the shared widget's message onto the page's own wording. */
function classify(message: string, texts: TurnstileMessages): string {
  if (message.startsWith("⚠️ Verification expired")) return texts.expired;
  if (message.startsWith("❌ Turnstile domain config issue")) return texts.domain;
  if (message === "❌ Verification failed to load. Refresh and try again.") return texts.failed;
  return texts.init;
}

/** Placeholder token sent on localhost, where the backend skips Turnstile. */
const LOCAL_DEV_TOKEN = "localhost-dev";

function currentTheme(): "light" | "dark" {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

/**
 * State around the shared `<Turnstile>` widget: the token that gates the
 * submit button, a `reset()` for failed attempts, and page-specific messages.
 * The widget theme is the one active when the page loaded (as in the
 * originals, toggling the theme does not re-render the widget).
 */
export function useTurnstileGate(texts: TurnstileMessages, onMessage: (message: string) => void) {
  const ref = useRef<TurnstileHandle>(null);
  const [token, setToken] = useState("");
  const [theme] = useState(currentTheme);
  const textsRef = useRef(texts);
  const onMessageRef = useRef(onMessage);
  useEffect(() => {
    onMessageRef.current = onMessage;
    textsRef.current = texts;
  });

  // On localhost the backend skips Turnstile, so sign-in never waits for (or
  // is blocked by) the Cloudflare widget.
  const local = useRef(false);
  useEffect(() => {
    if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname)) {
      local.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-only hostname check
      setToken(LOCAL_DEV_TOKEN);
    }
  }, []);

  const onToken = useCallback((value: string) => {
    if (!local.current) setToken(value || "");
  }, []);
  const onError = useCallback((message: string) => {
    if (!local.current) onMessageRef.current(classify(message, textsRef.current));
  }, []);
  const reset = useCallback(() => {
    if (local.current) return;
    if (ref.current) ref.current.reset();
    else setToken("");
  }, []);

  return { ref, token, theme, onToken, onError, reset };
}
