// Extracted from ui/collab.html (inline <script> #2).
    const API = ((window.API_BASE || window.__API_BASE || 'http://0.0.0.0:10000')).replace(/\/$/, '');
    const token = localStorage.getItem('px_token');
    if (!token) { window.location.href = 'login.html'; }
    const qs = new URLSearchParams(location.search);
    const applicationId = qs.get('application_id');
    if (!applicationId) { document.getElementById('status').textContent = 'Missing application_id'; }

    const el = (id) => document.getElementById(id);
    const statusEl = el('status');
    const msgsEl = el('msgs');
    const form = el('sendForm');
    const input = el('msgInput');
    const sendBtn = el('sendBtn');

    const esc = (s) => (s ?? '').toString().replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

    let appRow = null; let me = null;

    async function loadApp() {
      statusEl.textContent = 'Loading…';
      try {
        const [meRes, appRes] = await Promise.all([
          fetch(`${API}/api/profile`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API}/api/applications/${encodeURIComponent(applicationId)}`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        me = meRes.ok ? await meRes.json() : null;
        const appData = appRes.ok ? await appRes.json() : null;
        if (!appRes.ok) throw new Error((appData && appData.detail) || 'Failed to load application');
        appRow = appData;
        if (String((appRow.status || '')).toLowerCase() !== 'accepted') {
          statusEl.textContent = 'This application is not accepted yet. Collaboration opens after acceptance.'; return;
        }
        el('projectLink').href = `project.html?id=${encodeURIComponent(appRow.project_id)}`;
        el('appMeta').textContent = `Status: ${appRow.status} • Applied: ${String(appRow.created_at || '').replace('T', ' ').replace('Z', '')}`;
        el('profileApplicant').href = `public_profile.html?user_id=${encodeURIComponent(appRow.applicant_user_id)}`;
        // Fetch owner user id for link
        try {
          const p = await fetch(`${API}/api/projects/${encodeURIComponent(appRow.project_id)}`).then(r => r.json());
          if (p && p.user_id) { el('profileOwner').href = `public_profile.html?user_id=${encodeURIComponent(p.user_id)}`; }
        } catch (_) { }
        await loadMessages();
        statusEl.textContent = '';
      } catch (e) { statusEl.textContent = e.message || 'Failed to load.'; }
    }

    async function loadMessages() {
      try {
        const r = await fetch(`${API}/api/collab/${encodeURIComponent(applicationId)}/messages`, { headers: { Authorization: `Bearer ${token}` } });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.detail || 'Failed to load messages');
        const list = Array.isArray(j.messages) ? j.messages : [];
        renderMessages(list);
      } catch (e) { statusEl.textContent = e.message || 'Failed to load messages'; }
    }

    function renderMessages(list) {
      const myId = me && me.user_id;
      msgsEl.innerHTML = list.map(m => {
        const mine = m.sender_user_id === myId;
        const cls = mine ? 'bubble mine' : 'bubble theirs';
        const when = String(m.created_at || '').replace('T', ' ').replace('Z', '');
        return `<div class="${cls}">
          <div class="text-xs opacity-70 mb-0.5">${when}</div>
          <div class="text-sm whitespace-pre-wrap">${esc(m.content || '')}</div>
        </div>`;
      }).join('');
      msgsEl.scrollTop = msgsEl.scrollHeight;
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = (input.value || '').trim();
      if (!text) return;
      sendBtn.disabled = true; input.disabled = true;
      try {
        const r = await fetch(`${API}/api/collab/${encodeURIComponent(applicationId)}/messages`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ content: text })
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.detail || 'Failed to send');
        input.value = '';
        await loadMessages();
      } catch (e) { alert(e.message || 'Failed to send'); }
      finally { sendBtn.disabled = false; input.disabled = false; input.focus(); }
    });

    // Basic polling for new messages
    let pollTimer = null;
    function startPolling() {
      stopPolling();
      pollTimer = setInterval(loadMessages, 5000);
    }
    function stopPolling() { if (pollTimer) { clearInterval(pollTimer); pollTimer = null; } }
    window.addEventListener('focus', startPolling);
    window.addEventListener('blur', stopPolling);

    // Auth-aware navbar avatar
    (function () {
      const token = localStorage.getItem('px_token');
      if (!token) return;
      document.getElementById('signInLink')?.classList.add('hidden');
      const navProfile = document.getElementById('navProfile');
      const navProfileImg = document.getElementById('navProfileImg');
      const navProfileInitial = document.getElementById('navProfileInitial');
      if (navProfile) navProfile.classList.remove('hidden');
      const API = ((window.API_BASE || window.__API_BASE || 'http://0.0.0.0:10000')).replace(/\/$/, '');
      fetch(`${API}/api/profile`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(p => {
          if (!p) return;
          let initials = 'ME';
          if (p.name) initials = p.name.split(' ').filter(Boolean).map(s => s[0]?.toUpperCase()).slice(0, 2).join('');
          if (navProfileInitial) navProfileInitial.textContent = initials;
          if (p.profile_image_url) {
            if (navProfileImg) { navProfileImg.src = p.profile_image_url; navProfileImg.classList.remove('hidden'); if (navProfileInitial) navProfileInitial.classList.add('hidden'); }
          }
        }).catch(() => { });
    })();

    loadApp().then(startPolling);
