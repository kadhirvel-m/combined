// Extracted from ui/mediX/notes_chat.html (inline <script> #5).
    // Notes Feedback widget
    (function () {
      const apiBase = (window.API_BASE || 'http://0.0.0.0:10000').replace(/\/+$/, '');
      const modal = document.getElementById('feedbackModal');
      const btnOpen = document.getElementById('feedbackBtn');
      const btnClose = document.getElementById('feedbackModalClose');
      if (!modal || !btnOpen) return;

      const $stickyHeader = document.querySelector('header');

      function setHeaderHidden(hidden) {
        if (!$stickyHeader) return;
        if (hidden) {
          if ($stickyHeader.dataset.prevVisibility === undefined) {
            $stickyHeader.dataset.prevVisibility = $stickyHeader.style.visibility || '';
          }
          $stickyHeader.style.visibility = 'hidden';
        } else {
          const prev = $stickyHeader.dataset.prevVisibility;
          $stickyHeader.style.visibility = prev || '';
          delete $stickyHeader.dataset.prevVisibility;
        }
      }

      const $category = document.getElementById('fbCategory');
      const $message = document.getElementById('fbMessage');
      const $submit = document.getElementById('fbSubmit');
      const $status = document.getElementById('fbStatus');
      const $authHint = document.getElementById('fbAuthHint');

      const $tagsWrap = document.getElementById('fbTags');
      const $templatesWrap = document.getElementById('fbTemplates');
      const $ratingWrap = document.getElementById('fbRating');
      const $useSel = document.getElementById('fbUseSelection');
      const $selPreview = document.getElementById('fbSelPreview');

      let selectedTags = new Set();
      let selectedRating = null;
      let selectedText = '';

      function safeGetToken() {
        try {
          if (typeof getAuthToken === 'function') return getAuthToken() || '';
        } catch { }
        // fallback: same keys
        const keys = ['teacherToken', 'px_token', 'userToken', 'sb-access-token', 'supabase.auth.token'];
        for (const k of keys) {
          try { const v = localStorage.getItem(k); if (v) return v; } catch { }
        }
        return '';
      }

      function withinOutput(node) {
        const out = document.getElementById('output');
        if (!out || !node) return false;
        if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;
        return out.contains(node);
      }

      function setStatus(text, isError) {
        if (!$status) return;
        $status.textContent = text || '';
        $status.style.color = isError ? '#ef4444' : 'var(--muted)';
      }

      function openModal() {
        modal.classList.remove('hidden');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        setHeaderHidden(true);
        setStatus('', false);
        setTimeout(() => { $message?.focus(); }, 50);
      }

      function closeModal() {
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        setHeaderHidden(false);
      }

      btnOpen.addEventListener('click', openModal);
      btnClose?.addEventListener('click', closeModal);
      modal.addEventListener('click', (event) => {
        if (modal.classList.contains('hidden')) return;
        if (event.target?.closest?.('[data-feedback-modal-panel]')) return;
        closeModal();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
      });

      function setTagButtonState(btn, on) {
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        btn.classList.toggle('bg-[var(--brand-soft)]', on);
      }

      $tagsWrap?.addEventListener('click', (e) => {
        const btn = e.target?.closest?.('button[data-tag]');
        const tag = btn?.getAttribute?.('data-tag');
        if (!btn || !tag) return;
        if (selectedTags.has(tag)) selectedTags.delete(tag);
        else selectedTags.add(tag);
        setTagButtonState(btn, selectedTags.has(tag));
      });

      $templatesWrap?.addEventListener('click', (e) => {
        const btn = e.target?.closest?.('button[data-template]');
        const tpl = btn?.getAttribute?.('data-template');
        if (!btn || !tpl || !$message) return;
        const cur = ($message.value || '').trim();
        $message.value = cur ? (cur + '\n' + tpl) : tpl;
        $message.focus();
      });

      $ratingWrap?.addEventListener('click', (e) => {
        const btn = e.target?.closest?.('button[data-rating]');
        const r = btn?.getAttribute?.('data-rating');
        if (!btn || !r) return;
        const num = parseInt(r, 10);
        if (!Number.isFinite(num)) return;
        selectedRating = num;
        $ratingWrap.querySelectorAll('button[data-rating]').forEach(b => {
          b.classList.toggle('bg-[var(--brand-soft)]', b.getAttribute('data-rating') === r);
        });
      });

      $useSel?.addEventListener('click', () => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed) {
          setStatus('Select some text in the output first.', true);
          return;
        }
        if (!withinOutput(sel.anchorNode) || !withinOutput(sel.focusNode)) {
          setStatus('Selection must be inside the Final Output.', true);
          return;
        }
        const txt = (sel.toString() || '').trim();
        if (!txt) {
          setStatus('Selection is empty.', true);
          return;
        }
        selectedText = txt.slice(0, 1200);
        if ($selPreview) $selPreview.textContent = `Selected: ${selectedText.length > 120 ? selectedText.slice(0, 120) + '…' : selectedText}`;
        setStatus('Added selection to feedback.', false);
      });

      function resolveVariant() {
        // Try to infer from active variant buttons
        const active = document.querySelector('[data-variant][aria-selected="true"]')?.getAttribute('data-variant');
        if (active) return active;
        // fallback: localStorage last variant if present
        try {
          const v = localStorage.getItem('paperx:notesVariant');
          if (v) return v;
        } catch { }
        return null;
      }

      function resolveNoteId(variant) {
        try {
          const key = variant ? `paperx:lastNoteId:${variant}` : null;
          const v = key ? localStorage.getItem(key) : null;
          if (v) return v;
          return localStorage.getItem('paperx:lastNoteId') || '';
        } catch { return ''; }
      }

      function resolveTitleTopic() {
        const h1 = document.querySelector('#output h1')?.textContent || '';
        const topic = (document.getElementById('topic')?.value || '').trim();
        return {
          title: (h1 || topic || '').trim(),
          topic: (topic || h1 || '').trim()
        };
      }

      async function submit() {
        const token = safeGetToken();
        const msg = ($message?.value || '').trim();
        if (!token) {
          $authHint?.classList.remove('hidden');
          setStatus('Sign in required to send feedback.', true);
          return;
        }
        $authHint?.classList.add('hidden');
        if (!msg) {
          setStatus('Please write a short message.', true);
          $message?.focus();
          return;
        }
        const category = ($category?.value || 'Other').trim();
        const variant = resolveVariant();
        const noteId = resolveNoteId(variant);
        const { title, topic } = resolveTitleTopic();
        const tags = Array.from(selectedTags);

        const body = {
          category,
          message: msg,
          quick_tags: tags,
          rating: selectedRating,
          note_id: noteId || null,
          note_variant: variant || null,
          note_title: title || null,
          topic: topic || null,
          page_path: (location && location.pathname) ? location.pathname : null,
          page_url: (location && location.href) ? location.href : null,
          selected_text: selectedText || null,
          meta: {
            tz: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
            lang: navigator.language || null,
            screen: { w: window.screen?.width || null, h: window.screen?.height || null },
          }
        };

        $submit.disabled = true;
        $submit.classList.add('opacity-70');
        setStatus('Sending…', false);
        try {
          const res = await fetch(`${apiBase}/api/notes/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(body)
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data?.detail || `HTTP ${res.status}`);
          setStatus('Thanks! Feedback sent.', false);
          try { if (typeof snack === 'function') snack('Feedback sent'); } catch { }
          $message.value = '';
          selectedText = '';
          if ($selPreview) $selPreview.textContent = '';
          selectedTags.clear();
          $tagsWrap?.querySelectorAll('button[data-tag]').forEach(b => setTagButtonState(b, false));
          selectedRating = null;
          $ratingWrap?.querySelectorAll('button[data-rating]').forEach(b => b.classList.remove('bg-[var(--brand-soft)]'));
          // Close modal after successful submit
          closeModal();
        } catch (e) {
          console.error(e);
          setStatus(e?.message || 'Failed to send', true);
        } finally {
          $submit.disabled = false;
          $submit.classList.remove('opacity-70');
        }
      }

      $submit?.addEventListener('click', submit);
    })();

    // Auto-load only when URL has ?topic=... to avoid duplicate generation loops.
    document.addEventListener('DOMContentLoaded', () => {
      if (!queryTopic) return;
      if ($topic) $topic.value = queryTopic;
      setTimeout(() => {
        startGeneration(queryTopic, false);
      }, 120);
    });
    // ===== Blink button handler =====
    (function () {
      const $blinkBtn = document.getElementById('blinkBtn');
      if (!$blinkBtn) return;

      let savedOutputHTML = null; // store original notes content

      function normalizeTopicKey(value) {
        return (value || '').trim().toLowerCase().replace(/\s+/g, ' ');
      }

      $blinkBtn.addEventListener('click', async () => {
        // Determine current topic
        const headingTopic = (document.querySelector('#output h1')?.textContent || '').trim();
        const inputTopic = ($topic ? $topic.value : '').trim();
        const topic = (headingTopic || inputTopic).trim();

        if (!topic) {
          snack('Generate notes first to view Blink');
          return;
        }

        // If already showing blink, restore notes
        if (savedOutputHTML !== null) {
          $output.innerHTML = savedOutputHTML;
          savedOutputHTML = null;
          $blinkBtn.querySelector('.st-btn-label').textContent = 'Blink';
          return;
        }

        // Show loading state
        $blinkBtn.querySelector('.st-btn-label').textContent = 'Loading…';

        try {
          const topicCandidates = Array.from(new Set([
            normalizeTopicKey(topic),
            normalizeTopicKey(inputTopic),
            normalizeTopicKey(headingTopic)
          ].filter(Boolean)));
          const topicsJsonParam = encodeURIComponent(JSON.stringify(topicCandidates));
          const token = getAuthToken();
          const headers = {};
          if (token) headers['Authorization'] = `Bearer ${token}`;

          const res = await fetch(`${apiBase}/api/blink/links?topics_json=${topicsJsonParam}`, { headers });
          if (!res.ok) throw new Error('Failed to fetch blink');

          const data = await res.json();
          const linksMapRaw = data.links || data || {};
          const linksMap = {};
          for (const [key, url] of Object.entries(linksMapRaw)) {
            const norm = normalizeTopicKey(key);
            if (!norm || !url) continue;
            linksMap[norm] = url;
          }

          // Find a matching blink link (case-insensitive key match)
          let blinkUrl = null;
          const topicLower = normalizeTopicKey(topic);
          for (const candidate of topicCandidates) {
            if (linksMap[candidate]) {
              blinkUrl = linksMap[candidate];
              break;
            }
          }

          for (const [key, url] of Object.entries(linksMap)) {
            if (blinkUrl || !url) continue;
            if (key === topicLower || topicLower.includes(key) || key.includes(topicLower)) {
              blinkUrl = url;
              break;
            }
          }

          // Fallback: if only one link returned, just use it
          if (!blinkUrl) {
            const vals = Object.values(linksMap).filter(Boolean);
            if (vals.length === 1) blinkUrl = vals[0];
          }

          if (!blinkUrl) {
            snack('No Blink image available for this topic');
            $blinkBtn.querySelector('.st-btn-label').textContent = 'Blink';
            return;
          }

          // Save current output and show blink image
          savedOutputHTML = $output.innerHTML;

          $output.innerHTML = `
            <div style="text-align:center; padding: 1rem 0;">
              <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1rem; flex-wrap:wrap; gap:0.5rem;">
                <h2 style="margin:0; font-size:1.25rem; font-weight:700;">Blink — ${topic}</h2>
                <button id="blinkBackBtn"
                  class="ripple inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold hover:bg-[var(--brand-soft)] transition"
                  style="border-color: var(--outline);">
                  <span class="material-symbols-rounded text-[16px]">arrow_back</span>
                  Back to Notes
                </button>
              </div>
              <img src="${blinkUrl}" alt="Blink — ${topic}"
                style="max-width:100%; border-radius:1rem; border:1px solid var(--outline); box-shadow: 0 8px 30px rgba(0,0,0,0.12);"
                onerror="this.parentElement.innerHTML='<p style=\\'color:var(--muted); padding:2rem;\\'>Failed to load Blink image.</p>'" />
            </div>`;

          $blinkBtn.querySelector('.st-btn-label').textContent = 'Back';

          // Wire back button
          const $backBtn = document.getElementById('blinkBackBtn');
          if ($backBtn) {
            $backBtn.addEventListener('click', () => {
              if (savedOutputHTML !== null) {
                $output.innerHTML = savedOutputHTML;
                savedOutputHTML = null;
                $blinkBtn.querySelector('.st-btn-label').textContent = 'Blink';
              }
            });
          }
        } catch (err) {
          console.error('[Blink]', err);
          snack('Could not load Blink image');
          $blinkBtn.querySelector('.st-btn-label').textContent = 'Blink';
        }
      });
    })();

    // ===== ClinQ button → inline MCQ =====
    (function () {
      const $clinqBtn = document.getElementById('clinqBtn');
      if ($clinqBtn) {
        $clinqBtn.addEventListener('click', () => {
          if (typeof openMCQ === 'function') openMCQ();
        });
      }
    })();
