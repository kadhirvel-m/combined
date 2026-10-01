// Extracted from ui/print/shop/payments.html (inline <script> #2).
        const Rs = n => typeof n === 'number' && isFinite(n) ? '₹' + n.toFixed(0) : '₹0';
        const API = (window.API_BASE || window.__API_BASE || '').replace(/\/$/, '');
        const getToken = () => { try { return localStorage.getItem('px_token'); } catch (_) { return null; } };
        const yEl = document.getElementById('y'); if (yEl) yEl.textContent = new Date().getFullYear();
        const toggles = [document.getElementById('themeToggle'), document.getElementById('themeToggleSm')].filter(Boolean);
        function syncThemeIcon() { const dark = document.documentElement.classList.contains('dark'); toggles.forEach(btn => { const i = btn.querySelector('.material-symbols-rounded'); if (i) i.textContent = dark ? 'light_mode' : 'dark_mode'; }); }
        toggles.forEach(btn => btn.addEventListener('click', () => { document.documentElement.classList.toggle('dark'); localStorage.setItem('px_theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light'); syncThemeIcon(); })); syncThemeIcon();

        // ACCENT color from CSS - charts and accents should follow the CSS variable
        const ACCENT = (getComputedStyle(document.documentElement).getPropertyValue('--px-accent') || '#9E4B8A').trim();
        function hexToRgba(hex, a) { try { hex = (hex || '').replace('#', ''); if (hex.length === 3) hex = hex.split('').map(c => c + c).join(''); const r = parseInt(hex.slice(0, 2), 16), g = parseInt(hex.slice(2, 4), 16), b = parseInt(hex.slice(4, 6), 16); return `rgba(${r},${g},${b},${a})`; } catch (_) { return `rgba(158,75,138,${a})`; } }

        let JOBS = []; let chartTrend = null, chartStatus = null, chartSplit = null;
        // Helper: determine a completion timestamp for a job (prefer explicit completed/released, fall back to updated_at, then created_at)
        function completionTs(j) {
            return (j && (j.completed_at || j.released_at || j.updated_at || j.completedAt || j.releasedAt || j.updatedAt || j.created_at || j.createdAt)) || '';
        }
        function completionDateKey(j) { const ts = completionTs(j); return ts ? String(ts).slice(0, 10) : ''; }
        const tones = { submitted: ['bg-sky-500/15', 'text-sky-700', 'ring-sky-500/30'], accepted: ['bg-indigo-500/15', 'text-indigo-700', 'ring-indigo-500/30'], printing: ['bg-amber-500/15', 'text-amber-700', 'ring-amber-500/30'], ready: ['bg-emerald-500/15', 'text-emerald-700', 'ring-emerald-500/30'], completed: ['bg-neutral-500/15', 'text-neutral-700', 'ring-neutral-500/30'], cancelled: ['bg-rose-500/15', 'text-rose-700', 'ring-rose-500/30'] };
        const badge = (txt, t) => `<span class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${t[0]} ${t[1]} ring-1 ${t[2]}">${txt}</span>`;

        function clamp14() { const days = [], labels = []; const now = new Date(); for (let i = 13; i >= 0; i--) { const d = new Date(now); d.setDate(now.getDate() - i); const key = d.toISOString().slice(0, 10); days.push(key); labels.push(d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })); } return { days, labels }; }

        function setFetchError(v) { const b = document.getElementById('fetchError'); if (b) b.classList.toggle('hidden', !v); }
        function setLastUpdated() { const el = document.getElementById('lastUpdated'); if (el) el.textContent = new Date().toLocaleTimeString(); }

        function renderTables() {
            const collected = (JOBS || []).filter(j => (j.status || '') === 'completed');
            const pending = (JOBS || []).filter(j => (j.status || '') !== 'completed');
            const cT = document.getElementById('collectedTbody');
            const pT = document.getElementById('pendingTbody');
            cT.innerHTML = collected.map(j => {
                const amt = typeof j.estimated_price === 'number' ? j.estimated_price : 0;
                const cust = j.contact_name || j.customer_name || '—';
                const dateDisplay = completionTs(j) ? String(completionTs(j)).replace('T', ' ').slice(0, 16) : ((j.created_at || '').replace('T', ' ').slice(0, 16));
                return `<tr>
                    <td class="px-2 py-2 font-medium">${(j.id || '').slice(0, 8)}</td>
                    <td class="px-2 py-2">${cust}</td>
                    <td class="px-2 py-2">${Rs(amt)}</td>
                    <td class="px-2 py-2">${dateDisplay}</td>
                    <td class="px-2 py-2"><button class="text-sm rounded-full px-3 py-1 ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/10" data-conv="${j.id}">View</button></td>
                </tr>`;
            }).join('');
            pT.innerHTML = pending.map(j => {
                const amt = typeof j.estimated_price === 'number' ? j.estimated_price : null;
                const cust = j.contact_name || j.customer_name || '—';
                const st = String(j.status || ''); const t = tones[st] || tones.submitted;
                return `<tr>
          <td class="px-2 py-2 font-medium">${(j.id || '').slice(0, 8)}</td>
          <td class="px-2 py-2">${cust}</td>
          <td class="px-2 py-2">${amt == null ? '—' : Rs(amt)}</td>
          <td class="px-2 py-2">${badge(st[0].toUpperCase() + st.slice(1), t)}</td>
                    <td class="px-2 py-2">${(j.created_at || '').replace('T', ' ').slice(0, 16)}</td>
          <td class="px-2 py-2"><button class="text-sm rounded-full px-3 py-1 ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/10" data-conv="${j.id}">View</button></td>
        </tr>`;
            }).join('');
            // bind
            document.querySelectorAll('[data-conv]').forEach(btn => btn.addEventListener('click', () => openConversation(btn.getAttribute('data-conv'))));
        }

        function updateKPIs() {
            const todayKey = new Date().toISOString().slice(0, 10);
            const isToday = j => completionDateKey(j) === todayKey && (j.status || '') === 'completed';
            const todayJobs = (JOBS || []).filter(isToday);
            const collectedToday = todayJobs.reduce((a, j) => a + (typeof j.estimated_price === 'number' ? j.estimated_price : 0), 0);
            const completed = (JOBS || []).filter(j => (j.status || '') === 'completed');
            const revenue = completed.reduce((a, j) => a + (typeof j.estimated_price === 'number' ? j.estimated_price : 0), 0);
            const aov = completed.length ? (revenue / completed.length) : 0;
            // week
            const now = new Date(); const day = now.getDay(); const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
            const weekStart = new Date(now.setDate(diff)); const ws = weekStart.toISOString().slice(0, 10);
            const thisWeek = (JOBS || []).filter(j => (j.status || '') === 'completed' && completionDateKey(j) >= ws);
            const weekAmt = thisWeek.reduce((a, j) => a + (typeof j.estimated_price === 'number' ? j.estimated_price : 0), 0);
            const pendingAmt = (JOBS || []).filter(j => (j.status || '') !== 'completed').reduce((a, j) => a + (typeof j.estimated_price === 'number' ? j.estimated_price : 0), 0);
            // deltas (today vs yesterday, this week vs last week)
            const y = new Date(); y.setDate(y.getDate() - 1); const yKey = y.toISOString().slice(0, 10);
            const yAmt = (JOBS || []).filter(j => (j.status || '') === 'completed' && completionDateKey(j) === yKey).reduce((a, j) => a + (typeof j.estimated_price === 'number' ? j.estimated_price : 0), 0);
            const lastWeekStart = new Date(weekStart); lastWeekStart.setDate(lastWeekStart.getDate() - 7); const lws = lastWeekStart.toISOString().slice(0, 10);
            const lastWeekEnd = new Date(weekStart); lastWeekEnd.setDate(lastWeekEnd.getDate() - 1); const lwe = lastWeekEnd.toISOString().slice(0, 10);
            const lwAmt = (JOBS || []).filter(j => (j.status || '') === 'completed' && completionDateKey(j) >= lws && completionDateKey(j) <= lwe).reduce((a, j) => a + (typeof j.estimated_price === 'number' ? j.estimated_price : 0), 0);

            const pct = (now, prev) => { if (!prev && !now) return 0; if (!prev) return 100; return ((now - prev) / prev) * 100; };
            const todayPct = pct(collectedToday, yAmt);
            const weekPct = pct(weekAmt, lwAmt);

            document.getElementById('kCollectedToday').textContent = Rs(collectedToday);
            document.getElementById('kWeek').textContent = Rs(weekAmt);
            document.getElementById('kPending').textContent = Rs(pendingAmt);
            document.getElementById('kAOV').textContent = Rs(aov);
            document.getElementById('kCollectedTodayDelta').textContent = `${todayPct >= 0 ? '+' : ''}${todayPct.toFixed(1)}% vs yesterday`;
            document.getElementById('kWeekDelta').textContent = `${weekPct >= 0 ? '+' : ''}${weekPct.toFixed(1)}% vs last week`;
            document.getElementById('kAOVDelta').textContent = 'Based on completed';
        }

        function updateCharts() {
            const { days, labels } = clamp14();
            const series = days.map(key => (JOBS || []).filter(j => (j.status || '') === 'completed' && completionDateKey(j) === key).reduce((a, j) => a + (typeof j.estimated_price === 'number' ? j.estimated_price : 0), 0));
            if (!chartTrend) {
                chartTrend = new Chart(document.getElementById('chartTrend'), { type: 'line', data: { labels, datasets: [{ label: 'Collected', data: series, borderColor: ACCENT, backgroundColor: hexToRgba(ACCENT, 0.15), fill: true, tension: .35, pointRadius: 0 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,.06)' } } } } });
            } else { chartTrend.data.labels = labels; chartTrend.data.datasets[0].data = series; chartTrend.update(); }
            const sts = ['submitted', 'accepted', 'printing', 'ready', 'completed', 'cancelled'];
            const counts = sts.map(s => (JOBS || []).filter(j => (j.status || '') === s).length);
            if (!chartStatus) { chartStatus = new Chart(document.getElementById('chartStatus'), { type: 'bar', data: { labels: sts.map(s => s[0].toUpperCase() + s.slice(1)), datasets: [{ label: 'Orders', data: counts, backgroundColor: ['#4C2A59', '#9E4B8A', '#B06AB3', '#7E57C2', '#26A69A', '#EF5350'] }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } } }); }
            else { chartStatus.data.datasets[0].data = counts; chartStatus.update(); }
            const total = (JOBS || []).length; const done = (JOBS || []).filter(j => (j.status || '') === 'completed').length; const pend = total - done;
            if (!chartSplit) { chartSplit = new Chart(document.getElementById('chartSplit'), { type: 'doughnut', data: { labels: ['Collected', 'Pending'], datasets: [{ data: [done, pend], backgroundColor: ['var(--px-bg-dark)', 'var(--px-accent)'] }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } } }); }
            else { chartSplit.data.datasets[0].data = [done, pend]; chartSplit.update(); }
        }

        function isoWeek(d) { d = new Date(d); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + 4 - (d.getDay() || 7)); const yearStart = new Date(d.getFullYear(), 0, 1); const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7); return d.getFullYear() + "-W" + String(week).padStart(2, '0'); }
        function updateWeekly() {
            const map = {}; (JOBS || []).forEach(j => { const k = isoWeek(completionTs(j) || (j.created_at || new Date())); if (!map[k]) map[k] = { orders: 0, collected: 0, pending: 0 }; map[k].orders++; if ((j.status || '') === 'completed') map[k].collected += (typeof j.estimated_price === 'number' ? j.estimated_price : 0); else map[k].pending += (typeof j.estimated_price === 'number' ? j.estimated_price : 0); });
            const rows = Object.keys(map).sort().slice(-8).map(k => `<tr><td class="px-2 py-2 font-medium">${k}</td><td class="px-2 py-2">${map[k].orders}</td><td class="px-2 py-2">${Rs(map[k].collected)}</td><td class="px-2 py-2">${Rs(map[k].pending)}</td></tr>`).join('');
            document.getElementById('weeklyTbody').innerHTML = rows;
        }

        function applyFilters() {
            const s = document.getElementById('fltStatus').value;
            const min = Number(document.getElementById('fltMin').value || 0) || 0;
            const txt = (document.getElementById('fltSearch').value || '').toLowerCase();
            const date = document.getElementById('fltDate').value || '';
            let list = (JOBS || []).slice();
            list = list.filter(j => (!date || (j.created_at || '').slice(0, 10) === date) && (!txt || (`${j.id || ''} ${j.contact_name || ''} ${j.customer_name || ''}`).toLowerCase().includes(txt)) && (min <= 0 || (typeof j.estimated_price === 'number' && j.estimated_price >= min)));
            if (s === 'collected') list = list.filter(j => (j.status || '') === 'completed');
            if (s === 'pending') list = list.filter(j => (j.status || '') !== 'completed');
            // re-render tables from filtered projection
            const orig = JOBS; JOBS = list; renderTables(); JOBS = orig;
        }

        function toCSV(rows) { return rows.map(r => r.map(v => '"' + String(v).replaceAll('"', '""') + '"').join(',')).join('\r\n'); }
        function exportCSV() {
            const head = ['Order', 'Customer', 'Amount', 'Status', 'Created'];
            const rows = (JOBS || []).map(j => [j.id || '', j.contact_name || j.customer_name || '', (typeof j.estimated_price === 'number' ? j.estimated_price : ''), (j.status || ''), (j.created_at || '')]);
            const csv = toCSV([head].concat(rows));
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = 'payments.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
        }

        async function openConversation(jobId) {
            try {
                const token = getToken(); const hdr = token ? { Authorization: 'Bearer ' + token } : {};
                const r = await fetch(`${API}/api/orders/${encodeURIComponent(jobId)}`, { headers: hdr });
                if (!r.ok) throw new Error('fetch-failed');
                const data = await r.json();
                const evs = (data && data.events) || [];
                const wrap = document.getElementById('convContent');
                wrap.innerHTML = evs.map(e => `<div class="rounded-xl p-3 ring-1 ring-black/5 dark:ring-white/10 bg-white/80 dark:bg-white/10"><div class="text-[12px] opacity-70">${(e.created_at || '').replace('T', ' ').slice(0, 16)}</div><div class="mt-1 text-sm font-medium">${e.status || ''}</div><div class="text-[13px]">${e.note || ''}</div></div>`).join('') || '<div class="text-[13px] opacity-70">No conversation yet.</div>';
                document.getElementById('convModal').classList.remove('hidden');
            } catch (_) { document.getElementById('convContent').innerHTML = '<div class="text-[13px] text-rose-600">Could not load conversation.</div>'; document.getElementById('convModal').classList.remove('hidden'); }
        }

        async function load() {
            try {
                const token = getToken(); if (!API || !token) return;
                const r = await fetch(`${API}/api/shop/jobs`, { headers: { Authorization: 'Bearer ' + token } });
                if (!r.ok) throw new Error('HTTP ' + r.status);
                const data = await r.json();
                let jobs = (data && data.jobs) || [];
                jobs.forEach(j => { if (!j.created_at && j.createdAt) j.created_at = j.createdAt; if (typeof j.settings === 'string') { try { j.settings = JSON.parse(j.settings); } catch (_) { } } });
                JOBS = jobs.sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
                updateKPIs(); updateCharts(); updateWeekly(); renderTables(); setLastUpdated(); setFetchError(false);
                applyFilters();
            } catch (e) { setFetchError(true); }
        }

        document.addEventListener('DOMContentLoaded', () => {
            load(); setInterval(load, 30000);
            document.querySelectorAll('[data-close]').forEach(n => n.addEventListener('click', () => document.getElementById('convModal').classList.add('hidden')));
            document.getElementById('fltStatus').addEventListener('change', applyFilters);
            document.getElementById('fltMin').addEventListener('input', applyFilters);
            document.getElementById('fltSearch').addEventListener('input', applyFilters);
            document.getElementById('fltDate').addEventListener('change', applyFilters);
            document.getElementById('fltReset').addEventListener('click', () => { ['fltDate', 'fltStatus', 'fltMin', 'fltSearch'].forEach(id => { const el = document.getElementById(id); if (!el) return; if (el.tagName === 'SELECT') el.value = 'all'; else el.value = ''; }); renderTables(); });
            document.getElementById('btnExport').addEventListener('click', exportCSV);
        });
