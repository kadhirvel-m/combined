"use client";

import type { Dispatch } from "react";
import type { AssociationOption, EditorAction, EditorState, PortfolioRow } from "../../lib/editForm";
import { EntryCard, Field, ListSection, RemoveButton, RemoveRow, rowInput } from "./fields";

/** Linked experience / education select: a blank option, then the saved rows. */
function AssociateSelect({ value, options, onChange }: { value: string; options: AssociationOption[]; onChange: (value: string) => void }) {
  return (
    <select className={rowInput} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="" />
      {options.map((o, i) => (
        <option key={`${i}:${o.id}`} value={o.id}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function PortfolioEntry({
  row,
  associations,
  dispatch,
}: {
  row: PortfolioRow;
  associations: EditorState["associations"];
  dispatch: Dispatch<EditorAction>;
}) {
  const set = (patch: Partial<Omit<PortfolioRow, "key">>) => dispatch({ type: "project", key: row.key, patch });
  return (
    <EntryCard>
      <Field label="Project name *">
        <input type="text" required placeholder="Build Week Platform" className={rowInput} value={row.name} onChange={(e) => set({ name: e.target.value })} />
      </Field>
      <div className="grid md:grid-cols-2 gap-3">
        <Field label="Linked experience">
          <AssociateSelect value={row.experience} options={associations.experience} onChange={(experience) => set({ experience })} />
        </Field>
        <Field label="Linked education">
          <AssociateSelect value={row.education} options={associations.education} onChange={(education) => set({ education })} />
        </Field>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <Field label="Start date">
          <input type="date" className={rowInput} value={row.start} onChange={(e) => set({ start: e.target.value })} />
        </Field>
        <Field label="End date">
          <input type="date" className={rowInput} value={row.end} onChange={(e) => set({ end: e.target.value })} />
        </Field>
      </div>
      <Field label="Project URL">
        <input type="url" placeholder="https://demo" className={rowInput} value={row.url} onChange={(e) => set({ url: e.target.value })} />
      </Field>
      <Field label="Description">
        <textarea
          rows={3}
          placeholder="Goals, tech and impact…"
          className={rowInput}
          value={row.description}
          onChange={(e) => set({ description: e.target.value })}
        />
      </Field>
      <div className="grid md:grid-cols-2 gap-3">
        <Field label="Tech stack (comma separated)">
          <input type="text" placeholder="React, FastAPI, Supabase" className={rowInput} value={row.stack} onChange={(e) => set({ stack: e.target.value })} />
        </Field>
        <Field label="Team (comma separated)">
          <input type="text" placeholder="Alice, Bob" className={rowInput} value={row.team} onChange={(e) => set({ team: e.target.value })} />
        </Field>
      </div>
      <RemoveRow>
        <RemoveButton onClick={() => dispatch({ type: "remove", list: "projects", key: row.key })}>Remove project</RemoveButton>
      </RemoveRow>
    </EntryCard>
  );
}

/** Portfolio Projects (optionally linked to a saved experience / education). */
export function PortfolioSection({
  rows,
  associations,
  dispatch,
}: {
  rows: PortfolioRow[];
  associations: EditorState["associations"];
  dispatch: Dispatch<EditorAction>;
}) {
  return (
    <ListSection
      title="Portfolio Projects"
      hint="Showcase academic, professional or personal projects with outcomes."
      addLabel="Add project"
      onAdd={() => dispatch({ type: "add", list: "projects" })}
    >
      {rows.map((row) => (
        <PortfolioEntry key={row.key} row={row} associations={associations} dispatch={dispatch} />
      ))}
    </ListSection>
  );
}
