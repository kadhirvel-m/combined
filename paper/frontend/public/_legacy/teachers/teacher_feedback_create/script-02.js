// Extracted from ui/teachers/teacher_feedback_create.html (inline <script> #2).
        // Theme Toggle
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
        const editId = params.get('id');
        let questions = [];
        let questionIdCounter = 0;

        const $ = id => document.getElementById(id);

        const questionTypeConfig = {
            text: { icon: 'short_text', iconClass: 'text-brand-500', label: 'Short Text', bgClass: 'bg-brand-500/10', needsOptions: false },
            textarea: { icon: 'notes', iconClass: 'text-brand-500', label: 'Long Text', bgClass: 'bg-brand-500/10', needsOptions: false },
            rating: { icon: 'star', iconClass: 'text-brand-500 filled', label: 'Star Rating', bgClass: 'bg-brand-500/10', needsOptions: false },
            scale: { icon: 'linear_scale', iconClass: 'text-brand-500', label: 'Scale 1-10', bgClass: 'bg-brand-500/10', needsOptions: false },
            mcq_single: { icon: 'radio_button_checked', iconClass: 'text-brand-500', label: 'Single Choice', bgClass: 'bg-brand-500/10', needsOptions: true },
            mcq_multiple: { icon: 'check_box', iconClass: 'text-brand-500', label: 'Multi Choice', bgClass: 'bg-brand-500/10', needsOptions: true },
            yes_no: { icon: 'thumb_up', iconClass: 'text-brand-500', label: 'Yes / No', bgClass: 'bg-brand-500/10', needsOptions: false, defaultOptions: ['Yes', 'No'] },
            dropdown: { icon: 'arrow_drop_down_circle', iconClass: 'text-brand-500', label: 'Dropdown', bgClass: 'bg-brand-500/10', needsOptions: true }
        };

        function showToast(message, success = true) {
            const toast = $('toast');
            $('toastText').textContent = message;
            $('toastIcon').textContent = success ? 'check_circle' : 'error';
            toast.classList.remove('opacity-0', 'pointer-events-none');
            setTimeout(() => toast.classList.add('opacity-0', 'pointer-events-none'), 2500);
        }

        function addQuestion(type, text = '', opts = null) {
            const config = questionTypeConfig[type];
            const id = ++questionIdCounter;
            const question = {
                _id: id,
                question_type: type,
                question_text: text,
                description: '',
                options: opts || config.defaultOptions || (config.needsOptions ? ['Option 1', 'Option 2'] : null),
                settings: { required: true }
            };
            questions.push(question);
            renderQuestions();
            showToast('Question added');
        }

        function removeQuestion(id) {
            questions = questions.filter(q => q._id !== id);
            renderQuestions();
        }

        function clearAllQuestions() {
            if (!questions.length) return;
            if (!confirm('Remove all questions?')) return;
            questions = [];
            renderQuestions();
            showToast('All questions cleared');
        }

        function addOption(questionId) {
            const q = questions.find(q => q._id === questionId);
            if (q && q.options) {
                q.options.push(`Option ${q.options.length + 1}`);
                renderQuestions();
            }
        }

        function removeOption(questionId, optionIndex) {
            const q = questions.find(q => q._id === questionId);
            if (q && q.options && q.options.length > 2) {
                q.options.splice(optionIndex, 1);
                renderQuestions();
            }
        }

        function updateQuestionText(id, value) {
            const q = questions.find(q => q._id === id);
            if (q) q.question_text = value;
        }

        function updateOption(questionId, optionIndex, value) {
            const q = questions.find(q => q._id === questionId);
            if (q && q.options) q.options[optionIndex] = value;
        }

        function renderQuestions() {
            const container = $('questionsContainer');
            const empty = $('emptyQuestions');

            $('questionCount').textContent = questions.length;

            if (!questions.length) {
                container.innerHTML = '';
                empty.classList.remove('hidden');
                return;
            }

            empty.classList.add('hidden');

            container.innerHTML = questions.map((q, idx) => {
                const config = questionTypeConfig[q.question_type];
                const optionsHtml = config.needsOptions ? `
                    <div class="mt-4 space-y-2 pl-1">
                        ${(q.options || []).map((opt, i) => `
                            <div class="flex items-center gap-2">
                                <span class="material-symbols-rounded text-sm text-neutral-300 dark:text-white/20">${q.question_type === 'mcq_single' ? 'radio_button_unchecked' : 'check_box_outline_blank'}</span>
                                <input type="text" value="${opt}" onchange="updateOption(${q._id}, ${i}, this.value)" 
                                    class="flex-1 px-3 py-2 text-sm rounded-lg input-field bg-white/60 dark:bg-white/5 outline-none"
                                    placeholder="Option ${i + 1}">
                                ${q.options.length > 2 ? `<button onclick="removeOption(${q._id}, ${i})" class="text-red-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition"><span class="material-symbols-rounded text-lg">close</span></button>` : ''}
                            </div>
                        `).join('')}
                        <button onclick="addOption(${q._id})" class="inline-flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 hover:underline mt-2 px-1">
                            <span class="material-symbols-rounded text-sm">add</span> Add option
                        </button>
                    </div>
                ` : '';

                return `
                    <div class="question-card glass-panel rounded-xl p-4" data-id="${q._id}">
                        <div class="flex items-start gap-3">
                            <div class="drag-handle pt-1">
                                <span class="material-symbols-rounded text-neutral-300 dark:text-white/20">drag_indicator</span>
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-3 mb-3">
                                    <span class="type-pill ${config.bgClass}">
                                        <span class="material-symbols-rounded text-xs ${config.iconClass}">${config.icon}</span>
                                        ${config.label}
                                    </span>
                                    <span class="text-xs text-neutral-400 font-medium">#${idx + 1}</span>
                                </div>
                                <input type="text" value="${q.question_text}" placeholder="Enter your question..." 
                                    onchange="updateQuestionText(${q._id}, this.value)"
                                    class="w-full px-0 py-1.5 text-sm font-medium bg-transparent border-0 border-b-2 border-black/5 dark:border-white/10 focus:border-brand-500 focus:outline-none transition">
                                ${optionsHtml}
                            </div>
                            <button onclick="removeQuestion(${q._id})" class="text-neutral-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition">
                                <span class="material-symbols-rounded">delete</span>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // AI Modal
        function openAiModal() {
            $('aiModal').classList.remove('hidden');
            $('aiTopic').focus();
        }

        function closeAiModal() {
            $('aiModal').classList.add('hidden');
            $('aiLoading').classList.add('hidden');
            $('aiLoading').classList.remove('flex');
        }

        async function generateWithAI() {
            const topic = $('aiTopic').value.trim();
            if (!topic) {
                showToast('Please enter what this feedback is about', false);
                return;
            }

            const requirements = $('aiRequirements').value.trim();
            const count = parseInt($('aiCount').value);
            const mix = $('aiMix').value;

            // Show loading
            $('aiLoading').classList.remove('hidden');
            $('aiLoading').classList.add('flex');

            try {
                const response = await fetch(`${API}/api/feedback/generate-questions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({
                        topic,
                        requirements,
                        count,
                        mix
                    })
                });

                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.detail || 'Failed to generate');
                }

                const data = await response.json();

                // Add generated questions
                if (data.questions && data.questions.length) {
                    data.questions.forEach(q => {
                        addQuestion(q.question_type, q.question_text, q.options);
                    });
                    showToast(`Generated ${data.questions.length} questions!`);
                } else {
                    throw new Error('No questions generated');
                }

                closeAiModal();
            } catch (e) {
                console.error(e);
                showToast(e.message || 'Failed to generate questions', false);
                $('aiLoading').classList.add('hidden');
                $('aiLoading').classList.remove('flex');
            }
        }

        // Save / Publish
        async function saveForm(publish = false) {
            const title = $('formTitle').value.trim();
            if (!title) {
                showToast('Please enter a form title', false);
                return;
            }

            if (!questions.length) {
                showToast('Please add at least one question', false);
                return;
            }

            for (const q of questions) {
                if (!q.question_text.trim()) {
                    showToast('Please fill in all question texts', false);
                    return;
                }
            }

            const payload = {
                title,
                description: $('formDesc').value.trim(),
                is_anonymous_display: $('anonDisplay').checked,
                questions: questions.map(q => ({
                    question_type: q.question_type,
                    question_text: q.question_text,
                    description: q.description,
                    options: q.options,
                    settings: q.settings
                }))
            };

            try {
                const method = editId ? 'PUT' : 'POST';
                const url = editId ? `${API}/api/feedback/forms/${editId}` : `${API}/api/feedback/forms`;

                const res = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                    body: JSON.stringify(payload)
                });

                if (!res.ok) throw new Error('Failed to save');

                const data = await res.json();
                const formId = editId || data.form?.id;

                if (publish && formId) {
                    await fetch(`${API}/api/feedback/forms/${formId}/publish`, {
                        method: 'POST',
                        headers: { 'Authorization': 'Bearer ' + token }
                    });
                }

                location.href = 'teacher_feedback_list.html';
            } catch (e) {
                showToast('Error saving form: ' + e.message, false);
            }
        }

        async function loadForm() {
            if (!editId) return;

            try {
                const res = await fetch(`${API}/api/feedback/forms/${editId}`, {
                    headers: { 'Authorization': 'Bearer ' + token }
                });

                if (!res.ok) throw new Error('Form not found');

                const form = await res.json();
                $('formTitle').value = form.title || '';
                $('formDesc').value = form.description || '';
                $('anonDisplay').checked = form.is_anonymous_display !== false;

                questions = (form.questions || []).map(q => ({
                    _id: ++questionIdCounter,
                    ...q
                }));

                renderQuestions();
            } catch (e) {
                showToast('Failed to load form', false);
                location.href = 'teacher_feedback_list.html';
            }
        }

        // Event Listeners
        $('saveBtn').addEventListener('click', () => saveForm(false));
        $('publishBtn').addEventListener('click', () => saveForm(true));
        $('aiGenerateBtn').addEventListener('click', openAiModal);

        // Initialize
        renderQuestions();
        loadForm();
