import type { Metadata } from "next";
import { AcademicsPage } from "@/features/academics/components/AcademicsPage";

export const metadata: Metadata = {
  title: "Academics - Paper X",
  description: "Academic dashboard: syllabus mastery, progress, schedule & insights.",
};

export default function Page() {
  return <AcademicsPage />;
}
