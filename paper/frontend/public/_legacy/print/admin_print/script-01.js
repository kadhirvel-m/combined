// Extracted from ui/print/admin_print.html (inline <script> #1).
        // Theme + guard (admins only)
        (function () {
            try {
                var stored = localStorage.getItem('px_theme');
                var prefers = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                if ((stored ? stored === 'dark' : prefers)) document.documentElement.classList.add('dark');
            } catch (_) { }
            try {
                var t = localStorage.getItem('px_token');
                if (!t) { var next = encodeURIComponent(location.pathname + (location.search || '')); location.replace('../login.html?next=' + next); }
            } catch (_) { location.replace('../login.html'); }
        })();
