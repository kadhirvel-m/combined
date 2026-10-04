// Extracted from ui/collage/syllabus.html (inline <script> #4).
        // Mobile nav
        (function () {
            const toggle = document.getElementById('mobileNavToggle');
            const panel = document.getElementById('mobileNavPanel');
            const backdrop = document.getElementById('mobileNavBackdrop');
            if (!toggle || !panel || !backdrop) return;
            const icon = toggle.querySelector('[data-icon]');
            const focusable = 'a[href],button:not([disabled])';

            function openMenu() {
                panel.setAttribute('data-open', 'true');
                panel.classList.add('open');
                panel.setAttribute('aria-hidden', 'false');
                backdrop.setAttribute('data-open', 'true');
                backdrop.classList.add('open');
                backdrop.setAttribute('aria-hidden', 'false');
                toggle.setAttribute('aria-expanded', 'true');
                if (icon) icon.textContent = 'close';
                document.body.classList.add('overflow-hidden');
                const f = panel.querySelector(focusable);
                if (f) f.focus();
            }

            function closeMenu() {
                panel.removeAttribute('data-open');
                panel.classList.remove('open');
                panel.setAttribute('aria-hidden', 'true');
                backdrop.removeAttribute('data-open');
                backdrop.classList.remove('open');
                backdrop.setAttribute('aria-hidden', 'true');
                toggle.setAttribute('aria-expanded', 'false');
                if (icon) icon.textContent = 'menu';
                document.body.classList.remove('overflow-hidden');
            }

            function toggleMenu() {
                const isOpen = toggle.getAttribute('aria-expanded') === 'true';
                (isOpen ? closeMenu : openMenu)();
            }

            toggle.addEventListener('click', toggleMenu);
            backdrop.addEventListener('click', closeMenu);
            panel.addEventListener('click', e => { if (e.target.closest('[data-close-mobile-nav]')) closeMenu(); });
            window.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
            window.matchMedia('(min-width:768px)').addEventListener('change', e => { if (e.matches) closeMenu(); });
        })();
