/**
 * Shared navigation context of the collage (college console) pages — the typed
 * port of the context half of `ui/collage/helpers.js`.
 *
 * The pages pass ids and names to each other through query strings
 * (`subjects.html?collegeId=…&batchId=…`). On load every page merges ALL of its
 * query params into one `sessionStorage` object (`collage_ctx_v1`) and then
 * removes the query string from the address bar, so ids never linger in the
 * URL. Pages read their context from the merged object, which also lets a page
 * opened without a query (reload, back button) keep working.
 *
 * Storage key and data shape are unchanged, so React and legacy collage pages
 * share the same context.
 */

export const COLLAGE_CTX_KEY = "collage_ctx_v1";

/**
 * Links are only rewritten when they point under this path, exactly as in
 * helpers.js. The original UI was served by FastAPI at `/ui/collage/…`; under
 * Next.js (and the static UI server) the pages live at `/collage/…`, so in
 * practice links keep their query strings and the target page scrubs them.
 */
export const COLLAGE_PATH_MARKER = "/ui/collage/";

/** The params helpers.js names as sensitive (it scrubs the whole query string anyway). */
export const SENSITIVE_QUERY_KEYS: ReadonlySet<string> = new Set([
  "collegeId",
  "degreeId",
  "departmentId",
  "batchId",
  "courseId",
  "subjectId",
]);

/**
 * Everything the collage pages have put in the context. Values that came from
 * a query string are strings; `navigateCollage()` callers may store other JSON.
 */
export interface CollageContext {
  collegeId?: string;
  collegeName?: string;
  degreeId?: string;
  degreeName?: string;
  departmentId?: string;
  departmentName?: string;
  batchId?: string;
  batchRange?: string;
  courseId?: string;
  courseCode?: string;
  courseTitle?: string;
  semester?: string;
  subjectId?: string;
  [key: string]: unknown;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object";
}

/** The stored context object (`{}` when missing or unreadable). */
export function readStoredContext(): CollageContext {
  try {
    const raw = sessionStorage.getItem(COLLAGE_CTX_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    return isObject(parsed) ? (parsed as CollageContext) : {};
  } catch {
    return {};
  }
}

/** Replaces the stored context. */
export function writeStoredContext(ctx: CollageContext | null | undefined): void {
  try {
    sessionStorage.setItem(COLLAGE_CTX_KEY, JSON.stringify(ctx || {}));
  } catch {}
}

/** Shallow-merges `next` over the stored context, saves and returns the result. */
export function mergeStoredContext(next: CollageContext | null | undefined): CollageContext {
  const merged = { ...readStoredContext(), ...(next || {}) };
  writeStoredContext(merged);
  return merged;
}

/** Query params as a plain object (a repeated key keeps its last value). */
export function queryToContext(params: URLSearchParams | string): Record<string, string> {
  const out: Record<string, string> = {};
  const search = typeof params === "string" ? new URLSearchParams(params) : params;
  search.forEach((value, key) => {
    out[key] = value;
  });
  return out;
}

/**
 * Removes the query string from the address bar (keeps path and hash), as
 * `stripSensitiveParamsFromAddress()` did. No new history entry is created.
 */
export function stripQueryFromAddress(): void {
  if (typeof window === "undefined") return;
  const { pathname, search, hash } = window.location;
  const nextUrl = `${pathname}${hash || ""}`;
  const currentUrl = `${pathname}${search || ""}${hash || ""}`;
  if (nextUrl === currentUrl) return;
  try {
    window.history.replaceState(null, "", nextUrl);
  } catch {}
}

/**
 * `Collage.parseQuery()`: merges the current query params into the stored
 * context, scrubs them from the URL and returns the merged context. Call it
 * once when a collage page loads (see `useCollageContext`).
 */
export function parseQuery(): CollageContext {
  const fromUrl = typeof window !== "undefined" && window.location.search ? queryToContext(window.location.search) : {};
  const merged = mergeStoredContext(fromUrl);
  stripQueryFromAddress();
  return merged;
}

/**
 * A context value as a string, URI-decoded once more like the original page
 * did (`decodeURIComponent(params.x)`). Malformed escapes (a literal `%`) keep
 * the raw value instead of throwing.
 */
export function contextString(ctx: CollageContext | null | undefined, key: string): string {
  const value = ctx?.[key];
  if (value === undefined || value === null || value === "") return "";
  const text = String(value);
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}

/** True for URLs under the collage folder marker (see `COLLAGE_PATH_MARKER`). */
export function isCollageUrl(url: URL | null | undefined): boolean {
  return !!url && typeof url.pathname === "string" && url.pathname.includes(COLLAGE_PATH_MARKER);
}

/** Path after the collage marker, plus the hash (`subjects.html#x`). */
function toCleanRelativePath(url: URL): string {
  const path = String(url.pathname);
  const markerIdx = path.lastIndexOf(COLLAGE_PATH_MARKER);
  const rel = markerIdx >= 0 ? path.slice(markerIdx + COLLAGE_PATH_MARKER.length) : path;
  return `${rel}${url.hash || ""}`;
}

export interface CollageNavTarget {
  url: URL | null;
  /** The target's query params. */
  context: Record<string, string>;
  /** Queryless href relative to the collage folder ('' when unparseable). */
  cleanRelativeHref: string;
}

/** Parses a link target relative to the current page. */
export function parseNavTarget(raw: string | null | undefined): CollageNavTarget {
  if (!raw || typeof window === "undefined") return { url: null, context: {}, cleanRelativeHref: "" };
  let url: URL;
  try {
    url = new URL(String(raw), window.location.href);
  } catch {
    return { url: null, context: {}, cleanRelativeHref: "" };
  }
  return { url, context: queryToContext(url.searchParams), cleanRelativeHref: toCleanRelativePath(url) };
}

export interface SanitizedHref {
  /** The href to render. */
  href: string;
  /** Context to merge into storage when the link is followed (null: nothing to store). */
  context: Record<string, string> | null;
}

/**
 * The anchor sanitizer of helpers.js as a pure function: a link into the
 * collage folder that carries a query string is rendered queryless and its
 * params are stored in the context on click instead. Other links (and every
 * link outside `/ui/collage/`) are returned unchanged.
 */
export function sanitizeCollageHref(rawHref: string): SanitizedHref {
  if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("javascript:")) return { href: rawHref, context: null };
  const parsed = parseNavTarget(rawHref);
  if (!parsed.url || !isCollageUrl(parsed.url) || !(parsed.url.search && parsed.url.search.length > 1)) {
    return { href: rawHref, context: null };
  }
  return { href: parsed.cleanRelativeHref || rawHref, context: parsed.context };
}

/**
 * `Collage.navigate(target, extraContext)`: stores the target's query params
 * (plus `extraContext`) in the context and loads the target without its query.
 */
export function navigateCollage(rawTarget: string, extraContext?: CollageContext): void {
  if (typeof window === "undefined") return;
  const parsed = parseNavTarget(rawTarget || "");
  mergeStoredContext({ ...parsed.context, ...(extraContext || {}) });
  const fallback = String(rawTarget || "").split("?")[0] || window.location.pathname;
  window.location.href = parsed.cleanRelativeHref || fallback;
}
