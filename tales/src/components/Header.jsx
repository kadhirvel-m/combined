import React, { useEffect, useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import DecryptedText from "./DecryptedText";

// Header component encapsulating progress ribbon, HUD, and hero section
export default function Header({ theme, setTheme, hero }) {
  // Scroll progress ribbon
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 20, mass: 0.2 });

  // Parallax hero layers
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 240]);

  return (
  <header className="relative overflow-hidden border-b border-white/10">
      {/* Progress ribbon */}
      <motion.div style={{ scaleX: progress }} className="origin-left fixed top-0 left-0 right-0 h-1.5 z-[100] bg-gradient-to-r from-[#9E4B8A] via-[#4C2A59] to-[#1E1E2F]" />

      {/* Dock / HUD */}
      <HUD theme={theme} setTheme={setTheme} />

      {/* Hero visuals */}
      <Starfield />
      <motion.div style={{ y: y2 }} className="absolute -left-24 top-12 h-[36rem] w-[36rem] rounded-full blur-3xl opacity-20 bg-[#4C2A59]" />
      <motion.div style={{ y: y1 }} className="absolute right-[-10rem] top-24 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-25 bg-[#9E4B8A]" />

      {/* Hero content */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-28 sm:py-36">
        <MiniBadge>
          <DecryptedText text={hero.era} animateOn="view" revealDirection="start" speed={120} maxIterations={24} />
        </MiniBadge>
        <h1 className="mt-3 text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight">
          <DecryptedText text={(hero.title || '').split(": ")[0] + ":"} animateOn="view" revealDirection="center" speed={120} maxIterations={24} />
          {" "}
          <span className="text-[#9E4B8A]">
            <DecryptedText text={(hero.title || '').split(": ")[1] || ''} animateOn="view" revealDirection="center" speed={120} maxIterations={24} />
          </span>
        </h1>
        <p className="mt-6 max-w-3xl text-white/80 text-lg">
          <DecryptedText text={hero.lead} animateOn="view" speed={120} maxIterations={24} />
        </p>
        <div className="mt-10 flex gap-3">
          {(hero.ctas || []).map((cta, i) => (
            <a key={i} href={cta.href} className={`${cta.variant === 'primary' ? 'btn-primary' : 'btn-ghost'} cursor-target`}>
              <DecryptedText text={cta.label} animateOn="view" speed={120} maxIterations={24} />
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}

function HUD({ theme, setTheme }) {
  return (
    <div className="fixed right-4 top-4 z-[110] flex items-center gap-2">
      <button
        onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        className="rounded-2xl px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/15 shadow-md"
        aria-label="Toggle theme"
        title="Toggle theme (t)"
      >
        {theme === "dark" ? "☾" : "☀"}
      </button>
      <a href="#r-1" className="rounded-2xl px-4 py-2 bg-[#9E4B8A] hover:opacity-90 border border-white/15 cursor-target">
        <DecryptedText text="Read" animateOn="hover" speed={100} maxIterations={20} />
      </a>
    </div>
  );
}

function MiniBadge({ children }) {
  return (
    <span className="inline-block rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs tracking-widest text-[#9E4B8A] uppercase">
      {children}
    </span>
  );
}

function Starfield() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w, h, raf;
    const DPR = Math.min(2, window.devicePixelRatio || 1);

    const stars = Array.from({ length: 190 }).map(() => ({
      x: Math.random(), y: Math.random(), z: 0.2 + Math.random() * 0.8, s: 0.3 + Math.random() * 0.7,
    }));

    const resize = () => {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.floor(w * DPR); canvas.height = Math.floor(h * DPR);
    };

    const draw = (t = 0) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#090914"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (const st of stars) {
        const tw = 0.6 + 0.4 * Math.sin((t / 600 + st.x * 5) * Math.PI);
        const x = st.x * canvas.width; const y = st.y * canvas.height;
        ctx.globalAlpha = 0.3 + 0.7 * tw; ctx.fillStyle = "#ffffff";
        ctx.beginPath(); ctx.arc(x, y, st.s * st.z * DPR, 0, Math.PI * 2); ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    resize(); draw(); window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 w-full h-[70vh] sm:h-[80vh]" />;
}
