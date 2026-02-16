-- Medix Agentic RAG schema for Supabase Postgres + pgvector
-- Run this in Supabase SQL editor before using /api/medix/rag/* endpoints.

create extension if not exists vector;
create extension if not exists pgcrypto;

create table if not exists public.medix_rag_sources (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  file_name text,
  file_hash text unique,
  uploaded_by text,
  chunk_count integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.medix_rag_chunks (
  id bigserial primary key,
  source_id uuid not null references public.medix_rag_sources(id) on delete cascade,
  chunk_index integer not null,
  section_title text,
  section_index integer,
  window_start_char integer,
  window_end_char integer,
  chunk_text text not null,
  token_count integer,
  metadata jsonb not null default '{}'::jsonb,
  embedding vector(768) not null,
  created_at timestamptz not null default now(),
  unique(source_id, chunk_index)
);

alter table public.medix_rag_chunks add column if not exists section_title text;
alter table public.medix_rag_chunks add column if not exists section_index integer;
alter table public.medix_rag_chunks add column if not exists window_start_char integer;
alter table public.medix_rag_chunks add column if not exists window_end_char integer;

create index if not exists medix_rag_chunks_source_idx
  on public.medix_rag_chunks (source_id);

create index if not exists medix_rag_chunks_section_idx
  on public.medix_rag_chunks (source_id, section_index, chunk_index);

create index if not exists medix_rag_chunks_embedding_ivfflat_idx
  on public.medix_rag_chunks
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 120);

create table if not exists public.medix_rag_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  title text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.medix_rag_messages (
  id bigserial primary key,
  session_id uuid not null references public.medix_rag_sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  citations jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists medix_rag_messages_session_idx
  on public.medix_rag_messages (session_id, created_at);

create or replace function public.medix_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_medix_rag_sources_updated_at on public.medix_rag_sources;
create trigger trg_medix_rag_sources_updated_at
before update on public.medix_rag_sources
for each row execute function public.medix_set_updated_at();

drop trigger if exists trg_medix_rag_sessions_updated_at on public.medix_rag_sessions;
create trigger trg_medix_rag_sessions_updated_at
before update on public.medix_rag_sessions
for each row execute function public.medix_set_updated_at();

create or replace function public.medix_insert_chunk(
  p_source_id uuid,
  p_chunk_index integer,
  p_chunk_text text,
  p_token_count integer,
  p_metadata jsonb,
  p_embedding float8[],
  p_section_title text default null,
  p_section_index integer default null,
  p_window_start_char integer default null,
  p_window_end_char integer default null
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id bigint;
begin
  insert into public.medix_rag_chunks (
    source_id,
    chunk_index,
    section_title,
    section_index,
    window_start_char,
    window_end_char,
    chunk_text,
    token_count,
    metadata,
    embedding
  ) values (
    p_source_id,
    p_chunk_index,
    p_section_title,
    p_section_index,
    p_window_start_char,
    p_window_end_char,
    p_chunk_text,
    p_token_count,
    coalesce(p_metadata, '{}'::jsonb),
    p_embedding::vector(768)
  )
  on conflict (source_id, chunk_index) do update
    set section_title = excluded.section_title,
        section_index = excluded.section_index,
        window_start_char = excluded.window_start_char,
        window_end_char = excluded.window_end_char,
        chunk_text = excluded.chunk_text,
        token_count = excluded.token_count,
        metadata = excluded.metadata,
        embedding = excluded.embedding
  returning id into v_id;

  return v_id;
end;
$$;

create or replace function public.medix_match_chunks(
  query_embedding vector(768),
  match_count integer default 12,
  source_ids uuid[] default null,
  min_score float default 0.55
)
returns table (
  chunk_id bigint,
  source_id uuid,
  source_name text,
  section_title text,
  chunk_index integer,
  chunk_text text,
  similarity float
)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.id as chunk_id,
    c.source_id,
    s.source_name,
    c.section_title,
    c.chunk_index,
    c.chunk_text,
    (1 - (c.embedding <=> query_embedding))::float as similarity
  from public.medix_rag_chunks c
  join public.medix_rag_sources s on s.id = c.source_id
  where
    (source_ids is null or c.source_id = any(source_ids))
    and (1 - (c.embedding <=> query_embedding)) >= min_score
  order by c.embedding <=> query_embedding
  limit greatest(1, least(match_count, 100));
$$;

-- Optional: restrictive grants can be adjusted per your auth/RLS setup.
-- grant execute on function public.medix_insert_chunk(uuid, integer, text, integer, jsonb, float8[], text, integer, integer, integer) to service_role;
-- grant execute on function public.medix_match_chunks(vector, integer, uuid[], float) to authenticated, service_role;
