// Extracted from ui/medical_notes.html (inline <script> #1).
    (function () {
      try {
        var v = localStorage.getItem('px_theme');
        var mode = (v === 'dark' || v === 'light') ? v : null;
        if (!mode && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          mode = 'dark';
        }
        if (mode) {
          document.documentElement.setAttribute('data-theme', mode);
          document.documentElement.classList.toggle('dark', mode === 'dark');
        }
      } catch (e) { }
    })();
