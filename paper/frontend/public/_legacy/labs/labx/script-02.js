// Extracted from ui/labs/labx.html (inline <script> #2).
        // State
        let generatedHTML = '';
        let currentTopic = '';
        let isGenerating = false;
        let showingRaw = false;
        let wasCached = false;

        // DOM
        const topicInput = document.getElementById('topicInput');
        const generateBtn = document.getElementById('generateBtn');
        const btnText = document.getElementById('btnText');
        const btnSpinner = document.getElementById('btnSpinner');
        const statusText = document.getElementById('statusText');
        const resultsSection = document.getElementById('resultsSection');
        const generatedTopicEl = document.getElementById('generatedTopic');
        const previewFrame = document.getElementById('previewFrame');
        const previewContainer = document.getElementById('previewContainer');
        const rawContainer = document.getElementById('rawContainer');
        const rawHTML = document.getElementById('rawHTML');
        const rawToggleText = document.getElementById('rawToggleText');
        const cacheBadge = document.getElementById('cacheBadge');
        const genTimeEl = document.getElementById('genTime');
        const viewCountEl = document.getElementById('viewCount');
        const cachedTopicsSection = document.getElementById('cachedTopicsSection');
        const cachedTopicsList = document.getElementById('cachedTopicsList');

        // API
        const API_BASE = typeof APP_CONFIG !== 'undefined' ? APP_CONFIG.API_BASE_URL : 'http://0.0.0.0:10000';

        function setTopic(topic) { topicInput.value = topic; topicInput.focus(); }

        function setLoading(loading) {
            isGenerating = loading;
            generateBtn.disabled = loading;
            if (loading) {
                btnText.textContent = 'Generating...';
                btnSpinner.classList.remove('hidden');
                statusText.textContent = 'Checking cache...';
            } else {
                btnText.textContent = 'Generate Explanation';
                btnSpinner.classList.add('hidden');
            }
        }

        function setStatus(message, isError = false) {
            statusText.textContent = message;
            statusText.style.color = isError ? '#dc2626' : 'var(--text-sub)';
        }

        function formatTime(ms) {
            if (!ms) return '-';
            if (ms < 1000) return `${ms}ms`;
            return `${(ms / 1000).toFixed(1)}s`;
        }

        async function generateExplanation(forceRegenerate = false) {
            const topic = topicInput.value.trim();
            if (!topic) { setStatus('Please enter a topic', true); topicInput.focus(); return; }
            if (isGenerating) return;

            setLoading(true);
            resultsSection.classList.add('hidden');

            try {
                const response = await fetch(`${API_BASE}/api/labx/generate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ topic, force_regenerate: forceRegenerate })
                });

                if (!response.ok) {
                    const error = await response.json().catch(() => ({}));
                    throw new Error(error.detail || `HTTP ${response.status}`);
                }

                const data = await response.json();

                if (data.success && data.html) {
                    generatedHTML = data.html;
                    currentTopic = data.topic;
                    wasCached = data.cached;
                    displayResult(data);
                    setStatus(data.cached ? '⚡ Loaded from cache instantly!' : '✅ Generated and saved!');
                    loadCachedTopics(); // Refresh list
                } else {
                    throw new Error('Invalid response');
                }
            } catch (error) {
                console.error('Generation error:', error);
                setStatus(`Error: ${error.message}`, true);
            } finally {
                setLoading(false);
            }
        }

        async function regenerateExplanation() {
            if (!currentTopic) return;
            topicInput.value = currentTopic;
            setStatus('🔄 Force regenerating...');
            await generateExplanation(true);
        }

        function displayResult(data) {
            generatedTopicEl.textContent = data.topic;

            // Cache badge
            if (data.cached) {
                cacheBadge.className = 'cache-badge cached';
                cacheBadge.innerHTML = '<span class="material-symbols-rounded text-sm">bolt</span> Cached';
            } else {
                cacheBadge.className = 'cache-badge generated';
                cacheBadge.innerHTML = '<span class="material-symbols-rounded text-sm">auto_awesome</span> Fresh';
            }

            // Meta info
            genTimeEl.textContent = formatTime(data.generation_time_ms);
            viewCountEl.textContent = data.view_count || 1;

            // Write to iframe
            const doc = previewFrame.contentDocument || previewFrame.contentWindow.document;
            doc.open();
            doc.write(generatedHTML);
            doc.close();

            rawHTML.textContent = generatedHTML;

            resultsSection.classList.remove('hidden');
            gsap.from(resultsSection, { opacity: 0, y: 30, duration: 0.5, ease: 'power2.out' });
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        function downloadHTML() {
            if (!generatedHTML) return;
            const blob = new Blob([generatedHTML], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${currentTopic.toLowerCase().replace(/\s+/g, '-')}-explorable.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setStatus('Downloaded!');
        }

        function openInNewTab() {
            if (!generatedHTML) return;
            const blob = new Blob([generatedHTML], { type: 'text/html' });
            window.open(URL.createObjectURL(blob), '_blank');
        }

        async function copyHTML() {
            if (!generatedHTML) return;
            try {
                await navigator.clipboard.writeText(generatedHTML);
                setStatus('Copied!');
            } catch { setStatus('Copy failed', true); }
        }

        function toggleRawView() {
            showingRaw = !showingRaw;
            previewContainer.classList.toggle('hidden', showingRaw);
            rawContainer.classList.toggle('hidden', !showingRaw);
            rawToggleText.textContent = showingRaw ? 'Preview' : 'Code';
        }

        // Load cached topics
        async function loadCachedTopics() {
            try {
                const res = await fetch(`${API_BASE}/api/labx/list`);
                const data = await res.json();
                if (data.success && data.explanations && data.explanations.length > 0) {
                    cachedTopicsSection.classList.remove('hidden');
                    cachedTopicsList.innerHTML = data.explanations.slice(0, 10).map(e =>
                        `<button class="cached-topic-pill" onclick="setTopic('${e.topic.replace(/'/g, "\\'")}'); generateExplanation();">
                            <span class="material-symbols-rounded text-sm">bolt</span>
                            ${e.topic}
                        </button>`
                    ).join('');
                } else {
                    cachedTopicsSection.classList.add('hidden');
                }
            } catch (e) {
                console.log('Could not load cached topics:', e);
            }
        }

        // Theme toggle
        document.getElementById('themeToggle')?.addEventListener('click', () => {
            const isDark = document.documentElement.classList.toggle('dark');
            localStorage.setItem('px_theme', isDark ? 'dark' : 'light');
        });

        // Enter key
        topicInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !isGenerating) generateExplanation();
        });

        // Init
        loadCachedTopics();
        console.log('LabX Generator with caching initialized');
