// Extracted from ui/teacher_test_edit.html (inline <script> #1).
        const $ = (s, r = document) => r.querySelector(s); const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
        const params = new URLSearchParams(location.search); let API_BASE = '';
        async function resolveApi() { if (API_BASE) return API_BASE; const b = (window.__API_BASE || window.API_BASE || '').replace(/\/$/, ''); if (b) { API_BASE = b; return b; } await new Promise(r => setTimeout(r, 60)); return resolveApi(); }
        function getToken() { const keys = ['teacherToken', 'px_token', 'userToken', 'sb-access-token', 'supabase.auth.token']; for (const k of keys) { try { const v = localStorage.getItem(k); if (v) return v; } catch { } } return ''; }
        function showAlert(msg) { const a = $('#alert'); a.textContent = msg; a.classList.remove('hidden'); }

        let state = { questions: [], testId: '' };

        function render() {
            const wrap = $('#questions');
            if (!state.questions.length) { wrap.innerHTML = '<div class="text-sm text-neutral-500">No questions yet.</div>'; return; }
            wrap.innerHTML = state.questions.map((q, idx) => {
                const opts = q.options || [];
                const optHtml = opts.map((o, i) => `<div class="flex gap-2 items-center"><input type="radio" name="correct-${idx}" value="${i}" ${q.correct_index === i ? 'checked' : ''} class="size-4"> <input data-role="opt" data-q="${idx}" data-i="${i}" value="${o}" class="flex-1 px-3 py-2 rounded-lg bg-white/80 dark:bg-white/10 ring-1 ring-black/5 dark:ring-white/15" /></div>`).join('');
                return `<div class="p-3 rounded-lg ring-1 ring-black/5 dark:ring-white/10 bg-white/70 dark:bg-white/5 space-y-2">
          <div class="flex justify-between items-center"><div class="font-semibold">Q${idx + 1}</div><button data-del="${idx}" class="text-xs text-red-500">Remove</button></div>
          <textarea data-role="prompt" data-q="${idx}" class="w-full px-3 py-2 rounded-lg bg-white/80 dark:bg-white/10 ring-1 ring-black/5 dark:ring-white/15">${q.prompt || ''}</textarea>
          <div class="space-y-2">${optHtml}</div>
          <button data-addopt="${idx}" class="text-xs px-2 py-1 rounded bg-black/5 dark:bg-white/10">Add option</button>
        </div>`;
            }).join('');

            $$('textarea[data-role="prompt"]', wrap).forEach(t => t.addEventListener('input', () => { const i = parseInt(t.dataset.q, 10); state.questions[i].prompt = t.value; }));
            $$('input[data-role="opt"]', wrap).forEach(inp => inp.addEventListener('input', () => { const qi = parseInt(inp.dataset.q, 10); const oi = parseInt(inp.dataset.i, 10); state.questions[qi].options[oi] = inp.value; }));
            $$('input[type="radio"]', wrap).forEach(r => r.addEventListener('change', () => { const qi = parseInt(r.name.replace('correct-', ''), 10); state.questions[qi].correct_index = parseInt(r.value, 10); }));
            $$('button[data-addopt]', wrap).forEach(btn => btn.addEventListener('click', () => { const qi = parseInt(btn.dataset.addopt, 10); state.questions[qi].options.push(''); render(); }));
            $$('button[data-del]', wrap).forEach(btn => btn.addEventListener('click', () => { const qi = parseInt(btn.dataset.del, 10); state.questions.splice(qi, 1); render(); }));
        }

        function addQuestion() { state.questions.push({ prompt: '', options: ['', ''], correct_index: 0, points: 1, difficulty: null, co: null, k_level: null }); render(); }

        async function load() {
            const id = params.get('test_id') || params.get('id'); if (!id) { showAlert('Missing test id'); return; }
            state.testId = id;
            const token = getToken(); if (!token) { showAlert('Sign in as teacher'); return; }
            try {
                const base = await resolveApi();
                const res = await fetch(`${base}/api/tests/${id}`, { headers: { Authorization: 'Bearer ' + token } });
                if (!res.ok) { showAlert('Could not load test'); return; }
                const data = await res.json();
                $('#title').value = data.title || ''; $('#desc').value = data.description || ''; $('#duration').value = data.duration_seconds ? Math.round(Number(data.duration_seconds) / 60) : ''; $('#accepting').checked = data.accepting_submissions !== false;
                state.questions = (data.questions || []).map(q => ({
                    prompt: q.prompt || '',
                    options: q.options || [],
                    correct_index: q.correct_index ?? 0,
                    points: q.points || 1,
                    order: q.order || 0,
                    difficulty: q.difficulty || null,
                    co: q.co || null,
                    k_level: q.k_level || null,
                }));
                if (!state.questions.length) addQuestion(); else render();
            } catch (e) { console.error(e); showAlert('Load failed'); }
        }

        async function save() {
            const token = getToken(); if (!token) return showAlert('Sign in');
            const base = await resolveApi();
            const durationSec = ($('#duration').value ? parseInt($('#duration').value, 10) * 60 : null);
            const payload = {
                title: $('#title').value || 'Untitled',
                description: $('#desc').value || null,
                duration_seconds: durationSec,
                accepting_submissions: $('#accepting').checked,
                questions: state.questions.map((q, idx) => ({
                    prompt: q.prompt,
                    options: q.options.filter(Boolean),
                    correct_index: q.correct_index || 0,
                    points: q.points || 1,
                    order: idx,
                    difficulty: q.difficulty || null,
                    co: q.co || null,
                    k_level: q.k_level || null,
                })),
            };
            if (!payload.questions.length) { return showAlert('Add at least one question'); }
            try {
                const res = await fetch(`${base}/api/teacher/tests/${state.testId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify(payload) });
                if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.detail || 'Save failed'); }
                location.href = `./teacher_tests.html`;
            } catch (e) { console.error(e); showAlert(e.message || 'Save failed'); }
        }

        document.addEventListener('DOMContentLoaded', () => { $('#add').addEventListener('click', addQuestion); $('#save').addEventListener('click', save); $('#reset').addEventListener('click', load); load(); });
