
-- Problems Table
CREATE TABLE IF NOT EXISTS public.lcoding_problems (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    slug text NOT NULL UNIQUE, -- e.g., 'two-sum', 'positive-negative'
    title text NOT NULL,
    description text NOT NULL, -- Markdown supported
    difficulty text NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    tags text[] DEFAULT '{}',
    
    -- Execution Context
    boilerplate_code text NOT NULL, -- Starter code e.g. "def solve(n):"
    function_name text NOT NULL, -- e.g. "solve"
    
    -- Metadata
    companies text[] DEFAULT '{}', -- e.g. ['Amazon', 'Google']
    likes int DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    CONSTRAINT lcoding_problems_pkey PRIMARY KEY (id)
);

-- Test Cases Table
CREATE TABLE IF NOT EXISTS public.lcoding_test_cases (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    problem_id uuid NOT NULL,
    
    input_json jsonb NOT NULL, -- Arguments as a JSON list e.g. [5, "hello"]
    expected_output_json jsonb NOT NULL, -- Expected return value e.g. true
    
    is_hidden boolean DEFAULT false, -- Private test cases
    order_index int DEFAULT 0,
    
    created_at timestamp with time zone DEFAULT now(),
    
    CONSTRAINT lcoding_test_cases_pkey PRIMARY KEY (id),
    CONSTRAINT lcoding_test_cases_problem_id_fkey FOREIGN KEY (problem_id) REFERENCES public.lcoding_problems(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lcoding_test_cases_problem ON public.lcoding_test_cases(problem_id);
