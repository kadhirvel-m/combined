import type { Metadata } from "next";
import { PhysicsNotesPage } from "@/features/notes/presets/physicsNotes";

export const metadata: Metadata = {
  title: "PaperX — Notes Generator (Material Style)",
};

export default function Page() {
  return <PhysicsNotesPage />;
}
