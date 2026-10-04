import { cn } from "@/lib/cn";
import type { StreakData, WeekDay } from "../types";
import styles from "../academics.module.css";
import { Glyph } from "./Glyph";

const muted = "text-[10px] text-neutral-500 dark:text-gray-400 uppercase tracking-wider font-semibold";

function CalendarDay({ day }: { day: WeekDay }) {
  const today = day.is_active && day.is_today;
  const completed = day.is_active && !day.is_today;
  return (
    <div className={cn(styles.dayItem, completed && styles.dayCompleted, today && styles.dayToday, !day.is_active && styles.dayFuture)}>
      <div className={cn(styles.dayCircle, today && styles.todayPulse)}>
        {day.is_active ? (
          <Glyph name={day.is_today ? "local_fire_department" : "check"} className="text-xs text-white" />
        ) : (
          <span className="text-[10px] text-neutral-500 dark:text-gray-600">{day.date}</span>
        )}
      </div>
      <span className={cn(styles.dayLabel, today && styles.todayLabel)}>{day.day}</span>
    </div>
  );
}

/** "Learning Streak" card: fire glow + particles, milestone progress and this week's calendar. */
export function StreakCard({ data }: { data: StreakData | null }) {
  const current = data?.current_streak || 0;
  const longest = data?.longest_streak || 0;
  const next = data?.next_milestone || 7;
  const prev = data?.prev_milestone || 0;
  const progress = data?.milestone_progress || 0;
  const week = data?.week_data || [];
  return (
    <div className={cn(styles.glassPanel, styles.streakCard, "rounded-3xl p-3 md:p-6 relative overflow-hidden mt-0 mb-2 md:mt-4")}>
      <div className={cn(styles.streakGlow, "absolute -right-20 -top-20 w-56 h-56 bg-orange-500/20 rounded-full blur-[80px]")} />
      <div className={cn(styles.streakGlowSecondary, "absolute -left-10 -bottom-10 w-32 h-32 bg-red-500/10 rounded-full blur-[60px]")} />

      <div className="flex justify-between items-start z-10 relative">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-neutral-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest">🔥 Learning Streak</span>
            {current >= 3 ? (
              <span className="px-2 py-0.5 bg-orange-500/20 text-orange-500 dark:text-orange-400 text-[9px] font-bold rounded-full border border-orange-500/20">
                ON FIRE
              </span>
            ) : null}
          </div>
          <div className="flex items-baseline gap-2">
            <span className={cn(styles.streakNumber, "text-5xl font-black")}>{current}</span>
            <span className="text-sm font-bold text-neutral-600 dark:text-gray-300">Days</span>
            <span className="text-[10px] text-neutral-500 dark:text-gray-500 ml-2">· Personal Best: {longest}</span>
          </div>
        </div>

        <div className="relative">
          <div className={cn(styles.fireContainer, "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg")}>
            <Glyph name="local_fire_department" className={cn(styles.fireIcon, "text-3xl text-white")} />
          </div>
          <div className={cn(styles.fireParticle, styles.particle1)} />
          <div className={cn(styles.fireParticle, styles.particle2)} />
          <div className={cn(styles.fireParticle, styles.particle3)} />
        </div>
      </div>

      <div className="mt-3 z-10 relative hidden md:block">
        <div className="flex items-center justify-between mb-2">
          <span className={muted}>Next Milestone</span>
          <span className="text-[10px] text-orange-500 dark:text-orange-400 font-bold">{next} Days 🎯</span>
        </div>
        <div className="relative h-2 bg-neutral-200 dark:bg-brand-900 rounded-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20" />
          <div
            className={cn(styles.streakProgressBar, "h-full bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 rounded-full")}
            style={{ width: `${progress}%` }}
          >
            <div className={cn(styles.streakShimmer, "absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent")} />
          </div>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-neutral-500 dark:text-gray-600">{prev} 🔥</span>
          <span className="text-[9px] text-orange-500 font-bold">{current}</span>
          <span className="text-[9px] text-neutral-500 dark:text-gray-600">{next} 🏆</span>
        </div>
      </div>

      <div className="mt-3 z-10 relative hidden md:block">
        <div className="flex items-center justify-between mb-3">
          <span className={muted}>This Week</span>
          <span className="text-[9px] text-neutral-500 dark:text-gray-500">{data?.days_completed || 0}/7 days complete</span>
        </div>
        <div className={cn(styles.calendarGrid, "justify-between items-start")}>
          {week.map((day, i) => (
            <CalendarDay key={i} day={day} />
          ))}
        </div>
      </div>
    </div>
  );
}
