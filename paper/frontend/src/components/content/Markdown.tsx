"use client";

import { useEffect, useRef, useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import renderMathInElement from "katex/contrib/auto-render";
import hljs from "highlight.js/lib/common";
import "katex/dist/katex.min.css";
import { cn } from "@/lib/cn";

export interface MarkdownProps {
  /** Markdown source (GitHub-flavoured, with $…$ / $$…$$ / \(…\) / \[…\] math). */
  content: string;
  className?: string;
  /** Apply Tailwind typography (`prose`) styles. Default true. */
  prose?: boolean;
  /** Syntax-highlight fenced code blocks. Default true. */
  highlight?: boolean;
  /** Called after the HTML is rendered and math/code are processed. */
  onRendered?: (root: HTMLDivElement) => void;
}

const MATH_DELIMITERS = [
  { left: "$$", right: "$$", display: true },
  { left: "\\[", right: "\\]", display: true },
  { left: "\\(", right: "\\)", display: false },
  { left: "$", right: "$", display: false },
];

/**
 * Protect math from the Markdown parser (so `_` / `*` inside formulas are not
 * turned into emphasis), then restore it for KaTeX auto-render.
 */
function protectMath(src: string): { text: string; restore: (html: string) => string } {
  const stash: string[] = [];
  const text = src.replace(/(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|(?<![\\$])\$(?!\s)[^$\n]+?(?<!\s)\$(?!\d))/g, (m) => {
    stash.push(m);
    return `\u0000MATH${stash.length - 1}\u0000`;
  });
  const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return {
    text,
    restore: (html) => html.replace(/\u0000MATH(\d+)\u0000/g, (_, i) => escapeHtml(stash[Number(i)])),
  };
}

export function renderMarkdownToHtml(content: string): string {
  const { text, restore } = protectMath(content || "");
  const raw = marked.parse(text, { async: false, gfm: true, breaks: false }) as string;
  return DOMPurify.sanitize(restore(raw), { ADD_ATTR: ["target"] });
}

/** Sanitized Markdown with KaTeX math and highlighted code. */
export function Markdown({ content, className, prose = true, highlight = true, onRendered }: MarkdownProps) {
  const ref = useRef<HTMLDivElement>(null);
  // DOMPurify needs a DOM, so the HTML is produced in the browser after mount
  // (the server and the first client render both output an empty container).
  const [html, setHtml] = useState("");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- derived from a browser-only sanitizer
    setHtml(renderMarkdownToHtml(content));
  }, [content]);

  useEffect(() => {
    const root = ref.current;
    if (!root || !html) return;
    try {
      renderMathInElement(root, { delimiters: MATH_DELIMITERS, throwOnError: false, strict: "ignore" });
    } catch {
      /* malformed math stays as text */
    }
    if (highlight) {
      root.querySelectorAll<HTMLElement>("pre code").forEach((block) => {
        if (!block.dataset.highlighted) hljs.highlightElement(block);
      });
    }
    root.querySelectorAll<HTMLAnchorElement>("a[href^='http']").forEach((a) => {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    });
    onRendered?.(root);
  }, [html, highlight, onRendered]);

  return (
    <div
      ref={ref}
      className={cn(
        prose &&
          "prose prose-neutral dark:prose-invert max-w-none prose-headings:scroll-mt-24 prose-pre:bg-neutral-900 prose-pre:text-neutral-100 prose-img:rounded-xl",
        className,
      )}
      data-trusted-html="true"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
