// Extracted from ui/inovateX/idea_setup.html (inline <script> #4).
        const apiBase = (window.API_BASE || window.location.origin).replace(/\/$/, '');

        /* ══════════════ DATA ══════════════ */

        const TYPES = [
            { key: 'Software Only', icon: 'code', desc: 'App or web based' },
            { key: 'Hardware + Software', icon: 'memory', desc: 'IoT / Embedded' },
            { key: 'Research / Thesis', icon: 'science', desc: 'Academic research' },
            { key: 'Any / Mixed', icon: 'shuffle', desc: 'Open to anything' },
        ];

        const DOMAINS = {
            'dom-tech': [
                { name: 'Artificial Intelligence', icon: 'psychology' },
                { name: 'Machine Learning', icon: 'model_training' },
                { name: 'Web Development', icon: 'language' },
                { name: 'Mobile Apps', icon: 'smartphone' },
                { name: 'IoT & Smart Devices', icon: 'sensors' },
                { name: 'Data Science', icon: 'analytics' },
                { name: 'Cloud & DevOps', icon: 'cloud' },
                { name: 'Cybersecurity', icon: 'security' },
                { name: 'Blockchain & Web3', icon: 'token' },
                { name: 'AR / VR / XR', icon: 'view_in_ar' },
                { name: 'Robotics & Automation', icon: 'precision_manufacturing' },
                { name: 'Computer Vision', icon: 'visibility' },
                { name: 'NLP & Chatbots', icon: 'forum' },
                { name: 'Game Development', icon: 'sports_esports' },
            ],
            'dom-industry': [
                { name: 'Healthcare & MedTech', icon: 'health_and_safety' },
                { name: 'EdTech & Learning', icon: 'school' },
                { name: 'FinTech & Payments', icon: 'account_balance' },
                { name: 'E-Commerce', icon: 'shopping_cart' },
                { name: 'AgriTech & Farming', icon: 'agriculture' },
                { name: 'Transport & Logistics', icon: 'local_shipping' },
                { name: 'Food & Delivery', icon: 'restaurant' },
                { name: 'Manufacturing', icon: 'factory' },
                { name: 'Media & Entertainment', icon: 'movie' },
                { name: 'Real Estate', icon: 'home_work' },
            ],
            'dom-impact': [
                { name: 'Social Good', icon: 'volunteer_activism' },
                { name: 'Environment & Green', icon: 'eco' },
                { name: 'Accessibility', icon: 'accessible' },
                { name: 'Women Safety', icon: 'shield_person' },
                { name: 'Rural Development', icon: 'landscape' },
                { name: 'Disaster Management', icon: 'emergency' },
                { name: 'Smart Cities', icon: 'location_city' },
                { name: 'Clean Energy', icon: 'solar_power' },
            ],
        };

        const DIFFS = [
            { key: 'Beginner', icon: 'sentiment_satisfied', color: '#10B981', desc: 'Just starting out' },
            { key: 'Intermediate', icon: 'trending_up', color: '#3B82F6', desc: 'Some experience' },
            { key: 'Advanced', icon: 'rocket', color: '#F59E0B', desc: 'Confident builder' },
            { key: 'Expert', icon: 'workspace_premium', color: '#EF4444', desc: 'Challenge me' },
            { key: 'Any Level', icon: 'shuffle', color: '#9E4B8A', desc: 'Surprise me' },
        ];

        /* ══════════════ STATE ══════════════ */
        let projectType = 'Any / Mixed';
        let domains = new Set();
        let teamSize = 2;
        let difficulty = 'Any Level';

        /* ══════════════ INIT ══════════════ */
        document.addEventListener('DOMContentLoaded', () => {
            initTheme();
            renderTypes();
            renderDomains();
            renderTeam();
            renderDiffs();
            initReveal();

            bindInteractions();

            document.getElementById('extraContext').addEventListener('input', e => {
                document.getElementById('charCount').textContent = e.target.value.length;
            });
        });

        function bindInteractions() {
            const typeGrid = document.getElementById('typeGrid');
            if (typeGrid) {
                typeGrid.addEventListener('click', (e) => {
                    const card = e.target.closest('[data-type]');
                    if (!card) return;
                    pickType(card.getAttribute('data-type') || '', card);
                });
            }

            const teamRow = document.getElementById('teamRow');
            if (teamRow) {
                teamRow.addEventListener('click', (e) => {
                    const btn = e.target.closest('[data-team-size]');
                    if (!btn) return;
                    const n = Number(btn.getAttribute('data-team-size') || 0);
                    if (n > 0) pickTeam(n, btn);
                });
            }

            const diffGrid = document.getElementById('diffGrid');
            if (diffGrid) {
                diffGrid.addEventListener('click', (e) => {
                    const card = e.target.closest('[data-difficulty]');
                    if (!card) return;
                    pickDiff(card.getAttribute('data-difficulty') || '', card);
                });
            }

            document.querySelectorAll('#dom-tech, #dom-industry, #dom-impact').forEach((container) => {
                container.addEventListener('click', (e) => {
                    const chip = e.target.closest('[data-domain]');
                    if (!chip) return;
                    toggleDomain(chip, chip.getAttribute('data-domain') || '');
                });
            });

            const generateBtn = document.getElementById('generateBtn');
            if (generateBtn) {
                generateBtn.addEventListener('click', go);
            }
        }

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

        /* ══════════════ RENDER ══════════════ */

        function renderTypes() {
            document.getElementById('typeGrid').innerHTML = TYPES.map(t => `
        <div class="sel-card ${t.key === projectType ? 'active' : ''}" data-type="${esc(t.key)}">
            <div class="sel-check"><span class="material-symbols-rounded">check</span></div>
            <span class="material-symbols-rounded text-3xl text-brand-500 dark:text-brandlt-200 mb-2 block">${t.icon}</span>
            <p class="font-bold text-sm">${esc(t.key)}</p>
            <p class="text-[11px] text-neutral-400 dark:text-white/40 mt-0.5">${esc(t.desc)}</p>
        </div>
    `).join('');
        }

        function renderDomains() {
            for (const [id, items] of Object.entries(DOMAINS)) {
                const el = document.getElementById(id);
                if (!el) continue;
                el.innerHTML = items.map(d => `
            <button type="button" class="domain-chip" data-domain="${esc(d.name)}">
                <span class="d-icon"><span class="material-symbols-rounded text-sm">${d.icon}</span></span>
                ${esc(d.name)}
            </button>
        `).join('');
            }
        }

        function renderTeam() {
            document.getElementById('teamRow').innerHTML = [1, 2, 3, 4, 5, 6].map(n => `
        <button type="button" class="team-btn ${n === teamSize ? 'active' : ''}" data-team-size="${n}">
            <span>${n}</span>
            <span class="team-label">${n === 1 ? 'Solo' : n === 2 ? 'Pair' : 'Team'}</span>
        </button>
    `).join('');
        }

        function renderDiffs() {
            document.getElementById('diffGrid').innerHTML = DIFFS.map(d => `
        <div class="sel-card ${d.key === difficulty ? 'active' : ''}" data-difficulty="${esc(d.key)}">
            <div class="sel-check"><span class="material-symbols-rounded">check</span></div>
            <span class="material-symbols-rounded text-2xl mb-1 block" style="color:${d.color}">${d.icon}</span>
            <p class="font-bold text-xs">${esc(d.key)}</p>
            <p class="text-[10px] text-neutral-400 dark:text-white/35 mt-0.5">${esc(d.desc)}</p>
        </div>
    `).join('');
        }

        /* ══════════════ HANDLERS ══════════════ */

        function pickType(key, el) {
            projectType = key;
            document.querySelectorAll('#typeGrid .sel-card').forEach(c => c.classList.remove('active'));
            el.classList.add('active');
        }

        function toggleDomain(el, name) {
            if (domains.has(name)) { domains.delete(name); el.classList.remove('selected'); }
            else { domains.add(name); el.classList.add('selected'); }
            document.getElementById('domainBadge').textContent = domains.size + ' picked';
        }

        function pickTeam(n, el) {
            teamSize = n;
            document.querySelectorAll('.team-btn').forEach(b => b.classList.remove('active'));
            el.classList.add('active');
        }

        function pickDiff(key, el) {
            difficulty = key;
            document.querySelectorAll('#diffGrid .sel-card').forEach(c => c.classList.remove('active'));
            el.classList.add('active');
        }

        /* ══════════════ SUBMIT ══════════════ */
        function go() {
            if (domains.size === 0) {
                alert('Please select at least one domain that interests you.'); return;
            }
            const ctx = document.getElementById('extraContext').value.trim();
            const parts = [];
            if (projectType && projectType !== 'Any / Mixed') parts.push('Project type: ' + projectType);
            if (difficulty && difficulty !== 'Any Level') parts.push('Difficulty: ' + difficulty);
            if (ctx) parts.push(ctx);

            const payload = {
                interests: [...domains],
                team_size: teamSize,
                project_type: projectType,
                difficulty: difficulty,
                additional_context: parts.join('. ') || null,
            };

            sessionStorage.setItem('innovatex_setup', JSON.stringify(payload));
            window.location.href = './idea_engine.html';
        }

        /* ══════════════ REVEAL ══════════════ */
        function initReveal() {
            const obs = new IntersectionObserver(entries => {
                entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
            }, { threshold: 0.08 });
            document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
        }

        function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
