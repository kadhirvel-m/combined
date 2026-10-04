import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";
import { DEFAULT_RTC_CONFIG } from "../constants";
import { msg } from "../protocol";
import type { RtcConfigPayload, SendFn, ShowToast } from "../types";

interface PeerSenders {
  audio: RTCRtpSender | null;
  video: RTCRtpSender | null;
}

interface PeerMeshDeps {
  send: SendFn;
  showToast: ShowToast;
  userIdRef: RefObject<string | null>;
  localStreamRef: RefObject<MediaStream | null>;
  screenStreamRef: RefObject<MediaStream | null>;
  isScreenSharingRef: RefObject<boolean>;
  /** Only the active sharer's video is shown (mesh: every peer has a video m-line). */
  currentSharerRef: RefObject<string | null>;
  /** A remote video track arrived for the main stage. */
  onRemoteVideo: (stream: MediaStream) => void;
}

/** One `<audio>` per peer; `rev` changes whenever the original re-assigned `srcObject`. */
export interface RemoteAudio {
  peerId: string;
  stream: MediaStream;
  rev: number;
}

interface MeshState {
  peers: Map<string, RTCPeerConnection>;
  senders: Map<string, PeerSenders>;
  makingOffer: Map<string, boolean>;
  ignoreOffer: Map<string, boolean>;
  pendingIce: Map<string, RTCIceCandidateInit[]>;
  recvStreams: Map<string, { audio: MediaStream; video: MediaStream }>;
  iceRestarting: Set<string>;
  rtcConfig: RTCConfiguration;
  turnConfigured: boolean;
  warnedTurnOnce: boolean;
  /** False when the server requires TURN but has none: no peer connections at all. */
  startAllowed: boolean;
  timers: Set<ReturnType<typeof setTimeout>>;
}

function freshState(): MeshState {
  return {
    peers: new Map(),
    senders: new Map(),
    makingOffer: new Map(),
    ignoreOffer: new Map(),
    pendingIce: new Map(),
    recvStreams: new Map(),
    iceRestarting: new Set(),
    rtcConfig: { ...DEFAULT_RTC_CONFIG },
    turnConfigured: false,
    warnedTurnOnce: false,
    startAllowed: true,
    timers: new Set(),
  };
}

/**
 * The audio/screen-share mesh: one RTCPeerConnection per other participant,
 * perfect negotiation over the signalling socket, ICE-candidate queueing and
 * ICE restarts (the original's only "reconnect" logic). Everything is closed
 * on unmount.
 */
