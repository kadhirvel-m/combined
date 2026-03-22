-- Add exact syllabus topic mapping field for test questions.
-- Safe to run multiple times.

ALTER TABLE public.test_questions
ADD COLUMN IF NOT EXISTS topic_name text;

COMMENT ON COLUMN public.test_questions.topic_name IS
'Exact syllabus topic name mapped to this question during AI generation.';
