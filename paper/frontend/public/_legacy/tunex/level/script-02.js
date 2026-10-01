// Extracted from ui/tunex/level.html (inline <script> #2).
        const API_BASE = 'http://0.0.0.0:10000';

        function levelApp() {
            return {
                levelId: null,
                langName: '',
                level: null,
                language: null,
                sections: [],
                sectionTopics: {},
                sectionOpen: {},
                sectionLoading: {},
                loading: true,
                showAddModal: false,
                newSection: { title: '', order_index: 0 },

                init() {
                    const params = new URLSearchParams(window.location.search);
                    this.levelId = params.get('id');
                    this.langName = params.get('langName') || 'Language';

                    if (!this.levelId) {
                        alert("No level ID provided");
                        window.history.back();
                        return;
                    }
                    this.fetchData();
                },

                goBack() {
                    window.history.back();
                },

                async fetchData() {
                    this.loading = true;
                    try {
                        const [levelRes, secRes] = await Promise.all([
                            fetch(`${API_BASE}/api/lcoding/levels/${this.levelId}`),
                            fetch(`${API_BASE}/api/lcoding/levels/${this.levelId}/sections`)
                        ]);

                        if (levelRes.ok) this.level = await levelRes.json();
                        if (secRes.ok) this.sections = await secRes.json();

                        const languageId = this.level?.language_id || this.level?.languageId || this.level?.language?.id;
                        if (languageId) {
                            try {
                                const langRes = await fetch(`${API_BASE}/api/lcoding/languages/${languageId}`);
                                if (langRes.ok) this.language = await langRes.json();
                            } catch (e) {
                                console.warn('Failed to fetch language', e);
                            }
                        }

                        if (this.sections.length > 0) {
                            const maxOrder = Math.max(...this.sections.map(s => s.order_index));
                            this.newSection.order_index = maxOrder + 10;
                        }

                    } catch (e) {
                        console.error("Failed to fetch data", e);
                    } finally {
                        this.loading = false;
                    }
                },

                async toggleSection(section) {
                    const id = section.id;
                    this.sectionOpen[id] = !this.sectionOpen[id];
                    if (this.sectionOpen[id] && !this.sectionTopics[id]) {
                        await this.loadSectionTopics(id);
                    }
                },

                async loadSectionTopics(sectionId) {
                    this.sectionLoading[sectionId] = true;
                    try {
                        const res = await fetch(`${API_BASE}/api/lcoding/sections/${sectionId}/topics`);
                        if (res.ok) {
                            this.sectionTopics[sectionId] = await res.json();
                        } else {
                            this.sectionTopics[sectionId] = [];
                        }
                    } catch (e) {
                        console.error('Failed to fetch topics', e);
                        this.sectionTopics[sectionId] = [];
                    } finally {
                        this.sectionLoading[sectionId] = false;
                    }
                },

                goToTopic(section, topic) {
                    const params = new URLSearchParams({
                        id: topic.id,
                        title: topic.title,
                        sectionId: section.id,
                        langName: this.langName
                    });
                    window.location.href = `topic.html?${params.toString()}`;
                },

                async createSection() {
                    if (!this.newSection.title) return alert("Title is required");

                    try {
                        const res = await fetch(`${API_BASE}/api/lcoding/levels/${this.levelId}/sections`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(this.newSection)
                        });

                        if (res.ok) {
                            this.showAddModal = false;
                            this.newSection = { title: '', order_index: 0 };
                            this.fetchData();
                        } else {
                            alert("Failed to create section");
                        }
                    } catch (e) {
                        console.error("Error creating section", e);
                        alert("Error creating section");
                    }
                }

                ,

                logoUrl() {
                    if (this.isPython()) return '../assets/img/Gemini_Generated_Image_gaxquhgaxquhgaxq.png';
                    return this.language?.logo_url || '';
                },

                isPython() {
                    return (this.langName || '').trim().toLowerCase() === 'python'
                        || (this.language?.name || '').trim().toLowerCase() === 'python';
                }
            }
        }
