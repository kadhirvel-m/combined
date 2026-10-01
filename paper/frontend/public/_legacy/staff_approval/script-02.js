// Extracted from ui/staff_approval.html (inline <script> #2).
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
    const $ = (sel, ctx = document) => ctx.querySelector(sel);

    // --- Dynamic API base resolution (so page can be served from another port) ---
    let API = (window.API_BASE || '').replace(/\/$/, '');
    async function fetchWithTimeout(url, options = {}, timeoutMs = 1500) {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), timeoutMs);
      try {
        return await fetch(url, { ...options, signal: controller.signal });
      } finally {
        clearTimeout(t);
      }
    }
    async function resolveApiBase() {
      if (API) return;
      if (location.port === '8000') { API = location.origin; return; }
      const host = location.hostname;
      const candidates = [location.origin, `http://${host}:8000`, `https://${host}:8000`];
      for (const base of candidates) {
        try {
          const r = await fetchWithTimeout(base + '/api/admin/self-check', { method: 'HEAD' }, 900);
          if (r.ok || r.status === 401 || r.status === 403) { API = base.replace(/\/$/, ''); window.API_BASE = API; return; }
        } catch (_) { }
      }
      API = location.origin;
    }

    const state = { raw: [], filtered: [], view: localStorage.getItem('staff_approval_view') || 'table' };

    function fmtDate(ts) { if (!ts) return ''; try { return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); } catch (_) { return ''; } }
    function initials(name) { if (!name) return ''; return name.split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase(); }

    function computeStats() {
      const total = state.raw.length;
      const staff = state.raw.filter(u => ['employee', 'moderator', 'admin'].includes((u.role || 'student').toLowerCase())).length;
      const students = state.raw.filter(u => (u.role || 'student').toLowerCase() === 'student').length;
      return { total, staff, students };
    }

    function renderStats() {
      const s = computeStats();
      const el = $('#stats');
      if (!el) return;
      el.innerHTML = [['Loaded', s.total], ['Staff', s.staff], ['Students', s.students]].map(([k, v]) => `<span class="chip">${k}: <strong>${v}</strong></span>`).join('');
    }

    function buildFilters() {
      const semesterSel = $('#semesterFilter');
      const batchSel = $('#batchFilter');
      const deptSel = $('#deptFilter');
      [semesterSel, batchSel, deptSel].forEach(sel => {
        if (!sel) return;
        while (sel.options.length > 1) sel.remove(1);
      });
      const semesters = [...new Set(state.raw.map(u => u.semester).filter(Boolean))].sort((a, b) => a - b);
      semesters.forEach(s => {
        const o = document.createElement('option');
        o.value = s;
        o.textContent = 'Sem ' + s;
        semesterSel.appendChild(o);
      });
      const batches = [...new Set(state.raw.map(u => u.batch_range).filter(Boolean))];
      batches.forEach(r => {
        const o = document.createElement('option');
        o.value = r;
        o.textContent = r;
        batchSel.appendChild(o);
      });
      const depts = [...new Set(state.raw.map(u => u.department).filter(Boolean))].sort();
      depts.forEach(d => {
        const o = document.createElement('option');
        o.value = d;
        o.textContent = d;
        deptSel.appendChild(o);
      });
    }

    function setView(v) {
      state.view = v;
      localStorage.setItem('staff_approval_view', v);
      $('#tableView').classList.toggle('hidden', v !== 'table');
      $('#gridView').classList.toggle('hidden', v !== 'grid');
      $$('.layout-toggle button').forEach(btn => btn.classList.toggle('active', btn.dataset.view === v));
    }

    function roleMatchesFilter(roleValue, filterValue) {
      const r = (roleValue || 'student').toLowerCase();
      const f = (filterValue || '').toLowerCase();
      if (!f) return true;
      if (f === 'staff') return ['employee', 'moderator', 'admin'].includes(r);
      return r === f;
    }

    function applyFilters() {
      const q = ($('#searchInput').value || '').toLowerCase();
      const sem = $('#semesterFilter').value;
      const batch = $('#batchFilter').value;
      const dept = $('#deptFilter').value;
      const roleF = $('#roleFilter').value;

      state.filtered = state.raw.filter(u => {
        if (!roleMatchesFilter(u.role, roleF)) return false;

        if (q) {
          const hayParts = [
            u.name,
            u.email,
            u.regno,
            u.department,
            u.batch_range,
            u.role
          ].map(x => String(x ?? '')).join(' ').toLowerCase();
          if (!hayParts.includes(q)) return false;
        }
        if (sem && String(u.semester) !== sem) return false;
        if (batch && u.batch_range !== batch) return false;
        if (dept && u.department !== dept) return false;
        return true;
      });
      sortData();
      render();
    }

    function sortData() {
      const sort = $('#sortSelect').value;
      if (!sort) return;
      const arr = state.filtered;
      const collator = new Intl.Collator(undefined, { sensitivity: 'base' });
      switch (sort) {
        case 'name':
          arr.sort((a, b) => collator.compare(a.name || '', b.name || ''));
          break;
        case 'semester':
          arr.sort((a, b) => (b.semester || 0) - (a.semester || 0));
          break;
        case 'created_desc':
          arr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          break;
        case 'verification':
          arr.sort((a, b) => (b.verification_score || 0) - (a.verification_score || 0));
          break;
      }
    }

    function render() {
      const rowsEl = $('#userRows');
      const gridEl = $('#gridView');
      if (!rowsEl || !gridEl) return;
      rowsEl.innerHTML = '';
      gridEl.innerHTML = '';
      const data = state.filtered;
      $('#emptyState').classList.toggle('hidden', data.length !== 0);
      data.forEach(u => {
        const rowT = $('#rowTemplate').content.firstElementChild.cloneNode(true);
        fillEntry(rowT, u);
        rowsEl.appendChild(rowT);
        const cardT = $('#cardTemplate').content.firstElementChild.cloneNode(true);
        fillEntry(cardT, u);
        gridEl.appendChild(cardT);
      });
    }

    function fillEntry(node, u) {
      const avatar = node.querySelector('[data-avatar]');
      const init = node.querySelector('[data-initial]');
      if (avatar) {
        if (u.profile_image_url) {
          avatar.src = u.profile_image_url;
          init.textContent = '';
        } else {
          avatar.removeAttribute('src');
          init.textContent = initials(u.name || u.email || '');
        }
      }
      const nameEl = node.querySelector('[data-name]');
      if (nameEl) nameEl.textContent = u.name || '(no name)';
      const emailEl = node.querySelector('[data-email]');
      if (emailEl) emailEl.textContent = u.email || '';
      const statusEl = node.querySelector('[data-status]');
      if (statusEl) {
        statusEl.innerHTML = '';
        if (u.role) statusEl.innerHTML += `<span class="chip">${u.role}</span>`;
        if (u.semester) statusEl.innerHTML += `<span class="chip">Sem ${u.semester}</span>`;
        if (u.department) statusEl.innerHTML += `<span class="chip">${u.department}</span>`;
        if (u.batch_range) statusEl.innerHTML += `<span class="chip">${u.batch_range}</span>`;
      }
      const academic = node.querySelector('[data-academic]');
      if (academic) {
        academic.innerHTML = '';
        if (u.regno) academic.innerHTML += `<div><span class="font-medium">Reg:</span> ${u.regno}</div>`;
        if (u.semester) academic.innerHTML += `<div><span class="font-medium">Sem:</span> ${u.semester}</div>`;
        if (u.batch_range) academic.innerHTML += `<div><span class="font-medium">Batch:</span> ${u.batch_range}</div>`;
      }
      const deptCell = node.querySelector('[data-department]');
      if (deptCell) deptCell.textContent = u.department || '—';

      const verify = node.querySelector('[data-verify]');
      if (verify) {
        const v = u.verification_score || 0;
        verify.innerHTML = v ? `<span class="status-pill pill-active"><span class="material-symbols-rounded text-[14px]">verified</span>${v.toFixed(0)}</span>` : '<span class="status-pill pill-new">NEW</span>';
      }
      const updated = node.querySelector('[data-updated]');
      if (updated) updated.textContent = fmtDate(u.updated_at || u.created_at);

      const roleCell = node.querySelector('[data-role]');
      if (roleCell) roleCell.innerHTML = roleSelectHTML(u);
      const actionsCell = node.querySelector('[data-actions]');
      if (actionsCell) actionsCell.innerHTML = actionsHTML(u);
      const actionsCard = node.querySelector('[data-actions-card]');
      if (actionsCard) actionsCard.innerHTML = actionsHTML(u, true);

      // Attach role change if present
      const sel = node.querySelector('select[data-role-select]');
      if (sel) attachRoleChange(sel, u);

      // Attach action handlers
      const approveEmp = node.querySelector('[data-approve-employee]');
      if (approveEmp) approveEmp.addEventListener('click', () => quickSetRole(u, 'employee'));
      const approveMod = node.querySelector('[data-approve-moderator]');
      if (approveMod) approveMod.addEventListener('click', () => quickSetRole(u, 'moderator'));
      const revoke = node.querySelector('[data-revoke-staff]');
      if (revoke) revoke.addEventListener('click', () => quickSetRole(u, 'student'));
      const delBtn = node.querySelector('[data-delete-user]');
      if (delBtn) attachDeleteHandler(delBtn, u);
      const vp = node.querySelector('[data-view-profile]');
      if (vp) vp.addEventListener('click', () => window.open(`profile_public.html?u=${encodeURIComponent(u.user_id || u.auth_user_id || '')}`, '_blank'));
    }

    const ROLE_OPTIONS = ['admin', 'employee', 'moderator', 'teacher', 'student'];
    function roleSelectHTML(u) {
      return `<select data-role-select class="rounded-md bg-white/70 dark:bg-white/10 border border-black/10 dark:border-white/10 px-2 py-1 text-[11px] focus:outline-none">
        ${ROLE_OPTIONS.map(r => `<option value="${r}" ${(u.role || 'student') === r ? 'selected' : ''}>${r}</option>`).join('')}
      </select>`;
    }

    function actionsHTML(u, compact = false) {
      const role = (u.role || 'student').toLowerCase();
      const isStudent = role === 'student';
      const isStaff = ['employee', 'moderator', 'admin'].includes(role);
      const canRevoke = (role === 'employee' || role === 'moderator' || role === 'teacher');

      const btn = (attrs, icon, title, classes) => `<button ${attrs} title="${title}" class="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-md ${classes}"><span class="material-symbols-rounded text-[14px]">${icon}</span>${compact ? '' : ''}</button>`;
      const parts = [];

      if (isStudent) {
        parts.push(btn('data-approve-employee', 'badge', 'Approve as employee', 'bg-emerald-600/80 hover:bg-emerald-700 text-white'));
        parts.push(btn('data-approve-moderator', 'verified_user', 'Approve as moderator', 'bg-indigo-600/80 hover:bg-indigo-700 text-white'));
      }
      if (canRevoke) {
        parts.push(btn('data-revoke-staff', 'person_off', 'Revoke to student', 'bg-amber-600/80 hover:bg-amber-700 text-white'));
      }

      parts.push(btn('data-view-profile', 'open_in_new', 'View public profile', 'bg-white/60 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20'));
      parts.push(btn('data-delete-user', 'delete', 'Delete user profile', 'bg-red-500/80 hover:bg-red-600 text-white'));

      return `<div class="flex flex-wrap gap-2">${parts.join('')}</div>`;
    }

    async function getAccessToken() {
      try { const t = localStorage.getItem('px_token'); if (t) return t; } catch (_) { }
      try { if (window.supabase && supabase.auth) { const { data } = await supabase.auth.getSession(); const tk = data?.session?.access_token; if (tk) return tk; } } catch (_) { }
      const fallbacks = ['access_token', 'auth_token', 'sb-access-token', 'token'];
      for (const k of fallbacks) { try { const v = localStorage.getItem(k); if (v) return v; } catch (_) { } }
      return null;
    }

    function showNotAdmin() {
      $('#resultsWrapper').innerHTML = `<div class="p-10 text-center space-y-4 glass-panel rounded-2xl">
        <div class="mx-auto w-14 h-14 rounded-full flex items-center justify-center bg-red-500/10 text-red-600 dark:text-red-400"><span class="material-symbols-rounded">block</span></div>
        <h2 class="text-xl font-bold">Admin Access Required</h2>
        <p class="text-sm opacity-70 max-w-md mx-auto">Your account does not have administrator privileges. Contact an existing admin to grant the <code class='px-1 py-0.5 rounded bg-black/5 dark:bg-white/10 text-xs'>admin</code> role.</p>
      </div>`;
    }

    async function apiUpdateRole(user, uRole) {
      const token = await getAccessToken();
      const res = await fetch(`${API}/api/admin/users/${encodeURIComponent(user.user_id)}/role`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }, body: JSON.stringify({ role: uRole }) });
      if (!res.ok) { throw new Error(`Role update failed: ${res.status}`); }
      return res.json();
    }

    async function apiDeleteUser(user) {
      const token = await getAccessToken();
      const res = await fetch(`${API}/api/admin/users/${encodeURIComponent(user.user_id)}`, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + token } });
      if (!res.ok) { const txt = await res.text(); throw new Error(`Delete failed: ${res.status} ${txt}`); }
      return res.json();
    }

    function attachRoleChange(sel, u) {
      sel.addEventListener('change', async () => {
        const newRole = sel.value;
        const prev = u.role;
        sel.disabled = true;
        sel.classList.add('opacity-60');
        try {
          await apiUpdateRole(u, newRole);
          u.role = newRole;
          renderStats();
          applyFilters();
        } catch (err) {
          console.error(err);
          alert(err.message || 'Role update error');
          sel.value = prev;
        } finally {
          sel.disabled = false;
          sel.classList.remove('opacity-60');
        }
      });
    }

    async function quickSetRole(u, role) {
      const human = role === 'student' ? 'revoke staff access' : `set role to ${role}`;
      if (!confirm(`Confirm: ${human} for ${u.name || u.email || 'this user'}?`)) return;
      try {
        await apiUpdateRole(u, role);
        u.role = role;
        renderStats();
        applyFilters();
      } catch (err) {
        console.error(err);
        alert(err.message || 'Update failed');
      }
    }

    function attachDeleteHandler(btn, u) {
      btn.addEventListener('click', async () => {
        if (!confirm(`Delete user ${u.name || u.email}? This cannot be undone (profile only).`)) return;
        btn.disabled = true;
        btn.classList.add('opacity-60');
        try {
          await apiDeleteUser(u);
          state.raw = state.raw.filter(x => x.user_id !== u.user_id);
          renderStats();
          buildFilters();
          applyFilters();
        } catch (err) {
          console.error(err);
          alert(err.message || 'Delete failed');
        } finally {
          btn.disabled = false;
          btn.classList.remove('opacity-60');
        }
      });
    }

    let _usersFetchSeq = 0;
    async function fetchUsers() {
      const seq = ++_usersFetchSeq;
      $('#loadingState').classList.remove('hidden');
      $('#errorState').classList.add('hidden');
      try {
        await resolveApiBase();
        const prevSem = $('#semesterFilter')?.value || '';
        const prevBatch = $('#batchFilter')?.value || '';
        const prevDept = $('#deptFilter')?.value || '';
        const prevSort = $('#sortSelect')?.value || '';
        const prevRoleF = $('#roleFilter')?.value || 'staff';
        const token = await getAccessToken();
        if (!token) throw new Error('No auth token (px_token) found — please login');

        const q = ($('#searchInput')?.value || '').trim();
        const roleFilter = $('#roleFilter')?.value || 'staff';
        const serverRole = (roleFilter && roleFilter !== 'staff') ? roleFilter : '';
        const params = new URLSearchParams();
        if (q) params.set('q', q);
        if (serverRole) params.set('role', serverRole);
        const url = `${API}/api/admin/users${params.toString() ? ('?' + params.toString()) : ''}`;
        const res = await fetch(url, { headers: { 'Authorization': 'Bearer ' + token } });
        if (res.status === 401) { throw new Error('401 Unauthorized – token invalid or expired'); }
        if (res.status === 403) { showNotAdmin(); return; }
        if (!res.ok) { throw new Error('Request failed: ' + res.status); }
        const data = await res.json();
        if (seq !== _usersFetchSeq) return;

        state.raw = (data.users || data || []).map(row => ({ ...row, batch_range: row.batch_from && row.batch_to ? `${row.batch_from}-${row.batch_to}` : (row.batch_range || '') }));
        renderStats();
        buildFilters();

        if ($('#semesterFilter')) $('#semesterFilter').value = prevSem;
        if ($('#batchFilter')) $('#batchFilter').value = prevBatch;
        if ($('#deptFilter')) $('#deptFilter').value = prevDept;
        if ($('#sortSelect')) $('#sortSelect').value = prevSort;
        if ($('#roleFilter')) $('#roleFilter').value = prevRoleF;
        applyFilters();
      } catch (err) {
        const msg = err?.message || 'Error loading users';
        console.warn('[staff_approval] fetch error', err);
        $('#errorState').textContent = msg;
        $('#errorState').classList.remove('hidden');
        if (/No auth token/i.test(msg)) {
          setTimeout(() => { location.href = 'login.html?next=' + encodeURIComponent(location.pathname); }, 1200);
        }
      } finally {
        $('#loadingState').classList.add('hidden');
        setView(state.view);
      }
    }

    let _searchFetchTimer = null;
    document.addEventListener('input', e => {
      if (e.target.matches('#searchInput')) {
        applyFilters();
        clearTimeout(_searchFetchTimer);
        _searchFetchTimer = setTimeout(() => { fetchUsers(); }, 250);
      }
    });

    document.addEventListener('change', e => {
      if (e.target.matches('#semesterFilter,#batchFilter,#deptFilter,#sortSelect,#roleFilter')) {
        applyFilters();
        if (e.target.matches('#roleFilter')) fetchUsers();
      }
    });

    document.addEventListener('click', e => {
      const btn = e.target.closest('.layout-toggle button');
      if (btn) setView(btn.dataset.view);
      if (e.target.id === 'themeToggle') {
        const root = document.documentElement;
        const dark = root.classList.toggle('dark');
        localStorage.setItem('px_theme', dark ? 'dark' : 'light');
        e.target.textContent = dark ? 'light_mode' : 'dark_mode';
      }
      if (e.target && e.target.id === 'refreshBtn') fetchUsers();
    });

    // Default: show staff-only for quick workflows.
    (function initDefaults() {
      try { $('#roleFilter').value = localStorage.getItem('staff_approval_role_filter') || 'staff'; } catch (_) { }
    })();

    document.getElementById('roleFilter').addEventListener('change', () => {
      try { localStorage.setItem('staff_approval_role_filter', document.getElementById('roleFilter').value || ''); } catch (_) { }
    });

    // Initial load
    fetchUsers();
