/**
 * Post-processing of the rendered notes HTML.
 *
 * `<Markdown>` owns the HTML (sanitized markdown); these helpers decorate that
 * opaque subtree through the element it hands to `onRendered`: citation pills,
 * the citations list, link targets, heading ids and Mermaid diagrams. React
 * never reconciles this subtree, so the mutations are safe.
 */

import { slugifyHeading } from "./markdown";
import type { TocItem } from "../types";
import type { OutputDecoratorContext } from "../config";

export interface OutputClassNames {
  citationPill: string;
  citationsList: string;
  citationItem: string;
}

/** Reads the `## CITATIONS` section of the markdown into a `label → url` map. */
export function parseCitationsFromMarkdown(markdown: string): Record<string, string> {
  const map: Record<string, string> = {};
  if (!markdown) return map;
  const secMatch = markdown.match(/^##\s*CITATIONS\b[\s\S]*$/im);
  if (!secMatch) return map;
  const startIdx = secMatch.index || 0;
  const after = markdown.slice(startIdx + secMatch[0].split("\n")[0].length);
  const nextHeaderIdx = after.search(/^##\s+/m);
  const secBody = nextHeaderIdx >= 0 ? after.slice(0, nextHeaderIdx) : after;
  const urlRe = /(https?:\/\/[^\s)\]]+)/i;
  for (const line of secBody.split(/\n+/)) {
    const m1 = line.match(/\[\s*([A-Za-z0-9_-]{2,20})\s*\][^\n]*?(https?:\/\/[^\s)\]]+)/i);
    if (m1) {
      map[m1[1].trim()] = m1[2].trim();
      continue;
    }
    const m2 = line.match(/^\s*[-*]?\s*([A-Za-z0-9_-]{2,20})\s*[:\-–—]\s*(https?:\/\/\S+)/i);
    if (m2) {
      map[m2[1].trim()] = m2[2].trim();
      continue;
    }
    const m3 = line.match(urlRe);
    if (m3) {
      try {
        const host = new URL(m3[1]).hostname.replace(/^www\./, "");
        const guess = host.split(".")[0];
        if (guess && !map[guess]) map[guess] = m3[1];
      } catch {
        /* not a URL */
      }
    }
  }
  return map;
}

function findCitationsHeading(root: HTMLElement): HTMLHeadingElement | null {
  for (const h of Array.from(root.querySelectorAll("h2"))) {
    if ((h.textContent || "").trim().toUpperCase() === "CITATIONS") return h;
  }
  return null;
}

/** Turns inline `[LABEL]` / `[A, B]` references into favicon pills linking to the source. */
function applyCitationPills(root: HTMLElement, citations: Record<string, string>, classNames: OutputClassNames): void {
  if (!Object.keys(citations).length) return;

  const heading = findCitationsHeading(root);
  if (heading) {
    heading.setAttribute("data-citations-section", "1");
    let cur = heading.nextSibling;
    while (cur) {
      if (cur.nodeType === 1 && /^(H1|H2)$/i.test(cur.nodeName)) break;
      if (cur.nodeType === 1) (cur as Element).setAttribute("data-citations-section", "1");
      cur = cur.nextSibling;
    }
  }

  const isExcluded = (node: Node): boolean => {
    let n = node.parentNode;
    while (n && n !== root) {
      if (n.nodeType === 1) {
        const el = n as Element;
        if (el.hasAttribute("data-citations-section")) return true;
        if (["PRE", "CODE", "SCRIPT", "STYLE", "A"].includes(el.nodeName)) return true;
      }
      n = n.parentNode;
    }
    return false;
  };

  const pattern = /\[([^\[\]]+)\]/g;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    if (!node.nodeValue || node.nodeValue.indexOf("[") === -1) continue;
    if (isExcluded(node)) continue;
    textNodes.push(node);
  }

  for (const node of textNodes) {
    const text = node.nodeValue || "";
    pattern.lastIndex = 0;
    let lastIdx = 0;
    let replaced = false;
    const frag = document.createDocumentFragment();
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(text))) {
      const valid = m[1]
        .split(",")
        .map((s) => s.trim())
        .filter((label) => label && citations[label]);
      if (!valid.length) continue;
      if (m.index > lastIdx) frag.appendChild(document.createTextNode(text.slice(lastIdx, m.index)));
      valid.forEach((label, idx) => {
        const href = citations[label];
        let host = "";
        try {
          host = new URL(href).hostname.replace(/^www\./, "");
        } catch {
          /* keep empty */
        }
        const a = document.createElement("a");
        if (href) a.href = href;
        a.target = "_blank";
        a.rel = "noopener";
        a.className = classNames.citationPill;
        a.title = href || "";
        const img = document.createElement("img");
        img.alt = "";
        img.loading = "lazy";
        img.referrerPolicy = "no-referrer";
        if (host) img.src = `https://www.google.com/s2/favicons?domain=${host}&sz=32`;
        a.appendChild(img);
        const span = document.createElement("span");
        span.textContent = label;
        a.appendChild(span);
        frag.appendChild(a);
        if (idx !== valid.length - 1) frag.appendChild(document.createTextNode(" "));
      });
      lastIdx = pattern.lastIndex;
      replaced = true;
    }
    if (replaced) {
      if (lastIdx < text.length) frag.appendChild(document.createTextNode(text.slice(lastIdx)));
      node.parentNode?.replaceChild(frag, node);
    }
  }
}

