"use client";

import { useState, type TouchEvent } from "react";
import { cn } from "@/lib/cn";
import { getAnalytics } from "@/lib/analytics";
import { getLabx, recordTopicHistory } from "../api";
import type { SyllabusTopic } from "../types";
import styles from "../academics.module.css";
import { Glyph } from "./Glyph";

const SWIPE_THRESHOLD = 60;

/** Fetches the cached LabX page and opens it as a blob in a new tab. */
async function openLabxInNewTab(topicName: string) {
  const topic = (topicName || "").trim();
  if (!topic) return;
  try {
    const res = await getLabx(topic);
    if (!res.ok) {
      if (res.status === 404) {
        alert("LabX is not available for this topic yet.");
        return;
      }
      const err = (await res.json().catch(() => ({}))) as { detail?: string; error?: string };
      throw new Error(err?.detail || err?.error || `HTTP ${res.status}`);
    }
    const data = (await res.json()) as { html?: string };
    const html = data?.html || "";
    if (!html) {
      alert("LabX content was empty.");
      return;
    }
    window.open(URL.createObjectURL(new Blob([html], { type: "text/html" })), "_blank");
    void getAnalytics().track("labx_opened", { topic });
  } catch (err) {
    console.warn("[Academics] LabX open failed", err);
    alert((err as Error)?.message || "Unable to open LabX right now.");
  }
}

export interface TopicRowProps {
  topic: SyllabusTopic;
  href: string;
  checked: boolean;
  wishlisted: boolean;
  /** Staff rating 1–3 (other values are not shown). */
  rating?: number;
  hasLabX: boolean;
  onToggle: () => void;
  onWishlist: () => void;
}

/**
 * One topic: completion toggle, notes link, wishlist heart (revealed on
 * hover), staff stars and the LabX / Labs button. Rows keep the original's
 * swipe wrapper (swipe left = done, right = notes), which also means the row
 * content flows inline rather than as flex items.
 */
export function TopicRow({ topic, href, checked, wishlisted, rating, hasLabX, onToggle, onWishlist }: TopicRowProps) {
  const [hover, setHover] = useState(false);
  const [drag, setDrag] = useState<{ startX: number; dx: number; active: boolean }>({ startX: 0, dx: 0, active: false });
  const labUrl = (topic.lab_url || "").trim();

  const onTouchStart = (e: TouchEvent) => setDrag({ startX: e.touches[0].clientX, dx: 0, active: true });
  const onTouchMove = (e: TouchEvent) => {
    if (!drag.active) return;
    const dx = Math.max(-100, Math.min(100, e.touches[0].clientX - drag.startX));
    setDrag((d) => ({ ...d, dx }));
  };
  const onTouchEnd = () => {
    const dx = drag.dx;
    setDrag({ startX: 0, dx: 0, active: false });
    if (dx < -SWIPE_THRESHOLD) {
      onToggle();
      navigator.vibrate?.(30);
    } else if (dx > SWIPE_THRESHOLD) {
      window.open(href, "_blank");
      navigator.vibrate?.(20);
    }
  };

  return (
    <li className="flex items-center gap-2 py-0.5 px-2 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-sm leading-tight">
      <div className={styles.swipeWrap}>
        <div className={cn(styles.swipeAction, styles.swipeLeft, drag.dx < -20 && styles.swipeShow)}>
          <Glyph name="check_circle" className="text-[18px]" />
          {" Done"}
        </div>
        <div className={cn(styles.swipeAction, styles.swipeRight, drag.dx > 20 && styles.swipeShow)}>
          <Glyph name="auto_awesome" className="text-[18px]" />
          {" Notes"}
        </div>
        <div
          className={styles.swipeInner}
          style={{ transform: `translateX(${drag.dx}px)`, transition: drag.active ? "none" : "transform 0.2s ease" }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <button
            type="button"
            data-topic-id={topic.id ?? undefined}
            onClick={onToggle}
            className="p-1 rounded focus:outline-none focus:ring-2 focus:ring-brand-500/40"
          >
            <Glyph name={checked ? "check_circle" : "radio_button_unchecked"} className="text-[20px]" style={{ color: checked ? "#10b981" : "currentColor" }} />
          </button>
          <span className="inline-flex items-center gap-1" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <a
              href={href}
              target="_blank"
              rel="noopener"
              className="text-brand-600 dark:text-brand-300 hover:underline"
              onClick={() => {
                void recordTopicHistory(topic.id, topic.topic);
                void getAnalytics().track("topic_opened", { topic: topic.topic });
              }}
            >
              {topic.topic}
            </a>
            <button
              type="button"
              className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 transition"
              style={{ opacity: wishlisted || hover ? 1 : 0 }}
              title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              onClick={(e) => {
                e.stopPropagation();
                onWishlist();
              }}
            >
              <Glyph
                name="favorite"
                filled={wishlisted}
                className="text-[18px]"
                style={{ color: wishlisted ? "#ef4444" : "currentColor" }}
              />
            </button>
          </span>
          {rating && rating >= 1 && rating <= 3 ? (
            <span className={styles.starDisplay} title={`Staff rating: ${rating} star${rating > 1 ? "s" : ""}`}>
              {Array.from({ length: rating }, (_, s) => (
                <Glyph key={s} name="star" filled className={styles.star} />
              ))}
            </span>
          ) : null}
          {hasLabX ? (
            <button
              type="button"
              title="Open LabX explorable explanation"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void openLabxInNewTab(topic.topic);
              }}
              className="ml-auto inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold ring-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200 hover:shadow-glow transition"
            >
              <Glyph name="science" className="text-[16px]" />
              <span>LabX</span>
            </button>
          ) : labUrl ? (
            <a
              href={labUrl}
              target="_blank"
              rel="noopener"
              title="Open lab material"
              onClick={() => void getAnalytics().track("lab_started", { url: labUrl, topic: topic.topic })}
              className="ml-auto inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold bg-brand-500/10 text-brand-700 dark:text-brandlt-200 ring-1 ring-brand-500/25 hover:bg-brand-500/20 hover:shadow-glow transition"
            >
              <Glyph name="science" className="text-[16px]" />
              <span>Labs</span>
            </a>
          ) : null}
        </div>
      </div>
    </li>
  );
}
