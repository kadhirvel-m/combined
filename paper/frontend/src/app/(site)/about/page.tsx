import type { Metadata } from "next";
import { AboutPage } from "@/features/marketing/about/AboutPage";

export const metadata: Metadata = {
  title: "About Us — Paper X",
};

export default function Page() {
  return <AboutPage />;
}
