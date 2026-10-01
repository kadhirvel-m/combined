// Extracted from ui/learning/topic.html (inline <script> #2).
        document.addEventListener('DOMContentLoaded', async function () {
            const params = new URLSearchParams(window.location.search);
            const topicId = params.get('topic') || PaperXLearning.getLastTopic();
            const plan = PaperXLearning.ensurePlan();
            const config = await PaperXLearning.fetchLearningConfig();
            let currentTopic = null;

            outer: for (const module of plan.modules || []) {
                for (const topic of module.topics || []) {
                    if (!topicId || topic.topic_id === topicId) {
                        currentTopic = topic;
                        PaperXLearning.setLastTopic(topic.topic_id);
                        break outer;
                    }
                }
            }
            if (!currentTopic) {
                currentTopic = (plan.modules?.[0]?.topics?.[0]) || null;
            }
            if (!currentTopic) {
                document.getElementById('topicTitle').textContent = 'Topic unavailable';
                return;
            }

            const progress = PaperXLearning.getProgress();
            const topicStatus = progress[currentTopic.topic_id]?.status || 'not_started';

            const titleEl = document.getElementById('topicTitle');
            const subtitleEl = document.getElementById('topicSubtitle');
            const statusEl = document.getElementById('topicStatus');
            const objectivesEl = document.getElementById('objectiveList');
            const activityList = document.getElementById('activityList');
            const practiceList = document.getElementById('practiceList');
            const notesList = document.getElementById('notesList');
            const codeLanguageSelect = document.getElementById('compilerLanguage');
            const codeEditor = document.getElementById('codeEditor');
            const codeInput = document.getElementById('codeInput');
            const codeOutput = document.getElementById('codeOutput');
            const codeError = document.getElementById('codeError');
            const practiceOutput = document.getElementById('practiceOutput');
            const explainOutput = document.getElementById('explainOutput');

            const markInProgress = document.getElementById('markInProgress');
            const markComplete = document.getElementById('markComplete');
            const generatePractice = document.getElementById('generatePractice');
            const runCode = document.getElementById('runCode');
            const explainCode = document.getElementById('explainCode');

            function updateStatus(label) {
                statusEl.textContent = label.toUpperCase();
                statusEl.classList.remove('bg-brand-500', 'bg-brand-700', 'bg-brand-500/10', 'text-white');
                if (label === 'in_progress') {
                    statusEl.classList.add('bg-brand-700', 'text-white');
                } else if (label === 'completed') {
                    statusEl.classList.add('bg-brand-500', 'text-white');
                } else {
                    statusEl.classList.add('bg-brand-500/10');
                }
            }

            titleEl.textContent = currentTopic.title;
            subtitleEl.textContent = currentTopic.description || 'Company-aware practice with curated notes and interview tasks.';
            updateStatus(topicStatus);

            objectivesEl.innerHTML = '';
            (currentTopic.objectives || []).forEach(function (obj) {
                const li = document.createElement('li');
                li.textContent = obj;
                li.className = 'rounded-xl bg-brand-500/10 px-4 py-2';
                objectivesEl.appendChild(li);
            });

            const activityTemplate = document.getElementById('activityTemplate');
            function renderActivity(target, data) {
                const node = activityTemplate.content.firstElementChild.cloneNode(true);
                node.querySelector('p.text-sm').textContent = data.title || 'Activity';
                node.querySelector('p.text-xs').textContent = data.description || data.type || '';
                const meta = node.querySelector('div.flex');
                meta.innerHTML = '';
                ['type', 'difficulty', 'source'].forEach(function (key) {
                    if (data[key]) {
                        const span = document.createElement('span');
                        span.textContent = (key + ': ' + data[key]).toUpperCase();
                        meta.appendChild(span);
                    }
                });
                if (data.url) {
                    const link = document.createElement('a');
                    link.href = data.url;
                    link.target = '_blank';
                    link.rel = 'noopener';
                    link.textContent = 'Open resource';
                    link.className = 'inline-flex items-center gap-1 font-semibold text-brand-700';
                    meta.appendChild(link);
                }
                target.appendChild(node);
            }

            activityList.innerHTML = '';
            (currentTopic.activities || []).forEach(function (activity) { renderActivity(activityList, activity); });
            practiceList.innerHTML = '';
            (currentTopic.practice || []).forEach(function (activity) { renderActivity(practiceList, activity); });

            const noteTemplate = document.getElementById('noteTemplate');
            const sectionTemplate = document.getElementById('sectionTemplate');
            notesList.innerHTML = '';
            (currentTopic.notes || []).forEach(function (note) {
                const node = noteTemplate.content.firstElementChild.cloneNode(true);
                const sectionsTarget = node.querySelector('[data-sections]');
                node.querySelector('.note-link').textContent = note.title || note.url;
                node.querySelector('.note-link').href = note.url;
                sectionsTarget.innerHTML = '';
                (note.sections || []).forEach(function (section) {
                    const sNode = sectionTemplate.content.firstElementChild.cloneNode(true);
                    sNode.querySelector('h4').textContent = section.heading || 'Section';
                    sNode.querySelector('p').textContent = section.summary || '';
                    sectionsTarget.appendChild(sNode);
                });
                notesList.appendChild(node);
            });

            (config.compiler_languages || []).forEach(function (entry) {
                const option = document.createElement('option');
                option.value = entry.id;
                option.textContent = entry.name || entry.id;
                codeLanguageSelect.appendChild(option);
            });

            markInProgress.addEventListener('click', function () {
                PaperXLearning.updateProgress(currentTopic.topic_id, 'in_progress');
                updateStatus('in_progress');
            });
            markComplete.addEventListener('click', function () {
                PaperXLearning.updateProgress(currentTopic.topic_id, 'completed');
                updateStatus('completed');
            });

            generatePractice.addEventListener('click', async function () {
                generatePractice.disabled = true;
                generatePractice.textContent = 'Generating…';
                practiceOutput.innerHTML = '';
                try {
                    const practice = await PaperXLearning.requestPractice({
                        topic_title: currentTopic.title,
                        language: plan.language,
                        stack: plan.stack,
                        goal: plan.goal,
                        companies: plan.companies,
                        context: (currentTopic.description || '') + '\nObjectives: ' + (currentTopic.objectives || []).join(', ')
                    });

                    const blockTemplate = document.getElementById('practiceBlockTemplate');
                    if (practice.mcqs && practice.mcqs.length) {
                        const block = blockTemplate.content.firstElementChild.cloneNode(true);
                        block.querySelector('h3').textContent = 'MCQ Set';
                        const section = block.querySelector('div');
                        practice.mcqs.forEach(function (mcq, idx) {
                            const wrapper = document.createElement('div');
                            wrapper.innerHTML = '<p class="font-semibold">' + (idx + 1) + '. ' + mcq.question + '</p>';
                            const list = document.createElement('ul');
                            list.className = 'mt-1 list-disc pl-6 text-xs';
                            (mcq.options || []).forEach(function (opt) {
                                const li = document.createElement('li');
                                li.textContent = opt;
                                list.appendChild(li);
                            });
                            const answer = document.createElement('p');
                            answer.className = 'mt-1 text-xs font-semibold text-brand-700';
                            answer.textContent = 'Answer: ' + (mcq.answer || '');
                            const explanation = document.createElement('p');
                            explanation.className = 'text-xs text-brand-900/60';
                            explanation.textContent = mcq.explanation || '';
                            wrapper.appendChild(list);
                            wrapper.appendChild(answer);
                            wrapper.appendChild(explanation);
                            section.appendChild(wrapper);
                        });
                        practiceOutput.appendChild(block);
                    }
                    if (practice.flashcards && practice.flashcards.length) {
                        const block = blockTemplate.content.firstElementChild.cloneNode(true);
                        block.querySelector('h3').textContent = 'Flashcards';
                        const section = block.querySelector('div');
                        practice.flashcards.forEach(function (card) {
                            const wrapper = document.createElement('div');
                            wrapper.className = 'rounded-xl bg-white px-3 py-2 text-xs shadow';
                            wrapper.innerHTML = '<p class="font-semibold text-brand-900">' + (card.front || '') + '</p>' +
                                '<p class="mt-1 text-brand-900/70">' + (card.back || '') + '</p>' +
                                (card.mnemonic ? '<p class="mt-1 text-brand-500">Mnemonic: ' + card.mnemonic + '</p>' : '') +
                                (card.company_hint ? '<p class="mt-1 text-brand-500">Company focus: ' + card.company_hint + '</p>' : '');
                            section.appendChild(wrapper);
                        });
                        practiceOutput.appendChild(block);
                    }
                } catch (err) {
                    const error = document.createElement('p');
                    error.className = 'rounded-xl bg-rose-100 px-3 py-2 text-sm text-rose-700';
                    error.textContent = 'Practice generation failed: ' + err.message;
                    practiceOutput.appendChild(error);
                } finally {
                    generatePractice.disabled = false;
                    generatePractice.textContent = 'Generate MCQs & flashcards';
                }
            });

            runCode.addEventListener('click', async function () {
                runCode.disabled = true;
                runCode.textContent = 'Running…';
                codeOutput.textContent = '';
                codeError.textContent = '';
                try {
                    const result = await PaperXLearning.executeCode({
                        language_id: codeLanguageSelect.value,
                        source: codeEditor.value,
                        stdin: codeInput.value
                    });
                    codeOutput.textContent = result.output || '';
                    if (result.stderr) { codeError.textContent = result.stderr; }
                } catch (err) {
                    codeError.textContent = err.message;
                } finally {
                    runCode.disabled = false;
                    runCode.textContent = 'Run';
                }
            });

            explainCode.addEventListener('click', async function () {
                explainCode.disabled = true;
                explainCode.textContent = 'Explaining…';
                explainOutput.innerHTML = '';
                try {
                    const explanation = await PaperXLearning.explainCode({
                        language: plan.language,
                        stack: plan.stack,
                        goal: plan.goal,
                        companies: plan.companies,
                        code: codeEditor.value,
                        question: codeInput.value,
                        language_preference: plan.language
                    });
                    const summary = document.createElement('p');
                    summary.className = 'font-semibold text-brand-900';
                    summary.textContent = explanation.summary || 'Explanation unavailable';
                    explainOutput.appendChild(summary);
                    if (explanation.suggestions) {
                        const list = document.createElement('ul');
                        list.className = 'mt-2 list-disc pl-5 text-xs';
                        explanation.suggestions.forEach(function (s) {
                            const li = document.createElement('li');
                            li.textContent = s;
                            list.appendChild(li);
                        });
                        explainOutput.appendChild(list);
                    }
                    if (explanation.localized_explanation) {
                        const para = document.createElement('p');
                        para.className = 'mt-3 text-xs text-brand-900/60';
                        para.textContent = explanation.localized_explanation;
                        explainOutput.appendChild(para);
                    }
                } catch (err) {
                    const error = document.createElement('p');
                    error.className = 'rounded-xl bg-rose-100 px-3 py-2 text-sm text-rose-700';
                    error.textContent = 'Explain failed: ' + err.message;
                    explainOutput.appendChild(error);
                } finally {
                    explainCode.disabled = false;
                    explainCode.textContent = 'Explain with Gemini';
                }
            });
        });
