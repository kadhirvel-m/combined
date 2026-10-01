"use client";

import { useEffect, useState } from "react";
import { notesApi } from "../api";
import { getAuthToken, isRealBearer } from "../lib/authToken";
import type { NotesWorkspaceConfig } from "../config";
import type { RolesResponse } from "../types";

/** Which role-gated controls are visible. Everything is hidden until the role lookup succeeds. */
export interface NotesRoleFlags {
  /** Regenerate, Download and the feedback inbox link. */
  privileged: boolean;
  /** Edit toggle and the inline "Edit" action. */
  edit: boolean;
  /** Teacher/HOD "Approve" button. */
  verify: boolean;
  /** Emphasis toggle. */
  emphasis: boolean;
}

const STAFF_ROLES = new Set(["admin", "employee", "teacher", "moderator", "hod"]);
const EDIT_PERMISSIONS = ["edit", "can_edit", "edit_notes", "can_edit_notes", "notes_edit", "manage_notes", "is_employee", "is_admin"];

function evaluate(data: RolesResponse, roles: NotesWorkspaceConfig["roles"]): NotesRoleFlags | null {
  const primary = String(data?.role || data?.user_role || data?.userRole || "")
    .toLowerCase()
    .trim();
  const list = Array.isArray(data?.roles) ? data.roles.map((r) => String(r || "").toLowerCase().trim()) : [];
  const isAdmin = primary === "admin" || list.includes("admin") || data?.is_admin === true;
  const isEmployee = primary === "employee" || list.includes("employee") || data?.is_employee === true;
  let allowed = isAdmin || isEmployee;
  if (roles.allow === "staff") {
    const perms = data && typeof data.permissions === "object" && data.permissions ? data.permissions : {};
    const hasStaffRole = STAFF_ROLES.has(primary) || list.some((r) => STAFF_ROLES.has(r));
    allowed = allowed || hasStaffRole || EDIT_PERMISSIONS.some((key) => perms[key] === true);
  }
  if (!allowed) return null;
  if (!roles.teacherReview) return { privileged: true, edit: true, verify: false, emphasis: true };
  const teacherOrHod = primary === "teacher" || primary === "hod" || list.includes("teacher") || list.includes("hod");
  return { privileged: true, edit: !teacherOrHod, verify: teacherOrHod, emphasis: !teacherOrHod };
}

/** `GET /api/admin/roles/me` → visibility of the staff-only controls. */
export function useRoles(config: NotesWorkspaceConfig): NotesRoleFlags {
  const { roles, authToken } = config;
  const [flags, setFlags] = useState<NotesRoleFlags>({
    privileged: false,
    edit: false,
    verify: false,
    // Pages without teacher review never gated the emphasis toggle.
    emphasis: !roles.teacherReview,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = getAuthToken(authToken);
        if (roles.requireToken && !token) return;
        const useBearer = roles.cookieRetry ? isRealBearer(token) : !!token;
        let res = await notesApi.roles(useBearer ? { Authorization: `Bearer ${token.trim()}` } : {});
        if (!res.ok && roles.cookieRetry && useBearer && (res.status === 401 || res.status === 403)) {
          res = await notesApi.roles({});
        }
        if (!res.ok || cancelled) return;
        const next = evaluate(res.data || {}, roles);
        if (next && !cancelled) setFlags(next);
      } catch {
        /* keep the staff controls hidden */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [roles, authToken]);

  return flags;
}
