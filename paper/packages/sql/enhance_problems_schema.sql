-- Migration: Add enhanced problem fields to lcoding_problems
-- Run this in your Supabase SQL Editor

-- Add new columns for LeetCode-style problem structure
ALTER TABLE public.lcoding_problems 
ADD COLUMN IF NOT EXISTS examples jsonb DEFAULT '[]';

ALTER TABLE public.lcoding_problems 
ADD COLUMN IF NOT EXISTS constraints text[] DEFAULT '{}';

ALTER TABLE public.lcoding_problems 
ADD COLUMN IF NOT EXISTS hints text[] DEFAULT '{}';

ALTER TABLE public.lcoding_problems 
ADD COLUMN IF NOT EXISTS follow_up text DEFAULT NULL;

ALTER TABLE public.lcoding_problems 
ADD COLUMN IF NOT EXISTS topics text[] DEFAULT '{}';

-- Comment for clarity
COMMENT ON COLUMN public.lcoding_problems.examples IS 'Array of {input, output, explanation} objects';
COMMENT ON COLUMN public.lcoding_problems.constraints IS 'Array of constraint strings like "2 <= nums.length <= 104"';
COMMENT ON COLUMN public.lcoding_problems.hints IS 'Array of progressive hint strings';
COMMENT ON COLUMN public.lcoding_problems.follow_up IS 'Optional follow-up optimization question';
COMMENT ON COLUMN public.lcoding_problems.topics IS 'Related topics like Array, Hash Table, Math';
