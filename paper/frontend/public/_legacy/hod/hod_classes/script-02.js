// Extracted from ui/hod/hod_classes.html (inline <script> #2).
    (function(){
      const $ = (s, r=document) => r.querySelector(s);
      const groups = $('#groups');
      const empty = $('#empty');
      const errBox = $('#errBox');
      const skel = $('#skel');
      const shown = $('#shownCount');
      const scopeLine = $('#scopeLine');
      const scopeSub = $('#scopeSub');
      const statStudents = $('#statStudents');
      const statSections = $('#statSections');
      const statSubjects = $('#statSubjects');
      const hodProfileImg = $('#hodProfileImg');
      const hodProfileFallback = $('#hodProfileFallback');
      const hodSignOutBtn = $('#hodSignOutBtn');

      const refreshBtn = $('#refreshBtn');
      const expandAllBtn = $('#expandAllBtn');
      const collapseAllBtn = $('#collapseAllBtn');

      let staff = [];
      let staffLoaded = false;
      let classes = [];
      let meta = {};
      let activeClassId = null;
      let activeMode = 'reassign';
      let activeClassObj = null;

      function applyHodProfileAvatar(me){
        if (!hodProfileImg || !hodProfileFallback) return;
        const avatar = (me && (
          me.profile_image_url ||
          me.avatar_url ||
          me.photo_url ||
          (me.teacher && (me.teacher.profile_image_url || me.teacher.avatar_url || me.teacher.photo_url))
        )) || '';
        const displayName = (me && (me.name || me.teacher_name || (me.teacher && me.teacher.name))) || 'HOD';
        if (avatar) {
          hodProfileImg.src = avatar;
          hodProfileImg.classList.remove('hidden');
          hodProfileFallback.classList.add('hidden');
          return;
        }
        hodProfileImg.classList.add('hidden');
        hodProfileFallback.classList.remove('hidden');
        const initial = String(displayName || 'H').trim().charAt(0).toUpperCase() || 'H';
        hodProfileFallback.classList.remove('material-symbols-rounded');
        hodProfileFallback.classList.add('text-sm', 'font-bold');
        hodProfileFallback.textContent = initial;
      }

      async function fetchTeacherProfileMe(token){
        const headers = { 'X-TeacherProfile-Strict': 'true' };
        if (token) headers.Authorization = 'Bearer ' + token;
        const data = await HOD.fetchJSON(HOD.API_BASE + '/api/teacher/profile/me?strict=1', { headers });
        return (data && (data.teacher || data.profile || data)) || {};
      }

      async function signOutFromHod(){
        try {
          await fetch(HOD.API_BASE + '/logout', { method: 'POST', credentials: 'include' });
        } catch(_){ }
        ['px_token','teacherToken','userToken','sb-access-token','supabase.auth.token','paperx_bearer_fallback'].forEach(k => {
          try { localStorage.removeItem(k); } catch(_){ }
          try { sessionStorage.removeItem(k); } catch(_){ }
        });
        location.href = '../login.html';
      }

      function setLoading(on){
        if (on){
          skel.classList.remove('hidden');
          groups.classList.add('hidden');
          empty.classList.add('hidden');
          document.body.classList.remove('loaded');
        } else {
          skel.classList.add('hidden');
          groups.classList.remove('hidden');
          document.body.classList.add('loaded');
        }
      }

      function card(c){
        const dept = c.department_name || '';
        const batch = c.batch_label ? ('Batch ' + c.batch_label) : '';
        const meta = [dept, batch, c.section ? ('Sec ' + c.section) : '', c.semester ? ('Sem ' + c.semester) : ''].filter(Boolean).join(' • ');
        const rawSubject = String(c.subject || 'Subject');
        const subjectTitle = (() => {
          if (rawSubject.includes('—')) return rawSubject.split('—').slice(1).join('—').trim() || rawSubject;
          const m = rawSubject.match(/^\s*[A-Z]{2,}\d+[A-Z0-9]*\s*[-:]\s*(.+)$/i);
          if (m && m[1]) return String(m[1]).trim();
          return rawSubject;
        })();
        const params = new URLSearchParams();
        if (c.subject_id) params.set('course_id', c.subject_id);
        if (c.subject) params.set('subject', c.subject);
        if (c.id) params.set('class_id', c.id);
        if (c.batch_id) params.set('batch_id', c.batch_id);
        if (c.section) params.set('section', c.section);
        if (c.semester) params.set('semester', c.semester);
        const syllabusHref = c.subject_id ? ('../teacher_class_syllabus.html?' + params.toString()) : '';
        const syllabusBtn = syllabusHref
          ? `<a href="${HOD.esc(syllabusHref)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold bg-white/80 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 hover:bg-white dark:hover:bg-white/15" title="Open syllabus">
               <span class="material-symbols-rounded text-[16px]">menu_book</span>Syllabus
             </a>`
          : `<button type="button" disabled class="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold bg-black/5 dark:bg-white/10 text-neutral-500 dark:text-white/40 ring-1 ring-black/10 dark:ring-white/15 cursor-not-allowed" title="Syllabus not linked">
               <span class="material-symbols-rounded text-[16px]">menu_book</span>Syllabus
             </button>`;
        const isAssigned = !!(c.teacher_user_id);
        const tname = (isAssigned ? (c.teacher_name || 'Assigned') : 'Unassigned');
        const tsub = (isAssigned ? 'Assigned staff' : 'No staff assigned');
        const action = isAssigned
          ? `
              <button class="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold bg-brand-500/10 text-brand-700 dark:text-fuchsia-100 ring-1 ring-brand-500/25 hover:bg-brand-500/20" data-reassign="${HOD.esc(c.id)}">
                <span class="material-symbols-rounded text-[16px]">swap_horiz</span>Reassign
              </button>
            `
          : `
              <button class="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold bg-red-600/85 text-white ring-1 ring-red-500/30 hover:bg-red-600" data-assign="${HOD.esc(c.id)}" title="Assign staff">
                <span class="material-symbols-rounded text-[16px]">person_add</span>Unassigned
              </button>
            `;
        return `
          <div class="rounded-2xl bg-white/70 dark:bg-white/5 ring-1 ring-black/10 dark:ring-white/10 p-4 flex flex-col gap-3 hover:shadow-[0_18px_60px_-28px_rgba(158,75,138,.65)] transition">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <div class="font-semibold leading-snug line-clamp-2">${HOD.esc(subjectTitle || 'Subject')}</div>
                <div class="mt-1 text-[11px] text-neutral-500 dark:text-white/45">${HOD.esc(meta || '—')}</div>
              </div>
              <div class="shrink-0">${syllabusBtn}</div>
            </div>
            <div class="flex items-center justify-between gap-2">
              <div class="text-xs">
                <div class="font-semibold">${HOD.esc(tname)}</div>
                <div class="text-[11px] text-neutral-500 dark:text-white/45">${HOD.esc(tsub || '—')}</div>
              </div>
              <div class="flex items-center gap-2">
                ${action}
              </div>
            </div>
          </div>`;
      }

      function yearIndexForSem(semNum){
        const s = parseInt(semNum, 10);
        if (!s || s < 1) return null;
        return Math.floor((s - 1) / 2) + 1;
      }

      function yearTitle(yearIndex){
        const map = { 1: 'First Year', 2: 'Second Year', 3: 'Third Year', 4: 'Final Year' };
        return map[yearIndex] || `Year ${yearIndex}`;
      }

      function yearSemesters(yearIndex){
        // Standard mapping: (1,2), (3,4), (5,6), (7,8)
        const start = (yearIndex - 1) * 2 + 1;
        return [start, start + 1];
      }

      function parseBatchStartYear(label){
        // label like "2022-2026" -> 2022
        const m = String(label || '').match(/(\d{4})\s*[-–]\s*(\d{4})/);
        if (!m) return null;
        const y = parseInt(m[1], 10);
        return Number.isFinite(y) ? y : null;
      }

      function groupBy(list, keyFn){
        const out = new Map();
        list.forEach(item => {
          const k = keyFn(item) ?? '';
          const key = String(k);
          if (!out.has(key)) out.set(key, []);
          out.get(key).push(item);
        });
        return out;
      }

      function badge(label, icon, strong){
        const cls = strong
          ? 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold bg-brand-500/10 text-brand-700 dark:text-fuchsia-100 ring-1 ring-brand-500/25'
          : 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] bg-black/5 dark:bg-white/10 text-neutral-700 dark:text-white/80 ring-1 ring-black/10 dark:ring-white/10';
        return `<span class="${cls}"><span class="material-symbols-rounded text-[16px]">${HOD.esc(icon)}</span>${HOD.esc(label)}</span>`;
      }

      function updateStats(list){
        const secKey = (c) => {
          const y = yearIndexForSem(c.semester) || 0;
          const s = String(c.section || '').trim() || '—';
          const d = String(c.department_id || '');
          return d + '|' + y + '|' + s;
        };
        const sections = new Set(list.map(secKey));
        statSections.textContent = String(sections.size);

        // Overall students: sum unique section counts (avoid double counting across subjects)
        const sectionStudents = new Map();
        list.forEach(c => {
          const k = secKey(c);
          const sc = (typeof c.students_count === 'number') ? c.students_count : null;
          if (sc === null) return;
          const prev = sectionStudents.get(k);
          if (prev === undefined || sc > prev) sectionStudents.set(k, sc);
        });
        let totalStudents = 0;
        for (const v of sectionStudents.values()) totalStudents += (Number(v) || 0);
        statStudents.textContent = String(totalStudents);

        // Keep subject rows count available (previously "classes")
        statSubjects.textContent = String(list.length);

        shown.textContent = String(list.length);
      }

      function renderGrouped(list){
        groups.innerHTML = '';
        if (!list.length) {
          empty.classList.remove('hidden');
          return;
        }
        empty.classList.add('hidden');

        // Stable sorting within groups
        const sorted = list.slice().sort((a, b) => {
          const ay = yearIndexForSem(a.semester) || 99;
          const by = yearIndexForSem(b.semester) || 99;
          if (ay !== by) return ay - by;
          const as = parseInt(a.semester || 0, 10) || 0;
          const bs = parseInt(b.semester || 0, 10) || 0;
          if (as !== bs) return as - bs;
          const ab = parseBatchStartYear(a.batch_label) || 9999;
          const bb = parseBatchStartYear(b.batch_label) || 9999;
          if (ab !== bb) return ab - bb;
          return String(a.subject || '').localeCompare(String(b.subject || ''));
        });

        const byYear = groupBy(sorted, c => yearIndexForSem(c.semester) || 0);
        const yearOrder = Array.from(byYear.keys()).map(k => parseInt(k, 10)).sort((a, b) => a - b);
        yearOrder.forEach((yIdx) => {
          const yearList = byYear.get(String(yIdx)) || [];
          if (!yearList.length) return;

          // Year-level students (sum unique section counts)
          const yearSectionStudents = new Map();
          yearList.forEach(c => {
            const sec = String(c.section || '').trim() || '—';
            const k = String(c.department_id || '') + '|' + String(yIdx) + '|' + sec;
            const sc = (typeof c.students_count === 'number') ? c.students_count : null;
            if (sc === null) return;
            const prev = yearSectionStudents.get(k);
            if (prev === undefined || sc > prev) yearSectionStudents.set(k, sc);
          });
          let yearStudents = 0;
          for (const v of yearSectionStudents.values()) yearStudents += (Number(v) || 0);

          const yearHdr = `
            <div id="year-${HOD.esc(String(yIdx))}" class="flex flex-wrap items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="h-9 w-9 rounded-2xl bg-brand-500/15 ring-1 ring-brand-500/25 flex items-center justify-center">
                  <span class="material-symbols-rounded text-[18px]">orbit</span>
                </div>
                <div>
                  <div class="text-xs uppercase tracking-wide text-neutral-500 dark:text-white/45">Year ${HOD.esc(String(yIdx))}</div>
                  <div class="text-lg font-semibold tracking-tight">${HOD.esc(yearTitle(yIdx))}</div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                ${badge(String(yearStudents) + ' students', 'groups', true)}
              </div>
            </div>`;

          const bySection = groupBy(yearList, c => {
            const s = String(c.section || '').trim();
            return s || '—';
          });

          const sectionKeys = Array.from(bySection.keys()).sort((a, b) => {
            if (a === '—' && b !== '—') return 1;
            if (a !== '—' && b === '—') return -1;
            return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
          });

          const sectionBlocks = sectionKeys.map((sec) => {
            const secList = bySection.get(sec) || [];
            if (!secList.length) return '';

            const studentCounts = secList
              .map(x => (typeof x.students_count === 'number') ? x.students_count : null)
              .filter(v => v !== null);
            const sectionStudents = studentCounts.length ? Math.max(...studentCounts) : null;

            // Hide sections that are explicitly known to have zero students.
            if (sectionStudents === 0) return '';

            const rightMeta = (sectionStudents === null)
              ? ''
              : badge(String(sectionStudents) + ' students', 'groups', true);

            const cards = secList.map(card).join('');
            return `
              <details class="rounded-2xl bg-white/70 dark:bg-white/5 ring-1 ring-black/10 dark:ring-white/10 overflow-hidden" data-section>
                <summary class="cursor-pointer select-none px-4 py-3 flex items-center justify-between gap-3 hover:bg-black/5 dark:hover:bg-white/5">
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="text-sm font-semibold tracking-tight">Section ${HOD.esc(sec)}</span>
                    <span class="text-[10px] px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10">${secList.length}</span>
                  </div>
                  <div class="text-[11px] text-neutral-500 dark:text-white/45 truncate">${rightMeta || ''}</div>
                </summary>
                <div class="p-4">
                  <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">${cards}</div>
                </div>
              </details>`;
          }).filter(Boolean).join('');

          groups.insertAdjacentHTML('beforeend', `<div class="space-y-4">
            ${yearHdr}
            <div class="space-y-3">${sectionBlocks}</div>
          </div>`);
        });
      }

      function showEmptyState(){
        const hasMapping = meta && meta.has_mapping;
        if (hasMapping === false) {
          empty.innerHTML = 'Configure <a href="./batch_management.html" class="underline font-semibold">Batch Mgmt</a> (batch + current term) to see current classes.';
        } else {
          empty.textContent = 'No classes found.';
        }
      }

      async function loadAll(){
        HOD.bindThemeToggle();
        HOD.mountNav('classes');
        errBox.classList.add('hidden');
        setLoading(true);

        let me;
        try {
          me = await HOD.requireHod();
        } catch(e){
          errBox.textContent = e.message || 'Failed to load HOD scope';
          errBox.classList.remove('hidden');
          setLoading(false);
          return;
        }
        const deps = (me && me.departments) ? me.departments : [];
        const token = HOD.getToken();
        try {
          const teacherProfile = await fetchTeacherProfileMe(token);
          applyHodProfileAvatar(teacherProfile);
        } catch(_){
          applyHodProfileAvatar(me);
        }
        scopeLine.textContent = (deps.length ? (deps.length + ' department' + (deps.length > 1 ? 's' : '')) : 'No departments');
        scopeSub.textContent = deps.length ? deps.map(d => d.name).slice(0, 3).join(' • ') + (deps.length > 3 ? ' • …' : '') : 'Ask admin to configure HOD scope.';

        // Staff list is lazy-loaded only when opening the reassign modal.
        staff = [];
        staffLoaded = false;
        $('#teacherSelect').innerHTML = '<option value="">Loading staff…</option>';

        try {
          const resp = await HOD.fetchJSON(HOD.API_BASE + '/api/hod/classes?current_only=1', { headers: { Authorization: 'Bearer ' + token } });
          classes = resp.classes || [];
          meta = resp.meta || {};
          updateStats(classes);
          showEmptyState();
          renderGrouped(classes);
        } catch(e){
          errBox.textContent = e.message || 'Failed to load classes';
          errBox.classList.remove('hidden');
          classes = [];
          meta = {};
          updateStats([]);
          showEmptyState();
          renderGrouped([]);
        } finally {
          setLoading(false);
        }
      }

      async function loadStaffIfNeeded(){
        if (staffLoaded) return;
        try {
          const token = HOD.getToken();
          const staffResp = await HOD.fetchJSON(HOD.API_BASE + '/api/hod/staff', { headers: { Authorization: 'Bearer ' + token } });
          staff = staffResp.staff || [];
          staffLoaded = true;
          renderStaffOptions();
        } catch(_){
          staff = [];
          staffLoaded = true;
          $('#teacherSelect').innerHTML = '<option value="">Failed to load staff</option>';
        }
      }

      function renderStaffOptions(departmentId){
        const sel = $('#teacherSelect');
        const did = (departmentId || '').trim();
        const list = did ? staff.filter(s => String(s.department_id || '') === did) : staff;
        sel.innerHTML = list.map(t => `<option value="${HOD.esc(t.auth_user_id)}">${HOD.esc(t.name || t.email || t.auth_user_id)}</option>`).join('') || '<option value="">No staff</option>';
      }

      // Modal logic
      const modal = $('#modal');
      const modalErr = $('#modalErr');
      const modalSub = $('#modalSub');
      const modalTitle = $('#modalTitle');

      function openModal(c, mode){
        activeMode = mode || 'reassign';
        activeClassObj = c || null;
        activeClassId = c ? c.id : null;
        modalErr.classList.add('hidden');
        modalTitle.textContent = (activeMode === 'assign') ? 'Assign staff' : 'Reassign class';
        modalSub.textContent = c ? (c.label || c.subject || c.id) : '—';
        modal.classList.remove('hidden');
        loadStaffIfNeeded().then(() => {
          renderStaffOptions(activeClassObj ? activeClassObj.department_id : null);
        });
      }
      function closeModal(){
        modal.classList.add('hidden');
        activeClassId = null;
        activeClassObj = null;
        activeMode = 'reassign';
      }

      document.addEventListener('click', (e) => {
        const close = e.target.closest('[data-close]');
        if (close) closeModal();
        const rbtn = e.target.closest('[data-reassign]');
        if (rbtn){
          const id = rbtn.getAttribute('data-reassign');
          const c = classes.find(x => String(x.id) === String(id));
          if (c) openModal(c, 'reassign');
          return;
        }
        const abtn = e.target.closest('[data-assign]');
        if (abtn){
          const id = abtn.getAttribute('data-assign');
          const c = classes.find(x => String(x.id) === String(id));
          if (c) openModal(c, 'assign');
        }
      });

      $('#saveReassign').addEventListener('click', async () => {
        if (!activeClassId) return;
        modalErr.classList.add('hidden');
        try {
          const token = HOD.getToken();
          const newTeacher = ($('#teacherSelect').value || '').trim();
          if (!newTeacher) throw new Error('Select a teacher');

          const isVirtual = activeClassObj && (!!activeClassObj.virtual || String(activeClassObj.id || '').startsWith('virtual:'));
          if (activeMode === 'assign' && isVirtual){
            await HOD.fetchJSON(HOD.API_BASE + '/api/hod/classes/assign', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
              body: JSON.stringify({
                department_id: activeClassObj.department_id,
                batch_id: activeClassObj.batch_id,
                semester: activeClassObj.semester,
                section: activeClassObj.section,
                subject_id: activeClassObj.subject_id,
                subject: activeClassObj.subject,
                new_teacher_user_id: newTeacher,
              })
            });
          } else {
            await HOD.fetchJSON(HOD.API_BASE + '/api/hod/classes/' + encodeURIComponent(activeClassId) + '/reassign', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
              body: JSON.stringify({ new_teacher_user_id: newTeacher })
            });
          }
          closeModal();
          await loadAll();
        } catch(e){
          modalErr.textContent = e.message || ((activeMode === 'assign') ? 'Assign failed' : 'Reassign failed');
          modalErr.classList.remove('hidden');
        }
      });

      refreshBtn.addEventListener('click', loadAll);
      expandAllBtn.addEventListener('click', () => {
        document.querySelectorAll('details[data-section]').forEach(d => { d.open = true; });
      });
      collapseAllBtn.addEventListener('click', () => {
        document.querySelectorAll('details[data-section]').forEach(d => { d.open = false; });
      });

      document.querySelectorAll('.yearJump').forEach(btn => {
        btn.addEventListener('click', () => {
          const y = btn.getAttribute('data-year');
          const el = document.getElementById('year-' + String(y));
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });

      if (hodSignOutBtn) hodSignOutBtn.addEventListener('click', signOutFromHod);

      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadAll, { once:true });
      else loadAll();
    })();
