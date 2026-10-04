# group-chat rebuild — progress

Original: `ui/groupChat/group_chat.html` (+ `ui/config.js`: API base, storage/fetch auth shim, `window.Theme`; TuNe AI widget is disabled globally).
Preview route: `src/app/(site)/react-preview/groupChat/group_chat/page.tsx` → `/react-preview/groupChat/group_chat?room=XXXX`.
Title: "Meeting Room — PaperX"; description "Real-time video meeting with screen sharing and collaborative tools".

Scratch (parity scripts, fixtures, captures): `$SCRATCH/group-chat/`.

## Status
- [x] Inventory (this file)
- [ ] types.ts / protocol.ts / api.ts
- [ ] hooks: useGroupChatSocket, usePeerMesh (RTC), useMeetingToast, useClock, useMarker
- [ ] components + CSS module
- [ ] preview page
- [ ] parity: states below, sent-message capture identical
- [ ] tsc + eslint clean, console clean
- [ ] delete this file

## Look (static)
- Body: `bg-gradient-to-br` but every from/to stop is dead → no gradient; light = white canvas, dark = dark canvas (color-scheme). Text `#0d1117` / dark `zinc-100`. Font Inter. `overflow:hidden`.
- Icons: `.icon` = Material Symbols **Outlined**, FILL 0 wght 400, NO size/line-height of its own (inherits font-size; Google CSS never targets `.icon`). `text-*` classes on icons size them.
- Dead classes (leave out): `from-slate-100 to-purple-100 dark:from-[#0a0d12] dark:to-[#1a0f1c] p-2.5 z-80`.
  - `z-80` dead → top-right actions (Copy Link, theme toggle) have z auto and sit **under** `<main>` (later in DOM): invisible + unclickable. Match it.
  - `p-2.5` dead → theme button has no padding.
