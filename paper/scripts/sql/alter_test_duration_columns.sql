-- Ensure test duration and attempt elapsed fields exist in older deployments.
ALTER TABLE public.tests
  ADD COLUMN IF NOT EXISTS duration_seconds integer;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'tests_duration_seconds_check'
  ) THEN
    ALTER TABLE public.tests
      ADD CONSTRAINT tests_duration_seconds_check
      CHECK (duration_seconds IS NULL OR duration_seconds >= 0);
  END IF;
END $$;

ALTER TABLE public.test_attempts
  ADD COLUMN IF NOT EXISTS elapsed_seconds integer;
