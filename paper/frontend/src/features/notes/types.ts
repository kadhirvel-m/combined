/** Request / response shapes of the notes endpoints (only the fields the UI reads). */

/** A stored note (`GET /notes/{id}`, `GET /api/notes/resolve`, `GET /api/notes/edited`). */
export interface NoteRecord {
  id?: string;
  title?: string;
  markdown?: string;
  image_urls?: string[];
  verified_by_name?: string | null;
}

/** `GET /api/notes/degrees` row. */
export interface DegreeRow {
  degree_label?: string;
  degree_key?: string;
}

/** `GET /api/notes/allowed-domains`. */
export interface AllowedDomains {
  domains?: string[];
}

/** `GET /api/me` (only the department is read). */
export interface MeResponse {
  profile?: { department?: { id?: string | number } | null } | null;
}

/** `GET /api/public/academic-meta`. */
export interface AcademicMeta {
  departments?: { id: string | number; degree_id?: string | number | null }[];
  degrees?: { id: string | number; name?: string | null }[];
}

/** `GET /api/admin/roles/me`. */
export interface RolesResponse {
  role?: string;
  user_role?: string;
  userRole?: string;
  roles?: unknown[];
  permissions?: Record<string, unknown> | null;
  is_admin?: boolean;
  is_employee?: boolean;
}

/** `POST /api/access/check-and-consume`. */
export interface AccessCheckResponse {
  allowed?: boolean;
  reason?: string;
  detail?: string;
  remaining?: number | null;
  limit?: number | null;
}

/** `GET /api/access/summary`. */
export interface AccessSummary {
  tier?: string;
  plan?: Record<string, unknown>;
}

/** `GET /api/syllabus/topics/by-title` row. */
export interface SyllabusTopic {
  topic?: string;
  video_url?: string | null;
  course_type?: string | null;
}

/** `GET /api/youtube/search` item (plus the locally built "recommended" card). */
export interface RelatedVideo {
  id?: string;
  link?: string;
  title?: string;
  channel?: string;
  channel_page?: string;
  channel_logo?: string;
  channel_logo_is_default?: boolean;
  thumbnail?: string;
  views?: string;
  duration?: string;
  recommended?: boolean;
}

/** `POST /api/transcripts/meta`. */
export interface TranscriptMeta {
  channel_name?: string;
  channel_logo?: string;
  channel_url?: string;
}

/** `POST /api/notes/verify`. */
export interface VerifyResponse {
  note_id?: string | number;
  verified_by_name?: string;
  detail?: string;
  error?: string;
}

/** `POST /api/notes/feedback` body. */
export interface FeedbackPayload {
  category: string;
  message: string;
  quick_tags: string[];
  rating: number | null;
  note_id: string | null;
  note_variant: string | null;
  note_title: string | null;
  topic: string | null;
  page_path: string | null;
  page_url: string | null;
  selected_text: string | null;
  meta: { tz: string | null; lang: string | null; screen: { w: number | null; h: number | null } };
}

/** Events of the `…/generate/stream` SSE endpoint. */
export type StreamStage =
  | "start"
  | "search_results"
  | "fetch_start"
  | "fetch_done"
  | "fetch_error"
  | "merged_titles"
  | "context_ready"
  | "llm_start"
  | "llm_done"
  | "images"
  | "error"
  | "final";

export interface StreamStartEvent {
  allowed_domains?: string[];
  degree?: string;
}

export interface StreamImagesEvent {
  count?: number;
  image_urls?: string[];
  urls?: string[];
}

export interface StreamFinalEvent {
  id?: string;
  title?: string;
  topic?: string;
  markdown?: string;
  image_urls?: string[];
  urls?: string[];
}

/** One entry of the table of contents built from the rendered headings. */
export interface TocItem {
  id: string;
  text: string;
  level: 1 | 2 | 3;
}

/** `{ ok, status, data }` result of the tolerant JSON fetch helpers. */
export interface JsonResult<T> {
  ok: boolean;
  status: number;
  data: T | null;
}
