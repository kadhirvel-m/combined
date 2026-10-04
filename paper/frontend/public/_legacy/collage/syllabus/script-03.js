// Extracted from ui/collage/syllabus.html (inline <script> #3).
        // Theme
        const root = document.documentElement;
        const themeBtns = () => Array.from(document.querySelectorAll('[data-theme-toggle]'));

        function updateThemeIcons(mode) {
            themeBtns().forEach(b => {
                const ic = b.querySelector('.material-symbols-rounded');
                if (ic) ic.textContent = mode === 'dark' ? 'light_mode' : 'dark_mode';
            });
        }

        function setTheme(mode) {
            if (mode === 'dark') root.classList.add('dark');
            else root.classList.remove('dark');
            localStorage.setItem('px_theme', mode);
            updateThemeIcons(mode);
        }
        setTheme(root.classList.contains('dark') ? 'dark' : 'light');
        document.addEventListener('click', e => {
            const t = e.target.closest('[data-theme-toggle]');
            if (!t) return;
            const next = root.classList.contains('dark') ? 'light' : 'dark';
            setTheme(next);
        });
