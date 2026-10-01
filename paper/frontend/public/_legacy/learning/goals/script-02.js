// Extracted from ui/learning/goals.html (inline <script> #2).
        document.addEventListener('DOMContentLoaded', async function () {
            const token = PaperXLearning.requireAuth({ redirectTo: '../login.html' });
            if (!token) {
                return;
            }
            if (!PaperXLearning.getPlan()) {
                try { await PaperXLearning.loadLatestPlan(); } catch (_) { }
            }
            const language = PaperXLearning.getLanguage();
            if (!language) {
                window.location.href = 'onboarding.html';
                return;
            }
            const languageBadge = document.getElementById('languageBadge');
            languageBadge.textContent = 'Language: ' + language.toUpperCase();

            const stackContainer = document.getElementById('stackOptions');
            const goalContainer = document.getElementById('goalOptions');
            const companyContainer = document.getElementById('companyOptions');
            const domainList = document.getElementById('domainList');
            const loadingOverlay = document.getElementById('loadingOverlay');
            const statusEl = document.getElementById('planStatus');
            const stackError = document.getElementById('stackError');
            const goalError = document.getElementById('goalError');

            let selectedStack = null;
            let selectedGoal = null;
            const selectedCompanies = new Set();

            function resetErrors() {
                stackError.classList.add('hidden');
                goalError.classList.add('hidden');
            }

            function selectExclusive(container, node, setter) {
                Array.from(container.children).forEach(function (item) { item.classList.remove('active'); });
                node.classList.add('active');
                setter();
            }

            try {
                const config = await PaperXLearning.fetchLearningConfig();
                domainList.textContent = (config.allowed_domains || []).join(', ');

                const stackTemplate = document.getElementById('stackTemplate');
                (config.stacks || []).forEach(function (stack) {
                    const node = stackTemplate.content.firstElementChild.cloneNode(true);
                    node.querySelector('span.text-base').textContent = stack.toUpperCase();
                    node.addEventListener('click', function () {
                        selectExclusive(stackContainer, node, function () { selectedStack = stack; });
                        resetErrors();
                    });
                    stackContainer.appendChild(node);
                });

                const goalTemplate = document.getElementById('goalTemplate');
                (config.goals || []).forEach(function (goal) {
                    const node = goalTemplate.content.firstElementChild.cloneNode(true);
                    node.textContent = goal.replace(/_/g, ' ').toUpperCase();
                    node.addEventListener('click', function () {
                        selectExclusive(goalContainer, node, function () { selectedGoal = goal; });
                        resetErrors();
                    });
                    goalContainer.appendChild(node);
                });

                const companyTemplate = document.getElementById('companyTemplate');
                (config.companies || []).forEach(function (company) {
                    const node = companyTemplate.content.firstElementChild.cloneNode(true);
                    node.textContent = company.toUpperCase();
                    node.addEventListener('click', function () {
                        if (selectedCompanies.has(company)) {
                            selectedCompanies.delete(company);
                            node.classList.remove('active');
                        } else {
                            if (selectedCompanies.size >= 4) {
                                statusEl.textContent = 'You can track up to four companies at a time.';
                                statusEl.classList.remove('hidden');
                                setTimeout(() => statusEl.classList.add('hidden'), 2500);
                                return;
                            }
                            selectedCompanies.add(company);
                            node.classList.add('active');
                        }
                    });
                    companyContainer.appendChild(node);
                });

                const filters = PaperXLearning.getFilters();
                if (filters.stack) {
                    Array.from(stackContainer.children).forEach(function (item) {
                        if (item.querySelector('span.text-base').textContent.toLowerCase() === filters.stack.toLowerCase()) {
                            item.classList.add('active');
                            selectedStack = filters.stack;
                        }
                    });
                }
                if (filters.goal) {
                    Array.from(goalContainer.children).forEach(function (item) {
                        if (item.textContent.toLowerCase().replace(/\s+/g, '_') === filters.goal) {
                            item.classList.add('active');
                            selectedGoal = filters.goal;
                        }
                    });
                }
                if (filters.companies) {
                    filters.companies.forEach(function (company) {
                        Array.from(companyContainer.children).forEach(function (item) {
                            if (item.textContent.toLowerCase() === company.toLowerCase()) {
                                item.classList.add('active');
                                selectedCompanies.add(company);
                            }
                        });
                    });
                }
            } catch (err) {
                statusEl.textContent = 'Unable to load config: ' + err.message;
                statusEl.classList.remove('hidden');
            }

            document.getElementById('goalForm').addEventListener('submit', async function (event) {
                event.preventDefault();
                resetErrors();
                if (!selectedStack) {
                    stackError.textContent = 'Select a stack to continue.';
                    stackError.classList.remove('hidden');
                    return;
                }
                if (!selectedGoal) {
                    goalError.textContent = 'Select a goal to continue.';
                    goalError.classList.remove('hidden');
                    return;
                }
                loadingOverlay.classList.remove('hidden');
                statusEl.classList.add('hidden');
                try {
                    await PaperXLearning.requestLearningPath({
                        language: language,
                        stack: selectedStack,
                        goal: selectedGoal,
                        companies: Array.from(selectedCompanies),
                    });
                    PaperXLearning.storeFilters({
                        language: language,
                        stack: selectedStack,
                        goal: selectedGoal,
                        companies: Array.from(selectedCompanies)
                    });
                    window.location.href = 'dashboard.html';
                } catch (err) {
                    statusEl.textContent = 'Generation failed: ' + err.message;
                    statusEl.classList.remove('hidden');
                } finally {
                    loadingOverlay.classList.add('hidden');
                }
            });
        });