- Participants bar (top 20px, left 20px, glass, `group` icon, avatars, "N in call").
- Main: fixed inset 0, `p-4`, video container (dark gradient, radius 24) with `<video>` (hidden) + empty state ("No screen being shared" / Click "Share Screen" to present). `chat-open` → right: 380px (desktop only, ≤768px stays 0).
- Meeting info badge bottom-left: clock (`h:mm AM`, updated every 1s) | room id ("---" / "--:-- --" before init).
- Control bar (bottom centre; `chat-open` shifts left by 190px on desktop): mic (active/muted), screen share (active/inactive), divider, whiteboard, chat (+ unread badge, "9+" cap), divider, raise hand (hand-raised), reactions (+ popup of 8 SVGs), host controls (hidden unless can_moderate; popup: Mute all / Invite link / End meeting for all), divider, leave (danger).
- Chat sidebar (right, 360px, `open` → right 16px; mobile full width): header (chat_bubble, "Chat", close), messages (empty state "Messages will appear here"; bubbles mine/theirs with name/"You" + `hh:mm` time + text), form (input "Type a message..." / "Chat disabled by host", send button).
- FABs bottom-right: participants (always), host controls (only can_moderate, `display:flex`). `.active` = brand gradient.
- Participants sidebar: header (people, "Participants", "(N)", close), search input, list (empty "No participants yet"; Waiting (N) header + pending rows with Admit/Deny; divider; participant rows: coloured avatar initial, name + " (You)" + "(Muted)", role label; moderator actions Mute/Unmute, Remove (confirm), Make/Remove co-host).
- Host controls sidebar: Chat Moderation (chat toggle), Meeting Access (host first, lock, waiting room, access type radios Open/Trusted + "Anyone with the meeting link can ask to join" checkbox), Meeting Moderation (host management, screen share, reactions, unmute, camera), Host Tools (only can_moderate: Mute all participants, Copy invite link), Join Requests (only when non-empty: rows with Admit/Deny), "End meeting for everyone".
- Ended view overlay (display flex when ended): call_end badge, "Call Ended", text, "Go to Call History" (`group_history.html`), "Return to Home" (`../index.html`).
- Toast: single glass toast bottom 100px, icon (brand colour) + text. Each call schedules its own hide (earlier timers can hide a later toast early — quirk to match).
- Marker: canvas overlay (z 85), marker FAB (right 20, bottom 118; only while I'm screen sharing), toolkit (pen/eraser/color/size/clear/close).
- Floating reactions: img 100px + name pill, random left 30–70%, `floatUp` 6s, removed after 10s.
- Remote audio container (hidden div with one `<audio>` per peer).

## Behaviour
- URL param `room` (required). Missing → `location.replace('create_meet.html')` (relative to /groupChat/).
- Clock + meeting id only when room present; click-outside-to-close sidebars only registered when room present.
- Storage: `localStorage.px_token` (via shim → `__COOKIE_AUTH__` or null) used as `token`; `px_theme` (theme).
- Theme toggle (`Theme.toggle()`) — unreachable in practice (see z-80).
- Copy link button / host "Invite link" / host tools "Copy invite link": `navigator.clipboard.writeText(location.href)` + toasts ("Link copied to clipboard" check_circle / "Invite link copied!" link).
- Leave → cleanup + `location.href = 'create_meet.html'`.
- Whiteboard → `window.open('whiteboard.html?room=' + roomId, '_blank')`.
- End meeting (popup + sidebar) → toast "End meeting is available from Call History" (info, 4000) + after 700ms `location.href='group_history.html'`.
- Document click closes reactions + host popups; reaction/host buttons stopPropagation.
- Chat toggle: opens/closes chat, clears unread, focuses input after 300ms.
- Participants / host sidebars are mutually exclusive; opening participants refreshes list. Search filters name or user_id (case-insensitive).
- Radios/toggles: non-moderator → toast "Only host/co-host can change settings" (info) + re-apply settings; moderator → `host-set-settings` patch.
- Mic: if no stream → acquire (fallback enumerate devices), attach to senders; non-mod with host_mgmt && !participants_can_unmute && muted → "Unmute disabled by host"; toggles track.enabled.
- Screen share: blocked for non-mod when host_mgmt && !screen_share_enabled ("Screen sharing disabled by host"); getDisplayMedia → replaceTrack on video senders; marker FAB; `screen-share-started`. Errors: NotAllowedError toast (6000) vs "Screen share failed" (4000). Track `onended` → stop.
- Stop share → stop tracks, marker hidden + `annotation-clear` broadcast, replaceTrack(null), `screen-share-stopped`.
- Raise hand toggles + toasts "Hand raised"/"Hand lowered" + sends.
- Reactions popup toggle (the later handler wins: no disabled check on open); reaction click: closes popup, blocked for non-mod if disabled ("Reactions disabled by host"), local float "You", send.
- applySettingsToUI for non-mod: hide screen share / reactions buttons when disabled under host mgmt, close popup, stop sharing, chat placeholder.

## API calls
- `GET {API}/api/rtc-config` (no auth header). 503 → toast detail || 'TURN not configured (WebRTC will be unreliable)' (warning, 6000). ok → merge iceServers/iceTransportPolicy/turnConfigured.
- `GET {API}/api/group-chat/{room}` (Bearer token if token). 400/404 with detail containing "ended"/"not found" → ended view, stop.
- `GET {API}/api/profile` (only if token; Bearer) → user_id, name.
- Fallback user id `'user-' + Math.random().toString(36).substr(2, 6)`.
- Then `connectWebSocket()` then microphone (toast "Microphone not available (check permissions/device)" warning).

## WebSocket `${WS_BASE}/ws/group-chat/${roomId}` (WS_BASE = API with http→ws)
No reconnect in the original: onclose only logs "[WS] Disconnected"; onerror logs + toast "Connection error" (error).
Sent:
- `join` {user_id, name, token} on open
- `host-set-settings` {data: patch}
- `hand-raised` / `hand-lowered` {data:{name}}
- `host-mute-all` {data:{}}
- `host-admit` {target_user_id, data:{}} ; `host-kick` {target_user_id, data:{reason:'denied'|'removed'}}
- `host-mute-user` / `host-unmute-user` {target_user_id, data:{}} ; `host-set-role` {target_user_id, data:{role}}
- `annotation-draw` {data:{tool,color,size,points}} ; `annotation-clear` {data:{}}
- `reaction` {data:{emoji: src, name}}
- `ice-candidate` {data: candidate, target_user_id} ; `offer` {data: localDescription, target_user_id} (+ `data2:{iceRestart,reason}` on restart) ; `answer`
- `screen-share-started` {data:{sharer_name}} ; `screen-share-stopped` {data:{}}
- `chat-message` {data:{message}}
Key order matters for byte-identical capture (see original literals).
Received: room-info, room-ended, user-joined, user-left, offer, answer, ice-candidate, screen-share-started, screen-share-stopped, chat-message, reaction, hand-raised, hand-lowered, settings-updated, participants-updated, host-mute, host-unmute, kicked, join-denied, waiting-room, admitted, join-request, annotation-draw, annotation-clear. (`error` messages from server are ignored.)
sendWs: not open → toast "Not connected" (error) unless silent; throw → "Send failed".

## WebRTC
- rtcConfig default 3 STUN + iceCandidatePoolSize 10 + policy all; overridden by /api/rtc-config then room-info.rtc_config. requireTurn && !turnConfigured → warning toast (8000) and no peer connections (rtcStartAllowed=false).
- createPeerConnection(peer): audio+video sendrecv transceivers, replaceTrack local mic / screen; onicecandidate → send; onicecandidateerror toasts once; ontrack audio → hidden <audio>, video → main video (only current sharer); onnegotiationneeded → setLocalDescription + offer; perfect negotiation (polite = userId > peerId), pending ICE queue; ICE restart (smaller id offers) on failed / disconnected for 6s.
- Peers created for every participant in room-info / admitted, and on user-joined. user-left closes the pc + removes audio element.
- Cleanup: close ws, stop local + screen tracks, close all pcs.

## Parity states to verify
light/dark × desktop/mobile empty room; messages self+others (chat open); presence (participants bar + sidebar, join/leave toasts); host view (host controls sidebar, join requests, waiting list); call UI (muted, hand raised, reactions popup, screen sharing + marker toolkit, remote sharer); errors (Connection error toast, Not connected, ended view, join denied); "reconnecting" = original has none → document.
