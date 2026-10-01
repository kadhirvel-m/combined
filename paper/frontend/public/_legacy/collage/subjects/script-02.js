// Extracted from ui/collage/subjects.html (inline <script> #2).
        const params = (window.Collage && typeof window.Collage.parseQuery === 'function') ? window.Collage.parseQuery() : (() => {
            const q = {};
            const s = window.location.search || '';
            if (!s) return q;
            const usp = new URLSearchParams(s);
            usp.forEach((v, k) => q[k] = v);
            return q;
        })();
        // Recover missing context (including batch) from storage if query lacks it
        (function restoreCtx() {
            function getStored() {
                try { const s = sessionStorage.getItem('px_ctx_batches'); if (s) return JSON.parse(s); } catch (_) { }
                try { const l = localStorage.getItem('px_ctx_batches_last'); if (l) return JSON.parse(l); } catch (_) { }
                return {};
            }
            const st = getStored();
            const keys = ['collegeId', 'collegeName', 'degreeId', 'degreeName', 'departmentId', 'departmentName', 'batchId', 'batchRange'];
            keys.forEach(k => { if (!params[k] && st[k]) params[k] = st[k]; });
        })();
        const collegeId = params.collegeId;
        const collegeName = params.collegeName ? decodeURIComponent(params.collegeName) : '';
        const degreeId = params.degreeId;
        const degreeName = params.degreeName ? decodeURIComponent(params.degreeName) : '';
        const departmentId = params.departmentId;
        const departmentName = params.departmentName ? decodeURIComponent(params.departmentName) : '';
        const batchId = params.batchId;
        const batchRange = params.batchRange ? decodeURIComponent(params.batchRange) : '';

        const results = document.getElementById('results');
        const titleEl = document.getElementById('pageTitle');
        const subtitleEl = document.getElementById('pageSubtitle');
        const breadcrumbsEl = document.getElementById('breadcrumbs');
        const batchDetails = document.getElementById('batchDetails');
        const semesterFilter = document.getElementById('semesterFilter');
        const addSubjectBtn = document.getElementById('addSubjectBtn');
        const subjectModal = document.getElementById('subjectModal');
        const subjectModalBackdrop = document.getElementById('subjectModalBackdrop');
        const subjectModalTitle = document.getElementById('subjectModalTitle');
        const subjectModalMessage = document.getElementById('subjectModalMessage');
        const subjectModalCancel = document.getElementById('subjectModalCancel');
        const subjectModalClose = document.getElementById('subjectModalClose');
        const subjectDeleteBtn = document.getElementById('subjectDeleteBtn');
        const subjectSubmitBtn = document.getElementById('subjectSubmitBtn');
        const subjectForm = document.getElementById('subjectForm');
        const subjectCourseCodeInput = document.getElementById('subjectCourseCode');
        const subjectSemesterSelect = document.getElementById('subjectSemester');
        const subjectTypeSelect = document.getElementById('subjectType');
        const subjectTitleInput = document.getElementById('subjectTitle');
        const subjectCreditsInput = document.getElementById('subjectCredits');
        const backLink = document.getElementById('backLink');

        let subjectsCache = [];
        let subjectModalMode = 'add';
        let editingSubjectId = null;
        let currentRole = null;
        let isAdmin = false;
        let canManageSubjects = false;
        const semesterOptions = [1, 2, 3, 4, 5, 6, 7, 8];

        function makeBreadcrumb(items) {
            if (!Array.isArray(items)) return '';
            return items.map((item, idx) => {
                if (!item) return '';
                if (item.href && idx !== items.length - 1) {
                    return `<a href="${item.href}" class="hover:text-brand-500 dark:hover:text-white">${Collage.escapeHtml(item.label || item.text || '')}</a>`;
                }
                return `<span class="text-neutral-900 dark:text-white font-medium">${Collage.escapeHtml(item.label || item.text || '')}</span>`;
            }).filter(Boolean).join('<span class="text-neutral-400 dark:text-white/40">/</span>');
        }

        function populateSemesterFilter() {
            semesterFilter.innerHTML = '<option value="">All</option>' + semesterOptions.map(n => `<option value="${n}">Sem ${n}</option>`).join('');
            subjectSemesterSelect.innerHTML =
                semesterOptions.map(n => `<option value="${n}">Semester ${n}</option>`).join('');
        }

        function showLoader() {
            results.innerHTML = `<div class=\"col-span-full flex items-center justify-center py-16\"><div class=\"h-12 w-12 animate-spin rounded-full border-2 border-brand-500/30 border-t-transparent\"></div></div>`;
        }

        function showError(message) {
            results.innerHTML = `<div class=\"col-span-full rounded-3xl border border-red-400/35 bg-red-100/70 dark:bg-red-500/10 dark:border-red-400/25 p-8 shadow-soft\"><h2 class=\"text-lg font-semibold text-red-700 dark:text-red-200\">Unable to load subjects</h2><p class=\"mt-2 text-sm text-red-600/85 dark:text-red-200/80\">${Collage.escapeHtml(message || 'Please verify parameters and try again.')}</p></div>`;
        }

        function showEmpty() {
            results.innerHTML = `<div class=\"col-span-full rounded-3xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur p-8 text-sm text-neutral-600 dark:text-white/65\"><h2 class=\"text-lg font-semibold text-neutral-900 dark:text-white\">No subjects yet</h2><p class=\"mt-2\">Add subjects for this batch to continue creating the syllabus hierarchy.</p></div>`;
        }

        function showAccessDenied(message) {
            addSubjectBtn?.classList.add('hidden');
            document.getElementById('uploadSyllabusBtn')?.classList.add('hidden');
            semesterFilter?.setAttribute('disabled', 'true');
            if (window.Collage && typeof window.Collage.renderAccessDenied === 'function') {
                window.Collage.renderAccessDenied(results, message || 'You need an admin or employee account to access the college console.');
            } else {
                showError(message || 'Access denied');
            }
        }

        function resetSubjectModal() {
            subjectForm?.reset();
            subjectModalMessage.textContent = '';
            subjectModalMessage.classList.add('hidden');
            subjectModalMode = 'add';
            editingSubjectId = null;
            subjectSubmitBtn.innerHTML = '<span class="material-symbols-rounded text-base">save</span>Save subject';
            if (subjectTypeSelect) subjectTypeSelect.value = 'practical';
        }

        function setSubjectModalLoading(isLoading) {
            subjectSubmitBtn.disabled = isLoading;
            subjectSubmitBtn.innerHTML = isLoading
                ? '<span class="material-symbols-rounded animate-spin text-base">progress_activity</span> Saving…'
                : (subjectModalMode === 'edit' ? '<span class="material-symbols-rounded text-base">save</span>Save changes' : '<span class="material-symbols-rounded text-base">save</span>Save subject');
        }

        function closeSubjectModal() {
            subjectModal.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
            resetSubjectModal();
        }

        function openSubjectModal(mode = 'add', subject) {
            if (!batchId) return;
            resetSubjectModal();
            subjectModalMode = mode;
            if (mode === 'edit' && subject) {
                editingSubjectId = subject.id;
                subjectCourseCodeInput.value = subject.course_code || '';
                subjectTitleInput.value = subject.title || '';
                subjectSemesterSelect.value = subject.semester || '';
                if (subjectTypeSelect) subjectTypeSelect.value = subject.type || 'practical';
                subjectCreditsInput.value = subject.credits != null ? subject.credits : '';
            }

            subjectModalTitle.textContent = mode === 'edit' ? 'Edit subject' : 'Add a new subject';
            subjectSubmitBtn.innerHTML = mode === 'edit' ? '<span class="material-symbols-rounded text-base">save</span>Save changes' : '<span class="material-symbols-rounded text-base">save</span>Save subject';
            subjectModal.classList.remove('hidden');
            document.body.classList.add('overflow-hidden');
            if (subjectDeleteBtn) {
                subjectDeleteBtn.classList.toggle('hidden', mode !== 'edit');
            }
            setTimeout(() => {
                (mode === 'edit' ? subjectCourseCodeInput : subjectCourseCodeInput)?.focus();
            }, 80);
        }

        async function handleSubjectSubmit(e) {
            e.preventDefault();
            if (!batchId) {
                subjectModalMessage.textContent = 'Missing batch context.';
                subjectModalMessage.classList.remove('hidden');
                return;
            }
            const course_code = (subjectCourseCodeInput.value || '').trim();
            const title = (subjectTitleInput.value || '').trim();
            const semesterRaw = subjectSemesterSelect.value;
            const creditsRaw = subjectCreditsInput.value;
            if (!course_code || !title || !semesterRaw) {
                subjectModalMessage.textContent = 'Fill all required fields.';
                subjectModalMessage.classList.remove('hidden');
                return;
            }

            const payload = {
                course_code,
                title,
                semester: Number(semesterRaw),
                type: (subjectTypeSelect?.value || 'practical')
            };
            if (creditsRaw) {
                const c = parseInt(creditsRaw, 10);
                if (!Number.isNaN(c)) payload.credits = c;
            }

            setSubjectModalLoading(true);
            subjectModalMessage.classList.add('hidden');

            try {
                if (subjectModalMode === 'edit' && editingSubjectId) {
                    await Collage.fetchJson(`/api/courses/${editingSubjectId}`, {
                        method: 'PUT',
                        body: payload,
                        skipAuth: false
                    });
                } else {
                    await Collage.fetchJson(`/api/batches/${batchId}/courses`, {
                        method: 'POST',
                        body: payload,
                        skipAuth: false
                    });
                }
                closeSubjectModal();
                await loadSubjects();
            } catch (error) {
                let m = error?.message ?? 'Unable to save subject.';
                if (typeof m !== 'string') {
                    try {
                        m = JSON.stringify(m);
                    } catch (_) {
                        m = 'Unable to save subject.';
                    }
                }
                if (m === '[object Object]') m = 'Unexpected response.';
                subjectModalMessage.textContent = m;
                subjectModalMessage.classList.remove('hidden');
                console.error(error);
            } finally {
                setSubjectModalLoading(false);
            }
        }

        async function handleSubjectDelete() {
            if (!editingSubjectId) return;
            const ok = window.confirm('Delete this subject and all its units and topics? This cannot be undone.');
            if (!ok) return;
            try {
                setSubjectModalLoading(true);
                await Collage.fetchJson(`/api/courses/${editingSubjectId}`, {
                    method: 'DELETE',
                    skipAuth: false
                });
                closeSubjectModal();
                await loadSubjects();
            } catch (error) {
                let m = error?.message ?? 'Unable to delete subject.';
                if (typeof m !== 'string') {
                    try { m = JSON.stringify(m); } catch (_) { m = 'Unable to delete subject.'; }
                }
                if (m === '[object Object]') m = 'Unexpected response.';
                subjectModalMessage.textContent = m;
                subjectModalMessage.classList.remove('hidden');
                console.error(error);
            } finally {
                setSubjectModalLoading(false);
            }
        }

        function initSubjectModal() {
            if (!addSubjectBtn) return;
            if (!batchId) {
                addSubjectBtn.disabled = true;
                addSubjectBtn.classList.add('opacity-60', 'cursor-not-allowed');
            }
            addSubjectBtn.addEventListener('click', () => openSubjectModal('add'));
            subjectModalCancel?.addEventListener('click', closeSubjectModal);
            subjectModalClose?.addEventListener('click', closeSubjectModal);
            subjectModalBackdrop?.addEventListener('click', closeSubjectModal);
            subjectForm?.addEventListener('submit', handleSubjectSubmit);
            subjectDeleteBtn?.addEventListener('click', handleSubjectDelete);
            document.addEventListener('keydown', e => {
                if (e.key === 'Escape' && !subjectModal.classList.contains('hidden')) {
                    closeSubjectModal();
                }
            });
        }

        function attachEditHandlers() {
            results.querySelectorAll('[data-subject-edit]').forEach(btn => {
                btn.addEventListener('click', e => {
                    e.preventDefault();
                    e.stopPropagation();
                    const id = btn.getAttribute('data-subject-edit');
                    const subj = subjectsCache.find(s => String(s.id) === String(id));
                    if (subj) openSubjectModal('edit', subj);
                });
            });
        }

        function attachCardNavigation() {
            results.querySelectorAll('[data-subject-card]').forEach(card => {
                const href = card.getAttribute('data-subject-card');
                if (!href) return;
                card.addEventListener('click', e => {
                    if (e.target.closest('[data-subject-edit]')) return;
                    if (e.target.closest('a')) return;
                    Collage.navigate(href);
                });
                card.addEventListener('keydown', e => {
                    if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('[data-subject-edit]')) {
                        e.preventDefault();
                        Collage.navigate(href);
                    }
                });
            });
        }

        function filterAndRender() {
            const semVal = semesterFilter.value;
            const list = semVal ? subjectsCache.filter(s => String(s.semester) === semVal) : subjectsCache.slice();
            renderSubjects(list);
        }

        function renderSubjects(list) {
            if (!list.length) {
                showEmpty();
                return;
            }
            const accentPalette = [
                'from-brand-500/70 via-brandlt-300/60 to-brand-700/80',
                'from-[#FF7FD1]/55 via-[#B06AB3]/60 to-brand-700/80',
                'from-brandlt-200/60 via-white/40 to-brand-500/65',
                'from-[#7F57D1]/55 via-brand-500/60 to-brand-700/80',
                'from-brand-700/65 via-brandlt-400/55 to-brand-500/70'
            ];
            results.innerHTML = list.map((subject, index) => {
                const accent = accentPalette[index % accentPalette.length];
                const syllabusLink = `syllabus.html?courseId=${encodeURIComponent(subject.id)}&courseCode=${encodeURIComponent(subject.course_code || '')}&courseTitle=${encodeURIComponent(subject.title || '')}&semester=${encodeURIComponent(subject.semester || '')}&batchId=${encodeURIComponent(batchId || '')}&batchRange=${encodeURIComponent(batchRange || '')}&collegeName=${encodeURIComponent(collegeName || '')}&degreeName=${encodeURIComponent(degreeName || '')}&departmentName=${encodeURIComponent(departmentName || '')}`;
                const editBtn = isAdmin ? `<button type=\"button\" data-subject-edit=\"${subject.id}\" aria-label=\"Edit subject ${Collage.escapeHtml(subject.course_code || '')}\" class=\"absolute top-5 right-5 z-20 inline-flex items-center justify-center rounded-full border border-white/40 bg-white/85 dark:bg-white/10 p-2 text-neutral-500 hover:text-brand-500 hover:border-brand-500/50 transition\"><span class=\"material-symbols-rounded text-base\">edit</span></button>` : '';
                return `<article class=\"group relative overflow-hidden rounded-3xl border border-black/5 dark:border-white/10 bg-white/75 dark:bg-white/5 backdrop-blur-xl p-6 shadow-soft transition hover:shadow-glow focus-within:shadow-glow cursor-pointer\" data-subject-card=\"${syllabusLink}\" tabindex=\"0\"><div class=\"absolute inset-x-6 top-6 h-32 rounded-3xl bg-gradient-to-r ${accent} opacity-20 blur-3xl\"></div>${editBtn}<div class=\"relative flex flex-wrap gap-2 text-xs text-neutral-600 dark:text-white/70\"><span class=\"inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/50 dark:bg-white/10 px-3 py-1 text-xs text-neutral-700 dark:text-white/80\">Sem ${Collage.escapeHtml(String(subject.semester || ''))}</span>${subject.credits != null ? `<span class=\\"inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/50 dark:bg-white/10 px-3 py-1 text-xs text-neutral-700 dark:text-white/80\\">${subject.credits} cr</span>` : ''}</div><h2 class=\"relative mt-6 text-xl font-semibold text-neutral-900 dark:text-white group-hover:text-brand-500\"><a href=\"${syllabusLink}\" class=\"inline-flex items-center gap-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/60 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-brand-900\">${Collage.escapeHtml(subject.course_code || 'COURSE')}<span class=\"material-symbols-rounded text-base text-brand-500 opacity-0 group-hover:opacity-100 transition\">north_east</span></a></h2><p class=\"relative mt-2 text-sm text-neutral-600 dark:text-white/65\">${Collage.escapeHtml(subject.title || 'Untitled subject')}</p><a href=\"${syllabusLink}\" class=\"relative mt-5 inline-flex items-center gap-2 text-sm font-medium text-brand-500 dark:text-white/85\">View syllabus<span class=\"material-symbols-rounded text-base transition group-hover:translate-x-1\">arrow_forward</span></a></article>`;
            }).join('');
            attachEditHandlers();
            attachCardNavigation();
        }

        async function loadSubjects() {
            if (!batchId) {
                showError('Missing batchId.');
                return;
            }
            showLoader();
            try {
                // NOTE: Backend provides GET /api/batches/{batchId}/courses (optionally ?semester=) — the previous '/full' path caused 404
                // If server-side filtering desired, append `?semester=${semesterFilter.value}` when a value is selected.
                const baseUrl = `/api/batches/${batchId}/courses`;
                const url = baseUrl; // could be `${baseUrl}?semester=${semesterFilter.value}` if we want server filtering
                const data = await Collage.fetchJson(url, { skipAuth: false });
                const list = Array.isArray(data) ? data : [];
                subjectsCache = list.map(s => ({
                    id: s.id,
                    course_code: s.course_code,
                    title: s.title,
                    semester: Number(s.semester),
                    credits: s.credits != null ? Number(s.credits) : null,
                    type: s.type || 'practical'
                }));
                titleEl.innerHTML = `Subjects <span class=\"opacity-70\">· ${Collage.escapeHtml(batchRange || 'Batch')}</span>`;
                subtitleEl.textContent = `${subjectsCache.length} subject${subjectsCache.length === 1 ? '' : 's'} found.`;
                batchDetails.textContent = batchRange ? `Batch: ${batchRange}` : '';
                breadcrumbsEl.innerHTML = makeBreadcrumb([
                    { label: 'Colleges', href: 'clg_info.html' },
                    { label: collegeName || 'College', href: `degrees.html?collegeId=${encodeURIComponent(collegeId || '')}&collegeName=${encodeURIComponent(collegeName || '')}` },
                    { label: degreeName || 'Degree', href: `departments.html?collegeId=${encodeURIComponent(collegeId || '')}&collegeName=${encodeURIComponent(collegeName || '')}&degreeId=${encodeURIComponent(degreeId || '')}&degreeName=${encodeURIComponent(degreeName || '')}` },
                    { label: departmentName || 'Department', href: `batches.html?collegeId=${encodeURIComponent(collegeId || '')}&collegeName=${encodeURIComponent(collegeName || '')}&degreeId=${encodeURIComponent(degreeId || '')}&degreeName=${encodeURIComponent(degreeName || '')}&departmentId=${encodeURIComponent(departmentId || '')}&departmentName=${encodeURIComponent(departmentName || '')}` },
                    { label: 'Subjects' }
                ]);
                filterAndRender();
            } catch (err) {
                console.error(err);
                showError(err.message || 'Unexpected error');
            }
        }

        // ─── Import Modal Logic ───────────────────────────────────────────
        const importModal = document.getElementById('importModal');
        const importModalBackdrop = document.getElementById('importModalBackdrop');
        const importModalClose = document.getElementById('importModalClose');
        const importModalCancel = document.getElementById('importModalCancel');
        const importSubmitBtn = document.getElementById('importSubmitBtn');
        const importModalMessage = document.getElementById('importModalMessage');
        const importSelectedCount = document.getElementById('importSelectedCount');
        const importSubjectsList = document.getElementById('importSubjectsList');
        const importCollegeSel = document.getElementById('importCollege');
        const importDegreeSel = document.getElementById('importDegree');
        const importDeptSel = document.getElementById('importDept');
        const importBatchSel = document.getElementById('importBatch');
        const importSemSel = document.getElementById('importSemester');

        let importCollegeCache = null; // cached response from GET /api/colleges/{id}
        let importSubjectsPool = []; // subjects shown for selection

        function resetImportModal() {
            importCollegeCache = null;
            importSubjectsPool = [];
            importCollegeSel.innerHTML = '<option value="">Loading…</option>';
            importDegreeSel.innerHTML = '<option value="">Select college first</option>';
            importDegreeSel.disabled = true;
            importDeptSel.innerHTML = '<option value="">Select degree first</option>';
            importDeptSel.disabled = true;
            importBatchSel.innerHTML = '<option value="">Select dept first</option>';
            importBatchSel.disabled = true;
            importSemSel.innerHTML = '<option value="">Select batch first</option>';
            importSemSel.disabled = true;
            importSubjectsList.innerHTML = '<p class="text-sm text-neutral-500 dark:text-white/50 text-center">Select college, degree, department, batch & semester above to view subjects.</p>';
            importModalMessage.textContent = '';
            importModalMessage.classList.add('hidden');
            importSelectedCount.textContent = '';
            importSubmitBtn.disabled = true;
        }

        async function openImportModal() {
            resetImportModal();
            importModal.classList.remove('hidden');
            document.body.classList.add('overflow-hidden');
            // Load colleges
            try {
                const colleges = await Collage.fetchJson('/api/colleges', { skipAuth: false });
                const list = Array.isArray(colleges) ? colleges : [];
                importCollegeSel.innerHTML = '<option value="">— Select college —</option>' +
                    list.map(c => `<option value="${c.id}">${Collage.escapeHtml(c.name || 'Unnamed')}</option>`).join('');
            } catch (err) {
                importCollegeSel.innerHTML = '<option value="">Failed to load colleges</option>';
                console.error(err);
            }
        }

        function closeImportModal() {
            importModal.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        }

        async function onImportCollegeChange() {
            const cId = importCollegeSel.value;
            // Reset downstream
            importDegreeSel.innerHTML = '<option value="">Loading…</option>';
            importDegreeSel.disabled = true;
            importDeptSel.innerHTML = '<option value="">Select degree first</option>';
            importDeptSel.disabled = true;
            importBatchSel.innerHTML = '<option value="">Select dept first</option>';
            importBatchSel.disabled = true;
            importSemSel.innerHTML = '<option value="">Select batch first</option>';
            importSemSel.disabled = true;
            importSubjectsList.innerHTML = '<p class="text-sm text-neutral-500 dark:text-white/50 text-center">Select all fields above to view subjects.</p>';
            importSubmitBtn.disabled = true;
            importSelectedCount.textContent = '';
            importCollegeCache = null;
            if (!cId) return;
            try {
                const data = await Collage.fetchJson(`/api/colleges/${cId}`, { skipAuth: false });
                importCollegeCache = data;
                const degrees = Array.isArray(data?.degrees) ? data.degrees : [];
                importDegreeSel.innerHTML = '<option value="">— Select degree —</option>' +
                    degrees.map(d => `<option value="${d.id}">${Collage.escapeHtml(d.name || 'Unnamed')}</option>`).join('');
                importDegreeSel.disabled = false;
            } catch (err) {
                importDegreeSel.innerHTML = '<option value="">Failed to load</option>';
                console.error(err);
            }
        }

        function onImportDegreeChange() {
            const dId = importDegreeSel.value;
            importDeptSel.innerHTML = '<option value="">Loading…</option>';
            importDeptSel.disabled = true;
            importBatchSel.innerHTML = '<option value="">Select dept first</option>';
            importBatchSel.disabled = true;
            importSemSel.innerHTML = '<option value="">Select batch first</option>';
            importSemSel.disabled = true;
            importSubjectsList.innerHTML = '<p class="text-sm text-neutral-500 dark:text-white/50 text-center">Select all fields above to view subjects.</p>';
            importSubmitBtn.disabled = true;
            importSelectedCount.textContent = '';
            if (!dId || !importCollegeCache) return;
            const degrees = Array.isArray(importCollegeCache?.degrees) ? importCollegeCache.degrees : [];
            const deg = degrees.find(d => String(d.id) === String(dId));
            const depts = Array.isArray(deg?.departments) ? deg.departments : [];
            importDeptSel.innerHTML = '<option value="">— Select department —</option>' +
                depts.map(d => `<option value="${d.id}">${Collage.escapeHtml(d.name || 'Unnamed')}</option>`).join('');
            importDeptSel.disabled = false;
        }

        async function onImportDeptChange() {
            const dpId = importDeptSel.value;
            importBatchSel.innerHTML = '<option value="">Loading…</option>';
            importBatchSel.disabled = true;
            importSemSel.innerHTML = '<option value="">Select batch first</option>';
            importSemSel.disabled = true;
            importSubjectsList.innerHTML = '<p class="text-sm text-neutral-500 dark:text-white/50 text-center">Select all fields above to view subjects.</p>';
            importSubmitBtn.disabled = true;
            importSelectedCount.textContent = '';
            if (!dpId) return;
            try {
                const batches = await Collage.fetchJson(`/api/departments/${dpId}/batches/full`, { skipAuth: false });
                const list = Array.isArray(batches) ? batches : [];
                importBatchSel.innerHTML = '<option value="">— Select batch —</option>' +
                    list.map(b => {
                        const label = (b.from_year && b.to_year) ? `${b.from_year} – ${b.to_year}` : (b.name || b.id);
                        return `<option value="${b.id}">${Collage.escapeHtml(String(label))}</option>`;
                    }).join('');
                importBatchSel.disabled = false;
            } catch (err) {
                importBatchSel.innerHTML = '<option value="">Failed to load</option>';
                console.error(err);
            }
        }

        function onImportBatchChange() {
            importSemSel.innerHTML = '<option value="">— Select semester —</option>' +
                semesterOptions.map(n => `<option value="${n}">Semester ${n}</option>`).join('');
            importSemSel.disabled = !importBatchSel.value;
            importSubjectsList.innerHTML = '<p class="text-sm text-neutral-500 dark:text-white/50 text-center">Select a semester to view subjects.</p>';
            importSubmitBtn.disabled = true;
            importSelectedCount.textContent = '';
        }

        async function onImportSemChange() {
            const bId = importBatchSel.value;
            const sem = importSemSel.value;
            importSubjectsPool = [];
            importSubmitBtn.disabled = true;
            importSelectedCount.textContent = '';
            if (!bId || !sem) {
                importSubjectsList.innerHTML = '<p class="text-sm text-neutral-500 dark:text-white/50 text-center">Select batch & semester.</p>';
                return;
            }
            importSubjectsList.innerHTML = '<div class="flex justify-center py-4"><div class="h-8 w-8 animate-spin rounded-full border-2 border-brand-500/30 border-t-transparent"></div></div>';
            try {
                const data = await Collage.fetchJson(`/api/batches/${bId}/courses`, { skipAuth: false });
                const all = Array.isArray(data) ? data : [];
                const filtered = all.filter(s => String(s.semester) === String(sem));
                importSubjectsPool = filtered;
                renderImportSubjects(filtered);
            } catch (err) {
                importSubjectsList.innerHTML = `<p class="text-sm text-red-500 text-center">${Collage.escapeHtml(err.message || 'Failed to load subjects')}</p>`;
                console.error(err);
            }
        }

        function renderImportSubjects(list) {
            if (!list.length) {
                importSubjectsList.innerHTML = '<p class="text-sm text-neutral-500 dark:text-white/50 text-center py-4">No subjects found for this semester.</p>';
                importSubmitBtn.disabled = true;
                importSelectedCount.textContent = '';
                return;
            }
            // Check all by default
            importSubjectsList.innerHTML = `
                <div class="flex items-center justify-between mb-3">
                    <label class="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-white/85 cursor-pointer">
                        <input type="checkbox" id="importSelectAll" checked class="rounded border-black/20 dark:border-white/20 text-brand-500 focus:ring-brand-500/40" />
                        Select all
                    </label>
                    <span class="text-xs text-neutral-500 dark:text-white/50">${list.length} subject${list.length === 1 ? '' : 's'}</span>
                </div>
                <div class="space-y-2 max-h-60 overflow-y-auto">
                    ${list.map((s, i) => `
                        <label class="flex items-start gap-3 rounded-xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] px-4 py-3 cursor-pointer hover:border-brand-500/40 transition" data-import-row>
                            <input type="checkbox" checked class="mt-0.5 rounded border-black/20 dark:border-white/20 text-brand-500 focus:ring-brand-500/40" data-import-check data-import-idx="${i}" />
                            <div class="min-w-0 flex-1">
                                <div class="text-sm font-semibold text-neutral-900 dark:text-white">${Collage.escapeHtml(s.course_code || 'N/A')}</div>
                                <div class="text-xs text-neutral-600 dark:text-white/60 mt-0.5">${Collage.escapeHtml(s.title || 'Untitled')}</div>
                                <div class="flex flex-wrap gap-2 mt-1.5">
                                    <span class="inline-flex items-center rounded-full border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 px-2 py-0.5 text-[10px] text-neutral-600 dark:text-white/60">Sem ${s.semester || '?'}</span>
                                    ${s.type ? `<span class="inline-flex items-center rounded-full border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 px-2 py-0.5 text-[10px] text-neutral-600 dark:text-white/60">${Collage.escapeHtml(s.type)}</span>` : ''}
                                    ${s.credits != null ? `<span class="inline-flex items-center rounded-full border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 px-2 py-0.5 text-[10px] text-neutral-600 dark:text-white/60">${s.credits} cr</span>` : ''}
                                </div>
                            </div>
                        </label>
                    `).join('')}
                </div>
            `;
            updateImportCount();

            // Select-all toggle
            const selectAllCb = document.getElementById('importSelectAll');
            selectAllCb?.addEventListener('change', () => {
                importSubjectsList.querySelectorAll('[data-import-check]').forEach(cb => { cb.checked = selectAllCb.checked; });
                updateImportCount();
            });
            // Individual checkboxes
            importSubjectsList.querySelectorAll('[data-import-check]').forEach(cb => {
                cb.addEventListener('change', updateImportCount);
            });
        }

        function updateImportCount() {
            const checked = importSubjectsList.querySelectorAll('[data-import-check]:checked');
            const count = checked.length;
            importSelectedCount.textContent = count ? `${count} subject${count === 1 ? '' : 's'} selected` : '';
            importSubmitBtn.disabled = count === 0;
        }

        async function handleImportSubmit() {
            const checked = importSubjectsList.querySelectorAll('[data-import-check]:checked');
            if (!checked.length) return;
            if (!batchId) {
                importModalMessage.textContent = 'Missing current batch context.';
                importModalMessage.classList.remove('hidden');
                return;
            }
            importModalMessage.classList.add('hidden');
            importSubmitBtn.disabled = true;
            const total = checked.length;
            let current = 0;

            function updateProgress(msg) {
                importSubmitBtn.innerHTML = `<span class="material-symbols-rounded animate-spin text-base">progress_activity</span> ${msg}`;
            }

            let successCount = 0;
            let errors = [];
            for (const cb of checked) {
                const idx = parseInt(cb.getAttribute('data-import-idx'), 10);
                const subj = importSubjectsPool[idx];
                if (!subj) continue;
                current++;
                updateProgress(`Importing ${current}/${total}…`);

                const payload = {
                    course_code: subj.course_code || '',
                    title: subj.title || '',
                    semester: Number(subj.semester),
                    type: subj.type || 'practical'
                };
                if (subj.credits != null) payload.credits = Number(subj.credits);

                try {
                    // 1. Create the subject in the current batch
                    const newCourse = await Collage.fetchJson(`/api/batches/${batchId}/courses`, {
                        method: 'POST',
                        body: payload,
                        skipAuth: false
                    });
                    const newCourseId = newCourse?.id;

                    // 2. Fetch the full syllabus (units + topics) from the source subject
                    if (newCourseId && subj.id) {
                        try {
                            updateProgress(`Copying syllabus ${current}/${total}…`);
                            const sourceSyllabus = await Collage.fetchJson(`/api/syllabus/courses/${subj.id}`, { skipAuth: false });
                            const units = Array.isArray(sourceSyllabus?.units) ? sourceSyllabus.units : [];

                            // 3. Recreate each unit (with its topics) under the new course
                            for (const unit of units) {
                                const topics = Array.isArray(unit.topics) ? unit.topics : [];
                                const unitPayload = {
                                    unit_title: unit.unit_title || unit.title || 'Untitled Unit',
                                    topics: topics.map(t => ({
                                        topic: t.topic_title || t.topic || t.title || ''
                                    })).filter(t => t.topic)
                                };
                                try {
                                    await Collage.fetchJson(`/api/syllabus/courses/${newCourseId}/units`, {
                                        method: 'POST',
                                        body: unitPayload,
                                        skipAuth: false
                                    });
                                } catch (unitErr) {
                                    console.warn('Failed to import unit', unit.unit_title, unitErr);
                                }
                            }
                        } catch (syllabusErr) {
                            console.warn('Could not fetch syllabus for', subj.course_code, syllabusErr);
                            // Subject was still created, just without syllabus — not a fatal error
                        }
                    }

                    successCount++;
                } catch (err) {
                    errors.push(`${subj.course_code}: ${err.message || 'failed'}`);
                    console.error('Import error for', subj.course_code, err);
                }
            }

            importSubmitBtn.innerHTML = '<span class="material-symbols-rounded text-base">input</span>Import selected';
            if (errors.length) {
                importModalMessage.textContent = `Imported ${successCount}, ${errors.length} failed: ${errors.join('; ')}`;
                importModalMessage.classList.remove('hidden');
                importSubmitBtn.disabled = false;
            } else {
                closeImportModal();
            }
            // Refresh subjects list in background
            await loadSubjects();
        }

        function initImportModal() {
            const importBtn = document.getElementById('importSubjectsBtn');
            if (!importBtn) return;
            if (!batchId) {
                importBtn.disabled = true;
                importBtn.classList.add('opacity-60', 'cursor-not-allowed');
            }
            importBtn.addEventListener('click', openImportModal);
            importModalClose?.addEventListener('click', closeImportModal);
            importModalCancel?.addEventListener('click', closeImportModal);
            importModalBackdrop?.addEventListener('click', closeImportModal);
            importSubmitBtn?.addEventListener('click', handleImportSubmit);
            importCollegeSel?.addEventListener('change', onImportCollegeChange);
            importDegreeSel?.addEventListener('change', onImportDegreeChange);
            importDeptSel?.addEventListener('change', onImportDeptChange);
            importBatchSel?.addEventListener('change', onImportBatchChange);
            importSemSel?.addEventListener('change', onImportSemChange);
            document.addEventListener('keydown', e => {
                if (e.key === 'Escape' && !importModal.classList.contains('hidden')) {
                    closeImportModal();
                }
            });
        }

        document.addEventListener('DOMContentLoaded', async () => {
            try {
                currentRole = (window.Collage && window.Collage.requireAdminOrEmployee)
                    ? await window.Collage.requireAdminOrEmployee()
                    : 'student';
                const roleLower = String(currentRole || '').toLowerCase();
                isAdmin = roleLower === 'admin';
                const isEmployee = roleLower === 'employee';
                canManageSubjects = isAdmin || isEmployee;
                populateSemesterFilter();
                if (!canManageSubjects) {
                    addSubjectBtn?.classList.add('hidden');
                    document.getElementById('uploadSyllabusBtn')?.classList.add('hidden');
                    document.getElementById('importSubjectsBtn')?.classList.add('hidden');
                } else {
                    initSubjectModal();
                    if (isAdmin) {
                        initImportModal();
                    } else {
                        document.getElementById('importSubjectsBtn')?.classList.add('hidden');
                    }
                }
                loadSubjects();
                semesterFilter.addEventListener('change', filterAndRender);
                // Ensure back link preserves navigation context
                if (backLink) {
                    const backUrl = `batches.html?collegeId=${encodeURIComponent(collegeId || '')}&collegeName=${encodeURIComponent(collegeName || '')}&degreeId=${encodeURIComponent(degreeId || '')}&degreeName=${encodeURIComponent(degreeName || '')}&departmentId=${encodeURIComponent(departmentId || '')}&departmentName=${encodeURIComponent(departmentName || '')}`;
                    backLink.setAttribute('href', backUrl);
                }
                // Persist context so batches.html can recover if user returns without query params
                try {
                    const ctx = {
                        collegeId, collegeName, degreeId, degreeName, departmentId, departmentName, batchId, batchRange
                    };
                    sessionStorage.setItem('px_ctx_batches', JSON.stringify(ctx));
                    // Also persist to localStorage as a longer-lived fallback
                    localStorage.setItem('px_ctx_batches_last', JSON.stringify({ ...ctx, ts: Date.now() }));
                    if (window?.console) console.debug('[subjects] stored context', ctx);
                } catch (_) { /* ignore storage errors */ }

                // Upload syllabus button routing with preserved context
                const uploadBtn = document.getElementById('uploadSyllabusBtn');
                if (uploadBtn) {
                    const q = new URLSearchParams({
                        collegeId: collegeId || '',
                        collegeName: collegeName || '',
                        degreeId: degreeId || '',
                        degreeName: degreeName || '',
                        departmentId: departmentId || '',
                        departmentName: departmentName || '',
                        batchId: batchId || '',
                        batchRange: batchRange || ''
                    }).toString();
                    uploadBtn.addEventListener('click', () => {
                        Collage.navigate(`upload_syllabus.html?${q}`);
                    });
                    if (!batchId) {
                        uploadBtn.disabled = true;
                        uploadBtn.classList.add('opacity-60', 'cursor-not-allowed');
                    }
                }
            } catch (err) {
                console.error(err);
                const status = err?.status;
                if (status === 401 || status === 403) {
                    showAccessDenied('You need an admin or employee account to access the college console.');
                } else {
                    showError(err?.message || 'Unexpected error');
                }
            }
        });
