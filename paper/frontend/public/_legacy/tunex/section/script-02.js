// Extracted from ui/tunex/section.html (inline <script> #2).
        const API_BASE = 'http://0.0.0.0:10000';

        function sectionApp() {
            return {
                sectionId: null,
                langName: '',
                sectionName: '',
                topics: [],
                loading: true,
                showAddModal: false,
                showEditModal: false,
                showDeleteModal: false,
                newTopic: { title: '', order_index: 0 },
                editingTopic: { id: null, title: '' },
                deletingTopic: null,

                init() {
                    const params = new URLSearchParams(window.location.search);
                    this.sectionId = params.get('id');
                    this.langName = params.get('langName') || 'Language';

                    if (!this.sectionId) {
                        alert("No section ID provided");
                        window.history.back();
                        return;
                    }
                    this.fetchData();
                },

                goBack() {
                    window.history.back();
                },

                goToTopic(topic) {
                    const params = new URLSearchParams({
                        id: topic.id,
                        title: topic.title,
                        sectionId: this.sectionId,
                        langName: this.langName
                    });
                    window.location.href = `topic.html?${params.toString()}`;
                },

                async fetchData() {
                    this.loading = true;
                    try {
                        // Fetch section details to get the name
                        const sectionRes = await fetch(`${API_BASE}/api/lcoding/sections/${this.sectionId}`);
                        if (sectionRes.ok) {
                            const sectionData = await sectionRes.json();
                            this.sectionName = sectionData.title || sectionData.name || 'Section';
                        }

                        // Fetch topics for this section
                        const topicRes = await fetch(`${API_BASE}/api/lcoding/sections/${this.sectionId}/topics`);
                        if (topicRes.ok) this.topics = await topicRes.json();

                        if (this.topics.length > 0) {
                            const maxOrder = Math.max(...this.topics.map(t => t.order_index));
                            this.newTopic.order_index = maxOrder + 10;
                        }

                    } catch (e) {
                        console.error("Failed to fetch data", e);
                    } finally {
                        this.loading = false;
                    }
                },

                async createTopic() {
                    if (!this.newTopic.title) return alert("Title is required");

                    // Prepare payload - only title and order_index
                    const payload = {
                        title: this.newTopic.title,
                        order_index: this.newTopic.order_index
                    };

                    try {
                        const res = await fetch(`${API_BASE}/api/lcoding/sections/${this.sectionId}/topics`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                        });

                        if (res.ok) {
                            this.showAddModal = false;
                            // Reset title, increment order_index
                            this.newTopic.title = '';
                            this.newTopic.order_index += 10;
                            this.fetchData();
                        } else {
                            alert("Failed to create topic");
                        }
                    } catch (e) {
                        console.error("Error creating topic", e);
                        alert("Error creating topic");
                    }
                },

                renameTopic(topic) {
                    this.editingTopic = { ...topic };
                    this.showEditModal = true;
                },

                async confirmRename() {
                    if (!this.editingTopic.title) return alert("Title is required");
                    // Optimistic update
                    const oldTitle = this.topics.find(t => t.id === this.editingTopic.id).title;

                    try {
                        const res = await fetch(`${API_BASE}/api/lcoding/topics/${this.editingTopic.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ title: this.editingTopic.title })
                        });

                        if (res.ok) {
                            this.showEditModal = false;
                            this.fetchData();
                        } else {
                            alert("Failed to rename topic");
                        }
                    } catch (e) {
                        console.error("Error renaming topic", e);
                        alert("Error renaming topic");
                    }
                },

                deleteTopic(topic) {
                    this.deletingTopic = topic;
                    this.showDeleteModal = true;
                },

                async confirmDelete() {
                    if (!this.deletingTopic) return;

                    try {
                        const res = await fetch(`${API_BASE}/api/lcoding/topics/${this.deletingTopic.id}`, {
                            method: 'DELETE'
                        });

                        if (res.ok) {
                            this.showDeleteModal = false;
                            this.fetchData();
                        } else {
                            alert("Failed to delete topic");
                        }
                    } catch (e) {
                        console.error("Error deleting topic", e);
                        alert("Error deleting topic");
                    }
                }
            }
        }
