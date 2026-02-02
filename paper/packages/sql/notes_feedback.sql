-- Notes feedback (Notes Generator)
-- Run this in Supabase SQL editor or via migration pipeline.

create table if not exists public.notes_feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  status text not null default 'new' check (status in ('new','reviewing','resolved','ignored')),

  user_id uuid not null references auth.users(id) on delete cascade,
  user_email text,

  note_id uuid,
  note_variant text,
  note_title text,
  topic text,

  page_path text,
  page_url text,

  category text,
  quick_tags text[] not null default '{}'::text[],
  rating int,

  message text,
  selected_text text,

  ip text,
  user_agent text,
  meta jsonb not null default '{}'::jsonb,

  admin_notes text,
  resolved_at timestamptz
);

create index if not exists notes_feedback_created_at_idx on public.notes_feedback (created_at desc);
create index if not exists notes_feedback_status_idx on public.notes_feedback (status);
create index if not exists notes_feedback_user_id_idx on public.notes_feedback (user_id);
create index if not exists notes_feedback_note_id_idx on public.notes_feedback (note_id);

alter table public.notes_feedback enable row level security;

-- Users can insert their own feedback
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'notes_feedback'
      and policyname = 'notes_feedback_insert_own'
  ) then
    create policy notes_feedback_insert_own
    on public.notes_feedback
    for insert
    to authenticated
    with check (auth.uid() = user_id);
  end if;
end $$;

-- Admins can view/update everything (uses admin_roles table)
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'notes_feedback'
      and policyname = 'notes_feedback_admin_read'
  ) then
    create policy notes_feedback_admin_read
    on public.notes_feedback
    for select
    to authenticated
    using (
      exists (
        select 1
        from public.admin_roles r
        where r.auth_user_id = auth.uid() and r.role in ('admin','employee')
      )
    );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'notes_feedback'
      and policyname = 'notes_feedback_admin_update'
  ) then
    create policy notes_feedback_admin_update
    on public.notes_feedback
    for update
    to authenticated
    using (
      exists (
        select 1
        from public.admin_roles r
        where r.auth_user_id = auth.uid() and r.role in ('admin','employee')
      )
    );
  end if;
end $$;
