// Extracted from ui/collage/upload_syllabus.html (inline <script> #3).
    const Q = (window.Collage && Collage.parseQuery) ? Collage.parseQuery() : {};
    let API = (window.API_BASE || (window.Collage && Collage.API_BASE) || '').replace(/\/$/, '');
    // Resolve a working API base by probing the upload info endpoint
    async function resolveApiBase() {
      const candidates = [];
      if (API) candidates.push(API);
      try { const ls = localStorage.getItem('API_BASE'); if (ls) candidates.push(ls.replace(/\/$/, '')); } catch (_) { }
      candidates.push('http://0.0.0.0:10000');
      const tried = new Set();
      for (const base of candidates) {
        if (!base || tried.has(base)) continue;
        tried.add(base);
        try {
          const r = await fetch(base.replace(/\/$/, '') + '/api/syllabus/upload', { method: 'GET' });
          if (r.ok) return base.replace(/\/$/, '');
          // Some setups may return 200 with text/html; still accept
          if (r.status === 200) return base.replace(/\/$/, '');
        } catch (_) { }
      }
      return API || 'http://0.0.0.0:10000';
    }
    function readStoredCtx() {
      try { const s = sessionStorage.getItem('px_ctx_batches'); if (s) return JSON.parse(s); } catch (_) { }
      try { const l = localStorage.getItem('px_ctx_batches_last'); if (l) return JSON.parse(l); } catch (_) { }
      return {};
    }
    const stored = readStoredCtx();

    const el = id => document.getElementById(id);
    const fileEl = el('file');
    // Bulk mode: code/title hints not used
    const codeEl = { value: '' };
    const titleEl = { value: '' };
    const semEl = el('semester');
    const formEl = el('uploadForm');
    const statusEl = el('status');
    const submitBtn = el('submitBtn');
    const breadcrumbsEl = el('breadcrumbs');
    const batchMeta = el('batchMeta');
    const backBtn = el('backBtn');

    const batchId = Q.batchId || stored.batchId || '';
    const collegeName = (Q.collegeName || stored.collegeName || '').toString();
    const degreeName = (Q.degreeName || stored.degreeName || '').toString();
    const departmentName = (Q.departmentName || stored.departmentName || '').toString();
    const batchRange = (Q.batchRange || stored.batchRange || '').toString();

    function breadcrumb(items) {
      const esc = s => (Collage && Collage.escapeHtml) ? Collage.escapeHtml(s) : s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
      return items.map((it, i) => it.href && i !== items.length - 1 ? `<a href="${it.href}">${esc(it.label)}</a>` : `<span>${esc(it.label)}</span>`).join('<span class="material-symbols-rounded">chevron_right</span>');
    }

    function setStatus(text, type) {
      statusEl.textContent = text || '';
      statusEl.classList.remove('hidden', 'text-red-500', 'text-green-600', 'text-neutral-600');
      statusEl.classList.add(type === 'error' ? 'text-red-500' : (type === 'ok' ? 'text-green-600' : 'text-neutral-600'));
    }

    function showAccessDenied(message) {
      try { submitBtn?.setAttribute('disabled', 'true'); } catch (_) { }
      try { fileEl?.setAttribute('disabled', 'true'); } catch (_) { }
      try { semEl?.setAttribute('disabled', 'true'); } catch (_) { }
      const host = formEl?.parentElement || document.querySelector('.container.max-w-3xl') || document.body;
      if (window.Collage && typeof window.Collage.renderAccessDenied === 'function') {
        window.Collage.renderAccessDenied(host, message || 'You need an admin or employee account to access the college console.');
      } else {
        setStatus(message || 'Access denied', 'error');
      }
    }

    document.addEventListener('DOMContentLoaded', async () => {
      let role = 'student';
      try {
        if (window.Collage && window.Collage.requireAdminOrEmployee) {
          role = await window.Collage.requireAdminOrEmployee();
        }
      } catch (err) {
        console.error(err);
        const status = err?.status;
        if (status === 401 || status === 403) {
          showAccessDenied('You need an admin or employee account to access the college console.');
          return;
        }
        showAccessDenied(err?.message || 'Access denied');
        return;
      }

      // Employees can view the page but cannot upload.
      if (String(role || '').toLowerCase() !== 'admin') {
        try { submitBtn?.classList.add('hidden'); } catch (_) { }
        try { fileEl?.setAttribute('disabled', 'true'); } catch (_) { }
        try { semEl?.setAttribute('disabled', 'true'); } catch (_) { }
        setStatus('Read-only: only admin can upload syllabus.', 'info');
      }

      // pick a working API base and reflect it in UI
      const resolved = await resolveApiBase();
      if (resolved && resolved !== API) {
        API = resolved;
        try { localStorage.setItem('API_BASE', API); } catch (_) { }
        console.debug('[upload] Using API_BASE:', API);
      }
      const backUrl = `subjects.html?collegeId=${encodeURIComponent(Q.collegeId || stored.collegeId || '')}&collegeName=${encodeURIComponent(collegeName)}&degreeId=${encodeURIComponent(Q.degreeId || stored.degreeId || '')}&degreeName=${encodeURIComponent(degreeName)}&departmentId=${encodeURIComponent(Q.departmentId || stored.departmentId || '')}&departmentName=${encodeURIComponent(departmentName)}&batchId=${encodeURIComponent(batchId)}&batchRange=${encodeURIComponent(batchRange)}`;
      breadcrumbsEl.innerHTML = breadcrumb([
        { label: 'Collages', href: 'clg_info.html' },
        { label: collegeName || 'College' },
        { label: degreeName || 'Degree' },
        { label: departmentName || 'Department' },
        { label: 'Subjects', href: backUrl },
        { label: 'Upload Syllabus' }
      ]);
      batchMeta.textContent = batchRange ? `Batch ${batchRange}` : '';
      backBtn.setAttribute('href', backUrl);

      async function postUpload({ preferNaive = false, timeoutMs = 90000 } = {}) {
        const ctrl = new AbortController();
        const timer = setTimeout(() => { try { ctrl.abort(); } catch (_) { } }, timeoutMs);
        const fd = new FormData();
        fd.append('file', fileEl.files[0]);
        fd.append('batch_id', batchId);
        // bulk: no course_code/title
        if (semEl.value) fd.append('semester', semEl.value.trim());
        if (preferNaive) fd.append('prefer_naive', '1');
        const url = API.replace(/\/$/, '') + '/api/syllabus/upload-bulk';
        let res;
        try {
          res = await fetch(url, { method: 'POST', body: fd, signal: ctrl.signal });
        } finally {
          clearTimeout(timer);
        }
        return res;
      }

      formEl.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!batchId) { setStatus('Missing batch context.', 'error'); return; }
        const f = fileEl.files && fileEl.files[0];
        if (!f) { setStatus('Please choose a PDF file.', 'error'); return; }
        if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
          setStatus('Only PDF files are supported.', 'error'); return;
        }
        const semVal = (semEl.value || '').trim();
        if (!semVal) { setStatus('Enter the semester (1-12).', 'error'); semEl.focus(); return; }
        const semNum = Number(semVal);
        if (Number.isNaN(semNum) || semNum < 1 || semNum > 12) {
          setStatus('Semester must be between 1 and 12.', 'error');
          semEl.focus();
          return;
        }

        setStatus('Uploading and parsing bulk syllabus…', 'info');
        try {
          let res;
          try {
            res = await postUpload({ preferNaive: false, timeoutMs: 90000 });
          } catch (err) {
            if (err && (err.name === 'AbortError' || String(err).includes('aborted'))) {
              setStatus('Still working… Retrying with heuristic parsing.', 'info');
              res = await postUpload({ preferNaive: true, timeoutMs: 90000 });
            } else {
              throw err;
            }
          }
          if (!res.ok) {
            let msg = res.statusText;
            try { const j = await res.json(); msg = j.detail || j.message || msg; } catch (_) { }
            throw new Error(msg || `Upload failed (${res.status})`);
          }
          const data = await res.json();
          const count = Array.isArray(data) ? data.length : (data ? 1 : 0);
          setStatus(`Parsed and saved ${count} subject${count === 1 ? '' : 's'}.`, 'ok');
          try { sessionStorage.setItem('px_flash', `Added ${count} subject${count === 1 ? '' : 's'} for semester ${encodeURIComponent(semVal)}`); } catch (_) { }
          const backUrl2 = `subjects.html?collegeId=${encodeURIComponent(Q.collegeId || stored.collegeId || '')}&collegeName=${encodeURIComponent(collegeName)}&degreeId=${encodeURIComponent(Q.degreeId || stored.degreeId || '')}&degreeName=${encodeURIComponent(degreeName)}&departmentId=${encodeURIComponent(Q.departmentId || stored.departmentId || '')}&departmentName=${encodeURIComponent(departmentName)}&batchId=${encodeURIComponent(batchId)}&batchRange=${encodeURIComponent(batchRange)}`;
          setTimeout(() => { Collage.navigate(backUrl2); }, 900);
        } catch (err) {
          console.error(err);
          if (err && (err.name === 'AbortError' || String(err).toLowerCase().includes('aborted'))) {
            setStatus('Upload timed out. Please try again.', 'error');
          } else {
            setStatus(err.message || 'Failed to upload/parse syllabus.', 'error');
          }
        } finally {
          submitBtn.disabled = false;
        }
      });
    });
