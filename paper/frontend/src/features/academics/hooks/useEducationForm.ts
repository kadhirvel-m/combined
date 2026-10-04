"use client";

import { useCallback, useRef, useState } from "react";
import { getCollegeDetails, getColleges } from "../api";
import type { AcademicProfile, CollegeDegree, CollegeDepartment, CollegeDetails, EducationEntry } from "../types";

type Option = { value: string; label: string };

// Shared across opens, like the original's module-level caches.
let collegesCache: { id: string; name: string }[] = [];
let collegesPromise: Promise<{ id: string; name: string }[]> | null = null;
const detailCache = new Map<string, CollegeDetails | null>();

function loadColleges() {
  if (collegesCache.length) return Promise.resolve(collegesCache);
  if (!collegesPromise) {
    collegesPromise = getColleges().then((list) => {
      collegesCache = list;
      return list;
    });
  }
  return collegesPromise;
}

async function loadCollegeDetails(id: string): Promise<CollegeDetails | null> {
  if (!id) return null;
  if (detailCache.has(id)) return detailCache.get(id) ?? null;
  try {
    const data = await getCollegeDetails(id);
    detailCache.set(id, data);
    return data;
  } catch (err) {
    console.error("Failed to load college details", err);
    detailCache.set(id, null);
    return null;
  }
}

function batchRange(b: { from?: number | null; to?: number | null; from_year?: number | null; to_year?: number | null }): string {
  const from = Number(b.from ?? b.from_year);
  const to = Number(b.to ?? b.to_year);
  return Number.isFinite(from) && Number.isFinite(to) ? `${from}-${to}` : "";
}

const lower = (s: unknown) => String(s || "").trim().toLowerCase();

interface Initial {
  degreeName: string;
  departmentName: string;
  batchRange: string;
}

export interface EducationFormState {
  collegeId: string;
  degreeId: string;
  departmentId: string;
  batch: string;
  section: string;
  semester: string;
  regno: string;
  phone: string;
}

const EMPTY: EducationFormState = { collegeId: "", degreeId: "", departmentId: "", batch: "", section: "", semester: "", regno: "", phone: "" };

/**
 * The "Complete your profile" education row: college → degree → department →
 * batch selects fed by /api/colleges and /api/colleges/{id}, plus section,
 * semester, registration number and phone.
 */
export function useEducationForm() {
  const [form, setForm] = useState<EducationFormState>(EMPTY);
  const [colleges, setColleges] = useState<Option[]>([]);
  const [degrees, setDegrees] = useState<CollegeDegree[]>([]);
  const [departments, setDepartments] = useState<CollegeDepartment[]>([]);
  const [batches, setBatches] = useState<Option[]>([]);
  const [disabled, setDisabled] = useState({ degree: true, department: true, batch: true });
  /** wrap.dataset.ready of the original: filled once per save cycle. */
  const ready = useRef(false);
  const collegeRef = useRef("");

  const patch = useCallback((p: Partial<EducationFormState>) => setForm((f) => ({ ...f, ...p })), []);

  const applyDepartment = useCallback(
    (departmentId: string, list: CollegeDepartment[], initial: Initial | null) => {
      if (!departmentId) {
        setBatches([]);
        setDisabled((d) => ({ ...d, batch: true }));
        patch({ departmentId: "", batch: "" });
        return;
      }
      const department = list.find((dep) => String(dep.id) === String(departmentId)) || null;
      const options = (Array.isArray(department?.batches) ? department.batches : [])
        .map((b) => ({ value: batchRange(b), label: batchRange(b) }))
        .filter((o) => o.value);
      setBatches(options);
      setDisabled((d) => ({ ...d, batch: false }));
      const found = initial?.batchRange ? options.find((o) => o.value === initial.batchRange) : undefined;
      patch({ departmentId, batch: found ? found.value : "" });
    },
    [patch],
  );

  const applyDegree = useCallback(
    (degreeId: string, list: CollegeDegree[], initial: Initial | null) => {
      if (!degreeId) {
        setDepartments([]);
        setBatches([]);
        setDisabled((d) => ({ ...d, department: true, batch: true }));
        patch({ degreeId: "", departmentId: "", batch: "" });
        return;
      }
      const degree = list.find((d) => String(d.id) === String(degreeId)) || null;
      const deps = Array.isArray(degree?.departments) ? degree.departments : [];
      setDepartments(deps);
      setDisabled((d) => ({ ...d, department: false }));
      let departmentId = "";
      if (initial?.departmentName) {
        const target = String(initial.departmentName).trim().toUpperCase();
        const match = deps.find((dep) => String(dep?.name || "").trim().toUpperCase() === target);
        if (match) departmentId = String(match.id);
      }
      patch({ degreeId });
      applyDepartment(departmentId, deps, initial);
    },
    [applyDepartment, patch],
  );

  const applyCollege = useCallback(
    async (collegeId: string, initial: Initial | null) => {
      collegeRef.current = collegeId;
      patch({ collegeId });
      if (!collegeId) {
        setDegrees([]);
        setDepartments([]);
        setBatches([]);
        setDisabled({ degree: true, department: true, batch: true });
        patch({ degreeId: "", departmentId: "", batch: "" });
        return;
      }
      const details = await loadCollegeDetails(collegeId);
      if (!details || collegeId !== collegeRef.current) return;
      const list = Array.isArray(details.degrees) ? details.degrees : [];
      setDegrees(list);
      setDisabled((d) => ({ ...d, degree: false }));
      let degreeId = "";
      if (initial?.degreeName) {
        const match = list.find((deg) => lower(deg?.name) === lower(initial.degreeName));
        if (match) degreeId = String(match.id);
      }
      applyDegree(degreeId, list, initial);
    },
    [applyDegree, patch],
  );

  /** Fill the row from the profile's first education entry (once per save cycle). */
  const prepare = useCallback(
    async (data: EducationEntry & { phone?: string | null }) => {
      if (ready.current) return;
      ready.current = true;
      const initial: Initial = {
        degreeName: String(data.degree || ""),
        departmentName: String(data.department || ""),
        batchRange: String(data.batch_range || ""),
      };
      setForm({
        ...EMPTY,
        semester: data.current_semester ? String(data.current_semester) : "",
        regno: data.regno ? String(data.regno) : "",
        phone: data.phone ? String(data.phone) : "",
        section: data.section ? String(data.section).trim().toUpperCase() : "",
      });
      setDegrees([]);
      setDepartments([]);
      setBatches([]);
      setDisabled({ degree: true, department: true, batch: true });
      const list = await loadColleges().catch(() => []);
      setColleges(list.map((c) => ({ value: c.id, label: c.name })));
      const name = lower(data.school);
      const match = name ? list.find((c) => lower(c.name) === name) : undefined;
      await applyCollege(match ? match.id : "", initial);
    },
    [applyCollege],
  );

  /** The single education entry sent to PUT /api/profile/me (null without an institution). */
  const collect = (): EducationEntry | null => {
    const college = collegesCache.find((c) => String(c.id) === String(form.collegeId));
    const school = (form.collegeId ? college?.name || "" : "").trim();
    if (!school) return null;
    const degree = degrees.find((d) => String(d.id) === String(form.degreeId));
    const department = departments.find((d) => String(d.id) === String(form.departmentId));
    const semesterRaw = form.semester.trim();
    const currentSemester = semesterRaw ? parseInt(semesterRaw, 10) : NaN;
    return {
      id: null,
      school,
      degree: (form.degreeId ? degree?.name || "" : "").trim() || null,
      department: (form.departmentId ? department?.name || "" : "").trim() || null,
      batch_range: form.batch || null,
      regno: form.regno.trim() || null,
      current_semester: Number.isFinite(currentSemester) && currentSemester > 0 ? currentSemester : null,
      grade: null,
      activities: null,
      description: null,
      college_id: form.collegeId || null,
      degree_id: form.degreeId || null,
      department_id: form.departmentId || null,
      batch_id: null,
      section: form.section.trim() || null,
    };
  };

  return {
    form,
    patch,
    colleges,
    degreeOptions: degrees.map((d) => ({ value: String(d.id), label: d.name })),
    departmentOptions: departments.map((d) => ({ value: String(d.id), label: d.name })),
    batchOptions: batches,
    disabled,
    onCollegeChange: (id: string) => void applyCollege(id, null),
    onDegreeChange: (id: string) => applyDegree(id, degrees, null),
    onDepartmentChange: (id: string) => applyDepartment(id, departments, null),
    prepare,
    /** Re-read the profile next time (after a successful save). */
    invalidate: () => {
      ready.current = false;
    },
    collect,
  };
}

