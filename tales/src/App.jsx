import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

// Single‑file React page meant for Vite. Tailwind CSS recommended.
// Drop this as src/App.jsx in a Vite + React project and run `npm run dev`.

export default function FantasyReader() {
  const [theme, setTheme] = useState(() =>
    typeof window !== "undefined" && localStorage.getItem("theme")
      ? localStorage.getItem("theme")
      : "dark"
  );
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Scroll progress
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 20, mass: 0.2 });

  // Parallax hero layers
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 240]);

  // Ambient rune particles (lightweight DOM sprites)
  const runes = useMemo(() =>
    Array.from({ length: 28 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 8,
      scale: 0.6 + Math.random() * 1.2,
      char: ["Ϟ", "₪", "◈", "⊹", "☿", "✧", "ᚠ", "ᚨ"][i % 8],
    })),
    []);

  const chapter = {
    title: "Part I — The Orphan and the Castle",
    era: "Hogwarts Era • 1938–1945",
    paragraphs: [
      "The orphanage smelled faintly of cabbage and floor polish — the kind of scent that clung to stone, to silence, and to the children who had learned never to expect kindness.",
      "In the far corner of the grey common room sat Tom Marvolo Riddle, eleven years old, reading by the dim winter light. His posture was perfect, his expression composed, but his eyes — dark and watchful — betrayed something colder.",
      "That morning, Mrs. Cole had told him someone important was coming to visit — a gentleman from a school. When Albus Dumbledore entered, the light in the room seemed to change. His long auburn hair was streaked with early silver, and his eyes — brilliant blue behind half‑moon spectacles — scanned the boy with a patience that unsettled even Tom.",
      "‘You are a wizard, Tom,’ Dumbledore said. ‘But there are wrong ways to use it.’",
      "That night, as the train to Scotland roared northward, Tom sat alone in a compartment, the sky outside bruised with twilight. The letter from Hogwarts School of Witchcraft and Wizardry lay open on his lap.",
      "When he stepped off the train at Hogsmeade Station, the lake stretched black and endless, reflecting a castle lit with hundreds of torches. As the boats glided toward the great doors, Tom heard it for the first time — faint, sibilant, curling under the wind: Come… heir of my blood… come below…",
      "The Sorting Hat barely touched his head before shouting SLYTHERIN. Later, when the feast was over and the dormitory torches dimmed, Tom sat awake beneath the dungeon arches, tracing the patterns of the serpents carved into the stone. Somewhere deep beneath his feet, the castle seemed to breathe — slow, ancient, alive. The serpent already knew his name.",
    ],
  };

  return (
    <div className="min-h-screen font-sans antialiased bg-[#0f0f1a] text-white selection:bg-[#9E4B8A]/40">
      {/* Top ribbon progress */}
      <motion.div style={{ scaleX: progress }} className="origin-left fixed top-0 left-0 right-0 h-1.5 z-[60] bg-gradient-to-r from-[#9E4B8A] via-[#4C2A59] to-[#1E1E2F]" />

      {/* Floating action bar */}
      <div className="fixed right-4 top-4 z-[60] flex items-center gap-2">
        <button
          onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          className="rounded-2xl px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/15 shadow-md"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? "☾" : "☀"}
        </button>
        <a href="#chapter" className="rounded-2xl px-4 py-2 bg-[#9E4B8A] hover:opacity-90 border border-white/15">Start Reading</a>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(800px_400px_at_15%_10%,rgba(158,75,138,.25),transparent_60%)]" />
        <motion.div style={{ y: y2 }} className="absolute -left-24 top-12 h-[36rem] w-[36rem] rounded-full blur-3xl opacity-25 bg-[#4C2A59]" />
        <motion.div style={{ y: y1 }} className="absolute right-[-10rem] top-24 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-30 bg-[#9E4B8A]" />

        {/* Runes */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {runes.map((r) => (
            <motion.span
              key={r.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0], y: [0, -40, 0] }}
              transition={{ duration: 8, repeat: Infinity, delay: r.delay }}
              style={{ left: `${r.left}%`, top: `${(r.id % 12) * 8}%`, scale: r.scale }}
              className="absolute text-white/20 select-none"
            >
              {r.char}
            </motion.span>
          ))}
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-6 py-28 sm:py-36">
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="tracking-widest text-sm text-[#9E4B8A]">
            {chapter.era}
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="mt-3 text-4xl sm:text-6xl font-extrabold leading-tight">
            Tom Riddle: <span className="text-[#9E4B8A]">The Last Heir</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} className="mt-6 max-w-2xl text-white/80">
            A cinematic, gothic reading experience — crafted for immersion and continuity with the Wizarding World. Scroll to enter the castle beneath the castle.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }} className="mt-10 flex gap-3">
            <a href="#chapter" className="rounded-2xl px-5 py-3 bg-white text-[#1E1E2F] font-semibold">Enter Chapter</a>
            <a href="#gallery" className="rounded-2xl px-5 py-3 bg-white/10 border border-white/15 backdrop-blur">View Prompts</a>
          </motion.div>
        </div>
      </section>

      {/* Reading layout */}
      <main id="chapter" className="relative">
        {/* Side rail: chapter nav */}
        <aside className="hidden lg:block fixed left-4 top-1/2 -translate-y-1/2 z-40">
          <div className="space-y-2">
            {["I", "II", "III"].map((n, i) => (
              <a key={i} href="#chapter" className="block rounded-full border border-white/20 text-xs px-3 py-1 text-white/70 hover:text-white hover:bg-white/10">
                Part {n}
              </a>
            ))}
          </div>
        </aside>

        {/* Article */}
        <article className="mx-auto max-w-3xl px-6 py-16">
          <header className="mb-10">
            <p className="text-[#9E4B8A] tracking-wider uppercase text-xs">Chapter One</p>
            <h2 className="text-3xl sm:text-4xl font-bold mt-2">{chapter.title}</h2>
            <p className="text-white/60 mt-2">A slow-burn thriller set in Hogwarts, London, and the tunnels below.</p>
          </header>

          {/* Drop cap intro */}
          <section className="[&_p]:leading-relaxed [&_p]:mt-6 text-lg">
            <p>
              <span className="float-left mr-3 -mt-1 text-6xl leading-none font-extrabold text-[#9E4B8A]">T</span>
              {chapter.paragraphs[0]}
            </p>
            {chapter.paragraphs.slice(1).map((txt, i) => (
              <p key={i}>{txt}</p>
            ))}

            {/* Inset quote */}
            <figure className="my-10 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <blockquote className="text-white/90 italic text-xl">
                “You are a wizard, Tom… but there are wrong ways to use it.”
              </blockquote>
              <figcaption className="mt-2 text-white/60">— Albus Dumbledore, London, 1938</figcaption>
            </figure>

            {/* Scene break */}
            <SceneBreak label="Hogsmeade to Hogwarts" />

            {/* Teaser card */}
            <div className="mt-10 grid sm:grid-cols-[2fr_1fr] gap-6 items-center">
              <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#1E1E2F]/60 to-transparent p-6">
                <h3 className="font-semibold text-xl">The Whisper Under the Wind</h3>
                <p className="text-white/80 mt-2">Across the Black Lake, torchlight ripples. A voice curls in the mist: <em>Come… heir of my blood…</em></p>
                <p className="text-white/70 mt-3 text-sm">This foreshadows Part II — Tom discovers the entrance behind an unassuming sink in a quiet lavatory haunted by a girl who hates to be watched.</p>
                <a href="#gallery" className="inline-block mt-4 rounded-xl px-4 py-2 bg-[#9E4B8A] hover:opacity-90">Open Art Prompts</a>
              </div>
              <div className="aspect-video rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_20%_10%,rgba(158,75,138,.35),transparent_60%)] relative overflow-hidden">
                <div className="absolute inset-0 grid place-items-center text-white/70">16:9 teaser</div>
              </div>
            </div>
          </section>
        </article>
      </main>

      {/* Prompts / Gallery */}
      <section id="gallery" className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h3 className="text-2xl font-bold">Art Prompts — Part I</h3>
          <p className="text-white/70 mt-2">Copy and render in your favorite model. 16:9, raw style, s 150.</p>
          <div className="mt-8 grid lg:grid-cols-2 gap-6">
            {promptCards.map((c) => (
              <PromptCard key={c.key} title={c.title} content={c.content} />
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-white/60 flex flex-wrap items-center justify-between gap-4">
          <div>© Fan project • The Last Heir • Built with React + Tailwind</div>
          <div className="flex items-center gap-3">
            <a className="underline decoration-dotted" href="#chapter">Back to top</a>
            <span>•</span>
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="underline decoration-dotted">Scroll</button>
          </div>
        </div>
      </footer>

      <Style />
    </div>
  );
}

function SceneBreak({ label }) {
  return (
    <div className="my-12 relative">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="px-3 text-xs tracking-widest text-white/60 bg-[#0f0f1a]">{label}</span>
      </div>
    </div>
  );
}

function PromptCard({ title, content }) {
  const preRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 1300);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5">
      <div className="flex items-center justify-between gap-4">
        <h4 className="font-semibold">{title}</h4>
        <button onClick={copy} className="rounded-lg px-3 py-1 bg-[#9E4B8A] hover:opacity-90 text-sm">{copied ? "Copied" : "Copy"}</button>
      </div>
      <pre ref={preRef} className="mt-3 whitespace-pre-wrap text-sm text-white/90">{content}</pre>
    </div>
  );
}

