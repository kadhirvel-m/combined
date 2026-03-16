-- PYQ storage schema
-- Run this in Supabase SQL editor or your Postgres migration pipeline.

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create table if not exists public.pyq_uploads (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    subject text not null,
    exam_year int not null check (exam_year between 1950 and 2100),
    semester text,
    exam_type text,

    college_id uuid references public.colleges(id) on delete set null,
    college_name text,
    degree_id uuid references public.degrees(id) on delete set null,
    degree_name text,
    department_id uuid references public.departments(id) on delete set null,
    department_name text,

    file_name text,
    file_url text,
    file_path text,
    file_bucket text,
    file_size_bytes bigint,
    content_type text,

    notes text,
    uploaded_by text,
    status text not null default 'active',

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_pyq_uploads_college_id on public.pyq_uploads(college_id);
create index if not exists idx_pyq_uploads_degree_id on public.pyq_uploads(degree_id);
create index if not exists idx_pyq_uploads_department_id on public.pyq_uploads(department_id);
create index if not exists idx_pyq_uploads_exam_year on public.pyq_uploads(exam_year);
create index if not exists idx_pyq_uploads_status on public.pyq_uploads(status);
create index if not exists idx_pyq_uploads_created_at on public.pyq_uploads(created_at desc);

create index if not exists idx_pyq_uploads_title_trgm on public.pyq_uploads using gin (title gin_trgm_ops);
create index if not exists idx_pyq_uploads_subject_trgm on public.pyq_uploads using gin (subject gin_trgm_ops);

create or replace function public.set_pyq_uploads_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_pyq_uploads_updated_at on public.pyq_uploads;
create trigger trg_pyq_uploads_updated_at
before update on public.pyq_uploads
for each row
execute function public.set_pyq_uploads_updated_at();
