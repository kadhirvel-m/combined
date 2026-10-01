// Extracted from ui/learning/mock.html (inline <script> #2).
        document.addEventListener('DOMContentLoaded', function () {
            const plan = PaperXLearning.ensurePlan();
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

            const topicChecklist = document.getElementById('topicChecklist');
            const checkTemplate = document.getElementById('checkTemplate');
            (plan.modules || []).forEach(function (module) {
                (module.topics || []).forEach(function (topic) {
                    const node = checkTemplate.content.firstElementChild.cloneNode(true);
                    node.querySelector('span').textContent = topic.title;
                    node.querySelector('input').value = topic.title;
                    topicChecklist.appendChild(node);
                });
            });

            const form = document.getElementById('mockForm');
            const mockOutput = document.getElementById('mockOutput');
            const mockStatus = document.getElementById('mockStatus');
            const exportBtn = document.getElementById('exportSession');
            let latestPlan = null;

            const sectionTemplate = document.getElementById('sectionTemplate');
            const questionTemplate = document.getElementById('questionTemplate');

            function renderSection(name, questions) {
                const section = sectionTemplate.content.firstElementChild.cloneNode(true);
                section.querySelector('h3').textContent = name;
                const bucket = section.querySelector('div');
                (questions || []).forEach(function (q) {
                    const card = questionTemplate.content.firstElementChild.cloneNode(true);
                    card.querySelector('p.font-semibold').textContent = q.title || q.prompt || 'Question';
                    card.querySelector('p.mt-1').textContent = q.rubric || 'Focus on clarity, structure, and company alignment.';
                    const meta = card.querySelector('div.flex');
                    meta.innerHTML = '';
                    if (q.difficulty) {
                        const pill = document.createElement('span');
                        pill.textContent = 'Difficulty: ' + q.difficulty;
                        meta.appendChild(pill);
                    }
                    if (q.estimated_minutes) {
                        const pill = document.createElement('span');
                        pill.textContent = 'Time: ' + q.estimated_minutes + ' mins';
                        meta.appendChild(pill);
                    }
                    bucket.appendChild(card);
                });
                mockOutput.appendChild(section);
            }

            form.addEventListener('submit', async function (event) {
                event.preventDefault();
                mockStatus.textContent = '';
                mockOutput.innerHTML = '';
                const selectedTopics = Array.from(topicChecklist.querySelectorAll('input:checked')).map(function (input) { return input.value; });
                try {
                    latestPlan = await PaperXLearning.requestMock({
                        stack: plan.stack,
                        goal: plan.goal,
                        companies: plan.companies,
                        language: plan.language,
                        focus_round: document.getElementById('focusRound').value,
                        recent_topics: selectedTopics
                    });
                    Object.keys(latestPlan || {}).forEach(function (key) {
                        if (Array.isArray(latestPlan[key]) && latestPlan[key].length) {
                            renderSection(key.replace(/_/g, ' ').toUpperCase(), latestPlan[key]);
                        }
                    });
                } catch (err) {
                    mockStatus.textContent = 'Mock generation failed: ' + err.message;
                }
            });

            exportBtn.addEventListener('click', function () {
                if (!latestPlan) {
                    mockStatus.textContent = 'Generate a session before exporting.';
                    return;
                }
                const blob = new Blob([JSON.stringify(latestPlan, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'paperx-mock-session.json';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            });
        });
