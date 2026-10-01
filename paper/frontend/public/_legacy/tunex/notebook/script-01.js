// Extracted from ui/tunex/notebook.html (inline <script> #1).
        // Migrate old notebook theme preference to shared Theme.STORAGE_KEY
        (function () {
            try {
                const legacy = localStorage.getItem('tunex-theme');
                const current = localStorage.getItem('px_theme');
                if (!current && legacy) localStorage.setItem('px_theme', legacy);
                if (legacy) localStorage.removeItem('tunex-theme');
            } catch (_) {
                // ignore
            }
        })();
