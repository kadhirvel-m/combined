// Extracted from ui/admin/control-panel/abuse-blocks.html (inline <script> #2).
    (function () {
      const $ = (id) => document.getElementById(id);
      const statusEl = $('status');
      const rowsEl = $('rows');

      async function ensureStaff() {
        const token = CP.getToken();
        if (!token) throw new Error('Please sign in as admin/employee first.');
        const res = await fetch(`${CP.API}/api/admin/roles/me`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.detail || `HTTP ${res.status}`);
        const role = String(data.role || '').toLowerCase();
        if (role !== 'admin' && role !== 'employee') {
          throw new Error('Admin or employee role required');
        }
        return token;
      }

      async function fetchStaffJson(path, options) {
        const token = await ensureStaff();
        const init = options || {};
        const headers = Object.assign({}, init.headers || {}, { Authorization: `Bearer ${token}` });
        if (init.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
        const res = await fetch(`${CP.API}${path}`, Object.assign({}, init, { headers }));
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.detail || `HTTP ${res.status}`);
        return data;
      }

      function esc(v) { return CP.escapeHtml(v == null ? '' : String(v)); }

      function statusBadge(item) {
        if (item.blocked) return '<span class="inline-flex rounded-full px-2 py-0.5 text-[11px] bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">Blocked</span>';
        if (item.allowlisted) return '<span class="inline-flex rounded-full px-2 py-0.5 text-[11px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">Allowlisted</span>';
        return '<span class="inline-flex rounded-full px-2 py-0.5 text-[11px] bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-white/70">Observed</span>';
      }

      function rowActions(item) {
        const ip = esc(item.ip || '');
        return [
          `<button data-action="allow_and_unblock" data-ip="${ip}" class="px-2 py-1 rounded bg-emerald-600 text-white text-xs">Allow + Unblock</button>`,
          `<button data-action="unblock" data-ip="${ip}" class="px-2 py-1 rounded bg-amber-600 text-white text-xs">Unblock</button>`,
          `<button data-action="unallow" data-ip="${ip}" class="px-2 py-1 rounded bg-slate-200 dark:bg-white/10 text-xs">Remove Allow</button>`
        ].join(' ');
      }

      function accountCell(item) {
        const accounts = Array.isArray(item.accounts) ? item.accounts : [];
        if (!accounts.length) {
          return '<span class="text-xs text-slate-500 dark:text-white/60">No account observed</span>';
        }
        const rows = accounts.map((a) => {
          const name = esc(a.name || '-');
          const email = esc(a.email || 'No email');
          return `<div class="leading-tight"><div class="font-medium">${name}</div><div class="text-[11px] text-slate-500 dark:text-white/60">${email}</div></div>`;
        }).join('');
        const extra = Number(item.accounts_count || accounts.length) - accounts.length;
        const extraHtml = extra > 0 ? `<div class="text-[11px] text-slate-500 dark:text-white/60 mt-1">+${extra} more</div>` : '';
        return `<div class="space-y-1 max-w-[260px]">${rows}${extraHtml}</div>`;
      }

      function render(items) {
        if (!items.length) {
          rowsEl.innerHTML = '<tr><td colspan="7" class="py-4 text-slate-500 dark:text-white/60">No blocked people found.</td></tr>';
          return;
        }
        rowsEl.innerHTML = items.map((item) => `
          <tr class="border-b border-black/5 dark:border-white/5 hover:bg-black/[0.02] dark:hover:bg-white/[0.04] align-top">
            <td class="py-2 font-mono text-xs">${esc(item.ip)}</td>
            <td>${accountCell(item)}</td>
            <td>${statusBadge(item)}</td>
            <td>${esc(item.score)} / ${esc(item.threshold)}</td>
            <td class="max-w-md break-words">${esc(item.reason || '-')}</td>
            <td>${esc(CP.fmtDate(item.last_seen))}</td>
            <td class="text-right space-x-1">${rowActions(item)}</td>
          </tr>
        `).join('');
      }

      async function loadList() {
        const hours = Math.max(1, Math.min(168, Number($('hours').value || 24)));
        const includeAllowlisted = $('includeAllowlisted').checked ? 'true' : 'false';
        const data = await fetchStaffJson(`/api/admin/security/abuse/blocked?hours=${hours}&include_allowlisted=${includeAllowlisted}`);
        render(data.items || []);
        CP.showStatus(statusEl, `Loaded ${Number(data.count || 0)} records.`, 'success');
      }

      async function doAction(ip, action) {
        const reason = window.prompt('Reason (optional):', 'Trusted employee');
        await fetchStaffJson('/api/admin/security/abuse/ip-action', {
          method: 'POST',
          body: JSON.stringify({ ip, action, reason: reason || null })
        });
        await loadList();
      }

      rowsEl.addEventListener('click', async (e) => {
        const btn = e.target.closest('button[data-action][data-ip]');
        if (!btn) return;
        try {
          await doAction(btn.getAttribute('data-ip') || '', btn.getAttribute('data-action') || '');
        } catch (err) {
          CP.showStatus(statusEl, err.message || 'Action failed', 'error');
        }
      });

      $('reloadBtn').addEventListener('click', () => loadList().catch((e) => CP.showStatus(statusEl, e.message || 'Reload failed', 'error')));

      (async function init() {
        CP.initPageChrome('abuse');
        try {
          await ensureStaff();
          await loadList();
        } catch (err) {
          CP.showStatus(statusEl, err.message || 'Init failed', 'error');
        }
      })();
    })();
