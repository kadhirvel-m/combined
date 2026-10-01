/** Helpers for reading backend responses the way the original pages did. */

/** `res.json()` that never throws (student login / signup). */
export async function jsonOrEmpty<T extends object>(res: Response): Promise<Partial<T>> {
  const data = (await res.json().catch(() => ({}))) as Partial<T> | null;
  return data ?? {};
}

/** `detail` or `message` of an error body, when it is usable as text. */
export function detailOrMessage(body: { detail?: unknown; message?: unknown } | null | undefined): string {
  const value = body?.detail || body?.message;
  return value ? String(value) : "";
}

/**
 * teacher_login.html `safeJson`: tolerant parser that also accepts JSON sent
 * with a non-JSON content type and keeps other bodies under `raw`.
 */
export async function safeJson<T extends object>(res: Response): Promise<Partial<T> & { raw?: string }> {
  const ct = res.headers.get("content-type") || "";
  let text = "";
  try {
    text = await res.text();
  } catch {
    return {};
  }
  if (!text) return {};
  if (!/json|javascript/i.test(ct)) {
    console.warn("[login] Non-JSON response", { status: res.status, ct, sample: text.slice(0, 120) });
    try {
      return JSON.parse(text) as Partial<T>;
    } catch {
      return { raw: text } as Partial<T> & { raw?: string };
    }
  }
  try {
    return JSON.parse(text) as Partial<T>;
  } catch (err) {
    console.warn("[login] JSON parse error", err, { sample: text.slice(0, 120) });
    return {};
  }
}

/**
 * teacher_login.html `normalizeErrorMessage`: FastAPI `detail` can be a
 * string, a list of validation errors or an object.
 */
export function normalizeErrorMessage(value: unknown, fallback: string): string {
  if (value == null) return fallback;
  if (typeof value === "string") {
    const s = value.trim();
    return s || fallback;
  }
  if (Array.isArray(value)) {
    const joined = value
      .map((v) => normalizeErrorMessage(v, ""))
      .filter(Boolean)
      .join(" | ");
    return joined || fallback;
  }
  if (typeof value === "object") {
    const record = value as { message?: unknown; detail?: unknown };
    if (typeof record.message === "string" && record.message.trim()) return record.message.trim();
    if (typeof record.detail === "string" && record.detail.trim()) return record.detail.trim();
    try {
      return JSON.stringify(value);
    } catch {
      return fallback;
    }
  }
  return String(value);
}
