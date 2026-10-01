// Extracted from ui/indexII.html (inline <script> #2).
        // Enhanced Project Portal dropdown logic with accessibility & keyboard navigation
        (function () {
            const wrap = document.getElementById('navProjectsWrap');
            if (!wrap) return;
            const btn = document.getElementById('navProjectsBtn');
            const menu = document.getElementById('navProjectsMenu');
            const caret = btn && btn.querySelector('[data-projects-caret]');
            const items = () => Array.from(menu.querySelectorAll('[data-menu-item]'));
            let open = false;
            let closeTimer = null;

            function applyState() {
                if (open) {
                    menu.setAttribute('data-open', 'true');
                    btn.setAttribute('aria-expanded', 'true');
                    wrap.dataset.open = 'true';
                    if (caret) caret.textContent = 'expand_less';
                    // focus first item after short delay to allow transition
                    setTimeout(() => { items()[0]?.focus(); }, 60);
                } else {
                    menu.removeAttribute('data-open');
                    btn.setAttribute('aria-expanded', 'false');
                    wrap.dataset.open = 'false';
                    if (caret) caret.textContent = 'expand_more';
                }
            }

            function setState(next) {
                if (next === open) return;
                open = next;
                applyState();
            }

            function toggle() { setState(!open); }
            function close() { setState(false); }

            btn?.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); toggle(); });

            // Hover intent (desktop) for quick reveal
            wrap.addEventListener('mouseenter', () => { if (window.matchMedia('(min-width: 1024px)').matches) setState(true); });
            wrap.addEventListener('mouseleave', () => { if (window.matchMedia('(min-width: 1024px)').matches) closeTimer = setTimeout(close, 120); });
            wrap.addEventListener('mousemove', () => { if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; } });

            document.addEventListener('click', (e) => {
                if (!open) return;
                if (!wrap.contains(e.target)) close();
            });

            document.addEventListener('keydown', (e) => {
                if (!open && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) {
                    if (document.activeElement === btn) {
                        e.preventDefault();
                        setState(true);
                        return;
                    }
                }
                if (e.key === 'Escape' && open) {
                    e.stopPropagation();
                    close();
                    btn.focus();
                }
                if (open) {
                    const list = items();
                    const currentIndex = list.indexOf(document.activeElement);
                    if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        const next = currentIndex < 0 ? 0 : (currentIndex + 1) % list.length;
                        list[next].focus();
                    } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        const prev = currentIndex < 0 ? list.length - 1 : (currentIndex - 1 + list.length) % list.length;
                        list[prev].focus();
                    } else if (e.key === 'Home') {
                        e.preventDefault(); list[0]?.focus();
                    } else if (e.key === 'End') {
                        e.preventDefault(); list[list.length - 1]?.focus();
                    }
                }
            });

            // Initial state attributes
            wrap.dataset.open = 'false';
            btn.setAttribute('aria-expanded', 'false');
            btn.setAttribute('aria-controls', 'navProjectsMenu');
        })();
