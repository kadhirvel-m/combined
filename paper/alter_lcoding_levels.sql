-- Create Levels Table
CREATE TABLE public.lcoding_levels (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  language_id uuid NOT NULL,
  title text NOT NULL, -- e.g., 'Beginner', 'Intermediate'
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lcoding_levels_pkey PRIMARY KEY (id),
  CONSTRAINT lcoding_levels_language_id_fkey FOREIGN KEY (language_id) REFERENCES public.lcoding_languages(id) ON DELETE CASCADE
);

-- Add level_id to Sections and remove language_id
ALTER TABLE public.lcoding_sections 
  ADD COLUMN level_id uuid;

-- (Optionally) If preserving data:
-- You would need to create a default level for each language and assign existing sections to it.
-- For now, assuming we can truncate or just adding column. 
-- Let's NOT enforce NOT NULL yet until data is migrated manually if needed, or if fresh start:
-- TRUNCATE TABLE public.lcoding_sections CASCADE; 

-- Add constraint after data handling
ALTER TABLE public.lcoding_sections
  ADD CONSTRAINT lcoding_sections_level_id_fkey FOREIGN KEY (level_id) REFERENCES public.lcoding_levels(id) ON DELETE CASCADE;

-- Drop language_id from sections (WARNING: Data loss if not migrated)
ALTER TABLE public.lcoding_sections
  DROP COLUMN language_id;

-- Index
CREATE INDEX idx_lcoding_levels_language_id ON public.lcoding_levels(language_id);
CREATE INDEX idx_lcoding_sections_level_id ON public.lcoding_sections(level_id);
