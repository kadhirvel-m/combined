import type { Metadata } from "next";
import { ProfilePage } from "@/features/profile/components/ProfilePage";

export const metadata: Metadata = {
  title: "Paper X — Profile",
  description: "Your Paper X profile dashboard.",
};

export default function Page() {
  return <ProfilePage />;
}
