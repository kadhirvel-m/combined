"use client";

import { MarkerOverlay } from "@/components/content/MarkerOverlay";
import { cn } from "@/lib/cn";
import { FeedbackModal, NotesProvider, SelectionAssistant, useNotes } from "@/features/notes";
import notesStyles from "@/features/notes/notes.module.css";
import type { MedicalPageConfig } from "../config";
import { MedicalOutputCard } from "./MedicalOutputCard";
import { MedicalProvider } from "./MedicalProvider";
import { MedicalRelatedVideos } from "./MedicalRelatedVideos";
import { MedicalTopBar } from "./MedicalTopBar";
import { RagChunkModal } from "./RagChunkModal";
import { StudyTools } from "./StudyTools";

/** Page frame: output first in the DOM (first on phones), the Study Tools column on the left from `lg`. */
function MedicalLayout() {
  const notes = useNotes();
  return (
    <div
      className={cn(
        notesStyles.root,
        "min-h-screen font-sans bg-[var(--surface-dim)] text-[var(--surface-contrast)] overflow-x-clip",
        notes.density === true && notesStyles.denseOn,
        notes.density === false && notesStyles.denseOff,
      )}
    >
      <div aria-hidden="true" className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[var(--surface-dim)]" />
      </div>
      <MedicalTopBar />
      <MedicalRelatedVideos />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-9 space-y-4 order-first lg:order-last">
          <MedicalOutputCard />
        </section>
        <aside className="space-y-4 lg:col-span-3 order-last lg:order-first">
          <StudyTools />
        </aside>
      </main>
      <SelectionAssistant />
      <FeedbackModal />
      <RagChunkModal />
      <MarkerOverlay />
    </div>
  );
}

/** One medical notes page: the notes workspace + the medical study tools. */
export function MedicalWorkspace({ page }: { page: MedicalPageConfig }) {
  return (
    <NotesProvider config={page.notes}>
      <MedicalProvider page={page}>
        <MedicalLayout />
      </MedicalProvider>
    </NotesProvider>
  );
}
