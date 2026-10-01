// Extracted from ui/admin/dashboard.html (inline <script> #2).
        document.addEventListener('DOMContentLoaded', async () => {
            // Fetch data
            try {
                const base = (window.API_BASE || '').replace(/\/+$/, '');
                const url = base ? `${base}/analytics/dashboard` : '/analytics/dashboard';
                const res = await fetch(url);
                const data = await res.json();

                if (data.error) throw new Error(data.error);

                // Update KPIs
                const kpi = data.kpi || {};
                document.getElementById('metric-dau').textContent = kpi.dau || 0;
                document.getElementById('metric-wau').textContent = kpi.wau || 0;
                document.getElementById('metric-time').innerHTML = (kpi.avg_study_time || 0) + ' <span class="text-sm font-normal text-gray-500">min</span>';
                document.getElementById('metric-sessions').textContent = kpi.sessions_per_user || 0;

                // Update Feature Stats
                const feats = data.features || {};
                document.getElementById('stat-notex').textContent = (feats.notex || 0);
                document.getElementById('stat-blink').textContent = (feats.blink || 0);
                document.getElementById('stat-labx').textContent = (feats.labx || 0);

                // Render Chart
                const ctx = document.getElementById('featureChart').getContext('2d');
                new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['NoteX', 'Blink', 'LabX'],
                        datasets: [{
                            data: [feats.notex || 0, feats.blink || 0, feats.labx || 0],
                            backgroundColor: ['#9E4B8A', '#C88DBA', '#4C2A59'],
                            borderColor: '#1E1E2F',
                            borderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '70%',
                        plugins: {
                            legend: {
                                position: 'right',
                                labels: { color: '#bbb', usePointStyle: true }
                            }
                        }
                    }
                });

                // Update Funnel
                const funnel = data.funnel || {};
                const f1 = funnel.topic_to_note || 0;
                const f2 = funnel.note_to_lab || 0;
                document.getElementById('funnel-1').textContent = f1 + '%';
                document.getElementById('bar-funnel-1').style.width = f1 + '%';

                document.getElementById('funnel-2').textContent = f2 + '%';
                document.getElementById('bar-funnel-2').style.width = f2 + '%';

                // Learning
                const learn = data.learning || {};
                document.getElementById('learn-completion').textContent = (learn.note_completion_rate || 0) + '%';
                document.getElementById('learn-revisit').textContent = (learn.blink_revisit || 0) + '%';

                // User Table
                const tbody = document.getElementById('user-table-body');
                tbody.innerHTML = '';
                const users = data.users || [];
                if (users.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="7" class="py-8 text-center text-gray-500">No active users found in the last 7 days.</td></tr>';
                } else {
                    users.forEach(u => {
                        const row = document.createElement('tr');
                        row.className = 'border-b border-white/5 hover:bg-white/5 transition-colors';

                        const name = u.name || 'Anonymous';
                        const email = u.email || (u.id ? u.id.slice(0, 8) + '...' : 'Unknown');
                        const lastSeen = u.last_seen ? new Date(u.last_seen).toLocaleString() : '-';

                        // Image Handling
                        let imgHtml = '';
                        if (u.image) {
                            imgHtml = `<img src="${u.image}" alt="${name}" class="h-8 w-8 rounded-full bg-gray-800 object-cover">`;
                        } else {
                            const init = name.slice(0, 1).toUpperCase();
                            imgHtml = `<div class="h-8 w-8 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white">${init}</div>`;
                        }

                        const streak = u.streak || 0;
                        const streakColor = streak >= 7 ? 'text-green-400' : streak >= 3 ? 'text-yellow-400' : 'text-gray-300';

                        row.innerHTML = `
                            <td class="py-3 px-4">
                                <div class="flex items-center gap-3">
                                    ${imgHtml}
                                    <div>
                                        <div class="font-medium text-white">${name}</div>
                                        <div class="text-xs text-gray-500">${email}</div>
                                    </div>
                                </div>
                            </td>
                            <td class="py-3 px-4 text-center text-gray-300">${u.notex}</td>
                            <td class="py-3 px-4 text-center text-gray-300">${u.blink}</td>
                            <td class="py-3 px-4 text-center text-gray-300">${u.labx}</td>
                            <td class="py-3 px-4 text-center ${streakColor}">
                                <span class="inline-flex items-center gap-1">
                                    <span class="material-symbols-rounded text-sm">local_fire_department</span>
                                    ${streak}
                                </span>
                            </td>
                            <td class="py-3 px-4 text-center text-gray-300">${u.sessions}</td>
                            <td class="py-3 px-4 text-right text-gray-400 text-xs">${lastSeen}</td>
                        `;
                        tbody.appendChild(row);
                    });
                }

            } catch (e) {
                console.error('Loader failed', e);
                // alert('Failed to load dashboard data');
            }
        });
