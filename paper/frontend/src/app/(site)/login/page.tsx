import type { Metadata } from "next";
import { StudentLoginPage } from "@/features/auth/components/StudentLoginPage";

export const metadata: Metadata = {
  title: "Sign In — Pa[p]er X",
  description: "Sign in to Pa[p]er X. Matches the Pa[p]er X landing experience.",
};

export default function Page() {
  return <StudentLoginPage />;
}
