// Extracted from ui/print/shop/profile.html (inline <script> #1).
    // Theme boot
    (() => {
      const stored = localStorage.getItem('px_theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = stored ? stored === 'dark' : prefersDark;
      if (isDark) document.documentElement.classList.add('dark');
    })();
