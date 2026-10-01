// Extracted from ui/hod/batch_management.html (inline <script> #2).
    (function(){
      const $ = (s, r=document) => r.querySelector(s);
      const deptSelect = $('#deptSelect');
      const termSelect = $('#termSelect');
      const errBox = $('#errBox');
      const okBox = $('#okBox');
      const secondYear = $('#secondYear');
      const thirdYear = $('#thirdYear');
      const finalYear = $('#finalYear');

      const syCur = $('#syCur');
      const tyCur = $('#tyCur');
      const lyCur = $('#lyCur');

      let me = null;
      let departments = [];
      let management = {};
      let batchesByDept = {};

      function showErr(msg){
        errBox.textContent = msg || 'Error';
        errBox.classList.remove('hidden');
        okBox.classList.add('hidden');
      }
      function showOk(msg){
        okBox.textContent = msg || 'Saved';
        okBox.classList.remove('hidden');
        errBox.classList.add('hidden');
      }

      function option(label, value){
        return `<option value="${HOD.esc(value || '')}">${HOD.esc(label || '—')}</option>`;
      }

      function inferTerm(){
        // Determine odd/even based on stored sem values.
        // Any deviation -> unset (keeps UI simple: only Odd/Even supported).
        const deptId = deptSelect.value;
        const row = management[String(deptId)] || {};
        const b = row.second_year_sem ? String(row.second_year_sem) : '';
        const c = row.third_year_sem ? String(row.third_year_sem) : '';
        const d = row.final_year_sem ? String(row.final_year_sem) : '';
        if (!b && !c && !d) return '';
        if (b === '3' && c === '5' && d === '7') return 'odd';
        if (b === '4' && c === '6' && d === '8') return 'even';
        return '';
      }

      function semsForTerm(mode){
        if (mode === 'odd') return { sy: 3, ty: 5, ly: 7 };
        if (mode === 'even') return { sy: 4, ty: 6, ly: 8 };
        return { sy: null, ty: null, ly: null };
      }

      function renderCurrentLabels(){
        const mode = termSelect.value;
        const sems = semsForTerm(mode);
        syCur.textContent = sems.sy ? ('Sem ' + sems.sy) : '—';
        tyCur.textContent = sems.ty ? ('Sem ' + sems.ty) : '—';
        lyCur.textContent = sems.ly ? ('Sem ' + sems.ly) : '—';
      }

      function setLoading(on){
        if (on) document.body.classList.remove('loaded');
        else document.body.classList.add('loaded');
      }

      function renderBatchSelects(){
        const deptId = deptSelect.value;

        const deptBatches = (batchesByDept[String(deptId)] || []);
        const opts = [option('— Not set —', '')].concat(
          deptBatches.map(b => option((b.label ? ('Batch ' + b.label) : (b.from_year + '-' + b.to_year)), b.id))
        ).join('');
        [secondYear, thirdYear, finalYear].forEach(sel => sel.innerHTML = opts);

        const row = management[String(deptId)] || {};
        secondYear.value = row.second_year_batch_id || '';
        thirdYear.value = row.third_year_batch_id || '';
        finalYear.value = row.final_year_batch_id || '';

        termSelect.value = inferTerm();
        renderCurrentLabels();
      }

      async function loadDepartmentData(deptId){
        const token = HOD.getToken();
        const [batchResp, mgmtResp] = await Promise.all([
          HOD.fetchJSON(HOD.API_BASE + '/api/hod/batches?department_id=' + encodeURIComponent(deptId), { headers: { Authorization: 'Bearer ' + token } }),
          HOD.fetchJSON(HOD.API_BASE + '/api/hod/batch-management?department_id=' + encodeURIComponent(deptId), { headers: { Authorization: 'Bearer ' + token } }),
        ]);

        batchesByDept[String(deptId)] = (batchResp.batches || []).sort((a,b) => (b.from_year||0) - (a.from_year||0));
        management = mgmtResp.management || management;
      }

      async function loadAll(){
        HOD.bindThemeToggle();
        HOD.mountNav('batches');
        errBox.classList.add('hidden');
        okBox.classList.add('hidden');
        setLoading(true);

        try {
          me = await HOD.requireHod();
          departments = me.departments || [];
          deptSelect.innerHTML = departments.map(d => `<option value="${HOD.esc(d.id)}">${HOD.esc(d.name)}</option>`).join('');
          if (departments.length) deptSelect.value = String(departments[0].id);

          const deptId = deptSelect.value;
          if (deptId) {
            await loadDepartmentData(deptId);
          }
          renderBatchSelects();
        } catch(e){
          showErr(e.message || 'Failed to load');
        } finally {
          setLoading(false);
        }
      }

      async function save(){
        errBox.classList.add('hidden');
        okBox.classList.add('hidden');
        setLoading(true);
        try {
          const token = HOD.getToken();
          const deptId = deptSelect.value;
          if (!deptId) throw new Error('Select a department');
          const term = termSelect.value;
          if (term !== 'odd' && term !== 'even') throw new Error('Select Current Term (Odd/Even)');
          const sems = semsForTerm(term);
          await HOD.fetchJSON(HOD.API_BASE + '/api/hod/batch-management', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
            body: JSON.stringify({
              department_id: deptId,
              second_year_batch_id: secondYear.value || null,
              second_year_sem: sems.sy,
              third_year_batch_id: thirdYear.value || null,
              third_year_sem: sems.ty,
              final_year_batch_id: finalYear.value || null,
              final_year_sem: sems.ly,
            })
          });
          showOk('Saved successfully');
          // refresh mapping
          const mgmtResp = await HOD.fetchJSON(HOD.API_BASE + '/api/hod/batch-management?department_id=' + encodeURIComponent(deptId), { headers: { Authorization: 'Bearer ' + token } });
          management = mgmtResp.management || management;
          renderBatchSelects();
        } catch(e){
          showErr(e.message || 'Save failed');
        } finally {
          setLoading(false);
        }
      }

      $('#refreshBtn').addEventListener('click', loadAll);
      $('#saveBtn').addEventListener('click', save);
      deptSelect.addEventListener('change', async () => {
        const deptId = deptSelect.value;
        if (!deptId) return;
        errBox.classList.add('hidden');
        okBox.classList.add('hidden');
        setLoading(true);
        try {
          await loadDepartmentData(deptId);
          renderBatchSelects();
        } catch(e){
          showErr(e.message || 'Failed to load');
        } finally {
          setLoading(false);
        }
      });

      termSelect.addEventListener('change', () => {
        renderCurrentLabels();
      });

      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadAll, { once:true });
      else loadAll();
    })();
