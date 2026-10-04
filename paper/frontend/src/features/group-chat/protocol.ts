/**
 * Builders for every message the page sends over `/ws/group-chat/{room}`.
 * Key order matches the original page's object literals, so the serialized
 * frames are byte-identical to what the legacy page sends.
 */

import type { AnnotationStroke, ClientMessage, MarkerPoint, MarkerTool, RoomSettings } from "./types";

export const msg = {
  join: (userId: string, name: string, token: string | null): ClientMessage => ({
    type: "join",
    data: { user_id: userId, name, token: token || null },
  }),
  hostSetSettings: (patch: Partial<RoomSettings>): ClientMessage => ({ type: "host-set-settings", data: patch }),
  handRaised: (name: string): ClientMessage => ({ type: "hand-raised", data: { name } }),
  handLowered: (name: string): ClientMessage => ({ type: "hand-lowered", data: { name } }),
  hostMuteAll: (): ClientMessage => ({ type: "host-mute-all", data: {} }),
  hostAdmit: (userId: string): ClientMessage => ({ type: "host-admit", target_user_id: userId, data: {} }),
  hostKick: (userId: string, reason: "denied" | "removed"): ClientMessage => ({
    type: "host-kick",
    target_user_id: userId,
    data: { reason },
  }),
  hostMuteUser: (userId: string): ClientMessage => ({ type: "host-mute-user", target_user_id: userId, data: {} }),
  hostUnmuteUser: (userId: string): ClientMessage => ({ type: "host-unmute-user", target_user_id: userId, data: {} }),
  hostSetRole: (userId: string, role: "cohost" | "participant"): ClientMessage => ({
    type: "host-set-role",
    target_user_id: userId,
    data: { role },
  }),
  annotationDraw: (tool: MarkerTool, color: string, size: number, points: MarkerPoint[]): ClientMessage => ({
    type: "annotation-draw",
    data: { tool, color, size, points } satisfies AnnotationStroke,
  }),
  annotationClear: (): ClientMessage => ({ type: "annotation-clear", data: {} }),
  reaction: (emoji: string, name: string): ClientMessage => ({ type: "reaction", data: { emoji, name } }),
  iceCandidate: (candidate: RTCIceCandidate, peerId: string): ClientMessage => ({
    type: "ice-candidate",
    data: candidate as unknown as Record<string, unknown>,
    target_user_id: peerId,
  }),
  offer: (description: RTCSessionDescription | null, peerId: string): ClientMessage => ({
    type: "offer",
    data: description as unknown as Record<string, unknown>,
    target_user_id: peerId,
  }),
  iceRestartOffer: (description: RTCSessionDescription | null, peerId: string, reason: string): ClientMessage => ({
    type: "offer",
    data: description as unknown as Record<string, unknown>,
    target_user_id: peerId,
    data2: { iceRestart: true, reason },
  }),
  answer: (description: RTCSessionDescription | null, peerId: string): ClientMessage => ({
    type: "answer",
    data: description as unknown as Record<string, unknown>,
    target_user_id: peerId,
  }),
  screenShareStarted: (sharerName: string): ClientMessage => ({ type: "screen-share-started", data: { sharer_name: sharerName } }),
  screenShareStopped: (): ClientMessage => ({ type: "screen-share-stopped", data: {} }),
  chatMessage: (message: string): ClientMessage => ({ type: "chat-message", data: { message } }),
};
