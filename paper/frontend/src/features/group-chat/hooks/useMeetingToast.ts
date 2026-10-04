import { useCallback, useEffect, useRef, useState } from "react";
import type { ShowToast } from "../types";

export interface MeetingToastState {
  message: string;
  icon: string;
  show: boolean;
}

/**
 * The page's single glass toast (`showToast`). Like the original, every call
 * schedules its own hide and never cancels an earlier one, so an older timer
 * can hide a newer toast early.
 */
export function useMeetingToast(): [MeetingToastState, ShowToast] {
  const [toast, setToast] = useState<MeetingToastState>({ message: "", icon: "check_circle", show: false });
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());

  const showToast = useCallback<ShowToast>((message, icon = "check_circle", duration = 3000) => {
    setToast({ message, icon, show: true });
    const timer = setTimeout(() => {
      timers.current.delete(timer);
      setToast((t) => ({ ...t, show: false }));
    }, duration);
    timers.current.add(timer);
  }, []);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
      pending.clear();
    };
  }, []);

  return [toast, showToast];
}
