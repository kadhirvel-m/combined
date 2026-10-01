// Extracted from ui/print/admin_print.html (inline <script> #2).
        const API = (window.API_BASE || window.__API_BASE || '').replace(/\/$/, '');
        const getToken = () => { try { return localStorage.getItem('px_token'); } catch (_) { return null; } };
        const yEl = document.getElementById('y'); if (yEl) yEl.textContent = new Date().getFullYear();

        function Rs(n) { return typeof n === 'number' && isFinite(n) ? '₹' + n.toFixed(0) : '₹0'; }
        function esc(s) { return (s || '').toString().replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c])); }

        function badge(txt, tone) { return `<span class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${tone}">${txt}</span>`; }
        function toneFor(shop) { if (shop.paused) return 'bg-amber-500/15 text-amber-700 ring-1 ring-amber-500/30'; return shop.is_open ? 'bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/30' : 'bg-neutral-500/15 text-neutral-700 ring-1 ring-neutral-500/30'; }

        async function ensureAdmin() {
            const token = getToken(); if (!token) return false;
            try {
                const r = await fetch(`${API}/api/admin/roles/me`, { headers: { Authorization: 'Bearer ' + token } });
                if (!r.ok) return false; const j = await r.json();
                return (String(j.role || '').toLowerCase() === 'admin');
            } catch (_) { return false; }
        }

        function render(rows) {
            const tbody = document.getElementById('tbody');
            const q = (document.getElementById('q').value || '').trim().toLowerCase();
            const f = document.getElementById('fltOpen').value;
            let list = rows.slice();
            if (q) { list = list.filter(r => (`${r.name || ''} ${r.email || ''} ${r.phone || ''} ${r.address || ''}`).toLowerCase().includes(q)); }
            if (f === 'open') list = list.filter(r => !!r.is_open && !r.paused);
            if (f === 'closed') list = list.filter(r => !r.is_open);
            if (f === 'paused') list = list.filter(r => !!r.paused);
            const html = list.map(r => {
                const logo = r.logo_url ? `<img src="${esc(r.logo_url)}" alt="logo" class="h-9 w-9 rounded-md ring-soft object-cover">` : `<span class="h-9 w-9 rounded-md ring-soft inline-flex items-center justify-center bg-black/5 dark:bg-white/10">${esc((r.name || '').slice(0, 1).toUpperCase())}</span>`;
                const status = badge(r.paused ? 'Paused' : (r.is_open ? 'Open' : 'Closed'), toneFor(r));
                const rating = (r.rating != null) ? Number(r.rating).toFixed(1) : '—';
                const updated = (r.updated_at || '').replace('T', ' ').slice(0, 16);
                const href = `admin_print_shop.html?shopId=${encodeURIComponent(r.id || '')}`;
                return `<tr class="row cursor-pointer" onclick="location.href='${href}'">
          <td class="px-3 py-2">
            <div class="flex items-center gap-3">
              ${logo}
              <div>
                                <div class="font-semibold underline decoration-dotted">${esc(r.name || '')}</div>
                <div class="text-[12px] opacity-70">${esc(r.address || '')}</div>
              </div>
            </div>
          </td>
          <td class="px-3 py-2">
            <div class="text-[13px]">${esc(r.phone || '—')}</div>
            <div class="text-[12px] opacity-70">${esc(r.email || '—')}</div>
          </td>
          <td class="px-3 py-2">${status}</td>
          <td class="px-3 py-2">${rating}</td>
          <td class="px-3 py-2">${updated}</td>
        </tr>`;
            }).join('');
            tbody.innerHTML = html || `<tr><td colspan="5" class="px-3 py-6 text-center text-[13px] opacity-70">No shops found.</td></tr>`;
        }

        async function load() {
            const token = getToken(); if (!API || !token) return;
            const ok = await ensureAdmin();
            const err = document.getElementById('err');
            if (!ok) { err.classList.remove('hidden'); return; }
            try {
                const r = await fetch(`${API}/api/admin/print/shops`, { headers: { Authorization: 'Bearer ' + token } });
                if (!r.ok) throw new Error('HTTP ' + r.status);
                const j = await r.json();
                window.__ADMIN_SHOPS__ = (j && j.shops) || [];
                render(window.__ADMIN_SHOPS__);
            } catch (e) { err.textContent = 'Could not load shops.'; err.classList.remove('hidden'); }
        }

        document.addEventListener('DOMContentLoaded', () => {
            load();
            ['q', 'fltOpen'].forEach(id => { const el = document.getElementById(id); if (el) el.addEventListener('input', () => render(window.__ADMIN_SHOPS__ || [])); });
            document.getElementById('btnReload').addEventListener('click', load);
        });
