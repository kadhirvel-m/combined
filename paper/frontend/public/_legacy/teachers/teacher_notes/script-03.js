// Extracted from ui/teachers/teacher_notes.html (inline <script> #3).
        const API_BASE = (window.API_BASE || window.__API_BASE || location.origin);
        const token = localStorage.getItem('teacherToken') || localStorage.getItem('px_auth_token');
        if (!token) { alert('Login required'); location.href = 'teacher_login.html'; }
        const collegeSelect = document.getElementById('collegeSelect');
        const degreeSelect = document.getElementById('degreeSelect');
        const departmentSelect = document.getElementById('departmentSelect');
        const batchSelect = document.getElementById('batchSelect');
        const subjectSelect = document.getElementById('subjectSelect');
        const hidden = {
            college: document.getElementById('hCollege'),
            degree: document.getElementById('hDegree'),
            department: document.getElementById('hDepartment'),
            batch: document.getElementById('hBatch'),
            semester: document.getElementById('hSemester'),
            subject: document.getElementById('hSubject'),
            subject_id: document.getElementById('hSubjectId')
        };
        let selectedClassId = null; let classCache = [];
        const notesTbody = document.querySelector('#notesTable tbody');
        const uploadStatus = document.getElementById('uploadStatus');

        async function fetchJSON(url, opts = {}) {
            const res = await fetch(url, opts);
            const ct = res.headers.get('content-type') || '';
            let data = null;
            try {
                const txt = await res.text();
                data = txt ? (/json|javascript/i.test(ct) ? JSON.parse(txt) : (function () { try { return JSON.parse(txt); } catch { return { detail: txt }; } })()) : {};
            } catch (_) { data = {}; }
            if (!res.ok) {
                const err = new Error((data && (data.detail || data.error)) || `Request failed (${res.status})`);
                err.status = res.status;
                err.data = data;
                throw err;
            }
            return data;
        }

        // ---------- Supabase helpers (for file uploads) ----------
        let supabaseClient = null;
        let SUPABASE_BUCKET = 'notes';
        async function ensureSupabase() {
            if (supabaseClient) return supabaseClient;
            const base = (API_BASE || '').replace(/\/$/, '');
            try {
                const cfg = await fetch(base + '/api/public/supabase').then(r => r.json());
                if (!cfg?.url || !cfg?.anonKey) throw new Error('Missing Supabase config');
                supabaseClient = window.supabase.createClient(cfg.url, cfg.anonKey);
                if (cfg.bucket) SUPABASE_BUCKET = cfg.bucket;
                return supabaseClient;
            } catch (e) {
                console.warn('[TeacherNotes] Supabase init failed', e);
                throw e;
            }
        }
        function safePath(name = '') {
            const base = (name || '').toString().split('\\').pop().split('/').pop();
            const clean = base.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/-+/g, '-');
            return clean || ('file-' + Date.now());
        }
        async function uploadToSupabase(file, meta = {}) {
            const sb = await ensureSupabase();
            const now = new Date();
            const y = now.getFullYear();
            const m = String(now.getMonth() + 1).padStart(2, '0');
            const d = String(now.getDate()).padStart(2, '0');
            const rand = Math.random().toString(36).slice(2, 8);
            const prefix = `teacher-notes/${y}/${m}/${d}`;
            const path = `${prefix}/${rand}-${safePath(meta.originalName || file.name)}`;
            const opt = { cacheControl: '3600', upsert: false, contentType: file.type || 'application/octet-stream' };
            const { error } = await sb.storage.from(SUPABASE_BUCKET).upload(path, file, opt);
            if (error) throw error;
            const { data } = sb.storage.from(SUPABASE_BUCKET).getPublicUrl(path);
            const publicUrl = data?.publicUrl || '';
            return { path, publicUrl };
        }

        async function loadMeta() {
            try {
                const meta = await fetchJSON(API_BASE + '/api/teacher/notes/upload-meta', { headers: { 'Authorization': 'Bearer ' + token } });
                (meta.colleges || []).forEach(c => { const o = document.createElement('option'); o.value = String(c.id); o.textContent = c.name; collegeSelect.appendChild(o); });
                // degrees depend on selected college
                const populateDegrees = () => {
                    const selectedCollege = collegeSelect.value;
                    degreeSelect.innerHTML = '<option value="">--</option>';
                    (meta.degrees || [])
                        .filter(d => !selectedCollege || String(d.college_id) === String(selectedCollege))
                        .forEach(d => { const o = document.createElement('option'); o.value = String(d.id); o.textContent = d.name; degreeSelect.appendChild(o); });
                };
                populateDegrees();
                collegeSelect.onchange = () => { subjectSelect.innerHTML = '<option value="">--</option>'; populateDegrees(); populateDepartments(meta); };
                degreeSelect.onchange = () => { subjectSelect.innerHTML = '<option value="">--</option>'; populateDepartments(meta); };
                departmentSelect.onchange = () => { subjectSelect.innerHTML = '<option value="">--</option>'; populateBatches(meta); };
                populateDepartments(meta);
            } catch (e) {
                console.warn('meta failed', e);
                // Fallback to public meta (no batches)
                try {
                    const meta = await fetchJSON(API_BASE + '/api/public/academic-meta');
                    (meta.colleges || []).forEach(c => { const o = document.createElement('option'); o.value = String(c.id); o.textContent = c.name; collegeSelect.appendChild(o); });
                    const populateDegrees = () => {
                        const selectedCollege = collegeSelect.value;
                        degreeSelect.innerHTML = '<option value="">--</option>';
                        (meta.degrees || [])
                            .filter(d => !selectedCollege || String(d.college_id) === String(selectedCollege))
                            .forEach(d => { const o = document.createElement('option'); o.value = String(d.id); o.textContent = d.name; degreeSelect.appendChild(o); });
                    };
                    populateDegrees();
                    collegeSelect.onchange = () => { populateDegrees(); populateDepartments(meta); };
                    degreeSelect.onchange = () => populateDepartments(meta);
                    // batches missing in public meta; disable until auth available
                    batchSelect.innerHTML = '<option value="">Login as approved teacher to load batches</option>';
                    batchSelect.setAttribute('disabled', 'disabled');
                    subjectSelect.innerHTML = '<option value="">Select batch and semester</option>';
                    subjectSelect.setAttribute('disabled', 'disabled');
                    populateDepartments(meta);
                    const us = document.getElementById('uploadStatus');
                    if (us) us.textContent = 'Limited metadata loaded (not approved or not logged in).';
                } catch (e2) {
                    const us = document.getElementById('uploadStatus');
                    if (us) us.textContent = 'Failed to load academic metadata.';
                }
            }
        }
        function populateDepartments(meta) {
            departmentSelect.innerHTML = '<option value="">--</option>';
            const collegeId = collegeSelect.value; const degreeId = degreeSelect.value;
            (meta.departments || [])
                .filter(d => (!collegeId || String(d.college_id) === String(collegeId)) && (!degreeId || String(d.degree_id) === String(degreeId)))
                .forEach(d => { const o = document.createElement('option'); o.value = String(d.id); o.textContent = d.name; departmentSelect.appendChild(o); });
            populateBatches(meta);
        }
        function populateBatches(meta) {
            batchSelect.innerHTML = '<option value="">--</option>';
            const deptId = departmentSelect.value;
            (meta.batches || [])
                .filter(b => !deptId || String(b.department_id) === String(deptId))
                .forEach(b => { const o = document.createElement('option'); o.value = String(b.id); o.textContent = b.from_year + '-' + b.to_year; batchSelect.appendChild(o); });
            // when batches change, subjects depend on batch + semester
            if ((meta.batches || []).length) { batchSelect.removeAttribute('disabled'); }
            populateSubjects();
        }

        async function populateSubjects() {
            subjectSelect.innerHTML = '<option value="">--</option>';
            const batchId = batchSelect.value;
            const semester = document.getElementById('semesterSelect').value;
            if (!batchId || !semester) { subjectSelect.setAttribute('disabled', 'disabled'); return; }
            try {
                const subs = await fetchJSON(`${API_BASE}/api/batches/${encodeURIComponent(batchId)}/courses?semester=${encodeURIComponent(semester)}`);
                console.log('[TeacherNotes] Loaded subjects', subs);
                (subs || []).forEach(s => {
                    const o = document.createElement('option');
                    // store subject id as value; display code — title
                    o.value = s.id || '';
                    o.textContent = (s.course_code ? `${s.course_code} — ` : '') + (s.title || '');
                    subjectSelect.appendChild(o);
                });
                subjectSelect.removeAttribute('disabled');
            } catch (e) {
                console.warn('[TeacherNotes] Subjects fetch failed', { batchId, semester, error: e });
                subjectSelect.setAttribute('disabled', 'disabled');
            }
        }
        subjectSelect.addEventListener('change', () => {
            const opt = subjectSelect.selectedIndex >= 0 ? subjectSelect.options[subjectSelect.selectedIndex] : undefined;
            hidden.subject_id.value = subjectSelect.value || '';
            hidden.subject.value = opt ? (opt.textContent || '').trim() : '';
            console.log('[TeacherNotes] Subject dropdown change', {
                subjectId: hidden.subject_id.value,
                subjectLabel: hidden.subject.value,
            });
        });

        async function loadMyNotes() {
            try {
                const data = await fetchJSON(API_BASE + '/api/teacher/notes/mine', { headers: { 'Authorization': 'Bearer ' + token } });
                notesTbody.innerHTML = '';
                (data.notes || []).forEach(n => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `<td>${n.title}</td><td>${n.subject || ''}</td><td>${n.semester || ''}</td><td>${new Date(n.created_at).toLocaleDateString()}</td>`;
                    notesTbody.appendChild(tr);
                });
                if (!data.notes?.length) notesTbody.innerHTML = '<tr><td colspan="4" class="muted">No notes uploaded yet.</td></tr>';
            } catch (e) { notesTbody.innerHTML = '<tr><td colspan="4" class="muted">Load failed</td></tr>'; }
        }

        document.getElementById('uploadForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            uploadStatus.textContent = 'Uploading...';
            const fd = new FormData(e.target);
            // If a class is selected, override with hidden academic fields
            if (selectedClassId) {
                fd.set('college_id', hidden.college.value || '');
                if (hidden.degree.value) fd.set('degree_id', hidden.degree.value);
                if (hidden.department.value) fd.set('department_id', hidden.department.value);
                if (hidden.batch.value) fd.set('batch_id', hidden.batch.value);
                if (hidden.semester.value) fd.set('semester', hidden.semester.value);
            }
            // Always align subject metadata with the cached selection
            const subjectOption = subjectSelect && subjectSelect.selectedIndex >= 0 ? subjectSelect.options[subjectSelect.selectedIndex] : undefined;
            const subjectSelectValue = subjectSelect ? subjectSelect.value : '';
            const subjectIdRaw = hidden.subject_id.value || subjectSelectValue || '';
            const subjectLabelRaw = hidden.subject.value || (subjectOption ? subjectOption.textContent : '');
            const subjectIdTrimmed = subjectIdRaw ? String(subjectIdRaw).trim() : '';
            const subjectLabelRawTrimmed = subjectLabelRaw ? subjectLabelRaw.trim() : '';
            const subjectLabel = (!subjectLabelRawTrimmed || subjectLabelRawTrimmed === '--') ? '' : subjectLabelRawTrimmed;
            const subjectId = (subjectIdTrimmed && subjectIdTrimmed.toLowerCase() !== 'undefined' && subjectIdTrimmed.toLowerCase() !== 'null') ? subjectIdTrimmed : '';
            fd.delete('subject');
            fd.delete('subject_id');
            if (subjectLabel) fd.set('subject', subjectLabel);
            if (subjectId) {
                fd.set('subject_id', subjectId);
                fd.set('subject_href', `/api/syllabus/courses/${subjectId}`);
            } else {
                fd.delete('subject_href');
            }
            console.log('[TeacherNotes] Preparing upload', {
                selectedClassId,
                hiddenSubjectId: hidden.subject_id.value,
                hiddenSubjectLabel: hidden.subject.value,
                subjectSelectValue,
                subjectId,
                subjectLabel,
                subjectHref: subjectId ? `/api/syllabus/courses/${subjectId}` : '',
            });
            if (!subjectId) {
                console.warn('[TeacherNotes] No subject ID resolved for submission', {
                    selectedClassId,
                    hiddenSubjectId: hidden.subject_id.value,
                    hiddenSubjectLabel: hidden.subject.value,
                    subjectSelectValue,
                    subjectLabel,
                });
            }
            try {
                const debugEntries = Array.from(fd.entries()).map(([key, value]) => [key, value instanceof File ? value.name : value]);
                console.log('[TeacherNotes] FormData entries', debugEntries);
            } catch (debugErr) {
                console.warn('[TeacherNotes] Failed to inspect FormData entries', debugErr);
            }
            // If a document file is present, upload to Supabase Storage first
            const file = fd.get('file');
            if (file instanceof File && file.size > 0) {
                try {
                    uploadStatus.textContent = 'Uploading to cloud storage...';
                    const up = await uploadToSupabase(file, { originalName: file.name });
                    // Include canonical URL for backend to persist in DB
                    fd.set('stored_path', up.publicUrl);
                    fd.set('url', up.publicUrl);
                    fd.set('original_filename', file.name);
                    fd.set('mime_type', file.type || 'application/octet-stream');
                    fd.set('file_size', String(file.size));
                    // Prevent backend from storing locally
                    fd.delete('file');
                    fd.delete('files');
                } catch (cloudErr) {
                    console.error('[TeacherNotes] Cloud upload failed', cloudErr);
                    uploadStatus.textContent = 'Cloud upload failed: ' + (cloudErr.message || cloudErr.error_description || '');
                    return;
                }
            }
            // convert to marketplace payload fields
            fd.append('price_cents', '0');
            try {
                const res = await fetch(API_BASE + '/api/marketplace/notes', { method: 'POST', headers: { 'Authorization': 'Bearer ' + token }, body: fd });
                const data = await res.json();
                console.log('[TeacherNotes] Upload response', { status: res.status, ok: res.ok, body: data });
                if (!res.ok) throw new Error(data.detail || 'Upload failed');
                uploadStatus.textContent = 'Uploaded';
                e.target.reset();
                loadMyNotes();
            } catch (err) {
                console.error('[TeacherNotes] Upload failed', err);
                uploadStatus.textContent = 'Error: ' + err.message;
            }
        });
        // populate semester options (1..12)
        const semSel = document.getElementById('semesterSelect'); for (let i = 1; i <= 12; i++) { const o = document.createElement('option'); o.value = String(i); o.textContent = String(i); semSel.appendChild(o); }
        // change listeners to keep dependent dropdowns in sync
        document.addEventListener('change', (e) => {
            if (e.target === departmentSelect) {
                // departments -> batches -> subjects
                // subjects will be refreshed inside populateBatches
                // no-op here
            }
            if (e.target === batchSelect || e.target === semSel) {
                populateSubjects();
            }
        });
        function renderClasses() {
            const wrap = document.getElementById('classesList');
            const noMsg = document.getElementById('noClassesMsg');
            wrap.innerHTML = '';
            if (!classCache.length) { noMsg.classList.remove('hidden'); return; }
            noMsg.classList.add('hidden');
            classCache.forEach(c => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'text-left p-3 rounded-xl ring-1 ring-black/5 dark:ring-white/10 bg-white/70 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 transition flex flex-col gap-1';
                btn.dataset.classId = c.id;
                btn.innerHTML = `<span class='text-[11px] font-medium uppercase tracking-wide text-neutral-500 dark:text-white/40'>Sem ${c.semester || '-'}${c.section ? ' • Sec ' + c.section : ''}</span><span class='text-sm font-semibold line-clamp-2'>${(c.subject || 'Untitled')}</span><span class='text-[10px] text-neutral-500 dark:text-white/40'>${c.batch_range || ''}</span>`;
                btn.addEventListener('click', () => selectClass(c.id));
                wrap.appendChild(btn);
            });
        }
        function selectClass(id) {
            selectedClassId = id; const cls = classCache.find(c => c.id === id);
            document.querySelectorAll('#classesList button').forEach(b => { if (b.dataset.classId === id) { b.classList.add('ring-brand-500', 'bg-brand-500/10'); } else { b.classList.remove('ring-brand-500', 'bg-brand-500/10'); } });
            if (!cls) return;
            // Fill hidden fields
            hidden.college.value = cls.college_id || '';
            hidden.degree.value = cls.degree_id || '';
            hidden.department.value = cls.department_id || '';
            hidden.batch.value = cls.batch_id || '';
            hidden.semester.value = cls.semester || '';
            hidden.subject.value = cls.subject || '';
            hidden.subject_id.value = cls.subject_id || '';
            console.log('[TeacherNotes] Class selected', {
                classId: id,
                subjectId: hidden.subject_id.value,
                subjectLabel: hidden.subject.value,
                collegeId: hidden.college.value,
                degreeId: hidden.degree.value,
                departmentId: hidden.department.value,
                batchId: hidden.batch.value,
                semester: hidden.semester.value,
            });
            // Clear manual selects for clarity (optional)
            collegeSelect.value = ''; degreeSelect.value = ''; departmentSelect.value = ''; batchSelect.value = ''; document.getElementById('semesterSelect').value = ''; subjectSelect.value = '';
            // Show selected class summary
            const info = document.getElementById('selectedClassInfo');
            if (info) {
                const parts = [];
                if (cls.subject) parts.push(cls.subject);
                if (cls.semester) parts.push('Sem ' + cls.semester);
                if (cls.section) parts.push('Sec ' + cls.section);
                info.textContent = parts.length ? ('Selected: ' + parts.join(' • ')) : 'Selected class';
            }
        }
        async function loadClasses() {
            try {
                const d = await fetchJSON(API_BASE + '/api/teacher/profile/me?strict=1', { headers: { 'Authorization': 'Bearer ' + token } });
                const payload = d.teacher ? d : { teacher: d.teacher, classes: d.classes };
                classCache = (d.classes || []).sort((a, b) => (a.semester || 0) - (b.semester || 0));
                console.log('[TeacherNotes] Classes loaded', classCache);
                renderClasses();
            } catch (e) { console.warn('classes load failed', e); }
        }
        // Manual mode toggle
        const toggleBtn = document.getElementById('toggleManualBtn');
        toggleBtn.addEventListener('click', () => {
            const manual = document.getElementById('manualFields');
            if (manual.classList.contains('hidden')) { manual.classList.remove('hidden'); toggleBtn.textContent = 'Class Mode'; }
            else { manual.classList.add('hidden'); toggleBtn.textContent = 'Manual Mode'; }
        });
        loadClasses();
        loadMeta();
        loadMyNotes();
        document.addEventListener('click', (e) => { if (e.target.matches('[data-theme-toggle]')) { const root = document.documentElement; const dark = root.classList.toggle('dark'); localStorage.setItem('px_theme', dark ? 'dark' : 'light'); } });
