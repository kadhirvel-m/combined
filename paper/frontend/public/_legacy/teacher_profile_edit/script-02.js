// Extracted from ui/teacher_profile_edit.html (inline <script> #2).
        const API_BASE = (window.API_BASE || 'http://0.0.0.0:10000').replace(/\/$/, '');

        function getToken() {
            const keys = ['px_token', 'teacherToken', 'userToken', 'sb-access-token', 'supabase.auth.token'];
            for (const k of keys) {
                try { const v = localStorage.getItem(k); if (v) return v; } catch { }
            }
            return '';
        }

        function initials(name) {
            if (!name) return 'T';
            const parts = String(name).trim().split(/\s+/).slice(0, 2);
            return parts.map(x => x[0]?.toUpperCase()).join('') || 'T';
        }

        async function fetchProfileDirect() {
            const tk = getToken();
            if (!tk) return null;
            try {
                const r = await fetch(`${API_BASE}/api/teacher/profile/me`, { headers: { Authorization: 'Bearer ' + tk } });
                if (!r.ok) return null;
                const j = await r.json();
                return j.teacher || j.profile || j || null;
            } catch (err) {
                console.debug('[EDIT_PROFILE] fetchProfileDirect error', err);
                return null;
            }
        }

        function fillForm(p) {
            if (!p) return;
            const f = document.getElementById('profileForm');
            f.headline.value = p.headline || '';
            f.bio.value = p.bio || '';
            f.qualification.value = p.qualification || '';
            f.years_experience.value = p.years_experience || '';
            f.specialization.value = (p.specialization || []).join(', ');
            f.phone.value = p.phone || '';
        }

        function fillIdentity(p) {
            document.getElementById('displayName').textContent = p.name || '—';
            document.getElementById('displayEmail').textContent = p.email || '—';
            document.getElementById('displayCollege').textContent = p.college_name || p.college_id || '—';
            document.getElementById('displayDepartment').textContent = p.department_name || p.department_id || '—';

            // Avatar
            const avatarInitials = document.getElementById('avatarInitials');
            const avatarImg = document.getElementById('avatarImg');
            avatarInitials.textContent = initials(p.name);

            if (p.avatar_url || p.profile_image_url) {
                avatarImg.src = p.avatar_url || p.profile_image_url;
                avatarImg.classList.remove('hidden');
                avatarInitials.classList.add('hidden');
            }
        }

        function showStatus(message, isError = false) {
            const statusEl = document.getElementById('status');
            statusEl.textContent = message;
            statusEl.classList.remove('hidden');
            if (isError) {
                statusEl.className = 'rounded-xl px-4 py-3 text-sm font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
            } else {
                statusEl.className = 'rounded-xl px-4 py-3 text-sm font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
            }
        }

        async function load() {
            const token = getToken();
            if (!token) {
                showStatus('Login required (no token found)', true);
                return;
            }

            const prof = await fetchProfileDirect();
            if (!prof) {
                showStatus('Login required (profile not accessible)', true);
                return;
            }

            fillForm(prof);
            fillIdentity(prof);
            showStatus('Profile loaded successfully');
            setTimeout(() => document.getElementById('status').classList.add('hidden'), 2000);
        }

        // Reset button
        document.getElementById('resetBtn').addEventListener('click', async () => {
            showStatus('Resetting...');
            await load();
            showStatus('Reset to saved values');
            setTimeout(() => document.getElementById('status').classList.add('hidden'), 2000);
        });

        // Form submit
        document.getElementById('profileForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const f = e.target;
            const tk = getToken();
            if (!tk) { alert('Login required'); return; }

            showStatus('Saving...');

            const body = {
                headline: f.headline.value || null,
                bio: f.bio.value || null,
                qualification: f.qualification.value || null,
                years_experience: f.years_experience.value ? Number(f.years_experience.value) : null,
                specialization: f.specialization.value ? f.specialization.value.split(',').map(s => s.trim()).filter(Boolean) : null,
                phone: f.phone.value ? f.phone.value.trim() : null
            };

            try {
                const r = await fetch(API_BASE + '/api/teacher/profile/me', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + tk },
                    body: JSON.stringify(body)
                });
                const j = await r.json();
                if (!r.ok) throw new Error(j.detail || 'Save failed');
                showStatus('Saved successfully ✓');
            } catch (err) {
                showStatus('Error: ' + err.message, true);
            }
        });

        // Header save button
        document.getElementById('saveBtn').addEventListener('click', () => {
            document.getElementById('profileForm').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        });

        // Avatar change
        document.getElementById('changeAvatarBtn').addEventListener('click', () => document.getElementById('avatarFile').click());
        document.getElementById('avatarFile').addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const tk = getToken();
            if (!tk) { alert('Login required'); return; }

            showStatus('Uploading avatar...');
            const form = new FormData();
            form.append('file', file);

            const endpoints = ['/api/teacher/profile/me/avatar', '/api/teacher/profile/avatar'];
            let success = false, lastErr = null;

            for (const ep of endpoints) {
                try {
                    const r = await fetch(API_BASE + ep, { method: 'POST', headers: { Authorization: 'Bearer ' + tk }, body: form });
                    const j = await r.json().catch(() => ({}));
                    if (!r.ok) throw new Error(j.detail || ('Upload failed ' + r.status));

                    const avatarImg = document.getElementById('avatarImg');
                    const avatarInitials = document.getElementById('avatarInitials');
                    avatarImg.src = j.profile_image_url;
                    avatarImg.classList.remove('hidden');
                    avatarInitials.classList.add('hidden');
                    showStatus('Avatar updated ✓');
                    success = true;
                    break;
                } catch (err) {
                    lastErr = err;
                }
            }
            if (!success) {
                showStatus('Avatar error: ' + (lastErr ? lastErr.message : 'Unknown'), true);
            }
        });

        // Theme toggle
        document.addEventListener('click', e => {
            if (e.target.closest('[data-theme-toggle]')) {
                const root = document.documentElement;
                const isDark = root.classList.toggle('dark');
                localStorage.setItem('px_theme', isDark ? 'dark' : 'light');
            }
        });

        load();
