// Extracted from ui/projects/project.html (inline <script> #1).
/* theme boot */(() => { const s = localStorage.getItem('px_theme'); const pref = window.matchMedia('(prefers-color-scheme: dark)').matches; const dark = s ? s === 'dark' : pref; if (dark) document.documentElement.classList.add('dark'); })();
