// Extracted from ui/teachers/teacher_assignments.html (inline <script> #2).
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

        let allAssignments = [];
        let allClasses = [];
        let currentFilter = 'all';

        const $ = id => document.getElementById(id);
        const debounce = (fn, delay) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), delay); }; };

        async function fetchJSON(url) {
            const res = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
            if (!res.ok) throw new Error(res.statusText);
            return res.json();
        }

        function fmtDate(d) {
            if (!d) return '-';
            return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }

        function getDueBadge(dateString) {
            if (!dateString) return { class: 'bg-neutral-100 dark:bg-white/10 text-neutral-500', text: 'No due date' };
            const date = new Date(dateString);
            const now = new Date();
            const diff = Math.ceil((date - now) / (1000 * 60 * 60 * 24));

            if (diff < 0) return { class: 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400', text: `Overdue ${Math.abs(diff)}d` };
            if (diff === 0) return { class: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400', text: 'Due Today' };
            if (diff <= 3) return { class: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400', text: `Due in ${diff}d` };
            return { class: 'bg-neutral-100 dark:bg-white/10 text-neutral-600 dark:text-white/60', text: fmtDate(date) };
        }

        function groupByClass(assignments, classes) {
            const classMap = {};
            classes.forEach(c => {
                classMap[c.id] = {
                    ...c,
                    assignments: [],
                    label: [c.subject || 'Unknown Subject', c.section ? `Sec ${c.section}` : '', c.semester ? `Sem ${c.semester}` : ''].filter(Boolean).join(' • ')
                };
            });

            // Group "Unassigned" for orphan assignments
            classMap['_unassigned'] = { id: '_unassigned', label: 'General Assignments', assignments: [], student_count: 0 };

            assignments.forEach(a => {
                const cid = a.class_id || '_unassigned';
                if (classMap[cid]) {
                    classMap[cid].assignments.push(a);
                } else {
                    classMap['_unassigned'].assignments.push(a);
                }
            });

            // Only return classes that have assignments
            return Object.values(classMap).filter(c => c.assignments.length > 0);
        }

        function renderAssignmentCard(a, classStudentCount) {
            const dueBadge = getDueBadge(a.due_date);
            const submitted = a.submission_count || 0;
            const graded = a.graded_count || 0;
            const pending = submitted - graded;
            const total = classStudentCount || submitted || 0;
            const pct = total > 0 ? Math.round((submitted / total) * 100) : 0;

            const statusClass = a.status === 'published'
                ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                : 'bg-neutral-100 dark:bg-white/10 text-neutral-600 dark:text-white/60';

            return `
                <a href="teacher_assignment_submissions.html?id=${a.id}" 
                   class="block rounded-xl ring-1 ring-black/5 dark:ring-white/10 bg-white/80 dark:bg-brand-900/40 p-4 hover:ring-brand-500/40 hover:shadow-lg transition group">
                    <div class="flex items-start justify-between gap-3 mb-3">
                        <h4 class="font-semibold text-sm leading-snug group-hover:text-brand-600 dark:group-hover:text-brandlt-300 transition line-clamp-2">${a.title || 'Untitled'}</h4>
                        <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${statusClass}">${a.status || 'draft'}</span>
                    </div>
                    <p class="text-xs text-neutral-500 dark:text-white/50 line-clamp-2 mb-4">${a.description || 'No description'}</p>
                    
                    <!-- Progress Bar -->
                    <div class="mb-3">
                        <div class="flex justify-between text-[10px] mb-1">
                            <span class="text-neutral-500 dark:text-white/50">Submissions</span>
                            <span class="font-semibold">${submitted} / ${total}</span>
                        </div>
                        <div class="h-1.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                            <div class="h-full bg-brand-500 rounded-full transition-all" style="width: ${pct}%"></div>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div class="flex items-center justify-between text-xs">
                        <span class="inline-flex items-center gap-1 px-2 py-1 rounded-lg ${dueBadge.class}">
                            <span class="material-symbols-rounded text-xs">schedule</span>
                            ${dueBadge.text}
                        </span>
                        <div class="flex items-center gap-3">
                            <span class="text-emerald-600 dark:text-emerald-400" title="Graded"><span class="material-symbols-rounded text-xs filled">check_circle</span> ${graded}</span>
                            ${pending > 0 ? `<span class="text-amber-600 dark:text-amber-400" title="Pending"><span class="material-symbols-rounded text-xs">pending</span> ${pending}</span>` : ''}
                        </div>
                    </div>
                </a>
            `;
        }

        function renderClassSection(classData, idx) {
            const studentCount = classData.student_count || 0;
            const totalSubmissions = classData.assignments.reduce((sum, a) => sum + (a.submission_count || 0), 0);
            const totalGraded = classData.assignments.reduce((sum, a) => sum + (a.graded_count || 0), 0);

            return `
                <div class="glass-panel rounded-2xl overflow-hidden class-section animate-fadeUp" data-collapsed="true" style="animation-delay: ${idx * 0.08}s">
                    <div class="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-white/50 dark:hover:bg-white/5 transition-colors border-b border-black/5 dark:border-white/10" data-class-toggle>
                        <div class="flex items-center gap-3">
                            <span class="material-symbols-rounded text-neutral-500 transition-transform duration-200" data-caret>expand_more</span>
                            <div>
                                <h3 class="font-semibold text-sm">${classData.label}</h3>
                                <p class="text-[11px] text-neutral-500 dark:text-white/50">${classData.assignments.length} assignment${classData.assignments.length !== 1 ? 's' : ''}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-4">
                            ${studentCount > 0 ? `
                                <div class="text-right">
                                    <p class="text-xs font-semibold">${totalSubmissions} / ${studentCount * classData.assignments.length}</p>
                                    <p class="text-[10px] text-neutral-500 dark:text-white/50">Total Submissions</p>
                                </div>
                            ` : ''}
                            <div class="relative h-10 w-10 flex-shrink-0" title="Grading Progress">
                                <div class="absolute inset-0 rounded-full metric-ring" style="--pct: ${totalSubmissions > 0 ? Math.round((totalGraded / totalSubmissions) * 100) : 0}; --ring-color: #9E4B8A;"></div>
                                <div class="absolute inset-[3px] rounded-full bg-white dark:bg-brand-900 flex items-center justify-center text-[9px] font-bold">
                                    ${totalSubmissions > 0 ? Math.round((totalGraded / totalSubmissions) * 100) : 0}%
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="p-4 grid md:grid-cols-2 lg:grid-cols-3 gap-4 class-body">
                        ${classData.assignments.map(a => renderAssignmentCard(a, studentCount)).join('')}
                    </div>
                </div>
            `;
        }

        function toggleSection(el) {
            const collapsed = el.dataset.collapsed === 'true';
            el.dataset.collapsed = collapsed ? 'false' : 'true';
        }

        function attachClassSectionHandlers() {
            document.querySelectorAll('[data-class-toggle]').forEach(header => {
                if (header.dataset.bound === '1') return;
                header.dataset.bound = '1';
                header.addEventListener('click', () => {
                    const section = header.closest('.class-section');
                    if (section) toggleSection(section);
                });
            });
        }

        function render() {
            const search = $('searchInput').value.toLowerCase().trim();

            // Filter assignments
            let filtered = allAssignments.filter(a => {
                const matchesSearch = !search ||
                    (a.title || '').toLowerCase().includes(search) ||
                    (a.description || '').toLowerCase().includes(search);
                const matchesFilter = currentFilter === 'all' || a.status === currentFilter;
                return matchesSearch && matchesFilter;
            });

            // Update stats
            const published = allAssignments.filter(a => a.status === 'published').length;
            const draft = allAssignments.filter(a => a.status === 'draft').length;
            const needGrading = allAssignments.reduce((acc, a) => acc + (a.submission_count || 0) - (a.graded_count || 0), 0);

            $('statTotal').textContent = allAssignments.length;
            $('statPublished').textContent = published;
            $('statDraft').textContent = draft;
            $('statNeedGrading').textContent = needGrading;

            $('loadingState').classList.add('hidden');

            // Check empty state
            if (!allAssignments.length) {
                $('contentArea').classList.add('hidden');
                $('noResults').classList.add('hidden');
                $('emptyState').classList.remove('hidden');
                return;
            }

            $('emptyState').classList.add('hidden');

            if (!filtered.length) {
                $('contentArea').classList.add('hidden');
                $('noResults').classList.remove('hidden');
                return;
            }

            $('noResults').classList.add('hidden');

            // Group by class and render
            const grouped = groupByClass(filtered, allClasses);
            $('contentArea').innerHTML = grouped.map((c, i) => renderClassSection(c, i)).join('');
            attachClassSectionHandlers();
            $('contentArea').classList.remove('hidden');
        }

        async function init() {
            try {
                // Fetch both classes and assignments
                const [profileData, assignmentsData] = await Promise.all([
                    fetchJSON(API + '/api/teacher/profile/me?strict=1'),
                    fetchJSON(API + '/api/assignments')
                ]);

                allClasses = profileData.classes || [];
                allAssignments = assignmentsData.assignments || [];

                render();
            } catch (e) {
                console.error(e);
                $('loadingState').innerHTML = `
                    <div class="glass-panel rounded-2xl p-10 text-center">
                        <span class="material-symbols-rounded text-4xl text-red-500 mb-3 block">error</span>
                        <h3 class="font-semibold text-lg mb-2">Failed to load assignments</h3>
                        <p class="text-neutral-600 dark:text-white/60 mb-4">${e.message}</p>
                        <button onclick="init()" class="px-4 py-2 bg-brand-500 text-white rounded-full text-sm font-medium hover:shadow-glow transition">Try Again</button>
                    </div>
                `;
            }
        }

        // Event listeners
        $('searchInput').addEventListener('input', debounce(render, 200));

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => {
                    b.classList.remove('active', 'ring-brand-500', 'bg-brand-500/10', 'text-brand-700', 'dark:text-brandlt-200');
                    b.classList.add('ring-black/10', 'dark:ring-white/15');
                });
                btn.classList.add('active', 'ring-brand-500', 'bg-brand-500/10', 'text-brand-700', 'dark:text-brandlt-200');
                btn.classList.remove('ring-black/10', 'dark:ring-white/15');
                currentFilter = btn.dataset.filter;
                render();
            });
        });

        $('expandAllBtn').addEventListener('click', () => {
            const sections = document.querySelectorAll('.class-section');
            const allExpanded = [...sections].every(s => s.dataset.collapsed === 'false');
            sections.forEach(s => s.dataset.collapsed = allExpanded ? 'true' : 'false');
            $('expandAllBtn').querySelector('span:first-child').textContent = allExpanded ? 'unfold_more' : 'unfold_less';
            $('expandAllBtn').querySelector('span:last-child')?.remove();
            $('expandAllBtn').insertAdjacentHTML('beforeend', `<span class="hidden md:inline">${allExpanded ? 'Expand All' : 'Collapse All'}</span>`);
        });

        init();
