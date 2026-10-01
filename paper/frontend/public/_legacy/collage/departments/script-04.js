// Extracted from ui/collage/departments.html (inline <script> #4).
        const params = (window.Collage && typeof window.Collage.parseQuery === 'function') ? window.Collage.parseQuery() : (() => { const q = {}; const s = window.location ? window.location.search : ''; if (!s) return q; try { const usp = new URLSearchParams(s); usp.forEach((v, k) => { q[k] = v }); } catch (_) { } return q; })();
        const collegeId = params.collegeId; const collegeName = params.collegeName ? decodeURIComponent(params.collegeName) : ''; const degreeId = params.degreeId; const degreeName = params.degreeName ? decodeURIComponent(params.degreeName) : '';
        const results = document.getElementById('results');
        const titleEl = document.getElementById('pageTitle');
        const subtitleEl = document.getElementById('pageSubtitle');
        const breadcrumbsEl = document.getElementById('breadcrumbs');
        const backLink = document.getElementById('backLink');
        const addDepartmentBtn = document.getElementById('addDepartmentBtn');
        const departmentModal = document.getElementById('departmentModal');
        const departmentModalBackdrop = document.getElementById('departmentModalBackdrop');
        const departmentModalTitle = document.getElementById('departmentModalTitle');
        const departmentForm = document.getElementById('departmentForm');
        const departmentNameInput = document.getElementById('departmentName');
        const departmentModalMessage = document.getElementById('departmentModalMessage');
        const departmentModalCancel = document.getElementById('departmentModalCancel');
        const departmentModalClose = document.getElementById('departmentModalClose');
        const departmentSubmitBtn = document.getElementById('departmentSubmitBtn');
        const departmentDeleteBtn = document.getElementById('departmentDeleteBtn');
        const themeAccentPalette = [
            'from-brand-500/70 via-brandlt-300/60 to-brand-700/80',
            'from-[#FF7FD1]/55 via-[#B06AB3]/60 to-brand-700/80',
            'from-brandlt-200/60 via-white/40 to-brand-500/65',
            'from-[#7F57D1]/55 via-brand-500/60 to-brand-700/80',
            'from-brand-700/65 via-brandlt-400/55 to-brand-500/70'
        ];
        let currentCollegeLabel = collegeName || 'Selected college';
        let currentDegreeLabel = degreeName || 'Selected degree';
        let departmentsCache = [];
        let departmentModalMode = 'add';
        let editingDepartmentId = null;
        let currentRole = null;
        let isAdmin = false;

        function makeBreadcrumb(items) { if (!Array.isArray(items)) return ''; return items.map((item, idx) => { if (!item) return ''; if (item.href && idx !== items.length - 1) { return `<a href="${item.href}" class="text-neutral-600 dark:text-white/70 hover:text-brand-500 dark:hover:text-white">${Collage.escapeHtml(item.label || item.text || '')}</a>`; } return `<span class="text-neutral-900 dark:text-white font-medium">${Collage.escapeHtml(item.label || item.text || '')}</span>`; }).filter(Boolean).join('<span class="text-neutral-400 dark:text-white/40">/</span>'); }

        function showLoader() { results.innerHTML = `<div class="col-span-full flex items-center justify-center py-16"><div class="h-12 w-12 animate-spin rounded-full border-2 border-brand-500/30 border-t-transparent"></div></div>`; }
        function showError(message) { results.innerHTML = `<div class="col-span-full rounded-3xl border border-red-400/35 bg-red-100/70 dark:bg-red-500/10 dark:border-red-400/25 p-8 shadow-soft"><h2 class="text-lg font-semibold text-red-700 dark:text-red-200">Unable to load departments</h2><p class="mt-2 text-sm text-red-600/85 dark:text-red-200/80">${Collage.escapeHtml(message || 'Please verify the degree context and try again.')}</p></div>`; }
        function showEmpty() { results.innerHTML = `<div class="col-span-full rounded-3xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur p-8 text-sm text-neutral-600 dark:text-white/65"><h2 class="text-lg font-semibold text-neutral-900 dark:text-white">No departments yet</h2><p class="mt-2">Add department information for this degree to continue building the academic hierarchy.</p></div>`; }

        function showAccessDenied(message) {
            addDepartmentBtn?.classList.add('hidden');
            if (window.Collage && typeof window.Collage.renderAccessDenied === 'function') {
                window.Collage.renderAccessDenied(results, message || 'You need an admin or employee account to access the college console.');
            } else {
                showError(message || 'Access denied');
            }
        }

        const deleteBtnDefaultHTML = `<span class="material-symbols-rounded text-base">delete</span>Delete`;

        function resetDepartmentModal() {
            departmentForm?.reset();
            departmentModalMessage.textContent = '';
            departmentModalMessage.classList.add('hidden');
            editingDepartmentId = null;
            departmentModalMode = 'add';
            departmentSubmitBtn.innerHTML = `<span class="material-symbols-rounded text-base">save</span>Save department`;
            if (departmentDeleteBtn) {
                departmentDeleteBtn.classList.add('hidden');
                departmentDeleteBtn.disabled = false;
                departmentDeleteBtn.innerHTML = deleteBtnDefaultHTML;
            }
        }

        function setDepartmentModalLoading(isLoading) {
            departmentSubmitBtn.disabled = isLoading;
            departmentSubmitBtn.innerHTML = isLoading
                ? `<span class="material-symbols-rounded animate-spin text-base">progress_activity</span> Saving…`
                : (departmentModalMode === 'edit'
                    ? `<span class="material-symbols-rounded text-base">save</span>Save changes`
                    : `<span class="material-symbols-rounded text-base">save</span>Save department`);
        }

        function setDepartmentDeleteLoading(isLoading) {
            if (!departmentDeleteBtn) return;
            departmentDeleteBtn.disabled = isLoading;
            departmentModalCancel.disabled = isLoading;
            departmentSubmitBtn.disabled = isLoading;
            departmentDeleteBtn.innerHTML = isLoading
                ? `<span class="material-symbols-rounded animate-spin text-base">progress_activity</span> Deleting…`
                : deleteBtnDefaultHTML;
        }

        function closeDepartmentModal() {
            departmentModal.classList.add('hidden');
            departmentModal.classList.remove('flex');
            document.body.classList.remove('overflow-hidden');
            resetDepartmentModal();
        }

        function openDepartmentModal(mode = 'add', department) {
            if (!degreeId) return;
            resetDepartmentModal();
            departmentModalMode = mode;
            if (mode === 'edit' && department) {
                editingDepartmentId = department.id;
                departmentNameInput.value = department.name || '';
            }
            departmentModalTitle.textContent = mode === 'edit' ? 'Edit department' : `Add a new department for ${currentDegreeLabel}`;
            departmentSubmitBtn.innerHTML = mode === 'edit'
                ? `<span class="material-symbols-rounded text-base">save</span>Save changes`
                : `<span class="material-symbols-rounded text-base">save</span>Save department`;
            if (departmentDeleteBtn) {
                if (mode === 'edit') departmentDeleteBtn.classList.remove('hidden');
                else departmentDeleteBtn.classList.add('hidden');
                departmentDeleteBtn.disabled = false;
                departmentDeleteBtn.innerHTML = deleteBtnDefaultHTML;
            }
            departmentModal.classList.remove('hidden');
            departmentModal.classList.add('flex');
            document.body.classList.add('overflow-hidden');
            setTimeout(() => {
                if (mode === 'edit') { departmentNameInput?.select(); }
                else { departmentNameInput?.focus(); }
            }, 80);
        }

        async function handleDepartmentSubmit(e) { e.preventDefault(); if (!collegeId || !degreeId) { departmentModalMessage.textContent = 'Missing college or degree context. Please navigate from the degrees page again.'; departmentModalMessage.classList.remove('hidden'); return; } const name = (departmentNameInput.value || '').trim(); if (!name) { departmentModalMessage.textContent = 'Please enter the department name.'; departmentModalMessage.classList.remove('hidden'); departmentNameInput.focus(); return; } departmentModalMessage.classList.add('hidden'); setDepartmentModalLoading(true); const payload = { name }; try { if (departmentModalMode === 'edit' && editingDepartmentId) { await Collage.fetchJson(`/api/departments/${editingDepartmentId}`, { method: 'PUT', body: payload, skipAuth: false }); } else { await Collage.fetchJson(`/api/degrees/${degreeId}/departments`, { method: 'POST', body: payload, skipAuth: false }); } closeDepartmentModal(); await loadDepartments(); } catch (error) { let message = error?.message ?? 'Unable to save department. Please try again.'; if (typeof message !== 'string') { try { message = JSON.stringify(message); } catch (_) { message = 'Unable to save department. Please try again.'; } } if (message === '[object Object]') message = 'Unexpected response from server. Please try again.'; departmentModalMessage.textContent = message; departmentModalMessage.classList.remove('hidden'); console.error(error); } finally { setDepartmentModalLoading(false); } }

        async function handleDepartmentDelete() {
            if (!editingDepartmentId) return;
            const ok = window.confirm('Delete this department and its batches? This cannot be undone.');
            if (!ok) return;
            setDepartmentDeleteLoading(true);
            departmentModalMessage.classList.add('hidden');
            try {
                await Collage.fetchJson(`/api/departments/${editingDepartmentId}`, { method: 'DELETE', skipAuth: false });
                closeDepartmentModal();
                await loadDepartments();
            } catch (error) {
                let message = error?.message ?? 'Unable to delete department. Please try again.';
                if (typeof message !== 'string') {
                    try { message = JSON.stringify(message); } catch (_) { message = 'Unable to delete department. Please try again.'; }
                }
                if (message === '[object Object]') message = 'Unexpected response from server. Please try again.';
                departmentModalMessage.textContent = message;
                departmentModalMessage.classList.remove('hidden');
                console.error(error);
            } finally {
                setDepartmentDeleteLoading(false);
            }
        }

        function initDepartmentModal() { if (!addDepartmentBtn) return; if (!degreeId) { addDepartmentBtn.disabled = true; addDepartmentBtn.classList.add('opacity-60', 'cursor-not-allowed'); } addDepartmentBtn.addEventListener('click', () => openDepartmentModal('add')); departmentModalCancel?.addEventListener('click', closeDepartmentModal); departmentModalClose?.addEventListener('click', closeDepartmentModal); departmentModalBackdrop?.addEventListener('click', closeDepartmentModal); departmentForm?.addEventListener('submit', handleDepartmentSubmit); departmentDeleteBtn?.addEventListener('click', handleDepartmentDelete); document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape' && !departmentModal.classList.contains('hidden')) closeDepartmentModal(); }); }

        function attachDepartmentEditHandlers() { const editButtons = results.querySelectorAll('[data-department-edit]'); editButtons.forEach(btn => { btn.addEventListener('click', (ev) => { ev.preventDefault(); ev.stopPropagation(); ev.stopImmediatePropagation(); const id = btn.getAttribute('data-department-edit'); const department = departmentsCache.find(item => String(item.id) === String(id)); if (department) openDepartmentModal('edit', department); }); }); }
        function attachDepartmentCardNavigation() { const cards = results.querySelectorAll('[data-department-card]'); cards.forEach(card => { const href = card.getAttribute('data-department-card'); if (!href) return; card.addEventListener('click', (ev) => { if (ev.target.closest('[data-department-edit]')) return; if (ev.target.closest('a')) return; Collage.navigate(href); }); card.addEventListener('keydown', (ev) => { if ((ev.key === 'Enter' || ev.key === ' ') && !ev.target.closest('[data-department-edit]')) { ev.preventDefault(); Collage.navigate(href); } }); }); }

        async function loadDepartments() {
            if (!collegeId || !degreeId) { showError('Missing collegeId or degreeId in URL.'); return; } showLoader(); try {
                const data = await Collage.fetchJson(`/api/colleges/${collegeId}`, { skipAuth: false }); const collegeLabel = data?.name || collegeName || 'Selected college'; currentCollegeLabel = collegeLabel; const degrees = Array.isArray(data?.degrees) ? data.degrees : []; const degree = degrees.find(item => String(item.id) === String(degreeId)); if (backLink) { backLink.href = `degrees.html?collegeId=${encodeURIComponent(collegeId)}&collegeName=${encodeURIComponent(collegeLabel)}`; }
                if (!degree) { showError('Degree not found for this college.'); subtitleEl.textContent = 'Try picking another degree.'; titleEl.textContent = 'Departments'; breadcrumbsEl.innerHTML = makeBreadcrumb([{ label: 'Colleges', href: 'clg_info.html' }, { label: collegeLabel, href: `degrees.html?collegeId=${encodeURIComponent(collegeId)}&collegeName=${encodeURIComponent(collegeLabel)}` }, { label: degreeName || 'Unknown degree' }]); return; }
                currentDegreeLabel = degree?.name || degreeName || 'Selected degree'; titleEl.textContent = degrees.length ? `Departments in ${currentDegreeLabel}` : `Configure departments for ${currentDegreeLabel}`; const departments = Array.isArray(degree.departments) ? degree.departments : []; departmentsCache = departments.slice(); const deptCount = departments.length; subtitleEl.textContent = `${deptCount} department${deptCount === 1 ? '' : 's'} recorded.`; breadcrumbsEl.innerHTML = makeBreadcrumb([{ label: 'Colleges', href: 'clg_info.html' }, { label: collegeLabel, href: `degrees.html?collegeId=${encodeURIComponent(collegeId)}&collegeName=${encodeURIComponent(collegeLabel)}` }, { label: currentDegreeLabel }]); if (!deptCount) { showEmpty(); return; }
                results.innerHTML = departments.map((department, index) => {
                    const batches = Array.isArray(department.batches) ? department.batches : []; const firstBatch = batches[0]; const batchLabel = firstBatch ? Collage.escapeHtml(Collage.formatYearRange(firstBatch.from, firstBatch.to)) : '—'; const accentColor = themeAccentPalette[index % themeAccentPalette.length]; const departmentLink = `batches.html?collegeId=${encodeURIComponent(collegeId)}&collegeName=${encodeURIComponent(collegeLabel)}&degreeId=${encodeURIComponent(degreeId)}&degreeName=${encodeURIComponent(currentDegreeLabel)}&departmentId=${encodeURIComponent(department.id)}&departmentName=${encodeURIComponent(department.name || '')}`; const chips = [`<span class=\"inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/50 dark:bg-white/10 px-3 py-1 text-xs text-neutral-700 dark:text-white/80\">${batches.length} batch${batches.length === 1 ? '' : 'es'}</span>`]; if (firstBatch) { chips.push(`<span class=\"inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/50 dark:bg-white/10 px-3 py-1 text-xs text-neutral-700 dark:text-white/80\">${batchLabel}</span>`); }
                    const editBtn = isAdmin ? `\n<button type=\"button\" data-department-edit=\"${department.id}\" aria-label=\"Edit ${Collage.escapeHtml(department.name || '')}\" class=\"absolute top-5 right-5 z-20 inline-flex items-center justify-center rounded-full border border-white/40 bg-white/85 dark:bg-white/10 p-2 text-neutral-500 hover:text-brand-500 hover:border-brand-500/50 transition\"><span class=\"material-symbols-rounded text-base\">edit</span></button>` : '';
                    return `<article class=\"group relative overflow-hidden rounded-3xl border border-black/5 dark:border-white/10 bg-white/75 dark:bg-white/5 backdrop-blur-xl p-6 shadow-soft transition hover:border-brand-500/50 focus-within:border-brand-500/50\" data-department-card=\"${departmentLink}\" tabindex=\"0\">\n<div class=\"absolute inset-x-6 top-6 h-32 rounded-3xl bg-gradient-to-r ${accentColor} opacity-20 blur-3xl\"></div>${editBtn}\n<div class=\"relative flex flex-wrap gap-2\">${chips.join('')}</div>\n<h2 class=\"relative z-10 mt-6 text-xl font-semibold text-neutral-900 dark:text-white\"><a href=\"${departmentLink}\" class=\"inline-flex items-center gap-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/60 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-brand-900 group-hover:text-brand-500 transition\">${Collage.escapeHtml(department.name || 'Unnamed department')}<span class=\"material-symbols-rounded text-base opacity-0 group-hover:opacity-100 transition\">north_east</span></a></h2>\n<p class=\"relative mt-3 text-sm text-neutral-600 dark:text-white/65\">Explore batches & their subjects mapped to this department.</p>\n<a class=\"relative mt-6 inline-flex items-center gap-2 text-sm font-medium text-brand-500 dark:text-white/85\" href=\"${departmentLink}\">View batches<span class=\"material-symbols-rounded text-base transition group-hover:translate-x-1\">arrow_forward</span></a>\n</article>`;
                }).join('');
                attachDepartmentEditHandlers(); attachDepartmentCardNavigation();
            } catch (err) { console.error(err); showError(err.message || 'Unexpected error'); }
        }

        document.addEventListener('DOMContentLoaded', async () => {
            try {
                currentRole = (window.Collage && window.Collage.requireAdminOrEmployee)
                    ? await window.Collage.requireAdminOrEmployee()
                    : 'student';
                isAdmin = String(currentRole || '').toLowerCase() === 'admin';
                if (!isAdmin) {
                    addDepartmentBtn?.classList.add('hidden');
                } else {
                    initDepartmentModal();
                }
                loadDepartments();
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
