-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.batches (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  college_id uuid NOT NULL,
  department_id uuid NOT NULL,
  from_year integer NOT NULL CHECK (from_year >= 1950 AND from_year <= 2100),
  to_year integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT batches_pkey PRIMARY KEY (id),
  CONSTRAINT batches_college_id_fkey FOREIGN KEY (college_id) REFERENCES public.colleges(id),
  CONSTRAINT batches_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id)
);
CREATE TABLE public.colleges (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  logo_url text,
  CONSTRAINT colleges_pkey PRIMARY KEY (id)
);
CREATE TABLE public.degrees (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  college_id uuid NOT NULL,
  name text NOT NULL,
  level text,
  duration_years integer CHECK (duration_years >= 1 AND duration_years <= 10),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT degrees_pkey PRIMARY KEY (id),
  CONSTRAINT degrees_college_id_fkey FOREIGN KEY (college_id) REFERENCES public.colleges(id)
);
CREATE TABLE public.departments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  college_id uuid NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  degree_id uuid NOT NULL,
  CONSTRAINT departments_pkey PRIMARY KEY (id),
  CONSTRAINT departments_college_id_fkey FOREIGN KEY (college_id) REFERENCES public.colleges(id),
  CONSTRAINT departments_degree_id_fkey FOREIGN KEY (degree_id) REFERENCES public.degrees(id)
);
CREATE TABLE public.project_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  applicant_user_id uuid NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'pending'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT project_applications_pkey PRIMARY KEY (id),
  CONSTRAINT project_applications_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
  CONSTRAINT project_applications_applicant_user_id_fkey FOREIGN KEY (applicant_user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.project_collab_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL,
  sender_user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT project_collab_messages_pkey PRIMARY KEY (id),
  CONSTRAINT project_collab_messages_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.project_applications(id),
  CONSTRAINT project_collab_messages_sender_user_id_fkey FOREIGN KEY (sender_user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  tagline text NOT NULL,
  domains ARRAY DEFAULT '{}'::text[],
  description text NOT NULL,
  tech_stack ARRAY DEFAULT '{}'::text[],
  proj_status text,
  start_date date,
  end_date date,
  milestones ARRAY DEFAULT '{}'::text[],
  github text,
  demo text,
  video text,
  docs text,
  fund_stage text,
  fund_budget_inr bigint,
  fund_use text,
  team_members ARRAY DEFAULT '{}'::text[],
  roles_hiring ARRAY DEFAULT '{}'::text[],
  compensation text,
  hours text,
  role_desc text,
  cover_url text,
  gallery_urls ARRAY DEFAULT '{}'::text[],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT projects_pkey PRIMARY KEY (id),
  CONSTRAINT projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.skill_tests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  skill text NOT NULL,
  questions jsonb NOT NULL,
  status text NOT NULL DEFAULT 'active'::text,
  score numeric,
  result jsonb,
  submitted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT skill_tests_pkey PRIMARY KEY (id),
  CONSTRAINT skill_tests_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.skill_verifications (
  user_id uuid NOT NULL,
  skill text NOT NULL,
  best_score numeric DEFAULT 0,
  attempts integer DEFAULT 0,
  status text DEFAULT 'needs_review'::text,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT skill_verifications_pkey PRIMARY KEY (skill, user_id),
  CONSTRAINT skill_verifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.syllabus_courses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  batch_id uuid NOT NULL,
  semester integer NOT NULL CHECK (semester >= 1 AND semester <= 12),
  course_code text NOT NULL,
  title text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT syllabus_courses_pkey PRIMARY KEY (id),
  CONSTRAINT syllabus_courses_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.batches(id)
);
CREATE TABLE public.syllabus_topics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL,
  topic text NOT NULL,
  order_in_unit integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT syllabus_topics_pkey PRIMARY KEY (id),
  CONSTRAINT syllabus_topics_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.syllabus_units(id)
);
CREATE TABLE public.syllabus_units (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL,
  unit_title text NOT NULL,
  order_in_course integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT syllabus_units_pkey PRIMARY KEY (id),
  CONSTRAINT syllabus_units_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.syllabus_courses(id)
);
CREATE TABLE public.user_certifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_profile_id uuid NOT NULL,
  name text NOT NULL,
  issuing_org text,
  issue_date date,
  expiration_date date,
  does_not_expire boolean DEFAULT false,
  credential_id text,
  credential_url text,
  description text,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_certifications_pkey PRIMARY KEY (id),
  CONSTRAINT user_certifications_user_profile_id_fkey FOREIGN KEY (user_profile_id) REFERENCES public.user_profiles(id)
);
CREATE TABLE public.user_education (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_profile_id uuid NOT NULL,
  school text NOT NULL,
  degree text,
  grade text,
  activities text,
  description text,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  department text,
  batch_range text,
  regno text,
  current_semester integer CHECK (current_semester >= 1 AND current_semester <= 12),
  college_id uuid,
  degree_id uuid,
  department_id uuid,
  batch_id uuid,
  CONSTRAINT user_education_pkey PRIMARY KEY (id),
  CONSTRAINT user_education_user_profile_id_fkey FOREIGN KEY (user_profile_id) REFERENCES public.user_profiles(id),
  CONSTRAINT user_education_college_id_fkey FOREIGN KEY (college_id) REFERENCES public.colleges(id),
  CONSTRAINT user_education_degree_id_fkey FOREIGN KEY (degree_id) REFERENCES public.degrees(id),
  CONSTRAINT user_education_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id),
  CONSTRAINT user_education_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.batches(id)
);
CREATE TABLE public.user_experiences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_profile_id uuid NOT NULL,
  title text NOT NULL,
  employment_type text,
  company text,
  company_logo_url text,
  location text,
  location_type text,
  start_date date NOT NULL,
  end_date date,
  is_current boolean DEFAULT false,
  description text,
  media jsonb,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  batch_id uuid,
  CONSTRAINT user_experiences_pkey PRIMARY KEY (id),
  CONSTRAINT user_experiences_user_profile_id_fkey FOREIGN KEY (user_profile_id) REFERENCES public.user_profiles(id),
  CONSTRAINT user_experiences_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.batches(id)
);
CREATE TABLE public.user_portfolio_projects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_profile_id uuid NOT NULL,
  name text NOT NULL,
  associated_experience_id uuid,
  associated_education_id uuid,
  start_date date,
  end_date date,
  url text,
  description text,
  tech_stack ARRAY,
  team jsonb,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_portfolio_projects_pkey PRIMARY KEY (id),
  CONSTRAINT user_portfolio_projects_user_profile_id_fkey FOREIGN KEY (user_profile_id) REFERENCES public.user_profiles(id),
  CONSTRAINT user_portfolio_projects_associated_experience_id_fkey FOREIGN KEY (associated_experience_id) REFERENCES public.user_experiences(id),
  CONSTRAINT user_portfolio_projects_associated_education_id_fkey FOREIGN KEY (associated_education_id) REFERENCES public.user_education(id)
);
CREATE TABLE public.user_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  auth_user_id uuid NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  name text,
  gender text CHECK (gender = ANY (ARRAY['female'::text, 'male'::text, 'other'::text])),
  phone text,
  batch_from integer CHECK (batch_from >= 1950 AND batch_from <= 2100),
  batch_to integer,
  semester integer CHECK (semester >= 1 AND semester <= 12),
  regno text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  profile_image_url text,
  resume_url text,
  bio text,
  linkedin text,
  github text,
  leetcode text,
  specializations jsonb,
  projects jsonb,
  headline text,
  location text,
  dob date,
  portfolio_url text,
  website text,
  twitter text,
  instagram text,
  medium text,
  verification_score integer,
  technologies text,
  skills text,
  certifications text,
  languages text,
  interests text,
  project_info text,
  publications text,
  achievements text,
  experience text,
  CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT user_profiles_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_publications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_profile_id uuid NOT NULL,
  title text NOT NULL,
  publisher text,
  publication_date date,
  authors ARRAY,
  url text,
  abstract text,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_publications_pkey PRIMARY KEY (id),
  CONSTRAINT user_publications_user_profile_id_fkey FOREIGN KEY (user_profile_id) REFERENCES public.user_profiles(id)
);
CREATE TABLE public.user_topic_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_profile_id uuid NOT NULL,
  topic_id uuid NOT NULL,
  completed_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_topic_progress_pkey PRIMARY KEY (id),
  CONSTRAINT user_topic_progress_user_profile_id_fkey FOREIGN KEY (user_profile_id) REFERENCES public.user_profiles(id),
  CONSTRAINT user_topic_progress_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.syllabus_topics(id)
);

