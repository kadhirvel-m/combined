// Extracted from ui/indexII.html (inline <script> #6).
        // Continuous testimonial marquee (independent of logos ticker)
        (function () {
            const track = document.getElementById('custTrack');
            const wrapper = document.getElementById('custMarquee');
            if (!track || !wrapper) return;
            const SPEED = 40; // px/sec
            const FILL_MULT = 2; // ensure width >= viewport * multiplier
            let baseSlides = Array.from(track.children);
            let offset = 0; let last = 0; let paused = false;

            function fill() {
                track.innerHTML = ''; baseSlides.forEach(s => track.appendChild(s));
                const need = wrapper.clientWidth * FILL_MULT;
                while (track.scrollWidth < need) {
                    baseSlides.forEach(s => { if (track.scrollWidth >= need) return; const clone = s.cloneNode(true); clone.setAttribute('aria-hidden', 'true'); track.appendChild(clone); });
                }
            }
            function recycle() {
                let first = track.firstElementChild;
                while (first) {
                    const w = first.getBoundingClientRect().width; // includes padding
                    if (offset >= w) { offset -= w; track.appendChild(first); first = track.firstElementChild; continue; }
                    break;
                }
            }
            function step(ts) { if (!last) last = ts; const dt = (ts - last) / 1000; last = ts; if (!paused) { offset += SPEED * dt; recycle(); track.style.transform = `translateX(${-offset}px)`; } requestAnimationFrame(step); }
            wrapper.addEventListener('mouseenter', () => paused = true);
            wrapper.addEventListener('mouseleave', () => paused = false);
            window.addEventListener('resize', () => { clearTimeout(fill._t); fill._t = setTimeout(() => { offset = 0; track.style.transform = 'translateX(0)'; fill(); }, 120); });
            fill(); requestAnimationFrame(step);
        })();
