// Extracted from ui/admin/control-panel/usage-limits.html (inline <script> #2).
    (function () {
      const $ = (id) => document.getElementById(id);
      const statusEl = $('status');
      const tbody = $('rulesTbody');
      const form = $('ruleForm');
      let rules = [];

      function n(v) { return v === '' || v == null ? null : Number(v); }
      function tv(id) { return ($(id).value || '').trim(); }

      function payloadFromForm() {
        return {
          rule_name: tv('rule_name'),
          scope_type: tv('scope_type') || 'global',
          scope_college_id: tv('scope_college_id') || null,
          scope_degree_id: tv('scope_degree_id') || null,
          scope_department_id: tv('scope_department_id') || null,
          scope_batch_id: tv('scope_batch_id') || null,
          scope_semester: n(tv('scope_semester')),
          max_topics_per_day: n(tv('max_topics_per_day')),
          max_subjects_per_day: n(tv('max_subjects_per_day')),
          max_mcq_attempts_per_day: n(tv('max_mcq_attempts_per_day')),
          max_blink_views_per_day: n(tv('max_blink_views_per_day')),
          max_searches_per_day: n(tv('max_searches_per_day')),
          max_ai_prompts_per_day: n(tv('max_ai_prompts_per_day')),
          max_session_minutes_per_day: n(tv('max_session_minutes_per_day')),
          trial_duration_days: n(tv('trial_duration_days')),
          apply_to_free_users: $('apply_to_free_users').checked,
          active_status: $('active_status').checked
        };
      }

      function setForm(row) {
        $('ruleId').value = row?.id || '';
        $('rule_name').value = row?.rule_name || '';
        $('scope_type').value = row?.scope_type || 'global';
        $('scope_college_id').value = row?.scope_college_id || '';
        $('scope_degree_id').value = row?.scope_degree_id || '';
        $('scope_department_id').value = row?.scope_department_id || '';
        $('scope_batch_id').value = row?.scope_batch_id || '';
        $('scope_semester').value = row?.scope_semester ?? '';
        $('max_topics_per_day').value = row?.max_topics_per_day ?? '';
        $('max_subjects_per_day').value = row?.max_subjects_per_day ?? '';
        $('max_mcq_attempts_per_day').value = row?.max_mcq_attempts_per_day ?? '';
        $('max_blink_views_per_day').value = row?.max_blink_views_per_day ?? '';
        $('max_searches_per_day').value = row?.max_searches_per_day ?? '';
        $('max_ai_prompts_per_day').value = row?.max_ai_prompts_per_day ?? '';
        $('max_session_minutes_per_day').value = row?.max_session_minutes_per_day ?? '';
        $('trial_duration_days').value = row?.trial_duration_days ?? '';
        $('apply_to_free_users').checked = row ? !!row.apply_to_free_users : true;
        $('active_status').checked = row ? !!row.active_status : true;
      }

      function fillSelect(id, rows, labelKey = 'name') {
        const el = $(id);
        const cur = el.value;
        el.innerHTML = '<option value="">--</option>';
        (rows || []).forEach(r => {
          const o = document.createElement('option');
          o.value = r.id;
          o.textContent = r[labelKey] || r.id;
          el.appendChild(o);
        });
        el.value = cur;
      }

      async function loadMeta() {
        const metaRes = await fetch(`${CP.API}/api/public/academic-meta`);
        const meta = await metaRes.json().catch(() => ({}));
        fillSelect('scope_college_id', meta.colleges || []);
        fillSelect('scope_degree_id', meta.degrees || []);
        fillSelect('scope_department_id', meta.departments || []);
        try {
          const bRes = await fetch(`${CP.API}/api/batches`);
          const bData = await bRes.json().catch(() => ({}));
          fillSelect('scope_batch_id', bData.batches || [], 'range');
        } catch (_) { }
      }

      function render() {
        if (!rules.length) {
          tbody.innerHTML = '<tr><td colspan="4" class="py-4 text-slate-500 dark:text-white/60">No rules</td></tr>';
          return;
        }
        tbody.innerHTML = rules.map(r => `
          <tr class="border-b border-black/5 dark:border-white/5 hover:bg-black/[0.02] dark:hover:bg-white/[0.04]">
            <td class="py-2">
              <div class="font-medium">${CP.escapeHtml(r.rule_name)}</div>
              <div class="text-xs text-slate-500 dark:text-white/60">${CP.escapeHtml(r.id)}</div>
            </td>
            <td>${CP.escapeHtml(r.scope_type || 'global')}</td>
            <td>${r.max_topics_per_day ?? '-'}</td>
            <td class="text-right">
              <div class="inline-flex gap-1">
                <button data-act="edit" data-id="${r.id}" class="px-2 py-1 rounded bg-black/5 dark:bg-white/10 text-xs">Edit</button>
                <button data-act="toggle" data-id="${r.id}" class="px-2 py-1 rounded bg-black/5 dark:bg-white/10 text-xs">${r.active_status ? 'Disable' : 'Enable'}</button>
                <button data-act="del" data-id="${r.id}" class="px-2 py-1 rounded bg-red-500/20 text-xs">Delete</button>
              </div>
            </td>
          </tr>
        `).join('');
      }

      async function loadRules() {
        const data = await CP.fetchJson('/api/admin/usage-limits');
        rules = data.rules || [];
        render();
      }

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          const id = tv('ruleId');
          const body = payloadFromForm();
          if (id) await CP.fetchJson(`/api/admin/usage-limits/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(body) });
          else await CP.fetchJson('/api/admin/usage-limits', { method: 'POST', body: JSON.stringify(body) });
          CP.showStatus(statusEl, 'Rule saved.', 'success');
          setForm(null);
          await loadRules();
        } catch (err) {
          CP.showStatus(statusEl, err.message || 'Save failed', 'error');
        }
      });

      $('reloadBtn').addEventListener('click', () => loadRules().catch((e) => CP.showStatus(statusEl, e.message, 'error')));
      $('resetBtn').addEventListener('click', () => setForm(null));

      tbody.addEventListener('click', async (e) => {
        const btn = e.target.closest('button[data-act]');
        if (!btn) return;
        const id = btn.getAttribute('data-id');
        const act = btn.getAttribute('data-act');
        const row = rules.find((r) => r.id === id);
        if (!row) return;
        try {
          if (act === 'edit') setForm(row);
          else if (act === 'toggle') {
            await CP.fetchJson(`/api/admin/usage-limits/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify({ active_status: !row.active_status }) });
            await loadRules();
          } else if (act === 'del') {
            if (!confirm('Delete this rule?')) return;
            await CP.fetchJson(`/api/admin/usage-limits/${encodeURIComponent(id)}`, { method: 'DELETE' });
            await loadRules();
          }
        } catch (err) {
          CP.showStatus(statusEl, err.message || 'Action failed', 'error');
        }
      });

      (async function init() {
        CP.initPageChrome('limits');
        try {
          await CP.ensureAdmin();
          await loadMeta();
          await loadRules();
        } catch (err) {
          CP.showStatus(statusEl, err.message || 'Init failed', 'error');
        }
      })();
    })();
