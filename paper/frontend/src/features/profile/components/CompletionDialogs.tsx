"use client";

import { useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { buildProfileUpdatePayload, saveProfile } from "../api";
import { SECTION_LETTERS, useEducationForm, type EducationForm, type SelectOption } from "../hooks/useEducationForm";
import type { StudentProfile } from "../types";
import { Dialog } from "./Dialog";
import { Glyph, PIcon } from "./Glyph";
import { panel } from "./SectionCard";

/** Text inputs and selects of the completion forms. */
export const formControl =
  "w-full min-w-0 rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-brand-900/70 text-neutral-900 dark:text-white px-3 py-2";
const textControl = cn(formControl, "placeholder:text-black/40 dark:placeholder:text-white/40");

function Labelled({ label, className, children }: { label: ReactNode; className?: string; children: ReactNode }) {
  return (
    <label className={cn("grid gap-1 min-w-0", className)}>
      <span className="text-xs text-black/70 dark:text-white/70">{label}</span>
      {children}
    </label>
  );
}

function Options({ placeholder, options }: { placeholder: string; options: SelectOption[] }) {
  return (
    <>
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </>
  );
}

/**
 * The catalogue-driven education row (institution → degree → department →
 * batch, section, semester, registration number, mobile number). Shared with
 * the profile editor.
 */
export function EducationFields({ form }: { form: EducationForm }) {
  return (
    <div className={cn(panel, "p-4 grid gap-3 min-w-0")}>
      <Labelled label="Institution *">
        <select required className={formControl} value={form.collegeId} onChange={(e) => void form.selectCollege(e.target.value)}>
          <Options placeholder="Select college" options={form.collegeOptions} />
        </select>
      </Labelled>

      <div className="grid md:grid-cols-2 gap-3 min-w-0">
        <Labelled label="Degree *">
          <select
            required
            disabled={form.degreeDisabled}
            className={formControl}
            value={form.degreeId}
            onChange={(e) => form.selectDegree(e.target.value)}
          >
            <Options placeholder="Select degree" options={form.degreeOptions} />
          </select>
        </Labelled>
        <Labelled label="Department *">
          <select
            required
            disabled={form.departmentDisabled}
            className={formControl}
            value={form.departmentId}
            onChange={(e) => form.selectDepartment(e.target.value)}
          >
            <Options placeholder="Select department" options={form.departmentOptions} />
          </select>
        </Labelled>
      </div>

      <div className="grid md:grid-cols-3 gap-3 min-w-0">
        <Labelled label="Batch *">
          <select
            required
            disabled={form.batchDisabled}
            className={formControl}
            value={form.batchRange}
            onChange={(e) => form.setBatchRange(e.target.value)}
          >
            <Options placeholder="Select batch" options={form.batchOptions} />
          </select>
        </Labelled>
        <Labelled label="Section *">
          <select required className={formControl} value={form.section} onChange={(e) => form.setSection(e.target.value)}>
            <Options placeholder="Select section" options={SECTION_LETTERS.map((ch) => ({ value: ch, label: ch }))} />
          </select>
        </Labelled>
        <Labelled label="Current Semester *">
          <input
            required
            type="number"
            min={1}
            max={12}
            placeholder="5"
            className={textControl}
            value={form.semester}
            onChange={(e) => form.setSemester(e.target.value)}
          />
        </Labelled>
      </div>

      <div className="grid md:grid-cols-2 gap-3 min-w-0">
        <Labelled
          label={
            <>
              Registration No. <span className="text-black/45 dark:text-white/45">Optional</span>
            </>
          }
        >
          <input type="text" placeholder="22TN0049" className={textControl} value={form.regno} onChange={(e) => form.setRegno(e.target.value)} />
        </Labelled>
        <Labelled label="Mobile Number *">
          <input
            required
            type="tel"
            placeholder="9876543210"
            maxLength={10}
            pattern="[0-9]{10}"
            className={textControl}
            value={form.phone}
            onChange={(e) => form.setPhone(e.target.value)}
          />
        </Labelled>
      </div>
    </div>
  );
}

/** Status line of a completion dialog (green when `ok`). */
export interface Notice {
  text: string;
  ok: boolean;
}

function StatusNotice({ notice }: { notice: Notice | null }) {
  if (!notice) return null;
  return (
    <div
      className={cn(
        "mt-3 text-xs rounded-lg border border-black/10 dark:border-white/10 px-3 py-2",
        notice.ok ? "border-emerald-400/40 text-emerald-600" : "border-rose-400/40 text-rose-600",
      )}
    >
      {notice.text}
    </div>
  );
}

function SaveButton({ busy, onClick, icon }: { busy: boolean; onClick: () => void; icon: ReactNode }) {
  return (
    <div className="mt-5 flex items-center justify-end gap-2">
      <button
        type="button"
        disabled={busy}
        onClick={onClick}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700",
          busy && "opacity-70",
        )}
      >
        {icon}
        Save
      </button>
    </div>
  );
}

