import type { Metadata } from "next";
import { StudentSignupPage } from "@/features/auth/components/StudentSignupPage";

export const metadata: Metadata = {
  title: "Create Account — Pa[p]er X",
  description: "Create your Paper X account. Unified styling with the platform experience.",
};

export default function Page() {
  return <StudentSignupPage />;
}
