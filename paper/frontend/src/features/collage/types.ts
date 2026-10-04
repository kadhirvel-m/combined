/** Response/request shapes of the collage syllabus page (see `../../main.py`). */

/** `TopicOut` (older rows used `topic_title`). */
export interface SyllabusTopic {
  id: string;
  topic?: string | null;
  topic_title?: string | null;
  order_in_unit?: number;
  image_url?: string | null;
  video_url?: string | null;
  ppt_url?: string | null;
  lab_url?: string | null;
  unit_id?: string | null;
  course_id?: string | null;
  course_type?: string | null;
}

/** `UnitOut`. */
export interface SyllabusUnit {
  id: string;
  unit_title?: string | null;
  order_in_course?: number;
  topics?: SyllabusTopic[] | null;
}

/** `SyllabusCourseOut` — `GET /api/syllabus/courses/{course_id}`. */
export interface SyllabusCourseResponse {
  id: string;
  batch_id?: string;
  semester?: number;
  course_code?: string;
  title?: string;
  type?: string | null;
  units?: SyllabusUnit[] | null;
  /** Only present on error bodies. */
  detail?: unknown;
}

/** What the page keeps of a loaded course. */
export interface SyllabusCourse {
  id: string;
  course_code?: string;
  title?: string;
  semester?: number;
  units: SyllabusUnit[];
}

/** `TopicUpsertIn`: an `id` updates that topic row, no id inserts one. */
export interface UnitTopicInput {
  id?: string;
  topic: string;
}

/** `UnitTopicsIn` — body of POST /api/syllabus/courses/{id}/units and PUT /api/syllabus/units/{id}. */
export interface UnitPayload {
  unit_title: string;
  topics: UnitTopicInput[];
}

/** `GET /api/notes/topics/search` item. */
export interface TopicSuggestion {
  id?: string | null;
  topic?: string | null;
}

export interface TopicSearchResponse {
  query?: string;
  items?: TopicSuggestion[];
}

/** `GET /api/blink/links` → `{ links: { topic: url } }`. */
export interface BlinkLinksResponse {
  links?: Record<string, string | null> | null;
  loaded?: boolean;
}

/** `POST /api/blink/generate`. */
export interface BlinkGenerateResponse {
  success?: boolean;
  url?: string;
  filename?: string;
}

/** `GET /api/labx/check-batch` → `{ cached: { topic: exists } }`. */
export interface LabxCheckResponse {
  cached?: Record<string, boolean> | null;
  loaded?: boolean;
}

/** `POST /api/labx/generate` and `GET /api/labx/get/{topic}`. */
export interface LabxResponse {
  success?: boolean;
  topic?: string;
  html?: string;
  cached?: boolean;
  error?: string;
  detail?: unknown;
}

/** Normalized topic name → blink image URL. */
export type BlinkMap = Record<string, string>;
/** Lower-cased topic name → LabX explanation cached. */
export type LabxMap = Record<string, boolean>;
