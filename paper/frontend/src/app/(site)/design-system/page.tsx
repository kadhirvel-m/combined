import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { AnnouncementBar } from "@/components/site/AnnouncementBar";
import { DesignSystemDemo } from "./DesignSystemDemo";

export const metadata: Metadata = {
  title: "Design system — Paper X",
  robots: { index: false },
};

/** Living reference of the shared components React pages are built from. */
export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-hero-light dark:bg-hero-dark">
      <AnnouncementBar>Your One Learning Solution</AnnouncementBar>
      <SiteHeader />
      <main className="container py-12">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Paper X <span className="gradient-hero-text">design system</span>
        </h1>
        <p className="mt-2 text-neutral-600 dark:text-white/70">Shared components in src/components (ui, site, content).</p>
        <DesignSystemDemo />
      </main>
      <SiteFooter />
    </div>
  );
}
