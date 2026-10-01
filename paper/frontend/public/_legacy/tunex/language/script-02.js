// Extracted from ui/tunex/language.html (inline <script> #2).
        const API_BASE = 'http://0.0.0.0:10000';

        function languageApp() {
            return {
                langId: null,
                language: null,
                levels: [],
                loading: true,
                showModal: false,
                isEdit: false,
                form: { id: null, title: '', order_index: 0 },
                // Local override image (used for specific language)
                overrideLogoUrl: "../assets/img/Gemini_Generated_Image_bvveffbvveffbvve%20(1).png",

                portraitLogoUrl() {
                    // Use the override image only for the left portrait box.
                    // Keep the real language.logo_url everywhere else (e.g., next to the title).
                    if (this.langId === '7c559763-2b7a-4042-a047-3d782fb3e381') return this.overrideLogoUrl;
                    return this.language?.logo_url || '';
                },

                init() {
                    const params = new URLSearchParams(window.location.search);
                    this.langId = params.get('id');
                    if (!this.langId) {
                        alert("No language ID provided");
                        window.location.href = 'index.html';
                        return;
                    }
                    this.fetchData();
                },

                async fetchData() {
                    this.loading = true;
                    try {
                        const [langRes, levelRes] = await Promise.all([
                            fetch(`${API_BASE}/api/lcoding/languages/${this.langId}`),
                            fetch(`${API_BASE}/api/lcoding/languages/${this.langId}/levels`)
                        ]);

                        if (langRes.ok) this.language = await langRes.json();
                        if (levelRes.ok) this.levels = await levelRes.json();

                        if (this.levels.length > 0 && !this.isEdit) {
                            const maxOrder = Math.max(...this.levels.map(l => l.order_index));
                            this.form.order_index = maxOrder + 10;
                        }

                    } catch (e) {
                        console.error("Failed to fetch data", e);
                    } finally {
                        this.loading = false;
                    }
                },

                openAddModal() {
                    this.isEdit = false;
                    this.form = { id: null, title: '', order_index: 0 };
                    // Recalculate max order
                    if (this.levels.length > 0) {
                        const maxOrder = Math.max(...this.levels.map(l => l.order_index));
                        this.form.order_index = maxOrder + 10;
                    }
                    this.showModal = true;
                },

                openEditModal(level) {
                    this.isEdit = true;
                    this.form = { id: level.id, title: level.title, order_index: level.order_index };
                    this.showModal = true;
                },

                closeModal() {
                    this.showModal = false;
                },

                async submitForm() {
                    if (!this.form.title) return alert("Title is required");

                    try {
                        let url = `${API_BASE}/api/lcoding/languages/${this.langId}/levels`;
                        let method = 'POST';

                        if (this.isEdit) {
                            url = `${API_BASE}/api/lcoding/levels/${this.form.id}`;
                            method = 'PUT';
                        }

                        const res = await fetch(url, {
                            method: method,
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                title: this.form.title,
                                order_index: this.form.order_index
                            })
                        });

                        if (res.ok) {
                            this.closeModal();
                            this.fetchData();
                        } else {
                            alert("Failed to " + (this.isEdit ? "update" : "create") + " level");
                        }
                    } catch (e) {
                        console.error("Error submitting form", e);
                        alert("Error occurred");
                    }
                },

                async deleteLevel() {
                    if (!confirm("Are you sure you want to delete this level? All associated sections and topics will be deleted.")) return;

                    try {
                        const res = await fetch(`${API_BASE}/api/lcoding/levels/${this.form.id}`, {
                            method: 'DELETE'
                        });

                        if (res.ok) {
                            this.closeModal();
                            this.fetchData();
                        } else {
                            alert("Failed to delete level");
                        }
                    } catch (e) {
                        console.error("Error deleting level", e);
                        alert("Error deleting level");
                    }
                }
            }
        }
