// Extracted from ui/learning/analytics.html (inline <script> #2).
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

            document.getElementById('statCompletion').textContent = metrics.completionRate + '%';
            document.getElementById('completionBar').style.width = metrics.completionRate + '%';
            document.getElementById('statModules').textContent = (plan.modules || []).length;
            const streak = Math.max(metrics.completedTopics, metrics.inProgressTopics ? 1 : 0);
            document.getElementById('statStreak').textContent = streak + ' day' + (streak === 1 ? '' : 's');

            const topicTemplate = document.getElementById('topicCardTemplate');
            const topicBreakdown = document.getElementById('topicBreakdown');
            topicBreakdown.innerHTML = '';
            (plan.modules || []).forEach(function (module) {
                (module.topics || []).forEach(function (topic) {
                    const node = topicTemplate.content.firstElementChild.cloneNode(true);
                    node.querySelector('p.text-sm').textContent = topic.title;
                    const status = progress[topic.topic_id]?.status || 'not_started';
                    node.querySelector('p.text-xs').textContent = status.replace(/_/g, ' ').toUpperCase();
                    const percent = status === 'completed' ? 100 : status === 'in_progress' ? 50 : 10;
                    node.querySelector('.progress').style.width = percent + '%';
                    topicBreakdown.appendChild(node);
                });
            });

            async function loadInsights() {
                const highlights = [];
                const blockers = [];
                (plan.modules || []).forEach(function (module) {
                    (module.topics || []).forEach(function (topic) {
                        const status = progress[topic.topic_id]?.status || 'not_started';
                        if (status === 'completed') highlights.push(topic.title);
                        if (status === 'not_started') blockers.push(topic.title);
                    });
                });
                try {
                    const insights = await PaperXLearning.requestAnalytics({
                        language: plan.language,
                        stack: plan.stack,
                        goal: plan.goal,
                        companies: plan.companies,
                        metrics: {
                            completion_rate: metrics.completionRate,
                            completed_topics: metrics.completedTopics,
                            total_topics: metrics.totalTopics,
                            in_progress_topics: metrics.inProgressTopics,
                        },
                        highlights: highlights.slice(0, 5),
                        blockers: blockers.slice(0, 5)
                    });
                    renderInsights(insights);
                } catch (err) {
                    const summary = document.getElementById('insightSummary');
                    summary.innerHTML = '';
                    const warning = document.createElement('p');
                    warning.className = 'rounded-xl bg-rose-100 px-3 py-2 text-sm text-rose-700';
                    warning.textContent = 'Analytics unavailable: ' + err.message;
                    summary.appendChild(warning);
                }
            }

            function renderInsights(data) {
                const summary = document.getElementById('insightSummary');
                const recommendationList = document.getElementById('recommendationList');
                const riskList = document.getElementById('riskList');
                summary.innerHTML = '';
                recommendationList.innerHTML = '';
                riskList.innerHTML = '';

                const summaryText = document.createElement('p');
                summaryText.textContent = data.summary || 'Learning momentum looks healthy. Keep reviewing company question sets regularly.';
                summary.appendChild(summaryText);

                if (data.wins) {
                    const wins = document.createElement('ul');
                    wins.className = 'space-y-2 text-sm text-brand-900/70';
                    data.wins.forEach(function (win) {
                        const li = document.createElement('li');
                        li.textContent = '• ' + win;
                        wins.appendChild(li);
                    });
                    summary.appendChild(wins);
                }

                (data.recommendations || []).forEach(function (rec) {
                    const li = document.createElement('li');
                    li.textContent = '• ' + rec;
                    recommendationList.appendChild(li);
                });

                (data.risks || []).forEach(function (risk) {
                    const li = document.createElement('li');
                    li.textContent = '• ' + risk;
                    riskList.appendChild(li);
                });
            }

            document.getElementById('refreshInsights').addEventListener('click', function () {
                document.getElementById('insightSummary').innerHTML = '<p class="text-brand-900/60">Refreshing…</p>';
                loadInsights();
            });

            loadInsights();
        });
