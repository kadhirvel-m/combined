"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Turnstile } from "@/components/content/Turnstile";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { AppLink } from "@/components/site/AppLink";
import { getMe, postLogin, postRefresh } from "../api";
import { TURNSTILE_MESSAGES, useTurnstileGate } from "../hooks/useTurnstileGate";
import { useOAuthPending } from "../hooks/useOAuthPending";
import { getSafeNextPath, navigateTo, STUDENT_HOME } from "../lib/redirects";
import { detailOrMessage, jsonOrEmpty } from "../lib/responses";
import {
  clearLegacyStudentTokens,
  dropRefreshToken,
  markSessionActive,
  persistBearerFallbackSession,
  persistOAuthCallbackTokens,
  persistStudentLogin,
} from "../lib/session-storage";
import { readOAuthHash, signInWithGoogle, stripOAuthHash } from "../lib/supabase";
import type { AuthTokenResponse } from "../types";
import styles from "../auth.module.css";
import { AuthCard, LegalNote, StatusMessage } from "./AuthCard";
import { AuthHeader, AuthHeaderCta, type AuthMobileMenu } from "./AuthHeader";
import { CHIP_PLUM, HeroBullets, HeroFootnotes, HeroGradient, HeroTitle, HeroVideo } from "./AuthHero";
import { AuthShell, ORBS_LOGIN } from "./AuthShell";
import { GoogleButton, OrDivider, PasswordField, SubmitButton, TextField } from "./fields";
import { PageLoader } from "./PageLoader";
import { STUDENT_NAV } from "./nav";

const MOBILE_MENU: AuthMobileMenu = {
  links: [...STUDENT_NAV, { label: "Create account", href: "/signup.html" }],
  footer: [
    { label: "Customer care", href: "#" },
    { label: "Create account", href: "/signup.html" },
  ],
  focusFirstLink: true,
};

