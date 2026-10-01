// Extracted from ui/projects/project.html (inline <script> #2).
    document.getElementById('year').textContent = new Date().getFullYear();

    const API = ((window.API_BASE || window.__API_BASE || 'http://0.0.0.0:10000')).replace(/\/$/, '');
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('id');
    const container = document.getElementById('projectDetails');
    const crumbTitle = document.getElementById('crumbTitle');
    const token = localStorage.getItem('px_token');

    const esc = (s) => (s ?? '').toString().replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    const isNonEmptyArray = (v) => Array.isArray(v) && v.length > 0;

    const pill = (label, cls = 'bg-black/5 dark:bg-white/10 text-xs') => `<span class="inline-flex items-center rounded-full ${cls} px-2 py-1">${esc(label)}</span>`;
    const chip = (label) => `<span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-white/90 text-black ring-1 ring-black/10 backdrop-blur-sm shadow-sm dark:bg-black/60 dark:text-white dark:ring-white/15">${esc(label)}</span>`;
    const linkBtn = (label, icon, href) => href ? `<a class="btn lift bg-black/90 text-white hover:brightness-110 dark:bg-white/10 dark:text-white border border-white/10" target="_blank" rel="noopener" href="${esc(href)}"><span class="icon">${icon}</span>${esc(label)}</a>` : '';
    const ghostBtn = (label, icon, handler) => `<button class="btn lift border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10" onclick="${handler}"><span class="icon">${icon}</span>${esc(label)}</button>`;

    const formatCurrencyINR = (amount) => {
      try { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount); }
      catch { return `₹${amount}`; }
    };

    const primaryLink = (links) => links.demo || links.video || links.github || links.docs || null;

    const progressPercent = (start, end) => {
      if (!start || !end) return null;
      const now = Date.now();
      const startTime = new Date(start).getTime();
      const endTime = new Date(end).getTime();
      if (Number.isNaN(startTime) || Number.isNaN(endTime) || endTime <= startTime) return null;
      const pct = ((now - startTime) / (endTime - startTime)) * 100;
      return Math.max(0, Math.min(100, Math.round(pct)));
    };

    const copyToClipboard = async (value) => {
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(value);
      }
      const temp = document.createElement('textarea');
      temp.value = value;
      temp.style.position = 'fixed';
      temp.style.left = '-999px';
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      document.body.removeChild(temp);
    };

    const showToast = (message) => {
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] rounded-xl bg-black/90 text-white px-4 py-2 text-sm shadow-soft';
      toast.textContent = message;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 1800);
    };

    let currentUserId = null;
    const loadMe = async () => {
      if (!token) return null;
      try {
        const r = await fetch(`${API}/api/profile`, { headers: { Authorization: `Bearer ${token}` } });
        if (!r.ok) return null;
        const me = await r.json();
        currentUserId = me?.user_id || null;
        return me;
      } catch { return null; }
    };

    const applyToProject = async () => {
      if (!token) { window.location.href = '../login.html'; return; }
      const btn = document.getElementById('interestBtn');
      if (btn) { btn.disabled = true; btn.classList.add('opacity-60', 'cursor-not-allowed'); }
      try {
        const res = await fetch(`${API}/api/projects/${projectId}/apply`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ message: '' })
        });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(payload.detail || 'Request failed');
        if (btn) { btn.textContent = 'Request Sent'; btn.classList.add('bg-emerald-600', 'text-white'); }
        showToast('Request sent');
      } catch (e) {
        showToast(e.message || 'Could not send request');
        if (btn) { btn.disabled = false; btn.classList.remove('opacity-60', 'cursor-not-allowed'); }
      }
    };

    function launchConfetti() {
      // Enhanced confetti: more particles, longer duration, full-screen coverage
      const COUNT = 240; // particles
      const W = window.innerWidth || document.documentElement.clientWidth || 1024;
      const H = window.innerHeight || document.documentElement.clientHeight || 768;
      const colors = ['#16a34a', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7'];
      const particles = [];

      for (let i = 0; i < COUNT; i++) {
        const d = document.createElement('div');
        d.style.position = 'fixed';
        d.style.zIndex = '70';
        d.style.top = (-20 - Math.random() * 60) + 'px'; // start slightly above viewport
        d.style.left = Math.floor(Math.random() * W) + 'px';
        const w = 6 + Math.floor(Math.random() * 10);
        const h = 8 + Math.floor(Math.random() * 14);
        d.style.width = w + 'px';
        d.style.height = h + 'px';
        d.style.background = colors[i % colors.length];
        d.style.borderRadius = Math.random() < 0.35 ? '50%' : '2px'; // some circles
        d.style.opacity = '0.95';
        d.style.transform = `rotate(${Math.random() * 360}deg)`;
        document.body.appendChild(d);

        const start = performance.now() + Math.random() * 500; // stagger starts
        const drift = (Math.random() * 2 - 1) * 220; // sway left/right
        const fall = H + 220 + Math.random() * 180; // ensure it passes the viewport
        const spin = (Math.random() * 2 - 1) * 1080; // dramatic spin
        const duration = 3800 + Math.random() * 2200; // 3.8s – 6s

        const anim = (t) => {
          if (t < start) { requestAnimationFrame(anim); return; }
          const p = Math.min(1, (t - start) / duration);
          const ease = 1 - Math.pow(1 - p, 2); // ease-out
          d.style.transform = `translate(${drift * ease}px, ${fall * ease}px) rotate(${spin * ease}deg)`;
          d.style.opacity = String(1 - p);
          if (p < 1) requestAnimationFrame(anim); else d.remove();
        };
        requestAnimationFrame(anim);
        particles.push(d);
      }

      // Safety cleanup
      setTimeout(() => particles.forEach(p => p.remove()), 7000);
    }

    function showApplicantBanner(status) {
      const wrap = document.getElementById('appStatusBanner');
      if (!wrap) return;
      const s = String(status || '').toLowerCase();
      let html = '';
      if (s === 'accepted') {
        html = `<div class=\"container py-3\"><div class=\"rounded-2xl border border-emerald-500/40 bg-emerald-100/70 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-200 px-4 py-3 flex items-center justify-between gap-3\"><div class=\"text-sm font-medium\">Accepted — congratulations!</div><div class=\"text-xs opacity-80\">Welcome aboard 🎉</div></div></div>`;
        // Play confetti on every visit when accepted
        launchConfetti();
      } else if (s === 'rejected') {
        html = `<div class="container py-3"><div class="rounded-2xl border border-rose-500/40 bg-rose-100/70 dark:bg-rose-900/30 text-rose-900 dark:text-rose-200 px-4 py-3 text-sm">Thanks for applying. This request was not accepted.</div></div>`;
      } else if (s === 'pending') {
        html = `<div class="container py-3"><div class="rounded-2xl border border-amber-500/40 bg-amber-100/70 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200 px-4 py-3 text-sm">Your application is pending review.</div></div>`;
      }
      if (html) { wrap.innerHTML = html; wrap.classList.remove('hidden'); }
    }

    if (!projectId) {
      container.innerHTML = '<div class="rounded-2xl border border-amber-400/40 bg-amber-100/60 text-amber-900 px-4 py-3">Missing project id.</div>';
    } else {
      Promise.all([loadMe(), fetch(`${API}/api/projects/${projectId}`)])
        .then(async ([_, res]) => {
          if (!res.ok) throw new Error('Failed to load project');
          const p = await res.json();
          crumbTitle.textContent = (p.basics?.title) || 'Project';

          const domains = isNonEmptyArray(p.basics?.domains) ? p.basics.domains.map(d => pill(d, 'bg-brand-600 text:white text-xs px-3 py-1').replace('text:white', 'text-white')).join('') : '';
          const techs = isNonEmptyArray(p.basics?.tech_stack) ? p.basics.tech_stack.map(chip).join('') : '';
          const milestones = isNonEmptyArray(p.status?.milestones) ? p.status.milestones.map(m => `<li class="rounded-xl border border-black/10 dark:border-white/10 px-3 py-2 flex items-center gap-2 text-sm"><span class="icon text-base text-brand-600">flag</span><span>${esc(m)}</span></li>`).join('') : '';
          const gallery = isNonEmptyArray(p.gallery_urls) ? p.gallery_urls.map(url => `
            <figure class="relative overflow-hidden rounded-xl ring-1 ring-black/5 dark:ring-white/10">
              <img loading="lazy" src="${esc(url)}" alt="Gallery image" class="h-36 w-full object-cover md:h-40 lg:h-44" />
            </figure>
          `).join('') : '';

          const links = p.links || {};
          const primary = primaryLink(links);
          const primaryLabel = links.demo ? 'Open Demo' : links.video ? 'Watch Video' : links.github ? 'Open GitHub' : links.docs ? 'Open Docs' : 'Open Link';
          const primaryIcon = links.demo ? 'rocket_launch' : links.video ? 'smart_display' : links.github ? 'code' : links.docs ? 'description' : 'open_in_new';

          const statusBadge = p.status?.status ? pill(p.status.status, 'px-2 py-1 text-xs rounded-full bg-emerald-600 text-white shadow-soft') : '';
          const pct = progressPercent(p.status?.start_date, p.status?.end_date);

          const isOwner = currentUserId && p.user_id && currentUserId === p.user_id;
          const hasOpenRoles = isNonEmptyArray(p.team?.roles_hiring);
          const renderInterestBtn = !isOwner ? `<button id="interestBtn" class="mt-4 btn w-full justify-center bg-brand-600 text-white shadow-brand-lg hover:brightness-110">I'm Interested</button>` : '';

          const hero = `
            <section class=\"relative overflow-hidden rounded-3xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-black/40 backdrop-blur\">
              <div class=\"absolute inset-0 ${p.cover_url ? '' : 'hidden'}\">
                <img src=\"${esc(p.cover_url || '')}\" alt=\"Cover image\" class=\"h-full w-full object-cover\" />
                <div class=\"absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/0\"></div>
              </div>
              <div class=\"relative p-6 md:p-10\">
                <div class=\"flex flex-wrap items-center gap-2 mb-4\">${domains}${statusBadge ? `<span class=\\"ml-2\\">${statusBadge}</span>` : ''}</div>
                <h1 class=\"text-3xl md:text-4xl font-extrabold tracking-tight ${p.cover_url ? 'text-white drop-shadow-lg' : ''}\">${esc(p.basics?.title)}</h1>
                ${p.basics?.tagline ? `<p class=\\"mt-2 text-lg ${p.cover_url ? 'text-white/80' : 'text-neutral-600 dark:text-white/70'}\\">${esc(p.basics.tagline)}</p>` : ''}
                ${techs ? `<div class=\\"mt-5 flex flex-wrap gap-2\\">${techs}</div>` : ''}
                <div class=\"mt-6 flex flex-wrap gap-3\">
                  ${primary ? linkBtn(primaryLabel, primaryIcon, primary) : ''}
                  ${linkBtn('GitHub', 'code', links.github)}
                  ${linkBtn('Docs', 'description', links.docs)}
                  ${ghostBtn('Share', 'share', 'shareProject()')}
                </div>
              </div>
            </section>`;

          const descCard = `
            <section class=\"rounded-2xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur p-5 md:p-6 lift\">
              <h2 class=\"text-lg font-semibold mb-3 flex items-center gap-2\"><span class=\"material-symbols-rounded\">article</span> Overview</h2>
              <div class=\"prose dark:prose-invert max-w-none\">${p.basics?.description ? `<p>${esc(p.basics.description)}</p>` : '<p class=\\"text-neutral-600 dark:text-white/60\\">No description provided.</p>'}</div>
            </section>`;

          const statusCard = `
            <section class=\"rounded-2xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur p-5 md:p-6 lift\">
              <h2 class=\"text-lg font-semibold mb-4 flex items-center gap-2\"><span class=\"material-symbols-rounded\">timeline</span> Status & Timeline</h2>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div class="text-black/60 dark:text-white/60">Start</div>
                  <div class="font-medium">${esc(p.status?.start_date || '—')}</div>
                </div>
                <div>
                  <div class="text-black/60 dark:text-white/60">Target</div>
                  <div class="font-medium">${esc(p.status?.end_date || '—')}</div>
                </div>
              </div>
              ${pct !== null ? `
              <div class="mt-4">
                <div class="flex items-center justify-between text-xs mb-1"><span>Progress</span><span>${pct}%</span></div>
                <div class="h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                  <div class="h-full bg-brand-600" style="width:${pct}%"></div>
                </div>
              </div>` : ''}
              ${milestones ? `
                <div class="mt-4">
                  <div class="text-sm font-medium mb-2">Milestones</div>
                  <ul class="space-y-2">${milestones}</ul>
                </div>` : ''}
            </section>`;

          const teamCard = `
            <section class=\"rounded-2xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur p-5 md:p-6 lift\">
              <h2 class=\"text-lg font-semibold mb-4 flex items-center gap-2\"><span class=\"material-symbols-rounded\">group</span> Team & Roles</h2>
              <div class="space-y-3 text-sm">
                ${isNonEmptyArray(p.team?.members) ? `<div><div class="text-black/60 dark:text-white/60">Members</div><div class="font-medium">${p.team.members.map(esc).join(', ')}</div></div>` : ''}
                ${isNonEmptyArray(p.team?.roles_hiring) ? `<div><div class="text-black/60 dark:text-white/60">Open Roles</div><div class="flex flex-wrap gap-2 mt-1">${p.team.roles_hiring.map(chip).join('')}</div></div>` : ''}
                ${p.team?.compensation ? `<div><div class="text-black/60 dark:text-white/60">Compensation</div><div class="font-medium">${esc(p.team.compensation)}</div></div>` : ''}
                ${p.team?.hours ? `<div><div class="text-black/60 dark:text-white/60">Hours</div><div class="font-medium">${esc(p.team.hours)}</div></div>` : ''}
                ${p.team?.role_desc ? `<div><div class="text-black/60 dark:text-white/60">Role Description</div><div class="prose dark:prose-invert max-w-none"><p>${esc(p.team.role_desc)}</p></div></div>` : ''}
              </div>
            </section>`;

          const fundingCard = `
            <section class=\"rounded-2xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur p-5 md:p-6 lift\">
              <h2 class=\"text-lg font-semibold mb-4 flex items-center gap-2\"><span class=\"material-symbols-rounded\">savings</span> Funding</h2>
              <div class="grid grid-cols-2 gap-4 text-sm">
                ${p.funding?.stage ? `<div><div class="text-black/60 dark:text-white/60">Stage</div><div class="font-medium">${esc(p.funding.stage)}</div></div>` : ''}
                ${p.funding?.budget_inr ? `<div><div class="text-black/60 dark:text-white/60">Budget</div><div class="font-medium">${formatCurrencyINR(p.funding.budget_inr)}</div></div>` : ''}
              </div>
              ${p.funding?.use ? `<div class="mt-3 text-sm"><div class="text-black/60 dark:text-white/60">Use of Funds</div><div class="font-medium">${esc(p.funding.use)}</div></div>` : ''}
            </section>`;

          const linksCard = (links.github || links.demo || links.video || links.docs) ? `
            <section class=\"rounded-2xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur p-5 md:p-6 lift\">
              <h2 class=\"text-lg font-semibold mb-4 flex items-center gap-2\"><span class=\"material-symbols-rounded\">link</span> Links</h2>
              <div class="flex flex-wrap gap-3">
                ${linkBtn('GitHub', 'code', links.github)}
                ${linkBtn('Demo', 'rocket_launch', links.demo)}
                ${linkBtn('Video', 'smart_display', links.video)}
                ${linkBtn('Docs', 'description', links.docs)}
              </div>
            </section>` : '';

          const galleryCard = isNonEmptyArray(p.gallery_urls) ? `
            <section class=\"rounded-2xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur p-5 md:p-6 lift\">
              <h2 class=\"text-lg font-semibold mb-4 flex items-center gap-2\"><span class=\"material-symbols-rounded\">photo_library</span> Gallery</h2>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-3">${gallery}</div>
            </section>` : '';

          const sidebar = `
            <aside class=\"lg:col-span-4\">
              <div class=\"lg:sticky lg:top-28 space-y-6\">
                <section id=\"quickActions\" class=\"rounded-2xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur p-5 lift\">
                  <h3 class=\"font-semibold mb-3 flex items-center gap-2\"><span class=\"material-symbols-rounded\">bolt</span> Quick Actions</h3>
                  <div class="flex flex-wrap gap-3">
                    ${primary ? linkBtn(primaryLabel, primaryIcon, primary) : ''}
                    ${ghostBtn('Share', 'share', 'shareProject()')}
                  </div>
                  ${isOwner ? `<a href="project_applicants.html?id=${encodeURIComponent(projectId)}" class="mt-4 btn w-full justify-center border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10"><span class="icon">group</span> View Applicants</a>` : renderInterestBtn}
                </section>

                <section class=\"rounded-2xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur p-5 lift\">
                  <h3 class=\"font-semibold mb-3 flex items-center gap-2\"><span class=\"material-symbols-rounded\">info</span> Summary</h3>
                  <div class="space-y-2 text-sm">
                    ${p.status?.status ? `<div class="flex items-center justify-between"><span class="text-black/60 dark:text-white/60">Status</span><span class="font-medium">${esc(p.status.status)}</span></div>` : ''}
                    ${p.status?.start_date ? `<div class="flex items-center justify-between"><span class="text-black/60 dark:text-white/60">Start</span><span class="font-medium">${esc(p.status.start_date)}</span></div>` : ''}
                    ${p.status?.end_date ? `<div class="flex items-center justify-between"><span class="text-black/60 dark:text-white/60">Target</span><span class="font-medium">${esc(p.status.end_date)}</span></div>` : ''}
                    ${p.funding?.stage ? `<div class="flex items-center justify-between"><span class="text-black/60 dark:text-white/60">Funding</span><span class="font-medium">${esc(p.funding.stage)}</span></div>` : ''}
                    ${p.funding?.budget_inr ? `<div class="flex items-center justify-between"><span class="text-black/60 dark:text-white/60">Budget</span><span class="font-medium">${formatCurrencyINR(p.funding.budget_inr)}</span></div>` : ''}
                  </div>
                </section>
              </div>
            </aside>`;

          container.innerHTML = `
            ${hero}
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div class="lg:col-span-8 space-y-6">
                ${descCard}
                ${statusCard}
                ${teamCard}
                ${fundingCard}
                ${linksCard}
                ${galleryCard}
              </div>
              ${sidebar}
            </div>
            <section id=\"toolsLearningCard\" class=\"mt-6 rounded-2xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur p-5 md:p-6 lift\">
              <h2 class=\"text-lg font-semibold mb-4 flex items-center gap-2\"><span class=\"material-symbols-rounded\">handyman</span> Tools & Learning</h2>
              <p class=\"text-sm text-neutral-600 dark:text-white/60 mb-3\">Enter a title and description, then search for relevant tools (free plans, student offers) and curated learning picks.</p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <label class="text-xs block mb-1 opacity-70">Title</label>
                  <input id="tlTitle" class="w-full rounded-xl border border-black/10 dark:border-white/10 bg-white/90 dark:bg-black/40 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label class="text-xs block mb-1 opacity-70">Description</label>
                  <input id="tlDesc" class="w-full rounded-xl border border-black/10 dark:border-white/10 bg-white/90 dark:bg-black/40 px-3 py-2 text-sm" />
                </div>
              </div>
              <div class="flex flex-wrap items-center gap-3 mb-4">
                <button id=\"findToolsBtn\" class=\"btn bg-brand-500 text-white shadow-glow hover:shadow-[0_10px_32px_-8px_rgba(158,75,138,0.55)]\"><span class=\"material-symbols-rounded\">search</span> Find Tools & Learning</button>
                <div class="text-xs opacity-70">Skills used: <span id="tlSkills"></span></div>
              </div>
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <h3 class=\"font-medium mb-2 flex items-center gap-2\"><span class=\"material-symbols-rounded\">local_mall</span> Related Tools and Projects</h3>
                  <div id="toolOffersWrap" class="space-y-2"></div>
                </div>
                <div>
                  <h3 class=\"font-medium mb-2 flex items-center gap-2\"><span class=\"material-symbols-rounded\">school</span> Learning Picks</h3>
                  <div id="learningWrap" class="space-y-3"></div>
                </div>
              </div>
            </section>`;

          window.shareProject = () => {
            copyToClipboard(window.location.href)
              .then(() => showToast('Link copied to clipboard'))
              .catch(() => alert('Copy failed. Please copy the URL manually.'));
          };

          // Tools & Learning integration
          (function initToolsAndLearning() {
            const titleEl = document.getElementById('tlTitle');
            const descEl = document.getElementById('tlDesc');
            const skillsEl = document.getElementById('tlSkills');
            const btn = document.getElementById('findToolsBtn');
            const offersWrap = document.getElementById('toolOffersWrap');
            const learningWrap = document.getElementById('learningWrap');

            const skills = Array.isArray(p.basics?.tech_stack) ? p.basics.tech_stack.filter(Boolean) : [];
            if (skillsEl) skillsEl.innerHTML = skills.length ? skills.map(chip).join(' ') : '<span class="opacity-60">none</span>';
            if (titleEl) titleEl.value = p.basics?.title || '';
            if (descEl) descEl.value = p.basics?.description || '';

            const getDomain = (u) => {
              try { const d = new URL(u); return d.hostname.replace(/^www\./, ''); } catch { return ''; }
            };

            const renderOffers = (items) => {
              if (!offersWrap) return;
              if (!Array.isArray(items) || !items.length) {
                offersWrap.innerHTML = '<div class="text-sm opacity-60">No results yet.</div>';
                return;
              }
              offersWrap.innerHTML = items.map(it => {
                const domain = getDomain(it.link);
                return `<a class="block rounded-xl border border-black/10 dark:border-white/10 bg-white/90 dark:bg-black/40 p-3 lift hover:bg-white" href="${esc(it.link)}" target="_blank" rel="noopener">
                  <div class="text-sm font-semibold line-clamp-2">${esc(it.title)}</div>
                  ${it.snippet ? `<div class="text-xs opacity-70 mt-1 line-clamp-2">${esc(it.snippet)}</div>` : ''}
                  <div class="text-[11px] opacity-60 mt-1 flex items-center gap-1"><span class="icon text-[14px]">public</span>${esc(domain)}</div>
                </a>`;
              }).join('');
            };

            const renderLearning = (payload) => {
              if (!learningWrap) return;
              const sect = (name, list, isYoutube = false) => {
                if (!Array.isArray(list) || !list.length) return '';
                return `<div class="rounded-xl border border-black/10 dark:border-white/10 p-3 bg-white/80 dark:bg-black/40">
                  <div class="text-sm font-semibold mb-2">${name}</div>
                  <div class="space-y-2">${list.map(sel => {
                  const item = sel.item || sel.video || {};
                  const url = item.url || '#';
                  const title = item.title || '';
                  const channel = item.channel_title || '';
                  const thumb = item.thumbnail || '';
                  const gs = Array.isArray(sel.group_skills) ? sel.group_skills.map(chip).join(' ') : '';
                  return `<div class="flex gap-3 items-start">
                      ${thumb ? `<img src="${esc(thumb)}" alt="thumb" class="w-20 h-14 object-cover rounded-lg ring-1 ring-black/5 dark:ring-white/10">` : ''}
                      <div class="min-w-0">
                        <a href="${esc(url)}" target="_blank" rel="noopener" class="text-sm font-medium hover:underline line-clamp-2">${esc(title)}</a>
                        <div class="text-[11px] opacity-60 mt-0.5">${esc(channel)}</div>
                        ${gs ? `<div class="mt-1 flex flex-wrap gap-1">${gs}</div>` : ''}
                      </div>
                    </div>`;
                }).join('')}</div>
                </div>`;
              };
              const parts = [
                sect('Blogs', payload?.blogs || []),
                sect('News', payload?.news || []),
                sect('YouTube', payload?.youtube || [], true),
              ].filter(Boolean).join('');
              learningWrap.innerHTML = parts || '<div class="text-sm opacity-60">No picks yet.</div>';
            };

            const runQuery = async () => {
              const title = titleEl?.value?.trim() || '';
              const desc = descEl?.value?.trim() || '';
              if (!title && !desc) { showToast('Enter a title or description'); return; }
              if (btn) { btn.disabled = true; btn.classList.add('opacity-60', 'cursor-not-allowed'); btn.innerHTML = '<span class="icon">hourglass_top</span> Searching…'; }
              try {
                const [oRes, lRes] = await Promise.all([
                  fetch(`${API}/api/tools/search`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, description: desc, n: 5 }) }),
                  fetch(`${API}/api/tools/cover/all`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ skills }) }),
                ]);
                const offers = oRes.ok ? await oRes.json().catch(() => ({ results: [] })) : { results: [] };
                const learning = lRes.ok ? await lRes.json().catch(() => ({ blogs: [], news: [], youtube: [] })) : { blogs: [], news: [], youtube: [] };
                renderOffers(offers?.results || []);
                renderLearning(learning);
              } catch (e) {
                renderOffers([]); renderLearning({});
              } finally {
                if (btn) { btn.disabled = false; btn.classList.remove('opacity-60', 'cursor-not-allowed'); btn.innerHTML = '<span class="icon">search</span> Find Tools & Learning'; }
              }
            };

            if (btn) btn.addEventListener('click', runQuery);
            // Auto-run once with prefilled values
            runQuery();
          })();

          // Hook interest button
          const btn = document.getElementById('interestBtn');

          async function hydrateApplyButton() {
            if (!btn) return;
            if (!token) { btn.onclick = () => { window.location.href = '../login.html'; }; return; }
            try {
              const r = await fetch(`${API}/api/projects/${projectId}/applications/me`, { headers: { Authorization: `Bearer ${token}` } });
              if (r.ok) {
                const data = await r.json().catch(() => ({}));
                if (data && data.applied) {
                  const st = String(data.application?.status || '').toLowerCase();
                  if (st === 'accepted') {
                    btn.textContent = 'Accepted';
                    btn.classList.remove('bg-brand-600');
                    btn.classList.add('bg-emerald-600', 'text-white');
                    btn.disabled = true;
                  } else {
                    btn.textContent = 'Request Sent';
                    btn.classList.add('bg-emerald-600', 'text-white');
                    btn.disabled = true;
                  }
                  showApplicantBanner(st);
                  if (st === 'accepted') {
                    const qa = document.getElementById('quickActions');
                    if (qa && !document.getElementById('collabBtn')) {
                      const collabId = data?.application?.id;
                      if (collabId) {
                        const a = document.createElement('a');
                        a.id = 'collabBtn';
                        a.href = `collab.html?application_id=${encodeURIComponent(collabId)}`;
                        a.className = 'mt-3 btn w-full justify-center bg-brand-600 text-white shadow-brand-lg hover:brightness-110';
                        a.innerHTML = '<span class="icon">forum</span> Open Collaboration';
                        qa.appendChild(a);
                      }
                    }
                  }
                  return;
                }
              }
            } catch { }
            btn.addEventListener('click', applyToProject);
          }

          if (btn) hydrateApplyButton();
        })
        .catch(() => {
          container.innerHTML = '<div class="rounded-2xl border border-red-500/30 bg-red-100/70 text-red-700 px-4 py-3">Failed to load project details.</div>';
        });
    }
