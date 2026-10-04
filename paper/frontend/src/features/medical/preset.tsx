"use client";

import { MedicalWorkspace } from "./components/MedicalWorkspace";
import { MEDICAL_NOTES_PAGE, NOTES_CHAT_PAGE } from "./config";

/** `medical_notes.html`: the medical notes workspace with the Study Tools. */
export function MedicalNotesPage() {
  return <MedicalWorkspace page={MEDICAL_NOTES_PAGE} />;
}

/** `mediX/notes_chat.html`: the same page with RAG-grounded generation and citation chunks. */
export function NotesChatPage() {
  return <MedicalWorkspace page={NOTES_CHAT_PAGE} />;
}
