/**
 * Maps a text selection in the rendered notes back to the markdown source, so
 * the inline "Edit" action can rewrite just that part (port of the original
 * helpers).
 */

export interface HeadingRef {
  level: 1 | 2 | 3;
  title: string;
}

function levelOf(nodeName: string): 1 | 2 | 3 {
  return nodeName === "H1" ? 1 : nodeName === "H2" ? 2 : 3;
}

/** Nearest h1–h3 before `node` inside `root`. */
export function findClosestHeading(root: HTMLElement, start: Node | null): HeadingRef | null {
  if (!start) return null;
  const node = start.nodeType === Node.TEXT_NODE ? start.parentNode : start;
  let cur: Node | null = node;
  while (cur && cur !== root) {
    if (/^H[1-3]$/.test(cur.nodeName)) return { level: levelOf(cur.nodeName), title: (cur.textContent || "").trim() };
    cur = cur.previousSibling || cur.parentNode;
  }
  let last: Element | null = null;
  for (const h of Array.from(root.querySelectorAll("h1,h2,h3"))) {
    if (node && h.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING) break;
    last = h;
  }
  return last ? { level: levelOf(last.nodeName), title: (last.textContent || "").trim() } : null;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Splits markdown into `before`, the section under `heading`, and `after`. */
export function sliceSectionFromMarkdown(md: string, heading: string, level: number): { before: string; section: string; after: string } | null {
  const lines = md.split(/\n/);
  // The original built these patterns from template strings, where `\s` is just `s`; kept as-is.
  const startRe = new RegExp(`^${escapeRegex(`${"#".repeat(level)} ${heading}`)}s*$`, "i");
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (startRe.test(lines[i])) {
      start = i;
      break;
    }
  }
  if (start === -1) return null;
  const stopRe = new RegExp(`^#{1,${level}}s+`);
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (stopRe.test(lines[i])) {
      end = i;
      break;
    }
  }
  return {
    before: lines.slice(0, start).join("\n"),
    section: lines.slice(start, end).join("\n"),
    after: lines.slice(end).join("\n"),
  };
}

export function normalizeForMatch(s: string): string {
  return (s || "").replace(/\s+/g, " ").trim().toLowerCase();
}

function buildNormalizedMap(src: string): { norm: string; map: number[] } {
  const map: number[] = [];
  let norm = "";
  let lastSpace = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (/\s/.test(ch)) {
      if (!lastSpace) {
        norm += " ";
        map.push(i);
        lastSpace = true;
      }
    } else {
      norm += ch.toLowerCase();
      map.push(i);
      lastSpace = false;
    }
  }
  let a = 0;
  while (a < norm.length && norm[a] === " ") a++;
  let b = norm.length;
  while (b > a && norm[b - 1] === " ") b--;
  return { norm: norm.slice(a, b), map: map.slice(a, b) };
}

/** Locates the selected text in a markdown section (exact, normalized, then fuzzy). */
export function findSelectionInMarkdownSection(sectionMd: string, selection: string): { start: number; end: number; partial?: boolean } | null {
  if (!selection) return null;
  const direct = sectionMd.indexOf(selection);
  if (direct !== -1) return { start: direct, end: direct + selection.length };
  const { norm, map } = buildNormalizedMap(sectionMd);
  const sel = normalizeForMatch(selection);
  let idx = norm.indexOf(sel);
  if (idx !== -1) return { start: map[idx], end: map[Math.min(idx + sel.length - 1, map.length - 1)] + 1 };
  const selFlat = normalizeForMatch(selection.replace(/\n+/g, " "));
  idx = norm.indexOf(selFlat);
  if (idx !== -1) return { start: map[idx], end: map[Math.min(idx + selFlat.length - 1, map.length - 1)] + 1 };
  for (let len = Math.min(sel.length, 60); len >= 10; len--) {
    for (let i = 0; i <= sel.length - len; i++) {
      const subIdx = norm.indexOf(sel.slice(i, i + len));
      if (subIdx !== -1) return { start: map[subIdx], end: map[Math.min(subIdx + len - 1, map.length - 1)] + 1, partial: true };
    }
  }
  return null;
}

export function isWithinCode(node: Node | null): boolean {
  if (!node) return false;
  const el = (node.nodeType === Node.TEXT_NODE ? node.parentNode : node) as Element | null;
  return !!el?.closest?.("pre, code");
}

/**
 * Computes the markdown that replaces the selected part: returns the slice to
 * send to the transform endpoint and a function merging its replacement back.
 */
export function mapSelectionToMarkdown(
  markdown: string,
  heading: HeadingRef,
  selection: string,
): { error: string } | { selected: string; partial: boolean; merge: (replacement: string) => string } {
  const found = sliceSectionFromMarkdown(markdown || "", heading.title, heading.level);
  if (!found || !found.section) return { error: "Could not locate section in markdown" };
  const match = findSelectionInMarkdownSection(found.section, selection);
  let start: number;
  let end: number;
  let partial = false;
  if (match) {
    start = match.start;
    end = match.end;
    partial = !!match.partial;
  } else {
    const paras = found.section.split(/\n{2,}/);
    const paraIdx = paras.findIndex((p) => normalizeForMatch(p).includes(normalizeForMatch(selection)));
    if (paraIdx === -1) return { error: "Could not map selection to markdown. Try a shorter or more precise phrase." };
    let offset = 0;
    for (let j = 0; j < paraIdx; j++) offset += paras[j].length + 2;
    start = offset;
    end = offset + paras[paraIdx].length;
    partial = true;
  }
  return {
    selected: found.section.slice(start, end),
    partial,
    merge: (replacement) => {
      const updated = found.section.slice(0, start) + replacement + found.section.slice(end);
      return [found.before, updated, found.after].filter(Boolean).join("\n");
    },
  };
}
