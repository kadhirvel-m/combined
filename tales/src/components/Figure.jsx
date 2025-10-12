import React from "react";

export default function Figure({ img, alt = "scene" }) {
  return (
    <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-white/5">
      <img src={img} alt={alt} className="h-full w-full object-cover" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      <div className="absolute inset-0 ring-1 ring-white/10 pointer-events-none" />
    </div>
  );
}
