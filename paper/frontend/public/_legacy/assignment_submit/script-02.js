// Extracted from ui/assignment_submit.html (inline <script> #2).
        const API = window.API_BASE || location.origin;
        const token = localStorage.getItem('px_token');
        if (!token) location.href = 'login.html';
        const aId = new URLSearchParams(location.search).get('id');
        if (!aId) location.href = 'assignments.html';

        let assignment = null;
        let uploadedFiles = [];
        const $ = id => document.getElementById(id);

        const fmtDate = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
        const fmtSize = bytes => bytes < 1024 ? bytes + ' B' : bytes < 1048576 ? (bytes / 1024).toFixed(1) + ' KB' : (bytes / 1048576).toFixed(1) + ' MB';

        // Get file icon based on extension
        function getFileIcon(name) {
            const ext = (name || '').split('.').pop().toLowerCase();
            const icons = {
                pdf: { icon: 'picture_as_pdf', color: 'text-red-500', bg: 'bg-red-500/10' },
                doc: { icon: 'description', color: 'text-blue-500', bg: 'bg-blue-500/10' },
                docx: { icon: 'description', color: 'text-blue-500', bg: 'bg-blue-500/10' },
                zip: { icon: 'folder_zip', color: 'text-amber-500', bg: 'bg-amber-500/10' },
                jpg: { icon: 'image', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                jpeg: { icon: 'image', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                png: { icon: 'image', color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
            };
            return icons[ext] || { icon: 'draft', color: 'text-purple-500', bg: 'bg-purple-500/10' };
        }

        // Check if file is an image
        function isImage(name) {
            return /\.(jpg|jpeg|png|gif|webp)$/i.test(name || '');
        }

        // Render uploaded files with previews
        function renderFiles() {
            const list = $('filesList');
            const noFiles = $('noFiles');

            if (!uploadedFiles.length) {
                list.innerHTML = '';
                noFiles.classList.remove('hidden');
                return;
            }

            noFiles.classList.add('hidden');
            list.innerHTML = uploadedFiles.map((f, i) => {
                const icon = getFileIcon(f.name || f.file_name);
                const fileName = f.name || f.file_name || 'Uploaded File';
                const fileSize = f.size ? fmtSize(f.size) : '';
                const fileUrl = f.url || f.file_url || '';
                const showImg = isImage(fileName) && fileUrl;

                return `
                <div class="file-card group">
                    <div class="file-preview ${showImg ? '' : icon.bg}">
                        ${showImg
                        ? `<img src="${fileUrl}" alt="${fileName}" onerror="this.parentElement.innerHTML='<span class=\\'material-symbols-rounded text-2xl ${icon.color}\\'>${icon.icon}</span>'">`
                        : `<span class="material-symbols-rounded text-2xl ${icon.color}">${icon.icon}</span>`
                    }
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="font-medium text-sm truncate">${fileName}</p>
                        <p class="text-xs text-neutral-400">${fileSize}</p>
                    </div>
                    ${fileUrl ? `<a href="${fileUrl}" target="_blank" class="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 opacity-0 group-hover:opacity-100 transition" title="View file">
                        <span class="material-symbols-rounded text-neutral-400">open_in_new</span>
                    </a>` : ''}
                    <button onclick="removeFile(${i})" class="p-2 rounded-lg hover:bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition" title="Remove">
                        <span class="material-symbols-rounded">delete</span>
                    </button>
                </div>`;
            }).join('');
        }

        function removeFile(index) {
            uploadedFiles.splice(index, 1);
            renderFiles();
        }

        // Setup dropzone
        const dz = $('dropzone'), fi = $('fileInput');
        dz.onclick = () => fi.click();
        dz.ondragover = e => { e.preventDefault(); dz.classList.add('active'); };
        dz.ondragleave = () => dz.classList.remove('active');
        dz.ondrop = e => { e.preventDefault(); dz.classList.remove('active'); handleFiles(e.dataTransfer.files); };
        fi.onchange = e => handleFiles(e.target.files);

        async function handleFiles(fileList) {
            if (!assignment) return;
            const max = assignment.max_files || 5;
            const maxSize = (assignment.max_file_size_mb || 10) * 1024 * 1024;
            const types = (assignment.allowed_file_types || []).map(t => t.toLowerCase());

            for (const file of fileList) {
                if (uploadedFiles.length >= max) {
                    alert(`Maximum ${max} files allowed`);
                    break;
                }

                const ext = file.name.split('.').pop().toLowerCase();
                if (types.length && !types.includes(ext)) {
                    alert(`File type .${ext} not allowed`);
                    continue;
                }
                if (file.size > maxSize) {
                    alert(`File too large: ${file.name}`);
                    continue;
                }

                // Show progress
                $('progressCard').classList.remove('hidden');
                $('progressFile').textContent = file.name;
                $('progressSize').textContent = `0 / ${fmtSize(file.size)}`;

                try {
                    const fd = new FormData();
                    fd.append('file', file);
                    fd.append('assignment_id', aId);

                    const res = await fetch(`${API}/api/assignments/upload`, {
                        method: 'POST',
                        headers: { Authorization: 'Bearer ' + token },
                        body: fd
                    });

                    if (res.ok) {
                        const data = await res.json();
                        const uploaded = data.file || data;
                        uploaded.size = file.size;
                        uploaded.name = uploaded.file_name || file.name;
                        uploadedFiles.push(uploaded);
                        renderFiles();

                        // Update progress to complete
                        $('progressRing').style.strokeDashoffset = '0';
                        $('progressPct').textContent = '100%';
                        $('progressSize').textContent = `${fmtSize(file.size)} / ${fmtSize(file.size)}`;
                    } else {
                        throw new Error('Upload failed');
                    }
                } catch (e) {
                    console.error(e);
                    alert('Upload failed: ' + file.name);
                }

                // Hide progress after delay
                setTimeout(() => {
                    $('progressCard').classList.add('hidden');
                    $('progressRing').style.strokeDashoffset = '176';
                    $('progressPct').textContent = '0%';
                }, 1500);
            }
        }

        async function submit(isDraft) {
            const notes = $('notes').value.trim();

            if (!isDraft && !uploadedFiles.length && !notes) {
                $('statusMsg').textContent = 'Please upload files or add notes';
                $('statusMsg').className = 'text-sm text-center font-medium text-red-500';
                return;
            }

            $('statusMsg').textContent = isDraft ? 'Saving draft...' : 'Submitting...';
            $('statusMsg').className = 'text-sm text-center font-medium text-neutral-500';
            $('submitBtn').disabled = true;
            $('draftBtn').disabled = true;

            try {
                const res = await fetch(`${API}/api/student/assignments/${aId}/submit`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
                    body: JSON.stringify({
                        file_urls: uploadedFiles,
                        text_content: notes,
                        is_draft: isDraft
                    })
                });

                if (!res.ok) throw new Error();

                $('statusMsg').textContent = isDraft ? '✓ Draft saved!' : '✓ Submitted successfully!';
                $('statusMsg').className = 'text-sm text-center font-medium text-emerald-500';

                if (isDraft) {
                    $('statusBadge').classList.remove('hidden');
                } else {
                    setTimeout(() => location.href = 'assignments.html', 1200);
                }
            } catch (e) {
                $('statusMsg').textContent = 'Failed to submit. Please try again.';
                $('statusMsg').className = 'text-sm text-center font-medium text-red-500';
            } finally {
                $('submitBtn').disabled = false;
                $('draftBtn').disabled = false;
            }
        }

        async function submitExt() {
            const date = $('extDate').value;
            const reason = $('extReason').value.trim();

            if (!date || !reason) {
                alert('Please fill in all fields');
                return;
            }

            try {
                const res = await fetch(`${API}/api/student/assignments/${aId}/request-extension`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
                    body: JSON.stringify({ requested_date: new Date(date).toISOString(), reason })
                });

                if (!res.ok) throw new Error();

                $('extModal').classList.add('hidden');
                alert('Extension request submitted!');
            } catch (e) {
                alert('Failed to submit request');
            }
        }

        $('draftBtn').onclick = () => submit(true);
        $('submitBtn').onclick = () => submit(false);
        $('extBtn').onclick = () => $('extModal').classList.remove('hidden');

        // Load assignment data
        (async () => {
            try {
                const res = await fetch(`${API}/api/student/assignments/${aId}`, {
                    headers: { Authorization: 'Bearer ' + token }
                });

                if (!res.ok) throw new Error();

                const data = await res.json();
                assignment = data.assignment || data;

                // Update UI
                $('title').textContent = assignment.title;
                $('dueLabel').textContent = 'Due: ' + fmtDate(assignment.due_date);
                $('detailDue').textContent = fmtDate(assignment.due_date);
                $('detailPts').textContent = (assignment.max_marks || 100) + ' pts';
                $('detailFiles').textContent = assignment.max_files || 5;
                $('detailSize').textContent = (assignment.max_file_size_mb || 10) + ' MB';

                const types = (assignment.allowed_file_types || ['pdf', 'doc', 'docx']).map(t => t.toUpperCase()).join(', ');
                $('fileTypesHint').textContent = types + ' • Max ' + (assignment.max_file_size_mb || 10) + 'MB each';

                $('instructions').textContent = assignment.instructions_md || assignment.description || 'No specific instructions provided.';

                // Load existing submission
                if (assignment.my_submission) {
                    const sub = assignment.my_submission;
                    uploadedFiles = sub.file_urls || [];
                    renderFiles();
                    $('notes').value = sub.text_content || '';
                    if (sub.status === 'draft') {
                        $('statusBadge').classList.remove('hidden');
                    }
                } else {
                    $('noFiles').classList.remove('hidden');
                }
            } catch (e) {
                console.error(e);
                $('instructions').innerHTML = '<p class="text-red-500">Failed to load assignment details</p>';
            }
        })();
