// Extracted from ui/allowed_domains.html (inline <script> #3).
        (function () {
            const API = (window.__API_BASE || window.API_BASE || ((typeof location !== 'undefined' && location.origin) ? location.origin : 'http://0.0.0.0:10000')).replace(/\/$/, '');
            const sel = id => document.getElementById(id);
            const degreeSelect = sel('degreeSelect');
            const degreeInput = sel('degreeInput');
            const domainInput = sel('domainInput');
            const addBtn = sel('addBtn');
            const saveBtn = sel('saveBtn');
            const exportBtn = sel('exportBtn');
            const importBtn = sel('importBtn');
            const importFile = sel('importFile');
            const listEl = sel('domainsList');
            const tableBody = sel('degTable');
            const status = sel('status');
            const apiBanner = sel('apiBanner');
            const apiBaseTxt = sel('apiBaseTxt');

            const COMMON = ['B.Tech', 'M.Tech', 'MBBS', 'BSc', 'BBA', 'BCA', 'MSc', 'MBA', 'BE', 'ME'];
            const state = { degreeLabel: '', domains: [] };

            function setStatus(text) { status.textContent = text; }

            function getDegreeLabel() {
                return String((degreeInput.value || degreeSelect.value || state.degreeLabel || '')).trim();
            }

            function renderDomains() {
                listEl.innerHTML = '';
                if (!state.domains.length) {
                    listEl.innerHTML = '<p class="text-sm text-neutral-500 dark:text-white/60">No domains added yet.</p>';
                    return;
                }
                state.domains.forEach((d, idx) => {
                    const chip = document.createElement('span');
                    chip.className = 'inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/15 bg-white/80 dark:bg-white/10 px-3 py-1.5 text-sm';
                    chip.innerHTML = '<span class="text-neutral-800 dark:text-white/90">' + d + '</span>';
                    const x = document.createElement('button');
                    x.className = 'inline-flex items-center justify-center rounded-full p-1 text-neutral-500 hover:text-brand-500';
                    x.innerHTML = '<span class="material-symbols-rounded text-sm">close</span>';
                    x.title = 'Remove';
                    x.onclick = function () {
                        const label = getDegreeLabel();
                        // Immediate persist if we have a degree label
                        if (label) {
                            fetch(API + '/api/notes/allowed-domains?degree=' + encodeURIComponent(label) + '&domain=' + encodeURIComponent(d), { method: 'DELETE' })
                                .then(r => r.ok ? r.json() : Promise.reject())
                                .then(() => { state.domains.splice(idx, 1); renderDomains(); showToast('Removed'); })
                                .catch(() => { showToast('Delete failed', 'error'); });
                        } else {
                            state.domains.splice(idx, 1); renderDomains();
                        }
                    };
                    chip.appendChild(x);
                    listEl.appendChild(chip);
                });
            }

            function renderDegreeSelect(list) {
                degreeSelect.innerHTML = '';
                const optNew = document.createElement('option'); optNew.value = ''; optNew.textContent = '— Select existing —';
                degreeSelect.appendChild(optNew);
                (list || []).forEach(d => {
                    const opt = document.createElement('option');
                    opt.value = d.degree_label || d.degree_key;
                    opt.textContent = (d.degree_label || d.degree_key) + ' (' + (d.domains?.length || 0) + ')';
                    degreeSelect.appendChild(opt);
                });
                const grp = document.createElement('optgroup'); grp.label = 'Common';
                COMMON.forEach(n => { const o = document.createElement('option'); o.value = n; o.textContent = n; grp.appendChild(o); });
                degreeSelect.appendChild(grp);
            }

            function renderDegreesTable(list) {
                tableBody.innerHTML = '';
                (list || []).forEach(d => {
                    const tr = document.createElement('tr');
                    tr.className = 'hover:bg-black/5 dark:hover:bg-white/5';
                    const td1 = document.createElement('td'); td1.className = 'px-4 py-2'; td1.textContent = d.degree_label || d.degree_key; tr.appendChild(td1);
                    const td2 = document.createElement('td'); td2.className = 'px-4 py-2'; td2.textContent = (d.domains || []).join(', '); tr.appendChild(td2);
                    const td3 = document.createElement('td'); td3.className = 'px-4 py-2 text-right';
                    const btn = document.createElement('button');
                    btn.className = 'inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/15 bg-white/80 dark:bg-white/10 px-3 py-1.5 text-xs font-medium hover:border-brand-500/50';
                    btn.innerHTML = '<span class="material-symbols-rounded text-base">download</span>Load';
                    btn.onclick = function () { loadDegree(d.degree_label || d.degree_key); };
                    td3.appendChild(btn); tr.appendChild(td3);
                    tableBody.appendChild(tr);
                });
            }

            function normalizeHost(input) {
                let v = String(input || '').trim();
                if (!v) return '';
                try { if (v.includes('://')) v = new URL(v).host; } catch (_) { }
                v = v.replace(/^\*+/, '').toLowerCase();
                return v;
            }

            function syncDegree(label, domains) {
                state.degreeLabel = label || '';
                state.domains = (domains || []).slice();
                degreeInput.value = state.degreeLabel;
                renderDomains();
            }

            function loadDegree(label) {
                if (!label) return;
                setStatus('Loading …');
                fetch(API + '/api/notes/allowed-domains?degree=' + encodeURIComponent(label))
                    .then(r => r.json()).then(data => {
                        syncDegree(label, data.domains || []);
                        setStatus('Loaded. Edit and Save to update.');
                    }).catch(() => setStatus('Failed to load.'));
            }

            function refreshList() {
                if (apiBaseTxt) apiBaseTxt.textContent = API || '(unset)';
                fetch(API + '/api/notes/degrees')
                    .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
                    .then(list => { apiBanner && apiBanner.classList.add('hidden'); renderDegreeSelect(list); renderDegreesTable(list); })
                    .catch(() => { apiBanner && apiBanner.classList.remove('hidden'); });
            }

            addBtn.onclick = function () {
                const v = normalizeHost(domainInput.value);
                if (!v) return;
                if (!state.domains.includes(v)) state.domains.push(v);
                domainInput.value = ''; renderDomains();
            };

            saveBtn.onclick = function () {
                const label = String(degreeInput.value || degreeSelect.value || '').trim();
                if (!label) { alert('Enter or select a degree label'); return; }
                setStatus('Saving …'); saveBtn.disabled = true;
                fetch(API + '/api/notes/allowed-domains', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ degree_label: label, domains: state.domains })
                }).then(r => r.json()).then(() => {
                    setStatus('Saved.'); saveBtn.disabled = false; refreshList(); showToast('Saved');
                }).catch(() => { setStatus('Failed to save.'); saveBtn.disabled = false; });
            };

            degreeSelect.onchange = function () { const label = degreeSelect.value; if (label) loadDegree(label); };

            // Export/import
            exportBtn.onclick = function () {
                fetch(API + '/api/notes/degrees')
                    .then(r => r.json())
                    .then(list => {
                        const blob = new Blob([JSON.stringify(list || [], null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url; a.download = 'paperx-allowed-domains.json'; a.click();
                        setTimeout(() => URL.revokeObjectURL(url), 1000);
                    })
                    .catch(() => showToast('Export failed', 'error'));
            };

            importBtn.onclick = function () { importFile.click(); };
            importFile.addEventListener('change', function () {
                const f = importFile.files && importFile.files[0];
                if (!f) return;
                const reader = new FileReader();
                reader.onload = function () {
                    try {
                        const data = JSON.parse(String(reader.result || '[]'));
                        if (!Array.isArray(data)) throw new Error('Invalid format');
                        const tasks = data.map(entry => {
                            const label = String(entry.degree_label || entry.degree_key || '').trim();
                            const domains = Array.isArray(entry.domains) ? entry.domains : [];
                            if (!label || !domains.length) return Promise.resolve();
                            return fetch(API + '/api/notes/allowed-domains', {
                                method: 'POST', headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ degree_label: label, domains })
                            }).then(r => r.ok ? r.json() : Promise.reject());
                        });
                        Promise.all(tasks).then(() => { showToast('Import complete'); refreshList(); })
                            .catch(() => showToast('Import failed', 'error'));
                    } catch (_) {
                        showToast('Invalid JSON', 'error');
                    } finally {
                        importFile.value = '';
                    }
                };
                reader.readAsText(f);
            });

            // init
            renderDegreeSelect([]); renderDegreesTable([]); refreshList();
        })();
