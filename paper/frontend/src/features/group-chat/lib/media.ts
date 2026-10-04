/** Microphone acquisition and autoplay helpers (same fallbacks as the original page). */

export async function acquireMicrophoneStream(): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("getUserMedia not supported");
  }

  // Fast path
  try {
    return await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  } catch (err) {
    // Fall back to enumerating devices (helps when the default device is missing/broken).
    const name = (err as { name?: string } | null)?.name || "";
    if (!navigator.mediaDevices?.enumerateDevices || (name !== "NotFoundError" && name !== "OverconstrainedError" && name !== "AbortError")) {
      throw err;
    }
  }

  const devices = await navigator.mediaDevices.enumerateDevices();
  const mics = devices.filter((d) => d.kind === "audioinput");
  if (!mics.length) {
    const e = new Error("No microphone devices found");
    e.name = "NotFoundError";
    throw e;
  }

  let lastErr: unknown = null;
  for (const mic of mics) {
    try {
      return await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: mic.deviceId ? { exact: mic.deviceId } : undefined },
        video: false,
      });
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("Could not acquire microphone");
}

/**
 * Start playback; if autoplay is blocked (mobile), retry on the next click
 * anywhere. Returns a cleanup that drops a still-pending retry listener.
 */
export function ensureMediaPlays(mediaEl: HTMLMediaElement | null): () => void {
  if (!mediaEl) return () => {};
  let once: ((e: Event) => void) | null = null;
  try {
    const p = mediaEl.play?.();
    if (p && typeof p.catch === "function") {
      p.catch(() => {
        once = () => {
          if (once) document.removeEventListener("click", once, true);
          once = null;
          try {
            void mediaEl.play?.()?.catch(() => {});
          } catch {}
        };
        document.addEventListener("click", once, true);
      });
    }
  } catch {}
  return () => {
    if (once) document.removeEventListener("click", once, true);
    once = null;
  };
}

export function stopTracks(stream: MediaStream | null | undefined): void {
  stream?.getTracks().forEach((t) => t.stop());
}
