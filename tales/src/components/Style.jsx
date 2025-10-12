
import React from "react";

export default function Style() {
  return (
    <style>{`
      :root { color-scheme: dark; }
      html { scroll-behavior: smooth; }
      body { background: #090914; }
      :root:not(.dark) body { background: #f6f7fb; color: #10111a; }
      .btn-primary { @apply rounded-2xl px-5 py-3 bg-white text-[#1E1E2F] font-semibold; }
      .btn-ghost { @apply rounded-2xl px-5 py-3 bg-white/10 border border-white/15 backdrop-blur; }
      kbd { background: #11121a; border: 1px solid #ffffff22; padding: 2px 6px; border-radius: 6px; font-size: 12px; }
    `}</style>
  );
}
