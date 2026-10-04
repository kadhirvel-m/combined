# `features/notes` — the AI notes workspace

One configurable workspace behind the notes-generator family:

| Route | Preset | What differs |
|---|---|---|
| `/notes_generator.html` | `presets/notesGenerator.tsx` | reference config + GARLIC session beacon |
| `/physics_notes.html` | `presets/physicsNotes.tsx` | stream endpoint `/api/physics-notes/generate/stream` |
| `/maths_notes.html` | `presets/mathsNotes.tsx` | math pipeline, `simple` variant, cached videos, html2pdf, `?solve=`, Tune AI FAB (`<AiAssistant />`) |
| `/img_gen.html` | `presets/imgGen.tsx` | selection → image (`<SelectionImagesProvider>`, `<SelectionImagesCard>`, `fabAction`), no videos/TOC |

Each `src/app/(site)/<route>/page.tsx` only sets the `<title>` and renders its preset.

## Composition

```tsx
// Simple page: config + optional slots
<NotesWorkspace config={MY_CONFIG} mainExtra={<AiAssistant />} />

// Page with its own state shared between regions
<NotesProvider config={MY_CONFIG}>
  <MyExtensionProvider>
    <NotesLayout sidebarExtra={<MyCard />} selectionAssistant={<SelectionAssistant fabAction={myAction} />} />
  </MyExtensionProvider>
</NotesProvider>
```

- `NotesProvider({ config })` owns all state (`useNotesController`) and enables analytics (`useAnalytics`).
- `useNotes()` returns the controller (state + actions) to any component inside the provider.
  Destructure refs (`const { outputRef } = useNotes()`) rather than reading `notes.outputRef` in JSX —
  the React Compiler lint treats the whole object as a ref otherwise.
- `NotesLayout` renders the page frame. Slots (all optional):

| Slot | Default | Use |
|---|---|---|
| `header` | `<NotesTopBar actions={headerActions} />` | replace the app bar |
| `headerActions` | – | extra app-bar buttons (before the theme toggle) |
| `beforeMain` | `<RelatedVideos />` | replace the section above the grid |
| `sidebar` | `<InputCard/> {sidebarExtra} <ImagesCard/> <TocCard/>` | replace the left column |
| `sidebarExtra` | – | cards after the input card |
| `variantSwitcher` | `<VariantSwitcher />` | pluggable variant switch |
| `toolbarExtra` | – | extra output-toolbar tools |
| `output` | `<NotesOutput />` | overridable output renderer (keep `ref={outputRef}` and `id="output"` on its root) |
| `mainExtra` | – | content under the output card (e.g. `<AiAssistant />`) |
| `selectionAssistant` | `<SelectionAssistant />` | inline helper; `null` disables it |
| `children` | – | extra modals / floating UI |

Exported building blocks: `NotesTopBar`, `RelatedVideos`, `VideoCard`, `InputCard`, `ImagesCard`, `TocCard`,
`OutputCard`, `VariantSwitcher`, `NotesOutput`, `LimitPanel`, `SelectionAssistant` (`fabAction` prop),
`ShareModal`, `FeedbackModal`, `NotesDialog`, `AiAssistant`, `SelectionImagesProvider`/`SelectionImagesCard`/
`useSelectionImageFab`, `RippleButton`, `Sym`.

## Config (`config.ts`)

`defineNotesConfig(overrides)` merges overrides (nested objects included) into `DEFAULT_NOTES_CONFIG`
(the `notes_generator.html` behaviour). Fields:

- `pageFile`, `streamPath`, `variants` (`{ key, label }[]`, first is default)
- `loginGate` (`session` | `token`), `authToken` (`full` | `storage`), `authLookups` (Bearer on lookups)
- `header` `{ navLinks, share, density, verify }`, `generateButton` (`icon` | `text`)
- `roles` `{ allow: "staff" | "adminEmployee", cookieRetry, requireToken, teacherReview }`, `editDesktopOnly`
- `access` (plan limits: access checks, topics-left toast, limit panel), `dbCheckFallback` (`generate` | `stop`)
- `videos` (`fresh` | `cached` | `disabled`), `toc`
- `download` (`server` | `html2pdf`), `fullscreen` `{ native, controls: "theme" | "home" }`
- `autoStart` `{ params, retry }`, `solve` `{ param, path } | null`, `selection.payloadMax`
- `loader` (`lottie` | `none`), `storedTopicFallback`, `garlic`, `guardSvgRejections`
- `prepareMarkdown(md)` — rewrite markdown before rendering (maths: `prepareMathMarkdown`)
- `decorateOutput(root, { pageFile })` — DOM post-processing of the rendered notes (maths: `decorateMathsOutput`)

## Controller highlights (`useNotes()`)

State: `topic`, `busy`, `variant`, `markdown`/`markdownRef`, `displayMarkdown`, `view` (`markdown` | `cleared` |
`limit`), `toc`, `title`/`titleRef`, `progress`/`activeStage`, `images`, `meta`, `editing`/`editorValue`,
`emphasis`, `fullscreen`, `density`, `mcq`, `verifiedBy`, `myNoteVisible`, `roles`, `access`, `degree`, `videos`,
`topicSignal` (bumped with the topic when a generation starts, a saved note loads or a generation finishes —
extensions subscribe to it, e.g. selection images).

Actions: `startGeneration(topic, force)`, `generate`, `regenerate`, `cancel`, `selectVariant`, `renderMarkdown`,
`toggleEdit`, `save`, `loadMyNote`, `persistMyNote`, `checkMyNoteVisibility`, `download`, `toggleEmphasis`,
`setFullscreen`, `toggleDensity`, `openMcq`, `approve`, `setShareOpen`, `setFeedbackOpen`, `snack`,
`setGarlicSession`.

## Endpoints (`api.ts`)

`GET …/generate/stream` (SSE via `apiRaw` + `lib/sse.ts`), `/notes/{id}` (GET/PUT), `POST /notes`, `/notes/{id}/pdf`,
`POST /pdf`, `/api/notes/resolve`, `/api/notes/edited[/check]`, `/api/notes/verify`, `/api/notes/snippet-assist`,
`/api/notes/transform`, `/api/notes/feedback`, `/api/notes/degrees`, `/api/notes/allowed-domains`, `/api/me`,
`/api/public/academic-meta`, `/api/admin/roles/me`, `/api/access/check-and-consume`, `/api/access/summary`,
`/api/syllabus/topics/by-title`, `/api/youtube/search`, `/api/youtube/channel-logo`, `/api/transcripts/meta`,
YouTube oEmbed, `/api/maths-notes/solve`, `/api/blink/generate-selected`, `/api/blink/selected-images`,
`/api/garlic/v3/session/auto-close` (sendBeacon).

Storage keys: see `lib/storage.ts` (`paperx:degree`, `paperx:lastVariant`, `paperx:lastNoteId[:variant]`,
`paperx:emphasis`, `paperx:consumedTopicOpen:v3:<day>`, `paperx:lastVideos`/`lastTopic`/`lastVideoLanguage`,
session `paperx:lastMCQSeed`).

## Styling notes

`notes.module.css` holds the pages' `<style>` blocks scoped to the workspace root (CSS variables switch with
`:global(.dark)`). The originals used the prebuilt Tailwind CSS, so classes it lacked are deliberately not used
(`animate-in`, `bg-black/85`, `bg-white/96`, `p-2.5`…), and every Material icon renders at 24px/weight 400
(Google's icon CSS overrode the `text-*` sizes in the originals) — use `<Sym>`.
