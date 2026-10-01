"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/lib/cn";
import { notesApi } from "../api";
import { VIDEO_LANGUAGES } from "../hooks/useRelatedVideos";
import type { RelatedVideo } from "../types";
import styles from "../notes.module.css";
import { useNotes } from "./NotesProvider";
import { RippleButton, Sym } from "./primitives";

const FALLBACK_CHANNEL_LOGO = "https://www.youtube.com/s/desktop/94838207/img/favicon_144x144.png";
const FALLBACK_CHANNEL_LOGO_LOCAL = "/assets/img/favicon.svg";
const FALLBACK_VIDEO_THUMB = "/assets/img/logo-light.svg";

const logoCache = new Map<string, Promise<string> | string>();

/** `GET /api/youtube/channel-logo` once per channel. */
function channelLogo(channelPage: string): Promise<string> {
  const cached = logoCache.get(channelPage);
  if (cached !== undefined) return Promise.resolve(cached);
  const request = notesApi
    .channelLogo(channelPage)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const logo = typeof res.data?.logo === "string" ? res.data.logo.trim() : "";
      logoCache.set(channelPage, logo);
      return logo;
    })
    .catch((err) => {
      console.warn("Channel logo lookup failed:", err);
      logoCache.set(channelPage, "");
      return "";
    });
  logoCache.set(channelPage, request);
  return request;
}

