import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { msg } from "../protocol";
import type { AnnotationStroke, MarkerPoint, MarkerTool, SendFn } from "../types";
import { useStateRef } from "./useStateRef";

function pointerToNorm(e: { clientX: number; clientY: number }): MarkerPoint {
  const x = Math.max(0, Math.min(1, e.clientX / window.innerWidth));
  const y = Math.max(0, Math.min(1, e.clientY / window.innerHeight));
  return { x, y };
}

/**
 * Screen-share annotations: a full-viewport canvas the sharer draws on.
 * Strokes are normalised to the viewport and broadcast (`annotation-draw`);
 * strokes from others are drawn into the same canvas (which stays hidden
 * unless the marker is on — as on the original).
 */
export function useMarker(send: SendFn) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [enabled, setEnabled, enabledRef] = useStateRef(false);
  const [tool, setTool, toolRef] = useStateRef<MarkerTool>("pen");
  const [color, setColor, colorRef] = useStateRef("#ff0000");
  const [size, setSize, sizeRef] = useStateRef(6);
  const [fabVisible, setFabVisible] = useState(false);
  const drawing = useRef(false);
  const prev = useRef<MarkerPoint | null>(null);
  const sendRef = useRef(send);
  useEffect(() => {
    sendRef.current = send;
  }, [send]);

  const ensureCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    if (!ctxRef.current) ctxRef.current = canvas.getContext("2d");
    const ctx = ctxRef.current;
    if (!ctx) return null;
    const dpr = window.devicePixelRatio || 1;
    const w = Math.floor(window.innerWidth * dpr);
    const h = Math.floor(window.innerHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
    return ctx;
  }, []);

  const drawStroke = useCallback(
    (stroke: AnnotationStroke) => {
      const ctx = ensureCanvas();
      if (!ctx) return;
      const strokeTool = stroke.tool || "pen";
      const strokeColor = stroke.color || "#ff0000";
      const strokeSize = Number(stroke.size || 6);
      const points = Array.isArray(stroke.points) ? stroke.points : [];
      if (points.length < 2) return;

      ctx.save();
      if (strokeTool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = strokeColor;
      }
      ctx.lineWidth = strokeSize;
      ctx.beginPath();
      ctx.moveTo(points[0].x * window.innerWidth, points[0].y * window.innerHeight);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x * window.innerWidth, points[i].y * window.innerHeight);
      }
      ctx.stroke();
      ctx.restore();
    },
    [ensureCanvas],
  );

  /** Clear the canvas; `broadcast` also tells everyone else (`annotation-clear`). */
  const clear = useCallback(
    (broadcast = true) => {
      const ctx = ensureCanvas();
      const canvas = canvasRef.current;
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (broadcast) sendRef.current(msg.annotationClear(), { silent: true });
    },
    [ensureCanvas],
  );

  const setMarkerEnabled = useCallback(
    (next: boolean) => {
      ensureCanvas();
      setEnabled(!!next);
    },
    [ensureCanvas, setEnabled],
  );

  /** `setMarkerUIVisible`: the FAB only while sharing; hiding also turns the marker off. */
  const setUiVisible = useCallback(
    (visible: boolean, isSharing: boolean) => {
      setFabVisible(visible && isSharing);
      if (!visible) setEnabled(false);
    },
    [setEnabled],
  );

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLCanvasElement>) => {
      if (!enabledRef.current) return;
      drawing.current = true;
      prev.current = pointerToNorm(e);
      e.preventDefault();
    },
    [enabledRef],
  );

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!enabledRef.current || !drawing.current || !prev.current) return;
      const cur = pointerToNorm(e);
      const points = [prev.current, cur];
      const strokeColor = colorRef.current || "#ff0000";
      const strokeSize = Number(sizeRef.current || 6);
      drawStroke({ tool: toolRef.current, color: strokeColor, size: strokeSize, points });
      sendRef.current(msg.annotationDraw(toolRef.current, strokeColor, strokeSize, points), { silent: true });
      prev.current = cur;
      e.preventDefault();
    };
    const onUp = () => {
      drawing.current = false;
      prev.current = null;
    };
    const onResize = () => {
      if (enabledRef.current) ensureCanvas();
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("resize", onResize);
    };
  }, [colorRef, drawStroke, enabledRef, ensureCanvas, sizeRef, toolRef]);

  return {
    canvasRef,
    enabled,
    tool,
    color,
    size,
    fabVisible,
    setTool,
    setColor,
    setSize,
    setMarkerEnabled,
    setUiVisible,
    drawStroke,
    clear,
    onPointerDown,
  };
}

export type Marker = ReturnType<typeof useMarker>;
