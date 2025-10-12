import React from "react";

export default function Timeline({ items }) {
  return (
    <div className="hidden xl:block fixed right-6 top-1/2 -translate-y-1/2 z-[90]">
      <nav className="flex flex-col gap-3 items-end">
        {items.map((it, i) => (
          <a key={i} href={`#${it.id}`} className="group inline-flex items-center gap-3">
            <span className="text-xs text-white/60 opacity-0 group-hover:opacity-100 transition">{it.label}</span>
            <span className="h-3 w-3 rounded-full bg-white/25 ring-1 ring-white/20 group-hover:bg-[#9E4B8A]" />
          </a>
        ))}
      </nav>
    </div>
  );
}
