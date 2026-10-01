// Extracted from ui/print/index.html (inline <script> #1).
        (() => {
            const stored = localStorage.getItem('px_theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const isDark = stored ? stored === 'dark' : prefersDark;
            if (isDark) document.documentElement.classList.add('dark');
        })();
