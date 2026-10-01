import type { Metadata } from "next";
import { TeacherLoginPage } from "@/features/auth/components/TeacherLoginPage";

export const metadata: Metadata = {
  title: "Teacher Login — Paper X",
};

export default function Page() {
  return <TeacherLoginPage />;
}
