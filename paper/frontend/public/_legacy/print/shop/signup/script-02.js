// Extracted from ui/print/shop/signup.html (inline <script> #2).
    // Theme toggle
    const themeBtn = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const saved = localStorage.getItem('px_theme');
    if ((saved === 'dark') || (!saved && prefersDark)) document.documentElement.classList.add('dark');

    function syncIcon() {
      themeIcon.textContent = document.documentElement.classList.contains('dark') ? 'light_mode' : 'dark_mode';
    }
    syncIcon();
    themeBtn.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
      localStorage.setItem('px_theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
      syncIcon();
    });

    // Password show/hide
    document.getElementById('togglePwd').addEventListener('click', () => {
      const pwd = document.getElementById('password');
      pwd.type = pwd.type === 'password' ? 'text' : 'password';
    });

    // Toast helper
    function toast(msg, ms = 1800) {
      const t = document.getElementById('toast');
      const m = document.getElementById('toastMsg');
      m.textContent = msg; t.classList.remove('hidden', 'opacity-0');
      t.classList.add('transition', 'duration-200');
      setTimeout(() => { t.classList.add('opacity-0'); setTimeout(() => t.classList.add('hidden'), 200); }, ms);
    }

    // API submit (preserves your contract, but adds UX niceties)
    const API = (window.API_BASE || '').replace(/\/$/, '');
    const form = document.getElementById('authForm');
    const statusEl = document.getElementById('status');
    const submitBtn = document.getElementById('submit');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      statusEl.textContent = '';
      submitBtn.disabled = true;
      submitBtn.classList.add('opacity-70', 'pointer-events-none');
      const originalBtn = submitBtn.innerHTML;
      submitBtn.innerHTML = `<span class="material-symbols-rounded animate-spin text-base">progress_activity</span> <span>Creating…</span>`;

      const fd = new FormData(e.currentTarget);
      const email = fd.get('email');
      const password = fd.get('password');
      const shop_name = fd.get('shop_name');
      const phone = fd.get('phone');
      const shop_email = fd.get('shop_email');
      const address = fd.get('address');

      // Sizes: support <select multiple>
      const selectEl = e.currentTarget.querySelector('select[name="cap_sizes"]');
      const sizes = Array.from(selectEl?.selectedOptions || []).map(o => o.value);

      const capabilities = {
        color: !!fd.get('cap_color'),
        duplex: !!fd.get('cap_duplex'),
        sizes,
        bindings: ['none', 'staple', 'spiral'],
        gsm: [70, 80, 100]
      };

      try {
        // 1) Signup
        const r1 = await fetch(`${API}/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const j1 = await r1.json().catch(() => ({}));
        if (!r1.ok) {
          const msg = j1.detail || 'Signup failed';
          statusEl.textContent = msg; toast(msg);
          return;
        }
        const token = j1.access_token || '';
        if (!token) { statusEl.textContent = 'Missing token from signup'; toast('Missing token from signup'); return; }
        try {
          localStorage.removeItem('px_token');
          localStorage.removeItem('px_refresh_token');
          localStorage.removeItem('px_token_expires_at');
        } catch (_) { }

        // 2) Create shop
        const r2 = await fetch(`${API}/api/shop/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
          body: JSON.stringify({ name: shop_name, phone, email: shop_email, address, capabilities })
        });
        const j2 = await r2.json().catch(() => ({}));
        if (!r2.ok) {
          const msg = j2.detail || 'Shop creation failed';
          statusEl.textContent = msg; toast(msg);
          return;
        }

        statusEl.textContent = 'Created. Redirecting…';
        toast('Shop created! Redirecting…');
        setTimeout(() => location.href = './jobs.html', 600);

      } catch (err) {
        statusEl.textContent = 'Network error';
        toast('Network error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-70', 'pointer-events-none');
        submitBtn.innerHTML = originalBtn;
      }
    });
