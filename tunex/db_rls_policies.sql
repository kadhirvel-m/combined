-- Enable RLS and add policies for project_applications
-- Apply this in Supabase SQL editor after running db.sql

-- 1) Enable RLS
alter table public.project_applications enable row level security;

-- 2) INSERT: applicants can create their own application rows
create policy if not exists project_applications_insert
on public.project_applications
as permissive
for insert
to authenticated
with check (
  applicant_user_id = auth.uid()
);

-- 3) SELECT: applicant can see their rows; project owner can see apps to their projects
create policy if not exists project_applications_select
on public.project_applications
as permissive
for select
to authenticated
using (
  applicant_user_id = auth.uid()
  or exists (
    select 1 from public.projects p
    where p.id = project_applications.project_id
      and p.user_id = auth.uid()
  )
);

-- 4) UPDATE: only the project owner can update (e.g., Accept/Reject)
create policy if not exists project_applications_update
on public.project_applications
as permissive
for update
to authenticated
using (
  exists (
    select 1 from public.projects p
    where p.id = project_applications.project_id
      and p.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.projects p
    where p.id = project_applications.project_id
      and p.user_id = auth.uid()
  )
);

-- (Optional) If you want to prevent owners from editing message/created_at etc.,
-- add a trigger or restrict columns via separate policies.

-- 5) (Optional) DELETE: only project owner can delete rows
create policy if not exists project_applications_delete
on public.project_applications
as permissive
for delete
to authenticated
using (
  exists (
    select 1 from public.projects p
    where p.id = project_applications.project_id
      and p.user_id = auth.uid()
  )
);

-- Enable RLS for collaboration messages
alter table public.project_collab_messages enable row level security;

-- Policy: members (applicant or project owner) can select messages of accepted applications
create policy if not exists collab_messages_select on public.project_collab_messages
as permissive for select to authenticated
using (
  exists (
    select 1 from public.project_applications a
    join public.projects p on p.id = a.project_id
    where a.id = project_collab_messages.application_id
      and a.status = 'accepted'
      and (a.applicant_user_id = auth.uid() or p.user_id = auth.uid())
  )
);

-- Policy: members can insert messages on accepted applications
create policy if not exists collab_messages_insert on public.project_collab_messages
as permissive for insert to authenticated
with check (
  exists (
    select 1 from public.project_applications a
    join public.projects p on p.id = a.project_id
    where a.id = project_collab_messages.application_id
      and a.status = 'accepted'
      and (a.applicant_user_id = auth.uid() or p.user_id = auth.uid())
  )
);
