// Extracted from ui/inovateX/claimed_ideas.html (inline <script> #4).
        const apiBase = (window.API_BASE || window.location.origin).replace(/\/$/, '');
        const token = localStorage.getItem('px_token');

        document.addEventListener('DOMContentLoaded', () => {
            initTheme();
            loadProjects();
        });

        function initTheme() {
            const btn = document.querySelector('[data-theme-toggle]'), icon = document.getElementById('themeIcon');
            icon.textContent = document.documentElement.classList.contains('dark') ? 'light_mode' : 'dark_mode';
            btn.addEventListener('click', () => {
                document.documentElement.classList.toggle('dark');
                const d = document.documentElement.classList.contains('dark');
                icon.textContent = d ? 'light_mode' : 'dark_mode';
                localStorage.setItem('px_theme', d ? 'dark' : 'light');
            });
        }

        async function loadProjects() {
            try {
                const res = await fetch(apiBase + '/api/innovatex/my-projects', {
                    headers: { 'Authorization': 'Bearer ' + token }
                });
                const data = await res.json();
                const projects = data.projects || [];

                document.getElementById('loading').style.display = 'none';

                if (projects.length === 0) {
                    document.getElementById('empty').classList.remove('hidden');
                } else {
                    const grid = document.getElementById('grid');
                    grid.style.display = 'grid';
                    grid.innerHTML = projects.map(p => `
                        <div class="glass project-card rounded-2xl p-6 relative group" onclick="location.href='./my_project.html?id=${p.id}'">
                            <div class="absolute top-4 right-4 text-xs font-bold px-2 py-1 rounded-full ${p.status === 'refined' ? 'bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400' : 'bg-neutral-100 text-neutral-500 dark:bg-white/10 dark:text-white/50'}">
                                ${p.status === 'refined' ? 'Refined' : 'Claimed'}
                            </div>
                            <div class="text-[10px] font-bold uppercase tracking-wider text-brand-500 mb-3">${esc(p.category || 'General')}</div>
                            <h3 class="text-xl font-bold mb-3 group-hover:text-brand-500 transition-colors line-clamp-2">${esc(p.title)}</h3>
                            <p class="text-sm text-neutral-500 dark:text-white/60 line-clamp-3 mb-5">${esc(p.problem)}</p>
                            
                            <div class="flex items-center gap-4 text-xs font-semibold text-neutral-400 dark:text-white/40 mt-auto pt-4 border-t border-black/5 dark:border-white/5">
                                <div class="flex items-center gap-1"><span class="material-symbols-rounded text-sm">calendar_today</span> ${p.timeline_weeks || '?'} wks</div>
                                <div class="flex items-center gap-1"><span class="material-symbols-rounded text-sm">signal_cellular_alt</span> ${['Easy', 'Med', 'Hard', 'Hard', 'Expert'][p.difficulty - 1] || 'Med'}</div>
                                <div class="flex items-center gap-1 ml-auto text-brand-500 group-hover:translate-x-1 transition-transform">View <span class="material-symbols-rounded text-sm">arrow_forward</span></div>
                            </div>
                        </div>
                    `).join('');
                }
            } catch (e) {
                document.getElementById('loading').innerHTML = `<p class="text-red-500">Error loading projects: ${e.message}</p>`;
            }
        }

        function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
