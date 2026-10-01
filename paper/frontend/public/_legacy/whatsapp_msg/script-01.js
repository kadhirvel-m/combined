// Extracted from ui/whatsapp_msg.html (inline <script> #1).
    // ── Theme ──
    (() => { const s=localStorage.getItem('px_theme'),d=s?s==='dark':matchMedia('(prefers-color-scheme:dark)').matches; if(d) document.documentElement.classList.add('dark') })();
    document.getElementById('themeToggle').addEventListener('click', () => {
      const d = document.documentElement.classList.toggle('dark');
      localStorage.setItem('px_theme', d?'dark':'light');
    });

    // ── Config ──
    const BAILEYS = 'http://localhost:3000';
    const ui = {
      searchInput: document.getElementById('searchInput'),
      tabStudents: document.getElementById('tabStudents'),
      tabTeachers: document.getElementById('tabTeachers'),
      tabAdmins: document.getElementById('tabAdmins'),
      tabEmployees: document.getElementById('tabEmployees'),
      statsLine: document.getElementById('statsLine'),
      waStatus: document.getElementById('waStatus'),
      emptyState: document.getElementById('emptyState'),
      chatView: document.getElementById('chatView'),
      bulkView: document.getElementById('bulkView'),
      chatMessages: document.getElementById('chatMessages'),
      chatInput: document.getElementById('chatInput'),
      chatName: document.getElementById('chatName'),
      chatSub: document.getElementById('chatSub'),
      chatAvatar: document.getElementById('chatAvatar'),
      sendBtn: document.getElementById('sendBtn'),
      bulkFab: document.getElementById('bulkFab'),
      bulkFabCount: document.getElementById('bulkFabCount'),
      bulkInput: document.getElementById('bulkInput'),
      bulkSendBtn: document.getElementById('bulkSendBtn'),
      bulkLog: document.getElementById('bulkLog'),
      bulkRecipientInfo: document.getElementById('bulkRecipientInfo'),
      bulkBar: document.getElementById('bulkBar'),
      bulkStatus: document.getElementById('bulkStatus'),
      bulkProgressFill: document.getElementById('bulkProgressFill'),
      detailEmpty: document.getElementById('detailEmpty'),
      detailView: document.getElementById('detailView'),
      detailName: document.getElementById('detailName'),
      detailRole: document.getElementById('detailRole'),
      detailAvatar: document.getElementById('detailAvatar'),
      detailFields: document.getElementById('detailFields'),
      detailCallLink: document.getElementById('detailCallLink'),
      detailEmailLink: document.getElementById('detailEmailLink'),
      detailChatBtn: document.getElementById('detailChatBtn'),
      selectAllCheck: document.getElementById('selectAllCheck'),
      selectedCount: document.getElementById('selectedCount'),
    };

    // ── State ──
    let allUsers = []; // { id, name, email, phone, role, college, department, degree, batch, section, jid }
    let selectedIds = new Set();
    let activeUser = null; // currently chatting user
    let chatHistory = {}; // jid -> [{text,time,dir}]
    let activeTab = 'students';

    // ── Auth ──
    function getToken() {
      const t = localStorage.getItem('px_token') || localStorage.getItem('access_token') || localStorage.getItem('token') || '';
      return t && t !== '__COOKIE_AUTH__' ? t : '';
    }
    function authHeaders() { const t = getToken(); return t ? { Authorization: `Bearer ${t}` } : {}; }

    async function resolveApiBase() {
      if (typeof window.API_BASE === 'string' && window.API_BASE.trim()) return window.API_BASE.replace(/\/$/, '');
      return 'http://0.0.0.0:10000';
    }

    // ── Helpers ──
    function toast(msg, type='info') {
      const el = document.getElementById('toast');
      el.textContent = msg; el.className = 'toast ' + type + ' show';
      setTimeout(() => el.classList.remove('show'), 3000);
    }

    function phoneToJid(phone) {
      if (!phone) return null;
      let c = String(phone).replace(/[\s\-\(\)\+]/g, '');
      if (c.length === 10) c = '91' + c;
      if (c.length < 10) return null;
      return c + '@s.whatsapp.net';
    }

    function initials(name) {
      const p = String(name||'').trim().split(/\s+/);
      return (p[0]?.[0]||'')+(p[1]?.[0]||'');
    }

    const palette = ['#9E4B8A','#6366f1','#0891b2','#059669','#d97706','#dc2626','#7c3aed','#2563eb'];
    function colorFor(s) { let h=0; for(let i=0;i<(s||'').length;i++) h=((h<<5)-h)+s.charCodeAt(i); return palette[Math.abs(h)%palette.length]; }

    function esc(s) { const d=document.createElement('div'); d.textContent=s; return d.innerHTML; }
    function timeStr() { return new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}); }

    // ── Check Baileys status ──
    async function checkWAStatus() {
      try {
        const r = await fetch(BAILEYS + '/api/status', { signal: AbortSignal.timeout(3000) });
        const d = await r.json();
        ui.waStatus.className = 'status-dot ' + (d.connected ? 'online' : 'offline');
        ui.waStatus.title = d.connected ? 'WhatsApp Connected' : 'WhatsApp Disconnected';
      } catch { ui.waStatus.className = 'status-dot offline'; ui.waStatus.title = 'Baileys server unreachable'; }
    }
    checkWAStatus(); setInterval(checkWAStatus, 10000);

    // ── Load data ──
    // apiBase is resolved once and cached
    let _apiBase = null;
    async function getApiBase() {
      if (!_apiBase) _apiBase = await resolveApiBase();
      return _apiBase;
    }

    async function loadAllData() {
      const apiBase = await getApiBase();
      const opts = { headers: authHeaders(), credentials: 'include' };

      ui.statsLine.textContent = 'Loading...';

      // Only fetch what we need up-front: hierarchy (counts only), teachers, staff.
      // Student rows are loaded lazily per-section when the user clicks.
      const [hierarchyRes, teachersRes, staffRes] = await Promise.allSettled([
        fetch(apiBase + '/api/admin/branch-hierarchy', opts).then(r => r.ok ? r.json() : null),
        fetch(apiBase + '/api/teachers', opts).then(r => r.ok ? r.json() : null),
        fetch(apiBase + '/api/admin/staff-directory', opts).then(r => r.ok ? r.json() : null),
      ]);

      const hierarchy = hierarchyRes.status === 'fulfilled' ? hierarchyRes.value : null;
      const teachersData = teachersRes.status === 'fulfilled' ? teachersRes.value : null;
      const staffData = staffRes.status === 'fulfilled' ? staffRes.value : null;

      // Build allUsers from teachers + staff only (students loaded lazily)
      allUsers = [];
      const seen = new Set();

      const teacherRows = Array.isArray(teachersData?.teachers) ? teachersData.teachers : [];
      for (const t of teacherRows) {
        const id = String(t.auth_user_id || '').trim();
        if (!id || seen.has(id)) continue;
        seen.add(id);
        const phone = String(t.phone || '').trim();
        const u = { id, name: String(t.name || t.email || '').trim(), email: String(t.email || '').trim(),
          phone, jid: phoneToJid(phone), role: 'teacher',
          college: String(t.college || '').trim(), department: String(t.department || '').trim(),
          degree: '', batch: '', section: '', semester: '', profileImage: '' };
        allUsers.push(u);
      }

      const staffRows = Array.isArray(staffData?.staff) ? staffData.staff : [];
      for (const s of staffRows) {
        const id = String(s.id || '').trim();
        if (!id || seen.has(id)) continue;
        seen.add(id);
        const phone = String(s.phone || '').trim();
        const u = { id, name: String(s.name || s.email || '').trim(), email: String(s.email || '').trim(),
          phone, jid: phoneToJid(phone), role: s.role,
          college: String(s.college_name || '').trim(), department: String(s.department_name || '').trim(),
          degree: '', batch: '', section: '', semester: '', profileImage: '' };
        allUsers.push(u);
      }

      const totalStudents = hierarchy?.stats?.students ?? '?';
      const teachers = allUsers.filter(u => u.role === 'teacher');
      const admins = allUsers.filter(u => u.role === 'admin');
      const employees = allUsers.filter(u => ['employee','hod','moderator'].includes(u.role));
      ui.statsLine.textContent = `~${totalStudents} students · ${teachers.length} teachers · ${admins.length} admins · ${employees.length} employees`;

      renderStudentTab(hierarchy);
      renderTeacherTab(teachers);
      renderAdminsTab(admins);
      renderEmployeesTab(employees);
    }

    // Fetch students for a specific section on-demand
    async function fetchSectionStudents(collegeId, department, batchRange, section) {
      const apiBase = await getApiBase();
      const params = new URLSearchParams({ limit: '500' });
      if (collegeId) params.set('college_id', collegeId);
      if (department) params.set('department', department);
      if (batchRange) params.set('batch_range', batchRange);
      if (section) params.set('section', section);
      const opts = { headers: authHeaders(), credentials: 'include' };
      const res = await fetch(apiBase + '/api/admin/users?' + params.toString(), opts);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const rows = Array.isArray(data?.users) ? data.users : [];
      return rows.map(u => {
        const id = String(u.user_id || u.auth_user_id || u.id || '').trim();
        const phone = String(u.phone || '').trim();
        const user = {
          id, name: String(u.name || u.email || '').trim(),
          email: String(u.email || '').trim(),
          phone, jid: phoneToJid(phone),
          role: String(u.role || 'student').toLowerCase(),
          college: String(u.college_name || u.college || '').trim(),
          degree: String(u.degree || '').trim(),
          department: String(u.department || u.dept || '').trim(),
          batch: String(u.batch_range || '').trim(),
          section: String(u.section || u.sec || '').trim().toUpperCase(),
          semester: u.semester || '',
          profileImage: u.profile_image_url || '',
        };
        // Merge into allUsers if not already present
        if (id && !allUsers.find(x => x.id === id)) allUsers.push(user);
        return user;
      });
    }

    // ── Render: Student hierarchy (lazy) ──
    function renderStudentTab(hierarchy) {
      const container = ui.tabStudents;
      container.innerHTML = '';

      const colleges = hierarchy && Array.isArray(hierarchy.hierarchy) ? hierarchy.hierarchy : [];
      if (!colleges.length) {
        container.innerHTML = '<p class="text-xs muted p-4 text-center">No student hierarchy data.</p>';
        return;
      }

      for (const college of colleges) {
        const cName = String(college.name || '').trim();
        const collegeId = college.id || null; // DB college_id from hierarchy
        const cNode = makeTreeNode('school', cName, college.count || 0, (cChildren) => {
          const degrees = Array.isArray(college.degrees) ? college.degrees : [];
          for (const deg of degrees) {
            const dNode = makeTreeNode('workspace_premium', deg.name || 'Unknown', deg.count || 0, (dChildren) => {
              const depts = Array.isArray(deg.departments) ? deg.departments : [];
              for (const dept of depts) {
                const dpNode = makeTreeNode('hub', dept.name || 'Unknown', dept.count || 0, (dpChildren) => {
                  const batches = Array.isArray(dept.batches) ? dept.batches : [];
                  for (const batch of batches) {
                    const bNode = makeTreeNode('calendar_month', batch.name || 'Unknown', batch.count || 0, (bChildren) => {
                      const sections = Array.isArray(batch.sections) ? batch.sections : [];
                      for (const sec of sections) {
                        // Section node: async fetch students when clicked
                        const sNode = makeTreeNodeAsync('group', 'Section ' + (sec.name || '?'), sec.count || 0,
                          async (sChildren) => {
                            sChildren.innerHTML = '<p class="text-xs muted p-3 text-center">Loading...</p>';
                            try {
                              const students = await fetchSectionStudents(collegeId, dept.name, batch.name, sec.name);
                              sChildren.innerHTML = '';
                              if (!students.length) {
                                sChildren.innerHTML = '<p class="text-xs muted p-3 text-center">No students found.</p>';
                                return;
                              }
                              for (const u of students) sChildren.appendChild(makeUserItem(u));
                            } catch (e) {
                              sChildren.innerHTML = `<p class="text-xs text-red-500 p-3 text-center">Failed to load: ${e.message}</p>`;
                            }
                          }
                        );
                        bChildren.appendChild(sNode.el);
                      }
                    });
                    dpChildren.appendChild(bNode.el);
                  }
                });
                dChildren.appendChild(dpNode.el);
              }
            });
            cChildren.appendChild(dNode.el);
          }
        });
        container.appendChild(cNode.el);
      }
    }

    function makeTreeNode(icon, label, count, renderFn) {
      const el = document.createElement('div');
      el.className = 'tree-node';
      const toggle = document.createElement('div');
      toggle.className = 'tree-toggle';
      toggle.innerHTML = `<span class="material-symbols-rounded text-[14px] muted">${icon}</span>
        <span class="flex-1 truncate">${esc(label)}</span>
        <span class="badge">${count}</span>
        <span class="material-symbols-rounded text-[14px] muted chevron">expand_more</span>`;
      const childrenEl = document.createElement('div');
      childrenEl.className = 'tree-children';
      let rendered = false;
      toggle.addEventListener('click', () => {
        if (!rendered && renderFn) { renderFn(childrenEl); rendered = true; }
        childrenEl.classList.toggle('open');
        toggle.querySelector('.chevron').textContent = childrenEl.classList.contains('open') ? 'expand_less' : 'expand_more';
      });
      el.appendChild(toggle);
      el.appendChild(childrenEl);
      return { el, childrenEl };
    }

    // Async version: renderFn is async and called once on first open
    function makeTreeNodeAsync(icon, label, count, asyncRenderFn) {
      const el = document.createElement('div');
      el.className = 'tree-node';
      const toggle = document.createElement('div');
      toggle.className = 'tree-toggle';
      toggle.innerHTML = `<span class="material-symbols-rounded text-[14px] muted">${icon}</span>
        <span class="flex-1 truncate">${esc(label)}</span>
        <span class="badge">${count}</span>
        <span class="material-symbols-rounded text-[14px] muted chevron">expand_more</span>`;
      const childrenEl = document.createElement('div');
      childrenEl.className = 'tree-children';
      let rendered = false;
      toggle.addEventListener('click', () => {
        if (!rendered && asyncRenderFn) {
          rendered = true;
          asyncRenderFn(childrenEl).catch(e => {
            childrenEl.innerHTML = `<p class="text-xs text-red-500 p-3">Error: ${e.message}</p>`;
          });
        }
        childrenEl.classList.toggle('open');
        toggle.querySelector('.chevron').textContent = childrenEl.classList.contains('open') ? 'expand_less' : 'expand_more';
      });
      el.appendChild(toggle);
      el.appendChild(childrenEl);
      return { el, childrenEl };
    }

    function makeUserItem(u) {
      const el = document.createElement('div');
      el.className = 'user-item' + (selectedIds.has(u.id) ? ' selected' : '');
      el.dataset.userId = u.id;
      const hasPhone = !!u.jid;
      el.innerHTML = `<input type="checkbox" class="ucheck user-check" data-uid="${u.id}" ${selectedIds.has(u.id)?'checked':''} />
        <div class="user-avatar" style="background:${colorFor(u.name)}">${esc(initials(u.name))}</div>
        <div class="min-w-0 flex-1">
          <div class="user-name">${esc(u.name || u.email)}</div>
          <div class="user-sub ${hasPhone?'':'no-phone'}">${hasPhone ? '📱 '+u.phone : 'No phone'}</div>
        </div>`;
      // Click to open chat
      el.addEventListener('click', (e) => {
        if (e.target.classList.contains('user-check')) return;
        openChat(u);
        showDetail(u);
      });
      // Checkbox
      const cb = el.querySelector('.user-check');
      cb.addEventListener('change', () => {
        if (cb.checked) { selectedIds.add(u.id); el.classList.add('selected'); }
        else { selectedIds.delete(u.id); el.classList.remove('selected'); }
        updateBulkUI();
      });
      return el;
    }

    // ── Render: Teachers ──
    function renderTeacherTab(teachers) {
      const container = ui.tabTeachers;
      container.innerHTML = '';
      if (!teachers.length) { container.innerHTML = '<p class="text-xs muted p-4 text-center">No teachers found.</p>'; return; }

      // Group by college
      const groups = new Map();
      for (const t of teachers) {
        const key = t.college || 'Unknown';
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(t);
      }
      for (const [college, list] of [...groups.entries()].sort((a,b) => a[0].localeCompare(b[0]))) {
        const node = makeTreeNode('school', college, list.length);
        for (const t of list) node.childrenEl.appendChild(makeUserItem(t));
        container.appendChild(node.el);
      }
    }

    // ── Render: Admins ──
    function renderAdminsTab(admins) {
      const container = ui.tabAdmins;
      container.innerHTML = '';
      if (!admins.length) { container.innerHTML = '<p class="text-xs muted p-4 text-center">No admins found.</p>'; return; }
      for (const a of admins) container.appendChild(makeUserItem(a));
    }

    // ── Render: Employees ──
    function renderEmployeesTab(employees) {
      const container = ui.tabEmployees;
      container.innerHTML = '';
      if (!employees.length) { container.innerHTML = '<p class="text-xs muted p-4 text-center">No employees found.</p>'; return; }

      const groups = new Map();
      for (const s of employees) {
        const key = s.role.charAt(0).toUpperCase() + s.role.slice(1);
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(s);
      }
      for (const [role, list] of [...groups.entries()].sort((a,b) => a[0].localeCompare(b[0]))) {
        const node = makeTreeNode('badge', role + 's', list.length);
        for (const s of list) node.childrenEl.appendChild(makeUserItem(s));
        container.appendChild(node.el);
      }
    }

    // ── Tabs ──
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeTab = btn.dataset.tab;
        document.querySelectorAll('.tab-panel').forEach(p => p.style.display = 'none');
        document.getElementById('tab' + activeTab.charAt(0).toUpperCase() + activeTab.slice(1)).style.display = '';
      });
    });

    // ── Search ──
    ui.searchInput.addEventListener('input', () => {
      const q = ui.searchInput.value.trim().toLowerCase();
      document.querySelectorAll('.user-item').forEach(el => {
        const uid = el.dataset.userId;
        const u = allUsers.find(x => x.id === uid);
        if (!u) return;
        const hay = [u.name, u.email, u.phone, u.college, u.department, u.role].join(' ').toLowerCase();
        el.style.display = (!q || hay.includes(q)) ? '' : 'none';
      });
    });

    // ── Select All ──
    ui.selectAllCheck.addEventListener('change', () => {
      const checked = ui.selectAllCheck.checked;
      const visiblePanel = document.querySelector('.tab-panel[style=""],.tab-panel:not([style*="none"])');
      if (!visiblePanel) return;
      visiblePanel.querySelectorAll('.user-check').forEach(cb => {
        if (cb.closest('.user-item').style.display === 'none') return;
        cb.checked = checked;
        const uid = cb.dataset.uid;
        if (checked) selectedIds.add(uid);
        else selectedIds.delete(uid);
        cb.closest('.user-item').classList.toggle('selected', checked);
      });
      updateBulkUI();
    });

    function updateBulkUI() {
      const count = selectedIds.size;
      ui.selectedCount.textContent = count + ' selected';
      ui.bulkFab.style.display = count > 1 ? '' : 'none';
      ui.bulkFabCount.textContent = count;
    }

    // ── Bulk FAB ──
    ui.bulkFab.addEventListener('click', () => openBulkMode());

    // ── Chat ──
    function openChat(user) {
      activeUser = user;
      ui.emptyState.style.display = 'none';
      ui.bulkView.style.display = 'none';
      ui.chatView.style.display = 'flex';
      ui.chatName.textContent = user.name || user.email;
      ui.chatSub.textContent = user.jid ? '📱 ' + user.phone : '⚠️ No phone number';
      ui.chatAvatar.textContent = initials(user.name);
      ui.chatAvatar.style.background = colorFor(user.name);
      ui.sendBtn.disabled = !user.jid;
      renderChatHistory(user);
      ui.chatInput.focus();
    }

    function renderChatHistory(user) {
      const msgs = chatHistory[user.id] || [];
      ui.chatMessages.innerHTML = '';
      if (!msgs.length) {
        ui.chatMessages.innerHTML = `<div class="bubble system">Start a conversation with ${esc(user.name)}</div>`;
      }
      for (const m of msgs) {
        const b = document.createElement('div');
        b.className = 'bubble ' + (m.dir === 'sent' ? 'sent' : 'system');
        b.innerHTML = esc(m.text) + `<div class="bubble-time">${m.time}</div>`;
        ui.chatMessages.appendChild(b);
      }
      ui.chatMessages.scrollTop = ui.chatMessages.scrollHeight;
    }

    document.getElementById('chatCloseBtn').addEventListener('click', () => {
      ui.chatView.style.display = 'none'; ui.emptyState.style.display = ''; activeUser = null;
    });

    // Send message
    async function sendMessage(user, text) {
      if (!user.jid || !text.trim()) return false;
      try {
        const r = await fetch(BAILEYS + '/api/send-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jid: user.jid, text: text.trim() }),
        });
        if (!r.ok) { const d = await r.json().catch(()=>({})); throw new Error(d.error || 'Send failed'); }
        // Record in history
        if (!chatHistory[user.id]) chatHistory[user.id] = [];
        chatHistory[user.id].push({ text: text.trim(), time: timeStr(), dir: 'sent' });
        return true;
      } catch (err) {
        toast('Failed: ' + err.message, 'err');
        return false;
      }
    }

    ui.sendBtn.addEventListener('click', async () => {
      if (!activeUser) return;
      const text = ui.chatInput.value.trim();
      if (!text) return;
      ui.sendBtn.disabled = true;
      const ok = await sendMessage(activeUser, text);
      if (ok) { ui.chatInput.value = ''; renderChatHistory(activeUser); toast('Message sent ✓', 'ok'); }
      ui.sendBtn.disabled = !activeUser.jid;
    });

    ui.chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ui.sendBtn.click(); }
    });

    // Auto-resize textarea
    ui.chatInput.addEventListener('input', () => { ui.chatInput.style.height = 'auto'; ui.chatInput.style.height = Math.min(120, ui.chatInput.scrollHeight) + 'px'; });
    ui.bulkInput.addEventListener('input', () => { ui.bulkInput.style.height = 'auto'; ui.bulkInput.style.height = Math.min(120, ui.bulkInput.scrollHeight) + 'px'; });

    // ── Bulk Mode ──
    let bulkCancelled = false;
    const BULK_CONCURRENCY = 50; // send 50 messages at a time

    function openBulkMode() {
      const selected = allUsers.filter(u => selectedIds.has(u.id));
      const withJid = selected.filter(u => u.jid);
      bulkCancelled = false;
      ui.emptyState.style.display = 'none';
      ui.chatView.style.display = 'none';
      ui.bulkView.style.display = 'flex';
      ui.bulkRecipientInfo.textContent = `${selected.length} selected · ${withJid.length} with phone · ${selected.length - withJid.length} skipped`;
      ui.bulkLog.innerHTML = `<div class="bubble system">${withJid.length} users will receive the message. ${selected.length - withJid.length} without phone will be skipped.</div>`;
      ui.bulkBar.style.display = 'none';
      ui.bulkInput.value = '';
      ui.bulkInput.focus();
    }

    document.getElementById('bulkCloseBtn').addEventListener('click', () => {
      bulkCancelled = true;
      ui.bulkView.style.display = 'none'; ui.emptyState.style.display = '';
    });

    // Sends a single message without the toast side-effect (for bulk use)
    async function sendMessageSilent(user, text) {
      if (!user.jid || !text.trim()) return { user, ok: false, error: 'No JID' };
      try {
        const r = await fetch(BAILEYS + '/api/send-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jid: user.jid, text: text.trim() }),
        });
        if (!r.ok) { const d = await r.json().catch(()=>({})); throw new Error(d.error || 'Send failed'); }
        if (!chatHistory[user.id]) chatHistory[user.id] = [];
        chatHistory[user.id].push({ text: text.trim(), time: timeStr(), dir: 'sent' });
        return { user, ok: true };
      } catch (err) {
        return { user, ok: false, error: err.message };
      }
    }

    function addBulkLogEntry(name, success, errorMsg) {
      const b = document.createElement('div');
      if (success) {
        b.className = 'bubble sent';
        b.innerHTML = `✓ ${esc(name)} <span class="bubble-time">${timeStr()}</span>`;
      } else {
        b.className = 'bubble system';
        b.innerHTML = `✗ ${esc(name)} — ${esc(errorMsg || 'failed')}`;
      }
      ui.bulkLog.appendChild(b);
      ui.bulkLog.scrollTop = ui.bulkLog.scrollHeight;
    }

    ui.bulkSendBtn.addEventListener('click', async () => {
      const text = ui.bulkInput.value.trim();
      if (!text) { toast('Type a message first', 'err'); return; }
      const recipients = allUsers.filter(u => selectedIds.has(u.id) && u.jid);
      if (!recipients.length) { toast('No recipients with phone numbers', 'err'); return; }

      bulkCancelled = false;
      ui.bulkSendBtn.disabled = true;
      ui.bulkBar.style.display = '';
      let sent = 0, failed = 0;
      const total = recipients.length;

      ui.bulkStatus.textContent = `Sending 0/${total}... (batch size: ${BULK_CONCURRENCY})`;
      ui.bulkProgressFill.style.width = '0%';

      // Process in concurrent batches
      for (let i = 0; i < total; i += BULK_CONCURRENCY) {
        if (bulkCancelled) {
          ui.bulkStatus.textContent = `Cancelled! Sent: ${sent} · Failed: ${failed} · Skipped: ${total - sent - failed}`;
          break;
        }

        const batch = recipients.slice(i, i + BULK_CONCURRENCY);

        // Fire all messages in this batch concurrently
        const results = await Promise.allSettled(
          batch.map(u => sendMessageSilent(u, text))
        );

        // Process results
        for (const result of results) {
          const res = result.status === 'fulfilled' ? result.value : { user: { name: '?' }, ok: false, error: 'Promise rejected' };
          if (res.ok) {
            sent++;
            addBulkLogEntry(res.user.name, true);
          } else {
            failed++;
            addBulkLogEntry(res.user.name, false, res.error);
          }
        }

        const processed = Math.min(i + BULK_CONCURRENCY, total);
        ui.bulkStatus.textContent = `Sending ${processed}/${total}... (${sent} sent, ${failed} failed)`;
        ui.bulkProgressFill.style.width = (processed / total * 100) + '%';

        // Tiny delay between batches (100ms)
        if (i + BULK_CONCURRENCY < total && !bulkCancelled) {
          await new Promise(r => setTimeout(r, 100));
        }
      }

      if (!bulkCancelled) {
        ui.bulkStatus.textContent = `Done! Sent: ${sent} · Failed: ${failed}`;
      }
      ui.bulkSendBtn.disabled = false;
      toast(`Bulk send complete: ${sent} sent, ${failed} failed`, sent > 0 ? 'ok' : 'err');
    });

    // ── Detail Panel ──
    function showDetail(user) {
      ui.detailEmpty.style.display = 'none';
      ui.detailView.style.display = '';
      ui.detailName.textContent = user.name || user.email;
      ui.detailAvatar.textContent = initials(user.name);
      ui.detailAvatar.style.background = colorFor(user.name);
      ui.detailRole.innerHTML = `<span class="badge">${esc(user.role)}</span>`;

      const fields = [
        ['Email', user.email], ['Phone', user.phone || 'N/A'],
        ['College', user.college], ['Degree', user.degree],
        ['Department', user.department], ['Batch', user.batch],
        ['Section', user.section], ['Semester', user.semester],
      ].filter(f => f[1]);

      ui.detailFields.innerHTML = fields.map(([l,v]) =>
        `<div class="detail-field"><div class="detail-label">${l}</div><div class="detail-value">${esc(String(v))}</div></div>`
      ).join('');

      ui.detailCallLink.href = user.phone ? 'tel:+91' + user.phone : '#';
      ui.detailCallLink.style.opacity = user.phone ? 1 : 0.3;
      ui.detailEmailLink.href = user.email ? 'mailto:' + user.email : '#';
      ui.detailChatBtn.onclick = () => openChat(user);
    }

    // ── Mobile menu ──
    document.getElementById('mobileMenuBtn')?.addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('mobile-open');
    });

    // ── Refresh ──
    document.getElementById('refreshBtn').addEventListener('click', () => {
      selectedIds.clear(); updateBulkUI(); loadAllData().catch(e => toast('Load failed: ' + e.message, 'err'));
    });

    // ── Init ──
    loadAllData().catch(e => { toast('Failed to load: ' + e.message, 'err'); console.error(e); });
