// Extracted from ui/matketplace/notes/upload_note.html (inline <script> #3).
    // ===== Utilities =====
    const el = (sel, root = document) => root.querySelector(sel);
    const els = (sel, root = document) => [...root.querySelectorAll(sel)];

    // Theme toggle
    // Unified theme toggle (same behavior as index/about)
    (function () {
      const root = document.documentElement;
      const toggles = () => Array.from(document.querySelectorAll('[data-theme-toggle]'));
      const updateIcons = (mode) => toggles().forEach(btn => { const ic = btn.querySelector('.material-symbols-rounded'); if (ic) ic.textContent = mode === 'dark' ? 'light_mode' : 'dark_mode'; });
      const setTheme = (mode) => { mode === 'dark' ? root.classList.add('dark') : root.classList.remove('dark'); localStorage.setItem('px_theme', mode); updateIcons(mode); };
      setTheme(root.classList.contains('dark') ? 'dark' : 'light');
      document.addEventListener('click', e => { const t = e.target.closest('[data-theme-toggle]'); if (!t) return; setTheme(root.classList.contains('dark') ? 'light' : 'dark'); });
    })();

    // API helpers
    async function resolveApiBase(retries = 10) { const base = (window.__API_BASE || window.API_BASE || '').replace(/\/$/, ''); if (base) return base; if (retries <= 0) return ''; return new Promise(res => setTimeout(() => res(resolveApiBase(retries - 1)), 100)); }
    function getToken() { const keys = ['px_token', 'sb-access-token', 'supabase.auth.token']; for (const k of keys) { try { const v = localStorage.getItem(k); if (v) return v; } catch { } } return ''; }

    function showToast(msg, type = 'info', opts = {}) { const host = el('#toastHost'); if (!host) return; const div = document.createElement('div'); div.className = `pointer-events-auto select-none text-sm rounded-lg shadow-lg px-4 py-3 flex items-center gap-2 border backdrop-blur-sm ${type === 'success' ? 'bg-emerald-500/90 text-white border-emerald-400/50' : type === 'error' ? 'bg-rose-600/90 text-white border-rose-400/50' : 'bg-black/80 text-white border-white/10'}`; div.innerHTML = `<span class="material-symbols-rounded text-base">${type === 'success' ? 'check_circle' : (type === 'error' ? 'error' : 'info')}</span><span>${msg}</span>`; host.appendChild(div); const ttl = opts.ttl || 2600; setTimeout(() => { div.classList.add('opacity-0', 'translate-y-1'); setTimeout(() => div.remove(), 320); }, ttl); }

    // ===== Draft (localStorage) =====
    const DRAFT_KEY = 'px_upload_draft';
    function saveDraft() { const fd = new FormData(el('#uploadForm')); const o = Object.fromEntries(fd.entries()); try { localStorage.setItem(DRAFT_KEY, JSON.stringify(o)); showToast('Draft saved', 'success'); } catch { showToast('Could not save draft', 'error'); } }
    function loadDraft() { try { const raw = localStorage.getItem(DRAFT_KEY); if (!raw) return; const o = JSON.parse(raw); for (const [k, v] of Object.entries(o)) { const n = el(`[name="${CSS.escape(k)}"]`); if (!n || k === 'file') continue; n.value = v; } reflectPreview(); } catch { } }
    function clearDraft() { localStorage.removeItem(DRAFT_KEY); showToast('Draft cleared'); }

    // ===== Form live preview =====
    function chip(txt) { return `<span class="px-2 py-0.5 rounded-full ring-1 ring-black/10 dark:ring-white/15">${txt}</span>`; }
    function reflectPreview() { const t = el('[name="title"]').value.trim(); const d = el('[name="description"]').value.trim(); const s = el('[name="subject"]').value.trim(); const u = el('[name="unit"]').value.trim(); const e = el('[name="exam_type"]').value.trim(); const p = parseInt(el('[name="price_cents"]').value || '0', 10); el('#pTitle').textContent = t || 'Untitled note'; el('#pDesc').textContent = d || 'Description will appear here as you type.'; el('#pPrice').textContent = p > 0 ? `₹${p}` : 'Free'; el('#pMeta').innerHTML = [s, u, e].filter(Boolean).map(chip).join(''); }

    els('input, textarea, select', el('#uploadForm')).forEach(n => { n.addEventListener('input', reflectPreview); n.addEventListener('change', reflectPreview); });
    el('#makeFree').addEventListener('click', () => { const inp = el('[name="price_cents"]'); inp.value = 0; reflectPreview(); });
    el('#saveDraft').addEventListener('click', saveDraft);
    el('#clearDraft').addEventListener('click', () => { clearDraft(); el('#uploadForm').reset(); reflectPreview(); });

    // ===== Tags (chips) =====
    const tagHost = el('#tagHost'); const tagInput = el('#tagInput'); const tagsHidden = el('#tagsHidden');
    function tagsArr() { const cur = [...tagHost.querySelectorAll('[data-tag]')].map(x => x.dataset.tag); return cur; }
    function renderTags() { const arr = tagsArr(); tagsHidden.value = arr.join(', '); }
    tagInput.addEventListener('keydown', e => { if (e.key === 'Enter' && tagInput.value.trim()) { e.preventDefault(); const v = tagInput.value.trim(); const b = document.createElement('button'); b.type = 'button'; b.className = 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-700 dark:text-fuchsia-200 text-xs'; b.innerHTML = `<span class="material-symbols-rounded text-sm">sell</span>${v}<span class="material-symbols-rounded text-sm">close</span>`; b.dataset.tag = v; b.addEventListener('click', () => { b.remove(); renderTags(); reflectPreview(); }); tagHost.insertBefore(b, tagInput); tagInput.value = ''; renderTags(); reflectPreview(); } });

    // ===== Dropzone + preview =====
    const drop = el('#dropzone'); const inputFile = el('#fileInput'); const preview = el('#filePreview'); const thumbBox = el('#thumbBox'); const fileName = el('#fileName'); const fileMeta = el('#fileMeta'); const prog = el('#progBar'); const removeBtn = el('#removeFile');
    const chooseFile = () => inputFile.click();
    drop.addEventListener('click', chooseFile);
    ;['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); drop.classList.add('drop-active'); }));
    ;['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); drop.classList.remove('drop-active'); }));
    drop.addEventListener('drop', e => { const f = e.dataTransfer.files?.[0]; if (f) assignFile(f); });
    inputFile.addEventListener('change', () => { const f = inputFile.files?.[0]; if (f) assignFile(f); });
    removeBtn.addEventListener('click', () => { inputFile.value = ''; preview.classList.add('hidden'); prog.style.width = '0%'; });

    function assignFile(file) {
      if (!file) return; const ok = /\.(pdf|md|png|jpe?g)$/i.test(file.name); if (!ok) { showToast('Unsupported file type', 'error'); return; } preview.classList.remove('hidden'); fileName.textContent = file.name; fileMeta.textContent = `${(file.size / 1024 / 1024).toFixed(2)} MB`; prog.style.width = '0%';
      if (file.type.startsWith('image/')) { const r = new FileReader(); r.onload = () => { thumbBox.innerHTML = `<img src="${r.result}" alt="preview" class="w-full h-full object-cover">`; }; r.readAsDataURL(file); } else { thumbBox.innerHTML = `<span class="material-symbols-rounded">${/pdf/.test(file.type) ? 'picture_as_pdf' : 'description'}</span>`; }
    }

    // Cover image handlers
    const coverInput = document.getElementById('coverInput');
    const coverPreview = document.getElementById('coverPreview');
    const removeCoverBtn = document.getElementById('removeCover');
    if (coverInput) {
      coverInput.addEventListener('change', () => { const f = coverInput.files?.[0]; if (!f) return; if (!/^image\//.test(f.type)) { showToast('Cover must be an image', 'error'); coverInput.value = ''; return; } if (f.size > 5 * 1024 * 1024) { showToast('Cover >5MB', 'error'); coverInput.value = ''; return; } const r = new FileReader(); r.onload = () => { coverPreview.innerHTML = `<img src="${r.result}" class="w-full h-full object-cover" alt="cover">`; removeCoverBtn.classList.remove('hidden'); }; r.readAsDataURL(f); });
    }
    if (removeCoverBtn) { removeCoverBtn.addEventListener('click', () => { coverInput.value = ''; coverPreview.innerHTML = '<span class="material-symbols-rounded text-base opacity-60">image</span>'; removeCoverBtn.classList.add('hidden'); }); }

    // ===== Academic cascade =====
    let apiBase; async function fetchJSON(url) { try { const r = await fetch(url); if (!r.ok) return null; return await r.json(); } catch { return null; } }
    const collegeSel = el('#collegeSel'); const degreeSel = el('#degreeSel'); const deptSel = el('#deptSel'); const batchSel = el('#batchSel'); const semSel = el('#semSel');
    function clearSelect(sel, label, disable = true) { sel.innerHTML = `<option value="">${label}</option>`; sel.disabled = disable; }
    async function loadColleges() { if (!apiBase) apiBase = await resolveApiBase(); clearSelect(collegeSel, '-- Select College --', false); const data = await fetchJSON(`${apiBase}/api/colleges`); if (Array.isArray(data)) data.forEach(c => { const o = document.createElement('option'); o.value = c.id; o.textContent = c.name; collegeSel.appendChild(o); }); }
    async function loadDegrees(collegeId) { clearSelect(degreeSel, '-- Select Degree --'); clearSelect(deptSel, '-- Select Department --'); clearSelect(batchSel, '-- Select Batch --'); clearSelect(semSel, '-- Semester --'); if (!collegeId) return; degreeSel.disabled = true; deptSel.disabled = true; batchSel.disabled = true; semSel.disabled = true; const data = await fetchJSON(`${apiBase}/api/colleges/${collegeId}/degrees`); degreeSel.disabled = false; if (Array.isArray(data)) data.forEach(d => { const o = document.createElement('option'); o.value = d.id || d; o.textContent = d.name || d; degreeSel.appendChild(o); }); }
    async function loadDepartments(collegeId) { clearSelect(deptSel, '-- Select Department --'); clearSelect(batchSel, '-- Select Batch --'); clearSelect(semSel, '-- Semester --'); if (!collegeId) return; deptSel.disabled = true; const data = await fetchJSON(`${apiBase}/api/colleges/${collegeId}/departments/full`); deptSel.disabled = false; if (Array.isArray(data)) data.forEach(d => { const o = document.createElement('option'); o.value = d.id || d.name || d; o.textContent = d.name || d; deptSel.appendChild(o); }); }
    async function loadBatches(collegeId, deptName) { clearSelect(batchSel, '-- Select Batch --'); clearSelect(semSel, '-- Semester --'); if (!collegeId || !deptName) return; batchSel.disabled = true; const data = await fetchJSON(`${apiBase}/api/colleges/${collegeId}/departments/${encodeURIComponent(deptName)}/batches/full`); batchSel.disabled = false; if (Array.isArray(data)) data.forEach(b => { const opt = document.createElement('option'); const from = b.from_year ?? b.from ?? b.fromYear; const to = b.to_year ?? b.to ?? b.toYear; let label = ''; if (Number.isInteger(from) && Number.isInteger(to)) label = `${from}-${to}`; else if (Number.isInteger(from)) label = String(from); else label = b.range || b.name || 'Batch'; opt.value = b.id || b.batch_id || `${from || ''}-${to || ''}`; opt.textContent = label; batchSel.appendChild(opt); }); }
    function enableSemester() { semSel.disabled = false; if (!semSel.querySelector('option[value="1"]')) { for (let i = 1; i <= 8; i++) { const o = document.createElement('option'); o.value = String(i); o.textContent = String(i); semSel.appendChild(o); } } }

    collegeSel.addEventListener('change', e => { const v = e.target.value; loadDegrees(v); loadDepartments(v); reflectPreview(); });
    degreeSel.addEventListener('change', reflectPreview);
    deptSel.addEventListener('change', e => { const deptTxt = deptSel.options[deptSel.selectedIndex]?.textContent; loadBatches(collegeSel.value, deptTxt); reflectPreview(); });
    batchSel.addEventListener('change', () => { enableSemester(); reflectPreview(); });
    semSel.addEventListener('change', reflectPreview);

    // ===== Submit (with progress) =====
    const form = el('#uploadForm');
    form.addEventListener('submit', async e => {
      e.preventDefault(); const status = el('#status'); status.textContent = 'Preparing…';
      // Basic validation
      const title = form.title.value.trim(); if (!title) { el('[data-err="title"]').classList.remove('hidden'); form.title.focus(); showToast('Please add a title', 'error'); return; } else { el('[data-err="title"]').classList.add('hidden'); }
      const file = inputFile.files?.[0]; if (!file) { showToast('Please choose a file', 'error'); return; }

      if (!apiBase) apiBase = await resolveApiBase();
      const fd = new FormData(form);
      // Convert price rupees ➝ cents
      const priceRupees = parseInt(fd.get('price_cents') || '0', 10); fd.set('price_cents', String((priceRupees || 0) * 100));

      // Send file directly to backend; backend uses service role to upload to Supabase
      const token = getToken();
      const url = `${apiBase}/api/marketplace/notes` + (token ? `?token=${encodeURIComponent(token)}` : '');
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url);
      if (token) xhr.setRequestHeader('Authorization', 'Bearer ' + token);
      xhr.upload.onprogress = (e) => { if (e.lengthComputable) { const pct = Math.round((e.loaded / e.total) * 100); prog.style.width = pct + '%'; } };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          prog.style.width = '100%'; showToast('Note uploaded successfully!', 'success'); status.textContent = '';
          setTimeout(() => { location.href = './notes_marketplace.html'; }, 1200);
        } else {
          let msg = 'Upload failed';
          try { const j = JSON.parse(xhr.responseText || '{}'); msg = j.detail || msg; } catch {}
          showToast('Upload failed', 'error'); status.textContent = msg;
        }
      };
      xhr.onerror = () => { showToast('Network error', 'error'); status.textContent = 'Network error'; };
      xhr.send(fd);
    });

    // Keyboard shortcut: Ctrl/Cmd + Enter to submit
    document.addEventListener('keydown', e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { form.requestSubmit(); } });

    // Boot
    (async () => { loadDraft(); reflectPreview(); await loadColleges(); })();
