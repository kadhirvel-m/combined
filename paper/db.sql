-- Enable UUID generator (safe if already enabled)
create extension if not exists pgcrypto;

-- Colleges
create table if not exists public.colleges (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

-- Departments (per college)
create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  college_id uuid not null references public.colleges(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  constraint uniq_department_per_college unique (college_id, name)
);

-- Batches (per department, scoped to college and department)
create table if not exists public.batches (
  id uuid primary key default gen_random_uuid(),
  college_id uuid not null references public.colleges(id) on delete cascade,
  department_id uuid not null references public.departments(id) on delete cascade,
  from_year int not null check (from_year between 1950 and 2100),
  to_year int not null check (to_year between 1950 and 2100 and to_year >= from_year),
  created_at timestamptz not null default now(),
  constraint uniq_batch_per_dept unique (college_id, department_id, from_year, to_year)
);

-- Helpful indexes
create index if not exists idx_departments_college_id on public.departments (college_id);
create index if not exists idx_batches_college_id on public.batches (college_id);
create index if not exists idx_batches_department_id on public.batches (department_id);

-- Course header (one row per batch/semester/course)
create table if not exists public.syllabus_courses (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.batches(id) on delete cascade,
  semester int not null check (semester between 1 and 12),
  course_code text not null,
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (batch_id, semester, course_code)
);

-- Units inside a course
create table if not exists public.syllabus_units (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.syllabus_courses(id) on delete cascade,
  unit_title text not null,
  order_in_course int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, unit_title)
);

-- Topics inside a unit
create table if not exists public.syllabus_topics (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.syllabus_units(id) on delete cascade,
  topic text not null,
  order_in_unit int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
  -- (no unique; we'll dedupe in the API)
);

-- User profiles for signup ---------------------------------------------
create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  name text,
  gender text check (gender in ('female','male','other')),
  phone text,
  college_id uuid references public.colleges(id) on delete set null,
  department_id uuid references public.departments(id) on delete set null,
  batch_id uuid references public.batches(id) on delete set null,
  batch_from int check (batch_from between 1950 and 2100),
  batch_to int check (batch_to between 1950 and 2100 and batch_to >= batch_from),
  semester int check (semester between 1 and 12),
  regno text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (auth_user_id),
  unique (email),
  constraint uniq_regno_per_dept unique (department_id, regno)
);

create index if not exists idx_user_profiles_auth_user_id on public.user_profiles (auth_user_id);
create index if not exists idx_user_profiles_college_id on public.user_profiles (college_id);
create index if not exists idx_user_profiles_department_id on public.user_profiles (department_id);
create index if not exists idx_user_profiles_batch_id on public.user_profiles (batch_id);

-- Per-user topic completion tracking ---------------------------------------
create table if not exists public.user_topic_progress (
  id uuid primary key default gen_random_uuid(),
  user_profile_id uuid not null references public.user_profiles(id) on delete cascade,
  topic_id uuid not null references public.syllabus_topics(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (user_profile_id, topic_id)
);

create index if not exists idx_user_topic_progress_profile on public.user_topic_progress (user_profile_id);
create index if not exists idx_user_topic_progress_topic on public.user_topic_progress (topic_id);

-- Extended profile fields ---------------------------------------------------
alter table if exists public.user_profiles
  add column if not exists profile_image_url text,
  add column if not exists resume_url text,
  add column if not exists bio text,
  add column if not exists headline text,
  add column if not exists location text,
  add column if not exists dob date,
  add column if not exists linkedin text,
  add column if not exists github text,
  add column if not exists leetcode text,
  add column if not exists portfolio_url text,
  add column if not exists website text,
  add column if not exists twitter text,
  add column if not exists instagram text,
  add column if not exists medium text,
  add column if not exists verification_score int,
  add column if not exists technologies text,
  add column if not exists skills text,
  add column if not exists certifications text,
  add column if not exists languages text,
  add column if not exists interests text,
  add column if not exists project_info text,
  add column if not exists publications text,
  add column if not exists achievements text,
  add column if not exists experience text,
  add column if not exists specializations jsonb,
  add column if not exists projects jsonb;