/** login.html: student sign-in with email/password or Google. */
export function StudentLoginPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const oauth = useOAuthPending();
  const {
    ref: turnstileRef,
    token: turnstileToken,
    theme: turnstileTheme,
    onToken,
    onError,
    reset: resetTurnstile,
  } = useTurnstileGate(TURNSTILE_MESSAGES, setStatus);
  const setOAuthPending = oauth.set;
  const handledHash = useRef(false);

  // Google OAuth callback: Supabase returns to this page with tokens in the hash.
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
      return;
    }
    void (async () => {
      // Let the layout's session probe (SessionProvider, mounted in the same commit) run
      // first: if it saw the callback refresh token it would spend it on its own /refresh,
      // and Supabase refresh tokens are single-use.
      await Promise.resolve();
      persistOAuthCallbackTokens(token, refreshToken);
      clearLegacyStudentTokens();
      stripOAuthHash();
      try {
        // Exchange the OAuth refresh token for first-party HttpOnly cookies. Best effort:
        // a short-lived or already-rotated callback token falls back to bearer verification.
        let cookieExchangeOk = false;
        if (refreshToken) {
          const refreshRes = await postRefresh(refreshToken);
          if (refreshRes.ok) {
            cookieExchangeOk = true;
            markSessionActive();
          } else {
            const out = await jsonOrEmpty<AuthTokenResponse>(refreshRes);
            console.warn("[Auth] OAuth refresh exchange skipped:", detailOrMessage(out) || `Refresh failed (${refreshRes.status})`);
            dropRefreshToken();
          }
        }

        // Verify the session before navigating away to avoid login bounce loops.
        const meRes = await getMe();
        if (!meRes.ok) {
          const out = await jsonOrEmpty<AuthTokenResponse>(meRes);
          const detail = String(out?.detail || out?.message || "").toLowerCase();
          // Older backends return 404 before the profile is bootstrapped: not a failure.
          const profileBootstrap404 = meRes.status === 404 && detail.includes("profile not found");
          if (!profileBootstrap404) {
            if (token && meRes.status === 401) {
              // Cookies blocked (privacy / antivirus hardened browsers): verify with the access token.
              const bearerRes = await getMe(token);
              if (bearerRes.ok) {
                persistBearerFallbackSession(token);
              } else {
                const bOut = await jsonOrEmpty<AuthTokenResponse>(bearerRes);
                const refreshHint =
                  !cookieExchangeOk && refreshToken ? " (OAuth refresh exchange failed on this device/browser)" : "";
                throw new Error((detailOrMessage(bOut) || `Session verification failed (${bearerRes.status})`) + refreshHint);
              }
            } else {
              throw new Error(detailOrMessage(out) || `Session verification failed (${meRes.status})`);
            }
          }
        }
        markSessionActive();

        const nextPath = getSafeNextPath();
        setOAuthPending(false);
        navigateTo(nextPath || STUDENT_HOME);
      } catch (err) {
        console.error("[Auth] OAuth callback exchange failed:", err);
        setStatus("❌ Google sign-in could not complete. Please try again.");
        setOAuthPending(false);
        setLoading(false);
        resetTurnstile();
      }
    })();
  }, [setOAuthPending, resetTurnstile]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.reportValidity()) return;
    const token = turnstileToken;
    if (!token) {
      setStatus("⚠️ Please complete Turnstile verification before signing in.");
      return;
    }
    setLoading(true);
    setStatus("");
    setSubmitting(true);
    const fd = new FormData(form);
    const payload = { email: fd.get("email"), password: fd.get("password"), turnstile_token: token };
    try {
      const res = await postLogin(payload);
      const out = await jsonOrEmpty<AuthTokenResponse>(res);
      if (!res.ok) {
        setStatus(`❌ ${detailOrMessage(out) || "Login failed."}`);
        resetTurnstile();
        setLoading(false);
        return;
      }
      if (out.access_token) persistStudentLogin(out.access_token, out.refresh_token);
      console.info("[auth] login success, cookie-session mode active");
      setStatus("✔ Signed in. Redirecting…");
      const nextPath = getSafeNextPath();
      setTimeout(() => navigateTo(nextPath || STUDENT_HOME), 400);
    } catch {
      setStatus("❌ Network error. Please try again.");
      resetTurnstile();
      setLoading(false);
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
      setStatus("❌ Google sign-in failed.");
      setLoading(false);
    }
  }

  return (
    <AuthShell
      className="transition-colors overflow-x-clip"
      orbs={ORBS_LOGIN}
      sectionClassName="pt-6 pb-16 lg:pt-8 lg:pb-16"
      overlays={<PageLoader variant="lottie" show={loading || oauth.pending} />}
      header={
        <AuthHeader
          className="supports-[backdrop-filter]:saturate-150"
          logoLabel="Paper X Home"
          links={STUDENT_NAV}
          actions={
            <>
              <ThemeToggle />
              <AuthHeaderCta href="/signup.html">Create account</AuthHeaderCta>
            </>
          }
          mobileMenu={MOBILE_MENU}
        />
      }
      hero={
        <div className="space-y-6">
          <span className={styles.inlineChip}>Portal Access · Trusted by 10k+ students</span>
          <HeroTitle>
            Seamless login to <HeroGradient>Paper X</HeroGradient>
          </HeroTitle>
          <HeroVideo src="/assets/video/login.mp4" lazy fallback="Your browser does not support the video tag." />
          <HeroBullets
            items={[
              { icon: "bolt", text: "Instant access to smart study plans and live AI chat." },
              {
                icon: "verified",
                text: "Secure authentication backed by Supabase and responsible AI guardrails.",
                chipClassName: CHIP_PLUM,
              },
              { icon: "sync", text: "Syncs with your profile, project applications, and collaborative notes instantly." },
            ]}
          />
          <HeroFootnotes
            items={[
              { icon: "lock", text: "OTP-less secure session" },
              { icon: "devices_other", text: "Works on any device" },
            ]}
          />
        </div>
      }
    >
      <AuthCard title="Welcome back" subtitle="Sign in using your registered credentials or continue with Google.">
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
          <PasswordField
            id="pwd"
            label="Password"
            required
            name="password"
            minLength={6}
            placeholder="Minimum 6 characters"
            revealable
          />
          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-white/55">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                className="rounded border-black/10 dark:border-white/20 text-brand-500 focus:ring-brand-500/60 text-base"
              />
              Keep me signed in
            </label>
            <a href="#" className="font-medium text-brand-500 hover:text-brand-700">
              Forgot password?
            </a>
          </div>
          <Turnstile
            ref={turnstileRef}
            action="login"
            theme={turnstileTheme}
            onToken={onToken}
            onError={onError}
            className="flex justify-center"
          />
          <SubmitButton icon={submitting ? "hourglass_empty" : "login"} busy={submitting} disabled={submitting || !turnstileToken}>
            {submitting ? "Signing in…" : "Sign in"}
          </SubmitButton>
          <OrDivider />
          <GoogleButton onClick={onGoogle} />
          <StatusMessage visible={status !== null}>{status}</StatusMessage>
          <p className="text-sm text-neutral-500 dark:text-white/60 text-center">
            New to Paper X?{" "}
            <AppLink className="font-semibold text-brand-500 hover:text-brand-700" href="/signup.html">
              Create an account
            </AppLink>{" "}
            in seconds.
          </p>
        </form>
      </AuthCard>
      <LegalNote className="mt-4" />
    </AuthShell>
  );
}
