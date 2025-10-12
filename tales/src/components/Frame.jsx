import React from "react";
import AureoleGlow from "./AureoleGlow";
import Figure from "./Figure";
import Badge from "./Badge";

export default function Frame({ id, imageLeft = true, img, title, subtitle, kicker, children }) {
  return (
    <section id={id} className="relative py-20">
      <AureoleGlow />
      <div className={`mx-auto max-w-6xl px-6 grid lg:grid-cols-2 gap-10 items-center ${imageLeft ? "" : "lg:[&>div:first-child]:order-2"}`}>
        <div>
          {kicker && <Badge decrypt>{kicker}</Badge>}
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight">{title}</h2>
          <p className="text-white/70 mt-2">{subtitle}</p>
          <div className="mt-6 text-lg leading-relaxed [&_p]:mt-4">{children}</div>
        </div>
        <Figure img={img} />
      </div>
    </section>
  );
}
