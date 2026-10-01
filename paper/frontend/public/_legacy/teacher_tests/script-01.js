// Extracted from ui/teacher_tests.html (inline <script> #1).
        const $ = (s, r = document) => r.querySelector(s);
        const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
        const esc = (s = '') => String(s).replace(/[&<>\"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
        let API_BASE = '';

        async function resolveApi() {
            if (API_BASE) return API_BASE;
            const b = (window.__API_BASE || window.API_BASE || '').replace(/\/$/, '');
            if (b) { API_BASE = b; return b; }
            await new Promise(r => setTimeout(r, 60));
            return resolveApi();
        }

        function getToken() {
            const keys = ['teacherToken', 'px_token', 'userToken', 'sb-access-token', 'supabase.auth.token'];
            for (const k of keys) {
                try {
                    const v = localStorage.getItem(k);
                    if (v) return v;
                } catch (_) { }
            }
            return '';
        }

        function showToast(message, icon = 'check_circle', duration = 2800) {
            const toast = $('#toast');
            $('#toastText').textContent = message;
            $('#toastIcon').textContent = icon;
            toast.classList.remove('hidden');
            setTimeout(() => toast.classList.add('hidden'), duration);
        }

        function showAlert(message, isError = true) {
            const alert = $('#alert');
            if (!alert) return;
            alert.className = isError
                ? 'rounded-xl px-4 py-3 text-sm text-red-700 dark:text-red-200 bg-red-50/90 dark:bg-red-900/40 ring-1 ring-red-200 dark:ring-red-700'
                : 'rounded-xl px-4 py-3 text-sm text-emerald-700 dark:text-emerald-200 bg-emerald-50/90 dark:bg-emerald-900/30 ring-1 ring-emerald-200 dark:ring-emerald-700';
            alert.textContent = message;
            alert.classList.remove('hidden');
            setTimeout(() => alert.classList.add('hidden'), 3200);
        }

        function formatDate(iso) {
            if (!iso) return 'Date not available';
            const d = new Date(iso);
            if (Number.isNaN(d.getTime())) return 'Date not available';
            return d.toLocaleString([], {
                year: 'numeric',
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        function subjectNameOnly(raw) {
            const s = String(raw || '').trim();
            if (!s) return 'Subject';
            if (s.includes('—')) {
                const parts = s.split('—').map(p => p.trim()).filter(Boolean);
                if (parts.length >= 2 && /^[A-Z0-9]{4,}$/.test(parts[0])) return parts.slice(1).join(' — ');
            }
            return s.replace(/^[A-Z0-9]{4,}\s*[-:|]\s*/i, '').trim() || s;
        }

        function yearLabelForSem(semNum) {
            const s = parseInt(semNum, 10);
            if (!s || s < 1) return '';
            const year = Math.floor((s - 1) / 2) + 1;
            const ord = { 1: 'First', 2: 'Second', 3: 'Third', 4: 'Fourth', 5: 'Fifth', 6: 'Sixth' };
            return ord[year] ? `${ord[year]} Year` : '';
        }

        function studentKey(s) {
            if (!s || typeof s !== 'object') return '';
            return String(
                s.auth_user_id || s.student_user_id || s.user_id || s.id || s.email || s.name || ''
            ).trim().toLowerCase();
        }

        let testsData = [];
        let classMapGlobal = new Map();
        const progressCache = new Map();
        let activeLoadRun = 0;

        function classLabelParts(cls, meta = {}) {
            if (!cls) {
                return { line1: 'Class not linked', line2: '' };
            }
            const subject = subjectNameOnly(cls.subject || 'Class');
            const year = yearLabelForSem(cls.semester);
            const batch = meta.batchLabel ? `Batch ${meta.batchLabel}` : '';
            const sec = cls.section ? `Sec ${cls.section}` : '';
            return {
                line1: subject,
                line2: [batch, year, sec].filter(Boolean).join(' • '),
            };
        }

        async function fetchJSON(url, opts = {}, retries = 2) {
            try {
                const res = await fetch(url, opts);
                const raw = await res.text();
                let data = {};
                try { data = raw ? JSON.parse(raw) : {}; } catch (_) { data = { detail: raw }; }
                if (!res.ok) {
                    const err = new Error(data.detail || 'Request failed');
                    err.status = res.status;
                    throw err;
                }
                return data;
            } catch (err) {
                const status = err && err.status;
                const transient = (err instanceof TypeError) || status === 502 || status === 503 || status === 504;
                if (retries > 0 && transient) {
                    await new Promise(r => setTimeout(r, 300));
                    return fetchJSON(url, opts, retries - 1);
                }
                throw err;
            }
        }

        function computeProgressFromResult(result) {
            const attempts = Array.isArray(result?.attempts) ? result.attempts : [];
            const classStudents = Array.isArray(result?.class_students) ? result.class_students : [];
            const notAttempted = Array.isArray(result?.students_not_attempted) ? result.students_not_attempted : [];

            const submittedIds = new Set();
            const inProgressIds = new Set();
            attempts.forEach((a) => {
                const key = studentKey(a);
                if (!key) return;
                if (a && a.submitted_at) submittedIds.add(key);
                else inProgressIds.add(key);
            });
            submittedIds.forEach((k) => inProgressIds.delete(k));

            const completedFromAttempts = submittedIds.size;
            const inProgressFromAttempts = inProgressIds.size;
            const completedFromRoster = classStudents.filter((s) => String(s?.status || '').toLowerCase() === 'completed').length;
            const inProgressFromRoster = classStudents.filter((s) => String(s?.status || '').toLowerCase() === 'in_progress').length;
            const pendingFromRoster = classStudents.filter((s) => String(s?.status || '').toLowerCase() === 'pending').length;

            const completed = Math.max(Number(result?.completed_count || 0), completedFromAttempts, completedFromRoster);
            const total = Math.max(
                classStudents.length,
                completed + inProgressFromAttempts + notAttempted.length,
                completedFromRoster + inProgressFromRoster + pendingFromRoster,
                completed
            );
            return { completed, total };
        }

        function renderTestsList() {
            const wrap = $('#tests');
            if (!wrap) return;

            wrap.innerHTML = testsData.map(t => {
                const prog = progressCache.get(String(t.id)) || { completed: 0, total: 0, loading: true };
                const hasProgress = !prog.loading;
                const pct = hasProgress && prog.total > 0 ? Math.round((prog.completed / prog.total) * 100) : 0;
                const cls = classMapGlobal.get(String(t.class_id || ''));
                const classLines = classLabelParts(cls, {});
                const statusClass = t.accepting_submissions === false
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/35 dark:text-emerald-200';
                const statusText = t.accepting_submissions === false ? 'Closed' : 'Open';
                const dateLabel = formatDate(t.created_at || t.updated_at);

                return `<article class="rounded-2xl p-4 sm:p-5 bg-white/65 dark:bg-white/5 ring-1 ring-black/10 dark:ring-white/15" data-test-id="${esc(t.id)}">
                        <div class="flex gap-4 items-start">
                            <div class="completion-ring" style="--pct:${Math.max(0, Math.min(100, pct))}">
                                <span class="completion-value">${hasProgress ? `${pct}%` : '…'}</span>
                            </div>
                            <div class="min-w-0 flex-1 space-y-2">
                                <div class="flex items-start justify-between gap-3">
                                    <h3 class="text-base sm:text-lg font-bold truncate">${esc(t.title || 'Untitled Test')}</h3>
                                    <span class="px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusClass}">${statusText}</span>
                                </div>
                                <p class="text-sm opacity-75 line-clamp-2">${esc(t.description || 'No description provided.')}</p>
                                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs sm:text-sm">
                                    <div class="rounded-lg bg-black/[0.03] dark:bg-white/[0.05] px-3 py-2">
                                        <div class="opacity-60">Completion</div>
                                        <div class="font-semibold" data-role="completion-text">${hasProgress ? `${prog.completed} / ${prog.total || 0} completed` : 'Calculating…'}</div>
                                    </div>
                                    <div class="rounded-lg bg-black/[0.03] dark:bg-white/[0.05] px-3 py-2">
                                        <div class="opacity-60">Test date</div>
                                        <div class="font-semibold">${esc(dateLabel)}</div>
                                    </div>
                                    <div class="rounded-lg bg-black/[0.03] dark:bg-white/[0.05] px-3 py-2">
                                        <div class="opacity-60">Class & section</div>
                                        <div class="font-semibold truncate">${esc(classLines.line1)}</div>
                                        <div class="text-[11px] opacity-70 truncate">${esc(classLines.line2 || '-')}</div>
                                    </div>
                                </div>
                                <div class="flex flex-wrap gap-2 pt-1">
                                    <button data-action="results" data-id="${esc(t.id)}" class="btn-secondary px-3 py-1.5 rounded-lg text-xs sm:text-sm">View Results</button>
                                    <button data-action="edit" data-id="${esc(t.id)}" class="btn-secondary px-3 py-1.5 rounded-lg text-xs sm:text-sm">Edit</button>
                                    <button data-action="toggle" data-id="${esc(t.id)}" data-on="${t.accepting_submissions !== false}" class="btn-secondary px-3 py-1.5 rounded-lg text-xs sm:text-sm">${t.accepting_submissions === false ? 'Turn On' : 'Turn Off'}</button>
                                    <button data-action="delete" data-id="${esc(t.id)}" class="px-3 py-1.5 rounded-lg text-xs sm:text-sm bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200">Delete</button>
                                </div>
                            </div>
                        </div>
                    </article>`;
            }).join('');
        }

        function patchProgressCard(testId, prog) {
            const safeId = String(testId).replace(/"/g, '\\"');
            const card = document.querySelector(`[data-test-id="${safeId}"]`);
            if (!card) return;
            const pct = prog.total > 0 ? Math.round((prog.completed / prog.total) * 100) : 0;
            const ring = card.querySelector('.completion-ring');
            const value = card.querySelector('.completion-value');
            const completionText = card.querySelector('[data-role="completion-text"]');
            if (ring) ring.style.setProperty('--pct', String(Math.max(0, Math.min(100, pct))));
            if (value) value.textContent = `${pct}%`;
            if (completionText) completionText.textContent = `${prog.completed} / ${prog.total || 0} completed`;
        }

        async function hydrateProgressForTests(base, headers, tests, runId) {
            const queue = [...tests];
            const workers = Math.min(4, Math.max(1, queue.length));

            async function worker() {
                while (queue.length && runId === activeLoadRun) {
                    const t = queue.shift();
                    if (!t || !t.id) continue;
                    const testId = String(t.id);
                    if (progressCache.has(testId) && !progressCache.get(testId)?.loading) {
                        patchProgressCard(testId, progressCache.get(testId));
                        continue;
                    }
                    try {
                        const result = await fetchJSON(`${base}/api/teacher/tests/${encodeURIComponent(testId)}/results`, { headers }, 1);
                        const prog = computeProgressFromResult(result);
                        progressCache.set(testId, prog);
                        patchProgressCard(testId, prog);
                    } catch (_) {
                        const fallback = { completed: 0, total: 0 };
                        progressCache.set(testId, fallback);
                        patchProgressCard(testId, fallback);
                    }
                }
            }

            await Promise.all(Array.from({ length: workers }, () => worker()));
        }

        async function loadTests() {
            const token = getToken();
            const wrap = $('#tests');
            if (!token) {
                wrap.innerHTML = '<div class="text-sm opacity-70">Sign in as teacher to view tests.</div>';
                return;
            }
            wrap.innerHTML = '<div class="text-sm opacity-70">Loading tests...</div>';

            try {
                const runId = ++activeLoadRun;
                const base = await resolveApi();
                const headers = { Authorization: 'Bearer ' + token };

                const [tests, classes] = await Promise.all([
                    fetchJSON(`${base}/api/teacher/tests`, { headers }),
                    fetchJSON(`${base}/api/teacher/classes/mine`, { headers }).catch(() => [])
                ]);

                if (runId !== activeLoadRun) return;

                if (!Array.isArray(tests) || !tests.length) {
                    wrap.innerHTML = '<div class="text-sm opacity-70">No tests created yet.</div>';
                    return;
                }

                testsData = tests;
                classMapGlobal = new Map((classes || []).map(c => [String(c.id || ''), c]));
                testsData.forEach(t => {
                    const tid = String(t.id || '');
                    if (tid && !progressCache.has(tid)) progressCache.set(tid, { completed: 0, total: 0, loading: true });
                });

                renderTestsList();

                const kickHydration = () => hydrateProgressForTests(base, headers, testsData, runId).catch(() => { });
                if (typeof window.requestIdleCallback === 'function') {
                    window.requestIdleCallback(kickHydration, { timeout: 1200 });
                } else {
                    setTimeout(kickHydration, 60);
                }
            } catch (err) {
                console.error(err);
                wrap.innerHTML = '<div class="text-sm text-red-600 dark:text-red-300">Unable to load tests right now.</div>';
            }
        }

        document.addEventListener('click', (e) => {
            const btn = e.target && e.target.closest ? e.target.closest('button[data-action]') : null;
            if (!btn) return;
            if (!btn.closest('#tests')) return;
            handleAction(btn);
        });

        async function handleAction(btn) {
            const action = btn.dataset.action;
            const id = btn.dataset.id;
            const token = getToken();
            if (!token) return showAlert('Sign in as teacher.');

            try {
                const base = await resolveApi();

                if (action === 'results') {
                    location.href = `./teacher_test_results.html?test_id=${encodeURIComponent(id)}`;
                    return;
                }
                if (action === 'edit') {
                    location.href = `./teacher_test_edit.html?test_id=${encodeURIComponent(id)}`;
                    return;
                }
                if (action === 'delete') {
                    if (!confirm('Delete this test?')) return;
                    const res = await fetch(`${base}/api/teacher/tests/${encodeURIComponent(id)}`, {
                        method: 'DELETE',
                        headers: { Authorization: 'Bearer ' + token }
                    });
                    if (!res.ok) throw new Error('Delete failed');
                    showToast('Test deleted', 'delete');
                    await loadTests();
                    return;
                }
                if (action === 'toggle') {
                    const on = btn.dataset.on === 'true';
                    const res = await fetch(`${base}/api/teacher/tests/${encodeURIComponent(id)}/accepting?accepting=${on ? 'false' : 'true'}`, {
                        method: 'PATCH',
                        headers: { Authorization: 'Bearer ' + token }
                    });
                    if (!res.ok) throw new Error('Toggle failed');
                    showToast(on ? 'Submissions turned off' : 'Submissions turned on', 'sync');
                    await loadTests();
                    return;
                }
            } catch (err) {
                console.error(err);
                showAlert(err.message || 'Action failed');
            }
        }

        (function () {
            const root = document.documentElement;
            const stored = localStorage.getItem('px_theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const initial = stored || (prefersDark ? 'dark' : 'light');

            const toggles = () => Array.from(document.querySelectorAll('[data-theme-toggle]'));
            const setIcon = (mode) => toggles().forEach(b => {
                const i = b.querySelector('.material-symbols-rounded');
                if (i) i.textContent = mode === 'dark' ? 'light_mode' : 'dark_mode';
            });
            const setTheme = (mode) => {
                mode === 'dark' ? root.classList.add('dark') : root.classList.remove('dark');
                localStorage.setItem('px_theme', mode);
                setIcon(mode);
            };

            setTheme(initial);
            document.addEventListener('click', e => {
                const t = e.target.closest('[data-theme-toggle]');
                if (!t) return;
                setTheme(root.classList.contains('dark') ? 'light' : 'dark');
            });
        })();

        (function () {
            const videos = document.querySelectorAll('.carousel-video');
            const dots = document.querySelectorAll('.carousel-dot');
            const prevBtn = $('#prevVideo');
            const nextBtn = $('#nextVideo');
            const titleEl = $('#carouselTitle');
            const descEl = $('#carouselDesc');
            if (!videos.length) return;

            const captions = [
                { title: 'Track completion in real-time', desc: 'See completed vs total learners for every test at a glance.' },
                { title: 'Organize by class and section', desc: 'Keep your conducted tests structured and easy to review.' },
                { title: 'Act faster with clear controls', desc: 'Open results, edit, close, or delete with one click.' }
            ];

            let currentIndex = 0;
            let autoPlayInterval;

            function showSlide(index) {
                videos.forEach((video, i) => {
                    if (i === index) {
                        video.style.opacity = '1';
                        video.play().catch(() => { });
                    } else {
                        video.style.opacity = '0';
                        video.pause();
                    }
                });

                dots.forEach((dot, i) => {
                    if (i === index) {
                        dot.classList.remove('bg-[#9E4B8A]/30');
                        dot.classList.add('bg-[#9E4B8A]', 'w-6');
                    } else {
                        dot.classList.add('bg-[#9E4B8A]/30');
                        dot.classList.remove('bg-[#9E4B8A]', 'w-6');
                    }
                });

                if (captions[index]) {
                    titleEl.textContent = captions[index].title;
                    descEl.textContent = captions[index].desc;
                }
                currentIndex = index;
            }

            function nextSlide() { showSlide((currentIndex + 1) % videos.length); }
            function prevSlide() { showSlide((currentIndex - 1 + videos.length) % videos.length); }
            function startAutoPlay() { stopAutoPlay(); autoPlayInterval = setInterval(nextSlide, 5000); }
            function stopAutoPlay() { if (autoPlayInterval) clearInterval(autoPlayInterval); }

            if (prevBtn) prevBtn.onclick = () => { prevSlide(); startAutoPlay(); };
            if (nextBtn) nextBtn.onclick = () => { nextSlide(); startAutoPlay(); };
            dots.forEach((dot, i) => { dot.onclick = () => { showSlide(i); startAutoPlay(); }; });

            showSlide(0);
            startAutoPlay();

            const carousel = document.querySelector('.video-carousel-container');
            if (carousel) {
                carousel.addEventListener('mouseenter', stopAutoPlay);
                carousel.addEventListener('mouseleave', startAutoPlay);
            }
        })();

        (function () {
            const toggle = $('#mobileNavToggle');
            const panel = $('#mobileNavPanel');
            const backdrop = $('#mobileNavBackdrop');
            if (!toggle || !panel || !backdrop) return;
            const icon = toggle.querySelector('[data-icon]');

            const open = () => {
                panel.classList.remove('hidden');
                backdrop.classList.remove('hidden');
                panel.setAttribute('data-open', 'true');
                panel.classList.add('open');
                panel.setAttribute('aria-hidden', 'false');
                backdrop.setAttribute('data-open', 'true');
                backdrop.classList.add('open');
                backdrop.setAttribute('aria-hidden', 'false');
                toggle.setAttribute('aria-expanded', 'true');
                if (icon) icon.textContent = 'close';
                document.body.classList.add('overflow-hidden');
            };

            const close = () => {
                panel.removeAttribute('data-open');
                panel.classList.remove('open');
                panel.setAttribute('aria-hidden', 'true');
                backdrop.removeAttribute('data-open');
                backdrop.classList.remove('open');
                backdrop.setAttribute('aria-hidden', 'true');
                toggle.setAttribute('aria-expanded', 'false');
                if (icon) icon.textContent = 'menu';
                document.body.classList.remove('overflow-hidden');
                panel.classList.add('hidden');
                backdrop.classList.add('hidden');
            };

            toggle.addEventListener('click', () => toggle.getAttribute('aria-expanded') === 'true' ? close() : open());
            backdrop.addEventListener('click', close);
            window.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
            window.matchMedia('(min-width: 768px)').addEventListener('change', e => { if (e.matches) close(); });
            panel.addEventListener('click', evt => { if (evt.target.closest('[data-close-mobile-nav]')) close(); });
            close();
        })();

        document.addEventListener('DOMContentLoaded', loadTests);