const panelScroll = "overflow-y-auto overflow-x-hidden";
const fullHeight = { maxHeight: "calc(100dvh - 2rem)" };

export interface CompletionDialogProps {
  profile: StudentProfile;
  /** Called after a successful save (close, then reload the profile). */
  onSaved: () => void;
  /**
   * The status line. Owned by the page so it survives the form being rebuilt
   * when the dialog reopens after a save (as the original's status element did).
   */
  notice: Notice | null;
  onNotice: (notice: Notice | null) => void;
}

/**
 * "Complete your profile" (shown while the name or a complete education row is
 * missing). Not dismissible: saving is the only way out.
 */
export function EducationRequiredDialog({ profile, onSaved, notice, onNotice: setNotice }: CompletionDialogProps) {
  const education = Array.isArray(profile.education_entries) ? profile.education_entries[0] : undefined;
  const form = useEducationForm(education, profile.phone);
  const [name, setName] = useState(String(profile.name || "").trim());
  const [busy, setBusy] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  const save = async () => {
    try {
      const enteredName = name.trim();
      if (!enteredName) {
        setNotice({ text: "Please enter your name to continue.", ok: false });
        nameRef.current?.focus();
        return;
      }
      const entry = form.collect();
      const phone = form.phone.trim().replace(/\D/g, "");
      const semester = Number(entry?.current_semester);
      const requiredOk =
        Boolean(entry?.school.trim()) &&
        Boolean((entry?.degree || "").trim()) &&
        Boolean((entry?.department || "").trim()) &&
        Boolean((entry?.batch_range || "").trim()) &&
        Boolean((entry?.section || "").trim()) &&
        Number.isFinite(semester) &&
        semester > 0 &&
        phone.length === 10;
      if (!requiredOk) {
        if (phone.length > 0 && phone.length !== 10) {
          setNotice({ text: "Please enter a valid 10-digit mobile number.", ok: false });
          return;
        }
        setNotice({
          text: "Please select college, degree, department, batch, section, current semester and provide mobile number.",
          ok: false,
        });
        return;
      }
      setBusy(true);
      setNotice({ text: "Saving…", ok: true });
      const payload = buildProfileUpdatePayload({ ...profile, name: enteredName, phone }, entry ? [entry] : []);
      const { error } = await saveProfile(payload, "Failed to save education.");
      if (error) {
        setNotice({ text: error, ok: false });
        return;
      }
      setNotice({ text: "Saved!", ok: true });
      onSaved();
    } catch (err) {
      console.error(err);
      setNotice({ text: "Failed to save education. Please try again.", ok: false });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={form.ready}
      title="Complete your profile"
      description="Add your name and education (college, degree, department, batch, section and current semester) to continue."
      backdropClassName="bg-black/70"
      panelClassName={cn("max-w-2xl", panelScroll)}
      panelStyle={fullHeight}
    >
      <StatusNotice notice={notice} />
      <Labelled label="Your name *" className="mt-4">
        <input
          ref={nameRef}
          type="text"
          autoComplete="name"
          placeholder="e.g., Dhanush"
          className={textControl}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Labelled>
      <div className="mt-4">
        <EducationFields form={form} />
      </div>
      <SaveButton busy={busy} onClick={() => void save()} icon={<Glyph name="save" className="text-[18px]" />} />
    </Dialog>
  );
}

/** "Complete your profile" for a missing mobile number only. */
export function PhoneRequiredDialog({
  open,
  profile,
  onSaved,
  notice,
  onNotice: setNotice,
}: CompletionDialogProps & { open: boolean }) {
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);

  const save = async () => {
    try {
      const entered = phone.trim().replace(/\D/g, "");
      if (entered.length !== 10) {
        setNotice({ text: "Please enter a valid 10-digit mobile number.", ok: false });
        return;
      }
      setBusy(true);
      setNotice({ text: "Saving…", ok: true });
      const payload = buildProfileUpdatePayload({ ...profile, phone: entered }, profile.education_entries || []);
      const { error } = await saveProfile(payload, "Failed to save mobile number.");
      if (error) {
        setNotice({ text: error, ok: false });
        return;
      }
      setNotice({ text: "Saved!", ok: true });
      onSaved();
    } catch (err) {
      console.error(err);
      setNotice({ text: "Failed to save mobile number.", ok: false });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      title="Complete your profile"
      description="Add your mobile number to continue."
      backdropClassName="bg-black/70"
      panelClassName={cn("max-w-sm", panelScroll)}
    >
      <StatusNotice notice={notice} />
      <Labelled label="Mobile Number *" className="mt-4">
        <input
          type="tel"
          placeholder="9876543210"
          maxLength={10}
          pattern="[0-9]{10}"
          className={textControl}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </Labelled>
      <SaveButton busy={busy} onClick={() => void save()} icon={<PIcon name="save" className="text-[18px]" />} />
    </Dialog>
  );
}
