// Extracted from ui/projects/project_applicants.html (inline <script> #2).
    const API = ((window.API_BASE || window.__API_BASE || 'http://0.0.0.0:10000')).replace(/\/$/, '');
    const token = localStorage.getItem('px_token');
    if (!token) { window.location.href = 'login.html'; }
    const qs = new URLSearchParams(location.search);
    const projectId = qs.get('id');
    document.getElementById('backLink').href = `project.html?id=${encodeURIComponent(projectId || '')}`;

    const el = (id) => document.getElementById(id);
    const status = el('status');
    const cards = el('cards');

    const esc = (s) => (s ?? '').toString().replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

    const fetchApplicants = async () => {
      status.textContent = 'Loading applicants…';
      try {
        const res = await fetch(`${API}/api/projects/${projectId}/applications`, { headers: { Authorization: `Bearer ${token}` } });
        const rows = await res.json().catch(() => []);
        if (!res.ok) throw new Error(rows.detail || 'Failed to load');
        if (!Array.isArray(rows) || rows.length === 0) {
          cards.innerHTML = '<div class="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 p-6">No applications yet.</div>';
          status.textContent = '';
          return;
        }
        const profiles = await Promise.all(rows.map(r => fetch(`${API}/api/public/profiles/${encodeURIComponent(r.applicant_user_id)}`).then(x => x.json()).catch(() => ({ user_id: r.applicant_user_id }))));
        const profileMap = {}; profiles.forEach(p => { if (p?.user_id) profileMap[p.user_id] = p; });
        cards.innerHTML = rows.map(r => {
          const p = profileMap[r.applicant_user_id] || { user_id: r.applicant_user_id };
          const name = esc(p.name || 'Anonymous');
          const headline = esc(p.headline || '');
          const image = p.profile_image_url ? `<img src="${esc(p.profile_image_url)}" class="w-12 h-12 rounded-full object-cover" alt="avatar"/>` : `<div class="w-12 h-12 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center">${name.charAt(0) || '?'}</div>`;
          const profileHref = `public_profile.html?user_id=${encodeURIComponent(r.applicant_user_id)}&project_id=${encodeURIComponent(projectId || '')}&application_id=${encodeURIComponent(r.id)}`;
          const isPending = String(r.status || '').toLowerCase() === 'pending';
          const actions = isPending ? `<a class="inline-flex items-center gap-1 text-brand-600" href="${profileHref}"><span class="icon text-sm">open_in_new</span>Review</a>` : `<a class="inline-flex items-center gap-1 text-brand-600" href="${profileHref}"><span class="icon text-sm">open_in_new</span>View</a>`;
          return `
          <article class="lift rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-900/70 p-5 space-y-3">
            <div class="flex items-center gap-3">
              ${image}
              <div class="min-w-0">
                <div class="font-semibold leading-tight truncate">${name}</div>
                <div class="text-xs opacity-70 truncate">${headline}</div>
              </div>
            </div>
            ${r.message ? `<p class="text-sm opacity-80">${esc(r.message)}</p>` : ''}
            <div class="flex items-center justify-between text-xs opacity-70">
              <span>Status: ${esc(r.status)}</span>
              ${actions}
            </div>
          </article>`;
        }).join('');
        status.textContent = '';
      } catch (e) {
        status.textContent = e.message || 'Failed to load applicants.';
      }
    };

    fetchApplicants();

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
