"use client";

import { useCallback, useEffect, useState, type FormEvent, type ReactNode, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui";
import { AppLink } from "@/components/site/AppLink";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { postTeacherSignup } from "../api";
import { useAcademicMeta } from "../hooks/useAcademicMeta";
import { useTeacherStatusPoll } from "../hooks/useTeacherStatusPoll";
import { navigateTo, TEACHER_LOGIN } from "../lib/redirects";
import { clearTokensAfterTeacherSignup } from "../lib/session-storage";
import { AuthCard, LegalNote } from "./AuthCard";
import { AuthHeader } from "./AuthHeader";
import { HeroBullets, HeroVideo } from "./AuthHero";
import { AuthShell, ORBS_LOGIN } from "./AuthShell";
import { TEACHER_SIGNUP_NAV } from "./nav";

const labelClass = "block text-xs font-semibold tracking-wide uppercase";
const controlClass =
  "w-full rounded-lg border-neutral-300 dark:border-white/15 bg-white/70 dark:bg-brand-900/40 focus:ring-brand-500 focus:border-brand-500";

/** Look of the `#appStatus` box for each kind of message. */
const STATUS_TONES = {
  error: "mt-6 text-sm rounded-xl px-4 py-3 font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  success: "mt-6 text-sm rounded-xl px-4 py-3 font-medium bg-green-100 text-green-700 dark:bg-green-900/30",
  /** The status poll replaced the classes with unstyled `status <state>`. */
  plain: "",
};

type AppStatus = { tone: keyof typeof STATUS_TONES; text: string } | null;

function LabeledInput({ label, name, type, minLength }: { label: string; name: string; type: string; minLength?: number }) {
  return (
    <div>
      <label className={cn(labelClass, "mb-1")}>{label}</label>
      <input type={type} name={name} required minLength={minLength} className={controlClass} />
    </div>
  );
}

function LabeledSelect({
  label,
  placeholder,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string; placeholder: string; children: ReactNode }) {
  return (
    <div>
      <label className={cn(labelClass, "mb-1")}>{label}</label>
      <select required className={controlClass} {...rest}>
        <option value="">{placeholder}</option>
        {children}
      </select>
    </div>
  );
}

/** Dashed drop zone for one side of the ID card, with an image preview. */
function IdCardUpload({ name, label, previewAlt }: { name: string; label: string; previewAlt: string }) {
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  return (
    <div>
      <label className={cn(labelClass, "mb-2")}>{label}</label>
      <div className="relative group">
        <label
          htmlFor={name}
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer border-neutral-300 dark:border-white/20 bg-white/50 dark:bg-white/5 hover:border-brand-500 dark:hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all overflow-hidden"
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- local blob preview
            <img src={preview} alt={previewAlt} className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center pt-3 pb-3">
              <Icon name="upload_file" className="text-3xl text-brand-500 dark:text-brand-400 mb-1" />
              <p className="text-xs text-neutral-600 dark:text-white/70 font-medium">Click to upload</p>
              <p className="text-[10px] text-neutral-500 dark:text-white/50">PNG, JPG (MAX. 5MB)</p>
            </div>
          )}
          <input
            id={name}
            type="file"
            name={name}
            accept="image/*"
            required
            className="hidden"
            onChange={(e) => {
              const file = e.currentTarget.files?.[0];
              setPreview(file ? URL.createObjectURL(file) : null);
            }}
          />
        </label>
      </div>
    </div>
  );
}

/** Text of the selected <option>, as the backend expects in `*_name`. */
function selectedText(form: HTMLFormElement, name: string): string {
  const select = form.elements.namedItem(name);
  return select instanceof HTMLSelectElement ? select.options[select.selectedIndex]?.text || "" : "";
}

