import React from "react";

export default function DropCap({ children, letter = "T" }) {
  return (
    <p>
      <span className="float-left mr-3 -mt-1 text-6xl leading-none font-extrabold text-[#9E4B8A]">{letter}</span>
      {children}
    </p>
  );
}
