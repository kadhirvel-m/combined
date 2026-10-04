"use client";

import { useState } from "react";
import { Lottie } from "@/components/content/Lottie";
import { SiteHeader } from "@/components/site/SiteHeader";
import type { NavLink } from "@/components/site/nav-data";
import { cn } from "@/lib/cn";
import { useDevices } from "../hooks/useDevices";
import { useMyProfile } from "../hooks/useMyProfile";
import { requiredCompletion } from "../lib/format";
import type { StudentProfile } from "../types";
import styles from "../profile.module.css";
import { EducationRequiredDialog, PhoneRequiredDialog, type Notice } from "./CompletionDialogs";
import { DevicesDialog } from "./DevicesDialog";
import { ProfileBanner, ProfileHeaderCard } from "./ProfileHeader";
import { AboutPanel, ActivityPanel, OverviewPanel, ProfileTabBar, type ProfileTab } from "./ProfilePanels";

const PROFILE_NAV: NavLink[] = [
  { label: "Home", href: "/index.html" },
  { label: "About", href: "/about.html" },
  { label: "Support", href: "/contact.html" },
];

const PROFILE_MOBILE_NAV: NavLink[] = [
  { label: "Home", href: "/index.html" },
  { label: "About", href: "/about.html" },
  { label: "Opportunities", href: "/postings.html" },
  { label: "My applications", href: "/my_applications.html" },
  { label: "Support", href: "/contact.html" },
];

const LOADER_ANIMATION = "https://lottie.host/848055f4-11c7-4032-80e0-d51319c33bca/lF6845uqpU.lottie";

/** The signed-in student's profile dashboard (profile.html). */
export function ProfilePage() {
  const { profile, status, loader, reload } = useMyProfile();
  const devices = useDevices();
  const [tab, setTab] = useState<ProfileTab>("overview");
  // The completion prompt closes on save and is re-evaluated for the reloaded profile.
  const [savedFor, setSavedFor] = useState<StudentProfile | null>(null);
  const [formGeneration, setFormGeneration] = useState(0);
  const [eduNotice, setEduNotice] = useState<Notice | null>(null);
  const [phoneNotice, setPhoneNotice] = useState<Notice | null>(null);
  const completion = profile && profile !== savedFor ? requiredCompletion(profile) : "none";

  const onCompletionSaved = () => {
    setSavedFor(profile);
    setFormGeneration((n) => n + 1); // a fresh form next time it is needed
    void reload();
  };

  return (
    <div className={cn("relative min-h-screen bg-hero-light dark:bg-hero-dark", styles.page)}>
      {/* Kept mounted once hidden (display:none), so the animation request is never aborted. */}
      <div
        className={cn(styles.loader, loader !== "visible" && styles.loaderDone, loader === "gone" && "hidden")}
        aria-hidden={loader !== "visible"}
      >
        <Lottie src={LOADER_ANIMATION} className="w-[300px] h-[300px]" />
      </div>

      <SiteHeader
        links={PROFILE_NAV}
        projectsMenu={false}
        mobileLinks={PROFILE_MOBILE_NAV}
        mobileAccountActions={[{ label: "Devices", icon: "devices", onClick: devices.show }]}
      />

      <ProfileBanner />

      <main className="container -mt-16 md:-mt-20 pb-20 space-y-8">
        <ProfileHeaderCard profile={profile} onShowDevices={devices.show} />

        <section className="mt-8">
          <ProfileTabBar value={tab} onChange={setTab} />
          <div className="mt-4 grid gap-4">
            {tab === "overview" ? <OverviewPanel profile={profile} /> : null}
            {tab === "about" ? <AboutPanel profile={profile} /> : null}
            {tab === "activity" ? <ActivityPanel profile={profile} /> : null}
          </div>
          <p className="mt-6 text-sm text-black/60 dark:text-white/60">{status}</p>
        </section>
      </main>

      <footer className="mt-12 border-t border-black/5 dark:border-white/10">
        <div className="container py-10 text-xs md:text-sm text-neutral-600 dark:text-white/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p>© {new Date().getFullYear()} Paper X. Crafted for ambitious learners.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-brandlt-900 dark:hover:text-white">
              Privacy
            </a>
            <a href="#" className="hover:text-brandlt-900 dark:hover:text-white">
              Terms
            </a>
            <a href="#" className="hover:text-brandlt-900 dark:hover:text-white">
              Support
            </a>
          </div>
        </div>
      </footer>

      <DevicesDialog devices={devices} />
      {profile && completion === "education" ? (
        <EducationRequiredDialog
          key={formGeneration}
          profile={profile}
          onSaved={onCompletionSaved}
          notice={eduNotice}
          onNotice={setEduNotice}
        />
      ) : null}
      {/* Stays mounted (like the original's static markup) so a typed number survives a reopen. */}
      {profile ? (
        <PhoneRequiredDialog
          open={completion === "phone"}
          profile={profile}
          onSaved={onCompletionSaved}
          notice={phoneNotice}
          onNotice={setPhoneNotice}
        />
      ) : null}
    </div>
  );
}
