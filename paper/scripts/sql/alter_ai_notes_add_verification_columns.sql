-- Add verification tracking fields for teacher/HOD review in notes_generator.
ALTER TABLE public.ai_notes
  ADD COLUMN IF NOT EXISTS verified_by_teacher_id uuid,
  ADD COLUMN IF NOT EXISTS verified_by_name text,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz;

COMMENT ON COLUMN public.ai_notes.verified_by_teacher_id IS 'Auth user id of teacher/hod who verified this note';
COMMENT ON COLUMN public.ai_notes.verified_by_name IS 'Display name of verifier at verification time';
COMMENT ON COLUMN public.ai_notes.verified_at IS 'UTC timestamp when note was verified';
