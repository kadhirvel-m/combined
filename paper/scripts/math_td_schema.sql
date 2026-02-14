-- Math Tower Defense (solo) schema for SQLite

CREATE TABLE IF NOT EXISTS math_td_sessions (
    id TEXT PRIMARY KEY,
    mode TEXT NOT NULL DEFAULT 'solo',
    status TEXT NOT NULL DEFAULT 'active',
    player_name TEXT NOT NULL DEFAULT 'Player',
    enemy_name TEXT NOT NULL DEFAULT 'Enemy AI',
    player_castle_hp INTEGER NOT NULL,
    enemy_castle_hp INTEGER NOT NULL,
    elixir REAL NOT NULL,
    ai_elixir REAL NOT NULL,
    game_time REAL NOT NULL,
    state_json TEXT NOT NULL,
    active_question_id TEXT,
    active_question_answer INTEGER,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    ended_at TEXT
);

CREATE TABLE IF NOT EXISTS math_td_question_history (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    question_text TEXT NOT NULL,
    options_json TEXT NOT NULL,
    correct_answer INTEGER NOT NULL,
    selected_answer INTEGER,
    is_correct INTEGER,
    reward_elixir REAL NOT NULL DEFAULT 0,
    difficulty INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    answered_at TEXT,
    FOREIGN KEY(session_id) REFERENCES math_td_sessions(id)
);

CREATE INDEX IF NOT EXISTS idx_math_td_sessions_status ON math_td_sessions(status);
CREATE INDEX IF NOT EXISTS idx_math_td_question_history_session ON math_td_question_history(session_id);
