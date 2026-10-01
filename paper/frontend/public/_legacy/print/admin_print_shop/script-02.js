// Extracted from ui/print/admin_print_shop.html (inline <script> #2).
        const API = (window.API_BASE || window.__API_BASE || '').replace(/\/$/, '');
        const getToken = () => { try { return localStorage.getItem('px_token'); } catch (_) { return null; } };
        const Rs = n => (typeof n === 'number' && isFinite(n)) ? ('₹' + n.toFixed(0)) : '₹0';
        const esc = s => (s || '').toString().replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]));
        document.getElementById('y').textContent = new Date().getFullYear();

        const P = new URLSearchParams(location.search);
        const shopId = P.get('shopId') || '';
        let JOBS = [];

        function setShopHeader(shop) {
            const l = document.getElementById('logoWrap');
            if (shop.logo_url) { l.innerHTML = `<img src="${esc(shop.logo_url)}" class="h-16 w-16 rounded-xl object-cover ring-soft">`; }
            document.getElementById('shopName').textContent = shop.name || '—';
            document.getElementById('shopAddr').textContent = shop.address || '—';
            const contact = [shop.phone || '', shop.email || ''].filter(Boolean).join(' • ');
            document.getElementById('shopContact').textContent = contact || '—';
        }

        function render() {
            const pending = JOBS.filter(j => (j.status || '') !== 'completed' && (j.status || '') !== 'cancelled' && (j.status || '') !== 'settled' && (j.status || '') !== 'closed');
            const completed = JOBS.filter(j => (j.status || '') === 'completed' || (j.status || '') === 'settled');
            const tbP = document.getElementById('tbPending');
            const tbC = document.getElementById('tbCompleted');
            document.getElementById('cntPending').textContent = `${pending.length} orders`;
            document.getElementById('cntCompleted').textContent = `${completed.length} orders`;
            tbP.innerHTML = pending.map(j => `<tr>
        <td class="px-2 py-2 font-medium">${(j.id || '').slice(0, 8)}</td>
        <td class="px-2 py-2">${esc(j.contact_name || '—')}</td>
        <td class="px-2 py-2">${esc(j.contact_phone || '—')}</td>
        <td class="px-2 py-2">${esc(j.status || '')}</td>
        <td class="px-2 py-2">${(j.created_at || '').replace('T', ' ').slice(0, 16)}</td>
        <td class="px-2 py-2 text-right">
            <button class="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] ring-1 ring-rose-500/50 text-rose-700 bg-rose-500/10 hover:bg-rose-500/15" data-close-id="${esc(j.id)}">
                <span class="material-symbols-rounded text-sm">close</span> Close
            </button>
        </td>
      </tr>`).join('');
            tbC.innerHTML = completed.map(j => {
                const settledBadge = (j.status || '') === 'settled' ? `<span class="ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/30">Settled</span>` : '';
                return `<tr>
        <td class="px-2 py-2 font-medium">${(j.id || '').slice(0, 8)}</td>
        <td class="px-2 py-2">${Rs(typeof j.estimated_price === 'number' ? j.estimated_price : 0)}</td>
                <td class="px-2 py-2">${(j.updated_at || '').replace('T', ' ').slice(0, 16)}${settledBadge}</td>
            </tr>`;
            }).join('');
            const sum = completed.reduce((a, j) => a + (typeof j.estimated_price === 'number' ? j.estimated_price : 0), 0);
            document.getElementById('sumCompleted').textContent = Rs(sum);
            // Enable/disable settle button based on unsettled-completed
            const btn = document.getElementById('btnSettle');
            const unsettled = JOBS.filter(j => (j.status || '') === 'completed');
            btn.disabled = unsettled.length === 0;
        }

        async function fetchShop() {
            const token = getToken();
            const hdr = token ? { Authorization: 'Bearer ' + token } : {};
            // We don't have a direct admin shop detail route; reuse list and filter client-side
            const r = await fetch(`${API}/api/admin/print/shops?limit=5000`, { headers: hdr });
            if (!r.ok) throw new Error('shops');
            const j = await r.json();
            const list = (j && j.shops) || [];
            const shop = list.find(s => String(s.id) === String(shopId));
            if (!shop) throw new Error('shop-not-found');
            setShopHeader(shop);
        }

        async function fetchJobs() {
            const token = getToken();
            const hdr = token ? { Authorization: 'Bearer ' + token } : {};
            const r = await fetch(`${API}/api/admin/print/shops/${encodeURIComponent(shopId)}/jobs?limit=2000`, { headers: hdr });
            if (!r.ok) throw new Error('jobs');
            const j = await r.json();
            JOBS = (j && j.jobs) || [];
            render();
        }

        // Close order helpers
        let __closeJobId = null;
        function openCloseModal(jobId) {
            __closeJobId = jobId;
            const text = document.getElementById('modalCloseText');
            text.textContent = `Are you sure you want to close order ${String(jobId).slice(0, 8)}? This cannot be undone.`;
            const mdl = document.getElementById('modalClose');
            const panel = document.getElementById('modalClosePanel');
            mdl.classList.remove('hidden'); mdl.classList.add('flex');
            requestAnimationFrame(() => { panel.classList.remove('opacity-0', 'scale-95'); });
        }
        function closeCloseModal() {
            __closeJobId = null;
            const mdl = document.getElementById('modalClose');
            const panel = document.getElementById('modalClosePanel');
            panel.classList.add('opacity-0', 'scale-95');
            setTimeout(() => { mdl.classList.add('hidden'); mdl.classList.remove('flex'); }, 180);
        }
        async function closeJob() {
            if (!__closeJobId) return;
            const st = document.getElementById('settleStatus');
            st.textContent = 'Closing…';
            try {
                const token = getToken(); const hdr = token ? { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token } : { 'Content-Type': 'application/json' };
                const r = await fetch(`${API}/api/admin/print/shops/${encodeURIComponent(shopId)}/jobs/${encodeURIComponent(__closeJobId)}/close`, { method: 'POST', headers: hdr });
                const j = await r.json().catch(() => ({}));
                if (!r.ok) { throw new Error(j.detail || ('HTTP ' + r.status)); }
                st.textContent = 'Order closed.';
                await fetchJobs();
            } catch (e) { st.textContent = 'Failed to close order.'; }
            finally { closeCloseModal(); }
        }

        function showSettleModal() {
            const mdl = document.getElementById('modalSettle');
            const panel = document.getElementById('modalSettlePanel');
            const text = document.getElementById('modalText');
            const { count, total } = getUnsettledTotals();
            if (count === 0) {
                text.textContent = 'No completed orders to settle.';
                document.getElementById('btnConfirmModal').disabled = true;
            } else {
                text.textContent = `Settle ${count} completed order${count > 1 ? 's' : ''} totaling ${Rs(total)}?`;
                document.getElementById('btnConfirmModal').disabled = false;
            }
            mdl.classList.remove('hidden');
            mdl.classList.add('flex');
            requestAnimationFrame(() => { panel.classList.remove('opacity-0', 'scale-95'); });
        }

        function closeSettleModal() {
            const mdl = document.getElementById('modalSettle');
            const panel = document.getElementById('modalSettlePanel');
            panel.classList.add('opacity-0', 'scale-95');
            setTimeout(() => { mdl.classList.add('hidden'); mdl.classList.remove('flex'); }, 180);
        }

        function getUnsettledTotals() {
            const list = JOBS.filter(j => (j.status || '') === 'completed');
            const total = list.reduce((a, j) => a + (typeof j.estimated_price === 'number' ? j.estimated_price : 0), 0);
            return { count: list.length, total };
        }

        async function settle() {
            const btn = document.getElementById('btnSettle');
            const st = document.getElementById('settleStatus');
            btn.disabled = true; st.textContent = 'Settling…';
            try {
                const token = getToken(); const hdr = token ? { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token } : { 'Content-Type': 'application/json' };
                const r = await fetch(`${API}/api/admin/print/shops/${encodeURIComponent(shopId)}/settle`, { method: 'POST', headers: hdr });
                const j = await r.json().catch(() => ({}));
                if (!r.ok) { throw new Error(j.detail || ('HTTP ' + r.status)); }
                st.textContent = `Settled ${j.settled_count || 0} orders • ${j.settled_amount != null ? Rs(j.settled_amount) : '₹0'}`;
                await fetchJobs();
            } catch (e) { st.textContent = 'Failed to settle.'; }
            finally { btn.disabled = false; closeSettleModal(); }
        }

        document.addEventListener('DOMContentLoaded', () => {
            if (!shopId) { location.replace('admin_print.html'); return; }
            fetchShop().then(fetchJobs).catch(() => { location.replace('admin_print.html'); });
            // Button opens modal
            document.getElementById('btnSettle').addEventListener('click', showSettleModal);
            // Modal controls
            document.getElementById('btnCancelModal').addEventListener('click', closeSettleModal);
            document.getElementById('btnXModal').addEventListener('click', closeSettleModal);
            document.getElementById('modalSettle').addEventListener('click', (e) => { if (e.target && e.target.getAttribute('data-close') === '1') closeSettleModal(); });
            document.getElementById('btnConfirmModal').addEventListener('click', settle);
            window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSettleModal(); });

            // Wire close buttons (event delegation)
            document.addEventListener('click', (e) => {
                const t = e.target.closest('[data-close-id]');
                if (t) { e.preventDefault(); openCloseModal(t.getAttribute('data-close-id')); }
            });
            // Close modal wiring
            document.getElementById('btnCancelClose').addEventListener('click', closeCloseModal);
            document.getElementById('btnXClose').addEventListener('click', closeCloseModal);
            document.getElementById('modalClose').addEventListener('click', (e) => { if (e.target && e.target.getAttribute('data-close') === '1') closeCloseModal(); });
            document.getElementById('btnConfirmClose').addEventListener('click', closeJob);
        });
