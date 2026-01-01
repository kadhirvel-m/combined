
-- Ensure Languages
CREATE TABLE IF NOT EXISTS public.lcoding_languages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  logo_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lcoding_languages_pkey PRIMARY KEY (id)
);

-- Ensure Levels
CREATE TABLE IF NOT EXISTS public.lcoding_levels (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  language_id uuid NOT NULL,
  title text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lcoding_levels_pkey PRIMARY KEY (id),
  CONSTRAINT lcoding_levels_language_id_fkey FOREIGN KEY (language_id) REFERENCES public.lcoding_languages(id)
);

-- Ensure Sections (linked to Level)
CREATE TABLE IF NOT EXISTS public.lcoding_sections (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  level_id uuid NOT NULL,
  title text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lcoding_sections_pkey PRIMARY KEY (id),
  CONSTRAINT lcoding_sections_level_id_fkey FOREIGN KEY (level_id) REFERENCES public.lcoding_levels(id)
);

-- Ensure Topics (linked to Section)
CREATE TABLE IF NOT EXISTS public.lcoding_topics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL,
  title text NOT NULL,
  content text,
  order_index integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lcoding_topics_pkey PRIMARY KEY (id),
  CONSTRAINT lcoding_topics_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.lcoding_sections(id)
);

-- New Chapters Table (if not already created)
CREATE TABLE IF NOT EXISTS public.lcoding_topic_chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID NOT NULL REFERENCES public.lcoding_topics(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    chapter_type TEXT NOT NULL,
    title TEXT NOT NULL,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(topic_id, chapter_number)
);
