// Extracted from ui/chatbot.html (inline <script> #1).
    (function () {
      try {
        var mode = localStorage.getItem('px_theme');
        if (!mode && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          mode = 'dark';
        }
        if (mode) {
          document.documentElement.setAttribute('data-theme', mode);
          document.documentElement.classList.toggle('dark', mode === 'dark');
        }
      } catch (e) { }
    })();
