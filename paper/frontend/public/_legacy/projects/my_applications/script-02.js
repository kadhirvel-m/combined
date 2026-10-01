// Extracted from ui/projects/my_applications.html (inline <script> #2).
    const API = ((window.API_BASE || window.__API_BASE || 'http://0.0.0.0:10000')).replace(/\/$/, '');
    const token = localStorage.getItem('px_token');
    if (!token) { window.location.href = '../login.html'; }

    const el = (id) => document.getElementById(id);
    const status = el('status');
    const cards = el('cards');
    const esc = (s) => (s ?? '').toString().replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

    async function loadMyApplications() {
      status.textContent = 'Loading…';
      try {
        const res = await fetch(`${API}/api/applications/mine`, { headers: { Authorization: `Bearer ${token}` } });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(payload.detail || 'Failed to load');
        const apps = Array.isArray(payload.applications) ? payload.applications : [];
        const projects = Array.isArray(payload.projects) ? payload.projects : [];
        const projMap = {}; (projects || []).forEach(p => { if (p?.id) projMap[p.id] = p; });
        if (apps.length === 0) {
          cards.innerHTML = '<div class="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 p-6">No applications yet. Explore projects to apply.</div>';
          status.textContent = '';
          return;
        }
        cards.innerHTML = apps.map(a => {
          const proj = projMap[a.project_id] || { id: a.project_id, title: 'Project' };
          const cover = proj.cover_url ? `<img src="${esc(proj.cover_url)}" class="w-full h-32 object-cover rounded-xl border border-black/10 dark:border-white/10" alt="cover"/>` : '';
          const badgeColor = (s) => {
            const v = String(s || '').toLowerCase();
            if (v === 'accepted') return 'bg-emerald-600';
            if (v === 'rejected') return 'bg-rose-600';
            return 'bg-amber-600';
          };
          return `
            <article class="lift rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-900/70 p-5 space-y-3">
              ${cover}
              <div class="flex items-center justify-between gap-2">
                <a class="font-semibold text-brand-700 dark:text-brand-300 hover:underline" href="project.html?id=${encodeURIComponent(a.project_id)}">${esc(proj.title || 'Project')}</a>
                <span class="inline-flex items-center gap-1 text-xs text-white px-2 py-1 rounded-full ${badgeColor(a.status)}"><span class="icon text-[14px]">flag</span>${esc(a.status || 'pending')}</span>
              </div>
              ${a.message ? `<p class="text-sm opacity-80">${esc(a.message)}</p>` : ''}
              <div class="text-xs opacity-70 flex items-center justify-between">
                <span>Applied: ${esc((a.created_at || '').replace('T', ' ').replace('Z', ''))}</span>
                ${a.updated_at ? `<span>Updated: ${esc((a.updated_at || '').replace('T', ' ').replace('Z', ''))}</span>` : ''}
              </div>
            </article>
          `;
        }).join('');
        status.textContent = '';
      } catch (e) {
        status.textContent = e.message || 'Failed to load.';
      }
    }

    // Auth-aware navbar avatar
    (function () {
      const token = localStorage.getItem('px_token');
      if (!token) return;
      document.getElementById('signInLink')?.classList.add('hidden');
      const navProfile = document.getElementById('navProfile');
      const navProfileImg = document.getElementById('navProfileImg');
      const navProfileInitial = document.getElementById('navProfileInitial');
      if (navProfile) navProfile.classList.remove('hidden');
      const API = ((window.API_BASE || window.__API_BASE || 'http://0.0.0.0:10000')).replace(/\/$/, '');
      fetch(`${API}/api/profile`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(p => {
          if (!p) return;
          let initials = 'ME';
          if (p.name) initials = p.name.split(' ').filter(Boolean).map(s => s[0]?.toUpperCase()).slice(0, 2).join('');
          if (navProfileInitial) navProfileInitial.textContent = initials;
          if (p.profile_image_url) {
            if (navProfileImg) { navProfileImg.src = p.profile_image_url; navProfileImg.classList.remove('hidden'); if (navProfileInitial) navProfileInitial.classList.add('hidden'); }
          }
        }).catch(() => { });
    })();

    loadMyApplications();
