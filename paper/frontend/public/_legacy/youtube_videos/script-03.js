// Extracted from ui/youtube_videos.html (inline <script> #3).
        // API base
        let __defaultBase = 'http://0.0.0.0:10000';
        if (/^https?:/i.test(window.location.origin)) {
            const host = window.location.host;
            if (/localhost:5500|127\.0\.0\.1:5500/.test(host)) {
                __defaultBase = 'http://0.0.0.0:10000';
            } else {
                __defaultBase = window.location.origin;
            }
        }
        const apiBase = (window.API_BASE || __defaultBase).replace(/\/$/, '');

        // Elements
        const $searchInput = document.getElementById('searchInput');
        const $searchBtn = document.getElementById('searchBtn');
        const $resultsSection = document.getElementById('resultsSection');
        const $loadingSection = document.getElementById('loadingSection');
        const $emptySection = document.getElementById('emptySection');
        const $videoCarousel = document.getElementById('videoCarousel');
        const $searchQuery = document.getElementById('searchQuery');
        const $resultsCount = document.getElementById('resultsCount');
        const $snack = document.getElementById('snack');
        const $themeBtn = document.getElementById('themeBtn');
        const fallbackChannelLogo = 'https://www.youtube.com/s/desktop/94838207/img/favicon_144x144.png';
        const channelLogoCache = new Map();

        function getChannelLogoAsync(channelPage) {
            if (!channelPage || typeof channelPage !== 'string') {
                return Promise.resolve('');
            }

            const cached = channelLogoCache.get(channelPage);
            if (cached !== undefined) {
                return cached instanceof Promise ? cached : Promise.resolve(cached);
            }

            const request = (async () => {
                try {
                    const response = await fetch(`${apiBase}/api/youtube/channel-logo?channel_url=${encodeURIComponent(channelPage)}`);
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`);
                    }
                    const data = await response.json();
                    const logo = typeof data.logo === 'string' ? data.logo.trim() : '';
                    channelLogoCache.set(channelPage, logo);
                    return logo;
                } catch (error) {
                    console.warn('Channel logo fetch failed', error);
                    channelLogoCache.set(channelPage, '');
                    return '';
                }
            })();

            channelLogoCache.set(channelPage, request);
            return request;
        }

        function hydrateChannelLogo(img, channelPage, shouldAttempt) {
            if (!img || !shouldAttempt) return;
            getChannelLogoAsync(channelPage)
                .then(logo => {
                    if (logo) {
                        img.src = logo;
                        img.dataset.logoLoaded = 'true';
                    }
                })
                .catch(() => { /* already logged in fetch helper */ });
        }

        // Theme toggle
        (function initTheme() {
            try {
                if (window.Theme && typeof window.Theme.init === 'function') window.Theme.init();
                const mode = (window.Theme && window.Theme.get && window.Theme.get()) || (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
                $themeBtn.textContent = mode === 'dark' ? 'Light' : 'Dark';
            } catch { }
            $themeBtn.addEventListener('click', () => {
                try {
                    const mode = (window.Theme && window.Theme.toggle && window.Theme.toggle()) || (document.documentElement.classList.toggle('dark'), document.documentElement.classList.contains('dark') ? 'dark' : 'light');
                    $themeBtn.textContent = mode === 'dark' ? 'Light' : 'Dark';
                } catch { }
            });
        })();

        // Ripple effect
        document.addEventListener('click', (e) => {
            const b = e.target.closest('.ripple');
            if (!b) return;
            const rect = b.getBoundingClientRect();
            const circle = document.createElement('span');
            circle.style.position = 'absolute';
            circle.style.left = `${e.clientX - rect.left}px`;
            circle.style.top = `${e.clientY - rect.top}px`;
            circle.style.width = circle.style.height = '0px';
            circle.style.borderRadius = '9999px';
            circle.style.background = 'currentColor';
            circle.style.opacity = '.12';
            circle.style.transform = 'translate(-50%,-50%)';
            circle.style.transition = 'width .5s ease, height .5s ease, opacity .8s ease';
            b.appendChild(circle);
            requestAnimationFrame(() => {
                circle.style.width = circle.style.height = Math.max(rect.width, rect.height) * 1.8 + 'px';
            });
            setTimeout(() => {
                circle.style.opacity = '0';
                setTimeout(() => circle.remove(), 300);
            }, 250);
        }, true);

        // Snackbar
        function snack(msg) {
            $snack.textContent = msg;
            $snack.classList.remove('hidden');
            setTimeout(() => $snack.classList.add('hidden'), 2000);
        }

        // Suggestion chips
        document.querySelectorAll('.suggestion-chip').forEach(chip => {
            chip.className = "suggestion-chip ripple px-3 py-1.5 text-xs rounded-full border hover:bg-[var(--brand-soft)] transition cursor-pointer";
            chip.style.borderColor = "var(--outline)";
            chip.addEventListener('click', () => {
                $searchInput.value = chip.dataset.query;
                performSearch();
            });
        });

        // Create video card
        function createVideoCard(video) {
            const card = document.createElement('div');
            card.className = 'carousel-item';

            // Normalize string fields for layout
            const titleText = typeof video.title === 'string' ? video.title.trim() : '';

            // Use channel logo if provided, otherwise fallback to the YouTube glyph
            const channelPage = typeof video.channel_page === 'string' ? video.channel_page.trim() : '';
            const logoIsDefault = Boolean(video.channel_logo_is_default);
            const channelLogo = (typeof video.channel_logo === 'string' && video.channel_logo.trim()) || fallbackChannelLogo;
            const safeLink = typeof video.link === 'string' ? video.link : '';
            const notesUrl = `./youtube-notes.html?video=${encodeURIComponent(safeLink)}`;

            card.innerHTML = `
        <a href="${notesUrl}" class="video-card block">
          <div class="video-thumbnail-wrapper">
            <img src="${video.thumbnail}" alt="${video.title}" class="video-thumbnail" loading="lazy">
            <div class="play-overlay">
              <div class="play-icon"></div>
            </div>
            ${video.duration ? `<div class="duration-badge">${video.duration}</div>` : ''}
          </div>
          <div class="p-4">
            <h3 class="font-semibold text-sm mb-2" style="display: block; max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${titleText}</h3>
            <div class="flex items-center justify-between gap-3 text-xs text-[var(--muted)]">
              <div class="flex items-center gap-2">
                <img src="${channelLogo}" alt="${video.channel}" class="channel-logo" loading="lazy" referrerpolicy="no-referrer">
                <span class="font-medium">${video.channel}</span>
              </div>
              ${video.views ? `
                <span class="flex items-center gap-1 whitespace-nowrap">
                  <span class="material-symbols-outlined text-sm">visibility</span>
                  ${video.views}
                </span>
              ` : ''}
            </div>
          </div>
        </a>
      `;

            const logoImg = card.querySelector('.channel-logo');
            if (logoImg) {
                logoImg.dataset.channelPage = channelPage;
                hydrateChannelLogo(logoImg, channelPage, logoIsDefault && !!channelPage);
            }

            return card;
        }

        // Perform search
        async function performSearch() {
            const query = $searchInput.value.trim();
            if (!query) {
                snack('Please enter a search term');
                return;
            }

            // Show loading state
            $resultsSection.classList.add('hidden');
            $emptySection.classList.add('hidden');
            $loadingSection.classList.remove('hidden');
            $searchBtn.disabled = true;

            try {
                const response = await fetch(`${apiBase}/api/youtube/search?query=${encodeURIComponent(query)}&num=12`);

                if (!response.ok) {
                    throw new Error('Search failed');
                }

                const videos = await response.json();

                $loadingSection.classList.add('hidden');

                if (videos.length === 0) {
                    $emptySection.classList.remove('hidden');
                    return;
                }

                // Display results
                $searchQuery.textContent = query;
                $resultsCount.textContent = videos.length;
                $videoCarousel.innerHTML = '';

                videos.forEach(video => {
                    const card = createVideoCard(video);
                    $videoCarousel.appendChild(card);
                });

                $resultsSection.classList.remove('hidden');

                // Scroll to results
                setTimeout(() => {
                    $resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);

            } catch (error) {
                console.error('Search error:', error);
                $loadingSection.classList.add('hidden');
                snack('Search failed. Please try again.');
            } finally {
                $searchBtn.disabled = false;
            }
        }

        // Search button click
        $searchBtn.addEventListener('click', performSearch);

        // Enter key in search input
        $searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });

        // Check for query parameter on load
        (function checkQueryParam() {
            const params = new URLSearchParams(window.location.search);
            const query = params.get('q');
            if (query) {
                $searchInput.value = query;
                performSearch();
            }
        })();
