// Extracted from ui/groupChat/group_chat.html (inline <script> #1).
        // =========================================================================
        // Configuration
        // =========================================================================
        const API = (window.API_BASE || 'http://0.0.0.0:10000').replace(/\/$/, '');
        const WS_BASE = API.replace(/^http/, 'ws');
        const token = localStorage.getItem('px_token');

        // =========================================================================
        // State
        // =========================================================================
        let roomId = null;
        let userId = null;
        let userName = 'Anonymous';
        let isHost = false;
        let canModerate = false;
        let myRole = 'participant';
        let roomSettings = {
            host_management_enabled: true,
            chat_enabled: true,
            screen_share_enabled: true,
            reactions_enabled: true,
            participants_can_unmute: true,
            participants_can_start_video: true,
            lock_meeting: false,
            waiting_room_enabled: false,
            access_type: 'open',
            allow_ask_to_join: true,
            host_must_join_first: false,
        };
        let ws = null;
        let localStream = null;
        let screenStream = null;
        let peerConnections = {};
        let isMuted = false;
        let isScreenSharing = false;
        let isChatOpen = false;
        let unreadMessages = 0;

        // =========================================================================
        // DOM Elements
        // =========================================================================
        const el = id => document.getElementById(id);
        const mainContent = el('mainContent');
        const controlBar = el('controlBar');
        const chatSidebar = el('chatSidebar');
        const chatToggleBtn = el('chatToggleBtn');
        const closeChatBtn = el('closeChatBtn');
        const chatBadge = el('chatBadge');
        const endedView = el('endedView');
        const roomNameEl = el('roomName');
        const copyLinkBtn = el('copyLinkBtn');
        const leaveBtn = el('leaveBtn');
        const micBtn = el('micBtn');
        const screenShareBtn = el('screenShareBtn');
        const whiteboardBtn = el('whiteboardBtn');
        const screenShareVideo = el('screenShareVideo');
        const noScreenShare = el('noScreenShare');
        const participantAvatars = el('participantAvatars');
        const participantCount = el('participantCount');
        const chatMessages = el('chatMessages');
        const chatForm = el('chatForm');
        const chatInput = el('chatInput');

        // New control elements
        const raiseHandBtn = el('raiseHandBtn');
        const reactionsBtn = el('reactionsBtn');
        const reactionsPopup = el('reactionsPopup');
        const hostControlsContainer = el('hostControlsContainer');
        const hostControlsBtn = el('hostControlsBtn');
        const hostPopup = el('hostPopup');
        const muteAllBtn = el('muteAllBtn');
        const copyInviteBtn = el('copyInviteBtn');
        const endMeetingBtn = el('endMeetingBtn');

        // Sidebar elements
        const participantsFab = el('participantsFab');
        const hostControlsFab = el('hostControlsFab');
        const participantsSidebar = el('participantsSidebar');
        const hostControlsSidebar = el('hostControlsSidebar');
        const closeParticipantsBtn = el('closeParticipantsBtn');
        const closeHostControlsBtn = el('closeHostControlsBtn');
        const participantsList = el('participantsList');
        const participantsCountEl = el('participantsCount');
        const participantsSearchEl = el('participantsSearch');

        // Waiting room list (for Participants sidebar)
        let pendingParticipants = [];

        // Host settings + tools
        const toggleChatEl = el('toggleChat');
        const toggleHostFirstEl = el('toggleHostFirst');
        const toggleHostManagementEl = el('toggleHostManagement');
        const toggleScreenShareEl = el('toggleScreenShare');
        const toggleReactionsEl = el('toggleReactions');
        const toggleMicEl = el('toggleMic');
        const toggleVideoEl = el('toggleVideo');
        const toggleLockMeetingEl = el('toggleLockMeeting');
        const toggleWaitingRoomEl = el('toggleWaitingRoom');
        const allowAskToJoinEl = el('allowAskToJoin');
        const hostToolsSection = el('hostToolsSection');
        const hostMuteAllBtn2 = el('hostMuteAllBtn');
        const hostCopyInviteBtn2 = el('hostCopyInviteBtn');
        const joinRequestsSection = el('joinRequestsSection');
        const joinRequestsList = el('joinRequestsList');

        // Marker overlay
        const markerCanvas = el('markerCanvas');
        const markerFab = el('markerFab');
        const markerToolkit = el('markerToolkit');
        const markerPenBtn = el('markerPenBtn');
        const markerEraserBtn = el('markerEraserBtn');
        const markerColorEl = el('markerColor');
        const markerSizeEl = el('markerSize');
        const markerClearBtn = el('markerClearBtn');
        const markerCloseBtn = el('markerCloseBtn');

        let markerCtx = null;
        let markerEnabled = false;
        let markerTool = 'pen';
        let markerDrawing = false;
        let markerPrev = null;

        let isHandRaised = false;
        let isParticipantsSidebarOpen = false;
        let isHostControlsSidebarOpen = false;

        // =========================================================================
        // Toast
        // =========================================================================
        function showToast(message, icon = 'check_circle', duration = 3000) {
            const toast = el('toast');
            el('toastText').textContent = message;
            el('toastIcon').textContent = icon;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), duration);
        }

        // =========================================================================
        // Chat Sidebar Toggle
        // =========================================================================
        function toggleChat() {
            isChatOpen = !isChatOpen;

            if (isChatOpen) {
                chatSidebar.classList.add('open');
                mainContent.classList.add('chat-open');
                controlBar.classList.add('chat-open');
                chatToggleBtn.classList.add('active');
                chatToggleBtn.classList.remove('inactive');

                // Clear unread
                unreadMessages = 0;
                chatBadge.style.display = 'none';

                // Focus input
                setTimeout(() => chatInput.focus(), 300);
            } else {
                chatSidebar.classList.remove('open');
                mainContent.classList.remove('chat-open');
                controlBar.classList.remove('chat-open');
                chatToggleBtn.classList.remove('active');
                chatToggleBtn.classList.add('inactive');
            }
        }

        chatToggleBtn.onclick = toggleChat;
        closeChatBtn.onclick = toggleChat;

        // =========================================================================
        // Participants Sidebar Toggle
        // =========================================================================
        function toggleParticipantsSidebar() {
            isParticipantsSidebarOpen = !isParticipantsSidebarOpen;

            if (isParticipantsSidebarOpen) {
                participantsSidebar.classList.add('open');
                participantsFab.classList.add('active');

                // Close other sidebars
                hostControlsSidebar.classList.remove('open');
                hostControlsFab.classList.remove('active');
                isHostControlsSidebarOpen = false;

                // Update participants list
                updateParticipantsList();
            } else {
                participantsSidebar.classList.remove('open');
                participantsFab.classList.remove('active');
            }
        }

        participantsFab.onclick = toggleParticipantsSidebar;
        closeParticipantsBtn.onclick = toggleParticipantsSidebar;

        // =========================================================================
        // Host Controls Sidebar Toggle
        // =========================================================================
        function toggleHostControlsSidebar() {
            isHostControlsSidebarOpen = !isHostControlsSidebarOpen;

            if (isHostControlsSidebarOpen) {
                hostControlsSidebar.classList.add('open');
                hostControlsFab.classList.add('active');

                // Close other sidebars
                participantsSidebar.classList.remove('open');
                participantsFab.classList.remove('active');
                isParticipantsSidebarOpen = false;
            } else {
                hostControlsSidebar.classList.remove('open');
                hostControlsFab.classList.remove('active');
            }
        }

        hostControlsFab.onclick = toggleHostControlsSidebar;
        closeHostControlsBtn.onclick = toggleHostControlsSidebar;

        // Radio button selection
        document.querySelectorAll('.radio-option').forEach(option => {
            option.onclick = () => {
                if (!canModerate) {
                    showToast('Only host/co-host can change settings', 'info');
                    return;
                }
                document.querySelectorAll('.radio-option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                sendHostSettingsPatch({ access_type: option.dataset.value });
            };
        });

        // End meeting button
        const hostEndMeetingBtn = el('hostEndMeetingBtn');
        if (hostEndMeetingBtn) {
            hostEndMeetingBtn.onclick = () => {
                showToast('End meeting is available from Call History', 'info', 4000);
                setTimeout(() => (window.location.href = 'group_history.html'), 700);
            };
        }

        function sendWs(msg, opts = {}) {
            const silent = !!opts.silent;
            if (!ws || ws.readyState !== WebSocket.OPEN) {
                if (!silent) showToast('Not connected', 'error');
                return false;
            }
            try {
                ws.send(JSON.stringify(msg));
                return true;
            } catch (_) {
                if (!silent) showToast('Send failed', 'error');
                return false;
            }
        }

        function sendHostSettingsPatch(patch) {
            if (!canModerate) {
                showToast('Only host/co-host can change settings', 'info');
                applySettingsToUI(roomSettings);
                return;
            }
            sendWs({ type: 'host-set-settings', data: patch });
        }

        function applySettingsToUI(s) {
            if (!s) return;
            roomSettings = { ...roomSettings, ...s };

            if (toggleChatEl) toggleChatEl.checked = !!roomSettings.chat_enabled;
            if (toggleHostFirstEl) toggleHostFirstEl.checked = !!roomSettings.host_must_join_first;
            if (toggleHostManagementEl) toggleHostManagementEl.checked = !!roomSettings.host_management_enabled;
            if (toggleScreenShareEl) toggleScreenShareEl.checked = !!roomSettings.screen_share_enabled;
            if (toggleReactionsEl) toggleReactionsEl.checked = !!roomSettings.reactions_enabled;
            if (toggleMicEl) toggleMicEl.checked = !!roomSettings.participants_can_unmute;
            if (toggleVideoEl) toggleVideoEl.checked = !!roomSettings.participants_can_start_video;
            if (toggleLockMeetingEl) toggleLockMeetingEl.checked = !!roomSettings.lock_meeting;
            if (toggleWaitingRoomEl) toggleWaitingRoomEl.checked = !!roomSettings.waiting_room_enabled;
            if (allowAskToJoinEl) allowAskToJoinEl.checked = !!roomSettings.allow_ask_to_join;

            // Access type radios
            const accessType = roomSettings.access_type || 'open';
            document.querySelectorAll('.radio-option').forEach(o => {
                o.classList.toggle('selected', o.dataset.value === accessType);
            });

            // Apply enforcement on local UI
            if (!canModerate) {
                const hostMgmt = !!roomSettings.host_management_enabled;

                // Instantly hide toolbar icons when disabled
                if (screenShareBtn) {
                    screenShareBtn.style.display = (hostMgmt && !roomSettings.screen_share_enabled) ? 'none' : '';
                }
                if (reactionsBtn) {
                    reactionsBtn.style.display = (hostMgmt && !roomSettings.reactions_enabled) ? 'none' : '';
                }
                if (hostMgmt && !roomSettings.reactions_enabled && reactionsPopup) {
                    reactionsPopup.classList.remove('show');
                }

                // If host disables while actively sharing, stop immediately
                if (hostMgmt && !roomSettings.screen_share_enabled && typeof stopScreenShare === 'function') {
                    try { stopScreenShare(); } catch (_) { /* ignore */ }
                }

                // Chat input
                if (hostMgmt && !roomSettings.chat_enabled) {
                    chatInput.placeholder = 'Chat disabled by host';
                } else {
                    chatInput.placeholder = 'Type a message...';
                }

                // Screen share
                if (hostMgmt && !roomSettings.screen_share_enabled) {
                    screenShareBtn.classList.add('inactive');
                }
            }
        }

        if (participantsSearchEl) {
            participantsSearchEl.oninput = () => {
                if (isParticipantsSidebarOpen) updateParticipantsList();
            };
        }

        // Toggle handlers (send to backend)
        const toggleMap = [
            { id: 'toggleHostManagement', key: 'host_management_enabled' },
            { id: 'toggleChat', key: 'chat_enabled' },
            { id: 'toggleHostFirst', key: 'host_must_join_first' },
            { id: 'toggleScreenShare', key: 'screen_share_enabled' },
            { id: 'toggleReactions', key: 'reactions_enabled' },
            { id: 'toggleMic', key: 'participants_can_unmute' },
            { id: 'toggleVideo', key: 'participants_can_start_video' },
            { id: 'toggleLockMeeting', key: 'lock_meeting' },
            { id: 'toggleWaitingRoom', key: 'waiting_room_enabled' },
            { id: 'allowAskToJoin', key: 'allow_ask_to_join' },
        ];
        toggleMap.forEach(({ id, key }) => {
            const toggle = el(id);
            if (!toggle) return;
            toggle.onchange = () => {
                if (!canModerate) {
                    showToast('Only host/co-host can change settings', 'info');
                    applySettingsToUI(roomSettings);
                    return;
                }
                sendHostSettingsPatch({ [key]: toggle.checked });
            };
        });

        // =========================================================================
        // Raise Hand
        // =========================================================================
        raiseHandBtn.onclick = () => {
            isHandRaised = !isHandRaised;
            if (isHandRaised) {
                raiseHandBtn.classList.add('hand-raised');
                raiseHandBtn.classList.remove('inactive');
                showToast('Hand raised', 'back_hand');

                // Broadcast to others
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                        type: 'hand-raised',
                        data: { name: userName }
                    }));
                }
            } else {
                raiseHandBtn.classList.remove('hand-raised');
                raiseHandBtn.classList.add('inactive');
                showToast('Hand lowered', 'pan_tool_alt');

                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                        type: 'hand-lowered',
                        data: { name: userName }
                    }));
                }
            }
        };

        // =========================================================================
        // Reactions
        // =========================================================================
        reactionsBtn.onclick = (e) => {
            e.stopPropagation();
            if (!canModerate && roomSettings?.host_management_enabled && !roomSettings?.reactions_enabled) {
                showToast('Reactions are disabled by host', 'info');
                return;
            }
            reactionsPopup.classList.toggle('show');
            hostPopup.classList.remove('show');
        };

        // (Old showFloatingReaction removed - replaced with new version)

        // =========================================================================
        // Host Controls
        // =========================================================================
        if (hostControlsBtn) {
            hostControlsBtn.onclick = (e) => {
                e.stopPropagation();
                hostPopup.classList.toggle('show');
                reactionsPopup.classList.remove('show');
            };
        }

        if (muteAllBtn) {
            muteAllBtn.onclick = () => {
                hostPopup.classList.remove('show');
                sendWs({ type: 'host-mute-all', data: {} });
                showToast('Muting all participants', 'volume_off');
            };
        }

        if (copyInviteBtn) {
            copyInviteBtn.onclick = () => {
                navigator.clipboard.writeText(window.location.href);
                hostPopup.classList.remove('show');
                showToast('Invite link copied!', 'link');
            };
        }

        if (endMeetingBtn) {
            endMeetingBtn.onclick = () => {
                hostPopup.classList.remove('show');
                showToast('End meeting is available from Call History', 'info', 4000);
                setTimeout(() => (window.location.href = 'group_history.html'), 700);
            };
        }

        async function endMeetingForAll() {
            showToast('End meeting is available from Call History', 'info', 4000);
            setTimeout(() => (window.location.href = 'group_history.html'), 700);
        }

        // Close popups when clicking outside
        document.addEventListener('click', () => {
            reactionsPopup.classList.remove('show');
            hostPopup.classList.remove('show');
        });

        // =========================================================================
        // Room Management
        // =========================================================================
        async function joinRoom() {
            if (!roomId) {
                showToast('No room ID specified', 'error');
                return;
            }

            // Load ICE/TURN config before any peer connections get created.
            await loadRtcConfig();

            // Check room status first
            try {
                const checkRes = await fetch(`${API}/api/group-chat/${roomId}`, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });

                if (checkRes.status === 400 || checkRes.status === 404) {
                    const err = await checkRes.json();
                    if (err.detail && (err.detail.includes("ended") || err.detail.includes("not found"))) {
                        showEndedView();
                        return;
                    }
                }
            } catch (e) {
                console.log("Error checking room status", e);
            }

            // Get user profile
            if (token) {
                try {
                    const res = await fetch(`${API}/api/profile`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const profile = await res.json();
                        userId = profile.user_id;
                        userName = profile.name || 'Anonymous';
                    }
                } catch (_) { }
            }

            if (!userId) {
                userId = 'user-' + Math.random().toString(36).substr(2, 6);
            }

            // Connect WebSocket
            connectWebSocket();

            // Get microphone access
            try {
                localStream = await acquireMicrophoneStream();

                // If peer connections were created before mic permission resolved,
                // attach/replace the audio track now.
                try {
                    const aTrack = localStream.getAudioTracks?.()?.[0] || null;
                    if (aTrack) {
                        for (const [pid, s] of Object.entries(peerSenders || {})) {
                            if (s?.audio) {
                                try { await s.audio.replaceTrack(aTrack); } catch (_) { }
                            }
                        }
                    }
                } catch (_) { }
            } catch (err) {
                console.warn('Could not get microphone:', err);
                showToast('Microphone not available (check permissions/device)', 'warning');
            }
        }

        function showEndedView() {
            endedView.style.display = 'flex';
        }

        function cleanupRoom() {
            if (ws) {
                ws.close();
                ws = null;
            }

            if (localStream) {
                localStream.getTracks().forEach(t => t.stop());
                localStream = null;
            }

            if (screenStream) {
                screenStream.getTracks().forEach(t => t.stop());
                screenStream = null;
            }

            Object.values(peerConnections).forEach(pc => pc.close());
            peerConnections = {};

            roomId = null;
            isHost = false;
            isScreenSharing = false;
        }

        function leaveRoom() {
            cleanupRoom();
            window.location.href = 'create_meet.html';
        }

        function handleRoomEnded() {
            cleanupRoom();
            showEndedView();
        }

        // =========================================================================
        // WebSocket Connection
        // =========================================================================
        function connectWebSocket() {
            ws = new WebSocket(`${WS_BASE}/ws/group-chat/${roomId}`);

            ws.onopen = () => {
                console.log('[WS] Connected');
                ws.send(JSON.stringify({
                    type: 'join',
                    data: { user_id: userId, name: userName, token: token || null }
                }));
            };

            ws.onmessage = async (event) => {
                const msg = JSON.parse(event.data);
                await handleSignalingMessage(msg);
            };

            ws.onclose = () => {
                console.log('[WS] Disconnected');
            };

            ws.onerror = (err) => {
                console.error('[WS] Error:', err);
                showToast('Connection error', 'error');
            };
        }

        async function handleSignalingMessage(msg) {
            const { type, data, from_user_id } = msg;

            switch (type) {
                case 'room-info':
                    // Prefer rtc_config from WebSocket (works even when /api/* is not proxied on prod).
                    try {
                        const wsRtc = data.rtc_config;
                        if (wsRtc && Array.isArray(wsRtc.iceServers) && wsRtc.iceServers.length) {
                            rtcConfig = { ...rtcConfig, iceServers: wsRtc.iceServers };
                        }
                        if (wsRtc && typeof wsRtc.iceTransportPolicy === 'string') {
                            rtcConfig = { ...rtcConfig, iceTransportPolicy: wsRtc.iceTransportPolicy };
                        }

                        if (wsRtc && typeof wsRtc.turnConfigured === 'boolean') {
                            turnConfigured = wsRtc.turnConfigured;
                        }

                        // Deterministic behavior: if TURN is required/not configured, do not attempt WebRTC.
                        if (wsRtc && wsRtc.requireTurn && !wsRtc.turnConfigured) {
                            showToast('Meeting server is missing TURN configuration. Audio/screen share will not work on most networks.', 'warning', 8000);
                        }
                    } catch (_) { }
                    isHost = data.is_host;
                    canModerate = !!data.can_moderate;
                    myRole = data.role || (isHost ? 'host' : 'participant');
                    userId = data.your_user_id;
                    updateParticipants(data.participants);

                    if (data.settings) {
                        applySettingsToUI(data.settings);
                    }

                    // Show host tools section for host/co-host
                    if (hostToolsSection) {
                        hostToolsSection.style.display = canModerate ? 'block' : 'none';
                    }

                    // Populate join requests (waiting room)
                    if (canModerate && Array.isArray(data.pending) && data.pending.length) {
                        pendingParticipants = [...data.pending];
                        renderJoinRequests(data.pending);
                    } else {
                        if (joinRequestsSection) joinRequestsSection.style.display = 'none';
                        if (joinRequestsList) joinRequestsList.innerHTML = '';
                        pendingParticipants = [];
                    }

                    if (isParticipantsSidebarOpen) {
                        updateParticipantsList();
                    }

                    // Show host controls for host/co-host
                    if (canModerate) {
                        if (hostControlsContainer) {
                            hostControlsContainer.style.display = 'block';
                        }
                        if (hostControlsFab) {
                            hostControlsFab.style.display = 'flex';
                        }
                    } else {
                        if (hostControlsContainer) {
                            hostControlsContainer.style.display = 'none';
                        }
                        if (hostControlsFab) {
                            hostControlsFab.style.display = 'none';
                        }
                        // Close host controls sidebar if it was open
                        try {
                            hostControlsSidebar.classList.remove('open');
                            hostControlsFab.classList.remove('active');
                            isHostControlsSidebarOpen = false;
                        } catch (_) { }
                    }

                    if (data.screen_share_active) {
                        currentScreenSharerId = data.screen_sharer_id || null;
                        noScreenShare.innerHTML = `<span class="icon" style="font-size:80px;opacity:0.4;">screen_share</span><p class="text-lg font-medium mt-4">${data.screen_sharer_id === userId ? 'You are' : 'Someone is'} sharing screen</p>`;
                    }

                    // Only start WebRTC if TURN is configured when the server requires it.
                    const wsRtc = data.rtc_config;
                    rtcStartAllowed = !(wsRtc && wsRtc.requireTurn && !wsRtc.turnConfigured);
                    if (rtcStartAllowed) {
                        for (const p of data.participants) {
                            if (p.user_id !== userId) {
                                await createPeerConnection(p.user_id, false);
                            }
                        }
                    }
                    break;

                case 'room-ended':
                    showToast('The host has ended the meeting.', 'call_end');
                    setTimeout(handleRoomEnded, 2000);
                    break;

                case 'user-joined':
                    showToast(`${data.name} joined`, 'person_add');
                    addParticipant(data);
                    if (rtcStartAllowed && data.user_id !== userId) {
                        await createPeerConnection(data.user_id, false);
                    }
                    break;

                case 'user-left':
                    showToast(`${data.name} left`, 'person_remove');
                    removeParticipant(data.user_id);
                    if (peerConnections[data.user_id]) {
                        peerConnections[data.user_id].close();
                        delete peerConnections[data.user_id];
                    }
                    try {
                        const a = peerSenders?.[data.user_id]?.audioEl;
                        if (a) a.remove();
                    } catch (_) { }
                    try { delete peerSenders?.[data.user_id]; } catch (_) { }
                    try { delete makingOffer?.[data.user_id]; } catch (_) { }
                    try { delete ignoreOffer?.[data.user_id]; } catch (_) { }
                    try { delete pendingIce?.[data.user_id]; } catch (_) { }
                    break;

                case 'offer':
                    await handleOffer(from_user_id, data);
                    break;

                case 'answer':
                    await handleAnswer(from_user_id, data);
                    break;

                case 'ice-candidate':
                    await handleIceCandidate(from_user_id, data);
                    break;

                case 'screen-share-started':
                    currentScreenSharerId = data.sharer_id || null;
                    noScreenShare.innerHTML = `<span class="icon" style="font-size:80px;opacity:0.4;animation:pulse 2s infinite;">screen_share</span><p class="text-lg font-medium mt-4">${data.sharer_name} is sharing screen</p>`;
                    break;

                case 'screen-share-stopped':
                    if (!data.sharer_id || currentScreenSharerId === data.sharer_id) {
                        currentScreenSharerId = null;
                    }
                    noScreenShare.innerHTML = `<span class="icon" style="font-size:80px;opacity:0.4;">screen_share</span><p class="text-lg font-medium mt-4">No screen being shared</p><p class="text-sm opacity-60 mt-2">Click "Share Screen" to present</p>`;
                    screenShareVideo.classList.add('hidden');
                    noScreenShare.classList.remove('hidden');
                    break;

                case 'chat-message':
                    addChatMessage(data);
                    if (!isChatOpen) {
                        unreadMessages++;
                        chatBadge.textContent = unreadMessages > 9 ? '9+' : unreadMessages;
                        chatBadge.style.display = 'flex';
                    }
                    break;

                case 'reaction':
                    showFloatingReaction(data.emoji, data.name);
                    break;

                case 'hand-raised':
                    showToast(`${data.name} raised hand`, 'back_hand');
                    break;

                case 'hand-lowered':
                    showToast(`${data.name} lowered hand`, 'pan_tool_alt');
                    break;

                case 'settings-updated':
                    if (data && data.settings) {
                        applySettingsToUI(data.settings);
                        showToast('Host settings updated', 'tune');
                    }
                    break;

                case 'participants-updated':
                    if (data && Array.isArray(data.participants)) {
                        updateParticipants(data.participants);
                    }
                    break;

                case 'host-mute':
                    // Force local mute if possible
                    try {
                        if (localStream && localStream.getAudioTracks().length) {
                            localStream.getAudioTracks()[0].enabled = false;
                        }
                        isMuted = true;
                        micBtn.classList.remove('active');
                        micBtn.classList.add('muted');
                        micBtn.innerHTML = '<span class="icon">mic_off</span>';
                        showToast('You were muted by the host', 'volume_off', 4000);
                    } catch (_) {
                        showToast('Muted by the host', 'volume_off', 4000);
                    }
                    break;

                case 'host-unmute':
                    // Allow local unmute if possible
                    try {
                        if (localStream && localStream.getAudioTracks().length) {
                            localStream.getAudioTracks()[0].enabled = true;
                        }
                        isMuted = false;
                        micBtn.classList.add('active');
                        micBtn.classList.remove('muted');
                        micBtn.innerHTML = '<span class="icon">mic</span>';
                        showToast('You were unmuted by the host', 'volume_up', 3000);
                    } catch (_) {
                        showToast('Unmuted by the host', 'volume_up', 3000);
                    }
                    break;

                case 'kicked':
                    showToast('You were removed from the meeting', 'person_remove', 4000);
                    setTimeout(leaveRoom, 1200);
                    break;

                case 'join-denied':
                    showToast(`Join denied: ${data?.reason || 'not allowed'}`, 'error', 5000);
                    setTimeout(leaveRoom, 1200);
                    break;

                case 'waiting-room':
                    showToast(data?.message || 'Waiting for host...', 'hourglass_top', 4000);
                    break;

                case 'admitted':
                    showToast('You were admitted to the meeting', 'check_circle');
                    if (data && data.settings) applySettingsToUI(data.settings);
                    if (data && Array.isArray(data.participants)) updateParticipants(data.participants);
                    // Create peer connections for others
                    if (rtcStartAllowed) {
                        for (const p of (data.participants || [])) {
                            if (p.user_id !== userId) {
                                await createPeerConnection(p.user_id, false);
                            }
                        }
                    }
                    break;

                case 'join-request':
                    if (canModerate) {
                        showToast(`${data.name} is requesting to join`, 'person_add');
                        if (data && data.user_id) {
                            const exists = pendingParticipants.some(p => p.user_id === data.user_id);
                            if (!exists) pendingParticipants.push({ user_id: data.user_id, name: data.name || 'Anonymous' });
                        }
                        renderJoinRequests([data]);

                        if (isParticipantsSidebarOpen) {
                            updateParticipantsList();
                        }
                    }
                    break;

                case 'annotation-draw':
                    if (data) {
                        drawMarkerStroke(data);
                    }
                    break;

                case 'annotation-clear':
                    clearMarkerCanvas(false);
                    break;
            }
        }

        function ensureMarkerCanvas() {
            if (!markerCanvas) return;
            if (!markerCtx) {
                markerCtx = markerCanvas.getContext('2d');
            }
            const dpr = window.devicePixelRatio || 1;
            const w = Math.floor(window.innerWidth * dpr);
            const h = Math.floor(window.innerHeight * dpr);
            if (markerCanvas.width !== w || markerCanvas.height !== h) {
                markerCanvas.width = w;
                markerCanvas.height = h;
                markerCanvas.style.width = '100vw';
                markerCanvas.style.height = '100vh';
                markerCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
                markerCtx.lineCap = 'round';
                markerCtx.lineJoin = 'round';
            }
        }

        function setMarkerUIVisible(visible) {
            if (!markerFab || !markerCanvas || !markerToolkit) return;
            // FAB only when local screen sharing
            markerFab.style.display = (visible && isScreenSharing) ? 'flex' : 'none';
            if (!visible) {
                markerToolkit.style.display = 'none';
                markerCanvas.style.display = 'none';
                markerCanvas.style.pointerEvents = 'none';
                markerEnabled = false;
            }
        }

        function setMarkerEnabled(enabled) {
            if (!markerCanvas || !markerToolkit) return;
            ensureMarkerCanvas();
            markerEnabled = !!enabled;
            markerCanvas.style.display = markerEnabled ? 'block' : 'none';
            markerCanvas.style.pointerEvents = markerEnabled ? 'auto' : 'none';
            markerToolkit.style.display = markerEnabled ? 'flex' : 'none';
        }

        function clearMarkerCanvas(broadcast = true) {
            if (!markerCanvas) return;
            ensureMarkerCanvas();
            markerCtx.clearRect(0, 0, markerCanvas.width, markerCanvas.height);
            if (broadcast && ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'annotation-clear', data: {} }));
            }
        }

        function drawMarkerStroke(stroke) {
            if (!markerCanvas) return;
            ensureMarkerCanvas();
            const tool = stroke.tool || 'pen';
            const color = stroke.color || '#ff0000';
            const size = Number(stroke.size || 6);
            const points = Array.isArray(stroke.points) ? stroke.points : [];
            if (points.length < 2) return;

            markerCtx.save();
            if (tool === 'eraser') {
                markerCtx.globalCompositeOperation = 'destination-out';
                markerCtx.strokeStyle = 'rgba(0,0,0,1)';
            } else {
                markerCtx.globalCompositeOperation = 'source-over';
                markerCtx.strokeStyle = color;
            }
            markerCtx.lineWidth = size;
            markerCtx.beginPath();
            markerCtx.moveTo(points[0].x * window.innerWidth, points[0].y * window.innerHeight);
            for (let i = 1; i < points.length; i++) {
                markerCtx.lineTo(points[i].x * window.innerWidth, points[i].y * window.innerHeight);
            }
            markerCtx.stroke();
            markerCtx.restore();
        }

        function markerPointerToNorm(e) {
            const x = Math.max(0, Math.min(1, e.clientX / window.innerWidth));
            const y = Math.max(0, Math.min(1, e.clientY / window.innerHeight));
            return { x, y };
        }

        function sendMarkerStroke(points) {
            if (!ws || ws.readyState !== WebSocket.OPEN) return;
            ws.send(JSON.stringify({
                type: 'annotation-draw',
                data: {
                    tool: markerTool,
                    color: markerColorEl?.value || '#ff0000',
                    size: Number(markerSizeEl?.value || 6),
                    points,
                }
            }));
        }

        if (markerFab) {
            markerFab.onclick = () => {
                if (!isScreenSharing) {
                    showToast('Start screen share to use marker', 'info');
                    return;
                }
                setMarkerEnabled(!markerEnabled);
            };
        }

        if (markerPenBtn && markerEraserBtn) {
            markerPenBtn.onclick = () => {
                markerTool = 'pen';
                markerPenBtn.classList.add('active');
                markerPenBtn.classList.remove('inactive');
                markerEraserBtn.classList.add('inactive');
                markerEraserBtn.classList.remove('active');
            };
            markerEraserBtn.onclick = () => {
                markerTool = 'eraser';
                markerEraserBtn.classList.add('active');
                markerEraserBtn.classList.remove('inactive');
                markerPenBtn.classList.add('inactive');
                markerPenBtn.classList.remove('active');
            };
        }

        if (markerClearBtn) markerClearBtn.onclick = () => clearMarkerCanvas(true);
        if (markerCloseBtn) markerCloseBtn.onclick = () => setMarkerEnabled(false);

        if (markerCanvas) {
            const onDown = (e) => {
                if (!markerEnabled) return;
                markerDrawing = true;
                markerPrev = markerPointerToNorm(e);
                e.preventDefault();
            };
            const onMove = (e) => {
                if (!markerEnabled || !markerDrawing) return;
                const cur = markerPointerToNorm(e);
                const points = [markerPrev, cur];
                drawMarkerStroke({ tool: markerTool, color: markerColorEl?.value || '#ff0000', size: Number(markerSizeEl?.value || 6), points });
                sendMarkerStroke(points);
                markerPrev = cur;
                e.preventDefault();
            };
            const onUp = () => {
                markerDrawing = false;
                markerPrev = null;
            };
            markerCanvas.addEventListener('pointerdown', onDown);
            window.addEventListener('pointermove', onMove);
            window.addEventListener('pointerup', onUp);
            window.addEventListener('pointercancel', onUp);
        }

        window.addEventListener('resize', () => {
            if (markerCanvas && markerCanvas.style.display !== 'none') {
                ensureMarkerCanvas();
            }
        });

        function renderJoinRequests(requests) {
            if (!joinRequestsSection || !joinRequestsList) return;
            joinRequestsSection.style.display = 'block';

            // Merge with any existing items by unique user_id
            const existing = new Set(Array.from(joinRequestsList.querySelectorAll('[data-uid]')).map(n => n.getAttribute('data-uid')));
            requests.forEach(r => {
                if (!r || !r.user_id || existing.has(r.user_id)) return;
                const row = document.createElement('div');
                row.className = 'flex items-center justify-between gap-2 rounded-xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/5 px-3 py-2';
                row.setAttribute('data-uid', r.user_id);
                row.innerHTML = `
                    <div class="text-sm">
                        <div class="font-medium">${r.name || 'Anonymous'}</div>
                        <div class="text-xs opacity-60">Request to join</div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button class="px-3 py-1.5 rounded-lg text-sm font-semibold" style="background: var(--brand-gradient); color: white;">Admit</button>
                        <button class="px-3 py-1.5 rounded-lg text-sm" style="background: rgba(239,68,68,0.12); color: inherit;">Deny</button>
                    </div>
                `;
                const [admitBtn, denyBtn] = row.querySelectorAll('button');
                admitBtn.onclick = () => {
                    sendWs({ type: 'host-admit', target_user_id: r.user_id, data: {} });
                    row.remove();

                    pendingParticipants = pendingParticipants.filter(p => p.user_id !== r.user_id);
                    if (isParticipantsSidebarOpen) updateParticipantsList();
                };
                denyBtn.onclick = () => {
                    sendWs({ type: 'host-kick', target_user_id: r.user_id, data: { reason: 'denied' } });
                    row.remove();

                    pendingParticipants = pendingParticipants.filter(p => p.user_id !== r.user_id);
                    if (isParticipantsSidebarOpen) updateParticipantsList();
                };
                joinRequestsList.appendChild(row);
            });

            if (!joinRequestsList.children.length) {
                joinRequestsSection.style.display = 'none';
            }
        }

        // =========================================================================
        // Floating Reactions
        // =========================================================================
        function showFloatingReaction(reactionSrc, name = 'Someone') {
            const container = document.createElement('div');
            container.className = 'floating-reaction';
            container.style.left = `${50 + (Math.random() - 0.5) * 40}%`; // Spread out more (-20% to +20%)

            // Reaction Image (SVG)
            const img = document.createElement('img');
            img.src = reactionSrc;
            img.className = 'reaction-image';
            img.style.width = '100px';  // Increased size
            img.style.height = '100px'; // Increased size
            img.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))';

            // Name label
            const nameSpan = document.createElement('span');
            nameSpan.className = 'reaction-name';
            nameSpan.textContent = name;

            container.appendChild(img);
            container.appendChild(nameSpan);
            document.body.appendChild(container);

            setTimeout(() => container.remove(), 10000); // Increased duration
        }

        // =========================================================================
        // UI Handlers (updated)
        // =========================================================================
        reactionsBtn.onclick = (e) => {
            e.stopPropagation();
            reactionsPopup.classList.toggle('show');
            hostPopup.classList.remove('show');
        };

        document.querySelectorAll('.reaction-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                // Get the image source from the data-reaction attribute
                const reactionSrc = btn.dataset.reaction;
                reactionsPopup.classList.remove('show');

                const hostMgmt = !!roomSettings.host_management_enabled;
                if (!canModerate && hostMgmt && !roomSettings.reactions_enabled) {
                    showToast('Reactions disabled by host', 'info');
                    return;
                }

                // Show floating reaction locally
                showFloatingReaction(reactionSrc, 'You');

                // Broadcast to others
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                        type: 'reaction',
                        data: { emoji: reactionSrc, name: userName } // using 'emoji' key to match backend payload structure
                    }));
                }
            };
        });

        // =========================================================================
        // WebRTC Peer Connections
        // =========================================================================
        let rtcStartAllowed = true;
        let turnConfigured = false;
        let warnedTurnOnce = false;
        const iceRestarting = {};
        let rtcConfig = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun.cloudflare.com:3478' },
            ],
            iceCandidatePoolSize: 10,
            iceTransportPolicy: 'all'
        };

        async function loadRtcConfig() {
            try {
                const res = await fetch(`${API}/api/rtc-config`);
                if (!res.ok) {
                    if (res.status === 503) {
                        try {
                            const err = await res.json();
                            showToast(err?.detail || 'TURN not configured (WebRTC will be unreliable)', 'warning', 6000);
                        } catch (_) {
                            showToast('TURN not configured (WebRTC will be unreliable)', 'warning', 6000);
                        }
                    }
                    return;
                }
                const cfg = await res.json();
                if (cfg && Array.isArray(cfg.iceServers) && cfg.iceServers.length) {
                    rtcConfig = { ...rtcConfig, iceServers: cfg.iceServers };
                }
                if (cfg && typeof cfg.iceTransportPolicy === 'string') {
                    rtcConfig = { ...rtcConfig, iceTransportPolicy: cfg.iceTransportPolicy };
                }
                if (cfg && typeof cfg.turnConfigured === 'boolean') {
                    turnConfigured = cfg.turnConfigured;
                }
            } catch (_) { }
        }

        let makingOffer = {};
        let ignoreOffer = {};
        let pendingIce = {};
        let peerSenders = {};
        let peerRecvStreams = {};
        let currentScreenSharerId = null;

        async function acquireMicrophoneStream() {
            if (!navigator.mediaDevices?.getUserMedia) {
                throw new Error('getUserMedia not supported');
            }

            // Fast path
            try {
                return await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            } catch (err) {
                // Fall back to enumerating devices (helps when default device is missing/broken)
                const name = err?.name || '';
                if (!navigator.mediaDevices?.enumerateDevices || (name !== 'NotFoundError' && name !== 'OverconstrainedError' && name !== 'AbortError')) {
                    throw err;
                }
            }

            const devices = await navigator.mediaDevices.enumerateDevices();
            const mics = devices.filter(d => d.kind === 'audioinput');
            if (!mics.length) {
                const e = new Error('No microphone devices found');
                e.name = 'NotFoundError';
                throw e;
            }

            let lastErr = null;
            for (const mic of mics) {
                try {
                    return await navigator.mediaDevices.getUserMedia({
                        audio: { deviceId: mic.deviceId ? { exact: mic.deviceId } : undefined },
                        video: false
                    });
                } catch (e) {
                    lastErr = e;
                }
            }
            throw lastErr || new Error('Could not acquire microphone');
        }

        // Remote audio playback (one <audio> per peer)
        const remoteAudioContainer = (() => {
            const el = document.createElement('div');
            el.id = 'remoteAudioContainer';
            el.style.display = 'none';
            document.body.appendChild(el);
            return el;
        })();

        function ensureMediaPlays(mediaEl) {
            if (!mediaEl) return;
            try {
                const p = mediaEl.play?.();
                if (p && typeof p.catch === 'function') {
                    p.catch(() => {
                        // Autoplay may be blocked on mobile until user interaction.
                        const once = () => {
                            document.removeEventListener('click', once, true);
                            try { mediaEl.play?.(); } catch (_) { }
                        };
                        document.addEventListener('click', once, true);
                    });
                }
            } catch (_) { }
        }

        async function flushPendingIce(peerId) {
            const pc = peerConnections[peerId];
            if (!pc || !pc.remoteDescription) return;
            const q = pendingIce[peerId] || [];
            pendingIce[peerId] = [];
            for (const c of q) {
                try { await pc.addIceCandidate(c); } catch (_) { }
            }
        }

        async function createPeerConnection(peerId, isInitiator) {
            if (peerConnections[peerId]) return peerConnections[peerId];

            const pc = new RTCPeerConnection(rtcConfig);
            peerConnections[peerId] = pc;
            makingOffer[peerId] = false;
            ignoreOffer[peerId] = false;

            pendingIce[peerId] = [];
            peerSenders[peerId] = { audio: null, video: null, audioEl: null };

            // Create transceivers up-front to stabilize renegotiation and allow replaceTrack.
            try {
                const at = pc.addTransceiver('audio', { direction: 'sendrecv' });
                peerSenders[peerId].audio = at.sender;
            } catch (_) { }
            try {
                const vt = pc.addTransceiver('video', { direction: 'sendrecv' });
                peerSenders[peerId].video = vt.sender;
            } catch (_) { }

            // Attach local audio if available
            try {
                const track = localStream?.getAudioTracks?.()?.[0] || null;
                if (peerSenders[peerId].audio && track) {
                    await peerSenders[peerId].audio.replaceTrack(track);
                }
            } catch (_) { }

            // Attach local screen track if currently sharing
            try {
                const vtrack = (isScreenSharing && screenStream?.getVideoTracks?.()?.[0]) ? screenStream.getVideoTracks()[0] : null;
                if (peerSenders[peerId].video) {
                    await peerSenders[peerId].video.replaceTrack(vtrack);
                }
            } catch (_) { }

            pc.onicecandidate = ({ candidate }) => {
                if (!candidate) return;
                // ICE candidates are frequent; never spam UI if WS is briefly unavailable.
                sendWs({
                    type: 'ice-candidate',
                    data: candidate,
                    target_user_id: peerId
                }, { silent: true });
            };

            pc.onicecandidateerror = (e) => {
                // STUN can fail on many mobile/corporate networks (UDP blocked / broken IPv6). That's normal.
                // If TURN is configured, STUN errors are usually harmless noise.
                const url = String(e?.url || '');
                if (turnConfigured && url.startsWith('stun:')) return;

                console.warn('ICE candidate error', peerId, e);

                if (!turnConfigured && !warnedTurnOnce && url.startsWith('stun:')) {
                    warnedTurnOnce = true;
                    showToast('Network is blocking STUN (WebRTC). Configure TURN for reliable audio/screen sharing.', 'warning', 7000);
                }
            };

            pc.ontrack = (event) => {
                const kind = event.track?.kind;
                if (!kind) return;

                // Firefox / some Unified Plan flows may not populate event.streams.
                let stream = (event.streams && event.streams[0]) ? event.streams[0] : null;
                if (!stream) {
                    peerRecvStreams[peerId] ||= { audio: new MediaStream(), video: new MediaStream() };
                    stream = kind === 'audio' ? peerRecvStreams[peerId].audio : peerRecvStreams[peerId].video;
                    try {
                        // Remove existing track of same kind to avoid accumulation.
                        for (const t of stream.getTracks()) {
                            if (t.kind === kind) stream.removeTrack(t);
                        }
                        stream.addTrack(event.track);
                    } catch (_) { }
                }

                if (kind === 'audio') {
                    let audioEl = peerSenders[peerId]?.audioEl;
                    if (!audioEl) {
                        audioEl = document.createElement('audio');
                        audioEl.autoplay = true;
                        audioEl.playsInline = true;
                        audioEl.muted = false;
                        remoteAudioContainer.appendChild(audioEl);
                        peerSenders[peerId].audioEl = audioEl;
                    }
                    audioEl.srcObject = stream;
                    ensureMediaPlays(audioEl);
                    return;
                }

                if (kind === 'video') {
                    // In a mesh call, multiple peers may have video m-lines; only show the active screen sharer.
                    if (currentScreenSharerId && peerId !== currentScreenSharerId) {
                        return;
                    }
                    screenShareVideo.srcObject = stream;
                    // Keep muted to maximize autoplay success on mobile.
                    screenShareVideo.muted = true;
                    screenShareVideo.classList.remove('hidden');
                    noScreenShare.classList.add('hidden');
                    ensureMediaPlays(screenShareVideo);
                }
            };

            pc.onnegotiationneeded = async () => {
                try {
                    makingOffer[peerId] = true;
                    await pc.setLocalDescription();
                    sendWs({
                        type: 'offer',
                        data: pc.localDescription,
                        target_user_id: peerId
                    }, { silent: true });
                } catch (err) {
                    console.error(err);
                } finally {
                    makingOffer[peerId] = false;
                }
            };

            async function tryIceRestart(reason = 'unknown') {
                if (iceRestarting[peerId]) return;
                if (!rtcStartAllowed) return;
                if (!peerConnections[peerId]) return;
                // Deterministic offerer: the "smaller" id initiates restarts.
                const iAmOfferer = String(userId) < String(peerId);
                if (!iAmOfferer) return;
                if (pc.signalingState !== 'stable') return;
                try {
                    iceRestarting[peerId] = true;
                    const offer = await pc.createOffer({ iceRestart: true });
                    await pc.setLocalDescription(offer);
                    sendWs({
                        type: 'offer',
                        data: pc.localDescription,
                        target_user_id: peerId,
                        data2: { iceRestart: true, reason }
                    }, { silent: true });
                } catch (e) {
                    console.warn('ICE restart failed', peerId, e);
                } finally {
                    iceRestarting[peerId] = false;
                }
            }

            pc.oniceconnectionstatechange = () => {
                if (pc.iceConnectionState === 'failed') {
                    console.warn('ICE failed for peer', peerId);
                    // restartIce() alone is not always enough; perform an ICE-restart offer.
                    try { pc.restartIce(); } catch { }
                    tryIceRestart('iceConnectionState=failed');
                }
                if (pc.iceConnectionState === 'disconnected') {
                    // Many mobile networks flap; try an ICE restart if it stays disconnected.
                    setTimeout(() => {
                        const cur = peerConnections[peerId];
                        if (!cur) return;
                        if (cur.iceConnectionState === 'disconnected') {
                            tryIceRestart('iceConnectionState=disconnected');
                        }
                    }, 6000);
                }
            };

            pc.onconnectionstatechange = () => {
                if (pc.connectionState === 'failed') {
                    console.warn('Peer connection failed', peerId);
                    tryIceRestart('connectionState=failed');
                }
                if (pc.connectionState === 'disconnected') {
                    setTimeout(() => {
                        const cur = peerConnections[peerId];
                        if (!cur) return;
                        if (cur.connectionState === 'disconnected') {
                            tryIceRestart('connectionState=disconnected');
                        }
                    }, 6000);
                }
            };

            return pc;
        }

        async function handleOffer(peerId, offer) {
            const pc = await createPeerConnection(peerId, false);
            const polite = userId > peerId;

            const offerCollision = makingOffer[peerId] || pc.signalingState !== 'stable';
            // Perfect negotiation: ignore ONLY this offer if we're impolite and there's a collision.
            // Important: don't leave ignoreOffer stuck "true" forever (that forces users to refresh).
            const shouldIgnore = offerCollision && !polite;
            ignoreOffer[peerId] = shouldIgnore;
            if (shouldIgnore) return;

            try {
                // Perfect negotiation: polite peer rolls back local offer on collision.
                if (offerCollision && polite) {
                    try { await pc.setLocalDescription({ type: 'rollback' }); } catch (_) { }
                }
                await pc.setRemoteDescription(offer);
                await flushPendingIce(peerId);
            } catch (e) {
                console.warn('setRemoteDescription(offer) failed', e);
                return;
            }
            await pc.setLocalDescription();
            sendWs({
                type: 'answer',
                data: pc.localDescription,
                target_user_id: peerId
            }, { silent: true });
        }

        async function handleAnswer(peerId, answer) {
            const pc = peerConnections[peerId];
            if (!pc) return;
            try {
                await pc.setRemoteDescription(answer);
                await flushPendingIce(peerId);
            } catch (e) {
                console.warn('setRemoteDescription(answer) failed', e);
            }
        }

        async function handleIceCandidate(peerId, candidate) {
            const pc = peerConnections[peerId];
            if (!pc) return;
            try {
                // Queue candidates until remoteDescription is set.
                if (!pc.remoteDescription) {
                    (pendingIce[peerId] ||= []).push(candidate);
                    return;
                }
                await pc.addIceCandidate(candidate);
            } catch (err) {
                if (!ignoreOffer[peerId]) console.warn(err);
            }
        }

        // =========================================================================
        // Media Controls
        // =========================================================================
        micBtn.onclick = async () => {
            if (!localStream) {
                try {
                    localStream = await acquireMicrophoneStream();
                    const aTrack = localStream.getAudioTracks?.()?.[0] || null;
                    if (aTrack) {
                        for (const [pid, s] of Object.entries(peerSenders || {})) {
                            if (s?.audio) {
                                try { await s.audio.replaceTrack(aTrack); } catch (_) { }
                            }
                        }
                    }
                } catch (err) {
                    console.warn('Could not get microphone:', err);
                    showToast('Microphone not available (check permissions/device)', 'warning');
                    return;
                }
            }

            const hostMgmt = !!roomSettings.host_management_enabled;
            if (!canModerate && hostMgmt && !roomSettings.participants_can_unmute && isMuted) {
                showToast('Unmute disabled by host', 'info');
                return;
            }
            isMuted = !isMuted;
            localStream.getAudioTracks()[0].enabled = !isMuted;

            if (isMuted) {
                micBtn.classList.remove('active');
                micBtn.classList.add('muted');
                micBtn.innerHTML = '<span class="icon">mic_off</span>';
            } else {
                micBtn.classList.add('active');
                micBtn.classList.remove('muted');
                micBtn.innerHTML = '<span class="icon">mic</span>';
            }
        };

        screenShareBtn.onclick = async () => {
            const hostMgmt = !!roomSettings.host_management_enabled;
            if (!canModerate && hostMgmt && !roomSettings.screen_share_enabled) {
                showToast('Screen sharing disabled by host', 'info');
                return;
            }
            if (isScreenSharing) {
                stopScreenShare();
            } else {
                try {
                    screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                    screenStream.getVideoTracks()[0].onended = stopScreenShare;

                    const track = screenStream.getVideoTracks()[0];
                    // Prefer replaceTrack to avoid accumulating multiple senders.
                    for (const [pid, pc] of Object.entries(peerConnections)) {
                        const s = peerSenders[pid]?.video;
                        if (s) {
                            try { await s.replaceTrack(track); } catch (_) { }
                        } else {
                            try { pc.addTrack(track, screenStream); } catch (_) { }
                        }
                    }

                    isScreenSharing = true;
                    screenShareBtn.classList.add('active');
                    screenShareBtn.classList.remove('inactive');

                    currentScreenSharerId = userId;

                    // Marker toolkit available while screen sharing
                    setMarkerUIVisible(true);

                    sendWs({
                        type: 'screen-share-started',
                        data: { sharer_name: userName }
                    }, { silent: true });
                } catch (err) {
                    console.error('Screen share error:', err);
                    if (err && err.name === 'NotAllowedError') {
                        showToast('Screen share permission was denied (click Share Screen and allow the prompt)', 'warning', 6000);
                    } else {
                        showToast('Screen share failed', 'warning', 4000);
                    }
                }
            }
        };

        function stopScreenShare() {
            if (!isScreenSharing) return;

            if (screenStream) {
                screenStream.getTracks().forEach(t => t.stop());
                screenStream = null;
            }

            isScreenSharing = false;
            screenShareBtn.classList.remove('active');
            screenShareBtn.classList.add('inactive');

            if (currentScreenSharerId === userId) currentScreenSharerId = null;

            // Hide marker toolkit and clear canvas
            setMarkerUIVisible(false);
            try { clearMarkerCanvas(true); } catch (_) { }

            // Remove outbound screen track
            for (const [pid, s] of Object.entries(peerSenders)) {
                if (s?.video) {
                    try { s.video.replaceTrack(null); } catch (_) { }
                }
            }

            sendWs({
                type: 'screen-share-stopped',
                data: {}
            }, { silent: true });
        }

        // Whiteboard button - opens new page
        whiteboardBtn.onclick = () => {
            window.open(`whiteboard.html?room=${roomId}`, '_blank');
        };

        // =========================================================================
        // Participants
        // =========================================================================
        let participantsData = [];

        function updateParticipants(list) {
            participantsData = list;
            participantAvatars.innerHTML = '';
            participantCount.textContent = `${list.length} in call`;
            participantsCountEl.textContent = `(${list.length})`;

            const colors = ['#9E4B8A', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4'];

            list.slice(0, 5).forEach((p, i) => {
                const avatar = document.createElement('div');
                avatar.className = 'participant-avatar';
                avatar.style.background = colors[i % colors.length];
                avatar.textContent = p.name[0].toUpperCase();
                avatar.title = p.name + (p.is_host ? ' (Host)' : '') + (p.user_id === userId ? ' (You)' : '');
                participantAvatars.appendChild(avatar);
            });

            if (list.length > 5) {
                const more = document.createElement('div');
                more.className = 'participant-avatar';
                more.style.background = 'rgba(0,0,0,0.3)';
                more.textContent = `+${list.length - 5}`;
                participantAvatars.appendChild(more);
            }

            // Update sidebar if open
            if (isParticipantsSidebarOpen) {
                updateParticipantsList();
            }
        }

        function updateParticipantsList() {
            const colors = ['#9E4B8A', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4'];

            const q = (participantsSearchEl?.value || '').trim().toLowerCase();
            const matchesQuery = (p) => {
                if (!q) return true;
                const name = String(p?.name || '').toLowerCase();
                const uid = String(p?.user_id || '').toLowerCase();
                return name.includes(q) || uid.includes(q);
            };

            const visibleParticipants = (participantsData || []).filter(matchesQuery);
            const visiblePending = (canModerate ? (pendingParticipants || []).filter(matchesQuery) : []);

            if (visibleParticipants.length === 0 && visiblePending.length === 0) {
                participantsList.innerHTML = `
                    <div class="text-center py-8 opacity-50">
                        <span class="icon text-4xl mb-2">person_search</span>
                        <p class="text-sm">No participants yet</p>
                    </div>
                `;
                return;
            }

            participantsList.innerHTML = '';

            if (canModerate && visiblePending.length) {
                const header = document.createElement('div');
                header.className = 'px-2 pt-1 pb-2 text-xs font-semibold opacity-60';
                header.textContent = `Waiting (${visiblePending.length})`;
                participantsList.appendChild(header);

                visiblePending.forEach((p) => {
                    const row = document.createElement('div');
                    row.className = 'participant-item';
                    row.innerHTML = `
                        <div class="participant-avatar-lg" style="background: rgba(245, 158, 11, 0.85)">W</div>
                        <div class="participant-info">
                            <div class="participant-name">${p.name || 'Anonymous'}</div>
                            <div class="participant-role">Waiting to be admitted</div>
                        </div>
                        <div class="flex items-center gap-2">
                            <button class="px-2.5 py-1.5 rounded-lg text-xs font-semibold" style="background: var(--brand-gradient); color: white;">Admit</button>
                            <button class="px-2.5 py-1.5 rounded-lg text-xs" style="background: rgba(239,68,68,0.18);">Deny</button>
                        </div>
                    `;
                    const [admitBtn, denyBtn] = row.querySelectorAll('button');
                    admitBtn.onclick = () => {
                        sendWs({ type: 'host-admit', target_user_id: p.user_id, data: {} });
                        pendingParticipants = pendingParticipants.filter(x => x.user_id !== p.user_id);
                        updateParticipantsList();
                    };
                    denyBtn.onclick = () => {
                        sendWs({ type: 'host-kick', target_user_id: p.user_id, data: { reason: 'denied' } });
                        pendingParticipants = pendingParticipants.filter(x => x.user_id !== p.user_id);
                        updateParticipantsList();
                    };
                    participantsList.appendChild(row);
                });

                const divider = document.createElement('div');
                divider.className = 'my-2 border-t border-black/5 dark:border-white/10';
                participantsList.appendChild(divider);
            }

            visibleParticipants.forEach((p, i) => {
                const role = p.role || (p.is_host ? 'host' : 'participant');
                const roleLabel = role === 'host' ? 'Host' : (role === 'cohost' ? 'Co-host' : 'Participant');

                const item = document.createElement('div');
                item.className = 'participant-item';
                item.innerHTML = `
                    <div class="participant-avatar-lg" style="background: ${colors[i % colors.length]}">
                        ${p.name[0].toUpperCase()}
                    </div>
                    <div class="participant-info">
                        <div class="participant-name">${p.name}${p.user_id === userId ? ' (You)' : ''}${p.muted ? ' <span class="text-xs opacity-60">(Muted)</span>' : ''}</div>
                        <div class="participant-role">${roleLabel}</div>
                    </div>
                    ${canModerate && p.user_id !== userId && role !== 'host' ? `
                        <div class="flex items-center gap-2">
                            <button class="px-2.5 py-1.5 rounded-lg text-xs font-semibold" data-action="mute" data-uid="${p.user_id}" data-muted="${p.muted ? '1' : '0'}" style="background: rgba(239,68,68,0.10);">${p.muted ? 'Unmute' : 'Mute'}</button>
                            <button class="px-2.5 py-1.5 rounded-lg text-xs" data-action="kick" data-uid="${p.user_id}" style="background: rgba(239,68,68,0.18);">Remove</button>
                            <button class="px-2.5 py-1.5 rounded-lg text-xs" data-action="role" data-uid="${p.user_id}" data-role="${role === 'cohost' ? 'participant' : 'cohost'}" style="background: rgba(158,75,138,0.14);">${role === 'cohost' ? 'Remove co-host' : 'Make co-host'}</button>
                        </div>
                    ` : ''}
                `;

                // Wire action buttons
                if (canModerate && p.user_id !== userId && role !== 'host') {
                    item.querySelectorAll('button[data-action]').forEach(btn => {
                        btn.onclick = () => {
                            const uid = btn.getAttribute('data-uid');
                            const action = btn.getAttribute('data-action');
                            if (!uid) return;

                            if (action === 'mute') {
                                const isMutedTarget = btn.getAttribute('data-muted') === '1';
                                if (isMutedTarget) {
                                    sendWs({ type: 'host-unmute-user', target_user_id: uid, data: {} });
                                    showToast('Unmute sent', 'volume_up');
                                } else {
                                    sendWs({ type: 'host-mute-user', target_user_id: uid, data: {} });
                                    showToast('Mute sent', 'volume_off');
                                }
                                return;
                            }

                            if (action === 'kick') {
                                if (!confirm(`Remove ${p.name}?`)) return;
                                sendWs({ type: 'host-kick', target_user_id: uid, data: { reason: 'removed' } });
                                showToast('Removing participant...', 'person_remove');
                                return;
                            }

                            if (action === 'role') {
                                const nextRole = btn.getAttribute('data-role');
                                sendWs({ type: 'host-set-role', target_user_id: uid, data: { role: nextRole } });
                                showToast(nextRole === 'cohost' ? 'Promoted to co-host' : 'Co-host removed', 'admin_panel_settings');
                                return;
                            }
                        };
                    });
                }
                participantsList.appendChild(item);
            });
        }

        function addParticipant(p) {
            participantsData.push(p);
            const count = participantsData.length;
            participantCount.textContent = `${count} in call`;
            participantsCountEl.textContent = `(${count})`;

            const colors = ['#9E4B8A', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4'];
            const avatar = document.createElement('div');
            avatar.className = 'participant-avatar';
            avatar.id = `avatar-${p.user_id}`;
            avatar.style.background = colors[Math.floor(Math.random() * colors.length)];
            avatar.textContent = p.name[0].toUpperCase();
            avatar.title = p.name;
            participantAvatars.appendChild(avatar);

            // Update sidebar if open
            if (isParticipantsSidebarOpen) {
                updateParticipantsList();
            }
        }

        function removeParticipant(uid) {
            participantsData = participantsData.filter(p => p.user_id !== uid);
            const avatar = document.getElementById(`avatar-${uid}`);
            if (avatar) avatar.remove();

            const count = participantsData.length;
            participantCount.textContent = `${count} in call`;
            participantsCountEl.textContent = `(${count})`;

            // Update sidebar if open
            if (isParticipantsSidebarOpen) {
                updateParticipantsList();
            }
        }

        // =========================================================================
        // Chat
        // =========================================================================
        function addChatMessage(data) {
            // Remove the empty state if present
            const emptyState = chatMessages.querySelector('.text-center.py-8');
            if (emptyState) emptyState.remove();

            const isMine = data.user_id === userId;
            const div = document.createElement('div');
            div.className = `chat-bubble ${isMine ? 'chat-mine' : 'chat-theirs'}`;
            div.innerHTML = `
                <div class="text-xs opacity-70 mb-1 flex justify-between gap-4">
                    <span>${isMine ? 'You' : data.name}</span>
                    <span>${new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div>${escapeHtml(data.message)}</div>
            `;
            chatMessages.appendChild(div);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        chatForm.onsubmit = (e) => {
            e.preventDefault();
            const msg = chatInput.value.trim();
            if (!msg || !ws) return;

            const hostMgmt = !!roomSettings.host_management_enabled;
            if (!canModerate && hostMgmt && !roomSettings.chat_enabled) {
                showToast('Chat disabled by host', 'info');
                return;
            }

            sendWs({
                type: 'chat-message',
                data: { message: msg }
            }, { silent: true });
            chatInput.value = '';
        };

        // Host tools section buttons
        if (hostMuteAllBtn2) {
            hostMuteAllBtn2.onclick = () => {
                if (!canModerate) return showToast('Only host/co-host', 'info');
                sendWs({ type: 'host-mute-all', data: {} });
                showToast('Muting all participants', 'volume_off');
            };
        }
        if (hostCopyInviteBtn2) {
            hostCopyInviteBtn2.onclick = () => {
                navigator.clipboard.writeText(window.location.href);
                showToast('Invite link copied!', 'link');
            };
        }

        // =========================================================================
        // Init
        // =========================================================================
        const params = new URLSearchParams(window.location.search);
        const roomParam = params.get('room');

        // Theme init
        if (localStorage.getItem('px_theme') === 'dark' || (!('px_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        }

        // Setup UI
        copyLinkBtn.onclick = () => {
            navigator.clipboard.writeText(window.location.href);
            showToast('Link copied to clipboard');
        };

        leaveBtn.onclick = leaveRoom;

        if (roomParam) {
            roomId = roomParam;

            // Display meeting ID in bottom left
            el('meetingId').textContent = roomId;

            // Update time every second
            function updateClock() {
                const now = new Date();
                el('currentTime').textContent = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
            }
            updateClock();
            setInterval(updateClock, 1000);

            joinRoom();

            // =========================================================================
            // Click Outside to Close Sidebars
            // =========================================================================
            document.addEventListener('click', (e) => {
                // 1. Chat Sidebar
                if (isChatOpen &&
                    chatSidebar &&
                    !chatSidebar.contains(e.target) &&
                    !chatToggleBtn.contains(e.target)) {
                    toggleChat();
                }

                // 2. Participants Sidebar
                if (isParticipantsSidebarOpen &&
                    participantsSidebar &&
                    !participantsSidebar.contains(e.target) &&
                    !participantsFab.contains(e.target)) {
                    toggleParticipantsSidebar();
                }

                // 3. Host Controls Sidebar
                if (isHostControlsSidebarOpen &&
                    hostControlsSidebar &&
                    !hostControlsSidebar.contains(e.target) &&
                    !hostControlsFab.contains(e.target)) {
                    toggleHostControlsSidebar();
                }
            });
        } else {
            window.location.replace('create_meet.html');
        }
