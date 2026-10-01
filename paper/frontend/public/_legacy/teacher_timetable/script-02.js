// Extracted from ui/teacher_timetable.html (inline <script> #2).
        (function theme() {
            const root = document.documentElement;
            const toggles = () => Array.from(document.querySelectorAll('[data-theme-toggle]'));
            const setMode = (mode) => {
                if (mode === 'dark') root.classList.add('dark');
                else root.classList.remove('dark');
                localStorage.setItem('px_theme', mode);
                toggles().forEach(btn => {
                    const icon = btn.querySelector('.material-symbols-rounded');
                    if (icon) icon.textContent = mode === 'dark' ? 'light_mode' : 'dark_mode';
                });
            };
            setMode(root.classList.contains('dark') ? 'dark' : 'light');
            document.addEventListener('click', (e) => {
                const btn = e.target.closest('[data-theme-toggle]');
                if (!btn) return;
                setMode(root.classList.contains('dark') ? 'light' : 'dark');
            });
        })();

        const DAYS = [
            { idx: 1, name: 'Monday' },
            { idx: 2, name: 'Tuesday' },
            { idx: 3, name: 'Wednesday' },
            { idx: 4, name: 'Thursday' },
            { idx: 5, name: 'Friday' },
            { idx: 6, name: 'Saturday' }
        ];

        const PERIODS = [
            { period: 1, title: 'P1', time: '08:50 - 09:40' },
            { period: 2, title: 'P2', time: '09:40 - 10:30' },
            { period: 3, title: 'P3', time: '10:45 - 11:35' },
            { period: 4, title: 'P4', time: '11:35 - 12:25' },
            { period: 5, title: 'P5', time: '13:10 - 14:00' },
            { period: 6, title: 'P6', time: '14:00 - 14:50' },
            { period: 7, title: 'P7', time: '15:00 - 15:50' },
            { period: 8, title: 'P8', time: '15:50 - 16:40' }
        ];

        let API_BASE = '';
        let classOptions = [];
        const slots = new Map();
        let editingKey = '';

        const $ = (s, r = document) => r.querySelector(s);

        function slotKey(day, period) {
            return `${day}-${period}`;
        }

        function setStatus(text, mode = 'ok') {
            const el = $('#statusChip');
            if (!el) return;
            el.textContent = text;
            el.style.borderColor = mode === 'error' ? 'rgba(220,38,38,.45)' : 'rgba(30,30,47,.14)';
        }

        function toast(msg, isError = false) {
            const t = $('#toast');
            if (!t) return;
            t.textContent = msg;
            t.style.background = isError ? 'rgba(127,29,29,.94)' : 'rgba(30,30,47,.92)';
            t.classList.add('show');
            setTimeout(() => t.classList.remove('show'), 1800);
        }

        async function resolveApi() {
            if (API_BASE) return API_BASE;
            const b = (window.__API_BASE || window.API_BASE || '').replace(/\/$/, '');
            if (b) {
                API_BASE = b;
                return b;
            }
            await new Promise(r => setTimeout(r, 70));
            return resolveApi();
        }

        function getToken() {
            const keys = ['teacherToken', 'px_token', 'userToken', 'sb-access-token', 'supabase.auth.token'];
            for (const k of keys) {
                try {
                    const v = localStorage.getItem(k);
                    if (v && v !== '__COOKIE_AUTH__') return v;
                } catch (_) { }
            }
            return '';
        }

        function authHeaders() {
            const h = {};
            const t = getToken();
            if (t) h.Authorization = `Bearer ${t}`;
            return h;
        }

        function esc(v) {
            return String(v == null ? '' : v)
                .replaceAll('&', '&amp;')
                .replaceAll('<', '&lt;')
                .replaceAll('>', '&gt;')
                .replaceAll('"', '&quot;')
                .replaceAll("'", '&#39;');
        }

        function classSubject(c) {
            const raw = String(c && c.subject ? c.subject : 'Class').trim();
            if (!raw) return 'Class';
            return raw
                .replace(/^\s*[A-Z0-9]{4,}\s*[\u2014-]\s*/i, '')
                .replace(/^\s*[A-Z]{2,}\d{1,}[A-Z0-9]*\s+/i, '')
                .trim() || raw;
        }

        function classSection(c) {
            const raw = String(
                (c && (
                    c.section ||
                    c.section_name ||
                    c.sec ||
                    c.class_section ||
                    c.section_label
                )) || ''
            ).trim();
            if (!raw) return '';
            return /^section\b/i.test(raw) ? raw : `Section ${raw}`;
        }

        function classDisplay(c) {
            const subject = classSubject(c);
            const section = classSection(c);
            return section ? `${subject} (${section})` : subject;
        }

        function getClassById(id) {
            return classOptions.find(c => String(c.id) === String(id || '')) || null;
        }

        function updateCountBadges() {
            const assigned = [...slots.values()].filter(Boolean).length;
            const available = classOptions.length;
            const badge = $('#classCountBadge');
            if (badge) {
                badge.innerHTML = `<span class="material-symbols-rounded text-base">menu_book</span>${available} Classes Available to Map`;
            }
        }

        function buildHeaderColumns() {
            return `
                <th class="day-col">Day</th>
                <th class="period-head"><div class="period-code">P1</div><div class="period-time">08:50 - 09:40</div></th>
                <th class="period-head"><div class="period-code">P2</div><div class="period-time">09:40 - 10:30</div></th>
                <th class="break-head interval"></th>
                <th class="period-head"><div class="period-code">P3</div><div class="period-time">10:45 - 11:35</div></th>
                <th class="period-head"><div class="period-code">P4</div><div class="period-time">11:35 - 12:25</div></th>
                <th class="break-head lunch"></th>
                <th class="period-head"><div class="period-code">P5</div><div class="period-time">13:10 - 14:00</div></th>
                <th class="period-head"><div class="period-code">P6</div><div class="period-time">14:00 - 14:50</div></th>
                <th class="break-head internal"></th>
                <th class="period-head"><div class="period-code">P7</div><div class="period-time">15:00 - 15:50</div></th>
                <th class="period-head"><div class="period-code">P8</div><div class="period-time">15:50 - 16:40</div></th>
            `;
        }

        function renderInlineSelect(day, period, selectedId) {
            const hasSelected = String(selectedId || '').trim().length > 0;
            const options = [`<option value="" disabled ${hasSelected ? '' : 'selected'}>Choose class</option>`, ...classOptions.map(o => {
                const selected = String(o.id) === String(selectedId || '') ? 'selected' : '';
                return `<option value="${esc(o.id)}" ${selected}>${esc(classDisplay(o))}</option>`;
            }), `<option value="">Clear slot</option>`].join('');
            return `<select class="inline-slot-select" data-day="${day}" data-period="${period}">${options}</select>`;
        }

        function renderPeriodCard(day, period) {
            const key = slotKey(day, period);
            const assignedId = slots.get(key) || '';
            const cls = getClassById(assignedId);
            if (editingKey === key) {
                return renderInlineSelect(day, period, assignedId);
            }
            const title = cls ? classSubject(cls) : 'Tap to assign';
            const section = cls ? classSection(cls) : '';
            return `
                <button class="map-card" data-day="${day}" data-period="${period}">
                    <div class="map-icon">+</div>
                    <div class="map-title">${esc(title)}</div>
                    ${section ? `<div class="map-sub">${esc(section)}</div>` : ''}
                </button>
            `;
        }

        function renderGrid() {
            const table = $('#ttGrid');
            if (!table) return;
            const head = `<thead><tr>${buildHeaderColumns()}</tr></thead>`;
            const bodyRows = DAYS.map((day, idx) => {
                const parts = [];
                parts.push(`<td class="day-col"><div class="day-name">${day.name}</div></td>`);
                parts.push(`<td class="period-cell">${renderPeriodCard(day.idx, 1)}</td>`);
                parts.push(`<td class="period-cell">${renderPeriodCard(day.idx, 2)}</td>`);
                if (idx === 0) parts.push(`<td class="break-body interval" rowspan="${DAYS.length}"><span class="vtext"><span class="material-symbols-rounded vicon">hourglass_top</span>Interval</span></td>`);
                parts.push(`<td class="period-cell">${renderPeriodCard(day.idx, 3)}</td>`);
                parts.push(`<td class="period-cell">${renderPeriodCard(day.idx, 4)}</td>`);
                if (idx === 0) parts.push(`<td class="break-body lunch" rowspan="${DAYS.length}"><span class="vtext"><span class="material-symbols-rounded vicon">lunch_dining</span>Lunch</span></td>`);
                parts.push(`<td class="period-cell">${renderPeriodCard(day.idx, 5)}</td>`);
                parts.push(`<td class="period-cell">${renderPeriodCard(day.idx, 6)}</td>`);
                if (idx === 0) parts.push(`<td class="break-body internal" rowspan="${DAYS.length}"><span class="vtext"><span class="material-symbols-rounded vicon">hourglass_bottom</span>Internal</span></td>`);
                parts.push(`<td class="period-cell">${renderPeriodCard(day.idx, 7)}</td>`);
                parts.push(`<td class="period-cell">${renderPeriodCard(day.idx, 8)}</td>`);
                return `<tr>${parts.join('')}</tr>`;
            }).join('');

            table.innerHTML = `${head}<tbody>${bodyRows}</tbody>`;
            bindGridEvents();
            updateCountBadges();
        }

        async function loadClasses() {
            const base = await resolveApi();
            const res = await fetch(`${base}/api/teacher/classes/mine`, {
                headers: authHeaders(),
                credentials: 'include'
            });
            if (!res.ok) throw new Error('Could not load classes');
            const rows = await res.json();
            classOptions = (Array.isArray(rows) ? rows : []).map(c => ({
                id: c.id,
                subject: c.subject || 'Class',
                section: c.section || c.section_name || c.sec || c.class_section || c.section_label || ''
            }));
        }

        async function loadTimetable() {
            const base = await resolveApi();
            const res = await fetch(`${base}/api/teacher/timetable/me`, {
                headers: authHeaders(),
                credentials: 'include'
            });
            if (!res.ok) {
                const txt = await res.text().catch(() => '');
                throw new Error(txt || 'Could not load timetable');
            }
            const data = await res.json();
            slots.clear();
            (data.slots || []).forEach(s => {
                slots.set(slotKey(Number(s.day_index), Number(s.period_index)), s.class_id || '');
            });
        }

        async function saveSlot(day, period, classId) {
            const base = await resolveApi();
            setStatus('Saving...', 'saving');
            const normalizedClassId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(classId || '').trim())
                ? String(classId || '').trim()
                : null;
            const res = await fetch(`${base}/api/teacher/timetable/me/slot`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                credentials: 'include',
                body: JSON.stringify({
                    day_index: Number(day),
                    period_index: Number(period),
                    class_id: normalizedClassId
                })
            });
            if (!res.ok) {
                const msg = await res.text().catch(() => 'Failed to save slot');
                setStatus('Save failed', 'error');
                throw new Error(msg || 'Failed to save slot');
            }
            setStatus('Synced');
        }

        function bindGridEvents() {
            document.querySelectorAll('.map-card').forEach(card => {
                card.addEventListener('click', () => {
                    const day = Number(card.dataset.day);
                    const period = Number(card.dataset.period);
                    editingKey = slotKey(day, period);
                    renderGrid();
                    const sel = document.querySelector(`.inline-slot-select[data-day="${day}"][data-period="${period}"]`);
                    if (!sel) return;
                    sel.focus();
                    try {
                        if (typeof sel.showPicker === 'function') {
                            sel.showPicker();
                        } else {
                            sel.click();
                        }
                    } catch (_) {
                        try { sel.click(); } catch (_) { }
                    }
                });
            });

            document.querySelectorAll('.inline-slot-select').forEach(sel => {
                sel.addEventListener('change', async () => {
                    const day = Number(sel.dataset.day || 0);
                    const period = Number(sel.dataset.period || 0);
                    const selected = String(sel.value || '').trim();
                    const key = slotKey(day, period);
                    const prev = slots.get(key) || '';
                    slots.set(key, selected);
                    editingKey = '';
                    renderGrid();
                    try {
                        await saveSlot(day, period, selected);
                        toast('Period mapped');
                    } catch (_) {
                        slots.set(key, prev);
                        renderGrid();
                        toast('Could not save this period', true);
                    }
                });

                sel.addEventListener('blur', () => {
                    editingKey = '';
                    renderGrid();
                });
            });
        }

        async function clearWeek() {
            const ok = confirm('Clear all 48 period mappings for this week?');
            if (!ok) return;
            const base = await resolveApi();
            setStatus('Clearing...', 'saving');
            const res = await fetch(`${base}/api/teacher/timetable/me`, {
                method: 'DELETE',
                headers: authHeaders(),
                credentials: 'include'
            });
            if (!res.ok) {
                setStatus('Clear failed', 'error');
                toast('Failed to clear week', true);
                return;
            }
            slots.clear();
            renderGrid();
            setStatus('Synced');
            toast('Week cleared');
        }

        function bindTopControls() {
            const clearBtn = $('#clearWeekBtn');
            if (clearBtn) clearBtn.addEventListener('click', clearWeek);
            const clearBtnMobile = $('#clearWeekBtnMobile');
            if (clearBtnMobile) clearBtnMobile.addEventListener('click', clearWeek);
        }

        async function init() {
            bindTopControls();
            try {
                await loadClasses();
                await loadTimetable();
                renderGrid();
                setStatus('Synced');
            } catch (e) {
                console.error(e);
                toast('Unable to load timetable data', true);
                setStatus('Load failed', 'error');
                const badge = $('#classCountBadge');
                if (badge) badge.textContent = 'Failed to load classes/time table';
            }
        }

        document.addEventListener('DOMContentLoaded', init);
