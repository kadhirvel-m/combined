// Extracted from ui/print/shop/dashboard.html (inline <script> #3).
        // Live data wiring with real backend (FastAPI)
        const API = (window.API_BASE || window.__API_BASE || '').replace(/\/$/, '');
        const getToken = () => { try { return localStorage.getItem('px_token'); } catch (_) { return null; } };

        // Badges
        const badge = (txt, tone) => `<span class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${tone.bg} ${tone.text} ring-1 ${tone.ring}">${txt}</span>`;
        const tones = {
            submitted: { bg: 'bg-sky-500/15', text: 'text-sky-700', ring: 'ring-sky-500/30' },
            accepted: { bg: 'bg-indigo-500/15', text: 'text-indigo-700', ring: 'ring-indigo-500/30' },
            printing: { bg: 'bg-amber-500/15', text: 'text-amber-700', ring: 'ring-amber-500/30' },
            ready: { bg: 'bg-emerald-500/15', text: 'text-emerald-700', ring: 'ring-emerald-500/30' },
            completed: { bg: 'bg-neutral-500/15', text: 'text-neutral-700', ring: 'ring-neutral-500/30' },
            cancelled: { bg: 'bg-rose-500/15', text: 'text-rose-700', ring: 'ring-rose-500/30' },
            new: { bg: 'bg-sky-500/15', text: 'text-sky-700', ring: 'ring-sky-500/30' },
            processing: { bg: 'bg-amber-500/15', text: 'text-amber-700', ring: 'ring-amber-500/30' },
            picked: { bg: 'bg-neutral-500/15', text: 'text-neutral-700', ring: 'ring-neutral-500/30' },
        };

        // State
        let JOBS = [];
        let chartRev = null, chartSt = null, chartPay = null;

        // Utils
        const Rs = n => typeof n === 'number' && isFinite(n) ? `₹${n.toFixed(0)}` : '₹0';
        const fmtTime = s => { try { const d = new Date(s); return d.toLocaleString([], { hour: '2-digit', minute: '2-digit' }); } catch (_) { return s || ''; } };
        const fmtDate = s => { try { const d = new Date(s); return d.toLocaleDateString(); } catch (_) { return s || ''; } };
        const clamp14 = () => {
            const days = []; const labels = [];
            const now = new Date();
            for (let i = 13; i >= 0; i--) { const d = new Date(now); d.setDate(now.getDate() - i); const key = d.toISOString().slice(0, 10); days.push(key); labels.push(d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })); }
            return { days, labels };
        };

        // Render Orders table
        function renderOrders(list) {
            const tbody = document.getElementById('ordersTbody');
            if (!tbody) return;
            tbody.innerHTML = (list || []).map(o => {
                const status = o.status || 'submitted';
                const tone = tones[status] || tones.submitted;
                const pages = (o.estimated_pages != null ? o.estimated_pages : (o.settings && (o.settings.pages || o.settings.page_count))) || '-';
                const amt = (o.estimated_price != null ? o.estimated_price : null);
                const cust = o.contact_name || o.customer_name || '—';
                return `
          <tr>
            <td class="px-2 py-2 font-medium">${o.id || '—'}</td>
            <td class="px-2 py-2">${cust}</td>
            <td class="px-2 py-2">${pages}</td>
            <td class="px-2 py-2">${amt == null ? '—' : Rs(amt)}</td>
            <td class="px-2 py-2">${badge(status, tone)}</td>
            <td class="px-2 py-2">Counter</td>
            <td class="px-2 py-2">${fmtDate(o.created_at) || '—'}</td>
          </tr>`;
            }).join('');
        }

        // Filters
        const fRange = document.getElementById('fltRange');
        const fStatus = document.getElementById('fltStatus');
        const fChannel = document.getElementById('fltChannel');
        const fPayment = document.getElementById('fltPayment');
        const fSearch = document.getElementById('fltSearch');
        const fReset = document.getElementById('fltReset');
        function applyFilters() {
            const sTxt = (fSearch.value || '').toLowerCase();
            const sSt = fStatus.value;
            const sPay = fPayment.value;
            const filtered = (JOBS || []).filter(o =>
                (sSt === 'all' || (o.status || '') === sSt) &&
                (sPay === 'all' || sPay === 'Counter') &&
                (sTxt === '' || `${o.id || ''} ${o.contact_name || ''} ${(o.estimated_pages || '')}`.toLowerCase().includes(sTxt))
            );
            renderOrders(filtered);
        }
        ;[fStatus, fPayment].forEach(el => el && el.addEventListener('change', applyFilters));
        if (fSearch) fSearch.addEventListener('input', applyFilters);
        if (fReset) fReset.addEventListener('click', () => { if (fRange) fRange.value = ''; if (fStatus) fStatus.value = 'all'; if (fChannel) fChannel.value = 'all'; if (fPayment) fPayment.value = 'all'; if (fSearch) fSearch.value = ''; renderOrders(JOBS); });

        // KPIs
        function updateKPIs(jobs) {
            const revEl = document.getElementById('kpiRevenue');
            const ordEl = document.getElementById('kpiOrders');
            const aovEl = document.getElementById('kpiAOV');
            const payEl = document.getElementById('kpiPayouts');
            const revDeltaEl = document.getElementById('kpiRevenueDelta');
            const ordDeltaEl = document.getElementById('kpiOrdersDelta');
            const aovDeltaEl = document.getElementById('kpiAOVDelta');

            const completed = (jobs || []).filter(j => (j.status || '') === 'completed');
            const revenue = completed.reduce((acc, j) => acc + (typeof j.estimated_price === 'number' ? j.estimated_price : 0), 0);
            const orders = (jobs || []).length;
            const aov = (completed.length ? (revenue / completed.length) : 0);

            // 14-day delta calculations (last 7 vs previous 7)
            const { days } = clamp14();
            const dailyRev = days.map(key => (jobs || []).filter(j => (j.status || '') === 'completed' && (j.created_at || '').slice(0, 10) === key).reduce((a, j) => a + (typeof j.estimated_price === 'number' ? j.estimated_price : 0), 0));
            const dailyOrd = days.map(key => (jobs || []).filter(j => (j.created_at || '').slice(0, 10) === key).length);
            const sum = (arr, a, b) => arr.slice(a, b).reduce((x, y) => x + y, 0);
            const revLast = sum(dailyRev, 7, 14), revPrev = sum(dailyRev, 0, 7);
            const ordLast = sum(dailyOrd, 7, 14), ordPrev = sum(dailyOrd, 0, 7);
            const pct = (now, prev) => {
                if (!prev && !now) return 0; if (!prev) return 100; return ((now - prev) / prev) * 100;
            };
            const revPct = pct(revLast, revPrev);
            const ordPct = pct(ordLast, ordPrev);
            const aovLast = (ordLast ? (revLast / Math.max(1, (jobs || []).filter(j => (j.status || '') === 'completed' && days.slice(7, 14).includes((j.created_at || '').slice(0, 10))).length)) : 0);
            const aovPrev = (ordPrev ? (revPrev / Math.max(1, (jobs || []).filter(j => (j.status || '') === 'completed' && days.slice(0, 7).includes((j.created_at || '').slice(0, 10))).length)) : 0);
            const aovPct = pct(aovLast, aovPrev);

            if (revEl) revEl.textContent = Rs(revenue);
            if (ordEl) ordEl.textContent = String(orders);
            if (aovEl) aovEl.textContent = Rs(aov);
            if (payEl) payEl.textContent = Rs(0); // No online payouts yet
            if (revDeltaEl) revDeltaEl.textContent = `${revPct >= 0 ? '+' : ''}${revPct.toFixed(1)}% vs last 7d`;
            if (ordDeltaEl) ordDeltaEl.textContent = `${ordPct >= 0 ? '+' : ''}${ordPct.toFixed(1)}% vs last 7d`;
            if (aovDeltaEl) aovDeltaEl.textContent = `${aovPct >= 0 ? '+' : ''}${aovPct.toFixed(1)}% vs last 7d`;
        }

        // Charts init + update
        function initCharts() {
            const ctxRev = document.getElementById('chartRevenue');
            const ctxSt = document.getElementById('chartStatus');
            const ctxPay = document.getElementById('chartPayments');
            if (ctxRev && !chartRev) {
                chartRev = new Chart(ctxRev, {
                    type: 'line',
                    data: {
                        labels: [],
                        datasets: [{
                            label: 'Revenue', data: [], borderColor: '#9E4B8A',
                            backgroundColor: 'rgba(158,75,138,0.15)', fill: true, tension: .35, pointRadius: 0
                        }]
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false,
                        scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,.06)' } } },
                        plugins: { legend: { display: false } }
                    }
                });
            }
            if (ctxSt && !chartSt) {
                chartSt = new Chart(ctxSt, {
                    type: 'bar',
                    data: { labels: [], datasets: [{ label: 'Orders', data: [], backgroundColor: ['#4C2A59', '#9E4B8A', '#B06AB3', '#7E57C2', '#26A69A', '#EF5350'] }] },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
                });
            }
            if (ctxPay && !chartPay) {
                chartPay = new Chart(ctxPay, {
                    type: 'doughnut',
                    data: { labels: [], datasets: [{ data: [], backgroundColor: ['#1E1E2F', '#9E4B8A'] }] },
                    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10 } } } }
                });
            }
        }

        function updateCharts(jobs) {
            const { days, labels } = clamp14();
            // Revenue series: sum completed revenue per day
            const daily = days.map(key => (jobs || []).filter(j => (j.status || '') === 'completed' && (j.created_at || '').slice(0, 10) === key).reduce((a, j) => a + (typeof j.estimated_price === 'number' ? j.estimated_price : 0), 0));
            if (chartRev) { chartRev.data.labels = labels; chartRev.data.datasets[0].data = daily; chartRev.update(); }
            // Order status distribution
            const total = (jobs || []).length;
            const sts = ['submitted', 'accepted', 'printing', 'ready', 'completed', 'cancelled'];
            const counts = sts.map(s => (jobs || []).filter(j => (j.status || '') === s).length);
            if (chartSt) { chartSt.data.labels = sts.map(s => s[0].toUpperCase() + s.slice(1)); chartSt.data.datasets[0].data = counts; chartSt.update(); }
            // Payment status: Counter (completed) vs Pending (not completed)
            const completed = (jobs || []).filter(j => (j.status || '') === 'completed').length;
            const pending = total - completed;
            if (chartPay) { chartPay.data.labels = ['Counter (Completed)', 'Pending']; chartPay.data.datasets[0].data = [completed, pending]; chartPay.update(); }
        }

        // Load data
        async function fetchJSON(url, token) {
            const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        }

        async function loadData() {
            try {
                initCharts();
                const token = getToken();
                if (!API) { console.warn('API_BASE not set'); return; }
                if (!token) { console.warn('No auth token; showing placeholders'); return; }
                // Ensure shop resolved (also populates nav avatar via auth.js)
                const shop = await fetchJSON(`${API}/api/shop/me`, token).catch(() => null);
                if (shop) applyShopState(shop);
                const data = await fetchJSON(`${API}/api/shop/jobs`, token);
                const jobs = (data && data.jobs) || [];
                // Normalize date strings
                jobs.forEach(j => { if (!j.created_at && j.createdAt) j.created_at = j.createdAt; if (typeof j.settings === 'string') { try { j.settings = JSON.parse(j.settings); } catch (_) { } } });
                JOBS = jobs.sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
                updateKPIs(JOBS);
                updateCharts(JOBS);
                renderOrders(JOBS);
                setLastUpdated();
                setFetchError(false);
            } catch (e) {
                console.warn('Failed to load dashboard data:', e);
                setFetchError(true);
            }
        }

        // Last updated + error
        function setLastUpdated() { try { const el = document.getElementById('lastUpdated'); if (el) el.textContent = new Date().toLocaleTimeString(); } catch (_) { } }
        function setFetchError(v) { const b = document.getElementById('fetchError'); if (b) b.classList.toggle('hidden', !v); }

        // Shop status controls
        function applyShopState(shop) {
            try {
                const isOpen = !!shop.is_open;
                const paused = !!shop.paused;
                const icon = document.getElementById('shopStatusIcon');
                const text = document.getElementById('shopStatusText');
                const btnOpen = document.getElementById('btnToggleOpen');
                const btnPause = document.getElementById('btnTogglePause');
                if (icon) icon.classList.toggle('text-emerald-500', isOpen && !paused);
                if (icon) icon.classList.toggle('text-rose-500', !isOpen || paused);
                if (text) text.textContent = paused ? 'Paused' : (isOpen ? 'Open' : 'Closed');
                if (btnOpen) btnOpen.textContent = (isOpen ? 'Close' : 'Open');
                if (btnPause) btnPause.textContent = (paused ? 'Resume' : 'Pause');
                if (btnOpen && !btnOpen.__bound) { btnOpen.__bound = true; btnOpen.addEventListener('click', async () => { await patchShop({ is_open: !isOpen }); loadData(); }); }
                if (btnPause && !btnPause.__bound) { btnPause.__bound = true; btnPause.addEventListener('click', async () => { await patchShop({ paused: !paused }); loadData(); }); }
            } catch (_) { }
        }
        async function patchShop(payload) {
            try {
                const token = getToken(); if (!token) return;
                await fetch(`${API}/api/shop/me`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload || {}) });
            } catch (_) { }
        }

        // Kickoff + poll
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadData, { once: true });
        else loadData();
        setInterval(loadData, 30000); // refresh every 30s
