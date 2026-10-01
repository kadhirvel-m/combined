// Extracted from ui/youtube-transcript.html (inline <script> #2).
        const themeToggle = document.getElementById('themeToggle');
        const themeIconSun = themeToggle ? themeToggle.querySelector('[data-icon="sun"]') : null;
        const themeIconMoon = themeToggle ? themeToggle.querySelector('[data-icon="moon"]') : null;
        function applyTheme(nextTheme) {
            const resolved = nextTheme === 'light' ? 'light' : 'dark';
            document.body.dataset.theme = resolved;
            document.documentElement.classList.toggle('dark', resolved === 'dark');
            try { localStorage.setItem('px_theme', resolved); } catch { }
            if (themeToggle) themeToggle.setAttribute('aria-pressed', resolved === 'dark' ? 'true' : 'false');
            if (themeIconSun && themeIconMoon) {
                themeIconSun.classList.toggle('hidden', resolved !== 'light');
                themeIconMoon.classList.toggle('hidden', resolved === 'light');
            }
        }
        let savedTheme = 'dark';
        try { const stored = localStorage.getItem('px_theme'); if (stored === 'light' || stored === 'dark') savedTheme = stored; } catch { }
        applyTheme(savedTheme);
        themeToggle?.addEventListener('click', () => applyTheme(document.body.dataset.theme === 'dark' ? 'light' : 'dark'));

        const form = document.getElementById('transcriptForm');
        const urlField = document.getElementById('ytUrl');
        form?.addEventListener('submit', (event) => {
            event.preventDefault();
            const url = (urlField?.value || '').trim();
            if (!url) return;
            window.location.href = `youtube-notes.html?url=${encodeURIComponent(url)}`;
        });
