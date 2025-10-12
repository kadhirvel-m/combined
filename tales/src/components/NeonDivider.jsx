import React from "react";
import AureoleGlow from "./AureoleGlow";

export default function NeonDivider() {
  return (
    <div className="relative">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <AureoleGlow small />
    </div>
  );
}
