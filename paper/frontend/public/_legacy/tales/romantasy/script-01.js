// Extracted from ui/tales/romantasy.html (inline <script> #1).
(() => { let s = null; try { s = localStorage.getItem('px_theme') } catch (e) { }; const prefers = matchMedia('(prefers-color-scheme: dark)').matches; const dark = s ? s === 'dark' : prefers; if (dark) { document.documentElement.classList.add('dark'); } else { document.documentElement.classList.add('light'); } })();
