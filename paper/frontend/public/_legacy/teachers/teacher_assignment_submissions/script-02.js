// Extracted from ui/teachers/teacher_assignment_submissions.html (inline <script> #2).
        const API = window.API_BASE || location.origin;
        const token = localStorage.getItem('teacherToken') || localStorage.getItem('px_auth_token');
        if (!token) location.href = 'teacher_login.html';

        const assignmentId = new URLSearchParams(location.search).get('id');
        if (!assignmentId) location.href = 'teacher_assignments.html';

        let currentAssignment = null;
        let currentSubmissions = [];
        let currentSubmission = null;
        let allClassStudents = [];
        const $ = id => document.getElementById(id);

        function updateScoreRing() {
            const max = currentAssignment?.max_marks || 100;
            const val = parseInt($('modalMarks').value) || 0;
            const pct = Math.min(Math.max(val / max, 0), 1);
            const circumference = 264;
            $('scoreRing').style.strokeDashoffset = circumference - (circumference * pct);
            $('scorePct').textContent = Math.round(pct * 100) + '%';
        }

        function setQuickScore(pct) {
            const max = currentAssignment?.max_marks || 100;
            $('modalMarks').value = Math.round(max * pct / 100);
            updateScoreRing();
        }

        async function api(url, opts = {}) {
            const res = await fetch(url, { ...opts, headers: { ...opts.headers, 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' } });
            if (!res.ok) throw new Error();
            return res.json();
        }

        const fmtDate = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
        const badge = s => ({ pending: '<span class="badge badge-pending">Pending</span>', submitted: '<span class="badge badge-submitted">Submitted</span>', graded: '<span class="badge badge-graded">Graded</span>', draft: '<span class="badge badge-pending">Draft</span>' }[s] || s);

        function getFileIcon(name) {
            const ext = (name || '').split('.').pop().toLowerCase();
            const icons = { pdf: { icon: 'picture_as_pdf', color: 'text-red-500', bg: 'bg-red-500/15' }, doc: { icon: 'description', color: 'text-blue-500', bg: 'bg-blue-500/15' }, docx: { icon: 'description', color: 'text-blue-500', bg: 'bg-blue-500/15' }, jpg: { icon: 'image', color: 'text-emerald-500', bg: 'bg-emerald-500/15' }, jpeg: { icon: 'image', color: 'text-emerald-500', bg: 'bg-emerald-500/15' }, png: { icon: 'image', color: 'text-emerald-500', bg: 'bg-emerald-500/15' }, zip: { icon: 'folder_zip', color: 'text-amber-500', bg: 'bg-amber-500/15' } };
            return icons[ext] || { icon: 'draft', color: 'text-purple-500', bg: 'bg-purple-500/15' };
        }

        function renderSubmissions(subs) {
            const tbody = $('submissionsTable'), empty = $('noSubmissions'), max = currentAssignment?.max_marks || 100;
            if (!subs.length) { tbody.innerHTML = ''; empty.classList.remove('hidden'); return; }
            empty.classList.add('hidden');

            tbody.innerHTML = subs.map((s, idx) => {
                const files = s.file_urls || [];
                const grade = s.total_marks != null ? `<span class="font-semibold">${s.total_marks}</span><span class="text-neutral-400">/${max}</span>` : '<span class="text-neutral-400">-</span>';
                return `<tr onclick="openDetailModal(${idx})" class="fade-in" style="animation-delay: ${idx * 0.03}s">
                    <td><div class="flex items-center gap-3"><div class="w-9 h-9 rounded-full bg-purple-500/15 flex items-center justify-center font-semibold text-purple-600 text-sm">${(s.student_name || 'U')[0].toUpperCase()}</div><span class="font-medium">${s.student_name || 'Unknown'}</span></div></td>
                    <td>${badge(s.status)}</td>
                    <td class="text-sm text-neutral-500">${fmtDate(s.submitted_at)}</td>
                    <td>${files.slice(0, 2).map(f => `<span class="file-chip"><span class="material-symbols-rounded text-xs">attach_file</span>${(f.name || f.file_name || 'File').substring(0, 10)}</span>`).join(' ')}${files.length > 2 ? ' <span class="text-xs text-neutral-400">+' + (files.length - 2) + '</span>' : ''}</td>
                    <td>${grade}</td>
                </tr>`;
            }).join('');
        }

        function renderStudentsList() {
            const submittedIds = new Set(currentSubmissions.map(s => s.student_id || s.student_user_id));

            const completedStudents = [];
            const notCompletedStudents = [];

            // From submissions we have completed students
            currentSubmissions.forEach(s => {
                completedStudents.push({
                    id: s.student_id || s.student_user_id,
                    name: s.student_name || 'Unknown',
                    submittedAt: s.submitted_at,
                    status: s.status,
                    grade: s.total_marks
                });
            });

            // From class students, find not completed
            allClassStudents.forEach(st => {
                if (!submittedIds.has(st.auth_user_id) && !submittedIds.has(st.id)) {
                    notCompletedStudents.push({
                        id: st.auth_user_id || st.id,
                        name: st.name || 'Unknown',
                        email: st.email
                    });
                }
            });

            // Update counts
            $('completedCount').textContent = `${completedStudents.length} student${completedStudents.length !== 1 ? 's' : ''}`;
            $('notCompletedCount').textContent = `${notCompletedStudents.length} student${notCompletedStudents.length !== 1 ? 's' : ''}`;
            $('statNotSubmitted').textContent = notCompletedStudents.length;

            // Render completed
            const completedList = $('completedStudentsList');
            const noCompleted = $('noCompletedStudents');
            if (completedStudents.length) {
                noCompleted.classList.add('hidden');
                completedList.innerHTML = completedStudents.map((s, i) => `
                    <div class="student-card fade-in" style="animation-delay: ${i * 0.03}s">
                        <div class="student-avatar bg-emerald-500/15 text-emerald-600">${(s.name || 'U')[0].toUpperCase()}</div>
                        <div class="flex-1 min-w-0">
                            <p class="font-medium truncate">${s.name}</p>
                            <p class="text-xs text-neutral-500">${fmtDate(s.submittedAt)}</p>
                        </div>
                        <span class="${s.status === 'graded' ? 'badge badge-graded' : 'badge badge-submitted'}">${s.status === 'graded' ? `${s.grade} pts` : 'Submitted'}</span>
                    </div>
                `).join('');
            } else {
                completedList.innerHTML = '';
                noCompleted.classList.remove('hidden');
            }

            // Render not completed
            const notCompletedList = $('notCompletedStudentsList');
            const noNotCompleted = $('noNotCompletedStudents');
            if (notCompletedStudents.length) {
                noNotCompleted.classList.add('hidden');
                notCompletedList.innerHTML = notCompletedStudents.map((s, i) => `
                    <div class="student-card fade-in" style="animation-delay: ${i * 0.03}s">
                        <div class="student-avatar bg-amber-500/15 text-amber-600">${(s.name || 'U')[0].toUpperCase()}</div>
                        <div class="flex-1 min-w-0">
                            <p class="font-medium truncate">${s.name}</p>
                            <p class="text-xs text-neutral-500">${s.email || 'No email'}</p>
                        </div>
                        <span class="badge badge-not-submitted">Not Submitted</span>
                    </div>
                `).join('');
            } else {
                notCompletedList.innerHTML = '';
                noNotCompleted.classList.remove('hidden');
            }
        }

        function openDetailModal(idx) {
            currentSubmission = currentSubmissions[idx];
            if (!currentSubmission) return;

            const s = currentSubmission;
            const files = s.file_urls || [];
            const max = currentAssignment?.max_marks || 100;

            $('modalAvatar').textContent = (s.student_name || 'U')[0].toUpperCase();
            $('modalStudentName').textContent = s.student_name || 'Unknown';
            $('modalStatus').innerHTML = badge(s.status);
            $('modalSubmittedAt').textContent = 'Submitted: ' + fmtDate(s.submitted_at);
            $('modalMaxMarks').textContent = max;
            $('modalMarks').value = s.total_marks ?? '';
            $('modalFeedback').value = s.feedback || '';
            updateScoreRing();

            $('modalFiles').innerHTML = files.length ? files.map((f, i) => {
                const url = f.url || f.file_url || f;
                const name = f.name || f.file_name || 'File';
                const ext = name.split('.').pop().toUpperCase();
                return `<button onclick="event.stopPropagation();previewFile('${url}', '${name}')" class="file-chip" title="${name}">${ext}</button>`;
            }).join('') : '<span class="text-xs text-neutral-400">No files</span>';

            if (s.text_content) {
                $('modalNotesSection').classList.remove('hidden');
                $('modalNotes').textContent = s.text_content;
            } else {
                $('modalNotesSection').classList.add('hidden');
            }

            if (files.length > 0) {
                const f = files[0];
                const url = f.url || f.file_url || f;
                const name = f.name || f.file_name || 'File';
                previewFile(url, name);
            } else {
                $('previewFileName').textContent = 'No files';
                $('previewOpenBtn').classList.add('hidden');
                $('previewFrame').srcdoc = '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-family:Inter,sans-serif;color:#999;"><p>No files submitted</p></div>';
            }

            $('detailModal').classList.remove('hidden');
        }

        function previewFile(url, name) {
            $('previewArea').classList.remove('hidden');
            $('previewFileName').textContent = name;
            $('previewOpenBtn').href = url;
            $('previewOpenBtn').classList.remove('hidden');

            const ext = name.split('.').pop().toLowerCase();
            if (['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
                $('previewFrame').src = url;
            } else {
                $('previewFrame').srcdoc = `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-family:Inter,sans-serif;color:#666;"><div style="text-align:center;"><div style="font-size:48px;margin-bottom:16px;">📄</div><p>Preview not available for .${ext} files</p><p style="margin-top:8px;font-size:13px;">Click "Open" to view in new tab</p></div></div>`;
            }
        }

        function closeDetailModal() {
            $('detailModal').classList.add('hidden');
            $('previewFrame').src = '';
            currentSubmission = null;
        }

        async function saveGrade() {
            if (!currentSubmission) return;
            const marks = parseInt($('modalMarks').value);
            const feedback = $('modalFeedback').value;
            if (isNaN(marks)) { alert('Enter valid marks'); return; }

            try {
                await api(`${API}/api/assignments/${assignmentId}/submissions/${currentSubmission.id}/grade`, {
                    method: 'PUT',
                    body: JSON.stringify({ total_marks: marks, feedback })
                });
                closeDetailModal();
                loadData();
            } catch (e) { alert('Failed to save'); }
        }

        function renderDuplicates(dups) {
            $('statDuplicates').textContent = dups.length;
            if (!dups.length) { $('duplicatesList').innerHTML = ''; $('noDuplicates').classList.remove('hidden'); return; }
            $('noDuplicates').classList.add('hidden');
            $('duplicatesList').innerHTML = dups.map(d => `<div class="p-4 rounded-xl bg-red-500/5 border border-red-200 dark:border-red-500/20"><div class="flex items-center gap-2 mb-3"><span class="material-symbols-rounded text-red-500">content_copy</span><span class="font-semibold">${d.count} identical</span><span class="text-xs text-neutral-400">(${(d.file_size_bytes / 1024).toFixed(1)}KB)</span></div><div class="grid sm:grid-cols-2 gap-2">${d.submissions.map(s => `<div class="flex items-center gap-2 text-sm p-2 rounded-lg bg-white/50 dark:bg-white/5"><span class="material-symbols-rounded text-xs text-neutral-400">person</span>${s.student_name}<span class="text-neutral-300">—</span><span class="text-xs text-neutral-400 truncate">${s.file_name}</span></div>`).join('')}</div></div>`).join('');
        }

        function renderAnalytics(ana) {
            if (!ana) return;
            const dist = ana.grade_distribution || {};
            const maxC = Math.max(...Object.values(dist), 1);
            $('gradeChart').innerHTML = Object.entries(dist).map(([r, c]) => `<div class="flex items-center gap-3"><span class="text-xs w-12 text-neutral-500">${r}</span><div class="flex-1 h-5 bg-black/[.04] dark:bg-white/[.08] rounded-md overflow-hidden"><div class="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-md" style="width:${(c / maxC) * 100}%"></div></div><span class="text-xs w-6 text-right font-medium">${c}</span></div>`).join('');
            $('avgGrade').textContent = ana.average_grade ?? '-';
            $('maxGrade').textContent = ana.max_grade ?? '-';
            $('minGrade').textContent = ana.min_grade ?? '-';
            $('lateCount').textContent = ana.late_submissions ?? 0;
        }

        function updateProgress() {
            const submitted = currentSubmissions.filter(s => s.status !== 'pending' && s.status !== 'draft').length;
            const graded = currentSubmissions.filter(s => s.status === 'graded').length;
            const pct = submitted ? Math.round((graded / submitted) * 100) : 0;
            $('statSubmitted').textContent = submitted;
            $('statGraded').textContent = graded;
            $('statPending').textContent = submitted - graded;
            $('progressPct').textContent = pct + '%';
            $('progressText').textContent = `${graded} of ${submitted} graded`;
            const circumference = 163.36;
            $('progressRing').style.strokeDashoffset = circumference - (circumference * pct / 100);
        }

        async function loadData() {
            try {
                // Fetch submissions
                const data = await api(`${API}/api/assignments/${assignmentId}/submissions`);
                currentAssignment = data.assignment;
                currentSubmissions = data.submissions || [];

                $('assignmentTitle').textContent = currentAssignment?.title || 'Submissions';
                $('dueDate').textContent = 'Due: ' + fmtDate(currentAssignment?.due_date);
                $('maxMarksLabel').textContent = (currentAssignment?.max_marks || 100) + ' pts';
                $('editLink').href = `teacher_assignment_create.html?id=${assignmentId}`;

                // Try to fetch class students if we have a class_id
                if (currentAssignment?.class_id) {
                    try {
                        const classData = await api(`${API}/api/teacher/classes/${currentAssignment.class_id}/students`);
                        allClassStudents = classData.students || [];
                        $('studentCount').textContent = (classData.total || allClassStudents.length) + ' Students';
                        if (currentAssignment.section) {
                            $('classLabel').textContent = `Sec ${currentAssignment.section}`;
                            $('classLabel').classList.remove('hidden');
                        }
                    } catch (e) {
                        // Fallback - no class students available
                        allClassStudents = [];
                        $('studentCount').textContent = currentSubmissions.length + ' Submissions';
                    }
                }

                updateProgress();
                renderSubmissions(currentSubmissions);
                renderStudentsList();

                // Fetch additional data
                const [dupData, anaData] = await Promise.all([
                    api(`${API}/api/assignments/${assignmentId}/duplicates`).catch(() => ({ duplicates: [] })),
                    api(`${API}/api/assignments/${assignmentId}/analytics`).catch(() => ({ analytics: {} }))
                ]);
                renderDuplicates(dupData.duplicates || []);
                renderAnalytics(anaData.analytics || {});
                $('lateCount').textContent = anaData.analytics?.late_submissions || 0;
            } catch (e) { console.error(e); }
        }

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                ['submissions', 'students', 'duplicates', 'analytics'].forEach(t => $('tab-' + t).classList.toggle('hidden', btn.dataset.tab !== t));
            };
        });

        $('duplicatesCard').onclick = () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === 'duplicates'));
            ['submissions', 'students', 'duplicates', 'analytics'].forEach(t => $('tab-' + t).classList.toggle('hidden', t !== 'duplicates'));
        };

        loadData();
