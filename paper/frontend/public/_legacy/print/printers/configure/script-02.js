// Extracted from ui/print/printers/configure.html (inline <script> #2).
    // ---------- State from query ----------
    const p = new URLSearchParams(location.search);
    const state = {
      shopId: p.get('shopId') || '',
      noteId: p.get('noteId') || '',
      pages: parseInt(p.get('pages') || '') || '',
      size: parseInt(p.get('size') || '') || ''
    };

    // ---------- Helpers ----------
    const $ = (s) => document.querySelector(s);
    const $$ = (s) => Array.from(document.querySelectorAll(s));
    const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
    const ceil = Math.ceil;

    // Expand a range string like "1-3,7" into a sorted unique array of page numbers
    function expandRange(input, totalPages) {
      const t = (input || '').trim();
      if (!t) return [];
      const set = new Set();
      const parts = t.split(',').map(s => s.trim()).filter(Boolean);
      for (const seg of parts) {
        if (/^\d+$/.test(seg)) {
          const v = parseInt(seg, 10);
          if (!totalPages || (v >= 1 && v <= totalPages)) set.add(v); else return [];
        } else if (/^\d+\s*-\s*\d+$/.test(seg)) {
          let [a, b] = seg.split('-').map(s => parseInt(s.trim(), 10));
          if (a > b) return [];
          const lo = Math.max(1, a);
          const hi = totalPages ? Math.min(totalPages, b) : b;
          for (let i = lo; i <= hi; i++) set.add(i);
        } else {
          return [];
        }
      }
      return Array.from(set).sort((x, y) => x - y);
    }

    // Basic page-range validator / counter: returns number of pages selected or null if invalid
    function parseRange(input, totalPages) {
      const t = (input || '').trim();
      if (!t || t.toLowerCase() === 'all') return totalPages || null;
      let count = 0;
      const parts = t.split(',').map(s => s.trim()).filter(Boolean);
      for (const seg of parts) {
        if (/^\d+$/.test(seg)) { // single
          const v = parseInt(seg);
          if (!totalPages || v >= 1 && v <= totalPages) count += 1; else return null;
        } else if (/^\d+\s*-\s*\d+$/.test(seg)) {
          const [a, b] = seg.split('-').map(s => parseInt(s.trim()));
          if (a > b) return null;
          if (!totalPages || (a >= 1 && b <= totalPages)) count += (b - a + 1); else return null;
        } else {
          return null;
        }
      }
      return count;
    }

    // ---------- Populate preview meta ----------
    let previewBaseSrc = '';
    function refreshPreviewMeta() {
      const f = new FormData($('#cfg'));
      const copies = clamp(parseInt(f.get('copies') || '1'), 1, 50);
      const nup = parseInt(f.get('n_up') || '1') || 1;
      const duplex = f.get('duplex') || 'off';
      const totalPages = parseInt(state.pages || '') || 0;

      // Determine selected pages from range mode
      const rangeMode = f.get('range_mode') || 'all';
      let rangeText = 'all';
      let rangeCount = totalPages;
      if (rangeMode === 'range') {
        rangeText = f.get('page_range') || '';
        rangeCount = parseRange(rangeText, totalPages);
      } else if (rangeMode === 'single') {
        const sp = parseInt(f.get('single_page') || '');
        if (Number.isFinite(sp)) {
          rangeText = String(sp);
          rangeCount = (sp >= 1 && (!totalPages || sp <= totalPages)) ? 1 : null;
        } else {
          rangeCount = null;
        }
      }
      const pagesUsed = (rangeCount != null) ? rangeCount : totalPages;

      // Effective sheet math
      const pagesPerSide = Math.max(1, nup);
      const sidesNeeded = pagesUsed / pagesPerSide;
      const duplexFactor = (duplex === 'off') ? 1 : 0.5; // 2 sides per sheet if duplex
      const sheets = ceil(sidesNeeded * duplexFactor);
      const totalSheets = sheets * copies;
      const totalLogicalPages = pagesUsed * copies;

      // Summary line
      $('#summary').textContent =
        `${pagesUsed ? pagesUsed + ' pages × ' : ''}${copies} copies`
        + (pagesUsed ? ` → ~${totalLogicalPages} pages, ~${totalSheets} sheet${totalSheets !== 1 ? 's' : ''}` : '');

      // Small meta under preview
      const cm = f.get('color_mode');
      const cmText = cm === 'bw' ? 'B/W' : (cm === 'color' ? 'Color' : cm);
      const ps = f.get('paper_size');
      const up = `${nup}-up`;
      const dx = duplex === 'off' ? 'Simplex' : `Duplex (${duplex})`;
      $('#previewMeta').textContent = [
        state.pages ? `${state.pages} pages total` : null,
        `Range: ${rangeText || 'all'}`,
        `Mode: ${cmText}`,
        `${up}, ${dx}`,
        `Paper: ${ps}`
      ].filter(Boolean).join(' • ');

      // Update the live preview frame to show selected pages immediately
      applyPreviewPageFilter({ mode: rangeMode, rangeText, singlePage: f.get('single_page') });
      // Apply orientation to preview
      applyPreviewOrientation(f.get('orientation') || 'vertical');
    }

    function applyPreviewPageFilter({ mode, rangeText, singlePage }) {
      const wrap = document.getElementById('preview');
      if (!wrap) return;
      const iframe = wrap.querySelector('iframe');
      const badge = document.getElementById('previewRangeBadge');
      if (!iframe || !previewBaseSrc) return;
      let firstPage = 1;
      const totalPages = parseInt(state.pages || '') || 0;
      if (mode === 'single') {
        const sp = parseInt(singlePage || '');
        if (Number.isFinite(sp) && sp >= 1) firstPage = sp;
      } else if (mode === 'range') {
        const arr = expandRange(rangeText || '', totalPages);
        if (arr.length) firstPage = arr[0];
      }
      // Compose URL: keep any existing query, set hash to desired view
      const u = new URL(previewBaseSrc, location.href);
      if (mode === 'range') {
        u.searchParams.set('range', (rangeText || '').trim());
      } else {
        u.searchParams.delete('range');
      }
      // Add a cache-busting param tied to first page to force some viewers to update
      u.searchParams.set('_p', String(firstPage));
      // PDF.js understands #page= and #view=fitH. If backend ignores, harmless.
      const hash = `page=${firstPage}&view=fitH`;
      const newSrc = u.toString().replace(/(#.*)?$/, '#' + hash);
      if (iframe.src !== newSrc) iframe.src = newSrc;

      if (badge) {
        if (mode === 'single' && Number.isFinite(firstPage)) {
          badge.textContent = `Preview: page ${firstPage}`;
          badge.classList.remove('hidden');
        } else if (mode === 'range' && (rangeText || '').trim()) {
          badge.textContent = `Preview: ${rangeText}`;
          badge.classList.remove('hidden');
        } else {
          badge.classList.add('hidden');
        }
      }
    }

    function applyPreviewOrientation(orientation) {
      const wrap = document.getElementById('preview');
      if (!wrap) return;
      const box = wrap.querySelector('#previewBox');
      const iframe = wrap.querySelector('iframe');
      if (!box || !iframe) return;
      box.classList.remove('aspect-[2/3]');
      box.classList.add('aspect-[3/2]');
      iframe.style.transform = '';
      iframe.style.transformOrigin = '';
      iframe.style.width = '';
      iframe.style.height = '';
      if (orientation === 'horizontal') {
        box.classList.remove('aspect-[3/2]');
        box.classList.add('aspect-[2/3]');
        iframe.style.transform = 'rotate(90deg)';
        iframe.style.transformOrigin = 'center';
        iframe.style.width = '150%';
        iframe.style.height = '150%';
      }
    }

    // ---------- Presets ----------
    function applyPreset(which) {
      const f = $('#cfg');
      const map = {
        eco: { color_mode: 'bw', duplex: 'long', n_up: '2', paper_size: 'A4', finishing: 'none', scale: 'fit' },
        handout: { color_mode: 'bw', duplex: 'long', n_up: '2', paper_size: 'A4', finishing: 'staple', scale: 'fit' },
        poster: { color_mode: 'color', duplex: 'off', n_up: '1', paper_size: 'A3', finishing: 'none', scale: 'actual' },
        booklet: { color_mode: 'bw', duplex: 'long', n_up: '2', paper_size: 'A4', finishing: 'staple', scale: 'shrink' }
      }[which] || {};
      Object.entries(map).forEach(([k, v]) => {
        const el = f.querySelector(`[name="${k}"]`);
        if (el) el.value = v;
      });
      refreshPreviewMeta();
    }

    // ---------- Capability guard (optional) ----------
    async function applyShopCapabilities() {
      const hint = $('#shopCapsHint');
      if (!state.shopId) { hint.textContent = ''; return; }
      let r;
      try { r = await fetch((window.API_BASE || '') + '/api/print/shops'); } catch { hint.textContent = ''; return; }
      const list = r && r.ok ? ((await r.json()).shops || []) : [];
      const shop = list.find(s => String(s.id) === String(state.shopId));
      if (!shop) { hint.textContent = ''; return; }

      const caps = shop.capabilities || {};
      const msgs = [];
      // color support
      if (!caps.color) {
        const sel = $('#cfg [name="color_mode"]');
        if (sel && sel.value === 'color') sel.value = 'bw';
        sel?.querySelector('option[value="color"]')?.setAttribute('disabled', '');
        msgs.push('Color not supported');
      }
      // sizes
      if (Array.isArray(caps.sizes) && caps.sizes.length) {
        const sizeSel = $('#cfg [name="paper_size"]');
        $$(`#cfg [name="paper_size"] option`).forEach(o => {
          if (!caps.sizes.includes(o.value)) o.setAttribute('disabled', ''); else o.removeAttribute('disabled');
        });
        msgs.push(`Sizes: ${caps.sizes.join(', ')}`);
      }
      // duplex
      if (!caps.duplex) {
        const dx = $('#cfg [name="duplex"]');
        dx.value = 'off';
        $$(`#cfg [name="duplex"] option[value="long"]`).forEach(o => o.setAttribute('disabled', ''));
        msgs.push('Duplex not supported');
      }
      hint.textContent = msgs.length ? msgs.join(' • ') : 'Shop ready';
    }

    // ---------- Range hint + form reactions ----------
    function updateRangeHint() {
      const f = new FormData($('#cfg'));
      const totalPages = parseInt(state.pages || '') || 0;
      const mode = f.get('range_mode') || 'all';
      let res = totalPages;
      if (mode === 'range') {
        res = parseRange(f.get('page_range'), totalPages);
      } else if (mode === 'single') {
        const sp = parseInt(f.get('single_page') || '');
        res = (Number.isFinite(sp) && sp >= 1 && (!totalPages || sp <= totalPages)) ? 1 : null;
      }
      const el = $('#rangeHint');
      if ((mode === 'range' || mode === 'single') && res == null) {
        el.textContent = mode === 'single' ? 'Enter a valid page number.' : 'Invalid range. Use numbers and ranges like 1-4,7.';
        el.classList.remove('opacity-70'); el.classList.add('text-red-600');
      } else if (res != null && totalPages) {
        el.textContent = `Selected ${res} of ${totalPages} pages.`;
        el.classList.remove('text-red-600'); el.classList.add('opacity-70');
      } else {
        el.textContent = '';
      }
    }

    // If n-up > 1 and duplex off? Just allow, but page math handles it.
    // If n-up > 1 and scale actual may clip — keep as is (shops handle fitting).

    // ---------- Summary init ----------
    function updateSummary() { refreshPreviewMeta(); updateRangeHint(); }

    // ---------- Continue → Review ----------
    function goReview(e) {
      if (e) e.preventDefault();
      const f = new FormData($('#cfg'));
      const next = new URL('./review.html', location.href);
      next.searchParams.set('shopId', state.shopId);
      if (state.noteId) next.searchParams.set('noteId', state.noteId);
      if (state.pages) next.searchParams.set('pages', state.pages);
      if (state.size) next.searchParams.set('size', state.size);
      const settings = Object.fromEntries(f.entries());
      next.searchParams.set('settings', encodeURIComponent(JSON.stringify(settings)));
      location.href = next.toString();
    }

    // ---------- Defaults / Presets / Events ----------
    document.addEventListener('DOMContentLoaded', () => {
      // Put initial summary + meta
      refreshPreviewMeta();
      applyShopCapabilities();

      // Wire form reactions
      $('#cfg').addEventListener('input', updateSummary);
      $('#cfg').addEventListener('change', updateSummary);

      // Enable/disable range inputs based on selection
      $('#cfg').addEventListener('change', (e) => {
        if (e.target && e.target.name === 'range_mode') {
          const mode = e.target.value;
          const rangeInput = $('#cfg [name="page_range"]');
          const singleInput = $('#cfg [name="single_page"]');
          if (mode === 'range') {
            rangeInput.disabled = false; singleInput.disabled = true; singleInput.value = '';
          } else if (mode === 'single') {
            rangeInput.disabled = true; rangeInput.value = ''; singleInput.disabled = false;
          } else {
            rangeInput.disabled = true; rangeInput.value = ''; singleInput.disabled = true; singleInput.value = '';
          }
          updateSummary();
        }
      });

      // Presets
      $$('.preset').forEach(b => b.addEventListener('click', () => applyPreset(b.dataset.preset)));
      $('#applyDefaults').addEventListener('click', () => {
        $('#cfg').reset();
        updateSummary();
      });

      // Pages-per-sheet mega dropdown
      (function initNupPicker() {
        const btn = document.getElementById('nupPickerBtn');
        const panel = document.getElementById('nupPanel');
        const select = document.getElementById('n_up_select');
        const label = document.getElementById('nupSelectedLabel');
        if (!btn || !panel || !select || !label) return;

        const setLabel = () => { label.textContent = `${select.value || '1'} per sheet`; };
        setLabel();

        const open = () => { panel.classList.remove('hidden'); };
        const close = () => { panel.classList.add('hidden'); };
        const toggle = () => { panel.classList.toggle('hidden'); };
        btn.addEventListener('click', toggle);
        document.addEventListener('click', (e) => {
          if (!panel.classList.contains('hidden')) {
            const wrap = document.getElementById('nupPicker');
            if (wrap && !wrap.contains(e.target)) close();
          }
        });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

        panel.querySelectorAll('.nupTile').forEach(el => {
          el.addEventListener('click', () => {
            const v = el.getAttribute('data-value');
            if (v) { select.value = v; setLabel(); updateSummary(); close(); }
          });
        });

        // Keep UI in sync when n_up changes programmatically (e.g., preset)
        select.addEventListener('change', () => { setLabel(); updateSummary(); });
      })();

      // Orientation mega dropdown
      (function initOrientationPicker() {
        const btn = document.getElementById('oriPickerBtn');
        const panel = document.getElementById('oriPanel');
        const select = document.getElementById('orientation_select');
        const label = document.getElementById('oriSelectedLabel');
        if (!btn || !panel || !select || !label) return;

        const setLabel = () => {
          label.textContent = select.value === 'horizontal' ? 'Horizontal' : 'Vertical (default)';
        };
        setLabel();

        const close = () => panel.classList.add('hidden');
        const toggle = () => panel.classList.toggle('hidden');
        btn.addEventListener('click', toggle);
        document.addEventListener('click', (e) => {
          if (!panel.classList.contains('hidden')) {
            const wrap = document.getElementById('oriPicker');
            if (wrap && !wrap.contains(e.target)) close();
          }
        });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

        panel.querySelectorAll('.oriTile').forEach(el => {
          el.addEventListener('click', () => {
            const v = el.getAttribute('data-value');
            if (v) { select.value = v; setLabel(); updateSummary(); close(); }
          });
        });

        // Keep UI in sync when selection changes programmatically
        select.addEventListener('change', () => { setLabel(); updateSummary(); });
      })();

      // Continue
      $('#continue').addEventListener('click', goReview);

      // Keyboard shortcut
      document.addEventListener('keydown', (ev) => {
        if ((ev.ctrlKey || ev.metaKey) && ev.key === 'Enter') goReview();
      });

      // Populate preview meta panel header
      const meta = [];
      if (state.pages) meta.push(`${state.pages} pages total`);
      $('#previewMeta').textContent = meta.join(' • ');
    });
