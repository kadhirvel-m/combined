// Extracted from ui/teachers/notes/manage_notes.html (inline <script> #3).
        const token = localStorage.getItem('teacherToken') || localStorage.getItem('px_auth_token');
        if (!token) {
            window.location.href = '../teacher_login.html';
        }
        const API_BASE = window.API_BASE || window.__API_BASE || location.origin;
        const notesTbody = document.getElementById('notesTbody');
        const notesStatus = document.getElementById('notesStatus');
        const editModal = document.getElementById('editModal');
        const editForm = document.getElementById('editForm');
        const editFeedback = document.getElementById('editFeedback');
        const editTitle = document.getElementById('editTitle');
        const editDescription = document.getElementById('editDescription');
        const editFile = document.getElementById('editFile');
        const currentFileName = document.getElementById('currentFileName');
        const editNoteId = document.getElementById('editNoteId');

        let notesCache = [];
        let currentEditingNote = null;

        async function fetchJSON(url, opts = {}) {
            const res = await fetch(url, opts);
            if (!res.ok) {
                let detail = `HTTP ${res.status}`;
                try {
                    const data = await res.json();
                    if (data && data.detail) detail = data.detail;
                } catch (err) {
                    /* ignore */
                }
                throw new Error(detail);
            }
            return res.json();
        }

        function renderNotes() {
            notesTbody.innerHTML = '';
            if (!notesCache.length) {
                notesTbody.innerHTML = '<tr><td colspan="5" class="py-4 text-center text-sm text-neutral-500 dark:text-white/50">No notes uploaded yet.</td></tr>';
                return;
            }
            notesCache.forEach(note => {
                const tr = document.createElement('tr');
                tr.className = 'hover:bg-black/5 dark:hover:bg-white/5 transition';
                const updatedAt = note.updated_at || note.created_at;
                tr.innerHTML = `
                    <td class="py-3 px-3 font-medium">${note.title || ''}</td>
                    <td class="py-3 px-3">${note.subject || ''}</td>
                    <td class="py-3 px-3">${note.semester || ''}</td>
                    <td class="py-3 px-3 text-xs text-neutral-500 dark:text-white/50">${updatedAt ? new Date(updatedAt).toLocaleString() : ''}</td>
                    <td class="py-3 px-3">
                        <div class="flex items-center gap-3">
                            <button class="inline-flex items-center gap-1 text-xs font-semibold text-brand-500 hover:text-brand-700"
                                data-action="edit" data-note-id="${note.id}">
                                <span class="material-symbols-rounded text-base">edit</span>Edit
                            </button>
                            <button class="inline-flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-600"
                                data-action="delete" data-note-id="${note.id}">
                                <span class="material-symbols-rounded text-base">delete</span>Delete
                            </button>
                        </div>
                    </td>
                `;
                notesTbody.appendChild(tr);
            });
        }

        async function loadNotes() {
            try {
                notesStatus.textContent = 'Refreshing...';
                const data = await fetchJSON(API_BASE + '/api/teacher/notes/mine', {
                    headers: { 'Authorization': 'Bearer ' + token }
                });
                notesCache = data.notes || [];
                renderNotes();
                notesStatus.textContent = `${notesCache.length} note${notesCache.length === 1 ? '' : 's'}`;
            } catch (err) {
                console.error('[ManageNotes] loadNotes failed', err);
                notesStatus.textContent = 'Failed to load notes';
                notesTbody.innerHTML = '<tr><td colspan="5" class="py-4 text-center text-sm text-red-500">Unable to load notes.</td></tr>';
            }
        }

        function openEdit(note) {
            currentEditingNote = note;
            editNoteId.value = note.id;
            editTitle.value = note.title || '';
            editDescription.value = note.description || '';
            editFeedback.textContent = '';
            editFile.value = '';
            currentFileName.textContent = note.original_filename || 'No file uploaded yet.';
            editModal.classList.remove('hidden');
            editModal.classList.add('show');
        }

        function closeEdit() {
            editModal.classList.add('hidden');
            editModal.classList.remove('show');
            editFeedback.textContent = '';
            editFile.value = '';
            currentEditingNote = null;
        }

        notesTbody.addEventListener('click', async (event) => {
            const btn = event.target.closest('button[data-note-id]');
            if (!btn) return;
            const noteId = btn.dataset.noteId;
            const action = btn.dataset.action;
            const note = notesCache.find(n => n.id === noteId);
            if (!note) return;
            if (action === 'edit') {
                openEdit(note);
                return;
            }
            if (action === 'delete') {
                const confirmed = confirm(`Delete "${note.title || 'this note'}"? This cannot be undone.`);
                if (!confirmed) return;
                btn.disabled = true;
                btn.classList.add('opacity-50');
                try {
                    const res = await fetch(`${API_BASE}/api/marketplace/notes/${noteId}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': 'Bearer ' + token }
                    });
                    const data = await res.json().catch(() => ({}));
                    if (!res.ok) throw new Error(data.detail || 'Delete failed');
                    await loadNotes();
                } catch (err) {
                    alert('Delete failed: ' + err.message);
                } finally {
                    btn.disabled = false;
                    btn.classList.remove('opacity-50');
                }
            }
        });

        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const noteId = editNoteId.value;
            if (!noteId) return;
            const file = editFile.files[0] || null;
            const title = editTitle.value.trim();
            if (!title) {
                editFeedback.textContent = 'Title is required.';
                return;
            }
            const description = editDescription.value.trim();
            const updates = {};
            const original = currentEditingNote || notesCache.find(n => n.id === noteId) || {};
            const originalTitle = (original.title || '').trim();
            const originalDescription = (original.description || '').trim();
            if (title !== originalTitle) {
                updates.title = title;
            }
            if (description !== originalDescription) {
                updates.description = description;
            }
            if (!Object.keys(updates).length && !file) {
                editFeedback.textContent = 'No changes to save.';
                return;
            }
            try {
                if (Object.keys(updates).length) {
                    editFeedback.textContent = 'Saving details...';
                    const res = await fetch(`${API_BASE}/api/marketplace/notes/${noteId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + token
                        },
                        body: JSON.stringify(updates)
                    });
                    const data = await res.json().catch(() => ({}));
                    if (!res.ok) throw new Error(data.detail || 'Update failed');
                }
                if (file) {
                    editFeedback.textContent = 'Uploading new file...';
                    const fd = new FormData();
                    fd.append('file', file);
                    const fileRes = await fetch(`${API_BASE}/api/marketplace/notes/${noteId}/replace-file`, {
                        method: 'POST',
                        headers: { 'Authorization': 'Bearer ' + token },
                        body: fd
                    });
                    const fileData = await fileRes.json().catch(() => ({}));
                    if (!fileRes.ok) throw new Error(fileData.detail || 'File replace failed');
                    currentFileName.textContent = file.name;
                    editFile.value = '';
                }
                await loadNotes();
                currentEditingNote = notesCache.find(n => n.id === noteId) || null;
                if (currentEditingNote && !file) {
                    currentFileName.textContent = currentEditingNote.original_filename || currentFileName.textContent;
                }
                editFeedback.textContent = 'Changes saved.';
                setTimeout(() => closeEdit(), 400);
            } catch (err) {
                editFeedback.textContent = 'Error: ' + err.message;
            }
        });

        document.getElementById('cancelEditBtn').addEventListener('click', closeEdit);
        document.getElementById('closeModalBtn').addEventListener('click', closeEdit);
        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) closeEdit();
        });

        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-theme-toggle]')) {
                const root = document.documentElement;
                const dark = root.classList.toggle('dark');
                localStorage.setItem('px_theme', dark ? 'dark' : 'light');
            }
        });

        loadNotes();
