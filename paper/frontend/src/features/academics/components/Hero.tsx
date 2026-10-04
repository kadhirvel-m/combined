"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { useTopicSuggestions } from "../hooks/useTopicSuggestions";
import type { AcademicProfile, AggregateStats, NamedRef } from "../types";
import styles from "../academics.module.css";
import { Glyph } from "./Glyph";
import { SuggestionsDropdown } from "./SuggestionsDropdown";

type Suggestions = ReturnType<typeof useTopicSuggestions>;

function initials(name: string | null | undefined): string {
  if (!name) return "U";
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "U"
  );
}

/** setText() of the original: null/undefined show "-". */
const text = (value: unknown): string => (value === null || value === undefined ? "-" : String(value));

function refName(value: NamedRef | string | null | undefined): string {
  if (!value) return "-";
  if (typeof value === "string") return value;
  return value.name || "-";
}

const glass = cn(styles.glassPanel, "rounded-2xl p-3 flex flex-col gap-2");
const kpiLabel = "text-[11px] uppercase tracking-wide text-neutral-600 dark:text-white/60";

function KpiCards({ stats }: { stats: AggregateStats | null }) {
  return (
    <div className="mt-5 grid grid-cols-3 gap-4 max-w-md">
      <div className={glass}>
        <p className={kpiLabel}>Topics Done</p>
        <div className="flex items-end gap-2">
          <span className="text-2xl font-extrabold">{stats?.done ?? 0}</span>
          <span className="text-xs text-neutral-500 dark:text-white/50">/ {stats?.total ?? 0}</span>
        </div>
        <div className="h-1 rounded-full bg-brand-500/20 overflow-hidden">
          <div className="h-full w-0 bg-brand-500" style={stats ? { width: `${stats.completion || 0}%` } : undefined} />
        </div>
      </div>
      <div className={glass}>
        <p className={kpiLabel}>Completion</p>
        <div className="relative h-14 w-14">
          <div
            className={cn(styles.metricRing, "absolute inset-0 rounded-full")}
            style={{ "--pct": stats?.completion ?? 0, "--ring-color": "#9E4B8A" } as CSSProperties}
          />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold">{stats?.completion ?? 0}%</div>
        </div>
      </div>
      <div className={glass}>
        <p className={kpiLabel}>Active SUBJECTS</p>
        <div className="text-2xl font-extrabold">{stats?.courses ?? 0}</div>
      </div>
    </div>
  );
}

function ProfileCard({ profile, onEdit }: { profile: AcademicProfile | null; onEdit: () => void }) {
  const p = profile;
  const pill = "px-2 py-1 rounded-full ring-1 ring-black/10 dark:ring-white/15";
  const field = (label: string, value: string) => (
    <div className="flex flex-col gap-1">
      <span className="text-neutral-500 dark:text-white/50">{label}</span>
      <span className="font-medium truncate">{value}</span>
    </div>
  );
  return (
    <div className={cn(styles.glassPanel, "hidden md:block rounded-3xl p-6 md:p-8 space-y-6")}>
      <div className="flex items-start gap-4">
        <div className="relative w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-brand-500/40 bg-brandlt-100 dark:bg-brand-900/40 flex items-center justify-center text-2xl font-bold">
          {p ? initials(p.name) : "U"}
          {p?.profile_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element -- remote avatar from arbitrary hosts
            <img src={p.profile_image_url} alt="Profile" className="absolute inset-0 w-20 h-20 object-cover rounded-2xl" />
          ) : null}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold truncate">{p ? text(p.name) : "-"}</h2>
          <p className="text-sm text-neutral-600 dark:text-white/65 truncate">{p ? text(p.email) : "-"}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-medium">
            <span className="px-2 py-1 rounded-full bg-brand-500/10 text-brand-700 dark:text-brandlt-200">
              {p?.semester ? `Sem ${p.semester}` : "Sem -"}
            </span>
            <span className={pill}>{p ? text(p.regno) : "-"}</span>
            <span className={pill}>{p ? text(p.phone) : "-"}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5 transition"
        >
          <Glyph name="edit" className="text-sm" />
          Edit
        </button>
      </div>
      <div className="grid sm:grid-cols-3 gap-4 text-xs">
        {field("College", refName(p?.college))}
        {field("Department", refName(p?.department))}
        {field("Batch", p?.batch ? `${p.batch.from}-${p.batch.to}` : "-")}
      </div>
    </div>
  );
}

