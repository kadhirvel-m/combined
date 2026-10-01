// Extracted from ui/public_add_syllabus.html (inline <script> #2).
      // Hide auth buttons and show avatar if logged in
      (function () {
        const t = localStorage.getItem('px_token');
        if (!t) return;
        document.querySelectorAll('a[href="login.html"], a[href="signup.html"]').forEach(a => a.classList.add('hidden'));
        const navProfile = document.getElementById('navProfile');
        const navProfileImg = document.getElementById('navProfileImg');
        const navProfileInitial = document.getElementById('navProfileInitial');
        const navSignOut = document.getElementById('navSignOut');
        if (navProfile) navProfile.classList.remove('hidden');
        if (navSignOut) { navSignOut.classList.remove('hidden'); navSignOut.onclick = () => { try { localStorage.removeItem('px_token'); } catch { } window.location.href = 'login.html'; }; }

        const applyNavProfile = (profile) => {
          if (!profile) return;
          let initials = 'ME';
          if (profile.name) {
            initials = profile.name
              .split(' ')
              .filter(Boolean)
              .map(part => part[0]?.toUpperCase())
              .slice(0, 2)
              .join('') || 'ME';
          }
          if (navProfileInitial) {
            navProfileInitial.textContent = initials;
            navProfileInitial.classList.remove('hidden');
          }
          if (profile.profile_image_url && navProfileImg) {
            navProfileImg.src = profile.profile_image_url;
            navProfileImg.classList.remove('hidden');
            if (navProfileInitial) navProfileInitial.classList.add('hidden');
          } else if (navProfileImg) {
            navProfileImg.classList.add('hidden');
          }
        };

        window.__PX_NAV_APPLY = applyNavProfile;

        const useProfile = (profile) => { if (profile) applyNavProfile(profile); };

        if (window.__PX_PROFILE_SNAPSHOT) {
          applyNavProfile(window.__PX_PROFILE_SNAPSHOT);
          return;
        }

        const apiBase = (window.API_BASE || 'http://0.0.0.0:10000').replace(/\/$/, '');
        if (!window.__PX_NAV_PROFILE_PROMISE) {
          window.__PX_NAV_PROFILE_PROMISE = fetch(`${apiBase}/api/me`, { headers: { Authorization: `Bearer ${t}` } })
            .then(r => r.ok ? r.json() : null)
            .then(d => {
              const profile = d?.profile || null;
              if (profile) {
                window.__PX_PROFILE_SNAPSHOT = profile;
                applyNavProfile(profile);
              }
              return profile;
            })
            .catch(() => null);
        }

        const pending = window.__PX_NAV_PROFILE_PROMISE;
        if (pending && typeof pending.then === 'function') {
          pending.then(useProfile).catch(() => { });
        }
      })();

    const apiBase = (window.API_BASE || 'http://0.0.0.0:10000').replace(/\/$/, '');

    const collegeSel = document.getElementById('college');
    const deptSel = document.getElementById('department');
    const existingBatchSel = document.getElementById('existingBatch');
    const fromYearInp = document.getElementById('fromYear');
    const toYearInp = document.getElementById('toYear');
    const semesterSel = document.getElementById('semester');
    const codeInp = document.getElementById('courseCode');
    const titleInp = document.getElementById('courseTitle');
    const unitsWrap = document.getElementById('unitsWrap');
    const unitTpl = document.getElementById('unitTpl');
    const topicTpl = document.getElementById('topicTpl');
    const status = document.getElementById('status');
    const submitBtn = document.getElementById('submitBtn');
    const addUnitBtn = document.getElementById('addUnitBtn');
    const expandAllBtn = document.getElementById('expandAllBtn');

    let ctx = { colleges: [], departments: [], batchList: [], selectedBatchId: null };

    function opt(text, value) {
      const o = document.createElement('option');
      o.textContent = text; o.value = value ?? '';
      return o;
    }

    async function loadColleges() {
      collegeSel.innerHTML = '';
      collegeSel.appendChild(opt('— select —', ''));
      try {
        const res = await fetch(`${apiBase}/api/colleges`);
        const data = await res.json();
        ctx.colleges = data || [];
        for (const c of ctx.colleges) collegeSel.appendChild(opt(c.name, c.id));
      } catch (e) {
        collegeSel.appendChild(opt('Failed to load', ''));
      }
    }

    async function loadDepartments(collegeId) {
      deptSel.innerHTML = '';
      deptSel.appendChild(opt('— select —', ''));
      existingBatchSel.innerHTML = '<option value="">— Select after department —</option>';
      existingBatchSel.disabled = true;
      ctx.departments = [];
      ctx.batchList = [];
      ctx.selectedBatchId = null;
      fromYearInp.value = '';
      toYearInp.value = '';
      if (!collegeId) { deptSel.disabled = true; return; }
      deptSel.disabled = false;
      try {
        const res = await fetch(`${apiBase}/api/colleges/${collegeId}/departments/full`);
        const data = await res.json();
        ctx.departments = data || [];
        for (const d of ctx.departments) deptSel.appendChild(opt(d.name, d.name));
      } catch (e) {
        deptSel.appendChild(opt('Failed to load', ''));
      }
    }

    async function loadBatches(collegeId, deptName) {
      existingBatchSel.innerHTML = '';
      existingBatchSel.appendChild(opt('— none / custom —', ''));
      existingBatchSel.disabled = false;
      ctx.batchList = [];
      ctx.selectedBatchId = null;
      fromYearInp.value = '';
      toYearInp.value = '';
      if (!collegeId || !deptName) { existingBatchSel.disabled = true; return; }
      try {
        const res = await fetch(`${apiBase}/api/colleges/${collegeId}/departments/${encodeURIComponent(deptName)}/batches/full`);
        const data = await res.json();
        ctx.batchList = data || [];
        for (const b of ctx.batchList) {
          const label = `${b.from_year}\u2013${b.to_year}`;
          existingBatchSel.appendChild(opt(label, b.id));
        }
      } catch (e) {
        existingBatchSel.appendChild(opt('Failed to load', ''));
      }
    }

    function renumberUnits() {
      [...unitsWrap.querySelectorAll('[data-unit-index]')].forEach((el, idx) => el.textContent = (idx + 1));
    }

    function addTopic(topicsWrap, topicValue = '') {
      const n = topicTpl.content.cloneNode(true);
      const input = n.querySelector('.topic-input');
      input.value = topicValue;
      n.querySelector('.remove-topic').addEventListener('click', () => {
        input.parentElement.remove();
      });
      topicsWrap.appendChild(n);
    }

    function addUnit(unitTitle = '') {
      const n = unitTpl.content.cloneNode(true);
      const unitNode = n.querySelector('div.rounded-xl');
      const body = n.querySelector('[data-body]');
      const toggleBtn = n.querySelector('.toggle-btn');
      const removeBtn = n.querySelector('.remove-unit');
      const titleInput = n.querySelector('.unit-title');
      const topicsWrap = n.querySelector('[data-topics]');
      const addTopicBtn = n.querySelector('.add-topic');
      titleInput.value = unitTitle;
      addTopic(topicsWrap, '');
      toggleBtn.addEventListener('click', () => {
        const hidden = body.classList.toggle('hidden');
        toggleBtn.textContent = hidden ? 'Expand' : 'Collapse';
      });
      removeBtn.addEventListener('click', () => { unitNode.remove(); renumberUnits(); });
      addTopicBtn.addEventListener('click', () => addTopic(topicsWrap, ''));
      unitsWrap.appendChild(n);
      renumberUnits();
    }

    function expandAll(expand = true) {
      unitsWrap.querySelectorAll('[data-body]').forEach(b => { b.classList.toggle('hidden', !expand); });
      unitsWrap.querySelectorAll('.toggle-btn').forEach(btn => { btn.textContent = expand ? 'Collapse' : 'Expand'; });
    }

    addUnitBtn.addEventListener('click', () => addUnit(''));
    expandAllBtn.addEventListener('click', () => {
      const anyCollapsed = [...unitsWrap.querySelectorAll('[data-body]')].some(b => b.classList.contains('hidden'));
      expandAll(anyCollapsed);
    });

    // Initial unit
    addUnit('Unit 1');

    // Selections
    collegeSel.addEventListener('change', (e) => {
      const id = e.target.value;
      loadDepartments(id);
    });
    deptSel.addEventListener('change', (e) => {
      const collegeId = collegeSel.value;
      const deptName = e.target.value;
      loadBatches(collegeId, deptName);
    });
    existingBatchSel.addEventListener('change', (e) => {
      const id = e.target.value || null;
      ctx.selectedBatchId = id || null;
      if (!id) { fromYearInp.value = ''; toYearInp.value = ''; return; }
      const row = ctx.batchList.find(b => String(b.id) === String(id));
      if (row) { fromYearInp.value = row.from_year; toYearInp.value = row.to_year; }
    });

    // Submit
    document.getElementById('courseForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      status.classList.remove('hidden'); status.textContent = '';
      const college_id = collegeSel.value || '';
      const dept_name = (deptSel.value || '').trim();
      const from_year = Number(fromYearInp.value || 0);
      const to_year = Number(toYearInp.value || 0);
      const semester = Number(semesterSel.value || 0);
      const course_code = String(codeInp.value || '').trim();
      const title = String(titleInp.value || '').trim();

      if (!college_id) { status.textContent = '⚠️ Select a college.'; return; }
      if (!dept_name) { status.textContent = '⚠️ Select a department.'; return; }
      if (!semester || semester < 1 || semester > 12) { status.textContent = '⚠️ Choose a valid semester (1-12).'; return; }
      if (!course_code || !title) { status.textContent = '⚠️ Course code and title are required.'; return; }

      // Build units
      const units = [];
      unitsWrap.querySelectorAll('.unit-title').forEach((ut) => {
        const titleVal = String(ut.value || '').trim();
        const topicsWrap = ut.closest('div.rounded-xl').querySelector('[data-topics]');
        const topics = [...topicsWrap.querySelectorAll('.topic-input')].map(inp => String(inp.value || '').trim()).filter(Boolean).map(t => ({ topic: t }));
        if (titleVal) units.push({ unit_title: titleVal, topics });
      });
      if (!units.length) { status.textContent = '⚠️ Add at least one unit with a title.'; return; }

      submitBtn.disabled = true; submitBtn.textContent = 'Saving…';
      try {
        let batch_id = ctx.selectedBatchId;
        // If no existing batch selected, resolve/create using years
        if (!batch_id) {
          if (!from_year || !to_year || to_year < from_year) { status.textContent = '⚠️ Enter a valid batch year range.'; submitBtn.disabled = false; submitBtn.textContent = 'Save Course'; return; }
          const resB = await fetch(`${apiBase}/api/batches/resolve`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ college_id, dept_name, from_year, to_year }) });
          const outB = await resB.json().catch(() => ({}));
          if (!resB.ok) { status.textContent = `❌ ${outB?.detail || 'Failed to resolve batch.'}`; submitBtn.disabled = false; submitBtn.textContent = 'Save Course'; return; }
          batch_id = outB.id;
        }

        const payload = { batch_id, semester, course_code, title, units };
        const res = await fetch(`${apiBase}/api/syllabus/courses`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const out = await res.json().catch(() => ({}));
        if (!res.ok) { status.textContent = `❌ ${out?.detail || 'Failed to save course.'}`; return; }
        status.textContent = '✔ Saved. Thank you for contributing!';
        // Reset minimal fields for another entry
        codeInp.value = ''; titleInp.value = '';
        unitsWrap.innerHTML = ''; addUnit('Unit 1');
      } catch (err) {
        status.textContent = '❌ Network error. Please try again.';
      } finally {
        submitBtn.disabled = false; submitBtn.textContent = 'Save Course';
      }
    });

    // Init
    loadColleges();
