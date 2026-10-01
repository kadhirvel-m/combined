// Extracted from ui/math_td.html (inline <script> #1).
    const API = {
      config: '/api/math-td/config',
      newSession: '/api/math-td/session/new',
      session: (id) => `/api/math-td/session/${id}`,
      question: '/api/math-td/question/generate',
      answer: '/api/math-td/question/answer',
      deploy: '/api/math-td/deploy',
      tick: '/api/math-td/tick'
    };

    const DECK_ORDER = ['swordsman', 'knight', 'archer', 'mage'];
    const UNIT_ICONS = { swordsman: '⚔️', knight: '🛡️', archer: '🏹', mage: '✨' };

    const state = {
      config: null,
      session: null,
      question: null,
      selectedAnswer: null,
      floatTexts: []
    };

    const battlefield = document.getElementById('battlefield');
    const ctx = battlefield.getContext('2d');

    async function api(method, url, body) {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.detail || 'Request failed');
      return json;
    }

    function setStatus(text, kind = '') {
      const el = document.getElementById('answerStatus');
      el.className = `status ${kind}`.trim();
      el.textContent = text;
    }

    function renderDeck() {
      const deck = document.getElementById('deck');
      deck.innerHTML = '';
      const units = state.config.units;
      const elixir = state.session.elixir || 0;

      DECK_ORDER.forEach((unitType) => {
        const cfg = units[unitType];
        const cost = cfg.cost;
        const canAfford = elixir >= cost;
        const btn = document.createElement('button');
        btn.className = `card ${canAfford ? '' : 'disabled'}`.trim();
        btn.disabled = !canAfford || state.session.status !== 'active';
        btn.innerHTML = `
          <span class="icon">${UNIT_ICONS[unitType] || '•'}</span>
          <div class="name">${cfg.name}</div>
          <div class="cost">${cost} Elixir</div>
        `;
        btn.addEventListener('click', async () => {
          try {
            const out = await api('POST', API.deploy, {
              session_id: state.session.id,
              unit_type: unitType
            });
            state.session = out.session;
            updateHud();
          } catch (err) {
            setStatus(err.message, 'bad');
          }
        });
        deck.appendChild(btn);
      });
    }

    function renderQuestion() {
      const q = state.question;
      const qText = document.getElementById('questionText');
      const answers = document.getElementById('answers');
      answers.innerHTML = '';
      state.selectedAnswer = null;

      if (!q) {
        qText.textContent = 'Press Generate Elixir to fetch a new question.';
        return;
      }

      qText.textContent = q.text;
      q.options.forEach((value) => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = value;
        btn.addEventListener('click', () => {
          state.selectedAnswer = Number(value);
          [...answers.children].forEach(el => el.classList.remove('selected'));
          btn.classList.add('selected');
        });
        answers.appendChild(btn);
      });
    }

    function updateHud() {
      if (!state.session) return;
      document.getElementById('playerName').textContent = state.session.player.name;
      document.getElementById('enemyName').textContent = state.session.enemy.name;
      document.getElementById('playerHp').textContent = state.session.player.castle_hp;
      document.getElementById('enemyHp').textContent = state.session.enemy.castle_hp;
      document.getElementById('timer').textContent = `Time: ${state.session.game_time.toFixed(1)}s`;
      document.getElementById('unitCount').textContent = `Units: ${state.session.state.units.length}`;

      const elixir = Number(state.session.elixir || 0);
      document.getElementById('elixirValue').textContent = elixir.toFixed(1);
      document.getElementById('elixirFill').style.width = `${Math.max(0, Math.min(100, (elixir / 10) * 100))}%`;

      renderDeck();

      if (state.session.status !== 'active') {
        const overlay = document.getElementById('resultOverlay');
        const title = document.getElementById('resultTitle');
        const text = document.getElementById('resultText');
        overlay.classList.add('show');
        title.textContent = state.session.status === 'victory' ? 'Victory' : 'Defeat';
        text.textContent = state.session.status === 'victory'
          ? 'Enemy castle destroyed. Great work!'
          : 'Your castle has fallen. Try again!';
      }
    }

    function addFloatingText(x, y, value, color = '#dc2626') {
      state.floatTexts.push({ x, y, value, color, ttl: 0.9 });
    }

    function yToCanvas(y) {
      return (y / 100) * battlefield.height;
    }

    function drawArena() {
      const w = battlefield.width;
      const h = battlefield.height;

      ctx.clearRect(0, 0, w, h);

      ctx.fillStyle = '#78d16b';
      ctx.fillRect(0, 0, w, h);

      const riverY = h / 2 - 32;
      ctx.fillStyle = '#5db7ff';
      ctx.fillRect(0, riverY, w, 64);

      ctx.fillStyle = '#8b5a2b';
      ctx.fillRect(w / 2 - 48, riverY + 10, 96, 44);

      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w / 2, h);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.fillRect(w / 2 - 80, 0, 160, 42);
      ctx.fillRect(w / 2 - 80, h - 42, 160, 42);

      ctx.fillStyle = 'white';
      ctx.font = '14px Arial';
      ctx.fillText('Enemy Castle', w / 2 - 45, 25);
      ctx.fillText('Player Castle', w / 2 - 45, h - 15);
    }

    function drawUnits() {
      const units = state.session?.state?.units || [];
      for (const unit of units) {
        const isPlayer = unit.owner === 'player';
        const x = isPlayer ? battlefield.width * 0.43 : battlefield.width * 0.57;
        const y = yToCanvas(unit.y);
        const unitType = unit.unit_type;

        ctx.beginPath();
        ctx.fillStyle = isPlayer ? '#2563eb' : '#ef4444';
        ctx.arc(x, y, 13, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText((UNIT_ICONS[unitType] || '?').slice(0, 2), x, y + 4);

        ctx.fillStyle = '#111827';
        ctx.font = '10px Arial';
        ctx.fillText(Math.max(0, unit.hp), x, y - 16);
      }
      ctx.textAlign = 'start';
    }

    function drawFloating(delta) {
      const next = [];
      for (const item of state.floatTexts) {
        const y = item.y - (26 * (1 - item.ttl));
        ctx.fillStyle = item.color;
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`-${item.value}`, item.x, y);
        item.ttl -= delta;
        if (item.ttl > 0) next.push(item);
      }
      state.floatTexts = next;
    }

    function renderCanvas(delta = 0.016) {
      drawArena();
      drawUnits();
      drawFloating(delta);
    }

    async function getNewQuestion() {
      const out = await api('POST', API.question, { session_id: state.session.id });
      state.question = out.question;
      state.session = out.session;
      renderQuestion();
      updateHud();
      setStatus('Choose an answer then press Generate Elixir.');
    }

    async function submitAnswerOrFetch() {
      if (!state.question) {
        await getNewQuestion();
        return;
      }
      if (state.selectedAnswer === null) {
        setStatus('Select an option first.', 'bad');
        return;
      }

      const out = await api('POST', API.answer, {
        session_id: state.session.id,
        question_id: state.question.id,
        selected_answer: state.selectedAnswer
      });

      state.session = out.session;
      if (out.result.is_correct) {
        setStatus('✅ Correct!', 'ok');
      } else {
        setStatus('❌ Try again.', 'bad');
      }
      state.question = null;
      renderQuestion();
      updateHud();
    }

    async function tickLoop() {
      if (!state.session || state.session.status !== 'active') return;
      try {
        const out = await api('POST', API.tick, {
          session_id: state.session.id,
          delta_seconds: 0.25
        });
        state.session = out.session;

        for (const ev of out.events || []) {
          if (ev.type === 'damage' && ev.target_type === 'unit') {
            const target = state.session.state.units.find(u => u.id === ev.target_id);
            if (target) {
              const x = target.owner === 'player' ? battlefield.width * 0.43 : battlefield.width * 0.57;
              const y = yToCanvas(target.y);
              addFloatingText(x + 10, y, ev.value);
            }
          }
          if (ev.type === 'damage' && ev.target_type === 'castle') {
            const x = battlefield.width / 2 + (ev.target_owner === 'enemy' ? 50 : -55);
            const y = ev.target_owner === 'enemy' ? 30 : battlefield.height - 20;
            addFloatingText(x, y, ev.value, '#b91c1c');
          }
        }

        updateHud();
      } catch (err) {
        setStatus(err.message, 'bad');
      } finally {
        renderCanvas(0.25);
        setTimeout(tickLoop, 250);
      }
    }

    async function init() {
      try {
        state.config = await api('GET', API.config);
        const created = await api('POST', API.newSession, { mode: 'solo', player_name: 'Player' });
        state.session = created.session;
        renderQuestion();
        updateHud();
        renderCanvas();
        setStatus('Press Generate Elixir to get your first question.');
        setTimeout(tickLoop, 300);
      } catch (err) {
        setStatus(err.message, 'bad');
      }
    }

    document.getElementById('submitAnswer').addEventListener('click', async () => {
      try {
        await submitAnswerOrFetch();
      } catch (err) {
        setStatus(err.message, 'bad');
      }
    });

    let lastFrame = performance.now();
    function raf(now) {
      const delta = Math.min(0.05, (now - lastFrame) / 1000);
      lastFrame = now;
      renderCanvas(delta);
      requestAnimationFrame(raf);
    }

    init();
    requestAnimationFrame(raf);
