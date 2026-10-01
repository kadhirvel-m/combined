"use client";

import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { Lottie } from "@/components/content/Lottie";
import { AppLink } from "@/components/site/AppLink";
import { cn } from "@/lib/cn";
import { DASHBOARD_LOTTIE } from "../data";
import { useLandingSession } from "../hooks/useLandingSession";
import { GoogleSignInButton } from "./GoogleSignInButton";

const group = "flex flex-col sm:flex-row items-center justify-center gap-4";

const wideCta =
  "relative inline-flex w-full sm:w-auto min-w-[260px] items-center justify-center gap-3 rounded-full px-9 py-3 text-base font-semibold transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50";

/** The single wide button a signed-in visitor gets. */
function DashboardCta({
  href,
  icon,
  variant,
  children,
}: {
  href: string;
  icon: string;
  variant: "outline" | "gradient";
  children: ReactNode;
}) {
  return (
    <div className={group}>
      <AppLink
        href={href}
        className={cn(
          wideCta,
          variant === "outline"
            ? "bg-transparent text-brand-900 hover:bg-black/5 hover:shadow-glow-magenta ring-1 ring-brand-900/25 dark:bg-white/10 dark:text-white dark:ring-white/15 dark:hover:bg-white/20"
            : "text-white bg-gradient-to-r from-[#9E4B8A] via-[#B06AB3] to-[#FF7FD1] shadow-[0_10px_30px_-12px_rgba(158,75,138,0.75)] hover:shadow-[0_14px_42px_-16px_rgba(158,75,138,0.9)]",
        )}
      >
        <Icon name={icon} className="text-[20px]" />
        <span>{children}</span>
      </AppLink>
    </div>
  );
}

/**
 * Loader pill. It stays mounted (hidden) once the session is known, like the
 * original: unmounting the player mid-download logs an abort error.
 */
function CtaLoading({ hidden }: { hidden: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-3 rounded-full px-5 py-2.5 ring-1 ring-brand-900/15 bg-white/70 dark:bg-white/10 dark:ring-white/15",
        hidden && "hidden",
      )}
    >
      <div className="w-10 h-10 sm:w-12 sm:h-12 overflow-visible">
        <Lottie src={DASHBOARD_LOTTIE} className="w-full h-full scale-[1.55] origin-center" />
      </div>
      <span className="text-sm font-semibold text-brand-900/80 dark:text-white/80">Preparing your dashboard...</span>
    </div>
  );
}

function SignedOutCtas() {
  return (
    <div className={group}>
      <GoogleSignInButton />
      <AppLink
        href="/login.html"
        className="inline-flex items-center gap-3 rounded-full bg-[#0A66C2] text-white px-6 py-3 text-sm font-semibold hover:shadow-glow-magenta ring-1 ring-black/10 dark:ring-white/15 transition dark:bg-[#084B94] dark:text-[#E6F1FF] dark:hover:bg-[#0B5FB5]"
      >
        <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
        </svg>
        Continue with email
      </AppLink>
    </div>
  );
}

/** Hero call-to-action row: a different set of buttons for each kind of visitor. */
export function HeroCta() {
  const { cta } = useLandingSession();

  return (
    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
      <CtaLoading hidden={cta !== "loading"} />
      {cta === "signed-out" ? <SignedOutCtas /> : null}
      {cta === "student" ? (
        <DashboardCta href="/academicas.html" icon="menu_book" variant="outline">
          NoteX
        </DashboardCta>
      ) : null}
      {cta === "hod" ? (
        <DashboardCta href="/hod/hod_classes.html" icon="menu_book" variant="outline">
          HOD Dashboard
        </DashboardCta>
      ) : null}
      {cta === "teacher" ? (
        <DashboardCta href="/teacher_profile.html" icon="account_circle" variant="gradient">
          Teacher Profile
        </DashboardCta>
      ) : null}
    </div>
  );
}
