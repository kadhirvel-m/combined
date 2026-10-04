"use client";

import type { Dispatch } from "react";
import { cn } from "@/lib/cn";
import { EMPLOYMENT_TYPES, LOCATION_TYPES, MEDIA_KINDS, type EditorAction, type ExperienceRow, type MediaRow } from "../../lib/editForm";
import { PIcon } from "../Glyph";
import { checkbox, EntryCard, Field, ListSection, mediaInput, RemoveButton, rowInput } from "./fields";

function Attachment({ media, onChange, onRemove }: { media: MediaRow; onChange: (patch: Partial<MediaRow>) => void; onRemove: () => void }) {
  return (
    <div className="rounded-lg border border-slate-200/50 dark:border-white/15 bg-white dark:bg-night-900/50 p-3 grid md:grid-cols-2 gap-2">
      <Field label="Title">
        <input type="text" placeholder="Slide deck" className={mediaInput} value={media.title} onChange={(e) => onChange({ title: e.target.value })} />
      </Field>
      <Field label="URL">
        <input type="url" placeholder="https://" className={mediaInput} value={media.url} onChange={(e) => onChange({ url: e.target.value })} />
      </Field>
      <Field label="Type">
        <select className={mediaInput} value={media.kind} onChange={(e) => onChange({ kind: e.target.value })}>
          {MEDIA_KINDS.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label}
            </option>
          ))}
        </select>
      </Field>
      <div className="flex items-end justify-end">
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center gap-1 rounded-lg border border-rose-300/40 text-rose-500 px-2 py-1 text-xs hover:border-rose-400/60"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

function ExperienceEntry({ row, dispatch }: { row: ExperienceRow; dispatch: Dispatch<EditorAction> }) {
  const set = (patch: Partial<Omit<ExperienceRow, "key" | "media">>) => dispatch({ type: "experience", key: row.key, patch });
  return (
    <EntryCard>
      <div className="grid md:grid-cols-2 gap-3">
        <Field label="Title *">
          <input type="text" required placeholder="Software Engineer" className={rowInput} value={row.title} onChange={(e) => set({ title: e.target.value })} />
        </Field>
        <Field label="Employment type">
          <select className={rowInput} value={row.employmentType} onChange={(e) => set({ employmentType: e.target.value })}>
            <option value="" />
            {EMPLOYMENT_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <Field label="Company / Organization">
          <input type="text" placeholder="Company name" className={rowInput} value={row.company} onChange={(e) => set({ company: e.target.value })} />
        </Field>
        <Field label="Company logo URL">
          <input type="url" placeholder="https://logo.png" className={rowInput} value={row.companyLogo} onChange={(e) => set({ companyLogo: e.target.value })} />
        </Field>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <Field label="Location">
          <input type="text" placeholder="City, Country" className={rowInput} value={row.location} onChange={(e) => set({ location: e.target.value })} />
        </Field>
        <Field label="Location type">
          <select className={rowInput} value={row.locationType} onChange={(e) => set({ locationType: e.target.value })}>
            <option value="" />
            {LOCATION_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
      </div>
      <div className="grid md:grid-cols-3 gap-3 items-end">
        <Field label="Start date *">
          <input type="date" required className={rowInput} value={row.startDate} onChange={(e) => set({ startDate: e.target.value })} />
        </Field>
        <Field label="End date">
          <input
            type="date"
            disabled={row.isCurrent}
            className={cn(rowInput, row.isCurrent && "opacity-60")}
            value={row.endDate}
            onChange={(e) => set({ endDate: e.target.value })}
          />
        </Field>
        <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
          <input type="checkbox" className={checkbox} checked={row.isCurrent} onChange={(e) => set({ isCurrent: e.target.checked })} />
          <span>Currently here</span>
        </label>
      </div>
      <Field label="Description">
        <textarea
          rows={3}
          placeholder="Impact, responsibilities, wins…"
          className={rowInput}
          value={row.description}
          onChange={(e) => set({ description: e.target.value })}
        />
      </Field>
      <div className="grid gap-2">
        {row.media.map((m) => (
          <Attachment
            key={m.key}
            media={m}
            onChange={(patch) => dispatch({ type: "media", key: row.key, mediaKey: m.key, patch })}
            onRemove={() => dispatch({ type: "media/remove", key: row.key, mediaKey: m.key })}
          />
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => dispatch({ type: "media/add", key: row.key })}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200/60 dark:border-white/15 px-2 py-1 text-xs hover:border-brand-400/60"
        >
          <PIcon name="attach_file_add" />
          Attachment
        </button>
        <RemoveButton icon="delete" onClick={() => dispatch({ type: "remove", list: "experiences", key: row.key })}>
          Remove experience
        </RemoveButton>
      </div>
    </EntryCard>
  );
}

/** Experience: roles, internships, research or teaching (with attachments). */
export function ExperienceSection({ rows, dispatch }: { rows: ExperienceRow[]; dispatch: Dispatch<EditorAction> }) {
  return (
    <ListSection
      title="Experience"
      hint="Chronicle roles, internships, research or teaching engagements."
      addLabel="Add experience"
      onAdd={() => dispatch({ type: "add", list: "experiences" })}
    >
      {rows.map((row) => (
        <ExperienceEntry key={row.key} row={row} dispatch={dispatch} />
      ))}
    </ListSection>
  );
}
