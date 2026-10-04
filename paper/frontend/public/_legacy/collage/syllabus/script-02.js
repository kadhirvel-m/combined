// Extracted from ui/collage/syllabus.html (inline <script> #2).
        const apiBase = (window.API_BASE || window.__API_BASE || 'http://0.0.0.0:10000').replace(/\/$/, '');

        const params = (window.Collage && typeof window.Collage.parseQuery === 'function') ? window.Collage.parseQuery() : (() => {
            const q = {};
            const s = window.location.search || '';
            if (!s) return q;
            const usp = new URLSearchParams(s);
            usp.forEach((v, k) => q[k] = v);
            return q;
        })();
        const courseId = params.courseId;
        const courseCode = params.courseCode ? decodeURIComponent(params.courseCode) : '';
        const courseTitle = params.courseTitle ? decodeURIComponent(params.courseTitle) : '';
        const semesterParam = params.semester ? Number(params.semester) : null;
        const batchRange = params.batchRange ? decodeURIComponent(params.batchRange) : '';
        const batchId = params.batchId ? decodeURIComponent(params.batchId) : '';
        const collegeName = params.collegeName ? decodeURIComponent(params.collegeName) : '';
        const degreeName = params.degreeName ? decodeURIComponent(params.degreeName) : '';
        const departmentName = params.departmentName ? decodeURIComponent(params.departmentName) : '';

        const results = document.getElementById('results');
        const titleEl = document.getElementById('pageTitle');
        const subtitleEl = document.getElementById('pageSubtitle');
        const breadcrumbsEl = document.getElementById('breadcrumbs');
        const contextPanel = document.getElementById('contextPanel');
        const backLink = document.getElementById('backLink');
        const addUnitBtn = document.getElementById('addUnitBtn');

        const unitModal = document.getElementById('unitModal');
        const unitModalBackdrop = document.getElementById('unitModalBackdrop');
        const unitModalTitle = document.getElementById('unitModalTitle');
        const unitModalMessage = document.getElementById('unitModalMessage');
        const unitModalCancel = document.getElementById('unitModalCancel');
        const unitModalClose = document.getElementById('unitModalClose');
        const unitSubmitBtn = document.getElementById('unitSubmitBtn');
        const unitDeleteBtn = document.getElementById('unitDeleteBtn');
        const unitForm = document.getElementById('unitForm');
        const unitTitleInput = document.getElementById('unitTitle');
        const topicsContainer = document.getElementById('topicsContainer');
        const addTopicRowButton = document.getElementById('addTopicRow');
        const addTopicRowBottomButton = document.getElementById('addTopicRowBottom');

        let syllabusCourse = null;
        let unitModalMode = 'add';

        const topicSuggestInstances = new Set();
        let topicSuggestDocClickBound = false;

        function debounce(fn, ms) {
            let t = null;
            return function () {
                const args = arguments;
                clearTimeout(t);
                t = setTimeout(() => fn.apply(null, args), ms);
            };
        }

        function attachTopicAutocomplete(topicInputEl, suggestWrapEl) {
            if (!topicInputEl || !suggestWrapEl) return;
            if (topicInputEl.__topicSuggestBound) return;
            topicInputEl.__topicSuggestBound = true;

            let aborter = null;
            let activeIndex = -1;
            let currentItems = [];

            function hide() {
                suggestWrapEl.classList.add('hidden');
                activeIndex = -1;
            }

            function show() {
                if (currentItems.length) suggestWrapEl.classList.remove('hidden');
            }

            function render(items) {
                currentItems = Array.isArray(items) ? items : [];
                activeIndex = -1;
                suggestWrapEl.innerHTML = '';

                if (!currentItems.length) {
                    hide();
                    return;
                }

                currentItems.forEach((item, idx) => {
                    const topic = (item && item.topic) ? String(item.topic) : '';
                    const div = document.createElement('div');
                    div.className = 'topic-suggestion-item px-3 py-2 rounded-xl cursor-pointer flex items-center justify-between gap-3 hover:bg-black/5 dark:hover:bg-white/5 transition';
                    div.setAttribute('role', 'option');
                    div.setAttribute('data-idx', String(idx));
                    div.innerHTML = `
                        <div class="min-w-0 flex-1">
                            <div class="text-sm font-medium text-neutral-900 dark:text-white truncate">${Collage.escapeHtml(topic)}</div>
                            <div class="mt-0.5 text-[11px] text-neutral-500 dark:text-white/50">AI notes</div>
                        </div>
                        <span class="material-symbols-rounded text-[18px] text-neutral-500 dark:text-white/55">subdirectory_arrow_right</span>
                    `;

                    div.addEventListener('mousedown', (e) => {
                        // mousedown so it triggers before input blur
                        e.preventDefault();
                        if (!topic) return;
                        topicInputEl.value = topic;
                        hide();
                    });

                    suggestWrapEl.appendChild(div);
                });

                show();
            }

            function updateActive(nextIndex) {
                const children = suggestWrapEl.querySelectorAll('.topic-suggestion-item');
                if (!children.length) return;

                if (activeIndex >= 0 && activeIndex < children.length) {
                    children[activeIndex].setAttribute('aria-selected', 'false');
                }

                activeIndex = nextIndex;
                if (activeIndex < 0) activeIndex = 0;
                if (activeIndex >= children.length) activeIndex = children.length - 1;

                children[activeIndex].setAttribute('aria-selected', 'true');
                try { children[activeIndex].scrollIntoView({ block: 'nearest' }); } catch (_) { }
            }

            function chooseIndex(idx) {
                if (idx < 0 || idx >= currentItems.length) return;
                const topic = (currentItems[idx] && currentItems[idx].topic) ? String(currentItems[idx].topic) : '';
                if (!topic) return;
                topicInputEl.value = topic;
                hide();
            }

            async function fetchSuggestions(q) {
                if (aborter) aborter.abort();
                aborter = new AbortController();

                const url = apiBase + '/api/notes/topics/search?q=' + encodeURIComponent(q) + '&limit=12';
                const res = await fetch(url, { signal: aborter.signal });
                if (!res.ok) throw new Error('Search failed: ' + res.status);
                const data = await res.json();
                return (data && data.items) ? data.items : [];
            }

            const onInput = debounce(async () => {
                const q = (topicInputEl.value || '').trim();
                if (!q) {
                    render([]);
                    return;
                }

                try {
                    const items = await fetchSuggestions(q);
                    render(items);
                } catch (e) {
                    if (String(e && e.name) === 'AbortError') return;
                    console.error(e);
                    render([]);
                }
            }, 150);

            topicInputEl.addEventListener('input', onInput);

            topicInputEl.addEventListener('keydown', (e) => {
                if (suggestWrapEl.classList.contains('hidden')) return;

                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    updateActive(activeIndex + 1);
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    updateActive(activeIndex - 1);
                } else if (e.key === 'Enter') {
                    if (activeIndex >= 0 && currentItems.length) {
                        // prevent modal form submit while selecting suggestion
                        e.preventDefault();
                        chooseIndex(activeIndex);
                    }
                } else if (e.key === 'Escape') {
                    hide();
                }
            });

            topicInputEl.addEventListener('blur', () => {
                // delay to allow click selection
                setTimeout(() => hide(), 120);
            });

            const instance = { input: topicInputEl, wrap: suggestWrapEl, hide };
            topicInputEl.__topicSuggestInstance = instance;
            topicSuggestInstances.add(instance);

            if (!topicSuggestDocClickBound) {
                topicSuggestDocClickBound = true;
                document.addEventListener('click', (e) => {
                    const target = e && e.target ? e.target : null;
                    for (const inst of topicSuggestInstances) {
                        if (!inst || !inst.input || !inst.wrap) continue;
                        if (target && (inst.wrap.contains(target) || target === inst.input)) continue;
                        inst.hide();
                    }
                });
            }
        }

        function cleanupTopicAutocompleteForRow(rowEl) {
            if (!rowEl || !rowEl.querySelector) return;
            const input = rowEl.querySelector('[data-topic-input]');
            if (!input || !input.__topicSuggestInstance) return;
            try { topicSuggestInstances.delete(input.__topicSuggestInstance); } catch (_) { }
            try { delete input.__topicSuggestInstance; } catch (_) { }
        }

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

        function showLoader() {
            // Preserve layout height while loading so the browser doesn't clamp scroll
            // (which would jump the user toward the top when content is temporarily replaced).
            const h = results?.getBoundingClientRect ? results.getBoundingClientRect().height : 0;
            setResultsMinHeight(h);
            results.innerHTML = `
                <div class="flex items-center justify-center py-16">
                    <div class="h-12 w-12 animate-spin rounded-full border-2 border-brand-500/30 border-t-transparent"></div>
                </div>`;
        }

        function setResultsMinHeight(px) {
            if (!results) return;
            const n = Number(px);
            if (Number.isFinite(n) && n > 0) results.style.minHeight = `${Math.round(n)}px`;
            else results.style.minHeight = '';
        }

        function getScrollY() {
            return window.scrollY || document.documentElement.scrollTop || 0;
        }

        function restoreScrollY(y) {
            const n = Number(y);
            if (!Number.isFinite(n)) return;
            const max = Math.max(0, (document.documentElement.scrollHeight || 0) - (window.innerHeight || 0));
            const target = Math.min(Math.max(0, n), max);
            // Double rAF gives the browser time to apply layout after innerHTML changes.
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    try {
                        window.scrollTo({ top: target, left: 0, behavior: 'auto' });
                    } catch (_) {
                        window.scrollTo(0, target);
                    }
                });
            });
        }

        function showError(message) {
            setResultsMinHeight(0);
            results.innerHTML = `
                <div class="rounded-3xl border border-red-400/35 bg-red-100/70 dark:bg-red-500/10 dark:border-red-400/25 p-8 shadow-soft">
                    <h2 class="text-lg font-semibold text-red-700 dark:text-red-200">Unable to load syllabus</h2>
                    <p class="mt-2 text-sm text-red-600/85 dark:text-red-200/80">${Collage.escapeHtml(message || 'Please verify the course context and try again.')}</p>
                </div>`;
        }

        function showEmpty() {
            setResultsMinHeight(0);
            results.innerHTML = `
                <div class="rounded-3xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur p-8 text-sm text-neutral-600 dark:text-white/65">
                    <h2 class="text-lg font-semibold text-neutral-900 dark:text-white">No units yet</h2>
                    <p class="mt-2">Add units for this subject to build its syllabus structure.</p>
                </div>`;
        }

        function showAccessDenied(message) {
            try { addUnitBtn?.classList.add('hidden'); } catch (_) { }
            try { contextPanel?.classList.add('hidden'); } catch (_) { }
            setResultsMinHeight(0);
            if (window.Collage && typeof window.Collage.renderAccessDenied === 'function') {
                window.Collage.renderAccessDenied(results, message || 'You need an admin or employee account to access the college console.');
            } else {
                showError(message || 'Access denied');
            }
        }

        function renderContext() {
            const parts = [
                courseCode ? `<span class="font-semibold">${Collage.escapeHtml(courseCode)}</span>` : '',
                courseTitle ? Collage.escapeHtml(courseTitle) : '',
                semesterParam ? `Semester ${semesterParam}` : '',
                batchRange ? `Batch ${Collage.escapeHtml(batchRange)}` : ''
            ].filter(Boolean);
            contextPanel.innerHTML = parts.length
                ? `<div class="flex flex-wrap gap-3 text-sm">${parts.map(p => `<span class="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/15 bg-white/70 dark:bg-white/5 px-3 py-1 text-neutral-700 dark:text-white/80">${p}</span>`).join('')}</div>`
                : '<p class="text-sm text-neutral-600 dark:text-white/65">Subject context unavailable.</p>';
        }

        function resetUnitModal() {
            unitForm?.reset();
            unitModalMessage.textContent = '';
            unitModalMessage.classList.add('hidden');
            unitModalMode = 'add';
            unitSubmitBtn.innerHTML = '<span class="material-symbols-rounded text-base">save</span>Save unit';
            if (unitDeleteBtn) unitDeleteBtn.classList.add('hidden');
            topicsContainer.innerHTML = '';
            topicSuggestInstances.clear();
            addTopicRow();
        }

        function setUnitModalLoading(isLoading) {
            unitSubmitBtn.disabled = isLoading;
            unitSubmitBtn.innerHTML = isLoading
                ? '<span class="material-symbols-rounded animate-spin text-base">progress_activity</span> Saving…'
                : (unitModalMode === 'edit' ? '<span class="material-symbols-rounded text-base">save</span>Save changes' : '<span class="material-symbols-rounded text-base">save</span>Save unit');
        }

        function closeUnitModal() {
            unitModal.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
            resetUnitModal();
        }

        function openUnitModal(mode = 'add', unit) {
            if (!courseId) return;
            resetUnitModal();
            unitModalMode = mode;

            if (mode === 'edit' && unit) {
                unitTitleInput.value = unit.unit_title || '';
                topicsContainer.innerHTML = '';
                (unit.topics || []).forEach(t => addTopicRow(t.topic_title || t.topic || '', null, t.id || null));
            }

            unitModalTitle.textContent = mode === 'edit' ? 'Edit unit' : 'Add a new unit';
            unitSubmitBtn.innerHTML = mode === 'edit' ? '<span class="material-symbols-rounded text-base">save</span>Save changes' : '<span class="material-symbols-rounded text-base">save</span>Save unit';
            if (unitDeleteBtn) {
                if (mode === 'edit') unitDeleteBtn.classList.remove('hidden');
                else unitDeleteBtn.classList.add('hidden');
            }
            unitModal.classList.remove('hidden');
            document.body.classList.add('overflow-hidden');
            setTimeout(() => { unitTitleInput?.focus(); }, 60);
        }

        function addTopicRow(value = '', insertAfterRow = null, topicId = null) {
            const id = Math.random().toString(36).slice(2, 9);
            const row = document.createElement('div');
            row.className = 'flex items-center gap-2';
            row.setAttribute('data-topic-row', '');
            if (topicId) row.setAttribute('data-topic-id', String(topicId));
            row.innerHTML = `
                <button type="button" data-drag-handle aria-label="Drag to reorder"
                    class="inline-flex items-center justify-center rounded-full border border-black/10 dark:border-white/15 p-2 text-neutral-500 hover:text-brand-500 hover:border-brand-500/50 cursor-grab active:cursor-grabbing transition">
                    <span class="material-symbols-rounded text-base">drag_indicator</span>
                </button>
                <div class="relative flex-1">
                    <input type="text" data-topic-input id="topic-${id}" placeholder="Topic title" value="${Collage.escapeHtml(value)}" class="w-full rounded-2xl border border-black/10 dark:border-white/15 bg-white/80 dark:bg-white/5 px-3.5 py-2 text-sm text-neutral-900 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40" maxlength="256" autocomplete="off" />
                    <div data-topic-suggest class="topic-suggest hidden absolute left-0 right-0 top-full mt-2 z-50 max-h-56 overflow-auto rounded-2xl border border-black/10 dark:border-white/15 bg-white/95 dark:bg-[#1E1E2F]/95 backdrop-blur p-1 shadow-soft"></div>
                </div>
                <button type="button" aria-label="Add topic below" class="inline-flex items-center justify-center rounded-full border border-black/10 dark:border-white/15 p-2 text-neutral-500 hover:text-brand-500 hover:border-brand-500/50 transition">
                    <span class="material-symbols-rounded text-base">add</span>
                </button>
                <button type="button" aria-label="Remove topic" class="inline-flex items-center justify-center rounded-full border border-black/10 dark:border-white/15 p-2 text-neutral-500 hover:text-red-500 hover:border-red-500/50 transition"><span class="material-symbols-rounded text-base">close</span></button>`;

            const addBtn = row.querySelector('button[aria-label="Add topic below"]');
            addBtn.addEventListener('click', () => addTopicRow('', row));

            const removeBtn = row.querySelector('button[aria-label="Remove topic"]');
            removeBtn.addEventListener('click', () => {
                cleanupTopicAutocompleteForRow(row);
                row.remove();
                if (!topicsContainer.querySelector('[data-topic-input]')) addTopicRow();
            });

            if (insertAfterRow && insertAfterRow.parentNode === topicsContainer) {
                if (insertAfterRow.nextSibling) {
                    topicsContainer.insertBefore(row, insertAfterRow.nextSibling);
                } else {
                    topicsContainer.appendChild(row);
                }
            } else {
                topicsContainer.appendChild(row);
            }

            // Make the handle itself draggable to ensure dragstart fires
            const handleBtn = row.querySelector('[data-drag-handle]');
            if (handleBtn) handleBtn.setAttribute('draggable', 'true');
            ensureDragDropEnabled();

            // Autocomplete like notes_search.html
            const topicInputEl = row.querySelector('[data-topic-input]');
            const suggestWrapEl = row.querySelector('[data-topic-suggest]');
            attachTopicAutocomplete(topicInputEl, suggestWrapEl);
        }

        addTopicRowButton.addEventListener('click', () => addTopicRow());
        addTopicRowBottomButton?.addEventListener('click', () => addTopicRow());

        // Drag and drop reordering with auto-scroll inside modal
        let dragEl = null;
        let autoScrollRAF = null;
        let scrollSpeed = 0; // pixels per frame

        function ensureDragDropEnabled() {
            if (!topicsContainer) return;
            // Delegate events only once
            if (topicsContainer.__dragBound) return;
            topicsContainer.__dragBound = true;

            topicsContainer.addEventListener('dragstart', (e) => {
                const row = e.target.closest('[data-topic-row]');
                const handle = e.target.closest('[data-drag-handle]');
                if (!row || !handle) { e.preventDefault(); return; }
                dragEl = row;
                dragEl.classList.add('opacity-50');
                try { e.dataTransfer.setData('text/plain', ''); } catch (_) { }
                e.dataTransfer.effectAllowed = 'move';
                if (typeof e.dataTransfer.setDragImage === 'function') {
                    const img = document.createElement('div');
                    img.style.width = '1px';
                    img.style.height = '1px';
                    img.style.opacity = '0';
                    document.body.appendChild(img);
                    e.dataTransfer.setDragImage(img, 0, 0);
                    setTimeout(() => img.remove(), 0);
                }
                startAutoScroll();
            });

            topicsContainer.addEventListener('dragover', (e) => {
                if (!dragEl) return;
                e.preventDefault();
                if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
                const after = getDragAfterElement(topicsContainer, e.clientY);
                if (after == null) topicsContainer.appendChild(dragEl);
                else topicsContainer.insertBefore(dragEl, after);
                updateAutoScroll(e.clientY);
            });

            topicsContainer.addEventListener('drop', (e) => { if (dragEl) e.preventDefault(); });

            topicsContainer.addEventListener('dragend', () => {
                if (dragEl) dragEl.classList.remove('opacity-50');
                dragEl = null;
                stopAutoScroll();
            });
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

        function startAutoScroll() {
            if (autoScrollRAF) cancelAnimationFrame(autoScrollRAF);
            const scroller = document.getElementById('unitModalPanel') || topicsContainer;
            const step = () => {
                if (scrollSpeed !== 0) {
                    scroller.scrollTop += scrollSpeed;
                }
                autoScrollRAF = requestAnimationFrame(step);
            };
            autoScrollRAF = requestAnimationFrame(step);
        }

        function stopAutoScroll() {
            if (autoScrollRAF) cancelAnimationFrame(autoScrollRAF);
            autoScrollRAF = null;
            scrollSpeed = 0;
        }

        function updateAutoScroll(clientY) {
            const scroller = document.getElementById('unitModalPanel') || topicsContainer;
            const rect = scroller.getBoundingClientRect();
            const threshold = 48; // px from edge to start autoscroll
            const maxSpeed = 12; // px per frame for smoothness

            if (clientY < rect.top + threshold) {
                const ratio = (rect.top + threshold - clientY) / threshold; // 0..1
                scrollSpeed = -Math.ceil(maxSpeed * ratio);
            } else if (clientY > rect.bottom - threshold) {
                const ratio = (clientY - (rect.bottom - threshold)) / threshold; // 0..1
                scrollSpeed = Math.ceil(maxSpeed * ratio);
            } else {
                scrollSpeed = 0;
            }
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
                unitModalMessage.textContent = 'Enter the unit title.';
                unitModalMessage.classList.remove('hidden');
                unitTitleInput.focus();
                return;
            }
            const rows = [...topicsContainer.querySelectorAll('[data-topic-row]')];
            // Preserve topic IDs for edit/upsert; backend accepts {id?, topic}
            const topics = rows.map(row => {
                const inp = row.querySelector('[data-topic-input]');
                const topic = (inp?.value || '').trim();
                const id = row.getAttribute('data-topic-id');
                if (!topic) return null;
                return id ? { id, topic } : { topic };
            }).filter(Boolean);
            const payload = { unit_title, topics };
            setUnitModalLoading(true);
            unitModalMessage.classList.add('hidden');
            try {
                if (unitModalMode === 'edit' && syllabusCourse && syllabusCourse.editingUnitId) {
                    await Collage.fetchJson(`/api/syllabus/units/${syllabusCourse.editingUnitId}`, { method: 'PUT', body: payload, skipAuth: false });
                } else {
                    await Collage.fetchJson(`/api/syllabus/courses/${courseId}/units`, { method: 'POST', body: payload, skipAuth: false });
                }
                closeUnitModal();
                await loadSyllabus();
            } catch (error) {
                let m = error?.message ?? 'Unable to save unit.';
                if (typeof m !== 'string') {
                    try { m = JSON.stringify(m); } catch (_) { m = 'Unable to save unit.'; }
                }
                if (m === '[object Object]') m = 'Unexpected response.';
                unitModalMessage.textContent = m;
                unitModalMessage.classList.remove('hidden');
                console.error(error);
            } finally {
                setUnitModalLoading(false);
            }
        }

        unitForm.addEventListener('submit', handleUnitSubmit);
        unitModalCancel.addEventListener('click', closeUnitModal);
        unitModalClose.addEventListener('click', closeUnitModal);
        unitModalBackdrop.addEventListener('click', closeUnitModal);
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && !unitModal.classList.contains('hidden')) closeUnitModal(); });

        function setUnitDeleteLoading(isLoading) {
            if (!unitDeleteBtn) return;
            unitDeleteBtn.disabled = isLoading;
            unitModalCancel.disabled = isLoading;
            unitSubmitBtn.disabled = isLoading;
            unitDeleteBtn.innerHTML = isLoading
                ? '<span class="material-symbols-rounded animate-spin text-base">progress_activity</span> Deleting…'
                : '<span class="material-symbols-rounded text-base">delete</span>Delete';
        }

        async function handleUnitDelete() {
            if (!syllabusCourse || !syllabusCourse.editingUnitId) return;
            const ok = window.confirm('Delete this unit and all its topics? This action cannot be undone.');
            if (!ok) return;
            setUnitDeleteLoading(true);
            unitModalMessage.classList.add('hidden');
            try {
                await Collage.fetchJson(`/api/syllabus/units/${syllabusCourse.editingUnitId}`, { method: 'DELETE', skipAuth: false });
                closeUnitModal();
                await loadSyllabus();
            } catch (error) {
                let m = error?.message ?? 'Unable to delete unit.';
                if (typeof m !== 'string') {
                    try { m = JSON.stringify(m); } catch (_) { m = 'Unable to delete unit.'; }
                }
                if (m === '[object Object]') m = 'Unexpected response.';
                unitModalMessage.textContent = m;
                unitModalMessage.classList.remove('hidden');
                console.error(error);
            } finally {
                setUnitDeleteLoading(false);
            }
        }
        if (unitDeleteBtn) unitDeleteBtn.addEventListener('click', handleUnitDelete);

        // Store blink links map fetched from API
        let topicBlinkLinks = {};
        // Store labx cache status for topics
        let topicLabxCache = {};

        function normalizeTopicKey(value) {
            return (value || '').trim().toLowerCase().replace(/\s+/g, ' ');
        }

        async function fetchBlinkLinks(units) {
            // Collect all topic names from units
            const topicNames = [];
            for (const u of units) {
                for (const t of (u.topics || [])) {
                    const name = (t.topic_title || t.topic || '').trim();
                    if (name) topicNames.push(name);
                }
            }
            if (!topicNames.length) return {};

            try {
                const normalizedTopics = Array.from(new Set(topicNames.map(normalizeTopicKey).filter(Boolean)));
                const topicsJsonParam = encodeURIComponent(JSON.stringify(normalizedTopics));
                const res = await fetch(`${apiBase}/api/blink/links?topics_json=${topicsJsonParam}`);
                if (res.ok) {
                    const data = await res.json();
                    const raw = data.links || {};
                    const normalized = {};
                    for (const [topic, url] of Object.entries(raw)) {
                        const key = normalizeTopicKey(topic);
                        if (!key || !url) continue;
                        normalized[key] = url;
                    }
                    return normalized;
                }
            } catch (e) {
                console.error('[Blink] Error fetching links:', e);
            }
            return {};
        }

        async function fetchLabxStatus(units) {
            // Check labx cache status for all topics using batch endpoint
            const topicNames = [];
            for (const u of units) {
                for (const t of (u.topics || [])) {
                    const name = (t.topic_title || t.topic || '').trim();
                    if (name) topicNames.push(name);
                }
            }
            if (!topicNames.length) return {};

            try {
                const normalizedTopics = Array.from(new Set(topicNames.map(normalizeTopicKey).filter(Boolean)));
                const topicsJsonParam = encodeURIComponent(JSON.stringify(normalizedTopics));
                const res = await fetch(`${apiBase}/api/labx/check-batch?topics_json=${topicsJsonParam}`);
                if (res.ok) {
                    const data = await res.json();
                    // Convert to map of topic -> true for cached topics
                    const statusMap = {};
                    const cached = data.cached || {};
                    for (const [topic, exists] of Object.entries(cached)) {
                        if (exists) {
                            statusMap[topic.toLowerCase()] = true;
                        }
                    }
                    return statusMap;
                }
            } catch (e) {
                console.error('[LabX] Error checking cache:', e);
            }
            return {};
        }


        async function renderUnits(units) {
            setResultsMinHeight(0);
            if (!units.length) {
                showEmpty();
                return;
            }

            // Fetch blink links and labx status for all topics in parallel
            const [blinkLinks, labxStatus] = await Promise.all([
                fetchBlinkLinks(units),
                fetchLabxStatus(units)
            ]);
            topicBlinkLinks = blinkLinks;
            topicLabxCache = labxStatus;

            results.innerHTML = units.map(u => {
                const topics = Array.isArray(u.topics) ? u.topics : [];
                return `
          <article class="group relative overflow-hidden rounded-3xl border border-black/5 dark:border-white/10 bg-white/75 dark:bg-white/5 backdrop-blur p-6 shadow-soft">
            <div class="absolute inset-x-6 top-6 h-24 rounded-3xl bg-gradient-to-r from-brand-500/40 via-brandlt-300/30 to-brand-700/40 opacity-20 blur-2xl"></div>
            <div class="relative flex items-start justify-between gap-4">
              <h2 class="text-lg font-semibold text-neutral-900 dark:text-white">${Collage.escapeHtml(u.unit_title || 'Unit')}</h2>
              <button type="button" data-unit-edit="${u.id}" class="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/85 dark:bg-white/10 p-2 text-neutral-500 hover:text-brand-500 hover:border-brand-500/50 transition">
                <span class="material-symbols-rounded text-base">edit</span>
              </button>
            </div>
                        <ul class="relative mt-4 space-y-3 text-sm text-neutral-700 dark:text-white/75">
                                                                                                                ${topics.map(t => {
                    const label = Collage.escapeHtml(t.topic_title || t.topic || '');
                    // Check if blink exists for this topic
                    const topicNameLower = normalizeTopicKey(t.topic_title || t.topic || '');
                    const blinkUrl = topicBlinkLinks[topicNameLower] || '';
                    const hasBlink = !!blinkUrl;
                    const blinkBtnLabel = hasBlink ? 'View Blink' : 'Gen Blink';
                    const blinkBtnIcon = hasBlink ? 'visibility' : 'auto_awesome';
                    const blinkBtnAttr = hasBlink ? 'data-topic-view-blink' : 'data-topic-gen-blink';
                    const blinkCurrentAttr = hasBlink ? `data-blink-url=\"${Collage.escapeHtml(blinkUrl)}\"` : '';
                    // Check if labx exists for this topic
                    const hasLabx = !!topicLabxCache[topicNameLower];
                    const labxBtnLabel = hasLabx ? 'View LabX' : 'Gen LabX';
                    const labxBtnIcon = hasLabx ? 'visibility' : 'science';
                    const labxBtnAttr = hasLabx ? 'data-topic-view-labx' : 'data-topic-gen-labx';
                    const labxBtnClass = hasLabx ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 dark:hover:bg-emerald-500/20' : 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-500/40 dark:bg-purple-500/10 dark:text-purple-200 hover:bg-purple-100 hover:border-purple-300 dark:hover:bg-purple-500/20';
                    return `<li class=\"flex items-start justify-between gap-3\">
        <div class=\"flex items-start gap-2\">
        <span class=\"material-symbols-rounded text-base text-brand-500 mt-0.5\">check_small</span>
                <span>${label}</span>
    </div>
        <div class=\"flex flex-wrap items-center gap-1.5 justify-end\">
            <button type=\"button\" ${labxBtnAttr}=\"${t.id}\" data-topic-name=\"${Collage.escapeHtml(t.topic_title || t.topic || '')}\" class=\"inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${labxBtnClass}\">
                <span class=\"material-symbols-rounded text-sm\">${labxBtnIcon}</span>
                <span>${labxBtnLabel}</span>
            </button>
            <button type=\"button\" data-topic-blink-link=\"${t.id}\" data-topic-name=\"${Collage.escapeHtml(t.topic_title || t.topic || '')}\" data-current-blink-url=\"${Collage.escapeHtml(blinkUrl)}\" class=\"inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/40 dark:bg-violet-500/10 dark:text-violet-200 hover:bg-violet-100 hover:border-violet-300 dark:hover:bg-violet-500/20\">
                <span class=\"material-symbols-rounded text-sm\">add_link</span>
                <span>blink_link</span>
            </button>
            <button type=\"button\" ${blinkBtnAttr}=\"${t.id}\" data-topic-name=\"${Collage.escapeHtml(t.topic_title || t.topic || '')}\" ${blinkCurrentAttr} class=\"inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${hasBlink ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 dark:hover:bg-emerald-500/20' : 'border-pink-200 bg-pink-50 text-pink-700 dark:border-pink-500/40 dark:bg-pink-500/10 dark:text-pink-200 hover:bg-pink-100 hover:border-pink-300 dark:hover:bg-pink-500/20'}\">
                <span class=\"material-symbols-rounded text-sm\">${blinkBtnIcon}</span>
                <span>${blinkBtnLabel}</span>
            </button>
        </div>
</li>`;
                }).join('') || '<li class=\"italic opacity-70\">No topics recorded.</li>'}
            </ul>
          </article>`;
            }).join('');
            attachUnitEditHandlers();
            attachTopicLinkHandlers();
        }

        function attachTopicLinkHandlers() {
            if (!results) return;

            // Gen LabX button handler - generates interactive explorable explanation
            results.querySelectorAll('[data-topic-gen-labx]').forEach(btn => {
                attachGenLabxHandler(btn);
            });

            // View LabX button handler - opens modal with preview
            results.querySelectorAll('[data-topic-view-labx]').forEach(btn => {
                attachViewLabxHandler(btn);
            });

            // Gen Blink button handler
            results.querySelectorAll('[data-topic-gen-blink]').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const topicId = btn.getAttribute('data-topic-gen-blink');
                    const topicName = btn.getAttribute('data-topic-name') || '';
                    if (!topicName) {
                        alert('Topic name is required to generate blink.');
                        return;
                    }

                    // Update button to show loading
                    const originalHTML = btn.innerHTML;
                    btn.innerHTML = '<span class="material-symbols-rounded text-sm animate-spin">progress_activity</span><span>Generating...</span>';
                    btn.disabled = true;

                    try {
                        const res = await fetch(`${apiBase}/api/blink/generate`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ topic: topicName, topic_id: topicId })
                        });

                        if (!res.ok) {
                            const errData = await res.json().catch(() => ({}));
                            throw new Error(errData.detail || `HTTP ${res.status}`);
                        }

                        const data = await res.json();
                        const blinkUrl = data.url || '';

                        // Update button inline to "View Blink" - no page reload
                        btn.removeAttribute('data-topic-gen-blink');
                        btn.setAttribute('data-topic-view-blink', topicId);
                        btn.setAttribute('data-blink-url', blinkUrl);
                        btn.className = btn.className.replace(/border-pink-200.*?dark:hover:bg-pink-500\/20/g,
                            'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 dark:hover:bg-emerald-500/20');
                        btn.innerHTML = '<span class="material-symbols-rounded text-sm">visibility</span><span>View Blink</span>';
                        btn.disabled = false;

                        // Re-attach the view handler to this button
                        attachViewBlinkHandler(btn);

                        // Keep blink_link button state in sync for the same row
                        const linkBtn = btn.closest('li')?.querySelector('[data-topic-blink-link]');
                        if (linkBtn) linkBtn.setAttribute('data-current-blink-url', blinkUrl);

                        // Update local cache
                        topicBlinkLinks[normalizeTopicKey(topicName)] = blinkUrl;

                    } catch (err) {
                        console.error('[GenBlink] Error:', err);
                        alert(err?.message || 'Unable to generate blink.');
                        btn.innerHTML = originalHTML;
                        btn.disabled = false;
                    }
                });
            });

            // View Blink button handler - opens modal with preview
            results.querySelectorAll('[data-topic-view-blink]').forEach(btn => {
                attachViewBlinkHandler(btn);
            });

            // blink_link button handler - manual save/remove for ai_notes.blink_link
            results.querySelectorAll('[data-topic-blink-link]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const topicId = btn.getAttribute('data-topic-blink-link');
                    const topicName = btn.getAttribute('data-topic-name') || '';
                    const blinkUrl = btn.getAttribute('data-current-blink-url') || '';
                    if (!topicId || !topicName) {
                        alert('Topic details are missing.');
                        return;
                    }
                    openBlinkLinkModal(topicId, topicName, blinkUrl, btn);
                });
            });
        }

        // Blink preview modal elements
        const blinkPreviewModal = document.getElementById('blinkPreviewModal');
        const blinkPreviewBackdrop = document.getElementById('blinkPreviewBackdrop');
        const blinkPreviewClose = document.getElementById('blinkPreviewClose');
        const blinkPreviewImage = document.getElementById('blinkPreviewImage');
        const blinkPreviewTopic = document.getElementById('blinkPreviewTopic');
        const blinkPreviewOpenTab = document.getElementById('blinkPreviewOpenTab');
        const blinkPreviewRemove = document.getElementById('blinkPreviewRemove');

        // Blink link modal elements
        const blinkLinkModal = document.getElementById('blinkLinkModal');
        const blinkLinkBackdrop = document.getElementById('blinkLinkBackdrop');
        const blinkLinkClose = document.getElementById('blinkLinkClose');
        const blinkLinkCancel = document.getElementById('blinkLinkCancel');
        const blinkLinkForm = document.getElementById('blinkLinkForm');
        const blinkLinkInput = document.getElementById('blinkLinkInput');
        const blinkLinkTopic = document.getElementById('blinkLinkTopic');
        const blinkLinkHint = document.getElementById('blinkLinkHint');
        const blinkLinkSave = document.getElementById('blinkLinkSave');
        const blinkLinkRemove = document.getElementById('blinkLinkRemove');

        let currentBlinkContext = { topicId: null, topicName: '', blinkUrl: '', originBtn: null };
        let currentBlinkLinkContext = { topicId: null, topicName: '', blinkUrl: '', originBtn: null, actionBtn: null };

        function applyBlinkStateOnButtons(topicId, topicName, blinkUrl) {
            const normalized = normalizeTopicKey(topicName);
            if (blinkUrl) {
                topicBlinkLinks[normalized] = blinkUrl;
            } else {
                delete topicBlinkLinks[normalized];
            }

            const { originBtn, actionBtn } = currentBlinkLinkContext;

            if (originBtn) {
                originBtn.setAttribute('data-current-blink-url', blinkUrl || '');
            }

            if (actionBtn) {
                if (blinkUrl) {
                    actionBtn.removeAttribute('data-topic-gen-blink');
                    actionBtn.setAttribute('data-topic-view-blink', topicId);
                    actionBtn.setAttribute('data-blink-url', blinkUrl);
                    actionBtn.className = actionBtn.className.replace(/border-pink-200.*?dark:hover:bg-pink-500\/20/g,
                        'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 dark:hover:bg-emerald-500/20');
                    actionBtn.innerHTML = '<span class="material-symbols-rounded text-sm">visibility</span><span>View Blink</span>';
                    actionBtn.disabled = false;
                    attachViewBlinkHandler(actionBtn);
                } else {
                    actionBtn.removeAttribute('data-topic-view-blink');
                    actionBtn.removeAttribute('data-blink-url');
                    actionBtn.setAttribute('data-topic-gen-blink', topicId);
                    actionBtn.className = actionBtn.className.replace(/border-emerald-200.*?dark:hover:bg-emerald-500\/20/g,
                        'border-pink-200 bg-pink-50 text-pink-700 dark:border-pink-500/40 dark:bg-pink-500/10 dark:text-pink-200 hover:bg-pink-100 hover:border-pink-300 dark:hover:bg-pink-500/20');
                    actionBtn.innerHTML = '<span class="material-symbols-rounded text-sm">auto_awesome</span><span>Gen Blink</span>';
                    actionBtn.disabled = false;
                    attachGenBlinkHandler(actionBtn);
                }
            }
        }

        function closeBlinkLinkModal() {
            blinkLinkModal?.classList.add('hidden');
            if (blinkLinkInput) blinkLinkInput.value = '';
            if (blinkLinkHint) blinkLinkHint.textContent = 'Paste an image link to store in blink_link.';
            if (blinkLinkRemove) blinkLinkRemove.classList.add('hidden');
            currentBlinkLinkContext = { topicId: null, topicName: '', blinkUrl: '', originBtn: null, actionBtn: null };
        }

        function openBlinkLinkModal(topicId, topicName, blinkUrl, originBtn) {
            const row = originBtn?.closest('li');
            const actionBtn = row ? row.querySelector('[data-topic-view-blink], [data-topic-gen-blink]') : null;
            currentBlinkLinkContext = { topicId, topicName, blinkUrl, originBtn, actionBtn };

            if (blinkLinkTopic) blinkLinkTopic.textContent = topicName;
            if (blinkLinkInput) blinkLinkInput.value = blinkUrl || '';
            if (blinkLinkHint) {
                blinkLinkHint.textContent = blinkUrl
                    ? 'Blink link exists. You can remove it and enter a new link.'
                    : 'Paste an image link to store in blink_link.';
            }
            if (blinkLinkRemove) {
                blinkLinkRemove.classList.toggle('hidden', !blinkUrl);
            }
            blinkLinkModal?.classList.remove('hidden');
            setTimeout(() => blinkLinkInput?.focus(), 0);
        }

        async function saveBlinkLink(topicId, topicName, blinkUrl) {
            const res = await fetch(`${apiBase}/api/blink/link`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic_id: topicId, topic: topicName, blink_link: blinkUrl })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.detail || `HTTP ${res.status}`);
            }

            return res.json().catch(() => ({}));
        }

        blinkLinkClose?.addEventListener('click', closeBlinkLinkModal);
        blinkLinkCancel?.addEventListener('click', closeBlinkLinkModal);
        blinkLinkBackdrop?.addEventListener('click', closeBlinkLinkModal);

        blinkLinkForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const { topicId, topicName } = currentBlinkLinkContext;
            if (!topicId || !topicName) return;

            const trimmed = (blinkLinkInput?.value || '').trim();
            if (!trimmed) {
                alert('Blink link cannot be empty.');
                return;
            }

            const originalHTML = blinkLinkSave.innerHTML;
            blinkLinkSave.innerHTML = '<span class="material-symbols-rounded text-base animate-spin">progress_activity</span>Saving...';
            blinkLinkSave.disabled = true;
            if (blinkLinkRemove) blinkLinkRemove.disabled = true;

            try {
                await saveBlinkLink(topicId, topicName, trimmed);
                applyBlinkStateOnButtons(topicId, topicName, trimmed);
                closeBlinkLinkModal();
            } catch (err) {
                console.error('[BlinkLinkSave] Error:', err);
                alert(err?.message || 'Unable to save blink link.');
            } finally {
                blinkLinkSave.innerHTML = originalHTML;
                blinkLinkSave.disabled = false;
                if (blinkLinkRemove) blinkLinkRemove.disabled = false;
            }
        });

        blinkLinkRemove?.addEventListener('click', async () => {
            const { topicId, topicName } = currentBlinkLinkContext;
            if (!topicId || !topicName) return;

            const ok = window.confirm('Remove current blink link for this topic?');
            if (!ok) return;

            const originalHTML = blinkLinkRemove.innerHTML;
            blinkLinkRemove.innerHTML = '<span class="material-symbols-rounded text-base animate-spin">progress_activity</span>Removing...';
            blinkLinkRemove.disabled = true;
            blinkLinkSave.disabled = true;

            try {
                await saveBlinkLink(topicId, topicName, '');
                applyBlinkStateOnButtons(topicId, topicName, '');
                if (blinkLinkInput) blinkLinkInput.value = '';
                if (blinkLinkHint) blinkLinkHint.textContent = 'Blink removed. Enter a new image link.';
                blinkLinkRemove.classList.add('hidden');
            } catch (err) {
                console.error('[BlinkLinkRemove] Error:', err);
                alert(err?.message || 'Unable to remove blink link.');
            } finally {
                blinkLinkRemove.innerHTML = originalHTML;
                blinkLinkRemove.disabled = false;
                blinkLinkSave.disabled = false;
            }
        });

        function openBlinkPreview(topicId, topicName, blinkUrl, originBtn) {
            currentBlinkContext = { topicId, topicName, blinkUrl, originBtn };
            blinkPreviewTopic.textContent = topicName;
            blinkPreviewImage.src = blinkUrl;
            blinkPreviewOpenTab.href = blinkUrl;
            blinkPreviewModal.classList.remove('hidden');
        }

        function closeBlinkPreview() {
            blinkPreviewModal.classList.add('hidden');
            blinkPreviewImage.src = '';
            currentBlinkContext = { topicId: null, topicName: '', blinkUrl: '', originBtn: null };
        }

        blinkPreviewClose?.addEventListener('click', closeBlinkPreview);
        blinkPreviewBackdrop?.addEventListener('click', closeBlinkPreview);

        // Remove blink from modal
        blinkPreviewRemove?.addEventListener('click', async () => {
            const { topicId, topicName, originBtn } = currentBlinkContext;
            if (!topicName) return;

            const ok = window.confirm('Remove the blink image for this topic?');
            if (!ok) return;

            blinkPreviewRemove.innerHTML = '<span class="material-symbols-rounded text-base animate-spin">progress_activity</span>Removing...';
            blinkPreviewRemove.disabled = true;

            try {
                const res = await fetch(`${apiBase}/api/blink/remove`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ topic: topicName })
                });

                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.detail || `HTTP ${res.status}`);
                }

                // Update origin button to "Gen Blink"
                if (originBtn) {
                    originBtn.removeAttribute('data-topic-view-blink');
                    originBtn.removeAttribute('data-blink-url');
                    originBtn.setAttribute('data-topic-gen-blink', topicId);
                    originBtn.className = originBtn.className.replace(/border-emerald-200.*?dark:hover:bg-emerald-500\/20/g,
                        'border-pink-200 bg-pink-50 text-pink-700 dark:border-pink-500/40 dark:bg-pink-500/10 dark:text-pink-200 hover:bg-pink-100 hover:border-pink-300 dark:hover:bg-pink-500/20');
                    originBtn.innerHTML = '<span class="material-symbols-rounded text-sm">auto_awesome</span><span>Gen Blink</span>';
                    attachGenBlinkHandler(originBtn);

                    const linkBtn = originBtn.closest('li')?.querySelector('[data-topic-blink-link]');
                    if (linkBtn) linkBtn.setAttribute('data-current-blink-url', '');
                }

                // Update local cache
                delete topicBlinkLinks[normalizeTopicKey(topicName)];

                closeBlinkPreview();

            } catch (err) {
                console.error('[RemoveBlink] Error:', err);
                alert(err?.message || 'Unable to remove blink.');
            } finally {
                blinkPreviewRemove.innerHTML = '<span class="material-symbols-rounded text-base">delete</span>Remove Blink';
                blinkPreviewRemove.disabled = false;
            }
        });

        // Reusable function to attach view blink handler
        function attachViewBlinkHandler(btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const topicId = btn.getAttribute('data-topic-view-blink');
                const topicName = btn.getAttribute('data-topic-name') || '';
                const blinkUrl = btn.getAttribute('data-blink-url') || '';
                if (!blinkUrl) return;
                openBlinkPreview(topicId, topicName, blinkUrl, btn);
            });
        }

        // Reusable function to attach gen blink handler
        function attachGenBlinkHandler(btn) {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const topicId = btn.getAttribute('data-topic-gen-blink');
                const topicName = btn.getAttribute('data-topic-name') || '';
                if (!topicName) {
                    alert('Topic name is required to generate blink.');
                    return;
                }

                // Update button to show loading
                const originalHTML = btn.innerHTML;
                btn.innerHTML = '<span class="material-symbols-rounded text-sm animate-spin">progress_activity</span><span>Generating...</span>';
                btn.disabled = true;

                try {
                    const res = await fetch(`${apiBase}/api/blink/generate`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ topic: topicName, topic_id: topicId })
                    });

                    if (!res.ok) {
                        const errData = await res.json().catch(() => ({}));
                        throw new Error(errData.detail || `HTTP ${res.status}`);
                    }

                    const data = await res.json();
                    const blinkUrl = data.url || '';

                    // Update button inline to "View Blink" - no page reload
                    btn.removeAttribute('data-topic-gen-blink');
                    btn.setAttribute('data-topic-view-blink', topicId);
                    btn.setAttribute('data-blink-url', blinkUrl);
                    btn.className = btn.className.replace(/border-pink-200.*?dark:hover:bg-pink-500\/20/g,
                        'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 dark:hover:bg-emerald-500/20');
                    btn.innerHTML = '<span class="material-symbols-rounded text-sm">visibility</span><span>View Blink</span>';
                    btn.disabled = false;

                    // Re-attach the view handler to this button
                    attachViewBlinkHandler(btn);

                    // Keep blink_link button state in sync for the same row
                    const linkBtn = btn.closest('li')?.querySelector('[data-topic-blink-link]');
                    if (linkBtn) linkBtn.setAttribute('data-current-blink-url', blinkUrl);

                    // Update local cache
                    topicBlinkLinks[normalizeTopicKey(topicName)] = blinkUrl;

                } catch (err) {
                    console.error('[GenBlink] Error:', err);
                    alert(err?.message || 'Unable to generate blink.');
                    btn.innerHTML = originalHTML;
                    btn.disabled = false;
                }
            });
        }

        // LabX Preview Modal Elements
        const labxPreviewModal = document.getElementById('labxPreviewModal');
        const labxPreviewBackdrop = document.getElementById('labxPreviewBackdrop');
        const labxPreviewClose = document.getElementById('labxPreviewClose');
        const labxPreviewFrame = document.getElementById('labxPreviewFrame');
        const labxPreviewTopic = document.getElementById('labxPreviewTopic');
        const labxPreviewContainer = document.getElementById('labxPreviewContainer');
        const labxCodeContainer = document.getElementById('labxCodeContainer');
        const labxCodeEditor = document.getElementById('labxCodeEditor');
        const labxToggleCodeBtn = document.getElementById('labxToggleCodeBtn');
        const labxToggleCodeText = document.getElementById('labxToggleCodeText');
        const labxSaveCodeBtn = document.getElementById('labxSaveCodeBtn');
        const labxDownloadBtn = document.getElementById('labxDownloadBtn');
        const labxOpenTabBtn = document.getElementById('labxOpenTabBtn');
        const labxRegenerateBtn = document.getElementById('labxRegenerateBtn');
        const labxModalStatus = document.getElementById('labxModalStatus');

        let currentLabxContext = { topicId: null, topicName: '', htmlContent: '', originBtn: null, showingCode: false };

        function openLabxPreview(topicId, topicName, htmlContent, originBtn) {
            currentLabxContext = { topicId, topicName, htmlContent, originBtn, showingCode: false };
            labxPreviewTopic.textContent = topicName;

            // Write to iframe
            const doc = labxPreviewFrame.contentDocument || labxPreviewFrame.contentWindow.document;
            doc.open();
            doc.write(htmlContent);
            doc.close();

            // Set code editor content
            labxCodeEditor.value = htmlContent;

            // Reset view to preview mode
            labxPreviewContainer.classList.remove('hidden');
            labxCodeContainer.classList.add('hidden');
            labxSaveCodeBtn.classList.add('hidden');
            labxToggleCodeText.textContent = 'Code';
            labxModalStatus.textContent = '';

            labxPreviewModal.classList.remove('hidden');
            document.body.classList.add('overflow-hidden');
        }

        function closeLabxPreview() {
            labxPreviewModal.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
            // Clear iframe
            const doc = labxPreviewFrame.contentDocument || labxPreviewFrame.contentWindow.document;
            doc.open();
            doc.write('');
            doc.close();
            currentLabxContext = { topicId: null, topicName: '', htmlContent: '', originBtn: null, showingCode: false };
        }

        labxPreviewClose?.addEventListener('click', closeLabxPreview);
        labxPreviewBackdrop?.addEventListener('click', closeLabxPreview);
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && !labxPreviewModal.classList.contains('hidden')) {
                closeLabxPreview();
            }
        });

        // Toggle between preview and code view
        labxToggleCodeBtn?.addEventListener('click', () => {
            currentLabxContext.showingCode = !currentLabxContext.showingCode;
            if (currentLabxContext.showingCode) {
                labxPreviewContainer.classList.add('hidden');
                labxCodeContainer.classList.remove('hidden');
                labxSaveCodeBtn.classList.remove('hidden');
                labxToggleCodeText.textContent = 'Preview';
            } else {
                labxPreviewContainer.classList.remove('hidden');
                labxCodeContainer.classList.add('hidden');
                labxSaveCodeBtn.classList.add('hidden');
                labxToggleCodeText.textContent = 'Code';
            }
        });

        // Apply code changes to preview
        labxSaveCodeBtn?.addEventListener('click', () => {
            const newHtml = labxCodeEditor.value;
            currentLabxContext.htmlContent = newHtml;

            // Update iframe with new content
            const doc = labxPreviewFrame.contentDocument || labxPreviewFrame.contentWindow.document;
            doc.open();
            doc.write(newHtml);
            doc.close();

            // Switch back to preview mode
            currentLabxContext.showingCode = false;
            labxPreviewContainer.classList.remove('hidden');
            labxCodeContainer.classList.add('hidden');
            labxSaveCodeBtn.classList.add('hidden');
            labxToggleCodeText.textContent = 'Code';

            labxModalStatus.textContent = '✅ Changes applied to preview';
            setTimeout(() => { labxModalStatus.textContent = ''; }, 3000);
        });

        // Download LabX HTML
        labxDownloadBtn?.addEventListener('click', () => {
            const html = currentLabxContext.showingCode ? labxCodeEditor.value : currentLabxContext.htmlContent;
            if (!html) return;
            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${(currentLabxContext.topicName || 'labx').toLowerCase().replace(/\s+/g, '-')}-explorable.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            labxModalStatus.textContent = '✅ Downloaded!';
            setTimeout(() => { labxModalStatus.textContent = ''; }, 3000);
        });

        // Open in new tab
        labxOpenTabBtn?.addEventListener('click', () => {
            const html = currentLabxContext.showingCode ? labxCodeEditor.value : currentLabxContext.htmlContent;
            if (!html) return;
            const blob = new Blob([html], { type: 'text/html' });
            window.open(URL.createObjectURL(blob), '_blank');
        });

        // Regenerate LabX
        labxRegenerateBtn?.addEventListener('click', async () => {
            const { topicName, originBtn } = currentLabxContext;
            if (!topicName) return;

            labxModalStatus.textContent = '🔄 Regenerating...';
            labxRegenerateBtn.disabled = true;
            labxRegenerateBtn.innerHTML = '<span class="material-symbols-rounded text-base animate-spin">progress_activity</span>Regenerating...';

            try {
                const res = await fetch(`${apiBase}/api/labx/generate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ topic: topicName, force_regenerate: true })
                });

                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.detail || `HTTP ${res.status}`);
                }

                const data = await res.json();

                if (data.success && data.html) {
                    currentLabxContext.htmlContent = data.html;

                    // Update iframe
                    const doc = labxPreviewFrame.contentDocument || labxPreviewFrame.contentWindow.document;
                    doc.open();
                    doc.write(data.html);
                    doc.close();

                    // Update code editor
                    labxCodeEditor.value = data.html;

                    labxModalStatus.textContent = '✅ Regenerated successfully!';
                } else {
                    throw new Error('Invalid response');
                }
            } catch (err) {
                console.error('[LabX Regenerate] Error:', err);
                labxModalStatus.textContent = `❌ ${err?.message || 'Regeneration failed'}`;
            } finally {
                labxRegenerateBtn.disabled = false;
                labxRegenerateBtn.innerHTML = '<span class="material-symbols-rounded text-base">refresh</span>Regenerate';
                setTimeout(() => { labxModalStatus.textContent = ''; }, 5000);
            }
        });

        // Attach gen labx handler to a button
        function attachGenLabxHandler(btn) {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const topicId = btn.getAttribute('data-topic-gen-labx');
                const topicName = btn.getAttribute('data-topic-name') || '';
                if (!topicName) {
                    alert('Topic name is required to generate LabX.');
                    return;
                }

                // Update button to show loading
                const originalHTML = btn.innerHTML;
                btn.innerHTML = '<span class="material-symbols-rounded text-sm animate-spin">progress_activity</span><span>Generating...</span>';
                btn.disabled = true;

                try {
                    const res = await fetch(`${apiBase}/api/labx/generate`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ topic: topicName, force_regenerate: false })
                    });

                    if (!res.ok) {
                        const errData = await res.json().catch(() => ({}));
                        throw new Error(errData.detail || `HTTP ${res.status}`);
                    }

                    const data = await res.json();

                    if (data.success && data.html) {
                        // Update button to show "View LabX" state (don't auto-open modal)
                        btn.removeAttribute('data-topic-gen-labx');
                        btn.setAttribute('data-topic-view-labx', topicId);
                        btn.className = btn.className.replace(/border-purple-200.*?dark:hover:bg-purple-500\/20/g,
                            'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 dark:hover:bg-emerald-500/20');
                        btn.innerHTML = '<span class="material-symbols-rounded text-sm">visibility</span><span>View LabX</span>';
                        btn.disabled = false;

                        // Re-attach view handler
                        attachViewLabxHandler(btn);

                        // Update local cache
                        topicLabxCache[topicName.toLowerCase()] = true;

                    } else {
                        throw new Error('Invalid response from LabX generator');
                    }

                } catch (err) {
                    console.error('[GenLabX] Error:', err);
                    alert(err?.message || 'Unable to generate LabX.');
                    btn.innerHTML = originalHTML;
                    btn.disabled = false;
                }
            });
        }

        // Attach view labx handler to a button
        function attachViewLabxHandler(btn) {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const topicId = btn.getAttribute('data-topic-view-labx');
                const topicName = btn.getAttribute('data-topic-name') || '';
                if (!topicName) return;

                // Show loading state
                const originalHTML = btn.innerHTML;
                btn.innerHTML = '<span class="material-symbols-rounded text-sm animate-spin">progress_activity</span><span>Loading...</span>';
                btn.disabled = true;

                try {
                    // Fetch cached content only (no regeneration)
                    const res = await fetch(`${apiBase}/api/labx/get/${encodeURIComponent(topicName)}`);

                    if (!res.ok) {
                        const errData = await res.json().catch(() => ({}));
                        throw new Error(errData.error || errData.detail || `HTTP ${res.status}`);
                    }

                    const data = await res.json();

                    if (data.success && data.html) {
                        openLabxPreview(topicId, topicName, data.html, btn);
                    } else {
                        throw new Error('LabX content not found');
                    }
                } catch (err) {
                    console.error('[ViewLabX] Error:', err);
                    alert(err?.message || 'Unable to load LabX.');
                } finally {
                    btn.innerHTML = originalHTML;
                    btn.disabled = false;
                }
            });
        }


        function attachUnitEditHandlers() {
            results.querySelectorAll('[data-unit-edit]').forEach(btn => {
                btn.addEventListener('click', e => {
                    e.preventDefault();
                    e.stopPropagation();
                    const id = btn.getAttribute('data-unit-edit');
                    const u = (syllabusCourse?.units || []).find(x => String(x.id) === String(id));
                    if (u) {
                        syllabusCourse.editingUnitId = u.id;
                        // Preserve topic IDs so edits don't wipe per-topic URLs
                        const normalizedTopics = (u.topics || []).map(t => ({ id: t.id, topic: t.topic || t.topic_title || '' }));
                        openUnitModal('edit', { unit_title: u.unit_title, topics: normalizedTopics });
                    }
                });
            });
        }

        async function loadSyllabus() {
            const scrollBefore = getScrollY();
            if (!courseId) {
                showError('Missing courseId.');
                return;
            }
            showLoader();
            try {
                // Correct endpoint: backend provides full course (with units & topics) at /api/syllabus/courses/{course_id}
                const data = await Collage.fetchJson(`/api/syllabus/courses/${courseId}`, { skipAuth: false });
                // Expected shape (SyllabusCourseOut): { id, batch_id, semester, course_code, title, units:[{id,unit_title,topics:[{id,topic_title,...}]}] }
                if (!data || data.detail === 'Course not found') {
                    showError('Syllabus course not found.');
                    return;
                }
                syllabusCourse = {
                    id: data.id,
                    course_code: data.course_code,
                    title: data.title,
                    semester: data.semester,
                    units: Array.isArray(data.units) ? data.units : []
                };
                titleEl.innerHTML = `Subject syllabus <span class="opacity-70">· ${Collage.escapeHtml(courseCode || '')}</span>`;
                subtitleEl.textContent = `${syllabusCourse.units.length} unit${syllabusCourse.units.length === 1 ? '' : 's'} defined.`;
                breadcrumbsEl.innerHTML = makeBreadcrumb([
                    { label: 'Colleges', href: 'clg_info.html' },
                    { label: collegeName || 'College', href: `degrees.html?collegeId=${encodeURIComponent(params.collegeId || '')}&collegeName=${encodeURIComponent(collegeName || '')}` },
                    { label: degreeName || 'Degree', href: `departments.html?collegeId=${encodeURIComponent(params.collegeId || '')}&collegeName=${encodeURIComponent(collegeName || '')}&degreeId=${encodeURIComponent(params.degreeId || '')}&degreeName=${encodeURIComponent(degreeName || '')}` },
                    { label: departmentName || 'Department', href: `batches.html?collegeId=${encodeURIComponent(params.collegeId || '')}&collegeName=${encodeURIComponent(collegeName || '')}&degreeId=${encodeURIComponent(params.degreeId || '')}&degreeName=${encodeURIComponent(degreeName || '')}&departmentName=${encodeURIComponent(departmentName || '')}` },
                    { label: 'Subjects', href: `subjects.html?collegeId=${encodeURIComponent(params.collegeId || '')}&collegeName=${encodeURIComponent(collegeName || '')}&degreeId=${encodeURIComponent(params.degreeId || '')}&degreeName=${encodeURIComponent(degreeName || '')}&departmentName=${encodeURIComponent(departmentName || '')}&batchRange=${encodeURIComponent(batchRange || '')}` },
                    { label: courseCode || 'Syllabus' }
                ]);
                renderContext();
                addUnitBtn.disabled = false;
                // Update back link with full subjects context
                if (backLink) {
                    const subjectsUrl = `subjects.html?collegeId=${encodeURIComponent(params.collegeId || '')}&collegeName=${encodeURIComponent(collegeName || '')}&degreeId=${encodeURIComponent(params.degreeId || '')}&degreeName=${encodeURIComponent(degreeName || '')}&departmentName=${encodeURIComponent(departmentName || '')}&batchId=${encodeURIComponent(batchId || '')}&batchRange=${encodeURIComponent(batchRange || '')}`;
                    backLink.setAttribute('href', subjectsUrl);
                }
            } catch (err) {
                console.error(err);
                showError(err.message || 'Unexpected error');
            }

            renderUnits(syllabusCourse?.units || []);
            restoreScrollY(scrollBefore);
        }

        addUnitBtn.addEventListener('click', () => openUnitModal('add'));
        document.addEventListener('DOMContentLoaded', async () => {
            try {
                if (window.Collage && window.Collage.requireAdminOrEmployee) {
                    await window.Collage.requireAdminOrEmployee();
                }
                loadSyllabus();
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
