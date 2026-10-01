// Extracted from ui/notes_search.html (inline <script> #2).
        (function () {
            var apiBase = (window.API_BASE || window.__API_BASE || 'http://0.0.0.0:10000').replace(/\/$/, '');

            var $input = document.getElementById('topicSearch');
            var $wrap = document.getElementById('suggestionsWrap');
            var $list = document.getElementById('suggestions');
            var $status = document.getElementById('status');
            var $form = document.getElementById('searchForm');
            var $clearBtn = document.getElementById('clearBtn');
            var $themeIcon = document.getElementById('themeIcon');

            var aborter = null;
            var activeIndex = -1;
            var currentItems = [];

            function escapeHtml(s) {
                return String(s || '').replace(/[&<>"']/g, function (c) {
                    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] || c;
                });
            }

            function debounce(fn, ms) {
                var t = null;
                return function () {
                    var args = arguments;
                    clearTimeout(t);
                    t = setTimeout(function () { fn.apply(null, args); }, ms);
                };
            }

            function hideSuggestions() {
                $wrap.classList.add('hidden');
                activeIndex = -1;
            }

            function syncThemeIcon() {
                if (!$themeIcon) return;
                var isDark = document.documentElement.classList.contains('dark');
                $themeIcon.textContent = isDark ? 'light_mode' : 'dark_mode';
            }

            // Theme toggle (keeps this page consistent with academicas/index)
            document.addEventListener('click', function (e) {
                var btn = e && e.target && e.target.closest ? e.target.closest('[data-theme-toggle]') : null;
                if (!btn) return;
                e.preventDefault();
                if (window.Theme && typeof window.Theme.toggle === 'function') {
                    window.Theme.toggle();
                } else if (typeof window.toggleTheme === 'function') {
                    window.toggleTheme();
                }
                syncThemeIcon();
            });

            function openNotesGenerator(topic, newWindow) {
                var url = 'notes_generator.html?topic=' + encodeURIComponent(topic);
                if (newWindow) {
                    // Browser may open a new tab depending on user settings.
                    window.open(url, '_blank', 'noopener,noreferrer');
                } else {
                    window.location.href = url;
                }
            }

            function showSuggestions() {
                if (currentItems.length) $wrap.classList.remove('hidden');
            }

            function setStatus(text) {
                $status.textContent = text || '';
            }

            function syncClearBtn() {
                if (!$clearBtn) return;
                var has = !!(($input.value || '').trim());
                $clearBtn.classList.toggle('hidden', !has);
            }

            function renderSuggestions(items) {
                currentItems = Array.isArray(items) ? items : [];
                activeIndex = -1;
                $list.innerHTML = '';

                if (!currentItems.length) {
                    hideSuggestions();
                    return;
                }

                currentItems.forEach(function (item, idx) {
                    var topic = (item && item.topic) ? item.topic : '';
                    var li = document.createElement('li');
                    li.className = 'suggestion-item px-4 py-3 cursor-pointer flex items-center justify-between gap-3 hover:bg-black/5 dark:hover:bg-white/5 transition';
                    li.setAttribute('role', 'option');
                    li.setAttribute('data-idx', String(idx));
                    li.innerHTML = '<div class="min-w-0 flex-1">' +
                        '<div class="text-sm md:text-base font-medium text-neutral-900 dark:text-white truncate">' + escapeHtml(topic) + '</div>' +
                        '<div class="mt-0.5 text-[11px] text-neutral-500 dark:text-white/50">AI notes</div>' +
                        '</div>' +
                        '<span class="material-symbols-rounded text-[18px] text-neutral-500 dark:text-white/55">open_in_new</span>';

                    li.addEventListener('mousedown', function (e) {
                        // mousedown so it triggers before input blur
                        e.preventDefault();
                        if (!topic) return;
                        hideSuggestions();
                        setStatus('Opening: ' + topic);
                        openNotesGenerator(topic, true);
                    });

                    $list.appendChild(li);
                });

                showSuggestions();
            }

            function chooseIndex(idx) {
                if (idx < 0 || idx >= currentItems.length) return;
                var topic = (currentItems[idx] && currentItems[idx].topic) ? currentItems[idx].topic : '';
                if (!topic) return;
                $input.value = topic;
                hideSuggestions();
                setStatus('Selected: ' + topic);
            }

            function updateActive(nextIndex) {
                var children = $list.querySelectorAll('.suggestion-item');
                if (!children.length) return;

                if (activeIndex >= 0 && activeIndex < children.length) {
                    children[activeIndex].setAttribute('aria-selected', 'false');
                }

                activeIndex = nextIndex;
                if (activeIndex < 0) activeIndex = 0;
                if (activeIndex >= children.length) activeIndex = children.length - 1;

                children[activeIndex].setAttribute('aria-selected', 'true');
                try { children[activeIndex].scrollIntoView({ block: 'nearest' }); } catch (_) { }
            }

            async function fetchSuggestions(q) {
                if (aborter) aborter.abort();
                aborter = new AbortController();

                var url = apiBase + '/api/notes/topics/search?q=' + encodeURIComponent(q) + '&limit=12';
                setStatus('Searching…');

                var res = await fetch(url, { signal: aborter.signal });
                if (!res.ok) {
                    var txt = '';
                    try { txt = await res.text(); } catch (_) { }
                    throw new Error('Search failed: ' + res.status + (txt ? (' — ' + txt) : ''));
                }
                var data = await res.json();
                return (data && data.items) ? data.items : [];
            }

            var onInput = debounce(async function () {
                var q = ($input.value || '').trim();
                if (!q) {
                    setStatus('');
                    renderSuggestions([]);
                    return;
                }

                try {
                    var items = await fetchSuggestions(q);
                    renderSuggestions(items);
                    setStatus(items.length ? ('Found ' + items.length + ' matches') : 'No matches');
                } catch (e) {
                    if (String(e && e.name) === 'AbortError') return;
                    console.error(e);
                    setStatus('Could not fetch topics.');
                    renderSuggestions([]);
                }
            }, 150);

            $input.addEventListener('input', onInput);

            $input.addEventListener('input', syncClearBtn);
            syncClearBtn();
            syncThemeIcon();

            if ($clearBtn) {
                $clearBtn.addEventListener('click', function () {
                    $input.value = '';
                    syncClearBtn();
                    setStatus('');
                    renderSuggestions([]);
                    $input.focus();
                });
            }

            $input.addEventListener('keydown', function (e) {
                if ($wrap.classList.contains('hidden')) return;

                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    updateActive(activeIndex + 1);
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    updateActive(activeIndex - 1);
                } else if (e.key === 'Enter') {
                    if (activeIndex >= 0 && currentItems.length) {
                        e.preventDefault();
                        chooseIndex(activeIndex);
                    }
                } else if (e.key === 'Escape') {
                    hideSuggestions();
                }
            });

            $input.addEventListener('blur', function () {
                // delay to allow click selection
                setTimeout(function () { hideSuggestions(); }, 120);
            });

            document.addEventListener('click', function (e) {
                if (!e.target) return;
                if (!$wrap.contains(e.target) && e.target !== $input) hideSuggestions();
            });

            $form.addEventListener('submit', function (e) {
                e.preventDefault();
                var topic = ($input.value || '').trim();
                if (!topic) {
                    $input.focus();
                    return;
                }
                openNotesGenerator(topic, false);
            });

            // Prefill from querystring if present
            try {
                var params = new URLSearchParams(location.search || '');
                var q0 = (params.get('q') || '').trim();
                if (q0) {
                    $input.value = q0;
                    onInput();
                    $input.focus();
                }
            } catch (_) { }
        })();
