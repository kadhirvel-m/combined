// Extracted from ui/assignments.html (inline <script> #2).
        const API = window.API_BASE || location.origin;
        const token = localStorage.getItem('px_token');
        if (!token) { location.href = 'login.html'; }

        let data = [], filter = 'all';

        const status = a => {
            if (a.is_graded) return 'graded';
            if (a.is_submitted) return 'submitted';
            if (new Date(a.due_date) < new Date()) return 'overdue';
            return 'pending';
        };

        const fmtDate = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-';

        const dueText = (d, sub) => {
            if (sub) return '<span class="text-emerald-600 dark:text-emerald-400">Submitted</span>';
            const diff = Math.ceil((new Date(d) - Date.now()) / 864e5);
            if (diff < 0) return `<span class="text-red-500">Overdue</span>`;
            if (diff === 0) return '<span class="text-amber-500">Due today</span>';
            if (diff === 1) return '<span class="text-amber-500">Tomorrow</span>';
            if (diff <= 3) return `<span class="text-amber-500">${diff}d left</span>`;
            return fmtDate(d);
        };

        const badge = s => ({
            pending: '<span class="badge badge-pending"><span class="material-symbols-rounded text-xs">schedule</span>Pending</span>',
            submitted: '<span class="badge badge-submitted"><span class="material-symbols-rounded text-xs">check</span>Submitted</span>',
            graded: '<span class="badge badge-graded"><span class="material-symbols-rounded text-xs">grade</span>Graded</span>',
            overdue: '<span class="badge badge-overdue"><span class="material-symbols-rounded text-xs">warning</span>Overdue</span>'
        }[s] || '');

        function render() {
            const list = document.getElementById('list'), empty = document.getElementById('empty');
            let items = filter === 'all' ? data : data.filter(a => status(a) === filter);

            document.getElementById('sTotal').textContent = data.length;
            document.getElementById('sPending').textContent = data.filter(a => status(a) === 'pending').length;
            document.getElementById('sSubmitted').textContent = data.filter(a => status(a) === 'submitted').length;
            document.getElementById('sGraded').textContent = data.filter(a => status(a) === 'graded').length;

            if (!items.length) { list.innerHTML = ''; empty.classList.remove('hidden'); return; }
            empty.classList.add('hidden');

            list.innerHTML = items.map(a => {
                const s = status(a);
                const action = s === 'graded'
                    ? `<a href="assignment_result.html?id=${a.id}" class="btn-primary"><span class="material-symbols-rounded text-base">visibility</span>View Result</a>`
                    : s === 'overdue' && !a.is_submitted
                        ? '<span class="text-sm text-red-500">Closed</span>'
                        : `<a href="assignment_submit.html?id=${a.id}" class="btn-primary"><span class="material-symbols-rounded text-base">${a.is_submitted ? 'edit' : 'upload_file'}</span>${a.is_submitted ? 'Edit' : 'Submit'}</a>`;

                return `<div class="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">${badge(s)}<span class="text-xs">${dueText(a.due_date, a.is_submitted)}</span></div>
                        <h3 class="font-semibold truncate">${a.title}</h3>
                        <p class="text-sm text-neutral-500 truncate">${a.description || 'No description'}</p>
                        <div class="flex items-center gap-4 mt-2 text-xs text-neutral-400"><span class="flex items-center gap-1"><span class="material-symbols-rounded text-sm">grade</span>${a.max_marks || 100} pts</span></div>
                    </div>
                    <div class="flex-shrink-0">${action}</div>
                </div>`;
            }).join('');
        }

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                filter = btn.dataset.f;
                render();
            };
        });

        (async () => {
            try {
                const res = await fetch(`${API}/api/student/assignments`, { headers: { Authorization: 'Bearer ' + token } });
                if (!res.ok) throw new Error();
                const json = await res.json();
                data = json.assignments || json || [];
                render();
            } catch (e) {
                document.getElementById('list').innerHTML = '<p class="text-center text-red-500 py-8">Failed to load</p>';
            }
        })();
