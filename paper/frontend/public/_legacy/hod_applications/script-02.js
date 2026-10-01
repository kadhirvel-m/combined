// Extracted from ui/hod_applications.html (inline <script> #2).
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
    const $ = (sel, ctx = document) => ctx.querySelector(sel);

    let API = (window.API_BASE || '').replace(/\/$/, '');
    async function fetchWithTimeout(url, options = {}, timeoutMs = 1500) {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), timeoutMs);
      try { return await fetch(url, { ...options, signal: controller.signal }); }
      finally { clearTimeout(t); }
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

    function fmtDate(ts) { if (!ts) return ''; try { return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); } catch (_) { return ''; } }

    async function getAccessToken() {
      try { const t = localStorage.getItem('px_token'); if (t) return t; } catch (_) { }
      try { if (window.supabase && supabase.auth) { const { data } = await supabase.auth.getSession(); const tk = data?.session?.access_token; if (tk) return tk; } } catch (_) { }
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

    function showNotAdmin(msg) {
      const root = document.getElementById('pageRoot');
      if (!root) return;
      root.innerHTML = `<div class="p-10 text-center space-y-4 glass-panel rounded-2xl ring-1 ring-black/10 dark:ring-white/10 shadow-glass">
        <div class="mx-auto w-14 h-14 rounded-full flex items-center justify-center bg-red-500/10 text-red-600 dark:text-red-400"><span class="material-symbols-rounded">block</span></div>
        <h2 class="text-xl font-bold">Admin Access Required</h2>
        <p class="text-sm opacity-70 max-w-md mx-auto">${msg || 'Your account does not have administrator privileges.'}</p>
      </div>`;
    }

    const state = { applications: [] };
    const appsTbody = document.getElementById('appsTbody');
    const appsLoading = document.getElementById('appsLoading');
    const appsError = document.getElementById('appsError');
    const appsEmpty = document.getElementById('appsEmpty');
    const statusFilter = document.getElementById('appStatusFilter');

    let academicMeta = null;
    async function fetchAcademicMeta() {
      const cacheKey = 'px_academic_meta_v1';
      const maxAgeMs = 24 * 60 * 60 * 1000;
      try {
        const raw = localStorage.getItem(cacheKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.fetchedAt && parsed.data && (Date.now() - parsed.fetchedAt) < maxAgeMs) {
            academicMeta = parsed.data;
            return;
          }
        }
      } catch (_) { }

      try {
        const res = await fetch(`${API}/api/public/academic-meta`);
        if (res.ok) {
          const data = await res.json();
          academicMeta = data;
          try { localStorage.setItem(cacheKey, JSON.stringify({ fetchedAt: Date.now(), data })); } catch (_) { }
        }
      } catch (_) { }
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
      const rel = clean.startsWith('assets/') ? '/' + clean : (clean.startsWith('/') ? clean : '/' + clean);
      try {
        if (API && !rel.startsWith('http')) {
          const apiUrl = new URL(API);
          if (location.origin !== apiUrl.origin) { return apiUrl.origin + rel; }
        }
      } catch (_) { }
      return rel;
    }

    async function fetchApplications() {
      appsLoading.classList.remove('hidden');
      appsError.classList.add('hidden');
      appsEmpty.classList.add('hidden');
      appsTbody.innerHTML = '';
      try {
        const token = await getAccessToken();
        if (!token) throw new Error('Missing auth token');
        const q = statusFilter.value ? `?status=${encodeURIComponent(statusFilter.value)}` : '';
        const res = await fetch(`${API}/api/admin/hod-applications${q}`, { headers: { 'Authorization': 'Bearer ' + token } });
        if (res.status === 403) { showNotAdmin('Not an admin — access denied'); return; }
        if (!res.ok) throw new Error('Failed to load: ' + res.status);
        const data = await res.json();
        state.applications = (data.applications || []);
        if (academicMeta === null) { await fetchAcademicMeta(); }
        renderApplications();
      } catch (err) {
        appsError.textContent = err.message || 'Error loading applications';
        appsError.classList.remove('hidden');
      } finally {
        appsLoading.classList.add('hidden');
      }
    }

    function appRow(app) {
      const front = resolveImgPath(app.id_card_front_path || '');
      const back = resolveImgPath(app.id_card_back_path || '');
      const created = fmtDate(app.created_at);
      const statusColors = { pending: 'bg-amber-500/80', approved: 'bg-green-600/85', rejected: 'bg-red-600/85' };
      const pillColor = statusColors[app.status] || 'bg-neutral-500/70';
      const collegeName = mapCollege(app.college_id);
      const deptName = mapDept(app.department_id);
      const motivation = (app.motivation || '').trim();

      const imgBtn = (src, label) => {
        if (!src) {
          return `<div class="h-8 px-3 rounded-md bg-neutral-200/60 dark:bg-white/5 flex items-center justify-center text-[10px] opacity-50">No ${label.toLowerCase()}</div>`;
        }
        return `<button type="button" class="inline-flex items-center gap-1 px-3 h-8 rounded-md bg-white/70 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 transition ring-1 ring-black/10 dark:ring-white/10" data-img-btn data-full="${src}" data-caption="${label}"><span class="material-symbols-rounded text-[16px]">image</span><span class="text-[11px] font-medium">${label}</span></button>`;
      };

      return `<tr>
        <td class="py-3 pr-3 align-top">
          <div class="font-semibold leading-tight">${app.name || '(no name)'}</div>
          <div class="text-[11px] opacity-70 break-all">${app.email || ''}</div>
        </td>
        <td class="py-3 pr-3 text-[11px] align-top">
          <div><span class="font-medium">College:</span> ${collegeName || '—'}</div>
          <div><span class="font-medium">Dept:</span> ${deptName || '—'}</div>
        </td>
        <td class="py-3 pr-3 text-[11px] align-top">
          ${motivation ? `<div class="max-w-[320px] whitespace-pre-wrap">${motivation.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>` : '<span class="opacity-60">—</span>'}
        </td>
        <td class="py-3 pr-3 text-[11px] align-top">
          <div class="flex flex-wrap gap-2">
            ${imgBtn(front, 'Front ID')}
            ${imgBtn(back, 'Back ID')}
          </div>
        </td>
        <td class="py-3 pr-3 text-[11px] align-top">${created || ''}</td>
        <td class="py-3 pr-3 text-[11px] align-top"><span class="status-pill ${pillColor} text-white">${app.status}</span></td>
        <td class="py-3 pr-3 align-top w-[180px]">
          <textarea data-notes placeholder="Notes" class="w-full rounded-md bg-white/70 dark:bg-white/10 border border-black/10 dark:border-white/10 px-2 py-1 text-[11px] focus:outline-none focus:ring-2 focus:ring-brand-500/40 resize-none h-16"></textarea>
        </td>
        <td class="py-3 pr-3 align-top text-[11px]">
          <div class="flex flex-col gap-2">
            <button data-approve class="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-md bg-green-600/80 hover:bg-green-600 text-white font-medium disabled:opacity-50" title="Approve"><span class="material-symbols-rounded text-[16px]">check_circle</span></button>
            <button data-reject class="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-md bg-red-600/80 hover:bg-red-600 text-white font-medium disabled:opacity-50" title="Reject"><span class="material-symbols-rounded text-[16px]">cancel</span></button>
          </div>
        </td>
      </tr>`;
    }

    function renderApplications() {
      appsTbody.innerHTML = '';
      const list = state.applications;
      if (!list.length) { appsEmpty.classList.remove('hidden'); return; }
      appsEmpty.classList.add('hidden');
      list.forEach(app => {
        const wrapper = document.createElement('tbody');
        wrapper.innerHTML = appRow(app);
        const row = wrapper.firstElementChild;
        attachHandlers(row, app);
        appsTbody.appendChild(row);
      });
    }

    async function reviewApplication(app, status, notes) {
      const token = await getAccessToken();
      if (!token) throw new Error('Missing token');
      const res = await fetch(`${API}/api/admin/hod-applications/${encodeURIComponent(app.id)}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ status, notes: notes || '' })
      });
      if (!res.ok) throw new Error(`Review failed: ${res.status}`);
      return res.json();
    }

    function attachHandlers(row, app) {
      const approveBtn = row.querySelector('[data-approve]');
      const rejectBtn = row.querySelector('[data-reject]');
      const notesEl = row.querySelector('[data-notes]');
      const imgBtns = row.querySelectorAll('[data-img-btn]');
      imgBtns.forEach(btn => btn.addEventListener('click', () => openImageModal(btn.getAttribute('data-full'), btn.getAttribute('data-caption') || 'Preview')));
      function setLoading(disabled) { [approveBtn, rejectBtn, notesEl].forEach(el => el && (el.disabled = disabled)); }

      if (approveBtn) {
        approveBtn.addEventListener('click', async () => {
          if (!confirm('Approve this HOD application?')) return;
          try { setLoading(true); await reviewApplication(app, 'approved', notesEl.value); await fetchApplications(); }
          catch (err) { alert(err.message || 'Approve error'); }
          finally { setLoading(false); }
        });
      }
      if (rejectBtn) {
        rejectBtn.addEventListener('click', async () => {
          const reason = notesEl.value || prompt('Optional rejection notes:', '');
          if (!confirm('Reject this HOD application?')) return;
          try { setLoading(true); await reviewApplication(app, 'rejected', reason); await fetchApplications(); }
          catch (err) { alert(err.message || 'Reject error'); }
          finally { setLoading(false); }
        });
      }
    }

    // Image modal
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
    modal.addEventListener('click', e => { if (e.target === modal || e.target.hasAttribute('data-close')) closeImageModal(); });

    document.addEventListener('click', e => {
      if (e.target && e.target.id === 'themeToggle') {
        const root = document.documentElement;
        const dark = root.classList.toggle('dark');
        localStorage.setItem('px_theme', dark ? 'dark' : 'light');
        e.target.textContent = dark ? 'light_mode' : 'dark_mode';
      }
    });

    document.getElementById('refreshApps').addEventListener('click', fetchApplications);
    statusFilter.addEventListener('change', fetchApplications);

    (async () => {
      try {
        await resolveApiBase();
        await adminSelfCheck();
        await fetchApplications();
      } catch (err) {
        const msg = err?.message || 'Not authorized';
        if (/No auth token/i.test(msg)) {
          setTimeout(() => { location.href = 'login.html?next=' + encodeURIComponent(location.pathname); }, 700);
          return;
        }
        showNotAdmin(msg);
      }
    })();
