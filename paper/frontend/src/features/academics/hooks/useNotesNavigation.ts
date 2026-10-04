"use client";

import { useCallback } from "react";
import { hardNavigate } from "@/lib/routes";
import { checkAccess } from "../api";
import { generalNotesHref } from "../lib/topics";

/**
 * Opening a topic from a search box or the hero "Generate" button: a
 * non-consuming `topic_open` plan check (refusals are alerts here, not the
 * modal), then a full-page load of the right notes page.
 */
export function useNotesNavigation(devMode: boolean, stream: string | null | undefined) {
  /** openNotesGenerator() of the search boxes. */
  const openFromSearch = useCallback(
    async (topic: string) => {
      try {
        const { ok, data } = await checkAccess("topic_open", false);
        if (!ok) {
          alert(data && data.detail ? data.detail : "Access check failed. Please retry.");
          return;
        }
        if (!data.allowed) {
          const reason = data.reason || "Plan limit reached";
          const remaining = data.remaining === null || data.remaining === undefined ? "" : ` Remaining today: ${data.remaining}`;
          alert(`${reason}.${remaining}`);
          return;
        }
      } catch {
        alert("Unable to verify plan access right now. Please retry.");
        return;
      }
      hardNavigate(generalNotesHref(topic, devMode, stream));
    },
    [devMode, stream],
  );

  /** The hero "Generate" button (same check, slightly different messages). */
  const generate = useCallback(
    async (topic: string) => {
      try {
        const { ok, data } = await checkAccess("topic_open", false);
        if (!ok || !data.allowed) {
          const reason = (data && (data.reason || data.detail)) || "Plan limit reached";
          const remaining = data && (data.remaining === null || data.remaining === undefined) ? "" : ` Remaining today: ${data.remaining}`;
          alert(`${reason}.${remaining}`);
          return;
        }
        hardNavigate(generalNotesHref(topic, devMode, stream));
      } catch {
        alert("Unable to verify plan access right now. Please retry.");
      }
    },
    [devMode, stream],
  );

  return { openFromSearch, generate };
}
