"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { AccountEmptyState, AccountShell, accountStyles as styles } from "./AccountShell";
import { clearHistory, loadHistory, notesHref, type HistoryItem } from "./api";
import { useSignedInList } from "./useSignedInList";

/** Groups views into Today / Yesterday / This Week / "Month D, YYYY" (insertion order kept). */
function groupByDate(items: HistoryItem[]): [string, HistoryItem[]][] {
  const groups = new Map<string, HistoryItem[]>();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const weekAgo = new Date(today.getTime() - 7 * 86400000);
  for (const item of items) {
    const date = new Date(item.viewed_at ?? "");
    const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const label =
      day >= today
        ? "Today"
        : day >= yesterday
          ? "Yesterday"
          : day >= weekAgo
            ? "This Week"
            : day.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    groups.set(label, [...(groups.get(label) ?? []), item]);
  }
  return [...groups.entries()];
}

function formatTime(value: string | null | undefined): string {
  if (!value) return "";
  return new Date(value).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

/** View History: recently viewed topics grouped by day, with "Clear History". */
export function HistoryPage() {
  const { items, setItems, loading, loaded } = useSignedInList(loadHistory);
  const [clearing, setClearing] = useState(false);

  const onClear = async () => {
    if (!confirm("Are you sure you want to clear your entire history?")) return;
    setClearing(true);
    try {
      await clearHistory();
      setItems([]);
    } catch (err) {
      console.error("Failed to clear history", err);
      alert("Failed to clear history. Please try again.");
    } finally {
      setClearing(false);
    }
  };

  const empty = loaded && items.length === 0;

  return (
    <AccountShell
      active="/history.html"
      loading={loading}
      icon={<Icon name="history" className="text-4xl text-brand-500" />}
      title="View History"
      subtitle="Topics you've recently viewed"
      footer="View History"
      actions={
        loaded && items.length > 0 ? (
          <button
            type="button"
            onClick={onClear}
            disabled={clearing}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ring-1 ring-red-500/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition"
          >
            {clearing ? <Icon name="sync" className="animate-spin text-base" /> : <Icon name="delete_sweep" className="text-base" />}
            {clearing ? "Clearing..." : "Clear History"}
          </button>
        ) : null
      }
    >
      {empty ? (
        <AccountEmptyState
          icon={<Icon name="history" className="text-6xl text-neutral-300 dark:text-white/30 mb-4" />}
          title="No history yet"
          body="Topics you view from the academics page will appear here"
        />
      ) : null}

      <div className="space-y-6">
        {groupByDate(items).map(([label, group]) => (
          <div key={label} className="mb-6">
            <h3 className="text-sm font-semibold text-neutral-500 dark:text-white/60 mb-3 flex items-center gap-2">
              <Icon name="schedule" className="text-base" />
              {label}
            </h3>
            <div className="space-y-2">
              {group.map((item, i) => (
                <div key={`${item.topic_name}-${item.viewed_at}-${i}`} className={cn(styles.glassPanel, "rounded-xl p-4 flex items-center gap-4")}>
                  <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center shrink-0">
                    <Icon name="article" className="text-brand-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <a
                      href={notesHref(item.topic_name)}
                      target="_blank"
                      className="text-base font-medium text-brand-600 dark:text-brand-300 hover:underline block truncate"
                    >
                      {item.topic_name || "Untitled"}
                    </a>
                    <p className="text-xs text-neutral-400 dark:text-white/40 mt-0.5">{formatTime(item.viewed_at)}</p>
                  </div>
                  <a
                    href={notesHref(item.topic_name)}
                    target="_blank"
                    className="inline-flex items-center gap-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-300 px-3 py-1.5 text-xs font-semibold hover:bg-brand-500/20 transition shrink-0"
                  >
                    <Icon name="open_in_new" className="text-sm" />
                    View
                  </a>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AccountShell>
  );
}
