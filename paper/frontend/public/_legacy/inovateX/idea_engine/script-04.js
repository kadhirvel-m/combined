// Extracted from ui/inovateX/idea_engine.html (inline <script> #4).
        const apiBase = (window.API_BASE || window.location.origin).replace(/\/$/, '');
        let currentIdeas = [];
        let setupData = null;
        let selectedIdx = -1;

        const LOADING_MSGS = [
            'Analyzing your profile…',
            'Matching skills to real-world problems…',
            'Exploring innovation opportunities…',
            'Evaluating feasibility…',
            'Crafting personalized ideas…',
            'Scoring difficulty & impact…',
            'Finalizing your project pool…'
        ];

        const DIFF_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#7C3AED'];
        const DIFF_LABELS = ['Beginner', 'Easy', 'Intermediate', 'Advanced', 'Expert'];
        const CAT_COLORS = {
            'AI/ML': '#7C3AED', 'Healthcare': '#EF4444', 'IoT': '#3B82F6', 'Web': '#10B981', 'Mobile': '#F59E0B',
            'Education': '#EC4899', 'Security': '#6366F1', 'Social': '#14B8A6', 'FinTech': '#F97316', 'Research': '#8B5CF6',
            'Environment': '#22C55E', 'Data': '#06B6D4', 'Game': '#E11D48', 'Blockchain': '#6D28D9', 'default': '#9E4B8A'
        };

        // ══════════════════════════════════════════
        // INIT
        // ══════════════════════════════════════════
        document.addEventListener('DOMContentLoaded', () => {
            initTheme();

            // Read setup data from sessionStorage
            const raw = sessionStorage.getItem('innovatex_setup');
            if (!raw) {
                showState('noData');
                return;
            }
            try { setupData = JSON.parse(raw); } catch (e) { showState('noData'); return; }

            renderSummaryBar(setupData);
            startGeneration(setupData);
        });

        function initTheme() {
            const btn = document.querySelector('[data-theme-toggle]');
            const icon = document.getElementById('themeIcon');
            icon.textContent = document.documentElement.classList.contains('dark') ? 'light_mode' : 'dark_mode';
            btn.addEventListener('click', () => {
                document.documentElement.classList.toggle('dark');
                const d = document.documentElement.classList.contains('dark');
                icon.textContent = d ? 'light_mode' : 'dark_mode';
                localStorage.setItem('px_theme', d ? 'dark' : 'light');
            });
        }

        function showState(state) {
            document.getElementById('loadingState').style.display = state === 'loading' ? 'flex' : 'none';
            document.getElementById('errorState').style.display = state === 'error' ? 'block' : 'none';
            document.getElementById('noDataState').style.display = state === 'noData' ? 'block' : 'none';
            document.getElementById('resultsArea').style.display = state === 'results' ? 'block' : 'none';
        }

        // ══════════════════════════════════════════
        // SUMMARY BAR
        // ══════════════════════════════════════════
        function renderSummaryBar(data) {
            const bar = document.getElementById('summaryBar');
            const chips = [];
            if (data.interests?.length) chips.push(`<span class="summary-chip"><span class="material-symbols-rounded text-xs text-brand-500">explore</span> ${data.interests.length} Domains</span>`);
            if (data.team_size) chips.push(`<span class="summary-chip"><span class="material-symbols-rounded text-xs text-brand-500">group</span> Team of ${data.team_size}</span>`);
            if (data.project_type && data.project_type !== 'Any / Mixed') chips.push(`<span class="summary-chip"><span class="material-symbols-rounded text-xs text-brand-500">category</span> ${esc(data.project_type)}</span>`);
            if (data.difficulty && data.difficulty !== 'Any Level') chips.push(`<span class="summary-chip"><span class="material-symbols-rounded text-xs text-brand-500">speed</span> ${esc(data.difficulty)}</span>`);
            bar.innerHTML = chips.join('');
            bar.style.display = chips.length ? 'flex' : 'none';
        }

        // ══════════════════════════════════════════
        // GENERATE IDEAS
        // ══════════════════════════════════════════
        async function startGeneration(data) {
            showState('loading');
            let msgIdx = 0;
            const loadingInterval = setInterval(() => {
                msgIdx = (msgIdx + 1) % LOADING_MSGS.length;
                document.getElementById('loadingText').textContent = LOADING_MSGS[msgIdx];
            }, 2500);

            const token = localStorage.getItem('px_token');
            try {
                const res = await fetch(`${apiBase}/api/innovatex/generate-ideas`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        skills: data.skills || [],
                        interests: data.interests || [],
                        team_size: data.team_size || 2,
                        additional_context: buildContext(data),
                    }),
                });

                clearInterval(loadingInterval);

                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.detail || `Server error ${res.status}`);
                }

                const result = await res.json();
                currentIdeas = result.ideas || [];

                if (currentIdeas.length === 0) throw new Error('No ideas were generated. Please try again.');

                document.getElementById('ideaCount').textContent = currentIdeas.length;
                document.getElementById('aiModel').textContent = result.model || 'gemini-3-pro-preview';
                document.getElementById('heroSubtext').textContent = `${currentIdeas.length} ideas crafted from ${data.interests?.length || 0} domains of interest`;

                renderIdeas(currentIdeas);
                showState('results');

            } catch (e) {
                clearInterval(loadingInterval);
                document.getElementById('errorMsg').textContent = e.message || 'Failed to generate ideas.';
                showState('error');
            }
        }

        function buildContext(data) {
            const parts = [];
            if (data.project_type && data.project_type !== 'Any / Mixed') parts.push(`Project type preference: ${data.project_type}`);
            if (data.difficulty && data.difficulty !== 'Any Level') parts.push(`Preferred difficulty: ${data.difficulty}`);
            if (data.additional_context) parts.push(data.additional_context);
            return parts.join('. ') || null;
        }

        function retryGeneration() {
            if (!setupData) { showState('noData'); return; }
            selectedIdx = -1;
            document.getElementById('bottomActions').style.display = 'none';
            startGeneration(setupData);
        }

        // ══════════════════════════════════════════
        // RENDER IDEAS
        // ══════════════════════════════════════════
        function renderIdeas(ideas) {
            const grid = document.getElementById('ideasGrid');
            grid.innerHTML = ideas.map((idea, i) => {
                const diffPct = ((idea.difficulty || 3) / 5) * 100;
                const diffColor = DIFF_COLORS[Math.min((idea.difficulty || 3) - 1, 4)];
                const diffLabel = DIFF_LABELS[Math.min((idea.difficulty || 3) - 1, 4)];
                const innov = idea.innovation_score || 3;
                const stars = Array.from({ length: 5 }, (_, j) => `<span class="star ${j < innov ? 'lit' : ''}">★</span>`).join('');
                const catColor = getCatColor(idea.category);
                const techTags = (idea.tech_stack || []).slice(0, 6).map(t => `<span class="tech-tag">${esc(t)}</span>`).join('');

                return `
        <div class="glass-card idea-card rounded-3xl p-6 flex flex-col reveal" data-idx="${i}" style="animation-delay:${i * 120}ms">
            <div class="selected-badge"><span class="material-symbols-rounded text-sm">check</span></div>

            <!-- Category + Difficulty -->
            <div class="flex items-center justify-between mb-4">
                <span class="cat-badge" style="background:${catColor}15;color:${catColor}">
                    <span class="material-symbols-rounded text-xs">${getCatIcon(idea.category)}</span>
                    ${esc(idea.category || 'General')}
                </span>
                <span class="text-[11px] font-bold" style="color:${diffColor}">${diffLabel}</span>
            </div>

            <!-- Title -->
            <h3 class="text-lg font-bold mb-2 leading-snug">${esc(idea.title || 'Untitled')}</h3>

            <!-- Problem -->
            <p class="text-sm text-neutral-600 dark:text-white/60 mb-4 leading-relaxed line-clamp-3">
                <span class="font-semibold text-neutral-700 dark:text-white/80">Problem:</span> ${esc(idea.problem || '')}
            </p>

            <!-- Solution -->
            <p class="text-sm text-neutral-600 dark:text-white/60 mb-4 leading-relaxed line-clamp-3">
                <span class="font-semibold text-neutral-700 dark:text-white/80">Solution:</span> ${esc(idea.solution || '')}
            </p>

            <!-- Tech stack -->
            <div class="flex flex-wrap gap-1.5 mb-4">${techTags}</div>

            <!-- Metrics row -->
            <div class="grid grid-cols-2 gap-3 mb-4">
                <div>
                    <p class="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-white/30 mb-1.5">Difficulty</p>
                    <div class="diff-bar">
                        <div class="diff-fill" style="width:${diffPct}%;background:${diffColor}"></div>
                    </div>
                </div>
                <div>
                    <p class="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-white/30 mb-1">Innovation</p>
                    <div>${stars}</div>
                </div>
            </div>

            <!-- Use case + timeline -->
            <div class="flex items-center justify-between text-xs text-neutral-400 dark:text-white/35 mb-5">
                <span class="flex items-center gap-1">
                    <span class="material-symbols-rounded text-xs">schedule</span>
                    ${idea.timeline_weeks || '?'} weeks
                </span>
                <span class="flex items-center gap-1">
                    <span class="material-symbols-rounded text-xs">public</span>
                    ${esc((idea.use_case || '').substring(0, 35))}${(idea.use_case || '').length > 35 ? '…' : ''}
                </span>
            </div>

            <!-- Actions -->
            <div class="flex gap-2 mt-auto">
                <button onclick="openDetail(${i})" class="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-brand-500/10 text-brand-700 dark:text-brandlt-200 hover:bg-brand-500/20 transition flex items-center justify-center gap-1.5">
                    <span class="material-symbols-rounded text-base">visibility</span> Details
                </button>
                <button onclick="selectIdea(${i})" class="flex-1 py-2.5 rounded-xl text-sm font-semibold ring-1 ring-black/8 dark:ring-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition flex items-center justify-center gap-1.5">
                    <span class="material-symbols-rounded text-base">check_circle</span> Select
                </button>
            </div>
        </div>`;
            }).join('');

            // Trigger reveal
            setTimeout(() => {
                grid.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
            }, 100);

            // Scroll reveal observer
            const obs = new IntersectionObserver(entries => {
                entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
            }, { threshold: 0.08 });
            grid.querySelectorAll('.reveal').forEach(el => obs.observe(el));
        }

        // ══════════════════════════════════════════
        // DETAIL MODAL
        // ══════════════════════════════════════════
        function openDetail(idx) {
            const idea = currentIdeas[idx];
            if (!idea) return;

            const diffPct = ((idea.difficulty || 3) / 5) * 100;
            const diffColor = DIFF_COLORS[Math.min((idea.difficulty || 3) - 1, 4)];
            const diffLabel = DIFF_LABELS[Math.min((idea.difficulty || 3) - 1, 4)];
            const innov = idea.innovation_score || 3;
            const stars = Array.from({ length: 5 }, (_, j) => `<span class="star ${j < innov ? 'lit' : ''}">★</span>`).join('');
            const catColor = getCatColor(idea.category);

            document.getElementById('modalInner').innerHTML = `
        <div class="flex items-center gap-3 mb-6">
            <span class="cat-badge text-sm" style="background:${catColor}15;color:${catColor}">
                <span class="material-symbols-rounded text-sm">${getCatIcon(idea.category)}</span>
                ${esc(idea.category || 'General')}
            </span>
            <span class="text-xs font-bold px-2 py-1 rounded-lg" style="background:${diffColor}15;color:${diffColor}">${diffLabel} • ${idea.difficulty || 3}/5</span>
        </div>

        <h2 class="text-2xl font-black mb-4 leading-tight">${esc(idea.title)}</h2>

        <!-- Problem & Solution -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div class="p-4 rounded-2xl bg-red-50/50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10">
                <p class="text-xs font-bold uppercase tracking-wider text-red-400 mb-2 flex items-center gap-1">
                    <span class="material-symbols-rounded text-sm">report_problem</span> Problem
                </p>
                <p class="text-sm leading-relaxed">${esc(idea.problem)}</p>
            </div>
            <div class="p-4 rounded-2xl bg-green-50/50 dark:bg-green-500/5 border border-green-100 dark:border-green-500/10">
                <p class="text-xs font-bold uppercase tracking-wider text-green-500 mb-2 flex items-center gap-1">
                    <span class="material-symbols-rounded text-sm">lightbulb</span> Solution
                </p>
                <p class="text-sm leading-relaxed">${esc(idea.solution)}</p>
            </div>
        </div>

        <!-- Tech Stack -->
        <div class="mb-6">
            <p class="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-white/30 mb-3 flex items-center gap-1">
                <span class="material-symbols-rounded text-sm">code</span> Tech Stack
            </p>
            <div class="flex flex-wrap gap-2">
                ${(idea.tech_stack || []).map(t => `<span class="tech-tag">${esc(t)}</span>`).join('')}
            </div>
        </div>

        <!-- Metrics -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div class="p-3 rounded-xl bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/8 text-center">
                <p class="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-white/30 mb-1">Difficulty</p>
                <div class="diff-bar mb-1"><div class="diff-fill" style="width:${diffPct}%;background:${diffColor}"></div></div>
                <p class="text-xs font-bold" style="color:${diffColor}">${diffLabel}</p>
            </div>
            <div class="p-3 rounded-xl bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/8 text-center">
                <p class="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-white/30 mb-1">Innovation</p>
                <div>${stars}</div>
                <p class="text-xs font-bold text-amber-500 mt-0.5">${innov}/5</p>
            </div>
            <div class="p-3 rounded-xl bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/8 text-center">
                <p class="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-white/30 mb-1">Timeline</p>
                <p class="text-lg font-black">${idea.timeline_weeks || '?'}</p>
                <p class="text-xs text-neutral-400">weeks</p>
            </div>
            <div class="p-3 rounded-xl bg-white/40 dark:bg-white/5 border border-black/5 dark:border-white/8 text-center">
                <p class="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-white/30 mb-1">Use Case</p>
                <p class="text-xs leading-snug">${esc(idea.use_case || '—')}</p>
            </div>
        </div>

        <!-- Milestones -->
        ${idea.milestones && idea.milestones.length ? `
        <div class="mb-6">
            <p class="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-white/30 mb-3 flex items-center gap-1">
                <span class="material-symbols-rounded text-sm">flag</span> Project Milestones
            </p>
            <div class="space-y-2">
                ${idea.milestones.map((m, j) => `
                    <div class="flex items-start gap-3 p-3 rounded-xl bg-white/30 dark:bg-white/3 border border-black/3 dark:border-white/5">
                        <span class="w-6 h-6 rounded-full bg-brand-500/15 text-brand-500 text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">${j + 1}</span>
                        <p class="text-sm">${esc(m)}</p>
                    </div>
                `).join('')}
            </div>
        </div>` : ''}

        <!-- Learning Outcomes -->
        ${idea.learning_outcomes && idea.learning_outcomes.length ? `
        <div class="mb-6">
            <p class="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-white/30 mb-3 flex items-center gap-1">
                <span class="material-symbols-rounded text-sm">school</span> Learning Outcomes
            </p>
            <div class="flex flex-wrap gap-2">
                ${idea.learning_outcomes.map(lo => `
                    <span class="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-blue-500/15">
                        <span class="material-symbols-rounded text-xs">check_circle</span> ${esc(lo)}
                    </span>
                `).join('')}
            </div>
        </div>` : ''}

        <!-- Select button -->
        <div class="flex gap-3 mt-8 pt-4 border-t border-black/5 dark:border-white/8">
            <button onclick="selectIdea(${idx});closeModal()" class="flex-1 py-3 rounded-xl font-semibold bg-gradient-to-r from-brand-500 to-[#FF7FD1] text-white shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                <span class="material-symbols-rounded text-lg">check_circle</span> Select This Idea
            </button>
            <button onclick="closeModal()" class="px-6 py-3 rounded-xl font-semibold ring-1 ring-black/10 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5 transition">Close</button>
        </div>
    `;

            document.getElementById('detailModal').classList.add('open');
            document.body.style.overflow = 'hidden';
        }

        function closeModal() {
            document.getElementById('detailModal').classList.remove('open');
            document.body.style.overflow = '';
        }

        // ══════════════════════════════════════════
        // SELECT IDEA
        // ══════════════════════════════════════════
        function selectIdea(idx) {
            selectedIdx = idx;
            document.querySelectorAll('.idea-card').forEach((c, i) => {
                c.classList.toggle('selected', i === idx);
                if (i === idx) c.style.border = '2px solid #10B981';
                else c.style.border = '';
            });
            const idea = currentIdeas[idx];
            // Open claim confirmation modal
            document.getElementById('claimTitle').textContent = idea.title;
            document.getElementById('claimCategory').textContent = (idea.category || 'General') + ' • Difficulty ' + (idea.difficulty || 3) + '/5';
            document.getElementById('claimDefault').style.display = 'block';
            document.getElementById('claimSaving').style.display = 'none';
            document.getElementById('claimModal').classList.add('open');
            document.body.style.overflow = 'hidden';
        }

        function closeClaimModal() {
            document.getElementById('claimModal').classList.remove('open');
            document.body.style.overflow = '';
        }

        async function confirmClaim() {
            const idea = currentIdeas[selectedIdx];
            if (!idea) return;

            // Show saving state
            document.getElementById('claimDefault').style.display = 'none';
            document.getElementById('claimSaving').style.display = 'block';

            const token = localStorage.getItem('px_token');
            try {
                const resp = await fetch(apiBase + '/api/innovatex/claim-project', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token,
                    },
                    body: JSON.stringify({
                        title: idea.title,
                        problem: idea.problem,
                        solution: idea.solution,
                        tech_stack: idea.tech_stack || [],
                        difficulty: idea.difficulty || 3,
                        innovation_score: idea.innovation_score || 3,
                        category: idea.category || null,
                        use_case: idea.use_case || null,
                        timeline_weeks: idea.timeline_weeks || null,
                        milestones: idea.milestones || [],
                        learning_outcomes: idea.learning_outcomes || [],
                        team_size: setupData?.team_size || 1,
                    }),
                });

                if (!resp.ok) {
                    const err = await resp.json().catch(() => ({}));
                    throw new Error(err.detail || 'Failed to claim project');
                }

                const data = await resp.json();
                // Redirect to project detail page
                window.location.href = './my_project.html?id=' + data.project_id;
            } catch (e) {
                alert('Error claiming project: ' + e.message);
                document.getElementById('claimDefault').style.display = 'block';
                document.getElementById('claimSaving').style.display = 'none';
            }
        }

        // ══════════════════════════════════════════
        // HELPERS
        // ══════════════════════════════════════════
        function getCatColor(cat) {
            if (!cat) return CAT_COLORS.default;
            const lc = cat.toLowerCase();
            for (const [k, v] of Object.entries(CAT_COLORS)) {
                if (lc.includes(k.toLowerCase())) return v;
            }
            return CAT_COLORS.default;
        }

        function getCatIcon(cat) {
            if (!cat) return 'lightbulb';
            const lc = cat.toLowerCase();
            if (lc.includes('ai') || lc.includes('ml') || lc.includes('machine')) return 'psychology';
            if (lc.includes('health')) return 'health_and_safety';
            if (lc.includes('iot') || lc.includes('smart') || lc.includes('embedded')) return 'sensors';
            if (lc.includes('web')) return 'language';
            if (lc.includes('mobile')) return 'smartphone';
            if (lc.includes('edu') || lc.includes('learn')) return 'school';
            if (lc.includes('secur')) return 'security';
            if (lc.includes('social') || lc.includes('impact')) return 'volunteer_activism';
            if (lc.includes('fin') || lc.includes('bank')) return 'account_balance';
            if (lc.includes('research')) return 'science';
            if (lc.includes('env') || lc.includes('green') || lc.includes('sustain')) return 'eco';
            if (lc.includes('data')) return 'analytics';
            if (lc.includes('game')) return 'sports_esports';
            if (lc.includes('block') || lc.includes('web3')) return 'token';
            if (lc.includes('agri')) return 'agriculture';
            if (lc.includes('robot') || lc.includes('auto')) return 'precision_manufacturing';
            return 'lightbulb';
        }

        function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }

        // ESC to close modal
        document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
