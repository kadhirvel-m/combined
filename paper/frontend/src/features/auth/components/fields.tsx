"use client";

import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui";

const labelClass = "text-sm font-medium text-neutral-700 dark:text-white/85";
const inputClass =
  "mt-2 block w-full rounded-2xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-white/5 px-4 py-3 text-sm text-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/70 focus:border-transparent transition";

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
}

/** Label + rounded glass input used by the sign-in / sign-up cards. */
export function TextField({ label, id, className, ...rest }: TextFieldProps) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input id={id} className={cn(inputClass, className)} {...rest} />
    </div>
  );
}

export interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
  /** Show the eye button that reveals the password. */
  revealable?: boolean;
}

/** Password input with an optional show / hide toggle. */
export function PasswordField({ label, id, revealable, className, ...rest }: PasswordFieldProps) {
  const [shown, setShown] = useState(false);
  return (
    <div className="relative">
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input
        id={id}
        type={shown ? "text" : "password"}
        className={cn(inputClass, revealable && "pr-12", className)}
        {...rest}
      />
      {revealable ? (
        <button
          type="button"
          onClick={() => setShown((v) => !v)}
          className="absolute inset-y-[42px] right-3 inline-flex size-8 items-center justify-center rounded-full text-neutral-500 hover:text-brand-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/60"
          aria-label={shown ? "Hide password" : "Show password"}
        >
          <Icon name={shown ? "visibility_off" : "visibility"} className="text-xl" />
        </button>
      ) : null}
    </div>
  );
}

export interface SubmitButtonProps {
  icon: string;
  children: ReactNode;
  disabled?: boolean;
  busy?: boolean;
  /** Fade the button while disabled (student pages). */
  dimWhenDisabled?: boolean;
}

/** Full-width gradient submit button with a leading icon. */
export function SubmitButton({ icon, children, disabled, busy, dimWhenDisabled = true }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled}
      aria-busy={busy}
      className={cn(
        "w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#9E4B8A] via-[#B06AB3] to-[#FF7FD1] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(158,75,138,0.28)] hover:shadow-[0_16px_36px_rgba(158,75,138,0.35)] transition",
        dimWhenDisabled && "disabled:opacity-60",
      )}
    >
      <Icon name={icon} className="text-base" />
      <span>{children}</span>
    </button>
  );
}

/** "Or continue with" rule between the password form and the social button. */
export function OrDivider() {
  return (
    <div className="relative text-center">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-black/10 dark:border-white/10" />
      </div>
      <div className="relative inline-flex items-center gap-2 bg-white dark:bg-white/5 px-3 text-[11px] uppercase tracking-[0.3em] text-neutral-500 dark:text-white/50">
        <span>Or continue with</span>
      </div>
    </div>
  );
}

/** "Continue with Google" button. */
export function GoogleButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full inline-flex items-center justify-center gap-3 rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-white/10 px-6 py-3 text-sm font-semibold text-neutral-700 dark:text-white hover:border-brand-500/40 hover:shadow-[0_12px_28px_rgba(158,75,138,0.16)] transition"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- remote provider logo */}
      <img alt="Google" src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="h-5 w-5" />
      Google
    </button>
  );
}
