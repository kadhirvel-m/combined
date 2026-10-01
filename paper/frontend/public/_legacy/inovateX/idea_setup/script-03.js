// Extracted from ui/inovateX/idea_setup.html (inline <script> #3).
        (() => {
            const token = localStorage.getItem('px_token');
            const refresh = localStorage.getItem('px_refresh_token');
            if (!token && !refresh) location.replace('../login.html?next=' + encodeURIComponent(location.pathname));
        })();
