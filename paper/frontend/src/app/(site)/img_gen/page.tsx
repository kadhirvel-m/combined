import type { Metadata } from "next";
import { ImgGenPage } from "@/features/notes/presets/imgGen";

export const metadata: Metadata = {
  title: "PaperX — Notes Generator (Material Style)",
};

export default function Page() {
  return <ImgGenPage />;
}