-- =============================================
-- Notes Marketplace / Wallet Extension (PaperX)
-- =============================================
-- Tables introduced:
--   note_subjects (optional taxonomy bridge to syllabus_courses)
--   marketplace_notes (core note metadata)
--   marketplace_note_files (original + preview assets)
--   marketplace_note_purchases (transactional purchases)
--   marketplace_note_ratings (1..5 star + review)
--   marketplace_note_reports (quality / abuse reports)
--   user_wallets (aggregated balance)
--   user_wallet_transactions (ledger entries)
--   faculty_verifications (faculty status + approved subjects)
-- All FK user references go to auth.users or user_profiles depending on existing pattern.

CREATE TABLE public.note_subjects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  syllabus_course_id uuid, -- optional link to an existing syllabus course
  subject_code text,
  title text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT note_subjects_pkey PRIMARY KEY (id),
  CONSTRAINT note_subjects_course_fkey FOREIGN KEY (syllabus_course_id) REFERENCES public.syllabus_courses(id)
);

CREATE TABLE public.marketplace_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  uploader_user_id uuid NOT NULL, -- auth.users.id
  subject_id uuid,                 -- FK into note_subjects
  college_id uuid,                 -- for scoping / filtering
  degree_id uuid,
  department_id uuid,
  batch_id uuid,
  semester integer CHECK (semester >= 1 AND semester <= 12),
  title text NOT NULL,
  description text,
  is_paid boolean NOT NULL DEFAULT false,
  price_cents integer CHECK (price_cents >= 0), -- store smallest unit (INR paise)
  file_type text,             -- pdf, docx, md, zip
  pages integer,
  content_hash text,
  preview_ready boolean DEFAULT false,
  faculty_verified boolean DEFAULT false, -- snapshot flag (denormalized)
  avg_rating numeric(3,2) DEFAULT 0,
  ratings_count integer DEFAULT 0,
  downloads_count integer DEFAULT 0,
  purchase_count integer DEFAULT 0,
  status text NOT NULL DEFAULT 'active', -- active|disabled|under_review
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT marketplace_notes_pkey PRIMARY KEY (id),
  CONSTRAINT marketplace_notes_uploader_fkey FOREIGN KEY (uploader_user_id) REFERENCES auth.users(id),
  CONSTRAINT marketplace_notes_subject_fkey FOREIGN KEY (subject_id) REFERENCES public.note_subjects(id),
  CONSTRAINT marketplace_notes_college_fkey FOREIGN KEY (college_id) REFERENCES public.colleges(id),
  CONSTRAINT marketplace_notes_degree_fkey FOREIGN KEY (degree_id) REFERENCES public.degrees(id),
  CONSTRAINT marketplace_notes_department_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id),
  CONSTRAINT marketplace_notes_batch_fkey FOREIGN KEY (batch_id) REFERENCES public.batches(id)
);

