// Extracted from ui/teachers/teacher_feedback_responses.html (inline <script> #2).
        document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.documentElement.classList.toggle('dark');
                localStorage.setItem('px_theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
            });
        });

        const API = window.API_BASE || location.origin;
        const token = localStorage.getItem('teacherToken') || localStorage.getItem('px_auth_token');
        if (!token) location.href = 'teacher_login.html';

        const params = new URLSearchParams(location.search);
        const formId = params.get('id');
        if (!formId) location.href = 'teacher_feedback_list.html';

        const $ = id => document.getElementById(id);
        let data = { form: null, questions: [], responses: [] };
        let viewMode = 'individual';

        async function load() {
            try {
                const res = await fetch(`${API}/api/feedback/forms/${formId}/responses`, {
                    headers: { 'Authorization': 'Bearer ' + token }
                });
                if (!res.ok) throw new Error('Failed to load');
                data = await res.json();
                render();
            } catch (e) {
                console.error(e);
                $('loadingState').innerHTML = `
                    <div class="glass-panel rounded-2xl p-10 text-center">
                        <span class="material-symbols-rounded text-4xl text-red-500 mb-3 block">error</span>
                        <h3 class="font-semibold text-lg mb-2">Failed to load</h3>
                        <p class="text-neutral-600 dark:text-white/60">${e.message}</p>
                    </div>
                `;
            }
        }

        function formatDate(d) {
            if (!d) return '-';
            return new Date(d).toLocaleString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
                hour: 'numeric', minute: '2-digit'
            });
        }

        function getAnswerDisplay(answer, question) {
            if (!answer) return '<span class="text-neutral-400 italic">No answer</span>';

            if (question.question_type === 'rating') {
                const rating = answer.answer_rating || 0;
                return '<span class="text-amber-500">' + '★'.repeat(rating) + '☆'.repeat(5 - rating) + '</span>';
            }
            if (question.question_type === 'scale') {
                return `<span class="font-bold text-brand-600 dark:text-brand-400">${answer.answer_rating || 0}</span>/10`;
            }
            if (['mcq_single', 'mcq_multiple', 'dropdown', 'yes_no'].includes(question.question_type)) {
                const opts = answer.answer_options || [];
                const labels = opts.map(i => (question.options || [])[i] || `Option ${i + 1}`);
                return labels.join(', ') || '<span class="text-neutral-400 italic">None selected</span>';
            }
            return answer.answer_text || '<span class="text-neutral-400 italic">No answer</span>';
        }

        function renderIndividual() {
            const container = $('responsesContainer');

            if (!data.responses.length) {
                container.innerHTML = '';
                $('emptyState').classList.remove('hidden');
                return;
            }

            $('emptyState').classList.add('hidden');

            container.innerHTML = data.responses.map((resp, idx) => {
                const answersHtml = data.questions.map(q => {
                    const answer = (resp.answers || []).find(a => a.question_id === q.id);
                    return `
                        <div class="py-3 border-b border-black/5 dark:border-white/10 last:border-0">
                            <p class="text-xs text-neutral-500 dark:text-white/50 mb-1">${q.question_text}</p>
                            <div class="text-sm">${getAnswerDisplay(answer, q)}</div>
                        </div>
                    `;
                }).join('');

                return `
                    <div class="glass-panel rounded-2xl p-5">
                        <div class="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-black/5 dark:border-white/10">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-600 font-bold">
                                    ${(resp.student_name || 'A')[0].toUpperCase()}
                                </div>
                                <div>
                                    <h3 class="font-semibold">${resp.student_name || 'Anonymous'}</h3>
                                    <p class="text-xs text-neutral-500 dark:text-white/50">${resp.student_email || 'No email'}</p>
                                </div>
                            </div>
                            <span class="text-xs text-neutral-500 dark:text-white/50">${formatDate(resp.submitted_at)}</span>
                        </div>
                        <div class="divide-y divide-black/5 dark:divide-white/5">
                            ${answersHtml}
                        </div>
                    </div>
                `;
            }).join('');
        }

        function renderByQuestion() {
            const container = $('questionsContainer');

            if (!data.responses.length) {
                container.innerHTML = '';
                $('emptyState').classList.remove('hidden');
                return;
            }

            $('emptyState').classList.add('hidden');

            container.innerHTML = data.questions.map(q => {
                const allAnswers = data.responses.map(resp => {
                    const answer = (resp.answers || []).find(a => a.question_id === q.id);
                    return { resp, answer };
                });

                const answersHtml = allAnswers.map(({ resp, answer }) => `
                    <div class="flex items-start gap-3 py-2 border-b border-black/5 dark:border-white/10 last:border-0">
                        <span class="text-xs text-neutral-500 dark:text-white/50 w-24 shrink-0 truncate">${resp.student_name || 'Anonymous'}</span>
                        <div class="text-sm flex-1">${getAnswerDisplay(answer, q)}</div>
                    </div>
                `).join('');

                return `
                    <div class="glass-panel rounded-2xl p-5">
                        <h3 class="font-semibold mb-4">${q.question_text}</h3>
                        <div class="divide-y divide-black/5 dark:divide-white/5 max-h-64 overflow-y-auto">
                            ${answersHtml}
                        </div>
                    </div>
                `;
            }).join('');
        }

        function render() {
            $('loadingState').classList.add('hidden');
            $('content').classList.remove('hidden');

            $('formTitle').textContent = data.form?.title || 'Feedback Form';
            $('responseCount').textContent = data.total_responses || 0;
            $('analyticsLink').href = `teacher_feedback_analytics.html?id=${formId}`;

            if (viewMode === 'individual') {
                $('responsesContainer').classList.remove('hidden');
                $('questionsContainer').classList.add('hidden');
                renderIndividual();
            } else {
                $('responsesContainer').classList.add('hidden');
                $('questionsContainer').classList.remove('hidden');
                renderByQuestion();
            }
        }

        function setViewMode(mode) {
            viewMode = mode;

            if (mode === 'individual') {
                $('viewIndividual').className = 'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-brand-500 text-white';
                $('viewByQuestion').className = 'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5';
            } else {
                $('viewByQuestion').className = 'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-brand-500 text-white';
                $('viewIndividual').className = 'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5';
            }

            render();
        }

        function exportCSV() {
            if (!data.responses.length) {
                alert('No responses to export');
                return;
            }

            const headers = ['Student Name', 'Email', 'Submitted At', ...data.questions.map(q => q.question_text)];
            const rows = data.responses.map(resp => {
                const row = [
                    resp.student_name || 'Anonymous',
                    resp.student_email || '',
                    resp.submitted_at || ''
                ];
                data.questions.forEach(q => {
                    const answer = (resp.answers || []).find(a => a.question_id === q.id);
                    if (!answer) {
                        row.push('');
                    } else if (q.question_type === 'rating' || q.question_type === 'scale') {
                        row.push(answer.answer_rating || '');
                    } else if (['mcq_single', 'mcq_multiple', 'dropdown', 'yes_no'].includes(q.question_type)) {
                        const opts = (answer.answer_options || []).map(i => (q.options || [])[i] || '');
                        row.push(opts.join('; '));
                    } else {
                        row.push(answer.answer_text || '');
                    }
                });
                return row;
            });

            const csvContent = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `feedback_${formId}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        }

        $('viewIndividual').addEventListener('click', () => setViewMode('individual'));
        $('viewByQuestion').addEventListener('click', () => setViewMode('byQuestion'));
        $('exportBtn').addEventListener('click', exportCSV);

        load();
