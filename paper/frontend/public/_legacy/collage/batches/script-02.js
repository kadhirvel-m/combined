// Extracted from ui/collage/batches.html (inline <script> #2).
        const params = (window.Collage && typeof window.Collage.parseQuery === 'function') ? window.Collage.parseQuery() : (() => { const q = {}; const s = window.location.search || ''; if (!s) return q; const usp = new URLSearchParams(s); usp.forEach((v, k) => q[k] = v); return q; })();
        let collegeId = params.collegeId; let collegeName = params.collegeName ? decodeURIComponent(params.collegeName) : ''; let degreeId = params.degreeId; let degreeName = params.degreeName ? decodeURIComponent(params.degreeName) : ''; let departmentId = params.departmentId; let departmentName = params.departmentName ? decodeURIComponent(params.departmentName) : '';
        // Attempt recovery from sessionStorage if critical params missing (back navigation without query string)
        (function recoverContext() {
            const need = !collegeId || !departmentId || !departmentName;
            if (!need) return;
            try {
                const raw = sessionStorage.getItem('px_ctx_batches');
                if (raw) {
                    const ctx = JSON.parse(raw);
                    if (ctx && typeof ctx === 'object') {
                        collegeId = collegeId || ctx.collegeId;
                        collegeName = collegeName || ctx.collegeName;
                        degreeId = degreeId || ctx.degreeId;
                        degreeName = degreeName || ctx.degreeName;
                        departmentId = departmentId || ctx.departmentId;
                        departmentName = departmentName || ctx.departmentName;
                        console.debug('[batches] recovered from sessionStorage', ctx);
                    }
                }
            } catch (e) { console.debug('[batches] sessionStorage recovery failed', e); }
            if (!collegeId || !departmentId || !departmentName) {
                try {
                    const raw2 = localStorage.getItem('px_ctx_batches_last');
                    if (raw2) {
                        const ctx2 = JSON.parse(raw2);
                        if (ctx2) {
                            collegeId = collegeId || ctx2.collegeId;
                            collegeName = collegeName || ctx2.collegeName;
                            degreeId = degreeId || ctx2.degreeId;
                            degreeName = degreeName || ctx2.degreeName;
                            departmentId = departmentId || ctx2.departmentId;
                            departmentName = departmentName || ctx2.departmentName;
                            console.debug('[batches] recovered from localStorage', ctx2);
                        }
                    }
                } catch (e2) { console.debug('[batches] localStorage recovery failed', e2); }
            }
            // If still missing, attempt upstream redirect if we have at least collegeId
            if ((!collegeId || !departmentId || !departmentName) && collegeId) {
                const redirectUrl = `departments.html?collegeId=${encodeURIComponent(collegeId)}&collegeName=${encodeURIComponent(collegeName || '')}&degreeId=${encodeURIComponent(degreeId || '')}&degreeName=${encodeURIComponent(degreeName || '')}`;
                console.debug('[batches] redirecting upstream due to incomplete context');
                window.location.replace(redirectUrl);
            }
        })();
        const results = document.getElementById('results'); const titleEl = document.getElementById('pageTitle'); const subtitleEl = document.getElementById('pageSubtitle'); const breadcrumbsEl = document.getElementById('breadcrumbs'); const addBatchBtn = document.getElementById('addBatchBtn');
        const batchModal = document.getElementById('batchModal'); const batchModalBackdrop = document.getElementById('batchModalBackdrop'); const batchModalTitle = document.getElementById('batchModalTitle'); const batchForm = document.getElementById('batchForm'); const batchFromYearInput = document.getElementById('batchFromYear'); const batchToYearInput = document.getElementById('batchToYear'); const batchModalMessage = document.getElementById('batchModalMessage'); const batchModalCancel = document.getElementById('batchModalCancel'); const batchModalClose = document.getElementById('batchModalClose'); const batchSubmitBtn = document.getElementById('batchSubmitBtn'); const batchDeleteBtn = document.getElementById('batchDeleteBtn');
        let batchesCache = []; let batchModalMode = 'add'; let editingBatchId = null;
        let currentRole = null; let isAdmin = false;

        const deleteBtnDefaultHTML = `<span class="material-symbols-rounded text-base">delete</span>Delete`;
        function makeBreadcrumb(items) { if (!Array.isArray(items)) return ''; return items.map((item, idx) => { if (!item) return ''; if (item.href && idx !== items.length - 1) { return `<a href="${item.href}" class="hover:text-brand-500 dark:hover:text-white">${Collage.escapeHtml(item.label || item.text || '')}</a>`; } return `<span class="text-neutral-900 dark:text-white font-medium">${Collage.escapeHtml(item.label || item.text || '')}</span>`; }).filter(Boolean).join('<span class="text-neutral-400 dark:text-white/40">/</span>'); }
        function showLoader() { results.innerHTML = `<div class=\"col-span-full flex items-center justify-center py-16\"><div class=\"h-12 w-12 animate-spin rounded-full border-2 border-brand-500/30 border-t-transparent\"></div></div>`; }
        function showError(message) { results.innerHTML = `<div class=\"col-span-full rounded-3xl border border-red-400/35 bg-red-100/70 dark:bg-red-500/10 dark:border-red-400/25 p-8 shadow-soft\"><h2 class=\"text-lg font-semibold text-red-700 dark:text-red-200\">Unable to load batches</h2><p class=\"mt-2 text-sm text-red-600/85 dark:text-red-200/80\">${Collage.escapeHtml(message || 'Please check the URL parameters and try again.')}</p></div>`; }
        function showEmpty() { results.innerHTML = `<div class=\"col-span-full rounded-3xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur p-8 text-sm text-neutral-600 dark:text-white/65\"><h2 class=\"text-lg font-semibold text-neutral-900 dark:text-white\">No batches found</h2><p class=\"mt-2\">Create batches for this department to continue drilling down into subjects.</p></div>`; }

        function showAccessDenied(message) {
            addBatchBtn?.classList.add('hidden');
            if (window.Collage && typeof window.Collage.renderAccessDenied === 'function') {
                window.Collage.renderAccessDenied(results, message || 'You need an admin or employee account to access the college console.');
            } else {
                showError(message || 'Access denied');
            }
        }
        function resetBatchModal() {
            batchForm?.reset();
            batchModalMessage.textContent = '';
            batchModalMessage.classList.add('hidden');
            batchModalMode = 'add';
            editingBatchId = null;
            batchSubmitBtn.innerHTML = '<span class="material-symbols-rounded text-base">save</span>Save batch';
            if (batchDeleteBtn) {
                batchDeleteBtn.classList.add('hidden');
                batchDeleteBtn.disabled = false;
                batchDeleteBtn.innerHTML = deleteBtnDefaultHTML;
            }
        }
        function setBatchModalLoading(isLoading) { batchSubmitBtn.disabled = isLoading; batchSubmitBtn.innerHTML = isLoading ? '<span class="material-symbols-rounded animate-spin text-base">progress_activity</span> Saving…' : (batchModalMode === 'edit' ? '<span class="material-symbols-rounded text-base">save</span>Save changes' : '<span class="material-symbols-rounded text-base">save</span>Save batch'); }

        function setBatchDeleteLoading(isLoading) {
            if (!batchDeleteBtn) return;
            batchDeleteBtn.disabled = isLoading;
            batchModalCancel.disabled = isLoading;
            batchSubmitBtn.disabled = isLoading;
            batchDeleteBtn.innerHTML = isLoading
                ? '<span class="material-symbols-rounded animate-spin text-base">progress_activity</span> Deleting…'
                : deleteBtnDefaultHTML;
        }
        function closeBatchModal() { batchModal.classList.add('hidden'); document.body.classList.remove('overflow-hidden'); resetBatchModal(); }
        function openBatchModal(mode = 'add', batch) {
            if (!departmentId) return;
            resetBatchModal();
            batchModalMode = mode;
            if (mode === 'edit' && batch) {
                editingBatchId = batch.id;
                batchFromYearInput.value = batch.from_year;
                batchToYearInput.value = batch.to_year;
            }
            const deptLabel = departmentName || 'this department';
            batchModalTitle.textContent = mode === 'edit' ? 'Edit batch' : `Add a new batch for ${deptLabel}`;
            batchSubmitBtn.innerHTML = mode === 'edit' ? '<span class="material-symbols-rounded text-base">save</span>Save changes' : '<span class="material-symbols-rounded text-base">save</span>Save batch';
            if (batchDeleteBtn) {
                if (mode === 'edit') batchDeleteBtn.classList.remove('hidden');
                else batchDeleteBtn.classList.add('hidden');
                batchDeleteBtn.disabled = false;
                batchDeleteBtn.innerHTML = deleteBtnDefaultHTML;
            }
            batchModal.classList.remove('hidden');
            document.body.classList.add('overflow-hidden');
            setTimeout(() => { (mode === 'edit' ? batchFromYearInput : batchFromYearInput)?.focus(); }, 80);
        }
        function validateBatchYears(fromYear, toYear) { if (!Number.isInteger(fromYear) || !Number.isInteger(toYear)) return 'Enter both from and to years.'; if (fromYear < 1950 || fromYear > 2100 || toYear < 1950 || toYear > 2100) return 'Year range must be between 1950 and 2100.'; if (toYear < fromYear) return 'Ending year must be greater than or equal to the starting year.'; return ''; }
        async function handleBatchSubmit(e) { e.preventDefault(); if (!departmentId) { batchModalMessage.textContent = 'Missing department context. Please navigate from the departments page again.'; batchModalMessage.classList.remove('hidden'); return; } const fromYear = Number.parseInt(batchFromYearInput.value, 10); const toYear = Number.parseInt(batchToYearInput.value, 10); const v = validateBatchYears(fromYear, toYear); if (v) { batchModalMessage.textContent = v; batchModalMessage.classList.remove('hidden'); (Number.isInteger(fromYear) ? batchToYearInput : batchFromYearInput).focus(); return; } batchModalMessage.classList.add('hidden'); setBatchModalLoading(true); const payload = { from: fromYear, to: toYear }; try { if (batchModalMode === 'edit' && editingBatchId) { await Collage.fetchJson(`/api/batches/${editingBatchId}`, { method: 'PUT', body: payload, skipAuth: false }); } else { await Collage.fetchJson(`/api/departments/${departmentId}/batches`, { method: 'POST', body: payload, skipAuth: false }); } closeBatchModal(); await loadBatches(); } catch (error) { let message = error?.message ?? 'Unable to save batch. Please try again.'; if (typeof message !== 'string') { try { message = JSON.stringify(message); } catch (_) { message = 'Unable to save batch. Please try again.'; } } if (message === '[object Object]') message = 'Unexpected response from server. Please try again.'; batchModalMessage.textContent = message; batchModalMessage.classList.remove('hidden'); console.error(error); } finally { setBatchModalLoading(false); } }

        async function handleBatchDelete() {
            if (!editingBatchId) return;
            const ok = window.confirm('Delete this batch and its subjects? This cannot be undone.');
            if (!ok) return;
            setBatchDeleteLoading(true);
            batchModalMessage.classList.add('hidden');
            try {
                await Collage.fetchJson(`/api/batches/${editingBatchId}`, { method: 'DELETE', skipAuth: false });
                closeBatchModal();
                await loadBatches();
            } catch (error) {
                let message = error?.message ?? 'Unable to delete batch. Please try again.';
                if (typeof message !== 'string') {
                    try { message = JSON.stringify(message); } catch (_) { message = 'Unable to delete batch. Please try again.'; }
                }
                if (message === '[object Object]') message = 'Unexpected response from server. Please try again.';
                batchModalMessage.textContent = message;
                batchModalMessage.classList.remove('hidden');
                console.error(error);
            } finally {
                setBatchDeleteLoading(false);
            }
        }
        function initBatchModal() {
            if (!addBatchBtn) return;
            if (!departmentId) { addBatchBtn.disabled = true; addBatchBtn.classList.add('opacity-60', 'cursor-not-allowed'); }
            addBatchBtn.addEventListener('click', () => openBatchModal('add'));
            batchModalCancel?.addEventListener('click', closeBatchModal);
            batchModalClose?.addEventListener('click', closeBatchModal);
            batchModalBackdrop?.addEventListener('click', closeBatchModal);
            batchForm?.addEventListener('submit', handleBatchSubmit);
            batchDeleteBtn?.addEventListener('click', handleBatchDelete);
            document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !batchModal.classList.contains('hidden')) closeBatchModal(); });
        }
        function attachBatchEditHandlers() { results.querySelectorAll('[data-batch-edit]').forEach(btn => { btn.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); const id = btn.getAttribute('data-batch-edit'); const batch = batchesCache.find(b => String(b.id) === String(id)); if (batch) openBatchModal('edit', batch); }); }); }
        function attachBatchCardNavigation() { results.querySelectorAll('[data-batch-card]').forEach(card => { const href = card.getAttribute('data-batch-card'); if (!href) return; card.addEventListener('click', e => { if (e.target.closest('[data-batch-edit]')) return; if (e.target.closest('a')) return; Collage.navigate(href); }); card.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('[data-batch-edit]')) { e.preventDefault(); Collage.navigate(href); } }); }); }
        async function loadBatches() {
            if (!collegeId || !departmentId) { showError('Missing collegeId or departmentId in URL.'); return; } showLoader(); try {
                const deptKey = encodeURIComponent(departmentId);
                const batches = await Collage.fetchJson(`/api/departments/${deptKey}/batches/full`, { skipAuth: false }); const label = departmentName || 'Selected department'; titleEl.innerHTML = `Batches · <span class=\"opacity-80\">${Collage.escapeHtml(label)}</span>`; const list = Array.isArray(batches) ? batches : []; batchesCache = list.map(i => ({ id: i.id, from_year: Number(i.from_year), to_year: Number(i.to_year) })); subtitleEl.textContent = `${list.length} batch${list.length === 1 ? '' : 'es'} recorded for this department.`; breadcrumbsEl.innerHTML = makeBreadcrumb([
                    { label: 'Colleges', href: 'clg_info.html' },
                    { label: collegeName || 'College', href: `degrees.html?collegeId=${encodeURIComponent(collegeId)}&collegeName=${encodeURIComponent(collegeName || '')}` },
                    { label: degreeName || 'Degree', href: `departments.html?collegeId=${encodeURIComponent(collegeId)}&collegeName=${encodeURIComponent(collegeName || '')}&degreeId=${encodeURIComponent(degreeId || '')}&degreeName=${encodeURIComponent(degreeName || '')}` },
                    { label }
                ]);
                // Provide a persistent back link (if an element exists for it in future) to departments with full context
                const backAnchor = document.getElementById('backLink');
                if (backAnchor) {
                    const deptBack = `departments.html?collegeId=${encodeURIComponent(collegeId)}&collegeName=${encodeURIComponent(collegeName || '')}&degreeId=${encodeURIComponent(degreeId || '')}&degreeName=${encodeURIComponent(degreeName || '')}`;
                    backAnchor.setAttribute('href', deptBack);
                }
                if (!list.length) { showEmpty(); return; }
                const accentPalette = [
                    'from-brand-500/70 via-brandlt-300/60 to-brand-700/80',
                    'from-[#FF7FD1]/55 via-[#B06AB3]/60 to-brand-700/80',
                    'from-brandlt-200/60 via-white/40 to-brand-500/65',
                    'from-[#7F57D1]/55 via-brand-500/60 to-brand-700/80',
                    'from-brand-700/65 via-brandlt-400/55 to-brand-500/70'
                ];
                results.innerHTML = list.map((batch, index) => {
                    const range = Collage.formatYearRange(batch.from_year, batch.to_year);
                    const accent = accentPalette[index % accentPalette.length];
                    const subjectsLink = `subjects.html?collegeId=${encodeURIComponent(collegeId)}&collegeName=${encodeURIComponent(collegeName || '')}&degreeId=${encodeURIComponent(degreeId || '')}&degreeName=${encodeURIComponent(degreeName || '')}&departmentId=${encodeURIComponent(departmentId || '')}&departmentName=${encodeURIComponent(departmentName || '')}&batchId=${encodeURIComponent(batch.id)}&batchRange=${encodeURIComponent(range)}`;
                    const editBtn = isAdmin ? `<button type=\"button\" data-batch-edit=\"${batch.id}\" aria-label=\"Edit batch ${Collage.escapeHtml(range)}\" class=\"absolute top-5 right-5 z-20 inline-flex items-center justify-center rounded-full border border-white/40 bg-white/85 dark:bg-white/10 p-2 text-neutral-500 hover:text-brand-500 hover:border-brand-500/50 transition\"><span class=\"material-symbols-rounded text-base\">edit</span></button>` : '';
                    return `<article class=\"group relative overflow-hidden rounded-3xl border border-black/5 dark:border-white/10 bg-white/75 dark:bg-white/5 backdrop-blur-xl p-6 shadow-soft transition hover:shadow-glow focus-within:shadow-glow cursor-pointer\" data-batch-card=\"${subjectsLink}\" tabindex=\"0\"><div class=\"absolute inset-x-6 top-6 h-32 rounded-3xl bg-gradient-to-r ${accent} opacity-20 blur-3xl\"></div>${editBtn}<div class=\"relative flex items-center justify-between text-xs text-neutral-600 dark:text-white/70\"><span class=\"inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/50 dark:bg-white/10 px-3 py-1 text-xs text-neutral-700 dark:text-white/80\">Batch</span><span class=\"font-mono text-[11px] text-neutral-500/80 dark:text-white/50\">${Collage.escapeHtml(String(batch.id).slice(0, 8))}…</span></div><h2 class=\"relative mt-6 text-xl font-semibold text-neutral-900 dark:text-white group-hover:text-brand-500\"><a href=\"${subjectsLink}\" class=\"inline-flex items-center gap-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/60 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-brand-900\">${Collage.escapeHtml(range)}<span class=\"material-symbols-rounded text-base text-brand-500 opacity-0 group-hover:opacity-100 transition\">north_east</span></a></h2><p class=\"relative mt-3 text-sm text-neutral-600 dark:text-white/65\">View all subjects (syllabus courses) taught in this cohort and dive into their syllabus.</p><a class=\"relative mt-6 inline-flex items-center gap-2 text-sm font-medium text-brand-500 dark:text-white/85\" href=\"${subjectsLink}\">View subjects<span class=\"material-symbols-rounded text-base transition group-hover:translate-x-1\">arrow_forward</span></a></article>`;
                }).join('');
                attachBatchEditHandlers(); attachBatchCardNavigation();
            } catch (err) { console.error(err); showError(err.message || 'Unexpected error'); }
        }
        document.addEventListener('DOMContentLoaded', async () => {
            try {
                currentRole = (window.Collage && window.Collage.requireAdminOrEmployee)
                    ? await window.Collage.requireAdminOrEmployee()
                    : 'student';
                isAdmin = String(currentRole || '').toLowerCase() === 'admin';
                if (!isAdmin) {
                    addBatchBtn?.classList.add('hidden');
                } else {
                    initBatchModal();
                }
                loadBatches();
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
