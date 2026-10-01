// Extracted from ui/print/printers/review.html (inline <script> #2).
    // ------ Theme toggle ------
    const themeBtn = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const saved = localStorage.getItem('px_theme');
    if ((saved === 'dark') || (!saved && prefersDark)) document.documentElement.classList.add('dark');
    const syncIcon = () => themeIcon.textContent = document.documentElement.classList.contains('dark') ? 'light_mode' : 'dark_mode';
    syncIcon();
    themeBtn?.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
      localStorage.setItem('px_theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
      syncIcon();
    });

    // ------ Helpers ------
    function $(s) { return document.querySelector(s) }
    function escapeHtml(s) { return (s || '').toString().replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c])) }
    function toast(msg, ms = 1800) {
      const t = $('#toast'), m = $('#toastMsg');
      m.textContent = msg; t.classList.remove('hidden', 'opacity-0');
      t.classList.add('transition', 'duration-200');
      setTimeout(() => { t.classList.add('opacity-0'); setTimeout(() => t.classList.add('hidden'), 200); }, ms);
    }
    // Token + storage helpers (fallback if not provided globally)
    if (!window.getToken) {
      window.getToken = function () {
        const keys = ['px_token', 'teacherToken', 'userToken', 'sb-access-token', 'supabase.auth.token'];
        for (const k of keys) { try { const v = localStorage.getItem(k); if (v) return v; } catch { } }
        return '';
      };
    }
    function safeGet(k) { try { return localStorage.getItem(k); } catch { return null; } }
    function safeSet(k, v) { try { localStorage.setItem(k, v); } catch { } }
    const PX_PROFILE_LS_KEY = 'px_profile_cache';
    let __PROFILE_CACHE = null;
    let __PROFILE_PROMISE = null;
    function readCachedProfile() {
      try {
        const raw = safeGet(PX_PROFILE_LS_KEY);
        if (!raw) return null;
        const obj = JSON.parse(raw);
        if (!obj || !obj.ts) return null;
        // 5 minutes TTL
        if (Date.now() - obj.ts > 5 * 60 * 1000) return null;
        return obj.profile || null;
      } catch { return null; }
    }
    function writeCachedProfile(p) {
      try { safeSet(PX_PROFILE_LS_KEY, JSON.stringify({ ts: Date.now(), profile: p || null })); } catch { }
    }
    async function loadProfileMe() {
      if (__PROFILE_CACHE) return __PROFILE_CACHE;
      if (__PROFILE_PROMISE) return __PROFILE_PROMISE;
      const tk = (window.getToken && window.getToken()) || '';
      if (!tk) return null;
      // Try local cache first for instant fill
      const cached = readCachedProfile();
      if (cached) { __PROFILE_CACHE = cached; return __PROFILE_CACHE; }
      // Network fetch with timeout and de-dupe
      __PROFILE_PROMISE = (async () => {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 3500);
        try {
          const r = await fetch((window.API_BASE || '') + '/api/me', { headers: { Authorization: 'Bearer ' + tk }, signal: ctrl.signal });
          if (!r.ok) return null;
          const j = await r.json().catch(() => ({}));
          const prof = (j && (j.profile || j)) || null;
          if (prof) { __PROFILE_CACHE = prof; writeCachedProfile(prof); }
          return __PROFILE_CACHE;
        } catch { return null; }
        finally { clearTimeout(t); __PROFILE_PROMISE = null; }
      })();
      return __PROFILE_PROMISE;
    }
    function parseRange(input, totalPages) {
      const t = (input || '').trim();
      if (!t || t.toLowerCase() === 'all') return totalPages || null;
      let count = 0;
      const parts = t.split(',').map(seg => seg.trim()).filter(Boolean);
      for (const segment of parts) {
        if (/^\d+$/.test(segment)) {
          const v = parseInt(segment, 10);
          if (!totalPages || (v >= 1 && v <= totalPages)) { count += 1; } else { return null; }
        } else if (/^\d+\s*-\s*\d+$/.test(segment)) {
          const [aRaw, bRaw] = segment.split('-').map(s => parseInt(s.trim(), 10));
          if (aRaw > bRaw) return null;
          if (!totalPages || (aRaw >= 1 && bRaw <= totalPages)) { count += (bRaw - aRaw + 1); } else { return null; }
        } else {
          return null;
        }
      }
      return count;
    }
    function computeSelectedPages(settings, totalPages) {
      const allPages = Number.isFinite(totalPages) ? totalPages : 0;
      const mode = (settings.range_mode || 'all').toLowerCase();
      if (mode === 'range') {
        return parseRange(settings.page_range || '', allPages);
      }
      if (mode === 'single') {
        const sp = parseInt(settings.single_page || '', 10);
        if (Number.isFinite(sp) && sp >= 1 && (!allPages || sp <= allPages)) return 1;
        return null;
      }
      return allPages || null;
    }
    function formatCurrency(value) {
      if (!Number.isFinite(value)) return '';
      try {
        const fmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return fmt.format(value);
      } catch {
        return `â‚¹${value.toFixed(2)}`;
      }
    }
    function friendlyPricingKey(key) {
      const map = {
        bw_single: 'B/W single side',
        bw_duplex: 'B/W duplex',
        color_single: 'Color single side',
        color_duplex: 'Color duplex'
      };
      return map[key] || key;
    }
    function normalizePricing(pricing) {
      if (!pricing) return {};
      if (typeof pricing === 'string') {
        try { return JSON.parse(pricing); } catch { return {}; }
      }
      if (typeof pricing === 'object') return pricing;
      return {};
    }
    function selectPricingTier(tiers, quantity) {
      if (!Array.isArray(tiers) || !tiers.length) return null;
      const sorted = tiers.slice().sort((a, b) => ((a?.min ?? 0) - (b?.min ?? 0)));
      let match = sorted.find(t => {
        const min = Number(t?.min);
        const upto = Number(t?.upto);
        const minOk = !Number.isFinite(min) || quantity >= min;
        const uptoOk = !Number.isFinite(upto) || quantity <= upto;
        return minOk && uptoOk;
      });
      if (!match) {
        match = sorted.reduce((acc, curr) => {
          const min = Number(curr?.min);
          if (!Number.isFinite(min) || quantity < min) return acc;
          if (!acc) return curr;
          const accMin = Number(acc?.min);
          return (!Number.isFinite(accMin) || min > accMin) ? curr : acc;
        }, null);
      }
      return match || null;
    }
    function estimatePrice(shop, settings, totalPagesInput) {
      if (!shop) return { amount: null, reason: 'Shop not found.' };
      const copiesRaw = parseInt(settings.copies || '1', 10);
      const copies = Number.isFinite(copiesRaw) && copiesRaw > 0 ? copiesRaw : 1;
      const totalPagesNumber = Number(totalPagesInput);
      const selectableTotal = Number.isFinite(totalPagesNumber) ? totalPagesNumber : 0;
      const selected = computeSelectedPages(settings, selectableTotal);
      const fallbackPages = (Number.isFinite(totalPagesNumber) && totalPagesNumber > 0) ? totalPagesNumber : null;
      const pagesPerCopy = Number.isFinite(selected) && selected > 0 ? selected : fallbackPages;
      if (!Number.isFinite(pagesPerCopy) || pagesPerCopy <= 0) {
        return { amount: null, reason: 'Add page count to view an estimate.' };
      }
      const nupRaw = parseInt(settings.n_up || '1', 10);
      const nUp = Number.isFinite(nupRaw) && nupRaw > 0 ? nupRaw : 1;
      const sidesPerCopy = Math.max(1, Math.ceil(pagesPerCopy / nUp));
      const duplexOn = (settings.duplex || '').toLowerCase() !== 'off';
      const unitsPerCopy = duplexOn ? Math.max(1, Math.ceil(sidesPerCopy / 2)) : sidesPerCopy;
      const qty = unitsPerCopy * copies;
      if (!qty) {
        return { amount: null, reason: 'Page count is zero.' };
      }
      const colorMode = (settings.color_mode || 'bw').toLowerCase();
      const pricingKey = (colorMode === 'color' ? 'color' : 'bw') + '_' + (duplexOn ? 'duplex' : 'single');
      const pricing = normalizePricing(shop.pricing);
      const tiers = Array.isArray(pricing[pricingKey]) ? pricing[pricingKey] : [];
      if (!tiers.length) {
        return { amount: null, reason: `No rates for ${friendlyPricingKey(pricingKey)}.` };
      }
      const tier = selectPricingTier(tiers, qty);
      if (!tier) {
        const unitWord = duplexOn ? 'sheet' : 'side';
        return { amount: null, reason: `No rate matches ${qty} ${unitWord}${qty === 1 ? '' : 's'}.` };
      }
      const perPage = Number(tier.per_page);
      if (!Number.isFinite(perPage) || perPage <= 0) {
        return { amount: null, reason: 'Rate missing in selected tier.' };
      }
      const amount = Math.round(perPage * qty * 100) / 100;
      const perPageRounded = Math.round(perPage * 100) / 100;
      const unitWord = duplexOn ? 'sheet' : 'side';
      const unitLabel = qty === 1 ? unitWord : `${unitWord}s`;
      const breakdown = `${formatCurrency(perPageRounded)} per ${unitWord} x ${qty} ${unitLabel} (${friendlyPricingKey(pricingKey)})`;
      const logicalTotal = Math.round(pagesPerCopy * copies);
      return { amount, perPage: perPageRounded, qty, unit: unitLabel, breakdown, reason: null, logicalPages: logicalTotal };
    }

    // ------ Query / state ------
    const p = new URLSearchParams(location.search);
    const shopId = p.get('shopId') || '';
    const noteId = p.get('noteId') || '';
    let settings = {};
    try { settings = JSON.parse(decodeURIComponent(p.get('settings') || '{}')); } catch { }
    const pages = parseInt(p.get('pages') || '') || '';
    const size = parseInt(p.get('size') || '') || '';

    // ------ UI elements ------
    const estEl = $('#est');
    const priceEl = $('#price');
    const priceNoteEl = $('#priceNote');
    const pickupPreview = $('#pickupPreview');
    const pickupSel = $('#pickup_window');
    const customWrap = $('#customWrap');
    const customDate = $('#customDate');
    const customTime = $('#customTime');
    let latestEstimatedPrice = null;

    // Live pickup preview
    function updatePickupPreview() {
      const v = pickupSel.value;
      if (v === 'Custom') {
        const d = customDate.value || 'â€”';
        const t = customTime.value || 'â€”';
        pickupPreview.textContent = `${d} ${t}`.trim();
      } else {
        pickupPreview.textContent = v || 'â€”';
      }
    }
    pickupSel.addEventListener('change', () => {
      customWrap.classList.toggle('hidden', pickupSel.value !== 'Custom');
      updatePickupPreview();
    });
    customDate.addEventListener('input', updatePickupPreview);
    customTime.addEventListener('input', updatePickupPreview);

    // Phone input lightweight mask
    const phoneInput = $('#contact_phone');
    phoneInput.addEventListener('input', (e) => {
      let v = e.target.value.replace(/[^\d+]/g, '');
      // basic keep + and digits, trim spaces
      e.target.value = v;
    });

    // Contact: for me / for others (fast, non-blocking; refines asynchronously)
    function updateContactMode(fromAsync = false) {
      const mode = (document.querySelector('input[name="contact_for"]:checked')?.value || 'me');
      const fieldsWrap = document.getElementById('contactFields');
      const meInfo = document.getElementById('meInfo');
      const nameInput = document.getElementById('contact_name');
      const phoneInput = document.getElementById('contact_phone');
      if (mode === 'me') {
        const tk = (window.getToken && window.getToken()) || '';
        if (!tk) {
          // Not logged in: cannot auto-fill; keep fields visible
          fieldsWrap.classList.remove('hidden');
          nameInput.required = true; phoneInput.required = true;
          meInfo.classList.remove('hidden');
          meInfo.textContent = 'Login to auto-fill your details, or enter them below.';
          return;
        }
        // Immediate best-effort data (snapshot or LS cache) – no await to keep UI snappy
        const prof = window.__PX_PROFILE_SNAPSHOT || __PROFILE_CACHE || readCachedProfile();
        const nm = (prof && (prof.name || prof.full_name || prof.username)) || '';
        const ph = (prof && (prof.phone || prof.mobile || '')) || '';
        if (nm) nameInput.value = nm;
        if (ph) phoneInput.value = ph;
        if (nm && ph) {
          fieldsWrap.classList.add('hidden');
          nameInput.required = false; phoneInput.required = false;
          meInfo.classList.remove('hidden');
          meInfo.textContent = `Using your profile: ${nm} • ${ph}`;
        } else {
          fieldsWrap.classList.remove('hidden');
          nameInput.required = !nm; phoneInput.required = !ph;
          meInfo.classList.remove('hidden');
          meInfo.textContent = 'Complete missing details below. We will save with your user ID.';
          // If we haven't refined via async fetch yet, trigger once and re-apply
          if (!fromAsync) {
            loadProfileMe().then(p => { if (p) { updateContactMode(true); } });
          }
        }
      } else {
        fieldsWrap.classList.remove('hidden');
        nameInput.required = true; phoneInput.required = true;
        meInfo.classList.add('hidden');
        meInfo.textContent = '';
        nameInput.value = '';
        phoneInput.value = '';
      }
    }

    // ------ Load shop + settings summary ------
    async function loadShop() {
      const url = (window.API_BASE || '') + '/api/print/shops';
      let r; try { r = await fetch(url); } catch { }
      const list = r && r.ok ? ((await r.json()).shops || []) : [];
      const shop = list.find(s => String(s.id) === String(shopId));

      $('#shop').innerHTML = shop
        ? `<div class="font-semibold">${escapeHtml(shop.name || '')}</div>
           <div class="opacity-70">${escapeHtml(shop.address || '')}</div>`
        : '<div class="opacity-80">Shop selected</div>';

      const s = settings || {};
      $('#settings').innerHTML = `<ul class="space-y-1">
        <li>Copies: <b>${escapeHtml(s.copies || '1')}</b></li>
        <li>Color: <b>${escapeHtml(s.color_mode || 'auto')}</b> - Duplex: <b>${escapeHtml(s.duplex || 'off')}</b> - N-up: <b>${escapeHtml(s.n_up || '1')}</b></li>
        <li>Paper: <b>${escapeHtml(s.paper_size || 'A4')}</b>${s.paper_gsm ? (' - ' + escapeHtml(s.paper_gsm) + ' GSM') : ''} - Finish: <b>${escapeHtml(s.finishing || 'none')}</b></li>
        <li>Pages: <b>${pages || '?'}</b> x Copies <b>${escapeHtml(s.copies || '1')}</b></li>
        ${s.page_range ? ('<li>Range: <b>' + escapeHtml(s.page_range) + '</b></li>') : ''}
      </ul>`;

      const copiesParsed = parseInt(s.copies || '1', 10);
      const copiesCount = Number.isFinite(copiesParsed) && copiesParsed > 0 ? copiesParsed : 1;
      const totalPagesNumber = Number(pages);
      const selectableTotal = Number.isFinite(totalPagesNumber) ? totalPagesNumber : 0;
      const selectedPerCopy = computeSelectedPages(s, selectableTotal);
      const perCopyPages = Number.isFinite(selectedPerCopy) && selectedPerCopy > 0
        ? selectedPerCopy
        : (Number.isFinite(totalPagesNumber) && totalPagesNumber > 0 ? totalPagesNumber : null);
      const fallbackPageTotal = perCopyPages != null ? perCopyPages * copiesCount : null;

      const priceInfo = estimatePrice(shop, s, selectableTotal);
      latestEstimatedPrice = (priceInfo && priceInfo.amount != null) ? priceInfo.amount : null;
      const pageTotal = (priceInfo && Number.isFinite(priceInfo.logicalPages) && priceInfo.logicalPages > 0)
        ? priceInfo.logicalPages
        : fallbackPageTotal;
      estEl.textContent = pageTotal ? (`Estimated total pages: ${pageTotal}`) : '';

      if (priceEl) {
        if (priceInfo && priceInfo.amount != null) {
          priceEl.textContent = `Estimated price: ${formatCurrency(priceInfo.amount)}`;
          if (priceNoteEl) {
            if (priceInfo.breakdown) {
              priceNoteEl.textContent = priceInfo.breakdown;
              priceNoteEl.classList.remove('hidden');
            } else {
              priceNoteEl.textContent = '';
              priceNoteEl.classList.add('hidden');
            }
          }
        } else if (priceInfo && priceInfo.reason) {
          priceEl.textContent = 'Price unavailable';
          if (priceNoteEl) {
            priceNoteEl.textContent = priceInfo.reason;
            priceNoteEl.classList.remove('hidden');
          }
        } else {
          priceEl.textContent = '';
          if (priceNoteEl) {
            priceNoteEl.textContent = '';
            priceNoteEl.classList.add('hidden');
          }
        }
      }

      // Initialize pickup preview
      updatePickupPreview();
    }

    // ------ Submit ------
    async function submitJob() {
      const token = (window.getToken && window.getToken()) || '';
      const f = new FormData(document.getElementById('reviewForm'));

      // Resolve contact per selection
      const mode = (document.querySelector('input[name="contact_for"]:checked')?.value || 'me');
      let name = (document.getElementById('contact_name').value || '').trim();
      let phone = (document.getElementById('contact_phone').value || '').trim();
      if (mode === 'me' && token) {
        const prof = window.__PX_PROFILE_SNAPSHOT || await loadProfileMe();
        if (prof) {
          if (!name) name = (prof.name || prof.full_name || prof.username || '').trim();
          if (!phone) phone = (prof.phone || '').trim();
        }
      }
      // Client-side checks
      if (!name) { $('#status').textContent = 'Please enter your name.'; toast('Please enter your name.'); return; }
      if (!phone) { $('#status').textContent = 'Please enter a phone number.'; toast('Please enter a phone number.'); return; }
      if (!document.getElementById('terms').checked) { $('#status').textContent = 'Please accept the terms.'; toast('Please accept the terms.'); return; }

      // Build pickup_window (inline Custom value)
      let pickup_window = f.get('pickup_window') || null;
      if (pickup_window === 'Custom') {
        const d = customDate.value; const t = customTime.value;
        if (!d || !t) { $('#status').textContent = 'Choose a custom date & time.'; toast('Choose a custom date & time.'); return; }
        pickup_window = `${d} ${t}`;
      }

      const payload = {
        shop_id: shopId,
        marketplace_note_id: noteId || null,
        estimated_pages: pages || null,
        file_size: size || null,
        estimated_price: latestEstimatedPrice != null ? Number(latestEstimatedPrice) : null,
        settings: {
          copies: parseInt(settings.copies || '1') || 1,
          color_mode: settings.color_mode || 'auto',
          duplex: settings.duplex || 'off',
          n_up: parseInt(settings.n_up || '1') || 1,
          paper_size: settings.paper_size || 'A4',
          paper_gsm: settings.paper_gsm ? parseInt(settings.paper_gsm) : null,
          finishing: settings.finishing || 'none',
          page_range: settings.page_range || 'all',
          scale: settings.scale || 'fit',
          collate: !!(settings.collate === true || settings.collate === 'on'),
          notes_to_shop: settings.notes_to_shop || '',
          orientation: (settings.orientation === 'horizontal') ? 'horizontal' : 'vertical'
        },
        pickup_window,
        contact_name: name,
        contact_phone: phone
      };

      // Loading state
      const submitBtn = document.getElementById('submit');
      const statusEl = document.getElementById('status');
      const originalBtn = submitBtn.innerHTML;
      statusEl.textContent = 'Submittingâ€¦';
      submitBtn.disabled = true;
      submitBtn.classList.add('opacity-70', 'pointer-events-none');
      submitBtn.innerHTML = `<span class="material-symbols-rounded animate-spin text-base">progress_activity</span> <span>Submittingâ€¦</span>`;

      let r;
      try {
        r = await fetch((window.API_BASE || '') + '/api/print/jobs', {
          method: 'POST',
          headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { Authorization: 'Bearer ' + token } : {}),
          body: JSON.stringify(payload)
        });
      } catch {
        statusEl.textContent = 'Network error'; toast('Network error');
        submitBtn.disabled = false; submitBtn.classList.remove('opacity-70', 'pointer-events-none'); submitBtn.innerHTML = originalBtn;
        return;
      }

      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        statusEl.textContent = j.detail || 'Error';
        toast(j.detail || 'Error submitting job');
        submitBtn.disabled = false; submitBtn.classList.remove('opacity-70', 'pointer-events-none'); submitBtn.innerHTML = originalBtn;
        return;
      }

      statusEl.textContent = 'Submitted. Generating OTPâ€¦';
      toast('Job submitted!');

      const next = new URL('./success.html', location.href);
      next.searchParams.set('jobId', j.job_id);
      next.searchParams.set('otp', j.otp);
      location.href = next.toString();
    }

    // ------ Events ------
    document.addEventListener('DOMContentLoaded', () => {
      loadShop();
      // Init contact mode handlers
      document.getElementById('for_me')?.addEventListener('change', updateContactMode);
      document.getElementById('for_others')?.addEventListener('change', updateContactMode);
      updateContactMode();
      // If global auth fetch updates profile later, refine the UI without waiting
      try {
        const prevApply = window.__PX_NAV_APPLY;
        window.__PX_NAV_APPLY = function (profile) {
          try { if (prevApply) prevApply(profile); } catch { }
          try { if (profile) { __PROFILE_CACHE = profile; writeCachedProfile(profile); } } catch { }
          // Re-apply mode to hide fields if now complete
          try { updateContactMode(true); } catch { }
        };
      } catch { }
    });
    document.getElementById('submit').addEventListener('click', submitJob);
