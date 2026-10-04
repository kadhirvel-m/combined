import { fetchBlinkLinks, getBatchCourses, getCourse, getCoursesBatch, isSuccess, isUnauthorized } from "../api";
import type { AcademicProfile, AggregateStats, SyllabusCourse } from "../types";
import { normalizeTopicKey, pct, unitIdOf, wait } from "./topics";

function countCourseTopics(course: SyllabusCourse | null | undefined): number {
  return (Array.isArray(course?.units) ? course.units : []).reduce(
    (sum, u) => sum + (Array.isArray(u?.topics) ? u.topics.length : 0),
    0,
  );
}

function normalizeHydratedCourse(raw: SyllabusCourse | null | undefined, fallback: SyllabusCourse): SyllabusCourse {
  if (!raw || typeof raw !== "object") return fallback;
  return {
    id: raw.id || fallback?.id || null,
    course_code: raw.course_code || fallback?.course_code || "",
    title: raw.title || fallback?.title || "",
    semester: raw.semester || fallback?.semester || "",
    type: raw.type || fallback?.type || "",
    units: (Array.isArray(raw.units) ? raw.units : []).map((u) => ({
      id: u?.id || null,
      unit_title: u?.unit_title || u?.title || "Unit",
      order_in_course: u?.order_in_course,
      topics: (Array.isArray(u?.topics) ? u.topics : []).map((t) => ({
        id: t?.id || null,
        topic: t?.topic || "",
        order_in_unit: t?.order_in_unit,
        image_url: t?.image_url || "",
        lab_url: t?.lab_url || "",
      })),
    })),
  };
}

function pickBestHydration(course: SyllabusCourse, candidate: SyllabusCourse | null | undefined): SyllabusCourse {
  if (!candidate) return course;
  const normalized = normalizeHydratedCourse(candidate, course);
  return countCourseTopics(normalized) >= countCourseTopics(course) ? normalized : course;
}

/** Full units/topics per course: batch endpoint first, per-course fallback for old backends. */
export async function hydrateSyllabusCourses(syllabus: SyllabusCourse[]): Promise<SyllabusCourse[]> {
  const courses = Array.isArray(syllabus) ? syllabus : [];
  if (!courses.length) return courses;

  const courseIds = Array.from(new Set(courses.map((c) => String(c?.id || "").trim()).filter(Boolean)));
  if (courseIds.length) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const out = await getCoursesBatch(courseIds);
      if (isSuccess(out) && Array.isArray(out.data)) {
        const byId = new Map<string, SyllabusCourse>();
        for (const item of out.data) {
          const id = String(item?.id || "").trim();
          if (id) byId.set(id, item);
        }
        return courses.map((course) => {
          const key = String(course?.id || "").trim();
          return key ? pickBestHydration(course, byId.get(key)) : course;
        });
      }
      // Endpoint unavailable in older backends; fall through to per-course hydration.
      if ("status" in out && (out.status === 404 || out.status === 405)) break;
      if (isUnauthorized(out)) return courses;
      await wait(180 * (attempt + 1));
    }
  }

  return Promise.all(
    courses.map(async (course) => {
      const courseId = String(course?.id || "").trim();
      if (!courseId) return course;
      for (let attempt = 0; attempt < 3; attempt++) {
        const out = await getCourse(courseId);
        if (isSuccess(out) && out.data) return pickBestHydration(course, out.data);
        if (isUnauthorized(out)) return course;
        await wait(220 * (attempt + 1));
      }
      return course;
    }),
  );
}

export function hasSyllabusContext(profile: AcademicProfile | null | undefined): boolean {
  const batchId = String(profile?.batch?.id || "").trim();
  const semester = Number(profile?.semester);
  return Boolean(batchId) && Number.isFinite(semester) && semester > 0;
}

/** Re-reads the batch's courses when /api/me came back without a syllabus. */
export async function recoverSyllabusFromProfile(profile: AcademicProfile): Promise<SyllabusCourse[]> {
  const batchId = String(profile?.batch?.id || "").trim();
  const semester = Number(profile?.semester);
  if (!batchId || !Number.isFinite(semester) || semester <= 0) return [];
  for (let attempt = 0; attempt < 3; attempt++) {
    const out = await getBatchCourses(batchId, semester);
    if (isSuccess(out) && Array.isArray(out.data) && out.data.length) return hydrateSyllabusCourses(out.data);
    if (isUnauthorized(out)) break;
    await wait(250 * (attempt + 1));
  }
  return [];
}

/** Blink availability per unit, checked with the first topic of each unit only. */
export async function fetchUnitBlinkAvailability(syllabus: SyllabusCourse[]): Promise<Map<string, boolean>> {
  const availability = new Map<string, boolean>();
  const unitsByTopic = new Map<string, Set<string>>();
  for (const course of syllabus) {
    for (const unit of Array.isArray(course?.units) ? course.units : []) {
      const unitId = unitIdOf(unit);
      if (!unitId) continue;
      const first = (Array.isArray(unit?.topics) ? unit.topics : []).find((t) => String(t?.topic || "").trim());
      if (!first) continue;
      const key = normalizeTopicKey(first.topic);
      if (!key) continue;
      if (!unitsByTopic.has(key)) unitsByTopic.set(key, new Set());
      unitsByTopic.get(key)!.add(unitId);
    }
  }
  if (!unitsByTopic.size) return availability;
  try {
    const links = await fetchBlinkLinks(Array.from(unitsByTopic.keys()));
    unitsByTopic.forEach((unitIds, key) => {
      if (links.has(key)) unitIds.forEach((id) => availability.set(id, true));
    });
  } catch (err) {
    console.warn("[Academics] Unit blink availability check failed", err);
  }
  return availability;
}

export function computeAggregateStats(syllabus: SyllabusCourse[], completed: Set<string>): AggregateStats {
  let total = 0;
  let done = 0;
  for (const c of syllabus) {
    for (const u of c.units || []) {
      for (const t of u.topics || []) {
        total++;
        if (t.id && completed.has(t.id)) done++;
      }
    }
  }
  return { done, total, courses: syllabus.length, completion: pct(done, total) };
}
