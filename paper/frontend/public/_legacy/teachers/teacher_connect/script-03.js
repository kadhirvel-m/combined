// Extracted from ui/teachers/teacher_connect.html (inline <script> #3).
        // UI polish without changing existing logic
        (function () {
            try {
                const convHeader = document.getElementById('convHeader');
                if (convHeader) convHeader.classList.add('sticky', 'top-0', 'z-10');
                const sendForm = document.getElementById('sendForm');
                if (sendForm) sendForm.classList.add('sticky', 'bottom-0');
                const messages = document.getElementById('messages');
                if (messages) messages.classList.add('py-6');

                // Improve placeholder typography
                const comp = document.getElementById('composer');
                if (comp) comp.placeholder = 'Type a message… (Enter to send, Shift+Enter for new line)';

                // Override presence mapping for nicer text + pulse
                const dot = document.getElementById('presenceDot');
                const txt = document.getElementById('presenceText');
                if (dot && txt) {
                    window.presence = function (state) {
                        const map = {
                            online: { dot: 'bg-emerald-500 presence-pulse', txt: 'Connected' },
                            offline: { dot: 'bg-neutral-400', txt: 'Idle' },
                            connecting: { dot: 'bg-amber-500', txt: 'Connecting…' },
                        };
                        const p = map[state] || map.offline;
                        dot.className = 'presence-dot ' + p.dot;
                        txt.textContent = p.txt;
                    }
                }
            } catch { }
        })();
