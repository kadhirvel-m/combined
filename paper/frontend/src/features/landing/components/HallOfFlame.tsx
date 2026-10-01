"use client";

import { Icon } from "@/components/ui/Icon";
import { AppLink } from "@/components/site/AppLink";
import { cn } from "@/lib/cn";
import { useTopStreaks } from "../hooks/useTopStreaks";
import styles from "../landing.module.css";
import { Podium } from "./Podium";

function PodiumBody() {
  const streaks = useTopStreaks(3);

  if (streaks.status === "loading") {
    return (
      <div className="w-full max-w-lg h-48 bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-2xl animate-pulse mx-auto border border-white/20" />
    );
  }
  if (streaks.status === "error") {
    return (
      <div className={cn(styles.glassCard, "px-6 py-4 rounded-xl text-center text-red-500 font-medium text-xs")}>
        Failed to load leaderboard
      </div>
    );
  }
  if (streaks.entries.length === 0) {
    return (
      <div className={cn(styles.glassCard, "px-6 py-4 rounded-xl text-center")}>
        <p className="text-neutral-500 dark:text-neutral-400 font-medium text-sm">No active streaks yet.</p>
      </div>
    );
  }
  return <Podium entries={streaks.entries} />;
}

/** "Hall of Flame": the three longest current streaks on a podium. */
export function HallOfFlame() {
  return (
    <section className="py-8 relative overflow-hidden bg-neutral-50 dark:bg-[#0f0f13]">
      <div className={styles.meshBg}>
        <div className={cn(styles.meshOrb, "bg-brand-500/5 dark:bg-brand-500/20 w-[300px] h-[300px] top-[-50px] left-[-50px]")} />
        <div
          className={cn(styles.meshOrb, "bg-orange-500/5 dark:bg-orange-500/15 w-[200px] h-[200px] bottom-[-20px] right-[-20px]")}
          style={{ animationDelay: "-2s" }}
        />
      </div>

      <div className="container max-w-7xl relative z-10">
        <div className="text-center mb-6">
          <span className="inline-block py-0.5 px-2 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-[10px] font-bold tracking-wider uppercase mb-2 border border-orange-200 dark:border-orange-700/50">
            Leaderboard
          </span>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2 drop-shadow-sm">
            <span
              className={cn(
                "bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-500",
                styles.shimmerText,
              )}
            >
              Hall of Flame
            </span>
          </h2>
          <p className="text-neutral-700 dark:text-neutral-400 text-sm md:text-base max-w-lg mx-auto leading-relaxed font-medium">
            Honoring the consistant learners who are burning bright and leading the revolution.
          </p>
        </div>

        <div className="flex flex-row items-end justify-center gap-3 md:gap-16 min-h-[220px] pb-4">
          <PodiumBody />
        </div>

        <div className="text-center mt-6">
          <AppLink
            href="/leaderboard.html"
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-white/5 border border-neutral-200 dark:border-white/10 hover:border-brand-500 dark:hover:border-brand-400 transition-all hover:shadow-lg hover:-translate-y-0.5 text-sm"
          >
            <span className="font-bold text-neutral-700 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              View Full Leaderboard
            </span>
            <Icon name="arrow_forward" className="text-base text-neutral-400 group-hover:text-brand-500 transition-colors" />
          </AppLink>
        </div>
      </div>
    </section>
  );
}
