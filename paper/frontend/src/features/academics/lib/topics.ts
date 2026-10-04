import type { SyllabusCourse } from "../types";

/** Lower-case, whitespace-collapsed key used by the Blink/LabX lookups. */
export function normalizeTopicKey(value: unknown): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .join(" ");
}

export function pct(done: number, total: number): number {
  return total ? Math.round((done / total) * 100) : 0;
}

export function isMedicalStream(stream: string | null | undefined): boolean {
  const s = (stream || "").trim().toLowerCase();
  return s === "medical" || s === "nursing";
}

/**
 * Notes page for a search pick / "Generate": img_gen in developer mode,
 * the mediX chat for medical and nursing streams, otherwise the generator.
 */
export function generalNotesHref(topic: string, devMode: boolean, stream: string | null | undefined): string {
  const page = devMode ? "/img_gen.html" : isMedicalStream(stream) ? "/mediX/notes_chat.html" : "/notes_generator.html";
  return `${page}?topic=${encodeURIComponent(topic)}`;
}

/** Notes page for a syllabus topic (maths/physics courses have their own pages). */
export function courseNotesPage(course: SyllabusCourse, stream: string | null | undefined): string {
  const type = String(course.type || course.course_type || course.subject_type || "")
    .trim()
    .toLowerCase();
  const isMaths = type === "maths" || type === "math" || type === "mathematics" || type.includes("math");
  const isPhysics = type === "physics" || type === "phy" || type.includes("phys");
  if (isMaths) return "/maths_notes.html";
  if (isPhysics) return "/physics_notes.html";
  return isMedicalStream(stream) ? "/mediX/notes_chat.html" : "/notes_generator.html";
}

export function topicNotesHref(course: SyllabusCourse, topic: string, devMode: boolean, stream: string | null | undefined): string {
  const page = devMode ? "/img_gen.html" : courseNotesPage(course, stream);
  return `${page}?topic=${encodeURIComponent(topic)}`;
}

export function courseKeyOf(course: SyllabusCourse): string | null {
  const id = course.id || course.course_id || course.subject_id;
  return id ? String(id) : null;
}

export function unitIdOf(unit: { id?: string | null; unit_id?: string | null }): string | null {
  const id = unit.id || unit.unit_id;
  return id ? String(id) : null;
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
export { wait };
