/** Pure helpers of the study tools. */

/** Viewer URL for a MedMap presentation link (Slides/Drive/Docs embeds, PDFs, Office viewer, Google viewer). */
export function buildEmbedUrl(url: string): string {
  const u = (url || "").trim();
  if (/docs\.google\.com\/presentation/i.test(u)) return u.replace(/\/(edit|view)(#.*)?$/i, "/embed");
  if (/drive\.google\.com\/file\/d\//i.test(u)) return u.replace(/\/view(\?.*)?$/i, "/preview");
  if (/docs\.google\.com/i.test(u)) return u.replace(/\/(edit|view)(#.*)?$/i, "/preview");
  if (/\.pdf(\?|#|$)/i.test(u)) return u;
  if (/\.(pptx?|docx?|xlsx?)$/i.test(u)) return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(u)}`;
  return `https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(u)}`;
}

/** Fisher–Yates shuffle (copy). */
export function shuffled<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function normalizeTopicKey(value: string): string {
  return (value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

/** Picks the Blink image for a topic from `/api/blink/links` (exact key, then substring match, then a single result). */
export function pickBlinkUrl(raw: Record<string, unknown>, topic: string, candidates: string[]): string | null {
  const links: Record<string, string> = {};
  for (const [key, url] of Object.entries(raw)) {
    const norm = normalizeTopicKey(key);
    if (!norm || !url || typeof url !== "string") continue;
    links[norm] = url;
  }
  for (const candidate of candidates) if (links[candidate]) return links[candidate];
  const topicLower = normalizeTopicKey(topic);
  for (const [key, url] of Object.entries(links)) {
    if (key === topicLower || topicLower.includes(key) || key.includes(topicLower)) return url;
  }
  const values = Object.values(links).filter(Boolean);
  return values.length === 1 ? values[0] : null;
}

/** "Score: n/10" clamp used by CaseFlow. */
export function clampScore(value: unknown): number {
  const n = Number(value);
  return Math.max(0, Math.min(Number.isFinite(n) ? n : 0, 10));
}
