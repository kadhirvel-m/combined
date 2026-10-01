import { GradientHeading } from "./GradientHeading";

/**
 * Pricing teaser (`#pricing`). The original section ends after its heading;
 * there is no plan card in the page.
 */
export function PricingSection() {
  return (
    <section id="pricing" className="relative py-28 md:py-36 overflow-hidden">
      {/* Decorative ambient gradients */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-24 w-[620px] h-[620px] rounded-full bg-[radial-gradient(circle_at_center,rgba(158,75,138,0.35),transparent_70%)] blur-3xl" />
        <div className="absolute -bottom-48 -right-10 w-[520px] h-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgba(76,42,89,0.55),transparent_70%)] blur-3xl" />
      </div>

      <div className="container relative max-w-[88rem] xl:max-w-[92rem]">
        <header className="text-center mb-14 md:mb-20">
          <GradientHeading className="text-4xl md:text-4xl drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)]">
            All‑in‑One Learning Platform
          </GradientHeading>
          <p className="mt-5 text-lg md:text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
            Try Paper X free • Cancel anytime • Unlock your full potential
          </p>
        </header>
      </div>
    </section>
  );
}
