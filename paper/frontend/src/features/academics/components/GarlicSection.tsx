"use client";

import { useEffect, useState } from "react";
import { hardNavigate } from "@/lib/routes";
import { getFeatureFlags } from "../api";
import { Glyph } from "./Glyph";

/** GARLIC banner, shown only when the backend's `garlic_os` feature flag is on. */
export function GarlicSection() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getFeatureFlags()
      .then((flags) => {
        if (!cancelled && flags && flags.garlic_os === true) setEnabled(true);
      })
      .catch((e) => console.warn("Feature flags check failed:", e));
    return () => {
      cancelled = true;
    };
  }, []);

  if (!enabled) return null;
  return (
    <section className="relative py-6 border-t border-black/5 dark:border-white/10">
      <div className="container">
        <div className="rounded-2xl ring-1 ring-brand-500/25 bg-gradient-to-r from-brand-500/10 backdrop-blur p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- static asset served from /public */}
              <img
                src="/assets/img/garlic-logo.png"
                alt="GARLIC"
                className="h-10 w-10 rounded-xl ring-1 ring-black/10 dark:ring-white/15 object-cover"
              />
              <div>
                <h3 className="text-lg md:text-xl font-extrabold tracking-tight text-brand-900 dark:text-brandlt-100">
                  GARLIC Autonomous Study Mode
                </h3>
                <p className="text-xs md:text-sm text-neutral-700 dark:text-white/75">Open the dedicated decision and execution workspace.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => hardNavigate("/garlic_academics.html")}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-700 shadow-[0_12px_30px_rgba(158,75,138,0.35)] hover:brightness-110 transition"
              >
                <Glyph name="auto_awesome" className="text-[18px]" />
                <span>Activate GARLIC</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
