// Extracted from ui/clg.html (inline <script> #1).
        (function () { try { var v = localStorage.getItem('px_theme'); var m = (v === 'dark' || v === 'light') ? v : null; if (!m && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) { m = 'dark'; } if (m) { document.documentElement.classList.toggle('dark', m === 'dark'); } } catch (e) { } })();
