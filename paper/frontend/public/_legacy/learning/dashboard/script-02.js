// Extracted from ui/learning/dashboard.html (inline <script> #2).
        document.addEventListener('DOMContentLoaded', function () {
            const plan = PaperXLearning.ensurePlan();
            const progress = PaperXLearning.getProgress();
            const planTitle = document.getElementById('planTitle');
            const planSubtitle = document.getElementById('planSubtitle');
            const planLanguage = document.getElementById('planLanguage');
            const planStack = document.getElementById('planStack');
            const planGoal = document.getElementById('planGoal');
            const planCompanies = document.getElementById('planCompanies');
            const moduleContainer = document.getElementById('moduleContainer');
            const moduleTemplate = document.getElementById('moduleTemplate');
            const topicTemplate = document.getElementById('topicTemplate');

            planTitle.textContent = plan.plan_title || 'Learning Track';
            planSubtitle.textContent = plan.overview || 'Company-aware modules for your upcoming interview goals.';
            planLanguage.textContent = 'Language: ' + (plan.language || '').toUpperCase();
            planStack.textContent = 'Stack: ' + (plan.stack || '').toUpperCase();
            planGoal.textContent = 'Goal: ' + (plan.goal || '').replace(/_/g, ' ').toUpperCase();
            planCompanies.textContent = 'Companies: ' + (plan.companies || []).map(c => c.toUpperCase()).join(', ');

            function updateSummary() {
                const metrics = PaperXLearning.computeProgressMetrics(plan, PaperXLearning.getProgress());
                document.getElementById('progressRate').textContent = metrics.completionRate + '%';
                document.getElementById('completedCount').textContent = metrics.completedTopics;
                document.getElementById('inProgressCount').textContent = metrics.inProgressTopics;
                document.getElementById('totalCount').textContent = metrics.totalTopics;
            }

            function applyStatus(topicCard, status) {
                const indicator = topicCard.querySelector('.status-indicator');
                indicator.classList.remove('bg-white/10', 'bg-brand-500/20', 'bg-brand-300/20');
                let label = 'Not started';
                if (status === 'in_progress') {
                    indicator.classList.add('bg-brand-500/20');
                    label = 'In progress';
                } else if (status === 'completed') {
                    indicator.classList.add('bg-brand-300/20');
                    label = 'Completed';
                } else {
                    indicator.classList.add('bg-white/10');
                }
                indicator.textContent = label.toUpperCase();
            }

            function renderModules() {
                moduleContainer.innerHTML = '';
                (plan.modules || []).forEach(function (module) {
                    const moduleNode = moduleTemplate.content.firstElementChild.cloneNode(true);
                    moduleNode.querySelector('h3').textContent = module.title;
                    moduleNode.querySelector('p').textContent = module.description || 'Focus on mastering core concepts with curated notes and practice.';
                    moduleNode.querySelector('.module-duration').textContent = module.duration_hours ? Math.round(module.duration_hours) : '~4';
                    const topicsBucket = moduleNode.querySelector('[data-topics]');

                    (module.topics || []).forEach(function (topic) {
                        const topicNode = topicTemplate.content.firstElementChild.cloneNode(true);
                        topicNode.querySelector('h4').textContent = topic.title;
                        topicNode.querySelector('p').textContent = topic.description || 'Explore company-specific patterns, curated notes, and coding drills.';
                        const status = (progress[topic.topic_id] && progress[topic.topic_id].status) || 'not_started';
                        applyStatus(topicNode, status);
                        topicNode.querySelector('.mark-progress').addEventListener('click', function () {
                            PaperXLearning.updateProgress(topic.topic_id, 'in_progress');
                            applyStatus(topicNode, 'in_progress');
                            updateSummary();
                        });
                        topicNode.querySelector('.mark-complete').addEventListener('click', function () {
                            PaperXLearning.updateProgress(topic.topic_id, 'completed');
                            applyStatus(topicNode, 'completed');
                            updateSummary();
                        });
                        const viewLink = topicNode.querySelector('.view-topic');
                        viewLink.href = 'topic.html?topic=' + encodeURIComponent(topic.topic_id);
                        viewLink.addEventListener('click', function () {
                            PaperXLearning.setLastTopic(topic.topic_id);
                        });
                        topicsBucket.appendChild(topicNode);
                    });
                    moduleContainer.appendChild(moduleNode);
                });
            }

            renderModules();
            updateSummary();
        });
