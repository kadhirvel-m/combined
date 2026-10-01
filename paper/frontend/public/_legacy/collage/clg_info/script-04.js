// Extracted from ui/collage/clg_info.html (inline <script> #4).
        const results = document.getElementById('results');
        const addCollegeBtn = document.getElementById('addCollegeBtn');
        const collegeModal = document.getElementById('collegeModal');
        const collegeModalBackdrop = document.getElementById('collegeModalBackdrop');
        const collegeModalTitle = document.getElementById('collegeModalTitle');
        const collegeForm = document.getElementById('collegeForm');
        const collegeNameInput = document.getElementById('collegeName');
        const collegeModalMessage = document.getElementById('collegeModalMessage');
        const collegeModalCancel = document.getElementById('collegeModalCancel');
        const collegeSubmitBtn = document.getElementById('collegeSubmitBtn');
        const collegeModalClose = document.getElementById('collegeModalClose');
        const collegeDeleteBtn = document.getElementById('collegeDeleteBtn');
        const collegeMetric = document.getElementById('collegeMetric');
        const syncStatusLabel = document.getElementById('syncStatusLabel');

        const deleteConfirmModal = document.getElementById('deleteConfirmModal');
        const deleteConfirmBackdrop = document.getElementById('deleteConfirmBackdrop');
        const deleteConfirmClose = document.getElementById('deleteConfirmClose');
        const deleteConfirmCancel = document.getElementById('deleteConfirmCancel');
        const deleteConfirmBtn = document.getElementById('deleteConfirmBtn');
        const deleteConfirmInput = document.getElementById('deleteConfirmInput');
        const deleteConfirmCollegeName = document.getElementById('deleteConfirmCollegeName');
        const deleteConfirmMessage = document.getElementById('deleteConfirmMessage');

        let collegesCache = [];
        let modalMode = 'add';
        let editingCollegeId = null;
        let currentRole = null;
        let isAdmin = false;

        let pendingDeleteCollegeName = '';

        const deleteBtnDefaultHTML = `<span class="material-symbols-rounded text-base">delete</span>Delete`;

        const apiBase = (window.API_BASE || 'http://0.0.0.0:10000').replace(/\/$/, '');

        const updateMetrics = (count, state = 'Live') => {
            if (typeof count === 'number' && collegeMetric) {
                collegeMetric.textContent = String(count);
            }
            if (syncStatusLabel) {
                syncStatusLabel.textContent = state;
            }
        };

        function showLoader() {
            results.innerHTML = `
        <div class="col-span-full flex items-center justify-center py-16">
          <div class="h-12 w-12 animate-spin rounded-full border-2 border-brand-500/50 border-t-transparent"></div>
        </div>`;
            updateMetrics(collegesCache.length || 0, 'Syncing…');
        }

        function showError(message) {
            results.innerHTML = `
        <div class="col-span-full rounded-3xl border border-red-400/35 bg-red-100/70 dark:bg-red-500/10 dark:border-red-400/25 p-8 shadow-soft">
          <h2 class="text-lg font-semibold text-red-700 dark:text-red-200">Unable to load colleges</h2>
          <p class="mt-2 text-sm text-red-600/85 dark:text-red-200/80">${Collage.escapeHtml(message || 'Please try again shortly.')}</p>
        </div>`;
            updateMetrics(collegesCache.length || 0, 'Error');
        }

        function showEmpty() {
            results.innerHTML = `
        <div class="col-span-full rounded-3xl border border-black/5 dark:border-white/10 bg-white/75 dark:bg-white/5 backdrop-blur p-8 text-sm text-neutral-600 dark:text-white/65">
          <h2 class="text-lg font-semibold text-neutral-900 dark:text-white">No colleges yet</h2>
          <p class="mt-2">Add a college to kickstart your hierarchy, or bulk import data from the admin tooling.</p>
        </div>`;
            updateMetrics(0, 'Awaiting entries');
        }

        function showAccessDenied(message) {
            if (addCollegeBtn) addCollegeBtn.classList.add('hidden');
            results.innerHTML = `
                <div class="col-span-full p-10 text-center space-y-4 rounded-3xl border border-black/5 dark:border-white/10 bg-white/75 dark:bg-white/5 backdrop-blur-xl shadow-soft">
                    <div class="mx-auto w-14 h-14 rounded-full flex items-center justify-center bg-red-500/10 text-red-600 dark:text-red-400">
                        <span class="material-symbols-rounded">block</span>
                    </div>
                    <h2 class="text-xl font-bold text-neutral-900 dark:text-white">Access denied</h2>
                    <p class="text-sm text-neutral-600 dark:text-white/70 max-w-md mx-auto">${Collage.escapeHtml(message || 'You do not have permission to view this page.')}</p>
                </div>`;
            updateMetrics(0, 'Denied');
        }

        function getAnyToken() {
            const keys = ['token', 'px_token', 'access_token', 'auth_token', 'sb-access-token'];
            for (const k of keys) {
                try {
                    const v = localStorage.getItem(k);
                    if (v) return v;
                } catch (_) { }
            }
            return null;
        }

        async function requireAdminOrEmployee() {
            const token = getAnyToken();
            if (!token) {
                const err = new Error('Missing token');
                err.status = 401;
                throw err;
            }
            const me = await Collage.fetchJson('/api/admin/roles/me', { headers: { 'Authorization': `Bearer ${token}` } });
            const role = String(me?.role || 'student').toLowerCase().trim();
            if (role !== 'admin' && role !== 'employee') {
                const err = new Error('Access denied');
                err.status = 403;
                throw err;
            }
            return role;
        }

        function resetModal() {
            collegeForm.reset();
            collegeModalMessage.textContent = '';
            collegeModalMessage.classList.add('hidden');
            editingCollegeId = null;
            if (collegeDeleteBtn) {
                collegeDeleteBtn.classList.add('hidden');
                collegeDeleteBtn.disabled = false;
                collegeDeleteBtn.innerHTML = deleteBtnDefaultHTML;
            }
        }

        function setModalLoading(isLoading) {
            collegeSubmitBtn.disabled = isLoading;
            collegeSubmitBtn.innerHTML = isLoading
                ? `<span class="material-symbols-rounded animate-spin text-base">progress_activity</span> Saving…`
                : (modalMode === 'edit'
                    ? `<span class="material-symbols-rounded text-base">save</span>Save changes`
                    : `<span class="material-symbols-rounded text-base">save</span>Save college`);
        }

        function setCollegeDeleteLoading(isLoading) {
            if (!collegeDeleteBtn) return;
            collegeDeleteBtn.disabled = isLoading;
            collegeModalCancel.disabled = isLoading;
            collegeSubmitBtn.disabled = isLoading;
            collegeDeleteBtn.innerHTML = isLoading
                ? '<span class="material-symbols-rounded animate-spin text-base">progress_activity</span> Deleting…'
                : deleteBtnDefaultHTML;
        }

        function setDeleteConfirmLoading(isLoading) {
            if (!deleteConfirmBtn) return;
            deleteConfirmBtn.disabled = isLoading;
            if (deleteConfirmCancel) deleteConfirmCancel.disabled = isLoading;
            if (deleteConfirmInput) deleteConfirmInput.disabled = isLoading;
            deleteConfirmBtn.innerHTML = isLoading
                ? '<span class="material-symbols-rounded animate-spin text-base">progress_activity</span> Deleting…'
                : '<span class="material-symbols-rounded text-base">delete_forever</span> Force Delete';
        }

        function openDeleteConfirmModal(collegeName) {
            pendingDeleteCollegeName = String(collegeName || '').trim();
            if (!pendingDeleteCollegeName) pendingDeleteCollegeName = 'UNKNOWN';

            // UI Reset
            if (deleteConfirmCollegeName) deleteConfirmCollegeName.textContent = pendingDeleteCollegeName;
            if (deleteConfirmInput) {
                deleteConfirmInput.value = '';
                deleteConfirmInput.classList.remove('border-green-500', 'focus:border-green-500', 'ring-green-500/20');
                deleteConfirmInput.classList.remove('border-red-500', 'focus:border-red-500', 'ring-red-500/20'); // Reset potential error states
            }
            if (deleteConfirmMessage) {
                deleteConfirmMessage.classList.add('hidden');
            }
            if (deleteConfirmBtn) deleteConfirmBtn.disabled = true;

            deleteConfirmModal?.classList.remove('hidden');
            document.body.classList.add('overflow-hidden');

            // Focus after transition
            setTimeout(() => {
                deleteConfirmInput?.focus();
            }, 100);
        }

        function closeDeleteConfirmModal() {
            deleteConfirmModal?.classList.add('hidden');
            pendingDeleteCollegeName = '';
            if (deleteConfirmInput) deleteConfirmInput.value = '';
            if (deleteConfirmMessage) deleteConfirmMessage.classList.add('hidden');

            // Only remove overflow hidden if the main modal is also hidden or not present
            if (!collegeModal || collegeModal.classList.contains('hidden')) {
                document.body.classList.remove('overflow-hidden');
            }
        }

        function initDeleteConfirm() {
            if (!deleteConfirmInput) return;

            deleteConfirmInput.addEventListener('input', () => {
                const typed = deleteConfirmInput.value.trim();
                const expected = pendingDeleteCollegeName;

                if (typed === expected) {
                    deleteConfirmBtn.disabled = false;
                    deleteConfirmMessage.classList.add('hidden');
                    deleteConfirmInput.classList.remove('border-red-500', 'focus:border-red-500', 'ring-red-500/20');
                    deleteConfirmInput.classList.add('border-green-500', 'focus:border-green-500', 'ring-green-500/20');
                } else {
                    deleteConfirmBtn.disabled = true;
                    deleteConfirmInput.classList.remove('border-green-500', 'focus:border-green-500', 'ring-green-500/20');

                    if (typed.length >= expected.length && typed !== expected) {
                        deleteConfirmInput.classList.add('border-red-500', 'focus:border-red-500', 'ring-red-500/20');
                        deleteConfirmMessage.classList.remove('hidden');
                    } else {
                        deleteConfirmInput.classList.remove('border-red-500', 'focus:border-red-500', 'ring-red-500/20');
                        deleteConfirmMessage.classList.add('hidden');
                    }
                }
            });

            deleteConfirmCancel?.addEventListener('click', closeDeleteConfirmModal);
            deleteConfirmBackdrop?.addEventListener('click', closeDeleteConfirmModal);

            // Handle Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    if (!deleteConfirmModal.classList.contains('hidden')) {
                        closeDeleteConfirmModal();
                    } else if (!collegeModal.classList.contains('hidden')) {
                        closeCollegeModal();
                    }
                }
            });

            // Perform delete on button click
            deleteConfirmBtn?.addEventListener('click', async () => {
                if (!editingCollegeId) return;
                setDeleteConfirmLoading(true);

                try {
                    await Collage.fetchJson(`/api/colleges/${editingCollegeId}?force=true`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${getAnyToken()}`
                        }
                    });

                    closeDeleteConfirmModal();
                    closeCollegeModal();
                    await loadColleges();
                } catch (err) {
                    console.error(err);
                    alert('Error deleting college: ' + (err.message || err));
                    setDeleteConfirmLoading(false);
                }
            });
        }

        initDeleteConfirm();

        function closeCollegeModal() {
            collegeModal.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
            resetModal();
        }

        const collegeLogoInput = document.getElementById('collegeLogo');
        const collegeLogoPreview = document.getElementById('collegeLogoPreview');
        const changeLogoBtn = document.getElementById('changeLogoBtn');
        const uploadLogoNowBtn = document.getElementById('uploadLogoNowBtn');
        let pendingLogoFile = null;
        window.__logoUploadedExplicitly = false;

        function openCollegeModal(mode, college) {
            modalMode = mode;
            resetModal();
            if (mode === 'edit' && college) {
                editingCollegeId = college.id;
                collegeNameInput.value = college.name || '';
                if (college.logo_url) {
                    collegeLogoPreview.src = college.logo_url;
                    collegeLogoPreview.classList.remove('hidden');
                    changeLogoBtn?.classList.remove('hidden');
                    uploadLogoNowBtn?.classList.add('hidden');
                } else {
                    collegeLogoPreview.classList.add('hidden');
                    changeLogoBtn?.classList.add('hidden');
                    uploadLogoNowBtn?.classList.add('hidden');
                }
            }
            collegeModalTitle.textContent = mode === 'edit' ? 'Edit college' : 'Add a new college';
            collegeSubmitBtn.innerHTML = mode === 'edit'
                ? `<span class="material-symbols-rounded text-base">save</span>Save changes`
                : `<span class="material-symbols-rounded text-base">save</span>Save college`;

            if (collegeDeleteBtn) {
                if (mode === 'edit') collegeDeleteBtn.classList.remove('hidden');
                else collegeDeleteBtn.classList.add('hidden');
                collegeDeleteBtn.disabled = false;
                collegeDeleteBtn.innerHTML = deleteBtnDefaultHTML;
            }
            collegeModal.classList.remove('hidden');
            document.body.classList.add('overflow-hidden');
            setTimeout(() => {
                collegeNameInput?.focus();
                if (mode === 'edit') {
                    collegeNameInput?.select();
                }
            }, 80);
        }

        async function handleCollegeDelete() {
            if (!editingCollegeId) return;
            const college = collegesCache.find(c => String(c.id) === String(editingCollegeId));
            const collegeName = String(college?.name || '').trim();
            if (!collegeName) {
                collegeModalMessage.textContent = 'Unable to delete: college name not found.';
                collegeModalMessage.classList.remove('hidden');
                return;
            }
            openDeleteConfirmModal(collegeName);
        }

        if (collegeLogoInput) {
            collegeLogoInput.addEventListener('change', (ev) => {
                const file = ev.target.files && ev.target.files[0];
                pendingLogoFile = file || null;
                window.__logoUploadedExplicitly = false;
                if (file) {
                    const reader = new FileReader();
                    reader.onload = () => {
                        collegeLogoPreview.src = reader.result;
                        collegeLogoPreview.classList.remove('hidden');
                    };
                    reader.readAsDataURL(file);
                    if (modalMode === 'edit') {
                        uploadLogoNowBtn?.classList.remove('hidden');
                    }
                } else {
                    collegeLogoPreview.classList.add('hidden');
                    uploadLogoNowBtn?.classList.add('hidden');
                }
            });
        }

        if (uploadLogoNowBtn) {
            uploadLogoNowBtn.addEventListener('click', async () => {
                if (!(editingCollegeId && pendingLogoFile)) {
                    console.debug('[CollegeModal] Upload button clicked but no editingCollegeId or pending file');
                    return;
                }
                const fd = new FormData();
                fd.append('file', pendingLogoFile);
                uploadLogoNowBtn.disabled = true;
                uploadLogoNowBtn.textContent = 'Uploading...';
                try {
                    console.debug('[CollegeModal] Explicit logo upload start');
                    const up = await fetch(`${apiBase}/api/colleges/${editingCollegeId}/logo`, { method: 'POST', body: fd });
                    if (!up.ok) {
                        let msg = 'Upload failed';
                        try { const jd = await up.json(); msg = jd.detail || jd.error || msg; } catch (e) { }
                        collegeModalMessage.textContent = msg;
                        collegeModalMessage.classList.remove('hidden');
                        console.warn('[CollegeModal] Explicit upload failed', msg);
                        console.debug('[CollegeModal] Response status', up.status);
                    } else {
                        window.__logoUploadedExplicitly = true;
                        uploadLogoNowBtn.textContent = 'Uploaded';
                        console.debug('[CollegeModal] Explicit logo upload success');
                    }
                } catch (e) {
                    console.error('[CollegeModal] Explicit upload error', e);
                } finally {
                    setTimeout(() => { uploadLogoNowBtn.disabled = false; }, 1500);
                }
            });
        }

        if (deleteConfirmInput) {
            deleteConfirmInput.addEventListener('input', () => {
                const typed = String(deleteConfirmInput.value || '').trim();
                const ok = typed === String(pendingDeleteCollegeName || '').trim();
                if (deleteConfirmBtn) deleteConfirmBtn.disabled = !ok;
                if (deleteConfirmMessage) {
                    if (!typed) {
                        deleteConfirmMessage.classList.add('hidden');
                    } else if (!ok) {
                        deleteConfirmMessage.textContent = 'Name does not match. Please type it exactly.';
                        deleteConfirmMessage.classList.remove('hidden');
                    } else {
                        deleteConfirmMessage.classList.add('hidden');
                    }
                }
            });
        }

        async function runForceDelete() {
            if (!editingCollegeId) return;
            const typed = String(deleteConfirmInput?.value || '').trim();
            if (typed !== String(pendingDeleteCollegeName || '').trim()) {
                if (deleteConfirmMessage) {
                    deleteConfirmMessage.textContent = 'Name does not match.';
                    deleteConfirmMessage.classList.remove('hidden');
                }
                return;
            }
            setDeleteConfirmLoading(true);
            collegeModalMessage.classList.add('hidden');
            try {
                await Collage.fetchJson(`/api/colleges/${editingCollegeId}?force=true`, { method: 'DELETE', skipAuth: false });
                closeDeleteConfirmModal();
                closeCollegeModal();
                await loadColleges();
            } catch (error) {
                let message = error?.message ?? 'Unable to delete college. Please try again.';
                if (typeof message !== 'string') {
                    try { message = JSON.stringify(message); } catch (_) { message = 'Unable to delete college. Please try again.'; }
                }
                if (message === '[object Object]') message = 'Unexpected response from server. Please try again.';
                if (deleteConfirmMessage) {
                    deleteConfirmMessage.textContent = message;
                    deleteConfirmMessage.classList.remove('hidden');
                }
                console.error(error);
            } finally {
                setDeleteConfirmLoading(false);
            }
        }

        deleteConfirmBtn?.addEventListener('click', runForceDelete);
        deleteConfirmCancel?.addEventListener('click', closeDeleteConfirmModal);
        deleteConfirmClose?.addEventListener('click', closeDeleteConfirmModal);
        deleteConfirmBackdrop?.addEventListener('click', closeDeleteConfirmModal);
        window.addEventListener('keydown', (evt) => {
            if (evt.key === 'Escape') {
                if (deleteConfirmModal && !deleteConfirmModal.classList.contains('hidden')) closeDeleteConfirmModal();
            }
        });

        function attachCollegeEditHandlers() {
            const editButtons = results.querySelectorAll('[data-college-edit]');
            editButtons.forEach(button => {
                button.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    const id = button.getAttribute('data-college-edit');
                    const college = collegesCache.find(item => item.id === id);
                    if (college) {
                        openCollegeModal('edit', college);
                    }
                });
            });
            // Make entire card (except edit button) clickable
            const cards = results.querySelectorAll('article.group');
            cards.forEach(card => {
                card.addEventListener('click', (e) => {
                    // Ignore clicks on edit button
                    if (e.target.closest('[data-college-edit]')) return;
                    const link = card.querySelector('[data-college-link]');
                    if (link) {
                        let ctx = {};
                        try { ctx = JSON.parse(link.getAttribute('data-collage-context') || '{}') || {}; } catch (_) { ctx = {}; }
                        Collage.navigate(link.getAttribute('href'), ctx);
                    }
                });
            });
        }

        async function handleCollegeSubmit(event) {
            event.preventDefault();
            const name = (collegeNameInput.value || '').trim();
            if (!name) {
                collegeModalMessage.textContent = 'Please enter the college name.';
                collegeModalMessage.classList.remove('hidden');
                collegeNameInput.focus();
                return;
            }
            collegeModalMessage.classList.add('hidden');
            setModalLoading(true);
            try {
                let createdId = null;
                if (modalMode === 'edit' && editingCollegeId) {
                    await Collage.fetchJson(`/api/colleges/${editingCollegeId}`, { method: 'PUT', body: { name }, skipAuth: false });
                    createdId = editingCollegeId;
                } else {
                    const created = await Collage.fetchJson('/api/colleges/simple', { method: 'POST', body: { name }, skipAuth: false });
                    createdId = created?.id;
                }
                // If user hasn't already uploaded the logo explicitly via the new button, do a final attempt
                if (createdId && pendingLogoFile && !window.__logoUploadedExplicitly) {
                    console.debug('[CollegeModal] Auto-uploading pending logo during save');
                    const fd = new FormData();
                    fd.append('file', pendingLogoFile);
                    try {
                        const up = await fetch(`${apiBase}/api/colleges/${createdId}/logo`, { method: 'POST', body: fd });
                        if (!up.ok) {
                            let msg = 'Logo upload failed';
                            try { const jd = await up.json(); msg = jd.detail || msg; } catch (e) { }
                            console.warn(msg);
                        } else {
                            window.__logoUploadedExplicitly = true;
                        }
                    } catch (e) { console.error(e); }
                }
                closeCollegeModal();
                await loadColleges();
            } catch (error) {
                let message = error?.message ?? 'Unable to save college. Please try again.';
                if (typeof message !== 'string') {
                    try {
                        message = JSON.stringify(message);
                    } catch (_) {
                        message = 'Unable to save college. Please try again.';
                    }
                }
                if (message === '[object Object]') {
                    message = 'Unexpected response from server. Please try again.';
                }
                collegeModalMessage.textContent = message;
                collegeModalMessage.classList.remove('hidden');
                console.error(error);
            } finally {
                setModalLoading(false);
            }
        }

        async function loadColleges() {
            showLoader();
            try {
                const colleges = await Collage.fetchJson('/api/colleges', { skipAuth: false });
                collegesCache = Array.isArray(colleges) ? colleges.slice() : [];
                if (!Array.isArray(colleges) || !colleges.length) {
                    showEmpty();
                    return;
                }
                updateMetrics(colleges.length, 'Live');
                const accentPalette = [
                    'from-brand-500/70 via-brandlt-300/60 to-brand-700/80',
                    'from-[#FF7FD1]/55 via-brand-500/60 to-brand-700/80',
                    'from-brandlt-200/60 via-white/40 to-brand-500/65',
                    'from-[#7F57D1]/55 via-brand-500/60 to-brand-700/80',
                    'from-brand-700/65 via-brandlt-400/55 to-brand-500/70'
                ];
                results.innerHTML = colleges.map((college, index) => {
                    const accentColor = accentPalette[index % accentPalette.length];
                    const target = `degrees.html?collegeId=${encodeURIComponent(college.id)}&collegeName=${encodeURIComponent((college && college.name) || '')}`;
                    const label = Collage.escapeHtml(college.name);
                    // Large logo (fallback if none)
                    const logoTag = college.logo_url
                        ? `<img src="${college.logo_url}" alt="${label} logo" class=\"h-20 w-20 rounded-2xl object-cover ring-2 ring-white/60 dark:ring-white/10 shadow-md\" />`
                        : `<div class=\"h-20 w-20 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center text-[11px] font-semibold ring-2 ring-white/40 dark:ring-white/10 shadow-md\">LOGO</div>`;
                    const editBtn = isAdmin ? `
                                                    <!-- Edit button top-right -->
                                                    <button type="button" data-college-edit="${college.id}" aria-label="Edit ${label}"
                                                        class="absolute top-5 right-5 z-30 inline-flex items-center justify-center rounded-full border border-white/40 bg-white/95 dark:bg-white/10 p-2 text-neutral-500 hover:text-brand-500 hover:border-brand-500/50 transition shadow-sm">
                                                        <span class="material-symbols-rounded text-base">edit</span>
                                                    </button>` : '';
                    return `
                                                <article class="group relative overflow-hidden rounded-3xl border border-black/5 dark:border-white/10 bg-white/75 dark:bg-white/5 backdrop-blur-xl p-6 shadow-soft transition">
                                                    <div class="absolute inset-x-6 top-6 h-32 rounded-3xl bg-gradient-to-r ${accentColor} opacity-25 blur-3xl"></div>
                                                    ${editBtn}
                                                    <!-- Logo centered vertically on right -->
                                                    <div class="absolute top-1/2 -translate-y-1/2 right-4 z-20 pointer-events-none">${logoTag}</div>
                                                    <div class="pr-16 pt-1"> <!-- further reduced gap -->
                                                        <h2 class="text-lg font-semibold text-neutral-900 dark:text-white leading-snug">
                                                            <a href="${target}" data-college-link class="inline-flex items-start gap-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/60 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-brand-900 group-hover:text-brand-500 transition cursor-pointer relative z-10">
                                                                <span class="whitespace-normal break-words">${label}</span>
                                                                <span class="material-symbols-rounded text-[17px] opacity-0 group-hover:opacity-100 transition flex-shrink-0 mt-[2px]">north_east</span>
                                                            </a>
                                                        </h2>
                                                        <p class="mt-4 text-sm text-neutral-600 dark:text-white/65">
                                                            Dive into its degrees, departments, batches, subjects, and syllabus hierarchy.
                                                        </p>
                                                        <a class="mt-5 inline-flex items-center gap-2 text-sm font-medium text-brand-500 dark:text-white/85" href="${target}">
                                                            Manage hierarchy
                                                            <span class="material-symbols-rounded text-base transition group-hover:translate-x-1">arrow_forward</span>
                                                        </a>
                                                    </div>
                                                </article>`;
                }).join('');
                attachCollegeEditHandlers();
            } catch (err) {
                console.error(err);
                showError(err.message || 'Unexpected error');
            }
        }

        function initCollegeManagement() {
            addCollegeBtn?.addEventListener('click', () => openCollegeModal('add'));
            collegeModalCancel?.addEventListener('click', closeCollegeModal);
            collegeModalClose?.addEventListener('click', closeCollegeModal);
            collegeModalBackdrop?.addEventListener('click', closeCollegeModal);
            collegeForm?.addEventListener('submit', handleCollegeSubmit);
            collegeDeleteBtn?.addEventListener('click', handleCollegeDelete);
            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape' && !collegeModal.classList.contains('hidden')) {
                    closeCollegeModal();
                }
            });
        }

        document.addEventListener('DOMContentLoaded', async () => {
            try {
                showLoader();
                currentRole = await requireAdminOrEmployee();
                isAdmin = String(currentRole || '').toLowerCase() === 'admin';
                if (!isAdmin) {
                    addCollegeBtn?.classList.add('hidden');
                } else {
                    initCollegeManagement();
                }
                await loadColleges();
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
