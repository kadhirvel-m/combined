// Extracted from ui/tunex/index.html (inline <script> #2).
        const API_BASE = 'http://0.0.0.0:10000'; // Adjust as needed

        function tracksApp() {
            return {
                languages: [],
                loading: true,
                showModal: false,
                isEdit: false,
                form: { id: null, name: '', description: '', logo: null, logo_url: '' },

                init() {
                    this.fetchLanguages();
                },

                async fetchLanguages() {
                    this.loading = true;
                    try {
                        const res = await fetch(`${API_BASE}/api/lcoding/languages`);
                        if (res.ok) {
                            this.languages = await res.json();
                        }
                    } catch (e) {
                        console.error("Failed to fetch languages", e);
                    } finally {
                        this.loading = false;
                    }
                },

                openAddModal() {
                    this.isEdit = false;
                    this.form = { id: null, name: '', description: '', logo: null, logo_url: '' };
                    this.showModal = true;
                    this.resetFileInput();
                },

                openEditModal(lang) {
                    this.isEdit = true;
                    // Clone to avoid modifying view directly
                    this.form = {
                        id: lang.id,
                        name: lang.name,
                        description: lang.description,
                        logo_url: lang.logo_url,
                        logo: null
                    };
                    this.showModal = true;
                    this.resetFileInput();
                },

                closeModal() {
                    this.showModal = false;
                },

                resetFileInput() {
                    const input = document.querySelector('input[type="file"]');
                    if (input) input.value = '';
                },

                async submitForm() {
                    if (!this.form.name) return alert("Name is required");

                    try {
                        const formData = new FormData();
                        formData.append('name', this.form.name);
                        if (this.form.description) formData.append('description', this.form.description);
                        if (this.form.logo) formData.append('logo', this.form.logo);

                        let url = `${API_BASE}/api/lcoding/languages`;
                        let method = 'POST';

                        if (this.isEdit) {
                            url += `/${this.form.id}`;
                            method = 'PUT';
                        }

                        const res = await fetch(url, {
                            method: method,
                            body: formData
                        });

                        if (res.ok) {
                            this.closeModal();
                            this.fetchLanguages();
                        } else {
                            alert("Failed to " + (this.isEdit ? "update" : "create") + " language");
                        }
                    } catch (e) {
                        console.error("Error submitting form", e);
                        alert("Error " + (this.isEdit ? "updating" : "creating") + " language");
                    }
                }
            }
        }
