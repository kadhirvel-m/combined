import { useEffect, useState } from "react";

function now(): string {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
}

/** "3:30 PM", refreshed every second once `enabled` (the page only starts it with a room id). */
export function useClock(enabled: boolean): string {
  const [time, setTime] = useState("--:-- --");
  useEffect(() => {
    if (!enabled) return;
    const tick = () => setTime(now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [enabled]);
  return time;
}
