import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import NeonDivider from "./components/NeonDivider";
import Frame from "./components/Frame";
import DropCap from "./components/DropCap";
import RibbonQuote from "./components/RibbonQuote";
import WideTag from "./components/WideTag";
import AuraNote from "./components/AuraNote";
import MiniCard from "./components/MiniCard";
import Timeline from "./components/Timeline";
import Footer from "./components/Footer";
import Style from "./components/Style";
import TargetCursor from "./components/TargetCursor";

import data from "./data/story.json";

// Preload local images from data/images and expose url strings
const imageModules = import.meta.glob('./data/images/*', { eager: true, as: 'url' });

// ⚔️ The Last Heir — Futuristic Story Reader (React + Vite)
// Drop into src/App.jsx in a Vite + React + Tailwind project
// Clean-slate redesign: alternating image/text sections, neon fantasy theme, no gallery

export default function FantasyReader() {
  const [theme, setTheme] = useState(() =>
    typeof window !== "undefined" && localStorage.getItem("theme")
      ? localStorage.getItem("theme")
      : (data.themeDefault || "dark")
  );
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Keyboard toggle (press "t")
  useEffect(() => {
    const onKey = (e) => {
      if (e.key.toLowerCase() === "t") setTheme((t) => (t === "dark" ? "light" : "dark"));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Resolve filenames in story.json to actual URLs via Vite's glob imports
  const IMG = React.useMemo(() => {
    const entries = Object.entries(data.images).map(([key, filename]) => {
      const path = `./data/images/${filename}`;
      const url = imageModules[path] ?? filename; // fallback in case of missing match
      return [key, url];
    });
    return Object.fromEntries(entries);
  }, []);

  const copy = { ...data.hero, p: data.paragraphs };

  return (
    <div className="min-h-screen font-sans antialiased bg-[#090914] text-white selection:bg-[#9E4B8A]/40">
      <TargetCursor spinDuration={2} hideDefaultCursor={true} />
  {/* Header component (progress, HUD, hero) */}
  <Header theme={theme} setTheme={setTheme} hero={data.hero} />

      {/* Scrollytelling: Alternating frames */}
  <Timeline items={data.timeline} />

      {data.frames.map((f, idx) => (
        <React.Fragment key={f.id}>
          <Frame id={f.id} imageLeft={f.imageLeft} img={IMG[f.img]} title={f.title} subtitle={f.subtitle} kicker={f.kicker}>
            {f.content.map((c, i) => {
              if (c.type === 'dropcap') return <DropCap key={i}>{data.paragraphs[c.textIndex]}</DropCap>;
              if (c.type === 'p') return <p key={i} className="mt-6">{data.paragraphs[c.textIndex]}</p>;
              if (c.type === 'quote') return <RibbonQuote key={i} quote={c.quote} who={c.who} />;
              if (c.type === 'tag') return <WideTag key={i}>{c.text}</WideTag>;
              if (c.type === 'aura') return <AuraNote key={i} text={c.text} />;
              return null;
            })}
          </Frame>
          {idx < data.frames.length - 1 && <NeonDivider />}
        </React.Fragment>
      ))}

      {/* Atmospherics / Map */}
      <section id="map" className="relative py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h3 className="text-2xl font-bold">{data.map.title}</h3>
          <p className="text-white/70 mt-2">{data.map.subtitle}</p>
          <div className="mt-8 grid sm:grid-cols-3 gap-6">
            {data.map.cards.map((c, i) => (
              <MiniCard key={i} img={IMG[c.img]} title={c.title} note={c.note} />
            ))}
          </div>
        </div>
      </section>

      <Footer left={data.footer.left} links={data.footer.links} />
      <Style />
    </div>
  );
}

// Inline components moved to components/ directory
