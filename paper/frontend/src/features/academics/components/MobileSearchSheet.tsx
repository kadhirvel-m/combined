"use client";

import { cn } from "@/lib/cn";
import type { useTopicSuggestions } from "../hooks/useTopicSuggestions";
import styles from "../academics.module.css";
import { Glyph } from "./Glyph";
import { SuggestionsDropdown } from "./SuggestionsDropdown";

type Suggestions = ReturnType<typeof useTopicSuggestions>;

/**
 * Mobile bottom sheet with the notes search. Its dark-mode background classes
 * were dead in the original, so it stays white there too.
 */
export function MobileSearchSheet({ open, onClose, search }: { open: boolean; onClose: () => void; search: Suggestions }) {
  const { setInputEl, value, onChange, onKeyDown, onFocus, blur } = search;
  return (
    <>
      <div
        className={cn(styles.sheetBackdrop, open && styles.sheetBackdropActive)}
        onClick={() => {
          onClose();
          blur();
        }}
      />
      <div className={cn(styles.sheet, open && styles.sheetOpen, "bg-white shadow-2xl md:hidden")} aria-hidden={!open}>
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-neutral-300" />
        </div>
        <div className="px-5 pb-6">
          <div className="relative">
            <Glyph
              name="search"
              className="pointer-events-none select-none absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-neutral-500 dark:text-white/55"
            />
            <input
              ref={setInputEl}
              type="text"
              value={value}
              onChange={onChange}
              onKeyDown={onKeyDown}
              onFocus={onFocus}
              placeholder="Search topics & notes…"
              style={{ paddingLeft: "4rem" }}
              className="w-full rounded-2xl pr-4 py-3.5 outline-none ring-1 ring-black/10 dark:ring-white/15 bg-neutral-50 dark:bg-white/5 text-neutral-900 dark:text-white placeholder:text-neutral-500 dark:placeholder:text-white/50 focus:ring-2 focus:ring-brand-500 transition text-base"
            />
          </div>
          <SuggestionsDropdown
            search={search}
            className="mt-2 rounded-xl overflow-hidden ring-1 ring-black/10 dark:ring-white/15 bg-white/95 shadow-lg"
            listClassName="overflow-auto py-1"
          />
        </div>
      </div>
    </>
  );
}
