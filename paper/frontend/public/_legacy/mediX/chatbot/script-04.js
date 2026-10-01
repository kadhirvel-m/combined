// Extracted from ui/mediX/chatbot.html (inline <script> #4).
    const API = (window.API_BASE || location.origin).replace(/\/$/, '');
    const messages = document.getElementById('messages');
    const chatForm = document.getElementById('chatForm');
    const promptEl = document.getElementById('prompt');
    const sourceSelect = document.getElementById('sourceIds');
    const sessionEl = document.getElementById('sessionId');
    const welcomeScreen = document.getElementById('welcomeScreen');
    let currentUserId = '';
    let hasMessages = false;

    function autoGrow(el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 200) + 'px';
    }

    function useSuggestion(btn) {
      const text = btn.textContent.replace(/^[^\s]+\s/, '').trim();
      promptEl.value = text;
      autoGrow(promptEl);
      promptEl.focus();
      chatForm.dispatchEvent(new Event('submit', { cancelable: true }));
    }

    function showChatArea() {
      if (!hasMessages) {
        hasMessages = true;
        welcomeScreen.style.display = 'none';
        messages.style.display = 'block';
      }
    }

    function getUserInitial() {
      try {
        const name = localStorage.getItem('px_user_name') || localStorage.getItem('userName') || '';
        return name.charAt(0).toUpperCase() || 'U';
      } catch (_) { return 'U'; }
    }

    function formatMarkdown(text) {
      // Very lightweight markdown: bold, inline code, line breaks
      let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');
      return html;
    }

    function bubble(role, text, citations = []) {
      showChatArea();
      const row = document.createElement('div');
      row.className = 'msg-row';

      const avatar = document.createElement('div');
      avatar.className = role === 'user' ? 'msg-avatar user-avatar' : 'msg-avatar bot-avatar';
      avatar.textContent = role === 'user' ? getUserInitial() : 'M';

      const body = document.createElement('div');
      body.className = 'msg-body';

      const name = document.createElement('div');
      name.className = 'msg-name';
      name.textContent = role === 'user' ? 'You' : 'Medix AI';

      const content = document.createElement('div');
      content.className = 'msg-text';
      if (role === 'bot') {
        content.innerHTML = formatMarkdown(text);
      } else {
        content.textContent = text;
      }

      body.appendChild(name);
      body.appendChild(content);

      if (citations.length > 0) {
        const citDiv = document.createElement('div');
        citDiv.className = 'msg-citations';
        citations.slice(0, 5).forEach((c) => {
          const chip = document.createElement('span');
          chip.className = 'citation-chip';
          chip.innerHTML = `<span class="material-symbols-rounded" style="font-size:12px;vertical-align:-2px;">description</span> ${c.source_name}#${c.chunk_index}`;
          citDiv.appendChild(chip);
        });
        body.appendChild(citDiv);
      }

      row.appendChild(avatar);
      row.appendChild(body);
      messages.appendChild(row);
      messages.scrollTop = messages.scrollHeight;
      return row;
    }

    function showTyping() {
      showChatArea();
      const row = document.createElement('div');
      row.className = 'msg-row';
      row.id = 'typingIndicator';

      const avatar = document.createElement('div');
      avatar.className = 'msg-avatar bot-avatar';
      avatar.textContent = 'M';

      const body = document.createElement('div');
      body.className = 'msg-body';

      const name = document.createElement('div');
      name.className = 'msg-name';
      name.textContent = 'Medix AI';

      const dots = document.createElement('div');
      dots.className = 'typing-dots';
      dots.innerHTML = '<span></span><span></span><span></span>';

      body.appendChild(name);
      body.appendChild(dots);
      row.appendChild(avatar);
      row.appendChild(body);
      messages.appendChild(row);
      messages.scrollTop = messages.scrollHeight;
    }

    function removeTyping() {
      const el = document.getElementById('typingIndicator');
      if (el) el.remove();
    }

    function getStoredToken() {
      const keys = ['px_token', 'teacherToken', 'userToken', 'sb-access-token', 'supabase.auth.token'];
      for (const key of keys) {
        try {
          const value = localStorage.getItem(key);
          if (value) return value;
        } catch (_) { }
      }
      return '';
    }

    function decodeJwtSub(token) {
      try {
        const parts = token.split('.');
        if (parts.length < 2) return '';
        const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const json = JSON.parse(atob(payload));
        return json.sub || json.user_id || json.uid || '';
      } catch (_) {
        return '';
      }
    }

    async function resolveCurrentUserId() {
      const token = getStoredToken();
      if (!token) return;
      const authHeaders = { Authorization: `Bearer ${token}` };
      for (const url of [`${API}/api/me`, `${API}/api/teacher/profile/me`]) {
        try {
          const res = await fetch(url, { headers: authHeaders });
          if (!res.ok) continue;
          const data = await res.json().catch(() => ({}));
          const id = data.id || data.user_id || data.auth_user_id || data.uid;
          if (id) {
            currentUserId = String(id);
            return;
          }
        } catch (_) { }
      }
      const sub = decodeJwtSub(token);
      if (sub) currentUserId = sub;
    }

    async function loadSources() {
      sourceSelect.innerHTML = '';
      try {
        const res = await fetch(`${API}/api/medix/rag/sources?limit=300`);
        const data = await res.json();
        const items = data.items || [];
        for (const source of items) {
          const option = document.createElement('option');
          option.value = source.id;
          option.textContent = `${source.source_name} (${source.chunk_count || 0})`;
          sourceSelect.appendChild(option);
        }
      } catch (error) {
        console.error('Failed to load sources:', error);
      }
    }

    function selectedSourceIds() {
      return [...sourceSelect.options].filter((option) => option.selected).map((option) => option.value);
    }

    async function sendMessage(message) {
      const debugRetrieval = new URLSearchParams(location.search).get('debugRetrieval') === '1'
        || localStorage.getItem('medix_debug_retrieval') === '1';
      const statelessMode = new URLSearchParams(location.search).get('stateless') !== '0'
        && localStorage.getItem('medix_stateless_mode') !== '0';
      const strictCitationMode = new URLSearchParams(location.search).get('strictCitations') !== '0'
        && localStorage.getItem('medix_strict_citations') !== '0';
      const verifyResponse = new URLSearchParams(location.search).get('verifyResponse') !== '0'
        && localStorage.getItem('medix_verify_response') !== '0';

      const body = {
        message,
        session_id: sessionEl.value.trim() || null,
        user_id: currentUserId || null,
        source_ids: selectedSourceIds(),
        top_k: Number(document.getElementById('topK').value || 12),
        min_score: Number(document.getElementById('minScore').value || 0.55),
        temperature: Number(document.getElementById('temp').value || 0.2),
        stateless_mode: statelessMode,
        strict_citation_mode: strictCitationMode,
        verify_response: verifyResponse,
        debug_retrieval: debugRetrieval,
      };

      const res = await fetch(`${API}/api/medix/rag/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);
      return data;
    }

    chatForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const message = promptEl.value.trim();
      if (!message) return;

      bubble('user', message);
      promptEl.value = '';
      promptEl.style.height = 'auto';

      const sendBtn = document.getElementById('sendBtn');
      sendBtn.disabled = true;
      showTyping();

      try {
        const data = await sendMessage(message);
        if (!sessionEl.value && data.session_id) sessionEl.value = data.session_id;

        if (data && data.retrieval_debug) {
          console.groupCollapsed('[Medix RAG] Retrieval debug');
          console.log('Summary:', {
            reasoning_mode: data.retrieval_debug.reasoning_mode,
            stateless_mode: data.retrieval_debug.stateless_mode,
            strict_citation_mode: data.retrieval_debug.strict_citation_mode,
            verify_response: data.retrieval_debug.verify_response,
            requested_top_k: data.retrieval_debug.requested_top_k,
            effective_top_k: data.retrieval_debug.effective_top_k,
            effective_min_score: data.retrieval_debug.effective_min_score,
            vector_candidates: data.retrieval_debug.vector_candidates,
            keyword_candidates: data.retrieval_debug.keyword_candidates,
            context_selected: data.retrieval_debug.context_selected,
            low_evidence_fallback_used: data.retrieval_debug.low_evidence_fallback_used,
            query_variants: data.retrieval_debug.query_variants,
            anchor_terms: data.retrieval_debug.anchor_terms,
            graph_terms: data.retrieval_debug.graph_terms,
            verification: data.retrieval_debug.verification,
          });
          console.table(data.retrieval_debug.preview || []);
          console.groupEnd();
        }

        removeTyping();
        bubble('bot', data.answer || '(empty answer)', data.citations || []);
      } catch (error) {
        removeTyping();
        bubble('bot', `Sorry, something went wrong: ${error.message || error}`);
      } finally {
        sendBtn.disabled = false;
        promptEl.focus();
      }
    });

    // Enter to send, Shift+Enter for new line
    promptEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        chatForm.dispatchEvent(new Event('submit', { cancelable: true }));
      }
    });

    resolveCurrentUserId();
    loadSources();
