// Extracted from ui/hod/hod_ai.html (inline <script> #2).
    (function(){
      const $ = (s, r=document) => r.querySelector(s);
      const agendaBtn = $('#agendaBtn');
      const riskBtn = $('#riskBtn');
      const agendaOut = $('#agendaOut');
      const riskOut = $('#riskOut');
      const agendaErr = $('#agendaErr');
      const riskErr = $('#riskErr');

      async function boot(){
        HOD.bindThemeToggle();
        HOD.mountNav('ai');
        await HOD.requireHod();
      }

      async function doAgenda(){
        agendaErr.classList.add('hidden');
        agendaOut.textContent = 'Generating...';
        agendaBtn.disabled = true;
        try {
          const token = HOD.getToken();
          const focus = ($('#agendaFocus').value || '').trim();
          const resp = await HOD.fetchJSON(HOD.API_BASE + '/api/hod/ai/meeting-agenda', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
            body: JSON.stringify({ focus })
          });
          agendaOut.textContent = resp.markdown || '';
        } catch(e){
          agendaOut.textContent = '';
          agendaErr.textContent = e.message || 'Failed to generate agenda';
          agendaErr.classList.remove('hidden');
        } finally {
          agendaBtn.disabled = false;
        }
      }

      async function doRisk(){
        riskErr.classList.add('hidden');
        riskOut.textContent = 'Analyzing...';
        riskBtn.disabled = true;
        try {
          const token = HOD.getToken();
          const focus = ($('#riskFocus').value || '').trim();
          const resp = await HOD.fetchJSON(HOD.API_BASE + '/api/hod/ai/risk-flags', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
            body: JSON.stringify({ focus })
          });
          riskOut.textContent = resp.markdown || '';
        } catch(e){
          riskOut.textContent = '';
          riskErr.textContent = e.message || 'Failed to analyze risks';
          riskErr.classList.remove('hidden');
        } finally {
          riskBtn.disabled = false;
        }
      }

      agendaBtn.addEventListener('click', doAgenda);
      riskBtn.addEventListener('click', doRisk);

      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once:true });
      else boot();
    })();
