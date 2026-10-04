import { cn } from "@/lib/cn";
import { skillChips, technologyChips, textOr } from "../lib/format";
import type { StudentProfile } from "../types";
import styles from "../profile.module.css";
import { BasicInfoCard, LinksCard } from "./OverviewCards";
import { CertificationsSection, EducationSection, ExperienceSection, PortfolioSection, PublicationsSection } from "./ProfileLists";
import { CardText, SectionCard } from "./SectionCard";

export type ProfileTab = "overview" | "about" | "activity";

const TABS: { key: ProfileTab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "about", label: "About" },
  { key: "activity", label: "Activity" },
];

/** Overview / About / Activity switcher (gradient pill for the active tab). */
export function ProfileTabBar({ value, onChange }: { value: ProfileTab; onChange: (tab: ProfileTab) => void }) {
  return (
    <div className="rounded-3xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-brand-900/55 backdrop-blur p-3">
      <div className="flex flex-wrap gap-2" role="tablist">
        {TABS.map((tab) => {
          const active = tab.key === value;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(tab.key)}
              className={cn(
                styles.tab,
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                active
                  ? cn(styles.tabActive, "text-white")
                  : "text-neutral-600 dark:text-white/70 bg-white/70 dark:bg-brand-900/40 ring-1 ring-black/5 dark:ring-white/10",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function OverviewPanel({ profile }: { profile: StudentProfile | null }) {
  return (
    <div className="grid gap-4">
      <div className="grid lg:grid-cols-[1.2fr,.8fr] gap-4">
        <BasicInfoCard profile={profile} />
        <LinksCard profile={profile} />
      </div>
      <ExperienceSection items={profile?.experiences} />
      <div className="grid xl:grid-cols-2 gap-4">
        <EducationSection items={profile?.education_entries} />
        <CertificationsSection items={profile?.certification_entries} />
      </div>
      <PortfolioSection items={profile?.portfolio_projects} />
      <PublicationsSection items={profile?.publication_entries} />
    </div>
  );
}

/** Text of a profile field, or the placeholder shown before load / when empty. */
function field(profile: StudentProfile | null, value: unknown, empty: string, initial = empty): string {
  return profile ? textOr(value, empty) : initial;
}

const chipClass =
  "inline-flex items-center px-3 py-1 rounded-full text-xs border border-brand-600/40 text-brand-700 dark:text-brand-200 bg-brand-500/10";

export function AboutPanel({ profile }: { profile: StudentProfile | null }) {
  const specializations = Array.isArray(profile?.specializations) ? profile.specializations.join(", ") : profile?.specializations;
  const tech = technologyChips(profile?.technologies);
  const skills = skillChips(profile?.skills);
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <SectionCard icon="subject" title="Summary">
        <CardText>{field(profile, profile?.bio, "Add a short summary about yourself.")}</CardText>
      </SectionCard>
      <SectionCard icon="school" title="Specializations">
        <CardText>{field(profile, specializations, "--")}</CardText>
      </SectionCard>
      <SectionCard icon="construction" title="Technologies">
        <CardText>{field(profile, profile?.technologies, "--")}</CardText>
        <div className="mt-3 flex flex-wrap gap-2">
          {tech.map((t, i) => (
            <span key={`${t}-${i}`} className={cn(chipClass, "gap-2")}>
              {t}
            </span>
          ))}
        </div>
      </SectionCard>
      <SectionCard icon="workspace_premium" title="Skills">
        <CardText>{field(profile, profile?.skills, "--")}</CardText>
        <div className="mt-3 flex flex-wrap gap-2">
          {skills.map((s, i) => (
            <span key={`${s}-${i}`} className={cn(chipClass, "gap-1")}>
              {s}
            </span>
          ))}
        </div>
      </SectionCard>
      <SectionCard icon="military_tech" title="Achievements">
        <CardText>{field(profile, profile?.achievements, "--")}</CardText>
      </SectionCard>
      <SectionCard icon="workspace_premium" title="Certifications">
        <CardText>{field(profile, profile?.certifications, "--")}</CardText>
      </SectionCard>
      <SectionCard icon="translate" title="Languages">
        <CardText>{field(profile, profile?.languages, "--")}</CardText>
      </SectionCard>
      <SectionCard icon="interests" title="Interests">
        <CardText>{field(profile, profile?.interests, "--")}</CardText>
      </SectionCard>
    </div>
  );
}

export function ActivityPanel({ profile }: { profile: StudentProfile | null }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <SectionCard icon="science" title="Project Highlights">
        <CardText>
          {field(profile, profile?.project_info, "Share context about the work you are exploring, hackathons or collaborations.")}
        </CardText>
      </SectionCard>
      <SectionCard icon="workspace_premium" title="Achievements">
        <CardText>{field(profile, profile?.achievements, "Capture awards, recognitions or milestones.")}</CardText>
      </SectionCard>
      <SectionCard icon="badge" title="Career Summary">
        <CardText>{field(profile, profile?.experience, "Summarise your professional focus and strengths.")}</CardText>
      </SectionCard>
      <SectionCard icon="menu_book" title="Publication Highlights">
        <CardText>
          {field(profile, profile?.publications, "Add commentary on published work, citations or speaking engagements.")}
        </CardText>
      </SectionCard>
    </div>
  );
}
