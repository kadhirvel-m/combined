// Extracted from ui/mediX/sources.html (inline <script> #4).
    const API = (window.API_BASE || location.origin).replace(/\/$/, '');
    const rows = document.getElementById('rows');
    const hint = document.getElementById('hint');
    const statSources = document.getElementById('statSources');
    const statChunks = document.getElementById('statChunks');

    function fmtDate(value) {
      if (!value) return '-';
      const date = new Date(value);
      if (isNaN(date.getTime())) return value;
      return date.toLocaleString();
    }

    async function load() {
      rows.innerHTML = '';
      hint.textContent = 'Loading...';
      statSources.textContent = '0';
      statChunks.textContent = '0';

      try {
        const res = await fetch(`${API}/api/medix/rag/sources?limit=500`);
        const data = await res.json();
        const items = data.items || [];

        statSources.textContent = String(items.length);
        statChunks.textContent = String(items.reduce((sum, item) => sum + Number(item.chunk_count || 0), 0));

        if (!items.length) {
          hint.textContent = 'No sources indexed yet.';
          return;
        }

        hint.textContent = `${items.length} source(s) loaded`;

        for (const item of items) {
          const row = document.createElement('tr');
          row.className = 'hover:bg-black/[0.03] dark:hover:bg-white/[0.04]';
          row.innerHTML = `
            <td class="px-4 py-3">
              <div class="font-semibold">${item.source_name || '-'}</div>
              <div class="text-xs text-neutral-600 dark:text-white/60 mt-1">${item.file_name || ''}</div>
            </td>
            <td class="px-4 py-3">${item.chunk_count || 0}</td>
            <td class="px-4 py-3">${fmtDate(item.created_at)}</td>
            <td class="px-4 py-3"><span class="font-mono text-xs">${item.id}</span></td>
            <td class="px-4 py-3">
              <button class="delete-btn inline-flex items-center rounded-lg px-3 py-2 text-xs font-semibold ring-1 ring-red-400/40 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-400/10 transition" data-id="${item.id}">
                Delete
              </button>
            </td>
          `;
          rows.appendChild(row);
        }
      } catch (error) {
        hint.textContent = `Load failed: ${error.message || error}`;
      }
    }

    rows.addEventListener('click', async (event) => {
      const btn = event.target.closest('button[data-id]');
      if (!btn) return;

      const sourceId = btn.getAttribute('data-id');
      if (!confirm(`Delete source ${sourceId}? This removes all chunks.`)) return;

      btn.disabled = true;
      try {
        const res = await fetch(`${API}/api/medix/rag/sources/${sourceId}`, { method: 'DELETE' });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);
        await load();
      } catch (error) {
        alert(`Delete failed: ${error.message || error}`);
        btn.disabled = false;
      }
    });

    document.getElementById('reloadBtn').addEventListener('click', load);
    load();
