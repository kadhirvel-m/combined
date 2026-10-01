// Extracted from ui/admin/control-panel/manual-access.html (inline <script> #2).
    (function () {
      const $ = (id) => document.getElementById(id);
      const statusEl = $('status');
      const usersTbody = $('usersTbody');
      let selected = null;
      let manualState = null;

      function tv(id) { return ($(id).value || '').trim(); }
      function selectedUid() { return selected?.auth_user_id || ''; }

      async function loadMeta() {
        const metaRes = await fetch(`${CP.API}/api/public/academic-meta`);
        const meta = await metaRes.json().catch(() => ({}));
        const depts = meta.departments || [];
        const depSel = $('department_id');
        const depSel2 = $('new_department_id');
        depSel.innerHTML = '<option value="">All</option>';
        depSel2.innerHTML = '<option value="">Select department</option>';
        depts.forEach((d) => {
          const o1 = document.createElement('option'); o1.value = d.id; o1.textContent = d.name || d.id; depSel.appendChild(o1);
          const o2 = document.createElement('option'); o2.value = d.id; o2.textContent = d.name || d.id; depSel2.appendChild(o2);
        });

        try {
          const bRes = await fetch(`${CP.API}/api/batches`);
          const bData = await bRes.json().catch(() => ({}));
          const batchSel = $('batch_id');
          batchSel.innerHTML = '<option value="">All</option>';
          (bData.batches || []).forEach((b) => {
            const o = document.createElement('option');
            o.value = b.id;
            o.textContent = b.range || `${b.from_year || ''}-${b.to_year || ''}`;
            batchSel.appendChild(o);
          });
        } catch (_) { }
      }

      async function loadPlans() {
        const data = await CP.fetchJson('/api/admin/plans');
        const select = $('plan_id');
        select.innerHTML = '<option value="">Select plan</option>';
        (data.plans || []).filter((p) => p.active_status).forEach((p) => {
          const o = document.createElement('option');
          o.value = p.id;
          o.textContent = `${p.name} (₹${Number(p.price_inr || 0).toFixed(0)})`;
          select.appendChild(o);
        });
      }

      function renderUsers(rows) {
        if (!rows.length) {
          usersTbody.innerHTML = '<tr><td colspan="3" class="py-4 text-slate-500 dark:text-white/60">No users.</td></tr>';
          return;
        }
        usersTbody.innerHTML = rows.map((u) => `
          <tr class="border-b border-black/5 dark:border-white/5 hover:bg-black/[0.02] dark:hover:bg-white/[0.04]">
            <td class="py-2">
              <div class="font-medium">${CP.escapeHtml(u.name || 'Unnamed')}</div>
              <div class="text-xs text-slate-500 dark:text-white/60">${CP.escapeHtml(u.email || u.auth_user_id)}</div>
            </td>
            <td>${CP.escapeHtml(u.department_id || '-')}</td>
            <td class="text-right"><button data-id="${u.auth_user_id}" class="px-2 py-1 rounded bg-black/5 dark:bg-white/10 text-xs">Select</button></td>
          </tr>
        `).join('');
      }

      async function searchUsers() {
        const params = new URLSearchParams();
        if (tv('q')) params.set('q', tv('q'));
        if (tv('department_id')) params.set('department_id', tv('department_id'));
        if (tv('batch_id')) params.set('batch_id', tv('batch_id'));
        const data = await CP.fetchJson(`/api/admin/manual-access/search?${params.toString()}`);
        renderUsers(data.users || []);
      }

      async function loadUserState(uid) {
        const data = await CP.fetchJson(`/api/admin/manual-access/${encodeURIComponent(uid)}`);
        manualState = data;
        const ov = data.override || {};
        $('selectedUser').textContent = `User: ${uid}`;
        $('snapshot').textContent = JSON.stringify(data.effective || {}, null, 2);
        $('blockBtn').textContent = ov.is_blocked ? 'Unblock User' : 'Block User';
        $('refundBtn').textContent = ov.refund_marked ? 'Unmark Refund' : 'Mark Refund';
        $('ambassadorBtn').textContent = ov.campus_ambassador ? 'Unset Ambassador' : 'Set Ambassador';
      }

      async function fireAction(action, extra) {
        const uid = selectedUid();
        if (!uid) throw new Error('Select a user first');
        const body = Object.assign({ action }, extra || {});
        await CP.fetchJson(`/api/admin/manual-access/${encodeURIComponent(uid)}/action`, { method: 'POST', body: JSON.stringify(body) });
        await loadUserState(uid);
      }

      $('searchForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          await searchUsers();
          CP.showStatus(statusEl, 'Search complete.', 'success');
        } catch (err) {
          CP.showStatus(statusEl, err.message || 'Search failed', 'error');
        }
      });

      usersTbody.addEventListener('click', async (e) => {
        const btn = e.target.closest('button[data-id]');
        if (!btn) return;
        selected = { auth_user_id: btn.getAttribute('data-id') };
        try {
          await loadUserState(selected.auth_user_id);
        } catch (err) {
          CP.showStatus(statusEl, err.message || 'Load failed', 'error');
        }
      });

      $('grantPremiumBtn').addEventListener('click', () => fireAction('grant_premium', { plan_id: tv('plan_id'), days: Number(tv('days') || 30) }).catch((e) => CP.showStatus(statusEl, e.message, 'error')));
      $('changePlanBtn').addEventListener('click', () => fireAction('change_plan', { plan_id: tv('plan_id'), days: Number(tv('days') || 30) }).catch((e) => CP.showStatus(statusEl, e.message, 'error')));
      $('extendBtn').addEventListener('click', () => fireAction('extend_subscription', { days: Number(tv('days') || 30) }).catch((e) => CP.showStatus(statusEl, e.message, 'error')));
      $('resetUsageBtn').addEventListener('click', () => fireAction('reset_daily_usage').catch((e) => CP.showStatus(statusEl, e.message, 'error')));
      $('changeDeptBtn').addEventListener('click', () => fireAction('change_department', { department_id: tv('new_department_id') }).catch((e) => CP.showStatus(statusEl, e.message, 'error')));
      $('blockBtn').addEventListener('click', () => fireAction('block_user', { value: !(manualState?.override?.is_blocked) }).catch((e) => CP.showStatus(statusEl, e.message, 'error')));
      $('refundBtn').addEventListener('click', () => fireAction('mark_refund', { value: !(manualState?.override?.refund_marked) }).catch((e) => CP.showStatus(statusEl, e.message, 'error')));
      $('ambassadorBtn').addEventListener('click', () => fireAction('mark_ambassador', { value: !(manualState?.override?.campus_ambassador) }).catch((e) => CP.showStatus(statusEl, e.message, 'error')));

      (async function init() {
        CP.initPageChrome('manual');
        try {
          await CP.ensureAdmin();
          await loadMeta();
          await loadPlans();
          await searchUsers();
        } catch (err) {
          CP.showStatus(statusEl, err.message || 'Init failed', 'error');
        }
      })();
    })();
