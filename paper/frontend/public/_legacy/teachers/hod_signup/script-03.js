// Extracted from ui/teachers/hod_signup.html (inline <script> #3).
    // API base logic (same as teacher signup)
    let API_BASE = window.API_BASE || '';
    (function resolveApiBase() {
      if (API_BASE) return;
      const origin = location.origin;
      if (location.port === '8000' || origin.includes('/ui')) { API_BASE = origin; return; }
      const host = location.hostname;
      const candidates = [origin, `http://${host}:8000`, `https://${host}:8000`];
      const testPath = '/api/public/academic-meta';
      function tryNext(i) {
        if (i >= candidates.length) { API_BASE = origin; return; }
        const base = candidates[i].replace(/\/$/, '');
        fetch(base + testPath, { method: 'GET' })
          .then(r => { if (r.ok) { API_BASE = base; } else { tryNext(i + 1); } })
          .catch(() => tryNext(i + 1));
      }
      tryNext(0);
    })();

    const form = document.getElementById('hodSignupForm');
    const previewFront = document.getElementById('previewFront');
    const previewBack = document.getElementById('previewBack');
    const uploadPromptFront = document.getElementById('uploadPromptFront');
    const uploadPromptBack = document.getElementById('uploadPromptBack');

    const collegeSelect = document.getElementById('collegeSelect');
    const degreeSelect = document.getElementById('degreeSelect');
    const departmentSelect = document.getElementById('departmentSelect');
    const statusBox = document.getElementById('appStatus');

    let academicMeta = { colleges: [], degrees: [], departments: [] };
    async function loadAcademicOptions() {
      try {
        let attempts = 0; while ((!API_BASE || API_BASE === location.origin) && attempts < 5) { await new Promise(r => setTimeout(r, 120)); attempts++; }
        const url = (API_BASE || location.origin).replace(/\/$/, '') + '/api/public/academic-meta';
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to load academic metadata');
        academicMeta = await res.json();
      } catch (e) {
        statusBox.className = 'mt-6 text-sm rounded-xl px-4 py-3 font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
        statusBox.style.display = 'block';
        statusBox.textContent = 'Academic metadata load failed. Please ensure backend API (:8000) is running.';
        return;
      }
      populateColleges();
      populateDegrees();
      populateDepartments();
    }

    function clearSelect(sel, placeholder) {
      sel.innerHTML = '';
      const o = document.createElement('option'); o.value = ''; o.textContent = placeholder; sel.appendChild(o);
    }
    function populateColleges() {
      clearSelect(collegeSelect, '-- Select College --');
      (academicMeta.colleges || []).forEach(c => { const opt = document.createElement('option'); opt.value = c.id; opt.textContent = c.name; collegeSelect.appendChild(opt); });
    }
    function populateDegrees() {
      clearSelect(degreeSelect, '-- Select Degree --');
      const collegeId = collegeSelect.value;
      (academicMeta.degrees || []).filter(d => !collegeId || d.college_id === collegeId).forEach(d => { const opt = document.createElement('option'); opt.value = d.id; opt.textContent = d.name; degreeSelect.appendChild(opt); });
    }
    function populateDepartments() {
      clearSelect(departmentSelect, '-- Select Department --');
      const collegeId = collegeSelect.value;
      const degreeId = degreeSelect.value;
      (academicMeta.departments || []).filter(dep => (!collegeId || dep.college_id === collegeId) && (!degreeId || dep.degree_id === degreeId)).forEach(dep => { const opt = document.createElement('option'); opt.value = dep.id; opt.textContent = dep.name; departmentSelect.appendChild(opt); });
    }

    collegeSelect.addEventListener('change', () => { populateDegrees(); populateDepartments(); });
    degreeSelect.addEventListener('change', () => { populateDepartments(); });

    function attachPreview(input, img, promptEl) {
      input.addEventListener('change', () => {
        const f = input.files?.[0];
        if (!f) { img.classList.add('hidden'); promptEl.classList.remove('hidden'); return; }
        img.src = URL.createObjectURL(f);
        img.classList.remove('hidden');
        promptEl.classList.add('hidden');
      });
    }

    attachPreview(document.getElementById('id_card_front'), previewFront, uploadPromptFront);
    attachPreview(document.getElementById('id_card_back'), previewBack, uploadPromptBack);

    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    const submitSpinner = document.getElementById('submitSpinner');

    function setLoading(loading) {
      submitBtn.disabled = loading;
      if (loading) { submitText.textContent = 'Submitting...'; submitSpinner.classList.remove('hidden'); }
      else { submitText.textContent = 'Submit HOD Application'; submitSpinner.classList.add('hidden'); }
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      fd.set('college', collegeSelect.options[collegeSelect.selectedIndex]?.text || '');
      fd.set('degree', degreeSelect.options[degreeSelect.selectedIndex]?.text || '');
      fd.set('department', departmentSelect.options[departmentSelect.selectedIndex]?.text || '');
      statusBox.style.display = 'none';
      setLoading(true);
      try {
        const base = (API_BASE || location.origin).replace(/\/$/, '');
        const res = await fetch(base + '/api/hod/signup', { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Signup failed');
        try {
          localStorage.removeItem('teacherToken');
          localStorage.removeItem('px_token');
          localStorage.removeItem('px_refresh_token');
          localStorage.removeItem('px_token_expires_at');
        } catch { }
        statusBox.className = 'mt-6 text-sm rounded-xl px-4 py-3 font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
        statusBox.textContent = 'HOD application submitted successfully! Redirecting to teacher login...';
        statusBox.style.display = 'block';
        setTimeout(() => { window.location.href = 'teacher_login.html'; }, 1500);
      } catch (err) {
        setLoading(false);
        alert(err.message);
      }
    });

    loadAcademicOptions();

    // Theme toggle
    (function initThemeToggle(){
      const themeToggleBtn = document.querySelector('[data-theme-toggle]');
      const htmlElement = document.documentElement;
      function updateThemeIcon(){
        if (!themeToggleBtn) return;
        const icon = themeToggleBtn.querySelector('.material-symbols-rounded');
        if (!icon) return;
        icon.textContent = htmlElement.classList.contains('dark') ? 'light_mode' : 'dark_mode';
      }
      if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', (e) => {
          e.preventDefault();
          htmlElement.classList.toggle('dark');
          const isDark = htmlElement.classList.contains('dark');
          localStorage.setItem('px_theme', isDark ? 'dark' : 'light');
          updateThemeIcon();
        });
        updateThemeIcon();
      }
    })();
