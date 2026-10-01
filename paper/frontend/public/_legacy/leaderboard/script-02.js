// Extracted from ui/leaderboard.html (inline <script> #2).
            (function () {
                try {
                    const s = localStorage.getItem('px_theme');
                    const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    const useDark = s ? s === 'dark' : prefers;
                    if (useDark) document.documentElement.classList.add('dark');
                } catch (_) { }
            })();
