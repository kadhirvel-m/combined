"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Turnstile } from "@/components/content/Turnstile";
import { AppLink } from "@/components/site/AppLink";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { postRefresh, postSignup } from "../api";
import { TURNSTILE_MESSAGES, useTurnstileGate } from "../hooks/useTurnstileGate";
import { useOAuthPending } from "../hooks/useOAuthPending";
import { getSignupNextPath, navigateTo, STUDENT_HOME } from "../lib/redirects";
import { detailOrMessage, jsonOrEmpty } from "../lib/responses";
import { clearLegacyStudentTokens } from "../lib/session-storage";
import { readOAuthHash, signInWithGoogle, stripOAuthHash } from "../lib/supabase";
import type { AuthTokenResponse } from "../types";
import { AuthCard, LegalNote, StatusMessage } from "./AuthCard";
import { AuthHeader, AuthHeaderCta, type AuthMobileMenu } from "./AuthHeader";
import { CHIP_PLUM, HeroBullets, HeroFootnotes, HeroGradient, HeroPill, HeroTitle, HeroVideo } from "./AuthHero";
import { AuthShell, ORBS_SIGNUP } from "./AuthShell";
import { GoogleButton, OrDivider, PasswordField, SubmitButton, TextField } from "./fields";
import { PageLoader } from "./PageLoader";
import { STUDENT_NAV } from "./nav";

const MOBILE_MENU: AuthMobileMenu = {
  links: [...STUDENT_NAV, { label: "Sign in", href: "/login.html" }],
  animated: true,
};

/** signup.html: create a student account with email/password or Google. */
export function StudentSignupPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const { pending: oauthPending, set: setOAuthPending } = useOAuthPending();
  const {
    ref: turnstileRef,
    token: turnstileToken,
    theme: turnstileTheme,
    onToken,
    onError,
    reset: resetTurnstile,
  } = useTurnstileGate(TURNSTILE_MESSAGES, setStatus);
  const handledHash = useRef(false);

  // Google OAuth callback: exchange the refresh token for cookies, then continue.
  useEffect(() => {
    if (handledHash.current) return;
    handledHash.current = true;
    const tokens = readOAuthHash();
    if (!tokens) {
      setOAuthPending(false);
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the URL hash is only readable on the client
    setLoading(true);
    const { accessToken: token, refreshToken } = tokens;
    if (!token) {
      setOAuthPending(false);
      setLoading(false);
      return;
    }
    clearLegacyStudentTokens();
    stripOAuthHash();
    void (async () => {
      try {
        if (refreshToken) await postRefresh(refreshToken);
      } catch {}
      setOAuthPending(false);
      navigateTo(getSignupNextPath() || STUDENT_HOME);
    })();
  }, [setOAuthPending]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.reportValidity()) return;
    const fd = new FormData(form);
    const pwd = String(fd.get("password") ?? "").trim();
    const confirm = String(fd.get("confirm") ?? "").trim();
    const token = turnstileToken;
    setStatus("");
    if (pwd !== confirm) {
      setStatus("⚠️ Passwords do not match.");
      return;
    }
    if (!token) {
      setStatus("⚠️ Please complete Turnstile verification before creating an account.");
      return;
    }
    const payload = { email: fd.get("email"), password: fd.get("password"), turnstile_token: token };
    setSubmitting(true);
    try {
      const res = await postSignup(payload);
      const out = await jsonOrEmpty<AuthTokenResponse>(res);
      if (!res.ok) {
        setStatus(`❌ ${detailOrMessage(out) || "Signup failed."}`);
        resetTurnstile();
        return;
      }
      // Cookie session is authoritative; clear any stale legacy token keys.
      if (out.access_token) clearLegacyStudentTokens();
      setStatus("✔ Account created. Redirecting…");
      setTimeout(() => navigateTo(getSignupNextPath() || STUDENT_HOME), 600);
    } catch {
      setStatus("❌ Network error. Please try again.");
      resetTurnstile();
    } finally {
      setSubmitting(false);
    }
  }

  async function onGoogle() {
    setOAuthPending(true);
    setLoading(true);
    setStatus("Redirecting to Google…");
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error(err);
      setOAuthPending(false);
      setLoading(false);
      setStatus("❌ Google sign-in failed.");
    }
  }

  return (
    <AuthShell
      className="transition-colors"
      orbs={ORBS_SIGNUP}
      sectionClassName="pt-6 pb-16 lg:pt-8 lg:pb-20"
      overlays={<PageLoader variant="spinner" show={loading || oauthPending} />}
      header={
        <AuthHeader
          className="supports-[backdrop-filter]:saturate-150"
          logoLabel="Paper X Home"
          links={STUDENT_NAV}
          actions={
            <>
              <ThemeToggle />
              <AuthHeaderCta href="/login.html">Sign in</AuthHeaderCta>
            </>
          }
          mobileMenu={MOBILE_MENU}
        />
      }
      hero={
        <div className="space-y-6">
          <HeroPill>Create your account</HeroPill>
          <HeroTitle>
            Get started with <HeroGradient>Paper X</HeroGradient>
          </HeroTitle>
          <HeroVideo src="/assets/video/signup.mp4" fallback="Your browser does not support the video tag." />
          <HeroBullets
            items={[
              { icon: "bolt", text: "Fast signup — only email & password needed." },
              { icon: "verified", text: "Secure auth with API token storage.", chipClassName: CHIP_PLUM },
              { icon: "sync", text: "Syncs across notes, projects & profile instantly." },
            ]}
          />
          <HeroFootnotes
            items={[
              { icon: "lock", text: "Encrypted at rest" },
              { icon: "devices_other", text: "Works everywhere" },
            ]}
          />
        </div>
      }
    >
      <AuthCard title="Create your account" subtitle="Start free. No credit card. You can add more details later.">
        <form className="space-y-6" noValidate onSubmit={onSubmit}>
          <TextField
            id="email"
            label="Email"
            required
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@college.edu"
          />
          <div className="grid gap-6 sm:grid-cols-2">
            <PasswordField
              id="pwd"
              label="Password"
              required
              name="password"
              minLength={6}
              placeholder="Minimum 6 characters"
              revealable
            />
            <PasswordField
              id="confirm"
              label="Confirm password"
              required
              name="confirm"
              minLength={6}
              placeholder="Repeat password"
            />
          </div>
          <Turnstile
            ref={turnstileRef}
            action="signup"
            theme={turnstileTheme}
            onToken={onToken}
            onError={onError}
            className="flex justify-center"
          />
          <SubmitButton
            icon={submitting ? "hourglass_empty" : "person_add"}
            busy={submitting}
            disabled={submitting || !turnstileToken}
          >
            {submitting ? "Creating…" : "Create account"}
          </SubmitButton>
          <OrDivider />
          <GoogleButton onClick={onGoogle} />
          <StatusMessage visible={status !== null}>{status}</StatusMessage>
          <p className="text-sm text-neutral-500 dark:text-white/60 text-center">
            Already have an account?{" "}
            <AppLink className="font-semibold text-brand-500 hover:text-brand-700" href="/login.html">
              Sign in
            </AppLink>
            .
          </p>
          <LegalNote />
        </form>
      </AuthCard>
    </AuthShell>
  );
}
