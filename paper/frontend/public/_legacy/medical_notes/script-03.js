// Extracted from ui/medical_notes.html (inline <script> #3).
    // Require student login for Notes Generator.
    // If not logged in, redirect to login and return back to this page after login.
    (function () {
      try {
        var token = localStorage.getItem('px_token');
        var refresh = localStorage.getItem('px_refresh_token');
        if (!token && !refresh) {
          var next = encodeURIComponent(location.pathname + (location.search || ''));
          location.replace('login.html?next=' + next);
        }
      } catch (e) { }
    })();
