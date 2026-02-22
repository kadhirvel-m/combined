-- Stores generated image URLs from selected text in img_gen page
create table if not exists public.ai_selected_images (
  id uuid primary key default gen_random_uuid(),
  topic text not null,
  topic_ci text not null,
  image_url text not null check (image_url ~* '^https?://'),
  selected_text text,
  created_at timestamptz not null default now()
);

create index if not exists idx_ai_selected_images_topic_ci
  on public.ai_selected_images (topic_ci, created_at desc);
