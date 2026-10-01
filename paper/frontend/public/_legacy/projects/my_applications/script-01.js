// Extracted from ui/projects/my_applications.html (inline <script> #1).
    const initTheme = () => { const stored = localStorage.getItem('px_theme'); const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches; if ((stored === 'dark') || (!stored && prefersDark)) document.documentElement.classList.add('dark'); }; initTheme();
    const toggleTheme = () => { const isDark = document.documentElement.classList.toggle('dark'); localStorage.setItem('px_theme', isDark ? 'dark' : 'light'); };
