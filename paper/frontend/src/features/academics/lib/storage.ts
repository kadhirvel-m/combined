/** Courses whose daily `subject_open` quota was already consumed today (UTC date, as before). */
export function consumedSubjectsKey(now = new Date()): string {
  return `paperx:consumedSubjectOpenIds:v2:${now.toISOString().slice(0, 10)}`;
}

export function loadDailySet(storageKey: string): Set<string> {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return new Set();
    const list: unknown = JSON.parse(raw);
    if (!Array.isArray(list)) return new Set();
    return new Set(list.map((item) => String(item || "").trim()).filter(Boolean));
  } catch {
    return new Set();
  }
}

export function persistDailySet(storageKey: string, values: Set<string>): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(Array.from(values || [])));
  } catch {
    // ignore localStorage failures
  }
}
