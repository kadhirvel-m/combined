-- Teacher weekly timetable schema
-- Run in Supabase SQL editor before using timetable APIs/UI.

CREATE TABLE IF NOT EXISTS public.teacher_timetable_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_index smallint NOT NULL CHECK (day_index BETWEEN 1 AND 6),
  period_index smallint NOT NULL CHECK (period_index BETWEEN 1 AND 8),
  class_id uuid NULL REFERENCES public.teacher_classes(id) ON DELETE SET NULL,
  class_label text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT teacher_timetable_entries_unique UNIQUE (teacher_user_id, day_index, period_index)
);

CREATE INDEX IF NOT EXISTS idx_teacher_timetable_entries_teacher ON public.teacher_timetable_entries (teacher_user_id);
CREATE INDEX IF NOT EXISTS idx_teacher_timetable_entries_class ON public.teacher_timetable_entries (class_id);

DO $$
BEGIN
  CREATE OR REPLACE FUNCTION public._set_updated_at()
  RETURNS trigger AS $$
  BEGIN
    NEW.updated_at = now();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_teacher_timetable_entries'
  ) THEN
    CREATE TRIGGER set_timestamp_teacher_timetable_entries
    BEFORE UPDATE ON public.teacher_timetable_entries
    FOR EACH ROW EXECUTE PROCEDURE public._set_updated_at();
  END IF;
END $$;
