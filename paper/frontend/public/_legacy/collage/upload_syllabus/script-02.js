// Extracted from ui/collage/upload_syllabus.html (inline <script> #2).
    (() => {
      const s = localStorage.getItem('px_theme');
      const p = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const d = s ? s === 'dark' : p;
      if (d) document.documentElement.classList.add('dark');
    })();
