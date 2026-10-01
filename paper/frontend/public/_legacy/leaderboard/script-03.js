// Extracted from ui/leaderboard.html (inline <script> #3).
        const API_BASE = window.API_BASE || '';

        // Theme toggle
        document.querySelectorAll('[data-theme-toggle]').forEach(btn => {
            btn.addEventListener('click', () => {
                const isDark = document.documentElement.classList.toggle('dark');
                localStorage.setItem('px_theme', isDark ? 'dark' : 'light');
            });
        });

        function getAvatar(user, size = 'md') {
            const sizeClass = size === 'lg' ? 'profile-img-lg' : 'profile-img-md';
            if (user.profile_image_url) {
                return `<img src="${user.profile_image_url}" class="${sizeClass} rounded-full object-cover border-4 border-white dark:border-[#2a2a35] shadow-lg" alt="${user.name}">`;
            }
            const initial = (user.name || '?').charAt(0).toUpperCase();
            return `
                <div class="${sizeClass} rounded-full bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-white/10 dark:to-white/5 flex items-center justify-center text-xl md:text-2xl font-bold text-neutral-600 dark:text-white border-4 border-white dark:border-[#2a2a35] shadow-lg">
                    ${initial}
                </div>
            `;
        }

        let currentMode = 'students';

        function switchMode(mode) {
            currentMode = mode;
            // Update button styles
            const btnStudents = document.getElementById('btnStudents');
            const btnOverall = document.getElementById('btnOverall');
            const activeClasses = 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25';
            const inactiveClasses = 'bg-neutral-100 dark:bg-white/5 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-white/10';

            if (mode === 'students') {
                btnStudents.className = `mode-btn px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${activeClasses}`;
                btnOverall.className = `mode-btn px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${inactiveClasses}`;
            } else {
                btnOverall.className = `mode-btn px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${activeClasses}`;
                btnStudents.className = `mode-btn px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${inactiveClasses}`;
            }
            fetchLeaderboard();
        }

        async function fetchLeaderboard() {
            const podiumEl = document.getElementById('podiumContainer');
            const listEl = document.getElementById('listContainer');
            const emptyState = document.getElementById('emptyState');

            // Show loading skeletons
            podiumEl.innerHTML = '<div class="w-full h-64 bg-neutral-100 dark:bg-white/5 rounded-3xl animate-pulse"></div>';
            listEl.innerHTML = '<div class="space-y-2"><div class="h-16 rounded-xl bg-neutral-100 dark:bg-white/5 animate-pulse"></div><div class="h-16 rounded-xl bg-neutral-100 dark:bg-white/5 animate-pulse"></div></div>';

            try {
                const res = await fetch(`${API_BASE}/api/leaderboard?limit=10&mode=${currentMode}`);
                if (!res.ok) throw new Error('API Error');
                const data = await res.json();
                const users = data.leaderboard || [];

                if (users.length === 0) {
                    podiumEl.innerHTML = '';
                    listEl.innerHTML = '';
                    emptyState.classList.remove('hidden');
                    return;
                }

                // Split top 3 and rest
                const top3 = users.slice(0, 3);
                const rest = users.slice(3);

                // Render Podium
                let podiumHTML = '';

                // Rank 2 (Left)
                if (top3[1]) {
                    podiumHTML += `
                        <div class="podium-item podium-2 flex flex-col items-center">
                            <div class="relative mb-3">
                                ${getAvatar(top3[1], 'md')}
                                <div class="absolute -bottom-2 -right-2 w-7 h-7 rounded-full rank-gradient-2 flex items-center justify-center text-xs font-bold text-neutral-800 border-2 border-white dark:border-[#1a1a24]">2</div>
                            </div>
                            <div class="text-center">
                                <div class="font-bold text-neutral-800 dark:text-white truncate max-w-[120px]">${top3[1].name}</div>
                                <div class="text-sm font-semibold text-orange-500">${top3[1].current_streak} 🔥</div>
                            </div>
                            <div class="w-24 md:w-32 h-24 md:h-32 rank-gradient-2 rounded-t-xl mt-4 border-x border-t border-white/20 opacity-80 relative overflow-hidden flex items-end justify-center pb-2">
                                <div class="absolute inset-0 bg-white/10"></div>
                                <div class="relative text-neutral-800/20 font-black text-5xl">2</div>
                            </div>
                        </div>
                    `;
                } else {
                    podiumHTML += `<div class="hidden md:block w-32"></div>`;
                }

                // Rank 1 (Center)
                if (top3[0]) {
                    podiumHTML += `
                        <div class="podium-item podium-1 flex flex-col items-center z-10 -mb-2 md:-mb-0">
                            <div class="relative mb-4 glow-gold rounded-full">
                                <span class="material-symbols-rounded absolute -top-8 left-1/2 -translate-x-1/2 text-4xl text-yellow-400 crown-icon">crown</span>
                                ${getAvatar(top3[0], 'lg')}
                                <div class="absolute -bottom-3 -right-3 w-8 h-8 rounded-full rank-gradient-1 flex items-center justify-center text-sm font-black text-yellow-900 border-2 border-white dark:border-[#1a1a24]">1</div>
                            </div>
                            <div class="text-center mb-1">
                                <div class="text-lg font-black text-neutral-900 dark:text-white truncate max-w-[150px]">${top3[0].name}</div>
                                <div class="text-xl font-black text-orange-500 drop-shadow-sm">${top3[0].current_streak} 🔥</div>
                            </div>
                            <div class="w-28 md:w-40 h-32 md:h-44 rank-gradient-1 rounded-t-2xl mt-2 flex items-end justify-center pb-4 shadow-xl shadow-orange-500/10 relative overflow-hidden">
                                <div class="absolute inset-0 bg-white/20"></div>
                                <div class="relative text-yellow-900/40 font-black text-6xl opacity-50">1</div>
                            </div>
                        </div>
                    `;
                }

                // Rank 3 (Right)
                if (top3[2]) {
                    podiumHTML += `
                        <div class="podium-item podium-3 flex flex-col items-center">
                            <div class="relative mb-3">
                                ${getAvatar(top3[2], 'md')}
                                <div class="absolute -bottom-2 -right-2 w-7 h-7 rounded-full rank-gradient-3 flex items-center justify-center text-xs font-bold text-amber-900 border-2 border-white dark:border-[#1a1a24]">3</div>
                            </div>
                            <div class="text-center">
                                <div class="font-bold text-neutral-800 dark:text-white truncate max-w-[120px]">${top3[2].name}</div>
                                <div class="text-sm font-semibold text-orange-500">${top3[2].current_streak} 🔥</div>
                            </div>
                            <div class="w-24 md:w-32 h-20 md:h-24 rank-gradient-3 rounded-t-xl mt-4 border-x border-t border-white/20 opacity-80 relative overflow-hidden flex items-end justify-center pb-2">
                                <div class="absolute inset-0 bg-white/10"></div>
                                <div class="relative text-amber-900/20 font-black text-5xl">3</div>
                            </div>
                        </div>
                    `;
                } else {
                    podiumHTML += `<div class="hidden md:block w-32"></div>`;
                }

                podiumEl.innerHTML = podiumHTML;

                // Render List
                if (rest.length > 0) {
                    listEl.innerHTML = rest.map(user => `
                        <div class="glass-item flex items-center justify-between p-3 rounded-xl cursor-default group border border-transparent hover:border-black/5 dark:hover:border-white/5 transition-all bg-white/40 dark:bg-white/5 mb-2">
                            <div class="flex items-center gap-4 min-w-0">
                                <div class="w-8 font-bold text-neutral-400 dark:text-neutral-500 text-center font-mono shrink-0">#${user.rank}</div>
                                
                                <div class="flex items-center gap-3 min-w-0">
                                    <div class="w-10 h-10 rounded-full overflow-hidden bg-neutral-200 dark:bg-white/10 shrink-0 relative border border-white/20">
                                        ${user.profile_image_url
                            ? `<img src="${user.profile_image_url}" class="w-full h-full object-cover">`
                            : `<div class="w-full h-full flex items-center justify-center font-bold text-xs text-neutral-500">${(user.name || '?').charAt(0)}</div>`
                        }
                                    </div>
                                    <div class="font-semibold text-neutral-800 dark:text-neutral-200 group-hover:text-brand-500 transition-colors truncate">
                                        ${user.name}
                                    </div>
                                </div>
                            </div>

                            <div class="font-bold text-neutral-900 dark:text-white px-3 py-1 rounded-lg shrink-0 text-right">
                                ${user.current_streak} <span class="text-orange-500 text-sm">🔥</span>
                            </div>
                        </div>
                    `).join('');
                } else {
                    listEl.innerHTML = '<div class="text-center py-8 text-neutral-400 dark:text-neutral-600 italic">No other runners yet.</div>';
                }

            } catch (err) {
                console.error(err);
                // Fallback / Error state
            }
        }

        window.addEventListener('load', () => {
            fetchLeaderboard();
            setTimeout(() => document.body.classList.add('loaded'), 600);
        });
