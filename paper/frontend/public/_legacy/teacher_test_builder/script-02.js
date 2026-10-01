// Extracted from ui/teacher_test_builder.html (inline <script> #2).
        const $ = (s, r = document) => r.querySelector(s);
        const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

        $('#themeToggle')?.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            localStorage.setItem('px_theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
        });

        function showAlert(msg) {
            const alertBox = $('#alert');
            if (!alertBox) return;
            alertBox.textContent = msg;
            alertBox.classList.remove('hidden');
            setTimeout(() => alertBox.classList.add('hidden'), 3500);
        }

        function getToken() {
            const keys = ['px_token', 'teacherToken', 'userToken', 'sb-access-token', 'supabase.auth.token'];
            for (const k of keys) {
                try { const v = localStorage.getItem(k); if (v) return v; } catch { }
            }
            return '';
        }

        let API_BASE = '';
        async function resolveApi() {
            if (API_BASE) return API_BASE;
            const b = (window.__API_BASE || window.API_BASE || '').replace(/\/$/, '');
            if (b) { API_BASE = b; return b; }
            await new Promise(r => setTimeout(r, 60));
            return resolveApi();
        }

        const classesList = $('#classesList');
        const selectedLabel = $('#selectedLabel');

        let classes = [];
        let selectedMode = 'open'; // 'open' | 'class'
        let selectedClassId = null;

        function classMeta(c) {
            const parts = [];
            if (c.section) parts.push(`Sec ${c.section}`);
            if (c.batch_range) parts.push(c.batch_range);
            if (c.semester) parts.push(`Sem ${c.semester}`);
            return parts.join(' • ');
        }

        function setSelection(mode, classId) {
            selectedMode = mode;
            selectedClassId = classId || null;

            if (selectedMode === 'open') {
                selectedLabel.textContent = 'Selected: Open to all (any signed-in user)';
            } else {
                const c = classes.find(x => String(x.id) === String(selectedClassId));
                selectedLabel.textContent = `Selected: ${c?.subject || 'Class'}`;
            }

            renderClasses();
        }

        function renderClasses() {
            if (!classesList) return;

            const openCard = `
                <button id="openToAllBtn" type="button"
                    class="w-full text-left p-4 rounded-2xl ring-1 ${selectedMode === 'open' ? 'ring-brand-500/60 bg-brand-500/10' : 'ring-black/5 dark:ring-white/10 bg-white/70 dark:bg-white/5'} hover:ring-brand-500/50 transition">
                    <div class="flex items-start gap-3">
                        <div class="size-10 rounded-2xl bg-gradient-to-br from-brand-500/25 to-brand-700/20 grid place-items-center text-brand-700 dark:text-fuchsia-100">
                            <span class="material-symbols-rounded">public</span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="font-semibold text-sm">Open to all</div>
                            <div class="text-xs text-neutral-500 dark:text-white/60">Any signed-in user can take this test.</div>
                        </div>
                        <div class="pt-1"><span class="material-symbols-rounded text-base">arrow_forward</span></div>
                    </div>
                </button>`;

            const clsCards = classes.map(c => {
                const meta = classMeta(c);
                const active = (selectedMode === 'class' && String(selectedClassId) === String(c.id));
                return `
                    <button data-class-id="${String(c.id)}" type="button"
                        class="w-full text-left p-4 rounded-2xl ring-1 ${active ? 'ring-brand-500/60 bg-brand-500/10' : 'ring-black/5 dark:ring-white/10 bg-white/70 dark:bg-white/5'} hover:ring-brand-500/50 transition">
                        <div class="flex items-start gap-3">
                            <div class="size-10 rounded-2xl bg-gradient-to-br from-brand-500/25 to-brand-700/20 grid place-items-center text-brand-700 dark:text-fuchsia-100">
                                <span class="material-symbols-rounded">school</span>
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="font-semibold text-sm line-clamp-1">${c.subject || 'Class'}</div>
                                <div class="text-xs text-neutral-500 dark:text-white/60 line-clamp-2">${meta || '—'}</div>
                            </div>
                            <div class="pt-1"><span class="material-symbols-rounded text-base">arrow_forward</span></div>
                        </div>
                    </button>`;
            }).join('');

            if (!classes.length) {
                classesList.innerHTML = openCard + '<div class="mt-3 text-sm text-neutral-500 dark:text-white/60">No classes found for this teacher account.</div>';
            } else {
                classesList.innerHTML = `<div class="space-y-3">${openCard}${clsCards}</div>`;
            }

            $('#openToAllBtn')?.addEventListener('click', () => setSelection('open', null));
            $$('button[data-class-id]', classesList).forEach(btn => {
                btn.addEventListener('click', () => setSelection('class', btn.getAttribute('data-class-id')));
            });
        }

        async function loadClasses() {
            if (!classesList) return;
            classesList.innerHTML = '<div class="grid grid-cols-1 gap-3"><div class="h-20 rounded-2xl skeleton"></div><div class="h-20 rounded-2xl skeleton"></div><div class="h-20 rounded-2xl skeleton"></div></div>';

            const token = getToken();
            if (!token) {
                showAlert('Please sign in as teacher.');
                classes = [];
                renderClasses();
                return;
            }

            try {
                const base = await resolveApi();
                const res = await fetch(`${base}/api/teacher/profile/me?strict=1`, { headers: { Authorization: 'Bearer ' + token } });
                if (res.status === 401) { showAlert('Session expired. Please sign in.'); return; }
                if (!res.ok) throw new Error('Failed');
                const data = await res.json();
                classes = Array.isArray(data.classes) ? data.classes : [];
                renderClasses();
            } catch (e) {
                console.error(e);
                showAlert('Could not load classes.');
                classes = [];
                renderClasses();
            }
        }

        $('#refreshClasses')?.addEventListener('click', loadClasses);
        $('#continueBtn')?.addEventListener('click', () => {
            const scope = {
                mode: selectedMode,
                class: selectedMode === 'class' ? (classes.find(x => String(x.id) === String(selectedClassId)) || null) : null,
            };
            try { sessionStorage.setItem('px:testCreatorScope', JSON.stringify(scope)); } catch { }
            location.href = './teacher_test_creator.html';
        });

        document.addEventListener('DOMContentLoaded', () => {
            setSelection('open', null);
            loadClasses();
        });
