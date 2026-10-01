"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { AccountEmptyState, AccountShell, accountStyles as styles } from "./AccountShell";
import { loadWishlist, notesHref, removeFromWishlist, type WishlistItem } from "./api";
import { useSignedInList } from "./useSignedInList";

function formatAdded(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  const days = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString();
}

function WishlistCard({ item, onRemoved }: { item: WishlistItem; onRemoved: () => void }) {
  const [removing, setRemoving] = useState(false);
  const remove = async () => {
    setRemoving(true);
    try {
      await removeFromWishlist(item.topic_id);
      onRemoved();
    } catch (err) {
      console.error("Failed to remove", err);
      setRemoving(false);
    }
  };
  return (
    <div className={cn(styles.glassPanel, "rounded-2xl p-5 flex items-center gap-4")}>
      <div className="flex-1 min-w-0">
        <a
          href={notesHref(item.topic_name)}
          target="_blank"
          className="text-lg font-semibold text-brand-600 dark:text-brand-300 hover:underline block truncate"
        >
          {item.topic_name || "Untitled"}
        </a>
        <p className="text-sm text-neutral-500 dark:text-white/60 mt-1">
          {item.course_code || ""} {item.course_title ? `• ${item.course_title}` : ""} {item.unit_title ? `• ${item.unit_title}` : ""}
        </p>
        <p className="text-xs text-neutral-400 dark:text-white/40 mt-1">Added {formatAdded(item.created_at)}</p>
      </div>
      <div className="flex items-center gap-2">
        <a
          href={notesHref(item.topic_name)}
          target="_blank"
          className="inline-flex items-center gap-1 rounded-full bg-brand-500 text-white px-4 py-2 text-sm font-semibold hover:shadow-glow transition"
        >
          <Icon name="auto_stories" className="text-base" />
          Study
        </a>
        <button
          type="button"
          onClick={remove}
          disabled={removing}
          title="Remove from wishlist"
          className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-500/20 text-red-500 transition"
        >
          <Icon name="delete" />
        </button>
      </div>
    </div>
  );
}

/** My Wishlist: saved topics with Study and Remove actions. */
export function WishlistPage() {
  const { items, setItems, loading, loaded } = useSignedInList(loadWishlist);
  const count = items.length;

  return (
    <AccountShell
      active="/wishlist.html"
      loading={loading}
      icon={<Icon name="favorite" filled className="text-4xl text-red-500" />}
      title="My Wishlist"
      subtitle="Topics you've saved for later"
      footer="Your Wishlist"
      actions={<span className="text-sm text-neutral-500 dark:text-white/60">{`${count} topic${count !== 1 ? "s" : ""}`}</span>}
    >
      {loaded && count === 0 ? (
        <AccountEmptyState
          icon={<Icon name="favorite_border" className="text-6xl text-neutral-300 dark:text-white/30 mb-4" />}
          title="Your wishlist is empty"
          body="Add topics to your wishlist by clicking the heart icon on the academics page"
        />
      ) : null}
      <div className="space-y-4">
        {items.map((item) => (
          <WishlistCard
            key={item.topic_id}
            item={item}
            onRemoved={() => setItems((all) => all.filter((x) => x.topic_id !== item.topic_id))}
          />
        ))}
      </div>
    </AccountShell>
  );
}