CREATE INDEX marketplace_notes_subject_idx ON public.marketplace_notes(subject_id);
CREATE INDEX marketplace_notes_filters_idx ON public.marketplace_notes(college_id, degree_id, department_id, batch_id, semester);
CREATE INDEX marketplace_notes_paid_idx ON public.marketplace_notes(is_paid, status);

CREATE TABLE public.marketplace_note_files (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  note_id uuid NOT NULL,
  file_role text NOT NULL, -- original|preview|watermark|extra
  storage_path text NOT NULL,
  file_size bigint,
  mime_type text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT marketplace_note_files_pkey PRIMARY KEY (id),
  CONSTRAINT marketplace_note_files_note_fkey FOREIGN KEY (note_id) REFERENCES public.marketplace_notes(id) ON DELETE CASCADE
);
CREATE INDEX marketplace_note_files_note_idx ON public.marketplace_note_files(note_id);

CREATE TABLE public.marketplace_note_purchases (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  note_id uuid NOT NULL,
  buyer_user_id uuid NOT NULL,
  uploader_user_id uuid NOT NULL,
  amount_cents integer NOT NULL CHECK (amount_cents >= 0),
  platform_fee_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'completed', -- completed|refunded|pending
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT marketplace_note_purchases_pkey PRIMARY KEY (id),
  CONSTRAINT marketplace_note_purchases_note_fkey FOREIGN KEY (note_id) REFERENCES public.marketplace_notes(id),
  CONSTRAINT marketplace_note_purchases_buyer_fkey FOREIGN KEY (buyer_user_id) REFERENCES auth.users(id),
  CONSTRAINT marketplace_note_purchases_uploader_fkey FOREIGN KEY (uploader_user_id) REFERENCES auth.users(id)
);
CREATE INDEX marketplace_note_purchases_buyer_idx ON public.marketplace_note_purchases(buyer_user_id);
CREATE INDEX marketplace_note_purchases_note_idx ON public.marketplace_note_purchases(note_id);

