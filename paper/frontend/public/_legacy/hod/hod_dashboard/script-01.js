// Extracted from ui/hod/hod_dashboard.html (inline <script> #1).
    // Keep theme consistent with the rest of PaperX
    (() => {
      const stored = localStorage.getItem('px_theme');
      const prefers = window.matchMedia && window.matchMedia('(prefers-color-scheme:dark)').matches;
      const dark = stored ? stored === 'dark' : !!prefers;
      if (dark) document.documentElement.classList.add('dark');
    })();
