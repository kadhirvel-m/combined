// Extracted from ui/notes_search.html (inline <script> #1).
        // Persist theme before paint (keeps UI consistent across pages)
        (function () {
            try {
                var v = localStorage.getItem('px_theme');
                var mode = (v === 'dark' || v === 'light') ? v : null;
                if (!mode && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    mode = 'dark';
                }
                if (mode) {
                    document.documentElement.classList.toggle('dark', mode === 'dark');
                    document.documentElement.setAttribute('data-theme', mode);
                    try { document.documentElement.style.colorScheme = mode; } catch (_) { }
                }
            } catch (e) { }
        })();
