// Extracted from ui/groupChat/group_history.html (inline <script> #1).
        const API = (window.API_BASE || 'http://0.0.0.0:10000').replace(/\/$/, '');
        const token = localStorage.getItem('px_token');

        // Helpers
        const el = id => document.getElementById(id);
        const showToast = (msg, icon = 'check_circle') => {
            const t = el('toast');
            el('toastText').innerText = msg;
            el('toastIcon').innerText = icon;
            t.classList.remove('hidden');
            setTimeout(() => t.classList.add('hidden'), 3000);
        };

        function formatDate(isoStr) {
            if (!isoStr) return 'N/A';
            return new Date(isoStr).toLocaleString();
        }

        // Fetch Data
        async function fetchHistory() {
            if (!token) {
                window.location.href = '../auth/login.html';
                return;
            }

            try {
                const res = await fetch(`${API}/api/group-chat/history`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!res.ok) throw new Error("Failed to load history");

                const data = await res.json();
                renderActiveCalls(data.active_created);
                renderHistory(data.history);

            } catch (e) {
                console.error(e);
                el('activeCallsList').innerHTML = `<div class="col-span-full text-center text-red-500">Error loading data.</div>`;
                el('historyTableBody').innerHTML = `<tr><td colspan="5" class="p-4 text-center text-red-500">Error loading history.</td></tr>`;
            }
        }

        function renderActiveCalls(calls) {
            const container = el('activeCallsList');
            if (!calls || calls.length === 0) {
                container.innerHTML = `<div class="col-span-full py-8 text-center opacity-60 bg-black/5 dark:bg-white/5 rounded-xl border border-dashed border-black/10 dark:border-white/10">
                    No active calls found.
                </div>`;
                return;
            }

            container.innerHTML = calls.map(call => `
                <div class="glass-card p-5 relative group hover:border-brand-500/50 transition">
                    <div class="flex justify-between items-start mb-3">
                        <div class="font-bold text-lg truncate pr-2">${call.room_name}</div>
                        <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                             <span class="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>
                             Active
                        </span>
                    </div>
                    
                    <div class="text-sm opacity-70 mb-5">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="icon text-base">calendar_today</span>
                            ${formatDate(call.created_at)}
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="icon text-base">fingerprint</span>
                            ID: ${call.id}
                        </div>
                    </div>

                    <div class="flex gap-2">
                        <a href="group_chat.html?room=${call.id}" class="btn-primary flex-1 py-2 rounded-lg text-center text-sm font-medium">
                            Join Details
                        </a>
                        <button onclick="endCall('${call.id}')" class="btn-danger px-3 py-2 rounded-lg" title="End Call">
                            <span class="icon">call_end</span>
                        </button>
                    </div>
                </div>
            `).join('');
        }

        function renderHistory(calls) {
            const tbody = el('historyTableBody');
            if (!calls || calls.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="p-8 text-center opacity-50">No call history found.</td></tr>`;
                return;
            }

            tbody.innerHTML = calls.map(call => {
                const isEnded = call.status === 'ended';
                const statusClass = isEnded
                    ? 'bg-black/10 dark:bg-white/10 text-black/60 dark:text-white/60'
                    : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';

                return `
                <tr class="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition">
                    <td class="p-4 font-medium">${call.room_name}</td>
                    <td class="p-4 text-sm opacity-75">${formatDate(call.created_at)}</td>
                    <td class="p-4 text-sm opacity-75 truncate max-w-[150px]">${call.host_user_id || 'Unknown'}</td>
                    <td class="p-4">
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusClass}">
                            ${call.status}
                        </span>
                    </td>
                    <td class="p-4 text-right">
                         ${!isEnded ? `<a href="group_chat.html?room=${call.id}" class="text-brand-500 hover:underline text-sm font-medium">Join</a>` : '<span class="opacity-30 text-sm">-</span>'}
                    </td>
                </tr>
                `;
            }).join('');
        }

        async function endCall(roomId) {
            if (!confirm("Are you sure you want to end this call? This will disconnect all participants.")) return;

            try {
                const res = await fetch(`${API}/api/group-chat/end`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ room_id: roomId })
                });

                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.detail || "Failed to end call");
                }

                showToast("Call ended successfully");
                fetchHistory(); // Refresh

            } catch (e) {
                console.error(e);
                showToast(e.message, 'error');
            }
        }

        // Initial Load
        document.addEventListener('DOMContentLoaded', fetchHistory);

        // Theme Support (reusing from config.js logic ideally, but minimal here)
        window.Theme = {
            toggle: () => {
                const isDark = document.documentElement.classList.toggle('dark');
                localStorage.setItem('px_theme', isDark ? 'dark' : 'light');
            }
        };
        if (localStorage.getItem('px_theme') === 'dark' || (!('px_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        }
