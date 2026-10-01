// Extracted from ui/add_syllabus.html (inline <script> #2).
    // Hide auth buttons globally if present and token exists (defensive)
    (function () {
      const t = localStorage.getItem('px_token');
      if (!t) return;
      document.querySelectorAll('a[href="login.html"], a[href="signup.html"]').forEach(a => a.classList.add('hidden'));
    })();

    tailwind.config = { darkMode: 'class', theme: { extend: { fontFamily: { display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] }, colors: { brand: { 50: '#f0f7ff', 100: '#e0efff', 200: '#b9dbff', 300: '#8ac4ff', 400: '#59a9ff', 500: '#2b8cff', 600: '#116fe6', 700: '#0a57b4', 800: '#0b4890', 900: '#0d3a73' }, night: { 900: '#0a0c10', 800: '#0f131a', 700: '#141a22', 600: '#1a2230' } }, boxShadow: { glow: '0 0 0 1px rgba(59,130,246,.2), 0 8px 40px rgba(59,130,246,.15)', neon: '0 0 25px rgba(43,140,255,.35), 0 0 60px rgba(43,140,255,.25)' }, backgroundImage: { 'grid-radial': 'radial-gradient(circle at 20% 10%, rgba(43,140,255,.25), transparent 35%), radial-gradient(circle at 80% 20%, rgba(168,85,247,.2), transparent 35%), radial-gradient(circle at 50% 80%, rgba(16,185,129,.2), transparent 35%)' } } } }
