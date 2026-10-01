import { AnnouncementBar } from "@/components/site/AnnouncementBar";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { FOOTER_PRODUCT_LINKS } from "./data";
import { FeatureGrid } from "./components/FeatureGrid";
import { HallOfFlame } from "./components/HallOfFlame";
import { Hero } from "./components/Hero";
import { HowItWorks } from "./components/HowItWorks";
import { JoinRevolution } from "./components/JoinRevolution";
import { LogoSection } from "./components/LogoSection";
import { PricingSection } from "./components/PricingSection";
import { SmoothScroll } from "./components/SmoothScroll";

/** The Paper X landing page (`/`, `/index.html`). */
export function LandingPage() {
  return (
    <div className="min-h-screen bg-hero-light-soft dark:bg-hero-dark dark:bg-no-repeat dark:bg-cover transition-colors">
      <SmoothScroll />
      <AnnouncementBar>Your One Learning Solution</AnnouncementBar>
      <SiteHeader />
      <main>
        <Hero />
        <LogoSection />
        <HallOfFlame />
        <JoinRevolution />
        <FeatureGrid />
        <HowItWorks />
        <PricingSection />
      </main>
      <SiteFooter productLinks={FOOTER_PRODUCT_LINKS} />
    </div>
  );
}
