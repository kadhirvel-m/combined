// Extracted from ui/youtube-notes.html (inline <script> #1).
        const root = document.documentElement;
        const themeKey = 'px_theme';
        const statusPalette = {
            dark: { info: '#94a3b8', success: '#67e8f9', error: '#fb7185' },
            light: { info: '#475569', success: '#0f766e', error: '#dc2626' }
        };

        // Ensure content never hides under the fixed header
        function applyHeaderOffset() {
            const headerEl = document.querySelector('header');
            const mainEl = document.querySelector('main');
            if (!headerEl || !mainEl) return;
            const h = headerEl.offsetHeight || 80;
            root.style.setProperty('--header-h', `${h}px`);
            root.style.setProperty('--sticky-top', `calc(${h}px + var(--header-gap))`);
            // Use margin-top to push content below fixed header
            mainEl.style.marginTop = `calc(${h}px + var(--header-gap))`;
        }
        window.addEventListener('load', applyHeaderOffset);
        window.addEventListener('resize', () => { requestAnimationFrame(applyHeaderOffset); });

        const apiBase = (() => {
            const manual = document.body.dataset.apiBase ? document.body.dataset.apiBase.trim() : '';
            if (manual) return manual.replace(/\/$/, '');
            if (location.protocol === 'file:') return 'http://0.0.0.0:10000';
            if (/:(5500|5501)$/i.test(location.origin)) return location.origin.replace(/:(5500|5501)$/i, ':8000');
            return location.origin;
        })();

        function resolveMediaUrl(url) {
            if (!url) return '';
            if (/^https?:\/\//i.test(url)) return url;
            if (url.startsWith('//')) return `${location.protocol}${url}`;
            const base = apiBase.replace(/\/$/, '');
            return `${base}/${url.replace(/^\/+/, '')}`;
        }

        const params = new URLSearchParams(location.search);
        const videoUrl = params.get('video') || params.get('url') || '';

        const embedEl = document.getElementById('videoEmbed');
        const channelAvatarImg = document.getElementById('channelAvatar');
        const channelAvatarFallback = document.getElementById('channelAvatarFallback');
        const channelNameEl = document.getElementById('channelName');
        const uploadDateEl = document.getElementById('uploadDate');
        const viewCountEl = document.getElementById('viewCount');
        const notesRenderedEl = document.getElementById('notesRendered');
        const notesLoaderEl = document.getElementById('notesLoader');
        const notesScrollEl = document.getElementById('notesScroll');
        const notesCopyBtn = document.getElementById('notesCopyBtn');
        const notesStatusEl = document.getElementById('notesStatus');
        const openOnYoutubeEl = document.getElementById('openOnYoutube');

        let lastStatus = { message: '', tone: 'info' };
        let notesAbortController = null;

        const themeButtons = () => Array.from(document.querySelectorAll('[data-theme-toggle]'));

        function applyTheme(mode) {
            const resolved = mode === 'light' ? 'light' : 'dark';
            document.body.dataset.theme = resolved;
            root.classList.toggle('dark', resolved === 'dark');
            try { localStorage.setItem(themeKey, resolved); } catch { }
            themeButtons().forEach(btn => {
                const icon = btn.querySelector('.material-symbols-rounded');
                if (icon) icon.textContent = resolved === 'dark' ? 'light_mode' : 'dark_mode';
            });
            if (lastStatus.message) setStatus(lastStatus.message, lastStatus.tone, true);
        }

        function initTheme() {
            let start = 'dark';
            try {
                const stored = localStorage.getItem(themeKey);
                if (stored === 'light' || stored === 'dark') start = stored;
                else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) start = 'light';
            } catch { }
            applyTheme(start);
        }

        themeButtons().forEach(btn => btn.addEventListener('click', () => applyTheme(document.body.dataset.theme === 'dark' ? 'light' : 'dark')));
        initTheme();

        function toneColor(tone) {
            const theme = document.body.dataset.theme === 'light' ? 'light' : 'dark';
            return (statusPalette[theme] && statusPalette[theme][tone]) || statusPalette[theme].info;
        }

        function setStatus(message, tone = 'info', skipStore = false) {
            if (!notesStatusEl) return;
            notesStatusEl.textContent = message;
            notesStatusEl.style.color = toneColor(tone);
            if (!skipStore) lastStatus = { message, tone };
        }

        function showLoader() {
            if (notesLoaderEl) notesLoaderEl.style.display = 'flex';
            if (notesScrollEl) notesScrollEl.classList.add('loading');
        }

        function hideLoader() {
            if (notesLoaderEl) notesLoaderEl.style.display = 'none';
            if (notesScrollEl) notesScrollEl.classList.remove('loading');
        }

        function formatViews(n) {
            if (typeof n !== 'number' || !isFinite(n)) return 'N/A';
            if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
            if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
            return n.toLocaleString();
        }

        async function fetchJson(url, options) {
            const response = await fetch(url, options);
            if (!response.ok) {
                let text = response.statusText || 'Request failed';
                try {
                    const detail = await response.json();
                    text = detail.detail || detail.error || text;
                } catch { }
                throw new Error(text);
            }
            return response.json();
        }

        async function fetchMeta(video) {
            return fetchJson(`${apiBase}/api/transcripts/meta`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: video })
            });
        }

        async function fetchSavedNotes(videoId) {
            if (!videoId) return null;
            try {
                const res = await fetch(`${apiBase}/api/transcripts/saved/${encodeURIComponent(videoId)}`);
                if (res.status === 404) return null;
                if (!res.ok) {
                    let msg = res.statusText || 'Failed to load saved notes';
                    try {
                        const detail = await res.json();
                        msg = detail.detail || detail.error || msg;
                    } catch { }
                    throw new Error(msg);
                }
                return res.json();
            } catch (err) {
                console.warn('Saved notes lookup failed:', err);
                return null;
            }
        }

        function renderMarkdown(content) {
            const html = (window.marked && window.DOMPurify) ? DOMPurify.sanitize(marked.parse(content)) : (content || '').replace(/\\n/g, '<br/>');
            notesRenderedEl.innerHTML = html;
        }

        async function generateNotes(video) {
            try { if (notesAbortController) notesAbortController.abort(); } catch { }
            notesAbortController = new AbortController();
            setStatus('Composing structured notes with TuneAI...', 'info');
            notesRenderedEl.innerHTML = '';
            showLoader();
            const data = await fetchJson(`${apiBase}/api/transcripts/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: video, lang: 'en', fallback_ytdlp: true, clean: true }),
                signal: notesAbortController.signal
            });
            const md = data.notes_markdown || '';
            if (!md.trim()) {
                setStatus('TuneAI returned empty notes. Try again later.', 'error');
                hideLoader();
                return;
            }
            renderMarkdown(md);
            const origin = data.model ? 'Notes crafted with TuneAI.' : 'Notes crafted with TuneAI.';
            setStatus(data.truncated ? `${origin} Transcript was partially processed.` : origin, 'success');
            hideLoader();
            notesAbortController = null;
        }

        async function boot() {
            if (!videoUrl) {
                setStatus('No URL provided. Please go back and choose a video.', 'error');
                return;
            }

            if (openOnYoutubeEl) openOnYoutubeEl.href = videoUrl;

            try {
                showLoader();
                setStatus('Fetching video details...', 'info');
                const meta = await fetchMeta(videoUrl);

                if (embedEl) {
                    const embed = meta.embed_url || '';
                    embedEl.src = embed ? `${embed}?rel=0&modestbranding=1` : '';
                }
                if (channelNameEl) channelNameEl.textContent = meta.channel_name || 'YouTube';
                if (uploadDateEl) {
                    const d = meta.upload_date ? new Date(meta.upload_date) : null;
                    uploadDateEl.textContent = d ? d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';
                }
                if (viewCountEl) viewCountEl.textContent = meta.views != null ? `${formatViews(meta.views)} views` : 'N/A';

                const initial = (meta.channel_name || 'Y').trim().charAt(0).toUpperCase();
                if (channelAvatarFallback) channelAvatarFallback.textContent = initial || 'Y';

                const avatarRaw = meta.channel_logo || meta.channel_thumbnail || meta.channel_avatar || meta.channel_image || '';
                const avatar = resolveMediaUrl(avatarRaw);
                if (avatar && channelAvatarImg) {
                    const showAvatar = () => {
                        channelAvatarImg.classList.remove('hidden');
                        channelAvatarFallback?.classList.add('hidden');
                    };
                    const showFallback = () => {
                        channelAvatarImg.classList.add('hidden');
                        channelAvatarImg.removeAttribute('src');
                        channelAvatarFallback?.classList.remove('hidden');
                    };
                    channelAvatarImg.onload = null;
                    channelAvatarImg.onerror = null;
                    channelAvatarImg.onload = showAvatar;
                    channelAvatarImg.onerror = showFallback;
                    channelAvatarImg.src = avatar;
                    // If the image is cached, onload may not fire
                    if (channelAvatarImg.complete && channelAvatarImg.naturalWidth > 0) {
                        showAvatar();
                    }
                } else if (channelAvatarImg) {
                    channelAvatarImg.classList.add('hidden');
                    channelAvatarImg.removeAttribute('src');
                    channelAvatarFallback.classList.remove('hidden');
                }

                if (meta.video_id) {
                    setStatus('Checking for saved notes...', 'info');
                    const saved = await fetchSavedNotes(meta.video_id);
                    if (saved && saved.notes_markdown && saved.notes_markdown.trim()) {
                        renderMarkdown(saved.notes_markdown);
                        const msg = saved.model ? `Loaded saved notes.` : 'Loaded saved notes.';
                        setStatus(msg, 'success');
                        hideLoader();
                        return;
                    }
                }
            } catch (err) {
                setStatus(`Video details failed: ${err.message || err}`, 'error');
            }

            try {
                await generateNotes(videoUrl);
            } catch (err) {
                setStatus(err.message || String(err), 'error');
                hideLoader();
            }
        }

        notesCopyBtn?.addEventListener('click', async () => {
            const text = notesRenderedEl?.innerText?.trim() || '';
            if (!text) {
                setStatus('Nothing to copy yet.', 'info');
                return;
            }
            try {
                await navigator.clipboard.writeText(text);
                setStatus('Structured notes copied to clipboard.', 'success');
            } catch {
                setStatus('Clipboard is unavailable in this browser.', 'error');
            }
        });

        boot();
