// Extracted from ui/labs/labx.html (inline <script> #1).
            (function () {
                try {
                    const s = localStorage.getItem('px_theme');
                    const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    if (s ? s === 'dark' : prefers) document.documentElement.classList.add('dark');
                } catch (_) { }
            })();