/** __pxBuildProfileUpdatePayload() of the original. */
export function buildProfileUpdatePayload(profile: AcademicProfile, educationEntries: EducationEntry[]) {
  const specializations = Array.isArray(profile?.specializations)
    ? profile.specializations
    : profile?.specializations
      ? String(profile.specializations)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
  const p = profile as Record<string, unknown>;
  const pick = (key: string) => p?.[key] || null;
  return {
    name: pick("name"),
    phone: pick("phone"),
    headline: pick("headline"),
    location: pick("location"),
    dob: pick("dob"),
    bio: pick("bio"),
    linkedin: pick("linkedin"),
    github: pick("github"),
    leetcode: pick("leetcode"),
    portfolio_url: pick("portfolio_url"),
    website: pick("website"),
    twitter: pick("twitter"),
    instagram: pick("instagram"),
    medium: pick("medium"),
    specializations,
    technologies: pick("technologies"),
    skills: pick("skills"),
    certifications: pick("certifications"),
    languages: pick("languages"),
    interests: pick("interests"),
    achievements: pick("achievements"),
    experience: pick("experience"),
    publications: pick("publications"),
    project_info: pick("project_info"),
    experiences: Array.isArray(profile?.experiences) ? profile.experiences : [],
    education_entries: educationEntries,
    certification_entries: Array.isArray(profile?.certification_entries) ? profile.certification_entries : [],
    portfolio_projects: Array.isArray(profile?.portfolio_projects) ? profile.portfolio_projects : [],
    publication_entries: Array.isArray(profile?.publication_entries) ? profile.publication_entries : [],
  };
}

/** Name, phone and one complete education entry (school…semester). */
export function profileCompleteness(profile: AcademicProfile | null | undefined) {
  const list = Array.isArray(profile?.education_entries) ? profile.education_entries : [];
  const hasName = Boolean(String(profile?.name || "").trim());
  const hasPhone = Boolean(String(profile?.phone || "").trim());
  const hasEducation = list.some((ed) => {
    const semester = Number(ed?.current_semester);
    return (
      (ed?.school || "").trim() &&
      (ed?.degree || "").trim() &&
      (ed?.department || "").trim() &&
      (ed?.batch_range || "").trim() &&
      (ed?.section || "").trim() &&
      Number.isFinite(semester) &&
      semester > 0
    );
  });
  return { hasName, hasPhone, hasEducation };
}
