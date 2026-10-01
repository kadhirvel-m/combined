// Extracted from ui/print/shop/jobs.html (inline <script> #2).
    function $(s) { return document.querySelector(s) }
    function deriveInitials(name) {
      if (!name) return 'SH';
      return name.split(/\s+/).filter(Boolean).map(p => p[0]?.toUpperCase()).slice(0, 2).join('') || 'SH';
    }
    // Theme toggle hookup (persists px_theme and updates all toggles)
    (function () {
      const root = document.documentElement;
      const themeToggles = () => Array.from(document.querySelectorAll('[data-theme-toggle]'));
      const updateToggleIcons = () => themeToggles().forEach(btn => {
        const icon = btn.querySelector('.material-symbols-rounded');
        if (icon) icon.textContent = root.classList.contains('dark') ? 'light_mode' : 'dark_mode';
      });
      const setTheme = (mode) => {
        if (mode === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
        try { localStorage.setItem('px_theme', mode); } catch (e) { }
        updateToggleIcons();
      };
      // Initialize
      const stored = localStorage.getItem('px_theme');
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = stored ? stored === 'dark' : prefersDark;
      setTheme(isDark ? 'dark' : 'light');
      document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-theme-toggle]');
        if (!trigger) return;
        setTheme(root.classList.contains('dark') ? 'light' : 'dark');
      });
    })();
    function getToken() { try { return localStorage.getItem('px_token'); } catch { return null; } }
    function btn(label, handler, variant) { const b = document.createElement('button'); b.textContent = label; b.className = 'px-2 py-1 rounded-md text-[12px] ' + (variant || 'ring-1 ring-black/10 dark:ring-white/15'); b.addEventListener('click', handler); return b; }
    function pill(label, active, onclick) {
      const a = document.createElement('button');
      a.textContent = label;
      a.className = 'px-3 py-1.5 rounded-full ' + (active ? 'bg-brand-500 text-white' : 'ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/10');
      a.addEventListener('click', onclick);
      return a;
    }

    // ---- UI helpers for rich cards ----
    function fmtTime(s) { if (!s) return ''; return (s.replace('T', ' ').slice(0, 16)); }
    function statusTone(st) {
      const k = String(st || '').trim().toLowerCase();
      if (k === 'submitted') return { bg: 'bg-blue-50 dark:bg-blue-500/10', fg: 'text-blue-700 dark:text-blue-300', ring: 'ring-1 ring-blue-200/60 dark:ring-blue-400/30', icon: 'move_to_inbox' };
      if (k === 'accepted') return { bg: 'bg-amber-50 dark:bg-amber-500/10', fg: 'text-amber-800 dark:text-amber-300', ring: 'ring-1 ring-amber-200/60 dark:ring-amber-400/30', icon: 'task_alt' };
      if (k === 'printing') return { bg: 'bg-indigo-50 dark:bg-indigo-500/10', fg: 'text-indigo-800 dark:text-indigo-300', ring: 'ring-1 ring-indigo-200/60 dark:ring-indigo-400/30', icon: 'print' };
      if (k === 'ready') return { bg: 'bg-emerald-50 dark:bg-emerald-500/10', fg: 'text-emerald-800 dark:text-emerald-300', ring: 'ring-1 ring-emerald-200/60 dark:ring-emerald-400/30', icon: 'done_all' };
      // Badge colors per request: Completed = green, Cancelled = red
      if (k === 'completed') return { bg: 'bg-emerald-600', fg: 'text-white', ring: 'ring-0', icon: 'verified' };
      if (k === 'cancelled' || k === 'canceled') return { bg: '', fg: 'text-white', ring: 'ring-0', icon: 'cancel', style: 'background-color:#dc2626;color:#fff' }; // Tailwind red-600 inline fallback
      return { bg: 'bg-neutral-50 dark:bg-white/5', fg: 'text-neutral-700 dark:text-white/70', ring: 'ring-1 ring-black/10 dark:ring-white/15', icon: 'info' };
    }
    function chipHTML(icon, text, cls, style) {
      const styleAttr = style ? ` style=\"${style}\"` : '';
      return `<span class=\"inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] ${cls}\"${styleAttr}><span class=\"material-symbols-rounded text-[14px]\">${icon}</span><span>${text}</span></span>`;
    }

    function cardRich(j) {
      const tone = statusTone(j.status);
      const wrap = document.createElement('div');
      wrap.className = 'relative overflow-hidden rounded-2xl p-0.5 cursor-pointer transition hover:shadow-elev-2';
      wrap.style.background = 'linear-gradient(135deg, rgba(158,75,138,.45), rgba(76,42,89,.25))';
      const inner = document.createElement('div');
      // if completed/closed/settled/info or explicitly verified, give a slightly darker background for emphasis
      const isDarkCard = (function (job) {
        try {
          const s = String((job && job.status) || '').toLowerCase();
          return !!job.verified || s === 'completed' || s === 'closed' || s === 'settled' || s === 'info';
        } catch (e) { return !!(job && job.verified); }
      })(j);
      inner.className = 'rounded-2xl ring-soft p-4 backdrop-blur shadow-neon ' + (isDarkCard ? 'card-dark' : 'bg-white/95 dark:bg-brand-900/75');
      inner.innerHTML = `
        <div class='flex items-start justify-between'>
          <div class='space-y-1'>
            <div class='text-[12px]'>Order <b>#${(j.id || '').slice(0, 8)}</b></div>
            <div class='flex flex-wrap items-center gap-1.5'>
              ${chipHTML(tone.icon, (j.status || '').toString().replace(/^./, c => c.toUpperCase()), `${tone.bg} ${tone.fg} ${tone.ring}`, tone.style)}
              ${chipHTML('calendar_month', fmtTime(j.created_at || ''), 'ring-1 ring-black/10 dark:ring-white/15')}
            </div>
          </div>
          <div class='text-right'>
            <div class='text-[12px] opacity-70'>${j.pickup_window ? 'Pickup' : '&nbsp;'}</div>
            <div class='text-sm font-medium'>${j.pickup_window || ''}</div>
          </div>
        </div>
        <div class='mt-3 grid grid-cols-2 gap-2 text-[12px]'>
          <div class='space-y-1'>
            <div class='opacity-70'>Pages × Copies</div>
            <div class='font-semibold'>${j.estimated_pages || '?'} × ${(j.settings && j.settings.copies) || 1}</div>
          </div>
          <div class='space-y-1'>
            <div class='opacity-70'>Paper • Color</div>
            <div class='font-semibold'>${j.settings?.paper_size || 'A4'} • ${(j.settings?.color_mode || 'auto')}</div>
          </div>
          <div class='space-y-1'>
            <div class='opacity-70'>Duplex • N-up</div>
            <div class='font-semibold'>${j.settings?.duplex || 'off'} • ${j.settings?.n_up || 1}</div>
          </div>
          <div class='space-y-1'>
            <div class='opacity-70'>Contact</div>
            <div class='font-semibold truncate'>${(j.contact_name || '-')}${j.contact_phone ? (' • ' + j.contact_phone) : ''}</div>
          </div>
        </div>`;
      const footer = document.createElement('div');
      footer.className = 'mt-3 flex items-center justify-between';
      const est = document.createElement('div');
      const hasPrice = (j.estimated_price != null);
      est.className = hasPrice
        ? 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] bg-brand-500 text-white shadow'
        : 'text-[12px] opacity-70';
      est.textContent = hasPrice ? (`₹${Number(j.estimated_price).toFixed(2)}`) : '';
      const actions = document.createElement('div'); actions.className = 'flex items-center gap-2';
      const API = (window.API_BASE || '');
      if (j.status === 'submitted') actions.appendChild(btn('Accept', (e) => { e.stopPropagation(); act('accept'); })), actions.appendChild(btn('Reject', (e) => { e.stopPropagation(); act('reject'); }, 'text-red-600 ring-1 ring-red-600/40'));
      if (j.status === 'accepted') actions.appendChild(btn('Mark Printing', (e) => { e.stopPropagation(); act('printing'); }));
      if (j.status === 'printing') actions.appendChild(btn('Mark Ready', (e) => { e.stopPropagation(); act('ready'); }));
      if (j.status === 'ready') {
        const i = document.createElement('input');
        i.placeholder = 'OTP';
        i.className = 'px-2 py-1 text-[12px] rounded-md ring-1 ring-black/10 dark:ring-white/15';
        i.setAttribute('data-stop', '');
        i.addEventListener('click', (e) => e.stopPropagation());
        i.addEventListener('focus', (e) => e.stopPropagation());
        i.addEventListener('keydown', (e) => e.stopPropagation());
        actions.appendChild(i);
        actions.appendChild(btn('Release', (e) => { e.stopPropagation(); act('release', i.value); }, 'bg-brand-500/90 text-white'));
      }
      footer.appendChild(est);
      footer.appendChild(actions);
      inner.appendChild(footer);
      wrap.appendChild(inner);

      // Open modal only when clicking on non-interactive areas
      wrap.addEventListener('click', (e) => {
        const t = e.target;
        if (t && t.closest && t.closest('button,a,input,select,textarea,[data-close-modal],[data-stop]')) return;
        openModal(j);
      });

      async function act(kind, otp) {
        const token = (window.getToken && window.getToken()); const hdr = token ? { Authorization: 'Bearer ' + token } : {};
        let ep = kind; if (kind === 'release') ep = 'release';
        const body = kind === 'release' ? JSON.stringify({ otp: String(otp || '') }) : undefined;
        const r = await fetch(`${API}/api/shop/jobs/${encodeURIComponent(j.id)}/${ep}`, { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, hdr), body });
        if (r.ok) load(); else alert('Action failed');
      }
      return wrap;
    }

    function card(j) {
      const wrap = document.createElement('div'); wrap.className = 'rounded-2xl glass ring-soft dark:ring-white/10 p-4 space-y-2 cursor-pointer transition hover:shadow-neon';
      // darken simple card background for completed/verified/closed/settled/info orders
      try {
        const s = String((j.status || '')).toLowerCase();
        if (s === 'completed' || s === 'closed' || s === 'settled' || s === 'info' || !!j.verified) { wrap.classList.add('card-dark'); }
      } catch (e) { }
      wrap.innerHTML = `
        <div class='flex items-start justify-between'>
          <div>
            <div class='font-semibold'>#${(j.id || '').slice(0, 8)} <span class="text-[11px] opacity-60 align-middle">${j.status || ''}</span></div>
            <div class='text-[12px] opacity-70'>${j.estimated_pages || '?'} pages × ${(j.settings && j.settings.copies) || 1} • ${j.settings?.paper_size || 'A4'} • ${(j.settings?.color_mode || 'auto')}</div>
          </div>
          <div class='text-[11px] opacity-70 text-right'>${(j.created_at || '').replace('T', ' ').slice(0, 16)}</div>
        </div>`;
      const actions = document.createElement('div'); actions.className = 'flex items-center gap-2';
      const API = (window.API_BASE || '');
      // Preview/Download removed from normal view per request
      if (j.status === 'submitted') actions.appendChild(btn('Accept', (e) => { e.stopPropagation(); act('accept'); })), actions.appendChild(btn('Reject', (e) => { e.stopPropagation(); act('reject'); }, 'text-red-600 ring-1 ring-red-600/40'));
      if (j.status === 'accepted') actions.appendChild(btn('Mark Printing', (e) => { e.stopPropagation(); act('printing'); }));
      if (j.status === 'printing') actions.appendChild(btn('Mark Ready', (e) => { e.stopPropagation(); act('ready'); }));
      if (j.status === 'ready') {
        const i = document.createElement('input');
        i.placeholder = 'OTP';
        i.className = 'px-2 py-1 text-[12px] rounded-md ring-1 ring-black/10 dark:ring-white/15';
        i.setAttribute('data-stop', '');
        i.addEventListener('click', (e) => e.stopPropagation());
        i.addEventListener('focus', (e) => e.stopPropagation());
        i.addEventListener('keydown', (e) => e.stopPropagation());
        actions.appendChild(i);
        actions.appendChild(btn('Release', (e) => { e.stopPropagation(); act('release', i.value); }, 'bg-brand-500/90 text-white'));
      }
      wrap.appendChild(actions);

      // Open modal only when clicking on non-interactive areas
      wrap.addEventListener('click', (e) => {
        const t = e.target;
        if (t && t.closest && t.closest('button,a,input,select,textarea,[data-close-modal],[data-stop]')) return;
        openModal(j);
      });

      async function act(kind, otp) {
        const token = (window.getToken && window.getToken()); const hdr = token ? { Authorization: 'Bearer ' + token } : {};
        let ep = kind; if (kind === 'release') ep = 'release';
        const body = kind === 'release' ? JSON.stringify({ otp: String(otp || '') }) : undefined;
        const r = await fetch(`${API}/api/shop/jobs/${encodeURIComponent(j.id)}/${ep}`, { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, hdr), body });
        if (r.ok) load(); else alert('Action failed');
      }
      return wrap;
    }

    function renderSettings(s) {
      if (!s) return '<div class="text-[12px] opacity-70">No settings</div>';
      const safe = (v) => (v == null ? '' : String(v));
      return `
        <div class="grid grid-cols-2 gap-x-4 gap-y-2">
          <div>Copies: <b>${safe(s.copies || 1)}</b></div>
          <div>Color: <b>${safe(s.color_mode || 'auto')}</b></div>
          <div>Duplex: <b>${safe(s.duplex || 'off')}</b></div>
          <div>N-up: <b>${safe(s.n_up || 1)}</b></div>
          <div>Paper: <b>${safe(s.paper_size || 'A4')}</b>${s.paper_gsm ? (' • ' + safe(s.paper_gsm) + ' GSM') : ''}</div>
          <div>Finish: <b>${safe(s.finishing || 'none')}</b></div>
          <div>Orientation: <b>${safe(s.orientation || 'vertical')}</b></div>
          <div>Pages: <b>${safe(s.page_range || 'all')}</b></div>
          ${s.notes_to_shop ? ('<div class="col-span-2">Notes: <b>' + safe(s.notes_to_shop) + '</b></div>') : ''}
        </div>`;
    }

    function openModal(j) {
      const m = $('#jobModal');
      const d = $('#jobDetail');
      const meta = $('#jobMeta');
      const actWrap = $('#jobActions');
      const API = (window.API_BASE || '');
      d.innerHTML = `
        <div class="text-sm">
          <div class="font-semibold mb-1">Order #${(j.id || '').slice(0, 8)}</div>
          <div class="text-[12px] opacity-70">Status: ${j.status || ''} • ${((j.created_at || '').replace('T', ' ').slice(0, 16))}</div>
        </div>
        <hr class="my-2 border-black/10 dark:border-white/10">
        <div class="space-y-2">
          <div><span class="text-xs opacity-70">Pickup</span><div class="text-sm font-medium">${j.pickup_window || '-'}</div></div>
          <div><span class="text-xs opacity-70">Contact</span><div class="text-sm font-medium">${(j.contact_name || '-') + (j.contact_phone ? (' • ' + j.contact_phone) : '')}</div></div>
          <div><span class="text-xs opacity-70">Estimated</span><div class="text-sm font-medium">${j.estimated_pages || '?'} pages${j.estimated_price ? (' • ₹' + Number(j.estimated_price).toFixed(2)) : ''}</div></div>
        </div>
        <hr class="my-2 border-black/10 dark:border-white/10">
        <div>
          <div class="text-xs opacity-70 mb-1">Settings</div>
          ${renderSettings(j.settings)}
        </div>`;
      meta.textContent = j.marketplace_note_id ? 'This order has an attached file' : '';
      actWrap.innerHTML = '';
      if (j.marketplace_note_id) {
        const pv = document.createElement('a'); pv.textContent = 'Open Preview'; pv.href = `${API}/api/marketplace/notes/${encodeURIComponent(j.marketplace_note_id)}/preview`; pv.target = '_blank'; pv.className = 'px-3 py-1.5 rounded-md text-[12px] ring-1 ring-black/10 dark:ring-white/15'; actWrap.appendChild(pv);
        const pr = document.createElement('a'); pr.textContent = 'Print'; pr.href = `${API}/api/marketplace/notes/${encodeURIComponent(j.marketplace_note_id)}/preview`; pr.target = '_blank'; pr.className = 'px-3 py-1.5 rounded-md bg-brand-500 text-white'; actWrap.appendChild(pr);
      }
      m.classList.remove('hidden');
    }

    function closeModal() { $('#jobModal').classList.add('hidden'); }

    function toStartOfDay(d) { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); return x; }
    function toEndOfDay(d) { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999); return x; }
    function inRange(iso, range) {
      if (!iso) return false;
      const t = new Date(iso);
      if (range === 'all') return true;
      const now = new Date();
      if (range === 'today') {
        return t >= toStartOfDay(now) && t <= toEndOfDay(now);
      }
      if (range === '7d') {
        const from = new Date(now); from.setDate(from.getDate() - 6); // include today
        return t >= toStartOfDay(from) && t <= toEndOfDay(now);
      }
      if (range === '30d') {
        const from = new Date(now); from.setDate(from.getDate() - 29);
        return t >= toStartOfDay(from) && t <= toEndOfDay(now);
      }
      return true;
    }

    async function load() {
      const token = (window.getToken && window.getToken()) || getToken(); const hdr = token ? { Authorization: 'Bearer ' + token } : {};
      const status = (window.__FILTER || '');
      const url = (window.API_BASE || '') + '/api/shop/jobs' + (status && status !== 'all' ? ('?status=' + encodeURIComponent(status)) : '');
      const r = await fetch(url, { headers: hdr }).catch(() => null);
      let allJobs = r && r.ok ? ((await r.json()).jobs || []) : [];
      // Client-side filters
      const dateRange = (window.__DATE_RANGE || 'today');
      const priceOnly = !!window.__PRICE_ONLY;
      // compute counts from allJobs (unfiltered) for status chips
      const counts = (allJobs || []).reduce((acc, j) => { const k = (j.status || 'unknown'); acc[k] = (acc[k] || 0) + 1; return acc; }, {});
      counts['all'] = (allJobs || []).length;
      updateStatusCounts(counts);
      // Populate hero KPI chips (reflect global totals)
      try {
        const ks = { submitted: counts['submitted'] || 0, printing: counts['printing'] || 0, ready: counts['ready'] || 0 };
        const elSub = document.getElementById('k_submitted'); if (elSub) elSub.textContent = String(ks.submitted);
        const elPrint = document.getElementById('k_printing'); if (elPrint) elPrint.textContent = String(ks.printing);
        const elReady = document.getElementById('k_ready'); if (elReady) elReady.textContent = String(ks.ready);
      } catch (e) { }
      let jobs = allJobs.filter(j => inRange(j.created_at, dateRange) && (!priceOnly || (j.estimated_price != null)));
      // Render
      const wrap = $('#list'); wrap.innerHTML = '';
      jobs.forEach(j => wrap.appendChild(cardRich(j)));
      $('#empty').classList.toggle('hidden', jobs.length > 0);
      const labeled = { today: 'Today', '7d': 'Last 7 days', '30d': 'Last 30 days', all: 'All time' };
      const dateLabel = labeled[dateRange] || 'All time';
      const extra = priceOnly ? ' • With price' : '';
      const summaryText = jobs.length ? `${jobs.length} job${jobs.length > 1 ? 's' : ''} • ${dateLabel}${extra}` : `No jobs • ${dateLabel}${extra}`;
      $('#summary').textContent = summaryText;
      const top = document.getElementById('summaryTop'); if (top) top.textContent = summaryText;
    }

    function setupFilters() {
      // Top status filters — render as pill group with count badges
      const c = $('#filters'); if (c) { c.innerHTML = ''; }
      const statuses = ['all', 'submitted', 'accepted', 'printing', 'ready', 'completed', 'cancelled'];
      const row1 = document.createElement('div'); row1.className = 'flex flex-wrap items-center gap-3';
      const label = document.createElement('div'); label.textContent = 'Status:'; label.className = 'text-[12px] opacity-80'; row1.appendChild(label);
      const statusContainer = document.createElement('div'); statusContainer.className = 'flex flex-wrap items-center gap-2';
      statuses.forEach(s => {
        const b = document.createElement('button');
        b.setAttribute('data-status', s);
        b.setAttribute('type', 'button');
        b.setAttribute('role', 'button');
        b.tabIndex = 0;
        b.disabled = false;
        const active = (window.__FILTER || 'all') === s;
        // base pill classes
        let base = 'status-pill px-3 py-1.5 rounded-full flex items-center gap-2 text-[13px]';
        // apply per-status classes for visual uniqueness
        const cls = 'pill-' + s;
        if (s === 'all') {
          // 'All' uses gradient when active, subtle when inactive
          if (active) base += ' ' + cls + ''; else base += ' ring-1 ring-black/10 dark:ring-white/15 ' + cls;
        } else if (s === 'cancelled') {
          // cancelled should feel urgent (red)
          if (active) base += ' pill-cancelled'; else base += ' ring-1 ring-red-300 text-red-600 dark:text-red-200';
        } else if (s === 'completed') {
          if (active) base += ' pill-completed'; else base += ' ring-1 ring-black/10 dark:ring-white/15 text-emerald-700 dark:text-emerald-300';
        } else {
          // use soft tokens for other statuses
          base += ' ring-1 ring-black/10 dark:ring-white/15 ' + cls;
        }
        b.className = base;
        b.style.pointerEvents = 'auto';
        // include an icon for clarity
        const tone = (typeof statusTone === 'function') ? statusTone(s) : null;
        const icon = tone && tone.icon ? tone.icon : 'info';
        b.innerHTML = `<span class="material-symbols-rounded text-[16px]">${icon}</span><span class="capitalize">${s}</span><span class="count-badge" aria-hidden="true"></span>`;
        b.addEventListener('click', () => { window.__FILTER = s; setupFilters(); load(); });
        b.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); b.click(); } });
        statusContainer.appendChild(b);
      });
      row1.appendChild(statusContainer);
      if (c) c.appendChild(row1);

      // Date filters moved below Jobs Board section
      const d = $('#dateFilters'); if (d) { d.innerHTML = ''; }
      const row2 = document.createElement('div'); row2.className = 'flex flex-wrap items-center gap-2';
      const lbl = document.createElement('div'); lbl.textContent = 'Date:'; lbl.className = 'text-[12px] opacity-80'; row2.appendChild(lbl);
      const ranges = [['today', 'Today'], ['7d', '7 days'], ['30d', '30 days'], ['all', 'All']];
      const current = (window.__DATE_RANGE || 'today');
      ranges.forEach(([k, label]) => {
        const btn = document.createElement('button');
        btn.setAttribute('data-range', k);
        const active = current === k;
        btn.className = 'px-3 py-1.5 rounded-full ' + (active ? 'bg-brand-500 text-white' : 'ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/10');
        // add subtle darker tone for 7d and all when active
        if (k === '7d' && active) btn.classList.add('dark:bg-neutral-700');
        if (k === 'all' && active) btn.classList.add('dark:bg-neutral-800');
        btn.textContent = label;
        btn.addEventListener('click', () => { window.__DATE_RANGE = k; setupFilters(); load(); });
        row2.appendChild(btn);
      });

      // Price-only toggle stays alongside date controls
      const priceBtn = document.createElement('button');
      priceBtn.className = 'px-3 py-1.5 rounded-full ' + (window.__PRICE_ONLY ? 'bg-emerald-600 text-white' : 'ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/10');
      priceBtn.textContent = 'With price';
      priceBtn.addEventListener('click', () => { window.__PRICE_ONLY = !window.__PRICE_ONLY; setupFilters(); load(); });
      row2.appendChild(priceBtn);
      if (d) d.appendChild(row2);
    }

    function updateStatusCounts(counts) {
      try {
        Array.from(document.querySelectorAll('[data-status]')).forEach(btn => {
          const s = btn.getAttribute('data-status');
          const cb = btn.querySelector('.count-badge');
          const n = counts[s] || 0;
          if (cb) {
            // always show counts (even zero) for clarity
            cb.textContent = String(n || 0);
            // color/contrast adjustments depending on theme
            const isDark = document.documentElement.classList.contains('dark');
            if (isDark) {
              cb.style.background = 'rgba(255,255,255,0.06)'; cb.style.color = '#e6eef8';
            } else {
              cb.style.background = 'rgba(0,0,0,0.06)'; cb.style.color = '#111827';
            }
            // subtle emphasis when non-zero
            if (n) cb.style.fontWeight = '700'; else cb.style.fontWeight = '500';
          }
          // add small emphasis for cancelled when present
          if (s === 'cancelled') {
            if ((counts['cancelled'] || 0) > 0) btn.classList.add('pill-cancelled'); else btn.classList.remove('pill-cancelled');
          }
        });
      } catch (e) { }
    }

    document.addEventListener('DOMContentLoaded', () => {
      // Default to today's orders
      window.__DATE_RANGE = 'today';
      setupFilters();
      load();
      // Load and bind shop avatar
      (async () => {
        try {
          const tk = getToken();
          const hdr = tk ? { Authorization: 'Bearer ' + tk } : {};
          const r = await fetch((window.API_BASE || '') + '/api/shop/me', { headers: hdr });
          if (!r.ok) throw new Error('no-shop');
          const shop = await r.json();
          const a = document.getElementById('shopProfile');
          const img = document.getElementById('shopProfileImg');
          const init = document.getElementById('shopProfileInitial');
          if (shop && (shop.logo_url || shop.name)) {
            if (shop.logo_url) { img.src = shop.logo_url; img.classList.remove('hidden'); if (init) init.classList.add('hidden'); }
            if (!shop.logo_url && init) { init.textContent = deriveInitials(shop.name || ''); init.classList.remove('hidden'); }
            a && a.classList.remove('hidden');
          }
        } catch (_) { /* ignore */ }
      })();
      document.addEventListener('click', (e) => { if (e.target && e.target.hasAttribute('data-close-modal')) closeModal(); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
    });
