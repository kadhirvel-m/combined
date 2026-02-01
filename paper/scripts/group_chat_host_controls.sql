-- Group Chat Host Controls schema additions (Supabase / Postgres)
-- Safe to run multiple times.

-- Settings for each call/room
create table if not exists public.group_call_settings (
  call_id text primary key references public.group_calls(id) on delete cascade,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Optional: keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_group_call_settings_updated_at on public.group_call_settings;
create trigger trg_group_call_settings_updated_at
before update on public.group_call_settings
for each row execute function public.set_updated_at();

-- Room roles (host is already stored on group_calls.host_user_id;
-- this table stores extra moderators such as co-hosts)
create table if not exists public.group_call_roles (
  id uuid primary key default gen_random_uuid(),
  call_id text not null references public.group_calls(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('cohost')),
  created_at timestamptz not null default now(),
  unique (call_id, user_id)
);

-- Bans (prevent re-join)
create table if not exists public.group_call_bans (
  id uuid primary key default gen_random_uuid(),
  call_id text not null references public.group_calls(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  banned_by uuid references auth.users(id) on delete set null,
  reason text,
  banned_at timestamptz not null default now(),
  unique (call_id, user_id)
);

-- Audit log of moderation actions (optional but useful)
create table if not exists public.group_call_events (
  id uuid primary key default gen_random_uuid(),
  call_id text not null references public.group_calls(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  event_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
