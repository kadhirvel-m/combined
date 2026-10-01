// Extracted from ui/ppt/index.html (inline <script> #3).
        const apiBase = (window.API_BASE || window.location.origin).replace(/\/$/, '');
        const token = localStorage.getItem('px_token');
        let currentOutlineSlides = [];
        let selectedComplexity = 'simple';

        // ═══ COMPLEXITY ═══
        function setComplexity(val, el) {
            selectedComplexity = val;
            const btn = el.closest ? el.closest('.complexity-btn') : el;
            document.querySelectorAll('.complexity-btn').forEach(b => b.classList.remove('active'));
            if (btn) btn.classList.add('active');
        }

        function goBackToInput() {
            hide('outlineSection');
            show('inputSection');
            setActiveStep(1);
        }

        // ═══ THEME ═══
        const themeBtn = document.querySelector('[data-theme-toggle]');
        const themeIcon = document.getElementById('themeIcon');
        themeIcon.textContent = document.documentElement.classList.contains('dark') ? 'light_mode' : 'dark_mode';
        themeBtn.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            const d = document.documentElement.classList.contains('dark');
            themeIcon.textContent = d ? 'light_mode' : 'dark_mode';
            localStorage.setItem('px_theme', d ? 'dark' : 'light');
        });

        // ═══ SLIDE COUNT ═══
        function updateSlideCount(val) {
            const label = document.getElementById('countLabel');
            label.style.animation = 'none';
            label.offsetHeight;
            label.textContent = val;
            label.style.animation = 'count-up 0.25s ease-out forwards';
        }

        // ═══ STEP INDICATOR ═══
        function setActiveStep(n) {
            document.querySelectorAll('.step-dot').forEach(d => {
                d.classList.toggle('active', parseInt(d.dataset.step) === n);
            });
        }

        // ═══ STEP 1: GENERATE OUTLINE ═══
        async function startGeneration() {
            const title = document.getElementById('pptTitle').value.trim();
            const desc = document.getElementById('pptDesc').innerText.trim();
            const count = parseInt(document.getElementById('pptCount').value);

            if (!title) {
                const inp = document.getElementById('pptTitle');
                inp.focus();
                inp.style.borderColor = '#EF4444';
                inp.style.boxShadow = '0 0 0 4px rgba(239,68,68,0.1)';
                setTimeout(() => { inp.style.borderColor = ''; inp.style.boxShadow = ''; }, 1500);
                return;
            }

            const btn = document.getElementById('generateBtn');
            btn.disabled = true;
            btn.innerHTML = '<div class="spinner"></div> Generating...';

            show('progressOverlay');
            document.getElementById('progressBar').style.width = '30%';

            try {
                const res = await apiPost('/api/ppt/generate-outline', { title, description: desc, slide_count: count, complexity: selectedComplexity });
                const slides = res.slides || [];
                if (!slides.length) throw new Error('AI returned no slides');

                document.getElementById('progressBar').style.width = '100%';
                await new Promise(r => setTimeout(r, 350));

                currentOutlineSlides = slides;
                hide('inputSection');
                hide('progressOverlay');
                show('outlineSection');
                setActiveStep(2);
                showOutline(slides);
            } catch (e) {
                alert('Error: ' + e.message);
                hide('progressOverlay');
            }

            btn.disabled = false;
            btn.innerHTML = '<span class="material-symbols-rounded text-base">auto_awesome</span> Generate Outline';
        }

        // ═══ STEP 2: APPROVE ═══
        async function approveOutline() {
            const slides = readEditedOutline();
            if (!slides.length) return;
            currentOutlineSlides = slides;
            const title = document.getElementById('pptTitle').value.trim();
            const desc = document.getElementById('pptDesc').innerText.trim();
            const complexity = selectedComplexity;

            document.getElementById('outlineStatus').innerHTML = '<span class="material-symbols-rounded text-[11px]">check_circle</span> Approved';
            document.getElementById('outlineStatus').className = 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/12 dark:text-emerald-400';
            document.getElementById('outlineActions').style.opacity = '0.4';
            document.getElementById('outlineActions').style.pointerEvents = 'none';

            sessionStorage.setItem('ppt_data', JSON.stringify({ title, description: desc, slides, complexity }));
            window.location.href = 'viewer.html';
        }

        function regenerateOutline() {
            currentOutlineSlides = [];
            hide('outlineSection');
            show('inputSection');
            setActiveStep(1);
            startGeneration();
        }

        function readEditedOutline() {
            const cards = document.querySelectorAll('#outlineList .outline-card');
            const slides = [];
            cards.forEach((card, i) => {
                const titleInput = card.querySelector('.outline-title-input');
                const bulletInputs = card.querySelectorAll('.outline-bullet-input');
                const bullets = [];
                bulletInputs.forEach(b => { if (b.value.trim()) bullets.push(b.value.trim()); });
                slides.push({ slide_number: i + 1, title: titleInput ? titleInput.value.trim() : `Slide ${i + 1}`, bullets });
            });
            return slides;
        }

        function showOutline(slides) {
            const list = document.getElementById('outlineList');
            list.innerHTML = slides.map((s, i) => `
                <div class="outline-card p-4 flex items-start gap-3" style="transition-delay:${i * 60}ms">
                    <div class="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500/12 to-brand-400/12 dark:from-brand-500/20 dark:to-brand-400/20 flex items-center justify-center mt-0.5 ring-1 ring-brand-500/8 dark:ring-brand-500/12">
                        <span class="font-black text-xs text-brand-500 dark:text-brand-400">${s.slide_number}</span>
                    </div>
                    <div class="min-w-0 flex-1 space-y-1.5">
                        <input type="text" class="outline-title-input" value="${esc(s.title)}" placeholder="Slide title">
                        <div class="space-y-0.5">
                            ${(s.bullets || []).map(b => `
                                <div class="flex items-center gap-1.5">
                                    <span class="w-1 h-1 rounded-full bg-brand-500/20 flex-shrink-0"></span>
                                    <input type="text" class="outline-bullet-input flex-1" value="${esc(b)}" placeholder="Bullet point">
                                </div>
                            `).join('')}
                        </div>
                        <button onclick="addBullet(this)" class="inline-flex items-center gap-0.5 text-[9px] text-brand-500 hover:text-brand-700 dark:hover:text-brand-300 font-bold transition-colors">
                            <span class="material-symbols-rounded text-[11px]">add_circle</span> Add
                        </button>
                    </div>
                </div>
            `).join('');
            requestAnimationFrame(() => {
                document.querySelectorAll('.outline-card').forEach((card, i) => {
                    setTimeout(() => card.classList.add('show'), i * 60);
                });
            });
        }

        function addBullet(btn) {
            const container = btn.previousElementSibling;
            const el = document.createElement('div');
            el.className = 'flex items-center gap-1.5';
            el.style.animation = 'slide-up 0.25s ease-out forwards';
            el.innerHTML = '<span class="w-1 h-1 rounded-full bg-brand-500/20 flex-shrink-0"></span><input type="text" class="outline-bullet-input flex-1" placeholder="New point">';
            container.appendChild(el);
            el.querySelector('input').focus();
        }

        // ═══ COPILOT ═══
        let copilotBusy = false;

        function addCopilotMsg(type, text) {
            const box = document.getElementById('copilotMessages');
            const iconContent = type === 'user' ? 'person' : 'auto_awesome';
            const msgClass = type === 'user' ? 'copilot-msg-user' : 'copilot-msg-ai';
            const div = document.createElement('div');
            div.className = `copilot-msg ${msgClass}`;
            div.innerHTML = `
                <div class="copilot-msg-icon"><span class="material-symbols-rounded" style="font-size:11px">${iconContent}</span></div>
                <div class="copilot-msg-text">${esc(text)}</div>
            `;
            box.appendChild(div);
            box.scrollTop = box.scrollHeight;
        }

        function showCopilotTyping() {
            const box = document.getElementById('copilotMessages');
            const div = document.createElement('div');
            div.className = 'copilot-msg copilot-msg-ai';
            div.id = 'copilotTyping';
            div.innerHTML = `
                <div class="copilot-msg-icon"><span class="material-symbols-rounded" style="font-size:11px">auto_awesome</span></div>
                <div class="copilot-typing"><span></span><span></span><span></span></div>
            `;
            box.appendChild(div);
            box.scrollTop = box.scrollHeight;
        }

        function removeCopilotTyping() {
            const el = document.getElementById('copilotTyping');
            if (el) el.remove();
        }

        async function sendCopilotInstruction() {
            const input = document.getElementById('copilotInput');
            const instruction = input.value.trim();
            if (!instruction || copilotBusy) return;

            copilotBusy = true;
            const sendBtn = document.getElementById('copilotSendBtn');
            sendBtn.disabled = true;
            input.value = '';

            // Show user message
            addCopilotMsg('user', instruction);
            showCopilotTyping();

            // Read current outline from DOM
            const currentSlides = readEditedOutline();
            const title = document.getElementById('pptTitle').value.trim();
            const desc = document.getElementById('pptDesc').innerText.trim();

            try {
                const res = await apiPost('/api/ppt/refine-outline', {
                    title,
                    description: desc,
                    instruction,
                    current_slides: currentSlides
                });

                removeCopilotTyping();

                const newSlides = res.slides || [];
                if (!newSlides.length) {
                    addCopilotMsg('ai', 'Could not apply the change. Try rephrasing.');
                } else {
                    // Determine what changed
                    const diff = newSlides.length - currentSlides.length;
                    let summary = 'Done! Outline updated.';
                    if (diff > 0) summary = `Done! Added ${diff} slide${diff > 1 ? 's' : ''} (${newSlides.length} total).`;
                    else if (diff < 0) summary = `Done! Removed ${Math.abs(diff)} slide${Math.abs(diff) > 1 ? 's' : ''} (${newSlides.length} total).`;

                    addCopilotMsg('ai', summary);

                    // Update the outline
                    currentOutlineSlides = newSlides;
                    showOutline(newSlides);
                }
            } catch (e) {
                removeCopilotTyping();
                addCopilotMsg('ai', 'Error: ' + e.message);
            }

            copilotBusy = false;
            sendBtn.disabled = false;
            input.focus();
        }

        // ═══ UTILS ═══
        function show(id) { document.getElementById(id).classList.remove('section-hidden'); }
        function hide(id) { document.getElementById(id).classList.add('section-hidden'); }

        async function apiPost(url, body) {
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = 'Bearer ' + token;
            const r = await fetch(apiBase + url, { method: 'POST', headers, body: JSON.stringify(body) });
            if (!r.ok) {
                const err = await r.json().catch(() => ({ detail: r.statusText }));
                console.error('[apiPost] Error response:', url, r.status, err);
                let msg = 'Request failed';
                if (typeof err.detail === 'string') {
                    msg = err.detail;
                } else if (Array.isArray(err.detail)) {
                    // FastAPI 422 validation errors
                    msg = err.detail.map(e => {
                        const field = (e.loc || []).filter(l => l !== 'body').join('.');
                        return field ? `${field}: ${e.msg}` : e.msg;
                    }).join('; ');
                }
                throw new Error(msg);
            }
            return r.json();
        }

        function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

        // Prevent Enter from inserting HTML in desc box
        document.getElementById('pptDesc').addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                document.execCommand('insertLineBreak');
            }
        });
