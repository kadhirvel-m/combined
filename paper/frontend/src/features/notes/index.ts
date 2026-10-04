/** Public API of the notes workspace (see README.md). */
export { DEFAULT_NOTES_CONFIG, DEFAULT_VARIANTS, defineNotesConfig } from "./config";
export type { NotesNavLink, NotesVariantOption, NotesWorkspaceConfig, OutputDecoratorContext } from "./config";
export { NotesProvider, useNotes } from "./components/NotesProvider";
export { NotesLayout, NotesWorkspace, type NotesLayoutSlots } from "./components/NotesWorkspace";
export { NotesTopBar } from "./components/TopBar";
export { RelatedVideos, VideoCard } from "./components/RelatedVideos";
export { ImagesCard, InputCard, TocCard } from "./components/Sidebar";
export { LimitPanel, NotesOutput, OutputCard, VariantSwitcher, type OutputCardProps } from "./components/Output";
export { FeedbackModal, NotesDialog, ShareModal } from "./components/Dialogs";
export { SelectionAssistant, type OutputSelection, type SelectionFabAction } from "./components/SelectionAssistant";
export { AiAssistant } from "./components/AiAssistant";
export { SelectionImagesCard, SelectionImagesProvider, useSelectionImageFab, useSelectionImages } from "./components/SelectionImages";
export { RippleButton, Sym } from "./components/primitives";
export type { NotesController, OutputView } from "./hooks/useNotesController";
export { prepareMathMarkdown, withHardBreaks } from "./lib/markdown";
export { decorateMathsOutput, parseCitationsFromMarkdown } from "./lib/outputDom";
export { notesApi } from "./api";
