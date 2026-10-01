// Extracted from ui/dashboard.html (inline <script> #3).
        // Logout functionality - Call Backend API
        document.getElementById('logoutBtn').addEventListener('click', async () => {
            try {
                // Call backend logout endpoint
                await fetch(`${API_BASE_URL}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            } catch (err) {
                console.error('Logout API error:', err);
            }

            // Clear localStorage regardless of API result
            localStorage.removeItem('gatex-access-token');
            localStorage.removeItem('gatex-refresh-token');
            localStorage.removeItem('gatex-user');

            window.location.href = '../login.html';
        });

        // Check authentication on page load from localStorage
        // Check authentication on page load from localStorage
        document.addEventListener('DOMContentLoaded', async () => {
            const accessToken = localStorage.getItem('gatex-access-token');
            if (!accessToken) {
                window.location.href = '../login.html';
            }

            // Display user info in sidebar
            const user = JSON.parse(localStorage.getItem('gatex-user') || '{}');
            const userNameEl = document.getElementById('userName');
            const userEmailEl = document.getElementById('userEmail');
            let userAvatarEl = document.getElementById('userAvatar');

            // Set basic info initially from localStorage
            if (userNameEl) userNameEl.textContent = user.full_name || user.email || 'User';
            if (userEmailEl) userEmailEl.textContent = user.email || '...';

            if (user.id) {
                try {
                    const response = await fetch(`${API_BASE_URL}/auth/profile/${user.id}`, {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    });

                    if (response.ok) {
                        const profile = await response.json();

                        // Update name if available in profile
                        if (profile.name && userNameEl) {
                            userNameEl.textContent = profile.name;
                        }

                        // Update email if different (optional)
                        if (profile.email && userEmailEl) {
                            userEmailEl.textContent = profile.email;
                        }

                        // Handle Avatar
                        if (profile.profile_image_url) {
                            // If currently not an image (e.g. div), replace with image
                            if (userAvatarEl.tagName !== 'IMG') {
                                const newImg = document.createElement('img');
                                newImg.className = "w-8 h-8 rounded-full ring-2 ring-gatex-primary object-cover";
                                newImg.id = "userAvatar";
                                userAvatarEl.replaceWith(newImg);
                                userAvatarEl = newImg;
                            }
                            userAvatarEl.src = profile.profile_image_url;
                        } else {
                            // Show initials
                            const name = profile.name || user.full_name || user.email || "U";
                            const initials = getInitials(name);

                            const initialsDiv = document.createElement('div');
                            initialsDiv.className = "w-8 h-8 rounded-full ring-2 ring-gatex-primary bg-gatex-primary text-white flex items-center justify-center text-xs font-bold";
                            initialsDiv.textContent = initials;
                            initialsDiv.id = "userAvatar";

                            userAvatarEl.replaceWith(initialsDiv);
                            userAvatarEl = initialsDiv;
                        }
                    }
                } catch (error) {
                    console.error("Error fetching profile:", error);
                }

                // Load Streak Data
                try {
                    const streakRes = await fetch(`${API_BASE_URL}/activity/streak/${user.id}`, {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    });
                    if (streakRes.ok) {
                        const streakData = await streakRes.json();
                        const currentStreakEl = document.getElementById('currentStreak');
                        const personalBestEl = document.getElementById('streakPersonalBest');

                        if (currentStreakEl) currentStreakEl.textContent = streakData.current_streak || 0;
                        if (personalBestEl) personalBestEl.textContent = `· Personal Best: ${streakData.longest_streak || 0}`;

                        // Milestones (Defensive Check)
                        const nextM = streakData.next_milestone !== undefined ? streakData.next_milestone : 7;
                        const prevM = streakData.prev_milestone !== undefined ? streakData.prev_milestone : 0;
                        const prog = streakData.milestone_progress !== undefined ? streakData.milestone_progress : 0;
                        const daysComp = streakData.days_completed !== undefined ? streakData.days_completed : 0;

                        document.getElementById('nextMilestoneText').textContent = `${nextM} Days 🎯`;
                        document.getElementById('streakProgressBar').style.width = `${prog}%`;
                        document.getElementById('prevMilestoneLabel').textContent = `${prevM} 🔥`;
                        document.getElementById('currentStreakLabel').textContent = streakData.current_streak || 0;
                        document.getElementById('nextMilestoneLabel').textContent = `${nextM} 🏆`;

                        // Week Progress
                        document.getElementById('weekProgressText').textContent = `${daysComp}/7 days complete`;


                        // Render Calendar
                        const calendarGrid = document.getElementById('streakCalendarGrid');

                        // Fallback & Smart Inference
                        // If week_data is missing OR if we want to backfill visual history based on streak count
                        let weekData = streakData.week_data;
                        const currentStreak = streakData.current_streak || 0;

                        // Helper to get day index (Mon=0, Sun=6)
                        const getDayIndex = (date) => {
                            const day = date.getDay();
                            return (day + 6) % 7;
                        };
                        const todayIndex = getDayIndex(new Date());

                        if (!weekData || weekData.length === 0) {
                            const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
                            weekData = days.map((d, i) => {
                                // Infer activity: if day is today or before, and within streak range
                                const daysDiff = todayIndex - i;
                                const isActive = daysDiff >= 0 && daysDiff < currentStreak;
                                const isToday = i === todayIndex;

                                return {
                                    day: d,
                                    date: new Date(new Date().setDate(new Date().getDate() - daysDiff)).getDate(),
                                    is_today: isToday,
                                    is_active: isActive,
                                    is_future: i > todayIndex
                                };
                            });

                            // Recalculate days_completed for UI
                            const activeCount = weekData.filter(d => d.is_active).length;
                            document.getElementById('weekProgressText').textContent = `${activeCount}/7 days complete`;
                        } else {
                            // Even if we have data, if it shows 0 active but we have a streak, let's fix visual gap
                            // This handles "First day with new table" scenario where history is missing
                            weekData = weekData.map((d, i) => {
                                if (d.is_today && currentStreak > 0) d.is_active = true;
                                // Simple backfill for current week if streak > 1
                                const daysDiff = todayIndex - i;
                                if (daysDiff > 0 && daysDiff < currentStreak && !d.is_active) {
                                    d.is_active = true;
                                }
                                return d;
                            });
                            // Update count again just in case
                            const activeCount = weekData.filter(d => d.is_active).length;
                            document.getElementById('weekProgressText').textContent = `${activeCount}/7 days complete`;
                        }

                        if (calendarGrid) {
                            calendarGrid.innerHTML = '';
                            weekData.forEach(day => {
                                let itemClass = 'streak-day-item';
                                let circleContent = '';
                                let labelClass = 'streak-day-label';

                                if (day.is_active) {
                                    itemClass += ' completed';
                                    circleContent = '<i class="ri-check-line text-xs text-white"></i>';
                                    if (day.is_today) {
                                        itemClass = 'streak-day-item today';
                                        circleContent = '<i class="ri-fire-fill text-xs text-white"></i>';
                                        labelClass += ' today-label';
                                    }
                                } else if (day.is_future) {
                                    itemClass += ' future';
                                    // If date is present show it, else empty
                                    circleContent = day.date ? `<span class="text-[10px] text-gray-600">${day.date}</span>` : '<span class="text-[10px] text-gray-600">-</span>';
                                } else {
                                    // Past inactive
                                    itemClass += ' future';
                                    circleContent = day.date ? `<span class="text-[10px] text-gray-600">${day.date}</span>` : '<span class="text-[10px] text-gray-600">-</span>';
                                }

                                // Special pulsing for today active
                                const pulseClass = (day.is_today && day.is_active) ? 'today-pulse' : '';

                                const html = `
                                    <div class="${itemClass}">
                                        <div class="streak-day-circle ${pulseClass}">
                                            ${circleContent}
                                        </div>
                                        <span class="${labelClass}">${typeof day.day === 'string' ? day.day[0] : ''}</span>
                                    </div>
                                `;
                                calendarGrid.insertAdjacentHTML('beforeend', html);
                            });
                        }
                    }
                } catch (err) {
                    console.error("Error fetching streak:", err);
                }
            }
            // Call Calendar Render
            renderScheduleCalendar();
            // Call Stats Render
            loadUserStats();
        });

        // -------------------------------------------------------------
        // Fetch Stats
        // -------------------------------------------------------------
        async function loadUserStats() {
            const token = localStorage.getItem('gatex-access-token');
            if (!token) {
                console.log("No gatex-access-token found");
                return;
            }

            // Need user ID. 
            // Try to get from localStorage first to avoid extra API call
            let uid = null;
            try {
                const localUser = JSON.parse(localStorage.getItem('gatex-user') || '{}');
                if (localUser.id) uid = localUser.id;
            } catch (e) { }

            if (!uid) {
                // Fallback to fetching me if not in local
                try {
                    const meRes = await fetch(`${API_BASE_URL}/auth/me`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (meRes.ok) {
                        const meData = await meRes.json();
                        uid = meData.user.id;
                    }
                } catch (e) { }
            }

            if (!uid) {
                console.log("Could not find User ID for stats");
                return;
            }

            try {
                const res = await fetch(`${API_BASE_URL}/activity/stats/${uid}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    // Update DOM
                    const completed = data.completed_topics || 0;
                    const total = data.total_topics || 0;
                    const percent = data.percent_completed || 0;

                    // Comp Courses Card
                    const compCountEl = document.getElementById('completedCount');
                    const totalCountEl = document.getElementById('totalCount');
                    const compPercentText = document.getElementById('completedPercentText');
                    const compCircle = document.getElementById('completedCircle');

                    if (compCountEl) compCountEl.textContent = completed;
                    if (totalCountEl) totalCountEl.textContent = `/${total}`;
                    if (compPercentText) compPercentText.textContent = `${percent}%`;
                    if (compCircle) compCircle.setAttribute('stroke-dasharray', `${percent}, 100`);

                    // Percent Completed Card
                    const overallBig = document.getElementById('overallPercentBig');
                    const overallText = document.getElementById('overallPercentText');
                    const overallCircle = document.getElementById('overallCircle');

                    if (overallBig) overallBig.textContent = `${percent}%`;
                    if (overallText) overallText.textContent = `${percent}%`;
                    if (overallCircle) overallCircle.setAttribute('stroke-dasharray', `${percent}, 100`);
                }
            } catch (e) {
                console.error("Stats Load Error", e);
            }
        }

        // -------------------------------------------------------------
        // Dynamic Schedule Calendar
        // -------------------------------------------------------------
        function renderScheduleCalendar() {
            const headerEl = document.getElementById('scheduleHeaderDate');
            const gridEl = document.getElementById('scheduleCalendarGrid');
            if (!headerEl || !gridEl) return;

            const today = new Date();
            const currentMonth = today.getMonth();
            const currentYear = today.getFullYear();
            const currentDate = today.getDate();

            // Format Header: e.g. "27 December, 2024"
            const monthNames = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];
            headerEl.textContent = `${currentDate} ${monthNames[currentMonth]}, ${currentYear}`;

            // Calendar Logic
            const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 (Sun) - 6 (Sat)
            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate(); // 28-31
            const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

            // Clear Grid (keep nothing, rebuild all)
            gridEl.innerHTML = `
                <span class="text-gray-500 py-1">S</span>
                <span class="text-gray-500 py-1">M</span>
                <span class="text-gray-500 py-1">T</span>
                <span class="text-gray-500 py-1">W</span>
                <span class="text-gray-500 py-1">T</span>
                <span class="text-gray-500 py-1">F</span>
                <span class="text-gray-500 py-1">S</span>
            `;

            // Previous Month Padding
            for (let i = 0; i < firstDayOfMonth; i++) {
                const dayNum = daysInPrevMonth - firstDayOfMonth + 1 + i;
                const span = document.createElement('span');
                span.className = "text-gray-600 py-2";
                span.textContent = dayNum;
                gridEl.appendChild(span);
            }

            // Current Month
            for (let d = 1; d <= daysInMonth; d++) {
                const span = document.createElement('span');
                if (d === currentDate) {
                    span.className = "bg-gatex-primary text-white rounded-full py-2 font-bold cursor-pointer hover:bg-gatex-primary/90 transition";
                } else {
                    span.className = "text-gray-300 py-2 hover:bg-white/5 rounded-full cursor-pointer transition";
                }
                span.textContent = d;
                gridEl.appendChild(span);
            }

            // Next Month Padding (fill remaining of the current row + maybe one more row if needed)
            const totalCellsSoFar = firstDayOfMonth + daysInMonth; // e.g. 3 + 31 = 34
            // Grid is 7 cols. 
            // We want to fill the last row.
            const totalCellsNeeded = Math.ceil(totalCellsSoFar / 7) * 7;
            const nextMonthPadding = totalCellsNeeded - totalCellsSoFar;

            // If total rows < 6, maybe add another row? 
            // The static design had 6 rows (including one full next-month row maybe?). 
            // Let's stick to valid grid. If it creates 5 rows, that's fine.

            for (let i = 1; i <= nextMonthPadding; i++) {
                const span = document.createElement('span');
                span.className = "text-gray-600 py-2";
                span.textContent = i;
                gridEl.appendChild(span);
            }
        }

        function getInitials(name) {
            const parts = name.trim().split(' ');
            if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
            return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
        }
