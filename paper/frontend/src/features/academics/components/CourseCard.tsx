"use client";

import { useState } from "react";
import confetti from "canvas-confetti";
import { cn } from "@/lib/cn";
import { normalizeTopicKey, pct, topicNotesHref, unitIdOf } from "../lib/topics";
import type { SyllabusCourse, SyllabusUnit, TeacherNote } from "../types";
import styles from "../academics.module.css";
import { Glyph } from "./Glyph";
import { TopicRow } from "./TopicRow";

export interface TopicState {
  devMode: boolean;
  stream: string | null | undefined;
  completed: Set<string>;
  wishlisted: Set<string>;
  ratings: Map<string, number>;
  labx: Map<string, boolean>;
  unitBlink: Map<string, boolean>;
  /** Toggles completion; returns true when the topic became completed. */
  onToggleTopic: (topicId: string) => boolean;
  onToggleWishlist: (topicId: string) => void;
  canUseAction: (action: string, consume?: boolean) => Promise<boolean>;
}

const topicKey = (id: string | null | undefined) => id ?? "";

function countDone(units: SyllabusUnit[], completed: Set<string>) {
  let done = 0;
  let total = 0;
  for (const u of units) {
    for (const t of u.topics || []) {
      total++;
      if (completed.has(topicKey(t.id))) done++;
    }
  }
  return { done, total };
}

