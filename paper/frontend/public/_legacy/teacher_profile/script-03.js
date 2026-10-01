// Extracted from ui/teacher_profile.html (inline <script> #3).
        // Utility helpers
        const $ = (s, r = document) => r.querySelector(s);
        const $$ = (s, r = document) => [...r.querySelectorAll(s)];
        const esc = (s = '') => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const formatRange = (a, b) => (a && b) ? `${a}-${b}` : (a || b || '');
        (function theme() { const root = document.documentElement; const toggles = () => Array.from(document.querySelectorAll('[data-theme-toggle]')); const set = (m) => { m === 'dark' ? root.classList.add('dark') : root.classList.remove('dark'); localStorage.setItem('px_theme', m); toggles().forEach(btn => { const ic = btn.querySelector('.material-symbols-rounded'); if (ic) ic.textContent = m === 'dark' ? 'light_mode' : 'dark_mode'; }); }; set(root.classList.contains('dark') ? 'dark' : 'light'); document.addEventListener('click', e => { const t = e.target.closest('[data-theme-toggle]'); if (!t) return; set(root.classList.contains('dark') ? 'light' : 'dark'); }); })();

        let API_BASE = '';
        async function resolveApi() { if (API_BASE) return API_BASE; const b = (window.__API_BASE || window.API_BASE || '').replace(/\/$/, ''); if (b) { API_BASE = b; return b; } await new Promise(r => setTimeout(r, 80)); return resolveApi(); }
        function isLikelyJwt(v) {
            if (!v || typeof v !== 'string') return false;
            const p = v.split('.');
            return p.length === 3 && p[0].length > 8 && p[1].length > 8;
        }

        function tokenFromHash() { return ''; }

        function persistInboundToken(_) { }

        function clearAccessTokenHash() { }

        function normalizeStoredToken(v) {
            const raw = String(v || '').trim();
            if (!raw || raw === '__COOKIE_AUTH__' || raw === 'null' || raw === 'undefined' || raw === 'none') return '';
            return raw;
        }

        const ensureAuthReady = (typeof window.__PX_ENSURE_AUTH_READY === 'function')
            ? window.__PX_ENSURE_AUTH_READY
            : (async () => false);
        function getToken() {
            // Cookie-session first. Use short-lived bearer fallback only when present.
            try {
                const fb = normalizeStoredToken(sessionStorage.getItem('paperx_bearer_fallback'));
                if (isLikelyJwt(fb)) return fb;
            } catch { }
            try {
                const fb2 = normalizeStoredToken(localStorage.getItem('paperx_bearer_fallback'));
                if (isLikelyJwt(fb2)) return fb2;
            } catch { }
            return '';
        }

        const params = new URLSearchParams(location.search);
        // Preserve original intent (dynamic self) if user=me or no user query
        const originalUserParam = params.get('user');
        let dynamicSelfMode = !originalUserParam || originalUserParam === 'me';
        let targetUser = originalUserParam || 'me';

        function noAuthForMe() {
            // Redirect immediately to teacher login with return URL
            const ret = encodeURIComponent(location.pathname + location.search);
            location.href = `./teachers/teacher_login.html?redirect=${ret}`;
        }

        async function resolveMeToId() {
            const token = getToken();
            if (!token) return null;
            try {
                const base = await resolveApi();
                // If teacher session, ask backend to resolve via teacher/me
                if (localStorage.getItem('teacherToken')) {
                    const r = await fetch(`${base}/api/teacher/profile/me`, { headers: { Authorization: 'Bearer ' + token } });
                    if (!r.ok) return null;
                    const j = await r.json();
                    return j?.auth_user_id || j?.teacher?.auth_user_id || j?.profile?.auth_user_id || null;
                }
                const r = await fetch(`${base}/api/me`, { headers: { Authorization: 'Bearer ' + token } });
                if (!r.ok) return null;
                const j = await r.json();
                const authId = j?.profile?.auth_user_id || j?.profile?.id; // prefer auth_user_id
                return authId || null;
            } catch (e) { return null; }
        }
        function decodeJwtUserId(token) {
            try {
                const parts = token.split('.'); if (parts.length < 2) return null;
                const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
                return payload.sub || payload.user_id || payload.uid || null;
            } catch { return null; }
        }

        let resolvingMe = false;
        let selfUserId = null;
        let lastPayload = null; // cache to avoid refetch on client-only filters
        async function loadProfile() {
            const token = getToken();
            const base = await resolveApi();
            let res;
            try { await ensureAuthReady(); } catch { }
            // In dynamic self mode always hit /me variant so switching accounts (storage event) refreshes automatically
            const strictParam = 'strict=1'; // instruct backend to use only teacher_profiles (implement server-side if not present)
            async function fetchWithRetry(url, hdrs, attempts = 4, baseDelay = 180) {
                let lastErr; for (let i = 0; i < attempts; i++) {
                    try {
                        const r = await fetch(url, { headers: hdrs, cache: 'no-store' });
                        if (!r.ok && r.status >= 500 && r.status < 600) throw new Error('Server ' + r.status);
                        return r;
                    } catch (e) {
                        lastErr = e; const isLast = i === attempts - 1;
                        const jitter = Math.random() * 60;
                        await new Promise(r => setTimeout(r, baseDelay * (i + 1) + jitter));
                        if (isLast) throw e;
                    }
                }
                throw lastErr;
            }
            const makeUrl = dynamicSelfMode ? `${base}/api/teacher/profile/me?${strictParam}` : `${base}/api/teacher/profile/${encodeURIComponent(targetUser)}?${strictParam}`;
            const baseHeaders = { 'X-TeacherProfile-Strict': 'true' };
            let headers = token ? { ...baseHeaders, Authorization: 'Bearer ' + token } : baseHeaders;
            try {
                res = await fetchWithRetry(makeUrl, headers);
                // If local token is stale/invalid, retry once with cookie-based auth only.
                if (res && res.status === 401) {
                    try { await ensureAuthReady(); } catch { }
                    headers = baseHeaders;
                    res = await fetchWithRetry(makeUrl, headers);
                }
            } catch (e) {
                console.error('Profile fetch retries exhausted', e);
                if (dynamicSelfMode) {
                    // Automatic sign-out fallback and redirect to login
                    ['px_token', 'teacherToken', 'userToken', 'sb-access-token', 'supabase.auth.token'].forEach(k => { try { localStorage.removeItem(k); } catch { } });
                    noAuthForMe();
                    return;
                }
                renderError('Network error – please refresh');
                return;
            }
            let data = {}; try { data = await res.json(); } catch { }
            if (!res.ok) {
                if (dynamicSelfMode && res.status === 401) { noAuthForMe(); return; }
                renderError(data.detail || 'Failed to load'); return;
            }
            lastPayload = data;
            renderProfile(data);
            // Show self action buttons if this profile belongs to viewer
            if (dynamicSelfMode) {
                selfUserId = 'me';
            } else if (!selfUserId && token) {
                // decode token (fallback) to determine if same user
                const parts = token.split('.'); if (parts.length > 1) { try { const p = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))); selfUserId = p.sub || p.user_id || p.uid || null; } catch { } }
            }
            const isSelf = (dynamicSelfMode && token) || (selfUserId && selfUserId === targetUser);
            if (isSelf) {
                const selfActions = document.getElementById('selfActions');
                selfActions.classList.remove('hidden');
                selfActions.classList.add('flex');
                // Show navbar Edit Profile button
                const navEditBtn = document.getElementById('navEditProfile');
                if (navEditBtn) { navEditBtn.classList.remove('hidden'); navEditBtn.classList.add('inline-flex'); }
                // Show navbar Feedback button
                const navFeedbackBtn = document.getElementById('navFeedback');
                if (navFeedbackBtn) { navFeedbackBtn.classList.remove('hidden'); navFeedbackBtn.classList.add('inline-flex'); }
                const navTimeTableBtn = document.getElementById('navTimeTable');
                if (navTimeTableBtn) { navTimeTableBtn.classList.remove('hidden'); navTimeTableBtn.classList.add('inline-flex'); }
                // Reveal HOD portal only if user is actually HOD/admin.
                try {
                    const hodBtn = document.getElementById('hodPortalBtn');
                    if (hodBtn && token) {
                        const hodRes = await fetch(`${base}/api/hod/me`, { headers: { Authorization: 'Bearer ' + token }, cache: 'no-store' });
                        if (hodRes.ok) {
                            hodBtn.classList.remove('hidden');
                            hodBtn.classList.add('inline-flex');
                        }
                    }
                } catch (_) { }
            }
        }

        function renderError(msg) { $('#tName').textContent = 'Teacher'; $('#tHeadline').textContent = msg; $('#tMeta').innerHTML = ''; $('#classesGroups').innerHTML = `<div class='text-sm text-red-600 dark:text-red-400'>${esc(msg)}</div>`; }

        function chip(txt) { return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full ring-1 ring-black/10 dark:ring-white/15 bg-white/70 dark:bg-white/10 text-[11px]">${esc(txt)}</span>`; }

        function renderProfile(payload) {
            const { teacher = {}, stats = {}, classes = [], grouped_classes = {}, subjects = [] } = payload;
            $('#tName').childNodes[0].textContent = teacher.name || 'Unnamed Teacher';
            if (teacher.role === 'teacher' || teacher.status === 'approved' || teacher.role === 'admin') $('#tBadge').classList.remove('hidden');
            $('#tHeadline').textContent = teacher.headline || teacher.bio || 'No headline yet';
            const metaParts = []; if (teacher.college_name) metaParts.push(chip(teacher.college_name)); if (teacher.degree_name) metaParts.push(chip(teacher.degree_name)); if (teacher.department_name) metaParts.push(chip(teacher.department_name)); if (subjects.length) metaParts.push(chip(subjects.slice(0, 4).join(', ') + (subjects.length > 4 ? '…' : '')));
            $('#tMeta').innerHTML = metaParts.join('');
            // Stats chips
            const sc = $('#statChips'); sc.innerHTML = '';
            const statsMap = [['Notes', stats.notes_count], ['Classes', stats.classes_count], ['Subjects', stats.subjects_count]];
            statsMap.forEach(([label, val]) => { sc.insertAdjacentHTML('beforeend', `<div class='px-3 py-2 rounded-xl ring-1 ring-black/5 dark:ring-white/10 bg-white/60 dark:bg-white/5 flex flex-col text-center min-w-[88px]'> <span class='text-lg font-bold tracking-tight'>${val ?? 0}</span><span class='text-[11px] opacity-60 font-medium'>${esc(label)}</span></div>`); });
            // Avatar
            const av = $('#avatarWrap');
            av.classList.remove('skeleton', 'shimmer');
            if (teacher.avatar_url) { av.innerHTML = `<img src='${teacher.avatar_url}' alt='' class='w-full h-full object-cover'/>`; }
            else { av.innerHTML = `<div class='w-full h-full grid place-items-center bg-gradient-to-br from-brand-500/25 to-brand-700/20 text-5xl font-black'>${esc((teacher.name || 'T').charAt(0).toUpperCase())}</div>`; }

            // Classes grouped
            const container = $('#classesGroups'); container.innerHTML = '';
            const filterVal = $('#filterSubject').value.trim().toLowerCase();
            const yearLabelForSem = (semNum) => { const s = parseInt(semNum, 10); if (!s || s < 1) return ''; const year = Math.floor((s - 1) / 2) + 1; const ord = { 1: 'First', 2: 'Second', 3: 'Third', 4: 'Fourth', 5: 'Fifth', 6: 'Sixth' }; return ord[year] ? ord[year] + ' Year' : ''; };
            Object.entries(grouped_classes).forEach(([group, list]) => {
                const filt = list.filter(c => !filterVal || (c.subject || '').toLowerCase().includes(filterVal));
                if (!filt.length) return;
                // Derive semester number from group label like 'Semester 3'
                let semMatch = group.match(/Semester\s+(\d+)/i); let semNum = semMatch ? parseInt(semMatch[1], 10) : null; let yearLbl = semNum ? yearLabelForSem(semNum) : '';
                const cards = filt.map(c => classCard(c)).join('');
                container.insertAdjacentHTML('beforeend', `<div class='space-y-3'> <h3 class='text-sm font-semibold tracking-wide uppercase text-neutral-500 dark:text-white/50 flex flex-wrap items-center gap-2'>${esc(group)} ${yearLbl ? `<span class='text-[10px] px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-700 dark:text-fuchsia-200 ring-1 ring-brand-500/20'>${esc(yearLbl)}</span>` : ''} <span class='text-[10px] px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10'>${filt.length}</span></h3> <div class='grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>${cards}</div></div>`);
            });
            if (!classes.length) { container.innerHTML = `<div class='text-sm opacity-70'>No classes added yet.</div>`; }
            $('#classesCount').textContent = classes.length ? `${classes.length} classes` : '';
        }

        function classCard(c) {
            const tags = []; if (c.batch_range) tags.push(c.batch_range); if (c.section) tags.push('Sec ' + c.section);
            const params = new URLSearchParams();
            if (c.subject_id) params.set('course_id', c.subject_id);
            if (c.subject) params.set('subject', c.subject);
            if (c.id) params.set('class_id', c.id);
            if (c.batch_id) params.set('batch_id', c.batch_id);
            if (c.section) params.set('section', c.section);
            if (c.semester) params.set('semester', c.semester);
            const syllabusHref = c.subject_id ? `./teacher_class_syllabus.html?${params.toString()}` : '';
            const disabled = !syllabusHref;
            const baseCls = 'group relative rounded-2xl ring-1 ring-black/5 dark:ring-white/10 bg-white/70 dark:bg-white/5 p-4 transition-shadow block';
            const hoverCls = disabled ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-card hover:-translate-y-0.5 cursor-pointer';
            const actionLabel = disabled ? 'No syllabus linked' : 'View syllabus';
            return `<a ${syllabusHref ? `href='${syllabusHref}'` : "role='button' aria-disabled='true'"} class='${baseCls} ${hoverCls}'>
            <div class='flex items-start gap-3'>
                <div class='w-10 h-10 rounded-lg bg-gradient-to-br from-brand-500/30 to-brand-700/20 grid place-items-center text-sm font-bold text-brand-700 dark:text-fuchsia-200'>${esc((c.subject || 'S').charAt(0).toUpperCase())}</div>
                <div class='flex-1 min-w-0'>
                    <h4 class='text-sm font-semibold leading-tight mb-0.5 line-clamp-2'>${esc(c.subject || 'Subject')}</h4>
                    <div class='text-[11px] text-neutral-600 dark:text-white/60 flex flex-wrap gap-1'>${tags.map(t => `<span class='px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10'>${esc(t)}</span>`).join('')}</div>
                </div>
            </div>
            <div class='mt-3 flex items-center justify-between text-[11px] text-neutral-500 dark:text-white/40'>
                <span>${c.degree_name ? esc(c.degree_name) : ''}</span>
                <span class='inline-flex items-center gap-1'>${c.department_name ? esc(c.department_name) : ''}${c.department_name ? '<span class="opacity-30">•</span>' : ''}<span class='text-brand-600 dark:text-brand-200'>${esc(actionLabel)}</span></span>
            </div>
        </a>`;
        }

        $('#filterSubject').addEventListener('input', () => { if (lastPayload) renderProfile(lastPayload); });

        // Scroll top button
        const st = $('#scrollTop'); window.addEventListener('scroll', () => { if (scrollY > 400) st.classList.remove('hidden'); else st.classList.add('hidden'); }); st.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

        // React to token changes from other tabs / logins
        window.addEventListener('storage', (e) => {
            if (/token/i.test(e.key || '')) {
                if (dynamicSelfMode) {
                    // Slight debounce to allow localStorage write completion
                    setTimeout(() => loadProfile(), 120);
                }
            }
        });

        document.addEventListener('DOMContentLoaded', loadProfile);
