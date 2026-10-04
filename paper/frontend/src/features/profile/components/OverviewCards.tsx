"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { LINK_ICONS, PROFILE_LINKS, type LinkIconKey } from "../linkIcons";
import { normaliseLink, textOr } from "../lib/format";
import type { StudentProfile } from "../types";
import styles from "../profile.module.css";
import { SectionCard } from "./SectionCard";

const copyButton =
  "rounded-full px-2.5 py-1.5 text-xs border border-brand-500/30 text-brand-700 dark:text-brandlt-100 bg-brandlt-100/70 dark:bg-brand-700/30 hover:border-brand-500/60 transition";

/** Copies a shown value unless it is a placeholder dash. */
function copyValue(value: string) {
  const v = value.trim();
  if (v && v !== "—" && v !== "--") void navigator.clipboard.writeText(v);
}

/** Basic Info: name, college, batch, date of birth, phone and email (with copy buttons). */
export function BasicInfoCard({ profile }: { profile: StudentProfile | null }) {
  // Placeholders shimmer until the profile has been rendered once.
  const loading = !profile;
  const show = (value: unknown) => (profile ? textOr(value) : "—");
  const college = profile?.college;
  const collegeName = typeof college === "object" && college ? college.name || college : college;
  const batch = profile?.batch;
  const rows: [string, string][] = [
    ["Name", show(profile?.name)],
    ["College", show(collegeName)],
    ["Batch", profile ? (batch?.from || batch?.to ? `${batch?.from || "?"} - ${batch?.to || "?"}` : "--") : "—"],
    ["Date of Birth", show(profile?.dob)],
  ];
  const phone = show(profile?.phone);
  const email = show(profile?.email);
  const skeleton = loading ? styles.skeleton : undefined;

  return (
    <SectionCard icon="badge" title="Basic Info" headingGap="mb-4">
      <dl className="grid grid-cols-[auto,1fr] gap-x-6 gap-y-2 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="font-medium text-black/80 dark:text-white/80">{label}</dt>
            <dd className={cn("opacity-80", skeleton)}>{value}</dd>
          </div>
        ))}
        <dt className="font-medium text-black/80 dark:text-white/80">Phone</dt>
        <dd className="opacity-80 flex items-center gap-2">
          <span className={skeleton}>{phone}</span>
          <button type="button" className={copyButton} onClick={() => copyValue(phone)}>
            Copy
          </button>
        </dd>
        <dt className="font-medium text-black/80 dark:text-white/80">Email</dt>
        <dd className="opacity-80 flex items-center gap-2">
          <span className={skeleton}>{email}</span>
          <button type="button" className={copyButton} onClick={() => copyValue(email)}>
            Copy
          </button>
        </dd>
      </dl>
    </SectionCard>
  );
}

function LinkTile({ icon }: { icon: LinkIconKey }) {
  const spec = LINK_ICONS[icon];
  const style: CSSProperties = { color: spec.fg, background: spec.bg, ...(spec.shadow ? { boxShadow: spec.shadow } : null) };
  return (
    <span className={styles.linkIcon} aria-hidden="true" style={style}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {spec.paths.map((p) => (
          <path
            key={p.d.slice(0, 24)}
            fill="currentColor"
            d={p.d}
            fillRule={p.evenOdd ? "evenodd" : undefined}
            clipRule={p.evenOdd ? "evenodd" : undefined}
          />
        ))}
      </svg>
    </span>
  );
}

/** Links: social/profile URLs as brand tiles plus the "Download Resume" button. */
export function LinksCard({ profile }: { profile: StudentProfile | null }) {
  const links = profile
    ? PROFILE_LINKS.map((l) => ({ ...l, url: normaliseLink(profile[l.field]) })).filter((l) => l.url)
    : [];
  const resume = profile ? normaliseLink(profile.resume_url) : "";
  const count = links.length + (resume ? 1 : 0);

  return (
    <SectionCard icon="link" title="Links" headingGap="mb-4">
      {count > 0 ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          {links.map((l) => (
            <li key={l.key}>
              <a
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  styles.linkItem,
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 border border-black/5 dark:border-white/10 bg-white/85 dark:bg-brand-900/50 hover:border-brand-500/40 hover:shadow-glow transition",
                )}
              >
                <LinkTile icon={l.key} />
                <span>{l.label}</span>
              </a>
            </li>
          ))}
          {resume ? (
            <li className="sm:col-span-2">
              <a href={resume} target="_blank" rel="noopener noreferrer" className={cn(styles.linkItem, styles.resumeLink)}>
                <LinkTile icon="resume" />
                <span>Download Resume</span>
              </a>
            </li>
          ) : null}
        </ul>
      ) : null}
      {profile && count === 0 ? (
        <p className="text-sm text-black/50 dark:text-white/50 mt-2">Add your online profiles to showcase your work.</p>
      ) : null}
    </SectionCard>
  );
}
