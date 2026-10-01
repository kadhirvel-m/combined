// Extracted from ui/print/shop/jobs.html (inline <script> #1).
      // Simple auth guard: require user session (px_token); otherwise redirect to login
      (function () {
        try {
          var token = localStorage.getItem('px_token');
          if (!token) {
            var next = encodeURIComponent(location.pathname + (location.search || ''));
            location.replace('login.html?next=' + next);
          }
        } catch (_) {
          location.replace('login.html');
        }
      })();
