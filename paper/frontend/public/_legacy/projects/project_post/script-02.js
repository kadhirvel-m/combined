// Extracted from ui/projects/project_post.html (inline <script> #2).
    const d = document;
    // Determine API base
    const API = ((window.API_BASE || window.__API_BASE || 'http://0.0.0.0:10000')).replace(/\/$/, '');

    // Enforce auth for posting
    const token = localStorage.getItem('px_token');
    if (!token) {
      // Soft redirect to sign-in
      window.location.href = '../login.html';
    }

    // mobile menu
    const menuBtn = d.getElementById('menuBtn');
    const mobileMenu = d.getElementById('mobileMenu');
    if (menuBtn) menuBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));

    // Auth-aware navbar avatar like index
    if (token) {
      d.querySelectorAll('a[href="../login.html"], a[href="signup.html"]').forEach(el => el.classList.add('hidden'));
      const navProfile = d.getElementById('navProfile');
      const navProfileImg = d.getElementById('navProfileImg');
      const navProfileInitial = d.getElementById('navProfileInitial');
      const navProfileMobile = d.getElementById('navProfileMobile');
      const navProfileMobileImg = d.getElementById('navProfileMobileImg');
      const navProfileMobileInitial = d.getElementById('navProfileMobileInitial');
      if (navProfile) navProfile.classList.remove('hidden');
      if (navProfileMobile) navProfileMobile.classList.remove('hidden');
      fetch(`${API}/api/profile`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(p => {
          if (!p) return;
          let initials = 'ME';
          if (p.name) initials = p.name.split(' ').filter(Boolean).map(s => s[0]?.toUpperCase()).slice(0, 2).join('');
          if (navProfileInitial) navProfileInitial.textContent = initials;
          if (navProfileMobileInitial) navProfileMobileInitial.textContent = initials;
          if (p.profile_image_url) {
            if (navProfileImg) { navProfileImg.src = p.profile_image_url; navProfileImg.classList.remove('hidden'); if (navProfileInitial) navProfileInitial.classList.add('hidden'); }
            if (navProfileMobileImg) { navProfileMobileImg.src = p.profile_image_url; navProfileMobileImg.classList.remove('hidden'); if (navProfileMobileInitial) navProfileMobileInitial.classList.add('hidden'); }
          }
        }).catch(() => { });
    }

    // Segmented selectors
    function makeSeg(groupSel, fieldSel) {
      const group = d.getElementById(groupSel);
      const field = d.getElementById(fieldSel);
      group.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          group.querySelectorAll('button').forEach(b => b.classList.remove('on'));
          btn.classList.add('on');
          field.value = btn.dataset.val;
        });
      });
    }
    makeSeg('statusSeg', 'statusField');
    makeSeg('fundSeg', 'fundField');
    makeSeg('compSeg', 'compField');

    // Chips (multi)
    function makeChips(containerId, fieldId) {
      const container = d.getElementById(containerId);
      const field = d.getElementById(fieldId);
      const sync = () => { const vals = Array.from(container.querySelectorAll('.chip.sel')).map(c => c.dataset.val); field.value = vals.join(','); };
      container.querySelectorAll('.chip').forEach(ch => {
        ch.addEventListener('click', () => { ch.classList.toggle('sel'); sync(); });
      });
    }
    makeChips('domainChips', 'domainsField');
    makeChips('roleChips', 'rolesField');

    // Milestones dynamic
    const msInput = d.getElementById('milestoneInput');
    const msList = d.getElementById('milestoneList');
    d.getElementById('addMilestone').addEventListener('click', () => {
      const v = (msInput.value || '').trim();
      if (!v) return;
      const row = d.createElement('div');
      row.className = 'flex items-center justify-between gap-2 p-2 rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60';
      row.innerHTML = `<span class="text-sm">${v}</span><button type="button" class="text-xs px-2 py-1 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10">Remove</button>`;
      row.querySelector('button').addEventListener('click', () => row.remove());
      msList.appendChild(row);
      msInput.value = '';
    });

    // Drag & drop
    function makeDrop(zoneId, onChange) {
      const zone = d.getElementById(zoneId);
      if (!zone) return null;
      const input = zone.querySelector('input');
      if (!input) return null;
      const openPicker = () => input.click();
      zone.addEventListener('click', openPicker);
      ['dragenter', 'dragover'].forEach(evt => zone.addEventListener(evt, e => { e.preventDefault(); zone.classList.add('hover'); }));
      ['dragleave', 'drop'].forEach(evt => zone.addEventListener(evt, e => { e.preventDefault(); zone.classList.remove('hover'); }));
      const triggerChange = () => {
        if (typeof onChange === 'function') {
          onChange(input.files);
        }
      };
      zone.addEventListener('drop', (e) => {
        input.files = e.dataTransfer.files;
        input.dispatchEvent(new Event('change'));
      });
      input.addEventListener('change', triggerChange);
      return { zone, input };
    }
    const coverPreviewImg = d.getElementById('coverPreview');
    const coverPreviewBox = d.getElementById('coverPreviewBox');
    let coverPreviewUrl = null;
    const setCoverPreview = (file) => {
      if (!coverPreviewImg || !coverPreviewBox) return;
      if (coverPreviewUrl) {
        URL.revokeObjectURL(coverPreviewUrl);
        coverPreviewUrl = null;
      }
      if (file) {
        coverPreviewUrl = URL.createObjectURL(file);
        coverPreviewImg.src = coverPreviewUrl;
        coverPreviewBox.classList.remove('hidden');
      } else {
        coverPreviewImg.removeAttribute('src');
        coverPreviewBox.classList.add('hidden');
      }
    };
    const coverDrop = makeDrop('coverDrop', (files) => setCoverPreview(files && files[0]));
    makeDrop('galleryDrop');

    // Draft
    const STORAGE_KEY = 'connextx_project_draft_v3';
    function serialize() {
      const f = d.getElementById('projectForm');
      const fd = new FormData(f);
      const get = (n) => (fd.get(n) || '').toString().trim();
      const domains = (get('domains') || '').split(',').filter(Boolean);
      const roles = (get('roles') || '').split(',').filter(Boolean);
      const milestones = Array.from(msList.querySelectorAll('span')).map(el => el.textContent);
      return {
        basics: { title: get('title'), tagline: get('tagline'), domains, description: get('description'), tech_stack: (get('tech_stack') || '').split(',').map(s => s.trim()).filter(Boolean) },
        status: { status: get('status'), start_date: get('start_date'), end_date: get('end_date'), milestones },
        links: { github: get('github'), demo: get('demo'), video: get('video'), docs: get('docs') },
        funding: { stage: get('fund_stage'), budget_inr: Number(get('fund_budget') || 0), use: get('fund_use') },
        team: { members: (get('team') || '').split(',').map(s => s.trim()).filter(Boolean), roles_hiring: roles, compensation: get('compensation'), hours: get('hours'), role_desc: get('role_desc') }
      }
    }
    function restore() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY); if (!raw) return; const data = JSON.parse(raw);
        const f = d.getElementById('projectForm');
        f.title.value = data?.basics?.title || '';
        f.tagline.value = data?.basics?.tagline || '';
        f.description.value = data?.basics?.description || '';
        f.tech_stack.value = (data?.basics?.tech_stack || []).join(', ');
        const sel = new Set(data?.basics?.domains || []);
        d.querySelectorAll('#domainChips .chip').forEach(c => { if (sel.has(c.dataset.val)) c.classList.add('sel'); });
        d.getElementById('domainsField').value = (data?.basics?.domains || []).join(',');
        d.getElementById('statusField').value = data?.status?.status || 'Idea';
        d.querySelectorAll('#statusSeg button').forEach(b => { b.classList.toggle('on', b.dataset.val === (data?.status?.status || 'Idea')); });
        f.start_date.value = data?.status?.start_date || '';
        f.end_date.value = data?.status?.end_date || '';
        (data?.status?.milestones || []).forEach(m => { d.getElementById('milestoneInput').value = m; d.getElementById('addMilestone').click(); });
        f.github.value = data?.links?.github || ''; f.demo.value = data?.links?.demo || ''; f.video.value = data?.links?.video || ''; f.docs.value = data?.links?.docs || '';
        d.getElementById('fundField').value = data?.funding?.stage || 'Bootstrapped';
        d.querySelectorAll('#fundSeg button').forEach(b => { b.classList.toggle('on', b.dataset.val === (data?.funding?.stage || 'Bootstrapped')); });
        f.fund_budget.value = data?.funding?.budget_inr || 0; f.fund_use.value = data?.funding?.use || '';
        f.team.value = (data?.team?.members || []).join(', ');
        const rsel = new Set(data?.team?.roles_hiring || []);
        d.querySelectorAll('#roleChips .chip').forEach(c => { if (rsel.has(c.dataset.val)) c.classList.add('sel'); });
        d.getElementById('rolesField').value = (data?.team?.roles_hiring || []).join(',');
        d.getElementById('compField').value = data?.team?.compensation || 'Volunteer';
        d.querySelectorAll('#compSeg button').forEach(b => { b.classList.toggle('on', b.dataset.val === (data?.team?.compensation || 'Volunteer')); });
        f.hours.value = data?.team?.hours || ''; f.role_desc.value = data?.team?.role_desc || '';
      } catch (e) { console.warn('restore failed', e); }
    }
    restore();

    d.getElementById('saveDraft').addEventListener('click', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serialize()));
      alert('Draft saved locally.');
    });
    d.getElementById('resetForm').addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEY);
      d.getElementById('projectForm').reset();
      d.querySelectorAll('.chip').forEach(c => c.classList.remove('sel'));
      d.getElementById('milestoneList').innerHTML = '';
      setCoverPreview(null);
      if (coverDrop && coverDrop.input) coverDrop.input.value = '';
    });

    // Submit wiring — create project then upload media
    async function uploadMedia(projectId) {
      const coverInput = d.querySelector('#coverDrop input[type="file"][name="cover"]');
      const galleryInput = d.querySelector('#galleryDrop input[type="file"][name="gallery"]');
      // Cover
      if (coverInput && coverInput.files && coverInput.files[0]) {
        const fd = new FormData();
        fd.append('kind', 'cover');
        fd.append('file', coverInput.files[0]);
        const r = await fetch(`${API}/api/projects/${projectId}/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
        const payload = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(payload?.detail || 'Cover upload failed');
        if (payload?.project?.cover_url && coverPreviewImg) {
          if (coverPreviewUrl) {
            URL.revokeObjectURL(coverPreviewUrl);
            coverPreviewUrl = null;
          }
          coverPreviewImg.src = payload.project.cover_url;
          coverPreviewBox?.classList.remove('hidden');
        }
      }
      // Gallery (sequential)
      if (galleryInput && galleryInput.files && galleryInput.files.length) {
        for (const file of galleryInput.files) {
          const fd = new FormData();
          fd.append('kind', 'gallery');
          fd.append('file', file);
          const rg = await fetch(`${API}/api/projects/${projectId}/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
          if (!rg.ok) throw new Error('Gallery upload failed');
        }
      }
    }

    d.getElementById('submitBtn').addEventListener('click', async () => {
      try {
        const payload = serialize();
        // Basic required checks
        if (!payload.basics.title || !payload.basics.tagline || !payload.basics.description) {
          alert('Please fill title, tagline and description.');
          return;
        }
        // Create project
        const res = await fetch(`${API}/api/projects`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload)
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.detail || 'Project create failed');
        const projectId = data.id;
        // Upload media if any
        await uploadMedia(projectId);
        // Clear draft and notify
        localStorage.removeItem(STORAGE_KEY);
        alert('Project submitted successfully!');
        // Redirect to profile or home
        window.location.href = 'index.html#discover';
      } catch (e) {
        alert(e.message || 'Submission failed');
      }
    });
