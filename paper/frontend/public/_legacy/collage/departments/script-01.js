// Extracted from ui/collage/departments.html (inline <script> #1).
            (() => { // early theme hydration
                const stored = localStorage.getItem('px_theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const isDark = stored ? stored === 'dark' : prefersDark;
                if (isDark) document.documentElement.classList.add('dark');
            })();
