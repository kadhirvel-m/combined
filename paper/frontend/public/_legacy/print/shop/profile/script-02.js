// Extracted from ui/print/shop/profile.html (inline <script> #2).
    // Theme toggle
    const themeBtn = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const syncIcon = () => { if (!themeIcon) return; themeIcon.textContent = document.documentElement.classList.contains('dark') ? 'light_mode' : 'dark_mode' };
    themeBtn?.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
      localStorage.setItem('px_theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
      syncIcon();
    });
    syncIcon();

    const toast = (msg, ms = 1600) => {
      const t = document.getElementById('toast'), m = document.getElementById('toastMsg');
      m.textContent = msg; t.classList.remove('hidden', 'opacity-0');
      t.classList.add('transition', 'duration-200');
      setTimeout(() => { t.classList.add('opacity-0'); setTimeout(() => t.classList.add('hidden'), 200); }, ms);
    };

    const API = (window.API_BASE || '').replace(/\/$/, '');
    const TOKEN = localStorage.getItem('px_token');
    const authHeader = TOKEN ? { Authorization: 'Bearer ' + TOKEN } : {};

    // If not logged in, go to login
    if (!TOKEN) { location.href = './login.html'; }

    // DOM refs
    const els = {
      name: document.getElementById('name'),
      phone: document.getElementById('phone'),
      email: document.getElementById('email'),
      address: document.getElementById('address'),
      lat: document.getElementById('lat'),
      lng: document.getElementById('lng'),
      is_open: document.getElementById('is_open'),
      paused: document.getElementById('paused'),
      cap_color: document.getElementById('cap_color'),
      cap_bw: document.getElementById('cap_bw'),
      cap_duplex: document.getElementById('cap_duplex'),
      cap_sizes: document.getElementById('cap_sizes'),
      cap_binding: document.getElementById('cap_binding'),
      price_hint: document.getElementById('price_hint'),
      open_time: document.getElementById('open_time'),
      close_time: document.getElementById('close_time'),
      chipShopId: document.getElementById('chipShopId'),
      chipStatus: document.getElementById('chipStatus'),
      logoPreview: document.getElementById('logoPreview'),
      logoFile: document.getElementById('logoFile'),
      logoMsg: document.getElementById('logoMsg'),
      uploadLogo: document.getElementById('uploadLogo'),
    };

    const pricingKeys = [
      { key: 'bw_single', label: 'B/W — Single side' },
      { key: 'bw_duplex', label: 'B/W — Double side' },
      { key: 'color_single', label: 'Color — Single side' },
      { key: 'color_duplex', label: 'Color — Double side' },
    ];
    const pricingEl = document.getElementById('pricingForms');
    const pricingState = { bw_single: [], bw_duplex: [], color_single: [], color_duplex: [] };

    // Sample tiers (from user input) — used by "Load sample tiers" button
    const sampleTiers = {
      bw_single: [{ min: 1, upto: 5, per_page: 5 }, { min: 6, upto: 50, per_page: 3 }],
      bw_duplex: [{ min: 1, upto: 5, per_page: 5 }, { min: 6, upto: 50, per_page: 2 }],
      color_single: [{ min: 1, upto: 100, per_page: 8 }],
      color_duplex: [{ min: 1, upto: 100, per_page: 7 }],
    };

    // Load sample tiers into the UI when requested
    document.addEventListener('click', (e) => {
      if (e.target && (e.target.id === 'loadSampleTiers' || e.target.closest('#loadSampleTiers'))) {
        Object.keys(sampleTiers).forEach(k => { pricingState[k] = sampleTiers[k].slice(); });
        pricingEl.innerHTML = '';
        pricingKeys.forEach(({ key, label }) => renderPricingSection(key, label));
        toast('Sample tiers loaded');
      }
    });

    function renderPricingSection(key, label) {
      const wrap = document.createElement('div');
      wrap.innerHTML = `
        <div class="rounded-2xl ring-1 ring-black/5 dark:ring-white/10 p-4">
          <div class="font-semibold mb-2">${label}</div>
          <div class="flex flex-wrap gap-3" data-key="${key}"></div>
          <div class="mt-3">
            <button type="button" class="inline-flex items-center gap-2 px-3 py-1.5 rounded-md ring-soft hover:bg-black/5 dark:hover:bg-white/10" data-add="${key}"><span class="material-symbols-rounded text-base">add</span>Add tier</button>
          </div>
        </div>`;
      const container = wrap.querySelector('[data-key]');
      const add = wrap.querySelector('[data-add]');

      function addRow(tier = {}) {
        const row = document.createElement('div');
        // responsive box for a tier
        row.className = 'tier-row flex items-center gap-2 px-3 py-2 rounded-md ring-soft bg-white/90 dark:bg-white/5';
        row.style.minWidth = '220px';
        row.innerHTML = `
            <input type="number" placeholder="min" class="w-20 text-sm px-2 py-1 rounded-md" value="${tier.min ?? ''}">
            <input type="number" placeholder="upto" class="w-20 text-sm px-2 py-1 rounded-md" value="${tier.upto ?? ''}">
            <input type="number" step="0.01" placeholder="per page (₹)" class="w-28 text-sm px-2 py-1 rounded-md" value="${tier.per_page ?? ''}">
            <button type="button" class="ml-2 px-2 rounded-md" title="Remove"><span class="material-symbols-rounded text-base">delete</span></button>`;
        row.querySelector('button').addEventListener('click', () => { row.remove(); });
        container.appendChild(row);
      }

      (pricingState[key] || []).forEach(addRow);
      add.addEventListener('click', () => addRow({}));
      pricingEl.appendChild(wrap);
    }

    // Load current profile
    async function loadProfile() {
      try {
        const r = await fetch(`${API}/api/shop/me`, { headers: { ...authHeader } });
        if (r.status === 401) { location.href = './login.html'; return; }
        const s = await r.json().catch(() => ({}));
        // Fill fields (guard against missing keys)
        els.name.value = s.name || '';
        els.phone.value = s.phone || '';
        els.email.value = s.email || '';
        els.address.value = s.address || '';
        els.lat.value = (typeof s.lat === 'number' ? s.lat : '');
        els.lng.value = (typeof s.lng === 'number' ? s.lng : '');
        els.is_open.checked = !!s.is_open;
        els.paused.checked = !!s.paused;
        const caps = s.capabilities || {};
        els.cap_color.checked = !!caps.color;
        els.cap_bw.checked = !!caps.bw || !caps.color; // assume B/W if color false
        els.cap_duplex.checked = !!caps.duplex;
        // multi-select helpers
        const setMulti = (sel, arr = []) => { Array.from(sel.options).forEach(o => o.selected = arr?.includes(o.value)); };
        setMulti(els.cap_sizes, caps.sizes || []);
        setMulti(els.cap_binding, caps.binding || caps.bindings || []);
        els.price_hint.value = s.price_hint || '';
        els.open_time.value = (s.hours && s.hours.open) || '';
        els.close_time.value = (s.hours && s.hours.close) || '';
        els.chipShopId.textContent = s.id ? `ID: ${s.id}` : 'ID: —';
        const opened = s.created_at ? new Date(s.created_at).toLocaleDateString() : '—';
        els.chipStatus.textContent = (s.paused ? 'Paused' : (s.is_open ? 'Open' : 'Closed')) + ` · Opened ${opened}`;

        // logo
        if (s.logo_url) {
          els.logoPreview.src = s.logo_url; els.logoPreview.classList.remove('hidden');
        } else {
          els.logoPreview.classList.add('hidden');
        }

        // pricing
        const p = s.pricing || {};
        pricingState.bw_single = p.bw_single || [];
        pricingState.bw_duplex = p.bw_duplex || [];
        pricingState.color_single = p.color_single || [];
        pricingState.color_duplex = p.color_duplex || [];
        pricingEl.innerHTML = '';
        pricingKeys.forEach(({ key, label }) => renderPricingSection(key, label));
      } catch (e) {
        toast('Failed to load profile');
      }
    }

    // Save
    async function saveProfile() {
      const getMulti = (sel) => Array.from(sel.selectedOptions).map(o => o.value);
      // collect pricing tiers
      const collectPricing = () => {
        const out = {};
        pricingKeys.forEach(({ key }) => {
          const container = pricingEl.querySelector(`[data-key="${key}"]`);
          if (!container) { out[key] = []; return; }
          const rows = Array.from(container.querySelectorAll('.tier-row'));
          const tiers = rows.map(row => {
            const inputs = row.querySelectorAll('input');
            const minV = inputs[0] ? (inputs[0].value || '').toString().trim() : '';
            const uptoV = inputs[1] ? (inputs[1].value || '').toString().trim() : '';
            const perV = inputs[2] ? (inputs[2].value || '').toString().trim() : '';
            const perNum = perV === '' ? undefined : Number(perV);
            if (perNum === undefined || Number.isNaN(perNum)) return null; // skip invalid/empty price
            return {
              min: minV === '' ? undefined : Number(minV),
              upto: uptoV === '' ? undefined : Number(uptoV),
              per_page: perNum,
            };
          }).filter(t => t !== null);
          out[key] = tiers;
        });
        return out;
      };

      const payload = {
        name: els.name.value.trim(),
        phone: els.phone.value.trim(),
        address: els.address.value.trim(),
        lat: els.lat.value ? Number(els.lat.value) : undefined,
        lng: els.lng.value ? Number(els.lng.value) : undefined,
        is_open: !!els.is_open.checked,
        paused: !!els.paused.checked,
        capabilities: {
          color: !!els.cap_color.checked,
          duplex: !!els.cap_duplex.checked,
          sizes: getMulti(els.cap_sizes),
          bindings: getMulti(els.cap_binding),
        },
        price_hint: els.price_hint.value.trim(),
        hours: { open: els.open_time.value, close: els.close_time.value },
        pricing: collectPricing(),
      };
      try {
        const r = await fetch(`${API}/api/shop/me`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...authHeader },
          body: JSON.stringify(payload)
        });
        if (!r.ok) { toast('Save failed'); return; }
        toast('Profile saved');
        loadProfile();
      } catch { toast('Network error'); }
    }

    document.getElementById('saveAll').addEventListener('click', (e) => { e.preventDefault(); saveProfile(); });
    document.getElementById('logout').addEventListener('click', () => { localStorage.removeItem('px_token'); location.href = './login.html'; });
    document.getElementById('useLoc').addEventListener('click', () => {
      if (!navigator.geolocation) { toast('Geolocation not supported'); return; }
      navigator.geolocation.getCurrentPosition(pos => {
        els.lat.value = pos.coords.latitude.toFixed(6);
        els.lng.value = pos.coords.longitude.toFixed(6);
        toast('Location set');
      }, () => toast('Location denied'), { enableHighAccuracy: true, timeout: 10000 });
    });

    // Logo upload
    els.logoFile.addEventListener('change', () => {
      const f = els.logoFile.files && els.logoFile.files[0];
      if (f) {
        const url = URL.createObjectURL(f);
        els.logoPreview.src = url;
        els.logoPreview.classList.remove('hidden');
      }
    });
    els.uploadLogo.addEventListener('click', async (e) => {
      e.preventDefault();
      els.logoMsg.textContent = '';
      const f = els.logoFile.files && els.logoFile.files[0];
      if (!f) { els.logoMsg.textContent = 'Choose an image first'; return; }
      const fd = new FormData(); fd.append('file', f);
      try {
        const r = await fetch(`${API}/api/shop/logo`, { method: 'POST', headers: { ...authHeader }, body: fd });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) {
          const msg = j.detail || 'Upload failed';
          els.logoMsg.textContent = msg;
          toast(msg);
          return;
        }
        if (j.url) { els.logoPreview.src = j.url; els.logoPreview.classList.remove('hidden'); toast('Logo updated'); }
      } catch { els.logoMsg.textContent = 'Network error'; }
    });

    // Init
    loadProfile();
