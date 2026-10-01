// Extracted from ui/tunex/level.html (inline <script> #3).
        // Mobile nav (drawer)
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
            };

            const isOpen = () => panel.dataset.open === 'true';

            toggle.addEventListener('click', () => setOpen(!isOpen()));
            backdrop.addEventListener('click', () => setOpen(false));
            document.addEventListener('click', (e) => {
                if (e.target.closest('[data-close-mobile-nav]')) setOpen(false);
            });
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') setOpen(false);
            });
        })();
