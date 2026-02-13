
-- Run this in your Supabase SQL Editor to create the MCQ cache table

CREATE TABLE IF NOT EXISTS public.ai_notes_mcq (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  note_id uuid NOT NULL,
  topic text NOT NULL,
  topic_ci text DEFAULT lower(topic),
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  model text,
  generated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT ai_notes_mcq_pkey PRIMARY KEY (id)
);

-- Optional index for faster lookups
CREATE INDEX IF NOT EXISTS ai_notes_mcq_note_id_topic_idx ON public.ai_notes_mcq (note_id, topic_ci);
