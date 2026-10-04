import { cn } from "@/lib/cn";
import { formatDateRange, formatMonthYear } from "../lib/format";
import type { CertificationEntry, EducationEntry, ExperienceEntry, PortfolioProject, PublicationEntry } from "../types";
import styles from "../profile.module.css";
import { Glyph } from "./Glyph";
import { EmptyHint, panel, SectionCard } from "./SectionCard";

function present<T>(list: T[] | null | undefined): NonNullable<T>[] {
  return Array.isArray(list) ? (list.filter(Boolean) as NonNullable<T>[]) : [];
}

const brandLink = "text-xs text-brand-600 dark:text-brand-300 inline-flex items-center gap-1";

/** Experience: vertical timeline of roles with dates, meta, description and attachments. */
export function ExperienceSection({ items }: { items: ExperienceEntry[] | null | undefined }) {
  const list = present(items);
  return (
    <SectionCard icon="work" title="Experience" manageHref="/profile_edit.html#experience">
      <div className={cn(styles.timeline, "grid gap-6 mt-4")}>
        {list.map((exp, i) => {
          const range = formatDateRange(exp.start_date, exp.end_date, exp.is_current);
          const meta: string[] = [];
          if (exp.company || exp.employment_type) meta.push([exp.company, exp.employment_type].filter(Boolean).join(" • "));
          if (exp.location || exp.location_type) meta.push([exp.location_type, exp.location].filter(Boolean).join(" • "));
          const media = Array.isArray(exp.media) ? exp.media.filter((m) => m && m.url) : [];
          return (
            <article key={exp.id ?? i} className={cn(styles.timelineItem, panel, "py-4 pr-4 shadow-sm")}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-semibold">{exp.title || "Experience"}</h4>
                {range ? <span className="text-xs text-black/60 dark:text-white/60">{range}</span> : null}
              </div>
              {meta.length ? <p className="text-xs text-black/60 dark:text-white/55 mt-1">{meta.join("  |  ")}</p> : null}
              {exp.description ? <p className="mt-3 text-sm opacity-80 whitespace-pre-line">{exp.description}</p> : null}
              {media.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {media.map((m, j) => (
                    <a
                      key={`${m.url}-${j}`}
                      href={String(m.url)}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full border border-brand-500/30 text-brand-700 dark:text-brand-200 bg-brand-500/10"
                    >
                      <Glyph name="attach_file" className="text-sm" />
                      {m.title || "Attachment"}
                    </a>
                  ))}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
      {list.length ? null : <EmptyHint>Add your professional experience to showcase your journey.</EmptyHint>}
    </SectionCard>
  );
}

/** Education: institution, degree • department, batch | semester | reg. no, extras. */
export function EducationSection({ items }: { items: EducationEntry[] | null | undefined }) {
  const list = present(items);
  return (
    <SectionCard icon="school" title="Education" manageHref="/profile_edit.html#education">
      <div className="grid gap-4 mt-4">
        {list.map((ed, i) => {
          const subtitle = [ed.degree, ed.department].filter(Boolean);
          const academic: string[] = [];
          if (ed.batch_range) academic.push(ed.batch_range);
          if (ed.current_semester) academic.push(`Sem ${ed.current_semester}`);
          if (ed.regno) academic.push(ed.regno);
          const extras = [ed.grade, ed.activities].filter(Boolean).join(" • ");
          // Older rows: field of study / date range.
          const legacy: string[] = [];
          if (!subtitle.length && ed.field_of_study) legacy.push(ed.field_of_study);
          if (ed.start_date || ed.end_date) legacy.push(formatDateRange(ed.start_date, ed.end_date, false));
          const legacyText = legacy.filter(Boolean).join(" • ");
          return (
            <article key={ed.id ?? i} className={cn(panel, "p-4")}>
              <h4 className="font-semibold text-sm">{ed.school || "Institution"}</h4>
              {subtitle.length ? <p className="text-xs text-black/60 dark:text-white/55 mt-1">{subtitle.join(" • ")}</p> : null}
              {academic.length ? <p className="text-xs text-black/55 dark:text-white/50 mt-1">{academic.join("  |  ")}</p> : null}
              {extras ? <p className="text-xs text-black/55 dark:text-white/50 mt-1">{extras}</p> : null}
              {ed.description ? <p className="text-sm opacity-80 mt-2 whitespace-pre-line">{ed.description}</p> : null}
              {legacyText ? <p className="text-xs text-black/45 dark:text-white/40 mt-2">{legacyText}</p> : null}
            </article>
          );
        })}
      </div>
      {list.length ? null : <EmptyHint>Add your academic history, degrees and highlights.</EmptyHint>}
    </SectionCard>
  );
}

/** Certifications: name, issuer • issued • validity, description, credential link. */
export function CertificationsSection({ items }: { items: CertificationEntry[] | null | undefined }) {
  const list = present(items);
  return (
    <SectionCard icon="workspace_premium" title="Certifications" manageHref="/profile_edit.html#certifications">
      <div className="grid gap-3 mt-4">
        {list.map((cert, i) => {
          const meta: string[] = [];
          if (cert.issuing_org) meta.push(cert.issuing_org);
          if (cert.issue_date) meta.push(String(formatMonthYear(cert.issue_date)));
          if (cert.does_not_expire) meta.push("No expiry");
          else if (cert.expiration_date) meta.push(`Valid till ${formatMonthYear(cert.expiration_date)}`);
          return (
            <article key={cert.id ?? i} className={cn(panel, "p-4")}>
              <h4 className="font-semibold text-sm">{cert.name || "Certification"}</h4>
              {meta.length ? <p className="text-xs text-black/60 dark:text-white/55 mt-1">{meta.join(" • ")}</p> : null}
              {cert.description ? <p className="text-sm opacity-80 mt-2 whitespace-pre-line">{cert.description}</p> : null}
              {cert.credential_id || cert.credential_url ? (
                <p className="text-xs text-black/55 dark:text-white/55 mt-2 flex items-center gap-2">
                  {cert.credential_id ? `Credential • ${cert.credential_id}` : null}
                  {cert.credential_url ? (
                    <a href={cert.credential_url} target="_blank" rel="noopener" className="text-brand-600 dark:text-brand-300">
                      {cert.credential_id ? "Verify" : "View credential"}
                    </a>
                  ) : null}
                </p>
              ) : null}
            </article>
          );
        })}
      </div>
      {list.length ? null : <EmptyHint>Showcase certifications and credentials that matter.</EmptyHint>}
    </SectionCard>
  );
}

/** Portfolio Projects: cards with dates, description, stack chips, link and team. */
export function PortfolioSection({ items }: { items: PortfolioProject[] | null | undefined }) {
  const list = present(items);
  return (
    <SectionCard icon="rocket_launch" title="Portfolio Projects" manageHref="/profile_edit.html#projects">
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
        {list.map((project, i) => {
          const range = formatDateRange(project.start_date, project.end_date, false);
          const stack = Array.isArray(project.tech_stack) ? project.tech_stack.slice(0, 6) : [];
          const team = Array.isArray(project.team)
            ? project.team
                .map((member) => member?.name)
                .filter(Boolean)
                .join(", ")
            : "";
          return (
            <article key={project.id ?? i} className={cn(panel, "p-4 flex flex-col gap-3")}>
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold text-sm">{project.name || "Project"}</h4>
                {range ? <span className="text-xs text-black/55 dark:text-white/50">{range}</span> : null}
              </div>
              {project.description ? <p className="text-sm opacity-80 whitespace-pre-line">{project.description}</p> : null}
              {stack.length ? (
                <div className="flex flex-wrap gap-2">
                  {stack.map((t, j) => (
                    <span
                      key={`${t}-${j}`}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full border border-brand-600/30 text-brand-700 dark:text-brand-200 bg-brand-500/10"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              ) : null}
              {project.url ? (
                <a href={project.url} target="_blank" rel="noopener" className={brandLink}>
                  <Glyph name="open_in_new" className="text-sm" />
                  View project
                </a>
              ) : null}
              {team ? <p className="text-xs text-black/55 dark:text-white/55">Team: {team}</p> : null}
            </article>
          );
        })}
      </div>
      {list.length ? null : <EmptyHint>Highlight the projects you are proud of with outcomes and links.</EmptyHint>}
    </SectionCard>
  );
}

/** Publications: title, publisher • date, authors, abstract and link. */
export function PublicationsSection({ items }: { items: PublicationEntry[] | null | undefined }) {
  const list = present(items);
  return (
    <SectionCard icon="menu_book" title="Publications" manageHref="/profile_edit.html#publications">
      <div className="grid gap-3 mt-4">
        {list.map((pub, i) => {
          const meta: string[] = [];
          if (pub.publisher) meta.push(pub.publisher);
          if (pub.publication_date) meta.push(String(formatMonthYear(pub.publication_date)));
          return (
            <article key={pub.id ?? i} className={cn(panel, "p-4")}>
              <h4 className="font-semibold text-sm">{pub.title || "Publication"}</h4>
              {meta.length ? <p className="text-xs text-black/60 dark:text-white/55 mt-1">{meta.join(" • ")}</p> : null}
              {Array.isArray(pub.authors) && pub.authors.length ? (
                <p className="text-xs text-black/55 dark:text-white/50 mt-1">Authors: {pub.authors.join(", ")}</p>
              ) : null}
              {pub.abstract ? <p className="text-sm opacity-80 mt-2 whitespace-pre-line">{pub.abstract}</p> : null}
              {pub.url ? (
                <a href={pub.url} target="_blank" rel="noopener" className={cn(brandLink, "mt-2")}>
                  <Glyph name="open_in_new" className="text-sm" />
                  View publication
                </a>
              ) : null}
            </article>
          );
        })}
      </div>
      {list.length ? null : <EmptyHint>List your papers, articles or talks to build credibility.</EmptyHint>}
    </SectionCard>
  );
}
