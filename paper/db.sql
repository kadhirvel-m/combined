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
  role text NOT NULL DEFAULT 'student'::text CHECK (role = ANY (ARRAY['student'::text, 'teacher'::text, 'hod'::text, 'employee'::text, 'moderator'::text, 'admin'::text])),
  permissions jsonb DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT admin_roles_pkey PRIMARY KEY (auth_user_id),
  CONSTRAINT admin_roles_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.ai_chat_conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'New Chat'::text,
  share_code text UNIQUE,
  is_public boolean DEFAULT false,
  is_anonymous boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT ai_chat_conversations_pkey PRIMARY KEY (id),
  CONSTRAINT ai_chat_conversations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.ai_chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['user'::text, 'assistant'::text, 'system'::text])),
  content text NOT NULL,
  attachments jsonb DEFAULT '[]'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  is_bookmarked boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT ai_chat_messages_pkey PRIMARY KEY (id),
  CONSTRAINT ai_chat_messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.ai_chat_conversations(id)
);
CREATE TABLE public.ai_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_ci text DEFAULT lower(title),
  markdown text NOT NULL,
  verified_by_teacher_id uuid,
  verified_by_name text,
  verified_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  image_urls ARRAY DEFAULT '{}'::text[],
  labs text,
  blink_link text CHECK (blink_link ~* '^https?://'::text),
  ppt_link text CHECK (ppt_link ~* '^https?://'::text),
  decision_tree_json jsonb,
  decision_tree_generated_at timestamp with time zone,
  CONSTRAINT ai_notes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.ai_notes_caseflow_scenarios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  topic_ci text DEFAULT lower(topic),
  note_id uuid,
  variant text NOT NULL DEFAULT 'detailed'::text,
  scenario_question text NOT NULL,
  model text,
  generated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT ai_notes_caseflow_scenarios_pkey PRIMARY KEY (id)
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
CREATE TABLE public.ai_notes_match (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  topic_ci text DEFAULT lower(topic),
  pairs jsonb NOT NULL DEFAULT '[]'::jsonb,
  model text,
  generated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT ai_notes_match_pkey PRIMARY KEY (id)
);
CREATE TABLE public.ai_notes_mcq (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  note_id uuid NOT NULL,
  topic text NOT NULL,
  topic_ci text DEFAULT lower(topic),
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  model text,
  generated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT ai_notes_mcq_pkey PRIMARY KEY (id)
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
CREATE TABLE public.ai_selected_images (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  topic_ci text NOT NULL,
  image_url text NOT NULL CHECK (image_url ~* '^https?://'::text),
  selected_text text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT ai_selected_images_pkey PRIMARY KEY (id)
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
CREATE TABLE public.assignment_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  assignment_id uuid,
  submission_id uuid,
  user_id uuid NOT NULL,
  content text NOT NULL,
  is_private boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT assignment_comments_pkey PRIMARY KEY (id),
  CONSTRAINT assignment_comments_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.assignments(id),
  CONSTRAINT assignment_comments_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES public.assignment_submissions(id)
);
CREATE TABLE public.assignment_extensions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  assignment_id uuid,
  student_user_id uuid NOT NULL,
  requested_date timestamp with time zone,
  reason text,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'denied'::text])),
  approved_by uuid,
  new_due_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT assignment_extensions_pkey PRIMARY KEY (id),
  CONSTRAINT assignment_extensions_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.assignments(id)
);
CREATE TABLE public.assignment_rubrics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  assignment_id uuid,
  criterion text NOT NULL,
  max_points integer NOT NULL,
  description text,
  order_index integer DEFAULT 0,
  CONSTRAINT assignment_rubrics_pkey PRIMARY KEY (id),
  CONSTRAINT assignment_rubrics_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.assignments(id)
);
CREATE TABLE public.assignment_submission_files (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  submission_id uuid,
  assignment_id uuid,
  student_user_id uuid NOT NULL,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_size_bytes bigint,
  file_type text,
  file_hash text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT assignment_submission_files_pkey PRIMARY KEY (id),
  CONSTRAINT assignment_submission_files_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES public.assignment_submissions(id),
  CONSTRAINT assignment_submission_files_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.assignments(id)
);
CREATE TABLE public.assignment_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL,
  student_user_id uuid NOT NULL,
  team_id uuid,
  file_urls jsonb DEFAULT '[]'::jsonb,
  text_content text,
  is_draft boolean DEFAULT false,
  version integer DEFAULT 1,
  total_marks integer,
  rubric_scores jsonb DEFAULT '{}'::jsonb,
  feedback text,
  graded_by uuid,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'submitted'::text, 'graded'::text, 'returned'::text])),
  submitted_at timestamp with time zone,
  graded_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT assignment_submissions_pkey PRIMARY KEY (id),
  CONSTRAINT assignment_submissions_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.assignments(id),
  CONSTRAINT assignment_submissions_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.assignment_teams(id)
);
CREATE TABLE public.assignment_team_members (
  team_id uuid NOT NULL,
  student_user_id uuid NOT NULL,
  joined_at timestamp with time zone DEFAULT now(),
  CONSTRAINT assignment_team_members_pkey PRIMARY KEY (team_id, student_user_id),
  CONSTRAINT assignment_team_members_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.assignment_teams(id)
);
CREATE TABLE public.assignment_teams (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  assignment_id uuid,
  team_name text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT assignment_teams_pkey PRIMARY KEY (id),
  CONSTRAINT assignment_teams_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.assignments(id)
);
CREATE TABLE public.assignment_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  teacher_user_id uuid NOT NULL,
  title text NOT NULL,
  template_data jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT assignment_templates_pkey PRIMARY KEY (id)
);
CREATE TABLE public.assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  teacher_user_id uuid NOT NULL,
  class_id uuid,
  title text NOT NULL,
  description text,
  instructions_md text,
  resource_links jsonb DEFAULT '[]'::jsonb,
  assignment_type text DEFAULT 'individual'::text CHECK (assignment_type = ANY (ARRAY['individual'::text, 'group'::text, 'peer_review'::text])),
  max_team_size integer DEFAULT 1,
  max_marks integer DEFAULT 100,
  allowed_file_types jsonb DEFAULT '["pdf", "jpg", "jpeg", "png", "doc", "docx", "ppt", "pptx"]'::jsonb,
  max_files integer DEFAULT 5,
  max_file_size_mb integer DEFAULT 10,
  due_date timestamp with time zone NOT NULL,
  allow_late_submission boolean DEFAULT false,
  late_penalty_percent integer DEFAULT 0,
  grace_period_hours integer DEFAULT 0,
  status text DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'published'::text, 'closed'::text, 'archived'::text])),
  published_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT assignments_pkey PRIMARY KEY (id)
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
  stream text DEFAULT 'Engineering'::text,
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
CREATE TABLE public.feedback_answers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  response_id uuid NOT NULL,
  question_id uuid NOT NULL,
  answer_text text,
  answer_options jsonb,
  answer_rating integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT feedback_answers_pkey PRIMARY KEY (id),
  CONSTRAINT feedback_answers_response_id_fkey FOREIGN KEY (response_id) REFERENCES public.feedback_responses(id),
  CONSTRAINT feedback_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.feedback_questions(id)
);
CREATE TABLE public.feedback_forms (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL,
  class_id uuid,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'published'::text, 'closed'::text])),
  is_anonymous_display boolean NOT NULL DEFAULT true,
  share_code text UNIQUE,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT feedback_forms_pkey PRIMARY KEY (id),
  CONSTRAINT feedback_forms_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teacher_profiles(auth_user_id),
  CONSTRAINT feedback_forms_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.teacher_classes(id)
);
CREATE TABLE public.feedback_questions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL,
  question_type text NOT NULL CHECK (question_type = ANY (ARRAY['text'::text, 'textarea'::text, 'rating'::text, 'mcq_single'::text, 'mcq_multiple'::text, 'scale'::text, 'yes_no'::text, 'dropdown'::text])),
  question_text text NOT NULL,
  description text,
  options jsonb,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT feedback_questions_pkey PRIMARY KEY (id),
  CONSTRAINT feedback_questions_form_id_fkey FOREIGN KEY (form_id) REFERENCES public.feedback_forms(id)
);
CREATE TABLE public.feedback_responses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL,
  student_id uuid,
  student_name text,
  student_email text,
  submitted_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT feedback_responses_pkey PRIMARY KEY (id),
  CONSTRAINT feedback_responses_form_id_fkey FOREIGN KEY (form_id) REFERENCES public.feedback_forms(id),
  CONSTRAINT feedback_responses_student_id_fkey FOREIGN KEY (student_id) REFERENCES auth.users(id)
);
CREATE TABLE public.group_call_bans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  call_id text NOT NULL,
  user_id uuid NOT NULL,
  banned_by uuid,
  reason text,
  banned_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT group_call_bans_pkey PRIMARY KEY (id),
  CONSTRAINT group_call_bans_call_id_fkey FOREIGN KEY (call_id) REFERENCES public.group_calls(id),
  CONSTRAINT group_call_bans_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT group_call_bans_banned_by_fkey FOREIGN KEY (banned_by) REFERENCES auth.users(id)
);
CREATE TABLE public.group_call_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  call_id text NOT NULL,
  actor_user_id uuid,
  event_type text NOT NULL,
  event_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT group_call_events_pkey PRIMARY KEY (id),
  CONSTRAINT group_call_events_call_id_fkey FOREIGN KEY (call_id) REFERENCES public.group_calls(id),
  CONSTRAINT group_call_events_actor_user_id_fkey FOREIGN KEY (actor_user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.group_call_participants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  call_id text NOT NULL,
  user_id uuid NOT NULL,
  joined_at timestamp with time zone DEFAULT now(),
  left_at timestamp with time zone,
  CONSTRAINT group_call_participants_pkey PRIMARY KEY (id),
  CONSTRAINT group_call_participants_call_fkey FOREIGN KEY (call_id) REFERENCES public.group_calls(id),
  CONSTRAINT group_call_participants_user_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.group_call_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  call_id text NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role = 'cohost'::text),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT group_call_roles_pkey PRIMARY KEY (id),
  CONSTRAINT group_call_roles_call_id_fkey FOREIGN KEY (call_id) REFERENCES public.group_calls(id),
  CONSTRAINT group_call_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.group_call_settings (
  call_id text NOT NULL,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT group_call_settings_pkey PRIMARY KEY (call_id),
  CONSTRAINT group_call_settings_call_id_fkey FOREIGN KEY (call_id) REFERENCES public.group_calls(id)
);
CREATE TABLE public.group_calls (
  id text NOT NULL,
  room_name text NOT NULL,
  host_user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'ended'::text])),
  created_at timestamp with time zone DEFAULT now(),
  ended_at timestamp with time zone,
  CONSTRAINT group_calls_pkey PRIMARY KEY (id),
  CONSTRAINT group_calls_host_fkey FOREIGN KEY (host_user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.hod_application_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL,
  hod_user_id uuid NOT NULL,
  recommendation text NOT NULL DEFAULT 'review'::text CHECK (recommendation = ANY (ARRAY['approve'::text, 'reject'::text, 'review'::text])),
  note text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT hod_application_reviews_pkey PRIMARY KEY (id),
  CONSTRAINT hod_application_reviews_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.teacher_applications(id),
  CONSTRAINT hod_application_reviews_hod_user_id_fkey FOREIGN KEY (hod_user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.hod_batch_management (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  department_id uuid NOT NULL UNIQUE,
  first_year_batch_id uuid,
  second_year_batch_id uuid,
  third_year_batch_id uuid,
  final_year_batch_id uuid,
  updated_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  first_year_sem smallint,
  second_year_sem smallint,
  third_year_sem smallint,
  final_year_sem smallint,
  CONSTRAINT hod_batch_management_pkey PRIMARY KEY (id),
  CONSTRAINT hod_batch_management_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id),
  CONSTRAINT hod_batch_management_first_year_batch_id_fkey FOREIGN KEY (first_year_batch_id) REFERENCES public.batches(id),
  CONSTRAINT hod_batch_management_second_year_batch_id_fkey FOREIGN KEY (second_year_batch_id) REFERENCES public.batches(id),
  CONSTRAINT hod_batch_management_third_year_batch_id_fkey FOREIGN KEY (third_year_batch_id) REFERENCES public.batches(id),
  CONSTRAINT hod_batch_management_final_year_batch_id_fkey FOREIGN KEY (final_year_batch_id) REFERENCES public.batches(id),
  CONSTRAINT hod_batch_management_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id)
);
CREATE TABLE public.hod_departments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  hod_user_id uuid NOT NULL,
  department_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT hod_departments_pkey PRIMARY KEY (id),
  CONSTRAINT hod_departments_hod_user_id_fkey FOREIGN KEY (hod_user_id) REFERENCES auth.users(id),
  CONSTRAINT hod_departments_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id)
);
CREATE TABLE public.hod_role_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  auth_user_id uuid NOT NULL UNIQUE,
  email text NOT NULL,
  name text,
  college_id uuid,
  department_id uuid,
  motivation text,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  notes text,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  id_card_front_path text,
  id_card_back_path text,
  CONSTRAINT hod_role_applications_pkey PRIMARY KEY (id),
  CONSTRAINT hod_role_applications_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id),
  CONSTRAINT hod_role_applications_college_id_fkey FOREIGN KEY (college_id) REFERENCES public.colleges(id),
  CONSTRAINT hod_role_applications_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id),
  CONSTRAINT hod_role_applications_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id)
);
CREATE TABLE public.innovatex_mentor_chats (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['user'::text, 'assistant'::text])),
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT innovatex_mentor_chats_pkey PRIMARY KEY (id),
  CONSTRAINT innovatex_mentor_chats_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.innovatex_projects(id),
  CONSTRAINT innovatex_mentor_chats_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.innovatex_projects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  problem text NOT NULL,
  solution text NOT NULL,
  tech_stack jsonb NOT NULL DEFAULT '[]'::jsonb,
  difficulty integer NOT NULL DEFAULT 3 CHECK (difficulty >= 1 AND difficulty <= 5),
  innovation_score integer NOT NULL DEFAULT 3 CHECK (innovation_score >= 1 AND innovation_score <= 5),
  category text,
  use_case text,
  timeline_weeks integer,
  milestones jsonb DEFAULT '[]'::jsonb,
  learning_outcomes jsonb DEFAULT '[]'::jsonb,
  team_size integer DEFAULT 1,
  status text NOT NULL DEFAULT 'claimed'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT innovatex_projects_pkey PRIMARY KEY (id),
  CONSTRAINT innovatex_projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.innovatex_refinement_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  user_id uuid NOT NULL,
  current_phase text NOT NULL DEFAULT 'feasibility'::text CHECK (current_phase = ANY (ARRAY['stack_selection'::text, 'features'::text, 'feasibility'::text, 'customization'::text, 'architecture'::text, 'blueprint'::text, 'chatbot'::text, 'complete'::text])),
  phase_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  refined_project jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  chosen_frontend text,
  chosen_backend text,
  selected_features jsonb DEFAULT '[]'::jsonb,
  CONSTRAINT innovatex_refinement_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT innovatex_refinement_sessions_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.innovatex_projects(id),
  CONSTRAINT innovatex_refinement_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.labx_explanations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  topic_ci text NOT NULL UNIQUE,
  html_content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  generation_time_ms integer,
  view_count integer DEFAULT 0,
  CONSTRAINT labx_explanations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.lcoding_languages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  logo_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lcoding_languages_pkey PRIMARY KEY (id)
);
CREATE TABLE public.lcoding_levels (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  language_id uuid NOT NULL,
  title text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lcoding_levels_pkey PRIMARY KEY (id),
  CONSTRAINT lcoding_levels_language_id_fkey FOREIGN KEY (language_id) REFERENCES public.lcoding_languages(id)
);
CREATE TABLE public.lcoding_problems (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty = ANY (ARRAY['Easy'::text, 'Medium'::text, 'Hard'::text])),
  tags ARRAY DEFAULT '{}'::text[],
  boilerplate_code text NOT NULL,
  function_name text NOT NULL,
  companies ARRAY DEFAULT '{}'::text[],
  likes integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  examples jsonb DEFAULT '[]'::jsonb,
  constraints ARRAY DEFAULT '{}'::text[],
  hints ARRAY DEFAULT '{}'::text[],
  follow_up text,
  topics ARRAY DEFAULT '{}'::text[],
  CONSTRAINT lcoding_problems_pkey PRIMARY KEY (id)
);
CREATE TABLE public.lcoding_sections (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  level_id uuid,
  CONSTRAINT lcoding_sections_pkey PRIMARY KEY (id),
  CONSTRAINT lcoding_sections_level_id_fkey FOREIGN KEY (level_id) REFERENCES public.lcoding_levels(id)
);
CREATE TABLE public.lcoding_test_cases (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  problem_id uuid NOT NULL,
  input_json jsonb NOT NULL,
  expected_output_json jsonb NOT NULL,
  is_hidden boolean DEFAULT false,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lcoding_test_cases_pkey PRIMARY KEY (id),
  CONSTRAINT lcoding_test_cases_problem_id_fkey FOREIGN KEY (problem_id) REFERENCES public.lcoding_problems(id)
);
CREATE TABLE public.lcoding_topic_chapters (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL,
  chapter_number integer NOT NULL,
  chapter_type text NOT NULL CHECK (chapter_type = ANY (ARRAY['concept'::text, 'syntax'::text, 'range'::text, 'sequences'::text, 'nested'::text, 'keywords'::text, 'mistakes'::text, 'walkthrough'::text, 'interview'::text, 'quiz'::text, 'dynamic'::text])),
  title text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lcoding_topic_chapters_pkey PRIMARY KEY (id),
  CONSTRAINT lcoding_topic_chapters_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.lcoding_topics(id)
);
CREATE TABLE public.lcoding_topics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL,
  title text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lcoding_topics_pkey PRIMARY KEY (id),
  CONSTRAINT lcoding_topics_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.lcoding_sections(id)
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
CREATE TABLE public.manual_access_overrides (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  auth_user_id uuid NOT NULL UNIQUE,
  grant_premium boolean NOT NULL DEFAULT false,
  force_plan_id uuid,
  force_plan_until timestamp with time zone,
  reset_usage_on_next_check boolean NOT NULL DEFAULT false,
  is_blocked boolean NOT NULL DEFAULT false,
  refund_marked boolean NOT NULL DEFAULT false,
  campus_ambassador boolean NOT NULL DEFAULT false,
  department_id_override uuid,
  notes text,
  updated_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT manual_access_overrides_pkey PRIMARY KEY (id),
  CONSTRAINT manual_access_overrides_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id),
  CONSTRAINT manual_access_overrides_force_plan_id_fkey FOREIGN KEY (force_plan_id) REFERENCES public.subscription_plans(id),
  CONSTRAINT manual_access_overrides_department_id_override_fkey FOREIGN KEY (department_id_override) REFERENCES public.departments(id),
  CONSTRAINT manual_access_overrides_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id)
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
CREATE TABLE public.math_td_question_history (
  id text NOT NULL,
  session_id text NOT NULL,
  question_text text NOT NULL,
  options_json text NOT NULL,
  correct_answer integer NOT NULL,
  selected_answer integer,
  is_correct integer,
  reward_elixir real NOT NULL DEFAULT 0,
  difficulty integer NOT NULL,
  created_at text NOT NULL,
  answered_at text,
  CONSTRAINT math_td_question_history_pkey PRIMARY KEY (id),
  CONSTRAINT math_td_question_history_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.math_td_sessions(id)
);
CREATE TABLE public.math_td_sessions (
  id text NOT NULL,
  mode text NOT NULL DEFAULT 'solo'::text,
  status text NOT NULL DEFAULT 'active'::text,
  player_name text NOT NULL DEFAULT 'Player'::text,
  enemy_name text NOT NULL DEFAULT 'Enemy AI'::text,
  player_castle_hp integer NOT NULL,
  enemy_castle_hp integer NOT NULL,
  elixir real NOT NULL,
  ai_elixir real NOT NULL,
  game_time real NOT NULL,
  state_json text NOT NULL,
  active_question_id text,
  active_question_answer integer,
  created_at text NOT NULL,
  updated_at text NOT NULL,
  ended_at text,
  CONSTRAINT math_td_sessions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.medix_rag_chunks (
  id bigint NOT NULL DEFAULT nextval('medix_rag_chunks_id_seq'::regclass),
  source_id uuid NOT NULL,
  chunk_index integer NOT NULL,
  section_title text,
  section_index integer,
  window_start_char integer,
  window_end_char integer,
  chunk_text text NOT NULL,
  token_count integer,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  embedding USER-DEFINED NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT medix_rag_chunks_pkey PRIMARY KEY (id),
  CONSTRAINT medix_rag_chunks_source_id_fkey FOREIGN KEY (source_id) REFERENCES public.medix_rag_sources(id)
);
CREATE TABLE public.medix_rag_messages (
  id bigint NOT NULL DEFAULT nextval('medix_rag_messages_id_seq'::regclass),
  session_id uuid NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['user'::text, 'assistant'::text, 'system'::text])),
  content text NOT NULL,
  citations jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT medix_rag_messages_pkey PRIMARY KEY (id),
  CONSTRAINT medix_rag_messages_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.medix_rag_sessions(id)
);
CREATE TABLE public.medix_rag_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id text,
  title text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT medix_rag_sessions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.medix_rag_sources (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  source_name text NOT NULL,
  file_name text,
  file_hash text UNIQUE,
  uploaded_by text,
  chunk_count integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT medix_rag_sources_pkey PRIMARY KEY (id)
);
CREATE TABLE public.notes_feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'new'::text CHECK (status = ANY (ARRAY['new'::text, 'reviewing'::text, 'resolved'::text, 'ignored'::text])),
  user_id uuid NOT NULL,
  user_email text,
  note_id uuid,
  note_variant text,
  note_title text,
  topic text,
  page_path text,
  page_url text,
  category text,
  quick_tags ARRAY NOT NULL DEFAULT '{}'::text[],
  rating integer,
  message text,
  selected_text text,
  ip text,
  user_agent text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  admin_notes text,
  resolved_at timestamp with time zone,
  CONSTRAINT notes_feedback_pkey PRIMARY KEY (id),
  CONSTRAINT notes_feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
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
CREATE TABLE public.subscription_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  plan_code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  price_inr numeric NOT NULL DEFAULT 0,
  duration_days integer NOT NULL DEFAULT 30,
  active_status boolean NOT NULL DEFAULT true,
  unlimited_topics boolean NOT NULL DEFAULT false,
  max_topics_per_day integer,
  max_subjects_per_day integer,
  mcq_access boolean NOT NULL DEFAULT true,
  blink_access boolean NOT NULL DEFAULT true,
  ai_chat_access boolean NOT NULL DEFAULT true,
  pdf_download boolean NOT NULL DEFAULT true,
  print_discount_percent numeric NOT NULL DEFAULT 0,
  leaderboard_access boolean NOT NULL DEFAULT true,
  applicable_college uuid,
  applicable_degree uuid,
  applicable_department uuid,
  applicable_batch uuid,
  applicable_semester integer,
  early_bird_tag boolean NOT NULL DEFAULT false,
  availability_expires_at timestamp with time zone,
  coupon_enabled boolean NOT NULL DEFAULT false,
  created_by uuid,
  updated_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT subscription_plans_pkey PRIMARY KEY (id),
  CONSTRAINT subscription_plans_applicable_college_fkey FOREIGN KEY (applicable_college) REFERENCES public.colleges(id),
  CONSTRAINT subscription_plans_applicable_degree_fkey FOREIGN KEY (applicable_degree) REFERENCES public.degrees(id),
  CONSTRAINT subscription_plans_applicable_department_fkey FOREIGN KEY (applicable_department) REFERENCES public.departments(id),
  CONSTRAINT subscription_plans_applicable_batch_fkey FOREIGN KEY (applicable_batch) REFERENCES public.batches(id),
  CONSTRAINT subscription_plans_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
  CONSTRAINT subscription_plans_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id)
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
  teacher_user_id uuid,
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
  difficulty text CHECK (difficulty IS NULL OR (difficulty = ANY (ARRAY['Easy'::text, 'Medium'::text, 'Hard'::text]))),
  co text,
  k_level text CHECK (k_level IS NULL OR (k_level = ANY (ARRAY['K1'::text, 'K2'::text, 'K3'::text, 'K4'::text, 'K5'::text, 'K6'::text]))),
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
CREATE TABLE public.topic_ratings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  topic_id uuid NOT NULL,
  teacher_user_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 3),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT topic_ratings_pkey PRIMARY KEY (id),
  CONSTRAINT topic_ratings_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.syllabus_topics(id),
  CONSTRAINT topic_ratings_teacher_user_id_fkey FOREIGN KEY (teacher_user_id) REFERENCES auth.users(id)
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
CREATE TABLE public.usage_daily_counters (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  auth_user_id uuid NOT NULL,
  usage_date date NOT NULL DEFAULT CURRENT_DATE,
  topics_opened integer NOT NULL DEFAULT 0,
  subjects_opened integer NOT NULL DEFAULT 0,
  mcq_attempts integer NOT NULL DEFAULT 0,
  blink_views integer NOT NULL DEFAULT 0,
  searches integer NOT NULL DEFAULT 0,
  ai_prompts integer NOT NULL DEFAULT 0,
  session_seconds integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT usage_daily_counters_pkey PRIMARY KEY (id),
  CONSTRAINT usage_daily_counters_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.usage_limit_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  rule_name text NOT NULL,
  scope_type text NOT NULL DEFAULT 'global'::text CHECK (scope_type = ANY (ARRAY['global'::text, 'college'::text, 'degree'::text, 'department'::text, 'batch'::text, 'semester'::text])),
  scope_college_id uuid,
  scope_degree_id uuid,
  scope_department_id uuid,
  scope_batch_id uuid,
  scope_semester integer,
  max_topics_per_day integer,
  max_subjects_per_day integer,
  max_mcq_attempts_per_day integer,
  max_blink_views_per_day integer,
  max_searches_per_day integer,
  max_ai_prompts_per_day integer,
  max_session_minutes_per_day integer,
  trial_duration_days integer,
  apply_to_free_users boolean NOT NULL DEFAULT true,
  active_status boolean NOT NULL DEFAULT true,
  created_by uuid,
  updated_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT usage_limit_rules_pkey PRIMARY KEY (id),
  CONSTRAINT usage_limit_rules_scope_college_id_fkey FOREIGN KEY (scope_college_id) REFERENCES public.colleges(id),
  CONSTRAINT usage_limit_rules_scope_degree_id_fkey FOREIGN KEY (scope_degree_id) REFERENCES public.degrees(id),
  CONSTRAINT usage_limit_rules_scope_department_id_fkey FOREIGN KEY (scope_department_id) REFERENCES public.departments(id),
  CONSTRAINT usage_limit_rules_scope_batch_id_fkey FOREIGN KEY (scope_batch_id) REFERENCES public.batches(id),
  CONSTRAINT usage_limit_rules_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
  CONSTRAINT usage_limit_rules_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id)
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
CREATE TABLE public.user_plan_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  auth_user_id uuid NOT NULL,
  plan_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'expired'::text, 'cancelled'::text])),
  start_at timestamp with time zone NOT NULL DEFAULT now(),
  end_at timestamp with time zone NOT NULL,
  source text NOT NULL DEFAULT 'manual'::text,
  notes text,
  granted_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_plan_subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT user_plan_subscriptions_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id),
  CONSTRAINT user_plan_subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id),
  CONSTRAINT user_plan_subscriptions_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES auth.users(id)
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
CREATE TABLE public.user_topic_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_profile_id uuid NOT NULL,
  topic_id uuid NOT NULL,
  topic_name text NOT NULL,
  viewed_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_topic_history_pkey PRIMARY KEY (id),
  CONSTRAINT user_topic_history_user_profile_id_fkey FOREIGN KEY (user_profile_id) REFERENCES public.user_profiles(id),
  CONSTRAINT user_topic_history_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.syllabus_topics(id)
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
CREATE TABLE public.user_topic_wishlist (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_profile_id uuid NOT NULL,
  topic_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_topic_wishlist_pkey PRIMARY KEY (id),
  CONSTRAINT user_topic_wishlist_user_profile_id_fkey FOREIGN KEY (user_profile_id) REFERENCES public.user_profiles(id),
  CONSTRAINT user_topic_wishlist_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.syllabus_topics(id)
);
CREATE TABLE public.xo_games (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  player_x uuid NOT NULL,
  player_o uuid,
  mode text NOT NULL DEFAULT 'ai_easy'::text CHECK (mode = ANY (ARRAY['ai_easy'::text, 'ai_medium'::text, 'ai_hard'::text, 'friend'::text])),
  board jsonb NOT NULL DEFAULT '[[null, null, null], [null, null, null], [null, null, null]]'::jsonb,
  current_turn text NOT NULL DEFAULT 'X'::text CHECK (current_turn = ANY (ARRAY['X'::text, 'O'::text])),
  status text NOT NULL DEFAULT 'in_progress'::text CHECK (status = ANY (ARRAY['in_progress'::text, 'x_wins'::text, 'o_wins'::text, 'draw'::text])),
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
CREATE TABLE public.xo_moves (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL,
  player_id uuid NOT NULL,
  marker text NOT NULL CHECK (marker = ANY (ARRAY['X'::text, 'O'::text])),
  row_idx integer NOT NULL CHECK (row_idx >= 0 AND row_idx <= 2),
  col_idx integer NOT NULL CHECK (col_idx >= 0 AND col_idx <= 2),
  move_number integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT xo_moves_pkey PRIMARY KEY (id),
  CONSTRAINT xo_moves_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.xo_games(id),
  CONSTRAINT xo_moves_player_id_fkey FOREIGN KEY (player_id) REFERENCES auth.users(id)
);
CREATE TABLE public.xo_player_stats (
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

CREATE TABLE IF NOT EXISTS public.auth_refresh_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  token_hash text NOT NULL UNIQUE,
  family_id uuid NOT NULL,
  parent_token_hash text,
  status text NOT NULL DEFAULT 'active'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone,
  used_at timestamp with time zone,
  replaced_by_hash text,
  revoked_at timestamp with time zone,
  revoke_reason text,
  last_ip text,
  user_agent text,
  CONSTRAINT auth_refresh_tokens_pkey PRIMARY KEY (id),
  CONSTRAINT auth_refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT auth_refresh_tokens_status_check CHECK (status = ANY (ARRAY['active'::text, 'rotated'::text, 'revoked'::text]))
);

CREATE INDEX IF NOT EXISTS auth_refresh_tokens_user_idx ON public.auth_refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS auth_refresh_tokens_family_idx ON public.auth_refresh_tokens(family_id);
CREATE INDEX IF NOT EXISTS auth_refresh_tokens_status_idx ON public.auth_refresh_tokens(status);

CREATE TABLE IF NOT EXISTS public.security_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  severity text NOT NULL DEFAULT 'info'::text,
  path text,
  method text,
  client_ip text,
  user_agent text,
  user_id text,
  email text,
  event_ts timestamp with time zone,
  event_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT security_events_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS security_events_created_idx ON public.security_events(created_at);
CREATE INDEX IF NOT EXISTS security_events_type_idx ON public.security_events(event_type);
CREATE INDEX IF NOT EXISTS security_events_severity_idx ON public.security_events(severity);
CREATE INDEX IF NOT EXISTS security_events_user_idx ON public.security_events(user_id);
CREATE INDEX IF NOT EXISTS security_events_email_idx ON public.security_events(email);

CREATE TABLE IF NOT EXISTS public.abuse_ip_overrides (
  ip text NOT NULL,
  is_allowed boolean NOT NULL DEFAULT false,
  reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by text,
  CONSTRAINT abuse_ip_overrides_pkey PRIMARY KEY (ip)
);

CREATE INDEX IF NOT EXISTS abuse_ip_overrides_allowed_idx ON public.abuse_ip_overrides(is_allowed);
CREATE INDEX IF NOT EXISTS abuse_ip_overrides_updated_idx ON public.abuse_ip_overrides(updated_at);

CREATE TABLE IF NOT EXISTS public.security_incidents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  alert_type text NOT NULL,
  severity text NOT NULL DEFAULT 'warning'::text,
  status text NOT NULL DEFAULT 'open'::text,
  path text,
  method text,
  client_ip text,
  event_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  detected_at timestamp with time zone NOT NULL DEFAULT now(),
  acknowledged_at timestamp with time zone,
  resolved_at timestamp with time zone,
  assignee text,
  response_note text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT security_incidents_pkey PRIMARY KEY (id),
  CONSTRAINT security_incidents_status_check CHECK (status = ANY (ARRAY['open'::text, 'acknowledged'::text, 'resolved'::text, 'false_positive'::text]))
);

