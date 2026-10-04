"use client";

import { useEffect, useRef, useState } from "react";
import { courseKeyOf } from "../lib/topics";
import { consumedSubjectsKey, loadDailySet, persistDailySet } from "../lib/storage";
import type { useTopicSuggestions } from "../hooks/useTopicSuggestions";
import type { SyllabusBundle } from "../types";
import { CourseCard, type TopicState } from "./CourseCard";
import { Glyph } from "./Glyph";
import { SuggestionsDropdown } from "./SuggestionsDropdown";

type Suggestions = ReturnType<typeof useTopicSuggestions>;

export interface SyllabusExplorerProps {
  bundle: SyllabusBundle | null;
  search: Suggestions;
  /** Below 768px, focusing the search box opens the bottom sheet instead. */
  onMobileSearchFocus: () => void;
  progressError: string;
  empty: boolean;
  state: Omit<TopicState, "ratings" | "labx" | "unitBlink">;
}

const pillBtn = "items-center gap-2 rounded-full ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5 transition";

/** "Syllabus Explorer": search, expand/collapse all, and the subject → unit → topic tree. */
export function SyllabusExplorer({ bundle, search, onMobileSearchFocus, progressError, empty, state }: SyllabusExplorerProps) {
  const { setInputEl, value, onChange, onKeyDown, onFocus } = search;
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set());
  const [allExpanded, setAllExpanded] = useState(false);
  const consumed = useRef<{ key: string; ids: Set<string> } | null>(null);
  const courses = bundle?.courses ?? [];

  // A fresh render of the syllabus starts collapsed.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset when a new syllabus arrives
    setExpanded(new Set());
  }, [bundle]);

  const consumedIds = () => {
    if (!consumed.current) {
      const key = consumedSubjectsKey();
      consumed.current = { key, ids: loadDailySet(key) };
    }
    return consumed.current;
  };

  /** Course header click: toggle, and charge `subject_open` the first time a subject opens today. */
  const onHeaderClick = async (index: number, isExpanded: boolean) => {
    const wasCollapsed = !isExpanded;
    setExpanded((prev) => {
      const next = new Set(prev);
      if (wasCollapsed) next.add(index);
      else next.delete(index);
      return next;
    });
    const courseKey = courseKeyOf(courses[index]);
    const store = consumedIds();
    if (wasCollapsed && courseKey && !store.ids.has(courseKey)) {
      const ok = await state.canUseAction("subject_open", true);
      if (!ok) {
        setExpanded((prev) => {
          const next = new Set(prev);
          next.delete(index);
          return next;
        });
        return;
      }
      store.ids.add(courseKey);
      persistDailySet(store.key, store.ids);
    }
  };

  const toggleAll = () => {
    const target = !allExpanded;
    courses.forEach((_, i) => {
      const isExpanded = expanded.has(i);
      if (isExpanded !== target) void onHeaderClick(i, isExpanded);
    });
    setAllExpanded(target);
  };

  const toggleIcon = allExpanded ? "unfold_less" : "unfold_more";
  const toggleText = allExpanded ? "Collapse All" : "Expand All";
  const topicState: TopicState = {
    ...state,
    ratings: bundle?.ratings ?? new Map(),
    labx: bundle?.labx ?? new Map(),
    unitBlink: bundle?.unitBlink ?? new Map(),
  };

  return (
    <section className="relative py-6 md:py-16 border-t border-black/5 dark:border-white/10">
      <div className="container">
        <header className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="flex items-center justify-between w-full md:w-auto md:block">
            <div>
              <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight inline-block">Syllabus Explorer</h3>
              <p className="hidden md:block mt-2 text-neutral-600 dark:text-white/70 max-w-xl">
                Expand courses to track unit mastery. Toggle topics as you complete them to update progress instantly.
              </p>
            </div>
            <button type="button" onClick={toggleAll} className={`md:hidden inline-flex px-3 py-1.5 text-xs font-medium ${pillBtn}`}>
              <Glyph name={toggleIcon} className="text-sm" />
              <span>{toggleText}</span>
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full md:w-auto">
              <div className="relative">
                <Glyph
                  name="search"
                  className="pointer-events-none select-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-base"
                />
                <input
                  ref={setInputEl}
                  type="text"
                  value={value}
                  onChange={onChange}
                  onKeyDown={onKeyDown}
                  onFocus={(e) => {
                    if (window.innerWidth < 768) {
                      e.preventDefault();
                      e.currentTarget.blur();
                      onMobileSearchFocus();
                    }
                    onFocus();
                  }}
                  placeholder="Search topics & notes…"
                  style={{ paddingLeft: "4rem" }}
                  className="pr-3 py-2 text-sm rounded-full ring-1 ring-black/10 dark:ring-white/15 bg-white/70 dark:bg-brand-900/40 focus:outline-none focus:ring-2 focus:ring-brand-500 w-full md:w-64 transition shadow-sm"
                />
              </div>
              <SuggestionsDropdown
                search={search}
                className="absolute left-0 right-0 top-full mt-2 rounded-xl overflow-hidden ring-1 ring-black/10 dark:ring-white/15 bg-white/95 backdrop-blur-xl shadow-lg z-50"
                listClassName="max-h-48 overflow-auto py-1"
              />
            </div>
            <button type="button" onClick={toggleAll} className={`hidden md:inline-flex px-4 py-2 text-sm font-medium ${pillBtn}`}>
              <Glyph name={toggleIcon} className="text-base" />
              <span>{toggleText}</span>
            </button>
          </div>
        </header>

        {progressError ? <div className="text-sm text-red-500 dark:text-red-300 mb-4">{progressError}</div> : null}
        <div className="grid gap-6">
          {courses.map((course, i) => {
            const key = courseKeyOf(course);
            const isExpanded = expanded.has(i);
            return (
              <CourseCard
                key={key ?? i}
                course={course}
                expanded={isExpanded}
                onHeaderClick={() => void onHeaderClick(i, isExpanded)}
                notes={key ? (bundle?.teacherNotes.get(key) ?? []) : []}
                state={topicState}
              />
            );
          })}
        </div>
        {empty ? <div className="text-sm text-neutral-600 dark:text-white/60 mt-6">No syllabus found for your batch / semester yet.</div> : null}
      </div>
    </section>
  );
}
