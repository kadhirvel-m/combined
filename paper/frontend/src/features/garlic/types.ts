/** Response and request shapes of the GARLIC endpoints used by garlic_academics.html (see main.py). */

export type TopicStatus = "not_started" | "in_progress" | "completed" | (string & {});

export interface PlanTopic {
  item_id?: string | null;
  topic_id?: string | null;
  topic?: string | null;
  order_in_unit?: number;
  priority_score?: number | null;
  confidence_score?: number | null;
  estimated_time?: number | null;
  recommended_time?: number | null;
  reason?: string | null;
  status?: TopicStatus | null;
  completed?: boolean | null;
  last_accessed?: string | null;
}

export interface PlanUnit {
  unit_id?: string;
  unit_title?: string | null;
  topics?: PlanTopic[] | null;
}

export interface PlanSubject {
  subject_id?: string;
  course_code?: string | null;
  subject_title?: string | null;
  course_type?: string | null;
  units?: PlanUnit[] | null;
}

export interface DailyFocusItem {
  item_id?: string | null;
  topic_id?: string | null;
  topic?: string | null;
  priority_score?: number | null;
  estimated_time?: number | null;
  reason?: string | null;
  status?: TopicStatus | null;
  completed?: boolean | null;
  /** Not sent by the backend today; the page prefers it over the subject lookup. */
  course_type?: string | null;
}

/** GET /api/garlic/plan/{student_id}, POST /api/garlic/generate|regenerate */
export interface GarlicPlan {
  plan?: Record<string, unknown>;
  summary?: {
    total_topics?: number;
    completed_topics?: number;
    remaining_topics?: number;
    high_priority_topics?: number;
    total_estimated_minutes?: number;
    /** Read by the page (falls back to 0); the backend doesn't send it. */
    total_subjects?: number;
  };
  daily_focus?: DailyFocusItem[] | null;
  insights?: string[] | null;
  subjects?: PlanSubject[] | null;
}

/** One topic with its subject and unit (the original `flattenTopics()` entries). */
export interface FlatTopic {
  subject: PlanSubject;
  unit: PlanUnit;
  topic: PlanTopic;
}

/** The `profile` of GET /api/me, as far as this page reads it. */
export interface MeProfile {
  auth_user_id?: string | null;
  batch?: { id?: string | null } | null;
  batch_id?: string | null;
  semester?: number | string | null;
  college?: { name?: string | null } | string | null;
  [key: string]: unknown;
}

export interface SyllabusCourse {
  units?: { topics?: { id?: string | null; topic_id?: string | null }[] | null }[] | null;
}

export interface MeResponse {
  profile?: MeProfile;
  syllabus?: SyllabusCourse[];
  data?: { profile?: MeProfile; syllabus?: SyllabusCourse[] };
}

export interface ProgressResponse {
  completed_topic_ids?: unknown[];
  data?: { completed_topic_ids?: unknown[] };
}

/** Body of POST /api/garlic/generate|regenerate (the original `__ctx`). */
export interface PlanContext {
  student_id: string;
  batch_id: string | null;
  semester: number | null;
  college: string | null;
}

/** KPI inputs synced from /api/me + /api/progress/topics (the original `__liveKpis`). */
export interface LiveMetrics {
  totalTopics: number;
  completedTopics: number;
  activeSubjects: number;
  ready: boolean;
  /** Every completed topic id (the original `__completedTopicIds`). */
  completedIds: ReadonlySet<string>;
}

// ---------- Exam mode (GARLIC v3) ----------

export type Intensity = "normal" | "exam" | "critical" | (string & {});
export type RiskLevel = "low" | "moderate" | "high" | "critical" | (string & {});

export interface ExamProfile {
  exam_date?: string | null;
  time_remaining_days?: number | null;
  intensity_level?: Intensity | null;
  risk_level?: RiskLevel | null;
  predicted_marks?: number | null;
  readiness_score?: number | null;
  [key: string]: unknown;
}

/** POST /api/garlic/v3/exam-mode/activate */
export interface ExamActivateResponse {
  ok?: boolean;
  profile?: ExamProfile | null;
  intensity_level?: Intensity | null;
}

/** GET /api/garlic/v3/exam-mode/status */
export interface ExamStatusResponse {
  active?: boolean;
  profile?: ExamProfile | null;
}

export interface OutcomePrediction {
  predicted_marks?: number | null;
  completion_probability?: number | null;
  readiness_score?: number | null;
  readiness_level?: string | null;
  risk_level?: RiskLevel | null;
  improvement_potential?: number | null;
  learning_velocity_topics_per_day?: number | null;
  gap_analysis?: { risk_reasons?: string[] | null } | null;
  ai_reasoning?: string | null;
  signals?: { total_topics?: number | null; completed?: number | null } | null;
}

/** GET /api/garlic/v3/daily-target/{student_id} */
export interface DailyTarget {
  daily_target?: number | null;
  completed_today?: number | null;
  on_track?: boolean | null;
  message?: string | null;
}

export interface Velocity {
  topics_per_day_overall?: number | null;
  topics_per_day_last_7?: number | null;
  pace_message?: string | null;
  will_complete_in_time?: boolean | null;
}

export type Severity = "info" | "warning" | "critical" | (string & {});

export interface ExamInsight {
  type?: string;
  severity?: Severity | null;
  text?: string | null;
  marks_impact?: number | null;
}

export interface MicroQuestion {
  question_id?: string | null;
  topic_name?: string | null;
  question_text?: string | null;
  options?: string[] | null;
}

/** POST /api/garlic/v3/diagnostic/micro */
export interface MicroDiagnosticResponse {
  session_id?: string | null;
  question?: MicroQuestion | null;
}

export interface AnswerEvaluation {
  score?: number | null;
  explanation?: string | null;
}

/** POST /api/garlic/v3/replan */
export interface ReplanResponse {
  topics_reranked?: number | null;
}
