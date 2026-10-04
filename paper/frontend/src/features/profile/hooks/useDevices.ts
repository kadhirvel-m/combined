"use client";

import { useCallback, useState } from "react";
import { hardNavigate } from "@/lib/routes";
import { clearLocalAuth, fetchDevices, signOutDeviceSessions, SignedOutError } from "../api";
import type { DeviceSession } from "../types";

function messageOf(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

/** 401 from the devices API: back to the login page (with `next` for the list request). */
function redirectSignedOut(err: SignedOutError) {
  if (err.withNext) {
    const next = `${location.pathname}${location.search || ""}${location.hash || ""}`;
    hardNavigate(`/login.html?next=${encodeURIComponent(next)}`);
  } else {
    hardNavigate("/login.html");
  }
}

/**
 * The "Logged-in Devices" dialog: lists active sessions and signs out this
 * device, all other devices, or one session. `status` is the line under the
 * header (null hides it).
 */
export function useDevices() {
  const [open, setOpen] = useState(false);
  const [devices, setDevices] = useState<DeviceSession[]>([]);
  const [status, setStatus] = useState<string | null>("");
  const [bulkBusy, setBulkBusy] = useState(false);
  const [busyKeys, setBusyKeys] = useState<ReadonlySet<string>>(new Set());

  const load = useCallback(async () => {
    setStatus("Loading your active devices...");
    try {
      const rows = await fetchDevices();
      setDevices(rows);
      setStatus(rows.length ? null : "No active devices found.");
    } catch (err) {
      if (err instanceof SignedOutError) return redirectSignedOut(err);
      setStatus(messageOf(err, "Failed to load devices."));
    }
  }, []);

  const show = useCallback(() => {
    setOpen(true);
    void load();
  }, [load]);

  const close = useCallback(() => setOpen(false), []);

  const signOutAll = useCallback(
    async (action: "current" | "others") => {
      setBulkBusy(true);
      setStatus(action === "current" ? "Signing out this device..." : "Signing out other devices...");
      try {
        await signOutDeviceSessions({ action }, "Failed to update sessions");
        if (action === "current") {
          clearLocalAuth();
          hardNavigate("/login.html");
          return;
        }
        setStatus("Signed out from all other devices.");
        await load();
      } catch (err) {
        if (err instanceof SignedOutError) return redirectSignedOut(err);
        setStatus(messageOf(err, "Failed to update sessions."));
      } finally {
        setBulkBusy(false);
      }
    },
    [load],
  );

  const signOutOne = useCallback(
    async (device: DeviceSession, key: string) => {
      setBusyKeys((keys) => new Set(keys).add(key));
      setStatus("Signing out selected device...");
      try {
        const out = await signOutDeviceSessions(
          {
            action: "session",
            session_id: String(device.session_id || "").trim(),
            family_id: String(device.family_id || "").trim(),
          },
          "Failed to sign out selected device",
        );
        if (out?.current || device.is_current) {
          clearLocalAuth();
          hardNavigate("/login.html");
          return;
        }
        setStatus("Selected device signed out.");
        await load();
      } catch (err) {
        if (err instanceof SignedOutError) return redirectSignedOut(err);
        setStatus(messageOf(err, "Failed to sign out selected device."));
      } finally {
        setBusyKeys((keys) => {
          const next = new Set(keys);
          next.delete(key);
          return next;
        });
      }
    },
    [load],
  );

  return { open, show, close, devices, status, bulkBusy, busyKeys, signOutAll, signOutOne };
}
