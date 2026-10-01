"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { notesApi } from "../api";
import { bearer, getAuthToken } from "../lib/authToken";
import { readLocal, STORAGE_KEYS, writeLocal } from "../lib/storage";
import type { NotesWorkspaceConfig } from "../config";

export interface DegreeOption {
  value: string;
  label: string;
}

export interface NotesDegree {
  options: DegreeOption[];
  /** Select value: "", an option value or "custom". */
  select: string;
  custom: string;
  customVisible: boolean;
  onSelectChange: (value: string) => void;
  onCustomInput: (value: string) => void;
  /** "Sources: auto" / "Degree: X • domains…" hint. */
  domainsHint: string;
  setDomainsHint: (hint: string) => void;
  /** Degree sent with generation requests (UI value, else the stored one). */
  getSelectedDegree: () => string;
  /** Loads options, resolves the degree from the profile and refreshes the hint. */
  init: (afterResolve?: () => Promise<void>) => Promise<void>;
}

const storedDegree = () => readLocal(STORAGE_KEYS.degree) || "";
const setStoredDegree = (value: string) => writeLocal(STORAGE_KEYS.degree, value || null);

/**
 * Degree used to pick trusted source domains. The selector itself stays
 * hidden (the originals resolve the degree automatically from the profile),
 * but its state is kept so the generation request carries the same value.
 */
export function useDegree(config: NotesWorkspaceConfig): NotesDegree {
  const [options, setOptions] = useState<DegreeOption[]>([]);
  const [select, setSelect] = useState("");
  const [custom, setCustom] = useState("");
  const [customVisible, setCustomVisible] = useState(false);
  const [domainsHint, setDomainsHint] = useState("Sources: auto");
  const optionsRef = useRef<DegreeOption[]>([]);
  const selectRef = useRef("");
  const customRef = useRef("");
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lookupHeaders = useCallback(() => (config.authLookups ? bearer(getAuthToken(config.authToken)) : undefined), [config.authLookups, config.authToken]);

  const applySelect = (value: string) => {
    selectRef.current = value;
    setSelect(value);
  };
  const applyCustom = (value: string) => {
    customRef.current = value;
    setCustom(value);
  };
  /** Selects `label` when it is an option, otherwise "Other…" with the label typed in. */
  const applyLabel = (label: string, toggleRow: boolean) => {
    const match = optionsRef.current.find((o) => o.value.toLowerCase() === label.toLowerCase());
    if (match) {
      applySelect(match.value);
      if (toggleRow) setCustomVisible(false);
    } else {
      applySelect("custom");
      applyCustom(label);
      if (toggleRow) setCustomVisible(true);
    }
  };

  const getSelectedDegree = useCallback(() => {
    const ui = selectRef.current === "custom" ? customRef.current.trim() : selectRef.current.trim();
    return ui || storedDegree().trim();
  }, []);

  const updateHint = useCallback(async () => {
    const degree = getSelectedDegree();
    if (!degree) {
      setDomainsHint("Sources: auto");
      return;
    }
    try {
      const res = await notesApi.allowedDomains(degree, lookupHeaders());
      if (!res.ok) {
        setDomainsHint(`Degree: ${degree}`);
        return;
      }
      const list = Array.isArray(res.data?.domains) ? res.data.domains : [];
      if (!list.length) {
        setDomainsHint(`Degree: ${degree} • web (fallback)`);
        return;
      }
      setDomainsHint(`Degree: ${degree} • ${list.slice(0, 4).join(", ")}${list.length > 4 ? "…" : ""}`);
    } catch {
      setDomainsHint(`Degree: ${degree}`);
    }
  }, [getSelectedDegree, lookupHeaders]);

  const updateHintDebounced = useCallback(() => {
    if (hintTimer.current) clearTimeout(hintTimer.current);
    hintTimer.current = setTimeout(() => void updateHint(), 250);
  }, [updateHint]);

  useEffect(() => () => {
    if (hintTimer.current) clearTimeout(hintTimer.current);
  }, []);

  const loadOptions = useCallback(async () => {
    try {
      const res = await notesApi.degrees(lookupHeaders());
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const next: DegreeOption[] = [];
      for (const row of Array.isArray(res.data) ? res.data : []) {
        const label = (row && (row.degree_label || row.degree_key)) || "";
        const key = (row && (row.degree_key || row.degree_label)) || "";
        const value = (label || key || "").trim();
        if (value) next.push({ value, label: label || key });
      }
      optionsRef.current = next;
      setOptions(next);
      const selected = storedDegree();
      if (selected) applyLabel(selected, true);
      updateHintDebounced();
    } catch {
      /* keep the default options */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- applyLabel only touches refs and setters
  }, [lookupHeaders, updateHintDebounced]);

  /** Department of the signed-in student → degree name (via the academic meta). */
  const autoResolve = useCallback(async () => {
    try {
      const token = getAuthToken(config.authToken);
      if (!token) return false;
      const me = await notesApi.me(token);
      if (!me.ok) return false;
      const deptId = me.data?.profile?.department?.id;
      if (!deptId) return false;
      const meta = await notesApi.academicMeta();
      if (!meta.ok) return false;
      const dept = (meta.data?.departments || []).find((d) => String(d.id) === String(deptId));
      if (!dept || !dept.degree_id) return false;
      const deg = (meta.data?.degrees || []).find((g) => String(g.id) === String(dept.degree_id));
      const label = deg && deg.name ? String(deg.name).trim() : "";
      if (!label) return false;
      setStoredDegree(label);
      applyLabel(label, false);
      updateHintDebounced();
      return true;
    } catch {
      return false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- applyLabel only touches refs and setters
  }, [config.authToken, updateHintDebounced]);

  const init = useCallback(
    async (afterResolve?: () => Promise<void>) => {
      void loadOptions();
      const ok = await autoResolve();
      if (!ok) {
        const stored = storedDegree();
        if (stored) applyLabel(stored, false);
        else applySelect("");
      }
      await afterResolve?.();
      updateHintDebounced();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- applyLabel only touches refs and setters
    [loadOptions, autoResolve, updateHintDebounced],
  );

  const onSelectChange = useCallback(
    (value: string) => {
      applySelect(value);
      if (value.trim() === "custom") {
        setCustomVisible(true);
      } else {
        setCustomVisible(false);
        setStoredDegree(value.trim());
        updateHintDebounced();
      }
    },
    [updateHintDebounced],
  );

  const onCustomInput = useCallback(
    (value: string) => {
      applyCustom(value);
      setStoredDegree(value.trim());
      updateHintDebounced();
    },
    [updateHintDebounced],
  );

  return { options, select, custom, customVisible, onSelectChange, onCustomInput, domainsHint, setDomainsHint, getSelectedDegree, init };
}
