// Extracted from ui/collage/departments.html (inline <script> #3).
        (function () { // mobile nav
            const toggle = document.getElementById('mobileNavToggle');
            const panel = document.getElementById('mobileNavPanel');
            const backdrop = document.getElementById('mobileNavBackdrop');
            if (!toggle || !panel || !backdrop) return;
            const icon = toggle.querySelector('[data-icon]');
            const focusableSelector = 'a[href], button:not([disabled])';
            const openMenu = () => { panel.setAttribute('data-open', 'true'); panel.classList.add('open'); panel.setAttribute('aria-hidden', 'false'); backdrop.setAttribute('data-open', 'true'); backdrop.classList.add('open'); backdrop.setAttribute('aria-hidden', 'false'); toggle.setAttribute('aria-expanded', 'true'); if (icon) icon.textContent = 'close'; document.body.classList.add('overflow-hidden'); const first = panel.querySelector(focusableSelector); if (first) first.focus(); };
            const closeMenu = () => { panel.removeAttribute('data-open'); panel.classList.remove('open'); panel.setAttribute('aria-hidden', 'true'); backdrop.removeAttribute('data-open'); backdrop.classList.remove('open'); backdrop.setAttribute('aria-hidden', 'true'); toggle.setAttribute('aria-expanded', 'false'); if (icon) icon.textContent = 'menu'; document.body.classList.remove('overflow-hidden'); toggle.focus(); };
            const toggleMenu = () => { const isOpen = toggle.getAttribute('aria-expanded') === 'true'; (isOpen ? closeMenu : openMenu)(); };
            toggle.addEventListener('click', toggleMenu); backdrop.addEventListener('click', closeMenu); panel.addEventListener('click', (evt) => { if (evt.target.closest('[data-close-mobile-nav]')) closeMenu(); }); window.addEventListener('keydown', (evt) => { if (evt.key === 'Escape') closeMenu(); }); window.matchMedia('(min-width: 768px)').addEventListener('change', (evt) => { if (evt.matches) closeMenu(); });
        })();
