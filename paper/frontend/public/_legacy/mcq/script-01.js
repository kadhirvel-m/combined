// Extracted from ui/mcq.html (inline <script> #1).
        const apiBase = (window.API_BASE || window.location.origin).replace(/\/$/, '');
        const params = new URLSearchParams(window.location.search);
        const noteId = params.get('noteId') || params.get('note_id');
        const topicParam = params.get('topic') || '';

        const state = {
            noteId: noteId || '',
            topic: topicParam || '',
            model: '',
            truncated: false,
            idx: 0,
            score: 0,
            touched: new Set(),
            selections: [],
            questions: [],
        };

        // Try to load seed from session for nicer titles
        if (!state.topic) {
            try {
                const seed = sessionStorage.getItem('paperx:lastMCQSeed');
                if (seed) {
                    const s = JSON.parse(seed);
                    if (s && s.noteId === state.noteId && s.topic) state.topic = s.topic;
                }
            } catch { }
        }

        const $title = document.getElementById('title');
        const $subtitle = document.getElementById('subtitle');
        const $progressBar = document.getElementById('progressBar');
        const $quiz = document.getElementById('quizBox');
        const $counter = document.getElementById('counter');
        const $countBadge = document.getElementById('countBadge');
        const $modelBadge = document.getElementById('modelBadge');
        const $truncBadge = document.getElementById('truncBadge');
        const $result = document.getElementById('resultBox');
        const $scoreLine = document.getElementById('scoreLine');

        function snack(msg) { const $s = document.getElementById('snack'); $s.textContent = msg; $s.classList.remove('hidden'); setTimeout(() => $s.classList.add('hidden'), 1400); }

        function setThemeBtn() {
            const $btn = document.getElementById('themeBtn');
            if (!$btn) return;
            $btn.addEventListener('click', () => { try { const mode = (window.Theme && window.Theme.toggle && window.Theme.toggle()) || (document.documentElement.classList.toggle('dark'), document.documentElement.classList.contains('dark') ? 'dark' : 'light'); $btn.textContent = mode === 'dark' ? 'Light' : 'Theme'; } catch { } });
            try { const cur = (window.Theme && window.Theme.init && window.Theme.init()) || (document.documentElement.classList.contains('dark') ? 'dark' : 'light'); $btn.textContent = cur === 'dark' ? 'Light' : 'Theme'; } catch { }
        }

        function updateProgress() {
            const total = state.questions.length || 1;
            const pct = Math.max(0, Math.min(100, ((state.idx) / total) * 100));
            $progressBar.style.width = pct + '%';
            $counter.textContent = `${Math.min(state.idx + 1, total)} / ${total}`;
        }

        function renderQuestion() {
            const q = state.questions[state.idx];
            if (!q) return;
            $quiz.innerHTML = '';
            const card = document.createElement('div');
            card.className = 'glass rounded-2xl p-5';

            const head = document.createElement('div');
            head.className = 'flex items-center gap-2 text-xs text-[var(--muted)] mb-2';
            head.innerHTML = `<span class="chip">Q${state.idx + 1}</span>`;
            card.appendChild(head);

            const tq = document.createElement('h2');
            tq.className = 'text-lg font-semibold';
            tq.textContent = q.question;
            card.appendChild(tq);

            const list = document.createElement('div');
            list.className = 'mt-3 grid grid-cols-1 gap-2';

            q.options.forEach((opt, i) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'opt text-left';
                btn.innerHTML = `<span class="chip mr-2">${String.fromCharCode(65 + i)}</span>${opt}`;
                btn.addEventListener('click', () => handleAnswer(i, btn));
                list.appendChild(btn);
            });
            card.appendChild(list);

            const expl = document.createElement('div');
            expl.className = 'explain p-3 mt-3 text-sm hidden';
            expl.id = 'explainBox';
            card.appendChild(expl);

            $quiz.appendChild(card);
            updateProgress();
        }

        function handleAnswer(idx, btn) {
            if (state.touched.has(state.idx)) return; // lock per question on first attempt
            state.touched.add(state.idx);
            const q = state.questions[state.idx];
            const nodes = Array.from(document.querySelectorAll('.opt'));
            nodes.forEach(n => n.disabled = true);
            if (idx === q.correct_index) {
                btn.classList.add('correct');
                state.score += 1;
                snack('Correct');
            } else {
                btn.classList.add('wrong');
                const correctBtn = nodes[q.correct_index];
                if (correctBtn) correctBtn.classList.add('correct');
                const $ex = document.getElementById('explainBox');
                if ($ex) {
                    $ex.innerHTML = `<strong>Answer:</strong> ${q.options[q.correct_index]}<br/><span>${q.explanation || 'Based on the note content.'}</span>`;
                    $ex.classList.remove('hidden');
                }
            }
            // record selection for review
            state.selections[state.idx] = idx;
            // Do not auto-advance; wait for user to click Next
        }

        function showResult() {
            $result.classList.remove('hidden');
            const total = state.questions.length;
            $scoreLine.textContent = `You scored ${state.score} / ${total}`;
            const $review = document.getElementById('reviewList');
            if ($review) {
                $review.innerHTML = '';
                state.questions.forEach((q, i) => {
                    const wrap = document.createElement('div');
                    wrap.className = 'glass rounded-xl p-4';

                    const head = document.createElement('div');
                    head.className = 'flex items-center gap-2 text-xs text-[var(--muted)] mb-2';
                    head.innerHTML = `<span class="chip">Q${i + 1}</span>`;
                    wrap.appendChild(head);

                    const title = document.createElement('div');
                    title.className = 'font-medium';
                    title.textContent = q.question;
                    wrap.appendChild(title);

                    const sel = state.selections[i];
                    const isCorrect = typeof sel === 'number' && sel === q.correct_index;

                    const ya = document.createElement('div');
                    ya.className = 'pill mt-3 ' + (isCorrect ? 'correct' : 'wrong');
                    ya.innerHTML = `<strong>Your answer:</strong> ${typeof sel === 'number' ? q.options[sel] : '—'}`;
                    wrap.appendChild(ya);

                    const ca = document.createElement('div');
                    ca.className = 'pill mt-2 correct';
                    ca.innerHTML = `<strong>Correct answer:</strong> ${q.options[q.correct_index]}`;
                    wrap.appendChild(ca);

                    const ex = document.createElement('div');
                    ex.className = 'mt-2 text-sm';
                    ex.innerHTML = `<strong>Why:</strong> ${q.explanation || 'Based on the note content.'}`;
                    wrap.appendChild(ex);

                    $review.appendChild(wrap);
                });
            }
        }

        function goto(i) {
            const total = state.questions.length;
            if (!total) return;
            state.idx = Math.max(0, Math.min(i, total - 1));
            renderQuestion();
        }

        function shuffle() {
            const arr = state.questions.slice();
            for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[arr[i], arr[j]] = [arr[j], arr[i]]; }
            state.questions = arr; state.idx = 0; state.touched.clear(); state.score = 0; $result.classList.add('hidden'); renderQuestion();
        }

        async function fetchMCQ() {
            if (!state.noteId) {
                $title.textContent = 'Missing note reference';
                $subtitle.textContent = 'Open from Notes Generator after generating notes.';
                return;
            }
            $title.textContent = state.topic ? `${state.topic} — MCQ Test` : 'Preparing MCQ Test…';
            try {
                const endpoints = [];
                const primary = `${apiBase}/notes/${encodeURIComponent(state.noteId)}/mcq`;
                endpoints.push(primary);
                const hasApiSuffix = /\/api$/i.test(apiBase);
                const altBase = hasApiSuffix ? apiBase.replace(/\/api$/i, '') : `${apiBase}/api`;
                const alt = `${altBase.replace(/\/$/, '')}/notes/${encodeURIComponent(state.noteId)}/mcq`;
                if (!endpoints.includes(alt)) endpoints.push(alt);
                let data = null, ok = false, lastErr = '';
                for (let i = 0; i < endpoints.length; i++) {
                    try {
                        const res = await fetch(endpoints[i], { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic: state.topic || undefined, count: 10 }) });
                        if (res.ok) { data = await res.json(); ok = true; break; }
                        else { try { const t = await res.json(); lastErr = (t && (t.detail || t.error)) || `HTTP ${res.status}`; } catch { lastErr = `HTTP ${res.status}`; } }
                    } catch (e) { lastErr = e && e.message ? e.message : 'Network error'; }
                }
                if (!ok) throw new Error(lastErr || 'Request failed');
                state.questions = Array.isArray(data.questions) ? data.questions : [];
                state.model = data.model || '';
                state.truncated = !!data.truncated;
                if (!state.questions.length) throw new Error('No questions generated.');
                $title.textContent = data.topic ? `${data.topic} — MCQ Test` : (state.topic || 'MCQ Test');
                $subtitle.textContent = 'Pick the best answer. We’ll show the correct one and a short explanation when you miss.';
                $countBadge.textContent = `${state.questions.length} Qs`;
                // Hide model/truncation badges per requirements
                $modelBadge.classList.add('hidden');
                $truncBadge.classList.add('hidden');
                state.idx = 0; state.score = 0; state.touched.clear(); state.selections = new Array(state.questions.length).fill(null);
                renderQuestion();
            } catch (err) {
                console.error('MCQ error', err);
                $title.textContent = 'MCQ generation failed';
                $subtitle.textContent = err && err.message ? err.message : 'Try regenerating notes and retry.';
            } finally {
                // Remove loader
                document.body.classList.add('loaded');
            }
        }

        document.getElementById('prevBtn').addEventListener('click', () => goto(state.idx - 1));
        document.getElementById('nextBtn').addEventListener('click', () => {
            const last = state.idx >= state.questions.length - 1;
            if (!last) goto(state.idx + 1); else showResult();
        });
        document.getElementById('restartBtn').addEventListener('click', () => { state.idx = 0; state.score = 0; state.touched.clear(); state.selections = new Array(state.questions.length).fill(null); $result.classList.add('hidden'); renderQuestion(); });
        document.getElementById('shuffleBtn').addEventListener('click', () => { shuffle(); const $review = document.getElementById('reviewList'); if ($review) $review.innerHTML = ''; });

        document.addEventListener('DOMContentLoaded', () => { setThemeBtn(); fetchMCQ(); });
