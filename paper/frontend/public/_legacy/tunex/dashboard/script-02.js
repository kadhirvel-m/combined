// Extracted from ui/tunex/dashboard.html (inline <script> #2).
        // --- 1. Mixed Activity Chart (Bar + Line) ---
        const ctxActivity = document.getElementById('activityChart').getContext('2d');

        // Gradient for the Line
        let gradientLine = ctxActivity.createLinearGradient(0, 0, 0, 400);
        gradientLine.addColorStop(0, 'rgba(158, 75, 138, 0.5)');
        gradientLine.addColorStop(1, 'rgba(158, 75, 138, 0)');

        new Chart(ctxActivity, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [
                    {
                        type: 'line',
                        label: 'Questions Solved',
                        data: [15, 22, 18, 30, 25, 40, 35],
                        borderColor: '#9E4B8A', // Brand Pink
                        backgroundColor: gradientLine,
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#1E1E2F',
                        pointBorderColor: '#9E4B8A',
                        pointRadius: 4,
                        yAxisID: 'y'
                    },
                    {
                        type: 'bar',
                        label: 'Hours Spent',
                        data: [2, 3.5, 2.5, 4, 3, 5, 4.5],
                        backgroundColor: '#4C2A59', // Dark Purple
                        borderRadius: 6,
                        barThickness: 12,
                        hoverBackgroundColor: '#FF7F50', // Orange on hover
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: { labels: { color: '#aaa', font: { size: 10 }, usePointStyle: true } },
                    tooltip: {
                        backgroundColor: 'rgba(30, 30, 47, 0.9)',
                        titleColor: '#fff',
                        bodyColor: '#ccc',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#666' }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        grid: { color: 'rgba(255,255,255,0.05)', borderDash: [5, 5] },
                        ticks: { color: '#666' },
                        title: { display: false } // Questions
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: { display: false },
                        ticks: { display: false } // Hide hours numbers to keep clean
                    }
                }
            }
        });

        // --- 2. Radar Skill Chart ---
        const ctxRadar = document.getElementById('radarChart').getContext('2d');
        new Chart(ctxRadar, {
            type: 'radar',
            data: {
                labels: ['Python', 'Java', 'Algorithms', 'DS', 'SQL', 'Web'],
                datasets: [{
                    label: 'You',
                    data: [85, 65, 90, 70, 55, 80],
                    fill: true,
                    backgroundColor: 'rgba(255, 127, 80, 0.2)', // Orange tint
                    borderColor: '#FF7F50',
                    pointBackgroundColor: '#FF7F50',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#FF7F50'
                },
                {
                    label: 'Topper Avg',
                    data: [90, 85, 95, 90, 80, 90],
                    fill: false,
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderDash: [5, 5],
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    r: {
                        angleLines: { color: 'rgba(255, 255, 255, 0.05)' },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        pointLabels: { color: '#888', font: { size: 10 } },
                        ticks: { display: false, backdropColor: 'transparent' }
                    }
                }
            }
        });

        // --- 3. Hours Activity Chart ---
        const ctxHours = document.getElementById('hoursChart').getContext('2d');
        new Chart(ctxHours, {
            type: 'bar',
            data: {
                labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                datasets: [{
                    data: [3, 5, 7, 4, 8, 6, 9],
                    backgroundColor: function (context) {
                        const chart = context.chart;
                        const { ctx, chartArea } = chart;
                        if (!chartArea) return '#4C2A59';
                        const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                        gradient.addColorStop(0, '#4C2A59');
                        gradient.addColorStop(1, '#9E4B8A');
                        return gradient;
                    },
                    borderRadius: 6,
                    barThickness: 20,
                    hoverBackgroundColor: '#FF7F50'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(30, 30, 47, 0.95)',
                        titleColor: '#fff',
                        bodyColor: '#ccc',
                        callbacks: {
                            label: function (context) {
                                return context.raw + 'h studied';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#666', font: { size: 10 } }
                    },
                    y: {
                        display: false,
                        grid: { display: false },
                        max: 12
                    }
                }
            }
        });
