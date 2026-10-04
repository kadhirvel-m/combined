"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { cn } from "@/lib/cn";
import { notesApi } from "@/features/notes/api";
import { VIDEO_LANGUAGES } from "@/features/notes/hooks/useRelatedVideos";
import type { RelatedVideo } from "@/features/notes/types";
import notesStyles from "@/features/notes/notes.module.css";
import { Sym, useNotes } from "@/features/notes";
import styles from "../medical.module.css";

const FALLBACK_CHANNEL_LOGO = "https://www.youtube.com/s/desktop/94838207/img/favicon_144x144.png";
const outline = { borderColor: "var(--outline)" };

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

/** One related video (the medical pages' card: no thumbnail/logo fallback chains, 85vw on phones). */
function MedicalVideoCard({ video }: { video: RelatedVideo }) {
  const link = (typeof video.link === "string" && video.link.trim()) || "";
  const notesUrl = link ? `/youtube-notes.html?video=${encodeURIComponent(link)}` : "";
  const id = typeof video.id === "string" ? video.id.trim() : "";
  const thumb = (typeof video.thumbnail === "string" && video.thumbnail.trim()) || (id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : "") || FALLBACK_CHANNEL_LOGO;
  const [logo, setLogo] = useState((typeof video.channel_logo === "string" && video.channel_logo.trim()) || FALLBACK_CHANNEL_LOGO);
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
  const channelText = narrow ? (trimmed.length > 10 ? `${trimmed.slice(0, 10)}...` : trimmed) : channel;
  const open = (url: string) => (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (url) window.open(url, "_blank", "noopener");
  };
  const off = { opacity: 0.6, cursor: "not-allowed" } as const;
  return (
    <div className={cn(styles.ytCard, video.recommended && "shadow-[0_0_0_1px_rgba(158,75,138,0.4)] shadow-neon")} data-video-card="1">
      <div className={styles.ytThumb}>
        {/* eslint-disable-next-line @next/next/no-img-element -- remote YouTube thumbnail */}
        <img src={thumb} alt={String(video.title || "YouTube video")} loading="lazy" decoding="async" />
        {video.duration ? <span className={styles.ytDuration}>{video.duration}</span> : null}
        {video.recommended ? (
          <span className="absolute left-2 top-2 z-[1] inline-flex items-center gap-1 rounded-full bg-brand-600 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white shadow-[0_10px_26px_rgba(15,23,42,0.45)]">
            <span className="text-[15px] leading-none" style={{ color: "#FBBF24" }}>
              {"★"}
            </span>
            <span>Recommended</span>
          </span>
        ) : null}
        <div className={styles.ytOverlay}>
          <button type="button" className={styles.ytHoverBtn} aria-label="Play on YouTube" title="Play on YouTube" disabled={!link} style={link ? undefined : off} onClick={open(link)}>
            <span className={cn("px-icon", styles.ytHoverIcon)} aria-hidden="true">
              play_arrow
            </span>
          </button>
          <button type="button" className={styles.ytHoverBtn} aria-label="Open PaperX notes" title="Open PaperX notes" disabled={!notesUrl} style={notesUrl ? undefined : off} onClick={open(notesUrl)}>
            <span className={cn("px-icon", styles.ytHoverIcon)} aria-hidden="true">
              description
            </span>
          </button>
        </div>
      </div>
      <div className={styles.ytBody}>
        <p className={styles.ytTitle} title={title}>
          {title}
        </p>
        <div className={styles.ytMeta}>
          {/* eslint-disable-next-line @next/next/no-img-element -- remote channel avatar */}
          <img className={styles.ytChannelLogo} src={logo} alt={String(video.channel || "Channel")} loading="lazy" referrerPolicy="no-referrer" />
          <span className={styles.ytChannelName} title={channel}>
            {channelText}
          </span>
          {video.views ? <span className={styles.ytViews}>{video.views}</span> : null}
        </div>
      </div>
    </div>
  );
}

/** Collapsible "Related Video" section (closed by default; the language select only shows while open). */
export function MedicalRelatedVideos() {
  const notes = useNotes();
  const v = notes.videos;
  const [open, setOpen] = useState(false);
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
      <details
        className={cn("group rounded-2xl border shadow-glow", notesStyles.glass)}
        style={{ ...outline, background: "color-mix(in oklab, var(--surface) 78%, transparent)" }}
        onToggle={(e) => setOpen(e.currentTarget.open)}
      >
        <summary className="flex items-center justify-between gap-3 px-6 py-4 border-b flex-nowrap cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition" style={outline}>
          <div className="min-w-0 flex items-center gap-2">
            <Sym name="chevron_right" className="text-[var(--muted)] transition-transform" />
            <div>
              <h2 className="text-base sm:text-lg font-semibold tracking-tight">Related Video</h2>
              {/* The summary line was `hidden group-open:block`, a variant the stylesheet lacked: it never showed. */}
              <p className="hidden text-xs sm:text-sm text-[var(--muted)]">{v.summary}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 transition-opacity duration-300" style={{ display: open ? "flex" : "none" }} onClick={(e) => e.stopPropagation()}>
            <select
              className="rounded-xl border px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium bg-transparent text-current focus:outline-none focus:ring-2 focus:ring-[var(--brand-soft)] transition"
              style={outline}
              aria-label="Select video language"
              value={v.language}
              onChange={(e) => v.changeLanguage(e.target.value, "")}
            >
              {VIDEO_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
        </summary>
        {v.showSkeleton ? (
          <div className={cn("px-6 py-5", styles.videosBody)}>
            <div className={styles.ytSkeletonGrid}>
              {[0, 1, 2].map((i) => (
                <div key={i} className={cn(styles.ytSkeletonCard, notesStyles.skeleton)} />
              ))}
            </div>
          </div>
        ) : null}
        {v.showList ? (
          <div className={cn("px-6 py-5", styles.videosBody)}>
            <div className={styles.ytCarousel}>
              {v.videos.map((video, i) => (
                <MedicalVideoCard key={`${video.link || video.id || ""}-${i}`} video={video} />
              ))}
            </div>
          </div>
        ) : null}
        {v.showEmpty ? <div className="px-6 pb-6 text-sm text-[var(--muted)]">{v.emptyText}</div> : null}
      </details>
    </section>
  );
}
