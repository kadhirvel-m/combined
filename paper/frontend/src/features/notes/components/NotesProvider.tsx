"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useAnalytics } from "@/lib/analytics";
import type { NotesWorkspaceConfig } from "../config";
import { useNotesController, type NotesController } from "../hooks/useNotesController";

const NotesContext = createContext<NotesController | null>(null);

/** Owns the notes workspace state for one page; every workspace component reads it with `useNotes()`. */
export function NotesProvider({ config, children }: { config: NotesWorkspaceConfig; children: ReactNode }) {
  useAnalytics();
  const controller = useNotesController(config);
  return <NotesContext.Provider value={controller}>{children}</NotesContext.Provider>;
}

/** The workspace controller (state + actions). Must be used inside `<NotesProvider>`. */
export function useNotes(): NotesController {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error("useNotes must be used inside <NotesProvider>");
  return ctx;
}
