// Extracted from ui/assignment_result.html (inline <script> #2).
        const API = (window.API_BASE || location.origin), token = localStorage.getItem('px_token');
        if (!token) { alert('Login required'); location.href = 'login.html'; }
        const aId = new URLSearchParams(location.search).get('id');
        if (!aId) { location.href = 'assignments.html'; }
        async function api(u) { const r = await fetch(u, { headers: { 'Authorization': 'Bearer ' + token } }); if (!r.ok) throw new Error(); return r.json(); }
        function fmt(d) { return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'; }
        async function load() {
            try {
                const { assignment: a } = await api(API + '/api/student/assignments/' + aId);
                document.getElementById('assignmentTitle').textContent = a.title;
                const sub = a.my_submission;
                if (!sub || sub.status !== 'graded') { document.getElementById('gradeLabel').textContent = 'Not graded yet'; return; }
                const score = sub.total_marks || 0, max = a.max_marks || 100, pct = Math.round((score / max) * 100);
                document.getElementById('gradeScore').textContent = score;
                document.getElementById('gradeMax').textContent = '/' + max;
                document.getElementById('gradeLabel').textContent = pct >= 90 ? 'Excellent!' : pct >= 70 ? 'Good work!' : pct >= 50 ? 'Passing' : 'Keep trying!';
                document.getElementById('submittedAt').textContent = 'Submitted: ' + fmt(sub.submitted_at);
                const circle = document.getElementById('gradeCircle');
                circle.className = 'grade-ring mx-auto mb-4 ring-8 ' + (pct >= 70 ? 'ring-emerald-500/30' : 'ring-amber-500/30');
                if (sub.feedback) { document.getElementById('feedbackContent').innerHTML = '<p>' + sub.feedback + '</p>'; } else { document.getElementById('feedbackSection').classList.add('hidden'); }
                const rubs = sub.rubric_breakdown || [];
                if (rubs.length) { document.getElementById('rubricBreakdown').innerHTML = rubs.map(r => `<div class="flex justify-between items-center p-3 bg-neutral-50 dark:bg-white/5 rounded-lg"><div><p class="font-medium">${r.criterion}</p><p class="text-xs text-neutral-500">${r.feedback || ''}</p></div><span class="font-semibold">${r.marks}/${r.max_points}</span></div>`).join(''); } else { document.getElementById('rubricSection').classList.add('hidden'); }
                const files = sub.file_urls || [];
                if (files.length) { document.getElementById('filesList').innerHTML = files.map(f => `<a href="${f.url || f}" target="_blank" class="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-white/5 rounded-lg hover:bg-neutral-100 dark:hover:bg-white/10"><span class="material-symbols-rounded text-neutral-400">description</span><span class="flex-1 truncate">${f.name || 'File'}</span><span class="material-symbols-rounded text-sm">open_in_new</span></a>`).join(''); } else { document.getElementById('filesSection').classList.add('hidden'); }
            } catch (e) { console.error(e); document.getElementById('gradeLabel').textContent = 'Error loading result'; }
        }
        load();
