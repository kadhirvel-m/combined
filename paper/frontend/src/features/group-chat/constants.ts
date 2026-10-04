import type { BooleanSettingKey, RoomSettings } from "./types";

/** The original page's URL; relative URLs it used (reaction SVGs, sibling pages) resolve against it. */
export const LEGACY_PAGE_PATH = "/groupChat/group_chat.html";

export const HREF = {
  createMeet: "/groupChat/create_meet.html",
  history: "/groupChat/group_history.html",
  home: "/index.html",
  whiteboard: (roomId: string | null) => `/groupChat/whiteboard.html?room=${roomId}`,
};

/** `roomSettings` before the server's `room-info` arrives (= main.py DEFAULT_GROUP_CHAT_SETTINGS). */
export const DEFAULT_SETTINGS: RoomSettings = {
  host_management_enabled: true,
  chat_enabled: true,
  screen_share_enabled: true,
  reactions_enabled: true,
  participants_can_unmute: true,
  participants_can_start_video: true,
  lock_meeting: false,
  waiting_room_enabled: false,
  access_type: "open",
  allow_ask_to_join: true,
  host_must_join_first: false,
};

export const DEFAULT_RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun.cloudflare.com:3478" },
  ],
  iceCandidatePoolSize: 10,
  iceTransportPolicy: "all",
};

export const AVATAR_COLORS = ["#9E4B8A", "#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4"];

/**
 * Reaction SVGs. The value is what goes over the socket as `emoji` (other
 * clients resolve it relative to the original page), so it stays the
 * original relative path.
 */
export const REACTIONS = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => `../assets/reactions-svg/${n}.svg`);

/** Resolve a reaction path received from any client the way the original page did. */
export function reactionSrc(path: string): string {
  try {
    return new URL(path, window.location.origin + LEGACY_PAGE_PATH).href;
  } catch {
    return path;
  }
}

/** Host-controls toggles, in the original `toggleMap` order. */
export const SETTING_TOGGLES: { key: BooleanSettingKey; title: string; description?: string }[] = [
  { key: "chat_enabled", title: "Let participants send messages", description: "When on, everyone in the call can send messages" },
  { key: "host_must_join_first", title: "Host must join before anyone else", description: "Participants wait until host joins" },
  { key: "lock_meeting", title: "Lock meeting", description: "When on, no new participants can join" },
  {
    key: "waiting_room_enabled",
    title: "Waiting room",
    description: "When on, participants must be admitted by a host/co-host",
  },
  { key: "host_management_enabled", title: "Host management", description: "Lets you restrict what contributors can enable" },
  { key: "screen_share_enabled", title: "Share their screen" },
  { key: "reactions_enabled", title: "Send reactions" },
  {
    key: "participants_can_unmute",
    title: "Allow participants to unmute",
    description: "When off, participants can’t unmute themselves",
  },
  {
    key: "participants_can_start_video",
    title: "Allow participants to start camera",
    description: "When off, participants can’t start their camera",
  },
];
