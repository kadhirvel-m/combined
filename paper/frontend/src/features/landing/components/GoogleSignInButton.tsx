"use client";

import { useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { AppLink } from "@/components/site/AppLink";
import { getSupabaseClient } from "../supabase";

const LOGIN_PAGE = "/login.html";

/** The exact multi-colour Google "G". */
function GoogleLogo() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 48 48">
      <path
        fill="#FFC107"
        d="M43.611 20.083h-1.611V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.153 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.817C14.41 16.379 18.839 12 24 12c3.059 0 5.842 1.153 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 15.317 4 8.068 9.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.159 0 9.86-1.97 13.4-5.185l-6.19-5.239C29.142 35.664 26.708 36.5 24 36.5c-5.203 0-9.622-3.321-11.282-7.957l-6.503 5.01C8.047 39.297 15.48 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.79 2.231-2.255 4.133-4.093 5.565.001-.001 6.19 5.239 6.19 5.239l.431.316C40.278 35.938 44 30.5 44 24c0-1.341-.138-2.651-.389-3.917z"
      />
    </svg>
  );
}

/**
 * "Continue with Google": starts Supabase Google OAuth and returns to the
 * login page, which already handles the OAuth hash session. If anything fails
 * it falls back to the login page, where Google sign-in is also available.
 */
export function GoogleSignInButton() {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const onClick = async (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setBusy(true);
    try {
      const supabase = await getSupabaseClient();
      const redirectTo = new URL(LOGIN_PAGE, window.location.href).toString();
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
      if (error) throw error;
    } catch (err) {
      console.error(err);
      setBusy(false);
      router.push(LOGIN_PAGE);
    }
  };

  return (
    <AppLink
      href={LOGIN_PAGE}
      onClick={onClick}
      aria-busy={busy || undefined}
      className="inline-flex items-center gap-3 rounded-full bg-white text-brand-900 px-6 py-3 text-sm font-semibold hover:shadow-glow-magenta ring-1 ring-black/10 transition dark:bg-white/10 dark:text-white dark:ring-white/15 dark:hover:bg-white/20"
    >
      <GoogleLogo />
      Continue with Google
    </AppLink>
  );
}
