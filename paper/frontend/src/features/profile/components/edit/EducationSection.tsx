"use client";

import { useEffect, useRef, type Dispatch } from "react";
import { fetchCollegeDetail, fetchColleges } from "../../api";
import { SECTION_LETTERS } from "../../hooks/useEducationForm";
import { educationOptions, initialCollegeId, type EditorAction, type EducationRow } from "../../lib/editForm";
import type { CollegeOption, DegreeOption } from "../../types";
import { EntryCard, Field, ListSection, Options, RemoveButton, RemoveRow, rowInput } from "./fields";

const SECTION_OPTIONS = SECTION_LETTERS.map((ch) => ({ value: ch, label: ch }));

const degreesOf = (detail: { degrees?: DegreeOption[] | null } | null) => (Array.isArray(detail?.degrees) ? detail.degrees : []);

function EducationEntry({ row, colleges, dispatch }: { row: EducationRow; colleges: CollegeOption[]; dispatch: Dispatch<EditorAction> }) {
  // Latest college-details request; older responses are dropped.
  const request = useRef(0);
  const rowRef = useRef(row);
  useEffect(() => {
    rowRef.current = row;
  });
  const key = row.key;

  // Fill the college options, select the saved college and cascade from it.
  useEffect(() => {
    let alive = true;
    const init = async () => {
      const list = await fetchColleges().catch(() => [] as CollegeOption[]);
      if (!alive) return;
      dispatch({ type: "education/colleges", key, colleges: list });
      const college = initialCollegeId(rowRef.current, list);
      if (!college) return;
      const id = ++request.current;
      const detail = await fetchCollegeDetail(college);
      if (!alive || id !== request.current) return;
      dispatch({ type: "education/details", key, college, degrees: degreesOf(detail), initial: true });
    };
    void init().catch((err: unknown) => console.error("Failed to initialize education row", err));
    return () => {
      alive = false;
    };
  }, [key, dispatch]);

  const selectCollege = async (value: string) => {
    dispatch({ type: "education/college", key, value });
    if (!value) return;
    const id = ++request.current;
    const detail = await fetchCollegeDetail(value);
    if (id !== request.current) return;
    dispatch({ type: "education/details", key, college: value, degrees: degreesOf(detail), initial: false });
  };

  const options = educationOptions(row, colleges);
  const set = (patch: Extract<EditorAction, { type: "education" }>["patch"]) => dispatch({ type: "education", key, patch });

  return (
    <EntryCard>
      <Field label="Institution *">
        <select required className={rowInput} value={row.college} onChange={(e) => void selectCollege(e.target.value)}>
          <Options placeholder="Select college" options={options.colleges} />
        </select>
      </Field>
      <div className="grid md:grid-cols-2 gap-3">
        <Field label="Degree">
          <select
            disabled={!row.degreeEnabled}
            className={rowInput}
            value={row.degree}
            onChange={(e) => dispatch({ type: "education/degree", key, value: e.target.value })}
          >
            <Options placeholder="Select degree" options={options.degrees} />
          </select>
        </Field>
        <Field label="Department">
          <select
            disabled={!row.departmentEnabled}
            className={rowInput}
            value={row.department}
            onChange={(e) => dispatch({ type: "education/department", key, value: e.target.value })}
          >
            <Options placeholder="Select department" options={options.departments} />
          </select>
        </Field>
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        <Field label="Batch">
          <select
            disabled={!row.batchEnabled}
            className={rowInput}
            value={row.batch}
            onChange={(e) => dispatch({ type: "education/batch", key, value: e.target.value })}
          >
            <Options placeholder="Select batch" options={options.batches} />
          </select>
        </Field>
        <Field label="Section">
          <select className={rowInput} value={row.section} onChange={(e) => set({ section: e.target.value })}>
            <Options placeholder="Select section" options={SECTION_OPTIONS} />
          </select>
        </Field>
        <Field label="Current Semester">
          <input type="number" min={1} max={12} placeholder="5" className={rowInput} value={row.semester} onChange={(e) => set({ semester: e.target.value })} />
        </Field>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <Field label="Registration No.">
          <input type="text" placeholder="22TN0049" className={rowInput} value={row.regno} onChange={(e) => set({ regno: e.target.value })} />
        </Field>
        <Field label="Grade / GPA">
          <input type="text" placeholder="9.1 CGPA" className={rowInput} value={row.grade} onChange={(e) => set({ grade: e.target.value })} />
        </Field>
      </div>
      <Field label="Activities & societies">
        <input type="text" placeholder="Clubs, committees…" className={rowInput} value={row.activities} onChange={(e) => set({ activities: e.target.value })} />
      </Field>
      <Field label="Highlights">
        <textarea
          rows={3}
          placeholder="Leadership, projects, honours…"
          className={rowInput}
          value={row.description}
          onChange={(e) => set({ description: e.target.value })}
        />
      </Field>
      <RemoveRow>
        <RemoveButton onClick={() => dispatch({ type: "remove", list: "education", key })}>Remove education</RemoveButton>
      </RemoveRow>
    </EntryCard>
  );
}

/** Education: catalogue-driven institution → degree → department → batch, plus details. */
export function EducationSection({
  rows,
  colleges,
  dispatch,
}: {
  rows: EducationRow[];
  colleges: CollegeOption[];
  dispatch: Dispatch<EditorAction>;
}) {
  return (
    <ListSection
      title="Education"
      hint="Capture formal education, bootcamps or certifications earned through institutions."
      addLabel="Add education"
      onAdd={() => dispatch({ type: "add", list: "education" })}
    >
      {rows.map((row) => (
        <EducationEntry key={row.key} row={row} colleges={colleges} dispatch={dispatch} />
      ))}
    </ListSection>
  );
}
