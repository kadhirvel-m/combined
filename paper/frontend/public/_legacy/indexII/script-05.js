// Extracted from ui/indexII.html (inline <script> #5).
        (function () {
            const track = document.getElementById('logoTrack');
            if (!track) return;
            const viewport = document.getElementById('logoTicker');
            const SPEED = 60; // pixels per second
            let lastTs = 0;
            let offset = 0;
            // Duplicate children until total width >= 2 * viewport width for seamless loop
            const ensureFill = () => {
                const vpWidth = viewport.clientWidth;
                const groupWidth = track.scrollWidth;
                // clone until track width at least 2 * viewport width
                while (track.scrollWidth < vpWidth * 2) {
                    Array.from(track.children).forEach(child => {
                        const clone = child.cloneNode(true);
                        clone.setAttribute('aria-hidden', 'true');
                        track.appendChild(clone);
                    });
                }
            };
            ensureFill();
            const step = (ts) => {
                if (!lastTs) lastTs = ts;
                const dt = (ts - lastTs) / 1000; // seconds
                lastTs = ts;
                if (!track.dataset.paused) {
                    offset += SPEED * dt;
                    // When the first child is fully out of view, move it to end and adjust offset
                    let first = track.firstElementChild;
                    while (first) {
                        const firstWidth = first.getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap || 0);
                        if (offset >= firstWidth) {
                            offset -= firstWidth;
                            track.appendChild(first);
                            first = track.firstElementChild;
                            continue;
                        }
                        break;
                    }
                    track.style.transform = `translateX(${-offset}px)`;
                }
                requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
            // Pause on hover
            viewport.addEventListener('mouseenter', () => track.dataset.paused = 'true');
            viewport.addEventListener('mouseleave', () => { delete track.dataset.paused; });
            // Recalculate on resize
            let resizeTO;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTO);
                resizeTO = setTimeout(() => {
                    // Reset
                    offset = 0; track.style.transform = 'translateX(0)';
                    // Remove clones (keep only first logical set)
                    const originals = Array.from(track.children).slice(0, 4); // we know we started with 4 logos
                    track.innerHTML = '';
                    originals.forEach(el => track.appendChild(el));
                    ensureFill();
                }, 150);
            });
        })();
