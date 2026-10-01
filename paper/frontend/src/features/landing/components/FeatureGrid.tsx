import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { FEATURES, type Feature } from "../data";
import styles from "../landing.module.css";
import { SectionHeader } from "./GradientHeading";

export function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <article className="rounded-2xl p-6 ring-1 ring-black/5 dark:ring-white/10 bg-white/70 dark:bg-white/5 hover:shadow-glow-magenta transition">
      <div className="size-10 grid place-content-center rounded-xl bg-brand-500/15 dark:bg-brand-500/25 text-brand-500 dark:text-brand-400 mb-4">
        <Icon name={feature.icon} />
      </div>
      <h3 className="font-semibold">{feature.title}</h3>
      <p className="mt-1 text-sm text-neutral-600 dark:text-white/70">{feature.description}</p>
    </article>
  );
}

/** "Exam-ready features": a swipeable row on phones, a grid from 640px up. */
export function FeatureGrid({ features = FEATURES }: { features?: Feature[] }) {
  return (
    <section id="features" className="py-20">
      <div className="container max-w-7xl">
        <SectionHeader title="Exam-ready features">Everything aligned to Indian college syllabi &amp; past papers.</SectionHeader>
        <div className={cn(styles.featureCarousel, "sm:grid-cols-2 lg:grid-cols-3")}>
          {features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
