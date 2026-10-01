// Extracted from ui/print/shop/dashboard.html (inline <script> #2).
        // Year + Theme toggles
        const yEl = document.getElementById('y'); if (yEl) yEl.textContent = new Date().getFullYear();
        const toggles = [document.getElementById('themeToggle'), document.getElementById('themeToggleSm')].filter(Boolean);
        function syncThemeIcon() {
            const dark = document.documentElement.classList.contains('dark');
            toggles.forEach(btn => { const i = btn.querySelector('.material-symbols-rounded'); if (i) i.textContent = dark ? 'light_mode' : 'dark_mode'; });
        }
        toggles.forEach(btn => btn.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            localStorage.setItem('px_theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
            syncThemeIcon();
        }));
        syncThemeIcon();
