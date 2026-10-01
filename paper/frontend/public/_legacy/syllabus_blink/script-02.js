// Extracted from ui/syllabus_blink.html (inline <script> #2).
        const API_BASE = (window.API_BASE || 'http://0.0.0.0:10000').replace(/\/$/, '');
        const $ = (id) => document.getElementById(id);
        function getToken() {
            const keys = ['px_token', 'teacherToken', 'userToken', 'sb-access-token', 'supabase.auth.token'];
            for (const key of keys) {
                try {
                    const val = localStorage.getItem(key);
                    if (val) return val;
                } catch { }
            }
            try {
                for (let i = 0; i < localStorage.length; i++) {
                    const name = localStorage.key(i);
                    if (/token/i.test(name || '')) {
                        const val = localStorage.getItem(name);
                        if (val && val.length > 10) return val;
                    }
                }
            } catch { }
            return null;
        }
        function authHeaders() { const t = getToken(); return t ? { Authorization: `Bearer ${t}` } : {}; }

        async function fetchJson(url, opts = {}) {
            try {
                const r = await fetch(url, opts);
                const data = await (r.ok ? r.json() : null);
                return { ok: r.ok, status: r.status, data };
            } catch (e) { return { ok: false, error: true }; }
        }

        function readQuery() {
            const p = new URLSearchParams(window.location.search);
            return {
                unitId: p.get('unit_id'),
                courseTitle: p.get('course_title') || '',
                unitTitle: p.get('unit_title') || ''
            };
        }

        let topics = [];
        let cursor = 0;

        function applyMeta(meta) {
            const title = (meta.courseTitle || '') + (meta.unitTitle ? ` • ${meta.unitTitle}` : '');
            if (title) document.title = `Blink – ${title} | Paper X`;
            if ($('pageTitle')) $('pageTitle').textContent = meta.unitTitle || 'Unit';
            if ($('unitLabel')) $('unitLabel').textContent = meta.unitTitle ? 'Unit' : '';
            if ($('unitTitle')) $('unitTitle').textContent = meta.unitTitle || 'Unit';
            if ($('courseTitle')) $('courseTitle').textContent = meta.courseTitle || '';
        }

        function renderState() {
            const total = topics.length;
            if (!total) {
                if ($('status')) $('status').textContent = 'No topics with images were found for this unit yet.';
                if ($('viewerShell')) $('viewerShell').classList.add('opacity-60');
                $('prevBtn').disabled = true;
                $('nextBtn').disabled = true;
                $('counterText').textContent = '0 / 0';
                $('topicTitle').textContent = '-';
                $('topicImage').classList.add('opacity-0');
                $('noImageFallback').classList.remove('hidden');
                return;
            }
            if (cursor < 0) cursor = 0;
            if (cursor >= total) cursor = total - 1;
            const item = topics[cursor];
            $('counterText').textContent = `${cursor + 1} / ${total}`;
            $('topicTitle').textContent = item.topic || '-';
            const img = $('topicImage');
            const fallback = $('noImageFallback');
            if (item.image_url) {
                img.src = item.image_url;
                img.onload = () => img.classList.add('opacity-100');
                img.onerror = () => { img.classList.add('opacity-0'); fallback.classList.remove('hidden'); };
                img.classList.remove('opacity-0');
                fallback.classList.add('hidden');
            } else {
                img.src = '';
                img.classList.add('opacity-0');
                fallback.classList.remove('hidden');
            }
            $('prevBtn').disabled = cursor === 0;
            $('nextBtn').disabled = cursor === total - 1;

            // Track Blink View
            if (window.Analytics) {
                window.Analytics.track('note_viewed', {
                    variant: 'cheatsheet',
                    topic: item.topic,
                    unit_id: readQuery().unitId
                });
            }
        }

        async function loadTopicsForUnit(unitId) {
            if (!unitId) {
                if ($('status')) $('status').textContent = 'Missing unit id.';
                return;
            }
            if (!getToken()) {
                if ($('status')) $('status').textContent = 'Please log in to view this content.';
                return;
            }

            // Fetch topics from syllabus_topics table
            const res = await fetchJson(`${API_BASE}/api/syllabus/units/${encodeURIComponent(unitId)}/topics`, { headers: authHeaders() });
            if (!res || !res.ok) {
                if ($('status')) $('status').textContent = 'Could not load topics for this unit. Please try again later.';
                return;
            }
            const rawTopics = Array.isArray(res.data) ? res.data : [];

            // Also fetch blink links from ai_notes table
            const topicNames = rawTopics.map(t => (t.topic || '').trim().toLowerCase().replace(/\s+/g, ' ')).filter(Boolean);
            let aiNotesBlinkMap = new Map();
            if (topicNames.length > 0) {
                try {
                    const topicsJsonParam = encodeURIComponent(JSON.stringify(Array.from(new Set(topicNames))));
                    const blinkRes = await fetchJson(`${API_BASE}/api/blink/links?topics_json=${topicsJsonParam}`, { headers: authHeaders() });
                    if (blinkRes.ok && blinkRes.data?.links) {
                        Object.entries(blinkRes.data.links).forEach(([key, link]) => {
                            aiNotesBlinkMap.set((key || '').trim().toLowerCase().replace(/\s+/g, ' '), link);
                        });
                    }
                } catch (err) {
                    console.warn('Failed to fetch ai_notes blink links:', err);
                }
            }

            // Merge: for each topic, use blink_link from ai_notes (preferred) OR image_url from syllabus_topics
            topics = rawTopics.map(t => {
                const topicKey = (t.topic || '').trim().toLowerCase().replace(/\s+/g, ' ');
                const aiNotesBlink = aiNotesBlinkMap.get(topicKey);
                // Prefer ai_notes.blink_link when present; otherwise fallback to syllabus_topics.image_url
                const imageUrl = (aiNotesBlink || '').trim() || (t.image_url || '').trim() || '';
                return {
                    ...t,
                    image_url: imageUrl
                };
            }).filter(t => (t.image_url || '').trim() !== '');

            cursor = 0;
            renderState();
        }

        function bindControls() {
            $('prevBtn').addEventListener('click', () => {
                if (cursor > 0) { cursor -= 1; renderState(); }
            });
            $('nextBtn').addEventListener('click', () => {
                if (cursor < topics.length - 1) { cursor += 1; renderState(); }
            });
            window.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') {
                    if (cursor > 0) { cursor -= 1; renderState(); }
                }
                if (e.key === 'ArrowRight') {
                    if (cursor < topics.length - 1) { cursor += 1; renderState(); }
                }
            });
        }

        (function init() {
            const meta = readQuery();
            applyMeta(meta);
            bindControls();
            loadTopicsForUnit(meta.unitId);
        })();
