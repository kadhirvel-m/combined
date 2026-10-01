// Extracted from ui/tunex/video-notes.html (inline <script> #2).
        // Extend shared Theme manager with notebook-specific behavior
        (function () {
            const baseToggle = Theme.toggle.bind(Theme);
            Theme.toggle = function () {
                baseToggle();
                if (window.notebookInstance) {
                    window.notebookInstance.updateTheme(Theme.isDark());
                }
            };
            Theme.isDark = function () {
                return document.documentElement.classList.contains('dark');
            };
        })();
