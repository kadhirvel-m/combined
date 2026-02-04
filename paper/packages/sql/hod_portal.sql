-- HOD Portal schema additions (Supabase/Postgres)
-- Run this in Supabase SQL editor (or as a migration) to enable HOD portal features.

-- 1) Map a HOD user to one or more departments.
--    We keep role in `public.admin_roles.role = 'hod'`.
CREATE TABLE IF NOT EXISTS public.hod_departments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  hod_user_id uuid NOT NULL,
  department_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT hod_departments_pkey PRIMARY KEY (id),
  CONSTRAINT hod_departments_hod_user_id_fkey FOREIGN KEY (hod_user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT hod_departments_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE CASCADE,
  CONSTRAINT hod_departments_unique UNIQUE (hod_user_id, department_id)
);

CREATE INDEX IF NOT EXISTS idx_hod_departments_hod_user_id ON public.hod_departments (hod_user_id);
CREATE INDEX IF NOT EXISTS idx_hod_departments_department_id ON public.hod_departments (department_id);

-- 2) HOD can add a recommendation note on teacher applications in their department.
CREATE TABLE IF NOT EXISTS public.hod_application_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL,
  hod_user_id uuid NOT NULL,
  recommendation text NOT NULL DEFAULT 'review' CHECK (recommendation = ANY (ARRAY['approve','reject','review'])),
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT hod_application_reviews_pkey PRIMARY KEY (id),
  CONSTRAINT hod_application_reviews_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.teacher_applications(id) ON DELETE CASCADE,
  CONSTRAINT hod_application_reviews_hod_user_id_fkey FOREIGN KEY (hod_user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT hod_application_reviews_unique UNIQUE (application_id, hod_user_id)
);

CREATE INDEX IF NOT EXISTS idx_hod_app_reviews_application_id ON public.hod_application_reviews (application_id);
CREATE INDEX IF NOT EXISTS idx_hod_app_reviews_hod_user_id ON public.hod_application_reviews (hod_user_id);

-- 3) Separate HOD role applications (HOD-only signup flow).
--    These are reviewed by Admin and, when approved, result in:
--      - admin_roles.role = 'hod'
--      - hod_departments row(s)
CREATE TABLE IF NOT EXISTS public.hod_role_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  auth_user_id uuid NOT NULL,
  email text NOT NULL,
  name text,
  college_id uuid,
  department_id uuid,
  motivation text,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  notes text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  id_card_front_path text,
  id_card_back_path text,
  CONSTRAINT hod_role_applications_pkey PRIMARY KEY (id),
  CONSTRAINT hod_role_applications_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT hod_role_applications_college_id_fkey FOREIGN KEY (college_id) REFERENCES public.colleges(id),
  CONSTRAINT hod_role_applications_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id),
  CONSTRAINT hod_role_applications_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id),
  CONSTRAINT hod_role_applications_unique UNIQUE (auth_user_id)
);

CREATE INDEX IF NOT EXISTS idx_hod_role_apps_auth_user_id ON public.hod_role_applications (auth_user_id);
CREATE INDEX IF NOT EXISTS idx_hod_role_apps_status ON public.hod_role_applications (status);
CREATE INDEX IF NOT EXISTS idx_hod_role_apps_department_id ON public.hod_role_applications (department_id);

-- 4) HOD Batch Management
-- Store per-department mapping from academic year (1..4) to a batch.
-- This is a light-weight configuration that HOD can edit in the portal.
CREATE TABLE IF NOT EXISTS public.hod_batch_management (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  department_id uuid NOT NULL,
  first_year_batch_id uuid,
  first_year_sem smallint,
  second_year_batch_id uuid,
  second_year_sem smallint,
  third_year_batch_id uuid,
  third_year_sem smallint,
  final_year_batch_id uuid,
  final_year_sem smallint,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT hod_batch_management_pkey PRIMARY KEY (id),
  CONSTRAINT hod_batch_management_department_unique UNIQUE (department_id),
  CONSTRAINT hod_batch_management_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE CASCADE,
  CONSTRAINT hod_batch_management_first_year_batch_id_fkey FOREIGN KEY (first_year_batch_id) REFERENCES public.batches(id),
  CONSTRAINT hod_batch_management_second_year_batch_id_fkey FOREIGN KEY (second_year_batch_id) REFERENCES public.batches(id),
  CONSTRAINT hod_batch_management_third_year_batch_id_fkey FOREIGN KEY (third_year_batch_id) REFERENCES public.batches(id),
  CONSTRAINT hod_batch_management_final_year_batch_id_fkey FOREIGN KEY (final_year_batch_id) REFERENCES public.batches(id),
  CONSTRAINT hod_batch_management_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id)
);

-- Backfill-safe schema evolution (if table already existed before semester columns were added)
ALTER TABLE public.hod_batch_management ADD COLUMN IF NOT EXISTS first_year_sem smallint;
ALTER TABLE public.hod_batch_management ADD COLUMN IF NOT EXISTS second_year_sem smallint;
ALTER TABLE public.hod_batch_management ADD COLUMN IF NOT EXISTS third_year_sem smallint;
ALTER TABLE public.hod_batch_management ADD COLUMN IF NOT EXISTS final_year_sem smallint;

CREATE INDEX IF NOT EXISTS idx_hod_batch_management_department_id ON public.hod_batch_management (department_id);

-- Optional: trigger to auto-update updated_at
DO $$
BEGIN
  -- Ensure helper function exists.
  CREATE OR REPLACE FUNCTION public._set_updated_at()
  RETURNS trigger AS $$
  BEGIN
    NEW.updated_at = now();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_hod_application_reviews'
  ) THEN
    CREATE TRIGGER set_timestamp_hod_application_reviews
    BEFORE UPDATE ON public.hod_application_reviews
    FOR EACH ROW EXECUTE PROCEDURE public._set_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_hod_role_applications'
  ) THEN
    CREATE TRIGGER set_timestamp_hod_role_applications
    BEFORE UPDATE ON public.hod_role_applications
    FOR EACH ROW EXECUTE PROCEDURE public._set_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_hod_batch_management'
  ) THEN
    CREATE TRIGGER set_timestamp_hod_batch_management
    BEFORE UPDATE ON public.hod_batch_management
    FOR EACH ROW EXECUTE PROCEDURE public._set_updated_at();
  END IF;
END $$;
