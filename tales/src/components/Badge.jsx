import React from "react";
import DecryptedText from "./DecryptedText";

export default function Badge({ children, decrypt = false }) {
  return (
    <span className="inline-block rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs tracking-widest text-[#9E4B8A] uppercase">
      {decrypt ? <DecryptedText text={String(children)} animateOn="view" /> : children}
    </span>
  );
}
