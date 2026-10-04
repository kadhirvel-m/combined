"use client";

import { useCallback, useEffect, useState } from "react";
import { checkAccess } from "../api";

export interface AccessModalState {
  open: boolean;
  title: string;
  message: string;
}

/**
 * Plan checks through POST /api/access/check-and-consume. A refusal opens the
 * "Access Policy Guard" modal (canUseAction() of the original).
 */
export function useAccessGuard() {
  const [modal, setModal] = useState<AccessModalState>({ open: false, title: "Access limit reached", message: "" });

  const show = useCallback((message: string, title = "Access limit reached") => {
    setModal({ open: true, title, message: message || "Your current plan limit has been reached." });
  }, []);

  const close = useCallback(() => setModal((m) => ({ ...m, open: false })), []);

  useEffect(() => {
    if (!modal.open) return;
    document.body.classList.add("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, [modal.open]);

  const canUseAction = useCallback(
    async (action: string, consume = false): Promise<boolean> => {
      try {
        const { ok, data } = await checkAccess(action, consume);
        if (!ok || !data.allowed) {
          const reason = data.reason || data.detail || "Plan limit reached";
          const hasRemaining = !(data.remaining === null || data.remaining === undefined);
          const remaining = hasRemaining ? ` Remaining today: ${data.remaining}` : "";
          show(`${reason}.${remaining}`, action === "subject_open" ? "Daily subject limit reached" : "Access limit reached");
          return false;
        }
        return true;
      } catch {
        show("Unable to verify plan access right now. Please retry.", "Access check unavailable");
        return false;
      }
    },
    [show],
  );

  return { modal, close, canUseAction };
}
