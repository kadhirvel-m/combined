/** Shapes of the group-call REST endpoints and WebSocket protocol (main.py `/ws/group-chat/{room_id}`). */

export type ParticipantRole = "host" | "cohost" | "participant";

export interface Participant {
  user_id: string;
  name: string;
  is_host?: boolean;
  role?: ParticipantRole;
  /** Server-side mute flag (`muted_user_ids`). */
  muted?: boolean;
  joined_at?: string;
}

/** Someone in the waiting room (`room.pending`). */
export interface PendingParticipant {
  user_id: string;
  name?: string;
  requested_at?: string;
}

export interface RoomSettings {
  host_management_enabled: boolean;
  chat_enabled: boolean;
  screen_share_enabled: boolean;
  reactions_enabled: boolean;
  participants_can_unmute: boolean;
  participants_can_start_video: boolean;
  lock_meeting: boolean;
  waiting_room_enabled: boolean;
  access_type: "open" | "trusted";
  allow_ask_to_join: boolean;
  host_must_join_first: boolean;
}

export type BooleanSettingKey = {
  [K in keyof RoomSettings]: RoomSettings[K] extends boolean ? K : never;
}[keyof RoomSettings];

/** `GET /api/rtc-config` and `room-info.data.rtc_config`. */
export interface RtcConfigPayload {
  iceServers?: RTCIceServer[];
  iceTransportPolicy?: RTCIceTransportPolicy;
  turnConfigured?: boolean;
  requireTurn?: boolean;
}

/** `GET /api/profile` (only the fields the page reads). */
export interface ProfileResponse {
  user_id?: string;
  name?: string | null;
}

export interface ChatMessagePayload {
  user_id: string;
  name: string;
  message: string;
  timestamp: string;
}

export interface MarkerPoint {
  x: number;
  y: number;
}

export type MarkerTool = "pen" | "eraser";

export interface AnnotationStroke {
  tool?: MarkerTool;
  color?: string;
  size?: number;
  points?: MarkerPoint[];
}

export interface RoomInfoData {
  room_id: string;
  name: string;
  your_user_id: string;
  is_host: boolean;
  can_moderate?: boolean;
  role?: ParticipantRole;
  settings?: Partial<RoomSettings>;
  pending?: PendingParticipant[];
  participants: Participant[];
  screen_share_active?: boolean;
  screen_sharer_id?: string | null;
  rtc_config?: RtcConfigPayload;
}

/** Every message the server sends (`{ type, data, from_user_id }`). */
export type ServerMessage =
  | { type: "room-info"; data: RoomInfoData }
  | { type: "room-ended"; data?: { reason?: string } }
  | { type: "user-joined"; data: Participant }
  | { type: "user-left"; data: { user_id: string; name: string } }
  | { type: "offer"; data: RTCSessionDescriptionInit; from_user_id: string; from_name?: string }
  | { type: "answer"; data: RTCSessionDescriptionInit; from_user_id: string }
  | { type: "ice-candidate"; data: RTCIceCandidateInit; from_user_id: string }
  | { type: "screen-share-started"; data: { sharer_id?: string; sharer_name?: string } }
  | { type: "screen-share-stopped"; data: { sharer_id?: string; reason?: string } }
  | { type: "chat-message"; data: ChatMessagePayload }
  | { type: "reaction"; data: { emoji: string; name?: string }; from_user_id?: string }
  | { type: "hand-raised"; data: { name?: string }; from_user_id?: string; name?: string }
  | { type: "hand-lowered"; data: { name?: string }; from_user_id?: string; name?: string }
  | { type: "settings-updated"; data?: { settings?: Partial<RoomSettings> } }
  | { type: "participants-updated"; data?: { participants?: Participant[] } }
  | { type: "host-mute"; data?: { scope?: string; by?: string } }
  | { type: "host-unmute"; data?: { scope?: string; by?: string } }
  | { type: "kicked"; data?: { by?: string; reason?: string } }
  | { type: "join-denied"; data?: { reason?: string } }
  | { type: "waiting-room"; data?: { room_id?: string; message?: string } }
  | { type: "admitted"; data?: { room_id?: string; settings?: Partial<RoomSettings>; participants?: Participant[] } }
  | { type: "join-request"; data: PendingParticipant }
  | { type: "annotation-draw"; data?: AnnotationStroke; from_user_id?: string }
  | { type: "annotation-clear"; data?: { cleared_by?: string }; from_user_id?: string }
  | { type: "error"; message?: string };

/** A message the page sends; see `protocol.ts` for the builders. */
export type ClientMessage = { type: string } & Record<string, unknown>;

export interface SendOptions {
  /** Don't toast "Not connected" / "Send failed" (the original's `{ silent: true }`). */
  silent?: boolean;
}

export type SendFn = (msg: ClientMessage, opts?: SendOptions) => boolean;

/** The original's `showToast(message, icon, duration)`. */
export type ShowToast = (message: string, icon?: string, duration?: number) => void;
