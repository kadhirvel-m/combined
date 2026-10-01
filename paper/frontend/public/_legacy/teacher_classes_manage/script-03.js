// Extracted from ui/teacher_classes_manage.html (inline <script> #3).
        const API_BASE = (window.API_BASE || 'http://0.0.0.0:10000').replace(/\/$/, '');
        function getToken() { const keys = ['px_token', 'teacherToken', 'userToken', 'sb-access-token', 'supabase.auth.token']; for (const k of keys) { try { const v = localStorage.getItem(k); if (v) return v; } catch { } } return '' }
        function setThemeToggle() { document.addEventListener('click', e => { if (e.target.closest('[data-theme-toggle]')) { const r = document.documentElement; const d = r.classList.toggle('dark'); localStorage.setItem('px_theme', d ? 'dark' : 'light') } }) }
        function esc(s = '') { return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c])) }
        const els = { grid: document.getElementById('classesGrid'), empty: document.getElementById('classesEmpty'), err: document.getElementById('classesError'), form: document.getElementById('classForm'), status: document.getElementById('formStatus'), filter: document.getElementById('filterInput'), submitLabel: document.getElementById('submitLabel') };
        let editIdentitySnapshot = null;
        function norm(v) { return String(v ?? '').trim().toLowerCase(); }
        function getFormIdentity() {
            return {
                college_id: norm(els?.form?.college_id?.value),
                department_id: norm(document.getElementById('departmentSelect')?.value),
                batch_id: norm(document.getElementById('batchSelect')?.value),
                semester: norm(els?.form?.semester?.value),
                subject_id: norm(document.getElementById('subjectId')?.value),
                section: norm(els?.form?.section?.value),
            };
        }
        function setCreateMode(clearForm = false) {
            if (clearForm) {
                els.form.reset();
                const subjSel = document.getElementById('subjectSelect');
                if (subjSel) subjSel.innerHTML = '<option value="">Select batch & semester first</option>';
            }
            if (els?.form?.class_id) els.form.class_id.value = '';
            editIdentitySnapshot = null;
            els.submitLabel.textContent = 'Add Class';
        }
        function setEditModeFromRow(row) {
            editIdentitySnapshot = {
                college_id: norm(row?.college_id),
                department_id: norm(row?.department_id),
                batch_id: norm(row?.batch_id),
                semester: norm(row?.semester),
                subject_id: norm(row?.subject_id),
                section: norm(row?.section),
            };
            els.submitLabel.textContent = 'Update Class';
        }
        function didIdentityChangeSinceEdit() {
            if (!editIdentitySnapshot) return false;
            const cur = getFormIdentity();
            return Object.keys(editIdentitySnapshot).some(k => norm(cur[k]) !== norm(editIdentitySnapshot[k]));
        }
        async function fetchJSON(u, opts = {}, retries = 2) {
            try {
                const r = await fetch(u, opts);
                const t = await r.text();
                let d = {};
                try { d = t ? JSON.parse(t) : {}; } catch { d = { detail: t } }
                if (!r.ok) {
                    const e = new Error(d.detail || 'Request failed');
                    e.status = r.status; e.data = d;
                    throw e;
                }
                return d;
            } catch (err) {
                const isNetwork = (err instanceof TypeError) || /NetworkError|Failed to fetch|load failed|disconnected/i.test(String(err && err.message || ''));
                const status = err && err.status;
                const isTransient = isNetwork || (status && (status === 502 || status === 503 || status === 504));
                if (retries > 0 && isTransient) {
                    await new Promise(r => setTimeout(r, 400));
                    return fetchJSON(u, opts, retries - 1);
                }
                throw err;
            }
        }
        async function loadClasses() { els.grid.innerHTML = ''; els.empty.classList.add('hidden'); els.err.classList.add('hidden'); try { const data = await fetchJSON(API_BASE + '/api/teacher/classes/mine', { headers: { Authorization: 'Bearer ' + getToken() } }); const filter = (els.filter.value || '').toLowerCase(); const list = data.filter(c => !filter || (c.subject || '').toLowerCase().includes(filter)); if (!list.length) { els.empty.classList.remove('hidden'); return; } list.forEach(c => { els.grid.insertAdjacentHTML('beforeend', classCard(c)); }); } catch (e) { els.err.textContent = e.message; els.err.classList.remove('hidden'); } }
        function classCard(c) {
            const meta = [c.semester ? ('Sem ' + c.semester) : '', c.section ? ('Sec ' + esc(c.section)) : ''].filter(Boolean).join(' • '); return `<div class='group relative rounded-2xl ring-1 ring-black/10 dark:ring-white/10 bg-white/70 dark:bg-white/5 p-4 flex flex-col gap-3'>
  <div class='flex-1 min-w-0'>
    <h3 class='font-semibold text-sm leading-snug line-clamp-2 mb-1'>${esc(c.subject || 'Subject')}</h3>
    <p class='text-[11px] text-neutral-600 dark:text-white/50 min-h-[16px]'>${esc(meta)}</p>
    <p class='text-[11px] text-neutral-500 dark:text-white/40 line-clamp-3'>${esc(c.notes || '')}</p>
  </div>
  <div class='flex items-center justify-between text-[11px] opacity-70'>
    <span></span>
    <div class='flex items-center gap-2'>
      <button data-edit='${c.id}' class='px-2 py-1 rounded-md bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15'>Edit</button>
      <button data-del='${c.id}' class='px-2 py-1 rounded-md bg-red-500/15 text-red-600 dark:text-red-300 ring-1 ring-red-500/30 hover:bg-red-500/25'>Del</button>
    </div>
  </div>
</div>`}
        function formToPayload(f) { return ['subject', 'subject_id', 'semester', 'section', 'notes', 'batch_id', 'department_id', 'college_id'].reduce((o, k) => { let el = f[k]; if (!el) return o; let v = (el.value || '').trim(); if (!v) { o[k] = null; return o; } if (['semester'].includes(k)) v = Number(v); o[k] = v; return o; }, {}) }
        async function loadAcademics() {
            const tk = getToken(); if (!tk) return; const selDept = document.getElementById('departmentSelect'); const selBatch = document.getElementById('batchSelect'); const subjSel = document.getElementById('subjectSelect'); selDept.innerHTML = '<option value="">Loading...</option>'; selBatch.innerHTML = '<option value="">Loading...</option>'; subjSel.innerHTML = '<option value="">Select batch & semester first</option>';
            try {
                const data = await fetchJSON(API_BASE + '/api/teacher/academics/mine', { headers: { Authorization: 'Bearer ' + tk } });
                const { college_id, departments = [], batches = [], department_id, degree_id } = data;
                if (els?.form?.college_id) { els.form.college_id.value = college_id || ''; }
                const filtDeps = degree_id ? (departments || []).filter(d => String(d.degree_id) === String(degree_id)) : (departments || []);
                selDept.innerHTML = '<option value="">Select</option>' + filtDeps.map(d => `<option value="${esc(d.id)}">${esc(d.name)}</option>`).join('');
                if (department_id && filtDeps.some(d => d.id === department_id)) selDept.value = department_id;
                function refreshBatches() { const dept = selDept.value; const filt = (batches || []).filter(b => !dept || String(b.department_id) === String(dept)); selBatch.innerHTML = '<option value="">Select</option>' + filt.map(b => `<option value="${esc(b.id)}">${esc(b.label)}</option>`).join(''); subjSel.innerHTML = '<option value="">Select batch & semester first</option>'; document.getElementById('subjectId').value = ''; document.getElementById('subjectName').value = ''; }
                refreshBatches();
                selDept.addEventListener('change', () => { refreshBatches(); });
            } catch (e) { selDept.innerHTML = '<option value="">Error</option>'; selBatch.innerHTML = '<option value="">Error</option>'; subjSel.innerHTML = '<option value="">Error</option>'; }
        }
        async function loadSubjectsForSelection() {
            const subjSel = document.getElementById('subjectSelect');
            const batch = document.getElementById('batchSelect').value;
            const semEl = document.querySelector('[name="semester"]');
            const sem = ((semEl && semEl.value) || '').trim();
            if (!batch || !sem) { subjSel.innerHTML = '<option value="">Select batch & semester first</option>'; return; }
            subjSel.innerHTML = '<option value="">Loading...</option>';
            try {
                const items = await fetchJSON(`${API_BASE}/api/batches/${encodeURIComponent(batch)}/courses?semester=${encodeURIComponent(sem)}`);
                const opts = (items || []).map(c => ({ value: c.id, label: (c.course_code ? (c.course_code + ' — ' + (c.title || '')) : (c.title || 'Subject')), title: c.title || '', code: c.course_code || '' }));
                subjSel.innerHTML = '<option value="">Select a subject</option>' + opts.map(o => `<option value="${esc(o.value)}">${esc(o.label)}</option>`).join('');
            } catch (e) { subjSel.innerHTML = '<option value="">No subjects found</option>'; }
        }
        document.getElementById('subjectSelect').addEventListener('change', (e) => { const opt = e.target.selectedOptions && e.target.selectedOptions[0]; document.getElementById('subjectId').value = e.target.value || ''; document.getElementById('subjectName').value = (opt ? (opt.textContent || '').trim() : ''); });
        document.getElementById('batchSelect').addEventListener('change', loadSubjectsForSelection);
        (function(){ const semEl = document.querySelector('[name="semester"]'); if (!semEl) return; const handler = () => { clearTimeout(window.__sem_timer); window.__sem_timer = setTimeout(loadSubjectsForSelection, 150); }; semEl.addEventListener('input', handler); semEl.addEventListener('change', handler); })();
        els.form.addEventListener('submit', async e => { e.preventDefault(); const tk = getToken(); if (!tk) { alert('Login required'); return; } let id = els.form.class_id.value || null; const subjVal = (document.getElementById('subjectId').value || '').trim(); const subjName = (document.getElementById('subjectName').value || '').trim(); if (!subjVal || !subjName) { alert('Please select a subject'); return; } if (id && didIdentityChangeSinceEdit()) { id = null; if (els?.form?.class_id) els.form.class_id.value = ''; } els.status.textContent = 'Saving...'; const payload = formToPayload(els.form); try { let r; if (id) { r = await fetch(API_BASE + '/api/teacher/classes/' + encodeURIComponent(id), { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + tk }, body: JSON.stringify(payload) }); } else { r = await fetch(API_BASE + '/api/teacher/classes', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + tk }, body: JSON.stringify(payload) }); } const j = await r.json(); if (!r.ok) throw new Error(j.detail || 'Save failed'); els.status.textContent = 'Saved ✔'; setCreateMode(true); loadClasses(); } catch (err) { els.status.textContent = 'Error: ' + err.message; } });
        document.addEventListener('click', e => {
            if (e.target.matches('[data-edit]')) {
                const id = e.target.getAttribute('data-edit'); // fetch latest row before editing
                (async () => { try { const rows = await fetchJSON(API_BASE + '/api/teacher/classes/mine', { headers: { Authorization: 'Bearer ' + getToken() } }); const row = rows.find(r => r.id === id); if (!row) return; els.form.class_id.value = row.id; els.form.semester.value = row.semester || ''; els.form.section.value = row.section || ''; els.form.notes.value = row.notes || ''; if (row.department_id) document.getElementById('departmentSelect').value = row.department_id; if (row.batch_id && row.semester) { document.getElementById('batchSelect').value = row.batch_id; await loadSubjectsForSelection(); const subjSel = document.getElementById('subjectSelect'); if (row.subject_id) { subjSel.value = row.subject_id; document.getElementById('subjectId').value = row.subject_id; const opt = subjSel.selectedOptions && subjSel.selectedOptions[0]; document.getElementById('subjectName').value = (opt ? (opt.textContent || '').trim() : (row.subject || '')); } else { const opt = document.createElement('option'); opt.value = ''; opt.textContent = row.subject || 'Subject'; opt.selected = true; subjSel.prepend(opt); document.getElementById('subjectId').value = ''; document.getElementById('subjectName').value = row.subject || ''; } } else { document.getElementById('subjectSelect').innerHTML = '<option value="">Select batch & semester first</option>'; } setEditModeFromRow(row); window.scrollTo({ top: 0, behavior: 'smooth' }); } catch { } })();
            }
            if (e.target.matches('[data-del]')) { const id = e.target.getAttribute('data-del'); if (!confirm('Delete this class?')) return; (async () => { els.status.textContent = 'Deleting...'; try { const r = await fetch(API_BASE + '/api/teacher/classes/' + encodeURIComponent(id), { method: 'DELETE', headers: { Authorization: 'Bearer ' + getToken() } }); const j = await r.json(); if (!r.ok) throw new Error(j.detail || 'Delete failed'); els.status.textContent = 'Deleted'; loadClasses(); } catch (err) { els.status.textContent = 'Error: ' + err.message; } })(); }
        }
        );
        els.filter.addEventListener('input', () => { loadClasses() });
        document.getElementById('resetBtn').addEventListener('click', () => { setCreateMode(true); els.status.textContent = '' });
        ['departmentSelect', 'batchSelect', 'semesterSelect', 'subjectSelect'].forEach(id => {
            const node = document.getElementById(id);
            if (!node) return;
            node.addEventListener('change', () => {
                if (els?.form?.class_id?.value && didIdentityChangeSinceEdit()) {
                    if (els?.form?.class_id) els.form.class_id.value = '';
                    editIdentitySnapshot = null;
                    els.submitLabel.textContent = 'Add Class';
                }
            });
        });
        const secNode = els?.form?.section;
        if (secNode) {
            secNode.addEventListener('input', () => {
                if (els?.form?.class_id?.value && didIdentityChangeSinceEdit()) {
                    if (els?.form?.class_id) els.form.class_id.value = '';
                    editIdentitySnapshot = null;
                    els.submitLabel.textContent = 'Add Class';
                }
            });
        }
        loadClasses(); loadAcademics(); setThemeToggle();
