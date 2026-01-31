-- =============================================
-- LabX Explanations Table Migration
-- Run this in your Supabase SQL Editor
-- =============================================

-- Create the labx_explanations table for caching generated explanations
CREATE TABLE IF NOT EXISTS public.labx_explanations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  topic_ci text NOT NULL,  -- lowercase for case-insensitive lookup
  html_content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  generation_time_ms integer,  -- how long Gemini took to generate (in ms)
  view_count integer DEFAULT 0,
  CONSTRAINT labx_explanations_pkey PRIMARY KEY (id),
  CONSTRAINT labx_explanations_topic_ci_unique UNIQUE (topic_ci)
);

-- Index for fast case-insensitive topic lookup
CREATE INDEX IF NOT EXISTS idx_labx_explanations_topic_ci 
ON public.labx_explanations(topic_ci);

-- Grant permissions (adjust as needed for your RLS policies)
ALTER TABLE public.labx_explanations ENABLE ROW LEVEL SECURITY;

-- Allow public read access (no auth required to view explanations)
CREATE POLICY "Allow public read access" ON public.labx_explanations
  FOR SELECT USING (true);

-- Allow service role full access (for backend operations)
CREATE POLICY "Allow service role full access" ON public.labx_explanations
  FOR ALL USING (true) WITH CHECK (true);

-- Success message
SELECT 'labx_explanations table created successfully!' as status;
