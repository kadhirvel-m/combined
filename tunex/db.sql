-- Profiles and storage setup for InnovateX (no RLS version)
-- Run this script in the Supabase SQL editor (or any PostgreSQL client connected to the project).

-- 1. Profile table ---------------------------------------------------------
create table if not exists public.profiles (
    user_id uuid primary key references auth.users(id) on delete cascade,
    name text,
    college text,
    batch_start smallint check (batch_start between 1900 and 2100),
    batch_end smallint check (batch_end between 1900 and 2100),
    dob date,
    phone text,
    email text,
    github text,
    linkedin text,
    leetcode text,
    profile_image_url text,
    resume_url text,
    project_info text,
    publications text,
    achievements text,
    experience text,
    specializations text,
    technologies text,
    headline text,
    bio text,
    location text,
    skills text,
    certifications text,
    languages text,
    interests text,
    portfolio_url text,
    website text,
    twitter text,
    instagram text,
    medium text,
    verification_score smallint check (verification_score between 0 and 100),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
    new.updated_at := now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- 2. Storage bucket for profile assets -------------------------------------
insert into storage.buckets (id, name, public)
values ('storage', 'storage', true)
on conflict (id) do nothing;

-- Projects table ------------------------------------------------------------
create table if not exists public.projects (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    title text not null,
    tagline text not null,
    domains text[] default '{}',
    description text not null,
    tech_stack text[] default '{}',
    proj_status text,
    start_date date,
    end_date date,
    milestones text[] default '{}',
    github text,
    demo text,
    video text,
    docs text,
    fund_stage text,
    fund_budget_inr bigint,
    fund_use text,
    team_members text[] default '{}',
    roles_hiring text[] default '{}',
    compensation text,
    hours text,
    role_desc text,
    cover_url text,
    gallery_urls text[] default '{}',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- trigger for updated_at on projects
drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

-- Skill assessments ---------------------------------------------------------
create table if not exists public.skill_tests (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    skill text not null,
    questions jsonb not null,
    status text not null default 'active',
    score numeric,
    result jsonb,
    submitted_at timestamptz,
    created_at timestamptz default now()
);

create table if not exists public.skill_verifications (
    user_id uuid not null references auth.users(id) on delete cascade,
    skill text not null,
    best_score numeric default 0,
    attempts int default 0,
    status text default 'needs_review',
    updated_at timestamptz default now(),
    primary key (user_id, skill)
);

create or replace function public.skill_verifications_set_updated_at()
returns trigger as $$
begin
    new.updated_at := now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists trg_skill_verifications_updated on public.skill_verifications;
create trigger trg_skill_verifications_updated
before update on public.skill_verifications
for each row execute function public.skill_verifications_set_updated_at();

-- Project applications ------------------------------------------------------
-- Tracks users applying to projects ("I'm Interested" requests)
create table if not exists public.project_applications (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null references public.projects(id) on delete cascade,
    applicant_user_id uuid not null references auth.users(id) on delete cascade,
    message text,
    status text not null default 'pending', -- pending | accepted | rejected
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    constraint uniq_app_per_project unique (project_id, applicant_user_id)
);

drop trigger if exists project_applications_set_updated_at on public.project_applications;
create trigger project_applications_set_updated_at
before update on public.project_applications
for each row execute function public.set_updated_at();

-- Collaboration chat messages -------------------------------------------------
create table if not exists public.project_collab_messages (
    id uuid primary key default gen_random_uuid(),
    application_id uuid not null references public.project_applications(id) on delete cascade,
    sender_user_id uuid not null references auth.users(id) on delete cascade,
    content text not null,
    created_at timestamptz default now()
);

-- If you already have custom storage policies, leave them in place.
-- Without RLS enabled, the backend should use a service-role key for uploads/downloads.
