"use client";

import { cn } from "@/lib/cn";
import { formatDeviceTime } from "../lib/format";
import type { DeviceSession } from "../types";
import type { useDevices } from "../hooks/useDevices";
import { Dialog } from "./Dialog";
import { PIcon } from "./Glyph";

// Several colour classes of the original (rose/emerald borders and tints,
// dark amber/rose text, the backdrop tint) had no rule in its stylesheet, so
// these buttons and the backdrop render without them.

function deviceKey(device: DeviceSession, index: number): string {
  return `${device.session_id || ""}|${device.family_id || ""}|${index}`;
}

function DeviceCard({ device, busy, onSignOut }: { device: DeviceSession; busy: boolean; onSignOut: () => void }) {
  const lines = [
    `IP: ${device.ip || "Unknown"}`,
    `Last login: ${formatDeviceTime(device.last_login)}`,
    `Last active: ${formatDeviceTime(device.last_active)}`,
    `Browser: ${device.browser || "Unknown"}`,
    `OS: ${device.os || "Unknown"}`,
    `Location: ${device.location || "Unknown"}`,
  ];
  return (
    <article className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/85 dark:bg-brand-900/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
          {`${device.device_model || "Unknown device"} • ${device.device_type || "Unknown"}`}
        </h4>
        {device.is_current ? (
          <span className="inline-flex items-center rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border px-2 py-0.5 text-xs font-medium">
            Current device
          </span>
        ) : null}
      </div>
      <div className="mt-3 grid gap-1 text-xs text-black/70 dark:text-white/70">
        {lines.map((line) => (
          <p key={line.slice(0, line.indexOf(":"))}>{line}</p>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-end">
        <button
          type="button"
          disabled={busy}
          onClick={onSignOut}
          className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition", busy && "opacity-60")}
        >
          <PIcon name="logout" className="text-sm" />
          <span>Sign out</span>
        </button>
      </div>
    </article>
  );
}

/** "Logged-in Devices": active sessions with per-device and bulk sign-out. */
export function DevicesDialog({ devices: state }: { devices: ReturnType<typeof useDevices> }) {
  const { open, close, devices, status, bulkBusy, busyKeys, signOutAll, signOutOne } = state;
  return (
    <Dialog
      open={open}
      onClose={close}
      title="Logged-in Devices"
      description="Active sessions currently signed in to your account."
      panelClassName="max-w-3xl"
      headerAction={
        <button
          type="button"
          onClick={close}
          aria-label="Close devices list"
          className="inline-flex items-center justify-center size-9 rounded-full border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 transition"
        >
          <PIcon name="close" />
        </button>
      }
    >
      {status === null ? null : <p className="mt-4 text-sm dark:text-white/65">{status}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={bulkBusy}
          onClick={() => void signOutAll("current")}
          className={cn("inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition", bulkBusy && "opacity-60")}
        >
          <PIcon name="logout" className="text-base" />
          <span>Sign out this device</span>
        </button>
        <button
          type="button"
          disabled={bulkBusy}
          onClick={() => void signOutAll("others")}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-700 transition",
            bulkBusy && "opacity-60",
          )}
        >
          <PIcon name="devices" className="text-base" />
          <span>Sign out other devices</span>
        </button>
      </div>
      <div className="mt-4 max-h-[60vh] overflow-y-auto grid gap-3 pr-1">
        {devices.map((device, i) => {
          const key = deviceKey(device, i);
          return <DeviceCard key={key} device={device} busy={busyKeys.has(key)} onSignOut={() => void signOutOne(device, key)} />;
        })}
      </div>
    </Dialog>
  );
}
