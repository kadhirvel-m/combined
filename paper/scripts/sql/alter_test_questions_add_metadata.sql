-- Add per-question academic metadata for teacher test generation/display.
ALTER TABLE public.test_questions
  ADD COLUMN IF NOT EXISTS difficulty text,
  ADD COLUMN IF NOT EXISTS co text,
  ADD COLUMN IF NOT EXISTS k_level text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'test_questions_difficulty_chk'
  ) THEN
    ALTER TABLE public.test_questions
      ADD CONSTRAINT test_questions_difficulty_chk
      CHECK (difficulty IS NULL OR difficulty = ANY (ARRAY['Easy', 'Medium', 'Hard']));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'test_questions_k_level_chk'
  ) THEN
    ALTER TABLE public.test_questions
      ADD CONSTRAINT test_questions_k_level_chk
      CHECK (k_level IS NULL OR k_level = ANY (ARRAY['K1', 'K2', 'K3', 'K4', 'K5', 'K6']));
  END IF;
END $$;
