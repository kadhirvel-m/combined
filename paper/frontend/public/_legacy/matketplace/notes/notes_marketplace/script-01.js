// Extracted from ui/matketplace/notes/notes_marketplace.html (inline <script> #1).
        (function () {
            const stored = localStorage.getItem('px_theme');
            const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const mode = stored ? stored : (prefers ? 'dark' : 'light');
            if (mode === 'dark') document.documentElement.classList.add('dark');
        })();
