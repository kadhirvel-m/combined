// Extracted from ui/test_take.html (inline <script> #2).
        const $ = (s, r = document) => r.querySelector(s);
        const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
        const params = new URLSearchParams(location.search);
        const themeBtn = $('#themeToggle');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                const root = document.documentElement;
                const dark = root.classList.toggle('dark');
                localStorage.setItem('px_theme', dark ? 'dark' : 'light');
                const ic = themeBtn.querySelector('.material-symbols-rounded');
                if (ic) ic.textContent = dark ? 'light_mode' : 'dark_mode';
            });
        }

        let API_BASE = '';
        async function resolveApi() {
            if (API_BASE) return API_BASE;
            const b = (window.__API_BASE || window.API_BASE || '').replace(/\/$/, '');
            if (b) { API_BASE = b; return b; }
            await new Promise(r => setTimeout(r, 60));
            return resolveApi();
        }
        function extractToken(raw) {
            if (!raw) return '';
            try {
                const obj = JSON.parse(raw);
                if (obj && typeof obj === 'object') {
                    if (obj.access_token) return obj.access_token;
                    if (obj.currentSession && obj.currentSession.access_token) return obj.currentSession.access_token;
                    if (obj.data && obj.data.session && obj.data.session.access_token) return obj.data.session.access_token;
                }
            } catch (_) { /* raw string */ }
            const t = String(raw || '').trim();
            if (!t) return '';
            if (t === '__COOKIE_AUTH__' || t === '__cookie__' || t === 'cookie' || t === 'null' || t === 'undefined') return '';
            return t;
        }

        function getToken() {
            const primaryKeys = ['px_token', 'teacherToken', 'userToken', 'sb-access-token', 'supabase.auth.token'];
            for (const k of primaryKeys) {
                try {
                    const v = localStorage.getItem(k);
                    if (v) return extractToken(v);
                } catch { }
            }
            try {
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (!key) continue;
                    if (/auth-token/i.test(key) || /sb-.*access-token/i.test(key)) {
                        const val = localStorage.getItem(key);
                        const tok = extractToken(val);
                        if (tok) return tok;
                    }
                }
            } catch { }
            // Fallback: read supabase.auth.token JSON session structure
            try {
                const raw = localStorage.getItem('supabase.auth.token');
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (parsed && parsed.currentSession && parsed.currentSession.access_token) {
                        return parsed.currentSession.access_token;
                    }
                    if (parsed && parsed.access_token) {
                        return parsed.access_token;
                    }
                }
            } catch { }
            return '';
        }

        function hasSessionSignal() {
            try {
                if (String(localStorage.getItem('paperx_session_state') || '').trim() === '1') return true;
            } catch { }
            try {
                const fb1 = String(sessionStorage.getItem('paperx_bearer_fallback') || '').trim();
                if (fb1) return true;
            } catch { }
            try {
                const fb2 = String(localStorage.getItem('paperx_bearer_fallback') || '').trim();
                if (fb2) return true;
            } catch { }
            try {
                if ((document.cookie || '').indexOf('paperx_auth=') !== -1) return true;
            } catch { }
            return false;
        }

        function getAuthHeaders() {
            const token = getToken();
            if (token) return { Authorization: 'Bearer ' + token };
            return {};
        }

        function isAuthDetail(detail) {
            const s = String(detail || '').toLowerCase();
            if (!s) return false;
            return (
                s.includes('unauthorized') ||
                s.includes('invalid auth') ||
                s.includes('invalid token') ||
                s.includes('auth token') ||
                s.includes('sign in') ||
                s.includes('login required') ||
                s.includes('not authenticated') ||
                s.includes('authenticated user required')
            );
        }

        function redirectToLogin() {
            const next = `${location.pathname}${location.search || ''}${location.hash || ''}`;
            location.href = `./login.html?next=${encodeURIComponent(next)}`;
        }

        const state = {
            questions: [],
            testId: '',
            startedAtMs: null,
            duration: null,
            timer: null,
            submitting: false,
        };

        function renderEmpty(msg) {
            $('#testTitle').textContent = 'Test unavailable';
            $('#testMeta').textContent = '';
            $('#testDesc').textContent = msg || 'Missing or invalid test link.';
            $('#notice').classList.remove('hidden');
            $('#notice').textContent = 'Sign in and ask your teacher for help.';
            $('#testSection').classList.add('hidden');
            setNavTimer(false);
        }

        function fmtMMSS(totalSeconds) {
            const s = Math.max(0, parseInt(totalSeconds || 0, 10));
            const mins = Math.floor(s / 60);
            const secs = s % 60;
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        }

        function setNavTimer(visible, label) {
            const chip = $('#navTimer');
            const txt = $('#navTimerText');
            if (!chip || !txt) return;
            chip.classList.toggle('hidden', !visible);
            chip.classList.toggle('inline-flex', !!visible);
            if (label != null) txt.textContent = String(label);
        }

        function renderCountdown(seconds) {
            const meta = $('#testMeta');
            if (!meta) return;
            meta.dataset.baseText = meta.dataset.baseText || meta.textContent || '';
            const label = fmtMMSS(seconds);
            meta.textContent = `${meta.dataset.baseText} • Timer ${label}`.trim();
            setNavTimer(true, label);
        }

        function startTimer(durationSec, startedAtIso) {
            if (!durationSec) return;
            const parsedStart = startedAtIso ? Date.parse(String(startedAtIso)) : NaN;
            state.startedAtMs = Number.isFinite(parsedStart) ? parsedStart : Date.now();
            state.duration = durationSec;
            const initialElapsed = Math.floor((Date.now() - state.startedAtMs) / 1000);
            const initialRemaining = Math.max(durationSec - Math.max(initialElapsed, 0), 0);
            renderCountdown(initialRemaining);
            state.timer = setInterval(() => {
                const elapsed = Math.floor((Date.now() - state.startedAtMs) / 1000);
                const remaining = Math.max(durationSec - elapsed, 0);
                renderCountdown(remaining);
                if (remaining <= 0) {
                    clearInterval(state.timer);
                    state.timer = null;
                    setNavTimer(true, '0:00');
                    submitAnswers({ autoSubmit: true }).catch(() => { });
                }
            }, 1000);
        }

        function lockTestUI() {
            $('#submitBtn').disabled = true;
            $$('input', $('#testForm')).forEach(i => i.disabled = true);
        }

        function goToResultPage() {
            if (!state.testId) return;
            location.href = `./test_result.html?test_id=${encodeURIComponent(state.testId)}`;
        }

        function showAlreadyTaken(attempt, maxScore) {
            const score = Number.isFinite(Number(attempt?.score)) ? Number(attempt.score) : 0;
            $('#testSection').classList.add('hidden');
            $('#alreadyTakenSection').classList.remove('hidden');
            $('#alreadyTakenText').textContent = 'You have already submitted this test. New attempts are blocked.';
            $('#alreadyTakenScore').textContent = `Your marks: ${score}/${maxScore}`;
            const btn = $('#viewResultBtn');
            if (btn) btn.href = `./test_result.html?test_id=${encodeURIComponent(state.testId)}`;
            setNavTimer(false);
        }

        function renderTest(payload) {
            const qs = Array.isArray(payload.questions) ? payload.questions : [];
            if (!qs.length) { renderEmpty('No questions in this test.'); return; }
            $('#testTitle').textContent = payload.title || 'Untitled test';
            const parts = [];
            if (payload.description) parts.push(payload.description);
            if (payload.max_score) parts.push(`Max score ${payload.max_score}`);
            $('#testMeta').textContent = parts.join(' • ');
            $('#testMeta').dataset.baseText = $('#testMeta').textContent;
            $('#testDesc').textContent = '';

            const form = $('#testForm');
            form.innerHTML = qs.map((q, idx) => {
                const opts = (q.options || []).map((opt, i) => {
                    const id = `q${idx}-o${i}`;
                    return `<label for="${id}" class="flex items-center gap-2 px-3 py-2 rounded-lg ring-1 ring-black/5 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/10">` +
                        `<input type="radio" name="q${idx}" id="${id}" value="${i}" class="size-4" />` +
                        `<span class="flex-1 text-sm">${opt}</span>` +
                        `</label>`;
                }).join('');
                return `<div class="space-y-2"><div class="font-semibold">Q${idx + 1}. ${q.prompt}</div><div class="space-y-1">${opts}</div></div>`;
            }).join('<hr class="my-4 border-black/5 dark:border-white/10">');

            $('#submitBtn').onclick = async (ev) => {
                ev.preventDefault();
                await submitAnswers();
            };

            $('#resetBtn').onclick = () => {
                $$('input[type="radio"]', form).forEach(r => r.checked = false);
                $('#result').textContent = '';
            };
        }

        async function fetchTest() {
            const testId = params.get('test_id') || params.get('id');
            state.testId = testId;
            if (!testId) { renderEmpty('No test specified.'); return; }
            const token = getToken();
            if (!token && !hasSessionSignal()) { redirectToLogin(); return; }
            try {
                const base = await resolveApi();
                const res = await fetch(`${base}/api/tests/${testId}`, { headers: getAuthHeaders() });
                if (res.status === 401) { redirectToLogin(); return; }
                if (res.status === 403) {
                    const err = await res.json().catch(() => ({}));
                    if (isAuthDetail(err?.detail)) { redirectToLogin(); return; }
                    renderEmpty((err && err.detail) ? err.detail : 'This test is restricted to a specific class.');
                    $('#notice').classList.remove('hidden');
                    $('#notice').textContent = 'Ask your teacher to assign you to that class, or request an open-to-all test link.';
                    return;
                }
                if (!res.ok) {
                    // Retry once after a short delay for transient backend errors
                    await new Promise(r => setTimeout(r, 150));
                    const res2 = await fetch(`${base}/api/tests/${testId}`, { headers: getAuthHeaders() });
                    if (res2.status === 401) { redirectToLogin(); return; }
                    if (res2.status === 403) {
                        const err2 = await res2.json().catch(() => ({}));
                        if (isAuthDetail(err2?.detail)) { redirectToLogin(); return; }
                        renderEmpty((err2 && err2.detail) ? err2.detail : 'This test is restricted to a specific class.');
                        $('#notice').classList.remove('hidden');
                        $('#notice').textContent = 'Ask your teacher to assign you to that class, or request an open-to-all test link.';
                        return;
                    }
                    if (!res2.ok) { renderEmpty('Could not load this test.'); return; }
                    var data = await res2.json();
                } else {
                    var data = await res.json();
                }
                state.questions = data.questions || [];
                renderTest({ ...data, title: data.title, description: data.description });
                if (data.accepting_submissions === false) {
                    $('#notice').classList.remove('hidden');
                    $('#notice').textContent = 'This test is closed.';
                    $('#submitBtn').disabled = true;
                    $$('input', $('#testForm')).forEach(i => i.disabled = true);
                    return;
                }
                if (data.attempt && data.attempt.submitted_at) {
                    showAlreadyTaken(data.attempt, data.max_score ?? data.questions.length);
                    return;
                }
                const started = await startAttempt();
                if (data.duration_seconds) startTimer(parseInt(data.duration_seconds, 10), started?.started_at || data.attempt?.started_at || null);
                else setNavTimer(false);
            } catch (e) {
                console.error(e);
                renderEmpty('Could not load test.');
            }
        }

        async function startAttempt() {
            const token = getToken();
            if (!state.testId) return;
            if (!token && !hasSessionSignal()) { redirectToLogin(); return null; }
            const base = await resolveApi();
            const res = await fetch(`${base}/api/tests/${state.testId}/start`, {
                method: 'POST',
                headers: getAuthHeaders()
            });
            if (res.status === 401) {
                redirectToLogin();
                return null;
            }
            if (res.status === 403) {
                const err = await res.json().catch(() => ({}));
                if (isAuthDetail(err?.detail) || !hasSessionSignal()) {
                    redirectToLogin();
                    return null;
                }
            }
            if (res.status === 410) {
                $('#notice').classList.remove('hidden');
                $('#notice').textContent = 'This test is closed.';
                $('#submitBtn').disabled = true;
                $$('input', $('#testForm')).forEach(i => i.disabled = true);
                return;
            }
            if (res.status === 409) {
                setTimeout(goToResultPage, 100);
                return null;
            }
            if (!res.ok) return null;
            return await res.json().catch(() => null);
        }

        async function submitAnswers(opts = {}) {
            if (state.submitting) return;
            state.submitting = true;
            const token = getToken();
            if (!state.testId) {
                renderEmpty('Missing test id.');
                state.submitting = false;
                return;
            }
            if (!token && !hasSessionSignal()) {
                redirectToLogin();
                state.submitting = false;
                return;
            }
            const form = $('#testForm');
            const answers = state.questions.map((_, idx) => {
                const chosen = form.querySelector(`input[name="q${idx}"]:checked`);
                return chosen ? parseInt(chosen.value, 10) : -1;
            });
            const elapsed = state.startedAtMs ? Math.round((Date.now() - state.startedAtMs) / 1000) : null;

            try {
                const base = await resolveApi();
                const res = await fetch(`${base}/api/tests/${state.testId}/submit`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                    body: JSON.stringify({ answers, elapsed_seconds: elapsed }),
                });
                if (res.status === 401) {
                    redirectToLogin();
                    return;
                }
                if (res.status === 403) {
                    const err = await res.json().catch(() => ({}));
                    if (isAuthDetail(err?.detail) || !hasSessionSignal()) {
                        redirectToLogin();
                        return;
                    }
                    throw new Error(err?.detail || 'Submit forbidden');
                }
                if (res.status === 410) {
                    $('#notice').classList.remove('hidden');
                    $('#notice').textContent = 'This test is closed.';
                    return;
                }
                if (res.status === 409) {
                    $('#notice').classList.remove('hidden');
                    $('#notice').textContent = 'You already submitted this test. Opening your result...';
                    setTimeout(goToResultPage, 500);
                    return;
                }
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.detail || 'Submit failed');
                }
                const data = await res.json();
                $('#result').textContent = `Score: ${data.score}/${data.max_score}`;
                $('#notice').classList.add('hidden');
                lockTestUI();
                if (state.timer) clearInterval(state.timer);
                setNavTimer(false);
                if (opts && opts.autoSubmit) {
                    $('#notice').classList.remove('hidden');
                    $('#notice').textContent = 'Time is up. Test submitted automatically.';
                }
                setTimeout(goToResultPage, 400);
            } catch (e) {
                console.error(e);
                $('#notice').classList.remove('hidden');
                $('#notice').textContent = e.message || 'Submit failed';
            } finally {
                state.submitting = false;
            }
        }

        document.addEventListener('DOMContentLoaded', fetchTest);
