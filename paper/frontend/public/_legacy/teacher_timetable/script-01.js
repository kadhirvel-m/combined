// Extracted from ui/teacher_timetable.html (inline <script> #1).
        (function () {
            const saved = localStorage.getItem('px_theme');
            const prefersDark = matchMedia('(prefers-color-scheme: dark)').matches;
            const mode = saved || (prefersDark ? 'dark' : 'light');
            if (mode === 'dark') document.documentElement.classList.add('dark');
        })();
