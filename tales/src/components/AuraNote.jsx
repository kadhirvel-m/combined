import React from "react";

export default function AuraNote({ text }) {
  return (
    <div className="mt-5 rounded-xl border border-white/10 bg-gradient-to-r from-[#4C2A59]/30 to-[#9E4B8A]/20 p-4">
      <div className="text-white/80">{text}</div>
    </div>
  );
}
