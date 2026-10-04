"use client";

import type { Dispatch } from "react";
import { cn } from "@/lib/cn";
import type { CertificationRow, EditorAction } from "../../lib/editForm";
import { checkbox, EntryCard, Field, ListSection, RemoveButton, RemoveRow, rowInput } from "./fields";

function CertificationEntry({ row, dispatch }: { row: CertificationRow; dispatch: Dispatch<EditorAction> }) {
  const set = (patch: Partial<Omit<CertificationRow, "key">>) => dispatch({ type: "certification", key: row.key, patch });
  return (
    <EntryCard>
      <div className="grid md:grid-cols-2 gap-3">
        <Field label="Certification *">
          <input type="text" required placeholder="AWS Certified Developer" className={rowInput} value={row.name} onChange={(e) => set({ name: e.target.value })} />
        </Field>
        <Field label="Issuing organization">
          <input type="text" placeholder="AWS" className={rowInput} value={row.org} onChange={(e) => set({ org: e.target.value })} />
        </Field>
      </div>
      <div className="grid md:grid-cols-3 gap-3 items-end">
        <Field label="Issue date">
          <input type="date" className={rowInput} value={row.issue} onChange={(e) => set({ issue: e.target.value })} />
        </Field>
        <Field label="Expiration date">
          <input
            type="date"
            disabled={row.noExpiry}
            className={cn(rowInput, row.noExpiry && "opacity-60")}
            value={row.expiry}
            onChange={(e) => set({ expiry: e.target.value })}
          />
        </Field>
        <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
          <input type="checkbox" className={checkbox} checked={row.noExpiry} onChange={(e) => set({ noExpiry: e.target.checked })} /> Does not expire
        </label>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <Field label="Credential ID">
          <input type="text" className={rowInput} value={row.credentialId} onChange={(e) => set({ credentialId: e.target.value })} />
        </Field>
        <Field label="Credential URL">
          <input
            type="url"
            placeholder="https://verify"
            className={rowInput}
            value={row.credentialUrl}
            onChange={(e) => set({ credentialUrl: e.target.value })}
          />
        </Field>
      </div>
      <Field label="Notes">
        <textarea
          rows={2}
          placeholder="Score, scope or coverage details"
          className={rowInput}
          value={row.description}
          onChange={(e) => set({ description: e.target.value })}
        />
      </Field>
      <RemoveRow>
        <RemoveButton onClick={() => dispatch({ type: "remove", list: "certifications", key: row.key })}>Remove certification</RemoveButton>
      </RemoveRow>
    </EntryCard>
  );
}

/** Licenses & Certifications. */
export function CertificationSection({ rows, dispatch }: { rows: CertificationRow[]; dispatch: Dispatch<EditorAction> }) {
  return (
    <ListSection
      title="Licenses & Certifications"
      hint="Add credentials so recruiters can verify your expertise."
      addLabel="Add certification"
      onAdd={() => dispatch({ type: "add", list: "certifications" })}
    >
      {rows.map((row) => (
        <CertificationEntry key={row.key} row={row} dispatch={dispatch} />
      ))}
    </ListSection>
  );
}
