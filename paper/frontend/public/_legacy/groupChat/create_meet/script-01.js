// Extracted from ui/groupChat/create_meet.html (inline <script> #1).
        const API = (window.API_BASE || 'http://0.0.0.0:10000').replace(/\/$/, '');
        const token = localStorage.getItem('px_token');

        const el = id => document.getElementById(id);

        function showToast(message, icon = 'check_circle', duration = 3000) {
            const toast = el('toast');
            el('toastText').textContent = message;
            el('toastIcon').textContent = icon;
            toast.classList.remove('hidden');
            setTimeout(() => toast.classList.add('hidden'), duration);
        }

        function goToRoom(roomId) {
            const target = `group_chat.html?room=${encodeURIComponent(roomId)}`;
            window.location.href = target;
        }

        async function createRoom() {
            const createRoomBtn = el('createRoomBtn');
            createRoomBtn.disabled = true;
            const name = el('roomNameInput').value.trim() || 'Group Chat';

            try {
                const headers = { 'Content-Type': 'application/json' };
                if (token) headers['Authorization'] = `Bearer ${token}`;

                const res = await fetch(`${API}/api/group-chat/create`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ name })
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.detail || 'Failed to create room');

                goToRoom(data.room_id);
            } catch (err) {
                showToast(err.message || 'Failed to create room', 'error', 4000);
            } finally {
                createRoomBtn.disabled = false;
            }
        }

        async function joinRoomById(roomId) {
            const joinRoomBtn = el('joinRoomBtn');
            joinRoomBtn.disabled = true;
            try {
                if (!roomId) {
                    showToast('Enter a room ID', 'error');
                    return;
                }

                const res = await fetch(`${API}/api/group-chat/${encodeURIComponent(roomId)}`, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });

                if (!res.ok) {
                    let detail = 'Room not found';
                    try {
                        const body = await res.json();
                        detail = body.detail || detail;
                    } catch (_) { }

                    if (String(detail).toLowerCase().includes('ended')) {
                        showToast('This meeting has ended', 'call_end', 4000);
                    } else {
                        showToast(detail, 'error', 4000);
                    }
                    return;
                }

                goToRoom(roomId);
            } catch (err) {
                showToast('Failed to join room', 'error', 4000);
            } finally {
                joinRoomBtn.disabled = false;
            }
        }

        // Theme boot (match about.html), but also keep compatibility with pages using localStorage.theme
        (function () {
            const root = document.documentElement;
            const stored = localStorage.getItem('px_theme');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const initial = stored || (prefersDark ? 'dark' : 'light');

            const toggles = () => Array.from(document.querySelectorAll('[data-theme-toggle]'));
            const setIcon = (mode) => toggles().forEach(b => {
                const i = b.querySelector('.material-symbols-rounded');
                if (i) i.textContent = mode === 'dark' ? 'light_mode' : 'dark_mode';
            });
            const setTheme = (mode) => {
                mode === 'dark' ? root.classList.add('dark') : root.classList.remove('dark');
                localStorage.setItem('px_theme', mode);
                setIcon(mode);
                return mode;
            };

            window.Theme = { toggle: () => setTheme(root.classList.contains('dark') ? 'light' : 'dark') };
            setTheme(initial);
            document.addEventListener('click', e => {
                const t = e.target.closest('[data-theme-toggle]');
                if (!t) return;
                window.Theme.toggle();
            });
        })();

        // Prefill from URL if provided
        const params = new URLSearchParams(window.location.search);
        const roomParam = params.get('room');
        if (roomParam) {
            el('joinRoomInput').value = roomParam;
        }

        el('createRoomBtn').onclick = createRoom;
        el('joinRoomBtn').onclick = () => joinRoomById(el('joinRoomInput').value.trim());

        el('roomNameInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') el('createRoomBtn').click();
        });

        el('joinRoomInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') el('joinRoomBtn').click();
        });

        // Video Carousel
        (function () {
            const videos = document.querySelectorAll('.carousel-video');
            const dots = document.querySelectorAll('.carousel-dot');
            const prevBtn = el('prevVideo');
            const nextBtn = el('nextVideo');
            const titleEl = el('carouselTitle');
            const descEl = el('carouselDesc');

            if (!videos.length) return;

            const captions = [
                { title: 'Your meeting is safe', desc: 'No one can join a meeting unless invited' },
                { title: 'Connect from anywhere', desc: 'Join meetings seamlessly anytime' },
                { title: 'Collaborate in real-time', desc: 'Share screens, chat, and work together' }
            ];

            let currentIndex = 0;
            let autoPlayInterval;

            function showSlide(index) {
                // Update videos
                videos.forEach((video, i) => {
                    if (i === index) {
                        video.style.opacity = '1';
                        video.play().catch(() => { });
                    } else {
                        video.style.opacity = '0';
                        video.pause();
                    }
                });

                // Update dots
                dots.forEach((dot, i) => {
                    if (i === index) {
                        dot.classList.remove('bg-[#9E4B8A]/30');
                        dot.classList.add('bg-[#9E4B8A]', 'w-6');
                    } else {
                        dot.classList.add('bg-[#9E4B8A]/30');
                        dot.classList.remove('bg-[#9E4B8A]', 'w-6');
                    }
                });

                // Update captions
                if (captions[index]) {
                    titleEl.textContent = captions[index].title;
                    descEl.textContent = captions[index].desc;
                }

                currentIndex = index;
            }

            function nextSlide() {
                showSlide((currentIndex + 1) % videos.length);
            }

            function prevSlide() {
                showSlide((currentIndex - 1 + videos.length) % videos.length);
            }

            function startAutoPlay() {
                stopAutoPlay();
                autoPlayInterval = setInterval(nextSlide, 5000);
            }

            function stopAutoPlay() {
                if (autoPlayInterval) clearInterval(autoPlayInterval);
            }

            // Event listeners
            if (prevBtn) prevBtn.onclick = () => { prevSlide(); startAutoPlay(); };
            if (nextBtn) nextBtn.onclick = () => { nextSlide(); startAutoPlay(); };

            dots.forEach((dot, i) => {
                dot.onclick = () => { showSlide(i); startAutoPlay(); };
            });

            // Initialize
            showSlide(0);
            startAutoPlay();

            // Pause on hover
            const carousel = document.querySelector('.video-carousel-container');
            if (carousel) {
                carousel.addEventListener('mouseenter', stopAutoPlay);
                carousel.addEventListener('mouseleave', startAutoPlay);
            }
        })();
