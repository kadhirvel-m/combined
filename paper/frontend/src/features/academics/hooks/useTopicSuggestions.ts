"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { searchTopics } from "../api";
import type { TopicSuggestion } from "../types";

export interface TopicSuggestionsOptions {
  /** Opens the notes page for a topic (plan check + navigation). */
  onOpen: (topic: string) => Promise<void>;
  /**
   * The bottom-sheet box: no click-outside closing below 768px, and the
   * sheet's second input handler of the original hid the list right away for
   * queries under 2 characters and 300ms after any other input.
   */
  sheet?: boolean;
}

/**
 * Notes-topic autocomplete (setupSearch() of the original): GET
 * /api/notes/topics/search debounced 500ms with the previous request aborted,
 * arrow-key selection, Enter to open, Escape / click outside to close.
 */
export function useTopicSuggestions({ onOpen, sheet = false }: TopicSuggestionsOptions) {
  const [value, setValue] = useState("");
  const [items, setItems] = useState<TopicSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const valueRef = useRef("");
  const aborter = useRef<AbortController | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sheetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const input = useRef<HTMLInputElement | null>(null);
  const wrap = useRef<HTMLDivElement | null>(null);
  const itemEls = useRef<(HTMLLIElement | null)[]>([]);

  const hide = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);

  const render = useCallback((list: TopicSuggestion[]) => {
    setItems(list);
    setActiveIndex(-1);
    setOpen(list.length > 0);
  }, []);

  /** The debounced input handler; reads the box's value when it fires. */
  const schedule = useCallback(() => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      const q = valueRef.current.trim();
      if (!q) {
        render([]);
        return;
      }
      aborter.current?.abort();
      const controller = new AbortController();
      aborter.current = controller;
      let list: TopicSuggestion[] | null;
      try {
        list = await searchTopics(q, controller.signal);
      } catch (e) {
        if ((e as Error)?.name === "AbortError") list = null;
        else {
          console.error(e);
          list = [];
        }
      }
      if (list === null) return;
      render(list);
    }, 500);
  }, [render]);

  useEffect(
    () => () => {
      if (debounce.current) clearTimeout(debounce.current);
      if (sheetTimer.current) clearTimeout(sheetTimer.current);
      aborter.current?.abort();
    },
    [],
  );

  // Close on click outside (not for the sheet on mobile).
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (sheet && window.innerWidth < 768) return;
      const target = e.target as Node | null;
      if (wrap.current && target && !wrap.current.contains(target) && target !== input.current) hide();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [hide, sheet]);

  useEffect(() => {
    if (activeIndex < 0) return;
    try {
      itemEls.current[activeIndex]?.scrollIntoView({ block: "nearest" });
    } catch {}
  }, [activeIndex]);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    valueRef.current = next;
    setValue(next);
    schedule();
    if (sheet) {
      if (sheetTimer.current) clearTimeout(sheetTimer.current);
      if (next.trim().length < 2) setOpen(false);
      else sheetTimer.current = setTimeout(() => setOpen(false), 300);
    }
  };

  const pick = async (topic: string, fill: boolean) => {
    if (!topic) return;
    if (fill) {
      valueRef.current = topic;
      setValue(topic);
    }
    hide();
    await onOpen(topic);
  };

  const onKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open) {
      if (e.key === "Enter") {
        const val = valueRef.current.trim();
        if (val) {
          e.preventDefault();
          await onOpen(val);
        }
      }
      return;
    }
    const last = items.length - 1;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, Math.min(last, i + 1)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, Math.min(last, i - 1)));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && items.length) {
        await pick(items[activeIndex]?.topic || "", true);
      } else {
        const val = valueRef.current.trim();
        if (val) {
          hide();
          await onOpen(val);
        }
      }
    } else if (e.key === "Escape") {
      hide();
    }
  };

  const onFocus = () => {
    if (valueRef.current.trim().length > 0) schedule();
  };

  /** mousedown on a suggestion: keep focus, open without filling the box. */
  const onItemMouseDown = (topic: string) => (e: { preventDefault: () => void }) => {
    e.preventDefault();
    void pick(topic, false);
  };

  const setInputEl = useCallback((el: HTMLInputElement | null) => {
    input.current = el;
  }, []);
  const setWrapEl = useCallback((el: HTMLDivElement | null) => {
    wrap.current = el;
  }, []);
  const setItemEl = useCallback((idx: number, el: HTMLLIElement | null) => {
    itemEls.current[idx] = el;
  }, []);
  const focusInput = useCallback(() => input.current?.focus(), []);
  const blurInput = useCallback(() => input.current?.blur(), []);

  return {
    value,
    items,
    open,
    activeIndex,
    /** Callback refs for the input, the dropdown and each suggestion. */
    setInputEl: setInputEl,
    setWrapEl: setWrapEl,
    setItemEl: setItemEl,
    focus: focusInput,
    blur: blurInput,
    onChange,
    onKeyDown,
    onFocus,
    onItemMouseDown,
  };
}
