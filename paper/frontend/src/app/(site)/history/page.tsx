import type { Metadata } from "next";
import { HistoryPage } from "@/features/account/HistoryPage";

export const metadata: Metadata = {
  title: "View History - Paper X",
  description: "Your recently viewed topics",
};

export default function Page() {
  return <HistoryPage />;
}
