import { AppLink } from "@/components/site/AppLink";
import { cn } from "@/lib/cn";
import { batchLabel, nameInitials, profileCompleteness } from "../lib/format";
import type { StudentProfile } from "../types";
import styles from "../profile.module.css";
import { Glyph } from "./Glyph";

/** The gradient strip behind the top of the profile card. */
export function ProfileBanner() {
  return (
    <section className={cn("relative overflow-hidden", styles.hero)}>
      <div className="container relative">
        <div className="rounded-b-3xl h-28 md:h-24 bg-gradient-to-r from-brand-400/80 via-brand-500/70 to-brand-700/80 dark:from-brand-700 dark:via-brand-800 dark:to-brand-900 shadow-[0_18px_60px_rgba(76,42,89,0.35)]" />
      </div>
    </section>
  );
}

const softButton =
  "inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brandlt-100/80 dark:bg-brand-700/30 px-4 py-2 text-sm font-medium text-brand-700 dark:text-brandlt-100 transition hover:border-brand-500/60 hover:shadow-glow";

function verifyTone(score: number): string {
  if (score >= 70) return "bg-emerald-600";
  if (score >= 40) return "bg-amber-600";
  return "bg-rose-600";
}

export interface ProfileHeaderCardProps {
  /** null until /api/me has loaded (placeholders are shown). */
  profile: StudentProfile | null;
  onShowDevices: () => void;
}

/** Avatar, name, headline, quick actions and the completeness bar. */
export function ProfileHeaderCard({ profile, onShowDevices }: ProfileHeaderCardProps) {
  const name = profile ? profile.name || "Add your name" : "--";
  const initials = profile ? nameInitials(name) || "?" : "?";
  const image = profile?.profile_image_url || null;
  const score = Number(profile?.verification_score ?? 0);
  const showBadge = Boolean(profile) && !Number.isNaN(score) && score > 0;
  const pct = profile ? profileCompleteness(profile) : null;

  return (
    <div className="rounded-3xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-brand-900/60 backdrop-blur shadow-card p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-8">
        <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full border-[5px] border-white/90 dark:border-brand-700/60 overflow-hidden bg-brandlt-100 dark:bg-brand-900/50">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element -- user-uploaded image from storage
            <img src={image} alt="Profile picture" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-3xl font-semibold text-brand-700 dark:text-brandlt-100">
              <span>{initials}</span>
            </div>
          )}
          {showBadge ? (
            <div
              className={cn(
                "absolute -bottom-2 -right-2 flex items-center gap-1 rounded-full text-white text-xs px-2 py-1 shadow-brand-lg",
                verifyTone(score),
              )}
            >
              <Glyph name="verified" className="text-sm" />
              <span>{String(score)}</span>
            </div>
          ) : null}
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="pt-10 md:pt-0 font-extrabold text-3xl md:text-4xl tracking-tight text-neutral-900 dark:text-white">{name}</h1>
          <p className="mt-2 text-sm md:text-base text-neutral-600 dark:text-white/70 line-clamp-2">
            {profile?.headline || "Add a headline to introduce yourself."}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-neutral-500 dark:text-white/60">
            <Glyph name="location_on" />
            <span>{profile ? profile.location || "" : "—"}</span>
            <Glyph name="calendar_month" className="ml-3" />
            <span>{(profile && batchLabel(profile)) || "—"}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={onShowDevices} className={cn(softButton, "hidden md:inline-flex")}>
            <Glyph name="devices" className="text-base" /> Devices
          </button>
          <AppLink href="/assignments.html" className={softButton}>
            <Glyph name="assignment" className="text-base" /> Assignments
          </AppLink>
          <AppLink href="/academicas.html" className={softButton}>
            <Glyph name="school" className="text-base" /> Academics
          </AppLink>
          <AppLink
            href="/profile_edit.html"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#9E4B8A] via-[#B06AB3] to-[#FF7FD1] text-white px-5 py-2.5 text-sm font-semibold shadow-[0_14px_30px_rgba(158,75,138,0.28)] hover:shadow-[0_18px_36px_rgba(158,75,138,0.35)] transition"
          >
            <Glyph name="edit" className="text-base" /> Edit Profile
          </AppLink>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-white/65 mb-1">
          <span>Profile completeness</span>
          <span>{pct === null ? "—" : `${pct}%`}</span>
        </div>
        <div className="h-2 rounded-full bg-brandlt-200/60 dark:bg-brand-900/40 overflow-hidden">
          <div className="h-2 bg-brand-500 transition-all duration-500" style={{ width: `${pct ?? 0}%` }} />
        </div>
      </div>
    </div>
  );
}
