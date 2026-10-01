// Extracted from ui/teachers/teacher_feedback_analytics.html (inline <script> #1).
            (() => {
                const s = localStorage.getItem('px_theme');
                const prefers = matchMedia('(prefers-color-scheme: dark)').matches;
                if (s ? s === 'dark' : prefers) document.documentElement.classList.add('dark');
            })();
