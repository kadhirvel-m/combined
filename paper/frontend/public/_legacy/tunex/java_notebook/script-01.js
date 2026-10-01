// Extracted from ui/tunex/java_notebook.html (inline <script> #1).
        // Theme initialization
        (function () {
            const stored = localStorage.getItem('px_theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const isDark = stored === 'dark' || (!stored && prefersDark);
            if (isDark) document.documentElement.classList.add('dark');
        })();

        const Theme = {
            toggle() {
                document.documentElement.classList.toggle('dark');
                const isDark = document.documentElement.classList.contains('dark');
                localStorage.setItem('px_theme', isDark ? 'dark' : 'light');
                if (window.notebookInstance) {
                    window.notebookInstance.updateTheme(isDark);
                }
            },
            isDark() {
                return document.documentElement.classList.contains('dark');
            }
        };

        window.tailwind = window.tailwind || {};
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: { brand: { 500: '#9E4B8A', 600: '#7A3A6B', 700: '#4C2A59' } },
                    fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'], mono: ['JetBrains Mono', 'monospace'] }
                }
            }
        }
