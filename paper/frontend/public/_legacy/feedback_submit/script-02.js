// Extracted from ui/feedback_submit.html (inline <script> #2).
        document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.documentElement.classList.toggle('dark');
                localStorage.setItem('px_theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
            });
        });

        const API = window.API_BASE || location.origin;
        const token = localStorage.getItem('px_auth_token');
        const params = new URLSearchParams(location.search);
        const shareCode = params.get('code');

        const $ = id => document.getElementById(id);
        let formData = null;

        async function load() {
            if (!shareCode) {
                showError();
                return;
            }

            try {
                const res = await fetch(`${API}/api/feedback/f/${shareCode}`, {
                    headers: token ? { 'Authorization': 'Bearer ' + token } : {}
                });

                if (!res.ok) {
                    showError();
                    return;
                }

                formData = await res.json();

                if (formData.already_submitted) {
                    showSubmitted();
                    return;
                }

                renderForm();
            } catch (e) {
                console.error(e);
                showError();
            }
        }

        function showError() {
            $('loadingState').classList.add('hidden');
            $('errorState').classList.remove('hidden');
        }

        function showSubmitted() {
            $('loadingState').classList.add('hidden');
            $('submittedState').classList.remove('hidden');
        }

        function showSuccess() {
            $('formContainer').classList.add('hidden');
            $('successState').classList.remove('hidden');
        }

        function renderForm() {
            $('loadingState').classList.add('hidden');
            $('formContainer').classList.remove('hidden');

            $('formTitle').textContent = formData.title || 'Feedback Form';
            $('formDesc').textContent = formData.description || '';
            $('teacherNameText').textContent = formData.teacher_name || 'Teacher';

            if (formData.is_anonymous_display) {
                $('anonBadge').classList.remove('hidden');
            }

            const form = $('feedbackForm');
            form.innerHTML = formData.questions.map((q, idx) => renderQuestion(q, idx)).join('');
        }

        function renderQuestion(q, idx) {
            let inputHtml = '';

            switch (q.question_type) {
                case 'text':
                    inputHtml = `<input type="text" name="q_${q.id}" placeholder="Your answer..." 
                        class="w-full px-4 py-3 rounded-xl ring-1 ring-black/10 dark:ring-white/15 bg-white/50 dark:bg-white/5 focus:ring-2 focus:ring-brand-500 outline-none">`;
                    break;

                case 'textarea':
                    inputHtml = `<textarea name="q_${q.id}" rows="4" placeholder="Your answer..." 
                        class="w-full px-4 py-3 rounded-xl ring-1 ring-black/10 dark:ring-white/15 bg-white/50 dark:bg-white/5 focus:ring-2 focus:ring-brand-500 outline-none resize-none"></textarea>`;
                    break;

                case 'rating':
                    inputHtml = `
                        <div class="star-rating">
                            ${[5, 4, 3, 2, 1].map(n => `
                                <input type="radio" name="q_${q.id}" id="q_${q.id}_${n}" value="${n}">
                                <label for="q_${q.id}_${n}"><span class="material-symbols-rounded text-3xl filled">star</span></label>
                            `).join('')}
                        </div>
                    `;
                    break;

                case 'scale':
                    inputHtml = `
                        <div class="flex items-center gap-1">
                            ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `
                                <label class="flex-1">
                                    <input type="radio" name="q_${q.id}" value="${n}" class="sr-only peer">
                                    <div class="text-center py-2 rounded-lg ring-1 ring-black/10 dark:ring-white/15 cursor-pointer 
                                        peer-checked:bg-brand-500 peer-checked:text-white peer-checked:ring-brand-500 
                                        hover:bg-brand-500/10 transition text-sm font-medium">${n}</div>
                                </label>
                            `).join('')}
                        </div>
                    `;
                    break;

                case 'mcq_single':
                    inputHtml = `
                        <div class="space-y-2">
                            ${(q.options || []).map((opt, i) => `
                                <label class="flex items-center gap-3 p-3 rounded-xl ring-1 ring-black/10 dark:ring-white/15 cursor-pointer hover:bg-brand-500/10 transition">
                                    <input type="radio" name="q_${q.id}" value="${i}" class="w-4 h-4 accent-brand-500">
                                    <span class="text-sm">${opt}</span>
                                </label>
                            `).join('')}
                        </div>
                    `;
                    break;

                case 'mcq_multiple':
                    inputHtml = `
                        <div class="space-y-2">
                            ${(q.options || []).map((opt, i) => `
                                <label class="flex items-center gap-3 p-3 rounded-xl ring-1 ring-black/10 dark:ring-white/15 cursor-pointer hover:bg-brand-500/10 transition">
                                    <input type="checkbox" name="q_${q.id}" value="${i}" class="w-4 h-4 accent-brand-500 rounded">
                                    <span class="text-sm">${opt}</span>
                                </label>
                            `).join('')}
                        </div>
                    `;
                    break;

                case 'yes_no':
                    inputHtml = `
                        <div class="flex gap-3">
                            <label class="flex-1">
                                <input type="radio" name="q_${q.id}" value="0" class="sr-only peer">
                                <div class="text-center py-3 rounded-xl ring-1 ring-black/10 dark:ring-white/15 cursor-pointer 
                                    peer-checked:bg-emerald-500 peer-checked:text-white peer-checked:ring-emerald-500 
                                    hover:bg-emerald-500/10 transition font-medium">
                                    <span class="material-symbols-rounded mr-1">thumb_up</span> Yes
                                </div>
                            </label>
                            <label class="flex-1">
                                <input type="radio" name="q_${q.id}" value="1" class="sr-only peer">
                                <div class="text-center py-3 rounded-xl ring-1 ring-black/10 dark:ring-white/15 cursor-pointer 
                                    peer-checked:bg-red-500 peer-checked:text-white peer-checked:ring-red-500 
                                    hover:bg-red-500/10 transition font-medium">
                                    <span class="material-symbols-rounded mr-1">thumb_down</span> No
                                </div>
                            </label>
                        </div>
                    `;
                    break;

                case 'dropdown':
                    inputHtml = `
                        <select name="q_${q.id}" class="w-full px-4 py-3 rounded-xl ring-1 ring-black/10 dark:ring-white/15 bg-white/50 dark:bg-white/5 focus:ring-2 focus:ring-brand-500 outline-none">
                            <option value="">Select an option...</option>
                            ${(q.options || []).map((opt, i) => `<option value="${i}">${opt}</option>`).join('')}
                        </select>
                    `;
                    break;
            }

            return `
                <div class="glass-panel rounded-2xl p-5">
                    <p class="font-medium mb-3">${idx + 1}. ${q.question_text}</p>
                    ${q.description ? `<p class="text-xs text-neutral-500 dark:text-white/50 mb-3">${q.description}</p>` : ''}
                    ${inputHtml}
                </div>
            `;
        }

        async function submit() {
            const btn = $('submitBtn');
            btn.disabled = true;
            btn.innerHTML = '<span class="material-symbols-rounded animate-spin">refresh</span> Submitting...';

            try {
                const answers = formData.questions.map(q => {
                    const answer = { question_id: q.id };

                    if (['text', 'textarea'].includes(q.question_type)) {
                        const input = document.querySelector(`[name="q_${q.id}"]`);
                        answer.answer_text = input?.value || '';
                    } else if (['rating', 'scale'].includes(q.question_type)) {
                        const input = document.querySelector(`[name="q_${q.id}"]:checked`);
                        answer.answer_rating = input ? parseInt(input.value) : null;
                    } else if (q.question_type === 'mcq_multiple') {
                        const inputs = document.querySelectorAll(`[name="q_${q.id}"]:checked`);
                        answer.answer_options = Array.from(inputs).map(i => parseInt(i.value));
                    } else if (['mcq_single', 'yes_no'].includes(q.question_type)) {
                        const input = document.querySelector(`[name="q_${q.id}"]:checked`);
                        answer.answer_options = input ? [parseInt(input.value)] : [];
                    } else if (q.question_type === 'dropdown') {
                        const input = document.querySelector(`[name="q_${q.id}"]`);
                        answer.answer_options = input?.value ? [parseInt(input.value)] : [];
                    }

                    return answer;
                });

                const res = await fetch(`${API}/api/feedback/f/${shareCode}/submit`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': 'Bearer ' + token } : {})
                    },
                    body: JSON.stringify({ answers })
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.detail || 'Failed to submit');
                }

                showSuccess();
            } catch (e) {
                alert('Error: ' + e.message);
                btn.disabled = false;
                btn.innerHTML = '<span class="material-symbols-rounded text-lg">send</span> Submit Feedback';
            }
        }

        $('submitBtn').addEventListener('click', submit);
        load();
