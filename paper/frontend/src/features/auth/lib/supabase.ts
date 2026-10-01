/**
 * Supabase client for Google OAuth.
 *
 * The original pages pulled `@supabase/supabase-js@2` from a CDN and created
 * the client from `GET /api/public/supabase` the first time the Google button
 * was used. Here the same library is a bundled dependency, loaded on demand.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "../api";
import type { SupabasePublicConfig } from "../types";

let client: SupabaseClient | null = null;

export async function ensureSupabase(): Promise<SupabaseClient> {
  if (client) return client;
  try {
    const [{ createClient }, cfg] = await Promise.all([
      import("@supabase/supabase-js"),
      getSupabaseConfig().then((r) => r.json() as Promise<SupabasePublicConfig | null>),
    ]);
    if (!cfg?.url || !cfg?.anonKey) throw new Error("Missing Supabase config");
    client = createClient(cfg.url, cfg.anonKey);
    return client;
  } catch (e) {
    console.error("Supabase init failed", e);
    throw e;
  }
}

/**
 * Starts the Google redirect. `redirectTo` is the current page (with its query
 * string, so `?next=` survives the round trip); Supabase comes back to it with
 * the tokens in the URL hash.
 */
export async function signInWithGoogle(): Promise<void> {
  const sb = await ensureSupabase();
  const redirectTo = `${location.origin}${location.pathname}${location.search || ""}`;
  const { error } = await sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
  if (error) throw error;
}

/** Tokens Supabase puts in the URL hash after the Google redirect. */
export function readOAuthHash(): { accessToken: string | null; refreshToken: string | null } | null {
  if (!location.hash.includes("access_token")) return null;
  const hash = new URLSearchParams(location.hash.slice(1));
  return { accessToken: hash.get("access_token"), refreshToken: hash.get("refresh_token") };
}

/** Remove the token hash from the address bar (same URL, no navigation). */
export function stripOAuthHash(): void {
  history.replaceState(null, document.title, location.pathname + location.search);
}
