-- XO Game Tables for PaperX
-- Run this in your Supabase SQL Editor

-- 1. Games table: stores each game session
CREATE TABLE IF NOT EXISTS public.xo_games (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  player_x uuid NOT NULL,
  player_o uuid,
  mode text NOT NULL DEFAULT 'ai_easy' CHECK (mode IN ('ai_easy', 'ai_medium', 'ai_hard', 'friend')),
  board jsonb NOT NULL DEFAULT '[[null,null,null],[null,null,null],[null,null,null]]'::jsonb,
  current_turn text NOT NULL DEFAULT 'X' CHECK (current_turn IN ('X', 'O')),
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'x_wins', 'o_wins', 'draw')),
  winner uuid,
  move_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  finished_at timestamp with time zone,
  CONSTRAINT xo_games_pkey PRIMARY KEY (id),
  CONSTRAINT xo_games_player_x_fkey FOREIGN KEY (player_x) REFERENCES auth.users(id),
  CONSTRAINT xo_games_player_o_fkey FOREIGN KEY (player_o) REFERENCES auth.users(id),
  CONSTRAINT xo_games_winner_fkey FOREIGN KEY (winner) REFERENCES auth.users(id)
);

-- 2. Moves table: stores each individual move
CREATE TABLE IF NOT EXISTS public.xo_moves (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL,
  player_id uuid NOT NULL,
  marker text NOT NULL CHECK (marker IN ('X', 'O')),
  row_idx integer NOT NULL CHECK (row_idx >= 0 AND row_idx <= 2),
  col_idx integer NOT NULL CHECK (col_idx >= 0 AND col_idx <= 2),
  move_number integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT xo_moves_pkey PRIMARY KEY (id),
  CONSTRAINT xo_moves_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.xo_games(id) ON DELETE CASCADE,
  CONSTRAINT xo_moves_player_id_fkey FOREIGN KEY (player_id) REFERENCES auth.users(id)
);

-- 3. Player stats table: aggregated stats per player
CREATE TABLE IF NOT EXISTS public.xo_player_stats (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  wins integer NOT NULL DEFAULT 0,
  losses integer NOT NULL DEFAULT 0,
  draws integer NOT NULL DEFAULT 0,
  current_streak integer NOT NULL DEFAULT 0,
  best_streak integer NOT NULL DEFAULT 0,
  elo integer NOT NULL DEFAULT 1000,
  games_played integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT xo_player_stats_pkey PRIMARY KEY (id),
  CONSTRAINT xo_player_stats_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_xo_games_player_x ON public.xo_games(player_x);
CREATE INDEX IF NOT EXISTS idx_xo_games_player_o ON public.xo_games(player_o);
CREATE INDEX IF NOT EXISTS idx_xo_games_status ON public.xo_games(status);
CREATE INDEX IF NOT EXISTS idx_xo_moves_game_id ON public.xo_moves(game_id);
CREATE INDEX IF NOT EXISTS idx_xo_player_stats_elo ON public.xo_player_stats(elo DESC);
CREATE INDEX IF NOT EXISTS idx_xo_player_stats_wins ON public.xo_player_stats(wins DESC);
