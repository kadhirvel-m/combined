// Extracted from ui/projects/postings.html (inline <script> #4).
    // Listings logic (adapted styles remain)
    // mobile menu
    // Auth-aware avatar
    (function () { const token = localStorage.getItem('px_token'); if (!token) return; document.querySelectorAll('a[href="../login.html"], a[href="../signup.html"]').forEach(el => el.classList.add('hidden')); const navProfile = document.getElementById('navProfile'); const navProfileImg = document.getElementById('navProfileImg'); const navProfileInitial = document.getElementById('navProfileInitial'); if (navProfile) navProfile.classList.remove('hidden'); const API = ((window.API_BASE || window.__API_BASE || 'http://0.0.0.0:10000')).replace(/\/$/, ''); fetch(`${API}/api/profile`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.ok ? r.json() : null).then(p => { if (!p) return; let initials = 'ME'; if (p.name) initials = p.name.split(' ').filter(Boolean).map(s => s[0]?.toUpperCase()).slice(0, 2).join(''); if (navProfileInitial) navProfileInitial.textContent = initials; if (p.profile_image_url && navProfileImg) { navProfileImg.src = p.profile_image_url; navProfileImg.classList.remove('hidden'); navProfileInitial.classList.add('hidden'); } }).catch(() => { }); })();

    (function () {
      const API = ((window.API_BASE || window.__API_BASE || 'http://0.0.0.0:10000')).replace(/\/$/, '');
      const grid = document.getElementById('postingsGrid');
      const q = document.getElementById('q');
      const cat = document.getElementById('cat');
      const btnSearch = document.getElementById('btnSearch');

      const skeleton = () => `
        <article class="rounded-2xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-white/5 p-4 animate-pulse">
          <div class="h-40 w-full bg-black/5 dark:bg-white/10 rounded-xl"></div>
          <div class="h-5 w-3/4 bg-black/5 dark:bg-white/10 rounded mt-4"></div>
          <div class="h-4 w-2/3 bg-black/5 dark:bg-white/10 rounded mt-2"></div>
          <div class="flex gap-2 mt-4">
            <div class="h-6 w-16 bg-black/5 dark:bg-white/10 rounded"></div>
            <div class="h-6 w-16 bg-black/5 dark:bg-white/10 rounded"></div>
            <div class="h-6 w-16 bg-black/5 dark:bg-white/10 rounded"></div>
          </div>
        </article>`;

      const esc = (s) => (s || '').toString().replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
      const chip = (t) => `<span class="rounded-full px-2 py-1 bg-brandlt-200/70 dark:bg-white/10 text-[11px] text-brand-700 dark:text-white/80 ring-1 ring-black/5 dark:ring-white/10">${esc(t)}</span>`;
      const domainPill = (d) => `<span class="text-[11px] rounded-full px-2 py-1 bg-gradient-to-r from-brand-500 to-brand-700 text-white shadow-sm">${esc(d)}</span>`;

      const initialsOf = (name) => (name || '').split(' ').filter(Boolean).map(s => s[0]?.toUpperCase()).slice(0, 2).join('') || 'U';

      // Helpers for skills parsing and match score
      const normalize = (s) => (s || '').toString().trim().toLowerCase();
      const splitSkills = (text) => {
        if (!text) return [];
        return text.split(/[,;\n\t|]+/).map(normalize).filter(Boolean);
      };
      const unique = (arr) => Array.from(new Set(arr));

      const token = localStorage.getItem('px_token');
      let mySkills = null; // null until loaded; [] if none
      const getMyProfileSkills = async () => {
        if (!token) return [];
        try {
          const r = await fetch(`${API}/api/profile`, { headers: { Authorization: `Bearer ${token}` } });
          if (!r.ok) return [];
          const prof = await r.json();
          const skills = unique([
            ...splitSkills(prof.skills),
            ...splitSkills(prof.technologies),
          ]);
          return skills;
        } catch { return []; }
      };

      const matchScore = (postSkills = [], mySkillsArr = []) => {
        const ps = unique((postSkills || []).map(normalize).filter(Boolean));
        const ms = new Set((mySkillsArr || []).map(normalize).filter(Boolean));
        const total = ps.length;
        let matches = 0;
        if (total && ms.size) {
          ps.forEach(s => { if (ms.has(s)) matches++; });
        }
        const percent = total ? Math.round((matches / total) * 100) : 0;
        return { matches, total, percent };
      };

      const render = (items = [], publishers = {}, mySkillsArr = []) => {
        if (!items.length) {
          grid.innerHTML = `<div class="col-span-full text-sm opacity-70 rounded-xl border border-black/10 dark:border-white/10 p-4">No postings yet.</div>`;
          return;
        }
        grid.innerHTML = items.map(p => {
          const b = p.basics || {};
          const cover = p.cover_url ? `<img src="${esc(p.cover_url)}" alt="Cover" class="w-full h-40 object-cover">` : `<div class="w-full h-40 bg-black/5 dark:bg:white/10"></div>`;
          const domain = (Array.isArray(b.domains) && b.domains[0]) ? domainPill(b.domains[0]) : '';
          const techs = (Array.isArray(b.tech_stack) ? b.tech_stack.slice(0, 3) : []).map(chip).join('');
          const title = esc(b.title || 'Untitled');
          const tagline = esc(b.tagline || (b.description || ''));
          const pub = publishers[p.user_id] || {};
          const pubName = esc(pub.name || 'View publisher');
          const pubHref = `public_profile.html?user_id=${encodeURIComponent(p.user_id || '')}`;
          const avatar = pub.profile_image_url
            ? `<img src="${esc(pub.profile_image_url)}" alt="${pubName}" class="w-7 h-7 rounded-full object-cover"/>`
            : `<span class="w-7 h-7 inline-flex items-center justify-center rounded-full bg-black/10 dark:bg:white/10 text-[10px]">${initialsOf(pub.name)}</span>`;
          const score = matchScore(b.tech_stack || [], mySkillsArr);
          const color = score.total === 0 ? 'bg-neutral-500/70' : (score.percent >= 66 ? 'bg-emerald-600' : score.percent >= 33 ? 'bg-amber-600' : 'bg-brand-700');
          const pillTitle = score.total ? `${score.matches} of ${score.total} skills match` : (mySkillsArr.length ? 'No skills listed in posting' : 'Add skills in profile to see match');
          const pill = `<span title="${esc(pillTitle)}" class="inline-flex items-center gap-1 text-[11px] ${color} text-white px-2 py-1 rounded-full shadow-md"><span class="material-symbols-rounded text-[15px]">bolt</span>${score.total ? score.percent + '%' : '—'}</span>`;

          return `
            <article class="relative lift rounded-3xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur overflow-hidden cursor-pointer p-0" onclick="window.location.href='project.html?id=${encodeURIComponent(p.id)}'">
              <div class="absolute top-2 right-2 z-10">${pill}</div>
              <div class="overflow-hidden">${cover}</div>
              <div class="p-5">
                <div class="flex items-center justify-between">${domain}<span class="text-xs opacity-70"></span></div>
                <h3 class="mt-3 font-semibold text-neutral-900 dark:text-white line-clamp-1">${title}</h3>
                <p class="mt-1 text-sm text-neutral-600 dark:text-white/70 line-clamp-2">${tagline}</p>
                <div class="mt-3 flex flex-wrap gap-2">${techs}</div>
                <div class="mt-4 flex items-center justify-between">
                  <a href="${pubHref}" onclick="event.stopPropagation()" class="flex items-center gap-2 text-sm opacity-90 hover:opacity-100">
                    ${avatar}
                    <span class="hover:underline">${pubName}</span>
                  </a>
                  <button class="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-medium border border-black/10 dark:border-white/15 hover:border-brand-500/50 hover:bg-black/5 dark:hover:bg-white/10 transition"><span class="material-symbols-rounded text-[16px]">bookmark_add</span>Save</button>
                </div>
              </div>
            </article>`;
        }).join('');
      };

      const prefetchPublishers = async (items = []) => {
        const uids = Array.from(new Set(items.map(p => p.user_id).filter(Boolean)));
        const entries = await Promise.all(uids.map(async uid => {
          try {
            const r = await fetch(`${API}/api/public/profiles/${encodeURIComponent(uid)}`);
            if (!r.ok) throw new Error('nf');
            const d = await r.json();
            return [uid, d];
          } catch { return [uid, { user_id: uid }]; }
        }));
        const map = {};
        entries.forEach(([k, v]) => map[k] = v);
        return map;
      };

      const load = async () => {
        grid.innerHTML = skeleton() + skeleton() + skeleton();
        try {
          if (mySkills === null) mySkills = await getMyProfileSkills();
          const r = await fetch(`${API}/api/projects`);
          let items = await r.json();
          if (!Array.isArray(items)) items = [];
          // basic client-side filter using nested basics
          const term = (q.value || '').toLowerCase();
          const catVal = (cat.value || '').toLowerCase();
          const filtered = items.filter(p => {
            const b = p.basics || {};
            const joined = [b.title, b.tagline, b.description, ...(b.tech_stack || []), ...(b.domains || [])].join(' ').toLowerCase();
            const inTerm = !term || joined.includes(term);
            const inCat = !catVal || (Array.isArray(b.domains) && b.domains.join(' ').toLowerCase().includes(catVal));
            return inTerm && inCat;
          });
          const publishers = await prefetchPublishers(filtered);
          render(filtered, publishers, mySkills || []);
        } catch (e) {
          grid.innerHTML = `<div class=\"col-span-full text-sm opacity-70 rounded-xl border border-black/10 dark:border-white/10 p-4\">Failed to load postings.</div>`;
        }
      };

      btnSearch.addEventListener('click', load);
      q.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); load(); } });
      cat.addEventListener('change', load);
      load();
    })();