/** Replaces the body of the CITATIONS section with one clickable line per source. */
function renderCitationsSection(root: HTMLElement, citations: Record<string, string>, classNames: OutputClassNames): void {
  const labels = Object.keys(citations);
  if (!labels.length) return;
  const heading = findCitationsHeading(root);
  if (!heading) return;

  const toRemove: ChildNode[] = [];
  let cur = heading.nextSibling;
  while (cur) {
    if (cur.nodeType === 1 && /^(H1|H2)$/i.test(cur.nodeName)) break;
    toRemove.push(cur);
    cur = cur.nextSibling;
  }
  toRemove.forEach((n) => n.parentNode?.removeChild(n));

  const wrap = document.createElement("div");
  wrap.className = classNames.citationsList;
  for (const label of labels) {
    const href = citations[label];
    const a = document.createElement("a");
    a.className = classNames.citationItem;
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.title = href;
    a.textContent = `${label} — ${href}`;
    wrap.appendChild(a);
  }
  heading.insertAdjacentElement("afterend", wrap);
}

function openLinksInNewTab(root: HTMLElement): void {
  root.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((a) => {
    a.target = "_blank";
    a.rel = "noopener noreferrer";
  });
}

/** Gives h1–h3 stable ids and returns the table of contents. */
function collectToc(root: HTMLElement): TocItem[] {
  const items: TocItem[] = [];
  root.querySelectorAll<HTMLHeadingElement>("h1, h2, h3").forEach((h) => {
    const level = h.tagName === "H1" ? 1 : h.tagName === "H2" ? 2 : 3;
    const id = h.id || slugifyHeading(h.textContent || "");
    h.id = id;
    items.push({ id, text: h.textContent || "", level });
  });
  return items;
}

interface MermaidApi {
  initialize: (config: Record<string, unknown>) => void;
  render: (id: string, text: string) => Promise<{ svg: string }>;
}

let mermaidPromise: Promise<MermaidApi | null> | null = null;
const MERMAID_URL = "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs";

/** Mermaid is not a project dependency; like the original it is fetched on demand from the CDN. */
function loadMermaid(): Promise<MermaidApi | null> {
  if (!mermaidPromise) {
    mermaidPromise = import(/* webpackIgnore: true */ /* turbopackIgnore: true */ MERMAID_URL)
      .then((mod: { default?: MermaidApi }) => {
        const mermaid = mod.default ?? null;
        mermaid?.initialize({ startOnLoad: false, theme: "default" });
        return mermaid;
      })
      .catch(() => null);
  }
  return mermaidPromise;
}

/** Swaps ```mermaid code blocks for the rendered diagram. */
function renderMermaidBlocks(root: HTMLElement): void {
  const blocks = Array.from(root.querySelectorAll<HTMLElement>("code.language-mermaid"));
  blocks.forEach((codeEl, i) => {
    const source = codeEl.textContent || "";
    const container = document.createElement("div");
    container.className = "my-4";
    (codeEl.closest("pre") || codeEl).replaceWith(container);
    void loadMermaid().then(async (mermaid) => {
      if (!mermaid || !container.isConnected) return;
      try {
        const { svg } = await mermaid.render(`mmd-${i}-${Date.now()}`, source);
        if (!container.isConnected) return;
        const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
        const node = doc.documentElement;
        if (node && node.nodeName.toLowerCase() === "svg") container.replaceChildren(document.importNode(node, true));
      } catch {
        /* invalid diagram: leave the placeholder empty, like the original */
      }
    });
  });
}

