// Extracted from ui/hod/hod_staff.html (inline <script> #2).
    (function(){
      const $ = (s, r=document) => r.querySelector(s);
      const grid = $('#grid');
      const empty = $('#empty');
      const errBox = $('#errBox');
      const skel = $('#skel');
      const shown = $('#shownCount');
      const deptSelect = $('#deptSelect');
      const qInput = $('#qInput');
      const staffModal = $('#staffModal');
      const modalClose = $('#modalClose');
      const modalBody = $('#modalBody');
      const removeBtn = $('#removeBtn');
      const removePane = $('#removePane');
      const removeInput = $('#removeInput');
      const removeConfirm = $('#removeConfirm');
      const removeCancel = $('#removeCancel');
      const removeErr = $('#removeErr');
      const modalProfile = $('#modalProfile');

      let departments = [];
      let staff = [];
      let activeStaff = null;
      let scopeLoaded = false;
      let currentHodUserId = '';

      function setLoading(on){
        if (on){
          errBox.classList.add('hidden');
          skel.classList.remove('hidden');
          grid.classList.add('hidden');
          empty.classList.add('hidden');
          document.body.classList.remove('loaded');
        } else {
          skel.classList.add('hidden');
          grid.classList.remove('hidden');
          document.body.classList.add('loaded');
        }
      }

      function card(t){
        const dept = t.department_name || '';
        const role = t.is_teacher ? 'Teacher' : 'Staff';
        const cls = typeof t.classes_count === 'number' ? t.classes_count : (t.classes_count || 0);
        const avatar = t.profile_image_url || t.avatar_url;
        const initials = (t.name || t.email || '?').trim().split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase();

        const profileHref = '../teacher_profile.html?user=' + encodeURIComponent(t.auth_user_id);

        return `
          <div class="rounded-2xl bg-white/70 dark:bg-white/5 ring-1 ring-black/10 dark:ring-white/10 p-4 cursor-pointer hover:bg-white/90 dark:hover:bg-white/10 transition" data-staff-card data-id="${HOD.esc(t.auth_user_id)}">
            <div class="flex items-center gap-3">
              ${avatar ? `<img src="${HOD.esc(avatar)}" class="h-12 w-12 rounded-2xl object-cover ring-1 ring-black/10 dark:ring-white/10" />` : `<div class="h-12 w-12 rounded-2xl bg-brand-500/15 ring-1 ring-brand-500/25 grid place-items-center font-bold text-brand-800 dark:text-fuchsia-100">${HOD.esc(initials||'?')}</div>`}
              <div class="min-w-0">
                <div class="font-semibold truncate">${HOD.esc(t.name || '—')}</div>
                <div class="text-xs text-neutral-500 dark:text-white/45 truncate">${HOD.esc(t.email || t.auth_user_id)}</div>
                <div class="mt-1 text-[11px] text-neutral-500 dark:text-white/45">${HOD.esc([dept, role].filter(Boolean).join(' • '))}</div>
              </div>
            </div>

            <div class="mt-4 flex items-center justify-between gap-2">
              <div class="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold bg-brand-500/10 text-brand-800 dark:text-fuchsia-100 ring-1 ring-brand-500/20">
                <span class="material-symbols-rounded text-[16px]">class</span>
                ${HOD.esc(cls)} classes
              </div>
              <a href="${HOD.esc(profileHref)}" data-profile-link class="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15">
                <span class="material-symbols-rounded text-[16px]">open_in_new</span>Profile
              </a>
            </div>
          </div>`;
      }

      function renderList(list){
        grid.innerHTML = (list || []).map(card).join('');
        empty.classList.toggle('hidden', (list || []).length > 0);
        shown.textContent = String((list || []).length);
      }

      async function ensureScope(){
        if (scopeLoaded) return;
        HOD.bindThemeToggle();
        HOD.mountNav('staff');
        errBox.classList.add('hidden');
        const me = await HOD.requireHod();
        currentHodUserId = String((me && me.hod && me.hod.auth_user_id) || '').trim();
        departments = me.departments || [];
        deptSelect.innerHTML = '<option value="">All</option>' + departments.map(d => `<option value="${HOD.esc(d.id)}">${HOD.esc(d.name)}</option>`).join('');
        if (departments.length === 1) deptSelect.value = String(departments[0].id);
        scopeLoaded = true;
      }

      async function fetchStaff(){
        await ensureScope();
        const token = HOD.getToken();
        const dept = (deptSelect.value || '').trim();
        const q = (qInput.value || '').trim();
        const url = new URL(HOD.API_BASE + '/api/hod/staff');
        if (dept) url.searchParams.set('department_id', dept);
        if (q) url.searchParams.set('q', q);
        setLoading(true);
        try {
          const resp = await HOD.fetchJSON(url.toString(), { headers: { Authorization: 'Bearer ' + token } });
          const rows = Array.isArray(resp.staff) ? resp.staff : [];
          const hodId = String(currentHodUserId || '').trim();
          staff = hodId ? rows.filter(t => String((t && t.auth_user_id) || '').trim() !== hodId) : rows;
          renderList(staff);
        } catch(e){
          staff = [];
          renderList(staff);
          errBox.textContent = e.message || 'Failed to load staff';
          errBox.classList.remove('hidden');
        } finally {
          setLoading(false);
        }
      }

      function deptName(id){
        const d = departments.find(x => String(x.id) === String(id));
        return d ? d.name : '';
      }

      function openModal(t){
        activeStaff = t;
        removeErr.classList.add('hidden');
        removePane.classList.add('hidden');
        removeInput.value = '';
        removeConfirm.disabled = true;

        const avatar = t.profile_image_url || t.avatar_url;
        const initials = (t.name || t.email || '?').trim().split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase();
        const dept = deptName(t.department_id) || '';
        const cls = typeof t.classes_count === 'number' ? t.classes_count : (t.classes_count || 0);
        const assignmentsCount = typeof t.assignments_count === 'number' ? t.assignments_count : (t.assignments_count || 0);
        const testsCount = typeof t.tests_count === 'number' ? t.tests_count : (t.tests_count || 0);
        const feedbackCollected = typeof t.feedback_collected_count === 'number' ? t.feedback_collected_count : (t.feedback_collected_count || 0);
        const classDetails = Array.isArray(t.class_details) ? t.class_details : [];

        modalProfile.href = '../teacher_profile.html?user=' + encodeURIComponent(t.auth_user_id);

        modalBody.innerHTML = `
          <div class="flex items-center gap-4">
            ${avatar ? `<img src="${HOD.esc(avatar)}" class="h-16 w-16 rounded-3xl object-cover ring-1 ring-black/10 dark:ring-white/10" />`
                     : `<div class="h-16 w-16 rounded-3xl bg-brand-500/15 ring-1 ring-brand-500/25 grid place-items-center font-bold text-xl text-brand-800 dark:text-fuchsia-100">${HOD.esc(initials||'?')}</div>`}
            <div class="min-w-0">
              <div class="text-lg font-semibold tracking-tight truncate">${HOD.esc(t.name || '—')}</div>
              <div class="text-sm text-neutral-600 dark:text-white/60 truncate">${HOD.esc(t.email || '')}</div>
              <div class="mt-1 text-[11px] text-neutral-500 dark:text-white/45">${HOD.esc(dept ? ('Department • ' + dept) : 'Department • —')}</div>
            </div>
          </div>

          <div class="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="rounded-2xl bg-white/70 dark:bg-white/5 ring-1 ring-black/10 dark:ring-white/10 p-3">
              <div class="text-[10px] uppercase tracking-wide text-neutral-500 dark:text-white/45">Classes</div>
              <div class="mt-1 text-lg font-bold">${HOD.esc(cls)}</div>
            </div>
            <div class="rounded-2xl bg-white/70 dark:bg-white/5 ring-1 ring-black/10 dark:ring-white/10 p-3">
              <div class="text-[10px] uppercase tracking-wide text-neutral-500 dark:text-white/45">Assignments</div>
              <div class="mt-1 text-lg font-bold">${HOD.esc(assignmentsCount)}</div>
            </div>
            <div class="rounded-2xl bg-white/70 dark:bg-white/5 ring-1 ring-black/10 dark:ring-white/10 p-3">
              <div class="text-[10px] uppercase tracking-wide text-neutral-500 dark:text-white/45">Tests Conducted</div>
              <div class="mt-1 text-lg font-bold">${HOD.esc(testsCount)}</div>
            </div>
            <div class="rounded-2xl bg-white/70 dark:bg-white/5 ring-1 ring-black/10 dark:ring-white/10 p-3">
              <div class="text-[10px] uppercase tracking-wide text-neutral-500 dark:text-white/45">Feedback Collected</div>
              <div class="mt-1 text-lg font-bold">${HOD.esc(feedbackCollected)}</div>
            </div>
          </div>

          <div class="mt-4 rounded-2xl bg-white/70 dark:bg-white/5 ring-1 ring-black/10 dark:ring-white/10 p-3">
            <div class="text-[10px] uppercase tracking-wide text-neutral-500 dark:text-white/45">Handled Classes</div>
            ${classDetails.length ? `
              <div class="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                ${classDetails.map(c => {
                  const subject = c && c.subject ? String(c.subject) : 'Class';
                  const bits = [];
                  if (c && c.department_name) bits.push(String(c.department_name));
                  if (c && c.year) bits.push(String(c.year));
                  if (c && c.section) bits.push('Section ' + String(c.section));
                  const meta = bits.join(' • ') || '—';
                  return `<div class="rounded-xl bg-black/5 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/10 px-3 py-2">
                    <div class="text-sm font-semibold">${HOD.esc(subject)}</div>
                    <div class="text-xs text-neutral-600 dark:text-white/65 mt-0.5">${HOD.esc(meta)}</div>
                  </div>`;
                }).join('')}
              </div>
            ` : `<div class="mt-2 text-sm text-neutral-600 dark:text-white/60">No class details available.</div>`}
          </div>

        `;

        staffModal.classList.remove('hidden');
      }

      function closeModal(){
        staffModal.classList.add('hidden');
        activeStaff = null;
      }

      async function removeActiveStaff(){
        if (!activeStaff) return;
        const deptId = String(activeStaff.department_id || deptSelect.value || '').trim();
        if (!deptId){
          removeErr.textContent = 'Missing department.';
          removeErr.classList.remove('hidden');
          return;
        }
        removeErr.classList.add('hidden');
        removeConfirm.disabled = true;
        try {
          const token = HOD.getToken();
          const resp = await HOD.fetchJSON(HOD.API_BASE + '/api/hod/staff/remove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
            body: JSON.stringify({ teacher_user_id: activeStaff.auth_user_id, department_id: deptId })
          });
          // Refresh list
          await fetchStaff();
          closeModal();
        } catch(e){
          removeErr.textContent = e.message || 'Failed to remove staff';
          removeErr.classList.remove('hidden');
          removeConfirm.disabled = false;
        }
      }

      async function loadAll(){
        try {
          await ensureScope();
          await fetchStaff();
        } catch(e){
          setLoading(false);
          errBox.textContent = e.message || 'Failed to load staff';
          errBox.classList.remove('hidden');
          staff = [];
          renderList(staff);
        }
      }

      // Modal events
      modalClose.addEventListener('click', closeModal);
      staffModal.addEventListener('click', (e) => {
        if (e.target && e.target.matches && e.target.matches('[data-close-modal]')) closeModal();
      });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !staffModal.classList.contains('hidden')) closeModal(); });

      removeBtn.addEventListener('click', () => {
        removeErr.classList.add('hidden');
        removePane.classList.remove('hidden');
        removeInput.focus();
      });
      removeCancel.addEventListener('click', () => {
        removePane.classList.add('hidden');
        removeErr.classList.add('hidden');
        removeInput.value = '';
        removeConfirm.disabled = true;
      });
      removeInput.addEventListener('input', () => {
        removeConfirm.disabled = String(removeInput.value || '').trim().toLowerCase() !== 'remove';
      });
      removeConfirm.addEventListener('click', removeActiveStaff);

      // Click staff card to open modal
      grid.addEventListener('click', (e) => {
        const profile = e.target.closest('[data-profile-link]');
        if (profile) return; // let it navigate
        const card = e.target.closest('[data-staff-card]');
        if (!card) return;
        const id = card.getAttribute('data-id');
        const t = staff.find(x => String(x.auth_user_id) === String(id));
        if (t) openModal(t);
      });

      $('#refreshBtn').addEventListener('click', fetchStaff);
      deptSelect.addEventListener('change', fetchStaff);
      qInput.addEventListener('input', () => { window.clearTimeout(window.__qT); window.__qT = setTimeout(fetchStaff, 220); });

      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadAll, { once:true });
      else loadAll();
    })();
