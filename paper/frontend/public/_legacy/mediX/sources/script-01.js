// Extracted from ui/mediX/sources.html (inline <script> #1).
    (() => {
      const stored = localStorage.getItem('px_theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const dark = stored ? stored === 'dark' : prefersDark;
      if (dark) document.documentElement.classList.add('dark');
    })();
