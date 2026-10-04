import { useCallback, useEffect, useRef, useState } from "react";
import { hardNavigate } from "@/lib/routes";
import { fetchProfile, fetchRtcConfig, groupChatSocketUrl, isRoomGone, readStoredToken } from "../api";
import { AVATAR_COLORS, DEFAULT_SETTINGS, HREF } from "../constants";
import { acquireMicrophoneStream, stopTracks } from "../lib/media";
import { msg } from "../protocol";
import type {
  BooleanSettingKey,
  Participant,
  ParticipantRole,
  PendingParticipant,
  RoomSettings,
  ServerMessage,
} from "../types";
import { useGroupChatSocket } from "./useGroupChatSocket";
import { useMarker } from "./useMarker";
import { useMeetingToast } from "./useMeetingToast";
import { usePeerMesh } from "./usePeerMesh";
import { useStateRef } from "./useStateRef";

/** One avatar in the top-left bar (`#participantAvatars`). */
export interface AvatarChip {
  key: string;
  letter: string;
  color: string;
  title: string;
  /** Avatars appended by `user-joined` carry an id and are removed on `user-left`; the initial ones never are. */
  joinedUserId?: string;
}

export interface ChatEntry {
  id: number;
  mine: boolean;
  name: string;
  time: string;
  text: string;
}

export interface FloatingReaction {
  id: number;
  src: string;
  name: string;
  left: string;
}

/** The empty-stage message (`#noScreenShare`), rewritten by share events like the original's innerHTML. */
export interface StageNotice {
  title: string;
  /** `Click "Share Screen" to present` line. */
  hint: boolean;
  /** The rewritten variants put `mt-4` on the title. */
  spaced: boolean;
  pulse: boolean;
}

export interface JoinRequests {
  visible: boolean;
  rows: PendingParticipant[];
}

export type Popup = "reactions" | "host" | null;
export type ParticipantAction = "mute" | "kick" | "role";

const IDLE_NOTICE: StageNotice = { title: "No screen being shared", hint: true, spaced: false, pulse: false };

function initial(name: string | undefined): string {
  return String(name ?? "").charAt(0).toUpperCase();
}

function copyPageUrl() {
  void navigator.clipboard?.writeText(window.location.href).catch(() => {});
}

