import type {
  DailyFocusItem,
  FlatTopic,
  GarlicPlan,
  LiveMetrics,
  MeResponse,
  PlanContext,
  PlanSubject,
  PlanTopic,
  ProgressResponse,
  SyllabusCourse,
} from "../types";

export const EMPTY_LIVE_METRICS: LiveMetrics = {
  totalTopics: 0,
  completedTopics: 0,
  activeSubjects: 0,
  ready: false,
  completedIds: new Set(),
};

function arr<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

/** The profile context sent to generate/regenerate (original `parseProfileContext`). */
export function parseProfileContext(me: MeResponse): PlanContext {
  const p = me?.profile || me?.data?.profile || {};
  const college = (p.college && typeof p.college === "object" ? p.college.name : null) || p.college;
  return {
    student_id: String(p.auth_user_id || "").trim(),
    batch_id: String(p.batch?.id || p.batch_id || "").trim() || null,
    semester: Number(p.semester || 0) || null,
    college: String(college || "").trim() || null,
  };
}

/** KPI inputs from GET /api/me + GET /api/progress/topics (original `loadLiveAcademicMetrics`). */
export function liveMetricsFrom(me: MeResponse, progress: ProgressResponse): LiveMetrics {
  const syllabus: SyllabusCourse[] = Array.isArray(me?.syllabus) ? me.syllabus : arr(me?.data?.syllabus);
  const syllabusTopicIds = new Set<string>();
  let totalTopics = 0;
  for (const course of syllabus) {
    for (const unit of arr(course?.units)) {
      const topics = arr(unit?.topics);
      totalTopics += topics.length;
      for (const topic of topics) {
        const id = String(topic?.id || topic?.topic_id || "").trim();
        if (id) syllabusTopicIds.add(id);
      }
    }
  }
  const rawIds = Array.isArray(progress?.completed_topic_ids) ? progress.completed_topic_ids : arr(progress?.data?.completed_topic_ids);
  const completed = rawIds.map((id) => String(id || "").trim()).filter(Boolean);
  return {
    totalTopics,
    completedTopics: completed.filter((id) => syllabusTopicIds.has(id)).length,
    activeSubjects: syllabus.length,
    ready: true,
    completedIds: new Set(completed),
  };
}

/** Every topic with its subject and unit, in plan order (original `flattenTopics`). */
export function flattenTopics(payload: GarlicPlan | null | undefined): FlatTopic[] {
  const out: FlatTopic[] = [];
  for (const subject of arr(payload?.subjects)) {
    for (const unit of arr(subject?.units)) {
      for (const topic of arr(unit?.topics)) out.push({ subject, unit, topic });
    }
  }
  return out;
}

export const priorityOf = (topic: { priority_score?: number | null } | null | undefined) => Number(topic?.priority_score || 0);

/** Topics sorted by priority, highest first (stable, like Array#sort). */
export function byPriority<T extends { priority_score?: number | null }>(topics: T[]): T[] {
  return [...topics].sort((a, b) => priorityOf(b) - priorityOf(a));
}

/** Notes page for a course type (original `notesPageByType`). */
export function notesPageByType(courseType: string | null | undefined): string {
  const t = String(courseType || "").toLowerCase();
  if (t.includes("math")) return "/maths_notes.html";
  if (t.includes("phys")) return "/physics_notes.html";
  return "/notes_generator.html";
}

export function notesHref(courseType: string | null | undefined, topic: string | null | undefined): string {
  return `${notesPageByType(courseType)}?topic=${encodeURIComponent(topic || "")}`;
}

/** `not_started` → `Not started` (original `prettyStatus`). */
export function prettyStatus(value: string | null | undefined): string {
  const raw = String(value || "not_started").replace(/_/g, " ").trim();
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

/** Done by progress sync, status or flag (the graph/list check). */
export function isTopicDone(topic: PlanTopic, completedIds: ReadonlySet<string>): boolean {
  const id = String(topic?.topic_id || "").trim();
  return (!!id && completedIds.has(id)) || String(topic?.status || "") === "completed" || !!topic?.completed;
}

/** Course type used to route a daily-focus row (its own, else the matching plan topic's subject). */
export function focusCourseType(item: DailyFocusItem, flat: FlatTopic[]): string {
  if (item?.course_type) return item.course_type;
  const matched = flat.find((f) => String(f?.topic?.topic_id) === String(item?.topic_id) || String(f?.topic?.topic) === String(item?.topic));
  return matched?.subject?.course_type || "";
}

/** "Estimated Time: 1h 55m" for the daily focus list. */
export function estimatedLine(items: DailyFocusItem[]): string {
  if (!items.length) return "Estimated Time: --";
  const total = items.reduce((sum, item) => sum + Number(item?.estimated_time || 0), 0);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `Estimated Time: ${h > 0 ? `${h}h ` : ""}${m}m`;
}

export interface Kpis {
  done: number;
  total: number;
  activeSubjects: number;
  completionPct: number;
  avgConfidence: number;
  confidencePct: number;
}

/** Hero KPI values (original `updateKpis`): live syllabus numbers when synced, else the plan summary. */
export function computeKpis(payload: GarlicPlan | null, live: LiveMetrics): Kpis {
  const summary = payload?.summary || {};
  const total = live.ready ? live.totalTopics : Number(summary.total_topics || 0);
  const doneRaw = live.ready ? live.completedTopics : Number(summary.completed_topics || 0);
  const done = Math.max(0, Math.min(doneRaw, total || doneRaw));
  const activeSubjects = live.ready ? live.activeSubjects : Number(summary.total_subjects || 0);
  const topics = flattenTopics(payload);
  const avgConfidence = topics.length ? topics.reduce((a, b) => a + Number(b?.topic?.confidence_score || 0), 0) / topics.length : 0;
  return {
    done,
    total,
    activeSubjects,
    completionPct: total > 0 ? Math.round((done / total) * 100) : 0,
    avgConfidence,
    confidencePct: Math.max(0, Math.min(100, Math.round(avgConfidence))),
  };
}

/** Highest-priority topic not yet completed (original `eccGetNextTopic`; ignores the progress sync). */
export function nextBestTopic(payload: GarlicPlan | null): FlatTopic | null {
  if (!payload) return null;
  const available = flattenTopics(payload).filter((t) => !t?.topic?.completed && String(t?.topic?.status || "") !== "completed");
  return [...available].sort((a, b) => priorityOf(b.topic) - priorityOf(a.topic))[0] || null;
}

export type StatusGroupKey = "not_started" | "in_progress" | "completed";

/** Execution Status Board groups (a topic can be in two groups, as in the original). */
export function statusGroups(payload: GarlicPlan | null): Record<StatusGroupKey, PlanTopic[]> {
  const topics = flattenTopics(payload).map((x) => x.topic || {});
  return {
    not_started: topics.filter((t) => String(t?.status || "not_started") === "not_started"),
    in_progress: topics.filter((t) => String(t?.status || "") === "in_progress"),
    completed: topics.filter((t) => String(t?.status || "") === "completed" || !!t?.completed),
  };
}

export function subjectsOf(payload: GarlicPlan | null): PlanSubject[] {
  return arr(payload?.subjects);
}
