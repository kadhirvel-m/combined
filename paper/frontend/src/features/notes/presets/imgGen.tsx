"use client";

import { defineNotesConfig } from "../config";
import { NotesProvider } from "../components/NotesProvider";
import { NotesLayout } from "../components/NotesWorkspace";
import { SelectionAssistant } from "../components/SelectionAssistant";
import { SelectionImagesCard, SelectionImagesProvider, useSelectionImageFab } from "../components/SelectionImages";

/**
 * `img_gen.html`: the notes workspace where selecting text generates an
 * illustration (listed in the "Images Generating" card); related videos and
 * the contents card are switched off.
 */
export const IMG_GEN_CONFIG = defineNotesConfig({
  pageFile: "img_gen.html",
  loginGate: "token",
  authToken: "storage",
  authLookups: false,
  header: { navLinks: [], share: false, density: true, verify: false },
  generateButton: "text",
  roles: { allow: "staff", cookieRetry: true, requireToken: false, teacherReview: false },
  access: false,
  dbCheckFallback: "stop",
  videos: "disabled",
  toc: false,
  autoStart: { params: ["topic"], retry: false },
  selection: { payloadMax: 800 },
  loader: "none",
  guardSvgRejections: true,
});

function ImgGenLayout() {
  const fabAction = useSelectionImageFab();
  return <NotesLayout sidebarExtra={<SelectionImagesCard />} selectionAssistant={<SelectionAssistant fabAction={fabAction} />} />;
}

export function ImgGenPage() {
  return (
    <NotesProvider config={IMG_GEN_CONFIG}>
      <SelectionImagesProvider>
        <ImgGenLayout />
      </SelectionImagesProvider>
    </NotesProvider>
  );
}
