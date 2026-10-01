// Extracted from ui/teachers/notes/notes_marketplace.html (inline <script> #3).
    const API_BASE = (window.API_BASE || location.origin);
    const token = localStorage.getItem('teacherToken') || localStorage.getItem('userToken') || null;
    const els = {
      search: document.getElementById('searchInput'),
      searchMobile: document.getElementById('searchInputMobile'),
      notesGrid: document.getElementById('notesGrid'),
      resultsCount: document.getElementById('resultsCount'),
      loading: document.getElementById('loadingState'),
      empty: document.getElementById('emptyState'),
      error: document.getElementById('errorState'),
      priceRangeHint: document.getElementById('priceRangeHint')
    };
    const filterEls = {
      subject: document.getElementById('filterSubject'),
      examType: document.getElementById('filterExamType'),
      semester: document.getElementById('filterSemester'),
      category: document.getElementById('filterCategory'),
      seller: document.getElementById('filterSeller'),
      minPrice: document.getElementById('minPrice'),
      maxPrice: document.getElementById('maxPrice')
    };
    let metaCache = null; let debounceTimer = null;

    function opt(label, value = '') { const o = document.createElement('option'); o.value = value; o.textContent = label; return o; }
    function clearOptions(sel) { while (sel.firstChild) sel.removeChild(sel.firstChild); }
    function setStatus(state) {
      els.loading.classList.toggle('hidden', state !== 'loading');
      els.empty.classList.add('hidden');
      els.error.classList.add('hidden');
      if (state === 'error') els.error.classList.remove('hidden');
      if (state === 'empty') els.empty.classList.remove('hidden');
    }

    async function fetchJSON(url, opts = {}) { const res = await fetch(url, opts); const txt = await res.text(); let data = {}; try { data = txt ? JSON.parse(txt) : {}; } catch { data = { detail: txt }; } if (!res.ok) { const err = new Error(data.detail || 'Request failed'); err.status = res.status; err.data = data; throw err; } return data; }

    function populateFilters(meta) {
      clearOptions(filterEls.subject); filterEls.subject.appendChild(opt('Any', ''));
      meta.subjects.forEach(s => filterEls.subject.appendChild(opt(s, s)));
      clearOptions(filterEls.examType); filterEls.examType.appendChild(opt('Any', ''));
      meta.exam_types.forEach(s => filterEls.examType.appendChild(opt(s, s)));
      clearOptions(filterEls.semester); filterEls.semester.appendChild(opt('Any', ''));
      meta.semesters.forEach(s => filterEls.semester.appendChild(opt(String(s), String(s))));
      clearOptions(filterEls.category); filterEls.category.appendChild(opt('Any', ''));
      meta.categories.forEach(s => filterEls.category.appendChild(opt(s, s)));
      clearOptions(filterEls.seller); filterEls.seller.appendChild(opt('Any', ''));
      meta.sellers.forEach(s => filterEls.seller.appendChild(opt(s.name, s.id)));
      if (meta.price_range) { els.priceRangeHint.textContent = `Range: ₹${meta.price_range.min} - ₹${meta.price_range.max}`; filterEls.minPrice.placeholder = meta.price_range.min; filterEls.maxPrice.placeholder = meta.price_range.max; }
    }

    function buildQuery() { const p = new URLSearchParams(); const q = (els.search.value || els.searchMobile.value || '').trim(); if (q) p.set('q', q); const map = [['subject', filterEls.subject.value], ['exam_type', filterEls.examType.value], ['semester', filterEls.semester.value], ['min_price', filterEls.minPrice.value], ['max_price', filterEls.maxPrice.value]]; map.forEach(([k, v]) => { if (v) p.set(k, v); }); return p.toString(); }

    async function loadNotes() { setStatus('loading'); els.notesGrid.innerHTML = ''; try { const qs = buildQuery(); const data = await fetchJSON(`${API_BASE}/api/marketplace/notes${qs ? `?${qs}` : ''}`); renderNotes(data.items || []); if (!data.items?.length) { setStatus('empty'); } else { setStatus('loaded'); } els.resultsCount.textContent = `(${data.total})`; } catch (e) { els.error.textContent = e.message; setStatus('error'); } }

    function renderNotes(items) {
      els.notesGrid.innerHTML = ''; items.forEach(n => {
        const card = document.createElement('a'); card.href = `note_detail.html?id=${encodeURIComponent(n.id)}`; card.className = 'group block rounded-2xl bg-white/80 dark:bg-brand-900/50 backdrop-blur ring-1 ring-black/10 dark:ring-white/10 p-4 hover:shadow-glow transition relative'; const price = (n.price_cents || 0) > 0 ? `<span class="text-xs font-semibold text-brand-500">₹${(n.price_cents / 100).toFixed(0)}</span>` : `<span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 ring-1 ring-emerald-500/30">Free</span>`; const seller = n.seller ? `<span class="text-[11px] text-neutral-500 dark:text-white/40">${n.seller.name}</span>` : ''; card.innerHTML = `<div class="flex flex-col h-full">
  <div class="flex-1">
    <h3 class="font-semibold text-sm leading-snug mb-1 line-clamp-2">${escapeHtml(n.title || 'Untitled')}</h3>
    <p class="text-[11px] text-neutral-600 dark:text-white/50 line-clamp-2 mb-2">${escapeHtml(n.description || '')}</p>
  </div>
  <div class="flex items-center justify-between mt-2">${price}${seller}</div>
  <div class="mt-1 flex flex-wrap gap-1">${badge(n.subject)}${badge(n.exam_type)}${badge(n.semester ? `Sem ${n.semester}` : '')}</div>
</div>`; els.notesGrid.appendChild(card);
      });
    }

    function badge(txt) { if (!txt) return ''; return `<span class="text-[10px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-700 dark:text-brandlt-200 ring-1 ring-brand-500/20">${escapeHtml(txt)}</span>`; }
    function escapeHtml(s) { return (s || '').replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c])); }

    async function init() {
      try { metaCache = await fetchJSON(`${API_BASE}/api/marketplace/notes/meta`); populateFilters(metaCache); } catch (e) { console.warn('meta failed', e); }
      loadNotes();
    }

    ['change', 'input'].forEach(ev => { Object.values(filterEls).forEach(el => el.addEventListener(ev, () => { clearTimeout(debounceTimer); debounceTimer = setTimeout(loadNotes, ev === 'input' ? 400 : 0); })); });
    [els.search, els.searchMobile].forEach(inp => inp && inp.addEventListener('input', () => { clearTimeout(debounceTimer); debounceTimer = setTimeout(loadNotes, 350); }));

    document.getElementById('resetFilters').addEventListener('click', () => { Object.values(filterEls).forEach(el => { if (el.tagName === 'SELECT') el.selectedIndex = 0; else el.value = ''; }); els.search.value = ''; if (els.searchMobile) els.searchMobile.value = ''; loadNotes(); });

    document.addEventListener('click', e => { if (e.target.matches('[data-theme-toggle]')) { const root = document.documentElement; const dark = root.classList.toggle('dark'); localStorage.setItem('px_theme', dark ? 'dark' : 'light'); } });

    init();
