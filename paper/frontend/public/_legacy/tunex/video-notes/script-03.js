// Extracted from ui/tunex/video-notes.html (inline <script> #3).
        const API_BASE = 'http://0.0.0.0:10000';

        // Parse video URL from query params
        function getVideoUrl() {
            const params = new URLSearchParams(window.location.search);
            return params.get('video') || '';
        }

        // Extract video ID from YouTube URL
        function extractVideoId(url) {
            if (!url) return null;
            const patterns = [
                /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
                /^([a-zA-Z0-9_-]{11})$/
            ];
            for (const pattern of patterns) {
                const match = url.match(pattern);
                if (match) return match[1];
            }
            return null;
        }

        // Initialize video player
        async function initVideoPlayer() {
            const videoUrl = getVideoUrl();
            const videoId = extractVideoId(videoUrl);

            if (!videoId) {
                document.getElementById('videoTitle').textContent = 'No video provided';
                return;
            }

            // Set embed URLs
            const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
            document.getElementById('videoEmbed').src = embedUrl;
            const mobileEmbed = document.getElementById('mobileVideoEmbed');
            if (mobileEmbed) mobileEmbed.src = embedUrl;

            // Set YouTube link
            const ytLink = document.getElementById('youtubeLink');
            if (ytLink) ytLink.href = `https://www.youtube.com/watch?v=${videoId}`;

            // Fetch video metadata
            try {
                const res = await fetch(`${API_BASE}/api/transcripts/meta`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: videoUrl })
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.channel_name) {
                        document.getElementById('channelName').textContent = data.channel_name;
                    }
                    if (data.views) {
                        document.getElementById('viewCount').textContent = formatViews(data.views) + ' views';
                    }
                    if (data.channel_logo) {
                        document.getElementById('channelLogo').src = data.channel_logo;
                    }
                }
            } catch (e) {
                console.warn('Could not fetch video metadata:', e);
            }

            // Set a basic title from the video ID for now
            document.getElementById('videoTitle').textContent = 'YouTube Video';
        }

        function formatViews(num) {
            if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
            if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
            return num.toString();
        }

        // Mobile video modal
        const mobileVideoBtn = document.getElementById('mobileVideoBtn');
        const mobileVideoModal = document.getElementById('mobileVideoModal');
        const closeMobileVideo = document.getElementById('closeMobileVideo');

        if (mobileVideoBtn && mobileVideoModal) {
            mobileVideoBtn.addEventListener('click', () => {
                mobileVideoModal.classList.remove('hidden');
                mobileVideoModal.classList.add('flex');
            });
            closeMobileVideo.addEventListener('click', () => {
                mobileVideoModal.classList.add('hidden');
                mobileVideoModal.classList.remove('flex');
            });
            mobileVideoModal.addEventListener('click', (e) => {
                if (e.target === mobileVideoModal) {
                    mobileVideoModal.classList.add('hidden');
                    mobileVideoModal.classList.remove('flex');
                }
            });
        }

        class NotebookApp {
            constructor() {
                this.cells = [];
                this.executionCounter = 1;
                this.activeCellIndex = 0;
                this.cellsContainer = document.getElementById('cells-container');

                this.init();
            }

            init() {
                // Create first cell
                this.createCell();

                // Button handlers
                document.getElementById('addCellBtn').addEventListener('click', () => this.createCell());
                document.getElementById('addMarkdownBtn').addEventListener('click', () => this.createCell(-1, 'markdown'));
                document.getElementById('runAllBtn').addEventListener('click', () => this.runAllCells());
                document.getElementById('clearBtn').addEventListener('click', () => this.clearAllOutputs());
                document.getElementById('themeBtn').addEventListener('click', () => Theme.toggle());
            }

            updateTheme(isDark) {
                this.cells.forEach(cell => {
                    if (cell.editor) {
                        cell.editor.setOption('theme', isDark ? 'material-darker' : 'eclipse');
                    }
                });
            }

            createCell(insertAfterIndex = -1, type = 'code') {
                const cellId = Date.now() + Math.random();
                const cell = {
                    id: cellId,
                    type,
                    editor: null,
                    markdownText: '',
                    markdownEditing: true,
                    output: '',
                    error: '',
                    isRunning: false,
                    executionCount: null
                };

                // Create cell HTML
                const cellEl = document.createElement('div');
                cellEl.id = `cell-${cellId}`;
                cellEl.className = 'notebook-cell rounded-xl overflow-hidden';

                if (type === 'markdown') {
                    cellEl.innerHTML = `
                        <div class="md-header flex items-center justify-between px-4 py-2" style="background: var(--surface-2); border-bottom: 1px solid var(--outline)">
                            <div class="md-meta flex items-center gap-3">
                                <span class="exec-counter">[*]</span>
                                <span class="pill px-2 py-0.5 rounded-full text-[10px] font-medium uppercase">Markdown</span>
                            </div>
                            <div class="md-actions flex items-center gap-1">
                                <button class="btn-icon w-7 h-7 rounded-lg flex items-center justify-center" data-action="toggle-md" title="Edit / Render">
                                    <i class="ri-check-line text-sm"></i>
                                </button>
                                <button class="btn-icon w-7 h-7 rounded-lg flex items-center justify-center" data-action="add">
                                    <i class="ri-add-line text-sm"></i>
                                </button>
                                <button class="btn-icon w-7 h-7 rounded-lg flex items-center justify-center hover:!text-red-500" data-action="delete">
                                    <i class="ri-delete-bin-6-line text-sm"></i>
                                </button>
                            </div>
                        </div>
                        <div class="markdown-area">
                            <textarea class="markdown-input" placeholder="Write markdown..." spellcheck="false"></textarea>
                            <div class="markdown-preview hidden"></div>
                        </div>
                    `;
                } else {
                    cellEl.innerHTML = `
                        <div class="flex items-center justify-between px-4 py-2" style="background: var(--surface-2); border-bottom: 1px solid var(--outline)">
                            <div class="flex items-center gap-3">
                                <span class="exec-counter">[*]</span>
                                <span class="pill px-2 py-0.5 rounded-full text-[10px] font-medium uppercase">Python</span>
                            </div>
                            <div class="flex items-center gap-1">
                                <button class="run-btn w-7 h-7 rounded-lg flex items-center justify-center" data-action="run">
                                    <i class="ri-play-fill text-sm"></i>
                                </button>
                                <button class="btn-icon w-7 h-7 rounded-lg flex items-center justify-center" data-action="add">
                                    <i class="ri-add-line text-sm"></i>
                                </button>
                                <button class="btn-icon w-7 h-7 rounded-lg flex items-center justify-center hover:!text-red-500" data-action="delete">
                                    <i class="ri-delete-bin-6-line text-sm"></i>
                                </button>
                            </div>
                        </div>
                        <div class="cm-container"></div>
                        <div class="output-area hidden">
                            <div class="px-4 py-3 font-mono text-sm">
                                <pre class="output-text whitespace-pre-wrap" style="color: var(--text)"></pre>
                                <pre class="error-text whitespace-pre-wrap text-red-500"></pre>
                            </div>
                        </div>
                    `;
                }

                // Insert into DOM
                if (insertAfterIndex >= 0 && insertAfterIndex < this.cells.length) {
                    const afterEl = document.getElementById(`cell-${this.cells[insertAfterIndex].id}`);
                    afterEl.after(cellEl);
                    this.cells.splice(insertAfterIndex + 1, 0, cell);
                    this.activeCellIndex = insertAfterIndex + 1;
                } else {
                    this.cellsContainer.appendChild(cellEl);
                    this.cells.push(cell);
                    this.activeCellIndex = this.cells.length - 1;
                }

                if (type === 'markdown') {
                    const input = cellEl.querySelector('.markdown-input');
                    const preview = cellEl.querySelector('.markdown-preview');
                    const toggleBtn = cellEl.querySelector('[data-action="toggle-md"]');

                    const setToggleIcon = () => {
                        if (!toggleBtn) return;
                        toggleBtn.innerHTML = cell.markdownEditing
                            ? '<i class="ri-check-line text-sm"></i>'
                            : '<i class="ri-edit-2-line text-sm"></i>';
                    };

                    const renderMarkdown = () => {
                        const value = input.value || '';
                        cell.markdownText = value;
                        if (value.trim().length === 0) {
                            preview.innerHTML = '<p style="color: var(--muted)">Empty markdown...</p>';
                        } else {
                            preview.innerHTML = marked.parse(value);
                        }
                    };

                    const showPreview = () => {
                        renderMarkdown();
                        input.classList.add('hidden');
                        preview.classList.remove('hidden');
                        cell.markdownEditing = false;
                        cellEl.classList.add('md-rendered');
                        setToggleIcon();
                    };

                    const showEditor = () => {
                        input.classList.remove('hidden');
                        preview.classList.add('hidden');
                        cell.markdownEditing = true;
                        cellEl.classList.remove('md-rendered');
                        setToggleIcon();
                        setTimeout(() => input.focus(), 0);
                    };

                    input.addEventListener('blur', () => {
                        if (input.value.trim().length > 0) showPreview();
                    });

                    input.addEventListener('keydown', (e) => {
                        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                            e.preventDefault();
                            showPreview();
                        }
                        if (e.shiftKey && e.key === 'Enter') {
                            e.preventDefault();
                            showPreview();
                            const currentIndex = this.cells.indexOf(cell);
                            if (currentIndex === this.cells.length - 1) {
                                this.createCell(currentIndex, 'code');
                            } else {
                                this.activeCellIndex = Math.min(this.cells.length - 1, currentIndex + 1);
                                this.updateActiveCellStyles();
                            }
                        }
                        if (e.key === 'Escape') {
                            e.preventDefault();
                            if (input.value.trim().length > 0) showPreview();
                        }
                    });

                    preview.addEventListener('dblclick', (e) => {
                        e.stopPropagation();
                        showEditor();
                    });

                    if (toggleBtn) {
                        toggleBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            if (cell.markdownEditing) {
                                showPreview();
                            } else {
                                showEditor();
                            }
                        });
                    }

                    renderMarkdown();
                    showEditor();
                } else {
                    // Create CodeMirror editor
                    const cmContainer = cellEl.querySelector('.cm-container');
                    const isDark = Theme.isDark();

                    cell.editor = CodeMirror(cmContainer, {
                        mode: 'python',
                        theme: isDark ? 'material-darker' : 'eclipse',
                        lineNumbers: true,
                        indentUnit: 4,
                        tabSize: 4,
                        indentWithTabs: false,
                        lineWrapping: true,
                        autoCloseBrackets: true,
                        matchBrackets: true,
                        viewportMargin: Infinity,
                        extraKeys: {
                            'Ctrl-Enter': () => this.runCell(this.cells.indexOf(cell)),
                            'Shift-Enter': () => {
                                this.runCell(this.cells.indexOf(cell));
                                this.createCell(this.cells.indexOf(cell));
                            },
                            'Tab': (cm) => {
                                if (cm.somethingSelected()) {
                                    cm.indentSelection('add');
                                } else {
                                    cm.replaceSelection('    ', 'end');
                                }
                            },
                            'Ctrl-Space': 'autocomplete',
                            'Backspace': function (cm) {
                                if (cm.somethingSelected()) return CodeMirror.Pass;
                                var cursor = cm.getCursor();
                                var line = cm.getLine(cursor.line);
                                var before = line.slice(0, cursor.ch);
                                if (/^\s+$/.test(before) && before.length % 4 === 0 && before.length > 0) {
                                    cm.replaceRange("", {
                                        line: cursor.line,
                                        ch: cursor.ch - 4
                                    }, cursor);
                                } else {
                                    return CodeMirror.Pass;
                                }
                            }
                        }
                    });

                    // Auto-grow editor
                    const autoGrow = () => {
                        const lineHeight = cell.editor.defaultTextHeight();
                        const lineCount = Math.max(1, cell.editor.lineCount());
                        const padding = 16;
                        const desired = (lineCount * lineHeight) + padding;
                        const maxHeight = 520;
                        const clamped = Math.min(maxHeight, desired);
                        cell.editor.setSize(null, clamped);
                    };

                    cell.editor.on('change', autoGrow);
                    setTimeout(() => {
                        autoGrow();
                        cell.editor.refresh();
                    }, 0);
                }

                // Cell click to activate
                cellEl.addEventListener('click', () => {
                    this.activeCellIndex = this.cells.indexOf(cell);
                    this.updateActiveCellStyles();
                });

                // Button handlers
                const runBtn = cellEl.querySelector('[data-action="run"]');
                if (runBtn) {
                    runBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.runCell(this.cells.indexOf(cell));
                    });
                }
                cellEl.querySelector('[data-action="add"]').addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.createCell(this.cells.indexOf(cell));
                });
                cellEl.querySelector('[data-action="delete"]').addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteCell(this.cells.indexOf(cell));
                });

                this.updateActiveCellStyles();

                // Focus the editor/input
                if (cell.type === 'markdown') {
                    const input = cellEl.querySelector('.markdown-input');
                    if (input) setTimeout(() => input.focus(), 50);
                } else if (cell.editor) {
                    setTimeout(() => cell.editor.focus(), 50);
                }

                return cell;
            }

            deleteCell(index) {
                if (this.cells.length <= 1) return;

                const cell = this.cells[index];
                const cellEl = document.getElementById(`cell-${cell.id}`);

                cellEl.remove();
                this.cells.splice(index, 1);

                if (this.activeCellIndex >= this.cells.length) {
                    this.activeCellIndex = this.cells.length - 1;
                }
                this.updateActiveCellStyles();
            }

            updateActiveCellStyles() {
                this.cells.forEach((cell, idx) => {
                    const el = document.getElementById(`cell-${cell.id}`);
                    if (el) {
                        el.classList.toggle('active', idx === this.activeCellIndex);
                    }
                });
            }

            updateCellUI(cell) {
                const cellEl = document.getElementById(`cell-${cell.id}`);
                if (!cellEl) return;

                const execCounter = cellEl.querySelector('.exec-counter');
                const runBtn = cellEl.querySelector('[data-action="run"]');
                const outputArea = cellEl.querySelector('.output-area');
                const outputText = cellEl.querySelector('.output-text');
                const errorText = cellEl.querySelector('.error-text');

                execCounter.textContent = `[${cell.executionCount || '*'}]`;

                if (cell.isRunning) {
                    runBtn.innerHTML = '<i class="ri-loader-4-line animate-spin text-sm"></i>';
                    cellEl.classList.add('running');
                } else {
                    runBtn.innerHTML = '<i class="ri-play-fill text-sm"></i>';
                    cellEl.classList.remove('running');
                }

                if (cell.output || cell.error) {
                    outputArea.classList.remove('hidden');
                    outputText.textContent = cell.output;
                    errorText.textContent = cell.error;
                } else {
                    outputArea.classList.add('hidden');
                }
            }

            async runCell(index) {
                const cell = this.cells[index];
                if (cell.type === 'markdown') return;
                const code = cell.editor.getValue();

                cell.isRunning = true;
                cell.output = '';
                cell.error = '';
                this.updateCellUI(cell);

                let codeToRun = "import sys\nimport os\n\n";

                if (index > 0) {
                    codeToRun += "_orig_stdout = sys.stdout\nsys.stdout = open(os.devnull, 'w')\n\n";
                    for (let i = 0; i < index; i++) {
                        if (this.cells[i].type === 'code' && this.cells[i].editor) {
                            codeToRun += this.cells[i].editor.getValue() + "\n\n";
                        }
                    }
                    codeToRun += "sys.stdout = _orig_stdout\n\n";
                }

                codeToRun += code;

                try {
                    const res = await fetch(`${API_BASE}/api/tunex/compiler/run`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ code: codeToRun })
                    });
                    const data = await res.json();
                    cell.output = data.output || '';
                    cell.error = data.error || '';
                    cell.executionCount = this.executionCounter++;
                } catch (e) {
                    cell.error = "Connection failed. Is the server running?";
                } finally {
                    cell.isRunning = false;
                    this.updateCellUI(cell);
                }
            }

            async runAllCells() {
                for (let i = 0; i < this.cells.length; i++) {
                    if (this.cells[i].type !== 'markdown') {
                        await this.runCell(i);
                    }
                }
            }

            clearAllOutputs() {
                this.cells.forEach(cell => {
                    cell.output = '';
                    cell.error = '';
                    cell.executionCount = null;
                    if (cell.type === 'code') {
                        this.updateCellUI(cell);
                    }
                });
                this.executionCounter = 1;
            }
        }

        // Initialize
        initVideoPlayer();
        window.notebookInstance = new NotebookApp();

        // Resizer functionality
        (function initResizer() {
            const resizer = document.getElementById('resizer');
            const sidebar = document.getElementById('videoSidebar');
            const main = document.getElementById('notebookMain');

            if (!resizer || !sidebar || !main) return;

            let isResizing = false;
            let startX = 0;
            let startWidth = 0;

            resizer.addEventListener('mousedown', (e) => {
                isResizing = true;
                startX = e.clientX;
                startWidth = sidebar.offsetWidth;
                resizer.classList.add('active');
                document.body.classList.add('resizing');
                e.preventDefault();
            });

            document.addEventListener('mousemove', (e) => {
                if (!isResizing) return;
                const delta = e.clientX - startX;
                let newWidth = startWidth + delta;
                // Enforce min/max constraints
                newWidth = Math.max(280, Math.min(600, newWidth));
                sidebar.style.width = newWidth + 'px';
            });

            document.addEventListener('mouseup', () => {
                if (isResizing) {
                    isResizing = false;
                    resizer.classList.remove('active');
                    document.body.classList.remove('resizing');
                    // Save preference to localStorage
                    localStorage.setItem('videoNotesWidth', sidebar.style.width);
                }
            });

            // Restore saved width
            const savedWidth = localStorage.getItem('videoNotesWidth');
            if (savedWidth) {
                sidebar.style.width = savedWidth;
            }
        })();
