// Extracted from ui/tunex/compiler.html (inline <script> #1).
        // Theme initialization
        (function () {
            const stored = localStorage.getItem('px_theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const isDark = stored === 'dark' || (!stored && prefersDark);
            if (isDark) document.documentElement.classList.add('dark');
            else document.documentElement.classList.remove('dark');
        })();
        const Theme = {
            toggle() {
                const html = document.documentElement;
                html.classList.toggle('dark');
                localStorage.setItem('px_theme', html.classList.contains('dark') ? 'dark' : 'light');
            }
        };