function videoIdOf(video: RelatedVideo, link: string): string {
  let id = typeof video.id === "string" ? video.id.trim() : "";
  if (!id && link) {
    const m = link.match(/[?&]v=([^&#]+)/) || link.match(/youtu\.be\/([^?#]+)/) || link.match(/\/embed\/([^?#/]+)/);
    id = m && m[1] ? m[1] : "";
  }
  return id;
}

/** One video card; `fallbacks` enables the thumbnail/logo fallback chains of the newer pages. */
export function VideoCard({ video, fallbacks }: { video: RelatedVideo; fallbacks: boolean }) {
  const link = (typeof video.link === "string" && video.link.trim()) || "";
  const notesUrl = link ? `/youtube-notes.html?video=${encodeURIComponent(link)}` : "";
  const [thumbs] = useState(() => {
    const api = (typeof video.thumbnail === "string" && video.thumbnail.trim()) || "";
    if (!fallbacks) {
      const id = typeof video.id === "string" ? video.id.trim() : "";
      return [api || (id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : "") || FALLBACK_CHANNEL_LOGO];
    }
    const id = videoIdOf(video, link);
    const list = api ? [api] : [];
    if (id) {
      list.push(
        `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
        `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
        `https://i3.ytimg.com/vi/${id}/hqdefault.jpg`,
      );
    }
    list.push(FALLBACK_VIDEO_THUMB);
    return list;
  });
  const [thumbIndex, setThumbIndex] = useState(0);
  const [logo, setLogo] = useState((typeof video.channel_logo === "string" && video.channel_logo.trim()) || FALLBACK_CHANNEL_LOGO);
  const [logoFallbacks, setLogoFallbacks] = useState(0);
  const [narrow] = useState(() => typeof window !== "undefined" && !!window.matchMedia?.("(max-width: 640px)").matches);

  const channelPage = (typeof video.channel_page === "string" ? video.channel_page : "").trim();
  const logoIsDefault = Boolean(video.channel_logo_is_default) || !video.channel_logo || video.channel_logo === FALLBACK_CHANNEL_LOGO;
  useEffect(() => {
    if (!logoIsDefault || !channelPage) return;
    let live = true;
    void channelLogo(channelPage).then((found) => {
      if (live && found) setLogo(found);
    });
    return () => {
      live = false;
    };
  }, [channelPage, logoIsDefault]);

  const title = (typeof video.title === "string" ? video.title : "").trim() || "Untitled video";
  const channel = String(video.channel || "YouTube");
  const trimmed = channel.trim();
  const channelText = narrow && trimmed.length > 10 ? `${trimmed.slice(0, 10)}...` : channel;
  const open = (url: string) => (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (url) window.open(url, "_blank", "noopener");
  };
  const off = { opacity: 0.6, cursor: "not-allowed" } as const;

  return (
    <div className={styles.ytCard} data-video-card="1">
      <div className={styles.ytThumb}>
        {/* eslint-disable-next-line @next/next/no-img-element -- remote YouTube thumbnails with a fallback chain */}
        <img
          src={thumbs[Math.min(thumbIndex, thumbs.length - 1)] || FALLBACK_VIDEO_THUMB}
          alt={String(video.title || "YouTube video")}
          loading="lazy"
          decoding="async"
          referrerPolicy={fallbacks ? "no-referrer" : undefined}
          onError={fallbacks ? () => setThumbIndex((i) => (i + 1 < thumbs.length ? i + 1 : i)) : undefined}
        />
        {video.duration ? <span className={styles.ytDuration}>{video.duration}</span> : null}
        {video.recommended ? (
          <span className="absolute left-2 top-2 z-[1] inline-flex items-center gap-1 rounded-full bg-brand-600 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white">
            <span className="text-[15px] leading-none" style={{ color: "#FBBF24" }}>
              {"★"}
            </span>
            <span>Recommended</span>
          </span>
        ) : null}
        <div className={styles.ytOverlay}>
          <button type="button" className={styles.ytHoverBtn} aria-label="Play on YouTube" title="Play on YouTube" disabled={!link} style={link ? undefined : off} onClick={open(link)}>
            <Icon name="play_arrow" weight={500} className={styles.ytHoverIcon} />
          </button>
          <button type="button" className={styles.ytHoverBtn} aria-label="Open PaperX notes" title="Open PaperX notes" disabled={!notesUrl} style={notesUrl ? undefined : off} onClick={open(notesUrl)}>
            <Icon name="description" weight={500} className={styles.ytHoverIcon} />
          </button>
        </div>
      </div>
      <div className={styles.ytBody}>
        <p className={styles.ytTitle} title={title}>
          {title}
        </p>
        <div className={styles.ytMeta}>
          {/* eslint-disable-next-line @next/next/no-img-element -- remote channel avatar */}
          <img
            className={styles.ytChannelLogo}
            src={logo}
            alt={String(video.channel || "Channel")}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={
              fallbacks && logoFallbacks < 2
                ? () => {
                    setLogo(logoFallbacks === 0 ? FALLBACK_CHANNEL_LOGO_LOCAL : FALLBACK_VIDEO_THUMB);
                    setLogoFallbacks((n) => n + 1);
                  }
                : undefined
            }
          />
          <span className={styles.ytChannelName} title={channel}>
            {channelText}
          </span>
          {video.views ? <span className={styles.ytViews}>{video.views}</span> : null}
        </div>
      </div>
    </div>
  );
}

/** "Related Video" section above the workspace. */
export function RelatedVideos() {
  const notes = useNotes();
  const v = notes.videos;
  if (!v.enabled) return null;
  const outline = { borderColor: "var(--outline)" };
  const fallbacks = notes.config.videos === "fresh";
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
      <div className={cn("rounded-2xl shadow-glow", styles.glass)} style={{ ...outline, background: "color-mix(in oklab, var(--surface) 78%, transparent)" }}>
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-b flex-nowrap" style={outline}>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-semibold tracking-tight">Related Video</h2>
            <p className="hidden sm:block text-xs sm:text-sm text-[var(--muted)]">{v.summary}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <select
              className="rounded-xl border px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium bg-transparent text-current focus:outline-none focus:ring-2 focus:ring-[var(--brand-soft)] transition"
              style={outline}
              aria-label="Select video language"
              value={v.language}
              onChange={(e) => v.changeLanguage(e.target.value, notes.topic)}
            >
              {VIDEO_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
            <RippleButton
              className="inline-flex items-center gap-1.5 rounded-xl border px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium hover:bg-[var(--brand-soft)] transition shrink-0"
              style={outline}
              onClick={() => {
                const current = (notes.topic || v.topicRef.current || "").trim();
                void v.load(current || v.topicRef.current, { force: true });
              }}
            >
              <Sym name="refresh" outlined />
              Refresh
            </RippleButton>
          </div>
        </div>
        {v.showSkeleton ? (
          <div className={cn("px-6 py-5", styles.videosBody)}>
            <div className={styles.ytSkeletonGrid}>
              {[0, 1, 2].map((i) => (
                <div key={i} className={cn(styles.ytSkeletonCard, styles.skeleton)} />
              ))}
            </div>
          </div>
        ) : null}
        {v.showList ? (
          <div className={cn("px-6 py-5", styles.videosBody)}>
            <div className={styles.ytCarousel}>
              {v.videos.map((video, i) => (
                <VideoCard key={`${video.link || video.id || ""}-${i}`} video={video} fallbacks={fallbacks} />
              ))}
            </div>
          </div>
        ) : null}
        {v.showEmpty ? <div className="px-6 pb-6 text-sm text-[var(--muted)]">{v.emptyText}</div> : null}
      </div>
    </section>
  );
}
