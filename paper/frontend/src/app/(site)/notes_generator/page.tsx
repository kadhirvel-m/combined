import type { Metadata } from "next";
import { NotesGeneratorPage } from "@/features/notes/presets/notesGenerator";

export const metadata: Metadata = {
  title: "PaperX — Notes Generator (Material Style)",
};

export default function Page() {
  return <NotesGeneratorPage />;
}
