-- Admin Control Panel schema: Plans Manager, Usage Limits Engine, Manual Access Override
-- Safe for repeated execution.

CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  price_inr numeric NOT NULL DEFAULT 0,
  duration_days integer NOT NULL DEFAULT 30,
  active_status boolean NOT NULL DEFAULT true,

  unlimited_topics boolean NOT NULL DEFAULT false,
  max_topics_per_day integer,
  max_subjects_per_day integer,
  mcq_access boolean NOT NULL DEFAULT true,
  blink_access boolean NOT NULL DEFAULT true,
  ai_chat_access boolean NOT NULL DEFAULT true,
  pdf_download boolean NOT NULL DEFAULT true,
  print_discount_percent numeric NOT NULL DEFAULT 0,
  leaderboard_access boolean NOT NULL DEFAULT true,

  applicable_college uuid REFERENCES public.colleges(id),
  applicable_degree uuid REFERENCES public.degrees(id),
  applicable_department uuid REFERENCES public.departments(id),
  applicable_batch uuid REFERENCES public.batches(id),
  applicable_semester integer,

  early_bird_tag boolean NOT NULL DEFAULT false,
  availability_expires_at timestamp with time zone,
  coupon_enabled boolean NOT NULL DEFAULT false,

  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON public.subscription_plans(active_status);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_scope ON public.subscription_plans(applicable_college, applicable_department, applicable_batch, applicable_semester);

CREATE TABLE IF NOT EXISTS public.user_plan_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid NOT NULL REFERENCES auth.users(id),
  plan_id uuid NOT NULL REFERENCES public.subscription_plans(id),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  start_at timestamp with time zone NOT NULL DEFAULT now(),
  end_at timestamp with time zone NOT NULL,
  source text NOT NULL DEFAULT 'manual',
  notes text,
  granted_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_plan_subscriptions_user_status ON public.user_plan_subscriptions(auth_user_id, status, end_at DESC);

CREATE TABLE IF NOT EXISTS public.usage_limit_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name text NOT NULL,
  scope_type text NOT NULL DEFAULT 'global' CHECK (scope_type IN ('global', 'college', 'degree', 'department', 'batch', 'semester')),
  scope_college_id uuid REFERENCES public.colleges(id),
  scope_degree_id uuid REFERENCES public.degrees(id),
  scope_department_id uuid REFERENCES public.departments(id),
  scope_batch_id uuid REFERENCES public.batches(id),
  scope_semester integer,

  max_topics_per_day integer,
  max_subjects_per_day integer,
  max_mcq_attempts_per_day integer,
  max_blink_views_per_day integer,
  max_searches_per_day integer,
  max_ai_prompts_per_day integer,
  max_session_minutes_per_day integer,
  trial_duration_days integer,

  apply_to_free_users boolean NOT NULL DEFAULT true,
  active_status boolean NOT NULL DEFAULT true,

  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_usage_limit_rules_scope ON public.usage_limit_rules(scope_type, scope_college_id, scope_degree_id, scope_department_id, scope_batch_id, scope_semester);
CREATE INDEX IF NOT EXISTS idx_usage_limit_rules_active ON public.usage_limit_rules(active_status, apply_to_free_users);

CREATE TABLE IF NOT EXISTS public.usage_daily_counters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid NOT NULL REFERENCES auth.users(id),
  usage_date date NOT NULL DEFAULT CURRENT_DATE,

  topics_opened integer NOT NULL DEFAULT 0,
  subjects_opened integer NOT NULL DEFAULT 0,
  mcq_attempts integer NOT NULL DEFAULT 0,
  blink_views integer NOT NULL DEFAULT 0,
  searches integer NOT NULL DEFAULT 0,
  ai_prompts integer NOT NULL DEFAULT 0,
  session_seconds integer NOT NULL DEFAULT 0,

  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT usage_daily_counters_user_date_unique UNIQUE (auth_user_id, usage_date)
);

CREATE INDEX IF NOT EXISTS idx_usage_daily_counters_date ON public.usage_daily_counters(usage_date);

CREATE TABLE IF NOT EXISTS public.manual_access_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id),

  grant_premium boolean NOT NULL DEFAULT false,
  force_plan_id uuid REFERENCES public.subscription_plans(id),
  force_plan_until timestamp with time zone,

  reset_usage_on_next_check boolean NOT NULL DEFAULT false,
  is_blocked boolean NOT NULL DEFAULT false,
  refund_marked boolean NOT NULL DEFAULT false,
  campus_ambassador boolean NOT NULL DEFAULT false,
  department_id_override uuid REFERENCES public.departments(id),

  notes text,
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_manual_access_overrides_blocked ON public.manual_access_overrides(is_blocked);

-- Seed a baseline free-tier global rule if missing.
INSERT INTO public.usage_limit_rules (
  rule_name,
  scope_type,
  max_topics_per_day,
  max_subjects_per_day,
  max_mcq_attempts_per_day,
  max_blink_views_per_day,
  max_searches_per_day,
  max_ai_prompts_per_day,
  trial_duration_days,
  apply_to_free_users,
  active_status
)
SELECT
  'Default Free Tier',
  'global',
  2,
  2,
  10,
  5,
  20,
  10,
  30,
  true,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.usage_limit_rules WHERE scope_type = 'global' AND active_status = true
);
