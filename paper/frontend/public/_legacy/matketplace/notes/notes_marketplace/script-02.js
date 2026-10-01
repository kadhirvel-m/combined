// Extracted from ui/matketplace/notes/notes_marketplace.html (inline <script> #2).
        // Utilities
        const el = (sel, root = document) => root.querySelector(sel);
        const els = (sel, root = document) => [...root.querySelectorAll(sel)];

        // Unified theme toggle (mirrors index/about)
        (function () {
            const root = document.documentElement;
            const toggles = () => Array.from(document.querySelectorAll('[data-theme-toggle]'));
            const updateIcons = (mode) => toggles().forEach(btn => { const ic = btn.querySelector('.material-symbols-rounded'); if (ic) ic.textContent = mode === 'dark' ? 'light_mode' : 'dark_mode'; });
            const setTheme = (mode) => { mode === 'dark' ? root.classList.add('dark') : root.classList.remove('dark'); localStorage.setItem('px_theme', mode); updateIcons(mode); };
            // Initialize icon state
            setTheme(root.classList.contains('dark') ? 'dark' : 'light');
            document.addEventListener('click', e => { const t = e.target.closest('[data-theme-toggle]'); if (!t) return; setTheme(root.classList.contains('dark') ? 'light' : 'dark'); });
        })();

        // API base resolver
        async function resolveApiBase(retries = 10) {
            const base = (window.__API_BASE || window.API_BASE || '').replace(/\/$/, '');
            if (base) return base;
            if (retries <= 0) return '';
            return new Promise(res => setTimeout(() => res(resolveApiBase(retries - 1)), 100));
        }
        let apiBase;
        function getAuthToken() {
            const keys = ['px_token', 'sb-access-token', 'supabase.auth.token'];
            for (const k of keys) { try { const v = localStorage.getItem(k); if (v) return v; } catch { } }
            return '';
        }

        // Fetch helpers
        async function fetchJSON(url, headers = {}) {
            try {
                const r = await fetch(url, { headers });
                if (!r.ok) return null; return await r.json();
            } catch { return null; }
        }

        async function fetchNotes(params = {}) {
            const qs = new URLSearchParams(params).toString();
            const token = getAuthToken();
            const url = `${apiBase}/api/marketplace/notes${qs ? ('?' + qs) : ''}`;
            let r;
            try {
                r = await fetch(url, { cache: 'no-store', headers: token ? { 'Authorization': 'Bearer ' + token } : {} });
            } catch (e) {
                console.error('Network error listing notes', e);
                return { items: [], total: 0 };
            }
            if (!r.ok) {
                let msg = 'List failed';
                try { const j = await r.json(); msg = j.detail || msg; } catch { }
                console.warn('Marketplace list error:', msg);
                showAlert(msg);
                return { items: [], total: 0 };
            }
            try { return await r.json(); } catch { return { items: [], total: 0 }; }
        }

        // UI state
        let state = {
            scope: 'all',
            view: 'grid',
            page: 1,
            page_size: 24,
            sort: 'relevance'
        };

        // Controls wiring
        el('#viewGrid').addEventListener('click', () => switchView('grid'));
        el('#viewList').addEventListener('click', () => switchView('list'));
        el('#sortBy').addEventListener('change', () => { state.sort = el('#sortBy').value; load(true); });
        els('.scope-btn').forEach(b => b.addEventListener('click', () => { state.scope = b.value; highlightScopes(); load(true); }));

        // Quick chips (attach handlers only if the buttons exist)
        ['quickFree', 'quickTop', 'quickNew'].forEach(id => {
            const btn = el('#' + id);
            if (!btn) return;
            btn.addEventListener('click', () => {
                if (id === 'quickFree') state.scope = 'free';
                if (id === 'quickTop') state.scope = 'top';
                if (id === 'quickNew') state.scope = 'new';
                highlightScopes();
                load(true);
            });
        });

        function highlightScopes() {
            els('.scope-btn').forEach(b => {
                const active = b.value === state.scope;
                b.classList.toggle('bg-white/70', active);
                b.classList.toggle('dark:bg-white/10', active);
                b.classList.toggle('ring-1', true);
                b.classList.toggle('ring-black/10', true);
                b.classList.toggle('dark:ring-white/15', true);
            });
        }

        function switchView(v) {
            state.view = v;
            el('#viewGrid').classList.toggle('bg-brand-500/10', v === 'grid');
            el('#viewList').classList.toggle('bg-brand-500/10', v === 'list');
            el('#notesGrid').classList.toggle('hidden', v !== 'grid');
            el('#notesList').classList.toggle('hidden', v !== 'list');
        }

        // Alert helper
        function showAlert(msg) {
            const bar = el('#alertBar');
            bar.textContent = msg; bar.classList.remove('hidden');
            setTimeout(() => bar.classList.add('hidden'), 3000);
        }

        // Renderers
        function renderSkeletons() {
            const grid = el('#notesGrid');
            const tpl = el('#skeletonCardTpl');
            grid.innerHTML = '';
            for (let i = 0; i < 8; i++) grid.appendChild(tpl.content.cloneNode(true));
            el('#notesList').innerHTML = '';
            el('#emptyState').classList.add('hidden');
        }

        function renderNotes(items = [], total = 0) {
            el('#statCount').textContent = `${total || items.length} items`;
            const grid = el('#notesGrid');
            const list = el('#notesList');
            grid.innerHTML = ''; list.innerHTML = '';
            if (!items.length) { el('#emptyState').classList.remove('hidden'); el('#pager').hidden = true; return; }
            el('#emptyState').classList.add('hidden');
            const cardTpl = el('#noteCardTpl');
            const rowTpl = el('#noteRowTpl');
            items.forEach(n => {
                const priceText = (n.price_cents || 0) === 0 ? 'Free' : `₹${(n.price_cents / 100).toFixed(0)}`;
                const subjArr = [n.subject, n.unit, n.exam_type].filter(Boolean);
                const subjHtml = subjArr.map(x => `<span class="px-2 py-0.5 rounded-full ring-1 ring-black/10 dark:ring-white/15">${x}</span>`).join('');
                const ratingTxt = n.rating_count ? `★ ${Number(n.avg_rating).toFixed(1)} (${n.rating_count})` : '';
                const detailsHref = `./note_detail.html?id=${n.id}`;
                const frag = cardTpl.content.cloneNode(true);
                const q = (s) => frag.querySelector(s);
                const titleEl = q('h3.title, .title, h3'); if (titleEl) titleEl.textContent = n.title;
                const priceEl = q('.priceChip'); if (priceEl) priceEl.textContent = priceText;
                const descEl = q('.desc, .note-desc'); if (descEl) descEl.textContent = n.description || '';
                // Cover image
                // Cover image intentionally removed per requirement; placeholder height kept minimal.
                const metaEl = q('.meta, .metaTags'); if (metaEl) metaEl.innerHTML = subjHtml;
                const ratingEl = q('.rating'); if (ratingEl) ratingEl.textContent = ratingTxt;
                const detailsEl = q('.detailsLink'); if (detailsEl) detailsEl.href = detailsHref;
                const iconLink = q('.detailsIconLink'); if (iconLink) iconLink.href = detailsHref;
                const acadEl = q('.academicChips'); if (acadEl) {
                    const chips = [];
                    if (n.college_code || n.college_abbrev) chips.push(n.college_code || n.college_abbrev);
                    if (n.degree_name) chips.push(n.degree_name);
                    if (n.department_name) chips.push(n.department_name);
                    if (n.batch_from && n.batch_to) chips.push(`${n.batch_from}-${n.batch_to}`); else if (n.batch_range) chips.push(n.batch_range);
                    if (n.semester) chips.push('Sem ' + n.semester);
                    acadEl.innerHTML = chips.map(c => `<span class="px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[10px]">${c}</span>`).join('');
                }
                if (n.seller && n.seller.id) {
                    const sellerWrap = q('.seller');
                    if (sellerWrap) {
                        sellerWrap.classList.remove('hidden');
                        const nameLink = sellerWrap.querySelector('[data-profile-link-name]');
                        const avatar = sellerWrap.querySelector('[data-avatar]');
                        const initial = sellerWrap.querySelector('[data-initial]');
                        const s = n.seller;
                        const profUrl = s.profile_href ? (s.profile_href.startsWith('http') ? s.profile_href : `../../teacher_profile.html?user=${encodeURIComponent(s.id)}`) : (s.is_teacher ? `../../teacher_profile.html?user=${encodeURIComponent(s.id)}` : `../../staff_profile.html?user=${encodeURIComponent(s.id)}`);
                        if (nameLink) { nameLink.href = profUrl; nameLink.textContent = s.name || 'User'; }
                        if (initial) initial.textContent = (s.name || 'U').trim().charAt(0).toUpperCase() || 'U';
                        if (s.avatar_url && avatar) { avatar.src = s.avatar_url; avatar.classList.remove('hidden'); if (initial) initial.classList.add('hidden'); }
                        // Teacher badge with text
                        if (s.is_teacher && nameLink && !sellerWrap.querySelector('.teacher-badge')) {
                            nameLink.insertAdjacentHTML('afterend', '<span class="teacher-badge inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 ring-1 ring-emerald-500/30"><span class="material-symbols-rounded text-[13px] leading-none">verified</span><span>Teacher</span></span>');
                        }
                    }
                }
                grid.appendChild(frag);
                const rowFrag = rowTpl.content.cloneNode(true);
                const rq = (s) => rowFrag.querySelector(s);
                const rTitle = rq('.title, .row-title'); if (rTitle) rTitle.textContent = n.title;
                const rPrice = rq('.priceChip, .row-price'); if (rPrice) rPrice.textContent = priceText;
                const rDesc = rq('.desc, .row-desc'); if (rDesc) rDesc.textContent = n.description || '';
                const rMeta = rq('.meta, .row-meta'); if (rMeta) rMeta.innerHTML = subjHtml;
                const rRating = rq('.rating, .row-rating'); if (rRating) rRating.textContent = ratingTxt;
                const rLink = rq('.detailsLink, .row-link'); if (rLink) rLink.href = detailsHref;
                list.appendChild(rowFrag);
            });
            el('#pager').hidden = true;
        }

        // Load orchestration
        let loadTimer = null;
        async function load(immediate = false) {
            const exec = async () => {
                if (!apiBase) apiBase = await resolveApiBase();
                renderSkeletons();
                const params = buildParams();
                const data = await fetchNotes(params);
                renderNotes(data.items || [], data.total || 0);
            };
            if (immediate) return exec();
            if (loadTimer) cancelAnimationFrame(loadTimer);
            loadTimer = requestAnimationFrame(exec);
        }

        function buildParams() {
            const params = { page: state.page, page_size: state.page_size, sort: state.sort };
            const qv = el('#q').value.trim(); if (qv) params.q = qv;
            const min = el('#minPrice').value; if (min) params.min_price = min;
            const max = el('#maxPrice').value; if (max) params.max_price = max;
            const col = el('#collegeFilter').value; if (col) params.college_id = col;
            const deg = el('#degreeFilter').value; if (deg) params.degree_id = deg;
            const dep = el('#deptFilter').value; if (dep) params.department_id = dep;
            const bat = el('#batchFilter').value; if (bat) params.batch_id = bat;
            const sem = el('#semFilter').value; if (sem) params.semester = sem;
            if (state.scope === 'free') { params.max_price = 0; }
            if (state.scope === 'top') { params.sort = 'rating'; }
            if (state.scope === 'new') { params.sort = 'newest'; }
            // Quick chips -> map to tags
            const tags = els('.chip.active').map(c => c.value);
            if (tags.length) params.tags = tags.join(',');
            return params;
        }

        // Search on Enter
        el('#q').addEventListener('keydown', (e) => { if (e.key === 'Enter') load(true); });

        // Apply/Clear
        el('#applyFilters').addEventListener('click', () => load(true));
        el('#clearAll').addEventListener('click', () => { els('input, select', el('#inlineFilters') || document).forEach(x => { if (x.tagName === 'SELECT') x.selectedIndex = 0; else x.value = ''; }); els('.chip').forEach(c => c.classList.remove('active')); state.scope = 'all'; highlightScopes(); load(true); });

        // Chips toggle
        document.addEventListener('click', e => { const c = e.target.closest('.chip'); if (!c) return; c.classList.toggle('active'); });

        // Mobile drawer
        const drawer = el('#filterDrawer');
        const sidebar = el('#inlineFilters') || el('#sidebarFilters');
        el('#openFilters').addEventListener('click', () => { // clone filters into drawer
            const host = el('#drawerFilters'); host.innerHTML = '';
            if (sidebar) host.appendChild(sidebar.cloneNode(true));
            drawer.classList.remove('hidden');
        });
        el('#closeFilters').addEventListener('click', () => drawer.classList.add('hidden'));
        el('#closeFiltersBtn').addEventListener('click', () => drawer.classList.add('hidden'));
        el('#drawerClear').addEventListener('click', () => { els('input, select', drawer).forEach(x => { if (x.tagName === 'SELECT') x.selectedIndex = 0; else x.value = ''; }); els('.chip', drawer).forEach(c => c.classList.remove('active')); });
        el('#drawerApply').addEventListener('click', () => { drawer.classList.add('hidden'); load(true); });

        // Academic cascading filters
        const collegeSel = document.getElementById('collegeFilter');
        const degreeSel = document.getElementById('degreeFilter');
        const deptSel = document.getElementById('deptFilter');
        const batchSel = document.getElementById('batchFilter');
        const semSel = document.getElementById('semFilter');
        function clearSel(sel, label, disable = true) { sel.innerHTML = `<option value="">${label}</option>`; sel.disabled = disable; }

        async function loadColleges() {
            if (!apiBase) apiBase = await resolveApiBase();
            clearSel(collegeSel, 'College', false);
            const data = await fetchJSON(`${apiBase}/api/colleges`);
            if (Array.isArray(data)) data.forEach(c => { const o = document.createElement('option'); o.value = c.id; o.textContent = c.name; collegeSel.appendChild(o); });
        }
        async function loadDegrees(collegeId) {
            clearSel(degreeSel, 'Degree'); clearSel(deptSel, 'Department'); clearSel(batchSel, 'Batch'); clearSel(semSel, 'Semester');
            if (!collegeId) return; degreeSel.disabled = false; deptSel.disabled = true; batchSel.disabled = true; semSel.disabled = true;
            const data = await fetchJSON(`${apiBase}/api/colleges/${collegeId}/degrees`);
            if (Array.isArray(data)) data.forEach(d => { const o = document.createElement('option'); o.value = d.id; o.textContent = d.name; degreeSel.appendChild(o); });
        }
        async function loadDepartments(collegeId) {
            clearSel(deptSel, 'Department'); clearSel(batchSel, 'Batch'); clearSel(semSel, 'Semester');
            if (!collegeId) return; deptSel.disabled = false;
            const data = await fetchJSON(`${apiBase}/api/colleges/${collegeId}/departments/full`);
            if (Array.isArray(data)) data.forEach(d => { const o = document.createElement('option'); o.value = d.id; o.textContent = d.name; deptSel.appendChild(o); });
        }
        async function loadBatches(collegeId, deptName) {
            clearSel(batchSel, 'Batch'); clearSel(semSel, 'Semester');
            if (!collegeId || !deptName) return; batchSel.disabled = false;
            const data = await fetchJSON(`${apiBase}/api/colleges/${collegeId}/departments/${encodeURIComponent(deptName)}/batches/full`);
            if (Array.isArray(data)) data.forEach(b => { const o = document.createElement('option'); const from = b.from_year ?? b.from; const to = b.to_year ?? b.to; o.value = b.id || `${from}-${to}`; o.textContent = (Number.isInteger(from) && Number.isInteger(to)) ? `${from}-${to}` : (b.range || 'Batch'); batchSel.appendChild(o); });
        }
        function enableSemester() { clearSel(semSel, 'Semester', false); for (let i = 1; i <= 8; i++) { const o = document.createElement('option'); o.value = String(i); o.textContent = String(i); semSel.appendChild(o); } }

        collegeSel.addEventListener('change', e => { const v = e.target.value; loadDegrees(v); loadDepartments(v); });
        deptSel.addEventListener('change', e => { const deptTxt = deptSel.options[deptSel.selectedIndex]?.textContent; loadBatches(collegeSel.value, deptTxt); });
        batchSel.addEventListener('change', () => { enableSemester(); });

        // Initial boot
        document.addEventListener('DOMContentLoaded', () => { switchView('grid'); highlightScopes(); loadColleges(); load(true); });
