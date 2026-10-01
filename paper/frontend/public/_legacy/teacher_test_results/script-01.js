// Extracted from ui/teacher_test_results.html (inline <script> #1).
        const $ = (s, r = document) => r.querySelector(s);
        const params = new URLSearchParams(location.search);
        let API_BASE = '';

        async function resolveApi() {
            if (API_BASE) return API_BASE;
            const b = (window.__API_BASE || window.API_BASE || '').replace(/\/$/, '');
            if (b) {
                API_BASE = b;
                return b;
            }
            await new Promise(r => setTimeout(r, 60));
            return resolveApi();
        }

        function getToken() {
            const keys = ['teacherToken', 'px_token', 'userToken', 'sb-access-token', 'supabase.auth.token'];
            for (const k of keys) {
                try {
                    const v = localStorage.getItem(k);
                    if (v) return v;
                } catch (_) { }
            }
            return '';
        }

        function esc(v) {
            return String(v == null ? '' : v)
                .replaceAll('&', '&amp;')
                .replaceAll('<', '&lt;')
                .replaceAll('>', '&gt;')
                .replaceAll('"', '&quot;')
                .replaceAll("'", '&#39;');
        }

        function showAlert(msg) {
            const a = $('#alert');
            if (!a) return;
            a.textContent = msg;
            a.classList.remove('hidden');
        }

        function studentKey(s) {
            if (!s || typeof s !== 'object') return '';
            return String(s.auth_user_id || s.student_user_id || s.user_id || s.id || s.email || '').trim().toLowerCase();
        }

        function fmtPct(n) {
            return `${Math.max(0, Math.min(100, Number(n || 0))).toFixed(1)}%`;
        }

        function fmtSec(sec) {
            const s = Math.max(0, Number(sec || 0));
            const m = Math.floor(s / 60);
            const r = Math.floor(s % 60);
            return `${m}m ${String(r).padStart(2, '0')}s`;
        }

        function metricTile(icon, label, value, foot = 'Updated from live attempts') {
            return `<article class="signal-card">
                <div class="metric-head">
                    <span class="metric-icon material-symbols-rounded">${esc(icon)}</span>
                    <span class="metric-label">${esc(label)}</span>
                </div>
                <div class="metric-value">${esc(value)}</div>
                <div class="metric-foot">${esc(foot)}</div>
            </article>`;
        }

        function stripSubjectCode(subject) {
            const raw = String(subject || '').trim();
            if (!raw) return '';
            return raw.replace(/^\s*[A-Z0-9]{4,}\s*[\u2014-]\s*/i, '').trim();
        }

        function skillLabel(k) {
            const map = { K1: 'Remember', K2: 'Understanding', K3: 'Apply', K4: 'Analyze', K5: 'Evaluate', K6: 'Create' };
            return map[k] || 'Mixed';
        }

        function aggregateMetric(rows, keyName, studentPerfByKey) {
            const map = new Map();
            rows.forEach((row) => {
                const key = String(row[keyName] || 'Unmapped').trim() || 'Unmapped';
                const entry = map.get(key) || { key, correctSum: 0, qCount: 0, labels: [] };
                entry.correctSum += Number(row.correctPct || 0);
                entry.qCount += 1;
                if (row.difficulty) entry.labels.push(String(row.difficulty));
                map.set(key, entry);
            });

            const out = [];
            map.forEach((entry) => {
                const avg = entry.qCount ? (entry.correctSum / entry.qCount) : 0;
                const weakStudents = Number(studentPerfByKey.get(entry.key) || 0);
                const mode = (() => {
                    const cnt = {};
                    entry.labels.forEach(v => { cnt[v] = (cnt[v] || 0) + 1; });
                    return Object.keys(cnt).sort((a, b) => (cnt[b] || 0) - (cnt[a] || 0))[0] || '-';
                })();
                out.push({ key: entry.key, avg, weakStudents, difficulty: mode });
            });
            out.sort((a, b) => a.avg - b.avg);
            return out;
        }

        function priorityTag(avg) {
            if (avg < 35) return { text: 'HIGH', cls: 'chip-high' };
            if (avg < 55) return { text: 'MEDIUM', cls: 'chip-mid' };
            return { text: 'LOW', cls: 'chip-low' };
        }

        function buildTopicPriorityMap(topicAgg) {
            const map = new Map();
            const n = topicAgg.length;
            if (!n) return map;

            const scored = topicAgg.map((t, idx) => ({
                idx,
                key: t.key,
                risk: (100 - Number(t.avg || 0)) + (Number(t.weakStudents || 0) * 7)
            })).sort((a, b) => b.risk - a.risk);

            const highCount = n === 1 ? 1 : Math.max(1, Math.ceil(n * 0.3));
            const medCount = n <= 2 ? Math.max(0, n - highCount) : Math.max(1, Math.ceil(n * 0.35));

            scored.forEach((item, rank) => {
                if (rank < highCount) map.set(item.key, { text: 'HIGH', cls: 'chip-high' });
                else if (rank < highCount + medCount) map.set(item.key, { text: 'MEDIUM', cls: 'chip-mid' });
                else map.set(item.key, { text: 'LOW', cls: 'chip-low' });
            });

            return map;
        }

        async function load() {
            const id = params.get('test_id') || params.get('id');
            if (!id) return showAlert('Missing test id');
            const token = getToken();
            if (!token) return showAlert('Sign in as teacher');

            try {
                const base = await resolveApi();
                const headers = { Authorization: 'Bearer ' + token };
                const [resultRes, classes] = await Promise.all([
                    fetch(`${base}/api/teacher/tests/${encodeURIComponent(id)}/results`, { headers }),
                    fetch(`${base}/api/teacher/classes/mine`, { headers }).then(r => r.ok ? r.json() : []).catch(() => [])
                ]);
                if (!resultRes.ok) return showAlert('Could not load results');

                const data = await resultRes.json();
                const test = data.test || {};
                const attemptsRaw = Array.isArray(data.attempts) ? data.attempts : [];
                const questions = Array.isArray(data.questions)
                    ? data.questions.slice().sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
                    : [];

                const classMap = new Map((classes || []).map(c => [String(c.id || ''), c]));
                const classInfo = classMap.get(String(test.class_id || '')) || {};
                const classStudents = Array.isArray(data.class_students) ? data.class_students : [];
                const missing = Array.isArray(data.students_not_attempted) ? data.students_not_attempted : [];

                const submitted = attemptsRaw.filter(a => !!a.submitted_at);
                const submittedByStudent = new Map();
                submitted.forEach((a) => {
                    const key = studentKey(a);
                    if (!key) return;
                    const prev = submittedByStudent.get(key);
                    if (!prev) submittedByStudent.set(key, a);
                    else {
                        const prevAt = new Date(prev.submitted_at || 0).getTime();
                        const curAt = new Date(a.submitted_at || 0).getTime();
                        if (curAt > prevAt) submittedByStudent.set(key, a);
                    }
                });
                const submittedList = Array.from(submittedByStudent.values());

                const rosterUnion = new Set();
                classStudents.forEach(s => { const k = studentKey(s); if (k) rosterUnion.add(k); });
                attemptsRaw.forEach(s => { const k = studentKey(s); if (k) rosterUnion.add(k); });
                missing.forEach(s => { const k = studentKey(s); if (k) rosterUnion.add(k); });

                const maxScore = Number(test.max_score || 0);
                const totalStudents = Math.max(rosterUnion.size, submittedList.length);
                const attemptedStudents = submittedList.length;

                const scores = submittedList.map(a => Number(a.score || 0));
                const avgScore = scores.length ? scores.reduce((x, y) => x + y, 0) / scores.length : 0;
                const avgAccuracy = (maxScore > 0 && scores.length) ? (avgScore / maxScore) * 100 : 0;
                const highest = scores.length ? Math.max(...scores) : 0;
                const lowest = scores.length ? Math.min(...scores) : 0;
                const avgTimeSec = (() => {
                    const withTime = submittedList.map(a => Number(a.elapsed_seconds || 0)).filter(v => Number.isFinite(v) && v > 0);
                    if (!withTime.length) return 0;
                    return withTime.reduce((x, y) => x + y, 0) / withTime.length;
                })();

                const year = classInfo.semester ? `Year ${Math.floor((Number(classInfo.semester) - 1) / 2) + 1}` : null;
                const cleanSubject = stripSubjectCode(classInfo.subject) || 'N/A';
                const classLabel = [cleanSubject, classInfo.section ? `Sec ${classInfo.section}` : null, year].filter(Boolean).join(' | ');

                $('#reportTitle').textContent = test.title || 'Teacher Performance Report';
                $('#meta').textContent = `${classLabel || 'N/A'} | Max Score: ${maxScore}`;
                $('#viewTest').href = `./test_take.html?test_id=${encodeURIComponent(id)}`;

                const summaryGrid = $('#summaryGrid');
                summaryGrid.innerHTML = [
                    metricTile('track_changes', 'Average Accuracy', fmtPct(avgAccuracy), avgAccuracy < 40 ? 'Needs intervention' : (avgAccuracy < 70 ? 'Can be improved' : 'Healthy trend')),
                    metricTile('analytics', 'Highest + Lowest', `${highest} / ${maxScore} | ${lowest} / ${maxScore}`, 'Spread of class marks'),
                    metricTile('schedule', 'Average Time Taken', fmtSec(avgTimeSec), 'Per attempted student'),
                ].join('');

                const completionPct = totalStudents > 0 ? (attemptedStudents / totalStudents) * 100 : 0;
                const orbit = $('#completionOrbit');
                const orbitVal = $('#completionOrbitValue');
                const completionMeta = $('#completionMeta');
                const completedPill = $('#completedPill');
                const pendingPill = $('#pendingPill');
                if (orbit) {
                    const safe = Math.max(0, Math.min(100, completionPct));
                    orbit.style.background = `conic-gradient(var(--orchid) ${safe}%, rgba(158, 75, 138, 0.16) ${safe}% 100%)`;
                }
                if (orbitVal) orbitVal.textContent = `${completionPct.toFixed(0)}%`;
                if (completionMeta) completionMeta.textContent = `${attemptedStudents}/${totalStudents} completed`;
                if (completedPill) completedPill.innerHTML = `DONE <b>${attemptedStudents}</b>`;
                if (pendingPill) pendingPill.innerHTML = `PENDING <b>${Math.max(totalStudents - attemptedStudents, 0)}</b>`;

                const statusInsight = $('#statusInsight');
                if (statusInsight) {
                    const line = avgAccuracy < 60
                        ? `Overall class performance is below expected level (Avg: ${avgAccuracy.toFixed(0)}%)`
                        : `Overall class performance is stable (Avg: ${avgAccuracy.toFixed(0)}%)`;
                    statusInsight.innerHTML = `<span class="insight-icon material-symbols-rounded">monitor_heart</span><span>${esc(line)}</span>`;
                }

                const perfRows = submittedList.map(s => {
                    const pct = maxScore > 0 ? (Number(s.score || 0) / maxScore) * 100 : 0;
                    return {
                        name: s.name || s.email || 'Student',
                        email: s.email || '',
                        pct,
                        score: Number(s.score || 0),
                        elapsed: Number(s.elapsed_seconds || 0),
                        answers: Array.isArray(s.answers) ? s.answers : []
                    };
                });

                const bins = [
                    { name: '0-25', count: 0 },
                    { name: '25-50', count: 0 },
                    { name: '50-75', count: 0 },
                    { name: '75-100', count: 0 }
                ];
                perfRows.forEach((row) => {
                    if (row.pct < 25) bins[0].count += 1;
                    else if (row.pct < 50) bins[1].count += 1;
                    else if (row.pct < 75) bins[2].count += 1;
                    else bins[3].count += 1;
                });
                const distNode = $('#distribution');
                if (distNode) {
                    distNode.innerHTML = bins.map(b => {
                        const ratio = totalStudents > 0 ? ((b.count / totalStudents) * 100) : 0;
                        const safe = Math.max(0, Math.min(100, ratio)).toFixed(2);
                        return `<article class="dist-lane">
                            <div class="dist-percent">${ratio.toFixed(0)}%</div>
                            <div class="dist-column"><div class="dist-fill" style="height:${safe}%"></div></div>
                            <div class="dist-meta"><strong>${esc(b.name)}</strong>${b.count} students</div>
                        </article>`;
                    }).join('');
                }

                const weakStudents = perfRows.filter(s => s.pct < 40).sort((a, b) => a.pct - b.pct);
                const avgStudents = perfRows.filter(s => s.pct >= 40 && s.pct < 70).sort((a, b) => b.pct - a.pct);
                const topStudents = perfRows.filter(s => s.pct >= 70).sort((a, b) => b.pct - a.pct);

                const listNames = (arr) => arr.slice(0, 10).map(s => `<div class="flex items-center justify-between"><span>${esc(s.name)}</span><span class="opacity-75">${s.pct.toFixed(1)}%</span></div>`).join('') || '<div class="opacity-65">None</div>';
                $('#weakCount').textContent = `${weakStudents.length} students`;
                $('#avgCount').textContent = `${avgStudents.length} students`;
                $('#topCount').textContent = `${topStudents.length} students`;
                $('#weakStudents').innerHTML = listNames(weakStudents);
                $('#avgStudents').innerHTML = listNames(avgStudents);
                $('#topStudents').innerHTML = listNames(topStudents);

                const questionRows = [];
                questions.forEach((q, idx) => {
                    const total = perfRows.length;
                    let correct = 0;
                    perfRows.forEach(s => {
                        const ans = Number((s.answers || [])[idx]);
                        if (Number.isInteger(ans) && ans === Number(q.correct_index)) correct += 1;
                    });
                    questionRows.push({
                        index: idx + 1,
                        prompt: q.prompt || '',
                        topic: q.topic_name || 'Unmapped',
                        co: q.co || 'Unmapped',
                        k: q.k_level || 'Unmapped',
                        difficulty: q.difficulty || '-',
                        correctPct: total ? (correct / total) * 100 : 0
                    });
                });

                const studentPerfByTopic = new Map();
                const studentPerfByCo = new Map();
                const studentPerfByK = new Map();

                function addStudentPerf(map, key, ratio) {
                    const group = map.get(key) || [];
                    group.push(ratio);
                    map.set(key, group);
                }

                perfRows.forEach(s => {
                    const byTopic = new Map();
                    const byCo = new Map();
                    const byK = new Map();
                    questionRows.forEach((q, idx) => {
                        const ans = Number((s.answers || [])[idx]);
                        const ok = Number.isInteger(ans) && ans === Number(questions[idx]?.correct_index);

                        const t = byTopic.get(q.topic) || { c: 0, t: 0 };
                        t.t += 1;
                        if (ok) t.c += 1;
                        byTopic.set(q.topic, t);

                        const c = byCo.get(q.co) || { c: 0, t: 0 };
                        c.t += 1;
                        if (ok) c.c += 1;
                        byCo.set(q.co, c);

                        const k = byK.get(q.k) || { c: 0, t: 0 };
                        k.t += 1;
                        if (ok) k.c += 1;
                        byK.set(q.k, k);
                    });

                    byTopic.forEach((v, key) => addStudentPerf(studentPerfByTopic, key, v.t ? (v.c / v.t) * 100 : 0));
                    byCo.forEach((v, key) => addStudentPerf(studentPerfByCo, key, v.t ? (v.c / v.t) * 100 : 0));
                    byK.forEach((v, key) => addStudentPerf(studentPerfByK, key, v.t ? (v.c / v.t) * 100 : 0));
                });

                const weakCountByTopic = new Map();
                studentPerfByTopic.forEach((arr, key) => weakCountByTopic.set(key, arr.filter(x => x < 40).length));
                const weakCountByCo = new Map();
                studentPerfByCo.forEach((arr, key) => weakCountByCo.set(key, arr.filter(x => x < 40).length));
                const weakCountByK = new Map();
                studentPerfByK.forEach((arr, key) => weakCountByK.set(key, arr.filter(x => x < 40).length));

                const topicAgg = aggregateMetric(questionRows, 'topic', weakCountByTopic);
                const coAgg = aggregateMetric(questionRows, 'co', weakCountByCo);
                const kAgg = aggregateMetric(questionRows, 'k', weakCountByK);
                const topicPriorityMap = buildTopicPriorityMap(topicAgg);

                $('#topicRows').innerHTML = topicAgg.map(t => {
                    const p = topicPriorityMap.get(t.key) || priorityTag(t.avg);
                    const action = p.text === 'HIGH' ? 'Re-teach' : (p.text === 'MEDIUM' ? 'Targeted revise' : 'Reinforce');
                    return `<tr class="row-line">
                        <td class="py-2.5 px-3">${esc(t.key)}</td>
                        <td class="py-2.5 px-3">${fmtPct(t.avg)}</td>
                        <td class="py-2.5 px-3">${t.weakStudents}</td>
                        <td class="py-2.5 px-3">${esc(t.difficulty)}</td>
                        <td class="py-2.5 px-3"><span class="chip ${p.cls}">${p.text}</span></td>
                        <td class="py-2.5 px-3"><span class="chip">${action}</span></td>
                    </tr>`;
                }).join('') || '<tr><td colspan="6" class="py-3 px-3 opacity-70">No topic data available.</td></tr>';

                $('#coRows').innerHTML = coAgg.map(c => {
                    const tag = priorityTag(c.avg);
                    const label = c.avg < 40 ? 'Weak' : (c.avg < 70 ? 'Moderate' : 'Good');
                    return `<tr class="row-line">
                        <td class="py-2.5 px-3">${esc(c.key)}</td>
                        <td class="py-2.5 px-3">${fmtPct(c.avg)}</td>
                        <td class="py-2.5 px-3">${c.weakStudents}</td>
                        <td class="py-2.5 px-3"><span class="chip ${tag.cls}">${label}</span></td>
                    </tr>`;
                }).join('') || '<tr><td colspan="4" class="py-3 px-3 opacity-70">No CO data available.</td></tr>';

                $('#kRows').innerHTML = kAgg.map(k => {
                    const tag = priorityTag(k.avg);
                    const label = k.avg < 40 ? 'Weak' : (k.avg < 70 ? 'Moderate' : 'Good');
                    return `<tr class="row-line">
                        <td class="py-2.5 px-3">${esc(k.key)}</td>
                        <td class="py-2.5 px-3">${esc(skillLabel(k.key))}</td>
                        <td class="py-2.5 px-3">${fmtPct(k.avg)}</td>
                        <td class="py-2.5 px-3"><span class="chip ${tag.cls}">${label}</span></td>
                    </tr>`;
                }).join('') || '<tr><td colspan="4" class="py-3 px-3 opacity-70">No K-level data available.</td></tr>';

                if (kAgg.length <= 1) {
                    const kBlock = $('#kLevelBlock');
                    if (kBlock) kBlock.classList.add('hidden-soft');
                }

                const sortedByDifficulty = questionRows.slice().sort((a, b) => a.correctPct - b.correctPct);
                let showAllQuestions = false;
                const questionInsights = $('#questionInsights');
                const renderQuestions = () => {
                    const source = showAllQuestions ? sortedByDifficulty : sortedByDifficulty.slice(0, 5);
                    questionInsights.innerHTML = source.map(q => `<div class="kpi-card">
                        <div class="flex items-start justify-between gap-2">
                            <div><span class="font-semibold">Q${q.index}</span> ${esc(q.prompt).slice(0, 100)}</div>
                            <span class="chip ${priorityTag(q.correctPct).cls}">${fmtPct(q.correctPct)}</span>
                        </div>
                        <div class="text-xs opacity-75 mt-1">Topic: ${esc(q.topic)} | CO: ${esc(q.co)} | K-level: ${esc(q.k)}</div>
                    </div>`).join('') || '<div class="opacity-70">No question analytics available.</div>';
                    const btn = $('#toggleAllQuestions');
                    if (btn) btn.textContent = showAllQuestions ? 'Show Critical Only' : 'View All Questions';
                };
                renderQuestions();
                const toggleBtn = $('#toggleAllQuestions');
                if (toggleBtn) {
                    toggleBtn.onclick = () => {
                        showAllQuestions = !showAllQuestions;
                        renderQuestions();
                    };
                }

                const topWeakTopics = topicAgg.filter(t => t.avg < 50).slice(0, 3).map(t => t.key);
                const allBelow50 = topicAgg.length > 0 && topicAgg.every(t => t.avg < 50);
                const k2Gap = kAgg.some(k => k.key === 'K2' && k.avg < 40);
                const leadTopic = topWeakTopics[0] || '';
                const leadFailed = leadTopic ? Number(weakCountByTopic.get(leadTopic) || 0) : 0;

                const fallbackInsights = [
                    leadTopic ? `${leadFailed} students failed in ${leadTopic} concept.` : null,
                    coAgg[0] ? `${coAgg[0].key} attainment is low at ${fmtPct(coAgg[0].avg)}.` : null,
                    k2Gap ? 'Conceptual understanding gap (K2) across entire class.' : null,
                    allBelow50 ? 'No topic crossed 50% mastery.' : null,
                    weakStudents.length ? `${weakStudents.length} students need immediate intervention.` : null,
                ].filter(Boolean);

                const fallbackActions = [
                    leadTopic ? `Re-teach ${leadTopic} using visual explanation.` : null,
                    weakStudents.length ? `Conduct remedial class for ${weakStudents.length} weak students.` : null,
                    coAgg[0] ? `Assign focused practice quiz for ${coAgg[0].key}.` : null,
                    topWeakTopics[1] ? `Use Blink diagram for quick revision of ${topWeakTopics[1]}.` : null,
                ].filter(Boolean);

                let proMoveText = `If you fix top 2 weak topics, class average can improve from ${avgAccuracy.toFixed(0)}% to ${Math.max(60, Math.min(90, Math.round(avgAccuracy + 18)))}%.`;

                try {
                    const aiRes = await fetch(`${base}/api/teacher/tests/${encodeURIComponent(id)}/ai-insights`, {
                        method: 'POST',
                        headers: { ...headers, 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            snapshot: {
                                average_accuracy: Number(avgAccuracy.toFixed(2)),
                                max_score: maxScore,
                                total_students: totalStudents,
                                attempted_students: attemptedStudents,
                                weak_students_count: weakStudents.length,
                                weak_topics: topWeakTopics,
                                co_summary: coAgg.slice(0, 5).map(x => ({ co: x.key, avg: Number(x.avg.toFixed(2)), weak_students: x.weakStudents })),
                                k_summary: kAgg.slice(0, 5).map(x => ({ k_level: x.key, avg: Number(x.avg.toFixed(2)), weak_students: x.weakStudents }))
                            }
                        })
                    });
                    if (aiRes.ok) {
                        const ai = await aiRes.json();
                        if (ai && ai.status_line) $('#statusInsight').textContent = String(ai.status_line);
                        if (ai && ai.pro_move) proMoveText = String(ai.pro_move);

                        if (ai && Array.isArray(ai.insights) && ai.insights.length) {
                            const cleaned = ai.insights.slice(0, 5).map(x => {
                                const line = String(x || '').trim();
                                if (line.toLowerCase().includes('uneven')) return leadTopic ? `${leadFailed} students failed in ${leadTopic} concept.` : 'No topic crossed 50% mastery.';
                                return line;
                            });
                            $('#keyInsights').innerHTML = cleaned.map(i => `<div class="kpi-card">${esc(i)}</div>`).join('');
                        }
                        if (ai && Array.isArray(ai.actions) && ai.actions.length) {
                            $('#recommendedActions').innerHTML = ai.actions.slice(0, 5).map(i => `<div class="kpi-card">${esc(i)}</div>`).join('');
                        }
                    }
                } catch (_) { }

                if (!$('#keyInsights').innerHTML.trim()) {
                    $('#keyInsights').innerHTML = fallbackInsights.map(i => `<div class="kpi-card">${esc(i)}</div>`).join('') || '<div class="opacity-70">No insights available.</div>';
                }
                if (!$('#recommendedActions').innerHTML.trim()) {
                    $('#recommendedActions').innerHTML = fallbackActions.map(i => `<div class="kpi-card">${esc(i)}</div>`).join('') || '<div class="opacity-70">No actions available.</div>';
                }
                const proMove = $('#proMove');
                if (proMove) proMove.innerHTML = `<span class="insight-icon material-symbols-rounded">rocket_launch</span><span>${esc(proMoveText)}</span>`;

                const exportRows = [
                    ['Student', 'Email', 'Score', 'AccuracyPercent', 'ElapsedSeconds'],
                    ...perfRows.map(s => [s.name, s.email, s.score, s.pct.toFixed(2), s.elapsed])
                ];

                $('#exportExcel').addEventListener('click', () => {
                    const csv = exportRows.map(r => r.map(v => `"${String(v || '').replaceAll('"', '""')}"`).join(',')).join('\n');
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = `teacher_report_${id}.csv`;
                    a.click();
                    URL.revokeObjectURL(a.href);
                });

                $('#exportPdf').addEventListener('click', () => window.print());

                $('#shareReport').addEventListener('click', async () => {
                    const text = `${test.title || 'Test'} report\nAvg accuracy: ${avgAccuracy.toFixed(1)}%\nWeak students: ${weakStudents.length}\nTop weak topic: ${topWeakTopics[0] || '-'}\n${proMoveText}`;
                    try {
                        await navigator.clipboard.writeText(text);
                        alert('Report summary copied to clipboard.');
                    } catch (_) {
                        alert('Could not copy report summary.');
                    }
                });
            } catch (err) {
                console.error(err);
                showAlert('Failed to load report');
            }
        }

        document.addEventListener('DOMContentLoaded', load);
