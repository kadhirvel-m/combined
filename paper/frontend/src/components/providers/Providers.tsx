"use client";

import type { ReactNode } from "react";
import { installReactRuntime } from "@/runtime/config/runtime";
import { ThemeProvider } from "@/lib/theme";
import { SessionProvider } from "@/lib/session";
import { ToastProvider } from "@/components/ui/Toast";

// Install the shared browser runtime (API base, cookie/CSRF/refresh fetch
// handling, storage shim, theme manager) before any component renders on the
// client, so React pages share the legacy pages' session handling.
if (typeof window !== "undefined") {
  installReactRuntime();
}

/** App-wide client providers for React pages. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <SessionProvider>
        <ToastProvider>{children}</ToastProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
