// Extracted from ui/groupChat/whiteboard.html (inline <script> #1).
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
        let ws = null;
        let reconnectEnabled = true;
        let canvas, ctx;
        let isDrawing = false;
        let currentTool = 'pen';
        let currentColor = '#000000';
        let brushSize = 4;
        let lastX = 0, lastY = 0;

        // History for undo/redo
        let history = [];
        let historyIndex = -1;
        const maxHistory = 50;

        // Remote cursors
        let remoteCursors = {};

        // =========================================================================
        // DOM Elements
        // =========================================================================
        const el = id => document.getElementById(id);
        const canvasContainer = el('canvasContainer');
        const statusDot = el('statusDot');
        const statusText = el('statusText');
        const roomNameEl = el('roomName');
        const brushSizeInput = el('brushSize');
        const sizeLabel = el('sizeLabel');
        const penTool = el('penTool');
        const eraserTool = el('eraserTool');
        const undoBtn = el('undoBtn');
        const redoBtn = el('redoBtn');
        const clearBtn = el('clearBtn');
        const downloadBtn = el('downloadBtn');
        const backBtn = el('backBtn');
        const remoteCursorsContainer = el('remoteCursors');

        // =========================================================================
        // Toast
        // =========================================================================
        function showToast(message, icon = 'check_circle', duration = 3000) {
            const toast = el('toast');
            el('toastText').textContent = message;
            el('toastIcon').textContent = icon;
            toast.classList.remove('hidden');
            setTimeout(() => toast.classList.add('hidden'), duration);
        }

        // =========================================================================
        // Canvas Setup
        // =========================================================================
        function initCanvas() {
            canvas = el('whiteboard');
            ctx = canvas.getContext('2d');

            const resize = () => {
                const rect = canvasContainer.getBoundingClientRect();
                const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                canvas.width = rect.width;
                canvas.height = rect.height;
                ctx.putImageData(imgData, 0, 0);
            };

            resize();
            window.addEventListener('resize', resize);

            // Save initial state
            saveState();

            // Mouse events
            canvas.addEventListener('mousedown', startDraw);
            canvas.addEventListener('mousemove', draw);
            canvas.addEventListener('mouseup', endDraw);
            canvas.addEventListener('mouseout', endDraw);

            // Touch events
            canvas.addEventListener('touchstart', e => { e.preventDefault(); startDraw(e.touches[0]); });
            canvas.addEventListener('touchmove', e => { e.preventDefault(); draw(e.touches[0]); });
            canvas.addEventListener('touchend', endDraw);

            // Track cursor position for remote display
            canvas.addEventListener('mousemove', throttle(sendCursorPosition, 50));
        }

        function getPos(e) {
            const rect = canvas.getBoundingClientRect();
            return [e.clientX - rect.left, e.clientY - rect.top];
        }

        function startDraw(e) {
            isDrawing = true;
            [lastX, lastY] = getPos(e);
        }

        function draw(e) {
            if (!isDrawing) return;
            const [x, y] = getPos(e);

            ctx.beginPath();
            ctx.moveTo(lastX, lastY);
            ctx.lineTo(x, y);

            if (currentTool === 'eraser') {
                ctx.strokeStyle = document.documentElement.classList.contains('dark') ? '#1a1a2e' : '#ffffff';
                ctx.lineWidth = brushSize * 3;
            } else {
                ctx.strokeStyle = currentColor;
                ctx.lineWidth = brushSize;
            }

            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();

            // Send to others
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'whiteboard-draw',
                    data: {
                        x0: lastX / canvas.width,
                        y0: lastY / canvas.height,
                        x1: x / canvas.width,
                        y1: y / canvas.height,
                        color: currentTool === 'eraser' ? (document.documentElement.classList.contains('dark') ? '#1a1a2e' : '#ffffff') : currentColor,
                        width: currentTool === 'eraser' ? brushSize * 3 : brushSize
                    }
                }));
            }

            [lastX, lastY] = [x, y];
        }

        function endDraw() {
            if (isDrawing) {
                isDrawing = false;
                saveState();
            }
        }

        // =========================================================================
        // Remote Drawing
        // =========================================================================
        function drawFromRemote(data) {
            if (!ctx) return;
            const x0 = data.x0 * canvas.width;
            const y0 = data.y0 * canvas.height;
            const x1 = data.x1 * canvas.width;
            const y1 = data.y1 * canvas.height;

            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x1, y1);
            ctx.strokeStyle = data.color;
            ctx.lineWidth = data.width;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
        }

        // =========================================================================
        // History (Undo/Redo)
        // =========================================================================
        function saveState() {
            if (historyIndex < history.length - 1) {
                history = history.slice(0, historyIndex + 1);
            }
            if (history.length >= maxHistory) {
                history.shift();
            }
            history.push(canvas.toDataURL());
            historyIndex = history.length - 1;
            updateHistoryButtons();
        }

        function undo() {
            if (historyIndex > 0) {
                historyIndex--;
                loadState(history[historyIndex]);
                updateHistoryButtons();
            }
        }

        function redo() {
            if (historyIndex < history.length - 1) {
                historyIndex++;
                loadState(history[historyIndex]);
                updateHistoryButtons();
            }
        }

        function loadState(dataUrl) {
            const img = new Image();
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
            };
            img.src = dataUrl;
        }

        function updateHistoryButtons() {
            undoBtn.disabled = historyIndex <= 0;
            redoBtn.disabled = historyIndex >= history.length - 1;
        }

        // =========================================================================
        // Clear Canvas
        // =========================================================================
        function clearCanvas(broadcast = true) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            saveState();

            if (broadcast && ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'whiteboard-clear' }));
            }
        }

        // =========================================================================
        // Download
        // =========================================================================
        function downloadCanvas() {
            const link = document.createElement('a');
            link.download = `whiteboard-${roomId}-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            showToast('Image downloaded!', 'download');
        }

        // =========================================================================
        // Remote Cursors
        // =========================================================================
        function sendCursorPosition(e) {
            if (!ws || ws.readyState !== WebSocket.OPEN) return;
            const [x, y] = getPos(e);
            ws.send(JSON.stringify({
                type: 'cursor-move',
                data: {
                    x: x / canvas.width,
                    y: y / canvas.height
                }
            }));
        }

        function updateRemoteCursor(userId, name, x, y, color) {
            let cursor = remoteCursors[userId];
            if (!cursor) {
                cursor = document.createElement('div');
                cursor.className = 'remote-cursor';
                cursor.style.setProperty('--cursor-color', color);
                cursor.innerHTML = `<div class="remote-cursor-label">${name}</div>`;
                remoteCursorsContainer.appendChild(cursor);
                remoteCursors[userId] = cursor;
            }
            cursor.style.left = `${x * canvas.width}px`;
            cursor.style.top = `${72 + y * canvas.height}px`;
        }

        function removeRemoteCursor(userId) {
            if (remoteCursors[userId]) {
                remoteCursors[userId].remove();
                delete remoteCursors[userId];
            }
        }

        // =========================================================================
        // WebSocket
        // =========================================================================
        function connectWebSocket() {
            ws = new WebSocket(`${WS_BASE}/ws/group-chat/${roomId}`);

            ws.onopen = () => {
                console.log('[WS] Connected');
                statusDot.classList.remove('disconnected');
                statusDot.classList.add('connected');
                statusText.textContent = 'Connected';

                ws.send(JSON.stringify({
                    type: 'join',
                    data: { user_id: userId, name: userName, token: token || null }
                }));
            };

            ws.onmessage = async (event) => {
                const msg = JSON.parse(event.data);
                handleMessage(msg);
            };

            ws.onclose = () => {
                console.log('[WS] Disconnected');
                statusDot.classList.add('disconnected');
                statusDot.classList.remove('connected');
                statusText.textContent = 'Disconnected';

                // Try to reconnect after 3 seconds
                setTimeout(() => {
                    if (reconnectEnabled && roomId) connectWebSocket();
                }, 3000);
            };

            ws.onerror = (err) => {
                console.error('[WS] Error:', err);
            };
        }

        function handleMessage(msg) {
            const { type, data, from_user_id } = msg;

            switch (type) {
                case 'room-info':
                    roomNameEl.textContent = data.name;
                    userId = data.your_user_id;

                    // Replay whiteboard history
                    if (data.whiteboard_history) {
                        try { ctx.clearRect(0, 0, canvas.width, canvas.height); } catch (_) { }
                        data.whiteboard_history.forEach(stroke => drawFromRemote(stroke));
                        saveState();
                    }
                    break;

                case 'room-ended':
                    reconnectEnabled = false;
                    showToast('The meeting has ended', 'call_end');
                    setTimeout(() => {
                        window.location.href = 'create_meet.html';
                    }, 2000);
                    break;

                case 'join-denied':
                    reconnectEnabled = false;
                    showToast(`Join denied: ${data?.reason || 'not allowed'}`, 'error');
                    statusText.textContent = 'Join denied';
                    break;

                case 'kicked':
                    reconnectEnabled = false;
                    showToast('You were removed from the meeting', 'person_remove');
                    statusText.textContent = 'Removed';
                    break;

                case 'waiting-room':
                    statusText.textContent = 'Waiting for host…';
                    break;

                case 'admitted':
                    statusText.textContent = 'Connected';
                    // whiteboard history is sent via room-info
                    break;

                case 'whiteboard-draw':
                    drawFromRemote(data);
                    break;

                case 'whiteboard-clear':
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    saveState();
                    break;

                case 'cursor-move':
                    if (from_user_id && from_user_id !== userId) {
                        const colors = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#9E4B8A', '#06b6d4'];
                        const colorIndex = from_user_id.charCodeAt(0) % colors.length;
                        updateRemoteCursor(from_user_id, data.name || 'User', data.x, data.y, colors[colorIndex]);
                    }
                    break;

                case 'user-left':
                    removeRemoteCursor(data.user_id);
                    break;
            }
        }

        // =========================================================================
        // Utilities
        // =========================================================================
        function throttle(fn, wait) {
            let lastTime = 0;
            return function (...args) {
                const now = Date.now();
                if (now - lastTime >= wait) {
                    lastTime = now;
                    fn.apply(this, args);
                }
            };
        }

        // =========================================================================
        // Event Handlers
        // =========================================================================
        penTool.onclick = () => {
            currentTool = 'pen';
            penTool.classList.add('active');
            eraserTool.classList.remove('active');
            canvas.style.cursor = 'crosshair';
        };

        eraserTool.onclick = () => {
            currentTool = 'eraser';
            eraserTool.classList.add('active');
            penTool.classList.remove('active');
            canvas.style.cursor = 'cell';
        };

        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelector('.color-btn.active')?.classList.remove('active');
                btn.classList.add('active');
                currentColor = btn.dataset.color;
                // Switch to pen when selecting color
                penTool.click();
            };
        });

        brushSizeInput.oninput = (e) => {
            brushSize = parseInt(e.target.value);
            sizeLabel.textContent = brushSize;
        };

        undoBtn.onclick = undo;
        redoBtn.onclick = redo;
        clearBtn.onclick = () => clearCanvas(true);
        downloadBtn.onclick = downloadCanvas;

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z') {
                    e.preventDefault();
                    undo();
                } else if (e.key === 'y') {
                    e.preventDefault();
                    redo();
                }
            } else if (e.key === 'p' || e.key === 'P') {
                penTool.click();
            } else if (e.key === 'e' || e.key === 'E') {
                eraserTool.click();
            }
        });

        // =========================================================================
        // Init
        // =========================================================================
        async function init() {
            // Theme
            if (localStorage.getItem('px_theme') === 'dark' || (!('px_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
            }

            // Get room ID from URL
            const params = new URLSearchParams(window.location.search);
            roomId = params.get('room');

            if (!roomId) {
                showToast('No room specified', 'error');
                setTimeout(() => window.location.href = 'create_meet.html', 2000);
                return;
            }

            // Update back button
            backBtn.href = `group_chat.html?room=${roomId}`;

            // Get user info
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

            // Initialize canvas
            initCanvas();

            // Connect to WebSocket
            connectWebSocket();
        }

        init();
