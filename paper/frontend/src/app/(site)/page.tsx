import type { Metadata } from "next";
import { LandingPage } from "@/features/landing/LandingPage";

export const metadata: Metadata = {
  // The typo ("Plarform") is the original page's title.
  title: "Paper X — One Learning Plarform",
  icons: { icon: { url: "/assets/img/favicon.svg", type: "image/x-icon" } },
};

export default function Page() {
  return <LandingPage />;
}
