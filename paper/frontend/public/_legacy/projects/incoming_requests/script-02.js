// Extracted from ui/projects/incoming_requests.html (inline <script> #2).
    const API = ((window.API_BASE || window.__API_BASE || 'http://0.0.0.0:10000')).replace(/\/$/, '');
    const token = localStorage.getItem('px_token');
    if (!token) { window.location.href = '../login.html'; }

    const el = (id) => document.getElementById(id);
    const status = el('status');
    const cards = el('cards');

    const esc = (s) => (s ?? '').toString().replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

    const fetchIncoming = async () => {
      status.textContent = 'Loading requests…';
      try {
        const res = await fetch(`${API}/api/applications/incoming`, { headers: { Authorization: `Bearer ${token}` } });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(payload.detail || 'Failed to load');
        const apps = Array.isArray(payload.applications) ? payload.applications : [];
        const projects = Array.isArray(payload.projects) ? payload.projects : [];
        if (apps.length === 0) {
          cards.innerHTML = '<div class="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/70 p-6">No incoming requests yet.</div>';
          status.textContent = '';
          return;
        }
        const projMap = {}; (projects || []).forEach(p => { if (p?.id) projMap[p.id] = p; });
        // Fetch unique applicant profiles
        const uniqueIds = [...new Set(apps.map(a => a.applicant_user_id).filter(Boolean))];
        const profileMap = {};
        const profs = await Promise.all(uniqueIds.map(uid => fetch(`${API}/api/public/profiles/${encodeURIComponent(uid)}`).then(x => x.json()).catch(() => ({ user_id: uid }))));
        profs.forEach(p => { if (p?.user_id) profileMap[p.user_id] = p; });

        cards.innerHTML = apps.map(r => {
          const p = profileMap[r.applicant_user_id] || { user_id: r.applicant_user_id };
          const name = esc(p.name || 'Anonymous');
          const headline = esc(p.headline || '');
          const image = p.profile_image_url ? `<img src="${esc(p.profile_image_url)}" class="w-12 h-12 rounded-full object-cover" alt="avatar"/>` : `<div class="w-12 h-12 rounded-full bg-black/10 dark:bg:white/10 flex items-center justify-center">${name.charAt(0) || '?'}</div>`;
          const proj = projMap[r.project_id] || { id: r.project_id, title: 'Project' };
          const appId = r.id;
          const profileHref = `public_profile.html?user_id=${encodeURIComponent(r.applicant_user_id)}&project_id=${encodeURIComponent(r.project_id)}&application_id=${encodeURIComponent(appId)}`;
          const st = String(r.status || '').toLowerCase();
          const isPending = (st === 'pending');
          const isAccepted = (st === 'accepted');
          const actions = isPending ? `
            <div id="actions-${appId}" data-profile-href="${esc(profileHref)}" class="flex items-center justify-end gap-2 text-sm">
              <button class="rounded-lg px-3 py-1.5 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg:white/10" onclick="updateAppStatus('${esc(r.project_id)}','${esc(appId)}','accepted')"><span class="icon text-sm">check</span> Accept</button>
              <button class="rounded-lg px-3 py-1.5 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg:white/10" onclick="updateAppStatus('${esc(r.project_id)}','${esc(appId)}','rejected')"><span class="icon text-sm">close</span> Reject</button>
              <a class="inline-flex items-center gap-1 text-brand-600" href="${profileHref}"><span class="icon text-sm">open_in_new</span>View Profile</a>
            </div>` : (isAccepted ? `
            <div id="actions-${appId}" data-profile-href="${esc(profileHref)}" class="flex items-center justify-end gap-2 text-sm">
              <a class="rounded-lg px-3 py-1.5 bg-brand-600 text-white shadow-brand-lg hover:brightness-110" href="collab.html?application_id=${encodeURIComponent(appId)}"><span class="icon text-sm">forum</span> Open Collaboration</a>
              <a class="inline-flex items-center gap-1 text-brand-600" href="${profileHref}"><span class="icon text-sm">open_in_new</span>View Profile</a>
            </div>` : `
            <div id="actions-${appId}" data-profile-href="${esc(profileHref)}" class="flex items-center justify-end gap-2 text-sm">
              <a class="inline-flex items-center gap-1 text-brand-600" href="${profileHref}"><span class="icon text-sm">open_in_new</span>View Profile</a>
            </div>`);
          return `
          <article class="lift rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-900/70 p-5 space-y-3">
            <div class="flex items-center gap-3">
              ${image}
              <div class="min-w-0">
                <a class="font-semibold leading-tight truncate text-brand-700 dark:text-brand-300 hover:underline" href="${profileHref}">${name}</a>
                <div class="text-xs opacity-70 truncate">${headline}</div>
              </div>
            </div>
            ${r.message ? `<p class="text-sm opacity-80">${esc(r.message)}</p>` : ''}
            <div class="flex items-center justify-between text-xs opacity-70">
              <a class="inline-flex items-center gap-1 text-brand-600" href="project.html?id=${encodeURIComponent(r.project_id)}"><span class="icon text-sm">work</span>${esc(proj.title || 'Project')}</a>
              <span id="status-${appId}">Status: ${esc(r.status || 'pending')}</span>
            </div>
            ${actions}
          </article>`;
        }).join('');
        status.textContent = '';
      } catch (e) {
        status.textContent = e.message || 'Failed to load requests.';
      }
    };

    async function updateAppStatus(projectId, appId, newStatus) {
      try {
        const res = await fetch(`${API}/api/projects/${projectId}/applications/${appId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status: newStatus }) });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.detail || 'Failed to update');
        const updatedStatus = String(data?.application?.status || newStatus).toLowerCase();
        const span = document.getElementById(`status-${appId}`);
        if (span) span.textContent = `Status: ${data?.application?.status || newStatus}`;
        const wrap = document.getElementById(`actions-${appId}`);
        if (wrap) {
          const profileHref = wrap.getAttribute('data-profile-href') || '#';
          if (updatedStatus === 'accepted') {
            wrap.innerHTML = `
              <a class="rounded-lg px-3 py-1.5 bg-brand-600 text-white shadow-brand-lg hover:brightness-110" href="collab.html?application_id=${encodeURIComponent(appId)}"><span class="icon text-sm">forum</span> Open Collaboration</a>
              <a class="inline-flex items-center gap-1 text-brand-600" href="${profileHref}"><span class="icon text-sm">open_in_new</span>View Profile</a>
            `;
          } else {
            wrap.innerHTML = `
              <a class="inline-flex items-center gap-1 text-brand-600" href="${profileHref}"><span class="icon text-sm">open_in_new</span>View Profile</a>
            `;
          }
        }
      } catch (e) {
        alert(e.message || 'Could not update request');
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

    fetchIncoming();
