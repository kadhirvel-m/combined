// Extracted from ui/teachers/teacher_class.html (inline <script> #2).
(() => { const s = localStorage.getItem('px_theme'); const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches; const dark = s ? s === 'dark' : prefers; if (dark) document.documentElement.classList.add('dark'); })();
