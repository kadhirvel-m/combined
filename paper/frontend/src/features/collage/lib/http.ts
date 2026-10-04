/**
 * `Collage.fetchJson()` of helpers.js on top of the shared API client.
 *
 * The collage pages show backend error text verbatim, so the error message
 * rules are kept exactly: `detail || message || JSON.stringify(body)`, turned
 * into a string the way `new Error(value)` does (a FastAPI validation error's
 * `detail` array becomes "[object Object]"), falling back to the status text
 * and then "Request failed (<status>)".
 */

import { apiRaw } from "@/lib/api";

/** Error thrown by the collage helpers; `status` is the HTTP status when there was a response. */
export class CollageHttpError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "CollageHttpError";
    this.status = status;
  }
}

/** `String(value)` as `new Error(value)` applies it (undefined → ""). */
export function errorText(value: unknown): string {
  return value === undefined ? "" : String(value);
}

export interface CollageFetchOptions {
  method?: string;
  /** JSON body (a string is sent as-is). */
  body?: unknown;
  headers?: Record<string, string>;
  /** Don't send `Authorization` from `localStorage.token`. */
  skipAuth?: boolean;
  signal?: AbortSignal;
}

function storedToken(): string | null {
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

/**
 * JSON request to the backend. Resolves with the parsed body (`null` for an
 * empty or non-JSON body) and throws {@link CollageHttpError} on non-2xx.
 */
export async function collageFetchJson<T = unknown>(path: string, options: CollageFetchOptions = {}): Promise<T | null> {
  const { method, body, skipAuth, signal } = options;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (!skipAuth) {
    // Through the runtime's storage shim this reads as the cookie-auth
    // sentinel, which the fetch wrapper strips again (cookies carry the auth).
    const token = storedToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  Object.assign(headers, options.headers);
  let payload: BodyInit | undefined;
  if (body !== undefined && body !== null && body !== "") {
    if (!headers["Content-Type"]) headers["Content-Type"] = "application/json";
    payload = typeof body === "string" ? body : JSON.stringify(body);
  }
  const res = await apiRaw(path, { method, headers, body: payload, signal });
  if (!res.ok) {
    let detail: unknown = res.statusText;
    try {
      const data = (await res.json()) as Record<string, unknown> | null;
      if (data === null) throw new TypeError("null body"); // `null.detail` threw in the original too
      detail = data.detail || data.message || JSON.stringify(data);
    } catch {}
    throw new CollageHttpError(errorText(detail) || `Request failed (${res.status})`, res.status);
  }
  const text = await res.text();
  try {
    return text ? (JSON.parse(text) as T) : null;
  } catch (err) {
    console.warn("Invalid JSON from", path, err);
    return null;
  }
}
