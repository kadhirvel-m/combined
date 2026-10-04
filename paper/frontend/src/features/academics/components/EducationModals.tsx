"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { cn } from "@/lib/cn";
import type { useEducationForm } from "../hooks/useEducationForm";
import { Glyph } from "./Glyph";

type EducationForm = ReturnType<typeof useEducationForm>;

export interface ModalStatus {
  message: string;
  ok: boolean;
}

const field =
  "w-full min-w-0 rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-brand-900/70 text-neutral-900 dark:text-white px-3 py-2";
const textField = `${field} placeholder:text-black/40 dark:placeholder:text-white/40`;
const labelText = "text-xs text-black/70 dark:text-white/70";
const panel =
  "w-full rounded-3xl border border-black/10 dark:border-white/10 bg-white/95 dark:bg-brand-900/95 text-neutral-900 dark:text-white shadow-card backdrop-blur supports-[backdrop-filter]:backdrop-blur-xl p-6 overflow-y-auto overflow-x-hidden";
const saveBtn =
  "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700";
const SECTIONS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function StatusLine({ status }: { status: ModalStatus | null }) {
  if (!status) return null;
  return (
    <div
      className={cn(
        "mt-3 text-xs rounded-lg border border-black/10 dark:border-white/10 px-3 py-2",
        status.ok ? "border-emerald-400/40 text-emerald-600" : "border-rose-400/40 text-rose-600",
      )}
    >
      {status.message}
    </div>
  );
}

function Overlay({ onBackdrop, children }: { onBackdrop?: () => void; children: ReactNode }) {
  const inner = useRef<HTMLDivElement>(null);
  return (
    <div
      className="fixed inset-0 z-50"
      onClick={(e) => {
        if (onBackdrop && !inner.current?.contains(e.target as Node)) onBackdrop();
      }}
    >
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative h-full w-full flex items-center justify-center p-4">
        <div ref={inner} className="contents">
          {children}
        </div>
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  disabled,
  placeholder,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="grid gap-1 min-w-0">
      <span className={labelText}>{label}</span>
      <select required disabled={disabled} value={value} onChange={(e) => onChange(e.target.value)} className={field}>
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export interface EducationModalProps {
  open: boolean;
  onClose: () => void;
  name: string;
  /** Focused when saving without a name. */
  nameInput: RefObject<HTMLInputElement | null>;
  onNameChange: (v: string) => void;
  form: EducationForm;
  status: ModalStatus | null;
  saving: boolean;
  onSave: () => void;
}

/** "Complete your profile": name + education row (closable: button, backdrop, Escape). */
export function EducationModal({ open, onClose, name, nameInput, onNameChange, form, status, saving, onSave }: EducationModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  const f = form.form;
  return (
    <Overlay onBackdrop={onClose}>
      <div className={cn(panel, "max-w-2xl")} style={{ maxHeight: "calc(100dvh - 2rem)" }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">Complete your profile</h3>
            <p className="text-xs text-black/60 dark:text-white/60 mt-1">
              Add your name and education (college, degree, department, batch, section and current semester) to continue.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="inline-flex items-center justify-center size-10 rounded-full ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5 transition"
          >
            <Glyph name="close" />
          </button>
        </div>

        <StatusLine status={status} />

        <label className="mt-4 grid gap-1 min-w-0">
          <span className={labelText}>Your name *</span>
          <input
            ref={nameInput}
            type="text"
            autoComplete="name"
            placeholder="e.g., Dhanush"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className={textField}
          />
        </label>

        <div className="mt-4">
          <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-brand-900/55 backdrop-blur p-4 grid gap-3 min-w-0">
            <SelectField
              label="Institution *"
              value={f.collegeId}
              onChange={form.onCollegeChange}
              placeholder="Select college"
              options={form.colleges}
            />
            <div className="grid md:grid-cols-2 gap-3 min-w-0">
              <SelectField
                label="Degree *"
                value={f.degreeId}
                onChange={form.onDegreeChange}
                disabled={form.disabled.degree}
                placeholder="Select degree"
                options={form.degreeOptions}
              />
              <SelectField
                label="Department *"
                value={f.departmentId}
                onChange={form.onDepartmentChange}
                disabled={form.disabled.department}
                placeholder="Select department"
                options={form.departmentOptions}
              />
            </div>
            <div className="grid md:grid-cols-3 gap-3 min-w-0">
              <SelectField
                label="Batch *"
                value={f.batch}
                onChange={(v) => form.patch({ batch: v })}
                disabled={form.disabled.batch}
                placeholder="Select batch"
                options={form.batchOptions}
              />
              <SelectField
                label="Section *"
                value={f.section}
                onChange={(v) => form.patch({ section: v })}
                placeholder="Select section"
                options={SECTIONS.map((ch) => ({ value: ch, label: ch }))}
              />
              <label className="grid gap-1 min-w-0">
                <span className={labelText}>Current Semester *</span>
                <input
                  required
                  type="number"
                  min={1}
                  max={12}
                  placeholder="5"
                  value={f.semester}
                  onChange={(e) => form.patch({ semester: e.target.value })}
                  className={textField}
                />
              </label>
            </div>
            <div className="grid md:grid-cols-2 gap-3 min-w-0">
              <label className="grid gap-1 min-w-0">
                <span className={labelText}>
                  Registration No. <span className="text-black/45 dark:text-white/45">Optional</span>
                </span>
                <input
                  type="text"
                  placeholder="22TN0049"
                  value={f.regno}
                  onChange={(e) => form.patch({ regno: e.target.value })}
                  className={textField}
                />
              </label>
              <label className="grid gap-1 min-w-0">
                <span className={labelText}>Mobile Number *</span>
                <input
                  required
                  type="tel"
                  placeholder="9876543210"
                  maxLength={10}
                  pattern="[0-9]{10}"
                  value={f.phone}
                  onChange={(e) => form.patch({ phone: e.target.value })}
                  className={textField}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button type="button" disabled={saving} onClick={onSave} className={cn(saveBtn, saving && "opacity-70")}>
            <Glyph name="save" className="text-[18px]" />
            Save
          </button>
        </div>
      </div>
    </Overlay>
  );
}

export interface PhoneModalProps {
  open: boolean;
  phone: string;
  onPhoneChange: (v: string) => void;
  status: ModalStatus | null;
  saving: boolean;
  onSave: () => void;
}

/** Shown when only the phone number is missing; it cannot be dismissed. */
export function PhoneModal({ open, phone, onPhoneChange, status, saving, onSave }: PhoneModalProps) {
  if (!open) return null;
  return (
    <Overlay>
      <div className={cn(panel, "max-w-sm")}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">Complete your profile</h3>
            <p className="text-xs text-black/60 dark:text-white/60 mt-1">Add your mobile number to continue.</p>
          </div>
        </div>
        <StatusLine status={status} />
        <label className="mt-4 grid gap-1 min-w-0">
          <span className={labelText}>Mobile Number *</span>
          <input
            type="tel"
            placeholder="9876543210"
            maxLength={10}
            pattern="[0-9]{10}"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            className={textField}
          />
        </label>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button type="button" disabled={saving} onClick={onSave} className={cn(saveBtn, saving && "opacity-70")}>
            <Glyph name="save" className="text-[18px]" />
            Save
          </button>
        </div>
      </div>
    </Overlay>
  );
}
