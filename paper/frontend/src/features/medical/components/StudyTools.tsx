"use client";

import { cn } from "@/lib/cn";
import { Sym } from "@/features/notes";
import notesStyles from "@/features/notes/notes.module.css";
import styles from "../medical.module.css";
import { useMedical, type ToolKey } from "./MedicalProvider";

interface ToolDef {
  key: ToolKey;
  icon: string;
  iconClass: string;
  label: string;
  desc: string;
  title: string;
  /** Button content while its request runs (the original swapped the button's HTML). */
  loading?: { label: string; desc?: string };
}

const TOOLS: ToolDef[] = [
  {
    key: "matchfoll",
    icon: "swap_horiz",
    iconClass: styles.iconMatchfoll,
    label: "Match the Foll",
    desc: "Match the following quiz",
    title: "Match the Following — Interactive matching quiz",
    loading: { label: "Generating…", desc: "Creating quiz pairs" },
  },
  { key: "clinq", icon: "quiz", iconClass: styles.iconClinq, label: "ClinQ", desc: "Clinical practice questions", title: "ClinQ — Clinical Questions" },
  {
    key: "caseflow",
    icon: "account_tree",
    iconClass: styles.iconCaseflow,
    label: "CaseFlow",
    desc: "Clinical case scenarios",
    title: "Clinical CaseFlow",
    loading: { label: "Loading…", desc: "Preparing scenario" },
  },
  { key: "viva", icon: "record_voice_over", iconClass: styles.iconViva, label: "Viva", desc: "Why / How / What-if cross-questioning", title: "Viva Simulator" },
  {
    key: "decision-tree",
    icon: "schema",
    iconClass: styles.iconDecision,
    label: "Decision Trees",
    desc: "Flowcharts & emergency protocols",
    title: "Clinical Decision Trees",
    loading: { label: "Loading…", desc: "Building mind map" },
  },
  { key: "echo", icon: "biotech", iconClass: styles.iconEcho, label: "Echo", desc: "Lab values & diagnostics", title: "Echo — Lab Explorer" },
  { key: "medmap", icon: "slideshow", iconClass: styles.iconMedmap, label: "MedMap", desc: "Generate medical presentations", title: "MedMap — Medical Presentations", loading: { label: "Loading…" } },
  { key: "blink", icon: "bolt", iconClass: styles.iconBlink, label: "Blink", desc: "Visual summary image", title: "Blink — Visual summary image" },
];

/** Sticky "Study Tools" card (a horizontal scroll row below `lg`). */
export function StudyTools() {
  const medical = useMedical();
  return (
    <div className={cn(styles.toolsPanel, "rounded-2xl shadow-glow", notesStyles.glass)} style={{ borderColor: "var(--outline)" }}>
      <div className={styles.toolsHeader}>
        <Sym name="dashboard" className={styles.toolsHeaderIcon} />
        <h3>Study Tools</h3>
      </div>
      <div className={styles.toolsList}>
        {TOOLS.map((tool) => {
          const busy = !!medical.pending[tool.key];
          const swapped = busy && tool.loading;
          // Blink only relabelled itself: "Loading…" while fetching, "Back" while the image is shown.
          const blinkLabel = tool.key === "blink" ? (busy ? "Loading…" : medical.tool?.kind === "blink" ? "Back" : tool.label) : tool.label;
          return (
            <button
              key={tool.key}
              type="button"
              className={styles.toolBtn}
              data-tool={tool.key}
              title={tool.title}
              disabled={!!swapped}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                medical.runTool(tool.key);
              }}
            >
              {swapped ? (
                <>
                  <Sym name="progress_activity" className={cn(styles.toolIcon, styles.spin)} />
                  <span className={styles.toolText}>
                    <span className={styles.toolLabel}>{tool.loading?.label}</span>
                    {tool.loading?.desc ? <span className={styles.toolDesc}>{tool.loading.desc}</span> : null}
                  </span>
                </>
              ) : (
                <>
                  <Sym name={tool.icon} className={cn(styles.toolIcon, tool.iconClass)} />
                  <span className={styles.toolText}>
                    <span className={styles.toolLabel}>{blinkLabel}</span>
                    <span className={styles.toolDesc}>{tool.desc}</span>
                  </span>
                  <Sym name="arrow_forward" className={styles.toolArrow} />
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