CREATE INDEX IF NOT EXISTS security_incidents_detected_idx ON public.security_incidents(detected_at);
CREATE INDEX IF NOT EXISTS security_incidents_status_idx ON public.security_incidents(status);
CREATE INDEX IF NOT EXISTS security_incidents_severity_idx ON public.security_incidents(severity);
CREATE INDEX IF NOT EXISTS security_incidents_alert_type_idx ON public.security_incidents(alert_type);

-- College hierarchy RLS hardening: only admin/employee can mutate core academic structure tables.
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.degrees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS colleges_select_all ON public.colleges;
CREATE POLICY colleges_select_all
ON public.colleges
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS colleges_mutate_admin_employee ON public.colleges;
CREATE POLICY colleges_mutate_admin_employee
ON public.colleges
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.admin_roles ar
    WHERE ar.auth_user_id = auth.uid()
      AND lower(coalesce(ar.role, '')) IN ('admin', 'employee')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.admin_roles ar
    WHERE ar.auth_user_id = auth.uid()
      AND lower(coalesce(ar.role, '')) IN ('admin', 'employee')
  )
);

DROP POLICY IF EXISTS degrees_select_all ON public.degrees;
CREATE POLICY degrees_select_all
ON public.degrees
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS degrees_mutate_admin_employee ON public.degrees;
CREATE POLICY degrees_mutate_admin_employee
ON public.degrees
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.admin_roles ar
    WHERE ar.auth_user_id = auth.uid()
      AND lower(coalesce(ar.role, '')) IN ('admin', 'employee')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.admin_roles ar
    WHERE ar.auth_user_id = auth.uid()
      AND lower(coalesce(ar.role, '')) IN ('admin', 'employee')
  )
);

DROP POLICY IF EXISTS departments_select_all ON public.departments;
CREATE POLICY departments_select_all
ON public.departments
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS departments_mutate_admin_employee ON public.departments;
CREATE POLICY departments_mutate_admin_employee
ON public.departments
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.admin_roles ar
    WHERE ar.auth_user_id = auth.uid()
      AND lower(coalesce(ar.role, '')) IN ('admin', 'employee')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.admin_roles ar
    WHERE ar.auth_user_id = auth.uid()
      AND lower(coalesce(ar.role, '')) IN ('admin', 'employee')
  )
);

DROP POLICY IF EXISTS batches_select_all ON public.batches;
CREATE POLICY batches_select_all
ON public.batches
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS batches_mutate_admin_employee ON public.batches;
CREATE POLICY batches_mutate_admin_employee
ON public.batches
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.admin_roles ar
    WHERE ar.auth_user_id = auth.uid()
      AND lower(coalesce(ar.role, '')) IN ('admin', 'employee')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.admin_roles ar
    WHERE ar.auth_user_id = auth.uid()
      AND lower(coalesce(ar.role, '')) IN ('admin', 'employee')
  )
);