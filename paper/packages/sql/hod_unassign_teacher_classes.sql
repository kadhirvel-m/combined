-- Allow "unassigned" classes by making teacher_user_id nullable.
-- This is needed for HOD staff removal flow to unlink staff from classes.

ALTER TABLE public.teacher_classes
  ALTER COLUMN teacher_user_id DROP NOT NULL;