export interface HeroProps {
  search: Suggestions;
  onGenerate: (topic: string) => Promise<void>;
  /** Theater mode: the hero search dims the page while focused. */
  onSearchFocusChange: (focused: boolean) => void;
  stats: AggregateStats | null;
  profile: AcademicProfile | null;
  onEditEducation: () => void;
  streak: ReactNode;
}

/** Headline, notes search with "Generate", KPI cards, profile and streak cards. */
export function Hero({ search, onGenerate, onSearchFocusChange, stats, profile, onEditEducation, streak }: HeroProps) {
  const { setInputEl, value, onChange, onKeyDown, onFocus, focus } = search;
  const [flash, setFlash] = useState(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (flashTimer.current) clearTimeout(flashTimer.current);
  }, []);

  const generate = async () => {
    const val = value.trim();
    if (val) {
      await onGenerate(val);
      return;
    }
    focus();
    setFlash(true);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(false), 500);
  };

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-[.06] dark:opacity-[.12]" />
      <div className="container pt-2 lg:pb-10">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-3 md:gap-10 items-start">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight mb-4">
              <span className="hidden md:inline">Your </span>Academic{" "}
              <span
                className={cn(
                  styles.commandCenterGradient,
                  "bg-gradient-to-r from-brand-500 via-brand-700 to-brand-900 bg-clip-text text-transparent",
                )}
              >
                <span className="hidden md:inline">Command</span> Center
              </span>
            </h1>
            <p className="hidden md:block text-neutral-600 dark:text-white/70 max-w-xl">
              Track syllabus mastery, revisit topics, and accelerate revision with adaptive progress signals and instant access to
              generated notes.
            </p>
            <div className="hidden md:block mt-8 w-full max-w-lg relative z-20">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Glyph
                    name="search"
                    className="pointer-events-none select-none absolute left-6 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-white/55"
                  />
                  <input
                    ref={setInputEl}
                    type="text"
                    value={value}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    onFocus={() => {
                      onFocus();
                      onSearchFocusChange(true);
                    }}
                    onBlur={() => onSearchFocusChange(false)}
                    placeholder="Search for notes (e.g., SVM)..."
                    className={cn(
                      "w-full rounded-full pr-4 py-4 text-base outline-none ring-1 ring-black/10 dark:ring-white/15 bg-white/80 dark:bg-white/5 text-neutral-900 dark:text-white placeholder:text-neutral-500 dark:placeholder:text-white/50 focus:ring-2 focus:ring-brand-500 transition shadow-sm",
                      flash && "ring-2",
                    )}
                    style={{ paddingLeft: "4rem" }}
                  />
                  <SuggestionsDropdown
                    search={search}
                    hero
                    className="absolute left-0 right-0 top-full mt-2 rounded-2xl overflow-hidden ring-1 ring-black/10 dark:ring-white/15 bg-white/90 text-neutral-900 dark:text-white backdrop-blur-xl z-50"
                    listClassName="overflow-auto py-2"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => void generate()}
                  className="shrink-0 rounded-full bg-brand-500 hover:bg-brand-600 text-white px-6 py-4 text-sm font-semibold shadow-glow hover:shadow-lg transition flex items-center gap-2"
                >
                  <Glyph name="auto_awesome" />
                  Generate
                </button>
              </div>
            </div>

            <KpiCards stats={stats} />
          </div>

          <div className="relative">
            <ProfileCard profile={profile} onEdit={onEditEducation} />
            {streak}
          </div>
        </div>
      </div>
    </section>
  );
}
