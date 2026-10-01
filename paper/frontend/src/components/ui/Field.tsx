import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

const control =
  "block w-full rounded-xl border-0 bg-white/90 dark:bg-white/5 text-neutral-900 dark:text-white " +
  "ring-1 ring-black/10 dark:ring-white/15 placeholder:text-neutral-400 dark:placeholder:text-white/40 " +
  "focus:ring-2 focus:ring-brand-500/70 focus:outline-none transition disabled:opacity-60 disabled:cursor-not-allowed text-sm";

export interface FieldProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  className?: string;
  /** id of the control, to wire the label. */
  htmlFor?: string;
  children: ReactNode;
}

/** Label + control + hint/error wrapper. */
export function Field({ label, hint, error, required, className, htmlFor, children }: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-neutral-700 dark:text-white/80">
          {label}
          {required ? <span className="ml-0.5 text-rose-500">*</span> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
      ) : hint ? (
        <p className="text-xs text-neutral-500 dark:text-white/50">{hint}</p>
      ) : null}
    </div>
  );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Material Symbols icon inside the left edge. */
  icon?: string;
  /** Element inside the right edge (e.g. show-password button). */
  trailing?: ReactNode;
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { icon, trailing, invalid, className, ...rest },
  ref,
) {
  return (
    <div className="relative">
      {icon ? (
        <Icon
          name={icon}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-neutral-400 dark:text-white/40"
        />
      ) : null}
      <input
        ref={ref}
        className={cn(control, "px-3.5 py-2.5", icon && "pl-10", trailing && "pr-11", invalid && "ring-rose-500/70", className)}
        aria-invalid={invalid || undefined}
        {...rest}
      />
      {trailing ? <div className="absolute right-1.5 top-1/2 -translate-y-1/2">{trailing}</div> : null}
    </div>
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }>(
  function Textarea({ className, invalid, ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(control, "px-3.5 py-2.5 min-h-[96px]", invalid && "ring-rose-500/70", className)}
        aria-invalid={invalid || undefined}
        {...rest}
      />
    );
  },
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }>(
  function Select({ className, invalid, children, ...rest }, ref) {
    return (
      <select
        ref={ref}
        className={cn(control, "pl-3.5 pr-9 py-2.5", invalid && "ring-rose-500/70", className)}
        aria-invalid={invalid || undefined}
        {...rest}
      >
        {children}
      </select>
    );
  },
);

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: ReactNode;
  description?: ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, className, id, ...rest },
  ref,
) {
  const auto = useId();
  const inputId = id ?? auto;
  return (
    <label htmlFor={inputId} className={cn("flex items-start gap-2.5 text-sm cursor-pointer", className)}>
      <input
        ref={ref}
        id={inputId}
        type="checkbox"
        className="mt-0.5 size-4 rounded border-black/20 dark:border-white/25 text-brand-500 focus:ring-brand-500/50 dark:bg-white/5"
        {...rest}
      />
      {label || description ? (
        <span>
          {label ? <span className="font-medium text-neutral-800 dark:text-white/85">{label}</span> : null}
          {description ? <span className="block text-xs text-neutral-500 dark:text-white/50">{description}</span> : null}
        </span>
      ) : null}
    </label>
  );
});

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: ReactNode;
  disabled?: boolean;
  className?: string;
  id?: string;
}

/** Accessible on/off toggle. */
export function Switch({ checked, onChange, label, disabled, className, id }: SwitchProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn("inline-flex items-center gap-2.5 text-sm disabled:opacity-60", className)}
    >
      <span
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 rounded-full transition",
          checked ? "bg-brand-500" : "bg-black/15 dark:bg-white/20",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-[22px]" : "translate-x-0.5",
          )}
        />
      </span>
      {label ? <span className="text-neutral-800 dark:text-white/85">{label}</span> : null}
    </button>
  );
}
