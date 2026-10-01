// Extracted from ui/admin/control-panel/plans-manager.html (inline <script> #2).
    (function () {
      const $ = (id) => document.getElementById(id);
      const form = $('planForm');
      const tbody = $('plansTbody');
      const statusEl = $('status');
      const searchInput = $('searchPlan');

      let plans = [];
      let collegesCache = [];
      let collegesLoadPromise = null;
      const collegeDetailCache = new Map();
      let currentDegrees = [];
      let currentDepartments = [];

      function numOrNull(v) { return v === '' || v == null ? null : Number(v); }
      function boolVal(id) { return !!$(id).checked; }
      function textVal(id) { return ($(id).value || '').trim(); }

      function toBatchLabel(batch) {
        const from = Number(batch?.from ?? batch?.from_year);
        const to = Number(batch?.to ?? batch?.to_year);
        if (Number.isFinite(from) && Number.isFinite(to)) return `${from}-${to}`;
        return String(batch?.range || '').trim();
      }

      function fillSelectOptions(select, options, placeholder) {
        if (!select) return;
        const current = select.value;
        select.innerHTML = '';
        const base = document.createElement('option');
        base.value = '';
        base.textContent = placeholder;
        select.appendChild(base);
        (options || []).forEach((opt) => {
          if (!opt) return;
          const option = document.createElement('option');
          option.value = String(opt.value);
          option.textContent = opt.label;
          select.appendChild(option);
        });
        if ([...select.options].some((opt) => opt.value === current)) select.value = current;
      }

      function resetAcademicChain(level) {
        if (level <= 1) {
          currentDegrees = [];
          $('applicable_degree').disabled = true;
          fillSelectOptions($('applicable_degree'), [], 'All');
        }
        if (level <= 2) {
          currentDepartments = [];
          $('applicable_department').disabled = true;
          fillSelectOptions($('applicable_department'), [], 'All');
        }
        if (level <= 3) {
          $('applicable_batch').disabled = true;
          fillSelectOptions($('applicable_batch'), [], 'All');
        }
      }

      async function loadCollegesList() {
        if (collegesCache.length) return collegesCache;
        if (!collegesLoadPromise) {
          collegesLoadPromise = fetch(`${CP.API}/api/colleges`, { headers: CP.authHeaders() })
            .then((res) => {
              if (!res.ok) throw new Error(`Failed colleges (${res.status})`);
              return res.json();
            })
            .then((items) => {
              collegesCache = Array.isArray(items)
                ? items.filter((col) => col && col.id && col.name).map((col) => ({ id: String(col.id), name: col.name }))
                : [];
              return collegesCache;
            })
            .catch((err) => {
              collegesLoadPromise = null;
              throw err;
            });
        }
        return collegesLoadPromise;
      }

      async function loadCollegeDetails(collegeId) {
        if (!collegeId) return null;
        const key = String(collegeId);
        if (collegeDetailCache.has(key)) return collegeDetailCache.get(key);
        const res = await fetch(`${CP.API}/api/colleges/${key}`, { headers: CP.authHeaders() });
        if (!res.ok) throw new Error(`Failed college details (${res.status})`);
        const data = await res.json();
        collegeDetailCache.set(key, data);
        return data;
      }

      async function onCollegeChanged() {
        const selectedCollege = textVal('applicable_college');
        resetAcademicChain(1);
        if (!selectedCollege) return;

        const details = await loadCollegeDetails(selectedCollege);
        currentDegrees = Array.isArray(details?.degrees) ? details.degrees : [];
        const degreeOptions = currentDegrees.map((deg) => ({ value: String(deg.id), label: deg.name }));
        $('applicable_degree').disabled = false;
        fillSelectOptions($('applicable_degree'), degreeOptions, 'All');
      }

      async function onDegreeChanged() {
        const selectedDegree = textVal('applicable_degree');
        resetAcademicChain(2);
        if (!selectedDegree) return;

        const degree = currentDegrees.find((deg) => String(deg.id) === selectedDegree) || null;
        currentDepartments = Array.isArray(degree?.departments) ? degree.departments : [];
        const departmentOptions = currentDepartments.map((dep) => ({ value: String(dep.id), label: dep.name }));
        $('applicable_department').disabled = false;
        fillSelectOptions($('applicable_department'), departmentOptions, 'All');
      }

      async function onDepartmentChanged() {
        const selectedDepartment = textVal('applicable_department');
        resetAcademicChain(3);
        if (!selectedDepartment) return;

        const res = await fetch(`${CP.API}/api/departments/${encodeURIComponent(selectedDepartment)}/batches/full`, { headers: CP.authHeaders() });
        if (!res.ok) throw new Error(`Failed department batches (${res.status})`);
        const batches = await res.json().catch(() => []);
        const batchOptions = batches
          .map((batch) => {
            const label = toBatchLabel(batch);
            if (!label || !batch?.id) return null;
            return { value: String(batch.id), label };
          })
          .filter(Boolean);

        $('applicable_batch').disabled = false;
        fillSelectOptions($('applicable_batch'), batchOptions, 'All');
      }

      function payloadFromForm() {
        const neverExpiry = boolVal('availability_never');
        return {
          name: textVal('name'),
          description: textVal('description') || null,
          price_inr: Number(textVal('price_inr') || 0),
          duration_days: Number(textVal('duration_days') || 30),
          active_status: boolVal('active_status'),
          unlimited_topics: boolVal('unlimited_topics'),
          max_topics_per_day: numOrNull(textVal('max_topics_per_day')),
          max_subjects_per_day: numOrNull(textVal('max_subjects_per_day')),
          mcq_access: boolVal('mcq_access'),
          blink_access: boolVal('blink_access'),
          ai_chat_access: boolVal('ai_chat_access'),
          pdf_download: boolVal('pdf_download'),
          print_discount_percent: Number(textVal('print_discount_percent') || 0),
          leaderboard_access: boolVal('leaderboard_access'),
          applicable_college: textVal('applicable_college') || null,
          applicable_degree: textVal('applicable_degree') || null,
          applicable_department: textVal('applicable_department') || null,
          applicable_batch: textVal('applicable_batch') || null,
          applicable_semester: numOrNull(textVal('applicable_semester')),
          early_bird_tag: boolVal('early_bird_tag'),
          availability_expires_at: neverExpiry ? null : (textVal('availability_expires_at') ? new Date(textVal('availability_expires_at')).toISOString() : null),
          coupon_enabled: boolVal('coupon_enabled')
        };
      }

      function updatePricePreview() {
        const rawPrice = Number(textVal('price_inr') || 0);
        const rawDiscount = Number(textVal('print_discount_percent') || 0);
        const price = Number.isFinite(rawPrice) ? Math.max(0, rawPrice) : 0;
        const discountPercent = Number.isFinite(rawDiscount) ? Math.min(100, Math.max(0, rawDiscount)) : 0;
        const discountAmount = (price * discountPercent) / 100;
        const effective = Math.max(0, price - discountAmount);
        $('discount_amount_preview').textContent = `₹${discountAmount.toFixed(2)}`;
        $('effective_price_preview').textContent = `₹${effective.toFixed(2)}`;
      }

      function syncAvailabilityMode() {
        const never = boolVal('availability_never');
        $('availability_expires_at').disabled = never;
        if (never) $('availability_expires_at').value = '';
      }

      async function setForm(row) {
        $('planId').value = row?.id || '';
        $('name').value = row?.name || '';
        $('description').value = row?.description || '';
        $('price_inr').value = row?.price_inr ?? 0;
        $('duration_days').value = row?.duration_days ?? 30;
        $('active_status').checked = row ? !!row.active_status : true;
        $('unlimited_topics').checked = !!row?.unlimited_topics;
        $('max_topics_per_day').value = row?.max_topics_per_day ?? '';
        $('max_subjects_per_day').value = row?.max_subjects_per_day ?? '';
        $('mcq_access').checked = row ? !!row.mcq_access : true;
        $('blink_access').checked = row ? !!row.blink_access : true;
        $('ai_chat_access').checked = row ? !!row.ai_chat_access : true;
        $('pdf_download').checked = row ? !!row.pdf_download : true;
        $('print_discount_percent').value = row?.print_discount_percent ?? 0;
        $('leaderboard_access').checked = row ? !!row.leaderboard_access : true;
        $('applicable_semester').value = row?.applicable_semester ?? '';
        $('early_bird_tag').checked = !!row?.early_bird_tag;
        $('availability_never').checked = !row?.availability_expires_at;
        $('availability_expires_at').value = row?.availability_expires_at ? new Date(row.availability_expires_at).toISOString().slice(0, 16) : '';
        syncAvailabilityMode();
        $('coupon_enabled').checked = !!row?.coupon_enabled;
        updatePricePreview();

        $('applicable_college').value = row?.applicable_college || '';
        await onCollegeChanged();
        $('applicable_degree').value = row?.applicable_degree || '';
        await onDegreeChanged();
        $('applicable_department').value = row?.applicable_department || '';
        await onDepartmentChanged();
        $('applicable_batch').value = row?.applicable_batch || '';
      }

      function render() {
        const query = (searchInput.value || '').trim().toLowerCase();
        const filtered = plans.filter((p) => {
          if (!query) return true;
          return String(p.name || '').toLowerCase().includes(query) || String(p.plan_code || '').toLowerCase().includes(query);
        });

        if (!filtered.length) {
          tbody.innerHTML = '<tr><td colspan="4" class="py-6 px-3 text-slate-500 dark:text-white/60">No plans found.</td></tr>';
          return;
        }

        tbody.innerHTML = filtered.map((p) => `
          <tr class="border-b border-black/5 dark:border-white/5 hover:bg-black/[0.02] dark:hover:bg-white/[0.04]">
            <td class="py-3 px-3">
              <div class="font-medium">${CP.escapeHtml(p.name)}</div>
              <div class="text-xs text-slate-500 dark:text-white/60">${CP.escapeHtml(p.plan_code)}</div>
            </td>
            <td class="px-3">₹${Number(p.price_inr || 0).toFixed(2)} / ${p.duration_days || 0}d</td>
            <td class="px-3">${p.active_status ? '<span class="text-emerald-600 dark:text-emerald-300">Active</span>' : '<span class="text-slate-500 dark:text-white/60">Inactive</span>'}</td>
            <td class="text-right px-3">
              <div class="inline-flex gap-1">
                <button data-act="edit" data-id="${p.id}" class="px-2 py-1 rounded bg-black/5 dark:bg-white/10 text-xs">Edit</button>
                <button data-act="dup" data-id="${p.id}" class="px-2 py-1 rounded bg-black/5 dark:bg-white/10 text-xs">Duplicate</button>
                <button data-act="toggle" data-id="${p.id}" class="px-2 py-1 rounded bg-black/5 dark:bg-white/10 text-xs">${p.active_status ? 'Disable' : 'Enable'}</button>
                <button data-act="rest" data-id="${p.id}" class="px-2 py-1 rounded bg-amber-500/20 text-xs">Rest</button>
                <button data-act="del" data-id="${p.id}" class="px-2 py-1 rounded bg-red-500/20 text-xs">Delete</button>
              </div>
            </td>
          </tr>
        `).join('');
      }

      async function loadAcademicSelectors() {
        const colleges = await loadCollegesList();
        const collegeOptions = colleges.map((col) => ({ value: col.id, label: col.name }));
        fillSelectOptions($('applicable_college'), collegeOptions, 'All');
        resetAcademicChain(1);
      }

      async function loadPlans() {
        const data = await CP.fetchJson('/api/admin/plans');
        plans = data.plans || [];
        render();
      }

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          const planId = textVal('planId');
          const body = payloadFromForm();
          if (planId) await CP.fetchJson(`/api/admin/plans/${encodeURIComponent(planId)}`, { method: 'PUT', body: JSON.stringify(body) });
          else await CP.fetchJson('/api/admin/plans', { method: 'POST', body: JSON.stringify(body) });
          CP.showStatus(statusEl, 'Plan saved successfully.', 'success');
          await setForm(null);
          await loadPlans();
        } catch (err) {
          CP.showStatus(statusEl, err.message || 'Save failed', 'error');
        }
      });

      $('applicable_college').addEventListener('change', async () => {
        try {
          await onCollegeChanged();
        } catch (err) {
          CP.showStatus(statusEl, err.message || 'Failed to load degrees', 'error');
        }
      });

      $('applicable_degree').addEventListener('change', async () => {
        try {
          await onDegreeChanged();
        } catch (err) {
          CP.showStatus(statusEl, err.message || 'Failed to load departments', 'error');
        }
      });

      $('applicable_department').addEventListener('change', async () => {
        try {
          await onDepartmentChanged();
        } catch (err) {
          CP.showStatus(statusEl, err.message || 'Failed to load batches', 'error');
        }
      });

      $('resetBtn').addEventListener('click', async () => {
        await setForm(null);
      });

      $('availability_never').addEventListener('change', syncAvailabilityMode);
      $('price_inr').addEventListener('input', updatePricePreview);
      $('print_discount_percent').addEventListener('input', updatePricePreview);

      $('allDegreeBtn').addEventListener('click', async () => {
        $('applicable_degree').value = '';
        await onDegreeChanged();
      });

      $('allDepartmentBtn').addEventListener('click', async () => {
        $('applicable_department').value = '';
        await onDepartmentChanged();
      });

      $('allBatchBtn').addEventListener('click', () => {
        $('applicable_batch').value = '';
      });

      $('reloadBtn').addEventListener('click', () => loadPlans().catch((e) => CP.showStatus(statusEl, e.message, 'error')));
      searchInput.addEventListener('input', render);

      tbody.addEventListener('click', async (e) => {
        const btn = e.target.closest('button[data-act]');
        if (!btn) return;
        const act = btn.getAttribute('data-act');
        const id = btn.getAttribute('data-id');
        const plan = plans.find((p) => p.id === id);
        if (!plan) return;
        try {
          if (act === 'edit') await setForm(plan);
          else if (act === 'dup') {
            await CP.fetchJson(`/api/admin/plans/${encodeURIComponent(id)}/duplicate`, { method: 'POST' });
            await loadPlans();
          } else if (act === 'toggle') {
            await CP.fetchJson(`/api/admin/plans/${encodeURIComponent(id)}/disable?active=${plan.active_status ? 'false' : 'true'}`, { method: 'POST' });
            await loadPlans();
          } else if (act === 'rest') {
            if (!confirm('Reset today\'s limits for all active users of this plan?')) return;
            const out = await CP.fetchJson(`/api/admin/plans/${encodeURIComponent(id)}/rest`, { method: 'POST' });
            const users = Number(out?.users || 0);
            const resetRows = Number(out?.reset_rows || 0);
            CP.showStatus(statusEl, `Rest done. Users: ${users}, reset rows: ${resetRows}`, 'success');
          } else if (act === 'del') {
            if (!confirm('Delete this plan permanently?')) return;
            await CP.fetchJson(`/api/admin/plans/${encodeURIComponent(id)}`, { method: 'DELETE' });
            await loadPlans();
          }
        } catch (err) {
          CP.showStatus(statusEl, err.message || 'Action failed', 'error');
        }
      });

      async function init() {
        CP.initPageChrome('plans');
        try {
          await CP.ensureAdmin();
          await loadAcademicSelectors();
          await setForm(null);
          await loadPlans();
          syncAvailabilityMode();
          updatePricePreview();
          CP.showStatus(statusEl, 'Connected. Plans and colleges loaded.', 'success');
        } catch (err) {
          CP.showStatus(statusEl, err.message || 'Init failed', 'error');
        }
      }

      init();
    })();
