// Extracted from ui/security_logs.html (inline <script> #1).
    const PAGE_SIZE = 50;
    let offset = 0;
    let total = null;

    const $ = (id) => document.getElementById(id);

    function authToken() {
      const sentinel = '__COOKIE_AUTH__';
      const userToken = localStorage.getItem('px_token');
      const teacherToken = localStorage.getItem('teacherToken');
      if (userToken && userToken !== sentinel) return userToken;
      if (teacherToken && teacherToken !== sentinel) return teacherToken;
      return null;
    }

    function buildUrl() {
      const base = (window.API_BASE || location.origin).replace(/\/$/, '');
      const q = new URLSearchParams();
      q.set('limit', String(PAGE_SIZE));
      q.set('offset', String(offset));

      const sev = $('severity').value.trim();
      const evt = $('eventType').value.trim();
      const search = $('search').value.trim();

      if (sev) q.set('severity', sev);
      if (evt) q.set('event_type', evt);
      if (search) q.set('search', search);
      if ($('onlyAlerts').checked) q.set('only_alerts', 'true');

      return `${base}/api/admin/security/events?${q.toString()}`;
    }

    function escapeHtml(s) {
      return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }

    function fmtTime(ts) {
      if (!ts) return '-';
      const d = new Date(ts);
      if (Number.isNaN(d.getTime())) return ts;
      return d.toLocaleString();
    }

    function sevClass(v) {
      const s = String(v || '').toLowerCase();
      if (s === 'warning') return 'sev sev-warning';
      if (s === 'error') return 'sev sev-error';
      return 'sev sev-info';
    }

    function formatPayload(payload) {
      try {
        return JSON.stringify(payload || {}, null, 2);
      } catch (_) {
        return String(payload || '');
      }
    }

    function updateKpi(items) {
      const arr = items || [];
      const warn = arr.filter((x) => String(x.severity || '').toLowerCase() === 'warning').length;
      const err = arr.filter((x) => String(x.severity || '').toLowerCase() === 'error').length;

      $('kpiVisible').textContent = String(arr.length);
      $('kpiTotal').textContent = total == null ? '-' : String(total);
      $('kpiWarn').textContent = String(warn);
      $('kpiErr').textContent = String(err);
    }

    function renderRows(items) {
      const tbody = $('rows');
      const mobile = $('mobileRows');

      if (!items || !items.length) {
        tbody.innerHTML = '<tr><td class="px-3 py-5 text-center opacity-70" colspan="7">No events found for this filter.</td></tr>';
        mobile.innerHTML = '<div class="event-card text-sm opacity-80">No events found for this filter.</div>';
        updateKpi([]);
        return;
      }

      tbody.innerHTML = items.map((it) => {
        const payload = formatPayload(it.event_payload);
        return `<tr class="row-item align-top">
          <td class="px-3 py-2.5 whitespace-nowrap">${escapeHtml(fmtTime(it.created_at || it.event_ts))}</td>
          <td class="px-3 py-2.5 mono">${escapeHtml(it.event_type || '-')}</td>
          <td class="px-3 py-2.5"><span class="${sevClass(it.severity)}">${escapeHtml(it.severity || 'info')}</span></td>
          <td class="px-3 py-2.5 mono">${escapeHtml(it.method || '')} ${escapeHtml(it.path || '')}</td>
          <td class="px-3 py-2.5 mono">${escapeHtml(it.email || it.user_id || '-')}</td>
          <td class="px-3 py-2.5 mono">${escapeHtml(it.client_ip || '-')}</td>
          <td class="px-3 py-2.5"><pre class="payload-box mono text-xs">${escapeHtml(payload)}</pre></td>
        </tr>`;
      }).join('');

      mobile.innerHTML = items.map((it) => {
        const payload = formatPayload(it.event_payload);
        return `<article class="event-card">
          <div class="flex items-start justify-between gap-2">
            <p class="mono text-xs opacity-85">${escapeHtml(fmtTime(it.created_at || it.event_ts))}</p>
            <span class="${sevClass(it.severity)}">${escapeHtml(it.severity || 'info')}</span>
          </div>
          <p class="mono text-sm font-semibold mt-1">${escapeHtml(it.event_type || '-')}</p>
          <p class="mono text-xs mt-1 opacity-85">${escapeHtml(it.method || '')} ${escapeHtml(it.path || '')}</p>
          <div class="grid grid-cols-2 gap-2 mt-2 text-xs">
            <p><span class="opacity-70">User:</span> <span class="mono">${escapeHtml(it.email || it.user_id || '-')}</span></p>
            <p><span class="opacity-70">IP:</span> <span class="mono">${escapeHtml(it.client_ip || '-')}</span></p>
          </div>
          <pre class="payload-box mono text-xs mt-2">${escapeHtml(payload)}</pre>
        </article>`;
      }).join('');

      updateKpi(items);
    }

    function updatePager() {
      const page = Math.floor(offset / PAGE_SIZE) + 1;
      $('pageInfo').textContent = total == null ? `Page ${page}` : `Page ${page} of ${Math.max(1, Math.ceil(total / PAGE_SIZE))} (${total})`;
      $('prevBtn').disabled = offset <= 0;
      $('nextBtn').disabled = total != null && offset + PAGE_SIZE >= total;
    }

    async function loadEvents() {
      $('status').textContent = 'Loading events...';
      try {
        const token = authToken();
        const headers = { 'Accept': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(buildUrl(), { headers, credentials: 'include' });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.detail || `Request failed (${res.status})`);

        total = typeof data.total === 'number' ? data.total : null;
        renderRows(data.items || []);
        $('status').textContent = 'Loaded';
      } catch (err) {
        $('status').textContent = `Error: ${err.message || err}`;
        renderRows([]);
      }
      updatePager();
    }

    $('applyBtn').addEventListener('click', () => {
      offset = 0;
      loadEvents();
    });

    $('refreshBtn').addEventListener('click', loadEvents);

    $('prevBtn').addEventListener('click', () => {
      if (offset <= 0) return;
      offset = Math.max(0, offset - PAGE_SIZE);
      loadEvents();
    });

    $('nextBtn').addEventListener('click', () => {
      offset += PAGE_SIZE;
      loadEvents();
    });

    ['search', 'eventType'].forEach((id) => {
      $(id).addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          offset = 0;
          loadEvents();
        }
      });
    });

    loadEvents();
