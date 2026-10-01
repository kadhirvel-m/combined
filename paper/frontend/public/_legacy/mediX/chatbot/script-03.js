// Extracted from ui/mediX/chatbot.html (inline <script> #3).
    (() => {
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
      window.addEventListener('keydown', (event) => { if (event.key === 'Escape') close(); });
      window.matchMedia('(min-width: 768px)').addEventListener('change', (event) => { if (event.matches) close(); });
      panel.addEventListener('click', (event) => { if (event.target.closest('[data-close-mobile-nav]')) close(); });
      close();
    })();
