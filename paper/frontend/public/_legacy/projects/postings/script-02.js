// Extracted from ui/projects/postings.html (inline <script> #2).
    const yEl = document.getElementById('y'); if (yEl) yEl.textContent = new Date().getFullYear();
    const root = document.documentElement; const toggles = () => Array.from(document.querySelectorAll('[data-theme-toggle]'));
    function updateThemeIcons(mode) { toggles().forEach(btn => { const ic = btn.querySelector('.material-symbols-rounded'); if (ic) ic.textContent = mode === 'dark' ? 'light_mode' : 'dark_mode'; }); }
    function setTheme(mode) { mode === 'dark' ? root.classList.add('dark') : root.classList.remove('dark'); localStorage.setItem('px_theme', mode); updateThemeIcons(mode); }
    setTheme(root.classList.contains('dark') ? 'dark' : 'light');
    document.addEventListener('click', e => { const t = e.target.closest('[data-theme-toggle]'); if (!t) return; const next = root.classList.contains('dark') ? 'light' : 'dark'; setTheme(next); });
