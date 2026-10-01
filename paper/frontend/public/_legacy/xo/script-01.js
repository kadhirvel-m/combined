// Extracted from ui/xo.html (inline <script> #1).
        const apiBase = (window.API_BASE || window.location.origin).replace(/\/$/, '');
        const token = (() => {
            try { return localStorage.getItem('px_token') || localStorage.getItem('teacherToken'); }
            catch { return null; }
        })();

        // Game State
        const state = {
            gameId: null,
            mode: 'ai_easy',
            board: [[null, null, null], [null, null, null], [null, null, null]],
            currentTurn: 'X',
            status: 'idle',
            scoreX: 0,
            scoreO: 0,
            round: 1,
            locked: false,
            stats: null,
        };

        const modeLabels = {
            'ai_easy': 'AI Easy 🤖',
            'ai_medium': 'AI Medium 🧠',
            'ai_hard': 'AI Hard 👑',
            'friend': 'Friend 🤝',
        };

        // ── Theme Toggle ──
        function toggleTheme() {
            try {
                if (window.Theme && window.Theme.toggle) {
                    window.Theme.toggle();
                } else {
                    const root = document.documentElement;
                    const isDark = root.getAttribute('data-theme') === 'dark';
                    root.setAttribute('data-theme', isDark ? 'light' : 'dark');
                    root.classList.toggle('dark', !isDark);
                }
                syncThemeAttr();
            } catch (e) { }
        }
        function syncThemeAttr() {
            const root = document.documentElement;
            const isDark = root.classList.contains('dark');
            root.setAttribute('data-theme', isDark ? 'dark' : 'light');
            const btn = document.getElementById('themeBtn');
            if (btn) btn.innerHTML = `<span class="material-symbols-rounded" style="font-size:16px">${isDark ? 'light_mode' : 'dark_mode'}</span>`;
        }

        // ── Stats ──
        function toggleStats() {
            const s = document.getElementById('statsSection');
            s.style.display = s.style.display === 'none' ? 'block' : 'none';
            if (s.style.display === 'block') loadStats();
        }

        async function loadStats() {
            if (!token) return;
            try {
                const res = await fetch(`${apiBase}/api/xo/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) return;
                const data = await res.json();
                const s = data.stats || {};
                state.stats = s;
                document.getElementById('statWins').textContent = s.wins || 0;
                document.getElementById('statLosses').textContent = s.losses || 0;
                document.getElementById('statDraws').textContent = s.draws || 0;
                document.getElementById('statStreak').textContent = s.current_streak || 0;
                document.getElementById('statElo').textContent = s.elo || 1000;
                document.getElementById('statPlayed').textContent = s.games_played || 0;
            } catch (e) { console.warn('Stats load failed', e); }
        }

        // ── Start Game ──
        async function startGame(mode) {
            state.mode = mode;
            state.round = 1;
            state.scoreX = 0;
            state.scoreO = 0;

            document.getElementById('modeScreen').style.display = 'none';
            document.getElementById('gameArea').classList.add('active');
            document.getElementById('modeLabel').textContent = modeLabels[mode] || mode;

            const isAI = mode.startsWith('ai_');
            document.getElementById('playerXName').textContent = 'You';
            document.getElementById('playerOName').textContent = isAI ? 'AI' : 'Player O';

            updateScores();
            await createNewGame();
        }

        async function createNewGame() {
            state.locked = true;
            resetBoardVisual();

            if (!token) {
                // Offline mode — play locally without backend
                state.gameId = null;
                state.board = [[null, null, null], [null, null, null], [null, null, null]];
                state.currentTurn = 'X';
                state.status = 'in_progress';
                state.locked = false;
                updateTurnDisplay();
                return;
            }

            try {
                const res = await fetch(`${apiBase}/api/xo/game`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ mode: state.mode })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.detail || 'Error');
                const g = data.game;
                state.gameId = g.id;
                state.board = g.board;
                state.currentTurn = g.current_turn;
                state.status = g.status;
            } catch (e) {
                console.warn('Backend unavailable, playing offline:', e.message);
                state.gameId = null;
                state.board = [[null, null, null], [null, null, null], [null, null, null]];
                state.currentTurn = 'X';
                state.status = 'in_progress';
            }
            state.locked = false;
            updateTurnDisplay();
        }

        // ── Make Move ──
        async function makeMove(row, col) {
            if (state.locked) return;
            if (state.status !== 'in_progress') return;
            if (state.board[row][col] !== null) return;

            state.locked = true;

            if (state.gameId && token) {
                // Online mode with backend — optimistic render for instant feedback
                state.board[row][col] = state.currentTurn;
                renderBoard();
                // Show "AI Thinking…" instantly for AI modes
                if (state.mode.startsWith('ai_')) {
                    const turnText = document.getElementById('turnText');
                    if (turnText) turnText.textContent = 'AI Thinking…';
                    document.getElementById('playerXCard').classList.remove('active-turn');
                    document.getElementById('playerOCard').classList.add('active-turn');
                }

                try {
                    const res = await fetch(`${apiBase}/api/xo/game/${state.gameId}/move`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ row, col })
                    });
                    const data = await res.json();
                    if (!res.ok) {
                        // Revert optimistic move
                        state.board[row][col] = null;
                        renderBoard();
                        state.locked = false;
                        updateTurnDisplay();
                        return;
                    }
                    const g = data.game;
                    state.board = g.board;
                    state.currentTurn = g.current_turn;
                    state.status = g.status;

                    // Render AI move with a tiny delay for visual effect
                    if (g.ai_move) {
                        await sleep(250);
                    }
                    renderBoard();

                    if (g.status !== 'in_progress') {
                        handleGameEnd(g);

                    }
                } catch (e) {
                    console.error('Move error:', e);
                }
            } else {
                // Offline / local mode
                const marker = state.currentTurn;
                state.board[row][col] = marker;
                renderBoard();

                const winner = checkWinnerLocal(state.board);
                const draw = !winner && isFullLocal(state.board);

                if (winner) {
                    state.status = winner === 'X' ? 'x_wins' : 'o_wins';
                    handleGameEndLocal(winner);
                    return;
                }
                if (draw) {
                    state.status = 'draw';
                    handleGameEndLocal(null);
                    return;
                }

                state.currentTurn = marker === 'X' ? 'O' : 'X';
                updateTurnDisplay();

                // AI move for offline mode
                if (state.mode.startsWith('ai_') && state.currentTurn === 'O') {
                    state.locked = true;
                    await sleep(400);
                    const aiMove = getLocalAIMove(state.board, state.mode);
                    if (aiMove) {
                        state.board[aiMove[0]][aiMove[1]] = 'O';
                        renderBoard();

                        const aiWinner = checkWinnerLocal(state.board);
                        const aiDraw = !aiWinner && isFullLocal(state.board);
                        if (aiWinner) {
                            state.status = 'o_wins';
                            handleGameEndLocal(aiWinner);
                            return;
                        }
                        if (aiDraw) {
                            state.status = 'draw';
                            handleGameEndLocal(null);
                            return;
                        }
                        state.currentTurn = 'X';
                        updateTurnDisplay();
                    }
                }
            }
            state.locked = false;
            updateTurnDisplay();
        }

        // ── Local AI (fallback when offline) ──
        function checkWinnerLocal(b) {
            const lines = [];
            for (let i = 0; i < 3; i++) {
                lines.push([b[i][0], b[i][1], b[i][2]]);
                lines.push([b[0][i], b[1][i], b[2][i]]);
            }
            lines.push([b[0][0], b[1][1], b[2][2]]);
            lines.push([b[0][2], b[1][1], b[2][0]]);
            for (const l of lines) {
                if (l[0] && l[0] === l[1] && l[1] === l[2]) return l[0];
            }
            return null;
        }
        function isFullLocal(b) {
            for (const row of b) for (const c of row) if (c === null) return false;
            return true;
        }
        function getEmptyCells(b) {
            const cells = [];
            for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) if (b[r][c] === null) cells.push([r, c]);
            return cells;
        }
        function minimax(b, isMax, alpha, beta) {
            const w = checkWinnerLocal(b);
            if (w === 'O') return 1;
            if (w === 'X') return -1;
            if (isFullLocal(b)) return 0;
            if (isMax) {
                let best = -Infinity;
                for (const [r, c] of getEmptyCells(b)) {
                    b[r][c] = 'O';
                    best = Math.max(best, minimax(b, false, alpha, beta));
                    b[r][c] = null;
                    alpha = Math.max(alpha, best);
                    if (beta <= alpha) break;
                }
                return best;
            } else {
                let best = Infinity;
                for (const [r, c] of getEmptyCells(b)) {
                    b[r][c] = 'X';
                    best = Math.min(best, minimax(b, true, alpha, beta));
                    b[r][c] = null;
                    beta = Math.min(beta, best);
                    if (beta <= alpha) break;
                }
                return best;
            }
        }
        function getLocalAIMove(b, mode) {
            const empty = getEmptyCells(b);
            if (!empty.length) return null;
            if (mode === 'ai_easy') return empty[Math.floor(Math.random() * empty.length)];
            if (mode === 'ai_medium' && Math.random() < 0.5) return empty[Math.floor(Math.random() * empty.length)];
            let bestScore = -Infinity, bestMove = empty[0];
            for (const [r, c] of empty) {
                b[r][c] = 'O';
                const score = minimax(b, false, -Infinity, Infinity);
                b[r][c] = null;
                if (score > bestScore) { bestScore = score; bestMove = [r, c]; }
            }
            return bestMove;
        }

        function getWinningLineLocal(b) {
            const lines = [];
            for (let i = 0; i < 3; i++) {
                lines.push([[i, 0], [i, 1], [i, 2]]);
                lines.push([[0, i], [1, i], [2, i]]);
            }
            lines.push([[0, 0], [1, 1], [2, 2]]);
            lines.push([[0, 2], [1, 1], [2, 0]]);
            for (const line of lines) {
                const [a, bb, cc] = line;
                if (b[a[0]][a[1]] && b[a[0]][a[1]] === b[bb[0]][bb[1]] && b[bb[0]][bb[1]] === b[cc[0]][cc[1]]) return line;
            }
            return null;
        }

        // ── Game End Handlers ──
        function handleGameEnd(g) {
            const winLine = g.winning_line;
            if (winLine) highlightWinLine(winLine.map(c => [c.row, c.col]));
            document.querySelectorAll('.cell').forEach(c => c.classList.add('game-over'));

            setTimeout(() => {
                if (g.status === 'x_wins') {
                    state.scoreX++;
                    showResult('win', 'You Win! 🎉', 'Brilliant strategy! You outsmarted the opponent.');
                    spawnConfetti();
                } else if (g.status === 'o_wins') {
                    state.scoreO++;
                    showResult('loss', 'You Lost 😔', state.mode === 'ai_hard' ? 'The AI is unbeatable! Try forcing a draw.' : 'Better luck next time!');
                } else {
                    showResult('draw', 'It\'s a Draw! 🤝', 'Great minds think alike. Neither player could win.');
                }
                updateScores();
            }, 800);
        }

        function handleGameEndLocal(winner) {
            const winLine = getWinningLineLocal(state.board);
            if (winLine) highlightWinLine(winLine);
            document.querySelectorAll('.cell').forEach(c => c.classList.add('game-over'));

            setTimeout(() => {
                if (winner === 'X') {
                    state.scoreX++;
                    const msg = state.mode === 'friend' ? 'Player X wins!' : 'You Win! 🎉';
                    showResult('win', msg, state.mode === 'friend' ? 'Player X dominated the board!' : 'Brilliant strategy!');
                    spawnConfetti();
                } else if (winner === 'O') {
                    state.scoreO++;
                    const msg = state.mode === 'friend' ? 'Player O wins!' : 'You Lost 😔';
                    showResult('loss', msg, state.mode === 'friend' ? 'Player O dominated the board!' : 'Better luck next time!');
                    if (state.mode === 'friend') spawnConfetti();
                } else {
                    showResult('draw', 'It\'s a Draw! 🤝', 'Neither player could clinch the victory.');
                }
                updateScores();
                state.locked = true;
            }, 800);
        }

        // ── Visual Updates ──
        function renderBoard() {
            const cells = document.querySelectorAll('.cell');
            cells.forEach(cell => {
                const r = +cell.dataset.row, c = +cell.dataset.col;
                const val = state.board[r][c];
                const marker = cell.querySelector('.marker');
                if (val) {
                    marker.textContent = val;
                    marker.className = `marker show ${val === 'X' ? 'x-text' : 'o-text'}`;
                    cell.classList.add('occupied');
                } else {
                    marker.textContent = '';
                    marker.className = 'marker';
                    cell.classList.remove('occupied');
                }
            });
        }

        function resetBoardVisual() {
            const cells = document.querySelectorAll('.cell');
            cells.forEach(cell => {
                const marker = cell.querySelector('.marker');
                marker.textContent = '';
                marker.className = 'marker';
                cell.classList.remove('occupied', 'win-cell', 'game-over');
            });
        }

        function highlightWinLine(positions) {
            positions.forEach(([r, c]) => {
                const cell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
                if (cell) cell.classList.add('win-cell');
            });
        }

        function updateTurnDisplay() {
            const indicator = document.getElementById('turnIndicator');
            const turnText = document.getElementById('turnText');
            const pxCard = document.getElementById('playerXCard');
            const poCard = document.getElementById('playerOCard');

            if (state.status !== 'in_progress') {
                turnText.textContent = 'Game Over';
                pxCard.classList.remove('active-turn');
                poCard.classList.remove('active-turn');
                return;
            }

            if (state.currentTurn === 'X') {
                turnText.textContent = state.mode === 'friend' ? 'X\'s Turn' : 'Your Turn';
                pxCard.classList.add('active-turn');
                poCard.classList.remove('active-turn');
            } else {
                turnText.textContent = state.mode === 'friend' ? 'O\'s Turn' : 'AI Thinking…';
                pxCard.classList.remove('active-turn');
                poCard.classList.add('active-turn');
            }
        }

        function updateScores() {
            document.getElementById('playerXScore').textContent = `Score: ${state.scoreX}`;
            document.getElementById('playerOScore').textContent = `Score: ${state.scoreO}`;
            document.getElementById('roundDisplay').textContent = `Round ${state.round}`;
        }

        // ── Result Modal ──
        function showResult(type, title, subtitle) {
            const overlay = document.getElementById('resultOverlay');
            document.getElementById('resultTitle').textContent = title;
            document.getElementById('resultSubtitle').textContent = subtitle;
            const emoji = document.getElementById('resultEmoji');
            if (type === 'win') emoji.textContent = '🏆';
            else if (type === 'loss') emoji.textContent = '😔';
            else emoji.textContent = '🤝';
            overlay.classList.add('active');
        }

        function hideResult() {
            document.getElementById('resultOverlay').classList.remove('active');
        }

        async function playAgain() {
            hideResult();
            state.round++;
            state.status = 'in_progress';
            state.locked = false;
            await createNewGame();
        }

        function resetBoard() {
            hideResult();
            state.status = 'in_progress';
            state.locked = false;
            createNewGame();
        }

        function backToMenu() {
            hideResult();
            document.getElementById('gameArea').classList.remove('active');
            document.getElementById('modeScreen').style.display = 'block';
            state.gameId = null;
            state.status = 'idle';
            state.locked = false;
            loadStats();
        }

        // ── Confetti ──
        function spawnConfetti() {
            const container = document.getElementById('confettiContainer');
            const colors = ['#9E4B8A', '#4C2A59', '#00B8D4', '#FFD700', '#EFA3DC', '#56E1E1', '#F59E0B', '#10B981'];
            for (let i = 0; i < 60; i++) {
                const piece = document.createElement('div');
                piece.className = 'confetti-piece';
                piece.style.left = Math.random() * 100 + 'vw';
                piece.style.background = colors[Math.floor(Math.random() * colors.length)];
                piece.style.width = (Math.random() * 8 + 5) + 'px';
                piece.style.height = (Math.random() * 8 + 5) + 'px';
                piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
                piece.style.animationDuration = (Math.random() * 2 + 2) + 's';
                piece.style.animationDelay = Math.random() * 0.8 + 's';
                container.appendChild(piece);
            }
            setTimeout(() => { container.innerHTML = ''; }, 4000);
        }

        // ── Utility ──
        function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

        // ── Init ──
        document.addEventListener('DOMContentLoaded', () => {
            syncThemeAttr();
            // Init theme
            try {
                if (window.Theme && window.Theme.init) window.Theme.init();
                syncThemeAttr();
            } catch (e) { }

            if (token) loadStats();
        });