export function usePeerMesh(deps: PeerMeshDeps) {
  const latest = useRef(deps);
  useLayoutEffect(() => {
    latest.current = deps;
  });
  const mesh = useRef<MeshState>(freshState());
  const [remoteAudio, setRemoteAudio] = useState<RemoteAudio[]>([]);

  const later = useCallback((fn: () => void, ms: number) => {
    const timer = setTimeout(() => {
      mesh.current.timers.delete(timer);
      fn();
    }, ms);
    mesh.current.timers.add(timer);
  }, []);

  /** Merge an rtc-config payload (REST or `room-info.rtc_config`) into the connection config. */
  const applyRtcConfig = useCallback((cfg: RtcConfigPayload | null | undefined) => {
    const m = mesh.current;
    if (cfg && Array.isArray(cfg.iceServers) && cfg.iceServers.length) {
      m.rtcConfig = { ...m.rtcConfig, iceServers: cfg.iceServers };
    }
    if (cfg && typeof cfg.iceTransportPolicy === "string") {
      m.rtcConfig = { ...m.rtcConfig, iceTransportPolicy: cfg.iceTransportPolicy };
    }
    if (cfg && typeof cfg.turnConfigured === "boolean") {
      m.turnConfigured = cfg.turnConfigured;
    }
  }, []);

  const setStartAllowed = useCallback((allowed: boolean) => {
    mesh.current.startAllowed = allowed;
  }, []);
  const isStartAllowed = useCallback(() => mesh.current.startAllowed, []);

  const flushPendingIce = useCallback(async (peerId: string) => {
    const m = mesh.current;
    const pc = m.peers.get(peerId);
    if (!pc || !pc.remoteDescription) return;
    const queue = m.pendingIce.get(peerId) || [];
    m.pendingIce.set(peerId, []);
    for (const c of queue) {
      try {
        await pc.addIceCandidate(c);
      } catch {}
    }
  }, []);

  const createPeerConnection = useCallback(
    async (peerId: string): Promise<RTCPeerConnection> => {
      const m = mesh.current;
      const existing = m.peers.get(peerId);
      if (existing) return existing;

      const pc = new RTCPeerConnection(m.rtcConfig);
      m.peers.set(peerId, pc);
      m.makingOffer.set(peerId, false);
      m.ignoreOffer.set(peerId, false);
      m.pendingIce.set(peerId, []);
      const senders: PeerSenders = { audio: null, video: null };
      m.senders.set(peerId, senders);

      // Transceivers up-front stabilise renegotiation and allow replaceTrack.
      try {
        senders.audio = pc.addTransceiver("audio", { direction: "sendrecv" }).sender;
      } catch {}
      try {
        senders.video = pc.addTransceiver("video", { direction: "sendrecv" }).sender;
      } catch {}

      // Attach the local microphone if we already have it.
      try {
        const track = latest.current.localStreamRef.current?.getAudioTracks?.()?.[0] || null;
        if (senders.audio && track) await senders.audio.replaceTrack(track);
      } catch {}

      // Attach the screen track if we are sharing right now.
      try {
        const { isScreenSharingRef, screenStreamRef } = latest.current;
        const vtrack = isScreenSharingRef.current ? screenStreamRef.current?.getVideoTracks?.()?.[0] || null : null;
        if (senders.video) await senders.video.replaceTrack(vtrack);
      } catch {}

      pc.onicecandidate = ({ candidate }) => {
        if (!candidate) return;
        // Frequent; never toast if the socket is briefly unavailable.
        latest.current.send(msg.iceCandidate(candidate, peerId), { silent: true });
      };

      pc.onicecandidateerror = (e) => {
        // STUN failures are normal on many networks; harmless noise once TURN exists.
        const url = String((e as RTCPeerConnectionIceErrorEvent)?.url || "");
        if (m.turnConfigured && url.startsWith("stun:")) return;
        console.warn("ICE candidate error", peerId, e);
        if (!m.turnConfigured && !m.warnedTurnOnce && url.startsWith("stun:")) {
          m.warnedTurnOnce = true;
          latest.current.showToast("Network is blocking STUN (WebRTC). Configure TURN for reliable audio/screen sharing.", "warning", 7000);
        }
      };

      pc.ontrack = (event) => {
        const kind = event.track?.kind;
        if (!kind) return;

        // Firefox / some Unified Plan flows may not populate event.streams.
        let stream = event.streams && event.streams[0] ? event.streams[0] : null;
        if (!stream) {
          let recv = m.recvStreams.get(peerId);
          if (!recv) {
            recv = { audio: new MediaStream(), video: new MediaStream() };
            m.recvStreams.set(peerId, recv);
          }
          stream = kind === "audio" ? recv.audio : recv.video;
          try {
            for (const t of stream.getTracks()) {
              if (t.kind === kind) stream.removeTrack(t);
            }
            stream.addTrack(event.track);
          } catch {}
        }

        if (kind === "audio") {
          const audioStream = stream;
          setRemoteAudio((all) => {
            const prev = all.find((a) => a.peerId === peerId);
            if (!prev) return [...all, { peerId, stream: audioStream, rev: 0 }];
            return all.map((a) => (a.peerId === peerId ? { peerId, stream: audioStream, rev: a.rev + 1 } : a));
          });
          return;
        }

        if (kind === "video") {
          const sharer = latest.current.currentSharerRef.current;
          if (sharer && peerId !== sharer) return;
          latest.current.onRemoteVideo(stream);
        }
      };

      pc.onnegotiationneeded = async () => {
        try {
          m.makingOffer.set(peerId, true);
          await pc.setLocalDescription();
          latest.current.send(msg.offer(pc.localDescription, peerId), { silent: true });
        } catch (err) {
          console.error(err);
        } finally {
          m.makingOffer.set(peerId, false);
        }
      };

      const tryIceRestart = async (reason = "unknown") => {
        if (m.iceRestarting.has(peerId)) return;
        if (!m.startAllowed) return;
        if (!m.peers.has(peerId)) return;
        // Deterministic offerer: the "smaller" id initiates restarts.
        const iAmOfferer = String(latest.current.userIdRef.current) < String(peerId);
        if (!iAmOfferer) return;
        if (pc.signalingState !== "stable") return;
        try {
          m.iceRestarting.add(peerId);
          const offer = await pc.createOffer({ iceRestart: true });
          await pc.setLocalDescription(offer);
          latest.current.send(msg.iceRestartOffer(pc.localDescription, peerId, reason), { silent: true });
        } catch (e) {
          console.warn("ICE restart failed", peerId, e);
        } finally {
          m.iceRestarting.delete(peerId);
        }
      };

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === "failed") {
          console.warn("ICE failed for peer", peerId);
          // restartIce() alone is not always enough; also send an ICE-restart offer.
          try {
            pc.restartIce();
          } catch {}
          void tryIceRestart("iceConnectionState=failed");
        }
        if (pc.iceConnectionState === "disconnected") {
          // Mobile networks flap; restart only if it stays disconnected.
          later(() => {
            const cur = m.peers.get(peerId);
            if (cur && cur.iceConnectionState === "disconnected") void tryIceRestart("iceConnectionState=disconnected");
          }, 6000);
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed") {
          console.warn("Peer connection failed", peerId);
          void tryIceRestart("connectionState=failed");
        }
        if (pc.connectionState === "disconnected") {
          later(() => {
            const cur = m.peers.get(peerId);
            if (cur && cur.connectionState === "disconnected") void tryIceRestart("connectionState=disconnected");
          }, 6000);
        }
      };

      return pc;
    },
    [later],
  );

  const handleOffer = useCallback(
    async (peerId: string, offer: RTCSessionDescriptionInit) => {
      const m = mesh.current;
      const pc = await createPeerConnection(peerId);
      const userId = latest.current.userIdRef.current;
      const polite = (userId ?? "") > peerId;

      const offerCollision = !!m.makingOffer.get(peerId) || pc.signalingState !== "stable";
      // Perfect negotiation: the impolite peer ignores only this colliding offer.
      const shouldIgnore = offerCollision && !polite;
      m.ignoreOffer.set(peerId, shouldIgnore);
      if (shouldIgnore) return;

      try {
        // The polite peer rolls back its own offer on collision.
        if (offerCollision && polite) {
          try {
            await pc.setLocalDescription({ type: "rollback" });
          } catch {}
        }
        await pc.setRemoteDescription(offer);
        await flushPendingIce(peerId);
      } catch (e) {
        console.warn("setRemoteDescription(offer) failed", e);
        return;
      }
      await pc.setLocalDescription();
      latest.current.send(msg.answer(pc.localDescription, peerId), { silent: true });
    },
    [createPeerConnection, flushPendingIce],
  );

  const handleAnswer = useCallback(
    async (peerId: string, answer: RTCSessionDescriptionInit) => {
      const pc = mesh.current.peers.get(peerId);
      if (!pc) return;
      try {
        await pc.setRemoteDescription(answer);
        await flushPendingIce(peerId);
      } catch (e) {
        console.warn("setRemoteDescription(answer) failed", e);
      }
    },
    [flushPendingIce],
  );

  const handleIceCandidate = useCallback(async (peerId: string, candidate: RTCIceCandidateInit) => {
    const m = mesh.current;
    const pc = m.peers.get(peerId);
    if (!pc) return;
    try {
      // Queue candidates until the remote description is set.
      if (!pc.remoteDescription) {
        const queue = m.pendingIce.get(peerId) || [];
        queue.push(candidate);
        m.pendingIce.set(peerId, queue);
        return;
      }
      await pc.addIceCandidate(candidate);
    } catch (err) {
      if (!m.ignoreOffer.get(peerId)) console.warn(err);
    }
  }, []);

  /** `user-left`: close that peer and drop its audio element and bookkeeping. */
  const removePeer = useCallback((peerId: string) => {
    const m = mesh.current;
    const pc = m.peers.get(peerId);
    if (pc) {
      pc.close();
      m.peers.delete(peerId);
    }
    setRemoteAudio((all) => (all.some((a) => a.peerId === peerId) ? all.filter((a) => a.peerId !== peerId) : all));
    m.senders.delete(peerId);
    m.makingOffer.delete(peerId);
    m.ignoreOffer.delete(peerId);
    m.pendingIce.delete(peerId);
  }, []);

  /** Put the (new) microphone track on every peer's audio sender. */
  const attachAudioTrack = useCallback(async (track: MediaStreamTrack) => {
    for (const s of Array.from(mesh.current.senders.values())) {
      if (s?.audio) {
        try {
          await s.audio.replaceTrack(track);
        } catch {}
      }
    }
  }, []);

  /** Screen share started: replace each peer's video track (addTrack if it has no video sender). */
  const attachScreenTrack = useCallback(async (track: MediaStreamTrack, stream: MediaStream) => {
    const m = mesh.current;
    for (const [pid, pc] of Array.from(m.peers.entries())) {
      const s = m.senders.get(pid)?.video;
      if (s) {
        try {
          await s.replaceTrack(track);
        } catch {}
      } else {
        try {
          pc.addTrack(track, stream);
        } catch {}
      }
    }
  }, []);

  /** Screen share stopped: remove the outbound video track (not awaited, as on the original). */
  const detachScreenTrack = useCallback(() => {
    for (const s of Array.from(mesh.current.senders.values())) {
      if (s?.video) {
        try {
          void s.video.replaceTrack(null).catch(() => {});
        } catch {}
      }
    }
  }, []);

  /** The original `cleanupRoom`: close every peer connection. */
  const closeAll = useCallback(() => {
    const m = mesh.current;
    m.peers.forEach((pc) => pc.close());
    m.peers.clear();
  }, []);

  useEffect(() => {
    const m = mesh.current;
    return () => {
      m.timers.forEach(clearTimeout);
      m.timers.clear();
      m.peers.forEach((pc) => {
        pc.onicecandidate = pc.ontrack = pc.onnegotiationneeded = null;
        pc.oniceconnectionstatechange = pc.onconnectionstatechange = pc.onicecandidateerror = null;
        pc.close();
      });
      m.peers.clear();
      m.senders.clear();
      m.recvStreams.forEach(({ audio, video }) => {
        audio.getTracks().forEach((t) => t.stop());
        video.getTracks().forEach((t) => t.stop());
      });
      m.recvStreams.clear();
    };
  }, []);

  return useMemo(
    () => ({
      remoteAudio,
      applyRtcConfig,
      setStartAllowed,
      isStartAllowed,
      createPeerConnection,
      handleOffer,
      handleAnswer,
      handleIceCandidate,
      removePeer,
      attachAudioTrack,
      attachScreenTrack,
      detachScreenTrack,
      closeAll,
    }),
    [
      remoteAudio,
      applyRtcConfig,
      setStartAllowed,
      isStartAllowed,
      createPeerConnection,
      handleOffer,
      handleAnswer,
      handleIceCandidate,
      removePeer,
      attachAudioTrack,
      attachScreenTrack,
      detachScreenTrack,
      closeAll,
    ],
  );
}

export type PeerMesh = ReturnType<typeof usePeerMesh>;
