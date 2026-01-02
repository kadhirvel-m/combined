/**
 * Theme Manager - Handles light/dark mode toggling with localStorage persistence
 */
const Theme = {
    STORAGE_KEY: 'theme',
    
    /**
     * Initialize theme based on localStorage or system preference
     */
    init() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            this.apply(saved);
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.apply(prefersDark ? 'dark' : 'light');
        }
    },
    
    /**
     * Apply the given theme
     * @param {string} theme - 'dark' or 'light'
     */
    apply(theme) {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
            root.classList.remove('light');
        } else {
            root.classList.remove('dark');
            root.classList.add('light');
        }
        localStorage.setItem(this.STORAGE_KEY, theme);
    },
    
    /**
     * Toggle between light and dark mode
     */
    toggle() {
        const isDark = document.documentElement.classList.contains('dark');
        this.apply(isDark ? 'light' : 'dark');
    },
    
    /**
     * Get current theme
     * @returns {string} 'dark' or 'light'
     */
    get() {
        return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
};

// Auto-initialize on script load
Theme.init();