export interface DecorateOptions {
  markdown: string;
  classNames: OutputClassNames;
  context: OutputDecoratorContext;
  extra?: (root: HTMLElement, context: OutputDecoratorContext) => void;
}

/** Runs every decorator on the freshly rendered notes and returns the TOC and title. */
export function decorateNotesOutput(root: HTMLElement, options: DecorateOptions): { toc: TocItem[]; title: string } {
  const safely = (fn: () => void) => {
    try {
      fn();
    } catch {
      /* one broken decorator must not block the others */
    }
  };
  safely(() => renderMermaidBlocks(root));
  const citations = parseCitationsFromMarkdown(options.markdown);
  safely(() => applyCitationPills(root, citations, options.classNames));
  safely(() => renderCitationsSection(root, citations, options.classNames));
  safely(() => openLinksInNewTab(root));
  let toc: TocItem[] = [];
  safely(() => {
    toc = collectToc(root);
  });
  if (options.extra) safely(() => options.extra?.(root, options.context));
  return { toc, title: (root.querySelector("h1")?.textContent || "").trim() };
}

/* ------------------------------------------------------------------ */
/* Maths notes decorators                                              */
/* ------------------------------------------------------------------ */

/**
 * Blockquotes that still hold math (a quote marker the pre-processing could
 * not remove) are shown as plain result blocks instead of quotes.
 */
function unwrapMathBlockquotes(root: HTMLElement): void {
  root.querySelectorAll("blockquote").forEach((bq) => {
    const raw = bq.textContent || "";
    if (!bq.querySelector(".katex") && !/\$[^$]+\$/.test(raw) && !/\*\*[^*]+\*\*/.test(raw)) return;
    const div = document.createElement("div");
    div.className = "math-result-block";
    div.append(...Array.from(bq.childNodes));
    bq.replaceWith(div);
  });
}

/** Items under a "Practice Problem(s)" heading open their worked solution in a new tab. */
function makePracticeProblemsClickable(root: HTMLElement, context: OutputDecoratorContext): void {
  let heading: HTMLHeadingElement | null = null;
  for (const h of Array.from(root.querySelectorAll("h2"))) {
    if ((h.textContent || "").trim().toLowerCase().includes("practice problem")) {
      heading = h;
      break;
    }
  }
  if (!heading) return;

  const items: HTMLElement[] = [];
  let cur = heading.nextElementSibling;
  while (cur) {
    if (/^(H1|H2)$/i.test(cur.nodeName)) break;
    if (cur.nodeName === "OL" || cur.nodeName === "UL") cur.querySelectorAll<HTMLElement>("li").forEach((li) => items.push(li));
    else if (cur.nodeName === "P") items.push(cur as HTMLElement);
    cur = cur.nextElementSibling;
  }

  for (const el of items) {
    const question = (el.textContent || "").trim();
    if (!question) continue;
    Object.assign(el.style, {
      cursor: "pointer",
      color: "var(--brand-700, #6d28d9)",
      textDecoration: "underline",
      textDecorationStyle: "dashed",
      textUnderlineOffset: "3px",
      transition: "color 0.2s ease, background 0.2s ease",
      borderRadius: "6px",
      padding: "4px 6px",
    });
    el.title = "Click to view solution";

    const badge = document.createElement("span");
    badge.className = "px-icon";
    badge.textContent = "open_in_new";
    Object.assign(badge.style, {
      fontSize: "14px",
      marginLeft: "6px",
      verticalAlign: "middle",
      opacity: "0.6",
      fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
    });
    el.appendChild(badge);

    el.addEventListener("mouseenter", () => {
      el.style.background = "var(--brand-soft, rgba(109,40,217,0.08))";
    });
    el.addEventListener("mouseleave", () => {
      el.style.background = "transparent";
    });
    el.addEventListener("click", (e) => {
      e.preventDefault();
      window.open(`${context.pageFile}?solve=${encodeURIComponent(question)}`, "_blank");
    });
  }
}

/** `decorateOutput` for the maths notes page. */
export function decorateMathsOutput(root: HTMLElement, context: OutputDecoratorContext): void {
  unwrapMathBlockquotes(root);
  makePracticeProblemsClickable(root, context);
}
