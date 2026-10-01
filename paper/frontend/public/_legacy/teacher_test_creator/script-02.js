// Extracted from ui/teacher_test_creator.html (inline <script> #2).
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

    function escHtml(str) {
      return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    const themeBtn = $('#themeToggle');
    themeBtn?.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
      localStorage.setItem('px_theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    });

    function showLoader() { document.body.classList.remove('loaded'); }
    function hideLoader() { document.body.classList.add('loaded'); }

    function showAlert(msg) {
      const box = $('#alert');
      box.textContent = msg;
      box.classList.remove('hidden');
      setTimeout(() => box.classList.add('hidden'), 4500);
    }

    function formatApiErrorBody(err, status) {
      if (!err) return `Request failed (HTTP ${status})`;
      const detail = err.detail ?? err.error ?? err.message;
      if (typeof detail === 'string') return detail;
      if (Array.isArray(detail)) {
        // FastAPI/Pydantic 422 detail
        const parts = detail.slice(0, 3).map((d) => {
          const loc = Array.isArray(d?.loc) ? d.loc.join('.') : '';
          const msg = d?.msg || d?.message || 'Invalid input';
          return loc ? `${loc}: ${msg}` : String(msg);
        });
        return parts.join(' | ') || `Request failed (HTTP ${status})`;
      }
      try { return JSON.stringify(detail); } catch { return String(detail); }
    }

    function getToken() {
      const keys = ['px_token', 'teacherToken', 'userToken', 'sb-access-token', 'supabase.auth.token'];
      for (const k of keys) { try { const v = localStorage.getItem(k); if (v) return v; } catch { } }
      return '';
    }

    let API_BASE = '';
    async function resolveApi() {
      if (API_BASE) return API_BASE;
      const b = (window.__API_BASE || window.API_BASE || '').replace(/\/$/, '');
      if (b) {
        API_BASE = b;
        return b;
      }
      await new Promise(r => setTimeout(r, 60));
      return resolveApi();
    }

    function buildShareLink(testId) {
      const dest = new URL('test_take.html', window.location.href);
      dest.searchParams.set('test_id', testId);
      return dest.toString();
    }

    function parseScope() {
      try {
        const raw = sessionStorage.getItem('px:testCreatorScope');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.mode === 'open' || parsed.mode === 'class')) return parsed;
      } catch { }
      return null;
    }

    const state = {
      scope: null,
      questions: [],
      createdTestId: null,
      shareLink: null,
    };

    function audienceText() {
      if (!state.scope) return 'Audience not set';
      if (state.scope.mode === 'open') return 'Open to all';
      const c = state.scope.class || {};
      const subject = c.subject || 'Class';
      const meta = [c.section ? `Sec ${c.section}` : '', c.batch_range || '', c.semester ? `Sem ${c.semester}` : ''].filter(Boolean).join(' • ');
      return meta ? `${subject} — ${meta}` : subject;
    }

    function setAudienceUI() {
      $('#audienceLabel').textContent = audienceText();
    }

    function normalizeQuestion(q) {
      const prompt = String(q.prompt || '').trim();
      const options = Array.isArray(q.options) ? q.options.map(o => String(o || '').trim()) : [];
      while (options.length < 4) options.push('');
      const correct_index = Number.isFinite(q.correct_index) ? q.correct_index : 0;
      const rawDifficulty = String(q.difficulty || '').trim().toLowerCase();
      const difficulty = rawDifficulty ? (rawDifficulty.startsWith('e') ? 'Easy' : rawDifficulty.startsWith('h') ? 'Hard' : 'Medium') : null;
      const rawCo = String(q.co || q.course_outcome || '').trim();
      const coCompact = rawCo.replace(/\s+/g, '');
      const co = coCompact && /^co\d{1,2}$/i.test(coCompact) ? coCompact.toUpperCase() : (rawCo || null);
      const rawK = String(q.k_level || q.klevel || q.bloom_level || '').trim().toUpperCase();
      const kMatch = rawK.match(/([1-6])/);
      const k_level = kMatch ? `K${kMatch[1]}` : null;
      const topic_name = String(q.topic_name || q.topic || '').trim() || null;
      return {
        prompt,
        options: options.slice(0, 4),
        correct_index: Math.max(0, Math.min(3, correct_index)),
        points: Number.isFinite(q.points) ? q.points : 1,
        difficulty,
        co,
        k_level,
        topic_name,
      };
    }

    function updateQCount() {
      const n = state.questions.length;
      $('#qCount').textContent = `${n} question${n === 1 ? '' : 's'}`;
    }

    function renderQuestions() {
      const wrap = $('#questionsWrap');
      if (!wrap) return;
      updateQCount();

      if (!state.questions.length) {
        wrap.innerHTML = `
          <div class="p-4 rounded-2xl ring-1 ring-black/5 dark:ring-white/10 bg-white/70 dark:bg-white/5">
            <div class="text-sm font-semibold">No questions yet</div>
            <div class="text-xs text-neutral-500 dark:text-white/60 mt-1">Use “Generate with AI”, “Add question”, or the + button between questions.</div>
          </div>`;
        return;
      }

      wrap.innerHTML = state.questions.map((q, qi) => {
        const safePrompt = escHtml(q.prompt || '');
        const chips = [
          q.topic_name ? `<span class="chip inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-white/80 dark:bg-white/10">Topic: ${escHtml(q.topic_name)}</span>` : '',
          q.co ? `<span class="chip inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-white/80 dark:bg-white/10">CO: ${escHtml(q.co)}</span>` : '',
          q.k_level ? `<span class="chip inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-white/80 dark:bg-white/10">K-level: ${escHtml(q.k_level)}</span>` : '',
          q.difficulty ? `<span class="chip inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-white/80 dark:bg-white/10">Difficulty: ${escHtml(q.difficulty)}</span>` : '',
        ].filter(Boolean).join('');
        return `
          <div class="p-4 rounded-2xl ring-1 ring-black/5 dark:ring-white/10 bg-white/70 dark:bg-white/5">
            <div class="flex items-center justify-between gap-2">
              <div class="text-xs text-neutral-500 dark:text-white/60">Question ${qi + 1}</div>
              <div class="flex items-center gap-1">
                <button type="button" data-ins="${qi}" title="Insert question after" aria-label="Insert question after"
                  class="inline-flex items-center justify-center size-8 rounded-xl ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/10">
                  <span class="material-symbols-rounded text-base">add</span>
                </button>
                <button type="button" data-del="${qi}" title="Remove question" aria-label="Remove question"
                  class="inline-flex items-center justify-center size-8 rounded-xl ring-1 ring-black/10 dark:ring-white/15 text-red-700 dark:text-red-300 hover:bg-black/5 dark:hover:bg-white/10">
                  <span class="material-symbols-rounded text-base">delete</span>
                </button>
              </div>
            </div>

            ${chips ? `<div class="mt-2 flex flex-wrap items-center gap-1.5">${chips}</div>` : ''}

            <label class="block mt-2 text-sm space-y-1">
              <span class="text-xs uppercase tracking-wide text-neutral-500 dark:text-white/60">Prompt</span>
              <textarea data-qprompt="${qi}" rows="2"
                class="w-full px-3 py-2 rounded-xl bg-white/85 dark:bg-white/10 ring-1 ring-black/5 dark:ring-white/15 focus:outline-none focus:ring-brand-500"
                placeholder="Enter the question">${safePrompt}</textarea>
            </label>

            <div class="mt-3 grid gap-2 md:grid-cols-2">
              ${[0, 1, 2, 3].map(oi => {
          const safeOpt = escHtml(q.options?.[oi] || '');
          const checked = q.correct_index === oi ? 'checked' : '';
          const letter = String.fromCharCode(65 + oi);
          return `
                <div class="flex items-center gap-2">
                  <input type="radio" name="correct_${qi}" data-qcorrect="${qi}" value="${oi}" class="size-4" ${checked} />
                  <div class="flex-1 min-w-0">
                    <div class="text-[10px] text-neutral-500 dark:text-white/60">Option ${letter}</div>
                    <input data-qopt="${qi}" data-opt="${oi}" type="text"
                      class="w-full mt-1 px-3 py-2 rounded-xl bg-white/85 dark:bg-white/10 ring-1 ring-black/5 dark:ring-white/15 focus:outline-none focus:ring-brand-500"
                      placeholder="Option ${letter}" value="${safeOpt}" />
                  </div>
                </div>`;
        }).join('')}
            </div>
          </div>`;
      }).join('');
    }

    function validateBeforeCreate() {
      if (!state.questions.length) return 'Add at least one question.';

      for (let i = 0; i < state.questions.length; i++) {
        const q = normalizeQuestion(state.questions[i]);
        if (!q.prompt) return `Question ${i + 1}: prompt is empty.`;
        const filled = q.options.map(o => (o || '').trim()).filter(Boolean);
        if (filled.length < 2) return `Question ${i + 1}: add at least two options.`;
        if (!Number.isFinite(q.correct_index) || q.correct_index < 0 || q.correct_index > 3) return `Question ${i + 1}: select a correct option.`;
        if (!(q.options[q.correct_index] || '').trim()) return `Question ${i + 1}: correct option text is empty.`;
      }

      return null;
    }

    function deriveTitle() {
      const fromInput = ($('#testTitle')?.value || '').trim();
      if (fromInput) return fromInput.slice(0, 200);
      const firstPrompt = (state.questions?.[0]?.prompt || '').trim();
      if (firstPrompt) return firstPrompt.slice(0, 80);
      return 'Untitled Test';
    }

    async function ensureCreatedTest() {
      if (state.createdTestId) return state.createdTestId;

      const token = getToken();
      if (!token) throw new Error('Please sign in as teacher.');

      const err = validateBeforeCreate();
      if (err) throw new Error(err);

      const title = deriveTitle();
      const description = '';
      const durationVal = parseInt($('#durationMin').value || '0', 10);
      const duration_seconds = durationVal > 0 ? durationVal * 60 : null;

      const class_id = state.scope?.mode === 'class' ? (state.scope.class?.id || null) : null;

      const payload = {
        title,
        description,
        duration_seconds,
        class_id,
        questions: state.questions.map((q, idx) => {
          const nq = normalizeQuestion(q);
          return {
            ...nq,
            order: idx,
            difficulty: nq.difficulty || null,
            co: nq.co || null,
            k_level: nq.k_level || null,
            topic_name: nq.topic_name || null,
          };
        })
      };

      showLoader();
      try {
        const base = await resolveApi();
        const res = await fetch(`${base}/api/teacher/tests`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || data.error || `Failed to create test (HTTP ${res.status})`);
        }
        const data = await res.json();
        state.createdTestId = data.id;
        state.shareLink = buildShareLink(data.id);
        return state.createdTestId;
      } finally {
        hideLoader();
      }
    }

    function openShareModal() {
      $('#shareModal').classList.remove('hidden');
    }

    function closeShareModal() {
      $('#shareModal').classList.add('hidden');
    }

    async function shareFlow() {
      try {
        await ensureCreatedTest();
        $('#shareLink').value = state.shareLink || '';
        $('#copyLink').disabled = !state.shareLink;
        $('#shareStatus').textContent = state.scope?.mode === 'class'
          ? 'This link works only for students enrolled in the selected class.'
          : 'This link works for any signed-in user.';
        openShareModal();
      } catch (e) {
        showAlert(e?.message || 'Could not create/share test.');
      }
    }

    // AI modal
    const aiState = {
      mode: 'academic',
      courseId: null,
      course: null,
      selected: new Set(),
      unitTopicKeys: [],
      topicIndex: new Map(),
      loadedOnce: false,
    };

    function setAiMode(mode) {
      aiState.mode = mode === 'academic' ? 'academic' : 'topic';
      const isAcademic = aiState.mode === 'academic';

      const card = $('#aiBuildCard');
      if (card) card.classList.toggle('aiAcademic', isAcademic);

      const btnTopic = $('#aiModeTopic');
      const btnAcad = $('#aiModeAcademic');
      const topicWrap = $('#aiTopicWrap');
      const acadWrap = $('#aiAcademicWrap');

      if (topicWrap) topicWrap.classList.toggle('hidden', isAcademic);
      if (acadWrap) acadWrap.classList.toggle('hidden', !isAcademic);

      if (btnTopic) {
        btnTopic.className = isAcademic
          ? 'flex-1 px-3 py-2 rounded-xl text-sm font-semibold bg-white/70 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 hover:bg-white/90 dark:hover:bg-white/20'
          : 'flex-1 px-3 py-2 rounded-xl text-sm font-semibold bg-brand-500/10 text-brand-700 dark:text-fuchsia-100 ring-1 ring-brand-500/30 hover:bg-brand-500/20';
      }
      if (btnAcad) {
        btnAcad.className = isAcademic
          ? 'flex-1 px-3 py-2 rounded-xl text-sm font-semibold bg-brand-500/10 text-brand-700 dark:text-fuchsia-100 ring-1 ring-brand-500/30 hover:bg-brand-500/20'
          : 'flex-1 px-3 py-2 rounded-xl text-sm font-semibold bg-white/70 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/15 hover:bg-white/90 dark:hover:bg-white/20';
      }

      if (isAcademic) {
        loadAcademicSyllabus({ silent: true });
      } else {
        setTimeout(() => $('#aiTopic')?.focus(), 0);
      }
    }

    function getAcademicCourseId() {
      if (!state.scope) return '';
      if (state.scope.mode !== 'class') return '';
      const c = state.scope.class || {};
      return String(c.subject_id || '').trim();
    }

    function setAcademicStatus(msg, isError = false) {
      const node = $('#aiAcademicStatus');
      if (!node) return;
      node.textContent = msg;
      node.className = 'text-xs mt-2 ' + (isError ? 'text-red-600 dark:text-red-400' : 'text-neutral-500 dark:text-white/60');
    }

    function updateAcademicCount() {
      const n = aiState.selected.size;
      const node = $('#aiAcademicCount');
      if (node) node.textContent = `${n} selected`;
    }

    function syncUnitCheckboxes() {
      const list = $('#aiAcademicList');
      if (!list) return;
      $$('#aiAcademicList input[data-unit-index]').forEach((cb) => {
        const idx = parseInt(cb.getAttribute('data-unit-index'), 10);
        if (!Number.isFinite(idx)) return;
        const keys = aiState.unitTopicKeys[idx] || [];
        const total = keys.length;
        const selected = keys.filter(k => aiState.selected.has(k)).length;
        cb.indeterminate = selected > 0 && selected < total;
        cb.checked = total > 0 && selected === total;
      });
    }

    function renderAcademicCourse(course) {
      aiState.course = course || null;
      aiState.topicIndex = new Map();
      aiState.unitTopicKeys = [];

      const meta = [];
      const code = (course?.course_code || '').toString().trim();
      const title = (course?.title || '').toString().trim();
      if (code) meta.push(code.toUpperCase());
      if (title) meta.push(title);
      if (course?.semester) meta.push(`Sem ${course.semester}`);
      $('#aiAcademicMeta').textContent = meta.filter(Boolean).join(' • ') || 'Syllabus';

      const list = $('#aiAcademicList');
      if (!list) return;
      const units = Array.isArray(course?.units) ? course.units : [];

      if (!units.length) {
        list.innerHTML = '';
        setAcademicStatus('No units found for this subject.', true);
        updateAcademicCount();
        return;
      }

      list.innerHTML = units.map((u, ui) => {
        const unitTitle = (u?.title || u?.unit_title || `Unit ${ui + 1}`).toString();
        const topics = Array.isArray(u?.topics) ? u.topics : [];
        const unitKeys = topics.map((t, ti) => String(t?.id || t?.topic_id || `${ui}:${ti}`));
        aiState.unitTopicKeys[ui] = unitKeys;
        topics.forEach((t, ti) => {
          const key = unitKeys[ti];
          const topicTitle = (t?.title || t?.topic_title || t?.topic || `Topic ${ti + 1}`).toString();
          const parsedUnitMatch = String(unitTitle).match(/\bunit\s*([1-9]\d*)\b/i);
          const parsedUnitNo = parsedUnitMatch ? Number(parsedUnitMatch[1]) : null;
          const inferredByOrder = ui + 1;
          const boundedUnitNo = Number.isFinite(parsedUnitNo)
            ? Math.max(1, Math.min(5, parsedUnitNo))
            : Math.max(1, Math.min(5, inferredByOrder));
          aiState.topicIndex.set(key, { unitTitle, topicTitle, unitNo: boundedUnitNo });
        });

        const topicsHtml = topics.map((t, ti) => {
          const key = unitKeys[ti];
          const topicTitle = (t?.title || t?.topic_title || t?.topic || `Topic ${ti + 1}`).toString();
          const checked = aiState.selected.has(key) ? 'checked' : '';
          return `
            <label class="flex items-start gap-2 py-1.5">
              <input type="checkbox" class="mt-0.5 size-4" data-topic-key="${escHtml(key)}" ${checked} />
              <span class="text-sm leading-snug">${escHtml(topicTitle)}</span>
            </label>`;
        }).join('');

        return `
          <div class="rounded-2xl ring-1 ring-black/5 dark:ring-white/10 bg-white/70 dark:bg-white/5 overflow-hidden" data-unit-wrap="${ui}">
            <div class="px-3 py-2 flex items-center justify-between gap-2 bg-black/5 dark:bg-white/5">
              <div class="flex items-center gap-2 min-w-0">
                <input type="checkbox" class="size-4" data-unit-index="${ui}" />
                <button type="button" class="min-w-0 flex items-center gap-1 text-left" data-unit-toggle="${ui}" title="Show topics">
                  <span class="text-sm font-semibold truncate">${escHtml(unitTitle)}</span>
                  <span class="material-symbols-rounded text-base text-neutral-500 dark:text-white/60 aiUnitArrow" data-unit-arrow="${ui}">expand_more</span>
                </button>
              </div>
              <div class="text-[11px] text-neutral-500 dark:text-white/60 shrink-0">${topics.length} topic${topics.length === 1 ? '' : 's'}</div>
            </div>
            <div class="px-3 pb-3 hidden" id="aiUnitTopics_${ui}">
              <div class="max-h-56 overflow-auto pr-1">
                ${topicsHtml || '<div class="text-xs text-neutral-500 dark:text-white/60 py-2">No topics</div>'}
              </div>
            </div>
          </div>`;
      }).join('');

      setAcademicStatus('Select units/topics to generate questions.');
      updateAcademicCount();
      syncUnitCheckboxes();
    }

    async function loadAcademicSyllabus({ silent = false } = {}) {
      const list = $('#aiAcademicList');
      const courseId = getAcademicCourseId();

      if (!courseId) {
        aiState.courseId = null;
        aiState.course = null;
        if (list) list.innerHTML = '';
        $('#aiAcademicMeta').textContent = '—';
        setAcademicStatus(state.scope?.mode === 'open'
          ? 'Academic test needs a selected class subject. Use “Quick topic” for Open to all.'
          : 'Missing subject id for this class.');
        updateAcademicCount();
        return;
      }

      if (aiState.courseId !== courseId) {
        aiState.courseId = courseId;
        aiState.selected = new Set();
      }

      if (!silent) {
        setAcademicStatus('Loading syllabus…');
      }
      if (list && !aiState.loadedOnce) {
        list.innerHTML = `
          <div class="rounded-2xl ring-1 ring-black/5 dark:ring-white/10 bg-white/70 dark:bg-white/5 p-3">
            <div class="skeleton h-4 rounded w-2/3"></div>
            <div class="skeleton h-3 rounded w-full mt-2"></div>
            <div class="skeleton h-3 rounded w-5/6 mt-2"></div>
          </div>`;
      }

      try {
        const base = await resolveApi();
        const token = getToken();
        const headers = token ? { Authorization: 'Bearer ' + token } : {};
        const res = await fetch(`${base}/api/syllabus/courses/${encodeURIComponent(courseId)}`, { headers });
        if (!res.ok) throw new Error(`Failed to load syllabus (HTTP ${res.status})`);
        const data = await res.json();
        aiState.loadedOnce = true;
        renderAcademicCourse(data);
      } catch (e) {
        if (list) list.innerHTML = '';
        setAcademicStatus(e?.message || 'Unable to load syllabus.', true);
        updateAcademicCount();
      }
    }

    function getAcademicTopicPrompt() {
      const selectedItems = [];
      aiState.topicIndex.forEach((info, key) => {
        if (!aiState.selected.has(key)) return;
        selectedItems.push(info);
      });

      if (!selectedItems.length) return '';

      const code = (aiState.course?.course_code || '').toString().trim();
      const title = (aiState.course?.title || '').toString().trim();
      const subjectLine = [code ? code.toUpperCase() : '', title].filter(Boolean).join(' — ') || 'the syllabus';

      const lines = selectedItems.map(i => `- ${i.unitTitle}: ${i.topicTitle}`);
      return `Create an academic MCQ test strictly from the syllabus for ${subjectLine}. Focus on these unit/topics:\n${lines.join('\n')}\nReturn only MCQ JSON.`;
    }

    function getAcademicSelectedTopics() {
      const selectedItems = [];
      aiState.topicIndex.forEach((info, key) => {
        if (!aiState.selected.has(key)) return;
        const topicTitle = String(info?.topicTitle || '').trim();
        if (topicTitle) selectedItems.push(topicTitle);
      });
      const out = [];
      const seen = new Set();
      selectedItems.forEach((t) => {
        const k = t.toLowerCase();
        if (seen.has(k)) return;
        seen.add(k);
        out.push(t);
      });
      return out;
    }

    function getAcademicTopicUnitMap() {
      const out = {};
      aiState.topicIndex.forEach((info, key) => {
        if (!aiState.selected.has(key)) return;
        const topicTitle = String(info?.topicTitle || '').trim();
        const unitNo = Number(info?.unitNo || 0);
        if (!topicTitle || !Number.isFinite(unitNo) || unitNo < 1) return;
        const bounded = Math.max(1, Math.min(5, unitNo));
        out[topicTitle] = bounded;
      });
      return out;
    }

    function getAcademicSelectedUnitNumbers() {
      const out = [];
      const seen = new Set();
      aiState.topicIndex.forEach((info, key) => {
        if (!aiState.selected.has(key)) return;
        const n = Number(info?.unitNo || 0);
        if (!Number.isFinite(n) || n < 1) return;
        const bounded = Math.max(1, Math.min(5, n));
        if (seen.has(bounded)) return;
        seen.add(bounded);
        out.push(bounded);
      });
      return out.sort((a, b) => a - b);
    }

    function clearAcademicSelection() {
      aiState.selected = new Set();
      $$('#aiAcademicList input[data-topic-key]').forEach((cb) => { cb.checked = false; });
      syncUnitCheckboxes();
      updateAcademicCount();
    }

    function handleAcademicListChange(ev) {
      const el = ev.target;
      if (!(el instanceof HTMLInputElement)) return;
      if (el.matches('input[data-topic-key]')) {
        const key = String(el.getAttribute('data-topic-key') || '');
        if (!key) return;
        if (el.checked) aiState.selected.add(key);
        else aiState.selected.delete(key);
        syncUnitCheckboxes();
        updateAcademicCount();
        return;
      }
      if (el.matches('input[data-unit-index]')) {
        const idx = parseInt(el.getAttribute('data-unit-index'), 10);
        if (!Number.isFinite(idx)) return;
        const keys = aiState.unitTopicKeys[idx] || [];
        const wrap = el.closest('[data-unit-wrap]');
        const checked = !!el.checked;
        keys.forEach((k) => { if (checked) aiState.selected.add(k); else aiState.selected.delete(k); });
        if (wrap) {
          $$('input[data-topic-key]', wrap).forEach((cb) => { cb.checked = checked; });
        }
        syncUnitCheckboxes();
        updateAcademicCount();
      }
    }

    function handleAcademicListClick(ev) {
      const btn = ev.target instanceof Element ? ev.target.closest('button[data-unit-toggle]') : null;
      if (!btn) return;
      const idx = parseInt(btn.getAttribute('data-unit-toggle') || '', 10);
      if (!Number.isFinite(idx)) return;
      const panel = document.getElementById(`aiUnitTopics_${idx}`);
      if (!panel) return;
      panel.classList.toggle('hidden');
      const arrow = btn.querySelector('[data-unit-arrow]');
      arrow?.classList.toggle('open', !panel.classList.contains('hidden'));
    }

    function openAIModal() {
      $('#aiErr').textContent = '';
      $('#aiBuildModal').classList.remove('hidden');
      setAiMode(aiState.mode);
    }

    function closeAIModal() {
      $('#aiBuildModal').classList.add('hidden');
    }

    async function generateWithAI() {
      const topic = aiState.mode === 'academic'
        ? (getAcademicTopicPrompt() || '').trim()
        : (($('#aiTopic').value || '').trim());
      const selected_topics = aiState.mode === 'academic' ? getAcademicSelectedTopics() : [];
      const selected_topic_units = aiState.mode === 'academic' ? getAcademicTopicUnitMap() : {};
      const selected_unit_numbers = aiState.mode === 'academic' ? getAcademicSelectedUnitNumbers() : [];
      const count = parseInt($('#aiCount').value || '10', 10);
      const difficulty = String($('#aiDifficulty')?.value || 'balanced').trim().toLowerCase();
      const replaceExisting = !!$('#aiReplace').checked;

      if (!topic || topic.length < 3) {
        $('#aiErr').textContent = aiState.mode === 'academic'
          ? 'Select at least one unit/topic.'
          : 'Enter a valid topic (min 3 chars).';
        return;
      }
      if (!Number.isFinite(count) || count < 1 || count > 30) { $('#aiErr').textContent = 'No. of questions must be between 1 and 30.'; return; }

      const token = getToken();
      if (!token) { $('#aiErr').textContent = 'Please sign in as teacher.'; return; }

      if (state.questions.length && replaceExisting) {
        const ok = confirm('Replace existing questions with AI generated ones?');
        if (!ok) return;
      }

      $('#aiErr').textContent = '';
      const btn = $('#aiGenerate');
      btn.disabled = true;
      btn.textContent = 'Generating…';
      showLoader();

      try {
        const base = await resolveApi();
        const res = await fetch(`${base}/api/teacher/tests/ai`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
          body: JSON.stringify({ topic, count, difficulty, selected_topics, selected_topic_units, selected_unit_numbers }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(formatApiErrorBody(err, res.status));
        }
        const data = await res.json();
        const out = Array.isArray(data.questions) ? data.questions : [];
        if (!out.length) throw new Error('AI returned no questions.');

        const mapped = out.map(q => normalizeQuestion({
          prompt: q.prompt || q.question || '',
          options: q.options,
          correct_index: q.correct_index,
          points: 1,
          difficulty: q.difficulty,
          co: q.co,
          k_level: q.k_level,
          topic_name: q.topic_name || q.topic,
        })).filter(q => (q.prompt || '').trim());

        if (!mapped.length) throw new Error('AI output could not be normalized.');

        state.questions = replaceExisting ? mapped : state.questions.concat(mapped);

        if (!($('#testTitle').value || '').trim()) {
          const defaultTitle = aiState.mode === 'academic'
            ? (`Academic Test — ${(aiState.course?.course_code || aiState.course?.title || 'Syllabus').toString().trim()}`)
            : (data.title || `${topic} MCQ`);
          $('#testTitle').value = defaultTitle.toString().slice(0, 200);
        }

        renderQuestions();
        closeAIModal();
      } catch (e) {
        $('#aiErr').textContent = e?.message || 'AI generation failed.';
      } finally {
        hideLoader();
        btn.disabled = false;
        btn.textContent = 'Generate';
      }
    }

    // Wire UI
    $('#changeAudience').addEventListener('click', () => {
      try { sessionStorage.removeItem('px:testCreatorScope'); } catch { }
      location.href = './teacher_test_builder.html';
    });

    function insertEmptyQuestion(atIndex) {
      const idx = Math.max(0, Math.min(state.questions.length, atIndex));
      state.questions.splice(idx, 0, {
        prompt: '',
        options: ['', '', '', ''],
        correct_index: 0,
        points: 1,
        difficulty: null,
        co: null,
        k_level: null,
      });
      renderQuestions();
      setTimeout(() => {
        const ta = document.querySelector(`textarea[data-qprompt="${idx}"]`);
        ta?.focus();
      }, 0);
    }

    $('#addEmpty').addEventListener('click', () => insertEmptyQuestion(state.questions.length));

    $('#clearAll').addEventListener('click', () => {
      if (!state.questions.length) return;
      const ok = confirm('Clear all questions?');
      if (!ok) return;
      state.questions = [];
      renderQuestions();
    });

    $('#aiOpen').addEventListener('click', openAIModal);
    $('#aiCancel').addEventListener('click', closeAIModal);
    $('#aiBuildModal').addEventListener('click', (ev) => { if (ev.target === $('#aiBuildModal')) closeAIModal(); });
    $('#aiGenerate').addEventListener('click', generateWithAI);

    $('#aiModeTopic')?.addEventListener('click', () => setAiMode('topic'));
    $('#aiModeAcademic')?.addEventListener('click', () => setAiMode('academic'));
    $('#aiAcademicReload')?.addEventListener('click', () => loadAcademicSyllabus({ silent: false }));
    $('#aiAcademicClear')?.addEventListener('click', clearAcademicSelection);
    $('#aiAcademicList')?.addEventListener('change', handleAcademicListChange);
    $('#aiAcademicList')?.addEventListener('click', handleAcademicListClick);

    $('#shareTop')?.addEventListener('click', shareFlow);
    $('#shareBottom')?.addEventListener('click', shareFlow);
    $('#createAndShare')?.addEventListener('click', shareFlow);

    $('#shareClose').addEventListener('click', closeShareModal);
    $('#shareModal').addEventListener('click', (ev) => { if (ev.target === $('#shareModal')) closeShareModal(); });

    $('#copyLink').addEventListener('click', async () => {
      const link = ($('#shareLink').value || '').trim();
      if (!link) return;
      try {
        await navigator.clipboard.writeText(link);
        $('#shareStatus').textContent = 'Link copied.';
      } catch {
        $('#shareStatus').textContent = 'Copy failed. Select and copy manually.';
      }
    });

    // Init
    document.addEventListener('DOMContentLoaded', () => {
      state.scope = parseScope();
      if (!state.scope) {
        location.replace('./teacher_test_builder.html');
        return;
      }
      setAudienceUI();

      const wrap = $('#questionsWrap');
      if (wrap) {
        wrap.addEventListener('click', (ev) => {
          const delBtn = ev.target instanceof Element ? ev.target.closest('button[data-del]') : null;
          if (delBtn) {
            const i = parseInt(delBtn.getAttribute('data-del'), 10);
            if (!Number.isFinite(i)) return;
            state.questions.splice(i, 1);
            renderQuestions();
            return;
          }

          const insBtn = ev.target instanceof Element ? ev.target.closest('button[data-ins]') : null;
          if (insBtn) {
            const i = parseInt(insBtn.getAttribute('data-ins'), 10);
            if (!Number.isFinite(i)) return;
            insertEmptyQuestion(i + 1);
          }
        });

        wrap.addEventListener('input', (ev) => {
          const t = ev.target;
          if (!(t instanceof HTMLElement)) return;

          if (t.matches('textarea[data-qprompt]')) {
            const qi = parseInt(t.getAttribute('data-qprompt'), 10);
            if (!Number.isFinite(qi) || !state.questions[qi]) return;
            state.questions[qi].prompt = t.value;
            return;
          }

          if (t.matches('input[data-qopt]')) {
            const qi = parseInt(t.getAttribute('data-qopt'), 10);
            const oi = parseInt(t.getAttribute('data-opt'), 10);
            if (!Number.isFinite(qi) || !Number.isFinite(oi) || !state.questions[qi]) return;
            state.questions[qi].options[oi] = t.value;
          }
        });

        wrap.addEventListener('change', (ev) => {
          const t = ev.target;
          if (!(t instanceof HTMLInputElement)) return;
          if (!t.matches('input[data-qcorrect]')) return;
          const qi = parseInt(t.getAttribute('data-qcorrect'), 10);
          const oi = parseInt(t.value, 10);
          if (!Number.isFinite(qi) || !Number.isFinite(oi) || !state.questions[qi]) return;
          state.questions[qi].correct_index = oi;
        });
      }

      renderQuestions();
    });
