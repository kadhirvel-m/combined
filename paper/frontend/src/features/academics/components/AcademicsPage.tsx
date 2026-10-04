"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { useAnalytics } from "@/lib/analytics";
import { useSession } from "@/lib/session";
import { MarkerOverlay } from "@/components/content/MarkerOverlay";
import { toggleProgress, toggleWishlist, updateProfile } from "../api";
import { useAcademicsData } from "../hooks/useAcademicsData";
import { useAccessGuard } from "../hooks/useAccessGuard";
import { useDevMode } from "../hooks/useDevMode";
import { buildProfileUpdatePayload, profileCompleteness, useEducationForm } from "../hooks/useEducationForm";
import { useNotesNavigation } from "../hooks/useNotesNavigation";
import { usePageLoader } from "../hooks/usePageLoader";
import { useStreak } from "../hooks/useStreak";
import { useTopicSuggestions } from "../hooks/useTopicSuggestions";
import type { AcademicProfile } from "../types";
import styles from "../academics.module.css";
import { AcademicsHeader } from "./AcademicsHeader";
import { EducationModal, PhoneModal, type ModalStatus } from "./EducationModals";
import { GarlicSection } from "./GarlicSection";
import { Hero } from "./Hero";
import { MobileSearchSheet } from "./MobileSearchSheet";
import { AccessModal, DevAurora, PageLoaderOverlay } from "./Shell";
import { StreakCard } from "./StreakCard";
import { SyllabusExplorer } from "./SyllabusExplorer";

function updateSet(prev: Set<string>, id: string, on: boolean): Set<string> {
  const next = new Set(prev);
  if (on) next.add(id);
  else next.delete(id);
  return next;
}

