"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { searchTopics } from "../api";
import type { TopicSuggestion } from "../types";
import styles from "../syllabus.module.css";

const DEBOUNCE_MS = 150;
const BLUR_HIDE_MS = 120;

function suggestionTopic(item: TopicSuggestion | undefined): string {
  return item && item.topic ? String(item.topic) : "";
}

export interface TopicInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
}

/**
 * A topic title field with AI-notes topic suggestions (`GET
 * /api/notes/topics/search`, debounced, previous request aborted): pick with
 * the mouse or ArrowUp/ArrowDown + Enter (Enter then doesn't submit the
 * form), Escape/blur/outside click hide the list.
 */
export function TopicInput({ id, value, onChange }: TopicInputProps) {
  const [items, setItems] = useState<TopicSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const aborter = useRef<AbortController | null>(null);

  const hide = () => {
    setOpen(false);
    setActive(-1);
  };

  const show = (next: TopicSuggestion[]) => {
    setItems(next);
    setActive(-1);
    setOpen(next.length > 0);
  };

  // Outside clicks hide the list; timers and requests stop with the row.
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (target && (listRef.current?.contains(target) || target === inputRef.current)) return;
      setOpen(false);
      setActive(-1);
    };
    document.addEventListener("click", onDocClick);
    return () => {
      document.removeEventListener("click", onDocClick);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      if (blurTimer.current) clearTimeout(blurTimer.current);
      aborter.current?.abort();
    };
  }, []);

  // Keep the highlighted suggestion visible.
  useEffect(() => {
    if (active < 0) return;
    try {
      itemRefs.current[active]?.scrollIntoView({ block: "nearest" });
    } catch {}
  }, [active]);

  const lookup = async (q: string) => {
    if (!q) {
      show([]);
      return;
    }
    aborter.current?.abort();
    const controller = new AbortController();
    aborter.current = controller;
    try {
      show(await searchTopics(q, controller.signal));
    } catch (e) {
      if (String((e as { name?: unknown } | null)?.name) === "AbortError") return;
      console.error(e);
      show([]);
    }
  };

  const handleChange = (next: string) => {
    onChange(next);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => void lookup(next.trim()), DEBOUNCE_MS);
  };

  const choose = (index: number) => {
    const topic = suggestionTopic(items[index]);
    if (!topic) return;
    onChange(topic);
    hide();
  };

  const moveActive = (next: number) => {
    if (!items.length) return;
    setActive(Math.min(Math.max(next, 0), items.length - 1));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveActive(active + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveActive(active - 1);
    } else if (e.key === "Enter") {
      if (active >= 0 && items.length) {
        e.preventDefault(); // pick the suggestion instead of submitting the unit form
        choose(active);
      }
    } else if (e.key === "Escape") {
      hide();
    }
  };

  const handleBlur = () => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    blurTimer.current = setTimeout(hide, BLUR_HIDE_MS); // late enough for a click on a suggestion
  };

  return (
    <div className="relative flex-1">
      <input
        ref={inputRef}
        type="text"
        id={id}
        placeholder="Topic title"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        maxLength={256}
        autoComplete="off"
        className="w-full rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-white/5 px-3.5 py-2 text-sm text-neutral-900 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
      />
      {/* No dark background: `dark:bg-[#1E1E2F]/95` was missing from the original's stylesheet. */}
      <div
        ref={listRef}
        role="listbox"
        className={cn(
          styles.suggest,
          "absolute left-0 right-0 top-full mt-2 z-50 max-h-56 overflow-auto rounded-2xl border border-black/10 dark:border-white/15 bg-white/95 backdrop-blur p-1 shadow-soft",
          !open && "hidden",
        )}
      >
        {open
          ? items.map((item, idx) => (
              <div
                key={idx}
                ref={(el) => {
                  itemRefs.current[idx] = el;
                }}
                role="option"
                aria-selected={idx === active}
                onMouseDown={(e) => {
                  e.preventDefault(); // fires before the input's blur
                  choose(idx);
                }}
                className={cn(
                  styles.suggestItem,
                  "px-3 py-2 rounded-xl cursor-pointer flex items-center justify-between gap-3 hover:bg-black/5 dark:hover:bg-white/5 transition",
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-neutral-900 dark:text-white truncate">{suggestionTopic(item)}</div>
                  <div className="mt-0.5 text-[11px] text-neutral-500 dark:text-white/50">AI notes</div>
                </div>
                <Icon name="subdirectory_arrow_right" className="text-[18px] text-neutral-500 dark:text-white/55" />
              </div>
            ))
          : null}
      </div>
    </div>
  );
}
