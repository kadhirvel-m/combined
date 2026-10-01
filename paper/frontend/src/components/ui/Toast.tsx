"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

export type ToastTone = "info" | "success" | "error" | "warning";

interface ToastItem {
  id: number;
  message: ReactNode;
  tone: ToastTone;
  action?: { label: string; onClick: () => void };
}

export interface ToastOptions {
  tone?: ToastTone;
  /** Milliseconds before auto-dismiss (default 3200; 0 keeps it open). */
  duration?: number;
  action?: { label: string; onClick: () => void };
}

interface ToastApi {
  toast: (message: ReactNode, options?: ToastOptions) => number;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const icons: Record<ToastTone, string> = { info: "info", success: "check_circle", error: "error", warning: "warning" };
const toneClass: Record<ToastTone, string> = {
  info: "text-sky-300",
  success: "text-emerald-300",
  error: "text-rose-300",
  warning: "text-amber-300",
};

/** Snackbar notifications (bottom-centre), like the original pages' snackbar. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const nextId = useRef(1);
  // The portal target only exists in the browser; render it after hydration.
  // eslint-disable-next-line react-hooks/set-state-in-effect -- mount flag
  useEffect(() => setMounted(true), []);

  const dismiss = useCallback((id: number) => setItems((all) => all.filter((t) => t.id !== id)), []);
  const toast = useCallback(
    (message: ReactNode, options: ToastOptions = {}) => {
      const id = nextId.current++;
      setItems((all) => [...all.slice(-3), { id, message, tone: options.tone ?? "info", action: options.action }]);
      const duration = options.duration ?? 3200;
      if (duration > 0) setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss],
  );
  const api = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {mounted
        ? createPortal(
            <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[120] flex flex-col items-center gap-2 px-4" aria-live="polite">
              {items.map((t) => (
                <div
                  key={t.id}
                  role="status"
                  className="pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl bg-neutral-900/95 px-4 py-3 text-sm text-white shadow-soft-lg ring-1 ring-white/10 backdrop-blur animate-[px-pop_.18s_ease-out]"
                >
                  <Icon name={icons[t.tone]} className={cn("text-lg", toneClass[t.tone])} />
                  <span className="min-w-0 flex-1">{t.message}</span>
                  {t.action ? (
                    <button
                      type="button"
                      className="font-semibold text-brand-300 hover:text-white"
                      onClick={() => {
                        t.action?.onClick();
                        dismiss(t.id);
                      }}
                    >
                      {t.action.label}
                    </button>
                  ) : null}
                </div>
              ))}
            </div>,
            document.body,
          )
        : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
