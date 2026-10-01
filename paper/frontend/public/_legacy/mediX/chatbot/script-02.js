// Extracted from ui/mediX/chatbot.html (inline <script> #2).
    const root = document.documentElement;
    const toggles = () => Array.from(document.querySelectorAll('[data-theme-toggle]'));
    const setIcon = (mode) => toggles().forEach((b) => {
      const icon = b.querySelector('.material-symbols-rounded');
      if (icon) icon.textContent = mode === 'dark' ? 'light_mode' : 'dark_mode';
    });
    const setTheme = (mode) => {
      mode === 'dark' ? root.classList.add('dark') : root.classList.remove('dark');
      localStorage.setItem('px_theme', mode);
      setIcon(mode);
    };
    setTheme(root.classList.contains('dark') ? 'dark' : 'light');
    document.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-theme-toggle]');
      if (!trigger) return;
      setTheme(root.classList.contains('dark') ? 'light' : 'dark');
    });
