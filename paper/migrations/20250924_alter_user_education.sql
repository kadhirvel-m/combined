-- Migration: Alter user_education to new structure (department, batch_range, regno, current_semester)
-- Date: 2025-09-24
-- Note: Review and adjust for your deployment (Supabase / Postgres). Wrap in transaction.

BEGIN;

-- 1. Add new columns (nullable initially).
ALTER TABLE public.user_education
    ADD COLUMN department text,
    ADD COLUMN batch_range text,
    ADD COLUMN regno text,
    ADD COLUMN current_semester integer CHECK (current_semester >= 1 AND current_semester <= 12);

-- 2. Optionally migrate existing data: map field_of_study -> department.
UPDATE public.user_education SET department = field_of_study WHERE department IS NULL AND field_of_study IS NOT NULL;

-- 3. (Optional) Derive batch_range from user_profiles if possible (join on user_profile_id) when both batch_from & batch_to exist.
UPDATE public.user_education ue
SET batch_range = CONCAT(up.batch_from, '-', up.batch_to)
FROM public.user_profiles up
WHERE ue.user_profile_id = up.id
  AND up.batch_from IS NOT NULL AND up.batch_to IS NOT NULL
  AND (ue.batch_range IS NULL OR ue.batch_range = '');

-- 4. (Optional) Fill regno & current_semester from user_profiles if blank.
UPDATE public.user_education ue
SET regno = up.regno
FROM public.user_profiles up
WHERE ue.user_profile_id = up.id
  AND up.regno IS NOT NULL AND (ue.regno IS NULL OR ue.regno = '');

UPDATE public.user_education ue
SET current_semester = up.semester
FROM public.user_profiles up
WHERE ue.user_profile_id = up.id
  AND up.semester IS NOT NULL AND ue.current_semester IS NULL;

-- 5. Drop legacy columns no longer used by application layer.
ALTER TABLE public.user_education
    DROP COLUMN field_of_study,
    DROP COLUMN start_date,
    DROP COLUMN end_date;

COMMIT;

-- Rollback plan (manual):
-- ALTER TABLE public.user_education ADD COLUMN field_of_study text; (data lost unless backed up)
-- ALTER TABLE public.user_education ADD COLUMN start_date date; ALTER TABLE public.user_education ADD COLUMN end_date date;
-- ALTER TABLE public.user_education DROP COLUMN department, DROP COLUMN batch_range, DROP COLUMN regno, DROP COLUMN current_semester;
