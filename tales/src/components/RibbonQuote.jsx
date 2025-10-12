import React from "react";

export default function RibbonQuote({ quote, who }) {
  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur relative overflow-hidden">
      <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-[#9E4B8A]/20 blur-2xl" />
      <blockquote className="text-white/90 italic text-xl">“{quote}”</blockquote>
      <div className="text-white/60 mt-1">— {who}</div>
    </div>
  );
}
