// Extracted from ui/projects/project.html (inline <script> #3).
    // Auth-aware navbar (avatar like index.html)
    (function () {
      try {
        const token = localStorage.getItem('px_token');
        if (!token) return;
        // Hide Sign in / Sign up (desktop + mobile menu links if present)
        document.querySelectorAll('a[href="../login.html"], a[href="signup.html"]').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('#mobileMenu a[href="login.html"], #mobileMenu a[href="signup.html"]').forEach(el => el.classList.add('hidden'));
        // Show avatar buttons
        const navProfile = document.getElementById('navProfile');
        const navProfileImg = document.getElementById('navProfileImg');
        const navProfileInitial = document.getElementById('navProfileInitial');
        const navProfileMobile = document.getElementById('navProfileMobile');
        const navProfileMobileImg = document.getElementById('navProfileMobileImg');
        const navProfileMobileInitial = document.getElementById('navProfileMobileInitial');
        if (navProfile) navProfile.classList.remove('hidden');
        if (navProfileMobile) navProfileMobile.classList.remove('hidden');
        const API_BASE = ((window.API_BASE || window.__API_BASE || 'http://0.0.0.0:10000')).replace(/\/$/, '');
        fetch(`${API_BASE}/api/profile`, { headers: { Authorization: `Bearer ${token}` } })
          .then(r => r.ok ? r.json() : null)
          .then(p => {
            if (!p) return;
            let initials = 'ME';
            if (p.name) initials = p.name.split(' ').filter(Boolean).map(s => s[0]?.toUpperCase()).slice(0, 2).join('');
            if (navProfileInitial) navProfileInitial.textContent = initials;
            if (navProfileMobileInitial) navProfileMobileInitial.textContent = initials;
            if (p.profile_image_url) {
              if (navProfileImg) { navProfileImg.src = p.profile_image_url; navProfileImg.classList.remove('hidden'); if (navProfileInitial) navProfileInitial.classList.add('hidden'); }
              if (navProfileMobileImg) { navProfileMobileImg.src = p.profile_image_url; navProfileMobileImg.classList.remove('hidden'); if (navProfileMobileInitial) navProfileMobileInitial.classList.add('hidden'); }
            }
          }).catch(() => { });
      } catch (_) { }
    })();
