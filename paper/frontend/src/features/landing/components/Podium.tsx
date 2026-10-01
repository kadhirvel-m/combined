import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import type { LeaderboardEntry } from "../types";
import styles from "../landing.module.css";

type Rank = 1 | 2 | 3;

interface RankTheme {
  /** Entrance-animation delay / stacking class. */
  item: string;
  ringColor: string;
  avatar: string;
  initial: string;
  avatarWrap: string;
  badge: string;
  labels: string;
  name: string;
  streak: string;
  flame: string;
  block: string;
  numeral: string;
}

const THEMES: Record<Rank, RankTheme> = {
  1: {
    item: cn(styles.podium1, "z-10 -mx-1 md:mx-0"),
    ringColor: "#f59e0b",
    avatar: "w-14 h-14 md:w-20 md:h-20",
    initial: "text-base md:text-2xl",
    avatarWrap: cn("mb-2 md:mb-3 rounded-full", styles.glowGold),
    badge:
      "-bottom-2 lg:-bottom-2.5 px-2 bg-amber-400 dark:bg-yellow-600 text-[10px] md:text-xs text-amber-950 dark:text-white shadow-md",
    labels: "mb-1 md:mb-2",
    name: "text-xs md:text-base font-black text-amber-950 dark:text-white max-w-[80px] md:max-w-[120px]",
    streak:
      "text-[10px] md:text-xs text-amber-800 dark:text-orange-400 bg-amber-100 dark:bg-orange-900/40 px-2 md:px-3 md:py-1 border-amber-200 dark:border-orange-500/30",
    flame: "text-orange-500",
    block:
      "w-24 h-28 md:w-40 md:h-40 pb-3 md:pb-4 shadow-xl shadow-amber-500/20 group-hover:shadow-amber-500/30 transition-all from-amber-300 to-amber-200 dark:from-amber-600/20 border-amber-300",
    numeral: "text-amber-600/50 dark:text-yellow-500/20 text-7xl opacity-80",
  },
  2: {
    item: styles.podium2,
    ringColor: "#94a3b8",
    avatar: "w-10 h-10 md:w-14 md:h-14",
    initial: "text-sm md:text-xl",
    avatarWrap: "mb-2",
    badge:
      "-bottom-2 px-1.5 bg-slate-300 dark:bg-slate-700 text-[9px] md:text-[10px] text-slate-800 dark:text-white shadow-sm",
    labels: "mb-1",
    name: "font-bold text-slate-900 dark:text-white max-w-[60px] md:max-w-[100px] text-[10px] md:text-sm",
    streak:
      "text-[9px] md:text-[10px] text-slate-600 dark:text-neutral-400 bg-white dark:bg-black/20 px-1.5 border-slate-200 dark:border-white/5",
    flame: "text-orange-600 dark:text-orange-500 text-xs",
    block:
      "w-20 h-20 md:w-32 md:h-32 pb-2 opacity-100 group-hover:opacity-100 transition-opacity from-slate-300 to-slate-200 dark:from-gray-700/30 border-slate-300 shadow-inner",
    numeral: "text-slate-500/50 dark:text-gray-400/20 text-4xl md:text-5xl",
  },
  3: {
    item: styles.podium3,
    ringColor: "#c2410c",
    avatar: "w-10 h-10 md:w-14 md:h-14",
    initial: "text-sm md:text-xl",
    avatarWrap: "mb-2",
    badge:
      "-bottom-2 px-1.5 bg-orange-300 dark:bg-orange-700 text-[9px] md:text-[10px] text-orange-900 dark:text-white shadow-sm",
    labels: "mb-1",
    name: "font-bold text-orange-900 dark:text-white max-w-[60px] md:max-w-[100px] text-[10px] md:text-sm",
    streak:
      "text-[9px] md:text-[10px] text-orange-800 dark:text-neutral-400 bg-white dark:bg-black/20 px-1.5 border-orange-200 dark:border-white/5",
    flame: "text-orange-600 dark:text-orange-500 text-xs",
    block:
      "w-20 h-16 md:w-32 md:h-24 pb-2 opacity-100 group-hover:opacity-100 transition-opacity from-orange-300 to-orange-200 dark:from-orange-800/30 border-orange-300 shadow-inner",
    numeral: "text-orange-700/50 dark:text-orange-500/20 text-4xl md:text-5xl",
  },
};