function UnitItem({ course, unit, state }: { course: SyllabusCourse; unit: SyllabusUnit; state: TopicState }) {
  const [open, setOpen] = useState(false);
  const unitId = unitIdOf(unit);
  const topics = unit.topics || [];
  const { done, total } = countDone([unit], state.completed);
  const complete = total > 0 && done >= total;
  const hasImage = Array.isArray(unit.topics) && unit.topics.some((t) => (t.image_url || "").trim() !== "");
  const hasBlink = unitId ? state.unitBlink.get(unitId) === true : false;
  const unitTitle = unit.unit_title || unit.title || "Unit";

  const openBlink = async () => {
    if (!unitId) return;
    const ok = await state.canUseAction("blink_view", false);
    if (!ok) return;
    const url = `/syllabus_blink.html?unit_id=${encodeURIComponent(unitId)}&course_title=${encodeURIComponent(course.title || "")}&unit_title=${encodeURIComponent(unit.unit_title || unit.title || "")}`;
    window.open(url, "_blank", "noopener");
  };

  return (
    <div className="rounded-xl ring-1 ring-black/5 dark:ring-white/10 bg-white/70 dark:bg-brand-900/40">
      <div className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/60 dark:hover:bg-brand-900/30 transition-colors">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex-1 text-left flex items-center gap-2 text-sm font-medium"
        >
          <Glyph name="expand_more" className={cn("text-neutral-500 transition-transform duration-200", open ? "rotate-0" : "-rotate-90")} />
          <span className={cn(complete && "line-through opacity-60")}>{unitTitle}</span>
        </button>
        {hasImage || hasBlink ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              void openBlink();
            }}
            className="ml-3 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-brand-500 via-[#B06AB3] to-[#FF7FD1] px-4 py-1.5 text-[11px] font-semibold text-white shadow-[0_10px_28px_rgba(158,75,138,0.35)] hover:shadow-[0_14px_34px_rgba(158,75,138,0.45)] transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Glyph name="bolt" className="text-sm" />
            Blink
          </button>
        ) : null}
      </div>
      <div className="px-4 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-36 h-2 rounded bg-black/5 dark:bg-white/10 overflow-hidden" aria-label="Unit progress">
            <div className="h-full bg-emerald-500 transition-all" style={{ width: `${pct(done, total)}%` }} />
          </div>
          <span className="text-[11px] text-neutral-600 dark:text-white/60">
            {done}/{total}
          </span>
        </div>
        <ul className={cn("space-y-0.5 text-sm leading-tight", !open && "hidden")}>
          {topics.map((t, i) => {
            const id = topicKey(t.id);
            const key = normalizeTopicKey(t.topic);
            return (
              <TopicRow
                key={`${id}-${i}`}
                topic={t}
                href={topicNotesHref(course, t.topic, state.devMode, state.stream)}
                checked={state.completed.has(id)}
                wishlisted={state.wishlisted.has(id)}
                rating={t.id ? state.ratings.get(t.id) : undefined}
                hasLabX={Boolean(key) && state.labx.has(key)}
                onToggle={() => state.onToggleTopic(id)}
                onWishlist={() => state.onToggleWishlist(id)}
              />
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function TeacherNotesCard({ notes }: { notes: TeacherNote[] }) {
  return (
    <div className="rounded-xl ring-1 ring-brand-500/20 bg-brand-500/5 dark:bg-brand-900/40 overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between text-sm font-semibold text-brand-700 dark:text-brandlt-200 bg-brand-500/10 dark:bg-brand-500/20">
        <span className="inline-flex items-center gap-2">
          <Glyph name="library_books" className="text-base" />
          Teacher Notes
        </span>
        <span className="text-[11px] font-medium">{`${notes.length} file${notes.length === 1 ? "" : "s"}`}</span>
      </div>
      <div className="px-4 pb-4">
        <ul className="divide-y divide-black/5 dark:divide-white/10">
          {notes.map((note) => {
            const price = Number(note.price_cents || 0);
            const priceLabel = price > 0 ? `Rs ${(price / 100).toFixed(0)}` : "Free";
            const updated = note.updated_at || note.created_at;
            const date = updated ? new Date(updated).toLocaleDateString() : "";
            return (
              <li key={note.id} className="py-2">
                <a
                  href={`/matketplace/notes/note_detail.html?id=${encodeURIComponent(String(note.id))}`}
                  target="_blank"
                  rel="noopener"
                  className="flex items-center justify-between gap-3 text-sm text-brand-600 dark:text-brand-200 hover:underline"
                >
                  <span className="flex-1">{note.title || "Untitled note"}</span>
                  <span className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-white/60">
                    <span className="px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-700 dark:text-brandlt-200">{priceLabel}</span>
                    {date ? <span>{date}</span> : null}
                    <span>{note.seller?.name || "Teacher"}</span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export interface CourseCardProps {
  course: SyllabusCourse;
  expanded: boolean;
  onHeaderClick: () => void;
  notes: TeacherNote[];
  state: TopicState;
}

/** A subject: header with progress, then its units (and teacher notes) when expanded. */
export function CourseCard({ course, expanded, onHeaderClick, notes, state }: CourseCardProps) {
  const [celebrate, setCelebrate] = useState(false);
  const units = course.units || [];
  const { done, total } = countDone(units, state.completed);

  // Confetti when the last topic of the subject gets ticked.
  const courseState: TopicState = {
    ...state,
    onToggleTopic: (id) => {
      const willCheck = state.onToggleTopic(id);
      const doneAfter = done + (willCheck ? 1 : -1);
      if (willCheck && total > 0 && doneAfter >= total) {
        void confetti({ particleCount: 120, spread: 80, origin: { y: 0.7 }, colors: ["#9E4B8A", "#B06AB3", "#FF7FD1", "#10b981", "#f59e0b"] });
        setCelebrate(true);
      }
      return willCheck;
    },
  };

  return (
    <div
      className={cn(
        styles.courseCard,
        "rounded-2xl ring-1 ring-black/5 dark:ring-white/10 bg-white/80 dark:bg-brand-900/55 backdrop-blur overflow-hidden group",
        celebrate && styles.celebratePulse,
      )}
    >
      <div
        role="button"
        tabIndex={-1}
        aria-expanded={expanded}
        onClick={onHeaderClick}
        className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-white/70 dark:hover:bg-brand-900/40 transition-colors"
      >
        <div className="flex items-center gap-3 font-semibold text-sm md:text-base">
          <Glyph name="expand_more" className={cn("text-neutral-500 transition-transform duration-200", expanded ? "rotate-0" : "-rotate-90")} />
          <span className="hidden md:inline text-brand-600 dark:text-brand-400">{course.course_code}</span>
          <span className="hidden md:inline opacity-40">•</span>
          <span className={styles.courseTitle}>{course.title}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:block w-40 h-2 rounded bg-black/5 dark:bg-white/10 overflow-hidden" aria-label="Course progress">
            <div className="h-full bg-brand-500 transition-all" style={{ width: `${pct(done, total)}%` }} />
          </div>
          <span className="text-[11px] rounded-full ring-1 ring-black/10 dark:ring-white/15 px-2 py-0.5">
            <span>
              {done}/{total}
            </span>
          </span>
          <span className="hidden md:inline text-[11px] rounded-full ring-1 ring-black/10 dark:ring-white/15 px-2 py-0.5">Sem {course.semester}</span>
        </div>
      </div>
      <div className={cn("p-5 grid gap-4", !expanded && "hidden")}>
        {units.map((u, i) => (
          <UnitItem key={unitIdOf(u) ?? i} course={course} unit={u} state={courseState} />
        ))}
        {notes.length ? <TeacherNotesCard notes={notes} /> : null}
      </div>
      <div className={cn(styles.courseTooltip, "hidden md:block")}>{`Progress: ${done}/${total} topics`}</div>
    </div>
  );
}
