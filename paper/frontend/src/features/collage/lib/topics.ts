import type { SyllabusTopic } from "../types";

/** Key used to match topics with blink/LabX data: trimmed, lower-cased, single spaces. */
export function normalizeTopicKey(value: string | null | undefined): string {
  return (value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

/** Display name of a topic (`topic_title` first, as the page read it). */
export function topicLabel(topic: Pick<SyllabusTopic, "topic" | "topic_title">): string {
  return topic.topic_title || topic.topic || "";
}

/** `x unit(s) defined.` */
export function unitCountLabel(count: number): string {
  return `${count} unit${count === 1 ? "" : "s"} defined.`;
}