const promptCards = [
  {
    key: "p1",
    title: "Scene 1 — The Orphanage",
    content: `--ar 16:9 --style raw --s 150
ultra-realistic cinematic lighting, volumetric fog through window, shallow depth of field,
gothic fantasy mood, 4K detail,
color palette: Dark Indigo #1E1E2F  Deep Purple #4C2A59  Magenta Pink #9E4B8A  White #FFFFFF

Interior of Wool’s Orphanage, London 1938 — dim grey common room with cracked plaster, flickering daylight through narrow windows, dusty floorboards.
FACE-LOCK (Tom Riddle teen): sharp narrow features, pale cool skin, straight jet-black hair neatly combed, high cheekbones, defined jawline, thin lips with faint curl, intense grey-dark eyes, composed aristocratic look — same identity each image
Props: chipped teacup, worn books, iron radiator, dull wallpaper.
NEGATIVE: cartoon, blur, modern furniture, neon, low quality, smiling boy.`,
  },
  {
    key: "p2",
    title: "Scene 2 — Dumbledore Visits",
    content: `--ar 16:9 --style raw --s 150
ultra-realistic cinematic lighting, warm indoor glow vs cold daylight contrast,
shallow depth of field, gothic fantasy tone, 4K detail,
color palette: Dark Indigo #1E1E2F  Deep Purple #4C2A59  Magenta Pink #9E4B8A  White #FFFFFF

Dumbledore (FACE-LOCK professor era): tall lean wizard, auburn hair and short beard with wave, half-moon spectacles, piercing intelligent eyes, kind yet commanding gaze — enters orphanage room, wand softly glowing.
Tom Riddle (FACE-LOCK teen) seated, wary, eyes reflecting the flame. Props: wardrobe in corner opening magically with golden light, floating flame hovering inside.`,
  },
  {
    key: "p3",
    title: "Scene 3 — Hogwarts Express",
    content: `--ar 16:9 --style raw --s 150
ultra-realistic cinematic lighting, moving reflections, steam haze, shallow depth of field,
gothic fantasy mood, 4K detail,
color palette: Dark Indigo #1E1E2F  Deep Purple #4C2A59  Magenta Pink #9E4B8A  White #FFFFFF

Inside 1930s train compartment, warm lamplight over dark red seats, rain-streaked window showing Scottish countryside.
FACE-LOCK (Tom Riddle teen) sitting alone, Hogwarts letter open on lap, eyes fixed outside with faint serpentine whisper motif curling through fog.`,
  },
  {
    key: "p4",
    title: "Scene 4 — Black Lake Arrival",
    content: `--ar 16:9 --style raw --s 150
ultra-realistic cinematic lighting, mist over lake, torch reflections in water,
volumetric fog, epic fantasy tone, 4K detail,
color palette: Dark Indigo #1E1E2F  Deep Purple #4C2A59  Magenta Pink #9E4B8A  White #FFFFFF

Nighttime, small boats carrying first-years across Black Lake under full moon.
Hogwarts castle glowing with torches in distance.
FACE-LOCK (Tom Riddle teen) in boat front, looking upward, faint whisper text in mist: “Come… heir of my blood…”`,
  },
  {
    key: "p5",
    title: "Scene 5 — Sorting Hat",
    content: `--ar 16:9 --style raw --s 150
ultra-realistic cinematic lighting, golden candlelight, misty Great Hall depth,
gothic medieval tone, 4K detail,
color palette: Dark Indigo #1E1E2F  Deep Purple #4C2A59  Magenta Pink #9E4B8A  White #FFFFFF

Tom Riddle (FACE-LOCK teen) seated on stool with Sorting Hat on head, students blurred in background, Dumbledore watching quietly.
Warm candlelight and floating candles reflected in his eyes. Text overlay suggestion: “SLYTHERIN!”`,
  },
  {
    key: "p6",
    title: "Scene 6 — Slytherin Dormitory",
    content: `--ar 16:9 --style raw --s 150
ultra-realistic cinematic lighting, cold torchlight flicker, deep shadows, wet stone reflections,
gothic fantasy tone, 4K detail,
color palette: Dark Indigo #1E1E2F  Deep Purple #4C2A59  Magenta Pink #9E4B8A  White #FFFFFF

Interior of Slytherin dormitory — greenish light through underwater windows, ornate serpent carvings on stone pillars.
FACE-LOCK (Tom Riddle teen) sitting awake in bed, tracing serpent engraving with his finger, faint spectral glow from wall.`,
  },
  {
    key: "p7",
    title: "Teaser — Opening the Chamber",
    content: `--ar 16:9 --style raw --s 150
ultra-realistic cinematic lighting, volumetric fog, shallow depth of field,
gothic fantasy mood, 4K detail,
color palette: Dark Indigo #1E1E2F  Deep Purple #4C2A59  Magenta Pink #9E4B8A  White #FFFFFF

FACE-LOCK (Tom Riddle teen): sharp narrow features, pale cool skin, straight jet-black hair neatly combed, high cheekbones, defined jawline, thin lips with faint curl, intense grey-dark eyes, composed aristocratic look — same identity each image

Young Tom Riddle opens the Chamber of Secrets beneath Hogwarts — vast stone hall with serpent statues and colossal carved face of Salazar Slytherin, water on floor reflecting torchlight and Magenta Pink runes in mist, Dark Indigo shadows, Deep Purple stone walls, White reflections on wet rock. low-angle cinematic shot — FACE-LOCK (Tom Riddle teen)

NEGATIVE: generic boy, blond hair, freckles, cartoon look, wrong age or ethnicity, smile stock photo, extra fingers, distorted face, oversaturated neon, AI artifact.`,
  },
];

function Style() {
  return (
    <style>{`
      :root { color-scheme: dark; }
      html { scroll-behavior: smooth; }
      body { background: #0f0f1a; }
      /* Optional: light theme override */
      :root:not(.dark) body { background: #f6f7fb; color: #10111a; }
      :root:not(.dark) .border-\[color\] { border-color: #10111a22 }
    `}</style>
  );
}
