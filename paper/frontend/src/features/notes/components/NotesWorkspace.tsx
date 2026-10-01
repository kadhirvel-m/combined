"use client";

import type { ReactNode } from "react";
import { MarkerOverlay } from "@/components/content/MarkerOverlay";
import { cn } from "@/lib/cn";
import type { NotesWorkspaceConfig } from "../config";
import styles from "../notes.module.css";
import { FeedbackModal, ShareModal } from "./Dialogs";
import { NotesProvider, useNotes } from "./NotesProvider";
import { OutputCard, type OutputCardProps } from "./Output";
import { RelatedVideos } from "./RelatedVideos";
import { SelectionAssistant } from "./SelectionAssistant";
import { ImagesCard, InputCard, TocCard } from "./Sidebar";
import { NotesTopBar } from "./TopBar";

export interface NotesLayoutSlots extends OutputCardProps {
  /** Replaces the app bar (`<NotesTopBar />`). */
  header?: ReactNode;
  /** Extra app bar controls (before the theme toggle) when the default header is used. */
  headerActions?: ReactNode;
  /** Replaces the section above the workspace (`<RelatedVideos />`). */
  beforeMain?: ReactNode;
  /** Replaces the whole left column. */
  sidebar?: ReactNode;
  /** Cards inserted after the input card in the default left column. */
  sidebarExtra?: ReactNode;
  /** Content after the output card in the right column (e.g. a FAB). */
  mainExtra?: ReactNode;
  /** Replaces the inline selection helper; pass `null` to disable it. */
  selectionAssistant?: ReactNode;
  /** Extra floating UI / modals rendered at the end of the page. */
  children?: ReactNode;
}

/** "Topics left today" toast shown after a topic quota is consumed. */
function TopicToast() {
  const { access } = useNotes();
  const value = access.topicsLeft;
  return <div className={cn(styles.topicToast, value !== null && styles.show)}>{value !== null ? `Topics left today: ${value}` : ""}</div>;
}

/** Page frame of the notes workspace; every region can be replaced or extended through slots. */
export function NotesLayout({
  header,
  headerActions,
  beforeMain,
  sidebar,
  sidebarExtra,
  mainExtra,
  selectionAssistant,
  children,
  variantSwitcher,
  toolbarExtra,
  output,
}: NotesLayoutSlots) {
  const notes = useNotes();
  return (
    <div
      className={cn(
        styles.root,
        "min-h-screen font-sans bg-[var(--surface-dim)] text-[var(--surface-contrast)] overflow-x-clip",
        notes.density === true && styles.denseOn,
        notes.density === false && styles.denseOff,
      )}
    >
      <div aria-hidden="true" className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[var(--surface-dim)]" />
      </div>
      {header ?? <NotesTopBar actions={headerActions} />}
      {beforeMain ?? <RelatedVideos />}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="space-y-4 lg:col-span-3">
          {sidebar ?? (
            <>
              <InputCard />
              {sidebarExtra}
              <ImagesCard />
              <TocCard />
            </>
          )}
        </aside>
        <section className="lg:col-span-9 space-y-4">
          <OutputCard variantSwitcher={variantSwitcher} toolbarExtra={toolbarExtra} output={output} />
          {mainExtra}
        </section>
      </main>
      {selectionAssistant === undefined ? <SelectionAssistant /> : selectionAssistant}
      {notes.config.header.share ? <ShareModal /> : null}
      <FeedbackModal />
      {notes.config.access ? <TopicToast /> : null}
      {children}
      <MarkerOverlay />
    </div>
  );
}

/** One-line workspace: `<NotesProvider>` + `<NotesLayout>`. */
export function NotesWorkspace({ config, ...slots }: NotesLayoutSlots & { config: NotesWorkspaceConfig }) {
  return (
    <NotesProvider config={config}>
      <NotesLayout {...slots} />
    </NotesProvider>
  );
}
