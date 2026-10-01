// Extracted from ui/active_users.html (inline <script> #1).
    let ALL_USERS = [];

    function esc(s) {
      return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    function fmt(iso) {
      if (!iso) return '—';
      try {
        const d = new Date(iso);
        if (isNaN(d.getTime())) return String(iso);
        return d.toLocaleString();
      } catch (_) {
        return String(iso);
      }
    }

    function skeletonRows(count) {
      const rows = [];
      for (let i = 0; i < count; i++) {
        rows.push(`
          <tr>
            <td class="px-5 py-4"><div class="h-4 w-44 rounded-md skeleton"></div></td>
            <td class="px-5 py-4"><div class="h-4 w-40 rounded-md skeleton"></div></td>
            <td class="px-5 py-4"><div class="h-4 w-28 rounded-md skeleton"></div></td>
            <td class="px-5 py-4"><div class="h-4 w-10 rounded-md skeleton"></div></td>
            <td class="px-5 py-4"><div class="h-4 w-14 rounded-md skeleton"></div></td>
            <td class="px-5 py-4"><div class="h-4 w-40 rounded-md skeleton"></div></td>
            <td class="px-5 py-4"><div class="h-4 w-40 rounded-md skeleton"></div></td>
            <td class="px-5 py-4"><div class="h-4 w-40 rounded-md skeleton"></div></td>
            <td class="px-5 py-4 text-right"><div class="h-4 w-16 rounded-md skeleton ml-auto"></div></td>
          </tr>
        `);
      }
      return rows.join('');
    }

    function normalizeValue(v) {
      if (v === null || v === undefined) return '';
      const s = String(v).trim();
      return s;
    }

    function uniqSorted(values) {
      const set = new Set();
      for (const v of values) {
        const nv = normalizeValue(v);
        if (nv) set.add(nv);
      }
      return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
    }

    function fillSelect(selectEl, values) {
      const current = selectEl.value;
      const options = [''].concat(values);
      selectEl.innerHTML = options.map(v => {
        const label = v ? v : 'All';
        return `<option value="${esc(v)}">${esc(label)}</option>`;
      }).join('');
      // restore selection if still present
      if (options.includes(current)) selectEl.value = current;
      else selectEl.value = '';
    }

    function getFilters() {
      return {
        college: document.getElementById('filterCollege').value,
        dept: document.getElementById('filterDept').value,
        sem: document.getElementById('filterSem').value,
        section: document.getElementById('filterSection').value,
      };
    }

    function applyFilters(users) {
      const f = getFilters();
      return users.filter(u => {
        if (f.college && normalizeValue(u.college) !== f.college) return false;
        if (f.dept && normalizeValue(u.department) !== f.dept) return false;
        if (f.section && normalizeValue(u.section) !== f.section) return false;
        if (f.sem) {
          const sem = normalizeValue(u.semester);
          if (sem !== f.sem) return false;
        }
        return true;
      });
    }

    function updateCounts(filtered, total) {
      document.getElementById('filteredCount').textContent = String(filtered);
      document.getElementById('totalCount').textContent = String(total);
    }

    function renderTable(users) {
      const tbody = document.getElementById('tbody');
      const emptyEl = document.getElementById('empty');

      if (!users.length) {
        tbody.innerHTML = '';
        try {
          const f = getFilters();
          const hasFilter = !!(f.college || f.dept || f.sem || f.section);
          emptyEl.textContent = (ALL_USERS.length && hasFilter)
            ? 'No users match the current filters.'
            : 'No active users found in the last 24 hours.';
        } catch (_) { }
        emptyEl.classList.remove('hidden');
        return;
      }

      emptyEl.classList.add('hidden');
      const rowsHtml = users.map(u => {
        const name = u.name || '—';
        const email = u.email || '';
        const student = email ? `${esc(name)}<div class="text-xs text-neutral-600 dark:text-white/60 mt-0.5">${esc(email)}</div>` : esc(name);

        const college = u.college || '—';
        const dept = u.department || '—';
        const sem = (u.semester ?? '—');
        const section = (u.section ?? '—');

        const last24 = fmt(u.last_active_24h);
        const firstToday = fmt(u.first_active_today);
        const lastToday = fmt(u.last_active_today);
        const interactions = Number(u.interactions_today || 0);

        return `
          <tr class="hover:bg-white/30 dark:hover:bg-white/5 transition">
            <td class="px-5 py-4 font-semibold">${student}</td>
            <td class="px-5 py-4">${esc(college)}</td>
            <td class="px-5 py-4">${esc(dept)}</td>
            <td class="px-5 py-4 tabular-nums">${esc(sem)}</td>
            <td class="px-5 py-4">${esc(section)}</td>
            <td class="px-5 py-4">${esc(last24)}</td>
            <td class="px-5 py-4">${esc(firstToday)}</td>
            <td class="px-5 py-4">${esc(lastToday)}</td>
            <td class="px-5 py-4 text-right tabular-nums font-bold">${interactions}</td>
          </tr>`;
      }).join('');

      tbody.innerHTML = rowsHtml;
    }

    function rebuildFilterOptions() {
      const collegeVals = uniqSorted(ALL_USERS.map(u => u.college));
      const deptVals = uniqSorted(ALL_USERS.map(u => u.department));
      const semVals = uniqSorted(ALL_USERS.map(u => u.semester));
      const sectionVals = uniqSorted(ALL_USERS.map(u => u.section));

      fillSelect(document.getElementById('filterCollege'), collegeVals);
      fillSelect(document.getElementById('filterDept'), deptVals);
      fillSelect(document.getElementById('filterSem'), semVals);
      fillSelect(document.getElementById('filterSection'), sectionVals);
    }

    function rerender() {
      const filtered = applyFilters(ALL_USERS);
      updateCounts(filtered.length, ALL_USERS.length);
      renderTable(filtered);
    }

    async function load() {
      const errEl = document.getElementById('error');
      const emptyEl = document.getElementById('empty');
      const tbody = document.getElementById('tbody');

      errEl.classList.add('hidden');
      emptyEl.classList.add('hidden');

      tbody.innerHTML = skeletonRows(8);

      try {
        const base = (window.API_BASE || location.origin).replace(/\/$/, '');
        const url = base + '/analytics/active-users?limit=200';
        const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
        const data = await res.json();
        if (!res.ok) throw new Error((data && data.detail) ? data.detail : ('HTTP ' + res.status));

        // Summary panels were removed — keep total count for filters
        ALL_USERS = Array.isArray(data.users) ? data.users : [];
        document.getElementById('totalCount').textContent = String(ALL_USERS.length);

        if (!ALL_USERS.length) {
          tbody.innerHTML = '';
          emptyEl.classList.remove('hidden');
          updateCounts(0, 0);
          return;
        }

        rebuildFilterOptions();
        rerender();
      } catch (e) {
        tbody.innerHTML = '';
        errEl.textContent = (e && e.message) ? e.message : String(e);
        errEl.classList.remove('hidden');
      }
    }

    document.getElementById('refreshBtn').addEventListener('click', load);
    document.getElementById('themeBtn').addEventListener('click', function () {
      try { if (window.Theme && Theme.toggle) Theme.toggle(); } catch (_) { }
    });

    document.getElementById('filterCollege').addEventListener('change', rerender);
    document.getElementById('filterDept').addEventListener('change', rerender);
    document.getElementById('filterSem').addEventListener('change', rerender);
    document.getElementById('filterSection').addEventListener('change', rerender);
    document.getElementById('clearFiltersBtn').addEventListener('click', function () {
      document.getElementById('filterCollege').value = '';
      document.getElementById('filterDept').value = '';
      document.getElementById('filterSem').value = '';
      document.getElementById('filterSection').value = '';
      rerender();
    });

    load();
