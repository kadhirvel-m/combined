"use client";

import { cn } from "@/lib/cn";
import type { useTopicSuggestions } from "../hooks/useTopicSuggestions";
import styles from "../academics.module.css";
import { Glyph } from "./Glyph";

type Suggestions = ReturnType<typeof useTopicSuggestions>;

/** Notes-topic suggestions list shared by the hero, syllabus and sheet search boxes. */
export function SuggestionsDropdown({
  search,
  className,
  listClassName,
  hero,
}: {
  search: Suggestions;
  className: string;
  listClassName: string;
  /** The hero list gets the original's explicit dark-mode colours. */
  hero?: boolean;
}) {
  const { setWrapEl, setItemEl, open, items, activeIndex, onItemMouseDown } = search;
  return (
    <div ref={setWrapEl} className={cn(className, hero && styles.heroSuggestions, !open && "hidden")}>
      <ul className={cn(listClassName, styles.suggestionsScroll)} role="listbox">
        {items.map((item, idx) => {
          const topic = item && item.topic ? item.topic : "";
          return (
            <li
              key={`${idx}-${topic}`}
              ref={(el) => setItemEl(idx, el)}
              role="option"
              aria-selected={idx === activeIndex ? true : undefined}
              onMouseDown={onItemMouseDown(topic)}
              className={cn(
                styles.suggestionItem,
                "px-4 py-2.5 cursor-pointer flex items-center justify-between gap-3 hover:bg-black/5 dark:hover:bg-white/5 transition border-b border-black/5 dark:border-white/5 last:border-0",
              )}
            >
              <div className="min-w-0 flex-1">
                <div className={cn(styles.suggestionText, "text-sm font-medium text-neutral-900 dark:text-white truncate")}>{topic}</div>
              </div>
              <Glyph name="arrow_outward" className={cn(styles.suggestionIcon, "text-[16px] text-neutral-400 dark:text-white/40")} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
