"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchCollegeDetail, fetchColleges } from "../api";
import type { BatchOption, CollegeOption, DegreeOption, DepartmentOption, EducationEntry, EducationEntryInput } from "../types";

export interface SelectOption {
  value: string;
  label: string;
}

/** "2022-2026" from a batch row, or "" when either year is missing. */
export function batchRangeLabel(batch: BatchOption | null | undefined): string {
  if (!batch) return "";
  const from = Number(batch.from ?? batch.from_year);
  const to = Number(batch.to ?? batch.to_year);
  return Number.isFinite(from) && Number.isFinite(to) ? `${from}-${to}` : "";
}

const lower = (v: unknown) => String(v || "").trim().toLowerCase();
const upper = (v: unknown) => String(v || "").trim().toUpperCase();

function batchOptions(department: DepartmentOption | null): SelectOption[] {
  const batches = Array.isArray(department?.batches) ? department.batches : [];
  return batches.map(batchRangeLabel).filter(Boolean).map((label) => ({ value: label, label }));
}

export const SECTION_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/**
 * One education row driven by the college catalogue: college → degree →
 * department → batch cascade (GET /api/colleges, /api/colleges/{id}), plus
 * section, current semester, registration number and phone. Initial values
 * are matched by name, as on profile.html / profile_edit.html; values that are
 * not in the catalogue start unselected.
 */
export function useEducationForm(initial: EducationEntry | undefined, initialPhone?: string | null) {
  const [colleges, setColleges] = useState<CollegeOption[]>([]);
  const [collegeId, setCollegeId] = useState("");
  const [degrees, setDegrees] = useState<DegreeOption[]>([]);
  const [degreeId, setDegreeId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [batchRange, setBatchRange] = useState("");
  const [section, setSection] = useState("");
  const [semester, setSemester] = useState("");
  const [regno, setRegno] = useState("");
  const [phone, setPhone] = useState(initialPhone ? String(initialPhone) : "");
  // True once the catalogue and the initial selection have loaded.
  const [ready, setReady] = useState(false);
  const request = useRef(0);
  const initialRef = useRef(initial);

  // Initial fill: colleges, then the matching degree/department/batch.
  useEffect(() => {
    let cancelled = false;
    const start = initialRef.current ?? {};
    const fill = async () => {
      const list = await fetchColleges().catch(() => []);
      if (cancelled) return;
      setColleges(list);
      if (start.section) setSection(upper(start.section));
      const college = start.school ? list.find((c) => lower(c.name) === lower(start.school)) : undefined;
      if (!college) return;
      setCollegeId(college.id);
      const id = ++request.current;
      const detail = await fetchCollegeDetail(college.id);
      if (cancelled || id !== request.current) return;
      const degreeList = Array.isArray(detail?.degrees) ? detail.degrees : [];
      setDegrees(degreeList);
      const degree = start.degree ? degreeList.find((d) => lower(d.name) === lower(start.degree)) : undefined;
      if (!degree) return;
      setDegreeId(String(degree.id));
      const departments = Array.isArray(degree.departments) ? degree.departments : [];
      const department = start.department ? departments.find((d) => upper(d.name) === upper(start.department)) : undefined;
      if (!department) return;
      setDepartmentId(String(department.id));
      const range = start.batch_range || "";
      if (range && batchOptions(department).some((o) => o.value === range)) setBatchRange(range);
    };
    void fill().finally(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const college = colleges.find((c) => c.id === collegeId) ?? null;
  const degree = degrees.find((d) => String(d.id) === degreeId) ?? null;
  const departments = Array.isArray(degree?.departments) ? degree.departments : [];
  const department = departments.find((d) => String(d.id) === departmentId) ?? null;

  const selectCollege = useCallback(async (id: string) => {
    setCollegeId(id);
    setDegreeId("");
    setDepartmentId("");
    setBatchRange("");
    const req = ++request.current;
    if (!id) {
      setDegrees([]);
      return;
    }
    const detail = await fetchCollegeDetail(id);
    if (req !== request.current) return;
    setDegrees(Array.isArray(detail?.degrees) ? detail.degrees : []);
  }, []);

  const selectDegree = useCallback((id: string) => {
    setDegreeId(id);
    setDepartmentId("");
    setBatchRange("");
  }, []);

  const selectDepartment = useCallback((id: string) => {
    setDepartmentId(id);
    setBatchRange("");
  }, []);

  /** The row as sent to PUT /api/profile/me, or null without an institution. */
  const collect = (): EducationEntryInput | null => {
    const school = (college?.name || "").trim();
    if (!school) return null;
    const sem = semester.trim() ? parseInt(semester.trim(), 10) : null;
    return {
      id: null,
      school,
      degree: (degree?.name || "").trim() || null,
      department: (department?.name || "").trim() || null,
      batch_range: batchRange || null,
      regno: regno.trim() || null,
      current_semester: sem !== null && Number.isFinite(sem) && sem > 0 ? sem : null,
      grade: null,
      activities: null,
      description: null,
      college_id: collegeId || null,
      degree_id: degreeId || null,
      department_id: departmentId || null,
      batch_id: null,
      section: section.trim() || null,
    };
  };

  return {
    ready,
    collegeOptions: colleges.map((c) => ({ value: c.id, label: c.name })),
    degreeOptions: degrees.map((d) => ({ value: String(d.id), label: d.name })),
    departmentOptions: departments.map((d) => ({ value: String(d.id), label: d.name })),
    batchOptions: batchOptions(department),
    collegeId,
    degreeId,
    departmentId,
    batchRange,
    section,
    semester,
    regno,
    phone,
    degreeDisabled: !collegeId,
    departmentDisabled: !degreeId,
    batchDisabled: !departmentId,
    selectCollege,
    selectDegree,
    selectDepartment,
    setBatchRange,
    setSection,
    setSemester,
    setRegno,
    setPhone,
    collect,
  };
}

export type EducationForm = ReturnType<typeof useEducationForm>;
