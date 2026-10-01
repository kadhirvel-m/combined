"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Lottie } from "@/components/content/Lottie";
import styles from "../auth.module.css";

const LOGIN_LOTTIE = "https://lottie.host/848055f4-11c7-4032-80e0-d51319c33bca/lF6845uqpU.lottie";

export interface PageLoaderProps {
  /** Cover the page. */
  show: boolean;
  /** `lottie`: login page animation. `spinner`: signup page ring. */
  variant: "lottie" | "spinner";
}

/** Blocking full-screen overlay shown while signing in or during the Google round trip. */
export function PageLoader({ show, variant }: PageLoaderProps) {
  // The animation is only fetched once the loader is first needed.
  const [everShown, setEverShown] = useState(show);
  if (show && !everShown) setEverShown(true);

  if (variant === "spinner") {
    return (
      <div className={cn(styles.loader, styles.loaderSpinner, show && styles.loaderActive)} aria-hidden="true">
        <div className={styles.spinner} role="status" aria-label="Loading" />
      </div>
    );
  }
  return (
    <div className={cn(styles.loader, styles.loaderLottie, show && styles.loaderActive)}>
      {everShown ? <Lottie src={LOGIN_LOTTIE} className="w-[300px] h-[300px]" /> : null}
    </div>
  );
}
