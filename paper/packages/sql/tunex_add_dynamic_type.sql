
BEGIN;

ALTER TABLE public.lcoding_topic_chapters
DROP CONSTRAINT IF EXISTS lcoding_topic_chapters_chapter_type_check;

ALTER TABLE public.lcoding_topic_chapters
ADD CONSTRAINT lcoding_topic_chapters_chapter_type_check 
CHECK (chapter_type IN (
    'concept', 
    'syntax', 
    'range', 
    'sequences', 
    'nested', 
    'keywords', 
    'mistakes', 
    'walkthrough', 
    'interview', 
    'quiz',
    'dynamic' -- Added new type
));

COMMIT;
