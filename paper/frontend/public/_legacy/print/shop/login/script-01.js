// Extracted from ui/print/shop/login.html (inline <script> #1).
    const API = (window.API_BASE || '').replace(/\/$/, '');
    const status = document.getElementById('status');
    const submitBtn = document.getElementById('submit');
    let turnstileWidgetId = null;
    let turnstileToken = '';

    function syncSubmit() {
      if (!submitBtn) return;
      submitBtn.disabled = !turnstileToken;
    }

    async function waitForTurnstile(maxWaitMs = 8000) {
      const start = Date.now();
      while (Date.now() - start < maxWaitMs) {
        if (window.turnstile && typeof window.turnstile.render === 'function') return;
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      throw new Error('Turnstile failed to load');
    }

    function resetTurnstile() {
      turnstileToken = '';
      if (window.turnstile && turnstileWidgetId !== null) {
        try { window.turnstile.reset(turnstileWidgetId); } catch (_) { }
      }
      syncSubmit();
    }

    async function initTurnstile() {
      try {
        const cfgRes = await fetch(`${API}/api/public/turnstile`);
        const cfg = await cfgRes.json().catch(() => ({}));
        if (!cfgRes.ok || !cfg.siteKey) throw new Error('Turnstile config unavailable');
        await waitForTurnstile();
        turnstileWidgetId = window.turnstile.render('#turnstileContainer', {
          sitekey: cfg.siteKey,
          action: 'login',
          callback: (token) => {
            turnstileToken = token || '';
            syncSubmit();
          },
          'expired-callback': () => {
            turnstileToken = '';
            syncSubmit();
            status.textContent = 'Verification expired. Please complete Turnstile again.';
          },
          'error-callback': () => {
            turnstileToken = '';
            syncSubmit();
            status.textContent = 'Verification failed to load. Refresh and try again.';
          },
          theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light'
        });
        syncSubmit();
      } catch (_) {
        status.textContent = 'Unable to initialize verification. Please refresh.';
      }
    }

    document.getElementById('form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      const tokenFromWidget = (window.turnstile && turnstileWidgetId !== null)
        ? (window.turnstile.getResponse(turnstileWidgetId) || '')
        : '';
      turnstileToken = tokenFromWidget || turnstileToken;
      if (!turnstileToken) {
        status.textContent = 'Please complete verification before signing in.';
        syncSubmit();
        return;
      }
      const payload = { email: fd.get('email'), password: fd.get('password'), turnstile_token: turnstileToken };
      status.textContent = '';
      try {
        const r = await fetch(`${API}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) { status.textContent = j.detail || 'Login failed'; resetTurnstile(); return; }
        const token = j.access_token; if (!token) { status.textContent = 'Missing token'; return; }
        try {
          localStorage.removeItem('px_token');
          localStorage.removeItem('px_refresh_token');
          localStorage.removeItem('px_token_expires_at');
        } catch (_) { }
        // Verify shop exists
        const r2 = await fetch(`${API}/api/shop/me`, { headers: { Authorization: 'Bearer ' + token } });
        if (r2.ok) { location.href = './jobs.html'; return; }
        // No shop yet
        location.href = './signup.html';
      } catch {
        status.textContent = 'Network error';
        resetTurnstile();
      }
    });

    syncSubmit();
    initTurnstile();
