// Extracted from ui/branch_college.html (inline <script> #1).
    (() => {
      const stored = localStorage.getItem('px_theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const dark = stored ? stored === 'dark' : prefersDark;
      if (dark) document.documentElement.classList.add('dark');
    })();

    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', () => {
      const root = document.documentElement;
      const dark = root.classList.toggle('dark');
      localStorage.setItem('px_theme', dark ? 'dark' : 'light');
      themeToggle.querySelector('.material-symbols-rounded').textContent = dark ? 'light_mode' : 'dark_mode';
    });

    const ui = {
      pageTitle: document.getElementById('pageTitle'),
      logoWrap: document.getElementById('logoWrap'),
      collegeName: document.getElementById('collegeName'),
      collegeCount: document.getElementById('collegeCount'),
      statusText: document.getElementById('statusText'),
      errorText: document.getElementById('errorText'),
      hierarchyRoot: document.getElementById('hierarchyRoot'),
      emptyText: document.getElementById('emptyText')
    };

    function getToken() {
      const token =
        localStorage.getItem('px_token') ||
        localStorage.getItem('access_token') ||
        localStorage.getItem('token') ||
        localStorage.getItem('teacherToken') ||
        '';
      return token && token !== '__COOKIE_AUTH__' ? token : '';
    }

    function authHeaders() {
      const t = getToken();
      return t ? { Authorization: `Bearer ${t}` } : {};
    }

    async function requireAdminAccess(apiBase) {
      const res = await fetch(apiBase + '/api/admin/self-check', {
        method: 'GET',
        headers: { ...authHeaders() },
        credentials: 'include'
      });
      if (res.status === 401) throw new Error('Unauthorized. Please sign in as admin.');
      if (res.status === 403) throw new Error('Forbidden. This page is only for admin users.');
      if (!res.ok) {
        const out = await res.json().catch(() => ({}));
        throw new Error(out?.detail || `Admin validation failed (${res.status})`);
      }
      return await res.json().catch(() => ({}));
    }

    async function resolveApiBase() {
      if (typeof window.API_BASE === 'string' && window.API_BASE.trim()) {
        return window.API_BASE.replace(/\/$/, '');
      }
      return 'http://0.0.0.0:10000';
    }

    function createNode(depth, label, count, openByDefault = false) {
      const details = document.createElement('details');
      details.className = `node node-depth-${depth} p-3`;
      if (openByDefault) details.open = true;

      const summary = document.createElement('summary');
      summary.className = 'flex items-center justify-between gap-3';
      summary.innerHTML = `
        <div class="flex items-center gap-2 min-w-0">
          <span class="material-symbols-rounded text-[18px] muted">account_tree</span>
          <span class="font-semibold truncate">${label}</span>
        </div>
        <span class="badge">${count} students</span>
      `;

      details.appendChild(summary);
      return details;
    }

    function renderCollegeHierarchy(college) {
      ui.hierarchyRoot.innerHTML = '';
      const degrees = Array.isArray(college?.degrees) ? college.degrees : [];
      if (!degrees.length) {
        ui.emptyText.classList.remove('hidden');
        return;
      }
      ui.emptyText.classList.add('hidden');

      for (const degree of degrees) {
        const degreeEl = createNode(1, `Degree: ${degree?.name || 'Unknown Degree'}`, Number(degree?.count || 0), true);

        const departments = Array.isArray(degree?.departments) ? degree.departments : [];
        for (const department of departments) {
          const deptEl = createNode(2, `Department: ${department?.name || 'Unknown Department'}`, Number(department?.count || 0), false);

          const batches = Array.isArray(department?.batches) ? department.batches : [];
          for (const batch of batches) {
            const batchEl = createNode(3, `Batch: ${batch?.name || 'Unknown Batch'}`, Number(batch?.count || 0), false);

            const sectionWrap = document.createElement('div');
            sectionWrap.className = 'mt-3 ml-2 flex flex-wrap gap-2';
            const sections = Array.isArray(batch?.sections) ? batch.sections : [];
            for (const section of sections) {
              const sectionTag = document.createElement('div');
              sectionTag.className = 'section-pill';
              sectionTag.textContent = `Section ${section?.name || 'Unknown'} - ${Number(section?.count || 0)}`;
              sectionWrap.appendChild(sectionTag);
            }

            batchEl.appendChild(sectionWrap);
            deptEl.appendChild(batchEl);
          }

          degreeEl.appendChild(deptEl);
        }

        ui.hierarchyRoot.appendChild(degreeEl);
      }
    }

    async function fetchBranchHierarchy(apiBase) {
      const res = await fetch(apiBase + '/api/admin/branch-hierarchy', {
        method: 'GET',
        headers: { ...authHeaders() },
        credentials: 'include'
      });
      if (res.status === 401) throw new Error('Unauthorized. Please sign in as admin.');
      if (res.status === 403) throw new Error('Forbidden. This page is only for admin users.');
      if (!res.ok) {
        const out = await res.json().catch(() => ({}));
        throw new Error(out?.detail || `Failed to load hierarchy (${res.status})`);
      }
      return await res.json().catch(() => ({}));
    }

    async function fetchColleges(apiBase) {
      const res = await fetch(apiBase + '/api/colleges', {
        method: 'GET',
        headers: { ...authHeaders() },
        credentials: 'include'
      });
      if (!res.ok) return [];
      const rows = await res.json().catch(() => []);
      return Array.isArray(rows) ? rows : [];
    }

    function params() {
      return new URLSearchParams(window.location.search || '');
    }

    function setLogo(collegeName, logoUrl) {
      if (logoUrl) {
        ui.logoWrap.innerHTML = `<img src="${logoUrl}" alt="${collegeName} logo" class="h-16 w-16 rounded-2xl object-cover ring-2 ring-white/60 dark:ring-white/10 shadow-md"/>`;
        return;
      }
      ui.logoWrap.textContent = 'LOGO';
    }

    // Fetch the actual degrees → departments → batches from the colleges DB tables
    async function fetchCollegeDbStructure(apiBase, collegeId) {
      if (!collegeId) return null;
      try {
        const res = await fetch(apiBase + `/api/colleges/${collegeId}/degrees`, {
          method: 'GET',
          headers: { ...authHeaders() },
          credentials: 'include'
        });
        if (!res.ok) return null;
        const data = await res.json().catch(() => []);
        return Array.isArray(data) ? data : [];
      } catch (_) { return null; }
    }

    // Filter hierarchy to only include degrees, departments, and batches that exist in the DB
    function filterHierarchyByDb(college, dbDegrees) {
      if (!dbDegrees || !dbDegrees.length) return college;

      // Build lookup sets from the DB structure
      const dbDegreeNames = new Set(dbDegrees.map(d => String(d?.name || '').trim().toLowerCase()).filter(Boolean));
      const dbDeptNames = new Set();
      const dbBatchRanges = new Set();

      for (const degree of dbDegrees) {
        const departments = Array.isArray(degree?.departments) ? degree.departments : [];
        for (const dept of departments) {
          const deptName = String(dept?.name || '').trim().toLowerCase();
          if (deptName) dbDeptNames.add(deptName);
          const batches = Array.isArray(dept?.batches) ? dept.batches : [];
          for (const batch of batches) {
            // batches from DB have from_year/to_year (or aliased as from/to in JSON)
            const fromY = batch?.from_year || batch?.from;
            const toY = batch?.to_year || batch?.to;
            if (fromY && toY) {
              dbBatchRanges.add(`${fromY}-${toY}`);
            }
            // Also add by name if present
            const bName = String(batch?.name || '').trim().toLowerCase();
            if (bName) dbBatchRanges.add(bName);
          }
        }
      }

      // Filter degrees
      const filteredDegrees = (Array.isArray(college?.degrees) ? college.degrees : [])
        .filter(degree => dbDegreeNames.has(String(degree?.name || '').trim().toLowerCase()))
        .map(degree => {
          // Filter departments within this degree
          const filteredDepts = (Array.isArray(degree?.departments) ? degree.departments : [])
            .filter(dept => dbDeptNames.has(String(dept?.name || '').trim().toLowerCase()))
            .map(dept => {
              // Filter batches within this department
              const filteredBatches = (Array.isArray(dept?.batches) ? dept.batches : [])
                .filter(batch => {
                  const batchName = String(batch?.name || '').trim().toLowerCase();
                  return dbBatchRanges.has(batchName);
                });
              // Recalculate department count from filtered batches
              const deptCount = filteredBatches.reduce((sum, b) => sum + Number(b?.count || 0), 0);
              return { ...dept, batches: filteredBatches, count: deptCount };
            })
            .filter(dept => dept.batches.length > 0); // Remove empty depts
          // Recalculate degree count from filtered departments
          const degreeCount = filteredDepts.reduce((sum, d) => sum + Number(d?.count || 0), 0);
          return { ...degree, departments: filteredDepts, count: degreeCount };
        })
        .filter(degree => degree.departments.length > 0); // Remove empty degrees

      // Recalculate college count
      const totalCount = filteredDegrees.reduce((sum, d) => sum + Number(d?.count || 0), 0);
      return { ...college, degrees: filteredDegrees, count: totalCount };
    }

    async function init() {
      try {
        ui.errorText.classList.add('hidden');
        const apiBase = await resolveApiBase();
        await requireAdminAccess(apiBase);
        const [payload, colleges] = await Promise.all([
          fetchBranchHierarchy(apiBase),
          fetchColleges(apiBase)
        ]);

        const list = Array.isArray(payload?.hierarchy) ? payload.hierarchy : [];
        const q = params();
        const collegeId = String(q.get('collegeId') || '').trim();
        const collegeName = String(q.get('collegeName') || '').trim();

        let target = null;
        if (collegeId) {
          target = list.find(item => String(item?.id || '').trim() === collegeId) || null;
        }
        if (!target && collegeName) {
          target = list.find(item => String(item?.name || '').trim().toLowerCase() === collegeName.toLowerCase()) || null;
        }

        if (!target) {
          ui.statusText.textContent = 'College not found in hierarchy data.';
          ui.emptyText.classList.remove('hidden');
          return;
        }

        const meta = colleges.find(item => String(item?.id || '').trim() === String(target?.id || '').trim()) ||
          colleges.find(item => String(item?.name || '').trim().toLowerCase() === String(target?.name || '').trim().toLowerCase()) ||
          null;

        // Fetch the actual DB structure (degrees, departments, batches) and filter hierarchy
        const resolvedId = String(target?.id || meta?.id || collegeId || '').trim();
        if (resolvedId) {
          const dbDegrees = await fetchCollegeDbStructure(apiBase, resolvedId);
          if (dbDegrees && dbDegrees.length) {
            target = filterHierarchyByDb(target, dbDegrees);
          }
        }

        const displayName = String(target?.name || collegeName || 'College Hierarchy');
        ui.pageTitle.textContent = `${displayName} Hierarchy`;
        ui.collegeName.textContent = displayName;
        ui.collegeCount.textContent = `${Number(target?.count || 0)} students`;
        ui.statusText.textContent = 'Loaded successfully.';
        setLogo(displayName, meta?.logo_url || '');

        renderCollegeHierarchy(target);
      } catch (err) {
        ui.statusText.textContent = 'Load failed.';
        ui.errorText.textContent = err instanceof Error ? err.message : 'Failed to load hierarchy.';
        ui.errorText.classList.remove('hidden');
      }
    }

    init();
