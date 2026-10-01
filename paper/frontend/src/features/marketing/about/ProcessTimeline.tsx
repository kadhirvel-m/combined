import { GradientHeading } from "../components";

const MILESTONES = [
  { date: "Dec, 2024", title: "The Spark", body: "Our idea was born — to make studying simpler with AI.. :)", side: "left" as const, offset: 40 },
  {
    date: "Jun, 2025",
    title: "Our First Prototype",
    body: "We built the very first version of PaperX with syllabus parsing and auto-notes.",
    side: "right" as const,
    offset: 120,
  },
  {
    date: "Sept, 2025",
    title: "Early Testing",
    body: "Students and faculty tried it out, giving us real feedback to improve.",
    side: "left" as const,
    offset: 120,
  },
];

/** "Working Process of Pa[p]er X": sticky intro + S-curve roadmap with milestones. */
export function ProcessTimeline() {
  return (
    <section>
      <div className="py-8 bg-white/70 dark:bg-brand-900/70 text-neutral-900 dark:text-white transition-colors">
        <div className="container mx-auto flex flex-col items-start md:flex-row my-12 md:my-24">
          <div className="flex flex-col w-full sticky md:top-36 lg:w-1/3 mt-2 md:mt-12 px-8">
            <GradientHeading as="p">Working Process of Pa[p]er X</GradientHeading>
            <p className="text-sm md:text-base text-neutral-600 dark:text-white/70 mb-4">
              Here’s your guide to how PaperX transforms your academic journey. Follow the steps below to know exactly how it
              works.
            </p>
            <a
              href="#"
              className="bg-transparent mr-auto text-brand-500 hover:text-white rounded shadow hover:shadow-glow py-2 px-4 border border-brand-500 hover:bg-brand-500 hover:border-brand-500 transition"
            >
              Explore Now
            </a>
          </div>
          <div className="ml-0 md:ml-12 lg:w-2/3 sticky">
            <div className="container mx-auto w-full h-full">
              <div className="relative overflow-visible p-10 h-full min-h-[800px]">
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} preserveAspectRatio="none" viewBox="0 0 600 800">
                  <defs>
                    <linearGradient id="roadmapGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: "#D946EF", stopOpacity: 1 }} />
                      <stop offset="50%" style={{ stopColor: "#C026D3", stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: "#A21CAF", stopOpacity: 1 }} />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <path
                    d="M 300 80 C 450 150, 450 200, 300 280 C 150 360, 150 450, 300 530 C 450 610, 380 680, 300 720"
                    stroke="url(#roadmapGradient)"
                    strokeWidth="5"
                    fill="none"
                    strokeLinecap="round"
                    filter="url(#glow)"
                  />
                  <circle cx="300" cy="80" r="12" fill="#D946EF" stroke="#1E1E2F" strokeWidth="3" />
                  <circle cx="300" cy="280" r="12" fill="#C026D3" stroke="#1E1E2F" strokeWidth="3" />
                  <circle cx="300" cy="530" r="12" fill="#D946EF" stroke="#1E1E2F" strokeWidth="3" />
                </svg>
                {MILESTONES.map((m) => (
                  <div
                    key={m.title}
                    className={`mb-16 flex justify-between ${m.side === "left" ? "flex-row-reverse" : ""} items-start w-full relative`}
                    style={{ zIndex: 1, marginTop: m.offset }}
                  >
                    <div className="order-1 w-5/12" />
                    <div className={`order-1 w-5/12 px-4 py-4 ${m.side === "left" ? "text-left" : "text-right"}`}>
                      <p className="mb-2 text-sm text-neutral-400 dark:text-neutral-400">{m.date}</p>
                      <h4 className="mb-2 font-bold text-2xl md:text-3xl text-white">{m.title}</h4>
                      <p className="text-sm md:text-base leading-relaxed text-neutral-300 dark:text-neutral-300">{m.body}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- decorative rocket (no alt in the original) */}
              <img className="mx-auto -mt-36 md:-mt-36" src="/assets/img/rocket.png" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
