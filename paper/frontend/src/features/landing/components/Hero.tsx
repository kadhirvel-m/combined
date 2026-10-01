import { GradientHeading } from "./GradientHeading";
import { HeroCta } from "./HeroCta";
import { StorybookCarousel } from "./StorybookCarousel";

/** Top of the page: headline, session-aware CTAs and the storybook slides. */
export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* decorative orbs */}
      <div className="pointer-events-none absolute -top-24 -right-24 size-[420px] rounded-full bg-brand-500/20 blur-3xl dark:blur-[90px]" />
      <div className="pointer-events-none absolute top-24 -left-24 size-[360px] rounded-full bg-brand-700/20 blur-3xl dark:blur-[90px]" />

      <div className="container max-w-6xl text-center py-16 md:py-24">
        <GradientHeading as="h1" className="text-4xl md:text-6xl mx-auto max-w-5xl leading-[1.08]">
          One platform to simplify your academic journey.
        </GradientHeading>
        <p className="mt-5 text-lg md:text-xl text-neutral-600 dark:text-white/75 max-w-3xl mx-auto">
          Learn, revise, and master concepts with an elegant experience.
        </p>

        <HeroCta />

        <div className="mt-14 md:mt-20">
          <div className="mx-auto max-w-5xl rounded-3xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-brand-900/40 backdrop-blur overflow-hidden shadow-soft-lg dark:shadow-glow-magenta">
            <StorybookCarousel />
          </div>
        </div>
      </div>
    </section>
  );
}
