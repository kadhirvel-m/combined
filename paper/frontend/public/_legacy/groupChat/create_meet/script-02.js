// Extracted from ui/groupChat/create_meet.html (inline <script> #2).
        // Mobile nav (same behavior as about.html)
        (function () {
            const toggle = document.getElementById('mobileNavToggle');
            const panel = document.getElementById('mobileNavPanel');
            const backdrop = document.getElementById('mobileNavBackdrop');
            if (!toggle || !panel || !backdrop) return;
            const icon = toggle.querySelector('[data-icon]');

            const open = () => {
                panel.classList.remove('hidden');
                backdrop.classList.remove('hidden');
                panel.setAttribute('data-open', 'true');
                panel.classList.add('open');
                panel.setAttribute('aria-hidden', 'false');
                backdrop.setAttribute('data-open', 'true');
                backdrop.classList.add('open');
                backdrop.setAttribute('aria-hidden', 'false');
                toggle.setAttribute('aria-expanded', 'true');
                if (icon) icon.textContent = 'close';
                document.body.classList.add('overflow-hidden');
            };

            const close = () => {
                panel.removeAttribute('data-open');
                panel.classList.remove('open');
                panel.setAttribute('aria-hidden', 'true');
                backdrop.removeAttribute('data-open');
                backdrop.classList.remove('open');
                backdrop.setAttribute('aria-hidden', 'true');
                toggle.setAttribute('aria-expanded', 'false');
                if (icon) icon.textContent = 'menu';
                document.body.classList.remove('overflow-hidden');
                panel.classList.add('hidden');
                backdrop.classList.add('hidden');
            };

            toggle.addEventListener('click', () => toggle.getAttribute('aria-expanded') === 'true' ? close() : open());
            backdrop.addEventListener('click', close);
            window.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
            window.matchMedia('(min-width: 768px)').addEventListener('change', e => { if (e.matches) close(); });
            panel.addEventListener('click', evt => { if (evt.target.closest('[data-close-mobile-nav]')) close(); });
            close();
        })();
