// Extracted from ui/hod/hod_dashboard.html (inline <script> #2).
    (function(){
      const $ = (s, r=document) => r.querySelector(s);
      const setText = (id, v) => { const n = document.getElementById(id); if (n) n.textContent = (v == null ? '–' : String(v)); };

      function deptCard(d){
        const name = HOD.esc(d.name || 'DEPARTMENT');
        return `
          <div class="rounded-2xl bg-white/70 dark:bg-white/5 ring-1 ring-black/10 dark:ring-white/10 p-4">
            <div class="flex items-center justify-between">
              <div class="font-semibold">${name}</div>
              <span class="text-[11px] px-2 py-1 rounded-full bg-brand-500/10 text-brand-700 dark:text-fuchsia-100 ring-1 ring-brand-500/25">In scope</span>
            </div>
            <div class="mt-2 text-[11px] text-neutral-500 dark:text-white/45">Department ID: ${HOD.esc(d.id || '')}</div>
          </div>`;
      }

      async function load(){
        HOD.bindThemeToggle();
        HOD.mountNav('dashboard');

        let me;
        try {
          me = await HOD.requireHod();
        } catch (e){
          $('#deptErr').textContent = (e && e.message) ? e.message : 'Failed to load scope';
          $('#deptErr').classList.remove('hidden');
          return;
        }

        const deptCount = (me.departments || []).length;
        setText('kpiDepartments', deptCount);
        $('#deptGrid').innerHTML = (me.departments || []).map(deptCard).join('') || '<div class="text-sm opacity-60">No departments</div>';
        const scopeNames = (me.departments || []).map(d => d.name).filter(Boolean);
        $('#scopeLine').textContent = scopeNames.length ? ('Scope: ' + scopeNames.join(', ')) : 'Scope loaded.';

        try {
          const token = HOD.getToken();
          const classes = await HOD.fetchJSON(HOD.API_BASE + '/api/hod/classes', { headers: { Authorization: 'Bearer ' + token } });
          setText('kpiClasses', classes.total || 0);
        } catch(_){ setText('kpiClasses', '—'); }

        try {
          const token = HOD.getToken();
          const staff = await HOD.fetchJSON(HOD.API_BASE + '/api/hod/staff', { headers: { Authorization: 'Bearer ' + token } });
          setText('kpiStaff', staff.total || 0);
        } catch(_){ setText('kpiStaff', '—'); }

        try {
          const token = HOD.getToken();
          const apps = await HOD.fetchJSON(HOD.API_BASE + '/api/hod/applications?status=pending', { headers: { Authorization: 'Bearer ' + token } });
          setText('kpiPending', apps.total || 0);
        } catch(_){ setText('kpiPending', '—'); }
      }

      document.getElementById('btnAgenda').addEventListener('click', async () => {
        const out = document.getElementById('agendaOut');
        const err = document.getElementById('aiErr');
        out.textContent = 'Generating…';
        err.classList.add('hidden');
        try {
          const token = HOD.getToken();
          const focus = (document.getElementById('agendaFocus').value || '').trim();
          const data = await HOD.fetchJSON(HOD.API_BASE + '/api/hod/ai/meeting-agenda', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
            body: JSON.stringify({ focus, days: 14 })
          });
          out.textContent = (data && data.markdown) ? data.markdown : 'No output';
        } catch (e){
          out.textContent = '';
          err.textContent = (e && e.message) ? e.message : 'AI request failed';
          err.classList.remove('hidden');
        }
      });

      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load, { once:true });
      else load();
    })();
