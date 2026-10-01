// Extracted from ui/projects/public_profile.html (inline <script> #2).
    // Year + mobile menu
    document.getElementById('year').textContent = new Date().getFullYear();
    document.getElementById('menuBtn')?.addEventListener('click', () => document.getElementById('mobileMenu')?.classList.toggle('hidden'));

    const API = ((window.API_BASE || window.__API_BASE || 'http://0.0.0.0:10000')).replace(/\/$/, '');
    const params = new URLSearchParams(location.search);
    const uid = params.get('user_id');
    const projectId = params.get('project_id');
    const applicationId = params.get('application_id');
    const token = localStorage.getItem('px_token');

    const ownerActions = document.getElementById('ownerActions');
    const ownerActionsStatus = document.getElementById('ownerActionsStatus');

    function toggleOwnerButtons(show) {
      const a = document.getElementById('ownerAccept');
      const r = document.getElementById('ownerReject');
      if (!a || !r) return;
      a.classList.toggle('hidden', !show);
      r.classList.toggle('hidden', !show);
    }

    async function getAppIfOwner() {
      if (!projectId || !applicationId || !token) return null;
      try {
        const r = await fetch(`${API}/api/projects/${encodeURIComponent(projectId)}/applications/${encodeURIComponent(applicationId)}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!r.ok) return null; // owner-only endpoint; non-owners will 403
        const app = await r.json();
        ownerActions.classList.remove('hidden');
        const current = String(app?.status || 'pending').toLowerCase();
        ownerActionsStatus.textContent = `Status: ${current}`;
        toggleOwnerButtons(current === 'pending');
        const setBusy = (b) => {
          document.getElementById('ownerAccept').disabled = b;
          document.getElementById('ownerReject').disabled = b;
        };
        async function update(newStatus) {
          try {
            setBusy(true);
            const res = await fetch(`${API}/api/projects/${encodeURIComponent(projectId)}/applications/${encodeURIComponent(applicationId)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status: newStatus }) });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.detail || 'Failed to update');
            const final = String(data?.application?.status || newStatus).toLowerCase();
            ownerActionsStatus.textContent = `Status: ${final}`;
            toggleOwnerButtons(false);
          } catch (e) { alert(e.message || 'Could not update'); }
          finally { setBusy(false); }
        }
        document.getElementById('ownerAccept').onclick = () => update('accepted');
        document.getElementById('ownerReject').onclick = () => update('rejected');
        return app;
      } catch { return null; }
    }

    // Helpers (mirroring profile.html)
    const el = (id) => document.getElementById(id);
    const defaultText = (v, fb = "--") => v ? v : fb;
    const setText = (id, v, fb = "--") => { const n = el(id); if (n) n.textContent = defaultText(v, fb); };
    const setLink = (id, v) => {
      const a = el(id); if (!a) return;
      if (v) { a.href = v; a.classList.remove('pointer-events-none', 'opacity-50'); }
      else { a.href = '#'; a.classList.add('pointer-events-none', 'opacity-50'); }
    };
    const calcCompleteness = (p) => {
      const fields = [p.name, p.headline, p.location, p.college, (p.batch_start || p.batch_end), p.github, p.linkedin, p.resume_url, p.bio, p.skills, p.technologies];
      const filled = fields.filter(Boolean).length;
      return Math.min(100, Math.round((filled / fields.length) * 100)) || 0;
    };
    const renderSkillChips = (skillsText) => {
      const wrap = document.getElementById('skills-chips'); if (!wrap) return; wrap.innerHTML = '';
      const parts = (skillsText || '').split(/[ ,|\n]/).map(s => s.trim()).filter(Boolean).slice(0, 25);
      parts.forEach(s => { const a = document.createElement('a'); a.href = `skill-test.html?skill=${encodeURIComponent(s)}`; a.className = 'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs border border-brand-600/40 text-brand-700 dark:text-brand-200 bg-brand-500/10'; a.innerHTML = '<span class="icon text-sm">bolt</span>' + s; wrap.appendChild(a); });
    };

    // New: Render Technology chips with verification badges
    const parseItems = (text) => (text || '').split(/[ ,|\n]/).map(s => s.trim()).filter(Boolean);
    const key = (s) => (s || '').trim().toLowerCase();
    const badgeColor = (score) => (score >= 70 ? 'bg-emerald-600' : (score >= 40 ? 'bg-amber-600' : 'bg-rose-600'));
    const renderTechChips = (technologiesText, verifMap) => {
      const wrap = document.getElementById('tech-chips'); if (!wrap) return; wrap.innerHTML = '';
      const parts = parseItems(technologiesText).slice(0, 30);
      parts.forEach(t => {
        const chipEl = document.createElement('span');
        chipEl.className = 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs border border-brand-600/40 text-brand-700 dark:text-brand-200 bg-brand-500/10 cursor-default select-none';
        const info = verifMap[key(t)];
        const score = typeof info?.best_score === 'number' ? Math.round(info.best_score) : null;
        const badge = score != null ? `<span class="ml-1 inline-flex items-center gap-1 ${badgeColor(score)} text-white rounded-full px-2 py-0.5"><span class="icon text-[14px]">verified</span>${score}</span>` : '';
        chipEl.innerHTML = `<span class="icon text-sm">bolt</span><span>${t}</span>${badge}`;
        wrap.appendChild(chipEl);
      });
    };

    const loadPublicVerifications = async (userId) => {
      try {
        const r = await fetch(`${API}/api/public/skills/verifications/${encodeURIComponent(userId)}`);
        if (!r.ok) return {};
        const rows = await r.json();
        const map = {}; (rows || []).forEach(v => { map[key(v.skill)] = v; });
        return map;
      } catch { return {}; }
    };

    const populateProfile = (profile) => {
      const name = profile.name || 'Member';
      setText('profileName', name, 'Member');
      setText('profileHeadline', profile.headline, 'Public profile');
      setText('profileLocation', profile.location, '');
      setText('info-batch-inline', (profile.batch_start || profile.batch_end) ? `${profile.batch_start || "?"} - ${profile.batch_end || "?"}` : '—');

      // Avatar / initials
      const img = el('profileImage'); const fallback = el('profileImageFallback');
      const initials = (name || '').split(' ').filter(Boolean).map(s => s[0]?.toUpperCase()).slice(0, 2).join('');
      if (profile.profile_image_url) { img.src = profile.profile_image_url; img.classList.remove('hidden'); fallback.classList.add('hidden'); }
      else { el('profileInitials').textContent = initials || '?'; img.classList.add('hidden'); fallback.classList.remove('hidden'); }

      // Verification badge
      const score = Number(profile.verification_score ?? 0);
      el('verifyScore').textContent = isNaN(score) ? '--' : String(score);
      const badge = el('verifyBadge');
      if (!isNaN(score)) {
        badge.classList.toggle('bg-emerald-600', score >= 70);
        badge.classList.toggle('bg-amber-600', score < 70 && score >= 40);
        badge.classList.toggle('bg-rose-600', score < 40);
      }

      // Completeness
      const pct = calcCompleteness(profile); el('completePct').textContent = pct + '%'; el('completeBar').style.width = pct + '%';

      // Overview fields
      setText('info-name', profile.name);
      setText('info-college', profile.college);
      setText('info-batch', (profile.batch_start || profile.batch_end) ? `${profile.batch_start || "?"} - ${profile.batch_end || "?"}` : '--');
      setText('info-dob', profile.dob);
      setText('info-phone', profile.phone);
      setText('info-email', profile.email);

      // Links
      setLink('link-linkedin', profile.linkedin);
      setLink('link-github', profile.github);
      setLink('link-leetcode', profile.leetcode);
      setLink('link-portfolio', profile.portfolio_url);
      setLink('link-website', profile.website);
      setLink('link-twitter', profile.twitter);
      setLink('link-instagram', profile.instagram);
      setLink('link-medium', profile.medium);
      setLink('link-resume', profile.resume_url);

      // About / Activity fields
      setText('info-bio', profile.bio, '—');
      setText('info-projects', profile.project_info);
      setText('info-publications', profile.publications);
      setText('info-achievements', profile.achievements);
      setText('info-experience', profile.experience);
      setText('info-specializations', profile.specializations);
      setText('info-technologies', profile.technologies);
      setText('info-skills', profile.skills);
      renderSkillChips(profile.skills);
      setText('info-certifications', profile.certifications);
      setText('info-languages', profile.languages);
      setText('info-interests', profile.interests);
    };

    // Tabs
    const tabBtns = document.querySelectorAll('.tabBtn');
    const tabPanels = document.querySelectorAll('.tabPanel');
    tabBtns.forEach(btn => btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('bg-brand-600', 'text-white'));
      btn.classList.add('bg-brand-600', 'text-white');
      const t = btn.getAttribute('data-tab');
      tabPanels.forEach(p => p.classList.toggle('hidden', p.getAttribute('data-panel') !== t));
    }));

    const statusEl = el('status');

    // Load page
    const loadPublicProfile = async () => {
      if (!uid) { statusEl.textContent = 'Missing user id.'; return; }
      statusEl.textContent = 'Loading profile…';
      try {
        const res = await fetch(`${API}/api/public/profiles/${encodeURIComponent(uid)}`);
        const p = await res.json();
        populateProfile(p || { user_id: uid });
        // Load per-tech verifications and render chips
        const verifMap = await loadPublicVerifications(uid);
        renderTechChips(p?.technologies, verifMap);
        statusEl.textContent = '';
        // Header texts for projects
        const name = p?.name || 'Member';
        el('sectionTitle').textContent = `Projects by ${name}`;
        el('sectionSub').textContent = `Published by ${name}`;
      } catch (e) { console.error(e); statusEl.textContent = 'Failed to load profile.'; }
    };

    const esc = (s) => (s || '').toString().replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    const chip = (t) => `<span class="rounded-lg px-2 py-1 bg-black/5 dark:bg-white/10 text-xs">${esc(t)}</span>`;
    const skeleton = () => `
      <article class="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 p-4 animate-pulse">
        <div class="h-40 w-full bg-black/10 dark:bg-white/10 rounded-lg"></div>
        <div class="h-5 w-3/4 bg-black/10 dark:bg:white/10 rounded mt-4"></div>
        <div class="h-4 w-2/3 bg-black/10 dark:bg:white/10 rounded mt-2"></div>
      </article>`;

    const loadProjects = async () => {
      const grid = el('grid');
      grid.innerHTML = skeleton() + skeleton() + skeleton();
      try {
        const r = await fetch(`${API}/api/projects`);
        const items = await r.json();
        const mine = Array.isArray(items) ? items.filter(p => p.user_id === uid) : [];
        if (!mine.length) { grid.innerHTML = `<div class="col-span-full text-sm opacity-70 rounded-xl border border-black/10 dark:border-white/10 p-4">No public projects yet.</div>`; return; }
        grid.innerHTML = mine.map(p => {
          const b = p.basics || {};
          const cover = p.cover_url ? `<img src="${esc(p.cover_url)}" alt="Cover" class="w-full h-40 object-cover">` : `<div class=\"w-full h-40 bg-black/5 dark:bg-white/10\"></div>`;
          const domain = (Array.isArray(b.domains) && b.domains[0]) ? `<span class=\"text-xs rounded-full px-2 py-1 bg-brand-600 text-white\">${esc(b.domains[0])}</span>` : '';
          const techs = (Array.isArray(b.tech_stack) ? b.tech_stack.slice(0, 3) : []).map(chip).join('');
          const title = esc(b.title || 'Untitled');
          const tagline = esc(b.tagline || (b.description || ''));
          return `
            <article class=\"lift rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 overflow-hidden\"> 
              <div class=\"overflow-hidden\">${cover}</div>
              <div class=\"p-4\">
                <div class=\"flex items-center justify-between\">${domain}<span class=\"text-xs opacity-70\"></span></div>
                <h3 class=\"mt-3 font-semibold line-clamp-1\">${title}</h3>
                <p class=\"mt-1 text-sm opacity-80 line-clamp-2\">${tagline}</p>
                <div class=\"mt-3 flex flex-wrap gap-2 text-xs\">${techs}</div>
                <div class=\"mt-4 flex items-center justify-between\">
                  <a href=\"project.html?id=${encodeURIComponent(p.id)}\" class=\"rounded-xl px-3 py-2 border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg:white/10\"><span class=\"icon align-[-3px]\">open_in_new</span> View</a>
                </div>
              </div>
            </article>`;
        }).join('');
      } catch { grid.innerHTML = `<div class=\"col-span-full text-sm opacity-70 rounded-xl border border-black/10 dark:border-white/10 p-4\">Failed to load projects.</div>`; }
    };

    // Share button
    document.getElementById('shareBtn')?.addEventListener('click', () => {
      const url = window.location.href;
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(url).then(() => {
          const t = document.createElement('div'); t.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] rounded-xl bg-black/90 text-white px-4 py-2 text-sm shadow-soft'; t.textContent = 'Link copied to clipboard'; document.body.appendChild(t); setTimeout(() => t.remove(), 1500);
        });
      } else {
        const ta = document.createElement('textarea'); ta.value = url; ta.style.position = 'fixed'; ta.style.left = '-999px'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
        const t = document.createElement('div'); t.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] rounded-xl bg-black/90 text-white px-4 py-2 text-sm shadow-soft'; t.textContent = 'Link copied to clipboard'; document.body.appendChild(t); setTimeout(() => t.remove(), 1500);
      }
    });

    // Auth-aware navbar tweaks (avatar like index/postings)
    (function () {
      const token = localStorage.getItem('px_token');
      if (!token) return;
      // Hide Sign in / Sign up
      document.querySelectorAll('a[href="login.html"], a[href="signup.html"]').forEach(el => el.classList.add('hidden'));
      document.querySelectorAll('#mobileMenu a[href="login.html"], #mobileMenu a[href="signup.html"]').forEach(el => el.classList.add('hidden'));
      // Show avatar buttons
      const navProfile = document.getElementById('navProfile');
      const navProfileImg = document.getElementById('navProfileImg');
      const navProfileInitial = document.getElementById('navProfileInitial');
      const navProfileMobile = document.getElementById('navProfileMobile');
      const navProfileMobileImg = document.getElementById('navProfileMobileImg');
      const navProfileMobileInitial = document.getElementById('navProfileMobileInitial');
      if (navProfile) navProfile.classList.remove('hidden');
      if (navProfileMobile) navProfileMobile.classList.remove('hidden');
      const API = ((window.API_BASE || window.__API_BASE || 'http://0.0.0.0:10000')).replace(/\/$/, '');
      fetch(`${API}/api/profile`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(p => {
          if (!p) return;
          let initials = 'ME';
          if (p.name) initials = p.name.split(' ').filter(Boolean).map(s => s[0]?.toUpperCase()).slice(0, 2).join('');
          if (navProfileInitial) navProfileInitial.textContent = initials;
          if (navProfileMobileInitial) navProfileMobileInitial.textContent = initials;
          if (p.profile_image_url) {
            if (navProfileImg) { navProfileImg.src = p.profile_image_url; navProfileImg.classList.remove('hidden'); if (navProfileInitial) navProfileInitial.classList.add('hidden'); }
            if (navProfileMobileImg) { navProfileMobileImg.src = p.profile_image_url; navProfileMobileImg.classList.remove('hidden'); if (navProfileMobileInitial) navProfileMobileInitial.classList.add('hidden'); }
          }
        })
        .catch(() => { });
    })();

    // Init
    if (!uid) { el('grid').innerHTML = `<div class="col-span-full rounded-xl border border-amber-400/40 bg-amber-100/60 text-amber-900 px-4 py-3">Missing user id.</div>`; }
    loadPublicProfile();
    loadProjects();
    getAppIfOwner();
