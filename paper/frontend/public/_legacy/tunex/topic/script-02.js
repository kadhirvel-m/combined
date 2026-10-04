// Extracted from ui/tunex/topic.html (inline <script> #2).
        // NOTE: Some browsers/extensions inject SES/lockdown scripts that can interfere with
        // Alpine's `alpine:init` timing. Expose `topicApp()` globally so the page still boots.
        const API_BASE = 'http://0.0.0.0:10000';

        // ===== Related videos (ported from notes_generator.html) =====
        const apiBase = (window.API_BASE || API_BASE).replace(/\/$/, '');
        const fallbackChannelLogo = 'https://www.youtube.com/s/desktop/94838207/img/favicon_144x144.png';
        const channelLogoCache = new Map();

        let $relatedVideosSection = null;
        let $relatedVideosSummary = null;
        let $relatedVideosSkeleton = null;
        let $relatedVideosWrap = null;
        let $relatedVideosCarousel = null;
        let $relatedVideosEmpty = null;
        let $videoLanguage = null;

        function initRelatedVideoEls() {
            // Cache DOM lookups after the document is parsed.
            if ($relatedVideosSection) return;
            $relatedVideosSection = document.getElementById('relatedVideosSection');
            $relatedVideosSummary = document.getElementById('relatedVideosSummary');
            $relatedVideosSkeleton = document.getElementById('relatedVideosSkeleton');
            $relatedVideosWrap = document.getElementById('relatedVideosWrap');
            $relatedVideosCarousel = document.getElementById('relatedVideoCarousel');
            $relatedVideosEmpty = document.getElementById('relatedVideosEmpty');
            $videoLanguage = document.getElementById('videoLanguageSelect');
        }
        let relatedVideosAbort = null;
        let relatedVideosFullQuery = '';

        function normalizeVideoLanguage(language) {
            return (language || '').trim();
        }

        function inferCodingTrackKeyword(trackText) {
            // Avoid regex literals here to stay compatible with hardened JS environments.
            const raw = (trackText || '').trim();
            if (!raw) return '';
            const text = raw.toLowerCase();

            if (text.includes('python')) return 'python';
            if (text.includes('typescript') || text.includes(' ts ')) return 'typescript';
            if (text.includes('javascript') || text.includes(' js ')) return 'javascript';
            if (text.includes(' java ') || text.startsWith('java') || text.endsWith(' java')) return 'java';
            if (text.includes('c++') || text.includes('cpp')) return 'c++';
            if (text.includes('c#') || text.includes('c sharp') || text.includes('csharp')) return 'c#';
            if (text.includes(' golang') || text.includes('go ') || text.includes(' go') || text.includes('golang')) return 'go';
            if (text.includes('rust')) return 'rust';
            if (text.includes('kotlin')) return 'kotlin';
            if (text.includes('swift')) return 'swift';
            if (text.includes('dart')) return 'dart';
            if (text.includes('php')) return 'php';
            if (text.includes('ruby')) return 'ruby';
            if (text.includes('sql')) return 'sql';
            return '';
        }

        function buildRelatedVideosQuery(baseTopic, spokenLanguage, trackLanguage) {
            const topic = (baseTopic || '').trim();
            if (!topic) return '';

            const normalizedTrack = (trackLanguage || '').trim().toLowerCase();
            const spoken = normalizeVideoLanguage(spokenLanguage);

            let query = topic;

            // Coding track: "Variables & naming rules in python"
            if (normalizedTrack) {
                const trackSuffix = ` in ${normalizedTrack}`;
                if (!query.toLowerCase().endsWith(trackSuffix)) {
                    query = `${query}${trackSuffix}`;
                }
            }

            // Spoken language: keep as soft hint to avoid "in ... in ..."
            if (spoken && spoken.toLowerCase() !== 'english') {
                if (!query.toLowerCase().includes(spoken.toLowerCase())) {
                    query = `${query} ${spoken}`;
                }
            }

            return query;
        }

        function getChannelLogoAsync(channelPage) {
            if (!channelPage) return Promise.resolve('');
            const cached = channelLogoCache.get(channelPage);
            if (cached !== undefined) {
                return cached instanceof Promise ? cached : Promise.resolve(cached);
            }
            const request = (async () => {
                try {
                    const res = await fetch(`${apiBase}/api/youtube/channel-logo?channel_url=${encodeURIComponent(channelPage)}`);
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    const data = await res.json();
                    const logo = typeof data.logo === 'string' ? data.logo.trim() : '';
                    channelLogoCache.set(channelPage, logo);
                    return logo;
                } catch (error) {
                    console.warn('Channel logo lookup failed:', error);
                    channelLogoCache.set(channelPage, '');
                    return '';
                }
            })();
            channelLogoCache.set(channelPage, request);
            return request;
        }

        function hydrateChannelLogo(img, channelPage, shouldAttempt) {
            if (!img) return;
            if (channelPage) {
                img.dataset.channelPage = channelPage;
            }
            if (!shouldAttempt || !channelPage) {
                return;
            }
            getChannelLogoAsync(channelPage)
                .then((logo) => {
                    if (logo && img.dataset.channelPage === channelPage) {
                        img.src = logo;
                        img.dataset.logoLoaded = 'true';
                    }
                })
                .catch(() => { /* already logged */ });
        }

        function createRelatedVideoCard(video) {
            const card = document.createElement('div');
            const link = (typeof video.link === 'string' && video.link.trim()) || '';
            const notesUrl = link ? `video-notes.html?video=${encodeURIComponent(link)}` : '';
            card.className = 'yt-card';
            card.setAttribute('data-video-card', '1');

            const thumb = document.createElement('div');
            thumb.className = 'yt-thumb';
            const thumbImg = document.createElement('img');
            const videoId = typeof video.id === 'string' ? video.id.trim() : '';
            const thumbSrc = (typeof video.thumbnail === 'string' && video.thumbnail.trim())
                || (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '');
            thumbImg.src = thumbSrc || fallbackChannelLogo;
            thumbImg.alt = (video.title || 'YouTube video').toString();
            thumbImg.loading = 'lazy';
            thumbImg.decoding = 'async';
            thumb.appendChild(thumbImg);
            if (video.duration) {
                const badge = document.createElement('span');
                badge.className = 'yt-duration';
                badge.textContent = video.duration;
                thumb.appendChild(badge);
            }
            card.appendChild(thumb);

            const body = document.createElement('div');
            body.className = 'yt-body';

            const titleEl = document.createElement('p');
            titleEl.className = 'yt-title';
            const titleText = (typeof video.title === 'string' ? video.title : '').trim() || 'Untitled video';
            titleEl.textContent = titleText;
            titleEl.title = titleText;
            body.appendChild(titleEl);

            const meta = document.createElement('div');
            meta.className = 'yt-meta';

            const logoImg = document.createElement('img');
            logoImg.className = 'yt-channel-logo';
            logoImg.src = (typeof video.channel_logo === 'string' && video.channel_logo.trim()) || fallbackChannelLogo;
            logoImg.alt = (video.channel || 'Channel').toString();
            logoImg.loading = 'lazy';
            logoImg.referrerPolicy = 'no-referrer';
            meta.appendChild(logoImg);

            const channelName = document.createElement('span');
            channelName.className = 'yt-channel-name';
            const channelFull = (video.channel || 'YouTube').toString();
            channelName.textContent = channelFull;
            channelName.title = channelFull;
            meta.appendChild(channelName);

            if (video.views) {
                const views = document.createElement('span');
                views.className = 'yt-views';
                views.textContent = video.views;
                meta.appendChild(views);
            }

            body.appendChild(meta);
            card.appendChild(body);

            const channelPage = (typeof video.channel_page === 'string' ? video.channel_page : '').trim();
            const logoIsDefault = Boolean(video.channel_logo_is_default) || !video.channel_logo || video.channel_logo === fallbackChannelLogo;
            hydrateChannelLogo(logoImg, channelPage, logoIsDefault && !!channelPage);

            const overlay = document.createElement('div');
            overlay.className = 'yt-hover-overlay';

            const playBtn = document.createElement('button');
            playBtn.type = 'button';
            playBtn.className = 'yt-hover-btn';
            playBtn.setAttribute('aria-label', 'Play on YouTube');
            playBtn.title = 'Play on YouTube';
            const playIcon = document.createElement('span');
            playIcon.className = 'yt-hover-btn-icon';
            playIcon.textContent = 'play_arrow';
            playBtn.appendChild(playIcon);
            if (!link) {
                playBtn.disabled = true;
                playBtn.style.opacity = '0.6';
                playBtn.style.cursor = 'not-allowed';
            }
            playBtn.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                if (link) {
                    window.open(link, '_blank', 'noopener');
                }
            });

            const notesBtn = document.createElement('button');
            notesBtn.type = 'button';
            notesBtn.className = 'yt-hover-btn';
            notesBtn.setAttribute('aria-label', 'Open PaperX notes');
            notesBtn.title = 'Open PaperX notes';
            const notesIcon = document.createElement('span');
            notesIcon.className = 'yt-hover-btn-icon';
            notesIcon.textContent = 'description';
            notesBtn.appendChild(notesIcon);
            if (!notesUrl || notesUrl === '#') {
                notesBtn.disabled = true;
                notesBtn.style.opacity = '0.6';
                notesBtn.style.cursor = 'not-allowed';
            }
            notesBtn.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                if (notesUrl && notesUrl !== '#') {
                    window.open(notesUrl, '_blank', 'noopener');
                }
            });

            overlay.appendChild(playBtn);
            overlay.appendChild(notesBtn);
            thumb.appendChild(overlay);
            return card;
        }

        function renderRelatedVideos(videos, displayQuery) {
            initRelatedVideoEls();
            if (!$relatedVideosCarousel || !$relatedVideosWrap) return;
            $relatedVideosCarousel.innerHTML = '';
            const fragment = document.createDocumentFragment();
            videos.forEach(video => fragment.appendChild(createRelatedVideoCard(video)));
            $relatedVideosCarousel.appendChild(fragment);
            $relatedVideosSkeleton?.classList.add('hidden');
            $relatedVideosEmpty?.classList.add('hidden');
            $relatedVideosWrap.classList.remove('hidden');
            if ($relatedVideosSummary) {
                $relatedVideosSummary.textContent = `Showing for "${displayQuery}"`;
            }
        }

        async function loadRelatedVideos(topic, options = {}) {
            initRelatedVideoEls();
            const displayQuery = ((options.displayTopic ?? topic) || '').trim();
            const force = Boolean(options.force);
            const requestedLanguage = normalizeVideoLanguage(options.language || ($videoLanguage?.value || 'English'));
            const requestedTrackLanguage = ((options.trackLanguage || '').trim() || inferCodingTrackKeyword(options.trackTitle || ''));
            const searchQuery = buildRelatedVideosQuery(displayQuery, requestedLanguage, requestedTrackLanguage);

            if (!$relatedVideosSection) return;
            $relatedVideosSection.classList.remove('hidden');

            if (!displayQuery) {
                if ($relatedVideosSummary) $relatedVideosSummary.textContent = 'No topic selected yet.';
                if ($relatedVideosCarousel) $relatedVideosCarousel.innerHTML = '';
                $relatedVideosSkeleton?.classList.add('hidden');
                $relatedVideosWrap?.classList.add('hidden');
                if ($relatedVideosEmpty) {
                    $relatedVideosEmpty.textContent = 'Videos will appear once the topic loads.';
                    $relatedVideosEmpty.classList.remove('hidden');
                }
                return;
            }

            if (!force && relatedVideosFullQuery && relatedVideosFullQuery.toLowerCase() === searchQuery.toLowerCase()) {
                return;
            }
            relatedVideosFullQuery = searchQuery;

            if ($relatedVideosSummary) {
                $relatedVideosSummary.textContent = `Finding videos for "${displayQuery}"...`;
            }

            if (relatedVideosAbort) {
                relatedVideosAbort.abort();
            }
            relatedVideosAbort = typeof AbortController !== 'undefined' ? new AbortController() : null;

            $relatedVideosSkeleton?.classList.remove('hidden');
            $relatedVideosWrap?.classList.add('hidden');
            $relatedVideosEmpty?.classList.add('hidden');

            try {
                const fetchOptions = relatedVideosAbort ? { signal: relatedVideosAbort.signal } : undefined;
                const response = await fetch(`${apiBase}/api/youtube/search?query=${encodeURIComponent(searchQuery)}&num=8`, fetchOptions);
                if (!response.ok) {
                    throw new Error(`Search failed with status ${response.status}`);
                }
                const videos = await response.json();
                if (!Array.isArray(videos) || videos.length === 0) {
                    $relatedVideosSkeleton?.classList.add('hidden');
                    $relatedVideosWrap?.classList.add('hidden');
                    if ($relatedVideosEmpty) {
                        $relatedVideosEmpty.textContent = 'No related videos found. Try a more specific topic.';
                        $relatedVideosEmpty.classList.remove('hidden');
                    }
                    if ($relatedVideosSummary) {
                        $relatedVideosSummary.textContent = `No videos found for "${displayQuery}".`;
                    }
                    return;
                }
                renderRelatedVideos(videos.slice(0, 8), displayQuery);
            } catch (error) {
                if (error?.name === 'AbortError') return;
                console.error('Related videos error:', error);
                $relatedVideosSkeleton?.classList.add('hidden');
                $relatedVideosWrap?.classList.add('hidden');
                if ($relatedVideosEmpty) {
                    $relatedVideosEmpty.textContent = 'Unable to load videos right now.';
                    $relatedVideosEmpty.classList.remove('hidden');
                }
                if ($relatedVideosSummary) {
                    $relatedVideosSummary.textContent = `Unable to load videos for "${displayQuery}".`;
                }
            } finally {
                relatedVideosAbort = null;
            }
        }

        window.topicApp = function topicApp() {
            return {
                loading: true,
                regenerating: false,
                topicId: null,
                trackTitle: '',
                trackLanguage: '',
                topicTitle: '',
                topicDesc: '',
                chapters: [],

                // Related videos
                relatedVideosLanguage: 'English',

                // Navigation
                currentChapter: 'ch1',
                completedChapters: 0,
                progressPercent: 0,

                // Quiz
                currentQuizIndex: 0,
                selectedOption: null,
                quizAnswered: false,
                score: 0,
                quizCompleted: false,

                // Editors
                editors: {},
                outputs: {},
                errors: {},
                running: {},

                async init() {
                    console.log("TopicApp Initializing...");
                    const params = new URLSearchParams(window.location.search);
                    const id = params.get('id');

                    if (id) {
                        console.log("Found ID:", id);
                        this.topicId = id;
                        await this.loadTopic(id);
                    } else {
                        console.warn("No Topic ID found in URL");
                        alert("No Topic ID provided. Please return to the section page.");
                        this.loading = false;
                    }
                },

                async regenerateTopic() {
                    const id = this.topicId || new URLSearchParams(window.location.search).get('id');
                    if (!id) {
                        alert('No Topic ID found.');
                        return;
                    }
                    if (this.regenerating) return;

                    const ok = confirm('Regenerate this topic content? This will overwrite existing chapters for this topic.');
                    if (!ok) return;

                    this.regenerating = true;
                    try {
                        const res = await fetch(`${API_BASE}/api/tunex/topics/${id}/ai/ensure?force=true`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' }
                        });
                        if (!res.ok) {
                            let msg = `Regeneration failed (${res.status})`;
                            try {
                                const err = await res.json();
                                msg = err.detail || msg;
                            } catch { }
                            throw new Error(msg);
                        }

                        // Reset UI state that depends on chapter content.
                        this.loading = true;
                        this.chapters = [];
                        this.editors = {};
                        this.outputs = {};
                        this.errors = {};
                        this.running = {};
                        this.currentQuizIndex = 0;
                        this.selectedOption = null;
                        this.quizAnswered = false;
                        this.score = 0;
                        this.quizCompleted = false;

                        await this.loadTopic(id);
                    } catch (e) {
                        console.error('Regenerate error:', e);
                        alert(e.message || 'Regeneration failed');
                        this.loading = false;
                    } finally {
                        this.regenerating = false;
                    }
                },

                async loadTopic(id) {
                    try {
                        console.log("Fetching topic:", id);
                        const res = await fetch(`${API_BASE}/api/tunex/topics/${id}/full`);

                        if (!res.ok) {
                            const err = await res.json();
                            throw new Error(err.detail || "Topic not found");
                        }

                        const data = await res.json();
                        console.log("Topic Data Loaded:", data);

                        this.trackTitle = (data.track_title || data.level_title || data.section_title || '').trim();
                        this.trackLanguage = inferCodingTrackKeyword(data.language_name || this.trackTitle);
                        this.topicTitle = data.title;
                        this.topicDesc = data.description || '';
                        this.chapters = data.chapters || [];
                        this.loading = false;

                        // Load related videos for the current topic title
                        this.relatedVideosLanguage = (this.relatedVideosLanguage || ($videoLanguage?.value || 'English'));
                        setTimeout(() => {
                            loadRelatedVideos(this.topicTitle, {
                                force: true,
                                language: this.relatedVideosLanguage,
                                trackLanguage: this.trackLanguage,
                                displayTopic: this.topicTitle,
                                trackTitle: this.trackTitle,
                            });
                        }, 0);

                        setTimeout(() => this.initCodeMirrors(), 100);

                        if (this.chapters.length > 0) {
                            this.currentChapter = 'ch' + this.chapters[0].chapter_number;
                            this.updateProgress(this.chapters[0].chapter_number);
                        }

                    } catch (e) {
                        console.error("Load Error:", e);
                        alert(`Failed to load topic: ${e.message}`);
                        this.loading = false;
                    }
                },

                refreshRelatedVideos(force = true) {
                    loadRelatedVideos(this.topicTitle, {
                        force: !!force,
                        language: this.relatedVideosLanguage,
                        trackLanguage: this.trackLanguage,
                        displayTopic: this.topicTitle,
                        trackTitle: this.trackTitle,
                    });
                },

                initCodeMirrors() {
                    this.chapters.forEach(ch => {
                        const c = ch.content;
                        if (c.blocks && Array.isArray(c.blocks)) {
                            c.blocks.forEach(b => {
                                if (b.type === 'code' && b.id !== undefined) {
                                    this.createEditor(b.id, b.default_code);
                                }
                                // Carousel Support
                                if (b.type === 'carousel' && b.items) {
                                    b.items.forEach(item => {
                                        if (item.code_id) this.createEditor(item.code_id, item.default_code);
                                    });
                                }
                            });
                        }
                        // Legacy support
                        if (c.editor_id !== undefined && c.default_code) {
                            this.createEditor(c.editor_id, c.default_code);
                        }
                    });
                },

                createEditor(id, code) {
                    const el = document.getElementById('editor-' + id);
                    if (!el) return;
                    el.innerHTML = '';
                    const cm = CodeMirror(el, {
                        value: code,
                        mode: 'python',
                        theme: 'material-darker',
                        lineNumbers: true,
                        autoCloseBrackets: true,
                        matchBrackets: true,
                        viewportMargin: Infinity,
                        readOnly: false,
                        cursorBlinkRate: 530
                    });
                    this.editors[id] = cm;
                },

                async runCode(id) {
                    const code = this.editors[id].getValue();
                    this.running[id] = true;
                    this.outputs[id] = '';
                    this.errors[id] = '';

                    try {
                        const res = await fetch(`${API_BASE}/api/tunex/compiler/run`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ code })
                        });
                        const data = await res.json();
                        if (data.status === 'success') {
                            this.outputs[id] = data.output;
                        } else {
                            this.errors[id] = data.error;
                        }
                    } catch (e) {
                        this.errors[id] = "Network Error";
                    } finally {
                        this.running[id] = false;
                    }
                },

                numberToWord(n) {
                    const words = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
                    return words[n] || n;
                },

                openProblem(id) {
                    if (!id) return;
                    window.location.href = `solver.html?id=${id}`;
                },

                // Quiz Logic
                selectQuizOption(idx, question) {
                    if (this.quizAnswered) return;
                    this.selectedOption = idx;
                    this.quizAnswered = true;
                    if (idx === question.correct) {
                        this.score++;
                    }
                },
                nextQuiz(questions) {
                    if (this.currentQuizIndex < questions.length - 1) {
                        this.currentQuizIndex++;
                        this.selectedOption = null;
                        this.quizAnswered = false;
                    } else {
                        this.quizCompleted = true;
                    }
                },

                // Editor Utilities
                refreshEditor(id) {
                    setTimeout(() => {
                        if (this.editors[id]) {
                            this.editors[id].refresh();
                        }
                    }, 200);
                },

                scrollTo(id) {
                    const el = document.getElementById(id);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                },
                setCurrent(num) {
                    this.currentChapter = 'ch' + num;
                    this.updateProgress(num);
                },
                updateProgress(num) {
                    this.progressPercent = Math.round((num / (this.chapters.length || 1)) * 100);
                    this.completedChapters = num;
                },
                checkScroll(e) { },

                parseMarkdown(text) {
                    if (!text) return '';
                    try {
                        return marked.parse(text);
                    } catch (e) {
                        return text;
                    }
                },

                goBack() {
                    // Use browser history to go back to the section page
                    if (window.history.length > 1) {
                        window.history.back();
                    } else {
                        // Fallback: go to sections root
                        window.location.href = 'section.html';
                    }
                },

                // Syntax highlighting for static code
                highlightPython(code) {
                    if (!code) return '';
                    // First escape HTML entities
                    let escaped = code
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;');
                    // Then apply syntax highlighting
                    return escaped
                        .replace(/\b(for|in|if|else|elif|while|def|return|class|import|from|as|try|except|finally|with|break|continue|pass|and|or|not|is|True|False|None)\b/g, '<span class="kw">$1</span>')
                        .replace(/\b(print|range|len|enumerate|input|int|str|float|list|dict|set|tuple|type|abs|sum|max|min|open)\b/g, '<span class="fn">$1</span>')
                        .replace(/(&quot;[^&quot;]*&quot;|'[^']*')/g, '<span class="str">$1</span>')
                        .replace(/#.*/g, '<span class="cmt">$&</span>')
                        .replace(/\b(\d+)\b/g, '<span class="num">$1</span>')
                        .replace(/\n/g, '<br>');
                }
            };
        };

        document.addEventListener('alpine:init', () => {
            // Optional: keep Alpine.data registration for compatibility.
            if (window.Alpine && typeof window.topicApp === 'function') {
                window.Alpine.data('topicApp', window.topicApp);
            }
        });
