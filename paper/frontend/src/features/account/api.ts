import { apiRaw } from "@/lib/api";

/** GET /api/history?limit=100 item. */
export interface HistoryItem {
  topic_name?: string | null;
  viewed_at?: string | null;
  [key: string]: unknown;
}

/** GET /api/wishlist item. */
export interface WishlistItem {
  topic_id: string | number;
  topic_name?: string | null;
  course_code?: string | null;
  course_title?: string | null;
  unit_title?: string | null;
  created_at?: string | null;
  [key: string]: unknown;
}

/**
 * The student token as the original pages read it. Through the shared storage
 * shim this is `"__COOKIE_AUTH__"` while a session exists, otherwise null.
 */
export function studentToken(): string | null {
  try {
    return localStorage.getItem("px_token");
  } catch {
    return null;
  }
}

function authHeaders(): Record<string, string> {
  const t = studentToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

/** Result of a signed-in list load; `unauthorized` means go to the login page. */
export type ListResult<T> = { status: "ok"; items: T[] } | { status: "unauthorized" } | { status: "error" };

async function loadList<T>(path: string, key: string): Promise<ListResult<T>> {
  try {
    const res = await apiRaw(path, { headers: authHeaders() });
    if (res.status === 401) return { status: "unauthorized" };
    const data = (await res.json()) as Record<string, unknown>;
    return { status: "ok", items: ((data?.[key] as T[]) || []) as T[] };
  } catch (err) {
    console.error(`Failed to load ${key}`, err);
    return { status: "error" };
  }
}

export const loadHistory = () => loadList<HistoryItem>("/api/history?limit=100", "history");
export const loadWishlist = () => loadList<WishlistItem>("/api/wishlist", "wishlist");

export async function clearHistory(): Promise<void> {
  await apiRaw("/api/history/clear", { method: "DELETE", headers: authHeaders() });
}

export async function removeFromWishlist(topicId: string | number): Promise<void> {
  await apiRaw(`/api/wishlist/${topicId}`, { method: "DELETE", headers: authHeaders() });
}

/** Link that opens a topic in the notes generator (new tab, as before). */
export function notesHref(topicName: string | null | undefined): string {
  return `/notes_generator.html?topic=${encodeURIComponent(topicName || "")}`;
}
