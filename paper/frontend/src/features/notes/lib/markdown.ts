/** Markdown helpers shared by the notes pages (pure string functions). */

/**
 * The original pages rendered with `marked` in `breaks: true` mode (a single
 * newline is a `<br>`). The shared `<Markdown>` uses standard breaks, so the
 * same output is produced by turning soft line breaks into hard ones (two
 * trailing spaces) outside fenced code blocks.
 */
export function withHardBreaks(markdown: string): string {
  const lines = String(markdown || "").split(/\r?\n/);
  let fence: string | null = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const marker = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (marker) {
      if (!fence) fence = marker[1][0];
      else if (marker[1][0] === fence) fence = null;
      continue;
    }
    if (fence) continue;
    const next = lines[i + 1];
    if (!line.trim() || next === undefined || !next.trim()) continue;
    if (/ {2}$|\\$/.test(line)) continue;
    lines[i] = line + "  ";
  }
  return lines.join("\n");
}

export type CourseType = "practical" | "theorey" | "maths" | "";

export function normalizeCourseType(type: unknown): CourseType {
  const v = String(type || "")
    .trim()
    .toLowerCase();
  return v === "practical" || v === "theorey" || v === "maths" ? v : "";
}

/** Practical topics always get a "## Working" section; one is appended when the model left it out. */
export function ensureWorkingSection(markdown: string | undefined, topic: string, courseType: string): string {
  if (normalizeCourseType(courseType) !== "practical") return markdown || "";
  const text = markdown || "";
  if (/^##\s*working\b/imu.test(text)) return text;
  const trimmed = text.trim();
  const working = [
    "## Working",
    `1. Prepare the required setup and apparatus for ${topic || "this experiment"}.`,
    "2. Configure the environment and verify all safety constraints.",
    "3. Execute each step of the procedure methodically, capturing observations.",
    "4. Record measurements/results with units after every key action.",
    "5. Analyze the observations to derive the outcome, then clean up the setup.",
  ].join("\n");
  if (!trimmed) return working + "\n";
  return `${trimmed}\n\n${working}\n`;
}

/** Heading id used by the table of contents. */
export function slugifyHeading(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

/** Collapses whitespace and cuts at `maxLen` with an ellipsis. */
export function truncateText(text: string, maxLen: number): string {
  const clean = String(text || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!clean) return "";
  if (clean.length <= maxLen) return clean;
  return `${clean.slice(0, maxLen).trim()}...`;
}

/** First level-1 heading of a markdown document (plain text, best effort). */
export function firstHeading(markdown: string): string {
  const match = String(markdown || "").match(/^#\s+(.+?)\s*#*\s*$/m);
  return match ? match[1].replace(/[*_`]/g, "").trim() : "";
}

export function safeFileName(name: string): string {
  return (name || "notes").toLowerCase().replace(/[^a-z0-9_.-]+/g, "_");
}

/* ------------------------------------------------------------------ */
/* Maths notes: make LLM-written LaTeX survive the markdown parser.    */
/* ------------------------------------------------------------------ */

/** Common LLM typo: `\ ` instead of `\\` between rows of matrix-like environments. */
function fixMatrixRowSeparators(mathText: string): string {
  const envs = "(?:matrix|pmatrix|bmatrix|vmatrix|Vmatrix|cases|array)";
  const envRe = new RegExp("\\\\begin\\{(" + envs + ")\\}([\\s\\S]*?)\\\\end\\{\\1\\}", "g");
  return String(mathText || "").replace(envRe, (_full, env: string, body: string) => {
    const fixedBody = String(body || "").replace(/\\(?=\s)/g, "\\\\");
    return `\\begin{${env}}${fixedBody}\\end{${env}}`;
  });
}

/** Puts every `$$ … $$` block on one line so line breaks never split a formula. */
function normalizeMathBlocks(markdown: string): string {
  const lines = String(markdown || "").split(/\r?\n/);
  const out: string[] = [];
  let inBlock = false;
  let buf: string[] = [];
  const flushAsBlock = () => {
    const content = fixMatrixRowSeparators(buf.join(" ").replace(/\s+/g, " ").trim());
    out.push("$$ " + content + " $$");
    buf = [];
  };
  for (let line of lines) {
    for (;;) {
      const idx = line.indexOf("$$");
      if (idx === -1) {
        if (!inBlock) out.push(line);
        else buf.push(line);
        break;
      }
      const before = line.slice(0, idx);
      const after = line.slice(idx + 2);
      if (!inBlock) {
        if (before.trim()) out.push(before);
        inBlock = true;
      } else {
        if (before) buf.push(before);
        flushAsBlock();
        inBlock = false;
      }
      line = after;
    }
  }
  // Unclosed block: keep the original text rather than dropping it.
  if (inBlock) {
    out.push("$$");
    out.push(...buf);
  }
  return out.join("\n");
}

/** Models sometimes put results in blockquotes (`> Since $2k^2 = 1$ …`); drop the quote marker on math lines. */
function unquoteMathLines(markdown: string): string {
  return String(markdown || "")
    .split(/\r?\n/)
    .map((line) => {
      const quoted = line.match(/^(\s*>\s*)(.*)/);
      if (!quoted) return line;
      const content = quoted[2];
      return /\$[^$]+\$/.test(content) || /\\\(/.test(content) || /\\\[/.test(content) ? content : line;
    })
    .join("\n");
}

/**
 * Math-friendly markdown for the maths notes page.
 *
 * The original also doubled `\\` inside math so the row separator survived
 * marked's backslash unescaping. `<Markdown>` protects math from the parser,
 * which makes that step unnecessary (and harmful), so it is not ported.
 */
export function prepareMathMarkdown(markdown: string): string {
  return normalizeMathBlocks(unquoteMathLines(markdown));
}
