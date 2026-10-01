import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LEGACY_BOOT_SCRIPT } from "@/components/legacy/boot";

export const metadata: Metadata = {
  title: "Paper X",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Runs during parsing, before any page content (see boot.ts). The
            type flip avoids React's dev warning about client-rendered scripts. */}
        <script
          type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: LEGACY_BOOT_SCRIPT }}
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
