-- Persist admin abuse-score IP allowlist/unblock overrides across restarts.
CREATE TABLE IF NOT EXISTS public.abuse_ip_overrides (
  ip text NOT NULL,
  is_allowed boolean NOT NULL DEFAULT false,
  reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by text,
  CONSTRAINT abuse_ip_overrides_pkey PRIMARY KEY (ip)
);

CREATE INDEX IF NOT EXISTS abuse_ip_overrides_allowed_idx ON public.abuse_ip_overrides(is_allowed);
CREATE INDEX IF NOT EXISTS abuse_ip_overrides_updated_idx ON public.abuse_ip_overrides(updated_at);
