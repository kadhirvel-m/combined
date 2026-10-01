import { LogoTicker } from "./LogoTicker";

/** "Learning resources integration" strip under the hero. */
export function LogoSection() {
  return (
    <section className="py-12 border-y border-black/5 dark:border-white/10">
      <div className="container">
        <p className="text-xs uppercase tracking-wider text-neutral-500 dark:text-white/50 mb-6 text-center">
          Learning resources integration
        </p>
        <LogoTicker />
      </div>
    </section>
  );
}
