// Extracted from ui/admin/notes_feedback.html (inline <script> #2).
    (function () {
      const API = (window.API_BASE || 'http://0.0.0.0:10000').replace(/\/+$/, '');
      const AUTH_SENTINEL = '__COOKIE_AUTH__';

      function safeStorageGet(store, key) {
        try {
          const v = store.getItem(key);
          return v == null ? '' : String(v);
        } catch {
          return '';
        }
      }

      function parseSupabaseAccessToken(raw) {
        if (!raw) return '';
        const value = String(raw || '').trim();
        if (!value || value === AUTH_SENTINEL || value === 'null' || value === 'undefined') return '';
        if (!value.startsWith('{') && !value.startsWith('[')) return value;
        try {
          const parsed = JSON.parse(value);
          if (typeof parsed === 'string') return parsed;
          return String(
            parsed?.currentSession?.access_token ||
            parsed?.access_token ||
            parsed?.session?.access_token ||
            ''
          ).trim();
        } catch {
          return '';
        }
      }

      function getAuthToken() {
        const keys = [
          'teacherToken',
          'px_token',
          'userToken',
          'sb-access-token',
          'paperx_bearer_fallback',
          'supabase.auth.token',
          'sb-uppzpkmpxgyipjzcskva-auth-token'
        ];
        for (const k of keys) {
          const localValue = parseSupabaseAccessToken(safeStorageGet(localStorage, k));
          if (localValue) return localValue;
          const sessionValue = parseSupabaseAccessToken(safeStorageGet(sessionStorage, k));
          if (sessionValue) return sessionValue;
        }
        return '';
      }

      async function ensureAdmin() {
        if (typeof window.__PX_ENSURE_AUTH_READY === 'function') {
          try { await window.__PX_ENSURE_AUTH_READY(); } catch { }
        }

        const token = getAuthToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`${API}/api/admin/roles/me`, { headers, credentials: 'include' });
        if (res.status === 401) throw new Error('Not signed in');
        if (!res.ok) throw new Error('Not authorized');
        const data = await res.json().catch(() => ({}));
        const role = String(data?.role || '').toLowerCase().trim();
        if (role !== 'admin' && role !== 'employee') throw new Error('Admin only');
        return token;
      }

      const $rows = document.getElementById('rows');
      const $hint = document.getElementById('hint');
      const $status = document.getElementById('filterStatus');
      const $q = document.getElementById('filterQ');

      const $modal = document.getElementById('modal');
      const $closeModal = document.getElementById('closeModal');
      const $modalSub = document.getElementById('modalSub');
      const $modalMsg = document.getElementById('modalMsg');
      const $modalSel = document.getElementById('modalSel');
      const $modalMeta = document.getElementById('modalMeta');
      const $modalAdminNotes = document.getElementById('modalAdminNotes');
      const $saveModal = document.getElementById('saveModal');

      let current = null;
      let cached = [];

      function fmtWhen(iso) {
        try {
          const d = new Date(iso);
          return d.toLocaleString();
        } catch { return iso || ''; }
      }

      function escapeHtml(s) {
        return String(s || '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
      }

      function toCsv(rows) {
        const cols = ['id','created_at','status','category','rating','user_id','user_email','topic','note_title','note_variant','note_id','page_path','page_url','quick_tags','message','selected_text','ip','user_agent'];
        const out = [cols.join(',')];
        for (const r of rows) {
          const line = cols.map(k => {
            let v = r[k];
            if (Array.isArray(v)) v = v.join('|');
            if (v === null || v === undefined) v = '';
            v = String(v).replace(/\r?\n/g, ' ');
            const escaped = '"' + v.replace(/"/g, '""') + '"';
            return escaped;
          }).join(',');
          out.push(line);
        }
        return out.join('\n');
      }

      function openModal(row) {
        current = row;
        $modalSub.textContent = `${fmtWhen(row.created_at)} • ${row.user_email || row.user_id || ''}`;
        $modalMsg.textContent = row.message || '';
        $modalSel.textContent = row.selected_text || '';
        $modalAdminNotes.value = row.admin_notes || '';

        const meta = [];
        meta.push(['Status', row.status]);
        meta.push(['Category', row.category]);
        meta.push(['Rating', row.rating]);
        meta.push(['Topic', row.topic]);
        meta.push(['Title', row.note_title]);
        meta.push(['Variant', row.note_variant]);
        meta.push(['Note ID', row.note_id]);
        meta.push(['Page', row.page_path]);
        meta.push(['URL', row.page_url]);
        meta.push(['Tags', (row.quick_tags || []).join(', ')]);
        meta.push(['IP', row.ip]);
        meta.push(['UA', row.user_agent]);
        $modalMeta.innerHTML = meta.filter(x => x[1]).map(([k,v]) => `<div><span class="text-gray-400">${escapeHtml(k)}:</span> ${escapeHtml(v)}</div>`).join('');

        $modal.classList.remove('hidden');
      }

      function closeModal() {
        $modal.classList.add('hidden');
        current = null;
      }

      async function updateCurrent(patch) {
        const token = await ensureAdmin();
        if (!current?.id) return;
        const res = await fetch(`${API}/api/admin/notes-feedback/${encodeURIComponent(current.id)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(patch)
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.detail || `HTTP ${res.status}`);
        return data;
      }

      function applyFilters(rows) {
        const status = ($status.value || '').trim().toLowerCase();
        const q = ($q.value || '').trim().toLowerCase();
        let out = rows;
        if (status) out = out.filter(r => String(r.status || '').toLowerCase() === status);
        if (q) {
          out = out.filter(r => {
            const blob = [r.user_email, r.user_id, r.topic, r.note_title, r.category, r.message, r.page_path, r.note_variant].map(x => String(x || '')).join(' ').toLowerCase();
            return blob.includes(q);
          });
        }
        return out;
      }

      function render(rows) {
        if (!rows.length) {
          $rows.innerHTML = '<tr><td colspan="7" class="py-10 text-center text-gray-500">No feedback found</td></tr>';
          return;
        }
        $rows.innerHTML = rows.map(r => {
          const msg = (r.message || '').trim();
          const preview = msg.length > 90 ? msg.slice(0, 90) + '…' : msg;
          return `
            <tr class="border-b border-white/5 hover:bg-white/5">
              <td class="py-3 px-4 text-xs text-gray-300">${escapeHtml(fmtWhen(r.created_at))}</td>
              <td class="py-3 px-4 text-xs text-gray-300">${escapeHtml(r.user_email || r.user_id || '')}</td>
              <td class="py-3 px-4">
                <div class="text-sm font-semibold">${escapeHtml(r.topic || r.note_title || '—')}</div>
                <div class="text-xs text-gray-400">${escapeHtml([r.note_variant, r.note_id].filter(Boolean).join(' • '))}</div>
              </td>
              <td class="py-3 px-4 text-xs">${escapeHtml(r.category || '—')}</td>
              <td class="py-3 px-4 text-xs"><span class="rounded-full bg-white/10 border border-white/10 px-2 py-1">${escapeHtml(r.status || 'new')}</span></td>
              <td class="py-3 px-4 text-xs text-gray-200">${escapeHtml(preview)}</td>
              <td class="py-3 px-4 text-right">
                <button data-open="${escapeHtml(r.id)}" class="rounded-xl bg-white/10 border border-white/10 px-3 py-2 text-xs hover:bg-white/15">View</button>
              </td>
            </tr>
          `;
        }).join('');
      }

      async function load() {
        $hint.textContent = '';
        try {
          const token = await ensureAdmin();
          const res = await fetch(`${API}/api/admin/notes-feedback?limit=1500`, { headers: { Authorization: `Bearer ${token}` } });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data?.detail || `HTTP ${res.status}`);
          cached = Array.isArray(data?.feedback) ? data.feedback : [];
          $hint.textContent = `Loaded ${cached.length} items.`;
          render(applyFilters(cached));
        } catch (e) {
          console.error(e);
          $rows.innerHTML = `<tr><td colspan="7" class="py-10 text-center text-red-300">${escapeHtml(e?.message || 'Failed to load')}</td></tr>`;
          $hint.textContent = 'Tip: sign in with an admin account first.';
        }
      }

      document.getElementById('refreshBtn')?.addEventListener('click', load);
      $status?.addEventListener('change', () => render(applyFilters(cached)));
      $q?.addEventListener('input', () => render(applyFilters(cached)));

      document.getElementById('exportBtn')?.addEventListener('click', () => {
        const filtered = applyFilters(cached);
        const csv = toCsv(filtered);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `notes_feedback_${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 500);
      });

      $rows?.addEventListener('click', (e) => {
        const btn = e.target?.closest?.('button[data-open]');
        const id = btn?.getAttribute?.('data-open');
        if (!id) return;
        const row = cached.find(x => x.id === id);
        if (row) openModal(row);
      });

      $closeModal?.addEventListener('click', closeModal);
      $modal?.addEventListener('click', (e) => { if (e.target === $modal) closeModal(); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

      document.querySelectorAll('button[data-set-status]')?.forEach(btn => {
        btn.addEventListener('click', async () => {
          const status = btn.getAttribute('data-set-status');
          if (!status) return;
          try {
            const updated = await updateCurrent({ status });
            const idx = cached.findIndex(x => x.id === updated.id);
            if (idx >= 0) cached[idx] = updated;
            openModal(updated);
            render(applyFilters(cached));
          } catch (e) { alert(e?.message || 'Failed'); }
        });
      });

      $saveModal?.addEventListener('click', async () => {
        try {
          const updated = await updateCurrent({ admin_notes: $modalAdminNotes.value || '' });
          const idx = cached.findIndex(x => x.id === updated.id);
          if (idx >= 0) cached[idx] = updated;
          openModal(updated);
          render(applyFilters(cached));
        } catch (e) { alert(e?.message || 'Failed'); }
      });

      load();
    })();
