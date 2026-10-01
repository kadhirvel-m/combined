// Extracted from ui/inovateX/index.html (inline <script> #3).
        // ── Theme toggle ──
        const root = document.documentElement;
        const themeToggles = () => Array.from(document.querySelectorAll('[data-theme-toggle]'));
        const updateToggleIcons = (mode) => {
            themeToggles().forEach(btn => {
                const icon = btn.querySelector('.material-symbols-rounded');
                if (icon) icon.textContent = mode === 'dark' ? 'light_mode' : 'dark_mode';
            });
        };
        const setTheme = (mode) => {
            if (mode === 'dark') root.classList.add('dark');
            else root.classList.remove('dark');
            localStorage.setItem('px_theme', mode);
            updateToggleIcons(mode);
        };
        setTheme(root.classList.contains('dark') ? 'dark' : 'light');
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('[data-theme-toggle]');
            if (!trigger) return;
            setTheme(root.classList.contains('dark') ? 'light' : 'dark');
        });

        // ── Mobile nav drawer ──
        (() => {
            const toggle = document.getElementById('mobileNavToggle');
            const backdrop = document.getElementById('mobileNavBackdrop');
            const panel = document.getElementById('mobileNavPanel');
            if (!toggle || !backdrop || !panel) return;

            const setOpen = (open) => {
                toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
                panel.setAttribute('aria-hidden', open ? 'false' : 'true');
                backdrop.setAttribute('aria-hidden', open ? 'false' : 'true');
                backdrop.dataset.open = open ? 'true' : 'false';
                panel.dataset.open = open ? 'true' : 'false';
                const icon = toggle.querySelector('[data-icon]');
                if (icon) icon.textContent = open ? 'close' : 'menu';
            };
            const isOpen = () => panel.dataset.open === 'true';
            toggle.addEventListener('click', () => setOpen(!isOpen()));
            backdrop.addEventListener('click', () => setOpen(false));
            document.addEventListener('click', (e) => {
                if (e.target.closest('[data-close-mobile-nav]')) setOpen(false);
            });
            document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
        })();

        // ── Scroll reveal ──
        (() => {
            const els = document.querySelectorAll('.reveal');
            if (!els.length) return;
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
            els.forEach(el => observer.observe(el));
        })();
