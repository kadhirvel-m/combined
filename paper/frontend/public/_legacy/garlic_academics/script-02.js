// Extracted from ui/garlic_academics.html (inline <script> #2).
        const API_BASE = (window.API_BASE || 'http://0.0.0.0:10000').replace(/\/$/, '');
        const $ = (id) => document.getElementById(id);
        let __ctx = null;
        let __payload = null;
        let __viewMode = 'graph';
        let __completedTopicIds = new Set();
        let __liveKpis = { totalTopics: 0, completedTopics: 0, activeSubjects: 0, ready: false };
        const ensureAuthReady = (typeof window.__PX_ENSURE_AUTH_READY === 'function')
            ? window.__PX_ENSURE_AUTH_READY
            : (async () => false);

        function esc(value) {
            const fn = (typeof window.escapeHtml === 'function') ? window.escapeHtml : null;
            if (fn) return fn(value);
            return String(value == null ? '' : value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
        }

        function showStatus(message, isError = false) {
            const node = $('statusMsg');
            if (!node) return;
            node.textContent = message || '';
            node.classList.toggle('hidden', !message);
            node.classList.toggle('text-red-700', !!isError);
            node.classList.toggle('dark:text-red-200', !!isError);
            node.classList.toggle('bg-red-500/10', !!isError);
            node.classList.toggle('ring-red-500/30', !!isError);
            node.classList.toggle('text-neutral-700', !isError);
            node.classList.toggle('dark:text-white/85', !isError);
            node.classList.toggle('bg-black/5', !isError);
            node.classList.toggle('dark:bg-white/5', !isError);
        }

        function getToken() {
            const hasCookieAuthState = (() => {
                try { return document.cookie.indexOf('paperx_auth=') !== -1; } catch (_) { return false; }
            })();
            if (hasCookieAuthState) return '__COOKIE_AUTH__';
            try {
                const t = localStorage.getItem('px_token');
                if (t && t !== '__COOKIE_AUTH__') return t;
            } catch (_) { }
            try {
                const fb = (sessionStorage.getItem('paperx_bearer_fallback') || '').trim();
                if (fb) return fb;
            } catch (_) { }
            try {
                const fb2 = (localStorage.getItem('paperx_bearer_fallback') || '').trim();
                if (fb2) return fb2;
            } catch (_) { }
            return hasCookieAuthState ? '__COOKIE_AUTH__' : '';
        }

        function authHeaders() {
            const token = getToken();
            return token ? { Authorization: `Bearer ${token}` } : {};
        }

        async function fetchJson(url, opts = {}) {
            const merged = {
                credentials: 'include',
                ...opts,
                headers: { ...(opts.headers || {}) },
            };
            const res = await fetch(url, merged);
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                const detail = data?.detail || `HTTP ${res.status}`;
                const err = new Error(String(detail));
                err.status = res.status;
                throw err;
            }
            return data;
        }

        async function fetchJsonWithAuthRetry(url, opts = {}) {
            try {
                return await fetchJson(url, opts);
            } catch (err) {
                if (Number(err?.status) !== 401) throw err;
                try { await ensureAuthReady(); } catch (_) { }
                return await fetchJson(url, opts);
            }
        }

        async function fetchJsonCompat(url, opts = {}) {
            try {
                const r = await fetch(url, opts);
                if (r.status === 401) return { unauthorized: true };
                const data = await (r.ok ? r.json() : null);
                return { status: r.status, data };
            } catch (_) {
                return { error: true };
            }
        }

        function isSuccessCompat(res) {
            return res && !res.error && !res.unauthorized && typeof res.status === 'number' && res.status >= 200 && res.status < 300;
        }

        function parseProfileContext(profile) {
            const p = profile || {};
            return {
                student_id: String(p?.auth_user_id || '').trim(),
                batch_id: String(p?.batch?.id || p?.batch_id || '').trim() || null,
                semester: Number(p?.semester || 0) || null,
                college: String(p?.college?.name || p?.college || '').trim() || null,
            };
        }

        function priorityClass(score) {
            const v = Number(score || 0);
            if (v >= 75) return 'metric-chip pri-high';
            if (v >= 50) return 'metric-chip pri-mid';
            return 'metric-chip pri-low';
        }

        function statusClass(status) {
            return `status-chip st-${String(status || 'not_started')}`;
        }

        function prettyStatus(value) {
            const raw = String(value || 'not_started').replace(/_/g, ' ').trim();
            return raw.charAt(0).toUpperCase() + raw.slice(1);
        }

        function notesPageByType(courseType) {
            const t = String(courseType || '').toLowerCase();
            if (t.includes('math')) return 'maths_notes.html';
            if (t.includes('phys')) return 'physics_notes.html';
            return 'notes_generator.html';
        }

        function getProfileFromMeResponse(out) {
            return out?.profile || out?.data?.profile || {};
        }

        function getSyllabusFromMeResponse(out) {
            const value = out?.syllabus || out?.data?.syllabus;
            return Array.isArray(value) ? value : [];
        }

        function getCompletedTopicIdsResponse(out) {
            const value = out?.completed_topic_ids || out?.data?.completed_topic_ids;
            return Array.isArray(value) ? value : [];
        }

        function countSyllabusTopics(syllabus) {
            let total = 0;
            const courses = Array.isArray(syllabus) ? syllabus : [];
            courses.forEach((course) => {
                const units = Array.isArray(course?.units) ? course.units : [];
                units.forEach((unit) => {
                    const topics = Array.isArray(unit?.topics) ? unit.topics : [];
                    total += topics.length;
                });
            });
            return total;
        }

        async function loadLiveAcademicMetrics() {
            const maxAttempts = 2;
            for (let attempt = 0; attempt < maxAttempts; attempt++) {
                let meOut = await fetchJsonCompat(`${API_BASE}/api/me`, { headers: { ...authHeaders() }, credentials: 'include' });
                let progOut = await fetchJsonCompat(`${API_BASE}/api/progress/topics`, { headers: { ...authHeaders() }, credentials: 'include' });

                if (meOut.unauthorized || progOut.unauthorized) {
                    try { await ensureAuthReady(); } catch (_) { }
                    meOut = await fetchJsonCompat(`${API_BASE}/api/me`, { headers: { ...authHeaders() }, credentials: 'include' });
                    progOut = await fetchJsonCompat(`${API_BASE}/api/progress/topics`, { headers: { ...authHeaders() }, credentials: 'include' });
                }

                if (!isSuccessCompat(meOut)) {
                    if (attempt < maxAttempts - 1) continue;
                    throw new Error('Unable to load live profile context');
                }

                if (!isSuccessCompat(progOut)) {
                    progOut = { status: 200, data: { completed_topic_ids: [] } };
                }

                const meData = meOut?.data || {};
                const progData = progOut?.data || {};
                const syllabus = Array.isArray(meData?.syllabus)
                    ? meData.syllabus
                    : (Array.isArray(meData?.data?.syllabus) ? meData.data.syllabus : []);
                const syllabusTopicIds = new Set();
                (Array.isArray(syllabus) ? syllabus : []).forEach((course) => {
                    (Array.isArray(course?.units) ? course.units : []).forEach((unit) => {
                        (Array.isArray(unit?.topics) ? unit.topics : []).forEach((topic) => {
                            const id = String(topic?.id || topic?.topic_id || '').trim();
                            if (id) syllabusTopicIds.add(id);
                        });
                    });
                });
                const completed = (Array.isArray(progData?.completed_topic_ids)
                    ? progData.completed_topic_ids
                    : (Array.isArray(progData?.data?.completed_topic_ids) ? progData.data.completed_topic_ids : []))
                    .map((id) => String(id || '').trim())
                    .filter(Boolean);
                const completedInSyllabus = completed.filter((id) => syllabusTopicIds.has(id));

                __completedTopicIds = new Set(completed);
                __liveKpis = {
                    totalTopics: countSyllabusTopics(syllabus),
                    completedTopics: completedInSyllabus.length,
                    activeSubjects: syllabus.length,
                    ready: true,
                };
                return;
            }
        }

        function flattenTopics(payload) {
            const out = [];
            const subjects = Array.isArray(payload?.subjects) ? payload.subjects : [];
            subjects.forEach((subject) => {
                const units = Array.isArray(subject?.units) ? subject.units : [];
                units.forEach((unit) => {
                    const topics = Array.isArray(unit?.topics) ? unit.topics : [];
                    topics.forEach((topic) => {
                        out.push({
                            subject,
                            unit,
                            topic,
                        });
                    });
                });
            });
            return out;
        }

        async function trackTopicOpen(itemId, topicId) {
            try {
                await fetchJson(`${API_BASE}/api/garlic/study-plan/interaction`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...authHeaders() },
                    body: JSON.stringify({ item_id: itemId || null, topic_id: topicId || null, event_type: 'topic_click' }),
                });
                if (itemId) {
                    await fetchJson(`${API_BASE}/api/garlic/study-plan/items/${encodeURIComponent(itemId)}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json', ...authHeaders() },
                        body: JSON.stringify({ status: 'in_progress', last_accessed: new Date().toISOString() }),
                    });
                }
            } catch (_) { }
        }

        function updateKpis(payload) {
            const summary = payload?.summary || {};
            const summaryTotal = Number(summary?.total_topics || 0);
            const summaryDone = Number(summary?.completed_topics || 0);
            const liveReady = !!__liveKpis?.ready;
            const total = liveReady ? Number(__liveKpis?.totalTopics || 0) : summaryTotal;
            const doneRaw = liveReady ? Number(__liveKpis?.completedTopics || 0) : summaryDone;
            const done = Math.max(0, Math.min(doneRaw, total || doneRaw));
            const activeSubjects = liveReady ? Number(__liveKpis?.activeSubjects || 0) : Number(summary?.total_subjects || 0);
            const topics = flattenTopics(payload);
            const avgConfidence = topics.length
                ? (topics.reduce((a, b) => a + Number(b?.topic?.confidence_score || 0), 0) / topics.length)
                : 0;
            const completionPct = total > 0 ? Math.round((done / total) * 100) : 0;
            const confidencePct = Math.max(0, Math.min(100, Math.round(avgConfidence)));

            const kpiDone = $('kpiTopicsDone');
            if (kpiDone) kpiDone.textContent = String(done);
            const kpiTotal = $('kpiTopicsTotal');
            if (kpiTotal) kpiTotal.textContent = String(total);
            $('kpiActiveSubjects').textContent = String(activeSubjects);
            $('kpiCompletion').textContent = `${completionPct}%`;
            $('kpiConfidence').textContent = avgConfidence.toFixed(1);

            const ring = $('kpiCompletionRing');
            if (ring) ring.style.setProperty('--pct', String(completionPct));

            const topicsBar = $('kpiTopicsBar');
            if (topicsBar) topicsBar.style.width = `${completionPct}%`;

            const confidenceBar = $('kpiConfidenceBar');
            if (confidenceBar) confidenceBar.style.width = `${confidencePct}%`;

        }

        function renderDailyFocus(payload) {
            const holder = $('dailyFocus');
            if (!holder) return;
            const list = Array.isArray(payload?.daily_focus) ? payload.daily_focus : [];
            holder.innerHTML = '';

            if (!list.length) {
                holder.innerHTML = '<div class="rounded-2xl ring-1 ring-black/10 dark:ring-white/15 bg-white/70 dark:bg-white/5 p-4 text-sm text-neutral-600 dark:text-white/70">No focus actions yet.</div>';
                $('estimatedLine').textContent = 'Estimated Time: --';
                return;
            }

            let total = 0;
            list.forEach((item, idx) => {
                const mins = Number(item?.estimated_time || 0);
                total += mins;
                const isDone = String(item?.status || '') === 'completed';
                const ringStyle = isDone ? 'bg-green-500 border-none' : 'border-2 border-neutral-300 dark:border-neutral-600';
                
                // Use inline style for absolute guarantee of color rendering to bypass Tailwind JIT purging
                const pulse = isDone ? '<span class="material-symbols-rounded text-white text-[12px] font-bold">check</span>' : '<div class="w-2.5 h-2.5 rounded-full animate-pulse" style="background-color: #9E4B8A;"></div>';

                // Find course_type to route the click correctly
                const flat = flattenTopics(payload);
                let cType = item?.course_type || '';
                if (!cType) {
                    const matched = flat.find(f => String(f?.topic?.topic_id) === String(item?.topic_id) || String(f?.topic?.topic) === String(item?.topic));
                    cType = matched?.subject?.course_type || '';
                }
                const page = notesPageByType(cType);
                const href = `${page}?topic=${encodeURIComponent(item?.topic || '')}`;

                const row = document.createElement('article');
                row.className = 'group relative flex items-center justify-between gap-4 py-3.5 border-b border-black/5 dark:border-white/10 last:border-0 hover:bg-black/[0.03] dark:hover:bg-white/[0.04] px-3 -mx-3 rounded-xl transition-colors cursor-pointer';
                row.innerHTML = `
                   <a href="${href}" target="_blank" rel="noopener" data-item-id="${esc(item?.item_id || '')}" data-topic-id="${esc(item?.topic_id || '')}" class="topic-link absolute inset-0 z-10 rounded-xl"></a>
                   <div class="flex items-center gap-4 min-w-0">
                       <div class="shrink-0 flex items-center justify-center relative z-20">
                           <div class="w-5 h-5 rounded-full flex items-center justify-center ${ringStyle}">
                              ${pulse}
                           </div>
                       </div>
                       <div class="min-w-0">
                           <h3 class="text-[14px] font-bold text-neutral-800 dark:text-white/95 truncate ${isDone ? 'line-through opacity-70' : ''}">${esc(item?.topic || 'Topic')}</h3>
                           <div class="flex items-center flex-wrap gap-3 mt-1.5 text-xs text-neutral-500 dark:text-neutral-400 font-medium tracking-wide">
                               <span class="flex items-center gap-1 opacity-90"><span class="material-symbols-rounded text-[15px]">timer</span> ${mins}m</span>
                               <span class="flex items-center gap-1 text-orange-600 dark:text-orange-400"><span class="material-symbols-rounded text-[15px]">local_fire_department</span> P${Number(item?.priority_score || 0).toFixed(1)}</span>
                               <span class="uppercase font-bold pt-0.5 ${isDone ? 'text-green-600 dark:text-green-400' : 'text-brand-600 dark:text-brand-400'}" style="font-size: 10px;">${esc(prettyStatus(item?.status))}</span>
                           </div>
                       </div>
                   </div>
                   <div class="shrink-0 md:opacity-0 group-hover:opacity-100 transition-opacity relative z-20 pointer-events-none">
                       <button class="size-8 rounded-full bg-white dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/20 flex items-center justify-center text-brand-600 dark:text-brand-400 hover:scale-105 transition-transform shadow-sm" aria-label="Start Task">
                           <span class="material-symbols-rounded text-[18px]">play_arrow</span>
                       </button>
                   </div>
                `;
                holder.appendChild(row);
            });

            const h = Math.floor(total / 60);
            const m = total % 60;
            $('estimatedLine').textContent = `Estimated Time: ${h > 0 ? `${h}h ` : ''}${m}m`;
        }

        function renderPriorityGraph(payload) {
            const wrap = $('hierarchyWrap');
            if (!wrap) return;
            const subjects = Array.isArray(payload?.subjects) ? payload.subjects : [];
            wrap.innerHTML = '';

            if (!subjects.length) {
                wrap.innerHTML = '<div class="rounded-2xl ring-1 ring-black/10 dark:ring-white/15 bg-white/70 dark:bg-white/5 p-4 text-sm text-neutral-600 dark:text-white/70">No topics available in this plan.</div>';
                return;
            }

            subjects.forEach((subject) => {
                const subjectCard = document.createElement('section');
                subjectCard.className = 'rounded-2xl ring-1 ring-black/5 dark:ring-white/10 bg-white/80 dark:bg-brand-900/55 backdrop-blur overflow-hidden';
                const units = Array.isArray(subject?.units) ? subject.units : [];

                const unitBlocks = units.map((unit) => {
                    const topics = Array.isArray(unit?.topics) ? unit.topics : [];
                    topics.sort((a, b) => Number(b?.priority_score || 0) - Number(a?.priority_score || 0));
                    const topicRows = topics.map((topic) => {
                        const topicName = String(topic?.topic || '').trim();
                        const topicId = String(topic?.topic_id || '').trim();
                        const isCompleted = (topicId && __completedTopicIds.has(topicId)) || String(topic?.status || '') === 'completed' || !!topic?.completed;
                        const topicClass = isCompleted ? 'line-through opacity-60' : '';
                        const page = notesPageByType(subject?.course_type || '');
                        const href = `${page}?topic=${encodeURIComponent(topicName)}`;
                        return `
                            <li class="group flex items-center gap-3 py-2.5 px-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors relative">
                                <a href="${href}" target="_blank" rel="noopener" data-item-id="${esc(topic?.item_id || '')}" data-topic-id="${esc(topic?.topic_id || '')}" class="topic-link absolute inset-0 z-10"></a>
                                <div class="shrink-0 w-4 flex justify-center">
                                    <span class="material-symbols-rounded text-[16px] ${isCompleted ? 'text-green-500' : 'text-neutral-300 dark:text-neutral-600'}">${isCompleted ? 'check_circle' : 'radio_button_unchecked'}</span>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <span class="block text-[13.5px] font-medium text-neutral-700 dark:text-white/80 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors truncate ${topicClass}">${esc(topicName)}</span>
                                </div>
                                <div class="shrink-0 flex items-center gap-2 relative z-20 pointer-events-none">
                                    <span class="flex items-center gap-1 text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded-md"><span class="material-symbols-rounded text-[11px]">local_fire_department</span>${Number(topic?.priority_score || 0).toFixed(1)}</span>
                                    <span class="${statusClass(topic?.status)} !text-[10px] !py-0.5 !px-1.5 rounded-md">${esc(prettyStatus(topic?.status))}</span>
                                </div>
                            </li>
                        `;
                    }).join('');

                    const completedUnit = topics.length > 0 && topics.every((topic) => {
                        const tId = String(topic?.topic_id || '').trim();
                        return (tId && __completedTopicIds.has(tId)) || String(topic?.status || '') === 'completed' || !!topic?.completed;
                    });

                    return `
                        <div class="rounded-xl border border-black/5 dark:border-white/5 bg-white shadow-sm dark:bg-white/5 overflow-hidden">
                            <button type="button" data-unit-toggle aria-expanded="false" class="w-full px-4 py-3.5 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition-colors outline-none cursor-pointer">
                                <div class="flex items-center gap-3">
                                   <div class="w-1.5 h-1.5 rounded-full ${completedUnit ? 'bg-green-500' : 'bg-brand-500'}"></div>
                                   <span class="text-[14px] font-semibold text-neutral-800 dark:text-white/90 ${completedUnit ? 'line-through opacity-50' : ''}">${esc(unit?.unit_title || 'Unit')}</span>
                                </div>
                                <div class="flex items-center gap-3 text-neutral-400">
                                   <span class="text-[11px] font-medium opacity-80">${topics.length} topics</span>
                                   <span data-unit-caret class="material-symbols-rounded text-[20px] transition-transform duration-300">expand_more</span>
                                </div>
                            </button>
                            <div class="hidden border-t border-black/5 dark:border-white/5 bg-neutral-50/50 dark:bg-black/20" data-unit-topics>
                                <ul class="divide-y divide-black/5 dark:divide-white/5 text-sm">${topicRows || '<li class="p-3 text-xs text-neutral-500">No topics</li>'}</ul>
                            </div>
                        </div>
                    `;
                }).join('');

                const subjectTitle = esc(subject?.subject_title || 'Subject');
                const subjectCode = esc(subject?.course_code || '');
                subjectCard.className = 'group rounded-2xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.02] overflow-hidden hover:bg-white/80 dark:hover:bg-white/[0.04] transition-colors';
                subjectCard.innerHTML = `
                    <button class="w-full px-5 py-4 flex items-center justify-between cursor-pointer outline-none focus-visible:bg-black/5" data-subject-toggle aria-expanded="false">
                        <div class="flex items-center gap-4 min-w-0">
                            <div class="size-10 rounded-full bg-brand-500/10 flex items-center justify-center shrink-0">
                                <span class="material-symbols-rounded text-[20px] text-brand-600 dark:text-brand-400">library_books</span>
                            </div>
                            <div class="text-left min-w-0">
                                <h3 class="font-bold text-[15px] truncate text-neutral-900 dark:text-white/95">${subjectTitle}</h3>
                                <p class="text-[12px] text-neutral-500 dark:text-white/50 mt-0.5 font-medium">${units.length} Units Built-in</p>
                            </div>
                        </div>
                        <div class="shrink-0 ml-4 flex items-center justify-center">
                            <span data-subject-caret class="material-symbols-rounded text-neutral-400 transition-transform duration-300">chevron_right</span>
                        </div>
                    </button>
                    <div class="hidden border-t border-black/5 dark:border-white/5 bg-black/[0.015] dark:bg-black/[0.2]" data-subject-units>
                        <div class="p-4 md:p-5 flex flex-col gap-3">
                            ${unitBlocks}
                        </div>
                    </div>
                `;
                wrap.appendChild(subjectCard);
            });

            wrap.querySelectorAll('[data-subject-toggle]').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const card = btn.closest('section');
                    const target = card?.querySelector('[data-subject-units]');
                    const caret = btn.querySelector('[data-subject-caret]');
                    if (!target) return;
                    const expand = target.classList.contains('hidden');
                    target.classList.toggle('hidden', !expand);
                    btn.setAttribute('aria-expanded', expand ? 'true' : 'false');
                    if (caret) {
                        caret.classList.toggle('rotate-90', expand);
                        caret.classList.toggle('rotate-0', !expand);
                    }
                });
            });

            wrap.querySelectorAll('[data-unit-toggle]').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const unitWrap = btn.closest('.rounded-xl');
                    const target = unitWrap?.querySelector('[data-unit-topics]');
                    const caret = btn.querySelector('[data-unit-caret]');
                    if (!target) return;
                    const expand = target.classList.contains('hidden');
                    target.classList.toggle('hidden', !expand);
                    btn.setAttribute('aria-expanded', expand ? 'true' : 'false');
                    if (caret) {
                        caret.classList.toggle('rotate-180', expand);
                        caret.classList.toggle('rotate-0', !expand);
                    }
                });
            });

            wrap.querySelectorAll('.topic-link').forEach((link) => {
                link.addEventListener('click', (ev) => {
                    const itemId = String(ev.currentTarget.getAttribute('data-item-id') || '').trim();
                    const topicId = String(ev.currentTarget.getAttribute('data-topic-id') || '').trim();
                    trackTopicOpen(itemId, topicId);
                });
            });
        }

        function renderPriorityList(payload) {
            const wrap = $('hierarchyWrap');
            if (!wrap) return;
            const topics = flattenTopics(payload);
            topics.sort((a, b) => Number(b?.topic?.priority_score || 0) - Number(a?.topic?.priority_score || 0));
            const top = topics.slice(0, 70);

            if (!top.length) {
                wrap.innerHTML = '<div class="rounded-2xl ring-1 ring-black/10 dark:ring-white/15 bg-white/70 dark:bg-white/5 p-4 text-sm text-neutral-600 dark:text-white/70">No ranked topics available.</div>';
                return;
            }

            wrap.innerHTML = top.map(({ subject, unit, topic }, idx) => {
                const topicName = String(topic?.topic || '').trim();
                const topicId = String(topic?.topic_id || '').trim();
                const isCompleted = (topicId && __completedTopicIds.has(topicId)) || String(topic?.status || '') === 'completed' || !!topic?.completed;
                const topicClass = isCompleted ? 'line-through opacity-60' : '';
                const page = notesPageByType(subject?.course_type || '');
                const href = `${page}?topic=${encodeURIComponent(topicName)}`;
                return `
                    <article class="rounded-xl ring-1 ring-black/10 dark:ring-white/15 bg-white/75 dark:bg-white/5 px-3 py-2">
                        <div class="flex items-start justify-between gap-3">
                            <div class="min-w-0">
                                <p class="text-xs text-neutral-500 dark:text-white/60">#${idx + 1} • ${esc(subject?.subject_title || 'Subject')} / ${esc(unit?.unit_title || 'Unit')}</p>
                                <a href="${href}" target="_blank" rel="noopener" data-item-id="${esc(topic?.item_id || '')}" data-topic-id="${esc(topic?.topic_id || '')}" class="topic-link text-sm font-semibold text-brand-700 dark:text-brandlt-200 hover:underline break-words ${topicClass}">${esc(topicName)}</a>
                                <p class="text-xs mt-1 text-neutral-600 dark:text-white/70">${esc(topic?.reason || 'High impact recommendation.')}</p>
                            </div>
                            <div class="shrink-0 flex flex-col items-end gap-1.5">
                                <span class="${priorityClass(topic?.priority_score)}">P ${Number(topic?.priority_score || 0).toFixed(1)}</span>
                                <span class="metric-chip">C ${Number(topic?.confidence_score || 0).toFixed(1)}</span>
                                <span class="${statusClass(topic?.status)}">${esc(prettyStatus(topic?.status))}</span>
                            </div>
                        </div>
                    </article>
                `;
            }).join('');

            wrap.querySelectorAll('.topic-link').forEach((link) => {
                link.addEventListener('click', (ev) => {
                    const itemId = String(ev.currentTarget.getAttribute('data-item-id') || '').trim();
                    const topicId = String(ev.currentTarget.getAttribute('data-topic-id') || '').trim();
                    trackTopicOpen(itemId, topicId);
                });
            });
        }

        function renderInsights(payload) {
            const node = $('insightsList');
            if (!node) return;
            const insights = Array.isArray(payload?.insights) ? payload.insights : [];
            node.innerHTML = '';
            if (!insights.length) {
                node.innerHTML = '<li>No insights available yet.</li>';
                return;
            }
            insights.forEach((line) => {
                const li = document.createElement('li');
                li.className = 'leading-relaxed';
                li.textContent = String(line || '');
                node.appendChild(li);
            });
        }

        function renderStatusBoard(payload) {
            const board = $('statusBoard');
            if (!board) return;
            const topics = flattenTopics(payload).map((x) => x.topic || {});
            const groups = {
                not_started: topics.filter((t) => String(t?.status || 'not_started') === 'not_started'),
                in_progress: topics.filter((t) => String(t?.status || '') === 'in_progress'),
                completed: topics.filter((t) => String(t?.status || '') === 'completed' || !!t?.completed),
            };

            const renderGroup = (label, key) => {
                const arr = groups[key] || [];
                const items = arr
                    .sort((a, b) => Number(b?.priority_score || 0) - Number(a?.priority_score || 0))
                    .slice(0, 4)
                    .map((t) => `<li class="text-xs text-neutral-600 dark:text-white/70 truncate">${esc(t?.topic || 'Topic')}</li>`)
                    .join('');
                return `
                    <section class="rounded-2xl ring-1 ring-black/10 dark:ring-white/15 bg-white/70 dark:bg-white/5 p-3">
                        <div class="flex items-center justify-between gap-2">
                            <p class="text-xs font-semibold">${label}</p>
                            <span class="${statusClass(key)}">${arr.length}</span>
                        </div>
                        <ul class="mt-2 space-y-1">${items || '<li class="text-xs text-neutral-500 dark:text-white/60">No topics</li>'}</ul>
                    </section>
                `;
            };

            board.innerHTML = [
                renderGroup('Not Started', 'not_started'),
                renderGroup('In Progress', 'in_progress'),
                renderGroup('Completed', 'completed'),
            ].join('');
        }

        function renderPlan(payload) {
            __payload = payload;
            updateKpis(payload);
            renderDailyFocus(payload);
            if (__viewMode === 'graph') renderPriorityGraph(payload);
            else renderPriorityList(payload);
            renderInsights(payload);
            renderStatusBoard(payload);
        }

        async function loadMeBundle() {
            return await fetchJson(`${API_BASE}/api/me`, { headers: { ...authHeaders() } });
        }

        async function loadPersistedPlan(studentId) {
            return await fetchJson(`${API_BASE}/api/garlic/plan/${encodeURIComponent(studentId)}`, {
                headers: { ...authHeaders() },
            });
        }

        async function generatePlan(ctx, regenerate = false) {
            const endpoint = regenerate ? '/api/garlic/regenerate' : '/api/garlic/generate';
            return await fetchJson(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify({
                    student_id: ctx.student_id,
                    batch_id: ctx.batch_id,
                    semester: ctx.semester,
                    college: ctx.college,
                }),
            });
        }

        function activateViewButton() {
            const graphBtn = $('viewGraphBtn');
            const listBtn = $('viewListBtn');
            if (!graphBtn || !listBtn) return;
            const graphOn = __viewMode === 'graph';
            graphBtn.className = `view-mode-btn rounded-full px-3 py-1.5 text-xs font-semibold ${graphOn ? 'bg-brand-500 text-white' : 'text-neutral-700 dark:text-white/80'}`;
            listBtn.className = `view-mode-btn rounded-full px-3 py-1.5 text-xs font-semibold ${!graphOn ? 'bg-brand-500 text-white' : 'text-neutral-700 dark:text-white/80'}`;
        }

        async function bootstrap() {
            showStatus('Loading GARLIC autonomous plan...');
            try {
                try { await ensureAuthReady(); } catch (_) { }
                const meOut = await loadMeBundle();
                const profile = getProfileFromMeResponse(meOut);
                const ctx = parseProfileContext(profile);
                __ctx = ctx;
                if (!ctx.student_id) throw new Error('Unable to resolve your account id. Please re-login.');

                try {
                    await loadLiveAcademicMetrics();
                } catch (_) {
                    // Ignore live KPI sync failures; plan data fallback will still render.
                }

                try {
                    const payload = await loadPersistedPlan(ctx.student_id);
                    renderPlan(payload);
                    showStatus('');
                } catch (err) {
                    if (err && Number(err.status) === 404) {
                        showStatus('No saved plan found. Generating plan...');
                        const payload = await generatePlan(ctx, false);
                        renderPlan(payload);
                        showStatus('');
                    } else {
                        throw err;
                    }
                }
            } catch (err) {
                showStatus(err?.message || 'Failed to initialize GARLIC mode.', true);
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            activateViewButton();

            $('viewGraphBtn')?.addEventListener('click', () => {
                __viewMode = 'graph';
                activateViewButton();
                if (__payload) renderPriorityGraph(__payload);
            });

            $('viewListBtn')?.addEventListener('click', () => {
                __viewMode = 'list';
                activateViewButton();
                if (__payload) renderPriorityList(__payload);
            });

            const handleRegenerate = async () => {
                if (!__ctx) return;
                showStatus('Regenerating GARLIC plan...');
                try {
                    try { await loadLiveAcademicMetrics(); } catch (_) { }
                    const payload = await generatePlan(__ctx, true);
                    renderPlan(payload);
                    showStatus('Plan regenerated and stored.');
                } catch (err) {
                    showStatus(err?.message || 'Failed to regenerate plan.', true);
                }
            };

            $('regenBtnNav')?.addEventListener('click', handleRegenerate);
            $('regenBtnNavMobile')?.addEventListener('click', handleRegenerate);

            bootstrap();

            // ========== EXAM COMMAND CENTER: FULL INTELLIGENCE UI ==========
            const V3 = `${API_BASE}/api/garlic/v3`;
            let __examProfile = null;
            let __outcomeData = null;
            let __eccActive = false;
            let __controlLoopTimer = null;
            let __microDiagSessionId = null;
            let __lastOutcomeFetch = 0;
            let __nextTopicCache = null;
            let __interventionCooldown = 0;

            function eccShow(show) {
                const ecc = $('examCommandCenter');
                const activator = $('examModeActivator');
                if (ecc) ecc.classList.toggle('hidden', !show);
                if (activator) activator.classList.toggle('hidden', !!show);
                __eccActive = show;
            }

            // --- Exam Mode Activation ---
            $('activateExamBtn')?.addEventListener('click', async () => {
                const dateVal = $('examDateInput')?.value;
                if (!dateVal) { alert('Please select your exam date.'); return; }
                try {
                    const res = await fetchJson(`${V3}/exam-mode/activate`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', ...authHeaders() },
                        body: JSON.stringify({ exam_date: dateVal }),
                    });
                    __examProfile = res?.profile || {};
                    eccShow(true);
                    eccUpdateStatus(res);
                    eccRefreshAll();
                    eccStartControlLoop();
                } catch (err) {
                    alert('Failed to activate exam mode: ' + (err?.message || 'Unknown error'));
                }
            });

            // --- Deactivation ---
            $('eccDeactivateBtn')?.addEventListener('click', async () => {
                if (!confirm('Exit Exam Mode? Your prediction data will be preserved.')) return;
                try {
                    await fetchJson(`${V3}/exam-mode/deactivate`, { method: 'POST', headers: authHeaders() });
                    __examProfile = null;
                    __eccActive = false;
                    eccShow(false);
                    eccStopControlLoop();
                } catch (_) {}
            });

            // --- Check exam mode on boot ---
            async function eccCheckOnBoot() {
                try {
                    const res = await fetchJson(`${V3}/exam-mode/status`, { headers: authHeaders() });
                    if (res?.active && res?.profile) {
                        __examProfile = res.profile;
                        eccShow(true);
                        eccUpdateStatus({ profile: res.profile, intensity_level: res.profile?.intensity_level });
                        eccRefreshAll();
                        eccStartControlLoop();
                    }
                } catch (_) {}
            }
            // Run after bootstrap completes
            setTimeout(eccCheckOnBoot, 1500);

            // --- Update Status Card ---
            function eccUpdateStatus(data) {
                const profile = data?.profile || __examProfile || {};
                const intensity = data?.intensity_level || profile?.intensity_level || 'exam';
                const days = profile?.time_remaining_days;

                const badge = $('eccIntensityBadge');
                if (badge) {
                    const colors = {
                        normal: 'bg-green-500/15 text-green-700 dark:text-green-400 ring-green-500/25',
                        exam: 'bg-brand-500/15 text-brand-700 dark:text-brandlt-200 ring-brand-500/25',
                        critical: 'bg-red-500/15 text-red-700 dark:text-red-400 ring-red-500/25',
                    };
                    badge.className = `text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ring-1 ${colors[intensity] || colors.exam}`;
                    badge.textContent = `${intensity.toUpperCase()} MODE`;
                }

                const countdown = $('eccCountdown');
                if (countdown) {
                    countdown.textContent = days != null ? `${days} DAYS LEFT` : '';
                }

                const modeName = $('eccModeName');
                const modeDesc = $('eccModeDesc');
                const timeImpact = $('eccTimeImpact');
                const descriptions = {
                    normal: 'Balanced learning across full syllabus',
                    exam: 'Aggressive topic prioritization active',
                    critical: 'SURVIVAL MODE — only high-yield topics',
                };
                if (modeName) modeName.textContent = intensity.toUpperCase();
                if (modeDesc) modeDesc.textContent = descriptions[intensity] || descriptions.exam;
                if (timeImpact) {
                    if (days != null) {
                        if (days <= 7) timeImpact.textContent = `⚠️ CRITICAL: Only ${days} days. Every minute counts.`;
                        else if (days <= 30) timeImpact.textContent = `${days} days until exam — prioritizing high-impact topics.`;
                        else timeImpact.textContent = `${days} days remaining — steady pace recommended.`;
                    }
                }

                // Risk card visual
                const riskCard = $('eccRiskCard');
                const riskLevel = profile?.risk_level || 'low';
                if (riskCard) {
                    const riskColors = {
                        low: 'ring-green-500/20',
                        moderate: 'ring-yellow-500/30',
                        high: 'ring-orange-500/40',
                        critical: 'ring-red-500/50',
                    };
                    riskCard.className = riskCard.className.replace(/ring-(green|yellow|orange|red)-\d+\/\d+/g, '');
                    riskCard.classList.add(riskColors[riskLevel] || 'ring-black/10');
                }
            }

            // --- Fetch & Render Outcomes ---
            async function eccFetchOutcomes() {
                if (!__ctx?.student_id) return;
                try {
                    const res = await fetchJson(`${V3}/outcomes/${encodeURIComponent(__ctx.student_id)}`, { headers: authHeaders() });
                    __outcomeData = res?.prediction || {};
                    __lastOutcomeFetch = Date.now();
                    eccRenderOutcomes(__outcomeData);
                } catch (_) {}
            }

            function eccRenderOutcomes(d) {
                const marks = Number(d?.predicted_marks || 0).toFixed(1);
                const completion = Number(d?.completion_probability || 0).toFixed(0);
                const readiness = Number(d?.readiness_score || 0).toFixed(1);
                const risk = String(d?.risk_level || 'low').toUpperCase();
                const reasons = d?.gap_analysis?.risk_reasons || [];

                if ($('eccPredictedMarks')) $('eccPredictedMarks').textContent = marks;
                if ($('eccCompletionPct')) $('eccCompletionPct').textContent = `${completion}%`;
                if ($('eccCompletionRing')) $('eccCompletionRing').style.setProperty('--pct', completion);
                if ($('eccReadinessScore')) $('eccReadinessScore').textContent = readiness;
                if ($('eccReadinessLevel')) {
                    const levels = { not_ready: 'NOT READY', partially_ready: 'PARTIAL', exam_ready: 'READY', high_scorer_ready: 'HIGH SCORER' };
                    $('eccReadinessLevel').textContent = levels[d?.readiness_level] || d?.readiness_level || '';
                }
                if ($('eccRiskLevel')) {
                    $('eccRiskLevel').textContent = risk;
                    const riskColors = { LOW: 'text-green-600 dark:text-green-400', MODERATE: 'text-yellow-600 dark:text-yellow-400', HIGH: 'text-orange-600 dark:text-orange-400', CRITICAL: 'text-red-600 dark:text-red-400' };
                    $('eccRiskLevel').className = `text-2xl md:text-3xl font-black uppercase leading-none ${riskColors[risk] || ''}`;
                }
                if ($('eccRiskReasons')) $('eccRiskReasons').textContent = reasons.slice(0, 2).join(' • ');

                // What-If-You-Stop
                const stopMarksDrop = Math.max(5, Number(d?.improvement_potential || 30) * 0.6).toFixed(0);
                const currentMarks = Number(d?.predicted_marks || 0);
                if ($('eccStopMarks')) $('eccStopMarks').textContent = `${Math.max(0, currentMarks - stopMarksDrop).toFixed(0)}/100 (−${stopMarksDrop})`;
                if ($('eccStopRisk')) {
                    const nextRisk = { low: 'MODERATE', moderate: 'HIGH', high: 'CRITICAL', critical: 'CRITICAL' };
                    $('eccStopRisk').textContent = `→ ${nextRisk[d?.risk_level] || 'HIGH'}`;
                }
                if ($('eccStopDelay')) {
                    const velocity = Number(d?.learning_velocity_topics_per_day || 0);
                    const remaining = Number(d?.signals?.total_topics || 0) - Number(d?.signals?.completed || 0);
                    const delayDays = velocity > 0 ? Math.ceil(remaining * 0.3 / velocity) : remaining;
                    $('eccStopDelay').textContent = `+${delayDays} days behind`;
                }

                // AI reasoning & recommendation
                if ($('eccAiReasoning')) $('eccAiReasoning').textContent = d?.ai_reasoning || '';

                // Update exam profile with latest data
                if (__examProfile) {
                    __examProfile.predicted_marks = d?.predicted_marks;
                    __examProfile.readiness_score = d?.readiness_score;
                    __examProfile.risk_level = d?.risk_level;
                }
            }

            // --- Daily Target ---
            async function eccFetchDailyTarget() {
                if (!__ctx?.student_id) return;
                try {
                    const res = await fetchJson(`${V3}/daily-target/${encodeURIComponent(__ctx.student_id)}`, { headers: authHeaders() });
                    if ($('eccDailyDone')) $('eccDailyDone').textContent = String(res?.completed_today || 0);
                    if ($('eccDailyTarget')) $('eccDailyTarget').textContent = String(res?.daily_target || 3);
                    if ($('eccDailyMsg')) {
                        $('eccDailyMsg').textContent = res?.message || '';
                        $('eccDailyMsg').className = `mt-2 text-[11px] font-semibold ${res?.on_track ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`;
                    }
                    const pct = res?.daily_target > 0 ? Math.min(100, Math.round((res?.completed_today / res?.daily_target) * 100)) : 0;
                    if ($('eccDailyBar')) $('eccDailyBar').style.width = `${pct}%`;
                } catch (_) {}
            }

            // --- Learning Velocity ---
            async function eccFetchVelocity() {
                if (!__ctx?.student_id) return;
                try {
                    const res = await fetchJson(`${V3}/velocity/${encodeURIComponent(__ctx.student_id)}`, { headers: authHeaders() });
                    const v = res?.velocity || {};
                    if ($('eccVelocityOverall')) $('eccVelocityOverall').textContent = String(v?.topics_per_day_overall || 0);
                    if ($('eccVelocityRecent')) $('eccVelocityRecent').textContent = String(v?.topics_per_day_last_7 || 0);
                    if ($('eccVelocityMsg')) {
                        $('eccVelocityMsg').textContent = v?.pace_message || '';
                        const ok = v?.will_complete_in_time !== false;
                        $('eccVelocityMsg').className = `mt-2 text-[10px] font-semibold leading-snug ${ok ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`;
                    }
                } catch (_) {}
            }

            // --- Exam Insights ---
            async function eccFetchInsights() {
                if (!__ctx?.student_id) return;
                try {
                    const res = await fetchJson(`${V3}/exam-insights/${encodeURIComponent(__ctx.student_id)}`, { headers: authHeaders() });
                    const container = $('eccInsightsContainer');
                    if (!container) return;
                    const insights = res?.insights || [];
                    if (!insights.length) {
                        container.innerHTML = '<p class="text-xs text-neutral-500 dark:text-white/50">No active alerts.</p>';
                        return;
                    }
                    container.innerHTML = insights.slice(0, 6).map(ins => {
                        const sevColors = { info: 'ring-blue-500/20 bg-blue-500/5', warning: 'ring-yellow-500/25 bg-yellow-500/5', critical: 'ring-red-500/30 bg-red-500/5' };
                        const sevIcons = { info: 'info', warning: 'warning', critical: 'error' };
                        const sevTextColors = { info: 'text-blue-600 dark:text-blue-400', warning: 'text-yellow-600 dark:text-yellow-400', critical: 'text-red-600 dark:text-red-400' };
                        const cls = sevColors[ins?.severity] || sevColors.info;
                        const icon = sevIcons[ins?.severity] || 'info';
                        const txtCls = sevTextColors[ins?.severity] || sevTextColors.info;
                        const impact = ins?.marks_impact ? `<span class="font-black ml-1">(~${Number(ins.marks_impact).toFixed(0)} marks)</span>` : '';
                        return `<div class="rounded-xl p-3 ring-1 ${cls} flex items-start gap-2.5">
                            <span class="material-symbols-rounded text-[16px] mt-0.5 shrink-0 ${txtCls}">${icon}</span>
                            <p class="text-[12px] font-medium leading-snug">${esc(ins?.text || '')}${impact}</p>
                        </div>`;
                    }).join('');
                } catch (_) {}
            }

            // --- NEXT BEST ACTION ENGINE ---
            function eccGetNextTopic() {
                if (!__payload) return null;
                const topics = flattenTopics(__payload);
                const available = topics
                    .filter(t => !t?.topic?.completed && String(t?.topic?.status || '') !== 'completed')
                    .sort((a, b) => Number(b?.topic?.priority_score || 0) - Number(a?.topic?.priority_score || 0));
                return available[0] || null;
            }

            function eccUpdateNextAction() {
                const next = eccGetNextTopic();
                __nextTopicCache = next;
                const topicLabel = $('eccNextTopic');
                const recLabel = $('eccRecommendation');
                if (!next) {
                    if (topicLabel) topicLabel.textContent = 'All topics completed!';
                    if (recLabel) recLabel.textContent = '"You have covered everything. Focus on revision now."';
                    return;
                }
                const name = next?.topic?.topic || 'Unknown Topic';
                const subject = next?.subject?.subject_title || '';
                const pri = Number(next?.topic?.priority_score || 0).toFixed(0);
                if (topicLabel) topicLabel.textContent = `→ ${name}`;
                if (recLabel) recLabel.textContent = `"Do ${name} next — Priority ${pri}, part of ${subject}."`;
            }

            $('eccNextActionBtn')?.addEventListener('click', () => {
                const next = __nextTopicCache || eccGetNextTopic();
                if (!next) { alert('All topics completed!'); return; }
                const name = next?.topic?.topic || '';
                const cType = next?.subject?.course_type || '';
                const page = notesPageByType(cType);
                const href = `${page}?topic=${encodeURIComponent(name)}`;
                // Track the interaction
                trackTopicOpen(next?.topic?.item_id, next?.topic?.topic_id);
                // Randomly trigger micro-diagnostic (20% chance)
                if (Math.random() < 0.2 && __eccActive) {
                    eccTriggerMicroDiag();
                }
                window.open(href, '_blank');
            });

            // --- MICRO-DIAGNOSTIC MODAL ---
            async function eccTriggerMicroDiag() {
                try {
                    const res = await fetchJson(`${V3}/diagnostic/micro`, { method: 'POST', headers: authHeaders() });
                    if (!res?.question) return;
                    __microDiagSessionId = res?.session_id;
                    const q = res.question;
                    const modal = $('microDiagModal');
                    if ($('microDiagTopic')) $('microDiagTopic').textContent = q?.topic_name || '';
                    if ($('microDiagQuestion')) $('microDiagQuestion').textContent = q?.question_text || '';
                    if ($('microDiagResult')) { $('microDiagResult').classList.add('hidden'); $('microDiagResult').innerHTML = ''; }

                    const optionsContainer = $('microDiagOptions');
                    if (optionsContainer) {
                        optionsContainer.innerHTML = (q?.options || []).map((opt, idx) => {
                            const letter = String.fromCharCode(65 + idx);
                            return `<button type="button" data-answer="${letter}" data-qid="${q?.question_id || ''}" class="w-full text-left px-4 py-3 rounded-xl ring-1 ring-black/10 dark:ring-white/15 hover:bg-brand-500/10 hover:ring-brand-500/30 transition text-sm font-medium">${esc(opt)}</button>`;
                        }).join('');

                        optionsContainer.querySelectorAll('button[data-answer]').forEach(btn => {
                            btn.addEventListener('click', async (e) => {
                                const answer = e.currentTarget.getAttribute('data-answer');
                                const qid = e.currentTarget.getAttribute('data-qid');
                                // Disable all buttons
                                optionsContainer.querySelectorAll('button').forEach(b => b.disabled = true);
                                e.currentTarget.classList.add('ring-brand-500', 'bg-brand-500/10');

                                try {
                                    const evalRes = await fetchJson(`${V3}/diagnostic/answer`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json', ...authHeaders() },
                                        body: JSON.stringify({ session_id: __microDiagSessionId, question_id: qid, answer }),
                                    });
                                    const ev = evalRes?.evaluation || {};
                                    const resultEl = $('microDiagResult');
                                    if (resultEl) {
                                        const isGood = Number(ev?.score || 0) >= 60;
                                        resultEl.className = `mt-4 p-3 rounded-xl ring-1 text-sm ${isGood ? 'ring-green-500/30 bg-green-500/5' : 'ring-red-500/30 bg-red-500/5'}`;
                                        resultEl.innerHTML = `<p class="font-bold ${isGood ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">${isGood ? '✓ Correct' : '✗ Needs Review'} — Score: ${Number(ev?.score || 0).toFixed(0)}/100</p><p class="mt-1 text-xs text-neutral-600 dark:text-white/60">${esc(ev?.explanation || '')}</p>`;
                                        resultEl.classList.remove('hidden');
                                    }
                                } catch (_) {}
                            });
                        });
                    }
                    if (modal) modal.classList.remove('hidden');
                } catch (_) {}
            }

            $('microDiagClose')?.addEventListener('click', () => {
                $('microDiagModal')?.classList.add('hidden');
            });
            $('microDiagModal')?.addEventListener('click', (e) => {
                if (e.target === $('microDiagModal')) $('microDiagModal')?.classList.add('hidden');
            });

            // --- INTERVENTION SYSTEM ---
            function eccShowIntervention(msg) {
                if (Date.now() < __interventionCooldown) return;
                __interventionCooldown = Date.now() + 180000; // 3 min cooldown
                const el = $('interventionAlert');
                if ($('interventionMsg')) $('interventionMsg').textContent = msg;
                if (el) {
                    el.classList.remove('hidden');
                    setTimeout(() => el.classList.add('hidden'), 12000);
                }
            }

            $('interventionDismiss')?.addEventListener('click', () => {
                $('interventionAlert')?.classList.add('hidden');
            });

            // --- REAL-TIME CONTROL LOOP (every 3 minutes) ---
            let __loopCount = 0;

            async function eccControlLoop() {
                if (!__eccActive || !__ctx?.student_id) return;
                __loopCount++;

                try {
                    // 1. Refresh outcomes every cycle
                    await eccFetchOutcomes();

                    // 2. Apply confidence decay
                    if (__loopCount % 3 === 0) { // every 9 min
                        try { await fetchJson(`${V3}/confidence-decay`, { method: 'POST', headers: authHeaders() }); } catch (_) {}
                    }

                    // 3. Check for replan triggers
                    if (__loopCount % 2 === 0) { // every 6 min
                        try {
                            const replanRes = await fetchJson(`${V3}/replan`, { method: 'POST', headers: authHeaders() });
                            if (replanRes?.topics_reranked > 0) {
                                eccShowIntervention(`GARLIC re-ranked ${replanRes.topics_reranked} topics based on your progress. Plan updated.`);
                                // Reload plan
                                try {
                                    const payload = await loadPersistedPlan(__ctx.student_id);
                                    renderPlan(payload);
                                } catch (_) {}
                            }
                        } catch (_) {}
                    }

                    // 4. Refresh daily target
                    await eccFetchDailyTarget();

                    // 5. Update next action
                    eccUpdateNextAction();

                    // 6. Intervention checks
                    if (__outcomeData) {
                        const risk = String(__outcomeData?.risk_level || 'low');
                        if (risk === 'critical') {
                            eccShowIntervention('⚠️ CRITICAL RISK: Your exam readiness is dangerously low. Complete at least 3 topics NOW to recover.');
                        } else if (risk === 'high') {
                            eccShowIntervention('You are falling behind. Focus on high-priority topics immediately.');
                        }
                    }

                    // 7. Re-fetch velocity + insights less frequently
                    if (__loopCount % 5 === 0) { // every ~15 min
                        await eccFetchVelocity();
                        await eccFetchInsights();
                    }

                } catch (_) {}
            }

            function eccStartControlLoop() {
                eccStopControlLoop();
                __controlLoopTimer = setInterval(eccControlLoop, 180000); // 3 min
            }

            function eccStopControlLoop() {
                if (__controlLoopTimer) { clearInterval(__controlLoopTimer); __controlLoopTimer = null; }
            }

            // --- Refresh all ECC panels ---
            async function eccRefreshAll() {
                await Promise.all([
                    eccFetchOutcomes(),
                    eccFetchDailyTarget(),
                    eccFetchVelocity(),
                    eccFetchInsights(),
                ]);
                eccUpdateNextAction();
            }
        });
