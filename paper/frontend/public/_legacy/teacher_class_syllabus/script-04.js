// Extracted from ui/teacher_class_syllabus.html (inline <script> #4).
        const $ = (s, r = document) => r.querySelector(s);
        const esc = (s = '') => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const params = new URLSearchParams(location.search);
        const courseId = params.get('course_id') || params.get('subject_id');
        const subjectQuery = params.get('subject') || '';
        const classId = params.get('class_id') || '';
        const batchIdParam = params.get('batch_id') || '';
        const sectionParam = params.get('section') || '';
        const semesterParam = params.get('semester') || '';
        const unitModal = $('#unitModal');
        const unitModalBackdrop = $('#unitModalBackdrop');
        const unitModalClose = $('#unitModalClose');
        const unitModalCancel = $('#unitModalCancel');
        const unitModalTitle = $('#unitModalTitle');
        const unitSubmitBtn = $('#unitSubmitBtn');
        const unitDeleteBtn = $('#unitDeleteBtn');
        const unitForm = $('#unitForm');
        const unitTitleInput = $('#unitTitle');
        const topicsContainer = $('#topicsContainer');
        const addTopicRowButton = $('#addTopicRow');
        const addTopicRowBottomButton = $('#addTopicRowBottom');
        const unitModalMessage = $('#unitModalMessage');

        function normalizeStoredToken(v) {
            const raw = String(v || '').trim();
            if (!raw || raw === '__COOKIE_AUTH__' || raw === 'null' || raw === 'undefined' || raw === 'none') return '';
            return raw;
        }

        const ensureAuthReady = (typeof window.__PX_ENSURE_AUTH_READY === 'function')
            ? window.__PX_ENSURE_AUTH_READY
            : (async () => false);

        function getToken() {
            // Cookie-session first; attach bearer fallback only when available.
            try {
                const fb = normalizeStoredToken(sessionStorage.getItem('paperx_bearer_fallback'));
                if (fb) return fb;
            } catch { }
            try {
                const fb2 = normalizeStoredToken(localStorage.getItem('paperx_bearer_fallback'));
                if (fb2) return fb2;
            } catch { }
            return '';
        }

        const themeRoot = document.documentElement;
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-theme-toggle]');
            if (!btn) return;
            const isDark = themeRoot.classList.toggle('dark');
            localStorage.setItem('px_theme', isDark ? 'dark' : 'light');
            const icon = btn.querySelector('.material-symbols-rounded');
            if (icon) icon.textContent = isDark ? 'light_mode' : 'dark_mode';
        });

        $('#backBtn').addEventListener('click', () => { history.back(); });
        const st = $('#scrollTop');
        window.addEventListener('scroll', () => { if (scrollY > 400) st.classList.remove('hidden'); else st.classList.add('hidden'); });
        st.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

        let syllabusCourse = null;
        let unitModalMode = 'add';
        let topicRatings = {};  // Stores topic ratings: { topicId: rating }

        // Handle star click to save rating
        async function handleStarClick(topicId, rating, container) {
            if (!topicId || !rating) return;
            const token = getToken();
            if (!token) {
                console.warn('No token available for rating');
                return;
            }

            container.classList.add('saving');
            try {
                const baseRaw = window.__API_BASE || window.API_BASE || 'http://0.0.0.0:10000';
                const base = String(baseRaw || '').replace(/\/$/, '');
                const res = await fetch(`${base}/api/syllabus/topics/${encodeURIComponent(topicId)}/rating`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({ rating })
                });
                if (!res.ok) throw new Error('Failed to save rating');

                // Update local cache
                topicRatings[topicId] = rating;

                // Update UI
                const stars = container.querySelectorAll('.star');
                stars.forEach((st, i) => {
                    if (i < rating) st.classList.add('filled');
                    else st.classList.remove('filled');
                });
            } catch (err) {
                console.error('[rating] save failed', err);
            } finally {
                container.classList.remove('saving');
            }
        }

        // Load ratings for the current course
        async function loadRatings() {
            if (!courseId) return;
            try { await ensureAuthReady(); } catch { }

            try {
                const baseRaw = window.__API_BASE || window.API_BASE || 'http://0.0.0.0:10000';
                const base = String(baseRaw || '').replace(/\/$/, '');
                let token = getToken();
                let headers = token ? { 'Authorization': 'Bearer ' + token } : {};
                let res = await fetch(`${base}/api/syllabus/courses/${encodeURIComponent(courseId)}/ratings`, { headers });
                if (res.status === 401) {
                    try { await ensureAuthReady(); } catch { }
                    token = getToken();
                    headers = token ? { 'Authorization': 'Bearer ' + token } : {};
                    res = await fetch(`${base}/api/syllabus/courses/${encodeURIComponent(courseId)}/ratings`, { headers });
                }
                if (res.ok) {
                    const data = await res.json();
                    topicRatings = data.ratings || {};
                }
            } catch (err) {
                console.error('[ratings] load failed', err);
            }
        }

        function resetUnitModal() {
            unitForm?.reset();
            unitModalMessage.textContent = '';
            unitModalMessage.classList.add('hidden');
            unitModalMode = 'add';
            if (unitDeleteBtn) unitDeleteBtn.classList.add('hidden');
            unitSubmitBtn.innerHTML = '<span class="material-symbols-rounded text-base">save</span>Save unit';
            topicsContainer.innerHTML = '';
            addTopicRow();
        }

        function closeUnitModal() {
            unitModal.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
            document.documentElement.classList.remove('overflow-hidden');
            resetUnitModal();
            if (syllabusCourse) syllabusCourse.editingUnitId = null;
        }

        function openUnitModal(mode = 'add', unit) {
            if (!courseId) return;
            resetUnitModal();
            unitModalMode = mode;
            if (mode === 'edit' && unit) {
                unitTitleInput.value = unit.unit_title || '';
                unitTitleInput.disabled = true; // Disable title editing for existing units
                topicsContainer.innerHTML = '';
                (unit.topics || []).forEach(t => addTopicRow(t.topic || t.topic_title || '', t.id || null));
                // unitDeleteBtn remains hidden - deleting existing units is disabled
                syllabusCourse = syllabusCourse || {};
                syllabusCourse.editingUnitId = unit.id || unit.unit_id;
            } else {
                unitTitleInput.disabled = false;
            }
            unitModalTitle.textContent = mode === 'edit' ? 'Add topics to unit' : 'Add unit';
            unitSubmitBtn.innerHTML = mode === 'edit' ? '<span class="material-symbols-rounded text-base">save</span>Save changes' : '<span class="material-symbols-rounded text-base">save</span>Save unit';
            unitModal.classList.remove('hidden');
            document.body.classList.add('overflow-hidden');
            document.documentElement.classList.add('overflow-hidden');
            if (mode !== 'edit') setTimeout(() => unitTitleInput?.focus(), 50);
        }

        function addTopicRow(value = '', topicId = null) {
            const id = Math.random().toString(36).slice(2, 9);
            const row = document.createElement('div');
            row.className = 'flex items-center gap-2';
            row.setAttribute('data-topic-row', '');
            if (topicId) row.setAttribute('data-topic-id', String(topicId));

            const isExisting = !!topicId;
            const inputState = isExisting ? 'disabled readonly class="flex-1 rounded-2xl border border-transparent bg-black/5 dark:bg-white/10 px-3.5 py-2 text-sm text-neutral-600 dark:text-white/70 cursor-not-allowed"' : 'class="flex-1 rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-white/5 px-3.5 py-2 text-sm text-neutral-900 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"';

            const dragHtml = isExisting
                ? ``
                : `<button type="button" data-drag-handle aria-label="Drag to reorder" class="inline-flex items-center justify-center rounded-full border border-black/10 dark:border-white/15 p-2 text-neutral-500 hover:text-brand-500 hover:border-brand-500/50 cursor-grab active:cursor-grabbing transition"><span class="material-symbols-rounded text-base">drag_indicator</span></button>`;

            const deleteHtml = isExisting
                ? ``
                : `<button type="button" aria-label="Remove topic" class="inline-flex items-center justify-center rounded-full border border-black/10 dark:border-white/15 p-2 text-neutral-500 hover:text-brand-500 hover:border-brand-500/50 transition"><span class="material-symbols-rounded text-base">close</span></button>`;

            row.innerHTML = `
                ${dragHtml}
                <input type="text" data-topic-input id="topic-${id}" placeholder="Topic title" value="${esc(value)}" ${inputState} maxlength="256" />
                ${deleteHtml}`;

            if (!isExisting) {
                const removeBtn = row.querySelector('button[aria-label="Remove topic"]');
                if (removeBtn) {
                    removeBtn.addEventListener('click', () => {
                        row.remove();
                        if (!topicsContainer.querySelector('[data-topic-input]')) addTopicRow();
                    });
                }
            }
            topicsContainer.appendChild(row);
            const handleBtn = row.querySelector('[data-drag-handle]');
            if (handleBtn) handleBtn.setAttribute('draggable', 'true');
            enableTopicDrag();

            // Auto-scroll to the new row if it's a new topic being added manually
            if (!isExisting) {
                setTimeout(() => {
                    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            }
        }

        function enableTopicDrag() {
            if (!topicsContainer || topicsContainer.__dragBound) return;
            topicsContainer.__dragBound = true;
            let dragEl = null;
            topicsContainer.addEventListener('dragstart', (e) => {
                const row = e.target.closest('[data-topic-row]');
                const handle = e.target.closest('[data-drag-handle]');
                if (!row || !handle) { e.preventDefault(); return; }
                dragEl = row;
                dragEl.classList.add('opacity-50');
                try { e.dataTransfer.setData('text/plain', ''); } catch { }
                e.dataTransfer.effectAllowed = 'move';
            });
            topicsContainer.addEventListener('dragover', (e) => {
                if (!dragEl) return;
                e.preventDefault();
                const after = getDragAfterElement(topicsContainer, e.clientY);
                if (after == null) topicsContainer.appendChild(dragEl); else topicsContainer.insertBefore(dragEl, after);
            });
            topicsContainer.addEventListener('drop', (e) => { if (dragEl) e.preventDefault(); });
            topicsContainer.addEventListener('dragend', () => { if (dragEl) dragEl.classList.remove('opacity-50'); dragEl = null; });
        }

        function getDragAfterElement(container, y) {
            const els = [...container.querySelectorAll('[data-topic-row]:not(.opacity-50)')];
            let closest = { offset: Number.NEGATIVE_INFINITY, element: null };
            for (const child of els) {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2;
                if (offset < 0 && offset > closest.offset) closest = { offset, element: child };
            }
            return closest.element;
        }

        function setUnitModalLoading(isLoading) {
            unitSubmitBtn.disabled = isLoading;
            unitModalCancel.disabled = isLoading;
            if (unitDeleteBtn) unitDeleteBtn.disabled = isLoading;
            unitSubmitBtn.innerHTML = isLoading
                ? '<span class="material-symbols-rounded animate-spin text-base">progress_activity</span> Saving…'
                : (unitModalMode === 'edit' ? '<span class="material-symbols-rounded text-base">save</span>Save changes' : '<span class="material-symbols-rounded text-base">save</span>Save unit');
        }

        function setUnitDeleteLoading(isLoading) {
            if (!unitDeleteBtn) return;
            unitDeleteBtn.disabled = isLoading;
            unitModalCancel.disabled = isLoading;
            unitSubmitBtn.disabled = isLoading;
            unitDeleteBtn.innerHTML = isLoading
                ? '<span class="material-symbols-rounded animate-spin text-base">progress_activity</span> Deleting…'
                : '<span class="material-symbols-rounded text-base">delete</span>Delete';
        }

        function setupStudentsButton() {
            const wrap = $('#classActions');
            if (!wrap) return;
            wrap.classList.remove('hidden');
            wrap.innerHTML = `
                <div class="flex flex-wrap gap-2">
                    <button type="button" id="addUnitBtn"
                        class="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-full ring-1 ring-black/10 dark:ring-white/15 bg-brand-500 text-white shadow-glow hover:bg-brand-600">
                        <span class="material-symbols-rounded text-base">add</span>
                        Add unit
                    </button>
                    ${classId ? `<button type="button" id="studentsBtn"
                        class="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-full ring-1 ring-black/10 dark:ring-white/15 bg-white/70 dark:bg-white/10 hover:bg-white/90 dark:hover:bg-white/20">
                        <span class="material-symbols-rounded text-base">group</span>
                        Students
                    </button>` : ''}
                </div>`;
            const btn = $('#studentsBtn');
            if (btn) {
                btn.addEventListener('click', () => {
                    const next = new URLSearchParams();
                    next.set('class_id', classId);
                    if (courseId) next.set('course_id', courseId);
                    if (subjectQuery) next.set('subject', subjectQuery);
                    if (batchIdParam) next.set('batch_id', batchIdParam);
                    if (sectionParam) next.set('section', sectionParam);
                    if (semesterParam) next.set('semester', semesterParam);
                    window.location.href = `teacher_class_students.html?${next.toString()}`;
                });
            }
            const addUnitBtn = $('#addUnitBtn');
            if (addUnitBtn) addUnitBtn.addEventListener('click', () => openUnitModal('add'));
        }

        async function loadSyllabus() {
            if (!courseId) { renderStatus('Missing course id', true); return; }
            // Load ratings first
            await loadRatings();
            try {
                const baseRaw = window.__API_BASE || window.API_BASE || 'http://0.0.0.0:10000';
                const base = String(baseRaw || '').replace(/\/$/, '');
                try { await ensureAuthReady(); } catch { }
                let token = getToken();
                let headers = token ? { Authorization: 'Bearer ' + token } : {};
                let res = await fetch(`${base}/api/syllabus/courses/${encodeURIComponent(courseId)}`, { headers });
                if (res.status === 401) {
                    try { await ensureAuthReady(); } catch { }
                    token = getToken();
                    headers = token ? { Authorization: 'Bearer ' + token } : {};
                    res = await fetch(`${base}/api/syllabus/courses/${encodeURIComponent(courseId)}`, { headers });
                }
                if (!res.ok) { throw new Error(`Failed to load syllabus (${res.status})`); }
                const data = await res.json();
                syllabusCourse = data;
                renderCourse(data);
            } catch (err) {
                console.error('[syllabus] load failed', err);
                renderStatus(err.message || 'Unable to load syllabus', true);
            }
        }

        function renderStatus(msg, isError = false) {
            const node = $('#status');
            if (node) {
                node.textContent = msg;
                node.className = 'text-sm ' + (isError ? 'text-red-600 dark:text-red-400' : 'text-neutral-600 dark:text-white/70');
            }
        }

        let currentCourseTitle = '';

        function renderCourse(course) {
            if (!course) { renderStatus('No syllabus found', true); return; }
            const title = course.title || subjectQuery || 'Subject';
            currentCourseTitle = title;
            const code = course.course_code ? course.course_code.toUpperCase() : '';
            $('#subjectTitle').textContent = title;
            $('#subjectInitial').textContent = (title || 'S').charAt(0).toUpperCase();
            const meta = $('#subjectMeta');
            meta.innerHTML = '';
            if (code) meta.insertAdjacentHTML('beforeend', `<span class="px-2 py-1 rounded-full ring-1 ring-black/10 dark:ring-white/15 text-[11px]">${esc(code)}</span>`);
            if (course.semester) meta.insertAdjacentHTML('beforeend', `<span class="px-2 py-1 rounded-full bg-brand-500/10 text-brand-700 dark:text-brandlt-200 text-[11px]">Sem ${esc(course.semester)}</span>`);
            if (course.batch_id) meta.insertAdjacentHTML('beforeend', `<span class="px-2 py-1 rounded-full ring-1 ring-black/10 dark:ring-white/15 text-[11px]">Batch ${esc(course.batch_id)}</span>`);
            if (sectionParam) meta.insertAdjacentHTML('beforeend', `<span class="px-2 py-1 rounded-full ring-1 ring-black/10 dark:ring-white/15 text-[11px]">Section ${esc(sectionParam)}</span>`);
            renderStatus('');
            renderUnits(course.units || []);
        }

        function renderUnits(units) {
            const wrap = $('#unitsWrap');
            const empty = $('#emptyState');
            wrap.innerHTML = '';
            if (!units.length) { empty.classList.remove('hidden'); return; }
            empty.classList.add('hidden');
            units.forEach((u, idx) => {
                const topics = Array.isArray(u.topics) ? u.topics : [];
                const unitId = `unit-${idx}`;
                const unitUuid = u.id || u.unit_id || '';
                const hasBlink = topics.some(t => (t.image_url || '').trim() !== '');
                const li = document.createElement('div');
                li.className = 'rounded-2xl ring-1 ring-black/5 dark:ring-white/10 bg-white/70 dark:bg-white/5 overflow-hidden';
                const blinkHtml = hasBlink && unitUuid ? `
                        <button type="button" class="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-brand-500 via-[#B06AB3] to-[#FF7FD1] px-3 py-1 text-[11px] font-semibold text-white shadow-[0_10px_28px_rgba(158,75,138,0.35)] hover:shadow-[0_14px_34px_rgba(158,75,138,0.45)] transition" data-blink="${unitUuid}">
                            <span class="material-symbols-rounded text-sm">bolt</span>
                            Blink
                        </button>` : '';
                li.innerHTML = `
                    <div class="px-4 py-3 flex items-center justify-between gap-3 hover:bg-white/60 dark:hover:bg-white/10 transition-colors">
                        <button type="button" class="flex-1 flex items-center justify-between gap-3 text-left" aria-expanded="false" data-toggle="${unitId}">
                            <span class="flex items-center gap-2 text-sm font-semibold">
                                <span class="material-symbols-rounded text-neutral-500 -rotate-90" aria-hidden="true">expand_more</span>
                                ${esc(u.unit_title || 'Unit')}
                            </span>
                            <span class="text-[11px] text-neutral-500 dark:text-white/60">${topics.length} topics</span>
                        </button>
                        <div class="flex items-center gap-2">
                            <button type="button" class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-black/10 dark:ring-white/15 text-neutral-700 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10" data-unit-edit="${unitUuid}" data-unit-index="${idx}">
                                <span class="material-symbols-rounded text-sm">edit</span>
                                Edit
                            </button>
                            ${blinkHtml}
                        </div>
                    </div>
                    <div id="${unitId}" class="px-4 pb-4 hidden">
                        <ul class="space-y-1 text-sm"></ul>
                    </div>
                `;
                const list = li.querySelector('ul');
                topics.forEach(t => {
                    const topicId = t.id || t.topic_id || '';
                    const row = document.createElement('li');
                    row.className = 'flex items-center justify-between gap-3 py-1 px-2 rounded hover:bg-black/5 dark:hover:bg-white/5';
                    const left = document.createElement('div');
                    left.className = 'flex items-center gap-2 min-w-0';
                    const dot = document.createElement('span');
                    dot.className = 'size-2 rounded-full bg-brand-500/70 flex-shrink-0';
                    const link = document.createElement('a');
                    link.href = 'notes_generator.html?topic=' + encodeURIComponent(t.topic || '');
                    link.textContent = t.topic || 'Topic';
                    link.className = 'text-brand-600 dark:text-brand-200 hover:underline truncate';
                    link.target = '_blank';
                    link.rel = 'noopener';
                    left.appendChild(dot);
                    left.appendChild(link);
                    row.appendChild(left);

                    // Right side container for stars and PPT button
                    const right = document.createElement('div');
                    right.className = 'flex items-center gap-2 flex-shrink-0';

                    // Star rating component
                    if (topicId) {
                        const starContainer = document.createElement('div');
                        starContainer.className = 'star-rating';
                        starContainer.setAttribute('data-topic-id', topicId);
                        const currentRating = topicRatings[topicId] || 0;
                        for (let s = 1; s <= 3; s++) {
                            const star = document.createElement('span');
                            star.className = 'star material-symbols-rounded' + (s <= currentRating ? ' filled' : '');
                            star.textContent = s <= currentRating ? 'star' : 'star';
                            star.setAttribute('data-star', s);
                            star.addEventListener('click', (ev) => {
                                ev.stopPropagation();
                                handleStarClick(topicId, s, starContainer);
                            });
                            star.addEventListener('mouseenter', () => {
                                const stars = starContainer.querySelectorAll('.star');
                                stars.forEach((st, i) => {
                                    if (i < s) st.classList.add('hovered');
                                    else st.classList.remove('hovered');
                                });
                            });
                            star.addEventListener('mouseleave', () => {
                                starContainer.querySelectorAll('.star').forEach(st => st.classList.remove('hovered'));
                            });
                            starContainer.appendChild(star);
                        }
                        right.appendChild(starContainer);
                    }

                    const pptUrl = t.ppt_url || t.ppt || '';
                    if (pptUrl) {
                        const pptBtn = document.createElement('button');
                        pptBtn.type = 'button';
                        pptBtn.className = 'inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full ring-1 ring-black/10 dark:ring-white/15 text-brand-600 dark:text-brand-200 hover:bg-brand-500/10';
                        pptBtn.innerHTML = '<span class="material-symbols-rounded text-sm">slideshow</span>PPT';
                        pptBtn.addEventListener('click', () => window.open(pptUrl, '_blank', 'noopener'));
                        right.appendChild(pptBtn);
                    }
                    row.appendChild(right);
                    list.appendChild(row);
                });
                const btn = li.querySelector('[data-toggle]');
                const caret = btn.querySelector('.material-symbols-rounded');
                const panel = li.querySelector(`#${unitId}`);
                btn.addEventListener('click', () => {
                    const isHidden = panel.classList.toggle('hidden');
                    btn.setAttribute('aria-expanded', (!isHidden).toString());
                    caret.classList.toggle('-rotate-90', isHidden);
                    caret.classList.toggle('rotate-0', !isHidden);
                });
                const blinkBtn = li.querySelector('[data-blink]');
                if (blinkBtn && !blinkBtn.disabled) {
                    blinkBtn.addEventListener('click', (ev) => {
                        ev.stopPropagation();
                        const url = `syllabus_blink.html?unit_id=${encodeURIComponent(unitUuid)}&course_title=${encodeURIComponent(currentCourseTitle || '')}&unit_title=${encodeURIComponent(u.unit_title || '')}`;
                        window.open(url, '_blank', 'noopener');
                    });
                }
                const editBtn = li.querySelector('[data-unit-edit]');
                if (editBtn) {
                    editBtn.addEventListener('click', (ev) => {
                        ev.stopPropagation();
                        const unitsArr = syllabusCourse?.units || [];
                        const idxNum = Number(editBtn.getAttribute('data-unit-index'));
                        const unitData = unitsArr[idxNum];
                        openUnitModal('edit', unitData);
                    });
                }
                wrap.appendChild(li);
            });
        }

        async function handleUnitSubmit(e) {
            e.preventDefault();
            if (!courseId) {
                unitModalMessage.textContent = 'Missing course context.';
                unitModalMessage.classList.remove('hidden');
                return;
            }
            const unit_title = (unitTitleInput.value || '').trim();
            if (!unit_title) {
                unitModalMessage.textContent = 'Enter a unit title.';
                unitModalMessage.classList.remove('hidden');
                unitTitleInput.focus();
                return;
            }
            const rows = [...topicsContainer.querySelectorAll('[data-topic-row]')];
            const topics = rows.map(row => {
                const inp = row.querySelector('[data-topic-input]');
                const topic = (inp?.value || '').trim();
                const id = row.getAttribute('data-topic-id');
                if (!topic) return null;
                return id ? { id, topic } : { topic };
            }).filter(Boolean);
            const payload = { unit_title, topics };
            unitModalMessage.classList.add('hidden');
            setUnitModalLoading(true);
            try {
                const baseRaw = window.__API_BASE || window.API_BASE || 'http://0.0.0.0:10000';
                const base = String(baseRaw || '').replace(/\/$/, '');
                const token = getToken();
                const headers = token ? { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token } : { 'Content-Type': 'application/json' };
                if (unitModalMode === 'edit' && syllabusCourse?.editingUnitId) {
                    const res = await fetch(`${base}/api/syllabus/units/${encodeURIComponent(syllabusCourse.editingUnitId)}`, { method: 'PUT', headers, body: JSON.stringify(payload) });
                    if (!res.ok) throw new Error(`Failed to save (${res.status})`);
                } else {
                    const res = await fetch(`${base}/api/syllabus/courses/${encodeURIComponent(courseId)}/units`, { method: 'POST', headers, body: JSON.stringify(payload) });
                    if (!res.ok) throw new Error(`Failed to save (${res.status})`);
                }
                closeUnitModal();
                await loadSyllabus();
            } catch (error) {
                const m = error?.message || 'Unable to save unit.';
                unitModalMessage.textContent = m;
                unitModalMessage.classList.remove('hidden');
                console.error(error);
            } finally {
                setUnitModalLoading(false);
            }
        }

        async function handleUnitDelete() {
            if (!syllabusCourse || !syllabusCourse.editingUnitId) return;
            const ok = window.confirm('Delete this unit and its topics? This cannot be undone.');
            if (!ok) return;
            setUnitDeleteLoading(true);
            unitModalMessage.classList.add('hidden');
            try {
                const baseRaw = window.__API_BASE || window.API_BASE || 'http://0.0.0.0:10000';
                const base = String(baseRaw || '').replace(/\/$/, '');
                const token = getToken();
                const headers = token ? { Authorization: 'Bearer ' + token } : {};
                const res = await fetch(`${base}/api/syllabus/units/${encodeURIComponent(syllabusCourse.editingUnitId)}`, { method: 'DELETE', headers });
                if (!res.ok) throw new Error(`Failed to delete (${res.status})`);
                closeUnitModal();
                await loadSyllabus();
            } catch (error) {
                const m = error?.message || 'Unable to delete unit.';
                unitModalMessage.textContent = m;
                unitModalMessage.classList.remove('hidden');
                console.error(error);
            } finally {
                setUnitDeleteLoading(false);
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            setupStudentsButton();
            if (unitForm) unitForm.addEventListener('submit', handleUnitSubmit);
            if (unitDeleteBtn) unitDeleteBtn.addEventListener('click', handleUnitDelete);
            if (unitModalCancel) unitModalCancel.addEventListener('click', closeUnitModal);
            if (unitModalClose) unitModalClose.addEventListener('click', closeUnitModal);
            if (unitModalBackdrop) unitModalBackdrop.addEventListener('click', closeUnitModal);
            if (addTopicRowButton) addTopicRowButton.addEventListener('click', () => addTopicRow());
            if (addTopicRowBottomButton) addTopicRowBottomButton.addEventListener('click', () => addTopicRow());
            document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !unitModal.classList.contains('hidden')) closeUnitModal(); });
            loadSyllabus();
        });
