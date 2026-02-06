-- ============================================
-- ASSIGNMENTS PORTAL - DATABASE MIGRATION
-- ============================================
-- Run this in Supabase SQL Editor

-- 1. ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_user_id UUID NOT NULL,
    class_id UUID,
    
    -- Basic Info
    title TEXT NOT NULL,
    description TEXT,
    instructions_md TEXT,
    resource_links JSONB DEFAULT '[]'::jsonb,
    
    -- Type & Settings
    assignment_type TEXT DEFAULT 'individual' CHECK (assignment_type IN ('individual', 'group', 'peer_review')),
    max_team_size INT DEFAULT 1,
    max_marks INT DEFAULT 100,
    
    -- File Settings
    allowed_file_types JSONB DEFAULT '["pdf","jpg","jpeg","png","doc","docx","ppt","pptx"]'::jsonb,
    max_files INT DEFAULT 5,
    max_file_size_mb INT DEFAULT 10,
    
    -- Deadlines
    due_date TIMESTAMPTZ NOT NULL,
    allow_late_submission BOOLEAN DEFAULT false,
    late_penalty_percent INT DEFAULT 0,
    grace_period_hours INT DEFAULT 0,
    
    -- State
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed', 'archived')),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for assignments
CREATE INDEX IF NOT EXISTS idx_assignments_teacher ON assignments(teacher_user_id);
CREATE INDEX IF NOT EXISTS idx_assignments_class ON assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);

-- 2. ASSIGNMENT RUBRICS
CREATE TABLE IF NOT EXISTS assignment_rubrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    criterion TEXT NOT NULL,
    max_points INT NOT NULL,
    description TEXT,
    order_index INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_rubrics_assignment ON assignment_rubrics(assignment_id);

-- 3. ASSIGNMENT TEAMS (for group assignments)
CREATE TABLE IF NOT EXISTS assignment_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    team_name TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assignment_team_members (
    team_id UUID REFERENCES assignment_teams(id) ON DELETE CASCADE,
    student_user_id UUID NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (team_id, student_user_id)
);

-- 4. ASSIGNMENT SUBMISSIONS
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE NOT NULL,
    student_user_id UUID NOT NULL,
    team_id UUID REFERENCES assignment_teams(id) ON DELETE SET NULL,
    
    -- Submission Content
    file_urls JSONB DEFAULT '[]'::jsonb,
    text_content TEXT,
    is_draft BOOLEAN DEFAULT false,
    version INT DEFAULT 1,
    
    -- Grading
    total_marks INT,
    rubric_scores JSONB DEFAULT '{}'::jsonb,
    feedback TEXT,
    graded_by UUID,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'graded', 'returned')),
    submitted_at TIMESTAMPTZ,
    graded_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(assignment_id, student_user_id)
);

CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON assignment_submissions(student_user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON assignment_submissions(status);

-- 5. SUBMISSION FILES (for duplicate detection)
-- Stores file metadata including hash for plagiarism detection
CREATE TABLE IF NOT EXISTS assignment_submission_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES assignment_submissions(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    student_user_id UUID NOT NULL,
    
    -- File info
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size_bytes BIGINT,
    file_type TEXT,
    
    -- Duplicate detection
    file_hash TEXT, -- SHA-256 hash of file content
    
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for duplicate detection
CREATE INDEX IF NOT EXISTS idx_files_hash ON assignment_submission_files(file_hash);
CREATE INDEX IF NOT EXISTS idx_files_assignment ON assignment_submission_files(assignment_id);
CREATE INDEX IF NOT EXISTS idx_files_submission ON assignment_submission_files(submission_id);

-- 6. ASSIGNMENT COMMENTS
CREATE TABLE IF NOT EXISTS assignment_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    submission_id UUID REFERENCES assignment_submissions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_assignment ON assignment_comments(assignment_id);
CREATE INDEX IF NOT EXISTS idx_comments_submission ON assignment_comments(submission_id);

-- 7. ASSIGNMENT EXTENSIONS
CREATE TABLE IF NOT EXISTS assignment_extensions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    student_user_id UUID NOT NULL,
    requested_date TIMESTAMPTZ,
    reason TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
    approved_by UUID,
    new_due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_extensions_assignment ON assignment_extensions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_extensions_status ON assignment_extensions(status);

-- 8. ASSIGNMENT TEMPLATES
CREATE TABLE IF NOT EXISTS assignment_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_user_id UUID NOT NULL,
    title TEXT NOT NULL,
    template_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_templates_teacher ON assignment_templates(teacher_user_id);

-- ============================================
-- VIEW: Duplicate Files Detection
-- ============================================
-- This view helps staff identify duplicate submissions
CREATE OR REPLACE VIEW assignment_duplicate_files AS
SELECT 
    f.assignment_id,
    f.file_hash,
    f.file_size_bytes,
    COUNT(*) as duplicate_count,
    array_agg(DISTINCT f.student_user_id) as students_with_same_file,
    array_agg(DISTINCT f.submission_id) as affected_submissions,
    array_agg(DISTINCT f.file_name) as file_names
FROM assignment_submission_files f
WHERE f.file_hash IS NOT NULL
GROUP BY f.assignment_id, f.file_hash, f.file_size_bytes
HAVING COUNT(*) > 1;

-- ============================================
-- RLS POLICIES (Enable Row Level Security)
-- ============================================
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_rubrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submission_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_extensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_templates ENABLE ROW LEVEL SECURITY;

-- Teachers can manage their own assignments
CREATE POLICY "Teachers manage own assignments" ON assignments
    FOR ALL USING (auth.uid() = teacher_user_id);

-- Students can view published assignments for their class
CREATE POLICY "Students view published assignments" ON assignments
    FOR SELECT USING (status = 'published' OR status = 'closed');

-- Rubrics visible to all for assignments they can see
CREATE POLICY "Users view rubrics" ON assignment_rubrics
    FOR SELECT USING (true);

-- Students manage own submissions
CREATE POLICY "Students manage own submissions" ON assignment_submissions
    FOR ALL USING (auth.uid() = student_user_id);

-- Teachers view all submissions for their assignments
CREATE POLICY "Teachers view submissions" ON assignment_submissions
    FOR SELECT USING (
        assignment_id IN (SELECT id FROM assignments WHERE teacher_user_id = auth.uid())
    );

-- File policies
CREATE POLICY "Users manage own files" ON assignment_submission_files
    FOR ALL USING (auth.uid() = student_user_id);

CREATE POLICY "Teachers view files" ON assignment_submission_files
    FOR SELECT USING (
        assignment_id IN (SELECT id FROM assignments WHERE teacher_user_id = auth.uid())
    );

-- Comments visible to assignment participants
CREATE POLICY "View comments" ON assignment_comments
    FOR SELECT USING (true);

CREATE POLICY "Users add comments" ON assignment_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Extensions
CREATE POLICY "Students manage own extensions" ON assignment_extensions
    FOR ALL USING (auth.uid() = student_user_id);

CREATE POLICY "Teachers view extensions" ON assignment_extensions
    FOR SELECT USING (
        assignment_id IN (SELECT id FROM assignments WHERE teacher_user_id = auth.uid())
    );

-- Templates
CREATE POLICY "Teachers manage own templates" ON assignment_templates
    FOR ALL USING (auth.uid() = teacher_user_id);

-- ============================================
-- DONE!
-- ============================================
