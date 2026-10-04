import type { Metadata } from "next";
import { NotesChatPage } from "@/features/medical/preset";

export const metadata: Metadata = {
  title: "PaperX — Notes Generator (Material Style)",
};

export default function Page() {
  return <NotesChatPage />;
}
