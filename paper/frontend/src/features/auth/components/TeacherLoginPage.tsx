"use client";

import { useState, type FormEvent } from "react";
import { Turnstile } from "@/components/content/Turnstile";
import { AppLink } from "@/components/site/AppLink";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { getHodMe, getTeacherStatus, postLogin } from "../api";
import { TEACHER_TURNSTILE_MESSAGES, useTurnstileGate } from "../hooks/useTurnstileGate";
import { getTeacherRedirect, HOD_HOME, navigateTo, TEACHER_HOME } from "../lib/redirects";
import { normalizeErrorMessage, safeJson } from "../lib/responses";
import { persistTeacherSession } from "../lib/session-storage";
import type { AuthTokenResponse, TeacherStatusResponse } from "../types";
import { AuthCard, LegalNote, StatusMessage } from "./AuthCard";
import { AuthHeader } from "./AuthHeader";
import { CHIP_PLUM, HeroBullets, HeroGradient, HeroPill, HeroTitle, HeroVideo } from "./AuthHero";
import { AuthShell } from "./AuthShell";
import { PasswordField, SubmitButton, TextField } from "./fields";
import { PendingApprovalModal } from "./PendingApprovalModal";
import { TEACHER_LOGIN_NAV } from "./nav";

/** Teacher pages have no ink heading rule: headings keep the body text colour. */
const BODY_HEADING = "!text-neutral-900 dark:!text-white";

async function hasHodAccess(token: string): Promise<boolean> {
  try {
    const res = await getHodMe(token);
    return !!res.ok;
  } catch {
    return false;
  }
}

/** teachers/teacher_login.html: teacher / HOD sign-in with approval status check. */
export function TeacherLoginPage() {
  const [status, setStatus] = useState({ visible: false, text: "" });
  const [pendingOpen, setPendingOpen] = useState(false);
  const friendlyError = (text: string) => setStatus({ visible: true, text });
  const setStatusText = (text: string) => setStatus((s) => ({ ...s, text }));
  const {
    ref: turnstileRef,
    token: turnstileToken,
    theme: turnstileTheme,
    onToken,
    onError,
    reset: resetTurnstile,
  } = useTurnstileGate(TEACHER_TURNSTILE_MESSAGES, friendlyError);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const token = turnstileToken;
    if (!token) {
      friendlyError("Please complete Turnstile verification before signing in.");
      return;
    }
    setStatusText("Logging in...");
    const fd = new FormData(e.currentTarget);
    const body = { email: String(fd.get("email") || "").trim(), password: fd.get("password"), turnstile_token: token };
    if (!body.email || !body.password) {
      friendlyError("Email & password required");
      return;
    }
    try {
      const res = await postLogin(body);
      const data = await safeJson<AuthTokenResponse>(res);
      if (!res.ok) {
        const message = normalizeErrorMessage(data.detail || data.error, "Login failed (" + res.status + ")");
        resetTurnstile();
        throw new Error(message);
      }
      if (!data.access_token) throw new Error("No access token returned");
      // Persist token for teacher pages that rely on Authorization headers from storage.
      persistTeacherSession(data.access_token, data.refresh_token);
      setStatus({ visible: true, text: "Signed in. Checking role..." });
      const st = await getTeacherStatus();
      if (!st.ok) {
        console.warn("[login] status check failed", st.status);
        friendlyError("Could not verify role (status " + st.status + ").");
        return;
      }
      const sdata = await safeJson<TeacherStatusResponse>(st);
      const role = sdata.role;
      const tstatus = sdata.status;

      if (tstatus === "approved") {
        setStatusText("Approved. Redirecting...");
        const next = getTeacherRedirect();
        if (next) {
          setTimeout(() => navigateTo(next), 400);
          return;
        }
        const isHod = role === "hod" || (await hasHodAccess(data.access_token));
        setTimeout(() => navigateTo(isHod ? HOD_HOME : TEACHER_HOME), 600);
      } else if (tstatus === "pending") {
        setStatus((s) => ({ ...s, visible: false }));
        setPendingOpen(true);
      } else if (tstatus) {
        setStatusText("Application status: " + tstatus + ".");
      } else {
        setStatusText("Logged in. Application not found / pending.");
      }
    } catch (err) {
      friendlyError((err instanceof Error && err.message) || "Unexpected error");
    }
  }

  return (
    <AuthShell
      overlays={<PendingApprovalModal open={pendingOpen} onClose={() => setPendingOpen(false)} />}
      header={
        <AuthHeader
          logoLabel="Paper X Home"
          logoClassName="h-9"
          barClassName="py-3"
          links={TEACHER_LOGIN_NAV}
          actions={<ThemeToggle compact className="size-auto gap-2 px-3 py-1.5 text-sm [&>span]:text-base" />}
        />
      }
      hero={
        <div className="space-y-6">
          <HeroPill>Teacher Portal</HeroPill>
          <HeroTitle className={BODY_HEADING}>
            Sign in to <HeroGradient>Teacher Connect</HeroGradient>
          </HeroTitle>
          <HeroVideo src="/assets/video/signup.mp4" />
          <HeroBullets
            items={[
              { icon: "verified", text: "Admin-approved teacher access." },
              { icon: "forum", text: "Collaborate, share notes, message students.", chipClassName: CHIP_PLUM },
              { icon: "shield_person", text: "Secure login backed by Supabase." },
            ]}
          />
        </div>
      }
    >
      <AuthCard title="Welcome back, Teacher" titleClassName={BODY_HEADING} subtitle="Use your registered email and password.">
        <form className="space-y-6" noValidate onSubmit={onSubmit}>
          <TextField label="Email" type="email" name="email" required autoComplete="email" placeholder="you@college.edu" />
          <PasswordField label="Password" name="password" required minLength={6} placeholder="Minimum 6 characters" className="pr-12" />
          <Turnstile
            ref={turnstileRef}
            action="login"
            theme={turnstileTheme}
            onToken={onToken}
            onError={onError}
            className="flex justify-center"
          />
          <SubmitButton icon="login" disabled={!turnstileToken} dimWhenDisabled={false}>
            Sign in
          </SubmitButton>
          <StatusMessage visible={status.visible}>{status.text}</StatusMessage>
          <p className="text-sm text-neutral-500 dark:text-white/60 text-center">
            New here?{" "}
            <AppLink className="font-semibold text-brand-500 hover:text-brand-700" href="/teachers/teacher_signup.html">
              Apply as a Teacher
            </AppLink>
          </p>
        </form>
      </AuthCard>
      <LegalNote className="mt-4" />
    </AuthShell>
  );
}