/** teachers/teacher_signup.html: teacher application with ID card upload. */
export function TeacherSignupPage() {
  const [appStatus, setAppStatus] = useState<AppStatus>(null);
  const [submitting, setSubmitting] = useState(false);
  const [college, setCollege] = useState("");
  const [degree, setDegree] = useState("");
  const [department, setDepartment] = useState("");

  const showError = useCallback((text: string) => setAppStatus({ tone: "error", text }), []);
  const showPlain = useCallback((text: string) => setAppStatus({ tone: "plain", text }), []);
  const meta = useAcademicMeta(showError);
  useTeacherStatusPoll(showPlain);

  const degrees = (meta.degrees || []).filter((d) => !college || d.college_id === college);
  const departments = (meta.departments || []).filter(
    (dep) => (!college || dep.college_id === college) && (!degree || dep.degree_id === degree),
  );

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!college || !degree || !department) {
      alert("Please select college, degree, and department.");
      return;
    }
    const form = e.currentTarget;
    const fd = new FormData(form);
    // Send UUID ids as primary values; include names for backward compatibility.
    fd.set("college", college || "");
    fd.set("degree", degree || "");
    fd.set("department", department || "");
    fd.set("college_name", selectedText(form, "college"));
    fd.set("degree_name", selectedText(form, "degree"));
    fd.set("department_name", selectedText(form, "department"));
    setAppStatus(null);
    setSubmitting(true);
    try {
      const res = await postTeacherSignup(fd);
      const data = (await res.json()) as { detail?: unknown };
      if (!res.ok) throw new Error(String(data.detail || "Signup failed"));
      clearTokensAfterTeacherSignup();
      // Show success message briefly then redirect.
      setAppStatus({ tone: "success", text: "Application submitted successfully! Redirecting to login..." });
      setTimeout(() => navigateTo(TEACHER_LOGIN), 1500);
    } catch (err) {
      setSubmitting(false);
      alert(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <AuthShell
      className="overflow-x-clip"
      orbs={ORBS_LOGIN}
      align="start"
      header={<AuthHeader logoClassName="h-9" links={TEACHER_SIGNUP_NAV} actions={<ThemeToggle />} />}
      hero={
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#9E4B8A] via-[#B06AB3] to-[#FF7FD1] shadow-[0_8px_20px_rgba(158,75,138,0.25)] hover:shadow-[0_12px_28px_rgba(158,75,138,0.32)] transition">
            Apply as Teacher
          </span>{" "}
          <AppLink
            href="/teachers/hod_signup.html"
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold bg-white/70 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 hover:bg-white dark:hover:bg-white/20 transition"
          >
            <Icon name="badge" className="text-[18px]" />
            Apply as HOD
          </AppLink>
          <div className="space-y-4">
            {/* Own class list: merging a size into HeroTitle would drop its `leading-tight`. */}
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight gradient-hero-text">
              Join Paper X Faculty Network
            </h1>
            <HeroVideo src="/assets/video/register.mp4" centered={false} />
          </div>
          <HeroBullets
            items={[
              { icon: "verified_user", text: "Admin approval ensures trusted profiles." },
              {
                icon: "upload",
                text: "Upload ID card (front/back) for verification.",
                chipClassName: "bg-brand-700/25 text-brand-700 dark:bg-brand-700/30 dark:text-brand-400",
              },
              { icon: "school", text: "Link to your college, degree, and department." },
            ]}
          />
        </div>
      }
    >
      <AuthCard className="p-5 sm:p-6">
        <form className="space-y-8" encType="multipart/form-data" onSubmit={onSubmit}>
          <section className="rounded-2xl p-6 bg-white/70 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10">
            <h2 className="text-sm font-semibold uppercase tracking-wider !text-neutral-500 dark:!text-white/60 mb-4">Account</h2>
            <div className="space-y-6">
              <LabeledInput label="Full Name" name="name" type="text" />
              <div className="grid md:grid-cols-3 gap-6">
                <LabeledInput label="Email" name="email" type="email" />
                <LabeledInput label="Password" name="password" type="password" minLength={6} />
                <LabeledInput label="Confirm Password" name="confirm_password" type="password" minLength={6} />
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <IdCardUpload name="id_card_front" label="ID Card Front (Image)" previewAlt="Front Preview" />
                <IdCardUpload name="id_card_back" label="ID Card Back (Image)" previewAlt="Back Preview" />
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <LabeledSelect
                  label="College"
                  name="college"
                  placeholder="-- Select College --"
                  value={college}
                  onChange={(e) => {
                    setCollege(e.target.value);
                    setDegree("");
                    setDepartment("");
                  }}
                >
                  {(meta.colleges || []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </LabeledSelect>
                <LabeledSelect
                  label="Degree"
                  name="degree"
                  placeholder="-- Select Degree --"
                  value={degree}
                  onChange={(e) => {
                    setDegree(e.target.value);
                    setDepartment("");
                  }}
                >
                  {degrees.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </LabeledSelect>
                <LabeledSelect
                  label="Department"
                  name="department"
                  placeholder="-- Select Department --"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  {departments.map((dep) => (
                    <option key={dep.id} value={dep.id}>
                      {dep.name}
                    </option>
                  ))}
                </LabeledSelect>
              </div>

              <div className="text-center text-xs text-neutral-500 dark:text-white/60">
                Showcase of your expertise and past credits will be handled after approval.
              </div>
            </div>
          </section>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#9E4B8A] via-[#B06AB3] to-[#FF7FD1] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(158,75,138,0.28)] hover:shadow-[0_16px_36px_rgba(158,75,138,0.35)] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span>{submitting ? "Submitting..." : "Submit Application"}</span>
              {submitting ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : null}
            </button>
          </div>
        </form>
        {appStatus ? (
          <div role="status" className={STATUS_TONES[appStatus.tone]}>
            {appStatus.text}
          </div>
        ) : null}
      </AuthCard>
      <LegalNote verb="submitting" className="mt-4" />
    </AuthShell>
  );
}