/** The Academics hub (ui/academicas.html). */
export function AcademicsPage() {
  useAnalytics();
  const session = useSession();
  const loader = usePageLoader();
  const dev = useDevMode();
  const access = useAccessGuard();
  const { streak, load: loadStreak } = useStreak();
  const edu = useEducationForm();
  const profileRef = useRef<AcademicProfile | null>(null);
  const eduNameInput = useRef<HTMLInputElement>(null);

  // Education / phone prompts.
  const [eduOpen, setEduOpen] = useState(false);
  const [eduName, setEduName] = useState("");
  const [eduStatus, setEduStatus] = useState<ModalStatus | null>(null);
  const [eduSaving, setEduSaving] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [phoneStatus, setPhoneStatus] = useState<ModalStatus | null>(null);
  const [phoneSaving, setPhoneSaving] = useState(false);

  const { prepare } = edu;
  const ensureModalReady = useCallback(
    async (profile: AcademicProfile) => {
      setEduName(String(profile?.name || "").trim());
      await prepare({ ...(profile?.education_entries?.[0] || {}), phone: profile?.phone });
    },
    [prepare],
  );

  const maybeRequire = useCallback(
    async (profile: AcademicProfile) => {
      const { hasName, hasPhone, hasEducation } = profileCompleteness(profile);
      if (hasName && hasEducation && hasPhone) {
        setEduOpen(false);
        setPhoneOpen(false);
        return;
      }
      if (hasName && hasEducation && !hasPhone) {
        setEduOpen(false);
        setPhoneOpen(true);
        return;
      }
      await ensureModalReady(profile);
      setEduOpen(true);
      setPhoneOpen(false);
    },
    [ensureModalReady],
  );

  const { updateProfile: updateNavProfile } = session;
  const { checkEligibility } = dev;
  const data = useAcademicsData({
    setStatus: loader.setStatus,
    onSettled: loader.complete,
    onProfile: (profile) => {
      profileRef.current = profile;
      maybeRequire(profile).catch((err) => console.error("Education modal failed", err));
      updateNavProfile({ name: profile.name, profile_image_url: profile.profile_image_url });
      void checkEligibility();
    },
    onLoaded: () => void loadStreak(),
  });

  const modalOpen = eduOpen || phoneOpen;
  useEffect(() => {
    if (!modalOpen) return;
    document.body.classList.add("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, [modalOpen]);

  const openEditor = useCallback(async () => {
    await ensureModalReady(profileRef.current || {});
    setEduOpen(true);
  }, [ensureModalReady]);

  const closeEdu = useCallback(() => setEduOpen(false), []);

  const saveEducation = async () => {
    try {
      const profile = profileRef.current || {};
      const enteredName = eduName.trim();
      if (!enteredName) {
        setEduStatus({ message: "Please enter your name to continue.", ok: false });
        eduNameInput.current?.focus();
        return;
      }
      const entry = edu.collect() || {};
      const enteredPhone = edu.form.phone.trim().replace(/\D/g, "");
      const semester = Number(entry.current_semester);
      const requiredOk =
        Boolean(String(entry.school || "").trim()) &&
        Boolean(String(entry.degree || "").trim()) &&
        Boolean(String(entry.department || "").trim()) &&
        Boolean(String(entry.batch_range || "").trim()) &&
        Boolean(String(entry.section || "").trim()) &&
        Number.isFinite(semester) &&
        semester > 0 &&
        enteredPhone.length === 10;
      if (!requiredOk) {
        setEduStatus(
          enteredPhone.length > 0 && enteredPhone.length !== 10
            ? { message: "Please enter a valid 10-digit mobile number.", ok: false }
            : { message: "Please select college, degree, department, batch, section, current semester and provide mobile number.", ok: false },
        );
        return;
      }
      setEduSaving(true);
      setEduStatus({ message: "Saving…", ok: true });
      const out = await updateProfile(buildProfileUpdatePayload({ ...profile, name: enteredName, phone: enteredPhone }, [entry]));
      if (!out.ok) {
        setEduStatus({ message: out.detail || "Failed to save education.", ok: false });
        return;
      }
      setEduStatus({ message: "Saved!", ok: true });
      setEduOpen(false);
      edu.invalidate();
      await data.reload();
    } catch (err) {
      console.error(err);
      setEduStatus({ message: "Failed to save education. Please try again.", ok: false });
    } finally {
      setEduSaving(false);
    }
  };

  const savePhone = async () => {
    try {
      const profile = profileRef.current || {};
      const entered = phone.trim().replace(/\D/g, "");
      if (entered.length !== 10) {
        setPhoneStatus({ message: "Please enter a valid 10-digit mobile number.", ok: false });
        return;
      }
      setPhoneSaving(true);
      setPhoneStatus({ message: "Saving…", ok: true });
      const out = await updateProfile(buildProfileUpdatePayload({ ...profile, phone: entered }, profile.education_entries || []));
      if (!out.ok) {
        setPhoneStatus({ message: out.detail || "Failed to save mobile number.", ok: false });
        return;
      }
      setPhoneStatus({ message: "Saved!", ok: true });
      setPhoneOpen(false);
      await data.reload();
    } catch (err) {
      console.error(err);
      setPhoneStatus({ message: "Failed to save mobile number.", ok: false });
    } finally {
      setPhoneSaving(false);
    }
  };

  // Search boxes.
  const stream = data.profile?.degree_stream;
  const nav = useNotesNavigation(dev.devMode, stream);
  const heroSearch = useTopicSuggestions({ onOpen: nav.openFromSearch });
  const syllabusSearch = useTopicSuggestions({ onOpen: nav.openFromSearch });
  const sheetSearch = useTopicSuggestions({ onOpen: nav.openFromSearch, sheet: true });

  // Theater mode (hero search focus dims the page).
  const [theater, setTheater] = useState(false);
  const theaterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onHeroFocusChange = useCallback((focused: boolean) => {
    if (theaterTimer.current) clearTimeout(theaterTimer.current);
    if (focused) setTheater(true);
    else theaterTimer.current = setTimeout(() => setTheater(false), 200);
  }, []);

  // Mobile bottom sheet.
  const [sheetOpen, setSheetOpen] = useState(false);
  const sheetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focusSheet = sheetSearch.focus;
  const openSheet = useCallback(
    (focusDelay: number) => {
      setSheetOpen(true);
      if (sheetTimer.current) clearTimeout(sheetTimer.current);
      sheetTimer.current = setTimeout(focusSheet, focusDelay);
    },
    [focusSheet],
  );
  useEffect(
    () => () => {
      if (theaterTimer.current) clearTimeout(theaterTimer.current);
      if (sheetTimer.current) clearTimeout(sheetTimer.current);
    },
    [],
  );

  // Topic progress and wishlist.
  const { completed, setCompleted, wishlisted, setWishlisted } = data;
  const onToggleTopic = (id: string): boolean => {
    const willCheck = !completed.has(id);
    navigator.vibrate?.(willCheck ? 30 : 15);
    toggleProgress(id, willCheck);
    setCompleted((prev) => updateSet(prev, id, willCheck));
    return willCheck;
  };
  const onToggleWishlist = async (id: string) => {
    const was = wishlisted.has(id);
    setWishlisted((prev) => updateSet(prev, id, !was));
    try {
      const now = await toggleWishlist(id);
      setWishlisted((prev) => updateSet(prev, id, now));
    } catch (err) {
      console.error("[Academics] Wishlist toggle failed", err);
      setWishlisted((prev) => updateSet(prev, id, was));
    }
  };

  return (
    <div className={cn(styles.page, "isolate min-h-screen bg-hero-light dark:bg-hero-dark")}>
      <DevAurora active={dev.devMode} />
      <PageLoaderOverlay loader={loader} />

      <AcademicsHeader
        devMode={dev.devMode}
        devEligible={dev.eligible}
        onDevModeChange={dev.setDevMode}
        onMobileSearch={() => openSheet(100)}
        onEditEducation={() => void openEditor()}
      />

      <GarlicSection />

      <Hero
        search={heroSearch}
        onGenerate={nav.generate}
        onSearchFocusChange={onHeroFocusChange}
        stats={data.stats}
        profile={data.profile}
        onEditEducation={() => void openEditor()}
        streak={<StreakCard data={streak} />}
      />

      <SyllabusExplorer
        bundle={data.bundle}
        search={syllabusSearch}
        onMobileSearchFocus={() => openSheet(350)}
        progressError={data.progressError}
        empty={data.empty}
        state={{
          devMode: dev.devMode,
          stream,
          completed,
          wishlisted,
          onToggleTopic,
          onToggleWishlist: (id) => void onToggleWishlist(id),
          canUseAction: access.canUseAction,
        }}
      />

      <div
        className={cn(styles.searchOverlay, theater && styles.searchOverlayActive)}
        onClick={() => {
          setTheater(false);
          heroSearch.blur();
        }}
      />

      <MobileSearchSheet open={sheetOpen} onClose={() => setSheetOpen(false)} search={sheetSearch} />

      <footer className="py-10 border-t border-black/5 dark:border-white/10 text-center text-xs text-neutral-600 dark:text-white/60">
        © {new Date().getFullYear()} Paper X • Academics Dashboard
      </footer>

      <EducationModal
        open={eduOpen}
        onClose={closeEdu}
        name={eduName}
        nameInput={eduNameInput}
        onNameChange={setEduName}
        form={edu}
        status={eduStatus}
        saving={eduSaving}
        onSave={() => void saveEducation()}
      />
      <PhoneModal open={phoneOpen} phone={phone} onPhoneChange={setPhone} status={phoneStatus} saving={phoneSaving} onSave={() => void savePhone()} />
      <AccessModal open={access.modal.open} title={access.modal.title} message={access.modal.message} onClose={access.close} />

      <MarkerOverlay />
    </div>
  );
}
