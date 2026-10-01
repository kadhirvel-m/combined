// Extracted from ui/matketplace/notes/upload_note.html (inline <script> #2).
    (function () {
      const stored = localStorage.getItem('px_theme');
      const prefers = matchMedia('(prefers-color-scheme: dark)').matches;
      const mode = stored ? stored : (prefers ? 'dark' : 'light');
      if (mode === 'dark') document.documentElement.classList.add('dark');
    })();
