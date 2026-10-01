// Extracted from ui/chatbot.html (inline <script> #2).
    // ============================================================================
    // STUDYAI CHATBOT - CLIENT
    // ============================================================================

    const API_BASE = window.__API_BASE || 'http://0.0.0.0:10000';
    const STUDYAI_API = `${API_BASE}/api/studyai`;

    // State
    let currentConversationId = null;
    let currentStudyMode = null;
    let conversations = [];
    let isLoading = false;
    let isRecording = false;

    // DOM Elements
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const conversationsList = document.getElementById('conversationsList');
    const messagesContainer = document.getElementById('messagesContainer');
    const messagesList = document.getElementById('messagesList');
    const welcomeScreen = document.getElementById('welcomeScreen');
    const typingIndicator = document.getElementById('typingIndicator');
    const messageInput = document.getElementById('messageInput');
    const chatTitle = document.getElementById('chatTitle');
    const studyModeIndicator = document.getElementById('studyModeIndicator');
    const studyModeLabel = document.getElementById('studyModeLabel');

    // ============================================================================
    // INITIALIZATION
    // ============================================================================

    document.addEventListener('DOMContentLoaded', async () => {
      updateThemeUI();
      await loadConversations();

      // Setup search
      document.getElementById('searchInput').addEventListener('input', filterConversations);

      // Auto-resize textarea
      messageInput.addEventListener('input', () => autoResize(messageInput));
    });

    // ============================================================================
    // AUTH HELPERS
    // ============================================================================

    function getAuthToken() {
      try {
        // Try px_token first (main user token)
        const pxToken = localStorage.getItem('px_token');
        if (pxToken) return pxToken;

        // Try teacher token
        const teacherToken = localStorage.getItem('teacherToken');
        if (teacherToken) return teacherToken;

        // Fallback to Supabase session format
        const storedSession = localStorage.getItem('supabase.auth.token') ||
          localStorage.getItem('sb-uppzpkmpxgyipjzcskva-auth-token');
        if (storedSession) {
          const session = JSON.parse(storedSession);
          return session?.currentSession?.access_token || session?.access_token;
        }
      } catch (e) {
        console.error('Error getting auth token:', e);
      }
      return null;
    }

    function getAuthHeaders() {
      const token = getAuthToken();
      return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    // ============================================================================
    // API CALLS
    // ============================================================================

    async function apiCall(endpoint, options = {}) {
      const url = `${STUDYAI_API}${endpoint}`;
      const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...options.headers
      };

      try {
        const response = await fetch(url, {
          ...options,
          headers
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.detail || `HTTP ${response.status}`);
        }

        return response.json();
      } catch (error) {
        console.error(`API Error:`, error);
        throw error;
      }
    }

    // ============================================================================
    // CONVERSATIONS
    // ============================================================================

    async function loadConversations() {
      try {
        const data = await apiCall('/conversations');
        conversations = data.conversations || [];
        renderConversationsList();
      } catch (error) {
        console.error('Failed to load conversations:', error);
        document.getElementById('convLoading').innerHTML = `
          <p class="text-sm text-center" style="color: var(--muted);">
            Sign in to save your chats
          </p>
        `;
      }
    }

    function renderConversationsList() {
      const container = document.getElementById('conversationsList');

      if (!conversations.length) {
        container.innerHTML = `
          <div class="text-center py-8">
            <span class="material-symbols-rounded text-4xl mb-2 block" style="color: var(--muted);">chat_bubble</span>
            <p class="text-sm" style="color: var(--muted);">No conversations yet</p>
          </div>
        `;
        return;
      }

      // Group by date
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();

      const grouped = { today: [], yesterday: [], older: [] };

      conversations.forEach(conv => {
        const convDate = new Date(conv.updated_at || conv.created_at).toDateString();
        if (convDate === today) grouped.today.push(conv);
        else if (convDate === yesterday) grouped.yesterday.push(conv);
        else grouped.older.push(conv);
      });

      let html = '';

      if (grouped.today.length) {
        html += `<div class="px-2 py-2 text-xs font-semibold uppercase" style="color: var(--muted);">Today</div>`;
        grouped.today.forEach(conv => html += renderConversationItem(conv));
      }

      if (grouped.yesterday.length) {
        html += `<div class="px-2 py-2 mt-2 text-xs font-semibold uppercase" style="color: var(--muted);">Yesterday</div>`;
        grouped.yesterday.forEach(conv => html += renderConversationItem(conv));
      }

      if (grouped.older.length) {
        html += `<div class="px-2 py-2 mt-2 text-xs font-semibold uppercase" style="color: var(--muted);">Previous</div>`;
        grouped.older.forEach(conv => html += renderConversationItem(conv));
      }

      container.innerHTML = html;
    }

    function renderConversationItem(conv) {
      const isActive = conv.id === currentConversationId;
      return `
        <button onclick="loadConversation('${conv.id}')" 
          class="conv-item w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 group ${isActive ? 'active' : ''}"
          data-conv-id="${conv.id}">
          <span class="material-symbols-rounded text-lg" style="color: var(--muted);">chat_bubble</span>
          <span class="flex-1 truncate text-sm" style="color: var(--surface-contrast);">${escapeHtml(conv.title)}</span>
          <span class="material-symbols-rounded text-lg opacity-0 group-hover:opacity-100 transition" 
            style="color: var(--muted);" onclick="event.stopPropagation(); deleteConversation('${conv.id}')">delete</span>
        </button>
      `;
    }

    function filterConversations() {
      const query = document.getElementById('searchInput').value.toLowerCase();
      const items = document.querySelectorAll('.conv-item');

      items.forEach(item => {
        const title = item.querySelector('span:nth-child(2)').textContent.toLowerCase();
        item.style.display = title.includes(query) ? 'flex' : 'none';
      });
    }

    async function createNewConversation() {
      currentConversationId = null;
      currentStudyMode = null;

      chatTitle.textContent = 'New Chat';
      messagesList.innerHTML = '';
      messagesList.classList.add('hidden');
      welcomeScreen.classList.remove('hidden');
      clearStudyMode();

      // Update active state
      document.querySelectorAll('.conv-item').forEach(el => el.classList.remove('active'));

      // Close mobile sidebar
      if (window.innerWidth < 1024) toggleSidebar();
    }

    async function loadConversation(conversationId) {
      if (isLoading) return;
      isLoading = true;

      try {
        const data = await apiCall(`/conversations/${conversationId}`);
        currentConversationId = conversationId;

        chatTitle.textContent = data.title || 'Chat';

        // Clear and render messages
        messagesList.innerHTML = '';
        welcomeScreen.classList.add('hidden');
        messagesList.classList.remove('hidden');

        (data.messages || []).forEach(msg => {
          appendMessage(msg.role, msg.content, msg.id, msg.metadata || {});
        });

        // Update active state
        document.querySelectorAll('.conv-item').forEach(el => {
          el.classList.toggle('active', el.dataset.convId === conversationId);
        });

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Close mobile sidebar
        if (window.innerWidth < 1024) toggleSidebar();
      } catch (error) {
        showToast('Failed to load conversation');
      } finally {
        isLoading = false;
      }
    }

    async function deleteConversation(conversationId) {
      if (!confirm('Delete this conversation?')) return;

      try {
        await apiCall(`/conversations/${conversationId}`, { method: 'DELETE' });

        if (currentConversationId === conversationId) {
          createNewConversation();
        }

        await loadConversations();
        showToast('Conversation deleted');
      } catch (error) {
        showToast('Failed to delete conversation');
      }
    }

    function deleteCurrentConversation() {
      if (currentConversationId) {
        deleteConversation(currentConversationId);
      }
    }

    // ============================================================================
    // MESSAGES
    // ============================================================================

    async function sendMessage() {
      const content = messageInput.value.trim();
      if (!content || isLoading) return;

      isLoading = true;
      messageInput.value = '';
      autoResize(messageInput);

      // Create conversation if needed
      if (!currentConversationId) {
        try {
          const conv = await apiCall('/conversations', {
            method: 'POST',
            body: JSON.stringify({ title: 'New Chat' })
          });
          currentConversationId = conv.id;
          welcomeScreen.classList.add('hidden');
          messagesList.classList.remove('hidden');
        } catch (error) {
          showToast('Failed to create conversation');
          isLoading = false;
          return;
        }
      }

      // Add user message to UI
      appendMessage('user', content);

      // Show typing indicator
      typingIndicator.classList.remove('hidden');
      messagesContainer.scrollTop = messagesContainer.scrollHeight;

      try {
        const data = await apiCall(`/conversations/${currentConversationId}/messages`, {
          method: 'POST',
          body: JSON.stringify({
            content,
            study_mode: currentStudyMode
          })
        });

        // Hide typing indicator
        typingIndicator.classList.add('hidden');

        // Add AI response
        if (data.ai_message) {
          appendMessage('assistant', data.ai_message.content, data.ai_message.id, data.ai_message.metadata || {});
        }

        // Update title if changed
        if (data.ai_message && chatTitle.textContent === 'New Chat') {
          const newTitle = content.substring(0, 50) + (content.length > 50 ? '...' : '');
          chatTitle.textContent = newTitle;
        }

        // Refresh conversations list
        await loadConversations();

        // Clear study mode after use
        clearStudyMode();
      } catch (error) {
        typingIndicator.classList.add('hidden');
        appendMessage('assistant', 'Sorry, I encountered an error. Please try again.');
        showToast('Failed to send message');
      } finally {
        isLoading = false;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }

    function appendMessage(role, content, messageId = null, metadata = {}) {
      const msgDiv = document.createElement('div');
      msgDiv.className = `flex ${role === 'user' ? 'justify-end' : 'gap-3 items-start'}`;
      if (messageId) msgDiv.dataset.messageId = messageId;

      const renderedContent = renderMarkdown(content);
      const toolCalls = Array.isArray(metadata?.tool_calls) ? metadata.tool_calls : [];
      const toolCallsHtml = role === 'assistant' ? renderToolCalls(toolCalls) : '';

      if (role === 'user') {
        msgDiv.innerHTML = `
          <div class="msg-user px-4 py-3 max-w-[85%] sm:max-w-[75%]">
            <div class="msg-content text-sm leading-relaxed">${renderedContent}</div>
          </div>
        `;
      } else {
        msgDiv.innerHTML = `
          <div class="ai-avatar w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0">
            <span class="material-symbols-rounded text-white text-lg">psychology</span>
          </div>
          <div class="msg-ai px-4 py-3 max-w-[85%] sm:max-w-[80%]">
            <div class="msg-content prose prose-sm max-w-none" style="color: var(--surface-contrast);">${renderedContent}</div>
            ${toolCallsHtml}
            <div class="flex items-center gap-2 mt-3 pt-2 border-t" style="border-color: var(--outline);">
              <button onclick="copyMessage(this)" class="p-1.5 rounded-lg hover:bg-[var(--brand-soft)] transition" title="Copy">
                <span class="material-symbols-rounded text-base" style="color: var(--muted);">content_copy</span>
              </button>
              <button onclick="toggleBookmark(this, '${messageId}')" class="p-1.5 rounded-lg hover:bg-[var(--brand-soft)] transition" title="Bookmark">
                <span class="material-symbols-rounded text-base" style="color: var(--muted);">bookmark</span>
              </button>
            </div>
          </div>
        `;
      }

      messagesList.appendChild(msgDiv);

      // Render math
      if (typeof renderMathInElement === 'function') {
        renderMathInElement(msgDiv, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\(', right: '\\)', display: false },
            { left: '\\[', right: '\\]', display: true }
          ],
          throwOnError: false
        });
      }

      // Highlight code
      msgDiv.querySelectorAll('pre code').forEach(block => {
        hljs.highlightElement(block);
      });
    }

    function renderMarkdown(text) {
      if (!text) return '';

      // Configure marked
      marked.setOptions({
        breaks: true,
        gfm: true,
        headerIds: false,
        mangle: false
      });

      const html = marked.parse(text);
      return DOMPurify.sanitize(html);
    }

    function renderToolCalls(toolCalls) {
      if (!Array.isArray(toolCalls) || !toolCalls.length) return '';

      const rows = toolCalls.slice(0, 5).map((call, idx) => {
        const tool = escapeHtml(call.tool || 'unknown_tool');
        const endpoint = escapeHtml(call.endpoint || 'n/a');
        const status = Number.isFinite(Number(call.status)) ? Number(call.status) : '-';
        const ok = !!call.ok;
        const argsRaw = call.args && typeof call.args === 'object' ? JSON.stringify(call.args) : '{}';
        const args = escapeHtml(argsRaw.length > 180 ? argsRaw.slice(0, 180) + '...' : argsRaw);

        return `
          <div class="rounded-lg border p-2.5" style="border-color: var(--outline); background: var(--brand-soft);">
            <div class="flex items-center justify-between gap-2">
              <div class="text-xs font-semibold" style="color: var(--surface-contrast);">Tool ${idx + 1}: ${tool}</div>
              <span class="text-[11px] px-2 py-0.5 rounded-full" style="background: ${ok ? 'rgba(16,185,129,0.16)' : 'rgba(239,68,68,0.16)'}; color: ${ok ? '#059669' : '#dc2626'};">${status}</span>
            </div>
            <div class="text-[11px] mt-1" style="color: var(--muted);">Endpoint: ${endpoint}</div>
            <div class="text-[11px] mt-1 break-all" style="color: var(--muted);">Args: ${args}</div>
          </div>
        `;
      }).join('');

      const extra = toolCalls.length > 5
        ? `<div class="text-[11px] mt-2" style="color: var(--muted);">+${toolCalls.length - 5} more tool calls</div>`
        : '';

      return `
        <details class="mt-3 border rounded-xl" style="border-color: var(--outline);">
          <summary class="px-3 py-2 text-xs font-semibold cursor-pointer select-none" style="color: var(--surface-contrast);">
            Agentic Tool Calls (${toolCalls.length})
          </summary>
          <div class="px-3 pb-3 space-y-2">${rows}${extra}</div>
        </details>
      `;
    }

    // ============================================================================
    // STUDY MODES
    // ============================================================================

    function setStudyMode(mode) {
      currentStudyMode = mode;

      const modeLabels = {
        explain: 'Explain Mode',
        summarize: 'Summarize Mode',
        quiz: 'Quiz Mode',
        solve: 'Solve Mode',
        compare: 'Compare Mode',
        outline: 'Outline Mode',
        flashcards: 'Flashcards Mode',
        cite: 'Citation Mode'
      };

      studyModeLabel.textContent = modeLabels[mode] || mode;
      studyModeIndicator.classList.remove('hidden');

      // Update placeholder based on mode
      const placeholders = {
        explain: 'Enter a concept to explain...',
        summarize: 'Paste content to summarize...',
        quiz: 'Enter a topic to quiz on...',
        solve: 'Enter a problem to solve...',
        compare: 'Enter concepts to compare...',
        outline: 'Enter a topic for an outline...',
        flashcards: 'Enter a topic for flashcards...',
        cite: 'Enter source details for citation...'
      };

      messageInput.placeholder = placeholders[mode] || 'Ask me anything...';
      messageInput.focus();
    }

    function clearStudyMode() {
      currentStudyMode = null;
      studyModeIndicator.classList.add('hidden');
      messageInput.placeholder = 'Ask me anything about your studies...';
    }

    function quickPrompt(prompt) {
      messageInput.value = prompt;
      autoResize(messageInput);
      sendMessage();
    }

    // ============================================================================
    // SHARING
    // ============================================================================

    function shareConversation() {
      if (!currentConversationId) {
        showToast('No conversation to share');
        return;
      }
      document.getElementById('shareModal').classList.remove('hidden');
    }

    function closeShareModal() {
      document.getElementById('shareModal').classList.add('hidden');
    }

    async function confirmShare() {
      try {
        const isAnonymous = document.getElementById('anonymousShare').checked;

        // First update anonymous setting
        if (isAnonymous) {
          await apiCall(`/conversations/${currentConversationId}`, {
            method: 'PATCH',
            body: JSON.stringify({ is_anonymous: true })
          });
        }

        // Generate share link
        const data = await apiCall(`/conversations/${currentConversationId}/share`, {
          method: 'POST'
        });

        const shareUrl = `${window.location.origin}/ui/chatbot.html?share=${data.share_code}`;
        document.getElementById('shareLinkInput').value = shareUrl;

        showToast('Share link generated!');
      } catch (error) {
        showToast('Failed to generate share link');
      }
    }

    function copyShareLink() {
      const input = document.getElementById('shareLinkInput');
      if (input.value) {
        navigator.clipboard.writeText(input.value);
        showToast('Link copied to clipboard!');
      }
    }

    // ============================================================================
    // EXPORT
    // ============================================================================

    async function exportConversation() {
      if (!currentConversationId) {
        showToast('No conversation to export');
        return;
      }

      try {
        const response = await fetch(`${STUDYAI_API}/conversations/${currentConversationId}/export/md`, {
          headers: getAuthHeaders()
        });

        if (!response.ok) throw new Error('Export failed');

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${chatTitle.textContent.substring(0, 40)}.md`;
        a.click();
        URL.revokeObjectURL(url);

        showToast('Conversation exported!');
      } catch (error) {
        showToast('Failed to export conversation');
      }
    }

    // ============================================================================
    // UTILS
    // ============================================================================

    function toggleSidebar() {
      const isOpen = !sidebar.classList.contains('-translate-x-full');
      sidebar.classList.toggle('-translate-x-full', isOpen);
      sidebarOverlay.classList.toggle('hidden', isOpen);
    }

    function toggleTheme() {
      const html = document.documentElement;
      const currentTheme = html.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

      html.setAttribute('data-theme', newTheme);
      html.classList.toggle('dark', newTheme === 'dark');

      localStorage.setItem('px_theme', newTheme);

      updateThemeUI();
    }

    function updateThemeUI() {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      document.getElementById('themeIcon').textContent = isDark ? 'light_mode' : 'dark_mode';
      document.getElementById('themeLabel').textContent = isDark ? 'Light Mode' : 'Dark Mode';
    }

    function autoResize(textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
    }

    function handleKeyDown(event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
      }
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    function showToast(message) {
      const toast = document.getElementById('toast');
      document.getElementById('toastMessage').textContent = message;
      toast.classList.remove('opacity-0', 'translate-y-4');
      toast.classList.add('opacity-100', 'translate-y-0');

      setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-4');
        toast.classList.remove('opacity-100', 'translate-y-0');
      }, 3000);
    }

    function copyMessage(btn) {
      const msgContent = btn.closest('.msg-ai').querySelector('.msg-content').textContent;
      navigator.clipboard.writeText(msgContent);
      showToast('Copied to clipboard!');
    }

    async function toggleBookmark(btn, messageId) {
      if (!messageId) return;

      const icon = btn.querySelector('.material-symbols-rounded');
      const isBookmarked = icon.textContent === 'bookmark_added';

      try {
        await apiCall(`/messages/${messageId}/bookmark`, {
          method: 'PATCH',
          body: JSON.stringify({ is_bookmarked: !isBookmarked })
        });

        icon.textContent = isBookmarked ? 'bookmark' : 'bookmark_added';
        icon.style.color = isBookmarked ? 'var(--muted)' : 'var(--brand)';
      } catch (error) {
        showToast('Failed to update bookmark');
      }
    }

    function toggleVoiceInput() {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        showToast('Voice input not supported in this browser');
        return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (isRecording) {
        // Stop recording
        isRecording = false;
        document.getElementById('voiceBtn').querySelector('span').textContent = 'mic';
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        isRecording = true;
        document.getElementById('voiceBtn').querySelector('span').textContent = 'mic_off';
        showToast('Listening...');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        messageInput.value += (messageInput.value ? ' ' : '') + transcript;
        autoResize(messageInput);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        showToast('Voice input failed');
      };

      recognition.onend = () => {
        isRecording = false;
        document.getElementById('voiceBtn').querySelector('span').textContent = 'mic';
      };

      recognition.start();
    }

    // ============================================================================
    // SHARED CONVERSATION VIEW
    // ============================================================================

    async function checkForSharedConversation() {
      const params = new URLSearchParams(window.location.search);
      const shareCode = params.get('share');

      if (shareCode) {
        try {
          const response = await fetch(`${STUDYAI_API}/shared/${shareCode}`);
          if (!response.ok) throw new Error('Not found');

          const data = await response.json();

          // Render shared conversation in read-only mode
          chatTitle.textContent = data.title + ' (Shared)';
          welcomeScreen.classList.add('hidden');
          messagesList.classList.remove('hidden');

          // Disable input
          messageInput.disabled = true;
          messageInput.placeholder = 'This is a shared conversation (read-only)';
          document.getElementById('sendBtn').disabled = true;
          document.getElementById('studyModeBar').classList.add('hidden');

          // Render messages
          (data.messages || []).forEach(msg => {
            appendMessage(msg.role, msg.content, msg.id);
          });

          // Show owner info
          const ownerBadge = document.createElement('div');
          ownerBadge.className = 'text-center py-3 text-sm';
          ownerBadge.style.color = 'var(--muted)';
          ownerBadge.innerHTML = `Shared by <strong>${escapeHtml(data.owner_name)}</strong>`;
          messagesList.insertBefore(ownerBadge, messagesList.firstChild);

        } catch (error) {
          showToast('Shared conversation not found');
        }
      }
    }

    // Check for shared conversation on load
    document.addEventListener('DOMContentLoaded', () => {
      checkForSharedConversation();
    });