const avatarFace = "w-full h-full rounded-full border-2 border-white dark:border-[#1E1E2F] shadow-md relative z-10";

/** Round avatar with a rank-coloured gradient ring; falls back to the initial. */
function PodiumAvatar({ entry, theme }: { entry: LeaderboardEntry; theme: RankTheme }) {
  const name = entry.name || "";
  return (
    <div className={cn(theme.avatar, styles.avatarRing)} style={{ "--ring-color": theme.ringColor } as CSSProperties}>
      {entry.profile_image_url ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote user avatars from arbitrary hosts
        <img src={entry.profile_image_url} alt={name} className={cn(avatarFace, "object-cover")} />
      ) : (
        <div
          className={cn(
            avatarFace,
            "bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-white/10 dark:to-white/5 flex items-center justify-center font-bold text-neutral-600 dark:text-white",
            theme.initial,
          )}
        >
          {(name || "?").charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}

/** One step of the podium: avatar, rank badge, name, streak and the block. */
export function PodiumPlace({ entry, rank }: { entry: LeaderboardEntry; rank: Rank }) {
  const theme = THEMES[rank];
  return (
    <div className={cn(styles.podiumItem, theme.item, "flex flex-col items-center group")}>
      <div className={cn("relative transition-transform group-hover:-translate-y-1 duration-300", theme.avatarWrap)}>
        {rank === 1 ? (
          <Icon
            name="crown"
            className={cn(
              "absolute -top-5 md:-top-6 left-1/2 -translate-x-1/2 text-2xl md:text-3xl text-amber-500 dark:text-yellow-400",
              styles.crownIcon,
            )}
          />
        ) : null}
        <PodiumAvatar entry={entry} theme={theme} />
        <div
          className={cn(
            "absolute left-1/2 -translate-x-1/2 py-0.5 rounded-full flex items-center justify-center font-black border-2 border-white dark:border-[#1E1E2F] z-20",
            theme.badge,
          )}
        >
          #{rank}
        </div>
      </div>
      <div className={cn("text-center", theme.labels)}>
        <div className={cn("truncate", theme.name, "leading-tight")}>{entry.name}</div>
        <div
          className={cn(
            "font-bold mt-0.5 flex items-center justify-center gap-0.5 md:gap-1 py-0.5 rounded-full border",
            theme.streak,
          )}
        >
          <span className={theme.flame}>🔥</span> {entry.current_streak}
        </div>
      </div>
      <div
        className={cn(
          "rounded-t-xl md:rounded-t-2xl border border-b-0 relative overflow-hidden flex items-end justify-center bg-gradient-to-b dark:to-transparent dark:border-white/5",
          theme.block,
        )}
      >
        {rank === 1 ? (
          <div className="absolute bottom-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-60" />
        ) : null}
        <div className={cn("relative font-black", theme.numeral)}>{rank}</div>
      </div>
    </div>
  );
}

/** Keeps the winner centred when second or third place is empty. */
function PodiumSpacer() {
  return <div className="hidden md:block w-20" />;
}

/** Podium for up to three entries, shown as #2 · #1 · #3. */
export function Podium({ entries }: { entries: LeaderboardEntry[] }) {
  const [first, second, third] = entries;
  return (
    <>
      {second ? <PodiumPlace entry={second} rank={2} /> : <PodiumSpacer />}
      {first ? <PodiumPlace entry={first} rank={1} /> : null}
      {third ? <PodiumPlace entry={third} rank={3} /> : <PodiumSpacer />}
    </>
  );
}
