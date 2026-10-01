// Extracted from ui/tunex/notebook.html (inline <script> #2).
        // Extend shared Theme manager with notebook-specific behavior
        (function () {
            const baseToggle = Theme.toggle.bind(Theme);
            Theme.toggle = function () {
                baseToggle();
                if (window.notebookInstance) {
                    window.notebookInstance.updateTheme(Theme.get() === 'dark');
                }
            };
            Theme.isDark = function () {
                return Theme.get() === 'dark';
            };
        })();

        window.tailwind = window.tailwind || {};
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        gatex: {
                            bg: '#13131F',
                            card: '#1E1E2F',
                            cardHover: '#27293d',
                            primary: '#9E4B8A',
                            secondary: '#4C2A59',
                            accent: '#FF7F50',
                            success: '#00F090',
                            info: '#3B82F6'
                        }
                    },
                    fontFamily: {
                        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
                        mono: ['JetBrains Mono', 'monospace']
                    },
                    boxShadow: {
                        mui: '0 10px 30px rgba(0,0,0,0.25)',
                        muiSm: '0 6px 18px rgba(0,0,0,0.18)'
                    }
                }
            }
        };
