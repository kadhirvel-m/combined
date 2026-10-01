"use client";

import { defineNotesConfig } from "../config";
import { NotesWorkspace } from "../components/NotesWorkspace";

/** `physics_notes.html`: the notes generator on the physics endpoint. */
export const PHYSICS_NOTES_CONFIG = defineNotesConfig({
  pageFile: "physics_notes.html",
  streamPath: "/api/physics-notes/generate/stream",
});

export function PhysicsNotesPage() {
  return <NotesWorkspace config={PHYSICS_NOTES_CONFIG} />;
}
