"use client";

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent } from "react";
import { cn } from "@/lib/cn";
import { Sym, useNotes } from "@/features/notes";
import { medicalApi } from "../../api";
import type { MindMapNode } from "../../types";
import styles from "../../medical.module.css";

const MAX_DEPTH = 4;
const DEPTH_CLASS = [styles.depth0, styles.depth1, styles.depth2, styles.depth3, styles.depth4];
const TOOLBAR_BTN: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: ".3rem",
  border: "1px solid var(--outline)",
  borderRadius: 999,
  padding: ".38rem .75rem",
  fontSize: ".74rem",
  fontWeight: 600,
  cursor: "pointer",
  background: "transparent",
  color: "inherit",
};
const DIVIDER: CSSProperties = { width: 1, height: 20, background: "var(--outline)", margin: "0 .15rem" };
const SMALL_ICON: CSSProperties = { fontSize: ".9rem" };

const hasChildren = (node: MindMapNode) => Array.isArray(node.children) && node.children.length > 0;

/** Paths ("", "0", "0.2"…) of every node with children that is rendered (depth ≤ 4). */
function expandablePaths(node: MindMapNode, path = "", depth = 0, out: string[] = []): string[] {
  if (depth > MAX_DEPTH || !hasChildren(node)) return out;
  out.push(path);
  node.children?.forEach((child, i) => expandablePaths(child, path ? `${path}.${i}` : String(i), depth + 1, out));
  return out;
}

function MindMapBranch({ node, path, depth, open, toggle }: { node: MindMapNode; path: string; depth: number; open: Set<string>; toggle: (path: string) => void }) {
  const children = hasChildren(node) ? node.children || [] : [];
  const isOpen = open.has(path);
  const onToggle = (e: ReactMouseEvent) => {
    e.stopPropagation();
    toggle(path);
  };
  return (
    <div className={cn(styles.mmNode, DEPTH_CLASS[Math.min(depth, 4)])}>
      <div className={styles.mmNodeHeader}>
        <span className={styles.mmLabel} title={node.label || ""} data-expandable={children.length ? "" : undefined} onClick={children.length ? onToggle : undefined}>
          {node.label || "—"}
        </span>
        {children.length ? (
          <>
            <span className={cn(styles.mmToggle, isOpen && styles.mmExpanded)} title={isOpen ? "Collapse" : "Expand"} onClick={onToggle}>
              <Sym name={isOpen ? "expand_less" : "chevron_right"} className={styles.mmToggleIcon} />
            </span>
            <span className={styles.mmCount} title={`${children.length} sub-topics`}>
              {children.length}
            </span>
          </>
        ) : null}
      </div>
      {children.length ? (
        <div className={cn(styles.mmChildren, isOpen && styles.mmOpen)}>
          {depth + 1 <= MAX_DEPTH
            ? children.map((child, i) => (
                <div key={i} className={styles.mmChildRow}>
                  <MindMapBranch node={child} path={path ? `${path}.${i}` : String(i)} depth={depth + 1} open={open} toggle={toggle} />
                </div>
              ))
            : null}
        </div>
      ) : null}
    </div>
  );
}

type TreeState = { state: "ready"; map: MindMapNode } | { state: "loading" } | { state: "failed" };

