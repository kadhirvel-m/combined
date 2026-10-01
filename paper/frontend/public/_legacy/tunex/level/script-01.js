// Extracted from ui/tunex/level.html (inline <script> #1).
        // Theme boot (runs before paint to avoid flash)
        (() => {
            const stored = localStorage.getItem('px_theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const isDark = stored ? stored === 'dark' : prefersDark;
            if (isDark) document.documentElement.classList.add('dark');
        })();
