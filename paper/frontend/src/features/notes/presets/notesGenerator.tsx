"use client";

import { defineNotesConfig } from "../config";
import { NotesWorkspace } from "../components/NotesWorkspace";

/** `notes_generator.html`: the reference configuration (defaults) plus the GARLIC session beacon. */
export const NOTES_GENERATOR_CONFIG = defineNotesConfig({ pageFile: "notes_generator.html", garlic: true });

export function NotesGeneratorPage() {
  return <NotesWorkspace config={NOTES_GENERATOR_CONFIG} />;
}
