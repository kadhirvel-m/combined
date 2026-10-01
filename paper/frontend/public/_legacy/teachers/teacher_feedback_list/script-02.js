// Extracted from ui/teachers/teacher_feedback_list.html (inline <script> #2).
        document.getElementById('year').textContent = new Date().getFullYear();

        // Theme toggle
        document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.documentElement.classList.toggle('dark');
                localStorage.setItem('px_theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
            });
        });

        const API = window.API_BASE || location.origin;
        const token = localStorage.getItem('teacherToken') || localStorage.getItem('px_auth_token');
        if (!token) location.href = 'teacher_login.html';

        let allForms = [];
        const $ = id => document.getElementById(id);

        async function fetchJSON(url, options = {}) {
            const res = await fetch(url, {
                ...options,
                headers: { Authorization: 'Bearer ' + token, ...options.headers }
            });
            if (!res.ok) throw new Error(res.statusText);
            return res.json();
        }

        function getStatusBadge(status) {
            const badges = {
                draft: { class: 'bg-neutral-100 dark:bg-white/10 text-neutral-600 dark:text-white/60', text: 'Draft' },
                published: { class: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400', text: 'Published' },
                closed: { class: 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400', text: 'Closed' }
            };
            return badges[status] || badges.draft;
        }

        function formatDate(d) {
            if (!d) return '-';
            return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }

        function getShareUrl(shareCode) {
            return `${location.origin}/ui/feedback_submit.html?code=${shareCode}`;
        }

        function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                const toast = $('copyToast');
                toast.classList.remove('opacity-0', 'pointer-events-none');
                setTimeout(() => toast.classList.add('opacity-0', 'pointer-events-none'), 2000);
            });
        }

        function renderFormCard(form, idx) {
            const badge = getStatusBadge(form.status);
            const hasShareCode = form.share_code && form.status === 'published';

            return `
                <div class="glass-panel rounded-2xl p-5 animate-fadeUp flex flex-col" style="animation-delay: ${idx * 0.05}s">
                    <div class="flex items-start justify-between gap-3 mb-3">
                        <h3 class="font-semibold text-base leading-snug line-clamp-2">${form.title || 'Untitled Form'}</h3>
                        <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${badge.class}">${badge.text}</span>
                    </div>
                    <p class="text-xs text-neutral-500 dark:text-white/50 line-clamp-2 mb-4 flex-1">${form.description || 'No description'}</p>
                    
                    <!-- Stats -->
                    <div class="flex items-center gap-4 text-xs mb-4">
                        <div class="flex items-center gap-1 text-brand-600 dark:text-brandlt-300">
                            <span class="material-symbols-rounded text-base">groups</span>
                            <span class="font-semibold">${form.response_count || 0}</span>
                            <span class="text-neutral-500 dark:text-white/50">responses</span>
                        </div>
                        <div class="text-neutral-500 dark:text-white/50">
                            ${formatDate(form.created_at)}
                        </div>
                    </div>
                    
                    <!-- Actions -->
                    <div class="flex items-center gap-2 pt-3 border-t border-black/5 dark:border-white/10">
                        ${form.status === 'draft' ? `
                            <a href="teacher_feedback_create.html?id=${form.id}" class="flex-1 inline-flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition">
                                <span class="material-symbols-rounded text-sm">edit</span>
                                Edit
                            </a>
                            <button onclick="publishForm('${form.id}')" class="flex-1 inline-flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-lg ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5 transition">
                                <span class="material-symbols-rounded text-sm">publish</span>
                                Publish
                            </button>
                        ` : `
                            <a href="teacher_feedback_responses.html?id=${form.id}" class="flex-1 inline-flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition">
                                <span class="material-symbols-rounded text-sm">visibility</span>
                                Responses
                            </a>
                            ${hasShareCode ? `
                                <button onclick="copyToClipboard('${getShareUrl(form.share_code)}')" class="inline-flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-lg ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5 transition" title="Copy link">
                                    <span class="material-symbols-rounded text-sm">link</span>
                                </button>
                            ` : ''}
                        `}
                        <button onclick="deleteForm('${form.id}')" class="inline-flex items-center justify-center text-xs p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500 transition" title="Delete">
                            <span class="material-symbols-rounded text-sm">delete</span>
                        </button>
                    </div>
                </div>
            `;
        }

        async function publishForm(formId) {
            if (!confirm('Publish this form? Students will be able to submit responses.')) return;

            try {
                await fetchJSON(API + '/api/feedback/forms/' + formId + '/publish', { method: 'POST' });
                loadForms();
            } catch (e) {
                alert('Failed to publish: ' + e.message);
            }
        }

        async function deleteForm(formId) {
            if (!confirm('Delete this form? This cannot be undone.')) return;

            try {
                await fetchJSON(API + '/api/feedback/forms/' + formId, { method: 'DELETE' });
                loadForms();
            } catch (e) {
                alert('Failed to delete: ' + e.message);
            }
        }

        function render() {
            $('loadingState').classList.add('hidden');

            // Stats
            const published = allForms.filter(f => f.status === 'published').length;
            const totalResponses = allForms.reduce((sum, f) => sum + (f.response_count || 0), 0);
            $('statTotal').textContent = allForms.length;
            $('statPublished').textContent = published;
            $('statResponses').textContent = totalResponses;

            if (!allForms.length) {
                $('contentArea').classList.add('hidden');
                $('emptyState').classList.remove('hidden');
                return;
            }

            $('emptyState').classList.add('hidden');
            $('contentArea').innerHTML = allForms.map((f, i) => renderFormCard(f, i)).join('');
            $('contentArea').classList.remove('hidden');
        }

        async function loadForms() {
            try {
                const data = await fetchJSON(API + '/api/feedback/forms');
                allForms = data.forms || [];
                render();
            } catch (e) {
                console.error(e);
                $('loadingState').innerHTML = `
                    <div class="col-span-full glass-panel rounded-2xl p-10 text-center">
                        <span class="material-symbols-rounded text-4xl text-red-500 mb-3 block">error</span>
                        <h3 class="font-semibold text-lg mb-2">Failed to load forms</h3>
                        <p class="text-neutral-600 dark:text-white/60 mb-4">${e.message}</p>
                        <button onclick="loadForms()" class="px-4 py-2 bg-brand-500 text-white rounded-full text-sm font-medium hover:shadow-glow transition">Try Again</button>
                    </div>
                `;
            }
        }

        loadForms();
