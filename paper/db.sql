-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.active_subjects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT active_subjects_pkey PRIMARY KEY (id)
);
CREATE TABLE public.admin_roles (
  auth_user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'student'::text,
  permissions jsonb DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT admin_roles_pkey PRIMARY KEY (auth_user_id),
  CONSTRAINT admin_roles_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.ai_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_ci text DEFAULT lower(title),
  markdown text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  image_urls ARRAY DEFAULT '{}'::text[],
  labs text,
  CONSTRAINT ai_notes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.ai_notes_cheatsheet (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_ci text DEFAULT lower(title),
  markdown text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  image_urls ARRAY DEFAULT '{}'::text[],
  CONSTRAINT ai_notes_cheatsheet_pkey PRIMARY KEY (id)
);
CREATE TABLE public.ai_notes_simple (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_ci text DEFAULT lower(title),
  markdown text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  image_urls ARRAY DEFAULT '{}'::text[],
  CONSTRAINT ai_notes_simple_pkey PRIMARY KEY (id)
);
CREATE TABLE public.ai_notes_user_edits (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  title_ci text DEFAULT lower(title),
  variant text NOT NULL DEFAULT 'detailed'::text,
  markdown text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT ai_notes_user_edits_pkey PRIMARY KEY (id),
  CONSTRAINT ai_notes_user_edits_user_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.analytics_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  session_id uuid,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT analytics_events_pkey PRIMARY KEY (id),
  CONSTRAINT analytics_events_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.user_sessions(id)
);
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
CREATE TABLE public.degree_allowed_domains (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  degree_key text NOT NULL,
  degree_label text NOT NULL,
  domain text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT degree_allowed_domains_pkey PRIMARY KEY (id)
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
CREATE TABLE public.learning_track_goals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  auth_user_id uuid NOT NULL UNIQUE,
  profile_id uuid NOT NULL,
  language text NOT NULL,
  stack text NOT NULL,
  goal text NOT NULL,
  companies ARRAY DEFAULT '{}'::text[],
  experience_level text,
  focus_areas jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT learning_track_goals_pkey PRIMARY KEY (id),
  CONSTRAINT learning_track_goals_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id),
  CONSTRAINT learning_track_goals_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.user_profiles(id)
);
CREATE TABLE public.learning_track_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  plan_id text NOT NULL UNIQUE,
  auth_user_id uuid NOT NULL,
  profile_id uuid NOT NULL,
  language text NOT NULL,
  stack text NOT NULL,
  goal text NOT NULL,
  companies ARRAY DEFAULT '{}'::text[],
  experience_level text,
  focus_areas jsonb DEFAULT '[]'::jsonb,
  generated_at timestamp with time zone,
  plan_json jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT learning_track_plans_pkey PRIMARY KEY (id),
  CONSTRAINT learning_track_plans_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id),
  CONSTRAINT learning_track_plans_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.user_profiles(id)
);
CREATE TABLE public.learning_track_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  auth_user_id uuid NOT NULL,
  profile_id uuid NOT NULL,
  plan_id text NOT NULL,
  topic_id text NOT NULL,
  status text NOT NULL CHECK (status = ANY (ARRAY['not_started'::text, 'in_progress'::text, 'completed'::text])),
  score numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT learning_track_progress_pkey PRIMARY KEY (id),
  CONSTRAINT learning_track_progress_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id),
  CONSTRAINT learning_track_progress_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.user_profiles(id),
  CONSTRAINT learning_track_progress_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.learning_track_plans(plan_id)
);
CREATE TABLE public.marketplace_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  subject text,
  unit text,
  exam_type text,
  categories ARRAY DEFAULT '{}'::text[],
  price_cents integer NOT NULL DEFAULT 0 CHECK (price_cents >= 0),
  original_filename text,
  stored_path text,
  mime_type text,
  file_size bigint,
  downloads integer NOT NULL DEFAULT 0,
  purchases integer NOT NULL DEFAULT 0,
  avg_rating numeric DEFAULT 0,
  rating_count integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  college_id uuid,
  degree_id uuid,
  department_id uuid,
  batch_id uuid,
  semester integer CHECK (semester >= 1 AND semester <= 12),
  cover_path text,
  subject_id uuid,
  subject_href text,
  url text,
  CONSTRAINT marketplace_notes_pkey PRIMARY KEY (id),
  CONSTRAINT marketplace_notes_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES auth.users(id),
  CONSTRAINT marketplace_notes_college_id_fkey FOREIGN KEY (college_id) REFERENCES public.colleges(id),
  CONSTRAINT marketplace_notes_degree_id_fkey FOREIGN KEY (degree_id) REFERENCES public.degrees(id),
  CONSTRAINT marketplace_notes_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id),
  CONSTRAINT marketplace_notes_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.batches(id),
  CONSTRAINT marketplace_notes_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.syllabus_courses(id)
);
CREATE TABLE public.marketplace_purchases (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  note_id uuid NOT NULL,
  buyer_user_id uuid NOT NULL,
  amount_cents integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT marketplace_purchases_pkey PRIMARY KEY (id),
  CONSTRAINT marketplace_purchases_note_id_fkey FOREIGN KEY (note_id) REFERENCES public.marketplace_notes(id),
  CONSTRAINT marketplace_purchases_buyer_user_id_fkey FOREIGN KEY (buyer_user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.marketplace_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  note_id uuid NOT NULL,
  reviewer_user_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT marketplace_reviews_pkey PRIMARY KEY (id),
  CONSTRAINT marketplace_reviews_note_id_fkey FOREIGN KEY (note_id) REFERENCES public.marketplace_notes(id),
  CONSTRAINT marketplace_reviews_reviewer_user_id_fkey FOREIGN KEY (reviewer_user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.notex_activity_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_profile_id uuid NOT NULL,
  activity_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT notex_activity_logs_pkey PRIMARY KEY (id),
  CONSTRAINT notex_activity_logs_user_profile_id_fkey FOREIGN KEY (user_profile_id) REFERENCES public.user_profiles(id)
);
CREATE TABLE public.notex_streak (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_profile_id uuid NOT NULL UNIQUE,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_activity_date date DEFAULT CURRENT_DATE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT notex_streak_pkey PRIMARY KEY (id),
  CONSTRAINT notex_streak_user_profile_id_fkey FOREIGN KEY (user_profile_id) REFERENCES public.user_profiles(id)
);
CREATE TABLE public.print_job_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL,
  status text NOT NULL,
  note text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT print_job_events_pkey PRIMARY KEY (id),
  CONSTRAINT print_job_events_job_fkey FOREIGN KEY (job_id) REFERENCES public.print_jobs(id)
);
CREATE TABLE public.print_jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  shop_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'submitted'::text,
  otp text,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  estimated_pages integer,
  file_size bigint,
  marketplace_note_id uuid,
  pickup_window text,
  contact_name text,
  contact_phone text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  estimated_price numeric,
  CONSTRAINT print_jobs_pkey PRIMARY KEY (id),
  CONSTRAINT print_jobs_user_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT print_jobs_shop_fkey FOREIGN KEY (shop_id) REFERENCES public.print_shops(id)
);
CREATE TABLE public.print_pricing (
  shop_id uuid NOT NULL,
  price jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT print_pricing_pkey PRIMARY KEY (shop_id),
  CONSTRAINT print_pricing_shop_fkey FOREIGN KEY (shop_id) REFERENCES public.print_shops(id)
);
CREATE TABLE public.print_printers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL,
  nickname text,
  capabilities jsonb DEFAULT '{}'::jsonb,
  available boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT print_printers_pkey PRIMARY KEY (id),
  CONSTRAINT print_printers_shop_fkey FOREIGN KEY (shop_id) REFERENCES public.print_shops(id)
);
CREATE TABLE public.print_shops (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL,
  name text NOT NULL,
  phone text,
  email text,
  address text,
  lat double precision,
  lng double precision,
  hours jsonb DEFAULT '{}'::jsonb,
  capabilities jsonb DEFAULT '{}'::jsonb,
  is_open boolean DEFAULT true,
  paused boolean DEFAULT false,
  rating numeric DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  price_hint text,
  pricing jsonb DEFAULT '{}'::jsonb,
  logo_url text,
  CONSTRAINT print_shops_pkey PRIMARY KEY (id),
  CONSTRAINT print_shops_owner_fkey FOREIGN KEY (owner_user_id) REFERENCES auth.users(id)
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
CREATE TABLE public.pyq_papers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  subject_id uuid,
  year integer NOT NULL,
  title text,
  paper_path text NOT NULL,
  paper_url text NOT NULL,
  uploaded_at timestamp with time zone DEFAULT now(),
  CONSTRAINT pyq_papers_pkey PRIMARY KEY (id),
  CONSTRAINT pyq_papers_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.active_subjects(id)
);
CREATE TABLE public.pyq_solutions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  pyq_paper_id uuid,
  solution_path text NOT NULL,
  solution_url text NOT NULL,
  uploaded_at timestamp with time zone DEFAULT now(),
  CONSTRAINT pyq_solutions_pkey PRIMARY KEY (id),
  CONSTRAINT pyq_solutions_pyq_paper_id_fkey FOREIGN KEY (pyq_paper_id) REFERENCES public.pyq_papers(id)
);
CREATE TABLE public.questions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  topic_id uuid,
  year integer NOT NULL,
  marks integer,
  type text,
  question_content text NOT NULL,
  options jsonb,
  answer jsonb,
  has_diagram boolean DEFAULT false,
  diagram_note text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT questions_pkey PRIMARY KEY (id),
  CONSTRAINT questions_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id)
);
CREATE TABLE public.sections (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  subject_code text,
  name text NOT NULL,
  order_no integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT sections_pkey PRIMARY KEY (id),
  CONSTRAINT sections_subject_code_fkey FOREIGN KEY (subject_code) REFERENCES public.active_subjects(code)
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
  CONSTRAINT skill_verifications_pkey PRIMARY KEY (user_id, skill),
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
  type text DEFAULT 'practical'::text,
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
  image_url text,
  video_url text,
  ppt_url text,
  labs text NOT NULL DEFAULT ''::text,
  lab_url text,
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
CREATE TABLE public.teacher_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  auth_user_id uuid NOT NULL,
  email text NOT NULL,
  name text,
  college_id uuid,
  department_id uuid,
  subjects ARRAY DEFAULT '{}'::text[],
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  notes text,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  id_card_front_path text,
  id_card_back_path text,
  CONSTRAINT teacher_applications_pkey PRIMARY KEY (id),
  CONSTRAINT teacher_applications_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id),
  CONSTRAINT teacher_applications_college_id_fkey FOREIGN KEY (college_id) REFERENCES public.colleges(id),
  CONSTRAINT teacher_applications_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id),
  CONSTRAINT teacher_applications_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id)
);
CREATE TABLE public.teacher_classes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  teacher_user_id uuid NOT NULL,
  batch_id uuid,
  semester integer CHECK (semester >= 1 AND semester <= 12),
  subject text NOT NULL,
  section text,
  degree_id uuid,
  department_id uuid,
  college_id uuid,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  subject_id uuid,
  CONSTRAINT teacher_classes_pkey PRIMARY KEY (id),
  CONSTRAINT teacher_classes_teacher_user_id_fkey FOREIGN KEY (teacher_user_id) REFERENCES auth.users(id),
  CONSTRAINT teacher_classes_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.batches(id),
  CONSTRAINT teacher_classes_degree_id_fkey FOREIGN KEY (degree_id) REFERENCES public.degrees(id),
  CONSTRAINT teacher_classes_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id),
  CONSTRAINT teacher_classes_college_id_fkey FOREIGN KEY (college_id) REFERENCES public.colleges(id),
  CONSTRAINT teacher_classes_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.syllabus_courses(id)
);
CREATE TABLE public.teacher_connections (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  teacher_a uuid NOT NULL,
  teacher_b uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT teacher_connections_pkey PRIMARY KEY (id),
  CONSTRAINT teacher_connections_teacher_a_fkey FOREIGN KEY (teacher_a) REFERENCES auth.users(id),
  CONSTRAINT teacher_connections_teacher_b_fkey FOREIGN KEY (teacher_b) REFERENCES auth.users(id)
);
CREATE TABLE public.teacher_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  connection_id uuid NOT NULL,
  sender_user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT teacher_messages_pkey PRIMARY KEY (id),
  CONSTRAINT teacher_messages_connection_id_fkey FOREIGN KEY (connection_id) REFERENCES public.teacher_connections(id),
  CONSTRAINT teacher_messages_sender_user_id_fkey FOREIGN KEY (sender_user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.teacher_profiles (
  auth_user_id uuid NOT NULL,
  headline text,
  bio text,
  years_experience integer CHECK (years_experience >= 0 AND years_experience <= 80),
  qualification text,
  availability jsonb DEFAULT '{}'::jsonb,
  social jsonb DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  name text,
  email text,
  college_id uuid,
  department_id uuid,
  specialization ARRAY,
  profile_image_url text,
  CONSTRAINT teacher_profiles_pkey PRIMARY KEY (auth_user_id),
  CONSTRAINT teacher_profiles_college_id_fkey FOREIGN KEY (college_id) REFERENCES public.colleges(id),
  CONSTRAINT teacher_profiles_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id),
  CONSTRAINT teacher_profiles_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.test_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  test_id uuid NOT NULL,
  student_user_id uuid NOT NULL,
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  score integer NOT NULL DEFAULT 0,
  elapsed_seconds integer,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  submitted_at timestamp with time zone,
  CONSTRAINT test_attempts_pkey PRIMARY KEY (id),
  CONSTRAINT test_attempts_test_id_fkey FOREIGN KEY (test_id) REFERENCES public.tests(id),
  CONSTRAINT test_attempts_student_user_id_fkey FOREIGN KEY (student_user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.test_questions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  test_id uuid NOT NULL,
  prompt text NOT NULL,
  options ARRAY NOT NULL CHECK (cardinality(options) >= 2 AND cardinality(options) <= 8),
  correct_index integer NOT NULL,
  points integer NOT NULL DEFAULT 1,
  question_order integer NOT NULL DEFAULT 0,
  CONSTRAINT test_questions_pkey PRIMARY KEY (id),
  CONSTRAINT test_questions_test_id_fkey FOREIGN KEY (test_id) REFERENCES public.tests(id)
);
CREATE TABLE public.tests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  teacher_user_id uuid NOT NULL,
  class_id uuid,
  title text NOT NULL,
  description text,
  duration_seconds integer CHECK (duration_seconds >= 0),
  max_score integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  accepting_submissions boolean NOT NULL DEFAULT true,
  CONSTRAINT tests_pkey PRIMARY KEY (id),
  CONSTRAINT tests_teacher_user_id_fkey FOREIGN KEY (teacher_user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.topic_feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  topic_id text NOT NULL,
  is_helpful boolean NOT NULL,
  comment text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT topic_feedback_pkey PRIMARY KEY (id),
  CONSTRAINT topic_feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.topics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  unit_id uuid,
  name text NOT NULL,
  difficulty text CHECK (difficulty IS NULL OR (difficulty = ANY (ARRAY['Easy'::text, 'Medium'::text, 'Hard'::text]))),
  order_no integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT topics_pkey PRIMARY KEY (id),
  CONSTRAINT topics_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.units(id)
);
CREATE TABLE public.units (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  section_id uuid,
  name text NOT NULL,
  hours integer,
  order_no integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT units_pkey PRIMARY KEY (id),
  CONSTRAINT units_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.sections(id)
);
CREATE TABLE public.user_activity_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_profile_id uuid NOT NULL,
  activity_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_activity_logs_pkey PRIMARY KEY (id),
  CONSTRAINT user_activity_logs_user_profile_id_fkey FOREIGN KEY (user_profile_id) REFERENCES public.user_profiles(id)
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
  section text,
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
CREATE TABLE public.user_gate (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_profile_id uuid NOT NULL UNIQUE,
  target_year integer,
  target_subject_ids ARRAY DEFAULT '{}'::uuid[],
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_gate_pkey PRIMARY KEY (id),
  CONSTRAINT user_gate_user_profile_id_fkey FOREIGN KEY (user_profile_id) REFERENCES public.user_profiles(id)
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
  college_id uuid,
  department_id uuid,
  batch_id uuid,
  CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT user_profiles_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id),
  CONSTRAINT user_profiles_college_id_fkey FOREIGN KEY (college_id) REFERENCES public.colleges(id),
  CONSTRAINT user_profiles_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id),
  CONSTRAINT user_profiles_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.batches(id)
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
CREATE TABLE public.user_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  last_seen_at timestamp with time zone NOT NULL DEFAULT now(),
  user_agent text,
  ip text,
  CONSTRAINT user_sessions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_streaks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_profile_id uuid NOT NULL UNIQUE,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_activity_date date DEFAULT CURRENT_DATE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_streaks_pkey PRIMARY KEY (id),
  CONSTRAINT user_streaks_user_profile_id_fkey FOREIGN KEY (user_profile_id) REFERENCES public.user_profiles(id)
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
CREATE TABLE public.youtube_ai_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  video_id text,
  video_url text NOT NULL,
  notes_markdown text NOT NULL,
  model text,
  truncated boolean,
  transcript_chars integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT youtube_ai_notes_pkey PRIMARY KEY (id)
);