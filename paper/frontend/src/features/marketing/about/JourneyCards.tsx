import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { SectionIntro } from "../components";

interface JourneyCard {
  icon: string;
  tag: string;
  title: string;
  body: string;
  /** Vertical stagger on md+. */
  offset: string;
  tilt: string;
  shadowBase: string;
  surface: string;
  tagBg: string;
  tagText: string;
  /** Decorative bubbles/glows: [className] */
  decor: string[];
}

const CARDS: JourneyCard[] = [
  {
    icon: "lightbulb",
    tag: "2024",
    title: "Idea & Prototype",
    body: "Auto-notes from syllabus PDFs; early flashcards; small pilot with friends.",
    offset: "",
    tilt: "-rotate-6",
    shadowBase: "bg-brand-200/40 dark:bg-brand-700/30",
    surface: "from-brand-50 via-brandlt-100 to-brand-200/80 dark:from-brand-900/80 dark:to-brand-800/60",
    tagBg: "bg-brand-500/25 dark:bg-brand-400/20",
    tagText: "text-brand-800 dark:text-brand-300",
    decor: [
      "top-8 right-6 w-16 h-16 bg-brand-400/40 dark:bg-brand-500/20",
      "bottom-8 left-8 w-12 h-12 bg-brandlt-400/45 dark:bg-brand-600/20",
      "bottom-16 left-16 w-8 h-8 bg-brand-300/50 dark:bg-brand-500/15",
      "top-4 -right-8 w-20 h-20 bg-brand-300/40 dark:bg-brand-500/15 blur-2xl -z-10",
      "bottom-6 -left-8 w-24 h-24 bg-brandlt-300/35 dark:bg-brand-600/15 blur-2xl -z-10",
    ],
  },
  {
    icon: "rocket_launch",
    tag: "2025",
    title: "Paper X Beta",
    body: "Question banks, PYQ analytics, multilingual summaries, and offline sync.",
    offset: "md:mt-12",
    tilt: "rotate-6",
    shadowBase: "bg-brand-200/40 dark:bg-brand-700/30",
    surface: "from-brand-50 via-brand-100 to-brandlt-200/80 dark:from-brand-900/80 dark:to-brand-800/60",
    tagBg: "bg-brand-600/25 dark:bg-brand-500/20",
    tagText: "text-brand-900 dark:text-brand-300",
    decor: [
      "top-6 right-8 w-14 h-14 bg-brand-500/45 dark:bg-brand-500/20",
      "top-14 right-16 w-9 h-9 bg-brand-600/40 dark:bg-brand-400/15",
      "bottom-10 left-6 w-16 h-16 bg-brandlt-500/40 dark:bg-brand-600/20",
      "bottom-20 left-12 w-7 h-7 bg-brand-400/45 dark:bg-brand-500/15",
      "top-6 -right-10 w-24 h-24 bg-brand-400/45 dark:bg-brand-500/15 blur-2xl -z-10",
      "bottom-4 -left-10 w-20 h-20 bg-brandlt-400/40 dark:bg-brand-600/15 blur-2xl -z-10",
    ],
  },
  {
    icon: "groups",
    tag: "Next",
    title: "Community & Colleges",
    body: "Faculty portals, peer notes, and campus partnerships across India.",
    offset: "md:mt-24",
    tilt: "-rotate-3",
    shadowBase: "bg-brand-200/40 dark:bg-brand-500/30",
    surface: "from-brand-50 via-brandlt-100 to-brand-200/80 dark:from-brand-700/80 dark:to-brand-600/60",
    tagBg: "bg-brand-500/25 dark:bg-brand-400/20",
    tagText: "text-brand-800 dark:text-brand-300",
    decor: [
      "top-10 right-10 w-12 h-12 bg-brand-400/45 dark:bg-brand-500/20",
      "right-20 w-8 h-8 bg-brand-500/40 dark:bg-brand-400/15",
      "bottom-12 left-10 w-14 h-14 bg-brandlt-400/45 dark:bg-brand-600/20",
      "bottom-20 left-20 w-10 h-10 bg-brand-300/50 dark:bg-brand-500/15",
      "top-4 -right-8 w-20 h-20 bg-brand-400/40 dark:bg-brand-500/15 blur-2xl -z-10",
      "bottom-6 -left-8 w-24 h-24 bg-brandlt-300/35 dark:bg-brand-600/15 blur-2xl -z-10",
    ],
  },
];

/** "Our Journey": three staggered, isometric milestone cards. */
export function JourneyCards() {
  return (
    <section className="py-20 border-y border-black/5 bg-gradient-to-br from-brandlt-50/50 to-brand-50/30 dark:from-brand-900/20 dark:to-brand-900/10">
      <div className="container max-w-7xl">
        <SectionIntro className="mb-16" title="Our Journey" subtitle="Milestones that shaped Paper X." />
        <div className="relative min-h-[600px] md:min-h-[500px]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative z-10">
            {CARDS.map((c) => (
              <div key={c.title} className={cn("group relative", c.offset)}>
                <div className="relative">
                  <div className={cn("absolute inset-0 rounded-2xl transform translate-y-2 translate-x-2 blur-sm", c.shadowBase)} />
                  <div
                    className={cn(
                      "relative overflow-hidden bg-gradient-to-br rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1",
                      c.surface,
                    )}
                  >
                    <div
                      className={cn(
                        "mb-4 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg transform group-hover:rotate-0 transition-transform",
                        c.tilt,
                      )}
                    >
                      <Icon name={c.icon} className="text-white text-2xl" />
                    </div>
                    <div className={cn("inline-block mb-3 px-3 py-1 rounded-full", c.tagBg)}>
                      <span className={cn("text-xs font-bold", c.tagText)}>{c.tag}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-neutral-900 dark:text-white">{c.title}</h3>
                    <p className="text-sm text-neutral-800 dark:text-neutral-300 leading-relaxed">{c.body}</p>
                    {c.decor.map((d) => (
                      <div key={d} className={cn("absolute rounded-full", d)} />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
