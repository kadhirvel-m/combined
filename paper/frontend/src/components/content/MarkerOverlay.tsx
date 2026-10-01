"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import styles from "./MarkerOverlay.module.css";

/**
 * Draw-on-the-page marker for presenting / screen sharing (port of
 * ui/assets/js/marker_overlay.js). Floating pencil button (or key M) toggles a
 * page-anchored canvas; P = pen, E = eraser, C = clear, Esc = close.
 */

const COLORS = [
  { value: "#ef4444", label: "Red" },
  { value: "#f59e0b", label: "Orange" },
  { value: "#eab308", label: "Yellow", edge: true },
  { value: "#22c55e", label: "Green" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#a855f7", label: "Purple" },
  { value: "#111827", label: "Black", edge: true },
];

const PATHS = {
  pencil:
    "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm2.92 2.83H5v-.92l9.06-9.06.92.92L5.92 20.08zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z",
  pen: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm14.71-9.04a1.003 1.003 0 0 0 0-1.42l-2.5-2.5a1.003 1.003 0 0 0-1.42 0l-1.29 1.29 3.75 3.75 1.46-1.12z",
  eraser:
    "M16.24 3.56a2 2 0 0 0-2.83 0L3.56 13.41a2 2 0 0 0 0 2.83l4.2 4.2c.38.38.88.56 1.41.56H21v-2H12.17l8.54-8.54a2 2 0 0 0 0-2.83l-4.47-4.07zM9.17 19l-4.2-4.2 7.07-7.07 4.2 4.2L9.17 19z",
  trash:
    "M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zm3.46-8.12L11 12.42l1.54-1.54L14.08 12.4l-1.54 1.54 1.54 1.54-1.54 1.54-1.54-1.54-1.54 1.54-1.54-1.54 1.54-1.54-1.54-1.54 1.54-1.54zM15.5 4l-1-1h-5l-1 1H5v2h14V4h-3.5z",
  close:
    "M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.3 19.71 2.89 18.29 9.17 12 2.89 5.71 4.3 4.29l6.29 6.3 6.3-6.3z",
};

function svgCursor(svg: string, x: number, y: number) {
  return `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}") ${x} ${y}, crosshair`;
}

const CURSORS = {
  pen: svgCursor(
    '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><g fill="none" fill-rule="evenodd"><path d="M6 26l3.6-1 15-15a2 2 0 0 0 0-2.8l-1.8-1.8a2 2 0 0 0-2.8 0l-15 15L4 24z" fill="#111827" opacity=".22"/><path d="M6 26l3.1-.9L24 10.2a1.2 1.2 0 0 0 0-1.7l-1.5-1.5a1.2 1.2 0 0 0-1.7 0L6 21.9 5.1 25z" fill="#f43f5e"/><path d="M5.3 25.7l.9-3.2 3.7 3.7z" fill="#fbbf24"/><path d="M19.3 6.7l6 6" stroke="#fff" stroke-width="1.4" opacity=".85"/></g></svg>',
    2,
    28,
  ),
  eraser: svgCursor(
    '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M11 25h12" stroke="#111827" stroke-width="2" opacity=".35"/><path d="M7 20l8-8 8 8-5 5H12z" fill="#60a5fa"/><path d="M15 12l4-4a2 2 0 0 1 2.8 0l2.2 2.2a2 2 0 0 1 0 2.8l-3.8 3.8z" fill="#111827" opacity=".2"/><path d="M12 25h6l-6-6-5 5a2 2 0 0 0 1.4 1z" fill="#f1f5f9"/></svg>',
    6,
    26,
  ),
};

function Glyph({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

function documentSize() {
  const se = document.scrollingElement || document.documentElement;
  const de = document.documentElement;
  const b = document.body;
  return {
    w: Math.max(se.scrollWidth, se.clientWidth, de.scrollWidth, de.clientWidth, b?.scrollWidth || 0, b?.clientWidth || 0),
    h: Math.max(se.scrollHeight, se.clientHeight, de.scrollHeight, de.clientHeight, b?.scrollHeight || 0, b?.clientHeight || 0),
  };
}

export function MarkerOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [color, setColor] = useState(COLORS[0].value);
  const [size, setSize] = useState(6);
  const state = useRef({ drawing: false, prev: null as { x: number; y: number } | null, tool, color, size, enabled });
  // Window-level listeners read the latest tool settings through this ref.
  useEffect(() => {
    Object.assign(state.current, { tool, color, size, enabled });
  }, [tool, color, size, enabled]);

  const ensureSize = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const { w, h } = documentSize();
    const nextW = Math.max(1, Math.floor(w * dpr));
    const nextH = Math.max(1, Math.floor(h * dpr));
    if (canvas.width !== nextW || canvas.height !== nextH) {
      // Keep the existing drawing when the document grows.
      const snapshot = document.createElement("canvas");
      snapshot.width = canvas.width || 1;
      snapshot.height = canvas.height || 1;
      snapshot.getContext("2d")?.drawImage(canvas, 0, 0);
      canvas.width = nextW;
      canvas.height = nextH;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      if (snapshot.width > 1 && snapshot.height > 1) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(snapshot, 0, 0);
        ctx.restore();
      }
    }
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
  }, []);

  const clear = useCallback(() => {
    ensureSize();
    const canvas = canvasRef.current;
    canvas?.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
  }, [ensureSize]);

  useEffect(() => {
    if (enabled) ensureSize();
  }, [enabled, ensureSize]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = (target?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || target?.isContentEditable) return;
      const k = e.key.toLowerCase();
      if (e.key === "Escape" && state.current.enabled) return setEnabled(false);
      if (k === "m") return setEnabled((v) => !v);
      if (!state.current.enabled) return;
      if (k === "p") setTool("pen");
      if (k === "e") setTool("eraser");
      if (k === "c") clear();
    };
    const point = (e: PointerEvent) => ({ x: e.pageX, y: e.pageY });
    const onMove = (e: PointerEvent) => {
      const s = state.current;
      if (!s.enabled || !s.drawing || !s.prev) return;
      const cur = point(e);
      ensureSize();
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) {
        ctx.save();
        ctx.globalCompositeOperation = s.tool === "eraser" ? "destination-out" : "source-over";
        ctx.strokeStyle = s.tool === "eraser" ? "rgba(0,0,0,1)" : s.color;
        ctx.lineWidth = s.size;
        ctx.beginPath();
        ctx.moveTo(s.prev.x, s.prev.y);
        ctx.lineTo(cur.x, cur.y);
        ctx.stroke();
        ctx.restore();
      }
      s.prev = cur;
      e.preventDefault();
    };
    const stop = () => {
      state.current.drawing = false;
      state.current.prev = null;
    };
    const onResize = () => state.current.enabled && ensureSize();
    const observer = new MutationObserver(onResize);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize);
    };
  }, [clear, ensureSize]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        style={{ display: enabled ? "block" : "none", pointerEvents: enabled ? "auto" : "none", cursor: enabled ? CURSORS[tool] : undefined }}
        onPointerDown={(e) => {
          if (!enabled) return;
          state.current.drawing = true;
          state.current.prev = { x: e.pageX, y: e.pageY };
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {}
          e.preventDefault();
        }}
      />
      <div className={styles.root}>
        <button type="button" className={styles.fab} title="Marker (M)" aria-label="Marker" onClick={() => setEnabled((v) => !v)}>
          <Glyph d={PATHS.pencil} />
        </button>
        <div className={styles.toolkit} style={{ display: enabled ? "flex" : "none" }}>
          <button type="button" className={cn(styles.btn, tool === "pen" && styles.active)} title="Pen (P)" onClick={() => setTool("pen")}>
            <Glyph d={PATHS.pen} />
          </button>
          <button type="button" className={cn(styles.btn, tool === "eraser" && styles.active)} title="Eraser (E)" onClick={() => setTool("eraser")}>
            <Glyph d={PATHS.eraser} />
          </button>
          <div className={styles.palette} title="Color">
            {COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                aria-label={c.label}
                className={styles.swatch}
                data-active={c.value === color}
                data-edge={c.edge || undefined}
                style={{ background: c.value }}
                onClick={() => setColor(c.value)}
              />
            ))}
          </div>
          <input className={styles.range} type="range" min={2} max={18} value={size} title="Size" onChange={(e) => setSize(Number(e.target.value))} />
          <button type="button" className={styles.btn} title="Clear (C)" onClick={clear}>
            <Glyph d={PATHS.trash} />
          </button>
          <button type="button" className={styles.btn} title="Close (Esc)" onClick={() => setEnabled(false)}>
            <Glyph d={PATHS.close} />
          </button>
        </div>
      </div>
    </>
  );
}
