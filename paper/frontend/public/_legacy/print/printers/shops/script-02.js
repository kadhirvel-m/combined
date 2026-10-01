// Extracted from ui/print/printers/shops.html (inline <script> #2).
    // ---------- Theme ----------
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

    // ---------- Helpers ----------
    const params = new URLSearchParams(location.search);
    const noteId = params.get('noteId') || '';
    const qpPages = params.get('pages');
    const qpSize = params.get('size');

    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => Array.from(document.querySelectorAll(sel));
    const toast = (msg, ms = 1600) => {
      const t = $('#toast'), m = $('#toastMsg');
      m.textContent = msg; t.classList.remove('hidden', 'opacity-0');
      t.classList.add('transition', 'duration-200');
      setTimeout(() => { t.classList.add('opacity-0'); setTimeout(() => t.classList.add('hidden'), 200); }, ms);
    };
    const km = (m) => (m / 1000).toFixed(1);

    // Haversine distance (meters)
    function distMeters(lat1, lon1, lat2, lon2) {
      if ([lat1, lon1, lat2, lon2].some(v => typeof v !== 'number' || isNaN(v))) return null;
      const R = 6371e3, toRad = (d) => d * Math.PI / 180;
      const dlat = toRad(lat2 - lat1), dlon = toRad(lon2 - lon1);
      const a = Math.sin(dlat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dlon / 2) ** 2;
      return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    // Active filter chips
    function renderChips() {
      const chips = $('#chips');
      chips.innerHTML = '';
      const items = [];
      const radius = $('#radius').value;
      const size = $('#size').value;
      const binding = $('#binding').value;
      if ($('#open_now').checked) items.push(['Open now', 'open_now']);
      if ($('#color').checked) items.push(['Color', 'color']);
      if (size) items.push([`Size: ${size}`, 'size']);
      if (binding) items.push([`Binding: ${binding}`, 'binding']);
      if (radius) items.push([`${radius} km radius`, 'radius']);

      if (!items.length) { chips.classList.add('hidden'); return; }
      items.forEach(([label, id]) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'inline-flex items-center gap-1 px-2 py-1 rounded-full text-[12px] ring-soft hover:bg-black/5 dark:hover:bg-white/5';
        b.innerHTML = `<span>${label}</span><span class="material-symbols-rounded text-xs">close</span>`;
        b.addEventListener('click', () => {
          if (id === 'open_now') $('#open_now').checked = false;
          else if (id === 'color') $('#color').checked = false;
          else if (id === 'size') $('#size').value = '';
          else if (id === 'binding') $('#binding').value = '';
          else if (id === 'radius') $('#radius').value = '5';
          fetchShops();
        });
        chips.appendChild(b);
      });
      chips.classList.remove('hidden');
    }

    // ---------- Cards ----------
    function card(shop, userPos) {
      const caps = shop.capabilities || {};
      const open = shop.is_open && !shop.paused;
      const priceHint = shop.price_hint || '';
      const color = caps.color ? 'Color' : 'B/W only';
      const sizes = (caps.sizes || []).join(', ') || 'A4';
      const rating = (shop.rating && Number(shop.rating).toFixed(1)) || null;
      // Try multiple common fields for logo URL from API/db
      const rawLogo = shop.logo_url || shop.logoUrl || shop.logo || shop.image_url || shop.imageUrl || null;
      const logoUrl = (typeof rawLogo === 'string' && rawLogo.trim()) ? rawLogo.trim() : null;

      let distanceLabel = '';
      if (userPos && typeof shop.lat === 'number' && typeof shop.lng === 'number') {
        const d = distMeters(userPos.lat, userPos.lng, shop.lat, shop.lng);
        if (d != null) distanceLabel = `${km(d)} km`;
      }

      const a = document.createElement('a');
      const url = new URL('./configure.html', location.href);
      url.searchParams.set('shopId', shop.id);
      if (noteId) url.searchParams.set('noteId', noteId);
      if (qpPages) url.searchParams.set('pages', qpPages);
      if (qpSize) url.searchParams.set('size', qpSize);
      a.href = url.toString();

      a.className = 'group block rounded-2xl glass ring-1 ring-black/5 dark:ring-white/10 p-4 hover:shadow-neon transition';

      a.innerHTML = `
        <div class="flex items-start gap-3">
          <div class="shrink-0 w-10 h-10 rounded-full bg-brand-500/15 grid place-items-center">
            <span class="material-symbols-rounded">local_printshop</span>
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <h3 class="font-semibold truncate">${shop.name || 'Print Shop'}</h3>
              ${open
          ? '<span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 ring-1 ring-emerald-500/30">Open</span>'
          : '<span class="text-[10px] px-2 py-0.5 rounded-full bg-neutral-500/10 text-neutral-600 ring-1 ring-black/10">Closed</span>'}
              ${rating ? `<span class="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-700 ring-1 ring-yellow-500/30">★ ${rating}</span>` : ''}
              ${distanceLabel ? `<span class="text-[10px] px-1.5 py-0.5 rounded bg-white/60 dark:bg-white/10 ring-soft">${distanceLabel}</span>` : ''}
            </div>
            <div class="text-[12px] opacity-70 truncate">${shop.address || ''}</div>
            <div class="text-[12px] mt-1">${color} • Sizes: ${sizes}</div>
            ${priceHint ? `<div class="text-[11px] opacity-80 mt-1">${priceHint}</div>` : ''}
          </div>
          <span class="material-symbols-rounded opacity-40 group-hover:opacity-80 transition">chevron_right</span>
        </div>`;
      // Override to upgraded Material-style card
      a.className = 'group block rounded-3xl surface ring-1 ring-black/5 dark:ring-white/10 p-4 hover:shadow-neon transition';
      a.innerHTML = `
        <div class="flex items-start gap-3">
          <div class="shrink-0 w-10 h-10 rounded-full bg-brand-500/15 overflow-hidden grid place-items-center">
            ${logoUrl
          ? `<img src="${logoUrl}" alt="${(shop.name || 'Print Shop').replace(/"/g, '&quot;')} logo" class="w-full h-full object-cover" loading="lazy">`
          : `<span class="material-symbols-rounded">local_printshop</span>`}
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <h3 class="font-semibold truncate">${shop.name || 'Print Shop'}</h3>
              ${open
          ? '<span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 ring-1 ring-emerald-500/30">Open</span>'
          : '<span class="text-[10px] px-2 py-0.5 rounded-full bg-neutral-500/10 text-neutral-600 ring-1 ring-black/10">Closed</span>'}
              ${rating ? `<span class=\"text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-700 ring-1 ring-yellow-500/30\">★ ${rating}</span>` : ''}
              ${distanceLabel ? `<span class=\"text-[10px] px-1.5 py-0.5 rounded bg-white/60 dark:bg-white/10 ring-soft\">${distanceLabel}</span>` : ''}
            </div>
            <div class="text-[12px] opacity-70 truncate">${shop.address || ''}</div>
            <div class="mt-2 flex flex-wrap items-center gap-2">
              <span class="chip">${color}</span>
              <span class="chip">Sizes: ${sizes}</span>
              ${priceHint ? `<span class=\"chip\">${priceHint}</span>` : ''}
            </div>
          </div>
          <span class="material-symbols-rounded opacity-40 group-hover:opacity-80 transition">chevron_right</span>
        </div>`;
      return a;
    }

    // ---------- Fetch ----------
    let userPos = null;

    async function fetchShops() {
      renderChips();
      $('#status').textContent = 'Searching…';
      $('#skeletonGrid').classList.remove('hidden');
      $('#shopList').classList.add('hidden');
      $('#emptyState').classList.add('hidden');

      const base = (window.API_BASE || '') + '/api/print/shops';
      const url = new URL(base, location.origin);

      const q = $('#q').value.trim();
      if (q) url.searchParams.set('q', q);

      const radius = $('#radius').value;
      if (radius) url.searchParams.set('radius', radius);

      if ($('#open_now').checked) url.searchParams.set('open_now', 'true');
      if ($('#color').checked) url.searchParams.set('color', 'true');
      if ($('#size').value) url.searchParams.set('size', $('#size').value);
      if ($('#binding').value) url.searchParams.set('binding', $('#binding').value);

      // Add optional geocoords & sort
      if (userPos) {
        url.searchParams.set('lat', userPos.lat);
        url.searchParams.set('lng', userPos.lng);
      }
      const sort = $('#sort').value;
      if (sort) url.searchParams.set('sort', sort);

      let r;
      try { r = await fetch(url.toString()); }
      catch { $('#status').textContent = 'Network error'; return; }

      let data = {};
      try { data = await r.json(); } catch { }
      $('#status').textContent = '';

      const list = (data.shops || []);
      const wrap = $('#shopList');
      wrap.innerHTML = '';

      if (!list.length) {
        $('#emptyState').classList.remove('hidden');
        $('#skeletonGrid').classList.add('hidden');
        return;
      }

      list.forEach(s => wrap.appendChild(card(s, userPos)));
      $('#skeletonGrid').classList.add('hidden');
      wrap.classList.remove('hidden');
    }

    // ---------- Geolocation ----------
    $('#useLoc').addEventListener('click', () => {
      if (!navigator.geolocation) { toast('Geolocation not supported'); return; }
      $('#status').textContent = 'Locating…';
      navigator.geolocation.getCurrentPosition(pos => {
        userPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        $('#status').textContent = 'Location set';
        fetchShops();
      }, () => {
        $('#status').textContent = 'Location denied';
      }, { enableHighAccuracy: true, timeout: 10000 });
    });

    // ---------- Form events ----------
    $('#filters').addEventListener('submit', (e) => { e.preventDefault(); fetchShops(); });
    $('#clearFilters').addEventListener('click', () => {
      $('#q').value = '';
      $('#radius').value = '5';
      $('#open_now').checked = false;
      $('#color').checked = false;
      $('#size').value = '';
      $('#binding').value = '';
      $('#sort').value = '';
      renderChips();
      fetchShops();
    });

    // Quick interactions trigger live refresh
    ['radius', 'size', 'binding', 'sort'].forEach(id => {
      $('#' + id).addEventListener('change', fetchShops);
    });
    ['open_now', 'color'].forEach(id => {
      $('#' + id).addEventListener('click', fetchShops);
    });

    // ---------- Init ----------
    document.addEventListener('DOMContentLoaded', () => {
      renderChips();
      fetchShops();
    });