/** Clinical decision tree as a pannable, zoomable mind map (`POST /api/notes/clinical-decision-tree`). */
export function DecisionTree({ topic, map, onBack }: { topic: string; map: MindMapNode; onBack: () => void }) {
  const { snack, variant } = useNotes();
  const [tree, setTree] = useState<TreeState>({ state: "ready", map });
  const [open, setOpen] = useState<Set<string>>(() => new Set([""]));
  const [view, setView] = useState({ zoom: 1, panX: 0, panY: 0 });
  const [grabbing, setGrabbing] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const pan = useRef<{ startX: number; startY: number } | null>(null);
  const viewRef = useRef(view);
  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  // Wheel zoom needs a non-passive listener to stop the page from scrolling.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.08 : 0.08;
      setView((v) => ({ ...v, zoom: Math.min(2.5, Math.max(0.3, v.zoom + delta)) }));
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    if (!grabbing) return;
    const onMove = (e: MouseEvent) => {
      const start = pan.current;
      if (!start) return;
      setView((v) => ({ ...v, panX: e.clientX - start.startX, panY: e.clientY - start.startY }));
    };
    const onUp = () => {
      pan.current = null;
      setGrabbing(false);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, [grabbing]);

  const toggle = (path: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });

  const regenerate = async () => {
    if (regenerating) return;
    setRegenerating(true);
    setTree({ state: "loading" });
    try {
      const res = await medicalApi.decisionTree(topic, variant, true);
      if (!res.ok) throw new Error((res.data && (res.data.detail || res.data.error)) || "Regeneration failed");
      const fresh = res.data?.mind_map || null;
      if (!fresh || !fresh.label) throw new Error("Invalid data");
      setView({ zoom: 1, panX: 0, panY: 0 });
      setOpen(new Set([""]));
      setTree({ state: "ready", map: fresh });
      snack("Mind map regenerated!");
    } catch (err) {
      console.error("[MindMap] regen error:", err);
      snack((err instanceof Error && err.message) || "Regeneration failed");
      setTree({ state: "failed" });
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div style={{ maxWidth: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: ".75rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: ".5rem",
          flexWrap: "wrap",
          border: "1px solid var(--outline)",
          borderRadius: "1rem",
          padding: ".5rem .7rem",
          background: "color-mix(in oklab, var(--surface) 90%, transparent)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: ".4rem", fontSize: ".84rem", fontWeight: 700, color: "var(--brand)" }}>
          <Sym name="schema" style={{ fontSize: "1.1rem" }} />
          Mind Map — {topic}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: ".35rem", flexWrap: "wrap" }}>
          <button type="button" style={TOOLBAR_BTN} title="Zoom In" onClick={() => setView((v) => ({ ...v, zoom: Math.min(2.5, v.zoom + 0.15) }))}>
            <Sym name="zoom_in" style={SMALL_ICON} />
          </button>
          <span style={{ fontSize: ".7rem", fontWeight: 600, minWidth: 36, textAlign: "center", color: "var(--muted)" }}>{Math.round(view.zoom * 100)}%</span>
          <button type="button" style={TOOLBAR_BTN} title="Zoom Out" onClick={() => setView((v) => ({ ...v, zoom: Math.max(0.3, v.zoom - 0.15) }))}>
            <Sym name="zoom_out" style={SMALL_ICON} />
          </button>
          <button type="button" style={TOOLBAR_BTN} title="Reset View" onClick={() => setView({ zoom: 1, panX: 0, panY: 0 })}>
            <Sym name="fit_screen" style={SMALL_ICON} />
          </button>
          <div style={DIVIDER} />
          <button type="button" style={TOOLBAR_BTN} title="Expand all" onClick={() => tree.state === "ready" && setOpen(new Set(expandablePaths(tree.map)))}>
            <Sym name="unfold_more" style={SMALL_ICON} />
            Expand
          </button>
          <button type="button" style={TOOLBAR_BTN} title="Collapse all" onClick={() => setOpen(new Set([""]))}>
            <Sym name="unfold_less" style={SMALL_ICON} />
            Collapse
          </button>
          <div style={DIVIDER} />
          <button
            type="button"
            title="Regenerate mind map"
            disabled={regenerating}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: ".3rem",
              border: "none",
              borderRadius: 999,
              padding: ".42rem .85rem",
              fontSize: ".76rem",
              fontWeight: 700,
              cursor: "pointer",
              background: "linear-gradient(135deg, var(--brand), #4C2A59)",
              color: "#fff",
              boxShadow: "0 4px 14px rgba(158,75,138,.25)",
              transition: "transform .15s",
            }}
            onClick={() => void regenerate()}
          >
            {regenerating ? (
              <>
                <Sym name="progress_activity" className={styles.spin} style={SMALL_ICON} /> Generating…
              </>
            ) : (
              <>
                <Sym name="refresh" style={SMALL_ICON} />
                Regenerate
              </>
            )}
          </button>
          <button type="button" style={TOOLBAR_BTN} onClick={onBack}>
            <Sym name="arrow_back" style={{ fontSize: "1rem" }} />
            Back
          </button>
        </div>
      </div>
      <div
        ref={canvasRef}
        className={cn(styles.mindmap, grabbing && styles.grabbing)}
        onMouseDown={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest(`.${styles.mmLabel}, .${styles.mmToggle}, .${styles.mmCount}`)) return;
          pan.current = { startX: e.clientX - viewRef.current.panX, startY: e.clientY - viewRef.current.panY };
          setGrabbing(true);
        }}
      >
        <div className={styles.mmViewport} style={{ transform: `translate(${view.panX}px, ${view.panY}px) scale(${view.zoom})` }}>
          {tree.state === "ready" ? (
            <MindMapBranch node={tree.map} path="" depth={0} open={open} toggle={toggle} />
          ) : tree.state === "loading" ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem", gap: ".5rem", color: "var(--muted)" }}>
              <Sym name="progress_activity" className={styles.spin} style={{ fontSize: "1.4rem" }} /> Regenerating mind map…
            </div>
          ) : (
            <p style={{ color: "var(--muted)", padding: "2rem", textAlign: "center" }}>Regeneration failed. Try again.</p>
          )}
        </div>
      </div>
    </div>
  );
}
