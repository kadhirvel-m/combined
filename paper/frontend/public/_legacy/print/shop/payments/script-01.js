// Extracted from ui/print/shop/payments.html (inline <script> #1).
        // Theme boot (no flash) + auth guard
        (function () {
            try {
                var stored = localStorage.getItem('px_theme');
                var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                var isDark = stored ? stored === 'dark' : !!prefersDark;
                if (isDark) document.documentElement.classList.add('dark');
            } catch (_) { }
            try {
                var t = localStorage.getItem('px_token');
                if (!t) { var next = encodeURIComponent(location.pathname + (location.search || '')); location.replace('login.html?next=' + next); }
            } catch (_) { location.replace('login.html'); }
        })();
