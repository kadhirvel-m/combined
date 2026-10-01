// Extracted from ui/projects/public_profile.html (inline <script> #1).
    const initTheme = () => {
      const stored = localStorage.getItem('px_theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if ((stored === 'dark') || (!stored && prefersDark)) document.documentElement.classList.add('dark');
    };
    initTheme();
    const toggleTheme = () => {
      const d = document.documentElement.classList.toggle('dark');
      localStorage.setItem('px_theme', d ? 'dark' : 'light');
    };
