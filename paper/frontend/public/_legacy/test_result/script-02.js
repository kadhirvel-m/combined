// Extracted from ui/test_result.html (inline <script> #2).
    const $ = (s, r = document) => r.querySelector(s);
    const params = new URLSearchParams(location.search);

    let API_BASE = '';
    async function resolveApi() {
      if (API_BASE) return API_BASE;
      const b = (window.__API_BASE || window.API_BASE || '').replace(/\/$/, '');
      if (b) { API_BASE = b; return b; }
      await new Promise(r => setTimeout(r, 60));
      return resolveApi();
    }

    function extractToken(raw) {
      if (!raw) return '';
      try {
        const obj = JSON.parse(raw);
        if (obj && typeof obj === 'object') {
          if (obj.access_token) return obj.access_token;
          if (obj.currentSession && obj.currentSession.access_token) return obj.currentSession.access_token;
          if (obj.data && obj.data.session && obj.data.session.access_token) return obj.data.session.access_token;
        }
      } catch (_) { }
      return raw;
    }

    function getToken() {
      const keys = ['px_token', 'teacherToken', 'userToken', 'sb-access-token', 'supabase.auth.token'];
      for (const k of keys) {
        try {
          const v = localStorage.getItem(k);
          if (v) return extractToken(v);
        } catch { }
      }
      return '';
    }

    function esc(v) {
      return String(v == null ? '' : v)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
    }

    function fmtMMSS(sec) {
      if (sec == null || !Number.isFinite(Number(sec))) return 'N/A';
      const s = Math.max(0, parseInt(sec, 10));
      const m = Math.floor(s / 60);
      const r = s % 60;
      return `${m}:${String(r).padStart(2, '0')}`;
    }

    function setError(msg) {
      const node = $('#error');
      node.textContent = msg || 'Unable to load report.';
      node.classList.remove('hidden');
    }

    function topicLabelFromArea(area) {
      if (!area || typeof area !== 'object') return 'Topic area';
      if (area.type === 'co' && area.label) return `Course outcome ${area.label}`;
      if (area.type === 'k_level' && area.label) return `Thinking skill ${area.label}`;
      return String(area.label || 'Topic area');
    }

    function statusText(pct) {
      const p = Number(pct || 0);
      if (p >= 80) return 'Great job! Keep this momentum going.';
      if (p >= 60) return 'Almost there. A quick revision can boost your score.';
      return 'Needs improvement. Start with weak topics and retake.';
    }

    function renderDonut(summary) {
      const total = Math.max(1, Number(summary.total_questions || 0));
      const c = Math.max(0, Number(summary.correct_count || 0));
      const w = Math.max(0, Number(summary.wrong_count || 0));
      const u = Math.max(0, Number(summary.unanswered_count || 0));
      const cp = (c / total) * 100;
      const wp = (w / total) * 100;
      const up = Math.max(0, 100 - cp - wp);
      const pct = Number(summary.percentage || 0);
      const grad = `conic-gradient(#22c55e 0 ${cp}%, #ef4444 ${cp}% ${cp + wp}%, #f59e0b ${cp + wp}% ${cp + wp + up}%)`;
      const donut = $('#donut');
      if (!donut) return;
      donut.style.background = grad;
      donut.innerHTML = `<div class="donut-center"><div class="text-3xl font-extrabold">${pct.toFixed(1)}%</div><div class="text-xs text-neutral-500 dark:text-white/65 mt-1">accuracy</div></div>`;
    }

    function renderSimpleAreas(containerId, rows, emptyText) {
      const wrap = $(containerId);
      if (!wrap) return;
      if (!rows || !rows.length) {
        wrap.innerHTML = `<div class="text-sm text-neutral-500 dark:text-white/60">${esc(emptyText)}</div>`;
        return;
      }
      wrap.innerHTML = rows.slice(0, 3).map(r => {
        return `<div class="rounded-xl ring-1 ring-black/10 dark:ring-white/12 p-3 text-sm">${esc(topicLabelFromArea(r))}</div>`;
      }).join('');
    }

    function renderDetailedAreas(containerId, rows, emptyText, isWeak) {
      const wrap = $(containerId);
      if (!wrap) return;
      if (!rows || !rows.length) {
        wrap.innerHTML = `<div class="text-sm text-neutral-500 dark:text-white/60">${esc(emptyText)}</div>`;
        return;
      }
      wrap.innerHTML = rows.map(r => {
        const miss = (r.missed_questions || []).length;
        return `
          <div class="rounded-xl ring-1 ring-black/10 dark:ring-white/12 p-3">
            <div class="flex items-center justify-between gap-2">
              <div class="font-semibold text-sm">${esc(topicLabelFromArea(r))}</div>
              <span class="pill">${esc(String(r.evidence || '').toUpperCase())}</span>
            </div>
            <div class="mt-1 text-xs text-neutral-600 dark:text-white/65">
              Accuracy ${Number(r.accuracy || 0).toFixed(2)}% across ${Number(r.total || 0)} questions${isWeak ? ` · Missed ${miss}` : ''}
            </div>
          </div>`;
      }).join('');
    }

    function renderBars(containerId, rows, labelKey) {
      const wrap = $(containerId);
      if (!wrap) return;
      if (!rows || !rows.length) {
        wrap.innerHTML = '<div class="text-sm text-neutral-500 dark:text-white/60">No mapped data available.</div>';
        return;
      }
      wrap.innerHTML = rows.map(r => {
        const label = r[labelKey] || 'Unmapped';
        const acc = Number(r.accuracy || 0);
        const total = Number(r.total || 0);
        return `
          <div class="rounded-xl ring-1 ring-black/10 dark:ring-white/12 p-3">
            <div class="flex items-center justify-between gap-2 text-sm">
              <div class="font-semibold">${esc(label)}</div>
              <div class="flex items-center gap-2">
                <span class="pill">${total} Q</span>
                <span class="font-semibold">${acc.toFixed(2)}%</span>
              </div>
            </div>
            <div class="bar-track mt-2"><div class="bar-fill" style="width:${Math.max(0, Math.min(acc, 100)).toFixed(2)}%"></div></div>
          </div>`;
      }).join('');
    }

    function renderSuggestionsDetailed(rows) {
      const wrap = $('#suggestionsDetailed');
      if (!wrap) return;
      if (!rows || !rows.length) {
        wrap.innerHTML = '<div class="text-sm text-neutral-500 dark:text-white/60">No major weak cluster detected. Continue mixed practice.</div>';
        return;
      }
      wrap.innerHTML = rows.map((s, i) => {
        const ev = s.evidence || {};
        const miss = Array.isArray(ev.missed_questions) ? ev.missed_questions : [];
        return `
          <div class="rounded-xl ring-1 ring-black/10 dark:ring-white/12 p-4">
            <div class="font-semibold text-sm">${i + 1}. ${esc(s.focus || 'Focus area')}</div>
            <p class="mt-1 text-sm text-neutral-700 dark:text-white/75">${esc(s.reason || '')}</p>
            <p class="mt-1 text-sm"><span class="font-semibold">Suggestion:</span> ${esc(s.action || '')}</p>
            <p class="mt-1 text-xs text-neutral-500 dark:text-white/60">Missed questions: ${miss.length ? esc(miss.join(', ')) : 'none'}.</p>
          </div>`;
      }).join('');
    }

    function renderQuestionReview(rows) {
      const wrap = $('#questionsSimple');
      if (!wrap) return;
      if (!rows || !rows.length) {
        wrap.innerHTML = '<div class="text-sm text-neutral-500 dark:text-white/60">Question review unavailable.</div>';
        return;
      }

      wrap.innerHTML = rows.map(q => {
        let cls = 'q-unanswered';
        let status = 'Unanswered';
        let mark = '⚪';
        if (q.is_correct) { cls = 'q-ok'; status = 'Correct'; mark = '✅'; }
        else if (q.is_answered) { cls = 'q-bad'; status = 'Wrong'; mark = '❌'; }

        const details = [
          q.co ? `<span class="pill">CO ${esc(q.co)}</span>` : '',
          q.k_level ? `<span class="pill">${esc(q.k_level)}</span>` : '',
          q.difficulty ? `<span class="pill">${esc(q.difficulty)}</span>` : ''
        ].filter(Boolean).join(' ');

        return `
          <article class="${cls} rounded-xl ring-1 ring-black/10 dark:ring-white/12 p-4">
            <div class="flex items-start justify-between gap-3">
              <div class="font-semibold text-sm">Q${Number(q.index || 0)}. ${esc(q.prompt || '')}</div>
              <span class="pill">${mark} ${status}</span>
            </div>
            <div class="mt-2 text-sm"><span class="text-neutral-500 dark:text-white/65">Your answer:</span> <span class="font-medium">${esc(q.selected_option || 'Not answered')}</span></div>
            <div class="mt-1 text-sm"><span class="text-neutral-500 dark:text-white/65">Correct answer:</span> <span class="font-medium">${esc(q.correct_option || 'N/A')}</span></div>
            <details class="mt-2">
              <summary class="text-xs cursor-pointer text-neutral-600 dark:text-white/65">Show details</summary>
              <div class="mt-2 flex flex-wrap items-center gap-1.5">${details || '<span class="pill">No extra metadata</span>'}</div>
            </details>
          </article>`;
      }).join('');
    }

    function buildWeakTopicQuery(analytics) {
      const t = (analytics?.topics_to_improve || []).find(x => x && x.prompt);
      if (t && t.prompt) return String(t.prompt).slice(0, 120);
      const w = (analytics?.weak_areas || [])[0];
      if (w && w.label) return topicLabelFromArea(w);
      return 'weak topics';
    }

    function switchView(mode) {
      const isDetailed = mode === 'detailed';
      $('#studentView')?.classList.toggle('hidden', isDetailed);
      $('#detailedView')?.classList.toggle('hidden', !isDetailed);
    }

    async function loadReport() {
      const testId = params.get('test_id') || params.get('id');
      const view = (params.get('view') || 'simple').toLowerCase();
      if (!testId) {
        setError('Missing test id.');
        return;
      }

      $('#backToTest').href = `./test_take.html?test_id=${encodeURIComponent(testId)}`;
      $('#btnRetake').href = `./test_take.html?test_id=${encodeURIComponent(testId)}`;
      $('#btnDetailed').href = `./test_result.html?test_id=${encodeURIComponent(testId)}&view=detailed`;
      $('#btnBackSimple').href = `./test_result.html?test_id=${encodeURIComponent(testId)}&view=simple`;

      const token = getToken();
      if (!token) {
        setError('Please sign in to view your report.');
        return;
      }

      try {
        const base = await resolveApi();
        const res = await fetch(`${base}/api/tests/${testId}/my-result`, { headers: { Authorization: 'Bearer ' + token } });
        if (res.status === 404) {
          setError('No submitted attempt found for this test.');
          return;
        }
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || `HTTP ${res.status}`);
        }

        const data = await res.json();
        const test = data.test || {};
        const attempt = data.attempt || {};
        const summary = data.summary || {};
        const analytics = data.analytics || {};

        const score = Number(attempt.score || 0);
        const maxScore = Number(test.max_score || 0);
        const acc = Number(summary.percentage || 0);

        $('#title').textContent = test.title || 'Your Test Result';
        $('#subtitle').textContent = test.description || `Result summary for ${test.title || 'this test'}`;

        $('#scoreText').textContent = `${score}/${maxScore}`;
        $('#accText').textContent = `${acc.toFixed(2)}%`;
        $('#timeText').textContent = fmtMMSS(attempt.elapsed_seconds);
        $('#statusMessage').textContent = statusText(acc);

        const rank = data.rank || summary.rank || null;
        if (rank != null && Number.isFinite(Number(rank))) {
          $('#rankText').textContent = String(rank);
          $('#rankPill').classList.remove('hidden');
        } else {
          $('#rankPill').classList.add('hidden');
        }

        renderDonut(summary);
        renderSimpleAreas('#strongSimple', analytics.strong_areas || [], 'Keep practicing to build stronger areas.');
        renderSimpleAreas('#weakSimple', analytics.weak_areas || [], 'No major weak area detected.');
        renderQuestionReview(analytics.question_breakdown || []);

        const weakTopic = buildWeakTopicQuery(analytics);
        $('#btnRevise').href = `./notes_generator.html?topic=${encodeURIComponent(weakTopic)}`;
        $('#btnBlink').href = `./syllabus_blink.html?topic=${encodeURIComponent(weakTopic)}`;

        // Detailed view renders the full analytics without removing existing logic.
        $('#evidencePolicy').textContent = analytics.evidence_policy || '';
        renderBars('#coBars', analytics.co_breakdown || [], 'co');
        renderBars('#kBars', analytics.k_level_breakdown || [], 'k_level');
        renderDetailedAreas('#strongDetailed', analytics.strong_areas || [], 'No strong area with high evidence yet.', false);
        renderDetailedAreas('#weakDetailed', analytics.weak_areas || [], 'No weak area with high evidence found.', true);
        renderSuggestionsDetailed(analytics.suggestions || []);

        switchView(view === 'detailed' ? 'detailed' : 'simple');
      } catch (e) {
        console.error(e);
        setError(e.message || 'Failed to load report.');
      }
    }

    $('#themeToggle')?.addEventListener('click', () => {
      const root = document.documentElement;
      const dark = root.classList.toggle('dark');
      localStorage.setItem('px_theme', dark ? 'dark' : 'light');
    });

    document.addEventListener('DOMContentLoaded', loadReport);
