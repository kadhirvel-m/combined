// Extracted from ui/hod/hod_staff.html (inline <script> #1).
(() => { const s = localStorage.getItem('px_theme'); const p = window.matchMedia && window.matchMedia('(prefers-color-scheme:dark)').matches; const dark = s ? s === 'dark' : !!p; if (dark) document.documentElement.classList.add('dark'); })();
