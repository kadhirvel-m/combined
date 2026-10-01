// Extracted from ui/teacher_class_students.html (inline <script> #4).
        const $ = (s, r = document) => r.querySelector(s);
        const esc = (s = '') => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const params = new URLSearchParams(location.search);
        const classId = params.get('class_id') || '';
        const courseId = params.get('course_id') || '';
        const subjectQuery = params.get('subject') || '';
        const sectionParam = params.get('section') || '';
        const semesterParam = params.get('semester') || '';
        const batchParam = params.get('batch_id') || '';

        function isUuidLike(v) {
            return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(v || '').trim());
        }

        function getToken() {
            const primary = ['px_token', 'teacherToken', 'userToken', 'sb-access-token', 'supabase.auth.token'];
            for (const k of primary) { try { const v = localStorage.getItem(k); if (v) return v; } catch { } }
            try {
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (/token/i.test(key || '')) {
                        const v = localStorage.getItem(key);
                        if (v && v.length > 10) return v;
                    }
                }
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

        let allStudents = [];
        let appliedFilters = {};

        function renderStatus(msg, isError = false) {
            const node = $('#status');
            if (node) {
                node.textContent = msg;
                node.className = 'text-sm ' + (isError ? 'text-red-600 dark:text-red-400' : 'text-neutral-600 dark:text-white/70');
            }
        }

        function renderClassInfo(cls = {}) {
            const title = cls.subject || subjectQuery || 'Class';
            $('#subjectTitle').textContent = `${title} — Students`;
            $('#subjectInitial').textContent = (title || 'C').charAt(0).toUpperCase();
            const meta = $('#subjectMeta');
            meta.innerHTML = '';
            if (cls.semester || semesterParam) meta.insertAdjacentHTML('beforeend', `<span class="px-2 py-1 rounded-full bg-brand-500/10 text-brand-700 dark:text-brandlt-200 text-[11px]">Sem ${esc(cls.semester || semesterParam)}</span>`);
            if (cls.section || sectionParam) meta.insertAdjacentHTML('beforeend', `<span class="px-2 py-1 rounded-full ring-1 ring-black/10 dark:ring-white/15 text-[11px]">Section ${esc(cls.section || sectionParam)}</span>`);
            if (appliedFilters.batch_label) meta.insertAdjacentHTML('beforeend', `<span class="px-2 py-1 rounded-full ring-1 ring-black/10 dark:ring-white/15 text-[11px]">Batch ${esc(appliedFilters.batch_label)}</span>`);
            else if (cls.batch_id || batchParam) meta.insertAdjacentHTML('beforeend', `<span class="px-2 py-1 rounded-full ring-1 ring-black/10 dark:ring-white/15 text-[11px]">Batch ${esc(cls.batch_id || batchParam)}</span>`);
        }

        function setupActions() {
            const wrap = $('#actionRow');
            if (!wrap) return;
            const items = [];
            if (courseId) {
                const qs = new URLSearchParams(location.search);
                items.push(`<a href="teacher_class_syllabus.html?${qs.toString()}" class="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-full ring-1 ring-black/10 dark:ring-white/15 bg-white/70 dark:bg-white/10 hover:bg-white/90 dark:hover:bg-white/20"><span class="material-symbols-rounded text-base">menu_book</span>Syllabus</a>`);
            }
            if (!items.length) {
                wrap.classList.add('hidden');
                wrap.innerHTML = '';
                return;
            }
            wrap.classList.remove('hidden');
            wrap.innerHTML = items.join('');
        }

        function updateSummary(total = 0, filters = {}) {
            const countNode = $('#studentCount');
            if (countNode) countNode.textContent = total === 1 ? '1 student' : `${total} students`;
            const wrap = $('#filtersWrap');
            wrap.innerHTML = '';
            const chips = [];
            if (filters.batch_label) chips.push(`Batch ${esc(filters.batch_label)}`);
            if (filters.section) chips.push(`Section ${esc(filters.section)}`);
            if (filters.current_semester) chips.push(`Sem ${esc(filters.current_semester)}`);
            if (chips.length) {
                chips.forEach(txt => wrap.insertAdjacentHTML('beforeend', `<span class="px-2 py-0.5 rounded-full ring-1 ring-black/10 dark:ring-white/15">${txt}</span>`));
            } else {
                wrap.insertAdjacentHTML('beforeend', `<span class="text-[11px] text-neutral-500 dark:text-white/50">No filters found</span>`);
            }
            if (filters.missing_filters) {
                renderStatus('Add batch / section information to this class to generate the roster.', true);
                $('#emptyState').textContent = 'Missing class filters. Edit the class to include batch or section to see students.';
                $('#emptyState').classList.remove('hidden');
            }
        }

        function renderStudents(list) {
            const wrap = $('#studentsWrap');
            const empty = $('#emptyState');
            wrap.innerHTML = '';
            if (!list.length) {
                empty.classList.remove('hidden');
                return;
            }
            empty.classList.add('hidden');
            list.forEach(s => {
                const avatar = s.avatar_url ? `<img src="${s.avatar_url}" alt="" class="w-full h-full object-cover"/>` : `<div class="w-full h-full grid place-items-center bg-gradient-to-br from-brand-500/25 to-brand-700/20 text-lg font-bold">${esc((s.name || 'S').charAt(0).toUpperCase())}</div>`;
                const reg = s.regno ? `<span class="text-[11px] px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-neutral-700 dark:text-white">${esc(s.regno)}</span>` : '';
                const contact = [];
                if (s.email) contact.push(`<a href="mailto:${encodeURIComponent(s.email)}" class="hover:underline">${esc(s.email)}</a>`);
                if (s.phone) contact.push(`<a href="tel:${encodeURIComponent(s.phone)}" class="hover:underline">${esc(s.phone)}</a>`);
                const totalTopics = Number(s.total_topics || 0);
                const completedTopics = Number(s.completed_topics || 0);
                const rawPct = typeof s.progress_pct === 'number'
                    ? s.progress_pct
                    : (totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0);
                const pct = Math.max(0, Math.min(100, Math.round((rawPct + Number.EPSILON) * 10) / 10));
                const ratioLabel = totalTopics ? `${completedTopics}/${totalTopics}` : 'N/A';
                const pctLabel = totalTopics ? `${pct}%` : '—';
                const baseTrack = 'rgba(148,163,184,0.25)';
                const fillColor = totalTopics ? 'rgba(158,75,138,0.95)' : 'rgba(148,163,184,0.35)';
                const circleStyle = `background: conic-gradient(${fillColor} ${pct}%, ${baseTrack} ${pct}%);`;
                const progressCircle = `
                    <div class="flex flex-col items-center gap-1 ml-4 min-w-[4.5rem] text-[10px] text-neutral-500 dark:text-white/60">
                        <div class="relative w-14 h-14 rounded-full shadow-inner" style="${circleStyle}">
                            <div class="absolute inset-[3px] rounded-full bg-white/90 dark:bg-brand-950 flex items-center justify-center text-[11px] font-semibold text-brand-700 dark:text-brandlt-100">
                                ${pctLabel}
                            </div>
                        </div>
        	            <span class="text-[11px] font-semibold text-neutral-800 dark:text-white">${ratioLabel}</span>
                        ${totalTopics ? '<span class="text-[9px] uppercase tracking-wide text-neutral-400 dark:text-white/40">topics</span>' : '<span class="text-[9px] uppercase tracking-wide text-neutral-400 dark:text-white/40">link syllabus</span>'}
                    </div>`;
                const card = document.createElement('div');
                card.className = 'student-card rounded-2xl ring-1 ring-black/5 dark:ring-white/10 bg-white/70 dark:bg-white/5 p-4 flex gap-4 items-center justify-self-center';
                card.innerHTML = `
                    <div class="w-14 h-14 rounded-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/15 flex-shrink-0">${avatar}</div>
                    <div class="flex-1 min-w-0 space-y-1">
                        ${reg ? `<div class="flex justify-between items-center">${reg}</div>` : ''}
                        <div class="flex items-center justify-between gap-2">
                            <h3 class="text-base font-semibold leading-tight truncate">${esc(s.name || 'Student')}</h3>
                        </div>
                        <div class="text-[12px] text-neutral-500 dark:text-white/60 space-x-2 break-all">${contact.join('<span class="opacity-40">•</span>')}</div>
                    </div>
                    ${progressCircle}`;
                wrap.appendChild(card);
            });
        }

        async function loadRoster() {
            if (!classId) { renderStatus('Missing class identifier', true); return; }
            const token = getToken();
            if (!token) { renderStatus('Sign in as a teacher to view this class.', true); return; }
            try {
                const baseRaw = window.__API_BASE || window.API_BASE || 'http://0.0.0.0:10000';
                const base = String(baseRaw || '').replace(/\/$/, '');
                const headers = { Authorization: 'Bearer ' + token };
                let endpoint = `${base}/api/teacher/classes/${encodeURIComponent(classId)}/students`;
                if (!isUuidLike(classId)) {
                    const q = new URLSearchParams();
                    if (batchParam) q.set('batch_id', batchParam);
                    if (sectionParam) q.set('section', sectionParam);
                    if (semesterParam) q.set('semester', semesterParam);
                    if (courseId) q.set('subject_id', courseId);
                    if (subjectQuery) q.set('subject', subjectQuery);
                    endpoint = `${base}/api/teacher/classes/students/by-context?${q.toString()}`;
                }
                const res = await fetch(endpoint, { headers, cache: 'no-store' });
                if (res.status === 401) { throw new Error('Session expired – please sign in again.'); }
                if (!res.ok) { throw new Error(`Failed to load roster (${res.status})`); }
                const data = await res.json();
                appliedFilters = data.applied_filters || {};
                renderClassInfo(data.class_info || {});
                allStudents = Array.isArray(data.students) ? data.students : [];
                updateSummary(data.total ?? allStudents.length, appliedFilters);
                if (!appliedFilters.missing_filters) {
                    renderStatus(allStudents.length ? '' : 'No students found for the selected filters.');
                }
                renderStudents(allStudents);
            } catch (err) {
                console.error('[students] load failed', err);
                renderStatus(err.message || 'Unable to load students', true);
            }
        }

        $('#studentSearch').addEventListener('input', (e) => {
            const term = e.target.value.trim().toLowerCase();
            if (!term) { renderStudents(allStudents); return; }
            const filtered = allStudents.filter((s) => {
                const bag = [s.name, s.regno, s.email, s.section].map(v => String(v || '').toLowerCase());
                return bag.some(v => v.includes(term));
            });
            renderStudents(filtered);
        });

        document.addEventListener('DOMContentLoaded', () => {
            setupActions();
            loadRoster();
        });
