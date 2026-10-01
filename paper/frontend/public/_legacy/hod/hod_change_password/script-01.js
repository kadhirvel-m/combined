// Extracted from ui/hod/hod_change_password.html (inline <script> #1).
    (() => {
      const stored = localStorage.getItem('px_theme');
      const prefers = window.matchMedia && window.matchMedia('(prefers-color-scheme:dark)').matches;
      const dark = stored ? stored === 'dark' : !!prefers;
      if (dark) document.documentElement.classList.add('dark');
    })();
