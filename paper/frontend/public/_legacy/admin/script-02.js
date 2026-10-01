// Extracted from ui/admin.html (inline <script> #2).
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    // --- Dynamic API base resolution (so admin page can be served from another port) ---
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
      // fallback: current origin
      API = location.origin;
    }

    const state = { raw: [], filtered: [], view: localStorage.getItem('admin_users_view') || 'table' };

    function fmtDate(ts) { if (!ts) return ''; try { return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); } catch (_) { return ''; } }
    function initials(name) { if (!name) return ''; return name.split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase(); }

    function computeStats() { const total = state.raw.length; const semesters = new Set(); const depts = new Set(); state.raw.forEach(u => { if (u.semester) semesters.add(u.semester); if (u.department) depts.add(u.department); }); return { total, semesters: semesters.size, depts: depts.size }; }

    function renderStats() { const s = computeStats(); const el = $('#stats'); if (!el) return; el.innerHTML = [['Users', s.total], ['Semesters', s.semesters], ['Departments', s.depts]].map(([k, v]) => `<span class="chip">${k}: <strong>${v}</strong></span>`).join(''); }

    function buildFilters() {
      const semesterSel = $('#semesterFilter');
      const batchSel = $('#batchFilter');
      const deptSel = $('#deptFilter');
      // Clear previous options but preserve the first placeholder option.
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

    function applyFilters() {
      const q = ($('#searchInput').value || '').toLowerCase();
      const sem = $('#semesterFilter').value;
      const batch = $('#batchFilter').value;
      const dept = $('#deptFilter').value;

      const toStrList = (v) => {
        if (v == null) return [];
        if (Array.isArray(v)) return v.map(x => String(x ?? '').trim()).filter(Boolean);
        if (typeof v === 'string') return [v];
        if (typeof v === 'number' || typeof v === 'boolean') return [String(v)];
        return [];
      };

      state.filtered = state.raw.filter(u => {
        if (q) {
          const hayParts = [
            u.name,
            u.email,
            u.regno,
            u.department,
            u.batch_range,
            ...toStrList(u.skills),
            ...toStrList(u.technologies),
            ...toStrList(u.specializations),
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

    function sortData() { const sort = $('#sortSelect').value; if (!sort) return; const arr = state.filtered; const collator = new Intl.Collator(undefined, { sensitivity: 'base' }); switch (sort) { case 'name': arr.sort((a, b) => collator.compare(a.name || '', b.name || '')); break; case 'semester': arr.sort((a, b) => (b.semester || 0) - (a.semester || 0)); break; case 'created_desc': arr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break; case 'verification': arr.sort((a, b) => (b.verification_score || 0) - (a.verification_score || 0)); break; } }

    function setView(v) { state.view = v; localStorage.setItem('admin_users_view', v); $('#tableView').classList.toggle('hidden', v !== 'table'); $('#gridView').classList.toggle('hidden', v !== 'grid'); $$('.layout-toggle button').forEach(btn => btn.classList.toggle('active', btn.dataset.view === v)); }

    function render() { const rowsEl = $('#userRows'); const gridEl = $('#gridView'); if (!rowsEl || !gridEl) return; rowsEl.innerHTML = ''; gridEl.innerHTML = ''; const data = state.filtered; $('#emptyState').classList.toggle('hidden', data.length !== 0); data.forEach(u => { const rowT = $('#rowTemplate').content.firstElementChild.cloneNode(true); fillEntry(rowT, u); rowsEl.appendChild(rowT); const cardT = $('#cardTemplate').content.firstElementChild.cloneNode(true); fillEntry(cardT, u); gridEl.appendChild(cardT); }); }

    function fillEntry(node, u) {
      const avatar = node.querySelector('[data-avatar]'); const init = node.querySelector('[data-initial]'); if (avatar) { if (u.profile_image_url) { avatar.src = u.profile_image_url; init.textContent = ''; } else { avatar.removeAttribute('src'); init.textContent = initials(u.name || u.email || ''); } }
      const nameEl = node.querySelector('[data-name]'); if (nameEl) nameEl.textContent = u.name || '(no name)'; const emailEl = node.querySelector('[data-email]'); if (emailEl) emailEl.textContent = u.email || ''; const statusEl = node.querySelector('[data-status]'); if (statusEl) { statusEl.innerHTML = ''; if (u.semester) statusEl.innerHTML += `<span class="chip">Sem ${u.semester}</span>`; if (u.department) statusEl.innerHTML += `<span class="chip">${u.department}</span>`; if (u.batch_range) statusEl.innerHTML += `<span class="chip">${u.batch_range}</span>`; }
      const academic = node.querySelector('[data-academic]'); if (academic) { academic.innerHTML = ''; if (u.regno) academic.innerHTML += `<div><span class="font-medium">Reg:</span> ${u.regno}</div>`; if (u.semester) academic.innerHTML += `<div><span class="font-medium">Sem:</span> ${u.semester}</div>`; if (u.batch_range) academic.innerHTML += `<div><span class="font-medium">Batch:</span> ${u.batch_range}</div>`; }
      const deptCell = node.querySelector('[data-department]'); if (deptCell) { deptCell.textContent = u.department || '—'; }
      const links = node.querySelector('[data-links]'); if (links) { const mk = (icon, label, url) => `<a href="${url}" target="_blank" rel="noopener" class="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/70 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 text-[10px]"><span class="material-symbols-rounded text-xs">${icon}</span>${label}</a>`; links.innerHTML = ''; if (u.linkedin) links.innerHTML += mk('work', 'LinkedIn', u.linkedin); if (u.github) links.innerHTML += mk('code', 'GitHub', u.github); if (u.leetcode) links.innerHTML += mk('developer_mode', 'LeetCode', u.leetcode); }
      const skills = node.querySelector('[data-skills]'); if (skills) { const list = [...(u.skills || []), ...(u.technologies || [])].slice(0, 6); skills.innerHTML = list.map(s => `<span class="chip">${s}</span>`).join(''); }
      const verify = node.querySelector('[data-verify]'); if (verify) { const v = u.verification_score || 0; verify.innerHTML = v ? `<span class="status-pill pill-active"><span class="material-symbols-rounded text-[14px]">verified</span>${v.toFixed(0)}</span>` : '<span class="status-pill pill-new">NEW</span>'; }
      const updated = node.querySelector('[data-updated]'); if (updated) updated.textContent = fmtDate(u.updated_at || u.created_at);
      const vp = node.querySelector('[data-view-profile]'); if (vp) vp.addEventListener('click', () => window.open(`profile_public.html?u=${encodeURIComponent(u.user_id || u.auth_user_id || '')}`, '_blank'));
      const roleCell = node.querySelector('[data-role]');
      const actionsCell = node.querySelector('[data-actions]');
      const actionsCard = node.querySelector('[data-actions-card]');
      if (roleCell) { roleCell.innerHTML = roleSelectHTML(u); }
      if (actionsCell) { actionsCell.innerHTML = deleteBtnHTML(u); }
      if (actionsCard) { const delBtn = actionsCard.querySelector('[data-delete-user]'); if (delBtn) attachDeleteHandler(delBtn, u); }
      // Attach role change if present
      const sel = node.querySelector('select[data-role-select]'); if (sel) { attachRoleChange(sel, u); }
      const delBtnRow = node.querySelector('[data-delete-user]'); if (delBtnRow) attachDeleteHandler(delBtnRow, u);
    }

    const ROLE_OPTIONS = ['admin', 'teacher', 'moderator', 'student', 'employee'];
    function roleSelectHTML(u) {
      return `<select data-role-select class="rounded-md bg-white/70 dark:bg-white/10 border border-black/10 dark:border-white/10 px-2 py-1 text-[11px] focus:outline-none">
        ${ROLE_OPTIONS.map(r => `<option value="${r}" ${(u.role || 'student') === r ? 'selected' : ''}>${r}</option>`).join('')}
      </select>`;
    }
    function deleteBtnHTML(u) {
      return `<button data-delete-user title="Delete user" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-500/80 hover:bg-red-600 text-white text-[11px]">
        <span class="material-symbols-rounded text-[14px]">delete</span>
      </button>`;
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
        sel.disabled = true; sel.classList.add('opacity-60');
        try { await apiUpdateRole(u, newRole); u.role = newRole; }
        catch (err) { console.error(err); alert(err.message || 'Role update error'); sel.value = prev; }
        finally { sel.disabled = false; sel.classList.remove('opacity-60'); }
      });
    }
    function attachDeleteHandler(btn, u) {
      btn.addEventListener('click', async () => {
        if (!confirm(`Delete user ${u.name || u.email}? This cannot be undone (profile only).`)) return;
        btn.disabled = true; btn.classList.add('opacity-60');
        try { await apiDeleteUser(u); state.raw = state.raw.filter(x => x.user_id !== u.user_id); applyFilters(); }
        catch (err) { console.error(err); alert(err.message || 'Delete failed'); }
        finally { btn.disabled = false; btn.classList.remove('opacity-60'); }
      });
    }

    async function getAccessToken() {
      // Primary token per auth.js
      try { const t = localStorage.getItem('px_token'); if (t) return t; } catch (_) { }
      // Supabase session (if client injected somewhere else)
      try { if (window.supabase && supabase.auth) { const { data } = await supabase.auth.getSession(); const tk = data?.session?.access_token; if (tk) return tk; } } catch (_) { }
      // Fallback keys (legacy / experiments)
      const fallbacks = ['access_token', 'auth_token', 'sb-access-token'];
      for (const k of fallbacks) { try { const v = localStorage.getItem(k); if (v) return v; } catch (_) { } }
      return null;
    }

    async function adminSelfCheck() {
      const token = await getAccessToken();
      if (!token) throw new Error('No auth token (px_token) found — please login');
      const res = await fetch(API + '/api/admin/self-check', { headers: { 'Authorization': 'Bearer ' + token } });
      if (res.status === 401) throw new Error('401 Unauthorized – token invalid or expired');
      if (res.status === 403) throw new Error('Not an admin — access denied');
      if (!res.ok) throw new Error('Self-check failed: ' + res.status);
      return res.json();
    }

    function showNotAdmin() {
      $('#resultsWrapper').innerHTML = `<div class="p-10 text-center space-y-4 glass-panel rounded-2xl">
        <div class="mx-auto w-14 h-14 rounded-full flex items-center justify-center bg-red-500/10 text-red-600 dark:text-red-400"><span class="material-symbols-rounded">block</span></div>
        <h2 class="text-xl font-bold">Admin Access Required</h2>
        <p class="text-sm opacity-70 max-w-md mx-auto">Your account does not have administrator privileges. Contact an existing admin to grant the <code class='px-1 py-0.5 rounded bg-black/5 dark:bg-white/10 text-xs'>admin</code> role.</p>
      </div>`;
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
        const token = await getAccessToken();
        if (!token) throw new Error('No auth token (px_token) found — please login');
        const q = ($('#searchInput')?.value || '').trim();
        const url = q ? `${API}/api/admin/users?q=${encodeURIComponent(q)}` : `${API}/api/admin/users`;
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
        applyFilters();
      } catch (err) {
        const msg = err?.message || 'Error loading users';
        console.warn('[admin] fetch error', err);
        if (/Not an admin/i.test(msg)) { showNotAdmin(); return; }
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
        // Immediate client-side filter, plus real-time refresh (debounced).
        applyFilters();
        clearTimeout(_searchFetchTimer);
        _searchFetchTimer = setTimeout(() => { fetchUsers(); }, 250);
      }
    });
    document.addEventListener('change', e => { if (e.target.matches('#semesterFilter,#batchFilter,#deptFilter,#sortSelect')) applyFilters(); });
    document.addEventListener('click', e => { const btn = e.target.closest('.layout-toggle button'); if (btn) { setView(btn.dataset.view); } if (e.target.id === 'themeToggle') { const root = document.documentElement; const dark = root.classList.toggle('dark'); localStorage.setItem('px_theme', dark ? 'dark' : 'light'); e.target.textContent = dark ? 'light_mode' : 'dark_mode'; } });

    (async () => {
      await fetchUsers();
      // Load teacher applications after users so page becomes interactive sooner.
      try { await fetchTeacherApplications(); } catch (_) { /* ignore */ }
    })();

    // ---------- Teacher Applications Review Logic ----------
    const teacherState = { applications: [], status: 'pending' };
    const teacherAppsTbody = document.getElementById('teacherAppsTbody');
    const teacherAppsLoading = document.getElementById('teacherAppsLoading');
    const teacherAppsError = document.getElementById('teacherAppsError');
    const teacherAppsEmpty = document.getElementById('teacherAppsEmpty');
    const statusFilter = document.getElementById('teacherAppStatusFilter');

    let academicMeta = null;
    async function fetchAcademicMeta() {
      try {
        const res = await fetch(`${API}/api/public/academic-meta`);
        if (res.ok) { academicMeta = await res.json(); }
      } catch (_) { /* silent */ }
    }

    function mapCollege(id) {
      if (!id || !academicMeta) return id ? ('#' + id.slice(0, 8)) : '—';
      const c = (academicMeta.colleges || []).find(x => x.id === id);
      return c ? c.name : ('#' + id.slice(0, 8));
    }
    function mapDept(id) {
      if (!id || !academicMeta) return id ? ('#' + id.slice(0, 8)) : '—';
      const d = (academicMeta.departments || []).find(x => x.id === id);
      return d ? d.name : ('#' + id.slice(0, 8));
    }
    function resolveImgPath(p) {
      if (!p) return '';
      if (/^https?:/i.test(p)) return p;
      const clean = p.replace(/^\.\/?/, '');
      // ensure leading slash
      const rel = clean.startsWith('assets/') ? '/' + clean : (clean.startsWith('/') ? clean : '/' + clean);
      // if API base is different origin, prefix fully qualified URL for images so browser loads from backend port
      try {
        if (API && !rel.startsWith('http')) {
          const apiUrl = new URL(API);
          // only prefix if current origin differs
          if (location.origin !== apiUrl.origin) { return apiUrl.origin + rel; }
        }
      } catch (_) { }
      return rel;
    }

    async function fetchTeacherApplications() {
      teacherAppsLoading.classList.remove('hidden');
      teacherAppsError.classList.add('hidden');
      teacherAppsEmpty.classList.add('hidden');
      teacherAppsTbody.innerHTML = '';
      try {
        const token = await getAccessToken();
        if (!token) throw new Error('Missing auth token');
        const q = statusFilter.value ? `?status=${encodeURIComponent(statusFilter.value)}` : '';
        const res = await fetch(`${API}/api/teacher/applications${q}`, { headers: { 'Authorization': 'Bearer ' + token } });
        if (res.status === 403) { /* not admin handled already above */ return; }
        if (!res.ok) throw new Error('Failed to load: ' + res.status);
        const data = await res.json();
        teacherState.applications = (data.applications || []);
        if (academicMeta === null) { await fetchAcademicMeta(); }
        renderTeacherApplications();
      } catch (err) {
        teacherAppsError.textContent = err.message || 'Error loading applications';
        teacherAppsError.classList.remove('hidden');
      } finally {
        teacherAppsLoading.classList.add('hidden');
      }
    }

    function teacherAppRow(app) {
      const front = resolveImgPath(app.id_card_front_path || '');
      const back = resolveImgPath(app.id_card_back_path || '');
      const created = fmtDate(app.created_at);
      const statusColors = { pending: 'bg-amber-500/80', approved: 'bg-green-600/85', rejected: 'bg-red-600/85' };
      const pillColor = statusColors[app.status] || 'bg-neutral-500/70';
      const subjects = (Array.isArray(app.subjects) ? app.subjects : []).join(', ');
      const collegeName = mapCollege(app.college_id);
      const deptName = mapDept(app.department_id);
      return `<tr>
        <td class="py-3 pr-3 align-top">
          <div class="font-semibold leading-tight">${app.name || '(no name)'}</div>
          <div class="text-[11px] opacity-70 break-all">${app.email || ''}</div>
        </td>
        <td class="py-3 pr-3 text-[11px] align-top">
          <div><span class="font-medium">College:</span> ${collegeName || '—'}</div>
          <div><span class="font-medium">Dept:</span> ${deptName || '—'}</div>
        </td>
        <td class="py-3 pr-3 text-[11px] align-top">${subjects || '<span class="opacity-60">None</span>'}</td>
        <td class="py-3 pr-3 text-[11px] align-top">
          <div class="flex gap-2">
            ${front ? `<img src="${front}" alt="Front ID" class="h-16 w-20 object-cover rounded-md cursor-pointer ring-1 ring-black/10 dark:ring-white/10" data-full="${front}" data-img-preview/>` : '<div class="h-16 w-20 rounded-md bg-neutral-200/60 dark:bg-white/5 flex items-center justify-center text-[10px] opacity-50">No front</div>'}
            ${back ? `<img src="${back}" alt="Back ID" class="h-16 w-20 object-cover rounded-md cursor-pointer ring-1 ring-black/10 dark:ring-white/10" data-full="${back}" data-img-preview/>` : '<div class="h-16 w-20 rounded-md bg-neutral-200/60 dark:bg-white/5 flex items-center justify-center text-[10px] opacity-50">No back</div>'}
          </div>
        </td>
        <td class="py-3 pr-3 text-[11px] align-top">${created || ''}</td>
        <td class="py-3 pr-3 text-[11px] align-top"><span class="status-pill ${pillColor} text-white">${app.status}</span></td>
        <td class="py-3 pr-3 align-top w-[180px]">
          <textarea data-notes placeholder="Notes" class="w-full rounded-md bg-white/70 dark:bg-white/10 border border-black/10 dark:border-white/10 px-2 py-1 text-[11px] focus:outline-none focus:ring-2 focus:ring-brand-500/40 resize-none h-16"></textarea>
        </td>
        <td class="py-3 pr-3 align-top text-[11px]">
          <div class="flex flex-col gap-2">
            <button data-approve class="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-md bg-green-600/80 hover:bg-green-600 text-white font-medium disabled:opacity-50"><span class="material-symbols-rounded text-[16px]">check_circle</span></button>
            <button data-reject class="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-md bg-red-600/80 hover:bg-red-600 text-white font-medium disabled:opacity-50"><span class="material-symbols-rounded text-[16px]">cancel</span></button>
          </div>
        </td>
      </tr>`;
    }

    function renderTeacherApplications() {
      teacherAppsTbody.innerHTML = '';
      const list = teacherState.applications;
      if (!list.length) { teacherAppsEmpty.classList.remove('hidden'); return; }
      teacherAppsEmpty.classList.add('hidden');
      list.forEach(app => {
        const wrapper = document.createElement('tbody');
        wrapper.innerHTML = teacherAppRow(app);
        const row = wrapper.firstElementChild;
        attachTeacherAppHandlers(row, app);
        teacherAppsTbody.appendChild(row);
      });
    }

    async function reviewApplication(app, status, notes) {
      const token = await getAccessToken();
      if (!token) throw new Error('Missing token');
      const res = await fetch(`${API}/api/teacher/applications/${encodeURIComponent(app.id)}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ status, notes: notes || '' })
      });
      if (!res.ok) throw new Error(`Review failed: ${res.status}`);
      const payload = await res.json();
      // Debug group for teacher profile sync diagnostics
      console.groupCollapsed('%cTeacher Approval', 'color:#16a34a;font-weight:bold');
      console.log('Application ID:', app.id);
      console.log('User ID:', app.auth_user_id);
      console.log('Requested status:', status);
      console.log('Review response:', payload);
      if (payload && payload.status === 'approved' && app.auth_user_id) {
        try {
          const raw = await fetch(`${API}/api/admin/teacher-profiles/${encodeURIComponent(app.auth_user_id)}`, { headers: { 'Authorization': 'Bearer ' + token } });
          const rawJson = await raw.json();
          console.log('Raw teacher_profiles row:', rawJson);
          if (!rawJson.row) {
            console.warn('teacher_profiles row missing. If profile_sync=error check migrations.');
          }
        } catch (e) {
          console.error('Error fetching raw teacher profile row', e);
        }
      }
      console.groupEnd();
      return payload;
    }

    function attachTeacherAppHandlers(card, app) {
      const approveBtn = card.querySelector('[data-approve]');
      const rejectBtn = card.querySelector('[data-reject]');
      const notesEl = card.querySelector('[data-notes]');
      const imgEls = card.querySelectorAll('[data-img-preview]');
      imgEls.forEach(img => img.addEventListener('click', () => openImageModal(img.getAttribute('data-full'), img.alt)));
      function setLoading(disabled) { [approveBtn, rejectBtn, notesEl].forEach(el => el && (el.disabled = disabled)); }
      if (approveBtn) { approveBtn.addEventListener('click', async () => { if (!confirm('Approve this application?')) return; try { setLoading(true); await reviewApplication(app, 'approved', notesEl.value); await fetchTeacherApplications(); } catch (err) { alert(err.message || 'Approve error'); } finally { setLoading(false); } }); }
      if (rejectBtn) { rejectBtn.addEventListener('click', async () => { const reason = notesEl.value || prompt('Optional rejection notes:', ''); if (!confirm('Reject this application?')) return; try { setLoading(true); await reviewApplication(app, 'rejected', reason); await fetchTeacherApplications(); } catch (err) { alert(err.message || 'Reject error'); } finally { setLoading(false); } }); }
    }

    // Simple image modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 hidden items-center justify-center z-50';
    modal.innerHTML = `<div class="absolute inset-0 bg-black/70 backdrop-blur-sm modal-overlay" data-close></div>
      <div class="relative max-w-lg w-[90%] rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-neon glass-panel">
        <button class="absolute top-2 right-2 h-9 w-9 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 material-symbols-rounded" data-close title="Close">close</button>
        <img class="max-h-[70vh] w-full object-contain bg-black/30" data-modal-img alt="Preview"/>
        <div class="p-3 text-[12px] opacity-80" data-caption></div>
      </div>`;
    document.body.appendChild(modal);
    function openImageModal(src, caption) {
      const img = modal.querySelector('[data-modal-img]');
      const cap = modal.querySelector('[data-caption]');
      if (img) img.src = src;
      if (cap) cap.textContent = caption || '';
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
    function closeImageModal() { modal.classList.add('hidden'); modal.classList.remove('flex'); }
    modal.addEventListener('click', e => {
      if (e.target === modal || e.target.hasAttribute('data-close')) { closeImageModal(); }
    });
    window.openImageModal = openImageModal;

    document.getElementById('refreshTeacherApps').addEventListener('click', fetchTeacherApplications);
    statusFilter.addEventListener('change', fetchTeacherApplications);
    // Initial load
    fetchTeacherApplications();
