// Extracted from ui/add_syllabus.html (inline <script> #3).
    const apiBase = (window.API_BASE || 'http://0.0.0.0:10000').replace(/\/$/, '');
    const unitsWrap = document.getElementById('unitsWrap');
    const unitTpl = document.getElementById('unitTpl');
    const topicTpl = document.getElementById('topicTpl');
    const status = document.getElementById('status');
    const submitBtn = document.getElementById('submitBtn');
    const addUnitBtn = document.getElementById('addUnitBtn');
    const expandAllBtn = document.getElementById('expandAllBtn');

    let ctx = { batch_id: null, semester: null, college: null, department: null, batchLabel: null };

    function token() { try { return localStorage.getItem('px_token'); } catch { return null; } }

    function setCtxUI() {
      document.getElementById('ctxCollege').textContent = ctx.college || '—';
      document.getElementById('ctxDepartment').textContent = ctx.department || '—';
      document.getElementById('ctxBatch').textContent = ctx.batchLabel || '—';
      // default semester selector
      if (ctx.semester) {
        const sel = document.getElementById('semester');
        if (sel && !sel.value) sel.value = String(ctx.semester);
      }
    }

    async function ensureProfile() {
      const t = token();
      if (!t) { window.location.href = 'login.html'; return; }
      try {
        const res = await fetch(`${apiBase}/api/me`, { headers: { 'Authorization': `Bearer ${t}` } });
        if (!res.ok) { window.location.href = 'login.html'; return; }
        const data = await res.json();
        const p = data?.profile || {};
        // Prefer education entries for academic context
        const edu = Array.isArray(p.education_entries) ? p.education_entries.slice() : [];
        let primaryEdu = null;
        if (edu.length) {
          // choose highest current_semester, else first
          edu.sort((a, b) => ((b?.current_semester || 0) - (a?.current_semester || 0)) || ((a?.order_index || 0) - (b?.order_index || 0)));
          primaryEdu = edu[0];
        }
        if (primaryEdu) {
          ctx.batch_id = primaryEdu.batch_id || null;
          ctx.semester = primaryEdu.current_semester || p.semester || null;
          ctx.college = (primaryEdu.college && primaryEdu.college.name) || p.college?.name || primaryEdu.school || null;
          ctx.department = (primaryEdu.department && primaryEdu.department.name) || p.department?.name || primaryEdu.department || null;
          if (primaryEdu.batch_id && primaryEdu.batch) {
            ctx.batchLabel = `${primaryEdu.batch.from}–${primaryEdu.batch.to}`;
          } else if (primaryEdu.batch_range) {
            ctx.batchLabel = primaryEdu.batch_range;
          } else if (p.batch) {
            ctx.batchLabel = `${p.batch.from}–${p.batch.to}`;
          }
        } else {
          // fallback to profile fields
          ctx.batch_id = p.batch?.id || null;
          ctx.semester = p.semester || null;
          ctx.college = p.college?.name || null;
          ctx.department = p.department?.name || null;
          ctx.batchLabel = p.batch ? `${p.batch.from}–${p.batch.to}` : null;
        }
        if (!ctx.batch_id) {
          alert('No batch detected from your education entries or profile. Please add education in profile_edit first.');
          window.location.href = 'profile_edit.html';
          return;
        }
        setCtxUI();
      } catch (e) {
        window.location.href = 'login.html';
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

    document.getElementById('logoutBtn').addEventListener('click', () => { try { localStorage.removeItem('px_token'); } catch { } window.location.href = 'login.html'; });

    // Initial unit
    addUnit('Unit 1');

    // Submit
    document.getElementById('courseForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      status.classList.remove('hidden'); status.textContent = '';
      const fd = new FormData(e.currentTarget);
      const course_code = String(fd.get('course_code') || '').trim();
      const title = String(fd.get('title') || '').trim();
      const semSel = document.getElementById('semester');
      const semester = Number(semSel.value || ctx.semester || 0);
      if (!course_code || !title) { status.textContent = '⚠️ Course code and title are required.'; return; }
      if (!ctx.batch_id) { status.textContent = '⚠️ No batch found in profile.'; return; }
      if (!semester || semester < 1 || semester > 12) { status.textContent = '⚠️ Choose a valid semester (1-12) or set it in profile.'; return; }

      const units = [];
      unitsWrap.querySelectorAll('.unit-title').forEach((ut, idx) => {
        const titleVal = String(ut.value || '').trim();
        const topicsWrap = ut.closest('div.rounded-xl').querySelector('[data-topics]');
        const topics = [...topicsWrap.querySelectorAll('.topic-input')].map(inp => String(inp.value || '').trim()).filter(Boolean).map(t => ({ topic: t }));
        if (titleVal) units.push({ unit_title: titleVal, topics });
      });
      if (!units.length) { status.textContent = '⚠️ Add at least one unit with a title.'; return; }

      const payload = { batch_id: ctx.batch_id, semester, course_code, title, units };

      submitBtn.disabled = true; submitBtn.textContent = 'Saving…';
      try {
        const res = await fetch(`${apiBase}/api/syllabus/courses`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
        const out = await res.json().catch(() => ({}));
        if (!res.ok) { status.textContent = `❌ ${out?.detail || 'Failed to save course.'}`; return; }
        status.textContent = '✔ Saved. Redirecting…';
        setTimeout(() => { window.location.href = 'profile.html'; }, 600);
      } catch (err) {
        status.textContent = '❌ Network error. Please try again.';
      } finally {
        submitBtn.disabled = false; submitBtn.textContent = 'Save Course';
      }
    });

    ensureProfile();
