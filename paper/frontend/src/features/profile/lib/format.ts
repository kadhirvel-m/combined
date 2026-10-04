import type { EducationEntry, StudentProfile } from "../types";

/** Adds `https://` to bare links; keeps http(s)/mailto/tel URLs. */
export function normaliseLink(value: unknown): string {
  if (!value) return "";
  const trimmed = String(value).trim();
  if (!trimmed) return "";
  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function parseDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "Mar 2024" (browser locale), or null. */
export function formatMonthYear(iso: string | null | undefined): string | null {
  const d = parseDate(iso);
  return d ? d.toLocaleDateString(undefined, { month: "short", year: "numeric" }) : null;
}

/** "Mar 2024 – Present" / "Mar 2024 – Jun 2025" / single side / "". */
export function formatDateRange(start?: string | null, end?: string | null, current?: boolean | null): string {
  const s = formatMonthYear(start);
  const e = current ? "Present" : formatMonthYear(end);
  if (s && e) return `${s} – ${e}`;
  if (s) return s;
  return e || "";
}

/** Device timestamps: browser-local date/time, or "--". */
export function formatDeviceTime(iso: unknown): string {
  if (!iso) return "--";
  const d = new Date(String(iso));
  return Number.isNaN(d.getTime()) ? "--" : d.toLocaleString();
}

/** Text shown for an optional value: the value, or the fallback when empty. */
export function textOr(value: unknown, fallback = "--"): string {
  return value ? String(value) : fallback;
}

/** "2022 - 2026", or null when the profile has no batch. */
export function batchLabel(profile: StudentProfile): string | null {
  const batch = profile.batch;
  if (!batch?.from && !batch?.to) return null;
  return `${batch?.from || "?"} - ${batch?.to || "?"}`;
}

/** Up to two upper-case initials from a display name. */
export function nameInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((s) => s[0]?.toUpperCase())
    .slice(0, 2)
    .join("");
}

/** Profile completeness (0–100) over the 18 fields the original counted. */
export function profileCompleteness(p: StudentProfile): number {
  const firstEdu: EducationEntry = Array.isArray(p.education_entries) && p.education_entries.length ? p.education_entries[0] : {};
  const fields = [
    p.name,
    p.headline,
    p.location,
    firstEdu.school,
    firstEdu.degree,
    firstEdu.department,
    firstEdu.batch_range,
    firstEdu.current_semester,
    firstEdu.regno,
    p.linkedin,
    p.github,
    p.resume_url,
    p.bio,
    p.skills,
    p.technologies,
    Array.isArray(p.experiences) && p.experiences.length > 0,
    Array.isArray(p.education_entries) && p.education_entries.length > 0,
    Array.isArray(p.portfolio_projects) && p.portfolio_projects.length > 0,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.min(100, Math.round((filled / fields.length) * 100)) || 0;
}

/** Skill chips: split on , | or newline, max 25. */
export function skillChips(text: string | null | undefined): string[] {
  return (text || "")
    .split(/[,|\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 25);
}

/** Technology chips: split on space , | or newline, max 30. */
export function technologyChips(text: string | null | undefined): string[] {
  return (text || "")
    .split(/[ ,|\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 30);
}

const trimmed = (v: unknown) => String(v || "").trim();

/** An education row with college, degree, department, batch, section and a positive semester. */
export function isEducationComplete(ed: EducationEntry | null | undefined): boolean {
  const semester = Number(ed?.current_semester);
  return Boolean(
    trimmed(ed?.school) &&
      trimmed(ed?.degree) &&
      trimmed(ed?.department) &&
      trimmed(ed?.batch_range) &&
      trimmed(ed?.section) &&
      Number.isFinite(semester) &&
      semester > 0,
  );
}

/**
 * Which completion prompt the profile needs: none, just the phone number, or
 * the full name + education form.
 */
export function requiredCompletion(profile: StudentProfile): "none" | "phone" | "education" {
  const list = Array.isArray(profile.education_entries) ? profile.education_entries : [];
  const hasName = Boolean(trimmed(profile.name));
  const hasPhone = Boolean(trimmed(profile.phone));
  const hasEducation = list.some(isEducationComplete);
  if (hasName && hasEducation) return hasPhone ? "none" : "phone";
  return "education";
}
