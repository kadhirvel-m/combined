import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import styles from "../../profile-edit.module.css";
import { PIcon } from "../Glyph";

const control = "rounded-lg border border-slate-200/60 dark:border-white/10";

/** Inputs of the top-level details (Basic Info, Links, About). */
export const topInput = cn(control, "bg-white/70 dark:bg-night-800/70 px-3 py-2");
/** Inputs inside an experience/education/… entry. */
export const rowInput = cn(control, "bg-white/70 dark:bg-night-900/50 px-3 py-2");
/** Inputs of an experience attachment. */
export const mediaInput = cn(control, "bg-white px-2 py-1.5");
/** "Currently here" / "Does not expire" checkboxes. */
export const checkbox = "rounded border-slate-300 text-brand-500";

/** A labelled control: `text-sm` caption for the top-level fields, `text-xs` inside entries. */
export function Field({
  label,
  size = "row",
  className,
  children,
}: {
  label: ReactNode;
  size?: "top" | "row";
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={cn("grid gap-1", className)}>
      <span className={size === "top" ? "text-sm text-slate-700 dark:text-slate-300" : "text-xs text-slate-600 dark:text-slate-300"}>
        {label}
      </span>
      {children}
    </label>
  );
}

/** Section heading of the details form. */
export function FormHeading({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cn(styles.heading, "text-lg font-semibold", className)}>{children}</h2>;
}

/** Bordered entry card (one experience, education, certification…). */
export function EntryCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200/60 dark:border-white/10 bg-white dark:bg-night-800/70 p-4 grid gap-3">{children}</div>
  );
}

/** Rose "Remove …" button of an entry. */
export function RemoveButton({ onClick, icon, children }: { onClick: () => void; icon?: string; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-lg border border-rose-300/40 text-rose-500 px-2 py-1 text-xs hover:border-rose-400/60"
    >
      {icon ? <PIcon name={icon} /> : null}
      {children}
    </button>
  );
}

/** Right-aligned row holding an entry's Remove button. */
export function RemoveRow({ children }: { children: ReactNode }) {
  return <div className="flex justify-end">{children}</div>;
}

/**
 * A list section of the details form: heading, hint, the entries and the
 * "Add …" button (all direct children of the form grid, as on the original).
 */
export function ListSection({
  title,
  hint,
  addLabel,
  onAdd,
  children,
}: {
  title: string;
  hint: string;
  addLabel: string;
  onAdd: () => void;
  children: ReactNode;
}) {
  return (
    <>
      <FormHeading className="mt-8">{title}</FormHeading>
      <p className="text-xs text-slate-600 dark:text-slate-400">{hint}</p>
      <div className="grid gap-3 mt-3">{children}</div>
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200/60 dark:border-white/10 px-3 py-1.5 text-xs hover:border-brand-400/60 text-brand-600 dark:text-brand-300"
      >
        <PIcon name="add_circle" /> {addLabel}
      </button>
    </>
  );
}

/** `<option>`s with a leading placeholder. */
export function Options({ placeholder, options }: { placeholder: string; options: { value: string; label: string }[] }) {
  return (
    <>
      <option value="">{placeholder}</option>
      {options.map((o, i) => (
        <option key={`${i}:${o.value}`} value={o.value}>
          {o.label}
        </option>
      ))}
    </>
  );
}
