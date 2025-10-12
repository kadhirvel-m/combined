import React from "react";

export default function Footer({ left, links = [] }) {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto max-w-7xl px-6 py-10 text-sm text-white/60 flex flex-wrap items-center justify-between gap-4">
        <div>{left}</div>
        <div className="flex items-center gap-3">
          {links.map((l, i) => (
            <a key={i} className="underline decoration-dotted" href={l.href}>{l.label}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}
