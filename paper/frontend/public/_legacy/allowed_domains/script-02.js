// Extracted from ui/allowed_domains.html (inline <script> #2).
        // Theme control
        const root = document.documentElement;
        function updateThemeIcon() {
            document.querySelectorAll('[data-theme-toggle] .material-symbols-rounded').forEach(ic => {
                ic.textContent = root.classList.contains('dark') ? 'light_mode' : 'dark_mode';
            });
        }
        function setTheme(mode) {
            if (mode === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
            localStorage.setItem('px_theme', mode); updateThemeIcon();
        }
        document.addEventListener('click', e => { const t = e.target.closest('[data-theme-toggle]'); if (!t) return; const next = root.classList.contains('dark') ? 'light' : 'dark'; setTheme(next); });
        updateThemeIcon();

        // Tiny toast helper
        function showToast(msg, icon = 'check_circle') {
            const t = document.getElementById('toast');
            document.getElementById('toastMsg').textContent = msg;
            document.getElementById('toastIcon').textContent = icon;
            t.classList.remove('hidden');
            setTimeout(() => t.classList.add('hidden'), 2000);
        }
