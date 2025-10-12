import React from "react";

export default function MiniCard({ img, title, note }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 hover:bg-white/10 transition">
      <div className="aspect-video">
        <img src={img} alt={title} className="h-full w-full object-cover" />
      </div>
      <div className="p-4">
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-white/70 mt-1">{note}</div>
      </div>
    </div>
  );
}
