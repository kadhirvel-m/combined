// Extracted from ui/collage/departments.html (inline <script> #2).
        const y = document.getElementById('y'); if (y) y.textContent = new Date().getFullYear();
        const root = document.documentElement;
        const themeToggles = () => Array.from(document.querySelectorAll('[data-theme-toggle]'));
        const updateToggleIcons = (mode) => { themeToggles().forEach(btn => { const icon = btn.querySelector('.material-symbols-rounded'); if (icon) icon.textContent = mode === 'dark' ? 'light_mode' : 'dark_mode'; }); };
        const setTheme = (mode) => { if (mode === 'dark') root.classList.add('dark'); else root.classList.remove('dark'); localStorage.setItem('px_theme', mode); updateToggleIcons(mode); };
        setTheme(root.classList.contains('dark') ? 'dark' : 'light');
        document.addEventListener('click', (e) => { const trigger = e.target.closest('[data-theme-toggle]'); if (!trigger) return; const next = root.classList.contains('dark') ? 'light' : 'dark'; setTheme(next); });
