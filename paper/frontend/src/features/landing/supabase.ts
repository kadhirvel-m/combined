import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchSupabaseConfig } from "./api";

let client: SupabaseClient | null = null;

/**
 * Supabase client built from the backend's public config
 * (`GET /api/public/supabase`). The SDK is loaded on first use only.
 */
export async function getSupabaseClient(): Promise<SupabaseClient> {
  if (client) return client;
  const { createClient } = await import("@supabase/supabase-js");
  const config = await fetchSupabaseConfig();
  if (!config?.url || !config.anonKey) throw new Error("Missing Supabase config");
  client = createClient(config.url, config.anonKey);
  return client;
}
