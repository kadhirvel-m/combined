import type { Metadata } from "next";
import { ContactPage } from "@/features/marketing/contact/ContactPage";

export const metadata: Metadata = {
  title: "Contact Us — Paper X",
};

export default function Page() {
  return <ContactPage />;
}
