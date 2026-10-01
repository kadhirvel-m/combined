// Extracted from ui/indexII.html (inline <script> #7).
        // Ripple effect (lightweight, material-inspired) applied to elements with [data-ripple]
        document.addEventListener('pointerdown', function (e) {
            const target = e.target.closest('[data-ripple]');
            if (!target) return;
            const rect = target.getBoundingClientRect();
            const ripple = document.createElement('span');
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            ripple.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;pointer-events:none;border-radius:9999px;background:radial-gradient(circle at center,rgba(255,255,255,0.55),rgba(255,255,255,0) 70%);opacity:0.8;transform:scale(.2);animation:pripple .9s ease-out;mix-blend:overlay;`;
            target.style.position = target.style.position || 'relative';
            target.appendChild(ripple);
            ripple.addEventListener('animationend', () => ripple.remove());
        });
        const style = document.createElement('style');
        style.textContent = `@keyframes pripple{to{opacity:0;transform:scale(1)}}`;
        document.head.appendChild(style);
