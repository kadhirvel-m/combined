"use client";

import { forwardRef, useState, type ButtonHTMLAttributes, type CSSProperties, type MouseEvent } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import styles from "../notes.module.css";

interface Wave {
  id: number;
  x: number;
  y: number;
  size: number;
}

let waveId = 0;

/**
 * Button with the Material ripple the notes pages used (`.ripple`). Like the
 * original class it makes the button `position: relative` and clips overflow.
 */
export const RippleButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(function RippleButton(
  { className, children, onClick, type = "button", ...rest },
  ref,
) {
  const [waves, setWaves] = useState<Wave[]>([]);
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const wave = { id: ++waveId, x: e.clientX - rect.left, y: e.clientY - rect.top, size: Math.max(rect.width, rect.height) * 1.8 };
    setWaves((all) => [...all, wave]);
    onClick?.(e);
  };
  return (
    <button ref={ref} type={type} className={cn("relative", styles.ripple, className)} onClick={handleClick} {...rest}>
      {children}
      {waves.map((w) => (
        <span
          key={w.id}
          aria-hidden="true"
          className={styles.rippleWave}
          style={{ left: w.x, top: w.y, "--ripple-size": `${w.size}px` } as CSSProperties}
          onAnimationEnd={() => setWaves((all) => all.filter((x) => x.id !== w.id))}
        />
      ))}
    </button>
  );
});

/** Material Symbols at the originals' settings (weight 400, baseline aligned). */
export function Sym({
  name,
  className,
  style,
  weight = 400,
  outlined,
}: {
  name: string;
  className?: string;
  style?: CSSProperties;
  weight?: number;
  /** Material Symbols Outlined (a few controls of the originals used this family). */
  outlined?: boolean;
}) {
  return <Icon name={name} variant={outlined ? "outlined" : "rounded"} weight={weight} className={cn("align-baseline", className)} style={style} />;
}
