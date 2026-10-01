// Extracted from ui/teacher_applications.html (inline <script> #1).
(() => { const stored = localStorage.getItem('px_theme'); const prefers = window.matchMedia('(prefers-color-scheme:dark)').matches; const dark = stored ? stored === 'dark' : prefers; if (dark) document.documentElement.classList.add('dark'); })();
