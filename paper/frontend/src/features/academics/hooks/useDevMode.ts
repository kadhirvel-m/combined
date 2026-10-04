"use client";

import { useCallback, useEffect, useState } from "react";
import { getAdminRole } from "../api";

const STORAGE_KEY = "px_dev_mode";

/**
 * Developer mode: restored from `localStorage.px_dev_mode` for everyone (it
 * switches topic links to img_gen.html and shows the aurora); the toggles are
 * only shown to admins and employees (`GET /api/admin/roles/me`).
 */
export function useDevMode() {
  const [devMode, setDevModeState] = useState(false);
  const [eligible, setEligible] = useState(false);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restore the persisted flag after hydration
      if (localStorage.getItem(STORAGE_KEY) === "true") setDevModeState(true);
    } catch {}
  }, []);

  const setDevMode = useCallback((on: boolean) => {
    setDevModeState(on);
    try {
      localStorage.setItem(STORAGE_KEY, on ? "true" : "false");
    } catch {}
  }, []);

  const checkEligibility = useCallback(async () => {
    try {
      const role = await getAdminRole();
      if (role === "admin" || role === "employee") setEligible(true);
    } catch {
      /* silent */
    }
  }, []);

  return { devMode, setDevMode, eligible, checkEligibility };
}
