// Extracted from ui/ppt/index.html (inline <script> #2).
            (() => {
                const stored = localStorage.getItem('px_theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (stored ? stored === 'dark' : prefersDark) document.documentElement.classList.add('dark');
            })();
