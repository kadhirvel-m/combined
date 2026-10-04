import { apiRaw } from "@/lib/api";
import type { CompilerResult, RelatedVideo, TopicFull } from "./types";

/**
 * Endpoints used by the topic page.
 *
 * The original called the topic/compiler endpoints on its hard-coded
 * `const API_BASE = 'http://0.0.0.0:10000'` and the YouTube ones on
 * `window.API_BASE`; both now go through the shared API base.
 */

async function readJson<T>(res: Response): Promise<T> {
  return (await res.json()) as T;
}

function detailOf(body: unknown): string | undefined {
  if (body && typeof body === "object" && "detail" in body) {
    const detail = (body as { detail?: unknown }).detail;
    return typeof detail === "string" && detail ? detail : undefined;
  }
  return undefined;
}

export const tunexApi = {
  /** `GET /api/tunex/topics/{id}/full`; throws `Error(detail || "Topic not found")`. */
  async topicFull(id: string): Promise<TopicFull> {
    const res = await apiRaw(`/api/tunex/topics/${encodeURIComponent(id)}/full`);
    if (!res.ok) {
      const err = await readJson<unknown>(res);
      throw new Error(detailOf(err) || "Topic not found");
    }
    return readJson<TopicFull>(res);
  },

  /** `POST /api/tunex/topics/{id}/ai/ensure?force=true`; throws `Error(detail || "Regeneration failed (status)")`. */
  async regenerate(id: string): Promise<void> {
    const res = await apiRaw(`/api/tunex/topics/${encodeURIComponent(id)}/ai/ensure`, {
      method: "POST",
      query: { force: "true" },
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      let msg = `Regeneration failed (${res.status})`;
      try {
        msg = detailOf(await readJson<unknown>(res)) || msg;
      } catch {}
      throw new Error(msg);
    }
  },

  /** `POST /api/tunex/compiler/run` `{ code }`. Throws on network or JSON errors. */
  async runPython(code: string): Promise<CompilerResult> {
    const res = await apiRaw("/api/tunex/compiler/run", { method: "POST", json: { code } });
    return readJson<CompilerResult>(res);
  },

  /** `GET /api/youtube/search?query=…&num=8`. */
  async youtubeSearch(query: string, signal?: AbortSignal): Promise<RelatedVideo[] | unknown> {
    const res = await apiRaw("/api/youtube/search", { query: { query, num: 8 }, signal });
    if (!res.ok) throw new Error(`Search failed with status ${res.status}`);
    return readJson<unknown>(res);
  },

  /** `GET /api/youtube/channel-logo?channel_url=…` → logo URL ("" when unknown). */
  async channelLogo(channelUrl: string): Promise<string> {
    const res = await apiRaw("/api/youtube/channel-logo", { query: { channel_url: channelUrl } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await readJson<{ logo?: unknown }>(res);
    return typeof data?.logo === "string" ? data.logo.trim() : "";
  },
};
