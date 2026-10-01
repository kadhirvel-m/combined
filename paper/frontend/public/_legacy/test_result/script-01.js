// Extracted from ui/test_result.html (inline <script> #1).
(function () { const s = localStorage.getItem('px_theme'); const p = matchMedia('(prefers-color-scheme: dark)').matches; const m = s ? s : (p ? 'dark' : 'light'); if (m === 'dark') document.documentElement.classList.add('dark'); })();
