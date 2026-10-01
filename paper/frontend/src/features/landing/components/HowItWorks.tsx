import { cn } from "@/lib/cn";
import { STEPS, type Step } from "../data";
import { SectionHeader } from "./GradientHeading";

export function StepCard({ step, number }: { step: Step; number: number }) {
  return (
    <li className="rounded-2xl p-6 bg-white/70 dark:bg-white/5 ring-1 ring-black/5 dark:ring-white/10">
      <div className="flex items-center gap-3">
        <span className={cn("size-8 grid place-content-center rounded-full text-white text-sm font-bold", step.badgeClassName)}>
          {number}
        </span>
        <h3 className="font-semibold">{step.title}</h3>
      </div>
      <p className="mt-2 text-sm text-neutral-600 dark:text-white/70">{step.description}</p>
    </li>
  );
}

/** "How Paper X works": the four numbered steps. */
export function HowItWorks({ steps = STEPS }: { steps?: Step[] }) {
  return (
    <section id="how-it-works" className="py-20 border-y border-black/5 dark:border-white/10">
      <div className="container max-w-6xl">
        <SectionHeader title="How Paper X works">Four simple steps from PDF to perfect prep.</SectionHeader>
        <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <StepCard key={step.title} step={step} number={i + 1} />
          ))}
        </ol>
      </div>
    </section>
  );
}