CREATE TABLE public.marketplace_note_ratings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  note_id uuid NOT NULL,
  user_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT marketplace_note_ratings_pkey PRIMARY KEY (id),
  CONSTRAINT marketplace_note_ratings_note_fkey FOREIGN KEY (note_id) REFERENCES public.marketplace_notes(id) ON DELETE CASCADE,
  CONSTRAINT marketplace_note_ratings_user_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT marketplace_note_ratings_unique UNIQUE (note_id, user_id)
);
CREATE INDEX marketplace_note_ratings_note_idx ON public.marketplace_note_ratings(note_id);

CREATE TABLE public.marketplace_note_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  note_id uuid NOT NULL,
  reporter_user_id uuid NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'open', -- open|reviewed|dismissed
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  CONSTRAINT marketplace_note_reports_pkey PRIMARY KEY (id),
  CONSTRAINT marketplace_note_reports_note_fkey FOREIGN KEY (note_id) REFERENCES public.marketplace_notes(id) ON DELETE CASCADE,
  CONSTRAINT marketplace_note_reports_reporter_fkey FOREIGN KEY (reporter_user_id) REFERENCES auth.users(id)
);
CREATE INDEX marketplace_note_reports_note_idx ON public.marketplace_note_reports(note_id);

CREATE TABLE public.user_wallets (
  user_id uuid PRIMARY KEY, -- auth.users.id
  balance_cents bigint NOT NULL DEFAULT 0 CHECK (balance_cents >= 0),
  pending_cents bigint NOT NULL DEFAULT 0 CHECK (pending_cents >= 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_wallets_user_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

CREATE TABLE public.user_wallet_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  note_id uuid, -- optional link if derived from a note sale
  purchase_id uuid, -- optional link to purchase
  type text NOT NULL, -- credit|debit|hold|release
  amount_cents bigint NOT NULL CHECK (amount_cents >= 0),
  balance_after_cents bigint,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_wallet_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT user_wallet_transactions_user_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT user_wallet_transactions_note_fkey FOREIGN KEY (note_id) REFERENCES public.marketplace_notes(id),
  CONSTRAINT user_wallet_transactions_purchase_fkey FOREIGN KEY (purchase_id) REFERENCES public.marketplace_note_purchases(id)
);
CREATE INDEX user_wallet_tx_user_idx ON public.user_wallet_transactions(user_id);

CREATE TABLE public.faculty_verifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL, -- auth.users.id
  verified boolean NOT NULL DEFAULT false,
  verification_note text,
  subjects jsonb, -- list of subject_ids or codes authorized
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT faculty_verifications_pkey PRIMARY KEY (id),
  CONSTRAINT faculty_verifications_user_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT faculty_verifications_unique UNIQUE (user_id)
);

-- Suggested materialized view (not created here) for fast search:
-- CREATE MATERIALIZED VIEW public.mv_marketplace_note_search AS
--   SELECT n.id, setweight(to_tsvector('english', coalesce(n.title,'')), 'A') ||
--          setweight(to_tsvector('english', coalesce(n.description,'')), 'B') AS doc
--   FROM public.marketplace_notes n WHERE n.status='active';
