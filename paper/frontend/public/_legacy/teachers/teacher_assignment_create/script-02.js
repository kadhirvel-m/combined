// Extracted from ui/teachers/teacher_assignment_create.html (inline <script> #2).
        const API = window.API_BASE || location.origin;
        const token = localStorage.getItem('teacherToken') || localStorage.getItem('px_token');
        if (!token) { alert('Please login first'); location.href = 'teacher_login.html'; }
        const params = new URLSearchParams(location.search);
        const editId = params.get('id');

        // Live preview
        document.getElementById('title').addEventListener('input', e => {
            document.getElementById('previewTitle').textContent = e.target.value || 'Assignment Title';
        });
        document.getElementById('dueDate').addEventListener('change', e => {
            const d = new Date(e.target.value);
            document.getElementById('previewDate').textContent = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        document.getElementById('maxMarks').addEventListener('input', e => {
            document.getElementById('previewMarks').textContent = e.target.value || '100';
        });

        // Collapse toggle
        document.getElementById('advToggle').addEventListener('click', () => {
            const content = document.getElementById('advContent');
            const icon = document.getElementById('advIcon');
            content.classList.toggle('open');
            icon.style.transform = content.classList.contains('open') ? 'rotate(180deg)' : '';
        });

        // Team type toggle
        document.querySelectorAll('[name="assignment_type"]').forEach(r => {
            r.addEventListener('change', () => {
                const isTeam = document.querySelector('[name="assignment_type"]:checked').value === 'team';
                document.getElementById('teamSizeRow').classList.toggle('hidden', !isTeam);
                if (isTeam && !document.getElementById('advContent').classList.contains('open')) {
                    document.getElementById('advToggle').click();
                }
            });
        });

        // Late submission toggle
        document.getElementById('allowLate').addEventListener('change', function () {
            document.getElementById('latePenaltyRow').classList.toggle('hidden', !this.checked);
        });

        function showToast(msg, icon = 'check_circle') {
            const toast = document.getElementById('toast');
            document.getElementById('toastMsg').textContent = msg;
            document.getElementById('toastIcon').textContent = icon;
            toast.classList.remove('hidden');
            setTimeout(() => toast.classList.add('hidden'), 3000);
        }

        async function loadClasses() {
            try {
                const res = await fetch(`${API}/api/teacher/profile/me?strict=1`, { headers: { Authorization: 'Bearer ' + token } });
                if (res.ok) {
                    const data = await res.json();
                    const sel = document.getElementById('classId');
                    const classes = data.classes || [];
                    document.getElementById('classCount').textContent = classes.length;
                    classes.forEach(c => {
                        sel.insertAdjacentHTML('beforeend', `<option value="${c.id}">${c.subject || c.name || 'Class'} - Sem ${c.semester || '?'}</option>`);
                    });
                }
            } catch (e) { console.error(e); }
        }

        async function loadAssignment() {
            if (!editId) return;
            document.getElementById('pageTitle').textContent = 'Edit Assignment';
            try {
                const res = await fetch(`${API}/api/assignments/${editId}`, { headers: { Authorization: 'Bearer ' + token } });
                if (!res.ok) throw new Error('Failed to load');
                const { assignment: a } = await res.json();
                document.getElementById('title').value = a.title || '';
                document.getElementById('classId').value = a.class_id || '';
                document.getElementById('description').value = a.description || '';
                document.getElementById('maxMarks').value = a.max_marks || 100;
                document.getElementById('dueDate').value = a.due_date ? a.due_date.slice(0, 10) : '';
                document.getElementById('maxFiles').value = a.max_files || 5;
                document.getElementById('maxFileSize').value = a.max_file_size_mb || 10;
                // Trigger preview updates
                document.getElementById('title').dispatchEvent(new Event('input'));
                document.getElementById('dueDate').dispatchEvent(new Event('change'));
                document.getElementById('maxMarks').dispatchEvent(new Event('input'));
            } catch (e) { console.error(e); showToast('Failed to load', 'error'); }
        }

        async function saveAssignment(status) {
            const title = document.getElementById('title').value.trim();
            const dueDate = document.getElementById('dueDate').value;
            if (!title) { showToast('Title is required', 'error'); return; }
            if (!dueDate && status === 'published') { showToast('Due date is required', 'error'); return; }

            const fileTypes = [...document.querySelectorAll('[name="file_types"]:checked')].map(c => c.value);
            const links = document.getElementById('resourceLinks').value.split('\n').filter(Boolean);

            const payload = {
                title,
                class_id: document.getElementById('classId').value || null,
                description: document.getElementById('description').value,
                instructions_md: document.getElementById('description').value,
                assignment_type: document.querySelector('[name="assignment_type"]:checked').value,
                max_team_size: parseInt(document.getElementById('maxTeamSize').value) || 1,
                max_marks: parseInt(document.getElementById('maxMarks').value) || 100,
                due_date: dueDate ? `${dueDate}T23:59:59` : null,
                max_files: parseInt(document.getElementById('maxFiles').value) || 5,
                max_file_size_mb: parseInt(document.getElementById('maxFileSize').value) || 10,
                allowed_file_types: fileTypes,
                allow_late_submission: document.getElementById('allowLate').checked,
                late_penalty_percent: parseInt(document.getElementById('latePenalty').value) || 0,
                grace_period_hours: parseInt(document.getElementById('gracePeriod').value) || 0,
                resource_links: links,
                rubrics: [],
                status
            };

            try {
                const url = editId ? `${API}/api/assignments/${editId}` : `${API}/api/assignments`;
                const res = await fetch(url, {
                    method: editId ? 'PUT' : 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
                    body: JSON.stringify(payload)
                });
                if (!res.ok) throw new Error('Failed');
                showToast(status === 'published' ? 'Published!' : 'Draft saved!');
                setTimeout(() => location.href = 'teacher_assignments.html', 1200);
            } catch (e) {
                console.error(e);
                showToast('Failed to save', 'error');
            }
        }

        document.getElementById('saveDraftBtn').addEventListener('click', () => saveAssignment('draft'));
        document.getElementById('publishBtn').addEventListener('click', () => saveAssignment('published'));

        loadClasses();
        loadAssignment();
