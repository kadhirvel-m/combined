// Extracted from ui/learning/faculty.html (inline <script> #2).
        document.addEventListener('DOMContentLoaded', async function () {
            const plan = PaperXLearning.ensurePlan();
            const progress = PaperXLearning.getProgress();
            const metrics = PaperXLearning.computeProgressMetrics(plan, progress);
            const planMeta = document.getElementById('planMeta');
            planMeta.innerHTML = '';
            ['language', 'stack', 'goal'].forEach(function (key) {
                const span = document.createElement('span');
                span.textContent = key + ': ' + (plan[key] || '').toUpperCase();
                planMeta.appendChild(span);
            });
            const companySpan = document.createElement('span');
            companySpan.textContent = 'companies: ' + (plan.companies || []).map(c => c.toUpperCase()).join(', ');
            planMeta.appendChild(companySpan);

            const snapshot = document.getElementById('planSnapshot');
            snapshot.innerHTML = '';
            snapshot.appendChild(document.createTextNode('Modules: ' + (plan.modules || []).length));
            snapshot.appendChild(document.createElement('br'));
            snapshot.appendChild(document.createTextNode('Topics completed: ' + metrics.completedTopics + ' / ' + metrics.totalTopics));
            snapshot.appendChild(document.createElement('br'));
            snapshot.appendChild(document.createTextNode('In progress: ' + metrics.inProgressTopics));

            const outline = {
                modules: (plan.modules || []).map(function (module) {
                    return {
                        title: module.title,
                        topics: (module.topics || []).map(function (topic) {
                            return {
                                title: topic.title,
                                status: progress[topic.topic_id]?.status || 'not_started'
                            };
                        })
                    };
                })
            };

            const progressSnapshot = {
                completion_rate: metrics.completionRate,
                completed_topics: metrics.completedTopics,
                in_progress_topics: metrics.inProgressTopics,
                total_topics: metrics.totalTopics
            };

            try {
                const brief = await PaperXLearning.requestFacultyBrief({
                    language: plan.language,
                    stack: plan.stack,
                    goal: plan.goal,
                    companies: plan.companies,
                    cohort_name: 'PaperX Learning Tracks',
                    plan_outline: outline,
                    progress_snapshot: progressSnapshot
                });
                renderBrief(brief);
            } catch (err) {
                document.getElementById('briefOverview').textContent = 'Unable to build faculty brief: ' + err.message;
            }

            function renderBrief(data) {
                const overview = document.getElementById('briefOverview');
                const actions = document.getElementById('briefActions');
                const support = document.getElementById('briefSupport');
                const risk = document.getElementById('briefRisk');
                const milestones = document.getElementById('briefMilestones');

                overview.textContent = data.overview || 'Learners are progressing steadily. Focus on reinforcing company-specific drills.';
                actions.innerHTML = '';
                (data.action_items || []).forEach(function (item) {
                    const li = document.createElement('li');
                    li.textContent = '• ' + item;
                    actions.appendChild(li);
                });
                support.innerHTML = '';
                (data.support_requests || []).forEach(function (item) {
                    const li = document.createElement('li');
                    li.textContent = '• ' + item;
                    support.appendChild(li);
                });
                risk.innerHTML = '';
                (data.at_risk_learners || []).forEach(function (item) {
                    const li = document.createElement('li');
                    li.textContent = '• ' + (item.name || item);
                    if (item.status) { li.textContent += ' (' + item.status + ')'; }
                    risk.appendChild(li);
                });
                milestones.innerHTML = '';
                (data.upcoming_milestones || []).forEach(function (item) {
                    const li = document.createElement('li');
                    li.textContent = '• ' + item;
                    milestones.appendChild(li);
                });
            }
        });
