"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Lottie } from "@/components/content/Lottie";
import { Markdown } from "@/components/content/Markdown";
import { cn } from "@/lib/cn";
import { RippleButton, Sym, useNotes, VariantSwitcher } from "@/features/notes";
import notesStyles from "@/features/notes/notes.module.css";
import { parseRagCitationItem } from "../lib/rag";
import styles from "../medical.module.css";
import { useMedical } from "./MedicalProvider";
import { ToolPanel } from "./tools/ToolPanel";

const outline = { borderColor: "var(--outline)" };
const PROSE = "prose prose-slate dark:prose-invert max-w-none";
const LOADER_SRC = "https://lottie.host/848055f4-11c7-4032-80e0-d51319c33bca/lF6845uqpU.lottie";
const TOOL = "px-3 py-2 rounded-lg border text-sm hover:bg-[var(--brand-soft)]";

/** notes_chat: `[LABEL] source` items of the "RAG CITATIONS" section become buttons opening the cited chunk. */
function applyRagCitationButtons(root: HTMLElement, hasLabel: (label: string) => boolean, open: (label: string) => void, className: string) {
  const heading = Array.from(root.querySelectorAll("h2")).find((h) => (h.textContent || "").trim().toUpperCase() === "RAG CITATIONS");
  if (!heading) return;
  let cur = heading.nextElementSibling;
  while (cur && !/^(H1|H2)$/i.test(cur.tagName)) {
    if (cur.tagName === "UL" || cur.tagName === "OL") {
      cur.querySelectorAll("li").forEach((li) => {
        const item = parseRagCitationItem(li.textContent || "");
        if (!item || !hasLabel(item.label)) return;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = className;
        btn.textContent = item.label;
        btn.title = "Open source chunk";
        btn.addEventListener("click", () => open(item.label));
        li.replaceChildren(btn, document.createTextNode(` ${item.rest}`));
      });
    }
    cur = cur.nextElementSibling;
  }
}

/** `#output`: the rendered notes, or the open study tool in their place. */
function MedicalOutput() {
  const { outputRef, editing, displayMarkdown, onOutputRendered } = useNotes();
  const medical = useMedical();
  const { page, onNotesRendered, openRagChunk, closeTool, tool } = medical;
  const lookupRef = useRef(medical.ragLookup);
  useEffect(() => {
    lookupRef.current = medical.ragLookup;
  }, [medical.ragLookup]);

  const onRendered = useCallback(
    (root: HTMLDivElement) => {
      // notes_chat disabled Mermaid: its diagrams stay code blocks.
      if (!page.mermaid) root.querySelectorAll("code.language-mermaid").forEach((code) => code.classList.remove("language-mermaid"));
      onOutputRendered(root);
      if (page.rag) applyRagCitationButtons(root, (label) => !!lookupRef.current[label], openRagChunk, styles.ragCiteBtn);
      onNotesRendered(root);
    },
    [page.mermaid, page.rag, onOutputRendered, openRagChunk, onNotesRendered],
  );

  return (
    <article id="output" ref={outputRef} className={cn(notesStyles.output, editing && "hidden")}>
      {tool ? (
        <div className={PROSE}>
          <ToolPanel tool={tool} onBack={closeTool} />
        </div>
      ) : null}
      <Markdown content={displayMarkdown} prose={false} className={cn(PROSE, tool && "hidden")} onRendered={onRendered} />
    </article>
  );
}

/** "Final Output" card of the medical pages (no Emphasis button; Edit/Download for admins and employees). */
export function MedicalOutputCard() {
  const { wrapRef, editorRef, ...notes } = useNotes();
  const medical = useMedical();
  const loading = notes.loading || medical.generating;
  // Like the original <dotlottie-wc>, the loader stays mounted (hidden) after its first use.
  const [loaderUsed, setLoaderUsed] = useState(false);
  if (loading && !loaderUsed) setLoaderUsed(true);
  return (
    <div className={cn("rounded-2xl shadow-glow", notesStyles.glass)} style={outline}>
      <div className="px-4 sm:px-5 py-3 border-b flex items-center gap-2" style={outline}>
        <h3 className="text-sm font-semibold mr-auto">Final Output</h3>
        <VariantSwitcher />
        {notes.editing ? (
          <RippleButton className="px-3 py-2 rounded-lg bg-emerald-500/90 hover:bg-emerald-600 text-white text-sm" onClick={() => void notes.save()}>
            Save
          </RippleButton>
        ) : null}
        {notes.myNoteVisible ? (
          <RippleButton
            className={TOOL}
            style={outline}
            onClick={(e) => {
              e.preventDefault();
              void notes.loadMyNote();
            }}
          >
            My note
          </RippleButton>
        ) : null}
        {notes.roles.edit ? (
          <RippleButton className={cn("hidden sm:inline-flex", TOOL)} style={outline} onClick={notes.toggleEdit}>
            {notes.editing ? "Preview" : "Edit"}
          </RippleButton>
        ) : null}
        {notes.roles.privileged ? (
          <RippleButton className={cn("hidden sm:inline-flex", TOOL)} style={outline} onClick={() => void notes.download()}>
            Download
          </RippleButton>
        ) : null}
        <RippleButton className={cn("hidden sm:inline-flex", TOOL, styles.hideOnPhone)} style={outline} onClick={() => notes.setFullscreen(!notes.fullscreen)}>
          {notes.fullscreen ? "Exit" : "Fullscreen"}
        </RippleButton>
      </div>

      <div
        ref={wrapRef}
        id="outputWrap"
        className={cn(
          notesStyles.wrap,
          "relative p-4 sm:p-6 overflow-x-auto",
          notesStyles.thinScroll,
          loading && notesStyles.loading,
          notes.emphasis && notesStyles.emph,
          notes.fullscreen && "fixed inset-0 z-50 bg-[var(--surface)] overflow-auto px-8 pt-16 pb-8",
        )}
      >
        {loaderUsed ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none" style={loading ? undefined : { display: "none" }}>
            <div className={notesStyles.loaderBox}>
              <Lottie src={LOADER_SRC} className="w-full h-full" />
            </div>
          </div>
        ) : null}
        <MedicalOutput />
        {notes.editing ? (
          <textarea
            ref={editorRef}
            className="w-full h-[60vh] mt-2 p-3 rounded-lg border font-mono text-[13px] font-semibold"
            style={{ ...outline, background: "var(--surface)", color: "var(--surface-contrast)" }}
            spellCheck={false}
            value={notes.editorValue}
            onChange={(e) => notes.setEditorValue(e.target.value)}
          />
        ) : null}
        {notes.fullscreen ? (
          <div className={cn("fixed top-4 right-4 z-[60] flex items-center gap-2", styles.hideOnPhone)}>
            <RippleButton
              className="inline-flex items-center gap-2 px-3 py-2 rounded-full border text-sm bg-[var(--surface)] hover:bg-brandlt-100 dark:hover:bg-white/10 transition shadow-lg"
              style={outline}
              title="Toggle theme"
              onClick={notes.toggleTheme}
            >
              <Sym name="dark_mode" />
              <span className="hidden sm:inline">Theme</span>
            </RippleButton>
            <RippleButton className="px-3 py-2 rounded-lg border text-sm bg-[var(--surface)] hover:bg-[var(--brand-soft)] shadow-lg" style={outline} onClick={() => notes.setFullscreen(false)}>
              Exit Fullscreen
            </RippleButton>
          </div>
        ) : null}
      </div>
    </div>
  );
}
