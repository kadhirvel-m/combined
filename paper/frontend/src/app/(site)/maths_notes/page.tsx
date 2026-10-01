import type { Metadata } from "next";
import { MathsNotesPage } from "@/features/notes/presets/mathsNotes";

export const metadata: Metadata = {
  title: "PaperX — Maths Notes Generator (Material Style)",
};

export default function Page() {
  return <MathsNotesPage />;
}
