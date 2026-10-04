import styles from "../garlic.module.css";

const STATUS_CLASS: Record<string, string> = {
  not_started: styles.stNotStarted,
  in_progress: styles.stInProgress,
  completed: styles.stCompleted,
};

/** `status-chip st-<status>` of the original (unknown statuses get no tint). */
export function statusChipClass(status: string | null | undefined): string {
  return `${styles.chip} ${STATUS_CLASS[String(status || "not_started")] ?? ""}`.trim();
}

/** `metric-chip pri-*` of the original, by priority score. */
export function priorityChipClass(score: number | null | undefined): string {
  const v = Number(score || 0);
  return `${styles.chip} ${v >= 75 ? styles.priHigh : v >= 50 ? styles.priMid : styles.priLow}`;
}

export const metricChipClass = styles.chip;
