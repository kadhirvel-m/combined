/** localStorage / sessionStorage keys shared with the legacy notes pages. */

export const STORAGE_KEYS = {
  degree: "paperx:degree",
  lastVariant: "paperx:lastVariant",
  lastNoteId: "paperx:lastNoteId",
  lastNoteIdFor: (variant: string) => `paperx:lastNoteId:${variant}`,
  emphasis: "paperx:emphasis",
  notesVariant: "paperx:notesVariant",
  consumedTopicOpen: (day: string) => `paperx:consumedTopicOpen:v3:${day}`,
  lastVideos: "paperx:lastVideos",
  lastTopic: "paperx:lastTopic",
  lastVideoLanguage: "paperx:lastVideoLanguage",
  lastMcqSeed: "paperx:lastMCQSeed",
  lastFlashcardSeed: "paperx:lastFlashcardSeed",
} as const;

export function readLocal(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeLocal(key: string, value: string | null | undefined): void {
  try {
    if (value === null || value === undefined) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* storage unavailable */
  }
}

export function removeLocal(...keys: string[]): void {
  for (const key of keys) writeLocal(key, null);
}

export function writeSession(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* storage unavailable */
  }
}

/** Remembers a note id for its variant (and the legacy un-suffixed key for `detailed`). */
export function rememberNoteId(variant: string, id: string): void {
  if (!id) return;
  writeLocal(STORAGE_KEYS.lastNoteIdFor(variant), id);
  if (variant === "detailed") writeLocal(STORAGE_KEYS.lastNoteId, id);
}

/** Last note id for a variant (`detailed` also falls back to the legacy key). */
export function storedNoteId(variant: string): string {
  return readLocal(STORAGE_KEYS.lastNoteIdFor(variant)) || (variant === "detailed" ? readLocal(STORAGE_KEYS.lastNoteId) || "" : "");
}
