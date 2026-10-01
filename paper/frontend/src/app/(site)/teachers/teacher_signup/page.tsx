import type { Metadata } from "next";
import { TeacherSignupPage } from "@/features/auth/components/TeacherSignupPage";

export const metadata: Metadata = {
  title: "Teacher Signup — Paper X",
};

export default function Page() {
  return <TeacherSignupPage />;
}
