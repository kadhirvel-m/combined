"use client";

import type { OpenTool } from "../MedicalProvider";
import { CaseFlow, VivaSimulator } from "./ChatTools";
import { ClinqQuiz } from "./ClinqQuiz";
import { DecisionTree } from "./DecisionTree";
import { MatchFollowing } from "./MatchFollowing";
import { Blink, MedMap } from "./MediaTools";

/** The open study tool, rendered where the notes were. */
export function ToolPanel({ tool, onBack }: { tool: OpenTool; onBack: (quiet?: boolean) => void }) {
  switch (tool.kind) {
    case "clinq":
      return <ClinqQuiz key={tool.run} noteId={tool.noteId} topic={tool.topic} onBack={() => onBack(true)} />;
    case "matchfoll":
      return <MatchFollowing topic={tool.topic} pairs={tool.pairs} onBack={() => onBack()} />;
    case "caseflow":
      return <CaseFlow topic={tool.topic} scenario={tool.scenario} cached={tool.cached} onBack={() => onBack()} />;
    case "viva":
      return <VivaSimulator topic={tool.topic} onBack={() => onBack()} />;
    case "decision-tree":
      return <DecisionTree topic={tool.topic} map={tool.map} onBack={() => onBack()} />;
    case "medmap":
      return <MedMap topic={tool.topic} link={tool.link} onBack={() => onBack()} />;
    case "blink":
      return <Blink topic={tool.topic} url={tool.url} onBack={() => onBack(true)} />;
  }
}
