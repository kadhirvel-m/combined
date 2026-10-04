"use client";

import type { Dispatch } from "react";
import type { EditorAction, PublicationRow } from "../../lib/editForm";
import { EntryCard, Field, ListSection, RemoveButton, RemoveRow, rowInput } from "./fields";

function PublicationEntry({ row, dispatch }: { row: PublicationRow; dispatch: Dispatch<EditorAction> }) {
  const set = (patch: Partial<Omit<PublicationRow, "key">>) => dispatch({ type: "publication", key: row.key, patch });
  return (
    <EntryCard>
      <Field label="Title *">
        <input type="text" required placeholder="Paper title" className={rowInput} value={row.title} onChange={(e) => set({ title: e.target.value })} />
      </Field>
      <div className="grid md:grid-cols-2 gap-3">
        <Field label="Publisher / Journal">
          <input type="text" placeholder="ACM, Medium…" className={rowInput} value={row.publisher} onChange={(e) => set({ publisher: e.target.value })} />
        </Field>
        <Field label="Publication date">
          <input type="date" className={rowInput} value={row.date} onChange={(e) => set({ date: e.target.value })} />
        </Field>
      </div>
      <Field label="Authors (comma separated)">
        <input type="text" placeholder="You, Collaborator" className={rowInput} value={row.authors} onChange={(e) => set({ authors: e.target.value })} />
      </Field>
      <Field label="Publication URL">
        <input type="url" placeholder="https://doi.org/..." className={rowInput} value={row.url} onChange={(e) => set({ url: e.target.value })} />
      </Field>
      <Field label="Abstract / Summary">
        <textarea
          rows={3}
          placeholder="Key findings, impact, context"
          className={rowInput}
          value={row.abstract}
          onChange={(e) => set({ abstract: e.target.value })}
        />
      </Field>
      <RemoveRow>
        <RemoveButton onClick={() => dispatch({ type: "remove", list: "publications", key: row.key })}>Remove publication</RemoveButton>
      </RemoveRow>
    </EntryCard>
  );
}

/** Publications: papers, talks or articles. */
export function PublicationSection({ rows, dispatch }: { rows: PublicationRow[]; dispatch: Dispatch<EditorAction> }) {
  return (
    <ListSection
      title="Publications"
      hint="Include papers, talks or articles to highlight thought leadership."
      addLabel="Add publication"
      onAdd={() => dispatch({ type: "add", list: "publications" })}
    >
      {rows.map((row) => (
        <PublicationEntry key={row.key} row={row} dispatch={dispatch} />
      ))}
    </ListSection>
  );
}
