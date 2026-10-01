// Extracted from ui/collage/subjects.html (inline <script> #1).
        (() => {
            const s = localStorage.getItem('px_theme');
            const p = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const d = s ? s === 'dark' : p;
            if (d) document.documentElement.classList.add('dark');
        })();
