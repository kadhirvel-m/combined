// Extracted from ui/collage/degrees.html (inline <script> #4).
        const params = (window.Collage && typeof window.Collage.parseQuery === 'function')
            ? window.Collage.parseQuery()
            : (() => {
                const query = {};
                const search = window.location && window.location.search ? window.location.search : '';
                if (!search) return query;
                const usp = new URLSearchParams(search);
                usp.forEach((value, key) => {
                    query[key] = value;
                });
                return query;
            })();
        const collegeId = params.collegeId;
        const collegeName = params.collegeName ? decodeURIComponent(params.collegeName) : '';
        const results = document.getElementById('results');
        const titleEl = document.getElementById('pageTitle');
        const subtitleEl = document.getElementById('pageSubtitle');
        const breadcrumbsEl = document.getElementById('breadcrumbs');
        const backLink = document.getElementById('backLink');
        const addDegreeBtn = document.getElementById('addDegreeBtn');
        const degreeModal = document.getElementById('degreeModal');
        const degreeModalBackdrop = document.getElementById('degreeModalBackdrop');
        const degreeModalTitle = document.getElementById('degreeModalTitle');
        const degreeForm = document.getElementById('degreeForm');
        const degreeNameInput = document.getElementById('degreeName');
        const degreeLevelInput = document.getElementById('degreeLevel');
        const degreeDurationInput = document.getElementById('degreeDuration');
        const degreeStreamInput = document.getElementById('degreeStream');
        const degreeModalMessage = document.getElementById('degreeModalMessage');
        const degreeModalCancel = document.getElementById('degreeModalCancel');
        const degreeModalClose = document.getElementById('degreeModalClose');
        const degreeSubmitBtn = document.getElementById('degreeSubmitBtn');
        const degreeDeleteBtn = document.getElementById('degreeDeleteBtn');

        // Force Delete Elements
        const forceDeleteModal = document.getElementById('forceDeleteModal');
        const forceDeleteBackdrop = document.getElementById('forceDeleteBackdrop');
        const forceDeleteCancel = document.getElementById('forceDeleteCancel');
        const forceDeleteConfirmBtn = document.getElementById('forceDeleteConfirmBtn');
        const forceDeleteInput = document.getElementById('forceDeleteInput');
        const forceDeleteError = document.getElementById('forceDeleteError');
        const forceDeleteNameDisplay = document.getElementById('forceDeleteNameDisplay');

        const themeAccentPalette = [
            'from-brand-500/70 via-brandlt-300/60 to-brand-700/80',
            'from-[#FF7FD1]/55 via-[#B06AB3]/60 to-brand-700/80',
            'from-brandlt-200/60 via-white/40 to-brand-500/65',
            'from-[#7F57D1]/55 via-brand-500/60 to-brand-700/80',
            'from-brand-700/65 via-brandlt-400/55 to-brand-500/70'
        ];
        let currentCollegeLabel = collegeName || 'Selected college';
        let degreesCache = [];
        let degreeModalMode = 'add';
        let editingDegreeId = null;
        let currentRole = null;
        let isAdmin = false;

        const deleteBtnDefaultHTML = `<span class="material-symbols-rounded text-base">delete</span>Delete`;

        function makeBreadcrumb(items) {
            if (!Array.isArray(items)) return '';
            return items.map((item, idx) => {
                if (!item) return '';
                if (item.href && idx !== items.length - 1) {
                    return `<a href="${item.href}" class="text-neutral-600 dark:text-white/70 hover:text-brand-500 dark:hover:text-white">${Collage.escapeHtml(item.label || item.text || '')}</a>`;
                }
                return `<span class="text-neutral-900 dark:text-white font-medium">${Collage.escapeHtml(item.label || item.text || '')}</span>`;
            }).filter(Boolean).join('<span class="text-neutral-400 dark:text-white/40">/</span>');
        }

        function showLoader() {
            results.innerHTML = `
        <div class="col-span-full flex items-center justify-center py-16">
          <div class="h-12 w-12 animate-spin rounded-full border-2 border-brand-500/30 border-t-transparent"></div>
        </div>`;
        }

        function showError(message) {
            results.innerHTML = `
        <div class="col-span-full rounded-3xl border border-red-400/35 bg-red-100/70 dark:bg-red-500/10 dark:border-red-400/25 p-8 shadow-soft">
          <h2 class="text-lg font-semibold text-red-700 dark:text-red-200">Unable to load degrees</h2>
          <p class="mt-2 text-sm text-red-600/85 dark:text-red-200/80">${Collage.escapeHtml(message || 'Please verify the college ID and try again.')}</p>
        </div>`;
        }

        function showEmpty() {
            results.innerHTML = `
        <div class="col-span-full rounded-3xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur p-8 text-sm text-neutral-600 dark:text-white/65">
          <h2 class="text-lg font-semibold text-neutral-900 dark:text-white">No degrees yet</h2>
          <p class="mt-2">Add degree information for this college to continue building the academic hierarchy.</p>
        </div>`;
        }

        function showAccessDenied(message) {
            addDegreeBtn?.classList.add('hidden');
            if (window.Collage && typeof window.Collage.renderAccessDenied === 'function') {
                window.Collage.renderAccessDenied(results, message || 'You need an admin or employee account to access the college console.');
            } else {
                showError(message || 'Access denied');
            }
        }

        function resetDegreeModal() {
            degreeForm?.reset();
            degreeModalMessage.textContent = '';
            degreeModalMessage.classList.add('hidden');
            editingDegreeId = null;
            degreeModalMode = 'add';
            degreeSubmitBtn.innerHTML = `<span class="material-symbols-rounded text-base">save</span>Save degree`;
            if (degreeDeleteBtn) {
                degreeDeleteBtn.classList.add('hidden');
                degreeDeleteBtn.disabled = false;
                degreeDeleteBtn.innerHTML = deleteBtnDefaultHTML;
            }
        }

        function setDegreeModalLoading(isLoading) {
            degreeSubmitBtn.disabled = isLoading;
            degreeSubmitBtn.innerHTML = isLoading
                ? `<span class="material-symbols-rounded animate-spin text-base">progress_activity</span> Saving…`
                : (degreeModalMode === 'edit'
                    ? `<span class="material-symbols-rounded text-base">save</span>Save changes`
                    : `<span class="material-symbols-rounded text-base">save</span>Save degree`);
        }

        function setDegreeDeleteLoading(isLoading) {
            if (!degreeDeleteBtn) return;
            degreeDeleteBtn.disabled = isLoading;
            degreeModalCancel.disabled = isLoading;
            degreeSubmitBtn.disabled = isLoading;
            degreeDeleteBtn.innerHTML = isLoading
                ? '<span class="material-symbols-rounded animate-spin text-base">progress_activity</span> Deleting…'
                : deleteBtnDefaultHTML;
        }

        function closeDegreeModal() {
            degreeModal.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
            resetDegreeModal();
        }

        function openDegreeModal(mode = 'add', degree) {
            if (!collegeId) return;
            resetDegreeModal();
            degreeModalMode = mode;

            if (mode === 'edit' && degree) {
                editingDegreeId = degree.id;
                degreeNameInput.value = degree.name || '';
                degreeLevelInput.value = degree.level || '';
                degreeDurationInput.value = typeof degree.duration_years === 'number' && !Number.isNaN(degree.duration_years)
                    ? degree.duration_years
                    : '';
                degreeStreamInput.value = degree.stream || 'Engineering';
            }

            degreeModalTitle.textContent = mode === 'edit'
                ? 'Edit degree'
                : `Add a new degree for ${currentCollegeLabel}`;
            degreeSubmitBtn.innerHTML = mode === 'edit'
                ? `<span class="material-symbols-rounded text-base">save</span>Save changes`
                : `<span class="material-symbols-rounded text-base">save</span>Save degree`;

            if (degreeDeleteBtn) {
                if (mode === 'edit') degreeDeleteBtn.classList.remove('hidden');
                else degreeDeleteBtn.classList.add('hidden');
                degreeDeleteBtn.disabled = false;
                degreeDeleteBtn.innerHTML = deleteBtnDefaultHTML;
            }

            degreeModal.classList.remove('hidden');
            document.body.classList.add('overflow-hidden');
            setTimeout(() => {
                if (mode === 'edit') {
                    degreeNameInput?.select();
                } else {
                    degreeNameInput?.focus();
                }
            }, 80);
        }

        // --- FORCE DELETE LOGIC ---

        function closeForceDeleteModal() {
            forceDeleteModal.classList.add('hidden');
            forceDeleteInput.value = '';
            forceDeleteError.classList.add('hidden');
            forceDeleteConfirmBtn.disabled = true;
            document.body.classList.remove('overflow-hidden');
            // If we came from the main modal, standard behavior is main modal stays open?
            // User requested robust flow. Let's keep main modal open until delete succeeds.
        }

        function openForceDeleteModal(degree) {
            if (!degree) return;
            forceDeleteNameDisplay.textContent = degree.name || 'this degree';
            forceDeleteInput.value = '';
            forceDeleteError.classList.add('hidden');
            forceDeleteConfirmBtn.disabled = true;
            forceDeleteModal.classList.remove('hidden');
            // Ensure z-index works on top of existing modal
            setTimeout(() => forceDeleteInput.focus(), 100);
        }

        async function performForceDelete() {
            if (!editingDegreeId) return;
            // UI Loading state
            forceDeleteConfirmBtn.disabled = true;
            forceDeleteConfirmBtn.innerHTML = `<span class="material-symbols-rounded animate-spin text-base">progress_activity</span> Deleting…`;

            try {
                // Must pass force=true
                await Collage.fetchJson(`/api/degrees/${editingDegreeId}?force=true`, { method: 'DELETE', skipAuth: false });
                closeForceDeleteModal();
                closeDegreeModal(); // Close the parent modal too
                await loadDegrees();
            } catch (error) {
                let message = error?.message ?? 'Unable to delete degree. Please try again.';
                // Re-enable button
                forceDeleteConfirmBtn.disabled = false;
                forceDeleteConfirmBtn.innerHTML = `<span class="material-symbols-rounded text-base">delete_forever</span> Force Delete`;
                alert(message); // Fallback alert for API errors
                console.error(error);
            }
        }

        function handleDegreeDelete() {
            if (!editingDegreeId) return;
            const degree = degreesCache.find(d => String(d.id) === String(editingDegreeId));
            if (!degree) return;
            openForceDeleteModal(degree);
        }

        function initForceDelete() {
            // Verify name input
            forceDeleteInput.addEventListener('input', () => {
                const degree = degreesCache.find(d => String(d.id) === String(editingDegreeId));
                if (!degree) return;
                const typed = forceDeleteInput.value.trim();
                const expected = (degree.name || '').trim();

                if (typed === expected) {
                    forceDeleteConfirmBtn.disabled = false;
                    forceDeleteError.classList.add('hidden');
                    forceDeleteInput.classList.remove('border-red-500', 'focus:border-red-500', 'ring-red-500/20');
                    forceDeleteInput.classList.add('border-green-500', 'focus:border-green-500', 'ring-green-500/20');
                } else {
                    forceDeleteConfirmBtn.disabled = true;
                    // Optional: show error state visually
                    forceDeleteInput.classList.remove('border-green-500', 'focus:border-green-500', 'ring-green-500/20');
                    // Only show error text if length is sufficient and wrong
                    if (typed.length >= expected.length && typed !== expected) {
                        forceDeleteError.classList.remove('hidden');
                    } else {
                        forceDeleteError.classList.add('hidden');
                    }
                }
            });

            // Action buttons
            forceDeleteCancel.addEventListener('click', closeForceDeleteModal);
            forceDeleteBackdrop.addEventListener('click', closeForceDeleteModal);
            forceDeleteConfirmBtn.addEventListener('click', performForceDelete);
        }

        async function handleDegreeSubmit(event) {
            event.preventDefault();
            if (!collegeId) {
                degreeModalMessage.textContent = 'Missing college context. Please navigate from the colleges page again.';
            }
            if (!collegeId) {
                degreeModalMessage.classList.remove('hidden');
                return;
            }
            const name = (degreeNameInput.value || '').trim();
            const level = (degreeLevelInput.value || '').trim();
            const durationRaw = (degreeDurationInput.value || '').trim();
            if (!name) {
                degreeModalMessage.textContent = 'Please enter the degree name.';
                degreeModalMessage.classList.remove('hidden');
                degreeNameInput.focus();
                return;
            }
            const payload = { name };
            payload.level = level ? level : null;
            let duration = null;
            if (durationRaw) {
                const parsed = parseInt(durationRaw, 10);
                if (!Number.isNaN(parsed)) {
                    duration = parsed;
                }
            }
            payload.duration_years = duration !== null ? duration : null;
            const stream = (degreeStreamInput.value || 'Engineering').trim();
            payload.stream = stream;
            degreeModalMessage.classList.add('hidden');
            setDegreeModalLoading(true);
            try {
                if (degreeModalMode === 'edit' && editingDegreeId) {
                    await Collage.fetchJson(`/api/degrees/${editingDegreeId}`, {
                        method: 'PUT',
                        body: payload,
                        skipAuth: false
                    });
                } else {
                    const createPayload = { ...payload };
                    if (createPayload.level === null) delete createPayload.level;
                    if (createPayload.duration_years === null) delete createPayload.duration_years;
                    await Collage.fetchJson(`/api/colleges/${collegeId}/degrees`, {
                        method: 'POST',
                        body: createPayload,
                        skipAuth: false
                    });
                }
                closeDegreeModal();
                await loadDegrees();
            } catch (error) {
                let message = error?.message ?? 'Unable to save degree. Please try again.';
                if (typeof message !== 'string') {
                    try {
                        message = JSON.stringify(message);
                    } catch (_) {
                        message = 'Unable to save degree. Please try again.';
                    }
                }
                if (message === '[object Object]') {
                    message = 'Unexpected response from server. Please try again.';
                }
                degreeModalMessage.textContent = message;
                degreeModalMessage.classList.remove('hidden');
                console.error(error);
            } finally {
                setDegreeModalLoading(false);
            }
        }

        function initDegreeModal() {
            if (!addDegreeBtn) return;
            if (!collegeId) {
                addDegreeBtn.disabled = true;
                addDegreeBtn.classList.add('opacity-60', 'cursor-not-allowed');
            }
            addDegreeBtn?.addEventListener('click', () => openDegreeModal('add'));
            degreeModalCancel?.addEventListener('click', closeDegreeModal);
            degreeModalClose?.addEventListener('click', closeDegreeModal);
            degreeModalBackdrop?.addEventListener('click', closeDegreeModal);
            degreeForm?.addEventListener('submit', handleDegreeSubmit);
            degreeDeleteBtn?.addEventListener('click', handleDegreeDelete);
            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape') {
                    // Prioritize closing the top-most modal
                    if (!forceDeleteModal.classList.contains('hidden')) {
                        closeForceDeleteModal();
                    } else if (!degreeModal.classList.contains('hidden')) {
                        closeDegreeModal();
                    }
                }
            });
            initForceDelete();
        }

        function attachDegreeEditHandlers() {
            const editButtons = results.querySelectorAll('[data-degree-edit]');
            editButtons.forEach(button => {
                button.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                    const id = button.getAttribute('data-degree-edit');
                    const degree = degreesCache.find(item => item.id === id);
                    if (degree) {
                        openDegreeModal('edit', degree);
                    }
                });
            });
        }

        async function loadDegrees() {
            if (!collegeId) {
                showError('Missing collegeId in URL.');
                return;
            }
            showLoader();
            try {
                const data = await Collage.fetchJson(`/api/colleges/${collegeId}`, { skipAuth: false });
                const collegeLabel = data?.name || collegeName || 'Selected college';
                currentCollegeLabel = collegeLabel;
                const degrees = Array.isArray(data?.degrees) ? data.degrees : [];

                const prefix = degrees.length ? 'Degrees at' : 'Configure degrees for';
                const safeLabel = Collage.escapeHtml(collegeLabel);
                const logoBlock = data?.logo_url
                    ? `<img src="${data.logo_url}" alt="${safeLabel} logo" class=\"h-20 w-20 rounded-2xl object-cover ring-2 ring-white/60 dark:ring-white/10 shadow-md flex-shrink-0\" />`
                    : `<div class=\"h-10 w-10 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center text-xs font-semibold ring-2 ring-white/40 dark:ring-white/10 shadow-md flex-shrink-0\">${safeLabel.slice(0, 2).toUpperCase()}</div>`;
                titleEl.innerHTML = `
                    <span class="opacity-80">${prefix}</span>
                    <span class="inline-flex items-center gap-3 ml-1">
                        ${logoBlock}
                        <span class="whitespace-normal break-words leading-tight">${safeLabel}</span>
                    </span>`;
                // Subtitle intentionally suppressed per requirement (removed availability line)
                subtitleEl.textContent = '';
                breadcrumbsEl.innerHTML = makeBreadcrumb([
                    { label: 'Colleges', href: 'clg_info.html' },
                    { label: collegeLabel }
                ]);
                if (backLink) {
                    backLink.href = 'clg_info.html';
                }

                degreesCache = degrees.slice();
                if (!degrees.length) {
                    showEmpty();
                    return;
                }

                results.innerHTML = degrees.map((degree, index) => {
                    const deptCount = Array.isArray(degree.departments) ? degree.departments.length : 0;
                    const accentColor = themeAccentPalette[index % themeAccentPalette.length];
                    const chips = [];
                    if (degree.level) chips.push(`<span class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/50 dark:bg-white/10 px-3 py-1 text-xs text-neutral-700 dark:text-white/80">${Collage.escapeHtml(degree.level)}</span>`);
                    if (degree.duration_years) chips.push(`<span class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/50 dark:bg-white/10 px-3 py-1 text-xs text-neutral-700 dark:text-white/80">${degree.duration_years} years</span>`);
                    if (degree.stream) chips.push(`<span class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/50 dark:bg-white/10 px-3 py-1 text-xs text-neutral-700 dark:text-white/80"><span class="material-symbols-rounded text-base">category</span>${Collage.escapeHtml(degree.stream)}</span>`);
                    chips.push(`<span class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/50 dark:bg-white/10 px-3 py-1 text-xs text-neutral-700 dark:text-white/80"><span class="material-symbols-rounded text-base">account_tree</span>${deptCount} department${deptCount === 1 ? '' : 's'}</span>`);
                    const detailLink = `departments.html?collegeId=${encodeURIComponent(collegeId)}&collegeName=${encodeURIComponent(collegeLabel)}&degreeId=${encodeURIComponent(degree.id)}&degreeName=${encodeURIComponent(degree.name || '')}`;
                    const editBtn = isAdmin
                        ? `
                            <button type="button" data-degree-edit="${degree.id}" aria-label="Edit ${Collage.escapeHtml(degree.name || '')}"
                                class="absolute top-5 right-5 z-20 inline-flex items-center justify-center rounded-full border border-white/40 bg-white/85 dark:bg-white/10 p-2 text-neutral-500 hover:text-brand-500 hover:border-brand-500/50 transition">
                                <span class="material-symbols-rounded text-base">edit</span>
                            </button>`
                        : '';
                    return `
                        <article class="group relative overflow-hidden rounded-3xl border border-black/5 dark:border-white/10 bg-white/75 dark:bg-white/5 backdrop-blur-xl p-6 shadow-soft transition">
                            <div class="absolute inset-x-6 top-6 h-32 rounded-3xl bg-gradient-to-r ${accentColor} opacity-20 blur-3xl"></div>
                            ${editBtn}
                            <div class="relative flex flex-wrap gap-2">${chips.join('')}</div>
                            <h2 class="relative z-10 mt-6 text-xl font-semibold text-neutral-900 dark:text-white">
                                <a href="${detailLink}" class="inline-flex items-center gap-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/60 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-brand-900 group-hover:text-brand-500 transition">
                                    ${Collage.escapeHtml(degree.name || 'Unnamed degree')}
                                    <span class="material-symbols-rounded text-base opacity-0 group-hover:opacity-100 transition">north_east</span>
                                </a>
                            </h2>
                            <p class="relative mt-3 text-sm text-neutral-600 dark:text-white/65">Explore the departments and batches mapped to this degree.</p>
                            <a class="relative mt-6 inline-flex items-center gap-2 text-sm font-medium text-brand-500 dark:text-white/85" href="${detailLink}">
                                View departments
                                <span class="material-symbols-rounded text-base transition group-hover:translate-x-1">arrow_forward</span>
                            </a>
                        </article>`;
                }).join('');
                attachDegreeEditHandlers();
            } catch (err) {
                console.error(err);
                showError(err.message || 'Unexpected error');
            }
        }

        document.addEventListener('DOMContentLoaded', async () => {
            try {
                currentRole = (window.Collage && window.Collage.requireAdminOrEmployee)
                    ? await window.Collage.requireAdminOrEmployee()
                    : 'student';
                isAdmin = String(currentRole || '').toLowerCase() === 'admin';
                if (!isAdmin) {
                    addDegreeBtn?.classList.add('hidden');
                } else {
                    initDegreeModal();
                }
                loadDegrees();
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
