-- GARLIC V3: Autonomous Exam Intelligence — Database Migration
-- Run this in Supabase SQL Editor

-- 1. Exam Mode Profiles
CREATE TABLE IF NOT EXISTS public.garlic_exam_profiles (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL,
    exam_mode_active boolean NOT NULL DEFAULT true,
    intensity_level text NOT NULL DEFAULT 'exam' CHECK (intensity_level IN ('normal','exam','critical')),
    exam_date date,
    time_remaining_days integer,
    diagnostic_completed boolean NOT NULL DEFAULT false,
    diagnostic_session_id uuid,
    diagnostic_results jsonb DEFAULT '{}'::jsonb,
    predicted_marks float,
    readiness_score float,
    readiness_level text,
    completion_probability float,
    risk_level text DEFAULT 'low' CHECK (risk_level IN ('low','moderate','high','critical')),
    learning_velocity jsonb DEFAULT '{}'::jsonb,
    plan_id uuid,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT garlic_exam_profiles_pkey PRIMARY KEY (id),
    CONSTRAINT garlic_exam_profiles_student_fkey FOREIGN KEY (student_id) REFERENCES auth.users(id)
);
CREATE INDEX IF NOT EXISTS idx_garlic_exam_profiles_student ON public.garlic_exam_profiles(student_id);

-- 2. Diagnostic Sessions
CREATE TABLE IF NOT EXISTS public.garlic_diagnostic_sessions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL,
    exam_profile_id uuid,
    session_type text NOT NULL DEFAULT 'full' CHECK (session_type IN ('full','micro')),
    status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress','completed','abandoned')),
    questions_asked integer NOT NULL DEFAULT 0,
    questions_answered integer NOT NULL DEFAULT 0,
    max_questions integer NOT NULL DEFAULT 7,
    overall_score float,
    strong_topics jsonb DEFAULT '[]'::jsonb,
    weak_topics jsonb DEFAULT '[]'::jsonb,
    focus_areas jsonb DEFAULT '[]'::jsonb,
    ai_evaluation jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz,
    CONSTRAINT garlic_diagnostic_sessions_pkey PRIMARY KEY (id),
    CONSTRAINT garlic_diagnostic_sessions_student_fkey FOREIGN KEY (student_id) REFERENCES auth.users(id)
);

-- 3. Diagnostic Questions
CREATE TABLE IF NOT EXISTS public.garlic_diagnostic_questions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    session_id uuid NOT NULL,
    student_id uuid NOT NULL,
    question_index integer NOT NULL DEFAULT 0,
    topic_id text,
    subject_name text,
    unit_name text,
    topic_name text,
    question_text text NOT NULL,
    question_type text NOT NULL DEFAULT 'conceptual' CHECK (question_type IN ('conceptual','problem_solving','memory_recall')),
    difficulty integer NOT NULL DEFAULT 3 CHECK (difficulty >= 1 AND difficulty <= 5),
    options jsonb DEFAULT '[]'::jsonb,
    correct_answer text,
    student_answer text,
    is_correct boolean,
    ai_score float,
    ai_evaluation jsonb DEFAULT '{}'::jsonb,
    answered_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT garlic_diagnostic_questions_pkey PRIMARY KEY (id),
    CONSTRAINT garlic_diagnostic_questions_session_fkey FOREIGN KEY (session_id) REFERENCES public.garlic_diagnostic_sessions(id)
);

-- 4. Adaptive Replan Log
CREATE TABLE IF NOT EXISTS public.garlic_adaptive_replan_log (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL,
    plan_id text,
    trigger_reason text NOT NULL,
    trigger_data jsonb DEFAULT '{}'::jsonb,
    topics_reranked integer DEFAULT 0,
    priority_changes jsonb DEFAULT '[]'::jsonb,
    was_hard_reset boolean NOT NULL DEFAULT false,
    ai_reasoning text,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT garlic_adaptive_replan_log_pkey PRIMARY KEY (id)
);

-- 5. Exam Intelligence Insights
CREATE TABLE IF NOT EXISTS public.garlic_exam_insights (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL,
    plan_id text,
    insight_type text NOT NULL DEFAULT 'general' CHECK (insight_type IN ('general','risk','opportunity','urgency','deviation','prediction')),
    severity text DEFAULT 'info' CHECK (severity IN ('info','warning','critical')),
    insight_text text NOT NULL,
    marks_impact float,
    actionable boolean NOT NULL DEFAULT true,
    acknowledged boolean NOT NULL DEFAULT false,
    expires_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT garlic_exam_insights_pkey PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS idx_garlic_exam_insights_student ON public.garlic_exam_insights(student_id);

-- 6. Outcome Predictions (time-series)
CREATE TABLE IF NOT EXISTS public.garlic_outcome_predictions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL,
    plan_id text,
    predicted_marks float NOT NULL,
    confidence_band text DEFAULT 'medium' CHECK (confidence_band IN ('low','medium','high')),
    completion_probability float,
    readiness_score float,
    readiness_level text,
    risk_level text DEFAULT 'low',
    required_daily_target integer,
    projected_completion_date date,
    learning_velocity_topics_per_day float,
    improvement_potential float,
    gap_analysis jsonb DEFAULT '{}'::jsonb,
    strong_areas jsonb DEFAULT '[]'::jsonb,
    weak_areas jsonb DEFAULT '[]'::jsonb,
    ai_reasoning text,
    trigger_event text DEFAULT 'manual',
    signals jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT garlic_outcome_predictions_pkey PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS idx_garlic_outcome_predictions_student ON public.garlic_outcome_predictions(student_id, created_at DESC);

-- 7. Add exam-mode columns to existing plan items table (safe ALTER)
DO $$ BEGIN
    ALTER TABLE public.garlic_study_plan_items ADD COLUMN IF NOT EXISTS study_depth text DEFAULT 'full_study';
    ALTER TABLE public.garlic_study_plan_items ADD COLUMN IF NOT EXISTS exam_impact_score float DEFAULT 0;
    ALTER TABLE public.garlic_study_plan_items ADD COLUMN IF NOT EXISTS last_revised_at timestamptz;
    ALTER TABLE public.garlic_study_plan_items ADD COLUMN IF NOT EXISTS revision_count integer DEFAULT 0;
    ALTER TABLE public.garlic_study_plan_items ADD COLUMN IF NOT EXISTS confidence_decay_applied_at timestamptz;
    ALTER TABLE public.garlic_study_plan_items ADD COLUMN IF NOT EXISTS deviation_count integer DEFAULT 0;
    ALTER TABLE public.garlic_study_plan_items ADD COLUMN IF NOT EXISTS learning_state text DEFAULT 'unknown';
EXCEPTION WHEN others THEN NULL;
END $$;

-- 8. Add exam mode columns to existing plans table
DO $$ BEGIN
    ALTER TABLE public.garlic_study_plans ADD COLUMN IF NOT EXISTS exam_mode boolean DEFAULT false;
    ALTER TABLE public.garlic_study_plans ADD COLUMN IF NOT EXISTS exam_profile_id uuid;
    ALTER TABLE public.garlic_study_plans ADD COLUMN IF NOT EXISTS intensity_level text DEFAULT 'normal';
    ALTER TABLE public.garlic_study_plans ADD COLUMN IF NOT EXISTS daily_target integer DEFAULT 3;
    ALTER TABLE public.garlic_study_plans ADD COLUMN IF NOT EXISTS replan_count integer DEFAULT 0;
EXCEPTION WHEN others THEN NULL;
END $$;
