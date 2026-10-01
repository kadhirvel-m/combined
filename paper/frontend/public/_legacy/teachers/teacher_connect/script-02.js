// Extracted from ui/teachers/teacher_connect.html (inline <script> #2).
        // ===== Helpers =====
        const el = (s, r = document) => r.querySelector(s), els = (s, r = document) => [...r.querySelectorAll(s)];
        const showToast = (msg, type = 'info', opts = {}) => {
            const host = el('#toastHost');
            const d = document.createElement('div');
            d.className = `pointer-events-auto select-none text-sm rounded-lg shadow-lg px-4 py-3 flex items-center gap-2 border backdrop-blur-sm ${type === 'success' ? 'bg-emerald-500/90 text-white border-emerald-400/50' : type === 'error' ? 'bg-rose-600/90 text-white border-rose-400/50' : 'bg-black/80 text-white border-white/10'}`;

            const icon = document.createElement('span');
            icon.className = 'material-symbols-rounded text-base';
            icon.textContent = type === 'success' ? 'check_circle' : (type === 'error' ? 'error' : 'info');

            const text = document.createElement('span');
            text.textContent = String(msg || '');

            d.append(icon, text);
            host.appendChild(d);
            setTimeout(() => {
                d.classList.add('opacity-0', 'translate-y-1');
                setTimeout(() => d.remove(), 300);
            }, opts.ttl || 2200);
        };

        // Theme toggle
        document.addEventListener('click', e => { const t = e.target.closest('[data-theme-toggle]'); if (!t) return; const root = document.documentElement; const next = root.classList.contains('dark') ? 'light' : 'dark'; root.classList.toggle('dark', next === 'dark'); localStorage.setItem('px_theme', next); document.querySelectorAll('[data-theme-toggle] .material-symbols-rounded').forEach(ic => ic.textContent = next === 'dark' ? 'light_mode' : 'dark_mode'); });

        // ===== API base resolve =====
        let API_BASE = '';
        (function resolveApiBase() { if (API_BASE) return; const origin = location.origin; if (location.port === '8000') { API_BASE = origin; return; } const host = location.hostname; const candidates = [origin, `http://${host}:8000`, `https://${host}:8000`]; (async () => { for (const c of candidates) { try { const r = await fetch(c + '/api/public/academic-meta'); if (r.ok) { API_BASE = c.replace(/\/$/, ''); return; } } catch { } } API_BASE = origin; })(); })();

        const token = localStorage.getItem('teacherToken');
        if (!token) { alert('Login required. Redirecting…'); location.href = 'teacher_login.html'; }

        const teacherList = el('#teacherList');
        const connectionList = el('#connectionList');
        const messagesEl = el('#messages');
        const sendForm = el('#sendForm');
        const partnerNameEl = el('#partnerName');
        const partnerAvatar = el('#partnerAvatar');
        const presenceDot = el('#presenceDot');
        const presenceText = el('#presenceText');

        let currentConnection = null; // {id, partner_user_id, partner_name}
        let lastMessageTs = null; let ws = null; let userId = null;

        function authHeader() { return token ? { 'Authorization': 'Bearer ' + token } : {} }
        async function fetchJSON(url, opts = {}) { const r = await fetch(url, opts); const ct = r.headers.get('content-type') || ''; const t = await r.text().catch(() => ""); let d = {}; if (t) { if (/json|javascript/i.test(ct)) { try { d = JSON.parse(t); } catch { d = { raw: t } } } else d = { raw: t }; } if (!r.ok) { const msg = d.detail || d.error || r.status + ' ' + (t.slice(0, 120) || ''); const e = new Error(msg); e.status = r.status; e.data = d; throw e; } return d; }
        function setListMessage(container, message, extraClass = '') {
            container.textContent = '';
            const row = document.createElement('div');
            row.className = `px-3 py-2 text-[12px] ${extraClass}`.trim();
            row.textContent = String(message || '');
            container.appendChild(row);
        }

        // ===== Left lists =====
        async function loadTeachers() {
            await waitApi();
            try {
                const data = await fetchJSON((API_BASE || location.origin) + '/api/teachers');
                // Apply filter locally for immediate feedback
                renderTeacherList(data.teachers || []);
            } catch (e) {
                setListMessage(teacherList, `Failed to load teachers: ${e.message || 'Unknown error'}`, 'text-rose-600');
            }
        }
        async function loadConnections() {
            if (!token) { setListMessage(connectionList, 'Not logged in.'); return; }
            await waitApi();
            try {
                const data = await fetchJSON((API_BASE || location.origin) + '/api/teacher/connections', { headers: authHeader() });
                // Apply filter locally for immediate feedback
                renderConnList(data.connections || []);
            } catch (e) {
                if (e.status === 403) setListMessage(connectionList, 'Not approved yet.', 'text-amber-600');
                else setListMessage(connectionList, `Error: ${e.message || 'Unknown error'}`, 'text-rose-600');
            }
        }

        function renderTeacherList(arr) {
            const q = el('#peopleSearch').value?.toLowerCase() || '';
            const list = arr.filter(t => !q || (t.name || '').toLowerCase().includes(q) || (t.department || '').toLowerCase().includes(q));
            teacherList.textContent = '';
            if (!list.length) {
                setListMessage(teacherList, 'No approved teachers.', 'opacity-60');
                return;
            }
            list.forEach(t => {
                const row = document.createElement('button');
                row.type = 'button';
                row.className = 'w-full text-left px-4 py-3 hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-3';
                const initial = (t.name || 'U').charAt(0).toUpperCase();

                const avatar = document.createElement('div');
                avatar.className = 'w-9 h-9 rounded-full bg-gradient-to-br from-brand-500/30 to-brand-500/10 ring-1 ring-black/10 dark:ring-white/15 grid place-items-center text-sm font-semibold';
                avatar.textContent = initial;

                const content = document.createElement('div');
                content.className = 'min-w-0';

                const name = document.createElement('div');
                name.className = 'font-medium text-sm truncate';
                name.textContent = t.name || '(no name)';

                const dept = document.createElement('div');
                dept.className = 'text-[11px] opacity-60 truncate';
                dept.textContent = t.department || '';

                const chevron = document.createElement('span');
                chevron.className = 'ml-auto material-symbols-rounded text-base opacity-60';
                chevron.textContent = 'chevron_right';

                content.append(name, dept);
                row.append(avatar, content, chevron);
                row.onclick = () => connectOrOpen(t.auth_user_id, t.name || '(no name)');
                teacherList.appendChild(row);
            });
        }

        function renderConnList(arr) {
            const q = el('#peopleSearch').value?.toLowerCase() || '';
            const list = arr.filter(c => !q || (c.partner_name || '').toLowerCase().includes(q));
            connectionList.textContent = '';
            if (!list.length) {
                setListMessage(connectionList, 'No connections yet.', 'opacity-60');
                return;
            }
            list.forEach(c => {
                const row = document.createElement('button');
                row.type = 'button';
                row.className = 'w-full text-left px-4 py-3 hover:bg-black/5 dark:hover:bg-white/10 flex items-center gap-3';
                const initial = (c.partner_name || 'U').charAt(0).toUpperCase();

                const avatar = document.createElement('div');
                avatar.className = 'w-9 h-9 rounded-full bg-gradient-to-br from-brand-500/30 to-brand-500/10 ring-1 ring-black/10 dark:ring-white/15 grid place-items-center text-sm font-semibold';
                avatar.textContent = initial;

                const content = document.createElement('div');
                content.className = 'min-w-0';

                const name = document.createElement('div');
                name.className = 'font-medium text-sm truncate';
                name.textContent = c.partner_name || c.partner_user_id.substring(0, 8) + '...';

                const date = document.createElement('div');
                date.className = 'text-[11px] opacity-60';
                date.textContent = new Date(c.created_at).toLocaleDateString();

                const chevron = document.createElement('span');
                chevron.className = 'ml-auto material-symbols-rounded text-base opacity-60';
                chevron.textContent = 'chevron_right';

                content.append(name, date);
                row.append(avatar, content, chevron);
                row.onclick = () => openConnection(c);
                connectionList.appendChild(row);
            });
        }

        // Debounced live search: refresh only the active list and avoid toggling visibility incorrectly
        let _searchTimer = null;
        el('#peopleSearch').addEventListener('input', () => {
            if (_searchTimer) clearTimeout(_searchTimer);
            _searchTimer = setTimeout(() => {
                if (activeTab === 'teachers') {
                    loadTeachers();
                } else {
                    loadConnections();
                }
            }, 200);
        });
        el('#refreshLists').addEventListener('click', () => { loadTeachers(); loadConnections(); showToast('Lists refreshed', 'success'); });

        let activeTab = 'teachers';
        els('.tabBtn').forEach(b => b.addEventListener('click', () => {
            activeTab = b.dataset.tab;
            els('.tabBtn').forEach(x => x.classList.toggle('bg-brand-500/10', x === b));
            el('#teachersWrap').classList.toggle('hidden', activeTab !== 'teachers');
            el('#convosWrap').classList.toggle('hidden', activeTab !== 'convos');
            // Refresh the active list on tab change so current search applies immediately
            if (activeTab === 'teachers') {
                loadTeachers();
            } else {
                loadConnections();
            }
        }));

        // ===== Connections & WS =====
        async function connectOrOpen(otherId, name) { if (!token) { alert('Login required'); location.href = 'teacher_login.html'; return; } try { await waitApi(); const data = await fetchJSON((API_BASE || location.origin) + `/api/teacher/connect/${otherId}`, { method: 'POST', headers: authHeader() }); await loadConnections(); openConnection({ connection_id: data.connection_id, partner_user_id: otherId, partner_name: name }); } catch (e) { if (e.status === 403) alert('You are not yet an approved teacher.'); else alert('Connect failed: ' + (e.message || 'error')); } }

        function openConnection(c) { currentConnection = { id: c.connection_id, partner_user_id: c.partner_user_id, partner_name: c.partner_name }; partnerNameEl.textContent = c.partner_name || ''; partnerAvatar.textContent = (c.partner_name || '?')[0]?.toUpperCase() || '?'; presence('connecting'); messagesEl.textContent = ''; lastMessageTs = null; sendForm.classList.remove('hidden'); openWebSocket(); closeLeftPane(); }

        function openWebSocket() {
            if (!currentConnection) return; if (ws) { try { ws.close(); } catch { } ws = null; } const base = API_BASE || location.origin; const loc = new URL(base); const url = (loc.protocol === 'https:' ? 'wss://' : 'ws://') + loc.host + `/api/teacher/connections/${currentConnection.id}/ws?token=` + encodeURIComponent(token); ws = new WebSocket(url); ws.onopen = () => { presence('online'); }; ws.onclose = () => { presence('offline'); startPollingFallback(); }; ws.onerror = () => { presence('offline'); };
            ws.onmessage = (ev) => { try { const msg = JSON.parse(ev.data); handleWsEvent(msg); } catch { } }
        }

        function handleWsEvent(evt) { if (evt.type === 'init') { messagesEl.textContent = ''; (evt.messages || []).forEach(addMessage); if (evt.messages?.length) { lastMessageTs = evt.messages[evt.messages.length - 1].created_at; } scrollToBottom(true); return; } if (evt.type === 'message') { addMessage(evt); lastMessageTs = evt.created_at; maybeShowJump(); return; } if (evt.type === 'error') { console.warn('WS error', evt.detail); } }

        function startPollingFallback() { pollMessages(); }
        async function pollMessages() { if (ws && ws.readyState === WebSocket.OPEN) return; if (!currentConnection) return; try { let url = API_BASE + `/api/teacher/connections/${currentConnection.id}/messages?limit=200`; if (lastMessageTs) url += `&since=${encodeURIComponent(lastMessageTs)}`; const data = await fetchJSON(url, { headers: authHeader() }); if (data.messages) { data.messages.forEach(addMessage); if (data.messages.length) { lastMessageTs = data.messages[data.messages.length - 1].created_at; maybeShowJump(); } } } catch { } setTimeout(pollMessages, 4000); }

        function addMessage(m) {
            const mine = m.sender_user_id === getUserIdFromToken(); const at = new Date(m.created_at); // date chip
            if (shouldInsertDate(at)) insertDateChip(at);
            // grouping
            const last = messagesEl.lastElementChild?.dataset || {}; const continued = last.sender === String(m.sender_user_id) && last.min === String(at.getMinutes()) && last.hr === String(at.getHours());
            const wrap = document.createElement('div'); wrap.className = `w-full flex ${mine ? 'justify-end' : 'justify-start'} animate-pop`; wrap.dataset.sender = String(m.sender_user_id); wrap.dataset.hr = String(at.getHours()); wrap.dataset.min = String(at.getMinutes());
            const bubble = document.createElement('div'); bubble.className = `bubble ${mine ? 'me' : 'them'} ${continued ? 'bubble-continued' : ''}`; bubble.textContent = m.content; wrap.appendChild(bubble); messagesEl.appendChild(wrap);
        }

        let lastDateStr = ''; function shouldInsertDate(d) { const s = d.toDateString(); if (s !== lastDateStr) { lastDateStr = s; return true; } return false; }
        function insertDateChip(d) { const chip = document.createElement('div'); chip.className = 'w-full flex items-center justify-center my-2'; const label = document.createElement('span'); label.className = 'date-chip ring-1 ring-black/10 dark:ring-white/15 bg-white/80 dark:bg-white/10'; label.textContent = d.toLocaleDateString(); chip.appendChild(label); messagesEl.appendChild(chip); }

        function getUserIdFromToken() { if (userId) return userId; try { const parts = token.split('.')[1]; userId = JSON.parse(atob(parts)).sub; return userId; } catch { return null; } }

        // Presence UI
        function presence(state) { const map = { online: { dot: 'bg-emerald-500', txt: 'Connected' }, offline: { dot: 'bg-neutral-400', txt: 'Idle' }, connecting: { dot: 'bg-amber-500', txt: 'Connecting…' } }; const p = map[state] || map.offline; presenceDot.className = 'presence-dot ' + p.dot; presenceText.textContent = p.txt; }

        // Composer
        const composer = el('#composer'); composer.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendForm.requestSubmit(); } }); composer.addEventListener('input', () => { composer.style.height = 'auto'; composer.style.height = Math.min(composer.scrollHeight, 160) + 'px'; });
        sendForm.addEventListener('submit', async e => { e.preventDefault(); const fd = new FormData(sendForm); const content = (fd.get('content') || '').toString().trim(); if (!content) return; try { if (ws && ws.readyState === WebSocket.OPEN) { ws.send(JSON.stringify({ action: 'send', content })); } else { await fetchJSON(API_BASE + `/api/teacher/connections/${currentConnection.id}/messages`, { method: 'POST', headers: { ...authHeader(), 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) }); } sendForm.reset(); composer.style.height = '3.5rem'; } catch { showToast('Send failed', 'error'); } });

        // Scroll helpers
        function nearBottom() { return messagesEl.scrollHeight - messagesEl.scrollTop - messagesEl.clientHeight < 120; }
        function scrollToBottom(force) { if (force || nearBottom()) messagesEl.scrollTop = messagesEl.scrollHeight; }
        function maybeShowJump() { if (nearBottom()) scrollToBottom(true); else el('#jumpLatest').classList.remove('hidden'); }
        messagesEl.addEventListener('scroll', () => { const btn = el('#jumpLatest'); if (nearBottom()) btn.classList.add('hidden'); });
        el('#jumpLatest').addEventListener('click', () => { scrollToBottom(true); el('#jumpLatest').classList.add('hidden'); });

        // Info panel removed

        // Panels toggles (mobile)
        function openLeftPane() { el('#leftPane').classList.remove('hidden'); }
        function closeLeftPane() { el('#leftPane').classList.add('hidden'); }
        el('#openLeft').addEventListener('click', openLeftPane); el('#openLeft2').addEventListener('click', openLeftPane);
        // Right pane toggle removed
        document.addEventListener('click', (e) => { if (e.target.matches('[data-theme-toggle]')) { const root = document.documentElement; const dark = root.classList.toggle('dark'); localStorage.setItem('px_theme', dark ? 'dark' : 'light'); } });

        // Logout
        el('#logoutBtn').addEventListener('click', () => { if (ws) { try { ws.close(); } catch { } } try { ['teacherToken', 'px_token', 'access_token', 'auth_token', 'sb-access-token'].forEach(k => localStorage.removeItem(k)); } catch { } location.href = 'teacher_login.html'; });

        // Misc actions
        // Copy link button removed

        async function waitApi() { let tries = 0; while (!API_BASE && tries < 20) { await new Promise(r => setTimeout(r, 100)); tries++; } }

        // Boot
        (async () => { await waitApi(); loadTeachers(); loadConnections(); setInterval(loadConnections, 15000); })();