/** State and behaviour of the meeting room (the original page script). */
export function useMeeting() {
  const [toast, showToast] = useMeetingToast();

  // --- identity / room ----------------------------------------------------
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const roomIdRef = useRef<string | null>(null);
  const userIdRef = useRef<string | null>(null);
  const userNameRef = useRef("Anonymous");
  const tokenRef = useRef<string | null>(null);
  const isHostRef = useRef(false);
  const myRoleRef = useRef<ParticipantRole>("participant");
  const [canModerate, setCanModerate, canModerateRef] = useStateRef(false);

  // --- settings -----------------------------------------------------------
  const roomSettingsRef = useRef<RoomSettings>({ ...DEFAULT_SETTINGS });
  /** What the host-controls toggles/radios show (they flip locally before the server confirms). */
  const [uiSettings, setUiSettings] = useState<RoomSettings>({ ...DEFAULT_SETTINGS });
  const [hideScreenShareBtn, setHideScreenShareBtn] = useState(false);
  const [hideReactionsBtn, setHideReactionsBtn] = useState(false);
  const [chatPlaceholder, setChatPlaceholder] = useState("Type a message...");

  // --- people -------------------------------------------------------------
  const [participants, setParticipants, participantsRef] = useStateRef<Participant[]>([]);
  const [avatars, setAvatars] = useState<AvatarChip[]>([]);
  const [pending, setPending, pendingRef] = useStateRef<PendingParticipant[]>([]);
  const [joinRequests, setJoinRequests, joinRequestsRef] = useStateRef<JoinRequests>({ visible: false, rows: [] });
  const [search, setSearch] = useState("");

  // --- panels -------------------------------------------------------------
  const [isChatOpen, setIsChatOpen, isChatOpenRef] = useStateRef(false);
  const [participantsOpen, setParticipantsOpen, participantsOpenRef] = useStateRef(false);
  const [hostOpen, setHostOpen, hostOpenRef] = useStateRef(false);
  const [popup, setPopup] = useState<Popup>(null);
  const [unread, setUnread, unreadRef] = useStateRef(0);
  const [messages, setMessages] = useState<ChatEntry[]>([]);

  // --- media --------------------------------------------------------------
  const [isMuted, setIsMuted, isMutedRef] = useStateRef(false);
  const [isHandRaised, setIsHandRaised, isHandRaisedRef] = useStateRef(false);
  const [isScreenSharing, setIsScreenSharing, isScreenSharingRef] = useStateRef(false);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const currentSharerRef = useRef<string | null>(null);
  const [notice, setNotice] = useState<StageNotice>(IDLE_NOTICE);
  const [stageStream, setStageStream] = useState<MediaStream | null>(null);
  const [stageVideoVisible, setStageVideoVisible] = useState(false);
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);
  const [ended, setEnded] = useState(false);

  // --- element refs for click-outside and focus ---------------------------
  const chatSidebarRef = useRef<HTMLElement | null>(null);
  const chatToggleRef = useRef<HTMLButtonElement | null>(null);
  const chatInputRef = useRef<HTMLInputElement | null>(null);
  const participantsSidebarRef = useRef<HTMLElement | null>(null);
  const participantsFabRef = useRef<HTMLButtonElement | null>(null);
  const hostSidebarRef = useRef<HTMLElement | null>(null);
  const hostFabRef = useRef<HTMLButtonElement | null>(null);

  // --- timers (cleared on unmount) -----------------------------------------
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const later = useCallback((fn: () => void, ms: number) => {
    const timer = setTimeout(() => {
      timers.current.delete(timer);
      fn();
    }, ms);
    timers.current.add(timer);
  }, []);
  const seq = useRef(0);

  const socket = useGroupChatSocket({
    onOpen: (ws) => {
      ws.send(JSON.stringify(msg.join(userIdRef.current ?? "", userNameRef.current, tokenRef.current)));
    },
    onMessage: (m) => handleMessage(m),
    showToast,
  });
  const send = socket.send;

  const mesh = usePeerMesh({
    send,
    showToast,
    userIdRef,
    localStreamRef,
    screenStreamRef,
    isScreenSharingRef,
    currentSharerRef,
    onRemoteVideo: (stream) => {
      setStageStream(stream);
      setStageVideoVisible(true);
    },
  });

  const marker = useMarker(send);

  // =========================================================================
  // Participants
  // =========================================================================
  function updateParticipants(list: Participant[]) {
    setParticipants(list);
    const chips: AvatarChip[] = list.slice(0, 5).map((p, i) => ({
      key: `p${++seq.current}`,
      letter: initial(p.name),
      color: AVATAR_COLORS[i % AVATAR_COLORS.length],
      title: p.name + (p.is_host ? " (Host)" : "") + (p.user_id === userIdRef.current ? " (You)" : ""),
    }));
    if (list.length > 5) {
      chips.push({ key: `p${++seq.current}`, letter: `+${list.length - 5}`, color: "rgba(0,0,0,0.3)", title: "" });
    }
    setAvatars(chips);
  }

  function addParticipant(p: Participant) {
    setParticipants([...participantsRef.current, p]);
    const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    setAvatars((all) => [...all, { key: `p${++seq.current}`, letter: initial(p.name), color, title: p.name, joinedUserId: p.user_id }]);
  }

  function removeParticipant(uid: string) {
    setParticipants(participantsRef.current.filter((p) => p.user_id !== uid));
    setAvatars((all) => {
      const index = all.findIndex((a) => a.joinedUserId === uid);
      return index === -1 ? all : all.filter((_, i) => i !== index);
    });
  }

  /** `renderJoinRequests`: merge new rows by user id and show the section (hidden only if still empty). */
  function renderJoinRequests(requests: PendingParticipant[]) {
    const current = joinRequestsRef.current;
    const existing = new Set(current.rows.map((r) => r.user_id));
    const rows = [...current.rows];
    for (const r of requests) {
      if (!r || !r.user_id || existing.has(r.user_id)) continue;
      rows.push(r);
    }
    setJoinRequests({ visible: rows.length > 0, rows });
  }

  // =========================================================================
  // Settings
  // =========================================================================
  function applySettingsToUI(s: Partial<RoomSettings> | null | undefined) {
    if (!s) return;
    const rs = { ...roomSettingsRef.current, ...s };
    roomSettingsRef.current = rs;
    setUiSettings(rs);

    // Enforcement on the local UI (participants only).
    if (!canModerateRef.current) {
      const hostMgmt = !!rs.host_management_enabled;
      setHideScreenShareBtn(hostMgmt && !rs.screen_share_enabled);
      setHideReactionsBtn(hostMgmt && !rs.reactions_enabled);
      if (hostMgmt && !rs.reactions_enabled) setPopup((p) => (p === "reactions" ? null : p));
      // Host disabled sharing while we share: stop now.
      if (hostMgmt && !rs.screen_share_enabled) {
        try {
          stopScreenShare();
        } catch {}
      }
      setChatPlaceholder(hostMgmt && !rs.chat_enabled ? "Chat disabled by host" : "Type a message...");
    }
  }

  function sendHostSettingsPatch(patch: Partial<RoomSettings>) {
    if (!canModerateRef.current) {
      showToast("Only host/co-host can change settings", "info");
      applySettingsToUI(roomSettingsRef.current);
      return;
    }
    send(msg.hostSetSettings(patch));
  }

  function toggleSetting(key: BooleanSettingKey, checked: boolean) {
    if (!canModerateRef.current) {
      showToast("Only host/co-host can change settings", "info");
      applySettingsToUI(roomSettingsRef.current);
      return;
    }
    setUiSettings((ui) => ({ ...ui, [key]: checked }));
    sendHostSettingsPatch({ [key]: checked });
  }

  function selectAccessType(value: RoomSettings["access_type"]) {
    if (!canModerateRef.current) {
      showToast("Only host/co-host can change settings", "info");
      return;
    }
    setUiSettings((ui) => ({ ...ui, access_type: value }));
    sendHostSettingsPatch({ access_type: value });
  }

  // =========================================================================
  // Room lifecycle
  // =========================================================================
  function cleanupRoom() {
    socket.close();
    stopTracks(localStreamRef.current);
    localStreamRef.current = null;
    stopTracks(screenStreamRef.current);
    screenStreamRef.current = null;
    mesh.closeAll();
    roomIdRef.current = null;
    isHostRef.current = false;
    // Only the flag: the original left the button's look untouched here.
    isScreenSharingRef.current = false;
  }

  function leaveRoom() {
    cleanupRoom();
    hardNavigate(HREF.createMeet);
  }

  function handleRoomEnded() {
    cleanupRoom();
    setEnded(true);
  }

  function goToHistorySoon() {
    showToast("End meeting is available from Call History", "info", 4000);
    later(() => hardNavigate(HREF.history), 700);
  }

  async function connectPeers(list: Participant[] | undefined) {
    if (!mesh.isStartAllowed()) return;
    for (const p of list || []) {
      if (p.user_id !== userIdRef.current) await mesh.createPeerConnection(p.user_id);
    }
  }

  // =========================================================================
  // Signalling
  // =========================================================================
  async function handleMessage(m: ServerMessage) {
    switch (m.type) {
      case "room-info": {
        const data = m.data;
        // Prefer rtc_config from the socket (works even when /api/* is not proxied).
        const wsRtc = data.rtc_config;
        try {
          mesh.applyRtcConfig(wsRtc);
          if (wsRtc && wsRtc.requireTurn && !wsRtc.turnConfigured) {
            showToast("Meeting server is missing TURN configuration. Audio/screen share will not work on most networks.", "warning", 8000);
          }
        } catch {}
        isHostRef.current = data.is_host;
        const moderator = !!data.can_moderate;
        setCanModerate(moderator);
        myRoleRef.current = data.role || (data.is_host ? "host" : "participant");
        userIdRef.current = data.your_user_id;
        updateParticipants(data.participants);

        if (data.settings) applySettingsToUI(data.settings);

        // Waiting room requests (host/co-host).
        if (moderator && Array.isArray(data.pending) && data.pending.length) {
          setPending([...data.pending]);
          renderJoinRequests(data.pending);
        } else {
          setJoinRequests({ visible: false, rows: [] });
          setPending([]);
        }

        if (!moderator) setHostOpen(false);

        if (data.screen_share_active) {
          currentSharerRef.current = data.screen_sharer_id || null;
          setNotice({
            title: `${data.screen_sharer_id === userIdRef.current ? "You are" : "Someone is"} sharing screen`,
            hint: false,
            spaced: true,
            pulse: false,
          });
        }

        // Only start WebRTC if TURN is configured when the server requires it.
        mesh.setStartAllowed(!(wsRtc && wsRtc.requireTurn && !wsRtc.turnConfigured));
        await connectPeers(data.participants);
        break;
      }

      case "room-ended":
        showToast("The host has ended the meeting.", "call_end");
        later(handleRoomEnded, 2000);
        break;

      case "user-joined":
        showToast(`${m.data.name} joined`, "person_add");
        addParticipant(m.data);
        if (mesh.isStartAllowed() && m.data.user_id !== userIdRef.current) {
          await mesh.createPeerConnection(m.data.user_id);
        }
        break;

      case "user-left":
        showToast(`${m.data.name} left`, "person_remove");
        removeParticipant(m.data.user_id);
        mesh.removePeer(m.data.user_id);
        break;

      case "offer":
        await mesh.handleOffer(m.from_user_id, m.data);
        break;

      case "answer":
        await mesh.handleAnswer(m.from_user_id, m.data);
        break;

      case "ice-candidate":
        await mesh.handleIceCandidate(m.from_user_id, m.data);
        break;

      case "screen-share-started":
        currentSharerRef.current = m.data.sharer_id || null;
        setNotice({ title: `${m.data.sharer_name} is sharing screen`, hint: false, spaced: true, pulse: true });
        break;

      case "screen-share-stopped":
        if (!m.data.sharer_id || currentSharerRef.current === m.data.sharer_id) {
          currentSharerRef.current = null;
        }
        setNotice({ title: "No screen being shared", hint: true, spaced: true, pulse: false });
        setStageVideoVisible(false);
        break;

      case "chat-message": {
        const data = m.data;
        const mine = data.user_id === userIdRef.current;
        const entry: ChatEntry = {
          id: ++seq.current,
          mine,
          name: mine ? "You" : data.name,
          time: new Date(data.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          text: data.message,
        };
        setMessages((all) => [...all, entry]);
        if (!isChatOpenRef.current) setUnread(unreadRef.current + 1);
        break;
      }

      case "reaction":
        showFloatingReaction(m.data.emoji, m.data.name);
        break;

      case "hand-raised":
        showToast(`${m.data.name} raised hand`, "back_hand");
        break;

      case "hand-lowered":
        showToast(`${m.data.name} lowered hand`, "pan_tool_alt");
        break;

      case "settings-updated":
        if (m.data && m.data.settings) {
          applySettingsToUI(m.data.settings);
          showToast("Host settings updated", "tune");
        }
        break;

      case "participants-updated":
        if (m.data && Array.isArray(m.data.participants)) updateParticipants(m.data.participants);
        break;

      case "host-mute":
        try {
          const tracks = localStreamRef.current?.getAudioTracks() ?? [];
          if (localStreamRef.current && tracks.length) tracks[0].enabled = false;
          setIsMuted(true);
          showToast("You were muted by the host", "volume_off", 4000);
        } catch {
          showToast("Muted by the host", "volume_off", 4000);
        }
        break;

      case "host-unmute":
        try {
          const tracks = localStreamRef.current?.getAudioTracks() ?? [];
          if (localStreamRef.current && tracks.length) tracks[0].enabled = true;
          setIsMuted(false);
          showToast("You were unmuted by the host", "volume_up", 3000);
        } catch {
          showToast("Unmuted by the host", "volume_up", 3000);
        }
        break;

      case "kicked":
        showToast("You were removed from the meeting", "person_remove", 4000);
        later(leaveRoom, 1200);
        break;

      case "join-denied":
        showToast(`Join denied: ${m.data?.reason || "not allowed"}`, "error", 5000);
        later(leaveRoom, 1200);
        break;

      case "waiting-room":
        showToast(m.data?.message || "Waiting for host...", "hourglass_top", 4000);
        break;

      case "admitted":
        showToast("You were admitted to the meeting", "check_circle");
        if (m.data && m.data.settings) applySettingsToUI(m.data.settings);
        if (m.data && Array.isArray(m.data.participants)) updateParticipants(m.data.participants);
        await connectPeers(m.data?.participants);
        break;

      case "join-request":
        if (canModerateRef.current) {
          showToast(`${m.data.name} is requesting to join`, "person_add");
          if (m.data && m.data.user_id && !pendingRef.current.some((p) => p.user_id === m.data.user_id)) {
            setPending([...pendingRef.current, { user_id: m.data.user_id, name: m.data.name || "Anonymous" }]);
          }
          renderJoinRequests([m.data]);
        }
        break;

      case "annotation-draw":
        if (m.data) marker.drawStroke(m.data);
        break;

      case "annotation-clear":
        marker.clear(false);
        break;
    }
  }

  // =========================================================================
  // Join
  // =========================================================================
  async function loadRtcConfig() {
    try {
      const result = await fetchRtcConfig();
      if (!result.ok) {
        if (result.status === 503) {
          showToast(result.detail || "TURN not configured (WebRTC will be unreliable)", "warning", 6000);
        }
        return;
      }
      mesh.applyRtcConfig(result.config);
    } catch {}
  }

  async function joinRoom(roomId: string, alive: () => boolean) {
    // ICE/TURN config before any peer connection exists.
    await loadRtcConfig();
    if (!alive()) return;

    try {
      if (await isRoomGone(roomId, tokenRef.current)) {
        if (alive()) setEnded(true);
        return;
      }
    } catch (e) {
      console.log("Error checking room status", e);
    }
    if (!alive()) return;

    const token = tokenRef.current;
    if (token) {
      try {
        const profile = await fetchProfile(token);
        if (profile) {
          userIdRef.current = profile.user_id ?? null;
          userNameRef.current = profile.name || "Anonymous";
        }
      } catch {}
      if (!alive()) return;
    }

    if (!userIdRef.current) {
      userIdRef.current = "user-" + Math.random().toString(36).slice(2, 8);
    }

    socket.connect(groupChatSocketUrl(roomId));

    try {
      const stream = await acquireMicrophoneStream();
      if (!alive()) {
        stopTracks(stream);
        return;
      }
      localStreamRef.current = stream;
      // Peers created before the permission resolved get the track now.
      try {
        const track = stream.getAudioTracks?.()?.[0] || null;
        if (track) await mesh.attachAudioTrack(track);
      } catch {}
    } catch (err) {
      if (!alive()) return;
      console.warn("Could not get microphone:", err);
      showToast("Microphone not available (check permissions/device)", "warning");
    }
  }

  // Latest join/leave closures for the mount effect (kept in a ref so the effect runs once).
  const joinRef = useRef(joinRoom);
  useEffect(() => {
    joinRef.current = joinRoom;
  });

  useEffect(() => {
    let alive = true;
    const roomParam = new URLSearchParams(window.location.search).get("room");
    if (!roomParam) {
      window.location.replace(HREF.createMeet);
      return;
    }
    roomIdRef.current = roomParam;
    tokenRef.current = readStoredToken();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the room id comes from the URL, read after hydration
    setMeetingId(roomParam);
    void joinRef.current(roomParam, () => alive);
    const pendingTimers = timers.current;
    return () => {
      alive = false;
      pendingTimers.forEach(clearTimeout);
      pendingTimers.clear();
      stopTracks(localStreamRef.current);
      localStreamRef.current = null;
      stopTracks(screenStreamRef.current);
      screenStreamRef.current = null;
    };
  }, []);

  // Clicking anywhere closes the reactions / host popups.
  useEffect(() => {
    const close = () => setPopup(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  // Click outside closes the open sidebars (only registered once a room id exists, as on the original).
  const toggleRef = useRef({ chat: () => {}, participants: () => {}, host: () => {} });
  useEffect(() => {
    toggleRef.current = { chat: toggleChat, participants: toggleParticipants, host: toggleHostControls };
  });
  useEffect(() => {
    if (!meetingId) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node | null;
      const inside = (el: Element | null) => !!el && !!target && el.contains(target);
      if (isChatOpenRef.current && chatSidebarRef.current && !inside(chatSidebarRef.current) && !inside(chatToggleRef.current)) {
        toggleRef.current.chat();
      }
      if (
        participantsOpenRef.current &&
        participantsSidebarRef.current &&
        !inside(participantsSidebarRef.current) &&
        !inside(participantsFabRef.current)
      ) {
        toggleRef.current.participants();
      }
      if (hostOpenRef.current && hostSidebarRef.current && !inside(hostSidebarRef.current) && !inside(hostFabRef.current)) {
        toggleRef.current.host();
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [meetingId, hostOpenRef, isChatOpenRef, participantsOpenRef]);

  // =========================================================================
  // UI actions
  // =========================================================================
  function toggleChat() {
    const open = !isChatOpenRef.current;
    setIsChatOpen(open);
    if (open) {
      setUnread(0);
      later(() => chatInputRef.current?.focus(), 300);
    }
  }

  function toggleParticipants() {
    const open = !participantsOpenRef.current;
    setParticipantsOpen(open);
    if (open) setHostOpen(false);
  }

  function toggleHostControls() {
    const open = !hostOpenRef.current;
    setHostOpen(open);
    if (open) setParticipantsOpen(false);
  }

  function toggleHand() {
    const raised = !isHandRaisedRef.current;
    setIsHandRaised(raised);
    if (raised) {
      showToast("Hand raised", "back_hand");
      send(msg.handRaised(userNameRef.current), { silent: true });
    } else {
      showToast("Hand lowered", "pan_tool_alt");
      send(msg.handLowered(userNameRef.current), { silent: true });
    }
  }

  function showFloatingReaction(src: string, name = "Someone") {
    const id = ++seq.current;
    const left = `${50 + (Math.random() - 0.5) * 40}%`;
    setReactions((all) => [...all, { id, src, name, left }]);
    later(() => setReactions((all) => all.filter((r) => r.id !== id)), 10000);
  }

  function sendReaction(src: string) {
    setPopup(null);
    const rs = roomSettingsRef.current;
    if (!canModerateRef.current && !!rs.host_management_enabled && !rs.reactions_enabled) {
      showToast("Reactions disabled by host", "info");
      return;
    }
    showFloatingReaction(src, "You");
    send(msg.reaction(src, userNameRef.current), { silent: true });
  }

  function muteAllFromPopup() {
    setPopup(null);
    send(msg.hostMuteAll());
    showToast("Muting all participants", "volume_off");
  }

  function muteAllFromTools() {
    if (!canModerateRef.current) return showToast("Only host/co-host", "info");
    send(msg.hostMuteAll());
    showToast("Muting all participants", "volume_off");
  }

  function copyInvite(fromPopup: boolean) {
    copyPageUrl();
    if (fromPopup) setPopup(null);
    showToast("Invite link copied!", "link");
  }

  function copyLink() {
    copyPageUrl();
    showToast("Link copied to clipboard");
  }

  function endMeeting(fromPopup: boolean) {
    if (fromPopup) setPopup(null);
    goToHistorySoon();
  }

  async function toggleMic() {
    if (!localStreamRef.current) {
      try {
        const stream = await acquireMicrophoneStream();
        localStreamRef.current = stream;
        const track = stream.getAudioTracks?.()?.[0] || null;
        if (track) await mesh.attachAudioTrack(track);
      } catch (err) {
        console.warn("Could not get microphone:", err);
        showToast("Microphone not available (check permissions/device)", "warning");
        return;
      }
    }
    const rs = roomSettingsRef.current;
    if (!canModerateRef.current && !!rs.host_management_enabled && !rs.participants_can_unmute && isMutedRef.current) {
      showToast("Unmute disabled by host", "info");
      return;
    }
    const muted = !isMutedRef.current;
    setIsMuted(muted);
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) track.enabled = !muted;
  }

  function stopScreenShare() {
    if (!isScreenSharingRef.current) return;
    stopTracks(screenStreamRef.current);
    screenStreamRef.current = null;
    setIsScreenSharing(false);
    if (currentSharerRef.current === userIdRef.current) currentSharerRef.current = null;

    // Hide the marker toolkit and clear the canvas (for everyone).
    marker.setUiVisible(false, false);
    try {
      marker.clear(true);
    } catch {}

    mesh.detachScreenTrack();
    send(msg.screenShareStopped(), { silent: true });
  }

  async function toggleScreenShare() {
    const rs = roomSettingsRef.current;
    if (!canModerateRef.current && !!rs.host_management_enabled && !rs.screen_share_enabled) {
      showToast("Screen sharing disabled by host", "info");
      return;
    }
    if (isScreenSharingRef.current) {
      stopScreenShare();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      screenStreamRef.current = stream;
      const track = stream.getVideoTracks()[0];
      track.onended = () => stopScreenShareRef.current();
      await mesh.attachScreenTrack(track, stream);

      setIsScreenSharing(true);
      currentSharerRef.current = userIdRef.current;
      // The marker is available while sharing.
      marker.setUiVisible(true, true);
      send(msg.screenShareStarted(userNameRef.current), { silent: true });
    } catch (err) {
      console.error("Screen share error:", err);
      if (err && (err as { name?: string }).name === "NotAllowedError") {
        showToast("Screen share permission was denied (click Share Screen and allow the prompt)", "warning", 6000);
      } else {
        showToast("Screen share failed", "warning", 4000);
      }
    }
  }
  const stopScreenShareRef = useRef(stopScreenShare);
  useEffect(() => {
    stopScreenShareRef.current = stopScreenShare;
  });

  function toggleMarker() {
    if (!isScreenSharingRef.current) {
      showToast("Start screen share to use marker", "info");
      return;
    }
    marker.setMarkerEnabled(!marker.enabled);
  }

  function openWhiteboard() {
    window.open(HREF.whiteboard(roomIdRef.current), "_blank");
  }

  function submitChat(raw: string): boolean {
    const text = raw.trim();
    if (!text || !socket.hasSocket()) return false;
    const rs = roomSettingsRef.current;
    if (!canModerateRef.current && !!rs.host_management_enabled && !rs.chat_enabled) {
      showToast("Chat disabled by host", "info");
      return false;
    }
    send(msg.chatMessage(text), { silent: true });
    return true;
  }

  /** Admit/Deny in the host sidebar's "Join Requests" (also drops the waiting-list entry). */
  function answerJoinRequest(uid: string, admit: boolean) {
    send(admit ? msg.hostAdmit(uid) : msg.hostKick(uid, "denied"));
    setJoinRequests({ ...joinRequestsRef.current, rows: joinRequestsRef.current.rows.filter((r) => r.user_id !== uid) });
    setPending(pendingRef.current.filter((p) => p.user_id !== uid));
  }

  /** Admit/Deny in the participants sidebar's waiting list (the Join Requests row stays, as on the original). */
  function answerWaiting(uid: string, admit: boolean) {
    send(admit ? msg.hostAdmit(uid) : msg.hostKick(uid, "denied"));
    setPending(pendingRef.current.filter((p) => p.user_id !== uid));
  }

  function participantAction(p: Participant, action: ParticipantAction) {
    const uid = p.user_id;
    if (!uid) return;
    if (action === "mute") {
      if (p.muted) {
        send(msg.hostUnmuteUser(uid));
        showToast("Unmute sent", "volume_up");
      } else {
        send(msg.hostMuteUser(uid));
        showToast("Mute sent", "volume_off");
      }
      return;
    }
    if (action === "kick") {
      if (!window.confirm(`Remove ${p.name}?`)) return;
      send(msg.hostKick(uid, "removed"));
      showToast("Removing participant...", "person_remove");
      return;
    }
    const role = p.role || (p.is_host ? "host" : "participant");
    const nextRole = role === "cohost" ? "participant" : "cohost";
    send(msg.hostSetRole(uid, nextRole));
    showToast(nextRole === "cohost" ? "Promoted to co-host" : "Co-host removed", "admin_panel_settings");
  }

  return {
    toast,
    meetingId,
    userId: userIdRef,
    canModerate,
    uiSettings,
    hideScreenShareBtn,
    hideReactionsBtn,
    chatPlaceholder,
    participants,
    avatars,
    pending,
    joinRequests,
    search,
    setSearch,
    isChatOpen,
    participantsOpen,
    hostOpen,
    popup,
    setPopup,
    unread,
    messages,
    isMuted,
    isHandRaised,
    isScreenSharing,
    notice,
    stageStream,
    stageVideoVisible,
    reactions,
    ended,
    remoteAudio: mesh.remoteAudio,
    marker,
    refs: { chatSidebarRef, chatToggleRef, chatInputRef, participantsSidebarRef, participantsFabRef, hostSidebarRef, hostFabRef },
    actions: {
      toggleChat,
      toggleParticipants,
      toggleHostControls,
      toggleSetting,
      selectAccessType,
      toggleHand,
      sendReaction,
      muteAllFromPopup,
      muteAllFromTools,
      copyInvite,
      copyLink,
      endMeeting,
      toggleMic,
      toggleScreenShare,
      toggleMarker,
      openWhiteboard,
      leave: leaveRoom,
      submitChat,
      answerJoinRequest,
      answerWaiting,
      participantAction,
    },
  };
}

export type Meeting = ReturnType<typeof useMeeting>;
