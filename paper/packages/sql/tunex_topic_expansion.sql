-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table to store granular chapter content for Tunex topics
-- This replaces the monolithic 'content' column in lcoding_topics
CREATE TABLE IF NOT EXISTS public.lcoding_topic_chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id UUID NOT NULL REFERENCES public.lcoding_topics(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    chapter_type TEXT NOT NULL CHECK (
        chapter_type IN (
            'concept', 
            'syntax', 
            'range', 
            'sequences', 
            'nested', 
            'keywords', 
            'mistakes', 
            'walkthrough', 
            'interview', 
            'quiz'
        )
    ),
    title TEXT NOT NULL,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Ensure unique chapter numbers per topic
    UNIQUE(topic_id, chapter_number)
);

-- Index for fast lookup by topic
CREATE INDEX IF NOT EXISTS idx_lcoding_topic_chapters_topic_id ON public.lcoding_topic_chapters(topic_id);
