import React from "react";

export default function AureoleGlow({ small }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className={`absolute ${small ? "top-1/2" : "top-0"} left-1/4 -translate-x-1/2 h-[22rem] w-[22rem] rounded-full blur-3xl opacity-20 bg-[#9E4B8A]`} />
      <div className="absolute bottom-0 right-10 h-[18rem] w-[18rem] rounded-full blur-3xl opacity-20 bg-[#4C2A59]" />
    </div>
  );
}
