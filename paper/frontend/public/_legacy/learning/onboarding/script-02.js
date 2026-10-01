// Extracted from ui/learning/onboarding.html (inline <script> #2).
        document.addEventListener('DOMContentLoaded', async function () {
            const token = PaperXLearning.requireAuth({ redirectTo: '../login.html' });
            if (!token) {
                return;
            }
            try {
                const snapshot = await PaperXLearning.loadLatestPlan();
                if (snapshot && snapshot.plan) {
                    window.location.href = 'dashboard.html';
                    return;
                }
            } catch (_) { }
            const form = document.getElementById('languageForm');
            const container = document.getElementById('languageOptions');
            const template = document.getElementById('languageTemplate');
            const errorEl = document.getElementById('languageError');
            let selected = PaperXLearning.getLanguage();

            function renderOptions(languages) {
                container.innerHTML = '';
                languages.forEach(function (lang) {
                    const node = template.content.firstElementChild.cloneNode(true);
                    const [label, code] = Array.isArray(lang) ? lang : [lang.toUpperCase(), lang];
                    node.querySelector('span span:first-child').textContent = label.toString().trim();
                    node.querySelector('span span:last-child').textContent = code;
                    if (selected && selected === code) node.classList.add('active');
                    node.addEventListener('click', function () {
                        selected = code;
                        Array.from(container.children).forEach(function (child) { child.classList.remove('active'); });
                        node.classList.add('active');
                        errorEl.classList.add('hidden');
                    });
                    container.appendChild(node);
                });
            }

            try {
                const config = await PaperXLearning.fetchLearningConfig();
                renderOptions(config.languages || []);
                if (!selected && config.languages && config.languages.length) {
                    selected = config.languages[0];
                    Array.from(container.children)[0]?.classList.add('active');
                }
            } catch (err) {
                errorEl.textContent = 'Unable to load languages: ' + err.message;
                errorEl.classList.remove('hidden');
            }

            form.addEventListener('submit', function (event) {
                event.preventDefault();
                if (!selected) {
                    errorEl.textContent = 'Please choose a language to continue.';
                    errorEl.classList.remove('hidden');
                    return;
                }
                PaperXLearning.setLanguage(selected);
                window.location.href = 'goals.html';
            });
        });
