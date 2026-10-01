// Extracted from ui/hod/hod_applications.html (inline <script> #2).
    (function(){
      const $ = (s, r=document) => r.querySelector(s);
      const list = $('#list');
      const empty = $('#empty');
      const errBox = $('#errBox');
      const shown = $('#shownCount');
      const statusSelect = $('#statusSelect');
      const qInput = $('#qInput');

      let apps = [];

      function badge(status){
        const s = String(status || '').toLowerCase();
        if (s === 'approved') return '<span class="px-2 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-200 ring-1 ring-emerald-500/25">APPROVED</span>';
        if (s === 'rejected') return '<span class="px-2 py-1 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-700 dark:text-rose-200 ring-1 ring-rose-500/25">REJECTED</span>';
        return '<span class="px-2 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-800 dark:text-amber-200 ring-1 ring-amber-500/25">PENDING</span>';
      }

      function row(a){
        const name = a.full_name || a.name || 'Applicant';
        const email = a.email || '';
        const dept = a.department_name || '';
        const created = a.created_at ? new Date(a.created_at).toLocaleString() : '';
        const note = (a.hod_review && a.hod_review.note) ? a.hod_review.note : '';

        return `
          <div class="rounded-2xl bg-white/70 dark:bg-white/5 ring-1 ring-black/10 dark:ring-white/10 p-5" data-app="${HOD.esc(a.id)}">
            <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <div class="text-lg font-bold tracking-tight truncate">${HOD.esc(name)}</div>
                  ${badge(a.status)}
                </div>
                <div class="mt-1 text-xs text-neutral-500 dark:text-white/45">${HOD.esc([email, dept].filter(Boolean).join(' • '))}</div>
                <div class="mt-1 text-[11px] text-neutral-500 dark:text-white/45">${HOD.esc(created)}</div>
              </div>
              <div class="flex items-center gap-2">
                <button class="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15" data-save>
                  <span class="material-symbols-rounded text-[18px]">save</span>Save note
                </button>
              </div>
            </div>

            <div class="mt-4">
              <label class="block text-[11px] font-semibold uppercase tracking-wide mb-1 text-neutral-500 dark:text-white/50">HOD recommendation note</label>
              <textarea class="w-full rounded-2xl bg-white/70 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 px-3 py-3 text-sm focus:outline-none focus:ring-brand-500" placeholder="Write your recommendation for admin review..." data-note>${HOD.esc(note)}</textarea>
              <div class="mt-2 text-xs text-neutral-500 dark:text-white/45" data-statusline></div>
              <div class="mt-2 hidden text-xs text-red-600 dark:text-red-300" data-err></div>
            </div>
          </div>`;
      }

      function applyFilters(){
        const st = (statusSelect.value || '').trim().toLowerCase();
        const q = (qInput.value || '').trim().toLowerCase();
        let list2 = apps.slice();
        if (st) list2 = list2.filter(a => String(a.status||'').toLowerCase() === st);
        if (q) list2 = list2.filter(a => String(a.full_name||a.name||'').toLowerCase().includes(q) || String(a.email||'').toLowerCase().includes(q));
        list.innerHTML = list2.map(row).join('');
        empty.classList.toggle('hidden', list2.length > 0);
        shown.textContent = String(list2.length);
      }

      async function loadAll(){
        HOD.bindThemeToggle();
        HOD.mountNav('apps');
        errBox.classList.add('hidden');

        try {
          await HOD.requireHod();
        } catch(e){
          errBox.textContent = e.message || 'Failed to load HOD scope';
          errBox.classList.remove('hidden');
          return;
        }

        try {
          const token = HOD.getToken();
          const resp = await HOD.fetchJSON(HOD.API_BASE + '/api/hod/applications', { headers: { Authorization: 'Bearer ' + token } });
          apps = resp.applications || [];
          applyFilters();
        } catch(e){
          errBox.textContent = e.message || 'Failed to load applications';
          errBox.classList.remove('hidden');
          apps = [];
          applyFilters();
        }
      }

      // Save handler (event delegation)
      document.addEventListener('click', async (e) => {
        const saveBtn = e.target.closest('[data-save]');
        if (!saveBtn) return;
        const cardEl = e.target.closest('[data-app]');
        if (!cardEl) return;
        const appId = cardEl.getAttribute('data-app');
        const noteEl = cardEl.querySelector('[data-note]');
        const errEl = cardEl.querySelector('[data-err]');
        const statusLine = cardEl.querySelector('[data-statusline]');
        errEl.classList.add('hidden');

        try {
          saveBtn.disabled = true;
          saveBtn.classList.add('opacity-60');
          const token = HOD.getToken();
          const note = (noteEl.value || '').trim();
          await HOD.fetchJSON(HOD.API_BASE + '/api/hod/applications/' + encodeURIComponent(appId) + '/review', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
            body: JSON.stringify({ note })
          });
          statusLine.textContent = 'Saved at ' + new Date().toLocaleTimeString();
        } catch(err){
          errEl.textContent = err.message || 'Save failed';
          errEl.classList.remove('hidden');
        } finally {
          saveBtn.disabled = false;
          saveBtn.classList.remove('opacity-60');
        }
      });

      $('#refreshBtn').addEventListener('click', loadAll);
      statusSelect.addEventListener('change', applyFilters);
      qInput.addEventListener('input', () => { window.clearTimeout(window.__qT); window.__qT = setTimeout(applyFilters, 120); });

      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadAll, { once:true });
      else loadAll();
    })();
