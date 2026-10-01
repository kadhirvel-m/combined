// Extracted from ui/tales/romantasy.html (inline <script> #2).
        function romantasyApp() {
            return {
                isDark: document.documentElement.classList.contains('dark'),
                stories: [
                    { id: 1, title: 'Sample Moon Pact', tagline: 'A sample tagline about a pact under twin moons.', genres: ['Fae', 'Court'], cover: '../assets/img/img1.png', chapters: 46, progress: 32, rating: '4.8', fav: false, description: 'Sample description for Moon Pact story exploring alliances and shifting court politics.' },
                    { id: 2, title: 'Sample Ember Guild', tagline: 'Rival guilds forge uneasy alchemy.', genres: ['Alchemy', 'Guild'], cover: '../assets/img/img2.png', chapters: 38, progress: 54, rating: '4.6', fav: true, description: 'Sample description of guild intrigue and catalytic experiments.' },
                    { id: 3, title: 'Sample Starlace', tagline: 'Decoding threads of fate.', genres: ['Rebellion', 'Celestial'], cover: '../assets/img/img3.png', chapters: 52, progress: 12, rating: '4.7', fav: false, description: 'Sample description about unraveling celestial control patterns.' },
                    { id: 4, title: 'Sample Thorn Trial', tagline: 'Trials awaken hidden empathy.', genres: ['Trials', 'Dark Bloom'], cover: '../assets/img/img4.png', chapters: 29, progress: 67, rating: '4.5', fav: false, description: 'Sample description on botanical trials reacting to emotions.' },
                    { id: 5, title: 'Sample Rune Sonata', tagline: 'Runic music stabilizes realms.', genres: ['Runes', 'Music'], cover: '../assets/img/img1.png', chapters: 41, progress: 0, rating: '4.4', fav: false, description: 'Sample description on harmonic resonance repairing borders.' },
                    { id: 6, title: 'Sample Relic Pact', tagline: 'Relic selects broken destinies.', genres: ['Relic', 'Prophecy'], cover: '../assets/img/img2.png', chapters: 34, progress: 83, rating: '4.9', fav: true, description: 'Sample description on divergent echo memories.' },
                    { id: 7, title: 'Sample Lumen Warden', tagline: 'Stabilizing flickering towers.', genres: ['Vows', 'Arc Light'], cover: '../assets/img/img3.png', chapters: 55, progress: 21, rating: '4.6', fav: false, description: 'Sample description on auric conduit stability quests.' },
                    { id: 8, title: 'Sample Ash Serenade', tagline: 'Glass harps echo secrets.', genres: ['Elemental', 'Song'], cover: '../assets/img/img4.png', chapters: 27, progress: 9, rating: '4.3', fav: false, description: 'Sample description on ashfall cadence patterns.' }
                ],
                filters: ['Fae', 'Court', 'Alchemy', 'Guild', 'Rebellion', 'Celestial', 'Trials', 'Runes', 'Music', 'Relic', 'Prophecy', 'Vows', 'Elemental', 'Song'],
                activeFilter: 'all',
                search: '',
                modalOpen: false,
                activeStory: null,
                viewMode: 'grid',
                init() { },
                filteredStories() {
                    const term = this.search.trim().toLowerCase();
                    return this.stories.filter(s => {
                        const fOk = this.activeFilter === 'all' || s.genres.includes(this.activeFilter);
                        const tOk = !term || s.title.toLowerCase().includes(term) || s.tagline.toLowerCase().includes(term);
                        return fOk && tOk;
                    });
                },
                favorites() { return this.stories.filter(s => s.fav) },
                span(s) { const n = s.id % 6; if (n === 0) return 'row-span-2 col-span-2 min-h-[410px]'; if (n === 1) return 'row-span-2'; if (n === 2) return 'col-span-2'; return '' },
                chip(f) {
                    const base = 'px-3 py-1.5 rounded-full text-[12px] font-medium focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-brand-500/50 transition';
                    const active = this.activeFilter === f;
                    if (active) {
                        return base + ' text-white shadow-glow ring-1 ring-brand-500/40 bg-gradient-to-r from-[#9E4B8A] via-[#B06AB3] to-[#FF7FD1] hover:from-[#A65592] hover:via-[#BB76BC] hover:to-[#FF8AD5]';
                    }
                    return base + ' ring-1 ' + (this.isDark
                        ? 'bg-white/10 text-white/75 ring-white/15 hover:bg-white/15'
                        : 'bg-brandlt-100 text-ink/80 ring-brandlt-200 hover:bg-brandlt-200');
                },
                toggleFav(s) { s.fav = !s.fav },
                queueStory(s) { s.queued = true },
                openStory(s) { this.activeStory = s; this.modalOpen = true },
                closeModal() { this.modalOpen = false; this.activeStory = null },
                toggleTheme() {
                    const root = document.documentElement;
                    const switchingToDark = !root.classList.contains('dark');
                    if (switchingToDark) {
                        root.classList.add('dark');
                        root.classList.remove('light');
                    } else {
                        root.classList.remove('dark');
                        root.classList.add('light');
                    }
                    this.isDark = switchingToDark;
                    try { localStorage.setItem('px_theme', switchingToDark ? 'dark' : 'light'); } catch (e) { }
                }
            }
        }
