// Extracted from ui/teachers/teacher_feedback_analytics.html (inline <script> #2).
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
        const colors = ['#9E4B8A', '#4C2A59', '#E879F9', '#A855F7', '#7C3AED', '#6366F1', '#3B82F6', '#0EA5E9'];

        async function load() {
            try {
                const res = await fetch(`${API}/api/feedback/forms/${formId}/analytics`, {
                    headers: { 'Authorization': 'Bearer ' + token }
                });
                if (!res.ok) throw new Error('Failed to load');
                const data = await res.json();
                render(data);
            } catch (e) {
                console.error(e);
                $('loadingState').innerHTML = `
                    <div class="glass-panel rounded-2xl p-10 text-center">
                        <span class="material-symbols-rounded text-4xl text-red-500 mb-3 block">error</span>
                        <h3 class="font-semibold mb-2">Failed to load analytics</h3>
                        <p class="text-neutral-600 dark:text-white/60">${e.message}</p>
                    </div>
                `;
            }
        }

        function renderRatingChart(q) {
            const avg = q.average || 0;
            const max = q.question_type === 'rating' ? 5 : 10;
            const pct = (avg / max) * 100;

            let distHtml = '';
            if (q.distribution) {
                const entries = Object.entries(q.distribution);
                const maxCount = Math.max(...entries.map(([, v]) => v), 1);
                distHtml = `
                    <div class="mt-4 space-y-2">
                        ${entries.map(([val, count]) => `
                            <div class="flex items-center gap-2 text-xs">
                                <span class="w-4 text-right">${val}</span>
                                <div class="flex-1 h-6 bg-black/5 dark:bg-white/5 rounded overflow-hidden">
                                    <div class="bar h-full bg-brand-500 rounded" style="width: ${(count / maxCount) * 100}%"></div>
                                </div>
                                <span class="w-8 text-neutral-500 dark:text-white/50">${count}</span>
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            return `
                <div class="text-center mb-4">
                    <span class="text-4xl font-bold text-brand-600 dark:text-brand-400">${avg.toFixed(1)}</span>
                    <span class="text-neutral-500 dark:text-white/50">/ ${max}</span>
                </div>
                <div class="h-3 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                    <div class="bar h-full bg-gradient-to-r from-brand-500 to-brand-700 rounded-full" style="width: ${pct}%"></div>
                </div>
                ${distHtml}
            `;
        }

        function renderChoiceChart(q) {
            const opts = q.options || [];
            const dist = q.distribution || {};
            const total = Object.values(dist).reduce((a, b) => a + b, 0) || 1;

            return `
                <div class="space-y-3">
                    ${opts.map((opt, i) => {
                const count = dist[String(i)] || 0;
                const pct = (count / total) * 100;
                return `
                            <div>
                                <div class="flex justify-between text-sm mb-1">
                                    <span class="truncate">${opt}</span>
                                    <span class="text-neutral-500 dark:text-white/50">${count} (${pct.toFixed(0)}%)</span>
                                </div>
                                <div class="h-6 bg-black/5 dark:bg-white/5 rounded overflow-hidden">
                                    <div class="bar h-full rounded" style="width: ${pct}%; background: ${colors[i % colors.length]}"></div>
                                </div>
                            </div>
                        `;
            }).join('')}
                </div>
            `;
        }

        function renderTextResponses(q) {
            const responses = q.responses || [];
            if (!responses.length) return '<p class="text-neutral-500 dark:text-white/50 text-sm">No text responses</p>';

            return `
                <div class="max-h-64 overflow-y-auto space-y-2">
                    ${responses.slice(0, 10).map(r => `
                        <div class="p-3 rounded-lg bg-black/5 dark:bg-white/5 text-sm">${r}</div>
                    `).join('')}
                    ${responses.length > 10 ? `<p class="text-xs text-neutral-500 dark:text-white/50 text-center">+${responses.length - 10} more</p>` : ''}
                </div>
            `;
        }

        function render(data) {
            $('loadingState').classList.add('hidden');
            $('content').classList.remove('hidden');

            $('formTitle').textContent = 'Form Analytics';
            $('totalResponses').textContent = data.total_responses || 0;
            $('responsesLink').href = `teacher_feedback_responses.html?id=${formId}`;

            if (!data.total_responses || !data.questions?.length) {
                $('emptyState').classList.remove('hidden');
                return;
            }

            const container = $('analyticsContainer');
            container.innerHTML = data.questions.map(q => {
                let chartHtml = '';

                if (['rating', 'scale'].includes(q.question_type)) {
                    chartHtml = renderRatingChart(q);
                } else if (['mcq_single', 'mcq_multiple', 'yes_no', 'dropdown'].includes(q.question_type)) {
                    chartHtml = renderChoiceChart(q);
                } else {
                    chartHtml = renderTextResponses(q);
                }

                return `
                    <div class="glass-panel rounded-2xl p-5">
                        <h3 class="font-semibold text-sm mb-4">${q.question_text}</h3>
                        ${chartHtml}
                    </div>
                `;
            }).join('');
        }

        load();
