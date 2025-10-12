import React from "react";

export default function WideTag({ children }) {
  return (
    <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1 text-sm">
      <span className="h-2 w-2 rounded-full bg-[#9E4B8A]" />
      {children}
    </div>
  );
}
