// Extracted from ui/mediX/upload.html (inline <script> #4).
    const API = (window.API_BASE || location.origin).replace(/\/$/, '');
    const form = document.getElementById('uploadForm');
    const status = document.getElementById('status');
    const result = document.getElementById('result');
    const submitBtn = document.getElementById('submitBtn');
    let currentUserId = '';

    function getStoredToken() {
      const keys = ['px_token', 'teacherToken', 'userToken', 'sb-access-token', 'supabase.auth.token'];
      for (const key of keys) {
        try {
          const value = localStorage.getItem(key);
          if (value) return value;
        } catch (_) { }
      }
      return '';
    }

    function decodeJwtSub(token) {
      try {
        const parts = token.split('.');
        if (parts.length < 2) return '';
        const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const json = JSON.parse(atob(payload));
        return json.sub || json.user_id || json.uid || '';
      } catch (_) {
        return '';
      }
    }

    async function resolveCurrentUserId() {
      const token = getStoredToken();
      if (!token) return;
      const authHeaders = { Authorization: `Bearer ${token}` };
      const endpoints = [`${API}/api/me`, `${API}/api/teacher/profile/me`];

      for (const url of endpoints) {
        try {
          const res = await fetch(url, { headers: authHeaders });
          if (!res.ok) continue;
          const data = await res.json().catch(() => ({}));
          const id = data.id || data.user_id || data.auth_user_id || data.uid;
          if (id) {
            currentUserId = String(id);
            return;
          }
        } catch (_) { }
      }

      const sub = decodeJwtSub(token);
      if (sub) currentUserId = sub;
    }

    function normalizeTags(raw) {
      const value = (raw || '').trim();
      if (!value) return '';
      return value;
    }

    function showResult(obj) {
      result.hidden = false;
      result.textContent = JSON.stringify(obj, null, 2);
    }

    document.querySelectorAll('.chip[data-tag]').forEach((chip) => {
      chip.addEventListener('click', () => {
        const tag = chip.getAttribute('data-tag');
        const tagsInput = document.getElementById('tags');
        const current = (tagsInput.value || '').trim();
        if (!current) {
          tagsInput.value = tag;
          return;
        }
        const parts = current.split(',').map((value) => value.trim()).filter(Boolean);
        if (!parts.includes(tag)) parts.push(tag);
        tagsInput.value = parts.join(', ');
      });
    });

    async function uploadSingle(file, baseFields) {
      const fd = new FormData();
      fd.append('file', file);
      if (baseFields.source_name) fd.append('source_name', baseFields.source_name);
      if (baseFields.user_id) fd.append('user_id', baseFields.user_id);
      if (baseFields.tags) fd.append('tags', baseFields.tags);
      const res = await fetch(`${API}/api/medix/rag/upload`, { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);
      return data;
    }

    async function uploadBulk(files, baseFields) {
      const fd = new FormData();
      for (const file of files) fd.append('files', file);
      if (baseFields.source_name) fd.append('source_prefix', baseFields.source_name);
      if (baseFields.user_id) fd.append('user_id', baseFields.user_id);
      if (baseFields.tags) fd.append('tags', baseFields.tags);
      const res = await fetch(`${API}/api/medix/rag/upload/bulk`, { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);
      return data;
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const files = [...document.getElementById('pdf').files];
      if (!files.length) {
        status.textContent = 'Select at least one PDF.';
        return;
      }

      const sourceName = document.getElementById('sourceName').value.trim();
      const tags = normalizeTags(document.getElementById('tags').value);
      const baseFields = { source_name: sourceName, user_id: currentUserId, tags };

      submitBtn.disabled = true;
      status.textContent = files.length > 1 ? `Bulk indexing ${files.length} files...` : 'Indexing started...';

      try {
        const data = files.length === 1 ? await uploadSingle(files[0], baseFields) : await uploadBulk(files, baseFields);
        showResult(data);
        const success = Number(data.success || (data.ok ? 1 : 0));
        const failed = Number(data.failed || 0);
        status.textContent = files.length > 1 ? `Bulk complete: ${success} success, ${failed} failed.` : 'Indexed successfully.';
      } catch (error) {
        status.textContent = `Request error: ${error.message || error}`;
      } finally {
        submitBtn.disabled = false;
      }
    });

    resolveCurrentUserId();
