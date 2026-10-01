// Extracted from ui/teacher_classes_manage.html (inline <script> #1).
(() => { const s = localStorage.getItem('px_theme'); const p = matchMedia('(prefers-color-scheme: dark)').matches; const m = s ? s : (p ? 'dark' : 'light'); if (m === 'dark') document.documentElement.classList.add('dark'); })();
