/** Minimal Server-Sent Events reader for a streamed `fetch` response. */

export interface SseMessage {
  /** Event name (`message` when the server sent none). */
  event: string;
  data: string;
}

function parseBlock(block: string): SseMessage | null {
  let event = "message";
  const data: string[] = [];
  for (const line of block.split("\n")) {
    if (!line || line.startsWith(":")) continue;
    const colon = line.indexOf(":");
    const field = colon === -1 ? line : line.slice(0, colon);
    let value = colon === -1 ? "" : line.slice(colon + 1);
    if (value.startsWith(" ")) value = value.slice(1);
    if (field === "event") event = value;
    else if (field === "data") data.push(value);
  }
  if (!data.length && event === "message") return null;
  return { event, data: data.join("\n") };
}

/**
 * Reads `res.body` as an SSE stream and calls `onMessage` for every event.
 * Resolves when the server closes the stream; rejects on network errors and
 * aborts (`AbortError`).
 */
export async function readSse(res: Response, onMessage: (message: SseMessage) => void): Promise<void> {
  const reader = res.body?.getReader();
  if (!reader) return;
  const decoder = new TextDecoder();
  let buffer = "";
  const flush = (final: boolean) => {
    buffer = buffer.replace(/\r\n?/g, "\n");
    let index = buffer.indexOf("\n\n");
    while (index !== -1) {
      const message = parseBlock(buffer.slice(0, index));
      buffer = buffer.slice(index + 2);
      if (message) onMessage(message);
      index = buffer.indexOf("\n\n");
    }
    if (final && buffer.trim()) {
      const message = parseBlock(buffer);
      buffer = "";
      if (message) onMessage(message);
    }
  };
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    flush(false);
  }
  buffer += decoder.decode();
  flush(true);
}
