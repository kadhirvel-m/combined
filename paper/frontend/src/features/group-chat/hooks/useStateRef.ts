import { useCallback, useRef, useState, type RefObject } from "react";

type Updater<T> = T | ((prev: T) => T);

/**
 * State that socket/RTC callbacks can also read synchronously: the setter
 * updates `ref.current` immediately (the original page kept these as plain
 * variables) and schedules the re-render.
 */
export function useStateRef<T>(initial: T): [T, (next: Updater<T>) => void, RefObject<T>] {
  const [state, setState] = useState(initial);
  const ref = useRef(initial);
  const set = useCallback((next: Updater<T>) => {
    const value = typeof next === "function" ? (next as (prev: T) => T)(ref.current) : next;
    ref.current = value;
    setState(value);
  }, []);
  return [state, set, ref];
}
